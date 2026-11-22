/* Ataques e sons dos Lendários (Vigia, Eclipse, Morcego, Hamster, Demônio das Cinzas, Colosso, Arquimago).
   Origem: prévia legendary-dragons-preview (Gemini), adaptada por Claude em 2026-11-20 para rodar dentro da batalha:
   - todos os tempos usam o relógio da simulação (host.later), então o estouro cai junto com o dano;
   - sem luz dinâmica nova (evita recompilar shaders no iPhone); o clarão da tela e o tremor vêm do jogo (host.flash/shake).
   host = { T, fx, root, later(delay, fn), flash(col, strong), dim(dur, hex), shake(v), audio(), muted() }
   ctx  = { a: boca do dragão, b: alvo da frente, g: chão sob b, sky: céu sobre b, tg: [3 posições de inimigos] } */
(function () {
  'use strict';
  const CAT = {
    vigia:             { c1: '#38bdf8', c2: '#f472b6', c3: '#ffe066' },
    eclipse:           { c1: '#7c3aed', c2: '#ffcc44', c3: '#c084fc' },
    morcego:           { c1: '#a855f7', c2: '#e9d5ff', c3: '#ff52b8' },
    hamster:           { c1: '#ff9a3c', c2: '#c58bff', c3: '#fff08a' },
    demonio_cinzas:    { c1: '#ef4444', c2: '#facc15', c3: '#fb923c' },
    colosso_obsidiana: { c1: '#fb923c', c2: '#475569', c3: '#fde047' },
    arquimago_astral:  { c1: '#6366f1', c2: '#fbbf24', c3: '#38bdf8' }
  };
  /* instante (s, relógio da simulação) em que o dano deve cair: [golpe normal, especial] */
  const HIT = { vigia: [0.44, 1.18], eclipse: [0.62, 1.48], morcego: [0.42, 1.38], hamster: [1.0, 1.62], demonio_cinzas: [0.38, 1.40], colosso_obsidiana: [0.31, 1.42], arquimago_astral: [0.52, 1.48] };

  /* ---------- som (mesma paleta da prévia, com compressor próprio) ---------- */
  let bus = null, busCtx = null;
  function getBus(ctx) {
    if (bus && busCtx === ctx) return bus;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.knee.value = 18; comp.ratio.value = 6;
    bus = ctx.createGain(); bus.gain.value = 1.6; bus.connect(comp); comp.connect(ctx.destination); busCtx = ctx; return bus;
  }
  let noiseCache = null, noiseCtx = null;
  function noiseBuf(ctx) {
    if (noiseCache && noiseCtx === ctx) return noiseCache;
    const len = Math.floor(ctx.sampleRate * 0.9), b = ctx.createBuffer(1, len, ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    noiseCache = b; noiseCtx = ctx; return b;
  }
  function mkSfx(host) {
    const A = () => { if (host.muted && host.muted()) return null; const c = host.audio && host.audio(); if (!c || c.state === 'suspended') return null; return c; };
    const tone = (c, type, f0, f1, dur, gain, delay) => {
      const t = c.currentTime + (delay || 0), o = c.createOscillator(), g = c.createGain();
      o.type = type; o.frequency.setValueAtTime(f0, t); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
      g.gain.setValueAtTime(0.001, t); g.gain.linearRampToValueAtTime(gain, t + Math.min(0.025, dur * 0.2)); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(g); g.connect(getBus(c)); o.start(t); o.stop(t + dur + 0.03);
    };
    const noise = (c, dur, f0, f1, q, gain, type, delay) => {
      const t = c.currentTime + (delay || 0), ns = c.createBufferSource(); ns.buffer = noiseBuf(c);
      const fl = c.createBiquadFilter(); fl.type = type || 'bandpass'; fl.frequency.setValueAtTime(f0, t); if (f1 !== f0) fl.frequency.exponentialRampToValueAtTime(Math.max(40, f1), t + dur); fl.Q.value = q;
      const g = c.createGain(); g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.001, t + Math.min(dur, 0.9));
      ns.connect(fl); fl.connect(g); g.connect(getBus(c)); ns.start(t);
    };
    return {
      charge(kind) {
        const c = A(); if (!c) return;
        if (kind === 'crystal' || kind === 'aurora') [440, 660, 880].forEach((f, i) => tone(c, i ? 'sine' : 'triangle', f, f * 2.1, 0.28, 0.075 / (i + 1)));
        else if (kind === 'void') { tone(c, 'sine', 95, 220, 0.35, 0.22); tone(c, 'sawtooth', 190, 90, 0.35, 0.06); }
        else if (kind === 'fire' || kind === 'earth') { noise(c, 0.32, 220, 900, 1.2, 0.14, 'bandpass'); tone(c, 'sine', 110, 55, 0.3, 0.22); }
        else if (kind === 'sonic') tone(c, 'sine', 900, 1650, 0.18, 0.09);
        else [330, 495, 660, 990].forEach((f, i) => tone(c, 'sine', f, f * 1.15, 0.35, 0.06, i * 0.04));
      },
      fire(kind) {
        const c = A(); if (!c) return;
        if (kind === 'beam') { tone(c, 'sine', 180, 48, 0.28, 0.26); [293.66, 440, 880, 1318.5].forEach((f, i) => tone(c, i % 2 ? 'sawtooth' : 'triangle', f, f * 0.94, 0.62, 0.055 / (i * 0.4 + 1))); noise(c, 0.55, 2400, 1400, 1.6, 0.08); }
        else if (kind === 'fire') { tone(c, 'sine', 140, 44, 0.45, 0.25); noise(c, 0.72, 1200, 320, 0.9, 0.2, 'lowpass'); }
        else if (kind === 'sonic') { tone(c, 'triangle', 1400, 540, 0.22, 0.11); tone(c, 'sine', 2100, 980, 0.18, 0.06); }
        else if (kind === 'comet') { tone(c, 'sine', 880, 320, 0.32, 0.11); noise(c, 0.32, 3000, 900, 2.2, 0.07); }
        else if (kind === 'earth') { tone(c, 'sine', 120, 34, 0.38, 0.32); noise(c, 0.35, 650, 140, 0.8, 0.22, 'lowpass'); }
        else if (kind === 'portal') [293.66, 440, 587.33, 739.99, 880].forEach((f, i) => tone(c, i < 2 ? 'triangle' : 'sine', f * 0.98, f, 0.85, 0.065, i * 0.035));
        else if (kind === 'void') { tone(c, 'sine', 160, 38, 0.5, 0.3); tone(c, 'sawtooth', 240, 75, 0.45, 0.08); }
      },
      hit(kind, crit, idx) {
        const c = A(); if (!c) return; idx = idx || 0;
        if (kind === 'crystal' || kind === 'aurora') { const b = crit ? 1174 : 860 + (idx % 5) * 110; tone(c, 'sine', b, b * (crit ? 1.45 : 0.68), crit ? 0.24 : 0.13, crit ? 0.15 : 0.085); if (crit) tone(c, 'triangle', 145, 42, 0.24, 0.22); }
        else if (kind === 'sword') { const b = 760 + (idx % 5) * 115; tone(c, 'triangle', b, b * 0.55, 0.14, 0.09); tone(c, 'sine', b * 2.4, b * 2.3, 0.16, 0.04); tone(c, 'sine', 135, 48, 0.1, 0.13); }
        else if (kind === 'fire' || kind === 'comet') { tone(c, 'sine', crit ? 140 : 115, 36, crit ? 0.34 : 0.16, crit ? 0.28 : 0.16); noise(c, crit ? 0.32 : 0.14, 1800, 260, 1.0, crit ? 0.18 : 0.1, 'lowpass'); }
        else if (kind === 'earth') { tone(c, 'sine', 105, 30, crit ? 0.38 : 0.18, crit ? 0.32 : 0.2); noise(c, 0.18, 900, 180, 0.7, 0.16, 'lowpass'); }
        else if (kind === 'void') { tone(c, 'sine', crit ? 180 : 130, 34, crit ? 0.42 : 0.16, crit ? 0.3 : 0.16); tone(c, 'triangle', 540 + (idx % 4) * 90, 220, 0.16, 0.07); }
        else tone(c, 'triangle', 680 + (idx % 5) * 90, 320, 0.12, 0.09);
      },
      boom(kind) {
        const c = A(); if (!c) return;
        tone(c, 'sine', 155, 30, 0.58, 0.36); noise(c, 0.52, 3200, 280, 0.9, 0.22, 'lowpass');
        if (kind === 'crystal' || kind === 'aurora' || kind === 'astral') [587.33, 880, 1174.66, 1760].forEach((f, i) => tone(c, 'sine', f, f * 1.01, 0.85, 0.08 / (i * 0.4 + 1)));
      }
    };
  }

  /* ---------- peças 3D ---------- */
  function makeSword3D(T) {
    const sw = new T.Group();
    const bM = new T.MeshStandardMaterial({ color: '#c4f2ff', emissive: '#38bdf8', emissiveIntensity: 1.65, roughness: 0.15 });
    const gM = new T.MeshStandardMaterial({ color: '#f0be52', emissive: '#8a5810', emissiveIntensity: 0.45, roughness: 0.25, metalness: 0.9 });
    const blade = new T.Mesh(new T.ConeGeometry(0.16, 1.9, 4), bM); blade.rotation.x = Math.PI; blade.position.y = -0.95; blade.scale.set(1, 1, 0.32); sw.add(blade);
    sw.add(new T.Mesh(new T.BoxGeometry(0.76, 0.12, 0.14), gM));
    [-1, 1].forEach(sd => { const w = new T.Mesh(new T.ConeGeometry(0.1, 0.42, 4), gM); w.position.set(sd * 0.42, 0.1, 0); w.rotation.z = -sd * 0.9; sw.add(w); });
    const hilt = new T.Mesh(new T.CylinderGeometry(0.055, 0.055, 0.42, 8), gM); hilt.position.y = 0.25; sw.add(hilt);
    sw.add(new T.Mesh(new T.OctahedronGeometry(0.11), new T.MeshBasicMaterial({ color: '#ff7ef2' })));
    return sw;
  }

  const active = [];
  function update(dt, root) {
    for (let i = active.length - 1; i >= 0; i--) {
      const f = active[i]; f.life += dt;
      if (f.life >= f.max) { if (f.g.parent) f.g.parent.remove(f.g); f.g.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material && o.material.dispose) o.material.dispose(); }); active.splice(i, 1); }
      else f.step(f.life / f.max, dt, f.life);
    }
  }
  function clear() { while (active.length) { const f = active.pop(); if (f.g.parent) f.g.parent.remove(f.g); } }

  /* ---------- coreografias ---------- */
  function play(host, id, special, ctx) {
    const T = host.T, fx = host.fx, C = CAT[id]; if (!C || !fx) return false;
    const muted = !!(host.muted && host.muted());
    const usedMaster = !muted && !!(window.playLegendarySfx && window.playLegendarySfx(id, !!special, host.audio && host.audio()));
    const NOOP_SFX = { charge() {}, fire() {}, hit() {}, boom() {} };
    const SFX = usedMaster ? NOOP_SFX : mkSfx(host), later = host.later, a = ctx.a, b = ctx.b, g = ctx.g, sky = ctx.sky;
    const V3 = (x, y, z) => new T.Vector3(x, y, z);
    const tp = (i, y) => ctx.tg[i % ctx.tg.length].clone().setY(y);
    const act = (grp, max, step) => { host.root.add(grp); active.push({ g: grp, life: 0, max, step }); };
    const tick = (delay, o) => later(delay, () => { if (o.sfx === 'boom') SFX.boom(id === 'demonio_cinzas' || id === 'colosso_obsidiana' ? 'fire' : 'crystal'); else SFX.hit(o.sfx || 'crystal', !!o.crit, o.idx || 0); if (o.crit) host.shake(0.7); });
    const flash = (col, strong) => host.flash(col, strong);
    const c1 = C.c1, c2 = C.c2, c3 = C.c3;

    if (!special) {
      if (id === 'vigia') {
        SFX.charge('crystal');
        fx.sigil(a.clone().setY(0.1), 'eye', c1, c2, 2.2, 0.9, 0, 1.4); fx.ring(a, c2, 1.1, 0.35, false, 0);
        later(0.22, () => { SFX.fire('beam'); fx.bbBeam(a, b, c1, '#ffffff', { life: 0.72, thick: 0.34 }); fx.bbBeam(a, b, c2, c1, { life: 0.62, thick: 0.16 }); fx.ribbon(a, b, c2, { waves: 6, height: 0.18, spread: 0.42, width: 0.06, life: 0.65 }); });
        [0.28, 0.44, 0.60, 0.76].forEach((tm, idx) => { const fin = idx === 3; later(tm, () => { fx.ring(g, fin ? c2 : c1, fin ? 2.6 : 1.5, 0.45, true); if (fin) fx.bbExplosion(b, c1, c2, { size: 1.9 }); }); tick(tm, { sfx: 'crystal', idx, crit: fin }); });
      } else if (id === 'eclipse') {
        SFX.charge('void'); fx.ring(a, c2, 1.2, 0.4, false);
        for (let i = 0; i < 3; i++) {
          const t = tp(i, 1.2);
          later(0.12 + i * 0.14, () => { SFX.fire('void'); fx.chargedProjectile(a, t, i === 2 ? c2 : c1, { duration: 0.36, arc: 0.25 + i * 0.15, size: 0.26 }); });
          later(0.48 + i * 0.14, () => fx.bbExplosion(t, c1, c2, { size: i === 2 ? 2.1 : 1.4 }));
          tick(0.48 + i * 0.14, { sfx: 'void', idx: i, crit: i === 2 });
        }
      } else if (id === 'morcego') {
        SFX.fire('sonic'); fx.sigRun('morcego', false, a, b, c1, c2, null);
        [0.24, 0.42, 0.62].forEach((tm, idx) => { const fin = idx === 2; later(tm, () => fx.bbSlash(b, c1, c2, { size: fin ? 3.2 : 2.2, angle: idx * 0.9 })); tick(tm, { sfx: 'crystal', idx, crit: fin }); });
      } else if (id === 'hamster') {
        for (let i = 0; i < 3; i++) {
          const t = tp(i, 0.4);
          later(i * 0.18, () => { SFX.fire('comet'); fx.meteorBomb(a, t, i === 2 ? c2 : c1, 0, 1.05); });
          tick(0.88 + i * 0.18, { sfx: 'comet', idx: i, crit: i === 2 });
        }
      } else if (id === 'demonio_cinzas') {
        SFX.fire('fire'); fx.flameTail(a, b, c1, 0.78, 0.15, 1.45); fx.ribbon(a, b, c2, { waves: 5, height: 0.2, spread: 0.55, width: 0.11, life: 0.75 });
        [0.22, 0.38, 0.54, 0.70].forEach((tm, idx) => { const fin = idx === 3; later(tm, () => fx.geyser(g.clone().add(V3((idx - 1.5) * 0.7, 0, 0)), c1, c2, fin ? 2.8 : 1.7)); tick(tm, { sfx: 'fire', idx, crit: fin }); });
      } else if (id === 'colosso_obsidiana') {
        SFX.fire('earth');
        const grp = new T.Group();
        const obsMat = new T.MeshStandardMaterial({ color: '#141824', emissive: '#7c2d12', emissiveIntensity: 0.65, roughness: 0.35, metalness: 0.72 });
        const lavaMat = new T.MeshBasicMaterial({ color: '#ff7b24', transparent: true, opacity: 0.92 });
        const spikes = [];
        for (let i = 0; i < 4; i++) {
          const px = V3(b.x - 2.5 + i * 1.65, 0, b.z + (i % 2 ? 0.38 : -0.38));
          const sg = new T.Group(); sg.position.set(px.x, -2.4, px.z); grp.add(sg);
          const m1 = new T.Mesh(new T.ConeGeometry(0.42 + i * 0.06, 2.3 + i * 0.35, 5), obsMat); m1.position.y = 1.15; m1.rotation.z = -0.18; sg.add(m1);
          const m2 = new T.Mesh(new T.ConeGeometry(0.24, 1.4, 5), obsMat); m2.position.set(-0.28, 0.65, 0.18); m2.rotation.z = 0.35; sg.add(m2);
          const vn = new T.Mesh(new T.ConeGeometry(0.16, 2.45 + i * 0.35, 4), lavaMat); vn.position.y = 1.18; vn.rotation.z = -0.18; sg.add(vn);
          spikes.push({ sg, at: 0.14 + i * 0.13 });
          later(0.14 + i * 0.13, () => { const q = px.clone().setY(0.12); fx.sigCrack(q, i * 1.1, 2.6, '#ff6a1f', 0); fx.geyser(q, '#ff4a14', '#ffd066', 1.7 + i * 0.25, 0); fx.ring(q, '#ff7b24', 1.8 + i * 0.25, 0.5, true); if (i === 3) fx.bbExplosion(q.clone().setY(0.8), '#ff4a14', '#ffd066', { size: 2.1 }); });
          tick(0.18 + i * 0.13, { sfx: 'earth', idx: i, crit: i === 3 });
        }
        act(grp, 1.45, (u, dt, life) => spikes.forEach(s => { if (life < s.at) return; const rise = Math.min(1, (life - s.at) / 0.14), sink = life > 1.05 ? (life - 1.05) / 0.4 : 0; s.sg.position.y = -2.4 + rise * 2.4 - sink * 2.6; }));
      } else if (id === 'arquimago_astral') {
        SFX.charge('astral'); fx.sigRun('arquimago_astral', false, a, b, c1, c2, null);
        [0.32, 0.52, 0.72].forEach((tm, idx) => { const fin = idx === 2; later(tm, () => { fx.bbZap(a, b, c1, c2); if (fin) fx.bbExplosion(b, c1, c2, { size: 1.9 }); }); tick(tm, { sfx: 'crystal', idx, crit: fin }); });
      }
      return true;
    }

    /* ---------- especiais ---------- */
    host.dim(1.95, id === 'demonio_cinzas' ? '#1c0402' : (id === 'eclipse' ? '#04000c' : '#03020c'));
    if (id === 'vigia') {
      SFX.fire('portal');
      const grp = new T.Group(), halo = new T.Group(); halo.position.set(b.x, 7.2, b.z); grp.add(halo);
      const sh1 = new T.Mesh(new T.TorusGeometry(2.9, 0.08, 8, 48), new T.MeshBasicMaterial({ color: c3, transparent: true })); sh1.rotation.x = Math.PI / 2; halo.add(sh1);
      const sh2 = new T.Mesh(new T.TorusGeometry(2.0, 0.055, 8, 36), new T.MeshBasicMaterial({ color: c1, transparent: true })); sh2.rotation.x = Math.PI / 2; halo.add(sh2);
      const swords = [];
      for (let i = 0; i < 12; i++) {
        const ang = (i / 12) * Math.PI * 2, sw = makeSword3D(T), tx = b.x + Math.cos(ang) * 1.9, tz = b.z + Math.sin(ang) * 1.55;
        sw.position.set(tx, 7.2, tz); sw.scale.setScalar(0.01); grp.add(sw);
        swords.push({ sw, start: V3(tx, 7.2, tz), end: V3(tx, 0.9, tz), at: 0.52 + i * 0.045, hit: false });
      }
      act(grp, 2.2, (u, dt, life) => {
        sh1.rotation.z += dt * 1.8; sh2.rotation.z -= dt * 2.8;
        const ha = life < 0.3 ? life / 0.3 : (life > 1.6 ? Math.max(0, 1 - (life - 1.6) / 0.5) : 1); sh1.material.opacity = ha * 0.95; sh2.material.opacity = ha * 0.9;
        swords.forEach((s, idx) => {
          if (life < s.at) { s.sw.scale.setScalar(0.01 + Math.min(1, life / 0.42) * 0.95); s.sw.rotation.y += dt * 3; }
          else if (!s.hit) { const fu = Math.min(1, (life - s.at) / 0.13); s.sw.position.lerpVectors(s.start, s.end, fu * fu); if (fu >= 1) { s.hit = true; if (idx % 3 === 0) SFX.hit('sword', false, idx); } }
          else if (life > 1.65) s.sw.visible = false;
        });
      });
      tick(0.18, { sfx: 'crystal', idx: 0 });
      later(0.58, () => { SFX.fire('beam'); fx.bbExplosion(g, c1, '#ffffff', { size: 3.4 }); [-1.8, 1.8].forEach(oz => fx.bbBeam(V3(b.x, 7.2, b.z + oz), g, c2, '#ffffff', { life: 0.75, thick: 0.24 })); flash(c1, false); });
      tick(0.60, { sfx: 'crystal', idx: 1 }); tick(0.88, { sfx: 'crystal', idx: 2 });
      later(1.18, () => { fx.bbExplosion(b, c2, '#ffffff', { size: 3.8 }); flash('#ffffff', true); }); tick(1.18, { sfx: 'boom', crit: true });
    } else if (id === 'eclipse') {
      SFX.fire('void');
      [0.45, 0.78, 1.10].forEach((tm, idx) => { later(tm, () => { for (let i = 0; i < 3; i++) fx.bbZap(tp(i, 1.3), V3(b.x, 4.1, b.z), c2, c1); flash(c1, false); }); tick(tm, { sfx: 'void', idx }); });
      later(1.48, () => { fx.bbExplosion(b, c2, c1, { size: 4.0 }); fx.ring(g, c2, 4.8, 0.9, true); fx.ring(g, c1, 5.6, 1.0, true, 0.08); flash(c2, true); }); tick(1.48, { sfx: 'boom', crit: true });
    } else if (id === 'morcego') {
      SFX.fire('sonic');
      const grp = new T.Group(), moon = new T.Mesh(new T.CircleGeometry(2.6, 36), new T.MeshBasicMaterial({ color: c3, transparent: true, opacity: 0 }));
      moon.position.set(b.x - 1.6, 4.6, b.z - 4.5); grp.add(moon);
      act(grp, 1.9, u => { moon.material.opacity = Math.sin(u * Math.PI) * 0.55; moon.scale.setScalar(0.8 + u * 0.35); });
      [0.32, 0.50, 0.68, 0.86, 1.04].forEach((tm, idx) => { const t = tp(idx, 1.2); later(tm, () => fx.bbCross(t, c1, c3, { size: 3.4 })); tick(tm, { sfx: 'crystal', idx }); });
      later(1.38, () => { fx.bbExplosion(b, c3, c1, { size: 3.6 }); flash(c3, true); }); tick(1.38, { sfx: 'boom', crit: true });
    } else if (id === 'hamster') {
      SFX.fire('comet');
      /* 🥜 Amendoim Gigante 3D caindo do céu no especial do Hamster! */
      let peanutTex = window._warPeanutTex;
      if (!peanutTex) {
        const cv = document.createElement('canvas'); cv.width = 128; cv.height = 128;
        const g2 = cv.getContext('2d');
        g2.fillStyle = '#d6a15c'; g2.fillRect(0, 0, 128, 128);
        g2.strokeStyle = '#9c682b'; g2.lineWidth = 3;
        for (let y = 8; y < 128; y += 16) { g2.beginPath(); g2.moveTo(0, y); g2.lineTo(128, y + 6); g2.stroke(); }
        for (let x = 8; x < 128; x += 16) { g2.beginPath(); g2.moveTo(x, 0); g2.lineTo(x + 4, 128); g2.stroke(); }
        g2.fillStyle = 'rgba(255,232,185,0.22)';
        for (let i = 0; i < 40; i++) g2.fillRect((i * 37) % 120, (i * 53) % 120, 6, 4);
        peanutTex = new T.CanvasTexture(cv);
        peanutTex.wrapS = peanutTex.wrapT = T.RepeatWrapping;
        window._warPeanutTex = peanutTex;
      }
      const makePeanut = (sc) => {
        const pg = new T.Group();
        const mat = new T.MeshStandardMaterial({ map: peanutTex, color: '#e4b36d', emissive: '#ff7b1c', emissiveIntensity: 0.45, roughness: 0.72, metalness: 0.06 });
        const topLobe = new T.Mesh(new T.SphereGeometry(0.62, 16, 12), mat); topLobe.position.y = 0.48; topLobe.scale.set(0.95, 1.05, 0.95); pg.add(topLobe);
        const botLobe = new T.Mesh(new T.SphereGeometry(0.68, 16, 12), mat); botLobe.position.y = -0.46; botLobe.scale.set(1.0, 1.06, 1.0); pg.add(botLobe);
        const waist = new T.Mesh(new T.CylinderGeometry(0.46, 0.50, 0.55, 14), mat); pg.add(waist);
        const aura = new T.Mesh(new T.SphereGeometry(0.92, 12, 10), new T.MeshBasicMaterial({ color: '#ffae38', transparent: true, opacity: 0.34, blending: T.AdditiveBlending, depthWrite: false })); aura.scale.set(1, 1.38, 1); pg.add(aura);
        pg.scale.setScalar(sc);
        return pg;
      };
      const grp = new T.Group();
      const minis = [];
      for (let i = 0; i < 4; i++) {
        const t = tp(i, 0.35); t.x += ((i % 3) - 1) * 0.45;
        const p = makePeanut(0.68); p.visible = false; grp.add(p);
        minis.push({ p, to: t, t0: 0.14 + i * 0.22, dur: 0.52, done: false });
        tick(0.66 + i * 0.22, { sfx: 'comet', idx: i });
      }
      const giant = makePeanut(2.15); giant.visible = false; grp.add(giant);
      act(grp, 1.95, (u, dt, life) => {
        minis.forEach(m => {
          if (life >= m.t0 && life < m.t0 + m.dur) {
            m.p.visible = true;
            const k = (life - m.t0) / m.dur;
            m.p.position.set(m.to.x - 2.4 * (1 - k), 9.2 * (1 - k * k) + 0.35, m.to.z);
            m.p.rotation.x += dt * 7; m.p.rotation.z += dt * 5;
          } else {
            if (m.p.visible && !m.done) { m.done = true; fx.bbExplosion(m.to, c1, c3, { size: 1.8 }); fx.ring(m.to, '#ffae38', 1.8, 0.45, true); }
            m.p.visible = false;
          }
        });
        if (life >= 0.85 && life < 1.64) {
          giant.visible = true;
          const k = (life - 0.85) / 0.79;
          giant.position.set(b.x - 2.8 * (1 - k), 11.8 * (1 - k * k) + 0.45, b.z);
          giant.rotation.x += dt * 4.5; giant.rotation.z += dt * 3.2;
        } else giant.visible = false;
      });
      later(1.62, () => { fx.bbExplosion(b, c3, c1, { size: 4.2 }); fx.ring(g, '#ffae38', 5.2, 0.85, true); flash(c3, true); }); tick(1.62, { sfx: 'boom', crit: true });
    } else if (id === 'demonio_cinzas') {
      SFX.charge('fire');
      const R = 2.55;
      for (let k = 0; k < 5; k++) { const an = -Math.PI / 2 + k * Math.PI * 2 / 5, vp = V3(g.x + Math.cos(an) * R, 0.2, g.z + Math.sin(an) * R * 0.8); later(0.55 + k * 0.12, () => fx.bbZap(a, vp, '#ffd08a', '#ff3b14')); tick(0.60 + k * 0.12, { sfx: 'fire', idx: k }); }
      const grp = new T.Group(), met = new T.Mesh(new T.DodecahedronGeometry(1.35, 1), new T.MeshStandardMaterial({ color: '#2a0602', emissive: '#ff4500', emissiveIntensity: 2.2 }));
      met.position.set(g.x, 9.5, g.z); met.visible = false; grp.add(met);
      act(grp, 1.5, (u, dt, life) => { if (life >= 0.95 && life < 1.4) { met.visible = true; const mu = (life - 0.95) / 0.45; met.position.set(g.x - 2.6 + mu * 2.6, 9.5 - mu * 9.3, g.z); met.rotation.x += dt * 7; met.rotation.z += dt * 5; } else met.visible = false; });
      later(1.40, () => { fx.bbExplosion(g, '#ff3b14', '#ffd08a', { size: 4.4 }); fx.bbZap(sky, g, '#ffd08a', '#ff3b14'); flash('#ff7b24', true); }); tick(1.40, { sfx: 'boom', crit: true });
    } else if (id === 'colosso_obsidiana') {
      SFX.charge('earth');
      const grp = new T.Group(), obsMat = new T.MeshStandardMaterial({ color: '#141926', emissive: '#9a3412', emissiveIntensity: 0.85, roughness: 0.32, metalness: 0.78 }), veinMat = new T.MeshBasicMaterial({ color: '#ff7b24' });
      const ringSpikes = [];
      for (let i = 0; i < 8; i++) {
        const an = (i / 8) * Math.PI * 2, sg = new T.Group();
        sg.position.set(g.x + Math.cos(an) * 2.35, -3.2, g.z + Math.sin(an) * 1.85); sg.rotation.z = Math.cos(an) * 0.28; sg.rotation.x = -Math.sin(an) * 0.28;
        const cone = new T.Mesh(new T.ConeGeometry(0.46, 3.2, 5), obsMat); cone.position.y = 1.6; sg.add(cone);
        const vein = new T.Mesh(new T.ConeGeometry(0.18, 3.3, 4), veinMat); vein.position.y = 1.62; sg.add(vein);
        grp.add(sg); ringSpikes.push(sg);
      }
      act(grp, 2.3, (u, dt, life) => { if (life >= 1.32) { const rise = Math.min(1, (life - 1.32) / 0.16), sink = life > 1.9 ? (life - 1.9) / 0.4 : 0; ringSpikes.forEach(sg => { sg.position.y = -3.2 + rise * 3.2 - sink * 3.4; }); } });
      for (let k = 0; k < 5; k++) { const t = tp(k, 0.14); later(0.45 + k * 0.18, () => { fx.geyser(t, '#ff4a14', '#ffd066', 2.6, 0); fx.ring(t, '#ff7b24', 2.4, 0.55, true); fx.sigCrack(t, k * 1.25, 3.2, '#ff6a1f', 0); flash('#ff6a1f', false); }); tick(0.45 + k * 0.18, { sfx: 'earth', idx: k }); }
      later(1.42, () => { fx.bbExplosion(g, '#ff4500', '#ffe066', { size: 4.3 }); fx.geyser(g, '#ff3b14', '#ffe066', 5.8, 0); for (let j = 0; j < 6; j++) fx.sigCrack(g, (j / 6) * Math.PI * 2, 4.2, '#ff8828', 0); fx.ring(g, '#ffe066', 5.2, 0.85, true); flash('#ff8828', true); }); tick(1.42, { sfx: 'boom', crit: true });
    } else if (id === 'arquimago_astral') {
      SFX.fire('portal');
      const grp = new T.Group(), orr = new T.Group(); orr.position.set(b.x, 6.2, b.z); grp.add(orr);
      [1.4, 2.3, 3.2].forEach((r, i) => {
        const rg = new T.Mesh(new T.TorusGeometry(r, 0.055, 8, 42), new T.MeshBasicMaterial({ color: c2, transparent: true })); rg.rotation.x = Math.PI / 2; orr.add(rg);
        const pl = new T.Mesh(new T.SphereGeometry(0.24 + i * 0.06, 12, 10), new T.MeshBasicMaterial({ color: i === 1 ? c2 : c3 })); pl.position.set(r, 0, 0); orr.add(pl);
      });
      act(grp, 2.15, (u, dt) => { orr.rotation.y += dt * 3.8; orr.scale.setScalar(u < 0.2 ? u * 5 : (u > 0.8 ? (1 - u) * 5 : 1)); });
      [0.45, 0.78, 1.12].forEach((tm, idx) => { later(tm, () => { fx.bbZap(V3(b.x, 6.2, b.z), g, c2, c1); flash(c1, false); }); tick(tm, { sfx: 'crystal', idx }); });
      later(1.48, () => { fx.bbBeam(sky, g, c2, '#ffffff', { life: 0.95, thick: 0.82 }); fx.bbExplosion(g, c2, '#ffffff', { size: 4.0 }); flash(c2, true); }); tick(1.48, { sfx: 'boom', crit: true });
    }
    return true;
  }

  window.LegendaryFX = { has: id => !!CAT[id], play, update, clear, HIT };
})();
