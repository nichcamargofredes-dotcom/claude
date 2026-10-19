import * as THREE from 'three';

// Número do WhatsApp da Viewport: DDI + DDD + número, só dígitos (ex.: '5519999999999').
// Enquanto estiver vazio, o botão abre o WhatsApp com a mensagem pronta para escolher o contato.
const WHATSAPP = '';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

let vw = innerWidth, vh = innerHeight;
const mouse = { x: 0, y: 0, nx: 0, ny: 0 };
addEventListener('pointermove', e => {
  mouse.x = e.clientX; mouse.y = e.clientY;
  mouse.nx = e.clientX / vw * 2 - 1; mouse.ny = e.clientY / vh * 2 - 1;
}, { passive: true });

/* ---------------- abertura ---------------- */
const loader = $('#loader'), loaderN = $('#loader-n');
let introStart = 0;
{
  const t0 = performance.now(), dur = reduced ? 200 : 1500;
  let loaded = document.readyState === 'complete';
  addEventListener('load', () => { loaded = true; });
  const tick = now => {
    const p = clamp((now - t0) / dur);
    loaderN.textContent = Math.round((1 - Math.pow(1 - p, 3)) * 100);
    if (p < 1 || (!loaded && now - t0 < 4000)) return requestAnimationFrame(tick);
    loader.classList.add('done');
    root.classList.add('ready');
    introStart = performance.now();
    setTimeout(() => loader.classList.add('gone'), 1200);
  };
  requestAnimationFrame(tick);
}

/* ---------------- cena 3D do hero ---------------- */
const gl = (() => {
  const canvas = $('#gl');
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  } catch (e) {
    root.classList.add('no-gl');
    return null;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0e0f0f);
  scene.fog = new THREE.Fog(0x0e0f0f, 16, 34);
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);

  // concreto aparente: manchas, poros, juntas das placas e furos de tirante
  function concreteCanvas() {
    const c = document.createElement('canvas');
    c.width = c.height = 1024;
    const g = c.getContext('2d');
    g.fillStyle = '#7a7a75';
    g.fillRect(0, 0, 1024, 1024);
    for (let i = 0; i < 160; i++) {
      const x = Math.random() * 1024, y = Math.random() * 1024, r = 40 + Math.random() * 220;
      const light = Math.random() > 0.5;
      const grd = g.createRadialGradient(x, y, 0, x, y, r);
      grd.addColorStop(0, light ? 'rgba(200,200,192,.10)' : 'rgba(40,40,36,.12)');
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = grd;
      g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    const img = g.getImageData(0, 0, 1024, 1024), d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const n = (Math.random() - 0.5) * 30;
      d[i] += n; d[i + 1] += n; d[i + 2] += n;
    }
    g.putImageData(img, 0, 0);
    for (let i = 0; i < 2600; i++) {
      g.fillStyle = `rgba(30,30,28,${0.2 + Math.random() * 0.4})`;
      g.beginPath();
      g.arc(Math.random() * 1024, Math.random() * 1024, 0.4 + Math.random() * 1.6, 0, 7);
      g.fill();
    }
    g.strokeStyle = 'rgba(40,40,36,.35)';
    g.lineWidth = 2;
    for (const y of [0, 512]) { g.beginPath(); g.moveTo(0, y + 1); g.lineTo(1024, y + 1); g.stroke(); }
    for (const x of [0, 512]) { g.beginPath(); g.moveTo(x + 1, 0); g.lineTo(x + 1, 1024); g.stroke(); }
    for (const x of [128, 384, 640, 896]) for (const y of [128, 384, 640, 896]) {
      const grd = g.createRadialGradient(x, y, 0, x, y, 9);
      grd.addColorStop(0, 'rgba(20,20,18,.75)');
      grd.addColorStop(0.6, 'rgba(30,30,28,.5)');
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = grd;
      g.fillRect(x - 10, y - 10, 20, 20);
    }
    return c;
  }
  const cc = concreteCanvas();
  const map = new THREE.CanvasTexture(cc);
  map.colorSpace = THREE.SRGBColorSpace;
  const bump = new THREE.CanvasTexture(cc);
  for (const t of [map, bump]) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(4, 2.4);
    t.anisotropy = renderer.capabilities.getMaxAnisotropy();
  }
  const wallGroup = new THREE.Group();
  scene.add(wallGroup);
  const wall = new THREE.Mesh(
    new THREE.PlaneGeometry(44, 26),
    new THREE.MeshStandardMaterial({ map, bumpMap: bump, bumpScale: 1.4, roughness: 0.94, metalness: 0, color: 0xbdbdb9 })
  );
  wall.receiveShadow = true;
  wallGroup.add(wall);

  // o "V" da Viewport, em relevo
  const S = 1 / 38;
  const shape = pts => {
    const s = new THREE.Shape();
    pts.forEach(([x, y], i) => (i ? s.lineTo : s.moveTo).call(s, (x - 84) * S, -(y - 65) * S));
    s.closePath();
    return s;
  };
  const extrude = { depth: 0.5, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.035, bevelSegments: 4, curveSegments: 1 };
  const leftGeo = new THREE.ExtrudeGeometry(shape([[0, 0], [46, 0], [100, 92], [78, 110]]), extrude);
  const rightGeo = new THREE.ExtrudeGeometry(shape([[122, 0], [168, 0], [80, 130], [58, 130]]), extrude);

  // degradê verde do símbolo (claro no alto, profundo embaixo)
  {
    const pos = leftGeo.attributes.position, col = [];
    leftGeo.computeBoundingBox();
    const { min, max } = leftGeo.boundingBox;
    const top = new THREE.Color('#86a383'), mid = new THREE.Color('#2E4D3A'), bot = new THREE.Color('#152a1d');
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const t = 1 - (pos.getY(i) - min.y) / (max.y - min.y) * 0.75 - (pos.getX(i) - min.x) / (max.x - min.x) * 0.25;
      if (t < 0.55) c.copy(top).lerp(mid, t / 0.55); else c.copy(mid).lerp(bot, (t - 0.55) / 0.45);
      col.push(c.r, c.g, c.b);
    }
    leftGeo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  }
  const vGroup = new THREE.Group();
  const left = new THREE.Mesh(leftGeo, new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 0.3, roughness: 0.42 }));
  const right = new THREE.Mesh(rightGeo, new THREE.MeshStandardMaterial({ color: 0x141515, metalness: 0.6, roughness: 0.34 }));
  left.position.z = -0.08;
  for (const m of [left, right]) { m.castShadow = true; m.receiveShadow = true; vGroup.add(m); }
  wallGroup.add(vGroup);

  // luzes
  scene.add(new THREE.HemisphereLight(0xdfe6df, 0x161614, 0.38));
  const sun = new THREE.DirectionalLight(0xfff1e2, 3.3);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 10, bottom: -10, near: 1, far: 50 });
  sun.shadow.radius = 5;
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.02;
  scene.add(sun, sun.target);
  const rim = new THREE.PointLight(0x6fae84, 9, 14, 1.6);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0xa9bccc, 0.4);
  fill.position.set(8, -2, 6);
  scene.add(fill);

  // folhas fora de quadro que só projetam sombra na parede
  const leafShape = new THREE.Shape();
  leafShape.moveTo(0, 0);
  leafShape.quadraticCurveTo(0.2, 0.28, 0, 0.66);
  leafShape.quadraticCurveTo(-0.2, 0.28, 0, 0);
  const leafGeo = new THREE.ShapeGeometry(leafShape, 6);
  const leafMat = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false, side: THREE.DoubleSide });
  const leaves = [];
  function branch(n, scale) {
    const g = new THREE.Group();
    for (let i = 0; i < n; i++) {
      const pivot = new THREE.Group();
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.castShadow = true;
      const s = scale * (0.75 + Math.random() * 0.5);
      leaf.scale.set(s, s, s);
      pivot.add(leaf);
      const side = i % 2 ? 1 : -1;
      pivot.position.set(i * 0.16 * scale, Math.sin(i * 0.5) * 0.08, 0);
      pivot.rotation.z = side * (0.7 + Math.random() * 0.5) - 0.2;
      pivot.userData = { base: pivot.rotation.z, ph: Math.random() * 6.28, sp: 0.8 + Math.random() * 0.8 };
      g.add(pivot);
      leaves.push(pivot);
    }
    g.userData = { ph: Math.random() * 6.28 };
    scene.add(g);
    return g;
  }
  const leafSpots = [[-7, 4.5, 14, 1.1, -0.4], [-4.2, 6.2, 11, 0.9, -0.9], [-8.5, 0.2, 12, 1.0, 0.3], [7.5, 5.6, 12, 1.0, -2.4], [9.5, 1.5, 10, 0.9, -2.9], [1.5, 6.5, 9, 0.8, -1.6]];
  const leafAnchors = leafSpots.map(([x, y, n, s, rz]) => ({ g: branch(n, s), x, y, rz }));

  // composição muda entre computador e celular
  const layout = {};
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const narrow = w < 900;
    Object.assign(layout, narrow
      ? { vx: 0, vy: 2.3, vs: 0.5, camZ: 15.5, wallRy: 0, lookX: 0, camX: 0 }
      : { vx: 3.7, vy: 0.3, vs: 0.74, camZ: 12.5, wallRy: -0.32, lookX: 1.4, camX: -0.6 });
    vGroup.scale.setScalar(layout.vs);
    camera.updateProjectionMatrix();
  }
  resize();

  const sunBase = new THREE.Vector3(-8, 7, 10);
  const tmp = new THREE.Vector3();
  function placeLeaves(t) {
    // cada galho fica no caminho entre o sol e um ponto da parede
    for (const { g, x, y, rz } of leafAnchors) {
      g.position.copy(tmp.set(x, y, 0).lerp(sun.position, 0.33));
      g.lookAt(sun.position);
      g.rotateZ(rz + (reduced ? 0 : Math.sin(t * 0.6 + g.userData.ph) * 0.06));
    }
  }

  let introT = 0, visible = true, scrollP = 0;
  const cam = { x: 0, y: 0 };
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 }).observe(canvas);

  function frame(now) {
    if (!visible) return;
    const t = now / 1000;
    if (introStart) introT = clamp((now - introStart) / 2200);
    const ei = 1 - Math.pow(1 - introT, 4);

    wallGroup.rotation.y = layout.wallRy;
    // sol oscila de leve, como luz de fim de tarde
    sun.position.set(sunBase.x + Math.sin(t * 0.12) * 0.8 + mouse.nx * 0.8, sunBase.y + mouse.ny * -0.5, sunBase.z);
    sun.target.position.set(0, 0, 0);
    placeLeaves(t);
    if (!reduced) for (const p of leaves) p.rotation.z = p.userData.base + Math.sin(t * p.userData.sp + p.userData.ph) * 0.09;

    // entrada: o V vem da frente girando e encosta na parede
    const float = reduced ? 0 : Math.sin(t * 0.9) * 0.06;
    vGroup.position.set(layout.vx, layout.vy + float, lerp(5.5, 0.9, ei));
    vGroup.rotation.set(
      lerp(0.5, 0, ei) + mouse.ny * 0.08,
      lerp(-2.4, 0, ei) + mouse.nx * 0.18 + scrollP * 0.9,
      lerp(0.3, 0, ei)
    );
    rim.position.set(layout.vx + 2.6, layout.vy - 1.2, 2.4);

    cam.x = lerp(cam.x, mouse.nx * 0.7, 0.05);
    cam.y = lerp(cam.y, -mouse.ny * 0.4, 0.05);
    camera.position.set(cam.x + layout.camX, cam.y + 0.2 - scrollP * 1.2, layout.camZ + scrollP * 3.5 + lerp(3, 0, ei));
    camera.lookAt(layout.lookX, -scrollP * 0.6, 0);
    renderer.render(scene, camera);
  }
  return { frame, resize, setScroll: p => { scrollP = p; } };
})();

/* ---------------- navegação ---------------- */
const nav = $('#nav'), links = $('#links'), burger = $('#burger');
burger.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  burger.setAttribute('aria-expanded', open);
  burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  document.body.style.overflow = open ? 'hidden' : '';
});
links.addEventListener('click', e => {
  if (!e.target.closest('a')) return;
  links.classList.remove('open');
  burger.setAttribute('aria-expanded', false);
  document.body.style.overflow = '';
});

/* ---------------- cursor e botões magnéticos ---------------- */
const cursor = $('#cursor');
const cur = { x: -100, y: -100 };
if (finePointer) {
  addEventListener('pointermove', () => cursor.classList.add('on'), { once: true });
  document.addEventListener('pointerover', e => {
    const proj = e.target.closest('.proj-link');
    cursor.classList.toggle('big', !!proj && vw > 900);
    cursor.classList.toggle('link', !proj && !!e.target.closest('a,button,select,input,textarea'));
  });
  $$('.magnet').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.22}px,${(e.clientY - r.top - r.height / 2) * 0.32}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
}

/* ---------------- faixa de serviços ---------------- */
const band = $('#band');
let bandX = 0, bandDir = -1, lastY = scrollY, velocity = 0;

/* ---------------- manifesto palavra por palavra ---------------- */
const manifesto = $('#manifesto');
{
  const greens = new Set(['mesma', 'qualidade', 'do', 'seu', 'atendimento:']);
  const words = manifesto.textContent.trim().split(/\s+/);
  let after = false;
  manifesto.innerHTML = words.map(w => {
    if (w === 'mesma') after = true;
    const g = after && greens.has(w);
    if (w === 'atendimento:') after = false;
    return `<span class="w${g ? ' g' : ''}">${w}</span>`;
  }).join(' ');
}
const mWords = $$('.w', manifesto);

/* ---------------- galeria horizontal ---------------- */
const work = $('#projetos'), track = $('#track'), cards = $$('.proj', track);
const workI = $('#work-i'), workBar = $('#work-bar');
let workDist = 0;
function layoutWork() {
  if (vw <= 900) { work.style.height = ''; workDist = 0; return; }
  // medida sem as transformações 3D, que aumentariam o scrollWidth
  const last = cards[cards.length - 1];
  workDist = Math.max(0, last.offsetLeft + last.offsetWidth + Math.min(120, vw * 0.06) - vw);
  work.style.height = `${vh + workDist}px`;
}

/* ---------------- inclinação 3D nos serviços e no cartão ---------------- */
$$('.tilt').forEach(el => {
  el.addEventListener('pointermove', e => {
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    el.style.transform = `rotateX(${(0.5 - y) * 12}deg) rotateY(${(x - 0.5) * 14}deg) translateZ(10px)`;
    el.style.setProperty('--mx', `${x * 100}%`);
    el.style.setProperty('--my', `${y * 100}%`);
  });
  el.addEventListener('pointerleave', () => { el.style.transform = ''; });
});
const card = $('#card3d'), stage = $('#card-stage');
let cardHover = false;
card.addEventListener('click', () => card.classList.toggle('flipped'));
stage.addEventListener('pointermove', e => {
  cardHover = true;
  const r = stage.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
  card.style.setProperty('--ry', `${x * 36}deg`);
  card.style.setProperty('--rx', `${-y * 26}deg`);
  card.style.setProperty('--shine', `${(0.5 - x) * 200}%`);
});
stage.addEventListener('pointerleave', () => { cardHover = false; });

/* ---------------- processo ---------------- */
const steps = $('#steps'), stepsFill = $('#steps-fill'), stepItems = $$('li', steps);

/* ---------------- revelação ao rolar ---------------- */
{
  const els = $$('.sec-head, .svc, .about-copy, .card-stage, .contact-copy, .form, .foot-big, .work-head, .process-head');
  if (vw <= 900) els.push(...cards);
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.remove('pre'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  els.forEach((el, i) => {
    el.classList.add('rv');
    if (!reduced && el.getBoundingClientRect().top > vh) {
      el.classList.add('pre');
      if (el.classList.contains('svc')) el.style.transitionDelay = `${(i % 4) * 90}ms`;
      io.observe(el);
    }
  });
}

/* ---------------- laço principal ---------------- */
function loop(now) {
  const y = scrollY;
  velocity = lerp(velocity, y - lastY, 0.2);
  if (Math.abs(y - lastY) > 0.5) bandDir = y > lastY ? -1 : 1;
  const goingDown = y > lastY;
  lastY = y;

  nav.classList.toggle('solid', y > 40);
  nav.classList.toggle('hide', goingDown && y > vh * 0.9 && !links.classList.contains('open'));

  if (gl) { gl.setScroll(clamp(y / vh, 0, 1.2)); gl.frame(now); }

  if (finePointer) {
    cur.x = lerp(cur.x, mouse.x, 0.22);
    cur.y = lerp(cur.y, mouse.y, 0.22);
    cursor.style.transform = `translate3d(${cur.x}px,${cur.y}px,0)`;
  }

  if (!reduced) {
    bandX += bandDir * (1.1 + Math.min(Math.abs(velocity) * 0.25, 14));
    const half = band.scrollWidth / 2;
    if (bandX <= -half) bandX += half;
    if (bandX > 0) bandX -= half;
    band.style.transform = `translate3d(${bandX}px,0,0)`;
  }

  {
    const r = manifesto.getBoundingClientRect();
    const p = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.35));
    const lit = reduced ? mWords.length : Math.round(p * mWords.length);
    mWords.forEach((w, i) => w.classList.toggle('on', i < lit));
  }

  if (workDist) {
    const r = work.getBoundingClientRect();
    const p = clamp(-r.top / (r.height - vh));
    track.style.transform = `translate3d(${-p * workDist}px,0,0)`;
    workBar.style.transform = `scaleX(${p})`;
    let best = 0, bestD = Infinity;
    cards.forEach((c, i) => {
      const cr = c.getBoundingClientRect();
      const d = (cr.left + cr.width / 2 - vw / 2) / vw;
      if (Math.abs(d) < bestD) { bestD = Math.abs(d); best = i; }
      if (!reduced) c.style.transform = `translateZ(${-Math.abs(d) * 260}px) rotateY(${clamp(-d * 30, -38, 38)}deg)`;
      c.style.opacity = clamp(1.15 - Math.abs(d) * 0.9, 0.35, 1);
    });
    workI.textContent = best + 1;
  }

  {
    const r = steps.getBoundingClientRect();
    const p = clamp((vh * 0.6 - r.top) / r.height);
    stepsFill.style.transform = `scaleY(${p})`;
    stepItems.forEach(li => li.classList.toggle('on', li.getBoundingClientRect().top < vh * 0.6));
  }

  if (!cardHover && !reduced) {
    const t = now / 1000;
    card.style.setProperty('--ry', `${Math.sin(t * 0.6) * 16 - 6}deg`);
    card.style.setProperty('--rx', `${Math.cos(t * 0.5) * 6 + 6}deg`);
    card.style.setProperty('--shine', `${50 + Math.sin(t * 0.6) * 60}%`);
  }

  requestAnimationFrame(loop);
}

function onResize() {
  vw = innerWidth; vh = innerHeight;
  if (gl) gl.resize();
  layoutWork();
}
addEventListener('resize', onResize);
onResize();
document.fonts?.ready.then(layoutWork);
addEventListener('load', layoutWork);
requestAnimationFrame(loop);

/* ---------------- formulário para WhatsApp ---------------- */
const form = $('#form'), send = $('#send'), msg = $('#form-msg');
function waLink() {
  const v = id => $(id).value.trim();
  const text = [
    'Olá, Nicolas! Vim pelo site da Viewport.',
    v('#f-nome') && `Meu nome é ${v('#f-nome')}.`,
    v('#f-negocio') && `Negócio: ${v('#f-negocio')}.`,
    `Preciso de: ${v('#f-tipo')}.`,
    v('#f-msg')
  ].filter(Boolean).join('\n');
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
}
const refresh = () => { send.href = waLink(); };
form.addEventListener('input', refresh);
refresh();
send.addEventListener('click', e => {
  const missing = ['#f-nome', '#f-negocio'].filter(id => !$(id).value.trim());
  ['#f-nome', '#f-negocio'].forEach(id => $(id).classList.toggle('err', missing.includes(id)));
  if (missing.length) {
    e.preventDefault();
    msg.textContent = 'Preencha seu nome e o nome do negócio para enviar.';
    $(missing[0]).focus();
  } else {
    msg.textContent = '';
  }
});
form.addEventListener('submit', e => e.preventDefault());

$('#ano').textContent = new Date().getFullYear();
