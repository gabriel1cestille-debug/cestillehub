/* Efeitos de assinatura: cada dragão tem a sua própria coreografia (carga, disparo, impacto, resíduo), sem repetir o mesmo efeito com outra cor.
   Usa os blocos do ElementalFX e os efeitos portados de Binbun (CC0). Símbolos de chão desenhados em canvas. Orçamento: respeita o limite de itens do ElementalFX. */
(function () {
    'use strict';
    function boot() {
        const T = window.THREE, FX = window.ElementalFX;
        if (!T || !FX || !FX.prototype.bbSlash) return false;
        if (FX.prototype.sigRun) return patchD();
        const P = FX.prototype, V = (x = 0, y = 0, z = 0) => new T.Vector3(x, y, z), rnd = (i, k = 1) => { const s = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return s - Math.floor(s); };
        /* ---------- símbolos de chão (canvas) ---------- */
        const TEX = {};
        function sigilTex(kind, c1, c2) {
            const key = kind + c1 + c2; if (TEX[key] !== undefined) return TEX[key];
            let tex = null;
            try {
                const N = 384, cv = document.createElement('canvas'); cv.width = cv.height = N; const g = cv.getContext('2d'), C = N / 2;
                const grad = g.createLinearGradient(0, 0, N, N); grad.addColorStop(0, c1); grad.addColorStop(1, c2);
                g.strokeStyle = grad; g.fillStyle = c2; g.lineCap = 'round'; g.lineJoin = 'round'; g.shadowColor = c1; g.shadowBlur = 14;
                const circle = (r, w) => { g.lineWidth = w; g.beginPath(); g.arc(C, C, r, 0, Math.PI * 2); g.stroke(); };
                const poly = (r, n, step, rot, w) => { g.lineWidth = w; g.beginPath(); for (let i = 0; i <= n; i++) { const a = rot + i * step * Math.PI * 2 / n; const x = C + Math.cos(a) * r, y = C + Math.sin(a) * r; if (i) g.lineTo(x, y); else g.moveTo(x, y); } g.stroke(); };
                const ticks = (r1, r2, n, w) => { g.lineWidth = w; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; g.beginPath(); g.moveTo(C + Math.cos(a) * r1, C + Math.sin(a) * r1); g.lineTo(C + Math.cos(a) * r2, C + Math.sin(a) * r2); g.stroke(); } };
                const dots = (r, n, rad) => { for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; g.beginPath(); g.arc(C + Math.cos(a) * r, C + Math.sin(a) * r, rad, 0, Math.PI * 2); g.fill(); } };
                if (kind === 'pent') { circle(176, 7); circle(160, 3); circle(120, 2); poly(160, 5, 2, -Math.PI / 2, 6); ticks(164, 182, 40, 3); dots(176, 5, 9); for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * Math.PI * 2 / 5; g.beginPath(); g.arc(C + Math.cos(a) * 160, C + Math.sin(a) * 160, 12, 0, Math.PI * 2); g.stroke(); } }
                else if (kind === 'eye') { circle(178, 6); circle(166, 2); ticks(168, 184, 48, 3); g.lineWidth = 8; g.beginPath(); g.moveTo(C - 150, C); g.quadraticCurveTo(C, C - 118, C + 150, C); g.quadraticCurveTo(C, C + 118, C - 150, C); g.stroke(); circle(46, 8); g.beginPath(); g.arc(C, C, 20, 0, Math.PI * 2); g.fill(); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; if (Math.abs(Math.sin(a)) < .5) continue; g.lineWidth = 3; g.beginPath(); g.moveTo(C + Math.cos(a) * 62, C + Math.sin(a) * 62); g.lineTo(C + Math.cos(a) * 110, C + Math.sin(a) * 110); g.stroke(); } }
                else if (kind === 'astro') { circle(178, 5); circle(150, 3); circle(98, 3); circle(52, 2); ticks(152, 176, 72, 2); ticks(100, 120, 24, 3); poly(150, 3, 1, -Math.PI / 2, 3); poly(150, 3, 1, Math.PI / 2, 3); dots(150, 6, 7); dots(98, 12, 5); for (let i = 0; i < 4; i++) { g.save(); g.translate(C, C); g.rotate(i * Math.PI / 4); g.lineWidth = 2; g.beginPath(); g.ellipse(0, 0, 176, 64, 0, 0, Math.PI * 2); g.stroke(); g.restore(); } }
                else { circle(178, 6); circle(150, 3); circle(110, 3); poly(150, 6, 1, 0, 4); poly(110, 3, 1, -Math.PI / 2, 4); ticks(154, 176, 36, 3); ticks(112, 148, 6, 3); dots(178, 12, 7); }
                tex = new T.CanvasTexture(cv);
            } catch (e) { tex = null; }
            return (TEX[key] = tex);
        }
        const SPL = new T.PlaneGeometry(1, 1);
        /* sigil(p, tipo, cor1, cor2, tamanho, vida, atraso, giro): selo no chão que acende, gira e apaga */
        P.sigil = function (p, kind, c1, c2, size, life, delay, spin) {
            const tex = sigilTex(kind, c1, c2), at = p.clone();
            this.later(delay || 0, () => {
                if (this.items.length >= this.limit) return;
                let mat; if (tex) mat = new T.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false, blending: T.AdditiveBlending, side: T.DoubleSide, opacity: 0 });
                else mat = new T.MeshBasicMaterial({ color: new T.Color(c1).convertSRGBToLinear(), transparent: true, depthWrite: false, toneMapped: false, wireframe: true, opacity: 0 });
                const mesh = new T.Mesh(tex ? SPL : new T.RingGeometry(.4, .5, 48), mat); mesh.rotation.x = -Math.PI / 2; this.scene.add(mesh);
                this.items.push({ mesh, life, age: 0, owned: !tex, update: (m, t) => { m.position.copy(at); m.position.y = .06; m.rotation.z = (spin || 0) * t * Math.PI * 2 * .5; const k = Math.min(1, t * 5), f = t > .72 ? (1 - t) / .28 : 1; m.scale.setScalar(size * (.55 + .45 * k)); m.material.opacity = Math.min(1, k * 1.2) * f; } });
            });
        };
        /* estrela de cinco pontas (confete, estilhaços de cometa) */
        const STAR = (() => { const s = new T.Shape(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? .38 : 1; i ? s.lineTo(Math.cos(a) * r, Math.sin(a) * r) : s.moveTo(Math.cos(a) * r, Math.sin(a) * r); } s.closePath(); return new T.ShapeGeometry(s); })();
        /* faísca em sprite que viaja de um ponto a outro */
        P.sigMote = function (p0, p1, color, size, life, delay, ease) {
            this.later(delay || 0, () => this.add(null, color, life, (m, t) => { const k = ease ? t * t : t; m.position.copy(p0).lerp(p1, k); m.scale.setScalar(size * (1 - t * .4)); m.material.opacity = Math.sin(Math.min(1, t) * Math.PI) * .95; }));
        };
        /* trinca irregular no chão a partir do centro */
        P.sigCrack = function (c, ang, len, color, delay) {
            const pts = [c.clone().setY(.1)]; let p = c.clone().setY(.1), a = ang;
            for (let i = 1; i <= 6; i++) { a += (rnd(i, ang) - .5) * .9; p = p.clone().add(V(Math.cos(a) * len / 6, 0, Math.sin(a) * len / 6)); pts.push(p); }
            this.later(delay || 0, () => { this.path(pts, color, .05, .9); this.path(pts, '#ffffff', .015, .6); });
        };

        const SIG = {};
        /* ================= LENDÁRIOS: ESPECIAIS ================= */
        /* Eclipse Gravitacional: um disco negro eclipsa o alvo, a coroa se acende, a poeira é sugada e tudo colapsa */
        SIG.eclipse = {
            s(a, b, c1, c2) {
                const g = b.clone().setY(.14), top = b.clone().add(V(0, 3, .3));
                this.glow(a, c2, 1.3, .3); this.ring(a, c1, .9, .4, false); this.ring(a, c2, 1.3, .5, false, .08);
                this.bbVortex(g, c1, c2, { size: 6.6, life: 2.2, delay: .1 });
                const disc = new T.CircleGeometry(1, 64), corona = new T.RingGeometry(1.02, 1.42, 64);
                const place = (m, k) => { m.position.copy(top); m.rotation.set(-.5, 0, 0); m.scale.setScalar(2.2 * k + .01); };
                const env = t => Math.sin(Math.min(1, t * 1.7) * Math.PI / 2) * (1 - Math.max(0, (t - .72) / .28));
                this.add(disc, '#050010', 2.5, (m, t) => { place(m, env(t)); m.material.opacity = Math.min(1, t * 7); }, { owned: true });
                this.add(corona, c2, 2.5, (m, t) => { place(m, env(t)); m.material.opacity = Math.min(.95, t * 6) * (.75 + Math.sin(t * 40) * .25); }, { owned: true });
                this.glow(top, c1, 7, 2.2);
                for (let i = 0; i < 18; i++) { const ang = i / 18 * Math.PI * 2 + rnd(i) * .2, r0 = 2.5 * 1.05, r1 = r0 + .7 + rnd(i, 2) * 1.5; this.later(.35 + i * .012, () => this.path([top.clone().add(V(Math.cos(ang) * r0, Math.sin(ang) * r0 * .87, Math.sin(ang) * r0 * .5)), top.clone().add(V(Math.cos(ang) * r1, Math.sin(ang) * r1 * .87, Math.sin(ang) * r1 * .5))], i % 2 ? c2 : '#ffffff', .03, 1.1)); }
                for (let i = 0; i < 30; i++) { const ang = rnd(i, 4) * Math.PI * 2, r = 3.8 + rnd(i, 5) * 1.6, st = top.clone().add(V(Math.cos(ang) * r, (rnd(i, 6) - .5) * 3 + .6, Math.sin(ang) * r * .7)); this.sigMote(st, top, i % 2 ? c1 : c2, .22 + rnd(i, 7) * .18, .9 + rnd(i, 8) * .4, .25 + rnd(i, 9) * .6, true); }
                this.later(1.5, () => {
                    this.glow(top, '#ffffff', 9, .35); this.glow(top, c2, 6, .6); this.glow(g, c1, 5, .5);
                    for (let k = 0; k < 5; k++) this.ring(g.clone().setY(.12 + k * .05), k % 2 ? c1 : c2, 3.2 + k * .85, .85 + k * .05, true, k * .06);
                    for (let k = 0; k < 10; k++) this.sigCrack(g, k / 10 * Math.PI * 2, 3.4, k % 2 ? c1 : c2, k * .015);
                    this.column(g, c1, 5.5, 1.1, .8, .02); this.burst(g, c2, 44, 1.2); this.burst(top, c1, 24, .9);
                });
                return 2.6;
            }
        };
        /* Revoada Sombria: o grito abre a revoada, os morcegos giram, orbitam o alvo e se despedaçam em sombra */
        SIG.morcego = {
            s(a, b, c1, c2) {
                const g = b.clone().setY(.14), n = 15, dur = 1.15;
                for (let i = 0; i < 3; i++) this.ring(a, i % 2 ? c1 : c2, .8 + i * .4, .5, false, i * .1);
                this.glow(a, c2, 1.7, .35);
                for (let i = 0; i < n; i++) {
                    const ph = i / n * Math.PI * 2, r = .5 + (i % 4) * .28, delay = i * .04, A = a.clone().add(V(0, (i % 3) * .08, (i % 5 - 2) * .1)), B = b.clone().setY(.9);
                    this.later(delay, () => {
                        const bat = this.add(this.g.bat, i % 3 ? '#4a1f9e' : '#1a0b33', dur, (m, t) => {
                            let p; if (t < .55) { const u = t / .55; p = A.clone().lerp(B, u); p.add(V(Math.cos(ph + u * 9) * r * (1 - u * .6), Math.sin(ph * 2 + u * 7) * r * .55 + Math.sin(u * Math.PI) * .8, Math.sin(ph + u * 9) * r * (1 - u * .6))); }
                            else if (t < .86) { const u = (t - .55) / .31, ang = ph + u * 7; p = B.clone().add(V(Math.cos(ang) * 1.3, Math.sin(u * 6 + i) * .35, Math.sin(ang) * 1.3)); }
                            else { const u = (t - .86) / .14, ang = ph + 7; p = B.clone().add(V(Math.cos(ang) * (1.3 + u * 2.4), u * 1.4, Math.sin(ang) * (1.3 + u * 2.4))); }
                            m.position.copy(p); m.rotation.set(0, ph + t * 9, Math.sin(t * 30 + i) * .45); m.scale.setScalar(.9 * (1 - Math.max(0, (t - .9) / .1))); m.scale.y *= 1 + Math.sin(t * 90 + i) * .5;
                        });
                        for (let k = 1; k <= 3; k++) this.later(k * .08, () => this.glow(A.clone().lerp(B, Math.min(1, k * .2 + .1)).add(V(0, .3, 0)), i % 2 ? c1 : c2, .5, .35));
                    });
                }
                this.bbVortex(g, '#5a2bd6', c2, { size: 5, delay: .5, life: 1.3 });
                this.later(.62, () => { this.cloud(b.clone().add(V(0, .8, 0)), '#1b0a33', 1.7, 1.8, .6); this.glow(b.clone().setY(.9), c2, 3, .4); for (let k = 0; k < 3; k++) this.ring(g.clone().setY(.12 + k * .04), k % 2 ? c1 : c2, 2.2 + k * .7, .7, true, k * .07); });
                this.later(.98, () => { this.burst(b.clone().setY(.8), c1, 40, 1.1); this.burst(b.clone().setY(.8), c2, 20, .8); this.impactFan(b, c1, 1.6); });
                return 1.9;
            }
        };
        /* Cometa Celestial: um cometa dourado cai do céu, cratera de estrelas e chuva de brilho */
        SIG.hamster = {
            s(a, b, c1, c2) {
                const g = b.clone().setY(.15), start = b.clone().add(V(-6.4, 9, -1.8)), dur = .95;
                this.glow(a, c2, 1.5, .3); for (let i = 0; i < 3; i++) this.ring(a, c1, .5 + i * .25, .4, false, i * .07);
                this.add(this.g.orb, '#ffb347', dur, (m, t) => { m.position.copy(start).lerp(b, t * t * .55 + t * .45); m.scale.setScalar(1 + Math.sin(t * 36) * .07); m.material.opacity = 1; }, { energy: true });
                this.flameTail(start, b, '#ff9a2a', dur, 0, 2); this.flameTail(start.clone().add(V(0, .5, .5)), b, c2, dur * .9, 0, 1.2);
                for (let k = 0; k < 3; k++) this.ribbon(start.clone().add(V(0, .2 * k, (k - 1) * .45)), b.clone().add(V(0, .1 * k, (k - 1) * .3)), k % 2 ? c1 : c2, { waves: 5, height: .15, spread: .12, width: .05, life: dur + .2 });
                for (let i = 0; i < 22; i++) { const u = rnd(i) * .9, p0 = start.clone().lerp(b, u * u * .55 + u * .45).add(V((rnd(i, 3) - .5) * .8, (rnd(i, 4) - .5) * .8, (rnd(i, 5) - .5) * .8)); this.sigMote(p0, p0.clone().add(V(-.6, -.9, 0)), i % 2 ? c1 : c2, .16 + rnd(i, 6) * .12, .6, u * dur * .85); }
                this.later(dur, () => {
                    this.bbExplosion(g, '#ff8a1f', '#fff0b0', { size: 3.1 }); this.glow(b, '#ffffff', 7, .35);
                    for (let k = 0; k < 5; k++) this.ring(g.clone().setY(.12 + k * .05), k % 2 ? c1 : c2, 2.6 + k * .8, .9, true, k * .06);
                    this.column(g, c2, 5, 1, .7, .03);
                    for (let i = 0; i < 18; i++) {
                        const ang = i * 2.399, dir = V(Math.cos(ang) * (1.3 + rnd(i) * 2), 2.4 + rnd(i, 2) * 2.2, Math.sin(ang) * (1.3 + rnd(i, 3) * 2)), sz = .16 + rnd(i, 4) * .22, col = i % 3 ? c2 : c1, spin = (rnd(i, 5) - .5) * 14;
                        this.add(STAR, col, 1.5, (m, t) => { m.position.copy(g).addScaledVector(dir, t * .9); m.position.y = .2 + dir.y * t * .9 - t * t * 4.6 * .5 * 1.3; if (m.position.y < .12) m.position.y = .12; m.rotation.set(-1.2, 0, t * spin); m.scale.setScalar(sz * (1 - t * .3)); m.material.opacity = 1 - t * t; });
                    }
                    for (let i = 0; i < 36; i++) { const x = (rnd(i, 7) - .5) * 6.2, z = (rnd(i, 8) - .5) * 4.4, y0 = 4.5 + rnd(i, 9) * 2; this.sigMote(g.clone().add(V(x, y0, z)), g.clone().add(V(x, .15, z)), i % 2 ? c1 : c2, .12 + rnd(i, 1) * .1, .7 + rnd(i, 2) * .5, rnd(i, 3) * .7); }
                    this.burst(g, c2, 30, 1);
                });
                return dur + 1.4;
            }
        };
        /* Olhar do Julgamento: o selo do olho se abre no chão e a luz desce do céu como sentença */
        SIG.vigia = {
            s(a, b, c1, c2) {
                const g = b.clone().setY(.14), sky = b.clone().add(V(.5, 9.5, 0));
                this.glow(a, c2, 1.3, .3); this.ring(a, c1, .9, .4, false);
                this.bbBeam(a, b.clone().setY(.15), c1, c2, { life: .6, thick: .09 });
                this.sigil(g, 'eye', c1, c2, 6.6, 2.5, .05, .5); this.sigil(g, 'astro', c2, c1, 3.8, 2.2, .2, -.9);
                this.later(.6, () => {
                    this.bbBeam(sky, g, c1, '#ffffff', { life: 1.15, thick: .66 });
                    this.column(g, c2, 9, 1.05, .9, 0); this.column(g, c1, 8, 1.3, 1.5, .04);
                    this.glow(b.clone().setY(1), '#ffffff', 7, .4);
                    for (let k = 0; k < 5; k++) this.ring(g.clone().setY(.14 + k * .05), k % 2 ? c1 : c2, 2.8 + k * .85, .85 + k * .04, true, k * .07);
                    for (let i = 0; i < 20; i++) { const ang = i / 20 * Math.PI * 2, rr = 1.2 + rnd(i) * 1.8, x0 = Math.cos(ang) * rr, z0 = Math.sin(ang) * rr; this.add(this.g.shard, i % 2 ? c2 : '#ffffff', 1.3, (m, t) => { m.position.set(g.x + x0 * (1 + t * .4), 6.4 * (1 - t) + .2, g.z + z0 * (1 + t * .4)); m.rotation.set(t * 4 + i, t * 3, 0); m.scale.set(.07, .5 + rnd(i, 2) * .4, .07); m.material.opacity = Math.sin(t * Math.PI) * .9; }); }
                    this.burst(g, c2, 40, 1.1); this.burst(g, '#ffffff', 16, .7);
                });
                return 2.3;
            }
        };
        /* Juízo de Magma: pentagrama de lava, cinco erupções e o jorro central */
        SIG.demonio_cinzas = {
            s(a, b, c1, c2) {
                const g = b.clone().setY(.14), R = 2.55, pts = []; for (let k = 0; k < 5; k++) { const an = -Math.PI / 2 + k * Math.PI * 2 / 5; pts.push(g.clone().add(V(Math.cos(an) * R, 0, Math.sin(an) * R * .8))); }
                this.glow(a, c2, 1.5, .3); this.ring(a, c1, 1, .45, false); this.ring(a, c2, 1.4, .5, false, .08);
                this.sigil(g, 'pent', '#ff3b24', '#ffd08a', 7.4, 2.5, 0, .35);
                for (let k = 0; k < 5; k++) this.later(.18 + k * .07, () => this.ribbon(pts[k], pts[(k + 2) % 5], '#ff6a1f', { height: .05, waves: 7, spread: .1, width: .085, life: 1.9 }));
                for (let k = 0; k < 5; k++) this.later(.6 + k * .12, () => { this.geyser(pts[k], '#ff3b14', '#ffc34a', 3.6, 0); this.column(pts[k], '#ff5a1c', 4.4, .95, .42); this.ring(pts[k], '#ff8a2a', 1.4, .6); this.burst(pts[k], '#ffb347', 10, .7); });
                this.later(1.4, () => {
                    this.bbExplosion(g, '#ff3b14', '#ffd08a', { size: 3.4 }); this.geyser(g, '#ff3b14', '#ffd08a', 6.6); this.column(g, '#ff7a1f', 7.2, 1.25, 1.05); this.glow(g.clone().setY(1.2), '#ffd08a', 7, .45);
                    for (let k = 0; k < 4; k++) this.ring(g.clone().setY(.12 + k * .05), k % 2 ? '#ff4a20' : '#ffb347', 3 + k * .85, .9, true, k * .06);
                    for (let i = 0; i < 8; i++) this.shot(g.clone().add(V(0, 3.2, 0)), g.clone().add(V(Math.cos(i * 2.4) * 2.7, 0, Math.sin(i * 2.4) * 2.2)), { color: '#ff5b16', kind: 'rock', size: .28, arc: 2.2, duration: .9, energy: true, magma: true });
                    this.cloud(g.clone().add(V(0, 3.2, 0)), '#3a2020', 2.7, 3, .7);
                });
                return 2.7;
            }
        };
        /* Chuva de Bigornas: cinco bigornas desabam sobre o selo, cada uma abre trincas e levanta poeira */
        SIG.colosso_obsidiana = {
            s(a, b, c1, c2) {
                const g = b.clone().setY(.14), spots = [[0, 0], [1.9, .9], [-1.8, 1.0], [1.5, -1.2], [-1.6, -1.1]];
                this.glow(a, c2, 1.4, .3); this.ring(a, c1, 1.1, .45, false);
                this.sigil(g, 'rune', c1, c2, 6.8, 2.3, 0, .4);
                spots.forEach(([x, z], i) => {
                    const end = g.clone().add(V(x, 0, z)), start = end.clone().add(V(0, 8.2, 0)), d0 = .3 + i * .21;
                    this.later(d0, () => {
                        this.path([start, end.clone().setY(.5)], c2, .045, .5);
                        this.add(this.g.anvil, '#3a2f55', .56, (m, t) => { m.position.copy(start).lerp(end, Math.min(1, t * t * 1.15)); m.position.y += .55; m.rotation.set(.25, .6 + i, 0); m.scale.setScalar(1.25); m.material.opacity = t > .9 ? (1 - t) * 10 : 1; });
                        this.add(this.g.anvil, c2, .56, (m, t) => { m.position.copy(start).lerp(end, Math.min(1, t * t * 1.15)); m.position.y += .55; m.rotation.set(.25, .6 + i, 0); m.scale.setScalar(1.31); m.material.opacity = (t > .9 ? (1 - t) * 10 : 1) * .28; });
                    });
                    this.later(d0 + .5, () => { const big = i === 0; this.ring(end, c2, big ? 3.4 : 2.1, .7, true); this.ring(end, c1, big ? 4.6 : 3, .85, true, .05); this.burst(end, c2, big ? 22 : 14, big ? 1 : .7); this.cloud(end.clone().add(V(0, .5, 0)), '#7a6a58', big ? 1.4 : .9, 1.3, .3); this.glow(end.clone().setY(.4), '#ffffff', big ? 3.4 : 2, .22); for (let k = 0; k < 5; k++) this.sigCrack(end, k / 5 * Math.PI * 2 + i, big ? 2.4 : 1.6, c2, k * .01); });
                });
                this.later(1.45, () => { for (let k = 0; k < 4; k++) this.ring(g.clone().setY(.12 + k * .05), k % 2 ? c1 : c2, 3.6 + k * .9, .9, true, k * .06); this.column(g, c2, 4, .9, .7); this.burst(g, c1, 30, 1); });
                return 2.2;
            }
        };
        /* Prisma Astral: constelação, prisma de energia e sete feixes que se juntam no alvo */
        SIG.arquimago_astral = {
            s(a, b, c1, c2) {
                const g = b.clone().setY(.14), top = b.clone().add(V(0, 3.5, 0)), cols = ['#ff4d6d', '#ffa94d', '#ffe14d', '#6dff8a', '#4dd2ff', '#6d7bff', '#c46dff'];
                this.glow(a, c2, 1.4, .3); this.ring(a, c1, 1, .45, false);
                this.sigil(g, 'astro', c1, c2, 7.2, 2.5, 0, .4);
                const st = []; for (let k = 0; k < 9; k++) { const an = k / 9 * Math.PI * 2; st.push(top.clone().add(V(Math.cos(an) * 3, Math.sin(an) * 1.7 + .3, Math.sin(an) * .8))); }
                st.forEach((p, k) => { this.later(k * .06, () => this.glow(p, '#ffffff', .6, 1.6)); this.later(.15 + k * .06, () => this.path([p, st[(k + 1) % 9]], c2, .02, 1.3)); this.later(.3 + k * .05, () => this.path([p, st[(k + 3) % 9]], c1, .012, 1.0)); });
                this.later(.4, () => {
                    this.bbBeam(a, top, c1, c2, { life: .6, thick: .12 });
                    const pr = new T.CylinderGeometry(.55, .55, 1.7, 3);
                    this.add(pr, c2, 1.8, (m, t) => { m.position.copy(top); m.rotation.set(0, t * 7, Math.sin(t * 4) * .15); const k = Math.min(1, t * 6) * (1 - Math.max(0, (t - .85) / .15)); m.scale.setScalar(k); }, { energy: true, owned: true });
                    this.glow(top, '#ffffff', 3.2, 1.6);
                });
                this.later(1, () => {
                    for (let k = 0; k < 7; k++) { const tgt = g.clone().add(V((k - 3) * .9, 0, (k % 2 ? .6 : -.6))); this.bbBeam(top, tgt, cols[k], '#ffffff', { life: .85, thick: .11 }); this.later(.12, () => { this.ring(tgt, cols[k], 1.2, .6, true); this.glow(tgt.clone().setY(.3), cols[k], 1.4, .5); }); }
                });
                this.later(1.65, () => {
                    this.bbExplosion(g, '#8e9dff', '#ffffff', { size: 3 }); this.glow(g.clone().setY(1), '#ffffff', 7, .4);
                    for (let k = 0; k < 7; k++) this.ring(g.clone().setY(.12 + k * .04), cols[k], 2.6 + k * .55, .9, true, k * .05);
                    this.column(g, c2, 5, 1, .8); this.burst(g, '#ffffff', 36, 1.1);
                });
                return 2.7;
            }
        };


        /* ================= NORMAIS ÚNICOS (antes compartilhavam código) ================= */
        const C = Math.cos, S = Math.sin, PI = Math.PI;
        P.sigRings = function (p, c1, c2, base, n, delay) { for (let k = 0; k < n; k++) this.ring(p.clone().setY(.12 + k * .05), k % 2 ? c1 : c2, base + k * .8, .85, true, (delay || 0) + k * .06); };
        const faceYaw = (a, b) => Math.atan2(b.x - a.x, b.z - a.z);
        /* Lança de Gelo Facetado (Sereia): três lâminas de gelo empilhadas, neblina e flor de gelo no impacto */
        SIG.sereia_glacial = { n(a, b, c1, c2) {
            const g = b.clone().setY(.14), d = b.clone().sub(a), yaw = faceYaw(a, b), q = new T.Quaternion().setFromUnitVectors(V(0, 1, 0), d.clone().normalize());
            this.glow(a, c2, .9, .3); for (let i = 0; i < 6; i++) { const an = i / 6 * PI * 2; this.sigMote(a.clone().add(V(C(an) * .5, S(an) * .5, 0)), a, c2, .14, .3, 0); }
            [[0, 1], [.1, .8], [.2, .6]].forEach(([dl, sc], k) => this.later(dl, () => this.add(this.g.shard, k % 2 ? c2 : '#ffffff', .46, (m, t) => { m.position.copy(a).lerp(b, t); m.quaternion.copy(q); m.scale.set(.1 * sc, 1.1 * sc, .1 * sc); m.material.opacity = .95; })));
            this.ribbon(a, b, c1, { waves: 3, height: .05, spread: .08, width: .05, life: .55 });
            this.later(.46, () => { this.cloud(b.clone().add(V(0, .5, 0)), '#d8f6ff', 1.1, 1.4, .4); this.ring(g, c2, 1.8, .6, true); for (let i = 0; i < 7; i++) { const an = i / 7 * PI * 2; this.pillar(g.clone().add(V(C(an) * .8, 0, S(an) * .8)), i % 2 ? c1 : c2, 1.2 + rnd(i) * .7, i * .02); } this.burst(g, c2, 14, .7); });
            return .9; } };
        /* Lanças de Cristal (Prisma): três cristais giram na boca e disparam em leque com rastros em arco-íris */
        SIG.prisma = { n(a, b, c1, c2) {
            const g = b.clone().setY(.14), cols = ['#ff6b9a', '#6bd6ff', '#fff06b'];
            this.glow(a, c2, 1, .45); this.ring(a, c1, .7, .45, false);
            for (let k = 0; k < 3; k++) { const off = (k - 1) * .55, tgt = b.clone().add(V(0, 0, off)), d = tgt.clone().sub(a), q = new T.Quaternion().setFromUnitVectors(V(0, 1, 0), d.clone().normalize());
                this.later(.18 + k * .07, () => { this.add(this.g.shard, c2, .42, (m, t) => { m.position.copy(a).lerp(tgt, t); m.quaternion.copy(q); m.scale.set(.12, .8, .12); m.rotation.z += t * 8; m.material.opacity = 1; }); this.ribbon(a, tgt, cols[k], { waves: 4, height: .1, spread: .07, width: .045, life: .5 }); this.later(.42, () => { this.ring(tgt.clone().setY(.14), cols[k], 1.1, .5, true); this.glow(tgt, cols[k], 1.2, .3); this.burst(tgt, cols[k], 8, .5); }); }); }
            return .8; } };
        /* Canhão de Rebites (Bronze): clarão e fumaça, rajada metálica, chuva de faíscas */
        SIG.bronze = { n(a, b, c1, c2) {
            const g = b.clone().setY(.14);
            this.glow(a, '#ffd08a', 1.3, .2); this.cloud(a.clone().add(V(.5, 0, 0)), '#6b5b4a', .5, .8, .3); this.burst(a, '#ffb347', 10, .5);
            for (let i = 0; i < 5; i++) { const tgt = b.clone().add(V((rnd(i) - .5) * .5, 0, (i - 2) * .25)), d = tgt.clone().sub(a), q = new T.Quaternion().setFromUnitVectors(V(0, 1, 0), d.clone().normalize());
                this.later(i * .07, () => { this.add(this.g.shard, i % 2 ? '#c88a45' : '#e8c27a', .32, (m, t) => { m.position.copy(a).lerp(tgt, t); m.position.y += Math.sin(t * PI) * .15; m.quaternion.copy(q); m.scale.set(.06, .38, .06); m.material.opacity = 1; }); this.later(.32, () => { this.burst(tgt, '#ffb347', 7, .5); this.ring(tgt.clone().setY(.14), '#c88a45', .5, .35, true); this.glow(tgt, '#ffd08a', .7, .15); }); }); }
            return .75; } };
        /* Salva de Engrenagens (Crono): engrenagens douradas giram em arco e o anel do tempo marca o impacto */
        SIG.crono_engenheiro = { n(a, b, c1, c2) {
            const g = b.clone().setY(.14);
            this.glow(a, c1, 1, .3); this.ring(a, c2, .8, .4, false);
            for (let i = 0; i < 4; i++) this.later(i * .09, () => { this.add(this.g.gear, i % 2 ? c1 : c2, .6, (m, t) => { m.position.copy(a).lerp(b, t); m.position.y += Math.sin(t * PI) * (.6 + i * .12); m.rotation.set(1.2, 0, t * 14 * (i % 2 ? 1 : -1)); m.scale.setScalar(.8 + i * .08); m.material.opacity = 1; }); for (let k = 0; k < 4; k++) this.later(k * .12, () => this.glow(a.clone().lerp(b, k * .25 + .08).add(V(0, .5, 0)), c1, .3, .3)); });
            this.later(.62, () => { this.add(this.g.ring, c2, .9, (m, t) => { m.position.copy(g).setY(1); m.rotation.set(0, .7, t * 2); m.scale.setScalar(.4 + t * 1.5); m.material.opacity = 1 - t; }); for (let k = 0; k < 12; k++) { const an = k / 12 * PI * 2; this.path([g.clone().add(V(C(an) * .9, 1 + S(an) * .9, 0)), g.clone().add(V(C(an) * 1.1, 1 + S(an) * 1.1, 0))], '#ffffff', .025, .7); } this.burst(g, c1, 14, .7); });
            return 1.1; } };
        /* Lâminas de Vento (Brisa): três crescentes de ar com folhas e poeira */
        SIG.brisa = { n(a, b, c1, c2) {
            this.glow(a, c2, .8, .25);
            for (let k = 0; k < 3; k++) { const o = V(0, 0, (k - 1) * .7); this.later(k * .1, () => { this.bbWaveShot(a.clone().add(o.clone().multiplyScalar(.3)), b.clone().add(o), k % 2 ? c1 : c2, { dur: .55, size: 1.9 }); }); }
            for (let i = 0; i < 12; i++) { const p0 = a.clone().lerp(b, rnd(i) * .8).add(V(0, rnd(i, 2) * 1.1, (rnd(i, 3) - .5) * 1.8)); this.sigMote(p0, p0.clone().add(V(1.2, .3, (rnd(i, 4) - .5) * .8)), i % 2 ? '#d9ffe9' : c1, .1, .6, rnd(i, 5) * .4); }
            return .75; } };
        /* Brisa Boreal (Aurora): fita ondulante de três cores com brilho de estrelas */
        SIG.aurora = { n(a, b, c1, c2) {
            const g = b.clone().setY(.14), cols = ['#6bff9a', c1, '#6bd6ff'];
            this.glow(a, c2, 1, .35);
            cols.forEach((col, k) => this.ribbon(a.clone().add(V(0, k * .12, 0)), b.clone().add(V(0, k * .1, (k - 1) * .5)), col, { waves: 8, height: .5, spread: .18, width: .07, life: .85 }));
            for (let i = 0; i < 14; i++) { const p0 = a.clone().lerp(b, rnd(i) * .9).add(V(0, .3 + rnd(i, 2) * .9, (rnd(i, 3) - .5) * 1.2)); this.glow(p0, '#ffffff', .22, .5 + rnd(i, 4) * .3); }
            this.later(.6, () => { for (let k = 0; k < 3; k++) this.ring(g.clone().setY(.14 + k * .05), cols[k], 1.2 + k * .5, .8, true, k * .08); this.glow(b, c1, 2.2, .5); });
            return 1; } };
        /* Onda Ultrassônica (Morcego): anéis de pulso viajam pelo ar com três morcegos na frente */
        SIG.morcego.n = function (a, b, c1, c2) {
            const g = b.clone().setY(.14), yaw = faceYaw(a, b);
            for (let k = 0; k < 7; k++) this.later(k * .07, () => this.add(this.g.ring, k % 2 ? c1 : c2, .58, (m, t) => { m.position.copy(a).lerp(b, t); m.rotation.set(0, yaw, 0); m.scale.setScalar(.35 + t * 1.3 + k * .08); m.material.opacity = Math.sin(t * PI) * .9; }));
            for (let i = 0; i < 3; i++) this.later(i * .05, () => this.add(this.g.bat, '#2a1250', .6, (m, t) => { m.position.copy(a).lerp(b, t).add(V(0, .3 + S(t * 9 + i) * .3, (i - 1) * .35)); m.rotation.set(0, yaw + PI / 2, S(t * 40 + i) * .4); m.scale.setScalar(.75); }));
            this.later(.6, () => { this.ring(g, c2, 1.6, .5, true); this.ring(g, c1, 1.1, .4, true, .06); this.burst(b, c1, 12, .6); });
            return .8; };
        /* Pulso Ultrassônico Triplo (Morcego Noturno): três pings de sonar com eco no chão */
        SIG.morcego_noturno = { n(a, b, c1, c2) {
            const g = b.clone().setY(.14);
            for (let k = 0; k < 3; k++) this.later(k * .16, () => { const tgt = b.clone().add(V(0, 0, (k - 1) * .6)); this.glow(a, c1, .7, .2); this.add(null, k % 2 ? c1 : c2, .45, (m, t) => { m.position.copy(a).lerp(tgt, t); m.scale.setScalar(.45); m.material.opacity = 1; }); for (let j = 1; j <= 4; j++) this.later(j * .07, () => this.glow(a.clone().lerp(tgt, j * .2).add(V(0, 0, 0)), c1, .3, .3)); this.later(.45, () => { this.ring(tgt.clone().setY(.14), c2, 1.3, .6, true); this.ring(tgt.clone().setY(.14), c1, 2, .8, true, .12); this.burst(tgt, c1, 8, .5); }); });
            return 1; } };
        /* Espinhos de Raízes Vivas (Guardião): raízes rasgam o chão até o alvo */
        SIG.guardiao_botanico = { n(a, b, c1, c2) {
            const g = b.clone().setY(.14);
            this.ring(a.clone().setY(.14), c1, .9, .4, true);
            for (let k = 0; k < 7; k++) { const u = (k + 1) / 7, p = a.clone().lerp(b, u).setY(.14).add(V(0, 0, S(k * 1.7) * .25)); this.pillar(p, k % 2 ? c1 : '#7a4a22', 1 + u * 1.1, k * .06, 'rock'); this.later(k * .06, () => { this.burst(p, c2, 5, .4); this.add(this.g.leaf, c2, .7, (m, t) => { m.position.copy(p).add(V(0, .6 + t * 1.2, 0)); m.rotation.set(t * 5, t * 4, 0); m.scale.setScalar(.3); m.material.opacity = 1 - t; }); }); }
            this.ribbon(a.clone().setY(.2), b.clone().setY(.2), '#5aa83a', { waves: 6, height: .12, spread: .2, width: .08, life: .9 });
            this.later(.5, () => { this.ring(g, c2, 1.6, .6, true); this.burst(g, c1, 12, .7); });
            return .95; } };
        /* Espinhos Vivos (Floresta): saraivada de espinhos em arco, pétalas e flor que se abre */
        SIG.floresta = { n(a, b, c1, c2) {
            const g = b.clone().setY(.14);
            this.glow(a, c2, .8, .25);
            for (let i = 0; i < 6; i++) { const tgt = b.clone().add(V((rnd(i) - .5) * .5, 0, (i - 2.5) * .28)), d = tgt.clone().sub(a), q = new T.Quaternion().setFromUnitVectors(V(0, 1, 0), d.clone().normalize()); this.later(i * .05, () => { this.add(this.g.shard, i % 2 ? c1 : '#d6ff9a', .5, (m, t) => { m.position.copy(a).lerp(tgt, t); m.position.y += S(t * PI) * .7; m.quaternion.copy(q); m.scale.set(.05, .42, .05); m.material.opacity = 1; }); this.later(.5, () => this.burst(tgt, c2, 4, .35)); }); }
            this.later(.55, () => { for (let i = 0; i < 8; i++) { const an = i / 8 * PI * 2; this.add(this.g.leaf, i % 2 ? '#ffb3d1' : '#ffe6f0', .9, (m, t) => { m.position.copy(g).add(V(C(an) * (.2 + t * 1.1), .15 + S(t * PI) * .5, S(an) * (.2 + t * 1.1))); m.rotation.set(1.4, an, 0); m.scale.setScalar(.36 * (1 - t * .3)); m.material.opacity = 1 - t * t; }); } this.glow(g.clone().setY(.4), '#fff1b0', 1.3, .5); });
            return .95; } };
        /* Esferas Rúnicas (Sábio): três orbes de runa orbitam e disparam, deixando selos no impacto */
        SIG.sabio = { n(a, b, c1, c2) {
            const g = b.clone().setY(.14);
            this.glow(a, c2, 1, .5);
            for (let k = 0; k < 3; k++) { const ph = k * PI * 2 / 3, tgt = b.clone().add(V(0, 0, (k - 1) * .7)); this.later(.28 + k * .1, () => { this.add(this.g.orb, k % 2 ? c1 : c2, .5, (m, t) => { m.position.copy(a).lerp(tgt, t); m.position.y += S(t * PI) * .35; m.scale.setScalar(.2); m.material.opacity = 1; }, { energy: true }); this.later(.5, () => { this.sigil(tgt.clone().setY(.14), 'rune', c1, c2, 2.2, .9, 0, 1.2); this.burst(tgt, c2, 8, .5); }); });
              this.add(this.g.orb, c1, .28, (m, t) => { const an = ph + t * 9; m.position.copy(a).add(V(C(an) * .45, .1 + S(an) * .25, S(an) * .45)); m.scale.setScalar(.14); m.material.opacity = 1; }, { energy: true }); }
            return 1; } };
        /* Orbe Astrolábio (Arquimago): um orbe com dois anéis armilares girando e constelação no impacto */
        SIG.arquimago_astral.n = function (a, b, c1, c2) {
            const g = b.clone().setY(.14), dur = .6;
            this.glow(a, c2, 1, .4);
            this.add(this.g.orb, c1, dur, (m, t) => { m.position.copy(a).lerp(b, t); m.position.y += S(t * PI) * .4; m.scale.setScalar(.3); m.material.opacity = 1; }, { energy: true });
            [[0, 1], [1.1, 1.35]].forEach(([tilt, sc], k) => this.add(this.g.ring, k ? c2 : c1, dur, (m, t) => { m.position.copy(a).lerp(b, t); m.position.y += S(t * PI) * .4; m.rotation.set(tilt + t * 3, t * 6 * (k ? -1 : 1), 0); m.scale.setScalar(.5 * sc); m.material.opacity = .9; }));
            this.later(dur, () => { const st = []; for (let k = 0; k < 6; k++) { const an = k / 6 * PI * 2; st.push(b.clone().add(V(C(an) * 1, .5 + S(an) * .7, 0))); this.glow(st[k], '#ffffff', .4, .6); } st.forEach((p, k) => this.path([p, st[(k + 2) % 6]], c2, .02, .6)); this.ring(g, c1, 1.6, .6, true); });
            return .95; };

        /* ================= ESPECIAIS ÚNICOS (antes compartilhavam código) ================= */
        /* Fenda Tectônica (Cascalho): uma falha rasga o chão até o alvo e cospe rochas e poeira */
        SIG.cascalho = { s(a, b, c1, c2) {
            const g = b.clone().setY(.14), ang = faceYaw(a, b);
            this.glow(a, c2, 1.2, .3); this.ring(a.clone().setY(.14), c1, 1.4, .5, true);
            for (let k = 0; k < 6; k++) this.sigCrack(a.clone().setY(.14).lerp(g, .1), Math.atan2(b.z - a.z, b.x - a.x) + (k - 2.5) * .08, a.distanceTo(b) * 1.0, k % 2 ? c1 : '#ffb347', k * .03);
            for (let i = 0; i < 9; i++) { const u = .2 + i / 9 * .75, p = a.clone().lerp(b, u).setY(.14); this.later(.25 + i * .06, () => { this.geyser(p, c1, '#ffb347', 1.2 + rnd(i) * .8, 0); this.cloud(p.clone().add(V(0, .3, 0)), '#8a7456', .7, 1.2, .3); this.shot(p.clone().add(V(0, .3, 0)), p.clone().add(V((rnd(i) - .5) * 1.4, 0, (rnd(i, 2) - .5) * 1.4)), { color: c1, kind: 'rock', size: .2, arc: 1.2, duration: .6 }); }); }
            this.later(.9, () => { this.sigRings(g, c1, c2, 2.6, 4); this.column(g, '#ffb347', 4, .9, .8); this.burst(g, c2, 28, 1.1); this.cloud(g.clone().add(V(0, 1.2, 0)), '#6b5a45', 2, 2, .5); });
            return 1.9; } };
        /* Colunas Sísmicas (Argila): sete colunas de barro irrompem em fila e a última racha tudo */
        SIG.argila = { s(a, b, c1, c2) {
            const g = b.clone().setY(.14);
            this.glow(a, c2, 1.1, .3); this.ring(a.clone().setY(.14), c1, 1.2, .5, true);
            for (let i = 0; i < 7; i++) { const u = (i + 1) / 7, p = a.clone().lerp(b, u).setY(.14).add(V(0, 0, S(i * 2.1) * .35)); this.later(.1 + i * .1, () => { this.pillar(p, i % 2 ? c1 : '#9a5632', 1.6 + u * 1.4, 0, 'rock'); this.ring(p, c2, 1.1, .5, true); this.cloud(p.clone().add(V(0, .3, 0)), '#a07a55', .6, 1, .25); this.burst(p, c2, 8, .55); }); }
            this.later(.95, () => { this.pillar(g.clone().add(V(0, 0, .5)), c1, 3.6, 0, 'rock'); this.pillar(g.clone().add(V(0, 0, -.5)), '#9a5632', 3.6, .05, 'rock'); this.sigRings(g, c1, c2, 2.4, 4); for (let k = 0; k < 8; k++) this.sigCrack(g, k / 8 * PI * 2, 2.6, c2, k * .015); this.burst(g, c2, 24, 1); });
            return 1.9; } };
        /* Despertar da Selva (Floresta): oito trepadeiras sobem em volta do alvo e a flor gigante cura */
        SIG.floresta.s = function (a, b, c1, c2) {
            const g = b.clone().setY(.14);
            this.glow(a, c2, 1.2, .3); this.ring(a.clone().setY(.14), c1, 1.2, .5, true);
            for (let k = 0; k < 8; k++) { const an = k / 8 * PI * 2, pts = []; for (let j = 0; j <= 10; j++) { const u = j / 10, r = 1.6 * (1 - u * .5); pts.push(g.clone().add(V(C(an + u * 2.4) * r, u * 3.4, S(an + u * 2.4) * r))); } this.later(.1 + k * .05, () => { this.path(pts, k % 2 ? c1 : '#3d8f3a', .09, 1.5); this.path(pts, c2, .03, 1.2); this.ring(g.clone().add(V(C(an) * 1.6, 0, S(an) * 1.6)), c1, .8, .5, true); }); }
            this.later(.8, () => { for (let i = 0; i < 10; i++) { const an = i / 10 * PI * 2; this.add(this.g.leaf, i % 2 ? '#ffb3d1' : '#fff0f5', 1.4, (m, t) => { m.position.copy(g).add(V(C(an) * (.2 + t * 1.8), 1 + S(t * PI) * 1.2, S(an) * (.2 + t * 1.8))); m.rotation.set(1.3, an + t * 2, 0); m.scale.setScalar(.55 * (1 - t * .3)); m.material.opacity = 1 - t * t; }); } this.glow(g.clone().setY(1.2), '#fff1b0', 4, .8); this.sigRings(g, c1, c2, 2, 3); for (let i = 0; i < 18; i++) this.sigMote(g.clone().add(V((rnd(i) - .5) * 3, 0, (rnd(i, 2) - .5) * 3)), g.clone().add(V((rnd(i) - .5) * 3, 2.8, (rnd(i, 2) - .5) * 3)), '#b6ff9a', .16, 1.2, rnd(i, 3) * .5); });
            return 2; };
        /* Prisão de Seiva (Âmbar): a seiva dourada fecha uma redoma sobre o alvo e goteja */
        SIG.ambar = { s(a, b, c1, c2) {
            const g = b.clone().setY(.14);
            this.glow(a, c2, 1.1, .3); this.shot(a, b, { color: c1, kind: 'orb', size: .45, arc: .8, duration: .45, energy: true, trail: true });
            this.later(.45, () => { this.bbShield(b.clone().setY(.2), c1, '#fff0c8', { size: 1.7, life: 2 }); this.sigRings(g, c1, '#fff0c8', 2, 3); this.glow(b.clone().setY(.7), c2, 3, .6); for (let i = 0; i < 14; i++) { const x = (rnd(i) - .5) * 2.2, z = (rnd(i, 2) - .5) * 2.2; this.sigMote(g.clone().add(V(x, 1.6, z)), g.clone().add(V(x, .05, z)), i % 2 ? c1 : c2, .18, .9, rnd(i, 3) * .9, true); } this.cloud(g.clone().add(V(0, .6, 0)), '#c98a2c', 1.2, 1.8, .3); });
            this.later(1.4, () => { this.ring(g, c1, 2.6, .8, true); this.burst(g, c2, 14, .6); });
            return 1.8; } };
        /* Selva de Esmeralda (Esmeralda): um bosque de cristais nasce com raios internos */
        SIG.esmeralda = { s(a, b, c1, c2) {
            const g = b.clone().setY(.14);
            this.glow(a, c2, 1.1, .3); this.ring(a.clone().setY(.14), c1, 1.2, .5, true); this.beam(a, g.clone().setY(.4), c1, .4, .1);
            const hs = [3.4, 2.5, 2.9, 2.1, 2.6, 1.8, 2.3, 1.6, 2.0]; const P2 = [];
            for (let i = 0; i < 9; i++) { const an = i * 2.399, r = i === 0 ? 0 : .8 + (i % 3) * .55, p = g.clone().add(V(C(an) * r, 0, S(an) * r * .8)); P2.push(p); this.later(.35 + i * .07, () => { this.pillar(p, i % 2 ? c1 : c2, hs[i], 0, 'shard'); this.ring(p, c1, 1, .5, true); this.glow(p.clone().setY(hs[i] * .5), c2, .8, .9); }); }
            this.later(1.0, () => { P2.forEach((p, i) => this.path([p.clone().setY(.4), P2[(i + 2) % 9].clone().setY(1.2)], '#e8fff3', .02, .7)); this.sigRings(g, c1, c2, 2.2, 4); this.burst(g, c2, 26, 1); this.glow(g.clone().setY(1.4), '#e8fff3', 4, .5); });
            return 1.9; } };
        /* Prisma Radiante (Prisma): o feixe atravessa um prisma flutuante e abre em leque de cores */
        SIG.prisma.s = function (a, b, c1, c2) {
            const g = b.clone().setY(.14), mid = a.clone().lerp(b, .45).add(V(0, .9, 0)), cols = ['#ff4d6d', '#ffa94d', '#ffe14d', '#6dff8a', '#4dd2ff', '#9d6dff'];
            this.glow(a, c2, 1.3, .4); this.ring(a, c1, .9, .5, false);
            this.bbBeam(a, mid, '#ffffff', c2, { life: .6, thick: .17 });
            this.later(.12, () => { this.add(new T.CylinderGeometry(.5, .5, 1.4, 3), c2, 1.6, (m, t) => { m.position.copy(mid); m.rotation.set(0, t * 5, PI / 2); m.scale.setScalar(Math.min(1, t * 8) * (1 - Math.max(0, (t - .85) / .15))); }, { energy: true, owned: true }); this.glow(mid, '#ffffff', 2.4, 1.5); });
            this.later(.55, () => { cols.forEach((col, k) => { const tgt = g.clone().add(V((k - 2.5) * .75, 0, (k % 2 ? .5 : -.5))); this.bbBeam(mid, tgt, col, '#ffffff', { life: .8, thick: .1 }); this.later(.1, () => { this.ring(tgt, col, 1.2, .6, true); this.glow(tgt.clone().setY(.3), col, 1.4, .5); }); }); });
            this.later(1.15, () => { for (let k = 0; k < 6; k++) this.ring(g.clone().setY(.12 + k * .04), cols[k], 2.6 + k * .5, .9, true, k * .05); this.glow(g.clone().setY(1), '#ffffff', 5, .4); this.burst(g, '#ffffff', 30, 1); });
            return 1.9; };
        /* Supernova Incandescente (Solar): uma estrela se carrega na boca e explode sobre o alvo */
        SIG.solar = { s(a, b, c1, c2) {
            const g = b.clone().setY(.14), core = b.clone().add(V(0, 1.3, 0));
            for (let k = 0; k < 4; k++) this.ring(a, k % 2 ? c1 : c2, .5 + k * .35, .5, false, k * .08);
            this.add(this.g.orb, c2, .55, (m, t) => { m.position.copy(a); m.scale.setScalar(.15 + t * .9); m.material.opacity = 1; }, { energy: true }); this.glow(a, c1, 2, .55);
            this.shot(a, core, { color: c2, kind: 'orb', size: .8, duration: .45, energy: true, trail: true });
            this.later(.95, () => {
                this.add(this.g.orb, '#fff2c2', 1.3, (m, t) => { m.position.copy(core); m.scale.setScalar(.3 + Math.sin(Math.min(1, t * 1.2) * PI / 2) * 2.7); m.material.opacity = 1 - t * t; }, { energy: true });
                this.bbExplosion(g, c1, '#fff2c2', { size: 4.6 }); this.glow(core, '#ffffff', 9, .4);
                for (let i = 0; i < 24; i++) { const an = i / 24 * PI * 2; this.path([core, core.clone().add(V(C(an) * (2.2 + rnd(i) * 1.6), S(an) * (1.6 + rnd(i, 2)) * .9, S(an) * .8))], i % 2 ? c1 : '#ffffff', .03, .8); }
                this.sigRings(g, c1, c2, 3, 5); this.column(g, c2, 5.5, 1, 1); this.burst(core, c2, 40, 1.2); this.cloud(core.clone().add(V(0, 1, 0)), '#7a4a2a', 2.4, 2.4, .6);
            });
            return 2.3; } };
        /* Cortina Boreal (Aurora): cinco cortinas verticais ondulam sobre a fila */
        SIG.aurora.s = function (a, b, c1, c2) {
            const g = b.clone().setY(.14), cols = ['#6bff9a', c1, '#6bd6ff', c2, '#9dff6b'];
            this.glow(a, c2, 1.3, .35);
            for (let k = 0; k < 5; k++) { const z = (k - 2) * .8; this.later(k * .1, () => { for (let j = 0; j < 3; j++) { const x0 = g.x + (j - 1) * .5; this.ribbon(V(x0, .1, g.z + z), V(x0 + S(k) * .6, 5.4 + S(k * 2) * .5, g.z + z + (j - 1) * .3), cols[(k + j) % 5], { waves: 7, height: .25, spread: .3, width: .09, life: 1.6 }); } this.ring(g.clone().add(V(0, 0, z)), cols[k], 1.6, .8, true); }); }
            for (let i = 0; i < 26; i++) { const x = g.x + (rnd(i) - .5) * 3, z = g.z + (rnd(i, 2) - .5) * 4; this.sigMote(V(x, .2, z), V(x, 4.6 + rnd(i, 3), z), i % 2 ? '#ffffff' : cols[i % 5], .18, 1.3, rnd(i, 4) * .8); }
            this.later(.9, () => { this.glow(g.clone().setY(2.6), c1, 6, 1); this.sigRings(g, c1, c2, 2.2, 3); });
            return 2; };
        /* Aurora Congelante (Sereia): o gelo se espalha pelo chão, espirais de cristal sobem e neva */
        SIG.sereia_glacial.s = function (a, b, c1, c2) {
            const g = b.clone().setY(.14);
            this.glow(a, c2, 1.2, .3); this.shot(a, g.clone().setY(.5), { color: c1, kind: 'shard', size: .5, duration: .4, trail: true });
            this.sigil(g, 'rune', c1, '#ffffff', 6.6, 2.2, .4, -.4);
            for (let k = 0; k < 9; k++) this.sigCrack(g, k / 9 * PI * 2, 3.2, k % 2 ? c1 : '#ffffff', .45 + k * .03);
            for (let i = 0; i < 12; i++) { const an = i * .9, r = .4 + i * .18; this.later(.6 + i * .06, () => this.pillar(g.clone().add(V(C(an) * r, 0, S(an) * r * .8)), i % 2 ? c1 : c2, 1.2 + i * .18, 0, 'shard')); }
            this.later(.55, () => { this.sigRings(g, c1, '#ffffff', 2.4, 4); this.cloud(g.clone().add(V(0, .6, 0)), '#d8f6ff', 2, 2.2, .4); });
            for (let i = 0; i < 34; i++) { const x = (rnd(i) - .5) * 5, z = (rnd(i, 2) - .5) * 4; this.sigMote(g.clone().add(V(x, 5, z)), g.clone().add(V(x + .4, .1, z)), '#ffffff', .1 + rnd(i, 3) * .08, 1.2 + rnd(i, 4) * .6, .5 + rnd(i, 5) * 1); }
            return 2.3; };
        /* Tufão Ciclônico (Brisa): um funil de três hélices ergue folhas e poeira */
        SIG.brisa.s = function (a, b, c1, c2) {
            const g = b.clone().setY(.14);
            this.glow(a, c2, 1.2, .3); this.ring(a.clone().setY(.14), c1, 1.2, .5, true);
            for (let h = 0; h < 3; h++) { const pts = []; for (let j = 0; j <= 22; j++) { const u = j / 22, r = .3 + u * 1.9; pts.push(g.clone().add(V(C(h * 2.094 + u * 11) * r, u * 5.6, S(h * 2.094 + u * 11) * r))); } this.later(.15 + h * .12, () => { this.path(pts, h % 2 ? c1 : '#ffffff', .07, 1.9); this.path(pts, c2, .025, 1.6); }); }
            this.vortex(g.clone().add(V(0, .3, 0)), c1, 2.2, false);
            for (let i = 0; i < 22; i++) { const ph = i * 1.3; this.add(this.g.leaf, i % 2 ? '#b7f5d2' : '#e8ffe3', 1.6, (m, t) => { const r = .6 + t * 2, an = ph + t * 11; m.position.copy(g).add(V(C(an) * r, t * 5, S(an) * r)); m.rotation.set(t * 8, t * 6, 0); m.scale.setScalar(.34); m.material.opacity = Math.sin(t * PI); }); }
            this.later(.5, () => { this.cloud(g.clone().add(V(0, .5, 0)), '#cfe8d8', 2.1, 2.2, .8); this.sigRings(g, c1, c2, 2.2, 3); });
            return 2.1; };
        /* Chuva de Esporos (Musgo): nuvens de esporos que flutuam e fazem brotar cogumelos luminosos */
        SIG.musgo = { s(a, b, c1, c2) {
            const g = b.clone().setY(.14);
            this.glow(a, c2, 1, .3); this.shot(a, g.clone().setY(1.6), { color: c1, kind: 'orb', size: .4, arc: 1.2, duration: .5, trail: true });
            this.later(.5, () => { this.cloud(g.clone().add(V(0, 1.6, 0)), '#7bd84b', 1.8, 2.4, .6); this.cloud(g.clone().add(V(.5, 1.2, .3)), '#c9ff7a', 1.2, 2.2, .5); this.ring(g, c1, 2.6, .9, true); for (let i = 0; i < 40; i++) { const x = (rnd(i) - .5) * 3, z = (rnd(i, 2) - .5) * 3.4; this.sigMote(g.clone().add(V(x * .4, 1.7, z * .4)), g.clone().add(V(x, .2 + rnd(i, 3) * 1.2, z)), i % 3 ? c1 : '#ffffa0', .13, 1.6 + rnd(i, 4), rnd(i, 5) * .7); } for (let i = 0; i < 6; i++) { const an = i / 6 * PI * 2, p = g.clone().add(V(C(an) * 1.5, 0, S(an) * 1.2)); this.later(.5 + i * .1, () => { this.pillar(p, i % 2 ? '#c9ff7a' : c1, .6 + rnd(i) * .5, 0, 'rock'); this.glow(p.clone().setY(.7), '#e8ffb0', .7, 1.2); }); } });
            return 2.2; } };
        /* Mortalha Térmica (Cinza): uma mortalha de cinza desce com brasas que piscam */
        SIG.cinza = { s(a, b, c1, c2) {
            const g = b.clone().setY(.14);
            this.glow(a, '#ffb347', 1, .3); this.shot(a, g.clone().setY(2.2), { color: c1, kind: 'orb', size: .4, arc: 1.2, duration: .5, trail: true });
            this.later(.5, () => { this.cloud(g.clone().add(V(0, 2.2, 0)), '#4a4658', 2.8, 2.8, .5); this.cloud(g.clone().add(V(0, 1.4, 0)), '#7a7688', 2.2, 2.6, .4); this.ring(g, '#ff7a2a', 3.2, 1, true); this.ring(g, c1, 2, .9, true, .1); for (let i = 0; i < 30; i++) { const x = (rnd(i) - .5) * 4, z = (rnd(i, 2) - .5) * 4; this.sigMote(g.clone().add(V(x, 2.8, z)), g.clone().add(V(x * .8, .15, z * .8)), i % 2 ? '#ff7a2a' : '#ffd08a', .1 + rnd(i, 3) * .08, 1.3 + rnd(i, 4) * .8, rnd(i, 5) * .8); } for (let k = 0; k < 4; k++) this.glow(g.clone().add(V((k - 1.5) * .9, .3, (k % 2 - .5) * 1.2)), '#ff7a2a', 1.2, 1.6); });
            return 2.3; } };
        /* Tempestade de Esporos (Guardião): uma jaula de trepadeiras envolve o alvo e estoura em esporos */
        SIG.guardiao_botanico.s = function (a, b, c1, c2) {
            const g = b.clone().setY(.14);
            this.glow(a, c2, 1.1, .3); this.ring(a.clone().setY(.14), c1, 1.2, .5, true);
            for (let k = 0; k < 6; k++) { const an = k / 6 * PI * 2, pts = []; for (let j = 0; j <= 12; j++) { const u = j / 12; pts.push(g.clone().add(V(C(an + u * 3) * 1.4 * (1 - Math.abs(u - .5) * .7), u * 3.2, S(an + u * 3) * 1.4 * (1 - Math.abs(u - .5) * .7)))); } this.later(.1 + k * .06, () => { this.path(pts, k % 2 ? c1 : '#7a4a22', .11, 1.4); this.path(pts, c2, .03, 1.1); }); }
            this.later(.75, () => { this.bbShield(g.clone(), c1, c2, { size: 1.6, life: 1.4 }); for (let i = 0; i < 30; i++) { const an = rnd(i) * PI * 2; this.sigMote(g.clone().setY(1.2), g.clone().add(V(C(an) * 2.8, .4 + rnd(i, 2) * 2, S(an) * 2.8)), i % 2 ? c1 : '#e8ffb0', .15, 1, rnd(i, 3) * .3); } this.sigRings(g, c1, c2, 2.2, 3); this.burst(g.clone().setY(1.2), c2, 26, 1); });
            return 1.9; };
        /* Bombardeio de Bronze (Bronze): seis obuses riscam o céu, cada um com cratera e faíscas */
        SIG.bronze.s = function (a, b, c1, c2) {
            const g = b.clone().setY(.14);
            this.glow(a, '#ffd08a', 1.6, .3); this.cloud(a.clone().add(V(.5, .3, 0)), '#6b5b4a', .8, 1, .4); this.burst(a, '#ffb347', 14, .7);
            for (let i = 0; i < 6; i++) { const end = g.clone().add(V((rnd(i) - .5) * 3.2, 0, (i - 2.5) * .62)), start = end.clone().add(V(-4.5, 8, 0)); this.later(.3 + i * .15, () => { this.path([start, end.clone().setY(.4)], '#ffb347', .05, .45); this.add(this.g.rock, '#c88a45', .5, (m, t) => { m.position.copy(start).lerp(end, t * t); m.position.y += .4; m.scale.setScalar(.28); m.material.opacity = 1; }); this.later(.5, () => { this.ring(end, c1, 1.7, .6, true); this.ring(end, '#ffd08a', 1, .4, true, .04); this.burst(end, '#ffb347', 14, .8); this.cloud(end.clone().add(V(0, .4, 0)), '#6b5b4a', .9, 1.2, .3); this.glow(end.clone().setY(.3), '#fff0c8', 1.8, .25); }); }); }
            return 1.7; };
        /* Enxame de Sombras (Morcego Noturno): um rio de sombras cruza o chão e dois olhos se abrem sobre o alvo */
        SIG.morcego_noturno.s = function (a, b, c1, c2) {
            const g = b.clone().setY(.14), d = b.clone().sub(a);
            this.glow(a, c2, 1.2, .3); this.ring(a, c1, 1, .45, false);
            for (let i = 0; i < 46; i++) { const u0 = rnd(i), lat = (rnd(i, 2) - .5) * 1.6, p0 = a.clone().add(V(0, .3, lat * .3)), p1 = b.clone().add(V((rnd(i, 3) - .5) * 1.4, .3 + rnd(i, 4) * .7, lat)); this.sigMote(p0, p1, i % 3 ? c1 : '#2a1250', .26, .75 + rnd(i, 5) * .3, rnd(i, 6) * .5); }
            this.bbVortex(g, '#3a1a82', c2, { size: 4.6, delay: .55, life: 1.5 });
            this.later(.7, () => { for (const s of [-.45, .45]) this.add(null, c2, 1.2, (m, t) => { m.position.copy(b).add(V(-.2, 2.3, s)); m.scale.setScalar(.5 * Math.sin(Math.min(1, t * 3) * PI / 2) * (1 - Math.max(0, (t - .8) / .2))); m.material.opacity = 1; }); this.cloud(b.clone().add(V(0, 1, 0)), '#1b0a33', 1.9, 1.8, .5); });
            this.later(1.05, () => { this.sigRings(g, c1, c2, 2.4, 3); this.burst(b.clone().setY(.8), c1, 34, 1.1); });
            return 1.9; };
        /* Cataclismo Arcano (Sábio): círculo rúnico gigante, oito colunas de luz e um meteoro arcano */
        SIG.sabio.s = function (a, b, c1, c2) {
            const g = b.clone().setY(.14);
            this.glow(a, c2, 1.2, .3); this.ring(a.clone().setY(.14), c1, 1.2, .5, true);
            this.sigil(g, 'rune', c1, c2, 7.4, 2.5, 0, .4); this.sigil(g, 'astro', c2, c1, 4, 2.2, .15, -.8);
            for (let k = 0; k < 8; k++) { const an = k / 8 * PI * 2, p = g.clone().add(V(C(an) * 2.7, 0, S(an) * 2.2)); this.later(.5 + k * .06, () => { this.column(p, k % 2 ? c1 : c2, 4.6, 1, .24); this.ring(p, c2, .9, .5, true); for (let j = 0; j < 3; j++) this.sigMote(p.clone().setY(.2), p.clone().setY(3.4 + j * .5), c2, .2, 1, j * .15); }); }
            this.later(1.1, () => { const top = g.clone().add(V(-2, 8, -.5)); this.add(this.g.orb, c2, .55, (m, t) => { m.position.copy(top).lerp(g.clone().setY(.8), t * t); m.scale.setScalar(.9); m.material.opacity = 1; }, { energy: true }); this.flameTail(top, g.clone().setY(.8), c1, .55, 0, 1.6); });
            this.later(1.65, () => { this.bbExplosion(g, c1, c2, { size: 3.4 }); this.glow(g.clone().setY(1), '#ffffff', 7, .4); this.sigRings(g, c1, c2, 3, 5); this.column(g, c2, 6, 1, 1); this.burst(g, c2, 36, 1.1); });
            return 2.6; };


        /* ================= ESPECIAIS ANTIGOS REFORÇADOS ================= */
        /* Erupção Vulcânica (Vulcão): fonte de magma com chamas gigantes, rios de lava, bombas e cogumelo de cinza */
        SIG.vulcao = { s(a, b, c1, c2) {
            const g = b.clone().setY(.14);
            this.glow(a, c2, 1.5, .35); this.ring(a, c1, 1.1, .5, false); this.ring(a.clone().setY(.14), c1, 1.6, .6, true);
            for (let k = 0; k < 4; k++) this.ring(g.clone().setY(.12 + k * .04), k % 2 ? '#ff4b13' : '#ffb347', 1.8 + k * .5, 1.8, true, k * .12);
            for (let k = 0; k < 9; k++) { const an = k / 9 * PI * 2, edge = g.clone().add(V(C(an) * 3.1, 0, S(an) * 2.5)); this.later(.35 + k * .04, () => this.ribbon(g, edge, k % 2 ? '#ff8b20' : '#ff4b13', { height: .05, waves: 6, spread: .14, width: .09, life: 2.2 })); this.sigCrack(g, an, 3, '#ff6a1f', .3 + k * .03); }
            this.later(.95, () => {
                this.glow(g.clone().setY(1.5), '#ffb347', 8, .6);
                for (let k = 0; k < 3; k++) this.add(this.g.flame, k % 2 ? '#ffb347' : c1, 1.5, (m, t) => { const rise = Math.sin(Math.min(1, t * 1.3) * PI / 2) * (1 - Math.max(0, (t - .7) / .3)); m.position.copy(g).add(V(S(k * 2.1 + t * 3) * .3, 3.2 * rise, C(k * 2.1 + t * 3) * .3)); m.scale.set(2.2 - k * .4, 6.2 * rise + .01, 2.2 - k * .4); m.rotation.y = t * 7 + k; m.material.opacity = 1 - t * t; });
                this.geyser(g, '#ff4b12', '#ffd13d', 6.2); this.column(g, '#ff7a1a', 7.5, 1.4, .9); this.sigRings(g, '#ff4b13', '#ffb347', 3, 5);
                for (let k = 0; k < 9; k++) { const end = g.clone().add(V(C(k * 2.4) * (1.8 + rnd(k) * 2.2), 0, S(k * 2.4) * (1.6 + rnd(k, 2) * 1.6))); this.later(k * .09, () => { this.shot(g.clone().add(V(0, 4.6, 0)), end, { color: '#ff5b16', kind: 'rock', size: .3, arc: 2.6, duration: .85, energy: true, magma: true }); this.later(.85, () => { this.ring(end, '#ff7a1a', 1.5, .6, true); this.burst(end, '#ffb347', 10, .7); }); }); }
                for (let k = 0; k < 4; k++) this.cloud(g.clone().add(V((k - 1.5) * .45, 3.2 + k * 1.1, 0)), k < 2 ? '#3a2020' : '#5d2a27', 1.6 + k * .5, 3, .6);
            });
            return 2.8; } };
        /* Fúria dos Céus (Tempestade): teto de nuvens, nove raios ramificados, chuva e uma bola de raio final */
        SIG.tempestade = { s(a, b, c1, c2) {
            const g = b.clone().setY(.14);
            this.glow(a, c2, 1.4, .35); this.ring(a, c1, 1.1, .5, false);
            for (let k = 0; k < 4; k++) this.cloud(g.clone().add(V((k - 1.5) * 1.5, 5, (k % 2 - .5) * 1.2)), k % 2 ? '#283460' : '#1c2448', 2.2, 3.4, .7);
            for (let i = 0; i < 9; i++) { const x = g.x + (rnd(i) - .5) * 5, z = g.z + (rnd(i, 2) - .5) * 4, end = V(x, .14, z), top = V(x + (rnd(i, 3) - .5) * 1.2, 5.6, z); this.later(.55 + i * .13, () => { this.bolt(top, end, i % 2 ? '#8f6aff' : '#49dfff', 0, 3); this.path([top, end], '#ffffff', .03, .3); this.ring(end, '#55dfff', 1.3, .7, true); this.burst(end, '#4bcfff', 8, .7); this.glow(end.clone().setY(.4), '#ffffff', 1.8, .2); this.glow(top, c2, 3.5, .25); }); }
            for (let i = 0; i < 48; i++) { const x = g.x + (rnd(i, 5) - .5) * 6, z = g.z + (rnd(i, 6) - .5) * 5; this.sigMote(V(x, 5, z), V(x - .4, .1, z), '#9fd8ff', .08, .5, rnd(i, 7) * 1.5); }
            this.later(1.75, () => { this.bbElecBall(g.clone().add(V(0, 1.5, 0)), g.clone().setY(.5), c1, c2, { strikes: 4 }); });
            this.later(2.2, () => { this.sigRings(g, '#49dfff', '#8f6aff', 2.6, 4); this.glow(g.clone().setY(1), '#ffffff', 6, .4); this.burst(g, c2, 30, 1.1); });
            return 2.6; } };
        /* Inferno Concentrado (Chamejante): feixe de fogo vivo que deixa o chão em chamas e fecha em um redemoinho */
        SIG.chamas = { s(a, b, c1, c2) {
            const g = b.clone().setY(.14), d = b.clone().sub(a);
            this.glow(a, c2, 1.7, .5); for (let k = 0; k < 3; k++) this.ring(a, k % 2 ? c1 : c2, .6 + k * .35, .5, false, k * .08);
            this.flameTail(a, b, c1, .9, 0, 2.4); this.flameTail(a.clone().add(V(0, .12, .2)), b, c2, .8, 0, 1.6); this.flameTail(a.clone().add(V(0, -.1, -.2)), b, '#ff4a12', .85, 0, 1.8);
            for (let k = 0; k < 8; k++) { const p = a.clone().lerp(b, (k + 1) / 8).setY(.14); this.later(.12 + k * .06, () => { this.add(this.g.flame, k % 2 ? c1 : '#ffb347', 1.1, (m, t) => { m.position.copy(p).add(V(0, .6 * Math.sin(t * PI) + .3, 0)); m.scale.set(.9 - t * .4, 1.8 * Math.sin(t * PI) + .2, .9 - t * .4); m.rotation.y = t * 9; m.material.opacity = 1 - t; }); this.glow(p.clone().setY(.4), c2, .9, .5); }); }
            this.later(.7, () => { for (let k = 0; k < 3; k++) this.add(this.g.flame, k % 2 ? c2 : c1, 1.2, (m, t) => { const an = k * 2.094 + t * 10; m.position.copy(g).add(V(C(an) * .5, 1.2 * Math.sin(t * PI), S(an) * .5)); m.scale.set(1.5, 3.6 * Math.sin(Math.min(1, t * 1.4) * PI / 2) + .1, 1.5); m.rotation.y = an; m.material.opacity = 1 - t * t; }); this.geyser(g, c1, c2, 3.6); this.sigRings(g, c1, c2, 2.4, 4); this.burst(g, c2, 30, 1.1); this.cloud(g.clone().add(V(0, 2.4, 0)), '#3a2020', 1.8, 2.2, .6); });
            return 2; } };
        /* Espiral das Marés (Orvalho): hélice de água sobe em volta do alvo, ondas no chão e bolhas */
        SIG.orvalho = { s(a, b, c1, c2) {
            const g = b.clone().setY(.14);
            this.glow(a, c2, 1.1, .3); this.shot(a, g.clone().setY(.6), { color: c1, kind: 'orb', size: .4, arc: .6, duration: .4, trail: true, energy: true });
            this.later(.4, () => {
                for (let h = 0; h < 3; h++) { const pts = []; for (let j = 0; j <= 26; j++) { const u = j / 26, r = .5 + u * 1.5; pts.push(g.clone().add(V(C(h * 2.094 + u * 9) * r, u * 4.2, S(h * 2.094 + u * 9) * r))); } this.later(h * .1, () => { this.path(pts, h % 2 ? c1 : '#7fe1ff', .1, 1.7); this.path(pts, '#ffffff', .03, 1.4); }); }
                for (let k = 0; k < 5; k++) this.ring(g.clone().setY(.12 + k * .04), k % 2 ? c1 : c2, 1.6 + k * .7, 1.3, true, k * .14);
                for (let i = 0; i < 34; i++) { const an = rnd(i) * PI * 2, r = .6 + rnd(i, 2) * 1.8; this.sigMote(g.clone().add(V(C(an) * r, 0, S(an) * r)), g.clone().add(V(C(an + 2) * r * .6, 1.2 + rnd(i, 3) * 3, S(an + 2) * r * .6)), i % 2 ? '#ffffff' : c2, .14 + rnd(i, 4) * .12, 1.3, rnd(i, 5) * .7); }
                this.glow(g.clone().setY(1.2), c1, 4, 1.2); this.geyser(g, c1, c2, 2.8, .5);
            });
            return 2.2; } };
        /* Tsunami Devastador (Maré): parede d'água de ponta a ponta varre a fila com crista de espuma */
        SIG.mare = { s(a, b, c1, c2) {
            const g = b.clone().setY(.14), yaw = faceYaw(a, b);
            this.glow(a, c2, 1.3, .3); this.ring(a.clone().setY(.14), c1, 1.6, .6, true);
            const len = a.distanceTo(b) + 2.2;
            for (let k = 0; k < 16; k++) { const z = (k / 15 - .5) * 4.6; this.later(.1 + k * .012, () => this.add(this.g.wave, k % 3 ? c1 : '#6fb7ff', 1.5, (m, t) => { m.position.set(a.x + (b.x + 1.3 - a.x) * t, .1, a.z + z); m.scale.set(1.3, 2.4 * Math.sin(Math.min(1, t * 1.6) * PI / 2) * (1 - Math.max(0, (t - .8) / .2)) + .05, .35); m.rotation.y = 0; m.material.opacity = .85 * Math.sin(Math.min(1, t * 3) * PI / 2) * (1 - Math.max(0, (t - .8) / .2)); })); }
            for (let i = 0; i < 40; i++) { const z = (rnd(i) - .5) * 4.4, p0 = V(a.x + 1, .6 + rnd(i, 2), a.z + z), p1 = V(b.x + 1.6, 1.2 + rnd(i, 3) * 1.4, a.z + z); this.sigMote(p0, p1, i % 2 ? '#ffffff' : c2, .17, .95, rnd(i, 4) * .4); }
            this.later(.85, () => { for (let k = 0; k < 7; k++) this.geyser(g.clone().add(V(0, 0, (k - 3) * .75)), c1, '#ffffff', 2.6 + rnd(k) * 1.2, k * .04); this.sigRings(g, c1, c2, 3, 5); this.cloud(g.clone().add(V(0, 1, 0)), '#cfe8ff', 2, 2.2, .5); this.glow(g.clone().setY(1), '#ffffff', 5, .4); this.burst(g, c2, 34, 1.1); });
            return 2.1; } };
        /* Zero Absoluto (Geada): o gelo explode em anéis de espinhos e o tempo congela em estilhaços */
        SIG.geada = { s(a, b, c1, c2) {
            const g = b.clone().setY(.14);
            this.glow(a, c2, 1.2, .3); this.shot(a, g.clone().setY(.9), { color: c1, kind: 'shard', size: .55, duration: .4, trail: true });
            this.later(.4, () => {
                this.glow(g.clone().setY(1), '#ffffff', 7, .35); this.bbShield(g.clone(), c1, '#ffffff', { size: 1.9, life: 1.5 });
                [[1, 8, 1.8], [2, 12, 2.9], [3, 16, 4]].forEach(([ring, n, R]) => { for (let i = 0; i < n; i++) { const an = i / n * PI * 2 + ring * .3; this.pillar(g.clone().add(V(C(an) * R, 0, S(an) * R * .8)), i % 2 ? c1 : c2, 1.4 + (3 - ring) * .6 + rnd(i) * .5, ring * .09 + i * .008, 'shard'); } });
                this.sigRings(g, c1, '#ffffff', 2.8, 5); for (let k = 0; k < 10; k++) this.sigCrack(g, k / 10 * PI * 2, 4, k % 2 ? c1 : '#ffffff', k * .02);
                for (let i = 0; i < 26; i++) { const an = rnd(i) * PI * 2; this.add(this.g.shard, i % 2 ? '#ffffff' : c2, 1.4, (m, t) => { m.position.copy(g).add(V(C(an) * t * 4.2, .6 + S(t * PI) * 1.6, S(an) * t * 3.4)); m.rotation.set(t * 6 + i, t * 5, 0); m.scale.set(.07, .35 + rnd(i, 2) * .3, .07); m.material.opacity = 1 - t * t; }); }
                this.cloud(g.clone().add(V(0, .8, 0)), '#e8f8ff', 2.4, 2.4, .4);
            });
            return 2.1; } };
        /* Sobrecarga Chrono (Crono): relógio gigante gira atrás do alvo e engrenagens marcam o tempo no chão */
        SIG.crono_engenheiro.s = function (a, b, c1, c2) {
            const g = b.clone().setY(.14), face = b.clone().add(V(.8, 2.1, 0));
            this.glow(a, c1, 1.3, .3); this.ring(a, c2, 1, .5, false);
            this.add(this.g.ring, c1, 2.3, (m, t) => { m.position.copy(face); m.rotation.set(0, .55, 0); const k = Math.min(1, t * 5) * (1 - Math.max(0, (t - .85) / .15)); m.scale.setScalar(2.1 * k + .01); m.material.opacity = k; });
            this.add(this.g.ring, c2, 2.3, (m, t) => { m.position.copy(face); m.rotation.set(0, .55, 0); const k = Math.min(1, t * 5) * (1 - Math.max(0, (t - .85) / .15)); m.scale.setScalar(1.75 * k + .01); m.material.opacity = k * .7; });
            for (let k = 0; k < 12; k++) { const an = k / 12 * PI * 2; this.later(.05 + k * .03, () => this.path([face.clone().add(V(C(an) * 1.7 * C(.55), S(an) * 1.7, -C(an) * 1.7 * S(.55))), face.clone().add(V(C(an) * 2 * C(.55), S(an) * 2, -C(an) * 2 * S(.55)))], c2, .04, 1.8)); }
            for (let h = 0; h < 2; h++) { const len = h ? 1.5 : 1.05, spd = h ? 3 : 14; this.add(this.g.pillar, c2, 2.2, (m, t) => { const an = PI / 2 - t * spd; m.position.copy(face).add(V(C(an) * len * .5 * C(.55), S(an) * len * .5, -C(an) * len * .5 * S(.55))); m.rotation.set(0, .55, an - PI / 2); m.scale.set(.1, len, .05); m.material.opacity = Math.min(1, t * 6) * (1 - Math.max(0, (t - .88) / .12)); }); }
            for (let i = 0; i < 6; i++) { const an = i / 6 * PI * 2, p = g.clone().add(V(C(an) * 2.2, 0, S(an) * 1.8)); this.later(.3 + i * .08, () => { this.add(this.g.gear, i % 2 ? c1 : c2, 1.6, (m, t) => { m.position.copy(p).setY(.35); m.rotation.set(-PI / 2, 0, t * 6 * (i % 2 ? 1 : -1)); m.scale.setScalar(1.3 * Math.min(1, t * 6) * (1 - Math.max(0, (t - .8) / .2))); m.material.opacity = 1; }); this.ring(p, c1, 1, .5, true); }); }
            this.later(1.3, () => { for (let k = 0; k < 5; k++) this.ring(g.clone().setY(.12 + k * .05), k % 2 ? c1 : c2, 2.4 + k * .8, .85, true, k * .06); this.glow(face, '#ffffff', 5, .4); this.burst(g, c2, 28, 1); for (let i = 0; i < 18; i++) this.sigMote(face, face.clone().add(V((rnd(i) - .5) * 5, (rnd(i, 2) - .5) * 4, (rnd(i, 3) - .5) * 3)), c2, .15, .9, rnd(i, 4) * .2); });
            return 2.3; };
        /* Serpente da Aurora (Nimbo): uma serpente de aurora gigante cruza o céu em S, desce em espiral e morde o alvo entre colunas de luz */
        SIG.nimbo = { s(a, b, c1, c2) {
            const g = b.clone().setY(.14), cols = ['#6bff9a', c1, '#6bd6ff', '#c46dff', c2, '#ffd0ff'];
            this.glow(a, c2, 1.8, .5); for (let k = 0; k < 4; k++) this.ring(a, k % 2 ? c1 : c2, .6 + k * .4, .55, false, k * .08);
            this.sigil(g, 'astro', c1, c2, 7.6, 3, .2, .4); this.sigil(g, 'rune', c2, c1, 4.4, 2.6, .5, -.9);
            const N = 44, step = .014;
            const P1 = u => { const x = a.x + (b.x - a.x) * u, w = Math.sin(u * PI); return V(x, 1.1 + w * 2.6 + Math.sin(u * 15) * .55 * w, a.z + Math.sin(u * 9.5) * 1.4 * w); };
            let prev = P1(0);
            for (let k = 1; k <= N; k++) { const u = k / N, p = P1(u), q = prev.clone(), col = cols[k % 6]; prev = p;
                this.later(.15 + k * step, () => { this.path([q, p], col, .22 * (1.1 - u * .5), .85); this.path([q, p], '#ffffff', .07, .6); if (k % 2) this.glow(p, col, 1.2 + (1 - u) * .5, .55); if (k % 3 === 0) { this.glow(p.clone().add(V(0, -.5, 0)), cols[(k + 2) % 6], .7, .8); this.sigMote(p, p.clone().add(V((rnd(k) - .5) * .8, -1.4, (rnd(k, 2) - .5) * .8)), '#ffffff', .12, .8, 0); } }); }
            this.later(.15 + N * step, () => { this.glow(P1(1).clone(), '#ffffff', 3.4, .5); });
            const T0 = .15 + N * step + .05, R = 28;
            for (let k = 1; k <= R; k++) { const u0 = (k - 1) / R, u1 = k / R, f = u => { const an = u * PI * 3.4, r = 1.8 - u * 1; return g.clone().add(V(Math.cos(an) * r, .35 + u * 2.6, Math.sin(an) * r * .85)); }, p0 = f(u0), p1 = f(u1), col = cols[k % 6];
                this.later(T0 + k * .011, () => { this.path([p0, p1], col, .2, .8); this.path([p0, p1], '#ffffff', .06, .6); if (k % 2) this.glow(p1, col, 1.3, .5); }); }
            const T1 = T0 + R * .011 + .1;
            if (!this.syncBoom) this.later(T1, () => this.nimboBoom(g, c1, c2));   /* na batalha o estouro vem do evento da simulação (junto com o dano) */
            return T1 + 1.2; } };

        /* estouro da Serpente da Aurora: cortina de aurora, onda de choque e chuva de estrelas (chamado junto com o dano) */
        P.nimboBoom = function (g, c1, c2) {
            const cols = ['#6bff9a', c1, '#6bd6ff', '#c46dff', c2, '#ffd0ff'], gg = g.clone().setY(.14);
            this.glow(gg.clone().setY(1.4), '#ffffff', 10, .42); this.glow(gg.clone().setY(1.4), c1, 7, .8); this.bbExplosion(gg, c1, '#ffffff', { size: 3.8 });
            this.column(gg, '#ffffff', 9, .9, .55); this.column(gg, c1, 8, 1.2, 1.1, .03);
            for (let k = 0; k < 9; k++) { const an = k / 9 * PI * 2 + .3, r = 1.7 + (k % 2) * .9; this.column(gg.clone().add(V(Math.cos(an) * r, 0, Math.sin(an) * r * .8)), cols[k % 6], 6.5 + (k % 3), 1.3, .3 + (k % 2) * .12, .04 + k * .035); }
            for (let k = 0; k < 7; k++) this.ring(gg.clone().setY(.12 + k * .04), cols[k % 6], 2.6 + k * .65, .9, true, k * .06);
            this.ring(gg.clone().setY(1.2), '#ffffff', 3.6, .5, false, .02);
            this.sigil(gg, 'astro', c1, c2, 6.6, 1.5, 0, .8);
            for (let i = 0; i < 46; i++) { const an = rnd(i) * PI * 2, r = 1 + rnd(i, 2) * 3; this.sigMote(gg.clone().add(V(Math.cos(an) * r * .5, 4.2 + rnd(i, 6) * 1.6, Math.sin(an) * r * .4)), gg.clone().add(V(Math.cos(an) * r, .1 + rnd(i, 3) * .5, Math.sin(an) * r * .8)), cols[i % 6], .22, 1 + rnd(i, 7) * .5, rnd(i, 5) * .35, true); }
            for (let i = 0; i < 24; i++) this.sigMote(gg.clone().setY(1.2), gg.clone().add(V((rnd(i, 8) - .5) * 6, .6 + rnd(i, 9) * 3.6, (rnd(i, 10) - .5) * 5)), cols[i % 6], .2, 1, rnd(i, 4) * .12);
            this.burst(gg, c2, 40, 1.3); this.burst(gg.clone().setY(1.2), '#ffffff', 22, 1);
        };
        /* ataque básico do Nimbo: cometa de aurora com cauda de faíscas e um estouro de estrelas ao acertar */
        P.nimboShot = function (a, b, dur, i) {
            const cols = ['#6bff9a', '#6bd6ff', '#c46dff', '#ffd0ff'], c = cols[(i | 0) % 4], dd = Math.max(.12, dur || .3);
            this.sigMote(a, b, '#ffffff', .55, dd); this.sigMote(a, b, c, 1.05, dd); this.glow(a, c, 1.1, .22);
            for (let k = 1; k <= 8; k++) this.sigMote(a.clone().add(V(0, Math.sin(k * 1.7) * .12, Math.cos(k * 1.3) * .12)), b, cols[(i + k) % 4], .6 * (1 - k * .08), dd, k * .03);
            this.ribbon(a, b, c, { waves: 3, height: .28, spread: .14, width: .03, life: dd + .22 });
            this.later(dd, () => { this.glow(b, '#ffffff', 1.4, .26); this.glow(b, c, 2.2, .4); this.ring(b.clone().setY(.14), c, 1.5, .5, true); this.ring(b.clone().setY(.9), '#ffffff', 1, .3, false); this.burst(b, c, 12, .8); for (let k = 0; k < 5; k++) this.sigMote(b, b.clone().add(V((rnd(k, i + 1) - .5) * 1.4, .5 + rnd(k, i + 2) * 1.1, (rnd(k, i + 3) - .5) * 1.4)), cols[k % 4], .17, .65, 0); });
        };


        /* ================= COMBOS DE ELEMENTO: animação especial própria para cada combo ================= */
        P.comboOld = P.comboOld || P.combo;
        P.combo = function (name, p0) {
            const g = p0.clone().setY(.14), top = p0.clone().setY(1.0), cols = { freeze_water: ['#38a9ff', '#d5ffff'], resin_fire: ['#ff9a1a', '#ffe08a'], conduction: ['#21baff', '#efffff'], shatter: ['#73dbff', '#ffffff'], wildfire: ['#ff5b18', '#9dff65'], refraction: ['#a65aff', '#fff5a3'], thermal: ['#ff702d', '#66dfff'] }[name];
            if (!cols) return this.comboOld && this.comboOld(name, p0);
            const [c1, c2] = cols;
            this.glow(top, '#ffffff', 3.4, .3); this.glow(top, c1, 5, .55); this.sigRings(g, c1, c2, 1.8, 3);
            if (name === 'freeze_water') { for (let i = 0; i < 9; i++) { const an = i / 9 * PI * 2; this.pillar(g.clone().add(V(C(an) * 1.1, 0, S(an) * 1.1)), i % 2 ? c1 : c2, 1.4 + rnd(i) * .8, i * .02, 'shard'); } this.geyser(g, c1, c2, 2.4); this.cloud(g.clone().add(V(0, .8, 0)), '#d8f6ff', 1.4, 1.6, .4); }
            else if (name === 'resin_fire') { this.geyser(g, c1, c2, 3); for (let i = 0; i < 6; i++) { const an = i / 6 * PI * 2; this.ribbon(g, g.clone().add(V(C(an) * 1.7, 0, S(an) * 1.7)), '#ffb347', { waves: 3, height: .1, spread: .1, width: .08, life: .9 }); } this.bbExplosion(g, c1, c2, { size: 1.9 }); }
            else if (name === 'conduction') { for (let i = 0; i < 6; i++) { const an = i / 6 * PI * 2; this.bbZap(top, g.clone().add(V(C(an) * 1.8, .3, S(an) * 1.8)), c1, c2); } this.column(g, c2, 3.4, .6, .35); }
            else if (name === 'shatter') { for (let i = 0; i < 22; i++) { const an = rnd(i) * PI * 2; this.add(this.g.shard, i % 2 ? c2 : c1, 1.1, (m, t) => { m.position.copy(g).add(V(C(an) * t * 3.4, .5 + S(t * PI) * 1.4, S(an) * t * 3)); m.rotation.set(t * 8 + i, t * 6, 0); m.scale.set(.07, .38, .07); m.material.opacity = 1 - t * t; }); } for (let k = 0; k < 8; k++) this.sigCrack(g, k / 8 * PI * 2, 2.6, k % 2 ? c1 : c2, k * .015); }
            else if (name === 'wildfire') { for (let i = 0; i < 7; i++) { const an = i / 7 * PI * 2; this.later(i * .05, () => this.add(this.g.flame, i % 2 ? c1 : '#ffb347', 1, (m, t) => { m.position.copy(g).add(V(C(an) * (.3 + t * 1.6), .8 * S(t * PI), S(an) * (.3 + t * 1.6))); m.scale.set(.9, 1.8 * S(t * PI) + .2, .9); m.rotation.y = t * 8; m.material.opacity = 1 - t; })); } for (let i = 0; i < 10; i++) { const an = i * 2.4; this.add(this.g.leaf, c2, 1, (m, t) => { m.position.copy(g).add(V(C(an) * t * 2, .3 + t * 1.6, S(an) * t * 2)); m.rotation.set(t * 6, t * 5, 0); m.scale.setScalar(.3); m.material.opacity = 1 - t; }); } }
            else if (name === 'refraction') { const cs = ['#ff4d6d', '#ffa94d', '#ffe14d', '#6dff8a', '#4dd2ff', '#9d6dff']; cs.forEach((col, k) => { const an = k / 6 * PI * 2; this.bbBeam(top, top.clone().add(V(C(an) * 2.6, .6 + S(k) * .5, S(an) * 2.6)), col, '#ffffff', { life: .55, thick: .08 }); }); this.bbExplosion(g, c1, c2, { size: 1.8 }); }
            else if (name === 'thermal') { this.cloud(g.clone().add(V(0, .9, 0)), '#e8f0f5', 1.7, 2, .6); this.ring(g.clone().setY(.2), '#ff702d', 2.6, .8, true); this.ring(g.clone().setY(.26), '#66dfff', 2, .8, true, .08); for (let i = 0; i < 4; i++) this.geyser(g.clone().add(V(C(i * 1.57) * .9, 0, S(i * 1.57) * .9)), i % 2 ? c1 : c2, '#ffffff', 1.8, i * .05); }
            this.burst(g, c2, 24, 1);
        };

        /* ---------- ataques normais aprimorados dos 8 Lendários ---------- */
        SIG.vigia.n = function (a, b, c1, c2) {
            const g = b.clone().setY(.14), col1 = c1 || '#7ec8ec', col2 = c2 || '#e86aa8';
            this.glow(a, col2, 1.5, .28); this.ring(a, col1, 1.0, .4, false);
            this.bbBeam(a, b, col1, '#ffffff', { life: .88, thick: .17 });
            this.later(.06, () => this.bbBeam(a.clone().add(V(0, .18, .22)), b, col2, col1, { life: .72, thick: .08 }));
            this.later(.12, () => this.bbBeam(a.clone().add(V(0, -.14, -.22)), b, col1, col2, { life: .68, thick: .08 }));
            this.ring(g, col2, 2.3, .7, true);
            [0.24, 0.44, 0.64].forEach((tm, idx) => this.later(tm, () => {
                this.burst(b, idx === 2 ? '#ffffff' : col2, idx === 2 ? 16 : 9, idx === 2 ? .95 : .65);
                this.ring(g, idx === 2 ? col1 : col2, 1.2 + idx * .45, .45, true);
            }));
            return 1.05;
        };
        SIG.eclipse.n = function (a, b, c1, c2) {
            const g = b.clone().setY(.14), col1 = c1 || '#8a5aff', col2 = c2 || '#ffcc44';
            this.glow(a, col1, 1.5, .28); this.ring(a, col2, 1.1, .45, false);
            for (let i = 0; i < 3; i++) {
                this.later(i * .12, () => this.shot(a, b, { color: i === 2 ? col2 : col1, kind: 'orb', size: i === 2 ? .32 : .22, arc: .35 + i * .12, duration: .52, energy: true }));
            }
            this.later(.50, () => {
                this.bbExplosion(b, col1, col2, { size: 1.9 });
                this.ring(g, col2, 2.6, .65, true);
                this.ring(g.clone().setY(.22), col1, 1.9, .55, true, .05);
                this.burst(b, col2, 16, .9);
            });
            return 1.15;
        };
        SIG.hamster.n = function (a, b, c1, c2) {
            const g = b.clone().setY(.14), col1 = c1 || '#ff9a3c', col2 = c2 || '#c58bff';
            this.glow(a, col1, 1.3, .25);
            for (let i = 0; i < 3; i++) {
                const off = V((i - 1) * .55, 0, (i - 1) * .35);
                const tp = b.clone().add(off), tg = g.clone().add(off);
                this.later(i * .18, () => {
                    this.shot(a, tp, { color: i === 2 ? col2 : col1, kind: 'rock', size: i === 2 ? .30 : .22, arc: 1.65 + i * .2, duration: .72, energy: true, magma: true });
                });
                this.later(.72 + i * .18, () => {
                    this.bbExplosion(tp, i === 2 ? col2 : col1, '#fff08a', { size: i === 2 ? 2.1 : 1.45 });
                    this.ring(tg, i === 2 ? '#fff08a' : col1, i === 2 ? 2.6 : 1.7, .6, true);
                    this.burst(tp, '#fff08a', i === 2 ? 16 : 10, i === 2 ? .95 : .7);
                });
            }
            return 1.35;
        };
        SIG.demonio_cinzas.n = function (a, b, c1, c2) {
            const g = b.clone().setY(.14), col1 = c1 || '#ef4444', col2 = c2 || '#facc15';
            this.glow(a, col1, 1.6, .3); this.ring(a, col2, 1.1, .4, false);
            if (this.flameTail) this.flameTail(a, b, col1, .78, .15, 1.45);
            this.ribbon(a, b, col2, { waves: 5, height: .2, spread: .55, width: .11, life: .75 });
            [0.22, 0.38, 0.54, 0.70].forEach((tm, idx) => this.later(tm, () => {
                const fin = idx === 3;
                this.geyser(g, col1, col2, fin ? 3.2 : 1.8, 0);
                this.ring(g, fin ? col2 : col1, fin ? 2.7 : 1.5, .55, true);
                this.burst(b, fin ? '#ffd08a' : col1, fin ? 18 : 10, fin ? 1.0 : .65);
                if (fin) this.bbExplosion(b, col1, col2, { size: 2.1 });
            }));
            return 1.15;
        };
        SIG.colosso_obsidiana.n = function (a, b, c1, c2) {
            const g = b.clone().setY(.14), col1 = c1 || '#f97316', col2 = c2 || '#fde047';
            this.glow(a, col1, 1.5, .28); this.ring(a.clone().setY(.16), col1, 1.8, .5, true);
            for (let i = 0; i < 4; i++) {
                const u = (i + 1) / 4;
                const p = a.clone().lerp(g, u).setY(.14);
                this.later(.16 + i * .13, () => {
                    this.pillar(p, i === 3 ? col2 : col1, 1.4 + i * .45, 0, 'shard');
                    this.ring(p, i === 3 ? col2 : col1, 1.3 + i * .35, .5, true);
                    this.sigCrack(p, i * 1.4, 1.4 + i * .25, col1, 0);
                    this.burst(p.clone().setY(.6), col2, i === 3 ? 16 : 8, i === 3 ? .95 : .6);
                });
            }
            return 1.1;
        };
        SIG.nimbo.n = function (a, b, c1, c2) {
            const g = b.clone().setY(.14), col1 = c1 || '#42c9d9', col2 = c2 || '#a77bff';
            this.glow(a, col1, 1.4, .28); this.ring(a, col2, 1.0, .4, false);
            for (let i = 0; i < 3; i++) {
                this.later(i * .12, () => {
                    this.ribbon(a, b, i === 2 ? '#fff0bd' : (i % 2 ? col2 : col1), { waves: 3, height: .35 + i * .15, spread: .45, width: .09, life: .52 });
                    this.shot(a, b, { color: i === 2 ? '#fff0bd' : col1, kind: 'shard', size: .22, arc: .4 + i * .15, duration: .46, energy: true });
                });
                this.later(.36 + i * .16, () => {
                    this.ring(g, i === 2 ? '#fff0bd' : col1, 1.4 + i * .45, .5, true);
                    this.burst(b, i === 2 ? '#fff0bd' : col2, i === 2 ? 16 : 9, i === 2 ? .95 : .65);
                });
            }
            return 1.1;
        };

        /* ---------- despacho ---------- */
        P.sigHas = function (id, special) { return !!(SIG[id] && SIG[id][special ? 's' : 'n']); };
        P.sigRun = function (id, special, a, b, c1, c2, hit) {
            const f = SIG[id] && SIG[id][special ? 's' : 'n']; if (!f) return null;
            try { if (window.playLegendarySfx) window.playLegendarySfx(id, !!special); } catch (e) {}
            const dur = f.call(this, a, b, c1, c2, special);
            this.impacts.push({ at: this.time + dur * .5, fn: () => { hit && hit(); } });
            return { kind: 'sig-' + id, duration: dur };
        };
        return patchD();
    }
    /* os atalhos antigos de "decorar" ataques não se somam aos efeitos de assinatura */
    function patchD() {
        const D = window.PreviewDozeAtaques;
        if (D && !D.__sig) { const od = D.decorate; D.decorate = function (fx, actor, target, special) { if (fx.sigHas && fx.sigHas(actor.data.id, special)) return; return od.apply(this, arguments); }; D.__sig = 1; }
        return !!(D && D.__sig);
    }
    if (!boot()) { let n = 0; const iv = setInterval(() => { if (boot() || ++n > 300) clearInterval(iv); }, 100); }
})();
