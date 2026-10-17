(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const NS = 'http://www.w3.org/2000/svg';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Coluna vertebral em SVG (24 vértebras) ---------- */
  const regionOf = i => (i < 7 ? 'cervical' : i < 19 ? 'toracica' : 'lombar');

  function buildSpine(svg) {
    const N = 24, top = 36, span = 520;
    const pts = [];
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);
      // curvas naturais: lordose cervical, cifose torácica, lordose lombar
      const x = 100 + 15 * Math.sin(t * Math.PI * 2.1 - 0.9) * (0.6 + t * 0.5);
      pts.push({ x, y: top + t * span, t });
    }
    const el = (n, a, p) => {
      const e = document.createElementNS(NS, n);
      for (const k in a) e.setAttribute(k, a[k]);
      (p || svg).appendChild(e);
      return e;
    };
    // medula
    el('path', { class: 'cord', d: 'M' + pts.map(p => `${(p.x + 0).toFixed(1)} ${p.y.toFixed(1)}`).join(' L') });

    pts.forEach((p, i) => {
      const next = pts[i + 1] || p, prev = pts[i - 1] || p;
      const ang = Math.atan2(next.y - prev.y, next.x - prev.x) * 180 / Math.PI - 90;
      const w = 22 + p.t * 34 - (i < 7 ? 2 : 0);
      const h = 14 + p.t * 4;
      const pos = el('g', { transform: `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${ang.toFixed(1)})` });
      const inner = el('g', { class: 'vg', 'data-region': regionOf(i), style: `--i:${i}` }, pos);
      // disco intervertebral
      el('ellipse', { class: 'disc', cx: 0, cy: h / 2 + 3.5, rx: w * 0.42, ry: 3.2 }, inner);
      // processos laterais e espinhoso
      el('path', { class: 'v', d: `M${-w / 2 - 7} -2 Q${-w / 2 - 2} -7 ${-w / 2 + 4} -3 L${-w / 2 + 4} 4 L${-w / 2 - 6} 3 Z` }, inner);
      el('path', { class: 'v', d: `M${w / 2 + 7} -2 Q${w / 2 + 2} -7 ${w / 2 - 4} -3 L${w / 2 - 4} 4 L${w / 2 + 6} 3 Z` }, inner);
      el('rect', { class: 'v', x: -w / 2, y: -h / 2, width: w, height: h, rx: h * 0.42 }, inner);
      el('ellipse', { class: 'v', cx: 0, cy: 0, rx: w * 0.13, ry: h * 0.26, style: 'opacity:.55' }, inner);
    });
    return $$('.vg', svg);
  }

  const heroV = buildSpine($('#spineHero'));
  const scrollV = buildSpine($('#spineScroll'));
  buildSpine($('#spineCta'));

  /* ---------- Região destacada ao rolar ---------- */
  const tag = $('#regionTag');
  const names = { cervical: 'Região cervical · C1–C7', toracica: 'Região torácica · T1–T12', lombar: 'Região lombar · L1–L5', all: 'Coluna completa' };
  function setRegion(r) {
    scrollV.forEach(v => {
      const on = r === 'all' || v.dataset.region === r;
      v.classList.toggle('lit', on && r !== 'all' ? true : r === 'all');
      v.classList.toggle('dim', !on);
    });
    tag.textContent = names[r];
  }
  setRegion('all');
  const steps = $$('.step');
  const stepObs = new IntersectionObserver(es => {
    es.forEach(e => {
      if (e.isIntersecting) {
        steps.forEach(s => s.classList.toggle('on', s === e.target));
        setRegion(e.target.dataset.region);
      }
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  steps.forEach(s => stepObs.observe(s));

  /* ---------- Scroll: progresso, nav, parallax ---------- */
  const bar = $('.progress span'), nav = $('#nav');
  const hero = $('#spineHero'), cta = $('#spineCta'), ctaSec = $('.cta');
  let ticking = false;
  function onScroll() {
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    nav.classList.toggle('scrolled', y > 30);
    if (!reduce) {
      if (y < innerHeight * 1.2) hero.style.transform = `translateY(${y * 0.08}px) rotate(${y * 0.012}deg)`;
      const r = ctaSec.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) {
        const p = (innerHeight - r.top) / (innerHeight + r.height);
        cta.style.transform = `translateY(calc(-50% + ${(p - 0.5) * -80}px)) rotate(${8 + p * 10}deg)`;
      }
    }
    ticking = false;
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* mouse parallax no hero (desktop) */
  const hv = $('#heroVisual');
  if (!reduce && matchMedia('(hover:hover)').matches) {
    $('.hero').addEventListener('mousemove', e => {
      const x = (e.clientX / innerWidth - 0.5), y = (e.clientY / innerHeight - 0.5);
      $('.halo', hv).style.translate = `${x * 24}px ${y * 18}px`;
      $('.chip-a', hv).style.translate = `${x * -18}px ${y * -12}px`;
      $('.chip-b', hv).style.translate = `${x * 22}px ${y * 14}px`;
    });
  }

  /* ---------- Reveal + contadores ---------- */
  const countUp = el => {
    const end = +el.dataset.count, suf = el.dataset.suffix || '';
    if (reduce) { el.textContent = end + suf; return; }
    const t0 = performance.now(), dur = 1600;
    const tick = t => {
      const p = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suf;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const revObs = new IntersectionObserver(es => {
    es.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      const c = $('[data-count]', e.target);
      if (c) countUp(c);
      revObs.unobserve(e.target);
    });
  }, { threshold: 0.15 });
  $$('.reveal').forEach(el => revObs.observe(el));

  /* ---------- Menu mobile ---------- */
  const burger = $('#burger'), links = $('#links');
  const closeMenu = () => { links.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); };
  burger.addEventListener('click', () => {
    const o = links.classList.toggle('open');
    burger.setAttribute('aria-expanded', o);
  });
  $$('a', links).forEach(a => a.addEventListener('click', closeMenu));

  /* link ativo */
  const secObs = new IntersectionObserver(es => {
    es.forEach(e => {
      if (e.isIntersecting) $$('a', links).forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => secObs.observe(s));

  /* ---------- Depoimentos ---------- */
  const qs = $$('#slider blockquote'), dots = $('#dots');
  let cur = 0, timer;
  qs.forEach((_, i) => {
    const b = document.createElement('button');
    b.setAttribute('aria-label', 'Depoimento ' + (i + 1));
    b.addEventListener('click', () => { show(i); restart(); });
    dots.appendChild(b);
  });
  function show(i) {
    cur = i;
    qs.forEach((q, k) => q.classList.toggle('on', k === i));
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
    f.nome.classList.toggle('err', !nome);
    f.tel.classList.toggle('err', tel.replace(/\D/g, '').length < 10);
    if (!nome || tel.replace(/\D/g, '').length < 10) { msg.textContent = 'Preencha seu nome e um telefone válido.'; return; }
    msg.textContent = '';
    const text = `Olá! Sou ${nome} (${tel}) e gostaria de agendar uma consulta.${f.msg.value.trim() ? '\n\n' + f.msg.value.trim() : ''}`;
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  });
})();
