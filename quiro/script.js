(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const NS = 'http://www.w3.org/2000/svg';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desktop = matchMedia('(min-width: 981px)');
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = t => t * t * (3 - 2 * t);
  const fmt = n => n.toFixed(1).replace('.', ',');

  /* ---------- Coluna vertebral em SVG (24 vértebras: 7 C, 12 T, 5 L) ---------- */
  const regionOf = i => (i < 7 ? 'cervical' : i < 19 ? 'toracica' : 'lombar');

  function el(name, attrs, parent) {
    const e = document.createElementNS(NS, name);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    parent.appendChild(e);
    return e;
  }

  // curve(t) devolve o deslocamento lateral da vértebra no ponto t (0 = topo, 1 = base)
  function buildSpine(root, { top = 36, span = 520, curve = t => 15 * Math.sin(t * Math.PI * 2.1 - 0.9) * (0.6 + t * 0.5), cord = true } = {}) {
    const N = 24, items = [];
    const cordPath = cord ? el('path', { class: 'cord' }, root) : null;
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);
      const pos = el('g', {}, root);
      const g = el('g', { class: 'vg', 'data-region': regionOf(i) }, pos);
      const w = 22 + t * 34 - (i < 7 ? 2 : 0), h = 14 + t * 4;
      el('ellipse', { class: 'disc', cx: 0, cy: h / 2 + 3.5, rx: w * 0.42, ry: 3.2 }, g);
      el('path', { class: 'v', d: `M${-w / 2 - 7} -2 Q${-w / 2 - 2} -7 ${-w / 2 + 4} -3 L${-w / 2 + 4} 4 L${-w / 2 - 6} 3 Z` }, g);
      el('path', { class: 'v', d: `M${w / 2 + 7} -2 Q${w / 2 + 2} -7 ${w / 2 - 4} -3 L${w / 2 - 4} 4 L${w / 2 + 6} 3 Z` }, g);
      el('rect', { class: 'v', x: -w / 2, y: -h / 2, width: w, height: h, rx: h * 0.42 }, g);
      el('ellipse', { class: 'v', cx: 0, cy: 0, rx: w * 0.13, ry: h * 0.26, style: 'opacity:.55' }, g);
      items.push({ pos, g, t, y: top + t * span });
    }
    const place = (c = curve, jitter = 0) => {
      const xs = items.map(it => 100 + c(it.t));
      items.forEach((it, i) => {
        const x0 = xs[i - 1] ?? xs[i], x1 = xs[i + 1] ?? xs[i];
        const dy = (items[i + 1] ?? it).y - (items[i - 1] ?? it).y || 1;
        const ang = Math.atan2(x1 - x0, dy) * -180 / Math.PI + jitter * Math.sin(i * 2.3);
        it.pos.setAttribute('transform', `translate(${xs[i].toFixed(2)} ${it.y.toFixed(2)}) rotate(${ang.toFixed(2)})`);
      });
      if (cordPath) cordPath.setAttribute('d', 'M' + items.map((it, i) => `${xs[i].toFixed(1)} ${it.y.toFixed(1)}`).join(' L'));
    };
    place();
    return { items, place };
  }

  const scrollSpine = buildSpine($('#spineScroll'));
  const alignSpine = buildSpine($('#alignSpine'), { top: 18, span: 548, cord: false, curve: () => 0 });

  /* ---------- Rolagem suave (Lenis, quando disponível) ---------- */
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new window.Lenis({ lerp: 0.09, smoothWheel: true });
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    const target = id.length > 1 && $(id);
    if (!target) return;
    e.preventDefault();
    closeMenu();
    if (lenis) lenis.scrollTo(target, { offset: -84, duration: 1.4 });
    else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }));

  /* ---------- Entrada do hero ---------- */
  requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.add('ready')));

  /* ---------- Alinhamento guiado pelo scroll ---------- */
  const align = $('#alinhamento');
  const head = $('#head'), shoulders = $('#shoulders'), pelvis = $('#pelvis');
  const rS = $('#rShoulder'), rP = $('#rPelvis'), rL = $('#rPlumb'), meter = $('#meter');
  const phases = $$('#phases li');
  let lastAlign = -1;
  function setAlign(p) {
    if (Math.abs(p - lastAlign) < 0.002) return;
    lastAlign = p;
    const m = 1 - p;
    alignSpine.place(t => m * (26 * Math.sin(t * Math.PI * 1.1 + 0.15) + 7 * Math.sin(t * Math.PI * 3.2)), m * 6);
    head.setAttribute('transform', `translate(${(m * 16).toFixed(2)} 0) rotate(${(-m * 5).toFixed(2)} 100 -22)`);
    shoulders.setAttribute('transform', `translate(${(m * 8).toFixed(2)} 0) rotate(${(m * 6).toFixed(2)} 100 191)`);
    pelvis.setAttribute('transform', `rotate(${(-m * 4).toFixed(2)} 100 598)`);
    rS.textContent = fmt(m * 6);
    rP.textContent = fmt(m * 4);
    rL.textContent = Math.round(m * 18);
    meter.style.transform = `scaleX(${p})`;
    const idx = p < 0.3 ? 0 : p < 0.9 ? 1 : 2;
    phases.forEach((li, i) => li.classList.toggle('on', i === idx));
  }
  setAlign(0);

  /* ---------- Regiões da coluna ---------- */
  const tag = $('#regionTag');
  const names = { cervical: 'Região cervical · C1–C7', toracica: 'Região torácica · T1–T12', lombar: 'Região lombar · L1–L5', all: 'Coluna completa' };
  function setRegion(r) {
    scrollSpine.items.forEach(({ g }) => {
      const on = r === 'all' || g.dataset.region === r;
      g.classList.toggle('lit', on);
      g.classList.toggle('dim', !on);
    });
    tag.textContent = names[r];
  }
  setRegion('all');
  const steps = $$('.step');
  const stepObs = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    steps.forEach(s => s.classList.toggle('on', s === e.target));
    setRegion(e.target.dataset.region);
  }), { rootMargin: '-45% 0px -45% 0px' });
  steps.forEach(s => stepObs.observe(s));

  /* ---------- Método horizontal ---------- */
  const method = $('#metodo'), track = $('#methodTrack'), mBar = $('#methodBar');
  const panelImgs = $$('.panel-img img');
  let travel = 0;
  function sizeMethod() {
    if (desktop.matches && !reduce) {
      travel = Math.max(0, track.scrollWidth - innerWidth);
      method.style.height = `${travel + innerHeight}px`;
    } else {
      travel = 0;
      method.style.height = '';
    }
  }

  /* ---------- Marquee que acelera com o scroll ---------- */
  const mq = $('#track');
  const base = mq.innerHTML;
  while (mq.scrollWidth < innerWidth * 2.5) mq.insertAdjacentHTML('beforeend', base);
  mq.insertAdjacentHTML('beforeend', mq.innerHTML);
  let mx = 0, dir = 1;

  /* ---------- Loop principal ---------- */
  const bar = $('.progress span'), nav = $('#nav');
  const para = $$('[data-speed]');
  let lastY = scrollY, vel = 0;
  function frame() {
    const y = scrollY, vh = innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    const dy = y - lastY;
    lastY = y;
    vel += (dy - vel) * 0.2;
    if (dy) dir = dy > 0 ? 1 : -1;

    bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    nav.classList.toggle('scrolled', y > 30);
    nav.classList.toggle('hide', y > vh && dy > 2 && !$('#links').classList.contains('open'));
    if (dy < -2) nav.classList.remove('hide');

    if (!reduce) {
      for (const n of para) {
        const r = n.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) continue;
        const off = (r.top + r.height / 2 - vh / 2) * +n.dataset.speed;
        n.style.translate = `0 ${off.toFixed(1)}px`;
      }
    }

    const ar = align.getBoundingClientRect();
    if (ar.top < vh && ar.bottom > 0) {
      const p = clamp(-ar.top / (ar.height - vh));
      setAlign(reduce ? 1 : ease(clamp((p - 0.12) / 0.72)));
    }

    if (travel) {
      const r = method.getBoundingClientRect();
      if (r.top < vh && r.bottom > 0) {
        const p = clamp(-r.top / (r.height - vh));
        track.style.transform = `translate3d(${(-p * travel).toFixed(1)}px,0,0)`;
        mBar.style.transform = `scaleX(${p})`;
        for (const img of panelImgs) {
          const pr = img.parentNode.getBoundingClientRect();
          const off = (pr.left + pr.width / 2 - innerWidth / 2) * -0.06;
          img.style.transform = `translate3d(calc(-8% + ${off.toFixed(1)}px),0,0)`;
        }
      }
    }

    if (!reduce) {
      mx -= (0.5 + Math.min(Math.abs(vel), 60) * 0.12) * dir;
      const half = mq.scrollWidth / 2;
      if (mx <= -half) mx += half;
      if (mx > 0) mx -= half;
      mq.style.transform = `translate3d(${mx.toFixed(1)}px,0,0)`;
    }
    requestAnimationFrame(frame);
  }

  sizeMethod();
  addEventListener('resize', () => { sizeMethod(); lastAlign = -1; });
  desktop.addEventListener('change', sizeMethod);
  addEventListener('load', sizeMethod);
  requestAnimationFrame(frame);

  /* ---------- Revelação + contadores ---------- */
  const countUp = node => {
    const end = +node.dataset.count, suf = node.dataset.suffix || '';
    if (reduce) return;
    const t0 = performance.now(), dur = 1600;
    const tick = t => {
      const p = Math.min((t - t0) / dur, 1);
      node.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suf;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const revObs = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    const c = $('[data-count]', e.target);
    if (c) countUp(c);
    revObs.unobserve(e.target);
  }), { threshold: 0.15 });
  $$('.reveal, .clip').forEach(n => revObs.observe(n));

  /* ---------- Menu mobile + link ativo ---------- */
  const burger = $('#burger'), links = $('#links');
  function closeMenu() { links.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }
  burger.addEventListener('click', () => burger.setAttribute('aria-expanded', links.classList.toggle('open')));
  const secObs = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) $$('a', links).forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => secObs.observe(s));

  /* ---------- Depoimentos ---------- */
  const qs = $$('#slider blockquote'), dots = $('#dots');
  let cur = 0, timer;
  qs.forEach((_, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', 'Depoimento ' + (i + 1));
    b.addEventListener('click', () => { show(i); restart(); });
    dots.appendChild(b);
  });
  function show(i) {
    cur = i;
    qs.forEach((q, k) => { q.classList.toggle('on', k === i); q.setAttribute('aria-hidden', k !== i); });
    $$('button', dots).forEach((b, k) => b.classList.toggle('on', k === i));
  }
  const restart = () => { clearInterval(timer); if (!reduce) timer = setInterval(() => show((cur + 1) % qs.length), 6500); };
  show(0); restart();

  /* ---------- Formulário → WhatsApp ---------- */
  const WHATSAPP = '5511999999999'; // troque pelo número real (DDI + DDD + número)
  $('#form').addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target, msg = $('#formMsg');
    const nome = f.nome.value.trim(), tel = f.tel.value.trim();
    const telOk = tel.replace(/\D/g, '').length >= 10;
    f.nome.classList.toggle('err', !nome);
    f.tel.classList.toggle('err', !telOk);
    if (!nome || !telOk) { msg.textContent = 'Preencha seu nome e um telefone com DDD.'; return; }
    msg.textContent = '';
    const text = `Olá! Sou ${nome} (${tel}) e gostaria de agendar uma consulta.${f.msg.value.trim() ? '\n\n' + f.msg.value.trim() : ''}`;
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  });
})();
