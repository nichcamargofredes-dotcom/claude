# Viewport · site de apresentação

Site do estúdio Viewport, de Nicholas Fredes e Matheus Cremasco, na identidade visual da marca: verde institucional `#2E4D3A`, grafite `#0E0F0F`, cinza `#A7A7A0`, off-white `#F7F7F5` e fonte Inter.

HTML, CSS e JS puros, sem build. O hero usa three.js (em `vendor/`) para o "V" em 3D sobre concreto com sombras de folhas. Sirva a pasta com qualquer servidor estático (os módulos ES não abrem via `file://`), por exemplo `npx http-server .`

## Personalizar
- **WhatsApp do formulário:** constante `WHATSAPP` no topo de `main.js` (DDI + DDD + número, só dígitos).
- **Projetos:** cada `<article class="proj">` em `index.html` (link, textos e imagem ou capa).
- **Cores:** variáveis no topo de `styles.css`.
- **Cena 3D:** função `gl` em `main.js` (posição do V, luzes, folhas).

## Projetos no portfólio
CozyPaws, Maison Vespéra, Gazu, JBL Live Beam 3, Áurea Odontologia, Ébano Barbearia & Lounge, MOVA+ Personal Trainer e Dr. Lucas Mendes Quiropraxia. Cada card mostra o site no computador e no celular. Nos cards da Vespéra, da Gazu e da JBL, a janela do navegador toca a gravação real da rolagem (`media/*-scroll.mp4` e `.webm`) enquanto a galeria está na tela. Se o navegador bloquear o vídeo (modo de economia de bateria do iPhone, por exemplo), o card troca para a versão em imagem animada (`media/*-scroll-anim.webp`). Os celulares da Áurea, Ébano, MOVA+ e JBL são montados em HTML (`.mcover`) sobre imagens do próprio site.

## Versão em inglês
`en/index.html` é a mesma página traduzida, com preço em dólar e uma nota de que a Viewport é um estúdio brasileiro (por isso os projetos mostrados estão em português). Ela usa os mesmos `styles.css`, `main.js`, imagens e vídeos da pasta principal. Os textos do script (menu, formulário e mensagem do WhatsApp) mudam pelo `lang` da página. O link "EN"/"PT" no menu troca de idioma. Ao mudar um texto ou um projeto em `index.html`, faça a mesma mudança em `en/index.html`.

Publicado em https://viewportsites.vercel.app
