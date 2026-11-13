/* GranaLab — classes de domínio dos módulos, conteúdos, quizzes e atividades.
   Este arquivo existe para que o diagrama de classes corresponda a tipos reais
   do código, e não apenas a uma representação conceitual. As propriedades
   originais (n, t, q, o, a, e etc.) são preservadas para compatibilidade com o
   restante da aplicação; os getters expõem os nomes usados no diagrama. */

/* ---------- Enumerações ---------- */
class StatusModulo {
  constructor(key, label) {
    this.key = key;
    this.label = label;
  }
}
StatusModulo.NAO_INICIADO = new StatusModulo('new', 'Não iniciado');
StatusModulo.EM_ANDAMENTO = new StatusModulo('doing', 'Em andamento');
StatusModulo.CONCLUIDO = new StatusModulo('done', 'Concluído');

class TipoAtividade {
  constructor(codigo, nome) {
    this.codigo = codigo;
    this.nome = nome;
  }
}
TipoAtividade.ORCAMENTO = new TipoAtividade('budget', 'Orçamento');
TipoAtividade.META = new TipoAtividade('goal', 'Meta');
TipoAtividade.TABELA_ORCAMENTO = new TipoAtividade('table', 'Tabela de orçamento');
TipoAtividade.ECONOMIA_DIARIA = new TipoAtividade('savings', 'Economia diária');
TipoAtividade.COMPARADOR = new TipoAtividade('compare', 'Comparador de pagamentos');
TipoAtividade.FATURA = new TipoAtividade('invoice', 'Fatura');
TipoAtividade.RESERVA = new TipoAtividade('reserve', 'Reserva');
TipoAtividade.VENDAS = new TipoAtividade('sales', 'Vendas');
TipoAtividade.INFLACAO = new TipoAtividade('inflation', 'Inflação');
TipoAtividade.SIMULACAO_FINAL = new TipoAtividade('final', 'Simulação final');
TipoAtividade.TODOS = [
  TipoAtividade.ORCAMENTO, TipoAtividade.META, TipoAtividade.TABELA_ORCAMENTO,
  TipoAtividade.ECONOMIA_DIARIA, TipoAtividade.COMPARADOR, TipoAtividade.FATURA,
  TipoAtividade.RESERVA, TipoAtividade.VENDAS, TipoAtividade.INFLACAO,
  TipoAtividade.SIMULACAO_FINAL
];
TipoAtividade.porCodigo = function (codigo) {
  return TipoAtividade.TODOS.filter(function (t) { return t.codigo === codigo; })[0] || null;
};

/* ---------- Resultado ---------- */
class ResultadoAtividade {
  constructor(concluida, mensagem, pontos) {
    this.concluida = !!concluida;
    this.mensagem = mensagem || '';
    this.pontos = Number(pontos) || 0;
  }
}

/* ---------- Conteúdo do módulo ---------- */
class Introducao {
  constructor(raw) {
    Object.assign(this, raw || {});
  }
  get porQue() { return this.why; }
  get aprendizados() { return this.learn || []; }
}

class SecaoConteudo {
  constructor(raw) {
    Object.assign(this, raw || {});
  }
  get titulo() { return this.h; }
  get paragrafos() { return this.p || []; }
  get exemplo() { return this.ex; }
  get destaque() { return this.hl; }
}

class CasoPratico {
  constructor(raw) {
    Object.assign(this, raw || {});
  }
  get paragrafos() { return this.p || []; }
  get calculo() { return this.calc; }
}

class AlternativaProblema {
  constructor(raw) {
    Object.assign(this, raw || {});
  }
  get texto() { return this.t; }
  get correta() { return !!this.best; }
  get feedback() { return this.fb; }
}

class SituacaoProblema {
  constructor(raw) {
    Object.assign(this, raw || {});
    this.opts = (this.opts || []).map(function (o) {
      return o instanceof AlternativaProblema ? o : new AlternativaProblema(o);
    });
  }
  get enunciado() { return this.q; }
  alternativaCorreta() {
    return this.opts.filter(function (o) { return o.best; })[0] || null;
  }
}

class Questao {
  constructor(raw) {
    Object.assign(this, raw || {});
  }
  get enunciado() { return this.q; }
  get alternativas() { return this.o || []; }
  get indiceCorreto() { return this.a; }
  get explicacao() { return this.e; }
  verificar(indice) { return indice === this.a; }
}

class Quiz {
  constructor(questoes) {
    this.questoes = (questoes || []).map(function (q) {
      return q instanceof Questao ? q : new Questao(q);
    });
    this.questoes.forEach(function (q, i) { this[i] = q; }, this);
    this.length = this.questoes.length;
  }
  totalQuestoes() { return this.length; }
  pontuacaoMaxima() { return this.length * 10; }
  corrigir(respostas) {
    var acertos = 0;
    this.questoes.forEach(function (q, i) {
      if (q.verificar(respostas ? respostas[i] : -1)) acertos++;
    });
    return acertos * 10;
  }
  map(fn) { return this.questoes.map(fn); }
  forEach(fn) { return this.questoes.forEach(fn); }
  [Symbol.iterator]() { return this.questoes[Symbol.iterator](); }
}

/* ---------- Atividades ---------- */
class AtividadeEducativa {
  constructor(raw) {
    Object.assign(this, raw || {});
  }
  get titulo() { return this.t; }
  get enunciado() { return this.intro; }
  get tipo() { return TipoAtividade.porCodigo(this.kind); }
  renderizar(modulo, box) {
    if (typeof renderActivity === 'function') return renderActivity(modulo, box);
  }
  validar() { return true; }
  resultado() {
    var ok = this.validar();
    return new ResultadoAtividade(ok, ok ? 'Atividade concluída.' : 'Revise os valores da atividade.', 0);
  }
}

class AtividadeOrcamento extends AtividadeEducativa {
  get campos() { return this.fields || []; }
  get total() { return 100; }
  validarSoma() {
    var soma = this.campos.reduce(function (t, c) { return t + (Number(c.v) || 0); }, 0);
    return soma === this.total;
  }
  validar() { return this.validarSoma(); }
}

class SimuladorMeta extends AtividadeEducativa {
  calcularMensal() {
    if (!this.meses || this.meses <= 0) return 0;
    return Math.max(0, (Number(this.meta) - Number(this.guardado)) / this.meses);
  }
  validar() { return Number(this.meta) > 0 && Number(this.meses) > 0 && Number(this.guardado) >= 0; }
}

class TabelaOrcamento extends AtividadeEducativa {
  get itens() { return this.items || []; }
  saldo() {
    return Number(this.receita) - this.itens.reduce(function (t, i) { return t + (Number(i.v) || 0); }, 0);
  }
  validar() { return this.saldo() >= 0; }
}

class SimuladorEconomia extends AtividadeEducativa {
  get gastoDiario() { return Number(this.diario) || 0; }
  get diasPorSemana() { return Number(this.dias) || 0; }
  economiaMensal() { return this.gastoDiario * this.diasPorSemana * 4; }
  validar() { return this.gastoDiario > 0 && this.diasPorSemana >= 1 && this.diasPorSemana <= 7; }
}

class ComparadorPagamento extends AtividadeEducativa {
  get precoAvista() { return Number(this.avista) || 0; }
  get valorParcela() { return Number(this.parcela) || 0; }
  totalParcelado() { return (Number(this.parcelas) || 0) * this.valorParcela; }
  economia() { return this.totalParcelado() - this.precoAvista; }
  validar() { return this.precoAvista > 0 && Number(this.parcelas) > 0 && this.valorParcela > 0; }
}

class AnaliseFatura extends AtividadeEducativa {
  get categorias() { return this.cats || []; }
  get itens() { return this.items || []; }
  total() { return this.itens.reduce(function (t, i) { return t + (Number(i.v) || 0); }, 0); }
  categoriaMaisPesada() {
    var totais = {};
    this.itens.forEach(function (i) {
      totais[i.cat] = (totais[i.cat] || 0) + (Number(i.v) || 0);
    });
    var melhor = null, valor = -1;
    Object.keys(totais).forEach(function (cat) {
      if (totais[cat] > valor) { valor = totais[cat]; melhor = cat; }
    });
    return melhor;
  }
  validar() { return this.itens.length > 0; }
}

class SimuladorReserva extends AtividadeEducativa {
  get gastosEssenciais() { return Number(this.gastos) || 0; }
  get valorMensal() { return Number(this.guardar) || 0; }
  mesesCobertura() {
    if (this.valorMensal <= 0) return 0;
    return this.gastosEssenciais / this.valorMensal;
  }
  validar() { return this.gastosEssenciais > 0 && this.valorMensal > 0; }
}

class SimuladorVendas extends AtividadeEducativa {
  get quantidade() { return Number(this.qtd) || 0; }
  lucro() { return this.quantidade * (Number(this.preco) || 0) - (Number(this.custo) || 0); }
  validar() { return this.quantidade > 0 && Number(this.preco) > 0 && Number(this.custo) >= 0; }
}

class SimuladorInflacao extends AtividadeEducativa {
  get itens() { return this.items || []; }
  aumentoMedio() {
    if (!this.itens.length) return 0;
    var soma = this.itens.reduce(function (t, i) {
      return t + ((Number(i.depois) - Number(i.antes)) / Number(i.antes));
    }, 0);
    return soma / this.itens.length;
  }
  perdaPoderCompra() {
    var aumento = this.aumentoMedio();
    if (aumento <= -1) return 0;
    return 1 - (1 / (1 + aumento));
  }
  validar() { return this.itens.length > 0; }
}

class SimulacaoFinal extends AtividadeEducativa {
  get etapas() { return this.steps || []; }
  saldoFinal(escolhas) {
    var escolhasArr = escolhas || [];
    var gasto = this.etapas.reduce(function (t, etapa, i) {
      var opcao = etapa.opts[escolhasArr[i]];
      return t + (opcao ? Number(opcao.cost) || 0 : 0);
    }, 0);
    return (Number(this.renda) || 0) - gasto;
  }
  pontuacao(escolhas) {
    var escolhasArr = escolhas || [];
    return this.etapas.reduce(function (t, etapa, i) {
      var opcao = etapa.opts[escolhasArr[i]];
      return t + (opcao ? Number(opcao.score) || 0 : 0);
    }, 0);
  }
  validar(escolhas) {
    if (!this.etapas.length) return false;
    if (!escolhas) return true;
    return escolhas.length === this.etapas.length;
  }
}

function criarAtividade(raw) {
  if (!raw) return new AtividadeEducativa({ kind: 'none', t: '', intro: '' });
  switch (raw.kind) {
    case 'budget': return new AtividadeOrcamento(raw);
    case 'goal': return new SimuladorMeta(raw);
    case 'table': return new TabelaOrcamento(raw);
    case 'savings': return new SimuladorEconomia(raw);
    case 'compare': return new ComparadorPagamento(raw);
    case 'invoice': return new AnaliseFatura(raw);
    case 'reserve': return new SimuladorReserva(raw);
    case 'sales': return new SimuladorVendas(raw);
    case 'inflation': return new SimuladorInflacao(raw);
    case 'final': return new SimulacaoFinal(raw);
    default: return new AtividadeEducativa(raw);
  }
}

/* ---------- Módulo ---------- */
class Modulo {
  constructor(raw) {
    raw = raw || {};
    Object.assign(this, raw);
    this.intro = raw.intro instanceof Introducao ? raw.intro : new Introducao(raw.intro);
    this.sections = (raw.sections || []).map(function (s) {
      return s instanceof SecaoConteudo ? s : new SecaoConteudo(s);
    });
    this.caseEx = raw.caseEx instanceof CasoPratico ? raw.caseEx : new CasoPratico(raw.caseEx);
    this.problem = raw.problem instanceof SituacaoProblema ? raw.problem : new SituacaoProblema(raw.problem);
    this.quiz = raw.quiz instanceof Quiz ? raw.quiz : new Quiz(raw.quiz);
    this.activity = raw.activity instanceof AtividadeEducativa ? raw.activity : criarAtividade(raw.activity);
  }
  get numero() { return this.n; }
  get titulo() { return this.t; }
  get icone() { return this.ic; }
  get duracao() { return this.dur; }
  get descricao() { return this.desc; }
  get objetivos() { return this.objectives || []; }
  get resumo() { return this.summary || []; }
  get introducao() { return this.intro; }
  get secoes() { return this.sections; }
  get casoPratico() { return this.caseEx; }
  get situacaoProblema() { return this.problem; }
  get atividade() { return this.activity; }
  percentual(progresso) {
    if (!progresso) return 0;
    if (typeof progresso.percentual === 'function') return progresso.percentual();
    var v = 0;
    if (progresso.seen) v += 10;
    if (progresso.problem) v += 20;
    if (progresso.activity) v += 30;
    if (progresso.quizDone) v += 30;
    if (progresso.done) v += 10;
    return v;
  }
  contextoAssistente() {
    var parts = [this.intro.lead, this.intro.why];
    this.objectives.forEach(function (o) { parts.push('Objetivo: ' + o); });
    this.sections.forEach(function (s) {
      parts.push(s.h + ': ' + s.p.join(' '));
      if (s.ex) parts.push('Exemplo: ' + s.ex);
      if (s.hl) parts.push(s.hl);
    });
    parts.push('Exemplo prático: ' + this.caseEx.p.join(' ') + ' ' + this.caseEx.calc);
    this.problem.opts.forEach(function (o) {
      if (o.best) parts.push('Decisão adequada na situação-problema: ' + o.t + ' — ' + o.fb);
    });
    parts.push('Resumo: ' + this.summary.join(' '));
    return parts.join('\n').slice(0, 3500);
  }
}
