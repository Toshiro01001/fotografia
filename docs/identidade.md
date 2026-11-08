# Identidade visual: Grão Fotografia

Estudo curto feito antes de qualquer linha de código. Tudo aqui é fictício: o estúdio, as pessoas, o endereço, o telefone, os preços e as fotos.

## Nome e posicionamento

**Grão Fotografia.** Estúdio de fotografia em Cuiabá que cobre casamentos, ensaios, eventos corporativos e fotografia de produto.

Frase de posicionamento: **"Fotografias que envelhecem bem."**

A ideia que guia tudo: um estúdio que faz imagem para durar, não para a tendência da semana. "Grão" é o grão do filme, a textura que aparece quando a foto é ampliada e que ninguém acha defeito. O nome diz que o estúdio gosta do material da fotografia (luz, papel, tempo) e não da pose. Nenhuma frase do site promete "o dia mais feliz da sua vida"; o site fala de luz, de horas, de entrega e de prazo.

## Fundo escuro ou branco de galeria

Escolhi o **fundo escuro de sala de revelação**. Três motivos:

1. Em um site de fotógrafo a única coisa que pode brilhar é a foto. Sobre fundo quase preto, as imagens são a parte mais clara da tela e o olho vai direto para elas, como numa sala escura onde só a imagem do ampliador tem luz. Sobre branco, a interface compete com a foto.
2. O branco de galeria é o padrão dos modelos de portfólio prontos; o escuro, feito com cuidado (sem preto puro, sem dourado), destaca a demonstração entre os sites da série.
3. O escuro permite um único ponto de cor forte, a luz de segurança vermelha da sala de revelação, que é a cor mais específica do universo da fotografia analógica. Em fundo branco ela viraria apenas "um botão laranja".

O que o escuro exige, e o site cumpre: o texto corrente nunca é branco puro (cansa) e sim cor de papel fotográfico; as superfícies escuras têm dois tons, para haver profundidade sem sombras; e o respiro entre blocos é generoso, porque no escuro a falta de margem parece caixa fechada.

## Paleta

| Nome | Hex | Papel |
|---|---|---|
| Breu | `#111214` | Fundo da página. Quase preto, com um pingo de azul para não parecer chapado. |
| Chumbo | `#1C1E22` | Superfícies: cartões, painel do montador, calendário, campos de formulário. |
| Grafite | `#3B3F46` | Bordas de 1px, divisórias, trilhos dos controles. |
| Papel fotográfico | `#EDEAE4` | Texto principal e títulos. Branco levemente quente, como papel baritado. |
| Prata | `#A6A9AF` | Texto de apoio, legendas, rótulos. |
| Luz de segurança | `#FF5A36` | Destaque. Vermelho alaranjado da lâmpada de sala escura. Um lugar por tela. |

Regra de uso do destaque: **a Luz de segurança aparece em um só lugar por tela**: o botão principal da abertura, o filtro ativo do portfólio, o total do pacote, a data escolhida no calendário, o botão de confirmar do orçamento. Nunca em texto corrente, nunca em dois botões na mesma dobra. Botões secundários são contorno Grafite com texto Papel. Links em texto ficam em Papel com sublinhado fino, não em vermelho.

Contrastes verificados (WCAG 2): Papel sobre Breu 16,0:1; Papel sobre Chumbo 14,2:1; Prata sobre Breu 7,6:1; Prata sobre Chumbo 6,7:1; Luz de segurança sobre Breu 6,0:1; Breu sobre Luz de segurança 6,0:1; Grafite sobre Breu 1,9:1 (só decoração, nunca texto).

## Tipografia

Duas famílias, ambas locais em `fonts/` (licença SIL OFL, texto da licença ao lado de cada uma).

- **Bodoni Moda** (variável, eixos peso 400 a 900 e tamanho óptico 6 a 96): títulos e números grandes. Didone de revista de moda e fotografia, com contraste alto entre hastes grossas e finas. Em tamanho grande, com o eixo óptico em 96, as serifas viram fios de cabelo e o título parece capa de revista impressa. O itálico entra em uma única palavra por título, para dar o toque editorial sem precisar de "script" cursivo de convite de casamento.
- **Manrope** (variável, 200 a 800): texto corrente, formulários, botões, legendas. Geométrica, de abertura larga, muito legível em texto pequeno sobre fundo escuro. Fica quieta ao lado da Bodoni.

Escala tipográfica (fluida, com `clamp`):

| Papel | Família | Tamanho | Entrelinha | Peso |
|---|---|---|---|---|
| Título da página (h1) | Bodoni Moda | 3rem a 6,5rem | 0,95 | 400 |
| Título de seção (h2) | Bodoni Moda | 2,25rem a 3,75rem | 1,0 | 400 |
| Subtítulo (h3) | Bodoni Moda | 1,375rem a 1,625rem | 1,2 | 500 |
| Número grande (total do pacote, dia do calendário) | Bodoni Moda | 2,5rem a 3,5rem | 1,0 | 400 |
| Corpo | Manrope | 1,0625rem (17px) | 1,65 | 400 |
| Interface (botões, rótulos) | Manrope | 0,9375rem | 1,3 | 600 |
| Legenda | Manrope | 0,8125rem | 1,45 | 500 |

Regra de peso: a Bodoni nunca passa de 500. Em 700 ou mais ela vira cartaz de perfume. Na Manrope, 600 é o máximo, reservado a rótulos e botões; texto corrente sempre em 400. Letras maiúsculas só em siglas; nenhum rótulo em caixa alta sobre título.

## Layout

- Grade de 12 colunas, largura máxima de 1280px, margens laterais de 20px no celular e 48px no computador.
- Ritmo em múltiplos de 8px. Seções com respiro vertical de 96px no celular e 144px no computador; dentro de uma seção, 48px entre cabeça e conteúdo.
- Texto alinhado à esquerda em todo o site. O único elemento centralizado é a foto aberta em tela cheia.
- Sem linhas divisórias entre seções: a troca de assunto é marcada por respiro e pelo título grande. Dentro das seções, bordas de 1px Grafite separam linhas de informação (como fichas técnicas de contato).
- Cantos: 4px em tudo. Fotografia é retângulo; cantos arredondados grandes dariam cara de aplicativo. A única exceção é a etiqueta de tipo sobre a foto, com 999px.
- Portfólio em grade de 3 colunas no computador e 2 no celular; cada foto ocupa um bloco 4:5 e as fotos de destaque ocupam dois blocos de largura (viram 8:5). A grade usa `grid-auto-flow: dense` para fechar buracos quando um filtro esconde itens.

## Imagem

- **Foto do hero**: fotografia real em contêiner 3:2 (ver seção abaixo). Enquanto a foto não chega, `img/hero.webp` é uma composição abstrata gerada com Pillow nas cores da identidade: Breu com um halo de Luz de segurança no canto superior esquerdo, círculos de "bokeh" em Papel e Prata, grão fino em toda a imagem. Sem texto.
- **Fotos do portfólio**: 12 imagens provisórias em webp, geradas com Pillow. Cada uma é um degradê escuro com formas geométricas em Prata, Papel e Luz de segurança (um arco, uma elipse, uma faixa, um retângulo), grão de filme e a legenda do tipo no canto inferior. A sessão principal troca depois por fotos reais do mesmo tamanho (800x1000 nas verticais, 1600x1000 nas de destaque).
- **Ícones e marca**: SVG inline. A marca é um círculo com um ponto deslocado, lembrando o diafragma da lente e, ao mesmo tempo, um grão.
- **Grão**: um ruído sutil em `img/grao.webp` (tile 240x240, quase transparente) que cobre o fundo da página por `background-image` repetido. É o detalhe memorável que o visitante só percebe ao chegar perto.

## Movimento

Um único momento orquestrado: na abertura, o título entra por fade e desloca 12px para cima, depois a foto do hero revela de baixo para cima (clip-path), em 900ms no total. Fora disso, só respostas a ações: o filtro reorganiza a grade com transição de opacidade; a foto em tela cheia abre com fade de 200ms; os botões de pré-reserva e do montador mudam de estado em 150ms. Tudo é desligado com `prefers-reduced-motion: reduce`.

## Foto do hero

Proporção esperada: **3:2** (1600x1067px ou maior, na horizontal). Cantos retos (4px). A imagem será cortada ao centro pelo `object-fit: cover`, então o assunto deve ficar no meio.

Prompt para gerar no Canva (em português):

> Fotografia editorial de estúdio, estilo site premium de fotógrafo. Uma câmera analógica de médio formato antiga, metálica e preta, vista de três quartos, apoiada sobre uma mesa de madeira escura, ao lado de três rolos de filme fotográfico e uma lupa de contato. Luz lateral suave vinda da esquerda com um leve brilho vermelho alaranjado de lâmpada de sala de revelação (cor #FF5A36) tocando a borda da câmera. Fundo quase preto, cor #111214, liso, com leve degradê. Profundidade de campo rasa, foco na lente da câmera, pontos de luz desfocados ao fundo em tom prata. Grão fino de filme, cores dessaturadas, sem texto, sem pessoas, sem logotipos legíveis. Proporção 3:2, horizontal.

Alternativa, se a câmera ficar com cara de banco de imagens: uma tira de negativos 35mm pendurada por um prendedor de madeira em uma sala escura, com a luz vermelha ao fundo e o mesmo fundo #111214.
