# Viewport · site de apresentação

Site do estúdio Viewport, de Nicholas Fredes, na identidade visual da marca: verde institucional `#2E4D3A`, grafite `#0E0F0F`, cinza `#A7A7A0`, off-white `#F7F7F5` e fonte Inter.

HTML, CSS e JS puros, sem build. O hero usa three.js (em `vendor/`) para o "V" em 3D sobre concreto com sombras de folhas. Sirva a pasta com qualquer servidor estático (os módulos ES não abrem via `file://`), por exemplo `npx http-server .`

## Personalizar
- **WhatsApp do formulário:** constante `WHATSAPP` no topo de `main.js` (DDI + DDD + número, só dígitos).
- **Projetos:** cada `<article class="proj">` em `index.html` (link, textos e imagem ou capa).
- **Cores:** variáveis no topo de `styles.css`.
- **Cena 3D:** função `gl` em `main.js` (posição do V, luzes, folhas).

## Projetos no portfólio
CozyPaws, Maison Vespéra, JBL Live Beam 3, Áurea Odontologia, Ébano Barbearia & Lounge, MOVA+ Personal Trainer, Dr. Lucas Mendes Quiropraxia e CT Lucas Sousa. Cada card mostra o site no computador e no celular. Nos cards da Vespéra e da JBL, a janela do navegador toca a gravação real da rolagem (`media/*-scroll.mp4` e `.webm`), só enquanto o card está na tela. Os celulares da Áurea, Ébano, MOVA+, CT e JBL são montados em HTML (`.mcover`) sobre imagens do próprio site.

## Seção "Por dentro"
Mostra as gravações da Vespéra e da JBL em tamanho grande, com abas, botão de pausa e barra de progresso. Para trocar ou adicionar uma gravação, coloque o vídeo em `media/` e repita o bloco `<video class="inside-video">`, a aba e a lista `.inside-notes` correspondentes em `index.html`, e o endereço em `urls` no `main.js`.

Publicado em https://viewportsites.vercel.app
