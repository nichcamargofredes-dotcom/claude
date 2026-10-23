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
  }));
  addBtn.addEventListener('click', () => {
    if (!current) return;
    if (!size) {
      warn.textContent = 'Escolha um tamanho para continuar.';
      $('.pdp__sizes').classList.remove('shake'); void addBtn.offsetWidth; $('.pdp__sizes').classList.add('shake');
      return;
    }
    addToCart(current.spec, size);
    addBtn.classList.add('is-done'); addBtn.textContent = 'Na sacola';
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
  let cart = 0, favs = 0;
  function addToCart(spec, sz) {
    cart++;
    $$('.cart-count').forEach(el => { el.textContent = cart; el.parentElement.classList.remove('cart-bump'); void el.offsetWidth; el.parentElement.classList.add('cart-bump'); });
    toast(`${spec.name} (${sz}) foi para a sacola.`);
  }
  $('#btn-cart').addEventListener('click', () => toast(cart ? `Sua sacola tem ${cart} ${cart > 1 ? 'peças' : 'peça'}.` : 'Sua sacola está vazia. Escolha uma peça na arara.'));

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
  let overlay = null, overlayFrom = null;
  const overlayOpen = () => !!overlay;
  function openOverlay(el, focusEl) {
    if (overlay) closeOverlay(true);
    overlay = el; overlayFrom = document.activeElement;
    el.removeAttribute('inert'); el.classList.add('is-open');
    // o resto da página fica fora do alcance do teclado e do leitor de tela
    $$('body > *').forEach(n => { if (n !== el && !n.matches('script, .toast, .hdr')) n.setAttribute('inert', ''); });
    if (el === menu) $$('.hdr > *').forEach(n => { if (n !== $('.hdr__left')) n.setAttribute('inert', ''); });
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
    $$('body > [inert], .hdr > [inert]').forEach(n => { if (n !== el && n !== search && n !== menu) n.removeAttribute('inert'); });
    menuBtn.setAttribute('aria-expanded', 'false');
    if (lenis && !pdpOpen) lenis.start();
    if (!silent && overlayFrom && overlayFrom.focus) overlayFrom.focus({ preventScroll: true });
    return true;
  }
  function trapFocus(e) {
    const box = overlay === menu ? $('.hdr__left') : overlay;
    if (!box) return;
    const f = $$('a[href], button:not([disabled]), input', box).filter(x => x.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  document.addEventListener('pointerdown', e => {
    if (overlay && !overlay.contains(e.target) && !e.target.closest('#btn-search, #btn-menu')) closeOverlay(true);
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
      const urls = await rail.snapshots(reqs, 800, 1000);
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
