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

  let W = 0, H = 0, dpr = 1, fit = { s: 1, x: 0, y: 0 };
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    W = stage.clientWidth; H = stage.clientHeight;
    for (const c of [bg, fg]) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); }
    // Cobre a tela em telas largas; em telas estreitas limita o zoom para o frasco ocupar ~50% da largura
    let s = Math.max(W / VW, H / VH);
    s = Math.min(s, (W * 1.6) / VW);
    s = Math.max(s, W / VW);
    fit = { s, x: (W - VW * s) / 2, y: H / 2 - (VH / 2) * s };
    draw(true);
  }

  const rgb = (a, o) => `rgb(${a[o]},${a[o + 1]},${a[o + 2]})`;
  const rgba = (a, o, al) => `rgba(${a[o]},${a[o + 1]},${a[o + 2]},${al})`;

  let target = 0, cur = 0, lastDrawn = -1;
  function draw(force) {
    const n = Math.max(0, Math.min(FRAMES - 1, Math.round(cur)));
    const photoAlpha = photo ? Math.max(0, 1 - cur / 1.5) : 0;
    const key = n * 10 + Math.round(photoAlpha * 9);
    if (!force && key === lastDrawn) return;
    lastDrawn = key;

    const { s, x, y } = fit;
    const fw = VW * s, fh = VH * s;
    const gap = fh < H - 1;
    const e = edges && edges[n];

    bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (gap && e) {
      const g = bctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, rgb(e, 0)); g.addColorStop(y / H, rgb(e, 0));
      g.addColorStop((y + fh) / H, rgb(e, 3)); g.addColorStop(1, rgb(e, 3));
      bctx.fillStyle = g;
    } else {
      bctx.fillStyle = '#a995b3';
    }
    bctx.fillRect(0, 0, W, H);

    const fi = nearest(n);
    if (fi >= 0) bctx.drawImage(frames[fi], x, y, fw, fh);
    if (photoAlpha > 0) {
      bctx.save();
      bctx.beginPath(); bctx.rect(x, y, fw, fh); bctx.clip();
      bctx.globalAlpha = fi >= 0 ? photoAlpha : 1;
      bctx.drawImage(photo, x + PHOTO.x * s, y + PHOTO.y * s, PHOTO.w * PHOTO.s * s, PHOTO.h * PHOTO.s * s);
      bctx.restore();
    }

    // Frente: copia o fundo e mantém só o que a máscara marca (frasco, tampa, ingredientes)
    fctx.setTransform(1, 0, 0, 1, 0, 0);
    fctx.clearRect(0, 0, fg.width, fg.height);
    fctx.globalCompositeOperation = 'source-over';
    fctx.drawImage(bg, 0, 0);
    fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    fctx.globalCompositeOperation = 'destination-in';
    const usePhotoMask = photoMask && (photoAlpha > 0.5 || fi < 0);
    if (usePhotoMask) {
      fctx.drawImage(photoMask, x + PHOTO.x * s, y + PHOTO.y * s, PHOTO.w * PHOTO.s * s, PHOTO.h * PHOTO.s * s);
    } else if (fi >= 0) {
      fctx.drawImage(masks[fi], x, y, fw, fh);
    }
    fctx.globalCompositeOperation = 'source-over';

    // Em telas estreitas o vídeo não preenche a altura: esfuma as bordas no fundo
    if (gap && e) {
      const f = Math.min(120, fh * 0.3);
      for (const ctx of [bctx, fctx]) {
        const top = ctx.createLinearGradient(0, y, 0, y + f);
        const bot = ctx.createLinearGradient(0, y + fh - f, 0, y + fh);
        if (ctx === fctx) {
          ctx.globalCompositeOperation = 'destination-out';
          top.addColorStop(0, 'rgba(0,0,0,1)'); top.addColorStop(1, 'rgba(0,0,0,0)');
          bot.addColorStop(0, 'rgba(0,0,0,0)'); bot.addColorStop(1, 'rgba(0,0,0,1)');
        } else {
          top.addColorStop(0, rgba(e, 0, 1)); top.addColorStop(1, rgba(e, 0, 0));
          bot.addColorStop(0, rgba(e, 3, 0)); bot.addColorStop(1, rgba(e, 3, 1));
        }
        ctx.fillStyle = top; ctx.fillRect(0, y - 1, W, f + 1);
        ctx.fillStyle = bot; ctx.fillRect(0, y + fh - f, W, f + 1);
        ctx.globalCompositeOperation = 'source-over';
      }
    }
  }

  function progress() {
    const r = hero.getBoundingClientRect();
    const total = hero.offsetHeight - stage.clientHeight;
    return Math.max(0, Math.min(1, -r.top / total));
  }

  let p = 0;
  function onScroll() {
    p = progress();
    target = p * (FRAMES - 1);
  }

  function updateOverlay() {
    const q = cur / (FRAMES - 1);
    for (const word of words) {
      word.style.transform = `translate(-50%, -50%) scale(${1 + q * 0.14})`;
      word.style.letterSpacing = `${-0.015 + q * 0.04}em`;
    }
    if (bar) bar.style.transform = `scaleY(${q})`;
    for (const c of caps) {
      const on = q >= +c.dataset.from && q < +c.dataset.to;
      c.classList.toggle('is-off', !on);
    }
  }

  function tick() {
    const k = reduce ? 1 : 0.14;
    cur += (target - cur) * k;
    if (Math.abs(target - cur) < 0.01) cur = target;
    draw(false);
    updateOverlay();
    requestAnimationFrame(tick);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', resize);
  resize(); onScroll(); cur = target; updateOverlay();
  requestAnimationFrame(tick);

  /* ---------- Cabeçalho ---------- */
  const top = document.getElementById('top');
  const setTop = () => top.classList.toggle('is-solid', hero.getBoundingClientRect().bottom < 80);
  window.addEventListener('scroll', setTop, { passive: true }); setTop();

  /* ---------- Revelações e parallax ---------- */
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
  }, { rootMargin: '0px 0px -10% 0px' });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  const ritualImg = document.querySelector('.ritual__media img');
  const ritual = document.querySelector('.ritual');
  const bottle = document.querySelector('.buy__bottle');
  const buy = document.querySelector('.buy__visual');
  const noteImgs = [...document.querySelectorAll('.note__img img')];
  if (!reduce) {
    const parallax = () => {
      const vh = innerHeight;
      const rr = ritual.getBoundingClientRect();
      if (rr.bottom > 0 && rr.top < vh) {
        const t = (rr.top + rr.height / 2 - vh / 2) / vh;
        ritualImg.style.transform = `translateY(${t * -8}%)`;
      }
      const br = buy.getBoundingClientRect();
      if (br.bottom > 0 && br.top < vh) {
        const t = (br.top + br.height / 2 - vh / 2) / vh;
        bottle.style.transform = `translateY(${t * 40}px) rotate(${t * -6}deg)`;
      }
      for (const img of noteImgs) {
        const r = img.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) continue;
        const t = (r.top + r.height / 2 - vh / 2) / vh;
        img.style.transform = `scale(1.08) translateY(${t * -4}%)`;
      }
    };
    window.addEventListener('scroll', parallax, { passive: true });
    parallax();
  }

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
