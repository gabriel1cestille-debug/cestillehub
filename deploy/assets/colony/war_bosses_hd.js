/* Chefes 45-60 em alta qualidade, 100% por código (sem modelo 3D pronto).
   Escorpião, Aranha Rainha e Autômato: proposta do Gemini; Olho do Cosmos: Claude.
   Uso: WarBossesHD.build('escorpiao'|'aranha'|'automato'|'olho', THREE) -> { g, step(t, dt) }. Frente do chefe = -X. */
(function () {
  let T = null;
  function makeTex(w, h, fn, rep) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const x = c.getContext('2d');
    fn(x, w, h);
    const t = new T.CanvasTexture(c);
    if (T.sRGBEncoding) t.encoding = T.sRGBEncoding;
    t.wrapS = t.wrapT = T.RepeatWrapping;
    if (rep) t.repeat.set(rep[0], rep[1]);
    return t;
  }
  function makeBump(w, h, fn, rep) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const x = c.getContext('2d');
    fn(x, w, h);
    const t = new T.CanvasTexture(c);
    t.wrapS = t.wrapT = T.RepeatWrapping;
    if (rep) t.repeat.set(rep[0], rep[1]);
    return t;
  }
  function makeRng(seed) {
    let a = seed >>> 0;
    return () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; };
  }

  /* ---- escorpiao ---- */
  function buildEscorpiao() {
    const g = new T.Group(), A = [];
    const rnd = makeRng(88421);
    const M = o => new T.MeshStandardMaterial(o);
    const glow = (c, i) => M({ color: c, emissive: c, emissiveIntensity: i == null ? 1.7 : i, roughness: 0.22, metalness: 0.1 });
    const add = (geo, m, x, y, z, par) => {
      const o = new T.Mesh(geo, m);
      o.position.set(x, y, z);
      o.castShadow = true; o.receiveShadow = true;
      (par || g).add(o);
      return o;
    };
    const pivot = (x, y, z, par) => { const o = new T.Group(); o.position.set(x, y, z); (par || g).add(o); return o; };

    // Texturas procedurais + Bump Map de quitina blindada
    const chitinBump = makeBump(256, 256, (x, w, h) => {
      x.fillStyle = '#787878'; x.fillRect(0, 0, w, h);
      for (let i = 0; i < 16; i++) {
        const y0 = i * 16;
        x.strokeStyle = '#303030'; x.lineWidth = 3;
        x.beginPath(); x.moveTo(0, y0); x.quadraticCurveTo(w / 2, y0 + 8, w, y0); x.stroke();
        x.strokeStyle = '#b8b8b8'; x.lineWidth = 1.5;
        x.beginPath(); x.moveTo(0, y0 + 3); x.quadraticCurveTo(w / 2, y0 + 11, w, y0 + 3); x.stroke();
      }
      for (let i = 0; i < 650; i++) {
        x.fillStyle = rnd() > 0.5 ? 'rgba(220,220,220,.16)' : 'rgba(20,20,20,.22)';
        x.beginPath(); x.arc(rnd() * w, rnd() * h, 1 + rnd() * 2.6, 0, 6.28); x.fill();
      }
    });

    const chitinTex = makeTex(256, 256, (x, w, h) => {
      const gr = x.createLinearGradient(0, 0, 0, h);
      gr.addColorStop(0, '#963b14'); gr.addColorStop(0.45, '#5a1e0a'); gr.addColorStop(1, '#260b04');
      x.fillStyle = gr; x.fillRect(0, 0, w, h);
      for (let i = 0; i < 16; i++) {
        const y0 = i * 16;
        x.strokeStyle = 'rgba(18,5,0,.62)'; x.lineWidth = 3;
        x.beginPath(); x.moveTo(0, y0); x.quadraticCurveTo(w / 2, y0 + 8, w, y0); x.stroke();
        x.strokeStyle = 'rgba(240,165,80,.18)'; x.lineWidth = 1.2;
        x.beginPath(); x.moveTo(0, y0 + 3); x.quadraticCurveTo(w / 2, y0 + 11, w, y0 + 3); x.stroke();
      }
      for (let i = 0; i < 700; i++) {
        x.fillStyle = rnd() > 0.5 ? 'rgba(255,180,95,.11)' : 'rgba(10,3,0,.22)';
        x.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 4, 1 + rnd() * 3);
      }
    });

    const chitin = M({ map: chitinTex, bumpMap: chitinBump, bumpScale: 0.04, roughness: 0.34, metalness: 0.36 });
    const chitinDark = M({ color: '#240c06', bumpMap: chitinBump, bumpScale: 0.025, roughness: 0.42, metalness: 0.4 });
    const chitinGold = M({ color: '#cf8b32', roughness: 0.36, metalness: 0.55 });
    const jointMat = M({ color: '#170804', roughness: 0.65, metalness: 0.2 });
    const venom = glow('#8cff32', 1.9);
    const venomHot = glow('#eaffad', 2.4);
    const venomSac = M({ color: '#5be61a', emissive: '#6aff1f', emissiveIntensity: 1.15, roughness: 0.18, metalness: 0.08, transparent: true, opacity: 0.88 });

    const body = pivot(0, 0.96, 0);

    // -----------------------------------------------------------------------
    // 1. CEFALOTÓRAX & CARAPAÇA EM PLACAS SOBREPOSTAS + FISSURAS DE VENENO
    // -----------------------------------------------------------------------
    // Ventre / esterno estrutural escuro
    const belly = add(new T.SphereGeometry(0.92, 18, 12), chitinDark, 0.2, -0.14, 0, body);
    belly.scale.set(1.65, 0.46, 0.88);

    // Escudo frontal do cefalotórax (carapaça principal facetada + crista central)
    const shield = add(new T.SphereGeometry(0.95, 22, 14, 0, Math.PI * 2, 0, Math.PI * 0.58), chitin, -0.42, -0.05, 0, body);
    shield.scale.set(1.22, 0.68, 1.05);
    // Crista dorsal dupla na carapaça
    [-1, 1].forEach(sd => {
      const ridge = add(new T.BoxGeometry(1.18, 0.14, 0.12), chitinGold, -0.45, 0.52, sd * 0.24, body);
      ridge.rotation.y = sd * 0.12;
      // Espinhos laterais do escudo
      for (let k = 0; k < 3; k++) {
        const sp = add(new T.ConeGeometry(0.08, 0.32, 6), chitinGold, -0.82 + k * 0.42, 0.22, sd * (0.86 + k * 0.04), body);
        sp.rotation.x = sd * 1.05; sp.rotation.z = -0.35;
      }
    });

    // 5 Placas tergais (segmentos do dorso) sobrepostas com brilho tóxico nas junções
    const backVents = [];
    for (let i = 0; i < 5; i++) {
      const sx = 0.52 + i * 0.44;
      const wScale = 1.0 - i * 0.11;
      const hScale = 0.62 - i * 0.05;
      // Junção brilhante de veneno por baixo de cada placa
      const glowRing = add(new T.TorusGeometry(0.56 * wScale, 0.048, 8, 18), venom, sx - 0.18, 0.02 - i * 0.015, 0, body);
      glowRing.rotation.y = Math.PI / 2;
      glowRing.scale.set(1.0, 0.65, 1.0);
      backVents.push(glowRing);

      // Placa dorsal em arco (tergito)
      const plate = add(new T.SphereGeometry(0.76 * wScale, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.56), chitin, sx, -0.05 - i * 0.015, 0, body);
      plate.scale.set(0.68, hScale * 1.15, 1.14);
      // Borda dourada + espinho central em cada placa
      const spine = add(new T.ConeGeometry(0.085 * wScale, 0.34, 6), chitinGold, sx + 0.06, 0.48 * wScale + 0.04, 0, body);
      spine.rotation.z = -0.45;
      [-1, 1].forEach(sd => {
        const lsp = add(new T.ConeGeometry(0.065 * wScale, 0.26, 6), chitinDark, sx, 0.16, sd * (0.78 * wScale), body);
        lsp.rotation.x = sd * 1.15; lsp.rotation.z = -0.4;
      });
    }

    // -----------------------------------------------------------------------
    // 2. CABEÇA, VISEIRA, 6 OLHOS TÓXICOS & QUELÍCERAS ARTICULADAS
    // -----------------------------------------------------------------------
    const head = pivot(-1.32, 0.04, 0, body);
    const brow = add(new T.SphereGeometry(0.46, 16, 12), chitinDark, 0.04, 0.04, 0, head);
    brow.scale.set(1.05, 0.72, 1.18);
    // Placa frontal com chifres curtos sobre os olhos
    [-1, 1].forEach(sd => {
      const horn = add(new T.ConeGeometry(0.075, 0.34, 6), chitinGold, -0.22, 0.28, sd * 0.28, head);
      horn.rotation.z = 1.15; horn.rotation.y = sd * 0.25;
    });
    // 6 olhos brilhantes (2 principais frontais + 4 laterais)
    [
      [-0.38, 0.16, -0.16, 0.075], [-0.38, 0.16, 0.16, 0.075],
      [-0.28, 0.12, -0.32, 0.048], [-0.28, 0.12, 0.32, 0.048],
      [-0.16, 0.10, -0.40, 0.038], [-0.16, 0.10, 0.40, 0.038]
    ].forEach(([ex, ey, ez, er]) => {
      add(new T.SphereGeometry(er, 8, 6), venomHot, ex, ey, ez, head);
    });

    // Quelíceras (mandíbulas duplas animadas)
    const jaws = [];
    [-1, 1].forEach(sd => {
      const jp = pivot(-0.34, -0.1, sd * 0.18, head);
      add(new T.CylinderGeometry(0.09, 0.12, 0.36, 8), chitin, -0.14, -0.02, 0, jp).rotation.z = Math.PI / 2;
      const fang = add(new T.ConeGeometry(0.075, 0.34, 7), chitinGold, -0.36, -0.05, -sd * 0.06, jp);
      fang.rotation.z = Math.PI / 2 + 0.25; fang.rotation.y = -sd * 0.45;
      jaws.push({ jp, sd });
    });

    // -----------------------------------------------------------------------
    // 3. PINÇAS COLOSSAIS ARTICULADAS & SERRILHADAS (PEDIPALPOS)
    // -----------------------------------------------------------------------
    const claws = [];
    [-1, 1].forEach(sd => {
      const sh = pivot(-0.98, 0.02, sd * 0.86, body);
      sh.rotation.y = sd * 0.48;
      add(new T.SphereGeometry(0.24, 10, 8), jointMat, 0, 0, 0, sh);

      // Braço (úmero) blindado com espinhos
      const upper = add(new T.CylinderGeometry(0.18, 0.22, 0.92, 10), chitin, -0.46, 0.02, 0, sh);
      upper.rotation.z = Math.PI / 2;
      for (let s = 0; s < 3; s++) {
        const sp = add(new T.ConeGeometry(0.055, 0.22, 6), chitinGold, -0.22 - s * 0.24, 0.18, sd * 0.12, sh);
        sp.rotation.z = 0.4; sp.rotation.x = sd * 0.4;
      }

      // Cotovelo + antebraço curvado para dentro (abraçando a frente)
      const el = pivot(-0.92, 0.02, 0, sh);
      el.rotation.y = -sd * 0.62;
      add(new T.SphereGeometry(0.22, 10, 8), jointMat, 0, 0, 0, el);
      const fore = add(new T.CylinderGeometry(0.22, 0.18, 0.88, 10), chitinDark, -0.42, 0, 0, el);
      fore.rotation.z = Math.PI / 2;
      add(new T.BoxGeometry(0.68, 0.09, 0.1), chitinGold, -0.42, 0.19, 0, el);

      // Mão da Pinça (Quela) massiva e esculpida
      const hand = pivot(-0.88, 0, 0, el);
      hand.rotation.y = -sd * 0.34;
      const palm = add(new T.SphereGeometry(0.38, 16, 12), chitin, -0.34, 0.02, 0, hand);
      palm.scale.set(1.38, 0.82, 0.96);
      // Veia/fenda de veneno brilhando na palma da pinça
      add(new T.BoxGeometry(0.54, 0.07, 0.08), venom, -0.36, 0.28, 0, hand);
      // Espinhos dorsais na palma
      for (let s = 0; s < 3; s++) {
        const ps = add(new T.ConeGeometry(0.06, 0.24, 6), chitinGold, -0.18 - s * 0.22, 0.24, sd * 0.24, hand);
        ps.rotation.x = sd * 0.7;
      }

      // Dedo fixo superior (curvo + 4 dentes serrilhados)
      const upperJaw = pivot(-0.76, 0.08, 0, hand);
      const uCurve = new T.CatmullRomCurve3([
        new T.Vector3(0, 0.02, 0),
        new T.Vector3(-0.42, 0.14, -sd * 0.06),
        new T.Vector3(-0.82, 0.08, -sd * 0.16),
        new T.Vector3(-1.08, -0.08, -sd * 0.24)
      ]);
      add(new T.TubeGeometry(uCurve, 14, 0.115, 8, false), chitin, 0, 0, 0, upperJaw);
      const uTip = add(new T.ConeGeometry(0.11, 0.34, 8), chitinGold, -1.16, -0.14, -sd * 0.26, upperJaw);
      uTip.rotation.z = Math.PI / 2 + 0.55; uTip.rotation.y = -sd * 0.3;
      for (let d = 0; d < 4; d++) {
        const dt = add(new T.ConeGeometry(0.048, 0.15, 5), chitinGold, -0.22 - d * 0.21, -0.02, -sd * (0.04 + d * 0.04), upperJaw);
        dt.rotation.z = Math.PI;
      }

      // Dedo móvel inferior (articulado, abre e fecha com 3 dentes)
      const lowerJaw = pivot(-0.72, -0.12, 0, hand);
      const lCurve = new T.CatmullRomCurve3([
        new T.Vector3(0, 0, 0),
        new T.Vector3(-0.36, -0.1, -sd * 0.05),
        new T.Vector3(-0.72, -0.06, -sd * 0.14),
        new T.Vector3(-0.96, 0.06, -sd * 0.22)
      ]);
      add(new T.TubeGeometry(lCurve, 12, 0.095, 8, false), chitinDark, 0, 0, 0, lowerJaw);
      const lTip = add(new T.ConeGeometry(0.095, 0.28, 8), chitinGold, -1.03, 0.11, -sd * 0.24, lowerJaw);
      lTip.rotation.z = Math.PI / 2 - 0.55; lTip.rotation.y = -sd * 0.3;
      for (let d = 0; d < 3; d++) {
        add(new T.ConeGeometry(0.042, 0.13, 5), chitinGold, -0.24 - d * 0.22, 0.02, -sd * (0.04 + d * 0.04), lowerJaw);
      }

      claws.push({ sh, el, lowerJaw, sd });
    });

    // -----------------------------------------------------------------------
    // 4. 8 PERNAS DE ARACNÍDEO EM 3 SEGMENTOS (TOCAM O CHÃO COM GARRAS)
    // -----------------------------------------------------------------------
    const legs = [];
    for (let i = 0; i < 4; i++) {
      [-1, 1].forEach(sd => {
        const hip = pivot(-0.52 + i * 0.48, -0.12, sd * 0.62, body);
        hip.rotation.y = sd * (-0.32 + i * 0.26);
        add(new T.SphereGeometry(0.13, 8, 6), jointMat, 0, 0, 0, hip);

        // Fêmur (sobe levemente para fora)
        const femur = add(new T.CylinderGeometry(0.095, 0.12, 0.78, 8), chitin, 0, 0.18, sd * 0.34, hip);
        femur.rotation.x = sd * 1.12;
        add(new T.ConeGeometry(0.045, 0.18, 5), chitinGold, 0, 0.38, sd * 0.44, hip);

        // Joelho + Tíbia (desce inclinada)
        const knee = pivot(0, 0.34, sd * 0.68, hip);
        add(new T.SphereGeometry(0.11, 8, 6), jointMat, 0, 0, 0, knee);
        const tibia = add(new T.CylinderGeometry(0.065, 0.095, 0.88, 8), chitinDark, 0, -0.34, sd * 0.26, knee);
        tibia.rotation.x = -sd * 0.58;

        // Tarso + garra no chão
        const ankle = pivot(0, -0.72, sd * 0.52, knee);
        const claw = add(new T.ConeGeometry(0.06, 0.54, 7), chitinGold, 0, -0.22, sd * 0.1, ankle);
        claw.rotation.z = Math.PI;
        claw.rotation.x = sd * 0.38;

        legs.push({ hip, knee, ph: i * 1.15 + (sd > 0 ? Math.PI : 0), sd });
      });
    }

    // -----------------------------------------------------------------------
    // 5. CAUDA SEGMENTADA EM ARCO + AMPOLA DE VENENO & FERRÃO CURVO
    // -----------------------------------------------------------------------
    const tailSegs = [];
    const N = 7;
    for (let i = 0; i < N; i++) {
      const seg = pivot(0, 0, 0, body);
      const r = 0.34 - i * 0.028;
      // Corpo do segmento blindado (octogonal)
      const cyl = add(new T.CylinderGeometry(r * 0.88, r, 0.54, 8), i % 2 ? chitinDark : chitin, 0, 0, 0, seg);
      cyl.rotation.z = Math.PI / 2;
      // Anel de articulação luminoso
      add(new T.TorusGeometry(r * 0.86, 0.036, 8, 16), venom, -0.24, 0, 0, seg).rotation.y = Math.PI / 2;
      // Crista/espinhos duplos no topo de cada segmento da cauda
      [-1, 1].forEach(sd => {
        const sp = add(new T.ConeGeometry(0.055, 0.24, 6), chitinGold, 0.04, r + 0.06, sd * (r * 0.55), seg);
        sp.rotation.z = -0.35; sp.rotation.x = sd * 0.35;
      });
      tailSegs.push(seg);
    }

    // Télson (Vesícula de veneno pulsante) + Ferrão curvo letal
    const telson = pivot(0, 0, 0, body);
    // Bolsa translúcida/brilhante de veneno
    const sac = add(new T.SphereGeometry(0.32, 18, 14), venomSac, 0, 0, 0, telson);
    sac.scale.set(1.25, 0.95, 0.95);
    add(new T.SphereGeometry(0.18, 12, 10), venomHot, -0.06, 0, 0, telson);
    // Casca de quitina abraçando o topo da vesícula
    const cap = add(new T.SphereGeometry(0.34, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), chitinDark, 0.02, 0.04, 0, telson);
    cap.scale.set(1.22, 0.96, 0.98);
    // Ferrão curvo longo (TubeGeometry + ponta afiada brilhante)
    const stCurve = new T.CatmullRomCurve3([
      new T.Vector3(-0.32, 0.02, 0),
      new T.Vector3(-0.62, 0.0, 0),
      new T.Vector3(-0.84, -0.18, 0),
      new T.Vector3(-0.92, -0.44, 0)
    ]);
    add(new T.TubeGeometry(stCurve, 14, 0.075, 8, false), chitinDark, 0, 0, 0, telson);
    const stTip = add(new T.ConeGeometry(0.08, 0.42, 8), venomHot, -0.92, -0.62, 0, telson);
    stTip.rotation.z = Math.PI - 0.18;

    // 2 Gotas de veneno pingando em ciclo contínuo
    const drops = [
      add(new T.SphereGeometry(0.075, 8, 6), venomHot, 0, 0, 0, body),
      add(new T.SphereGeometry(0.06, 8, 6), venom, 0, 0, 0, body)
    ];

    // -----------------------------------------------------------------------
    // 6. ANIMAÇÃO ORGÂNICA COMPLETA
    // -----------------------------------------------------------------------
    A.push((t) => {
      // Respiração do corpo
      body.position.y = 0.96 + Math.sin(t * 2.1) * 0.035;
      body.rotation.z = Math.sin(t * 1.1) * 0.02;

      // Mandíbulas vibrando/mordendo
      jaws.forEach((j, i) => {
        j.jp.rotation.y = j.sd * (0.12 + Math.sin(t * 5.2 + i * Math.PI) * 0.18);
      });

      // Pulso tóxico nas fissuras dorsais e na bolsa de veneno
      const pulse = 1.45 + Math.sin(t * 3.6) * 0.55;
      backVents.forEach((v, i) => { v.material.emissiveIntensity = 1.2 + Math.sin(t * 3.6 - i * 0.5) * 0.6; });
      sac.material.emissiveIntensity = pulse;

      // Pinças: ameaça + abrir/fechar forte
      claws.forEach((c, i) => {
        c.sh.rotation.y = c.sd * 0.48 + Math.sin(t * 1.4 + i * 1.8) * 0.12;
        c.sh.rotation.z = Math.sin(t * 1.6 + i) * 0.07;
        c.lowerJaw.rotation.z = (Math.sin(t * 2.6 + i * 1.7) * 0.5 + 0.5) * 0.44;
      });

      // 8 Pernas em marcha alternada
      legs.forEach(l => {
        l.hip.rotation.z = Math.sin(t * 3.2 + l.ph) * 0.12;
        l.knee.rotation.x = l.sd * Math.sin(t * 3.2 + l.ph + 0.8) * 0.08;
      });

      // Cauda arqueada balançando como bote pronto para atacar
      const pts = [];
      for (let i = 0; i < N; i++) {
        const u = i / (N - 1);
        const sway = Math.sin(t * 1.8 + i * 0.32) * 0.11;
        const strike = Math.sin(t * 2.2) * 0.14 * u;
        const x = 2.45 + Math.sin(u * Math.PI * 0.88) * 0.72 - u * 2.75 - strike;
        const y = 0.05 + Math.sin(u * Math.PI * 0.84 + 0.18) * 2.55 + sway;
        const z = Math.sin(t * 1.3 + u * 2.0) * 0.08 * u;
        pts.push(new T.Vector3(x, y, z));
      }
      for (let i = 0; i < N; i++) {
        tailSegs[i].position.copy(pts[i]);
        const next = pts[Math.min(i + 1, N - 1)];
        const prev = pts[Math.max(i - 1, 0)];
        const dir = new T.Vector3().subVectors(next, prev);
        tailSegs[i].rotation.z = Math.atan2(dir.y, dir.x);
      }
      const last = pts[N - 1];
      telson.position.set(last.x - 0.24, last.y + 0.04, last.z);
      telson.rotation.z = Math.sin(t * 2.2) * 0.16;

      // Gotas de veneno pingando do ferrão
      drops.forEach((d, idx) => {
        const ph = (t * 0.85 + idx * 0.5) % 1;
        d.position.set(telson.position.x - 0.92, telson.position.y - 0.82 - ph * 1.15, telson.position.z);
        d.scale.setScalar(Math.max(0.05, 1.0 - ph * 0.85));
      });
    });

    return { g, step: (t, dt) => A.forEach(f => f(t, dt)) };
  }

  /* ---- aranha ---- */
  function buildAranha() {
    const g = new T.Group(), A = [];
    const rnd = makeRng(50913);
    const M = o => new T.MeshStandardMaterial(o);
    const glow = (c, i) => M({ color: c, emissive: c, emissiveIntensity: i == null ? 1.8 : i, roughness: 0.22, metalness: 0.1 });
    const add = (geo, m, x, y, z, par) => {
      const o = new T.Mesh(geo, m);
      o.position.set(x, y, z);
      o.castShadow = true; o.receiveShadow = true;
      (par || g).add(o);
      return o;
    };
    const pivot = (x, y, z, par) => { const o = new T.Group(); o.position.set(x, y, z); (par || g).add(o); return o; };

    // Texturas procedurais + Bump Map de quitina real do pântano
    const chitinBump = makeBump(256, 256, (x, w, h) => {
      x.fillStyle = '#7a7a7a'; x.fillRect(0, 0, w, h);
      x.strokeStyle = '#383838'; x.lineWidth = 2;
      for (let i = 0; i < 12; i++) {
        x.beginPath(); x.arc(128, 128, 18 + i * 16, 0, 6.28); x.stroke();
      }
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * 6.28;
        x.beginPath(); x.moveTo(128, 128); x.lineTo(128 + Math.cos(a) * 180, 128 + Math.sin(a) * 180); x.stroke();
      }
      for (let i = 0; i < 600; i++) {
        x.fillStyle = rnd() > 0.5 ? 'rgba(210,210,210,.15)' : 'rgba(20,20,20,.2)';
        x.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 3, 1 + rnd() * 5);
      }
    });

    const chitinTex = makeTex(256, 256, (x, w, h) => {
      const gr = x.createRadialGradient(128, 110, 16, 128, 128, 145);
      gr.addColorStop(0, '#491d66'); gr.addColorStop(0.5, '#250d38'); gr.addColorStop(1, '#10051a');
      x.fillStyle = gr; x.fillRect(0, 0, w, h);
      // Veias sutis de teia púrpura
      x.strokeStyle = 'rgba(180,115,240,.14)'; x.lineWidth = 1.5;
      for (let i = 0; i < 10; i++) {
        x.beginPath(); x.arc(128, 128, 16 + i * 14, 0, 6.28); x.stroke();
      }
      for (let i = 0; i < 650; i++) {
        x.fillStyle = rnd() > 0.5 ? 'rgba(175,115,235,.09)' : 'rgba(5,0,12,.24)';
        x.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 3, 1 + rnd() * 5);
      }
    });

    const carapace = M({ map: chitinTex, bumpMap: chitinBump, bumpScale: 0.035, roughness: 0.34, metalness: 0.32 });
    const darkChitin = M({ color: '#14081f', bumpMap: chitinBump, bumpScale: 0.02, roughness: 0.42, metalness: 0.38 });
    const royalGold = M({ color: '#e0ab3c', roughness: 0.28, metalness: 0.88 });
    const eyeRuby = glow('#ff2244', 2.2);
    const eyeHot = glow('#ff9fb0', 2.4);
    const webGlow = glow('#8cff42', 1.65);
    const webSoft = M({ color: '#a8ff70', emissive: '#6aff2a', emissiveIntensity: 1.0, roughness: 0.2, transparent: true, opacity: 0.85 });
    const fangMat = M({ color: '#d8ffa0', emissive: '#76e830', emissiveIntensity: 0.9, roughness: 0.22, metalness: 0.15 });

    const body = pivot(0, 1.38, 0);

    // -----------------------------------------------------------------------
    // 1. ABDÔMEN REAL COLOSSAL + AMPULHETA 3D + PLACAS & FIEIRAS DE TEIA
    // -----------------------------------------------------------------------
    const abdGroup = pivot(1.18, 0.34, 0, body);
    abdGroup.rotation.z = 0.26; // Erguido de forma imponente!

    // Volume principal do abdômen (forma orgânica alongada)
    const abdMain = add(new T.SphereGeometry(1.12, 26, 18), carapace, 0, 0, 0, abdGroup);
    abdMain.scale.set(1.32, 0.96, 1.02);

    // 3 placas de armadura dorsal sobrepostas com borda dourada
    for (let i = 0; i < 3; i++) {
      const px = -0.58 + i * 0.56;
      const sc = 1.0 - Math.abs(i - 1) * 0.16;
      const pl = add(new T.SphereGeometry(0.92 * sc, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.48), darkChitin, px, 0.14, 0, abdGroup);
      pl.scale.set(0.55, 0.95, 1.06);
      // Friso dourado curvado sobre cada placa
      const rim = add(new T.TorusGeometry(0.94 * sc, 0.04, 8, 22, Math.PI * 0.88), royalGold, px + 0.14, 0.16, 0, abdGroup);
      rim.rotation.y = Math.PI / 2;
      rim.rotation.z = -Math.PI * 0.44;
    }

    // Símbolo 3D luminoso da Rainha (ampulheta / losango duplo) no topo do abdômen
    const mark1 = add(new T.ConeGeometry(0.28, 0.52, 4), webGlow, -0.24, 0.98, 0, abdGroup);
    mark1.rotation.z = -Math.PI / 2; mark1.scale.set(0.35, 1, 1);
    const mark2 = add(new T.ConeGeometry(0.28, 0.52, 4), webGlow, 0.32, 0.98, 0, abdGroup);
    mark2.rotation.z = Math.PI / 2; mark2.scale.set(0.35, 1, 1);
    const markGem = add(new T.OctahedronGeometry(0.18), eyeRuby, 0.04, 1.02, 0, abdGroup);
    markGem.scale.set(1.2, 0.55, 0.9);

    // Fileira dupla de espinhos reais curvos no dorso do abdômen
    for (let i = 0; i < 4; i++) {
      [-1, 1].forEach(sd => {
        const sp = add(new T.ConeGeometry(0.085 - i * 0.01, 0.48 - i * 0.05, 6), i % 2 ? royalGold : darkChitin, -0.62 + i * 0.44, 0.78 - i * 0.06, sd * (0.58 - i * 0.06), abdGroup);
        sp.rotation.z = -0.45; sp.rotation.x = sd * 0.45;
      });
    }

    // Glândula luminosa traseira + 4 Fieiras (Spinnerets) articuladas
    const webBulb = add(new T.SphereGeometry(0.38, 16, 12), webSoft, 1.38, -0.08, 0, abdGroup);
    const spinnerets = [];
    [[-0.18, -0.18], [-0.18, 0.18], [0.18, -0.16], [0.18, 0.16]].forEach(([sy, sz], idx) => {
      const sp = pivot(1.42, -0.08 + sy, sz, abdGroup);
      const cone = add(new T.ConeGeometry(0.1, 0.48, 8), darkChitin, 0.22, 0, 0, sp);
      cone.rotation.z = -Math.PI / 2;
      add(new T.SphereGeometry(0.055, 8, 6), webGlow, 0.44, 0, 0, sp);
      spinnerets.push({ sp, ph: idx * 1.4 });
    });

    // -----------------------------------------------------------------------
    // 2. CEFALOTÓRAX BLINDADO + CABEÇA + COROA REAL COM RUBI + 8 OLHOS
    // -----------------------------------------------------------------------
    // Pedicelo (cintura estreita que conecta abdômen ao cefalotórax)
    add(new T.CylinderGeometry(0.26, 0.3, 0.42, 10), darkChitin, 0.22, 0.02, 0, body).rotation.z = Math.PI / 2;

    const thorax = pivot(-0.42, 0.02, 0, body);
    const thShell = add(new T.SphereGeometry(0.72, 20, 14), carapace, 0, 0, 0, thorax);
    thShell.scale.set(1.22, 0.78, 1.02);
    // Cristas douradas no cefalotórax
    [-1, 1].forEach(sd => {
      const cr = add(new T.BoxGeometry(0.95, 0.1, 0.09), royalGold, 0.04, 0.46, sd * 0.34, thorax);
      cr.rotation.y = sd * 0.28;
    });

    // Cabeça frontal + Coroa Real esculpida
    const head = pivot(-0.82, 0.02, 0, thorax);
    const hMesh = add(new T.SphereGeometry(0.46, 18, 14), darkChitin, 0, 0, 0, head);
    hMesh.scale.set(1.08, 0.88, 1.12);

    // COROA DA ARANHA RAINHA (aro de ouro + 5 pontas esculpidas + rubi central)
    const crown = pivot(-0.04, 0.36, 0, head);
    crown.rotation.z = 0.2;
    add(new T.TorusGeometry(0.32, 0.052, 8, 20), royalGold, 0, 0, 0, crown).rotation.x = Math.PI / 2;
    for (let k = 0; k < 5; k++) {
      const a = Math.PI + (k - 2) * 0.48;
      const isCenter = k === 2;
      const spike = add(new T.ConeGeometry(isCenter ? 0.09 : 0.065, isCenter ? 0.56 : 0.38, 6), royalGold, Math.cos(a) * 0.31, isCenter ? 0.26 : 0.18, Math.sin(a) * 0.31, crown);
      spike.rotation.z = Math.cos(a) * -0.22;
      spike.rotation.x = Math.sin(a) * 0.22;
    }
    // Gema Rubi incrustada na frente da coroa
    const crownGem = add(new T.OctahedronGeometry(0.11), eyeRuby, -0.34, 0.14, 0, crown);
    crownGem.scale.set(0.6, 1.35, 0.9);

    // 8 OLHOS ARACNÍDEOS EM CLUSTER (2 grandes + 2 médios + 4 laterais)
    const eyes = [];
    [
      [-0.44,  0.14, -0.14, 0.095], [-0.44,  0.14,  0.14, 0.095],
      [-0.39,  0.27, -0.25, 0.062], [-0.39,  0.27,  0.25, 0.062],
      [-0.36,  0.03, -0.30, 0.052], [-0.36,  0.03,  0.30, 0.052],
      [-0.25,  0.17, -0.40, 0.045], [-0.25,  0.17,  0.40, 0.045]
    ].forEach(([ex, ey, ez, er]) => {
      const eo = add(new T.SphereGeometry(er, 10, 8), eyeRuby, ex, ey, ez, head);
      add(new T.SphereGeometry(er * 0.38, 6, 6), eyeHot, ex - er * 0.72, ey + er * 0.28, ez, head);
      eyes.push(eo);
    });

    // Quelíceras + Presas venenosas curvas (animadas)
    const fangs = [];
    [-1, 1].forEach(sd => {
      const fp = pivot(-0.34, -0.16, sd * 0.19, head);
      add(new T.CylinderGeometry(0.11, 0.13, 0.3, 8), carapace, 0, -0.12, 0, fp);
      const curve = new T.CatmullRomCurve3([
        new T.Vector3(0, -0.22, 0),
        new T.Vector3(-0.08, -0.42, -sd * 0.04),
        new T.Vector3(-0.04, -0.6, -sd * 0.12)
      ]);
      add(new T.TubeGeometry(curve, 10, 0.055, 7, false), fangMat, 0, 0, 0, fp);
      const tip = add(new T.ConeGeometry(0.055, 0.18, 7), webGlow, -0.02, -0.66, -sd * 0.15, fp);
      tip.rotation.z = Math.PI + 0.15;
      fangs.push({ fp, sd });
    });

    // 2 Pedipalpos frontais articulados (braços táticos na frente da cabeça)
    const palps = [];
    [-1, 1].forEach(sd => {
      const pp = pivot(-0.36, -0.04, sd * 0.42, head);
      pp.rotation.y = sd * 0.35;
      add(new T.CylinderGeometry(0.07, 0.09, 0.52, 8), darkChitin, -0.24, 0.06, 0, pp).rotation.z = Math.PI / 2 - 0.25;
      const tipG = pivot(-0.48, 0.14, 0, pp);
      add(new T.SphereGeometry(0.08, 8, 6), royalGold, 0, 0, 0, tipG);
      add(new T.ConeGeometry(0.065, 0.48, 8), carapace, -0.18, -0.16, 0, tipG).rotation.z = Math.PI * 0.72;
      palps.push({ pp, tipG, sd });
    });

    // -----------------------------------------------------------------------
    // 3. 8 PERNAS ALTAS DE ARANHA REAL (3 SEGMENTOS + ANÉIS DE OURO + GARRAS)
    // -----------------------------------------------------------------------
    const legs = [];
    const legSpecs = [
      // [xOff, yawBase, femurLen, tibiaLen, spread]
      [-0.36,  0.72, 1.38, 1.82, 0.95],
      [-0.10,  0.26, 1.32, 1.72, 1.05],
      [ 0.16, -0.22, 1.34, 1.74, 1.05],
      [ 0.40, -0.68, 1.48, 1.92, 0.98]
    ];
    for (let k = 0; k < 4; k++) {
      const [lx, yawB, fLen, tLen] = legSpecs[k];
      [-1, 1].forEach(sd => {
        const hip = pivot(lx, -0.02, sd * 0.56, thorax);
        hip.rotation.y = sd * yawB;
        add(new T.SphereGeometry(0.14, 8, 6), darkChitin, 0, 0, 0, hip);

        // Fêmur subindo bem alto acima do corpo (silhueta icônica!)
        const femPivot = pivot(0, 0, 0, hip);
        const fem = add(new T.CylinderGeometry(0.085, 0.125, fLen, 8), carapace, 0, fLen * 0.38, sd * (fLen * 0.34), femPivot);
        fem.rotation.x = sd * 0.72;
        // Espinho no topo do fêmur
        add(new T.ConeGeometry(0.045, 0.22, 5), royalGold, 0, fLen * 0.58, sd * (fLen * 0.44), femPivot);

        // Joelho (patela) com anel de ouro real
        const knee = pivot(0, fLen * 0.74, sd * (fLen * 0.68), femPivot);
        add(new T.SphereGeometry(0.12, 10, 8), darkChitin, 0, 0, 0, knee);
        add(new T.TorusGeometry(0.115, 0.032, 8, 14), royalGold, 0, 0, 0, knee).rotation.y = Math.PI / 2;

        // Tíbia longa descendo inclinada para fora
        const tib = add(new T.CylinderGeometry(0.055, 0.085, tLen * 0.64, 8), darkChitin, 0, -tLen * 0.28, sd * (tLen * 0.18), knee);
        tib.rotation.x = -sd * 0.52;
        // Espinhos na tíbia
        add(new T.ConeGeometry(0.036, 0.18, 5), royalGold, 0, -tLen * 0.24, sd * (tLen * 0.24), knee).rotation.x = sd * 1.1;

        // Tarso fino com garra dourada tocando o chão
        const ankle = pivot(0, -tLen * 0.56, sd * (tLen * 0.36), knee);
        add(new T.SphereGeometry(0.075, 8, 6), royalGold, 0, 0, 0, ankle);
        const tarsus = add(new T.ConeGeometry(0.06, tLen * 0.52, 7), darkChitin, 0, -tLen * 0.25, sd * 0.08, ankle);
        tarsus.rotation.z = Math.PI;
        tarsus.rotation.x = sd * 0.22;
        const claw = add(new T.ConeGeometry(0.038, 0.24, 6), royalGold, 0, -tLen * 0.52, sd * 0.14, ankle);
        claw.rotation.z = Math.PI;
        claw.rotation.x = sd * 0.28;

        legs.push({ hip, knee, ph: k * 1.35 + (sd > 0 ? Math.PI : 0), sd });
      });
    }

    // -----------------------------------------------------------------------
    // 4. ANIMAÇÃO ARACNÍDEA RICA
    // -----------------------------------------------------------------------
    A.push((t) => {
      // Corpo pulsando suavemente
      body.position.y = 1.38 + Math.sin(t * 2.4) * 0.04;
      body.rotation.x = Math.sin(t * 1.2) * 0.025;

      // Abdômen respirando + brilho tóxico na glândula de teia
      const s = 1 + Math.sin(t * 2.4) * 0.03;
      abdMain.scale.set(1.32 * s, 0.96 * s, 1.02 * s);
      abdGroup.rotation.z = 0.26 + Math.sin(t * 2.4 - 0.5) * 0.04;
      webBulb.material.emissiveIntensity = 0.85 + Math.sin(t * 3.8) * 0.45;
      crownGem.material.emissiveIntensity = 1.8 + Math.sin(t * 3.2) * 0.6;

      // Fieiras se mexendo como se tecessem teia
      spinnerets.forEach(o => {
        o.sp.rotation.z = Math.sin(t * 4.5 + o.ph) * 0.22;
        o.sp.rotation.y = Math.cos(t * 3.8 + o.ph) * 0.18;
      });

      // Presas e pedipalpos ameaçadores
      fangs.forEach((f, i) => {
        f.fp.rotation.x = f.sd * (0.08 + Math.sin(t * 4.2 + i * 0.6) * 0.14);
      });
      palps.forEach((p, i) => {
        p.pp.rotation.z = Math.sin(t * 3.1 + i * Math.PI) * 0.16;
        p.tipG.rotation.z = Math.sin(t * 3.1 + i * Math.PI + 0.8) * 0.2;
      });

      // 8 Pernas em marcha sincronizada de aranha
      legs.forEach(l => {
        l.hip.rotation.z = Math.sin(t * 3.4 + l.ph) * 0.11;
        l.knee.rotation.x = l.sd * Math.sin(t * 3.4 + l.ph + 0.7) * 0.07;
      });
    });

    return { g, step: (t, dt) => A.forEach(f => f(t, dt)) };
  }

  /* ---- automato ---- */
  function buildAutomato() {
    const g = new T.Group(), A = [];
    const rnd = makeRng(42077);
    const M = o => new T.MeshStandardMaterial(o);
    const glow = (c, i) => M({ color: c, emissive: c, emissiveIntensity: i == null ? 1.6 : i, roughness: 0.25, metalness: 0.1 });
    const add = (geo, m, x, y, z, par) => {
      const o = new T.Mesh(geo, m);
      o.position.set(x, y, z);
      o.castShadow = true; o.receiveShadow = true;
      (par || g).add(o);
      return o;
    };
    const pivot = (x, y, z, par) => { const o = new T.Group(); o.position.set(x, y, z); (par || g).add(o); return o; };

    // Procedural Textures + Bump Maps
    const steelBump = makeBump(256, 256, (x, w, h) => {
      x.fillStyle = '#808080'; x.fillRect(0, 0, w, h);
      x.strokeStyle = '#383838'; x.lineWidth = 5; x.strokeRect(8, 8, w - 16, h - 16);
      x.strokeStyle = '#b0b0b0'; x.lineWidth = 2; x.strokeRect(12, 12, w - 24, h - 24);
      for (let i = 0; i < 40; i++) {
        x.strokeStyle = rnd() > 0.5 ? 'rgba(220,220,220,.14)' : 'rgba(30,30,30,.18)';
        x.lineWidth = 1; x.beginPath();
        const y0 = rnd() * h; x.moveTo(0, y0); x.lineTo(w, y0 + (rnd() - 0.5) * 14); x.stroke();
      }
      for (const [px, py] of [[22,22],[234,22],[22,234],[234,234],[128,22],[128,234]]) {
        x.fillStyle = '#e0e0e0'; x.beginPath(); x.arc(px, py, 6, 0, 6.28); x.fill();
        x.fillStyle = '#505050'; x.beginPath(); x.arc(px, py, 3, 0, 6.28); x.fill();
      }
    });

    const steelTex = makeTex(256, 256, (x, w, h) => {
      const gr = x.createLinearGradient(0, 0, w, h);
      gr.addColorStop(0, '#6a7a92'); gr.addColorStop(0.5, '#4b596e'); gr.addColorStop(1, '#313b4b');
      x.fillStyle = gr; x.fillRect(0, 0, w, h);
      for (let i = 0; i < 65; i++) {
        x.strokeStyle = rnd() > 0.45 ? 'rgba(210,230,255,.07)' : 'rgba(10,14,22,.14)';
        x.lineWidth = 1 + rnd() * 1.5;
        x.beginPath(); const y0 = rnd() * h; x.moveTo(0, y0); x.lineTo(w, y0 + (rnd() - 0.5) * 10); x.stroke();
      }
      x.strokeStyle = 'rgba(12,16,26,.78)'; x.lineWidth = 5; x.strokeRect(8, 8, w - 16, h - 16);
      x.strokeStyle = 'rgba(195,215,240,.22)'; x.lineWidth = 2; x.strokeRect(12, 12, w - 24, h - 24);
      for (const [px, py] of [[22,22],[234,22],[22,234],[234,234],[128,22],[128,234]]) {
        x.fillStyle = '#1b2330'; x.beginPath(); x.arc(px, py, 6.5, 0, 6.28); x.fill();
        x.fillStyle = '#9db0c9'; x.beginPath(); x.arc(px - 1, py - 1, 3.2, 0, 6.28); x.fill();
      }
    });

    const brassTex = makeTex(256, 256, (x, w, h) => {
      const gr = x.createLinearGradient(0, 0, w, h);
      gr.addColorStop(0, '#e2b65a'); gr.addColorStop(0.5, '#b88530'); gr.addColorStop(1, '#7a5216');
      x.fillStyle = gr; x.fillRect(0, 0, w, h);
      for (let i = 0; i < 48; i++) {
        x.strokeStyle = rnd() > 0.5 ? 'rgba(255,240,190,.12)' : 'rgba(40,22,4,.16)';
        x.beginPath(); const y0 = rnd() * h; x.moveTo(0, y0); x.lineTo(w, y0); x.stroke();
      }
    });

    const hazardTex = makeTex(128, 128, (x, w, h) => {
      x.fillStyle = '#d99e1e'; x.fillRect(0, 0, w, h);
      x.fillStyle = '#191b20';
      for (let i = -3; i < 9; i++) {
        x.beginPath();
        x.moveTo(i * 26, 0); x.lineTo(i * 26 + 13, 0);
        x.lineTo(i * 26 + 13 + h, h); x.lineTo(i * 26 + h, h);
        x.closePath(); x.fill();
      }
      for (let i = 0; i < 180; i++) {
        x.fillStyle = rnd() > 0.5 ? 'rgba(20,16,12,.22)' : 'rgba(255,230,170,.08)';
        x.fillRect(rnd() * w, rnd() * h, 2 + rnd() * 5, 1 + rnd() * 3);
      }
    });

    const steel = M({ map: steelTex, bumpMap: steelBump, bumpScale: 0.035, roughness: 0.38, metalness: 0.78 });
    const steelDark = M({ color: '#273142', bumpMap: steelBump, bumpScale: 0.02, roughness: 0.44, metalness: 0.82 });
    const chassis = M({ color: '#151b26', roughness: 0.52, metalness: 0.84 });
    const chrome = M({ color: '#c8d6e8', roughness: 0.2, metalness: 0.95 });
    const brass = M({ map: brassTex, roughness: 0.3, metalness: 0.86 });
    const hazard = M({ map: hazardTex, roughness: 0.58, metalness: 0.35 });
    const coreCyan = glow('#5ce4ff', 1.85);
    const coreHot = glow('#e8fbff', 2.4);
    const visorRed = glow('#ff4422', 2.1);
    const ventAmber = glow('#ff9d3b', 1.5);

    // Helper: beveled extruded plate in YZ plane (extruded along X)
    function makeBevelPlate(pts, depth, bevel) {
      const sh = new T.Shape();
      pts.forEach(([px, py], i) => i === 0 ? sh.moveTo(px, py) : sh.lineTo(px, py));
      sh.closePath();
      const geo = new T.ExtrudeGeometry(sh, {
        depth, bevelEnabled: true,
        bevelThickness: bevel || 0.06, bevelSize: bevel || 0.05, bevelSegments: 2
      });
      geo.center();
      return geo;
    }

    // Helper: real spoked toothed gear
    function makeGear(r, thickness, teeth, matRing, matTooth) {
      const gr = new T.Group();
      add(new T.TorusGeometry(r * 0.82, r * 0.18, 10, 28), matRing, 0, 0, 0, gr);
      add(new T.CylinderGeometry(r * 0.32, r * 0.32, thickness * 1.15, 16), brass, 0, 0, 0, gr).rotation.x = Math.PI / 2;
      add(new T.CylinderGeometry(r * 0.14, r * 0.14, thickness * 1.4, 12), chassis, 0, 0, 0, gr).rotation.x = Math.PI / 2;
      for (let s = 0; s < 5; s++) {
        const a = (s / 5) * Math.PI * 2;
        const sp = add(new T.BoxGeometry(r * 0.72, r * 0.13, thickness * 0.75), matRing, Math.cos(a) * r * 0.42, Math.sin(a) * r * 0.42, 0, gr);
        sp.rotation.z = a;
      }
      for (let k = 0; k < teeth; k++) {
        const a = (k / teeth) * Math.PI * 2;
        const tt = add(new T.BoxGeometry(r * 0.22, r * 0.19, thickness), matTooth, Math.cos(a) * (r + r * 0.06), Math.sin(a) * (r + r * 0.06), 0, gr);
        tt.rotation.z = a;
      }
      return gr;
    }

    const root = pivot(0, 0, 0);

    // -----------------------------------------------------------------------
    // 1. PERNAS & PÉS DE COLOSSO (stance larga, 3 dedos blindados, pistões)
    // -----------------------------------------------------------------------
    const legAnims = [];
    [-1, 1].forEach(sd => {
      const leg = pivot(0, 0, sd * 0.64, root);

      // Sabaton (pé blindado com 2 dedos frontais + calcanhar traseiro)
      add(new T.CylinderGeometry(0.36, 0.46, 0.24, 8), chassis, 0.0, 0.12, 0, leg);
      [-0.22, 0.22].forEach(tz => {
        const toe = add(new T.BoxGeometry(0.62, 0.22, 0.28), steelDark, -0.34, 0.11, tz, leg);
        toe.rotation.y = tz * -0.35;
        add(new T.BoxGeometry(0.2, 0.12, 0.24), brass, -0.62, 0.07, tz * 1.05, leg);
      });
      // Calcanhar estabilizador
      add(new T.BoxGeometry(0.42, 0.2, 0.42), steelDark, 0.36, 0.1, 0, leg);
      // Articulação do tornozelo + pistão frontal
      add(new T.CylinderGeometry(0.24, 0.24, 0.56, 12), chassis, 0, 0.34, 0, leg).rotation.x = Math.PI / 2;
      add(new T.CylinderGeometry(0.06, 0.06, 0.55, 8), chrome, -0.26, 0.48, 0, leg).rotation.z = 0.25;

      // Canela blindada (greva facetada + placa frontal de latão)
      const shin = add(new T.CylinderGeometry(0.38, 0.3, 0.92, 8), steel, 0.02, 0.84, 0, leg);
      shin.rotation.y = Math.PI / 8;
      // Placa frontal da greva
      const shinPlate = add(makeBevelPlate([[-0.22,-0.38],[0.22,-0.38],[0.3,0.28],[0,0.46],[-0.3,0.28]], 0.14, 0.04), steel, -0.34, 0.88, 0, leg);
      shinPlate.rotation.y = Math.PI / 2;
      // Friso de latão na canela
      add(new T.BoxGeometry(0.09, 0.55, 0.12), brass, -0.43, 0.9, 0, leg);
      // Pistão traseiro da panturrilha
      add(new T.CylinderGeometry(0.09, 0.09, 0.48, 10), chassis, 0.34, 0.68, 0, leg).rotation.z = -0.18;
      add(new T.CylinderGeometry(0.05, 0.05, 0.48, 8), chrome, 0.38, 1.0, 0, leg).rotation.z = -0.18;

      // Joelho blindado com rótula + pinos de latão
      add(new T.CylinderGeometry(0.26, 0.26, 0.68, 14), chassis, -0.02, 1.36, 0, leg).rotation.x = Math.PI / 2;
      add(new T.CylinderGeometry(0.14, 0.14, 0.76, 12), brass, -0.02, 1.36, 0, leg).rotation.x = Math.PI / 2;
      const kneeGuard = add(makeBevelPlate([[-0.22,-0.2],[0.22,-0.2],[0.26,0.12],[0,0.28],[-0.26,0.12]], 0.16, 0.04), brass, -0.4, 1.4, 0, leg);
      kneeGuard.rotation.y = Math.PI / 2;
      add(new T.BoxGeometry(0.08, 0.18, 0.24), hazard, -0.02, 1.36, sd * 0.38, leg);

      // Coxa blindada
      const thigh = add(new T.CylinderGeometry(0.36, 0.32, 0.65, 8), steelDark, 0.04, 1.72, 0, leg);
      thigh.rotation.y = Math.PI / 8;
      add(new T.BoxGeometry(0.48, 0.52, 0.18), steel, 0.0, 1.74, sd * 0.34, leg);
      legAnims.push(leg);
    });

    // -----------------------------------------------------------------------
    // 2. PELVE & CINTURA MECÂNICA (com amortecedores abdominais)
    // -----------------------------------------------------------------------
    const upper = pivot(0, 1.98, 0, root);
    add(new T.CylinderGeometry(0.62, 0.5, 0.42, 8), chassis, 0.02, 0.04, 0, upper).rotation.y = Math.PI / 8;
    // Placa frontal da cintura (escarcela de colosso)
    const belt = add(makeBevelPlate([[-0.42,0.18],[0.42,0.18],[0.26,-0.32],[-0.26,-0.32]], 0.18, 0.04), steel, -0.58, -0.04, 0, upper);
    belt.rotation.y = Math.PI / 2;
    add(new T.BoxGeometry(0.12, 0.2, 0.36), brass, -0.68, 0.04, 0, upper);
    // Saias laterais blindadas (tassets)
    [-1, 1].forEach(sd => {
      const tas = add(new T.BoxGeometry(0.68, 0.42, 0.14), steel, 0.0, -0.02, sd * 0.72, upper);
      tas.rotation.x = sd * 0.2;
      add(new T.BoxGeometry(0.56, 0.09, 0.17), brass, 0.0, -0.18, sd * 0.74, upper).rotation.x = sd * 0.2;
    });
    // Abdômen estreito com 4 pistões cromados visíveis (contraste silhueta V)
    add(new T.CylinderGeometry(0.54, 0.46, 0.44, 12), chassis, 0.06, 0.36, 0, upper);
    [[-0.36, -0.32], [-0.36, 0.32], [0.34, -0.36], [0.34, 0.36]].forEach(([px, pz]) => {
      add(new T.CylinderGeometry(0.065, 0.065, 0.46, 8), chrome, px, 0.36, pz, upper);
      add(new T.CylinderGeometry(0.095, 0.095, 0.22, 8), brass, px, 0.26, pz, upper);
    });

    // -----------------------------------------------------------------------
    // 3. TORSO BLINDADO & REATOR ARCANO EMP
    // -----------------------------------------------------------------------
    const torso = pivot(0, 0.56, 0, upper);
    // Núcleo estrutural em V (mais largo em cima)
    const chestCore = add(new T.CylinderGeometry(1.06, 0.68, 1.38, 8), steelDark, 0.04, 0.66, 0, torso);
    chestCore.rotation.y = Math.PI / 8;
    chestCore.scale.set(0.84, 1, 1.12);

    // Duas placas peitorais chanfradas anguladas (esquerda/direita)
    [-1, 1].forEach(sd => {
      const pec = add(makeBevelPlate([[-0.18,-0.42],[0.52,-0.28],[0.62,0.36],[-0.08,0.48],[-0.28,0.12]], 0.26, 0.05), steel, -0.68, 0.74, sd * 0.48, torso);
      pec.rotation.y = Math.PI / 2 - sd * 0.28;
      // Moldura superior de latão no peito
      const trim = add(new T.BoxGeometry(0.14, 0.12, 0.74), brass, -0.76, 1.14, sd * 0.52, torso);
      trim.rotation.y = sd * 0.26;
      // Fendas luminosas de ventilação na clavícula
      add(new T.BoxGeometry(0.08, 0.06, 0.32), coreCyan, -0.79, 1.02, sd * 0.54, torso).rotation.y = sd * 0.26;
      // Costelas laterais blindadas
      for (let r = 0; r < 2; r++) {
        add(new T.BoxGeometry(0.55, 0.16, 0.18), steel, -0.05, 0.28 + r * 0.26, sd * 0.86, torso);
      }
    });

    // Gola / Gorjal blindado protegendo o pescoço
    const gorget = add(new T.CylinderGeometry(0.62, 0.74, 0.34, 8, 1, false), steel, -0.04, 1.42, 0, torso);
    gorget.rotation.y = Math.PI / 8;
    add(new T.TorusGeometry(0.58, 0.06, 8, 16), brass, -0.04, 1.56, 0, torso).rotation.x = Math.PI / 2;

    // REATOR DE NÚCLEO EMP NO CENTRO DO PEITO
    const reactor = pivot(-0.82, 0.72, 0, torso);
    add(new T.CylinderGeometry(0.46, 0.52, 0.24, 16), chassis, 0.04, 0, 0, reactor).rotation.z = Math.PI / 2;
    add(new T.TorusGeometry(0.44, 0.07, 10, 24), brass, -0.08, 0, 0, reactor).rotation.y = Math.PI / 2;
    // 6 garras/travas de contenção ao redor do reator
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      const clamp = add(new T.BoxGeometry(0.16, 0.11, 0.12), steel, -0.1, Math.sin(a) * 0.45, Math.cos(a) * 0.45, reactor);
      clamp.rotation.x = -a;
    }
    // Anel interno giratório de energia
    const coreRing = pivot(-0.11, 0, 0, reactor);
    add(new T.TorusGeometry(0.32, 0.032, 8, 24), coreCyan, 0, 0, 0, coreRing).rotation.y = Math.PI / 2;
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI * 2;
      add(new T.OctahedronGeometry(0.065), coreHot, -0.02, Math.sin(a) * 0.31, Math.cos(a) * 0.31, coreRing);
    }
    const coreOrb = add(new T.IcosahedronGeometry(0.24, 1), coreCyan, -0.08, 0, 0, reactor);
    const coreInner = add(new T.SphereGeometry(0.13, 12, 10), coreHot, -0.14, 0, 0, reactor);

    // -----------------------------------------------------------------------
    // 4. CAPACETE DE CAVALEIRO-COLOSSO (esculturado, visor curvo + crista)
    // -----------------------------------------------------------------------
    const head = pivot(-0.08, 1.82, 0, torso);
    // Pescoço hidráulico
    add(new T.CylinderGeometry(0.24, 0.3, 0.34, 10), chassis, 0, -0.22, 0, head);
    // Crânio facetado
    const skull = add(new T.CylinderGeometry(0.42, 0.48, 0.62, 8), steel, 0.02, 0.08, 0, head);
    skull.rotation.y = Math.PI / 8;
    // Domo superior
    const dome = add(new T.SphereGeometry(0.42, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.52), steel, 0.02, 0.36, 0, head);
    // Crista central de latão (estilo centurião/cavaleiro)
    const crest = add(makeBevelPlate([[-0.42,-0.08],[0.45,-0.06],[0.54,0.22],[0.02,0.34],[-0.46,0.14]], 0.09, 0.025), brass, 0.04, 0.58, 0, head);
    // Protetores de bochecha / queixo pesado
    add(new T.BoxGeometry(0.32, 0.24, 0.56), steelDark, -0.34, -0.14, 0, head);
    add(new T.BoxGeometry(0.12, 0.14, 0.34), brass, -0.49, -0.16, 0, head);
    // Fenda escura do visor + visor curvo carmesim
    add(new T.CylinderGeometry(0.44, 0.44, 0.18, 16, 1, false, Math.PI * 0.68, Math.PI * 0.64), chassis, 0.0, 0.12, 0, head);
    const visor = add(new T.CylinderGeometry(0.455, 0.455, 0.11, 16, 1, false, Math.PI * 0.72, Math.PI * 0.56), visorRed, 0.0, 0.12, 0, head);
    // Ponto ótico que escaneia dentro do visor
    const eyeScan = add(new T.SphereGeometry(0.065, 10, 8), coreHot, -0.46, 0.12, 0, head);
    // Chifres/antenas táticas assimétricas nas laterais
    [-1, 1].forEach(sd => {
      add(new T.CylinderGeometry(0.11, 0.13, 0.14, 10), brass, 0.02, 0.1, sd * 0.46, head).rotation.x = Math.PI / 2;
      const horn = add(new T.ConeGeometry(0.055, 0.52, 6), steel, 0.08, 0.36, sd * 0.48, head);
      horn.rotation.z = -0.35; horn.rotation.x = sd * 0.16;
    });
    // Antena longa de pulso no lado esquerdo
    add(new T.CylinderGeometry(0.022, 0.035, 0.85, 8), chrome, 0.14, 0.72, 0.36, head);
    const antTip = add(new T.SphereGeometry(0.065, 10, 8), coreCyan, 0.14, 1.16, 0.36, head);

    // -----------------------------------------------------------------------
    // 5. OMBREIRAS EM CAMADAS + CHAMINÉS DE EXAUSTÃO + BRAÇOS ASSIMÉTRICOS
    // -----------------------------------------------------------------------
    const arms = [];
    [-1, 1].forEach(sd => {
      const sh = pivot(0.02, 1.18, sd * 1.24, torso);

      // Esfera estrutural do ombro
      add(new T.SphereGeometry(0.42, 14, 10), chassis, 0, 0, 0, sh);

      // Ombreira principal em 2 camadas (arco blindado + borda de latão)
      const pauldron = add(new T.SphereGeometry(0.68, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.56), steel, 0, 0.06, sd * 0.14, sh);
      pauldron.rotation.x = sd * 0.38;
      pauldron.scale.set(1.08, 0.92, 1.0);
      // Borda de latão da ombreira
      const pRim = add(new T.TorusGeometry(0.64, 0.065, 8, 22), brass, 0, 0.04, sd * 0.18, sh);
      pRim.rotation.x = Math.PI / 2 + sd * 0.38;
      // Placa lateral com faixas de alerta
      const pSide = add(new T.BoxGeometry(0.68, 0.32, 0.12), hazard, 0, -0.05, sd * 0.68, sh);
      pSide.rotation.x = sd * 0.18;
      // Chaminé/Escape de energia no topo de cada ombreira
      const stack = add(new T.CylinderGeometry(0.11, 0.15, 0.55, 10), steelDark, 0.22, 0.68, sd * 0.12, sh);
      stack.rotation.z = -0.22;
      add(new T.TorusGeometry(0.12, 0.03, 8, 14), brass, 0.27, 0.92, sd * 0.12, sh).rotation.x = Math.PI / 2;
      add(new T.SphereGeometry(0.075, 8, 6), ventAmber, 0.27, 0.93, sd * 0.12, sh);

      // Bíceps blindado + pistão externo
      add(new T.CylinderGeometry(0.28, 0.25, 0.95, 8), steelDark, 0, -0.62, 0, sh);
      add(new T.BoxGeometry(0.36, 0.68, 0.16), steel, 0, -0.62, sd * 0.28, sh);
      add(new T.CylinderGeometry(0.055, 0.055, 0.72, 8), chrome, 0.26, -0.62, sd * 0.12, sh);

      // Cotovelo (tambor blindado de latão)
      const el = pivot(0, -1.16, 0, sh);
      add(new T.CylinderGeometry(0.25, 0.25, 0.52, 12), chassis, 0, 0, 0, el).rotation.x = Math.PI / 2;
      add(new T.CylinderGeometry(0.15, 0.15, 0.58, 12), brass, 0, 0, 0, el).rotation.x = Math.PI / 2;

      if (sd < 0) {
        // BRAÇO DIREITO (-Z): MANOPLA DE CERCO (Colossus Siege Gauntlet)
        const fore = add(new T.CylinderGeometry(0.36, 0.44, 1.05, 8), steel, -0.06, -0.62, 0, el);
        fore.rotation.y = Math.PI / 8;
        // Faixa de perigo no antebraço
        add(new T.CylinderGeometry(0.39, 0.41, 0.28, 8), hazard, -0.06, -0.45, 0, el).rotation.y = Math.PI / 8;
        // Bobinas de energia ciano no antebraço
        add(new T.BoxGeometry(0.1, 0.55, 0.14), coreCyan, -0.42, -0.64, 0, el);
        // Punho blindado gigante com soqueira de 4 pinos de latão
        const fist = pivot(-0.08, -1.26, 0, el);
        add(new T.BoxGeometry(0.68, 0.56, 0.72), steelDark, 0, 0, 0, fist);
        add(new T.BoxGeometry(0.22, 0.38, 0.64), brass, -0.34, -0.04, 0, fist);
        for (let f = 0; f < 4; f++) {
          const sp = add(new T.ConeGeometry(0.085, 0.26, 6), brass, -0.5, -0.06, -0.24 + f * 0.16, fist);
          sp.rotation.z = Math.PI / 2;
        }
        // Polegar blindado
        const thumb = add(new T.BoxGeometry(0.34, 0.22, 0.22), steel, -0.24, -0.12, 0.4, fist);
        thumb.rotation.y = 0.4;
        arms.push({ sh, el, sd, cannonRings: null });
      } else {
        // BRAÇO ESQUERDO (+Z): CANHÃO DE PULSO EMP (silencia os especiais!)
        add(new T.CylinderGeometry(0.32, 0.36, 0.65, 8), steel, 0, -0.4, 0, el).rotation.y = Math.PI / 8;
        const cannon = pivot(-0.18, -0.82, 0, el);
        cannon.rotation.z = -1.25; // Apontado para frente (-X)
        // Corpo do canhão
        add(new T.CylinderGeometry(0.32, 0.38, 0.85, 10), steelDark, 0, -0.3, 0, cannon);
        add(new T.CylinderGeometry(0.36, 0.36, 0.22, 10), hazard, 0, -0.1, 0, cannon);
        // 3 trilhos aceleradores ao redor do cano
        for (let b = 0; b < 3; b++) {
          const a = (b / 3) * Math.PI * 2;
          add(new T.BoxGeometry(0.11, 1.15, 0.11), brass, Math.cos(a) * 0.28, -0.92, Math.sin(a) * 0.28, cannon);
        }
        // Anéis de aceleração EMP giratórios
        const cRings = pivot(0, -0.95, 0, cannon);
        [-0.22, 0.08, 0.36].forEach((ry, idx) => {
          add(new T.TorusGeometry(0.24 - idx * 0.02, 0.036, 8, 20), coreCyan, 0, ry, 0, cRings).rotation.x = Math.PI / 2;
        });
        // Orbe de plasma carregado na boca do canhão
        const muzzle = add(new T.IcosahedronGeometry(0.2, 1), coreCyan, 0, -1.48, 0, cannon);
        add(new T.SphereGeometry(0.11, 10, 8), coreHot, 0, -1.48, 0, cannon);
        arms.push({ sh, el, sd, cannonRings: cRings, muzzle });
      }
    });

    // -----------------------------------------------------------------------
    // 6. MOCHILA-CALDEIRA & ENGRENAGENS INTERLIGADAS NAS COSTAS (+X)
    // -----------------------------------------------------------------------
    const pack = pivot(0.84, 0.72, 0, torso);
    // Caixa blindada da caldeira
    add(new T.BoxGeometry(0.58, 1.18, 1.24), steelDark, 0, 0, 0, pack);
    add(new T.BoxGeometry(0.62, 0.16, 1.28), brass, 0, 0.56, 0, pack);
    add(new T.BoxGeometry(0.62, 0.16, 1.28), brass, 0, -0.54, 0, pack);
    // Núcleo de calor central nas costas
    const backCore = add(new T.CylinderGeometry(0.22, 0.22, 0.66, 14), coreCyan, 0.08, 0.04, 0, pack);
    backCore.rotation.z = Math.PI / 2;
    // Tubos de energia curvados ligando a mochila aos ombros
    [-1, 1].forEach(sd => {
      const curve = new T.CatmullRomCurve3([
        new T.Vector3(0.05, 0.38, sd * 0.44),
        new T.Vector3(0.25, 0.76, sd * 0.72),
        new T.Vector3(-0.32, 0.72, sd * 0.98)
      ]);
      add(new T.TubeGeometry(curve, 14, 0.065, 8, false), brass, 0, 0, 0, pack);
    });
    // 3 Engrenagens detalhadas de latão & aço interligadas girando em sentidos opostos
    const gears = [];
    [
      [0.34,  0.14,  0.00, 0.56, 14, brass, steel,  1.25],
      [0.42,  0.62,  0.56, 0.34, 10, steel, brass, -2.05],
      [0.42, -0.36, -0.52, 0.38, 10, steel, brass, -1.85]
    ].forEach(([gx, gy, gz, r, teeth, m1, m2, sp]) => {
      const gr = makeGear(r, 0.14, teeth, m1, m2);
      gr.position.set(gx, gy, gz);
      gr.rotation.y = Math.PI / 2;
      pack.add(gr);
      gears.push({ gr, sp });
    });

    // -----------------------------------------------------------------------
    // 7. ANIMAÇÃO PROCEDURAL RICA
    // -----------------------------------------------------------------------
    A.push((t, dt) => {
      // Respiração pesada de colosso
      upper.position.y = 1.98 + Math.sin(t * 1.9) * 0.038;
      torso.rotation.z = Math.sin(t * 1.9) * 0.022;

      // Cabeça observando o campo + scan do olho carmesim
      head.rotation.y = Math.sin(t * 0.95) * 0.16;
      eyeScan.position.z = Math.sin(t * 2.8) * 0.24;
      antTip.material.emissiveIntensity = 1.1 + Math.sin(t * 5.0) * 0.8;

      // Reator EMP pulsando e girando
      coreRing.rotation.x += dt * 1.65;
      coreOrb.rotation.y += dt * 0.9;
      coreOrb.material.emissiveIntensity = 1.45 + Math.sin(t * 3.4) * 0.55;
      backCore.material.emissiveIntensity = 1.3 + Math.sin(t * 3.4 + 1.0) * 0.45;

      // Engrenagens traseiras interligadas
      gears.forEach(o => { o.gr.rotation.x += o.sp * dt; });

      // Braços: manopla balançando com peso, canhão EMP mirando e carregando
      arms.forEach((a, i) => {
        if (a.sd < 0) {
          a.sh.rotation.z = 0.08 + Math.sin(t * 1.9) * 0.07;
          a.sh.rotation.x = Math.sin(t * 1.3) * 0.06;
          a.el.rotation.z = -0.36 + Math.sin(t * 1.9 + 0.5) * 0.08;
        } else {
          a.sh.rotation.z = -0.14 + Math.sin(t * 1.9 + Math.PI) * 0.05;
          a.el.rotation.z = -0.22 + Math.sin(t * 1.5) * 0.05;
          if (a.cannonRings) a.cannonRings.rotation.y += dt * 2.6;
          if (a.muzzle) {
            const s = 0.9 + Math.sin(t * 4.5) * 0.16;
            a.muzzle.scale.setScalar(s);
          }
        }
      });
    });

    return { g, step: (t, dt) => A.forEach(f => f(t, dt)) };
  }

  /* ---- olho ---- */
  function buildOlho() {
    const g = new T.Group(), A = [];
    const rnd = makeRng(60601);
    const M = o => new T.MeshStandardMaterial(o);
    const MP = o => new T.MeshPhysicalMaterial(o);
    const glow = (c, i, ex) => M(Object.assign({ color: c, emissive: c, emissiveIntensity: i == null ? 1.2 : i, roughness: 0.3 }, ex || {}));
    const add = (geo, m, x, y, z, par, ns) => { const o = new T.Mesh(geo, m); o.position.set(x, y, z); if (!ns) { o.castShadow = true; o.receiveShadow = true; } (par || g).add(o); return o; };
    const pivot = (x, y, z, par) => { const o = new T.Group(); o.position.set(x, y, z); (par || g).add(o); return o; };
    const mkCv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
    const toTex = (c, srgb, rep) => { const t = new T.CanvasTexture(c); if (srgb && T.sRGBEncoding) t.encoding = T.sRGBEncoding; t.wrapS = t.wrapT = T.RepeatWrapping; if (rep) t.repeat.set(rep[0], rep[1]); return t; };
    const gold = M({ color: '#e2b256', metalness: 0.7, roughness: 0.3, emissive: '#3a2406', emissiveIntensity: 0.6 });
    const GLY = '◇△☾✦◈⌬⍟✧☉☽✶❂';

    // ---- Esclera: pérola violeta com veias de luz cósmica (cor + emissiva) ----
    const scl = (() => {
      const W = 1024, H = 512, cm = mkCv(W, H), ce = mkCv(W, H), xm = cm.getContext('2d'), xe = ce.getContext('2d');
      const gr = xm.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#6f5cb8'); gr.addColorStop(0.26, '#cdbfe8'); gr.addColorStop(0.5, '#f3ecfb'); gr.addColorStop(0.74, '#cdbfe8'); gr.addColorStop(1, '#6f5cb8');
      xm.fillStyle = gr; xm.fillRect(0, 0, W, H);
      for (let i = 0; i < 520; i++) { xm.fillStyle = 'rgba(' + (140 + rnd() * 70 | 0) + ',' + (110 + rnd() * 60 | 0) + ',210,' + (0.03 + rnd() * 0.05) + ')'; xm.beginPath(); xm.arc(rnd() * W, rnd() * H, 6 + rnd() * 24, 0, 6.283); xm.fill(); }
      xe.fillStyle = '#000'; xe.fillRect(0, 0, W, H);
      const seg = (x0, y0, x1, y1, w, a) => { for (const o of [-W, 0, W]) { xm.strokeStyle = 'rgba(160,30,120,' + (a * 0.6) + ')'; xm.lineWidth = w; xm.lineCap = 'round'; xm.beginPath(); xm.moveTo(x0 + o, y0); xm.lineTo(x1 + o, y1); xm.stroke(); xe.strokeStyle = (rnd() < 0.5 ? 'rgba(255,110,235,' : 'rgba(110,225,255,') + a + ')'; xe.lineWidth = Math.max(1, w * 0.8); xe.lineCap = 'round'; xe.beginPath(); xe.moveTo(x0 + o, y0); xe.lineTo(x1 + o, y1); xe.stroke(); } };
      const branch = (x, y, ang, len, w, d) => { if (d > 4 || w < 0.6) return; let px = x, py = y; const n = 6 + (rnd() * 5 | 0); for (let k = 0; k < n; k++) { ang += (rnd() - 0.5) * 0.7; const l = len / n, nx = px + Math.cos(ang) * l, ny = py + Math.sin(ang) * l; seg(px, py, nx, ny, w, 0.85 - d * 0.12); px = nx; py = ny; if (rnd() < 0.28) branch(px, py, ang + (rnd() < 0.5 ? -1 : 1) * (0.5 + rnd() * 0.6), len * 0.6, w * 0.6, d + 1); } };
      for (let i = 0; i < 26; i++) { const side = i % 2, x0 = side ? W * 0.93 : W * 0.07, y0 = H * (0.2 + rnd() * 0.6); branch(x0, y0, (side ? Math.PI : 0) + (rnd() - 0.5) * 1.3, W * 0.22, 3 + rnd() * 2.2, 0); }
      return { map: toTex(cm, true), emi: toTex(ce, true) };
    })();

    // ---- Íris: fibras, nebulosa e anel de runas ----
    const irisTex = (() => {
      const S = 512, c = mkCv(S, S), x = c.getContext('2d'), C = S / 2, R = S / 2 - 2;
      const gr = x.createRadialGradient(C, C, 0, C, C, R);
      gr.addColorStop(0, '#000'); gr.addColorStop(0.17, '#06001a'); gr.addColorStop(0.2, '#ffd36a'); gr.addColorStop(0.25, '#ff4fd8'); gr.addColorStop(0.5, '#8a30ff'); gr.addColorStop(0.78, '#2a1090'); gr.addColorStop(0.92, '#5a2cc0'); gr.addColorStop(1, '#0a0230');
      x.fillStyle = '#000'; x.fillRect(0, 0, S, S); x.fillStyle = gr; x.beginPath(); x.arc(C, C, R, 0, 6.283); x.fill();
      for (let i = 0; i < 260; i++) { const a = rnd() * 6.283, r0 = R * (0.2 + rnd() * 0.1), r1 = R * (0.5 + rnd() * 0.4); x.strokeStyle = ['rgba(120,230,255,', 'rgba(255,140,240,', 'rgba(255,255,255,'][i % 3] + (0.1 + rnd() * 0.3) + ')'; x.lineWidth = 0.6 + rnd() * 1.6; x.beginPath(); x.moveTo(C + Math.cos(a) * r0, C + Math.sin(a) * r0); x.quadraticCurveTo(C + Math.cos(a + 0.12) * (r0 + r1) / 2, C + Math.sin(a + 0.12) * (r0 + r1) / 2, C + Math.cos(a + 0.05) * r1, C + Math.sin(a + 0.05) * r1); x.stroke(); }
      for (let i = 0; i < 150; i++) { const a = rnd() * 6.283, r = R * (0.25 + rnd() * 0.65); x.fillStyle = 'rgba(255,255,255,' + (0.3 + rnd() * 0.6) + ')'; x.beginPath(); x.arc(C + Math.cos(a) * r, C + Math.sin(a) * r, 0.7 + rnd() * 1.6, 0, 6.283); x.fill(); }
      x.strokeStyle = 'rgba(255,214,120,.95)'; x.lineWidth = 3; [0.86, 0.95].forEach(k => { x.beginPath(); x.arc(C, C, R * k, 0, 6.283); x.stroke(); });
      x.fillStyle = 'rgba(255,228,150,.95)'; x.font = 'bold 30px serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
      for (let i = 0; i < 28; i++) { const a = i / 28 * 6.283; x.save(); x.translate(C + Math.cos(a) * R * 0.905, C + Math.sin(a) * R * 0.905); x.rotate(a + Math.PI / 2); x.fillText(GLY[i % GLY.length], 0, 0); x.restore(); }
      return toTex(c, true);
    })();

    // ---- Pupila: uma galáxia espiral dentro do vazio ----
    const galTex = (() => {
      const S = 256, c = mkCv(S, S), x = c.getContext('2d'), C = S / 2;
      x.fillStyle = '#000'; x.fillRect(0, 0, S, S);
      const rg = x.createRadialGradient(C, C, 0, C, C, 36); rg.addColorStop(0, 'rgba(255,240,255,.95)'); rg.addColorStop(0.4, 'rgba(180,120,255,.5)'); rg.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = rg; x.fillRect(0, 0, S, S);
      for (let i = 0; i < 1100; i++) { const t = rnd(), arm = i % 2, r = 6 + t * 112, a = t * 6.3 + arm * Math.PI + (rnd() - 0.5) * 0.55; x.fillStyle = (rnd() < 0.5 ? 'rgba(150,215,255,' : 'rgba(255,170,240,') + (0.25 + rnd() * 0.6) + ')'; x.beginPath(); x.arc(C + Math.cos(a) * r, C + Math.sin(a) * r, 0.6 + rnd() * 1.4, 0, 6.283); x.fill(); }
      const ed = x.createRadialGradient(C, C, S * 0.3, C, C, S * 0.5); ed.addColorStop(0, 'rgba(0,0,0,0)'); ed.addColorStop(1, '#000'); x.fillStyle = ed; x.fillRect(0, 0, S, S);
      return toTex(c, true);
    })();

    // ---- Runas douradas (cor + brilho) ----
    const runeEmi = (() => { const c = mkCv(512, 64), x = c.getContext('2d'); x.fillStyle = '#000'; x.fillRect(0, 0, 512, 64); x.fillStyle = '#ff9bf0'; x.font = 'bold 44px serif'; x.textBaseline = 'middle'; for (let i = 0; i < 16; i++) x.fillText(GLY[i % GLY.length], 8 + i * 32, 34); return toTex(c, true, [4, 1]); })();

    // ---- Halo nebuloso ----
    const nebTex = (() => {
      const S = 512, c = mkCv(S, S), x = c.getContext('2d'), C = S / 2;
      const gr = x.createRadialGradient(C, C, 0, C, C, C); gr.addColorStop(0.44, 'rgba(255,120,240,0)'); gr.addColorStop(0.52, 'rgba(255,120,240,.55)'); gr.addColorStop(0.68, 'rgba(140,80,255,.34)'); gr.addColorStop(0.88, 'rgba(60,200,255,.12)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      x.fillStyle = gr; x.fillRect(0, 0, S, S);
      for (let i = 0; i < 180; i++) { const a = rnd() * 6.283, r0 = C * (0.47 + rnd() * 0.1), r1 = C * (0.7 + rnd() * 0.28); x.strokeStyle = 'rgba(' + (rnd() < 0.5 ? '255,170,250' : '150,220,255') + ',' + (0.05 + rnd() * 0.16) + ')'; x.lineWidth = 0.8 + rnd() * 1.6; x.beginPath(); x.moveTo(C + Math.cos(a) * r0, C + Math.sin(a) * r0); x.lineTo(C + Math.cos(a) * r1, C + Math.sin(a) * r1); x.stroke(); }
      return toTex(c, true);
    })();
    const softDot = (() => { const c = mkCv(64, 64), x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.4, 'rgba(255,255,255,.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64); return toTex(c, true); })();

    // ---- Pele dos tentáculos: violeta com ventosas luminosas ----
    const tenTex = (() => {
      const W = 128, H = 256, cm = mkCv(W, H), ce = mkCv(W, H), xm = cm.getContext('2d'), xe = ce.getContext('2d');
      const gr = xm.createLinearGradient(0, 0, W, 0); gr.addColorStop(0, '#2a1250'); gr.addColorStop(0.5, '#5a2aa8'); gr.addColorStop(1, '#2a1250'); xm.fillStyle = gr; xm.fillRect(0, 0, W, H);
      xe.fillStyle = '#000'; xe.fillRect(0, 0, W, H);
      for (let k = 0; k < 8; k++) { xm.fillStyle = 'rgba(150,100,230,.35)'; xm.fillRect(0, k * 32, W, 3); }
      for (let i = 0; i < 46; i++) { const px = rnd() * W, py = rnd() * H, r = 2 + rnd() * 3; xm.fillStyle = 'rgba(20,6,50,.7)'; xm.beginPath(); xm.arc(px, py, r + 1.5, 0, 6.283); xm.fill(); xe.fillStyle = rnd() < 0.5 ? 'rgba(120,230,255,.95)' : 'rgba(255,130,240,.95)'; xe.beginPath(); xe.arc(px, py, r * 0.8, 0, 6.283); xe.fill(); }
      return { map: toTex(cm, true), emi: toTex(ce, true) };
    })();
    const tenMat = () => M({ map: tenTex.map, emissive: '#ffffff', emissiveMap: tenTex.emi, emissiveIntensity: 0.9, roughness: 0.42, metalness: 0.1 });
    const lidTex = (() => {
      const S = 256, c = mkCv(S, S), x = c.getContext('2d'); const gr = x.createLinearGradient(0, 0, S, S); gr.addColorStop(0, '#2a2050'); gr.addColorStop(1, '#120c2a'); x.fillStyle = gr; x.fillRect(0, 0, S, S);
      x.strokeStyle = 'rgba(226,178,86,.85)'; x.lineWidth = 2; for (let i = 0; i < 9; i++) { x.beginPath(); x.moveTo(i * 32, 0); x.lineTo(i * 32 + 16, S); x.stroke(); } for (let j = 0; j < 7; j++) { x.beginPath(); x.moveTo(0, j * 40 + 10); x.lineTo(S, j * 40 + 10); x.stroke(); }
      x.fillStyle = 'rgba(255,155,240,.9)'; x.font = '22px serif'; x.textAlign = 'center'; for (let j = 0; j < 6; j++) for (let i = 0; i < 8; i++) if ((i + j) % 2 === 0) x.fillText(GLY[(i + j) % GLY.length], i * 32 + 16, j * 40 + 36);
      return toTex(c, true, [3, 1]);
    })();

    // ================= CORPO =================
    const body = pivot(0, 2.4, 0);
    const eyeG = pivot(0, 0, 0, body);   // tudo que acompanha o olhar

    // globo ocular úmido
    add(new T.SphereGeometry(1.05, 40, 28), MP({ map: scl.map, emissive: '#ffffff', emissiveMap: scl.emi, emissiveIntensity: 0.85, roughness: 0.32, metalness: 0.0, clearcoat: 1, clearcoatRoughness: 0.08 }), 0, 0, 0, eyeG);
    // íris em cúpula (lente saliente)
    const capR = 1.09, capTheta = 0.68, capRad = capR * Math.sin(capTheta);
    const capGeo = new T.SphereGeometry(capR, 40, 14, 0, Math.PI * 2, 0, capTheta); capGeo.rotateZ(Math.PI / 2);
    { const p = capGeo.attributes.position, uv = capGeo.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, p.getZ(i) / (2 * capRad) + 0.5, p.getY(i) / (2 * capRad) + 0.5); uv.needsUpdate = true; }
    const irisM = M({ map: irisTex, emissive: '#ffffff', emissiveMap: irisTex, emissiveIntensity: 0.62, roughness: 0.25, metalness: 0.1 });
    add(capGeo, irisM, 0, 0, 0, eyeG, true);
    // anel de metal na borda da íris
    const limbo = add(new T.TorusGeometry(capRad * 1.01, 0.034, 10, 64), gold, -capR * Math.cos(capTheta) + 0.005, 0, 0, eyeG, true); limbo.rotation.y = Math.PI / 2;
    // pupila-galáxia
    const pupil = add(new T.CircleGeometry(0.26, 40), new T.MeshBasicMaterial({ map: galTex, side: T.DoubleSide }), -capR - 0.004, 0, 0, eyeG, true); pupil.rotation.y = -Math.PI / 2; pupil.scale.set(0.55, 1.32, 1);
    // córnea de vidro + brilhos
    add(new T.SphereGeometry(1.115, 32, 22), MP({ color: '#ffffff', transparent: true, opacity: 0.1, roughness: 0.02, clearcoat: 1, clearcoatRoughness: 0.02, depthWrite: false }), 0, 0, 0, eyeG, true);
    const hi1 = add(new T.CircleGeometry(0.085, 16), new T.MeshBasicMaterial({ color: '#fff', side: T.DoubleSide }), -1.125, 0.3, 0.22, eyeG, true); hi1.rotation.y = -Math.PI / 2;
    const hi2 = add(new T.CircleGeometry(0.035, 12), new T.MeshBasicMaterial({ color: '#cfe9ff', side: T.DoubleSide }), -1.118, -0.18, -0.26, eyeG, true); hi2.rotation.y = -Math.PI / 2;

    // pálpebras blindadas (cascas de meia-esfera com borda dourada e cílios de cristal)
    const lidMat = M({ map: lidTex, color: '#ffffff', roughness: 0.42, metalness: 0.55, emissive: '#160a30', emissiveIntensity: 0.6, side: T.DoubleSide });
    const mkLid = (sgn) => {
      const hinge = pivot(0, 0, 0, eyeG), L = pivot(0, 0, 0, hinge); L.rotation.x = sgn < 0 ? Math.PI : 0;
      add(new T.SphereGeometry(1.17, 36, 14, 0, Math.PI * 2, 0, Math.PI / 2), lidMat, 0, 0, 0, L);
      const rim = add(new T.TorusGeometry(1.17, 0.055, 8, 48), gold, 0, 0, 0, L); rim.rotation.x = Math.PI / 2;
      const q = new T.Quaternion(), up = new T.Vector3(0, 1, 0);
      for (let k = 0; k < 14; k++) { const a = k / 14 * 6.283, dir = new T.Vector3(Math.cos(a) * 0.78, 0.62, Math.sin(a) * 0.78).normalize(); const len = 0.28 + (k % 2) * 0.16; const sp = add(new T.ConeGeometry(0.06, len, 6), glow(k % 2 ? '#5fc8ff' : '#e060e8', 0.55), Math.cos(a) * 1.19 + dir.x * len / 2, dir.y * len / 2, Math.sin(a) * 1.19 + dir.z * len / 2, L, true); sp.quaternion.setFromUnitVectors(up, dir); }
      return hinge;
    };
    const lidU = mkLid(1), lidD = mkLid(-1);

    // moldura dourada com gemas
    const frame = add(new T.TorusGeometry(1.3, 0.06, 8, 56), gold, -0.1, 0, 0, body); frame.rotation.y = Math.PI / 2;
    const gems = [0, 1, 2, 3].map(i => { const a = i * Math.PI / 2 + Math.PI / 4; return add(new T.OctahedronGeometry(0.13), glow(i % 2 ? '#5fc8ff' : '#e060e8', 0.9), -0.1, Math.cos(a) * 1.3, Math.sin(a) * 1.3, body); });

    // coroa radiante + halo nebuloso atrás do olho (plano YZ)
    const crown = pivot(1.2, 0, 0, body);
    const nebula = add(new T.RingGeometry(1.6, 3.6, 72, 1), new T.MeshBasicMaterial({ map: nebTex, transparent: true, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide, opacity: 0.95 }), 0, 0, 0, crown, true); nebula.rotation.y = -Math.PI / 2;
    for (let i = 0; i < 10; i++) { const a = i / 10 * 6.283, len = (i % 2 ? 0.6 : 1.0), R0 = 2.35; const sp = add(new T.ConeGeometry(0.13, len, 5), glow(i % 3 === 0 ? '#d65ad8' : i % 3 === 1 ? '#4fb6f0' : '#8a5cf0', 0.55), 0, Math.cos(a) * (R0 + len / 2), Math.sin(a) * (R0 + len / 2), crown); sp.rotation.x = a - 0; const base = add(new T.CylinderGeometry(0.2, 0.26, 0.18, 8), gold, 0, Math.cos(a) * (R0 - 0.04), Math.sin(a) * (R0 - 0.04), crown); base.rotation.x = a; }
    // luz suave atrás
    const glowSp = new T.Sprite(new T.SpriteMaterial({ map: softDot, color: '#b04aff', transparent: true, opacity: 0.55, blending: T.AdditiveBlending, depthWrite: false })); glowSp.scale.set(6.2, 6.2, 1); glowSp.position.set(0.8, 0, 0); body.add(glowSp);

    // anéis de runas girando
    const rings = [[1.75, 0.04, 0.9, 0.35], [2.1, 0.038, -0.7, 1.15], [2.45, 0.035, 0.55, 1.95]].map(([R, r, sp, ax]) => { const gr = pivot(0, 0, 0, body); add(new T.TorusGeometry(R, r, 8, 64), M({ color: '#d9a94a', metalness: 0.7, roughness: 0.32, emissive: '#ffffff', emissiveMap: runeEmi, emissiveIntensity: 0.7 }), 0, 0, 0, gr, true); const bead = add(new T.SphereGeometry(0.07, 12, 10), glow('#bfe6ff', 1.0), R, 0, 0, gr, true); gr.rotation.x = ax; gr.rotation.z = ax * 0.7; return { gr, sp, bead, R }; });

    // cristais em órbita
    const shards = []; for (let i = 0; i < 9; i++) { const sh = add(new T.OctahedronGeometry(0.16 + (i % 3) * 0.06), glow(i % 2 ? '#d65ad8' : '#4fb6f0', 0.8), 0, 0, 0, body); sh.scale.y = 1.7; shards.push({ sh, a: i * 0.7, R: 2.9 + (i % 3) * 0.28, sp: 0.42 + (i % 4) * 0.1, y: (i % 3 - 1) * 0.9 }); }

    // poeira de estrelas
    const sp0 = []; for (let i = 0; i < 180; i++) { const a = rnd() * 6.283, r = 1.8 + rnd() * 1.6, y = (rnd() - 0.5) * 3.6; sp0.push(Math.cos(a) * r, y, Math.sin(a) * r); }
    const sgeo = new T.BufferGeometry(); sgeo.setAttribute('position', new T.Float32BufferAttribute(sp0, 3));
    const stars = new T.Points(sgeo, new T.PointsMaterial({ map: softDot, color: '#ffffff', size: 0.14, transparent: true, blending: T.AdditiveBlending, depthWrite: false })); body.add(stars);

    // nervo óptico (massa orgânica atrás do olho)
    [[0.95, -0.35, 0.5], [1.15, -0.95, 0.4], [1.05, -1.45, 0.3]].forEach(([x, y, r], i) => { const b = add(new T.SphereGeometry(r, 20, 16), tenMat(), x, y, 0, body); b.scale.set(1, 0.9, 1); });

    // tentáculos articulados
    const tents = [];
    const NT = 8, NS = 9, SL = 0.34;
    for (let i = 0; i < NT; i++) {
      const a = i / NT * 6.283, root = pivot(Math.cos(a) * 0.5 + 0.15, -0.8, Math.sin(a) * 0.5, body); root.rotation.y = -a;
      let par = root; const joints = [];
      for (let j = 0; j < NS; j++) {
        const r0 = 0.2 * Math.pow(1 - j / NS, 0.9) + 0.04, r1 = 0.2 * Math.pow(1 - (j + 1) / NS, 0.9) + 0.035;
        const jp = pivot(0, j === 0 ? 0 : -SL, 0, par);
        add(new T.CylinderGeometry(r0, r1, SL, 8, 1), tenMat(), 0, -SL / 2, 0, jp);
        add(new T.SphereGeometry(r1 * 1.12, 8, 6), tenMat(), 0, -SL, 0, jp, true);
        joints.push(jp); par = jp;
      }
      const tip = add(new T.SphereGeometry(0.075, 12, 10), glow(i % 2 ? '#5fc8ff' : '#e060e8', 1.0), 0, -SL, 0, par, true);
      tents.push({ joints, ph: i * 0.85, tip });
    }

    A.push((t, dt) => {
      body.position.y = 2.4 + Math.sin(t * 1.3) * 0.14;
      eyeG.rotation.y = Math.sin(t * 0.55) * 0.28; eyeG.rotation.z = Math.sin(t * 0.37 + 1) * 0.07;
      // pisca a cada ~5 s
      const bt = t % 5.2, b = bt < 0.24 ? Math.sin(bt / 0.24 * Math.PI) : 0, open = (0.78 + Math.sin(t * 0.7) * 0.05) * (1 - b);
      lidU.rotation.z = -open * Math.PI / 2; lidD.rotation.z = open * Math.PI / 2;
      pupil.scale.set(0.55 + Math.sin(t * 2.2) * 0.1, 1.32, 1);
      irisM.emissiveIntensity = 0.55 + Math.sin(t * 2.4) * 0.15;
      gems.forEach((m, i) => { m.material.emissiveIntensity = 0.8 + Math.sin(t * 3 + i * 1.6) * 0.3; m.rotation.y += dt * 1.2; });
      crown.rotation.x += dt * 0.12; glowSp.material.opacity = 0.5 + Math.sin(t * 1.7) * 0.08;
      rings.forEach(o => { o.gr.rotation.y += o.sp * dt; });
      shards.forEach(o => { o.a += o.sp * dt; o.sh.position.set(Math.cos(o.a) * o.R, o.y + Math.sin(o.a * 2) * 0.2, Math.sin(o.a) * o.R); o.sh.rotation.y += dt; });
      stars.rotation.y += dt * 0.08;
      tents.forEach(o => { o.joints.forEach((jp, j) => { const w = j / (NS - 1); jp.rotation.z = (j === 0 ? 0.7 : 0.1 - j * 0.02) + Math.sin(t * 1.4 - j * 0.6 + o.ph) * (0.1 + w * 0.2); jp.rotation.x = Math.cos(t * 1.1 - j * 0.5 + o.ph) * (0.08 + w * 0.18); }); o.tip.material.emissiveIntensity = 0.9 + Math.sin(t * 3 + o.ph) * 0.4; });
    });
    return { g, step: (t, dt) => A.forEach(f => f(t, dt)) };
  }

  window.WarBossesHD = {
    build: function (kind, THREE) {
      T = THREE;
      const f = { escorpiao: buildEscorpiao, aranha: buildAranha, automato: buildAutomato, olho: buildOlho }[kind];
      return f ? f() : null;
    }
  };
})();
