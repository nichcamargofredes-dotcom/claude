# Viewport · site de apresentação

Site do estúdio Viewport, de Nicholas Fredes e Matheus Cremasco, na identidade visual da marca: verde institucional `#2E4D3A`, grafite `#0E0F0F`, cinza `#A7A7A0`, off-white `#F7F7F5` e fonte Inter.

HTML, CSS e JS puros, sem build. O hero usa three.js (em `vendor/`) para o "V" em 3D sobre concreto com sombras de folhas. Sirva a pasta com qualquer servidor estático (os módulos ES não abrem via `file://`), por exemplo `npx http-server .`

## Personalizar
- **WhatsApp do formulário:** constante `WHATSAPP` no topo de `main.js` (DDI + DDD + número, só dígitos).
- **Projetos:** cada `<article class="proj">` em `index.html` (link, textos e imagem ou capa).
- **Cores:** variáveis no topo de `styles.css`.
- **Cena 3D:** função `gl` em `main.js` (posição do V, luzes, folhas).

## Projetos no portfólio
CozyPaws, Maison Vespéra, JBL Live Beam 3, Áurea Odontologia, Ébano Barbearia & Lounge, MOVA+ Personal Trainer, Dr. Lucas Mendes Quiropraxia e CT Lucas Sousa. Cada card mostra o site no computador e no celular. Nos cards da Vespéra e da JBL, a janela do navegador toca a gravação real da rolagem (`media/*-scroll.mp4` e `.webm`) enquanto a galeria está na tela. Se o navegador bloquear o vídeo (modo de economia de bateria do iPhone, por exemplo), o card troca para a versão em imagem animada (`media/*-scroll-anim.webp`). Os celulares da Áurea, Ébano, MOVA+, CT e JBL são montados em HTML (`.mcover`) sobre imagens do próprio site.

Publicado em https://viewportsites.vercel.app
