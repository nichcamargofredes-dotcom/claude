---
data: 2026-10-19
tipo: site
status: concluído
---

# Site de perfume – Maison Vespéra

Site minimalista para uma marca de perfume fictícia, **Vespéra** (Eau de Parfum, âmbar floral).

## O que foi feito
- **Perfume animado durante o site inteiro:** a foto enviada é a primeira imagem; o frasco fica fixo no fundo e, enquanto o site desce, avança quadro a quadro pelo vídeo (frasco sobe, a tampa sai e as notas explodem em volta).
- **Volta ao frasco fechado:** a animação vai até o meio do site e depois roda de trás para frente, sem pausa, e o frasco flutua devagar o tempo todo, mesmo sem rolar; na seção de compra o frasco aparece fechado, como na foto original.
- **Informações ao lado do frasco:** a cada painel o frasco diminui e vai para o lado oposto ao texto. No celular, o frasco fica preso no topo da tela e o texto rola embaixo, direto no fundo da página (sem caixas por cima), sumindo suavemente por trás do frasco.
- Painéis: Fragrância (ficha técnica), nota de topo (lima-da-pérsia), coração (jasmim sambac), fundo (âmbar & oud), Ritual de uso, Comprar (50 ml / 100 ml). Depois, rodapé com newsletter.
- Título "Vespéra" na frente do frasco, um pouco abaixo do meio da tela e maior que a tela (passa das bordas).
- Fontes: Bodoni Moda + Jost. Paleta tirada da foto (lilás, rosa, âmbar, dourado, mármore).

## Links
- Site no ar (Vercel): https://vespera-parfum.vercel.app (vespera.vercel.app já era de outro projeto)
- Página publicada: https://claude.ai/artifact/DCX2c1WyMpWDZPkHoooMUZ
- Código: repositório `nichcamargofredes-dotcom/claude`, pasta `perfume/`, branch `claude/ecstatic-davinci-xubzjl`

## Decisões
- Vídeo convertido em 192 quadros WebP + 192 máscaras (≈ 9 MB) em vez de `<video>`, para o scroll ir e voltar sem travar e permitir o texto atrás dos objetos.
- No celular o vídeo não ocupa a tela toda em altura (o frasco ficaria maior que a tela); as bordas se misturam com a cor do fundo de cada quadro.
- Marca, preços e textos são fictícios.

## Próximos passos
- Trocar nome, preços e textos pelos reais.
- Ligar o botão de compra a uma loja (Shopify, Nuvemshop).
