/* GAZU · página: rolagem suave, animações, arara, painel da peça e sacola */
(function () {
  'use strict';
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const CATALOG = window.GAZU_GARMENTS ? window.GAZU_GARMENTS.CATALOG : [];
  const brl = n => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const parcelas = p => { const n = p >= 300 ? 6 : 3; return `ou ${n}x de ${brl(p / n)} sem juros`; };
  const pad = n => String(n).padStart(2, '0');

  gsap.registerPlugin(ScrollTrigger);

  /* ----------------------------------------------------- rolagem */
  let lenis = null;
  if (!reduced && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.09, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  function goScroll(target, opts) {
    opts = opts || {};
    if (lenis) { lenis.scrollTo(target, { duration: opts.duration || 1.4, offset: opts.offset || 0, onComplete: opts.onComplete }); return; }
    const y = typeof target === 'number' ? target : target.getBoundingClientRect().top + window.scrollY + (opts.offset || 0);
    window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
    if (opts.onComplete) setTimeout(opts.onComplete, reduced ? 50 : 900);
  }
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    const el = id.length > 1 && document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    goScroll(id === '#topo' ? 0 : el);
  }));

  /* -------------------------------------------------- cabeçalho */
  const hdr = $('.hdr'), hero = $('.hero');
  let lastY = window.scrollY, fixed = false, pdpOpen = false;
  function onScroll(y) {
    const past = y > hero.offsetHeight - 10;
    if (past !== fixed) {
      fixed = past;
      hdr.style.transition = 'none';
      hdr.classList.toggle('is-fixed', past);
      hdr.classList.toggle('is-hidden', past);
      void hdr.offsetHeight; hdr.style.transition = '';
    } else if (past) {
      if (y > lastY + 3 || pdpOpen) hdr.classList.add('is-hidden');
      else if (y < lastY - 3) hdr.classList.remove('is-hidden');
    }
    lastY = y;
  }
  if (lenis) lenis.on('scroll', e => onScroll(e.scroll)); else window.addEventListener('scroll', () => onScroll(window.scrollY), { passive: true });

  /* ---------------------------------------------------- toast */
  const toastEl = $('#toast'); let toastT = 0;
  function toast(msg) {
    toastEl.textContent = msg; toastEl.classList.add('is-on');
    clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('is-on'), 2800);
  }

  /* ----------------------------------------------------- hero */
  const letters = $$('.hero__l > span'), wraps = $$('.hero__l'), model = $('.hero__model'), walk = $('.hero__walk');
  const intro = [$$('.hero__tag span'), $$('.hero__season span'), $('.hero__cta'), $$('.hdr > *')];
  if (!reduced) {
    const tl = gsap.timeline({ delay: 0.1 });
    tl.fromTo(letters, { y: 0, yPercent: 105 }, { y: 0, yPercent: 0, duration: 1.35, ease: 'expo.out', stagger: 0.085 }, 0)
      .fromTo(walk, { opacity: 0, x: -70 }, { opacity: 1, x: 0, duration: 1.7, ease: 'power3.out' }, 0.3)
      .fromTo(intro.flat(), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.045, clearProps: 'transform' }, 0.65);
    root.classList.add('is-ready');

    // ao rolar: letreiro se abre, o modelo segue caminhando
    const st = { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.6 };
    gsap.timeline({ scrollTrigger: st })
      .to(wraps[0], { xPercent: -34, ease: 'none' }, 0).to(wraps[1], { xPercent: -14, ease: 'none' }, 0)
      .to(wraps[2], { xPercent: 14, ease: 'none' }, 0).to(wraps[3], { xPercent: 34, ease: 'none' }, 0)
      .to('.hero__word', { yPercent: 22, ease: 'none' }, 0)
      .to(model, { x: () => window.innerWidth * 0.07, yPercent: -6, scale: 1.05, ease: 'none' }, 0)
      .to(['.hero__tag', '.hero__season', '.hero__cta'], { opacity: 0, y: -40, ease: 'none' }, 0);

    if (fine) {
      const img = $('.hero__model img'), word = $('.hero__word');
      const qx = gsap.quickTo(img, 'x', { duration: 1.2, ease: 'power3' }), qy = gsap.quickTo(img, 'y', { duration: 1.2, ease: 'power3' });
      const wx = gsap.quickTo(word, 'x', { duration: 1.6, ease: 'power3' }), wy = gsap.quickTo(word, 'y', { duration: 1.6, ease: 'power3' });
      hero.addEventListener('pointermove', e => {
        const nx = e.clientX / window.innerWidth - 0.5, ny = e.clientY / window.innerHeight - 0.5;
        qx(nx * 18); qy(ny * 10); wx(nx * -14); wy(ny * -8);
      });
    }
  } else {
    root.classList.add('is-ready');
  }

  /* ---------------------------------------------------- arara */
  const railSec = $('.rail'), stage = $('.rail__stage'), track = $('.rail__track');
  const peek = $('.rail__peek'), bar = $('.rail__bar i'), list = $('.rail__list');
  $('.rail__tot').textContent = pad(CATALOG.length);
  let rail = null, peekItem = null;

  function fallback() {
    railSec.classList.add('is-fallback', 'is-ready');
    const ul = document.createElement('ul'); ul.className = 'rail__fallback';
    CATALOG.forEach((spec, i) => {
      const li = document.createElement('li');
      li.innerHTML = `<button type="button"><b>${spec.name}</b><span>${brl(spec.price)}</span></button>`;
      li.querySelector('button').addEventListener('click', () => openPdp({ i, spec }));
      ul.appendChild(li);
    });
    stage.appendChild(ul);
  }

  try {
    if (!window.THREE || !window.GAZU_RAIL) throw new Error('3D indisponível');
    rail = new window.GAZU_RAIL.Rail(stage, {
      onItem(it) {
        const li = document.createElement('li'), b = document.createElement('button');
        b.type = 'button'; b.textContent = `${it.spec.name}, ${brl(it.spec.price)}`;
        b.addEventListener('focus', () => { rail.focusItem(it.i); jumpTo(it.i, true); });
        b.addEventListener('blur', () => rail.focusItem(-1));
        b.addEventListener('click', () => rail.open(it.i));
        li.appendChild(b); list.appendChild(li);
      },
      onReady() { railSec.classList.add('is-ready'); shoot(); },
      onCenter(i, n) { $('.rail__cur').textContent = pad(i + 1); $('.rail__tot').textContent = pad(n); },
      onHover(it) { peekItem = it; if (it) { $('b', peek).textContent = it.spec.name; $('span', peek).textContent = brl(it.spec.price); } peek.classList.toggle('is-on', !!it); },
      onOpen(it) { openPdp(it); },
      onClose() { closePdp(); },
    }).init();
  } catch (err) {
    console.warn(err);
    rail = null;
    fallback();
  }

  if (rail) {
    let started = false;
    const start = () => {
      if (started) return; started = true;
      Promise.all([
        document.fonts.load('800 40px "Archivo Variable"'), document.fonts.load('40px "UnifrakturMaguntia"'), document.fonts.load('500 40px "IBM Plex Mono"'),
      ]).catch(() => {}).then(() => rail.load(CATALOG)).catch(err => { console.warn(err); fallback(); });
    };
    setTimeout(start, 1500);
    ScrollTrigger.create({ trigger: railSec, start: 'top 220%', once: true, onEnter: start });
    gsap.ticker.add(() => {
      const it = peekItem || (rail.active >= 0 ? rail.items[rail.active] : null);
      if (!it) return;
      const y = Math.min(stage.clientHeight - 120, it.sBot + 16);
      peek.style.setProperty('--px', Math.max(90, Math.min(stage.clientWidth - 90, it.sx)).toFixed(1) + 'px');
      peek.style.setProperty('--py', y.toFixed(1) + 'px');
    });
  }
  ScrollTrigger.create({
    trigger: track, start: 'top top', end: 'bottom bottom',
    onUpdate: s => { if (rail) rail.setProgress(s.progress); bar.style.transform = `scaleX(${s.progress.toFixed(4)})`; },
  });
  gsap.from('.rail__head > *', { yPercent: 40, opacity: 0, duration: 1.1, ease: 'power3.out', stagger: 0.1, scrollTrigger: { trigger: railSec, start: 'top 70%', once: true } });

  function trackY(p) {
    const top = track.getBoundingClientRect().top + window.scrollY;
    return top + p * (track.offsetHeight - window.innerHeight);
  }
  function jumpTo(i, quick, then) {
    if (!rail) { goScroll(railSec, { onComplete: then }); return; }
    goScroll(trackY(rail.progressFor(i)), { duration: quick ? 0.8 : 1.6, onComplete: then });
  }
  function goToItem(i) {
    if (pdpOpen) { if (rail) rail.close(); else closePdp(); }
    if (rail && rail.ready) jumpTo(i, false, () => rail.open(i));
    else { goScroll(railSec, { onComplete: () => rail ? null : openPdp({ i, spec: CATALOG[i] }) }); }
  }

  /* ------------------------------------------------ painel da peça */
  const pdp = $('#pdp'), sizeBtns = $$('.pdp__sizes button'), sideBtns = $$('.pdp__view button');
  const addBtn = $('#pdp-add'), warn = $('#pdp-warn');
  let current = null, size = null, lastKey = false;
  window.addEventListener('keydown', () => { lastKey = true; }, true);
  window.addEventListener('pointerdown', () => { lastKey = false; }, true);
  function openPdp(it) {
    current = it; size = null;
    const s = it.spec;
    $('#pdp-index').textContent = pad(it.i + 1);
    $('#pdp-total').textContent = pad(CATALOG.length);
    $('#pdp-name').textContent = s.name;
    $('#pdp-price').textContent = brl(s.price);
    $('#pdp-inst').textContent = parcelas(s.price);
    $('#pdp-color').textContent = s.colorName;
    $('#pdp-desc').textContent = s.desc;
    $('#pdp-specs').innerHTML = s.specs.map(t => `<li>${t}</li>`).join('');
    sizeBtns.forEach(b => b.setAttribute('aria-checked', 'false'));
    sideBtns.forEach((b, k) => { b.classList.toggle('is-on', k === 0); b.setAttribute('aria-pressed', String(k === 0)); });
    warn.textContent = ''; addBtn.classList.remove('is-done'); addBtn.textContent = 'Adicionar à sacola';
    if (!pdpOpen) {
      pdpOpen = true;
      pdp.removeAttribute('inert'); pdp.setAttribute('aria-hidden', 'false');
      pdp.classList.add('is-open'); railSec.classList.add('is-detail');
      if (fixed) hdr.classList.add('is-hidden');
      if (lenis) lenis.stop();
      if (lastKey) setTimeout(() => $('.pdp__close').focus({ preventScroll: true }), 350);
    }
    peek.classList.remove('is-on'); peekItem = null;
  }
  function closePdp() {
    if (!pdpOpen) return;
    pdpOpen = false;
    pdp.classList.remove('is-open'); railSec.classList.remove('is-detail');
    pdp.setAttribute('inert', ''); pdp.setAttribute('aria-hidden', 'true');
    if (lenis) lenis.start();
  }
  $('.pdp__close').addEventListener('click', () => rail ? rail.close() : closePdp());
  sideBtns.forEach(b => b.addEventListener('click', () => {
    const back = b.dataset.side === '1';
    sideBtns.forEach(x => { x.classList.toggle('is-on', x === b); x.setAttribute('aria-pressed', String(x === b)); });
    if (rail) rail.showSide(back);
  }));
  sizeBtns.forEach(b => b.addEventListener('click', () => {
    size = b.textContent;
    sizeBtns.forEach(x => x.setAttribute('aria-checked', String(x === b)));
    warn.textContent = '';
    if (addBtn.classList.contains('is-done')) { addBtn.classList.remove('is-done'); addBtn.textContent = 'Adicionar à sacola'; }
  }));
  addBtn.addEventListener('click', () => {
    if (!current) return;
    if (addBtn.classList.contains('is-done')) { openBag(); return; }
    if (!size) {
      warn.textContent = 'Escolha um tamanho para continuar.';
      $('.pdp__sizes').classList.remove('shake'); void addBtn.offsetWidth; $('.pdp__sizes').classList.add('shake');
      return;
    }
    addToCart(current.spec, size);
    addBtn.classList.add('is-done'); addBtn.textContent = 'Ver sacola';
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && closeOverlay()) { e.preventDefault(); return; }
    if (e.key === 'Tab') trapFocus(e);
    if (!pdpOpen || overlayOpen()) return;
    if (rail && (e.key === 'ArrowRight' || e.key === 'ArrowLeft') && !/input|textarea/i.test(e.target.tagName)) {
      const n = rail.items.length, i = (current.i + (e.key === 'ArrowRight' ? 1 : -1) + n) % n;
      rail.open(i);
    }
  });

  /* ------------------------------------------------- sacola e favoritos */
  const SIZES = ['P', 'M', 'G', 'GG'], FREE = 299, BAG_KEY = 'gazu-sacola';
  const bagEl = $('#bag'), bagList = $('#bag-list');
  let favs = 0;
  let bag = (() => {
    try {
      const v = JSON.parse(localStorage.getItem(BAG_KEY) || '[]');
      return Array.isArray(v) ? v.filter(x => x && CATALOG.some(c => c.id === x.id) && SIZES.includes(x.size) && x.qty > 0).map(x => ({ id: x.id, size: x.size, qty: Math.min(10, Math.floor(x.qty)) })) : [];
    } catch (e) { return []; }
  })();
  const saveBag = () => { try { localStorage.setItem(BAG_KEY, JSON.stringify(bag)); } catch (e) { /* sem armazenamento: a sacola vale só nesta visita */ } };
  const specOf = id => CATALOG.find(c => c.id === id);
  const bagQty = () => bag.reduce((n, x) => n + x.qty, 0);
  const bagSum = () => bag.reduce((n, x) => n + specOf(x.id).price * x.qty, 0);

  function addToCart(spec, sz) {
    const line = bag.find(x => x.id === spec.id && x.size === sz);
    if (line) line.qty = Math.min(10, line.qty + 1); else bag.push({ id: spec.id, size: sz, qty: 1 });
    saveBag(); renderBag();
    $$('.cart-count').forEach(el => { el.parentElement.classList.remove('cart-bump'); void el.offsetWidth; el.parentElement.classList.add('cart-bump'); });
    toast(`${spec.name} (${sz}) foi para a sacola.`);
  }
  function renderBag() {
    const n = bagQty(), sum = bagSum();
    $$('.cart-count').forEach(el => { el.textContent = n; });
    $('#bag-count').textContent = `(${n})`;
    bagEl.classList.toggle('is-empty', !bag.length);
    const left = Math.max(0, FREE - sum);
    $('#bag-ship-text').textContent = left > 0 ? `Faltam ${brl(left)} para o frete grátis.` : 'Você ganhou frete grátis.';
    $('.bag__shipbar i').style.transform = `scaleX(${Math.min(1, sum / FREE).toFixed(3)})`;
    $('#bag-sub').textContent = brl(sum);
    $('#bag-freight').textContent = left > 0 ? 'Calculado no próximo passo' : 'Grátis';
    $('#bag-total').textContent = brl(sum);
    $('#bag-inst').textContent = sum ? parcelas(sum) : '';
    bagList.textContent = '';
    bag.forEach(line => {
      const spec = specOf(line.id), i = CATALOG.indexOf(spec);
      const li = document.createElement('li'); li.className = 'bag__item';
      li.innerHTML = `<span class="bag__thumb"><img alt=""></span>
        <div class="bag__info"><p class="bag__name"></p><p class="bag__meta"></p>
          <div class="bag__qty" role="group"><button type="button" data-d="-1">−</button><output></output><button type="button" data-d="1">+</button></div></div>
        <div class="bag__right"><p class="bag__price"></p><button type="button" class="bag__remove">Remover</button></div>`;
      $('.bag__thumb', li).style.setProperty('--c', spec.base);
      const img = $('img', li);
      if (thumbs[i] && thumbs[i] !== 'pending') img.src = thumbs[i]; else img.remove();
      $('.bag__name', li).textContent = spec.name;
      $('.bag__meta', li).textContent = `${spec.colorName} · Tamanho ${line.size}`;
      $('.bag__qty', li).setAttribute('aria-label', `Quantidade de ${spec.name}, tamanho ${line.size}`);
      $('output', li).textContent = line.qty;
      const [minus, plus] = $$('.bag__qty button', li);
      minus.setAttribute('aria-label', line.qty > 1 ? 'Diminuir quantidade' : `Remover ${spec.name}`);
      plus.setAttribute('aria-label', 'Aumentar quantidade'); plus.disabled = line.qty >= 10;
      $('.bag__price', li).textContent = brl(spec.price * line.qty);
      $('.bag__remove', li).setAttribute('aria-label', `Remover ${spec.name}, tamanho ${line.size}`);
      const change = d => {
        line.qty += d;
        if (line.qty <= 0) bag = bag.filter(x => x !== line);
        saveBag(); renderBag();
        const again = $$('.bag__qty', bagList)[bag.indexOf(line)];
        (again ? $(`button[data-d="${d}"]`, again) : $('.bag__close'))?.focus({ preventScroll: true });
      };
      minus.addEventListener('click', () => change(-1));
      plus.addEventListener('click', () => change(1));
      $('.bag__remove', li).addEventListener('click', () => { bag = bag.filter(x => x !== line); saveBag(); renderBag(); $('.bag__close').focus({ preventScroll: true }); toast(`${spec.name} saiu da sacola.`); });
      bagList.appendChild(li);
    });
  }
  function openBag() {
    $('#bag-note').textContent = '';
    renderBag(); fillThumbs();
    openOverlay(bagEl, $('.bag__close'), true);
  }
  $('#btn-cart').addEventListener('click', openBag);
  $('.bag__close').addEventListener('click', () => closeOverlay());
  $('#bag-browse').addEventListener('click', () => { closeOverlay(true); if (pdpOpen) { if (rail) rail.close(); else closePdp(); } goScroll(railSec); });
  $('#bag-checkout').addEventListener('click', () => {
    $('#bag-note').textContent = 'O pagamento ainda não está conectado neste site. Sua sacola fica salva neste navegador.';
  });

  // miniaturas das peças, renderizadas a partir dos modelos 3D (uma fila só para não abrir vários contextos WebGL)
  const thumbs = {};
  let snapQueue = Promise.resolve();
  function snap(list, w, h) {
    const job = snapQueue.then(() => rail.snapshots(list, w, h));
    snapQueue = job.catch(() => {});
    return job;
  }
  function fillThumbs() {
    if (!rail || !rail.ready) return;
    const need = [...new Set(bag.map(x => CATALOG.findIndex(c => c.id === x.id)))].filter(i => !thumbs[i]);
    if (!need.length) return;
    need.forEach(i => { thumbs[i] = 'pending'; });
    snap(need.map(i => [i, 0]), 320, 400).then(urls => {
      need.forEach((i, k) => { thumbs[i] = urls[k] || null; });
      renderBag();
    }).catch(() => need.forEach(i => { thumbs[i] = null; }));
  }
  renderBag();

  /* ------------------------------------------------- guia de medidas */
  const GUIDE = {
    tee: { label: 'Camisetas', a: [52, 55, 58, 61], b: [70, 72, 74, 76], c: [20, 21, 22, 23], cName: 'Manga (ombro à barra)' },
    oversized: { label: 'Oversized', a: [57, 60, 63, 66], b: [71, 73, 75, 77], c: [23, 24, 25, 26], cName: 'Manga (ombro à barra)' },
    hoodie: { label: 'Moletons com capuz', a: [58, 61, 64, 67], b: [68, 70, 72, 74], c: [60, 61, 62, 63], cName: 'Manga (ombro ao punho)' },
    crew: { label: 'Moletom careca', a: [57, 60, 63, 66], b: [66, 68, 70, 72], c: [60, 61, 62, 63], cName: 'Manga (ombro ao punho)' },
    longsleeve: { label: 'Manga longa', a: [52, 55, 58, 61], b: [70, 72, 74, 76], c: [63, 64, 65, 66], cName: 'Manga (ombro ao punho)' },
    shirt: { label: 'Overshirt', a: [59, 62, 65, 68], b: [74, 76, 78, 80], c: [62, 63, 64, 65], cName: 'Manga (ombro ao punho)' },
    bomber: { label: 'Bomber', a: [60, 63, 66, 69], b: [64, 66, 68, 70], c: [63, 64, 65, 66], cName: 'Manga (ombro ao punho)' },
    coat: { label: 'Trench', a: [60, 63, 66, 69], b: [108, 110, 112, 114], c: [62, 63, 64, 65], cName: 'Manga (ombro ao punho)' },
  };
  const BODY = [
    ['Tórax', ['88–94', '94–100', '100–106', '106–114'], 'cm'],
    ['Cintura', ['74–80', '80–86', '86–92', '92–100'], 'cm'],
    ['Altura', ['1,65–1,72', '1,70–1,78', '1,75–1,83', '1,80–1,88'], 'm'],
  ];
  const guideKey = spec => spec.type === 'tee' ? (spec.oversized ? 'oversized' : 'tee') : spec.type === 'crew' ? (spec.lite ? 'longsleeve' : 'crew') : spec.type;
  const guide = $('#guide');
  let gKey = 'tee', gFromPdp = false;
  const SHAPES = {
    short: 'M74 22 L102 12 Q120 28 138 12 L166 22 L222 62 L198 96 L176 82 L178 246 L62 246 L64 82 L42 96 L18 62 Z',
    long: 'M74 22 L102 12 Q120 28 138 12 L166 22 L192 40 L214 232 L190 236 L176 96 L178 246 L62 246 L64 96 L50 236 L26 232 L48 40 Z',
  };
  function renderGuide() {
    const g = GUIDE[gKey], long = !['tee', 'oversized'].includes(gKey);
    $('#guide-cats').innerHTML = '';
    Object.entries(GUIDE).forEach(([k, v]) => {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = v.label;
      b.setAttribute('aria-pressed', String(k === gKey));
      b.addEventListener('click', () => { gKey = k; renderGuide(); $(`#guide-cats button[aria-pressed="true"]`).focus(); });
      $('#guide-cats').appendChild(b);
    });
    const sel = gFromPdp ? SIZES.indexOf(size) : -1;
    const head = `<thead><tr><th scope="col"><span class="sr-only">Medida</span></th>${SIZES.map((s, k) => `<th scope="col"${k === sel ? ' class="is-sel"' : ''}>${s}</th>`).join('')}</tr></thead>`;
    const row = (name, vals) => `<tr><th scope="row">${name}</th>${vals.map((v, k) => `<td${k === sel ? ' class="is-sel"' : ''}>${v}</td>`).join('')}</tr>`;
    $('#guide-piece').innerHTML = head + '<tbody>' + row('A · Largura (axila a axila)', g.a) + row('B · Comprimento', g.b) + row('C · ' + g.cName, g.c) + '</tbody>';
    $('#guide-body').innerHTML = head + '<tbody>' + BODY.map(([n, v, u]) => row(`${n} (${u})`, v)).join('') + '</tbody>';
    // desenho da peça com as cotas
    const sleeve = long ? '<line x1="168" y1="24" x2="203" y2="226"/><text x="214" y="132">C</text>' : '<line x1="168" y1="24" x2="210" y2="70"/><text x="200" y="38">C</text>';
    const bTop = 18;
    $('#guide-svg').innerHTML = `<path class="g-shape" d="${long ? SHAPES.long : SHAPES.short}"/>
      <g class="g-dim"><line x1="66" y1="${long ? 108 : 96}" x2="174" y2="${long ? 108 : 96}"/><text x="120" y="${long ? 100 : 88}">A</text>
      <line x1="120" y1="${bTop + 12}" x2="120" y2="244"/><text x="128" y="176">B</text>${sleeve}</g>`;
    $('#guide-how').textContent = `A: largura de axila a axila · B: do ponto mais alto do ombro até a barra · C: ${g.cName.replace('Manga ', 'manga ').replace(/[()]/g, '')}`;
    const pick = $('#guide-pick');
    pick.hidden = !gFromPdp;
    if (gFromPdp) {
      $('#guide-item').textContent = current.spec.name;
      const row2 = $('.guide__pickrow', pick); row2.innerHTML = '';
      SIZES.forEach(s => {
        const b = document.createElement('button'); b.type = 'button'; b.textContent = s;
        b.setAttribute('aria-pressed', String(s === size));
        b.addEventListener('click', () => { const t = sizeBtns.find(x => x.textContent === s); closeOverlay(); if (t) t.click(); });
        row2.appendChild(b);
      });
    }
  }
  function openGuide(fromPdp) {
    gFromPdp = !!(fromPdp && pdpOpen && current);
    if (gFromPdp) gKey = guideKey(current.spec);
    renderGuide();
    openOverlay(guide, $('.guide__close'), true);
  }
  $$('[data-guide]').forEach(b => b.addEventListener('click', () => openGuide(b.dataset.guide === 'pdp')));
  $('.guide__close').addEventListener('click', () => closeOverlay());
  guide.addEventListener('click', e => { if (e.target === guide) closeOverlay(); });

  /* ------------------------------------------------------- busca */
  const search = $('#search'), sInput = $('#search-input'), sList = $('#search-list');
  const fold = t => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const KIND = { hoodie: 'moletom capuz', crew: 'moletom careca', tee: 'camiseta', shirt: 'camisa overshirt jaqueta', coat: 'casaco trench sobretudo', bomber: 'jaqueta bomber' };
  const kindOf = spec => spec.type === 'crew' && spec.lite ? 'camiseta manga longa' : KIND[spec.type] || '';
  function renderSearch() {
    const q = fold(sInput.value.trim());
    const hits = CATALOG.map((spec, i) => ({ spec, i })).filter(({ spec }) => !q || fold(`${spec.name} ${spec.colorName} ${kindOf(spec)}`).includes(q));
    sList.textContent = '';
    if (!hits.length) {
      const li = document.createElement('li'); li.className = 'search__empty';
      li.textContent = `Nenhuma peça com “${sInput.value.trim()}”. Tente moletom, camiseta ou trench.`;
      sList.appendChild(li); return;
    }
    for (const { spec, i } of hits) {
      const li = document.createElement('li'), b = document.createElement('button');
      b.type = 'button'; b.dataset.i = i;
      b.innerHTML = '<i></i><span class="search__name"><b></b><small></small></span><span class="search__price"></span>';
      $('i', b).style.background = spec.base;
      $('b', b).textContent = spec.name; $('small', b).textContent = spec.colorName; $('.search__price', b).textContent = brl(spec.price);
      li.appendChild(b); sList.appendChild(li);
    }
  }
  $('#btn-search').addEventListener('click', () => { closeMenu(); openOverlay(search, sInput); renderSearch(); });
  $('.search__close').addEventListener('click', () => closeOverlay());
  sInput.addEventListener('input', renderSearch);
  sInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); const b = $('button', sList); if (b) b.click(); } });
  sList.addEventListener('click', e => {
    const b = e.target.closest('button[data-i]'); if (!b) return;
    closeOverlay(true); goToItem(+b.dataset.i);   // sem devolver o foco ao botão de busca
  });

  /* ---------------------------------------------- menu (tablet e celular) */
  const menu = $('#menu'), menuBtn = $('#btn-menu');
  function closeMenu() { if (overlay === menu) closeOverlay(); }
  menuBtn.addEventListener('click', () => { if (overlay === menu) closeOverlay(); else { openOverlay(menu, $('a', menu)); menuBtn.setAttribute('aria-expanded', 'true'); } });
  // captura: fecha o menu (e religa a rolagem) antes do link rolar até a seção
  menu.addEventListener('click', e => { if (e.target.closest('a')) closeOverlay(true); }, true);

  /* ------------------------------ painéis sobrepostos (busca e menu) */
  let overlay = null, overlayFrom = null, inerted = [];
  const scrim = $('#scrim');
  const overlayOpen = () => !!overlay;
  function openOverlay(el, focusEl, modal) {
    if (overlay) closeOverlay(true);
    overlay = el; overlayFrom = document.activeElement;
    el.removeAttribute('inert'); el.classList.add('is-open');
    // o resto da página fica fora do alcance do teclado e do leitor de tela
    const keep = n => n === el || n === scrim || n === toastEl || n.tagName === 'SCRIPT' || n.hasAttribute('inert') || (!modal && n === hdr);
    inerted = $$('body > *').filter(n => !keep(n));
    if (el === menu) inerted.push(...$$('.hdr > *').filter(n => n !== $('.hdr__left') && !n.hasAttribute('inert')));
    inerted.forEach(n => n.setAttribute('inert', ''));
    scrim.classList.toggle('is-on', !!modal);
    if (lenis) lenis.stop();
    setTimeout(() => focusEl && focusEl.focus({ preventScroll: true }), 60);
  }
  function closeOverlay(silent) {
    if (!overlay) {
      if (pdpOpen) { if (rail) rail.close(); else closePdp(); return true; }
      return false;
    }
    const el = overlay; overlay = null;
    el.classList.remove('is-open'); el.setAttribute('inert', '');
    inerted.forEach(n => n.removeAttribute('inert')); inerted = [];
    scrim.classList.remove('is-on');
    menuBtn.setAttribute('aria-expanded', 'false');
    if (lenis && !pdpOpen) lenis.start();
    if (!silent && overlayFrom && overlayFrom.focus) overlayFrom.focus({ preventScroll: true });
    return true;
  }
  function trapFocus(e) {
    const box = overlay === menu ? $('.hdr__left') : overlay;
    if (!box) return;
    const f = $$('a[href], button:not([disabled]), input', box).filter(x => x.getClientRects().length);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  document.addEventListener('pointerdown', e => {
    if (overlay && !overlay.contains(e.target) && !e.target.closest('#btn-search, #btn-menu, #btn-cart, [data-guide]')) closeOverlay(true);
  });
  $$('.card__fav').forEach(b => b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    b.setAttribute('aria-pressed', String(on));
    favs += on ? 1 : -1;
    const fc = $('.fav-count'); fc.hidden = favs <= 0; fc.textContent = `(${favs})`;
    toast(on ? 'Salvo nos favoritos.' : 'Removido dos favoritos.');
  }));

  /* --------------------------------------------------- mais vendidos */
  const cards = $$('.card');
  cards.forEach(card => {
    const i = CATALOG.findIndex(c => c.id === card.dataset.id);
    $('.card__link', card).addEventListener('click', e => { e.preventDefault(); if (i >= 0) goToItem(i); });
  });
  async function shoot() {
    if (!rail) return;
    const idx = cards.map(c => CATALOG.findIndex(s => s.id === c.dataset.id));
    const reqs = []; idx.forEach(i => { reqs.push([i, 0], [i, 1]); });
    try {
      const urls = await snap(reqs, 800, 1000);
      idx.forEach((i, k) => { if (!thumbs[i] && urls[k * 2]) thumbs[i] = urls[k * 2]; });
      if (bag.length) { renderBag(); fillThumbs(); }
      cards.forEach((card, k) => {
        const media = $('.card__media', card), name = $('.card__name', card).textContent;
        [['front', urls[k * 2], `${name}, frente`], ['back', urls[k * 2 + 1], `${name}, costas`]].forEach(([cls, url, alt]) => {
          if (!url) return;
          const img = new Image(); img.className = cls; img.src = url; img.alt = cls === 'front' ? alt : ''; img.decoding = 'async';
          media.appendChild(img);
        });
        media.classList.add('has-img');
      });
    } catch (err) { console.warn(err); }
  }

  /* ---------------------------------------------- animações de rolagem */
  if (!reduced) {
    gsap.set('[data-reveal]', { y: 46, opacity: 0 });
    ScrollTrigger.batch('[data-reveal]', {
      start: 'top 90%', once: true, interval: 0.12,
      onEnter: els => gsap.to(els, { y: 0, opacity: 1, duration: 1.1, ease: 'power3.out', stagger: 0.09, overwrite: true }),
    });
    const text = $('[data-words]');
    if (text) {
      text.innerHTML = text.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(' ');
      gsap.fromTo($$('.w', text), { opacity: 0.13 }, { opacity: 1, ease: 'none', stagger: 0.1, scrollTrigger: { trigger: text, start: 'top 78%', end: 'bottom 42%', scrub: true } });
    }
    gsap.from('.foot__word', { yPercent: 45, ease: 'none', scrollTrigger: { trigger: '.foot__word', start: 'top bottom', end: 'bottom bottom', scrub: true } });
  }

  /* ------------------------------------------- dados estruturados */
  const ld = document.createElement('script');
  ld.type = 'application/ld+json';
  ld.textContent = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'ItemList', name: 'Nova coleção 2026', numberOfItems: CATALOG.length,
    itemListElement: CATALOG.map((s, k) => ({
      '@type': 'ListItem', position: k + 1,
      item: { '@type': 'Product', name: s.name, color: s.colorName, description: s.desc, sku: 'GAZU-' + s.id.toUpperCase(), brand: { '@type': 'Brand', name: 'GAZU' },
        offers: { '@type': 'Offer', price: s.price.toFixed(2), priceCurrency: 'BRL', availability: 'https://schema.org/InStock' } },
    })),
  });
  document.head.appendChild(ld);

  /* --------------------------------------------------- newsletter */
  $('#news').addEventListener('submit', e => {
    e.preventDefault();
    const input = $('#news-email'), msg = $('#news-msg'), v = input.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { msg.textContent = 'Digite um e-mail válido, como nome@email.com.'; input.focus(); return; }
    msg.textContent = `Pronto. Os lançamentos vão chegar em ${v}.`;
    input.value = '';
  });

  window.addEventListener('load', () => ScrollTrigger.refresh());
  if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
