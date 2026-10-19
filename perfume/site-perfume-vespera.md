---
data: 2026-10-19
tipo: site
status: concluído
---

# Site de perfume – Maison Vespéra

Site minimalista para uma marca de perfume fictícia, **Vespéra** (Eau de Parfum, âmbar floral).

## O que foi feito
- **Hero animado pelo scroll:** a foto enviada é a primeira imagem; ao rolar, o site avança quadro a quadro pelo vídeo (frasco sobe, a tampa sai e as notas explodem em volta).
- **Texto atrás do perfume:** a palavra "Vespéra" fica centralizada atrás do frasco e dos ingredientes durante toda a animação (máscara por quadro, feita com rembg).
- Legendas que aparecem no scroll com as notas: lima-da-pérsia (topo), jasmim sambac (coração), âmbar & oud (fundo).
- Seções: Fragrância (ficha técnica), Pirâmide olfativa com imagens recortadas do vídeo, Ritual de uso com parallax, Comprar (50 ml / 100 ml), rodapé com newsletter.
- Fontes: Bodoni Moda + Jost. Paleta tirada da foto (lilás, rosa, âmbar, dourado, mármore).

## Links
- Página publicada: https://claude.ai/artifact/DCX2c1WyMpWDZPkHoooMUZ
- Código: repositório `nichcamargofredes-dotcom/claude`, pasta `perfume/`, branch `claude/ecstatic-davinci-xubzjl`

## Decisões
- Vídeo convertido em 192 quadros WebP + 192 máscaras (≈ 9 MB) em vez de `<video>`, para o scroll ir e voltar sem travar e permitir o texto atrás dos objetos.
- No celular o vídeo não ocupa a tela toda em altura (o frasco ficaria maior que a tela); as bordas se misturam com a cor do fundo de cada quadro.
- Marca, preços e textos são fictícios.

## Próximos passos
- Trocar nome, preços e textos pelos reais.
- Publicar em hospedagem própria (Vercel ou Netlify) com a pasta `perfume/`.
- Ligar o botão de compra a uma loja (Shopify, Nuvemshop).
