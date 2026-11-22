/* Arenas HD (regiões 0,1,2,4,5,6 e 8-11): cenários texturizados e VFX dos chefes.
   Mesma interface de WarRegions.build: { tileMeshes, wallMines, update(t), triggerVfx() }. Origem: prévia arenas-vfx-preview (Gemini), integrada por Claude em 2026-11-20. */
(function () {
  'use strict';
  let built = null;
  function make() {
    const T = window.THREE;
  function makeRng(seed) {
    let a = seed >>> 0;
    return () => { a = (Math.imul(a, 1664525) + 1013904223) >>> 0; return a / 4294967296; };
  }
  function makeTex(w, h, fn, rep, isLinear) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const x = c.getContext('2d'); fn(x, w, h);
    const t = new T.CanvasTexture(c);
    if (!isLinear && T.sRGBEncoding) t.encoding = T.sRGBEncoding;
    t.wrapS = t.wrapT = T.RepeatWrapping;
    if (rep) t.repeat.set(rep[0], rep[1]);
    return t;
  }

  // =========================================================================
  // GERADOR DE TEXTURAS PBR REALISTAS (ALBEDO + BUMP) POR MATERIAL
  // =========================================================================
  function makeAshlarPair(base1, base2, mortar, rng, rep) {
    const draw = (x, w, h, bump) => {
      x.fillStyle = bump ? '#808080' : base1; x.fillRect(0, 0, w, h);
      const rows = 8, rh = h / rows;
      for (let r = 0; r < rows; r++) {
        const cols = 4, cw = w / cols, off = (r % 2) * (cw * 0.5);
        for (let c = -1; c <= cols; c++) {
          const bx = c * cw + off, by = r * rh;
          if (!bump) {
            const v = (rng() - 0.5) * 18;
            x.fillStyle = r % 2 === c % 2 ? base1 : base2;
            x.fillRect(bx + 2, by + 2, cw - 4, rh - 4);
            x.fillStyle = v > 0 ? `rgba(255,245,220,${v / 220})` : `rgba(0,0,0,${-v / 200})`;
            x.fillRect(bx + 2, by + 2, cw - 4, rh - 4);
          } else {
            const lum = Math.floor(135 + (rng() - 0.5) * 35);
            x.fillStyle = `rgb(${lum},${lum},${lum})`;
            x.fillRect(bx + 3, by + 3, cw - 6, rh - 6);
          }
          x.strokeStyle = bump ? '#222' : mortar;
          x.lineWidth = bump ? 4 : 3;
          x.strokeRect(bx + 1, by + 1, cw - 2, rh - 2);
        }
      }
      for (let i = 0; i < 1200; i++) {
        x.fillStyle = rng() > 0.5 ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.1)';
        x.fillRect(rng() * w, rng() * h, 1 + rng() * 3, 1 + rng() * 2);
      }
    };
    return {
      map: makeTex(256, 256, (x, w, h) => draw(x, w, h, false), rep, false),
      bump: makeTex(256, 256, (x, w, h) => draw(x, w, h, true), rep, true)
    };
  }

  function makeSandRipples(rng) {
    const draw = (x, w, h, bump) => {
      x.fillStyle = bump ? '#7c7c7c' : '#b78442'; x.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 12) {
        const gr = x.createLinearGradient(0, y, 0, y + 12);
        if (bump) {
          gr.addColorStop(0, '#444'); gr.addColorStop(0.5, '#d0d0d0'); gr.addColorStop(1, '#444');
        } else {
          gr.addColorStop(0, '#9a6b30'); gr.addColorStop(0.5, '#d4a159'); gr.addColorStop(1, '#98692e');
        }
        x.fillStyle = gr;
        x.beginPath(); x.moveTo(0, y);
        for (let px = 0; px <= w; px += 32) x.lineTo(px, y + Math.sin(px * 0.05 + y * 0.1) * 3);
        x.lineTo(w, y + 12); x.lineTo(0, y + 12); x.closePath(); x.fill();
      }
      for (let i = 0; i < 1600; i++) {
        x.fillStyle = rng() > 0.5 ? 'rgba(255,235,190,.09)' : 'rgba(60,30,5,.1)';
        x.fillRect(rng() * w, rng() * h, 2, 1);
      }
    };
    return {
      map: makeTex(256, 256, (x, w, h) => draw(x, w, h, false), [10, 8], false),
      bump: makeTex(256, 256, (x, w, h) => draw(x, w, h, true), [10, 8], true)
    };
  }

  function makeIronPlatePair(rng, rep) {
    const draw = (x, w, h, bump) => {
      x.fillStyle = bump ? '#848484' : '#3a4658'; x.fillRect(0, 0, w, h);
      // Grade/chapa industrial com rebites e riscos
      if (!bump) {
        const gr = x.createLinearGradient(0, 0, w, h);
        gr.addColorStop(0, '#4d5b70'); gr.addColorStop(0.5, '#333e4e'); gr.addColorStop(1, '#232b38');
        x.fillStyle = gr; x.fillRect(0, 0, w, h);
      }
      x.strokeStyle = bump ? '#1e1e1e' : '#141a24'; x.lineWidth = 6; x.strokeRect(4, 4, w - 8, h - 8);
      x.strokeStyle = bump ? '#c8c8c8' : 'rgba(218,174,86,.42)'; x.lineWidth = 2; x.strokeRect(10, 10, w - 20, h - 20);
      // X estrutural leve
      x.strokeStyle = bump ? '#606060' : 'rgba(15,20,28,.35)'; x.lineWidth = 4;
      x.beginPath(); x.moveTo(14, 14); x.lineTo(w - 14, h - 14); x.moveTo(w - 14, 14); x.lineTo(14, h - 14); x.stroke();
      for (const [px, py] of [[20,20],[w-20,20],[20,h-20],[w-20,h-20],[w/2,20],[w/2,h-20]]) {
        x.fillStyle = bump ? '#f0f0f0' : '#c89b44'; x.beginPath(); x.arc(px, py, 5.5, 0, 6.28); x.fill();
        x.fillStyle = bump ? '#333' : '#181e28'; x.beginPath(); x.arc(px + 1, py + 1, 2.2, 0, 6.28); x.fill();
      }
      for (let i = 0; i < 60; i++) {
        x.strokeStyle = rng() > 0.5 ? 'rgba(220,235,255,.07)' : 'rgba(0,0,0,.14)';
        x.lineWidth = 1; x.beginPath(); const y0 = rng() * h; x.moveTo(0, y0); x.lineTo(w, y0 + (rng() - 0.5) * 14); x.stroke();
      }
    };
    return {
      map: makeTex(256, 256, (x, w, h) => draw(x, w, h, false), rep, false),
      bump: makeTex(256, 256, (x, w, h) => draw(x, w, h, true), rep, true)
    };
  }

  function makeObsidianRunePair(rng) {
    const draw = (x, w, h, bump) => {
      x.fillStyle = bump ? '#808080' : '#150d26'; x.fillRect(0, 0, w, h);
      if (!bump) {
        const gr = x.createRadialGradient(w / 2, h / 2, 8, w / 2, h / 2, w * 0.7);
        gr.addColorStop(0, '#2a184a'); gr.addColorStop(1, '#0e071c');
        x.fillStyle = gr; x.fillRect(0, 0, w, h);
      }
      // Veios de mármore estrelado
      for (let i = 0; i < 18; i++) {
        x.strokeStyle = bump ? '#b0b0b0' : (i % 3 === 0 ? 'rgba(230,185,80,.28)' : 'rgba(175,110,255,.22)');
        x.lineWidth = 1 + rng() * 1.5;
        x.beginPath(); let px = rng() * w, py = rng() * h; x.moveTo(px, py);
        for (let k = 0; k < 5; k++) { px += (rng() - 0.5) * 65; py += (rng() - 0.5) * 65; x.lineTo(px, py); }
        x.stroke();
      }
      x.strokeStyle = bump ? '#d8d8d8' : 'rgba(230,185,80,.62)'; x.lineWidth = 4; x.strokeRect(6, 6, w - 12, h - 12);
      x.strokeStyle = bump ? '#383838' : 'rgba(255,130,245,.32)'; x.lineWidth = 2; x.strokeRect(14, 14, w - 28, h - 28);
    };
    return {
      map: makeTex(256, 256, (x, w, h) => draw(x, w, h, false), [1, 1], false),
      bump: makeTex(256, 256, (x, w, h) => draw(x, w, h, true), [1, 1], true)
    };
  }


  // ---- texturas novas (regiões 0, 1, 2, 4, 5, 6) ----
  function makeGrain(rng, base, cols, rep, stripe) {
    const draw = (x, w, h, bump) => {
      x.fillStyle = bump ? '#808080' : base; x.fillRect(0, 0, w, h);
      for (let i = 0; i < 2600; i++) {
        x.globalAlpha = 0.25 + rng() * 0.4;
        x.fillStyle = bump ? (rng() > 0.5 ? 'rgba(255,255,255,.22)' : 'rgba(0,0,0,.24)') : cols[(rng() * cols.length) | 0];
        const s = 1 + rng() * 3; x.fillRect(rng() * w, rng() * h, s * (stripe ? 3 : 1), s);
      }
      x.globalAlpha = 1;
    };
    return { map: makeTex(256, 256, (x, w, h) => draw(x, w, h, false), rep, false), bump: makeTex(256, 256, (x, w, h) => draw(x, w, h, true), rep, true) };
  }
  function makeGrassPair(rng, rep) {
    const cols = ['#2f5a22', '#4f8a34', '#68a642', '#27481b', '#5c9a38'];
    const draw = (x, w, h, bump) => {
      x.fillStyle = bump ? '#808080' : '#3f6b2a'; x.fillRect(0, 0, w, h);
      for (let i = 0; i < 3400; i++) {
        const gx = rng() * w, gy = rng() * h, l = 3 + rng() * 7;
        x.strokeStyle = bump ? (rng() > 0.5 ? '#b4b4b4' : '#4c4c4c') : cols[(rng() * cols.length) | 0]; x.lineWidth = 1.3;
        x.beginPath(); x.moveTo(gx, gy); x.lineTo(gx + (rng() - 0.5) * 3, gy - l); x.stroke();
      }
      if (!bump) for (let i = 0; i < 46; i++) { x.fillStyle = i % 3 ? '#fff4b8' : '#ffffff'; x.fillRect(rng() * w, rng() * h, 2, 2); }
    };
    return { map: makeTex(256, 256, (x, w, h) => draw(x, w, h, false), rep, false), bump: makeTex(256, 256, (x, w, h) => draw(x, w, h, true), rep, true) };
  }
  function makePlanks(rng, rep) {
    const draw = (x, w, h, bump) => {
      x.fillStyle = bump ? '#808080' : '#6b4a2a'; x.fillRect(0, 0, w, h);
      const n = 6, bw = w / n;
      for (let i = 0; i < n; i++) {
        const v = (rng() - 0.5) * 30;
        x.fillStyle = bump ? `rgb(${130 + (rng() * 30) | 0},${130 + (rng() * 30) | 0},${130 + (rng() * 30) | 0})` : `rgb(${(112 + v) | 0},${(80 + v * 0.7) | 0},${(48 + v * 0.5) | 0})`;
        x.fillRect(i * bw + 2, 0, bw - 4, h);
        x.strokeStyle = bump ? '#222' : 'rgba(30,18,8,.7)'; x.lineWidth = 3; x.strokeRect(i * bw + 1, 1, bw - 2, h - 2);
        for (let g = 0; g < 7; g++) { x.strokeStyle = bump ? 'rgba(0,0,0,.35)' : 'rgba(40,24,10,.35)'; x.lineWidth = 1; const gy = rng() * h; x.beginPath(); x.moveTo(i * bw + 4, gy); x.lineTo(i * bw + bw - 4, gy + (rng() - 0.5) * 8); x.stroke(); }
        x.fillStyle = bump ? '#eee' : '#2a1a0c'; x.beginPath(); x.arc(i * bw + bw / 2, 10, 2.6, 0, 6.28); x.arc(i * bw + bw / 2, h - 10, 2.6, 0, 6.28); x.fill();
      }
    };
    return { map: makeTex(256, 256, (x, w, h) => draw(x, w, h, false), rep, false), bump: makeTex(256, 256, (x, w, h) => draw(x, w, h, true), rep, true) };
  }
  function makeCrystalTile(rng) {
    const draw = (x, w, h, bump) => {
      x.fillStyle = bump ? '#808080' : '#1c1030'; x.fillRect(0, 0, w, h);
      for (let i = 0; i < 34; i++) {
        const cx = rng() * w, cy = rng() * h, r = 20 + rng() * 44, a = rng() * 6.28;
        x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); x.lineTo(cx + Math.cos(a + 1.9) * r * 0.8, cy + Math.sin(a + 1.9) * r * 0.8); x.closePath();
        x.fillStyle = bump ? `rgb(${110 + (rng() * 90) | 0},${110 + (rng() * 90) | 0},${110 + (rng() * 90) | 0})` : ['rgba(190,120,255,.20)', 'rgba(110,228,255,.17)', 'rgba(255,126,242,.16)', 'rgba(255,255,255,.07)'][(rng() * 4) | 0];
        x.fill();
      }
      x.strokeStyle = bump ? '#dcdcdc' : 'rgba(190,150,255,.7)'; x.lineWidth = 5; x.strokeRect(6, 6, w - 12, h - 12);
      x.strokeStyle = bump ? '#303030' : 'rgba(110,228,255,.4)'; x.lineWidth = 2; x.strokeRect(15, 15, w - 30, h - 30);
    };
    return { map: makeTex(256, 256, (x, w, h) => draw(x, w, h, false), [1, 1], false), bump: makeTex(256, 256, (x, w, h) => draw(x, w, h, true), [1, 1], true) };
  }
  function makeIceTile(rng) {
    const draw = (x, w, h, bump) => {
      if (bump) { x.fillStyle = '#808080'; x.fillRect(0, 0, w, h); } else { const g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#a9d4ec'); g.addColorStop(0.5, '#7fb4d4'); g.addColorStop(1, '#5f98bd'); x.fillStyle = g; x.fillRect(0, 0, w, h); }
      for (let i = 0; i < 16; i++) {
        x.strokeStyle = bump ? (i % 2 ? '#202020' : '#e0e0e0') : (i % 3 ? 'rgba(255,255,255,.65)' : 'rgba(70,130,170,.5)'); x.lineWidth = 1 + rng() * 2;
        x.beginPath(); let px = rng() * w, py = rng() * h; x.moveTo(px, py); for (let k = 0; k < 4; k++) { px += (rng() - 0.5) * 80; py += (rng() - 0.5) * 80; x.lineTo(px, py); } x.stroke();
      }
      x.strokeStyle = bump ? '#202020' : 'rgba(60,110,150,.8)'; x.lineWidth = 6; x.strokeRect(3, 3, w - 6, h - 6);
      x.strokeStyle = bump ? '#d0d0d0' : 'rgba(255,255,255,.7)'; x.lineWidth = 2; x.strokeRect(11, 11, w - 22, h - 22);
    };
    return { map: makeTex(256, 256, (x, w, h) => draw(x, w, h, false), [1, 1], false), bump: makeTex(256, 256, (x, w, h) => draw(x, w, h, true), [1, 1], true) };
  }
  function makeSoftTex(r, g, b) {
    return makeTex(128, 128, (x, w, h) => { const gr = x.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2); gr.addColorStop(0, `rgba(${r},${g},${b},.95)`); gr.addColorStop(0.5, `rgba(${r},${g},${b},.35)`); gr.addColorStop(1, `rgba(${r},${g},${b},0)`); x.fillStyle = gr; x.fillRect(0, 0, w, h); }, [1, 1], false);
  }
  function makeAuroraTex(rng) {
    return makeTex(512, 128, (x, w, h) => {
      x.clearRect(0, 0, w, h);
      [['rgba(90,255,190,', 0.0], ['rgba(110,160,255,', 0.35], ['rgba(190,110,255,', 0.7]].forEach(([c, o], k) => {
        for (let i = 0; i < 26; i++) {
          const px = (i / 26) * w + rng() * 10, gr = x.createLinearGradient(0, h, 0, 0);
          gr.addColorStop(0, c + '0)'); gr.addColorStop(0.35, c + (0.22 + rng() * 0.25) + ')'); gr.addColorStop(1, c + '0)');
          x.fillStyle = gr; x.fillRect(px, h * (0.05 + o * 0.15), 22 + rng() * 14, h * 0.9);
        }
      });
    }, [1, 1], false);
  }

  function buildUpgradedRegion(scene, reg) {
    const rng = makeRng(700 + reg * 977);
    const root = new T.Group(); scene.add(root);
    const anim = [];
    const M = (color, more) => new T.MeshStandardMaterial(Object.assign({ color, roughness: 0.78 }, more));
    const add = (geo, m, x, y, z, par) => {
      const o = new T.Mesh(geo, m);
      o.position.set(x, y, z);
      o.castShadow = true; o.receiveShadow = true;
      (par || root).add(o);
      return o;
    };

    const PAL = {
      8:  { sky: '#c98842', fog: '#be7c38', glow: '#ffcf5c', accent: '#9dff4a' },
      9:  { sky: '#182419', fog: '#1c2c1d', glow: '#9dff4a', accent: '#c06aff' },
      10: { sky: '#242e3d', fog: '#1f2836', glow: '#5ce4ff', accent: '#ff9638' },
      11: { sky: '#050211', fog: '#0d0522', glow: '#ff7ef2', accent: '#6ce4ff' },
      0:  { sky: '#9db8a4', fog: '#b4cdbb', glow: '#ffe9a0', accent: '#ff9ad0', fd: 0.026 },
      1:  { sky: '#7fb6d2', fog: '#8fc6dc', glow: '#ffe7a0', accent: '#7fe8ff', fd: 0.014 },
      2:  { sky: '#1c1230', fog: '#2a1c48', glow: '#c9a8ff', accent: '#6ce4ff', fd: 0.02 },
      4:  { sky: '#04020c', fog: '#0a0618', glow: '#ffc94d', accent: '#a56aff', fd: 0.012 },
      5:  { sky: '#a9cfe3', fog: '#b9dcee', glow: '#8be4ff', accent: '#e6fbff', fd: 0.02 },
      6:  { sky: '#231c3a', fog: '#2e2548', glow: '#c49bff', accent: '#7fd8ff', fd: 0.022 }
    }[reg];

    const bgCol = new T.Color(PAL.sky); scene.background = bgCol;
    scene.fog = new T.FogExp2(PAL.fog, reg === 11 ? 0.015 : (PAL.fd || 0.019));

    const brassMat = M('#dca744', { roughness: 0.28, metalness: 0.88 });
    const glowMat = M(PAL.glow, { emissive: PAL.glow, emissiveIntensity: 1.7, roughness: 0.2 });
    const accGlow = M(PAL.accent, { emissive: PAL.accent, emissiveIntensity: 1.5, roughness: 0.22 });

    /* nuvem de pontos que cai (neve/chuva) ou sobe (bolhas) e recomeça; speed<0 sobe */
    function falling(count, spanX, topY, z0, zr, color, size, opacity, speed, drift) {
      const arr = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) { arr[i * 3] = (rng() - 0.5) * spanX; arr[i * 3 + 1] = rng() * topY; arr[i * 3 + 2] = z0 + rng() * zr; }
      const g = new T.BufferGeometry(), attr = new T.BufferAttribute(arr, 3); g.setAttribute('position', attr);
      const pts = new T.Points(g, new T.PointsMaterial({ color, size, transparent: true, opacity, depthWrite: false }));
      pts.frustumCulled = false; root.add(pts);
      anim.push((t, dt) => {
        if (!speed) return;
        for (let i = 0; i < count; i++) { let y = arr[i * 3 + 1] - dt * speed * (0.7 + ((i * 37) % 10) / 16); arr[i * 3] += Math.sin(t * 0.8 + i) * dt * drift; if (y < -0.2) y = topY; else if (y > topY) y = 0; arr[i * 3 + 1] = y; }
        attr.needsUpdate = true;
      });
      return pts;
    }

    // Materiais PBR específicos por região
    let soilMat, tileMat, wallMat, trimMat;
    if (reg === 8) {
      const sand = makeSandRipples(rng);
      const ash = makeAshlarPair('#c99d5e', '#b38547', '#6c4922', rng, [2, 2]);
      const tilePair = makeAshlarPair('#d6ad6e', '#c09352', '#704c24', rng, [1, 1]);
      soilMat = M('#ffffff', { map: sand.map, bumpMap: sand.bump, bumpScale: 0.09, roughness: 0.9 });
      tileMat = M('#ffffff', { map: tilePair.map, bumpMap: tilePair.bump, bumpScale: 0.04, roughness: 0.8 });
      wallMat = M('#ffffff', { map: ash.map, bumpMap: ash.bump, bumpScale: 0.07, roughness: 0.82 });
      trimMat = brassMat;
    } else if (reg === 9) {
      const moss = makeAshlarPair('#3a4a30', '#2b3824', '#161f12', rng, [1, 1]);
      const mud = makeAshlarPair('#252f1c', '#1e2716', '#141a0e', rng, [6, 6]);
      soilMat = M('#ffffff', { map: mud.map, bumpMap: mud.bump, bumpScale: 0.08, roughness: 0.85 });
      tileMat = M('#ffffff', { map: moss.map, bumpMap: moss.bump, bumpScale: 0.055, roughness: 0.65, metalness: 0.14 });
      wallMat = M('#ffffff', { map: moss.map, bumpMap: moss.bump, bumpScale: 0.08, roughness: 0.78 });
      trimMat = M('#4f6b3a', { roughness: 0.7 });
    } else if (reg === 10) {
      const iron = makeIronPlatePair(rng, [1, 1]);
      const brick = makeAshlarPair('#3c4452', '#2f3744', '#181c24', rng, [3, 2]);
      soilMat = M('#1f2632', { bumpMap: iron.bump, bumpScale: 0.06, roughness: 0.72, metalness: 0.55 });
      tileMat = M('#ffffff', { map: iron.map, bumpMap: iron.bump, bumpScale: 0.045, roughness: 0.42, metalness: 0.72 });
      wallMat = M('#ffffff', { map: brick.map, bumpMap: brick.bump, bumpScale: 0.07, roughness: 0.62, metalness: 0.45 });
      trimMat = brassMat;
    } else if (reg === 0) {
      const grass = makeGrassPair(rng, [14, 11]);
      const cobble = makeAshlarPair('#9a9072', '#857b5e', '#4a4330', rng, [1, 1]);
      const wallp = makeAshlarPair('#8a8a7a', '#76766a', '#3a3a30', rng, [2, 2]);
      soilMat = M('#ffffff', { map: grass.map, bumpMap: grass.bump, bumpScale: 0.05, roughness: 0.95 });
      tileMat = M('#ffffff', { map: cobble.map, bumpMap: cobble.bump, bumpScale: 0.04, roughness: 0.88 });
      wallMat = M('#ffffff', { map: wallp.map, bumpMap: wallp.bump, bumpScale: 0.07, roughness: 0.9 });
      trimMat = M('#b9a56a', { roughness: 0.45, metalness: 0.55 });
    } else if (reg === 1) {
      const sand = makeGrain(rng, '#cdbf98', ['#e6dab8', '#b7a67c', '#a89870'], [12, 9]);
      const tilep = makeAshlarPair('#9fb0ae', '#8a9c9a', '#3c4e50', rng, [1, 1]);
      const wallp = makeAshlarPair('#7a8a8e', '#667478', '#2e383c', rng, [2, 2]);
      soilMat = M('#ffffff', { map: sand.map, bumpMap: sand.bump, bumpScale: 0.05, roughness: 0.92 });
      tileMat = M('#ffffff', { map: tilep.map, bumpMap: tilep.bump, bumpScale: 0.04, roughness: 0.62 });
      wallMat = M('#ffffff', { map: wallp.map, bumpMap: wallp.bump, bumpScale: 0.07, roughness: 0.8 });
      trimMat = M('#d8b56a', { roughness: 0.35, metalness: 0.75 });
    } else if (reg === 2) {
      const rock = makeGrain(rng, '#241838', ['#33224f', '#1a102a', '#40305f'], [9, 7]);
      const ct = makeCrystalTile(rng);
      const wallp = makeAshlarPair('#3b2c5c', '#2e2248', '#150e26', rng, [2, 2]);
      soilMat = M('#ffffff', { map: rock.map, bumpMap: rock.bump, bumpScale: 0.08, roughness: 0.8 });
      tileMat = M('#ffffff', { map: ct.map, bumpMap: ct.bump, bumpScale: 0.04, roughness: 0.22, metalness: 0.4, emissive: '#2a1456', emissiveIntensity: 0.55 });
      wallMat = M('#ffffff', { map: wallp.map, bumpMap: wallp.bump, bumpScale: 0.06, roughness: 0.5, metalness: 0.2 });
      trimMat = M('#9d7cff', { emissive: '#6a4cff', emissiveIntensity: 0.55, roughness: 0.3, metalness: 0.3 });
    } else if (reg === 4) {
      const obs = makeObsidianRunePair(rng);
      const darkStone = makeAshlarPair('#241a3a', '#1a1230', '#0a0614', rng, [2, 2]);
      soilMat = M('#07030f', { roughness: 0.9 });
      tileMat = M('#ffffff', { map: obs.map, bumpMap: obs.bump, bumpScale: 0.04, roughness: 0.28, metalness: 0.5 });
      wallMat = M('#ffffff', { map: darkStone.map, bumpMap: darkStone.bump, bumpScale: 0.06, roughness: 0.5, metalness: 0.4 });
      trimMat = brassMat;
    } else if (reg === 5) {
      const snow = makeGrain(rng, '#a9bfcf', ['#d8e6ef', '#9db5c6', '#8aa5b9'], [11, 8]);
      const ice = makeIceTile(rng);
      const wallp = makeAshlarPair('#7fb4d2', '#6aa0c0', '#335f7a', rng, [2, 2]);
      soilMat = M('#ffffff', { map: snow.map, bumpMap: snow.bump, bumpScale: 0.06, roughness: 0.85 });
      tileMat = M('#ffffff', { map: ice.map, bumpMap: ice.bump, bumpScale: 0.035, roughness: 0.18, metalness: 0.15 });
      wallMat = M('#ffffff', { map: wallp.map, bumpMap: wallp.bump, bumpScale: 0.06, roughness: 0.3, metalness: 0.1 });
      trimMat = M('#9fd2ee', { roughness: 0.25, metalness: 0.4 });
    } else if (reg === 6) {
      const floor = makeGrain(rng, '#1a1626', ['#262038', '#120f1c', '#302845'], [9, 7]);
      const wet = makeAshlarPair('#4c4766', '#3d3955', '#1a1726', rng, [1, 1]);
      const wallp = makeAshlarPair('#3d3850', '#2f2b42', '#15121f', rng, [2, 2]);
      soilMat = M('#ffffff', { map: floor.map, bumpMap: floor.bump, bumpScale: 0.07, roughness: 0.55, metalness: 0.2 });
      tileMat = M('#ffffff', { map: wet.map, bumpMap: wet.bump, bumpScale: 0.04, roughness: 0.3, metalness: 0.3 });
      wallMat = M('#ffffff', { map: wallp.map, bumpMap: wallp.bump, bumpScale: 0.06, roughness: 0.55, metalness: 0.25, emissive: '#2a2058', emissiveIntensity: 0.55 });
      trimMat = M('#b99bff', { emissive: '#7a4fe0', emissiveIntensity: 0.45, roughness: 0.35, metalness: 0.5 });
    } else {
      const obs = makeObsidianRunePair(rng);
      const darkStone = makeAshlarPair('#21133b', '#180d2c', '#0b0517', rng, [2, 2]);
      soilMat = M('#100820', { roughness: 0.65, metalness: 0.35 });
      tileMat = M('#ffffff', { map: obs.map, bumpMap: obs.bump, bumpScale: 0.04, roughness: 0.3, metalness: 0.52 });
      wallMat = M('#ffffff', { map: darkStone.map, bumpMap: darkStone.bump, bumpScale: 0.06, roughness: 0.45, metalness: 0.45 });
      trimMat = brassMat;
    }

    // -----------------------------------------------------------------------
    // 1. TERRENO + TABULEIRO CANÔNICO 9x5 COM MOLDURA ESCULPIDA (FRENTE LIVRE!)
    // -----------------------------------------------------------------------
    const terrain = new T.PlaneGeometry(60, 48, 72, 56);
    terrain.rotateX(-Math.PI / 2);
    const pos = terrain.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const px = pos.getX(i), pz = pos.getZ(i);
      const inArena = Math.abs(px) < 9.0 && Math.abs(pz) < 4.5;
      // Importante: no lado da câmera (pz > 4.5), o terreno fica BAIXO para nunca obstruir!
      let h = -0.18;
      if (!inArena) {
        if (reg === 4) {
          h = -9;   /* ilha flutuando no vazio */
        } else if (pz > 4.5) {
          h = (reg === 1 ? -0.42 : -0.35) - (pz - 4.5) * 0.04 + Math.sin(px * 0.35) * 0.22;
        } else {
          h = reg === 8
            ? 0.4 + Math.sin(px * 0.22) * 1.15 + Math.cos(pz * 0.28) * 1.1
            : reg === 1 ? -0.78 + Math.sin(px * 0.5) * Math.cos(pz * 0.6) * 0.15
            : reg === 5 ? Math.sin(px * 0.4) * Math.cos(pz * 0.45) * 0.7 + Math.max(0, -pz - 6) * 0.28
            : reg === 0 ? Math.sin(px * 0.33) * Math.cos(pz * 0.38) * 1.15
            : Math.sin(px * 0.45) * Math.cos(pz * 0.5) * 0.9;
        }
      }
      pos.setY(i, h);
    }
    terrain.computeVertexNormals();
    const terrMesh = add(terrain, soilMat, 0, 0, 0);
    terrMesh.castShadow = false;

    // Plataforma elevada sutil do tabuleiro 9x5 (com meio-fio de pedra/latão)
    add(new T.BoxGeometry(15.2, 0.22, 8.6), wallMat, 0, -0.09, 0);
    // Borda fina ornamental em volta do tabuleiro
    add(new T.BoxGeometry(15.4, 0.08, 0.2), trimMat, 0, 0.03, -4.35);
    add(new T.BoxGeometry(15.4, 0.08, 0.2), trimMat, 0, 0.03, 4.35);

    const tileMeshes = [];
    const tileGeo = new T.PlaneGeometry(1.48, 1.48); tileGeo.rotateX(-Math.PI / 2);
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 9; c++) {
        const tl = add(tileGeo, tileMat, -6.4 + c * 1.6, 0.035, -3.2 + r * 1.6);
        tl.userData.row = r; tl.userData.col = c; tileMeshes.push(tl);
        tl.castShadow = false;
      }
    }

    // Santuário / Bastião defensivo à esquerda (-X) — baixo na ponta da frente (+Z) e alto atrás (-Z)
    for (let i = 0; i < 9; i++) {
      const wz = -4.0 + i * 1.0;
      const h = i >= 7 ? 1.05 : 1.55; // Abaixa perto da câmera (+Z) para visão limpa!
      add(new T.BoxGeometry(0.7, h, 0.84), wallMat, -8.35, h * 0.5, wz);
      add(new T.BoxGeometry(0.82, 0.14, 0.92), trimMat, -8.35, h + 0.06, wz);
      if (i === 0 || i === 4) {
        // Braseiro / Farol arcano na muralha
        add(new T.CylinderGeometry(0.28, 0.18, 0.35, 8), trimMat, -8.35, h + 0.3, wz);
        const fl = add(new T.OctahedronGeometry(0.22), glowMat, -8.35, h + 0.62, wz);
        anim.push((t) => { fl.scale.y = 1.1 + Math.sin(t * 6 + i) * 0.25; fl.rotation.y = t * 1.5; });
      }
    }

    // -----------------------------------------------------------------------
    // 2. ARQUITETURA MONUMENTAL DE FUNDO (-Z) E FLANCOS — ZERO BLOQUEIO EM +Z!
    // -----------------------------------------------------------------------
    if (reg === 8) {
      // === DESERTO: ZIGURATE REAL, COLUNATA EGÍPCIA, BRASEIROS E SOL POENTE ===
      // Sol dourado monumental no horizonte
      const sun = add(new T.SphereGeometry(4.2, 24, 18), new T.MeshBasicMaterial({ color: '#ffe59c' }), 1.5, 9.5, -26);
      const sunHalo = add(new T.SphereGeometry(6.8, 24, 16), new T.MeshBasicMaterial({ color: '#ffae42', transparent: true, opacity: 0.22, depthWrite: false }), 1.5, 9.5, -26);

      // Grande Templo-Zigurate escalonado no centro-fundo (-Z = -17)
      const zig = new T.Group(); zig.position.set(1.5, 0, -17.5); root.add(zig);
      for (let lv = 0; lv < 5; lv++) {
        const w = 13.5 - lv * 2.1, d = 10.5 - lv * 1.6, hh = 1.25;
        add(new T.BoxGeometry(w, hh, d), wallMat, 0, lv * hh + hh * 0.5, 0, zig);
        add(new T.BoxGeometry(w + 0.18, 0.12, d + 0.18), trimMat, 0, (lv + 1) * hh, 0, zig);
      }
      // Escadaria central monumental descendo do zigurate
      for (let st = 0; st < 12; st++) {
        add(new T.BoxGeometry(2.6, 0.52, 0.65), wallMat, 0, 0.3 + st * 0.5, 5.4 - st * 0.36, zig);
      }
      // Portal do Sol no topo do zigurate (arco de latão + cristal solar giratório)
      [-1.3, 1.3].forEach(px => {
        add(new T.BoxGeometry(0.65, 2.8, 0.65), wallMat, px, 7.6, 0, zig);
        add(new T.BoxGeometry(0.75, 0.2, 0.75), trimMat, px, 9.05, 0, zig);
      });
      add(new T.BoxGeometry(3.5, 0.45, 0.8), trimMat, 0, 9.25, 0, zig);
      const sunDisc = add(new T.OctahedronGeometry(0.85), glowMat, 0, 7.8, 0, zig);
      anim.push((t, dt) => { sunDisc.rotation.y += dt * 0.7; sunDisc.position.y = 7.8 + Math.sin(t * 2) * 0.18; });

      // Duas pirâmides menores flanqueando no horizonte distante
      [[-14, -20, 7.5], [16, -19.5, 6.8]].forEach(([px, pz, sz]) => {
        const py = add(new T.ConeGeometry(sz, sz * 1.1, 4), wallMat, px, sz * 0.52, pz);
        py.rotation.y = Math.PI / 4;
        const cap = add(new T.ConeGeometry(sz * 0.22, sz * 0.26, 4), brassMat, px, sz * 1.0, pz);
        cap.rotation.y = Math.PI / 4;
      });

      // Colunata de ruínas egípcias atrás da arena (z = -7.6) com capitéis e braseiros flamejantes
      [-8.5, -4.5, -0.5, 3.5, 7.5, 11.5].forEach((cx, i) => {
        const broken = i === 2 || i === 4;
        const ch = broken ? 3.2 : 5.4;
        add(new T.BoxGeometry(1.25, 0.45, 1.25), wallMat, cx, 0.22, -7.6);
        add(new T.CylinderGeometry(0.36, 0.46, ch, 12), wallMat, cx, 0.45 + ch * 0.5, -7.6);
        // Anéis dourados esculpidos no fuste da coluna
        add(new T.TorusGeometry(0.42, 0.055, 8, 16), brassMat, cx, 1.8, -7.6).rotation.x = Math.PI / 2;
        if (!broken) {
          // Capitel + braseiro flamejante no topo
          add(new T.CylinderGeometry(0.68, 0.38, 0.55, 8), wallMat, cx, 0.45 + ch + 0.25, -7.6);
          add(new T.BoxGeometry(1.3, 0.22, 1.3), trimMat, cx, 0.45 + ch + 0.62, -7.6);
          const fire = add(new T.ConeGeometry(0.32, 0.85, 7), glowMat, cx, 0.45 + ch + 1.12, -7.6);
          anim.push((t) => { fire.scale.set(0.9 + Math.sin(t * 7 + i) * 0.18, 0.85 + Math.cos(t * 9 + i) * 0.25, 0.9); });
        }
      });
      // Arquitrave ligando colunas intactas
      add(new T.BoxGeometry(5.2, 0.55, 0.9), wallMat, -6.5, 6.65, -7.6);
      add(new T.BoxGeometry(5.2, 0.55, 0.9), wallMat, 9.5, 6.65, -7.6);

      // Ossada colossal de dragão semi-enterrada no flanco direito-fundo (+X, -Z)
      const boneMat = M('#e3d4b4', { roughness: 0.72 });
      for (let k = 0; k < 5; k++) {
        const curve = new T.CatmullRomCurve3([
          new T.Vector3(0, -0.2, 0), new T.Vector3(-0.3, 1.8, 0.4), new T.Vector3(-0.6, 2.7, 1.5)
        ]);
        add(new T.TubeGeometry(curve, 12, 0.14 - k * 0.015, 8, false), boneMat, 9.6 + k * 0.9, 0, -5.2 - k * 0.3);
      }

      // Poeira dourada levitando ao vento
      const pts = new Float32Array(320 * 3);
      for (let i = 0; i < 320; i++) { pts[i * 3] = (rng() - 0.5) * 44; pts[i * 3 + 1] = 0.6 + rng() * 11; pts[i * 3 + 2] = -18 + rng() * 26; }
      const pGeo = new T.BufferGeometry(); pGeo.setAttribute('position', new T.BufferAttribute(pts, 3));
      const dust = new T.Points(pGeo, new T.PointsMaterial({ color: '#ffe6a8', size: 0.16, transparent: true, opacity: 0.6 }));
      root.add(dust);
      anim.push((t) => { dust.position.x = Math.sin(t * 0.35) * 2.2; });

    } else if (reg === 9) {
      // === PÂNTANO: CHARCO ESPELHADO, VITÓRIAS-RÉGIAS, RUÍNAS COM MUSGO, MANGUES E TEIAS RADIAIS ===
      const water = add(new T.PlaneGeometry(58, 46), M('#1c3318', { transparent: true, opacity: 0.78, metalness: 0.62, roughness: 0.14 }), 0, -0.06, 0);
      water.rotation.x = -Math.PI / 2; water.castShadow = false;

      // Vitórias-régias e flores de lótus brilhantes flutuando ao redor (inclusive na frente +Z, bem baixinhas!)
      const padMat = M('#2d5a22', { roughness: 0.55 });
      for (let i = 0; i < 22; i++) {
        const px = -12 + rng() * 26;
        const pz = rng() > 0.45 ? (5.2 + rng() * 4.5) : (-5.2 - rng() * 6.5);
        const r = 0.38 + rng() * 0.45;
        const pad = add(new T.CylinderGeometry(r, r, 0.05, 14, 1, false, 0, Math.PI * 1.85), padMat, px, -0.02, pz);
        pad.rotation.y = rng() * 6.28; pad.castShadow = false;
        if (i % 4 === 0) {
          add(new T.OctahedronGeometry(0.16), accGlow, px, 0.12, pz);
        }
      }

      // Arco de ruína antiga submersa no centro-fundo (-Z = -10.5) com lanternas penduradas
      const archPts = [];
      for (let k = 0; k <= 14; k++) {
        const a = (k / 14) * Math.PI;
        archPts.push(new T.Vector3(Math.cos(a) * 5.8, Math.sin(a) * 5.6 - 0.3, 0));
      }
      add(new T.TubeGeometry(new T.CatmullRomCurve3(archPts), 22, 0.58, 8, false), wallMat, 1, 0, -11.5);
      // Pilares da ruína
      [-4.8, 6.8].forEach(px => {
        add(new T.BoxGeometry(1.5, 4.2, 1.5), wallMat, px, 1.9, -11.5);
        add(new T.CylinderGeometry(0.24, 0.16, 0.4, 6), glowMat, px, 4.35, -11.5);
      });

      // Árvores retorcidas de mangue ESTRITAMENTE atrás (-Z) e nos flancos profundos
      const bark = M('#241a14', { roughness: 0.92 });
      const canopyMat = M('#182f15', { roughness: 0.88 });
      const mossVine = M('#4b6e32', { roughness: 0.9, transparent: true, opacity: 0.78 });
      const webLineMat = M('#dcffba', { emissive: '#8cff42', emissiveIntensity: 0.85, transparent: true, opacity: 0.7 });

      const trees = [[-11, -8.5], [-4.5, -9.8], [3.5, -9.6], [10.5, -8.4], [14.5, -5.5]];
      trees.forEach(([tx, tz], idx) => {
        const h = 5.4 + (idx % 3) * 1.1;
        const trC = new T.CatmullRomCurve3([
          new T.Vector3(0, -0.3, 0),
          new T.Vector3(idx % 2 ? 0.8 : -0.7, h * 0.42, 0.25),
          new T.Vector3(idx % 2 ? -0.4 : 0.5, h, -0.2)
        ]);
        add(new T.TubeGeometry(trC, 14, 0.42, 8, false), bark, tx, 0, tz);
        // Raízes aéreas arqueadas mergulhando na água
        for (let r = 0; r < 5; r++) {
          const a = (r / 5) * 6.28 + idx;
          const rc = new T.CatmullRomCurve3([
            new T.Vector3(0, 1.6, 0), new T.Vector3(Math.cos(a) * 1.1, 0.85, Math.sin(a) * 1.1), new T.Vector3(Math.cos(a) * 1.9, -0.35, Math.sin(a) * 1.9)
          ]);
          add(new T.TubeGeometry(rc, 10, 0.11, 6, false), bark, tx, 0, tz);
        }
        // Copa em camadas + cipós/musgos pendurados + lanterna verde
        for (let b = 0; b < 4; b++) {
          const ba = (b / 4) * 6.28 + idx;
          const lf = add(new T.IcosahedronGeometry(1.55, 1), canopyMat, tx + Math.cos(ba) * 1.25, h + 0.25 + (b % 2) * 0.45, tz + Math.sin(ba) * 1.1);
          lf.scale.set(1.25, 0.55, 1.15);
          // Musgos pendurados
          add(new T.CylinderGeometry(0.05, 0.015, 2.2, 5), mossVine, tx + Math.cos(ba) * 1.5, h - 0.9, tz + Math.sin(ba) * 1.3);
        }
        // Lanterna espectral pendurada no galho
        const lant = add(new T.OctahedronGeometry(0.22), glowMat, tx + (idx % 2 ? -1.1 : 1.1), h - 1.5, tz + 0.9);
        anim.push((t) => { lant.position.y = h - 1.5 + Math.sin(t * 2.2 + idx) * 0.12; });
      });

      // TEIAS DE ARANHA RADIAIS REAIS (raios + anéis concêntricos!) esticadas entre os troncos do fundo
      for (let i = 0; i < 3; i++) {
        const [x1, z1] = trees[i], [x2, z2] = trees[i + 1];
        const cx = (x1 + x2) * 0.5, cz = (z1 + z2) * 0.5, cy = 3.2;
        const span = Math.hypot(x2 - x1, z2 - z1) * 0.48;
        const webG = new T.Group(); webG.position.set(cx, cy, cz);
        webG.rotation.y = -Math.atan2(z2 - z1, x2 - x1);
        root.add(webG);
        for (let s = 0; s < 8; s++) {
          const a = (s / 8) * Math.PI * 2;
          const sp = add(new T.CylinderGeometry(0.022, 0.022, span * 1.9, 5), webLineMat, 0, 0, 0, webG);
          sp.rotation.z = a;
        }
        [0.32, 0.62, 0.92].forEach(frac => {
          const rg = add(new T.TorusGeometry(span * frac, 0.022, 6, 16), webLineMat, 0, 0, 0, webG);
          rg.scale.set(1.0, 0.82, 1);
        });
      }

      // Cachos de cogumelos bioluminescentes nas margens traseiras
      [[-7, -5.8], [-1, -6.2], [5.5, -5.9], [11.5, -5.6]].forEach(([mx, mz], idx) => {
        for (let k = 0; k < 4; k++) {
          const sc = 0.55 + k * 0.25;
          const ox = mx + (k - 1.5) * 0.45, oz = mz + (k % 2 ? 0.35 : -0.25);
          add(new T.CylinderGeometry(0.07 * sc, 0.12 * sc, 0.75 * sc, 7), M('#dad2b4'), ox, 0.35 * sc, oz);
          const cap = add(new T.SphereGeometry(0.42 * sc, 12, 8, 0, 6.28, 0, 1.5), (idx + k) % 2 ? glowMat : accGlow, ox, 0.72 * sc, oz);
          cap.scale.y = 0.55;
        }
      });

      // Vagalumes/esporos flutuantes
      const pts = new Float32Array(300 * 3);
      for (let i = 0; i < 300; i++) { pts[i * 3] = (rng() - 0.5) * 42; pts[i * 3 + 1] = 0.4 + rng() * 9; pts[i * 3 + 2] = -16 + rng() * 24; }
      const pGeo = new T.BufferGeometry(); pGeo.setAttribute('position', new T.BufferAttribute(pts, 3));
      const spores = new T.Points(pGeo, new T.PointsMaterial({ color: '#c4ff78', size: 0.16, transparent: true, opacity: 0.85 }));
      root.add(spores);
      anim.push((t) => { spores.position.y = Math.sin(t * 0.75) * 0.45; });

    } else if (reg === 10) {
      // === CIDADELA DE ENGRENAGENS: CATEDRAL-FUNDIÇÃO, VITRAIS INCANDESCENTES, ENGRENAGENS PBR & TESLA ===
      const copperMat = M('#b86834', { roughness: 0.34, metalness: 0.82 });
      const ironDark = M('#1a202c', { roughness: 0.46, metalness: 0.82 });

      function makeClockGear(r, teeth, matA, matB) {
        const gr = new T.Group();
        add(new T.TorusGeometry(r * 0.84, r * 0.13, 10, 30), matA, 0, 0, 0, gr);
        add(new T.CylinderGeometry(r * 0.28, r * 0.28, 0.38, 16), brassMat, 0, 0, 0, gr).rotation.x = Math.PI / 2;
        for (let s = 0; s < 6; s++) {
          const a = (s / 6) * 6.28;
          const sp = add(new T.BoxGeometry(r * 0.72, r * 0.11, 0.24), matA, Math.cos(a) * r * 0.42, Math.sin(a) * r * 0.42, 0, gr);
          sp.rotation.z = a;
        }
        for (let k = 0; k < teeth; k++) {
          const a = (k / teeth) * 6.28;
          const tt = add(new T.BoxGeometry(r * 0.2, r * 0.17, 0.3), matB, Math.cos(a) * (r + r * 0.05), Math.sin(a) * (r + r * 0.05), 0, gr);
          tt.rotation.z = a;
        }
        return gr;
      }

      // Fachada da Catedral-Fundição no fundo (-Z = -13) com 5 janelas em arco incandescentes!
      add(new T.BoxGeometry(30, 10.5, 1.4), wallMat, 1, 5.1, -13.5);
      add(new T.BoxGeometry(30.4, 0.55, 1.8), brassMat, 1, 10.4, -13.5);
      [-9, -4, 1, 6, 11].forEach((wx, idx) => {
        // Contraforte vertical
        add(new T.BoxGeometry(1.1, 11.2, 2.1), ironDark, wx - 2.5, 5.4, -13.2);
        // Janela industrial incandescente (fornalha laranja-âmbar)
        add(new T.BoxGeometry(2.2, 4.6, 0.2), accGlow, wx, 4.5, -12.75);
        add(new T.CylinderGeometry(1.1, 1.1, 0.2, 16, 1, false, 0, Math.PI), accGlow, wx, 6.8, -12.75).rotation.x = Math.PI / 2;
        // Grade de ferro sobre o vitral
        add(new T.BoxGeometry(2.3, 0.16, 0.32), ironDark, wx, 4.5, -12.65);
        add(new T.BoxGeometry(0.16, 5.6, 0.32), ironDark, wx, 5.0, -12.65);
      });

      // Engrenagens gigantes monumentais montadas na fachada girando em sincronia
      [[-7.5, 4.6, -11.8, 3.1, 16, 0.35], [-1.8, 6.4, -11.4, 2.3, 14, -0.5], [4.5, 4.8, -11.8, 3.4, 18, 0.28], [10.4, 3.2, -11.3, 2.1, 12, -0.55]].forEach(([gx, gy, gz, r, teeth, sp], i) => {
        const gr = makeClockGear(r, teeth, i % 2 ? brassMat : ironDark, i % 2 ? ironDark : brassMat);
        gr.position.set(gx, gy, gz);
        root.add(gr);
        anim.push((t, dt) => { gr.rotation.z += sp * dt; });
      });

      // Tubulações de cobre elevadas + Torres de Bobina Tesla ESTRITAMENTE atrás (-Z = -7.2)
      [-7.5, 0.5, 8.5].forEach((tx, idx) => {
        add(new T.CylinderGeometry(0.55, 0.78, 1.1, 8), ironDark, tx, 0.55, -7.4);
        add(new T.CylinderGeometry(0.28, 0.38, 4.2, 12), copperMat, tx, 2.9, -7.4);
        for (let k = 0; k < 5; k++) {
          add(new T.TorusGeometry(0.58 - k * 0.06, 0.07, 8, 20), brassMat, tx, 2.2 + k * 0.52, -7.4).rotation.x = Math.PI / 2;
        }
        const orb = add(new T.IcosahedronGeometry(0.42, 1), glowMat, tx, 5.35, -7.4);
        const halo = add(new T.TorusGeometry(0.66, 0.035, 8, 22), glowMat, tx, 5.35, -7.4);
        anim.push((t, dt) => {
          orb.material.emissiveIntensity = 1.3 + Math.sin(t * 5 + idx) * 0.7;
          halo.rotation.x += dt * 2.2; halo.rotation.y += dt * 1.5;
        });
      });
      // Cano de cobre ligando as torres no alto
      add(new T.CylinderGeometry(0.22, 0.22, 16.5, 10), copperMat, 0.5, 2.0, -7.8).rotation.z = Math.PI / 2;

      // Faíscas azuis e brasas flutuantes
      const pts = new Float32Array(260 * 3);
      for (let i = 0; i < 260; i++) { pts[i * 3] = (rng() - 0.5) * 42; pts[i * 3 + 1] = 0.5 + rng() * 11; pts[i * 3 + 2] = -14 + rng() * 22; }
      const pGeo = new T.BufferGeometry(); pGeo.setAttribute('position', new T.BufferAttribute(pts, 3));
      const sparks = new T.Points(pGeo, new T.PointsMaterial({ color: '#7ce8ff', size: 0.15, transparent: true, opacity: 0.8 }));
      root.add(sparks);
      anim.push((t) => { sparks.position.y = Math.sin(t * 1.1) * 0.35; });

    } else if (reg === 11) {
      // === O COSMOS: NEBULOSA PINTADA, BURACO NEGRO ESPIRAL, ASTROLÁBIO E TEMPLO CELESTIAL ===
      // Plano de nebulosa galáctica pintado ao fundo (-Z = -26)
      const nebTex = makeTex(512, 256, (x, w, h) => {
        const bg = x.createLinearGradient(0, 0, 0, h);
        bg.addColorStop(0, '#070218'); bg.addColorStop(0.5, '#19083a'); bg.addColorStop(1, '#060212');
        x.fillStyle = bg; x.fillRect(0, 0, w, h);
        [[140, 120, 150, 'rgba(255,80,220,.32)'], [350, 100, 160, 'rgba(70,190,255,.26)'], [256, 130, 120, 'rgba(155,70,255,.35)']].forEach(([nx, ny, nr, col]) => {
          const g = x.createRadialGradient(nx, ny, 10, nx, ny, nr);
          g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
          x.fillStyle = g; x.fillRect(0, 0, w, h);
        });
        for (let i = 0; i < 260; i++) {
          x.fillStyle = 'rgba(255,255,255,' + (0.3 + rng() * 0.7) + ')';
          x.beginPath(); x.arc(rng() * w, rng() * h, 0.7 + rng() * 1.6, 0, 6.28); x.fill();
        }
      }, [1, 1], false);
      const nebPlane = add(new T.PlaneGeometry(70, 36), new T.MeshBasicMaterial({ map: nebTex, fog: false }), 0, 11, -26);
      nebPlane.castShadow = false;

      // Buraco Negro / Portal Cósmico com disco de acreção espiral texturizado
      const discTex = makeTex(256, 256, (x, w, h) => {
        const cx = w / 2, cy = h / 2;
        const gr = x.createRadialGradient(cx, cy, 42, cx, cy, 126);
        gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.28, 'rgba(255,150,245,.95)');
        gr.addColorStop(0.58, 'rgba(130,65,255,.78)'); gr.addColorStop(0.85, 'rgba(85,220,255,.5)');
        gr.addColorStop(1, 'rgba(0,0,0,0)');
        x.fillStyle = gr; x.fillRect(0, 0, w, h);
        for (let i = 0; i < 45; i++) {
          const a = rng() * 6.28;
          x.strokeStyle = 'rgba(255,230,255,.35)'; x.lineWidth = 2;
          x.beginPath(); x.arc(cx, cy, 52 + rng() * 65, a, a + 0.9); x.stroke();
        }
      });
      const bh = new T.Group(); bh.position.set(1, 7.6, -16.5); root.add(bh);
      add(new T.SphereGeometry(2.5, 28, 22), new T.MeshBasicMaterial({ color: '#020007' }), 0, 0, 0, bh);
      add(new T.TorusGeometry(2.68, 0.14, 12, 64), glowMat, 0, 0, 0, bh);
      const accDisc = add(new T.PlaneGeometry(14.5, 14.5), new T.MeshBasicMaterial({ map: discTex, transparent: true, side: T.DoubleSide, depthWrite: false }), 0, 0, 0, bh);
      accDisc.rotation.x = Math.PI * 0.38;
      // Anéis de astrolábio dourados monumentais
      const ast1 = add(new T.TorusGeometry(6.2, 0.1, 8, 64), brassMat, 0, 0, 0, bh);
      ast1.rotation.x = 0.5; ast1.rotation.y = 0.35;
      const ast2 = add(new T.TorusGeometry(7.9, 0.08, 8, 64), brassMat, 0, 0, 0, bh);
      ast2.rotation.x = 1.35; ast2.rotation.z = 0.45;
      anim.push((t, dt) => {
        accDisc.rotation.z += dt * 0.45;
        ast1.rotation.y += dt * 0.22;
        ast2.rotation.x -= dt * 0.16;
      });

      // Colunas celestiais partidas + ilhas flutuantes ESTRITAMENTE atrás (-Z)
      [[-9.5, 1.4, -8.4], [-3.2, 2.2, -9.2], [5.2, 2.1, -9.0], [11.2, 1.5, -8.2]].forEach(([ix, iy, iz], idx) => {
        const isl = new T.Group(); isl.position.set(ix, iy, iz); root.add(isl);
        const rock = add(new T.ConeGeometry(1.5, 2.2, 6), wallMat, 0, -0.2, 0, isl);
        rock.rotation.x = Math.PI;
        add(new T.TorusGeometry(1.45, 0.06, 6, 18), brassMat, 0, 0.85, 0, isl).rotation.x = Math.PI / 2;
        // Pilar astral partido sobre a ilha
        add(new T.CylinderGeometry(0.36, 0.42, 2.6, 10), wallMat, 0, 2.15, 0, isl);
        add(new T.TorusGeometry(0.44, 0.05, 8, 16), brassMat, 0, 1.1, 0, isl).rotation.x = Math.PI / 2;
        // Cristal orbitando acima do pilar
        const cr = add(new T.OctahedronGeometry(0.42), idx % 2 ? glowMat : accGlow, 0, 4.1, 0, isl);
        cr.scale.set(0.7, 1.65, 0.7);
        anim.push((t) => {
          isl.position.y = iy + Math.sin(t * 1.05 + idx * 1.4) * 0.35;
          cr.rotation.y = t * 1.2;
        });
      });

      // Poeira estelar
      const pts = new Float32Array(420 * 3);
      for (let i = 0; i < 420; i++) { pts[i * 3] = (rng() - 0.5) * 58; pts[i * 3 + 1] = 0.8 + rng() * 20; pts[i * 3 + 2] = -20 + rng() * 30; }
      const pGeo = new T.BufferGeometry(); pGeo.setAttribute('position', new T.BufferAttribute(pts, 3));
      const stars = new T.Points(pGeo, new T.PointsMaterial({ color: '#f5dcff', size: 0.16, transparent: true, opacity: 0.85 }));
      root.add(stars);
      anim.push((t, dt) => { stars.rotation.y += dt * 0.014; });
    } else if (reg === 0) {
      // === CAMPOS DA NÉVOA: ARCO ANTIGO, TORRE DE VIGIA, MOINHO, CARVALHOS, FLORES E NEBLINA ===
      const bark = M('#5a3f2a', { roughness: 0.92 }), leafA = M('#4f8a34', { roughness: 0.85 }), leafB = M('#6fa83f', { roughness: 0.85 });
      const roofMat = M('#a4472f', { roughness: 0.7 }), woodMat = M('#8a6038', { roughness: 0.85 }), cloth = M('#e9dcc0', { roughness: 0.9, side: T.DoubleSide });
      // arco de pedra antigo com rúnica brilhante
      [-2.6, 4.6].forEach(px => { add(new T.BoxGeometry(1.5, 5.4, 1.5), wallMat, px, 2.7, -10.5); add(new T.BoxGeometry(1.9, 0.35, 1.9), trimMat, px, 5.55, -10.5); });
      add(new T.BoxGeometry(9.2, 1.1, 1.6), wallMat, 1, 5.95, -10.5); add(new T.BoxGeometry(9.4, 0.18, 1.8), trimMat, 1, 6.58, -10.5);
      const rune = add(new T.OctahedronGeometry(0.5), glowMat, 1, 5.05, -10.5);
      anim.push((t) => { rune.rotation.y = t * 1.2; rune.scale.y = 1.15 + Math.sin(t * 3) * 0.2; });
      [-2.6, 4.6].forEach((px, i) => { const vc = new T.CatmullRomCurve3([new T.Vector3(0, 0.2, 0.95), new T.Vector3(i ? -0.3 : 0.3, 2.4, 1.0), new T.Vector3(i ? 0.2 : -0.2, 4.6, 0.95)]); add(new T.TubeGeometry(vc, 12, 0.08, 5, false), leafA, px, 0, -10.5); });
      // torre de vigia
      const tw = new T.Group(); tw.position.set(-13.5, 0, -9.5); root.add(tw);
      add(new T.CylinderGeometry(1.5, 1.9, 6.5, 10), wallMat, 0, 3.25, 0, tw); add(new T.CylinderGeometry(2.15, 2.15, 0.4, 10), woodMat, 0, 6.7, 0, tw); add(new T.ConeGeometry(2.5, 2.5, 10), roofMat, 0, 8.15, 0, tw);
      add(new T.BoxGeometry(0.5, 0.9, 0.25), glowMat, 0, 4.2, 1.55, tw);
      const flag = add(new T.PlaneGeometry(1.0, 0.7), cloth, 0.55, 9.9, 0, tw); add(new T.CylinderGeometry(0.04, 0.04, 1.8, 5), woodMat, 0, 9.5, 0, tw);
      anim.push((t) => { flag.rotation.y = Math.sin(t * 2.3) * 0.35; });
      // moinho
      const mill = new T.Group(); mill.position.set(14.5, 0, -9.5); root.add(mill);
      add(new T.CylinderGeometry(1.2, 2.0, 5, 10), wallMat, 0, 2.5, 0, mill); add(new T.ConeGeometry(1.6, 1.7, 10), roofMat, 0, 5.85, 0, mill);
      const blades = new T.Group(); blades.position.set(0, 4.3, 1.75); mill.add(blades);
      for (let k = 0; k < 4; k++) { const arm = new T.Group(); arm.rotation.z = k * Math.PI / 2; blades.add(arm); add(new T.BoxGeometry(0.18, 3.8, 0.1), woodMat, 0, 1.9, 0, arm); add(new T.BoxGeometry(0.9, 2.3, 0.05), cloth, 0.52, 2.3, 0, arm); }
      anim.push((t, dt) => { blades.rotation.z += dt * 0.6; });
      // carvalhos
      [[-9, -8.2], [-5.5, -9.6], [7.8, -9.2], [11.2, -6.8], [-15.5, -5.5], [17.5, -5], [-3, -13], [5, -13.5]].forEach(([tx, tz], i) => {
        const h = 3.6 + (i % 3) * 0.9; const trC = new T.CatmullRomCurve3([new T.Vector3(0, -0.2, 0), new T.Vector3(i % 2 ? 0.35 : -0.3, h * 0.5, 0.1), new T.Vector3(0, h, 0)]);
        add(new T.TubeGeometry(trC, 10, 0.36, 7, false), bark, tx, 0, tz);
        for (let b = 0; b < 4; b++) { const a = b / 4 * 6.28 + i; const lf = add(new T.IcosahedronGeometry(1.5, 1), b % 2 ? leafA : leafB, tx + Math.cos(a) * 1.1, h + 0.3 + (b % 2) * 0.55, tz + Math.sin(a) * 1.0); lf.scale.set(1.25, 0.85, 1.2); }
      });
      // muretas de pedra e flores
      [[-11, -5.8], [3, -6.2], [9.5, -5.6]].forEach(([mx, mz]) => { for (let k = 0; k < 4; k++) add(new T.BoxGeometry(1.1, 0.55 + (k % 2) * 0.2, 0.5), wallMat, mx + k * 1.15, 0.25, mz + (k % 2) * 0.1); });
      for (let i = 0; i < 34; i++) { const fx = -13 + rng() * 29, fz = rng() > 0.4 ? -5.4 - rng() * 4 : 5.4 + rng() * 3.5; add(new T.SphereGeometry(0.1, 6, 5), i % 3 ? accGlow : glowMat, fx, 0.08, fz).castShadow = false; }
      // neblina (planos suaves em pé, à deriva)
      const mistTex = makeSoftTex(235, 242, 232);
      const mists = [];
      for (let i = 0; i < 6; i++) { const m = add(new T.PlaneGeometry(26, 6.5), new T.MeshBasicMaterial({ map: mistTex, transparent: true, opacity: 0.36, depthWrite: false, fog: false }), -12 + i * 5.2, 1.7, -6.2 - i * 1.7); m.castShadow = false; m.receiveShadow = false; mists.push(m); }
      anim.push((t) => { mists.forEach((m, i) => { m.position.x = -12 + i * 5.2 + Math.sin(t * 0.12 + i) * 3.2; m.material.opacity = 0.3 + Math.sin(t * 0.4 + i * 1.7) * 0.08; }); });
      const ff = falling(150, 40, 3.2, -14, 20, '#e8ff8a', 0.14, 0.8, -0.0, 0.8);
      anim.push((t) => { ff.position.y = Math.sin(t * 0.7) * 0.25; });
    } else if (reg === 1) {
      // === MARÉS PROFUNDAS: MAR, PÍER, NAUFRÁGIO, FAROL, ROCHAS E CORAIS ===
      const water = add(new T.PlaneGeometry(80, 64), M('#1d6f9a', { transparent: true, opacity: 0.84, metalness: 0.55, roughness: 0.1 }), 0, -0.3, 0); water.rotation.x = -Math.PI / 2; water.castShadow = false;
      const foam = add(new T.PlaneGeometry(58, 0.7), new T.MeshBasicMaterial({ color: '#f2fbff', transparent: true, opacity: 0.4, depthWrite: false }), 0, -0.26, 6.6); foam.rotation.x = -Math.PI / 2; foam.castShadow = false;
      anim.push((t) => { water.position.y = -0.3 + Math.sin(t * 0.9) * 0.04; foam.position.z = 6.6 + Math.sin(t * 0.8) * 0.55; foam.material.opacity = 0.28 + Math.sin(t * 0.8 + 1) * 0.14; });
      const pl = makePlanks(rng, [1, 1]); const plankMat = M('#ffffff', { map: pl.map, bumpMap: pl.bump, bumpScale: 0.05, roughness: 0.85 });
      const woodDark = M('#4a3220', { roughness: 0.9 }), cloth = M('#d8c9a2', { roughness: 0.9, side: T.DoubleSide }), rockMat = M('#3a4650', { roughness: 0.92 });
      // píer comprido atrás da arena
      add(new T.BoxGeometry(26, 0.22, 2.5), plankMat, 1.5, 0.02, -6.7);
      for (let i = 0; i < 12; i++) { add(new T.CylinderGeometry(0.17, 0.21, 1.8, 7), woodDark, -10 + i * 2.3, -0.7, -5.55); add(new T.CylinderGeometry(0.17, 0.21, 1.8, 7), woodDark, -10 + i * 2.3, -0.7, -7.85); }
      [-10, -3, 4, 11].forEach(px => { add(new T.CylinderGeometry(0.22, 0.26, 1.7, 7), woodDark, px, 0.85, -5.5); add(new T.OctahedronGeometry(0.2), glowMat, px, 1.9, -5.5); });
      // naufrágio atrás à direita
      const ship = new T.Group(); ship.position.set(8, -0.2, -13); ship.rotation.z = 0.12; root.add(ship);
      add(new T.TubeGeometry(new T.CatmullRomCurve3([new T.Vector3(-5.5, 0.9, 0), new T.Vector3(-2, 0, 0), new T.Vector3(2.5, 0, 0), new T.Vector3(6.2, 1.5, 0)]), 16, 0.16, 6, false), woodDark, 0, 0, 0, ship);
      for (let i = 0; i < 8; i++) { const x = -4.5 + i * 1.35, hh = 2.6 - Math.abs(x - 0.5) * 0.12, pts = []; for (let k = 0; k <= 10; k++) { const a = Math.PI * k / 10; pts.push(new T.Vector3(x, 0.1 + Math.sin(a) * hh, Math.cos(a) * 1.7)); } add(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 14, 0.1, 5, false), woodDark, 0, 0, 0, ship); }
      const mast = add(new T.CylinderGeometry(0.15, 0.2, 8.5, 7), woodDark, 0.5, 4.2, 0, ship); mast.rotation.z = -0.1;
      const sail = add(new T.PlaneGeometry(3.4, 4.0), cloth, 1.6, 5.2, 0.05, ship);
      anim.push((t) => { sail.rotation.y = Math.sin(t * 1.4) * 0.12; ship.rotation.z = 0.12 + Math.sin(t * 0.7) * 0.02; });
      // farol
      const lh = new T.Group(); lh.position.set(-15, 0, -13.5); root.add(lh);
      const redM = M('#c0392b', { roughness: 0.7 }), whiteM = M('#eee9dc', { roughness: 0.7 });
      for (let i = 0; i < 6; i++) add(new T.CylinderGeometry(1.55 - i * 0.16, 1.7 - i * 0.16, 1.5, 12), i % 2 ? whiteM : redM, 0, 0.75 + i * 1.5, 0, lh);
      add(new T.CylinderGeometry(1.1, 1.1, 1.1, 12), glowMat, 0, 9.5, 0, lh); add(new T.ConeGeometry(1.35, 1.1, 12), redM, 0, 10.6, 0, lh);
      const beam = add(new T.ConeGeometry(2.2, 14, 14, 1, true), new T.MeshBasicMaterial({ color: '#fff3b0', transparent: true, opacity: 0.1, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide, fog: false }), 0, 9.5, 0, lh);
      beam.geometry.translate(0, -7, 0); beam.rotation.z = Math.PI / 2 - 0.15; beam.castShadow = false;
      anim.push((t) => { beam.rotation.y = t * 0.6; });
      // rochas, corais e bolhas
      for (let i = 0; i < 12; i++) { const rx = -16 + rng() * 34, rz = -5.5 - rng() * 8; if (Math.abs(rx) < 9 && rz > -8.5) continue; const s = 0.7 + rng() * 1.5; const r = add(new T.IcosahedronGeometry(s, 1), rockMat, rx, -0.1, rz); r.scale.y = 0.7; r.rotation.set(rng(), rng() * 6, 0); }
      const coral = [M('#ff7a8a', { emissive: '#ff4a6a', emissiveIntensity: 0.35, roughness: 0.6 }), M('#ffb04a', { emissive: '#ff8a1a', emissiveIntensity: 0.3, roughness: 0.6 }), M('#c27aff', { emissive: '#8a4aff', emissiveIntensity: 0.35, roughness: 0.6 })];
      [[-5, -8.4], [2, -8.6], [9, -8.4], [-12, -6], [13.5, -6.5]].forEach(([cx, cz], i) => { for (let k = 0; k < 6; k++) { const h = 0.6 + rng() * 1.0; add(new T.ConeGeometry(0.14 + rng() * 0.1, h, 5), coral[(i + k) % 3], cx + (rng() - 0.5) * 1.4, h * 0.5 - 0.2, cz + (rng() - 0.5) * 1.0); } });
      const bub = falling(120, 40, 5, -14, 18, '#cfefff', 0.12, 0.6, -0.9, 0.3);
    } else if (reg === 2) {
      // === CAVERNAS DE PRISMA: CRISTAIS BRILHANTES, ESTALACTITES, LAGO ESPELHADO E FEIXES DE LUZ ===
      const cols = ['#ff7ef2', '#6ce4ff', '#b48cff', '#7dffb5'];
      const cm = cols.map(c => M(c, { emissive: c, emissiveIntensity: 1.1, roughness: 0.12, metalness: 0.2, transparent: true, opacity: 0.9 }));
      const rockDark = M('#2a2040', { roughness: 0.9 }), rockMid = M('#3a2d58', { roughness: 0.85 });
      const cluster = (px, pz, sc) => { for (let k = 0; k < 7; k++) { const sy = 2.2 + rng() * 3.4; const c = add(new T.OctahedronGeometry(0.5 * sc, 0), cm[(rng() * 4) | 0], px + (rng() - 0.5) * 1.8 * sc, sy * 0.5 * sc, pz + (rng() - 0.5) * 1.5 * sc); c.scale.set(0.62, sy, 0.62); c.rotation.set((rng() - 0.5) * 0.4, rng() * 3, (rng() - 0.5) * 0.4); } };
      [[-12, -6.5, 1], [-6.5, -10, 1.1], [3.5, -10.5, 1.2], [9.5, -7.8, 1], [14, -9.5, 1.1], [-15.5, -10, 1.3], [1, -13.5, 2]].forEach(([x, z, s]) => cluster(x, z, s));
      anim.push((t) => { cm.forEach((m, i) => { m.emissiveIntensity = 1.0 + Math.sin(t * 1.6 + i * 1.3) * 0.45; }); });
      for (let i = 0; i < 18; i++) { const h = 3 + rng() * 5, s = add(new T.ConeGeometry(0.5 + rng() * 0.9, h, 7), rockDark, -22 + rng() * 44, 14 - h * 0.5, -6 - rng() * 11); s.rotation.x = Math.PI; }
      for (let i = 0; i < 10; i++) { const s = 3 + rng() * 3, r = add(new T.IcosahedronGeometry(s, 1), i % 2 ? rockMid : rockDark, -24 + i * 5.3, s * 0.5, -17 - rng() * 3); r.scale.y = 1.4; }
      const lake = add(new T.CircleGeometry(7, 40), M('#120a24', { metalness: 0.92, roughness: 0.04 }), 1, -0.1, -8.8); lake.rotation.x = -Math.PI / 2; lake.scale.set(1.9, 1, 0.7); lake.castShadow = false;
      [[-7, 0xd6b8ff], [3, 0xb8f0ff], [10, 0xffc4f6]].forEach(([sx, c], i) => { const sh = add(new T.ConeGeometry(1.9, 15, 16, 1, true), new T.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.09, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide, fog: false }), sx, 7.5, -8 - i); sh.rotation.x = Math.PI; sh.castShadow = false; anim.push((t) => { sh.material.opacity = 0.07 + Math.sin(t * 0.8 + i * 2) * 0.03; }); });
      const gl = falling(180, 40, 10, -14, 20, '#e6d4ff', 0.13, 0.75, -0.25, 0.4);
    } else if (reg === 4) {
      // === ABISMO DO VAZIO: ILHA FLUTUANDO NO NADA, PORTAL, RUÍNAS À DERIVA E CORRENTES DOURADAS ===
      const dark = M('#150e26', { roughness: 0.9 }), gold = brassMat;
      const under = add(new T.ConeGeometry(11, 9, 8), dark, 0, -4.7, 0); under.rotation.x = Math.PI; under.scale.set(1, 1, 0.62);
      const ringGlow = add(new T.TorusGeometry(9.9, 0.07, 8, 72), glowMat, 0, -0.01, 0); ringGlow.rotation.x = Math.PI / 2; ringGlow.scale.y = 0.55;
      const sp = new Float32Array(520 * 3); for (let i = 0; i < 520; i++) { const a = rng() * 6.28, rr = 26 + rng() * 22; sp[i * 3] = Math.cos(a) * rr; sp[i * 3 + 1] = -14 + rng() * 40; sp[i * 3 + 2] = Math.sin(a) * rr * 0.9 - 8; }
      const sg = new T.BufferGeometry(); sg.setAttribute('position', new T.BufferAttribute(sp, 3));
      const starsP = new T.Points(sg, new T.PointsMaterial({ color: '#efe0ff', size: 0.2, transparent: true, opacity: 0.9, fog: false })); starsP.frustumCulled = false; root.add(starsP);
      anim.push((t, dt) => { starsP.rotation.y += dt * 0.01; });
      const discTex = makeTex(256, 256, (x, w, h) => { const cx = w / 2, cy = h / 2, gr = x.createRadialGradient(cx, cy, 30, cx, cy, 126); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.3, 'rgba(255,200,90,.9)'); gr.addColorStop(0.6, 'rgba(160,80,255,.75)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gr; x.fillRect(0, 0, w, h); for (let i = 0; i < 40; i++) { const a = rng() * 6.28; x.strokeStyle = 'rgba(255,235,200,.35)'; x.lineWidth = 2; x.beginPath(); x.arc(cx, cy, 50 + rng() * 70, a, a + 0.9); x.stroke(); } });
      const gate = new T.Group(); gate.position.set(1, 6.8, -15); root.add(gate);
      add(new T.SphereGeometry(2.7, 28, 22), new T.MeshBasicMaterial({ color: '#010005' }), 0, 0, 0, gate);
      add(new T.TorusGeometry(2.9, 0.16, 12, 64), glowMat, 0, 0, 0, gate);
      const disc = add(new T.PlaneGeometry(15, 15), new T.MeshBasicMaterial({ map: discTex, transparent: true, side: T.DoubleSide, depthWrite: false, fog: false }), 0, 0, 0, gate); disc.rotation.x = Math.PI * 0.4;
      const ar1 = add(new T.TorusGeometry(6.4, 0.11, 8, 64), gold, 0, 0, 0, gate); ar1.rotation.x = 0.55; ar1.rotation.y = 0.3;
      const ar2 = add(new T.TorusGeometry(8.2, 0.08, 8, 64), gold, 0, 0, 0, gate); ar2.rotation.x = 1.3; ar2.rotation.z = 0.4;
      anim.push((t, dt) => { disc.rotation.z += dt * 0.5; ar1.rotation.y += dt * 0.2; ar2.rotation.x -= dt * 0.15; });
      [[-10, 1.6, -8.5], [-4.5, 2.6, -10.5], [6.5, 2.2, -10], [12, 1.4, -7.5], [-15, 3.4, -12], [17, 3, -12.5]].forEach(([ix, iy, iz], idx) => {
        const isl = new T.Group(); isl.position.set(ix, iy, iz); root.add(isl);
        const rk = add(new T.ConeGeometry(1.7, 2.4, 6), dark, 0, -0.3, 0, isl); rk.rotation.x = Math.PI;
        add(new T.CylinderGeometry(0.42, 0.5, 2.8 + (idx % 2) * 1.2, 10), wallMat, 0, 2.0, 0, isl);
        add(new T.TorusGeometry(0.5, 0.06, 8, 18), gold, 0, 1.3, 0, isl).rotation.x = Math.PI / 2;
        const cr = add(new T.OctahedronGeometry(0.4), idx % 2 ? glowMat : accGlow, 0, 4.2 + (idx % 2) * 1.2, 0, isl); cr.scale.set(0.7, 1.6, 0.7);
        add(new T.CylinderGeometry(0.04, 0.04, 6, 5), gold, 0.9, -2.8, 0, isl);
        anim.push((t) => { isl.position.y = iy + Math.sin(t * 0.9 + idx * 1.3) * 0.4; cr.rotation.y = t * 1.3; });
      });
    } else if (reg === 5) {
      // === CORDILHEIRA GLACIAL: PICOS DE GELO, PINHEIROS NEVADOS, CACHOEIRA CONGELADA, AURORA E NEVE ===
      const iceM = M('#8fd3f5', { transparent: true, opacity: 0.9, roughness: 0.1, metalness: 0.2, emissive: '#1d5f86', emissiveIntensity: 0.4 });
      const iceDeep = M('#6fbfe6', { transparent: true, opacity: 0.9, roughness: 0.14, metalness: 0.2, emissive: '#1a5a7a', emissiveIntensity: 0.4 });
      const pineG = M('#2d5a4a', { roughness: 0.9 }), snowC = M('#f4fbff', { roughness: 0.8 }), trunk = M('#5a4030', { roughness: 0.9 });
      for (let i = 0; i < 11; i++) { const h = 6 + rng() * 7, r = 1.3 + rng() * 1.5; const sp = add(new T.ConeGeometry(r, h, 5), i % 3 ? iceM : iceDeep, -21 + i * 4.2 + rng() * 2, h * 0.5 - 0.3, -11.5 - rng() * 5); sp.rotation.y = rng() * 3; sp.rotation.z = (rng() - 0.5) * 0.12; }
      for (let i = 0; i < 14; i++) {
        const px = -17 + rng() * 36, pz = -6.5 - rng() * 8; if (Math.abs(px) < 8 && pz > -7.5) continue; const sc = 0.8 + rng() * 0.9;
        add(new T.CylinderGeometry(0.12 * sc, 0.16 * sc, 0.8 * sc, 6), trunk, px, 0.4 * sc, pz);
        for (let k = 0; k < 3; k++) { add(new T.ConeGeometry((1.35 - k * 0.38) * sc, 1.5 * sc, 8), pineG, px, (1.2 + k * 0.9) * sc, pz); add(new T.ConeGeometry((0.95 - k * 0.3) * sc, 0.7 * sc, 8), snowC, px, (1.55 + k * 0.9) * sc, pz); }
      }
      const fall = add(new T.BoxGeometry(3.2, 9, 0.8), iceM, -9.5, 4.5, -12.5);
      for (let i = 0; i < 6; i++) add(new T.BoxGeometry(0.12, 8.6, 0.9), iceDeep, -10.8 + i * 0.52, 4.5, -12.5);
      for (let i = 0; i < 9; i++) { const ic = add(new T.ConeGeometry(0.09, 0.55 + rng() * 0.4, 5), iceM, -8.35 + (rng() - 0.5) * 0.2, 1.35, -4.0 + i * 1.0); ic.rotation.x = Math.PI; }
      const auTex = makeAuroraTex(rng);
      const aur = add(new T.PlaneGeometry(90, 28), new T.MeshBasicMaterial({ map: auTex, transparent: true, opacity: 0.8, depthWrite: false, fog: false, blending: T.AdditiveBlending }), 0, 14, -32); aur.castShadow = false;
      anim.push((t) => { aur.material.opacity = 0.65 + Math.sin(t * 0.5) * 0.18; aur.position.x = Math.sin(t * 0.07) * 4; });
      falling(420, 46, 14, -14, 26, '#ffffff', 0.14, 0.9, 1.1, 0.6);
    } else if (reg === 6) {
      // === RUÍNAS DA TEMPESTADE: TORRES QUEBRADAS, PÁTIO MOLHADO, CHUVA, RAIOS E NUVENS NEGRAS ===
      const stoneD = M('#3d3850', { roughness: 0.6, metalness: 0.2 });
      const glowC = M('#c49bff', { emissive: '#9a6bff', emissiveIntensity: 1.5, roughness: 0.2 });
      [[-10.5, -9, 9.5], [4, -11.5, 12.5], [13, -8, 8]].forEach(([tx, tz, h], i) => {
        const tg = new T.Group(); tg.position.set(tx, 0, tz); root.add(tg);
        add(new T.CylinderGeometry(2.0, 2.4, h, 10), wallMat, 0, h / 2, 0, tg); add(new T.CylinderGeometry(2.5, 2.5, 0.35, 10), trimMat, 0, h * 0.6, 0, tg);
        for (let k = 0; k < 5; k++) { const a = k / 5 * 6.28, bh = 0.8 + rng() * 1.6; const jag = add(new T.BoxGeometry(0.9, bh, 0.9), wallMat, Math.cos(a) * 1.6, h + bh * 0.5 - 0.1, Math.sin(a) * 1.6, tg); jag.rotation.set((rng() - 0.5) * 0.3, rng(), (rng() - 0.5) * 0.3); }
        const win = add(new T.BoxGeometry(0.45, 1.0, 0.3), glowC, 0, h * 0.45, 2.1, tg);
        anim.push((t) => { win.material.emissiveIntensity = 1.2 + Math.sin(t * 2.4 + i) * 0.5; });
      });
      const sp = add(new T.CylinderGeometry(0.1, 0.22, 14, 6), stoneD, 1, 7, -13.5); const tip = add(new T.OctahedronGeometry(0.4), glowC, 1, 14.4, -13.5); tip.scale.y = 1.6;
      anim.push((t) => { tip.rotation.y = t * 2; });
      for (let i = 0; i < 5; i++) { const px = -9 + i * 5.6, ang = (rng() - 0.5) * 0.5; const col = add(new T.CylinderGeometry(0.4, 0.46, 3.6, 10), wallMat, px, 0.38, -6.9 - rng() * 1.6); col.rotation.z = Math.PI / 2; col.rotation.y = ang; }
      [[-3, -6, 0, 3.2], [8, -6.5, 0, 4.2]].forEach(([ax, az, , h]) => { [0, 4].forEach(o => add(new T.BoxGeometry(0.9, h, 0.9), wallMat, ax + o - 1, h / 2, az)); add(new T.BoxGeometry(5.6, 0.6, 1.0), wallMat, ax + 1, h + 0.3, az); });
      for (let i = 0; i < 7; i++) { const pw = add(new T.CircleGeometry(0.9 + rng() * 1.1, 18), M('#0e0a1c', { metalness: 0.95, roughness: 0.05 }), -12 + rng() * 26, -0.17, rng() > 0.5 ? 5.4 + rng() * 2.5 : -5 - rng() * 2.5); pw.rotation.x = -Math.PI / 2; pw.castShadow = false; }
      const cloudTex = makeSoftTex(60, 48, 90);
      for (let i = 0; i < 7; i++) { const c = add(new T.PlaneGeometry(34, 12), new T.MeshBasicMaterial({ map: cloudTex, transparent: true, opacity: 0.9, depthWrite: false, fog: false }), -26 + i * 9, 15 + (i % 2) * 2, -26 - (i % 3) * 3); c.castShadow = false; anim.push((t) => { c.position.x = -26 + i * 9 + Math.sin(t * 0.06 + i) * 3; }); }
      const bolt = new T.Group(); bolt.visible = false; root.add(bolt);
      { let bx = 2, by = 22; for (let k = 0; k < 8; k++) { const nx = bx + (rng() - 0.5) * 3.2, ny = by - 3; const len = Math.hypot(nx - bx, ny - by); const seg = add(new T.BoxGeometry(0.22, len, 0.22), new T.MeshBasicMaterial({ color: '#f1e8ff', fog: false }), (bx + nx) / 2, (by + ny) / 2, -17, bolt); seg.rotation.z = Math.atan2(-(nx - bx), ny - by); seg.castShadow = false; bx = nx; by = ny; } }
      const bg0 = new T.Color(PAL.sky), bg1 = new T.Color('#9a86d8'); let nextB = 2.5, flash = 0;
      anim.push((t, dt) => { if (t > nextB) { flash = 1; nextB = t + 2.5 + rng() * 4.5; bolt.position.x = (rng() - 0.5) * 16; } flash = Math.max(0, flash - dt * 3.2); bolt.visible = flash > 0.45; scene.background.copy(bg0).lerp(bg1, flash * 0.45); glowC.emissiveIntensity = 1.5 + flash * 1.5; });
      falling(620, 44, 16, -14, 26, '#b9c6ff', 0.07, 0.55, 14, 0.6);
    }

    // -----------------------------------------------------------------------
    // 3. SISTEMA DE VFX 3D DAS HABILIDADES DOS CHEFES
    // -----------------------------------------------------------------------
    const vfxGroup = new T.Group(); scene.add(vfxGroup);
    const activeVfx = [];

    function triggerVfx() {

      if (reg === 8) {
        const fx = new T.Group(); fx.position.set(2.4, 0.08, 0); vfxGroup.add(fx);
        const pool = new T.Mesh(new T.CylinderGeometry(2.7, 2.9, 0.08, 28), M('#7dff28', { emissive: '#6aff1f', emissiveIntensity: 1.5, transparent: true, opacity: 0.72 }));
        fx.add(pool);
        const vortex = [];
        for (let k = 0; k < 5; k++) {
          const ring = new T.Mesh(new T.TorusGeometry(0.85 + k * 0.52, 0.12, 8, 28), M('#e0a852', { emissive: '#b57220', emissiveIntensity: 0.55, transparent: true, opacity: 0.8 }));
          ring.rotation.x = Math.PI / 2; ring.position.y = 0.25 + k * 0.62;
          fx.add(ring); vortex.push(ring);
        }
        const bubbles = [];
        for (let k = 0; k < 14; k++) {
          const b = new T.Mesh(new T.SphereGeometry(0.16 + (k % 3) * 0.07, 8, 6), accGlow.clone());
          b.material.transparent = true;
          const a = (k / 14) * 6.28, rr = 0.5 + (k % 4) * 0.55;
          b.position.set(Math.cos(a) * rr, 0.2, Math.sin(a) * rr);
          fx.add(b); bubbles.push({ m: b, sp: 1.2 + (k % 3) * 0.6 });
        }
        activeVfx.push({ g: fx, life: 0, max: 2.6, step(u, dt) {
          pool.scale.setScalar(Math.min(1, u * 4)); pool.material.opacity = (1 - u) * 0.75;
          vortex.forEach((r, i) => { r.rotation.z += dt * (4 + i); r.position.y += dt * 0.85; r.material.opacity = Math.max(0, (1 - u * 1.2) * 0.8); });
          bubbles.forEach(o => { o.m.position.y += dt * o.sp; o.m.material.opacity = Math.max(0, 1 - u); });
        }});
      } else if (reg === 9) {
        [[-3.2, -1.6], [-1.6, 1.6], [0.0, 0.0]].forEach(([tx, tz]) => {
          const fx = new T.Group(); fx.position.set(tx, 0.06, tz); vfxGroup.add(fx);
          const ring = new T.Mesh(new T.TorusGeometry(0.92, 0.06, 8, 24), M('#c6ff90', { emissive: '#8cff42', emissiveIntensity: 1.6, transparent: true, opacity: 0.9 }));
          ring.rotation.x = Math.PI / 2; fx.add(ring);
          const cage = [];
          for (let k = 0; k < 6; k++) {
            const a = (k / 6) * 6.28;
            const strand = new T.Mesh(new T.TorusGeometry(0.85, 0.034, 6, 20), M('#e8ffd4', { emissive: '#9dff4a', emissiveIntensity: 1.0, transparent: true, opacity: 0.85 }));
            strand.rotation.y = a; strand.rotation.x = 0.55; strand.position.y = 0.85;
            fx.add(strand); cage.push(strand);
          }
          activeVfx.push({ g: fx, life: 0, max: 2.8, step(u, dt) {
            const sc = Math.min(1, u * 5); fx.scale.set(sc, sc, sc);
            const op = u > 0.7 ? (1 - u) / 0.3 : 1;
            ring.material.opacity = op * 0.9;
            cage.forEach((s, i) => { s.rotation.z += dt * (i % 2 ? 1.2 : -1.2); s.material.opacity = op * 0.85; });
          }});
        });
      } else if (reg === 10) {
        const fx = new T.Group(); fx.position.set(3.2, 0.2, 0); vfxGroup.add(fx);
        const wave1 = new T.Mesh(new T.TorusGeometry(1, 0.14, 10, 48), M('#5ce4ff', { emissive: '#5ce4ff', emissiveIntensity: 2.2, transparent: true, opacity: 0.95 }));
        wave1.rotation.x = Math.PI / 2; fx.add(wave1);
        const wave2 = new T.Mesh(new T.TorusGeometry(1, 0.08, 8, 48), M('#ffffff', { emissive: '#9cf0ff', emissiveIntensity: 2.4, transparent: true, opacity: 0.85 }));
        wave2.rotation.x = Math.PI / 2; wave2.position.y = 0.7; fx.add(wave2);
        const dome = new T.Mesh(new T.SphereGeometry(1, 24, 14, 0, 6.28, 0, Math.PI * 0.5), M('#5ce4ff', { emissive: '#38c8ff', emissiveIntensity: 1.4, transparent: true, opacity: 0.32, side: T.DoubleSide }));
        fx.add(dome);
        activeVfx.push({ g: fx, life: 0, max: 1.9, step(u) {
          const R = 0.8 + u * 10.5; wave1.scale.set(R, R, 1); wave1.material.opacity = Math.max(0, 1 - u);
          const R2 = 0.6 + Math.pow(u, 0.75) * 9.5; wave2.scale.set(R2, R2, 1); wave2.material.opacity = Math.max(0, 1 - u * 1.15);
          dome.scale.setScalar(0.8 + u * 9.0); dome.material.opacity = Math.max(0, (1 - u) * 0.34);
        }});
      } else if (reg === 11) {
        [[-4.8, -1.6], [-1.6, 1.6], [1.6, -1.6], [3.2, 1.6]].forEach(([sx, sz], idx) => {
          const fx = new T.Group(); fx.position.set(sx, 0.06, sz); vfxGroup.add(fx);
          const beam = new T.Mesh(new T.CylinderGeometry(0.42, 0.62, 14, 14), M('#ff7ef2', { emissive: '#ff52e8', emissiveIntensity: 2.2, transparent: true, opacity: 0.85 }));
          beam.position.y = 7; fx.add(beam);
          const core = new T.Mesh(new T.CylinderGeometry(0.18, 0.24, 14, 10), M('#ffffff', { emissive: '#ffffff', emissiveIntensity: 2.6, transparent: true, opacity: 0.95 }));
          core.position.y = 7; fx.add(core);
          const shock = new T.Mesh(new T.TorusGeometry(0.8, 0.09, 8, 32), M('#6ce4ff', { emissive: '#6ce4ff', emissiveIntensity: 2.0, transparent: true, opacity: 0.95 }));
          shock.rotation.x = Math.PI / 2; fx.add(shock);
          activeVfx.push({ g: fx, life: -idx * 0.14, max: 1.7, step(u) {
            if (u < 0) { fx.visible = false; return; }
            fx.visible = true;
            const w = Math.sin(u * Math.PI);
            beam.scale.set(0.4 + w * 0.9, 1, 0.4 + w * 0.9); beam.material.opacity = w * 0.85;
            core.scale.set(0.3 + w * 0.8, 1, 0.3 + w * 0.8); core.material.opacity = w * 0.95;
            shock.scale.setScalar(0.6 + u * 2.8); shock.material.opacity = Math.max(0, 1 - u);
          }});
        });
      }
    }

    function step(t, dt) {
      anim.forEach(f => f(t, dt));
      for (let i = activeVfx.length - 1; i >= 0; i--) {
        const v = activeVfx[i];
        v.life += dt;
        const u = v.life / v.max;
        if (u >= 1) { vfxGroup.remove(v.g); activeVfx.splice(i, 1); }
        else { v.step(u, dt); }
      }
    }

    /* minas do portão (uma por faixa), iguais às do cenário antigo: o jogo move/gira esses grupos */
    const wallMines = [];
    for (let r = 0; r < 5; r++) {
      const group = new T.Group(); group.position.set(-7.84, 0.1, -3.2 + r * 1.6); root.add(group);
      const core = add(new T.DodecahedronGeometry(0.48, 1), accGlow, 0, 0.42, 0, group);
      const ring = add(new T.TorusGeometry(0.55, 0.035, 6, 32), brassMat, 0, 0.42, 0, group); ring.rotation.x = Math.PI / 2;
      wallMines.push({ group, coreCrystal: core, runeRing: ring });
    }
    let lastT = null;
    const update = (t) => { const dt = lastT == null ? 0 : Math.max(0, Math.min(0.1, t - lastT)); lastT = t; step(t, dt); };
    return { tileMeshes, wallMines, update, triggerVfx };
  }

    return buildUpgradedRegion;
  }
  window.WarArenasHD = { build(scene, reg) { if (!built) built = make(); return built(scene, reg); }, has: reg => reg === 0 || reg === 1 || reg === 2 || reg === 4 || reg === 5 || reg === 6 || (reg >= 8 && reg <= 11) };
})();
