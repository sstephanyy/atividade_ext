import os
from dataclasses import dataclass, asdict
from typing import Optional

from flask import Flask, jsonify, request, send_from_directory
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

MODEL = os.environ.get("GEMINI_MODEL", "gemini-3.8-flash")  # padrão: Gemini 3.8 Flash; pode trocar no .env

SYSTEM = (
    "Você é um assistente de educação financeira para estudantes do Ensino Médio no Brasil. "
    "Explique de forma simples, com exemplos do dia a dia em reais (mesada, estágio, primeiro salário). "
    "Use no máximo 150 palavras. Não recomende investimentos específicos nem produtos financeiros. "
    "Se a pergunta fugir de finanças pessoais, redirecione com gentileza."
)


@dataclass
class ContextoModulo:
    """DTO com o módulo que o estudante está vendo no momento."""

    modulo_id: str = ""
    titulo: str = ""
    conteudo: str = ""
    atividade: str = ""

    @classmethod
    def from_dict(cls, data) -> "ContextoModulo":
        if not isinstance(data, dict):
            return cls()
        return cls(
            modulo_id=str(data.get("moduleId") or "")[:200],
            titulo=str(data.get("title") or "")[:200],
            conteudo=str(data.get("content") or "")[:4000],
            atividade=str(data.get("activity") or "")[:600],
        )


@dataclass
class MensagemChat:
    papel: str
    texto: str


@dataclass
class RespostaChat:
    reply: Optional[str] = None
    error: Optional[str] = None


class ClienteGemini:
    """Adaptador do SDK google-genai usado pelo assistente."""

    def __init__(self, api_key: Optional[str] = None, modelo: Optional[str] = None):
        self.api_key = api_key or os.environ["GEMINI_API_KEY"]
        self.modelo = modelo or MODEL
        self._client = genai.Client(api_key=self.api_key)

    def gerar_conteudo(self, contents, system_instruction: str) -> str:
        resp = self._client.models.generate_content(
            model=self.modelo,
            contents=contents,
            config=types.GenerateContentConfig(system_instruction=system_instruction),
        )
        return resp.text or ""


class AssistenteFinanceiro:
    """Monta o prompt educativo e conversa com o Gemini."""

    def __init__(self, client: ClienteGemini, instrucao_sistema: str = SYSTEM):
        self.client = client
        self.instrucao_sistema = instrucao_sistema

    def montar_prompt(self, contexto: ContextoModulo) -> str:
        base = self.instrucao_sistema
        if not isinstance(contexto, ContextoModulo):
            return base
        if not (contexto.titulo or contexto.conteudo):
            return base

        base += (
            "\n\nO estudante está estudando o módulo \"" + contexto.titulo + "\". "
            "Responda dúvidas relacionadas ao conteúdo abaixo, use linguagem simples e exemplos "
            "cotidianos. Quando houver cálculo, mostre o passo a passo com valores pequenos. "
            "Você pode criar exemplos extras, mas não recomende investimentos nem produtos. "
            "Se a pergunta não tiver relação com o módulo, responda de forma breve e traga a "
            "conversa de volta ao tema."
        )
        if contexto.conteudo:
            base += "\n\n--- CONTEÚDO DO MÓDULO ---\n" + contexto.conteudo
        if contexto.atividade:
            base += "\n\n--- ATIVIDADE EM ANDAMENTO ---\n" + contexto.atividade
        return base

    def responder(self, mensagem: str, historico: list[MensagemChat], contexto: ContextoModulo) -> str:
        contents = [
            types.Content(role=m.papel, parts=[types.Part(text=m.texto)])
            for m in historico
        ]
        contents.append(types.Content(role="user", parts=[types.Part(text=mensagem)]))

        return self.client.gerar_conteudo(contents, self.montar_prompt(contexto))


class ControladorChat:
    """Valida a requisição, monta o histórico e devolve uma RespostaChat."""

    def __init__(self, assistente: AssistenteFinanceiro, logger=None):
        self.assistente = assistente
        self.logger = logger

    def _validar_mensagem(self, texto) -> bool:
        return bool((texto or "").strip())

    def _montar_historico(self, data: dict) -> list[MensagemChat]:
        historico = []
        for item in (data.get("history") or [])[-10:]:
            if not isinstance(item, dict):
                continue
            if item.get("role") not in ("user", "model") or not item.get("text"):
                continue
            historico.append(MensagemChat(papel=item["role"], texto=str(item["text"])[:4000]))
        return historico

    def chat(self, data: dict) -> tuple[RespostaChat, int]:
        data = data if isinstance(data, dict) else {}
        mensagem = (data.get("message") or "").strip()[:1000]
        if not self._validar_mensagem(mensagem):
            return RespostaChat(error="Mensagem vazia"), 400

        contexto = ContextoModulo.from_dict(data.get("context"))
        historico = self._montar_historico(data)
        try:
            reply = self.assistente.responder(mensagem, historico, contexto)
            return RespostaChat(reply=reply), 200
        except Exception as e:  # noqa: BLE001 — o cliente recebe uma mensagem genérica
            if self.logger is not None:
                self.logger.exception(e)
            return RespostaChat(error="Falha ao consultar o assistente"), 502


class AplicacaoFlask:
    """Cria o app Flask, registra as rotas e injeta o controlador do chat."""

    def __init__(self, client: Optional[ClienteGemini] = None, modelo: Optional[str] = None):
        self.app = Flask(__name__, static_folder="static", static_url_path="/static")
        self.pasta_assets = os.path.join(self.app.root_path, "assets")
        cliente = client or ClienteGemini(modelo=modelo)
        self.assistente = AssistenteFinanceiro(cliente)
        self.controlador = ControladorChat(self.assistente, self.app.logger)
        self._registrar_rotas()

    def _registrar_rotas(self) -> None:
        @self.app.get("/")
        def index():
            return send_from_directory("static", "index.html")

        @self.app.get("/assets/<path:filename>")
        def assets(filename):
            """Serve as ilustrações extraídas, mantidas fora da pasta static."""
            return send_from_directory(self.pasta_assets, filename, max_age=86400)

        @self.app.post("/api/chat")
        def chat():
            data = request.get_json(silent=True) or {}
            resposta, status = self.controlador.chat(data)
            corpo = {chave: valor for chave, valor in asdict(resposta).items() if valor is not None}
            return jsonify(corpo), status

    def iniciar_servidor(self) -> None:
        self.app.run(debug=True, port=5000)


aplicacao = AplicacaoFlask()
app = aplicacao.app

if __name__ == "__main__":
    aplicacao.iniciar_servidor()
