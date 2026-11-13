/* Mapa dos PNGs extraídos da folha "Pixel Finance Education Asset Sheet.png".
   Use pixelImg('chave') no HTML dinâmico para manter os caminhos em um só lugar. */
var PIXEL = {
  student: 'personagem-estudante.png',
  piggy: 'porquinho-cofre_HD2.png',
  trophy: 'trofeu.png',
  medalGold: 'medalha-ouro.png',
  medalSilver: 'medalha-prata.png',
  medalBronze: 'medalha-bronze.png',
  shield: 'escudo.png',
  starGold: 'estrela-dourada.png',
  starBlue: 'estrela-azul.png',
  coin: 'moeda-ouro.png',
  coinSmall: 'moeda-pequena.png',
  coinStack: 'pilha-moedas.png',
  diamond: 'diamante.png',
  sparkle: 'brilho-estrela.png',
  sparkleGold: 'brilho-dourado.png',
  sparkleLines: 'brilho-linhas.png',
  bubbleMotivation: 'balao-motivacional.png',
  bubbleConquest: 'balao-conquistas.png',
  book: 'livro.png',
  calendar: 'calendario.png',
  calculator: 'calculadora.png',
  growth: 'grafico-crescimento_HD.png',
  moneyPlant: 'planta-dinheiro_HD.png',
  card: 'cartao-bancario.png',
  wallet: 'carteira.png',
  safe: 'cofre.png',
  shop: 'loja.png',
  globe: 'globo.png',
  plantOrange: 'planta-vaso-laranja.png',
  plantTall: 'planta-vaso-alto.png',
  plantSmall: 'planta-vaso-pequeno.png',
  bush: 'arbusto.png',
  grass: 'grama-bloco.png',
  grassSmall: 'grama-bloco-pequeno.png',
  cloud: 'nuvem.png',
  cloudSmall: 'nuvem-pequena.png',
  garden: 'cenario-jardim.png',
  statusDone: 'status-concluido.png',
  statusDoing: 'status-em-andamento.png',
  statusNew: 'status-nao-iniciado.png',
  iconDone: 'icone-concluido_novo.png',
  iconDoing: 'icone-em-andamento.png',
  iconNew: 'icone-nao-iniciado.png',
  iconPercent: 'icone-porcentagem.png',
  bell: 'botao-sino.png',
  avatar: 'botao-avatar.png',
  gear: 'botao-configuracoes.png',
  help: 'botao-ajuda.png',
  cardPoints: 'card-pontos.png',
  cardAccuracy: 'card-acertos.png',
  btnContinue: 'botao-continuar.png',
  barGreen: 'barra-progresso-verde.png',
  barBlue: 'barra-progresso-azul.png',
  btnReview: 'botao-revisar.png',
  btnStart: 'botao-comecar.png',
  cardProgress: 'card-progresso-modulos.png',
  iconReview: 'icone-revisar.png',
  iconStart: 'icone-comecar.png',
  iconNext: 'icone-avancar.png',
  sparkLeft: 'brilho-balao-esquerda.png',
  sparkRight: 'brilho-balao-direita.png'
};

/* Cada módulo recebe a ilustração que combina com o seu tema. */
var MODULE_ART = {
  m1: 'book',
  m2: 'calendar',
  m3: 'wallet',
  m4: 'piggy',
  m5: 'calculator',
  m6: 'card',
  m7: 'shield',
  m8: 'shop',
  m9: 'growth',
  m10: 'trophy'
};

var MODULE_ALT = {
  m1: 'Livro de finanças',
  m2: 'Calendário de planejamento',
  m3: 'Carteira com dinheiro',
  m4: 'Porquinho cofre',
  m5: 'Calculadora',
  m6: 'Cartão bancário',
  m7: 'Escudo de proteção',
  m8: 'Loja',
  m9: 'Gráfico de crescimento',
  m10: 'Troféu'
};

var STATUS_ART = {
  done: { key: 'iconDone', alt: 'Concluído' },
  doing: { key: 'iconDoing', alt: 'Em andamento' },
  new: { key: 'iconNew', alt: 'Não iniciado' }
};

function pixelPath(key) {
  return '/assets/images/pixel-art/' + (PIXEL[key] || PIXEL.coin);
}

function pixelImg(key, cls, alt, extra) {
  return '<img class="' + (cls || 'px-img') + '" src="' + pixelPath(key) + '" alt="' +
    (alt || '') + '" decoding="async" draggable="false"' + (extra ? ' ' + extra : '') + '>';
}

function moduleArt(m) {
  return MODULE_ART[m.id] || 'book';
}

function moduleArtAlt(m) {
  return MODULE_ALT[m.id] || 'Ilustração do módulo';
}

function statusArt(key) {
  return STATUS_ART[key] || STATUS_ART.new;
}
