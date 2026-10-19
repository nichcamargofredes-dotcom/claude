# Viewport · site de apresentação

Site do estúdio Viewport, de Nicolas Freds, na identidade visual da marca: verde institucional `#2E4D3A`, grafite `#0E0F0F`, cinza `#A7A7A0`, off-white `#F7F7F5` e fonte Inter.

HTML, CSS e JS puros, sem build. O hero usa three.js (em `vendor/`) para o "V" em 3D sobre concreto com sombras de folhas. Sirva a pasta com qualquer servidor estático (os módulos ES não abrem via `file://`), por exemplo `npx http-server .`

## Personalizar
- **WhatsApp do formulário:** constante `WHATSAPP` no topo de `main.js` (DDI + DDD + número, só dígitos).
- **Projetos:** cada `<article class="proj">` em `index.html` (link, textos e imagem ou capa).
- **Cores:** variáveis no topo de `styles.css`.
- **Cena 3D:** função `gl` em `main.js` (posição do V, luzes, folhas).

## Projetos no portfólio
CozyPaws, Áurea Odontologia, Ébano Barbearia & Lounge, MOVA+ Personal Trainer, Dr. Lucas Mendes Quiropraxia e CT Lucas Sousa. Cada card mostra o site no computador (`img/*-desktop.jpg`) e no celular. Nos celulares da Áurea, Ébano, MOVA+ e CT, a tela é montada em HTML (`.mcover`) sobre uma foto do hero (`img/*-mobile-bg.jpg`); para usar um print real do celular, troque esse bloco por um `<img>`, como nos cards da CozyPaws e da quiropraxia.
