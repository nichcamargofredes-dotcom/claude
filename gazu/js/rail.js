/* GAZU · Arara 3D
   Trilho em arco com as peças de lado. A rolagem desliza os cabides, o cursor vira a
   peça de frente (o tecido torce e balança atrasado) e o clique abre os detalhes. */
(function () {
  'use strict';
  const T = window.THREE;

  const R = 6;            // raio do arco do trilho (m)
  const RAIL_Y = 0.105;   // altura do trilho acima do centro do cabide
  const REST = 1.42;      // giro de repouso (relativo à câmera): peça de lado, frente para a direita
  const ARCH = 1.1;       // curvatura do trilho: as pontas descem
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
  const wrapPi = a => Math.atan2(Math.sin(a), Math.cos(a));
  function spring(s, target, k, c, dt) {
    const n = Math.max(1, Math.ceil(dt / 0.008)), h = dt / n;
    for (let i = 0; i < n; i++) { s.v += (-k * (s.x - target) - c * s.v) * h; s.x += s.v * h; }
  }
  const brl = v => 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 0 });

  /* --------------------------------------------------------- ambiente */
  function studio() {
    const s = new T.Scene();
    s.add(new T.Mesh(new T.BoxGeometry(12, 7, 12), new T.MeshBasicMaterial({ color: new T.Color(0.42, 0.41, 0.4), side: T.BackSide })));
    const panel = (w, h, x, y, z, k) => {
      const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: new T.Color(k, k, k * 0.97), side: T.DoubleSide }));
      m.position.set(x, y, z); m.lookAt(0, 0, 0); s.add(m);
    };
    panel(4, 2.4, -3.2, 2.6, 3.4, 5);
    panel(3, 3, 4, 0.8, 2.5, 1.6);
    panel(6, 4, 0, 3.4, -1, 2.2);
    panel(3, 2, 0, -0.5, -5, 1.2);
    return s;
  }

  /* ----------------------------------------------------- peças comuns */
  function hangerParts() {
    const hs = new T.Shape();
    hs.moveTo(-0.2, -0.052);
    hs.quadraticCurveTo(-0.1, -0.012, 0, 0.002);
    hs.quadraticCurveTo(0.1, -0.012, 0.2, -0.052);
    hs.quadraticCurveTo(0.213, -0.058, 0.205, -0.068);
    hs.quadraticCurveTo(0.1, -0.04, 0, -0.026);
    hs.quadraticCurveTo(-0.1, -0.04, -0.205, -0.068);
    hs.quadraticCurveTo(-0.213, -0.058, -0.2, -0.052);
    const wood = new T.ExtrudeGeometry(hs, { depth: 0.006, bevelEnabled: true, bevelThickness: 0.0015, bevelSize: 0.0015, bevelSegments: 2, curveSegments: 18 });
    wood.translate(0, -0.008, -0.003);
    wood.scale(0.94, 1, 1);
    const hookPts = [[0, 0.002, 0], [0, 0.03, -0.006], [0, 0.062, -0.0145], [0, 0.096, -0.0148], [0, 0.1155, -0.0103], [0, 0.1198, 0], [0, 0.1155, 0.0103], [0, 0.104, 0.0146], [0, 0.093, 0.0138], [0, 0.087, 0.0112]];
    const hook = new T.TubeGeometry(new T.CatmullRomCurve3(hookPts.map(p => new T.Vector3(...p))), 48, 0.0026, 8, false);
    const thread = new T.TubeGeometry(new T.CatmullRomCurve3([new T.Vector3(0, 0.074, -0.014), new T.Vector3(0.003, 0.086, 0.026), new T.Vector3(0.006, 0.073, 0.0615)]), 16, 0.0008, 5, false);
    // etiqueta grande, legível de longe na arara
    const tag = new T.BoxGeometry(0.136, 0.072, 0.0012);
    tag.translate(0.006, 0.048, 0.062);
    return {
      wood, hook, thread, tag,
      woodMat: new T.MeshStandardMaterial({ color: '#8a5d3d', roughness: 0.48, metalness: 0 }),
      metalMat: new T.MeshStandardMaterial({ color: '#d4d3cf', roughness: 0.22, metalness: 1 }),
      threadMat: new T.MeshStandardMaterial({ color: '#efece6', roughness: 0.9 }),
      edgeMat: new T.MeshStandardMaterial({ color: '#f4f2ee', roughness: 0.8 }),
    };
  }
  function tagTexture(price) {
    const W = 544, H = 288;
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d');
    g.fillStyle = '#f7f5f0'; g.fillRect(0, 0, W, H);
    g.strokeStyle = '#d6d2ca'; g.lineWidth = 6; g.strokeRect(10, 10, W - 20, H - 20);
    g.fillStyle = '#cfcac1'; g.beginPath(); g.arc(W / 2, 44, 13, 0, 7); g.fill();
    g.fillStyle = '#111'; g.textAlign = 'center'; g.textBaseline = 'middle';
    const label = brl(price);
    let size = 132;
    do { g.font = `500 ${size}px "IBM Plex Mono", ui-monospace, monospace`; size -= 4; } while (g.measureText(label).width > W - 56 && size > 60);
    g.fillText(label, W / 2, H * 0.6);
    const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 8;
    return t;
  }
  class ArcCurve extends T.Curve {
    constructor(a0, a1, y) { super(); this.a0 = a0; this.a1 = a1; this.y = y; }
    getPoint(t, out) { const a = this.a0 + (this.a1 - this.a0) * t; return (out || new T.Vector3()).set(R * Math.sin(a), this.y - ARCH * a * a, R * Math.cos(a)); }
  }

  /* -------------------------------------------------------------- Rail */
  class Rail {
    constructor(stage, opts) {
      this.stage = stage;
      this.opts = opts || {};
      this.canvas = stage.querySelector('canvas');
      this.items = [];
      this.progress = 0; this.s = null; this.prevS = 0;
      this.mouse = { x: 0, y: 0, inside: false, px: 0, py: 0 };
      this.hovered = -1; this.active = -1; this.detail = -1; this.side = 0; this.spin = 0;
      this.mobile = matchMedia('(max-width: 760px)').matches;
      this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.visible = false; this.time = 0; this.center = -1;
      this.camPos = new T.Vector3(); this.camLook = new T.Vector3(); this.camInit = false;
      this._v = new T.Vector3(); this._v2 = new T.Vector3(); this._ray = new T.Raycaster();
      this.zoom = 1; this.zoomS = 1; this.pan = { x: 0, y: 0 }; this.panS = { x: 0, y: 0 };   // zoom e deslocamento da câmera no painel da peça
      this.last = performance.now();
      this.loop = this.loop.bind(this);
    }

    init() {
      const r = this.renderer = new T.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
      r.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.mobile ? 1.75 : 2));
      r.outputColorSpace = T.SRGBColorSpace;
      r.toneMapping = T.NeutralToneMapping;
      r.toneMappingExposure = 1.02;
      r.shadowMap.enabled = true;
      r.shadowMap.type = T.VSMShadowMap;

      const sc = this.scene = new T.Scene();
      this.camera = new T.PerspectiveCamera(19, 1, 0.05, 60);
      const pm = new T.PMREMGenerator(r);
      sc.environment = pm.fromScene(studio(), 0.04).texture;
      sc.environmentIntensity = 0.6;
      pm.dispose();

      sc.add(new T.HemisphereLight(0xffffff, 0xcac3b7, 0.85));
      const key = this.key = new T.DirectionalLight(0xffffff, 2.1);
      key.position.set(-1.6, 2.1, R + 4.2);
      key.target.position.set(0, -0.45, R - 0.2);
      key.castShadow = true;
      key.shadow.mapSize.set(this.mobile ? 1024 : 2048, this.mobile ? 512 : 1024);
      Object.assign(key.shadow.camera, { left: -3.2, right: 3.2, top: 1.4, bottom: -1.8, near: 0.5, far: 9 });
      key.shadow.radius = 9; key.shadow.blurSamples = 14; key.shadow.bias = -0.0004;
      sc.add(key, key.target);
      const fill = new T.DirectionalLight(0xfff4e6, 0.5); fill.position.set(2.6, 0.4, R + 2); sc.add(fill);
      const rim = new T.DirectionalLight(0xffffff, 0.7); rim.position.set(0.8, 1.6, R - 3); sc.add(rim);

      // parede que só recebe a sombra (o fundo é o CSS da seção)
      const wall = new T.Mesh(new T.CylinderGeometry(R - 0.7, R - 0.7, 5, 160, 1, true, -0.8, 1.6), new T.ShadowMaterial({ color: 0x3a342c, opacity: 0.11 }));
      wall.position.y = -0.6; wall.receiveShadow = true; sc.add(wall);

      // trilho
      const railMat = new T.MeshStandardMaterial({ color: '#2b2b2c', roughness: 0.32, metalness: 0.9 });
      const rail = new T.Mesh(new T.TubeGeometry(new ArcCurve(-0.8, 0.8, RAIL_Y), 260, 0.011, 14, false), railMat);
      rail.castShadow = true; sc.add(rail);

      this.parts = hangerParts();
      this.bindEvents();
      this.resize();
      new ResizeObserver(() => this.resize()).observe(this.stage);
      new IntersectionObserver(es => { this.visible = es[0].isIntersecting; if (this.visible) this.kick(); }, { rootMargin: '120px' }).observe(this.stage);
      return this;
    }

    async load(catalog) {
      const q = this.mobile ? { step: 0.016, texFront: 560, texBack: 384, aniso: 2 } : { step: 0.012, texFront: 760, texBack: 520, aniso: 4 };
      const P = this.parts;
      for (let i = 0; i < catalog.length; i++) {
        const spec = catalog[i];
        let shape = spec;   // se o modelo do Blender não carregar, a peça vira uma camiseta procedural no lugar
        try { await window.GAZU_GARMENTS.preload(spec); } catch (e) { console.warn(e); shape = { ...spec, type: 'tee', oversized: true }; }
        const gar = window.GAZU_GARMENTS.build({ ...shape, seed: 1.7 + i * 2.3 }, q);
        const slot = new T.Group(), swing = new T.Group(), hang = new T.Group(), yawG = new T.Group();
        swing.position.y = RAIL_Y; hang.position.y = -RAIL_Y;
        slot.add(swing); swing.add(hang); hang.add(yawG);
        const hook = new T.Mesh(P.hook, P.metalMat); hook.castShadow = true;
        const thread = new T.Mesh(P.thread, P.threadMat);
        const tag = new T.Mesh(P.tag, [P.edgeMat, P.edgeMat, P.edgeMat, P.edgeMat, new T.MeshStandardMaterial({ map: tagTexture(spec.price), roughness: 0.85 }), P.edgeMat]);
        tag.castShadow = true;
        hang.add(hook, thread, tag);
        const wood = new T.Mesh(P.wood, P.woodMat); wood.castShadow = true;
        if (shape.type === 'model') { wood.position.y = -0.032; wood.scale.set(0.9, 1, 0.8); }   // ombros do modelo do Blender são mais baixos
        else if (spec.hanger) wood.scale.x = spec.hanger;   // cabide estreito para as blusas femininas
        yawG.add(wood, gar.group);
        this.scene.add(slot);
        const it = {
          i, spec, gar, slot, swing, hang, yawG, U: gar.uniforms,
          o: 0, oT: 0, L: 0, L0: 0, x: null, vel: 0, acc: 0,
          yaw: { x: REST + (Math.random() - 0.5) * 0.08, v: 0 }, yawB: { x: REST, v: 0 },
          sw: { x: 0, v: (Math.random() - 0.5) * 1.4 }, bend: { x: 0, v: 0 }, poke: 0, wind: 1,
          omega2: 9.8 / (0.32 + gar.len * 0.35), sx: 0,
        };
        this.items.push(it);
        if (this.opts.onItem) this.opts.onItem(it);
        this.kick();
        await new Promise(res => requestAnimationFrame(() => setTimeout(res, 0)));
      }
      this.ready = true;
      if (this.opts.onReady) this.opts.onReady(this.items);
    }

    /* ---------------------------------------------------- interação */
    bindEvents() {
      const st = this.stage;
      const pos = e => { const b = this.canvas.getBoundingClientRect(); this.mouse.x = e.clientX - b.left; this.mouse.y = e.clientY - b.top; };
      st.addEventListener('pointermove', e => {
        pos(e); this.mouse.inside = e.pointerType !== 'touch';
        if (this.drag) { const dx = e.clientX - this.drag.x; this.spin = this.drag.spin + dx * 0.012; this.drag.moved = this.drag.moved || Math.abs(dx) > 5; }
        if (this.panDrag) {
          // botão direito: a peça acompanha o cursor
          const v = this.detailView(this.zoom), dx = e.clientX - this.panDrag.x, dy = e.clientY - this.panDrag.y;
          this.pan.x = this.panDrag.px - dx * v.wv / this.w;
          this.pan.y = this.panDrag.py + dy * v.hv / this.h;
          this.clampPan();
          this.panDrag.moved = this.panDrag.moved || Math.hypot(dx, dy) > 4;
        }
        this.kick();
      });
      st.addEventListener('pointerleave', () => { this.mouse.inside = false; });
      // painel da peça: roda do mouse (ou pinça) aproxima a câmera do ponto sob o cursor
      st.addEventListener('wheel', e => {
        if (this.detail < 0 || e.target !== this.canvas) return;
        e.preventDefault();
        pos(e);
        const d = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
        this.setZoom(this.zoom * Math.exp(-d * 0.0018), true);
      }, { passive: false });
      const touches = new Map();
      st.addEventListener('pointerdown', e => { if (e.pointerType === 'touch') touches.set(e.pointerId, [e.clientX, e.clientY]); });
      st.addEventListener('pointermove', e => {
        if (!touches.has(e.pointerId) || this.detail < 0) return;
        const before = [...touches.values()];
        touches.set(e.pointerId, [e.clientX, e.clientY]);
        if (touches.size !== 2) return;
        const after = [...touches.values()];
        const dist = p => Math.hypot(p[0][0] - p[1][0], p[0][1] - p[1][1]);
        const b = this.canvas.getBoundingClientRect();
        this.mouse.x = (after[0][0] + after[1][0]) / 2 - b.left; this.mouse.y = (after[0][1] + after[1][1]) / 2 - b.top;
        this.drag = null;   // dois dedos: zoom, não giro
        this.setZoom(this.zoom * dist(after) / Math.max(1, dist(before)), true);
      });
      const lift = e => touches.delete(e.pointerId);
      st.addEventListener('pointerup', lift); st.addEventListener('pointercancel', lift);
      st.addEventListener('dblclick', e => {
        if (this.detail < 0 || e.target !== this.canvas) return;
        pos(e);
        if (this.zoom > 1.05 || Math.hypot(this.pan.x, this.pan.y) > 0.01) { this.zoom = 1; this.pan.x = 0; this.pan.y = 0; this.kick(); }
        else this.setZoom(2.2, true);
      });
      this.canvas.addEventListener('contextmenu', e => { if (this.detail >= 0) e.preventDefault(); });
      st.addEventListener('pointerdown', e => {
        if (e.target !== this.canvas) return;
        pos(e);
        if (this.detail >= 0 && e.button === 2) {
          this.panDrag = { x: e.clientX, y: e.clientY, px: this.pan.x, py: this.pan.y, moved: false };
          this.canvas.setPointerCapture(e.pointerId); return;
        }
        if (e.button !== 0) return;
        this.down = { x: e.clientX, y: e.clientY, t: performance.now() };
        if (this.detail >= 0) { this.drag = { x: e.clientX, spin: this.spin, moved: false }; this.canvas.setPointerCapture(e.pointerId); }
      });
      st.addEventListener('pointerup', e => {
        if (this.panDrag) { this.panDrag = null; return; }
        if (e.button !== 0) return;
        if (e.target !== this.canvas) { this.drag = null; return; }
        const d = this.down; this.down = null;
        const wasDrag = this.drag && this.drag.moved; this.drag = null;
        if (!d || wasDrag || Math.hypot(e.clientX - d.x, e.clientY - d.y) > 8) return;
        pos(e);
        const hit = this.pick(true);
        if (this.detail >= 0) { if (hit !== this.detail) this.close(); return; }
        if (hit < 0) { this.active = -1; return; }
        if (e.pointerType === 'touch' && this.active !== hit) { this.active = hit; this.kick(); return; }
        this.open(hit);
      });
    }

    pick(force) {
      if ((!this.mouse.inside && !force) || !this.items.length) return -1;
      const mx = this.mouse.x, my = this.mouse.y;
      let best = -1, bd = Infinity;
      for (let k = 0; k < this.items.length; k++) {
        const it = this.items[k];
        const d = Math.abs(mx - it.sx);
        const left = k > 0 ? this.items[k - 1].sx : -1e9, right = k < this.items.length - 1 ? this.items[k + 1].sx : 1e9;
        const half = Math.min(it.sx - left, right - it.sx) * 0.5;
        if (d < half && d < bd && my > it.sTop - 20 && my < it.sBot + 24) { bd = d; best = k; }
      }
      return best;
    }

    // enquadramento do painel em cada zoom: altura/largura visíveis no plano da peça e o centro sem deslocamento
    detailView(z) {
      const tanH = Math.tan(this.camera.fov * Math.PI / 360), aspect = this.w / this.h;
      const d = (this.mobile ? 3.3 : 2.8) / z, hv = 2 * d * tanH, wv = hv * aspect;
      const it = this.items[this.detail], yc = it ? -it.gar.len * 0.46 + 0.02 : 0;
      const sx = this.mobile ? 0.5 : 0.36, sy = this.mobile ? 0.33 : 0.5;
      return { d, hv, wv, bx: (0.5 - sx) * wv, by: yc - (0.5 - sy) * hv };
    }
    clampPan() {
      const it = this.items[this.detail]; if (!it) return;
      this.pan.x = clamp(this.pan.x, -it.gar.halfW * 1.3, it.gar.halfW * 1.3);
      this.pan.y = clamp(this.pan.y, -it.gar.len * 0.9, it.gar.len * 0.6);
    }
    // zoom no ponto sob o cursor: o ponto da peça que está sob o mouse continua sob o mouse
    setZoom(z, atCursor) {
      const z1 = this.zoom, z2 = clamp(z, 1, 2.8);
      if (this.detail >= 0 && atCursor) {
        const a = this.detailView(z1), b = this.detailView(z2);
        const nx = this.mouse.x / this.w * 2 - 1, ny = 1 - this.mouse.y / this.h * 2;
        const px = a.bx + this.pan.x + nx * a.wv / 2, py = a.by + this.pan.y + ny * a.hv / 2;
        this.pan.x = px - nx * b.wv / 2 - b.bx;
        this.pan.y = py - ny * b.hv / 2 - b.by;
        if (z2 <= 1.001) { this.pan.x *= 0.5; this.pan.y *= 0.5; }   // ao voltar ao 1x, a peça recentra aos poucos
      }
      this.zoom = z2;
      this.clampPan();
      if (this.opts.onZoom) this.opts.onZoom(this.zoom);
      this.kick();
    }
    open(i) {
      this.zoom = 1; this.pan.x = this.pan.y = 0;
      if (this.opts.onZoom) this.opts.onZoom(1);
      this.detail = i; this.side = 0; this.spin = 0; this.active = -1;
      if (this.opts.onOpen) this.opts.onOpen(this.items[i]);
      this.kick();
    }
    close() {
      const was = this.detail;
      this.detail = -1; this.spin = 0; this.zoom = 1;
      if (this.opts.onClose) this.opts.onClose(was);
      this.kick();
    }
    progressFor(i) {
      if (!this.range || !this.items[i]) return 0;
      const [s0, s1] = this.range;
      return s1 > s0 ? clamp((this.items[i].L0 - s0) / (s1 - s0), 0, 1) : 0;
    }
    showSide(back) { this.side = back ? 1 : 0; this.spin = 0; this.kick(); }
    focusItem(i) { this.active = i; this.kick(); }
    setProgress(p) { this.progress = clamp(p, 0, 1); this.kick(); }
    kick() { if (!this.raf) { this.last = performance.now(); this.raf = requestAnimationFrame(this.loop); } }

    resize() {
      const w = this.stage.clientWidth, h = this.stage.clientHeight;
      if (!w || !h) return;
      this.w = w; this.h = h;
      this.mobile = w < 760;
      this.renderer.setSize(w, h, false);
      this.camera.aspect = w / h;
      this.camera.fov = this.mobile ? 24 : 19;
      this.camera.updateProjectionMatrix();
      this.kick();
    }

    /* Fotos de produto renderizadas a partir das mesmas peças 3D (frente e costas). */
    async snapshots(list, w, h) {
      const r2 = new T.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
      r2.setPixelRatio(1); r2.setSize(w, h, false);
      r2.outputColorSpace = T.SRGBColorSpace; r2.toneMapping = T.NeutralToneMapping; r2.toneMappingExposure = 1.04;
      const sc = new T.Scene();
      const pm = new T.PMREMGenerator(r2);
      sc.environment = pm.fromScene(studio(), 0.04).texture; sc.environmentIntensity = 0.6;
      sc.add(new T.HemisphereLight(0xffffff, 0xcac3b7, 0.9));
      const key = new T.DirectionalLight(0xffffff, 2); key.position.set(-1.4, 2.2, 3); sc.add(key);
      const fill = new T.DirectionalLight(0xfff4e6, 0.5); fill.position.set(2.4, 0.4, 2); sc.add(fill);
      const holder = new T.Group(); sc.add(holder);
      holder.add(new T.Mesh(this.parts.hook, this.parts.metalMat));
      const cam = new T.PerspectiveCamera(24, w / h, 0.05, 20);
      const out = [];
      for (const [i, back] of list) {
        const it = this.items[i]; if (!it) { out.push(null); continue; }
        const g = it.yawG, parent = g.parent, U = it.U;
        const keep = { tw: U.uTwist.value, b: U.uBend.value, p: U.uPokeAmt.value, f: U.uFlare.value, wd: U.uWind.value, ry: g.rotation.y };
        U.uTwist.value = 0; U.uBend.value = 0; U.uPokeAmt.value = 0; U.uFlare.value = 0; U.uWind.value = 0;
        holder.add(g); g.rotation.y = back ? Math.PI : 0;
        const top = 0.14, bot = -it.gar.len - 0.04, span = Math.max(top - bot, (it.gar.halfW * 2 + 0.12) / cam.aspect);
        const d = span / (2 * Math.tan(cam.fov * Math.PI / 360)) * 1.02;
        cam.position.set(0, (top + bot) / 2, d); cam.lookAt(0, (top + bot) / 2, 0);
        r2.render(sc, cam);
        parent.add(g); g.rotation.y = keep.ry;
        U.uTwist.value = keep.tw; U.uBend.value = keep.b; U.uPokeAmt.value = keep.p; U.uFlare.value = keep.f; U.uWind.value = keep.wd;
        out.push(await new Promise(res => r2.domElement.toBlob(b => res(b ? URL.createObjectURL(b) : null), 'image/webp', 0.9)));
        await new Promise(res => setTimeout(res, 0));
      }
      pm.dispose(); r2.dispose(); r2.forceContextLoss();
      return out;
    }

    /* ----------------------------------------------------- quadro */
    loop(now) {
      this.raf = 0;
      const dt = Math.min(0.1, Math.max(0.001, (now - this.last) / 1000));
      this.last = now;
      this.time += dt;
      const busy = this.step(dt);
      this.renderer.render(this.scene, this.camera);
      if (this.visible || this.detail >= 0 || busy) this.raf = requestAnimationFrame(this.loop);
    }

    step(dt) {
      const its = this.items, n = its.length;
      const cam = this.camera, tanH = Math.tan(cam.fov * Math.PI / 360);
      const aspect = this.w / this.h;
      // enquadramento: trilho no alto, barras perto da base
      const frac = this.mobile ? 0.4 : 0.5;
      const dist = (0.86 / frac) / (2 * tanH);
      const Hv = 2 * dist * tanH, Wv = Hv * aspect;
      const railFrac = this.mobile ? 0.35 : 0.31;
      const centerY = RAIL_Y - (0.5 - railFrac) * Hv;
      const SP = this.mobile ? 0.3 : 0.37;

      // espaçamento: a peça aberta empurra as vizinhas
      for (const it of its) {
        it.oT = this.detail >= 0 ? (it.i === this.detail ? 6 : 0) : (it.i === this.hovered || it.i === this.active ? 1 : 0);
        it.o = damp(it.o, it.oT, 7, dt);
      }
      let L = 0, L0 = 0, wsum = 0, dsum = 0;
      for (let k = 0; k < n; k++) {
        const it = its[k];
        if (k > 0) {
          const ex = j => its[j].o * Math.max(0, its[j].gar.halfW * 0.98 - SP * 0.5 + 0.05);
          L += SP + ex(k - 1) + ex(k); L0 += SP;
        }
        it.L = L; it.L0 = L0;
        wsum += it.o; dsum += it.o * (L - L0);
      }
      const shift = wsum > 1e-3 ? dsum / wsum : 0;

      // rolagem → deslocamento no arco
      const half = Wv / 2, margin = this.mobile ? 0.2 : 0.42;
      const last = n ? (n - 1) * SP : 0;
      let s0 = half - margin, s1 = last - (half - margin);
      // arara curta (cabe na tela): ainda desliza de lado com a rolagem, atravessando o centro
      const travel = Math.min(last, Wv * 0.55);
      if (s1 - s0 < travel) { s0 = last / 2 - travel / 2; s1 = last / 2 + travel / 2; }
      this.range = [s0, s1];
      let sT = s0 + (s1 - s0) * this.progress;
      if (this.detail >= 0) sT = its[this.detail].L0;
      if (this.s === null) this.s = sT;
      this.s = damp(this.s, sT, this.detail >= 0 ? 5 : 7, dt);

      // câmera
      const lookT = this._v.set(0, centerY, R), posT = this._v2;
      if (this.detail >= 0) {
        this.zoomS = damp(this.zoomS, this.zoom, 12, dt);
        this.panS.x = damp(this.panS.x, this.pan.x, 12, dt); this.panS.y = damp(this.panS.y, this.pan.y, 12, dt);
        const v = this.detailView(this.zoomS);
        lookT.set(v.bx + this.panS.x, v.by + this.panS.y, R);
        posT.set(lookT.x, lookT.y, R + v.d);
      } else {
        posT.set(0, centerY - 0.55, R + dist);
      }
      if (!this.camInit) { this.camPos.copy(posT); this.camLook.copy(lookT); this.camInit = true; }
      // no painel a câmera já vem suavizada pelo zoom/pan; fora dele, transição normal
      const ck = this.detail >= 0 ? (this.zoom > 1.001 || this.panDrag || Math.hypot(this.pan.x, this.pan.y) > 1e-3 ? 40 : 3.2) : 4.2;
      this.camPos.x = damp(this.camPos.x, posT.x, ck, dt); this.camPos.y = damp(this.camPos.y, posT.y, ck, dt); this.camPos.z = damp(this.camPos.z, posT.z, ck, dt);
      this.camLook.x = damp(this.camLook.x, lookT.x, ck, dt); this.camLook.y = damp(this.camLook.y, lookT.y, ck, dt); this.camLook.z = damp(this.camLook.z, lookT.z, ck, dt);
      cam.position.copy(this.camPos); cam.lookAt(this.camLook);
      cam.updateMatrixWorld();

      // hover
      this.hovered = this.detail >= 0 ? -1 : this.pick(false);
      if (this.opts.onHover && this.hovered !== this._lastHover) { this._lastHover = this.hovered; this.opts.onHover(this.hovered >= 0 ? its[this.hovered] : null); }
      this.stage.style.cursor = this.detail >= 0 ? (this.panDrag ? 'move' : this.drag ? 'grabbing' : 'grab') : this.hovered >= 0 ? 'pointer' : '';

      let busy = false, center = -1, cd = Infinity;
      const camLocal = this._v;
      for (const it of its) {
        const ax = it.L - shift - this.s;
        const phi = ax / R;
        it.slot.position.set(R * Math.sin(phi), -ARCH * phi * phi, R * Math.cos(phi));
        it.slot.rotation.y = phi;
        if (it.x === null) it.x = ax;
        const vel = (ax - it.x) / dt; it.x = ax;
        it.acc = damp(it.acc, (vel - it.vel) / dt, 12, dt); it.vel = vel;
        if (Math.abs(ax) < cd) { cd = Math.abs(ax); center = it.i; }

        // alvo de giro
        it.slot.updateMatrixWorld();
        camLocal.copy(cam.position); it.slot.worldToLocal(camLocal);
        const face = Math.atan2(camLocal.x, camLocal.z);
        let target = face + REST;
        const open = this.detail === it.i || it.i === this.hovered || it.i === this.active;
        if (this.detail === it.i) target = face + this.side * Math.PI + this.spin;
        else if (open) target = face;
        // escolhe o caminho mais curto até o alvo
        target = it.yaw.x + wrapPi(target - it.yaw.x);
        if (this.reduced) { it.yaw.x = target; it.yaw.v = 0; } else spring(it.yaw, target, 70, 12.5, dt);
        spring(it.yawB, it.yaw.x, 26, 6.2, dt);
        const twist = clamp(it.yawB.x - it.yaw.x, -1.3, 1.3);
        it.yawG.rotation.y = it.yaw.x;

        // pêndulo ao longo do trilho + tecido atrasado
        if (!this.reduced) {
          spring(it.sw, clamp(-it.acc * 0.032, -0.35, 0.35), it.omega2, 1.5, dt);
          spring(it.bend, clamp(-it.vel * 0.035, -0.06, 0.06), 30, 7, dt);
        }
        it.swing.rotation.z = clamp(it.sw.x, -0.45, 0.45);
        const U = it.U, yw = it.yaw.x;
        U.uTime.value = this.time;
        U.uTwist.value = twist;
        U.uFlare.value = clamp(Math.abs(it.yaw.v) * 0.012, 0, 0.1);
        U.uBend.value = it.bend.x;
        U.uBendDir.value.set(Math.cos(yw), 0, Math.sin(yw));
        it.wind = damp(it.wind, 1 + Math.min(2.5, Math.abs(it.vel) * 2.2), 4, dt);
        U.uWind.value = this.reduced ? 0.3 : it.wind;

        // toque do cursor no tecido
        let pokeT = 0;
        if ((it.i === this.hovered || (this.detail === it.i && !this.drag)) && this.mouse.inside && Math.abs(wrapPi(yw - face - (this.detail === it.i ? this.side * Math.PI : 0))) < 0.5) {
          const ndc = new T.Vector2(this.mouse.x / this.w * 2 - 1, -(this.mouse.y / this.h) * 2 + 1);
          this._ray.setFromCamera(ndc, cam);
          it.yawG.updateMatrixWorld();
          const inv = new T.Matrix4().copy(it.yawG.matrixWorld).invert();
          const o = this._ray.ray.origin.clone().applyMatrix4(inv), d = this._ray.ray.direction.clone().transformDirection(inv);
          const zf = this.side ? -0.03 : 0.03;
          if (Math.abs(d.z) > 1e-4) {
            const t = (zf - o.z) / d.z, hx = o.x + d.x * t, hy = o.y + d.y * t;
            if (t > 0 && Math.abs(hx) < it.gar.halfW && hy < 0 && hy > -it.gar.len) {
              U.uPoke.value.set(hx, hy, 0); pokeT = 1;
            }
          }
        }
        it.poke = damp(it.poke, pokeT * (this.side ? -1 : 1), 6, dt);
        U.uPokeAmt.value = this.reduced ? 0 : it.poke;

        // coluna na tela para o hover
        this._v2.set(0, 0, 0); it.slot.localToWorld(this._v2); this._v2.project(cam);
        it.sx = (this._v2.x * 0.5 + 0.5) * this.w;
        this._v2.set(0, RAIL_Y, 0); it.slot.localToWorld(this._v2); this._v2.project(cam);
        it.sTop = (-this._v2.y * 0.5 + 0.5) * this.h;
        this._v2.set(0, -it.gar.len, 0); it.slot.localToWorld(this._v2); this._v2.project(cam);
        it.sBot = (-this._v2.y * 0.5 + 0.5) * this.h;

        if (Math.abs(it.yaw.v) > 0.01 || Math.abs(it.sw.v) > 0.01 || Math.abs(it.o - it.oT) > 0.002 || Math.abs(it.poke) > 0.01) busy = true;
      }
      if (center !== this.center) { this.center = center; if (this.opts.onCenter) this.opts.onCenter(center, n); }
      if (Math.abs(this.s - sT) > 0.001) busy = true;
      return busy;
    }
  }

  window.GAZU_RAIL = { Rail, brl };
})();
