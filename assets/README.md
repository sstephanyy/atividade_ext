# Ilustrações pixel-art

Todas as ilustrações do GranaLab vêm de uma única folha de sprites:

- **Arquivo original:** `assets/source/Pixel Finance Education Asset Sheet.png` (1536 × 1024 px, PNG)
- **Extrações:** `assets/images/pixel-art/` (61 PNGs transparentes)
- **Metadados:** `assets/images/pixel-art/manifest.json` (nome, descrição, recorte de origem e dimensões)
- **Prévia dos recortes:** `assets/preview-assets.png` (folha de contato com todos os elementos)
- **Prévia no app:** `assets/preview-dashboard.png` (dashboard usando os PNGs individuais)
- **Referência visual do dashboard:** `assets/reference-dashboard.png`

O arquivo original também permanece na raiz do projeto como referência.

## Como a extração é feita

O script `scripts/extract_pixel_assets.py`:

1. Compõe a folha sobre branco (o PNG de origem tem alfa irregular nas bordas).
2. Recorta cada elemento com uma caixa própria, definida em `ASSETS`.
3. Remove o fundo branco por **preenchimento a partir das bordas do recorte**. Assim, brancos internos (nuvens, balões, cartões, olhos) são preservados.
4. Remove fragmentos soltos de elementos vizinhos que entram na caixa.
5. Aplica máscaras circulares nos ícones redondos e remove o verde do ícone de avançar.
6. Apara o resultado e adiciona 4 px de respiro transparente.

Nada é redesenhado, esticado ou filtrado: os recortes mantêm a resolução e o traço originais.

Para regerar:

```bash
pip install pillow numpy
python scripts/extract_pixel_assets.py
```

## Inventário

### Personagem e cenário

`personagem-estudante.png` · `porquinho-cofre.png` · `planta-vaso-laranja.png` ·
`planta-vaso-alto.png` · `planta-vaso-pequeno.png` · `arbusto.png` · `grama-bloco.png` ·
`grama-bloco-pequeno.png` · `nuvem.png` · `nuvem-pequena.png` · `cenario-jardim.png`

### Prêmios e recompensas

`trofeu.png` · `medalha-ouro.png` · `medalha-prata.png` · `medalha-bronze.png` ·
`escudo.png` · `estrela-dourada.png` · `estrela-azul.png` · `diamante.png` ·
`moeda-ouro.png` · `moeda-pequena.png` · `pilha-moedas.png` · `brilho-estrela.png` ·
`brilho-dourado.png` · `brilho-linhas.png` · `brilho-balao-esquerda.png` ·
`brilho-balao-direita.png`

### Educação financeira

`livro.png` · `calendario.png` · `calculadora.png` · `grafico-crescimento.png` ·
`planta-dinheiro.png` · `cartao-bancario.png` · `carteira.png` · `cofre.png` ·
`loja.png` · `globo.png`

### Balões

`balao-motivacional.png` · `balao-conquistas.png`

### Interface

`status-concluido.png` · `status-em-andamento.png` · `status-nao-iniciado.png` ·
`icone-concluido.png` · `icone-em-andamento.png` · `icone-nao-iniciado.png` ·
`icone-porcentagem.png` · `botao-sino.png` · `botao-avatar.png` ·
`botao-configuracoes.png` · `botao-ajuda.png` · `icone-revisar.png` ·
`icone-comecar.png` · `icone-avancar.png` · `barra-progresso-verde.png` ·
`barra-progresso-azul.png`

Cartões e botões de exemplo, mantidos como referência visual da folha:
`card-pontos.png` · `card-acertos.png` · `card-progresso-modulos.png` ·
`botao-continuar.png` · `botao-revisar.png` · `botao-comecar.png`

> Os cartões e botões acima têm texto embutido na imagem. Por isso eles **não** são usados
> como controles reais no app — os controles continuam em HTML/CSS, acessíveis e traduzíveis.
> Os ícones sem texto (`icone-*.png`) é que entram nos componentes funcionais.

## Onde cada grupo é usado no dashboard

| Seção | Ilustrações |
| --- | --- |
| Login | estudante, balão motivacional, moeda, plantas e brilhos |
| Sidebar | porquinho (logo), moeda (Início), livro, troféu, ajuda, gráfico, planta do dinheiro |
| Hero da home | estudante, balão motivacional, nuvens, arbusto e livro |
| Estatísticas | ícone de concluído, estrela azul, porcentagem e gráfico de crescimento |
| Seu progresso | gráfico de crescimento, ícones de status e livro |
| Seu desempenho | porquinho, calculadora, pilha de moedas e gráfico de crescimento |
| Suas conquistas | troféu, medalhas, estrela e escudo |
| Módulos e aulas | livro, calendário, carteira, porquinho, calculadora, cartão, escudo, loja, gráfico e troféu |
| Quizzes | medalhas de ouro, prata e bronze; troféu no resultado |
| Assistente | avatar, balão motivacional e moeda |
| Página de progresso | gráfico, troféu, medalhas e cenário de jardim |

## Observações sobre a folha original

- Não existem, na folha, smartphone de PIX, saco de dinheiro ou checklist. Os elementos de
  pagamento e consumo disponíveis são o cartão, a carteira, a loja e o cofre.
- O balão vazio no canto inferior direito está parcialmente encoberto pela árvore e pela placa;
  por isso não foi extraído como peça isolada.
- O caminho branco do jardim faz parte da ilustração original e foi preservado.
