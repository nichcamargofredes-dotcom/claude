/* GAZU · peças 3D
   Cada peça nasce de uma silhueta 2D que vira uma malha "almofadada" (frente e costas
   costuradas na borda). As texturas são pintadas em canvas e o shader de tecido aplica
   balanço, torção, vento e o toque do cursor direto na GPU. */
(function () {
  'use strict';
  const T = window.THREE;

  /* ------------------------------------------------------------------ 2D */

  // Arredonda cantos: cada ponto [x, y, raio]
  function fillet(pts, segs) {
    segs = segs || 5;
    const out = [], n = pts.length;
    for (let i = 0; i < n; i++) {
      const p = pts[i], r = p[2] || 0;
      if (!r) { out.push([p[0], p[1]]); continue; }
      const a = pts[(i - 1 + n) % n], b = pts[(i + 1) % n];
      const da = Math.hypot(a[0] - p[0], a[1] - p[1]), db = Math.hypot(b[0] - p[0], b[1] - p[1]);
      const ra = Math.min(r, da * 0.45), rb = Math.min(r, db * 0.45);
      const p1 = [p[0] + (a[0] - p[0]) / da * ra, p[1] + (a[1] - p[1]) / da * ra];
      const p2 = [p[0] + (b[0] - p[0]) / db * rb, p[1] + (b[1] - p[1]) / db * rb];
      for (let s = 0; s <= segs; s++) {
        const t = s / segs, u = 1 - t;
        out.push([u * u * p1[0] + 2 * u * t * p[0] + t * t * p2[0], u * u * p1[1] + 2 * u * t * p[1] + t * t * p2[1]]);
      }
    }
    return out;
  }
  // Metade direita (do centro de cima até o centro de baixo) → contorno completo
  function mirror(half) {
    return half.concat(half.slice(1, -1).reverse().map(p => [-p[0], p[1], p[2]]));
  }
  const flipX = pts => pts.map(p => [-p[0], p[1], p[2]]).reverse();

  function resample(poly, ds) {
    const out = [];
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length];
      const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (L < 1e-6) continue;
      const n = Math.max(1, Math.round(L / ds));
      for (let k = 0; k < n; k++) out.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]);
    }
    return out;
  }
  function inside(x, y, poly) {
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c;
    }
    return c;
  }
  function edgeDist(x, y, poly) {
    let m = Infinity;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const ax = poly[j][0], ay = poly[j][1], dx = poly[i][0] - ax, dy = poly[i][1] - ay;
      const l2 = dx * dx + dy * dy || 1e-12;
      let t = ((x - ax) * dx + (y - ay) * dy) / l2;
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      const ex = ax + dx * t - x, ey = ay + dy * t - y, d = ex * ex + ey * ey;
      if (d < m) m = d;
    }
    return Math.sqrt(m);
  }
  function bbox(poly) {
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (const p of poly) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
    return { x0, x1, y0, y1 };
  }

  /* --------------------------------------------------------------- malha */

  // Silhueta → malha com volume. Grupo 0 = frente (textura da frente), grupo 1 = costas.
  function pillow(poly, o, frame) {
    const step = o.step;
    const ring = resample(poly, step * 0.6);
    const b = bbox(poly);
    const xy = [], dd = [];
    for (const p of ring) { xy.push(p[0], p[1]); dd.push(0); }
    // anéis paralelos à borda: a espessura cresce suave, sem serrilhado na silhueta
    const R0 = o.round, N = ring.length;
    for (const f of [0.14, 0.34, 0.58, 0.82]) {
      const d = f * R0;
      let lx = 1e9, ly = 1e9;
      for (let i = 0; i < N; i++) {
        const a = ring[(i - 1 + N) % N], c = ring[(i + 1) % N];
        let nx = -(c[1] - a[1]), ny = c[0] - a[0];
        const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
        let px = ring[i][0] + nx * d, py = ring[i][1] + ny * d;
        if (!inside(px, py, poly)) { px = ring[i][0] - nx * d; py = ring[i][1] - ny * d; }
        if (!inside(px, py, poly)) continue;
        const ed = edgeDist(px, py, poly);
        if (ed < d * 0.8 || Math.hypot(px - lx, py - ly) < step * 0.35) continue;
        xy.push(px, py); dd.push(ed); lx = px; ly = py;
      }
    }
    let row = 0;
    for (let y = b.y0 + step * 0.4; y < b.y1; y += step * 0.866, row++) {
      for (let x = b.x0 + (row & 1 ? step * 0.5 : 0); x < b.x1; x += step) {
        if (!inside(x, y, poly)) continue;
        const d = edgeDist(x, y, poly);
        if (d < Math.max(step * 0.5, R0 * 0.98)) continue;
        xy.push(x, y); dd.push(d);
      }
    }
    const tri = new window.Delaunator(xy).triangles;
    const idx = [], maxE = step * 3.2;
    for (let i = 0; i < tri.length; i += 3) {
      let a = tri[i], bb = tri[i + 1], c = tri[i + 2];
      const ax = xy[2 * a], ay = xy[2 * a + 1], bx = xy[2 * bb], by = xy[2 * bb + 1], cx = xy[2 * c], cy = xy[2 * c + 1];
      if (!inside((ax + bx + cx) / 3, (ay + by + cy) / 3, poly)) continue;
      if (Math.hypot(ax - bx, ay - by) > maxE || Math.hypot(bx - cx, by - cy) > maxE || Math.hypot(cx - ax, cy - ay) > maxE) continue;
      if ((bx - ax) * (cy - ay) - (by - ay) * (cx - ax) < 0) { const t = bb; bb = c; c = t; }
      idx.push(a, bb, c);
    }
    const n = xy.length / 2;
    const pos = new Float32Array(n * 6), uv = new Float32Array(n * 4);
    const R = o.round, Tk = o.thick, back = o.back == null ? 1 : o.back;
    const fw = frame.x1 - frame.x0, fh = frame.y1 - frame.y0;
    for (let i = 0; i < n; i++) {
      const x = xy[2 * i], y = xy[2 * i + 1];
      const t = Math.min(dd[i] / R, 1), pr = Math.sqrt(1 - (1 - t) * (1 - t));
      const m = taper(y), h = Math.min(Math.max(-y / o.len, 0), 1);
      const zc = (typeof o.z0 === 'function' ? o.z0(y, m) : (o.z0 || 0) * m) + o.curve * h * h;
      const fold = o.folds ? o.folds(x, y) * pr : 0;
      const bulge = o.bulge ? o.bulge(x, y) * pr * m : 0;
      const bump = o.bump ? o.bump(x, y) * pr : 0;
      const tk = Math.max(Tk * m, o.minThick || 0) * pr;   // o cabide tem que caber por dentro
      const zf = zc + tk + bulge + bump + fold;
      const zb = zc - tk * back - bulge * 0.5 * back + fold * 0.85;
      pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = zf;
      pos[(n + i) * 3] = x; pos[(n + i) * 3 + 1] = y; pos[(n + i) * 3 + 2] = zb;
      const u = (x - frame.x0) / fw, v = (y - frame.y0) / fh;
      uv[i * 2] = u; uv[i * 2 + 1] = v;
      uv[(n + i) * 2] = 1 - u; uv[(n + i) * 2 + 1] = v;
    }
    const all = new Array(idx.length * 2);
    for (let i = 0; i < idx.length; i += 3) {
      all[i] = idx[i]; all[i + 1] = idx[i + 1]; all[i + 2] = idx[i + 2];
      const j = idx.length + i;
      all[j] = idx[i] + n; all[j + 1] = idx[i + 2] + n; all[j + 2] = idx[i + 1] + n;
    }
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.BufferAttribute(pos, 3));
    g.setAttribute('uv', new T.BufferAttribute(uv, 2));
    g.setIndex(all);
    g.addGroup(0, idx.length, 0);
    g.addGroup(idx.length, idx.length, 1);
    g.computeVertexNormals();
    return g;
  }

  // tecido mais fino perto do cabide, mais solto embaixo
  const taper = y => { const t = Math.min(1, Math.max(0, (-y - 0.02) / 0.3)); return 0.55 + 0.45 * t * t * (3 - 2 * t); };
  // ruído suave para pequenas rugas
  function vnoise(seed) {
    const r = (i, j) => { const v = Math.sin(i * 127.1 + j * 311.7 + seed * 74.7) * 43758.5453; return v - Math.floor(v); };
    return (x, y) => {
      const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j;
      const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
      return (r(i, j) * (1 - sx) + r(i + 1, j) * sx) * (1 - sy) + (r(i, j + 1) * (1 - sx) + r(i + 1, j + 1) * sx) * sy - 0.5;
    };
  }
  // barra levemente ondulada na silhueta
  function waveHem(poly, len, amp, seed) {
    return poly.map(p => {
      const near = Math.max(0, 1 - (p[1] + len) / 0.05);
      return near > 0 ? [p[0], p[1] + amp * near * Math.sin(p[0] * 38 + seed) * Math.sin(p[0] * 13 + seed * 2), p[2]] : p;
    });
  }
  function folds(len, amp, seed, spacing, sideHw) {
    const k = Math.PI * 2 / (spacing || 0.12), nz = vnoise(seed);
    return (x, y) => {
      const h = Math.min(Math.max(-y / len, 0), 1);
      // sob as mangas o corpo fica liso, senão atravessaria a manga
      const side = sideHw ? 1 - Math.min(1, Math.max(0, (Math.abs(x) - (sideHw - 0.1)) / 0.06)) : 1;
      const w = Math.pow(h, 1.4) * side;
      // dobras verticais que abrem na barra + rugas diagonais saindo das pontas do cabide
      const drape = 0.6 * Math.sin(x * k + seed + Math.sin(y * 3.1 + seed) * 0.9) + 0.4 * Math.sin(x * k * 1.73 + seed * 2.1 + y * 1.7);
      const drag = Math.exp(-Math.pow((y + 0.1 + Math.abs(x) * 0.25) / 0.06, 2)) * Math.sin((Math.abs(x) * 0.8 - y) * 55 + seed) * Math.min(1, Math.abs(x) * 5);
      return amp * (w * drape + 0.35 * drag) + 0.0022 * nz(x * 28, y * 18) * (0.3 + h);
    };
  }
  const chest = (hw, amt) => (x) => amt * Math.max(0, 1 - (x / hw) * (x / hw));
  function patchBump(poly, h) {
    return (x, y) => {
      if (!inside(x, y, poly)) return 0;
      return h * Math.min(1, edgeDist(x, y, poly) / 0.012);
    };
  }

  /* ------------------------------------------------------------- shader */

  const CLOTH = `
uniform float uTime, uLen, uTwist, uBend, uFlare, uSeed, uPokeAmt, uPokeR, uWind;
uniform vec3 uBendDir, uPoke;
vec3 clothDeform(vec3 p) {
  float h = clamp(-p.y / uLen, 0.0, 1.0);
  float w = h * h;
  float t = uTime;
  p.z += uWind * w * (0.0055 * sin(t * 1.7 + p.y * 7.0 + p.x * 5.0 + uSeed) + 0.0025 * sin(t * 2.9 + p.x * 11.0 - p.y * 4.0));
  p.x += uWind * w * 0.0028 * sin(t * 1.2 + p.y * 5.0 + uSeed * 1.3);
  vec2 dp = p.xy - uPoke.xy;
  float f = exp(-dot(dp, dp) / (uPokeR * uPokeR));
  p.z -= uPokeAmt * f * (0.026 + 0.0035 * sin(length(dp) * 75.0 - t * 9.0));
  p.xz *= 1.0 + uFlare * w;
  float a = uTwist * pow(h, 1.25);
  float c = cos(a), s = sin(a);
  p.xz = vec2(c * p.x + s * p.z, -s * p.x + c * p.z);
  p += uBendDir * (uBend * w);
  return p;
}
`;
  function patchCloth(mat, U, depth) {
    mat.onBeforeCompile = (sh) => {
      for (const k in U) sh.uniforms[k] = U[k];
      let vs = sh.vertexShader.replace('#include <common>', '#include <common>\n' + CLOTH);
      if (depth) {
        vs = vs.replace('#include <begin_vertex>', 'vec3 transformed = clothDeform(position);');
      } else {
        vs = vs.replace('#include <beginnormal_vertex>', `
  vec3 cN = normalize(normal);
  vec3 cT = normalize(abs(cN.y) < 0.95 ? cross(cN, vec3(0.0, 1.0, 0.0)) : cross(cN, vec3(1.0, 0.0, 0.0)));
  vec3 cB = cross(cN, cT);
  vec3 cP0 = clothDeform(position);
  vec3 objectNormal = normalize(cross(clothDeform(position + cT * 0.003) - cP0, clothDeform(position + cB * 0.003) - cP0));
  #ifdef USE_TANGENT
    vec3 objectTangent = vec3(tangent.xyz);
  #endif`).replace('#include <begin_vertex>', 'vec3 transformed = cP0;');
      }
      sh.vertexShader = vs;
    };
    mat.customProgramCacheKey = () => depth ? 'gazu-cloth-depth' : 'gazu-cloth';
    return mat;
  }
  function makeUniforms(len, seed) {
    return {
      uTime: { value: 0 }, uLen: { value: len }, uTwist: { value: 0 }, uBend: { value: 0 },
      uFlare: { value: 0 }, uSeed: { value: seed }, uPokeAmt: { value: 0 }, uPokeR: { value: 0.085 },
      uWind: { value: 1 }, uBendDir: { value: new T.Vector3(1, 0, 0) }, uPoke: { value: new T.Vector3(0, -0.3, 0) },
    };
  }

  /* ------------------------------------------------------ texturas base */

  function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

  const NOISE = (() => {
    const c = canvas(256, 256), g = c.getContext('2d'), id = g.createImageData(256, 256);
    for (let i = 0; i < id.data.length; i += 4) {
      const v = 255 - Math.random() * 30;
      id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255;
    }
    g.putImageData(id, 0, 0);
    return c;
  })();
  const FIBERS = (() => {
    const c = canvas(256, 256), g = c.getContext('2d');
    g.fillStyle = '#808080'; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 3200; i++) {
      g.strokeStyle = Math.random() < 0.5 ? 'rgba(255,255,255,.45)' : 'rgba(0,0,0,.4)';
      g.lineWidth = 0.5 + Math.random() * 0.9;
      const x = Math.random() * 256, y = Math.random() * 256, l = 2 + Math.random() * 7;
      for (const ox of [0, -256]) for (const oy of [0, -256, 256]) {
        g.beginPath(); g.moveTo(x + ox, y + oy); g.lineTo(x + ox + l, y + oy + (Math.random() - 0.5) * 1.4); g.stroke();
      }
    }
    return c;
  })();

  // Mapas de normal da trama (repetidos sobre a peça)
  function normalMap(kind) {
    const N = 256, hgt = new Float32Array(N * N);
    const rnd = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      let h = 0;
      if (kind === 'jersey' || kind === 'fleece') {
        const cw = kind === 'fleece' ? 8 : 6, cx = x % cw, cy = (y + (Math.floor(x / cw) % 2) * 0) % cw;
        const u = cx / cw - 0.5, v = cy / cw;
        const leg1 = Math.exp(-Math.pow((u + 0.22) - (v - 0.5) * 0.45, 2) / 0.02);
        const leg2 = Math.exp(-Math.pow((u - 0.22) + (v - 0.5) * 0.45, 2) / 0.02);
        h = Math.max(leg1, leg2) * (0.75 + 0.25 * Math.sin(v * Math.PI));
      } else if (kind === 'twill') {
        h = 0.5 + 0.5 * Math.sin((x + y) * Math.PI * 2 / 5) + 0.2 * Math.sin(y * Math.PI * 2 / 2.5);
      } else if (kind === 'waffle') {
        const cx = (x % 16) / 16, cy = (y % 16) / 16;
        h = 1 - Math.pow(Math.max(Math.abs(cx - 0.5), Math.abs(cy - 0.5)) * 2, 6) * 0.9;
        h = 1 - h;
      } else {
        h = ((x % 32 < 1) || (y % 32 < 1)) ? 0.5 : 0;
      }
      hgt[y * N + x] = h + (rnd() - 0.5) * (kind === 'fleece' ? 0.35 : 0.18);
    }
    const c = canvas(N, N), g = c.getContext('2d'), id = g.createImageData(N, N);
    const s = kind === 'nylon' ? 0.6 : 1.6;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const hx = hgt[y * N + (x + 1) % N] - hgt[y * N + (x - 1 + N) % N];
      const hy = hgt[((y + 1) % N) * N + x] - hgt[((y - 1 + N) % N) * N + x];
      let nx = -hx * s, ny = hy * s, nz = 1;
      const l = Math.hypot(nx, ny, nz); nx /= l; ny /= l; nz /= l;
      const i = (y * N + x) * 4;
      id.data[i] = (nx * 0.5 + 0.5) * 255; id.data[i + 1] = (ny * 0.5 + 0.5) * 255; id.data[i + 2] = (nz * 0.5 + 0.5) * 255; id.data[i + 3] = 255;
    }
    g.putImageData(id, 0, 0);
    const tex = new T.CanvasTexture(c);
    tex.wrapS = tex.wrapT = T.RepeatWrapping;
    tex.colorSpace = T.NoColorSpace;
    return tex;
  }
  const NMAPS = {};
  const nmap = kind => NMAPS[kind] || (NMAPS[kind] = normalMap(kind));

  /* ------------------------------------------------------------ pintura */

  function Painter(frame, pxW, mirrorX) {
    const fw = frame.x1 - frame.x0, fh = frame.y1 - frame.y0;
    this.W = Math.round(pxW); this.H = Math.round(pxW * fh / fw);
    this.c = canvas(this.W, this.H);
    this.g = this.c.getContext('2d');
    const k = this.W / fw;
    this.k = k;
    this.X = mirrorX ? x => (frame.x1 - x) * k : x => (x - frame.x0) * k;
    this.Y = y => (frame.y1 - y) * k;
    this.S = v => v * k;
    this.mirror = !!mirrorX;
  }
  Painter.prototype.trace = function (pts, closed) {
    const g = this.g;
    g.beginPath();
    pts.forEach((p, i) => i ? g.lineTo(this.X(p[0]), this.Y(p[1])) : g.moveTo(this.X(p[0]), this.Y(p[1])));
    if (closed !== false) g.closePath();
    return g;
  };
  Painter.prototype.at = function (x, y) { return [this.X(x), this.Y(y)]; };

  function texture(P, base, o) {
    const g = P.g;
    g.fillStyle = base; g.fillRect(0, 0, P.W, P.H);
    if (o.heather) {
      g.save(); g.globalCompositeOperation = 'overlay'; g.globalAlpha = o.heather;
      g.fillStyle = g.createPattern(FIBERS, 'repeat'); g.fillRect(0, 0, P.W, P.H); g.restore();
    }
    g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = o.noise == null ? 0.55 : o.noise;
    g.fillStyle = g.createPattern(NOISE, 'repeat'); g.fillRect(0, 0, P.W, P.H); g.restore();
  }
  function shade(P, poly, color, blur, alpha) {
    const g = P.g; g.save();
    g.globalAlpha = alpha; g.shadowColor = color; g.shadowBlur = P.S(blur);
    g.shadowOffsetX = P.W * 3; g.translate(-P.W * 3, 0);
    g.fillStyle = color; P.trace(poly).fill();
    g.restore();
  }
  function edgeShade(P, poly, w, a) {
    const g = P.g; g.save(); P.trace(poly).clip();
    g.shadowColor = 'rgba(0,0,0,' + a + ')'; g.shadowBlur = P.S(w);
    g.lineWidth = P.S(w * 0.5); g.strokeStyle = 'rgba(0,0,0,' + a + ')';
    P.trace(poly); g.stroke(); g.restore();
  }
  function seam(P, pts, closed, o) {
    o = o || {};
    const g = P.g; g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
    P.trace(pts, closed);
    g.strokeStyle = o.dark || 'rgba(0,0,0,.22)'; g.lineWidth = P.S(o.w || 0.0035); g.stroke();
    if (o.stitch !== false) {
      g.setLineDash([P.S(0.0035), P.S(0.0025)]);
      g.strokeStyle = o.thread || 'rgba(255,255,255,.16)'; g.lineWidth = P.S(0.0011);
      g.stroke();
    }
    g.restore();
  }
  function ribFill(P, poly, color, vertical) {
    const g = P.g; g.save(); P.trace(poly).clip();
    g.fillStyle = color; g.fillRect(0, 0, P.W, P.H);
    g.globalCompositeOperation = 'multiply'; g.globalAlpha = 0.5;
    g.fillStyle = g.createPattern(NOISE, 'repeat'); g.fillRect(0, 0, P.W, P.H);
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    const st = P.S(0.0042);
    if (vertical !== false) {
      for (let x = 0; x < P.W; x += st) {
        g.fillStyle = 'rgba(0,0,0,.16)'; g.fillRect(x, 0, st * 0.4, P.H);
        g.fillStyle = 'rgba(255,255,255,.06)'; g.fillRect(x + st * 0.55, 0, st * 0.2, P.H);
      }
    }
    g.restore();
    seam(P, poly, true, { dark: 'rgba(0,0,0,.18)', w: 0.0025, stitch: false });
  }
  // Gola canelada ao longo de uma curva (listras perpendiculares à curva)
  function ribCurve(P, pts, width, color) {
    const g = P.g, inner = [], outer = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
      let nx = -(b[1] - a[1]), ny = b[0] - a[0]; const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
      inner.push([pts[i][0] - nx * width / 2, pts[i][1] - ny * width / 2]);
      outer.push([pts[i][0] + nx * width / 2, pts[i][1] + ny * width / 2]);
    }
    const band = inner.concat(outer.slice().reverse());
    g.save(); P.trace(band).clip();
    g.fillStyle = color; g.fillRect(0, 0, P.W, P.H);
    g.globalCompositeOperation = 'multiply'; g.globalAlpha = 0.5;
    g.fillStyle = g.createPattern(NOISE, 'repeat'); g.fillRect(0, 0, P.W, P.H);
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    const dense = resample(pts.map(p => [p[0], p[1]]), 0.0042).slice(0, -1);
    g.lineWidth = P.S(0.0016); g.strokeStyle = 'rgba(0,0,0,.18)';
    for (let i = 1; i < dense.length - 1; i++) {
      const a = dense[i - 1], b = dense[i + 1];
      let nx = -(b[1] - a[1]), ny = b[0] - a[0]; const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
      g.beginPath();
      g.moveTo(P.X(dense[i][0] - nx * width), P.Y(dense[i][1] - ny * width));
      g.lineTo(P.X(dense[i][0] + nx * width), P.Y(dense[i][1] + ny * width));
      g.stroke();
    }
    g.restore();
    seam(P, inner, false, { w: 0.0025, stitch: false, dark: 'rgba(0,0,0,.28)' });
    seam(P, outer, false, { w: 0.003, dark: 'rgba(0,0,0,.2)' });
  }
  function hexA(hex, f) { // clareia (f>0) ou escurece (f<0)
    const c = new T.Color(hex); const hsl = {}; c.getHSL(hsl);
    c.setHSL(hsl.h, hsl.s, Math.min(1, Math.max(0, hsl.l + f)));
    return '#' + c.getHexString();
  }
  function text(P, str, x, y, o) {
    const g = P.g; g.save();
    g.translate(P.X(x), P.Y(y));
    g.font = o.font; g.fillStyle = o.color; g.textAlign = o.align || 'center'; g.textBaseline = o.base || 'alphabetic';
    if ('letterSpacing' in g && o.spacing) g.letterSpacing = P.S(o.spacing) + 'px';
    if ('fontStretch' in g && o.stretch) g.fontStretch = o.stretch;
    if (o.arc) { // texto em arco (varsity)
      const chars = [...str], r = P.S(o.arc), total = chars.reduce((s, ch) => s + g.measureText(ch).width, 0) + (chars.length - 1) * P.S(o.spacing || 0);
      let ang = -total / r / 2;
      for (const ch of chars) {
        const w = g.measureText(ch).width;
        g.save();
        const a = ang + w / 2 / r;
        g.translate(Math.sin(a) * r, -Math.cos(a) * r + r);
        g.rotate(a);
        if (o.stroke) { g.lineWidth = P.S(o.stroke); g.strokeStyle = o.strokeColor; g.lineJoin = 'round'; g.strokeText(ch, 0, 0); }
        g.fillText(ch, 0, 0);
        g.restore();
        ang += (w + P.S(o.spacing || 0)) / r;
      }
    } else {
      if (o.stroke) { g.lineWidth = P.S(o.stroke); g.strokeStyle = o.strokeColor; g.lineJoin = 'round'; g.strokeText(str, 0, 0); }
      g.fillText(str, 0, 0);
    }
    g.restore();
  }
  function px(P, mm) { return Math.round(P.S(mm)); }
  function distress(P, x0, y0, x1, y1, a) { // desgaste leve na estampa
    const g = P.g;
    g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = a;
    g.fillStyle = g.createPattern(NOISE, 'repeat');
    g.fillRect(P.X(x0), P.Y(y1), P.S(x1 - x0), P.S(y1 - y0)); g.restore();
  }
  function star(P, x, y, r, color) {
    const g = P.g, [cx, cy] = P.at(x, y), R = P.S(r);
    g.save(); g.fillStyle = color; g.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4 - Math.PI / 2, rr = i % 2 ? R * 0.18 : R;
      g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
    }
    g.closePath(); g.fill(); g.restore();
  }
  function button(P, x, y, r, color) {
    const g = P.g, [cx, cy] = P.at(x, y), R = P.S(r);
    g.save();
    g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = R * 0.6; g.shadowOffsetY = R * 0.25;
    g.fillStyle = color; g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.fill();
    g.shadowColor = 'transparent';
    g.fillStyle = 'rgba(255,255,255,.12)'; g.beginPath(); g.arc(cx - R * 0.2, cy - R * 0.25, R * 0.55, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(0,0,0,.45)';
    for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { g.beginPath(); g.arc(cx + dx * R * 0.28, cy + dy * R * 0.28, R * 0.11, 0, Math.PI * 2); g.fill(); }
    g.restore();
  }
  function zipper(P, x, yTop, yBot, metal) {
    const g = P.g, [cx, t] = P.at(x, yTop), b = P.Y(yBot), w = P.S(0.009);
    g.save();
    g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(cx - w, t, w * 2, b - t);
    g.fillStyle = metal; const tooth = P.S(0.0032);
    for (let y = t; y < b; y += tooth * 2) { g.fillRect(cx - w * 0.55, y, w * 0.55, tooth); g.fillRect(cx, y + tooth, w * 0.55, tooth); }
    // cursor
    g.fillStyle = metal; g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = P.S(0.004);
    g.fillRect(cx - P.S(0.006), t + P.S(0.004), P.S(0.012), P.S(0.018));
    g.fillRect(cx - P.S(0.0035), t + P.S(0.02), P.S(0.007), P.S(0.026));
    g.restore();
  }
  function label(P, x, y, w, h, bg, fg, str) {
    const g = P.g, [cx, cy] = P.at(x, y);
    g.save(); g.fillStyle = bg; g.shadowColor = 'rgba(0,0,0,.25)'; g.shadowBlur = P.S(0.003);
    g.fillRect(cx - P.S(w / 2), cy - P.S(h / 2), P.S(w), P.S(h)); g.restore();
    text(P, str, x, y - h * 0.22, { font: `700 ${px(P, h * 0.55)}px "Archivo Variable", Arial, sans-serif`, color: fg, spacing: 0.0012 });
  }

  /* ------------------------------------------------------------ modelos */

  // Manga pendurada (lado direito)
  function hangSleeve(xi, xo, yTop, capH, xiB, xoB, yBot, cuffH, cuffIn) {
    if (!cuffH) return { poly: [[xi, yTop - capH, 0.012], [(xi + xo) / 2, yTop + 0.004, 0.035], [xo, yTop - capH * 0.9, 0.03], [xoB, yBot, 0.01], [xiB, yBot, 0.01]], cuff: null };
    const poly = [
      [xi, yTop - capH, 0.012],
      [(xi + xo) / 2, yTop + 0.004, 0.035],
      [xo, yTop - capH * 0.9, 0.03],
      [xoB, yBot + cuffH, 0.008],
      [xoB - cuffIn, yBot + cuffH - 0.004, 0],
      [xoB - cuffIn, yBot, 0.008],
      [xiB + cuffIn, yBot, 0.008],
      [xiB + cuffIn, yBot + cuffH - 0.004, 0],
      [xiB, yBot + cuffH, 0.008],
    ];
    const cuff = cuffH ? [[xoB - cuffIn, yBot + cuffH - 0.003], [xoB - cuffIn, yBot + 0.002], [xiB + cuffIn, yBot + 0.002], [xiB + cuffIn, yBot + cuffH - 0.003]] : null;
    return { poly, cuff };
  }

  const TYPES = {};

  // Moletom com capuz (fechado ou com zíper)
  TYPES.hoodie = function (s) {
    const len = 0.69, hw = 0.288, T0 = s.thick || 0.03;
    const body = mirror([[0, 0.004, 0], [0.085, 0.006, 0.02], [0.24, -0.062, 0.045], [0.282, -0.16, 0.03], [hw, -0.598, 0.01], [0.268, -0.61, 0], [0.266, -0.682, 0.012], [0, -0.686, 0]]);
    const sl = hangSleeve(0.205, 0.300, -0.062, 0.05, 0.226, 0.318, -0.692, 0.066, 0.004);
    const hood = [[-0.128, 0.052, 0.07], [0, 0.088, 0.06], [0.128, 0.052, 0.07], [0.166, -0.24, 0.05], [-0.166, -0.24, 0.05]];
    const hoodIn = [[-0.1, 0.03, 0.05], [0, 0.062, 0.05], [0.1, 0.03, 0.05], [0.094, -0.01, 0], [-0.094, -0.01, 0]];
    const pocket = s.zip
      ? null
      : [[-0.14, -0.33], [0.14, -0.33], [0.19, -0.44], [0.19, -0.588], [-0.19, -0.588], [-0.19, -0.44]];
    const hem = [[-0.268, -0.612], [0.268, -0.612], [0.266, -0.68], [-0.266, -0.68]];
    return {
      len, T0, hw,
      parts: [
        { poly: fillet(hood), z0: -T0 * 1.25, thick: T0 * 0.55, round: 0.05, back: 1 },
        { poly: waveHem(fillet(body), len, 0.004, s.seed), z0: 0, thick: T0, round: 0.05, bulge: chest(hw, T0 * 0.35), folds: folds(len, 0.011, s.seed, 0.12, hw), bump: pocket ? patchBump(pocket, 0.0035) : null },
        { poly: fillet(sl.poly), z0: T0 * 0.25, thick: T0 * 0.95, back: 1.45, round: 0.03, folds: folds(len, 0.006, s.seed + 2, 0.08) },
        { poly: fillet(flipX(sl.poly)), z0: T0 * 0.25, thick: T0 * 0.95, back: 1.45, round: 0.03, folds: folds(len, 0.006, s.seed + 4, 0.08) },
      ],
      tubes: s.strings === false ? [] : [
        { pts: [[-0.04, -0.035, 0.006], [-0.046, -0.12, 0.007], [-0.05, -0.24, 0.006]], r: 0.0042 },
        { pts: [[0.04, -0.035, 0.006], [0.047, -0.13, 0.007], [0.052, -0.26, 0.006]], r: 0.0042 },
      ],
      paint(P, side, c) {
        const lining = hexA(c.base, -0.06);
        if (side === 'front') {
          // capuz visto por dentro acima do decote
          texture(P, c.base, c);
          const gIn = P.g.createLinearGradient(0, P.Y(0.07), 0, P.Y(-0.01));
          gIn.addColorStop(0, hexA(c.base, -0.07)); gIn.addColorStop(1, hexA(c.base, -0.16));
          P.g.save(); P.g.fillStyle = gIn; P.trace(fillet(hoodIn)).fill(); P.g.restore();
          shade(P, fillet(hoodIn), 'rgba(0,0,0,.6)', 0.012, 0.25);
          shade(P, fillet(body), 'rgba(0,0,0,.6)', 0.02, 0.35);
          P.g.save(); P.trace(fillet(body)).clip();
          texture(P, c.base, c); P.g.restore();
          edgeShade(P, fillet(body), 0.045, 0.22);
          // decote do capuz (bordas sobrepostas)
          const g = P.g;
          g.save(); g.fillStyle = lining; P.trace([[-0.085, 0.004], [-0.06, -0.03], [-0.012, -0.068], [0.012, -0.068], [0.06, -0.03], [0.085, 0.004], [0.03, 0.03], [-0.03, 0.03]]).fill(); g.restore();
          ribCurve(P, [[-0.1, 0.0], [-0.07, -0.035], [-0.03, -0.062], [0, -0.07]], 0.022, hexA(c.base, 0.015));
          ribCurve(P, [[0.1, 0.0], [0.07, -0.035], [0.03, -0.062], [0, -0.072]], 0.022, hexA(c.base, 0.02));
          shade(P, [[-0.07, -0.03], [0, -0.074], [0.07, -0.03], [0, -0.05]], 'rgba(0,0,0,.5)', 0.01, 0.45);
          // ilhoses
          for (const x of [-0.04, 0.04]) { g.fillStyle = c.metal || '#bdbdbd'; g.beginPath(); g.arc(P.X(x), P.Y(-0.035), P.S(0.005), 0, 7); g.fill(); g.fillStyle = 'rgba(0,0,0,.6)'; g.beginPath(); g.arc(P.X(x), P.Y(-0.035), P.S(0.0026), 0, 7); g.fill(); }
          if (pocket) {
            shade(P, pocket, 'rgba(0,0,0,.5)', 0.012, 0.25);
            g.save(); P.trace(pocket).clip(); texture(P, hexA(c.base, 0.008), c); g.restore();
            seam(P, pocket.slice(0, 3).concat(pocket.slice(3)), true);
            seam(P, [[0.14, -0.33], [0.19, -0.44]], false, { dark: 'rgba(0,0,0,.45)', w: 0.004 });
            seam(P, [[-0.14, -0.33], [-0.19, -0.44]], false, { dark: 'rgba(0,0,0,.45)', w: 0.004 });
          }
          if (s.zip) {
            seam(P, [[-0.14, -0.42], [-0.16, -0.56]], false, { dark: 'rgba(0,0,0,.45)', w: 0.004 });
            seam(P, [[0.14, -0.42], [0.16, -0.56]], false, { dark: 'rgba(0,0,0,.45)', w: 0.004 });
          }
        } else {
          texture(P, c.base, c);
          edgeShade(P, fillet(body), 0.045, 0.22);
        }
        ribFill(P, hem, hexA(c.base, -0.015));
        seam(P, [[-0.268, -0.612], [0.268, -0.612]], false);
        if (s.zip && side === 'front') zipper(P, 0, -0.07, -0.68, c.metal || '#cfcfcf');
        if (c.print) c.print(P, side);
        // mangas por cima
        for (const pl of [sl, { poly: flipX(sl.poly), cuff: sl.cuff.map(p => [-p[0], p[1]]) }]) {
          const poly = fillet(pl.poly);
          shade(P, poly, 'rgba(0,0,0,.7)', 0.03, 0.4);
          P.g.save(); P.trace(poly).clip(); texture(P, hexA(c.base, -0.01), c); edgeShade(P, poly, 0.03, 0.3);
          const gr = P.g.createLinearGradient(P.X(pl.poly[0][0]), 0, P.X(pl.poly[2][0]), 0);
          gr.addColorStop(0, 'rgba(0,0,0,.16)'); gr.addColorStop(0.5, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.1)');
          P.g.fillStyle = gr; P.g.fillRect(0, 0, P.W, P.H); P.g.restore();
          ribFill(P, pl.cuff, hexA(c.base, -0.02));
        }
        if (side === 'back') {
          const hp = fillet(hood);
          shade(P, hp, 'rgba(0,0,0,.6)', 0.025, 0.45);
          P.g.save(); P.trace(hp).clip(); texture(P, hexA(c.base, 0.01), c); P.g.restore();
          seam(P, [[0, 0.115], [0, -0.24]], false);
          if (c.backPrint) c.backPrint(P);
        }
      },
    };
  };

  // Moletom careca / manga longa
  TYPES.crew = function (s) {
    const lite = s.lite, len = lite ? 0.7 : 0.69, hw = lite ? 0.262 : 0.288, T0 = s.thick || (lite ? 0.019 : 0.028);
    const body = mirror([[0, 0.008, 0], [0.078, 0.01, 0.018], [0.232, -0.058, 0.04], [hw - 0.006, -0.16, 0.03], [hw, lite ? -0.69 : -0.598, 0.01]].concat(lite ? [[0, -0.7, 0]] : [[hw - 0.02, -0.61, 0], [hw - 0.022, -0.682, 0.012], [0, -0.686, 0]]));
    const sl = lite
      ? hangSleeve(0.2, 0.278, -0.058, 0.045, 0.214, 0.29, -0.7, 0.055, 0.003)
      : hangSleeve(0.205, 0.300, -0.062, 0.05, 0.226, 0.318, -0.692, 0.066, 0.004);
    const neck = [[-0.098, 0.006], [-0.075, -0.026], [-0.04, -0.047], [0, -0.054], [0.04, -0.047], [0.075, -0.026], [0.098, 0.006]];
    const hem = lite ? null : [[-(hw - 0.02), -0.612], [hw - 0.02, -0.612], [hw - 0.022, -0.68], [-(hw - 0.022), -0.68]];
    return {
      len, T0, hw,
      parts: [
        { poly: fillet(body), z0: 0, thick: T0, round: lite ? 0.03 : 0.05, bulge: chest(hw, T0 * 0.35), folds: folds(len, lite ? 0.013 : 0.011, s.seed, 0.12, hw) },
        { poly: fillet(sl.poly), z0: T0 * 0.25, thick: T0 * 0.95, back: 1.45, round: 0.03, folds: folds(len, 0.006, s.seed + 2, 0.08) },
        { poly: fillet(flipX(sl.poly)), z0: T0 * 0.25, thick: T0 * 0.95, back: 1.45, round: 0.03, folds: folds(len, 0.006, s.seed + 4, 0.08) },
      ],
      tubes: [],
      paint(P, side, c) {
        texture(P, c.base, c);
        edgeShade(P, fillet(body), 0.045, 0.22);
        const g = P.g;
        if (side === 'front') {
          g.save(); g.fillStyle = hexA(c.base, -0.12); P.trace(neck.concat([[0.06, 0.012], [-0.06, 0.012]])).fill(); g.restore();
          // etiqueta interna
          g.save(); g.fillStyle = c.tag || '#f1efea'; g.fillRect(P.X(-0.018), P.Y(0.004), P.S(0.036), P.S(0.02)); g.restore();
          ribCurve(P, neck, lite ? 0.016 : 0.024, c.collar || hexA(c.base, -0.01));
        } else {
          ribCurve(P, [[-0.098, 0.006], [-0.05, 0.0], [0, -0.002], [0.05, 0.0], [0.098, 0.006]], lite ? 0.016 : 0.022, c.collar || hexA(c.base, -0.01));
        }
        if (hem) { ribFill(P, hem, hexA(c.base, -0.015)); seam(P, hem.slice(0, 2), false); }
        else seam(P, [[-hw, -0.675], [hw, -0.675]], false);
        if (c.print) c.print(P, side);
        if (side === 'back' && c.backPrint) c.backPrint(P);
        for (const pl of [sl, { poly: flipX(sl.poly), cuff: sl.cuff.map(p => [-p[0], p[1]]) }]) {
          const poly = fillet(pl.poly);
          shade(P, poly, 'rgba(0,0,0,.7)', 0.028, 0.38);
          g.save(); P.trace(poly).clip(); texture(P, hexA(c.base, -0.01), c); edgeShade(P, poly, 0.03, 0.3);
          const gr = g.createLinearGradient(P.X(pl.poly[0][0]), 0, P.X(pl.poly[2][0]), 0);
          gr.addColorStop(0, 'rgba(0,0,0,.15)'); gr.addColorStop(0.5, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.1)');
          g.fillStyle = gr; g.fillRect(0, 0, P.W, P.H); g.restore();
          ribFill(P, pl.cuff, hexA(c.base, -0.02));
        }
      },
    };
  };

  // Camiseta
  TYPES.tee = function (s) {
    const big = s.oversized, len = big ? 0.74 : 0.715, hw = big ? 0.3 : 0.276, T0 = s.thick || 0.017;
    const sh = big ? [0.262, -0.075] : [0.232, -0.058];
    const half = big
      ? [[0, 0.006, 0], [0.078, 0.008, 0.016], [sh[0], sh[1], 0.03], [0.405, -0.25, 0.008], [0.31, -0.36, 0.008], [hw - 0.004, -0.33, 0.02], [hw, -len + 0.012, 0.012], [0, -len, 0]]
      : [[0, 0.006, 0], [0.075, 0.008, 0.016], [sh[0], sh[1], 0.025], [0.392, -0.196, 0.008], [0.292, -0.318, 0.008], [hw - 0.002, -0.292, 0.02], [hw + 0.004, -len + 0.012, 0.012], [0, -len, 0]];
    const body = mirror(half);
    const neck = [[-0.092, 0.006], [-0.07, -0.024], [-0.036, -0.044], [0, -0.05], [0.036, -0.044], [0.07, -0.024], [0.092, 0.006]];
    const sleeveHem = big ? [[0.405, -0.25], [0.31, -0.36]] : [[0.392, -0.196], [0.292, -0.318]];
    return {
      len, T0, hw,
      parts: [{ poly: waveHem(fillet(body), len, 0.006, s.seed), z0: 0, thick: T0, round: 0.026, bulge: chest(hw, T0 * 0.4), folds: folds(len, 0.014, s.seed, 0.13) }],
      tubes: [],
      paint(P, side, c) {
        texture(P, c.base, c);
        edgeShade(P, fillet(body), 0.045, 0.22);
        const g = P.g;
        if (side === 'front') {
          g.save(); g.fillStyle = hexA(c.base, -0.1); P.trace(neck.concat([[0.06, 0.012], [-0.06, 0.012]])).fill(); g.restore();
          g.save(); g.fillStyle = c.tag || '#f1efea'; g.fillRect(P.X(-0.017), P.Y(0.004), P.S(0.034), P.S(0.018)); g.restore();
          ribCurve(P, neck, 0.016, c.collar || hexA(c.base, -0.01));
        } else {
          ribCurve(P, [[-0.092, 0.006], [-0.05, 0.0], [0, -0.002], [0.05, 0.0], [0.092, 0.006]], 0.014, c.collar || hexA(c.base, -0.01));
        }
        // bainhas
        for (const m of [1, -1]) {
          const a = sleeveHem[0], b = sleeveHem[1];
          const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy), nx = -dy / l * 0.022, ny = dx / l * 0.022;
          seam(P, [[m * (a[0] - nx), a[1] - ny], [m * (b[0] - nx), b[1] - ny]], false);
          seam(P, [[m * sh[0], sh[1]], [m * (sh[0] + (big ? 0.02 : 0.01)), sh[1] - (big ? 0.24 : 0.22)]], false, { stitch: false, dark: 'rgba(0,0,0,.14)', w: 0.003 });
        }
        seam(P, [[-hw, -len + 0.024], [hw, -len + 0.024]], false);
        // sombra das axilas
        for (const m of [1, -1]) shade(P, [[m * (hw - 0.02), -0.28], [m * (hw + 0.03), -0.33], [m * (hw - 0.01), -0.42]], 'rgba(0,0,0,.6)', 0.03, 0.25);
        if (c.print) c.print(P, side);
        if (side === 'back' && c.backPrint) c.backPrint(P);
      },
    };
  };

  // Camisa / overshirt
  TYPES.shirt = function (s) {
    const len = 0.75, hw = 0.282, T0 = s.thick || 0.022;
    const body = mirror([[0, 0.016, 0], [0.078, 0.016, 0.012], [0.236, -0.058, 0.03], [hw - 0.002, -0.15, 0.03], [hw, -0.67, 0.03], [0.2, -0.705, 0.06], [0, -0.75, 0]]);
    const sl = hangSleeve(0.208, 0.302, -0.06, 0.05, 0.226, 0.318, -0.72, 0.07, 0.002);
    const collarR = [[0.012, 0.006, 0.004], [0.082, 0.02, 0.01], [0.118, -0.012, 0.008], [0.072, -0.098, 0.004], [0.006, -0.03, 0.006]];
    const pocketR = [[0.07, -0.16], [0.205, -0.16], [0.205, -0.31], [0.1375, -0.325], [0.07, -0.31]];
    return {
      len, T0, hw,
      parts: [
        { poly: fillet(body), z0: 0, thick: T0, round: 0.035, bulge: chest(hw, T0 * 0.3), folds: folds(len, 0.01, s.seed, 0.14, hw), bump: (x, y) => patchBump(pocketR, 0.003)(Math.abs(x), y) },
        { poly: fillet(collarR), z0: (y, m) => T0 * 1.38 * m + 0.0015, thick: T0 * 0.22, round: 0.008, back: 0.4 },
        { poly: fillet(flipX(collarR)), z0: (y, m) => T0 * 1.38 * m + 0.0015, thick: T0 * 0.22, round: 0.008, back: 0.4 },
        { poly: fillet(sl.poly), z0: T0 * 0.25, thick: T0 * 0.95, back: 1.45, round: 0.03, folds: folds(len, 0.006, s.seed + 2, 0.08) },
        { poly: fillet(flipX(sl.poly)), z0: T0 * 0.25, thick: T0 * 0.95, back: 1.45, round: 0.03, folds: folds(len, 0.006, s.seed + 4, 0.08) },
      ],
      tubes: [],
      paint(P, side, c) {
        texture(P, c.base, c);
        edgeShade(P, fillet(body), 0.045, 0.22);
        const g = P.g;
        if (side === 'front') {
          g.save(); g.fillStyle = hexA(c.base, -0.1); P.trace([[-0.08, 0.016], [0.08, 0.016], [0.0, -0.05]]).fill(); g.restore();
          // vista e botões
          seam(P, [[-0.018, -0.03], [-0.018, -0.735]], false);
          seam(P, [[0.018, -0.03], [0.018, -0.735]], false, { dark: 'rgba(0,0,0,.3)' });
          for (let y = -0.1; y > -0.7; y -= 0.105) button(P, 0, y, 0.0065, c.button || '#1c1c1c');
          for (const m of [1, -1]) {
            const pk = pocketR.map(p => [m * p[0], p[1]]);
            shade(P, pk, 'rgba(0,0,0,.6)', 0.01, 0.3);
            g.save(); P.trace(pk).clip(); texture(P, hexA(c.base, 0.01), c); g.restore();
            seam(P, pk, true);
            const flap = [[m * 0.066, -0.152], [m * 0.209, -0.152], [m * 0.209, -0.2], [m * 0.1375, -0.212], [m * 0.066, -0.2]];
            shade(P, flap, 'rgba(0,0,0,.7)', 0.008, 0.45);
            g.save(); P.trace(flap).clip(); texture(P, hexA(c.base, 0.02), c); g.restore();
            seam(P, flap, true);
            button(P, m * 0.1375, -0.198, 0.0055, c.button || '#1c1c1c');
          }
          if (c.label) label(P, -0.1375, -0.26, 0.04, 0.016, c.label[0], c.label[1], 'GAZU');
          // golas
          for (const m of [1, -1]) {
            const cp = fillet(m > 0 ? collarR : flipX(collarR));
            shade(P, cp, 'rgba(0,0,0,.8)', 0.012, 0.5);
            g.save(); P.trace(cp).clip(); texture(P, hexA(c.base, 0.025), c); g.restore();
            seam(P, cp, true, { w: 0.002 });
          }
        } else {
          seam(P, [[-0.236, -0.12], [0, -0.135], [0.236, -0.12]], false);
          g.save(); g.fillStyle = hexA(c.base, 0.02); P.trace([[-0.09, 0.016], [0.09, 0.016], [0.1, -0.012], [-0.1, -0.012]]).fill(); g.restore();
          seam(P, [[-0.1, -0.012], [0.1, -0.012]], false);
        }
        seam(P, [[-hw, -0.66], [-0.2, -0.69], [0, -0.732], [0.2, -0.69], [hw, -0.66]], false);
        for (const pl of [sl, { poly: flipX(sl.poly), cuff: sl.cuff.map(p => [-p[0], p[1]]) }]) {
          const poly = fillet(pl.poly);
          shade(P, poly, 'rgba(0,0,0,.7)', 0.028, 0.4);
          g.save(); P.trace(poly).clip(); texture(P, hexA(c.base, -0.01), c); edgeShade(P, poly, 0.03, 0.3);
          const gr = g.createLinearGradient(P.X(pl.poly[0][0]), 0, P.X(pl.poly[2][0]), 0);
          gr.addColorStop(0, 'rgba(0,0,0,.16)'); gr.addColorStop(0.5, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.1)');
          g.fillStyle = gr; g.fillRect(0, 0, P.W, P.H); g.restore();
          seam(P, pl.cuff, true);
          const cx = (pl.cuff[0][0] + pl.cuff[2][0]) / 2;
          if (side === 'front') button(P, cx, -0.685, 0.0048, c.button || '#1c1c1c');
        }
      },
    };
  };

  // Sobretudo / trench
  TYPES.coat = function (s) {
    const len = 1.06, hw = 0.3, T0 = s.thick || 0.03;
    const body = mirror([[0, 0.018, 0], [0.084, 0.018, 0.014], [0.244, -0.06, 0.035], [hw - 0.006, -0.16, 0.03], [hw, -0.5, 0.06], [0.336, -len + 0.012, 0.014], [0, -len, 0]]);
    const sl = hangSleeve(0.21, 0.312, -0.062, 0.05, 0.236, 0.334, -0.80, 0.0, 0.0);
    const lapelR = [[0.016, 0.01, 0.004], [0.088, 0.024, 0.01], [0.128, -0.022, 0.006], [0.112, -0.052, 0], [0.168, -0.09, 0.006], [0.072, -0.38, 0.004], [0.04, -0.3, 0.01], [0.01, -0.05, 0.004]];
    return {
      len, T0, hw,
      parts: [
        { poly: waveHem(fillet(body), len, 0.006, s.seed), z0: 0, thick: T0, round: 0.05, bulge: chest(hw, T0 * 0.3), folds: folds(len, 0.015, s.seed, 0.17, hw + 0.02) },
        { poly: fillet(lapelR), z0: (y, m) => T0 * 1.38 * m + 0.0015, thick: T0 * 0.2, round: 0.01, back: 0.4 },
        { poly: fillet(flipX(lapelR)), z0: (y, m) => T0 * 1.38 * m + 0.0015, thick: T0 * 0.2, round: 0.01, back: 0.4 },
        { poly: fillet(sl.poly), z0: T0 * 0.25, thick: T0 * 0.95, back: 1.45, round: 0.035, folds: folds(len, 0.005, s.seed + 2, 0.09) },
        { poly: fillet(flipX(sl.poly)), z0: T0 * 0.25, thick: T0 * 0.95, back: 1.45, round: 0.035, folds: folds(len, 0.005, s.seed + 4, 0.09) },
      ],
      tubes: [],
      paint(P, side, c) {
        texture(P, c.base, c);
        edgeShade(P, fillet(body), 0.045, 0.22);
        const g = P.g;
        const belt = [[-0.31, -0.43], [0.31, -0.43], [0.312, -0.475], [-0.312, -0.475]];
        if (side === 'front') {
          g.save(); g.fillStyle = hexA(c.base, -0.14); P.trace([[-0.084, 0.018], [0.084, 0.018], [0.0, -0.1]]).fill(); g.restore();
          seam(P, [[0.072, -0.38], [0.11, -1.045]], false, { dark: 'rgba(0,0,0,.35)', w: 0.004 });
          for (const y of [-0.33, -0.56, -0.72]) for (const x of [-0.105, 0.105]) button(P, x, y, 0.009, c.button || '#2a2622');
          // pala de tempestade
          const flap = [[0.1, -0.06], [0.26, -0.07], [0.27, -0.24], [0.16, -0.26]];
          shade(P, flap, 'rgba(0,0,0,.7)', 0.012, 0.35);
          g.save(); P.trace(flap).clip(); texture(P, hexA(c.base, 0.015), c); g.restore();
          seam(P, flap, true);
          // bolsos faca
          for (const m of [1, -1]) seam(P, [[m * 0.17, -0.58], [m * 0.24, -0.7]], false, { dark: 'rgba(0,0,0,.45)', w: 0.005 });
        } else {
          const yoke = [[-0.25, -0.06], [0.25, -0.06], [0.26, -0.27], [0, -0.3], [-0.26, -0.27]];
          shade(P, yoke, 'rgba(0,0,0,.7)', 0.014, 0.3);
          g.save(); P.trace(yoke).clip(); texture(P, hexA(c.base, 0.012), c); g.restore();
          seam(P, yoke, true);
          seam(P, [[0, -0.5], [0, -1.05]], false, { dark: 'rgba(0,0,0,.35)', w: 0.004 });
        }
        // cinto
        shade(P, belt, 'rgba(0,0,0,.8)', 0.01, 0.45);
        g.save(); P.trace(belt).clip(); texture(P, hexA(c.base, 0.02), c); g.restore();
        seam(P, belt, true);
        if (side === 'front') {
          const [bx, by] = P.at(0.14, -0.4525);
          g.save(); g.strokeStyle = c.buckle || '#3b3631'; g.lineWidth = P.S(0.006); g.strokeRect(bx - P.S(0.025), by - P.S(0.026), P.S(0.05), P.S(0.052)); g.restore();
          // ponta solta do cinto
          const tail = [[0.165, -0.44], [0.205, -0.45], [0.19, -0.62], [0.165, -0.62]];
          shade(P, tail, 'rgba(0,0,0,.8)', 0.01, 0.5);
          g.save(); P.trace(tail).clip(); texture(P, hexA(c.base, 0.025), c); g.restore();
          seam(P, tail, true);
          for (const m of [1, -1]) {
            const lp = fillet(m > 0 ? lapelR : flipX(lapelR));
            shade(P, lp, 'rgba(0,0,0,.8)', 0.014, 0.5);
            g.save(); P.trace(lp).clip(); texture(P, hexA(c.base, 0.03), c); g.restore();
            seam(P, lp, true, { w: 0.0022 });
          }
        }
        for (const pl of [sl, { poly: flipX(sl.poly) }]) {
          const poly = fillet(pl.poly);
          shade(P, poly, 'rgba(0,0,0,.7)', 0.03, 0.4);
          g.save(); P.trace(poly).clip(); texture(P, hexA(c.base, -0.01), c); edgeShade(P, poly, 0.03, 0.3);
          const gr = g.createLinearGradient(P.X(pl.poly[0][0]), 0, P.X(pl.poly[2][0]), 0);
          gr.addColorStop(0, 'rgba(0,0,0,.16)'); gr.addColorStop(0.5, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.1)');
          g.fillStyle = gr; g.fillRect(0, 0, P.W, P.H); g.restore();
          const xi = pl.poly[0][0] > 0 ? 0.236 : -0.334, xo = pl.poly[0][0] > 0 ? 0.334 : -0.236;
          const strap = [[xi, -0.72], [xo, -0.72], [xo, -0.745], [xi, -0.745]];
          shade(P, strap, 'rgba(0,0,0,.8)', 0.008, 0.4);
          g.save(); P.trace(strap).clip(); texture(P, hexA(c.base, 0.025), c); g.restore();
          seam(P, strap, true, { w: 0.002 });
        }
      },
    };
  };

  // Jaqueta bomber
  TYPES.bomber = function (s) {
    const len = 0.62, hw = 0.292, T0 = s.thick || 0.042;
    const body = mirror([[0, 0.012, 0], [0.08, 0.014, 0.02], [0.24, -0.06, 0.045], [hw - 0.004, -0.15, 0.04], [hw + 0.006, -0.52, 0.02], [0.272, -0.545, 0], [0.27, -0.612, 0.015], [0, -0.616, 0]]);
    const sl = hangSleeve(0.205, 0.306, -0.062, 0.05, 0.226, 0.322, -0.67, 0.07, 0.006);
    const hem = [[-0.272, -0.548], [0.272, -0.548], [0.27, -0.61], [-0.27, -0.61]];
    return {
      len, T0, hw,
      parts: [
        { poly: fillet(body), z0: 0, thick: T0, round: 0.06, bulge: chest(hw, T0 * 0.3), folds: folds(len, 0.009, s.seed, 0.1, hw) },
        { poly: fillet(sl.poly), z0: T0 * 0.25, thick: T0 * 0.9, back: 1.5, round: 0.04, folds: folds(len, 0.006, s.seed + 2, 0.07) },
        { poly: fillet(flipX(sl.poly)), z0: T0 * 0.25, thick: T0 * 0.9, back: 1.5, round: 0.04, folds: folds(len, 0.006, s.seed + 4, 0.07) },
      ],
      tubes: [],
      paint(P, side, c) {
        texture(P, c.base, c);
        edgeShade(P, fillet(body), 0.045, 0.22);
        const g = P.g;
        const rib = c.rib || '#1a1a1a';
        if (side === 'front') {
          ribCurve(P, [[-0.1, 0.012], [-0.075, -0.03], [-0.04, -0.058], [-0.012, -0.066]], 0.03, rib);
          ribCurve(P, [[0.1, 0.012], [0.075, -0.03], [0.04, -0.058], [0.012, -0.066]], 0.03, rib);
          zipper(P, 0, -0.06, -0.6, c.metal || '#b8b4aa');
          for (const m of [1, -1]) seam(P, [[m * 0.15, -0.3], [m * 0.2, -0.46]], false, { dark: 'rgba(0,0,0,.45)', w: 0.006 });
          if (c.patch) label(P, -0.14, -0.15, 0.05, 0.018, c.patch[0], c.patch[1], 'GAZU');
        } else {
          ribCurve(P, [[-0.1, 0.012], [-0.05, 0.004], [0, 0.002], [0.05, 0.004], [0.1, 0.012]], 0.03, rib);
          seam(P, [[-0.24, -0.1], [0, -0.12], [0.24, -0.1]], false);
        }
        ribFill(P, hem, rib);
        for (const [i, pl] of [sl, { poly: flipX(sl.poly), cuff: sl.cuff.map(p => [-p[0], p[1]]) }].entries()) {
          const poly = fillet(pl.poly);
          shade(P, poly, 'rgba(0,0,0,.7)', 0.03, 0.4);
          g.save(); P.trace(poly).clip(); texture(P, hexA(c.base, -0.01), c); edgeShade(P, poly, 0.03, 0.3);
          const gr = g.createLinearGradient(P.X(pl.poly[0][0]), 0, P.X(pl.poly[2][0]), 0);
          gr.addColorStop(0, 'rgba(0,0,0,.18)'); gr.addColorStop(0.5, 'rgba(255,255,255,.04)'); gr.addColorStop(1, 'rgba(0,0,0,.12)');
          g.fillStyle = gr; g.fillRect(0, 0, P.W, P.H); g.restore();
          ribFill(P, pl.cuff, rib);
          if (i === 1 && side === 'front') { // bolso utilitário na manga
            const pk = [[-0.23, -0.17], [-0.3, -0.17], [-0.3, -0.25], [-0.23, -0.25]];
            shade(P, pk, 'rgba(0,0,0,.7)', 0.008, 0.4);
            g.save(); P.trace(pk).clip(); texture(P, hexA(c.base, 0.02), c); g.restore();
            seam(P, pk, true);
            zipper(P, -0.265, -0.175, -0.19, c.metal || '#b8b4aa');
          }
        }
      },
    };
  };

  /* ------------------------------------------------------------ estampas */

  const FONT = '"Archivo Variable", "Arial Black", Arial, sans-serif';
  const PRINTS = {
    varsity(color, sub) {
      return (P, side) => {
        if (side !== 'front') return;
        text(P, 'GAZU', 0, -0.205, { font: `800 ${px(P, 0.085)}px ${FONT}`, color, arc: 0.42, spacing: 0.004, stretch: 'expanded', stroke: 0.006, strokeColor: sub });
        text(P, 'EST. 2019', 0, -0.255, { font: `600 ${px(P, 0.016)}px ${FONT}`, color, spacing: 0.004 });
        distress(P, -0.2, -0.27, 0.2, -0.11, 0.35);
      };
    },
    reign(color, accent) {
      return (P, side) => {
        if (side !== 'front') return;
        star(P, 0, -0.135, 0.016, accent);
        text(P, 'Gazu', 0, -0.235, { font: `400 ${px(P, 0.105)}px "UnifrakturMaguntia", "Old English Text MT", serif`, color });
        text(P, 'EST. 2019', 0, -0.27, { font: `600 ${px(P, 0.0125)}px ${FONT}`, color, spacing: 0.003 });
        distress(P, -0.15, -0.28, 0.15, -0.12, 0.25);
      };
    },
    chest(color, str) {
      return (P, side) => {
        if (side !== 'front') return;
        text(P, str || 'GAZU', -0.13, -0.15, { font: `700 ${px(P, 0.018)}px ${FONT}`, color, spacing: 0.0035, stretch: 'expanded' });
      };
    },
    center(color, str) {
      return (P, side) => {
        if (side !== 'front') return;
        text(P, str || 'GAZU', 0, -0.17, { font: `700 ${px(P, 0.022)}px ${FONT}`, color, spacing: 0.006, stretch: 'expanded' });
      };
    },
    motion(color) {
      return (P, side) => {
        if (side !== 'front') return;
        text(P, 'EM', 0, -0.16, { font: `800 ${px(P, 0.05)}px ${FONT}`, color, spacing: 0.002, stretch: 'condensed' });
        text(P, 'MOVIMENTO', 0, -0.205, { font: `800 ${px(P, 0.05)}px ${FONT}`, color, spacing: 0.002, stretch: 'condensed' });
        text(P, 'GAZU — SÃO PAULO', 0, -0.232, { font: `500 ${px(P, 0.011)}px ${FONT}`, color, spacing: 0.003 });
        distress(P, -0.2, -0.24, 0.2, -0.12, 0.35);
      };
    },
  };
  const BACKS = {
    big(color, line) {
      return (P) => {
        text(P, 'GAZU', 0, -0.25, { font: `800 ${px(P, 0.11)}px ${FONT}`, color, spacing: 0.006, stretch: 'expanded' });
        text(P, line || 'MODA QUE SE MOVE COM VOCÊ', 0, -0.29, { font: `600 ${px(P, 0.0135)}px ${FONT}`, color, spacing: 0.005 });
        distress(P, -0.25, -0.3, 0.25, -0.15, 0.3);
      };
    },
    neck(color, str) {
      return (P) => text(P, str, 0, -0.06, { font: `700 ${px(P, 0.012)}px ${FONT}`, color, spacing: 0.005, stretch: 'expanded' });
    },
  };

  /* ------------------------------------------------------------ catálogo */

  const CATALOG = [
    { id: 'orbit', name: 'Moletom Orbit', type: 'hoodie', price: 389, colorName: 'Areia', base: '#c9bba1', fabric: 'fleece', heather: 0.18,
      print: PRINTS.chest('#a8997f'), backPrint: BACKS.neck('#a8997f', 'ORBIT'),
      desc: 'Moletom felpado com capuz forrado, bolso canguru e punhos canelados. Caimento amplo, ombro levemente caído.',
      specs: ['Moletom felpado 420 g/m²', '100% algodão orgânico', 'Capuz forrado com cordão encerado'] },
    { id: 'varsity', name: 'Moletom Varsity', type: 'hoodie', price: 419, colorName: 'Verde floresta', base: '#20392b', fabric: 'fleece',
      print: PRINTS.varsity('#ece6d6', '#20392b'),
      desc: 'Capuz pesado com estampa universitária em silk craquelado. Feito para encarar o frio de julho em São Paulo.',
      specs: ['Moletom felpado 440 g/m²', '100% algodão', 'Silk à base d’água'] },
    { id: 'reign', name: 'Camiseta Reign', type: 'tee', price: 199, colorName: 'Preto', base: '#1b1b1c', fabric: 'jersey', collar: '#c89aa3',
      print: PRINTS.reign('#efeae4', '#d8a9b2'), backPrint: BACKS.neck('#d8a9b2', 'GAZU · EST. 2019'),
      desc: 'Malha penteada encorpada com estampa gótica na frente e gola canelada em rosé.',
      specs: ['Malha 240 g/m²', '100% algodão penteado', 'Modelagem regular'] },
    { id: 'chama', name: 'Camiseta Chama', type: 'model', model: 'chama', guide: 'oversized', kind: 'camiseta', price: 219, colorName: 'Preto', base: '#161617', fabric: 'jersey',
      desc: 'Camiseta oversized com o rosto em chamas azuis em silk de alta definição e a assinatura “Authentic Brazilian Streetwear” logo abaixo.',
      specs: ['Malha 240 g/m²', '100% algodão penteado', 'Modelagem oversized, ombro caído'] },
    { id: 'careca', name: 'Moletom Careca', type: 'crew', price: 329, colorName: 'Cinza mescla', base: '#9b9a97', heather: 0.5, fabric: 'fleece',
      print: PRINTS.center('#7f7e7b'),
      desc: 'O careca de todo dia, com gola canelada larga, barra e punhos firmes e bordado tom sobre tom.',
      specs: ['Moletom flanelado 380 g/m²', '80% algodão, 20% poliéster reciclado', 'Bordado tom sobre tom'] },
    { id: 'overshirt', name: 'Overshirt Sarja', type: 'shirt', price: 549, colorName: 'Preto', base: '#202021', fabric: 'twill', button: '#121212', label: ['#e9e5dc', '#1a1a1a'],
      desc: 'Camisa-jaqueta em sarja pesada com dois bolsos de lapela. Use sozinha ou por cima do moletom.',
      specs: ['Sarja 12 oz', '100% algodão', 'Botões em corozo'] },
    { id: 'ziper', name: 'Moletom Zíper', type: 'hoodie', zip: true, price: 399, colorName: 'Gelo', base: '#cfcdc8', heather: 0.22, fabric: 'fleece', metal: '#9a9893',
      print: PRINTS.chest('#a9a7a2'),
      desc: 'Capuz com zíper metálico de duas vias e bolsos laterais. Fecha até o queixo ou fica aberto por cima da camiseta.',
      specs: ['Moletom felpado 420 g/m²', '100% algodão orgânico', 'Zíper metálico de duas vias'] },
    { id: 'atlas', name: 'Trench Atlas', type: 'coat', price: 789, colorName: 'Taupe', base: '#7d766a', fabric: 'twill', button: '#2b2723',
      desc: 'Sobretudo amplo em gabardine com cinto, pala de tempestade e bolsos faca. É o casaco que o modelo usa na campanha.',
      specs: ['Gabardine de algodão 260 g/m²', 'Forro em viscose', 'Repelente à água'] },
    { id: 'oversized', name: 'Camiseta Oversized', type: 'tee', oversized: true, price: 179, colorName: 'Off-white', base: '#ebe7de', fabric: 'jersey',
      print: PRINTS.chest('#3a3936', 'gazu'), backPrint: BACKS.big('#2d2c2a', 'SÃO PAULO · 2026'),
      desc: 'Corte quadrado, ombro caído e malha que segura a forma. Estampa grande nas costas.',
      specs: ['Malha 260 g/m²', '100% algodão penteado', 'Modelagem oversized'] },
    { id: 'noir', name: 'Moletom Noir', type: 'hoodie', price: 389, colorName: 'Preto', base: '#1c1c1d', fabric: 'fleece',
      print: PRINTS.chest('#8c8c8c'), backPrint: BACKS.big('#d9d6cf'),
      desc: 'O capuz preto absoluto, com a assinatura GAZU grande nas costas.',
      specs: ['Moletom felpado 420 g/m²', '100% algodão orgânico', 'Silk à base d’água'] },
    { id: 'waffle', name: 'Manga Longa Waffle', type: 'crew', lite: true, price: 229, colorName: 'Verde musgo', base: '#4f5a40', fabric: 'waffle',
      print: PRINTS.chest('#3f4833'),
      desc: 'Malha waffle macia, que respira. Funciona como base sob a jaqueta ou sozinha no meio da estação.',
      specs: ['Malha waffle 220 g/m²', '100% algodão', 'Punhos canelados'] },
    { id: 'bomber', name: 'Bomber Nylon', type: 'bomber', price: 599, colorName: 'Oliva', base: '#4d523a', fabric: 'nylon', rib: '#1d1e1a', patch: ['#1d1e1a', '#d8d4c7'],
      desc: 'Bomber acolchoada em nylon acetinado, com bolso utilitário na manga e ribanas grossas.',
      specs: ['Nylon 70D acetinado', 'Enchimento 120 g', 'Forro laranja de segurança'] },
    { id: 'grafite', name: 'Camiseta Movimento', type: 'tee', price: 199, colorName: 'Grafite', base: '#3d3e41', fabric: 'jersey',
      print: PRINTS.motion('#e5e1d8'), backPrint: BACKS.neck('#bdbab3', 'GAZU'),
      desc: 'Malha pesada com a estampa “Em movimento” em silk na frente e a assinatura GAZU na nuca.',
      specs: ['Malha 240 g/m²', '100% algodão penteado', 'Modelagem regular'] },
  ];

  const FABRIC = {
    fleece: { roughness: 0.94, sheen: 1, sheenRoughness: 0.75, ns: 0.3, tile: 0.045 },
    jersey: { roughness: 0.9, sheen: 0.7, sheenRoughness: 0.55, ns: 0.4, tile: 0.035 },
    twill: { roughness: 0.82, sheen: 0.35, sheenRoughness: 0.45, ns: 0.35, tile: 0.03 },
    waffle: { roughness: 0.92, sheen: 0.6, sheenRoughness: 0.6, ns: 0.9, tile: 0.06 },
    nylon: { roughness: 0.42, sheen: 0.25, sheenRoughness: 0.3, ns: 0.25, tile: 0.08 },
  };

  /* --------------------------------------------------------- montagem 3D */

  /* Peças modeladas no Blender: js/models/<nome>.js traz a malha quantizada e a textura assada. */
  const MODEL_TEX = {};
  function preload(spec) {
    if (spec.type !== 'model') return Promise.resolve();
    const load = () => new Promise((res, rej) => {
      if (window.GAZU_MODELS && window.GAZU_MODELS[spec.model]) return res();
      const sc = document.createElement('script');
      sc.src = 'js/models/' + spec.model + '.js'; sc.onload = res; sc.onerror = () => rej(new Error('modelo ' + spec.model + ' não carregou'));
      document.head.appendChild(sc);
    });
    return load().then(() => MODEL_TEX[spec.model] || new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => { const c = canvas(img.naturalWidth, img.naturalHeight); c.getContext('2d').drawImage(img, 0, 0); MODEL_TEX[spec.model] = c; res(c); };
      img.onerror = rej; img.src = window.GAZU_MODELS[spec.model].tex;
    }));
  }
  function modelGeometry(buf, meta, part, withUv) {
    const R = meta.R, p = meta[part];
    const qp = new Int16Array(buf, p.pos, p.n * 3), qn = new Int8Array(buf, p.nor, p.n * 3);
    const pos = new Float32Array(p.n * 3), nor = new Float32Array(p.n * 3);
    for (let i = 0; i < p.n * 3; i++) { pos[i] = qp[i] / 32767 * R; nor[i] = qn[i] / 127; }
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.BufferAttribute(pos, 3));
    g.setAttribute('normal', new T.BufferAttribute(nor, 3));
    if (withUv) {
      const qu = new Uint16Array(buf, p.uv, p.n * 2), uv = new Float32Array(p.n * 2);
      for (let i = 0; i < uv.length; i++) uv[i] = qu[i] / 65535;
      g.setAttribute('uv', new T.BufferAttribute(uv, 2));
    }
    g.setIndex(new T.BufferAttribute(new Uint16Array(buf, p.idx, p.i).slice(), 1));
    return g;
  }
  function buildModel(spec, q) {
    const M = window.GAZU_MODELS[spec.model], meta = M.meta;
    const bin = atob(M.bin), buf = new ArrayBuffer(bin.length), u8 = new Uint8Array(buf);
    for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    const map = new T.CanvasTexture(MODEL_TEX[spec.model]);
    map.colorSpace = T.SRGBColorSpace; map.anisotropy = q.aniso || 4;
    const fab = FABRIC[spec.fabric] || FABRIC.jersey;
    const nm = nmap('jersey').clone(); nm.needsUpdate = true; nm.repeat.set(1.2 / fab.tile * 0.5, 0.8 / fab.tile);
    const U = makeUniforms(meta.len, spec.seed || 3);
    const cloth = patchCloth(new T.MeshPhysicalMaterial({
      map, normalMap: nm, normalScale: new T.Vector2(fab.ns, fab.ns), roughness: fab.roughness, metalness: 0,
      sheen: fab.sheen, sheenRoughness: fab.sheenRoughness, sheenColor: new T.Color('#5a5a5c'), side: T.DoubleSide,
    }), U);
    const ink = patchCloth(new T.MeshStandardMaterial({ color: '#e9e8e4', roughness: 0.62 }), U);
    const depthMat = patchCloth(new T.MeshDepthMaterial({ depthPacking: T.RGBADepthPacking }), U, true);
    const group = new T.Group();
    const shirt = new T.Mesh(modelGeometry(buf, meta, 'shirt', true), cloth);
    const text = new T.Mesh(modelGeometry(buf, meta, 'text', false), ink);
    for (const m of [shirt, text]) { m.customDepthMaterial = depthMat; m.castShadow = true; group.add(m); }
    return { group, uniforms: U, len: meta.len, halfW: meta.halfW, thick: meta.depth, textures: [map], materials: [cloth, ink] };
  }

  function build(spec, q) {
    q = q || {};
    if (spec.type === 'model') return buildModel(spec, q);
    const step = q.step || 0.012;
    const model = TYPES[spec.type]({ ...spec, seed: spec.seed || Math.random() * 6 });
    let fb = { x0: Infinity, x1: -Infinity, y0: Infinity, y1: -Infinity };
    for (const p of model.parts) { const b = bbox(p.poly); fb.x0 = Math.min(fb.x0, b.x0); fb.x1 = Math.max(fb.x1, b.x1); fb.y0 = Math.min(fb.y0, b.y0); fb.y1 = Math.max(fb.y1, b.y1); }
    const pad = 0.01;
    const frame = { x0: fb.x0 - pad, x1: fb.x1 + pad, y0: fb.y0 - pad, y1: fb.y1 + pad };

    const front = new Painter(frame, q.texFront || 760, false);
    const back = new Painter(frame, q.texBack || 520, true);
    model.paint(front, 'front', spec);
    model.paint(back, 'back', spec);
    const mapF = new T.CanvasTexture(front.c), mapB = new T.CanvasTexture(back.c);
    for (const m of [mapF, mapB]) { m.colorSpace = T.SRGBColorSpace; m.anisotropy = q.aniso || 4; }

    const fab = FABRIC[spec.fabric] || FABRIC.jersey;
    const nm = nmap(spec.fabric === 'fleece' ? 'fleece' : spec.fabric === 'waffle' ? 'waffle' : spec.fabric === 'twill' ? 'twill' : spec.fabric === 'nylon' ? 'nylon' : 'jersey').clone();
    nm.needsUpdate = true;
    nm.repeat.set((frame.x1 - frame.x0) / fab.tile, (frame.y1 - frame.y0) / fab.tile);

    const U = makeUniforms(model.len, spec.seed || Math.random() * 10);
    const sheenColor = new T.Color(spec.base).lerp(new T.Color('#ffffff'), 0.55);
    const mk = map => patchCloth(new T.MeshPhysicalMaterial({
      map, normalMap: nm, normalScale: new T.Vector2(fab.ns, fab.ns), roughness: fab.roughness, metalness: 0,
      sheen: fab.sheen, sheenRoughness: fab.sheenRoughness, sheenColor,
    }), U);
    const mats = [mk(mapF), mk(mapB)];
    const depthMat = patchCloth(new T.MeshDepthMaterial({ depthPacking: T.RGBADepthPacking }), U, true);

    const group = new T.Group();
    const curve = model.curve == null ? -0.02 : model.curve;
    for (const [k, p] of model.parts.entries()) {
      const geo = pillow(p.poly, { len: model.len, curve, minThick: p.thick >= model.T0 * 0.99 ? 0.0095 : 0, ...p, step }, frame);
      const mesh = new T.Mesh(geo, mats);
      mesh.customDepthMaterial = depthMat;
      mesh.castShadow = true;
      group.add(mesh);
    }
    if (model.tubes.length) {
      const sMat = patchCloth(new T.MeshStandardMaterial({ color: new T.Color(spec.string || hexA(spec.base, 0.04)), roughness: 0.85 }), U);
      const aMat = patchCloth(new T.MeshStandardMaterial({ color: spec.metal || '#c7c4bd', metalness: 0.9, roughness: 0.3 }), U);
      for (const t of model.tubes) {
        const zf = (x, y) => { const h = Math.min(Math.max(-y / model.len, 0), 1); return model.T0 * taper(y) * (1 + 0.35 * Math.max(0, 1 - (x / model.hw) ** 2)) + curve * h * h; };
        t.pts = t.pts.map(p => [p[0], p[1], zf(p[0], p[1]) + p[2]]);
        const path = new T.CatmullRomCurve3(t.pts.map(p => new T.Vector3(p[0], p[1], p[2])));
        const tube = new T.Mesh(new T.TubeGeometry(path, 20, t.r, 8, false), sMat);
        tube.customDepthMaterial = depthMat; tube.castShadow = true;
        group.add(tube);
        const end = t.pts[t.pts.length - 1];
        const ag = new T.Mesh(new T.CylinderGeometry(t.r * 1.15, t.r * 1.15, 0.022, 10), aMat);
        ag.position.set(end[0], end[1] - 0.011, end[2]);
        group.add(ag);
      }
    }
    // largura de frente (para abrir espaço na arara)
    const halfW = Math.max(Math.abs(fb.x0), Math.abs(fb.x1));
    return { group, uniforms: U, len: model.len, halfW, thick: model.T0, textures: [mapF, mapB], materials: mats };
  }

  window.GAZU_GARMENTS = { CATALOG, build, preload, hexA };
})();
