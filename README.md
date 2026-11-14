# GranaLab

**Plataforma web de educação financeira para estudantes do Ensino Médio.**

O GranaLab é uma aplicação educativa que reúne dez módulos de educação financeira, quizzes,
atividades interativas e um assistente virtual com Inteligência Artificial. A proposta é
traduzir conceitos de finanças pessoais — orçamento, planejamento, consumo consciente, juros,
crédito e reserva financeira — para uma linguagem simples e próxima da realidade de quem está
no Ensino Médio, usando exemplos em reais do cotidiano (mesada, estágio, primeiro salário).

## Objetivos

1. Desenvolver módulos educativos sobre educação financeira, abordando conceitos como
   planejamento financeiro, orçamento, consumo consciente e organização das finanças pessoais,
   utilizando uma linguagem simples e adequada aos estudantes do Ensino Médio.

2. Desenvolver uma aplicação web educativa utilizando Python, JavaScript, HTML e CSS, para
   disponibilizar conteúdos, quizzes e atividades interativas voltadas à educação financeira.

3. Integrar a API Google Gemini à aplicação web, utilizando Python e o SDK Google Gen AI, para
   oferecer aos estudantes explicações simplificadas, exemplos práticos e respostas às dúvidas
   relacionadas aos conteúdos de educação financeira.

4. Criar atividades interativas e quizzes educativos para estimular a participação dos
   estudantes e reforçar os conhecimentos apresentados nos módulos de educação financeira.

5. Promover a conscientização dos estudantes sobre a importância da educação financeira,
   incentivando hábitos responsáveis de planejamento, organização e tomada de decisões
   financeiras.

## Público-alvo

Estudantes do Ensino Médio de escolas públicas, além de professores que queiram usar o material
como apoio em aulas, projetos de extensão ou atividades extracurriculares. Não é necessário
conhecimento prévio de finanças — cada módulo parte do zero e evolui com exemplos práticos.

## Funcionalidades

- **10 módulos educativos** com introdução, objetivos de aprendizagem, conteúdo com exemplos,
  situação-problema, atividade interativa, resumo e acesso ao assistente.
- **Quizzes de 5 perguntas por módulo**, com pontuação, feedback imediato e possibilidade de
  refazer para melhorar o resultado.
- **Atividades interativas** (simulações de orçamento, decisões de consumo e cenários do dia a dia).
- **Assistente financeiro com IA** (Google Gemini) que responde dúvidas considerando o módulo
  que o estudante está cursando.
- **Dashboard de progresso** com módulos concluídos, pontos, taxa de acerto, desempenho por área
  e conquistas desbloqueadas.
- **Conta local** por nome e senha, com progresso salvo no próprio navegador.
- **Interface responsiva** em estilo *pixel-art*, adaptada a desktop, tablet e celular.

## Tecnologias

| Camada | Tecnologias |
| --- | --- |
| Backend | Python, Flask, python-dotenv, Google Gen AI SDK |
| Frontend | HTML5, CSS3 (Grid/Flexbox, variáveis CSS), JavaScript puro (ES6+) |
| IA | API Google Gemini (`gemini-3.8-flash` por padrão) |
| Ilustrações | Pixel-art (PNGs transparentes) |
| Persistência | `localStorage` do navegador (contas e progresso) |

## Como executar

Pré-requisitos: Python 3.10+ e uma chave da API do Google Gemini
([Google AI Studio](https://aistudio.google.com/)).

```bash
# 1. Ambiente virtual
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate

# 2. Dependências
pip install -r requirements.txt

# 3. Variáveis de ambiente
cp .env.example .env
# edite o .env e informe GEMINI_API_KEY
# opcional: ajuste GEMINI_MODEL para outro modelo

# 4. Executar
python app.py
```

Acesse **http://localhost:5000**. Ao abrir, crie uma conta com nome e senha (armazenada apenas no
navegador). O nome informado aparece na saudação do dashboard e no assistente.

> Sem chave configurada ou com o servidor fora do ar, o chat cai automaticamente em respostas de
> demonstração — o restante da plataforma continua funcionando normalmente.

## Estrutura do projeto

```
GranaLab/
├── app.py                  # Flask: rotas, integração com Gemini e DTOs do contexto
├── requirements.txt        # Dependências Python
├── .env.example            # Modelo das variáveis de ambiente
├── static/
│   ├── index.html          # Aplicação (SPA em HTML/CSS/JS)
│   ├── style.css           # Estilos, tema pixel-art e responsividade
│   ├── courses.js          # Conteúdo dos 10 módulos
│   ├── domain.js           # Classes de domínio: módulos, conteúdo e atividades
│   ├── app.js              # Contas, progresso, quizzes, dashboard e assistente
│   └── pixel.js            # Caminhos das ilustrações e helpers de imagem
├── assets/
│   ├── images/pixel-art/   # Ilustrações PNG transparentes + manifest.json
│   ├── source/             # Folha original de assets
│   └── preview-*.png       # Prévia dos assets e do dashboard
├── scripts/
│   └── extract_pixel_assets.py  # Recorta as ilustrações da folha original (Pillow + NumPy)
└── docs/                   # Requisitos, diagramas UML e documentação (não versionada)
```

## Módulos educativos

| # | Módulo | Duração |
| --- | --- | --- |
| 1 | Primeiros passos na educação financeira | 10 min |
| 2 | Planejamento financeiro e definição de metas | 12 min |
| 3 | Organizando o orçamento pessoal | 12 min |
| 4 | Economizando dinheiro no dia a dia | 10 min |
| 5 | Entendendo juros e parcelamentos | 14 min |
| 6 | Cartão de crédito e formas de pagamento | 14 min |
| 7 | Reserva financeira e imprevistos | 12 min |
| 8 | Renda, trabalho e empreendedorismo | 14 min |
| 9 | Inflação e poder de compra | 12 min |
| 10 | Desafio final: colocando a educação financeira em prática | 18 min |

O conteúdo fica em `static/courses.js`, é convertido em instâncias de `Modulo` (classe em
`static/domain.js`) e renderizado por `static/app.js`. O progresso — módulos concluídos, pontos
e melhor resultado em cada quiz — é salvo por conta no `localStorage` do navegador.

## Assistente financeiro (Google Gemini)

O front-end chama `POST /api/chat` com `{message, history, context}` e espera `{reply}`. O
`context` leva o módulo atual (título, conteúdo e atividade), para que o assistente responda
sobre a aula que o estudante está vendo.

O backend (`app.py`) usa o SDK `google-genai`, carrega a chave via `python-dotenv` e envia um
*system prompt* que orienta o modelo a:

- explicar de forma simples, com exemplos do dia a dia em reais;
- limitar a resposta a cerca de 150 palavras;
- **não** recomendar investimentos ou produtos financeiros específicos;
- redirecionar com gentileza perguntas fora do tema de finanças pessoais.

## Dashboard

A home segue a referência visual do projeto: sidebar verde-escura, hero com a estudante em
pixel-art, cartões translúcidos, gráfico por módulo, desempenho por área, conquistas e os dez
módulos em cards pastel.

Todos os indicadores são calculados a partir do progresso real salvo no navegador: módulos
concluídos, pontos dos quizzes, taxa de acerto, barras por módulo, desempenho por área e
conquistas desbloqueadas. O layout se adapta a desktop, tablet e celular (a sidebar vira trilho
de ícones e depois barra inferior).

- Referência visual: [`assets/reference-dashboard.png`](assets/reference-dashboard.png)
- Prévia da implementação: [`assets/preview-dashboard.png`](assets/preview-dashboard.png)

## Ilustrações pixel-art

As ilustrações são recortes individuais da folha `Pixel Finance Education Asset Sheet.png`.
O original fica em `assets/source/` e os PNGs transparentes ficam em
`assets/images/pixel-art/`, com metadados em `manifest.json`. Veja
[`assets/README.md`](assets/README.md) para o inventário completo,
[`assets/preview-assets.png`](assets/preview-assets.png) para a folha de contato e
[`assets/preview-dashboard.png`](assets/preview-dashboard.png) para uma prévia do dashboard.

- `static/pixel.js` centraliza os caminhos (`PIXEL`), a arte de cada módulo (`MODULE_ART`) e o
  helper `pixelImg()` usado pelo HTML dinâmico.
- O Flask serve a pasta com a rota `GET /assets/<path>`; a pasta `assets/` não fica dentro de
  `static/`, para separar ilustrações de código de interface.
- Para regerar os recortes: `pip install pillow numpy && python scripts/extract_pixel_assets.py`.
  O script preserva a resolução e a estética originais, remove o fundo branco por preenchimento a
  partir das bordas e mantém os brancos internos dos balões e cartões.
