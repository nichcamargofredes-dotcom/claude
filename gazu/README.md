# GAZU · loja de roupas

Site estático (HTML, CSS e JS puros), sem etapa de build. Abra `index.html` no navegador ou sirva a pasta com qualquer servidor estático (`npx serve gazu`, `python3 -m http.server`).

## O que tem na página
- **Hero**: o da referência. Letreiro GAZU atrás do modelo, que entra caminhando; ao rolar, as letras se abrem e o modelo segue andando. No desktop, o hero acompanha o mouse com um leve parallax.
- **Arara 3D** (`#arara`): trilho em arco com 12 peças penduradas de lado. A rolagem desliza os cabides; passar o mouse vira a peça de frente (o tecido torce, balança e afunda onde o cursor toca) e as vizinhas abrem espaço. O clique abre o painel da peça com frente/costas, tamanhos e "Adicionar à sacola"; no painel dá para arrastar a peça para girar. No celular: toque vira a peça e o segundo toque abre os detalhes.
- **Mais vendidos**: as fotos dos cards são geradas na hora a partir das mesmas peças 3D (frente e, no hover, costas).
- **Manifesto**, faixa de vantagens e rodapé com newsletter.

## Personalizar
- **Peças, preços e textos da arara**: array `CATALOG` em `js/garments.js` (nome, tipo, cor, preço, estampa, descrição e composição). Tipos disponíveis: `hoodie` (com `zip: true` vira moletom com zíper), `crew` (com `lite: true` vira manga longa), `tee` (com `oversized: true`), `shirt`, `coat` e `bomber`.
- **Cards de Mais vendidos**: `index.html`, seção `#mais-vendidos`. O `data-id` de cada card aponta para o `id` da peça no catálogo.
- **Cores e fontes**: variáveis no topo de `css/styles.css`.
- **Foto do hero**: `img/hero-model.webp` (recorte com fundo transparente, ~840×1700) e `img/hero-model-sm.webp` para celular.
- **Newsletter e sacola**: hoje funcionam só na interface (contador, aviso e validação). Conecte o `submit` do formulário `#news` e a função `addToCart` em `js/main.js` ao seu backend ou plataforma de e-commerce.

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
