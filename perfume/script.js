(() => {
  document.documentElement.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Rolagem suave ---------- */
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ lerp: 0.085, smoothWheel: true });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const target = document.querySelector(a.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: 0, duration: 1.6 });
      });
    });
  }

  /* ---------- Hero: quadros do vídeo controlados pelo scroll ---------- */
  const FRAMES = 192;
  const VW = 1280, VH = 720;
  // Onde a foto original (1732×1154) cai sobre o primeiro quadro do vídeo, em coordenadas do vídeo
  const PHOTO = { x: 5.06, y: -63.1, s: 0.7316, w: 1732, h: 1154 };

  const hero = document.querySelector('.hero');
  const stage = hero.querySelector('.hero__stage');
  const bg = hero.querySelector('.hero__bg');
  const fg = hero.querySelector('.hero__fg');
  const words = [...hero.querySelectorAll('.hero__word')];
  const bar = hero.querySelector('.hero__progress span');
  const caps = [...hero.querySelectorAll('[data-from]')];
  const bctx = bg.getContext('2d');
  const fctx = fg.getContext('2d');

  const pad = (n) => String(n).padStart(3, '0');
  const frames = new Array(FRAMES);
  const masks = new Array(FRAMES);
  let edges = null;
  let photo = null, photoMask = null;

  const load = (src) => new Promise((res) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => res(img);
    img.onerror = () => res(null);
    img.src = src;
  });

  fetch('media/edges.json').then((r) => r.json()).then((d) => { edges = d; draw(true); }).catch(() => {});
  Promise.all([load('media/hero.webp'), load('media/hero-mask.webp')]).then(([p, m]) => {
    photo = p; photoMask = m; draw(true);
    loadFrames();
  });

  // Carrega primeiro um quadro a cada 8, depois preenche os intervalos, para o scroll responder cedo
  function loadFrames() {
    const order = [];
    for (const step of [8, 4, 2, 1]) {
      for (let i = 0; i < FRAMES; i += step) if (!order.includes(i)) order.push(i);
    }
    let next = 0;
    const worker = async () => {
      while (next < order.length) {
        const i = order[next++];
        const [f, m] = await Promise.all([load(`media/frames/${pad(i)}.webp`), load(`media/masks/${pad(i)}.webp`)]);
        frames[i] = f; masks[i] = m;
        if (Math.abs(i - Math.round(cur)) < 8) draw(true);
      }
    };
    for (let k = 0; k < 6; k++) worker();
  }

  const nearest = (i) => {
    for (let d = 0; d < FRAMES; d++) {
      if (frames[i - d] && masks[i - d]) return i - d;
      if (frames[i + d] && masks[i + d]) return i + d;
    }
    return -1;
  };

  // Painéis de informação: o frasco se afasta para o lado oposto ao do texto
  const panels = [...hero.querySelectorAll('.panel')].map((el) => ({
    el,
    side: el.classList.contains('panel--left') ? 1 : el.classList.contains('panel--right') ? -1 : 0,
    center: 0,
  }));

  const off = document.createElement('canvas');
  const octx = off.getContext('2d');

  let W = 0, H = 0, dpr = 1, base = 1, mobile = false;
  let fit = { s: 1, x: 0, y: 0 };
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    W = stage.clientWidth; H = stage.clientHeight;
    for (const c of [bg, fg, off]) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); }
    mobile = W < 861;
    // Abertura: cobre a tela em telas largas; em telas estreitas o frasco ocupa ~50% da largura
    base = Math.max(W / VW, H / VH);
    base = Math.min(base, (W * 1.6) / VW);
    base = Math.max(base, W / VW);
    for (const p of panels) {
      const r = p.el.getBoundingClientRect();
      p.center = r.top + window.scrollY + r.height / 2;
    }
    onScroll();
    lay.side = lay.sideT; lay.zoom = lay.zoomT;
    draw(true);
  }

  // Posição e tamanho do frasco: z = 0 no centro, z = 1 ao lado do texto; side = +1 direita, -1 esquerda
  const P = { x: 640, y: 380 }; // centro do frasco no vídeo
  function layout(side, z) {
    const s0 = base * 1.035; // sobra nas bordas para a flutuação não mostrar o fim do quadro
    const x0 = W / 2, y0 = H / 2 + (P.y - VH / 2) * s0;
    let s1, x1, y1;
    if (mobile) { s1 = (W * 1.1) / VW; x1 = W / 2; y1 = H * 0.26; }
    else { s1 = s0 * 0.62; x1 = W / 2 + side * W * 0.21; y1 = H / 2; }
    // Flutuação contínua: o frasco nunca fica parado, mesmo sem rolar a página
    const t = performance.now() / 1000;
    const bob = reduce ? 0 : Math.sin(t * 1.1) * H * 0.009;
    const breathe = reduce ? 1 : 1 + Math.sin(t * 0.7) * 0.008;
    const s = (s0 + (s1 - s0) * z) * breathe;
    const px = x0 + (x1 - x0) * z, py = y0 + (y1 - y0) * z + bob;
    fit = { s, x: px - P.x * s, y: py - P.y * s };
    for (const w of words) {
      // Na frente do frasco, um pouco abaixo do meio da tela
      w.style.top = `${H * 0.58}px`;
      w.style.left = `${W / 2}px`;
    }
  }

  const rgb = (a, o) => `rgb(${a[o]},${a[o + 1]},${a[o + 2]})`;
  const clamp01 = (v) => Math.max(0, Math.min(1, v));

  let target = 0, cur = 0, lastKey = '';
  const lay = { side: 0, zoom: 0, sideT: 0, zoomT: 0 };

  function feather(ctx, x, y, fw, fh) {
    // Apaga suavemente as bordas do quadro que ficam dentro da tela
    ctx.globalCompositeOperation = 'destination-out';
    const fx = Math.min(160, fw * 0.2), fy = Math.min(140, fh * 0.25);
    const band = (x0, y0, x1, y1, rx, ry, rw, rh) => {
      const g = ctx.createLinearGradient(x0, y0, x1, y1);
      g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(rx, ry, rw, rh);
    };
    if (x > 0.5) band(x, 0, x + fx, 0, x - 1, y - 1, fx + 1, fh + 2);
    if (x + fw < W - 0.5) band(x + fw, 0, x + fw - fx, 0, x + fw - fx, y - 1, fx + 1, fh + 2);
    if (y > 0.5) band(0, y, 0, y + fy, x - 1, y - 1, fw + 2, fy + 1);
    if (y + fh < H - 0.5) band(0, y + fh, 0, y + fh - fy, x - 1, y + fh - fy, fw + 2, fy + 1);
    ctx.globalCompositeOperation = 'source-over';
  }

  function draw(force) {
    const n = Math.max(0, Math.min(FRAMES - 1, Math.round(cur)));
    const photoAlpha = photo ? Math.max(0, 1 - cur / 1.5) : 0;
    layout(lay.side, lay.zoom);
    const { s, x, y } = fit;
    const key = `${n}|${photoAlpha.toFixed(2)}|${s.toFixed(4)}|${x.toFixed(1)}|${y.toFixed(1)}`;
    if (!force && key === lastKey) return;
    lastKey = key;

    const fw = VW * s, fh = VH * s;
    const e = edges && edges[n];
    const fi = nearest(n);

    // Fundo liso nas cores das bordas do quadro atual
    bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (e) {
      const g = bctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, rgb(e, 0)); g.addColorStop(clamp01(y / H), rgb(e, 0));
      g.addColorStop(clamp01((y + fh) / H), rgb(e, 3)); g.addColorStop(1, rgb(e, 3));
      bctx.fillStyle = g;
    } else {
      bctx.fillStyle = '#a995b3';
    }
    bctx.fillRect(0, 0, W, H);

    // Quadro (e a foto original no início) num canvas à parte, com as bordas esfumadas
    octx.setTransform(1, 0, 0, 1, 0, 0);
    octx.clearRect(0, 0, off.width, off.height);
    octx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (fi >= 0) octx.drawImage(frames[fi], x, y, fw, fh);
    if (photoAlpha > 0) {
      octx.save();
      octx.beginPath(); octx.rect(x, y, fw, fh); octx.clip();
      octx.globalAlpha = fi >= 0 ? photoAlpha : 1;
      octx.drawImage(photo, x + PHOTO.x * s, y + PHOTO.y * s, PHOTO.w * PHOTO.s * s, PHOTO.h * PHOTO.s * s);
      octx.restore();
    }
    feather(octx, x, y, fw, fh);
    bctx.setTransform(1, 0, 0, 1, 0, 0);
    bctx.drawImage(off, 0, 0);

    // Frente: o mesmo quadro, só onde a máscara marca (frasco, tampa, ingredientes)
    fctx.setTransform(1, 0, 0, 1, 0, 0);
    fctx.clearRect(0, 0, fg.width, fg.height);
    fctx.drawImage(off, 0, 0);
    fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    fctx.globalCompositeOperation = 'destination-in';
    if (photoMask && (photoAlpha > 0.5 || fi < 0)) {
      fctx.drawImage(photoMask, x + PHOTO.x * s, y + PHOTO.y * s, PHOTO.w * PHOTO.s * s, PHOTO.h * PHOTO.s * s);
    } else if (fi >= 0) {
      fctx.drawImage(masks[fi], x, y, fw, fh);
    }
    fctx.globalCompositeOperation = 'source-over';
  }

  function progress() {
    const r = hero.getBoundingClientRect();
    const total = hero.offsetHeight - stage.clientHeight;
    return Math.max(0, Math.min(1, -r.top / total));
  }

  // Ida e volta sem pausa: o vídeo avança até o meio do site e volta ao frasco fechado no painel de compra
  function frameAt(p) {
    if (p < 0.5) return p / 0.5;
    return 1 - clamp01((p - 0.5) / 0.44);
  }

  let scrollP = 0;
  function onScroll() {
    scrollP = progress();
    target = frameAt(scrollP) * (FRAMES - 1);
    // Interpola o lado e o zoom entre os centros dos painéis
    const c = window.scrollY + H / 2;
    let side = 0, zoom = 0;
    if (panels.length) {
      if (c <= panels[0].center) { side = panels[0].side; zoom = panels[0].side ? 1 : 0; }
      else if (c >= panels[panels.length - 1].center) { const l = panels[panels.length - 1]; side = l.side; zoom = l.side ? 1 : 0; }
      else {
        for (let i = 0; i < panels.length - 1; i++) {
          const A = panels[i], B = panels[i + 1];
          if (c >= A.center && c < B.center) {
            // fica parado perto do centro de cada painel e se move na passagem
            let t = (c - A.center) / (B.center - A.center);
            t = clamp01((t - 0.2) / 0.6); t = t * t * (3 - 2 * t);
            side = A.side + (B.side - A.side) * t;
            zoom = (A.side ? 1 : 0) + ((B.side ? 1 : 0) - (A.side ? 1 : 0)) * t;
            break;
          }
        }
      }
    }
    lay.sideT = side; lay.zoomT = zoom;
  }

  function updateOverlay() {
    const q = cur / (FRAMES - 1);
    // O título aparece na abertura e some quando o frasco vai para o lado
    const fade = clamp01(1 - lay.zoom * 2.2);
    for (const word of words) {
      word.style.transform = `translate(-50%, -50%) scale(${(fit.s / base) * (1 + q * 0.3)})`;
      word.style.opacity = fade;
    }
    if (bar) bar.style.transform = `scaleY(${scrollP})`;
    for (const c of caps) {
      const on = scrollP >= +c.dataset.from && scrollP < +c.dataset.to;
      c.classList.toggle('is-off', !on);
    }
  }

  function tick() {
    const k = reduce ? 1 : 0.14;
    cur += (target - cur) * k;
    if (Math.abs(target - cur) < 0.01) cur = target;
    const k2 = reduce ? 1 : 0.1;
    lay.side += (lay.sideT - lay.side) * k2;
    lay.zoom += (lay.zoomT - lay.zoom) * k2;
    if (Math.abs(lay.sideT - lay.side) < 0.001) lay.side = lay.sideT;
    if (Math.abs(lay.zoomT - lay.zoom) < 0.001) lay.zoom = lay.zoomT;
    draw(false);
    updateOverlay();
    requestAnimationFrame(tick);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', resize);
  resize(); cur = target; updateOverlay();
  requestAnimationFrame(tick);

  /* ---------- Cabeçalho ---------- */
  const top = document.getElementById('top');
  const setTop = () => top.classList.toggle('is-solid', hero.getBoundingClientRect().bottom < 80);
  window.addEventListener('scroll', setTop, { passive: true }); setTop();

  /* ---------- Revelações ---------- */
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
  }, { rootMargin: '0px 0px -10% 0px' });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  /* ---------- Compra e newsletter ---------- */
  const toast = document.getElementById('toast');
  let toastT;
  const say = (msg) => {
    toast.textContent = msg; toast.classList.add('is-on');
    clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove('is-on'), 2600);
  };
  const price = document.getElementById('price');
  document.querySelectorAll('input[name="size"]').forEach((r) => {
    r.addEventListener('change', () => { price.textContent = `R$ ${r.dataset.price}`; });
  });
  document.getElementById('add').addEventListener('click', () => {
    const sel = document.querySelector('input[name="size"]:checked');
    say(`Vespéra ${sel.value} ml adicionado à sacola`);
  });
  const news = document.getElementById('news');
  const email = document.getElementById('email');
  const msg = document.getElementById('news-msg');
  news.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!email.checkValidity() || !email.value) { msg.textContent = 'Digite um e-mail válido, como nome@email.com.'; return; }
    msg.textContent = 'Inscrição confirmada. Você vai receber nossas novidades.';
    email.value = '';
  });
})();
