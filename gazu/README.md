# GAZU · loja de roupas

Site estático (HTML, CSS e JS puros), sem etapa de build. Abra `index.html` no navegador ou sirva a pasta com qualquer servidor estático (`npx serve gazu`, `python3 -m http.server`).

## O que tem na página
- **Hero**: o da referência. Letreiro GAZU atrás do modelo, que entra caminhando; ao rolar, as letras se abrem e o modelo segue andando. No desktop, o hero acompanha o mouse com um leve parallax.
- **Arara 3D** (`#arara`): trilho em arco com 14 peças penduradas de lado. A rolagem desliza os cabides; passar o mouse vira a peça de frente (o tecido torce, balança e afunda onde o cursor toca) e as vizinhas abrem espaço. O clique abre o painel da peça com frente/costas, tamanhos e "Adicionar à sacola"; no painel dá para arrastar a peça para girar e usar a roda do mouse (ou dois dedos no celular) para dar zoom exatamente no ponto sob o cursor; segurar o botão direito e arrastar move a peça junto com o mouse; dois cliques voltam ao normal. No celular: toque vira a peça e o segundo toque abre os detalhes.
- **Mais vendidos**: as fotos dos cards são geradas na hora a partir das mesmas peças 3D (frente e, no hover, costas).
- Faixa de vantagens e rodapé com newsletter. As vantagens (frete, troca, parcelamento, envio) também aparecem compactas no painel da peça, abaixo do botão de compra.

## Personalizar
- **Peças, preços e textos da arara**: array `CATALOG` em `js/garments.js` (nome, tipo, cor, preço, estampa, descrição e composição). Tipos disponíveis: `model` (peça modelada no Blender, ver abaixo), `hoodie` (com `zip: true` vira moletom com zíper), `crew` (com `lite: true` vira manga longa), `tee` (com `oversized: true`), `shirt`, `coat` e `bomber`.
- **Cards de Mais vendidos**: `index.html`, seção `#mais-vendidos`. O `data-id` de cada card aponta para o `id` da peça no catálogo.
- **Cores e fontes**: variáveis no topo de `css/styles.css`.
- **Foto do hero**: `img/hero-model.webp` (recorte com fundo transparente, ~840×1700) e `img/hero-model-sm.webp` para celular.
- **Sacola**: gaveta lateral com miniatura 3D de cada peça, tamanho, quantidade, remoção, barra de frete grátis (limite `FREE` em `js/main.js`) e total em até 6x. Fica salva no navegador (`localStorage`). O botão "Finalizar compra" ainda não leva a um pagamento: ligue-o ao checkout da sua plataforma em `js/main.js` (`#bag-checkout`).
- **Guia de medidas**: tabelas por tipo de peça (largura, comprimento e manga em cm) e medidas do corpo por tamanho, no objeto `GUIDE` e na lista `BODY` em `js/main.js`. Aberto pelo painel da peça, já mostra o tipo certo e permite escolher o tamanho direto na tabela.
- **Painéis com rolagem**: o painel da peça, a sacola, o guia de medidas, a busca e o menu rolam com a roda do mouse enquanto a página fica parada (atributo `data-lenis-prevent`).
- **Newsletter**: funciona só na interface (validação e aviso). Conecte o `submit` do formulário `#news` ao seu serviço de e-mail.

## Peças vindas do Blender
A **Camiseta Chama** veio de `camiseta_estampa.blend`. A cor do tecido (com a estampa) foi assada numa textura e a malha virou `js/models/chama.js` (malha quantizada + textura em WebP, ~290 KB, carregado só quando a arara monta). No catálogo ela usa `type: 'model', model: 'chama'`. A **Camiseta Calm Over Chaos** (`js/models/calm.js`) usa a mesma malha base, com tecido mescla cinza-chumbo assado no Blender e as estampas (costas e peito) compostas na textura. O arquivo do Blender e a arte da estampa ficam em `blender/`.
Para trazer outra peça do Blender, exporte do mesmo jeito: malha em metros, frente para −Y, UV de bake com a frente na metade esquerda e as costas na direita.

## Antes de publicar no domínio
- Troque `img/og-image.jpg` e `img/twitter-image.jpg` nas metatags `og:image` e `twitter:image` pelo endereço completo (por exemplo `https://gazu.com.br/img/og-image.jpg`) e acrescente `<meta property="og:url">` com a URL da loja. Facebook, WhatsApp e X só leem a imagem de prévia com endereço absoluto.
- Os dados estruturados dos produtos (schema.org `ItemList` com preço em BRL) são gerados em `js/main.js` a partir do `CATALOG`, então preço e descrição ficam num lugar só.

## Tecnologia
- `vendor/three.min.js`: three.js r170 (só as classes usadas). As roupas são modeladas a partir de silhuetas 2D, com malha de frente e costas costuradas na borda, texturas pintadas em canvas e um shader de tecido.
- `vendor/gsap.min.js` + `ScrollTrigger.min.js`: animações de entrada e de rolagem.
- `vendor/lenis.min.js`: rolagem suave.
- `vendor/delaunator.min.js`: triangulação das malhas.
- Fontes locais em `fonts/`: Archivo (variável, com eixo de largura), IBM Plex Mono e UnifrakturMaguntia (só na estampa da Camiseta Reign).

Com "reduzir movimento" ativado no sistema, a rolagem suave e as animações são desligadas. Se o navegador não tiver WebGL, a arara vira uma lista simples de peças.
