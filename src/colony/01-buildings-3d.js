/* === [SEC: COLONIA_DATA_ECONOMY] === */
/* ===== cortex/36h-colony-data.js: a Colônia: os dados do jogo (peças, cores, recursos, eras e contas). Peça nova = uma linha aqui (ou em assets/colony/catalog.json), sem mexer na lógica ===== */

    const CLD = (() => {

        /* receitas: cada parte é [forma, tamanho, posição (y = base), cor, brilha?, rotação, animação]. formas: b caixa · c cilindro · k cone · s esfera · p pirâmide.

           cores: 'T' e 'U' seguem a cor escolhida da peça. animação: s balança (plantas, bandeiras) · b flutua (cristais) · p pulsa (luzes, chamas) */

        const q = (k, s, p, c, g, r, an) => ({ k, s, p, c, g: !!g, r: r || null, an: an || '' });
        const COBT = ['#d9d1bd', '#cbc3ad', '#e2dac6', '#b9b09a', '#cfc7b1', '#d4ccb7'];
        const cobTile = (seed, mode, pal) => {   /* calçada do protótipo: pedras sobre terra batida; mode 0 pedras redondas, 1 lajes, 2 pedras com musgo, 3 tijolos, 4 cascalho, 5 ardósia, 6 mármore xadrez, 7 terra batida com sulcos */
            let sd = seed; const rn = () => (sd = (sd * 16807) % 2147483647) / 2147483647, P = pal || COBT, pk = () => P[Math.floor(rn() * P.length)], base = ['#6d6350', '#6d6350', '#6d6350', '#7a6a58', '#8a7f68', '#4a4f58', '#9a968c', '#7d6a4c'][mode] || '#6d6350', out = [q('b', [0.99, 0.04, 0.99], [0, 0, 0], base)];
            if (mode === 1 || mode === 5) { const cs = [-0.33, 0, 0.33]; cs.forEach((cx) => cs.forEach((cz) => { const w = 0.27 + rn() * 0.05, d = 0.27 + rn() * 0.05; out.push(q('b', [w, 0.05 + rn() * 0.015, d], [cx + (rn() - 0.5) * 0.04, 0.03, cz + (rn() - 0.5) * 0.04], pk(), 0, [0, (rn() - 0.5) * 0.4, 0])); })); return out; }
            if (mode === 3) { for (let r = 0; r < 7; r++) for (let c = 0; c < 3; c++) { const off = (r % 2) * 0.16; const x = -0.32 + c * 0.32 + off; if (x > 0.45) continue; out.push(q('b', [0.29, 0.05 + rn() * 0.012, 0.12], [Math.min(0.34, x), 0.03, -0.42 + r * 0.14], pk())); } return out; }
            if (mode === 4) { for (let i = 0; i < 48; i++) { const sz = 0.05 + rn() * 0.06; out.push(q('c', [sz, 0.03 + rn() * 0.03, sz * (0.8 + rn() * 0.4)], [-0.44 + rn() * 0.88, 0.03, -0.44 + rn() * 0.88], pk(), 0, [0, rn() * 3, 0])); } return out; }
            if (mode === 6) { for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) out.push(q('b', [0.45, 0.05, 0.45], [-0.245 + i * 0.49, 0.03, -0.245 + j * 0.49], P[(i + j) % 2])); return out; }
            if (mode === 7) { for (const z of [-0.2, 0.2]) out.push(q('b', [0.99, 0.012, 0.09], [0, 0.04, z], '#5e4d36')); for (let i = 0; i < 14; i++) { const sz = 0.04 + rn() * 0.04; out.push(q('c', [sz, 0.03, sz], [-0.44 + rn() * 0.88, 0.04, -0.44 + rn() * 0.88], pk(), 0, [0, rn() * 3, 0])); } return out; }
            for (let a = 0; a < 5; a++) for (let b = 0; b < 5; b++) { const x = -0.4 + a * 0.2 + (rn() - 0.5) * 0.05, z = -0.4 + b * 0.2 + (b % 2) * 0.05 * (a % 2 ? 1 : -1) + (rn() - 0.5) * 0.05, edge = a === 0 || b === 0 || a === 4 || b === 4, sz = (edge ? 0.2 : 0.16) + rn() * 0.03, moss = mode === 2 && rn() < 0.28; out.push(q('c', [sz, 0.05 + rn() * 0.025, sz * (0.9 + rn() * 0.2)], [x, 0.03, z], moss ? '#8c9660' : pk(), 0, [0, rn() * 3, 0])); }
            if (mode === 2) for (let i = 0; i < 7; i++) { const x = -0.42 + rn() * 0.84, z = -0.42 + rn() * 0.84; for (let k = 0; k < 3; k++) out.push(q('c', [0.018, 0.12 + rn() * 0.08, 0.018], [x + (k - 1) * 0.025, 0.05, z + (rn() - 0.5) * 0.03], k % 2 ? '#6f8f3a' : '#8aa04a', 0, [(rn() - 0.5) * 0.5, 0, (rn() - 0.5) * 0.5])); }
            return out;
        };

        const rows = (n, f) => Array.from({ length: n }, (_, i) => f(i)).flat();

        const win = (x, y, z, f, w, h) => f === 'x' ? q('b', [0.04, h || 0.26, w || 0.2], [x, y, z], '#ffe9a8', 1, null, 'n') : q('b', [w || 0.2, h || 0.26, 0.04], [x, y, z], '#ffe9a8', 1, null, 'n');   /* janelas acendem de noite */

        const roof = (w, d, y, h, c, x, z) => [q('b', [w + 0.14, 0.07, d + 0.14], [x || 0, y, z || 0], '#3a2f2a'), q('p', [(w + 0.3) * 1.42, h, (d + 0.3) * 1.42], [x || 0, y + 0.07, z || 0], c)];   /* telhado de quatro águas com beiral */

        const P = [

            /* ---- produção ---- */

            { id: 'mina', n: 'Mina de Cristal', cat: 'prod', fp: [2, 2], cost: { c: 120, m: 35 }, prod: { c: 5 }, nuc: 1, t: ['#5ee0ff', '#c4f4ff'], d: 'Mina de ouro e cristais estilizada com vigas de madeira e veios minerais: extrai riquezas da terra.',

              parts: [

                  // Base de terra e rocha batida da pedreira
                  q('b', [1.94, 0.12, 1.86], [0, -0.02, 0], '#3a332a'),

                  // Encosta rochosa e paredão do túnel
                  q('s', [1.35, 0.75, 1.15], [-0.15, 0.25, -0.25], '#4e525a'),
                  q('s', [0.95, 0.65, 0.85], [0.35, 0.22, 0.05], '#42454c'),
                  q('s', [0.85, 0.55, 0.75], [-0.48, 0.20, 0.20], '#3a3d44'),

                  // Portal do túnel em madeira rústica
                  q('b', [0.12, 0.68, 0.12], [0.14, 0.32, 0.32], '#5c3d25'),
                  q('b', [0.12, 0.68, 0.12], [0.46, 0.32, 0.32], '#5c3d25'),
                  q('b', [0.44, 0.14, 0.14], [0.30, 0.66, 0.32], '#6d492d'),

                  // Trilhos de madeira saindo do túnel
                  q('b', [0.04, 0.03, 0.65], [0.22, 0.03, 0.62], '#4e331c'),
                  q('b', [0.04, 0.03, 0.65], [0.38, 0.03, 0.62], '#4e331c'),
                  q('b', [0.24, 0.02, 0.06], [0.30, 0.02, 0.45], '#5c3d25'),
                  q('b', [0.24, 0.02, 0.06], [0.30, 0.02, 0.62], '#5c3d25'),
                  q('b', [0.24, 0.02, 0.06], [0.30, 0.02, 0.78], '#5c3d25'),

                  // Vagoneta de madeira com cintas de ferro
                  q('b', [0.26, 0.18, 0.34], [0.30, 0.14, 0.72], '#6d492d'),
                  q('b', [0.27, 0.03, 0.35], [0.30, 0.22, 0.72], '#282c34'),
                  q('b', [0.27, 0.03, 0.35], [0.30, 0.08, 0.72], '#282c34'),

                  // Cristais luminescentes na vagoneta
                  q('s', [0.20, 0.14, 0.24], [0.30, 0.25, 0.72], 'T', 1, null, 'p'),
                  q('k', [0.14, 0.25, 0.14], [0.30, 0.30, 0.72], 'U', 1, null, 'b')

              ] },

            { id: 'fazenda', n: 'Fazenda', cat: 'prod', fp: [4, 3], cost: { c: 80, b: 20 }, prod: { b: 12 }, nuc: 1, t: ['#c0504a', '#f0e4d0'], d: 'Celeiro com canteiros de plantio: quanto maior o nível, mais canteiros. Plante com biomassa, estude para regar e colhe biomassa e cristal. Ainda rende um pouco de Biomassa sozinha.',

              parts: [q('b', [2.94, 0.08, 1.94], [0, 0, 0], '#6b4a2f'), ...rows(3, i => q('b', [1.5, 0.14, 0.28], [-0.5, 0.06, -0.62 + i * 0.62], '#5a3d26')), ...rows(3, i => rows(4, j => q('s', [0.22, 0.26, 0.22], [-1.0 + j * 0.34, 0.16, -0.62 + i * 0.62], i % 2 ? '#7bd17f' : '#58b35c', 0, null, 's'))),

                  q('b', [0.9, 0.62, 0.84], [1.0, 0.04, -0.35], 'T'), ...roof(0.9, 0.84, 0.66, 0.5, 'U', 1.0, -0.35), q('b', [0.3, 0.46, 0.04], [1.0, 0.04, 0.08], '#3a2a20'), q('b', [0.26, 0.2, 0.04], [1.0, 0.7, 0.08], '#3a2a20'),

                  q('c', [0.42, 1.0, 0.42], [1.05, 0.04, 0.55], '#c9d1dc'), q('s', [0.42, 0.34, 0.42], [1.05, 1.0, 0.55], '#a4acbc'), q('c', [0.34, 0.2, 0.34], [-0.2, 0.04, 0.78], '#e0c36a', 0, [0, 0, 1.5708]), q('c', [0.34, 0.2, 0.34], [0.1, 0.04, 0.78], '#d4b45a', 0, [0, 0, 1.5708]),

                  ...rows(6, i => q('b', [0.06, 0.34, 0.06], [-1.38 + i * 0.5, 0.04, 0.96], '#a8754a')), q('b', [2.9, 0.06, 0.04], [0, 0.26, 0.96], '#a8754a')] },

            { id: 'forja', n: 'Forja', cat: 'prod', fp: [2, 2], cost: { c: 190, b: 80 }, prod: { m: 14 }, nuc: 2, t: ['#8a93a6', '#ff8a3d'], d: 'Oficina de ferraria estilizada com fornalha ardente, bigorna e ferramentas: funde minério em Metal.',

              parts: [q('b', [1.9, 0.16, 1.9], [0, 0, 0], '#2f3542'), q('b', [1.5, 0.78, 1.3], [-0.1, 0.16, -0.2], '#5b6170'), q('b', [1.56, 0.1, 1.36], [-0.1, 0.94, -0.2], 'T'), ...roof(1.4, 1.2, 1.04, 0.34, '#3a404c', -0.1, -0.2),

                  q('b', [0.5, 0.42, 0.08], [-0.1, 0.18, 0.46], '#171a21'), q('b', [0.38, 0.3, 0.06], [-0.1, 0.22, 0.5], 'U', 1, null, 'p'), q('c', [0.42, 1.6, 0.42], [0.45, 0.94, -0.5], '#3a404c'), q('c', [0.3, 0.1, 0.3], [0.45, 2.5, -0.5], 'U', 1, null, 'p'),

                  q('b', [0.4, 0.22, 0.26], [0.6, 0.04, 0.6], '#6b7384'), q('b', [0.22, 0.14, 0.2], [0.6, 0.26, 0.6], '#8a93a6'), q('s', [0.1, 0.1, 0.1], [0.5, 0.9, 0.82], 'U', 1, null, 'b'), q('s', [0.08, 0.08, 0.08], [0.74, 1.15, 0.7], 'U', 1, null, 'b'), q('b', [0.5, 0.22, 0.3], [-0.7, 0.04, 0.7], '#8a6a4a')] },

            { id: 'estufa', n: 'Estufa', cat: 'prod', fp: [2, 2], cost: { c: 320, b: 110 }, prod: { b: 30 }, nuc: 4, t: ['#bff0dc', '#58b35c'], d: 'Vidro, luz e muita Biomassa. Acelera as plantas da Plantação: +12% por nível (até +60%).',

              parts: [q('b', [1.95, 0.14, 1.95], [0, 0, 0], '#cfd6e2'), ...[[-0.85, -0.85], [0.85, -0.85], [-0.85, 0.85], [0.85, 0.85]].map(([x, z]) => q('b', [0.1, 0.8, 0.1], [x, 0.14, z], '#f4f7fb')), q('b', [1.8, 0.07, 0.07], [0, 0.9, -0.85], '#f4f7fb'), q('b', [1.8, 0.07, 0.07], [0, 0.9, 0.85], '#f4f7fb'),

                  q('p', [2.3, 0.7, 2.3], [0, 0.9, 0], 'T', 1), q('b', [0.07, 0.07, 1.8], [-0.85, 0.9, 0], '#f4f7fb'), q('b', [0.07, 0.07, 1.8], [0.85, 0.9, 0], '#f4f7fb'),

                  ...rows(3, i => rows(3, j => q('s', [0.4, 0.44, 0.4], [-0.55 + j * 0.55, 0.14, -0.55 + i * 0.55], (i + j) % 2 ? '#58b35c' : 'U', 0, null, 's'))), q('s', [0.14, 0.14, 0.14], [0.2, 0.62, -0.2], '#ff7ac8', 1, null, 'p'), q('s', [0.14, 0.14, 0.14], [-0.5, 0.58, 0.4], '#ffd27a', 1, null, 'p')] },

            { id: 'usina', n: 'Usina de Cristal', cat: 'prod', fp: [3, 3], cost: { c: 720, m: 260 }, prod: { c: 23 }, nuc: 5, t: ['#5ee0ff', '#c4f4ff'], d: 'Um campo inteiro de cristais em ressonância.',

              parts: [q('c', [2.95, 0.2, 2.95], [0, 0, 0], '#2a303c'), q('c', [2.5, 0.12, 2.5], [0, 0.2, 0], '#3b4352'), q('c', [2.2, 0.05, 2.2], [0, 0.32, 0], 'U', 1, null, 'p'), q('k', [0.95, 2.7, 0.95], [0, 0.32, 0], 'T', 1, null, 'b'),

                  ...[0, 1, 2, 3, 4, 5].map(i => { const a = i * 1.047, h = 1.2 + (i % 3) * 0.35; return q('k', [0.5, h, 0.5], [Math.cos(a) * 0.95, 0.32, Math.sin(a) * 0.95], i % 2 ? 'U' : 'T', 1, null, 'b'); }),

                  ...[[-1.2, -1.2], [1.2, -1.2], [-1.2, 1.2], [1.2, 1.2]].map(([x, z]) => q('b', [0.16, 0.8, 0.16], [x, 0.2, z], '#5a6478')), ...[[-1.2, -1.2], [1.2, -1.2], [-1.2, 1.2], [1.2, 1.2]].map(([x, z]) => q('s', [0.22, 0.22, 0.22], [x, 1.0, z], 'U', 1, null, 'p'))] },

            { id: 'refinaria', n: 'Refinaria', cat: 'prod', fp: [3, 2], cost: { c: 880, b: 280, m: 340 }, prod: { m: 40 }, nuc: 6, t: ['#ffc46b', '#8a93a6'], d: 'Tanques, canos e Metal em escala.',

              parts: [q('b', [2.95, 0.14, 1.95], [0, 0, 0], '#2f3542'), q('c', [0.9, 1.1, 0.9], [-1.0, 0.14, -0.4], '#9aa4b6'), q('c', [0.94, 0.1, 0.94], [-1.0, 1.24, -0.4], '#6b7384'), q('c', [0.8, 0.9, 0.8], [-1.0, 0.14, 0.55], '#b4bccb'), q('c', [0.84, 0.1, 0.84], [-1.0, 1.04, 0.55], '#6b7384'),

                  q('b', [1.2, 0.12, 0.14], [0.1, 0.9, -0.4], '#5a6270'), q('b', [0.14, 0.7, 0.14], [-0.35, 0.2, -0.4], '#5a6270'), q('b', [1.0, 0.95, 1.3], [0.85, 0.14, 0.1], 'T'), q('b', [1.06, 0.1, 1.36], [0.85, 1.09, 0.1], '#3a404c'), ...rows(3, i => win(0.55 + i * 0.3, 0.62, 0.77, 'z', 0.16, 0.2)),

                  q('c', [0.34, 2.0, 0.34], [0.6, 1.19, -0.45], '#8a93a6'), q('b', [0.44, 0.08, 0.44], [0.6, 2.0, -0.45], '#5a6270'), q('k', [0.26, 0.5, 0.26], [0.6, 2.12, -0.45], '#ff8a3d', 1, null, 'p'), q('c', [0.22, 1.4, 0.22], [1.25, 1.09, -0.5], '#3a404c'), q('s', [0.14, 0.14, 0.14], [1.25, 2.5, -0.5], '#ffe0a0', 1, null, 'p')] },

            { id: 'reator', n: 'Reator Estelar', cat: 'prod', fp: [3, 3], cost: { c: 3400, b: 1400, m: 1800 }, prod: { c: 75, b: 80, m: 110 }, nuc: 10, t: null, d: 'Prende um pedaço de estrela. Produz de tudo.',

              parts: [q('c', [2.95, 0.22, 2.95], [0, 0, 0], '#232a36'), q('c', [2.45, 0.16, 2.45], [0, 0.22, 0], '#394559'), q('c', [1.7, 0.12, 1.7], [0, 0.38, 0], '#2a303c'), q('s', [1.35, 1.35, 1.35], [0, 0.95, 0], 'T', 1, null, 'p'), q('c', [1.9, 0.06, 1.9], [0, 1.4, 0], 'U', 1), q('c', [2.3, 0.04, 2.3], [0, 1.0, 0], 'T', 1),

                  ...[0, 1, 2, 3].map(i => { const a = i * 1.5708 + 0.785; return q('c', [0.26, 2.0, 0.26], [Math.cos(a) * 1.15, 0.22, Math.sin(a) * 1.15], '#566379'); }), ...[0, 1, 2, 3].map(i => { const a = i * 1.5708 + 0.785; return q('k', [0.3, 0.55, 0.3], [Math.cos(a) * 1.15, 2.2, Math.sin(a) * 1.15], 'U', 1, null, 'b'); })] },

            /* ---- moradia ---- */

            { id: 'cabana', n: 'Cabana', cat: 'casa', fp: [1, 1], cost: { c: 55, b: 25 }, fx: { pop: 2 }, nuc: 1, t: ['#d86a4a', '#a8754a'], d: 'Abriga 2 moradores.',

              parts: [q('b', [0.78, 0.14, 0.78], [0, 0, 0], '#6b6f7a'), q('b', [0.62, 0.46, 0.60], [0, 0.14, 0], 'U'), ...rows(3, i => q('b', [0.64, 0.04, 0.62], [0, 0.22 + i * 0.14, 0], '#8a5a3a')), ...roof(0.36, 0.34, 0.6, 0.42, 'T'), q('b', [0.2, 0.32, 0.04], [0.1, 0.14, 0.31], '#3a2a20'), win(-0.2, 0.34, 0.31, 'z', 0.14, 0.16), q('c', [0.12, 0.3, 0.12], [-0.2, 0.7, -0.1], '#8a7060'), q('s', [0.14, 0.12, 0.14], [0.3, 0.14, 0.34], '#ff7ac8', 0, null, 's')] },

            { id: 'casa', n: 'Casa', cat: 'casa', fp: [2, 2], cost: { c: 220, b: 110 }, fx: { pop: 6 }, nuc: 2, t: ['#d8584a', '#f2e6d3'], d: 'Cozy cottage aconchegante com acabamento rústico. Abriga 6 moradores.',

              parts: [q('b', [1.9, 0.14, 1.9], [0, 0, 0], '#6b6f7a'), q('b', [1.5, 0.95, 1.3], [0, 0.14, -0.1], 'U'), q('b', [1.56, 0.08, 1.36], [0, 0.14, -0.1], '#8a7a66'), ...roof(1.5, 1.3, 1.09, 0.78, 'T', 0, -0.1), q('b', [0.26, 0.6, 0.26], [0.45, 1.2, -0.3], '#8a7060'), q('b', [0.34, 0.06, 0.34], [0.45, 1.8, -0.3], '#5a4a40'),

                  q('b', [0.3, 0.55, 0.05], [-0.1, 0.14, 0.57], '#6b3f2a'), q('b', [0.5, 0.06, 0.3], [-0.1, 0.14, 0.72], '#9aa0ac'), win(-0.5, 0.62, 0.56, 'z', 0.22, 0.28), win(0.4, 0.62, 0.56, 'z', 0.22, 0.28), q('b', [0.3, 0.06, 0.1], [0.4, 0.46, 0.62], '#8a5a3a'), q('s', [0.1, 0.1, 0.1], [0.32, 0.54, 0.62], '#ff7ac8', 0, null, 's'), q('s', [0.1, 0.1, 0.1], [0.46, 0.54, 0.62], '#ffd27a', 0, null, 's'),

                  q('b', [0.04, 0.3, 0.26], [0.76, 0.5, -0.2], '#ffe9a8', 1), q('s', [0.5, 0.5, 0.5], [-0.75, 0.14, 0.75], '#58b35c', 0, null, 's')] },

            { id: 'torre_hab', n: 'Torre Residencial', cat: 'casa', fp: [2, 2], cost: { c: 980, m: 330 }, fx: { pop: 24 }, nuc: 5, t: ['#cfd6e2', '#4fb8ff'], d: 'Abriga 24 moradores.',

              parts: [q('b', [1.9, 0.14, 1.9], [0, 0, 0], '#2f3542'), q('b', [1.2, 2.7, 1.2], [0, 0.14, 0], 'T'), q('b', [1.3, 0.18, 1.3], [0, 2.84, 0], '#2f3542'), q('b', [1.5, 0.5, 1.5], [0, 0.14, 0], '#8a93a6'),

                  ...rows(6, i => [win(-0.3, 0.9 + i * 0.32, 0.61, 'z', 0.2, 0.18), win(0.3, 0.9 + i * 0.32, 0.61, 'z', 0.2, 0.18), win(-0.3, 0.9 + i * 0.32, -0.61, 'z', 0.2, 0.18), win(0.3, 0.9 + i * 0.32, -0.61, 'z', 0.2, 0.18), win(0.61, 0.9 + i * 0.32, -0.3, 'x', 0.2, 0.18), win(0.61, 0.9 + i * 0.32, 0.3, 'x', 0.2, 0.18), win(-0.61, 0.9 + i * 0.32, -0.3, 'x', 0.2, 0.18), win(-0.61, 0.9 + i * 0.32, 0.3, 'x', 0.2, 0.18)]).flat(),

                  q('b', [0.5, 0.06, 0.3], [0, 1.4, 0.75], 'U'), q('b', [0.5, 0.06, 0.3], [0, 2.1, 0.75], 'U'), q('b', [0.5, 0.2, 0.5], [0.3, 3.02, 0.2], '#566379'), q('s', [0.4, 0.3, 0.4], [-0.3, 3.02, -0.3], '#58b35c', 0, null, 's'), q('c', [0.05, 0.6, 0.05], [0, 3.02, 0], '#8a93a6'), q('s', [0.12, 0.12, 0.12], [0, 3.6, 0], '#ff6b5e', 1, null, 'p')] },

            { id: 'domo', n: 'Domo Habitacional', cat: 'casa', fp: [3, 3], cost: { c: 2500, b: 850, m: 1100 }, fx: { pop: 70 }, nuc: 8, t: ['#cfe4ff', '#4fb8ff'], d: 'Uma pequena cidade sob uma cúpula. 70 moradores.',

              parts: [q('c', [2.95, 0.22, 2.95], [0, 0, 0], '#2f3744'), q('c', [2.6, 0.1, 2.6], [0, 0.22, 0], '#3b4659'), ...[[-0.6, -0.3, 0.7], [0.5, 0.4, 0.9], [0.1, -0.7, 0.5], [-0.5, 0.6, 0.6], [0.7, -0.5, 0.6]].map(([x, z, h]) => q('b', [0.36, h, 0.36], [x, 0.32, z], '#8a93a6')),

                  ...[[-0.6, -0.3], [0.5, 0.4], [0.1, -0.7]].map(([x, z]) => win(x, 0.7, z + 0.19, 'z', 0.14, 0.14)), q('s', [2.7, 2.7, 2.7], [0, -0.45, 0], 'T'), q('c', [2.3, 0.08, 2.3], [0, 0.32, 0], 'U', 1, null, 'p'), q('s', [0.55, 0.55, 0.55], [0, 1.1, 0], '#ffe9a8', 1, null, 'p')] },

            /* ---- utilidade ---- */

            { id: 'biblioteca', n: 'Biblioteca', cat: 'util', fp: [3, 3], cost: { c: 250, b: 85 }, fx: { xp: 0.08 }, nuc: 2, t: ['#8a6ac0', '#f2e6d3'], d: 'Grande Biblioteca clássica com colunatas e cúpula monumental. Cada nível: +8% de experiência nas matérias.',

              parts: [q('b', [1.95, 0.1, 1.95], [0, 0, 0], '#8a93a6'), q('b', [1.7, 0.1, 1.7], [0, 0.1, 0], '#a4acbc'), q('b', [1.4, 0.85, 1.2], [0, 0.2, -0.15], 'U'), ...[-0.62, -0.2, 0.2, 0.62].map(x => q('c', [0.16, 0.85, 0.16], [x, 0.2, 0.62], '#f4f0e8')), q('b', [1.6, 0.1, 0.36], [0, 1.05, 0.62], '#f4f0e8'),

                  q('p', [2.2, 0.55, 1.9], [0, 1.05, -0.1], 'T'), q('b', [0.4, 0.62, 0.05], [0, 0.2, 0.46], '#3a2a20'), win(-0.55, 0.62, 0.46, 'z', 0.2, 0.3), win(0.55, 0.62, 0.46, 'z', 0.2, 0.3), q('s', [0.2, 0.2, 0.2], [0, 1.64, -0.1], '#ffd27a', 1, null, 'p')] },

            { id: 'lab', n: 'Laboratório', cat: 'util', fp: [2, 2], cost: { c: 540, m: 170 }, fx: { prodm: 0.05 }, nuc: 3, t: ['#9ee3ff', '#e8eef7'], d: 'Cada nível: +5% de produção em tudo.',

              parts: [q('b', [1.9, 0.12, 1.9], [0, 0, 0], '#2f3542'), q('b', [1.7, 0.6, 1.5], [0, 0.12, 0], 'U'), q('b', [1.76, 0.08, 1.56], [0, 0.72, 0], '#8a93a6'), q('s', [1.2, 0.9, 1.2], [0, 0.6, 0], 'T', 1, null, 'p'), q('c', [0.07, 0.8, 0.07], [0.7, 0.8, -0.5], '#8a93a6'), q('s', [0.14, 0.14, 0.14], [0.7, 1.6, -0.5], '#ff6b5e', 1, null, 'p'),

                  q('c', [0.2, 0.34, 0.2], [-0.7, 0.8, 0.5], '#cfd6e2'), q('s', [0.26, 0.26, 0.26], [-0.7, 1.1, 0.5], '#7dff9a', 1, null, 'b'), win(-0.5, 0.35, 0.76, 'z', 0.24, 0.2), win(0.5, 0.35, 0.76, 'z', 0.24, 0.2), q('b', [0.34, 0.5, 0.04], [0, 0.12, 0.76], '#3a4452')] },

            { id: 'armazem', n: 'Armazém', cat: 'util', fp: [2, 2], cost: { c: 160, m: 55 }, fx: { cap: 400 }, nuc: 1, t: ['#ffc247', '#7a8798'], d: 'Cada nível: +400 de espaço para cada recurso.',

              parts: [q('b', [1.95, 0.1, 1.95], [0, 0, 0], '#4a5260'), q('b', [1.7, 0.95, 1.5], [0, 0.1, -0.1], 'U'), q('b', [1.72, 0.14, 1.52], [0, 0.5, -0.1], 'T'), q('b', [1.8, 0.1, 1.6], [0, 1.05, -0.1], '#4a5568'), q('b', [1.6, 0.14, 0.14], [0, 1.15, -0.1], '#3a4452'), q('b', [0.8, 0.7, 0.05], [0, 0.1, 0.66], '#3a4452'), ...rows(4, i => q('b', [0.8, 0.04, 0.06], [0, 0.22 + i * 0.16, 0.7], '#566379')),

                  q('b', [0.4, 0.34, 0.4], [-0.62, 0.1, 0.85], '#a8754a'), q('b', [0.34, 0.3, 0.34], [-0.2, 0.1, 0.88], '#8a5a3a'), q('b', [0.34, 0.3, 0.34], [-0.55, 0.44, 0.85], '#8a5a3a'), q('s', [0.14, 0.14, 0.14], [0.7, 0.9, 0.7], '#ffe9a8', 1, null, 'p')] },

            { id: 'bateria', n: 'Bateria', cat: 'util', fp: [1, 2], cost: { c: 140, m: 70 }, fx: { charge: 4 }, nuc: 1, t: ['#7dff9a', '#3a4452'], d: 'Cada nível: guarda +4 h de carga de estudo.',

              parts: [q('b', [0.9, 0.12, 1.9], [0, 0, 0], '#2f3542'), q('c', [0.7, 1.0, 0.7], [0, 0.12, -0.5], 'U'), q('c', [0.7, 1.0, 0.7], [0, 0.12, 0.5], 'U'), q('c', [0.74, 0.1, 0.74], [0, 0.55, -0.5], 'T', 1, null, 'p'), q('c', [0.74, 0.1, 0.74], [0, 0.55, 0.5], 'T', 1, null, 'p'), q('c', [0.3, 0.14, 0.3], [0, 1.12, -0.5], '#cfd6e2'), q('c', [0.3, 0.14, 0.3], [0, 1.12, 0.5], '#cfd6e2'), q('b', [0.06, 0.06, 0.9], [0, 1.26, 0], '#e8b040'), q('s', [0.14, 0.14, 0.14], [0, 1.3, 0], 'T', 1, null, 'p')] },

            { id: 'solar', n: 'Painel Solar', cat: 'util', fp: [1, 1], cost: { c: 70, m: 30 }, fx: { charge: 1.5 }, nuc: 1, t: ['#3a6ea8', '#c9d1dc'], d: 'Cada nível: guarda +1,5 h de carga.',

              parts: [q('c', [0.6, 0.08, 0.6], [0, 0, 0], '#4a5260'), q('c', [0.1, 0.5, 0.1], [0, 0.08, 0], 'U'), q('b', [0.92, 0.05, 0.68], [0, 0.55, 0], '#2a3040', 0, [-0.55, 0, 0]), q('b', [0.84, 0.06, 0.6], [0, 0.57, 0], 'T', 0, [-0.55, 0, 0]), ...rows(3, i => q('b', [0.84, 0.065, 0.025], [0, 0.57 + (i - 1) * 0.07, (i - 1) * 0.2], '#cfe4ff', 0, [-0.55, 0, 0]))] },

            { id: 'observatorio', n: 'Observatório', cat: 'util', fp: [2, 2], cost: { c: 1150, m: 420 }, fx: { xp: 0.16 }, nuc: 5, t: ['#e8eef7', '#4fb8ff'], d: 'Cada nível: +16% de experiência. Vê o céu da sua estrela.',

              parts: [q('c', [1.9, 0.14, 1.9], [0, 0, 0], '#2f3542'), q('c', [1.5, 0.8, 1.5], [0, 0.14, 0], 'T'), q('c', [1.56, 0.08, 1.56], [0, 0.6, 0], 'U'), q('s', [1.4, 1.0, 1.4], [0, 0.9, 0], 'T'), q('b', [0.3, 0.9, 0.08], [0, 1.05, 0.6], 'U', 1, [-0.4, 0, 0], 'p'), q('c', [0.14, 0.9, 0.14], [0.5, 1.2, 0.2], '#cfd6e2', 0, [-1.0, 0, 0.3]), q('b', [0.34, 0.3, 0.04], [0, 0.14, 0.76], '#3a4452'), win(-0.5, 0.45, 0.72, 'z', 0.16, 0.2), win(0.5, 0.45, 0.72, 'z', 0.16, 0.2)] },

            /* ---- natureza ---- */

            { id: 'arvore', n: 'Árvore', cat: 'nat', fp: [1, 1], cost: { c: 6 }, nuc: 1, t: ['#4fb36a', '#7a5535'], d: 'Copa redonda e tronco simples.',

              parts: [q('c', [0.2, 0.62, 0.2], [0, 0, 0], 'U'), q('b', [0.1, 0.3, 0.06], [0.1, 0.3, 0], 'U', 0, [0, 0, -0.7]), q('s', [0.85, 0.75, 0.85], [0, 0.4, 0], 'T', 0, null, 's'), q('s', [0.6, 0.55, 0.6], [0.12, 0.88, 0.05], 'T', 0, null, 's'), q('s', [0.5, 0.45, 0.5], [-0.22, 0.62, 0.12], '#7bd17f', 0, null, 's'), q('s', [0.08, 0.08, 0.08], [0.25, 0.7, 0.3], '#ff7ac8', 0, null, 's')] },

            { id: 'pinheiro', n: 'Pinheiro', cat: 'nat', fp: [1, 1], cost: { c: 6 }, nuc: 1, t: ['#2f8f5a', '#6a4a30'], d: 'Cresce em camadas.',

              parts: [q('c', [0.16, 0.34, 0.16], [0, 0, 0], 'U'), q('k', [0.86, 0.5, 0.86], [0, 0.22, 0], 'T', 0, null, 's'), q('k', [0.68, 0.48, 0.68], [0, 0.52, 0], 'T', 0, null, 's'), q('k', [0.5, 0.46, 0.5], [0, 0.8, 0], '#3ca06a', 0, null, 's'), q('k', [0.3, 0.4, 0.3], [0, 1.06, 0], '#58b97f', 0, null, 's')] },

            { id: 'arbusto', n: 'Arbusto', cat: 'nat', fp: [1, 1], cost: { c: 4 }, nuc: 1, t: ['#58b35c', '#ff9ac7'], d: 'Verde baixinho para encher os cantos.',

              parts: [q('s', [0.6, 0.46, 0.55], [-0.15, 0, 0], 'T', 0, null, 's'), q('s', [0.5, 0.4, 0.5], [0.2, 0, 0.1], '#3f9a58', 0, null, 's'), q('s', [0.42, 0.36, 0.42], [0, 0, -0.22], '#7bd17f', 0, null, 's'), q('s', [0.1, 0.1, 0.1], [-0.2, 0.36, 0.12], 'U', 0, null, 's'), q('s', [0.1, 0.1, 0.1], [0.24, 0.34, 0.2], 'U', 0, null, 's')] },

            { id: 'flores', n: 'Canteiro de Flores', cat: 'nat', fp: [1, 1], cost: { c: 8, b: 4 }, nuc: 1, t: ['#ff7ac8', '#ffd27a'], d: 'Troque a cor para combinar com a colônia.',

              parts: [q('b', [0.94, 0.1, 0.94], [0, 0, 0], '#6b4a2f'), q('b', [0.86, 0.06, 0.86], [0, 0.1, 0], '#3f7a46'), ...rows(7, i => [q('c', [0.03, 0.2, 0.03], [-0.3 + (i % 3) * 0.3, 0.12, -0.26 + Math.floor(i / 3) * 0.26], '#3f9a58'), q('s', [0.2, 0.16, 0.2], [-0.3 + (i % 3) * 0.3, 0.3, -0.26 + Math.floor(i / 3) * 0.26], i % 2 ? 'T' : 'U', 0, null, 's')]).flat()] },

            { id: 'rocha', n: 'Rocha', cat: 'nat', fp: [1, 1], cost: { c: 3 }, nuc: 1, t: ['#8a93a6', '#6b7384'], d: 'Pedra solta, sem pressa.',

              parts: [q('s', [0.86, 0.56, 0.7], [0, 0, 0], 'T', 0, [0, 0.4, 0]), q('s', [0.44, 0.34, 0.44], [0.3, 0, 0.22], 'U'), q('s', [0.3, 0.24, 0.3], [-0.3, 0, 0.26], 'T'), q('s', [0.26, 0.1, 0.26], [0, 0.46, 0], '#58b35c')] },

            { id: 'cogumelo', n: 'Cogumelo Gigante', cat: 'nat', fp: [1, 1], cost: { c: 30, b: 20 }, nuc: 2, t: ['#ff6b5e', '#f1ece0'], d: 'Brilha de leve à noite.',

              parts: [q('c', [0.24, 0.62, 0.24], [0, 0, 0], 'U'), q('s', [1.0, 0.66, 1.0], [0, 0.3, 0], 'T'), ...rows(4, i => q('s', [0.15, 0.1, 0.15], [-0.26 + (i % 2) * 0.5, 0.86 - (i % 2) * 0.05, -0.2 + Math.floor(i / 2) * 0.4], '#fff', 1, null, 'p')), q('s', [0.3, 0.2, 0.3], [0.34, 0, 0.3], 'T'), q('c', [0.07, 0.2, 0.07], [0.34, 0, 0.3], 'U')] },

            { id: 'lago', n: 'Lago', cat: 'nat', fp: [3, 3], cost: { c: 80, b: 30 }, nuc: 2, t: ['#2f8fcf', '#9ae0ff'], d: 'Água calma onde a estrela se reflete.',

              parts: [q('c', [3.0, 0.14, 3.0], [0, 0, 0], '#6b5e50'), q('c', [2.75, 0.1, 2.75], [0, 0.1, 0], 'T'), q('c', [2.3, 0.04, 2.3], [0, 0.18, 0], 'U', 1, null, 'p'), q('c', [1.2, 0.04, 1.2], [0.3, 0.2, -0.2], 'T', 1, null, 'p'),

                  q('s', [0.55, 0.38, 0.5], [-1.2, 0, -1.0], '#8a93a6'), q('s', [0.42, 0.3, 0.4], [1.15, 0, 1.05], '#8a93a6'), q('s', [0.36, 0.26, 0.36], [-1.25, 0, 0.9], '#7a8396'), q('c', [0.3, 0.03, 0.3], [-0.5, 0.2, 0.4], '#58b35c', 0, null, 's'), q('c', [0.26, 0.03, 0.26], [0.6, 0.2, 0.6], '#7bd17f', 0, null, 's'), q('s', [0.1, 0.1, 0.1], [-0.5, 0.24, 0.4], '#ff7ac8', 0, null, 's'),

                  ...rows(4, i => q('c', [0.04, 0.5 + (i % 2) * 0.2, 0.04], [1.1 + (i % 2) * 0.12, 0.1, -1.0 + i * 0.12], '#4f9a58', 0, null, 's'))] },

            /* ---- decoração ---- */

            { id: 'poste', n: 'Poste de Luz', cat: 'dec', fp: [1, 1], cost: { c: 8, m: 3 }, nuc: 1, t: ['#fff2c9', '#2b3340'], d: 'Acende sozinho com a estrela.',

              parts: [q('c', [0.26, 0.1, 0.26], [0, 0, 0], 'U'), q('c', [0.08, 1.1, 0.08], [0, 0.1, 0], 'U'), q('b', [0.3, 0.05, 0.3], [0, 1.2, 0], 'U'), q('s', [0.3, 0.3, 0.3], [0, 1.25, 0], 'T', 1, null, 'p'), q('k', [0.34, 0.14, 0.34], [0, 1.52, 0], 'U')] },

            { id: 'banco', n: 'Banco', cat: 'dec', fp: [1, 1], cost: { c: 6 }, nuc: 1, t: ['#a8754a', '#4a5260'], d: 'Banco de praça trabalhado em madeira e ferro para contemplação e descanso dos colonos.',

              parts: [q('b', [0.86, 0.08, 0.38], [0, 0.3, 0], 'T'), q('b', [0.86, 0.3, 0.07], [0, 0.4, -0.17], 'T', 0, [-0.15, 0, 0]), q('b', [0.07, 0.3, 0.38], [-0.38, 0, 0], 'U'), q('b', [0.07, 0.3, 0.38], [0.38, 0, 0], 'U'), q('b', [0.07, 0.2, 0.07], [-0.4, 0.3, -0.12], 'U'), q('b', [0.07, 0.2, 0.07], [0.4, 0.3, -0.12], 'U')] },

            { id: 'fonte', n: 'Fonte', cat: 'dec', fp: [2, 2], cost: { c: 90, m: 20 }, bem: 0.01, nuc: 3, t: ['#4fb8ff', '#b4bccb'], d: 'A água sobe em cor de estrela. Bem-estar: +1% de produção (até +8% somando todas as decorações).',

              parts: [q('c', [1.9, 0.34, 1.9], [0, 0, 0], 'U'), q('c', [1.6, 0.06, 1.6], [0, 0.32, 0], 'T', 1, null, 'p'), q('c', [0.34, 0.9, 0.34], [0, 0.3, 0], 'U'), q('c', [0.9, 0.1, 0.9], [0, 0.78, 0], 'U'), q('c', [0.7, 0.05, 0.7], [0, 0.88, 0], 'T', 1, null, 'p'), q('k', [0.22, 0.6, 0.22], [0, 0.88, 0], 'T', 1, null, 'b'), q('s', [0.14, 0.14, 0.14], [0.5, 1.2, 0], 'T', 1, null, 'b'), q('s', [0.14, 0.14, 0.14], [-0.5, 1.15, 0.1], 'T', 1, null, 'b'), q('s', [0.12, 0.12, 0.12], [0.1, 1.3, -0.45], 'T', 1, null, 'b')] },

            { id: 'estatua', n: 'Estátua', cat: 'dec', fp: [1, 1], cost: { c: 40, m: 20 }, bem: 0.01, nuc: 2, t: ['#e8eef7', '#6b7384'], d: 'Alguém que estudou muito. Bem-estar: +1% de produção (até +8% somando todas as decorações).',

              parts: [q('b', [0.62, 0.14, 0.62], [0, 0, 0], 'U'), q('b', [0.5, 0.4, 0.5], [0, 0.14, 0], 'U'), q('c', [0.26, 0.62, 0.26], [0, 0.54, 0], 'T'), q('s', [0.3, 0.3, 0.3], [0, 1.1, 0], 'T'), q('b', [0.62, 0.08, 0.12], [0, 0.92, 0], 'T'), q('b', [0.3, 0.2, 0.05], [0.08, 0.58, 0.14], '#ffd27a', 1, [0.2, 0, 0.1], 'p')] },

            { id: 'arco', n: 'Arco de Fogo', cat: 'dec', fp: [2, 1], cost: { c: 50, m: 15 }, nuc: 2, t: ['#e8eef7', '#4fb8ff'], d: 'Portal de pedra em chamas, com runas brilhantes e braseiros nos pilares. A cor que você escolher muda a cor do fogo.',

              parts: [q('b', [0.36, 0.14, 0.4], [-0.75, 0, 0], '#6b7384'), q('b', [0.36, 0.14, 0.4], [0.75, 0, 0], '#6b7384'), q('b', [0.26, 1.6, 0.3], [-0.75, 0.14, 0], 'T'), q('b', [0.26, 1.6, 0.3], [0.75, 0.14, 0], 'T'), q('b', [1.9, 0.26, 0.36], [0, 1.74, 0], 'T'), q('b', [1.2, 0.07, 0.1], [0, 1.66, 0], 'U', 1, null, 'p'), q('s', [0.22, 0.22, 0.22], [0, 2.02, 0], 'U', 1, null, 'b')] },

            { id: 'arco_jardim', n: 'Arco Florido', cat: 'dec', fp: [2, 1], cost: { c: 45, b: 20 }, bem: 0.01, upg: 1, nuc: 1, t: ['#e8eef7', '#e86fa8'], d: 'Arco monumental em cantaria e madeira florida que evolui em 5 níveis com brasão, telhado de duas águas, cachos de glicínia, cristais e pétalas caindo. A cor escolhida muda as pétalas e o telhado.',

              parts: [q('b', [0.34, 0.16, 0.42], [-0.76, 0, 0], '#6b7384'), q('b', [0.34, 0.16, 0.42], [0.76, 0, 0], '#6b7384'), q('b', [0.28, 1.25, 0.34], [-0.76, 0.16, 0], 'T'), q('b', [0.28, 1.25, 0.34], [0.76, 0.16, 0], 'T'), q('b', [1.92, 0.22, 0.44], [0, 1.44, 0], 'U'), q('p', [2.02, 0.36, 0.62], [0, 1.66, 0], 'U')] },

            { id: 'cerca', n: 'Cerca', cat: 'dec', fp: [1, 1], cost: { c: 2 }, nuc: 1, t: ['#a8754a', '#7a5535'], d: 'Cerca estilizada de ripas de madeira rústica com conexão inteligente.',

              parts: [q('b', [0.11, 0.56, 0.11], [-0.39, 0, 0], 'T'), q('b', [0.11, 0.56, 0.11], [0.39, 0, 0], 'T'), q('b', [0.13, 0.60, 0.13], [0, 0, 0], 'T'), q('b', [0.80, 0.072, 0.048], [0, 0.41, 0], 'U'), q('b', [0.80, 0.072, 0.048], [0, 0.18, 0], 'U'), q('b', [0.064, 0.44, 0.072], [-0.20, 0.06, 0], 'U'), q('b', [0.064, 0.44, 0.072], [0.20, 0.06, 0], 'U'), q('k', [0.13, 0.09, 0.13], [-0.39, 0.56, 0], 'T'), q('k', [0.13, 0.09, 0.13], [0.39, 0.56, 0], 'T'), q('k', [0.15, 0.10, 0.15], [0, 0.60, 0], 'T')] },

            { id: 'bandeira', n: 'Bandeira', cat: 'dec', fp: [1, 1], cost: { c: 12 }, nuc: 1, t: null, d: 'Na cor da sua estrela.',

              parts: [q('c', [0.2, 0.08, 0.2], [0, 0, 0], '#6b7384'), q('c', [0.06, 1.6, 0.06], [0, 0.08, 0], '#c9d1dc'), q('s', [0.1, 0.1, 0.1], [0, 1.66, 0], '#ffd27a', 1, null, 'p'), q('b', [0.62, 0.36, 0.03], [0.34, 1.2, 0], 'T', 0, null, 's'), q('b', [0.56, 0.07, 0.035], [0.31, 1.32, 0], 'U', 0, null, 's'), q('b', [0.56, 0.07, 0.035], [0.31, 1.12, 0], 'U', 0, null, 's')] },

            { id: 'cristal', n: 'Cristal Gigante', cat: 'dec', fp: [1, 1], cost: { c: 60 }, nuc: 3, t: ['#b79cff', '#e5dcff'], d: 'Brilha parado, sem produzir nada. Só beleza.',

              parts: [q('c', [0.7, 0.1, 0.7], [0, 0, 0], '#4a5260'), q('k', [0.6, 1.7, 0.6], [0, 0.1, 0], 'T', 1, null, 'b'), q('k', [0.4, 1.05, 0.4], [0.28, 0.1, 0.2], 'U', 1, null, 'b'), q('k', [0.34, 0.85, 0.34], [-0.3, 0.1, -0.15], 'U', 1, null, 'b'), q('k', [0.24, 0.5, 0.24], [0.1, 0.1, -0.32], 'T', 1, null, 'b')] },

            { id: 'tenda', n: 'Tenda', cat: 'dec', fp: [2, 2], cost: { c: 30, b: 10 }, nuc: 1, t: ['#e8dccb', '#d96b38'], d: 'Tenda esculpida em lona catenária com postes torneados, estacas, tapete e lanterna interna.',

              parts: [q('b', [1.9, 0.06, 1.9], [0, 0, 0], '#8a7a5a'), q('p', [2.5, 1.3, 2.5], [0, 0.06, 0], 'T'), q('p', [2.54, 0.34, 2.54], [0, 0.06, 0], 'U'), q('b', [0.6, 0.78, 0.05], [0, 0.06, 0.98], '#2b2118'), q('c', [0.06, 0.6, 0.06], [0, 1.36, 0], '#8a7060'), q('b', [0.34, 0.22, 0.03], [0.19, 1.62, 0], 'U', 0, null, 's'), q('c', [0.3, 0.3, 0.3], [0.9, 0.06, 0.8], '#6b4a2f'), q('s', [0.2, 0.2, 0.2], [0.9, 0.34, 0.8], '#ff9a3c', 1, null, 'p')] },

            { id: 'telescopio', n: 'Telescópio', cat: 'dec', fp: [1, 1], cost: { c: 45, m: 20 }, nuc: 2, t: ['#e8eef7', '#4a5260'], d: 'Aponta para a sua estrela.',

              parts: [q('c', [0.46, 0.08, 0.46], [0, 0, 0], 'U'), q('c', [0.08, 0.5, 0.08], [0, 0.08, 0], 'U'), q('c', [0.08, 0.5, 0.08], [0.2, 0.08, 0.1], 'U', 0, [0, 0, -0.35]), q('c', [0.08, 0.5, 0.08], [-0.2, 0.08, 0.1], 'U', 0, [0, 0, 0.35]), q('c', [0.22, 0.78, 0.22], [0, 0.55, 0], 'T', 0, [-1.0, 0, 0]), q('c', [0.28, 0.06, 0.28], [0, 0.98, -0.34], 'U', 1, [-1.0, 0, 0], 'p')] },

            /* ---- caminhos ---- */

            { id: 'caminho', n: 'Caminho de Pedra', cat: 'cam', fp: [1, 1], cost: { c: 1 }, nuc: 1, t: ['#9aa0ac', '#767c88'], d: 'Calçada de pedras redondas: arraste para desenhar uma estrada.',

              parts: cobTile(11, 0) },

            { id: 'caminho_lajes', n: 'Caminho de Lajes', cat: 'cam', fp: [1, 1], cost: { c: 1 }, nuc: 1, t: ['#b8a276', '#8c7552'], d: 'Lajes de pedra irregulares, assentadas na terra.',

              parts: cobTile(23, 1) },

            { id: 'caminho_musgo', n: 'Caminho de Pedra com Musgo', cat: 'cam', fp: [1, 1], cost: { c: 1 }, nuc: 1, t: ['#a99269', '#7f8a4a'], d: 'Pedras antigas com musgo e tufos de grama.',

              parts: cobTile(37, 2) },

            { id: 'caminho_tijolo', n: 'Caminho de Tijolos', cat: 'cam', fp: [1, 1], cost: { c: 2 }, nuc: 2, t: ['#b4573f', '#7a3a2a'], d: 'Tijolos de barro assentados em fileiras.',

              parts: cobTile(41, 3, ['#b4573f', '#a64c36', '#c26346', '#9a4430']) },

            { id: 'caminho_cascalho', n: 'Caminho de Cascalho', cat: 'cam', fp: [1, 1], cost: { c: 1 }, nuc: 1, t: ['#c9bfa6', '#8a7f68'], d: 'Pedrinhas soltas, macio de pisar.',

              parts: cobTile(53, 4, ['#d8cfb8', '#c2b79c', '#e6dfcc', '#a99f88']) },

            { id: 'caminho_ardosia', n: 'Caminho de Ardósia', cat: 'cam', fp: [1, 1], cost: { c: 3 }, nuc: 3, t: ['#5d6672', '#3f4650'], d: 'Lajes escuras de ardósia.',

              parts: cobTile(67, 5, ['#6b7480', '#5d6672', '#7a838f', '#525a66']) },

            { id: 'caminho_marmore', n: 'Caminho de Mármore', cat: 'cam', fp: [1, 1], cost: { c: 6, m: 1 }, nuc: 5, t: ['#ece8df', '#b9b5ac'], d: 'Placas claras em xadrez.',

              parts: cobTile(71, 6, ['#efebe2', '#cfcac0']) },

            { id: 'caminho_terra', n: 'Trilha de Terra', cat: 'cam', fp: [1, 1], cost: { c: 1 }, nuc: 1, t: ['#8a7048', '#5e4d36'], d: 'Terra batida com marcas de carroça.',

              parts: cobTile(83, 7, ['#a8977a', '#8f805f', '#b9a98a']) },

            { id: 'areia', n: 'Caminho de Areia', cat: 'cam', fp: [1, 1], cost: { c: 1 }, nuc: 1, t: ['#dcc794', '#bfa874'], d: 'Macio e quente.',

              parts: [q('b', [0.99, 0.04, 0.99], [0, 0, 0], 'T'), q('s', [0.3, 0.07, 0.3], [0.22, 0, -0.2], 'U'), q('s', [0.24, 0.06, 0.24], [-0.25, 0, 0.2], 'U'), q('s', [0.14, 0.05, 0.14], [-0.2, 0, -0.28], '#a89468')] },

            { id: 'neon', n: 'Via Neon', cat: 'cam', fp: [1, 1], cost: { c: 3, m: 1 }, nuc: 2, t: ['#4fb8ff', '#1f2633'], d: 'Linhas de luz no chão.',

              parts: [q('b', [0.99, 0.05, 0.99], [0, 0, 0], 'U'), q('b', [0.12, 0.07, 0.9], [0, 0, 0], 'T', 1, null, 'p'), q('b', [0.06, 0.06, 0.3], [-0.3, 0, -0.3], 'T', 1), q('b', [0.06, 0.06, 0.3], [0.3, 0, 0.3], 'T', 1)] },

            { id: 'grama', n: 'Gramado Claro', cat: 'cam', fp: [1, 1], cost: { c: 1 }, nuc: 1, t: ['#7bd17f', '#58b35c'], d: 'Um tapete verde por cima do terreno.',

              parts: [q('b', [0.99, 0.05, 0.99], [0, 0, 0], 'T'), ...rows(5, i => q('k', [0.1, 0.2, 0.1], [-0.34 + (i % 3) * 0.34, 0.04, -0.28 + Math.floor(i / 3) * 0.5], i % 2 ? 'U' : 'T', 0, null, 's'))] },

            /* ---- o Núcleo: já nasce com a colônia e não se compra ---- */

            { id: 'nucleo', n: 'Núcleo', cat: 'util', fp: [3, 3], cost: {}, prod: { c: 2, b: 4, m: 4 }, nuc: 1, hid: 1, t: null, d: 'O coração da colônia. Subir o Núcleo libera peças novas e níveis maiores.',

              parts: [] }

        ];

        /* ---- catálogo ampliado: mais peças de cada tipo (cada uma custa mais e rende mais que a anterior da mesma linha) ---- */

        const base = (w, d, c) => q('b', [w, 0.12, d], [0, 0, 0], c || '#4a5260');

        const X = [

            { id: 'moinho', n: 'Moinho', cat: 'prod', fp: [2, 2], cost: { c: 160, b: 55 }, prod: { b: 16, m: 4 }, nuc: 2, t: ['#e8dccb', '#a8754a'], d: 'Mói o grão e rende Biomassa e um pouco de Metal. Aumenta a colheita da Plantação: +10% por nível (até +50%).',
              parts: [base(1.9, 1.9, '#6b6f7a'), q('k', [1.2, 1.3, 1.2], [0, 0.12, 0], 'T'), q('c', [0.8, 0.6, 0.8], [0, 1.0, 0], 'U'), q('k', [0.9, 0.5, 0.9], [0, 1.5, 0], '#a8754a'), q('b', [0.1, 1.2, 0.04], [0, 1.1, 0.55], '#f2e6d3', 0, [0, 0, 0.5], 'p'), q('b', [1.2, 0.1, 0.04], [0, 1.1, 0.55], '#f2e6d3', 0, [0, 0, 0.5], 'p'), q('b', [0.3, 0.5, 0.05], [0, 0.12, 0.6], '#6b3f2a')] },

            { id: 'porto', n: 'Porto de Pesca', cat: 'prod', fp: [2, 2], cost: { c: 200, b: 60, m: 30 }, prod: { b: 24 }, nuc: 2, t: ['#3b82f6', '#93c5fd'], d: 'Entreposto marítimo e doca de pesca com botes e trapiches sobre a água. Posicione na borda da colônia para os barcos navegarem no mar aberto! Melhora as expedições: +10% de retorno por nível (até +40%) e libera mais um grupo.',
              parts: [q('b', [1.9, 0.12, 1.9], [0, 0, 0], '#5c4033'), q('b', [0.4, 0.2, 1.6], [0, 0.1, 0], '#8b5a2b'), q('b', [0.3, 0.15, 0.6], [0.6, 0.1, 0.2], '#a0522d')] },

            { id: 'pomar', n: 'Pomar', cat: 'prod', fp: [3, 3], cost: { c: 240, b: 65 }, prod: { b: 22, c: 2 }, nuc: 3, t: ['#58b35c', '#ff6b5e'], d: 'Fileiras de árvores frutíferas. Rende bastante Biomassa. Rende também um pouco de Cristal sozinho.',

              parts: [q('b', [2.9, 0.1, 2.9], [0, 0, 0], '#5a4a30'), ...rows(9, i => { const x = -0.9 + (i % 3) * 0.9, z = -0.9 + Math.floor(i / 3) * 0.9; return [q('c', [0.14, 0.4, 0.14], [x, 0.1, z], '#7a5535'), q('s', [0.62, 0.56, 0.62], [x, 0.4, z], 'T', 0, null, 's'), q('s', [0.1, 0.1, 0.1], [x + 0.2, 0.55, z + 0.18], 'U')]; }).flat()] },

            { id: 'poco', n: 'Poço de Cristal', cat: 'prod', fp: [1, 1], cost: { c: 320, m: 120 }, prod: { c: 10 }, nuc: 3, t: ['#5ee0ff', '#c4f4ff'], d: 'Um poço fundo que sobe cristal puro. Cabe em qualquer canto.',

              parts: [q('c', [0.9, 0.34, 0.9], [0, 0, 0], '#6b7384'), q('c', [0.62, 0.06, 0.62], [0, 0.33, 0], 'T', 1, null, 'p'), q('b', [0.07, 0.8, 0.07], [-0.4, 0.3, 0], '#8a5a3a'), q('b', [0.07, 0.8, 0.07], [0.4, 0.3, 0], '#8a5a3a'), q('b', [0.95, 0.07, 0.12], [0, 1.05, 0], '#8a5a3a'), q('k', [0.18, 0.4, 0.18], [0, 0.4, 0], 'U', 1, null, 'b')] },

            { id: 'pedreira', n: 'Pedreira', cat: 'prod', fp: [3, 2], cost: { c: 420, b: 120 }, prod: { m: 24, c: 2 }, nuc: 4, t: ['#9aa0ac', '#ffc46b'], d: 'Corta a pedra do chão. Rende Metal e um pouco de Cristal.',

              parts: [base(2.9, 1.9, '#4a4238'), q('b', [2.4, 0.3, 1.5], [0, 0.12, 0], '#7a8294'), q('b', [1.7, 0.3, 1.1], [0.1, 0.42, 0], 'T'), q('b', [1.0, 0.3, 0.7], [0.2, 0.72, 0], '#9aa0aa'), q('b', [0.3, 0.9, 0.3], [-1.0, 0.12, 0.6], '#8a5a3a'), q('b', [0.8, 0.07, 0.07], [-0.7, 0.95, 0.6], '#8a5a3a'), q('b', [0.4, 0.3, 0.4], [-1.0, 0.12, -0.6], 'U'), q('k', [0.3, 0.4, 0.3], [1.0, 0.12, 0.5], '#ff9a3d', 1, null, 'p')] },

            { id: 'fundicao', n: 'Fundição', cat: 'prod', fp: [3, 3], cost: { c: 1950, b: 560, m: 840 }, prod: { m: 80 }, nuc: 8, t: ['#8a93a6', '#ff8a3d'], d: 'Alto-forno de verdade. Muito Metal, mesmo no escuro.',

              parts: [base(2.9, 2.9, '#2f3542'), q('b', [2.4, 1.1, 1.6], [0, 0.12, -0.3], 'T'), q('c', [0.9, 1.6, 0.9], [-0.7, 1.2, -0.5], '#566379'), q('c', [0.7, 1.9, 0.7], [0.6, 1.2, -0.5], '#566379'), q('c', [0.5, 0.1, 0.5], [-0.7, 2.8, -0.5], '#2b3340'), q('s', [1.0, 0.7, 0.5], [0, 0.3, 0.6], 'U', 1, null, 'p'), q('b', [2.0, 0.1, 0.5], [0, 0.12, 0.9], '#3a2f2a'), q('b', [0.1, 0.5, 0.1], [1.2, 0.12, 0.9], '#6b6f7a')] },

            { id: 'chale', n: 'Chalé', cat: 'casa', fp: [2, 2], cost: { c: 120, b: 55 }, fx: { pop: 4 }, nuc: 1, t: ['#a8754a', '#d8584a'], d: 'Chalé rústico alpino de madeira aconchegante para 4 moradores.',

              parts: [base(1.9, 0.95, '#6b6f7a'), q('b', [1.7, 0.7, 0.78], [0, 0.12, 0], 'T'), ...rows(4, i => q('b', [1.72, 0.04, 0.8], [0, 0.2 + i * 0.16, 0], '#7a5535')), ...roof(1.7, 0.78, 0.82, 0.45, 'U'), win(-0.5, 0.45, 0.4, 'z', 0.22, 0.22), win(0.5, 0.45, 0.4, 'z', 0.22, 0.22), q('b', [0.24, 0.42, 0.04], [0, 0.12, 0.4], '#3a2a20')] },

            { id: 'sobrado', n: 'Sobrado', cat: 'casa', fp: [2, 2], cost: { c: 480, b: 190 }, fx: { pop: 12 }, nuc: 3, t: ['#e8dccb', '#6a4a8a'], d: 'Prédio estilizado de múltiplos andares. Abriga 12 moradores.',

              parts: [base(1.9, 1.9, '#6b6f7a'), q('b', [1.5, 1.6, 1.3], [0, 0.12, 0], 'T'), q('b', [1.56, 0.08, 1.36], [0, 0.9, 0], '#8a7a66'), ...roof(1.5, 1.3, 1.72, 0.7, 'U'), ...rows(2, i => [win(-0.4, 0.5 + i * 0.8, 0.66, 'z', 0.24, 0.3), win(0.4, 0.5 + i * 0.8, 0.66, 'z', 0.24, 0.3)]).flat(), q('b', [0.3, 0.55, 0.05], [0, 0.12, 0.66], '#6b3f2a'), q('b', [0.5, 0.05, 0.3], [0, 0.9, 0.82], '#8a5a3a')] },

            { id: 'loft', n: 'Loft Moderno', cat: 'casa', fp: [3, 2], cost: { c: 1600, b: 280, m: 540 }, fx: { pop: 40 }, nuc: 6, t: ['#cfd6e2', '#4fb8ff'], d: 'Vidro, concreto e vista. Abriga 40 moradores.',

              parts: [base(2.9, 1.9, '#2f3542'), q('b', [2.6, 1.0, 1.5], [0, 0.12, 0], 'T'), q('b', [2.1, 0.9, 1.3], [0.2, 1.12, 0], '#e8eef7'), q('b', [2.0, 0.6, 0.05], [0.2, 1.3, 0.66], 'U', 1), q('b', [2.4, 0.5, 0.05], [0, 0.35, 0.76], 'U', 1), q('b', [2.7, 0.08, 1.6], [0, 1.1, 0], '#566379'), q('b', [2.2, 0.08, 1.4], [0.2, 2.0, 0], '#566379'), q('s', [0.3, 0.3, 0.3], [-1.0, 2.0, 0.3], '#58b35c', 0, null, 's')] },

            { id: 'cupula', n: 'Cúpula-Jardim', cat: 'casa', fp: [4, 4], cost: { c: 6800, b: 2200, m: 2700 }, fx: { pop: 160 }, nuc: 11, t: ['#cfe4ff', '#58b35c'], d: 'Um bairro inteiro sob vidro, com floresta dentro. 160 moradores.',

              parts: [q('c', [3.95, 0.2, 3.95], [0, 0, 0], '#2f3542'), q('s', [3.6, 3.0, 3.6], [0, 0.1, 0], 'T', 0, null), q('s', [3.4, 0.05, 3.4], [0, 0.2, 0], '#58b35c'), ...rows(5, i => { const a = i * 1.26; return [q('c', [0.14, 0.7, 0.14], [Math.cos(a) * 1.2, 0.2, Math.sin(a) * 1.2], '#7a5535'), q('s', [0.7, 0.7, 0.7], [Math.cos(a) * 1.2, 0.7, Math.sin(a) * 1.2], '#4fb36a', 0, null, 's')]; }).flat(), q('b', [0.6, 0.9, 0.6], [0, 0.2, 0], 'U'), q('s', [0.4, 0.4, 0.4], [0, 1.2, 0], 'U', 1, null, 'p')] },

            { id: 'antena', n: 'Antena', cat: 'util', fp: [1, 1], cost: { c: 190, m: 80 }, fx: { charge: 2.5 }, nuc: 2, t: ['#ff6b5e', '#8a93a6'], d: 'Cada nível: guarda +2,5 h de carga. Fina, cabe em qualquer lugar.',

              parts: [base(0.7, 0.7, '#3a4452'), q('c', [0.1, 1.9, 0.1], [0, 0.12, 0], 'U'), q('b', [0.6, 0.05, 0.05], [0, 1.4, 0], 'U'), q('b', [0.4, 0.05, 0.05], [0, 1.1, 0], 'U'), q('s', [0.14, 0.14, 0.14], [0, 2.0, 0], 'T', 1, null, 'p')] },

            { id: 'silo', n: 'Silo', cat: 'util', fp: [1, 1], cost: { c: 380, m: 140 }, fx: { cap: 700 }, nuc: 3, t: ['#c9d1dc', '#ff9a3d'], d: 'Cada nível: +700 de espaço para cada recurso. Torre estreita.',

              parts: [base(0.8, 0.8, '#3a4452'), q('c', [0.7, 1.4, 0.7], [0, 0.12, 0], 'U'), q('s', [0.7, 0.5, 0.7], [0, 1.5, 0], 'U'), q('b', [0.72, 0.06, 0.72], [0, 0.6, 0], 'T'), q('b', [0.72, 0.06, 0.72], [0, 1.1, 0], 'T'), q('b', [0.2, 0.36, 0.04], [0, 0.12, 0.36], '#2b3340')] },

            { id: 'gerador', n: 'Gerador', cat: 'util', fp: [2, 1], cost: { c: 550, m: 280 }, fx: { charge: 8 }, nuc: 4, t: ['#ffd166', '#566379'], d: 'Gerador mecânico industrial com relógios e motor. Guarda +8 h de carga.',

              parts: [base(1.9, 0.95, '#2f3542'), q('b', [1.6, 0.7, 0.7], [0, 0.12, 0], 'U'), q('b', [0.5, 0.5, 0.74], [-0.4, 0.2, 0], 'T', 1, null, 'p'), q('c', [0.34, 0.5, 0.34], [0.5, 0.82, 0], '#8a93a6'), q('b', [0.5, 0.05, 0.04], [0.5, 0.4, 0.36], '#ffd166', 1), q('s', [0.12, 0.12, 0.12], [0.5, 1.35, 0], 'T', 1, null, 'p')] },

            { id: 'escola', n: 'Escola', cat: 'util', fp: [2, 2], cost: { c: 440, b: 140 }, fx: { xp: 0.12 }, nuc: 3, t: ['#f2c14e', '#e8dccb'], d: 'Cada nível: +12% de experiência nas matérias.',

              parts: [base(1.9, 1.9, '#6b6f7a'), q('b', [1.7, 0.8, 1.2], [0, 0.12, -0.2], 'U'), ...roof(1.7, 1.2, 0.92, 0.4, 'T', 0, -0.2), q('b', [0.5, 1.0, 0.5], [0, 0.12, 0.4], 'U'), q('p', [0.7, 0.4, 0.7], [0, 1.12, 0.4], 'T'), q('c', [0.05, 0.45, 0.05], [0, 1.5, 0.4], '#8a93a6'), ...rows(4, i => win(-0.6 + i * 0.4, 0.55, 0.42, 'z', 0.2, 0.26)), q('s', [0.14, 0.14, 0.14], [0, 1.95, 0.4], 'T', 1, null, 'p')] },

            { id: 'centro_pesq', n: 'Centro de Pesquisa', cat: 'util', fp: [2, 2], cost: { c: 1350, m: 540 }, fx: { prodm: 0.09 }, nuc: 6, t: ['#9ee3ff', '#b79cff'], d: 'Cada nível: +9% de produção em tudo.',

              parts: [base(1.9, 1.9, '#2f3542'), q('b', [1.6, 0.9, 1.6], [0, 0.12, 0], 'U'), q('s', [1.2, 0.9, 1.2], [0, 1.0, 0], 'T', 1), q('c', [0.9, 0.06, 0.9], [0, 1.45, 0], '#e8eef7', 1, null, 'p'), q('b', [0.2, 0.5, 0.04], [0.5, 0.12, 0.81], '#3a2a20'), q('s', [0.2, 0.2, 0.2], [0, 2.1, 0], 'T', 1, null, 'b')] },

            { id: 'cofre', n: 'Cofre Estelar', cat: 'util', fp: [2, 2], cost: { c: 1350, m: 700 }, fx: { cap: 2200 }, nuc: 7, t: ['#b4bccb', '#ffd166'], d: 'Cada nível: +2200 de espaço para cada recurso.',

              parts: [base(1.9, 1.9, '#2f3542'), q('b', [1.6, 1.1, 1.4], [0, 0.12, 0], 'T'), q('b', [1.2, 0.8, 0.05], [0, 0.28, 0.72], '#566379'), q('c', [0.5, 0.06, 0.5], [0, 0.6, 0.76], 'U', 1, null, 'p'), q('b', [0.12, 0.3, 0.12], [0.5, 0.45, 0.78], '#8a93a6'), q('b', [1.7, 0.1, 1.5], [0, 1.2, 0], 'U')] },

            { id: 'universidade', n: 'Universidade', cat: 'util', fp: [3, 3], cost: { c: 2500, b: 850, m: 850 }, fx: { xp: 0.3 }, nuc: 8, t: ['#e8dccb', '#6a4a8a'], d: 'Cada nível: +30% de experiência nas matérias.',

              parts: [base(2.9, 2.9, '#6b6f7a'), q('b', [2.6, 1.2, 1.6], [0, 0.12, -0.5], 'T'), ...roof(2.6, 1.6, 1.32, 0.55, 'U', 0, -0.5), ...rows(5, i => q('c', [0.16, 1.0, 0.16], [-1.0 + i * 0.5, 0.12, 0.7], '#f2e6d3')), q('b', [2.4, 0.1, 0.3], [0, 1.12, 0.7], '#f2e6d3'), q('p', [2.6, 0.5, 0.5], [0, 1.22, 0.7], 'T'), q('c', [0.7, 0.5, 0.7], [0, 1.7, -0.5], 'U'), q('s', [0.8, 0.5, 0.8], [0, 2.1, -0.5], 'T', 1, null, 'p')] },

            { id: 'carvalho', n: 'Carvalho Antigo', cat: 'nat', fp: [2, 2], cost: { c: 40, b: 25 }, nuc: 3, t: ['#3a8f4a', '#6a4a30'], d: 'Um gigante de copa larga. Dá sombra a tudo em volta.',

              parts: [q('c', [0.5, 1.6, 0.5], [0, 0, 0], 'U'), q('b', [0.14, 0.7, 0.1], [0.3, 0.9, 0], 'U', 0, [0, 0, -0.9]), q('s', [1.9, 1.3, 1.9], [0, 1.2, 0], 'T', 0, null, 's'), q('s', [1.3, 1.0, 1.3], [0.4, 2.0, 0.2], 'T', 0, null, 's'), q('s', [1.1, 0.9, 1.1], [-0.5, 1.7, -0.3], '#58b35c', 0, null, 's')] },

            { id: 'bambu', n: 'Bambuzal', cat: 'nat', fp: [1, 1], cost: { c: 14, b: 8 }, nuc: 2, t: ['#7bd17f', '#58b35c'], d: 'Hastes altas que balançam ao menor vento.',

              parts: [...rows(6, i => [q('c', [0.07, 1.3 + (i % 3) * 0.3, 0.07], [-0.3 + (i % 3) * 0.3, 0, -0.2 + Math.floor(i / 3) * 0.4], 'T', 0, null, 's'), q('k', [0.2, 0.3, 0.2], [-0.3 + (i % 3) * 0.3, 1.2 + (i % 3) * 0.3, -0.2 + Math.floor(i / 3) * 0.4], 'U', 0, null, 's')]).flat()] },

            { id: 'cacto', n: 'Cacto Florido', cat: 'nat', fp: [1, 1], cost: { c: 10 }, nuc: 2, t: ['#58b35c', '#ff7ac8'], d: 'Teimoso e cheio de flor.',

              parts: [q('c', [0.34, 0.9, 0.34], [0, 0, 0], 'T'), q('c', [0.2, 0.4, 0.2], [0.26, 0.4, 0], 'T'), q('c', [0.2, 0.34, 0.2], [-0.26, 0.5, 0], 'T'), q('s', [0.16, 0.16, 0.16], [0, 0.88, 0], 'U', 0, null, 's'), q('s', [0.1, 0.1, 0.1], [0.26, 0.76, 0], 'U')] },

            { id: 'cerejeira', n: 'Cerejeira', cat: 'nat', fp: [1, 1], cost: { c: 30, b: 15 }, nuc: 3, t: ['#ffb0d0', '#6a4a30'], d: 'Pétalas rosa que caem devagar.',

              parts: [q('c', [0.2, 0.8, 0.2], [0, 0, 0], 'U'), q('b', [0.1, 0.4, 0.08], [0.15, 0.55, 0], 'U', 0, [0, 0, -0.8]), q('s', [1.0, 0.7, 1.0], [0, 0.7, 0], 'T', 0, null, 's'), q('s', [0.7, 0.5, 0.7], [0.2, 1.1, 0.1], 'T', 0, null, 's'), q('s', [0.1, 0.1, 0.1], [0.4, 0.2, 0.3], 'T', 1, null, 'b')] },

            { id: 'zen', n: 'Jardim Zen', cat: 'nat', fp: [2, 2], cost: { c: 70, b: 20 }, bem: 0.01, nuc: 4, t: ['#e8dccb', '#6b7384'], d: 'Areia riscada, pedras e silêncio. Bem-estar: +1% de produção (até +8% somando todas as decorações).',

              parts: [q('b', [1.9, 0.1, 1.9], [0, 0, 0], '#8a7a66'), q('b', [1.8, 0.06, 1.8], [0, 0.1, 0], 'T'), ...rows(5, i => q('b', [1.6, 0.03, 0.05], [0, 0.16, -0.7 + i * 0.35], '#c9b88e')), q('s', [0.5, 0.36, 0.4], [0.4, 0.1, 0.2], 'U'), q('s', [0.3, 0.24, 0.3], [-0.5, 0.1, -0.2], '#8a92a4'), q('s', [0.2, 0.16, 0.2], [0.7, 0.1, -0.5], '#7a8294')] },

            { id: 'cachoeira', n: 'Cachoeira', cat: 'nat', fp: [2, 2], cost: { c: 140, b: 40 }, bem: 0.01, nuc: 5, t: ['#4fb8ff', '#6b7384'], d: 'A água cai de um penhasco e vira névoa de estrela. Bem-estar: +1% de produção (até +8% somando todas as decorações).',

              parts: [q('s', [1.9, 1.7, 1.2], [0, -0.3, -0.4], '#6b7384'), q('s', [1.2, 1.0, 0.8], [-0.4, 0.5, -0.5], '#7a8294'), q('b', [0.5, 1.3, 0.08], [0.2, 0.3, 0.08], 'T', 1, null, 'p'), q('c', [1.7, 0.06, 1.0], [0, 0, 0.6], 'T', 1, null, 'p'), q('s', [0.4, 0.2, 0.4], [-0.6, 0, 0.7], '#58b35c', 0, null, 's')] },

            { id: 'obelisco', n: 'Obelisco', cat: 'dec', fp: [1, 1], cost: { c: 80, m: 30 }, nuc: 4, t: ['#e8eef7', '#4fb8ff'], d: 'Runas que acendem com a estrela.',

              parts: [base(0.8, 0.8, '#3a4452'), q('p', [0.5, 1.9, 0.5], [0, 0.12, 0], 'T'), q('b', [0.04, 0.8, 0.04], [0, 0.4, 0.2], 'U', 1, null, 'p'), q('s', [0.16, 0.16, 0.16], [0, 2.1, 0], 'U', 1, null, 'b')] },

            { id: 'lanterna', n: 'Lanterna Flutuante', cat: 'dec', fp: [1, 1], cost: { c: 20, b: 5 }, nuc: 2, t: ['#ffd27a', '#ff8a3d'], d: 'Flutua devagar e ilumina em volta.',

              parts: [q('c', [0.08, 0.5, 0.08], [0, 0, 0], '#6b6f7a'), q('s', [0.44, 0.5, 0.44], [0, 0.85, 0], 'T', 1, null, 'b'), q('c', [0.34, 0.05, 0.34], [0, 1.28, 0], '#3a2f2a'), q('s', [0.2, 0.2, 0.2], [0, 0.95, 0], 'U', 1, null, 'p')] },

            { id: 'coreto', n: 'Coreto', cat: 'dec', fp: [2, 2], cost: { c: 120, m: 30 }, bem: 0.01, nuc: 3, t: ['#e8eef7', '#d8584a'], d: 'Um palanque redondo para tardes longas. Bem-estar: +1% de produção (até +8% somando todas as decorações).',

              parts: [q('c', [1.9, 0.2, 1.9], [0, 0, 0], '#6b7384'), ...rows(6, i => { const a = i * 1.047; return q('c', [0.1, 1.2, 0.1], [Math.cos(a) * 0.75, 0.2, Math.sin(a) * 0.75], 'T'); }), q('k', [2.2, 0.7, 2.2], [0, 1.4, 0], 'U'), q('s', [0.14, 0.14, 0.14], [0, 2.05, 0], 'T', 1, null, 'p')] },

            { id: 'torre_vigia', n: 'Torre de Vigia', cat: 'dec', fp: [1, 1], cost: { c: 120, m: 45 }, fx: { pop: 1, xp: 0.05 }, nuc: 1, t: ['#78350f', '#f59e0b'], d: 'Torre de vigia fortificada. Mantém sentinelas alertas, previne acidentes e expande a segurança da colônia.',
              parts: [q('b', [0.8, 0.15, 0.8], [0, 0, 0], '#6b5744'), q('b', [0.5, 1.8, 0.5], [0, 0.15, 0], '#8b6f4e'), q('b', [0.7, 0.2, 0.7], [0, 1.95, 0], '#5a4632'), q('s', [0.15, 0.15, 0.15], [0, 2.1, 0], '#ffaa33', 1, null, 'p')] },

            { id: 'praca', n: 'Praça Central', cat: 'dec', fp: [2, 2], cost: { c: 280, b: 100 }, fx: { pop: 4, xp: 0.12 }, nuc: 2, t: ['#10b981', '#fbbf24'], d: 'Praça comunitária ajardinada com coreto ornamentado, poço dos desejos e bancos para descanso dos colonos. Aumenta a harmonia e o ânimo de estudo. Atrai o mercador com mais frequência e ele fica mais tempo.',
              parts: [q('b', [1.95, 0.1, 1.95], [0, 0, 0], '#cfd6df'), q('c', [0.8, 0.9, 0.8], [0, 0.1, 0], '#f0e6d2'), q('k', [1.1, 0.6, 1.1], [0, 1.0, 0], '#22c55e')] },

            { id: 'ponte', n: 'Pontezinha', cat: 'dec', fp: [3, 1], cost: { c: 40, b: 10 }, nuc: 2, t: ['#a8754a', '#7a5535'], d: 'Pequena ponte de madeira. Fica linda sobre o lago.',

              parts: [...rows(7, i => q('b', [0.4, 0.07, 0.8], [-1.2 + i * 0.4, 0.2 + 0.18 * Math.sin(i * 0.45), 0], 'T')), q('b', [0.07, 0.3, 0.07], [-1.3, 0.2, 0.36], 'U'), q('b', [0.07, 0.3, 0.07], [1.3, 0.2, 0.36], 'U'), q('b', [2.8, 0.05, 0.05], [0, 0.46, 0.36], 'U'), q('b', [0.07, 0.3, 0.07], [-1.3, 0.2, -0.36], 'U'), q('b', [0.07, 0.3, 0.07], [1.3, 0.2, -0.36], 'U'), q('b', [2.8, 0.05, 0.05], [0, 0.46, -0.36], 'U')] },

            { id: 'altar', n: 'Altar Estelar', cat: 'dec', fp: [2, 2], cost: { c: 400, m: 120 }, nuc: 6, t: ['#b79cff', '#e8eef7'], d: 'Um círculo de pedra onde a luz da estrela pousa.',

              parts: [q('c', [1.9, 0.14, 1.9], [0, 0, 0], '#3a4452'), q('c', [1.5, 0.08, 1.5], [0, 0.14, 0], 'U'), q('c', [1.1, 0.04, 1.1], [0, 0.22, 0], 'T', 1, null, 'p'), ...rows(4, i => { const a = i * 1.5708 + 0.785; return [q('b', [0.2, 1.0, 0.2], [Math.cos(a) * 0.8, 0.14, Math.sin(a) * 0.8], 'U'), q('s', [0.16, 0.16, 0.16], [Math.cos(a) * 0.8, 1.2, Math.sin(a) * 0.8], 'T', 1, null, 'p')]; }).flat(), q('k', [0.3, 0.8, 0.3], [0, 0.4, 0], 'T', 1, null, 'b')] },

            { id: 'holograma', n: 'Holograma Galáctico', cat: 'dec', fp: [2, 2], cost: { c: 900, m: 300 }, nuc: 9, t: ['#4fb8ff', '#b79cff'], d: 'Uma galáxia inteira girando sobre a colônia.',

              parts: [q('c', [1.9, 0.16, 1.9], [0, 0, 0], '#2f3542'), q('c', [0.8, 0.14, 0.8], [0, 0.16, 0], 'U', 1, null, 'p'), q('c', [1.6, 0.04, 1.6], [0, 1.2, 0], 'T', 1, null, 'p'), q('c', [1.1, 0.04, 1.1], [0, 1.35, 0], 'U', 1, null, 'p'), q('s', [0.4, 0.4, 0.4], [0, 1.1, 0], 'T', 1, null, 'b'), q('s', [0.14, 0.14, 0.14], [0.7, 1.3, 0.3], 'U', 1, null, 'b')] },

            { id: 'pavimento', n: 'Calçada Clara', cat: 'cam', fp: [1, 1], cost: { c: 2 }, nuc: 1, t: ['#e8e0d0', '#bfb59f'], d: 'Pedra clara, bem encaixada.',

              parts: [q('b', [0.99, 0.05, 0.99], [0, 0, 0], '#6b6f7a'), ...rows(4, i => q('b', [0.46, 0.07, 0.46], [i % 2 ? 0.24 : -0.24, 0, i < 2 ? -0.24 : 0.24], i % 3 ? 'T' : 'U'))] },

            { id: 'tabuas', n: 'Passarela de Tábuas', cat: 'cam', fp: [1, 1], cost: { c: 2, b: 1 }, nuc: 1, t: ['#a8754a', '#7a5535'], d: 'Passarela de ripas e tábuas de madeira estilizada.',

              parts: [q('b', [0.99, 0.04, 0.99], [0, 0, 0], '#3a2f2a'), ...rows(4, i => q('b', [0.99, 0.07, 0.22], [0, 0, -0.38 + i * 0.25], i % 2 ? 'T' : 'U'))] },

            { id: 'via_cristal', n: 'Via de Cristal', cat: 'cam', fp: [1, 1], cost: { c: 6, m: 2 }, nuc: 4, t: ['#b79cff', '#1f2633'], d: 'Cristal embutido que acende ao longo do caminho.',

              parts: [q('b', [0.99, 0.05, 0.99], [0, 0, 0], 'U'), q('k', [0.16, 0.2, 0.16], [-0.25, 0.04, -0.25], 'T', 1, null, 'p'), q('k', [0.12, 0.16, 0.12], [0.25, 0.04, 0.2], 'T', 1, null, 'p'), q('b', [0.5, 0.06, 0.06], [0, 0.04, 0], 'T', 1)] }

        ];

        P.splice(P.findIndex(p => p.id === 'nucleo'), 0, ...X);

        /* ---- evento: Halloween (24/10 a 02/11). Peças exclusivas: só se constroem durante o evento (custam Doces, que só vêm de estudar) e continuam suas depois ---- */

        const glow = '#ffd23a';

        const EV = [

            { id: 'abobora', n: 'Abóbora Gigante', cat: 'ev', ev: 'halloween', fp: [1, 1], cost: { d: 3 }, nuc: 1, t: ['#ff7a1a', '#4a7a2a'], d: 'Uma abóbora de olhos acesos. Só no Halloween.',

              parts: [q('s', [0.95, 0.82, 0.95], [0, 0, 0], 'T'), q('s', [0.56, 0.82, 0.86], [0.28, 0, 0], 'T'), q('s', [0.56, 0.82, 0.86], [-0.28, 0, 0], 'T'), q('c', [0.13, 0.28, 0.13], [0, 0.74, 0], 'U'), q('b', [0.07, 0.12, 0.07], [0.1, 0.9, 0], 'U'),

                  q('k', [0.2, 0.2, 0.05], [-0.2, 0.4, 0.44], glow, 1, null, 'p'), q('k', [0.2, 0.2, 0.05], [0.2, 0.4, 0.44], glow, 1, null, 'p'), q('b', [0.54, 0.1, 0.05], [0, 0.16, 0.45], glow, 1, null, 'p'), q('b', [0.08, 0.14, 0.05], [-0.14, 0.2, 0.45], '#ff7a1a'), q('b', [0.08, 0.14, 0.05], [0.14, 0.2, 0.45], '#ff7a1a'), q('s', [0.7, 0.5, 0.7], [0, 0.2, 0], glow, 1, null, 'p')] },

            { id: 'vela', n: 'Velas Tremeluzentes', cat: 'ev', ev: 'halloween', fp: [1, 1], cost: { d: 2 }, nuc: 1, t: ['#f2e6d3', '#3a2f2a'], d: 'Três velas derretidas e uma chama que não apaga.',

              parts: [q('c', [0.7, 0.06, 0.7], [0, 0, 0], 'U'), q('c', [0.18, 0.5, 0.18], [-0.15, 0.06, 0], 'T'), q('c', [0.15, 0.36, 0.15], [0.18, 0.06, 0.1], 'T'), q('c', [0.2, 0.62, 0.2], [0.05, 0.06, -0.22], 'T'), q('s', [0.1, 0.16, 0.1], [-0.15, 0.56, 0], glow, 1, null, 'p'), q('s', [0.09, 0.14, 0.09], [0.18, 0.42, 0.1], glow, 1, null, 'p'), q('s', [0.11, 0.18, 0.11], [0.05, 0.68, -0.22], '#ff9a3d', 1, null, 'p')] },

            { id: 'arvore_seca', n: 'Árvore Seca', cat: 'ev', ev: 'halloween', fp: [1, 1], cost: { d: 4 }, nuc: 1, t: ['#3a2f3a', '#1a1220'], d: 'Galhos retorcidos e um corvo que observa tudo.',

              parts: [q('c', [0.3, 1.5, 0.3], [0, 0, 0], 'T', 0, [0.05, 0, 0.08]), q('b', [0.1, 0.8, 0.1], [0.12, 0.8, 0], 'T', 0, [0, 0, -0.9]), q('b', [0.09, 0.7, 0.09], [-0.1, 1.0, 0], 'T', 0, [0, 0, 0.8]), q('b', [0.07, 0.5, 0.07], [0.45, 1.25, 0], 'T', 0, [0, 0, -0.5]), q('b', [0.07, 0.45, 0.07], [-0.4, 1.45, 0], 'T', 0, [0, 0, 0.6]),

                  q('s', [0.2, 0.16, 0.28], [0.52, 1.3, 0], 'U'), q('s', [0.12, 0.12, 0.12], [0.58, 1.44, 0.1], 'U'), q('k', [0.06, 0.1, 0.06], [0.62, 1.46, 0.18], '#ff9a3d', 0, [1.5, 0, 0]), q('s', [0.04, 0.04, 0.04], [0.6, 1.5, 0.15], '#ff3b3b', 1, null, 'p')] },

            { id: 'espantalho', n: 'Espantalho', cat: 'ev', ev: 'halloween', fp: [1, 1], cost: { d: 5 }, nuc: 1, t: ['#c9a86a', '#6b4a2a'], d: 'Cuida do terreno. Ou assusta quem passa à noite.',

              parts: [q('c', [0.08, 1.4, 0.08], [0, 0, 0], 'U'), q('b', [1.1, 0.07, 0.07], [0, 0.95, 0], 'U'), q('b', [0.34, 0.5, 0.2], [0, 0.55, 0], '#8a3a3a'), q('s', [0.3, 0.3, 0.3], [0, 1.1, 0], 'T'), q('c', [0.42, 0.04, 0.42], [0, 1.38, 0], 'U'), q('c', [0.22, 0.2, 0.22], [0, 1.4, 0], 'U'), q('b', [0.06, 0.06, 0.04], [-0.07, 1.2, 0.14], glow, 1, null, 'p'), q('b', [0.06, 0.06, 0.04], [0.07, 1.2, 0.14], glow, 1, null, 'p'), q('k', [0.1, 0.34, 0.1], [-0.5, 0.62, 0], 'T', 0, [0, 0, 3.0], 's'), q('k', [0.1, 0.34, 0.1], [0.5, 0.62, 0], 'T', 0, [0, 0, -3.0], 's')] },

            { id: 'fantasma', n: 'Fantasma Camarada', cat: 'ev', ev: 'halloween', fp: [1, 1], cost: { d: 8 }, nuc: 1, t: ['#eef0ff', '#1a1220'], d: 'Flutua sem pressa e adora companhia.',

              parts: [q('k', [0.8, 0.9, 0.8], [0, 0.25, 0], 'T', 1, null, 'b'), q('s', [0.64, 0.6, 0.64], [0, 0.85, 0], 'T', 1, null, 'b'), q('s', [0.14, 0.2, 0.08], [-0.14, 1.08, 0.28], 'U', 0, null, 'b'), q('s', [0.14, 0.2, 0.08], [0.14, 1.08, 0.28], 'U', 0, null, 'b'), q('s', [0.12, 0.14, 0.06], [0, 0.9, 0.3], 'U', 0, null, 'b'), q('s', [0.2, 0.3, 0.2], [-0.4, 0.8, 0.05], 'T', 1, null, 'b'), q('s', [0.2, 0.3, 0.2], [0.4, 0.8, 0.05], 'T', 1, null, 'b')] },

            { id: 'portao', n: 'Portão de Ferro', cat: 'ev', ev: 'halloween', fp: [2, 1], cost: { d: 6 }, nuc: 1, t: ['#3a3440', '#ff7a1a'], d: 'Pesado, retorcido e com abóboras de guarda.',

              parts: [q('b', [0.36, 1.5, 0.36], [-0.8, 0, 0], '#566379'), q('b', [0.36, 1.5, 0.36], [0.8, 0, 0], '#566379'), q('p', [0.5, 0.3, 0.5], [-0.8, 1.5, 0], '#566379'), q('p', [0.5, 0.3, 0.5], [0.8, 1.5, 0], '#566379'), ...rows(7, i => q('b', [0.05, 1.2, 0.05], [-0.54 + i * 0.18, 0.1, 0], 'T')), q('b', [1.2, 0.07, 0.07], [0, 0.4, 0], 'T'), q('b', [1.2, 0.07, 0.07], [0, 1.05, 0], 'T'),

                  q('k', [0.07, 0.2, 0.07], [-0.54, 1.3, 0], 'T'), q('k', [0.07, 0.2, 0.07], [0.54, 1.3, 0], 'T'), q('s', [0.28, 0.24, 0.28], [-0.8, 1.8, 0], 'U', 1, null, 'p'), q('s', [0.28, 0.24, 0.28], [0.8, 1.8, 0], 'U', 1, null, 'p')] },

            { id: 'cemiterio', n: 'Cemitério', cat: 'ev', ev: 'halloween', fp: [2, 2], cost: { d: 12 }, nuc: 1, t: ['#8a8f9c', '#3a2a40'], d: 'Lápides tortas, uma cruz e névoa ao rés do chão.',

              parts: [q('b', [1.9, 0.06, 1.9], [0, 0, 0], 'U'), q('b', [0.5, 0.7, 0.14], [-0.5, 0.06, -0.4], 'T', 0, [0, 0.2, 0.1]), q('c', [0.5, 0.14, 0.14], [-0.5, 0.74, -0.4], 'T', 0, [1.57, 0.2, 0.1]), q('b', [0.44, 0.55, 0.14], [0.35, 0.06, -0.55], 'T', 0, [0, -0.15, -0.08]), q('c', [0.44, 0.14, 0.14], [0.35, 0.58, -0.55], 'T', 0, [1.57, -0.15, -0.08]),

                  q('b', [0.1, 0.9, 0.1], [0.5, 0.06, 0.45], '#6a5238'), q('b', [0.5, 0.1, 0.1], [0.5, 0.62, 0.45], '#6a5238'), q('b', [0.4, 0.4, 0.14], [-0.6, 0.06, 0.5], 'T', 0, [0, 0.4, 0]), q('s', [0.5, 0.2, 0.9], [0.0, 0.0, 0.2], '#2a1a30'), q('s', [0.14, 0.2, 0.14], [-0.1, 0.1, 0.7], glow, 1, null, 'p'), q('k', [0.14, 0.3, 0.14], [0.8, 0.06, -0.1], '#4a5a3a', 0, null, 's'), q('k', [0.12, 0.26, 0.12], [-0.85, 0.06, -0.1], '#4a5a3a', 0, null, 's')] },

            { id: 'caldeirao', n: 'Caldeirão Borbulhante', cat: 'ev', ev: 'halloween', fp: [1, 1], cost: { d: 10, c: 60 }, prod: { b: 12 }, nuc: 1, t: ['#2a2a34', '#7dff7a'], d: 'Uma poção verde que rende Biomassa, desde que a colônia tenha carga.',

              parts: [q('s', [0.95, 0.8, 0.95], [0, 0.18, 0], 'T'), q('c', [0.9, 0.12, 0.9], [0, 0.8, 0], 'T'), q('c', [0.7, 0.04, 0.7], [0, 0.88, 0], 'U', 1, null, 'p'), q('s', [0.16, 0.16, 0.16], [0.1, 0.92, 0.1], 'U', 1, null, 'b'), q('s', [0.1, 0.1, 0.1], [-0.18, 0.96, -0.1], 'U', 1, null, 'b'), q('b', [0.1, 0.22, 0.1], [-0.35, 0, -0.3], '#3a2f2a'), q('b', [0.1, 0.22, 0.1], [0.35, 0, -0.3], '#3a2f2a'), q('b', [0.1, 0.22, 0.1], [0, 0, 0.4], '#3a2f2a'), q('s', [0.5, 0.2, 0.5], [0, 0, 0], '#ff7a1a', 1, null, 'p')] },

            { id: 'cabana_bruxa', n: 'Cabana da Bruxa', cat: 'ev', ev: 'halloween', fp: [2, 2], cost: { d: 30, c: 150, b: 60 }, fx: { xp: 0.15 }, nuc: 2, t: ['#6a4a8a', '#3a2a24'], d: 'Casa da bruxa estilizada com chaminé mágica. Cada nível: +15% de experiência nas matérias.',

              parts: [q('b', [1.9, 0.12, 1.9], [0, 0, 0], '#3a3a34'), q('b', [1.4, 0.9, 1.2], [0, 0.12, -0.1], 'U'), ...rows(3, i => q('b', [1.42, 0.05, 1.22], [0, 0.2 + i * 0.25, -0.1], '#4a3a2c')), q('p', [2.3, 1.1, 2.0], [0, 1.0, -0.1], 'T'), q('k', [0.9, 0.7, 0.9], [0.1, 1.9, -0.1], 'T', 0, [0, 0, -0.35]), q('b', [0.3, 0.9, 0.3], [0.5, 1.0, -0.5], '#6b6f7a'), q('c', [0.34, 0.1, 0.34], [0.5, 1.9, -0.5], '#2b3340'),

                  q('b', [0.4, 0.5, 0.05], [0, 0.12, 0.52], '#2a1a12'), win(-0.5, 0.5, 0.52, 'z', 0.24, 0.3), win(0.5, 0.5, 0.52, 'z', 0.24, 0.3), q('b', [0.04, 0.3, 0.24], [0.71, 0.5, -0.3], '#7dff7a', 1, null, 'p'), q('c', [0.05, 1.1, 0.05], [0.85, 0, 0.7], '#6a4a2a', 0, [0, 0, 0.5]), q('k', [0.16, 0.34, 0.16], [1.1, 0.0, 0.58], '#c9a86a', 0, [0, 0, 2.0])] },

            { id: 'barraca_doces', n: 'Barraca de Doces', cat: 'ev', ev: 'halloween', fp: [2, 1], cost: { d: 20, c: 200 }, fx: { cd: 1 }, nuc: 2, t: ['#ff7a1a', '#4a2a5a'], d: 'Cada nível: +1 doce a cada sessão de estudo.',

              parts: [q('b', [1.9, 0.1, 0.95], [0, 0, 0], '#3a2f2a'), q('b', [1.7, 0.6, 0.6], [0, 0.1, -0.1], 'U'), q('b', [1.8, 0.06, 0.8], [0, 0.7, 0], '#6a4a2a'), q('b', [0.1, 1.3, 0.1], [-0.85, 0.1, 0.35], '#6a4a2a'), q('b', [0.1, 1.3, 0.1], [0.85, 0.1, 0.35], '#6a4a2a'), ...rows(6, i => q('b', [0.3, 0.06, 0.9], [-0.75 + i * 0.3, 1.42 - Math.abs(i - 2.5) * 0.01, 0.0], i % 2 ? 'T' : '#f2e6d3')), q('s', [0.2, 0.2, 0.2], [-0.5, 0.8, 0.1], '#ff3b6a'), q('s', [0.2, 0.2, 0.2], [-0.15, 0.8, 0.1], glow, 1, null, 'p'), q('s', [0.2, 0.2, 0.2], [0.2, 0.8, 0.1], '#7dff7a'), q('s', [0.2, 0.2, 0.2], [0.55, 0.8, 0.1], '#b36bff'), q('s', [0.3, 0.3, 0.3], [0, 1.5, 0.3], 'T', 1, null, 'p')] },

            { id: 'casa_assombrada', n: 'Casa Mal-Assombrada', cat: 'ev', ev: 'halloween', fp: [3, 3], cost: { d: 45, c: 300, b: 100 }, fx: { pop: 22 }, nuc: 3, t: ['#3a2f4a', '#ff9a3d'], d: 'Rangendo, torta e lotada de moradores. Abriga 22.',

              parts: [q('b', [2.9, 0.12, 2.9], [0, 0, 0], '#2a2a30'), q('b', [2.0, 1.6, 1.6], [-0.2, 0.12, -0.3], 'T', 0, [0, 0.04, 0]), q('b', [2.05, 0.1, 1.65], [-0.2, 0.9, -0.3], '#241a2c'), ...roof(2.0, 1.6, 1.72, 1.1, '#2a2030', -0.2, -0.3), q('b', [0.9, 2.3, 0.9], [0.95, 0.12, -0.4], 'T'), q('p', [1.4, 1.1, 1.4], [0.95, 2.42, -0.4], '#2a2030'), q('k', [0.2, 0.6, 0.2], [0.95, 3.5, -0.4], '#1a1220'), q('s', [0.18, 0.18, 0.18], [0.95, 4.0, -0.4], glow, 1, null, 'p'),

                  q('b', [0.5, 0.9, 0.06], [-0.2, 0.12, 0.52], '#1a0f10'), win(-0.9, 0.8, 0.52, 'z', 0.3, 0.4), win(0.5, 0.8, 0.52, 'z', 0.3, 0.4), win(-0.4, 1.6, 0.52, 'z', 0.3, 0.4), win(0.95, 1.5, 0.07, 'z', 0.3, 0.44), win(0.95, 0.9, 0.07, 'z', 0.3, 0.44), win(1.41, 1.4, -0.4, 'x', 0.3, 0.44),

                  q('b', [0.8, 0.06, 0.4], [-0.2, 0.12, 0.76], '#4a3a2c'), q('b', [0.06, 0.4, 0.06], [-0.55, 0.18, 0.9], '#4a3a2c'), q('b', [0.06, 0.4, 0.06], [0.15, 0.18, 0.9], '#4a3a2c'), q('s', [0.3, 0.26, 0.3], [-0.55, 0.58, 0.9], 'U', 1, null, 'p'), q('s', [0.3, 0.26, 0.3], [0.15, 0.58, 0.9], 'U', 1, null, 'p'),

                  q('k', [0.12, 0.7, 0.12], [-1.2, 0.12, 1.1], '#3a3a2a', 0, null, 's'), q('b', [0.08, 0.3, 0.08], [-1.2, 0.0, 1.1], '#1a1220'), q('s', [0.1, 0.1, 0.1], [0.5, 2.2, 0.4], '#1b1226', 0, null, 'b')] }

        ];

        P.splice(P.findIndex(p => p.id === 'nucleo'), 0, ...EV);

        /* ---- fase tardia (Núcleos 12 a 30): peças grandes e animadas para quem já chegou longe; custos e produção crescem com o Núcleo ---- */

        const NUCC = n => ({ c: Math.round(280 * Math.pow(2.05, Math.min(n, 12) - 1) * Math.pow(1.58, Math.max(0, n - 12))), b: Math.round(155 * Math.pow(1.68, n - 1)), m: Math.round(100 * Math.pow(1.68, n - 1)) });

        const CC = (n, fc, fb, fm) => { const k = NUCC(n), o = {}; if (fc) o.c = Math.round(k.c * fc); if (fb) o.b = Math.round(k.b * fb); if (fm) o.m = Math.round(k.m * fm); return o; };

        const PP = (n, c, b, m) => { const k = 160 * Math.pow(1.3, n - 10), o = {}; if (c) o.c = Math.round(k * c * 0.35); if (b) o.b = Math.round(k * b); if (m) o.m = Math.round(k * m); return o; };

        const tower = (w, d, fl, gl) => [base(w + 0.2, d + 0.2, '#2a303c'), q('b', [w, fl * 0.34 + 0.2, d], [0, 0.12, 0], 'T'), q('b', [w * 1.06, 0.08, d * 1.06], [0, 0.32 + fl * 0.34, 0], '#566379'), ...rows(fl, i => [-1, 1].flatMap(s => [win(s * w * 0.22, 0.34 + i * 0.34, d / 2 + 0.01, 'z', w * 0.2, 0.2), win(s * w * 0.22, 0.34 + i * 0.34, -d / 2 - 0.01, 'z', w * 0.2, 0.2)])), q('c', [0.07, 1.1, 0.07], [0, 0.4 + fl * 0.34, 0], '#8a93a6'), q('s', [0.18, 0.18, 0.18], [0, 1.5 + fl * 0.34, 0], gl || 'U', 1, null, 'p')];

        const dome = (r, hg, bands, gl) => [q('c', [r * 2, 0.2, r * 2], [0, 0, 0], '#2f3542'), q('s', [r * 1.9, hg, r * 1.9], [0, 0.1, 0], 'T'), ...rows(bands, i => q('c', [r * (1.75 - i * 0.3), 0.04, r * (1.75 - i * 0.3)], [0, 0.3 + i * hg * 0.2, 0], '#e8eef7')), q('s', [r * 0.8, r * 0.8, r * 0.8], [0, 0.3, 0], gl || 'U', 1, null, 'b')];

        const orbs = (r, y, n, k, c, an) => rows(n, i => { const a = i / n * 6.2832; return q('s', [k, k, k], [Math.cos(a) * r, y, Math.sin(a) * r], c, 1, null, an || 'r'); });

        const crys = (r, h, n, c1, c2) => [base(r * 2, r * 2, '#2f3542'), ...rows(n, i => { const a = i / n * 6.2832, rr = i ? r * 0.55 : 0; return q('k', [r * 0.5, h * (i ? 0.5 + ((i * 7) % 5) * 0.1 : 1), r * 0.5], [Math.cos(a) * rr, 0.12, Math.sin(a) * rr], i % 2 ? c2 : c1, 1, null, 'b'); })];

        const sol = (cols, rw) => [base(cols * 0.9 + 0.4, rw * 0.9 + 0.4, '#2f3542'), ...rows(cols * rw, i => q('b', [0.8, 0.05, 0.8], [(i % cols - (cols - 1) / 2) * 0.9, 0.55, (Math.floor(i / cols) - (rw - 1) / 2) * 0.9], 'T', 0, [-0.5, 0, 0])), ...rows(cols * rw, i => q('b', [0.05, 0.45, 0.05], [(i % cols - (cols - 1) / 2) * 0.9, 0.12, (Math.floor(i / cols) - (rw - 1) / 2) * 0.9], '#8a93a6')), q('s', [0.3, 0.3, 0.3], [0, 1.0, 0], 'U', 1, null, 'p')];

        const mansion = (w, d, h, c) => [base(w + 0.2, d + 0.2, '#3a4452'), q('b', [w, h, d], [0, 0.12, 0], 'T'), ...roof(w, d, h + 0.12, 0.7, 'U'), win(-w * 0.25, h * 0.55, d / 2 + 0.01, 'z', w * 0.18, 0.3), win(w * 0.25, h * 0.55, d / 2 + 0.01, 'z', w * 0.18, 0.3), q('b', [0.4, 0.7, 0.05], [0, 0.12, d / 2 + 0.02], '#3a2a20')];

        const LATE = [

            { id: 'robo_patrulha', n: 'Robô Patrulha', cat: 'dec', fp: [1, 1], cost: CC(9, 0.06, 0.04, 0.1), nuc: 9, t: ['#4fa8ff', '#9ee3ff'], d: 'Um robô de segurança, animado, que vigia a colônia.', parts: [base(0.9, 0.9, '#3a4452'), q('b', [0.4, 0.7, 0.3], [0, 0.12, 0], 'T'), q('b', [0.5, 0.2, 0.3], [0, 0.78, 0], 'U'), q('s', [0.26, 0.26, 0.26], [0, 1.0, 0], 'U', 1, null, 'p')] },

            { id: 'colhedor_solar', n: 'Colhedor Solar', cat: 'prod', fp: [3, 3], cost: CC(12, 0.22, 0.2, 0.12), prod: PP(12, 1, 0.5), nuc: 12, t: ['#3a6ea8', '#ffd166'], d: 'Um campo de painéis que acompanha a estrela e rende Cristal e Biomassa.', parts: sol(3, 3) },

            { id: 'siderurgica', n: 'Siderúrgica', cat: 'prod', fp: [3, 3], cost: CC(14, 0.2, 0.18, 0.14), prod: PP(14, 0.3, 0, 1.4), nuc: 14, t: ['#8a93a6', '#ff8a3d'], d: 'Chaminés enormes e Metal em escala industrial.', parts: [base(2.9, 2.9, '#2a2a30'), q('b', [2.4, 1.0, 1.6], [0, 0.12, -0.4], 'T'), ...[-0.8, 0, 0.8].map(x => q('c', [0.5, 2.2, 0.5], [x, 0.12, -0.9], '#566379')), ...[-0.8, 0, 0.8].map(x => q('s', [0.3, 0.3, 0.3], [x, 2.4, -0.9], 'U', 1, null, 'p')), q('b', [2.2, 0.1, 0.8], [0, 0.12, 0.8], '#3a2f2a'), q('b', [1.6, 0.4, 0.6], [0, 0.22, 0.8], 'U', 1, null, 'p')] },

            { id: 'biodomo', n: 'Biodomo', cat: 'prod', fp: [4, 4], cost: CC(16, 0.2, 0.2, 0.12), prod: PP(16, 0.4, 1.8), nuc: 16, t: ['#cfe4ff', '#58b35c'], d: 'Uma floresta fechada em vidro que rende muita Biomassa.', parts: [...dome(1.9, 2.4, 3, '#7dff9a'), ...rows(6, i => { const a = i * 1.05; return [q('c', [0.14, 0.9, 0.14], [Math.cos(a) * 1.0, 0.2, Math.sin(a) * 1.0], '#7a5535'), q('s', [0.8, 0.8, 0.8], [Math.cos(a) * 1.0, 0.9, Math.sin(a) * 1.0], '#4fb36a', 0, null, 's')]; }).flat()] },

            { id: 'nexo_cristal', n: 'Nexo de Cristal', cat: 'prod', fp: [3, 3], cost: CC(18, 0.22, 0.1, 0.18), prod: PP(18, 2.2), nuc: 18, t: ['#5ee0ff', '#c4f4ff'], d: 'Cristais gigantes em ressonância: o maior campo de Cristal.', parts: [...crys(1.4, 3.4, 8, '#5ee0ff', '#c4f4ff'), ...orbs(1.5, 1.8, 5, 0.18, '#ffffff', 'r')] },

            { id: 'forja_estelar2', n: 'Forja da Estrela', cat: 'prod', fp: [4, 4], cost: CC(21, 0.2, 0.15, 0.2), prod: PP(21, 0.8, 0.4, 2.2), nuc: 21, t: ['#ff8a3d', '#8a93a6'], d: 'Funde Metal com o calor de uma estrela de verdade.', parts: [base(3.9, 3.9, '#2a2a30'), q('c', [2.6, 1.2, 2.6], [0, 0.12, 0], 'U'), q('c', [2.0, 0.1, 2.0], [0, 1.32, 0], 'T', 1, null, 'p'), q('s', [1.4, 1.4, 1.4], [0, 1.0, 0], 'T', 1, null, 'b'), ...orbs(1.9, 1.6, 8, 0.2, '#ffd166', 'r'), ...orbs(2.4, 0.5, 6, 0.3, '#ff5a3a', 'R')] },

            { id: 'colheita_orbital', n: 'Colheita Orbital', cat: 'prod', fp: [4, 4], cost: CC(24, 0.2, 0.18, 0.18), prod: PP(24, 1.2, 1.2, 1.2), nuc: 24, t: ['#9ee3ff', '#b79cff'], d: 'Um anel que gira sobre a colônia e traz de tudo um pouco.', parts: [base(3.9, 3.9, '#2f3542'), q('c', [0.6, 2.2, 0.6], [0, 0.12, 0], 'U'), q('c', [3.4, 0.08, 3.4], [0, 2.3, 0], 'T', 1, null, 'r'), ...orbs(1.7, 2.4, 6, 0.35, 'T', 'r'), q('c', [2.2, 0.06, 2.2], [0, 2.9, 0], 'U', 1, null, 'R'), q('s', [0.7, 0.7, 0.7], [0, 2.3, 0], '#ffffff', 1, null, 'p')] },

            { id: 'fusao', n: 'Reator de Fusão', cat: 'prod', fp: [4, 4], cost: CC(27, 0.2, 0.2, 0.2), prod: PP(27, 1.8, 1.8, 1.8), nuc: 27, t: ['#7dff9a', '#ffd166'], d: 'Uma estrela em miniatura presa em anéis de energia.', parts: [base(3.9, 3.9, '#2a303c'), q('c', [1.0, 1.0, 1.0], [0, 0.12, 0], 'U'), q('s', [1.6, 1.6, 1.6], [0, 1.0, 0], 'T', 1, null, 'p'), q('c', [3.0, 0.07, 3.0], [0, 1.8, 0], '#ffd166', 1, null, 'r'), q('c', [2.4, 0.07, 2.4], [0, 1.8, 0], 'U', 1, null, 'R'), ...orbs(1.5, 1.8, 4, 0.22, '#ffffff', 'r')] },

            { id: 'poco_dim', n: 'Poço Dimensional', cat: 'prod', fp: [4, 4], cost: CC(30, 0.2, 0.2, 0.2), prod: PP(30, 3, 3, 3), nuc: 30, t: ['#b79cff', '#4fb8ff'], d: 'Um buraco que traz recursos de outros lugares. O máximo da produção.', parts: [base(3.9, 3.9, '#1f1638'), q('c', [3.2, 0.2, 3.2], [0, 0.12, 0], 'U'), q('c', [2.4, 0.06, 2.4], [0, 0.32, 0], '#05030a'), q('c', [2.8, 0.06, 2.8], [0, 0.34, 0], 'T', 1, null, 'p'), q('c', [2.0, 0.06, 2.0], [0, 0.4, 0], 'U', 1, null, 'R'), ...orbs(1.3, 1.2, 7, 0.24, 'T', 'r'), q('k', [0.8, 3.2, 0.8], [0, 0.4, 0], 'T', 1, null, 'p')] },

            { id: 'torre_vidro', n: 'Torre de Vidro', cat: 'casa', fp: [2, 2], cost: CC(12, 0.12, 0.15, 0.1), fx: { pop: 45 }, nuc: 12, t: ['#cfe4ff', '#4fb8ff'], d: 'Moradias envidraçadas. Abriga 45 moradores.', parts: tower(1.5, 1.5, 10, '#4fb8ff') },

            { id: 'arranha_ceu', n: 'Arranha-céu', cat: 'casa', fp: [3, 3], cost: CC(14, 0.14, 0.18, 0.12), fx: { pop: 90 }, nuc: 14, t: ['#cfd6e2', '#ffd166'], d: 'Uma cidade em vertical. Abriga 90 moradores.', parts: tower(2.2, 2.2, 14, '#ff6b5e') },

            { id: 'habitat', n: 'Hábitat Orbital', cat: 'casa', fp: [3, 3], cost: CC(17, 0.15, 0.18, 0.12), fx: { pop: 160 }, nuc: 17, t: ['#e8eef7', '#5ee0ff'], d: 'Um anel habitável suspenso no ar. Abriga 160 moradores.', parts: [base(2.9, 2.9, '#2f3542'), q('c', [0.7, 1.4, 0.7], [0, 0.12, 0], 'U'), q('c', [2.8, 0.5, 2.8], [0, 1.5, 0], 'T'), q('c', [2.1, 0.55, 2.1], [0, 1.48, 0], '#05030a'), ...rows(12, i => { const a = i * 0.5236; return win(Math.cos(a) * 1.41, 1.65, Math.sin(a) * 1.41, 'z', 0.2, 0.2); }), ...orbs(1.5, 2.3, 4, 0.2, 'U', 'r')] },

            { id: 'arcologia', n: 'Arcologia', cat: 'casa', fp: [4, 4], cost: CC(20, 0.16, 0.2, 0.14), fx: { pop: 300 }, nuc: 20, t: ['#e8dccb', '#58b35c'], d: 'Uma cidade-prédio com jardins em cada andar. Abriga 300 moradores.', parts: [base(3.9, 3.9, '#2a303c'), ...rows(5, i => q('b', [3.0 - i * 0.4, 0.8, 3.0 - i * 0.4], [0, 0.12 + i * 0.85, 0], i % 2 ? 'U' : 'T')), ...rows(5, i => q('s', [0.9, 0.5, 0.9], [1.1 - i * 0.12, 0.92 + i * 0.85, 1.1 - i * 0.12], '#4fb36a', 0, null, 's')), ...rows(5, i => win(-0.7, 0.5 + i * 0.85, 1.5 - i * 0.2, 'z', 0.5, 0.3)), q('s', [0.4, 0.4, 0.4], [0, 4.6, 0], 'U', 1, null, 'p')] },

            { id: 'cidade_flutuante', n: 'Cidade Flutuante', cat: 'casa', fp: [4, 4], cost: CC(24, 0.16, 0.2, 0.14), fx: { pop: 520 }, nuc: 24, t: ['#cfe4ff', '#ff7ac8'], d: 'Casas, ruas e um parque no ar. Abriga 520 moradores.', parts: [q('k', [3.2, 1.4, 3.2], [0, 0.4, 0], '#4a4238', 0, [Math.PI, 0, 0], 'b'), q('c', [3.6, 0.3, 3.6], [0, 1.4, 0], 'T', 0, null, 'b'), ...rows(7, i => { const a = i * 0.9, r = 1.1 + (i % 2) * 0.5; return [q('b', [0.6, 0.5 + (i % 3) * 0.2, 0.6], [Math.cos(a) * r, 1.7, Math.sin(a) * r], i % 2 ? 'U' : '#f2e6d3', 0, null, 'b'), q('p', [0.8, 0.35, 0.8], [Math.cos(a) * r, 2.2 + (i % 3) * 0.2, Math.sin(a) * r], 'U', 0, null, 'b')]; }).flat(), q('s', [0.5, 0.5, 0.5], [0, 2.8, 0], '#7dff9a', 1, null, 'p')] },

            { id: 'cupula_estelar', n: 'Cúpula Estelar', cat: 'casa', fp: [4, 4], cost: CC(28, 0.18, 0.2, 0.15), fx: { pop: 900 }, nuc: 28, t: ['#cfe4ff', '#ffd166'], d: 'Um domo com um céu de verdade dentro. Abriga 900 moradores.', parts: [...dome(1.95, 3.0, 4, '#ffffff'), ...orbs(1.0, 1.2, 8, 0.16, '#ffd166', 'r'), ...orbs(1.4, 0.6, 6, 0.14, '#7dff9a', 'R')] },

            { id: 'armazem_q', n: 'Armazém Quântico', cat: 'util', fp: [2, 2], cost: CC(12, 0.14, 0.12, 0.2), fx: { cap: 4000 }, nuc: 12, t: ['#b79cff', '#566379'], d: 'Cada nível: +4.000 de espaço para cada recurso.', parts: [base(1.9, 1.9, '#2f3542'), q('b', [1.5, 1.3, 1.5], [0, 0.12, 0], 'T'), q('b', [1.2, 0.05, 1.2], [0, 1.2, 0], 'U', 1, null, 'p'), ...rows(3, i => q('b', [1.52, 0.06, 1.52], [0, 0.4 + i * 0.35, 0], 'U')), q('s', [0.3, 0.3, 0.3], [0, 1.6, 0], 'U', 1, null, 'r')] },

            { id: 'bateria_fusao', n: 'Bateria de Fusão', cat: 'util', fp: [2, 1], cost: CC(13, 0.12, 0.1, 0.18), fx: { charge: 14 }, nuc: 13, t: ['#7dff9a', '#2f3542'], d: 'Cada nível: guarda +14 h de carga de estudo.', parts: [base(1.9, 0.95, '#2f3542'), ...rows(3, i => q('c', [0.5, 1.0, 0.5], [-0.6 + i * 0.6, 0.12, 0], '#566379')), ...rows(3, i => q('s', [0.4, 0.4, 0.4], [-0.6 + i * 0.6, 1.1, 0], 'T', 1, null, 'p'))] },

            { id: 'academia', n: 'Academia de Ciências', cat: 'util', fp: [3, 2], cost: CC(15, 0.14, 0.16, 0.1), fx: { xp: 0.3 }, nuc: 15, t: ['#f2c14e', '#e8dccb'], d: 'Cada nível: +30% de experiência nas matérias.', parts: [...mansion(2.6, 1.6, 1.4), ...rows(5, i => q('c', [0.14, 1.3, 0.14], [-1.0 + i * 0.5, 0.12, 0.9], '#f2e6d3')), q('s', [0.5, 0.5, 0.5], [0, 2.6, 0], 'U', 1, null, 'b')] },

            { id: 'lab_q', n: 'Laboratório Quântico', cat: 'util', fp: [2, 2], cost: CC(17, 0.14, 0.12, 0.18), fx: { prodm: 0.15 }, nuc: 17, t: ['#9ee3ff', '#b79cff'], d: 'Cada nível: +15% de produção em tudo.', parts: [base(1.9, 1.9, '#2f3542'), q('b', [1.5, 0.9, 1.5], [0, 0.12, 0], 'U'), q('s', [1.0, 1.0, 1.0], [0, 1.0, 0], 'T', 1, null, 'b'), ...orbs(0.8, 1.5, 3, 0.18, '#ffffff', 'r'), q('c', [1.3, 0.04, 1.3], [0, 1.5, 0], 'T', 1, null, 'R')] },

            { id: 'obs_profundo', n: 'Observatório Profundo', cat: 'util', fp: [3, 3], cost: CC(19, 0.14, 0.14, 0.14), fx: { xp: 0.4 }, nuc: 19, t: ['#e8eef7', '#4fb8ff'], d: 'Cada nível: +40% de experiência. Enxerga galáxias inteiras.', parts: [...dome(1.4, 1.6, 2, '#4fb8ff'), q('c', [0.3, 1.8, 0.3], [0.5, 0.3, 0.3], '#8a93a6', 0, [0, 0, -0.9]), q('s', [0.3, 0.3, 0.3], [1.3, 1.9, 0.9], 'T', 1, null, 'p'), ...orbs(1.9, 0.5, 6, 0.1, '#ffffff', 'R')] },

            { id: 'cofre_dim', n: 'Cofre Dimensional', cat: 'util', fp: [3, 3], cost: CC(22, 0.14, 0.14, 0.2), fx: { cap: 14000 }, nuc: 22, t: ['#b4bccb', '#b79cff'], d: 'Cada nível: +14.000 de espaço para cada recurso.', parts: [base(2.9, 2.9, '#2f3542'), q('b', [2.2, 1.8, 2.2], [0, 0.12, 0], 'T'), q('b', [1.6, 1.3, 0.06], [0, 0.4, 1.12], '#566379'), q('c', [0.8, 0.07, 0.8], [0, 1.0, 1.15], 'U', 1, null, 'R'), ...orbs(1.6, 2.2, 4, 0.2, 'U', 'r'), q('s', [0.5, 0.5, 0.5], [0, 2.1, 0], 'U', 1, null, 'p')] },

            { id: 'reator_bat', n: 'Banco de Energia', cat: 'util', fp: [3, 3], cost: CC(25, 0.14, 0.12, 0.2), fx: { charge: 36 }, nuc: 25, t: ['#7dff9a', '#ffd166'], d: 'Cada nível: guarda +36 h de carga de estudo.', parts: [base(2.9, 2.9, '#2a303c'), ...rows(7, i => { const a = i / 7 * 6.2832; return q('c', [0.5, 1.8, 0.5], [Math.cos(a) * 1.0, 0.12, Math.sin(a) * 1.0], '#566379'); }), ...rows(7, i => { const a = i / 7 * 6.2832; return q('s', [0.4, 0.4, 0.4], [Math.cos(a) * 1.0, 2.0, Math.sin(a) * 1.0], 'T', 1, null, 'p'); }), q('s', [0.9, 0.9, 0.9], [0, 1.6, 0], 'U', 1, null, 'b')] },

            { id: 'supercomp', n: 'Supercomputador', cat: 'util', fp: [3, 2], cost: CC(26, 0.14, 0.14, 0.18), fx: { prodm: 0.3 }, nuc: 26, t: ['#9ee3ff', '#2f3542'], d: 'Cada nível: +30% de produção em tudo.', parts: [base(2.9, 1.9, '#1a1f2a'), ...rows(6, i => q('b', [0.4, 1.6 + (i % 3) * 0.2, 1.4], [-1.1 + i * 0.44, 0.12, 0], 'U')), ...rows(6, i => q('b', [0.34, 0.06, 0.04], [-1.1 + i * 0.44, 0.5 + (i % 4) * 0.3, 0.72], 'T', 1, null, 'p')), q('s', [0.4, 0.4, 0.4], [0, 2.1, 0], 'T', 1, null, 'r')] },

            { id: 'portal_estudo', n: 'Portal do Saber', cat: 'util', fp: [3, 3], cost: CC(29, 0.16, 0.16, 0.16), fx: { xp: 0.8 }, nuc: 29, t: ['#b79cff', '#ffd166'], d: 'Cada nível: +80% de experiência. Todo o conhecimento do universo, num arco.', parts: [base(2.9, 2.9, '#1f1638'), q('b', [0.5, 3.0, 0.5], [-1.1, 0.12, 0], 'U'), q('b', [0.5, 3.0, 0.5], [1.1, 0.12, 0], 'U'), q('b', [2.7, 0.5, 0.5], [0, 3.0, 0], 'U'), q('c', [1.9, 0.05, 1.9], [0, 0.9, 0], 'T', 1, null, 'p'), q('s', [1.4, 1.4, 1.4], [0, 1.5, 0], 'T', 1, null, 'b'), ...orbs(0.9, 1.5, 6, 0.16, '#ffffff', 'r')] },

            { id: 'floresta_antiga', n: 'Floresta Antiga', cat: 'nat', fp: [3, 3], cost: CC(12, 0.08, 0.1, 0), nuc: 12, t: ['#2f8f5a', '#6a4a30'], d: 'Árvores centenárias e um chão de musgo.', parts: [q('b', [2.9, 0.1, 2.9], [0, 0, 0], '#2a4a30'), ...rows(7, i => { const a = i * 0.9, r = i ? 0.9 + (i % 3) * 0.3 : 0; return [q('c', [0.3, 1.6 + (i % 3) * 0.3, 0.3], [Math.cos(a) * r, 0.1, Math.sin(a) * r], 'U'), q('s', [1.3, 1.1, 1.3], [Math.cos(a) * r, 1.3 + (i % 3) * 0.3, Math.sin(a) * r], 'T', 0, null, 's')]; }).flat()] },

            { id: 'jardim_suspenso', n: 'Jardim Suspenso', cat: 'nat', fp: [3, 3], cost: CC(15, 0.08, 0.12, 0), nuc: 15, t: ['#7bd17f', '#ff7ac8'], d: 'Terraços cheios de flores que parecem flutuar.', parts: [q('b', [2.8, 0.2, 2.8], [0, 0.3, 0], '#5a4a30', 0, null, 'b'), q('b', [2.6, 0.12, 2.6], [0, 0.5, 0], 'T', 0, null, 'b'), q('b', [1.9, 0.2, 1.9], [0, 1.0, 0], '#5a4a30', 0, null, 'b'), q('b', [1.7, 0.12, 1.7], [0, 1.2, 0], 'T', 0, null, 'b'), ...rows(9, i => q('s', [0.3, 0.3, 0.3], [-1.0 + (i % 3) * 1.0, 0.7, -1.0 + Math.floor(i / 3) * 1.0], i % 2 ? 'U' : '#ffd27a', 0, null, 's')), q('c', [0.12, 0.5, 0.12], [0, 0, 0], '#6a4a30')] },

            { id: 'lago_cristal', n: 'Lago de Cristal', cat: 'nat', fp: [4, 4], cost: CC(18, 0.1, 0.1, 0.05), nuc: 18, t: ['#4fb8ff', '#c4f4ff'], d: 'Água azul-estrela e cristais nas margens.', parts: [q('c', [3.9, 0.12, 3.9], [0, 0, 0], '#4a5260'), q('c', [3.6, 0.06, 3.6], [0, 0.12, 0], 'T', 1, null, 'p'), ...rows(7, i => { const a = i * 0.9; return q('k', [0.4, 0.8 + (i % 3) * 0.4, 0.4], [Math.cos(a) * 1.6, 0.12, Math.sin(a) * 1.6], 'U', 1, null, 'b'); })] },

            { id: 'arvore_mundo', n: 'Árvore do Mundo', cat: 'nat', fp: [4, 4], cost: CC(22, 0.12, 0.14, 0.05), nuc: 22, t: ['#4fd68a', '#6a4a30'], d: 'Uma árvore imensa com raízes que cobrem o terreno e luzes na copa.', parts: [q('c', [1.0, 3.6, 1.0], [0, 0, 0], 'U'), ...rows(6, i => { const a = i * 1.047; return q('b', [0.3, 0.2, 1.4], [Math.cos(a) * 0.9, 0.0, Math.sin(a) * 0.9], 'U', 0, [0, -a + 1.57, 0]); }), q('s', [3.8, 2.2, 3.8], [0, 3.0, 0], 'T', 0, null, 's'), q('s', [2.6, 1.8, 2.6], [0.6, 4.4, 0.3], 'T', 0, null, 's'), ...orbs(1.5, 3.6, 8, 0.12, '#ffd166', 'r')] },

            { id: 'geiser', n: 'Gêiser Estelar', cat: 'nat', fp: [2, 2], cost: CC(26, 0.1, 0.1, 0.1), nuc: 26, t: ['#9ee3ff', '#4a4238'], d: 'Jatos de energia que sobem do chão a cada poucos segundos.', parts: [q('c', [1.9, 0.2, 1.9], [0, 0, 0], 'U'), q('k', [1.2, 0.6, 1.2], [0, 0.2, 0], '#4a4238'), q('k', [0.4, 3.0, 0.4], [0, 0.6, 0], 'T', 1, null, 'p'), q('s', [0.7, 0.7, 0.7], [0, 3.4, 0], 'T', 1, null, 'b'), ...orbs(0.6, 2.4, 4, 0.14, '#ffffff', 'r')] },

            { id: 'monumento', n: 'Monumento ao Estudo', cat: 'dec', fp: [2, 2], cost: CC(13, 0.1, 0.1, 0.1), nuc: 13, t: ['#e8eef7', '#ffd166'], d: 'Um livro gigante de pedra com uma chama que nunca apaga.', parts: [base(1.9, 1.9, '#3a4452'), q('b', [1.4, 0.3, 1.0], [0, 0.12, 0], 'T'), q('b', [1.2, 1.4, 0.2], [0, 0.4, -0.15], 'T', 0, [0.2, 0, 0.12]), q('b', [1.2, 1.4, 0.2], [0, 0.4, 0.15], 'T', 0, [-0.2, 0, -0.12]), q('s', [0.4, 0.5, 0.4], [0, 1.9, 0], 'U', 1, null, 'p')] },

            { id: 'fonte_estelar', n: 'Fonte Estelar', cat: 'dec', fp: [3, 3], cost: CC(16, 0.1, 0.1, 0.12), nuc: 16, t: ['#4fb8ff', '#e8eef7'], d: 'Água que sobe em espiral e cai como estrelas.', parts: [q('c', [2.9, 0.4, 2.9], [0, 0, 0], 'U'), q('c', [2.5, 0.06, 2.5], [0, 0.4, 0], 'T', 1, null, 'p'), q('c', [0.5, 1.4, 0.5], [0, 0.3, 0], 'U'), q('c', [1.4, 0.12, 1.4], [0, 1.6, 0], 'U'), q('k', [0.5, 1.6, 0.5], [0, 1.7, 0], 'T', 1, null, 'b'), ...orbs(1.1, 1.4, 8, 0.14, 'T', 'r'), ...orbs(0.7, 2.4, 5, 0.12, '#ffffff', 'R')] },

            { id: 'arco_triunfal', n: 'Arco do Triunfo', cat: 'dec', fp: [4, 2], cost: CC(19, 0.1, 0.1, 0.12), nuc: 19, t: ['#e8dccb', '#ffd166'], d: 'Para marcar a passagem de quem estudou muito.', parts: [base(3.9, 1.9, '#3a4452'), q('b', [0.8, 2.6, 1.2], [-1.4, 0.12, 0], 'T'), q('b', [0.8, 2.6, 1.2], [1.4, 0.12, 0], 'T'), q('b', [3.6, 0.8, 1.3], [0, 2.7, 0], 'T'), q('b', [3.0, 0.1, 1.35], [0, 3.1, 0], 'U', 1, null, 'p'), q('s', [0.4, 0.4, 0.4], [0, 3.8, 0], 'U', 1, null, 'b')] },

            { id: 'colosso', n: 'Colosso', cat: 'dec', fp: [2, 2], cost: CC(23, 0.12, 0.1, 0.14), nuc: 23, t: ['#cfd6e2', '#ffd166'], d: 'Uma estátua gigante que olha a estrela de braços erguidos.', parts: [base(1.9, 1.9, '#3a4452'), q('b', [1.2, 0.6, 1.2], [0, 0.12, 0], 'U'), q('c', [0.6, 1.8, 0.4], [0, 0.7, 0], 'T'), q('b', [0.3, 1.2, 0.3], [-0.55, 1.5, 0], 'T', 0, [0, 0, 0.5]), q('b', [0.3, 1.2, 0.3], [0.55, 1.5, 0], 'T', 0, [0, 0, -0.5]), q('s', [0.55, 0.6, 0.55], [0, 2.5, 0], 'T'), q('s', [0.3, 0.3, 0.3], [0, 3.2, 0], 'U', 1, null, 'p')] },

            { id: 'esfera_armilar', n: 'Esfera Armilar', cat: 'dec', fp: [3, 3], cost: CC(27, 0.12, 0.1, 0.14), nuc: 27, t: ['#ffd166', '#4fb8ff'], d: 'Anéis dourados que giram em torno de uma estrela pequena.', parts: [base(2.9, 2.9, '#2f3542'), q('c', [0.3, 1.0, 0.3], [0, 0.12, 0], 'T'), q('s', [0.6, 0.6, 0.6], [0, 1.6, 0], '#ffffff', 1, null, 'p'), q('c', [2.4, 0.06, 2.4], [0, 1.9, 0], 'T', 1, null, 'r'), q('c', [1.9, 0.06, 1.9], [0, 1.9, 0], 'U', 1, null, 'R'), q('c', [1.4, 0.06, 1.4], [0, 1.9, 0], 'T', 1, null, 'r'), ...orbs(1.2, 1.9, 4, 0.14, 'U', 'r')] },

            { id: 'portal_estelar', n: 'Portal Estelar', cat: 'dec', fp: [3, 3], cost: CC(30, 0.14, 0.12, 0.16), nuc: 30, t: ['#b79cff', '#4fb8ff'], d: 'Uma porta redonda para outro canto do universo.', parts: [base(2.9, 2.9, '#1f1638'), q('c', [2.8, 0.2, 0.3], [0, 0.12, 0], 'U', 0, [Math.PI / 2, 0, 0]), q('c', [0.5, 3.2, 0.5], [-1.2, 0.12, 0], 'U'), q('c', [0.5, 3.2, 0.5], [1.2, 0.12, 0], 'U'), q('c', [2.4, 0.5, 0.5], [0, 3.1, 0], 'U', 0, [0, 0, Math.PI / 2]), q('s', [2.0, 2.2, 0.2], [0, 0.6, 0], 'T', 1, null, 'p'), q('s', [1.2, 1.3, 0.2], [0, 1.0, 0], 'U', 1, null, 'r'), ...orbs(1.2, 1.7, 6, 0.14, '#ffffff', 'r')] },

            { id: 'via_ouro', n: 'Via Dourada', cat: 'cam', fp: [1, 1], cost: CC(14, 0.002, 0, 0.001), nuc: 14, t: ['#ffd166', '#8a6a2a'], d: 'Pedras de ouro polido.', parts: [q('b', [0.99, 0.05, 0.99], [0, 0, 0], 'U'), ...rows(4, i => q('b', [0.44, 0.07, 0.44], [i % 2 ? 0.24 : -0.24, 0, i < 2 ? -0.24 : 0.24], 'T', i % 2 ? 1 : 0))] },

            { id: 'via_aurora', n: 'Via Aurora', cat: 'cam', fp: [1, 1], cost: CC(20, 0.002, 0, 0.001), nuc: 20, t: ['#7dff9a', '#b79cff'], d: 'Luzes verdes e roxas que dançam no chão.', parts: [q('b', [0.99, 0.05, 0.99], [0, 0, 0], '#1a1f2a'), q('b', [0.8, 0.06, 0.14], [0, 0, -0.25], 'T', 1, null, 'p'), q('b', [0.8, 0.06, 0.14], [0, 0, 0.0], 'U', 1, null, 'p'), q('b', [0.8, 0.06, 0.14], [0, 0, 0.25], 'T', 1, null, 'p')] },

            { id: 'ponte_luz', n: 'Ponte de Luz', cat: 'cam', fp: [1, 1], cost: CC(26, 0.003, 0, 0.002), nuc: 26, t: ['#5ee0ff', '#ffffff'], d: 'Um caminho de luz sólida com brilho que pulsa.', parts: [q('b', [0.99, 0.04, 0.99], [0, 0, 0], '#05030a'), q('b', [0.9, 0.08, 0.9], [0, 0.02, 0], 'T', 1, null, 'p'), q('b', [0.5, 0.1, 0.5], [0, 0.06, 0], 'U', 1, null, 'p')] }

        ];

        P.splice(P.findIndex(p => p.id === 'nucleo'), 0, ...LATE);

        /* escala visual (as peças pequenas ficavam miúdas no terreno) e saídas de fumaça (posição local, antes de girar) */

        const VS = { cabana: 1.0, casa: 1.12, arvore: 1.05, pinheiro: 1.1, arbusto: 1.1, flores: 1.1, rocha: 1.1, cogumelo: 1.1, poste: 1.0, banco: 1.0, estatua: 1.1, cerca: 1.0, bandeira: 1.1, cristal: 1.1, telescopio: 1.1, solar: 1.0, bateria: 1.1, tenda: 1.0, escola: 1.0, arco_jardim: 1.0 };

        /* proporção: prédios e fábricas esticados na altura (a base continua a mesma) para ficarem bem maiores que árvores, casas e moradores */

        const HM = { torre_hab: 2.6, torre_vidro: 2.0, arranha_ceu: 2.3, arcologia: 1.8, sobrado: 1.2, forja: 1.4, usina: 1.7, refinaria: 1.7, reator: 1.4, fundicao: 1.7, siderurgica: 1.5, biblioteca: 1.35, lab: 1.35, observatorio: 1.35, escola: 1.5, centro_pesq: 1.5, universidade: 1.7, academia: 1.5, supercomp: 1.35, antena: 1.8, silo: 1.8 };

        P.forEach(p => { const m = HM[p.id]; if (m && p.parts) p.parts.forEach(pt => { pt.p[1] *= m; if (!pt.r) pt.s[1] *= m; }); });

        const SMK = { forja: [[-1.10, 1.30, 1.10]], refinaria: [[1.25, 2.62, -0.5]], casa: [[0.45, 1.9, -0.3]], caldeirao: [[0, 1.0, 0]], cabana_bruxa: [[0.35, 2.35, -0.25]], casa_assombrada: [[0.95, 4.1, -0.4]] };

        /* como os moradores usam cada peça: casa (entram pela porta), jardim (regam), banco (sentam), oficina (trabalham), telescópio (olham o céu). door = posição da porta no modelo */

        const INT = { cabana: { k: 'home', door: [0.1, 0.34] }, casa: { k: 'home', door: [-0.1, 0.58] }, chale: { k: 'home', door: [0, 0.4] }, sobrado: { k: 'home', door: [0, 0.68] }, torre_hab: { k: 'home', door: [0, 0.62] }, domo: { k: 'home', door: [0, 1.5] }, loft: { k: 'home', door: [0, 0.78] }, cupula: { k: 'home', door: [0, 1.9] }, cabana_bruxa: { k: 'home', door: [0, 0.53] }, casa_assombrada: { k: 'home', door: [-0.2, 0.55] },

            flores: { k: 'garden' }, arbusto: { k: 'garden' }, cacto: { k: 'garden' }, bambu: { k: 'garden' }, cerejeira: { k: 'garden' }, pomar: { k: 'garden' }, fazenda: { k: 'garden' }, estufa: { k: 'garden' },

            banco: { k: 'seat' }, telescopio: { k: 'watch' }, observatorio: { k: 'watch' },

            oficina: { k: 'work' }, quartel: { k: 'watch' }, mercado: { k: 'seat' }, mina: { k: 'work' }, forja: { k: 'work' }, pedreira: { k: 'work' }, refinaria: { k: 'work' }, fundicao: { k: 'work' }, usina: { k: 'work' }, moinho: { k: 'work' }, poco: { k: 'work' }, lab: { k: 'work' }, biblioteca: { k: 'work' }, escola: { k: 'work' }, centro_pesq: { k: 'work' }, caldeirao: { k: 'work' } };

        /* construções novas dos sistemas de Atividades: modelos 3D compostos (36jk-colony-newbuilds.js) */
        const tiny = [q('b', [0.1, 0.1, 0.1], [0, 0, 0], '#5a4a3a')];
        P.push(
            { id: 'oficina', n: 'Oficina', cat: 'util', fp: [2, 2], cost: { c: 520, m: 240 }, fx: { oficina: 0.1 }, nuc: 3, t: ['#c58a4a', '#4a5a6a'], d: 'Bancada, forja e ferramentas. Cada nível deixa a Produção em fila 10% mais rápida (até 50%).', eff: ['Produção em fila 10% mais rápida por nível (até 50%) em todas as construções'], parts: tiny },
            { id: 'quartel', n: 'Quartel de Expedições', cat: 'util', fp: [3, 2], cost: { c: 600, m: 200, b: 120 }, fx: { quartel: 1 }, nuc: 4, t: ['#7a5a3a', '#3a6a4a'], d: 'Estábulo, torre de vigia e fogueira de acampamento. Cada nível libera um grupo de expedição a mais (até +2) e +8% de retorno (até +40%).', eff: ['+1 grupo de expedição por nível (até +2) e +8% de retorno por nível (até +40%)'], parts: tiny },
            { id: 'incubadora', n: 'Árvore Incubadora', cat: 'prod', fp: [4, 4], cost: { c: 500, b: 240, m: 90 }, nuc: 2, t: ['#3fae5a', '#6b4a2e'], d: 'Uma árvore imensa e viva que choca os ovos de dragão. Só cabe um ovo por vez e ninguém sabe qual dragão vai nascer, até o ovo rachar.', eff: ['Choca 1 ovo por vez (cruze dois dragões adultos no Grimório)', 'Uma barra de tempo aparece sobre o ovo; ovos mais raros demoram mais'], parts: tiny },
            { id: 'curral', n: 'Covil dos Dragões', cat: 'prod', fp: [11, 10], cost: { c: 700, b: 260, m: 120 }, fx: { curral: 1 }, nuc: 2, t: ['#a8483a', '#f0e4d0'], d: 'Torres de pedra, muralha e portão: o lar dos dragões. Eles sobrevoam a colônia, produzem recursos, comem biomassa e se cruzam para chocar ovos de espécies raras, até o Dragão do Eclipse. Os dragões também aceleram a Plantação.', eff: ['6 a 15 vagas de dragão (mais com o nível). Só existe um Covil', '+5% de produção dos bichos por nível e +2% de chance de subir de grau por nível'], parts: tiny },
            { id: 'mercado', n: 'Mercado', cat: 'util', fp: [2, 2], cost: { c: 420, b: 150 }, fx: { mercado: 1 }, nuc: 3, t: ['#d8a84a', '#8a4a3a'], d: 'A estalagem do mercador. Com um Mercado, ele vem a cada 40 a 80 minutos, fica 90 minutos e traz 3 ofertas.', eff: ['O mercador vem mais vezes (40 a 80 min), fica 90 min e traz 3 ofertas'], parts: tiny }
        );
        P.forEach(p => { if (VS[p.id]) p.vs = VS[p.id]; if (SMK[p.id]) p.smoke = SMK[p.id].map(v => [v[0], v[1] * (HM[p.id] || 1), v[2]]); if (INT[p.id]) p.int = INT[p.id]; if (p.id === 'poste') p.lamp = 1; });

        /* sujeira do terreno: nasce espalhada em volta da área inicial e precisa ser limpa para construir ali (custo e ganho pequenos, o custo cresce com a distância do Núcleo) */

        const DEB = [

            { k: 'lixo', n: 'Sujeira', w: 5, fp: [1, 1], cost: { c: 8 }, gain: { m: 2 }, d: 'Lixo e entulho largados no terreno. Limpar rende um pouco de Metal.',

              parts: [q('b', [0.5, 0.18, 0.4], [-0.1, 0, 0.05], '#4d4a44', 0, [0, 0.5, 0]), q('c', [0.16, 0.26, 0.16], [0.25, 0, -0.2], '#9aa0aa', 0, [0, 0, 1.4]), q('s', [0.36, 0.22, 0.34], [-0.2, 0, -0.25], '#3f5f48'), q('b', [0.22, 0.08, 0.3], [0.2, 0, 0.25], '#a4793f', 0, [0, -0.6, 0]), q('c', [0.1, 0.2, 0.1], [0.05, 0.16, 0.05], '#7a7f8a')] },

            { k: 'mato', n: 'Mato seco', w: 4, fp: [1, 1], cost: { c: 6 }, gain: { b: 2 }, d: 'Capim seco e espinhos. Limpar rende um pouco de Biomassa.',

              parts: [...rows(7, i => q('k', [0.12, 0.5 + (i % 3) * 0.14, 0.12], [-0.3 + (i % 4) * 0.2, 0, -0.25 + Math.floor(i / 4) * 0.45], i % 2 ? '#a79a54' : '#8a8a4a', 0, [0.2 * (i % 3) - 0.2, 0, 0.25 - 0.1 * i], 's'))] },

            { k: 'pedra', n: 'Pedra', w: 3.2, fp: [1, 1], cost: { c: 12 }, gain: { c: 3 }, d: 'Pedra solta que atrapa o terreno. Limpar rende um pouco de Cristal.',

              parts: [q('s', [0.78, 0.5, 0.62], [0, 0, 0], '#7a8294', 0, [0, 0.5, 0]), q('s', [0.4, 0.3, 0.4], [0.28, 0, 0.2], '#666d7e'), q('s', [0.26, 0.2, 0.26], [-0.3, 0, -0.2], '#8a92a4'), q('s', [0.14, 0.16, 0.14], [-0.1, 0.44, 0], '#5ee0ff', 1, null, 'p')] },

            { k: 'sucata', n: 'Sucata', w: 2.4, fp: [1, 1], cost: { c: 15 }, gain: { m: 5 }, d: 'Peças enferrujadas de nave velha. Limpar rende Metal.',

              parts: [q('b', [0.5, 0.2, 0.36], [0, 0, 0], '#7a5a44', 0, [0, 0.4, 0.1]), q('c', [0.36, 0.1, 0.36], [0.22, 0, 0.2], '#6b6f7a'), q('c', [0.2, 0.3, 0.2], [-0.25, 0, -0.2], '#8a5a3a'), q('b', [0.06, 0.4, 0.06], [0.1, 0, -0.3], '#a4acbc', 0, [0.5, 0, 0.7]), q('s', [0.1, 0.1, 0.1], [0.3, 0.2, 0.25], '#ff9a3c', 1, null, 'p')] },

            { k: 'toco', n: 'Tronco seco', w: 2, fp: [1, 1], cost: { c: 12 }, gain: { b: 4 }, d: 'Tronco morto e raízes. Limpar rende Biomassa.',

              parts: [q('c', [0.5, 0.42, 0.5], [0, 0, 0], '#6b4a30'), q('c', [0.42, 0.04, 0.42], [0, 0.42, 0], '#a8855a'), q('c', [0.14, 0.2, 0.14], [0.3, 0, 0.1], '#5a3d28', 0, [0, 0, 1.0]), q('c', [0.14, 0.2, 0.14], [-0.28, 0, -0.1], '#5a3d28', 0, [0, 0, -1.0]), q('s', [0.18, 0.12, 0.18], [0.06, 0.44, 0.04], '#ff6b5e')] },

            { k: 'bloco', n: 'Rochedo', w: 1.1, fp: [2, 2], cost: { c: 45 }, gain: { c: 8, m: 3 }, d: 'Rochedo grande com cristal dentro. Limpar rende Cristal e Metal.',

              parts: [q('s', [1.7, 1.1, 1.5], [0, 0, 0], '#6b7284', 0, [0, 0.3, 0]), q('s', [0.9, 0.7, 0.9], [0.6, 0, 0.5], '#7a8294'), q('s', [0.7, 0.55, 0.7], [-0.6, 0, -0.5], '#5e6576'), q('k', [0.3, 0.8, 0.3], [0.1, 0.7, -0.1], '#5ee0ff', 1, null, 'b'), q('k', [0.2, 0.5, 0.2], [-0.2, 0.6, 0.2], '#9ee3ff', 1, null, 'b'), q('s', [0.5, 0.2, 0.5], [0, 1.0, 0.1], '#58b35c')] }

        ];

        DEB.forEach(x => { x.t = ['#ffffff', '#ffffff']; });

        const PERKS = [

            { k: 'prod', n: 'Forja Estelar', ic: 'ph-factory', d: '+12% de produção em tudo, por nível.', base: 2, gr: 1.6, max: 99, per: 0.12 },

            { k: 'charge', n: 'Bateria Cósmica', ic: 'ph-lightning', d: '+3 h de carga máxima, por nível.', base: 2, gr: 1.55, max: 99, per: 3 },

            { k: 'xp', n: 'Mente Curiosa', ic: 'ph-books', d: '+6% de experiência nas matérias, por nível.', base: 3, gr: 1.6, max: 99, per: 0.06 },

            { k: 'cost', n: 'Construtor Veterano', ic: 'ph-hammer', d: '−3% no custo de construir e melhorar, por nível (até −45%).', base: 3, gr: 1.7, max: 15, per: 0.03 },

            { k: 'clear', n: 'Vassoura de Estrela', ic: 'ph-broom', d: '−8% no custo de limpar o terreno, por nível (até −72%).', base: 1, gr: 1.5, max: 9, per: 0.08 },

            { k: 'cap', n: 'Armazéns Expandidos', ic: 'ph-package', d: '+10% de espaço de coleta e armazenagem, por nível.', base: 2, gr: 1.6, max: 30, per: 0.1 },

            { k: 'idle', n: 'Produção Constante', ic: 'ph-moon-stars', d: '+3 pontos de produção sem bateria (de 3%, até 45%), por nível.', base: 2, gr: 1.55, max: 14, per: 0.03 },

            { k: 'ord', n: 'Contratos Melhores', ic: 'ph-clipboard-text', d: '+8% nos prêmios dos pedidos, por nível.', base: 3, gr: 1.6, max: 30, per: 0.08 },

            { k: 'frag', n: 'Poeira de Estrela', ic: 'ph-sparkle', d: '+1 fragmento a cada Ascensão, por nível.', base: 6, gr: 2, max: 10, per: 1 },

            { k: 'start', n: 'Estoque Inicial', ic: 'ph-package', d: 'Cada Ascensão começa com +150 de cada recurso, por nível.', base: 1, gr: 1.5, max: 99, per: 150 }

        ];

        return {

            RES: [['c', 'Cristal', 'ph-diamond', '#5ee0ff', 'A moeda principal: paga construções, melhorias, terreno e Núcleo.', 'Como conseguir: estudar rende cristal na hora (cerca de 1 por minuto); Minas de Cristal e Usinas produzem enquanto houver carga; limpar pedras e rochedos devolve um pouco; vender uma peça devolve 60%.'], ['b', 'Biomassa', 'ph-leaf', '#7dff9a', 'Alimento e vida: pede-se em casas, plantas e peças vivas.', 'Como conseguir: Fazendas e Estufas produzem enquanto houver carga; limpar mato seco e troncos devolve um pouco.'], ['m', 'Metal', 'ph-gear', '#ffc46b', 'Material das peças de tecnologia e das melhorias maiores.', 'Como conseguir: Forja e Refinaria produzem enquanto houver carga; limpar sujeira e sucata devolve um pouco.']],

            DEB, PERKS, START: 7, HSTEP: 4,

            CATS: [['ev', 'Halloween', 'ph-ghost'], ['prod', 'Produção', 'ph-factory'], ['casa', 'Moradia', 'ph-house'], ['util', 'Utilidade', 'ph-wrench'], ['nat', 'Natureza', 'ph-tree'], ['dec', 'Decoração', 'ph-sparkle'], ['cam', 'Caminhos', 'ph-path']],

            PAL: [['Azul', '#4fb8ff', '#9ee3ff'], ['Rosa', '#ff7ac8', '#ffc2e6'], ['Verde', '#4fd68a', '#b4f5cf'], ['Dourado', '#ffc247', '#ffe39a'], ['Roxo', '#a98bff', '#d3c3ff'], ['Vermelho', '#ff6b5e', '#ffb3a8'], ['Branco', '#e8eef7', '#ffffff'], ['Grafite', '#4a5260', '#8a94a6'], ['Laranja', '#ff9a3c', '#ffd09a'], ['Turquesa', '#3fe0d0', '#a9f5ee']],

            BIOMES: [

                { k: 'star', n: 'Estrela', d: 'O chão da sua própria estrela.', asc: 0, pal: null, tiles: null, bonus: null },

                { k: 'desert', n: 'Deserto Solar', d: '+15% de Cristal', asc: 1, pal: ['#ffb347', '#ffe0a0'], tiles: ['#3a2a18', '#4a3520'], bonus: { c: 0.15 } },

                { k: 'ice', n: 'Mundo de Gelo', d: '+15% de Metal', asc: 2, pal: ['#8fd8ff', '#e6f8ff'], tiles: ['#1a2f3f', '#223f52'], bonus: { m: 0.15 } },

                { k: 'forest', n: 'Floresta Viva', d: '+15% de Biomassa', asc: 3, pal: ['#4fd68a', '#b4f5cf'], tiles: ['#16301f', '#1c3b27'], bonus: { b: 0.15 } },

                { k: 'volcano', n: 'Vulcão', d: '+10% de Cristal e de Metal', asc: 5, pal: ['#ff5a3a', '#ffb199'], tiles: ['#331612', '#44201a'], bonus: { c: 0.1, m: 0.1 } },

                { k: 'abyss', n: 'Abismo Violeta', d: '+8% de tudo', asc: 7, pal: ['#a98bff', '#d3c3ff'], tiles: ['#1f1638', '#2a1d4a'], bonus: { c: 0.08, b: 0.08, m: 0.08 } }

            ],

            nucCost: NUCC,

            ERAS: [[1, 'Acampamento'], [5, 'Vila'], [10, 'Cidade'], [15, 'Metrópole'], [20, 'Capital Estelar'], [30, 'Império Orbital'], [45, 'Civilização Cósmica']],

            PIECES: P,

            IDLE: 0.03, IDLE_CAP: 0.45, BOOST_CAP: 1.5, CHARGE_PER_MIN: 6, CHARGE_CAP0: 18, DIRECT_C: 1, H0: 16, HMAX: 96

        };

    })();

/* ===== cortex/36i-colony-core.js: a Colônia: estado salvo, produção movida pela carga de estudo, habilidades por matéria, limpeza do terreno, Ascensão e as ações (comprar, mover, melhorar, vender, expandir) ===== */
    const CL = { on: false, ver: 1, stV: 0, occV: 0, sref: null, st: null, occ: null, saveT: 0, saveId: 0, deb: null, debSeed: -1, clrSet: null, clrV: -1, visit: null, vRen: false, vc: null, vcache: null, visWait: false };   /* ver sobe a cada mudança: os resultados guardados (ocupação, produção) só valem para a versão em que foram feitos */
    if (typeof window !== 'undefined') window.CL = CL;
    const CLT = {}; CLD.PIECES.forEach(p => { CLT[p.id] = p; });
    const CL_BIO_MUL = 0.5;
    const CLDB = {}; CLD.DEB.forEach(p => { CLDB[p.k] = p; });
    const clCells = (x, z) => (x + 128) * 256 + (z + 128);
    const clFp = (t, rot) => (rot & 1) ? [t.fp[1], t.fp[0]] : [t.fp[0], t.fp[1]];
    const clLvMul = L => L * Math.pow(1.12, L - 1);
    const clPinkStar = () => { try { return window.ruaProfile === 'guest' || (typeof pink === 'function' && pink()); } catch (e) { return false; } };
    const clSeedNew = () => 1 + Math.floor(Math.random() * 2e9);
    function clNew() { return { v: 1, name: 'Minha Colônia', star: '', H: CLD.H0, res: { c: 150, b: 80, m: 50 }, charge: 0, t: Date.now(), u: Date.now(), nuc: 1, pcs: [['nucleo', -1, -1, 0, 1, 0]], sk: {}, mins: 0, hist: {}, seen: { nucleo: 1 }, login: '', seed: clSeedNew(), clr: [], asc: 0, frag: 0, fragT: 0, perks: {}, bp: [], hv: 2, pend: { c: 0, b: 0, m: 0 } }; }
    
    function clProcessFarmBig(s) {   /* a Fazenda passou de 3x2 para 4x3: se a versão maior bater em outra construção, ela anda para o ponto livre mais próximo (nada é apagado; se não achar lugar, fica onde está) */
        if (!s || !Array.isArray(s.pcs) || s._farmBig) return; s._farmBig = 1;
        const H = s.H || CLD.H0, cellsOf = (q, x, z) => { const t = CLT[q[0]]; if (!t) return []; const f = clFp(t, q[3]), out = []; for (let a = 0; a < f[0]; a++) for (let b = 0; b < f[1]; b++) out.push(clCells(x + a, z + b)); return out; };
        let moved = 0, stuck = 0;
        s.pcs.forEach((p, i) => {
            if (p[0] !== 'fazenda') return;
            const used = new Set(); s.pcs.forEach((q, j) => { if (j !== i) cellsOf(q, q[1], q[2]).forEach(c => used.add(c)); });
            const t = CLT.fazenda, f = clFp(t, p[3]), ok = (x, z) => x >= -H && z >= -H && x + f[0] <= H && z + f[1] <= H && !cellsOf(p, x, z).some(c => used.has(c));
            if (ok(p[1], p[2])) return;
            let best = null; for (let dz = -8; dz <= 8; dz++) for (let dx = -8; dx <= 8; dx++) { const d = Math.abs(dx) + Math.abs(dz); if (!d || (best && d >= best.d)) continue; if (ok(p[1] + dx, p[2] + dz)) best = { dx, dz, d }; }
            if (best) { p[1] += best.dx; p[2] += best.dz; moved++; } else stuck++;
        });
        if (moved || stuck) setTimeout(() => { try { clSave(true); } catch (e) {} try { if (typeof toast === 'function') toast('🌾 A Fazenda ficou maior (4×3). ' + (moved ? moved + ' fazenda(s) andaram para o espaço livre mais próximo para caber.' : '') + (stuck ? ' ' + stuck + ' não achou lugar livre e ficou onde estava.' : '')); } catch (e) {} }, 2500);
    }
    function clProcessCovilBig(s) {   /* o Covil passou de 8x7 para 11x10 (castelo no tamanho do protótipo): se bater em outra construção, anda para o ponto livre mais próximo; nada é apagado */
        if (!s || !Array.isArray(s.pcs) || s._covilBig3) return; s._covilBig3 = 1;
        const H = s.H || CLD.H0, cellsOf = (q, x, z) => { const t = CLT[q[0]]; if (!t) return []; const f = clFp(t, q[3]), out = []; for (let a = 0; a < f[0]; a++) for (let b = 0; b < f[1]; b++) out.push(clCells(x + a, z + b)); return out; };
        let moved = 0;
        s.pcs.forEach((p, i) => {
            if (p[0] !== 'curral') return;
            const used = new Set(); s.pcs.forEach((q, j) => { if (j !== i) cellsOf(q, q[1], q[2]).forEach(c => used.add(c)); });
            const f = clFp(CLT.curral, p[3]), ok = (x, z) => x >= -H && z >= -H && x + f[0] <= H && z + f[1] <= H && !cellsOf(p, x, z).some(c => used.has(c));
            if (ok(p[1], p[2])) return;
            let best = null; for (let dz = -8; dz <= 8; dz++) for (let dx = -8; dx <= 8; dx++) { const d = Math.abs(dx) + Math.abs(dz); if (!d || (best && d >= best.d)) continue; if (ok(p[1] + dx, p[2] + dz)) best = { dx, dz, d }; }
            if (best) { p[1] += best.dx; p[2] += best.dz; moved++; }
        });
        if (moved) setTimeout(() => { try { clSave(true); } catch (e) {} try { if (typeof toast === 'function') toast('🏰 O Covil ficou maior (11×10) e andou para o espaço livre mais próximo.'); } catch (e) {} }, 1500);
    }
    function clProcessBiblioBig(s) {   /* a Biblioteca passou de 2x2 para 3x3 (Grande Biblioteca Monumental): se bater em outra peça, anda para o ponto livre mais próximo */
        if (!s || !Array.isArray(s.pcs) || s._biblioBig) return; s._biblioBig = 1;
        const H = s.H || CLD.H0, cellsOf = (q, x, z) => { const t = CLT[q[0]]; if (!t) return []; const f = clFp(t, q[3]), out = []; for (let a = 0; a < f[0]; a++) for (let b = 0; b < f[1]; b++) out.push(clCells(x + a, z + b)); return out; };
        let moved = 0, stuck = 0;
        s.pcs.forEach((p, i) => {
            if (p[0] !== 'biblioteca') return;
            const used = new Set(); s.pcs.forEach((q, j) => { if (j !== i) cellsOf(q, q[1], q[2]).forEach(c => used.add(c)); });
            const t = CLT.biblioteca, f = clFp(t, p[3]), ok = (x, z) => x >= -H && z >= -H && x + f[0] <= H && z + f[1] <= H && !cellsOf(p, x, z).some(c => used.has(c));
            if (ok(p[1], p[2])) return;
            let best = null; for (let dz = -8; dz <= 8; dz++) for (let dx = -8; dx <= 8; dx++) { const d = Math.abs(dx) + Math.abs(dz); if (!d || (best && d >= best.d)) continue; if (ok(p[1] + dx, p[2] + dz)) best = { dx, dz, d }; }
            if (best) { p[1] += best.dx; p[2] += best.dz; moved++; } else stuck++;
        });
        if (moved || stuck) setTimeout(() => { try { clSave(true); } catch (e) {} try { if (typeof toast === 'function') toast('📚 A Grande Biblioteca do Saber agora é 3×3.' + (moved ? ' Andou para o espaço livre mais próximo.' : '')); } catch (e) {} }, 2500);
    }
    function clProcessMineCap(s) {   /* limite de 2 minas por colônia: quem tem mais perde as de menor nível e recebe de volta TUDO o que gastou nelas (compra, melhorias e o minério guardado) */
        if (!s || !Array.isArray(s.pcs) || s._mineCap2) return;
        const mines = []; s.pcs.forEach((p, idx) => { if (p[0] === 'mina') mines.push({ idx, p, lv: p[4] || 1 }); });
        if (mines.length <= 2) { s._mineCap2 = { removed: 0, at: Date.now() }; return; }
        mines.sort((a, b) => a.lv - b.lv); const out = mines.slice(0, mines.length - 2), rm = new Set(out.map(x => x.idx));
        let rc = 0, rmt = 0;
        out.forEach(x => { const v = clValueRes(x.p); rc += v.c || 0; rmt += v.m || 0; if (Array.isArray(x.p[6])) rc += Math.floor(+x.p[6][0] || 0); });
        s.pcs = s.pcs.filter((_, idx) => !rm.has(idx));
        s.res.c = Math.round((s.res.c || 0) + rc); s.res.m = Math.round((s.res.m || 0) + rmt);
        s._mineCap2 = { removed: out.length, c: rc, m: rmt, at: Date.now() }; s.u = Date.now();
        setTimeout(() => { try { clSave(true); } catch (e) {} try { if (typeof toast === 'function') toast('🏝️ Colônia: o limite agora é de 2 minas. Devolvi ' + rc + ' cristal e ' + rmt + ' metal das ' + out.length + ' minas removidas.'); } catch (e) {} }, 2500);
    }
    function clProcessMineRefund(s) {
        if (!s || !Array.isArray(s.pcs) || s._mineRefund2026) return;
        const isGuest = window.ruaProfile === 'guest';
        const mineIndices = [];
        s.pcs.forEach((p, idx) => {
            if (p[0] === 'mina') mineIndices.push({ idx, p, lv: p[4] || 1 });
        });

        let toRemoveCount = 0;
        if (!isGuest) {
            // Gabriel: remover 5 minas (mantendo as 2 melhores)
            if (mineIndices.length > 2) {
                toRemoveCount = Math.min(5, mineIndices.length - 2);
            }
        } else {
            // Flávia: remover 2 minas
            if (mineIndices.length > 0) {
                toRemoveCount = Math.min(2, mineIndices.length);
            }
        }

        if (toRemoveCount > 0) {
            mineIndices.sort((a, b) => a.lv - b.lv); // remove as de menor nível, preservando as mais evoluídas
            const toRemove = mineIndices.slice(0, toRemoveCount);
            const removeSet = new Set(toRemove.map(x => x.idx));

            let refundC = 0, refundM = 0;
            toRemove.forEach(item => {
                const p = item.p;
                const L = p[4] || 1;
                let c = 120, m = 35;
                for (let l = 1; l < L; l++) {
                    c += Math.ceil(120 * Math.pow(1.5, l));
                    m += Math.ceil(35 * Math.pow(1.5, l));
                }
                refundC += c;
                refundM += m;
                if (Array.isArray(p[6])) {
                    refundC += Math.floor(+p[6][0] || 0);
                }
            });

            s.pcs = s.pcs.filter((_, idx) => !removeSet.has(idx));
            s.res.c = Math.round((s.res.c || 0) + refundC);
            s.res.m = Math.round((s.res.m || 0) + refundM);
            s._mineRefund2026 = {
                removed: toRemoveCount,
                c: refundC,
                m: refundM,
                at: Date.now(),
                who: isGuest ? 'flavia' : 'gabriel'
            };

            CL.ver++;
            if (typeof CL3 !== 'undefined' && CL3) CL3.need = true;
            clSave(true);

            setTimeout(() => {
                try {
                    const whoName = isGuest ? 'Flávia' : 'Gabriel';
                    const msg = '🎉 Restituição (' + whoName + '): ' + toRemoveCount + ' minas foram removidas e 100% dos recursos gastos (' + clFmt(refundC) + ' 💎 Cristais, ' + clFmt(refundM) + ' ⚙️ Metal) foram devolvidos ao seu saldo!';
                    if (typeof clUiToast === 'function') clUiToast(msg);
                } catch (e) {}
            }, 1200);
        } else {
            s._mineRefund2026 = { removed: 0, c: 0, m: 0, at: Date.now() };
        }

        // Restituição local para a Flávia se o perfil dela estiver salvo no navegador
        try {
            const rawG = localStorage.getItem('CESTILLE_GUEST_V1');
            if (rawG) {
                const gd = JSON.parse(rawG);
                if (gd && gd.colony && !gd.colony._mineRefund2026) {
                    const gCol = gd.colony;
                    const gMines = [];
                    (gCol.pcs || []).forEach((p, idx) => {
                        if (p[0] === 'mina') gMines.push({ idx, p, lv: p[4] || 1 });
                    });
                    if (gMines.length > 0) {
                        const gRemoveCount = Math.min(2, gMines.length);
                        gMines.sort((a, b) => a.lv - b.lv);
                        const gToRemove = gMines.slice(0, gRemoveCount);
                        const gRemoveSet = new Set(gToRemove.map(x => x.idx));
                        let gRefC = 0, gRefM = 0;
                        gToRemove.forEach(item => {
                            const p = item.p, L = p[4] || 1;
                            let c = 120, m = 35;
                            for (let l = 1; l < L; l++) {
                                c += Math.ceil(120 * Math.pow(1.5, l));
                                m += Math.ceil(35 * Math.pow(1.5, l));
                            }
                            gRefC += c; gRefM += m;
                            if (Array.isArray(p[6])) gRefC += Math.floor(+p[6][0] || 0);
                        });
                        gCol.pcs = gCol.pcs.filter((_, idx) => !gRemoveSet.has(idx));
                        if (!gCol.res) gCol.res = { c: 0, b: 0, m: 0 };
                        gCol.res.c = Math.round((gCol.res.c || 0) + gRefC);
                        gCol.res.m = Math.round((gCol.res.m || 0) + gRefM);
                        gCol._mineRefund2026 = { removed: gRemoveCount, c: gRefC, m: gRefM, at: Date.now(), who: 'flavia' };
                        localStorage.setItem('CESTILLE_GUEST_V1', JSON.stringify(gd));
                    }
                }
            }
        } catch (e) {}

        // Atualizar cache de visitas se houver
        try {
            ['cestille_cvis_g', 'cestille_cvis_o'].forEach(k => {
                const raw = localStorage.getItem(k);
                if (raw) {
                    const cv = JSON.parse(raw);
                    if (cv && cv.d && Array.isArray(cv.d.pcs)) {
                        const mList = cv.d.pcs.filter(p => p[0] === 'mina');
                        if (mList.length > 2) {
                            cv.d.pcs = cv.d.pcs.filter((p, i) => p[0] !== 'mina' || i === 0 || i === 1);
                            localStorage.setItem(k, JSON.stringify(cv));
                        }
                    }
                }
            });
        } catch (e) {}
    }
    window.clProcessMineRefund = clProcessMineRefund;

    function clS() {
        if (CL.visit && CL.vRen) return CL.visit.s;   /* na visita, o quadro desenhado usa a colônia visitada; todo o resto (estudo, mensagens, salvar) continua na sua */
        const g = G(); if (!g.colony || g.colony.v !== 1) g.colony = clNew();
        let s = g.colony;
        if (s && Array.isArray(s.pcs) && s.pcs.length <= 1) {
            try {
                if (Array.isArray(g.colonyBk) && g.colonyBk.length > 0) {
                    for (const bk of g.colonyBk) {
                        if (bk && bk.json) {
                            const saved = JSON.parse(bk.json);
                            if (saved && Array.isArray(saved.pcs) && saved.pcs.length > 1) {
                                g.colony = Object.assign(saved, { u: Date.now() });
                                s = g.colony; break;
                            }
                        }
                    }
                }
                if (s.pcs.length <= 1 && typeof localStorage !== 'undefined') {
                    const rawPrev = localStorage.getItem('CESTILLE_GUEST_PREV') || localStorage.getItem('CESTILLE_GUEST_V1');
                    if (rawPrev) {
                        const parsed = JSON.parse(rawPrev);
                        const prevCol = parsed && parsed.ruaLayout && parsed.ruaLayout.orbitGame && parsed.ruaLayout.orbitGame.colony;
                        if (prevCol && Array.isArray(prevCol.pcs) && prevCol.pcs.length > 1) {
                            g.colony = Object.assign(prevCol, { u: Date.now() });
                            s = g.colony;
                        }
                    }
                }
            } catch (e) {}
        } if (CL.sref !== s) { CL.sref = s; CL.ver++; } if (!s.res) s.res = { c: 0, b: 0, m: 0 }; if (!s.sk) s.sk = {}; if (!s.hist) s.hist = {}; if (!s.seen) s.seen = {}; if (!Array.isArray(s.pcs)) s.pcs = []; if (!(s.H >= CLD.H0)) s.H = CLD.H0; if (!(s.nuc >= 1)) s.nuc = 1; if (!(s.t > 0)) s.t = Date.now();
        if (!s.hv) {   /* o terreno inicial passou de 48×48 para 32×32: colônias que ainda não expandiram e cabem no tamanho novo encolhem (a sujeira muda de lugar, então a lista de limpas recomeça) */
            s.hv = 2; if (!(s.seed > 0)) s.seed = 7919; const inside = s.pcs.every(p => { const t = CLT[p[0]]; if (!t) return true; const f = clFp(t, p[3]); return p[1] >= -CLD.H0 && p[2] >= -CLD.H0 && p[1] + f[0] <= CLD.H0 && p[2] + f[1] <= CLD.H0; });
            if (s.H === 24 && inside) { s.H = CLD.H0; s.clr = []; CL.ver++; }
        }
        if (!s._mineRefund2026) { clProcessMineRefund(s); }
        if (!s._mineCap2) { clProcessMineCap(s); }
        if (!s._farmBig) { clProcessFarmBig(s); } if (!s._covilBig3) { clProcessCovilBig(s); } if (!s._biblioBig) { clProcessBiblioBig(s); }
        if (!s._skCal2026) { clProcessSkillCal2026(s); }
        if (!(s.seed > 0)) s.seed = 7919; if (!Array.isArray(s.clr)) s.clr = []; if (!(s.asc >= 0)) s.asc = 0; if (!(s.frag >= 0)) s.frag = 0; if (!(s.fragT >= 0)) s.fragT = 0; if (!s.perks) s.perks = {}; if (!s.pend) s.pend = { c: 0, b: 0, m: 0 }; if (!Array.isArray(s.bp)) s.bp = []; if (!Array.isArray(s.cd)) s.cd = []; if (!s.hw) s.hw = { tot: 0, ms: 0, od: '', seen: '' }; return s;
    }
    function clProcessSkillCal2026(s) {
        if (!s || s._skCal2026) return;
        const isGuest = window.ruaProfile === 'guest';
        if (!isGuest && !window.ruaDataReady) return;
        if (isGuest) {
            let linked = false;
            try { linked = !!localStorage.getItem('CESTILLE_GUEST_LINK'); } catch (e) {}
            if (linked && !window.ruaDataReady && !window.__ruaGuestWaitDone) {
                if (!clProcessSkillCal2026._t) {
                    clProcessSkillCal2026._t = setTimeout(() => { window.__ruaGuestWaitDone = true; try { clS(); } catch (e) {} }, 5000);
                }
                return;
            }
        }
        const targetPts = isGuest ? 10 : 3;
        const curMins = Math.round((+s.mins || 0) * 100) / 100;
        s._skCal2026 = { baseMins: curMins, basePts: targetPts, who: isGuest ? 'flavia' : 'gabriel', at: Date.now() };
        s._skBonus = 0;
        delete s._skKeep;
        s.u = Date.now();
        try { const g = typeof G === 'function' ? G() : null; if (g && !g._reimb200m) g._reimb200m = { at: Date.now(), skipped: 1 }; localStorage.setItem('CESTILLE_REEMB_100M_V3_FINAL', '1'); } catch (e) {}
        CL.ver++;
        if (typeof CL3 !== 'undefined' && CL3) CL3.need = true;
        setTimeout(() => { try { clSave(true); } catch (e) {} }, 250);
    }
    /* CÓPIAS LOCAIS SÓ DA COLÔNIA: até 5 versões guardadas neste navegador (a cada 10 min se mudou, e na hora que a colônia fica maior). Quando passa de 5, sai a mais antiga que NÃO seja a maior: a melhor versão nunca é descartada */
    function clKeepList() { try { const L = JSON.parse(localStorage.getItem('cestille_cl_keep') || '[]'); return Array.isArray(L) ? L.filter(x => x && x.json) : []; } catch (e) { return []; } }
    function clKeepSnap() {
        try {
            const s = clS(); if (!s || !Array.isArray(s.pcs) || s.pcs.length < 2) return; const L = clKeepList(), last = L[0], now = Date.now(), n = s.pcs.length, mx = L.reduce((m, x) => Math.max(m, x.n || 0), 0);
            if (last && now - last.at < 600000 && n <= mx) return; const json = JSON.stringify(s); if (json.length > 400000 || (last && last.json === json)) return;
            L.unshift({ at: now, n, nuc: s.nuc || 1, json });
            while (L.length > 5) { let big = 0; L.forEach((x, i) => { if ((x.n || 0) > (L[big].n || 0)) big = i; }); let di = L.length - 1; if (di === big) di = L.length - 2; L.splice(di, 1); }
            localStorage.setItem('cestille_cl_keep', JSON.stringify(L));
        } catch (e) {}
    }
    function clSave(now, reason, saveMeta) {
        if(reason&&!CL.visit){try{window.ruaColonySave?.stamp(clS(),reason,saveMeta);}catch(e){console.warn('colony checkpoint',e)}}   // grava no máximo a cada poucos segundos (as compras gravam na hora)
        if (window.ruaProfile !== 'guest' && !window.ruaDataReady) {   /* a tela abre na hora com a cópia daqui; a gravação espera a nuvem, para não substituir a colônia boa. Se você já mudou algo, essa mudança fica marcada e entra na gravação quando a nuvem chega */
            CL.saveHold = 1;
            try { const s0 = clS(), sig = JSON.stringify([s0.pcs, s0.res, s0.nuc, s0.mins, s0.asc, s0.H, s0.clr, s0.zoo]); if (window.__ruaColBase == null) window.__ruaColBase = sig; if (sig !== window.__ruaColBase) { window.__ruaEdit = 1; window.__ruaNeedPush = 1; } } catch (e) {}
            if (!clSave._w) clSave._w = setInterval(() => { if (window.ruaProfile === 'guest' || window.ruaDataReady) { clearInterval(clSave._w); clSave._w = 0; if (CL.saveHold) { CL.saveHold = 0; clSave(true); } } }, 250); return; }
        try { clKeepSnap(); } catch (e) {}
        try { clHistPush(!!reason); } catch (e) {}
        try { clBioWatch(clS()); clFixNaN(clS()); } catch (e) {}
        const t = Date.now(); try { const g0 = G(); if (g0.colony && (window.ruaDataReady || window.__ruaEdit || reason)) g0.colony.u = t; } catch (e) {}   /* colônia nova/vazia de um navegador que ainda não recebeu os dados da nuvem NÃO se marca como a mais nova */   /* qualquer mudança sua (comprar, coletar, girar, pintar, limpar) marca esta colônia como a mais nova: uma cópia atrasada da nuvem não a desfaz */ if (now || t - CL.saveT > 4000) { CL.saveT = t; clearTimeout(CL.saveId); CL.saveId = 0; try { gsave(); } catch (e) {} } else if (!CL.saveId) CL.saveId = setTimeout(() => { CL.saveId = 0; clSave(true); }, 4200);
    }
    const clSubj = fid => { try { const f = (typeof M !== 'undefined' && M.folders || []).find(x => x.id === fid); return f ? String(f.title || '').replace(/\s+/g, ' ').trim().slice(0, 28) : ''; } catch (e) { return ''; } };
    const clLvXp = k => 5 * k * k + 25 * k;                                       /* minutos acumulados para chegar ao nível k */
    const clLvOf = xp => Math.max(0, Math.floor((-25 + Math.sqrt(625 + 20 * Math.max(0, xp))) / 10));
    /* maestria: vem do total de estudo (somando todas as matérias), como se fosse dividido em 4. Estudar uma matéria só, ou matérias bem diferentes, vale igual. As matérias ganham títulos (conquistas) com os minutos reais de cada uma */
    const clTotalXp = s => Object.keys(s.sk).reduce((a, k) => a + (s.sk[k][0] || 0), 0);
    function clMastery(s) { return 4 * clLvOf(clTotalXp(s) / 4); }   /* maestria (bônus de produção): curva antiga, não mexe na produção */
    function clSkill(s) {   /* pontos de habilidade para evoluir o Núcleo: estritamente 1 ponto = 50 minutos REAIS de estudo (sem multiplicador de Biblioteca/Observatório) */
        if (!s) return 0;
        if (s._skCal2026 && typeof s._skCal2026.basePts === 'number') {
            const deltaMins = Math.max(0, (+s.mins || 0) - (+s._skCal2026.baseMins || 0));
            return s._skCal2026.basePts + Math.floor((deltaMins + 1e-6) / 50);
        }
        const realMins = Math.max(+s.mins || 0, Object.keys(s.sk || {}).reduce((a, k) => a + (s.sk[k] && s.sk[k][2] != null ? (+s.sk[k][2] || 0) : ((s.sk[k] && s.sk[k][0]) || 0)), 0));
        return Math.floor((realMins + 1e-6) / 50) + (s._skBonus || 0);
    }
    const CL_TITLES = [[0, 'Iniciante', 0], [300, 'Aprendiz', 0], [1200, 'Aplicado', 0], [3000, 'Especialista', 1], [6000, 'Mestre', 2], [12000, 'Lenda', 3]];   /* minutos estudados na matéria · fragmentos ✨ ao conquistar */
    const clTitleOf = m => { let i = 0; CL_TITLES.forEach((t, k) => { if (m >= t[0]) i = k; }); return i; };
    function clEra(n) { let e = CLD.ERAS[0][1]; CLD.ERAS.forEach(x => { if (n >= x[0]) e = x[1]; }); const last = CLD.ERAS[CLD.ERAS.length - 1]; return n >= last[0] + 25 ? last[1] + ' ' + (1 + Math.floor((n - last[0]) / 25)) : e; }
    /* ---------- vantagens da Ascensão ---------- */
    const clPerk = (s, k) => (s.perks && s.perks[k]) || 0;
    const clDisc = s => 1 - Math.min(0.45, 0.03 * clPerk(s, 'cost'));
    const clDiscClear = s => 1 - Math.min(0.72, 0.08 * clPerk(s, 'clear'));
    function clScaled(cost, mul) { const o = {}, s = clS(), k = mul == null ? clDisc(s) : mul; Object.keys(cost || {}).forEach(r => { o[r] = r === 'd' ? cost[r] : Math.max(1, Math.ceil(cost[r] * k)); }); return o; }
    /* ---------- sujeira do terreno: sorteada sempre igual para a mesma semente (por isso só guardamos o que já foi limpo) ---------- */
    function clHash(a, b, c, d) { let h = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263) + Math.imul(c | 0, 2147483629) + Math.imul(d | 0, 1274126177)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; h = Math.imul(h, 2246822519); h ^= h >>> 13; return (h >>> 0) / 4294967296; }
    function clDebrisList(seed) {
        if (CL.deb && CL.debSeed === seed) return CL.deb; const R = CLD.HMAX, out = [], taken = new Set(), kinds = CLD.DEB, tot = kinds.reduce((a, k) => a + k.w, 0);
        for (let z = -R; z < R; z++) for (let x = -R; x < R; x++) {
            const d = Math.max(Math.abs(x + 0.5), Math.abs(z + 0.5)); if (d < CLD.START) continue; const dens = 0.22 + 0.2 * Math.min(1, (d - CLD.START) / 30); if (clHash(x, z, seed, 1) >= dens) continue;
            let pick = clHash(x, z, seed, 2) * tot, kind = kinds[0]; for (const k of kinds) { if (pick < k.w) { kind = k; break; } pick -= k.w; } const w = kind.fp[0], dd = kind.fp[1];
            if (x + w > R || z + dd > R) continue; let free = true; for (let a = 0; a < w && free; a++) for (let b = 0; b < dd; b++) if (taken.has(clCells(x + a, z + b))) { free = false; break; } if (!free) continue;
            for (let a = 0; a < w; a++) for (let b = 0; b < dd; b++) taken.add(clCells(x + a, z + b));
            out.push({ i: out.length, k: kind.k, x, z, w, d: dd, rot: clHash(x, z, seed, 3) * 6.2832, sc: 0.85 + clHash(x, z, seed, 4) * 0.3, dist: d });
        }
        CL.deb = out; CL.debSeed = seed; return out;
    }
    function clClearedSet(s) { if (CL.clrSet && CL.clrV === CL.ver) return CL.clrSet; CL.clrSet = new Set(s.clr); CL.clrV = CL.ver; return CL.clrSet; }
    const clDebInside = (s, e) => e.x >= -s.H && e.z >= -s.H && e.x + e.w <= s.H && e.z + e.d <= s.H;
    function clDebrisVisible(s) { const cs = clClearedSet(s); return clDebrisList(s.seed).filter(e => !cs.has(e.i) && clDebInside(s, e)); }
    function clDebCost(s, e) { const k = CLDB[e.k], f = (1 + e.dist / 12) * clDiscClear(s), o = {}; Object.keys(k.cost).forEach(r => { o[r] = Math.max(1, Math.ceil(k.cost[r] * f)); }); return o; }
    function clDebGain(s, e) { const k = CLDB[e.k], f = 1 + e.dist / 40, o = {}; Object.keys(k.gain).forEach(r => { o[r] = Math.max(1, Math.round(k.gain[r] * f)); }); return o; }
    function clClearDebris(di) {
        const s = clS(), e = clDebrisList(s.seed)[di]; if (!e || !clDebInside(s, e)) return { ok: false, err: 'Não há sujeira aqui.' }; if (clClearedSet(s).has(di)) return { ok: false, err: 'Já está limpo.' };
        const c = clDebCost(s, e); if (!clCan(c)) return { ok: false, err: 'Faltam recursos para limpar.' }; clPay(c); const g = clDebGain(s, e); const st = clStats(); Object.keys(g).forEach(r => { const cap = (st.cap && st.cap[r]) || 500; s.res[r] = Math.max(s.res[r] || 0, Math.min(cap, (s.res[r] || 0) + g[r])); }); s.clr.push(di);   /* nunca reduz o que você já tem acima do limite (reembolso) */ s.cleared = (s.cleared || 0) + 1; CL.ver++; clSave(false, 'colony-action'); return { ok: true, gain: g, cost: c, k: e.k };
    }
    function clOcc(s) {
        if (CL.occ && CL.occV === CL.ver) return CL.occ; const o = new Map();
        s.pcs.forEach((p, i) => { const t = CLT[p[0]]; if (!t) return; const f = clFp(t, p[3]); for (let a = 0; a < f[0]; a++) for (let b = 0; b < f[1]; b++) o.set(clCells(p[1] + a, p[2] + b), i); });
        clDebrisVisible(s).forEach(e => { let hit = false; for (let a = 0; a < e.w; a++) for (let b = 0; b < e.d; b++) if (o.has(clCells(e.x + a, e.z + b))) hit = true; if (hit) return; for (let a = 0; a < e.w; a++) for (let b = 0; b < e.d; b++) o.set(clCells(e.x + a, e.z + b), -1 - e.i); });   /* a sujeira só ocupa o que ainda não tem peça (colônias antigas) */
        CL.occ = o; CL.occV = CL.ver; return o;
    }
    const clBiome = s => { const b = CLD.BIOMES[s.bio | 0]; return b && s.asc >= b.asc ? b : CLD.BIOMES[0]; };
    function clSetBiome(i) { const s = clS(), b = CLD.BIOMES[i]; if (!b) return { ok: false, err: 'Estilo inexistente.' }; if (s.asc < b.asc) return { ok: false, err: 'Libera na Ascensão ' + b.asc + '.' }; s.bio = i; CL.ver++; clSave(true); return { ok: true }; }
    
    function clCalcHarmony(s) {
        if (!s || !s.pcs) return { pct: 85, boost: 14, housing: 80, food: 85, work: 85, decor: 80 };
        let pop = 0, food = 0, work = 0, dec = 0, hasPlaza = 0;
        s.pcs.forEach(p => {
            const id = p[0], L = p[4] || 1;
            const t = CLT[id];
            if (!t) return;
            if (t.fx && t.fx.pop) pop += t.fx.pop * L;
            if (['fazenda', 'moinho', 'estufa', 'pomar', 'porto'].includes(id)) food += ((t.prod && t.prod.b) || 12) * L;
            if (['mina', 'forja', 'refinaria', 'pedreira', 'fundicao', 'reator'].includes(id)) work += 12 * L;
            if (['praca', 'coreto', 'banco', 'fonte', 'estatua', 'arco', 'arco_jardim', 'torre_vigia', 'jardim_suspenso', 'flores', 'arvore'].includes(id)) {
                dec += (id === 'praca' ? 25 : id === 'coreto' ? 15 : 8) * L;
                if (id === 'praca') hasPlaza++;
            }
        });
        const sHousing = Math.min(100, Math.max(40, pop >= 2 ? 65 + Math.min(35, pop * 3) : 40));
        const sFood = Math.min(100, Math.max(35, food > 0 ? 65 + Math.min(35, food * 1.2) : 35));
        const sWork = Math.min(100, Math.max(35, work > 0 ? 65 + Math.min(35, work * 1.2) : 35));
        const sDecor = Math.min(100, Math.max(35, dec > 0 ? 60 + Math.min(40, dec * 1.2) : 35));
        const avg = Math.round((sHousing * 0.25) + (sFood * 0.25) + (sWork * 0.25) + (sDecor * 0.25));
        const pct = Math.max(50, Math.min(100, avg));
        const boost = Math.round((pct - 50) / 50 * 20);
        return { pct, boost, housing: Math.round(sHousing), food: Math.round(sFood), work: Math.round(sWork), decor: Math.round(sDecor), hasPlaza };
    }

    function clStats() {
        if (CL.st && CL.stV === CL.ver) return CL.st; const s = clS(), r = { rate: { c: 0, b: 0, m: 0 }, cap: { c: 500, b: 500, m: 500 }, chargeCap: CLD.CHARGE_CAP0 + 3 * clPerk(s, 'charge'), pop: 0, xpMul: 1 + 0.06 * clPerk(s, 'xp'), prodm: 0, mast: clMastery(s), skill: clSkill(s) };
        s.pcs.forEach(p => {
            const t = CLT[p[0]]; if (!t) return; const L = p[0] === 'nucleo' ? s.nuc : (p[4] || 1), lm = clLvMul(L);   /* o Núcleo produz um pouco e cresce com o próprio nível: ninguém fica sem Metal */
            if (t.prod) Object.keys(t.prod).forEach(k => { r.rate[k] += t.prod[k] * lm; });
            if (t.bem) r.decB = (r.decB || 0) + t.bem * (t.upg ? (1 + 0.5 * Math.min(4, Math.max(0, L - 1))) : 1); if (t.fx) { if (t.fx.pop) r.pop += t.fx.pop * L; if (t.fx.cap) ['c', 'b', 'm'].forEach(k => { r.cap[k] += t.fx.cap * lm; }); if (t.fx.charge) r.chargeCap += t.fx.charge * L; if (t.fx.xp) r.xpMul += t.fx.xp * L; if (t.fx.prodm) r.prodm += t.fx.prodm * L; if (t.fx.cd) r.cdx = (r.cdx || 0) + t.fx.cd * L; }
        });
        r.prodm += Math.min(0.08, r.decB || 0);   /* bem-estar das decorações, com limite */
        r.ascM = 1 + 0.25 * s.asc; r.perkM = 1 + 0.12 * clPerk(s, 'prod');
        r.mult = (1 + 0.02 * r.mast) * (1 + 0.004 * r.pop) * (1 + r.prodm) * r.ascM * r.perkM; ['c', 'b', 'm'].forEach(k => { r.rate[k] *= r.mult; r.cap[k] = Math.round(r.cap[k] * (1 + 0.1 * clPerk(s, 'cap'))); }); r.rate.b *= CL_BIO_MUL; try { const zb = typeof clZooColBonus === 'function' ? clZooColBonus(s) : null; if (zb) { ['c', 'b', 'm'].forEach(k => { r.rate[k] *= 1 + (zb[k] || 0); }); r.zoo = zb; } } catch (e) {}   /* bônus dos bichos do Curral */   /* biomassa passiva reduzida: o resto vem da Plantação */
        { const bm = clBiome(s); if (bm.bonus) ['c', 'b', 'm'].forEach(k => { r.rate[k] *= 1 + (bm.bonus[k] || 0); }); }
        if (window.CL_WEATHER_BUFF) {
            ['c', 'b', 'm'].forEach(k => { if (window.CL_WEATHER_BUFF[k]) r.rate[k] *= (1 + window.CL_WEATHER_BUFF[k]); });
        }
        const hm = clCalcHarmony(s);
        r.harmony = hm;
        if (hm.boost > 0) {
            ['c', 'b', 'm'].forEach(k => { r.rate[k] *= (1 + hm.boost / 100); });
        }
        r.score = s.pcs.reduce((a, p) => a + (clValue(p) || 0), 0); CL.st = r; CL.stV = CL.ver; return r;
    }
    const CL_RI = { c: 0, b: 1, m: 2 };
    function clWts(s) {   /* quanto cada peça entra na produção de cada recurso (o mesmo peso de clStats, antes dos bônus globais) */
        const w = [[], [], []], tot = [0, 0, 0];
        s.pcs.forEach((p, i) => { const t = CLT[p[0]], L = p[0] === 'nucleo' ? s.nuc : (p[4] || 1), lm = clLvMul(L); [0, 1, 2].forEach(j => { const v = t && t.prod && t.prod['cbm'[j]] ? t.prod['cbm'[j]] * lm : 0; w[j][i] = v; tot[j] += v; }); });
        return { w, tot };
    }
    function clBagSum(s, j) { let a = 0; s.pcs.forEach(p => { if (Array.isArray(p[6])) a += +p[6][j] || 0; }); return a; }
    function clGive(s, j, add, wts) {   /* reparte um tanto entre as peças que produzem esse recurso; a última fecha a conta para a soma bater */
        if (!(add > 1e-8) || !(wts.tot[j] > 0)) return; let left = add, last = -1; s.pcs.forEach((p, i) => { if (wts.w[j][i] > 0) last = i; });
        s.pcs.forEach((p, i) => { const wt = wts.w[j][i]; if (!(wt > 0)) return; const part = i === last ? left : add * wt / wts.tot[j]; if (!Array.isArray(p[6])) p[6] = [0, 0, 0]; p[6][j] += part; if (i !== last) left -= part; });
    }
    function clMatch(s, r, wts) {   /* o bolo antigo (s.pend) vira o que está em cima de cada peça; se já bate, não mexe */
        const j = CL_RI[r], target = +s.pend[r] || 0, sum = clBagSum(s, j); if (Math.abs(sum - target) < 1e-6) return;
        if (sum > target && sum > 0) { const k = target / sum; s.pcs.forEach(p => { if (Array.isArray(p[6])) p[6][j] *= k; }); return; }
        clGive(s, j, target - sum, wts);
    }
    function clDrain(s, j, amount, only) {   /* tira um tanto das peças. Numa peça só, começa nela e completa com a fração das outras (senão 0,7+0,3 nunca vira 1 cristal visível) */
        let left = amount; const take = i => { if (left <= 1e-9) return; const bag = s.pcs[i] && s.pcs[i][6]; if (!bag) return; const n = Math.min(left, Math.max(0, +bag[j] || 0)); if (n > 1e-9) { bag[j] -= n; left -= n; } };
        if (typeof only === 'number') { take(only); const rest = []; s.pcs.forEach((p, i) => { if (i !== only && Array.isArray(p[6])) rest.push(i); }); rest.sort((a, b) => (s.pcs[b][6][j] || 0) - (s.pcs[a][6][j] || 0)); rest.forEach(take); }
        else { const ix = []; s.pcs.forEach((p, i) => { if (Array.isArray(p[6])) ix.push(i); }); ix.forEach(i => { if (left <= 0) return; const bag = s.pcs[i][6], a = Math.min(left, Math.floor((+bag[j] || 0) + 1e-9)); if (a > 0) { bag[j] -= a; left -= a; } }); if (left >= 1) ix.slice().sort((a, b) => (s.pcs[b][6][j] || 0) - (s.pcs[a][6][j] || 0)).forEach(take); }
        return Math.max(0, Math.round((amount - left) * 1e6) / 1e6);
    }
    function clReady(s) {   /* inteiros prontos por peça: 1 cristal no total aparece na peça que mais produziu, mesmo que a fração dela seja 0,7 */
        const wts = clWts(s); ['c', 'b', 'm'].forEach(r => clMatch(s, r, wts)); const out = s.pcs.map(() => ({ c: 0, b: 0, m: 0 }));
        ['c', 'b', 'm'].forEach(r => {
            const j = CL_RI[r], total = Math.floor((+s.pend[r] || 0) + 1e-9); if (total <= 0) return;
            const share = s.pcs.map(p => Array.isArray(p[6]) ? Math.max(0, +p[6][j] || 0) : 0), sum = share.reduce((a, b) => a + b, 0); if (sum <= 1e-9) return;
            const parts = share.map(v => v * total / sum), base = parts.map(v => Math.floor(v + 1e-9)); let left = total - base.reduce((a, b) => a + b, 0);
            parts.map((v, i) => [v - base[i], i]).sort((a, b) => b[0] - a[0]).forEach(x => { if (left > 0) { base[x[1]]++; left--; } }); base.forEach((n, i) => { out[i][r] = n; });
        });
        return out;
    }
    /* AUTOCORREÇÃO: se algum recurso (ou o que as peças produziram, ou a carga) virar NaN/infinito, volta a um número válido na hora, para o jogo nunca travar a compra */
    /* VIGIA DA BIOMASSA: se o estoque despencar de repente (de 60+ para quase nada), guarda quando, a ação anterior e o caminho do código. Ver: ruaBioLog() */
    function clBioWatch(s) {
        const r = s && s.res; if (!r) return; const d = Object.getOwnPropertyDescriptor(r, 'b'); if (d && d.get && d.get._bw) return; let v = +r.b || 0; const get = function () { return v; }; get._bw = 1;
        try {
            Object.defineProperty(r, 'b', { enumerable: true, configurable: true, get, set(n) {
                const o = v; v = n;
                try { if (Number.isFinite(o) && o >= 60 && (!Number.isFinite(+n) || +n <= 2)) { const L = JSON.parse(localStorage.getItem('ruaBioLog') || '[]'); L.push({ t: new Date().toISOString(), de: Math.round(o), para: n, acao: window.__clAct || '', pilha: (new Error().stack || '').split('\n').slice(2, 8).map(x => x.trim().replace(/^at /, '').slice(0, 90)).join(' < ') }); localStorage.setItem('ruaBioLog', JSON.stringify(L.slice(-20))); } } catch (e) {}
            } });
        } catch (e) {}
    }
    window.ruaBioLog = () => { try { return JSON.parse(localStorage.getItem('ruaBioLog') || '[]'); } catch (e) { return []; } };
    function clFixNaN(s) {
        let f = ''; const bad = v => v != null && !Number.isFinite(+v);
        ['c', 'b', 'm', 'd'].forEach(r => { if (s.res && bad(s.res[r])) { let cp = 1500; try { const cc = clStats().cap[r]; if (Number.isFinite(cc) && cc > 500) cp = cc; } catch (e) {} s.res[r] = r === 'd' ? 0 : cp; f += r; } });   /* valor inválido volta para o estoque CHEIO (o limite do armazém) */
        if (s.pend) ['c', 'b', 'm'].forEach(r => { if (bad(s.pend[r])) { s.pend[r] = 0; f += 'p' + r; } });
        if (bad(s.charge)) { s.charge = 0; f += 'h'; }
        (s.pcs || []).forEach(p => { if (Array.isArray(p[6])) p[6] = p[6].map(x => (Number.isFinite(+x) ? +x : 0)); });
        if (f) { s._nanFix = { at: Date.now(), what: f }; CL.ver++; try { console.warn('colônia: valor inválido corrigido (' + f + ')'); } catch (e) {} }
        return f;
    }
    function clTick(now) {
        if (CL.vRen) return 0;
        // Enquanto a primeira leitura da conta está em andamento, deixe os
        // relógios intactos. O próximo tick recupera o tempo transcorrido.
        if (window.ruaProfile === 'guest' && Date.now() < (window.__ruaGuestReadUntil || 0)) return 0;
        try { clFixNaN(clS()); } catch (e) {}   // sem carga as peças produzem devagar (IDLE) até uma parte do espaço; com carga produzem a todo vapor e o espaço de coleta cresce (BOOST_CAP)
        const s = clS(), st = clStats(); now = now || Date.now(); const el = Math.max(0, Math.min((now - s.t) / 1000, 86400 * 60)); s.t = now; const wts = clWts(s);
        // Garantir que nenhum recurso em estoque exceda a capacidade do armazém:
        // O excedente é devolvido para o buffer de produção nas peças (s.pend) sem perda para o jogador.
        ['c', 'b', 'm'].forEach(r => {
            const cap = st.cap[r] || 500;
            if ((s.res[r] || 0) > cap) {
                const excess = Math.round(((s.res[r] || 0) - cap) * 1e4) / 1e4;
                s.res[r] = cap;
                s.pend[r] = (s.pend[r] || 0) + excess;
                clGive(s, CL_RI[r], excess, wts);
            }
        });
        if (el <= 0) { ['c', 'b', 'm'].forEach(r => clMatch(s, r, wts)); return 0; }
        const use = Math.min(el, Math.max(0, s.charge)), kU = use / 3600, kI = (el - use) / 3600;
        ['c', 'b', 'm'].forEach(r => { clMatch(s, r, wts); let v = s.pend[r] || 0, before = v; if (kU > 0) v = Math.max(v, Math.min(st.cap[r] * CLD.BOOST_CAP, v + st.rate[r] * kU)); if (kI > 0) v = Math.max(v, Math.min(st.cap[r] * CLD.IDLE_CAP, v + st.rate[r] * Math.min(0.6, CLD.IDLE + 0.03 * clPerk(s, 'idle')) * kI)); s.pend[r] = v; clGive(s, CL_RI[r], v - before, wts); });
        try { clFarmGrow(s, el, use); } catch (e) {} try { clBichosGrow(s, el, use); } catch (e) {}   /* as plantas crescem com o tempo e crescem o dobro com a carga de estudo (rega) */
        s.charge = Math.max(0, s.charge - use); return use;   /* cada peça guarda o que ela mesma produziu; a bolha em cima coleta só dela */
    }
    function clCollect(k, only) {   // passa o produzido para o estoque respeitando a capacidade máxima dos armazéns
        const s = clS(), st = clStats(), wts = clWts(s); ['c', 'b', 'm'].forEach(r => clMatch(s, r, wts)); const got = {}; let any = false, full = false;
        (k ? [k] : ['c', 'b', 'm']).forEach(r => {
            const j = CL_RI[r], cap = st.cap[r] || 500, cur = Math.floor(s.res[r] || 0), space = Math.max(0, cap - cur);
            const ready = typeof only === 'number' ? ((clReady(s)[only] || {})[r] || 0) : Math.floor((s.pend[r] || 0) + 1e-9);
            if (ready <= 0) return;
            if (space <= 0) { full = true; return; }
            const want = Math.min(ready, space);
            const took = Math.round(clDrain(s, j, want, only));
            if (took > 0) { s.pend[r] = Math.max(0, (s.pend[r] || 0) - took); s.res[r] = Math.min(cap, cur + took); got[r] = took; any = true; }
        });
        if (full && !any) {
            try { clMsg('Armazém cheio! Construa Armazéns ou Silos para guardar mais.'); } catch (e) {}
        }
        if (any) { CL.ver++; clSave(true, 'collect'); } return got;
    }
    function clCollectPiece(i) { return clCollect(null, i); }
    function clStudy(secs, fid) {   // chamado quando termina um estudo: enche a carga, paga um pouco na hora e soma experiência na matéria
        if (!(secs > 0)) return null; const s = clS(); clTick(); const st = clStats(), mins = secs / 60, before = clLvOf((s.sk[fid || '_g'] || [0])[0]);
        const key = fid || '_g', cur = s.sk[key] || (s.sk[key] = [0, '']); if (cur[2] == null) { cur[2] = Math.floor((cur[0] || 0) / Math.max(1, st.xpMul)); cur[3] = 0; } const title = clSubj(fid); if (title) cur[1] = title; else if (!cur[1]) cur[1] = 'Geral';
        const dCharge = Math.min(Math.max(0, st.chargeCap * 3600 - s.charge), secs * CLD.CHARGE_PER_MIN); s.charge += dCharge;
        const mulOk = Number.isFinite(st.mult) ? st.mult : 1, capC = Number.isFinite(st.cap.c) ? st.cap.c : 500, gain0 = mins * CLD.DIRECT_C * (1 + 0.5 * (mulOk - 1)), gain = Number.isFinite(gain0) ? gain0 : 0, dc = Math.min(Math.max(0, capC - (+s.res.c || 0)), gain); s.res.c = (+s.res.c || 0) + dc; if (gain - dc > 0.01) { const ex = Math.round((gain - dc) * 1e4) / 1e4; s.pend.c = (s.pend.c || 0) + ex; clGive(s, CL_RI.c, ex, clWts(s)); }   /* o que não cabe no estoque vai para a reserva das peças (coleta depois), nunca se perde */   /* nunca vira NaN, mesmo se o limite ou o multiplicador vierem inválidos */
        cur[0] = Math.round((cur[0] + mins * st.xpMul) * 100) / 100; s.mins = Math.round((s.mins + mins) * 100) / 100; const td = todayISO(); s.hist[td] = Math.round(((s.hist[td] || 0) + mins) * 100) / 100;
        const ks = Object.keys(s.hist); if (ks.length > 60) ks.sort().slice(0, ks.length - 60).forEach(k => { delete s.hist[k]; });
        cur[2] = Math.round((cur[2] + mins) * 100) / 100; const titles = []; CL_TITLES.forEach((t, i) => { if (i > 0 && cur[2] >= t[0] && !((cur[3] | 0) & (1 << i))) { cur[3] = (cur[3] | 0) | (1 << i); if (t[2]) { s.frag += t[2]; s.fragT += t[2]; } titles.push({ subj: cur[1], name: t[1], fr: t[2] }); } });
        const candies = clCandySpawn(mins); CL.ver++; const after = clLvOf(cur[0]); clSave(true, 'colony-action');
        return { charge: dCharge, c: dc, subj: cur[1], lv: after, up: after > before, candies, titles };
    }
    function clLoginDay(cur) { return ((Math.max(1, cur | 0) - 1) % 10) + 1; }   // o dia do quadro de 10 dias da recompensa diária
    function clLogin(cur) {   // a recompensa diária do site vale também na Colônia: carga e recursos todo dia, e o 10º dia do quadro rende bem mais
        const s = clS(), td = todayISO(); if (s.login === td) { CL.loginGot = null; return 0; } s.login = td; const st = clStats(), day = clLoginDay(cur), big = day === 10, sc = Math.max(40, Math.round(clNucCost(s.nuc).c * 0.16)), k = big ? 3 : 1;
        const add = Math.min(Math.max(0, st.chargeCap * 3600 - s.charge), (big ? 6 : 2) * 3600); s.charge += add; const got = { c: Math.round(sc * 0.4 * k), b: Math.round(sc * 0.3 * k), m: Math.round(sc * 0.3 * k) }; clRefund(got); if (big) { s.frag += 1; s.fragT += 1; got.fr = 1; }
        CL.loginGot = { day, big, ch: add, got }; CL.ver++; clSave(true); return add;
    }
    /* ---------- peças ---------- */
    function clUpCost(id, lv) { const t = CLT[id], o = {}; if (!t) return o; const d = clDisc(clS()); Object.keys(t.cost).forEach(k => { o[k] = Math.max(1, Math.ceil(t.cost[k] * Math.pow(id === 'curral' ? 1.3 : 1.5, lv) * d)); }); return o; }
    const clUpgradable = t => !!(t && (t.prod || t.upg || (t.fx && Object.keys(t.fx).length)) && t.id !== 'nucleo');
    function clValueRes(p) { const t = CLT[p[0]], o = {}; if (!t) return o; const L = p[4] || 1; Object.keys(t.cost).forEach(k => { let v = t.cost[k]; for (let l = 1; l < L; l++) v += t.cost[k] * Math.pow(1.5, l); o[k] = v; }); return o; }
    function clValue(p) { const o = clValueRes(p); return Object.keys(o).reduce((a, k) => a + o[k], 0); }
    const clSellValue = p => Math.floor(0.6 * clValue(p));
    const clMaxLv = s => s.nuc + 2;
    function clCan(cost) { const s = clS(); return Object.keys(cost).every(k => s.res[k] + 1e-9 >= cost[k]); }
    function clPay(cost) { const s = clS(); Object.keys(cost).forEach(k => { s.res[k] = Math.max(0, s.res[k] - cost[k]); }); }
    function clRefund(res) { const s = clS(); Object.keys(res).forEach(k => { s.res[k] += res[k]; }); }   /* o que volta de uma venda é seu, mesmo acima do espaço do armazém */
    function clFits(id, x, z, rot, ignore) {
        const s = clS(), t = CLT[id]; if (!t) return false; const f = clFp(t, rot), H = s.H; if (x < -H || z < -H || x + f[0] > H || z + f[1] > H) return false; const o = clOcc(s);
        for (let a = 0; a < f[0]; a++) for (let b = 0; b < f[1]; b++) { const i = o.get(clCells(x + a, z + b)); if (i !== undefined && i !== ignore) return false; }
        return !clWideBlock(s, id, x, z, f, ignore, o);
    }
    /* o moinho tem pás que passam do terreno dele: nenhuma peça pode ficar colada (nem ele colado em outra), senão uma construção entra dentro da outra */
    const CL_WIDE = { moinho: 1 };
    function clWideBlock(s, id, x, z, f, ignore, o) {
        const m = CL_WIDE[id] || 0;
        for (let a = -1; a <= f[0]; a++) for (let b = -1; b <= f[1]; b++) { if (a >= 0 && a < f[0] && b >= 0 && b < f[1]) continue; const i = o.get(clCells(x + a, z + b)); if (i === undefined || i < 0 || i === ignore) continue; const oid = s.pcs[i] && s.pcs[i][0]; if (m > 0 || (CL_WIDE[oid] || 0) > 0) return true; }
        return false;
    }
    function clBlockedBy(id, x, z, rot) {   // o que impede de construir ali: sujeira (precisa limpar), outra peça ou o limite do terreno
        const s = clS(), t = CLT[id]; if (!t) return ''; const f = clFp(t, rot), H = s.H; if (x < -H || z < -H || x + f[0] > H || z + f[1] > H) return 'borda'; const o = clOcc(s); let piece = false, dirt = false;
        for (let a = 0; a < f[0]; a++) for (let b = 0; b < f[1]; b++) { const i = o.get(clCells(x + a, z + b)); if (i === undefined) continue; if (i < 0) dirt = true; else piece = true; } if (!piece && !dirt && clWideBlock(s, id, x, z, f, -999, o)) return 'peça'; return piece ? 'peça' : dirt ? 'sujeira' : '';
    }
    function clPieceCount(s, id) {
        if (!s || !s.pcs) return 0;
        let c = 0;
        for (let i = 0; i < s.pcs.length; i++) {
            if (s.pcs[i][0] === id) c++;
        }
        return c;
    }
    function clPieceLimit(id, nuc) {
        nuc = Math.max(1, nuc | 0);
        if (id === 'nucleo') return 1;
        if (id === 'curral' || id === 'incubadora') return 1;   /* um único Covil e uma única Árvore Incubadora */
        // Produção:
        if (id === 'mina') return 2;   /* limite fixo: 2 minas por colônia */
        if (id === 'fazenda') return Math.min(5, 1 + Math.floor(nuc / 2));
        if (id === 'forja') return Math.min(4, 1 + Math.floor((nuc - 1) / 2));
        if (id === 'estufa') return Math.min(4, 1 + Math.floor((nuc - 3) / 2));
        if (id === 'usina') return Math.min(3, 1 + Math.floor((nuc - 4) / 2));
        if (id === 'refinaria') return Math.min(3, 1 + Math.floor((nuc - 5) / 2));
        if (id === 'reator') return Math.min(2, 1 + Math.floor((nuc - 9) / 3));
        if (id === 'moinho') return Math.min(4, 1 + Math.floor((nuc - 1) / 2));
        if (id === 'porto') return Math.min(4, 1 + Math.floor(nuc / 2));
        if (id === 'torre_vigia') return Math.min(6, 2 + nuc);
        if (id === 'praca') return Math.min(4, 1 + Math.floor(nuc / 2));
        if (id === 'pomar') return Math.min(4, 1 + Math.floor((nuc - 2) / 2));
        if (id === 'poco') return Math.min(3, 1 + Math.floor((nuc - 2) / 2));
        if (id === 'pedreira') return Math.min(3, 1 + Math.floor((nuc - 3) / 2));
        if (id === 'fundicao') return Math.min(2, 1 + Math.floor((nuc - 7) / 3));
        if (['colhedor_solar', 'siderurgica', 'biodomo', 'nexo_cristal', 'forja_estelar2', 'colheita_orbital', 'fusao', 'poco_dim'].includes(id)) return 2;

        // Casas e Moradias:
        if (id === 'cabana') return 3 + nuc;
        if (id === 'casa') return 2 + Math.floor(nuc / 2);
        if (id === 'chale') return 2 + Math.floor(nuc / 2);
        if (id === 'sobrado') return 1 + Math.floor(nuc / 3);
        if (['torre_hab', 'domo', 'loft', 'cupula', 'torre_vidro', 'arranha_ceu', 'habitat', 'arcologia', 'cidade_flutuante', 'cupula_estelar'].includes(id)) {
            return Math.min(3, 1 + Math.floor(nuc / 6));
        }

        // Armazenamento e Baterias:
        if (id === 'armazem') return 2 + Math.floor(nuc / 2);
        if (['silo', 'cofre', 'armazem_q', 'cofre_dim'].includes(id)) return 1 + Math.floor(nuc / 4);
        if (id === 'bateria') return 2 + Math.floor(nuc / 2);
        if (['solar', 'antena', 'gerador', 'bateria_fusao', 'reator_bat'].includes(id)) return 2 + Math.floor(nuc / 3);

        // Instituições de estudo / centros de ciência:
        if (['biblioteca', 'lab', 'observatorio', 'escola', 'centro_pesq', 'universidade', 'academia', 'lab_q', 'obs_profundo', 'supercomp', 'portal_estudo'].includes(id)) {
            return 1;
        }

        // Eventos:
        if (['cabana_bruxa', 'barraca_doces'].includes(id)) return 1;
        if (['casa_assombrada', 'caldeirao'].includes(id)) return 2;

        // Decoração, natureza e caminhos: ilimitados
        return Infinity;
    }
    function clUnlocked(t) { return t.nuc <= clS().nuc; }
    function clBuy(id, x, z, rot, cv) { if(window.ruaProfile==='guest'&&!window.ruaDataReady)return {ok:false,err:'Aguardando a sincronização da sua conta. Tente novamente em instantes.'};
        const s = clS(), t = CLT[id]; if (!t || t.hid) return { ok: false, err: 'Peça desconhecida.' }; if (t.ev && !clEvActive(t.ev)) return { ok: false, err: 'Peça de evento: só dá para construir durante o evento.' }; if (!clUnlocked(t)) return { ok: false, err: 'Precisa do Núcleo nível ' + t.nuc + '.' };
        const lim = clPieceLimit(id, s.nuc);
        if (isFinite(lim) && clPieceCount(s, id) >= lim) { return { ok: false, err: 'Limite de ' + lim + ' ' + (lim > 1 ? 'destas construções' : 'desta construção') + ' atingido. Evolua o Núcleo para liberar mais.' }; }
        if (!clFits(id, x, z, rot)) { const why = clBlockedBy(id, x, z, rot); return { ok: false, err: why === 'sujeira' ? 'Tem sujeira aqui: limpe antes de construir.' : 'Não cabe aqui.' }; } const cost = clScaled(t.cost); if (!clCan(cost)) return { ok: false, err: 'Faltam recursos.' };
        clPay(cost); s.pcs.push([id, x, z, rot & 3, 1, cv | 0]); s.seen[id] = 1; CL.ver++; clSave(true, 'colony-action'); return { ok: true, i: s.pcs.length - 1 };
    }
    function clMovePiece(i, x, z, rot) { const s = clS(), p = s.pcs[i]; if (!p || p[0] === 'nucleo' || !clFits(p[0], x, z, rot, i)) return false; p[1] = x; p[2] = z; p[3] = rot & 3; CL.ver++; clSave(true, 'colony-action'); return true; }
    function clUpgradePiece(i) { if(window.ruaProfile==='guest'&&!window.ruaDataReady)return {ok:false,err:'Aguardando a sincronização da sua conta. Tente novamente em instantes.'};
        const s = clS(), p = s.pcs[i], t = p && CLT[p[0]]; if (!t || !clUpgradable(t)) return { ok: false, err: 'Esta peça não evolui.' }; if (p[4] >= clMaxLv(s)) return { ok: false, err: 'Suba o Núcleo para evoluir mais.' };
        const c = clUpCost(p[0], p[4]); if (!clCan(c)) return { ok: false, err: 'Faltam recursos.' }; clPay(c); p[4]++; CL.ver++; clSave(true, 'colony-action');
        try { const f = clFp(t, p[3]); if (typeof clTriggerUpgradeFX === 'function') clTriggerUpgradeFX([p[1] + f[0] / 2, 0, p[2] + f[1] / 2], false, i); } catch (e) {}
        return { ok: true, lv: p[4] };
    }
    function clSellPiece(i) {
        const s = clS(), p = s.pcs[i]; if (!p || p[0] === 'nucleo') return false;
        const wts = clWts(s); ['c', 'b', 'm'].forEach(r => clMatch(s, r, wts));
        if (Array.isArray(p[6])) ['c', 'b', 'm'].forEach((r, j) => { const a = +p[6][j] || 0; if (!(a > 0)) return; const n = Math.floor(a + 1e-9); s.pend[r] = Math.max(0, (s.pend[r] || 0) - a); if (n > 0) s.res[r] = (s.res[r] || 0) + n; if (a - n > 1e-8) s.pend[r] = (s.pend[r] || 0) + (a - n); });
        const o = clValueRes(p), v = {}; Object.keys(o).forEach(k => { v[k] = Math.floor((CL._sell100 ? 1 : 0.6) * o[k]); }); s.pcs.splice(i, 1);
        const w2 = clWts(s); ['c', 'b', 'm'].forEach(r => clMatch(s, r, w2)); CL.ver++; if (CL._sell100) { s.credit = s.credit || {}; Object.keys(v).forEach(k => { s.credit[k] = (s.credit[k] || 0) + v[k]; }); } else clRefund(v); clSave(true, 'colony-action'); return true;
    }
    function clRecolor(i, cv) { const s = clS(), p = s.pcs[i]; if (!p) return false; p[5] = ((cv % (CLD.PAL.length + 1)) + CLD.PAL.length + 1) % (CLD.PAL.length + 1); CL.ver++; if (typeof CL3 !== 'undefined' && CL3) CL3.need = true; if (typeof CL !== 'undefined' && CL) CL.pcsSig = ''; clSave(); return true; }
    const clNucCost = n => CLD.nucCost(n);   /* escalonamento econômico refinado para o avanço da civilização */
    const CL_NUC_SKILLS = [0, 8, 18, 30, 46, 64, 86, 110, 138, 170, 206];
    const clNucNeed = n => (n < CL_NUC_SKILLS.length ? CL_NUC_SKILLS[n] : CL_NUC_SKILLS[CL_NUC_SKILLS.length - 1] + (n - CL_NUC_SKILLS.length + 1) * 40);
    function clNucReqs(nuc) {
        const s = clS(), st = clStats(), pcs = s.pcs || [];
        const count = pcs.filter(p => p[0] !== 'nucleo').length;
        const casas = pcs.filter(p => { const t = CLT[p[0]]; return t && t.cat === 'casa'; }).length;
        const prods = pcs.filter(p => { const t = CLT[p[0]]; return t && t.cat === 'prod'; }).length;
        const utils = pcs.filter(p => { const t = CLT[p[0]]; return t && (t.cat === 'util' || t.cat === 'dec'); }).length;
        const up2 = pcs.filter(p => p[0] !== 'nucleo' && (p[4] || 1) >= 2).length;
        const up3 = pcs.filter(p => p[0] !== 'nucleo' && (p[4] || 1) >= 3).length;

        const need = clNucNeed(nuc);
        const reqs = [
            { label: 'Níveis de Habilidade (1 nível = 50 min de estudo)', ok: st.skill >= need, cur: st.skill, need: need, isMast: true }
        ];
        if (nuc === 1) {
            reqs.push({ label: 'Ter ao menos 4 construções ativas', ok: count >= 4, cur: count, need: 4 });
            reqs.push({ label: '1 Moradia (Cabana/Casa) construída', ok: casas >= 1, cur: casas, need: 1 });
            reqs.push({ label: '1 Estrutura de Produção (Mina/Fazenda)', ok: prods >= 1, cur: prods, need: 1 });
        } else if (nuc === 2) {
            reqs.push({ label: 'Ter ao menos 7 construções ativas', ok: count >= 7, cur: count, need: 7 });
            reqs.push({ label: '2 Estruturas de Produção ativas', ok: prods >= 2, cur: prods, need: 2 });
            reqs.push({ label: 'Ao menos 1 construção evoluída para Nível 2', ok: up2 >= 1, cur: up2, need: 1 });
            reqs.push({ label: 'População de ao menos 2 colonos', ok: st.pop >= 2, cur: st.pop, need: 2 });
        } else if (nuc === 3) {
            reqs.push({ label: 'Ter ao menos 11 construções ativas', ok: count >= 11, cur: count, need: 11 });
            reqs.push({ label: 'Pelo menos 1 Instalação de Utilidade', ok: utils >= 1, cur: utils, need: 1 });
            reqs.push({ label: 'Ao menos 3 construções no Nível 2+', ok: up2 >= 3, cur: up2, need: 3 });
            reqs.push({ label: 'População de ao menos 5 colonos', ok: st.pop >= 5, cur: st.pop, need: 5 });
        } else if (nuc === 4) {
            reqs.push({ label: 'Ter ao menos 16 construções ativas', ok: count >= 16, cur: count, need: 16 });
            reqs.push({ label: 'Ao menos 2 construções no Nível 3+', ok: up3 >= 2, cur: up3, need: 2 });
            reqs.push({ label: 'População de ao menos 8 colonos', ok: st.pop >= 8, cur: st.pop, need: 8 });
        } else {
            const minPcs = 16 + (nuc - 4) * 4;
            const minUp = Math.min(minPcs, 2 + (nuc - 4) * 2);
            const minPop = 8 + (nuc - 4) * 4;
            reqs.push({ label: 'Mínimo de ' + minPcs + ' construções ativas', ok: count >= minPcs, cur: count, need: minPcs });
            reqs.push({ label: minUp + ' construções de Nível 3+', ok: up3 >= minUp, cur: up3, need: minUp });
            reqs.push({ label: 'População de ao menos ' + minPop + ' colonos', ok: st.pop >= minPop, cur: st.pop, need: minPop });
        }
        const allOk = reqs.every(r => r.ok);
        return { allOk, reqs, needMast: need };
    }
    function clUpNucleus() {
        const s = clS(), req = clNucReqs(s.nuc), c = clNucCost(s.nuc);
        if (!req.allOk) {
            const missing = req.reqs.filter(r => !r.ok).map(r => r.label + ' (' + r.cur + '/' + r.need + ')').join('; ');
            return { ok: false, err: 'Requisitos pendentes: ' + missing };
        }
        if (!clCan(c)) return { ok: false, err: 'Faltam recursos.' };
        clPay(c); s.nuc++;
        const n = s.pcs.find(p => p[0] === 'nucleo');
        if (n) n[4] = s.nuc;
        CL.ver++; clSave(true, 'colony-action');
        try { if (typeof clTriggerUpgradeFX === 'function') clTriggerUpgradeFX([n ? n[1] + 1.5 : 0, 0, n ? n[2] + 1.5 : 0], true); } catch (e) {}
        return { ok: true, nuc: s.nuc };
    }
    function clExpandCost() { const s = clS(), k = (s.H - CLD.H0) / CLD.HSTEP; return { c: Math.round(220 * Math.pow(1.5, k)), b: Math.round(90 * Math.pow(1.4, k)), m: Math.round(60 * Math.pow(1.4, k)) }; }
    const clExpandNeed = () => 1 + Math.floor((clS().H - CLD.H0) / (2 * CLD.HSTEP));
    function clExpand() {
        const s = clS(); if (s.H >= CLD.HMAX) return { ok: false, err: 'O terreno já está no tamanho máximo.' }; if (s.nuc < clExpandNeed()) return { ok: false, err: 'Precisa do Núcleo nível ' + clExpandNeed() + '.' };
        const c = clExpandCost(); if (!clCan(c)) return { ok: false, err: 'Faltam recursos.' }; clPay(c); s.H = Math.min(CLD.HMAX, s.H + CLD.HSTEP); CL.ver++; clSave(true, 'colony-action'); return { ok: true, H: s.H };
    }
    /* ---------- Ascensão: recomeça com bônus permanentes (as habilidades, a coleção e as plantas ficam) ---------- */
    const clAscNeed = s => 10 + 5 * s.asc;
    function clAscGain(s) { const st = clStats(); return Math.max(1, Math.floor(Math.pow(st.score / 400, 0.6)) + Math.floor(s.nuc / 2)) + clPerk(s, 'frag'); }
    const clAscOk = s => s.nuc >= clAscNeed(s);
    function clPerkCost(k, r) { const p = CLD.PERKS.find(x => x.k === k); return p ? Math.ceil(p.base * Math.pow(p.gr, r)) : 1e9; }
    function clBuyPerk(k) {
        const s = clS(), p = CLD.PERKS.find(x => x.k === k); if (!p) return { ok: false, err: 'Vantagem desconhecida.' }; const r = clPerk(s, k); if (r >= p.max) return { ok: false, err: 'Já está no máximo.' }; const c = clPerkCost(k, r); if (s.frag < c) return { ok: false, err: 'Faltam fragmentos de estrela (' + s.frag + '/' + c + ').' };
        s.frag -= c; s.perks[k] = r + 1; CL.ver++; clSave(true, 'colony-action'); return { ok: true, rank: r + 1 };
    }
    function clSaveBp(name) {
        const s = clS(), pcs = s.pcs.filter(p => p[0] !== 'nucleo').map(p => p.slice(0, 6)); if (!pcs.length) return false; s.bp.unshift({ n: String(name || 'Planta ' + (s.bp.length + 1)).slice(0, 28), at: Date.now(), nuc: s.nuc, pcs }); s.bp = s.bp.slice(0, 6); clSave(true, 'colony-action'); return true;
    }
    function clApplyBp(i) {   // refaz a planta, peça por peça, enquanto houver recursos e lugar limpo (a sujeira do terreno novo pode atrapalhar)
        const s = clS(), b = s.bp[i]; if (!b) return { ok: false, n: 0, skipped: 0 }; let n = 0, skipped = 0; const list = b.pcs.slice().sort((x, y) => clValue([x[0], 0, 0, 0, 1]) - clValue([y[0], 0, 0, 0, 1]));
        list.forEach(p => { const t = CLT[p[0]]; if (!t || !clUnlocked(t)) { skipped++; return; } const r = clBuy(p[0], p[1], p[2], p[3], p[5]); if (r.ok) n++; else skipped++; }); return { ok: true, n, skipped };
    }
    function clAscend() {
        const s = clS(); if (!clAscOk(s)) return { ok: false, err: 'Precisa do Núcleo nível ' + clAscNeed(s) + '.' };
        const gain = clAscGain(s); clSaveBp('Antes da Ascensão ' + (s.asc + 1)); const st = 150 * clPerk(s, 'start');
        s.asc++; s.frag += gain; s.fragT += gain; s.nuc = 1; s.H = CLD.H0; s.pcs = [['nucleo', -1, -1, 0, 1, 0]]; s.res = { c: 150 + st, b: 80 + st, m: 50 + st, d: s.res.d || 0 }; s.cd = []; s.pend = { c: 0, b: 0, m: 0 }; s.seed = clSeedNew(); s.clr = []; CL.deb = null; CL.ver++; clSave(true, 'colony-action'); return { ok: true, asc: s.asc, gain };
    }
    /* ---------- pedidos e desafios: renovam por dia e por semana, e todos passam pelo estudo ---------- */
    const clDayN = iso => Math.floor(Date.parse(iso + 'T12:00:00Z') / 86400000);
    const clIsoOf = n => new Date(n * 86400000).toISOString().slice(0, 10);
    const clWeekStart = iso => { const n = clDayN(iso); return clIsoOf(n - ((n + 3) % 7)); }   /* segunda-feira */
    function clWeekMins(s, ws) { const a = clDayN(ws); let m = 0; for (let i = 0; i < 7; i++) m += s.hist[clIsoOf(a + i)] || 0; return m; }
    function clOrdMul(s) { const o = s.ord; return 1 + Math.min(0.5, 0.05 * Math.max(0, (o.streak || 0) - 1)) + 0.08 * clPerk(s, 'ord'); }
    function clStudyAvg(s) {   // média diária dos últimos 14 dias (sem contar hoje): as metas acompanham o ritmo de quem estuda
        const dn = clDayN(todayISO()); let m = 0; for (let i = 1; i <= 14; i++) m += s.hist[clIsoOf(dn - i)] || 0; return m / 14;
    }
    const clStudyGoals = s => { const A = clStudyAvg(s), r5 = (v, k) => Math.round(v / k) * k, cl = (v, a, b) => Math.max(a, Math.min(b, v)), day = cl(r5(A * 0.8, 5), 20, 240), wk = cl(r5(A * 7 * 0.8, 30), 240, 3600), wk2 = Math.max(wk + 120, cl(r5(A * 7 * 1.15, 30), 360, 4200)); return { day, wk, wk2 }; };
    function clOrdEnsure() {
        const s = clS(), td = todayISO(), ws = clWeekStart(td); if (!s.ord) s.ord = { d: '', w: '', l: [], wl: null, streak: 0, sl: '', done: 0 }; const o = s.ord; let ch = false;
        if (!s.hwEnd) { s.hwEnd = 1; const dd = Math.floor(s.res && s.res.d || 0); if (dd > 0 && s.res) s.res.c = (s.res.c || 0) + dd * 3; if (s.res) s.res.d = 0; s.cd = []; delete o.eq; delete o.ed; ch = true; }   /* fim do Halloween: doces sobrando viram cristal (3 por doce) e a missão do evento some */
        if (o.d !== td) {
            if (o.sl && o.sl !== td && clDayN(td) - clDayN(o.sl) > 1) o.streak = 0;   /* perdeu um dia: a sequência recomeça (nada do que já ganhou se perde) */
            o.d = td; ch = true; const dn = clDayN(td), sc = Math.max(40, Math.round(clNucCost(s.nuc).c * 0.16)), h = (i, j) => clHash(s.seed | 0, dn, i, j), pick = (arr, r) => arr[Math.floor(r * arr.length) % arr.length];
            const st = clStats(), cap = st.cap, mins = clStudyGoals(s).day;
            const rr = pick(['b', 'm', 'b', 'm', 'c'], h(2, 1)), amt = Math.max(10, Math.min(Math.round(cap[rr] * 0.5), Math.round(sc * (rr === 'c' ? 1.1 : 0.9) * (1 + h(2, 2)))));
            const cats = CLD.CATS.map(x => x[0]).filter(k => k !== 'ev' && CLD.PIECES.some(p => p.cat === k && !p.hid && p.nuc <= s.nuc)), ct = pick(cats, h(3, 1)), have = s.pcs.filter(p => CLT[p[0]] && CLT[p[0]].cat === ct).length;
            o.l = [
                { t: 'study', n: mins, rw: { ch: Math.max(1, Math.min(3, Math.round(mins / 60 * 1) / 2 + 0.5)), c: Math.round(sc * 0.5) }, done: 0 },
                { t: 'deliver', r: rr, n: amt, rw: rr === 'c' ? { b: Math.round(amt * 0.8), m: Math.round(amt * 0.8) } : { c: Math.round(amt * 1.5) }, done: 0 },
                { t: 'build', k: ct, n: have + 1, rw: { c: Math.round(sc * 0.4), b: Math.round(sc * 0.3), m: Math.round(sc * 0.3) }, done: 0 }
            ];
        }
        if (o.l && o.l[2] && o.l[2].t === 'build' && o.l[2].k === 'ev' && !o.l[2].done) {   /* missão de construir peças de Halloween: não dá mais (a loja do evento acabou), troca por outra categoria */
            const sc3 = Math.max(40, Math.round(clNucCost(s.nuc).c * 0.16)), cs3 = CLD.CATS.map(x => x[0]).filter(k => k !== 'ev' && k !== '_clear' && CLD.PIECES.some(p => p.cat === k && !p.hid && p.nuc <= s.nuc)), ct3 = cs3[(clDayN(td) + 3) % Math.max(1, cs3.length)] || 'dec', hv3 = s.pcs.filter(p => CLT[p[0]] && CLT[p[0]].cat === ct3).length;
            o.l[2] = { t: 'build', k: ct3, n: hv3 + 1, rw: { c: Math.round(sc3 * 0.4), b: Math.round(sc3 * 0.3), m: Math.round(sc3 * 0.3) }, done: 0 }; ch = true; }
        if (clEvActive('halloween') && o.ed !== td) { o.ed = td; o.eq = { t: 'study', n: 30, rw: { d: 5 }, done: 0 }; ch = true; }
        if (o.wv !== 2) { o.wv = 2; o.w = ''; const g = clStudyGoals(s); if (o.l[0] && o.l[0].t === 'study' && !o.l[0].done) o.l[0].n = g.day; ch = true; }
        if (o.w !== ws) { o.w = ws; ch = true; const g = clStudyGoals(s), sc2 = Math.max(40, clNucCost(s.nuc).c * 0.16), hrs = g.wk / 60, hrs2 = g.wk2 / 60;
            o.wl = { t: 'week', n: g.wk, rw: { ch: Math.max(3, Math.min(8, Math.round(hrs * 0.2 * 2) / 2)), fr: 1, c: Math.round(sc2 * 2) }, done: 0 };
            o.wl2 = { t: 'week', n: g.wk2, rw: { ch: Math.max(4.5, Math.min(12, Math.round(hrs2 * 0.3 * 2) / 2)), fr: 2, c: Math.round(sc2 * 4) }, done: 0, hard: 1 }; }
        if (ch) clSave(true, 'colony-action'); return o;
    }
    function clOrdProg(s, q) {   // quanto já foi feito (e o total) de um pedido
        const td = todayISO();
        if (q.t === 'study') return [Math.min(q.n, s.hist[td] || 0), q.n];
        if (q.t === 'week') return [Math.min(q.n, clWeekMins(s, s.ord.w)), q.n];
        if (q.t === 'deliver') return [Math.min(q.n, Math.floor(s.res[q.r])), q.n];
        return [Math.min(q.n, s.pcs.filter(p => CLT[p[0]] && CLT[p[0]].cat === q.k).length), q.n];
    }
    function clOrdList() { const o = clOrdEnsure(), l = o.l.concat([o.wl]); if (o.eq && o.ed === todayISO() && clEvActive('halloween')) l.push(o.eq); l.push(o.wl2); return l; }
    function clOrdReady() { const s = clS(); return clOrdList().filter(q => !q.done && clOrdProg(s, q)[0] >= q.n).length; }
    function clOrdClaim(i) {   // i: 0..2 diários, 3 semanal
        const s = clS(), o = clOrdEnsure(), q = i === 3 ? o.wl : i === 5 ? o.wl2 : i === 4 ? (clEvActive('halloween') && o.ed === todayISO() ? o.eq : null) : o.l[i]; if (!q) return { ok: false, err: 'Pedido inexistente.' }; if (q.done) return { ok: false, err: 'Esse pedido já foi entregue.' };
        const p = clOrdProg(s, q); if (p[0] < q.n) return { ok: false, err: q.t === 'study' || q.t === 'week' ? 'Falta estudar.' : q.t === 'deliver' ? 'Ainda não tem o suficiente.' : 'Falta construir.' };
        const td = todayISO(), m = clOrdMul(s);   /* "juntar" não gasta nada: basta ter */
        const got = {}; ['c', 'b', 'm'].forEach(k => { if (q.rw[k]) got[k] = Math.round(q.rw[k] * m); }); clRefund(got); if (q.rw.d) { got.d = Math.round(q.rw.d * m); s.res.d = (s.res.d || 0) + got.d; clHw().tot += got.d; }
        const st = clStats(); if (q.rw.ch) { const a = Math.min(Math.max(0, st.chargeCap * 3600 - s.charge), q.rw.ch * 3600 * m); s.charge += a; got.ch = Math.round(a / 36) / 100; }
        if (q.rw.fr) { s.frag += q.rw.fr; s.fragT += q.rw.fr; got.fr = q.rw.fr; }
        q.done = 1; o.done = (o.done || 0) + 1;
        if (i === 0 && o.sl !== td) { o.streak = (o.sl && clDayN(td) - clDayN(o.sl) === 1) ? (o.streak || 0) + 1 : 1; o.sl = td; }
        CL.ver++; clSave(true, 'colony-action'); return { ok: true, got, streak: o.streak || 0 };
    }
    /* ---------- a outra pessoa: incentivo, presentes, "estudamos juntos" e um cartão da colônia dela. Tudo pela conexão direta dos dois (CL.net); o que não chega fica na caixa de saída e vai quando ela voltar ---------- */
    const CLFR_GIFT_DAY = 3, CLFR_CHEER_H = 0.5, CLFR_TOGETHER_H = 1;
    function clFr() { const s = clS(); if (!s.fr) s.fr = { out: [], inbox: [], seen: [], cheerDay: '', giftDay: '', giftN: 0, togDay: '', info: null }; return s.fr; }
    const clFrId = () => 'm' + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36);
    const clFrNet = m => { try { return !!(CL.net && CL.net(m)); } catch (e) { return false; } };
    function clFrFlush() { const f = clFr(); let n = 0; f.out.forEach(o => { if (clFrNet({ t: 'cl', k: o.k, id: o.id, r: o.r, n: o.n })) n++; }); return n; }
    function clFrGiftMax(s) { return Math.max(10, Math.floor(clStats().cap.c * 0.5)); }
    function clFrSend(kind, r, n) {
        const s = clS(), f = clFr(), td = todayISO();
        if (kind === 'cheer') { if (f.cheerDay === td) return { ok: false, err: 'Você já mandou o incentivo de hoje.' }; f.cheerDay = td; f.out.push({ id: clFrId(), k: 'cheer' }); clFrFlush(); clSave(true); return { ok: true }; }
        if (kind !== 'gift' || !['c', 'b', 'm', 'd'].includes(r)) return { ok: false, err: 'Presente inválido.' }; n = Math.floor(+n || 0);
        if (n < 1) return { ok: false, err: 'Escolha uma quantidade.' }; if (n > (r === 'd' ? 30 : clFrGiftMax(s))) return { ok: false, err: 'Muito grande: no máximo ' + (r === 'd' ? 30 : clFrGiftMax(s)) + ' por presente.' };
        if (f.giftDay !== td) { f.giftDay = td; f.giftN = 0; } if (f.giftN >= CLFR_GIFT_DAY) return { ok: false, err: 'Só ' + CLFR_GIFT_DAY + ' presentes por dia.' };
        if ((s.res[r] || 0) + 1e-9 < n) return { ok: false, err: 'Faltam recursos.' }; s.res[r] -= n; f.giftN++; f.out.push({ id: clFrId(), k: 'gift', r, n }); clFrFlush(); CL.ver++; clSave(true); return { ok: true };
    }
    function clFrInfo() { const s = clS(), st = clStats(); return { name: String(s.name || 'Colônia').slice(0, 30), nuc: s.nuc, era: clEra(s.nuc), pcs: s.pcs.length, pop: st.pop, score: Math.round(st.score), mast: st.mast, asc: s.asc, today: Math.round(s.hist[todayISO()] || 0), pend: 0, user: String(window.ruaUser || '').slice(0, 30) }; }
    function clFrRecv(m) {   // chega da outra pessoa; nada daqui confia no que veio
        if (!m || typeof m !== 'object') return; const f = clFr(), id = String(m.id || '').replace(/[^a-z0-9]/gi, '').slice(0, 40), num = (v, hi) => Math.max(0, Math.min(hi, Math.floor(+v || 0)));
        if (m.k === 'ask') { clFrNet({ t: 'cl', k: 'info', d: clFrInfo() }); return; }
        if (m.k === 'vask') { clVisAsk(); return; }
        if (m.k === 'vis') { clVisRecv(m); return; }
        if (m.k === 'info') { const d = m.d || {}; f.info = { name: String(d.name || '').replace(/[<>]/g, '').slice(0, 30), nuc: num(d.nuc, 999), era: String(d.era || '').replace(/[<>]/g, '').slice(0, 30), pcs: num(d.pcs, 9999), pop: num(d.pop, 99999), score: num(d.score, 1e9), mast: num(d.mast, 99999), asc: num(d.asc, 999), today: num(d.today, 1440), at: Date.now() }; CL.ver++; return; }
        if (m.k === 'ack') { f.out = f.out.filter(o => o.id !== id); clSave(true); return; }
        if ((m.k === 'gift' || m.k === 'cheer') && id) {
            if (!f.seen.includes(id)) { f.seen.push(id); if (f.seen.length > 200) f.seen.shift(); if (m.k === 'cheer') f.inbox.push({ id, k: 'cheer', ts: Date.now() }); else if (['c', 'b', 'm', 'd'].includes(m.r)) { const n = num(m.n, m.r === 'd' ? 30 : 5000); if (n >= 1) f.inbox.push({ id, k: 'gift', r: m.r, n, ts: Date.now() }); } if (f.inbox.length > 50) f.inbox.shift(); clSave(true); }
            clFrNet({ t: 'cl', k: 'ack', id });
        }
    }
    function clFrClaim(i) {
        const s = clS(), f = clFr(), it = f.inbox[i]; if (!it) return { ok: false, err: 'Nada para receber.' }; f.inbox.splice(i, 1);
        if (it.k === 'gift') { s.res[it.r] = (s.res[it.r] || 0) + it.n; CL.ver++; clSave(true); return { ok: true, k: 'gift', r: it.r, n: it.n }; }
        const st = clStats(), a = Math.min(Math.max(0, st.chargeCap * 3600 - s.charge), CLFR_CHEER_H * 3600); s.charge += a; CL.ver++; clSave(true); return { ok: true, k: 'cheer', h: a / 3600 };
    }
    function clFrTogether() {   // os dois estudaram hoje (vale quando o cartão dela é recente): +1 h de carga, uma vez por dia
        const s = clS(), f = clFr(), td = todayISO(), me = s.hist[td] || 0; if (f.togDay === td) return { ok: false, err: 'Vocês já colheram isso hoje.' };
        if (!f.info || Date.now() - f.info.at > 15 * 60000) return { ok: false, err: 'Atualize o cartão dela primeiro.' }; if (me < 20 || f.info.today < 20) return { ok: false, err: 'Os dois precisam estudar pelo menos 20 min hoje (você: ' + Math.floor(me) + ', ela/ele: ' + f.info.today + ').' };
        f.togDay = td; const st = clStats(), a = Math.min(Math.max(0, st.chargeCap * 3600 - s.charge), CLFR_TOGETHER_H * 3600); s.charge += a; CL.ver++; clSave(true); return { ok: true, h: a / 3600 };
    }
    /* ---------- eventos por data (Halloween): peças exclusivas, Doces que só nascem do estudo e um pedido do evento ---------- */
    const CLEV = { halloween: { n: 'Halloween', a: [10, 24], b: [11, 2], ic: 'ph-ghost', ms: [[15, { ch: 2 }], [40, { fr: 1 }], [80, { fr: 2, c: 1 }], [150, { fr: 3, c: 2 }]] } };
    function clEvActive(id) {   // window.ruaEvent força um evento ('off' desliga); sem ele vale a data real do aparelho
        const o = window.ruaEvent; return !!o && o === id;   /* o Halloween acabou: nenhum evento roda por data; só o atalho de teste liga */
    }
    const clEvNow = () => Object.keys(CLEV).find(clEvActive) || '';
    function clHw() { const s = clS(); if (!s.hw) s.hw = { tot: 0, ms: 0, od: '', seen: '' }; if (!Array.isArray(s.cd)) s.cd = []; return s.hw; }
    function clCandySpawn(mins) {   // cada sessão de estudo deixa doces no terreno (mais minutos, mais doces)
        if (!clEvActive('halloween')) return 0; const s = clS(); clHw(); const st = clStats(); let n = Math.min(6, 1 + Math.floor(mins / 8)) + Math.round(st.cdx || 0), made = 0; const occ = clOcc(s), H = s.H;
        for (let k = 0; k < n * 12 && made < n && s.cd.length < 30; k++) {
            const x = Math.floor(-H + 1 + Math.random() * (2 * H - 2)), z = Math.floor(-H + 1 + Math.random() * (2 * H - 2)); if (occ.get(clCells(x, z)) !== undefined || s.cd.some(c => c[0] === x && c[1] === z)) continue;
            s.cd.push([x, z, Math.random() < 0.14 ? 1 : 0]); made++;
        }
        if (made) { CL.ver++; clSave(true); } return made;
    }
    function clCandyTake(i) {
        const s = clS(), hw = clHw(), c = s.cd[i]; if (!c) return { ok: false }; s.cd.splice(i, 1); const v = c[2] ? 3 : 1; s.res.d = (s.res.d || 0) + v; hw.tot += v; CL.ver++; clSave(true); return { ok: true, v };
    }
    function clEvMilestones() { const hw = clHw(); return CLEV.halloween.ms.map((m, i) => ({ at: m[0], rw: m[1], done: !!(hw.ms & (1 << i)), ready: hw.tot >= m[0] && !(hw.ms & (1 << i)) })); }
    function clEvClaim(i) {
        const s = clS(), hw = clHw(), m = CLEV.halloween.ms[i]; if (!m) return { ok: false, err: 'Prêmio inexistente.' }; if (hw.ms & (1 << i)) return { ok: false, err: 'Esse prêmio já foi pego.' }; if (hw.tot < m[0]) return { ok: false, err: 'Faltam doces: ' + hw.tot + ' / ' + m[0] + '.' };
        hw.ms |= 1 << i; const got = {}, sc = Math.max(40, Math.round(clNucCost(s.nuc).c * 0.16)); if (m[1].c) { got.c = sc * m[1].c * 3; clRefund({ c: got.c }); } if (m[1].fr) { s.frag += m[1].fr; s.fragT += m[1].fr; got.fr = m[1].fr; }
        if (m[1].ch) { const st = clStats(), a = Math.min(Math.max(0, st.chargeCap * 3600 - s.charge), m[1].ch * 3600); s.charge += a; got.ch = a / 3600; } CL.ver++; clSave(true); return { ok: true, got };
    }
    function clExtend(list) {   /* peças extras vindas de assets/colony/catalog.json: mesma forma das daqui, com 'parts' (receita) ou 'glb' */
        (Array.isArray(list) ? list : []).forEach(p => { if (p && p.id && /^[a-z0-9_]{2,24}$/.test(p.id) && !CLT[p.id] && Array.isArray(p.fp) && p.cost && typeof p.cost === 'object') { p.nuc = p.nuc || 1; p.cat = p.cat || 'dec'; p.n = String(p.n || p.id).slice(0, 28); CLD.PIECES.push(p); CLT[p.id] = p; } });
    }
/* === [SEC: COLONIA_MAPA] === */
/* ===== cortex/36j-colony-3d.js: a Colônia: a cena 3D própria (chão = superfície da estrela, terreno de construção em placas, céu escuro), peças em lote com textura e movimento leve, câmera e toque/mouse ===== */

    const CL3 = { r: null, cv: null, root: null, sc: null, cam: null, grp: null, inst: [], geo: {}, mS: null, mG: null, mGh: null, floor: null, ground: null, gridL: null, ghost: null, ghostKey: '', selM: null, selKey: '', dust: null, outer: null, thumb: {}, thumbBusy: false, debInst: [], debSig: '', sunV: null, smoke: null, smSrc: [], col: null, agents: [], bub: {}, pv: null, need: true, needT: true, ptr: new Map(), yaw: 0.6, pit: 0.72, dist: 34, tx: 0, tz: 0, gyaw: 0.6, gpit: 0.72, gdist: 34, gtx: 0, gtz: 0, w: 0, h: 0, hoverOk: false, tickT: 0, t: 0, uTime: { value: 0 }, uNight: { value: 0 }, dayN: null, lamps: [], lampSlots: [], spots: {}, zz: [] };

    const clTh = () => T.THREE;

    const CL_PALS = { azul: ['#4fb8ff', '#9ee3ff'], verde: ['#5fe05a', '#c4ff9a'], dourado: ['#ffb02e', '#ffe29a'], rosa: ['#ff7ac8', '#ffc2e6'], roxo: ['#a06bff', '#d8c0ff'] };
    const clPalPref = () => { try { const v = localStorage.getItem('cestille_cl_pal'); return CL_PALS[v] ? v : ''; } catch (e) { return ''; } };
    const clStarPal = () => clEvActive('halloween') ? ['#ff7a1a', '#b36bff'] : (CL_PALS[clPalPref()]) || (clBiome(clS()).pal) || (clPinkStar() ? ['#ff7ac8', '#ffc2e6'] : ['#4fb8ff', '#9ee3ff']);

    function clTints(t, cv) { if (cv > 0 && CLD.PAL[cv - 1]) return [CLD.PAL[cv - 1][1], CLD.PAL[cv - 1][2]]; return t.t || clStarPal(); }

    /* ---------- peças: cada receita vira uma geometria só (cor, brilho e movimento nos vértices), uma para o sólido e outra para o que brilha ---------- */

    function clRM(col, pt) {   /* material de cada parte pela cor: [rugosidade, metal, é-metal]. Madeira e plantas foscas, pintura acetinada, peças na cor da colônia brilhantes; cinza muito escuro e prata-azulado são metal de verdade */

        const h = {}; col.getHSL(h); const s = h.s, l = h.l, hu = h.h * 360;

        if (pt.c === 'T' || pt.c === 'U') return pt.k === 'k' || pt.k === 'p' || pt.k === 's' ? [0.3, 0.2, 0] : [0.45, 0.12, 0];

        if (hu > 15 && hu < 52 && s > 0.18 && s < 0.8 && l < 0.52) return [0.86, 0, 0];

        if (hu > 70 && hu < 170 && s > 0.22) return [0.7, 0, 0];

        if (l <= 0.2 && s < 0.45 && !(hu > 15 && hu < 52 && s > 0.15)) return [0.5, 0.45, 1];

        if (l > 0.55 && s < 0.3 && hu > 190 && hu < 250 && !pt.g) return [0.4, 0.4, 1];

        if (s < 0.14 && l > 0.2 && l < 0.8) return [0.66, 0.16, 0];

        if (l <= 0.2) return [0.6, 0.28, 0];

        if (l >= 0.8 && s < 0.3) return [0.48, 0.04, 0];

        return [0.55, 0.06, 0];

    }

    function clTorusGeo(THREE, tr) { const g = new THREE.TorusGeometry(0.5, tr, 14, 48); g.rotateX(Math.PI / 2); return g; }   /* anel de verdade (toro), deitado */

    function clLatheGeo(THREE, pr) { const pts = pr.map(p => new THREE.Vector2(p[0], p[1])), g = new THREE.LatheGeometry(pts, 40); let y0 = 1e9, y1 = -1e9; pr.forEach(p => { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }); g.translate(0, -(y0 + y1) / 2, 0); return g; }   /* peça torneada: carcaças, pilares, pratos e flanges de perfil liso */

    function clDomeGeo(THREE) { const g = new THREE.SphereGeometry(0.5, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2); g.translate(0, -0.25, 0); return g; }

    function clBevBox(THREE, sx, sy, sz, r) {   /* caixa de quina chanfrada (duas facetas por quina): a luz pega nas bordas e a peça deixa de parecer de computador */

        const g = new THREE.BoxGeometry(1, 1, 1, 3, 3, 3), p = g.attributes.position, nr = g.attributes.normal, hx = sx / 2, hy = sy / 2, hz = sz / 2, v = new THREE.Vector3(), c = new THREE.Vector3(), n = new THREE.Vector3();

        const mp = (u, h) => Math.abs(u) > 0.4 ? Math.sign(u) * h : Math.sign(u) * (h - r), cl = (x, h) => Math.max(-(h - r), Math.min(h - r, x));

        for (let i = 0; i < p.count; i++) { v.set(mp(p.getX(i), hx), mp(p.getY(i), hy), mp(p.getZ(i), hz)); c.set(cl(v.x, hx), cl(v.y, hy), cl(v.z, hz)); n.subVectors(v, c); if (n.lengthSq() > 1e-10) { n.normalize(); v.copy(c).addScaledVector(n, r); } else n.set(nr.getX(i), nr.getY(i), nr.getZ(i)); p.setXYZ(i, v.x, v.y, v.z); nr.setXYZ(i, n.x, n.y, n.z); }

        return g;

    }

    function clMinaAddons(L) { return []; }

    function clMinaParts(t, L) { return t ? t.parts : []; }

    function clMinaAddonsGeo(cv, ix, s, mtx, lv) {}

    function clUpgradedParts(id, t, L) {

        if (L <= 1 || !t || !t.parts) return t ? t.parts : [];

        if (id === 'mina') return clMinaParts(t, L);

        const parts = t.parts.map(pt => ({ k: pt.k, s: pt.s.slice(), p: pt.p.slice(), c: pt.c, g: pt.g, r: pt.r ? pt.r.slice() : null, an: pt.an, gl: pt.gl, tr: pt.tr, sm: pt.sm, pr: pt.pr, al: pt.al }));

        const add = (k, s, p, c, g, an, tr, sm, r) => parts.push({ k, s, p, c, g: !!g, r: r || null, an: an || '', tr: tr || null, sm: sm || 0 });

        if (id === 'fazenda') {

            add('c', [0.45, 1.2 + 0.25 * L, 0.45], [0.85, 0.1, -0.45], '#e0c896', 0, '', null, 1);

            add('k', [0.55, 0.45, 0.55], [0.85, 1.3 + 0.25 * L, -0.45], '#9c3a30', 0);

            add('d', [0.75, 0.48, 0.75], [-0.75, 0.1, -0.4], '#8affaa', 1, 'p', null, 1);

            add('t', [0.85, 0.85, 0.85], [-0.75, 0.3, -0.4], 'T', 1, 'r', 0.05);

            if (L >= 3) {

                add('c', [0.08, 0.85, 0.08], [0, 1.15, 0], '#5c6574', 0);

                add('s', [0.16, 0.16, 0.16], [0, 2.0, 0], 'U', 1, 'p');

                add('b', [0.75, 0.08, 0.04], [0, 2.0, 0], '#ffffff', 0, [0, 0, 0.7], 'r');

            }

        } else if (id === 'casa') {
            // Nível 2+: Mansarda charmosa de sótão no telhado, lanterna acolhedora na entrada e floreiras
            add('b', [0.42, 0.36, 0.36], [-0.3, 1.28, 0.28], 'U');
            add('b', [0.48, 0.05, 0.42], [-0.3, 1.64, 0.28], '#3a2f2a');
            add('p', [0.65, 0.26, 0.58], [-0.3, 1.69, 0.28], 'T');
            add('b', [0.22, 0.22, 0.04], [-0.3, 1.34, 0.46], '#ffe9a8', 1, 'n');
            add('b', [0.03, 0.12, 0.08], [0.16, 0.55, 0.58], '#2a221b');
            add('s', [0.1, 0.12, 0.1], [0.16, 0.52, 0.64], '#ffd27a', 1, 'p');
            add('b', [0.42, 0.1, 0.2], [-0.62, 0.14, 0.62], '#6b4a30');
            add('s', [0.1, 0.1, 0.1], [-0.7, 0.24, 0.62], '#ff6b5e', 0, 's');
            add('s', [0.1, 0.1, 0.1], [-0.54, 0.24, 0.62], '#ffd27a', 0, 's');

            if (L >= 3) {
                // Nível 3+: Alpendre de entrada em madeira com micro-luzes douradas, segunda mansarda e chaminé refinada
                add('c', [0.06, 0.76, 0.06], [-0.38, 0.14, 0.82], '#6b4a30');
                add('c', [0.06, 0.76, 0.06], [0.18, 0.14, 0.82], '#6b4a30');
                add('b', [0.74, 0.05, 0.38], [-0.1, 0.9, 0.72], '#3a2f2a');
                add('p', [0.98, 0.22, 0.52], [-0.1, 0.95, 0.72], 'T');
                add('s', [0.06, 0.06, 0.06], [-0.3, 0.87, 0.86], '#ffd27a', 1, 'p');
                add('s', [0.06, 0.06, 0.06], [-0.1, 0.87, 0.86], '#ffd27a', 1, 'p');
                add('s', [0.06, 0.06, 0.06], [0.1, 0.87, 0.86], '#ffd27a', 1, 'p');
                add('b', [0.42, 0.36, 0.36], [0.25, 1.28, -0.48], 'U');
                add('b', [0.48, 0.05, 0.42], [0.25, 1.64, -0.48], '#3a2f2a');
                add('p', [0.65, 0.26, 0.58], [0.25, 1.69, -0.48], 'T');
                add('b', [0.22, 0.22, 0.04], [0.25, 1.34, -0.66], '#ffe9a8', 1, 'n');
                add('c', [0.12, 0.18, 0.12], [0.45, 1.86, -0.3], '#7a4a35');
            }
        } else if (id === 'cabana') {
            // Nível 2+: Alpendre rústico, lanterna e pilha de lenha cortada
            add('b', [0.32, 0.03, 0.16], [0.1, 0.47, 0.38], '#3a2f2a');
            add('p', [0.44, 0.1, 0.22], [0.1, 0.5, 0.38], 'T');
            add('b', [0.02, 0.06, 0.05], [-0.04, 0.38, 0.34], '#2a221b');
            add('s', [0.06, 0.08, 0.06], [-0.04, 0.34, 0.38], '#ffd27a', 1, 'p');
            add('c', [0.07, 0.26, 0.07], [-0.38, 0.14, -0.05], '#7a5030', 0, '', null, 0, [0, 0, 1.57]);
            add('c', [0.07, 0.26, 0.07], [-0.38, 0.21, -0.05], '#8a5a3a', 0, '', null, 0, [0, 0, 1.57]);

            if (L >= 3) {
                // Nível 3+: Mansarda no telhado, canteiro com arbusto e terminação de chaminé
                add('b', [0.24, 0.2, 0.2], [-0.15, 0.75, 0.14], 'U');
                add('p', [0.36, 0.14, 0.28], [-0.15, 0.95, 0.14], 'T');
                add('b', [0.14, 0.13, 0.03], [-0.15, 0.78, 0.24], '#ffe9a8', 1, 'n');
                add('s', [0.16, 0.14, 0.16], [-0.38, 0.14, -0.25], '#4fa35b', 0, 's');
                add('s', [0.07, 0.07, 0.07], [-0.38, 0.23, -0.25], '#ffd27a', 0, 's');
                add('c', [0.08, 0.12, 0.08], [-0.2, 1.0, -0.1], '#5a4538');
            }
        } else if (id === 'chale') {
            // Nível 2+: Chaminé alpina de pedra e jardineiras floridas sob as janelas
            add('b', [0.22, 0.65, 0.22], [0.55, 0.88, -0.15], '#6b7284');
            add('b', [0.28, 0.06, 0.28], [0.55, 1.25, -0.15], '#3a3430');
            add('b', [0.32, 0.06, 0.1], [-0.5, 0.32, 0.45], '#6b4a30');
            add('s', [0.09, 0.09, 0.09], [-0.5, 0.39, 0.45], '#ff6b5e', 0, 's');
            add('b', [0.32, 0.06, 0.1], [0.5, 0.32, 0.45], '#6b4a30');
            add('s', [0.09, 0.09, 0.09], [0.5, 0.39, 0.45], '#ffd27a', 0, 's');

            if (L >= 3) {
                // Nível 3+: Mansarda central de chalé e lanterna de entrada
                add('b', [0.38, 0.32, 0.32], [0, 0.98, 0.22], 'T');
                add('p', [0.55, 0.22, 0.44], [0, 1.3, 0.22], 'U');
                add('b', [0.22, 0.2, 0.03], [0, 1.04, 0.38], '#ffe9a8', 1, 'n');
                add('s', [0.08, 0.1, 0.08], [0.18, 0.52, 0.45], '#ffd27a', 1, 'p');
            }
        } else if (id === 'sobrado') {
            // Nível 2+: Guarda-corpo na varanda do segundo andar e lanternas coloniais
            add('b', [0.54, 0.18, 0.04], [0, 1.14, 0.97], '#2a201a');
            add('b', [0.04, 0.18, 0.3], [-0.27, 1.14, 0.82], '#2a201a');
            add('b', [0.04, 0.18, 0.3], [0.27, 1.14, 0.82], '#2a201a');
            add('s', [0.08, 0.11, 0.08], [-0.25, 0.72, 0.72], '#ffd27a', 1, 'p');
            add('s', [0.08, 0.11, 0.08], [0.25, 0.72, 0.72], '#ffd27a', 1, 'p');

            if (L >= 3) {
                // Nível 3+: Mansardas duplas coloniais e chaminé de tijolos
                add('b', [0.36, 0.32, 0.34], [-0.4, 2.28, 0.36], 'T');
                add('p', [0.52, 0.22, 0.48], [-0.4, 2.6, 0.36], 'U');
                add('b', [0.2, 0.2, 0.04], [-0.4, 2.34, 0.54], '#ffe9a8', 1, 'n');
                add('b', [0.36, 0.32, 0.34], [0.4, 2.28, 0.36], 'T');
                add('p', [0.52, 0.22, 0.48], [0.4, 2.6, 0.36], 'U');
                add('b', [0.2, 0.2, 0.04], [0.4, 2.34, 0.54], '#ffe9a8', 1, 'n');
                add('b', [0.24, 0.7, 0.24], [0.55, 2.3, -0.3], '#7a5a48');
                add('b', [0.3, 0.06, 0.3], [0.55, 2.68, -0.3], '#3a2a22');
            }
        } else if (t.cat === 'casa') {
            // Outras moradias (torres, lofts, domos): terraço verde e luzes arquitetônicas douradas
            let topY = 0;
            t.parts.forEach(pt => { topY = Math.max(topY, (pt.p[1] || 0) + (pt.s[1] || 0)); });
            add('b', [0.6, 0.1, 0.6], [0, topY + 0.02, 0], '#3a4a38');
            add('s', [0.32, 0.2, 0.32], [0, topY + 0.12, 0], '#4fa35b', 0, 's');
            add('s', [0.08, 0.08, 0.08], [0.42, topY + 0.06, 0.42], '#ffd27a', 1, 'p');
            add('s', [0.08, 0.08, 0.08], [-0.42, topY + 0.06, -0.42], '#ffd27a', 1, 'p');
            if (L >= 3) {
                add('d', [0.65, 0.38, 0.65], [0, topY + 0.16, 0], '#c4f4ff', 1, 'p', null, 1);
            }

        } else if (id === 'forja') {

            add('c', [0.38, 1.5 + 0.35 * L, 0.38], [0.45, 0.2, 0.45], '#2c3340', 0, '', null, 1);

            add('t', [0.55, 0.55, 0.55], [0.45, 1.15, 0.45], '#ff6a00', 1, 'p', 0.06);

            add('t', [0.5, 0.5, 0.5], [0.45, 1.6 + 0.25 * (L - 2), 0.45], '#ff9a3c', 1, 'w', 0.05);

            if (L >= 3) add('t', [1.2, 1.2, 1.2], [0, 0.8, 0], 'U', 1, 'r', 0.04);

        } else if (id === 'bateria') {

            add('c', [0.22, 1.3 + 0.25 * L, 0.22], [0, 0.2, -0.3], 'TE', 1, 'p', null, 1);

            add('c', [0.22, 1.3 + 0.25 * L, 0.22], [0, 0.2, 0.3], 'TE', 1, 'p', null, 1);

            add('t', [0.4, 0.4, 0.4], [0, 0.8, -0.3], 'U', 1, 'w', 0.04);

            add('t', [0.4, 0.4, 0.4], [0, 0.8, 0.3], 'U', 1, 'w', 0.04);

            if (L >= 3) add('s', [0.24, 0.24, 0.24], [0, 1.6 + 0.25 * L, 0], '#ffffff', 1, 'f');

        } else if (id === 'usina') {

            add('k', [0.4, 1.2 + 0.25 * L, 0.4], [0, 1.7, 0], 'T', 1, 'b');

            add('t', [1.6, 1.6, 1.6], [0, 1.45, 0], 'U', 1, 'r', 0.05);

            if (L >= 3) add('t', [2.2, 2.2, 2.2], [0, 2.05, 0], 'T', 1, 'R', 0.04);

        } else if (id === 'lab') {

            add('d', [0.9, 0.55, 0.9], [0, 1.05, 0], '#9ee3ff', 1, 'p', null, 1);

            add('t', [1.1, 1.1, 1.1], [0, 1.05, 0], 'T', 1, 'w', 0.04);

            if (L >= 3) {

                add('c', [0.06, 0.55, 0.06], [0.45, 1.45, 0.45], '#cfd6e2', 0);

                add('t', [0.42, 0.42, 0.42], [0.45, 2.0, 0.45], 'U', 1, 'r', 0.08);

            }

        } else {

            add('s', [0.22, 0.22, 0.22], [0, 1.1 + 0.15 * L, 0], 'T', 1, 'p');

            add('t', [0.48, 0.48, 0.48], [0, 1.05 + 0.15 * L, 0], 'U', 1, 'r', 0.03);

        }

        return parts;

    }

    function clBuildGeo(t, cv, parts) {

        const THREE = clTh(), tin = clTints(t, cv), mk0 = () => ({ p: [], n: [], c: [], a: [], ct: [], rm: [], kd: [] }), B = [mk0(), mk0(), mk0()], col = new THREE.Color(), m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), sv = new THREE.Vector3(), pv = new THREE.Vector3(), AN = { s: 1, b: 2, p: 3, n: 4, r: 5, R: 6, f: 7, w: 8 };

        const list = parts || t.parts || []; let top = 0; list.forEach(pt => top = Math.max(top, pt.p[1] + pt.s[1])); let seed = 7; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };

        list.forEach(pt => {

            const bev = pt.k === 'b' && Math.min(pt.s[0], pt.s[1], pt.s[2]) >= 0.08; let g = pt.k === 't' ? clTorusGeo(THREE, pt.tr || 0.1) : pt.k === 'l' ? clLatheGeo(THREE, pt.pr) : pt.k === 'd' ? clDomeGeo(THREE) : bev ? clBevBox(THREE, pt.s[0], pt.s[1], pt.s[2], Math.min(0.055, 0.28 * Math.min(pt.s[0], pt.s[1], pt.s[2]))) : pt.k === 'b' ? new THREE.BoxGeometry(1, 1, 1) : pt.k === 'c' ? new THREE.CylinderGeometry(0.5, 0.5, 1, 18) : pt.k === 'k' ? new THREE.ConeGeometry(0.5, 1, 14) : pt.k === 's' ? new THREE.SphereGeometry(0.5, 16, 12) : new THREE.ConeGeometry(0.5, 1, 4);

            if (pt.k === 'p') g.rotateY(Math.PI / 4); g = g.toNonIndexed(); const smooth = !!pt.sm || pt.k === 't' || pt.k === 'l' || pt.k === 'd'; if (!smooth) g.computeVertexNormals(); if (pt.r) q.setFromEuler(e.set(pt.r[0], pt.r[1], pt.r[2])); else q.identity();

            m.compose(pv.set(pt.p[0], pt.p[1] + pt.s[1] / 2, pt.p[2]), q, bev || pt.k === 'l' ? sv.set(1, 1, 1) : pt.k === 't' ? sv.set(pt.s[0], pt.s[0], pt.s[0]) : pt.k === 'd' ? sv.set(pt.s[0], pt.s[1] * 2, pt.s[2]) : sv.set(pt.s[0], pt.s[1], pt.s[2])); g.applyMatrix4(m);

            const hex = pt.c === 'T' ? tin[0] : pt.c === 'U' ? tin[1] : pt.c, b = B[pt.gl ? 2 : pt.g ? 1 : 0], P = g.attributes.position.array, N = g.attributes.normal.array, an = pt.an ? AN[pt.an] || 0 : 0; col.set(hex); if (!pt.g) { const hs = {}; col.getHSL(hs); col.setHSL(hs.h, Math.min(1, hs.s * 1.16 + (hs.s > 0.12 ? 0.03 : 0)), hs.l); } const rmv = clRM(col, pt);

            for (let i = 0; i < P.length; i += 9) {   // por face: uma variação de brilho própria (dá a aparência de peça modelada à mão) e luz de cima

                const jit = pt.g || smooth ? 1 : 0.94 + rnd() * 0.12;

                for (let v = 0; v < 3; v++) { const o = i + v * 3, up = Math.max(0, N[o + 1]); b.p.push(P[o], P[o + 1], P[o + 2]); b.n.push(N[o], N[o + 1], N[o + 2]); const ao = pt.g || pt.r ? 1 : 0.62 + 0.38 * Math.min(1, Math.max(0, P[o + 1] - pt.p[1]) / Math.max(0.12, Math.min(pt.s[1], 0.5))), k = pt.g ? 1 : (0.78 + 0.22 * Math.min(1, Math.max(0, P[o + 1]) / Math.max(0.6, top))) * jit * ao * (1 + 0.1 * up); b.c.push(col.r * k, col.g * k, col.b * k); b.a.push(an, pt.s[1]); b.rm.push(rmv[0], rmv[1], rmv[2]); b.kd.push(pt.al ? 6 : pt.k === 'b' ? 1 : pt.k === 'c' ? 2 : pt.k === 'k' ? 3 : pt.k === 's' ? 4 : 5); b.ct.push(pt.p[0], pt.p[1], pt.p[2]); }

            }

            g.dispose();

        });

        const mk = b => { if (!b.p.length) return null; const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(b.p, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(b.n, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(b.c, 3)); g.setAttribute('aA', new THREE.Float32BufferAttribute(b.a, 2)); g.setAttribute('aCt', new THREE.Float32BufferAttribute(b.ct, 3)); g.setAttribute('aRM', new THREE.Float32BufferAttribute(b.rm, 3)); g.setAttribute('aK', new THREE.Float32BufferAttribute(b.kd, 1)); g.computeBoundingSphere(); return g; };

        return { solid: mk(B[0]), glow: mk(B[1]), glass: mk(B[2]) };

    }

    function clGeoFor(id, cv, lv) { const L = Math.max(1, (lv | 0) || 1), k = id + ':' + (cv | 0) + ':' + L, t = CLT[id]; return CL3.geo[k] || (CL3.geo[k] = clBuildGeo(t, cv | 0, L > 1 ? clUpgradedParts(id, t, L) : null)); }

    function clMatrixFor(p, out) {   // posição, giro de 90° e a escala visual da peça (as pequenas ficam maiores que a casa)

        const THREE = clTh(), t = CLT[p[0]], f = clFp(t, p[3]), k = t.vs || 1, T0 = CL3.tmp || (CL3.tmp = { q: new THREE.Quaternion(), p: new THREE.Vector3(), s: new THREE.Vector3(), y: new THREE.Vector3(0, 1, 0) });

        T0.q.setFromAxisAngle(T0.y, -(p[3] & 3) * Math.PI / 2); out.compose(T0.p.set(p[1] + f[0] / 2, 0, p[2] + f[1] / 2), T0.q, T0.s.set(k, k, k)); return out;

    }

    function clRebuildInst() {

        const THREE = clTh(), s = clS(), mtx = new THREE.Matrix4(), groups = {}; CL3.inst.forEach(m => { CL3.grp.remove(m); }); CL3.inst = []; clModelBegin(); clNucCheck(s); clLampBuild(s); CL3.lampSlots = [];

        const skip = CL.hold && CL.hold.idx >= 0 ? CL.hold.idx : -1;

        s.pcs.forEach((p, i) => { if (i === skip || !CLT[p[0]] || !CLT[p[0]].parts) return; const lv = Math.max(1, (p[4] || 1)); (groups[p[0] + ':' + (p[5] | 0) + ':' + lv] = groups[p[0] + ':' + (p[5] | 0) + ':' + lv] || []).push(i); });

        Object.keys(groups).forEach(k => {

            const ix = groups[k], at = k.split(':'); if (clModelUse(at[0], +at[1], ix, s, mtx, +at[2])) return; const g = clGeoFor(at[0], +at[1], +at[2]), isLamp = !!CLT[at[0]].lamp;

            [[g.solid, CL3.mS], [g.glow, isLamp ? CL3.mGL : CL3.mG], [g.glass, CL3.mGl]].forEach(([geo, mat]) => {

                if (!geo) return; if (mat === CL3.mGL) { if (!geo.attributes.aLit) geo.setAttribute('aLit', new THREE.InstancedBufferAttribute(new Float32Array(256).fill(1), 1)); ix.forEach((pi, j) => { const l = CL3.lamps.find(z => z.pi === pi); if (l && j < 256) CL3.lampSlots.push({ arr: geo.attributes.aLit.array, attr: geo.attributes.aLit, j, lamp: l }); }); } const im = new THREE.InstancedMesh(geo, mat, ix.length); ix.forEach((pi, j) => { clMatrixFor(s.pcs[pi], mtx); im.setMatrixAt(j, mtx); clPmap(pi).ims.push({ im, j, m: mtx.clone() }); }); im.instanceMatrix.needsUpdate = true; im.frustumCulled = false;

                im.castShadow = mat === CL3.mS; im.receiveShadow = mat === CL3.mS; if (mat === CL3.mGl) im.renderOrder = 3; CL3.grp.add(im); CL3.inst.push(im);

            });

        });

        { const sp = [], sMt = new THREE.Matrix4(), sQ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2), sP = new THREE.Vector3(), sS = new THREE.Vector3();

          s.pcs.forEach((p, i) => { const t = CLT[p[0]]; if (i === skip || !t || !t.parts) return; let hh = 0; t.parts.forEach(pt => { if (!pt.g) hh = Math.max(hh, pt.p[1] + pt.s[1]); }); if (p[0] === 'mina' || p[0] === 'fazenda' || p[0] === 'forja' || p[0] === 'armazem' || p[0] === 'moinho' || p[0] === 'cabana' || p[0] === 'casa' || p[0] === 'biblioteca' || p[0] === 'silo') hh = Math.max(hh, 1.15 + ((p[4] || 1) - 1) * 0.16); if (hh < 0.35) return; const f = clFp(t, p[3]), k = Math.max(1, t.vs || 1); sp.push([p[1] + f[0] / 2, p[2] + f[1] / 2, f[0] * k + 0.9, f[1] * k + 0.9, Math.min(1, 0.55 + hh * 0.1)]); });

          if (sp.length) { if (!CL3.shTex) { const cv = document.createElement('canvas'); cv.width = cv.height = 64; const cx = cv.getContext('2d'), id = cx.createImageData(64, 64); for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) { const u = (x + 0.5) / 32 - 1, w = (y + 0.5) / 32 - 1, d = Math.hypot(Math.max(Math.abs(u) - 0.5, 0), Math.max(Math.abs(w) - 0.5, 0)), a = 1 - Math.min(1, Math.max(0, d / 0.5)), o = (y * 64 + x) * 4; id.data[o] = id.data[o + 1] = id.data[o + 2] = 0; id.data[o + 3] = Math.round(255 * a * a * (3 - 2 * a)); } cx.putImageData(id, 0, 0); CL3.shTex = new THREE.CanvasTexture(cv); CL3.shMat = new THREE.MeshBasicMaterial({ map: CL3.shTex, color: 0x0a0c1c, transparent: true, opacity: 0.42, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }); CL3.shGeo = new THREE.PlaneGeometry(1, 1); }

            const sm = new THREE.InstancedMesh(CL3.shGeo, CL3.shMat, sp.length); sp.forEach((a, n) => { sMt.compose(sP.set(a[0], 0.012, a[1]), sQ, sS.set(a[2], a[3], 1)); sm.setMatrixAt(n, sMt); }); sm.instanceMatrix.needsUpdate = true; sm.frustumCulled = false; sm.renderOrder = 1; CL3.grp.add(sm); CL3.inst.push(sm); } }

        CL3.smSrc = []; const anch = {};   // de onde sai fumaça e onde ficam as bolhas de coleta

        s.pcs.forEach(p => {

            const t = CLT[p[0]]; if (!t) return; const f = clFp(t, p[3]), k = t.vs || 1, a = -(p[3] & 3) * Math.PI / 2, ca = Math.cos(a), sa = Math.sin(a), cx = p[1] + f[0] / 2, cz = p[2] + f[1] / 2;

            (t.smoke || []).forEach(q => { const lx = q[0] * k, lz = q[2] * k; CL3.smSrc.push([cx + lx * ca + lz * sa, q[1] * k, cz - lx * sa + lz * ca]); });

            if (t.prod) Object.keys(t.prod).forEach(r => { const w = t.prod[r] * (p[4] || 1); if (!anch[r] || w > anch[r].w) anch[r] = { w, x: cx, y: 2.5 * k, z: cz }; });

        }); CL3.bub = anch; clSpotsBuild(s); CL3.pboxDirty = true;

        CL3.need = false;

    }

    /* ---------- fumaça das chaminés (só enquanto a colônia trabalha) ---------- */

    function clSmokeInit() {

        const THREE = clTh(), N = 420, g0 = new THREE.BufferGeometry(), pos = new Float32Array(N * 3).fill(-999), age = new Float32Array(N).fill(1), sz = new Float32Array(N);

        g0.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g0.setAttribute('aAge', new THREE.BufferAttribute(age, 1)); g0.setAttribute('aSz', new THREE.BufferAttribute(sz, 1));

        const mat = new THREE.ShaderMaterial({ uniforms: { uPx: { value: 600 }, uLin: CL3.uLin || (CL3.uLin = { value: 0 }) }, transparent: true, depthWrite: false, vertexShader: 'attribute float aAge;attribute float aSz;uniform float uPx;varying float vA;void main(){vA=aAge;vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=aSz*(.5+aAge*1.4)*uPx/max(.1,-mv.z);gl_Position=projectionMatrix*mv;}', fragmentShader: 'uniform float uLin;varying float vA;void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,.05,d)*(1.-vA)*.4*step(vA,.999);vec3 c=mix(vec3(.92,.92,.95),vec3(.5,.52,.6),vA);' + '' + 'gl_FragColor=vec4(uLin>.5?pow(c,vec3(2.2)):c,a);}' });

        const pts = new THREE.Points(g0, mat); pts.frustumCulled = false; CL3.sc.add(pts); CL3.smoke = { g: g0, pos, age, sz, vel: new Float32Array(N * 3), life: new Float32Array(N).fill(1), n: N, i: 0, acc: 0, mat };

    }

    function clSmokeStep(dt) {

        const S = CL3.smoke; if (!S) return; const on = clS().charge > 1 && CL3.smSrc.length; S.mat.uniforms.uPx.value = CL3.h * (CL3.r ? CL3.r.getPixelRatio() : 1) * 1.3;

        if (on) { S.acc += dt * 2.6 * Math.min(CL3.smSrc.length, 8); while (S.acc >= 1) { S.acc -= 1; const sc = CL3.smSrc[(Math.random() * CL3.smSrc.length) | 0], j = S.i = (S.i + 1) % S.n; S.pos[j * 3] = sc[0] + (Math.random() - 0.5) * 0.08; S.pos[j * 3 + 1] = sc[1]; S.pos[j * 3 + 2] = sc[2] + (Math.random() - 0.5) * 0.08; S.vel[j * 3] = 0.16 + Math.random() * 0.12; S.vel[j * 3 + 1] = 0.5 + Math.random() * 0.25; S.vel[j * 3 + 2] = (Math.random() - 0.5) * 0.08; S.age[j] = 0; S.life[j] = 2.4 + Math.random() * 1.3; S.sz[j] = 0.5 + Math.random() * 0.25; } } else S.acc = 0;

        for (let j = 0; j < S.n; j++) { if (S.age[j] >= 1) continue; S.age[j] += dt / S.life[j]; if (S.age[j] >= 1) { S.age[j] = 1; S.pos[j * 3 + 1] = -999; continue; } S.pos[j * 3] += S.vel[j * 3] * dt; S.pos[j * 3 + 1] += S.vel[j * 3 + 1] * dt; S.pos[j * 3 + 2] += S.vel[j * 3 + 2] * dt; S.vel[j * 3] += dt * 0.05; }

        S.g.attributes.position.needsUpdate = true; S.g.attributes.aAge.needsUpdate = true; S.g.attributes.aSz.needsUpdate = true;

    }

    /* ---------- Halloween: lua cheia, névoa, morcegos e um bosque de abóboras em volta do terreno ---------- */

    function clHwInst(id, list) {   // list: [x, z, giro, escala, y]

        const THREE = clTh(), g = clGeoFor(id, 0), mt = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), sc = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);

        [[g.solid, CL3.mS], [g.glow, CL3.mG]].forEach(([geo, mat]) => {

            if (!geo || !list.length) return; const im = new THREE.InstancedMesh(geo, mat, list.length);

            list.forEach((a, j) => { q.setFromAxisAngle(up, a[2]); mt.compose(p.set(a[0], a[4] == null ? -0.6 : a[4], a[1]), q, sc.setScalar(a[3])); im.setMatrixAt(j, mt); }); im.instanceMatrix.needsUpdate = true; im.frustumCulled = false; CL3.sc.add(im); CL3.hwMeshes.push(im);

        });

    }

    function clHwBuild() {

        const THREE = clTh(), s = clS(), H = s.H, sc = CL3.sc, hs = (i, j) => clHash(s.seed | 0, i, j, 77); CL3.hwMeshes = [];

        /* lua */

        const moon = new THREE.Mesh(new THREE.SphereGeometry(58, 32, 20), new THREE.MeshBasicMaterial({ color: 0xffe3b0, fog: false })); moon.position.set(-340, 200, -540); sc.add(moon);

        { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 8, 64, 64, 64); g.addColorStop(0, 'rgba(255,200,120,0.85)'); g.addColorStop(0.35, 'rgba(255,150,60,0.28)'); g.addColorStop(1, 'rgba(255,120,40,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128);

          const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending })); halo.scale.set(520, 520, 1); halo.position.copy(moon.position); sc.add(halo);

          /* névoa baixa */

          const m2 = document.createElement('canvas'); m2.width = m2.height = 128; const y = m2.getContext('2d'), g2 = y.createRadialGradient(64, 64, 4, 64, 64, 64); g2.addColorStop(0, 'rgba(255,255,255,0.8)'); g2.addColorStop(1, 'rgba(255,255,255,0)'); y.fillStyle = g2; y.fillRect(0, 0, 128, 128); const mt = new THREE.CanvasTexture(m2);

          CL3.hwMist = []; void mt;   /* lista vazia (e não null): é ela que mantém o movimento dos morcegos ligado */   /* a névoa colorida flutuando sobre o terreno saiu: com a luz nova ela virava manchas de luz estranhas */ }

        /* morcegos: corpo peludo, cabeça com orelhas, asas com ossos dos dedos e membrana recortada, olhos brilhando; as asas batem no shader */

        { const g = clBatGeo(THREE), N = 7; CL3.hwBats = []; CL3.hwBatM = [];

          [[g.body, CL3.hwBatMat || (CL3.hwBatMat = clBatMat(THREE))], [g.eyes, CL3.mG]].forEach(([geo, mat]) => { const im = new THREE.InstancedMesh(geo, mat, N); im.frustumCulled = false; sc.add(im); CL3.hwBatM.push(im); });

          for (let i = 0; i < N; i++) CL3.hwBats.push({ cx: (hs(i, 11) - 0.5) * H * 0.9, cz: (hs(i, 12) - 0.5) * H * 0.9, r: 7 + hs(i, 13) * 26, h: 5 + hs(i, 14) * 11, w: (0.25 + hs(i, 15) * 0.5) * (i % 2 ? 1 : -1), ph: hs(i, 16) * 6.28, k: 1.3 + hs(i, 17) * 0.8 }); }

        /* o bosque solto na água saiu: agora há ilhotas de rocha (clWaterBuild) onde as abóboras e velas ficam apoiadas */

    }

    function clBatGeo(THREE) {

        const P = [], C = [], W = [], c = new THREE.Color(), V = (x, y, z) => new THREE.Vector3(x, y, z);

        const tri = (a, b, d, hex) => { c.set(hex); [a, b, d].forEach(v => { P.push(v.x, v.y, v.z); C.push(c.r, c.g, c.b); W.push(Math.abs(v.x)); }); };

        const addG = (geo, m, hex, wf) => { const g = geo.index ? geo.toNonIndexed() : geo; g.applyMatrix4(m); const p = g.attributes.position; c.set(hex); for (let i = 0; i < p.count; i++) { P.push(p.getX(i), p.getY(i), p.getZ(i)); C.push(c.r, c.g, c.b); W.push(wf ? Math.abs(p.getX(i)) : 0); } };

        const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), UP = V(0, 1, 0);

        const ell = (x, y, z, sx, sy, sz, hex) => { M.compose(V(x, y, z), Q.identity(), V(sx, sy, sz)); addG(new THREE.SphereGeometry(1, 10, 8), M, hex); };

        const tube = (a, b, r, hex, wf) => { const d = b.clone().sub(a), l = d.length(); Q.setFromUnitVectors(UP, d.normalize()); M.compose(a.clone().add(b).multiplyScalar(0.5), Q, V(1, 1, 1)); addG(new THREE.CylinderGeometry(r * 0.7, r, l, 5, 1), M, hex, wf); };

        const FUR = 0x1a1120, FUR2 = 0x241829, MEM = 0x2a1c36, BONE = 0x120a18;

        ell(0, 0, -0.03, 0.105, 0.095, 0.2, FUR); ell(0, 0.015, 0.2, 0.082, 0.078, 0.088, FUR2); ell(0, -0.012, 0.28, 0.038, 0.032, 0.05, BONE);

        [-1, 1].forEach(s => { Q.setFromEuler(new THREE.Euler(0.18, 0, -s * 0.22)); M.compose(V(s * 0.05, 0.115, 0.2), Q, V(1, 1, 1)); addG(new THREE.ConeGeometry(0.036, 0.15, 5, 1), M, FUR); tube(V(s * 0.04, -0.07, -0.15), V(s * 0.06, -0.15, -0.22), 0.014, BONE); });

        tri(V(-0.11, 0, -0.2), V(0.11, 0, -0.2), V(0, 0, -0.44), MEM); tri(V(0.11, 0, -0.2), V(-0.11, 0, -0.2), V(0, 0, -0.44), MEM);   /* membrana da cauda */

        const S = V(0.08, 0.02, 0.07), E = V(0.36, 0.07, 0.09), Wr = V(0.58, 0.1, 0.13), F = [V(1.0, -0.02, 0.0), V(0.9, -0.03, -0.22), V(0.72, -0.03, -0.38), V(0.48, -0.02, -0.44)], B = V(0.1, 0, -0.28);

        const sc = (a, b) => a.clone().add(b).multiplyScalar(0.5).lerp(Wr, 0.3).add(V(0, 0.01, 0));   /* o recorte da borda da asa entre um dedo e o outro */

        const wing = [[S, E, Wr], [S, Wr, B], [Wr, F[3], B]]; for (let i = 0; i < 3; i++) { const m = sc(F[i], F[i + 1]); wing.push([Wr, F[i], m], [Wr, m, F[i + 1]]); }

        wing.forEach(t => { tri(t[0], t[1], t[2], MEM); tri(t[2].clone().setX(-t[2].x), t[1].clone().setX(-t[1].x), t[0].clone().setX(-t[0].x), MEM); });

        [1, -1].forEach(s => { const X = v => V(v.x * s, v.y, v.z); tube(X(S), X(E), 0.02, BONE, 1); tube(X(E), X(Wr), 0.016, BONE, 1); F.forEach(f => tube(X(Wr), X(f), 0.0085, BONE, 1)); tube(X(Wr), X(V(0.66, 0.12, 0.26)), 0.011, BONE, 1); });

        for (let i = 0; i < P.length; i += 3) { P[i] *= 0.78; P[i + 1] *= 0.78; P[i + 2] *= 0.78; }

        const body = new THREE.BufferGeometry(); body.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); body.setAttribute('color', new THREE.Float32BufferAttribute(C, 3)); body.setAttribute('aW', new THREE.Float32BufferAttribute(W.map(w => w * 0.78), 1)); body.computeVertexNormals();

        const E2 = [], EC = [], eg = new THREE.SphereGeometry(0.02, 6, 5).toNonIndexed(); [-1, 1].forEach(s => { const p = eg.attributes.position; for (let i = 0; i < p.count; i++) { E2.push((p.getX(i) + s * 0.034) * 0.78, (p.getY(i) + 0.035) * 0.78, (p.getZ(i) + 0.255) * 0.78); EC.push(1.0, 0.22, 0.12); } });

        const eyes = new THREE.BufferGeometry(); eyes.setAttribute('position', new THREE.Float32BufferAttribute(E2, 3)); eyes.setAttribute('color', new THREE.Float32BufferAttribute(EC, 3)); return { body, eyes };

    }

    function clBatMat(THREE) {

        const m = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, side: THREE.DoubleSide, roughness: 0.78, metalness: 0, envMapIntensity: 0.25, emissive: 0x120818, emissiveIntensity: 0.4 }); m.color.setScalar(0.55); CL3.hwBt = CL3.hwBt || { value: 0 };

        m.onBeforeCompile = sh => { sh.uniforms.uBT = CL3.hwBt; sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute float aW;uniform float uBT;').replace('#include <begin_vertex>', `#include <begin_vertex>

            float bK = length( instanceMatrix[ 0 ].xyz ), bPh = bK * 91.7;

            if ( aW > 0.001 ) { float ang = sin( uBT * 11. + bPh - aW * 1.6 ) * 0.78 + 0.12; ang *= 1. + 0.55 * smoothstep( 0.4, 0.8, aW ); float sx = transformed.x < 0. ? -1. : 1.; transformed.y += sin( ang ) * aW - aW * aW * 0.05; transformed.x = sx * aW * cos( ang ); transformed.z -= sin( ang ) * aW * 0.1; }

            else { transformed.y += sin( uBT * 11. + bPh ) * -0.025; }`); };

        return m;

    }

    function clHwStep(dt, t) {

        if (CL3.hwBt) CL3.hwBt.value = t;

        if (CL3.hwBats && CL3.hwBatM.length) {

            const THREE = clTh(), q = CL3.hwQ || (CL3.hwQ = { a: new THREE.Quaternion(), b: new THREE.Quaternion(), m: new THREE.Matrix4(), p: new THREE.Vector3(), s: new THREE.Vector3(), y: new THREE.Vector3(0, 1, 0), z: new THREE.Vector3(0, 0, 1) });

            CL3.hwBats.forEach((b, i) => { const a = b.ph + t * b.w, x = b.cx + Math.cos(a) * b.r, z = b.cz + Math.sin(a) * b.r, y = b.h + Math.sin(a * 2 + b.ph) * 1.4, hd = Math.atan2(-Math.sin(a) * b.w, Math.cos(a) * b.w); q.a.setFromAxisAngle(q.y, hd); q.b.setFromAxisAngle(q.z, (b.w > 0 ? 0.28 : -0.28) + Math.sin(t * 1.3 + b.ph) * 0.08); q.a.multiply(q.b); q.m.compose(q.p.set(x, y, z), q.a, q.s.setScalar(b.k)); CL3.hwBatM.forEach(im => im.setMatrixAt(i, q.m)); });

            CL3.hwBatM.forEach(im => { im.instanceMatrix.needsUpdate = true; });

        }

        if (CL3.hwMist) CL3.hwMist.forEach(sp => { const u = sp.userData.b; sp.position.x = u[0] + Math.sin(t * 0.07 + u[2]) * 7; sp.position.z = u[1] + Math.cos(t * 0.05 + u[2]) * 5; });

    }

    /* ---------- moradores andando pela colônia ---------- */

    const CL_COL_ROLES = ['citizen', 'farmer', 'worker', 'scholar', 'sailor', 'baker', 'guard', 'trainer'];
    window.CL_COL_ROLES = CL_COL_ROLES;

    /* Construtor de NPCs orgânicos esculpidos (LatheGeometry + BufferGeometry com vertex colors em InstancedMesh único CL3.mC para FPS máximo) */
    function clNpcBuildRoleParts(THREE, role) {
        const gc = CLM._npcGeo || (CLM._npcGeo = {});
        const capG = (r, len, rs = 10, cs = 4) => {
            const k = 'c_' + r.toFixed(3) + '_' + len.toFixed(3) + '_' + rs;
            if (gc[k]) return gc[k];
            const hl = Math.max(0.001, len * 0.5), pts = [];
            for (let i = 0; i <= cs; i++) { const a = -Math.PI / 2 + (i / cs) * (Math.PI / 2); pts.push(new THREE.Vector2(Math.cos(a) * r, -hl + Math.sin(a) * r)); }
            for (let i = 0; i <= cs; i++) { const a = (i / cs) * (Math.PI / 2); pts.push(new THREE.Vector2(Math.cos(a) * r, hl + Math.sin(a) * r)); }
            const g = new THREE.LatheGeometry(pts, rs); g.computeVertexNormals(); return (gc[k] = g);
        };
        const tcapG = (rt, rb, len, rs = 10, cs = 4) => {
            const k = 't_' + rt.toFixed(3) + '_' + rb.toFixed(3) + '_' + len.toFixed(3) + '_' + rs;
            if (gc[k]) return gc[k];
            const hl = Math.max(0.002, len * 0.5), pts = [];
            for (let i = 0; i <= cs; i++) { const a = -Math.PI / 2 + (i / cs) * (Math.PI / 2); pts.push(new THREE.Vector2(Math.cos(a) * rb, -hl + Math.sin(a) * rb)); }
            pts.push(new THREE.Vector2((rt + rb) * 0.52, 0));
            for (let i = 0; i <= cs; i++) { const a = (i / cs) * (Math.PI / 2); pts.push(new THREE.Vector2(Math.cos(a) * rt, hl + Math.sin(a) * rt)); }
            const g = new THREE.LatheGeometry(pts, rs); g.computeVertexNormals(); return (gc[k] = g);
        };
        const torsoG = (bType, h = 0.27) => {
            const k = 'tr_' + bType + '_' + h.toFixed(3);
            if (gc[k]) return gc[k];
            const pts = [], st = 10;
            for (let i = 0; i <= st; i++) {
                const t = i / st, y = t * h;
                let r = 0.108;
                if (bType === 'muscular') r = 0.112 - 0.014 * Math.sin(t * Math.PI * 0.65) + 0.036 * Math.pow(t, 1.35);
                else if (bType === 'slender') r = 0.102 - 0.017 * Math.sin(t * Math.PI) + 0.012 * t;
                else if (bType === 'petite') r = 0.098 - 0.013 * Math.sin(t * Math.PI) + 0.010 * t;
                else r = 0.122 + 0.036 * Math.sin(t * Math.PI * 0.92) - 0.011 * t * t;
                if (i === 0) pts.push(new THREE.Vector2(0, 0));
                pts.push(new THREE.Vector2(r, y));
                if (i === st) pts.push(new THREE.Vector2(0, h + 0.012));
            }
            const g = new THREE.LatheGeometry(pts, 14); g.computeVertexNormals(); return (gc[k] = g);
        };
        const headG = (rad = 0.108) => {
            const k = 'hd_' + rad.toFixed(3);
            if (gc[k]) return gc[k];
            const g = new THREE.SphereGeometry(rad, 16, 12), pos = g.attributes.position;
            for (let i = 0; i < pos.count; i++) {
                let x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i), ny = y / rad;
                if (ny < 0) { const jt = 1 - Math.abs(ny) * 0.18; x *= jt; if (z > 0) z *= (1 - Math.abs(ny) * 0.06); }
                else y *= 1.05;
                if (ny > -0.35 && ny < 0.05 && z > 0) { x *= 1.04; z *= 1.03; }
                pos.setXYZ(i, x, y, z);
            }
            g.computeVertexNormals(); return (gc[k] = g);
        };
        const spG = (r, a = 10, b = 8) => { const k = 'sp_' + r.toFixed(3) + '_' + a; return gc[k] || (gc[k] = new THREE.SphereGeometry(r, a, b)); };
        const cyG = (rt, rb, h, s = 10) => { const k = 'cy_' + rt.toFixed(3) + '_' + rb.toFixed(3) + '_' + h.toFixed(3) + '_' + s; return gc[k] || (gc[k] = new THREE.CylinderGeometry(rt, rb, h, s)); };
        const cnG = (r, h, s = 10) => { const k = 'cn_' + r.toFixed(3) + '_' + h.toFixed(3) + '_' + s; return gc[k] || (gc[k] = new THREE.ConeGeometry(r, h, s)); };
        const bxG = (w, h, d) => { const k = 'bx_' + w.toFixed(3) + '_' + h.toFixed(3) + '_' + d.toFixed(3); return gc[k] || (gc[k] = new THREE.BoxGeometry(w, h, d)); };
        const trG = (R, r, a = 6, b = 12) => { const k = 'to_' + R.toFixed(3) + '_' + r.toFixed(3) + '_' + b; return gc[k] || (gc[k] = new THREE.TorusGeometry(R, r, a, b)); };

        const CFG = {
            citizen: { body: 'slender', skin: '#f6cbb0', shirt: '#f8fafc', vest: '#b45309', trim: '#fbbf24', pants: '#3b2f2f', boot: '#451a03', hair: '#4a2c18' },
            farmer:  { body: 'stout',   skin: '#f1be9e', shirt: '#ef4444', vest: '#2563eb', trim: '#fde047', pants: '#1e40af', boot: '#3f6212', hair: '#92400e' },
            worker:  { body: 'muscular',skin: '#eac0a2', shirt: '#dc2626', vest: '#5c3317', trim: '#fbbf24', pants: '#292524', boot: '#1c1917', hair: '#271a12' },
            scholar: { body: 'slender', skin: '#fae0ce', shirt: '#7c3aed', vest: '#4338ca', trim: '#fde047', pants: '#312e81', boot: '#1e1b4b', hair: '#581c87' },
            sailor:  { body: 'stout',   skin: '#e8b38f', shirt: '#f8fafc', vest: '#ea580c', trim: '#fbbf24', pants: '#0f172a', boot: '#eab308', hair: '#1e293b' },
            baker:   { body: 'stout',   skin: '#f9d4be', shirt: '#ffffff', vest: '#f59e0b', trim: '#fde68a', pants: '#4b5563', boot: '#78350f', hair: '#7c2d12' },
            guard:   { body: 'muscular',skin: '#f4cbb2', shirt: '#1d4ed8', vest: '#cbd5e1', trim: '#f59e0b', pants: '#1e3a8a', boot: '#1f2937', hair: '#b91c1c' },
            trainer: { body: 'petite',  skin: '#f2c4a6', shirt: '#059669', vest: '#6d28d9', trim: '#f59e0b', pants: '#374151', boot: '#422006', hair: '#d97706' }
        };
        const P = CFG[role] || CFG.citizen;

        const mkBucket = () => [];
        const B = mkBucket(), LL = mkBucket(), LR = mkBucket(), AL = mkBucket(), AR = mkBucket();
        const push = (arr, geo, hex, x, y, z, rx, ry, rz, sx, sy, sz, rm) => {
            arr.push({ geo, hex, pos: [x || 0, y || 0, z || 0], rot: [rx || 0, ry || 0, rz || 0], sc: [sx || 1, sy || 1, sz || 1], rm: rm || [0.76, 0.04, 0] });
        };

        // 1. Pernas esculpidas no pivô do quadril (y=0 é o quadril em y=0.34 do corpo -> sola fica em y=-0.34, tocando o chão y=0)
        [-1, 1].forEach(side => {
            const arr = side < 0 ? LL : LR, lx = side * 0.056;
            push(arr, spG(0.040, 8, 6), P.pants, lx, -0.02, 0);
            push(arr, tcapG(0.043, 0.035, 0.11, 10, 4), P.pants, lx, -0.085, 0);
            push(arr, spG(0.036, 8, 6), P.pants, lx, -0.155, 0.004);
            push(arr, tcapG(0.037, 0.030, 0.08, 10, 4), P.pants, lx, -0.20, 0);
            // Bota torneada sem caixas + dobra superior + pé arredondado
            push(arr, tcapG(0.039, 0.036, 0.08, 10, 4), P.boot, lx, -0.275, 0);
            push(arr, trG(0.038, 0.011, 6, 12), P.trim, lx, -0.232, 0, Math.PI / 2, 0, 0);
            push(arr, capG(0.033, 0.068, 10, 4), P.boot, lx, -0.312, 0.024, Math.PI / 2, 0, 0, 1.06, 1.0, 0.85);
        });

        // 2. Braços articulados no pivô do ombro (y=0 é o ombro em y=0.59 -> mão em y=-0.24)
        [-1, 1].forEach(side => {
            const arr = side < 0 ? AL : AR, ax = side * 0.142;
            const hasArmor = (role === 'guard');
            push(arr, spG(hasArmor ? 0.048 : 0.036, 8, 6), hasArmor ? P.vest : P.shirt, ax, 0, 0, 0, 0, 0, 1, 1, 1, hasArmor ? [0.28, 0.85, 0.7] : null);
            push(arr, tcapG(0.033, 0.028, 0.095, 10, 4), P.shirt, ax, -0.065, 0);
            push(arr, spG(0.028, 8, 6), P.shirt, ax, -0.125, 0.005);
            push(arr, tcapG(0.029, 0.024, 0.085, 10, 4), role === 'worker' ? P.skin : P.shirt, ax, -0.175, 0.006);
            push(arr, trG(0.026, 0.008, 5, 10), P.trim, ax, -0.215, 0.006, Math.PI / 2, 0, 0);
            push(arr, spG(0.029, 8, 7), P.skin, ax, -0.245, 0.010);
            push(arr, capG(0.009, 0.014, 6, 3), P.skin, ax - side * 0.014, -0.243, 0.028, Math.PI / 3, 0, 0);
        });

        // Ferramentas e adereços nas mãos
        if (role === 'worker') {
            push(AR, cyG(0.011, 0.011, 0.24, 8), '#78350f', 0.142, -0.245, 0.09, Math.PI / 2, 0, 0);
            push(AR, bxG(0.055, 0.055, 0.095), '#475569', 0.142, -0.245, 0.20, 0, Math.PI / 2, 0, 1, 1, 1, [0.3, 0.85, 0.7]);
        } else if (role === 'guard') {
            push(AL, cyG(0.11, 0.11, 0.022, 12), P.shirt, -0.175, -0.21, 0.03, 0, 0, Math.PI / 2, 1, 1, 1, [0.3, 0.8, 0.6]);
            push(AL, spG(0.032, 8, 6), P.trim, -0.19, -0.21, 0.03, 0, 0, 0, 0.4, 1, 1, [0.25, 0.9, 0.8]);
            push(AR, cyG(0.010, 0.010, 0.36, 7), '#92400e', 0.142, -0.21, 0.03, 0.15, 0, 0);
            push(AR, cnG(0.025, 0.075, 6), '#cbd5e1', 0.142, -0.02, 0.058, 0.15, 0, 0, 1, 1, 1, [0.25, 0.9, 0.8]);
        } else if (role === 'scholar') {
            push(AR, bxG(0.075, 0.095, 0.026), '#7e22ce', 0.142, -0.235, 0.045, 0.35, 0, -0.2);
            push(AR, bxG(0.065, 0.082, 0.030), '#fef3c7', 0.146, -0.235, 0.048, 0.35, 0, -0.2);
        } else if (role === 'farmer') {
            push(AR, cyG(0.009, 0.009, 0.34, 7), '#78350f', 0.142, -0.21, 0.03, 0.18, 0, 0);
            push(AR, bxG(0.10, 0.018, 0.02), '#94a3b8', 0.142, -0.37, 0.00, 0.18, 0, 0, 1, 1, 1, [0.35, 0.8, 0.6]);
        } else if (role === 'baker') {
            push(AR, capG(0.026, 0.11, 8, 4), '#d97706', 0.142, -0.24, 0.06, Math.PI / 2.2, 0, 0);
        } else if (role === 'sailor') {
            push(AR, cyG(0.018, 0.012, 0.13, 8), '#eab308', 0.142, -0.24, 0.065, Math.PI / 2, 0, 0, 1, 1, 1, [0.28, 0.88, 0.8]);
        } else if (role === 'trainer') {
            push(AR, cyG(0.012, 0.010, 0.34, 7), '#6b3e26', 0.142, -0.21, 0.03, 0.12, 0, 0);
            push(AR, spG(0.026, 8, 6), '#c084fc', 0.142, -0.03, 0.052);
        }

        // 3. Corpo central (quadril -> torso -> cinto -> cabeça esculpida -> rosto 3D -> cabelo/chapéu)
        push(B, capG(0.094, 0.035, 12, 4), P.pants, 0, 0.335, 0, 0, 0, Math.PI / 2);
        push(B, torsoG(P.body, 0.27), P.shirt, 0, 0.34, 0);
        push(B, torsoG(P.body, 0.24), P.vest, 0, 0.342, -0.005, 0, 0, 0, 1.045, 0.96, 1.045, role === 'guard' ? [0.28, 0.85, 0.7] : null);
        // Cinto torneado e fivela
        const beltR = P.body === 'stout' ? 0.135 : 0.114;
        push(B, trG(beltR, 0.016, 6, 16), '#3b2414', 0, 0.355, 0, Math.PI / 2, 0, 0);
        push(B, capG(0.018, 0.016, 8, 3), P.trim, 0, 0.355, beltR + 0.012, 0, 0, 0, 1, 1, 0.5, [0.25, 0.9, 0.8]);
        // Capa / avental / saia
        if (role === 'scholar' || role === 'trainer' || role === 'guard') {
            push(B, cyG(0.11, 0.17, 0.28, 10), role === 'guard' ? '#dc2626' : P.vest, 0, 0.44, -0.10, 0.14, 0, 0, 1.05, 1, 0.45);
        } else if (role === 'worker' || role === 'baker') {
            push(B, cyG(0.105, 0.135, 0.22, 10), role === 'baker' ? '#f8fafc' : P.vest, 0, 0.36, 0.04, -0.05, 0, 0, 1, 1, 0.75);
        }

        // Pescoço e crânio esculpido orgânico + feições 3D
        push(B, cyG(0.036, 0.044, 0.06, 8), P.skin, 0, 0.625, 0);
        push(B, headG(0.106), P.skin, 0, 0.735, 0);
        // Narizinho arredondado + bochechas rosadas
        push(B, spG(0.017, 7, 6), P.skin, 0, 0.728, 0.108, 0, 0, 0, 0.9, 1.05, 1.15);
        [-1, 1].forEach(sx => {
            push(B, spG(0.019, 6, 5), '#fca5a5', sx * 0.052, 0.715, 0.088, 0, 0, 0, 1.2, 0.7, 0.5);
            // Olhos 3D expressivos (esclera + íris + ponto de luz)
            push(B, spG(0.017, 8, 6), '#ffffff', sx * 0.038, 0.745, 0.094, 0, 0, 0, 1.0, 1.12, 0.65);
            push(B, spG(0.011, 7, 5), '#1e293b', sx * 0.038, 0.744, 0.102, 0, 0, 0, 1.0, 1.05, 0.55);
            push(B, spG(0.0045, 5, 4), '#ffffff', sx * 0.042, 0.750, 0.107);
            // Sobrancelha
            push(B, capG(0.006, 0.022, 6, 3), P.hair, sx * 0.038, 0.770, 0.096, 0, 0, Math.PI / 2 - sx * 0.14);
        });
        // Sorriso gentil
        push(B, capG(0.005, 0.026, 6, 3), '#9a3412', 0, 0.692, 0.098, 0, 0, Math.PI / 2);

        // Cabelo esculpido + Barbas / Chapéus característicos por profissão
        push(B, spG(0.110, 12, 8), P.hair, 0, 0.768, -0.012, 0, 0, 0, 1.03, 0.95, 1.03);
        if (role === 'farmer') {
            push(B, cyG(0.22, 0.24, 0.018, 16), '#eab308', 0, 0.822, 0);
            push(B, cyG(0.10, 0.13, 0.085, 14), '#ca8a04', 0, 0.865, 0);
            push(B, trG(0.118, 0.013, 5, 14), '#dc2626', 0, 0.835, 0, Math.PI / 2, 0, 0);
            push(B, capG(0.011, 0.042, 6, 3), P.hair, 0, 0.706, 0.104, 0, 0, Math.PI / 2);
        } else if (role === 'worker') {
            push(B, spG(0.114, 12, 8), '#f59e0b', 0, 0.785, 0, 0, 0, 0, 1.06, 0.85, 1.06, [0.35, 0.6, 0.5]);
            push(B, cyG(0.125, 0.125, 0.018, 12), '#d97706', 0, 0.80, 0.045, 0.12, 0, 0);
            push(B, spG(0.024, 8, 6), '#fef08a', 0, 0.838, 0.112);
            push(B, cnG(0.068, 0.11, 9), P.hair, 0, 0.655, 0.072, Math.PI - 0.15, 0, 0);
        } else if (role === 'scholar') {
            push(B, cyG(0.19, 0.20, 0.016, 14), '#4f46e5', 0, 0.82, 0);
            push(B, cnG(0.115, 0.23, 12), '#4338ca', 0, 0.93, -0.015, -0.12, 0, 0);
            push(B, trG(0.112, 0.014, 5, 12), '#fbbf24', 0, 0.832, 0, Math.PI / 2, 0, 0);
        } else if (role === 'sailor') {
            push(B, cyG(0.115, 0.12, 0.065, 12), '#0284c7', 0, 0.84, 0);
            push(B, bxG(0.14, 0.018, 0.08), '#0f172a', 0, 0.812, 0.092, 0.15, 0, 0);
            push(B, spG(0.022, 6, 5), '#fbbf24', 0, 0.845, 0.115);
            push(B, cnG(0.055, 0.08, 8), P.hair, 0, 0.67, 0.075, Math.PI - 0.1, 0, 0);
        } else if (role === 'baker') {
            push(B, cyG(0.105, 0.11, 0.06, 12), '#ffffff', 0, 0.835, 0);
            push(B, spG(0.125, 12, 8), '#ffffff', 0, 0.905, 0, 0, 0, 0, 1.05, 0.82, 1.05);
        } else if (role === 'guard') {
            push(B, spG(0.116, 12, 8), '#cbd5e1', 0, 0.785, 0, 0, 0, 0, 1.05, 0.9, 1.06, [0.25, 0.9, 0.8]);
            push(B, capG(0.026, 0.12, 8, 4), '#dc2626', 0, 0.915, -0.02, -0.25, 0, 0);
            push(B, tcapG(0.034, 0.016, 0.15, 8, 3), P.hair, 0, 0.72, -0.11, 0.35, 0, 0);
        } else if (role === 'trainer') {
            push(B, cnG(0.125, 0.13, 12), '#6d28d9', 0, 0.86, -0.01, -0.1, 0, 0);
            push(B, capG(0.012, 0.09, 6, 3), '#fbbf24', 0.09, 0.87, 0.01, -0.2, 0, -0.4);
        } else {
            // Citizen: boina nobre com pluma
            push(B, cyG(0.135, 0.115, 0.045, 12), '#e11d48', -0.015, 0.84, 0, 0, 0, 0.18);
            push(B, capG(0.011, 0.085, 6, 3), '#f8fafc', 0.095, 0.87, -0.01, 0.1, 0, -0.45);
        }

        // Compila lista de partes em BufferGeometry compatível com CL3.mC (position, normal, color, aA, aCt, aRM, aK)
        const bakeBucket = list => {
            const pArr = [], nArr = [], cArr = [], aArr = [], ctArr = [], rmArr = [], kArr = [];
            const mtx = new THREE.Matrix4(), q = new THREE.Quaternion(), eu = new THREE.Euler();
            const pv = new THREE.Vector3(), sv = new THREE.Vector3(), col = new THREE.Color();
            list.forEach(item => {
                const g = item.geo.index ? item.geo.toNonIndexed() : item.geo.clone();
                eu.set(item.rot[0], item.rot[1], item.rot[2]); q.setFromEuler(eu);
                mtx.compose(pv.set(item.pos[0], item.pos[1], item.pos[2]), q, sv.set(item.sc[0], item.sc[1], item.sc[2]));
                g.applyMatrix4(mtx);
                if (!g.attributes.normal) g.computeVertexNormals();
                const pos = g.attributes.position.array, nrm = g.attributes.normal.array;
                col.set(item.hex);
                const rmv = item.rm;
                for (let i = 0; i < pos.length; i += 3) {
                    pArr.push(pos[i], pos[i + 1], pos[i + 2]);
                    nArr.push(nrm[i], nrm[i + 1], nrm[i + 2]);
                    const shade = 0.88 + 0.16 * Math.max(0, nrm[i + 1]);
                    cArr.push(col.r * shade, col.g * shade, col.b * shade);
                    aArr.push(0, 0.9);
                    ctArr.push(0, 0, 0);
                    rmArr.push(rmv[0], rmv[1], rmv[2]);
                    kArr.push(9);
                }
                g.dispose();
            });
            const bg = new THREE.BufferGeometry();
            bg.setAttribute('position', new THREE.Float32BufferAttribute(pArr, 3));
            bg.setAttribute('normal', new THREE.Float32BufferAttribute(nArr, 3));
            bg.setAttribute('color', new THREE.Float32BufferAttribute(cArr, 3));
            bg.setAttribute('aA', new THREE.Float32BufferAttribute(aArr, 2));
            bg.setAttribute('aCt', new THREE.Float32BufferAttribute(ctArr, 3));
            bg.setAttribute('aRM', new THREE.Float32BufferAttribute(rmArr, 3));
            bg.setAttribute('aK', new THREE.Float32BufferAttribute(kArr, 1));
            bg.computeBoundingSphere();
            return bg;
        };

        // Também cria uma malha estática fundida (fallback leve se clPerfMode()==='minimo')
        const staticAll = [
            ...B,
            ...LL.map(it => Object.assign({}, it, { pos: [it.pos[0], it.pos[1] + 0.34, it.pos[2]] })),
            ...LR.map(it => Object.assign({}, it, { pos: [it.pos[0], it.pos[1] + 0.34, it.pos[2]] })),
            ...AL.map(it => Object.assign({}, it, { pos: [it.pos[0], it.pos[1] + 0.59, it.pos[2]] })),
            ...AR.map(it => Object.assign({}, it, { pos: [it.pos[0], it.pos[1] + 0.59, it.pos[2]] }))
        ];

        return {
            body: bakeBucket(B),
            lL: bakeBucket(LL),
            lR: bakeBucket(LR),
            aL: bakeBucket(AL),
            aR: bakeBucket(AR),
            full: bakeBucket(staticAll)
        };
    }

    function clColInit() {
        const THREE = clTh(); if (!THREE || !CL3.sc || !CL3.mC) return;
        CL3.colMeshes = {}; CL3.colLimbs = {};
        const wh = new THREE.Color(0xffffff);
        const hiShadow = (!IPAD && !LITE && (typeof clPerfMode !== 'function' || clPerfMode() === 'alto'));
        const mkIM = (geo, shadow) => {
            const im = new THREE.InstancedMesh(geo, CL3.mC, 32);
            im.count = 0; im.visible = false; im.frustumCulled = false; im.castShadow = !!shadow;
            for (let j = 0; j < 32; j++) im.setColorAt(j, wh);
            if (im.instanceColor) im.instanceColor.needsUpdate = true;
            CL3.sc.add(im);
            return im;
        };
        CL_COL_ROLES.forEach(r => {
            const baked = clNpcBuildRoleParts(THREE, r);
            CL3.geo['col_' + r] = { solid: baked.full };
            CL3.geo['col_b' + r] = { solid: baked.body };
            CL3.geo['col_l' + r] = { solid: baked.lL };
            CL3.geo['col_r' + r] = { solid: baked.lR };
            CL3.geo['col_a' + r] = { solid: baked.aL };
            CL3.geo['col_c' + r] = { solid: baked.aR };
            CL3.colMeshes[r] = mkIM(baked.full, hiShadow);
            CL3.colLimbs[r] = {
                body: mkIM(baked.body, hiShadow),
                lL: mkIM(baked.lL, false),
                lR: mkIM(baked.lR, false),
                aL: mkIM(baked.aL, false),
                aR: mkIM(baked.aR, false)
            };
        });
        CL3.col = CL3.colMeshes['citizen'];
        CL3.agents = [];
    }

    function clColFree(s, x, z) { const H = s.H; if (x < -H + 1 || z < -H + 1 || x > H - 1 || z > H - 1) return false; return clOcc(s).get(clCells(Math.floor(x), Math.floor(z))) === undefined; }

    function clColPick(s, a) {   // novo destino perto, em linha reta sem bater em nada
        for (let k = 0; k < 10; k++) { const an = Math.random() * 6.2832, d = 2 + Math.random() * 6, tx = a.x + Math.cos(an) * d, tz = a.z + Math.sin(an) * d; if (!clColFree(s, tx, tz)) continue; let ok = true; for (let i = 1; i <= 8; i++) if (!clColFree(s, a.x + (tx - a.x) * i / 8, a.z + (tz - a.z) * i / 8)) { ok = false; break; } if (ok) { a.tx = tx; a.tz = tz; return true; } } return false;
    }

    function clColSync() {
        if (!CL3.colMeshes) return;
        const s = clS(), maxCap = (IPAD || (typeof clPerfMode === 'function' && clPerfMode() === 'minimo')) ? 12 : 24;
        const want = clamp(2 + Math.floor(clStats().pop / 3) - (typeof clActOut === 'function' ? clActOut(s) : 0), 2, maxCap);
        const pcs = s.pcs || [];
        const hasAny = ids => pcs.some(p => ids.includes(p[0]));

        const pool = ['citizen'];
        if (hasAny(['fazenda', 'estufa', 'pomar'])) pool.push('farmer', 'farmer');
        if (hasAny(['moinho', 'mercado'])) pool.push('baker');
        if (hasAny(['mina', 'forja', 'refinaria', 'pedreira', 'fundicao', 'oficina'])) pool.push('worker', 'worker');
        if (hasAny(['biblioteca', 'lab', 'escola', 'academia', 'centro_pesq', 'observatorio'])) pool.push('scholar');
        if (hasAny(['porto'])) pool.push('sailor');
        if (hasAny(['quartel', 'torre_vigia', 'muralha'])) pool.push('guard');
        if (hasAny(['incubadora', 'dragoes', 'covil', 'curral'])) pool.push('trainer');

        while (CL3.agents.length > want) CL3.agents.pop();

        while (CL3.agents.length < want) {
            let x = 0, z = 0;
            for (let k = 0; k < 40; k++) {
                x = (Math.random() - 0.5) * 14; z = (Math.random() - 0.5) * 14;
                if (clColFree(s, x, z)) break;
            }
            const role = pool[CL3.agents.length % pool.length];
            CL3.agents.push({
                role: role,
                x, z, tx: x, tz: z,
                w: Math.random() * 2,
                spd: 0.55 + Math.random() * 0.35,
                st: 'w', ph: Math.random() * 6,
                yaw: Math.random() * 6,
                c: '#ffffff'
            });
        }
    }

    function clDebGeo(k) { const key = 'deb:' + k; return CL3.geo[key] || (CL3.geo[key] = clBuildGeo(CLDB[k], 0)); }

    function clRebuildDeb() {   // a sujeira que ainda não foi limpa, em lote (uma malha por tipo)

        const THREE = clTh(), s = clS(), mtx = new THREE.Matrix4(), q = new THREE.Quaternion(), sv = new THREE.Vector3(), pv = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0), groups = {};

        CL3.debInst.forEach(m => { CL3.grp.remove(m); }); CL3.debInst = []; clDebrisVisible(s).forEach(e => { (groups[e.k] = groups[e.k] || []).push(e); });

        Object.keys(groups).forEach(k => {

            if (typeof clProtoDebrisUse === 'function' && clProtoDebrisUse(k, groups[k])) return;
            const g = clDebGeo(k), arr = groups[k];

            [[g.solid, CL3.mS], [g.glow, CL3.mG]].forEach(([geo, mat]) => {

                if (!geo) return; const im = new THREE.InstancedMesh(geo, mat, arr.length);

                arr.forEach((e, j) => { q.setFromAxisAngle(up, e.rot); mtx.compose(pv.set(e.x + e.w / 2, 0, e.z + e.d / 2), q, sv.set(e.sc, e.sc, e.sc)); im.setMatrixAt(j, mtx); });

                im.instanceMatrix.needsUpdate = true; im.frustumCulled = false; im.castShadow = mat === CL3.mS; im.receiveShadow = false; CL3.grp.add(im); CL3.debInst.push(im);

            });

        });

    }

    /* ---------- materiais: textura de grão em volta da peça, balanço das plantas, cristais que flutuam e luzes que pulsam ---------- */

    const CL_ANIM_VS = `

        vec3 transformed = vec3( position ); float ph = 0.;

        #ifdef USE_INSTANCING

            ph = instanceMatrix[3].x * 0.7 + instanceMatrix[3].z * 0.45;

        #endif

        float an = aA.x;

        if ( an > 0.5 ) {

            float w = clamp( ( position.y - aCt.y ) / max( 0.05, aA.y ), 0., 1. );

            if ( an < 1.5 ) { transformed.x += ( sin( uTime * 1.7 + ph + position.y * 1.3 ) * 0.07 + sin( uTime * 4.6 + ph * 2. + position.x * 7. + position.y * 5. ) * 0.016 ) * w * w; transformed.z += cos( uTime * 1.3 + ph ) * 0.05 * w * w; }

            else if ( an < 2.5 ) { float ag = uTime * 0.6 + ph; float cs = cos( ag ), sn = sin( ag ); vec2 d = position.xz - aCt.xz; transformed.xz = aCt.xz + vec2( d.x * cs - d.y * sn, d.x * sn + d.y * cs ); transformed.y += sin( uTime * 1.9 + ph ) * 0.09 + sin( uTime * 0.8 + ph * 1.7 ) * 0.03; }

            else if ( an < 3.5 ) { vec3 c0 = vec3( aCt.x, aCt.y + aA.y * 0.5, aCt.z ); float fl = aA.y < 0.45 ? 1. : 0.; float st = 1. + 0.08 * sin( uTime * 2.4 + ph ) + fl * 0.16 * sin( uTime * 9. + ph * 3. ) * sin( uTime * 5.3 + ph ); transformed = c0 + ( position - c0 ) * vec3( 1. + fl * 0.05 * sin( uTime * 7. + ph ), st, 1. + fl * 0.05 * cos( uTime * 8. + ph ) ); transformed.x += fl * sin( uTime * 6. + ph * 2. ) * 0.012 * clamp( ( position.y - aCt.y ) / max( 0.05, aA.y ), 0., 1. ); }

            else if ( an > 4.5 && an < 6.5 ) { float ag = uTime * ( an < 5.5 ? 0.55 : -0.9 ); float cs = cos( ag ), sn = sin( ag ); transformed.xz = vec2( transformed.x * cs - transformed.z * sn, transformed.x * sn + transformed.z * cs ); }

        }

        vPh = ph; vAn = an; vLP = position; vLN = normal; vPH = aA.y; vRM = aRM; vK = aK; vBY = aCt.y;

        #ifdef LAMP

            vLit = aLit;

        #endif

        vec4 wl = vec4( transformed, 1. ); vec3 nl = normal;

        #ifdef USE_INSTANCING

            wl = instanceMatrix * wl; nl = mat3( instanceMatrix ) * nl;

        #endif

        vWP = ( modelMatrix * wl ).xyz; vWN = mat3( modelMatrix ) * nl;`;

    const CL_GRAIN_CODE = `

        vec3 an3 = abs( normalize( vWN ) ); an3 /= ( an3.x + an3.y + an3.z );

        float gr = texture2D( uGrain, vWP.zy * 0.55 ).r * an3.x + texture2D( uGrain, vWP.xz * 0.55 ).r * an3.y + texture2D( uGrain, vWP.xy * 0.55 ).r * an3.z;

        diffuseColor.rgb *= 0.8 + 0.4 * gr;

        vec3 dc = diffuseColor.rgb; float mx = max( max( dc.r, dc.g ), dc.b ), mn = min( min( dc.r, dc.g ), dc.b ), sat = mx - mn, lum = dot( dc, vec3( 0.3, 0.59, 0.11 ) );

        vec3 al = abs( vLN ); float tp = al.y; vec2 uv = al.x > al.z ? vLP.zy : vLP.xy;

        float wall = ( 1. - tp ) * smoothstep( 0.45, 0.8, vPH );

        float stone = ( 1. - smoothstep( 0.1, 0.3, sat ) ) * step( 0.12, lum ) * step( lum, 0.82 );

        float wood = step( 0.06, sat ) * step( sat, 0.5 ) * step( dc.g * 1.08, dc.r ) * step( dc.b * 1.12, dc.g ) * step( lum, 0.5 ); float mdlK = step( 8.5, vK ); stone *= 1. - mdlK; wood *= 1. - mdlK;

        vec2 bu = vec2( uv.x * 3.2 + mod( floor( uv.y * 4.6 ), 2. ) * 0.5, uv.y * 4.6 ); vec2 bf = fract( bu );

        float aaB = 1. - smoothstep( 0.12, 0.3, max( fwidth( bu.x ), fwidth( bu.y ) ) );   /* de longe os tijolos somem aos poucos (sem serrilhado) */

        vec2 fwb = fwidth( bu ) * 0.75; float mort = max( 1. - smoothstep( 0.07 - fwb.x, 0.07 + fwb.x, bf.x ), 1. - smoothstep( 0.1 - fwb.y, 0.1 + fwb.y, bf.y ) ) * aaB;   /* juntas com borda suave: sem pontilhado */

        diffuseColor.rgb *= 1. - wall * stone * ( mort * 0.14 - ( clh( floor( bu ) ) - 0.5 ) * 0.12 * aaB );

        float fpl = fwidth( uv.x * 7. ) * 0.75; float pl = ( 1. - smoothstep( 0.07 - fpl, 0.07 + fpl, fract( uv.x * 7. ) ) ) * ( 1. - smoothstep( 0.12, 0.3, fpl ) ); float wg = 0.5 + 0.5 * sin( uv.x * 40. + sin( uv.y * 6. + floor( uv.x * 7. ) * 3. ) * 2. );

        diffuseColor.rgb *= 1. - wall * wood * ( pl * 0.22 + wg * 0.07 );

        vec2 pv = vLP.xz * 2.; vec2 pf = fract( pv ); vec2 fpv = fwidth( pv ) * 0.75; float pav = max( 1. - smoothstep( 0.05 - fpv.x, 0.05 + fpv.x, pf.x ), 1. - smoothstep( 0.05 - fpv.y, 0.05 + fpv.y, pf.y ) ) * ( 1. - smoothstep( 0.06, 0.16, max( fpv.x, fpv.y ) ) );

        diffuseColor.rgb *= 1. - tp * stone * smoothstep( 0.6, 0.9, tp ) * ( pav * 0.08 - ( clh( floor( pv ) ) - 0.5 ) * 0.06 );

        diffuseColor.rgb += tp * smoothstep( 0.8, 1., tp ) * 0.035;

        vec3 tS = texture2D( uTS, vWP.zy * 0.28 ).rgb * an3.x + texture2D( uTS, vWP.xz * 0.28 ).rgb * an3.y + texture2D( uTS, vWP.xy * 0.28 ).rgb * an3.z;

        vec3 tW = texture2D( uTW, vWP.zy * 0.4 ).rgb * an3.x + texture2D( uTW, vWP.xz * 0.4 ).rgb * an3.y + texture2D( uTW, vWP.xy * 0.4 ).rgb * an3.z;

        diffuseColor.rgb *= mix( 1., 0.4 + 1.2 * tS.r, stone * 0.85 ); diffuseColor.rgb *= mix( 1., 0.45 + 1.1 * tW.r, wood * 0.85 );

        float clR = vRM.x, clM = vRM.y; clR = mix( clR, clamp( tS.g * 1.15, 0.3, 1. ), stone * 0.45 ); clR = mix( clR, clamp( tW.g * 1.1, 0.45, 1. ), wood * 0.45 );

        /* metal de verdade: chapa com riscos e variação de brilho (textura real), mais reflexo do céu */

        vec3 tM = texture2D( uTM, vWP.zy * 0.45 ).rgb * an3.x + texture2D( uTM, vWP.xz * 0.45 ).rgb * an3.y + texture2D( uTM, vWP.xy * 0.45 ).rgb * an3.z; float mtl = vRM.z;

        diffuseColor.rgb *= mix( 1., 0.5 + 1.0 * tM.r, mtl * 0.9 ); clR = mix( clR, clamp( 0.18 + tM.g * 0.62, 0.2, 0.75 ), mtl * 0.85 ); clM = mix( clM, 0.88, mtl );

        /* detalhes de arquitetura (só em caixas altas = paredes): rodapé, cornija, janelas com vidro que acende de noite; telhas nos telhados de pirâmide */

        float dyB = vLP.y - vBY, wallB = wall * step( 0.5, vK ) * step( vK, 1.5 );

        float plinth = 1. - smoothstep( 0.1, 0.13, dyB ), corn = 1. - smoothstep( 0.07, 0.1, vPH - dyB );

        diffuseColor.rgb *= 1. - wallB * ( plinth * 0.16 ) + wallB * corn * 0.1;

        vec3 clWinE = vec3( 0. ); float winM = wallB * step( 0.8, vPH ) * smoothstep( 0.32, 0.4, dyB ) * ( 1. - smoothstep( 0.1, 0.16, vPH - dyB ) );

        { vec2 wc = vec2( uv.x / 0.42, dyB / 0.52 ); vec2 wi = floor( wc ), wf = fract( wc ); float inW = step( 0.26, wf.x ) * step( wf.x, 0.74 ) * step( 0.3, wf.y ) * step( wf.y, 0.8 ), fr = step( 0.2, wf.x ) * step( wf.x, 0.8 ) * step( 0.24, wf.y ) * step( wf.y, 0.86 ) * ( 1. - inW ), mull = inW * ( 1. - step( 0.03, abs( wf.x - 0.5 ) ) ), lit = step( 0.42, clh( wi + 7.3 ) ) * uNight;

          float gl = winM * inW * ( 1. - mull ); vec3 glass = mix( vec3( 0.1, 0.15, 0.22 ), vec3( 0.45, 0.62, 0.8 ), wf.y * 0.5 ); diffuseColor.rgb = mix( diffuseColor.rgb, mix( glass, vec3( 1., 0.8, 0.45 ), lit ), gl );

          diffuseColor.rgb *= 1. - winM * ( fr + mull ) * 0.3; clR = mix( clR, 0.1, gl * ( 1. - lit ) ); clM = mix( clM, 0., gl ); clWinE = vec3( 1., 0.78, 0.42 ) * lit * gl * 1.4; }

        float roofM = step( 4.5, vK ) * ( 1. - step( 0.95, tp ) ); vec2 ru = vec2( ( al.x > al.z ? vLP.z : vLP.x ) * 7. + mod( floor( vLP.y * 10. ), 2. ) * 0.5, vLP.y * 10. ), rf = fract( ru ), fwr = fwidth( ru ) * 0.75;

        float rmt = max( 1. - smoothstep( 0.06 - fwr.x, 0.06 + fwr.x, rf.x ), 1. - smoothstep( 0.1 - fwr.y, 0.1 + fwr.y, rf.y ) ) * ( 1. - smoothstep( 0.15, 0.35, max( fwr.x, fwr.y ) ) );

        diffuseColor.rgb *= 1. - roofM * ( rmt * 0.22 - ( clh( floor( ru ) ) - 0.5 ) * 0.16 ); clR = mix( clR, 0.8, roofM * 0.4 ); clR = mix( clR, 0.96, wall * stone * mort ); clR = mix( clR, 0.9, wall * wood * 0.6 ); clR = clamp( clR + ( gr - 0.5 ) * 0.18, 0.06, 1. );

        float alien = step( 5.5, vK ) * ( 1. - mdlK );

        { float am = fbm( vLP * 2.4 + vec3( vPh * 3. ) ), af = fbm( vLP * 4.4 + vec3( vPh * 5. ) ), ac = ( 1. - smoothstep( 0., 0.03 + fwidth( af ) * 1.5, abs( af - 0.5 ) ) ) * ( 1. - smoothstep( 0.04, 0.12, fwidth( af ) ) );

          diffuseColor.rgb *= mix( 1., 0.3 + 0.8 * am, alien ); clR = mix( clR, 0.25 + 0.4 * am, alien ); clM = mix( clM, 0.55, alien ); clWinE += uAcc * ac * alien * ( 0.5 + 0.25 * sin( uTime * 1.6 + vPh * 2. ) ) * mix( 0.6, 1.8, uNight ); }

        float clH = - wall * stone * mort - wall * wood * pl * 0.8 - tp * stone * smoothstep( 0.6, 0.9, tp ) * pav * 0.7;`;

    const CL_PBR_R = `float roughnessFactor = clR;`, CL_PBR_M = `float metalnessFactor = clM;`;

    const CL_BUMP = `

        { vec3 sx = dFdx( - vViewPosition ), sy = dFdy( - vViewPosition ); vec2 dh = vec2( dFdx( clH ), dFdy( clH ) ) * 0.3; vec3 r1 = cross( sy, normal ), r2 = cross( normal, sx ); float det = dot( sx, r1 ) * faceDirection; vec3 grd = sign( det ) * ( dh.x * r1 + dh.y * r2 ); normal = normalize( abs( det ) * normal - grd ); }`;

    const CL_RIM_CODE = `

        { vec3 Vd = normalize( cameraPosition - vWP ); float rim = pow( 1. - clamp( abs( dot( normalize( vWN ), Vd ) ), 0., 1. ), 3. ); totalEmissiveRadiance += diffuseColor.rgb * rim * 0.4 * ( 1. - uNight * 0.45 ); totalEmissiveRadiance += clWinE; }`;

    function clGrainTex() {

        const THREE = clTh(), c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), s = document.createElement('canvas'); s.width = s.height = 24; const sx = s.getContext('2d'), id = sx.createImageData(24, 24);

        for (let i = 0; i < 576; i++) { const v = 90 + Math.random() * 80; id.data[i * 4] = id.data[i * 4 + 1] = id.data[i * 4 + 2] = v; id.data[i * 4 + 3] = 255; } sx.putImageData(id, 0, 0);

        x.imageSmoothingEnabled = true; x.drawImage(s, 0, 0, 128, 128); x.globalAlpha = 0.35; for (let i = 0; i < 2200; i++) { const v = 90 + Math.random() * 90; x.fillStyle = 'rgb(' + v + ',' + v + ',' + v + ')'; x.fillRect(Math.random() * 128, Math.random() * 128, 1 + Math.random() * 2, 1 + Math.random() * 2); }

        const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; return t;

    }

    const CL_GLOW_CODE = `

        float nm = ( vAn > 3.5 && vAn < 4.5 ) ? mix( 0.1, 1.25, uNight ) : 1.0; float lm = 1.0;

        #ifdef LAMP

            lm = mix( 0.08, 1.2, vLit );

        #endif

        diffuseColor.rgb *= ( 0.8 + 0.3 * sin( uTime * 2.3 + vPh ) ) * nm * lm;

        /* nada de superfície lisa: veios de energia, facetas e granulação em todo brilho (cristais, esferas, anéis do Núcleo) */

        float flw = step( 6.5, vAn ) * step( vAn, 7.5 ), wvv = step( 7.5, vAn );   /* f: plasma que sobe · w: onda de luz que percorre a peça */

        vec3 gp = vLP * 2.6 + vec3( vPh * 3.7 ) - vec3( 0., uTime * 1.5 * flw, 0. );

        float gn = fbm( gp * 1.6 + vec3( 0., uTime * 0.1, 0. ) ), gn2 = fbm( gp * 4.2 - vec3( uTime * 0.07, 0., uTime * 0.05 ) );

        float vein = 1. - smoothstep( 0., 0.06, abs( gn2 - 0.5 ) ), cellG = h3( floor( gp * 6.5 ) );

        float fres = pow( 1. - abs( dot( normalize( vWN ), normalize( cameraPosition - vWP ) ) ), 2.2 );

        diffuseColor.rgb *= ( 0.4 + 0.85 * gn ) * ( 0.86 + 0.2 * cellG ) * ( 1. - 0.35 * vein * smoothstep( 0.5, 0.75, gn ) );

        diffuseColor.rgb += diffuseColor.rgb * ( vein * 0.3 + fres * 0.3 + flw * vein * 0.9 );

        diffuseColor.rgb *= mix( 1., 0.3 + 1.5 * pow( 0.5 + 0.5 * sin( vWP.y * 3.4 - uTime * 3.6 ), 2. ), wvv ); diffuseColor.rgb = min( diffuseColor.rgb, vec3( 1.25 ) );`;

    function clMakeMats() {

        const THREE = clTh(), grain = clGrainTex(); CL3.grain = grain; const uT = CL3.uTime;

        const ph = () => { const t = new THREE.DataTexture(new Uint8Array([128, 200, 0, 255]), 1, 1); t.needsUpdate = true; return t; }; CL3.texS = { value: ph() }; CL3.texW = { value: ph() }; CL3.texM = { value: ph() };

        [['stone', CL3.texS], ['wood', CL3.texW], ['metal', CL3.texM]].forEach(([n, u]) => new THREE.TextureLoader().load('./assets/colony/' + n + '.webp', t => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; u.value = t; }, undefined, () => {}));   /* detalhe real de pedra e madeira (Poly Haven, CC0): R = relevo/claro-escuro, G = rugosidade */

        const hook = (mat, frag, rim) => { mat.onBeforeCompile = sh => { sh.uniforms.uTime = uT; sh.uniforms.uGrain = { value: grain }; sh.uniforms.uNight = CL3.uNight; sh.uniforms.uTS = CL3.texS; sh.uniforms.uTW = CL3.texW; sh.uniforms.uTM = CL3.texM; sh.uniforms.uAcc = CL3.uAcc || (CL3.uAcc = { value: new THREE.Color(clStarPal()[0]).multiplyScalar(1.4) });

            sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute vec2 aA;attribute vec3 aCt;attribute vec3 aRM;attribute float aK;varying vec3 vRM;varying float vK;varying float vBY;uniform float uTime;varying vec3 vWP;varying vec3 vWN;varying float vPh;varying float vAn;varying vec3 vLP;varying vec3 vLN;varying float vPH;\n#ifdef LAMP\nattribute float aLit;varying float vLit;\n#endif').replace('#include <begin_vertex>', CL_ANIM_VS);

            sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform sampler2D uGrain;uniform sampler2D uTS;uniform sampler2D uTW;uniform sampler2D uTM;uniform vec3 uAcc;uniform float uTime;uniform float uNight;varying vec3 vRM;varying float vK;varying float vBY;varying vec3 vWP;varying vec3 vWN;varying float vPh;varying float vAn;varying vec3 vLP;varying vec3 vLN;varying float vPH;\nfloat clh(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}\n' + GLSL_NOISE + '\n#ifdef LAMP\nvarying float vLit;\n#endif').replace('#include <color_fragment>', '#include <color_fragment>\n' + frag).replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n' + (rim ? CL_RIM_CODE : '')).replace('#include <roughnessmap_fragment>', rim ? CL_PBR_R : '#include <roughnessmap_fragment>').replace('#include <metalnessmap_fragment>', rim ? CL_PBR_M : '#include <metalnessmap_fragment>'); }; };

        CL3.mS = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: false, roughness: 0.8, metalness: 0.06 }); hook(CL3.mS, CL_GRAIN_CODE, 1);

        /* os colonos têm cor por instância: com o mesmo material das peças (sem cor por instância) a iluminação das peças quebrava e elas ficavam pretas */

        CL3.mC = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: false, roughness: 0.8, metalness: 0.06 });

        CL3.mGl = new THREE.MeshStandardMaterial({ vertexColors: true, transparent: true, opacity: 0.26, roughness: 0.04, metalness: 0.2, envMapIntensity: 1.8, depthWrite: false, side: THREE.DoubleSide });   /* vidro do tubo de plasma */ hook(CL3.mC, CL_GRAIN_CODE, 1);

        CL3.mG = new THREE.MeshBasicMaterial({ vertexColors: true }); hook(CL3.mG, CL_GLOW_CODE);

        CL3.mGL = new THREE.MeshBasicMaterial({ vertexColors: true }); CL3.mGL.defines = { LAMP: '' }; hook(CL3.mGL, CL_GLOW_CODE);   /* brilho dos postes: cada um com o próprio estado (aceso/apagado) */

        CL3.mGh = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.85, transparent: true, opacity: 0.7, emissive: 0x1aff6a, emissiveIntensity: 0.35, depthWrite: false });

    }

    /* ---------- o chão é a superfície da estrela (a mesma granulação do Sol do universo), a perder de vista; o terreno de construção é uma placa sobre ela ---------- */

    const CL_FLOOR_FS = `uniform float uLin;uniform float uN;uniform float uTime;uniform float uH;uniform float uHw;uniform float uQ;uniform vec3 uA;uniform vec3 uB;uniform vec3 uFog;uniform vec3 uSkyH;uniform vec3 uSkyZ;uniform vec3 uSun;uniform sampler2D uWt;uniform float uWon;uniform vec4 uIs[10];varying vec3 vW;${GLSL_NOISE}

        float wh(vec2 p,float t){return fbm(vec3(p*.5,t*.07));}

        vec4 wfr(float f,vec2 p){vec2 q=abs(fract(p*.5)*2.-1.);q=q*(1.-1./64.)+.5/128.;f=mod(f,24.);vec2 c=vec2(mod(f,6.),floor(f/6.));return texture2D(uWt,(c+q)/vec2(6.,4.));}

        vec4 wrip(vec2 p,float t){float f=t/6.*24.*2.2;float i=floor(f);return mix(wfr(i,p),wfr(i+1.,p),f-i);}

        void main(){

          vec2 p=vW.xz;float t=uTime;float d=length(vW-cameraPosition);

          vec2 g=vec2(.8,.6)*cos(dot(vec2(.8,.6),p)*.9+t*1.7)*.24+vec2(-.5,.86)*cos(dot(vec2(-.5,.86),p)*1.7+t*2.3)*.26+vec2(.2,-.98)*cos(dot(vec2(.2,-.98),p)*3.1+t*3.)*.16;

          float h0;if(uQ>.5){h0=wh(p,t);g+=vec2(wh(p+vec2(.12,0.),t)-h0,wh(p+vec2(0.,.12),t)-h0)/.12*.32;}else{h0=.5+.28*sin(p.x*.8+t*.6)*sin(p.y*.7-t*.5);g+=vec2(cos(p.x*.8+t*.6)*.1,cos(p.y*.7-t*.5)*.1);}

          float wf=1.-smoothstep(30.,150.,d);float hb=0.;if(uWon>.5&&wf>.01){vec4 w1=wrip(p*.11+vec2(t*.02,t*.008),t),w2=wrip(mat2(.8,-.6,.6,.8)*p*.047-vec2(t*.01,t*.016)+.37,t+9.);g+=((w1.xy+w2.xy)-1.)*1.4*.393*wf*2.1;hb=(w1.z+w2.z-1.)*wf;h0+=hb*.22;}

          g*=1.-smoothstep(60.,360.,d)*.85;

          vec3 n=normalize(vec3(-g.x,1.,-g.y));vec3 V=normalize(cameraPosition-vW);float ct=max(dot(n,V),0.);

          float fr=.03+.97*pow(1.-ct,5.);vec3 R=reflect(-V,n);R.y=abs(R.y);

          vec3 sky=mix(uSkyH,uSkyZ,pow(clamp(R.y,0.,1.),.5));

          float sd=max(dot(R,uSun),0.);float sp=pow(sd,110.)*1.6+pow(sd,22.)*.3;

          vec3 deep=mix(mix(uA*.22,vec3(.01,.07,.13),.5),uA*.4,uHw),shallow=mix(mix(uB*.5,vec3(.05,.3,.36),.55),mix(uB,vec3(.34,.3,.5),.4)*.6,uHw);

          vec3 col=mix(deep,shallow,clamp(pow(ct,1.5)*.7+(h0-.5)*.5,0.,1.));

          col=mix(col,sky,clamp(fr+.14+.12*uHw,0.,1.));col+=uB*.1*uHw;col+=shallow*smoothstep(.56,.86,h0)*.3;col+=vec3(1.,.92,.78)*sp*(1.-uN*.85);

          float ed=max(abs(vW.x),abs(vW.z))-uH-.3;

          float fo=(1.-smoothstep(0.,1.6+sin(t*.8+p.x*1.7+p.y*1.3)*.5,ed))*step(-.4,ed);fo*=smoothstep(.32,.62,(uQ>.5?fbm(vec3(p*1.7,t*.25)):h0)+(1.-clamp(ed/2.,0.,1.))*.45);

          col*=1.-.3*(1.-smoothstep(0.,5.,ed))*step(-.4,ed);col=mix(col,vec3(.92,.96,1.)*mix(1.,.5,uN),clamp(fo,0.,1.)*.9);

          float fi=0.;for(int i=0;i<10;i++){vec4 q=uIs[i];if(q.w>.5){vec2 dv=p-q.xy;float an=atan(dv.y,dv.x);float dd=length(dv)-q.z*(1.+.14*sin(an*3.+q.x)+.08*sin(an*7.+q.y));float lap=1.-smoothstep(0.,2.4+sin(t*1.2+an*4.)*.8,dd);float br=uQ>.5?fbm(vec3(p*1.7,t*.35)):.5+.5*sin(p.x*2.+p.y*1.7+t);float rip=.5+.5*sin(dd*4.2-t*2.6+br*3.);fi=max(fi,lap*step(-.7,dd)*smoothstep(.34,.72,br*.75+rip*.4));col*=1.-.28*(1.-smoothstep(0.,5.,dd))*step(-.7,dd);}}

          col=mix(col,vec3(.92,.96,1.)*mix(1.,.5,uN),clamp(fi,0.,1.)*.7);

          col*=mix(1.,mix(.45,.9,uHw),uN);col=mix(col,uFog,smoothstep(110.,560.,d));

          gl_FragColor=vec4(uLin>.5?pow(max(col,0.),vec3(2.2)):col,1.);}`;

    const CL_SKY_FS = `uniform vec3 uHor;uniform vec3 uZen;uniform vec3 uSun;uniform vec3 uSunC;uniform vec3 uCl;uniform float uCa;uniform float uTime;uniform float uLin;varying vec3 vD;${GLSL_NOISE}

        void main(){

          vec3 d=normalize(vD);float y=d.y;

          vec3 col=mix(uHor,uZen,pow(clamp(y,0.,1.),.55));col=mix(col,uHor*.8,smoothstep(0.,-.4,y));

          float sd=max(dot(d,uSun),0.);col+=uSunC*(pow(sd,6.)*.14+pow(sd,90.)*.5)*uCa;

          if(y>.015){vec2 q=d.xz/(y+.22);float cl=fbm(vec3(q*.55+uTime*.004,3.1))*.7+fbm(vec3(q*1.7-uTime*.006,7.3))*.3;float m=smoothstep(.5,.78,cl)*smoothstep(.015,.22,y);col=mix(col,uCl*(.62+.38*smoothstep(.5,.9,cl)),m*.85);}

          gl_FragColor=vec4(uLin>.5?pow(max(col,0.),vec3(2.2)):col,1.);}`;

    function clFloorBuild() {   /* o entorno é água de verdade: ondas, reflexo do céu (fresnel), brilho do sol e espuma batendo na margem da ilha */

        const THREE = clTh(), pal = clStarPal(), hwF = clEvActive('halloween'), a = new THREE.Color(hwF ? '#6a38a8' : pal[0]), b = new THREE.Color(hwF ? '#b27af0' : pal[1]);

        const m = new THREE.ShaderMaterial({ uniforms: { uLin: CL3.uLin || (CL3.uLin = { value: 0 }), uTime: CL3.uTime, uN: CL3.uNight, uH: { value: clS().H }, uQ: CL3.uQ = { value: CL_TOUCH() || CL3.lowq ? 0 : 1 }, uHw: { value: hwF ? 1 : 0 }, uWt: { value: null }, uWon: { value: 0 }, uIs: { value: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(() => new THREE.Vector4(0, 0, 0, 0)) }, uA: { value: a }, uB: { value: b.clone().lerp(a, 0.35) }, uFog: { value: new THREE.Color(hwF ? 0x14081f : 0x070b16) }, uSkyH: { value: new THREE.Color(hwF ? 0x9a62d8 : 0x9cc4e8) }, uSkyZ: { value: new THREE.Color(hwF ? 0x4a2488 : 0x3b78c8) }, uSun: { value: new THREE.Vector3(0.45, 0.62, 0.3).normalize() } }, vertexShader: 'varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}', fragmentShader: CL_FLOOR_FS });

        new THREE.TextureLoader().load('./assets/colony/agua-atlas.png', t => { t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; t.generateMipmaps = false; t.minFilter = t.magFilter = THREE.LinearFilter; t.anisotropy = 1; m.uniforms.uWt.value = t; m.uniforms.uWon.value = 1; }, undefined, () => {});   /* ondulações da água: atlas assado de 'animated water surface' (Krivolap Denis, CC-BY) */

        const sk = CL3.skyU = { uHor: { value: new THREE.Color(0xa9cdee) }, uZen: { value: new THREE.Color(0x3a74c4) }, uSun: { value: new THREE.Vector3(0.45, 0.62, 0.3).normalize() }, uSunC: { value: new THREE.Color(0xfff0d0) }, uCl: { value: new THREE.Color(0xffffff) }, uCa: { value: 1 }, uTime: CL3.uTime, uLin: CL3.uLin };

        m.uniforms.uSkyH = sk.uHor; m.uniforms.uSkyZ = sk.uZen;   /* a água reflete o mesmo céu que se vê */

        const dome = new THREE.Mesh(new THREE.SphereGeometry(2000, 32, 16), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, uniforms: sk, vertexShader: 'varying vec3 vD;void main(){vD=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}', fragmentShader: CL_SKY_FS }));

        dome.renderOrder = -10; dome.frustumCulled = false; CL3.sc.add(dome); CL3.skyDome = dome;

        const f = new THREE.Mesh(new THREE.PlaneGeometry(3200, 3200), m); f.rotation.x = -Math.PI / 2; f.position.y = -0.6; f.frustumCulled = false; CL3.sc.add(f); CL3.floor = f; CL3.floorFog = m.uniforms.uFog;

    }

    function clTerrain() {

        const THREE = clTh(), s = clS(), H = s.H, pink = clPinkStar(), pal = clStarPal(); if (CL3.floor) CL3.floor.material.uniforms.uH.value = H; if (CL3.ground) { CL3.sc.remove(CL3.ground); CL3.ground.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) { if (o.material.map) o.material.map.dispose(); if (o.material.emissiveMap) o.material.emissiveMap.dispose(); o.material.dispose(); } }); }

        if (CL3.outer) { CL3.sc.remove(CL3.outer); CL3.outer.dispose && CL3.outer.dispose(); CL3.outer = null; }

        const G0 = new THREE.Group();

        CL3.groundMat = null; const hwT = clEvActive('halloween'), bt = clBiome(s).tiles, gp = clPalPref(), GC = { azul: '#163150', verde: '#1e4a17', dourado: '#543e18', rosa: '#50163b', roxo: '#2f1650' }, gcol = new THREE.Color(hwT ? '#33203f' : GC[gp] || (bt ? bt[0] : pink ? '#3f2646' : '#163150'));   /* a Cor do mundo (Configurações) também pinta o chão da ilha */

        const tmat = new THREE.MeshStandardMaterial({ color: gcol, roughness: 0.92, metalness: 0.02, envMapIntensity: 0.35 });   /* uma cor só; o relevo vem da textura real de terreno (CC0, Poly Haven) */

        new THREE.TextureLoader().load('./assets/colony/ground.webp', t => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(H / 3.5, H / 3.5); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; tmat.map = t; tmat.color.copy(gcol).multiplyScalar(hwT ? 1.45 : 2.7); tmat.needsUpdate = true; if (CL3.sc) CL3.needT = false; }, undefined, () => {});

        CL3.groundMat = tmat; const tiles = new THREE.Mesh(new THREE.PlaneGeometry(2 * H, 2 * H), tmat); tiles.rotation.x = -Math.PI / 2; tiles.position.y = 0.005; tiles.receiveShadow = true; G0.add(tiles);

        const slab = new THREE.Mesh(new THREE.BoxGeometry(2 * H + 0.6, 0.9, 2 * H + 0.6), new THREE.MeshStandardMaterial({ color: hwT ? 0x2a1a38 : ({ verde: 0x3a5a30, dourado: 0x5a4a30, rosa: 0x5a3a55, roxo: 0x40386a })[clPalPref()] || (pink ? 0x4a3550 : 0x4a4f58), roughness: 0.92, metalness: 0.02, envMapIntensity: 0.3 })); slab.position.y = -0.455; slab.receiveShadow = true; G0.add(slab);

        const bm = new THREE.MeshBasicMaterial({ color: new THREE.Color(pal[0]) }); CL3.mBorder = bm; [[0, -H - 0.2, 2 * H + 0.6, 0.2], [0, H + 0.2, 2 * H + 0.6, 0.2], [-H - 0.2, 0, 0.2, 2 * H + 0.6], [H + 0.2, 0, 0.2, 2 * H + 0.6]].forEach(([x, z, w, d]) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, 0.1, d), bm); b.position.set(x, 0.02, z); G0.add(b); });

        const pts = [], gl = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.22, depthWrite: false }));

        for (let i = -H; i <= H; i++) { pts.push(i, 0.03, -H, i, 0.03, H, -H, 0.03, i, H, 0.03, i); } gl.geometry.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); gl.visible = false; G0.add(gl); CL3.gridL = gl;

        CL3.ground = G0; CL3.sc.add(G0); CL3.needT = false;

        /* os cristais espalhados na água saíram: o horizonte agora tem ilhotas, névoa e lanternas (clWaterBuild) */

    }

    /* ---------- cena: luz da estrela, céu e brasas subindo do chão ---------- */

    function clSceneBuild() {

        const THREE = clTh(), sc = new THREE.Scene(), pal = clStarPal(), pink = clPinkStar(), hw = clEvActive('halloween'); sc.background = new THREE.Color(hw ? 0x14081f : 0x070b16); CL3.sc = sc; sc.fog = new THREE.Fog(sc.background.getHex(), 70, 320);   /* neblina suave: o fundo clareia e esfria (profundidade de maquete) */

        CL3.hemi = new THREE.HemisphereLight(hw ? 0xc8a0ff : pink ? 0xf0c4ff : 0xbcd2ff, new THREE.Color(pal[0]).multiplyScalar(0.55), hw ? 0.62 : 0.9); sc.add(CL3.hemi); CL3.amb = new THREE.AmbientLight(hw ? 0xb48cff : 0xffffff, hw ? 0.14 : 0.18); sc.add(CL3.amb);

        const sunDir = new THREE.Vector3(-0.45, 0.8, -0.4).normalize(), L = new THREE.DirectionalLight(hw ? 0xffb878 : pink ? 0xffe2f2 : 0xe6f1ff, 1.4); CL3.sunV = sunDir.clone(); L.position.copy(sunDir).multiplyScalar(80); L.castShadow = !LITE; L.shadow.mapSize.set(LITE ? 512 : 2048, LITE ? 512 : 2048); L.shadow.bias = -0.0007; L.shadow.radius = 4.5; L.shadow.blurSamples = 14; L.shadow.normalBias = 0.02; L.shadow.camera.near = 5; L.shadow.camera.far = 240; { const r = 56; L.shadow.camera.left = -r; L.shadow.camera.right = r; L.shadow.camera.top = r; L.shadow.camera.bottom = -r; } sc.add(L); sc.add(L.target); CL3.sun = L;

        const rim = new THREE.PointLight(new THREE.Color(pal[0]), 1.8, 60, 1.4); rim.position.set(0, -1.5, 0); sc.add(rim);

        const grp = new THREE.Group(); sc.add(grp); CL3.grp = grp; clMakeMats(); clFloorBuild();

        const n = 1500, pos = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const u = Math.random() * 6.2832, v = Math.acos(Math.random() * 0.96), r = 700; pos[i * 3] = r * Math.sin(v) * Math.cos(u); pos[i * 3 + 1] = r * Math.cos(v) * 0.8 + 10; pos[i * 3 + 2] = r * Math.sin(v) * Math.sin(u); }

        const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); CL3.stars = new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.85 })); sc.add(CL3.stars);

        const dn = 220, dp = new Float32Array(dn * 3); for (let i = 0; i < dn; i++) { dp[i * 3] = (Math.random() - 0.5) * 160; dp[i * 3 + 1] = Math.random() * 18; dp[i * 3 + 2] = (Math.random() - 0.5) * 160; }

        const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(dp, 3)); CL3.dust = new THREE.Points(dg, new THREE.PointsMaterial({ color: pal[1], size: 3, sizeAttenuation: false, transparent: true, opacity: 0.6, depthWrite: false })); CL3.dust.frustumCulled = false; sc.add(CL3.dust);

        CL3.cam = new THREE.PerspectiveCamera(42, 1, 0.5, 2400); CL3.dayN = null; clSmokeInit(); clColInit(); clLampFxInit(); clDropsInit(); clToolsInit(); if (hw) clHwBuild(); clWaterBuild(hw); clDayStep(1);

        CL3.selM = new THREE.Group(); const sm = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0x66e0ff, transparent: true, opacity: 0.28, depthWrite: false, side: THREE.DoubleSide })); sm.rotation.x = -Math.PI / 2; sm.position.y = 0.04; CL3.selM.add(sm); CL3.selM.visible = false; CL3.selM.userData.fill = sm; sc.add(CL3.selM);

        CL3.ghost = new THREE.Group(); CL3.ghost.visible = false; const gp = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0x38ff8a, transparent: true, opacity: 0.35, depthWrite: false, side: THREE.DoubleSide })); gp.rotation.x = -Math.PI / 2; gp.position.y = 0.05; CL3.ghost.add(gp); CL3.ghost.userData.plane = gp; sc.add(CL3.ghost);

    }

    function clGhostModelReady(id) {   /* a peça tem modelo 3D novo e ele já carregou? (o fantasma de posicionar usa o mesmo desenho da colônia) */
        try {
            const cdef = CLM_CUSTOM_HANDLERS[id], def = CLM_DEF[id];
            if (cdef) { if (typeof cdef.preload === 'function') cdef.preload(); return !cdef.req || !!(CLM.tpl[cdef.req] && CLM.tpl[cdef.req].gl); }
            if (def && !def.roam && !def.skin) { if (!CLM.tpl[def.f]) { clModelLoad(def.f); return false; } return !!CLM.tpl[def.f].gl; }
        } catch (e) {}
        return false;
    }
    function clGhostModel(id, cv) {
        const THREE = clTh(), g = new THREE.Group(), cdef = CLM_CUSTOM_HANDLERS[id], def = CLM_DEF[id];
        if (cdef) { g.scale.setScalar(cdef.scale != null ? cdef.scale : 1); cdef.assemble(g, 1, cv | 0); }
        else { g.add(CLM.tpl[def.f].gl.scene.clone(true)); g.position.y += def.lift || 0; }
        g.traverse(o => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; o.frustumCulled = false; const arr = Array.isArray(o.material), ms = arr ? o.material : [o.material], nm = ms.map(m => { if (!m) return m; const c = m.clone(); c.transparent = true; c.opacity = 0.62; c.depthWrite = false; return c; }); o.material = arr ? nm : nm[0]; } });
        return g;
    }
    function clGhostSet() {   // monta (ou troca) a peça fantasma que acompanha o cursor

        const h = CL.hold, lv = h && h.id === 'mina' ? (h.idx >= 0 ? (((clS().pcs[h.idx] || [])[4]) || 1) : 1) : 0, key = h ? h.id + ':' + (h.cv | 0) + ':' + lv + (clGhostModelReady(h.id) ? ':m' : '') : ''; if (key === CL3.ghostKey) return; CL3.ghostKey = key; const THREE = clTh();

        CL3.ghost.children.slice().forEach(ch => { if (ch !== CL3.ghost.userData.plane) CL3.ghost.remove(ch); }); if (!h) { CL3.ghost.visible = false; return; }

        if (key.slice(-2) === ':m') { try { CL3.ghost.add(clGhostModel(h.id, h.cv)); return; } catch (e) {} } const g = clGeoFor(h.id, h.cv | 0, lv); if (g.solid) { const m = new THREE.Mesh(g.solid, CL3.mGh); CL3.ghost.add(m); } if (g.glow) CL3.ghost.add(new THREE.Mesh(g.glow, CL3.mG));

    }

    function clDebAt(x, z) { const s = clS(), v = clOcc(s).get(clCells(x, z)); return v !== undefined && v < 0 ? clDebrisList(s.seed)[-1 - v] : null; }

    function clGhostPlace() {

        if (CL.tool === 'clear') {

            const hv = CL.hover; if (!hv) { CL3.ghost.visible = false; return; } const e = clDebAt(hv.x, hv.z), s = clS(), ok = e ? clCan(clDebCost(s, e)) : false, pl = CL3.ghost.userData.plane;

            CL3.ghost.visible = true; CL3.ghost.rotation.y = 0; CL3.ghost.scale.setScalar(1); CL3.ghost.position.set(e ? e.x + e.w / 2 : hv.x + 0.5, 0, e ? e.z + e.d / 2 : hv.z + 0.5); pl.scale.set(e ? e.w : 1, e ? e.d : 1, 1); pl.material.color.setHex(e ? (ok ? 0xffd166 : 0xff4a4a) : 0x8899aa); return;

        }

        const h = CL.hold, hv = CL.hover; if (!h || !hv) { if (CL3.ghost) CL3.ghost.visible = false; return; }

        const t = CLT[h.id], f = clFp(t, h.rot), ok = clFits(h.id, hv.x, hv.z, h.rot, h.idx >= 0 ? h.idx : undefined) && (h.idx >= 0 || clCan(t.cost)); CL3.hoverOk = ok;

        CL3.ghost.visible = true; CL3.ghost.position.set(hv.x + f[0] / 2, 0, hv.z + f[1] / 2); CL3.ghost.rotation.y = -(h.rot & 3) * Math.PI / 2; CL3.ghost.scale.setScalar(t.vs || 1);

        const pl = CL3.ghost.userData.plane; pl.scale.set(t.fp[0] / (t.vs || 1), t.fp[1] / (t.vs || 1), 1); pl.material.color.setHex(ok ? 0x38ff8a : 0xff4a4a); CL3.mGh.emissive.setHex(ok ? 0x1aff6a : 0xff2a2a);

    }

    function clSelPlace() {

        const s = clS(), p = CL.sel >= 0 ? s.pcs[CL.sel] : null, m = CL3.selM; if (!p && CL.selD >= 0) { const e = clDebrisList(s.seed)[CL.selD]; if (e && !clClearedSet(s).has(e.i)) { m.visible = true; m.position.set(e.x + e.w / 2, 0, e.z + e.d / 2); m.userData.fill.scale.set(e.w + 0.1, e.d + 0.1, 1); return; } }

        if (!p || !CLT[p[0]] || (CL.hold && CL.hold.idx === CL.sel)) { m.visible = false; return; }

        const f = clFp(CLT[p[0]], p[3]); m.visible = true; m.position.set(p[1] + f[0] / 2, 0, p[2] + f[1] / 2); m.userData.fill.scale.set(f[0] + 0.12, f[1] + 0.12, 1);

    }

    /* ---------- Sistema Cinemático de Upgrades: Ondas de choque, colunas de plasma, faíscas e squash-bounce ---------- */

    function clTriggerUpgradeFX(pos, isNucleus, pieceIdx) {
        if (!CL3.sc) return; const THREE = clTh();

        /* Focar suavemente a câmera na construção sendo evoluída para nunca perder a animação */
        CL3.gtx = pos[0];
        CL3.gtz = pos[2];
        CL3.gdist = Math.max(14, Math.min(CL3.gdist, isNucleus ? 21 : 16.5));
        CL3.gpit = 0.64;
        if (typeof clClampCam === 'function') clClampCam();
        CL3.need = true;

        /* Fechar todas as abas e painéis para o jogador ter visão limpa do espetáculo */
        try { if (typeof clCloseAllPanels === 'function') clCloseAllPanels(); } catch (e) {}

        CL3.camKick = isNucleus ? 0.75 : 0.35;
        if (isNucleus) { CL3.cineCore = 3.5; CL3.cineCoreK = 1.38; }
        try { if (typeof aliveSound === 'function') aliveSound('upgrade'); } catch (e) {}



        /* 1. Anel de onda de choque no solo */

        const ringGeo = new THREE.RingGeometry(0.12, 0.5, 36);

        ringGeo.rotateX(-Math.PI / 2);

        const ringMat = new THREE.MeshBasicMaterial({ color: isNucleus ? 0x5ee0ff : 0x7dff9a, transparent: true, opacity: 0.95, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending });

        const ring = new THREE.Mesh(ringGeo, ringMat);

        ring.position.set(pos[0], 0.08, pos[2]);

        CL3.sc.add(ring);



        /* 2. Coluna ascendente de plasma/luz estelar */

        const pilGeo = new THREE.CylinderGeometry(0.35, 0.55, isNucleus ? 26 : 14, 18, 1, true);

        const pilMat = new THREE.MeshBasicMaterial({ color: isNucleus ? 0xffffff : 0xa6f0ff, transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending });

        const pillar = new THREE.Mesh(pilGeo, pilMat);

        pillar.position.set(pos[0], isNucleus ? 13 : 7, pos[2]);

        CL3.sc.add(pillar);



        /* 3. Explosão de faíscas estelares radiais */

        const numSparks = isNucleus ? 70 : 40;

        for (let k = 0; k < numSparks; k++) {

            const an = Math.random() * Math.PI * 2, spd = 2.4 + Math.random() * (isNucleus ? 5.5 : 3.2);

            const vx = Math.cos(an) * spd, vz = Math.sin(an) * spd, vy = 3.0 + Math.random() * 4.5;

            const col = isNucleus ? (k % 2 ? [0.37, 0.88, 1.0] : [1.0, 0.9, 0.4]) : (k % 2 ? [0.49, 1.0, 0.6] : [1.0, 0.85, 0.35]);

            if (typeof clDrop === 'function') clDrop(pos[0], 0.35, pos[2], vx, vy, vz, col[0], col[1], col[2], 1.2 + Math.random() * 0.8);

        }



        /* 4. Registrar efeito ativo e squash-bounce elástico */

        if (!CL3.upgFx) CL3.upgFx = [];

        CL3.upgFx.push({ ring, pillar, maxR: isNucleus ? 6.5 : 3.4, t: 0, dur: isNucleus ? 1.4 : 1.05, isNucleus });

        if (!CL3.bounces) CL3.bounces = [];

        CL3.bounces.push({ pos: [pos[0], pos[2]], isNucleus, pieceIdx, t: 0, dur: isNucleus ? 1.25 : 0.9 });

    }

    window.clTriggerUpgradeFX = clTriggerUpgradeFX;



    function clUpgradeFXStep(dt) {

        if (CL3.cineCore > 1.0) CL3.cineCore = Math.max(1.0, CL3.cineCore - dt * 2.8);

        const THREE = clTh();

        if (CL3.upgFx && CL3.upgFx.length) {

            for (let i = CL3.upgFx.length - 1; i >= 0; i--) {

                const fx = CL3.upgFx[i]; fx.t += dt; const p = fx.t / fx.dur;

                if (p >= 1) {

                    if (CL3.sc) { CL3.sc.remove(fx.ring); CL3.sc.remove(fx.pillar); }

                    if (fx.ring.geometry) fx.ring.geometry.dispose(); if (fx.ring.material) fx.ring.material.dispose();

                    if (fx.pillar.geometry) fx.pillar.geometry.dispose(); if (fx.pillar.material) fx.pillar.material.dispose();

                    CL3.upgFx.splice(i, 1); continue;

                }

                const r = 0.2 + (fx.maxR - 0.2) * Math.sqrt(p);

                fx.ring.scale.set(r, r, 1);

                fx.ring.material.opacity = (1 - p) * 0.95;

                fx.pillar.scale.set(1 + p * 0.85, 1, 1 + p * 0.85);

                fx.pillar.material.opacity = (1 - p * p) * 0.85;

            }

        }

        if (CL3.bounces && CL3.bounces.length) {

            for (let i = CL3.bounces.length - 1; i >= 0; i--) {

                const b = CL3.bounces[i]; b.t += dt; const bp = b.t / b.dur;

                if (bp >= 1) {

                    if (b.isNucleus) CL3.cineCoreK = 1.0;

                    CL3.bounces.splice(i, 1); continue;

                }

                const bounce = 1.0 + 0.35 * Math.exp(-b.t * 5.5) * Math.sin(b.t * 16);

                if (b.isNucleus) {

                    CL3.cineCoreK = bounce;

                } else if (b.pieceIdx != null && CL3.pmap && CL3.pmap[b.pieceIdx]) {

                    const pm = CL3.pmap[b.pieceIdx];

                    if (pm.grps) pm.grps.forEach(g => { if (g.bs) g.g.scale.copy(g.bs).multiplyScalar(bounce); });

                    if (pm.ims) pm.ims.forEach(it => { const m = it.m.clone(); m.scale(new THREE.Vector3(bounce, bounce, bounce)); it.im.setMatrixAt(it.j, m); it.im.instanceMatrix.needsUpdate = true; });

                }

            }

        }

    }

    /* ---------- câmera ---------- */

    function clCamSet() {

        const k = 1 - Math.exp(-CL3.dt * 32), kz = 1 - Math.exp(-CL3.dt * 18), c = CL3.cam; CL3.yaw += (CL3.gyaw - CL3.yaw) * k; CL3.pit += (CL3.gpit - CL3.pit) * k; CL3.dist += (CL3.gdist - CL3.dist) * kz;   /* câmera quase instantânea ao arrastar; o zoom ainda suaviza um pouco */ CL3.tx += (CL3.gtx - CL3.tx) * k; CL3.tz += (CL3.gtz - CL3.tz) * k;

        let sx = 0, sy = 0, sz = 0;

        if (CL3.camKick > 0.001) {

            CL3.camKick *= Math.exp(-CL3.dt * 9);

            const kick = CL3.camKick * 1.6;

            sx = (Math.random() - 0.5) * kick;

            sy = (Math.random() - 0.5) * kick * 0.6;

            sz = (Math.random() - 0.5) * kick;

        }

        c.position.set(CL3.tx + sx + Math.sin(CL3.yaw) * Math.cos(CL3.pit) * CL3.dist, Math.sin(CL3.pit) * CL3.dist + sy, CL3.tz + sz + Math.cos(CL3.yaw) * Math.cos(CL3.pit) * CL3.dist);

        c.lookAt(CL3.tx + sx, sy * 0.5, CL3.tz + sz);

    }

    function clClampCam() { const H = CL.visit ? CL.visit.s.H : clS().H; CL3.gpit = clamp(CL3.gpit, 0.28, 1.45); CL3.gdist = clamp(CL3.gdist, 2.4, 50 + H * 2.6); CL3.gtx = clamp(CL3.gtx, -H, H); CL3.gtz = clamp(CL3.gtz, -H, H); }

    function clCellAt(cx, cy, fp) {

        const THREE = clTh(), r = CL3.cv.getBoundingClientRect(), ndc = new THREE.Vector2(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1), rc = new THREE.Raycaster(); rc.setFromCamera(ndc, CL3.cam);

        const hit = new THREE.Vector3(), ok = rc.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hit); if (!ok) return null; const f = fp || [1, 1];

        return fp ? { x: Math.round(hit.x - f[0] / 2), z: Math.round(hit.z - f[1] / 2), fx: hit.x, fz: hit.z } : { x: Math.floor(hit.x), z: Math.floor(hit.z), fx: hit.x, fz: hit.z };

    }

    /* ---------- toque e mouse ---------- */

    function clHoverFrom(cx, cy) { if (CL.tool === 'clear' && !CL.hold) { const c = clCellAt(cx, cy); CL.hover = c ? { x: c.x, z: c.z } : null; return; } if (!CL.hold) { CL.hover = null; return; } const f = clFp(CLT[CL.hold.id], CL.hold.rot), c = clCellAt(cx, cy, f); CL.hover = c ? { x: c.x, z: c.z } : null; }

    function clUpdatePieceBoxes() {
        if (!CL3.sc || !clTh()) return;
        const THREE = clTh(), s = clS();
        if (!s || !Array.isArray(s.pcs)) return;
        CL3.pboxes = [];
        s.pcs.forEach((p, i) => {
            const t = CLT[p[0]];
            if (!t) return;
            const f = clFp(t, p[3]);
            const box = new THREE.Box3();
            let hasObj = false;

            if (p[0] === 'nucleo' && typeof CC !== 'undefined' && CC.g) {
                try {
                    CC.g.updateMatrixWorld(true);
                    box.setFromObject(CC.g);
                    hasObj = true;
                } catch (e) {}
            } else if (CL3.pmap && CL3.pmap[i] && CL3.pmap[i].grps && CL3.pmap[i].grps.length) {
                try {
                    for (const item of CL3.pmap[i].grps) {
                        if (item && item.g) {
                            item.g.updateMatrixWorld(true);
                            if (!hasObj) { box.setFromObject(item.g); hasObj = true; }
                            else { box.expandByObject(item.g); }
                        }
                    }
                } catch (e) {}
            }

            if (!hasObj) {
                if (t._hh == null && t.parts) {
                    let h0 = 0;
                    t.parts.forEach(pt => { if (!pt.g) h0 = Math.max(h0, pt.p[1] + pt.s[1]); });
                    t._hh = h0;
                }
                const hh = Math.max(0.65, (t._hh || 1.1) * (t.vs || 1));
                box.min.set(p[1], 0, p[2]);
                box.max.set(p[1] + f[0], hh, p[2] + f[1]);
            } else {
                if (p[0] !== 'nucleo') {   /* a caixa do modelo inclui pás, galhos e enfeites que invadem o vizinho: limita ao terreno da peça (+ folga) para o toque não pegar o prédio errado */
                    const mg = 0.3; box.min.x = Math.max(box.min.x, p[1] - mg); box.max.x = Math.min(box.max.x, p[1] + f[0] + mg); box.min.z = Math.max(box.min.z, p[2] - mg); box.max.z = Math.min(box.max.z, p[2] + f[1] + mg);
                    if (box.min.x >= box.max.x || box.min.z >= box.max.z) { box.min.set(p[1], 0, p[2]); box.max.set(p[1] + f[0], Math.max(0.65, box.max.y), p[2] + f[1]); }
                }
                box.expandByPoint(new THREE.Vector3(p[1] - 0.04, 0, p[2] - 0.04));
                box.expandByPoint(new THREE.Vector3(p[1] + f[0] + 0.04, 0.35, p[2] + f[1] + 0.04));
            }

            CL3.pboxes[i] = box;
        });
    }

    function clPickPiece(cx, cy) {   /* tocar num prédio escolhe o prédio (a caixa 3D real do modelo no ar), não o chão atrás: o toque não escorrega */
        if (!CL3.cv || !CL3.cam) return -1;
        const THREE = clTh(), s = clS();
        if (!s || !Array.isArray(s.pcs)) return -1;
        const r = CL3.cv.getBoundingClientRect();
        const ndc = new THREE.Vector2(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
        const rc = new THREE.Raycaster();
        rc.setFromCamera(ndc, CL3.cam);
        const hit = new THREE.Vector3();
        let best = -1, bd = 1e9;

        if (CL3.pboxDirty || !CL3.pboxes || CL3.pboxes.length !== s.pcs.length) {
            clUpdatePieceBoxes();
            CL3.pboxDirty = false;
        }

        const boxes = CL3.pboxes || [];
        for (let i = 0; i < s.pcs.length; i++) {
            const box = boxes[i];
            if (!box) continue;
            if (rc.ray.intersectBox(box, hit)) {
                const d = hit.distanceTo(rc.ray.origin);
                if (d < bd) {
                    bd = d;
                    best = i;
                }
            }
        }
        return best;
    }

    const CL_TOUCH = () => !!(window.matchMedia && matchMedia('(pointer:coarse)').matches);

    function clPmap(pi) { return CL3.pmap[pi] || (CL3.pmap[pi] = { ims: [], grps: [] }); }

    function clTap(cx, cy) {

        if (CL.tool === 'clear' && !CL.hold) { clHoverFrom(cx, cy); try { clToolClear(); } catch (e) {} return; }

        if (CL.hold) { clHoverFrom(cx, cy); if (CL.hover) clCommit(); return; }
        if (typeof clFarmTap === 'function' && clFarmTap(cx, cy)) return;
        if (typeof clBichosTap === 'function' && clBichosTap(cx, cy)) return;
        if (typeof clTapInteractive === 'function' && clTapInteractive(cx, cy)) return;

        const c = clCellAt(cx, cy), s = clS(), pb = clPickPiece(cx, cy), i = pb >= 0 ? pb : (c ? clOcc(s).get(clCells(c.x, c.z)) : undefined);
        CL.sel = i !== undefined && i >= 0 ? i : -1; CL.selD = i !== undefined && i < 0 ? -1 - i : -1; CL.showSelDetails = false; if (CL.sel >= 0 || CL.selD >= 0) CL.build = false; try { clUiSel(); clPaintBar(true); } catch (e) {} try { if (CL.sel >= 0 && typeof clBichosSelOpen === 'function') clBichosSelOpen(); } catch (e) {}

    }

    /* dedos: se o sistema levantar todos os toques sem avisar o canvas, zera; e arrastar começando numa bolha de coleta vira arrasto/pinça da câmera (antes a bolha engolia o gesto) */
    (function () {
        let fwd = null;
        const clr = ev => { if (ev.touches && ev.touches.length === 0 && CL3.ptr && CL3.ptr.size) { CL3.ptr.clear(); CL3.pinch = null; } };
        window.addEventListener('touchend', clr, { passive: true, capture: true }); window.addEventListener('touchcancel', clr, { passive: true, capture: true });
        document.addEventListener('pointerdown', ev => { try { if (!CL.on || !CL3.cv || ev.pointerType === 'mouse') return; const t = ev.target && ev.target.closest && ev.target.closest('.cl-cdy'); fwd = t ? { id: ev.pointerId, x: ev.clientX, y: ev.clientY } : null; } catch (er) { fwd = null; } }, true);
        document.addEventListener('pointermove', ev => { try { if (!fwd || ev.pointerId !== fwd.id) return; if (Math.hypot(ev.clientX - fwd.x, ev.clientY - fwd.y) > 10) { const f = fwd; fwd = null; clPtrDown({ pointerId: ev.pointerId, clientX: f.x, clientY: f.y, button: 0, pointerType: ev.pointerType, preventDefault() {} }); clPtrMove(ev); } } catch (er) { fwd = null; } }, true);
        document.addEventListener('pointerup', () => { fwd = null; }, true); document.addEventListener('pointercancel', () => { fwd = null; }, true);
    })();

    function clPtrDown(e) {

        if (e.button > 2) return; CL3.cv.setPointerCapture && CL3.cv.setPointerCapture(e.pointerId); CL3.pinch = null; CL3.ptr.set(e.pointerId, { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, btn: e.button, moved: false, type: e.pointerType, last: null, t: performance.now() });   

        if (typeof clFarmSwipeDown === 'function') { const q0 = CL3.ptr.get(e.pointerId); if (CL3.ptr.size === 1 && e.button === 0) q0.fs = clFarmSwipeDown(e.clientX, e.clientY); else CL3.ptr.forEach(z => { z.fs = null; }); }   /* o dedo começa em cima de um canteiro: arrastar colhe e planta em vez de mover a câmera */
        if (e.pointerType === 'mouse') clHoverFrom(e.clientX, e.clientY); else if (CL3.ptr.size === 1 && (CL.hold || CL.tool)) clHoverFrom(e.clientX, e.clientY);

        if (CL3.ptr.size === 2) CL3.pinch = clPinch(); e.preventDefault();

    }

    function clPinch() { const a = [...CL3.ptr.values()], dx = a[1].x - a[0].x, dy = a[1].y - a[0].y; return { d: Math.hypot(dx, dy) || 1, ang: Math.atan2(dy, dx), mx: (a[0].x + a[1].x) / 2, my: (a[0].y + a[1].y) / 2 }; }

    function clPtrMove(e) {

        const p = CL3.ptr.get(e.pointerId);

        if (!p) { if (e.pointerType === 'mouse' && (CL.hold || CL.tool)) clHoverFrom(e.clientX, e.clientY); return; }

        const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY; p.t = performance.now(); if (!p.moved && Math.hypot(p.x - p.sx, p.y - p.sy) > 6) p.moved = true;

        if (CL3.ptr.size >= 2) {   // dois dedos: afasta/aproxima, gira e arrasta

            const n = clPinch(), o = CL3.pinch || n; CL3.gdist *= o.d / n.d; { let da = n.ang - o.ang; da = Math.atan2(Math.sin(da), Math.cos(da)); if (Math.abs(da) < 0.6) CL3.gyaw += da; }   /* sentido invertido a pedido; e a diferença de ângulo é normalizada: ao cruzar ±180° ela dava uma volta inteira de câmera (o 'reset' ao aproximar) */ const k = CL3.dist * 0.0017, sy = Math.sin(CL3.yaw), cy = Math.cos(CL3.yaw); CL3.gtx -= (n.mx - o.mx) * k * cy + (n.my - o.my) * k * sy; CL3.gtz -= -(n.mx - o.mx) * k * sy + (n.my - o.my) * k * cy; CL3.pinch = n; p.moved = true; clClampCam(); return;

        }

        if (!p.moved) return;

        if (p.fs) { clFarmSwipeMove(e.clientX, e.clientY, p); return; }

        if (p.type === 'mouse' && (p.btn === 2 || e.shiftKey)) { CL3.gyaw -= dx * 0.008; CL3.gpit += dy * 0.006; clClampCam(); return; }

        if (CL.tool === 'clear' && !CL.hold) { clHoverFrom(e.clientX, e.clientY); if (CL.hover && p.last !== CL.hover.x + ',' + CL.hover.z) { p.last = CL.hover.x + ',' + CL.hover.z; try { clToolClear(true); } catch (er) {} } return; }

        if (CL.hold && (p.type !== 'mouse' || CL.hold.paint)) { clHoverFrom(e.clientX, e.clientY); if (p.type === 'mouse' && CL.hold.paint && CL.hover && (p.last !== CL.hover.x + ',' + CL.hover.z)) { p.last = CL.hover.x + ',' + CL.hover.z; const cur = CL.hover; if (p.lc && (Math.abs(cur.x - p.lc[0]) + Math.abs(cur.z - p.lc[1])) > 1 && Math.abs(cur.x - p.lc[0]) + Math.abs(cur.z - p.lc[1]) < 12) { let ix = p.lc[0], iz = p.lc[1]; while (ix !== cur.x || iz !== cur.z) { if (Math.abs(cur.x - ix) >= Math.abs(cur.z - iz)) ix += Math.sign(cur.x - ix); else iz += Math.sign(cur.z - iz); CL.hover = Object.assign({}, cur, { x: ix, z: iz }); clCommit(true); } CL.hover = cur; } else clCommit(true); p.lc = [cur.x, cur.z]; } return; }   /* arrastar rápido na diagonal não pulava casas: agora preenche o caminho (em L) e a cerca fecha o canto de 90° */

        const k = CL3.dist * 0.0017, sy = Math.sin(CL3.yaw), cy = Math.cos(CL3.yaw); CL3.gtx -= dx * k * cy + dy * k * sy; CL3.gtz -= -dx * k * sy + dy * k * cy; clClampCam();

    }

    function clPtrUp(e) {

        const p = CL3.ptr.get(e.pointerId); if (!p) return; CL3.ptr.delete(e.pointerId); CL3.pinch = null; const wasMulti = CL3.ptr.size >= 1; if (CL3.ptr.size === 1) { const r = [...CL3.ptr.values()][0]; r.moved = true; }

        if (p.fs && p.moved) { try { clFarmSwipeEnd(p); } catch (er) {} return; }

        if (CL.visit || CS.on) return;   /* visitando ou no cinema: só olhar */

        if (!p.moved && !wasMulti && p.btn === 0) { if (p.type === 'mouse' || !CL.hold) clTap(p.x, p.y); else clHoverFrom(p.x, p.y); }

        else if (!p.moved && p.btn === 2) { if (CL.hold) clCancelHold(); else { CL.sel = -1; try { clUiSel(); } catch (er) {} } }

    }

    function clWheel(e) {   /* mouse: a roda dá zoom. Touchpad do MacBook: pinça = zoom (o navegador manda como roda com Ctrl) e dois dedos = girar a câmera. Option + rolar força o zoom */
        e.preventDefault();
        if (e.ctrlKey) { CL3.gdist *= Math.exp(clamp(e.deltaY, -40, 40) * 0.01); clClampCam(); return; }
        const tp = e.deltaMode === 0 && !e.altKey && (e.deltaX !== 0 || Math.abs(e.deltaY) < 50 || (CL3.tpAt && Date.now() - CL3.tpAt < 250));
        if (tp) { CL3.tpAt = Date.now(); CL3.gyaw += e.deltaX * 0.006; CL3.gpit -= e.deltaY * 0.004; clClampCam(); return; }
        CL3.gdist *= Math.exp(clamp(e.deltaY || e.deltaX, -120, 120) * 0.0012); clClampCam();
    }
    function clGesStart(e) { e.preventDefault(); CL3.gsc = e.scale || 1; }   /* Safari no Mac manda a pinça como evento de gesto */
    function clGesChange(e) { e.preventDefault(); const sc = e.scale || 1, o = CL3.gsc || sc; CL3.gdist *= o / sc; CL3.gsc = sc; clClampCam(); }
    function clGesEnd(e) { e.preventDefault(); CL3.gsc = 0; }

    function clKeys(e) {
        if (!CL.on || (typeof isHoloOpen === 'function' && isHoloOpen()) || (typeof isEditingTarget === 'function' && isEditingTarget(e.target))) return; const t = e.target; if (t && (t.isContentEditable || (t.closest && t.closest('input,textarea,[contenteditable="true"],.cx-holo-editor-editable,.cx-holo')) || (typeof HOLO !== 'undefined' && HOLO.el && !HOLO.el.hidden))) { if (e.key === 'Escape') { e.stopImmediatePropagation(); if (t.blur) t.blur(); } return; }

        const k = String(e.key).toLowerCase(), ks = CL.keys || (CL.keys = {}); if (e.type === 'keyup') { delete ks[k]; return; }

        if (k === 'e' && e.type === 'keydown' && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); e.stopImmediatePropagation(); if (!e.repeat && !CL.visit) { try { if (typeof holoOpenRoot === 'function') holoOpenRoot(); else clNoteOpen(); } catch (er) { try { clNoteOpen(); } catch (er2) {} } } return; }   /* E agora abre o explorador de arquivos (clNoteOpen, a caixa de anotação rápida, fica guardada sem uso); o giro da câmera por E (ks.e em clKeyMove) fica guardado, mas sem uso, porque ks.e nunca é marcado */
        ks[k] = 1; if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'r', 'q', 'e', 'escape', 'delete', 'backspace', 'x', '+', '-', '=', 'f', 'h'].indexOf(k) < 0) return;

        if (CL.visit && ['r', 'delete', 'backspace', 'x'].indexOf(k) >= 0) { e.preventDefault(); return; }

        e.preventDefault(); e.stopImmediatePropagation(); if (e.repeat && k !== 'w' && k !== 'a' && k !== 's' && k !== 'd') return;

        if (k === 'h') CL.root.classList.toggle('zen');

        else if (k === 'escape') { if (CS.on) clStoryExit(); else if (CL.visit) clVisEnd(); else if (CL.root.classList.contains('zen')) CL.root.classList.remove('zen'); else if (CL.hold) clCancelHold(); else if (CL.tool) clToolSet(false); else if (CL.upgArm >= 0) { CL.upgArm = -1; clUiSel(); } else if (CL.sel >= 0 || CL.selD >= 0) { CL.sel = -1; CL.selD = -1; clUiSel(); } else if (CL.ui && CL.ui.panelOpen()) CL.ui.closePanels(); else clClose(); }

        else if (k === 'r') clRotate(); else if (k === 'delete' || k === 'backspace' || k === 'x') { if (CL.sel >= 0) clUiSell(); }

    }

    function clKeyMove(dt) {

        const ks = CL.keys; if (!ks) return; const sp = CL3.dist * 0.9 * dt, sy = Math.sin(CL3.yaw), cy = Math.cos(CL3.yaw); let fx = 0, fz = 0;

        if (ks.w || ks.arrowup) { fx -= sy; fz -= cy; } if (ks.s || ks.arrowdown) { fx += sy; fz += cy; } if (ks.a || ks.arrowleft) { fx -= cy; fz += sy; } if (ks.d || ks.arrowright) { fx += cy; fz -= sy; }

        if (fx || fz) { CL3.gtx += fx * sp; CL3.gtz += fz * sp; } if (ks.q) CL3.gyaw -= dt * 1.4; if (ks.e) CL3.gyaw += dt * 1.4; if (ks['+'] || ks['=']) CL3.gdist *= Math.exp(-dt * 1.2); if (ks['-']) CL3.gdist *= Math.exp(dt * 1.2); if (fx || fz || ks.q || ks.e || ks['+'] || ks['='] || ks['-']) clClampCam();

    }

    /* ---------- miniaturas: cada peça desenhada uma vez num alvo pequeno, viram figurinhas na lista ---------- */

    function clThumbs(done) {
        const THREE = clTh(), r = CL3.r; if (!r || CL3.thumbBusy) return;
        try {
            if (!CL3._thLoaded) {
                CL3._thLoaded = true;
                const cached = JSON.parse(localStorage.getItem('cestille_cl_th_v32') || '{}');
                Object.assign(CL3.thumb, cached);
            }
        } catch (e) {}
        const list = CLD.PIECES.filter(p => !p.hid && p.parts && !CL3.thumb[p.id + ':0']);
        if (!list.length) { if (done) done(); return; }
        // Prioriza itens da categoria ativa no momento
        const curCat = (typeof CL !== 'undefined' && CL.cat) ? CL.cat : 'prod';
        list.sort((a, b) => (a.cat === curCat ? -1 : 1) - (b.cat === curCat ? -1 : 1));

        CL3.thumbBusy = true; const S = 96, rt = new THREE.WebGLRenderTarget(S, S, { depthBuffer: true });
        rt.texture.encoding = THREE.sRGBEncoding; const sc = new THREE.Scene(), cam = new THREE.PerspectiveCamera(30, 1, 0.1, 60), buf = new Uint8Array(S * S * 4), cv = document.createElement('canvas'); cv.width = cv.height = S; const cx = cv.getContext('2d'), img = cx.createImageData(S, S);
        sc.add(new THREE.HemisphereLight(0xcfe0ff, 0x3a4256, 1.2));
        const dl = new THREE.DirectionalLight(0xffffff, 1.3); dl.position.set(-3, 5, 4); sc.add(dl);
        const fill = new THREE.DirectionalLight(0x7dd3fc, 0.5); fill.position.set(4, 3, -3); sc.add(fill);
        const gm = new THREE.Group(); sc.add(gm);
        const tS = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.8, metalness: 0.06 }), tG = new THREE.MeshBasicMaterial({ vertexColors: true }); tS.onBeforeCompile = CL3.mS.onBeforeCompile; { const og = CL3.mG.onBeforeCompile; tG.onBeforeCompile = sh => { og(sh); sh.uniforms.uNight = { value: 1 }; }; } const tEnd = () => { tS.dispose(); tG.dispose(); };

        const saveCache = () => {
            try { localStorage.setItem('cestille_cl_th_v32', JSON.stringify(CL3.thumb)); } catch (e) {}
        };

        const schedule = fn => {
            if (typeof requestIdleCallback === 'function') {
                requestIdleCallback(() => setTimeout(fn, 16), { timeout: 180 });
            } else {
                setTimeout(fn, 45);
            }
        };

        const step = () => {
            if (!CL.on || !CL3.r) { rt.dispose(); tEnd(); CL3.thumbBusy = false; return; }
            const p = list.shift();
            if (!p) { rt.dispose(); tEnd(); CL3.thumbBusy = false; saveCache(); if (done) done(); return; }
            try {
                gm.clear();
                const cdef = (typeof CLM_CUSTOM_HANDLERS !== 'undefined') && CLM_CUSTOM_HANDLERS[p.id];
                const thDef = (typeof CLM_DEF !== 'undefined') && CLM_DEF[p.id], thReq = cdef ? cdef.req : (thDef && !thDef.roam && !thDef.skin ? thDef.f : '');
                if (cdef && typeof cdef.preload === 'function') cdef.preload(); if (thReq && !cdef) { try { clModelLoad(thDef.f); } catch (e) {} }
                if (thReq) {   /* peça com modelo 3D: espera o arquivo (e os acessórios) carregarem; nunca guarda o desenho antigo no lugar */
                    const miss = f => f && !(CLM.tpl[f] && CLM.tpl[f].gl), w = p._waitCount || 0;
                    if (miss(thReq) || (cdef && w < 120 && (cdef.files || []).some(miss))) { p._waitCount = w + 1; if (p._waitCount < 300) list.push(p); schedule(step); return; }
                }
                if (cdef && typeof cdef.assemble === 'function') {
                    if (typeof cdef.preload === 'function') cdef.preload();
                    if (cdef.req && (!CLM.tpl[cdef.req] || !CLM.tpl[cdef.req].gl)) {
                        p._waitCount = (p._waitCount || 0) + 1;
                        if (p._waitCount < 14) {
                            list.push(p);
                            schedule(step);
                            return;
                        }
                    }
                    const sc = (cdef && cdef.scale) ? cdef.scale : 2.0; gm.scale.set(sc, sc, sc); cdef.assemble(gm, 1, 0);
                } else if (typeof CLM_DEF !== 'undefined' && CLM_DEF[p.id] && CLM.tpl && CLM.tpl[CLM_DEF[p.id].f]) {
                    const def = CLM_DEF[p.id];
                    const root = def.skin ? THREE.SkeletonUtils.clone(CLM.tpl[def.f].gl.scene) : CLM.tpl[def.f].gl.scene.clone(true);
                    gm.add(root);
                } else {
                    const g = clGeoFor(p.id, 0), ms = [];
                    if (g.solid) ms.push(new THREE.Mesh(g.solid, tS));
                    if (g.glow) ms.push(new THREE.Mesh(g.glow, tG));
                    ms.forEach(m => gm.add(m));
                }
                const cdefSc = (typeof CLM_CUSTOM_HANDLERS !== 'undefined' && CLM_CUSTOM_HANDLERS[p.id] && CLM_CUSTOM_HANDLERS[p.id].scale) || 1;
                const rad = (Math.max(p.fp[0], p.fp[1]) * 0.9 + 0.5) * (cdefSc > 1 ? 1.4 : 1.0);
                cam.position.set(rad * 1.7, rad * 1.5 + 0.4, rad * 1.9);
                cam.lookAt(0, Math.min(1.1, rad * 0.3), 0);
                const tm0 = r.toneMapping; r.toneMapping = THREE.NoToneMapping;
                r.setRenderTarget(rt); r.setClearColor(0x000000, 0); r.clear();
                r.render(sc, cam);
                r.readRenderTargetPixels(rt, 0, 0, S, S, buf);
                r.setRenderTarget(null); r.toneMapping = tm0;
                for (let y = 0; y < S; y++) img.data.set(buf.subarray((S - 1 - y) * S * 4, (S - y) * S * 4), y * S * 4);
                cx.putImageData(img, 0, 0);
                CL3.thumb[p.id + ':0'] = cv.toDataURL('image/png');
                try { clUiThumb(p.id); } catch (e) {}
            } catch (e) { CL3.thumb[p.id + ':0'] = ''; }

            if (list.length % 4 === 0) saveCache();
            schedule(step);
        };
        schedule(step);
    }

    /* ---------- abrir, desenhar e fechar ---------- */

    function clRenderInit() {

        const THREE = clTh(); let r = null; CL3.err = '';

        /* uma tela (canvas) nova a cada abertura: uma tela cuja imagem 3D foi encerrada não aceita outra; e, se o aparelho recusar as opções boas, tenta as mais simples */

        const fast = IPAD || LITE || CL_TOUCH();
        for (const o of [{ antialias: !fast, powerPreference: fast ? 'default' : 'high-performance' }, { antialias: false, powerPreference: 'default' }, { antialias: false, powerPreference: 'low-power' }]) {

            const old = CL3.root.querySelector('canvas'), cv0 = old.cloneNode(false); old.replaceWith(cv0); CL3.cv = cv0; o.canvas = cv0;

            try { r = new THREE.WebGLRenderer(o); break; } catch (e) { r = null; CL3.err = String(e && e.message || e).slice(0, 120); }

        }

        CL3.r = r; if (!r) return false; r.setPixelRatio(IPAD ? 1 : (clPerfMode() === 'auto' && CL_TOUCH() ? Math.min(1.05, clPerfRatio()) : clPerfRatio()));   /* no celular, começa perto de 1 pixel por pixel da tela para poupar a GPU; sobe se houver margem */ CL3.fpsCap = !IPAD && clPerfMode() === 'minimo'; r.outputEncoding = THREE.sRGBEncoding; r.shadowMap.enabled = !(IPAD || LITE || CL_TOUCH()); r.shadowMap.type = THREE.PCFSoftShadowMap;

        CL3.dist = CL3.gdist = clamp(34, 7, 50 + clS().H * 2.6); CL3.debSig = ''; CL3.yaw = CL3.gyaw = 0.6; CL3.pit = CL3.gpit = 0.72; CL3.tx = CL3.tz = CL3.gtx = CL3.gtz = 0; CL3.outerGeo = null;

        clSceneBuild(); clTerrain(); clRebuildInst(); clColSync(); clClampCam(); clLookInit();

        const cv = CL3.cv; cv.addEventListener('webglcontextlost', e => { e.preventDefault(); }); cv.addEventListener('webglcontextrestored', () => { try { if (CL3.r) { CL3.w = 0; CL3.need = true; } } catch (er) {} }); cv.addEventListener('pointerdown', clPtrDown); cv.addEventListener('pointermove', clPtrMove); cv.addEventListener('pointerup', clPtrUp); cv.addEventListener('pointercancel', clPtrUp); cv.addEventListener('wheel', clWheel, { passive: false }); cv.addEventListener('gesturestart', clGesStart, { passive: false }); cv.addEventListener('gesturechange', clGesChange, { passive: false }); cv.addEventListener('gestureend', clGesEnd, { passive: false }); cv.addEventListener('contextmenu', e => e.preventDefault());

        window.addEventListener('keydown', clKeys, true); window.addEventListener('keyup', clKeys, true); window.addEventListener('pointerdown', clAct, true); window.addEventListener('wheel', clAct, true); window.addEventListener('keydown', clAct, true); window.addEventListener('pointermove', clActMove, true); try { CL3.calmOff = localStorage.getItem('cestille_cl_calm') === '0'; } catch (e) { CL3.calmOff = false; } return true;

    }

    function clRenderFree() {

        const cv = CL3.cv; if (cv) { cv.removeEventListener('pointerdown', clPtrDown); cv.removeEventListener('pointermove', clPtrMove); cv.removeEventListener('pointerup', clPtrUp); cv.removeEventListener('pointercancel', clPtrUp); cv.removeEventListener('wheel', clWheel); cv.removeEventListener('gesturestart', clGesStart); cv.removeEventListener('gesturechange', clGesChange); cv.removeEventListener('gestureend', clGesEnd); }

        window.removeEventListener('keydown', clKeys, true); window.removeEventListener('keyup', clKeys, true); window.removeEventListener('pointerdown', clAct, true); window.removeEventListener('wheel', clAct, true); window.removeEventListener('keydown', clAct, true); window.removeEventListener('pointermove', clActMove, true);

        if (CL3.sc) CL3.sc.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { if (m.map && m.map !== T.glow) m.map.dispose(); if (m.emissiveMap) m.emissiveMap.dispose(); m.dispose(); }); });

        Object.keys(CL3.geo).forEach(k => { const g = CL3.geo[k]; if (g.solid) g.solid.dispose(); if (g.glow) g.glow.dispose(); if (g.glass) g.glass.dispose(); }); if (CL3.outerGeo && CL3.outerGeo.glow) CL3.outerGeo.glow.dispose(); if (CL3.grain) CL3.grain.dispose(); CL3.geo = {}; CL3.inst = []; CL3.debInst = []; CL3.debSig = ''; CL3.smoke = null; CL3.lampFx = null; CL3.drops = null; CL3.toolW = CL3.toolH = null; CL3.lamps = []; CL3.lampSlots = []; CL3.floorFog = CL3.hemi = CL3.amb = CL3.stars = null; CL3.hwBats = null; CL3.hwBatM = []; CL3.hwMist = null; CL3.wt = null; CL3.hwMeshes = []; if (CL3.colMeshes) { Object.keys(CL3.colMeshes).forEach(k => { const m = CL3.colMeshes[k]; if (m && m.parent) m.parent.remove(m); }); CL3.colMeshes = null; } if (CL3.colLimbs) { Object.keys(CL3.colLimbs).forEach(k => { const L = CL3.colLimbs[k]; if (L) ['body', 'lL', 'lR', 'aL', 'aR'].forEach(p => { if (L[p] && L[p].parent) L[p].parent.remove(L[p]); }); }); CL3.colLimbs = null; } CL3.col = null; CL3.agents = []; CL3.ghostKey = ''; CL3.ptr.clear(); CL3.outerGeo = null; CL3.outer = null; CL3.floor = null;

        clLookFree(); if (CL3.r) { try { CL3.r.dispose(); CL3.r.forceContextLoss(); } catch (e) {} } CL3.r = CL3.sc = CL3.cam = CL3.grp = CL3.ground = CL3.ghost = CL3.selM = CL3.gridL = null; CL3.thumbBusy = false;

    }

    function clSig() { const s = clS(); return s.pcs.length + ':' + (CL.hold ? CL.hold.idx : -9) + ':' + s.pcs.reduce((a, p) => a + p[1] * 7 + p[2] * 3 + p[3] * 5 + p[5] * 11 + p[4], 0); }

    /* desempenho escolhido no menu de configurações: auto (liga o modo leve sozinho se travar), alta, leve, minimo */
    function clLowFlag() { try { const v = +localStorage.getItem('cestille_cl_low'); if (v && Date.now() - v < 600000) return true; localStorage.removeItem('cestille_cl_low'); } catch (e) {} return false; }   /* o modo leve automático vale só por 10 minutos (antes ficava para sempre e tirava as sombras de quem teve uma queda de quadros passageira) */
    function clPerfMode() { try { if (!localStorage.getItem('cestille_cl_perf_r2')) { localStorage.setItem('cestille_cl_perf_r2', '1'); const o = localStorage.getItem('cestille_cl_perf'); if (o === 'minimo' || o === 'leve') localStorage.removeItem('cestille_cl_perf'); }   /* uma vez: quem ficou preso em mínimo/leve por causa do desempenho antigo volta ao automático, que agora é bem mais leve */
            const v = localStorage.getItem('cestille_cl_perf'); return v === 'alta' || v === 'leve' || v === 'minimo' ? v : 'auto'; } catch (e) { return 'auto'; } }
    function clPerfRatio() { if (IPAD) return 1; const m = clPerfMode(), d = window.devicePixelRatio || 1; return m === 'minimo' ? Math.min(d, 0.7) : m === 'leve' ? Math.min(d, 0.9) : Math.min(d, LITE ? 1 : m === 'alta' ? (CL_TOUCH() ? 2 : 2) : (CL_TOUCH() ? 1.05 : 1.5)); }   /* iPad: 1 pixel por pixel da tela; celular prioriza fluidez no automático */
    function clPerfSet(m) {
        try { localStorage.setItem('cestille_cl_perf', m); if (m === 'alta' || m === 'auto') localStorage.removeItem('cestille_cl_low'); } catch (e) {}
        CL3.fpsCap = m === 'minimo'; CL3.slowT = 0;
        if (CL3.r) { try { CL3.r.setPixelRatio(clPerfRatio()); CL3.w = 0; } catch (e) {} }
        if (m === 'leve' || m === 'minimo') { try { clLowQuality(); } catch (e) {} return 'Aplicado agora.'; }
        return CL3.lowq ? 'Atualize a página para voltar à qualidade completa.' : 'Aplicado agora.';
    }
    function clLowQuality() {   /* aparelho sem fôlego: desliga pós-processamento, sombras e criaturas para a colônia ficar fluida */

        if (CL3.lowq) return; CL3.lowq = true; try { localStorage.setItem('cestille_cl_low', String(Date.now())); } catch (e) {}

        try { if (CL3.cp) { CL3.cp.renderTarget1.dispose(); CL3.cp.renderTarget2.dispose(); } } catch (e) {} CL3.cp = null; if (CL3.uLin) CL3.uLin.value = 0; if (CL_TOUCH()) { if (CL3.r) CL3.r.shadowMap.enabled = false; if (CL3.sun) CL3.sun.castShadow = false; if (CL3.uQ) CL3.uQ.value = 0; }   /* no computador o modo leve mantém as sombras (são o que dá o visual); só celular e iPad as desligam */

        [CL3.mS, CL3.mC].forEach(m => { if (m) m.needsUpdate = true; }); try { clMsg('Modo leve ligado: a colônia fica mais fluida neste aparelho.'); } catch (e) {}

    }

    function clAct() { CL3.actT = performance.now(); }
    function clActMove(e) { if (e.buttons) CL3.actT = performance.now(); }
    function colonyFrame(t, dt) {   /* na visita: troca por um quadro os dados guardados pela colônia visitada e devolve os seus no fim */

        { const nw = performance.now(); if (CL3.pn) { const d = Math.min(0.5, (nw - CL3.pn) / 1000); CL3.fpsA = CL3.fpsA ? CL3.fpsA * 0.93 + d * 0.07 : d; CL3.slowT = (CL3.slowT || 0) + (CL3.fpsA > 0.05 ? d : -d * 2); if (CL3.slowT < 0) CL3.slowT = 0; if (!IPAD && !CL3.lowq && CL3.slowT > 3 && clPerfMode() === 'auto' && nw > (CL3.lowGrace || 0)) clLowQuality();
            if (!IPAD && clPerfMode() === 'auto' && CL3.r && CL3.fpsA) { const cap = clPerfRatio(), cur = CL3.r.getPixelRatio(); CL3.dpT = (CL3.dpT || 0) + d; if (CL3.fpsA > 0.024 && cur > (CL_TOUCH() ? 0.85 : 0.6) && CL3.dpT > 1.0) { CL3.dpT = 0; try { CL3.r.setPixelRatio(Math.max(CL_TOUCH() ? 0.85 : 0.6, cur * 0.88)); CL3.w = 0; } catch (e) {} } else if (CL3.fpsA < 0.0175 && cur < cap - 0.02 && CL3.dpT > 8) { CL3.dpT = 0; try { CL3.r.setPixelRatio(Math.min(cap, cur * 1.08)); CL3.w = 0; } catch (e) {} } else if (CL3.fpsA >= 0.0175 && CL3.fpsA <= 0.024) CL3.dpT = Math.min(CL3.dpT, 0.5);
                /* não segura nem 45 fps mesmo na resolução mínima: trava em 30 certinhos (quadros parelhos parecem mais lisos que 35-50 oscilando); a cada 30 s testa se já dá para voltar. No iPad isso não roda: a resolução fica em 1 e o alvo é 60 */
                if (CL3.autoCap) { if (nw > CL3.autoCapEnd) { CL3.autoCap = false; CL3.acS = 0; } } else if (cur <= 0.66 && CL3.fpsA > 0.022 && CL3.rafDt < 0.026) { CL3.acS = (CL3.acS || 0) + d; if (CL3.acS > 3) { CL3.autoCap = true; CL3.autoCapEnd = nw + 30000; CL3.acS = 0; } } else CL3.acS = Math.max(0, (CL3.acS || 0) - d); } } CL3.pn = nw; }

        /* cena parada (sem toque, tecla, câmera andando, peça na mão ou cinema há mais de 1,5 s): desenha 1 quadro a cada 2 (30/s) e junta o tempo, então nada fica mais lento. Mexeu em algo, volta na hora aos quadros cheios. Desligar: localStorage cestille_cl_calm = 0. No iPad não pula quadro: o pulo aparecia como travada */
        CL3.rafDt = CL3.rafDt ? CL3.rafDt * 0.97 + Math.min(dt, 0.2) * 0.03 : Math.min(dt, 0.2);   /* intervalo real da tela: no modo de economia do iPhone ela já roda a 30 Hz, e pular quadros de novo dava 15 fps */
        if (!IPAD && (((CL3.fpsCap || CL3.autoCap) && CL3.rafDt < 0.026) || (!CL3.calmOff && !CL3.animBusy && !CL.visit && !CL.hold && !CL.tool && !CS.on && !CL3.need && !CL3.needT && performance.now() - (CL3.actT || 0) > 1500 && !(CL.keys && Object.keys(CL.keys).length) && Math.abs(CL3.gyaw - CL3.yaw) + Math.abs(CL3.gpit - CL3.pit) + Math.abs(CL3.gdist - CL3.dist) + Math.abs(CL3.gtx - CL3.tx) + Math.abs(CL3.gtz - CL3.tz) < 0.02))) {
            CL3.calmSkip = !CL3.calmSkip; if (CL3.calmSkip) { CL3.calmAcc = (CL3.calmAcc || 0) + dt; return; } dt += CL3.calmAcc || 0; CL3.calmAcc = 0;
        } else { CL3.calmSkip = false; CL3.calmAcc = 0; }

        try { if ((ZOO.modal === 'book' && (!ZOO.bk3d || !ZOO.bk3d.closing)) || ZOO.modal === 'colony-arena' || ZOO.modal === 'hatch-ritual' || ZOO.modal === 'breed' || ZOO.modal === 'buy' || ZOO.modal === 'bt3' || ZOO.modal === 'colony-war') { CL3.tickT += dt; if (CL3.tickT >= 1) { CL3.tickT = 0; try { clTick(); } catch (e2) {} try { clActStep(Date.now()); } catch (e2) {} } return; } } catch (e) {}   /* sem desenhar a colônia, mas o relógio do jogo (ovos, crescimento, descanso) NÃO pode parar: antes ele congelava com a Arena aberta e depois pulava */   /* Grimório ou modal aberto cobre a tela toda: não desenha a colônia por trás (metade do trabalho da GPU) */
        if (!CL.visit) { clFrameBody(t, dt); return; }

        const real = {}; CL_SW.forEach(k => { real[k] = CL[k]; CL[k] = CL.vc[k]; }); CL.vRen = true;

        const tF0 = performance.now(); try { clFrameBody(t, dt); } finally { CL3.msF = performance.now() - tF0; CL_SW.forEach(k => { CL.vc[k] = CL[k]; CL[k] = real[k]; }); CL.vRen = false; }

    }

    function clFrameBody(t, dt) {

        const r = CL3.r; if (!r || !CL3.sc) return; CL3.dt = dt; CL3.t += dt; CL3.uTime.value = CL3.t;
        const fullModal = (typeof ZOO !== 'undefined' && (ZOO.modal === 'book' || ZOO.modal === 'hatch-ritual')) || (typeof ZBT !== 'undefined' && ZBT.on);
        if (fullModal) {
            CL3.tickT += dt; if (CL3.tickT >= 1) { CL3.tickT = 0; clTick(); try { clActStep(Date.now()); } catch (e) {} try { clUiTick(); } catch (e) {} }
            return;
        }
        { const want = !CL3.cp && CL3.satPref !== false && !CL3.satShader;   /* sem pós-processamento (modo leve ou automático que ligou o leve) o filtro de cor do canvas faz a saturação */ if (CL3.nocp !== want) { CL3.nocp = want; try { CL.root.classList.toggle('cl-nocp', want); } catch (e) {} } } const root = CL3.root, w = root.clientWidth, h = root.clientHeight;

        if (Math.abs(w - CL3.w) > 2 || Math.abs(h - CL3.h) > 2) { CL3.w = w; CL3.h = h; r.setSize(w, h, false); CL3.cam.aspect = w / Math.max(1, h); CL3.cam.updateProjectionMatrix(); clLookSize(w, h); }

        if (CL3.needT || CL3.H !== clS().H) { CL3.H = clS().H; clTerrain(); clClampCam(); } { const sg = clSig(); if (CL3.need || sg !== CL.pcsSig) { CL.pcsSig = sg; clRebuildInst(); clColSync(); } } { const d0 = clS(), sg2 = d0.seed + ':' + d0.clr.length + ':' + d0.H; if (sg2 !== CL3.debSig) { CL3.debSig = sg2; clRebuildDeb(); } }

        clProf('fumaça', () => clSmokeStep(dt)); clProf('vida', () => clLifeStep(dt)); clProf('núcleo', () => clNucModelStep(dt, CL3.t)); clProf('evolução', () => clUpgradeFXStep(dt)); clProf('modelos', () => clModelStep(dt, CL3.t)); try { clProf('plantas', () => clFarmStep(dt, CL3.t)); } catch (e) {} try { clProf('moinho', () => clMoinhoFxStep(dt, CL3.t)); } catch (e) {} try { clEvFxStep(dt, CL3.t); } catch (e) { if (!window.__zerr2) { window.__zerr2 = e; try { console.warn('eventos', e); } catch (e2) {} } } try { clProf('dragões', () => clBichosStep(dt, CL3.t)); } catch (e) { if (!window.__zerr) { window.__zerr = e; try { console.warn('bichos', e); } catch (e2) {} } } try { clProf('fogo', () => clFireStep(dt, CL3.t)); } catch (e) {} clProf('água', () => clWaterStep(dt, CL3.t)); clProf('colheita', () => clColStep(dt, CL3.t)); if (CL3.hwMist) clHwStep(dt, CL3.t); if (CL3.nucTier !== clNucTier(clS().nuc)) CL3.need = true; clStoryStep(dt, CL3.t); clKeyMove(dt); clCamSet(); clStoryPost(); { const L = CL3.sun; if (L && CL3.sunV) {   /* a caixa de sombra acompanha a câmera em passos do tamanho de 1 pixel da sombra: sem isso as bordas das sombras "andam" (faixas de luz rastejando) quando a câmera para */
            const d = CL3.sunV, rl = Math.hypot(d.z, d.x) || 1, rx = d.z / rl, rz = -d.x / rl, ux = rz * d.y, uy = -rz * d.x + rx * d.z, uz = -rx * d.y, tex = 2 * L.shadow.camera.right / L.shadow.mapSize.x, px = CL3.tx * rx + CL3.tz * rz, py = CL3.tx * ux + CL3.tz * uz, sx = Math.round(px / tex) * tex - px, sy = Math.round(py / tex) * tex - py;
            const ax = CL3.tx + rx * sx + ux * sy, ay = uy * sy, az = CL3.tz + rz * sx + uz * sy;
            L.target.position.set(ax, ay, az); L.position.set(ax + d.x * 80, ay + d.y * 80, az + d.z * 80); L.target.updateMatrixWorld(); } } clGhostSet(); clGhostPlace(); clSelPlace();

        if (CL3.gridL) CL3.gridL.visible = !!CL.hold;

        const pu = 0.5 + 0.5 * Math.sin(CL3.t * 2.2); if (CL3.mBorder) { if (!CL3.borderC) CL3.borderC = new (clTh().Color)(clStarPal()[0]); CL3.mBorder.color.copy(CL3.borderC).multiplyScalar(0.75 + 0.35 * pu); }

        if (CL3.selM && CL3.selM.visible) CL3.selM.userData.fill.material.opacity = 0.2 + 0.18 * pu;

        CL3.dustK = (CL3.dustK || 0) + 1; if (CL3.dustK % 2 === 0) { const d = CL3.dust.geometry.attributes.position.array; for (let i = 0; i < d.length; i += 3) { d[i + 1] += dt * 1.0; if (d[i + 1] > 18) d[i + 1] = -0.4; d[i] += Math.sin(CL3.t * 0.4 + i) * dt * 0.24; } CL3.dust.geometry.attributes.position.needsUpdate = true; }

        CL3.tickT += dt; if (CL3.tickT >= 1) { CL3.tickT = 0; clTick(); try { clActStep(Date.now()); } catch (e) {} try { clUiTick(); } catch (e) {} }

        clLookRender(); try { clUiBubbles(); clUiCandies(); clUiZz(); } catch (e) {}

    }

/* ===== cortex/36jb-colony-life.js: a Colônia viva: dia e noite, postes que os moradores acendem e apagam, o Núcleo que ganha animações a cada fase e os moradores usando as construções (entrar em casa, regar, sentar, trabalhar) ===== */
    const clSmooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
    /* ---------- dia e noite (pelo relógio do aparelho; o botão do relógio no topo fixa dia ou noite) ---------- */
    function clTimeNow() { const d = new Date(); return d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600; }
    function clDayTarget() {
        const s = clS(); if (!s._goldenDef) { s._goldenDef = 1; s.tm = 'golden'; } const mode = s.tm || 'golden'; let h = clTimeNow(); if (mode === 'golden') h = 17.9; else if (mode === 'day') h = 12.5; else if (mode === 'night') h = 0.5;   /* fim de tarde é o padrão da colônia (sol baixo e dourado), como no protótipo aprovado; uma vez só, a colônia passa para ele */
        if (CL3.cineH != null) h = CL3.cineH;
        const elev = Math.sin((h - 6) / 24 * 6.2832); return { h, elev, n: 1 - clSmooth(-0.2, 0.14, elev) };
    }
    function clDayStep(dt) {
        const THREE = clTh(), sc = CL3.sc; if (!sc) return; const d = clDayTarget(), hw = clEvActive('halloween');
        if (CL3.dayN == null) CL3.dayN = d.n; else CL3.dayN += (d.n - CL3.dayN) * Math.min(1, dt * 1.4); const n = Math.min(1, CL3.dayN + (CL3.cineStorm || 0) * 0.6); CL3.uNight.value = n;
        const K = CL3.dk || (CL3.dk = { a: new THREE.Color(), b: new THREE.Color(), c: new THREE.Color() }), du = 4 * n * (1 - n), hs = d.elev >= 0 ? d.h : (d.h + 12) % 24, ang = clamp((hs - 6) / 12, 0, 1) * Math.PI;
        if (CL3.sunV) CL3.sunV.set(-Math.cos(ang) * 0.9, 0.22 + Math.sin(ang) * 0.75, -0.35).normalize();
        const L = CL3.sun; if (L) { K.a.set(hw ? 0xffb878 : 0xffd9a6); K.b.set(hw ? 0x9a7bff : 0x8aa4ff); K.c.set(0xff8a4a); L.color.copy(K.a).lerp(K.b, n).lerp(K.c, du * 0.55); L.intensity = (1.45 - 0.95 * n) * (1 - 0.25 * du) * (CL3.lk ? CL3.lk.sun : 1); }
        if (CL3.hemi) { K.a.set(hw ? 0xc8a0ff : 0xd4e8ff); K.b.set(0x5a6fb0); CL3.hemi.color.copy(K.a).lerp(K.b, n); K.c.set(hw ? 0x4a2a7a : 0x5f78d8); CL3.hemi.groundColor.copy(K.c).multiplyScalar(0.55 - 0.3 * n); CL3.hemi.intensity = (hw ? 0.62 : 0.9) * (1 - 0.5 * n) * (CL3.lk ? CL3.lk.hemi : 1); }
        if (CL3.amb) CL3.amb.intensity = (hw ? 0.14 : 0.18) * (1 - 0.35 * n) * (CL3.lk ? CL3.lk.amb : 1);
        K.a.set(hw ? 0x7a48ae : 0xa9cdee); K.b.set(hw ? 0x1c0c34 : 0x0f1a36); K.c.set(hw ? 0xc06a8a : 0xf0a070); sc.background.copy(K.a).lerp(K.b, n).lerp(K.c, du * 0.5);   /* cor do horizonte: o céu, a neblina e o fundo da água usam a mesma */
        if (CL3.skyU) { const S = CL3.skyU; S.uHor.value.copy(sc.background); K.a.set(hw ? 0x2a1050 : 0x3a74c4); K.b.set(hw ? 0x07020f : 0x04060e); S.uZen.value.copy(K.a).lerp(K.b, n).lerp(K.c.set(hw ? 0x5a3a90 : 0x5a6fb8), du * 0.4); S.uCl.value.set(hw ? 0xb08ad8 : 0xffffff).lerp(K.b.set(hw ? 0x3a2058 : 0x303c58), n).lerp(K.c.set(0xffb890), du * 0.5); S.uCa.value = 1 - n * 0.9; if (CL3.sunV) S.uSun.value.copy(CL3.sunV).normalize(); S.uSunC.value.set(hw ? 0xffc890 : 0xfff0d0).lerp(K.c.set(0xff9a60), du * 0.7); }
        if (CL3.floorFog) CL3.floorFog.value.copy(sc.background); if (sc.fog) sc.fog.color.copy(sc.background);
        if (CL3.stars) CL3.stars.material.opacity = 0.25 + 0.65 * n;
        if (window.__proWant && !hw) {   /* LOOK DO PROTÓTIPO (fim de tarde): sol laranja baixo, céu e neblina alaranjados, luz do céu quente, sem estrelas */
            const PL = window.__proL || [1.45, 0.42, 0.2], Sx = CL3.skyU;   /* as luzes do protótipo, no mesmo three (r147) e sem conversão sRGB */
            if (CL3.sunV) CL3.sunV.set(-16, 4.2, 8).normalize();
            if (L) { L.color.set(0xff8a3a); L.intensity = PL[0]; }   /* as luzes do protótipo (three novo) valem π vezes menos neste three: 1.45, 0.42 e 0.2 divididos por π */
            if (CL3.hemi) { CL3.hemi.color.set(0xffc898); CL3.hemi.groundColor.set(0x6d7038); CL3.hemi.intensity = PL[1]; }
            if (CL3.amb) { CL3.amb.color.set(0xffc49a); CL3.amb.intensity = PL[2]; }
            sc.background.set(0xf2a56a);
            if (Sx) { Sx.uHor.value.set(0xf3bc8e); Sx.uZen.value.set(0xe8996a); Sx.uCl.value.set(0xffe2c2); Sx.uSunC.value.set(0xff9a60); Sx.uCa.value = 0.85; if (CL3.sunV) Sx.uSun.value.copy(CL3.sunV).normalize(); }
            if (CL3.floorFog) CL3.floorFog.value.set(0xf3bc8e); if (sc.fog) sc.fog.color.set(0xf3bc8e);
            if (CL3.stars) CL3.stars.material.opacity = 0;
        }
        if (CL3.cineFlash > 0 && CL3.hemi) { CL3.hemi.intensity += CL3.cineFlash * 3; if (CL3.amb) CL3.amb.intensity += CL3.cineFlash * 1.2; }
        CL3.clock = d;
    }
    /* ---------- postes: cada um tem o próprio estado; os moradores vão acender ao entardecer e apagar ao amanhecer ---------- */
    function clLampBuild(s) {
        const om = new Map((CL3.lamps || []).map(l => [l.x + ',' + l.z, l])), nn = (CL3.dayN || 0) > 0.5 ? 1 : 0; CL3.lamps = [];
        s.pcs.forEach((p, i) => { const t = CLT[p[0]]; if (!t || !t.lamp) return; const f = clFp(t, p[3]), x = p[1] + f[0] / 2, z = p[2] + f[1] / 2, o = om.get(x + ',' + z) || { x, z, lit: nn, tgt: nn, claim: null, mis: 0, flash: 0 }; o.pi = i; o.claim = null; CL3.lamps.push(o); });
    }
    function clLampFxInit() {
        const THREE = clTh(), c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 2, 32, 32, 32); g.addColorStop(0, 'rgba(255,214,140,0.95)'); g.addColorStop(0.4, 'rgba(255,170,70,0.35)'); g.addColorStop(1, 'rgba(255,140,40,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64);
        const tex = new THREE.CanvasTexture(c), fx = []; for (let i = 0; i < 24; i++) { const h = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); h.scale.set(2.6, 2.6, 1); h.visible = false; CL3.sc.add(h); const pl = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); pl.rotation.x = -Math.PI / 2; pl.position.y = 0.06; pl.visible = false; CL3.sc.add(pl); fx.push({ h, pl }); }
        CL3.lampFx = fx;
    }
    function clLampStep(dt) {
        const n = CL3.dayN || 0, want = n > 0.5 ? 1 : 0, A = CL3.lamps || []; const flag = new Set();
        A.forEach(l => { if (l.tgt !== want) { l.mis += dt; if (l.mis > 25 && !l.claim) { l.tgt = want; l.mis = 0; l.flash = 1; } } else l.mis = 0; l.lit += (l.tgt - l.lit) * Math.min(1, dt * 3.2); if (l.flash > 0) l.flash = Math.max(0, l.flash - dt * 2); });
        (CL3.lampSlots || []).forEach(sl => { sl.arr[sl.j] = sl.lamp.lit; flag.add(sl.attr); }); flag.forEach(a => { a.needsUpdate = true; });
        (CL3.lampFx || []).forEach((f, i) => { const l = A[i], on = l && l.lit > 0.03 || (l && l.flash > 0); f.h.visible = f.pl.visible = !!on; if (!on) return; const k = l.lit + l.flash * 0.8, fl = 0.92 + 0.08 * Math.sin(CL3.t * 7 + i * 2); f.h.position.set(l.x, 1.75, l.z); f.h.material.opacity = Math.min(1, 0.55 * k * fl); f.h.scale.setScalar(2.4 + l.flash * 2.2); f.pl.position.x = l.x; f.pl.position.z = l.z; f.pl.material.opacity = Math.min(0.9, 0.5 * l.lit * fl); });
    }
    /* ---------- o Núcleo: cada fase ganha mais peças animadas (satélites e anéis giram, cristais flutuam, chamas pulsam) ---------- */
    const clNucTier = n => clCoreOn() ? clCoreEra(n) + 1 : Math.min(5, Math.max(1, n));
    /* O Núcleo: um reator de fusão alienígena. Carcaça torneada de titânio, tubo de vidro com plasma subindo, bobinas em anéis de verdade, pilares afunilados nos cantos, prato emissor e pirâmide de obsidiana sobre um feixe.
       fase 1 semente · 2 pulso · 3 reator · 4 monólito · 5 portal estelar: cada uma mais alta e mais carregada de energia */
    function clNucParts(tier) {
        const PI = Math.PI, o = [], N = (k, s, p, c, g, r, an, al, ex) => Object.assign({ k, s, p, c, g: !!g, r: r || null, an: an || '', al: !!al }, ex || {});
        const GM = '#23272f', GD = '#15181e', TI = '#8794ab', GL = '#b8e8ff', OB3 = '#3a306c', VI = '#b05cff', TE = '#3dffd0', WH = '#ffffff';
        const B = (w, h, d, x, y, z, c, g, r, an, al) => o.push(N('b', [w, h, d], [x, y, z], c, g, r, an, al));
        const Cs = (w, h, x, y, z, c, g, r, an) => o.push(N('c', [w, h, w], [x, y, z], c, g, r, an, 0, { sm: 1 }));
        const Sp = (k, x, y, z, c, g, an) => o.push(N('s', [k, k, k], [x, y, z], c, g, null, an, 0, { sm: 1 }));
        const T = (D, tr, x, y, z, c, g, an) => o.push(N('t', [D, 2 * tr * D, D], [x, y, z], c, g, null, an, 0, { tr }));
        const Lt = (pr, x, y, z, c, g, an, al, gl) => o.push(N('l', [1, Math.max.apply(null, pr.map(p => p[1])), 1], [x, y, z], c, g, null, an, al, { pr, gl }));
        const ring = (n, r, y, mk, off) => { for (let i = 0; i < n; i++) { const a = i / n * 2 * PI + (off || 0); o.push(mk(Math.cos(a) * r, y, Math.sin(a) * r, a)); } };
        const bolt = (a, r0, y0, sg, c, L) => { let x = Math.cos(a) * r0, y = y0, z = Math.sin(a) * r0; for (let i = 0; i < 4; i++) { const th = sg * 0.22 + (i % 2 ? -0.85 : 0.85), dx = Math.cos(th) * Math.cos(a), dy = Math.sin(th), dz = Math.cos(th) * Math.sin(a); o.push(N('b', [L, 0.04, 0.04], [x + dx * L / 2, y + dy * L / 2 - 0.02, z + dz * L / 2], c, 1, [0, -a, th], 'p')); x += dx * L; y += dy * L; z += dz * L; } };
        const bead = (r, y, n, k, c, tilt, an) => { for (let i = 0; i < n; i++) { const a = i / n * 2 * PI; Sp(k, Math.cos(a) * r, y + Math.sin(a) * r * Math.sin(tilt) - k / 2, Math.sin(a) * r * Math.cos(tilt), c, 1, an); } };
        const Hc = [0, 2.8, 4.0, 5.4, 7.0, 8.8][tier], ph = 1.1 + 0.32 * tier, yb = 0.42;
        /* fundação: três placas de aço, fio de neon na borda, escadas e anel de luz */
        B(3.0, 0.22, 3.0, 0, 0, 0, GM); B(2.84, 0.06, 2.84, 0, 0.22, 0, TI); B(2.62, 0.14, 2.62, 0, 0.28, 0, GD);
        [-1, 1].forEach(s => { B(2.3, 0.03, 0.06, 0, 0.42, s * 1.14, 'T', 1, null, 'w'); B(0.06, 0.03, 2.3, s * 1.14, 0.42, 0, 'T', 1, null, 'w'); B(1.0, 0.08, 0.3, 0, 0.0, s * 1.62, GM); B(0.8, 0.07, 0.2, 0, 0.08, s * 1.57, TI); B(0.3, 0.08, 1.0, s * 1.62, 0.0, 0, GM); B(0.2, 0.07, 0.8, s * 1.57, 0.08, 0, TI); });
        T(2.2, 0.025, 0, 0.42, 0, VI, 1, 'p');
        /* carcaça do reator: perfil torneado em titânio, nervuras em anel e frisos de luz */
        Lt([[1.3, 0], [1.28, 0.08], [1.16, 0.26], [1.0, 0.5], [0.93, 0.8], [0.91, 1.05], [0.97, 1.12], [0.97, 1.2], [0.9, 1.22], [0.5, 1.22]], 0, yb, 0, TI, 0);
        [0.3, 0.62, 0.95].forEach((y, i) => { T(2.0 - i * 0.2, 0.035, 0, yb + y, 0, GM, 0); }); T(1.9, 0.02, 0, yb + 0.48, 0, 'T', 1, 'w'); T(1.78, 0.02, 0, yb + 0.8, 0, 'T', 1, 'w');
        ring(12, 0.88, yb + 1.24, (x, y, z) => N('s', [0.07, 0.07, 0.07], [x, y, z], TI, 0, null, '', 0, { sm: 1 }));
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dz]) => { const r = dx ? [0, 0, PI / 2] : [PI / 2, 0, 0]; o.push(N('c', [0.15, 0.7, 0.15], [dx * 1.35, yb + 0.3, dz * 1.35], GM, 0, r, '', 0, { sm: 1 })); T(0.3, 0.05, dx * 1.28, yb + 0.3, dz * 1.28, 'U', 1, 'p'); });
        /* pilares geradores afunilados: titânio torneado, anéis escuros, fendas de luz e cúpula de plasma */
        [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sz]) => {
            const x = sx * 1.2, z = sz * 1.2;
            Lt([[0.38, 0], [0.38, 0.08], [0.32, 0.16], [0.27, 0.4], [0.25, ph - 0.2], [0.31, ph - 0.12], [0.31, ph], [0.0, ph]], x, yb, z, TI, 0);
            [0.3, 0.55, 0.8].forEach(f => T(0.62 - f * 0.18, 0.03, x, yb + ph * f, z, GM, 0));
            B(0.04, ph * 0.55, 0.12, x - sx * 0.3, yb + 0.25, z, 'T', 1, null, 'w'); B(0.12, ph * 0.55, 0.04, x, yb + 0.25, z - sz * 0.3, 'T', 1, null, 'w');
            o.push(N('d', [0.46, 0.26, 0.46], [x, yb + ph, z], 'T', 1, null, 'p'));
        });
        /* tubo de vidro com plasma que sobe e miolo branco, entre nervuras, com flanges parafusadas */
        const y0 = yb + 1.22;
        o.push(N('c', [0.64, Hc, 0.64], [0, y0, 0], TE, 1, null, 'f', 0, { sm: 1 }), N('c', [0.26, Hc, 0.26], [0, y0, 0], WH, 1, null, 'f', 0, { sm: 1 }));
        Lt([[0.5, 0], [0.5, Hc]], 0, y0, 0, GL, 0, '', 0, 1);
        ring(6, 0.55, y0, (x, y, z) => N('c', [0.07, Hc, 0.07], [x, y, z], GM, 0, null, '', 0, { sm: 1 }), 0.5);
        const FL = [[0.7, 0], [0.7, 0.1], [0.62, 0.15], [0.56, 0.15], [0.56, 0.1], [0.0, 0.1]]; Lt(FL, 0, y0 - 0.02, 0, TI, 0); Lt([[0.7, 0], [0.7, 0.12], [0.6, 0.18], [0.0, 0.18]], 0, y0 + Hc - 0.05, 0, TI, 0);
        T(1.4, 0.03, 0, y0 + Hc + 0.14, 0, 'T', 1, 'p'); ring(10, 0.6, y0 + Hc + 0.12, (x, y, z) => N('s', [0.06, 0.06, 0.06], [x, y, z], TI, 0, null, '', 0, { sm: 1 }));
        /* bobinas: anéis de titânio de verdade com anel de neon por dentro */
        const nr = [0, 2, 3, 5, 7, 9][tier], cc = ['T', VI, 'U', TE];
        for (let k = 0; k < nr; k++) { const y = y0 + 0.5 + k * (Hc - 1.0) / Math.max(1, nr - 1), D = 1.5 + (k % 2) * 0.14; T(D, 0.085, 0, y, 0, TI, 0); T(D - 0.14, 0.03, 0, y + 0.03, 0, cc[k % 4], 1, 'w'); }
        const nb = [0, 3, 5, 7, 9, 12][tier]; for (let i = 0; i < nb; i++) bolt(i / nb * 2 * PI + 0.3, 0.95, y0 + 0.3 + ((i * 0.37) % 1) * (Hc - 0.7), i % 2 ? 1 : -1, i % 3 ? TE : VI, 0.3 + 0.05 * tier);
        const tp = y0 + Hc + 0.3;
        if (tier <= 2) {   /* cristal de energia */
            const cs = tier === 1 ? 1.0 : 1.35;
            o.push(N('p', [0.8 * cs, 0.75 * cs, 0.8 * cs], [0, tp + 0.75 * cs + 0.2, 0], 'T', 1, null, 'b'), N('p', [0.8 * cs, 0.75 * cs, 0.8 * cs], [0, tp + 0.2, 0], 'T', 1, [PI, 0, 0], 'b')); Sp(0.34 * cs, 0, tp + 0.2 + 0.58 * cs, 0, WH, 1, 'p');
            ring(tier === 1 ? 3 : 5, 1.1, tp + 0.2, (x, y, z) => N('p', [0.2, 0.32, 0.2], [x, y, z], 'U', 1, null, 'r'));
        } else {   /* emissor: prato torneado, anel de luz, pirâmide invertida de obsidiana e feixe para o céu */
            const R = 1.3 + 0.2 * tier, ps = [0, 0, 0, 1.4, 2.0, 2.8][tier], py = tp + 0.8 + (tier - 3) * 0.25;
            Lt([[0.0, 0], [0.4, 0.03], [0.8, 0.12], [R * 0.82, 0.28], [R, 0.5], [R, 0.56], [R * 0.8, 0.34], [0.75, 0.18], [0.4, 0.09], [0.0, 0.06]], 0, tp, 0, GM, 0); T(R * 1.9, 0.018, 0, tp + 0.52, 0, 'U', 1, 'p');
            o.push(N('p', [ps, ps * 1.05, ps], [0, py, 0], OB3, 0, [PI, 0, 0], 'b', 1), N('p', [ps * 1.03, 0.1, ps * 1.03], [0, py + ps * 1.05 - 0.02, 0], 'U', 1, [PI, 0, 0], 'p'));
            Cs(0.4, 0.8, 0, tp + 0.02, 0, WH, 1, null, 'f'); Cs(0.18 + 0.05 * tier, 2.4 + tier * 0.9, 0, py + ps * 1.05 + 0.1, 0, 'T', 1, null, 'f');
            ring(3 + tier, 1.45 + tier * 0.15, tp + 0.4, (x, y, z) => N('p', [0.22, 0.4, 0.22], [x, y + ((x * 7) % 1) * 0.5, z], 'U', 1, [PI, 0, 0], 'R'));
        }
        if (tier >= 3) [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sz]) => { Cs(0.08, 1.2 + tier * 0.3, sx * 1.2, yb + ph, sz * 1.2, GM); T(0.3, 0.025, sx * 1.2, yb + ph + 0.7, sz * 1.2, 'T', 1, 'p'); });
        if (tier >= 4) {
            bead(2.35, tp + 1.0, 34, 0.13, 'T', 0.5, 'r');
            ring(12, 1.78, 0.42, (x, y, z) => N('k', [0.22, 0.9, 0.22], [x, y, z], GM, 0), 0.26);
        }
        if (tier >= 5) {
            bead(3.1, tp + 2.0, 40, 0.15, VI, -0.55, 'R'); bead(2.1, tp + 3.2, 30, 0.13, TE, 0.0, 'r');
            ring(6, 3.2, 2.4, (x, y, z) => N('b', [0.26, 1.1, 0.26], [x, y, z], OB3, 0, [0.25, 0.4, 0.15], 'R', 1)); ring(6, 3.2, 3.6, (x, y, z) => N('p', [0.3, 0.6, 0.3], [x, y, z], WH, 1, null, 'R'));
        }
        return o;
    }
    function clNucCheck(s) { const tier = clNucTier(s.nuc), mdl = clNucModelReady(); if (!mdl) clNucModelLoad(); if (CL3.nucTier === tier && CL3.nucMdl === mdl) return false; CL3.nucTier = tier; CL3.nucMdl = mdl; CLT.nucleo.parts = CLN.failed ? clNucParts(tier) : []; CLT.nucleo.vs = mdl ? 1 : 1.25;   /* com o modelo 3D, ele é desenhado por clNucModelStep; sem ele, as peças antigas */ Object.keys(CL3.geo).forEach(k => { if (k.indexOf('nucleo:') === 0) delete CL3.geo[k]; }); return true; }
    /* ---------- pontos de interação: onde cada morador entra, rega, senta, trabalha ou olha o céu ---------- */
    function clSpotsBuild(s) {
        const S = { home: [], garden: [], seat: [], work: [], watch: [] }; CL3.spots = S;
        s.pcs.forEach((p, i) => {
            const t = CLT[p[0]]; if (!t || !t.int || !S[t.int.k]) return; const f = clFp(t, p[3]), k = t.vs || 1, a = -(p[3] & 3) * Math.PI / 2, ca = Math.cos(a), sa = Math.sin(a), cx = p[1] + f[0] / 2, cz = p[2] + f[1] / 2, I = t.int, lx = I.door ? I.door[0] : 0, lz = I.door ? I.door[1] : t.fp[1] / 2 + 0.2, oz = lz + 0.5 / k;
            const sx = cx + (lx * ca + oz * sa) * k, sz = cz + (-lx * sa + oz * ca) * k; if (!clColFree(s, sx, sz)) return;
            S[I.k].push({ x: sx, z: sz, dx: cx + (lx * ca + lz * sa) * k, dz: cz + (-lx * sa + lz * ca) * k, cx, cz, pc: i, use: 0, yaw: Math.atan2(cx - sx, cz - sz), fy: a, k: I.k });
        });
    }
    function clColClear(s, x0, z0, x1, z1) { for (let i = 1; i <= 10; i++) if (!clColFree(s, x0 + (x1 - x0) * i / 10, z0 + (z1 - z0) * i / 10)) return i >= 9; return true; }
    function clColDecide(a, s, n) {
        const S = CL3.spots || {}, free = arr => (arr || []).filter(x => x.use < 1), want = n > 0.5 ? 1 : 0, r = Math.random();
        const L = (CL3.lamps || []).find(l => l.tgt !== want && !l.claim); if (L && r < 0.9) { L.claim = a; a.act = 'lamp'; a.lamp = L; a.pt = null; a.tx = L.x + 0.45; a.tz = L.z + 0.45; return true; }
        if (r < 0.14 && n < 0.7) { const o = (CL3.agents || []).find(b => b !== a && b.st === 'w' && !b.act && b.w > 0.3 && Math.hypot(b.x - a.x, b.z - a.z) < 4.5); if (o && clColClear(s, a.x, a.z, o.x, o.z)) { const dx = o.x - a.x, dz = o.z - a.z, d = Math.hypot(dx, dz) || 1; a.act = 'chat'; a.pt = null; a.lamp = null; a.partner = o; a.tx = o.x - dx / d * 0.62; a.tz = o.z - dz / d * 0.62; o.w = 9; o.tx = o.x; o.tz = o.z; return true; } }
        let act = '', list = null;
        if (n > 0.6) { if (r < 0.72) { act = 'home'; list = S.home; } else if (r < 0.86) { act = 'sit'; list = free(S.seat); } }
        else if (r < 0.2) { act = 'water'; list = free(S.garden); } else if (r < 0.34) { act = 'home'; list = S.home; } else if (r < 0.5) { act = 'sit'; list = free(S.seat); } else if (r < 0.7) { act = 'work'; list = free(S.work); } else if (r < 0.78) { act = 'watch'; list = free(S.watch); }
        if (!list || !list.length) return false; const sp = list[Math.floor(Math.random() * list.length)]; if (!clColClear(s, a.x, a.z, sp.x, sp.z)) return false;
        a.act = act; a.pt = sp; a.lamp = null; a.tx = sp.x; a.tz = sp.z; if (act !== 'home') sp.use++; return true;
    }
    /* ---------- gotas de água e faíscas ---------- */
    function clDropsInit() {
        const THREE = clTh(), N = 260, g = new THREE.BufferGeometry(), pos = new Float32Array(N * 3).fill(-999), col = new Float32Array(N * 3); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
        const pts = new THREE.Points(g, new THREE.PointsMaterial({ size: 4, sizeAttenuation: false, vertexColors: true, transparent: true, depthWrite: false })); pts.frustumCulled = false; CL3.sc.add(pts); CL3.drops = { g, pos, col, vel: new Float32Array(N * 3), age: new Float32Array(N).fill(9), life: new Float32Array(N).fill(1), n: N, i: 0 };
    }
    function clDrop(x, y, z, vx, vy, vz, r, g, b, life) { const D = CL3.drops; if (!D) return; const j = D.i = (D.i + 1) % D.n; D.pos[j * 3] = x; D.pos[j * 3 + 1] = y; D.pos[j * 3 + 2] = z; D.vel[j * 3] = vx; D.vel[j * 3 + 1] = vy; D.vel[j * 3 + 2] = vz; D.col[j * 3] = r; D.col[j * 3 + 1] = g; D.col[j * 3 + 2] = b; D.age[j] = 0; D.life[j] = life; }
    function clDropsStep(dt) {
        const D = CL3.drops; if (!D) return; for (let j = 0; j < D.n; j++) { if (D.age[j] >= D.life[j]) continue; D.age[j] += dt; if (D.age[j] >= D.life[j] || D.pos[j * 3 + 1] < 0.02) { D.age[j] = 9; D.pos[j * 3 + 1] = -999; continue; } D.vel[j * 3 + 1] -= 6 * dt; D.pos[j * 3] += D.vel[j * 3] * dt; D.pos[j * 3 + 1] += D.vel[j * 3 + 1] * dt; D.pos[j * 3 + 2] += D.vel[j * 3 + 2] * dt; }
        D.g.attributes.position.needsUpdate = true; D.g.attributes.color.needsUpdate = true;
    }
    function clToolsInit() {
        const THREE = clTh(), P = (k, s, p, c, r) => ({ k, s, p, c, g: false, r: r || null, an: '' }); const can = clBuildGeo({ t: null, parts: [P('b', [0.15, 0.12, 0.11], [0, 0, 0], '#4fb8ff'), P('k', [0.04, 0.17, 0.04], [0.12, 0.08, 0], '#9ad8ff', [0, 0, -1.2]), P('b', [0.02, 0.12, 0.02], [-0.08, 0.1, 0], '#2f7fb8'), P('b', [0.15, 0.03, 0.11], [0, 0.12, 0], '#2f7fb8')] }, 0);
        const ham = clBuildGeo({ t: null, parts: [P('c', [0.03, 0.34, 0.03], [0, 0, 0], '#8a5a3a'), P('b', [0.14, 0.08, 0.08], [0, 0.3, 0], '#8a93a6')] }, 0);
        CL3.toolW = new THREE.InstancedMesh(can.solid, CL3.mS, 32); CL3.toolH = new THREE.InstancedMesh(ham.solid, CL3.mS, 32); [CL3.toolW, CL3.toolH].forEach(m => { m.count = 0; m.frustumCulled = false; CL3.sc.add(m); });
    }
    /* ---------- os moradores: andam, entram em casa, regam, sentam, trabalham, acendem e apagam postes ---------- */
    /* os moradores têm braços e pernas separados (cada um é uma peça própria que gira no quadril e no ombro): andam de verdade, balançam os braços, sentam com as pernas à frente, batem na porta e conversam entre si */
    function clColLimbsInit() { /* já compilado diretamente dentro de clColInit() para zero retrabalho e FPS máximo */ }
    const clWrapA = d => ((d + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
    function clColStep(dt, t) {
        if (!CL3.col || !CL3.agents.length) return; const THREE = clTh(), s = clS(), n = CL3.dayN || 0, hwOn = !!CL3.hwMist, m = CL3.tmpM || (CL3.tmpM = new THREE.Matrix4()), m2 = CL3.tmpM2 || (CL3.tmpM2 = new THREE.Matrix4()), m3 = CL3.tmpM3 || (CL3.tmpM3 = new THREE.Matrix4()), q = CL3.tmpQ || (CL3.tmpQ = new THREE.Quaternion()), q2 = CL3.tmpQ2 || (CL3.tmpQ2 = new THREE.Quaternion()), p = CL3.tmpP || (CL3.tmpP = new THREE.Vector3()), sc = CL3.tmpS || (CL3.tmpS = new THREE.Vector3()), up = CL3.tmpU || (CL3.tmpU = new THREE.Vector3(0, 1, 0)), ax = CL3.tmpX || (CL3.tmpX = new THREE.Vector3(1, 0, 0)), az = CL3.tmpZ || (CL3.tmpZ = new THREE.Vector3(0, 0, 1)), tp = CL3.tmpT || (CL3.tmpT = new THREE.Vector3());
        const LM = CL3.colLimbs && clPerfMode() !== 'minimo' ? CL3.colLimbs : null, kf = Math.min(1, dt * 14);
        let nw = 0, nh = 0; const sleepers = new Map(), roles = window.CL_COL_ROLES || CL_COL_ROLES, counts = CL3._colCounts || (CL3._colCounts = {});
        for (let ri = 0; ri < roles.length; ri++) counts[roles[ri]] = 0;
        CL3.agents.forEach((a, i) => {
            if (!a.st) a.st = 'w'; if (!a.spd) a.spd = 0.55 + Math.random() * 0.35; if (a.ph == null) a.ph = Math.random() * 6.28; if (a.sc == null) a.sc = 1; if (a.vy == null) a.vy = a.yaw || 0; if (a.l1 == null) { a.l1 = a.l2 = a.a1 = a.a2 = 0; a.wp = Math.random() * 6; }
            let moving = false, pitch = 0, yOff = 0, sy = 1, tgtSc = 1, tl = 0, tr = 0, tal = 0, tar = 0;
            if (a.st === 'in') {
                tgtSc = 0; if (a.pt) { sleepers.set(a.pt, (sleepers.get(a.pt) || 0) + 1); if (a.sc > 0.05) { a.x += (a.pt.dx - a.x) * Math.min(1, dt * 3); a.z += (a.pt.dz - a.z) * Math.min(1, dt * 3); } }
                if (a.tm > 1e8) { if (n < 0.3) a.tm = 0.4 + Math.random() * 6; } else a.tm -= dt;
                if (a.tm <= 0) { if (a.pt) { a.x = a.pt.x; a.z = a.pt.z; a.yaw = a.pt.yaw + Math.PI; a.vy = a.yaw; } a.st = 'w'; a.act = ''; a.pt = null; a.w = 0.4; a.tx = a.x; a.tz = a.z; }
            } else if (a.st === 'kn') {   /* para na porta e bate antes de entrar */
                a.tm -= dt; if (a.pt) a.yaw = a.pt.yaw; pitch = 0.05; tar = -1.5 + Math.abs(Math.sin(t * 11 + a.ph)) * 0.6; tal = 0.1;
                if (a.tm <= 0) { a.st = 'in'; a.tm = n > 0.5 ? 1e9 : 5 + Math.random() * 6; }
            } else if (a.st === 'do') {
                a.tm -= dt; const sp = a.pt;
                if (a.act === 'water') { a.yaw = sp.yaw; pitch = 0.3; tal = -1.1; tar = -1.15 + Math.sin(t * 3 + a.ph) * 0.08; const fx = Math.sin(a.yaw), fz = Math.cos(a.yaw); if (Math.random() < dt * 38) clDrop(a.x + fx * 0.42, 0.5, a.z + fz * 0.42, fx * 0.7 + (Math.random() - 0.5) * 0.3, 0.1, fz * 0.7 + (Math.random() - 0.5) * 0.3, 0.45, 0.8, 1, 0.9); tp.set(a.x + fx * 0.3, 0.5, a.z + fz * 0.3); q.setFromAxisAngle(up, a.yaw); q.multiply(q2.setFromAxisAngle(az, -0.8)); if (nw < 32) { m.compose(tp, q, sc.set(1, 1, 1)); CL3.toolW.setMatrixAt(nw++, m); } }
                else if (a.act === 'work') { a.yaw = sp.yaw; const sw = Math.sin(t * 11 + a.ph); pitch = 0.16 + 0.18 * sw; tar = -1.5 + sw * 0.9; tal = -0.7; const fx = Math.sin(a.yaw), fz = Math.cos(a.yaw); if (Math.random() < dt * 5) clDrop(a.x + fx * 0.4, 0.3, a.z + fz * 0.4, (Math.random() - 0.5) * 1.2, 1.4, (Math.random() - 0.5) * 1.2, 1, 0.7, 0.2, 0.5); tp.set(a.x + fx * 0.3, 0.42, a.z + fz * 0.3); q.setFromAxisAngle(up, a.yaw); q.multiply(q2.setFromAxisAngle(ax, 0.6 + sw * 0.7)); if (nh < 32) { m.compose(tp, q, sc.set(1, 1, 1)); CL3.toolH.setMatrixAt(nh++, m); } }
                else if (a.act === 'sit') { a.yaw = sp.fy; a.x += (sp.cx - a.x) * Math.min(1, dt * 4); a.z += (sp.cz - a.z) * Math.min(1, dt * 4); yOff = -0.12; sy = 0.9; tl = tr = -1.45; tal = tar = -0.4; }
                else if (a.act === 'watch') { a.yaw = sp.yaw; pitch = -0.28; tar = -2.5 + Math.sin(t * 1.5 + a.ph) * 0.05; tal = 0.05; }
                else if (a.act === 'lamp') { const L = a.lamp; pitch = -0.18 + 0.1 * Math.sin(t * 9); yOff = Math.abs(Math.sin(t * 6)) * 0.04; tar = -2.7 + Math.sin(t * 9) * 0.25; tal = 0.1; if (L) { a.yaw = Math.atan2(L.x - a.x, L.z - a.z); if (a.tm < 0.8 && !a.did) { a.did = true; L.tgt = n > 0.5 ? 1 : 0; L.flash = 1; } } }
                else if (a.act === 'chat') {   /* conversa: um de frente para o outro, gesticulando e balançando a cabeça */
                    const o = a.partner; if (!o || o.act !== 'chat' || o.partner !== a) a.tm = 0; else { a.yaw = Math.atan2(o.x - a.x, o.z - a.z); const g1 = Math.sin(t * 3.1 + a.ph), g2 = Math.sin(t * 2.3 + a.ph * 2); pitch = 0.04 + 0.05 * g2; tar = -0.9 + g1 * 0.7 * (Math.sin(t * 0.9 + a.ph) > 0 ? 1 : 0.3); tal = -0.25 + g2 * 0.35 * (Math.sin(t * 0.7 + a.ph) < 0 ? 1 : 0.3); yOff = Math.abs(g1) * 0.012; }
                }
                if (a.tm <= 0) { if (a.pt && a.act !== 'home') a.pt.use = Math.max(0, a.pt.use - 1); if (a.lamp) { a.lamp.claim = null; a.lamp = null; } a.partner = null; a.st = 'w'; a.act = ''; a.pt = null; a.did = false; a.w = 0.5 + Math.random() * 2; a.tx = a.x; a.tz = a.z; }
            } else {
                if (a.w > 0) {   /* parado: respira, balança de leve e olha em volta */
                    a.w -= dt; a.lkT = (a.lkT || 0) - dt; if (a.lkT <= 0) { a.lkT = 1.8 + Math.random() * 3.5; a.yawT = a.yaw + (Math.random() - 0.5) * 1.8; } if (a.yawT != null) a.yaw += clWrapA(a.yawT - a.yaw) * Math.min(1, dt * 2.2);
                    tal = Math.sin(t * 1.4 + a.ph) * 0.05 - 0.04; tar = Math.sin(t * 1.2 + a.ph * 1.7) * 0.05 + 0.04; yOff = Math.sin(t * 2 + a.ph) * 0.006;
                } else { const dx = a.tx - a.x, dz = a.tz - a.z, d = Math.hypot(dx, dz);
                    if (d < (a.act ? 0.14 : 0.1)) {
                        if (a.act === 'home') { a.st = 'kn'; a.tm = 0.7 + Math.random() * 0.4; }
                        else if (a.act === 'chat') { const o = a.partner; if (o && o.st === 'w' && !o.act) { o.st = 'do'; o.act = 'chat'; o.partner = a; o.pt = null; o.tm = a.tm = 4 + Math.random() * 4; a.st = 'do'; a.did = false; } else { a.act = ''; a.partner = null; a.w = 0.6; a.tx = a.x; a.tz = a.z; } }
                        else if (a.act) { a.st = 'do'; a.did = false; a.tm = a.act === 'water' ? 3.4 + Math.random() * 1.5 : a.act === 'work' ? 4 + Math.random() * 3 : a.act === 'sit' ? 7 + Math.random() * 7 : a.act === 'watch' ? 5 + Math.random() * 4 : 1.7; }
                        else { a.w = 0.5 + Math.random() * 2.2; if (!(Math.random() < 0.62 && clColDecide(a, s, n))) { if (!clColPick(s, a)) { a.tx = a.x; a.tz = a.z; a.w = 1.5; } } }
                    } else { const st = Math.min(d, a.spd * (a.act === 'lamp' ? 1.5 : 1) * dt); a.x += dx / d * st; a.z += dz / d * st; a.yaw = Math.atan2(dx, dz); moving = true; a.wp += st * 7.5; const sw = Math.sin(a.wp), run = a.act === 'lamp' ? 1.2 : 1; tl = sw * 0.8 * run; tr = -sw * 0.8 * run; tal = -sw * 0.6 * run; tar = sw * 0.6 * run; pitch = 0.07 * run; }
                }
            }
            a.l1 += (tl - a.l1) * kf; a.l2 += (tr - a.l2) * kf; a.a1 += (tal - a.a1) * kf; a.a2 += (tar - a.a2) * kf; a.sc += (tgtSc - a.sc) * Math.min(1, dt * 8); a.vy += clWrapA(a.yaw - a.vy) * Math.min(1, dt * (moving ? 10 : 7));
            const sx = 1.08 * Math.max(0.0001, a.sc); q.setFromAxisAngle(up, a.vy); if (pitch) q.multiply(q2.setFromAxisAngle(ax, pitch)); if (hwOn && moving) q.multiply(q2.setFromAxisAngle(az, Math.sin(t * 9 + a.ph) * 0.16));
            m.compose(p.set(a.x, (moving ? Math.abs(Math.cos(a.wp)) * 0.04 : 0) + yOff, a.z), q, sc.set(sx, sx * (a.sc > 0.02 ? sy : 1), sx));
            let r = a.role || 'citizen';
            if (a.act === 'water' && CL3.colMeshes && CL3.colMeshes['farmer']) r = 'farmer';
            else if (a.act === 'work' && CL3.colMeshes && CL3.colMeshes['worker']) r = 'worker';
            if (!CL3.colMeshes[r]) r = 'citizen';
            const curIdx = counts[r] || 0;
            if (curIdx < 32) {
                if (LM && LM[r]) { const L = LM[r]; L.body.setMatrixAt(curIdx, m); const lb = (mesh, piv, ang) => { m2.makeTranslation(0, piv, 0); m3.copy(m).multiply(m2); m2.makeRotationX(ang); m3.multiply(m2); mesh.setMatrixAt(curIdx, m3); }; lb(L.lL, 0.34, a.l1); lb(L.lR, 0.34, a.l2); lb(L.aL, 0.59, a.a1); lb(L.aR, 0.59, a.a2); }
                else { const im = (CL3.colMeshes && CL3.colMeshes[r]) || CL3.col; if (im) im.setMatrixAt(curIdx, m); }
                counts[r] = curIdx + 1;
            }
        });
        roles.forEach(r => {
            const im = CL3.colMeshes && CL3.colMeshes[r], c = counts[r] || 0;
            if (im) { im.count = LM ? 0 : c; im.visible = !LM && c > 0; if (im.visible) im.instanceMatrix.needsUpdate = true; }
            const L = CL3.colLimbs && CL3.colLimbs[r];
            if (L) ['body', 'lL', 'lR', 'aL', 'aR'].forEach(k => { const vis = !!(LM && c > 0); L[k].count = vis ? c : 0; L[k].visible = vis; if (vis) L[k].instanceMatrix.needsUpdate = true; });
        });
        CL3.toolW.count = nw; CL3.toolH.count = nh; CL3.toolW.instanceMatrix.needsUpdate = true; CL3.toolH.instanceMatrix.needsUpdate = true;
        CL3.zz = []; sleepers.forEach((k, sp) => { CL3.zz.push([sp.cx, sp.cz, k]); });
    }
    function clLifeStep(dt) { clDayStep(dt); clLampStep(dt); clDropsStep(dt); }
    function clUiZz() {   // "z z z" em cima das casas com moradores dormindo
        const r = CL.root, cam = CL3.cam; if (!r || !cam) return; const box = r.querySelector('.cl-bubs'), pv = CL3.pv || (CL3.pv = new (clTh().Vector3)()), L = CL3.zz || [];
        box.querySelectorAll('.cl-zz').forEach(e => { e.dataset.u = ''; });
        L.forEach((z, i) => { let el = box.querySelector('.cl-zz[data-i="' + i + '"]'); if (!el) { el = document.createElement('i'); el.className = 'cl-zz'; el.dataset.i = i; el.textContent = '💤'; box.appendChild(el); } el.dataset.u = '1'; pv.set(z[0], 2.0 + 0.15 * Math.sin(CL3.t * 2 + i), z[1]).project(cam); if (pv.z > 1 || Math.abs(pv.x) > 1.2 || Math.abs(pv.y) > 1.2) { el.hidden = true; return; } el.style.transform = 'translate(' + ((pv.x + 1) / 2 * CL3.w).toFixed(1) + 'px,' + ((1 - pv.y) / 2 * CL3.h).toFixed(1) + 'px) translate(-50%,-100%)'; el.hidden = false; });
        box.querySelectorAll('.cl-zz').forEach(e => { if (e.dataset.u !== '1') e.remove(); });
    }
/* ===== cortex/36jc-colony-look.js: o visual da Colônia: tone mapping de cinema (ACES), reflexos do céu da estrela (mapa de ambiente), luzes com mais contraste e pós-processamento (brilho nas luzes e cristais, contraste, saturação e vinheta) ===== */
    const CL_GRADE = {
        uniforms: { tDiffuse: { value: null }, uC: { value: 1.16 }, uS: { value: 2.6 }, uV: { value: 0.28 }, uLift: { value: -0.012 }, uCine: { value: 0 }, uT: { value: 0 }, uDip: { value: 1 }, uMotion: { value: 0 }, uMotionDir: { value: [0, 0] } },
        vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
        fragmentShader: 'uniform sampler2D tDiffuse;uniform float uC,uS,uV,uLift,uCine,uT,uDip,uMotion;uniform vec2 uMotionDir;varying vec2 vUv;vec3 srgb(vec3 c){c=max(c,0.);return mix(c*12.92,1.055*pow(c,vec3(1./2.4))-.055,step(.0031308,c));}'
            + 'void main(){vec3 c0=texture2D(tDiffuse,vUv).rgb;if(uMotion>.0006){vec2 md=uMotionDir*min(uMotion,.032);c0=c0*.22+texture2D(tDiffuse,vUv+md*.33).rgb*.18+texture2D(tDiffuse,vUv-md*.33).rgb*.18+texture2D(tDiffuse,vUv+md*.66).rgb*.13+texture2D(tDiffuse,vUv-md*.66).rgb*.13+texture2D(tDiffuse,vUv+md).rgb*.08+texture2D(tDiffuse,vUv-md).rgb*.08;}float tb=smoothstep(.3,.62,abs(vUv.y-.52))*(.0022+uCine*.0016);if(tb>.0001){c0*=.2;c0+=texture2D(tDiffuse,vUv+vec2(tb,0.)).rgb*.1+texture2D(tDiffuse,vUv-vec2(tb,0.)).rgb*.1+texture2D(tDiffuse,vUv+vec2(0.,tb)).rgb*.1+texture2D(tDiffuse,vUv-vec2(0.,tb)).rgb*.1+texture2D(tDiffuse,vUv+vec2(tb,tb)*.7).rgb*.1+texture2D(tDiffuse,vUv-vec2(tb,tb)*.7).rgb*.1+texture2D(tDiffuse,vUv+vec2(tb,-tb)*.7).rgb*.1+texture2D(tDiffuse,vUv+vec2(-tb,tb)*.7).rgb*.1;}if(uCine>.01){vec2 dd=vUv-.5;float ca=dot(dd,dd)*.014*uCine;c0.r=c0.r*.4+texture2D(tDiffuse,vUv+dd*ca).r*.6;c0.b=c0.b*.4+texture2D(tDiffuse,vUv-dd*ca).b*.6;}vec3 c=srgb(c0);float l=dot(c,vec3(.2126,.7152,.0722));c=mix(vec3(l),c,uS);c=(c-.5)*uC+.5+uLift;vec2 q=vUv-.5;c*=1.-(uV+uCine*.34)*dot(q,q)*1.7;if(uCine>.01){float l2=dot(c,vec3(.2126,.7152,.0722));c+=(vec3(-.012,.018,.03)*(1.-l2)+vec3(.038,.012,-.028)*l2)*uCine;float gn=fract(sin(dot(vUv*vec2(1731.7,1313.3)+fract(uT*7.13),vec2(12.9898,78.233)))*43758.5453);c+=(gn-.5)*.08*uCine;c*=1.+.012*uCine*sin(uT*47.);}c*=uDip;gl_FragColor=vec4(clamp(c,0.,1.),1.);}'
    };
    function clEnvScene(THREE) {   /* um céu pequeno na cor da estrela, com três "janelas" de luz forte: é o que as peças metálicas e brilhantes refletem */
        const s = new THREE.Scene(), pal = clStarPal(), hw = clEvActive('halloween');
        const mat = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, uniforms: { top: { value: new THREE.Color(hw ? 0x8a5cff : 0x9cc8ff) }, mid: { value: new THREE.Color(pal[0]) }, bot: { value: new THREE.Color(hw ? 0x14081f : 0x0a0f1c) } },
            vertexShader: 'varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
            fragmentShader: 'uniform vec3 top,mid,bot;varying vec3 vP;void main(){float y=normalize(vP).y;vec3 c=y>0.?mix(mid*.55,top*.9,pow(y,.6)):mix(mid*.3,bot,pow(-y,.45));gl_FragColor=vec4(c,1.);}' });
        s.add(new THREE.Mesh(new THREE.SphereGeometry(10, 32, 16), mat));
        const pm = new THREE.MeshBasicMaterial({ color: new THREE.Color(4, 4, 4), side: THREE.DoubleSide }), pc = new THREE.MeshBasicMaterial({ color: new THREE.Color(pal[1]).multiplyScalar(2.5), side: THREE.DoubleSide });
        [[-4.5, 6.5, -3, 3.2, pm], [5.5, 3.5, 2, 2.2, pc], [0, 7.5, 5, 2.4, pm], [-6, 1.5, 4, 1.6, pc]].forEach(([x, y, z, sz, m]) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(sz, sz), m); p.position.set(x, y, z); p.lookAt(0, 0, 0); s.add(p); });
        return s;
    }
    function clLookInit() {
        const THREE = clTh(), r = CL3.r, sc = CL3.sc; if (!r || !sc) return;
        CL3.lowGrace = performance.now() + 15000;   /* nos primeiros 15 s (modelos e shaders sendo preparados) quedas de quadros não ligam o modo leve */
        r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.0;
        CL3.lk = { sun: 1.9, hemi: 0.72, amb: 0.26 };   /* mais sol, menos luz chapada: sombra e relevo aparecem */
        try { clDayStep(1); } catch (e) {}
        if (IPAD) {   /* no iPad o mapa de reflexo e o céu HDR estouram a memória da GPU e o Safari fecha a aba */
            CL3.lowq = true; if (CL3.uQ) CL3.uQ.value = 0; r.shadowMap.enabled = false; if (CL3.sun) CL3.sun.castShadow = false; CL3.cp = null; if (CL3.uLin) CL3.uLin.value = 0;
            [CL3.mG, CL3.mGL].forEach(m => { if (m) { m.toneMapped = false; m.needsUpdate = true; } });
            return;
        }
        try { const pm = new THREE.PMREMGenerator(r), es = clEnvScene(THREE); CL3.envRT = pm.fromScene(es, 0.035); sc.environment = CL3.envRT.texture; pm.dispose(); es.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); }); } catch (e) { console.warn('colony env', e); }
        [CL3.mS, CL3.mC].forEach(m => { if (m) { m.envMapIntensity = 0.55; m.needsUpdate = true; } });
        if (!clEvActive('halloween')) clHdri(THREE);
        [CL3.mG, CL3.mGL].forEach(m => { if (m) { m.toneMapped = false; m.needsUpdate = true; } });   /* luzes e cristais fora do tone mapping: brilham de verdade e alimentam o bloom */
        try { const pm = clPerfMode(); if (pm === 'leve' || pm === 'minimo' || (pm === 'auto' && (clLowFlag() || CL_TOUCH()))) { CL3.lowq = true; if (CL_TOUCH()) { if (CL3.uQ) CL3.uQ.value = 0; r.shadowMap.enabled = false; } } } catch (e) {}
        CL3.cp = null; if (LITE || CL3.lowq || !THREE.EffectComposer || !THREE.RenderPass || !THREE.UnrealBloomPass || !THREE.ShaderPass) return;
        try {
            const touch = !!(window.matchMedia && matchMedia('(pointer:coarse)').matches), w = Math.max(1, CL3.root.clientWidth), h = Math.max(1, CL3.root.clientHeight), pr = Math.min(r.getPixelRatio(), touch ? 1.0 : 1.5);
            const rt = new THREE.WebGLRenderTarget(w * pr, h * pr, { type: THREE.HalfFloatType, samples: 0 });
            const cp = new THREE.EffectComposer(r, rt); cp.setPixelRatio(pr); cp.setSize(w, h);
            const rp = new THREE.RenderPass(sc, CL3.cam); cp.addPass(rp);
            const bl = new THREE.UnrealBloomPass(new THREE.Vector2(Math.round(w * 0.5), Math.round(h * 0.5)), 0.3, 0.28, 0.96);   /* brilho em meia resolução: igual de olho, metade do custo */ cp.addPass(bl);
            const gr = new THREE.ShaderPass(CL_GRADE); cp.addPass(gr);
            CL3.cp = cp; CL3.cpRP = rp; CL3.bloom = bl; CL3.grade = gr; if (CL3.uLin) CL3.uLin.value = 1; if (gr.uniforms && gr.uniforms.uMotionDir && THREE.Vector2) gr.uniforms.uMotionDir.value = new THREE.Vector2(0, 0);
            /* SSAO testado (SAOPass e SSAOPass) e desligado a pedido: pesado e com resultado instável; */   /* SAO testado de novo (plano distante 520, intensidade 0.006 a 0.03) e deixado desligado: escurece a cena ou deixa a imagem borrada com halos; a sombra de contato vem dos vértices e da sombra suave do sol */
        } catch (e) { console.warn('colony composer', e); CL3.cp = null; if (CL3.uLin) CL3.uLin.value = 0; }
    }
    function clHdri(THREE) {   /* céu de verdade (HDRI "Kloppenheim 06", Poly Haven, CC0) iluminando e refletindo nas peças */
        const r = CL3.r, sc = CL3.sc; if (!r || !sc) return;
        (THREE.RGBELoader ? Promise.resolve() : mkgScript('./assets/lib/three/examples/js/loaders/RGBELoader.js')).then(() => new Promise((ok, no) => new THREE.RGBELoader().load('./assets/colony/sky.hdr', ok, undefined, no))).then(tex => {
            if (CL3.sc !== sc || !CL3.r) { tex.dispose(); return; }
            tex.mapping = THREE.EquirectangularReflectionMapping; const pm = new THREE.PMREMGenerator(r), rt = pm.fromEquirectangular(tex); pm.dispose(); tex.dispose();
            if (CL3.envRT) CL3.envRT.dispose(); CL3.envRT = rt; sc.environment = rt.texture; [CL3.mS, CL3.mC].forEach(m => { if (m) m.needsUpdate = true; });
        }).catch(e => console.warn('colony hdri', e));
    }
    function clAoLoad(cp) {   /* oclusão de ambiente: escurece os cantos onde peças encostam no chão e umas nas outras. Só no computador (no iPad pesa demais) */
        const THREE = clTh(), base = './assets/lib/three/examples/js/', list = ['math/SimplexNoise.js', 'shaders/SSAOShader.js', 'postprocessing/SSAOPass.js'];
        list.reduce((p, f) => p.then(() => THREE[f.split('/')[1].replace('.js', '')] ? null : mkgScript(base + f)), Promise.resolve()).then(() => {
            if (CL3.cp !== cp || !THREE.SSAOPass) return;
            const ao = new THREE.SSAOPass(CL3.sc, CL3.cam, Math.max(1, CL3.root.clientWidth), Math.max(1, CL3.root.clientHeight)); Object.assign(ao, CL_AO); cp.insertPass(ao, 1); CL3.ao = ao; window.__clAo = ao;
            CL3.cam.far = CL_AO_FAR; CL3.cam.updateProjectionMatrix();
        }).catch(e => console.warn('colony ao', e));
    }
    const CL_AO = { kernelRadius: 1.4, minDistance: 0.0006, maxDistance: 0.02 }, CL_AO_FAR = 700;
    function clLookRender() {
        const r = CL3.r; if (!r) return;
        const tr0 = performance.now(); try { clLookRender2(r); } finally { CL3.msR = performance.now() - tr0; }
    }
    function clLookRender2(r) {
        if (r.shadowMap.enabled) { r.shadowMap.autoUpdate = false; CL3.shN = (CL3.shN || 0) + 1; if (CL3.shN % ((!CL_TOUCH() && !CL3.lowq) ? 1 : (!CL3.lowq ? (CL3.animBusy ? 1 : 2) : (CL3.animBusy ? 2 : 9))) === 0 || CL3.shN < 4 || CL3.need) r.shadowMap.needsUpdate = true; }   /* sombras do sol: no computador redesenhadas a cada quadro (sombras lisas a 60 fps, sem saltos); no celular/iPad ou no modo leve a cada 2 quadros (cena em movimento) ou 9 (parada) para cortar o 2º desenho da cena inteira */
        if (CL3.cp) { try { CL3.cpRP.camera = CL3.cam; const n = CL3.dayN || 0; CL3.bloom.strength = 0.28 + 0.34 * n; CL3.cp.render(); return; } catch (e) { console.warn('colony post', e); CL3.cp = null; if (CL3.uLin) CL3.uLin.value = 0; } }
        r.render(CL3.sc, CL3.cam);
    }
    function clLookSize(w, h) { if (CL3.cp) { try { CL3.cp.setSize(w, h); } catch (e) {} } }
    function clLookFree() {
        try { if (CL3.cp) { CL3.cp.renderTarget1.dispose(); CL3.cp.renderTarget2.dispose(); if (CL3.bloom && CL3.bloom.dispose) CL3.bloom.dispose(); } } catch (e) {}
        try { if (CL3.envRT) CL3.envRT.dispose(); } catch (e) {}
        CL3.cp = CL3.cpRP = CL3.bloom = CL3.grade = CL3.envRT = CL3.sao = CL3.ao = null; CL3.lk = null; if (CL3.uLin) CL3.uLin.value = 0;
    }
/* ===== cortex/36jd-colony-nucleus.js: o Núcleo da Colônia com o modelo 3D do reator (assets/colony/nucleo-reator.glb): corpo de aço com a textura de metal do jogo, tambor e anel girando, luzes na cor da colônia e uma coluna de plasma animada. Cada fase cresce: mais alto, mais largo, mais plasma e reatores satélites em volta ===== */
    const CLN = { tpl: null, loading: false, failed: false, scene: null, g: null, tier: 0, units: [], sats: [], fl: [] };
    const CLN_SC = [0, 1.15, 1.48, 1.82, 2.18, 2.55];            /* tamanho do reator em cada fase (1 = anel de 4 unidades) */
    const CLN_TOP = [0, 3.0, 3.95, 4.65, 5.25, 5.95];           /* altura da coluna de plasma */
    const CLN_SAT = [0, 0, 4, 4, 6, 8];                           /* reatores satélites: Fase 1 = 0 (semente), Fase 2 = 4 (satélites ativos!), Fase 3 = 4, Fase 4 = 6, Fase 5 = 8 */
    function clNucModelReady() { return clCoreOn() ? true : (!!CLN.tpl && !CLN.failed); }
    function clNucModelLoad() {
        if (clCoreOn()) return;
        if (CLN.loading || CLN.tpl || CLN.failed) return;
        const THREE = typeof clTh === 'function' ? clTh() : (window.T && window.T.THREE);
        if (!THREE) { setTimeout(clNucModelLoad, 150); return; }
        CLN.loading = true;
        (THREE.GLTFLoader ? Promise.resolve() : (typeof mkgLib === 'function' ? mkgLib() : mkgScript('./assets/lib/three/examples/js/loaders/GLTFLoader.js'))).then(() => new Promise((ok, no) => new THREE.GLTFLoader().load('./assets/colony/nucleo-reator.glb', ok, undefined, no))).then(gl => {
            const T = {}; gl.scene.traverse(o => { if (o.isMesh) T[o.name] = o.geometry; });
            const col = (g, hex, rough, metal) => { const n = g.attributes.position.count, c = new Float32Array(n * 3), rm = new Float32Array(n * 3), k = new THREE.Color(hex); for (let i = 0; i < n; i++) { c[i * 3] = k.r; c[i * 3 + 1] = k.g; c[i * 3 + 2] = k.b; rm[i * 3] = rough; rm[i * 3 + 1] = metal; rm[i * 3 + 2] = 1; }
                g.setAttribute('color', new THREE.BufferAttribute(c, 3)); g.setAttribute('aRM', new THREE.BufferAttribute(rm, 3)); g.setAttribute('aA', new THREE.BufferAttribute(new Float32Array(n * 2), 2)); g.setAttribute('aCt', new THREE.BufferAttribute(new Float32Array(n * 3), 3)); g.setAttribute('aK', new THREE.BufferAttribute(new Float32Array(n).fill(9), 1)); };
            ['ring', 'drum'].forEach(p => { if (T[p + '_dark']) col(T[p + '_dark'], '#1a1d24', 0.5, 0.55); if (T[p + '_steel']) col(T[p + '_steel'], '#5a6270', 0.38, 0.7); });
            CLN.tpl = T; CL3.need = true; window.__nucModel = CLN;
        }).catch(e => { CLN.loading = false; CLN.tries = (CLN.tries || 0) + 1; console.warn('nucleo model', e); if (CLN.tries >= 3) { CLN.failed = true; CL3.need = true; } else setTimeout(clNucModelLoad, 1500 * CLN.tries); });
    }
    const CLN_FL_VS = 'varying vec3 vP;varying vec3 vN;varying vec3 vV;void main(){vP=position;vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.);vV=-mv.xyz;gl_Position=projectionMatrix*mv;}';
    const CLN_FL_FS = `uniform float uTime;uniform float uTop;uniform float uAmp;uniform float uSpd;uniform float uSeed;uniform float uLin;uniform vec3 uCol;uniform vec3 uCol2;varying vec3 vP;varying vec3 vN;varying vec3 vV;${GLSL_NOISE}
        void main(){
          float y=vP.y;float bot=smoothstep(0.78,1.25,y),top=1.-smoothstep(uTop-1.2,uTop,y);float h=clamp((y-0.9)/max(.5,uTop-0.9),0.,1.);
          vec3 q=vec3(vP.x*2.2+uSeed,y*.9-uTime*uSpd,vP.z*2.2-uSeed);float n1=fbm(q),n2=fbm(vec3(vP.x*5.-uSeed,y*2.4-uTime*uSpd*1.8,vP.z*5.+uSeed));
          float fr=pow(1.-abs(dot(normalize(vN),normalize(vV))),1.4);
          float plasma=smoothstep(.28,.82,n1*.65+n2*.5);float vein=1.-smoothstep(0.,.07,abs(n2-.5));
          float a=(.05+.7*plasma*plasma+.5*vein)*(.25+.9*fr)*bot*top*uAmp;
          vec3 c=mix(uCol2,uCol,clamp(plasma*.55+vein*.5,0.,1.))*(.6+1.0*vein+.55*plasma);
          if(a<.01)discard;gl_FragColor=vec4(uLin>.5?pow(max(c,0.),vec3(2.2)):c,clamp(a,0.,1.));}`;
    function clNucFlameMat(seed, spd, amp, top) {
        const THREE = clTh(), pal = clStarPal(), c1 = new THREE.Color(pal[1]).lerp(new THREE.Color(0xffffff), 0.12), c2 = new THREE.Color(pal[0]);
        return new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, vertexShader: CLN_FL_VS, fragmentShader: CLN_FL_FS, uniforms: { uTime: CL3.uTime, uTop: { value: top }, uAmp: { value: amp }, uSpd: { value: spd }, uSeed: { value: seed }, uLin: CL3.uLin || (CL3.uLin = { value: 0 }), uCol: { value: c1 }, uCol2: { value: c2 } } });
    }
    function clNucModelBuild() {
        const THREE = clTh(), T = CLN.tpl, sc = CL3.sc, pal = clStarPal(); if (CLN.g && CLN.scene && CLN.scene !== sc) { CLN.g = null; }
        const G = new THREE.Group(); sc.add(G); CLN.g = G; CLN.scene = sc; CLN.tier = 0; CLN.units = []; CLN.sats = []; CLN.fl = [];
        CLN.matLite = new THREE.MeshBasicMaterial({ color: new THREE.Color(pal[0]).multiplyScalar(1.7), toneMapped: false });
        const body = (parent, pre) => { ['dark', 'steel'].forEach(r => { const g = T[pre + '_' + r]; if (!g) return; const m = new THREE.Mesh(g, CL3.mS); m.castShadow = true; m.receiveShadow = true; parent.add(m); }); const l = T[pre + '_lite']; if (l) parent.add(new THREE.Mesh(l, CLN.matLite)); };
        const mk = (small) => { const U = new THREE.Group(), ring = new THREE.Group(), drum = new THREE.Group(); U.add(ring); body(ring, 'ring'); if (!small) { U.add(drum); body(drum, 'drum'); } return { U, ring, drum }; };
        /* luz que sai do reator: brilho no chão e uma luz de ponto na cor dele */
        { const cv = document.createElement('canvas'); cv.width = cv.height = 128; const cx = cv.getContext('2d'), gr = cx.createRadialGradient(64, 64, 4, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); cx.fillStyle = gr; cx.fillRect(0, 0, 128, 128);
          CLN.glow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), color: 0xffffff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); CLN.glow.rotation.x = -Math.PI / 2; CLN.glow.position.y = 0.05; CLN.glow.renderOrder = 2; G.add(CLN.glow);
          CLN.light = new THREE.PointLight(0xffffff, 2, 16, 1.6); G.add(CLN.light); CLN.cv = -1; }
        /* reator principal */
        const main = mk(false); G.add(main.U); CLN.main = main;
        [['flame_a', 0.5, 11, 0.55], ['flame_b', 0.7, 23, 0.5], ['flame_c', 0.9, 37, 0.45]].forEach(([n, spd, seed, amp], i) => { if (!T[n]) return; const m = clNucFlameMat(seed, spd, amp, 2), f = new THREE.Mesh(T[n], m); f.renderOrder = 4; f.frustumCulled = false; main.U.add(f); CLN.fl.push({ f, m, i }); });
        /* satélites: o anel do reator com uma coluna menor */
        for (let i = 0; i < 8; i++) { const s = mk(true); s.U.visible = false; G.add(s.U); const m = clNucFlameMat(5 + i * 7, 0.8, 0.5, 1.7), f = new THREE.Mesh(T.flame_a, m); f.renderOrder = 4; f.frustumCulled = false; s.U.add(f); s.f = f; s.m = m; s.ang = i; CLN.sats.push(s); }
        /* feixes de laser conectando os satélites ao núcleo principal */
        CLN.lasers = []; const lMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(pal[0]).multiplyScalar(1.6), transparent: true, opacity: 0.65, depthWrite: false, blending: THREE.AdditiveBlending });
        for (let i = 0; i < 8; i++) { const lg = new THREE.CylinderGeometry(0.038, 0.038, 1, 8); lg.rotateX(Math.PI / 2); const lm = new THREE.Mesh(lg, lMat); lm.visible = false; lm.renderOrder = 3; G.add(lm); CLN.lasers.push(lm); }
    }
    function clNucModelStep(dt, t) {
        if (clCoreOn()) { try { clCoreStep(dt, t); return; } catch (e) { CC.failed = true; try { console.warn('núcleo novo falhou; voltando ao antigo', e); } catch (er) {} CL3.need = true; if (CC.g && CC.g.parent) CC.g.parent.remove(CC.g); CC.g = null; try { clNucModelLoad(); } catch (er) {} } }
        if (!clNucModelReady() || !CL3.sc) return; const s = clS(), tier = clNucTier(s.nuc); if (CLN.scene !== CL3.sc || !CLN.g) clNucModelBuild();
        const p = s.pcs.find(q => q[0] === 'nucleo'), THREE = clTh(); if (!p) { CLN.g.visible = false; return; } CLN.g.visible = true;
        const cx = p[1] + 1.5, cz = p[2] + 1.5, k = CLN_SC[tier] * (CL3.cineCoreK != null ? CL3.cineCoreK : 1) + 0.0001, n = CL3.dayN || 0, M = CLN.main, cv = p[5] | 0, cc = Math.min(5, CL3.cineCore || 1);
        if (CLN.cv !== cv) {   /* a cor escolhida em "Detalhes e cor" pinta o plasma, as luzes e o brilho */
            CLN.cv = cv; const tn = clTints(CLT.nucleo, cv), a = new THREE.Color(tn[0]), b = new THREE.Color(tn[1]).lerp(new THREE.Color(0xffffff), 0.12); CLN.colA = a;
            CLN.fl.forEach(o => { o.m.uniforms.uCol.value.copy(b); o.m.uniforms.uCol2.value.copy(a); }); CLN.sats.forEach(S => { S.m.uniforms.uCol.value.copy(b); S.m.uniforms.uCol2.value.copy(a); }); if (CLN.glow) CLN.glow.material.color.copy(a); if (CLN.light) CLN.light.color.copy(a); }
        CLN.g.position.set(cx, 0.005, cz); M.U.scale.setScalar(k);
        M.ring.rotation.y += dt * (0.18 + 0.05 * tier); M.drum.rotation.y -= dt * (0.45 + 0.12 * tier);
        const nm = 1 + n * 0.5, pu = 0.88 + 0.12 * Math.sin(t * 3.1);
        CLN.fl.forEach(o => { const on = tier >= o.i + 1 || o.i === 0; o.f.visible = on; if (on) { o.m.uniforms.uTop.value = CLN_TOP[tier] * (1 - o.i * 0.07); o.m.uniforms.uAmp.value = (0.52 + 0.05 * tier) * (1 + n * 0.15) * pu * (1 - o.i * 0.18) * Math.min(2.6, cc); o.f.scale.set(0.85 + 0.07 * tier, 1, 0.85 + 0.07 * tier); } });
        CLN.matLite.color.copy(CLN.colA).multiplyScalar((2.2 + 0.5 * tier) * nm * (0.9 + 0.1 * Math.sin(t * 4.2)));
        if (CLN.glow) { const gs = (2.0 * k + 2.6) * 2; CLN.glow.scale.set(gs, gs, 1); CLN.glow.material.opacity = Math.min(1, (0.5 + 0.06 * tier) * nm * pu); }
        if (CLN.light) { CLN.light.position.set(0, 1.6 * k, 0); CLN.light.intensity = (2.4 + 1.1 * tier) * nm * pu * cc; CLN.light.distance = 10 + 3 * tier; }
        const ns = (CL3.lowq || CL_TOUCH()) ? Math.min(CLN_SAT[tier], CL3.lowq ? 0 : 2) : CLN_SAT[tier], R = 2.0 * k + 1.2;
        CLN.sats.forEach((S, i) => { const on = i < ns; S.U.visible = on; if (!on) return; const a = (i % 4) * Math.PI / 2 + Math.PI / 4 + (i >= 4 ? Math.PI / 4 : 0), r = i >= 4 ? R + 1.2 : R; S.U.position.set(Math.cos(a) * r, 0, Math.sin(a) * r); S.U.scale.setScalar((i >= 4 ? 0.2 : 0.26) * (0.8 + 0.2 * k)); S.ring.rotation.y -= dt * 0.7; S.m.uniforms.uTop.value = 1.2 + 0.18 * tier; S.m.uniforms.uAmp.value = 0.7 * (1 + n * 0.15) * pu; S.f.scale.set(0.8, 1, 0.8); });
        if (CLN.lasers) { CLN.lasers.forEach((L, i) => { const on = i < ns; L.visible = on; if (!on) return; const S = CLN.sats[i]; if (!S || !S.U.visible) { L.visible = false; return; } const p1 = new THREE.Vector3(0, 1.15 * k, 0), p2 = S.U.position.clone(); p2.y = 0.55 * k; const dist = p1.distanceTo(p2); L.position.copy(p1).lerp(p2, 0.5); L.lookAt(p2); L.scale.set(1, 1, dist); if (L.material) L.material.opacity = (0.35 + 0.28 * Math.sin(t * 7.5 + i * 1.5)) * pu; }); }
    }



    try {

        if (typeof requestIdleCallback === 'function') {

            requestIdleCallback(() => clNucModelLoad(), { timeout: 2500 });

        } else {

            setTimeout(clNucModelLoad, 1200);

        }

    } catch (e) {}

/* === [SEC: COLONIA_BUILDINGS_3D] === */
/* ===== cortex/36je-colony-models.js: construções e criaturas em modelos 3D (assets/colony/*.glb, comprimidos): minas, fazendas, forjas, armazéns, moinhos, habitações, biblioteca, silos, cercas autotiling, torres, domos, estação, supercomputador, colosso, robô animado, peixes nadando e morcegos. Cada arquivo só é baixado quando a peça existe na colônia; sem ele (ou se falhar) vale a peça simples de antes. Créditos dos autores no Guia ===== */
    const CLM = { rp: {}, roam: [], tpl: {}, loading: {}, failed: {}, scene: null, mats: [], spin: [], anim: [], fish: [], bats: null, nm: {} };
    window.__clm = CLM;
    CLM.dbg = (x, z) => { const s = clS(); return { free: clRoamFree(s, x, z, -999), o: clOcc(s).get(clCells(Math.floor(x), Math.floor(z))), H: s.H }; };
    const CLM_DEF = {   /* peça → arquivo; lift = altura do chão; spin = giro lento; tint = cor da colônia nas luzes (neon) */
        mina: { f: 'mina.glb' , scale: 1.0 },
        torre_hab: { f: 'torre-cy2.glb', roles: 1 }, torre_vidro: { f: 'torre-vidro.glb', neon: /./ }, arranha_ceu: { f: 'arranha.glb' }, arcologia: { f: 'arcologia.glb' },
        observatorio: { f: 'observatorio.glb' }, domo: { f: 'domo.glb' }, habitat: { f: 'habitat.glb' }, supercomp: { f: 'supercomp.glb' }, colosso: { f: 'colosso.glb', roam: { sp: 0.85, sc: 0.72, yaw: 0, stomp: 3.2 } },
        cidade_flutuante: { f: 'estacao.glb', lift: 1.5, spin: 0.06 }, holograma: { f: 'holograma.glb', lift: 0.5, spin: 0.4 }, robo_patrulha: { f: 'robo.glb', skin: 1, roam: { sp: 1.5, sc: 1.0, yaw: 0, stomp: 0 } }
    };
    function clModelEnsure(file) {
        if (!file || String(file).indexOf('custom:') === 0) return Promise.resolve(null);
        if (CLM.tpl[file] && CLM.tpl[file].gl) return Promise.resolve(CLM.tpl[file]);
        if (CLM.prom && CLM.prom[file]) return CLM.prom[file];
        return clModelLoad(file);
    }
    function clModelLoad(file) {
        if (!file || String(file).indexOf('custom:') === 0) return Promise.resolve(null);
        if (CLM.tpl[file]) return Promise.resolve(CLM.tpl[file]);
        if (CLM.prom && CLM.prom[file]) return CLM.prom[file];
        CLM.prom = CLM.prom || {};
        CLM.loading[file] = true; const THREE = clTh();
        const loadMeshopt = () => {
            const whenReady = () => (window.MeshoptDecoder && window.MeshoptDecoder.ready ? window.MeshoptDecoder.ready.then(() => window.MeshoptDecoder) : Promise.resolve(window.MeshoptDecoder));
            if (window.MeshoptDecoder) return whenReady();
            return (typeof mkgScript === 'function' ?
                mkgScript('./assets/lib/three/examples/js/libs/meshopt_decoder.js')
                .catch(() => mkgScript('https://cdn.jsdelivr.net/npm/three@0.147.0/examples/js/libs/meshopt_decoder.js'))
                .then(whenReady)
                .catch(() => {}) : Promise.resolve());
        };
        const p = (typeof mkgLib === 'function' ? mkgLib() : (THREE.GLTFLoader ? Promise.resolve() : mkgScript('./assets/lib/three/examples/js/loaders/GLTFLoader.js')))
        .then(loadMeshopt)
        .then(dec => new Promise((ok, no) => {
            const loader = new THREE.GLTFLoader();
            const md = dec || window.MeshoptDecoder;
            if (md && md.supported) loader.setMeshoptDecoder(md);
            loader.load('./assets/colony/' + file, ok, undefined, no);
        })).then(gl => {
            const ms = []; gl.scene.updateMatrixWorld(true); gl.scene.traverse(o => { if (o.isMesh) ms.push(o); });
            const res = { gl, ms }; CLM.tpl[file] = res; delete CLM.loading[file];
            if (typeof CL3 !== 'undefined' && CL3) { CL3.need = true; CL3.pboxDirty = true; }
            if (file && file.indexOf('dragons/') === 0) {
                clearTimeout(CLM._zRefT);
                CLM._zRefT = setTimeout(() => {
                    try {
                        if (typeof ZOO !== 'undefined' && ZOO && ZOO.modal) {
                            if (ZOO.modal === 'book' && typeof zBookRefresh === 'function') zBookRefresh();
                            else if (typeof zRefresh === 'function') zRefresh();
                        }
                    } catch (er) {}
                }, 80);
            }
            return res;
        }).catch(e => {
            delete CLM.loading[file]; delete CLM.prom[file]; CLM.failed[file] = (CLM.failed[file] || 0) + 1;
            console.warn('modelo', file, e); throw e;
        });
        CLM.prom[file] = p;
        return p;
    }
    /* o livro do dragão só baixa quando abre: baixar ele junto com a entrada travava a Colônia */

    const CLM_NO_TINT_FILES = new Set([
        'fp_bonfire.glb', 'fp_hay.glb', 'fp_crates_veg.glb', 'fp_crate_single.glb',
        'fp_field_ready.glb', 'fp_barrel.glb', 'fp_timber.glb', 'fp_milktank.glb',
        'fp_cart.glb', 'fp_bench.glb', 'fp_study_table.glb', 'fp_tree_knowledge.glb',
        'dock_boat.glb', 'praca_well.glb', 'praca_bench.glb', 'bag.glb',
        'mina_gold_rock.glb', 'mina_gold_ingots.glb', 'mina_chest_gold.glb',
        'mina_chest_ingots.glb', 'mina_cart.glb', 'mina_barrels.glb',
        'mina_crystal_blue.glb', 'mina_crystal_green.glb',
        'cartoon_building.glb', 'stylized_fence.glb', 'generator.glb', 'cave_gate.glb',
        'bench.glb', 'library_building.glb', 'stylized_gold_mine.glb',
        'stylized_wood.glb'
    ]);

    /* ---- Helper universal para montagem modular de GLB ---- */
    function clGradeMat(m, skip) {   /* ajuste de cor comum a todas as construções: mesma saturação, mesmo calor e mesmo contraste, para peças de origens diferentes parecerem da mesma mão */
        if (!m || skip || !m.isMeshStandardMaterial) return m;
        const W = CLM._gr || (CLM._gr = new WeakSet()); if (W.has(m)) return m; W.add(m);
        if (m.emissive && m.emissive.getHex() !== 0 && m.emissiveIntensity > 0.6) return m;
        const prev = m.onBeforeCompile, key = m.customProgramCacheKey ? m.customProgramCacheKey() : '';
        m.onBeforeCompile = function (shader, r) {
            if (prev) prev.call(this, shader, r);
            shader.fragmentShader = shader.fragmentShader.replace('#include <alphatest_fragment>', '#include <alphatest_fragment>\n { float gLum = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114)); diffuseColor.rgb = mix(vec3(gLum), diffuseColor.rgb, 0.9); diffuseColor.rgb *= vec3(1.035, 1.0, 0.95); diffuseColor.rgb = clamp((diffuseColor.rgb - 0.45) * 1.05 + 0.45, 0.0, 1.0); }');
        };
        m.customProgramCacheKey = () => key + '|cgrade1'; m.needsUpdate = true; return m;
    }
    function clUnitTemplate(file, tpl, which) {   /* recorta UMA unidade (a do meio) do arquivo da estação de mineração, que traz três lado a lado, e funde as 110 peças em uma malha por material (poucas chamadas de desenho no celular); a unidade fica centrada e apoiada no chão */
        const C = CLM._unit || (CLM._unit = {}), ck = file + ':' + which; if (C[ck] !== undefined) return C[ck];
        const THREE = clTh(), root = tpl.gl.scene; if (!THREE) return null; root.updateMatrixWorld(true);
        const groups = new Map(), v = new THREE.Vector3(), nm = new THREE.Matrix3(), bb = new THREE.Box3(), cen = new THREE.Vector3(), keep = [];
        root.traverse(o => { if (!o.isMesh || !o.geometry || !o.geometry.attributes.position) return; bb.setFromObject(o); bb.getCenter(cen); const w = which === 1 ? cen.x < -3.6 : which === 2 ? (cen.x >= -3.6 && cen.x < 4.2) : cen.x >= 4.2; if (w) keep.push(o); });
        if (!keep.length) return (C[ck] = null);
        const all = new THREE.Box3(); keep.forEach(o => all.expandByObject(o));
        const ox = (all.min.x + all.max.x) / 2, oy = all.min.y, oz = (all.min.z + all.max.z) / 2;
        keep.forEach(o => {
            const mt = Array.isArray(o.material) ? o.material[0] : o.material, g = o.geometry, pos = g.attributes.position, n = g.attributes.normal, uv = g.attributes.uv;
            let G = groups.get(mt.uuid); if (!G) groups.set(mt.uuid, G = { mt, p: [], n: [], u: [], i: [], off: 0 }); nm.getNormalMatrix(o.matrixWorld);
            for (let k = 0; k < pos.count; k++) {
                v.fromBufferAttribute(pos, k).applyMatrix4(o.matrixWorld); G.p.push(v.x - ox, v.y - oy, v.z - oz);
                if (n) { v.fromBufferAttribute(n, k).applyMatrix3(nm).normalize(); G.n.push(v.x, v.y, v.z); } else G.n.push(0, 1, 0);
                if (uv) G.u.push(uv.getX(k), uv.getY(k)); else G.u.push(0, 0);
            }
            if (g.index) { for (let k = 0; k < g.index.count; k++) G.i.push(g.index.getX(k) + G.off); } else { for (let k = 0; k < pos.count; k++) G.i.push(k + G.off); }
            G.off += pos.count;
        });
        const out = new THREE.Group();
        groups.forEach(G => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(G.p, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(G.n, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(G.u, 2)); g.setIndex(G.off > 65535 ? new THREE.Uint32BufferAttribute(G.i, 1) : new THREE.Uint16BufferAttribute(G.i, 1)); out.add(new THREE.Mesh(g, G.mt)); });
        return (C[ck] = out);
    }
    function clAddPart(grp, file, x, y, z, sx, sy, sz, rx, ry, rz, opts) {
        if (file === 'mina_crystal_blue.glb' && opts && opts.glow) return null;   /* o cristal branco girando em cima das construções saiu */
        const tpl = CLM.tpl[file]; if (!tpl || !tpl.gl) return null;
        const uni = (opts && opts.unit) ? clUnitTemplate(file, tpl, opts.unit) : null, sub = uni ? uni.clone(true) : (opts && opts.skin && clTh() && clTh().SkeletonUtils) ? clTh().SkeletonUtils.clone(tpl.gl.scene) : tpl.gl.scene.clone(true);   /* opts.skin: modelo com esqueleto (ex.: o moinho): clona o esqueleto e liga a animação */
        sub.position.set(x, y, z);
        if (sx != null) sub.scale.set(sx, sy != null ? sy : sx, sz != null ? sz : sx);
        if (rx) sub.rotation.x = rx; if (ry) sub.rotation.y = ry; if (rz) sub.rotation.z = rz;
        const THREE = clTh();
        const cv = opts && opts.cv ? (opts.cv | 0) : 0;
        const pal = (cv > 0 && typeof CLD !== 'undefined' && CLD.PAL && CLD.PAL[cv - 1]) ? CLD.PAL[cv - 1] : null;
        const palColA = pal ? new THREE.Color(pal[1]) : null;
        const palColB = pal ? new THREE.Color(pal[2]) : null;
        const isProp = CLM_NO_TINT_FILES.has(file);
        const shouldTint = !!(pal && !(opts && opts.noTint) && !isProp);

        sub.traverse(o => {
            if (o.isMesh) {
                o.castShadow = !isProp; o.receiveShadow = true;
                if (o.geometry && !o.geometry.boundingSphere) o.geometry.computeBoundingSphere();
                o.frustumCulled = true;
                if (o.material) {
                    const mats = Array.isArray(o.material) ? o.material : [o.material];
                    const newMats = mats.map(m => {
                        if (!m) return m;
                        const cloned = m.clone();
                        if (file === 'blacksmiths_forge.glb') {
                            cloned.transparent = false;
                            cloned.opacity = 1.0;
                            cloned.depthWrite = true;
                        }
                        if (file === 'chale.glb') {
                            cloned.transparent = false;
                            cloned.opacity = 1.0;
                            cloned.depthWrite = true;
                            if (cloned.color) cloned.color.multiplyScalar(1.22);
                            cloned.roughness = Math.min(cloned.roughness != null ? cloned.roughness : 0.8, 0.65);
                        }
                        if (opts && opts.glow) {
                            cloned.emissive = new THREE.Color(opts.glowCol || 0x00e5ff);
                            cloned.emissiveIntensity = opts.glowInt || 1.3;
                            cloned.toneMapped = false;
                        }
                        if (shouldTint) {
                            /* a cor escolhida NÃO altera estrutura nem textura: recolore só as áreas de destaque (telhas vermelhas), mantendo o sombreamento e os detalhes da textura (a luminosidade de cada ponto é preservada); paredes, madeira, pedra e vidro ficam como são */
                            const gate = file === 'blacksmiths_forge.glb' ? 'warm' : file === 'witch_house.glb' ? 'purple' : 'red';
                            cloned.customProgramCacheKey = () => 'cl_acc_' + gate + '_' + cv;
                            cloned.onBeforeCompile = (shader) => {
                                shader.uniforms.uPalA = { value: palColA };
                                shader.fragmentShader = 'uniform vec3 uPalA;\n' + shader.fragmentShader.replace('#include <alphatest_fragment>', '#include <alphatest_fragment>\n { float aR = diffuseColor.r; if (' + (gate === 'warm' ? 'aR > 0.28 && aR > diffuseColor.g * 1.12 && aR > diffuseColor.b * 1.45' : gate === 'purple' ? 'diffuseColor.b > diffuseColor.g * 1.2 && aR > diffuseColor.g * 1.05' : 'aR > 0.30 && diffuseColor.g < 0.50 * aR && diffuseColor.b < 0.50 * aR') + ') { float aL = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114)); diffuseColor.rgb = mix(diffuseColor.rgb, clamp(uPalA * (aL * 2.2), 0.0, 1.0), 0.9); } }');
                            };
                        }
                        return clGradeMat(cloned, !!(opts && opts.glow));
                    });
                    o.material = Array.isArray(o.material) ? newMats : newMats[0];
                }
            }
        });
        if (opts && opts.spin) {
            let spinTarget = sub;
            if (opts.spinNode) {
                sub.traverse(o => {
                    if (o.name === opts.spinNode) spinTarget = o;
                });
            }
            CLM.spin.push({ root: spinTarget, sp: opts.spin, axis: opts.spinAxis || 'y' });
        }
        if (opts && opts.skin && tpl.gl.animations && tpl.gl.animations.length) { try { const mx = new THREE.AnimationMixer(sub); mx.clipAction(tpl.gl.animations[0]).play(); mx.update(0.001); CLM.anim.push({ mx, off: Math.random() * 3 }); } catch (e) {} }
        grp.add(sub);
        return sub;
    }

    /* =========================================================================
       1. MINA DE CRISTAL E OURO (2x2) - ENTRADA DE MINA ESTILIZADA COM VIGAS E OURO
       ========================================================================= */
    const CLM_MINA_FILES = [
        'space_gold_mine_top2.glb', 'mina_gold_rock.glb', 'mina_chest_gold.glb', 'mina_chest_ingots.glb',
        'mina_gold_ingots.glb', 'mina_barrels.glb', 'mina_cart.glb',
        'mina_crystal_blue.glb', 'mina_crystal_green.glb', 'mina_derrick.glb'
    ];
    function clMinaPreload() { CLM_MINA_FILES.forEach(f => { if (!CLM.tpl[f] && !CLM.loading[f] && !CLM.failed[f]) clModelLoad(f); }); }
    function clMinaAssemble(grp, level, cv) {
        const THREE = clTh(); if (!THREE || !grp) return;
        level = Math.max(1, level | 0); clMinaPreload();
        if (clProtoUse(grp, 'mina', level, cv)) return;

        const o = { cv };
        // O arquivo da estação de mineração traz 3 unidades lado a lado: são os níveis 1, 2 e 3 (a da direita, com duas máquinas, é a mais avançada). O nível 4 usa a unidade 3 maior, com mais ouro e cristais; o 5+ ganha ainda o cristal dourado girando.
        const unit = level >= 3 ? 3 : level, k = level >= 4 ? 0.235 : 0.21;
        clAddPart(grp, 'space_gold_mine_top2.glb', 0, 0, 0, k, k, k, 0, 0, 0, Object.assign({}, o, { unit }));
        if (level >= 3) { clAddPart(grp, 'mina_barrels.glb', -1.0, 0, 0.7, 0.22, 0.22, 0.22, 0, 0.3, 0, o); clAddPart(grp, 'mina_chest_gold.glb', 1.0, 0, 0.78, 0.22, 0.22, 0.22, 0, -0.4, 0, o); }
        if (level >= 4) { clAddPart(grp, 'mina_gold_ingots.glb', 1.02, 0, 0.1, 0.28, 0.28, 0.28, 0, 0.6, 0, o); clAddPart(grp, 'mina_chest_ingots.glb', -1.02, 0, 0.05, 0.22, 0.22, 0.22, 0, 0.2, 0, o); clAddPart(grp, 'mina_crystal_green.glb', -0.98, 0.25, -0.45, 0.3, 0.3, 0.3, 0.1, 0, -0.25, { glow: true, glowCol: 0x50ff88, glowInt: 1.6 }); clAddPart(grp, 'mina_crystal_blue.glb', 0.0, 1.45, 0, 0.3, 0.3, 0.3, 0, 0.8, 0, { glow: true, glowCol: 0x00e5ff, glowInt: 1.8 }); }
        if (level >= 5) clAddPart(grp, 'mina_crystal_blue.glb', 0.0, 1.85, 0, 0.36, 0.36, 0.36, 0, 0, 0, { glow: true, glowCol: 0xffd27a, glowInt: 2.8, spin: 0.9 });
    }

    /* =========================================================================
       2. FAZENDA (3x2) - CELEIRO RÚSTICO ESTILIZADO E PLANTAÇÕES
       ========================================================================= */
    const CLM_FAZENDA_FILES = [
        'farm_building.glb', 'fp_field_ready.glb', 'fp_cart.glb', 'fp_hay.glb',
        'fp_crates_veg.glb', 'fp_crate_single.glb', 'fp_milktank.glb', 'mina_crystal_blue.glb'
    ];
    function clFazendaPreload() { CLM_FAZENDA_FILES.forEach(f => { if (!CLM.tpl[f] && !CLM.loading[f] && !CLM.failed[f]) clModelLoad(f); }); }
    function clFazendaAssemble(grp, level, cv) {
        level = Math.max(1, level | 0); clFazendaPreload();
        if (clProtoUse(grp, 'fazenda', level, cv)) return;

        const o = { cv };
        // Base: Celeiro rústico estilizado (farm_building.glb) ocupando a ala esquerda do terreno 3x2
        clAddPart(grp, 'farm_building.glb', -0.55, 0.95, 0, 1.0, 1.0, 1.0, 0, 0, 0, o);

        /* o campo fixo saiu: no lugar entram os canteiros reais da Plantação (clFarmAttach), mais canteiros a cada nível; os adereços ficam do lado do celeiro */
        clAddPart(grp, level >= 2 ? 'fp_crates_veg.glb' : 'fp_crate_single.glb', -1.25, 0, 0.68, 0.9, 0.9, 0.9, 0, 0.25, 0, o);
        if (level >= 3) clAddPart(grp, 'fp_milktank.glb', -1.25, 0, -0.65, 1.0 + 0.05 * level, 1.0 + 0.05 * level, 1.0 + 0.05 * level, 0, 0, 0, o);
        if (level >= 2) clAddPart(grp, 'fp_cart.glb', -0.1, 0, 0.82, 0.42, 0.42, 0.42, 0, 0.4, 0, o);
        clAddPart(grp, 'fp_hay.glb', -0.1, 0, -0.82, 0.85, 0.85, 0.85, 0, 0.4, 0, o);
        if (level >= 5) clAddPart(grp, 'mina_crystal_blue.glb', -0.55, 2.05, 0, 0.35, 0.35, 0.35, 0, 0, 0, Object.assign({}, o, { glow: true, glowCol: 0x00e5ff, glowInt: 2.2 }));
        clFarmAttach(grp, level);
    }

        /* =========================================================================
       3. FORJA (2x2) - OFICINA E FERRARIA ESTILIZADA COM FORNALHA E BIGORNA
       ========================================================================= */
    const CLM_FORJA_FILES = [
        'blacksmiths_forge.glb', 'fp_bonfire.glb', 'fp_barrel.glb', 'fp_timber.glb',
        'fp_cart.glb', 'fp_crate_single.glb', 'mina_gold_ingots.glb', 'mina_crystal_blue.glb'
    ];
    function clForjaPreload() { CLM_FORJA_FILES.forEach(f => { if (!CLM.tpl[f] && !CLM.loading[f] && !CLM.failed[f]) clModelLoad(f); }); }
    function clForjaAssemble(grp, level, cv) {
        level = Math.max(1, level | 0); clForjaPreload();
        if (clProtoUse(grp, 'forja', level, cv)) return;

        const o = { cv };
        // Base: Oficina e ferraria estilizada com fornalha, bigorna e ferramentas (blacksmiths_forge.glb)
        clAddPart(grp, 'blacksmiths_forge.glb', 0.103, 0, 0.097, 0.070, 0.070, 0.070, 0, 0, 0, o);
        // Brilho quente do fogo da fornalha
        clAddPart(grp, 'mina_crystal_blue.glb', -0.15, 0.40, -0.10, 0.12, 0.12, 0.12, 0, 0, 0, Object.assign({}, o, { glow: true, glowCol: 0xff6b22, glowInt: 2.2 }));

        if (level === 1) {
            clAddPart(grp, 'fp_barrel.glb', -0.68, 0, 0.65, 0.85, 0.85, 0.85, 0, 0.3, 0, o);
            clAddPart(grp, 'fp_timber.glb', 0.68, 0, -0.45, 0.90, 0.90, 0.90, 0, 0.3, 0, o);
        } else if (level === 2) {
            clAddPart(grp, 'fp_barrel.glb', -0.68, 0, 0.65, 0.90, 0.90, 0.90, 0, 0.3, 0, o);
            clAddPart(grp, 'fp_timber.glb', 0.68, 0, -0.45, 0.95, 0.95, 0.95, 0, 0.3, 0, o);
            clAddPart(grp, 'mina_gold_ingots.glb', 0.35, 0, 0.75, 0.28, 0.28, 0.28, 0, -0.2, 0, o);
        } else if (level === 3) {
            clAddPart(grp, 'fp_barrel.glb', -0.68, 0, 0.65, 0.95, 0.95, 0.95, 0, 0.3, 0, o);
            clAddPart(grp, 'fp_barrel.glb', -0.72, 0, 0.35, 0.85, 0.85, 0.85, 0, 0.5, 0, o);
            clAddPart(grp, 'fp_timber.glb', 0.68, 0, -0.45, 1.0, 1.0, 1.0, 0, 0.3, 0, o);
            clAddPart(grp, 'fp_crate_single.glb', 0.68, 0, 0.45, 0.85, 0.85, 0.85, 0, -0.4, 0, o);
            clAddPart(grp, 'mina_gold_ingots.glb', 0.35, 0, 0.75, 0.30, 0.30, 0.30, 0, -0.2, 0, o);
        } else if (level === 4) {
            clAddPart(grp, 'fp_cart.glb', -0.75, 0, -0.45, 0.45, 0.45, 0.45, 0, 0.8, 0, o);
            clAddPart(grp, 'fp_barrel.glb', -0.68, 0, 0.65, 1.0, 1.0, 1.0, 0, 0.3, 0, o);
            clAddPart(grp, 'fp_barrel.glb', -0.72, 0, 0.35, 0.90, 0.90, 0.90, 0, 0.5, 0, o);
            clAddPart(grp, 'fp_timber.glb', 0.68, 0, -0.45, 1.05, 1.05, 1.05, 0, 0.3, 0, o);
            clAddPart(grp, 'fp_crate_single.glb', 0.68, 0, 0.45, 0.90, 0.90, 0.90, 0, -0.4, 0, o);
            clAddPart(grp, 'mina_gold_ingots.glb', 0.35, 0, 0.75, 0.32, 0.32, 0.32, 0, -0.2, 0, o);
            clAddPart(grp, 'mina_crystal_blue.glb', 0.15, 1.35, 0.10, 0.22, 0.22, 0.22, 0, 0, 0, Object.assign({}, o, { glow: true, glowCol: 0xff7a22, glowInt: 2.4 }));
        } else {
            clAddPart(grp, 'fp_cart.glb', -0.75, 0, -0.45, 0.48, 0.48, 0.48, 0, 0.8, 0, o);
            clAddPart(grp, 'fp_barrel.glb', -0.68, 0, 0.65, 1.05, 1.05, 1.05, 0, 0.3, 0, o);
            clAddPart(grp, 'fp_barrel.glb', -0.72, 0, 0.35, 0.95, 0.95, 0.95, 0, 0.5, 0, o);
            clAddPart(grp, 'fp_timber.glb', 0.68, 0, -0.45, 1.1, 1.1, 1.1, 0, 0.3, 0, o);
            clAddPart(grp, 'fp_crate_single.glb', 0.68, 0, 0.45, 0.95, 0.95, 0.95, 0, -0.4, 0, o);
            clAddPart(grp, 'mina_gold_ingots.glb', 0.35, 0, 0.75, 0.34, 0.34, 0.34, 0, -0.2, 0, o);
            clAddPart(grp, 'mina_crystal_blue.glb', 0.15, 1.55, 0.10, 0.32, 0.32, 0.32, 0, 0, 0, Object.assign({}, o, { glow: true, glowCol: 0xffaa33, glowInt: 3.0, spin: 1.0 }));
        }
    }

/* =========================================================================
       4. ARMAZÉM (2x2)
       ========================================================================= */
    const CLM_ARMAZEM_FILES = [
        'fp_cart.glb', 'fp_crates_veg.glb', 'fp_crate_single.glb', 'fp_hay.glb', 'fp_milktank.glb', 'mina_chest_gold.glb', 'mina_crystal_blue.glb'
    ];
    function clArmazemPreload() { CLM_ARMAZEM_FILES.forEach(f => { if (!CLM.tpl[f] && !CLM.loading[f] && !CLM.failed[f]) clModelLoad(f); }); }
    function clProcTools(THREE, grp) {   /* ferramentas comuns das construções feitas em código: texturas desenhadas em canvas (guardadas), materiais com o ajuste de cor comum, caixas e meshes */
        const C = CLM._cab || (CLM._cab = {});
        const rn = (() => { let s = 31; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
        const tex = (k, draw, rx, ry) => { if (C['t' + k]) return C['t' + k]; const cvs = document.createElement('canvas'); cvs.width = cvs.height = 64; draw(cvs.getContext('2d')); const t = new THREE.CanvasTexture(cvs); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; return (C['t' + k] = t); };
        const mat = (k, col, extra) => C['m' + k] || (C['m' + k] = clGradeMat(new THREE.MeshStandardMaterial(Object.assign({ color: col, roughness: 0.85, metalness: 0.02 }, extra || {})), !!(extra && extra.emissive)));
        const geo = (k, f) => C['g' + k] || (C['g' + k] = f());
        const box = (w, h, d) => geo('b' + w + '_' + h + '_' + d, () => new THREE.BoxGeometry(w, h, d));
        const add = (g, m, x, y, z, rx, ry, rz) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); if (rx) o.rotation.x = rx; if (ry) o.rotation.y = ry; if (rz) o.rotation.z = rz; o.castShadow = true; o.receiveShadow = true; o.frustumCulled = false; grp.add(o); return o; };
        const arch = (k, w, h, d) => geo(k, () => { const s = new THREE.Shape(), r = w / 2; s.moveTo(-r, 0); s.lineTo(r, 0); s.lineTo(r, h); s.absarc(0, h, r, 0, Math.PI, false); s.lineTo(-r, 0); const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }); g.translate(0, 0, -d / 2); return g; });
        const stoneTex = (key) => tex(key, g => { g.fillStyle = '#e4e4e4'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 90; i++) { const v = 150 + Math.floor(rn() * 100); g.fillStyle = 'rgba(' + v + ',' + v + ',' + v + ',0.7)'; g.fillRect(Math.floor(rn() * 62), Math.floor(rn() * 62), 3 + Math.floor(rn() * 5), 2 + Math.floor(rn() * 4)); } g.strokeStyle = 'rgba(0,0,0,0.22)'; for (let i = 0; i < 6; i++) g.strokeRect(Math.floor(rn() * 40), Math.floor(rn() * 40), 12 + Math.floor(rn() * 14), 10 + Math.floor(rn() * 10)); }, 2, 2);
        const brickTex = (key) => tex(key, g => { g.fillStyle = '#e9e9e9'; g.fillRect(0, 0, 64, 64); for (let r = 0; r < 4; r++) for (let c = -1; c < 3; c++) { const x = c * 32 + (r % 2) * 16, v = 205 + Math.floor(rn() * 45); g.fillStyle = 'rgb(' + v + ',' + v + ',' + v + ')'; g.fillRect(x + 1, r * 16 + 1, 30, 14); } g.fillStyle = 'rgba(0,0,0,0.30)'; for (let r = 0; r < 4; r++) { g.fillRect(0, r * 16, 64, 1); for (let c = -1; c < 3; c++) g.fillRect(c * 32 + (r % 2) * 16, r * 16, 1, 16); } }, 3, 3);
        const plankTex = (key, rx, ry) => tex(key, g => { g.fillStyle = '#e8e8e8'; g.fillRect(0, 0, 64, 64); for (let x = 0; x < 64; x += 16) { const v = 205 + Math.floor(rn() * 40); g.fillStyle = 'rgb(' + v + ',' + v + ',' + v + ')'; g.fillRect(x, 0, 16, 64); g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(x, 0, 2, 64); for (let i = 0; i < 5; i++) { g.fillStyle = 'rgba(0,0,0,0.14)'; g.fillRect(x + 3 + Math.floor(rn() * 10), Math.floor(rn() * 56), 1, 8); } } }, rx, ry);
        const shingleTex = (key) => tex(key, g => { g.fillStyle = '#e8e8e8'; g.fillRect(0, 0, 64, 64); for (let b = 0; b < 2; b++) { const x0 = b * 32, off = (b * 16) % 32; for (let k = -1; k < 3; k++) { const y0 = off + k * 32, v = 215 + Math.floor(rn() * 40); g.fillStyle = 'rgb(' + v + ',' + v + ',' + v + ')'; g.fillRect(x0, y0, 32, 32); g.fillStyle = 'rgba(0,0,0,0.30)'; g.fillRect(x0 + 28, y0, 4, 32); g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(x0, y0, 32, 2); g.fillRect(x0, y0 + 30, 32, 2); g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(x0 + 2, y0 + 4, 3, 24); } } }, 2, 3);
        return { C, rn, tex, mat, geo, box, add, arch, stoneTex, brickTex, plankTex, shingleTex };
    }
    function clArmazemBuild(grp, cv, level) {   /* armazém abobadado que CRESCE a cada nível: 1 um galpão curto, 2 galpão longo com doca, 3 dois galpões lado a lado com silo, 4 galpões mais compridos, dois silos e guindaste, 5 torre central de pedra com cúpula dourada e três silos */
        const THREE = clTh(); if (!THREE || !grp) return;
        const L = Math.max(1, level | 0);
        const pal = (cv > 0 && typeof CLD !== 'undefined' && CLD.PAL && CLD.PAL[cv - 1]) ? CLD.PAL[cv - 1] : null;
        const roofCol = pal ? pal[1] : '#b8502f';
        const T = clProcTools(THREE, grp), tex = T.tex, mat = T.mat, geo = T.geo, box = T.box, add = T.add, rn = T.rn;
        const planks = T.plankTex('pvA', 3, 1), stoneT = T.stoneTex('astB');
        const corr = tex('crA', g => { g.fillStyle = '#e8e8e8'; g.fillRect(0, 0, 64, 64); for (let y = 0; y < 64; y += 8) { g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(0, y, 64, 3); g.fillStyle = 'rgba(0,0,0,0.34)'; g.fillRect(0, y + 4, 64, 3); } for (let i = 0; i < 14; i++) { g.fillStyle = 'rgba(60,30,10,0.10)'; g.fillRect(Math.floor(rn() * 56), Math.floor(rn() * 60), 10 + Math.floor(rn() * 14), 3); } }, 1, 7);
        const vcorr = tex('crB', g => { g.fillStyle = '#e4e4e4'; g.fillRect(0, 0, 64, 64); for (let x = 0; x < 64; x += 8) { g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(x, 0, 3, 64); g.fillStyle = 'rgba(0,0,0,0.30)'; g.fillRect(x + 4, 0, 3, 64); } }, 3, 1);
        const M = { wall: mat('xwA', '#6e4326', { map: planks }), door: mat('xdA', '#4f2f18', { map: planks }), stone: mat('xsA', '#8a8682', { map: stoneT }), roof: mat('xrA' + roofCol, roofCol, { map: corr, side: THREE.DoubleSide, metalness: 0.25, roughness: 0.6 }), silo: mat('xsl', '#7d8ea0', { map: vcorr, metalness: 0.3 }), steel: mat('xstA', '#3a3a42', { metalness: 0.4 }), cap: mat('xcp' + roofCol, roofCol, { metalness: 0.25 }), gold: mat('xgd', '#e8b84a', { metalness: 0.45, roughness: 0.35 }), glass: mat('xgA', '#ffe2a0', { emissive: 0xffb347, emissiveIntensity: 0.5, roughness: 0.4 }) };
        add(box(1.8, 0.07, 1.56), M.stone, 0, 0.035, 0);
        const bays = L === 1 ? [{ x: 0, r: 0.5, len: 1.05 }] : L === 2 ? [{ x: 0, r: 0.6, len: 1.5 }] : [{ x: -0.48, r: 0.43, len: L >= 4 ? 1.5 : 1.3 }, { x: 0.48, r: 0.43, len: L >= 4 ? 1.5 : 1.3 }];
        bays.forEach((b, bi) => {
            const hz = b.len / 2, key = 'xv' + b.r + '_' + b.len;
            add(box(b.r * 2 - 0.02, 0.26, b.len), M.wall, b.x, 0.2, 0);
            add(geo(key, () => new THREE.CylinderGeometry(b.r, b.r, b.len, 28, 1, true, -Math.PI / 2, Math.PI).rotateX(-Math.PI / 2)), M.roof, b.x, 0.33, 0);
            [-b.len * 0.36, 0, b.len * 0.36].forEach(z => add(geo('xrb' + b.r, () => new THREE.TorusGeometry(b.r + 0.015, 0.013, 6, 28, Math.PI)), M.steel, b.x, 0.33, z));
            add(geo('xcf' + b.r, () => new THREE.CircleGeometry(b.r, 28, 0, Math.PI)), M.wall, b.x, 0.33, hz + 0.03); add(geo('xcf' + b.r, () => new THREE.CircleGeometry(b.r, 28, 0, Math.PI)), M.wall, b.x, 0.33, -hz - 0.03, 0, Math.PI, 0);
            const dw = Math.min(0.46, b.r * 0.85), dh = 0.2 + b.r * 0.12;
            add(T.arch('xfr' + dw, dw + 0.1, dh, 0.03), M.stone, b.x, 0.07, hz + 0.03); add(T.arch('xdr' + dw, dw, dh - 0.04, 0.04), M.door, b.x, 0.07, hz + 0.045);
            [0.12, 0.28].forEach(y => add(box(dw, 0.03, 0.045), M.steel, b.x, 0.07 + y, hz + 0.075)); add(box(0.03, dh + dw / 2 - 0.05, 0.045), M.steel, b.x, 0.07 + (dh + dw / 2) / 2 - 0.02, hz + 0.075);
            add(box(0.22, 0.02, 0.02), M.steel, b.x + dw / 2 + 0.07, 0.6, hz + 0.05); add(box(0.07, 0.09, 0.07), M.glass, b.x + dw / 2 + 0.16, 0.56, hz + 0.05);
        });
        add(box(0.5, 0.04, 0.34), M.stone, 0, 0.09, bays[0].len / 2 + 0.2 - (L >= 3 ? 0 : 0), -0.08, 0, 0);
        const siloAt = (x, z, r, h) => { add(geo('xsl' + r + h, () => new THREE.CylinderGeometry(r, r + 0.02, h, 16)), M.silo, x, 0.07 + h / 2, z); add(geo('xsc' + r, () => new THREE.ConeGeometry(r + 0.06, 0.28, 16)), M.cap, x, 0.07 + h + 0.14, z); [0.3, h - 0.22].forEach(y => add(geo('xsb' + r, () => new THREE.TorusGeometry(r + 0.015, 0.012, 6, 20).rotateX(Math.PI / 2)), M.steel, x, 0.07 + y, z)); };
        if (L === 3) siloAt(0, -0.6, 0.2, 0.9);
        if (L === 4) { siloAt(-0.3, -0.64, 0.19, 1.0); siloAt(0.3, -0.64, 0.19, 1.0); }
        if (L >= 5) { siloAt(-0.62, -0.64, 0.17, 0.95); siloAt(0.62, -0.64, 0.17, 0.95); }
        if (L >= 4) {
            add(geo('xcpo', () => new THREE.CylinderGeometry(0.045, 0.055, 0.95, 8)), M.steel, -0.95, 0.52, 0.55);
            add(box(0.62, 0.05, 0.05), M.steel, -0.66, 1.0, 0.55); add(box(0.05, 0.05, 0.3), M.steel, -0.95, 0.98, 0.45);
            add(geo('xrp', () => new THREE.CylinderGeometry(0.008, 0.008, 0.3, 5)), M.steel, -0.42, 0.85, 0.55); add(box(0.14, 0.12, 0.14), M.wall, -0.42, 0.66, 0.55);
        }
        if (L >= 5) {
            add(geo('xtw', () => new THREE.CylinderGeometry(0.26, 0.3, 1.1, 20)), M.stone, 0, 0.62, -0.6);
            [0.35, 0.8].forEach(y => add(geo('xtr', () => new THREE.TorusGeometry(0.28, 0.02, 6, 24).rotateX(Math.PI / 2)), M.gold, 0, y, -0.6));
            for (let k = 0; k < 6; k++) { const a = k * 1.05; const w = add(box(0.06, 0.12, 0.03), M.glass, Math.sin(a) * 0.27, 0.9, -0.6 + Math.cos(a) * 0.27); w.rotation.y = a; }
            add(geo('xtd', () => new THREE.SphereGeometry(0.3, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2)), M.gold, 0, 1.17, -0.6); add(geo('xtf', () => new THREE.SphereGeometry(0.04, 8, 6)), M.gold, 0, 1.5, -0.6);
            add(geo('xtp', () => new THREE.CylinderGeometry(0.03, 0.03, 0.9, 8).rotateZ(Math.PI / 2)), M.steel, 0, 0.78, -0.35);
        }
    }
    function clArmazemAssemble(grp, level, cv) {
        level = Math.max(1, level | 0); clArmazemPreload();
        if (clProtoUse(grp, 'armazem', level, cv)) return;

        clArmazemBuild(grp, cv, level);   // a estrutura cresce a cada nível; só os níveis altos ganham poucos acessórios
        const o = { cv };
        if (level >= 2) clAddPart(grp, 'fp_crate_single.glb', -0.55, 0, 0.95, 0.85, 0.85, 0.85, 0, 0.3, 0, o);
        if (level >= 4) clAddPart(grp, 'fp_milktank.glb', 0.95, 0, 0.35, 1.1, 1.1, 1.1, 0, 0, 0, o);
    }

        /* =========================================================================
       5. MOINHO (2x2) - MOINHO HOLANDÊS & TRELIÇADO COM PÁS GIRATÓRIAS
       ========================================================================= */
    const CLM_MOINHO_FILES = [
        'windmill_stylized.glb', 'fp_cart.glb', 'fp_hay.glb', 'fp_barrel.glb', 'fp_crate_single.glb', 'fp_crates_veg.glb', 'mina_crystal_blue.glb'
    ];
    function clMoinhoPreload() { CLM_MOINHO_FILES.forEach(f => { if (!CLM.tpl[f] && !CLM.loading[f] && !CLM.failed[f]) clModelLoad(f); }); }
    function clMoinhoAssemble(grp, level, cv) {
        level = Math.max(1, level | 0); clMoinhoPreload();
        if (clProtoUse(grp, 'moinho', level, cv)) return;

        const o = { cv };
        // Base: moinho de madeira pintada com base de pedra (windmill_stylized.glb, com as pás animadas por esqueleto). Escala 0,4 e virado para a câmera. Evolução padrão: 1 só o moinho, 2 + feno, 3 + barril e caixa, 4 + carroça e legumes, 5+ + cristal ciano
        const KM = [0.34, 0.37, 0.40, 0.43, 0.46][Math.min(5, level) - 1];   /* o moinho também cresce com o nível */
        clAddPart(grp, 'windmill_stylized.glb', 0.188 * KM / 0.4, 0.024 * KM / 0.4, 0.078 * KM / 0.4, KM, KM, KM, 0, -Math.PI / 2, 0, Object.assign({}, o, { skin: true }));
        /* sem itens espalhados no chão: a evolução do moinho está nas hélices (36jn-colony-moinho-fx.js) */
    }

/* =========================================================================
       6. HABITAÇÕES: CABANA (1x1) & CASA (2x2)
       ========================================================================= */
    const CLM_CABANA_FILES = [
        'fp_crate_single.glb', 'fp_crates_veg.glb', 'fp_hay.glb', 'mina_crystal_blue.glb'
    ];
    function clCabanaPreload() { CLM_CABANA_FILES.forEach(f => { if (!CLM.tpl[f] && !CLM.loading[f] && !CLM.failed[f]) clModelLoad(f); }); }
    function clCabanaBuild(grp, cv, level) {   /* cabana redonda de palha que CRESCE a cada nível: 1 cabana pequena, 2 maior sobre deque com varanda, 3 dois andares, 4 anexo lateral e telhado ampliado, 5 três andares com lanterna-coroa */
        const THREE = clTh(); if (!THREE || !grp) return;
        const L = Math.max(1, level | 0);
        const pal = (cv > 0 && typeof CLD !== 'undefined' && CLD.PAL && CLD.PAL[cv - 1]) ? CLD.PAL[cv - 1] : null;
        const roofCol = pal ? pal[1] : '#e0b25c';
        const T = clProcTools(THREE, grp), tex = T.tex, mat = T.mat, geo = T.geo, box = T.box, add = T.add, rn = T.rn;
        const sticks = tex('cs', g => { g.fillStyle = '#efefef'; g.fillRect(0, 0, 64, 64); for (let x = 0; x < 64; x += 8) { const v = 215 + Math.floor(rn() * 35); g.fillStyle = 'rgb(' + v + ',' + v + ',' + v + ')'; g.fillRect(x, 0, 8, 64); g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(x, 0, 1, 64); g.fillStyle = 'rgba(0,0,0,0.15)'; g.fillRect(x + 3, 0, 1, 64); for (let y = 12; y < 64; y += 24) { g.fillStyle = 'rgba(0,0,0,0.28)'; g.fillRect(x, y, 8, 2); } } }, 6, 1);
        const thatch = tex('ct', g => { g.fillStyle = '#ececec'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 150; i++) { const v = 170 + Math.floor(rn() * 85); g.fillStyle = 'rgba(' + v + ',' + v + ',' + (v - 30) + ',0.8)'; g.fillRect(Math.floor(rn() * 64), Math.floor(rn() * 60), 1 + Math.floor(rn() * 2), 3 + Math.floor(rn() * 9)); } for (let y = 0; y < 64; y += 16) { g.fillStyle = 'rgba(0,0,0,0.22)'; g.fillRect(0, y, 64, 2); } }, 5, 2);
        const planks = tex('cp', g => { g.fillStyle = '#efefef'; g.fillRect(0, 0, 64, 64); for (let x = 0; x < 64; x += 16) { g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(x, 0, 2, 64); } for (let i = 0; i < 20; i++) { g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(Math.floor(rn() * 64), Math.floor(rn() * 56), 1, 8); } }, 3, 3);
        const M = { deck: mat('cd', '#a8774a', { map: planks }), wall: mat('cw', '#cfa86a', { map: sticks }), roof: mat('cr' + roofCol, roofCol, { map: thatch }), dark: mat('cdk', '#4a3320'), rope: mat('cro', '#8a6a3c'), wood: mat('cwd', '#8a5a32', { map: planks }), glass: mat('cg', '#ffe9b0', { emissive: 0xffb347, emissiveIntensity: 0.5, roughness: 0.4 }) };
        const y0 = L >= 2 ? 0.08 : 0.04;
        if (L >= 2) add(geo('cdk8', () => new THREE.CylinderGeometry(0.46, 0.5, 0.08, 8)), M.deck, 0, 0.04, 0); else add(geo('cdk6', () => new THREE.CylinderGeometry(0.34, 0.37, 0.05, 10)), M.deck, 0, 0.025, 0);
        const r1 = L === 1 ? 0.25 : 0.31, h1 = 0.34;
        add(geo('cwl' + r1, () => new THREE.CylinderGeometry(r1 * 0.96, r1, h1, 14)), M.wall, 0, y0 + h1 / 2, 0);
        [0.36, 0.12].forEach(f => add(geo('crp' + r1 + f, () => new THREE.TorusGeometry(r1 + 0.012, 0.013, 6, 24).rotateX(Math.PI / 2)), M.rope, 0, y0 + h1 * f / 0.34 * 0.34 * 0.9 + 0.02, 0));
        add(box(0.14, 0.2, 0.04), M.dark, 0, y0 + 0.1, r1 - 0.005); add(geo('cdc', () => new THREE.CylinderGeometry(0.07, 0.07, 0.04, 12).rotateX(Math.PI / 2)), M.dark, 0, y0 + 0.2, r1 - 0.005);
        [-1, 1].forEach(sx => add(geo('cwn', () => new THREE.CylinderGeometry(0.055, 0.055, 0.03, 12).rotateZ(Math.PI / 2)), M.glass, sx * r1, y0 + 0.24, 0));
        let top = y0 + h1;
        if (L < 3) {
            add(geo('cr1' + r1, () => new THREE.ConeGeometry(r1 + 0.27, 0.18, 14, 1, true)), M.roof, 0, top + 0.01, 0);
            add(geo('cr2' + r1, () => new THREE.ConeGeometry(r1 + 0.18, 0.5, 14)), M.roof, 0, top + 0.25, 0); top += 0.5;
        } else {
            add(geo('cr3' + r1, () => new THREE.ConeGeometry(r1 + 0.3, 0.2, 16, 1, true)), M.roof, 0, top + 0.04, 0);
            const r2 = r1 * 0.74, y2 = top + 0.1;
            add(geo('cw2' + r2, () => new THREE.CylinderGeometry(r2 * 0.96, r2, 0.27, 14)), M.wall, 0, y2 + 0.135, 0);
            add(geo('crp2' + r2, () => new THREE.TorusGeometry(r2 + 0.012, 0.012, 6, 22).rotateX(Math.PI / 2)), M.rope, 0, y2 + 0.22, 0);
            for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + 0.4; const w = add(box(0.07, 0.09, 0.03), M.glass, Math.sin(a) * r2, y2 + 0.15, Math.cos(a) * r2); w.rotation.y = a; }
            top = y2 + 0.27;
            if (L < 5) { add(geo('cr4' + r2, () => new THREE.ConeGeometry(r2 + 0.2, 0.2, 14, 1, true)), M.roof, 0, top + 0.03, 0); add(geo('cr5' + r2, () => new THREE.ConeGeometry(r2 + 0.14, 0.46, 14)), M.roof, 0, top + 0.26, 0); top += 0.46; }
            else {
                add(geo('cr6' + r2, () => new THREE.ConeGeometry(r2 + 0.22, 0.18, 14, 1, true)), M.roof, 0, top + 0.03, 0);
                const r3 = r2 * 0.68, y3 = top + 0.08;
                add(geo('cw3' + r3, () => new THREE.CylinderGeometry(r3 * 0.96, r3, 0.22, 12)), M.wall, 0, y3 + 0.11, 0);
                for (let k = 0; k < 3; k++) { const a = k * 2.1; const w = add(box(0.06, 0.08, 0.03), M.glass, Math.sin(a) * r3, y3 + 0.12, Math.cos(a) * r3); w.rotation.y = a; }
                top = y3 + 0.22; add(geo('cr7' + r3, () => new THREE.ConeGeometry(r3 + 0.15, 0.4, 12)), M.roof, 0, top + 0.2, 0); top += 0.4;
                add(geo('cl5', () => new THREE.SphereGeometry(0.07, 12, 10)), mat('cgl', '#ffe9b0', { emissive: 0xffc860, emissiveIntensity: 0.8, roughness: 0.3 }), 0, top + 0.09, 0); top += 0.16;
            }
        }
        add(geo('cfn', () => new THREE.SphereGeometry(0.045, 8, 6)), M.wood, 0, top + 0.03, 0);
        if (L >= 2) { add(box(0.22, 0.04, 0.13), M.wood, 0, 0.1, 0.44); [-1, 1].forEach(sx => add(geo('cps', () => new THREE.CylinderGeometry(0.022, 0.022, 0.34, 6)), M.wood, sx * 0.19, 0.25, 0.46)); add(box(0.46, 0.03, 0.03), M.wood, 0, 0.43, 0.46); add(box(0.05, 0.07, 0.05), M.glass, 0.12, 0.38, 0.46); }
        if (L >= 4) {
            const ax = 0.38, az = -0.12, ar = 0.15;
            add(geo('can', () => new THREE.CylinderGeometry(ar * 0.96, ar, 0.24, 12)), M.wall, ax, 0.08 + 0.12, az);
            add(geo('cac', () => new THREE.ConeGeometry(ar + 0.1, 0.3, 12)), M.roof, ax, 0.08 + 0.24 + 0.14, az);
            add(box(0.06, 0.08, 0.03), M.glass, ax, 0.2, az + ar); add(box(0.1, 0.04, 0.1), M.wood, ax - 0.2, 0.1, az + 0.05);
        }
    }
    function clCabanaAssemble(grp, level, cv) {
        level = Math.max(1, level | 0); clCabanaPreload();
        if (clProtoUse(grp, 'cabana', level, cv)) return;

        clCabanaBuild(grp, cv, level);
    }

    /* =========================================================================
       6B. CASA DA BRUXA (2x2) - WITCH HOUSE ESTILIZADA
       ========================================================================= */
    const CLM_CABANA_BRUXA_FILES = ['witch_house.glb', 'abobora.glb', 'mina_crystal_blue.glb'];
    function clCabanaBruxaPreload() { CLM_CABANA_BRUXA_FILES.forEach(f => { if (!CLM.tpl[f] && !CLM.loading[f] && !CLM.failed[f]) clModelLoad(f); }); }
    function clCabanaBruxaAssemble(grp, level, cv) {
        level = Math.max(1, level | 0); clCabanaBruxaPreload();
        const o = { cv };
        // Base: Casa da Bruxa estilizada (witch_house.glb) dimensionada para preencher o lote 2x2 com perfeição
        clAddPart(grp, 'witch_house.glb', 0, 1.21, 0, 2.42, 2.42, 2.42, 0, 0, 0, o);
        // Abóboras místicas de Halloween na entrada
        clAddPart(grp, 'abobora.glb', 0.68, 0, 0.65, 0.22, 0.22, 0.22, 0, 0.4, 0, o);
        if (level >= 2) {
            clAddPart(grp, 'abobora.glb', -0.68, 0, 0.65, 0.18, 0.18, 0.18, 0, -0.3, 0, o);
        }
        if (level >= 3) {
            // Orbe / cristal de magia violeta levitando sobre a casa
            clAddPart(grp, 'mina_crystal_blue.glb', 0, 2.65, -0.1, 0.32, 0.32, 0.32, 0, 0, 0, Object.assign({}, o, { glow: true, glowCol: 0xb79cff, glowInt: 2.6, spin: 0.8 }));
        }
        if (level >= 4) {
            clAddPart(grp, 'abobora.glb', 0.78, 0, -0.45, 0.16, 0.16, 0.16, 0, 0.8, 0, o);
        }
        if (level >= 5) {
            clAddPart(grp, 'mina_crystal_blue.glb', 0.68, 0.55, 0.65, 0.20, 0.20, 0.20, 0, 0, 0, Object.assign({}, o, { glow: true, glowCol: 0x9d4edd, glowInt: 3.0 }));
        }
    }

    /* =========================================================================
       6. CASA (2x2) - COZY COTTAGE ACONCHEGANTE
       ========================================================================= */
    const CLM_CASA_FILES = ['fp_crate_single.glb', 'fp_crates_veg.glb', 'fp_hay.glb', 'mina_crystal_blue.glb', 'praca_bench.glb', 'praca_well.glb', 'pumpkin_crop.glb', 'carrot_crop.glb'];
    function clCasaPreload() { CLM_CASA_FILES.forEach(f => { if (!CLM.tpl[f] && !CLM.loading[f] && !CLM.failed[f]) clModelLoad(f); }); }
    /* junta todas as peças de uma construção em poucas malhas (uma por material): a casa tem ~100 peças e fica leve para desenhar */
    function clMergeByMat(root, THREE) {
        root.updateMatrixWorld(true);
        const extras = [], spins = []; root.traverse(o => { if (o.name === 'sails' && o !== root) spins.push(o); });
        spins.forEach(sg => {   /* peças que giram (hélices do moinho) ficam num nó próprio, que o jogo faz rodar */
            const wp = new THREE.Vector3(), wq = new THREE.Quaternion(), ws = new THREE.Vector3(); sg.matrixWorld.decompose(wp, wq, ws);
            sg.parent.remove(sg); sg.position.set(0, 0, 0); sg.rotation.set(0, 0, 0); sg.scale.set(1, 1, 1); sg.updateMatrixWorld(true);
            const inner = clMergeByMat(sg, THREE), spin = new THREE.Group(); spin.name = 'sails'; spin.add(inner);
            const outer = new THREE.Group(); outer.position.copy(wp); outer.quaternion.copy(wq); outer.scale.copy(ws); outer.add(spin); extras.push(outer);
        });
        root.updateMatrixWorld(true);
        const buckets = new Map();
        const put = (mat, cast, P, N, U) => { const key = mat.uuid + (cast ? 'c' : 'n'); let b = buckets.get(key); if (!b) { b = { mat, cast, P: [], N: [], U: [] }; buckets.set(key, b); } b.P.push(P); b.N.push(N); b.U.push(U); };
        root.traverse(o => {
            if (!o.isMesh || !o.geometry) return;
            const g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
            g.applyMatrix4(o.matrixWorld);
            if (!g.attributes.normal) g.computeVertexNormals();
            const n = g.attributes.position.count, P = g.attributes.position.array, N = g.attributes.normal.array, U = g.attributes.uv ? g.attributes.uv.array : new Float32Array(n * 2);
            if (Array.isArray(o.material)) { (g.groups && g.groups.length ? g.groups : [{ start: 0, count: n, materialIndex: 0 }]).forEach(gr => { const m = o.material[gr.materialIndex]; if (m) put(m, o.castShadow, P.slice(gr.start * 3, (gr.start + gr.count) * 3), N.slice(gr.start * 3, (gr.start + gr.count) * 3), U.slice(gr.start * 2, (gr.start + gr.count) * 2)); }); }
            else put(o.material, o.castShadow, P, N, U);
            g.dispose();
        });
        const out = new THREE.Group();
        const cat = arrs => { let t = 0; arrs.forEach(a => { t += a.length; }); const r = new Float32Array(t); let k = 0; arrs.forEach(a => { r.set(a, k); k += a.length; }); return r; };
        buckets.forEach(b => {
            const g = new THREE.BufferGeometry();
            g.setAttribute('position', new THREE.BufferAttribute(cat(b.P), 3)); g.setAttribute('normal', new THREE.BufferAttribute(cat(b.N), 3)); g.setAttribute('uv', new THREE.BufferAttribute(cat(b.U), 2));
            const m = new THREE.Mesh(g, b.mat); m.castShadow = b.cast; m.receiveShadow = true; m.frustumCulled = false; out.add(m);
        });
        extras.forEach(e => out.add(e));
        return out;
    }
    /* casa de enxaimel: a MESMA casa do protótipo aprovado (reboco manchado, vigas, janelas com floreira, telhado de telhas com forro por baixo, chaminé). Cresce a cada nível: 1 térrea, 2 puxado com lenha, 3 segundo andar, 4 ala lateral com outra chaminé */
    function clCasaTemplate(THREE, L, roofTint) {
        const C = CLM._casaTex || (CLM._casaTex = {});
        const mk = (k, w, h, draw, rx, ry) => { if (C[k]) return C[k]; const cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d'), w, h); const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; t.encoding = THREE.sRGBEncoding; t.repeat.set(rx, ry); return (C[k] = t); };
        const rr = (() => { let sd = 7; return () => (sd = (sd * 16807) % 2147483647) / 2147483647; })();
        const plasterT = mk('pl', 256, 256, (g, w, h) => {
            g.fillStyle = '#f6e6cc'; g.fillRect(0, 0, w, h);
            for (let i = 0; i < 260; i++) { g.fillStyle = rr() > 0.5 ? 'rgba(255,248,232,0.22)' : 'rgba(214,176,128,0.16)'; g.beginPath(); g.arc(rr() * w, rr() * h, 3 + rr() * 14, 0, 7); g.fill(); }
            for (let i = 0; i < 700; i++) { g.fillStyle = 'rgba(150,110,70,0.10)'; g.fillRect(rr() * w, rr() * h, 1 + rr() * 2, 1); }
            g.strokeStyle = 'rgba(120,84,50,0.28)'; g.lineWidth = 1;
            for (let i = 0; i < 6; i++) { let x = rr() * w, y = rr() * h * 0.6; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (rr() - 0.5) * 16; y += 4 + rr() * 9; g.lineTo(x, y); } g.stroke(); }
            g.fillStyle = 'rgba(232,196,150,0.35)'; g.fillRect(0, h - 28, w, 28);
            for (let x = 0; x < w; x += 6) { g.fillStyle = 'rgba(130,100,70,0.18)'; g.fillRect(x, h - 28 + rr() * 8, 5, 3 + rr() * 10); }
        }, 1, 1);
        const woodT = mk('wd', 128, 256, (g, w, h) => {   /* madeira clara com veios brancos (a madeira da vila) */
            g.fillStyle = '#b99672'; g.fillRect(0, 0, w, h);
            for (let i = 0; i < 90; i++) { g.fillStyle = rr() > 0.5 ? 'rgba(190,168,132,0.30)' : 'rgba(255,255,255,0.45)'; g.fillRect(rr() * w, rr() * h, 1 + rr() * 2, 6 + rr() * 30); }
            g.fillStyle = 'rgba(150,126,92,0.55)'; for (let x = 0; x < w; x += 42) g.fillRect(x, 0, 2, h);
            for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(120,96,64,0.18)'; g.beginPath(); g.arc(rr() * w, rr() * h, 1 + rr() * 2, 0, 7); g.fill(); }
        }, 1, 2);
        const plankT = mk('pk', 256, 128, (g, w, h) => { g.fillStyle = '#6b3d28'; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 32) { g.fillStyle = x % 64 === 0 ? '#5a301c' : '#7d4a30'; g.fillRect(x + 1, 0, 30, h); g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x, 0, 2, h); } }, 3, 1);
        const tileT = mk('tl', 256, 256, (g, w, h) => {
            g.fillStyle = '#a84430'; g.fillRect(0, 0, w, h);
            const rows = 10, rh = h / rows, tw = 32;
            for (let row = 0; row < rows; row++) { const y = row * rh, off = (row % 2) * (tw / 2); for (let x = -tw; x < w + tw; x += tw) { g.fillStyle = (row + (x / tw)) % 2 ? '#d4654a' : '#c4563c'; g.fillRect(x + off + 1, y + 2, tw - 2, rh - 3); g.fillStyle = 'rgba(255,214,176,0.22)'; g.fillRect(x + off + 2, y + 3, tw - 4, 2); g.strokeStyle = '#7a301f'; g.lineWidth = 1; g.strokeRect(x + off + 1, y + 2, tw - 2, rh - 3); } }
        }, 4, 6);
        const stoneT = mk('st', 256, 256, (g, w, h) => {
            g.fillStyle = '#6d767e'; g.fillRect(0, 0, w, h);
            const bw = 64, bh = 32;
            for (let row = 0; row < 8; row++) { const off = (row % 2) * 32; for (let col = -1; col < 6; col++) { const x = col * bw + off, y = row * bh, k = (row + col) % 3; g.fillStyle = ['#c5ced6', '#b7c2cb', '#d5dde3'][k]; g.fillRect(x + 2, y + 2, bw - 5, bh - 4); g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(x + 3, y + 3, bw - 10, 3); g.fillStyle = 'rgba(60,70,80,0.18)'; g.fillRect(x + 3, y + bh - 6, bw - 10, 2); } }
        }, 2, 3);
        const mt = (map, color, extra) => { const o = { map, color: color == null ? 0xffffff : color }; if (extra) { if (extra.emissive) { o.emissive = extra.emissive; o.emissiveIntensity = extra.emissiveIntensity; } if (extra.side != null) o.side = extra.side; } const m = new THREE.MeshLambertMaterial(o); if (extra && extra.shadowSide != null) m.shadowSide = extra.shadowSide; m.defines = Object.assign({}, m.defines, { CL_NO_PASTEL: 1 }); return m; };   /* o estilo novo da vila não passa pelo filtro pastel: as cores ficam como no protótipo */
        const M = {
            plaster: mt(plasterT, 0xdff0e6), wood: mt(woodT), door: mt(plankT), stone: mt(stoneT), roof: mt(tileT, roofTint, { side: THREE.DoubleSide, shadowSide: THREE.DoubleSide }),
            under: mt(plankT, 0xc9a27a, { side: THREE.BackSide }), log: mt(woodT, 0x9a6a3c),
            glass: mt(null, 0xb9e4f2, { emissive: new THREE.Color(0x8ec8df), emissiveIntensity: 0.35, roughness: 0.2 }),
            gold: mt(null, 0xd8c07a), red: mt(null, 0xe25b6a), yel: mt(null, 0xf2c14e), white: mt(null, 0xf4f1ea)
        };
        const g = new THREE.Group();
        const add = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; g.add(m); return m; };
        const box = (w, h, d, mat, x, y, z) => add(new THREE.BoxGeometry(w, h, d), mat, x, y, z);
        const W = 2.15, D = 1.55, H = 1.2, H2 = L >= 3 ? 0.85 : 0;
        box(W + 0.08, 0.28, D + 0.08, M.stone, 0, 0.14, 0);
        box(W, H, D, M.plaster, 0, 0.28 + H / 2, 0);
        const beam = (bw, bh, bd, px, py, pz) => box(bw, bh, bd, M.wood, px, py, pz);
        beam(0.1, H, D + 0.04, -W / 2 + 0.06, 0.28 + H / 2, 0); beam(0.1, H, D + 0.04, W / 2 - 0.06, 0.28 + H / 2, 0);
        beam(W, 0.1, D + 0.04, 0, 0.28 + 0.08, 0); beam(W, 0.1, D + 0.04, 0, 0.28 + H - 0.06, 0);
        beam(0.08, H, 0.08, 0, 0.28 + H / 2, D / 2 + 0.01);
        beam(0.08, 0.7, 0.08, -0.48, 0.78, D / 2 + 0.02).rotation.z = 0.7; beam(0.08, 0.7, 0.08, 0.48, 0.78, D / 2 + 0.02).rotation.z = -0.7;
        beam(W + 0.2, 0.1, 0.1, 0, 0.28 + H + 0.02, 0);
        const win = (px, py, pz, ww, hh) => {   /* a janela do protótipo: vidro, moldura de 4 lados, cruz, parapeito com floreira e flores */
            box(ww, hh, 0.06, M.glass, px, py, pz);
            box(ww + 0.1, 0.06, 0.08, M.wood, px, py + 0.23 * hh / 0.4, pz + 0.01); box(ww + 0.1, 0.06, 0.08, M.wood, px, py - 0.23 * hh / 0.4, pz + 0.01);
            box(0.05, hh + 0.06, 0.08, M.wood, px - ww / 2 - 0.02, py, pz + 0.02); box(0.05, hh + 0.06, 0.08, M.wood, px + ww / 2 + 0.02, py, pz + 0.02);
            box(0.04, hh, 0.08, M.wood, px, py, pz + 0.025); box(ww, 0.05, 0.08, M.wood, px, py, pz + 0.025);
            box(ww - 0.02, 0.08, 0.14, M.wood, px, py - 0.31 * hh / 0.4, pz + 0.08);
            add(new THREE.SphereGeometry(0.055, 8, 6), px < 0 ? M.red : M.yel, px - 0.08, py - 0.25 * hh / 0.4, pz + 0.16);
            add(new THREE.SphereGeometry(0.045, 8, 6), M.white, px + 0.08, py - 0.27 * hh / 0.4, pz + 0.15);
        };
        win(-0.55, 0.95, D / 2 + 0.02, 0.36, 0.4); win(0.55, 0.95, D / 2 + 0.02, 0.36, 0.4);
        box(0.36, 0.72, 0.08, M.door, 0, 0.64, D / 2 + 0.03);
        add(new THREE.SphereGeometry(0.04, 8, 6), M.gold, 0.12, 0.64, D / 2 + 0.1);
        box(0.7, 0.08, 0.36, M.stone, 0, 0.06, D / 2 + 0.18);
        let yb = 0.28 + H;
        if (H2) {   /* nível 3+: segundo andar com a frente saliente, como a taverna */
            box(W + 0.16, H2, D + 0.16, M.plaster, 0, yb + H2 / 2, 0);
            box(W + 0.26, 0.1, D + 0.26, M.wood, 0, yb, 0);
            [-1, 1].forEach(sx => [-1, 1].forEach(sz => box(0.1, H2, 0.1, M.wood, sx * (W / 2 + 0.09), yb + H2 / 2, sz * (D / 2 + 0.09))));
            [-0.6, 0, 0.6].forEach(px => win(px, yb + 0.5, D / 2 + 0.12, 0.3, 0.34));
            yb += H2;
        }
        const y0 = yb - 0.02, rise = 0.72, run = W / 2 + 0.28, halfD = D / 2 + 0.22;
        const slope = sign => {
            const x0 = sign * run;
            let pos, uv;
            if (sign < 0) { pos = [x0, y0, -halfD, x0, y0, halfD, 0, y0 + rise, halfD, x0, y0, -halfD, 0, y0 + rise, halfD, 0, y0 + rise, -halfD]; uv = [0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1]; }
            else { pos = [x0, y0, -halfD, 0, y0 + rise, halfD, x0, y0, halfD, x0, y0, -halfD, 0, y0 + rise, -halfD, 0, y0 + rise, halfD]; uv = [0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1]; }
            const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3)); geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uv), 2)); geo.computeVertexNormals();
            add(geo, M.roof, 0, 0, 0);
            const u = new THREE.Mesh(geo, M.under); u.position.y = -0.045; u.receiveShadow = true; g.add(u);   /* forro de tábuas por baixo do telhado */
        };
        slope(-1); slope(1);
        const ang = Math.atan2(rise, run), slopeLen = Math.hypot(run, rise);
        [-1, 1].forEach(sign => {
            box(0.09, 0.08, halfD * 2, M.wood, sign * run, y0 - 0.03, 0);
            [-halfD, halfD].forEach(z => { box(slopeLen, 0.07, 0.07, M.wood, sign * run / 2, y0 + rise / 2, z).rotation.z = -sign * ang; });
        });
        box(0.18, 0.1, halfD * 2 + 0.08, M.wood, 0, y0 + rise + 0.03, 0);
        [D / 2 + 0.02, -D / 2 - 0.02].forEach(z => {
            const sh = new THREE.Shape(); sh.moveTo(-W / 2 + 0.02, 0); sh.lineTo(W / 2 - 0.02, 0); sh.lineTo(0, rise - 0.06);
            const tri = new THREE.Mesh(new THREE.ShapeGeometry(sh), M.plaster); tri.position.set(0, y0, z); if (z < 0) tri.rotation.y = Math.PI; tri.castShadow = true; tri.receiveShadow = true; g.add(tri);
            box(0.06, rise * 0.9, 0.06, M.wood, 0, y0 + rise * 0.4, z);
        });
        box(0.28, 0.62, 0.28, M.stone, 0.55, y0 + 0.28, -0.28); box(0.36, 0.08, 0.36, M.stone, 0.55, y0 + 0.6, -0.28);
        if (L >= 2) {   /* puxado nos fundos, com lenha empilhada ao lado */
            box(1.0, 0.8, 0.7, M.plaster, -0.45, 0.4, -D / 2 - 0.3); box(1.15, 0.07, 0.85, M.roof, -0.45, 0.84, -D / 2 - 0.3).rotation.x = -0.14;
            for (let i = 0; i < 6; i++) { const lg = add(new THREE.CylinderGeometry(0.06, 0.06, 0.55, 6), M.log, -1.2, 0.08 + Math.floor(i / 3) * 0.12, -D / 2 - 0.1 + (i % 3) * 0.13); lg.rotation.z = Math.PI / 2; }
        }
        if (L >= 4) {   /* ala dos fundos com empena própria e segunda chaminé */
            box(0.9, H + H2 * 0.5, 0.8, M.plaster, 0.55, 0.28 + (H + H2 * 0.5) / 2, -D / 2 - 0.4);
            const wy = 0.28 + H + H2 * 0.5, sh = new THREE.Shape(); sh.moveTo(-0.5, 0); sh.lineTo(0.5, 0); sh.lineTo(0, 0.55); sh.closePath();
            const wg = new THREE.ExtrudeGeometry(sh, { depth: 1.0, bevelEnabled: false }); wg.translate(0, 0, -0.5);
            const wr = new THREE.Mesh(wg, M.roof); wr.position.set(0.55, wy, -D / 2 - 0.4); wr.castShadow = true; g.add(wr);
            win(0.55, 0.95, -D / 2 - 0.0, 0.3, 0.36);
            box(0.26, 0.8, 0.26, M.stone, 0.95, wy + 0.5, -D / 2 - 0.6);
        }
        const out = clMergeByMat(g, THREE);
        return out;
    }
    function clCasaBuild(grp, cv, level) {
        const THREE = clTh(); if (!THREE || !grp) return;
        const L = Math.min(5, Math.max(1, level | 0));
        const pal = (cv > 0 && typeof CLD !== 'undefined' && CLD.PAL && CLD.PAL[cv - 1]) ? CLD.PAL[cv - 1] : null;
        const tint = pal ? new THREE.Color(pal[1]).lerp(new THREE.Color(0xffffff), 0.45).getHex() : 0xd9a37e;   /* sem paleta: o tom do protótipo */
        const key = (L >= 4 ? 4 : L) + '_' + tint;
        const store = CLM._casaTpl || (CLM._casaTpl = {});
        const tpl = store[key] || (store[key] = clCasaTemplate(THREE, L >= 4 ? 4 : L, tint));
        const inst = tpl.clone(); inst.scale.setScalar(0.84); inst.position.set(0, 0, 0.1); grp.add(inst);
    }
    function clCasaAssemble(grp, level, cv) {
        level = Math.max(1, level | 0); clCasaPreload(); const o = { cv };
        clCasaBuild(grp, cv, level);   /* casa de enxaimel feita em código, no estilo da vila */
        /* a frente da casa fica mais bonita a cada nível: 1 uma caixa, 2 banco e abóboras, 3 poço e cenouras, 4 portão do castelo */
        if (level === 1) clAddPart(grp, 'fp_crate_single.glb', 0.74, 0, 0.84, 0.8, 0.8, 0.8, 0, 0.3, 0, o);
        if (level === 2 || level === 3) { clAddPart(grp, 'praca_bench.glb', -0.6, 0, 0.98, 1.0, 1.0, 1.0, 0, Math.PI, 0, o); clAddPart(grp, 'pumpkin_crop.glb', 0.58, 0, 0.98, 0.4, 0.4, 0.4, 0, 0.3, 0, o); clAddPart(grp, 'pumpkin_crop.glb', 0.84, 0, 0.9, 0.3, 0.3, 0.3, 0, -0.5, 0, o); }
        if (level === 3) { clAddPart(grp, 'praca_well.glb', 0.38, 0.25, 0.98, 0.55, 0.55, 0.55, 0, 0, 0, o); clAddPart(grp, 'carrot_crop.glb', -0.86, 0, 0.92, 0.4, 0.4, 0.4, 0, 0.2, 0, o); clAddPart(grp, 'carrot_crop.glb', -0.34, 0, 1.0, 0.35, 0.35, 0.35, 0, -0.3, 0, o); }
        if (level >= 5) clAddPart(grp, 'mina_crystal_blue.glb', 0, 1.95, 0, 0.26, 0.26, 0.26, 0, 0, 0, Object.assign({}, o, { glow: true, glowCol: 0xffd27a, glowInt: 2.2 }));
    }

        /* =========================================================================
       7. BIBLIOTECA (3x3) - A GRANDE BIBLIOTECA REAL DO SABER (ARQUITETURA ACADÊMICA, COLUNATAS E CÚPULA)
       ========================================================================= */
    const CLM_BIBLIO_FILES = ['fp_crate_single.glb'];
    function clBibliotecaPreload() { CLM_BIBLIO_FILES.forEach(f => { if (!CLM.tpl[f] && !CLM.loading[f] && !CLM.failed[f]) clModelLoad(f); }); }
    function clBibliotecaBuild(grp, cv, level) {
        const THREE = clTh(); if (!THREE || !grp) return;
        const L = Math.max(1, level | 0);
        const pal = (cv > 0 && typeof CLD !== 'undefined' && CLD.PAL && CLD.PAL[cv - 1]) ? CLD.PAL[cv - 1] : null;
        const roofCol = pal ? pal[1] : '#1e3a8a';
        const G2 = new THREE.Group(); G2.scale.setScalar(0.31); G2.position.set(0, 0, -0.05); grp.add(G2);
        const T = clProcTools(THREE, G2), mat = T.mat, geo = T.geo, box = T.box, add = T.add;
        const BK = new THREE.Color(0x000000), V = (k, col, ex) => mat(k, col, Object.assign({ emissive: BK, roughness: 0.65, metalness: 0.04 }, ex || {}));
        const brick = T.brickTex('b4bk'), planks = T.plankTex('b4pl', 2, 1), stoneT = T.stoneTex('b4st');
        const flute = T.tex('b4fl', g => {
            g.fillStyle = '#f4f1ea'; g.fillRect(0, 0, 64, 64);
            for (let x = 0; x < 64; x += 8) {
                g.fillStyle = 'rgba(80,70,60,0.22)'; g.fillRect(x, 0, 2, 64);
                g.fillStyle = 'rgba(255,255,255,0.6)'; g.fillRect(x + 3, 0, 2, 64);
            }
        }, 3, 1);

        const M = {
            stoneWide: V('b4sw', '#ddd5c4', { map: stoneT, roughness: 0.78 }),
            stone: V('b4stn', '#a8a29e', { map: stoneT, roughness: 0.85 }),
            plaster: V('b4pls', '#f3eedf', { map: brick, roughness: 0.75 }),
            wood: V('b4wd', '#5c3d25', { map: planks, roughness: 0.7 }),
            blue: V('b4bl' + roofCol, roofCol, { roughness: 0.28, metalness: 0.1 }),
            gold: V('b4gd', '#f59e0b', { metalness: 0.65, roughness: 0.3 }),
            whiteCol: V('b4whc', '#ffffff', { map: flute, roughness: 0.5 }),
            crystalCyan: mat('b4cc', '#38bdf8', { emissive: 0x0284c7, emissiveIntensity: 0.85, roughness: 0.2 }),
            crystalGold: mat('b4cg', '#fbbf24', { emissive: 0xd97706, emissiveIntensity: 0.75, roughness: 0.2 }),
            glass: mat('b4gl', '#bae6fd', { emissive: 0x38bdf8, emissiveIntensity: 0.45, roughness: 0.2, transparent: true, opacity: 0.88 }),
            banner: V('b4bn', '#581c87', { roughness: 0.6 }),
            bookRed: V('b4br', '#b91c1c', { roughness: 0.5 }),
            bookBlue: V('b4bb', '#1d4ed8', { roughness: 0.5 }),
            bookGreen: V('b4bg', '#047857', { roughness: 0.5 }),
            bookAmber: V('b4ba', '#d97706', { roughness: 0.5 })
        };

        const roofGableMesh = (span, len, y0, rise, roofMat, gableMat, alongX, zOff) => {
            const hs = span / 2, sh = new THREE.Shape();
            sh.moveTo(-hs, 0); sh.lineTo(hs, 0); sh.lineTo(0, rise); sh.closePath();
            const g0 = new THREE.ExtrudeGeometry(sh, { depth: len, bevelEnabled: false });
            g0.translate(0, 0, -len / 2);
            if (alongX) g0.rotateY(Math.PI / 2);
            const m = new THREE.Mesh(g0, [gableMat, roofMat]);
            m.position.set(0, y0, zOff || 0); m.castShadow = true; m.receiveShadow = true;
            G2.add(m);
            return m;
        };

        // 1. Escadaria e Plataforma de Cantaria Nobre
        add(box(9.4, 0.25, 7.2), M.stoneWide, 0, 0.125, 0);
        add(box(4.6, 0.15, 1.2), M.stoneWide, 0, 0.20, 3.8);
        add(box(4.2, 0.15, 0.8), M.stoneWide, 0, 0.32, 3.6);
        add(box(3.8, 0.15, 0.5), M.stoneWide, 0, 0.44, 3.4);

        // 2. Alas Laterais dos Arquivos de Tomos (East & West Wings)
        const wingW = 2.6, wingL = 6.2, wingH = 3.2;
        [-1, 1].forEach(sx => {
            const wx = sx * 3.3;
            add(box(wingW, 0.8, wingL), M.stone, wx, 0.65, 0);
            add(box(wingW - 0.1, wingH - 0.8, wingL - 0.1), M.plaster, wx, 0.65 + wingH / 2, 0);
            add(box(wingW + 0.2, 0.18, wingL + 0.2), M.stoneWide, wx, 0.25 + wingH, 0);
            const wGable = roofGableMesh(wingW + 0.4, wingL + 0.2, 0.25 + wingH, 1.1, M.blue, M.stoneWide, false, 0);
            wGable.position.x = wx;

            // Janelas de Vidro Arqueadas da Sala de Leitura com Estantes
            [-1.6, 0, 1.6].forEach((wz, wi) => {
                add(box(0.08, 1.4, 0.75), M.glass, wx + sx * (wingW / 2 + 0.02), 2.2, wz);
                add(box(0.12, 1.5, 0.08), M.wood, wx + sx * (wingW / 2 + 0.02), 2.2, wz - 0.4);
                add(box(0.12, 1.5, 0.08), M.wood, wx + sx * (wingW / 2 + 0.02), 2.2, wz + 0.4);
                add(box(0.12, 0.1, 0.84), M.wood, wx + sx * (wingW / 2 + 0.02), 2.95, wz);
                const bookMats = [M.bookRed, M.bookBlue, M.bookGreen, M.bookAmber];
                for (let sh = 0; sh < 3; sh++) {
                    add(box(0.12, 0.28, 0.65), bookMats[(sh * 2 + wi) % bookMats.length], wx + sx * (wingW / 2 - 0.18), 1.7 + sh * 0.42, wz);
                }
            });
        });

        // 3. Grande Pórtico Central Clássico (4 Colunas)
        const portW = 4.2;
        [-1.7, -0.6, 0.6, 1.7].forEach(cx => {
            add(geo('b4cb_' + cx, () => new THREE.CylinderGeometry(0.24, 0.26, 0.2, 12)), M.stoneWide, cx, 0.35, 3.1);
            add(geo('b4cs_' + cx, () => new THREE.CylinderGeometry(0.19, 0.22, 3.2, 16)), M.whiteCol, cx, 2.05, 3.1);
            add(geo('b4cc_' + cx, () => new THREE.CylinderGeometry(0.26, 0.20, 0.25, 12)), M.stoneWide, cx, 3.75, 3.1);
        });
        add(box(portW + 0.4, 0.35, 1.0), M.stoneWide, 0, 4.05, 3.0);

        // Fechamento de fundo do pórtico
        add(box(portW, 3.8, 0.3), M.plaster, 0, 2.15, 2.4);
        add(box(portW, 0.6, 0.35), M.stone, 0, 0.55, 2.4);

        // 4. CORPO CENTRAL E PAREDÃO TRASEIRO 100% FECHADO
        const hallW = 4.1, hallL = 5.5, hallH = 3.6, hallZ = -0.35;
        add(box(hallW, 0.65, hallL), M.stone, 0, 0.55, hallZ);
        add(box(hallW - 0.05, hallH - 0.65, hallL - 0.1), M.plaster, 0, 0.55 + hallH / 2, hallZ);

        // Base de cantaria robusta atrás
        add(box(hallW + 0.1, 0.75, 0.35), M.stoneWide, 0, 0.6, -3.05);
        // Pilastras / Contrafortes Acadêmicos Traseiros
        [-1.8, -0.6, 0.6, 1.8].forEach(bx => {
            add(box(0.35, hallH + 0.2, 0.28), M.stoneWide, bx, 2.05, -3.12);
            add(box(0.42, 0.2, 0.34), M.stoneWide, bx, 3.45, -3.12);
        });
        // Grandes Janelões Arqueados do Acervo Traseiro
        [-1.2, 0, 1.2].forEach((jx, ji) => {
            add(box(0.75, 1.6, 0.12), M.glass, jx, 2.3, -3.10);
            add(box(0.85, 0.1, 0.16), M.stoneWide, jx, 1.45, -3.12);
            add(box(0.85, 0.12, 0.16), M.stoneWide, jx, 3.15, -3.12);
            const archM = add(geo('b4ar_' + ji, () => new THREE.CylinderGeometry(0.42, 0.42, 0.14, 16, 1, false, 0, Math.PI)), M.stoneWide, jx, 3.15, -3.12);
            archM.rotation.z = Math.PI / 2;
            const bookMats = [M.bookRed, M.bookBlue, M.bookGreen, M.bookAmber];
            for (let sh = 0; sh < 3; sh++) {
                add(box(0.65, 0.26, 0.1), bookMats[(sh + ji) % bookMats.length], jx, 1.8 + sh * 0.42, -2.95);
            }
        });

        // 5. FECHAMENTO SUPERIOR (TETO NOBRE & TERRAÇO DA ROTUNDA)
        add(box(hallW + 0.2, 0.25, hallL + 0.2), M.stoneWide, 0, hallH + 0.1, hallZ);
        add(box(hallW + 0.4, 0.16, hallL + 0.4), M.stoneWide, 0, hallH + 0.3, hallZ);
        // Balaustrada / Guarda-corpo do terraço
        add(box(hallW + 0.1, 0.5, 0.2), M.stoneWide, 0, hallH + 0.62, -3.0);
        [-1.9, -1.0, 0, 1.0, 1.9].forEach((px, pi) => {
            add(box(0.28, 0.65, 0.28), M.stoneWide, px, hallH + 0.7, -3.0);
            add(geo('b4sp_' + pi, () => new THREE.SphereGeometry(0.1, 8, 6)), M.gold, px, hallH + 1.1, -3.0);
        });
        [-1, 1].forEach(sx => {
            add(box(0.2, 0.45, hallL * 0.4), M.stoneWide, sx * (hallW / 2 - 0.05), hallH + 0.6, -1.8);
            add(box(0.2, 0.45, hallL * 0.4), M.stoneWide, sx * (hallW / 2 - 0.05), hallH + 0.6, 1.2);
        });

        // Frontão Triangular Clássico
        roofGableMesh(portW + 0.4, 0.9, 4.22, 1.1, M.stoneWide, M.stoneWide, true, 3.0);

        // No Tímpano: Grande Livro Aberto em Ouro
        const bookBase = new THREE.Group(); bookBase.position.set(0, 4.75, 3.52); G2.add(bookBase);
        const coverL = add(box(0.45, 0.06, 0.6), M.gold, -0.22, 0, 0); coverL.rotation.z = -0.35; bookBase.add(coverL);
        const coverR = add(box(0.45, 0.06, 0.6), M.gold, 0.22, 0, 0); coverR.rotation.z = 0.35; bookBase.add(coverR);
        const pageL = add(box(0.4, 0.05, 0.54), M.plaster, -0.2, 0.05, 0); pageL.rotation.z = -0.35; bookBase.add(pageL);
        const pageR = add(box(0.4, 0.05, 0.54), M.plaster, 0.2, 0.05, 0); pageR.rotation.z = 0.35; bookBase.add(pageR);

        // Grande Portal Nobre com Moldura e Portas Duplas
        add(box(1.8, 2.8, 0.15), M.stoneWide, 0, 1.65, 2.45);
        add(box(1.4, 2.4, 0.12), M.wood, 0, 1.45, 2.5);
        add(box(0.08, 0.4, 0.08), M.gold, -0.18, 1.4, 2.58);
        add(box(0.08, 0.4, 0.08), M.gold, 0.18, 1.4, 2.58);
        const fanlight = add(geo('b4flgt', () => new THREE.CylinderGeometry(0.65, 0.65, 0.08, 16, 1, false, 0, Math.PI)), M.crystalGold, 0, 2.65, 2.52);
        fanlight.rotation.z = Math.PI / 2;

        // 6. CÚPULA ROTUNDA CENTRAL DOS SÁBIOS
        add(geo('b4rdm', () => new THREE.CylinderGeometry(2.0, 2.1, 1.4, 20)), M.stoneWide, 0, 4.3, 0.2);
        for (let i = 0; i < 6; i++) {
            const a = i * Math.PI / 3;
            const rwin = add(geo('b4rw_' + i, () => new THREE.CylinderGeometry(0.22, 0.22, 0.1, 8)), M.glass, Math.cos(a) * 2.05, 4.3, 0.2 + Math.sin(a) * 2.05);
            rwin.rotation.x = Math.PI / 2;
        }
        add(geo('b4spdm', () => new THREE.SphereGeometry(2.05, 20, 16, 0, Math.PI * 2, 0, Math.PI / 2)), M.blue, 0, 5.0, 0.2);
        for (let r = 0; r < 8; r++) {
            const ang = r * Math.PI / 4;
            const rib = add(geo('b4rib_' + r, () => new THREE.TorusGeometry(2.06, 0.03, 4, 16, Math.PI / 2)), M.gold, 0, 5.0, 0.2);
            rib.rotation.y = ang;
        }
        add(geo('b4clnt', () => new THREE.CylinderGeometry(0.5, 0.55, 0.7, 8)), M.stoneWide, 0, 7.3, 0.2);
        add(geo('b4cnnt', () => new THREE.ConeGeometry(0.65, 0.6, 8)), M.blue, 0, 7.95, 0.2);

        // 7. MONUMENTAL ESFERA ARMILAR DOURADA NO TOPO
        const armilla = new THREE.Group(); armilla.position.set(0, 8.55, 0.2); G2.add(armilla);
        armilla.add(new THREE.Mesh(geo('b4arm1', () => new THREE.TorusGeometry(0.42, 0.03, 6, 20)), M.gold));
        const arm2 = new THREE.Mesh(geo('b4arm2', () => new THREE.TorusGeometry(0.42, 0.03, 6, 20)), M.gold); arm2.rotation.x = Math.PI / 2; armilla.add(arm2);
        const arm3 = new THREE.Mesh(geo('b4arm3', () => new THREE.TorusGeometry(0.42, 0.03, 6, 20)), M.gold); arm3.rotation.y = Math.PI / 4; armilla.add(arm3);
        armilla.add(new THREE.Mesh(geo('b4armc', () => new THREE.SphereGeometry(0.12, 10, 8)), M.crystalCyan));

        // 8. ELEMENTOS DE PROGRESSÃO POR NÍVEL (L >= 2, 3, 4, 5)
        if (L >= 2) {
            [-1.15, 1.15].forEach((fx, fi) => {
                const bnr = add(geo('b4bnr_' + fi, () => new THREE.PlaneGeometry(0.4, 1.2)), M.banner, fx, 2.7, 3.22);
                bnr.material.side = THREE.DoubleSide;
                add(box(0.42, 0.05, 0.02), M.gold, fx, 3.32, 3.23);
            });
            [-1, 1].forEach((sx, si) => {
                const px = sx * 2.3;
                add(box(0.45, 0.75, 0.45), M.stoneWide, px, 0.5, 3.6);
                add(geo('b4obsp_' + si, () => new THREE.SphereGeometry(0.18, 12, 8)), M.gold, px, 1.05, 3.6);
                add(geo('b4oboc_' + si, () => new THREE.OctahedronGeometry(0.1, 0)), M.crystalGold, px, 1.35, 3.6);
            });
        }
        if (L >= 3) {
            add(box(1.2, 0.55, 0.7), M.wood, 2.8, 0.52, 4.2);
            add(box(0.3, 0.08, 0.22), M.bookRed, 2.6, 0.84, 4.1);
            add(box(0.28, 0.08, 0.2), M.bookBlue, 2.6, 0.92, 4.1);
            const scroll = add(geo('b4scrl', () => new THREE.CylinderGeometry(0.04, 0.04, 0.35, 8)), M.plaster, 3.0, 0.84, 4.3);
            scroll.rotation.z = Math.PI / 2;
            add(box(0.32, 0.02, 0.24), M.plaster, 3.0, 0.82, 4.3);
            add(box(1.2, 0.35, 0.4), M.stoneWide, -2.8, 0.42, 4.2);
        }
        if (L >= 4) {
            [-2.1, 2.1].forEach((tx, ti) => {
                add(box(0.12, 0.8, 0.12), M.wood, tx, 0.8, 4.4);
                add(geo('b4flm_' + ti, () => new THREE.SphereGeometry(0.09, 8, 8)), M.crystalGold, tx, 1.25, 4.4);
            });
        }
        if (L >= 5) {
            const glowOrb = add(geo('b4gorb', () => new THREE.SphereGeometry(0.26, 12, 10)), M.crystalCyan, 0, 9.4, 0.2);
            glowOrb.material = mat('b4gormat', '#38bdf8', { emissive: 0x38bdf8, emissiveIntensity: 1.6, roughness: 0.1 });
        }
    }
    function clBibliotecaAssemble(grp, level, cv) {
        level = Math.max(1, level | 0); clBibliotecaPreload();
        clBibliotecaBuild(grp, cv, level);
    }

/* =========================================================================
       8. SILO (1x1)
       ========================================================================= */
    const CLM_SILO_FILES = ['fp_silo_l1.glb', 'fp_silo_l2.glb', 'fp_silo_l3.glb', 'fp_crate_single.glb', 'mina_crystal_blue.glb'];
    function clSiloPreload() { CLM_SILO_FILES.forEach(f => { if (!CLM.tpl[f] && !CLM.loading[f] && !CLM.failed[f]) clModelLoad(f); }); }
    function clSiloAssemble(grp, level, cv) {
        level = Math.max(1, level | 0); clSiloPreload();
        const o = { cv };
        if (level === 1) {
            clAddPart(grp, 'fp_silo_l1.glb', 0, 0, 0, 0.95, 0.95, 0.95, 0, 0, 0, o);
        } else if (level === 2) {
            clAddPart(grp, 'fp_silo_l2.glb', 0, 0, 0, 0.92, 0.92, 0.92, 0, 0, 0, o);
            clAddPart(grp, 'fp_crate_single.glb', 0.28, 0, 0.22, 0.65, 0.65, 0.65, 0, 0.3, 0, o);
        } else if (level === 3) {
            clAddPart(grp, 'fp_silo_l3.glb', 0, 0, 0, 0.85, 0.85, 0.85, 0, 0, 0, o);
            clAddPart(grp, 'fp_crate_single.glb', 0.28, 0, 0.22, 0.65, 0.65, 0.65, 0, 0.3, 0, o);
        } else if (level === 4) {
            clAddPart(grp, 'fp_silo_l3.glb', 0, 0, 0, 0.90, 0.90, 0.90, 0, 0, 0, o);
            clAddPart(grp, 'fp_crate_single.glb', 0.28, 0, 0.22, 0.70, 0.70, 0.70, 0, 0.3, 0, o);
        } else {
            clAddPart(grp, 'fp_silo_l3.glb', 0, 0, 0, 0.95, 0.95, 0.95, 0, 0, 0, o);
            clAddPart(grp, 'mina_crystal_blue.glb', 0, 2.20, 0, 0.22, 0.22, 0.22, 0, 0, 0, Object.assign({}, o, { glow: true, glowCol: 0x00e5ff, glowInt: 2.5 }));
        }
    }

    /* =========================================================================
       8B. ESTUFA (2x2)
       ========================================================================= */
    const CLM_ESTUFA_FILES = [
        'fp_greenhouse_l1.glb', 'fp_greenhouse_l2.glb', 'fp_greenhouse_l3.glb', 'fp_greenhouse_l4.glb',
        'fp_crates_veg.glb', 'fp_crate_single.glb', 'mina_crystal_blue.glb'
    ];
    function clEstufaPreload() { CLM_ESTUFA_FILES.forEach(f => { if (!CLM.tpl[f] && !CLM.loading[f] && !CLM.failed[f]) clModelLoad(f); }); }
    function clEstufaAssemble(grp, level, cv) {
        level = Math.max(1, level | 0); clEstufaPreload();
        const o = { cv };
        if (level === 1) {
            clAddPart(grp, 'fp_greenhouse_l1.glb', 0, 0, 0, 1.0, 1.0, 1.0, 0, 0, 0, o);
        } else if (level === 2) {
            clAddPart(grp, 'fp_greenhouse_l2.glb', 0, 0, 0, 1.0, 1.0, 1.0, 0, 0, 0, o);
            clAddPart(grp, 'fp_crate_single.glb', 0.68, 0, 0.65, 0.9, 0.9, 0.9, 0, 0.4, 0, o);
        } else if (level === 3) {
            clAddPart(grp, 'fp_greenhouse_l3.glb', 0, 0, 0, 1.0, 1.0, 1.0, 0, 0, 0, o);
            clAddPart(grp, 'fp_crates_veg.glb', 0.68, 0, 0.65, 0.95, 0.95, 0.95, 0, -0.3, 0, o);
            clAddPart(grp, 'fp_crate_single.glb', -0.68, 0, 0.65, 0.9, 0.9, 0.9, 0, 0.5, 0, o);
        } else if (level === 4) {
            clAddPart(grp, 'fp_greenhouse_l4.glb', 0, 0, 0, 1.0, 1.0, 1.0, 0, 0, 0, o);
            clAddPart(grp, 'fp_crates_veg.glb', 0.68, 0, 0.65, 1.05, 1.05, 1.05, 0, -0.3, 0, o);
            clAddPart(grp, 'fp_crates_veg.glb', -0.68, 0, 0.65, 1.0, 1.0, 1.0, 0, 0.3, 0, o);
        } else {
            clAddPart(grp, 'fp_greenhouse_l4.glb', 0, 0, 0, 1.05, 1.05, 1.05, 0, 0, 0, o);
            clAddPart(grp, 'fp_crates_veg.glb', 0.68, 0, 0.65, 1.1, 1.1, 1.1, 0, -0.3, 0, o);
            clAddPart(grp, 'fp_crates_veg.glb', -0.68, 0, 0.65, 1.05, 1.05, 1.05, 0, 0.3, 0, o);
            clAddPart(grp, 'mina_crystal_blue.glb', 0, 0.72, 0, 0.28, 0.28, 0.28, 0, 0, 0, Object.assign({}, o, { glow: true, glowCol: 0x00e5ff, glowInt: 2.2 }));
        }
    }

    /* =========================================================================
       8C. SOBRADO (2x2) & CHALÉ (2x1)
       ========================================================================= */
    const CLM_SOBRADO_FILES = ['cartoon_building.glb', 'fp_cart.glb', 'fp_crates_veg.glb', 'fp_hay.glb', 'mina_crystal_blue.glb'];
    function clSobradoPreload() { CLM_SOBRADO_FILES.forEach(f => { if (!CLM.tpl[f] && !CLM.loading[f] && !CLM.failed[f]) clModelLoad(f); }); }
    function clSobradoAssemble(grp, level, cv) {
        level = Math.max(1, level | 0); clSobradoPreload();
        if (clProtoUse(grp, 'sobrado', level, cv)) return;

        const o = { cv };
        /* o sobrado CRESCE com o nível: sobe de tamanho, ganha cerca, flores, postes de luz e, no alto, um cristal dourado */
        const K = [0.88, 0.94, 0.98, 1.03, 1.08][Math.min(5, level) - 1], mx = 0;
        clAddPart(grp, 'cartoon_building.glb', mx, 0.60 * K, 0, K, K, K, 0, 0, 0, o);
        if (level === 2) clAddPart(grp, 'fp_hay.glb', 0.74, 0, 0.7, 0.8, 0.8, 0.8, 0, 0.3, 0, o);
        if (level >= 3) { clAddPart(grp, 'fp_crates_veg.glb', -0.78, 0, -0.7, 0.8, 0.8, 0.8, 0, -0.3, 0, o); }
        if (level >= 4) clAddPart(grp, 'mina_crystal_blue.glb', mx, 1.6 * K + 0.1, 0, 0.28, 0.28, 0.28, 0, 0, 0, Object.assign({}, o, { glow: true, glowCol: 0xffd27a, glowInt: 2.0 }));
    }

    /* =========================================================================
       8D. GERADOR (2x1) - MÁQUINA INDUSTRIAL HELLO NEIGHBOR 2
       ========================================================================= */
    const CLM_GERADOR_FILES = ['generator.glb', 'fp_barrel.glb', 'fp_crate_single.glb', 'mina_crystal_blue.glb'];
    function clGeradorPreload() { CLM_GERADOR_FILES.forEach(f => { if (!CLM.tpl[f] && !CLM.loading[f] && !CLM.failed[f]) clModelLoad(f); }); }
    function clGeradorAssemble(grp, level, cv) {
        level = Math.max(1, level | 0); clGeradorPreload();
        const o = { cv };
        // Base: Máquina Geradora de energia estilizada (generator.glb)
        clAddPart(grp, 'generator.glb', 0, 0.10, 0, 1.0, 1.0, 1.0, 0, 0, 0, o);
        if (level >= 2) {
            clAddPart(grp, 'fp_barrel.glb', 0.68, 0, 0.15, 0.8, 0.8, 0.8, 0, 0.4, 0, o);
        }
        if (level >= 3) {
            clAddPart(grp, 'fp_crate_single.glb', -0.65, 0, 0.12, 0.75, 0.75, 0.75, 0, -0.3, 0, o);
        }
        if (level >= 4) {
            clAddPart(grp, 'mina_crystal_blue.glb', -0.45, 0.85, 0, 0.22, 0.22, 0.22, 0, 0, 0, { glow: true, glowCol: 0x00e5ff, glowInt: 2.0 });
        }
        if (level >= 5) {
            clAddPart(grp, 'mina_crystal_blue.glb', 0, 1.75, 0, 0.32, 0.32, 0.32, 0, 0, 0, { glow: true, glowCol: 0x00e5ff, glowInt: 3.0, spin: 1.2 });
        }
    }

    const CLM_CHALE_FILES = ['chale.glb', 'fp_crate_single.glb', 'fp_hay.glb', 'fp_crates_veg.glb', 'fp_barrel.glb', 'mina_crystal_blue.glb'];
    function clChalePreload() { CLM_CHALE_FILES.forEach(f => { if (!CLM.tpl[f] && !CLM.loading[f] && !CLM.failed[f]) clModelLoad(f); }); }
    function clChaleAssemble(grp, level, cv) {
        level = Math.max(1, level | 0); clChalePreload();
        const o = { cv };
        /* o chalé CRESCE com o nível: maior e com uma segunda chaminé de pedra, clonada do próprio modelo */
        const K = [0.60, 0.64, 0.67, 0.70, 0.74][Math.min(5, level) - 1], y0 = 0.08 * K / 0.7;
        const baseC = clAddPart(grp, 'chale.glb', 0, y0, 0, K, K, K, 0, 0, 0, o); try { clHouseClones(baseC, 'chale', level); } catch (e) {}
        if (level === 1) clAddPart(grp, 'fp_crate_single.glb', 0.78, 0, 0.42, 0.75, 0.75, 0.75, 0, 0.3, 0, o);
        else if (level === 2) clAddPart(grp, 'fp_crates_veg.glb', 0.78, 0, 0.42, 0.75, 0.75, 0.75, 0, 0.2, 0, o);
        else { clAddPart(grp, 'fp_hay.glb', -0.85, 0, -0.62, 0.75, 0.75, 0.75, 0, -0.3, 0, o); clAddPart(grp, 'fp_barrel.glb', 0.85, 0, 0.5, 0.65, 0.65, 0.65, 0, 0.4, 0, o); }
        if (level >= 4) clAddPart(grp, 'mina_crystal_blue.glb', 0, 2.1 * K / 0.7 + 0.35, 0, level >= 5 ? 0.3 : 0.22, level >= 5 ? 0.3 : 0.22, level >= 5 ? 0.3 : 0.22, 0, 0, 0, { glow: true, glowCol: 0xffd27a, glowInt: level >= 5 ? 2.8 : 2.0, spin: level >= 5 ? 1.0 : 0 });
    }

    /* ---- Merge em malha única do painel de cerca para cortar dezenas de chamadas de desenho ---- */
    function clFenceMerged(fenceTpl, THREE) {
        if (!fenceTpl || !fenceTpl.gl) return null;
        if (fenceTpl._merged) return fenceTpl._merged;
        const root = fenceTpl.gl.scene;
        root.updateMatrixWorld(true);
        let totalV = 0, totalI = 0;
        const meshes = [];
        root.traverse(o => {
            if (o.isMesh && o.geometry && o.geometry.attributes.position) {
                meshes.push(o);
                totalV += o.geometry.attributes.position.count;
                totalI += o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count;
            }
        });
        if (!meshes.length) return null;
        const P = new Float32Array(totalV * 3), N = new Float32Array(totalV * 3), U = new Float32Array(totalV * 2);
        const I = totalV > 65535 ? new Uint32Array(totalI) : new Uint16Array(totalI);
        let vOff = 0, iOff = 0;
        const v = new THREE.Vector3(), nm = new THREE.Matrix3();
        meshes.forEach(o => {
            const g = o.geometry, pos = g.attributes.position, norm = g.attributes.normal, uv = g.attributes.uv;
            nm.getNormalMatrix(o.matrixWorld);
            const count = pos.count;
            for (let k = 0; k < count; k++) {
                v.fromBufferAttribute(pos, k).applyMatrix4(o.matrixWorld);
                P[(vOff + k) * 3] = v.x; P[(vOff + k) * 3 + 1] = v.y; P[(vOff + k) * 3 + 2] = v.z;
                if (norm) { v.fromBufferAttribute(norm, k).applyMatrix3(nm).normalize(); N[(vOff + k) * 3] = v.x; N[(vOff + k) * 3 + 1] = v.y; N[(vOff + k) * 3 + 2] = v.z; } else { N[(vOff + k) * 3 + 1] = 1; }
                if (uv) { U[(vOff + k) * 2] = uv.getX(k); U[(vOff + k) * 2 + 1] = uv.getY(k); }
            }
            if (g.index) {
                for (let k = 0; k < g.index.count; k++) I[iOff + k] = g.index.getX(k) + vOff;
                iOff += g.index.count;
            } else {
                for (let k = 0; k < count; k++) I[iOff + k] = vOff + k;
                iOff += count;
            }
            vOff += count;
        });
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(P, 3));
        geo.setAttribute('normal', new THREE.BufferAttribute(N, 3));
        geo.setAttribute('uv', new THREE.BufferAttribute(U, 2));
        geo.setIndex(new THREE.BufferAttribute(I, 1));
        geo.computeBoundingSphere();
        const mat = (meshes[0] && meshes[0].material) ? (Array.isArray(meshes[0].material) ? meshes[0].material[0] : meshes[0].material) : new THREE.MeshStandardMaterial({ roughness: 0.82 });
        fenceTpl._merged = { geo, mat };
        return fenceTpl._merged;
    }

    /* =========================================================================
       9. CERCA COM AUTOTILING INTELIGENTE (1x1) - cerca.glb, o modelo original
       ========================================================================= */
    function clCercaAssets(THREE) {
        if (CLM._fence && CLM._fence.THREE === THREE) return CLM._fence;
        const cv = document.createElement('canvas'); cv.width = 64; cv.height = 64;
        const cx = cv.getContext('2d');
        cx.fillStyle = '#c88d55'; cx.fillRect(0, 0, 64, 64);
        for (let y = 0; y < 64; y += 2) {
            const v = ((y * 17) % 19) - 9;
            cx.fillStyle = v > 0 ? 'rgba(255,228,185,0.12)' : 'rgba(65,36,15,0.14)';
            cx.fillRect(0, y, 64, 1);
        }
        for (let x = 0; x < 64; x += 16) {
            cx.fillStyle = 'rgba(72,40,18,0.16)';
            cx.fillRect(x, 0, 1, 64);
        }
        const tex = new THREE.CanvasTexture(cv);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        const mkTip = () => { const g = new THREE.ConeGeometry(0.044, 0.055, 4); g.rotateY(Math.PI / 4); return g; };
        CLM._fence = {
            THREE, tex,
            postGeo: new THREE.BoxGeometry(0.13, 0.60, 0.13),
            capGeo: (() => { const g = new THREE.ConeGeometry(0.105, 0.10, 4); g.rotateY(Math.PI / 4); return g; })(),
            collarGeo: new THREE.BoxGeometry(0.148, 0.042, 0.148),
            endPostGeo: new THREE.BoxGeometry(0.11, 0.56, 0.11),
            endCapGeo: (() => { const g = new THREE.ConeGeometry(0.088, 0.09, 4); g.rotateY(Math.PI / 4); return g; })(),
            railXGeo: new THREE.BoxGeometry(0.50, 0.072, 0.048),
            railZGeo: new THREE.BoxGeometry(0.048, 0.072, 0.50),
            picketXGeo: new THREE.BoxGeometry(0.064, 0.44, 0.072),
            picketZGeo: new THREE.BoxGeometry(0.072, 0.44, 0.064),
            picketTipGeo: mkTip(),
            soloRailXGeo: new THREE.BoxGeometry(0.80, 0.072, 0.048),
            soloRailZGeo: new THREE.BoxGeometry(0.048, 0.072, 0.80)
        };
        return CLM._fence;
    }

    function clCercaAssembleAll(cv, ix, s, mtx, lv) {
        const THREE = clTh(); if (!THREE || !ix || !ix.length) return false;
        const F = clCercaAssets(THREE);
        const skip = (typeof CL !== 'undefined' && CL.hold && CL.hold.idx >= 0) ? CL.hold.idx : -1;

        const fenceMap = new Map();
        s.pcs.forEach((p, pi) => { if (pi !== skip && p && p[0] === 'cerca') fenceMap.set(p[1] + ',' + p[2], pi); });   /* TODAS as cercas colocadas (inclusive outras cores) para conexão contínua */

        const palHex = (cv > 0 && typeof CLD !== 'undefined' && CLD.PAL && CLD.PAL[cv - 1]) ? CLD.PAL[cv - 1][1] : null;
        const woodCol = palHex ? new THREE.Color(0xb87e4b).lerp(new THREE.Color(palHex), 0.42) : new THREE.Color(0xa8754a);
        const woodMat = new THREE.MeshStandardMaterial({ color: woodCol, map: F.tex, roughness: 0.80, metalness: 0.06 });
        const capCol = palHex ? new THREE.Color(palHex).multiplyScalar(0.88) : new THREE.Color(0x7a5535);
        const capMat = new THREE.MeshStandardMaterial({ color: capCol, map: F.tex, roughness: 0.84, metalness: 0.05 });
        const ironMat = new THREE.MeshStandardMaterial({ color: 0x3b404d, roughness: 0.48, metalness: 0.65 });

        const mk = (geo, mat, x, y, z, grp) => {
            const m = new THREE.Mesh(geo, mat);
            m.position.set(x, y, z);
            m.castShadow = false; m.receiveShadow = true; m.frustumCulled = true;
            grp.add(m);
            return m;
        };

        ix.forEach(pi => {
            const p = s.pcs[pi], gx = p[1], gz = p[2];
            const hasN = fenceMap.has(gx + ',' + (gz - 1));
            const hasS = fenceMap.has(gx + ',' + (gz + 1));
            const hasE = fenceMap.has((gx + 1) + ',' + gz);
            const hasW = fenceMap.has((gx - 1) + ',' + gz);
            const cnt = (hasN ? 1 : 0) + (hasS ? 1 : 0) + (hasE ? 1 : 0) + (hasW ? 1 : 0);

            const grp = new THREE.Group();
            grp.position.set(gx + 0.5, 0, gz + 0.5);

            // Poste central sempre no centro da célula (0, 0) — sem postes duplicados nas divisas e sem sobra nos cantos de 90°
            mk(F.postGeo, woodMat, 0, 0.30, 0, grp);
            mk(F.collarGeo, ironMat, 0, 0.51, 0, grp);
            mk(F.capGeo, capMat, 0, 0.65, 0, grp);

            if (cnt === 0) {
                // Cerca isolada 1x1 inteira contida estritamente dentro de [-0.45, +0.45]
                if ((p[3] & 1) === 0) {
                    mk(F.endPostGeo, woodMat, -0.39, 0.28, 0, grp); mk(F.endCapGeo, capMat, -0.39, 0.605, 0, grp);
                    mk(F.endPostGeo, woodMat,  0.39, 0.28, 0, grp); mk(F.endCapGeo, capMat,  0.39, 0.605, 0, grp);
                    mk(F.soloRailXGeo, woodMat, 0, 0.44, 0, grp);
                    mk(F.soloRailXGeo, woodMat, 0, 0.21, 0, grp);
                    [-0.20, 0.20].forEach(d => { mk(F.picketXGeo, woodMat, d, 0.28, 0, grp); mk(F.picketTipGeo, woodMat, d, 0.527, 0, grp); });
                } else {
                    mk(F.endPostGeo, woodMat, 0, 0.28, -0.39, grp); mk(F.endCapGeo, capMat, 0, 0.605, -0.39, grp);
                    mk(F.endPostGeo, woodMat, 0, 0.28,  0.39, grp); mk(F.endCapGeo, capMat, 0, 0.605,  0.39, grp);
                    mk(F.soloRailZGeo, woodMat, 0, 0.44, 0, grp);
                    mk(F.soloRailZGeo, woodMat, 0, 0.21, 0, grp);
                    [-0.20, 0.20].forEach(d => { mk(F.picketZGeo, woodMat, 0, 0.28, d, grp); mk(F.picketTipGeo, woodMat, 0, 0.527, d, grp); });
                }
            } else {
                // Braços de 0,50 exato APENAS nas direções com cerca vizinha: encontro perfeito na borda (+/-0.5) e quina limpa em 90°
                const addArm = (axis, dir) => {
                    const c = dir * 0.25, d1 = dir * 0.19, d2 = dir * 0.395;
                    if (axis === 'x') {
                        mk(F.railXGeo, woodMat, c, 0.44, 0, grp);
                        mk(F.railXGeo, woodMat, c, 0.21, 0, grp);
                        mk(F.picketXGeo, woodMat, d1, 0.28, 0, grp); mk(F.picketTipGeo, woodMat, d1, 0.527, 0, grp);
                        mk(F.picketXGeo, woodMat, d2, 0.28, 0, grp); mk(F.picketTipGeo, woodMat, d2, 0.527, 0, grp);
                    } else {
                        mk(F.railZGeo, woodMat, 0, 0.44, c, grp);
                        mk(F.railZGeo, woodMat, 0, 0.21, c, grp);
                        mk(F.picketZGeo, woodMat, 0, 0.28, d1, grp); mk(F.picketTipGeo, woodMat, 0, 0.527, d1, grp);
                        mk(F.picketZGeo, woodMat, 0, 0.28, d2, grp); mk(F.picketTipGeo, woodMat, 0, 0.527, d2, grp);
                    }
                };
                if (hasE) addArm('x', 1);
                if (hasW) addArm('x', -1);
                if (hasS) addArm('z', 1);
                if (hasN) addArm('z', -1);
            }

            clPmap(pi).grps.push({ g: grp, bs: grp.scale.clone() });
            CL3.grp.add(grp);
            CL3.inst.push(grp);
        });

        return true;
    }

    function clRoamFree(s, x, z, pi) { const H = s.H; if (x < -H + 1 || z < -H + 1 || x > H - 1 || z > H - 1) return false; const o = clOcc(s).get(clCells(Math.floor(x), Math.floor(z))); return o === undefined || o === pi || o < 0; }
    function clModelRoam(dt, t) {
        { const nw = performance.now(); dt = CLM.rt ? Math.min(0.25, (nw - CLM.rt) / 1000) : dt; CLM.rt = nw; }
        const s = clS(); CLM.roam.forEach(r => {
            let moving = false;
            if (r.wait > 0) r.wait -= dt;
            else {
                if (!r.has) { for (let k = 0; k < 12 && !r.has; k++) { const an = Math.random() * 6.2832, d = 2 + Math.random() * 6, tx = r.x + Math.cos(an) * d, tz = r.z + Math.sin(an) * d; if (!clRoamFree(s, tx, tz, -999)) continue; let ok = true; for (let i = 1; i <= 10; i++) if (!clRoamFree(s, r.x + (tx - r.x) * i / 10, r.z + (tz - r.z) * i / 10, r.pi)) { ok = false; break; } if (ok) { r.tx = tx; r.tz = tz; r.has = true; } } if (!r.has) r.wait = 1.2; }
                if (r.has) { const dx = r.tx - r.x, dz = r.tz - r.z, d = Math.hypot(dx, dz); if (d < 0.25) { r.has = false; r.wait = 1.5 + Math.random() * 4; } else { const st = Math.min(d, r.def.sp * dt); const nx = r.x + dx / d * st, nz = r.z + dz / d * st; if (clRoamFree(s, nx, nz, r.pi)) { r.x = nx; r.z = nz; moving = true; let da = Math.atan2(dx, dz) + r.def.yaw - r.yaw; da = Math.atan2(Math.sin(da), Math.cos(da)); r.yaw += da * Math.min(1, dt * 6); } else { r.has = false; r.wait = 0.4; } } }
            }
            r.g.position.set(r.x, r.def.stomp && moving ? Math.abs(Math.sin(t * r.def.stomp + r.ph)) * 0.07 : 0, r.z); r.g.rotation.y = r.yaw; r.g.rotation.z = r.def.stomp && moving ? Math.sin(t * r.def.stomp + r.ph) * 0.035 : 0;
            if (r.mx) { r.mx.timeScale = moving ? 1 : 0.12; r.mx.update(dt); }
            const o = CLM.rp[r.key]; if (o) { o.x = r.x; o.z = r.z; o.yaw = r.yaw; }
        });
    }
    function clModelBegin() { CLM.mats = []; CLM.spin = []; CLM.anim = []; CL3.pmap = {}; CL3.pmapId = (CL3.pmapId || 0) + 1; CLM.roam = []; }
    function clModelFree() { CLM.mats = []; CLM.spin = []; CLM.anim = []; CLM.fish = []; CLM.bats = null; CLM._gTex = null; CLM._arcoJardimTpl = null; CLM._escolaTpl = null; CLM._tendaTpl = null; CLM._petalFx = []; clColonoFree(); clWeatherFree(); clInteractiveEventsFree(); }
    function clModelMats(def, m, cv, id) {
        const THREE = clTh(), tn = clTints(CLT[id], cv), a = new THREE.Color(tn[0]), b = new THREE.Color(tn[1]), src = Array.isArray(m.material) ? m.material[0] : m.material, nm = m.name || '';
        if (id === 'mina' && nm === 'Gold__0') { const mt = src.clone(); mt.emissive = a.clone().multiplyScalar(1.2); mt.emissiveIntensity = 0.9; mt.toneMapped = false; CLM.mats.push({ mt, base: a.clone().multiplyScalar(1.2), basic: 0, ei: 0.9 }); return mt; }
        if (def.roles) {
            if (/^neon/.test(nm)) { const mt = new THREE.MeshBasicMaterial({ color: a.clone().multiplyScalar(1.7), toneMapped: false }); CLM.mats.push({ mt, base: a.clone().multiplyScalar(1.5), basic: 1 }); return mt; }
            if (/^rays/.test(nm)) { const mt = new THREE.MeshBasicMaterial({ color: b.clone().multiplyScalar(1.5), toneMapped: false, side: THREE.DoubleSide }); CLM.mats.push({ mt, base: b.clone().multiplyScalar(1.3), basic: 1 }); return mt; }
            if (/^glass/.test(nm)) return new THREE.MeshStandardMaterial({ color: 0x9ed8ff, transparent: true, opacity: 0.3, roughness: 0.05, metalness: 0.2, envMapIntensity: 1.6, depthWrite: false });
            return new THREE.MeshStandardMaterial({ color: new THREE.Color(0x2a2c33), metalness: 0.75, roughness: 0.38, envMapIntensity: 1.3 });
        }
        const mt = src.clone(); mt.envMapIntensity = 1.0; if (mt.emissive && (mt.emissive.r + mt.emissive.g + mt.emissive.b > 0.02 || mt.emissiveMap)) { const base = mt.emissive.clone(); if (!mt.emissiveMap) mt.emissive.copy(a); else mt.emissive.lerp(a, 0.45); CLM.mats.push({ mt, ei: mt.emissiveIntensity || 1 }); }
        if (def.neon && !mt.emissiveMap) { const lum = mt.color.r * 0.3 + mt.color.g * 0.59 + mt.color.b * 0.11, sat = Math.max(mt.color.r, mt.color.g, mt.color.b) - Math.min(mt.color.r, mt.color.g, mt.color.b); if (sat > 0.35) { mt.emissive = a.clone(); mt.emissiveIntensity = 0.8; mt.color.lerp(a, 0.5); CLM.mats.push({ mt, ei: 0.8 }); } }
        return mt;
    }

    
    /* =========================================================================
       10. PORTO / DOCA DE PESCA (2x2)
       ========================================================================= */
    const CLM_PORTO_FILES = ['dock_l1.glb', 'dock_boat.glb', 'mina_barrels.glb', 'bag.glb'];
    function clPortoPreload() { CLM_PORTO_FILES.forEach(f => { if (!CLM.tpl[f] && !CLM.loading[f] && !CLM.failed[f]) clModelLoad(f); }); }
    function clPortoAssembleOld(grp, level, cv) {   /* porto antigo (doca de modelo pronto com barco em terra): guardado de lado, sem uso */
        level = Math.max(1, level | 0); clPortoPreload();
        const THREE = clTh();
        if (THREE) {
            // Lâmina de água cristalina da doca sob os barcos
            const wGeom = new THREE.CylinderGeometry(0.85, 0.85, 0.02, 24);
            const wMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.1, metalness: 0.1, transparent: true, opacity: 0.78 });
            const wMesh = new THREE.Mesh(wGeom, wMat);
            wMesh.position.set(0.82, 0.015, 0.15);
            grp.add(wMesh);
            // Estacas de sustentação de madeira submersas da doca
            const pGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.45, 8);
            const pMat = new THREE.MeshStandardMaterial({ color: 0x3d2817, roughness: 0.9 });
            [[0.55, -0.2, -0.2], [1.08, -0.2, -0.2], [0.55, -0.2, 0.5], [1.08, -0.2, 0.5]].forEach(([px, py, pz]) => {
                const pMesh = new THREE.Mesh(pGeom, pMat);
                pMesh.position.set(px, py, pz);
                grp.add(pMesh);
            });
        }
        clAddPart(grp, 'dock_l1.glb', 0, 0, 0, 0.95, 0.95, 0.95);
        clAddPart(grp, 'dock_boat.glb', 0.82, 0.03, 0.15, 0.55, 0.55, 0.55, 0, 0.25, 0);
        clAddPart(grp, 'bag.glb', -0.35, 0.14, -0.35, 0.8, 0.8, 0.8, 0, 0.5, 0);
        if (level >= 2) {
            clAddPart(grp, 'mina_barrels.glb', -0.42, 0.14, 0.35, 0.22, 0.22, 0.22, 0, 0.4, 0);
            clAddPart(grp, 'mina_barrels.glb', 0.32, 0.14, -0.45, 0.20, 0.20, 0.20, 0, -0.3, 0);
        }
        if (level >= 3) {
            clAddPart(grp, 'dock_boat.glb', -0.82, 0.03, -0.15, 0.55, 0.55, 0.55, 0, Math.PI + 0.25, 0);
            clAddPart(grp, 'mina_crystal_blue.glb', 0, 0.72, 0.85, 0.26, 0.26, 0.26, 0, 0, 0, { glow: true, glowCol: 0x00e5ff, glowInt: 1.8 });
        }
        if (level >= 4) {
            clAddPart(grp, 'bag.glb', -0.22, 0.14, -0.55, 0.85, 0.85, 0.85, 0, 1.2, 0);
            clAddPart(grp, 'mina_barrels.glb', -0.55, 0.14, 0.48, 0.24, 0.24, 0.24, 0, 0.8, 0);
        }
        if (level >= 5) {
            clAddPart(grp, 'mina_crystal_blue.glb', 0.95, 0.08, 0.75, 0.3, 0.3, 0.3, 0, 0, 0, { glow: true, glowCol: 0x00e5ff, glowInt: 2.2 });
            clAddPart(grp, 'mina_crystal_blue.glb', -0.95, 0.08, -0.75, 0.3, 0.3, 0.3, 0, 0, 0, { glow: true, glowCol: 0x00e5ff, glowInt: 2.2 });
        }
    }

    /* PORTO NOVO (procedural): uma enseada de verdade. Cais de pedra em terra, água em volta, trapiche de madeira avançando sobre a água com estacas, barco amarrado, cabana de pescador, varal de peixes e barris. CRESCE a cada nível: 1 trapiche curto, barco a remo e cabana; 2 trapiche longo, varal e caixotes; 3 trapiche em T com lampiões e barco de pesca com vela; 4 galpão de carga e farol baixo; 5 farol alto com lâmpada acesa, navio de duas velas e bandeirolas */
    function clPortoBuild(grp, cv, level) {
        const THREE = clTh(); if (!THREE || !grp) return;
        const L = Math.max(1, level | 0);
        const pal = (cv > 0 && typeof CLD !== 'undefined' && CLD.PAL && CLD.PAL[cv - 1]) ? CLD.PAL[cv - 1] : null;
        const roofCol = pal ? pal[1] : '#c8442f';
        const T = clProcTools(THREE, grp), mat = T.mat, geo = T.geo, box = T.box, add = T.add;
        const planks = T.plankTex('ppA', 3, 1), stoneT = T.stoneTex('pstA'), shT = T.shingleTex('pshA'), brT = T.brickTex('pbrA');
        const M = {
            stone: mat('pst', '#a29d94', { map: stoneT }), wood: mat('pwd', '#9a6a3c', { map: planks }), dark: mat('pdk', '#6a4426', { map: planks }), pile: mat('ppl', '#4a3220'),
            water: mat('pwt', '#2fa8dc', { transparent: true, opacity: 0.9, roughness: 0.12, metalness: 0.1 }), foam: mat('pfm', '#ffffff', { transparent: true, opacity: 0.85 }),
            roof: mat('prf' + roofCol, roofCol, { map: shT }), hull: mat('phl', '#b5532f', { map: planks }), hull2: mat('phl2', '#2f6fb0', { map: planks }), inner: mat('pin', '#ead9b6'),
            sail: mat('psl', '#f6f0e2', { side: THREE.DoubleSide }), sail2: mat('psl2' + roofCol, roofCol, { side: THREE.DoubleSide }), wall2: mat('pw2', '#d8c8a6', { map: brT }),
            glow: mat('pgl', '#ffd27a', { emissive: new THREE.Color(0xffd27a), emissiveIntensity: 1.5 }), red: mat('prd', '#d2402e', { map: brT }), white: mat('pwh', '#f3efe6', { map: brT }),
            gold: mat('pgd', '#ffc400', { metalness: 0.3, roughness: 0.4 }), fish: mat('pfs', '#c9d6e0', { metalness: 0.4, roughness: 0.35 }), rope: mat('prp', '#cdb98a')
        };
        const put = (par, g, m, x, y, z, rx, ry, rz) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); if (rx) o.rotation.x = rx; if (ry) o.rotation.y = ry; if (rz) o.rotation.z = rz; o.castShadow = true; o.receiveShadow = true; par.add(o); return o; };
        const cyl = (r, h, n) => geo('pcy' + r + '_' + h + '_' + (n || 10), () => new THREE.CylinderGeometry(r, r, h, n || 10));
        const prism = (w, h, len) => geo('ppr' + w + '_' + h + '_' + len, () => { const s = new THREE.Shape(); s.moveTo(-w, 0); s.lineTo(w, 0); s.lineTo(0, h); s.lineTo(-w, 0); const g = new THREE.ExtrudeGeometry(s, { depth: len, bevelEnabled: false }); g.translate(0, 0, -len / 2); return g; });
        const hullGeo = (k, sc) => geo('phg' + k, () => { const s = new THREE.Shape(); s.moveTo(0, 0.36 * sc); s.quadraticCurveTo(0.22 * sc, 0.1 * sc, 0.16 * sc, -0.3 * sc); s.lineTo(-0.16 * sc, -0.3 * sc); s.quadraticCurveTo(-0.22 * sc, 0.1 * sc, 0, 0.36 * sc); const g = new THREE.ExtrudeGeometry(s, { depth: 0.11, bevelEnabled: false }); g.rotateX(-Math.PI / 2); return g; });
        const sailGeo = (k, w, h) => geo('psg' + k, () => { const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(w, 0); s.lineTo(0, h); s.lineTo(0, 0); return new THREE.ShapeGeometry(s); });
        const boat = (x, z, ry, s, masts, big) => {
            const bg = new THREE.Group(); bg.position.set(x, 0.08, z); bg.rotation.y = ry; bg.scale.setScalar(s); grp.add(bg);
            put(bg, hullGeo('o', 1), big ? M.hull2 : M.hull, 0, 0.0, 0); put(bg, hullGeo('i', 0.8), M.inner, 0, 0.1, 0.02);
            put(bg, box(0.22, 0.03, 0.05), M.dark, 0, 0.15, 0.04); put(bg, box(0.22, 0.03, 0.05), M.dark, 0, 0.15, -0.14);
            for (let m = 0; m < masts; m++) { const mz = masts === 1 ? -0.02 : (m ? 0.14 : -0.1), mh = 0.62 - m * 0.12; put(bg, cyl(0.014, mh, 6), M.dark, 0, 0.1 + mh / 2, mz); put(bg, sailGeo('s' + mh, 0.22, mh * 0.85), m ? M.sail2 : M.sail, 0.0, 0.16, mz + 0.01, 0, Math.PI / 2); }
            if (!masts) { put(bg, cyl(0.01, 0.34, 5), M.dark, 0.2, 0.2, 0.0, 0, 0, 1.1); put(bg, cyl(0.01, 0.34, 5), M.dark, -0.2, 0.2, 0.0, 0, 0, -1.1); }
            return bg;
        };
        /* terra e água */
        add(box(2.0, 0.14, 0.78), M.stone, 0, 0.07, -0.61);
        add(box(2.0, 0.07, 1.22), M.water, 0, 0.035, 0.39);
        add(box(1.98, 0.02, 0.06), M.foam, 0, 0.085, -0.2);
        add(box(0.07, 0.15, 1.24), M.stone, -0.965, 0.075, 0.39); add(box(0.07, 0.15, 1.24), M.stone, 0.965, 0.075, 0.39); add(box(2.0, 0.15, 0.07), M.stone, 0, 0.075, 1.0);
        /* trapiche */
        const px = -0.2, lp = L >= 2 ? 1.1 : 0.72, pz0 = -0.2, pzc = pz0 + lp / 2;
        add(box(0.38, 0.05, lp), M.wood, px, 0.17, pzc); add(box(0.4, 0.03, 0.04), M.dark, px, 0.2, pz0 + lp - 0.02);
        for (let z = pz0 + 0.18; z < pz0 + lp; z += 0.3) { add(cyl(0.032, 0.26, 8), M.pile, px - 0.2, 0.13, z); add(cyl(0.032, 0.26, 8), M.pile, px + 0.2, 0.13, z); }
        add(box(0.02, 0.012, lp), M.dark, px - 0.19, 0.205, pzc); add(box(0.02, 0.012, lp), M.dark, px + 0.19, 0.205, pzc);
        if (L >= 3) {
            add(box(1.0, 0.05, 0.26), M.wood, px + 0.3, 0.17, pz0 + lp - 0.13);
            [0.0, 0.5, 0.78].forEach(dx => { add(cyl(0.032, 0.26, 8), M.pile, px + dx - 0.2 + 0.2, 0.13, pz0 + lp - 0.01); add(cyl(0.032, 0.26, 8), M.pile, px + dx - 0.2 + 0.2, 0.13, pz0 + lp - 0.26); });
            [[px - 0.18, pz0 + lp - 0.02], [px + 0.78, pz0 + lp - 0.2]].forEach(([lx, lz]) => { add(cyl(0.015, 0.34, 6), M.dark, lx, 0.36, lz); add(geo('pls', () => new THREE.SphereGeometry(0.05, 10, 8)), M.glow, lx, 0.56, lz); });
        } else { add(cyl(0.028, 0.18, 8), M.dark, px + 0.17, 0.27, pz0 + lp - 0.03); add(cyl(0.028, 0.18, 8), M.dark, px - 0.17, 0.27, pz0 + lp - 0.03); }
        /* barcos */
        if (L < 3) boat(0.45, 0.42, 0.25, 1.0, 0, false);
        else if (L < 5) { boat(0.58, 0.3, -0.15, 0.9, 0, false); boat(0.52, 0.56, 0.1, 1.1, 1, true); }
        else { boat(0.62, 0.22, -0.15, 0.85, 0, false); boat(0.5, 0.58, 0.08, 1.3, 2, true); }
        /* cabana de pescador */
        add(box(0.62, 0.34, 0.5), M.wood, -0.62, 0.31, -0.62); add(box(0.62, 0.02, 0.5), M.dark, -0.62, 0.15, -0.62);
        add(prism(0.42, 0.26, 0.66), M.roof, -0.62, 0.48, -0.62, 0, Math.PI / 2, 0);
        add(box(0.13, 0.22, 0.02), M.dark, -0.5, 0.25, -0.365); add(box(0.1, 0.09, 0.02), M.glow, -0.76, 0.34, -0.365);
        add(box(0.1, 0.18, 0.1), M.stone, -0.8, 0.6, -0.72);
        /* barris */
        [[-0.9, -0.3], [-0.78, -0.27], [-0.86, -0.18]].forEach(([bx, bz], i) => { add(cyl(0.07, 0.13, 10), M.dark, bx, 0.2, bz); add(geo('pbt', () => new THREE.TorusGeometry(0.07, 0.008, 6, 14).rotateX(Math.PI / 2)), M.pile, bx, 0.22, bz); });
        if (L >= 2) {
            add(box(0.05, 0.38, 0.05), M.dark, 0.0, 0.33, -0.4); add(box(0.05, 0.38, 0.05), M.dark, 0.5, 0.33, -0.4); add(box(0.58, 0.025, 0.03), M.dark, 0.25, 0.5, -0.4);
            for (let k = 0; k < 6; k++) add(box(0.04, 0.1, 0.012), M.fish, 0.05 + k * 0.08, 0.43, -0.4);
            add(box(0.17, 0.15, 0.17), M.wood, 0.78, 0.215, -0.34); add(box(0.15, 0.13, 0.15), M.dark, 0.74, 0.2, -0.17, 0, 0.4, 0);
        }
        if (L >= 4) {
            add(box(0.56, 0.4, 0.42), M.wall2, 0.43, 0.34, -0.66); add(prism(0.34, 0.2, 0.62), M.roof, 0.43, 0.54, -0.66, 0, Math.PI / 2, 0);
            add(T.arch('pgd', 0.22, 0.2, 0.03), M.dark, 0.43, 0.14, -0.445); add(box(0.5, 0.03, 0.04), M.dark, 0.43, 0.2, -0.43);
            const lh = L >= 5 ? 1.05 : 0.72, lx = 0.82, lz = -0.74;
            for (let b = 0; b < (L >= 5 ? 4 : 3); b++) { const hh = lh / (L >= 5 ? 4 : 3), r0 = 0.16 - b * 0.012; add(geo('plh' + b + L, () => new THREE.CylinderGeometry(r0 - 0.012, r0, hh, 18)), b % 2 ? M.white : M.red, lx, 0.14 + hh * b + hh / 2, lz); }
            add(geo('plg' + L, () => new THREE.CylinderGeometry(0.15, 0.15, 0.03, 18)), M.gold, lx, 0.14 + lh + 0.015, lz);
            add(geo('plm' + L, () => new THREE.SphereGeometry(0.075, 14, 10)), M.glow, lx, 0.14 + lh + 0.1, lz);
            add(geo('plc' + L, () => new THREE.ConeGeometry(0.12, 0.14, 14)), M.roof, lx, 0.14 + lh + 0.24, lz);
        }
        if (L >= 5) {
            for (let k = 0; k < 7; k++) { const fx = -0.95 + k * 0.32, fy = 0.62 - Math.sin(k / 6 * Math.PI) * -0.0; add(box(0.1, 0.07, 0.01), k % 2 ? M.sail2 : M.sail, fx, fy + Math.sin(k * 1.3) * 0.015, 0.97); }
            add(cyl(0.012, 0.62, 6), M.dark, -0.95, 0.43, 0.97); add(cyl(0.012, 0.62, 6), M.dark, 0.95, 0.43, 0.97); add(box(1.9, 0.012, 0.012), M.rope, 0, 0.64, 0.97);
        }
    }
    function clPortoAssemble(grp, level, cv) {
        level = Math.max(1, level | 0);
        clPortoBuild(grp, cv, level);   // a estrutura cresce a cada nível
    }

    function clPortoPreload2() { if (!CLM.tpl['fp_crate_single.glb'] && !CLM.loading['fp_crate_single.glb'] && !CLM.failed['fp_crate_single.glb']) clModelLoad('fp_crate_single.glb'); }
    /* =========================================================================
       11. TORRE DE VIGIA (1x1)
       ========================================================================= */
    const CLM_TORRE_FILES = ['watchtower_l1.glb', 'watchtower_l2.glb', 'watchtower_l3.glb'];
    function clTorreVigiaPreload() { CLM_TORRE_FILES.forEach(f => { if (!CLM.tpl[f] && !CLM.loading[f] && !CLM.failed[f]) clModelLoad(f); }); }
    function clTorreVigiaAssemble(grp, level, cv) {
        level = Math.max(1, level | 0); clTorreVigiaPreload();
        if (clProtoUse(grp, 'torre_vigia', level, cv)) return;

        if (level === 1) {
            clAddPart(grp, 'watchtower_l1.glb', 0, 0, 0, 1.15, 1.15, 1.15);
        } else if (level === 2) {
            clAddPart(grp, 'watchtower_l2.glb', 0, 0, 0, 1.15, 1.15, 1.15);
        } else {
            clAddPart(grp, 'watchtower_l3.glb', 0, 0, 0, 1.15, 1.15, 1.15);
        }
        if (level >= 4) {
            clAddPart(grp, 'mina_crystal_blue.glb', 0.18, 1.85, 0.18, 0.18, 0.18, 0.18, 0, 0, 0, { glow: true, glowCol: 0xffd27a, glowInt: 2.0 });
            clAddPart(grp, 'mina_crystal_blue.glb', -0.18, 1.85, -0.18, 0.18, 0.18, 0.18, 0, 0, 0, { glow: true, glowCol: 0xffd27a, glowInt: 2.0 });
        }
        if (level >= 5) {
            clAddPart(grp, 'mina_crystal_blue.glb', 0, 2.15, 0, 0.28, 0.28, 0.28, 0, 0, 0, { glow: true, glowCol: 0xffd27a, glowInt: 2.5, spin: 1.2 });
        }
    }

    /* =========================================================================
       12. PRAÇA CENTRAL COM CORETO E POÇO (2x2)
       ========================================================================= */
    const CLM_PRACA_FILES = ['praca_gazebo.glb', 'praca_well.glb', 'praca_bench.glb'];
    function clPracaPreload() { CLM_PRACA_FILES.forEach(f => { if (!CLM.tpl[f] && !CLM.loading[f] && !CLM.failed[f]) clModelLoad(f); }); }
    function clPracaAssemble(grp, level, cv) {
        level = Math.max(1, level | 0); clPracaPreload();
        if (level === 1) {
            clAddPart(grp, 'praca_gazebo.glb', 0, 0, 0, 1.30, 1.30, 1.30);
            clAddPart(grp, 'praca_bench.glb', -0.72, 0, 0.72, 0.70, 0.70, 0.70, 0, 0.785, 0);
            clAddPart(grp, 'praca_bench.glb', 0.72, 0, -0.72, 0.70, 0.70, 0.70, 0, -2.35, 0);
        } else if (level === 2) {
            clAddPart(grp, 'praca_gazebo.glb', -0.30, 0, -0.30, 1.15, 1.15, 1.15);
            clAddPart(grp, 'praca_well.glb', 0.45, 0, 0.45, 0.65, 0.65, 0.65);
            clAddPart(grp, 'praca_bench.glb', -0.72, 0, 0.72, 0.70, 0.70, 0.70, 0, 0.785, 0);
            clAddPart(grp, 'praca_bench.glb', 0.72, 0, -0.72, 0.70, 0.70, 0.70, 0, -2.35, 0);
        } else {
            clAddPart(grp, 'praca_gazebo.glb', 0, 0, 0, 1.30, 1.30, 1.30);
            clAddPart(grp, 'praca_well.glb', 0.65, 0, 0.65, 0.55, 0.55, 0.55);
            clAddPart(grp, 'praca_bench.glb', -0.72, 0, 0.72, 0.55, 0.55, 0.55, 0, 0.785, 0);
            clAddPart(grp, 'praca_bench.glb', 0.72, 0, -0.72, 0.55, 0.55, 0.55, 0, -2.35, 0);
            clAddPart(grp, 'praca_bench.glb', -0.72, 0, -0.72, 0.55, 0.55, 0.55, 0, 2.35, 0);
        }
        if (level >= 4) {
            clAddPart(grp, 'mina_crystal_blue.glb', 0, 1.15, 0, 0.28, 0.28, 0.28, 0, 0, 0, { glow: true, glowCol: 0xffd27a, glowInt: 1.8 });
        }
        if (level >= 5) {
            clAddPart(grp, 'mina_crystal_blue.glb', 0, 1.85, 0, 0.35, 0.35, 0.35, 0, 0, 0, { glow: true, glowCol: 0xffd27a, glowInt: 2.2, spin: 0.8 });
        }
    }

    /* =========================================================================
       13. BANCO DE PRAÇA (1x1) - BANCO TRABALHADO EM FERRO E MADEIRA
       ========================================================================= */
    const CLM_BANCO_FILES = ['bench.glb', 'mina_crystal_blue.glb', 'fp_crate_single.glb'];
    function clBancoPreload() { CLM_BANCO_FILES.forEach(f => { if (!CLM.tpl[f] && !CLM.loading[f] && !CLM.failed[f]) clModelLoad(f); }); }
    function clBancoAssemble(grp, level, cv) {
        level = Math.max(1, level | 0); clBancoPreload();
        const o = { cv };
        /* banco original: o arquivo nasce a centenas de unidades do chão; esta escala e este deslocamento apoiam ele no bloco */
        clAddPart(grp, 'bench.glb', 0.02, -0.91, 0.82, 0.0028, 0.0028, 0.0028, 0, 0, 0, o);
        if (level >= 2) {
            clAddPart(grp, 'fp_crate_single.glb', 0.35, 0, 0.32, 0.45, 0.45, 0.45, 0, 0.3, 0, o);
        }
        if (level >= 3) {
            clAddPart(grp, 'mina_crystal_blue.glb', -0.35, 0.05, 0.32, 0.16, 0.16, 0.16, 0, 0, 0, { glow: true, glowCol: 0xffd27a, glowInt: 1.8 });
        }
        if (level >= 4) {
            clAddPart(grp, 'mina_crystal_blue.glb', 0, 0.75, -0.03, 0.22, 0.22, 0.22, 0, 0, 0, { glow: true, glowCol: 0xffd27a, glowInt: 2.2, spin: 0.9 });
        }
    }

    /* =========================================================================
       14. ARCO & PASSARELA DE TÁBUAS (stylized_wood.glb)
       ========================================================================= */
    const CLM_ARCO_FILES = ['fp_crate_single.glb', 'mina_crystal_blue.glb'];
    function clArcoPreload() { CLM_ARCO_FILES.forEach(f => { if (!CLM.tpl[f] && !CLM.loading[f] && !CLM.failed[f]) clModelLoad(f); }); }
    function clArcoBuild(grp, cv, level) {   /* portal de jardim que CRESCE: 1 portal de madeira com viga curva, 2 pilares de pedra, lanterna e trepadeiras floridas, 3 portal duplo com torres de telhas e pedra-chave brilhante */
        const THREE = clTh(); if (!THREE || !grp) return;
        const L = Math.max(1, level | 0);
        const pal = (cv > 0 && typeof CLD !== 'undefined' && CLD.PAL && CLD.PAL[cv - 1]) ? CLD.PAL[cv - 1] : null;
        const roofCol = pal ? pal[1] : '#1fa89f';
        const T = clProcTools(THREE, grp), tex = T.tex, mat = T.mat, geo = T.geo, box = T.box, add = T.add, rn = T.rn;
        const planks = T.plankTex('pvC', 2, 1), stoneT = T.stoneTex('stC'), shingle = T.shingleTex('shgC');
        const leaf = tex('lfC', g => { g.fillStyle = '#2f6f26'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 90; i++) { g.fillStyle = ['#3d8a30', '#58a83e', '#7cc653', '#2a6a24'][Math.floor(rn() * 4)]; g.beginPath(); g.ellipse(rn() * 64, rn() * 64, 3 + rn() * 4, 2 + rn() * 3, rn() * 3, 0, 6.283); g.fill(); } }, 2, 2);
        const blos = tex('blC', g => { g.fillStyle = '#f4a9c8'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 70; i++) { g.fillStyle = ['#ffd1e3', '#ffffff', '#ee86b3'][Math.floor(rn() * 3)]; g.beginPath(); g.ellipse(rn() * 64, rn() * 64, 2 + rn() * 4, 2 + rn() * 3, rn() * 3, 0, 6.283); g.fill(); } }, 2, 2);
        const M = { wood: mat('awd', '#8a5a32', { map: planks }), dark: mat('adk', '#5a3a22', { map: planks }), stone: mat('ast', '#cfc6b4', { map: stoneT }), roof: mat('arf' + roofCol, roofCol, { map: shingle }), gold: mat('agd', '#e8b84a', { metalness: 0.45, roughness: 0.35 }), leaf: mat('alf', '#ffffff', { map: leaf, roughness: 0.8 }), blos: mat('abl', '#ffffff', { map: blos, roughness: 0.8 }), warm: mat('awm', '#ffd27a', { emissive: 0xffc860, emissiveIntensity: 0.9, roughness: 0.3 }), iron: mat('air', '#3a3a42', { metalness: 0.4 }) };
        const W = L >= 3 ? 0.78 : 0.68, H = L === 1 ? 0.62 : L === 2 ? 0.72 : 0.82;
        const pillar = (x) => {
            if (L === 1) { add(box(0.12, H, 0.12), M.wood, x, H / 2 + 0.03, 0); add(box(0.2, 0.05, 0.2), M.dark, x, 0.025, 0); }
            else { add(box(0.2, 0.1, 0.2), M.stone, x, 0.05, 0); add(box(0.16, H - 0.05, 0.16), M.stone, x, 0.1 + (H - 0.05) / 2, 0); add(box(0.22, 0.05, 0.22), M.stone, x, H + 0.075, 0); if (L >= 3) { add(geo('acp', () => new THREE.ConeGeometry(0.16, 0.2, 4)), M.roof, x, H + 0.2, 0, 0, Math.PI / 4, 0); add(geo('acb', () => new THREE.SphereGeometry(0.03, 8, 6)), M.gold, x, H + 0.34, 0); } }
        };
        pillar(-W); pillar(W);
        const R = W, ay = H + (L === 1 ? 0.03 : 0.1);
        add(geo('aar' + R + L, () => new THREE.TorusGeometry(R, L === 1 ? 0.045 : 0.05, 8, 32, Math.PI)), M.wood, 0, ay, 0);
        if (L >= 3) add(geo('aar2' + R, () => new THREE.TorusGeometry(R - 0.12, 0.03, 8, 32, Math.PI)), M.dark, 0, ay, 0);
        add(box(R * 2 + 0.2, 0.05, 0.08), M.dark, 0, ay - 0.02, 0);
        if (L === 1) { add(box(0.34, 0.12, 0.03), M.dark, 0, ay + R * 0.55, 0); }
        if (L >= 2) {
            add(geo('alc', () => new THREE.CylinderGeometry(0.004, 0.004, 0.2, 4)), M.iron, 0, ay + R - 0.1, 0); add(geo('alb', () => new THREE.SphereGeometry(0.06, 12, 8)), M.warm, 0, ay + R - 0.26, 0);
            for (let k = 0; k < 16; k++) { const a = Math.PI * (k / 15), x = Math.cos(a) * R, y = Math.sin(a) * R; const b = add(geo('alv', () => new THREE.IcosahedronGeometry(1, 1)), k % 4 === 2 ? M.blos : M.leaf, x * 1.0, ay + y + 0.01, rr(-0.04, 0.04)); b.scale.setScalar(0.06 + rn() * 0.04); }
            [-1, 1].forEach(sx => { for (let k = 0; k < 6; k++) { const b = add(geo('alv', () => new THREE.IcosahedronGeometry(1, 1)), k % 3 === 1 ? M.blos : M.leaf, sx * W + (rn() - 0.5) * 0.1, 0.18 + k * (H / 6.5), (rn() - 0.5) * 0.1); b.scale.setScalar(0.06 + rn() * 0.04); } });
        }
        if (L >= 3) { add(geo('ako', () => new THREE.OctahedronGeometry(0.1).scale(1, 1.4, 1)), M.warm, 0, ay + R + 0.14, 0); add(geo('akb', () => new THREE.CylinderGeometry(0.06, 0.08, 0.06, 8)), M.gold, 0, ay + R + 0.02, 0); }
        add(box(W * 2 + 0.6, 0.04, 0.5), M.stone, 0, 0.02, 0);
        function rr(a, b) { return a + (b - a) * rn(); }
    }
    function clArcoAssemble(grp, level, cv) {
        level = Math.max(1, level | 0); clArcoPreload();
        clArcoFire(grp, cv, level);   /* o Arco agora é um portal de pedra em chamas (36jl-colony-firearch.js) */
    }
    /*arco-fim*/

    const CLM_TABUAS_FILES = ['fp_crate_single.glb'];
    function clTabuasPreload() { CLM_TABUAS_FILES.forEach(f => { if (!CLM.tpl[f] && !CLM.loading[f] && !CLM.failed[f]) clModelLoad(f); }); }
    function clTabuasBuild(grp, cv) {   /* passarela de madeira: estrado de tábuas largas com veios no sentido do comprimento, pequenas folgas, longarinas por baixo, pregos e bordas escuras */
        const THREE = clTh(); if (!THREE || !grp) return;
        const T = clProcTools(THREE, grp), tex = T.tex, mat = T.mat, geo = T.geo, box = T.box, add = T.add, rn = T.rn;
        const grain = tex('tgr', g => { g.fillStyle = '#d4d4d4'; g.fillRect(0, 0, 64, 64); for (let y = 0; y < 64; y += 2) { const v = 190 + Math.floor(rn() * 40); g.fillStyle = 'rgb(' + v + ',' + v + ',' + v + ')'; g.fillRect(0, y, 64, 2); } for (let i = 0; i < 16; i++) { g.fillStyle = 'rgba(40,20,5,0.18)'; g.fillRect(Math.floor(rn() * 40), Math.floor(rn() * 62), 6 + Math.floor(rn() * 24), 1); } g.fillStyle = 'rgba(40,20,5,0.25)'; g.beginPath(); g.ellipse(14 + rn() * 30, 20 + rn() * 24, 3, 2, 0, 0, 6.283); g.fill(); }, 1, 1);
        const tones = ['#8a5a2e', '#7d5129', '#965f32', '#734826', '#905d2f', '#83542b'].map((c, i) => mat('tp' + i, c, { map: grain, roughness: 0.9 }));
        const M = { beam: mat('tbm', '#5e3b20', { map: grain }), nail: mat('tnl', '#3a3a42', { metalness: 0.5, roughness: 0.4 }), edge: mat('ted', '#6f4626', { map: grain }) };
        [-0.33, 0.33].forEach(x => add(box(0.08, 0.06, 1.0), M.beam, x, 0.03, 0));
        const n = 6, pw = 0.152, gap = 0.012;
        for (let i = 0; i < n; i++) { const z = -0.5 + pw / 2 + 0.005 + i * (pw + gap), len = 0.9 + (i % 3) * 0.04, o = add(box(len, 0.045, pw), tones[i % 6], (rn() - 0.5) * 0.03, 0.084, z); o.rotation.y = (rn() - 0.5) * 0.025; o.position.y += (rn() - 0.5) * 0.008;
            [-0.33, 0.33].forEach(x => add(geo('tnl', () => new THREE.CylinderGeometry(0.012, 0.012, 0.008, 8)), M.nail, x, 0.11, z)); }
        add(box(0.07, 0.07, 1.0), M.edge, -0.47, 0.065, 0); add(box(0.07, 0.07, 1.0), M.edge, 0.47, 0.065, 0);
    }
    function clTabuasAssemble(grp, level, cv) {
        clTabuasPreload();
        clTabuasBuild(grp, cv);
    }

    /* =========================================================================
       BATERIA (1x2): banco de baterias de desenho animado, feito em código
       ========================================================================= */
    const CLM_BATERIA_FILES = ['fp_crate_single.glb', 'fp_barrel.glb', 'fp_crates_veg.glb', 'mina_crystal_blue.glb'];
    function clBateriaPreload() { CLM_BATERIA_FILES.forEach(f => { if (!CLM.tpl[f] && !CLM.loading[f] && !CLM.failed[f]) clModelLoad(f); }); }
    function clBateriaBuild(grp, cv, level) {   /* banco de baterias industrial que CRESCE a cada nível: 1 um módulo com terminais + e -, 2 dois módulos ligados por cabo, 3 três módulos com barramento de cobre e painel, 4 contêiner de aço com ventoinhas e sinalizador, 5 contêiner grande com transformador e núcleo de energia girando */
        const THREE = clTh(); if (!THREE || !grp) return;
        const L = Math.max(1, level | 0), pal = (cv > 0 && typeof CLD !== 'undefined' && CLD.PAL && CLD.PAL[cv - 1]) ? CLD.PAL[cv - 1] : null, accent = pal ? pal[1] : '#31d68a';
        const tc = pal ? new THREE.Color(pal[1]) : null, hx = (c, f) => '#' + c.clone().multiplyScalar(f).getHexString();   /* a cor escolhida pinta o corpo, a tampa e o contêiner da bateria */
        const T = clProcTools(THREE, grp), tex = T.tex, geo = T.geo, box = T.box, add = T.add, stoneT = T.stoneTex('stB2');
        const mat = (k, col, extra) => T.mat(k + 'x', '#' + new THREE.Color(col).multiplyScalar(extra && extra.emissive ? 1 : extra && extra.map ? 0.78 : 0.5).getHexString(), extra);   /* a luz da colônia clareia muito: as cores entram escurecidas para a bateria parecer de metal de verdade */
        const cyl = (r1, r2, h, n) => geo('b2c' + r1 + '_' + r2 + '_' + h + '_' + n, () => new THREE.CylinderGeometry(r1, r2, h, n || 16));
        const label = tex('b2lab', g => { g.fillStyle = '#e8edf2'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#1b2a3a'; g.fillRect(3, 3, 58, 58); g.fillStyle = '#ffd23a'; g.beginPath(); [[36, 8], [20, 34], [31, 34], [26, 56], [46, 26], [34, 26]].forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fill(); g.fillStyle = '#7cff9a'; for (let i = 0; i < 4; i++) g.fillRect(52, 12 + i * 11, 6, 7); g.fillStyle = '#e8edf2'; g.fillRect(8, 56, 20, 2); }, 1, 1);
        const hazard = tex('b2haz', g => { g.fillStyle = '#f2b52a'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#1c1c20'; for (let i = -2; i < 6; i++) { g.beginPath(); g.moveTo(i * 16, 64); g.lineTo(i * 16 + 8, 64); g.lineTo(i * 16 + 40, 0); g.lineTo(i * 16 + 32, 0); g.closePath(); g.fill(); } }, 6, 1);
        const M = { conc: mat('b2cn', '#7f858f', { map: stoneT, roughness: 0.9 }), frame: mat('b2fr', '#262b34', { metalness: 0.6, roughness: 0.45 }), haz: mat('b2hz', '#ffffff', { map: hazard, roughness: 0.6 }),
            body: mat('b2bd' + cv, tc ? hx(tc, 0.62) : '#20293a', { metalness: 0.55, roughness: 0.5 }), lid: mat('b2ld' + cv, tc ? hx(tc, 0.8) : '#394458', { metalness: 0.55, roughness: 0.4 }), band: mat('b2bn', '#8f9aab', { metalness: 0.75, roughness: 0.32 }), red: mat('b2rd', '#d6342c', { metalness: 0.3, roughness: 0.4 }), blk: mat('b2bk', '#14171c', { metalness: 0.3, roughness: 0.5 }),
            lab: mat('b2lb', '#ffffff', { map: label, roughness: 0.5 }), led: mat('b2le', '#3dff9a', { emissive: 0x3dff9a, emissiveIntensity: 1.2, roughness: 0.4 }), ledr: mat('b2lr', '#ff6a4a', { emissive: 0xff6a4a, emissiveIntensity: 1.3, roughness: 0.4 }), acc: mat('b2ac' + accent, accent, { emissive: new THREE.Color(accent), emissiveIntensity: 0.9, roughness: 0.4 }),
            cop: mat('b2cp', '#c9782e', { metalness: 0.7, roughness: 0.35 }), steel: mat('b2st' + cv, tc ? hx(tc, 0.9) : '#58677c', { metalness: 0.6, roughness: 0.42 }), steelL: mat('b2sl' + cv, tc ? hx(tc, 1.15) : '#7d8ba0', { metalness: 0.65, roughness: 0.38 }), porc: mat('b2pc', '#e9e2d6', { roughness: 0.4 }),
            glass: mat('b2gl', '#9fe8ff', { emissive: 0x4fd8ff, emissiveIntensity: 0.6, roughness: 0.2, transparent: true, opacity: 0.85 }), core: mat('b2co', '#bff6ff', { emissive: 0x6af0ff, emissiveIntensity: 1.6, roughness: 0.25 }), ring: mat('b2rg', '#6af0ff', { emissive: 0x6af0ff, emissiveIntensity: 1.3, roughness: 0.3 }) };
        /* base de concreto com moldura de aço e faixa de aviso */
        add(box(0.98, 0.08, 1.94), M.conc, 0, 0.04, 0); add(box(1.0, 0.03, 1.96), M.frame, 0, 0.095, 0); add(box(0.96, 0.012, 0.07), M.haz, 0, 0.116, 0.93); add(box(0.96, 0.012, 0.07), M.haz, 0, 0.116, -0.93);
        const base = 0.115;
        const module = (x, z, w, d, h, pol) => {   /* um módulo de bateria: caixa escura com tampa, cintas de aço, terminal + (vermelho) e - (preto), etiqueta com raio e luzes de carga */
            add(box(w, h, d), M.body, x, base + h / 2, z); add(box(w + 0.025, 0.04, d + 0.025), M.lid, x, base + h + 0.02, z);
            [0.3, 0.66].forEach(f => add(box(w + 0.014, 0.022, d + 0.014), M.band, x, base + h * f, z));
            const ty = base + h + 0.04;
            [[1, M.red], [-1, M.blk]].forEach(([sx, m]) => { add(cyl(0.05, 0.05, 0.07, 14), m, x + sx * w * 0.27, ty + 0.035, z - d * 0.26); add(cyl(0.058, 0.058, 0.018, 14), M.band, x + sx * w * 0.27, ty + 0.075, z - d * 0.26); add(box(0.03, 0.006, 0.006), M.steelL, x + sx * w * 0.27, ty + 0.087, z - d * 0.26); if (sx > 0) add(box(0.006, 0.006, 0.03), M.steelL, x + sx * w * 0.27, ty + 0.087, z - d * 0.26); });
            add(cyl(0.028, 0.028, 0.04, 10), M.steelL, x, ty + 0.02, z + d * 0.22); add(cyl(0.028, 0.028, 0.04, 10), M.steelL, x + w * 0.18, ty + 0.02, z + d * 0.22);
            add(box(0.012, h * 0.62, d * 0.55), M.lab, x + w / 2 + 0.004, base + h * 0.5, z); add(box(0.012, h * 0.62, d * 0.55), M.lab, x - w / 2 - 0.004, base + h * 0.5, z);
            add(box(0.02, 0.03, 0.14), M.led, x + w / 2 + 0.012, base + h * 0.88, z - d * 0.3); add(box(0.02, 0.03, 0.14), M.led, x - w / 2 - 0.012, base + h * 0.88, z - d * 0.3);
            return { tx: x + w * 0.27, tz: z - d * 0.26, ty: ty + 0.08, nx: x - w * 0.27, top: base + h + 0.04 };
        };
        const cable = (x, y, z0, z1, m) => { const R = Math.abs(z1 - z0) / 2; add(geo('b2cb' + R.toFixed(3), () => new THREE.TorusGeometry(R, 0.016, 8, 22, Math.PI).rotateY(Math.PI / 2)), m, x, y, (z0 + z1) / 2, 0, 0, 0).scale.y = 0.55; };
        if (L === 1) {
            module(0, 0.15, 0.6, 0.95, 0.52);
            add(box(0.3, 0.36, 0.22), M.frame, 0, base + 0.18, -0.72); add(box(0.22, 0.1, 0.012), M.led, 0, base + 0.25, -0.608); add(box(0.22, 0.05, 0.012), M.acc, 0, base + 0.14, -0.608); add(cyl(0.012, 0.012, 0.3, 6), M.steelL, 0.1, base + 0.5, -0.72);
        } else if (L === 2) {
            const a = module(0, -0.5, 0.62, 0.8, 0.52), b = module(0, 0.5, 0.62, 0.8, 0.52);
            cable(a.tx, a.ty, a.tz, b.tz, M.red); cable(a.nx, a.ty, a.tz, b.tz, M.blk);
            add(box(0.26, 0.3, 0.2), M.frame, 0.33, base + 0.15, -0.9); add(box(0.2, 0.08, 0.012), M.led, 0.33, base + 0.22, -0.797);
        } else if (L === 3) {
            const zs = [-0.64, 0, 0.64], ms = zs.map(z => module(0, z, 0.64, 0.56, 0.5));
            add(box(0.05, 0.04, 1.3), M.cop, ms[0].tx, ms[0].ty + 0.05, 0); add(box(0.05, 0.04, 1.3), M.blk, ms[0].nx, ms[0].ty + 0.05, 0);
            ms.forEach(m => { add(cyl(0.01, 0.01, 0.06, 6), M.cop, m.tx, m.ty + 0.02, m.tz); add(cyl(0.01, 0.01, 0.06, 6), M.cop, m.nx, m.ty + 0.02, m.tz); });
            add(box(0.36, 0.62, 0.22), M.frame, 0.28, base + 0.31, 0.92); add(box(0.28, 0.2, 0.012), M.glass, 0.28, base + 0.46, 0.811); [0, 1, 2].forEach(i => add(box(0.05, 0.05, 0.012), i === 2 ? M.ledr : M.led, 0.2 + i * 0.08, base + 0.28, 0.811)); add(cyl(0.012, 0.012, 0.34, 6), M.steelL, 0.28, base + 0.78, 0.92);
        } else {
            const big = L >= 5, cd = big ? 1.28 : 1.0, ch = big ? 0.76 : 0.66, cz = big ? 0.3 : 0.45, cw = 0.78;
            add(box(cw, ch, cd), M.steel, 0, base + ch / 2, cz); add(box(cw + 0.03, 0.04, cd + 0.03), M.steelL, 0, base + ch + 0.02, cz);
            for (let i = 0; i < (big ? 9 : 7); i++) { const zz = cz - cd / 2 + 0.1 + i * ((cd - 0.2) / (big ? 8 : 6)); add(box(cw + 0.026, ch * 0.86, 0.026), M.steelL, 0, base + ch / 2, zz); }
            add(box(cw - 0.08, ch * 0.78, 0.014), M.frame, 0, base + ch / 2, cz + cd / 2 + 0.01); add(box(0.014, ch * 0.78, 0.016), M.band, 0, base + ch / 2, cz + cd / 2 + 0.022); [-0.1, 0.1].forEach(x => add(box(0.012, 0.1, 0.02), M.band, x, base + ch * 0.5, cz + cd / 2 + 0.03));
            add(box(0.34, 0.1, 0.014), M.lab, 0, base + ch * 0.84, cz + cd / 2 + 0.014); add(box(0.2, 0.04, 0.014), M.acc, 0, base + ch * 0.1, cz + cd / 2 + 0.014);
            [-0.2, 0.2].forEach((fx, i) => { add(cyl(0.12, 0.12, 0.04, 20), M.frame, fx, base + ch + 0.06, cz - 0.15); const bl = add(box(0.2, 0.012, 0.03), M.band, fx, base + ch + 0.085, cz - 0.15); if (typeof CLM !== 'undefined' && CLM.spin) CLM.spin.push({ root: bl, sp: 6 + i, axis: 'y' }); });
            add(cyl(0.012, 0.012, 0.26, 6), M.steelL, 0.3, base + ch + 0.14, cz + cd / 2 - 0.1); add(geo('b2bc', () => new THREE.SphereGeometry(0.04, 10, 8)), M.ledr, 0.3, base + ch + 0.3, cz + cd / 2 - 0.1);
            if (!big) { const m1 = module(0, -0.72, 0.62, 0.56, 0.46); add(box(0.05, 0.04, 0.5), M.cop, m1.tx, m1.ty + 0.05, -0.45); }
            if (big) {
                const tz = -0.72; add(box(0.62, 0.02, 0.56), M.frame, 0, base + 0.01, tz);
                [-0.18, 0, 0.18].forEach(x => { add(cyl(0.035, 0.05, 0.24, 12), M.porc, x, base + 0.46 + 0.12, tz - 0.05); add(cyl(0.02, 0.02, 0.06, 8), M.cop, x, base + 0.46 + 0.27, tz - 0.05); });
                const mx = 0.0, top = base + ch + 0.04; add(cyl(0.02, 0.03, 0.62, 10), M.steelL, mx, top + 0.31, cz + 0.2);
                const orb = add(geo('b2o', () => new THREE.SphereGeometry(0.17, 22, 16)), M.core, mx, top + 0.78, cz + 0.2); if (typeof CLM !== 'undefined' && CLM.spin) CLM.spin.push({ root: orb, sp: 1.2, axis: 'y' });
                [0.26, 0.31].forEach((r, i) => { const rg = add(geo('b2r' + i, () => new THREE.TorusGeometry(r, 0.013, 8, 36)), M.ring, mx, top + 0.78, cz + 0.2, i ? Math.PI / 2 : 0.5, 0, i ? 0.6 : 0); if (typeof CLM !== 'undefined' && CLM.spin) CLM.spin.push({ root: rg, sp: i ? -0.9 : 1.3, axis: 'y' }); });
            } else add(box(0.46, 0.2, 0.3), M.frame, 0, base + 0.1, -0.2);
        }
    }
    function clBateriaAssemble(grp, level, cv) {
        level = Math.max(1, level | 0); clBateriaPreload();
        clBateriaBuild(grp, cv, level);   // a estrutura cresce a cada nível
    }
    function clCoreKit(THREE) {   /* núcleo da colônia por eras (Acampamento, Vila, Cidade, Metrópole, Capital Estelar, Império Orbital, Civilização Cósmica): cada era tem a sua peça central, feita em código, com texturas desenhadas em canvas e animações */
let LQ = false; const Q = n => LQ ? Math.max(1, Math.round(n * 0.4)) : n; const LIGHTS = [];
const VIV=['#d63a2f','#2f7fd1','#2eaa5c','#f2a31b','#8a49b8','#e85d9a','#1fb5b0','#e8742c'];
let seed=7;const rn=()=>(seed=(seed*16807)%2147483647)/2147483647,rr=(a,b)=>a+(b-a)*rn();
const FN=[];const anim=f=>FN.push(f);
const mk=(draw,rx,ry,sz)=>{const c=document.createElement('canvas');c.width=c.height=sz||128;draw(c.getContext('2d'),c.width);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx||1,ry||1);t.encoding=THREE.sRGBEncoding;t.anisotropy=4;return t};
const blot=(g,n,W,cols,rmin,rmax,al)=>{for(let i=0;i<n;i++){g.fillStyle=cols[Math.floor(rn()*cols.length)];g.globalAlpha=al||.8;g.beginPath();g.ellipse(rn()*W,rn()*W,rr(rmin,rmax),rr(rmin,rmax)*.8,rn()*3,0,6.283);g.fill()}g.globalAlpha=1};
const TX={
 dirt:mk((g,W)=>{g.fillStyle='#b78f5f';g.fillRect(0,0,W,W);blot(g,260,W,['#9c7448','#c9a574','#8a6a40','#d6b987'],1,4,.7);g.strokeStyle='rgba(60,40,20,.25)';for(let i=0;i<7;i++){g.beginPath();g.moveTo(rn()*W,rn()*W);g.lineTo(rn()*W,rn()*W);g.stroke()}},5,5),
 stone:mk((g,W)=>{g.fillStyle='#dcd5c6';g.fillRect(0,0,W,W);blot(g,200,W,['#c3bba9','#e9e3d4','#b3ab98'],1,5,.6);g.strokeStyle='rgba(60,50,40,.35)';g.lineWidth=1.5;for(let y=0;y<W;y+=32){g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke();for(let x=((y/32)%2)*24;x<W;x+=48){g.beginPath();g.moveTo(x,y);g.lineTo(x,y+32);g.stroke()}}},3,3),
 moss:mk((g,W)=>{g.fillStyle='#d4ccb8';g.fillRect(0,0,W,W);blot(g,160,W,['#bdb39d','#e6dfcc'],1,5,.6);blot(g,120,W,['#6a9a46','#8cbc56','#4f7d36'],2,9,.55);g.strokeStyle='rgba(60,50,40,.3)';for(let y=0;y<W;y+=32){g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke()}},3,3),
 bark:mk((g,W)=>{g.fillStyle='#6d4a2d';g.fillRect(0,0,W,W);for(let x=0;x<W;x+=4){g.strokeStyle=['#3f2a18','#8a6338','#573a22','#a07848'][Math.floor(rn()*4)];g.lineWidth=rr(1,3);g.beginPath();g.moveTo(x+rn()*3,0);for(let y=0;y<W;y+=16)g.lineTo(x+rr(-3,3),y);g.stroke()}for(let i=0;i<4;i++){g.fillStyle='#2e1d0f';g.beginPath();g.ellipse(rn()*W,rn()*W,rr(4,8),rr(7,12),0,0,6.283);g.fill()}},2,2),
 leaf:mk((g,W)=>{g.fillStyle='#143615';g.fillRect(0,0,W,W);const cols=[['#2a6a24','#3d8a30'],['#3d8a30','#58a83e'],['#58a83e','#7cc653'],['#6cb446','#9ad862'],['#4a9a38','#6dbd4a'],['#7fa83a','#b5d868']];
 const leaf=(x,y,a,s,c)=>{g.save();g.translate(x,y);g.rotate(a);const gr=g.createLinearGradient(-s,-s*.4,s*.6,s*.4);gr.addColorStop(0,c[0]);gr.addColorStop(1,c[1]);g.fillStyle=gr;g.beginPath();g.moveTo(-s,0);g.quadraticCurveTo(-s*.1,-s*.62,s,0);g.quadraticCurveTo(-s*.1,s*.62,-s,0);g.fill();g.strokeStyle='rgba(12,48,10,.65)';g.lineWidth=.9;g.stroke();g.strokeStyle='rgba(225,250,170,.6)';g.lineWidth=.9;g.beginPath();g.moveTo(-s*.9,0);g.lineTo(s*.88,0);g.stroke();g.strokeStyle='rgba(225,250,170,.3)';g.lineWidth=.6;for(let k=-3;k<=3;k++){if(!k)continue;const bx=k*s*.24;g.beginPath();g.moveTo(bx,0);g.lineTo(bx+s*.2,-s*.3);g.moveTo(bx,0);g.lineTo(bx+s*.2,s*.3);g.stroke()}g.restore()};
 for(let layer=0;layer<3;layer++)for(let i=0;i<130;i++){const x=rn()*W,y=rn()*W,a=rn()*6.283,s=rr(6,12)+layer*1.5,c=cols[Math.floor(rn()*cols.length)];leaf(x,y,a,s,c);if(x<14)leaf(x+W,y,a,s,c);if(y<14)leaf(x,y+W,a,s,c);if(x>W-14)leaf(x-W,y,a,s,c);if(y>W-14)leaf(x,y-W,a,s,c)}
 g.fillStyle='rgba(0,25,5,.18)';for(let i=0;i<40;i++){g.beginPath();g.ellipse(rn()*W,rn()*W,rr(4,12),rr(3,8),rn()*3,0,6.283);g.fill()}blot(g,40,W,['#eaffb0'],2,6,.22)},2,2,256),
 scales:mk((g,W)=>{g.fillStyle='#0b3f3b';g.fillRect(0,0,W,W);const R=16;for(let row=Math.ceil(W/(R*.55))+1;row>=-1;row--){const y=row*R*.55;for(let c=-1;c<W/(R*2)+2;c++){const x=c*R*2+(row%2)*R,tn=rn();const gr=g.createRadialGradient(x,y-R*.3,2,x,y,R*1.1);gr.addColorStop(0,tn<.2?'#7fe0c0':tn<.55?'#37b8a6':'#238f86');gr.addColorStop(.65,'#16766f');gr.addColorStop(1,'#0a4440');g.fillStyle=gr;g.beginPath();g.arc(x,y,R,0,Math.PI);g.fill();g.strokeStyle='rgba(0,28,26,.8)';g.lineWidth=1.4;g.stroke();g.strokeStyle='rgba(190,255,235,.4)';g.lineWidth=1;g.beginPath();g.arc(x,y-1,R*.78,.35,Math.PI-.35);g.stroke();if(rn()<.12){g.fillStyle='rgba(232,184,74,.6)';g.beginPath();g.arc(x,y,R*.45,.2,Math.PI-.2);g.fill()}}}for(let i=0;i<30;i++){g.fillStyle='rgba(200,230,190,.12)';g.fillRect(rn()*W,rn()*W,rr(2,10),rr(1,3))}},5,.6,256),
 hide:mk((g,W)=>{g.fillStyle='#e8d6ac';g.fillRect(0,0,W,W);for(let i=0;i<5;i++){g.fillStyle=['#d9bf8a','#c9ab73','#efe0b9','#c46a4a','#4a7ab8'][i%5];g.globalAlpha=.55;g.fillRect(rn()*W*.7,rn()*W*.7,rr(30,56),rr(24,44))}g.globalAlpha=1;g.strokeStyle='rgba(70,45,20,.5)';g.setLineDash([5,4]);g.lineWidth=1.5;for(let i=0;i<6;i++){g.strokeRect(rn()*W*.7+4,rn()*W*.7+4,rr(28,54),rr(22,42))}g.setLineDash([]);g.strokeStyle='rgba(120,90,50,.18)';for(let x=0;x<W;x+=4){g.beginPath();g.moveTo(x,0);g.lineTo(x,W);g.stroke()}},2,2),
 totem:mk((g,W)=>{[['#d63a2f','#f6e7c8'],['#2f7fd1','#f2c230'],['#2eaa5c','#f6e7c8']].forEach(([a,b],i)=>{const y=i*W/3;g.fillStyle=a;g.fillRect(0,y,W,W/3);g.fillStyle=b;[[W*.2,y+W*.12],[W*.42,y+W*.12]].forEach(([x,yy])=>{g.beginPath();g.arc(x,yy,W*.07,0,6.283);g.fill();g.fillStyle='#1b1b1b';g.beginPath();g.arc(x,yy,W*.03,0,6.283);g.fill();g.fillStyle=b});g.fillStyle='#f2a31b';g.beginPath();g.moveTo(W*.28,y+W*.17);g.lineTo(W*.36,y+W*.17);g.lineTo(W*.32,y+W*.27);g.fill();g.strokeStyle='#1b1b1b';g.lineWidth=3;g.beginPath();g.moveTo(W*.12,y+W*.06);g.lineTo(W*.3,y+W*.04);g.stroke();g.beginPath();g.moveTo(W*.34,y+W*.04);g.lineTo(W*.52,y+W*.06);g.stroke()});},2,1),
 glass:mk((g,W)=>{for(let y=0;y<W;y+=21)for(let x=0;x<W;x+=21){g.fillStyle=VIV[Math.floor(rn()*VIV.length)];g.fillRect(x,y,21,21)}g.fillStyle='rgba(30,20,10,.85)';for(let i=0;i<=W;i+=21){g.fillRect(i-1,0,2,W);g.fillRect(0,i-1,W,2)}},1,1),
 plasma:mk((g,W)=>{g.fillStyle='#1a0f4a';g.fillRect(0,0,W,W);for(let i=0;i<90;i++){const x=rn()*W,y=rn()*W,r=rr(8,26),gr=g.createRadialGradient(x,y,0,x,y,r);const c=['rgba(80,240,255,.55)','rgba(255,90,220,.45)','rgba(255,255,255,.5)','rgba(140,100,255,.5)'][Math.floor(rn()*4)];gr.addColorStop(0,c);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2)}},2,1),
 galaxy:mk((g,W)=>{g.fillStyle='rgba(0,0,0,0)';g.clearRect(0,0,W,W);const c=W/2;let gr=g.createRadialGradient(c,c,0,c,c,c);gr.addColorStop(0,'rgba(255,240,200,1)');gr.addColorStop(.18,'rgba(255,200,120,.65)');gr.addColorStop(.5,'rgba(120,120,255,.18)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,W,W);for(let i=0;i<1100;i++){const arm=i%3,r=Math.pow(rn(),.7)*c*.95,a=r*.065+arm*2.094+rr(-.28,.28);g.fillStyle=['rgba(180,210,255,','rgba(255,190,230,','rgba(255,255,255,'][Math.floor(rn()*3)]+(rr(.25,.9)).toFixed(2)+')';g.fillRect(c+Math.cos(a)*r,c+Math.sin(a)*r,rr(.6,2),rr(.6,2))}},1,1,256),
 floor6:mk((g,W)=>{const c=W/2;const gr=g.createRadialGradient(c,c,0,c,c,c);gr.addColorStop(0,'#323852');gr.addColorStop(.6,'#1d2138');gr.addColorStop(1,'#12152a');g.fillStyle=gr;g.fillRect(0,0,W,W);
  g.strokeStyle='rgba(170,180,225,.30)';g.lineWidth=2;for(let i=0;i<32;i++){const a=i/32*6.283;g.beginPath();g.moveTo(c+Math.cos(a)*c*.3,c+Math.sin(a)*c*.3);g.lineTo(c+Math.cos(a)*c*.98,c+Math.sin(a)*c*.98);g.stroke()}
  [.3,.46,.62,.78,.94].forEach((r,i)=>{g.strokeStyle=i%2?'rgba(170,180,225,.4)':'rgba(232,184,74,.85)';g.lineWidth=i%2?2:4;g.beginPath();g.arc(c,c,c*r,0,6.283);g.stroke()});
  for(let k=0;k<4;k++){const a=k*Math.PI/2+Math.PI/4;g.fillStyle='rgba(232,184,74,.9)';g.beginPath();g.arc(c+Math.cos(a)*c*.78,c+Math.sin(a)*c*.78,c*.035,0,6.283);g.fill()}
  for(let i=0;i<900;i++){g.fillStyle='rgba(255,255,255,'+rr(.02,.07).toFixed(2)+')';const a=rn()*6.283,r=rr(.3,1)*c;g.save();g.translate(c+Math.cos(a)*r,c+Math.sin(a)*r);g.rotate(a+1.57);g.fillRect(0,0,rr(6,22),1);g.restore()}
  for(let i=0;i<10;i++){g.fillStyle='rgba(255,255,255,.5)';g.fillRect(rn()*W,rn()*W,2,2)}},1,1,512),
 hex:mk((g,W)=>{g.fillStyle='#13202c';g.fillRect(0,0,W,W);g.strokeStyle='#3fe3ff';g.lineWidth=2;const s=22;for(let r=0;r<6;r++)for(let c=0;c<5;c++){const x=c*s*1.5+10,y=r*s*1.73+(c%2)*s*.86;g.beginPath();for(let k=0;k<6;k++){const a=k*Math.PI/3;g.lineTo(x+Math.cos(a)*s*.8,y+Math.sin(a)*s*.8)}g.closePath();g.stroke()}},4,4),
 consta:mk((g,W)=>{g.fillStyle='#2b2140';g.fillRect(0,0,W,W);g.strokeStyle='#e8b84a';g.lineWidth=1.5;const P=[];for(let i=0;i<9;i++)P.push([rn()*W,rn()*W]);g.beginPath();P.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.stroke();P.forEach(([x,y])=>{g.fillStyle='#ffe9a0';g.beginPath();g.arc(x,y,3,0,6.283);g.fill()})},3,3),
 band:mk((g,W)=>{const cols=['#d9a066','#c27a4a','#e8c590','#a8683a','#f0d3a2','#b9824f'];let y=0;while(y<W){const h=rr(6,18);g.fillStyle=cols[Math.floor(rn()*cols.length)];g.fillRect(0,y,W,h);y+=h}blot(g,30,W,['#fff1d6'],3,9,.25)},1,1),
 rocky:mk((g,W)=>{g.fillStyle='#8a7a6a';g.fillRect(0,0,W,W);blot(g,140,W,['#6e6052','#a39382','#5a4e42'],2,10,.7)},1,1),
 earth:mk((g,W)=>{g.fillStyle='#2c7fd4';g.fillRect(0,0,W,W);blot(g,22,W,['#4aa83c','#6bc24a','#8a7a4a'],6,18,.95);blot(g,18,W,['#ffffff'],5,16,.5)},1,1),
 blossom:mk((g,W)=>{g.fillStyle='#f4a9c8';g.fillRect(0,0,W,W);blot(g,220,W,['#ffd1e3','#ffffff','#ee86b3','#f8b8d2'],3,9,.85)},2,2),
 accr:mk((g,W)=>{g.clearRect(0,0,W,W);const c=W/2;for(let i=0;i<170;i++){const r=rr(.36,.98)*c,a0=rn()*6.283,len=rr(.2,1.1);g.strokeStyle=['rgba(255,180,90,','rgba(255,120,200,','rgba(140,160,255,','rgba(255,240,200,'][Math.floor(rn()*4)]+rr(.1,.4).toFixed(2)+')';g.lineWidth=rr(1,2.5);g.beginPath();g.arc(c,c,r,a0,a0+len);g.stroke()}},1,1,256),
 beam:mk((g,W)=>{const gr=g.createLinearGradient(0,W,0,0);gr.addColorStop(0,'rgba(255,255,255,.95)');gr.addColorStop(.35,'rgba(150,220,255,.6)');gr.addColorStop(1,'rgba(120,100,255,0)');g.fillStyle=gr;g.fillRect(0,0,W,W)},1,1,64),
 aurora:mk((g,W)=>{const gr=g.createLinearGradient(0,W,0,0);gr.addColorStop(0,'rgba(80,255,230,.0)');gr.addColorStop(.3,'rgba(80,255,230,.65)');gr.addColorStop(.7,'rgba(140,120,255,.5)');gr.addColorStop(1,'rgba(255,120,220,0)');g.fillStyle=gr;g.fillRect(0,0,W,W);for(let i=0;i<14;i++){g.fillStyle='rgba(255,255,255,'+rr(.05,.18).toFixed(2)+')';g.fillRect(rn()*W,0,rr(1,4),W)}},1,1,128),
 floor5:mk((g,W)=>{const c=W/2;const gr=g.createRadialGradient(c,c,0,c,c,c);gr.addColorStop(0,'#2a4a5e');gr.addColorStop(1,'#16293a');g.fillStyle=gr;g.fillRect(0,0,W,W);g.strokeStyle='rgba(120,240,255,.8)';[.35,.55,.75,.93].forEach((r,i)=>{g.lineWidth=i%2?2:4;g.beginPath();g.arc(c,c,c*r,0,6.283);g.stroke()});for(let k=0;k<48;k++){const a=k/48*6.283,r0=.58,r1=.72;if(k%2)continue;g.lineWidth=3;g.beginPath();g.moveTo(c+Math.cos(a)*c*r0,c+Math.sin(a)*c*r0);g.lineTo(c+Math.cos(a+.05)*c*r1,c+Math.sin(a+.05)*c*r1);g.lineTo(c+Math.cos(a-.03)*c*(r1+.05),c+Math.sin(a-.03)*c*(r1+.05));g.stroke()}for(let i=0;i<500;i++){g.fillStyle='rgba(255,255,255,'+rr(.02,.06).toFixed(2)+')';g.fillRect(rn()*W,rn()*W,rr(3,12),1)}},1,1,512),
  basalt:mk((g,W)=>{g.fillStyle='#2b2a3a';g.fillRect(0,0,W,W);blot(g,170,W,['#1f1e2c','#3a384c','#25243a','#46435a'],2,10,.7);g.strokeStyle='rgba(10,10,20,.7)';g.lineWidth=2;for(let i=0;i<10;i++){g.beginPath();g.moveTo(rn()*W,rn()*W);for(let k=0;k<4;k++)g.lineTo(rn()*W,rn()*W);g.stroke()}},2,2,128),
 basaltE:mk((g,W)=>{g.fillStyle='#000';g.fillRect(0,0,W,W);g.strokeStyle='#2de3ff';g.lineWidth=2;seed=91;for(let i=0;i<10;i++){g.beginPath();g.moveTo(rn()*W,rn()*W);for(let k=0;k<4;k++)g.lineTo(rn()*W,rn()*W);g.stroke()}},2,2,128),
 grass:mk((g,W)=>{g.fillStyle='#4c9a3a';g.fillRect(0,0,W,W);for(let i=0;i<500;i++){const x=rn()*W,y=rn()*W;g.strokeStyle=['#3a8a2c','#66b348','#82c95a','#2f7524'][Math.floor(rn()*4)];g.lineWidth=1;g.beginPath();g.moveTo(x,y);g.lineTo(x+rr(-2,2),y-rr(3,8));g.stroke()}for(let i=0;i<14;i++){g.fillStyle=['#ffe27a','#ffffff','#ff9ec8'][i%3];g.fillRect(rn()*W,rn()*W,2,2)}},3,3,128),
 fall:mk((g,W)=>{g.clearRect(0,0,W,W);for(let i=0;i<22;i++){g.fillStyle='rgba(220,245,255,'+rr(.25,.8).toFixed(2)+')';g.fillRect(rn()*W,0,rr(2,6),W)}for(let i=0;i<28;i++){g.fillStyle='rgba(255,255,255,.8)';g.fillRect(rn()*W,rn()*W,2,rr(4,12))}},1,2,64),
 rune:mk((g,W)=>{g.fillStyle='#143a44';g.fillRect(0,0,W,W);g.strokeStyle='#5ef2ff';g.lineWidth=4;for(let i=0;i<4;i++){g.beginPath();g.moveTo(10+i*30,18);g.lineTo(24+i*30,60);g.lineTo(8+i*30,104);g.stroke()}},6,1),
 water:mk((g,W)=>{g.fillStyle='#2ea8d8';g.fillRect(0,0,W,W);g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=2;for(let i=0;i<14;i++){g.beginPath();g.ellipse(rn()*W,rn()*W,rr(8,26),rr(3,8),0,0,6.283);g.stroke()}},3,3)
};
TX.glass.repeat.set(14,1);const MC={};const mat=(k,col,ex)=>MC[k]||(MC[k]=new THREE.MeshStandardMaterial(Object.assign({color:col,roughness:.85,metalness:.02},ex||{})));
const glow=(k,col,i,ex)=>mat('g'+k,col,Object.assign({emissive:new THREE.Color(col),emissiveIntensity:i||1.2,roughness:.3,toneMapped:false},ex||{}));
const A=(g,geo,m,x,y,z,rx,ry,rz)=>{const o=new THREE.Mesh(geo,m);o.position.set(x||0,y||0,z||0);if(rx||ry||rz){o.rotation.order='YXZ';o.rotation.set(rx||0,ry||0,rz||0)}o.castShadow=o.receiveShadow=!LQ;g.add(o);return o};
const Cy=(a,b,h,s)=>new THREE.CylinderGeometry(a,b,h,s||24),Bx=(w,h,d)=>new THREE.BoxGeometry(w,h,d),Sp=(r,a,b)=>new THREE.SphereGeometry(r,a||20,b||14),Co=(r,h,s)=>new THREE.ConeGeometry(r,h,s||16),To=(r,t,a,s)=>new THREE.TorusGeometry(r,t,10,s||48,a||Math.PI*2);
const lathe=(pts,seg)=>new THREE.LatheGeometry(pts.map(([x,y])=>new THREE.Vector2(x,y)),seg||18);
const noisy=(geo,amp)=>{const p=geo.attributes.position,v=new THREE.Vector3();for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);const k=1+(Math.sin(v.x*7.1+v.y*3.3)*Math.cos(v.z*6.3-v.y*2.1)+Math.sin(v.x*11+v.z*9))*amp;p.setXYZ(i,v.x*k,v.y*(1+(k-1)*.6),v.z*k)}geo.computeVertexNormals();return geo};
const Rock=(r)=>noisy(new THREE.IcosahedronGeometry(r,2),.14),Blob=(r)=>noisy(new THREE.IcosahedronGeometry(r,2),.2);
const Fl=(r,h)=>lathe([[0,0],[r*.55,.1*h],[r,.34*h],[r*.72,.64*h],[r*.28,.88*h],[0,h]],14);
const Shard=(r,sy)=>{const h=r*2*(sy||1.7),n=6,ring=(y,rad,jit)=>{const a=[];for(let i=0;i<n;i++){const tt=i/n*6.283+(rn()-.5)*.45,q=rad*(1+(rn()-.5)*jit);a.push([Math.cos(tt)*q,y,Math.sin(tt)*q])}return a};
 const b=ring(-h*.5,r*1.05,.4),m1=ring(h*.16,r*1.12,.35),m2=ring(h*.36,r*.8,.3),tip=[(rn()-.5)*r*.5,h*.5,(rn()-.5)*r*.5],P=[],U=[];
 const tri=(a,bb,c,va,vb,vc)=>{P.push(...a,...bb,...c);U.push(0,va,.5,vb,1,vc)};const band=(r0,r1,v0,v1)=>{for(let i=0;i<n;i++){const j=(i+1)%n;tri(r0[i],r0[j],r1[i],v0,v0,v1);tri(r0[j],r1[j],r1[i],v0,v1,v1)}};
 band(b,m1,0,.5);band(m1,m2,.5,.82);for(let i=0;i<n;i++){const j=(i+1)%n;tri(m2[i],m2[j],tip,.82,.82,1)}const c=[0,-h*.5,0];for(let i=0;i<n;i++){const j=(i+1)%n;tri(b[j],b[i],c,0,0,0)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));g.computeVertexNormals();return g};
const cTex=(c0,c1,c2)=>mk((g,W)=>{const gr=g.createLinearGradient(0,W,0,0);gr.addColorStop(0,c0);gr.addColorStop(.55,c1);gr.addColorStop(1,c2);g.fillStyle=gr;g.fillRect(0,0,W,W);for(let i=0;i<9;i++){g.strokeStyle='rgba(255,255,255,'+(.18+rn()*.3).toFixed(2)+')';g.lineWidth=1+rn()*3;g.beginPath();g.moveTo(rn()*W,W);g.lineTo(rn()*W,rn()*W*.5);g.stroke()}for(let i=0;i<22;i++){g.fillStyle='rgba(255,255,255,'+(.5+rn()*.5).toFixed(2)+')';g.fillRect(rn()*W,rn()*W,1+rn()*3,1+rn()*3)}});
const CT={cy:cTex('#0a5f78','#2fd0ee','#c8fbff'),gl:cTex('#7a4a08','#f0b73a','#fff3c0')};
const M=()=>({stone:mat('st','#ffffff',{map:TX.stone}),moss:mat('ms','#ffffff',{map:TX.moss}),pave:mat('pv','#d8d0c0',{map:TX.stone}),dirt:mat('dt','#ffffff',{map:TX.dirt}),bark:mat('bk','#ffffff',{map:TX.bark}),leaf:mat('lf','#ffffff',{map:TX.leaf,bumpMap:TX.leaf,bumpScale:1.4,roughness:.8}),hide:mat('hd','#ffffff',{map:TX.hide,side:THREE.DoubleSide}),plank:mat('pk','#a26a3a',{map:TX.stone}),wood:mat('wd','#8a5a32'),gold:mat('gd','#e8b84a',{metalness:.5,roughness:.3}),teal:mat('tl','#1fa89f',{roughness:.5,metalness:.15}),rock:mat('rk','#ffffff',{map:TX.moss}),iron:mat('ir','#3a3a42',{metalness:.5,roughness:.4}),cream:mat('cr','#f1e8d3',{map:TX.stone}),white:mat('wh','#f6f3ec',{metalness:.25,roughness:.35}),
 cy:glow('cy','#ffffff',1.0,{map:CT.cy,emissiveMap:CT.cy,flatShading:true,emissive:new THREE.Color('#aef6ff'),transparent:true,opacity:.93}),gl:glow('gl','#ffffff',1.0,{map:CT.gl,emissiveMap:CT.gl,flatShading:true,emissive:new THREE.Color('#ffe2a0'),transparent:true,opacity:.95}),
 fire:glow('fi','#ff7a1a',1.4,{transparent:true,opacity:.92}),fire2:glow('f2','#ffd34a',1.6,{transparent:true,opacity:.95}),warm:glow('wm','#ffd27a',1.3),water:mat('wt','#ffffff',{map:TX.water,emissive:new THREE.Color('#1d6f96'),emissiveIntensity:.35,roughness:.25,transparent:true,opacity:.9}),smoke:mat('sm','#cfcfd6',{transparent:true,opacity:.35,roughness:1}),fish:mat('fs','#cfd8e4',{metalness:.5,roughness:.3}),glass:mat('gs','#ffffff',{map:TX.glass,emissive:new THREE.Color('#ffffff'),emissiveMap:TX.glass,emissiveIntensity:.5,roughness:.4}),plasma:glow('pl','#ffffff',1.0,{map:TX.plasma,emissiveMap:TX.plasma,emissive:new THREE.Color('#ffffff')}),halo:glow('ha','#ffd27a',.8,{transparent:true,opacity:.2,depthWrite:false}),hex:mat('hx','#ffffff',{map:TX.hex,emissive:new THREE.Color('#3fe3ff'),emissiveMap:TX.hex,emissiveIntensity:.45}),consta:mat('cs','#ffffff',{map:TX.consta,roughness:.6}),totem:mat('tt','#ffffff',{map:TX.totem}),dark:mat('dk','#2b2640',{roughness:.5,metalness:.2})});
const softTex=(c)=>mk((g,W)=>{const gr=g.createRadialGradient(W/2,W/2,0,W/2,W/2,W/2);gr.addColorStop(0,c);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,W,W)},1,1,128);
const tube=(pts,r,seg)=>new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(...p))),seg||20,r,8);
const addv=(map,o)=>new THREE.MeshBasicMaterial(Object.assign({map,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false,side:THREE.DoubleSide},o||{}));
const lamp=(g,m,x,z)=>{A(g,Cy(.025,.03,.5,8),m.iron,x,.3,z);const b=A(g,Sp(.06,12,8),m.warm,x,.6,z);A(g,Co(.075,.07,6),m.iron,x,.7,z);anim(t=>{b.scale.setScalar(1+Math.sin(t*3+x*5)*.06)})};
const plaza=(g,mt,r)=>A(g,Cy(r||1.45,(r||1.45)+.05,.07,56),mt,0,.035,0);
const light=(g,col,i,y)=>{const l=new THREE.PointLight(col,i,4.5);l.position.set(0,y||.8,0);g.add(l);LIGHTS.push({l,b:i});return l};
const crystal=(g,m,x,y,z,r,sy,ry,rz,fl)=>{const o=A(g,Shard(r,sy),m,x,y,z,0,ry||0,rz||0),bx=y,ph=rn()*6.283,sp=.12+rn()*.3;anim((t,dt)=>{o.rotation.y+=dt*sp;o.position.y=bx+Math.sin(t*1.3+ph)*(fl?.07:.012);o.scale.setScalar(1+Math.sin(t*2+ph)*.025)});return o};
const flame=(g,x,y,z,r,h,m1,m2)=>{const a=A(g,Fl(r,h),m1,x,y,z),b=A(g,Fl(r*.6,h*.7),m2,x,y,z),c=A(g,Fl(r*.35,h*.5),m2,x+r*.4,y,z+r*.2);anim((t)=>{[[a,0],[b,1.3],[c,2.4]].forEach(([o,p])=>{const k=1+Math.sin(t*11+p)*.12+Math.sin(t*17+p*2)*.08;o.scale.set(1/(k*.5+.5),k,1/(k*.5+.5));o.rotation.z=Math.sin(t*7+p)*.08})})};
const sparks=(g,x,y,z,n,col,h)=>{for(let i=0,NQ=Q(n);i<NQ;i++){const o=A(g,Sp(.014,6,5),glow('sp'+col,col,2),x,y,z),ph=rn(),sp=.25+rn()*.35,ox=rr(-.12,.12),oz=rr(-.12,.12);anim(t=>{const u=(t*sp+ph)%1;o.position.set(x+ox+Math.sin(t*3+ph*9)*.05*u,y+u*h,z+oz);o.scale.setScalar(Math.max(.05,1-u))})}};
const puffs=(g,x,y,z,n,h)=>{for(let i=0,NQ=Q(n);i<NQ;i++){const o=A(g,Sp(.12,10,8),M().smoke,x,y,z),ph=i/n;o.castShadow=false;anim(t=>{const u=(t*.18+ph)%1;o.position.set(x+Math.sin(t+ph*6)*.08*u,y+u*h,z);o.scale.setScalar(.5+u*1.6);o.material.opacity=.38*(1-u)})}};
const orbit=(o,cx,cy,cz,r,sp,tilt,ph)=>anim(t=>{const a=t*sp+ph;o.position.set(cx+Math.cos(a)*r,cy+Math.sin(a)*r*Math.sin(tilt),cz+Math.sin(a)*r*Math.cos(tilt))});
function tree(g,m,x,z,s){const T=A(g,lathe([[.30*s,0],[.2*s,.15*s],[.13*s,.7*s],[.1*s,1.3*s],[.075*s,1.7*s],[0,1.8*s]],14),m.bark,x,.07,z);noisy(T.geometry,.07);return T}
/* 1 Acampamento: fogueira com panela, geodo-semente, tenda de couro, totem entalhado, varal de peixes e fumaça */
function e1(){const g=new THREE.Group(),m=M();plaza(g,m.dirt);
 for(let i=0;i<13;i++){const a=i/13*6.283;const o=A(g,Rock(.1),m.rock,Math.cos(a)*.46,.1,Math.sin(a)*.46);o.scale.set(1,.75,1.1);o.rotation.y=a}
 [[0,0],[1,.6],[2,1.2]].forEach(([k])=>{const a=k*2.094+.4,p=new THREE.Group();p.position.set(Math.cos(a)*.3,.07,Math.sin(a)*.3);p.rotation.y=-a;g.add(p);A(p,Cy(.03,.035,.95,6),m.bark,0,.46,0,0,0,.42)});
 A(g,Cy(.012,.012,.28,6),m.iron,0,.62,0);const pot=A(g,lathe([[0,0],[.1,.02],[.16,.1],[.17,.2],[.14,.24],[.15,.25],[.11,.245],[0,.2]],16),m.iron,0,.38,0);anim(t=>{pot.rotation.z=Math.sin(t*1.5)*.03});
 for(let i=0;i<3;i++)A(g,Cy(.05,.05,.38,7),m.bark,Math.cos(i*2.1)*.12,.09,Math.sin(i*2.1)*.12,Math.PI/2,i*2.1,0);
 flame(g,0,.08,0,.2,.52,m.fire,m.fire2);sparks(g,0,.3,0,9,'#ffb347',.9);puffs(g,0,.62,0,4,.85);light(g,0xff9b2e,1.3,.5);
 const geo=A(g,Rock(.3),m.rock,.95,.2,.62);geo.scale.set(1,.7,.9);const geo2=A(g,Rock(.24),m.rock,1.08,.18,.5);geo2.scale.set(.8,.8,.7);
 [[.0,.02,0,.1,1.7,0,0],[.07,.0,.05,.075,1.5,.25,.2],[-.06,.0,-.03,.065,1.4,-.3,-.2]].forEach(([x,y,z,r,sy,ry,rz],i)=>crystal(g,m.cy,.98+x,.37+y,.6+z,r,sy,ry,rz));
 const tent=A(g,Co(.56,.95,20),m.hide,-.85,.55,-.95);anim(t=>{tent.scale.x=1+Math.sin(t*1.3)*.012});A(g,Bx(.2,.4,.02),m.dark,-.85,.28,-.43,-.12,0,0);A(g,Cy(.01,.01,.35,5),m.wood,-.85,1.05,-.95);
 for(let i=0;i<3;i++){const a=i*2.1+.7;A(g,Cy(.012,.012,.2,5),m.wood,-.85+Math.cos(a)*.55,.1,-.95+Math.sin(a)*.55,.5,-a,0)}
 A(g,Cy(.012,.012,.12,5),m.iron,-.85,.78,-.95);const lan=A(g,Sp(.05,10,8),m.warm,-.55,.5,-.62);anim(t=>{lan.scale.setScalar(1+Math.sin(t*4)*.08)});
 const T=new THREE.Group();T.position.set(-1.05,.07,.55);g.add(T);A(T,Cy(.13,.15,.36,16),m.totem,0,.18,0,0,.6,0);A(T,Cy(.12,.12,.36,16),m.totem,0,.54,0,0,.6,0);A(T,Cy(.11,.11,.36,16),m.totem,0,.9,0,0,.6,0);A(T,Bx(.62,.07,.05),mat('tw','#d63a2f'),0,.66,0,0,.6,0);A(T,Co(.11,.2,4),m.gold,0,1.16,0,0,.8,0);
 A(g,Cy(.012,.012,.62,6),m.wood,.35,.38,-1.0);A(g,Cy(.012,.012,.62,6),m.wood,.95,.38,-1.0);A(g,Cy(.012,.012,.66,6),m.wood,.65,.7,-1.0,0,0,Math.PI/2);
 for(let i=0;i<4;i++){const f=A(g,Sp(.05,10,8),m.fish,.45+i*.14,.58,-1.0);f.scale.set(.5,1.6,.35);const ph=rn()*6;anim(t=>{f.rotation.z=Math.sin(t*2+ph)*.12})}
 for(let k=0;k<4;k++){const a=Math.PI/4+k*Math.PI/2+.25,o=A(g,Cy(.08,.09,.45,12),m.bark,Math.cos(a)*.98,.13,Math.sin(a)*.98,Math.PI/2,-a,0);A(g,Bx(.24,.03,.16),mat('fur'+k,['#8a5a3a','#c8a878','#6b4a38','#b08a5a'][k]),Math.cos(a)*.98,.23,Math.sin(a)*.98,0,-a,0)}
 for(let i=0;i<3;i++)A(g,Cy(.07,.08,.14,10),mat('sk'+i,'#b89a68'),.9+i*.09,.14,-.2+i*.12);return g}
/* 2 Vila: árvore-santuário em flor, com casa na árvore, raízes, lagoa, lanternas e pétalas caindo */
function e2(){const g=new THREE.Group(),m=M();plaza(g,m.moss);A(g,To(1.05,.05,undefined,60).rotateX(Math.PI/2),m.stone,0,.1,0);
 const bl=mat('blm','#ffffff',{map:TX.blossom,roughness:.8,emissive:new THREE.Color('#ff9fc4'),emissiveIntensity:.12});
 for(let i=0;i<7;i++){const a=i/7*6.283+.3,R=A(g,tube([[Math.cos(a)*.1,.34,Math.sin(a)*.1],[Math.cos(a)*.3,.16,Math.sin(a)*.3],[Math.cos(a)*.62,.075,Math.sin(a)*.62]],.05,16),m.bark,0,0,0);noisy(R.geometry,.05)}
 tree(g,m,0,0,1);
 const C=[],LV=['#ffffff','#eaffd8','#d8f6b8','#c9efa4'].map((c,i)=>mat('lfv'+i,c,{map:TX.leaf,bumpMap:TX.leaf,bumpScale:1.4,roughness:.8})),BV=[0,1,2,3,4].map(k=>noisy(new THREE.IcosahedronGeometry(1,2),.16+k*.035));
 for(let i=0;i<58;i++){const v=rn()*2-1,w=rn()*6.283,rad=Math.cbrt(rn()),sq=Math.sqrt(1-v*v),x=Math.cos(w)*sq*.84*rad,y=1.95+v*.54*rad,z=Math.sin(w)*sq*.84*rad,r=rr(.16,.27)*(1.12-rad*.3),isB=rad>.55&&rn()<.26;const o=A(g,BV[i%5],isB?bl:LV[i%4],x,y,z);o.scale.setScalar(r);o.rotation.set(rn()*6,rn()*6,rn()*6);C.push([o,y,rn()*6])}
 anim(t=>C.forEach(([o,y,p])=>{o.position.y=y+Math.sin(t*.9+p)*.025}));
 for(let i=0;i<5;i++){const a=i/5*6.283+.7,e=[Math.cos(a)*.78,1.5,Math.sin(a)*.78];A(g,tube([[0,1.22,0],[Math.cos(a)*.35,1.42,Math.sin(a)*.35],e],.03,14),m.bark,0,0,0);A(g,Cy(.003,.003,.26,4),m.iron,e[0],e[1]-.13,e[2]);const L=A(g,Sp(.05,12,8),i%2?m.warm:m.gl,e[0],e[1]-.3,e[2]);const ph=rn()*6;anim(t=>{L.scale.setScalar(1+Math.sin(t*2.5+ph)*.1);L.position.x=e[0]+Math.sin(t*1.1+ph)*.015})}
 const th=new THREE.Group();th.position.set(.02,1.0,.02);g.add(th);A(th,Cy(.36,.4,.05,20),m.plank,0,0,0);for(let i=0;i<12;i++){const a=i/12*6.283;A(th,Cy(.01,.01,.14,5),m.wood,Math.cos(a)*.36,.07,Math.sin(a)*.36)}A(th,To(.36,.01,undefined,24).rotateX(Math.PI/2),m.wood,0,.14,0);A(th,Bx(.26,.2,.24),m.plank,.1,.15,-.04,0,.3,0);A(th,Co(.22,.18,4),m.teal,.1,.34,-.04,0,Math.PI/4+.3,0);A(th,Bx(.07,.09,.01),m.warm,.1,.16,.09,0,.3,0);
 for(let i=0;i<9;i++){A(g,Bx(.1,.014,.02),m.wood,.18+i*.005,.1+i*.105,.26-i*.01,0,.5,0)}A(g,Cy(.012,.012,.95,5),m.wood,.1,.5,.31,0,0,.02);A(g,Cy(.012,.012,.95,5),m.wood,.26,.5,.27,0,0,.02);
 const pond=A(g,Cy(.36,.36,.03,32),m.water,.88,.085,.52);A(g,To(.38,.04,undefined,32).rotateX(Math.PI/2),m.rock,.88,.09,.52);anim(t=>{TX.water.offset.set(t*.02,t*.015)});
 for(let i=0;i<5;i++){const lx=.88+Math.cos(i*1.3)*.18,lz=.52+Math.sin(i*1.3)*.15;A(g,Cy(.06,.06,.01,12),mat('lily','#4aa83c'),lx,.105,lz);if(i%2)A(g,Sp(.03,8,6),mat('lot','#ff9ec8',{emissive:new THREE.Color('#ff5fa0'),emissiveIntensity:.3}),lx,.13,lz)}
 for(let i=0;i<4;i++){const a=i*.9+.4;const o=A(g,Rock(.07),m.rock,.55+Math.cos(a)*.08,.1,.28+i*.07);o.scale.y=.6}
 for(let i=0;i<8;i++){const a=rn()*6.283,r=rr(.35,.8);A(g,Cy(.012,.016,.07,5),mat('ms','#e8dcc0'),Math.cos(a)*r,.1,Math.sin(a)*r);const h=A(g,Sp(.045,10,6,0,6.283,0,1.6),glow('mh'+(i%2),['#7ad6ff','#c89cff'][i%2],1.3),Math.cos(a)*r,.145,Math.sin(a)*r);const ph=rn()*6;anim(t=>{h.scale.setScalar(1+Math.sin(t*2+ph)*.1)})}
 for(let i=0,NQ=Q(34);i<NQ;i++){const f=A(g,new THREE.PlaneGeometry(.045,.03),new THREE.MeshBasicMaterial({color:['#ffd1e3','#ffffff','#f7a6c9'][i%3],side:THREE.DoubleSide}),0,2,0),R=rr(.1,1.15),ph=rn(),sp=rr(.08,.16),a0=rn()*6.283;f.castShadow=false;anim(t=>{const u=(t*sp+ph)%1;f.position.set(Math.cos(a0+u*2)*R*(.5+u*.5)+Math.sin(t*2+ph*9)*.08,2.2-u*2.1,Math.sin(a0+u*2)*R*(.5+u*.5));f.rotation.set(t*2+ph,t*1.5,0);f.visible=true})}
 for(let i=0;i<6;i++){const a=i/6*6.283+.6;A(g,Bx(.46,.07,.14),m.plank,Math.cos(a)*1.14,.2,Math.sin(a)*1.14,0,-a+Math.PI/2,0);A(g,Bx(.46,.14,.03),m.plank,Math.cos(a)*1.22,.32,Math.sin(a)*1.22,0,-a+Math.PI/2,0);A(g,Cy(.02,.02,.2,6),m.wood,Math.cos(a)*1.07,.1,Math.sin(a)*1.07)}
 for(let i=0;i<4;i++){const a=i*Math.PI/2+Math.PI/4;lamp(g,m,Math.cos(a)*1.38,Math.sin(a)*1.38)}
 for(let i=0,NQ=Q(16);i<NQ;i++){const f=A(g,Sp(.016,6,5),glow('ff','#d9ff7a',2.4),0,1,0),ph=rn()*6,R=rr(.5,1.3),sp=rr(.2,.5),hh=rr(.3,1.8);anim(t=>{const a=t*sp+ph;f.position.set(Math.cos(a)*R,hh+Math.sin(t*1.7+ph)*.15,Math.sin(a)*R);f.scale.setScalar(.6+.6*Math.abs(Math.sin(t*3+ph)))})}
 light(g,0xffd2e8,1.1,1.5);return g}
/* 3 Cidade: fonte em dois andares com ondulação e chama eterna dourada */
function e3(){const g=new THREE.Group(),m=M();plaza(g,mat('pvb','#ffffff',{map:TX.stone}));A(g,To(.98,.05,undefined,60).rotateX(Math.PI/2),m.cream,0,.1,0);
 A(g,Cy(.82,.88,.22,44),m.cream,0,.18,0);const w1=A(g,Cy(.76,.76,.04,44),m.water,0,.3,0);A(g,Cy(.34,.42,.24,30),m.cream,0,.4,0);const w2=A(g,Cy(.3,.3,.03,30),m.water,0,.52,0);
 anim(t=>{TX.water.offset.set(t*.03,t*.02)});
 const P=A(g,lathe([[.14,0],[.11,.08],[.07,.2],[.065,.9],[.1,.98],[.16,1.04],[.24,1.12],[.2,1.16],[.06,1.16]],18),m.cream,0,.54,0);
 const gold=[.62,.92].forEach(y=>A(g,Cy(.12,.12,.04,18),m.gold,0,y,0));
 A(g,lathe([[0,0],[.18,.02],[.26,.1],[.24,.14],[.0,.1]],20),m.gold,0,1.66,0);flame(g,0,1.72,0,.12,.34,glow('ef','#ff8c1a',1.5,{transparent:true,opacity:.9}),glow('ef2','#ffe08a',1.8,{transparent:true,opacity:.95}));sparks(g,0,1.9,0,6,'#ffd27a',.5);
 for(let i=0;i<12;i++){const a=i/12*6.283,d=A(g,Sp(.02,6,5),m.water,Math.cos(a)*.1,.9,Math.sin(a)*.1),ph=i/12;anim(t=>{const u=(t*.7+ph)%1,r=.1+u*.62;d.position.set(Math.cos(a)*r,.9+.55*u-1.6*u*u*.5,Math.sin(a)*r);d.scale.setScalar(.8)})}
 for(let i=0;i<8;i++){const a=i/8*6.283;A(g,Bx(.3,.07,.12),m.plank,Math.cos(a)*1.05,.15,Math.sin(a)*1.05,0,-a,0)}
 for(let i=0;i<4;i++){const a=Math.PI/4+i*Math.PI/2,x=Math.cos(a)*1.25,z=Math.sin(a)*1.25;lamp(g,m,x,z);A(g,Cy(.16,.13,.16,12),m.stone,Math.cos(a)*1.0*1.15+Math.cos(a+.5)*.2,.15,Math.sin(a)*1.15+Math.sin(a+.5)*.2);for(let k=0;k<6;k++)A(g,Sp(.05,8,6),mat('fb'+k,VIV[(k+i*2)%8]),Math.cos(a)*1.15+Math.cos(a+.5)*.2+rr(-.07,.07),.27+rr(0,.05),Math.sin(a)*1.15+Math.sin(a+.5)*.2+rr(-.07,.07))}
 light(g,0xff9b3a,1.2,1.9);return g}
/* 4 Metrópole: rotunda com cúpula de azulejos, faixa de vitrais e orbe de luz */
function e4(){const g=new THREE.Group(),m=M();plaza(g,m.pave);A(g,Cy(1.2,1.28,.14,44),m.stone,0,.14,0);A(g,Cy(1.05,1.12,.1,44),m.cream,0,.26,0);
 for(let i=0;i<8;i++){const a=i/8*6.283,c=A(g,lathe([[.07,0],[.06,.05],[.055,.8],[.07,.85]],12),m.cream,Math.cos(a)*.85,.3,Math.sin(a)*.85);const r=A(g,Cy(.012,.012,.78,6),mat('fl','#cfc6b0'),Math.cos(a)*.85+Math.cos(a)*.05,.7,Math.sin(a)*.85+Math.sin(a)*.05)}
 A(g,To(.85,.04,undefined,60).rotateX(Math.PI/2),m.cream,0,1.2,0);A(g,Cy(.92,.92,.08,44),m.cream,0,1.22,0);
 A(g,Cy(.78,.82,.3,40,1,true),m.glass,0,1.4,0);const dome=A(g,new THREE.SphereGeometry(.85,40,18,0,Math.PI*2,0,Math.PI/2),mat('tile','#ffffff',{map:TX.scales,bumpMap:TX.scales,bumpScale:2,roughness:.4,metalness:.35}),0,1.55,0);
 for(let k=0;k<4;k++)A(g,new THREE.TorusGeometry(.865,.018,6,32,Math.PI),m.gold,0,1.55,0,0,k*Math.PI/4,0);
 A(g,Cy(.1,.12,.2,14),m.gold,0,2.5,0);const orb=A(g,Sp(.16,28,20),m.plasma,0,2.72,0);const hal=A(g,Sp(.28,20,14),m.halo,0,2.72,0);anim(t=>{TX.plasma.offset.x=t*.05;orb.rotation.y=t*.6;hal.scale.setScalar(1+Math.sin(t*2)*.1)});
 for(let i=0;i<3;i++){const r=A(g,To(.24+i*.04,.008,undefined,40),m.gold,0,2.72,0,i*1.0,0,i*.6);anim((t,dt)=>{r.rotation.y+=dt*(.8+i*.3)})}
 for(let i=0;i<10;i++){const a=i/10*6.283;const h=A(g,Blob(.14),m.leaf,Math.cos(a)*1.62*.8,.18,Math.sin(a)*1.62*.8);h.scale.set(1,.8,1)}
 for(let i=0;i<14;i++){const a=i/14*6.283+.2,r=1.2;A(g,Sp(.04,8,6),mat('fb4'+i%5,VIV[i%8]),Math.cos(a)*1.3,.1+.03,Math.sin(a)*1.3)}
 for(let i=0;i<6;i++)A(g,Bx(1.0-i*.02,.04,.2),m.cream,0,.11+i*0,1.28+i*.07);light(g,0xffd27a,1.1,2.5);return g}
/* 5 Capital Estelar: coração de cristal com núcleo interno, pilares com feixes de energia, auroras e rochas flutuantes */
function e5(){const g=new THREE.Group(),m=M();A(g,Cy(1.45,1.5,.09,64),mat('f5','#ffffff',{map:TX.floor5,metalness:.4,roughness:.35,emissive:new THREE.Color('#2de3ff'),emissiveMap:TX.floor5,emissiveIntensity:.3}),0,.045,0);A(g,To(1.46,.025,undefined,80).rotateX(Math.PI/2),m.gold,0,.09,0);
 A(g,Cy(1.0,1.08,.12,48),m.cream,0,.15,0);A(g,Cy(.8,.86,.1,48),m.gold,0,.24,0);const rune=A(g,Cy(.66,.66,.05,48),mat('rn5','#ffffff',{map:TX.rune,emissive:new THREE.Color('#2de3ff'),emissiveMap:TX.rune,emissiveIntensity:.6}),0,.3,0);anim(t=>{rune.material.emissiveIntensity=.45+.25*Math.sin(t*2);rune.rotation.y=t*.12});
 const big=glow('cyBig','#ffffff',.9,{map:CT.cy,emissiveMap:CT.cy,flatShading:true,emissive:new THREE.Color('#aef6ff'),transparent:true,opacity:.72}),core=glow('cyCore','#bff8ff',2.2,{transparent:true,opacity:.95});
 const main=crystal(g,big,0,1.12,0,.34,3.7,0,0);const cr=A(g,Shard(.2,3.0),core,0,1.12,0);anim((t,dt)=>{cr.rotation.y-=dt*.5;cr.scale.setScalar(1+Math.sin(t*3)*.05)});
 [[.42,.78,.05,.17,2.4,0,-.32],[-.4,.72,-.1,.15,2.2,0,.38],[.1,.7,.45,.14,2.1,0,.05],[-.14,.68,-.42,.14,2.1,0,-.05],[.3,.62,-.34,.11,1.8,0,.25],[-.32,.6,.32,.11,1.8,0,-.25]].forEach(([x,y,z,r,sy,ry,rz],i)=>crystal(g,i%3===2?m.gl:big,x,y,z,r,sy,ry,rz));
 for(let i=0;i<10;i++){const a=i/10*6.283+.2,r=rr(1.18,1.34);crystal(g,i%4===3?m.gl:m.cy,Math.cos(a)*r,.16,Math.sin(a)*r,rr(.05,.09),rr(1.6,2.4),rn()*6,rr(-.4,.4))}
 const tops=[];for(let i=0;i<4;i++){const a=i*Math.PI/2+Math.PI/4,x=Math.cos(a)*1.0,z=Math.sin(a)*1.0;A(g,lathe([[.12,0],[.1,.1],[.07,.4],[.06,.9],[.09,1.0],[0,1.05]],14),m.cream,x,.3,z);[.45,.75].forEach(y=>A(g,Cy(.08,.08,.04,14),m.gold,x,y,z));const c=crystal(g,m.cy,x,1.5,z,.09,2.0,0,0,true);tops.push([x,1.5,z])}
 const beams=tops.map(()=>{const geo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]);const l=new THREE.Line(geo,new THREE.LineBasicMaterial({color:'#8ff6ff',transparent:true,opacity:.7,blending:THREE.AdditiveBlending,toneMapped:false}));g.add(l);return l});
 anim(t=>{beams.forEach((l,i)=>{const [x,y,z]=tops[i],p=l.geometry.attributes.position;p.setXYZ(0,x,y,z);p.setXYZ(1,0,1.55+Math.sin(t*1.3)*.07,0);p.needsUpdate=true;l.material.opacity=.35+.4*Math.abs(Math.sin(t*2+i))})});
 for(let i=0;i<3;i++){const plane=A(g,new THREE.PlaneGeometry(.55,1.9,1,14),addv(TX.aurora,{opacity:.55}),0,1.55,0);plane.castShadow=false;const geo=plane.geometry,base=geo.attributes.position.array.slice();const ph=i*2.1;anim(t=>{plane.rotation.y=t*.25+ph;const p=geo.attributes.position;for(let k=0;k<p.count;k++){const y=base[k*3+1];p.setZ(k,Math.sin(y*3+t*1.6+ph)*.16);p.setX(k,base[k*3]+Math.sin(y*2+t+ph)*.05)}p.needsUpdate=true;plane.position.set(Math.cos(ph)*.45,1.55,Math.sin(ph)*.45)})}
 const sh=A(g,Cy(.28,1.0,3.0,32,1,true),addv(TX.beam,{opacity:.12,side:THREE.DoubleSide}),0,1.7,0);sh.castShadow=false;anim(t=>{sh.material.opacity=.1+.05*Math.sin(t*1.5)});
 for(let i=0;i<6;i++){const s=new THREE.Group();g.add(s);const r=A(s,Rock(.15),m.rock,0,0,0);r.scale.set(1.2,.7,1);for(let k=0;k<3;k++){const q=A(s,Shard(.035,1.8),m.cy,Math.cos(k*2.1)*.1,.09,Math.sin(k*2.1)*.1);q.rotation.z=(k-1)*.4}const R=rr(1.05,1.3),ph=rn()*6.283,sp=rr(.12,.22),hh=rr(.7,1.8);anim((t,dt)=>{const a=t*sp+ph;s.position.set(Math.cos(a)*R,hh+Math.sin(t*.9+ph)*.07,Math.sin(a)*R);s.rotation.y+=dt*.3})}
 for(let i=0;i<12;i++){const o=A(g,Shard(.04+rn()*.03,1.5),i%3?m.cy:m.gl,0,1.4,0),R=rr(.55,.9),sp=rr(.3,.7)*(i%2?1:-1),ph=rn()*6.283,hh=rr(1.0,2.2);anim((t,dt)=>{const a=t*sp+ph;o.position.set(Math.cos(a)*R,hh+Math.sin(t*1.3+ph)*.08,Math.sin(a)*R);o.rotation.y+=dt;o.rotation.x+=dt*.6})}
 light(g,0x4af0ff,1.8,1.2);return g}
/* 6 Império Orbital: núcleo de plasma, giroscópio de ouro e arcos de energia entre pilares */
function e6(){const g=new THREE.Group(),m=M();A(g,Cy(1.45,1.5,.09,64),mat('f6','#ffffff',{map:TX.floor6,metalness:.55,roughness:.32}),0,.045,0);A(g,To(1.46,.025,undefined,80).rotateX(Math.PI/2),m.gold,0,.09,0);
 A(g,Cy(.62,.66,.1,48),m.dark,0,.14,0);A(g,Cy(.5,.55,.08,48),m.gold,0,.2,0);A(g,Cy(.4,.42,.04,48),mat('rn6','#ffffff',{map:TX.rune,emissive:new THREE.Color('#9a8bff'),emissiveMap:TX.rune,emissiveIntensity:.7}),0,.25,0);
 const cond=new THREE.MeshBasicMaterial({color:'#8f7dff',toneMapped:false}),pm=new THREE.MeshBasicMaterial({color:'#e4deff',toneMapped:false});for(let i=0;i<4;i++){const a=i*Math.PI/2+Math.PI/4;A(g,Bx(.62,.008,.018),cond,Math.cos(a)*.72,.095,Math.sin(a)*.72,0,-a,0);const pu=A(g,Sp(.028,8,6),pm,0,.12,0);const ph=i*.25;anim(t=>{const u=(t*.45+ph)%1,r=1.0-u*.7;pu.position.set(Math.cos(a)*r,.12,Math.sin(a)*r);pu.scale.setScalar(.7+Math.sin(u*3.14)*.8)})}

 const core=A(g,Sp(.34,32,22),m.plasma,0,1.2,0);const hal=A(g,Sp(.55,24,16),glow('hp','#7a6bff',.8,{transparent:true,opacity:.18,depthWrite:false}),0,1.2,0);anim((t,dt)=>{TX.plasma.offset.x=t*.06;TX.plasma.offset.y=t*.03;core.rotation.y+=dt*.5;hal.scale.setScalar(1+Math.sin(t*2.2)*.08)});
 [[.62,.0,.0],[.8,1.0,.3],[.98,-.9,-.4]].forEach(([r,rx,rz],i)=>{const grp=new THREE.Group();grp.position.set(0,1.2,0);grp.rotation.set(rx,0,rz);g.add(grp);const ring=A(grp,To(r,.035,undefined,64),i===1?m.white:m.gold,0,0,0,Math.PI/2);const sat=A(grp,Sp(.06,12,10),i===2?m.cy:m.warm,r,0,0);anim((t,dt)=>{grp.rotation.y+=dt*(.5-i*.17)*(i%2?-1:1)})});
 const tops=[];for(let i=0;i<4;i++){const a=i*Math.PI/2+Math.PI/4,x=Math.cos(a)*1.05,z=Math.sin(a)*1.05;A(g,Bx(.14,.6,.14),m.white,x,.5,z,0,a,0);A(g,Cy(.05,.09,.1,12),m.gold,x,.85,z);A(g,Sp(.06,12,8),m.cy,x,.95,z);tops.push([x,.95,z])}
 const arcs=tops.map(()=>{const pts=[];for(let k=0;k<12;k++)pts.push(new THREE.Vector3());const geo=new THREE.BufferGeometry().setFromPoints(pts);const l=new THREE.Line(geo,new THREE.LineBasicMaterial({color:'#9ff4ff',toneMapped:false}));g.add(l);return l});
 anim(t=>{arcs.forEach((l,i)=>{const [x,y,z]=tops[i],p=l.geometry.attributes.position;for(let k=0;k<12;k++){const u=k/11,j=k&&k<11?rr(-.07,.07):0;p.setXYZ(k,x*(1-u)+j,y*(1-u)+1.2*u+rr(-.04,.04)*(k&&k<11?1:0),z*(1-u)+j)}p.needsUpdate=true;l.visible=Math.sin(t*9+i*2)>-.35})});
 for(let i=0;i<5;i++){const s=new THREE.Group();g.add(s);A(s,Sp(.07,12,10),m.white,0,0,0);A(s,Cy(.006,.006,.2,5),m.iron,0,.14,0);A(s,To(.1,.01,undefined,20),m.cy,0,0,0,Math.PI/2);orbit(s,0,1.6,0,rr(1.1,1.35),rr(.25,.45),rr(.2,1.2),rn()*6)}
 light(g,0x8a7bff,1.7,1.3);return g}
/* 7 Civilização Cósmica: estrela com disco de acreção e jato de luz, planetas com luas, ilhas com torres, cometa, nebulosas e constelações */
function e7(){const g=new THREE.Group(),m=M(),Y=1.5;plaza(g,m.consta,1.45);A(g,Cy(1.05,1.15,.12,48),m.dark,0,.12,0);
 const arm=new THREE.Group();arm.position.y=.19;g.add(arm);A(arm,To(1.0,.03,undefined,64).rotateX(Math.PI/2),m.gold,0,0,0);for(let i=0;i<36;i++){const a=i/36*6.283;A(arm,Bx(i%6?.025:.07,.02,.03),m.gold,Math.cos(a)*1.0,0,Math.sin(a)*1.0,0,-a,0)}anim((t,dt)=>{arm.rotation.y+=dt*.12});
 const gal=A(g,new THREE.PlaneGeometry(4.0,4.0),addv(TX.galaxy,{opacity:.4,side:THREE.FrontSide}),0,.62,0,-Math.PI/2);gal.castShadow=false;anim((t,dt)=>{gal.rotation.z+=dt*.1});
 const star=A(g,Sp(.2,32,24),glow('sun','#ffb347',1.1),0,Y,0);[[.32,'#ff8a2a',.2],[.46,'#ff5a1a',.1],[.66,'#ff9a4a',.05]].forEach(([r,c,o],i)=>{const h=A(g,Sp(r,20,14),glow('cr'+i,c,.5,{transparent:true,opacity:o,depthWrite:false}),0,Y,0);h.castShadow=false;anim(t=>{h.scale.setScalar(1+Math.sin(t*(1.5+i*.6)+i)*.08)})});
 const disc=A(g,new THREE.RingGeometry(.38,1.1,72),addv(TX.accr,{opacity:.7}),0,Y,0,Math.PI/2+.28,0,.1);disc.castShadow=false;anim((t,dt)=>{disc.rotation.z+=dt*1.0});
 const jet=A(g,Cy(.018,.12,2.4,20,1,true),addv(TX.beam,{opacity:.5}),0,Y+1.2,0);jet.castShadow=false;anim(t=>{jet.scale.set(1+Math.sin(t*5)*.12,1+Math.sin(t*2)*.04,1+Math.sin(t*5)*.12)});
 for(let i=0,NQ=Q(22);i<NQ;i++){const o=A(g,Sp(.016,6,5),glow('jp','#cfeaff',2.4),0,Y,0),ph=rn(),sp=rr(.3,.6),sw=rr(-.07,.07);anim(t=>{const u=(t*sp+ph)%1;o.position.set(sw*u*3,Y+.1+u*2.3,sw*u*2);o.scale.setScalar(Math.max(.05,1-u))})}
 const planet=(r,map,R,sp,tilt,ph,o)=>{o=o||{};const grp=new THREE.Group();g.add(grp);const pl=A(grp,Sp(r,28,20),o.lava?glow('lv'+r,'#ff5a1a',.6,{map,emissiveMap:map}):mat('pl'+r,'#ffffff',{map,roughness:.7}),0,0,0);if(o.ring)A(grp,new THREE.RingGeometry(r*1.5,r*2.2,48),new THREE.MeshBasicMaterial({color:'#e8d3a0',side:THREE.DoubleSide,transparent:true,opacity:.75}),0,0,0,Math.PI/2.3);
  if(o.atm){A(grp,Sp(r*1.1,20,14),glow('at'+r,'#7ad0ff',.5,{transparent:true,opacity:.18,depthWrite:false}),0,0,0)}
  let mn=null;if(o.moon){mn=A(g,Sp(r*.32,14,10),mat('mn'+r,'#cfc8bd',{map:TX.rocky}),0,0,0)}
  A(g,To(R,.004,undefined,90),glow('tr'+R,'#ffffff',.5,{transparent:true,opacity:.16}),0,Y,0,Math.PI/2+tilt);
  anim((t,dt)=>{const a=t*sp+ph;const px=Math.cos(a)*R,py=Y+Math.sin(a)*R*Math.sin(tilt),pz=Math.sin(a)*R*Math.cos(tilt);grp.position.set(px,py,pz);pl.rotation.y+=dt*.8;if(mn){const b=t*sp*5+ph;mn.position.set(px+Math.cos(b)*r*2.3,py+Math.sin(b*.7)*r*.4,pz+Math.sin(b)*r*2.3)}})};
 planet(.1,TX.rocky,.62,.8,.22,0,{moon:true});planet(.16,TX.band,.88,.5,-.28,2,{ring:true});planet(.13,TX.earth,1.08,.34,.3,4,{atm:true,moon:true});planet(.09,TX.rocky,1.24,.24,-.12,1,{lava:true});
 const shell=A(g,Sp(.235,28,20),glow('shl','#ffffff',1.0,{map:TX.plasma,emissiveMap:TX.plasma,emissive:new THREE.Color('#c8b8ff'),transparent:true,opacity:.32,depthWrite:false}),0,Y,0);shell.castShadow=false;anim((t,dt)=>{shell.rotation.y+=dt*.8;shell.rotation.x+=dt*.3;star.scale.setScalar(1+Math.sin(t*3)*.04)});
 const GC=['#7a6bff','#2de3ff','#ff7ad0','#ffb347','#7aff9a','#ff6a4a'];
 const archGeo=(()=>{const s=new THREE.Shape();s.moveTo(-.1,0);s.lineTo(.1,0);s.lineTo(.1,.5);s.absarc(0,.5,.1,0,Math.PI,false);s.lineTo(-.1,0);return new THREE.ExtrudeGeometry(s,{depth:.012,bevelEnabled:false})})();
 for(let i=0;i<6;i++){const a=i/6*6.283+.3,col=GC[i],gg=new THREE.Group();gg.position.set(Math.cos(a)*1.36,.14,Math.sin(a)*1.36);gg.rotation.y=-a+Math.PI/2;g.add(gg);
  A(gg,Bx(.34,.05,.14),m.cream,0,.025,0);[-.12,.12].forEach(dx=>{A(gg,lathe([[.045,0],[.036,.07],[.03,.5],[.045,.55]],12),m.cream,dx,.05,0);A(gg,Cy(.05,.05,.025,12),m.gold,dx,.6,0)});
  A(gg,new THREE.TorusGeometry(.12,.028,8,30,Math.PI),m.cream,0,.58,0);A(gg,Co(.035,.07,4),m.gold,0,.76,0,0,Math.PI/4,0);
  const pm=new THREE.MeshStandardMaterial({color:'#ffffff',map:TX.plasma,emissive:new THREE.Color(col),emissiveMap:TX.plasma,emissiveIntensity:1.1,toneMapped:false,side:THREE.DoubleSide,transparent:true,opacity:.92});
  const pt=A(gg,archGeo,pm,0,.05,-.006);pt.castShadow=false;anim(t=>{pm.emissiveIntensity=.9+.35*Math.sin(t*2+i)});
  for(let k=0;k<5;k++){const sp=A(gg,Sp(.012,6,5),new THREE.MeshBasicMaterial({color:col,toneMapped:false}),0,.2,0),ph=rn();anim(t=>{const u=(t*.4+ph)%1;sp.position.set(Math.sin(ph*20+t)*.07,.12+u*.55,.03);sp.scale.setScalar(Math.max(.05,1-u))})}
  const E=new THREE.Vector3(Math.cos(a)*.27,Y-.02,Math.sin(a)*.27),S0=new THREE.Vector3(Math.cos(a)*1.36,.14+.8,Math.sin(a)*1.36);
  const cur=new THREE.CatmullRomCurve3([S0,new THREE.Vector3(Math.cos(a)*1.16,.98,Math.sin(a)*1.16),new THREE.Vector3(Math.cos(a)*.74,Y-.28,Math.sin(a)*.74),E]);
  const cm=new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.8,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false});
  const tb=new THREE.Mesh(new THREE.TubeGeometry(cur,36,.01,6),cm);tb.castShadow=false;g.add(tb);anim(t=>{cm.opacity=.1+.05*Math.sin(t*3+i)});
  const NP=130,mkLine=(c,o)=>{const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints(Array.from({length:NP},()=>new THREE.Vector3())),new THREE.LineBasicMaterial({color:c,transparent:true,opacity:o,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));l.frustumCulled=false;g.add(l);return l};
  const core=mkLine('#eaf6ff',1),glowA=mkLine(col,.55),glowB=mkLine(col,.4),br=[mkLine('#cfe9ff',.9),mkLine('#cfe9ff',.8)],brg=[mkLine(col,.4),mkLine(col,.35)];
  glowA.position.set(.004,.003,0);glowB.position.set(-.004,-.003,.003);
  const perp=(d)=>{const u=new THREE.Vector3(rr(-1,1),rr(-1,1),rr(-1,1));return u.sub(d.clone().multiplyScalar(u.dot(d))).normalize()};
  let acc=0,life=0;const regen=()=>{let pts=[];for(let k=0;k<=16;k++)pts.push(cur.getPoint(k/16));let amp=.13;for(let pass=0;pass<3;pass++){const nx=[];for(let k=0;k<pts.length-1;k++){const A0=pts[k],B0=pts[k+1],mid=A0.clone().add(B0).multiplyScalar(.5),d=B0.clone().sub(A0).normalize();mid.add(perp(d).multiplyScalar(rr(-amp,amp)));nx.push(A0,mid)}nx.push(pts[pts.length-1]);pts=nx;amp*=.55}
   const put=(l,arr)=>{const q=l.geometry.attributes.position;for(let k=0;k<NP;k++){const v=arr[Math.min(k,arr.length-1)];q.setXYZ(k,v.x,v.y,v.z)}q.needsUpdate=true};
   put(core,pts);put(glowA,pts);put(glowB,pts);
   br.forEach((l,bi)=>{const st=pts[Math.floor(rr(.2,.8)*pts.length)],dir=perp(new THREE.Vector3(0,1,0)).multiplyScalar(1);const arr=[st.clone()];let cp=st.clone(),dv=dir.clone();for(let k=0;k<8;k++){dv.add(new THREE.Vector3(rr(-.5,.5),rr(-.5,.5),rr(-.5,.5))).normalize();cp=cp.clone().add(dv.clone().multiplyScalar(.045));arr.push(cp)}put(l,arr);put(brg[bi],arr);brg[bi].position.copy(glowA.position)})};
  regen();
  anim((t,dt)=>{acc+=dt;life*=.86;if(acc>.07+rr(0,.08)){acc=0;if(rn()<.78){regen();life=1}else life=.12}const v=Math.max(.05,life);core.material.opacity=Math.min(1,v*1.1);glowA.material.opacity=.5*v;glowB.material.opacity=.36*v;br.forEach(l=>l.material.opacity=.85*v);brg.forEach(l=>l.material.opacity=.4*v)});
  const fl=A(g,Bx(1.0,.008,.022),new THREE.MeshBasicMaterial({color:col,toneMapped:false,transparent:true,opacity:.8}),Math.cos(a)*.88,.115,Math.sin(a)*.88,0,-a,0);fl.castShadow=false;
 }

 const com=new THREE.Group();g.add(com);const ch=A(com,Sp(.05,10,8),glow('cm','#e9f6ff',2.6),0,0,0),ct=A(com,Co(.07,1.1,12),addv(TX.beam,{opacity:.85}),0,0,0);ct.geometry.translate(0,-.55,0);anim(t=>{const u=(t%9)/9;com.visible=u<.42;const k=u/.42,p0=new THREE.Vector3(-2.6,2.7,-1.7),p1=new THREE.Vector3(2.7,1.3,1.9),pos=p0.clone().lerp(p1,k);com.position.copy(pos);const d=p1.clone().sub(p0).normalize();ct.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.clone().negate().negate());ct.quaternion.setFromUnitVectors(new THREE.Vector3(0,-1,0),d)});
 [['rgba(120,80,255,.55)',[-1.9,1.4,-1.3],2.4],['rgba(255,90,160,.45)',[1.8,1.9,-1.6],2.2],['rgba(60,200,255,.45)',[1.5,.9,1.9],2.0],['rgba(255,170,60,.4)',[-1.6,2.3,1.4],1.8],['rgba(120,255,190,.35)',[0,2.7,-2.1],2.2]].forEach(([c,p,s],i)=>{const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:softTex(c),blending:THREE.AdditiveBlending,depthWrite:false,transparent:true,opacity:.4,toneMapped:false}));sp.position.set(...p);sp.scale.setScalar(s);g.add(sp);anim(t=>{sp.position.y=p[1]+Math.sin(t*.3+i)*.1;sp.material.opacity=.38+.1*Math.sin(t*.5+i*2)})});

 const dust=new THREE.Points(new THREE.BufferGeometry().setFromPoints(Array.from({length:Q(320)},()=>new THREE.Vector3(rr(-2.2,2.2),rr(.1,3),rr(-2.2,2.2)))),new THREE.PointsMaterial({color:'#ffe9b0',size:.035,transparent:true,opacity:.85,toneMapped:false}));g.add(dust);anim(t=>{dust.rotation.y=t*.04;dust.material.opacity=.6+.25*Math.sin(t*2)});
 light(g,0xffd27a,2.4,1.5);return g}
const ERAS=[['Acampamento','Núcleo 1–4','Fogueira com panela, geodo-semente, tenda de couro, totem entalhado e varal de peixes.',e1],['Vila','Núcleo 5–9','Árvore-santuário em flor com casa na árvore, raízes, lagoa, lanternas e pétalas caindo.',e2,9,1.0],['Cidade','Núcleo 10–14','Fonte em dois andares com água ondulando e a chama eterna dourada.',e3],['Metrópole','Núcleo 15–19','Rotunda com cúpula de azulejos, vitrais e um orbe de luz com anéis.',e4],['Capital Estelar','Núcleo 20–29','Coração de cristal com núcleo interno, pilares com feixes de energia, auroras e rochas flutuantes.',e5,9.5,1.1],['Império Orbital','Núcleo 30–44','Núcleo de plasma, giroscópio de ouro e arcos de energia.',e6],['Civilização Cósmica','Núcleo 45+','Estrela com disco de acreção e jato de luz, planetas com luas, seis portais cósmicos, cometa, nebulosas e constelações.',e7,12,1.5]];
return { FN, LIGHTS, ERAS, tick: t => { const m = M(); m.cy.emissiveIntensity = .85 + .35 * Math.sin(t * 2.2); m.gl.emissiveIntensity = .85 + .35 * Math.sin(t * 1.8 + 1); }, build(era, lq) { LQ = !!lq; seed = 11 + era * 5; FN.length = 0; LIGHTS.length = 0; return ERAS[era][3](); } };
}

    var CC = { kit: null, g: null, scene: null, era: -1, lq: null, failed: false };
    const CORE_ERA_AT = [1, 5, 10, 15, 20, 30, 45], CORE_SC = [1.5, 1.55, 1.6, 1.7, 1.8, 1.9, 2.0];
    const clCoreEra = n => { let e = 0; CORE_ERA_AT.forEach((x, i) => { if (n >= x) e = i; }); return e; };
    function clCoreOn() { return !!(typeof CC !== 'undefined' && CC && !CC.failed); }
    function clCoreStep(dt, t) {   /* núcleo novo: reconstrói quando a era, a cena ou a qualidade mudam; posiciona no bloco 3x3 do Núcleo e roda as animações */
        if (!CL3.sc) return; const THREE = clTh(); if (!THREE) return;
        const s = clS(), p = s.pcs.find(q => q[0] === 'nucleo'), lq = !!(CL3.lowq || CL_TOUCH()), era = (typeof window.__coreEra === 'number') ? window.__coreEra : clCoreEra(s.nuc);
        if (!CC.kit) CC.kit = clCoreKit(THREE);
        if (!CC.g || CC.scene !== CL3.sc || CC.era !== era || CC.lq !== lq) {
            if (CC.g) { if (CC.g.parent) CC.g.parent.remove(CC.g); CC.g.traverse(o => { if (o.geometry) o.geometry.dispose(); }); }
            CC.g = CC.kit.build(era, lq); CC.scene = CL3.sc; CC.era = era; CC.lq = lq; CL3.sc.add(CC.g);
        }
        if (!p) { CC.g.visible = false; return; } CC.g.visible = true;
        const k = (CL3.cineCoreK != null ? CL3.cineCoreK : 1) + 0.0001, n = CL3.dayN || 0, SC = CORE_SC[era] * k;   /* o Núcleo é o coração da colônia: grande e crescendo a cada era; a base fica um pouco abaixo do chão para não cobrir as construções vizinhas */
        CC.g.position.set(p[1] + 1.5, 0.012 - 0.065 * SC, p[2] + 1.5); CC.g.scale.setScalar(SC);
        CC.kit.tick(t); CC.kit.FN.forEach(f => f(t, dt)); CC.kit.LIGHTS.forEach(o => { o.l.intensity = o.b * (1 + n * 0.8); o.l.distance = 4.5 * SC; });
    }
    /* =========================================================================
       CONTRIBUIÇÕES DO GABRIEL (OTIMIZADAS VIA clMergeByMat & CACHE COMPARTILHADO)
       - Arco Florido (arco_jardim, 2x1)
       - Escola da Colônia com telhado sólido (escola, 2x2)
       - Tenda Esculpida 3D catenária (tenda, 2x2)
       ========================================================================= */
    function clColTexPool(THREE) {
        if (CLM._gTex) return CLM._gTex;
        const T = {};
        let sd = 1337;
        const rnd = () => { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; };
        const mk = (k, w, h, draw, rx, ry) => {
            const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
            draw(cv.getContext('2d'), w, h);
            const t = new THREE.CanvasTexture(cv);
            t.wrapS = t.wrapT = THREE.RepeatWrapping;
            t.anisotropy = 4;
            t.encoding = THREE.sRGBEncoding;
            t.repeat.set(rx || 1, ry || 1);
            return (T[k] = t);
        };
        T.plaster = mk('pl', 256, 256, (g, w, h) => {
            g.fillStyle = '#f5ebd6'; g.fillRect(0, 0, w, h);
            for (let i = 0; i < 220; i++) {
                g.fillStyle = rnd() > 0.5 ? 'rgba(255,250,238,0.25)' : 'rgba(210,180,140,0.16)';
                g.beginPath(); g.arc(rnd() * w, rnd() * h, 3 + rnd() * 12, 0, Math.PI * 2); g.fill();
            }
            for (let i = 0; i < 450; i++) {
                g.fillStyle = 'rgba(130,100,68,0.08)'; g.fillRect(rnd() * w, rnd() * h, 2, 1);
            }
        }, 1, 1);
        T.wood = mk('wd', 128, 256, (g, w, h) => {
            g.fillStyle = '#7c4e2d'; g.fillRect(0, 0, w, h);
            for (let i = 0; i < 80; i++) {
                g.fillStyle = rnd() > 0.45 ? 'rgba(55,30,14,0.28)' : 'rgba(160,110,70,0.22)';
                g.fillRect(rnd() * w, rnd() * h, 2 + rnd() * 2, 10 + rnd() * 34);
            }
            g.fillStyle = 'rgba(42,22,10,0.45)';
            for (let x = 0; x < w; x += 32) g.fillRect(x, 0, 2, h);
        }, 1, 2);
        T.shingle = mk('sh', 256, 256, (g, w, h) => {
            g.fillStyle = '#d6dde6'; g.fillRect(0, 0, w, h);
            const rows = 10, rh = h / rows, tw = 32;
            for (let r = 0; r < rows; r++) {
                const y = r * rh, off = (r % 2) * 16;
                for (let x = -tw; x < w + tw; x += tw) {
                    const shade = 212 + Math.floor((rnd() - 0.5) * 30);
                    g.fillStyle = `rgb(${shade},${shade + 4},${shade + 10})`;
                    g.fillRect(x + off + 1, y + 2, tw - 2, rh - 3);
                    g.fillStyle = 'rgba(255,255,255,0.28)'; g.fillRect(x + off + 2, y + 3, tw - 4, 2);
                    g.strokeStyle = 'rgba(40,48,60,0.45)'; g.lineWidth = 1.5;
                    g.strokeRect(x + off + 1, y + 2, tw - 2, rh - 3);
                }
            }
        }, 3, 4);
        T.stone = mk('st', 256, 256, (g, w, h) => {
            g.fillStyle = '#7e8690'; g.fillRect(0, 0, w, h);
            const bw = 64, bh = 32;
            for (let r = 0; r < 8; r++) {
                const off = (r % 2) * 32;
                for (let c = -1; c < 5; c++) {
                    const x = c * bw + off, y = r * bh;
                    const v = 165 + Math.floor((rnd() - 0.5) * 28);
                    g.fillStyle = `rgb(${v},${v + 2},${v + 5})`;
                    g.fillRect(x + 2, y + 2, bw - 4, bh - 4);
                    g.fillStyle = 'rgba(255,255,255,0.24)'; g.fillRect(x + 3, y + 3, bw - 8, 3);
                    g.fillStyle = 'rgba(30,36,44,0.22)'; g.fillRect(x + 3, y + bh - 6, bw - 8, 2);
                }
            }
        }, 2, 2);
        T.foliage = mk('fg', 128, 128, (g, w, h) => {
            g.fillStyle = '#2d6a3e'; g.fillRect(0, 0, w, h);
            for (let i = 0; i < 190; i++) {
                g.fillStyle = rnd() > 0.5 ? '#3f8f4e' : '#1f512c';
                g.beginPath(); g.arc(rnd() * w, rnd() * h, 4 + rnd() * 9, 0, Math.PI * 2); g.fill();
            }
        }, 2, 2);
        T.canvas = mk('cv', 256, 256, (g, w, h) => {
            g.fillStyle = '#ece3d0'; g.fillRect(0, 0, w, h);
            g.strokeStyle = 'rgba(130,108,82,0.14)'; g.lineWidth = 1;
            for (let x = 0; x < w; x += 6) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
            for (let y = 0; y < h; y += 6) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
            for (let i = 0; i < 160; i++) {
                g.fillStyle = 'rgba(160,132,96,0.10)';
                g.beginPath(); g.arc(rnd() * w, rnd() * h, 4 + rnd() * 14, 0, Math.PI * 2); g.fill();
            }
        }, 2, 2);
        T.fur = mk('fr', 256, 256, (g, w, h) => {
            g.fillStyle = '#7b5336'; g.fillRect(0, 0, w, h);
            for (let i = 0; i < 240; i++) {
                g.fillStyle = rnd() > 0.5 ? 'rgba(148,104,68,0.28)' : 'rgba(64,40,24,0.26)';
                g.fillRect(rnd() * w, rnd() * h, 6 + rnd() * 16, 4 + rnd() * 10);
            }
            g.strokeStyle = 'rgba(42,26,14,0.45)'; g.lineWidth = 2; g.setLineDash([5, 4]);
            g.strokeRect(10, 10, w - 20, h - 20);
        }, 2, 2);
        T.rug = mk('rg', 256, 256, (g, w, h) => {
            g.fillStyle = '#8b1e2b'; g.fillRect(0, 0, w, h);
            g.strokeStyle = '#d9a441'; g.lineWidth = 14; g.strokeRect(14, 14, w - 28, h - 28);
            g.strokeStyle = '#1e3a5f'; g.lineWidth = 6; g.strokeRect(32, 32, w - 64, h - 64);
            g.fillStyle = '#d9a441'; g.beginPath();
            g.moveTo(w / 2, 52); g.lineTo(w - 52, h / 2); g.lineTo(w / 2, h - 52); g.lineTo(52, h / 2); g.closePath(); g.fill();
            g.fillStyle = '#1e3a5f'; g.beginPath();
            g.moveTo(w / 2, 74); g.lineTo(w - 74, h / 2); g.lineTo(w / 2, h - 74); g.lineTo(74, h / 2); g.closePath(); g.fill();
        }, 1, 1);
        T.clock = mk('ck', 128, 128, (g, w, h) => {
            const cx = w / 2, cy = h / 2, R = w * 0.44;
            g.fillStyle = '#f8f0dc'; g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.fill();
            g.strokeStyle = '#926c24'; g.lineWidth = 5; g.stroke();
            g.strokeStyle = '#261b12'; g.lineWidth = 2.5;
            for (let i = 0; i < 12; i++) {
                const a = (i / 12) * Math.PI * 2;
                g.beginPath(); g.moveTo(cx + Math.cos(a) * R * 0.72, cy + Math.sin(a) * R * 0.72);
                g.lineTo(cx + Math.cos(a) * R * 0.88, cy + Math.sin(a) * R * 0.88); g.stroke();
            }
            g.lineWidth = 4; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + R * 0.36, cy - R * 0.28); g.stroke();
            g.lineWidth = 2.5; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx, cy - R * 0.65); g.stroke();
            g.fillStyle = '#926c24'; g.beginPath(); g.arc(cx, cy, 4, 0, Math.PI * 2); g.fill();
        }, 1, 1);
        T.chalk = mk('ch', 256, 128, (g, w, h) => {
            g.fillStyle = '#1b4332'; g.fillRect(0, 0, w, h);
            g.strokeStyle = 'rgba(248,250,252,0.78)'; g.lineWidth = 2.5;
            g.beginPath(); g.arc(64, 64, 28, 0, Math.PI * 2); g.stroke();
            g.beginPath(); g.moveTo(116, 86); g.lineTo(156, 36); g.lineTo(186, 86); g.closePath(); g.stroke();
            for (let y = 38; y < 96; y += 16) { g.beginPath(); g.moveTo(198, y); g.lineTo(234, y); g.stroke(); }
        }, 1, 1);
        T.globe = mk('gl', 128, 64, (g, w, h) => {
            g.fillStyle = '#2563eb'; g.fillRect(0, 0, w, h);
            g.fillStyle = '#22c55e';
            g.beginPath(); g.arc(30, 26, 12, 0, 7); g.arc(64, 34, 15, 0, 7); g.arc(102, 24, 11, 0, 7); g.fill();
            g.strokeStyle = 'rgba(255,255,255,0.22)'; g.lineWidth = 1;
            for (let x = 0; x < w; x += 21) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
            for (let y = 16; y < h; y += 16) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
        }, 1, 1);
        T.dirt = mk('dt', 256, 256, (g, w, h) => {
            g.fillStyle = '#8b6f4e'; g.fillRect(0, 0, w, h);
            for (let i = 0; i < 200; i++) {
                g.fillStyle = rnd() > 0.5 ? 'rgba(65,48,30,0.22)' : 'rgba(175,146,110,0.20)';
                g.beginPath(); g.arc(rnd() * w, rnd() * h, 2 + rnd() * 7, 0, Math.PI * 2); g.fill();
            }
        }, 2, 2);
        return (CLM._gTex = T);
    }

    function clGMeshMat(THREE, opts) {
        const m = new THREE.MeshLambertMaterial(opts);
        m.defines = Object.assign({}, m.defines, { CL_NO_PASTEL: 1 });
        return m;
    }

    /* 1. ARCO FLORIDO (arco_jardim, 2x1) */
    function clArcoJardimTemplate(THREE, L, accentHex) {
        const T = clColTexPool(THREE);
        const g = new THREE.Group();
        const M = {
            stone: clGMeshMat(THREE, { map: T.stone, color: 0xe8edf2 }),
            stoneDk: clGMeshMat(THREE, { map: T.stone, color: 0x9aa4b2 }),
            wood: clGMeshMat(THREE, { map: T.wood, color: 0x8b5a34 }),
            roof: clGMeshMat(THREE, { map: T.shingle, color: new THREE.Color(accentHex), side: THREE.DoubleSide }),
            under: clGMeshMat(THREE, { map: T.wood, color: 0x5c381f }),
            gold: clGMeshMat(THREE, { color: 0xf4c542, emissive: 0x3b2604, emissiveIntensity: 0.25 }),
            iron: clGMeshMat(THREE, { color: 0x374151 }),
            lantern: clGMeshMat(THREE, { color: 0xffe49e, emissive: 0xffaa2b, emissiveIntensity: 1.5 }),
            leaf: clGMeshMat(THREE, { map: T.foliage, color: 0x4ca65c }),
            vine: clGMeshMat(THREE, { color: 0x2f6d3a }),
            flowerA: clGMeshMat(THREE, { color: 0xf472b6 }),
            flowerB: clGMeshMat(THREE, { color: new THREE.Color(accentHex).lerp(new THREE.Color(0xffffff), 0.25) }),
            flowerC: clGMeshMat(THREE, { color: 0xc084fc }),
            banner: clGMeshMat(THREE, { color: new THREE.Color(accentHex), side: THREE.DoubleSide }),
            crystal: clGMeshMat(THREE, { color: 0xa855f7, emissive: 0x9333ea, emissiveIntensity: 0.9 })
        };
        const add = (geo, mat, x, y, z, rx, ry, rz) => {
            const m = new THREE.Mesh(geo, mat);
            m.position.set(x || 0, y || 0, z || 0);
            if (rx) m.rotation.x = rx; if (ry) m.rotation.y = ry; if (rz) m.rotation.z = rz;
            m.castShadow = true; m.receiveShadow = true;
            g.add(m); return m;
        };
        const box = (w, h, d, mat, x, y, z, rx, ry, rz) => add(new THREE.BoxGeometry(w, h, d), mat, x, y, z, rx, ry, rz);

        // Plataforma de base e meio-fio compactos (cabe em 2x1 quando escalado)
        box(2.16, 0.08, 0.96, M.stoneDk, 0, 0.04, 0);
        box(1.96, 0.04, 0.82, M.stone, 0, 0.09, 0);

        const y0 = 0.11, pillarX = 0.78, springY = y0 + 1.12;
        [-1, 1].forEach(sx => {
            const px = sx * pillarX;
            box(0.42, 0.14, 0.42, M.stoneDk, px, y0 + 0.07, 0);
            box(0.36, 0.10, 0.36, M.stone, px, y0 + 0.19, 0);
            add(new THREE.CylinderGeometry(0.145, 0.165, 0.78, 12), M.stone, px, y0 + 0.63, 0);
            add(new THREE.TorusGeometry(0.16, 0.025, 6, 16), M.stoneDk, px, springY - 0.06, 0, Math.PI / 2, 0, 0);
            box(0.38, 0.10, 0.38, M.stone, px, springY, 0);

            // Canteiro floral frontal e traseiro integrado no pé da coluna
            [-0.26, 0.26].forEach(fz => {
                box(0.34, 0.10, 0.16, M.stoneDk, px, y0 + 0.05, fz);
                add(new THREE.DodecahedronGeometry(0.11, 0), M.leaf, px, y0 + 0.14, fz);
                for (let f = 0; f < 3; f++) {
                    add(new THREE.SphereGeometry(0.036, 6, 5), f === 0 ? M.flowerA : (f === 1 ? M.flowerB : M.flowerC),
                        px + (f - 1) * 0.08, y0 + 0.21 + (f === 1 ? 0.03 : 0), fz + (f % 2 ? 0.03 : -0.02));
                }
            });

            // Trepadeira enrolando na coluna + cachos floridos (glicínias)
            for (let k = 0; k < 5; k++) {
                const a = k * 1.15 + (sx < 0 ? 0 : 1.5);
                add(new THREE.SphereGeometry(0.055, 6, 5), k % 2 ? M.leaf : M.vine,
                    px + Math.cos(a) * 0.16, y0 + 0.26 + k * 0.16, Math.sin(a) * 0.16);
                if (k >= 2) add(new THREE.SphereGeometry(0.032, 5, 4), M.flowerC,
                    px + Math.cos(a) * 0.19, y0 + 0.25 + k * 0.16, Math.sin(a) * 0.19);
            }
            if (L >= 4) {
                for (let w = 0; w < 3; w++) {
                    add(new THREE.ConeGeometry(0.045 - w * 0.01, 0.10, 6), w === 1 ? M.flowerC : M.flowerA,
                        px - sx * 0.18, springY - 0.14 - w * 0.09, 0, Math.PI, 0, 0);
                }
            }

            // Suporte e lanterna pendente quente (sem PointLight para FPS)
            box(0.22, 0.025, 0.025, M.iron, px - sx * 0.20, springY - 0.06, 0);
            const lx = px - sx * 0.27;
            add(new THREE.CylinderGeometry(0.045, 0.055, 0.11, 6), M.lantern, lx, springY - 0.16, 0);
            add(new THREE.ConeGeometry(0.07, 0.06, 6), M.iron, lx, springY - 0.08, 0);
            box(0.08, 0.02, 0.08, M.iron, lx, springY - 0.22, 0);
        });

        // Arco em aduelas de cantaria e pedra-chave saliente
        const numV = 9, archR = pillarX, rIn = 0.62, rOut = 0.90;
        for (let i = 0; i < numV; i++) {
            const a = ((i + 0.5) / numV) * Math.PI;
            const isKey = i === Math.floor(numV / 2);
            const rMid = (rIn + rOut) * 0.5 + (isKey ? 0.03 : 0);
            const thick = (rOut - rIn) + (isKey ? 0.07 : 0);
            box(0.21, thick, isKey ? 0.34 : 0.29, isKey ? M.stoneDk : M.stone,
                Math.cos(a) * archR * 0.96, springY + Math.sin(a) * rMid * 0.88, 0, 0, 0, a - Math.PI / 2);
        }

        // Guirlanda verde + flores acompanhando o topo do arco
        for (let k = 0; k < 11; k++) {
            const a = (k / 10) * Math.PI;
            const gx = Math.cos(a) * pillarX * 0.96, gy = springY + Math.sin(a) * 0.78;
            add(new THREE.SphereGeometry(0.065, 6, 5), M.leaf, gx, gy, 0.15);
            add(new THREE.SphereGeometry(0.065, 6, 5), M.leaf, gx, gy, -0.15);
            if (k % 2 === 0) {
                add(new THREE.SphereGeometry(0.038, 5, 4), k % 4 === 0 ? M.flowerA : M.flowerB, gx, gy + 0.03, 0.19);
                add(new THREE.SphereGeometry(0.038, 5, 4), k % 4 === 0 ? M.flowerB : M.flowerA, gx, gy + 0.03, -0.19);
            }
        }

        // Cobertura sólida em duas águas (L >= 3) sobre o topo do arco
        const ridgeY = springY + 0.90;
        if (L >= 3) {
            const cw = 2.08, cd = 0.74, rise = 0.42;
            const slope = Math.hypot(cd * 0.52, rise), ang = Math.atan2(rise, cd * 0.52);
            [-1, 1].forEach(sz => {
                box(cw, 0.055, slope, M.roof, 0, ridgeY + rise * 0.48, sz * cd * 0.25, sz * ang, 0, 0);
                box(cw - 0.06, 0.04, slope * 0.92, M.under, 0, ridgeY + rise * 0.44, sz * cd * 0.24, sz * ang, 0, 0);
            });
            box(cw + 0.08, 0.09, 0.12, M.gold, 0, ridgeY + rise, 0);
            [-1, 1].forEach(sx => {
                box(0.08, 0.18, 0.08, M.wood, sx * pillarX, ridgeY - 0.06, 0.22);
                box(0.08, 0.18, 0.08, M.wood, sx * pillarX, ridgeY - 0.06, -0.22);
            });
        }

        // Brasão e estandartes reais
        if (L >= 2) {
            box(0.24, 0.28, 0.06, M.gold, 0, springY + 0.78, 0.18);
            box(0.18, 0.22, 0.07, M.banner, 0, springY + 0.78, 0.185);
            [-1, 1].forEach(sx => {
                box(0.14, 0.42, 0.025, M.banner, sx * pillarX, springY - 0.28, 0.21);
                box(0.16, 0.03, 0.04, M.gold, sx * pillarX, springY - 0.07, 0.21);
            });
        }

        if (L >= 5) {
            add(new THREE.OctahedronGeometry(0.11, 0), M.crystal, 0, ridgeY + 0.56, 0);
            [-1, 1].forEach(sx => add(new THREE.OctahedronGeometry(0.07, 0), M.crystal, sx * pillarX, ridgeY + 0.49, 0));
        }

        return clMergeByMat(g, THREE);
    }
    function clArcoJardimPetalTex(THREE) {
        if (CLM._petalTex) return CLM._petalTex;
        const c = document.createElement('canvas'); c.width = 32; c.height = 32;
        const g = c.getContext('2d');
        const gr = g.createRadialGradient(16, 16, 2, 16, 16, 14);
        gr.addColorStop(0, 'rgba(255,255,255,1)');
        gr.addColorStop(0.55, 'rgba(255,245,250,0.92)');
        gr.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = gr;
        g.beginPath(); g.ellipse(16, 16, 13, 8, -0.45, 0, Math.PI * 2); g.fill();
        const t = new THREE.CanvasTexture(c);
        if (THREE.sRGBEncoding) t.encoding = THREE.sRGBEncoding;
        return (CLM._petalTex = t);
    }
    function clArcoJardimPetalAttach(grp, accentHex, L) {
        const THREE = clTh(); if (!THREE || !grp) return;
        const N = 14 + Math.min(5, L) * 4;
        const pos = new Float32Array(N * 3), col = new Float32Array(N * 3), seeds = [];
        const cAcc = new THREE.Color(accentHex || '#e86fa8');
        const cPink = new THREE.Color('#fbcfe8');
        const cWhite = new THREE.Color('#fff5f8');
        const cGold = new THREE.Color('#fde047');
        const tmp = new THREE.Color();
        for (let i = 0; i < N; i++) {
            const x = (Math.random() - 0.5) * 1.9, y = 0.25 + Math.random() * 1.75, z = (Math.random() - 0.5) * 0.9;
            pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
            const pick = i % 5;
            if (L >= 5 && pick === 4) tmp.copy(cGold);
            else if (pick === 0) tmp.copy(cAcc);
            else if (pick === 1) tmp.copy(cPink);
            else if (pick === 2) tmp.copy(cAcc).lerp(cWhite, 0.4);
            else tmp.copy(cWhite);
            col[i * 3] = tmp.r; col[i * 3 + 1] = tmp.g; col[i * 3 + 2] = tmp.b;
            seeds.push({ x0: (Math.random() - 0.5) * 1.65, z0: (Math.random() - 0.5) * 0.72, y, vy: 0.22 + Math.random() * 0.18, ph: Math.random() * 6.2832, amp: 0.14 + Math.random() * 0.14 });
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
        const mat = new THREE.PointsMaterial({ size: 0.14, map: clArcoJardimPetalTex(THREE), vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false, sizeAttenuation: true });
        const pts = new THREE.Points(geo, mat); pts.frustumCulled = false; pts.renderOrder = 10;
        grp.add(pts);
        (CLM._petalFx || (CLM._petalFx = [])).push({ grp, pts, seeds, topY: L >= 3 ? 2.05 : 1.75 });
    }
    function clArcoJardimStep(dt, t) {
        const list = CLM._petalFx; if (!list || !list.length) return;
        const alive = [];
        for (let i = 0; i < list.length; i++) {
            const e = list[i]; if (!e.grp || !e.grp.parent) continue;
            alive.push(e);
            const pa = e.pts.geometry.attributes.position, sd = e.seeds, N = sd.length;
            for (let k = 0; k < N; k++) {
                const s = sd[k]; s.y -= s.vy * dt;
                if (s.y < 0.08) { s.y = e.topY - Math.random() * 0.25; s.x0 = (Math.random() - 0.5) * 1.65; s.z0 = (Math.random() - 0.5) * 0.72; }
                const x = s.x0 + Math.sin(t * 1.6 + s.ph + s.y * 2.1) * s.amp;
                const z = s.z0 + Math.cos(t * 1.3 + s.ph * 1.4 + s.y * 1.7) * (s.amp * 0.75);
                pa.setXYZ(k, x, s.y, z);
            }
            pa.needsUpdate = true;
        }
        CLM._petalFx = alive;
    }
    function clArcoJardimBuild(grp, cv, level) {
        const THREE = clTh(); if (!THREE || !grp) return;
        const L = Math.min(5, Math.max(1, level | 0));
        const pal = (cv > 0 && typeof CLD !== 'undefined' && CLD.PAL && CLD.PAL[cv - 1]) ? CLD.PAL[cv - 1] : null;
        const accentHex = pal ? pal[1] : '#e86fa8';
        const key = L + '_' + accentHex;
        const store = CLM._arcoJardimTpl || (CLM._arcoJardimTpl = {});
        const tpl = store[key] || (store[key] = clArcoJardimTemplate(THREE, L, accentHex));
        const inst = tpl.clone();
        inst.scale.setScalar(0.80);
        grp.add(inst);
        clArcoJardimPetalAttach(grp, accentHex, L);
    }
    function clArchFloridoAssemble(grp, lv, cv) { clArcoJardimBuild(grp, cv | 0, lv || 1); }

    /* 2. ESCOLA DA COLÔNIA (escola, 2x2) — Telhado sólido de duas águas corrigido */
    function clEscolaTemplate(THREE, L, accentHex) {
        const T = clColTexPool(THREE);
        const g = new THREE.Group();
        const M = {
            stone: clGMeshMat(THREE, { map: T.stone, color: 0xcbd5e1 }),
            stoneDk: clGMeshMat(THREE, { map: T.stone, color: 0x8b95a3 }),
            plaster: clGMeshMat(THREE, { map: T.plaster, color: 0xfef8ec }),
            wood: clGMeshMat(THREE, { map: T.wood, color: 0x6f4324 }),
            oak: clGMeshMat(THREE, { map: T.wood, color: 0x523018 }),
            roof: clGMeshMat(THREE, { map: T.shingle, color: new THREE.Color(accentHex), side: THREE.DoubleSide }),
            under: clGMeshMat(THREE, { map: T.wood, color: 0x452712 }),
            brass: clGMeshMat(THREE, { color: 0xe6b44c, emissive: 0x3a2504, emissiveIntensity: 0.2 }),
            glass: clGMeshMat(THREE, { color: 0xffe8a3, emissive: 0xffb347, emissiveIntensity: 0.85 }),
            clock: clGMeshMat(THREE, { map: T.clock, color: 0xffffff }),
            chalk: clGMeshMat(THREE, { map: T.chalk, color: 0xffffff }),
            globe: clGMeshMat(THREE, { map: T.globe, color: 0xffffff }),
            leaf: clGMeshMat(THREE, { map: T.foliage, color: 0x4da858 }),
            flower: clGMeshMat(THREE, { color: 0xf43f5e }),
            banner: clGMeshMat(THREE, { color: new THREE.Color(accentHex), side: THREE.DoubleSide }),
            brick: clGMeshMat(THREE, { color: 0x9b4d3a })
        };
        const add = (geo, mat, x, y, z, rx, ry, rz) => {
            const m = new THREE.Mesh(geo, mat);
            m.position.set(x || 0, y || 0, z || 0);
            if (rx) m.rotation.x = rx; if (ry) m.rotation.y = ry; if (rz) m.rotation.z = rz;
            m.castShadow = true; m.receiveShadow = true;
            g.add(m); return m;
        };
        const box = (w, h, d, mat, x, y, z, rx, ry, rz) => add(new THREE.BoxGeometry(w, h, d), mat, x, y, z, rx, ry, rz);

        // Telhado sólido em duas águas usando ExtrudeGeometry fechado (sem normais invertidas)
        const addGableRoof = (w, d, yBase, rise, rotY, ox, oz) => {
            const span = w + 0.24, len = d + 0.24;
            const sh = new THREE.Shape();
            sh.moveTo(-span * 0.5, 0); sh.lineTo(span * 0.5, 0); sh.lineTo(0, rise); sh.closePath();
            const coreGeo = new THREE.ExtrudeGeometry(sh, { depth: d, bevelEnabled: false });
            coreGeo.translate(0, 0, -d * 0.5);
            const core = new THREE.Mesh(coreGeo, M.plaster);
            core.castShadow = true; core.receiveShadow = true;
            const rg = new THREE.Group();
            rg.position.set(ox || 0, yBase, oz || 0);
            if (rotY) rg.rotation.y = rotY;
            rg.add(core);
            const slope = Math.hypot(span * 0.5 + 0.08, rise + 0.04);
            const ang = Math.atan2(rise, span * 0.5);
            [-1, 1].forEach(sx => {
                const pan = new THREE.Mesh(new THREE.BoxGeometry(slope, 0.06, len), M.roof);
                pan.position.set(sx * span * 0.25, rise * 0.5 + 0.025, 0);
                pan.rotation.z = -sx * ang;
                pan.castShadow = true; pan.receiveShadow = true; rg.add(pan);
            });
            const ridge = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.10, len + 0.06), M.wood);
            ridge.position.set(0, rise + 0.04, 0); ridge.castShadow = true; rg.add(ridge);
            g.add(rg);
        };

        const addWin = (x, y, z, ry) => {
            const wg = new THREE.Group();
            wg.position.set(x, y, z); if (ry) wg.rotation.y = ry;
            const gl = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.34, 0.04), M.glass); wg.add(gl);
            const fr = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.04, 0.07), M.wood); fr.position.y = -0.18; wg.add(fr);
            const hd = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.04, 0.06), M.wood); hd.position.y = 0.18; wg.add(hd);
            const mul = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.34, 0.055), M.wood); wg.add(mul);
            const bar = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.03, 0.055), M.wood); bar.position.y = 0.03; wg.add(bar);
            if (L >= 2) {
                const boxFl = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.06, 0.08), M.oak); boxFl.position.set(0, -0.22, 0.05); wg.add(boxFl);
                const fl = new THREE.Mesh(new THREE.SphereGeometry(0.04, 5, 4), M.flower); fl.position.set(0.05, -0.17, 0.06); wg.add(fl);
                const lf = new THREE.Mesh(new THREE.SphereGeometry(0.045, 5, 4), M.leaf); lf.position.set(-0.05, -0.17, 0.06); wg.add(lf);
            }
            g.add(wg);
        };

        const addDesk = (x, z, ry) => {
            const dg = new THREE.Group(); dg.position.set(x, 0.08, z); dg.rotation.y = ry || 0;
            const top = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.03, 0.18), M.wood); top.position.y = 0.24; top.castShadow = true; dg.add(top);
            [-0.12, 0.12].forEach(lx => {
                const leg = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.24, 0.14), M.oak); leg.position.set(lx, 0.12, 0); leg.castShadow = true; dg.add(leg);
            });
            const seat = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.03, 0.12), M.wood); seat.position.set(0, 0.13, -0.16); seat.castShadow = true; dg.add(seat);
            g.add(dg);
        };

        // 1. Pátio de pedra e base do prédio principal
        box(2.58, 0.08, 2.18, M.stoneDk, 0, 0.04, 0);
        const hW = 1.66, hD = 1.12, hX = -0.12, hZ = -0.22;
        box(hW + 0.08, 0.14, hD + 0.08, M.stone, hX, 0.15, hZ);
        const f1H = 0.82;
        box(hW, f1H, hD, M.plaster, hX, 0.22 + f1H * 0.5, hZ);

        // Vigas de enxaimel nos cantos
        [-hW * 0.5, hW * 0.5].forEach(cx => [-hD * 0.5, hD * 0.5].forEach(cz => {
            box(0.08, f1H + 0.04, 0.08, M.wood, hX + cx, 0.22 + f1H * 0.5, hZ + cz);
        }));
        box(hW + 0.06, 0.07, hD + 0.06, M.wood, hX, 0.22 + f1H, hZ);

        // Pórtico frontal arqueado e portas duplas de carvalho
        const pZ = hZ + hD * 0.5;
        box(0.66, 0.07, 0.34, M.stone, hX, 0.12, pZ + 0.17);
        box(0.70, 0.62, 0.08, M.stoneDk, hX, 0.52, pZ + 0.03);
        box(0.42, 0.54, 0.06, M.oak, hX, 0.48, pZ + 0.045);
        [-0.04, 0.04].forEach(hx => add(new THREE.SphereGeometry(0.02, 5, 4), M.brass, hX + hx, 0.45, pZ + 0.085));
        [-0.28, 0.28].forEach(px => {
            add(new THREE.CylinderGeometry(0.04, 0.048, 0.62, 8), M.wood, hX + px, 0.52, pZ + 0.28);
            box(0.11, 0.07, 0.11, M.stone, hX + px, 0.19, pZ + 0.28);
        });
        addGableRoof(0.64, 0.34, 0.83, 0.26, 0, hX, pZ + 0.17);

        // Janelas do térreo
        addWin(hX - 0.54, 0.62, pZ + 0.02, 0);
        addWin(hX + 0.54, 0.62, pZ + 0.02, 0);
        addWin(hX - 0.45, 0.62, hZ - hD * 0.5 - 0.02, Math.PI);
        addWin(hX + 0.45, 0.62, hZ - hD * 0.5 - 0.02, Math.PI);
        addWin(hX - hW * 0.5 - 0.02, 0.62, hZ, -Math.PI / 2);

        // 2º Pavimento (L >= 3) e altura do telhado
        let roofBaseY = 0.22 + f1H + 0.02;
        if (L >= 3) {
            const f2H = 0.72;
            box(hW * 0.96, f2H, hD * 0.96, M.plaster, hX, roofBaseY + f2H * 0.5, hZ);
            [-hW * 0.48, hW * 0.48].forEach(cx => [-hD * 0.48, hD * 0.48].forEach(cz => {
                box(0.08, f2H, 0.08, M.wood, hX + cx, roofBaseY + f2H * 0.5, hZ + cz);
            }));
            box(hW + 0.04, 0.07, hD + 0.04, M.wood, hX, roofBaseY + f2H, hZ);
            addWin(hX - 0.46, roofBaseY + 0.36, hZ + hD * 0.48 + 0.02, 0);
            addWin(hX + 0.46, roofBaseY + 0.36, hZ + hD * 0.48 + 0.02, 0);
            addWin(hX, roofBaseY + 0.36, hZ + hD * 0.48 + 0.02, 0);
            addWin(hX - hW * 0.48 - 0.02, roofBaseY + 0.36, hZ, -Math.PI / 2);
            // Estandartes frontais coloridos
            [-0.64, 0.64].forEach(bx => box(0.12, 0.36, 0.025, M.banner, hX + bx, roofBaseY + 0.24, pZ + 0.02));
            roofBaseY += f2H;
        }
        addGableRoof(hW, hD, roofBaseY, 0.64, 0, hX, hZ);

        // 2. Ala lateral perpendicular (L >= 4) + chaminé nos fundos
        if (L >= 4) {
            const wX = hX + hW * 0.5 + 0.34, wZ = hZ + 0.06;
            box(0.76, 0.88, 0.96, M.plaster, wX, 0.56, wZ);
            box(0.80, 0.08, 1.00, M.stone, wX, 0.12, wZ);
            box(0.80, 0.07, 1.00, M.wood, wX, 1.00, wZ);
            addWin(wX + 0.39, 0.62, wZ, Math.PI / 2);
            addWin(wX, 0.62, wZ + 0.49, 0);
            addGableRoof(0.96, 0.76, 1.02, 0.46, Math.PI / 2, wX, wZ);
            box(0.24, 1.35, 0.24, M.brick, hX - 0.58, 1.28, hZ - 0.44);
            box(0.30, 0.08, 0.30, M.stoneDk, hX - 0.58, 1.98, hZ - 0.44);
        }

        // 3. Torre do Sino, Sino de Bronze & Relógio Romano
        const tX = hX - hW * 0.32, tZ = hZ + 0.05;
        const twBaseY = roofBaseY + 0.36;
        box(0.46, 0.44, 0.46, M.plaster, tX, twBaseY, tZ);
        box(0.50, 0.06, 0.50, M.wood, tX, twBaseY + 0.23, tZ);
        if (L >= 2) {
            add(new THREE.CylinderGeometry(0.14, 0.14, 0.03, 16), M.clock, tX, twBaseY + 0.02, tZ + 0.24, Math.PI / 2, 0, 0);
        }
        const belfryY = twBaseY + 0.26;
        [-0.17, 0.17].forEach(px => [-0.17, 0.17].forEach(pz => {
            box(0.055, 0.36, 0.055, M.wood, tX + px, belfryY + 0.18, tZ + pz);
        }));
        add(new THREE.CylinderGeometry(0.04, 0.12, 0.19, 12), M.brass, tX, belfryY + 0.19, tZ);
        add(new THREE.SphereGeometry(0.032, 6, 5), M.brass, tX, belfryY + 0.08, tZ);
        const spireH = L >= 4 ? 0.62 : 0.46;
        add(new THREE.ConeGeometry(0.34, spireH, 4), M.roof, tX, belfryY + 0.36 + spireH * 0.5, tZ, 0, Math.PI / 4, 0);
        const apexY = belfryY + 0.36 + spireH;
        add(new THREE.SphereGeometry(0.05, 8, 6), M.brass, tX, apexY + 0.04, tZ);

        // Esfera Armilar giratória no Nível 5 (nó 'sails' gira continuamente!)
        if (L >= 5) {
            const spin = new THREE.Group();
            spin.name = 'sails';
            spin.position.set(tX, apexY + 0.24, tZ);
            const r1 = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.014, 6, 20), M.brass); spin.add(r1);
            const r2 = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.012, 6, 18), M.brass); r2.rotation.y = Math.PI / 2; spin.add(r2);
            const orb = new THREE.Mesh(new THREE.OctahedronGeometry(0.045, 0), M.glass); spin.add(orb);
            g.add(spin);
        }

        // 4. Mobília no pátio (carteiras, quadro-negro, globo e arbustos)
        if (L >= 2) {
            addDesk(hX - 0.66, pZ + 0.56, 0.2);
            box(0.40, 0.28, 0.04, M.chalk, hX + 0.64, 0.44, pZ + 0.54, -0.15, -0.35, 0);
            box(0.04, 0.36, 0.04, M.oak, hX + 0.50, 0.26, pZ + 0.48, 0, -0.35, 0);
            box(0.04, 0.36, 0.04, M.oak, hX + 0.78, 0.26, pZ + 0.60, 0, -0.35, 0);
        }
        if (L >= 3) addDesk(hX - 0.14, pZ + 0.64, -0.1);
        if (L >= 5) {
            const glX = hX + 0.52, glZ = pZ + 0.28;
            add(new THREE.CylinderGeometry(0.05, 0.08, 0.18, 8), M.wood, glX, 0.17, glZ);
            add(new THREE.TorusGeometry(0.105, 0.012, 6, 16), M.brass, glX, 0.35, glZ, 0, 0.4, 0);
            add(new THREE.SphereGeometry(0.09, 12, 10), M.globe, glX, 0.35, glZ, 0.3, 0, 0);
        }
        [-1.02, 0.96].forEach(bx => {
            add(new THREE.DodecahedronGeometry(0.14, 0), M.leaf, bx, 0.18, pZ + 0.56);
            add(new THREE.SphereGeometry(0.04, 5, 4), M.flower, bx + 0.05, 0.28, pZ + 0.60);
        });

        return clMergeByMat(g, THREE);
    }
    function clEscolaBuild(grp, cv, level) {
        const THREE = clTh(); if (!THREE || !grp) return;
        const L = Math.min(5, Math.max(1, level | 0));
        const pal = (cv > 0 && typeof CLD !== 'undefined' && CLD.PAL && CLD.PAL[cv - 1]) ? CLD.PAL[cv - 1] : null;
        const accentHex = pal ? pal[1] : '#2e59a8';
        const key = L + '_' + accentHex;
        const store = CLM._escolaTpl || (CLM._escolaTpl = {});
        const tpl = store[key] || (store[key] = clEscolaTemplate(THREE, L, accentHex));
        const inst = tpl.clone();
        inst.scale.setScalar(0.68);
        grp.add(inst);
        if (grp.userData && grp.userData.pi !== undefined) {
            inst.traverse(o => {
                if (o.name === 'sails') CLM.spin.push({ g: grp, root: o, sp: 0.85 });
            });
        }
    }
    function clEscolaAssemble(grp, lv, cv) { clEscolaBuild(grp, cv | 0, lv || 1); }

    /* 3. TENDA ESCULPIDA 3D (tenda, 2x2) — Lona catenária + estacas + interior vivo */
    function clTendaLoftedMesh(THREE, gridPts, mat, flipWinding, uRep, vRep) {
        const rows = gridPts.length - 1, cols = gridPts[0].length - 1;
        const positions = [], uvs = [], indices = [];
        for (let r = 0; r <= rows; r++) {
            const v = (r / rows) * (vRep || 1);
            for (let c = 0; c <= cols; c++) {
                const u = (c / cols) * (uRep || 1);
                const pt = gridPts[r][c];
                positions.push(pt.x, pt.y, pt.z);
                uvs.push(u, 1 - v);
            }
        }
        const stride = cols + 1;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const i0 = r * stride + c, i1 = i0 + 1, i2 = (r + 1) * stride + c, i3 = i2 + 1;
                if (flipWinding) { indices.push(i0, i1, i2, i1, i3, i2); }
                else { indices.push(i0, i2, i1, i1, i2, i3); }
            }
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        geo.setIndex(indices);
        geo.computeVertexNormals();
        const m = new THREE.Mesh(geo, mat);
        m.castShadow = true; m.receiveShadow = true;
        return m;
    }
    function clTendaTemplate(THREE, L, accentHex) {
        const T = clColTexPool(THREE);
        const g = new THREE.Group();
        const variant = L >= 3 ? 'pavilhao' : (L === 2 ? 'couro' : 'explorador');
        const isLeather = variant === 'couro', isPavilion = variant === 'pavilhao';
        const M = {
            canvas: clGMeshMat(THREE, { map: isLeather ? T.fur : T.canvas, color: isLeather ? 0xa37552 : new THREE.Color(accentHex).lerp(new THREE.Color(0xffffff), 0.18), side: THREE.DoubleSide }),
            trim: clGMeshMat(THREE, { color: isLeather ? 0x5c361e : new THREE.Color(accentHex).multiplyScalar(0.75), side: THREE.DoubleSide }),
            wood: clGMeshMat(THREE, { map: T.wood, color: 0x6f4324 }),
            brass: clGMeshMat(THREE, { color: 0xe6b44c, emissive: 0x3b2604, emissiveIntensity: 0.2 }),
            rope: clGMeshMat(THREE, { color: 0xc2a378 }),
            leather: clGMeshMat(THREE, { color: 0x4f2e18 }),
            dirt: clGMeshMat(THREE, { map: T.dirt, color: 0xffffff }),
            rug: clGMeshMat(THREE, { map: T.rug, color: 0xffffff }),
            blanket: clGMeshMat(THREE, { color: new THREE.Color(accentHex) }),
            pillow: clGMeshMat(THREE, { color: 0xfef3c7 }),
            lantern: clGMeshMat(THREE, { color: 0xffe49e, emissive: 0xffaa2b, emissiveIntensity: 1.6 }),
            iron: clGMeshMat(THREE, { color: 0x334155 }),
            pebble: clGMeshMat(THREE, { color: 0x8b95a3 })
        };
        const add = (geo, mat, x, y, z, rx, ry, rz) => {
            const m = new THREE.Mesh(geo, mat);
            m.position.set(x || 0, y || 0, z || 0);
            if (rx) m.rotation.x = rx; if (ry) m.rotation.y = ry; if (rz) m.rotation.z = rz;
            m.castShadow = true; m.receiveShadow = true; g.add(m); return m;
        };
        const addPole = (pA, pB, rB, rT, finial) => {
            const dir = new THREE.Vector3().subVectors(pB, pA), len = dir.length();
            const cyl = new THREE.Mesh(new THREE.CylinderGeometry(rT, rB, len, 8), M.wood);
            cyl.position.copy(pA).addScaledVector(dir, 0.5);
            cyl.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
            cyl.castShadow = true; g.add(cyl);
            if (finial) add(new THREE.SphereGeometry(rT * 1.45, 7, 6), M.brass, pB.x, pB.y + rT, pB.z);
        };
        const addRopeStake = (anc, stk) => {
            const dir = new THREE.Vector3().subVectors(stk, anc), len = dir.length();
            const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, len, 5), M.rope);
            rope.position.copy(anc).addScaledVector(dir, 0.5);
            rope.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
            g.add(rope);
            const stake = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.018, 0.22, 6), M.wood);
            stake.position.set(stk.x, 0.08, stk.z); stake.rotation.z = stk.x >= 0 ? -0.32 : 0.32; stake.castShadow = true; g.add(stake);
            add(new THREE.SphereGeometry(0.04, 5, 4), M.pebble, stk.x + (stk.x >= 0 ? -0.05 : 0.05), 0.025, stk.z);
        };

        // Base circular de terra batida
        add(new THREE.CylinderGeometry(1.76, 1.82, 0.03, 24), M.dirt, 0, 0.015, 0);

        // Interior visível: tapete tecido, caminha, baú reforçado e lanterna pendente quente
        add(new THREE.BoxGeometry(1.18, 0.02, 1.48), M.rug, 0, 0.04, 0.06);
        add(new THREE.BoxGeometry(0.56, 0.16, 1.02), M.wood, -0.34, 0.12, -0.14);
        add(new THREE.BoxGeometry(0.50, 0.09, 0.94), M.blanket, -0.34, 0.23, -0.14);
        add(new THREE.BoxGeometry(0.38, 0.07, 0.22), M.pillow, -0.34, 0.29, -0.46);
        add(new THREE.BoxGeometry(0.42, 0.24, 0.28), M.wood, 0.34, 0.15, -0.32, 0, -0.25, 0);
        add(new THREE.BoxGeometry(0.44, 0.06, 0.30), M.leather, 0.34, 0.27, -0.32, 0, -0.25, 0);
        add(new THREE.BoxGeometry(0.07, 0.07, 0.03), M.brass, 0.30, 0.22, -0.18, 0, -0.25, 0);

        if (isPavilion) {
            const sT = 20, sR = 8, sW = 6, R_e = 1.24, R_b = 1.42, H_p = 2.24, H_e = 1.08, doorA = 0.46;
            const cGrid = [];
            for (let j = 0; j <= sR; j++) {
                const v = j / sR, row = [];
                for (let i = 0; i <= sT; i++) {
                    const th = (i / sT) * Math.PI * 2;
                    const r = R_e * v;
                    const sag = -0.11 * Math.sin(v * Math.PI) * (0.65 + 0.35 * Math.cos(th * 8));
                    row.push(new THREE.Vector3(Math.sin(th) * r, H_p + (H_e - H_p) * v + sag, Math.cos(th) * r));
                }
                cGrid.push(row);
            }
            g.add(clTendaLoftedMesh(THREE, cGrid, M.canvas, true, 3.0, 1.0));
            const wGrid = [];
            for (let j = 0; j <= sW; j++) {
                const v = j / sW, row = [];
                for (let i = 0; i <= sT; i++) {
                    const th = doorA + (i / sT) * (Math.PI * 2 - doorA * 2);
                    const r = R_e + (R_b - R_e) * v + 0.025 * Math.sin(th * 20) * Math.sin(v * Math.PI);
                    row.push(new THREE.Vector3(Math.sin(th) * r, H_e * (1 - v), Math.cos(th) * r));
                }
                wGrid.push(row);
            }
            g.add(clTendaLoftedMesh(THREE, wGrid, M.canvas, true, 3.0, 0.8));
            addPole(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, H_p + 0.22, 0), 0.065, 0.048, true);
            for (let k = 0; k < 8; k++) {
                const th = (k / 8) * Math.PI * 2;
                if (k === 0) continue;
                const px = Math.sin(th) * (R_e - 0.02), pz = Math.cos(th) * (R_e - 0.02);
                addPole(new THREE.Vector3(px * 1.02, 0, pz * 1.02), new THREE.Vector3(px, H_e + 0.12, pz), 0.036, 0.028, true);
                addRopeStake(new THREE.Vector3(Math.sin(th) * R_e, H_e, Math.cos(th) * R_e),
                    new THREE.Vector3(Math.sin(th) * (R_b + 0.38), 0, Math.cos(th) * (R_b + 0.38)));
            }
            add(new THREE.CylinderGeometry(0.055, 0.065, 0.14, 6), M.lantern, 0, 1.24, 0.44);
            add(new THREE.ConeGeometry(0.085, 0.07, 6), M.iron, 0, 1.34, 0.44);
        } else {
            const halfL = isLeather ? 1.28 : 1.36, eW = isLeather ? 0.96 : 1.04, hW = isLeather ? 1.24 : 1.30;
            const pH = isLeather ? 1.96 : 2.08, eH = isLeather ? 0.62 : 0.68, segZ = 16, segS = 10, segW = 6;
            const ridgeY = u => pH - 0.11 * Math.sin(u * Math.PI), eaveY = u => eH - 0.05 * Math.sin(u * Math.PI);
            [-1, 1].forEach(side => {
                const rg = [];
                for (let j = 0; j <= segS; j++) {
                    const v = j / segS, row = [];
                    for (let i = 0; i <= segZ; i++) {
                        const u = i / segZ, z = -halfL + u * 2 * halfL;
                        const sag = -0.10 * Math.sin(v * Math.PI) * (0.55 + 0.45 * Math.sin(u * Math.PI));
                        const fold = 0.02 * Math.sin(u * Math.PI * 6) * Math.sin(v * Math.PI);
                        row.push(new THREE.Vector3(side * (0.02 + (eW - 0.02) * v), ridgeY(u) + (eaveY(u) - ridgeY(u)) * v + sag + fold, z));
                    }
                    rg.push(row);
                }
                g.add(clTendaLoftedMesh(THREE, rg, M.canvas, side > 0, 1.2, 0.72));
                const wg = [];
                for (let j = 0; j <= segW; j++) {
                    const v = j / segW, row = [];
                    for (let i = 0; i <= segZ; i++) {
                        const u = i / segZ, z = -halfL + u * 2 * halfL;
                        const pleat = 0.028 * Math.sin(u * Math.PI * 6) * Math.sin(v * Math.PI);
                        const hem = v > 0.85 ? 0.024 * Math.abs(Math.sin(u * Math.PI * 6)) * ((v - 0.85) / 0.15) : 0;
                        row.push(new THREE.Vector3(side * (eW + (hW - eW) * v + pleat), eaveY(u) * (1 - v) + hem, z));
                    }
                    wg.push(row);
                }
                g.add(clTendaLoftedMesh(THREE, wg, M.canvas, side > 0, 1.2, 0.35));
            });
            // Parede traseira fechada
            const bg = [];
            for (let j = 0; j <= 8; j++) {
                const v = j / 8, row = [];
                for (let i = 0; i <= 12; i++) {
                    const u = (i / 12) * 2 - 1;
                    const maxW = (hW * 0.98) * (0.28 + 0.72 * Math.sin(v * Math.PI * 0.5));
                    row.push(new THREE.Vector3(u * maxW, pH * (1 - v), -halfL - 0.05 * Math.sin(v * Math.PI)));
                }
                bg.push(row);
            }
            g.add(clTendaLoftedMesh(THREE, bg, M.canvas, false, 1.0, 1.0));
            // Cortinas frontais enroladas e presas com tiras de couro
            [-1, 1].forEach(side => {
                add(new THREE.CylinderGeometry(0.085, 0.11, 1.48, 8), M.trim, side * 0.62, 0.78, halfL + 0.02, 0, 0, side * 0.38);
                add(new THREE.TorusGeometry(0.11, 0.018, 6, 12), M.leather, side * 0.56, 0.88, halfL + 0.02, Math.PI / 2, 0, 0);
            });
            // Mastros esculpidos + cumeeira + lanterna pendente na entrada
            addPole(new THREE.Vector3(0, 0, halfL), new THREE.Vector3(0, pH + 0.20, halfL), 0.055, 0.04, true);
            addPole(new THREE.Vector3(0, 0, -halfL), new THREE.Vector3(0, pH + 0.20, -halfL), 0.055, 0.04, true);
            addPole(new THREE.Vector3(0, pH - 0.02, -halfL - 0.06), new THREE.Vector3(0, pH - 0.02, halfL + 0.08), 0.036, 0.036, false);
            add(new THREE.CylinderGeometry(0.05, 0.06, 0.13, 6), M.lantern, 0, pH - 0.36, halfL - 0.08);
            add(new THREE.ConeGeometry(0.08, 0.06, 6), M.iron, 0, pH - 0.27, halfL - 0.08);
            add(new THREE.CylinderGeometry(0.008, 0.008, 0.24, 5), M.iron, 0, pH - 0.14, halfL - 0.08);
            // Cordas e estacas nos 4 cantos (cabem em 2x2)
            [-1, 1].forEach(sx => [-1, 1].forEach(sz => {
                addRopeStake(new THREE.Vector3(sx * eW, eH, sz * (halfL * 0.72)),
                    new THREE.Vector3(sx * 1.72, 0, sz * 1.48));
            }));
        }
        return clMergeByMat(g, THREE);
    }
    function clTendaBuild(grp, cv, level) {
        const THREE = clTh(); if (!THREE || !grp) return;
        const L = Math.max(1, level | 0);
        const pal = (cv > 0 && typeof CLD !== 'undefined' && CLD.PAL && CLD.PAL[cv - 1]) ? CLD.PAL[cv - 1] : null;
        const accentHex = pal ? pal[1] : '#d96b38';
        const key = L + '_' + accentHex;
        const store = CLM._tendaTpl || (CLM._tendaTpl = {});
        const tpl = store[key] || (store[key] = clTendaTemplate(THREE, L, accentHex));
        const inst = tpl.clone();
        inst.scale.setScalar(0.50);
        grp.add(inst);
    }
    function clTendaAssemble(grp, lv, cv) { clTendaBuild(grp, cv | 0, lv || 1); }

    const CLM_CUSTOM_HANDLERS = {
        mina: { preload: clMinaPreload, assemble: clMinaAssemble, req: 'space_gold_mine_top2.glb', files: CLM_MINA_FILES, scale: 1.0 },
        fazenda: { preload: clFazendaPreload, assemble: clFazendaAssemble, req: 'farm_building.glb', files: CLM_FAZENDA_FILES , scale: 1.0 },
        forja: { preload: clForjaPreload, assemble: clForjaAssemble, req: 'blacksmiths_forge.glb', files: CLM_FORJA_FILES, scale: 1.0 },
        armazem: { preload: clArmazemPreload, assemble: clArmazemAssemble, req: 'fp_crate_single.glb', files: CLM_ARMAZEM_FILES , scale: 1.0 },
        moinho: { preload: clMoinhoPreload, assemble: clMoinhoAssemble, req: 'windmill_stylized.glb', files: CLM_MOINHO_FILES , scale: 2.0 },
        cabana: { preload: clCabanaPreload, assemble: clCabanaAssemble, req: 'fp_crate_single.glb', files: CLM_CABANA_FILES , scale: 1.0 },
        cabana_bruxa: { preload: clCabanaBruxaPreload, assemble: clCabanaBruxaAssemble, req: 'witch_house.glb', files: CLM_CABANA_BRUXA_FILES, scale: 1.0 },
        casa: { preload: clCasaPreload, assemble: clCasaAssemble, req: 'fp_crate_single.glb', files: CLM_CASA_FILES , scale: 1.0 },
        estufa: { preload: clEstufaPreload, assemble: clEstufaAssemble, req: 'fp_greenhouse_l1.glb', files: CLM_ESTUFA_FILES , scale: 1.0 },
        silo: { preload: clSiloPreload, assemble: clSiloAssemble, req: 'fp_silo_l1.glb', files: CLM_SILO_FILES , scale: 1.0 },
        sobrado: { preload: clSobradoPreload, assemble: clSobradoAssemble, req: 'cartoon_building.glb', files: CLM_SOBRADO_FILES , scale: 1.0 },
        chale: { preload: clChalePreload, assemble: clChaleAssemble, req: 'chale.glb', files: CLM_CHALE_FILES , scale: 1.0 },
        banco: { preload: clBancoPreload, assemble: clBancoAssemble, req: 'bench.glb', files: CLM_BANCO_FILES, scale: 1.0 },
        arco: { preload: clArcoPreload, assemble: clArcoAssemble, req: 'fp_crate_single.glb', files: CLM_ARCO_FILES, scale: 1.0 },
        arco_jardim: { preload: () => {}, assemble: clArchFloridoAssemble, req: '', files: [], scale: 1.0 },
        escola: { preload: () => {}, assemble: clEscolaAssemble, req: '', files: [], scale: 1.0 },
        tenda: { preload: () => {}, assemble: clTendaAssemble, req: '', files: [], scale: 1.0 },
        tabuas: { preload: clTabuasPreload, assemble: clTabuasAssemble, req: 'fp_crate_single.glb', files: CLM_TABUAS_FILES, scale: 1.0 },
        porto: { preload: clPortoPreload2, assemble: clPortoAssemble, req: 'fp_crate_single.glb', files: ['fp_crate_single.glb'], scale: 1.4 },
        torre_vigia: { preload: clTorreVigiaPreload, assemble: clTorreVigiaAssemble, req: 'watchtower_l1.glb', files: CLM_TORRE_FILES , scale: 1.0 },
        praca: { preload: clPracaPreload, assemble: clPracaAssemble, req: 'praca_gazebo.glb', files: CLM_PRACA_FILES , scale: 1.0 },
        gerador: { preload: clGeradorPreload, assemble: clGeradorAssemble, req: 'generator.glb', files: CLM_GERADOR_FILES, scale: 1.0 },
        bateria: { preload: clBateriaPreload, assemble: clBateriaAssemble, req: 'fp_crate_single.glb', files: CLM_BATERIA_FILES, scale: 1.0 },
        biblioteca: { preload: clBibliotecaPreload, assemble: clBibliotecaAssemble, req: 'fp_crate_single.glb', files: CLM_BIBLIO_FILES, scale: 1.0 }
    };
    window.clArchFloridoAssemble = clArchFloridoAssemble;
    window.clEscolaAssemble = clEscolaAssemble;
    window.clTendaAssemble = clTendaAssemble;
    window.CLM_CUSTOM_HANDLERS = CLM_CUSTOM_HANDLERS;
    window.clMinaAssemble = clMinaAssemble;
    window.clFazendaAssemble = clFazendaAssemble;
    window.clForjaAssemble = clForjaAssemble;
    window.clArmazemAssemble = clArmazemAssemble;
    window.clMoinhoAssemble = clMoinhoAssemble;
    window.clCabanaAssemble = clCabanaAssemble;
    window.clCabanaBruxaAssemble = clCabanaBruxaAssemble;
    window.clCasaAssemble = clCasaAssemble;
    window.clEstufaAssemble = clEstufaAssemble;
    window.clSiloAssemble = clSiloAssemble;
    window.clSobradoAssemble = clSobradoAssemble;
    window.clChaleAssemble = clChaleAssemble;
    window.clBibliotecaAssemble = clBibliotecaAssemble;
    window.clBancoAssemble = clBancoAssemble;
    window.clArcoAssemble = clArcoAssemble;
    window.clTabuasAssemble = clTabuasAssemble;
    window.clPortoAssemble = clPortoAssemble;
    window.clTorreVigiaAssemble = clTorreVigiaAssemble;
    window.clPracaAssemble = clPracaAssemble;
    window.clGeradorAssemble = clGeradorAssemble;
    window.CLM_GERADOR_FILES = CLM_GERADOR_FILES;
    window.CLM_BANCO_FILES = CLM_BANCO_FILES;
    window.CLM_ARCO_FILES = CLM_ARCO_FILES;
    window.CLM_TABUAS_FILES = CLM_TABUAS_FILES;
    window.clPracaAssemble = clPracaAssemble;
    window.CLM_PORTO_FILES = CLM_PORTO_FILES;
    window.CLM_TORRE_FILES = CLM_TORRE_FILES;
    window.CLM_PRACA_FILES = CLM_PRACA_FILES;
    window.CLM_MINA_FILES = CLM_MINA_FILES;
    window.CLM_FAZENDA_FILES = CLM_FAZENDA_FILES;
    window.CLM_FORJA_FILES = CLM_FORJA_FILES;
    window.CLM_ARMAZEM_FILES = CLM_ARMAZEM_FILES;
    window.CLM_MOINHO_FILES = CLM_MOINHO_FILES;
    window.CLM_CABANA_FILES = CLM_CABANA_FILES;
    window.CLM_CASA_FILES = CLM_CASA_FILES;
    window.CLM_ESTUFA_FILES = CLM_ESTUFA_FILES;
    window.CLM_SILO_FILES = CLM_SILO_FILES;
    window.CLM_SOBRADO_FILES = CLM_SOBRADO_FILES;
    window.CLM_CHALE_FILES = CLM_CHALE_FILES;
    window.CLM_BIBLIO_FILES = CLM_BIBLIO_FILES;

    /* chamado pela reconstrução das peças: desenha as instâncias com o modelo, ou devolve false para valer a peça simples */
    function clModelUse(id, cv, ix, s, mtx, lv) {
        if (!ix || !ix.length) return false;
        const THREE = clTh(); if (!THREE) return false;

        if (id === 'banco') return false;   /* o banco original (feito em código) permanece no lugar do modelo 3D; cerca usa autotiling procedural próprio */
        // 1. Cerca com autotiling inteligente
        if (id === 'cerca') {
            return clCercaAssembleAll(cv, ix, s, mtx, lv);
        }

        // 2. Construções com progressão GLB personalizada
        const cdef = CLM_CUSTOM_HANDLERS[id];
        if (cdef) {
            cdef.preload();
            if (cdef.req && !CLM.tpl[cdef.req]) return false; // aguarda o modelo primário carregar; enquanto isso usa o procedural
            if (CLM.scene !== CL3.sc) { clModelFree(); CLM.scene = CL3.sc; }
            ix.forEach(pi => {
                const p = s.pcs[pi];
                clMatrixFor(p, mtx);
                const grp = new THREE.Group();
                const pieceCv = (p[5] !== undefined ? (p[5] | 0) : (cv | 0));
                grp.userData = { cv: pieceCv, lv: lv || p[4] || 1, id, pi };
                mtx.decompose(grp.position, grp.quaternion, grp.scale);
                const sc = (cdef && cdef.scale != null) ? cdef.scale : 1.0;
                grp.scale.multiplyScalar(sc);
                cdef.assemble(grp, lv || p[4] || 1, pieceCv);
                clPmap(pi).grps.push({ g: grp, bs: grp.scale.clone() });
                CL3.grp.add(grp);
                CL3.inst.push(grp);
            });
            return true;
        }

        // 3. Outras construções de modelo único (CLM_DEF)
        const def = CLM_DEF[id]; if (!def) return false; const T = CLM.tpl[def.f]; if (!T) { clModelLoad(def.f); return false; }
        if (CLM.scene !== CL3.sc) { clModelFree(); CLM.scene = CL3.sc; }
        if (def.roam) {
            ix.forEach(pi => {
                const p = s.pcs[pi], t = CLT[id], f = clFp(t, p[3]), cx = p[1] + f[0] / 2, cz = p[2] + f[1] / 2 + 0.2, key = id + ':' + p[1] + ':' + p[2], old = CLM.rp[key] || (CLM.rp[key] = { x: cx, z: cz, yaw: 0 });
                const root = def.skin ? THREE.SkeletonUtils.clone(T.gl.scene) : T.gl.scene.clone(true), g = new THREE.Group();
                root.traverse(o => { if (o.isMesh) { const mm = Array.isArray(o.material) ? o.material[0] : o.material; o.material = def.skin ? mm : clModelMats(def, o, cv, id); o.castShadow = true; o.receiveShadow = true; if (o.geometry && !o.geometry.boundingSphere) o.geometry.computeBoundingSphere(); o.frustumCulled = true; } }); g.add(root); g.scale.setScalar(def.roam.sc); g.position.set(old.x, 0, old.z); g.rotation.y = old.yaw; CL3.grp.add(grp); CL3.inst.push(grp); clPmap(pi).grps.push({ g, bs: g.scale.clone() });
                let mx = null; if (def.skin && T.gl.animations.length) { mx = new THREE.AnimationMixer(root); mx.clipAction(T.gl.animations[0]).play(); }
                CLM.roam.push({ pi, g, mx, key, x: old.x, z: old.z, yaw: old.yaw, hx: cx, hz: cz, tx: 0, tz: 0, has: false, wait: Math.random() * 2, def: def.roam, ph: Math.random() * 6 });
            });
            return true;
        }
        if (def.skin || def.spin) {
            ix.forEach(pi => { const p = s.pcs[pi]; clMatrixFor(p, mtx); const grp = new THREE.Group(); mtx.decompose(grp.position, grp.quaternion, grp.scale); const base = grp.position.clone(); const root = def.skin ? THREE.SkeletonUtils.clone(T.gl.scene) : T.gl.scene.clone(true);
                root.traverse(o => { if (o.isMesh) { const m = Array.isArray(o.material) ? o.material[0] : o.material; o.material = def.skin ? m : clModelMats(def, o, cv, id); o.castShadow = true; o.receiveShadow = true; if (o.geometry && !o.geometry.boundingSphere) o.geometry.computeBoundingSphere(); o.frustumCulled = true; } }); grp.add(root); grp.position.y += def.lift || 0; clPmap(pi).grps.push({ g: grp, bs: grp.scale.clone() }); CL3.grp.add(grp); CL3.inst.push(grp);
                if (def.skin && T.gl.animations.length) { const mx = new THREE.AnimationMixer(root); mx.clipAction(T.gl.animations[0]).play(); CLM.anim.push({ mx, off: Math.random() * 3 }); }
                if (def.spin) CLM.spin.push({ g: grp, root, sp: def.spin * (0.8 + Math.random() * 0.4) }); });
            return true;
        }
        T.ms.forEach(m => { const mat = clModelMats(def, m, cv, id), im = new THREE.InstancedMesh(m.geometry, mat, ix.length); ix.forEach((pi, j) => { clMatrixFor(s.pcs[pi], mtx); if (def.lift) mtx.elements[13] += def.lift; im.setMatrixAt(j, mtx); clPmap(pi).ims.push({ im, j, m: mtx.clone() }); }); im.instanceMatrix.needsUpdate = true; im.frustumCulled = false; im.castShadow = !(mat.transparent); im.receiveShadow = true; if (mat.transparent) im.renderOrder = 3; CL3.grp.add(im); CL3.inst.push(im); });
        return true;
    }

    function clModelStep(dt, t) {
        if (!CL3.sc) return; if (CLM.scene !== CL3.sc) { clModelFree(); CLM.scene = CL3.sc; } const n = CL3.dayN || 0;
        CLM.mats.forEach(o => { if (o.basic) o.mt.color.copy(o.base).multiplyScalar(1 + n * 1.0 + 0.08 * Math.sin(t * 3 + o.base.r * 9)); else o.mt.emissiveIntensity = o.ei * (0.55 + 1.1 * n); });
        CLM.spin.forEach(o => { const ax = o.axis || 'y'; o.root.rotation[ax] += dt * o.sp; }); CLM.anim.forEach(o => o.mx.update(dt)); clModelRoam(dt, t);
        clModelCreatures(dt, t);
        try { clArcoJardimStep(dt, t); } catch (e) {}
        clColonoStep(dt, t);
        clWeatherStep(dt, t);
        clInteractiveEventsStep(dt, t);
    }
    function clModelCreatures(dt, t) {
        const sc = CL3.sc; if (!sc) return;
        try { clFishStep(dt, t); } catch (e) {}   /* os peixes pulam do mar (36ji-colony-fish.js) */
        if (clEvActive('halloween')) {
            if (!CLM.batTried) { CLM.batTried = 1; clModelLoad('morcego.glb'); }
            const BT = CLM.tpl['morcego.glb']; if (BT && !CLM.bats) { CLM.bats = []; CL3.hwBatM.forEach(im => { sc.remove(im); }); CL3.hwBatM = []; for (let i = 0; i < (CL3.lowq || CL_TOUCH() ? 4 : 8); i++) { const root = THREE.SkeletonUtils.clone(BT.gl.scene), g = new THREE.Group(), mx = new THREE.AnimationMixer(root); mx.clipAction(BT.gl.animations[0]).play(); mx.timeScale = 1.3 + Math.random() * 0.6; root.traverse(o => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; } }); g.add(root); g.scale.setScalar(0.55 + Math.random() * 0.25); sc.add(g); CLM.bats.push({ g, mx, a: Math.random() * 6.28, r: 12 + Math.random() * 12, y: 3.5 + Math.random() * 2.5, sp: 0.5 + Math.random() * 0.4, ph: Math.random() * 6 }); } }
            if (CLM.bats) { const m = CLM.bm || (CLM.bm = new THREE.Matrix4()), p = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3(1, 1, 1); CLM.bats.forEach(b => { b.a += dt * b.sp * 0.35; b.g.position.set(Math.cos(b.a) * b.r, b.y + Math.sin(t * 3 + b.ph) * 0.6, Math.sin(b.a) * b.r); b.g.rotation.y = Math.atan2(-Math.sin(b.a), Math.cos(b.a)); b.mx.update(dt); }); }
        } else if (CLM.bats) { CLM.bats.forEach(b => sc.remove(b.g)); CLM.bats = null; CLM.batTried = 0; }
    }


    /* =========================================================================
       13. MORADORES ESQUELÉTICOS ESTILIZADOS COM TRAJES E FUNÇÕES
       ========================================================================= */
    function clColonoFree() {
        if (CLM.colonos && CLM.colonos.length) {
            CLM.colonos.forEach(c => { if (c.g && c.g.parent) c.g.parent.remove(c.g); });
        }
        CLM.colonos = [];
    }
    function clColonoEnsure(sc) {
        if (CLM.colonos && CLM.colonos.length) clColonoFree();
    }
    function clColonoStep(dt, t) {
        if (CLM.colonos && CLM.colonos.length) clColonoFree();
    }

    /* =========================================================================
       14. SISTEMA DE CLIMA E ATMOSFERA (Chuva +20% Biomassa, Bruma, Neve)
       ========================================================================= */
    const CL_WEATHER_TYPES = ['clear', 'rain', 'fog', 'snow'];
    window.CL_WEATHER = window.CL_WEATHER || { type: 'clear', t: 0, dur: 240, pSystem: null, pType: '' };
    window.CL_WEATHER_BUFF = null;

    function clWeatherFree() {
        if (window.CL_WEATHER && window.CL_WEATHER.pSystem) {
            if (window.CL_WEATHER.pSystem.parent) window.CL_WEATHER.pSystem.parent.remove(window.CL_WEATHER.pSystem);
            window.CL_WEATHER.pSystem = null;
            window.CL_WEATHER.pType = '';
        }
    }

    function clWeatherEnsureParticles(type) {
        const sc = CL3.sc; if (!sc) return;
        const THREE = clTh(); if (!THREE) return;
        const W = window.CL_WEATHER;

        if (W.pType === type && W.pSystem) return;
        clWeatherFree();
        W.pType = type;

        if (type === 'clear') return;

        const count = type === 'rain' ? 500 : type === 'snow' ? 400 : 250;
        const geom = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const H = (clS() && clS().H) || 16;
        const span = H * 1.8;

        for (let i = 0; i < count; i++) {
            positions[i * 3 + 0] = (Math.random() * 2 - 1) * span;
            positions[i * 3 + 1] = type === 'fog' ? 0.2 + Math.random() * 1.2 : Math.random() * 16;
            positions[i * 3 + 2] = (Math.random() * 2 - 1) * span;
        }
        geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        let mat;
        if (type === 'rain') {
            mat = new THREE.PointsMaterial({ color: 0x82caff, size: 0.16, transparent: true, opacity: 0.65, depthWrite: false });
        } else if (type === 'snow') {
            mat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.22, transparent: true, opacity: 0.85, depthWrite: false, map: (typeof zSoftTex === 'function' ? zSoftTex() : null) });   /* bolinhas macias em vez de quadradinhos */
        } else { // fog
            mat = new THREE.PointsMaterial({ color: 0xd4e5f7, size: 1.6, transparent: true, opacity: 0.12, depthWrite: false, map: (typeof zSoftTex === 'function' ? zSoftTex() : null) });   /* bruma em borrões macios, não em quadrados claros */
        }

        const pts = new THREE.Points(geom, mat);
        sc.add(pts);
        W.pSystem = pts;
    }

    function clWeatherStep(dt, t) {
        const W = window.CL_WEATHER;
        W.t += dt;
        if (W.t >= W.dur) {
            W.t = 0;
            // Roll next weather: 50% clear, 25% rain, 15% fog, 10% snow
            const r = Math.random();
            const nextType = r < 0.50 ? 'clear' : r < 0.75 ? 'rain' : r < 0.90 ? 'fog' : 'snow';
            W.type = nextType;
            W.dur = nextType === 'clear' ? 240 + Math.random() * 120 : 150 + Math.random() * 90;

            // Apply weather buffs
            if (nextType === 'rain') {
                window.CL_WEATHER_BUFF = { b: 0.20 }; // +20% Biomassa
                try { if (typeof clUiToast === 'function') clUiToast('🌧️ Uma chuva suave cai sobre a colônia! (+20% Biomassa)'); } catch(e){}
            } else {
                window.CL_WEATHER_BUFF = null;
            }
            if (CL && CL.ver != null) CL.ver++;
        }

        clWeatherEnsureParticles(W.type);

        if (W.pSystem) {
            const attr = W.pSystem.geometry.attributes.position;
            const arr = attr.array;
            const H = (clS() && clS().H) || 16;
            const span = H * 1.8;

            if (W.type === 'rain') {
                for (let i = 0; i < arr.length; i += 3) {
                    arr[i + 1] -= dt * 18.0;
                    if (arr[i + 1] < 0) arr[i + 1] = 16.0;
                }
            } else if (W.type === 'snow') {
                for (let i = 0; i < arr.length; i += 3) {
                    arr[i + 1] -= dt * 2.2;
                    arr[i + 0] += Math.sin(t * 1.5 + i) * dt * 0.4;
                    if (arr[i + 1] < 0) arr[i + 1] = 15.0;
                }
            } else if (W.type === 'fog') {
                for (let i = 0; i < arr.length; i += 3) {
                    arr[i + 0] += dt * 0.35;
                    if (arr[i + 0] > span) arr[i + 0] = -span;
                }
            }
            attr.needsUpdate = true;
        }
    }

    /* =========================================================================
       15. EVENTOS INTERATIVOS DINÂMICOS (Supply Drop, Geodos Noturnos, Nave Mercante)
       ========================================================================= */
    CLM.events = {
        supplyDrop: { active: false, g: null, x: 0, y: 15, z: 0, targetY: 0.08, timer: 60 },
        geode: { active: false, g: null, x: 0, z: 0 },
        shuttle: { active: false, g: null, state: 'away', t: 0, timer: 120, x: 0, z: 0 }
    };

    function clInteractiveEventsFree() {
        const ev = CLM.events;
        if (ev.supplyDrop && ev.supplyDrop.g && ev.supplyDrop.g.parent) {
            ev.supplyDrop.g.parent.remove(ev.supplyDrop.g);
            ev.supplyDrop.g = null; ev.supplyDrop.active = false;
        }
        if (ev.geode && ev.geode.g && ev.geode.g.parent) {
            ev.geode.g.parent.remove(ev.geode.g);
            ev.geode.g = null; ev.geode.active = false;
        }
        if (ev.shuttle && ev.shuttle.g && ev.shuttle.g.parent) {
            ev.shuttle.g.parent.remove(ev.shuttle.g);
            ev.shuttle.g = null; ev.shuttle.active = false;
        }
    }

    /* os eventos do céu (cápsula, meteoro, nave) esperam de verdade (horas): o relógio fica guardado na colônia e NÃO recomeça ao abrir o jogo */
    function clEvTimes(s) { if (!s.evt || typeof s.evt !== 'object') { const n = Date.now(); s.evt = { d: n + 40 * 60000, n: n + 120 * 60000, g: n + 60 * 60000 }; } return s.evt; }
    function clInteractiveEventsStep(dt, t) {
        const sc = CL3.sc; if (!sc) return;
        const THREE = clTh(); if (!THREE) return;
        const s = clS(); if (!s) return;
        const H = s.H || 16;
        const ev = CLM.events;

        // 1. CÁPSULA DE SUPRIMENTOS (SUPPLY DROP)
        clModelLoad('supply_crate.glb');
        if (!ev.supplyDrop.active) {
            const E0 = clEvTimes(s); ev.supplyDrop.timer = Math.max(0, (E0.d - Date.now()) / 1000);
            if (Date.now() >= E0.d) {
                E0.d = Date.now() + (60 + Math.random() * 60) * 60000;   /* uma cápsula a cada 1 a 2 horas */
                const tpl = CLM.tpl['supply_crate.glb'];
                if (tpl && tpl.gl) {
                    // Pick a random free tile
                    let tx = 0, tz = 0, found = false;
                    for (let i = 0; i < 20; i++) {
                        const rx = Math.floor((Math.random() * 2 - 1) * (H - 3));
                        const rz = Math.floor((Math.random() * 2 - 1) * (H - 3));
                        if (clRoamFree(s, rx, rz, -999)) {
                            tx = rx + 0.5; tz = rz + 0.5; found = true; break;
                        }
                    }
                    if (found) {
                        const root = tpl.gl.scene.clone(true);
                        root.traverse(o => {
                            if (o.isMesh) {
                                o.castShadow = true; o.receiveShadow = true;
                                if (o.material) {
                                    o.material = o.material.clone();
                                    o.material.emissive = new THREE.Color(0x00e5ff);
                                    o.material.emissiveIntensity = 0.5;
                                }
                            }
                        });
                        const grp = new THREE.Group();
                        grp.add(root);
                        grp.scale.setScalar(0.75);
                        grp.position.set(tx, 14.0, tz);
                        sc.add(grp);

                        ev.supplyDrop.active = true;
                        ev.supplyDrop.g = grp;
                        ev.supplyDrop.x = tx;
                        ev.supplyDrop.z = tz;
                        ev.supplyDrop.y = 14.0;
                        grp.userData = { isSupplyDrop: true };
                        try { if (typeof clUiToast === 'function') clUiToast('📦 Uma Cápsula de Suprimentos desceu na colônia! Clique para resgatar.'); } catch(e){}
                    }
                }
            }
        } else if (ev.supplyDrop.g) {
            if (ev.supplyDrop.y > ev.supplyDrop.targetY) {
                ev.supplyDrop.y = Math.max(ev.supplyDrop.targetY, ev.supplyDrop.y - dt * 2.8);
                ev.supplyDrop.g.position.y = ev.supplyDrop.y;
                ev.supplyDrop.g.rotation.y += dt * 0.6;
            } else {
                // Landed: soft beacon pulse
                ev.supplyDrop.g.position.y = ev.supplyDrop.targetY + Math.sin(t * 3) * 0.02;
            }
        }

        // 2. CHUVA DE METEOROS E GEODO NOTURNO
        clModelLoad('geode_crystal.glb');
        const isNight = (CL3.dayN || 0) > 0.45;
        if (isNight && !ev.geode.active && Date.now() >= clEvTimes(s).g) {
            const tplG = CLM.tpl['geode_crystal.glb'];
            if (tplG && tplG.gl && Math.random() < 0.02) { // periodic check
                clEvTimes(s).g = Date.now() + (90 + Math.random() * 90) * 60000;   /* um geodo a cada 1,5 a 3 horas, só de noite */
                // Spawn near beach / border
                const ang = Math.random() * 6.28;
                const gx = Math.cos(ang) * (H - 1.5);
                const gz = Math.sin(ang) * (H - 1.5);

                const root = tplG.gl.scene.clone(true);
                root.traverse(o => {
                    if (o.isMesh) {
                        o.castShadow = true;
                        if (o.material) {
                            o.material = o.material.clone();
                            o.material.emissive = new THREE.Color(0xa855f7);
                            o.material.emissiveIntensity = 2.0;
                            o.material.toneMapped = false;
                        }
                    }
                });
                const grp = new THREE.Group();
                grp.add(root);
                grp.scale.setScalar(0.75);
                grp.position.set(gx, 0.08, gz);
                sc.add(grp);

                ev.geode.active = true;
                ev.geode.g = grp;
                ev.geode.x = gx;
                ev.geode.z = gz;
                grp.userData = { isGeode: true };
                try { if (typeof clUiToast === 'function') clUiToast('✨ Um Geodo Estelar caiu na costa da colônia! Clique para abri-lo.'); } catch(e){}
            }
        } else if (ev.geode.active && ev.geode.g) {
            ev.geode.g.rotation.y += dt * 1.2;
            ev.geode.g.position.y = 0.08 + Math.sin(t * 4) * 0.04;
        }

        // 3. NAVE DO MERCADOR ESPACIAL
        clModelLoad('spaceship_shuttle.glb');
        if (!ev.shuttle.active) {
            const E1 = clEvTimes(s); ev.shuttle.timer = Math.max(0, (E1.n - Date.now()) / 1000);
            if (Date.now() >= E1.n) {
                E1.n = Date.now() + (180 + Math.random() * 180) * 60000;   /* a nave do Mercador a cada 3 a 6 horas */
                const tplS = CLM.tpl['spaceship_shuttle.glb'];
                if (tplS && tplS.gl) {
                    const landingX = H - 2.5;
                    const landingZ = -H + 2.5;
                    const root = tplS.gl.scene.clone(true);
                    root.traverse(o => {
                        if (o.isMesh) {
                            o.castShadow = true; o.receiveShadow = true;
                        }
                    });
                    const grp = new THREE.Group();
                    grp.add(root);
                    grp.scale.setScalar(0.25);
                    grp.position.set(landingX - 15, 12, landingZ - 15);
                    sc.add(grp);

                    ev.shuttle.active = true;
                    ev.shuttle.g = grp;
                    ev.shuttle.state = 'landing';
                    ev.shuttle.t = 0;
                    ev.shuttle.x = landingX;
                    ev.shuttle.z = landingZ;
                    grp.userData = { isShuttle: true };
                    try { if (typeof clUiToast === 'function') clUiToast('🚀 O Mercador Espacial pousou na colônia com suprimentos!'); } catch(e){}
                }
            }
        } else if (ev.shuttle.g) {
            ev.shuttle.t += dt;
            if (ev.shuttle.state === 'landing') {
                const p = Math.min(1, ev.shuttle.t / 4.5);
                const curX = (ev.shuttle.x - 15) * (1 - p) + ev.shuttle.x * p;
                const curY = 12 * (1 - p) + 0.15 * p;
                const curZ = (ev.shuttle.z - 15) * (1 - p) + ev.shuttle.z * p;
                ev.shuttle.g.position.set(curX, curY, curZ);
                ev.shuttle.g.rotation.y = 0.785;
                if (p >= 1) ev.shuttle.state = 'docked';
            } else if (ev.shuttle.state === 'departing') {
                const p = Math.min(1, ev.shuttle.t / 4.0);
                const curX = ev.shuttle.x * (1 - p) + (ev.shuttle.x + 20) * p;
                const curY = 0.15 * (1 - p) + 16 * p;
                const curZ = ev.shuttle.z * (1 - p) + (ev.shuttle.z + 20) * p;
                ev.shuttle.g.position.set(curX, curY, curZ);
                if (p >= 1) {
                    if (ev.shuttle.g.parent) ev.shuttle.g.parent.remove(ev.shuttle.g);
                    ev.shuttle.g = null;
                    ev.shuttle.active = false;
                }
            } else {
                // Docked
                ev.shuttle.g.position.y = 0.15 + Math.sin(t * 2) * 0.02;
            }
        }
    }

    /* =========================================================================
       16. CLIQUE / TOQUE EM OBJETOS INTERATIVOS E COLONOS
       ========================================================================= */
    function clTapInteractive(cx, cy, directKind) {
        if (CL.visit) return false;
        const THREE = clTh(); if (!THREE || !CL3.cam || !CL3.cv) return false;
        const r = CL3.cv.getBoundingClientRect();
        const ndc = new THREE.Vector2(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
        const rc = new THREE.Raycaster();
        rc.setFromCamera(ndc, CL3.cam);

        const s = clS();
        const ev = CLM.events;

        // 1. CÁPSULA DE SUPRIMENTOS
        if (ev && ev.supplyDrop && ev.supplyDrop.active && ev.supplyDrop.g) {
            const hits = directKind === 'drop' ? [true] : directKind ? [] : rc.intersectObject(ev.supplyDrop.g, true);
            if (hits && hits.length) {
                // Claim supply drop
                const cGain = 160, bGain = 80, mGain = 40;
                s.res.c = (s.res.c || 0) + cGain;
                s.res.b = (s.res.b || 0) + bGain;
                s.res.m = (s.res.m || 0) + mGain;
                clSave(true);
                try { if (typeof clUiToast === 'function') clUiToast('🎁 Cápsula Resgatada! +' + cGain + '💎 +' + bGain + '🌾 +' + mGain + '⚙️'); } catch(e){}
                if (ev.supplyDrop.g.parent) ev.supplyDrop.g.parent.remove(ev.supplyDrop.g);
                ev.supplyDrop.g = null;
                ev.supplyDrop.active = false;
                if (CL && CL.ver != null) CL.ver++;
                return true;
            }
        }

        // 2. GEODO ESTELAR NOTURNO
        if (ev && ev.geode && ev.geode.active && ev.geode.g) {
            const hits = directKind === 'geode' && ev.geode.hit ? [true] : directKind ? [] : rc.intersectObject(ev.geode.g, true);
            if (hits && hits.length) {
                const cGain = 100;
                s.res.c = (s.res.c || 0) + cGain;
                clSave(true);
                try { if (typeof clUiToast === 'function') clUiToast('✨ Geodo Estelar Aberto! +' + cGain + ' Cristais Raros!'); } catch(e){}
                if (ev.geode.g.parent) ev.geode.g.parent.remove(ev.geode.g);
                ev.geode.g = null;
                ev.geode.active = false;
                if (CL && CL.ver != null) CL.ver++;
                return true;
            }
        }

        // 3. MERCADOR ESPACIAL
        if (ev && ev.shuttle && ev.shuttle.active && ev.shuttle.g && ev.shuttle.state === 'docked') {
            const hits = directKind === 'ship' ? [true] : directKind ? [] : rc.intersectObject(ev.shuttle.g, true);
            if (hits && hits.length) {
                const cGain = 250, bGain = 150, mGain = 100;
                s.res.c = (s.res.c || 0) + cGain;
                s.res.b = (s.res.b || 0) + bGain;
                s.res.m = (s.res.m || 0) + mGain;
                clSave(true);
                try { if (typeof clUiToast === 'function') clUiToast('🚀 Mercador Espacial: Carga transferida! +' + cGain + '💎 +' + bGain + '🌾 +' + mGain + '⚙️'); } catch(e){}
                ev.shuttle.state = 'departing';
                ev.shuttle.t = 0;
                if (CL && CL.ver != null) CL.ver++;
                return true;
            }
        }

        // 4. COLONOS (ALDEÕES)
        if (!directKind && CLM.colonos && CLM.colonos.length) {
            for (let i = 0; i < CLM.colonos.length; i++) {
                const c = CLM.colonos[i];
                if (!c.g) continue;
                const hits = rc.intersectObject(c.g, true);
                if (hits && hits.length) {
                    const quote = c.quotes[Math.floor(Math.random() * c.quotes.length)];
                    const roleTitle = c.role === 'farmer' ? '🌾 Fazendeiro' : c.role === 'worker' ? '🛠️ Trabalhador' : c.role === 'astronaut' ? '🚀 Astronauta' : '🏡 Colono';
                    try { if (typeof clUiToast === 'function') clUiToast(roleTitle + ': "' + quote + '"'); } catch(e){}
                    c.wait = 3.5; // stop and talk
                    return true;
                }
            }
        }

        return false;
    }
    window.clTapInteractive = clTapInteractive;
/* ===== cortex/36jeb-colony-proto.js: os prédios do protótipo aprovado (moinho, taverna, ferraria, celeiro, torre de vigia, cabana) dentro da colônia. As funções vêm do protótipo quase sem mudança; tudo é montado uma vez, junto por material e clonado para cada peça. window.ruaProtoBuild = false volta aos modelos antigos ===== */
    function clProtoKit(THREE) {
        const C = CLM._pk || (CLM._pk = {}); if (C.api) return C.api;
        const rngf = seed => { let sd = seed; return () => (sd = (sd * 16807) % 2147483647) / 2147483647; };
        const mk = (w, h, draw, rx, ry) => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d'), w, h); const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; t.encoding = THREE.sRGBEncoding; t.repeat.set(rx, ry); return t; };
        const rep = (t, rx, ry) => { const c = t.clone(); c.repeat.set(rx, ry); c.needsUpdate = true; return c; };
        const rr = rngf(7);
        const plasterT = mk(256, 256, (g, w, h) => {
            g.fillStyle = '#f6e6cc'; g.fillRect(0, 0, w, h);
            for (let i = 0; i < 260; i++) { g.fillStyle = rr() > 0.5 ? 'rgba(255,248,232,0.22)' : 'rgba(214,176,128,0.16)'; g.beginPath(); g.arc(rr() * w, rr() * h, 3 + rr() * 14, 0, 7); g.fill(); }
            for (let i = 0; i < 700; i++) { g.fillStyle = 'rgba(150,110,70,0.10)'; g.fillRect(rr() * w, rr() * h, 1 + rr() * 2, 1); }
            g.strokeStyle = 'rgba(120,84,50,0.28)'; g.lineWidth = 1;
            for (let i = 0; i < 6; i++) { let x = rr() * w, y = rr() * h * 0.6; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (rr() - 0.5) * 16; y += 4 + rr() * 9; g.lineTo(x, y); } g.stroke(); }
            g.fillStyle = 'rgba(232,196,150,0.35)'; g.fillRect(0, h - 28, w, 28);
            for (let x = 0; x < w; x += 6) { g.fillStyle = 'rgba(130,100,70,0.18)'; g.fillRect(x, h - 28 + rr() * 8, 5, 3 + rr() * 10); }
        }, 1, 1);
        const woodDT = mk(128, 256, (g, w, h) => { g.fillStyle = '#7a4630'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 3) { const n = (y * 17) % 28; g.fillStyle = y % 12 < 2 ? '#5c301c' : '#8a5340'; g.fillRect(0, y, w, 2); g.fillStyle = 'rgba(255,220,180,0.08)'; g.fillRect(8 + n, y, 18, 2); } }, 1, 2);
        const woodHT = mk(128, 256, (g, w, h) => { const r = rngf(33); g.fillStyle = '#b99672'; g.fillRect(0, 0, w, h); for (let i = 0; i < 90; i++) { g.fillStyle = r() > 0.5 ? 'rgba(190,168,132,0.30)' : 'rgba(255,255,255,0.45)'; g.fillRect(r() * w, r() * h, 1 + r() * 2, 6 + r() * 30); } g.fillStyle = 'rgba(150,126,92,0.55)'; for (let x = 0; x < w; x += 42) g.fillRect(x, 0, 2, h); for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(120,96,64,0.18)'; g.beginPath(); g.arc(r() * w, r() * h, 1 + r() * 2, 0, 7); g.fill(); } }, 1, 2);
        const woodWT = mk(128, 256, (g, w, h) => { const r = rngf(33); g.fillStyle = '#f3eadb'; g.fillRect(0, 0, w, h); for (let i = 0; i < 90; i++) { g.fillStyle = r() > 0.5 ? 'rgba(190,168,132,0.30)' : 'rgba(255,255,255,0.45)'; g.fillRect(r() * w, r() * h, 1 + r() * 2, 6 + r() * 30); } g.fillStyle = 'rgba(150,126,92,0.55)'; for (let x = 0; x < w; x += 42) g.fillRect(x, 0, 2, h); for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(120,96,64,0.18)'; g.beginPath(); g.arc(r() * w, r() * h, 1 + r() * 2, 0, 7); g.fill(); } }, 1, 2);
        const plankWT = mk(128, 256, (g, w, h) => { const r = rngf(31); g.fillStyle = '#eee2cd'; g.fillRect(0, 0, w, h); for (let i = 0; i < 90; i++) { g.fillStyle = r() > 0.5 ? 'rgba(190,168,132,0.30)' : 'rgba(255,255,255,0.45)'; g.fillRect(r() * w, r() * h, 1 + r() * 2, 6 + r() * 30); } g.fillStyle = 'rgba(150,126,92,0.55)'; for (let y = 0; y < h; y += 32) g.fillRect(0, y, w, 2); for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(120,96,64,0.18)'; g.beginPath(); g.arc(r() * w, r() * h, 1 + r() * 2, 0, 7); g.fill(); } }, 3, 1);
        const plankT = mk(256, 128, (g, w, h) => { g.fillStyle = '#6b3d28'; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 32) { g.fillStyle = x % 64 === 0 ? '#5a301c' : '#7d4a30'; g.fillRect(x + 1, 0, 30, h); g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x, 0, 2, h); } }, 3, 1);
        const tileT = mk(256, 256, (g, w, h) => {
            g.fillStyle = '#a84430'; g.fillRect(0, 0, w, h);
            const rows = 10, rh = h / rows, tw = 32;
            for (let row = 0; row < rows; row++) { const y = row * rh, off = (row % 2) * (tw / 2); for (let x = -tw; x < w + tw; x += tw) { g.fillStyle = (row + (x / tw)) % 2 ? '#d4654a' : '#c4563c'; g.fillRect(x + off + 1, y + 2, tw - 2, rh - 3); g.fillStyle = 'rgba(255,214,176,0.22)'; g.fillRect(x + off + 2, y + 3, tw - 4, 2); g.strokeStyle = '#7a301f'; g.lineWidth = 1; g.strokeRect(x + off + 1, y + 2, tw - 2, rh - 3); } }
        }, 3, 2);
        const blueT = mk(256, 256, (g, w, h) => {
            g.fillStyle = '#2f5f86'; g.fillRect(0, 0, w, h);
            const rows = 8, rh = h / rows, tw = 32;
            for (let row = 0; row < rows; row++) { const y = row * rh, off = (row % 2) * (tw / 2); for (let x = -tw; x < w + tw; x += tw) { g.fillStyle = row % 2 ? '#3f78a8' : '#4e8abc'; g.beginPath(); g.arc(x + off + tw / 2, y + rh * 0.72, tw * 0.48, Math.PI, 0); g.fill(); g.strokeStyle = '#244864'; g.lineWidth = 1.4; g.stroke(); } }
        }, 3, 3);
        const stoneT = mk(256, 256, (g, w, h) => {
            g.fillStyle = '#6d767e'; g.fillRect(0, 0, w, h);
            const bw = 64, bh = 32;
            for (let row = 0; row < 8; row++) { const off = (row % 2) * 32; for (let col = -1; col < 6; col++) { const x = col * bw + off, y = row * bh, k = (row + col) % 3; g.fillStyle = ['#c5ced6', '#b7c2cb', '#d5dde3'][k]; g.fillRect(x + 2, y + 2, bw - 5, bh - 4); g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(x + 3, y + 3, bw - 10, 3); g.fillStyle = 'rgba(60,70,80,0.18)'; g.fillRect(x + 3, y + bh - 6, bw - 10, 2); } }
        }, 2, 3);
        const stoneWT = rep(stoneT, 3, 2);
        const leafT = mk(128, 128, (g, w, h) => { const r = rngf(6); g.fillStyle = '#3e9a45'; g.fillRect(0, 0, w, h); for (let i = 0; i < 90; i++) { const x = r() * w, y = r() * h, a = r() * 6.28, L = 5 + r() * 8; g.fillStyle = r() > 0.5 ? '#63b84f' : '#2c7a36'; g.beginPath(); g.ellipse(x, y, L, L * 0.45, a, 0, 7); g.fill(); } }, 2, 2);
        const strawT = mk(128, 128, (g, w, h) => { const r = rngf(11); g.fillStyle = '#d9a93e'; g.fillRect(0, 0, w, h); for (let i = 0; i < 520; i++) { g.strokeStyle = ['#f0cd6a', '#b8862c', '#e6b84c', '#c99a38'][i % 4]; g.lineWidth = 1; const x = r() * w, y = r() * h; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 10 + r() * 24, y + (r() - 0.5) * 4); g.stroke(); } g.strokeStyle = '#8a5a2b'; g.lineWidth = 3; for (const x of [30, 96]) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } }, 1, 1);
        const clothR = mk(8, 8, (g) => { g.fillStyle = '#c23b3b'; g.fillRect(0, 0, 8, 4); g.fillStyle = '#f4e2c4'; g.fillRect(0, 4, 8, 4); }, 1, 1);
        const clothB = mk(8, 8, (g) => { g.fillStyle = '#3d6ea8'; g.fillRect(0, 0, 8, 4); g.fillStyle = '#f2d34a'; g.fillRect(0, 4, 8, 4); }, 1, 1);
        /* materiais: sem o filtro pastel e sem o ajuste de cor comum (o estilo da vila usa as cores como são) */
        const mt = (map, color, extra) => { const o = { map, color: color == null ? 0xffffff : color }; if (extra) { if (extra.emissive) { o.emissive = extra.emissive; o.emissiveIntensity = extra.emissiveIntensity; } if (extra.side != null) o.side = extra.side; } const m = new THREE.MeshLambertMaterial(o); m.defines = Object.assign({}, m.defines, { CL_NO_PASTEL: 1 }); return m; };   /* Lambert, como o protótipo: sem brilho especular */
        const lamC = {}; const lam = c => lamC[c] || (lamC[c] = mt(null, c));
        const M = {
            plaster: mt(plasterT), wood: mt(woodDT), woodW: mt(woodWT), woodH: mt(woodHT), plank: mt(plankT), plankW: mt(plankWT), tile: mt(tileT), blue: mt(blueT),
            stone: mt(stoneT), stoneWide: mt(stoneWT), leaf: mt(leafT), clothR: mt(clothR), clothB: mt(clothB), hay: mt(strawT),
            moatWater: mt(mk(128, 128, (g) => { g.fillStyle = '#3f86b0'; g.fillRect(0, 0, 128, 128); for (let i = 0; i < 26; i++) { g.strokeStyle = i % 2 ? 'rgba(190,230,245,.35)' : 'rgba(20,70,110,.35)'; g.lineWidth = 1.5; const y = (i * 37) % 128, x = (i * 53) % 128; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 14, y - 4, x + 30, y); g.stroke(); } }, 1, 1), 0xffffff, { emissive: new THREE.Color(0x1d4f6e), emissiveIntensity: 0.35 }),
            glass: mt(null, 0xb9e4f2, { emissive: new THREE.Color(0x8ec8df), emissiveIntensity: 0.35, roughness: 0.2 }),
            shingle: mt(plankT, 0x7f9a62)
        };
        const slateT = mk(256, 256, (g, w, h) => { const r = rngf(17); g.fillStyle = '#4c5560'; g.fillRect(0, 0, w, h); const rows = 8, rh = h / rows; for (let row = 0; row < rows; row++) { const off = (row % 2) * 16; for (let x = -32; x < w + 32; x += 32) { const v = 70 + Math.floor(r() * 40); g.fillStyle = 'rgb(' + v + ',' + (v + 8) + ',' + (v + 18) + ')'; g.fillRect(x + off + 1, row * rh + 1, 30, rh - 2); g.fillStyle = 'rgba(255,255,255,0.10)'; g.fillRect(x + off + 2, row * rh + 2, 28, 2); } } }, 3, 3);
        const rockT = mk(256, 256, (g, w, h) => { const r = rngf(5); g.fillStyle = '#9a8c78'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 14 + r() * 14) { g.fillStyle = r() > 0.5 ? 'rgba(70,56,40,0.28)' : 'rgba(220,200,170,0.22)'; g.fillRect(0, y, w, 3 + r() * 9); } for (let i = 0; i < 360; i++) { g.fillStyle = r() > 0.5 ? 'rgba(60,48,36,0.28)' : 'rgba(235,220,190,0.25)'; g.fillRect(r() * w, r() * h, 2 + r() * 8, 1 + r() * 3); } g.strokeStyle = 'rgba(50,38,28,0.4)'; g.lineWidth = 1.5; for (let i = 0; i < 14; i++) { let x = r() * w, y = r() * h; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 4; k++) { x += (r() - 0.5) * 8; y += 8 + r() * 12; g.lineTo(x, y); } g.stroke(); } }, 2, 1);

        const barkT = mk(128, 128, (g, w, h) => { const r = rngf(41); g.fillStyle = '#6b4a30'; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 3 + r() * 4) { g.fillStyle = r() > 0.5 ? 'rgba(40,24,12,0.55)' : 'rgba(150,110,70,0.35)'; g.fillRect(x, 0, 1 + r() * 2, h); } for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(30,18,8,0.5)'; g.fillRect(r() * w, r() * h, 2 + r() * 6, 1 + r() * 2); } }, 2, 1);
        const ringT = mk(128, 128, (g, w, h) => { g.fillStyle = '#c9a36a'; g.fillRect(0, 0, w, h); for (let k = 62; k > 2; k -= 7) { g.strokeStyle = k % 14 < 7 ? '#8a6238' : '#dbb883'; g.lineWidth = 2; g.beginPath(); g.arc(64, 64, k, 0, 7); g.stroke(); } g.strokeStyle = '#6a4626'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(64, 64); g.lineTo(120, 40); g.stroke(); }, 1, 1);
        const rustT = mk(128, 128, (g, w, h) => { const r = rngf(43); g.fillStyle = '#6f6a66'; g.fillRect(0, 0, w, h); for (let i = 0; i < 260; i++) { g.fillStyle = ['rgba(176,92,40,0.55)', 'rgba(110,52,24,0.55)', 'rgba(200,200,205,0.25)', 'rgba(60,40,30,0.5)'][i % 4]; g.beginPath(); g.arc(r() * w, r() * h, 1 + r() * 5, 0, 7); g.fill(); } g.strokeStyle = 'rgba(30,20,16,0.5)'; for (let i = 0; i < 8; i++) { g.beginPath(); g.moveTo(r() * w, 0); g.lineTo(r() * w, h); g.stroke(); } }, 1, 1);
        M.bark = mt(barkT); M.rings = mt(ringT); M.rust = mt(rustT); M.moss = lam(0x6e8f3e); M.mossL = lam(0x8fb04a);
        M.rock = mt(rockT); M.rock.flatShading = true; M.rockL = mt(rockT, 0xd8d2c8); M.rockL.flatShading = true; M.slate = mt(slateT); M.shingleB = mt(plankT, 0x8b7355);
        M.wheat = mt(null, 0xe6b23a); M.thatch = mt(rep(strawT, 3, 2), 0xe0c070); M.thatchD = mt(rep(strawT, 2, 1), 0xa57f3a);
        M.roofTile = mt(tileT, 0xffffff, { side: THREE.DoubleSide });
        const dark = lam(0x2a3138), gold = lam(0xe0b84a), hayM = M.hay, fireM = new THREE.MeshBasicMaterial({ color: 0xff8a2a });
        function add(parent, geo, mat, x, y, z) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m; }
        function box(g, w, h, d, mat, x, y, z) { return add(g, new THREE.BoxGeometry(w, h, d), mat, x, y, z); }
        const vc = new Map();
        const variant = (mat, color) => { const k = mat.uuid + color; if (!vc.has(k)) vc.set(k, mt(mat.map, color, { side: mat.side })); return vc.get(k); };
        function recolor(g, tints) {
            g.traverse(o => { if (!o.isMesh) return; const swap = m => { for (const k in tints) if (M[k] === m) return tints[k].isMaterial ? tints[k] : variant(m, tints[k]); return m; }; o.material = Array.isArray(o.material) ? o.material.map(swap) : swap(o.material); });
        }
function roofGable(g, span, len, y0, rise, roofMat, gableMat, alongX) {
  const hs = span / 2, sh = new THREE.Shape();
  sh.moveTo(-hs, 0); sh.lineTo(hs, 0); sh.lineTo(0, rise); sh.closePath();
  const geo = new THREE.ExtrudeGeometry(sh, { depth: len, bevelEnabled: false });
  geo.translate(0, 0, -len / 2);
  if (alongX) geo.rotateY(Math.PI / 2);
  const m = new THREE.Mesh(geo, [gableMat, roofMat]);
  m.position.y = y0; m.castShadow = true; m.receiveShadow = true;
  g.add(m);
  if (alongX) box(g, len + 0.1, 0.07, 0.1, M.wood, 0, y0 + rise + 0.02, 0);
  else box(g, 0.1, 0.07, len + 0.1, M.wood, 0, y0 + rise + 0.02, 0);
  return m;
}
function winZ(g, px, py, pz, w, h) {
  box(g, w, h, 0.05, M.glass, px, py, pz);
  box(g, w + 0.1, 0.05, 0.08, M.wood, px, py + h / 2, pz + 0.01);
  box(g, w + 0.1, 0.05, 0.08, M.wood, px, py - h / 2, pz + 0.01);
  box(g, 0.05, h, 0.08, M.wood, px - w / 2, py, pz + 0.01);
  box(g, 0.05, h, 0.08, M.wood, px + w / 2, py, pz + 0.01);
  box(g, 0.04, h, 0.08, M.wood, px, py, pz + 0.02);
  box(g, w, 0.04, 0.08, M.wood, px, py, pz + 0.02);
}
function barrel(parent, x, z) {
  const b = add(parent, new THREE.CylinderGeometry(0.16, 0.14, 0.3, 10), M.plank, x, 0.15, z);
  add(parent, new THREE.TorusGeometry(0.155, 0.02, 4, 10), M.wood, x, 0.1, z).rotation.x = Math.PI / 2;
  add(parent, new THREE.TorusGeometry(0.15, 0.02, 4, 10), M.wood, x, 0.22, z).rotation.x = Math.PI / 2;
  return b;
}
function mill(parent, x, z) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = 0.4;
  parent.add(g);
  add(g, new THREE.CylinderGeometry(0.78, 0.92, 1.7, 10), M.stone, 0, 0.85, 0);
  add(g, new THREE.BoxGeometry(0.34, 0.5, 0.06), M.plank, 0, 0.45, 0.9);
  add(g, new THREE.CylinderGeometry(0.15, 0.2, 0.35, 8), M.wood, 0, 1.85, 0);
  const cap = add(g, new THREE.ConeGeometry(0.95, 0.7, 10), lam(0x7a4630), 0, 2.25, 0);
  cap.castShadow = true;
  const hub = add(g, new THREE.CylinderGeometry(0.12, 0.12, 0.2, 8), M.wood, 0, 1.55, 0.95);
  hub.rotation.x = Math.PI / 2;
  const sails = new THREE.Group();
  sails.position.set(0, 1.55, 1.02);
  g.add(sails);
  sails.name = 'sails';
  for (let i = 0; i < 4; i++) {
    const arm = new THREE.Group();
    arm.rotation.z = i * Math.PI / 2 + 0.35;
    sails.add(arm);
    add(arm, new THREE.BoxGeometry(0.08, 1.55, 0.05), M.wood, 0, 0.78, 0);
    for (let s = 0; s < 5; s++) add(arm, new THREE.BoxGeometry(0.42, 0.05, 0.04), M.plank, 0.18, 0.35 + s * 0.26, 0.02);
  }
  return g;
}
function tavern(parent, x, z, rot, sc) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot; g.scale.setScalar(sc); parent.add(g);
  const W = 2.6, D = 1.7, H1 = 0.95, H2 = 0.85, Y1 = 0.2 + H1, Y2 = Y1 + H2;
  box(g, W + 0.1, 0.2, D + 0.1, M.stone, 0, 0.1, 0);
  box(g, W, H1, D, M.plaster, 0, 0.2 + H1 / 2, 0);
  box(g, W + 0.18, H2, D + 0.18, M.plaster, 0, Y1 + H2 / 2, 0);
  box(g, W + 0.26, 0.1, D + 0.26, M.wood, 0, Y1, 0);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    box(g, 0.1, H1, 0.1, M.wood, sx * W / 2, 0.2 + H1 / 2, sz * D / 2);
    box(g, 0.1, H2, 0.1, M.wood, sx * (W / 2 + 0.09), Y1 + H2 / 2, sz * (D / 2 + 0.09));
  }
  for (const px of [-0.45, 0.45]) box(g, 0.08, H1, 0.08, M.wood, px, 0.2 + H1 / 2, D / 2 + 0.02);
  for (const px of [-0.9, -0.3, 0.3, 0.9]) box(g, 0.08, H2, 0.08, M.wood, px, Y1 + H2 / 2, D / 2 + 0.1);
  for (const [px, r] of [[-1.1, 0.8], [1.1, -0.8]]) box(g, 0.07, 0.6, 0.07, M.wood, px, Y1 + H2 / 2, D / 2 + 0.11).rotation.z = r;
  for (const px of [-0.95, 0.95]) winZ(g, px, 0.72, D / 2 + 0.03, 0.4, 0.38);
  for (const px of [-0.6, 0, 0.6]) {
    winZ(g, px, Y1 + 0.42, D / 2 + 0.12, 0.3, 0.34);
    box(g, 0.36, 0.1, 0.14, M.wood, px, Y1 + 0.18, D / 2 + 0.2);
    box(g, 0.3, 0.06, 0.1, M.leaf, px, Y1 + 0.26, D / 2 + 0.2);
  }
  box(g, 0.5, 0.75, 0.08, M.plank, 0, 0.58, D / 2 + 0.04);
  box(g, 0.62, 0.07, 0.1, M.wood, 0, 0.98, D / 2 + 0.05);
  box(g, 0.7, 0.08, 0.34, M.stone, 0, 0.04, D / 2 + 0.2);
  roofGable(g, D + 0.55, W + 0.4, Y2, 0.9, M.tile, M.plaster, true);
  box(g, 0.34, 0.9, 0.34, M.stone, -0.85, Y2 + 0.45, -0.25);
  box(g, 0.44, 0.08, 0.44, M.stoneWide, -0.85, Y2 + 0.92, -0.25);
  /* placa pendurada e mesa na frente */
  box(g, 0.05, 0.95, 0.05, M.wood, W / 2 + 0.38, 0.5, D / 2 + 0.3);
  box(g, 0.45, 0.05, 0.05, M.wood, W / 2 + 0.17, 0.94, D / 2 + 0.3);
  box(g, 0.3, 0.2, 0.04, M.clothR, W / 2 + 0.12, 0.78, D / 2 + 0.3);
  box(g, 0.6, 0.05, 0.34, M.plank, -1.0, 0.42, D / 2 + 0.65);
  for (const sx of [-1.25, -0.75]) box(g, 0.05, 0.4, 0.28, M.wood, sx, 0.2, D / 2 + 0.65);
  box(g, 0.7, 0.04, 0.14, M.wood, -1.0, 0.24, D / 2 + 0.98);
  box(g, 0.7, 0.04, 0.14, M.wood, -1.0, 0.24, D / 2 + 0.32);
  barrel(g, 1.25, D / 2 + 0.3); barrel(g, 1.5, D / 2 + 0.18);
  return g;
}
function smithy(parent, x, z, rot, sc) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot; g.scale.setScalar(sc); parent.add(g);
  const W = 1.9, D = 1.5, H = 0.95;
  box(g, W + 0.1, 0.12, D + 0.1, M.stoneWide, 0, 0.06, 0);
  box(g, W, H, 0.22, M.stoneWide, 0, 0.12 + H / 2, -D / 2 + 0.11);
  box(g, 0.22, H, D, M.stoneWide, -W / 2 + 0.11, 0.12 + H / 2, 0);
  box(g, 0.22, H * 0.6, D, M.stoneWide, W / 2 - 0.11, 0.12 + H * 0.3, 0);
  box(g, 0.16, H, 0.16, M.wood, W / 2 - 0.1, 0.12 + H / 2, D / 2 - 0.1);
  box(g, 0.16, H, 0.16, M.wood, -W / 2 + 0.2, 0.12 + H / 2, D / 2 - 0.1);
  box(g, W, 0.12, 0.16, M.wood, 0, H + 0.1, D / 2 - 0.1);
  roofGable(g, D + 0.5, W + 0.4, H + 0.15, 0.55, M.tile, M.stoneWide, true);
  /* forja, chaminé alta e fogo */
  box(g, 0.62, 0.42, 0.5, M.stone, -0.5, 0.33, -0.3);
  box(g, 0.36, 0.1, 0.26, fireM, -0.5, 0.56, -0.3);
  box(g, 0.4, 1.7, 0.4, M.stone, -0.5, 1.35, -0.45);
  box(g, 0.5, 0.08, 0.5, M.stoneWide, -0.5, 2.22, -0.45);
  /* bigorna sobre tronco, barril de água, lenha, ferramentas */
  add(g, new THREE.CylinderGeometry(0.17, 0.2, 0.3, 8), M.wood, 0.35, 0.27, 0.25);
  box(g, 0.3, 0.1, 0.16, dark, 0.35, 0.47, 0.25);
  box(g, 0.14, 0.1, 0.1, dark, 0.55, 0.45, 0.25);
  barrel(g, 0.78, 0.3);
  for (let i = 0; i < 4; i++) add(g, new THREE.CylinderGeometry(0.05, 0.05, 0.4, 6), M.wood, 1.15 + (i % 2) * 0.1, 0.1 + Math.floor(i / 2) * 0.1, -0.2 + (i % 2) * 0.12).rotation.x = Math.PI / 2;
  box(g, 0.5, 0.05, 0.05, M.wood, -0.7, 0.78, D / 2 - 0.12);
  box(g, 0.05, 0.3, 0.04, dark, -0.82, 0.62, D / 2 - 0.12);
  box(g, 0.05, 0.3, 0.04, dark, -0.58, 0.62, D / 2 - 0.12);
  box(g, 0.24, 0.2, 0.04, M.clothB, 0.3, 0.9, D / 2 + 0.05);
  return g;
}
function barn(parent, x, z, rot, sc) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot; g.scale.setScalar(sc); parent.add(g);
  const W = 2.0, L = 2.6, H = 1.15;
  box(g, W + 0.1, 0.14, L + 0.1, M.stoneWide, 0, 0.07, 0);
  box(g, W, H, L, M.plank, 0, 0.14 + H / 2, 0);
  for (const sx of [-1, 1]) for (let i = 0; i < 4; i++) box(g, 0.08, H, 0.1, M.wood, sx * W / 2, 0.14 + H / 2, -L / 2 + 0.1 + i * (L - 0.2) / 3);
  for (const zz of [-1, 1]) for (const px of [-1, 1]) box(g, 0.1, H, 0.08, M.wood, px * W / 2, 0.14 + H / 2, zz * L / 2);
  const Y = 0.14 + H;
  roofGable(g, W + 0.5, L + 0.45, Y, 1.0, M.tile, M.plank, false);
  /* portão grande com travessas em X + janela do palheiro */
  for (const sx of [-1, 1]) {
    box(g, 0.5, 0.92, 0.06, M.plank, sx * 0.26, 0.6, L / 2 + 0.03);
    box(g, 0.56, 0.06, 0.08, M.wood, sx * 0.26, 0.2, L / 2 + 0.05);
    box(g, 0.56, 0.06, 0.08, M.wood, sx * 0.26, 1.0, L / 2 + 0.05);
    box(g, 0.05, 1.05, 0.08, M.wood, sx * 0.26, 0.6, L / 2 + 0.06).rotation.z = sx * 0.6;
    box(g, 0.05, 1.05, 0.08, M.wood, sx * 0.26, 0.6, L / 2 + 0.06).rotation.z = -sx * 0.6;
  }
  box(g, 0.05, 0.98, 0.1, M.wood, 0, 0.6, L / 2 + 0.07);
  box(g, 0.42, 0.4, 0.06, dark, 0, Y + 0.34, L / 2 + 0.17);
  box(g, 0.34, 0.05, 0.08, hayM, 0, Y + 0.2, L / 2 + 0.2);
  box(g, 0.5, 0.05, 0.08, M.wood, 0, Y + 0.56, L / 2 + 0.2);
  box(g, 0.06, 0.06, 0.5, M.wood, 0, Y + 0.82, L / 2 + 0.28);
  /* fardos de feno e carrinho */
  for (const [hx, hz, hy] of [[0.95, L / 2 + 0.35, 0.14], [1.3, L / 2 + 0.3, 0.14], [1.12, L / 2 + 0.32, 0.36]]) box(g, 0.34, 0.2, 0.26, hayM, hx, hy + 0.1, hz);
  box(g, 0.5, 0.06, 0.34, M.plank, -1.25, 0.3, L / 2 + 0.35);
  for (const sz of [-1, 1]) { const w = add(g, new THREE.CylinderGeometry(0.16, 0.16, 0.05, 10), M.wood, -1.25 + sz * 0.0, 0.17, L / 2 + 0.35 + sz * 0.2); w.rotation.z = Math.PI / 2; w.position.x = -1.25; }
  return g;
}
function watchtower(parent, x, z, sc) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(sc); parent.add(g);
  const H = 1.9, B = 0.5, T = 0.36;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const leg = box(g, 0.1, H + 0.1, 0.1, M.wood, sx * (B + T) / 2, H / 2, sz * (B + T) / 2);
    leg.rotation.z = -sx * 0.1; leg.rotation.x = sz * 0.1;
  }
  for (const y of [0.55, 1.15]) {
    const w = B - (B - T) * (y / H) + 0.04;
    for (const sz of [-1, 1]) box(g, w, 0.06, 0.06, M.wood, 0, y, sz * w / 2);
    for (const sx of [-1, 1]) box(g, 0.06, 0.06, w, M.wood, sx * w / 2, y, 0);
  }
  for (const sz of [-1, 1]) for (const r of [-1, 1]) box(g, 0.05, 0.85, 0.04, M.wood, 0, 0.85, sz * 0.38).rotation.z = r * 0.62;
  box(g, 0.95, 0.07, 0.95, M.plankW, 0, H + 0.04, 0);
  for (const sx of [-1, 1]) {
    box(g, 0.05, 0.3, 0.95, M.woodW, sx * 0.45, H + 0.22, 0);
    box(g, 0.95, 0.3, 0.05, M.woodW, 0, H + 0.22, sx * 0.45);
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(g, 0.07, 0.8, 0.07, M.wood, sx * 0.42, H + 0.5, sz * 0.42);
  const roof = add(g, new THREE.ConeGeometry(0.78, 0.55, 4), M.blue, 0, H + 1.18, 0); roof.rotation.y = Math.PI / 4;
  box(g, 0.03, 0.5, 0.03, M.wood, 0, H + 1.62, 0);
  box(g, 0.26, 0.16, 0.02, M.clothR, 0.14, H + 1.74, 0);
  /* escada encostada */
  for (const sx of [-0.08, 0.08]) box(g, 0.04, 2.0, 0.04, M.wood, 0.2 + sx, 1.0, 0.5).rotation.x = -0.22;
  for (let i = 0; i < 7; i++) box(g, 0.2, 0.03, 0.03, M.wood, 0.2, 0.2 + i * 0.27, 0.54 - i * 0.055);
  box(g, 0.3, 0.36, 0.3, M.stoneWide, 0, 0.18, 0);
  return g;
}
function cabin(parent, x, z, rot, sc) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot; g.scale.setScalar(sc); parent.add(g);
  const W = 1.7, D = 1.3, rows = 8, lr = 0.07;
  box(g, W + 0.1, 0.1, D + 0.1, M.stoneWide, 0, 0.05, 0);
  const logM = M.wood;
  for (let i = 0; i < rows; i++) {
    const y = 0.17 + i * 0.13, ofs = (i % 2) * 0.05;
    for (const sz of [-1, 1]) { const l = add(g, new THREE.CylinderGeometry(lr, lr, W + 0.22 - ofs, 8), logM, 0, y, sz * D / 2); l.rotation.z = Math.PI / 2; }
    for (const sx of [-1, 1]) { const l = add(g, new THREE.CylinderGeometry(lr, lr, D + 0.22 + ofs, 8), logM, sx * W / 2, y, 0); l.rotation.x = Math.PI / 2; }
  }
  const Y = 0.17 + rows * 0.13 - 0.04;
  const moss = M.shingle;
  roofGable(g, D + 0.55, W + 0.4, Y, 0.6, moss, M.plank, true);
  box(g, 0.36, 0.7, 0.06, M.plank, -0.35, 0.5, D / 2 + 0.1);
  winZ(g, 0.4, 0.62, D / 2 + 0.1, 0.34, 0.32);
  box(g, 0.3, 1.6, 0.3, M.stoneWide, W / 2 - 0.15, 1.05, -0.2);
  box(g, 0.4, 0.07, 0.4, M.stone, W / 2 - 0.15, 1.86, -0.2);
  for (let i = 0; i < 9; i++) { const l = add(g, new THREE.CylinderGeometry(0.055, 0.055, 0.5, 6), logM, -W / 2 - 0.3 - (i % 3) * 0.0, 0.06 + Math.floor(i / 3) * 0.11, -0.4 + (i % 3) * 0.14); l.rotation.z = Math.PI / 2; l.position.x = -W / 2 - 0.3; }
  add(g, new THREE.CylinderGeometry(0.13, 0.15, 0.22, 8), logM, 0.5, 0.11, D / 2 + 0.5);
  box(g, 0.05, 0.32, 0.03, M.woodW, 0.5, 0.36, D / 2 + 0.5).rotation.z = 0.4;
  box(g, 0.14, 0.08, 0.03, dark, 0.56, 0.5, D / 2 + 0.5);
  return g;
}
function fenceRun(g, x0, z0, x1, z1, h) {
  const L = Math.hypot(x1 - x0, z1 - z0), n = Math.max(2, Math.round(L / 0.45)), ang = Math.atan2(x1 - x0, z1 - z0);
  for (let i = 0; i <= n; i++) box(g, 0.06, h, 0.06, M.wood, x0 + (x1 - x0) * i / n, h / 2, z0 + (z1 - z0) * i / n);
  for (const y of [h * 0.45, h * 0.85]) box(g, 0.04, 0.05, L, M.wood, (x0 + x1) / 2, y, (z0 + z1) / 2).rotation.y = ang;
}
function well(parent, x, z) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  parent.add(g);
  add(g, new THREE.CylinderGeometry(0.34, 0.38, 0.42, 12), M.stone, 0, 0.21, 0);
  add(g, new THREE.CylinderGeometry(0.28, 0.28, 0.05, 12), lam(0x2c6f98), 0, 0.4, 0);
  add(g, new THREE.BoxGeometry(0.06, 0.62, 0.06), M.wood, -0.32, 0.72, 0);
  add(g, new THREE.BoxGeometry(0.06, 0.62, 0.06), M.wood, 0.32, 0.72, 0);
  const rf = add(g, new THREE.ConeGeometry(0.62, 0.36, 4), M.tile, 0, 1.2, 0);
  rf.rotation.y = Math.PI / 4;
  return g;
}

  function silo(parent, x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z); parent.add(g);
  add(g, new THREE.CylinderGeometry(0.36, 0.4, 0.14, 14), M.stoneWide, 0, 0.07, 0);
  add(g, new THREE.CylinderGeometry(0.3, 0.32, 1.5, 16), M.plankW, 0, 0.89, 0);
  for (const y of [0.42, 0.92, 1.42]) add(g, new THREE.TorusGeometry(0.315, 0.022, 6, 18), M.wood, 0, y, 0).rotation.x = Math.PI / 2;
  add(g, new THREE.ConeGeometry(0.42, 0.55, 16), M.tile, 0, 1.92, 0);
  add(g, new THREE.SphereGeometry(0.05, 8, 6), gold, 0, 2.24, 0);
  box(g, 0.17, 0.3, 0.05, M.door, 0, 0.3, 0.31);
  box(g, 0.05, 1.2, 0.04, M.wood, 0.26, 0.85, 0.2);
  return g;
}
function scarecrow(parent, x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z); parent.add(g);
  box(g, 0.05, 0.9, 0.05, M.wood, 0, 0.45, 0);
  box(g, 0.7, 0.05, 0.05, M.wood, 0, 0.72, 0);
  box(g, 0.2, 0.3, 0.12, M.clothB, 0, 0.62, 0.02);
  add(g, new THREE.SphereGeometry(0.1, 10, 8), hayM, 0, 0.98, 0);
  add(g, new THREE.ConeGeometry(0.15, 0.17, 10), M.wood, 0, 1.12, 0);
  box(g, 0.28, 0.025, 0.28, M.wood, 0, 1.03, 0);
  for (const sx of [-1, 1]) add(g, new THREE.SphereGeometry(0.05, 6, 5), hayM, sx * 0.36, 0.72, 0);
  return g;
}
function hen(parent, x, z, rot, col) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot; parent.add(g);
  const bm = lam(col || 0xf4f0e6);
  const b = add(g, new THREE.SphereGeometry(0.075, 8, 6), bm, 0, 0.1, 0); b.scale.set(1, 0.85, 1.25);
  add(g, new THREE.SphereGeometry(0.04, 8, 6), bm, 0, 0.17, 0.08);
  box(g, 0.012, 0.03, 0.04, lam(0xd8352f), 0, 0.215, 0.085);
  add(g, new THREE.ConeGeometry(0.014, 0.04, 5), lam(0xf2a02a), 0, 0.165, 0.125).rotation.x = Math.PI / 2;
  const tl = box(g, 0.02, 0.07, 0.05, bm, 0, 0.14, -0.1); tl.rotation.x = -0.5;
  for (const sx of [-1, 1]) box(g, 0.012, 0.05, 0.012, lam(0xf2a02a), sx * 0.025, 0.025, 0.01);
  return g;
}
function hayCottage(parent, x, z) {   /* casinha de feno: paredes cor de palha com vigas, telhado de sapé grosso com cumeeira, janela com floreira, chaminé e fardos ao lado */
  const g = new THREE.Group(); g.position.set(x, 0, z); parent.add(g);
  const W = 1.1, D = 0.7, H = 0.5, strawWall = lam(0xe6cf86);
  box(g, W + 0.06, 0.08, D + 0.06, M.stoneWide, 0, 0.04, 0);
  box(g, W, H, D, strawWall, 0, 0.08 + H / 2, 0);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(g, 0.07, H, 0.07, M.wood, sx * W / 2, 0.08 + H / 2, sz * D / 2);
  box(g, W, 0.06, D + 0.04, M.wood, 0, 0.08 + H - 0.03, 0); box(g, 0.06, H, 0.06, M.wood, 0, 0.08 + H / 2, D / 2 + 0.01);
  roofGable(g, D + 0.36, W + 0.34, 0.08 + H, 0.55, M.thatch, strawWall, true);
  const ridge = add(g, new THREE.CylinderGeometry(0.06, 0.06, W + 0.4, 8), M.thatchD, 0, 0.08 + H + 0.56, 0); ridge.rotation.z = Math.PI / 2;
  for (const sz of [-1, 1]) { const e = add(g, new THREE.CylinderGeometry(0.045, 0.045, W + 0.36, 7), M.thatchD, 0, 0.08 + H + 0.01, sz * (D / 2 + 0.17)); e.rotation.z = Math.PI / 2; }
  winZ(g, -0.3, 0.3, D / 2 + 0.03, 0.22, 0.2); box(g, 0.28, 0.07, 0.12, M.wood, -0.3, 0.15, D / 2 + 0.09); add(g, new THREE.SphereGeometry(0.04, 6, 5), lam(0xe25b6a), -0.34, 0.2, D / 2 + 0.12); add(g, new THREE.SphereGeometry(0.04, 6, 5), lam(0xf2c14e), -0.25, 0.2, D / 2 + 0.12);
  box(g, 0.22, 0.38, 0.05, M.door, 0.27, 0.27, D / 2 + 0.03); add(g, new THREE.SphereGeometry(0.018, 6, 5), gold, 0.34, 0.27, D / 2 + 0.07); box(g, 0.3, 0.03, 0.14, M.stone, 0.27, 0.09, D / 2 + 0.1);
  box(g, 0.18, 0.5, 0.18, M.stone, 0.38, 0.08 + H + 0.3, -0.14); box(g, 0.24, 0.04, 0.24, M.stoneWide, 0.38, 0.08 + H + 0.56, -0.14);
  for (const [hx, hz, hy] of [[0.7, 0.18, 0], [0.7, -0.08, 0], [0.7, 0.05, 0.2]]) box(g, 0.28, 0.2, 0.22, hayM, hx, 0.1 + hy, hz);
  return g;
}
function wheatField(parent, x0, z0, w, d) {   /* o trigal amarelinho do protótipo: terra, fileiras de espigas e cerca de estacas */
  const g = new THREE.Group(); parent.add(g);
  box(g, w, 0.05, d, lam(0x8a5a2b), x0 + w / 2, 0.025, z0 + d / 2);
  const rows = Math.max(3, Math.round(d / 0.17)), cols = Math.round(w / 0.11), cone = new THREE.ConeGeometry(0.035, 0.32, 4);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const m = add(g, cone, M.wheat, x0 + 0.08 + (w - 0.16) * (c / (cols - 1)), 0.2, z0 + 0.09 + (d - 0.18) * (r / (rows - 1))); m.scale.set(1, 0.85 + ((r + c) % 3) * 0.12, 1); m.rotation.y = (r * 3 + c) * 0.4; m.castShadow = false; }
  for (let i = 0; i <= Math.round(w / 0.55); i++) { const px = x0 + (w * i) / Math.round(w / 0.55); box(g, 0.06, 0.45, 0.06, M.wood, px, 0.25, z0 - 0.04); box(g, 0.06, 0.45, 0.06, M.wood, px, 0.25, z0 + d + 0.04); }
  for (const yy of [0.22, 0.38]) { box(g, w, 0.05, 0.05, M.wood, x0 + w / 2, yy, z0 - 0.04); box(g, w, 0.05, 0.05, M.wood, x0 + w / 2, yy, z0 + d + 0.04); }
  return g;
}
function farmyard(parent) {   /* a Fazenda 4x3 (x de -2 a 2, z de -1,5 a 1,5): à esquerda a casinha de feno, galinheiro e macieira; no fundo o trigal amarelo; na frente o campo dos canteiros */
  const g = new THREE.Group(); parent.add(g);
  const till = lam(0x5a3a22), path = lam(0xb59a6a);
  box(g, 2.3, 0.04, 1.96, till, 0.9, 0.02, 0.5);
  box(g, 0.34, 0.03, 1.7, path, -0.93, 0.015, 0.7);
  wheatField(g, -0.2, -1.42, 2.2, 0.86);
  hayCottage(g, -1.2, -0.9);
  const coop = new THREE.Group(); coop.position.set(-1.65, 0, 0.0); g.add(coop);
  box(coop, 0.34, 0.24, 0.28, M.plank, 0, 0.17, 0); roofGable(coop, 0.4, 0.4, 0.29, 0.16, M.thatch, M.plank, true);
  box(coop, 0.09, 0.12, 0.03, dark, 0, 0.15, 0.15); box(coop, 0.1, 0.02, 0.2, M.plank, 0, 0.07, 0.24).rotation.x = -0.4;
  hen(g, -1.5, 0.35, 0.5, 0xf4f0e6); hen(g, -1.35, 0.22, -1.0, 0xb5652e); hen(g, -1.6, 0.5, 2.2, 0xf4f0e6); hen(g, -1.25, 0.5, 1.2, 0x7a4a2a);
  add(g, new THREE.CylinderGeometry(0.05, 0.07, 0.4, 7), M.wood, -1.7, 0.2, 1.0);
  for (const [ox, oy, oz, r] of [[0, 0.5, 0, 0.25], [-0.14, 0.42, 0.06, 0.18], [0.14, 0.44, -0.04, 0.19], [0.02, 0.62, 0.05, 0.16]]) add(g, new THREE.SphereGeometry(r, 9, 7), M.leaf, -1.7 + ox, oy + 0.15, 1.0 + oz);
  for (const [ox, oy, oz] of [[0.12, 0.45, 0.2], [-0.15, 0.5, 0.18], [0.0, 0.7, 0.12], [-0.05, 0.4, -0.2]]) add(g, new THREE.SphereGeometry(0.035, 6, 5), lam(0xd8352f), -1.7 + ox, oy, 1.0 + oz);
  box(g, 0.22, 0.08, 0.16, M.wood, -0.55, 0.16, 1.1); add(g, new THREE.CylinderGeometry(0.06, 0.06, 0.03, 10), dark, -0.55, 0.06, 1.2).rotation.z = Math.PI / 2;
  for (const [hx, hz, hy] of [[-0.75, 0.2, 0], [-0.75, 0.45, 0], [-0.75, 0.32, 0.2]]) box(g, 0.3, 0.2, 0.24, hayM, hx, 0.1 + hy, hz);
  for (let i = 0; i < 9; i++) { const fx = -0.1 + i * 0.24; box(g, 0.02, 0.34, 0.02, M.leaf, fx, 0.17, 1.42); add(g, new THREE.CylinderGeometry(0.06, 0.06, 0.02, 10), lam(0xf2c14e), fx, 0.36, 1.4).rotation.x = Math.PI / 2 - 0.4; add(g, new THREE.CylinderGeometry(0.03, 0.03, 0.025, 8), lam(0x5a3a22), fx, 0.36, 1.39).rotation.x = Math.PI / 2 - 0.4; }
  scarecrow(g, 0.9, -0.18);
  fenceRun(g, -1.98, 1.5, -1.2, 1.5, 0.34); fenceRun(g, -0.7, 1.5, 1.98, 1.5, 0.34);
  fenceRun(g, -1.98, 1.5, -1.98, -1.5, 0.34); fenceRun(g, 1.98, 1.5, 1.98, -1.5, 0.34); fenceRun(g, -1.98, -1.5, 1.98, -1.5, 0.34);
  fenceRun(g, -0.3, -1.5, -0.3, 0.5, 0.3); fenceRun(g, -0.3, 0.95, -0.3, 1.5, 0.3);
  return g;
}
function guard(parent, x, y, z) {   /* guarda da torre: capacete, túnica vermelha, escudo e lança */
  const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(1.35); parent.add(g);
  const steel = lam(0x9aa4ad), skin = lam(0xe8b98a), cloth = lam(0x4a5a78), red = lam(0xb83a34);
  box(g, 0.075, 0.2, 0.09, cloth, -0.05, 0.1, 0); box(g, 0.075, 0.2, 0.09, cloth, 0.05, 0.1, 0);
  box(g, 0.21, 0.26, 0.13, red, 0, 0.33, 0); box(g, 0.22, 0.035, 0.14, dark, 0, 0.22, 0);
  box(g, 0.06, 0.2, 0.07, red, -0.14, 0.34, 0); box(g, 0.06, 0.2, 0.07, red, 0.14, 0.36, 0.04);
  add(g, new THREE.SphereGeometry(0.07, 10, 8), skin, 0, 0.55, 0);
  add(g, new THREE.SphereGeometry(0.085, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), steel, 0, 0.57, 0);
  box(g, 0.02, 0.06, 0.02, steel, 0, 0.55, 0.075);
  add(g, new THREE.CylinderGeometry(0.014, 0.014, 0.6, 6), M.wood, 0.19, 0.4, 0.04);
  add(g, new THREE.ConeGeometry(0.035, 0.12, 6), steel, 0.19, 0.76, 0.04);
  const sh = add(g, new THREE.CylinderGeometry(0.1, 0.1, 0.03, 12), M.clothR, -0.19, 0.32, 0.05); sh.rotation.z = Math.PI / 2; sh.rotation.y = 0.2;
  add(g, new THREE.SphereGeometry(0.025, 6, 5), gold, -0.21, 0.32, 0.05);
  return g;
}
function mine(parent, L) {   /* entrada de mina: morro de rocha, arco de pedra com vigas, trilhos, carrinho de ouro; cresce a cada nível (sem cristais) */
  const g = new THREE.Group(); parent.add(g);
  const rock = M.rock, soil = lam(0x7a5a3a), ore = lam(0xf0c040), lampM = new THREE.MeshBasicMaterial({ color: 0xffd36a });
  box(g, 1.95, 0.06, 1.95, soil, 0, 0.03, 0);
  for (const [x, y, z, r, sy] of [[0, 0.4, -0.58, 0.86, 0.85], [-0.64, 0.3, -0.5, 0.6, 0.75], [0.66, 0.3, -0.52, 0.62, 0.75], [-0.28, 0.78, -0.7, 0.55, 0.8], [0.32, 0.7, -0.72, 0.5, 0.8]]) { const m = add(g, new THREE.IcosahedronGeometry(r, 0), rock, x, y, z); m.scale.y = sy; }
  const arch = (w, h, d) => { const s = new THREE.Shape(), r = w / 2; s.moveTo(-r, 0); s.lineTo(r, 0); s.lineTo(r, h); s.absarc(0, h, r, 0, Math.PI, false); s.lineTo(-r, 0); const e = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }); e.translate(0, 0, -d / 2); return e; };
  add(g, arch(0.84, 0.5, 0.12), M.stone, 0, 0.06, 0.0);
  add(g, arch(0.6, 0.42, 0.14), dark, 0, 0.06, 0.03);
  for (const sx of [-1, 1]) box(g, 0.08, 0.6, 0.08, M.wood, sx * 0.3, 0.36, 0.1);
  box(g, 0.74, 0.08, 0.1, M.wood, 0, 0.7, 0.1);
  for (const sx of [-1, 1]) box(g, 0.05, 0.3, 0.05, M.wood, sx * 0.2, 0.55, 0.1).rotation.z = sx * 0.7;
  for (const sx of [-1, 1]) box(g, 0.03, 0.03, 0.85, M.wood, sx * 0.12, 0.075, 0.55);
  for (let i = 0; i < 7; i++) box(g, 0.36, 0.025, 0.05, M.wood, 0, 0.065, 0.15 + i * 0.12);
  box(g, 0.3, 0.16, 0.22, M.wood, 0, 0.22, 0.6);
  for (const [wx, wz] of [[-0.14, 0.52], [0.14, 0.52], [-0.14, 0.68], [0.14, 0.68]]) { const w = add(g, new THREE.CylinderGeometry(0.055, 0.055, 0.03, 10), dark, wx, 0.11, wz); w.rotation.z = Math.PI / 2; }
  for (const [sx, sy, sz] of [[0, 0.33, 0.6], [-0.07, 0.31, 0.55], [0.08, 0.32, 0.66], [0.02, 0.38, 0.62]]) add(g, new THREE.SphereGeometry(0.08, 8, 6), ore, sx, sy, sz);
  box(g, 0.06, 0.4, 0.04, M.wood, -0.62, 0.2, 0.62).rotation.z = 0.5; box(g, 0.2, 0.04, 0.04, dark, -0.55, 0.38, 0.62);
  if (L >= 2) {
    box(g, 0.05, 0.7, 0.05, M.wood, 0.6, 0.35, 0.55); box(g, 0.2, 0.04, 0.04, M.wood, 0.5, 0.68, 0.55); box(g, 0.1, 0.12, 0.1, lampM, 0.42, 0.62, 0.55);
    barrel(g, -0.72, 0.5); barrel(g, -0.56, 0.78); box(g, 0.24, 0.2, 0.24, M.plankW, -0.7, 0.1, 0.9);
  }
  if (L >= 3) {
    for (const sx of [-1, 1]) box(g, 0.06, 1.0, 0.06, M.wood, -0.75 + sx * 0.18, 0.5, -0.05).rotation.z = -sx * 0.22;
    box(g, 0.5, 0.06, 0.06, M.wood, -0.75, 0.98, -0.05); add(g, new THREE.TorusGeometry(0.15, 0.025, 6, 16), M.wood, -0.75, 0.82, -0.05);
    box(g, 0.015, 0.5, 0.015, dark, -0.75, 0.56, -0.05); box(g, 0.12, 0.1, 0.12, M.wood, -0.75, 0.28, -0.05);
  }
  if (L >= 4) {
    box(g, 0.3, 0.2, 0.2, M.wood, 0.7, 0.1, 0.1); box(g, 0.32, 0.04, 0.22, gold, 0.7, 0.22, 0.1);
    for (let i = 0; i < 3; i++) box(g, 0.14, 0.06, 0.07, gold, 0.55 + i * 0.01, 0.03 + i * 0.06, 0.65 - 0.02 * i);
  }
  return g;
}

  function bigTree(parent, leafHex, wing) {   /* Árvore Incubadora: tronco retorcido com raízes enormes, ramos, copa em vários verdes, frutos-lanterna, cipós, cogumelos, círculo de pedras e altar esculpido (o ovo flutua em 0, 1.6, 1.35) */
  const g = new THREE.Group(); parent.add(g); let sd = 77; const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  const base = new THREE.Color(leafHex), sh = f => '#' + base.clone().multiplyScalar(f).getHexString();
  const lf = [lam(base.getHex()), lam(sh(0.78)), lam(sh(1.22)), lam(sh(0.62))];
  const warm = new THREE.MeshBasicMaterial({ color: 0xffe9a0 }), soft = new THREE.MeshBasicMaterial({ color: 0xc9ff9a }), runeM = new THREE.MeshBasicMaterial({ color: 0xffd77a });
  /* chão: morro de grama, círculo de pedras com musgo e cogumelos */
  add(g, cyl(2.45, 2.7, 0.34, 24), lam(0x4f8a3a), 0, 0.17, 0.1); add(g, cyl(2.2, 2.4, 0.08, 24), lam(0x6aa045), 0, 0.36, 0.1);
  for (let i = 0; i < 14; i++) { const a = i / 14 * 6.283 + 0.2, rd = 2.35 + r() * 0.2, s = 0.22 + r() * 0.2; const rk = add(g, ico(s), i % 3 ? M.rock : M.rockL, Math.cos(a) * rd, s * 0.5, Math.sin(a) * rd + 0.1); rk.scale.y = 0.75; rk.rotation.y = r() * 3; if (i % 2) { const m = add(g, ico(s * 0.7), M.moss, Math.cos(a) * rd, s * 0.85, Math.sin(a) * rd + 0.1); m.scale.y = 0.35; } if (i % 4 === 0) mushroom(g, Math.cos(a) * (rd - 0.35), Math.sin(a) * (rd - 0.35) + 0.1, 2.4); }
  /* raízes grandes (cones tombados que saem do tronco) e raízes finas */
  const cx = 0, cz = -0.7;
  for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283 + 0.3, L = 2.4 + r() * 1.0, rt = add(g, cone(0.42 + r() * 0.15, L, 6), M.bark, cx + Math.cos(a) * (0.8 + L * 0.32), 0.42, cz + Math.sin(a) * (0.8 + L * 0.32)); rt.rotation.z = Math.cos(a) * 1.25; rt.rotation.x = -Math.sin(a) * 1.25; if (i % 2) { const m = add(g, ico(0.3), M.moss, cx + Math.cos(a) * (0.9 + L * 0.2), 0.7, cz + Math.sin(a) * (0.9 + L * 0.2)); m.scale.set(1.2, 0.35, 1); } }
  for (let i = 0; i < 6; i++) { const a = i * 1.1 + 0.8, rt = add(g, cone(0.12, 1.5, 5), M.bark, cx + Math.cos(a) * 2.0, 0.2, cz + Math.sin(a) * 2.0); rt.rotation.z = Math.cos(a) * 1.4; rt.rotation.x = -Math.sin(a) * 1.4; }
  /* tronco retorcido em segmentos */
  let tx = cx, tz = cz; const segs = 9, H0 = 0.4, SH = 0.6;
  for (let i = 0; i < segs; i++) { const rb = 1.12 - i * 0.07, rt2 = 1.12 - (i + 1) * 0.07, nx = cx + 0.42 * Math.sin((i + 1) * 0.85), nz = cz + 0.25 * Math.cos((i + 1) * 0.7); const sgm = add(g, cyl(rt2, rb, SH + 0.05, 9), M.bark, (tx + nx) / 2, H0 + SH * i + SH / 2, (tz + nz) / 2); sgm.rotation.y = i * 0.9; sgm.rotation.z = (nx - tx) * -0.7; sgm.rotation.x = (nz - tz) * 0.7; tx = nx; tz = nz; if (i % 2 === 0) { const kn = add(g, ico(0.3 + r() * 0.15), M.bark, tx + Math.cos(i * 2.1) * rb * 0.9, H0 + SH * i + 0.3, tz + Math.sin(i * 2.1) * rb * 0.9); kn.scale.set(1, 1.3, 1); } if (i % 3 === 1) { const ms = add(g, ico(0.34), M.moss, tx + Math.cos(i * 1.3 + 2) * rb * 0.85, H0 + SH * i + 0.35, tz + Math.sin(i * 1.3 + 2) * rb * 0.85); ms.scale.set(1.2, 0.5, 0.5); } }
  /* ninho/oco do tronco virado para o altar (z+) com arco de madeira */
  add(g, cyl(0.3, 0.3, 0.12, 14), dark, 0.05, 1.5, cz + 0.98).rotation.x = Math.PI / 2;
  for (const sx of [-1, 1]) { const ar = add(g, cyl(0.07, 0.09, 1.1, 6), M.bark, sx * 0.55, 1.3, cz + 0.95); ar.rotation.z = sx * 0.08; }
  /* cogumelos de prateleira no tronco */
  for (const [y, a, s] of [[1.2, 1.1, 0.5], [2.4, 4.0, 0.4], [3.1, 2.2, 0.35]]) { const sh2 = add(g, new THREE.SphereGeometry(s, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), lam(0xd9b36a), cx + Math.cos(a) * 0.95, y, cz + Math.sin(a) * 0.95); sh2.rotation.z = Math.cos(a) * -1.2; sh2.rotation.x = Math.sin(a) * 1.2; }
  /* ramos mestres */
  const top = { x: tx, y: H0 + SH * segs, z: tz }; const brs = [];
  for (let i = 0; i < 7; i++) { const a = i / 7 * 6.283 + 0.4, L = 3.2 + r() * 1.4, tilt = 0.75 + r() * 0.4; const bx = top.x + Math.cos(a) * L * 0.4 * Math.sin(tilt), by = top.y - 0.9 + L * 0.4 * Math.cos(tilt), bz = top.z + Math.sin(a) * L * 0.4 * Math.sin(tilt); const br = add(g, cyl(0.12, 0.33, L, 6), M.bark, (top.x + bx * 1) / 2 + Math.cos(a) * L * 0.1, (top.y - 0.9 + by) / 2, (top.z + bz) / 2 + Math.sin(a) * L * 0.1); br.rotation.z = Math.cos(a) * tilt; br.rotation.x = -Math.sin(a) * tilt; brs.push({ x: top.x + Math.cos(a) * L * 0.85 * Math.sin(tilt), y: top.y - 0.9 + L * 0.85 * Math.cos(tilt), z: top.z + Math.sin(a) * L * 0.85 * Math.sin(tilt) }); }
  /* copa: muitas touceiras de folhas em camadas, em 4 tons */
  const clumps = []; for (const b of brs) for (let k = 0; k < 5; k++) clumps.push([b.x + (r() - 0.5) * 2.2, b.y + (r() - 0.35) * 1.6, b.z + (r() - 0.5) * 2.2, 0.75 + r() * 0.65]);
  for (let k = 0; k < 14; k++) { const a = r() * 6.283, d = r() * 2.0; clumps.push([top.x + Math.cos(a) * d, top.y + 1.4 + r() * 2.2, top.z + Math.sin(a) * d, 0.9 + r() * 0.7]); }
  clumps.forEach(([x, y, z, s], i) => { const c = add(g, ico(s, 1), lf[i % 4], x, y, z); c.scale.set(1, 0.78, 1); c.rotation.y = r() * 6; });
  /* frutos-lanterna pendurados e cipós */
  for (let i = 0; i < 26; i++) { const c = clumps[Math.floor(r() * clumps.length)], fx = c[0] + (r() - 0.5) * 1.2, fz = c[2] + (r() - 0.5) * 1.2, fy = c[1] - c[3] * 0.6 - r() * 0.7; add(g, cyl(0.008, 0.008, 0.4, 4), M.leaf, fx, fy + 0.25, fz); add(g, new THREE.SphereGeometry(0.07 + r() * 0.05, 8, 6), i % 3 ? warm : soft, fx, fy, fz).castShadow = false; }
  for (let i = 0; i < 12; i++) { const c = clumps[Math.floor(r() * clumps.length)], len = 1.2 + r() * 1.8; add(g, cyl(0.02, 0.025, len, 4), M.leaf, c[0] + (r() - 0.5), c[1] - len / 2 - 0.3, c[2] + (r() - 0.5) * 1.5); for (let k = 0; k < 3; k++) add(g, ico(0.09), lf[(i + k) % 4], c[0], c[1] - 0.5 - k * len * 0.28, c[2]).scale.set(1.3, 0.6, 1); }
  /* altar esculpido onde o ovo flutua (topo em y 0,75): degraus, base de pedra com runas e quatro marcos */
  add(g, cyl(1.45, 1.55, 0.18, 16), M.stoneWide, 0, 0.28, 1.35); add(g, cyl(1.15, 1.3, 0.2, 16), M.stone, 0, 0.45, 1.35); add(g, cyl(0.9, 1.05, 0.2, 14), M.stoneWide, 0, 0.62, 1.35); add(g, cyl(0.72, 0.78, 0.04, 14), lam(0x3c3832), 0, 0.74, 1.35);
  for (let i = 0; i < 4; i++) { const a = i * 1.5708 + 0.785, px = Math.cos(a) * 1.25, pz = 1.35 + Math.sin(a) * 1.25; add(g, cyl(0.1, 0.13, 0.7, 6), M.stone, px, 0.7, pz); add(g, new THREE.SphereGeometry(0.09, 8, 6), runeM, px, 1.12, pz).castShadow = false; }
  for (let i = 0; i < 10; i++) { const a = i / 10 * 6.283; box(g, 0.08, 0.02, 0.18, runeM, Math.cos(a) * 1.05, 0.56, 1.35 + Math.sin(a) * 1.05).rotation.y = -a; }
  for (let i = 0; i < 9; i++) { const a = r() * 6.283, d = 1.6 + r() * 0.5; box(g, 0.025, 0.14 + r() * 0.1, 0.025, M.leaf, Math.cos(a) * d, 0.42, 1.35 + Math.sin(a) * d); add(g, ico(0.04), lam([0xf2c14e, 0xf7b6d2, 0xffffff][i % 3]), Math.cos(a) * d, 0.55, 1.35 + Math.sin(a) * d); }
  return g;
}

  function dragonTree(parent, hex) {   /* Árvore Incubadora CREEPY: tronco grosso e retorcido em espiral (parado), olhos brilhantes e boca-oco, raízes em garra, galhos secos com espinhos, copa rala, caveiras, lápides, corvos e lagoa na frente com ilhota de pedra para o ovo (0, 1.55, 2.0) */
  const g = new THREE.Group(); parent.add(g); let sd = 53; const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  const base = new THREE.Color(hex), shade = (f, h) => base.clone().multiplyScalar(f).offsetHSL(h || 0, -0.15, 0);
  const bark = mt(M.bark.map, 0x8a6a8a); bark.name = 'bark'; const barkD = mt(M.bark.map, 0x4a3450); barkD.name = 'bark';
  const EZ = 2.0, ZC = -1.15;
  const cxOf = y => 0.5 * Math.sin(y * 0.8 + 0.5), czOf = y => ZC + 0.28 * Math.cos(y * 0.6);
  const rOf = y => 1.25 + 0.7 * Math.exp(-(y - 0.15) * 1.15) - 0.07 * Math.min(y, 6) + 0.2 * Math.exp(-Math.pow(y - 6.4, 2) * 1.1);
  const noise = (a, y) => 1 + 0.17 * Math.sin(3 * a + y * 1.5) + 0.06 * Math.sin(7 * a - y * 2.2) + 0.04 * Math.sin(11 * a + y * 1.1);
  const zFront = y => czOf(y) + rOf(y) * 1.27 + 0.08;
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  /* tronco liso retorcido em espiral */
  const RS = 56, YS = 38, y0 = 0.1, y1 = 6.7, tp = [], tuv = [], tix = [];
  for (let j = 0; j <= YS; j++) { const y = y0 + (y1 - y0) * j / YS; for (let i = 0; i <= RS; i++) { const a = i / RS * 6.2832, rr = rOf(y) * noise(a, y); tp.push(cxOf(y) + Math.cos(a) * rr, y, czOf(y) + Math.sin(a) * rr); tuv.push(i / RS * 3, y * 0.45); } }
  for (let j = 0; j < YS; j++) for (let i = 0; i < RS; i++) { const a = j * (RS + 1) + i, b = a + RS + 1; tix.push(a, b, a + 1, b, b + 1, a + 1); }
  const tg = new THREE.BufferGeometry(); tg.setAttribute('position', new THREE.Float32BufferAttribute(tp, 3)); tg.setAttribute('uv', new THREE.Float32BufferAttribute(tuv, 2)); tg.setIndex(tix); tg.computeVertexNormals();
  const trunk = new THREE.Mesh(tg, bark); trunk.castShadow = trunk.receiveShadow = true; g.add(trunk);
  const tube = (pts, r0, r1, mat, rs) => { const cv = new THREE.CatmullRomCurve3(pts), sg = Math.max(8, Math.round(cv.getLength() * 6)), P = cv.getPoints(sg), F = cv.computeFrenetFrames(sg, false), ps = [], us = [], ix = [], R = rs || 8; for (let i = 0; i <= sg; i++) { const rad = r0 + (r1 - r0) * Math.pow(i / sg, 0.8); for (let j = 0; j <= R; j++) { const a = j / R * 6.2832, n = F.normals[i], b = F.binormals[i]; ps.push(P[i].x + (Math.cos(a) * n.x + Math.sin(a) * b.x) * rad, P[i].y + (Math.cos(a) * n.y + Math.sin(a) * b.y) * rad, P[i].z + (Math.cos(a) * n.z + Math.sin(a) * b.z) * rad); us.push(j / R * 2, i / sg * cv.getLength() * 0.4); } } for (let i = 0; i < sg; i++) for (let j = 0; j < R; j++) { const a = i * (R + 1) + j, b = a + R + 1; ix.push(a, b, a + 1, b, b + 1, a + 1); } const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.Float32BufferAttribute(ps, 3)); gg.setAttribute('uv', new THREE.Float32BufferAttribute(us, 2)); gg.setIndex(ix); gg.computeVertexNormals(); const m = new THREE.Mesh(gg, mat); m.castShadow = true; m.receiveShadow = true; g.add(m); return m; };
  /* cipós grossos enrolados no tronco */
  for (let k = 0; k < 3; k++) { const pts = []; for (let i = 0; i <= 14; i++) { const t2 = i / 14, y = 0.6 + t2 * 5.3, an = k * 2.094 + t2 * 8.5, rr = rOf(y) * 1.06; pts.push(V(cxOf(y) + Math.cos(an) * rr, y, czOf(y) + Math.sin(an) * rr)); } tube(pts, 0.17, 0.09, barkD, 7); }
  /* raízes em garra com espinhos e pontas enroladas */
  for (let i = 0; i < 10; i++) { const a = i / 10 * 6.2832 + 0.3, rb = rOf(1.0) * 0.9, L = 2.2 + r() * 1.2, sg = i % 2 ? 1 : -1; const P = (f, h, w) => V(cxOf(0.5) + Math.cos(a + sg * w) * (rb + L * f), h, czOf(0.5) + Math.sin(a + sg * w) * (rb + L * f)); tube([V(cxOf(1.3) + Math.cos(a) * rb, 1.4, czOf(1.3) + Math.sin(a) * rb), P(0.35, 0.7, 0.12), P(0.7, 0.3, 0.3), P(1.0, 0.16, 0.4), P(1.12, 0.42, 0.46)], 0.5 + r() * 0.1, 0.05, i % 3 ? bark : barkD, 9); for (let k = 0; k < 3; k++) { const sp = P(0.3 + k * 0.25, 0.55 - k * 0.15, 0.1 + k * 0.1); const th = add(g, cone(0.07, 0.34, 5), barkD, sp.x, sp.y + 0.1, sp.z); th.rotation.z = Math.cos(a) * 0.3; th.rotation.x = -Math.sin(a) * 0.3; } }
  /* rosto: olhos brilhantes e boca-oco com dentes (para fora do tronco, bem visíveis) */
  const eyeY = 3.5, ez = zFront(eyeY) + 0.04;
  for (const sx of [-1, 1]) { const sk = add(g, new THREE.SphereGeometry(1, 14, 10), lam(0x0c060e), cxOf(eyeY) + sx * 0.62, eyeY, ez); sk.scale.set(0.4, 0.2, 0.12); sk.rotation.z = -sx * 0.45; const ey = add(g, new THREE.SphereGeometry(1, 12, 8), new THREE.MeshBasicMaterial({ color: 0xb6ff6a }), cxOf(eyeY) + sx * 0.62, eyeY, ez + 0.06); ey.scale.set(0.3, 0.1, 0.06); ey.rotation.z = -sx * 0.45; ey.castShadow = false; const pu = add(g, new THREE.SphereGeometry(1, 8, 6), lam(0x120a14), cxOf(eyeY) + sx * 0.62, eyeY, ez + 0.1); pu.scale.set(0.05, 0.1, 0.03); }
  const my = 2.0, mz = zFront(my), ms = new THREE.Shape(); ms.moveTo(0, -0.75); ms.bezierCurveTo(-0.62, -0.5, -0.7, 0.45, 0, 0.8); ms.bezierCurveTo(0.7, 0.45, 0.62, -0.5, 0, -0.75);
  const lip = new THREE.Mesh(new THREE.ExtrudeGeometry(ms, { depth: 0.35, bevelEnabled: true, bevelSize: 0.07, bevelThickness: 0.07, bevelSegments: 3, curveSegments: 18 }), barkD); lip.scale.set(1.2, 1.2, 1); lip.position.set(cxOf(my), my, mz - 0.3); lip.castShadow = true; g.add(lip);
  const maw = new THREE.Mesh(new THREE.ExtrudeGeometry(ms, { depth: 0.04, bevelEnabled: false, curveSegments: 18 }), new THREE.MeshBasicMaterial({ color: 0x9a3be0 })); maw.scale.set(1.0, 1.0, 1); maw.position.set(cxOf(my), my, mz + 0.1); g.add(maw);
  const maw2 = new THREE.Mesh(new THREE.ExtrudeGeometry(ms, { depth: 0.04, bevelEnabled: false, curveSegments: 18 }), new THREE.MeshBasicMaterial({ color: 0xd9ff8a })); maw2.scale.set(0.55, 0.55, 1); maw2.position.set(cxOf(my), my + 0.05, mz + 0.14); g.add(maw2);
  for (let i = 0; i < 12; i++) { const an = i / 12 * 6.2832, tx = cxOf(my) + Math.cos(an) * 0.74 * 1.0, ty = my + Math.sin(an) * 0.98; const tt = add(g, cone(0.07, 0.3, 5), lam(0xe8e2cf), tx, ty, mz + 0.14); tt.rotation.z = an + (i % 2 ? 1.57 : -1.57) + 0; tt.rotation.x = 0.3; }
  /* galhos secos retorcidos com espinhos */
  const topY = 6.2, bt = V(cxOf(topY), topY, czOf(topY)), tips = [];
  for (let i = 0; i < 9; i++) { const a = i / 9 * 6.2832 + 0.2, L = 3.4 + r() * 1.6, up = 1.4 + r() * 1.2, wob = (r() - 0.5) * 1.2; const p1 = V(bt.x + Math.cos(a) * L * 0.3, topY + 0.6 + r() * 0.5, bt.z + Math.sin(a) * L * 0.3), p2 = V(bt.x + Math.cos(a + wob * 0.2) * L * 0.65, topY + up * 0.8, bt.z + Math.sin(a + wob * 0.2) * L * 0.65), p3 = V(bt.x + Math.cos(a + wob * 0.3) * L, topY + up * 1.4, bt.z + Math.sin(a + wob * 0.3) * L); tube([V(bt.x, topY - 0.7, bt.z), p1, p2, p3], 0.4, 0.05, i % 2 ? bark : barkD, 8); tips.push(p3, p2); for (let k = 0; k < 3; k++) { const q0 = k === 0 ? p1 : k === 1 ? p2 : p2.clone().lerp(p3, 0.6), d = (k + 1) * 1.7 + a; tube([q0, V(q0.x + Math.cos(d) * 0.8, q0.y + 0.5, q0.z + Math.sin(d) * 0.8), V(q0.x + Math.cos(d) * 1.5, q0.y + 0.8 + r() * 0.6, q0.z + Math.sin(d) * 1.5)], 0.1, 0.02, barkD, 5); } }
  /* copa rala em tufos escuros que brilham de leve (só ela balança) */
  const leafCv = document.createElement('canvas'); leafCv.width = leafCv.height = 128; const lc = leafCv.getContext('2d'); lc.fillStyle = '#b8b8b8'; lc.fillRect(0, 0, 128, 128); for (let i = 0; i < 90; i++) { const x = r() * 128, y = r() * 128, an = r() * 6.28; lc.fillStyle = r() > 0.5 ? '#f0f0f0' : '#7c7c7c'; lc.beginPath(); lc.ellipse(x, y, 7 + r() * 6, 3 + r() * 2, an, 0, 7); lc.fill(); lc.strokeStyle = '#555'; lc.lineWidth = 0.7; lc.beginPath(); lc.moveTo(x - Math.cos(an) * 8, y - Math.sin(an) * 8); lc.lineTo(x + Math.cos(an) * 8, y + Math.sin(an) * 8); lc.stroke(); }
  const leafT2 = new THREE.CanvasTexture(leafCv); leafT2.wrapS = leafT2.wrapT = THREE.RepeatWrapping; leafT2.repeat.set(5, 3); leafT2.encoding = THREE.sRGBEncoding;
  const puff = (rx, ry, rz, cx, cy, cz, seed, dim) => { const geo = new THREE.SphereGeometry(1, 34, 22), P = geo.attributes.position, col = []; for (let i = 0; i < P.count; i++) { const x = P.getX(i), y = P.getY(i), z = P.getZ(i), d = 0.13 * Math.sin(x * 3.3 + y * 2.1 + seed) + 0.1 * Math.sin(z * 4.1 - x * 2.3 + seed * 2) + 0.07 * Math.sin(y * 6 + z * 4.5 + seed), k = 1 + d; P.setXYZ(i, x * k * rx, y * k * ry, z * k * rz); const lt = THREE.MathUtils.smoothstep(y + d * 2, -0.6, 0.9), c = shade((0.42 + 0.5 * lt) * dim, 0.02 * Math.sin(seed + x * 3)); col.push(c.r, c.g, c.b); } geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); geo.computeVertexNormals(); const lm = new THREE.MeshLambertMaterial({ vertexColors: true, map: leafT2 }); lm.name = 'leaf'; lm.defines = { CL_NO_PASTEL: 1 }; const m = new THREE.Mesh(geo, lm); m.position.set(cx, cy, cz); m.castShadow = true; g.add(m); return m; };
  tips.forEach((p, i) => { if (i % 2 === 0 || r() > 0.5) puff(1.0 + r() * 0.7, 0.7 + r() * 0.4, 1.0 + r() * 0.7, p.x + (r() - 0.5) * 0.8, p.y + 0.15, p.z + (r() - 0.5) * 0.8, 3 + i, 0.85 + r() * 0.3); });
  puff(2.4, 1.3, 2.4, bt.x, topY + 2.9, bt.z, 21, 0.95);
  /* tendões pendurados com orbes fantasmagóricos */
  const orbA = new THREE.MeshBasicMaterial({ color: 0xc9ffb0 }), orbB = new THREE.MeshBasicMaterial({ color: 0xd6b8ff });
  for (let i = 0; i < 18; i++) { const p = tips[Math.floor(r() * tips.length)], len = 1.6 + r() * 2.4, x = p.x + (r() - 0.5) * 0.8, z = p.z + (r() - 0.5) * 0.8; tube([V(x, p.y - 0.1, z), V(x + 0.18, p.y - len * 0.5, z - 0.12), V(x - 0.06, p.y - len, z + 0.1)], 0.05, 0.015, barkD, 5); add(g, new THREE.SphereGeometry(0.1 + r() * 0.07, 10, 8), i % 3 ? orbA : orbB, x - 0.06, p.y - len - 0.08, z + 0.1).castShadow = false; }
  /* caveiras nas raízes, lápides com runas e corvos nos galhos */
  const bone = lam(0xe8e2cf), sock = lam(0x0a060a);
  for (const [x, z, ry] of [[-1.7, 0.9, 0.5], [1.9, 0.6, -0.6], [0.2, -3.0, 3.1]]) { const sk = new THREE.Group(); sk.position.set(x, 0.16, z); sk.rotation.y = ry; g.add(sk); add(sk, new THREE.SphereGeometry(0.2, 10, 8), bone, 0, 0.15, 0).scale.set(1, 0.9, 1.1); box(sk, 0.2, 0.08, 0.16, bone, 0, 0.02, 0.1); for (const sx of [-1, 1]) add(sk, new THREE.SphereGeometry(0.06, 6, 5), sock, sx * 0.08, 0.17, 0.16); add(sk, cone(0.03, 0.06, 4), sock, 0, 0.1, 0.2).rotation.x = Math.PI / 2; }
  for (const [x, z, s, ry] of [[-2.4, 1.6, 0.6, 0.3], [2.5, 1.2, 0.55, -0.4], [-2.6, -0.4, 0.5, 0.6], [2.6, -0.9, 0.52, -0.5], [-0.9, -3.2, 0.5, 0.1]]) { const st = box(g, 0.5 * s * 2, 0.9 * s * 2, 0.16, M.rock, x, 0.45 * s * 2, z); st.rotation.y = ry; st.rotation.z = (x > 0 ? -1 : 1) * 0.1; add(g, new THREE.SphereGeometry(0.25 * s * 2, 8, 6, 0, 6.28, 0, 1.57), M.rock, x, 0.9 * s * 2, z).rotation.y = ry; const rn = box(g, 0.2 * s * 2, 0.03, 0.02, new THREE.MeshBasicMaterial({ color: 0x9dffb0 }), x + Math.sin(ry) * 0.09, 0.62 * s * 2, z + Math.cos(ry) * 0.09); rn.rotation.y = ry; }
  const crow = lam(0x15101a), beakM = lam(0xe0a030);
  [tips[2], tips[7], tips[11]].forEach((p, i) => { if (!p) return; const c = new THREE.Group(); c.position.set(p.x, p.y + 0.22, p.z); c.rotation.y = i * 2.2; g.add(c); add(c, new THREE.SphereGeometry(0.16, 8, 6), crow, 0, 0, 0).scale.set(0.8, 0.8, 1.3); add(c, new THREE.SphereGeometry(0.09, 8, 6), crow, 0, 0.1, 0.2); add(c, cone(0.03, 0.1, 4), beakM, 0, 0.1, 0.3).rotation.x = Math.PI / 2; add(c, cone(0.07, 0.3, 4), crow, 0, -0.02, -0.28).rotation.x = -1.9; });
  /* lagoa na frente com ilhota de pedra onde o ovo flutua; pedras de passagem e margem de rochas */
  const pz = 1.95, water = new THREE.Mesh(new THREE.CircleGeometry(1, 48), new THREE.ShaderMaterial({ uniforms: { uT: CL_INC_U.uT }, transparent: true, depthWrite: false, vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }', fragmentShader: 'varying vec2 vUv; uniform float uT; void main(){ vec2 p = vUv - 0.5; float rr = length(p) * 2.0; float rp = sin(rr * 22.0 - uT * 2.0) * 0.5 + 0.5; float spk = pow(max(0.0, sin(p.x * 46.0 + uT * 1.3) * sin(p.y * 41.0 - uT * 1.1)), 14.0); vec3 col = mix(vec3(0.08, 0.38, 0.42), vec3(0.03, 0.12, 0.22), rr) + rp * 0.05 + spk * 0.6; float edge = smoothstep(1.0, 0.84, rr); gl_FragColor = vec4(col, edge * 0.96); }' }));
  water.rotation.x = -Math.PI / 2; water.scale.set(2.5, 1.25, 1); water.position.set(0, 0.12, pz); g.add(water);
  for (let i = 0; i < 22; i++) { const an = i / 22 * 6.2832, s = 0.14 + r() * 0.14, rk = add(g, ico(s), i % 3 ? M.rock : M.rockL, Math.cos(an) * 2.6, s * 0.5, pz + Math.sin(an) * 1.32); rk.scale.y = 0.7; rk.rotation.y = r() * 3; }
  for (const [x, z] of [[-1.0, 0.0], [1.1, 0.3], [-1.6, -0.5]]) add(g, cyl(0.26, 0.26, 0.03, 12), lam(0x3f6a3a), x, 0.15, pz + z);
  add(g, cyl(0.92, 1.0, 0.16, 18), M.stoneWide, 0, 0.12, EZ); add(g, cyl(0.78, 0.86, 0.22, 18), M.stone, 0, 0.3, EZ); add(g, cyl(0.62, 0.7, 0.2, 18), M.stoneWide, 0, 0.5, EZ); add(g, cyl(0.52, 0.56, 0.04, 18), lam(0x241c26), 0, 0.62, EZ);
  for (const [x, z, s] of [[0.9, 0.9, 0.24], [1.4, 1.1, 0.22], [1.95, 0.9, 0.22]]) add(g, cyl(s, s * 1.08, 0.1, 10), M.stone, x, 0.1, pz + z * 0.0 + (z - 0.5));
  return g;
}

  /* ---- itens espalhados pela colônia: cada tipo tem variações; poucas faces por item (são milhares) ---- */
  const ico = (r, d) => new THREE.IcosahedronGeometry(r, d || 0), cone = (r, h, n) => new THREE.ConeGeometry(r, h, n || 5), cyl = (r1, r2, h, n) => new THREE.CylinderGeometry(r1, r2, h, n || 7);
  const dryA = lam(0xb9a35a), dryB = lam(0x8f8a46), dryC = lam(0xd2bd6a), grnA = lam(0x6aa045), grnB = lam(0x4f8a3a), purple = lam(0x9a6fc0), mushRed = lam(0xd8453a), white = lam(0xf4f1ea), stemC = lam(0xe8dcc0), tin = lam(0xb5bcc4), glassG = lam(0x5a9a5a), clothR2 = lam(0xb83a34);
  const crystalB = new THREE.MeshBasicMaterial({ color: 0x9fe6ff });
  function blades(g, n, rad, h0, h1, mats, seed) { let sd = seed; const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647; for (let i = 0; i < n; i++) { const a = r() * 6.283, d = Math.sqrt(r()) * rad, h = h0 + r() * (h1 - h0), m = add(g, cone(0.014 + r() * 0.012, h, 4), mats[i % mats.length], Math.cos(a) * d, h / 2, Math.sin(a) * d); m.rotation.z = (r() - 0.5) * 0.5; m.rotation.x = (r() - 0.5) * 0.5; m.castShadow = false; } }
  function mushroom(g, x, z, s) { add(g, cyl(0.02 * s, 0.025 * s, 0.07 * s, 5), stemC, x, 0.035 * s, z); const cap = add(g, new THREE.SphereGeometry(0.05 * s, 6, 4, 0, Math.PI * 2, 0, Math.PI / 2), mushRed, x, 0.07 * s, z); add(g, ico(0.012 * s), white, x + 0.02 * s, 0.1 * s, z); return cap; }
  function debris(kind, v) {
    const g = new THREE.Group(), R = M.rock;
    if (kind === 'pedra') {
      if (v === 0) { const a = add(g, ico(0.34), R, 0, 0.18, 0); a.scale.set(1, 0.72, 0.85); a.rotation.y = 0.6; add(g, ico(0.17), R, 0.3, 0.09, 0.2).rotation.y = 1; add(g, ico(0.1), R, -0.3, 0.05, -0.16); const m = add(g, ico(0.2), M.moss, 0.02, 0.33, 0); m.scale.set(1, 0.4, 0.9); blades(g, 5, 0.34, 0.1, 0.22, [grnA, grnB], 5); }
      else if (v === 1) { const a = add(g, ico(0.4), M.rockL, 0, 0.1, 0); a.scale.set(1.25, 0.38, 0.9); a.rotation.y = 0.3; add(g, ico(0.13), R, 0.34, 0.07, -0.18); add(g, ico(0.08), R, -0.36, 0.04, 0.2); for (const [x, z] of [[-0.1, 0.1], [0.12, -0.05], [0.0, -0.18]]) add(g, ico(0.02), lam(0xf2c14e), x, 0.2, z); blades(g, 5, 0.4, 0.08, 0.2, [grnA, grnB], 9); }
      else { add(g, ico(0.26), R, 0, 0.14, 0).scale.set(1.1, 0.8, 1); add(g, ico(0.18), M.rockL, 0.02, 0.36, 0.02).rotation.y = 0.8; add(g, ico(0.11), R, 0, 0.52, 0); add(g, ico(0.09), R, 0.3, 0.05, 0.25); mushroom(g, -0.28, 0.2, 0.9); blades(g, 4, 0.36, 0.08, 0.18, [grnA], 3); }
    } else if (kind === 'bloco') {
      if (v === 0) { const a = add(g, ico(0.8), R, 0, 0.5, 0); a.scale.set(1, 0.8, 0.9); a.rotation.y = 0.4; add(g, ico(0.45), M.rockL, 0.62, 0.26, 0.45).rotation.y = 1; add(g, ico(0.34), R, -0.6, 0.2, -0.5); add(g, ico(0.18), R, -0.5, 0.1, 0.6); const m = add(g, ico(0.42), M.moss, 0.0, 0.88, 0); m.scale.set(1, 0.35, 0.9); blades(g, 16, 0.9, 0.12, 0.3, [grnA, grnB], 7); for (const [x, y, z, h] of [[0.1, 1.0, -0.2, 0.34], [-0.12, 0.98, 0.18, 0.24]]) add(g, cone(0.07, h, 5), crystalB, x, y + h / 2 - 0.05, z).castShadow = false; }
      else { const a = add(g, ico(0.62), R, 0, 0.6, 0); a.scale.set(0.8, 1.15, 0.8); a.rotation.y = 0.9; const sl = add(g, ico(0.5), M.rockL, 0.4, 0.4, 0.25); sl.scale.set(0.5, 1, 1.2); sl.rotation.z = -0.35; add(g, ico(0.38), R, -0.55, 0.2, 0.4); add(g, ico(0.3), R, 0.5, 0.15, -0.5); const m = add(g, ico(0.3), M.moss, -0.05, 1.12, 0); m.scale.set(1, 0.4, 1); blades(g, 8, 0.9, 0.1, 0.24, [grnA, grnB], 11); add(g, cone(0.08, 0.3, 5), crystalB, 0.18, 0.9, 0.1).castShadow = false; mushroom(g, -0.6, 0.62, 1.3); mushroom(g, -0.5, 0.7, 0.9); }
    } else if (kind === 'mato') {
      if (v === 0) blades(g, 26, 0.34, 0.3, 0.7, [dryA, dryB, dryC], 13);
      else if (v === 1) { for (const [x, y, z, r] of [[0, 0.14, 0, 0.18], [0.2, 0.1, 0.1, 0.13], [-0.18, 0.11, 0.12, 0.14], [0.05, 0.22, -0.12, 0.12], [-0.1, 0.1, -0.2, 0.1]]) add(g, ico(r), dryB, x, y, z).scale.y = 0.8; for (let i = 0; i < 6; i++) { const a = i * 1.05, tw = add(g, cyl(0.008, 0.014, 0.3, 4), M.bark, Math.cos(a) * 0.12, 0.28, Math.sin(a) * 0.12); tw.rotation.z = Math.cos(a) * 0.6; tw.rotation.x = Math.sin(a) * 0.6; } blades(g, 5, 0.34, 0.15, 0.3, [dryA, grnB], 17); }
      else { blades(g, 20, 0.32, 0.4, 0.8, [dryC, dryA], 19); for (const [x, z, h] of [[0.15, 0.1, 0.55], [-0.2, -0.05, 0.45], [0.02, -0.22, 0.6]]) { add(g, cyl(0.008, 0.01, h, 4), grnB, x, h / 2, z); add(g, ico(0.045), purple, x, h + 0.02, z); } }
    } else if (kind === 'toco') {
      if (v === 0) { add(g, cyl(0.2, 0.26, 0.32, 8), M.bark, 0, 0.16, 0); add(g, cyl(0.195, 0.195, 0.02, 10), M.rings, 0, 0.325, 0); for (const a of [0.4, 2.3, 4.2]) { const rt = add(g, cone(0.07, 0.3, 4), M.bark, Math.cos(a) * 0.26, 0.05, Math.sin(a) * 0.26); rt.rotation.z = Math.cos(a) * 1.2; rt.rotation.x = -Math.sin(a) * 1.2; } mushroom(g, 0.3, -0.1, 1.2); mushroom(g, 0.36, -0.02, 0.8); add(g, ico(0.08), M.moss, -0.1, 0.34, 0.1).scale.y = 0.4; }
      else if (v === 1) { const lg = add(g, cyl(0.14, 0.15, 0.85, 8), M.bark, 0, 0.14, 0); lg.rotation.z = Math.PI / 2; lg.rotation.y = 0.3; const d1 = add(g, cyl(0.135, 0.135, 0.02, 8), M.rings, 0.425, 0.14, 0.13); d1.rotation.z = Math.PI / 2; d1.rotation.y = 0.3; const br = add(g, cyl(0.025, 0.04, 0.3, 5), M.bark, -0.1, 0.3, -0.05); br.rotation.z = -0.8; add(g, ico(0.12), M.moss, -0.1, 0.27, 0.05).scale.set(1.6, 0.35, 0.8); mushroom(g, 0.1, 0.18, 1); blades(g, 4, 0.4, 0.08, 0.16, [grnA], 23); }
      else { add(g, cyl(0.17, 0.23, 0.5, 8), M.bark, 0, 0.25, 0); add(g, cone(0.17, 0.2, 5), M.bark, 0.02, 0.55, 0).rotation.z = 0.15; for (let i = 0; i < 4; i++) add(g, ico(0.06), grnA, Math.cos(i * 1.6) * 0.2, 0.18 + i * 0.1, Math.sin(i * 1.6) * 0.2).scale.set(1.4, 0.5, 1); blades(g, 4, 0.32, 0.1, 0.22, [grnB], 29); mushroom(g, 0.28, 0.1, 0.9); }
    } else if (kind === 'lixo') {
      if (v === 0) { for (const [x, z, r, l] of [[0, 0, 0.3, 0.46], [0.1, 0.12, -0.5, 0.4], [-0.12, -0.1, 0.9, 0.36]]) { const p = box(g, l, 0.04, 0.1, M.plank, x, 0.05, z); p.rotation.y = r; p.rotation.z = (x + z) * 0.4; } const c = add(g, cyl(0.06, 0.06, 0.1, 8), tin, 0.28, 0.05, -0.2); c.rotation.z = 1.2; box(g, 0.02, 0.02, 0.02, dark, 0.0, 0.1, 0); }
      else if (v === 1) { const b = add(g, cyl(0.15, 0.15, 0.32, 9), M.plank, 0, 0.15, 0); b.rotation.z = Math.PI / 2; b.rotation.y = 0.5; for (const o of [-0.1, 0.1]) { const ring = add(g, cyl(0.155, 0.155, 0.02, 9), M.wood, o * Math.cos(0.5), 0.15, -o * Math.sin(0.5)); ring.rotation.z = Math.PI / 2; ring.rotation.y = 0.5; } const bk = add(g, cyl(0.07, 0.055, 0.1, 8), tin, 0.28, 0.05, 0.2); bk.rotation.x = 0.2; }
      else { for (let i = 0; i < 4; i++) box(g, 0.5, 0.04, 0.09, M.plank, 0, 0.03 + i * 0.045, (i - 1.5) * 0.02).rotation.y = i * 0.3; add(g, cyl(0.03, 0.03, 0.14, 6), glassG, 0.25, 0.07, 0.2).rotation.z = 1.4; box(g, 0.2, 0.02, 0.16, clothR2, -0.2, 0.03, 0.2).rotation.y = 0.4; }
    } else {   // sucata
      if (v === 0) { const pl = box(g, 0.6, 0.05, 0.4, M.rust, 0, 0.2, 0); pl.rotation.z = 0.25; pl.rotation.y = 0.4; for (const sx of [-1, 1]) add(g, cyl(0.025, 0.025, 0.22, 5), M.rust, sx * 0.2, 0.1, 0.08); const pi = add(g, cyl(0.06, 0.06, 0.5, 8), M.rust, 0.1, 0.06, -0.28); pi.rotation.z = Math.PI / 2; for (let i = 0; i < 4; i++) add(g, ico(0.02), tin, -0.2 + i * 0.12, 0.26 - i * 0.03, 0.1); }
      else if (v === 1) { const tr = add(g, new THREE.TorusGeometry(0.22, 0.05, 6, 12), M.rust, 0, 0.22, 0); tr.rotation.x = Math.PI / 2 - 0.4; add(g, cyl(0.12, 0.12, 0.3, 8), M.rust, 0.08, 0.15, 0.05).rotation.z = 0.3; for (const a of [0.5, 2.1]) { const w = add(g, cyl(0.008, 0.008, 0.36, 4), dark, Math.cos(a) * 0.28, 0.06, Math.sin(a) * 0.28); w.rotation.z = Math.PI / 2; w.rotation.y = a; } add(g, ico(0.05), lam(0xff9a3c), 0.22, 0.12, 0.2); }
      else { box(g, 0.3, 0.1, 0.3, M.rust, 0, 0.05, 0); add(g, cyl(0.02, 0.02, 0.5, 5), M.rust, 0, 0.35, 0); const dish = add(g, new THREE.SphereGeometry(0.2, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), M.rust, 0.04, 0.5, 0); dish.rotation.x = 2.4; add(g, cyl(0.01, 0.01, 0.16, 4), tin, 0.1, 0.55, 0.12).rotation.x = 0.8; }
    }
    return g;
  }

function castleWalls(parent, cx, cz) {
  const g = new THREE.Group();
  g.position.set(cx, 0, cz);
  parent.add(g);
  const HX = 2.7, HZ = 2.25, WH = 1.15, TH = 1.9;
  const corners = [[-HX, -HZ], [HX, -HZ], [-HX, HZ], [HX, HZ]];
  for (const [x, z] of corners) {
    add(g, new THREE.CylinderGeometry(0.5, 0.56, TH, 10), M.stone, x, TH / 2, z);
    add(g, new THREE.CylinderGeometry(0.58, 0.58, 0.1, 10), M.stoneWide, x, TH + 0.04, z);
    add(g, new THREE.ConeGeometry(0.72, 0.95, 10), M.blue, x, TH + 0.58, z);
    add(g, new THREE.BoxGeometry(0.1, 0.18, 0.04), new THREE.MeshLambertMaterial({ color: 0x232a30 }), x, TH * 0.6, z + (z > 0 ? 0.5 : -0.5));
  }
  const wall = (x0, z0, x1, z1, gate) => {
    const dx = x1 - x0, dz = z1 - z0, L = Math.hypot(dx, dz) - 1.0, mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
    const ang = Math.atan2(dx, dz);
    const w = new THREE.Group();
    w.position.set(mx, 0, mz);
    w.rotation.y = ang;
    g.add(w);
    if (gate) {
      const seg = (L - 1.3) / 2;
      for (const sg of [-1, 1]) {
        const m = add(w, new THREE.BoxGeometry(0.42, WH, seg), M.stoneWide, 0, WH / 2, sg * (0.65 + seg / 2));
      }
      add(w, new THREE.BoxGeometry(0.46, 0.34, 1.5), M.stoneWide, 0, WH - 0.17, 0);
      add(w, new THREE.BoxGeometry(0.1, 0.85, 1.05), M.plank, 0, 0.45, 0);
      add(w, new THREE.BoxGeometry(0.1, 0.06, 1.05), M.wood, 0.06, 0.88, 0);
      for (const sg of [-1, 1]) for (let i = 0; i < 3; i++) add(w, new THREE.BoxGeometry(0.46, 0.22, 0.26), M.stone, 0, WH + 0.1, sg * (0.85 + i * 0.5 + (i ? 0.1 : 0)));
      add(w, new THREE.BoxGeometry(1.1, 0.05, 0.6), M.plank, -0.5, 0.03, 0);
    } else {
      add(w, new THREE.BoxGeometry(0.42, WH, L), M.stoneWide, 0, WH / 2, 0);
      const n = Math.max(2, Math.round(L / 0.56));
      for (let i = 0; i < n; i++) add(w, new THREE.BoxGeometry(0.46, 0.22, 0.26), M.stone, 0, WH + 0.1, -L / 2 + 0.2 + (i * (L - 0.4)) / Math.max(1, n - 1));
    }
  };
  wall(-HX, -HZ, HX, -HZ);
  wall(-HX, HZ, HX, HZ, true);
  wall(-HX, -HZ, -HX, HZ);
  wall(HX, -HZ, HX, HZ);
  return g;
}
function castleTower(parent, x, z) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  parent.add(g);
  add(g, new THREE.BoxGeometry(2.5, 2.15, 2.5), M.stoneWide, 0, 1.08, 0);
  add(g, new THREE.BoxGeometry(0.7, 0.95, 0.12), new THREE.MeshLambertMaterial({ color: 0x2a3138 }), 0, 0.55, 1.26);
  add(g, new THREE.TorusGeometry(0.38, 0.07, 8, 14, Math.PI), M.stone, 0, 1.02, 1.28).rotation.x = Math.PI;
  const corners = [[-1.05, -1.05], [1.05, -1.05], [-1.05, 1.05], [1.05, 1.05]];
  for (const [cx, cz] of corners) {
    add(g, new THREE.CylinderGeometry(0.42, 0.48, 2.55, 8), M.stone, cx, 1.28, cz);
    const cone = add(g, new THREE.ConeGeometry(0.62, 0.85, 10), M.blue, cx, 2.85, cz);
    cone.castShadow = true;
  }
  for (let i = -2; i <= 2; i++) {
    if (Math.abs(i) === 0) continue;
    add(g, new THREE.BoxGeometry(0.28, 0.32, 0.28), M.stone, i * 0.42, 2.28, 1.28);
    add(g, new THREE.BoxGeometry(0.28, 0.32, 0.28), M.stone, i * 0.42, 2.28, -1.28);
    add(g, new THREE.BoxGeometry(0.28, 0.32, 0.28), M.stone, 1.28, 2.28, i * 0.42);
    add(g, new THREE.BoxGeometry(0.28, 0.32, 0.28), M.stone, -1.28, 2.28, i * 0.42);
  }
  add(g, new THREE.BoxGeometry(0.16, 0.28, 0.55), M.glass, 0, 1.55, 1.28);
  const pole = add(g, new THREE.CylinderGeometry(0.03, 0.03, 0.7, 6), M.wood, 1.05, 3.35, -1.05);
  const flag = add(g, new THREE.PlaneGeometry(0.55, 0.32), M.clothB, 1.32, 3.55, -1.05);
  flag.castShadow = false;
  const pole2 = add(g, new THREE.CylinderGeometry(0.03, 0.03, 0.7, 6), M.wood, -1.05, 3.35, -1.05);
  const flag2 = add(g, new THREE.PlaneGeometry(0.5, 0.28), M.clothR, -1.32, 3.55, -1.05);
  flag2.castShadow = false;
  return g;
}

function castleMoat(parent) {   /* fosso de água em volta da muralha, com ponte de madeira na frente do portão */
  const g = new THREE.Group(); parent.add(g);
  const IX = 3.5, IZ = 3.05, W = 1.05, OX = IX + W, OZ = IZ + W, H = 0.05;
  const wm = M.moatWater;
  const seg = (cx, cz, sx, sz) => add(g, new THREE.BoxGeometry(sx, H, sz), wm, cx, H / 2, cz);
  seg(0, -(IZ + W / 2), OX * 2, W); seg(0, IZ + W / 2, OX * 2, W); seg(-(IX + W / 2), 0, W, IZ * 2); seg(IX + W / 2, 0, W, IZ * 2);
  const rim = (cx, cz, sx, sz) => add(g, new THREE.BoxGeometry(sx, 0.11, sz), M.stoneWide, cx, 0.055, cz);
  rim(0, -OZ, OX * 2 + 0.14, 0.14); rim(0, OZ, OX * 2 + 0.14, 0.14); rim(-OX, 0, 0.14, OZ * 2); rim(OX, 0, 0.14, OZ * 2);
  rim(0, -IZ, IX * 2, 0.12); rim(-IX, 0, 0.12, IZ * 2); rim(IX, 0, 0.12, IZ * 2);
  { const gap = 1.5 / 2 + 0.12, L = IX - gap; rim(-(gap + L / 2), IZ, L, 0.12); rim(gap + L / 2, IZ, L, 0.12); }
  const BW = 1.5, BL = W + 0.5;   /* ponte */
  for (let i = 0; i < 7; i++) add(g, new THREE.BoxGeometry(BW, 0.07, BL / 7 - 0.02), M.plank, 0, 0.09, IZ - 0.05 + (i + 0.5) * (BL / 7));
  for (const sx of [-1, 1]) { add(g, new THREE.BoxGeometry(0.08, 0.1, BL), M.wood, sx * (BW / 2 + 0.02), 0.07, IZ - 0.05 + BL / 2); for (const t of [0.1, 0.5, 0.9]) add(g, new THREE.BoxGeometry(0.08, 0.34, 0.08), M.wood, sx * (BW / 2 + 0.02), 0.2, IZ - 0.05 + BL * t); add(g, new THREE.BoxGeometry(0.06, 0.05, BL), M.wood, sx * (BW / 2 + 0.02), 0.36, IZ - 0.05 + BL / 2); }
  return g;
}
        const api = { castleWalls, castleTower, castleMoat, mill, tavern, smithy, barn, watchtower, cabin, farmyard, silo, guard, mine, debris, bigTree, dragonTree, recolor, M, THREE };
        return (C.api = api);
    }

    /* moldes prontos (um por prédio e tamanho) e a montagem de cada peça do jogo */
    function clProtoTpl(kind) {
        const THREE = clTh(); if (!THREE) return null; const A = clProtoKit(THREE), C = CLM._pk, T = C.tpl || (C.tpl = {}); if (T[kind]) return T[kind];
        const root = new THREE.Group(), M = A.M; let g;
        if (kind === 'forja') { g = A.smithy(root, 0, 0, 0, 1); A.recolor(g, { stoneWide: 0xa9a29c, stone: 0xa9a29c, tile: M.slate, wood: M.woodW }); }
        else if (kind === 'armazem') { g = A.barn(root, 0, 0, 0, 1); A.recolor(g, { plank: 0xe07060, tile: M.shingleB, wood: M.woodW }); }
        else if (kind === 'silo') { g = A.silo(root, 0, 0); }
        else if (kind === 'fazenda') { g = A.farmyard(root); }
        else if (kind === 'moinho') { g = A.mill(root, 0, 0); A.recolor(g, { wood: M.woodW, plank: M.plankW }); }
        else if (kind === 'torre_vigia') { g = A.watchtower(root, 0, 0, 1); A.recolor(g, { blue: M.slate }); A.guard(root, 0.0, 1.97, 0.14); }
        else if (kind === 'cabana') { g = A.cabin(root, 0, 0, 0, 1); A.recolor(g, { wood: 0xb08a68 }); }
        else if (kind.indexOf('mina') === 0) { g = A.mine(root, +kind.slice(4) || 1); }
        else if (kind === 'covil') { g = A.castleWalls(root, 0, 0); A.recolor(g, { wood: M.woodW }); A.castleTower(root, 0, 0); A.castleMoat(root); }
        else if (kind.indexOf('covil') === 0) { g = A.castleWalls(root, 0, 0); A.recolor(g, { wood: M.woodW }); A.castleTower(root, 0, 0); A.castleMoat(root); }
        else if (kind === 'sobrado') { g = A.tavern(root, 0, 0, 0, 1); A.recolor(g, { plaster: 0xc4d8ee, tile: M.blue, wood: M.woodH }); }
        else return null;
        return (T[kind] = clMergeByMat(root, THREE));
    }
    const CL_PROTO_SC = { forja: [0.84, 0.88, 0.92, 0.96, 1.0], fazenda: [1, 1, 1, 1, 1], armazem: [0.62, 0.68, 0.5, 0.52, 0.54], mina: [1, 1, 1, 1, 1], moinho: [0.66, 0.7, 0.74, 0.78, 0.82], torre_vigia: [0.58, 0.63, 0.68, 0.73, 0.78], cabana: [0.5, 0.54, 0.58, 0.62, 0.66], sobrado: [0.7, 0.72, 0.74, 0.76, 0.78], covil: [1.22, 1.26, 1.3, 1.34, 1.38] };
    const CL_PROTO_AT = { forja: [0, 0, 0.05], fazenda: [0, 0, 0], armazem: [0, 0, 0], mina: [0, 0, 0], moinho: [0, 0, 0], torre_vigia: [0, 0, 0], cabana: [0, 0, 0], sobrado: [0, 0, -0.05], covil: [0, 0, 0] };
    function clProtoUse(grp, kind, level, cv) {   /* devolve true quando montou o prédio do protótipo; false (ou ruaProtoBuild = false) deixa o modelo antigo */
        try {
            if (window.ruaProtoBuild === false) return false; const THREE = clTh(); if (!THREE || !grp) return false;
            const L = Math.min(5, Math.max(1, level | 0)), o = { cv }, put = (tpl, k, x, y, z) => { const inst = tpl.clone(); inst.scale.setScalar(k); inst.position.set(x, y, z); grp.add(inst); inst.traverse(n => { if (n.name === 'sails') CLM.spin.push({ root: n, sp: -0.9, axis: 'z' }); }); return inst; };
            if (kind === 'armazem') {   /* o celeiro vira o Armazém: 1 celeiro, 2 maior, 3 dois celeiros, 4 com silo, 5 com cristal */
                const tpl = clProtoTpl('armazem'); if (!tpl) return false;
                if (L < 3) put(tpl, CL_PROTO_SC.armazem[L - 1], 0, 0, 0); else { put(tpl, CL_PROTO_SC.armazem[L - 1], -0.55, 0, 0); put(tpl, CL_PROTO_SC.armazem[L - 1], 0.55, 0, 0); }
                if (L >= 2) clAddPart(grp, 'fp_crate_single.glb', -0.55, 0, 0.95, 0.85, 0.85, 0.85, 0, 0.3, 0, o);
                return true;
            }
            if (kind === 'fazenda') {   /* nova Fazenda: casa de fazenda, silo, poço, feno, espantalho e cercas; os canteiros ficam à direita */
                const tpl = clProtoTpl('fazenda'); if (!tpl) return false; put(tpl, 1, 0, 0, 0);
                try { clFarmAttach(grp, level); } catch (e) {}
                return true;
            }
            const key = kind === 'mina' ? 'mina' + L : kind === 'covil' ? 'covil' + L : kind, tpl = clProtoTpl(key); if (!tpl) return false;
            const k = CL_PROTO_SC[kind][L - 1], at = CL_PROTO_AT[kind]; put(tpl, k, at[0], at[1], at[2]); if (kind === 'covil') { grp.userData.protoCovil = true; try { Object.assign(zBounds, { x0: -2.3, x1: 2.3, z0: 1.6, z1: 2.1 }); grp.userData.roof = { x: 0, y: 0.7, pz: 1.8 }; } catch (e) {} }
            if (kind === 'forja') { if (L === 4) clAddPart(grp, 'mina_crystal_blue.glb', 0.15, 1.7, 0.10, 0.22, 0.22, 0.22, 0, 0, 0, Object.assign({}, o, { glow: true, glowCol: 0xff7a22, glowInt: 2.4 })); if (L >= 5) clAddPart(grp, 'mina_crystal_blue.glb', 0.15, 1.9, 0.10, 0.32, 0.32, 0.32, 0, 0, 0, Object.assign({}, o, { glow: true, glowCol: 0xffaa33, glowInt: 3.0, spin: 1.0 })); }
            else if (kind === 'torre_vigia') { if (L >= 4) { clAddPart(grp, 'mina_crystal_blue.glb', 0.18, 2.7, 0.18, 0.18, 0.18, 0.18, 0, 0, 0, { glow: true, glowCol: 0xffd27a, glowInt: 2.0 }); clAddPart(grp, 'mina_crystal_blue.glb', -0.18, 2.7, -0.18, 0.18, 0.18, 0.18, 0, 0, 0, { glow: true, glowCol: 0xffd27a, glowInt: 2.0 }); } if (L >= 5) clAddPart(grp, 'mina_crystal_blue.glb', 0, 3.0, 0, 0.28, 0.28, 0.28, 0, 0, 0, { glow: true, glowCol: 0xffd27a, glowInt: 2.5, spin: 1.2 }); }
            else if (kind === 'sobrado') { if (L === 2) clAddPart(grp, 'fp_hay.glb', 0.74, 0, 0.7, 0.8, 0.8, 0.8, 0, 0.3, 0, o); if (L >= 3) clAddPart(grp, 'fp_crates_veg.glb', -0.78, 0, -0.7, 0.8, 0.8, 0.8, 0, -0.3, 0, o); if (L >= 4) clAddPart(grp, 'mina_crystal_blue.glb', 0, 2.2, 0, 0.28, 0.28, 0.28, 0, 0, 0, Object.assign({}, o, { glow: true, glowCol: 0xffd27a, glowInt: 2.0 })); }
            return true;
        } catch (e) { try { console.warn('prédio do protótipo', kind, e); } catch (e2) {} return false; }
    }

    const CL_DEB_VARS = { pedra: 3, bloco: 2, mato: 3, toco: 3, lixo: 3, sucata: 3 };
    function clProtoDebrisUse(k, arr) {   /* itens espalhados (pedra, mato, tronco, sujeira, sucata, rochedo): variações com textura, uma malha por material e variação de tom em cada um */
        try {
            if (window.ruaProtoBuild === false) return false; const THREE = clTh(), V = CL_DEB_VARS[k]; if (!THREE || !V) return false;
            const A = clProtoKit(THREE), C = CLM._pk, store = C.deb || (C.deb = {}), tpls = store[k] || (store[k] = [...Array(V)].map((_, v) => clMergeByMat(A.debris(k, v), THREE)));
            const mtx = new THREE.Matrix4(), q = new THREE.Quaternion(), sv = new THREE.Vector3(), pv = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0), col = new THREE.Color(), by = [...Array(V)].map(() => []);
            arr.forEach(e => by[Math.abs((e.x * 31 + e.z * 17 + e.i) % V)].push(e));
            by.forEach((list, v) => { if (!list.length) return; tpls[v].children.forEach(m => {
                const im = new THREE.InstancedMesh(m.geometry, m.material, list.length);
                list.forEach((e, j) => { q.setFromAxisAngle(up, e.rot); mtx.compose(pv.set(e.x + e.w / 2, 0, e.z + e.d / 2), q, sv.set(e.sc, e.sc, e.sc)); im.setMatrixAt(j, mtx); const h = Math.abs(Math.sin(e.i * 12.9898 + 4.1)) , h2 = Math.abs(Math.sin(e.i * 78.233 + 1.7)); col.setRGB(0.84 + h * 0.3, 0.86 + h2 * 0.26, 0.84 + (h + h2) * 0.14); im.setColorAt(j, col); });
                im.instanceMatrix.needsUpdate = true; im.instanceColor.needsUpdate = true; im.frustumCulled = false; im.castShadow = m.castShadow; im.receiveShadow = false; CL3.grp.add(im); CL3.debInst.push(im); }); });
            return true;
        } catch (e) { try { console.warn('itens do terreno', k, e); } catch (e2) {} return false; }
    }

    function clProtoIncubadora(grp, cv) {   /* Árvore Incubadora estilo Dragon City (superfície lisa, oco de coração, copa em cogumelo, lagoa); o ovo continua em 0, 1.6, 1.35 */
        try {
            if (window.ruaProtoBuild === false) return false; const THREE = clTh(); if (!THREE || !grp) return false;
            const A = clProtoKit(THREE), pal = (cv | 0) > 0 && typeof CLD !== 'undefined' && CLD.PAL && CLD.PAL[(cv | 0) - 1], hex = pal ? pal[1] : '#4aa08a';
            const root = new THREE.Group(); A.dragonTree(root, hex); clIncPatchTree(root, THREE, 0.5, 0.7); grp.add(root); return true;
        } catch (e) { try { console.warn('árvore incubadora nova', e); } catch (e2) {} return false; }
    }

/* === [SEC: ARVORE_INCUBADORA_3D] === */
    /* ===== ÁRVORE INCUBADORA MÍSTICA: vento, folhas que pulsam em ondas de luz, seiva luminosa subindo pelo tronco, espíritos de luz em espiral, pétalas caindo, névoa, círculo de runas girando, raios de luz e orbes pendurados. Tudo roda na placa de vídeo (uma hora só) ===== */
    const CL_INC_U = { uT: { value: 0 } }, CL_INC = { list: [], run: false };
    function clIncLoop() {
        if (CL_INC.run) return; CL_INC.run = true;
        const step = () => {
            const t = performance.now() / 1000; CL_INC_U.uT.value = t;
            CL_INC.list = CL_INC.list.filter(o => { let p = o.grp; while (p && p.parent) p = p.parent; return !!p && typeof CL3 !== 'undefined' && p === CL3.sc; });
            CL_INC.list.forEach(o => { try { o.fn(t); } catch (e) {} });
            if (CL_INC.list.length) requestAnimationFrame(step); else CL_INC.run = false;
        }; requestAnimationFrame(step);
    }
    function clIncPatchTree(tree, T, gl, gb) {   /* vento nos galhos, ondas de luz nas folhas e seiva subindo pelo tronco */
        const bb = new T.Box3(); tree.traverse(o => { if (o.isMesh && o.geometry) { o.geometry.computeBoundingBox(); bb.union(o.geometry.boundingBox); } });
        const H = Math.max(0.001, bb.max.y - bb.min.y), UH = { value: H }, UM = { value: bb.min.y }, UG = { value: gl == null ? 1 : gl }, UB = { value: gb == null ? 1 : gb };
        const clMat = m => { if (!m || m.isShaderMaterial || m.isMeshBasicMaterial) return m; const c = m.clone(); if (m.defines) c.defines = Object.assign({}, m.defines); return c; };   /* cópia própria: os materiais do kit são divididos com pedras, troncos e sobrado, e o brilho que anda NÃO pode vazar para eles */
        tree.traverse(o => { if (!o.isMesh) return; o.material = Array.isArray(o.material) ? o.material.map(clMat) : clMat(o.material); (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => {
            if (!m || m.isShaderMaterial || m.isMeshBasicMaterial) return; const leaf = /leaf|leaves/i.test(m.name || '');
            m.onBeforeCompile = sh => {
                sh.uniforms.uT = CL_INC_U.uT; sh.uniforms.uH = UH; sh.uniforms.uHm = UM; sh.uniforms.uG = UG; sh.uniforms.uB = UB;
                sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform float uT; uniform float uH; uniform float uHm; varying float vHn; varying float vAng;')
                    .replace('#include <begin_vertex>', '#include <begin_vertex>\n float hn = clamp((position.y - uHm) / uH, 0.0, 1.0); vHn = hn; vAng = atan(position.z, position.x);\n float sw = hn * hn * uH * 0.03 * ' + (leaf ? '1.0' : '0.0') + ';\n transformed.x += sin(uT * 0.9 + hn * 5.0) * sw + sin(uT * 2.3 + position.z * 3.0) * sw * 0.2;\n transformed.z += cos(uT * 0.7 + hn * 4.0) * sw * 0.8;' + (leaf ? '\n transformed += normal * sin(uT * 3.0 + position.x * 8.0 + position.y * 6.0) * uH * 0.004 * hn;' : ''));
                sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uT; uniform float uG; uniform float uB; varying float vHn; varying float vAng;')
                    .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n' + (leaf
                        ? ' float wv = 0.5 + 0.5 * sin(vHn * 11.0 - uT * 2.0); vec3 glw = mix(vec3(0.35, 1.0, 0.55), vec3(0.72, 0.4, 1.0), 0.5 + 0.5 * sin(uT * 0.6 + vHn * 5.0)); totalEmissiveRadiance += glw * (0.10 + 0.55 * wv * wv) * (0.4 + 0.6 * vHn) * uG;'
                        : ' float band = pow(max(0.0, sin(vHn * 22.0 + vAng * 2.0 - uT * 2.6)), 8.0); float flick = 0.6 + 0.4 * sin(uT * 3.0 + vAng * 5.0); totalEmissiveRadiance += vec3(0.55, 1.0, 0.7) * band * flick * (0.15 + 0.85 * (1.0 - vHn * 0.5)) * 0.9 * uB;'));
            };
            m.customProgramCacheKey = () => 'incT' + (leaf ? 'L' : 'B') + (m.isMeshLambertMaterial ? 'l' : 's'); m.needsUpdate = true; }); });
    }
    function clIncMystic(grp, T, cv) {
        const U = { uT: CL_INC_U.uT }, rnd = (() => { let s = 99; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
        const pts = (n, vs, fs, seedFn) => { const g = new T.BufferGeometry(), sd = new Float32Array(n * 4); for (let i = 0; i < n; i++) { const s = seedFn(i); sd.set(s, i * 4); } g.setAttribute('position', new T.BufferAttribute(new Float32Array(n * 3), 3)); g.setAttribute('aSeed', new T.BufferAttribute(sd, 4)); const m = new T.ShaderMaterial({ uniforms: U, vertexShader: vs, fragmentShader: fs, transparent: true, depthWrite: false, blending: T.AdditiveBlending }); const o = new T.Points(g, m); o.frustumCulled = false; grp.add(o); return o; };
        pts(240, 'attribute vec4 aSeed; uniform float uT; varying float vC; varying float vT;\nvoid main(){ float sp = 0.03 + aSeed.z * 0.05; float t = fract(uT * sp + aSeed.y); float ang = aSeed.y * 6.2831 + t * (5.0 + aSeed.x * 4.0); float r = (0.9 + aSeed.x * 2.6) * (0.35 + 0.65 * sin(t * 3.1416)); vec3 p = vec3(cos(ang) * r, 0.4 + t * 9.0, sin(ang) * r - 0.7); vC = aSeed.w; vT = t; vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_PointSize = (0.8 + aSeed.w * 1.8) * sin(t * 3.1416) * (320.0 / -mv.z); gl_Position = projectionMatrix * mv; }',
            'varying float vC; varying float vT; void main(){ float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, d); a *= a; vec3 col = mix(vec3(0.5, 1.0, 0.8), vec3(1.0, 0.85, 0.4), vC); gl_FragColor = vec4(col * a * 1.5, a); }', i => [rnd(), rnd(), rnd(), rnd()]);
        pts(90, 'attribute vec4 aSeed; uniform float uT; varying float vC;\nvoid main(){ float t = fract(uT * (0.03 + aSeed.z * 0.03) + aSeed.y); float ang = aSeed.x * 6.2831 + uT * 0.25; float r = 0.8 + aSeed.w * 3.2; vec3 p = vec3(cos(ang) * r + sin(uT * 1.3 + aSeed.y * 20.0) * 0.35, 9.0 - t * 8.6, sin(ang) * r - 0.7 + cos(uT * 1.1 + aSeed.x * 17.0) * 0.35); vC = aSeed.z; vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_PointSize = (0.5 + aSeed.w) * sin(t * 3.1416) * (260.0 / -mv.z); gl_Position = projectionMatrix * mv; }',
            'varying float vC; void main(){ vec2 c = gl_PointCoord - 0.5; float d = length(vec2(c.x * 1.6, c.y)); float a = smoothstep(0.5, 0.15, d); vec3 col = mix(vec3(0.55, 1.0, 0.55), vec3(1.0, 0.9, 0.5), vC); gl_FragColor = vec4(col * a * 1.1, a * 0.9); }', i => [rnd(), rnd(), rnd(), rnd()]);
        const mist = new T.Mesh(new T.RingGeometry(0.8, 3.7, 56), new T.ShaderMaterial({ uniforms: U, transparent: true, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide, vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
            fragmentShader: 'varying vec2 vUv; uniform float uT; void main(){ vec2 p = vUv - 0.5; float r = length(p) * 2.0; float a = atan(p.y, p.x); float n = 0.5 + 0.35 * sin(a * 5.0 + uT * 0.4 + sin(r * 6.0 - uT * 0.6) * 2.0) + 0.2 * sin(a * 9.0 - uT * 0.3); float e = smoothstep(0.2, 0.5, r) * smoothstep(1.0, 0.7, r); float k = n * e; gl_FragColor = vec4(vec3(0.7, 1.0, 0.9) * k * 0.5, k * 0.45); }' })); mist.rotation.x = -Math.PI / 2; mist.position.set(0, 0.3, 0.9); grp.add(mist);
        const cvs = document.createElement('canvas'); cvs.width = cvs.height = 512; const g2 = cvs.getContext('2d'); g2.translate(256, 256); g2.strokeStyle = '#ffd77a'; g2.fillStyle = '#ffd77a'; g2.lineCap = 'round';
        for (const [rad, lw] of [[240, 5], [222, 2], [150, 3], [140, 1.5]]) { g2.lineWidth = lw; g2.beginPath(); g2.arc(0, 0, rad, 0, 7); g2.stroke(); }
        for (let i = 0; i < 16; i++) { g2.save(); g2.rotate(i / 16 * 6.2832); g2.lineWidth = 3; g2.beginPath(); const k = i % 4; if (k === 0) { g2.moveTo(-9, 172); g2.lineTo(9, 172); g2.moveTo(0, 160); g2.lineTo(0, 205); g2.moveTo(-9, 205); g2.lineTo(9, 195); } else if (k === 1) { g2.moveTo(-10, 205); g2.lineTo(0, 165); g2.lineTo(10, 205); g2.moveTo(-6, 190); g2.lineTo(6, 190); } else if (k === 2) { g2.arc(0, 185, 12, 0, 6.28); g2.moveTo(0, 197); g2.lineTo(0, 210); } else { g2.moveTo(-10, 165); g2.lineTo(10, 205); g2.moveTo(10, 165); g2.lineTo(-10, 205); } g2.stroke(); g2.restore(); }
        g2.lineWidth = 3; for (let k = 0; k < 2; k++) { g2.beginPath(); for (let i = 0; i < 3; i++) { const a = i * 2.0944 + k * 1.047 - 1.5708; g2[i ? 'lineTo' : 'moveTo'](Math.cos(a) * 130, Math.sin(a) * 130); } g2.closePath(); g2.stroke(); }
        const runeT = new T.CanvasTexture(cvs), rune = new T.Mesh(new T.PlaneGeometry(6.6, 6.6), new T.MeshBasicMaterial({ map: runeT, transparent: true, depthWrite: false, blending: T.AdditiveBlending, opacity: 0.7 })); rune.rotation.x = -Math.PI / 2; rune.position.set(0, 0.2, 1.0); grp.add(rune);
        for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283 + 0.4, ray = new T.Mesh(new T.ConeGeometry(0.9 + (i % 3) * 0.3, 8.5, 18, 1, true), new T.ShaderMaterial({ uniforms: { uT: CL_INC_U.uT, uO: { value: i * 1.7 } }, transparent: true, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide, vertexShader: 'varying float vY; void main(){ vY = position.y / 8.5 + 0.5; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }', fragmentShader: 'varying float vY; uniform float uT; uniform float uO; void main(){ float a = pow(1.0 - vY, 1.6) * 0.16 * (0.55 + 0.45 * sin(uT * 0.5 + uO)); gl_FragColor = vec4(vec3(1.0, 0.95, 0.7) * a, a); }' })); ray.position.set(Math.cos(a) * 1.7, 4.8, Math.sin(a) * 1.7 - 0.7); ray.rotation.z = Math.cos(a) * 0.12; ray.rotation.x = -Math.sin(a) * 0.12; grp.add(ray); }
        const soft = typeof zSoftTex === 'function' ? zSoftTex() : null, orbs = []; for (let i = 0; i < 16; i++) { const o = new T.Sprite(new T.SpriteMaterial({ map: soft, color: i % 3 ? '#c9ffb0' : '#d6b8ff', transparent: true, depthWrite: false, blending: T.AdditiveBlending, opacity: 0.9 })); const a = rnd() * 6.283, d = 1.3 + rnd() * 2.2; o.userData = { a, d, y: 4.4 + rnd() * 3.2, s: 0.35 + rnd() * 0.45, ph: rnd() * 6 }; grp.add(o); orbs.push(o); }
        const aura = new T.Sprite(new T.SpriteMaterial({ map: soft, color: '#ffd77a', transparent: true, depthWrite: false, blending: T.AdditiveBlending, opacity: 0.5 })); aura.position.set(0, 1.6, 2.0); grp.add(aura);
        const sparks = []; for (let i = 0; i < 7; i++) { const s = new T.Sprite(new T.SpriteMaterial({ map: soft, color: '#fff3c0', transparent: true, depthWrite: false, blending: T.AdditiveBlending, opacity: 0.95 })); s.scale.setScalar(0.22); grp.add(s); sparks.push(s); }
        CL_INC.list.push({ grp, fn: t => {
            rune.rotation.z = t * 0.07; rune.material.opacity = 0.55 + 0.25 * Math.sin(t * 1.3);
            orbs.forEach(o => { const u = o.userData, a = u.a + t * 0.05; o.position.set(Math.cos(a) * u.d + Math.sin(t * 0.8 + u.ph) * 0.25, u.y + Math.sin(t * 0.9 + u.ph) * 0.3, Math.sin(a) * u.d - 0.7); o.scale.setScalar(u.s * (0.8 + 0.3 * Math.sin(t * 2 + u.ph))); });
            aura.scale.setScalar(2.6 + 0.5 * Math.sin(t * 1.6)); aura.material.opacity = 0.4 + 0.15 * Math.sin(t * 1.6);
            sparks.forEach((s, i) => { const a = t * (0.9 + i * 0.07) + i * 0.9, r = 0.55 + 0.12 * Math.sin(t * 2 + i); s.position.set(Math.cos(a) * r, 1.6 + Math.sin(t * 1.5 + i * 1.3) * 0.35, 2.0 + Math.sin(a) * r); });
        } });
        clIncLoop();
    }
    /* ---------- Entorno da água: ilhotas de rocha com espuma, névoa baixa, lanternas à deriva e ilhas flutuantes grandes ---------- */
    const CLW_FILES = { pump: 'abobora.glb', isle: 'ilha-alien.glb', tree: 'arvore-rocha.glb' };
    function clRockGeo(THREE, sd, w, h) {
        const g = new THREE.IcosahedronGeometry(1, 3), p = g.attributes.position, a = sd * 1.7, b = sd * 2.3;
        for (let i = 0; i < p.count; i++) {
            let x = p.getX(i), y = p.getY(i), z = p.getZ(i); const d = 1 + 0.2 * Math.sin(x * 3.1 + a) * Math.cos(z * 2.7 + b) + 0.11 * Math.sin(y * 5 + x * 4 + b) + 0.07 * Math.sin(z * 9 + a);
            x *= d * w; z *= d * w; y = (y < 0 ? y * 0.55 : y) * d * h; p.setXYZ(i, x, y, z);
        }
        g.computeVertexNormals();
        const n = g.attributes.normal, col = new Float32Array(p.count * 3), hw = clEvActive('halloween'), top = new THREE.Color(hw ? '#5a3f7c' : '#4f7a46').convertSRGBToLinear(), rock = new THREE.Color(hw ? '#4d4558' : '#77746f').convertSRGBToLinear(), wet = new THREE.Color(hw ? '#2a2038' : '#3c4046').convertSRGBToLinear(), c = new THREE.Color();
        for (let i = 0; i < p.count; i++) {
            const ny = n.getY(i), y = p.getY(i); c.copy(rock).lerp(top, THREE.MathUtils.smoothstep(ny, 0.55, 0.85)); c.lerp(wet, THREE.MathUtils.smoothstep(-y / h, -0.05, 0.4) * 0.8 + (y < 0.05 * h ? 0.35 : 0));
            const j = 0.9 + 0.2 * Math.sin(i * 12.9898 + sd); col[i * 3] = c.r * j; col[i * 3 + 1] = c.g * j; col[i * 3 + 2] = c.b * j;
        }
        g.setAttribute('color', new THREE.BufferAttribute(col, 3));
        let ty = 0; for (let i = 0; i < p.count; i++) if (Math.abs(p.getX(i)) < w * 0.3 && Math.abs(p.getZ(i)) < w * 0.3 && p.getY(i) > ty) ty = p.getY(i);
        g.userData.top = ty; return g;
    }
    const CL_WFOG_FS = `uniform float uTime;uniform float uN;uniform float uH;uniform float uLin;uniform float uQ;uniform vec3 uC;varying vec3 vW;${GLSL_NOISE}
        void main(){
          vec2 p=vW.xz;float ed=max(abs(p.x),abs(p.y))-uH;float dc=length(vW-cameraPosition);
          float n=uQ>.5?fbm(vec3(p*.028+vec2(uTime*.012,0.),uTime*.02))*.65+fbm(vec3(p*.07-vec2(0.,uTime*.02),3.7))*.35:.5+.25*sin(p.x*.05+uTime*.05)*sin(p.y*.04-uTime*.04);
          float a=smoothstep(.22,.62,n)*smoothstep(1.5,16.,ed)*(1.-smoothstep(260.,520.,length(p)))*smoothstep(6.,34.,dc);
          vec3 col=uC*mix(1.,.42,uN);gl_FragColor=vec4(uLin>.5?pow(col,vec3(2.2)):col,a*.5);}`;
    function clWaterBuild(hw) {
        const THREE = clTh(), s = clS(), H = s.H, sc = CL3.sc, hs = (i, j) => clHash(s.seed | 0, i, j, 91), lite = CL_TOUCH() || CL3.lowq, g = new THREE.Group(), W = CL3.wt = { g, rocks: [], lant: [], big: [], pend: [], t0: 0 }, WY = -0.6; sc.add(g);
        W.rockMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, metalness: 0, envMapIntensity: 0.6 });
        const fc = document.createElement('canvas'); fc.width = fc.height = 128; { const x = fc.getContext('2d'), gr = x.createRadialGradient(64, 64, 30, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.55, 'rgba(255,255,255,0.0)'); gr.addColorStop(0.78, 'rgba(255,255,255,0.85)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 128, 128); }
        const foamTex = W.foamTex = new THREE.CanvasTexture(fc);
        { const c2 = document.createElement('canvas'); c2.width = c2.height = 64; const x2 = c2.getContext('2d'), g2 = x2.createRadialGradient(32, 32, 2, 32, 32, 32); g2.addColorStop(0, 'rgba(0,0,0,0.9)'); g2.addColorStop(1, 'rgba(0,0,0,0)'); x2.fillStyle = g2; x2.fillRect(0, 0, 64, 64); W.shTex = new THREE.CanvasTexture(c2); }
        /* as ilhas e árvores flutuantes (seus modelos) são as ilhotas em volta da colônia; no Halloween, abóboras com vela sobre as ilhas */
        /* névoa baixa, bem leve, rente à água */
        { const col = new THREE.Color(hw ? 0x9a6cd8 : 0xcfe4f4), fm = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: { uTime: CL3.uTime, uN: CL3.uNight, uH: { value: H }, uLin: CL3.uLin || (CL3.uLin = { value: 0 }), uQ: { value: lite ? 0 : 1 }, uC: { value: col } }, vertexShader: 'varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}', fragmentShader: CL_WFOG_FS });
          const fp = new THREE.Mesh(new THREE.PlaneGeometry(1200, 1200), fm); fp.rotation.x = -Math.PI / 2; fp.position.y = WY + 0.7; fp.frustumCulled = false; fp.renderOrder = 3; g.add(fp); W.fog = fp; }
        /* lanternas à deriva: ficam sobre a água, balançam nas ondas e brilham mais à noite */
        { const pal = clStarPal(), lc = new THREE.Color(hw ? 0xff9a30 : pal[1]), nl = lite ? 9 : 16;
          for (let i = 0; i < nl; i++) {
              const L = new THREE.Group(), body = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), new THREE.MeshBasicMaterial({ color: lc.clone().multiplyScalar(1.6), toneMapped: false })), base = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.24, 0.1, 8), new THREE.MeshStandardMaterial({ color: 0x2a2320, roughness: 0.8 })), cap = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.14, 8), base.material);
              body.position.y = 0.2; base.position.y = 0.03; cap.position.y = 0.42; L.add(body, base, cap); L.scale.setScalar(2.2);
              const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: T.glow || (T.glow = glowTexture(THREE)), color: lc, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.5, fog: false })); halo.scale.set(2.6, 2.6, 1); halo.position.y = 0.25; L.add(halo);
              const d = 3.2 + hs(i, 40) * 44; W.lant.push({ L, halo, d, a: hs(i, 41) * 6.28, w: (0.004 + hs(i, 42) * 0.007) * (i % 2 ? 1 : -1), ph: hs(i, 43) * 6.28, k: 0.8 + hs(i, 44) * 0.5 }); g.add(L);
          } }
        { const TN = hw ? ['#b06bff', '#ff8a2a', '#38e0c0', '#ff4f9a', '#7aa8ff', '#a6e34a', '#ffd24a'] : ['#38e0c0', '#7aa8ff', '#ff8a5a', '#b88cff', '#a6e34a', '#ff6fae', '#ffd24a'], pick = i => TN[(i * 3 + Math.floor(hs(1, 60) * 7)) % 7];
          const nIs = 0;   /* as ilhas e árvores flutuantes antigas saíram: pesavam muito e agora há as ilhas dos elementos */   /* espalhadas em volta, distantes da borda da colônia (nunca encostam) e alternando ilha / árvore, flutuando / com a base na água */
          for (let i = 0; i < nIs; i++) {
              const kind = i % 2 ? 'tree' : 'isle', w = kind === 'isle' ? 9 + hs(i, 54) * 3 : 10 + hs(i, 54) * 3, gr = 1, aa = (i + 0.5) / nIs * 6.2832 + (hs(i, 50) - 0.5) * 0.25;
              const c = Math.max(Math.abs(Math.cos(aa)), Math.abs(Math.sin(aa))), need = H + w * 0.65 + 6 + (i % 2) * 8 + hs(i, 51) * 4, d = need / c;
              W.pend.push({ kind, x: Math.cos(aa) * d, z: Math.sin(aa) * d, h: 2.5 + hs(i, 55) * 2, w, gr, rot: hs(i, 52) * 6.28, spin: (i % 2 ? 1 : -1) * 0.01, i, tint: pick(i), tilt: (hs(i, 53) - 0.5) * 0.18, lit: !lite && i % 3 === 0 });
          } }
        if (hw) clModelLoad(CLW_FILES.pump);
    }
    function clWaterPlace(W, p) {
        const THREE = clTh(), f = CLW_FILES[p.kind], tp = f && CLM.tpl[f];
        if (!tp) return false;
        if (p.kind === 'pump') {   /* abóbora sobre a superfície da ilha (raio de cima para baixo acha o chão) */
            const h = p.host; h.grp.updateMatrixWorld(true); const rc = new THREE.Raycaster(), meshes = []; h.o.traverse(m => { if (m.isMesh) meshes.push(m); });
            const wp = new THREE.Vector3(); h.grp.getWorldPosition(wp); const hs_ = h.w * 0.3; let hit = null;
            for (let k = 0; k < 14 && !hit; k++) { const a = p.a + k * 1.3, r = hs_ * (0.2 + 0.8 * ((k * 0.37 + p.r) % 1)); rc.set(new THREE.Vector3(wp.x + Math.cos(a) * r, wp.y + h.w * 4, wp.z + Math.sin(a) * r), new THREE.Vector3(0, -1, 0)); const hh = rc.intersectObjects(meshes, false)[0]; if (hh && hh.face && hh.face.normal.y > 0.5 && hh.point.y > wp.y + h.w * 0.15) hit = hh; }
            if (!hit) return true; const o = tp.gl.scene.clone(true); o.traverse(m => { if (m.isMesh) { m.castShadow = false; m.receiveShadow = true; if (m.geometry && !m.geometry.boundingSphere) m.geometry.computeBoundingSphere(); m.frustumCulled = true; } });
            const bb = new THREE.Box3().setFromObject(o), sz = bb.getSize(new THREE.Vector3()), ctr = bb.getCenter(new THREE.Vector3()), gp = new THREE.Group(); o.position.set(-ctr.x, -bb.min.y, -ctr.z); gp.add(o); gp.scale.setScalar(h.w * 0.15 * p.sc / Math.max(sz.x, sz.z) / h.k); gp.position.copy(h.grp.worldToLocal(hit.point.clone())); gp.position.y -= 0.05 / h.k; gp.rotation.y = p.a * 3; h.grp.add(gp); return true;
        }
        const o = tp.gl.scene.clone(true), tint = new THREE.Color(p.tint), lit = tint.clone().lerp(new THREE.Color(0xffffff), 0.45), mats = [];
        o.traverse(m => { if (m.isMesh) { m.castShadow = false; m.receiveShadow = true; if (m.geometry && !m.geometry.boundingSphere) m.geometry.computeBoundingSphere(); m.frustumCulled = true; const cl = (Array.isArray(m.material) ? m.material : [m.material]).map(x => { const c = x.clone(); c.color.lerp(tint, 0.25).multiplyScalar(1.2); { const hue = [0.0, 2.1, 4.2, 1.0, 3.2, 5.2, 0.6, 2.7, 4.7][p.i % 9]; c.onBeforeCompile = sh => { sh.uniforms.uHue = { value: hue }; sh.fragmentShader = 'uniform float uHue;vec3 hueRot(vec3 c){vec3 k=vec3(.57735);float ca=cos(uHue),sa=sin(uHue);return c*ca+cross(k,c)*sa+k*dot(k,c)*(1.-ca);}\n' + sh.fragmentShader.replace('#include <map_fragment>', '#include <map_fragment>\ndiffuseColor.rgb=hueRot(diffuseColor.rgb);').replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance=hueRot(totalEmissiveRadiance);'); }; c.customProgramCacheKey = () => 'clw'; } c.envMapIntensity = 1.8; c.roughness = Math.min(c.roughness, 0.8); if (c.emissive) { if (c.emissiveMap) { c.emissive.copy(lit); mats.push({ c, e: 1.1 }); } else if (c.map) { c.emissiveMap = c.map; c.emissive.copy(lit).multiplyScalar(0.55); mats.push({ c, e: 0.7 }); } else { c.emissive.copy(tint).multiplyScalar(0.15); mats.push({ c, e: 0.6 }); } } return c; }); m.material = Array.isArray(m.material) ? cl : cl[0]; } });
        const bb = new THREE.Box3().setFromObject(o), sz = bb.getSize(new THREE.Vector3()), ctr = bb.getCenter(new THREE.Vector3()), grp = new THREE.Group();
        o.position.set(-ctr.x, -bb.min.y, -ctr.z); grp.add(o);
        const k = p.w / Math.max(sz.x, sz.z, sz.y * 0.5), y0 = p.gr ? -0.6 - sz.y * k * 0.38 : p.h; grp.scale.setScalar(k); grp.position.set(p.x, y0, p.z); grp.rotation.set(p.gr ? 0 : p.tilt, p.rot, 0, 'YXZ'); W.g.add(grp);
        const host = { grp, o, w: p.w, k, y0, gr: p.gr, ph: p.i * 2.1, spin: p.gr ? 0 : p.spin, mats, tint, x: p.x, z: p.z, ang: Math.atan2(p.z, p.x), rad: Math.hypot(p.x, p.z), orb: p.gr ? 0 : (p.i % 2 ? 1 : -1) * 0.0025, sp: [] };
        if (p.gr) { const U = CL3.floor && CL3.floor.material.uniforms.uIs, k = W.nIs = (W.nIs || 0); if (U && k < 10) { U.value[k].set(p.x, p.z, p.w * 0.38, 1); host.isK = k; W.nIs++; } }
        if (!p.gr) { const sh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: W.shTex, transparent: true, depthWrite: false, opacity: 0.55, fog: false })); sh.rotation.x = -Math.PI / 2; sh.position.set(p.x, -0.56, p.z); sh.scale.setScalar(p.w * 1.7); W.g.add(sh); host.sh = sh; }
        { const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: T.glow, color: tint, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.3, fog: false })); halo.scale.setScalar(p.w * 2.6); W.g.add(halo); host.halo = halo; }
        { const N = 26, pos = new Float32Array(N * 3), pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); const pt = new THREE.Points(pg, new THREE.PointsMaterial({ map: T.glow, color: lit, size: 7, sizeAttenuation: false, transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); pt.frustumCulled = false; W.g.add(pt); host.pts = pt; host.sp = Array.from({ length: N }, (_, q) => ({ a: q * 2.4 + p.i, r: 0.15 + ((q * 0.37) % 1) * 0.55, v: 0.05 + ((q * 0.53) % 1) * 0.07, o: (q * 0.61) % 1 })); }
        if (p.lit) { const L = new THREE.PointLight(tint, 0, p.w * 3.2, 2); W.g.add(L); host.light = L; }
        W.big.push(host);
        if (p.kind === 'isle' && clEvActive('halloween')) { const n = 2 + (p.i % 2); for (let q = 0; q < n; q++) W.pend.push({ kind: 'pump', host, a: p.i * 1.9 + q * 2.4, r: q * 0.31 + 0.13, sc: 0.9 + q * 0.25 }); }
        return true;
    }
    function clWaterStep(dt, t) {
        const W = CL3.wt; if (!W) return; const n = CL3.dayN || 0;
        if (W.pend.length) W.pend = W.pend.filter(p => !clWaterPlace(W, p));
        W.rocks.forEach(r => { const k = 1 + 0.07 * Math.sin(t * 1.4 + r.ph); r.fm.scale.setScalar(r.w * 3.6 * k); r.fm.material.opacity = 0.6 + 0.3 * Math.sin(t * 1.9 + r.ph); });
        W.lant.forEach(l => { 
            l.a += l.w * dt; 
            const sH = (typeof clS === 'function' && clS().H) || 12;
            const ca = Math.cos(l.a), sa = Math.sin(l.a);
            const c = Math.max(Math.abs(ca), Math.abs(sa), 0.01);
            const rMin = (sH + 2.8) / c;
            const wave = Math.sin(t * 0.3 + l.ph) * 1.2;
            const r = Math.max(rMin + 0.6, rMin + (l.d != null ? l.d : 4.0) + wave);
            const x = ca * r, z = sa * r; 
            l.L.position.set(x, -0.62 + 0.09 * Math.sin(t * 2.2 + l.ph), z); 
            l.L.rotation.z = Math.sin(t * 1.9 + l.ph) * 0.12; 
            l.L.rotation.x = Math.cos(t * 1.6 + l.ph) * 0.12; 
            l.halo.material.opacity = (0.4 + 0.5 * n) * (0.9 + 0.1 * Math.sin(t * 3 + l.ph)); 
        });
        W.big.forEach(b => {
            if (b.orb) { 
                b.ang += b.orb * dt; 
                const sH = (typeof clS === 'function' && clS().H) || 12;
                const c = Math.max(Math.abs(Math.cos(b.ang)), Math.abs(Math.sin(b.ang)), 0.01);
                const need = (sH + b.w * 0.65 + 6 + (b.i % 2) * 8) / c;
                const r = Math.max(need, b.rad);
                b.x = Math.cos(b.ang) * r; 
                b.z = Math.sin(b.ang) * r; 
            }
            const bob = b.gr ? Math.sin(t * 0.7 + b.ph) * 0.12 : Math.sin(t * 0.45 + b.ph) * 0.55, y = b.y0 + bob; b.grp.position.set(b.x, y, b.z); b.grp.rotation.y += b.spin * dt; b.grp.rotation.z = (b.gr ? 0.012 : 0.03) * Math.sin(t * 0.4 + b.ph);
            const gl = 0.9 + 0.1 * Math.sin(t * 1.7 + b.ph); b.mats.forEach(m => { m.c.emissiveIntensity = m.e * (1 + n * 1.2) * gl; });
            const hh = b.w * (b.gr ? 0.5 : 0.35); b.halo.position.set(b.x, y + hh, b.z); b.halo.material.opacity = (0.16 + 0.34 * n) * gl; if (b.sh) { b.sh.position.set(b.x, -0.56, b.z); b.sh.material.opacity = 0.5 * (1 - n * 0.4); }
            if (b.light) { b.light.position.set(b.x, y + b.w * 0.55, b.z); b.light.intensity = (1.2 + 3.2 * n) * gl * 3; }
            if (b.pts) { const pa = b.pts.geometry.attributes.position, hw_ = b.w; b.sp.forEach((q, i) => { const ph = (q.o + t * q.v) % 1, a = q.a + t * 0.25, r = q.r * hw_; pa.setXYZ(i, b.x + Math.cos(a) * r, y + ph * hw_ * 0.9 + (b.gr ? 0 : -hw_ * 0.1), b.z + Math.sin(a) * r); }); pa.needsUpdate = true; b.pts.material.opacity = 0.55 + 0.4 * n; }
        });
    }
/* === [SEC: FAZENDA_PLANTACAO_CASAS] === */
/* ===== cortex/36jg-colony-farm.js: A Plantação da Fazenda: canteiros (mais nível, mais canteiros), sementes pagas com biomassa, colheita que rende biomassa e cristal, plantas 3D feitas por código com crescimento, vento, rega (carga de estudo) e efeitos ===== */
    const FARM_GROW = 3600;   /* segundos até a planta amadurecer (1 h); a carga de estudo funciona como rega e dobra a velocidade */
    const FARM_SLOTS = [2, 2, 3, 4, 6, 8];   /* canteiros por nível da Fazenda (índice = nível 1 a 5; acima disso fica em 8) */
    const FARM_PLANTS = [   /* o retorno é bem maior que a produção passiva: plantar é a atividade que paga */
        { id: 'trigo', n: 'Trigo', seed: 20, b: 30, c: 4, col: '#e0b94a', ic: 'ph-grains' },
        { id: 'girassol', n: 'Girassol', seed: 60, b: 50, c: 16, col: '#ffcc2e', ic: 'ph-sun' },
        { id: 'lavanda', n: 'Lavanda', seed: 150, b: 80, c: 40, col: '#9a74e0', ic: 'ph-flower-lotus' },
        { id: 'orquidea', n: 'Orquídea', seed: 400, b: 140, c: 100, col: '#e04ab4', ic: 'ph-flower-tulip' }
    ];
    const FARM_SELL = { b: 150, c: 5 };   /* Feira: troca ruim de propósito (o excesso de biomassa não se perde) */
    const FARM = { list: [], pool: [], pscene: null, G: null, M: {}, lay: null, layK: '', dying: [], wacc: 0, sacc: 0, psig: '', pick: null };
    const FARM_DIM = 0.5;   /* a luz da colônia clareia muito: as cores das plantas entram escurecidas para aparecerem de verdade */
    const clLvSum = (s, id) => (s.pcs || []).reduce((a, p) => a + (p[0] === id ? (p[4] || 1) : 0), 0);   /* soma dos níveis de um tipo de construção */
    const farmSlotsFor = L => FARM_SLOTS[Math.max(1, Math.min(5, L | 0))];
    const fcol = hex => { const c = new (clTh().Color)(hex); return c.multiplyScalar(FARM_DIM); };
    const farmPl = id => FARM_PLANTS.find(x => x.id === id);
    const fclamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const farmBack = k => { const c1 = 1.70158, c3 = c1 + 1, u = k - 1; return 1 + c3 * u * u * u + c1 * u * u; };   /* cresce passando um pouco do ponto e assenta (efeito mola) */

    /* ---------- estado e regras ---------- */
    function clFarmS(s) { s = s || clS(); if (!s.farm || !Array.isArray(s.farm.sl)) s.farm = { sl: [] }; return s.farm; }
    function clFarmLayout(s) {   /* quais canteiros (número global) pertencem a cada Fazenda; ordem fixa por posição */
        const k = CL.ver + ':' + (s.pcs ? s.pcs.length : 0) + ':' + (CL.vRen ? 'v' : 'o'); if (FARM.lay && FARM.layK === k && FARM.laySrc === s) return FARM.lay;
        const farms = []; (s.pcs || []).forEach((p, i) => { if (p[0] === 'fazenda') farms.push({ pi: i, x: p[1], z: p[2], L: p[4] || 1 }); });
        farms.sort((a, b) => a.x - b.x || a.z - b.z); let off = 0; farms.forEach(f => { f.n = farmSlotsFor(f.L); f.off = off; off += f.n; });
        FARM.lay = { farms, total: off }; FARM.layK = k; FARM.laySrc = s; return FARM.lay;
    }
    function clFarmGrow(s, el, use) {   /* chamado por clTick: o tempo passa mesmo com o jogo fechado; a carga de estudo (rega) soma mais um tanto */
        const f = clFarmS(s), rain = (window.CL_WEATHER && window.CL_WEATHER.type === 'rain') ? (+el || 0) * 0.5 : 0, add = ((+el || 0) + (+use || 0) + rain) * (1 + Math.min(0.6, 0.12 * clLvSum(s, 'estufa')) + (typeof clZooFarmBonus === 'function' ? clZooFarmBonus(s) : 0)); if (!(add > 0)) return;   /* a Estufa acelera as plantas */   /* a chuva também rega: +50% */ const lay = clFarmLayout(s);
        for (let i = 0; i < Math.min(f.sl.length, lay.total); i++) { const x = f.sl[i]; if (x && x.g < FARM_GROW) x.g = Math.min(FARM_GROW, (+x.g || 0) + add); }
    }
    function clFarmPay(s, b, c) {   /* o que não cabe no armazém vai para a reserva das peças: nunca se perde */
        const st = clStats();
        [['b', b], ['c', c]].forEach(a => { const k = a[0], v = +a[1] || 0; if (!(v > 0)) return; const cap = st.cap[k] || 500, cur = +s.res[k] || 0, d = Math.min(Math.max(0, cap - cur), v); s.res[k] = cur + d; const ex = Math.round((v - d) * 1e4) / 1e4; if (ex > 0.01) { s.pend[k] = (s.pend[k] || 0) + ex; clGive(s, CL_RI[k], ex, clWts(s)); } });
    }
    const farmRipe = x => !!x && x.g >= FARM_GROW - 0.5;
    function clFarmPlant(si, pid, quiet) {
        if (CL.visit) return { ok: false, err: 'Só dá para plantar na sua colônia.' };
        const s = clS(), f = clFarmS(s), lay = clFarmLayout(s), pl = farmPl(pid);
        if (!pl || si < 0 || si >= lay.total) return { ok: false, err: 'Esse canteiro não existe.' };
        if (f.sl[si]) return { ok: false, err: 'Esse canteiro já está plantado.' };
        const have = +s.res.b || 0; if (have < pl.seed) return { ok: false, err: 'Faltam ' + Math.ceil(pl.seed - have) + ' de biomassa para a semente.' };
        s.res.b = have - pl.seed; f.sl[si] = { p: pid, g: 0, at: Date.now() }; CL.ver++; if (!quiet) clSave(true); return { ok: true, pl };
    }
    function clFarmHarvest(si, quiet) {
        if (CL.visit) return { ok: false, err: 'Só dá para colher na sua colônia.' };
        const s = clS(), f = clFarmS(s), x = f.sl[si]; if (!x) return { ok: false, err: 'Canteiro vazio.' }; const pl = farmPl(x.p); if (!pl) { f.sl[si] = null; return { ok: false, err: 'Planta inválida.' }; }
        if (!farmRipe(x)) return { ok: false, err: 'Ainda não está madura.' };
        const mb = 1 + Math.min(0.5, 0.1 * clLvSum(s, 'moinho')), hb = Math.round(pl.b * mb);
        { const st = clStats(), full = [['b', hb, 'biomassa'], ['c', pl.c, 'cristal']].find(a => a[1] > 0 && (+s.res[a[0]] || 0) + a[1] > (st.cap[a[0]] || 500) + 1e-6); if (full) return { ok: false, full: full[0], err: 'Armazém de ' + full[2] + ' cheio: a colheita rende ' + full[1] + ' e não cabe. Gaste um pouco ou construa Armazéns. A planta continua pronta, nada se perde.' }; }   /* nunca colhe para jogar fora */
        clFarmPay(s, hb, pl.c); f.sl[si] = null; CL.ver++; if (!quiet) clSave(true); return { ok: true, pl, b: hb, c: pl.c };   /* o Moinho aumenta a colheita */
    }
    function clFarmHarvestAll() {
        const s = clS(), f = clFarmS(s), lay = clFarmLayout(s); let n = 0, b = 0, c = 0; const items = [];
        let skip = 0, why = ''; for (let i = 0; i < lay.total; i++) { if (farmRipe(f.sl[i])) { const r = clFarmHarvest(i, true); if (r.ok) { n++; b += r.b; c += r.c; items.push({ gi: i, b: r.b, c: r.c, col: r.pl.col }); } else if (r.full) { skip++; why = r.err; } } }
        if (n) clSave(true); return { n, b, c, items, skip, why };
    }
    function clFarmEmpty(s) { const f = clFarmS(s), lay = clFarmLayout(s), a = []; for (let i = 0; i < lay.total; i++) if (!f.sl[i]) a.push(i); return a; }
    function clFarmSellBio() {
        if (CL.visit) return { ok: false, err: 'Só na sua colônia.' }; const s = clS();
        if ((+s.res.b || 0) < FARM_SELL.b) return { ok: false, err: 'Precisa de ' + FARM_SELL.b + ' de biomassa.' };
        s.res.b -= FARM_SELL.b; clFarmPay(s, 0, FARM_SELL.c); CL.ver++; clSave(true); return { ok: true };
    }
    const farmMins = (x, boosted) => { const sec = Math.max(0, FARM_GROW - (x.g || 0)) / (boosted ? 2 : 1); return sec < 90 ? Math.max(1, Math.ceil(sec)) + ' s' : sec < 5400 ? Math.ceil(sec / 60) + ' min' : (sec / 3600).toFixed(1).replace('.', ',') + ' h'; };

    /* ---------- interface: painel da Fazenda e escolha de semente ---------- */
    function clFarmPanelHTML(pi) {
        const s = clS(), lay = clFarmLayout(s), fm = lay.farms.find(x => x.pi === pi); if (!fm) return ''; const f = clFarmS(s), boosted = s.charge > 0;
        let ripe = 0, grow = 0, empty = 0, rows = '';
        for (let i = fm.off; i < fm.off + fm.n; i++) {
            const x = f.sl[i], pl = x && farmPl(x.p);
            if (!x || !pl) { empty++; rows += '<button type="button" class="cl-frow empty" data-cl="farm-slot" data-si="' + i + '"><span class="cl-fdot"><i class="ph-bold ph-plus"></i></span><span class="cl-fnm"><b>Canteiro vazio</b><small>Toque para plantar</small></span></button>'; }
            else if (farmRipe(x)) { ripe++; rows += '<button type="button" class="cl-frow ripe" data-cl="farm-slot" data-si="' + i + '" style="--c:' + pl.col + '"><span class="cl-fdot"><i class="ph-bold ' + pl.ic + '"></i></span><span class="cl-fnm"><b>' + pl.n + ' · pronta!</b><small>Toque para colher: +' + pl.b + ' biomassa' + (pl.c ? ' +' + pl.c + ' cristal' : '') + '</small></span><em>Colher</em></button>'; }
            else { grow++; const p = Math.round(100 * x.g / FARM_GROW); rows += '<button type="button" class="cl-frow grow" data-cl="farm-slot" data-si="' + i + '" style="--c:' + pl.col + '"><span class="cl-fdot"><i class="ph-bold ' + pl.ic + '"></i></span><span class="cl-fnm"><b>' + pl.n + '</b><span class="cl-pbar"><i style="width:' + p + '%"></i></span></span><em>' + farmMins(x, boosted) + '</em></button>'; }
        }
        const stat = ripe ? ripe + (ripe > 1 ? ' prontas para colher' : ' pronta para colher') : grow ? grow + ' crescendo' + (boosted ? ' · regando' : '') : 'Nada plantado ainda';
        return '<div class="cl-farm"><div class="cl-fh"><b><i class="ph-bold ph-plant"></i> Plantação</b><span class="cl-fstat">' + stat + '</span></div><div class="cl-frows">' + rows + '</div>'
            + '<div class="cl-facts"><button type="button" data-cl="farm-open" data-si="-1"' + (empty ? '' : ' disabled') + '><i class="ph-bold ph-seedling"></i><span>Plantar em todos</span></button>'
            + '<button type="button" data-cl="farm-harv-all"' + (ripe ? ' class="cl-main"' : ' disabled') + '><i class="ph-bold ph-basket"></i><span>Colher' + (ripe ? ' (' + ripe + ')' : '') + '</span></button></div>'
            + '<small class="cl-note">As sementes custam biomassa. Estudar rega as plantas: crescem o dobro da velocidade.</small></div>';
    }
    /* ---------- retorno visual: números que sobem, botão grande de colher tudo ---------- */
    function clFarmPop(px, py, html, col, delay, big) {
        const box = CL.root && CL.root.querySelector('.cl-bubs'); if (!box) return; const el = document.createElement('i'); el.className = 'cl-fpop' + (big ? ' big' : ''); el.innerHTML = html; el.style.left = px.toFixed(0) + 'px'; el.style.top = py.toFixed(0) + 'px'; el.style.setProperty('--c', col || '#ffd35c'); el.style.animationDelay = (delay || 0) + 'ms'; box.appendChild(el); setTimeout(() => el.remove(), 1700 + (delay || 0));
    }
    const farmRew = (b, c) => '<span>+' + b + ' <i class="ph-bold ph-leaf"></i></span>' + (c ? '<span class="cr">+' + c + ' <i class="ph-bold ph-diamond"></i></span>' : '');
    function clFarmSlotXY(gi) { try { const lay = clFarmLayout(clS()); for (const e of FARM.list) { const fm = lay.farms.find(q => q.pi === e.pi); if (fm && fm.off + e.k === gi) { const p = clFarmScreen(e, 0.5); if (p[0] > -20 && p[0] < CL3.w + 20 && p[1] > -20 && p[1] < CL3.h + 20) return p; } } } catch (er) {} return null; }
    function clFarmBuzz(ms) { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (er) {} }
    function clFarmHud() {   /* botão grande "Colher tudo" na colônia sempre que houver algo maduro */
        if (!CL.root) return; const dock = CL.root.querySelector('.cl-dock'); if (!dock) return; let el = dock.querySelector('.cl-fharv'), n = 0, b = 0, c = 0;
        if (!CL.visit) { const s = clS(), f = clFarmS(s), lay = clFarmLayout(s), mb = 1 + Math.min(0.5, 0.1 * clLvSum(s, 'moinho')); for (let i = 0; i < lay.total; i++) { const x = f.sl[i]; if (x && farmRipe(x)) { const pl = farmPl(x.p); if (pl) { n++; b += Math.round(pl.b * mb); c += pl.c || 0; } } } }
        if (!n) { if (el) el.remove(); return; }
        const sig = n + '|' + b + '|' + c; if (!el) { el = document.createElement('button'); el.type = 'button'; el.className = 'cl-fharv'; el.dataset.cl = 'farm-harv-all'; dock.insertBefore(el, dock.firstChild); }
        if (el.dataset.sg !== sig) { el.dataset.sg = sig; el.innerHTML = '<span class="cl-fhi"><i class="ph-fill ph-basket"></i><u>' + n + '</u></span><span class="cl-fht"><b>' + (n > 1 ? 'Colher tudo' : 'Colher') + '</b><small>' + n + (n > 1 ? ' plantas prontas' : ' planta pronta') + ' · +' + b + ' biomassa' + (c ? ' · +' + c + ' cristal' : '') + '</small></span><i class="ph-bold ph-caret-right cl-fhg"></i>'; }
    }
    function clFarmPickerClose() { const el = CL.root && CL.root.querySelector('.cl-fpick'); if (el) el.remove(); FARM.pick = null; }
    function clFarmPickerOpen(si, scope) {
        if (!CL.root) return; clFarmPickerClose(); clFarmModeSet(null); const s = clS(), empties = clFarmEmpty(s); if (!empties.length) { clMsg('Todos os canteiros estão plantados.', true); return; }
        const many = si >= 0 && empties.length > 1, all = si < 0 || (many && scope === 'all'); FARM.pick = si; FARM.pickScope = all ? 'all' : 'one'; const have = Math.floor(+s.res.b || 0), el = document.createElement('div'); el.className = 'cl-fpick'; el.dataset.si = si;
        const tgt = all ? -1 : si, nAll = empties.length;
        el.innerHTML = '<header><b><i class="ph-bold ph-seedling"></i> Plantar</b><span class="cl-fbio"><i class="ph-bold ph-leaf"></i> ' + clFmt(have) + '</span><button type="button" class="cl-x" data-cl="farm-close" aria-label="Fechar"><i class="ph-bold ph-x"></i></button></header>'
            + (many ? '<div class="cl-fseg" role="tablist"><button type="button" data-cl="farm-scope" data-sc="one" data-si="' + si + '" class="' + (all ? '' : 'on') + '"><i class="ph-bold ph-number-circle-one"></i><span>Só este canteiro</span></button><button type="button" data-cl="farm-scope" data-sc="all" data-si="' + si + '" class="' + (all ? 'on' : '') + '"><i class="ph-bold ph-squares-four"></i><span>Todos os vazios <em>' + nAll + '</em></span></button></div>' : '')
            + '<p class="cl-fsub">' + (all ? 'Escolha a semente: vai plantar em ' + nAll + ' canteiros' : 'Escolha a semente para este canteiro') + '</p>'
            + FARM_PLANTS.map(pl => { const cost = pl.seed * (all ? nAll : 1), poor = have < cost, can = Math.floor(have / pl.seed); return '<button type="button" class="cl-fcard' + (poor ? ' poor' : '') + '" data-cl="farm-sel" data-pl="' + pl.id + '" data-si="' + tgt + '"' + (have < pl.seed ? ' disabled' : '') + ' style="--c:' + pl.col + '"><span class="cl-fpdot"><i class="ph-bold ' + pl.ic + '"></i></span><span class="cl-fcn"><b>' + pl.n + '</b><small>Rende ' + pl.b + ' <i class="ph-bold ph-leaf"></i>' + (pl.c ? ' + ' + pl.c + ' <i class="ph-bold ph-diamond"></i>' : '') + '</small></span><span class="cl-fcc"><b>' + (all && !poor ? nAll + ' × ' : '') + pl.seed + '</b><small>' + (have < pl.seed ? 'falta biomassa' : all && poor ? 'planta ' + can : 'semente') + '</small></span></button>'; }).join('')
            + '<small class="cl-note">Cresce em 1 hora (estudando, em 30 min). Quanto mais cara a semente, mais cristal.</small>';
        CL.root.appendChild(el);
    }
    function clFarmClick(w, b) {
        if (w.indexOf('farm-') !== 0) return false;
        if (w === 'farm-label' && CL.visit) { clMsg('Você está visitando outra colônia.', true); return true; }
        if (w === 'farm-slot' || w === 'farm-label') { const si = parseInt(b.dataset.si, 10), s0 = clS(), x = clFarmS(s0).sl[si]; if (!x) clFarmPickerOpen(si); else if (farmRipe(x)) { const h = clFarmHarvest(si); if (h.ok) { aliveSound('coin'); clFarmBuzz(18); const xy = clFarmSlotXY(si); if (xy) { clFarmFinger(xy[0], xy[1], 'tap'); clFarmPop(xy[0], xy[1] - 26, farmRew(h.b, h.c), h.pl.col, 0); try { clJuiceFly(xy[0], xy[1], { b: h.b, c: h.c }); } catch (er) {} } clMsg(h.pl.n + ': +' + h.b + ' biomassa' + (h.c ? ' · +' + h.c + ' cristal' : '')); } else clMsg(h.err, true); clUiSel(); clUiPaint(false); } else { const pl = farmPl(x.p); clMsg((pl ? pl.n : 'Planta') + ': ' + Math.round(100 * x.g / FARM_GROW) + '% · faltam ' + farmMins(x, s0.charge > 0), false); } return true; }
        if (w === 'farm-scope') { clFarmPickerOpen(parseInt(b.dataset.si, 10), b.dataset.sc); return true; }
        if (w === 'farm-open') { clFarmPickerOpen(parseInt(b.dataset.si, 10)); return true; }
        if (w === 'farm-mode-stop') { clFarmModeSet(null); return true; }
        if (w === 'farm-close') { clFarmPickerClose(); return true; }
        if (w === 'farm-sel') {
            const pid = b.dataset.pl, si = parseInt(b.dataset.si, 10); let n = 0, err = '';
            if (si >= 0) { const r = clFarmPlant(si, pid); if (r.ok) n = 1; else err = r.err; }
            else { const em = clFarmEmpty(clS()); for (let i = 0; i < em.length; i++) { const r = clFarmPlant(em[i], pid, true); if (r.ok) n++; else { err = r.err; break; } } if (n) clSave(true); }
            if (n) { aliveSound('chirp'); clMsg('Plantado: ' + n + ' × ' + farmPl(pid).n); clFarmPickerClose(); if (si >= 0 && clFarmEmpty(clS()).length) clFarmModeSet(pid); } else if (err) clMsg(err, true);
            clUiSel(); clUiPaint(false); return true;
        }
        if (w === 'farm-harv-all') { const pos = []; const r = clFarmHarvestAll(); if (r.n) { r.items.forEach((it, k) => { const xy = clFarmSlotXY(it.gi); setTimeout(() => { try { aliveSound('coin'); } catch (er) {} }, k * 110); if (xy) { clFarmFinger(xy[0], xy[1], 'tap'); clFarmPop(xy[0], xy[1] - 26, farmRew(it.b, it.c), it.col, k * 110); } }); clFarmPop(CL3.w / 2, CL3.h * 0.42, '<span>+' + r.b + ' <i class="ph-bold ph-leaf"></i></span>' + (r.c ? '<span class="cr">+' + r.c + ' <i class="ph-bold ph-diamond"></i></span>' : ''), '#ffd35c', 120 + r.n * 60, true); clFarmBuzz([18, 40, 18]); try { clJuiceFly(CL3.w / 2, CL3.h * 0.42, { b: r.b, c: r.c }); } catch (er) {} clMsg('Colhido: ' + r.n + ' · +' + r.b + ' biomassa' + (r.c ? ' · +' + r.c + ' cristais' : '') + (r.skip ? ' · ' + r.skip + ' ficou esperando (armazém cheio)' : '')); } else if (r.skip) clMsg(r.why, true); clUiSel(); clUiPaint(false); return true; }
        if (w === 'farm-sell') { const r = clFarmSellBio(); if (r.ok) { aliveSound('coin'); clMsg('Feira: -' + FARM_SELL.b + ' biomassa, +' + FARM_SELL.c + ' cristais'); } else clMsg(r.err, true); clUiSel(); clUiPaint(false); return true; }
        return false;
    }
    function clFarmPickAt(cx, cy) {   /* qual canteiro está sob o dedo (ou null) */
        if (!FARM.list.length || !CL3.cam || !CL3.cv) return null; const THREE = clTh(), s = clS(), r = CL3.cv.getBoundingClientRect(), rc = new THREE.Raycaster();
        rc.setFromCamera(new THREE.Vector2(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1), CL3.cam);
        const hit = rc.intersectObjects(FARM.list.map(e => e.pick), false)[0]; if (!hit) return null; const e = FARM.list.find(q => q.pick === hit.object); if (!e) return null;
        const fm = clFarmLayout(s).farms.find(q => q.pi === e.pi); return fm ? { e, gi: fm.off + e.k } : null;
    }
    function clFarmScreen(e, dy) { const w = farmWorld(e, dy || 0.2), pv = FARM.pv2 || (FARM.pv2 = new (clTh().Vector3)()); pv.copy(w).project(CL3.cam); return [(pv.x + 1) / 2 * CL3.w, (1 - pv.y) / 2 * CL3.h]; }
    function clFarmFinger(px, py, kind) {   /* o dedo aparece, aperta e solta no ponto: o gesto de plantar e colher */
        const box = CL.root && CL.root.querySelector('.cl-bubs'); if (!box) return null; const el = document.createElement('i'); el.className = 'cl-ffing ' + (kind || 'tap'); el.textContent = '👆'; el.style.left = px.toFixed(0) + 'px'; el.style.top = py.toFixed(0) + 'px'; box.appendChild(el); if (kind !== 'follow') setTimeout(() => el.remove(), 900); return el;
    }
    /* modo plantio: depois de escolher a semente, toque ou arraste o dedo pelos canteiros vazios */
    function clFarmModeSet(pid) {
        FARM.mode = pid ? { pid, t: Date.now() } : null; if (CL.root) { CL.root.classList.toggle('fmode', !!pid); const o = CL.root.querySelector('.cl-fseed'); if (o && !pid) o.remove(); } let chip = CL.root && CL.root.querySelector('.cl-fmode'); if (chip) chip.remove(); if (!pid || !CL.root) return; const pl = farmPl(pid);
        chip = document.createElement('div'); chip.className = 'cl-fmode'; chip.innerHTML = '<span class="cl-fdot" style="background:' + pl.col + '"><i class="ph-bold ' + pl.ic + '"></i></span><div><b>Plantando ' + pl.n + '</b><small>Toque ou arraste o dedo nos canteiros vazios</small></div><button type="button" data-cl="farm-mode-stop"><i class="ph-bold ph-check"></i><span>Pronto</span></button>'; CL.root.appendChild(chip);
        let cur = CL.root.querySelector('.cl-fseed'); if (cur) cur.remove(); cur = document.createElement('i'); cur.className = 'cl-fseed'; cur.hidden = true; cur.style.setProperty('--c', pl.col); cur.innerHTML = '<i class="ph-fill ' + pl.ic + '"></i>'; CL.root.appendChild(cur);
        if (!FARM.seedMv) { FARM.seedMv = e => { const c = CL.root && CL.root.querySelector('.cl-fseed'); if (!c) return; if (!FARM.mode || e.pointerType === 'touch') { c.hidden = true; return; } const r = CL.root.getBoundingClientRect(); c.hidden = false; c.style.transform = 'translate(' + (e.clientX - r.left).toFixed(0) + 'px,' + (e.clientY - r.top).toFixed(0) + 'px) translate(-50%,-50%)'; }; document.addEventListener('pointermove', FARM.seedMv, true); }
    }
    function clFarmModeStep() { if (FARM.mode && Date.now() - FARM.mode.t > 45000) clFarmModeSet(null); }
    function clFarmDo(gi, e, kind) {   /* ação do dedo em um canteiro: colhe se pronto, planta se vazio e há semente escolhida */
        const s = clS(), x = clFarmS(s).sl[gi], sc = clFarmScreen(e, 0.2); let r = null;
        if (x && farmRipe(x)) { const h = clFarmHarvest(gi, true); if (h.ok) { clFarmFinger(sc[0], sc[1], kind || 'tap'); clFarmPop(sc[0], sc[1] - 24, farmRew(h.b, h.c), h.pl.col, 60); clFarmBuzz(14); r = { k: 'h', b: h.b, c: h.c, pl: h.pl }; } else if (h.full) { const t0 = Date.now(); if (!(CL3.fullT > t0 - 3000)) { CL3.fullT = t0; try { clMsg(h.err, true); } catch (er) {} } } }
        else if (!x && FARM.mode) { const p = clFarmPlant(gi, FARM.mode.pid, true); if (p.ok) { FARM.mode.t = Date.now(); clFarmFinger(sc[0], sc[1], kind || 'tap'); clFarmPop(sc[0], sc[1] - 22, '<span class="sd">-' + p.pl.seed + ' <i class="ph-bold ph-leaf"></i></span>', p.pl.col, 40); clFarmBuzz(8); r = { k: 'p', pl: p.pl }; if (!clFarmEmpty(s).length) { clFarmModeSet(null); clMsg('Todos os canteiros plantados.'); } } else { clMsg(p.err, true); clFarmModeSet(null); } }
        return r;
    }
    function clFarmSwipeDown(cx, cy) {
        if (CL.visit || CL.hold || CL.tool) return null; const h = clFarmPickAt(cx, cy); if (!h) return null; return { seen: new Set(), first: h.gi, hits: [], b: 0, c: 0, n: 0, np: 0, el: null };
    }
    function clFarmSwipeMove(cx, cy, p) {
        const S = p.fs; if (!S) return; const r = CL3.cv.getBoundingClientRect();
        if (!S.el) S.el = clFarmFinger(cx - r.left, cy - r.top, 'follow'); if (S.el) { S.el.style.left = (cx - r.left).toFixed(0) + 'px'; S.el.style.top = (cy - r.top).toFixed(0) + 'px'; }
        const h = clFarmPickAt(cx, cy); if (!h || S.seen.has(h.gi)) return; S.seen.add(h.gi); const a = clFarmDo(h.gi, h.e, 'tap'); if (a) { if (a.k === 'h') { S.n++; S.b += a.b; S.c += a.c; } else S.np++; try { aliveSound(a.k === 'h' ? 'coin' : 'chirp'); } catch (er) {} }
    }
    function clFarmSwipeEnd(p) {
        const S = p.fs; if (!S) return; if (S.el) S.el.remove(); p.fs = null; if (S.n || S.np) { clSave(true); if (S.n) clMsg('Colhido: ' + S.n + ' · +' + S.b + ' biomassa' + (S.c ? ' · +' + S.c + ' cristal' : '')); else clMsg('Plantado: ' + S.np); clUiSel(); clUiPaint(false); }
    }
    function clFarmTap(cx, cy) {   /* toque num canteiro em 3D: vazio abre as sementes (ou planta, se já escolheu), maduro colhe, crescendo mostra o tempo */
        if (CL.hold || CL.tool) return false; const h = clFarmPickAt(cx, cy); if (!h) return false; const s = clS(), x = clFarmS(s).sl[h.gi];
        if (CL.visit) { clMsg('Você está visitando: só dá para plantar na sua colônia.', true); return true; }
        if (!x && !FARM.mode) { clFarmPickerOpen(h.gi); return true; }
        if (!x || farmRipe(x)) { const a = clFarmDo(h.gi, h.e, 'tap'); if (a) { clSave(true); try { aliveSound(a.k === 'h' ? 'coin' : 'chirp'); } catch (er) {} if (a.k === 'h') clMsg(a.pl.n + ': +' + a.b + ' biomassa' + (a.c ? ' · +' + a.c + ' cristal' : '')); clUiSel(); clUiPaint(false); } return true; }
        const pl = farmPl(x.p); clMsg((pl ? pl.n : 'Planta') + ': ' + Math.round(100 * x.g / FARM_GROW) + '% · faltam ' + farmMins(x, s.charge > 0) + (s.charge > 0 ? ' (regando com a carga de estudo)' : ' · estude para regar'), false); return true;
    }

    /* ---------- 3D: geometrias, materiais e plantas feitas por código ---------- */
    function farmReset() { FARM.list = []; FARM.dying = []; FARM.pool = []; FARM.G = null; FARM.M = {}; FARM.pscene = CL3.sc; FARM.fxg = null; }
    function farmG() {
        if (FARM.pscene !== CL3.sc) farmReset(); if (FARM.G) return FARM.G; const T = clTh(), st = new T.CylinderGeometry(0.02, 0.032, 1, 6); st.translate(0, 0.5, 0); const rg = new T.RingGeometry(0.4, 0.47, 32); rg.rotateX(-Math.PI / 2);
        FARM.G = { box: new T.BoxGeometry(1, 1, 1), stem: st, ell: new T.SphereGeometry(0.5, 7, 5), disc: new T.CylinderGeometry(0.5, 0.5, 1, 12), ring: rg }; return FARM.G;
    }
    function farmMat(hex, emi) { const k = hex + (emi || ''); if (FARM.pscene !== CL3.sc) farmReset(); return FARM.M[k] || (FARM.M[k] = new (clTh().MeshLambertMaterial)(emi ? { color: fcol(hex), emissive: emi } : { color: fcol(hex) })); }
    function farmLod() { const pm = clPerfMode(); return { hi: !(pm === 'leve' || pm === 'minimo' || CL3.lowq), anim: pm !== 'minimo', fx: pm === 'alta' || (pm === 'auto' && !CL3.lowq) }; }

    function farmBuild(id, hi) {   /* monta uma planta: partes que crescem em etapas (t0..t1 de 0 a 1) e partes que balançam com o vento */
        const T = clTh(), G = farmG(), root = new T.Group(), I = { id, g: root, gr: [], sw: [], col: [], mats: [], h: 0.5 }, rnd = (a, b) => a + Math.random() * (b - a);
        const mk = (geo, mat, sx, sy, sz, x, y, z, par) => { const m = new T.Mesh(geo, mat); m.scale.set(sx, sy, sz); m.position.set(x || 0, y || 0, z || 0); (par || root).add(m); return m; };
        const grp = (x, y, z, par) => { const g = new T.Group(); g.position.set(x || 0, y || 0, z || 0); (par || root).add(g); return g; };
        const grow = (o, t0, t1, md) => { o.userData.s0 = o.scale.clone(); o.userData.t0 = t0; o.userData.t1 = t1; o.userData.md = md || 'u'; I.gr.push(o); };
        const sway = (o, amp, sp, ph) => { I.sw.push({ o, amp, sp, ph, bz: o.rotation.z, bx: o.rotation.x }); };
        const own = (hex, emi) => { const m = new T.MeshLambertMaterial(emi ? { color: fcol(hex), emissive: emi } : { color: fcol(hex) }); I.mats.push(m); return m; };
        const leafAt = (par, y, ang, pitch, w, l, mat, t0, t1) => { const j = grp(0, y, 0, par); j.rotation.y = ang; j.rotation.x = -pitch; const m = mk(G.ell, mat, w, 0.022, l, 0, 0, l / 2, j); grow(m, t0, t1); return j; };
        const petals = (par, n, r, w, l, mat, t0, t1, tilt) => { for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, j = grp(Math.cos(a) * r * 0.25, 0, Math.sin(a) * r * 0.25, par); j.rotation.y = Math.PI / 2 - a; j.rotation.x = -(tilt || 0); const m = mk(G.ell, mat, w, 0.012, l, 0, 0, l / 2, j); grow(m, t0 + (t1 - t0) * 0.25 * (i / n), t1); } };
        if (id === 'trigo') {
            const sm = own('#4aae38'), em = own('#74c03a'), n = hi ? 8 : 5; I.col.push({ m: sm, a: '#4aae38', b: '#d2a63a' }, { m: em, a: '#74c03a', b: '#f2b22c' }); I.h = 0.5;
            for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + rnd(-0.3, 0.3), rr = i % 2 ? 0.075 : 0.035, h = rnd(0.36, 0.5), j = grp(Math.cos(a) * rr, 0, Math.sin(a) * rr); j.rotation.z = Math.cos(a) * 0.12; j.rotation.x = Math.sin(a) * 0.12; const s = mk(G.stem, sm, 0.55, h, 0.55, 0, 0, 0, j), ear = mk(G.ell, em, 0.05, 0.17, 0.05, 0, h + 0.05, 0, j), aw = mk(G.stem, em, 0.3, 0.07, 0.3, 0, h + 0.12, 0, j); grow(s, 0.04 + 0.02 * (i / n), 0.55, 'y'); grow(ear, 0.58 + 0.02 * (i / n), 0.96); grow(aw, 0.7, 0.98, 'y'); sway(j, 0.09, rnd(1.5, 2.1), rnd(0, 6)); }
            if (hi) { const bl = own('#3f9a30'); for (let i = 0; i < 3; i++) leafAt(root, 0, i * 2.1 + 0.4, 0.9, 0.035, 0.22, bl, 0.2, 0.6); }
        } else if (id === 'girassol') {
            const sm = own('#3a9a32'), lm = own('#2a8a2a'), disc = own('#3a2210'), pm = own('#ffb400', '#6a4400'), h = 0.66; I.h = 0.9;
            const stem = mk(G.stem, sm, 1.45, h, 1.45, 0, 0, 0); grow(stem, 0.03, 0.5, 'y'); const top = grp(0, h, 0); const bud = mk(G.ell, sm, 0.09, 0.08, 0.09, 0, 0.02, 0, top); grow(bud, 0.3, 0.55); top.rotation.x = 0.5; sway(top, 0.05, 1.3, rnd(0, 6)); I.sw[I.sw.length - 1].wx = 1;
            const nl = hi ? 4 : 2; for (let i = 0; i < nl; i++) leafAt(root, 0.1 + i * 0.12, i * 2.2 + 0.3, 0.55, 0.14, 0.22, lm, 0.16 + 0.05 * i, 0.55);
            const hd = grp(0, 0.02, 0, top); hd.rotation.x = 0.6; const d = mk(G.disc, disc, 0.17, 0.04, 0.17, 0, 0, 0, hd); grow(d, 0.6, 0.82); petals(hd, hi ? 12 : 8, 0.34, 0.07, 0.15, pm, 0.72, 0.99, -0.05);
            const sepal = mk(G.ell, sm, 0.2, 0.05, 0.2, 0, -0.03, 0, hd); grow(sepal, 0.6, 0.8);
        } else if (id === 'lavanda') {
            const sm = own('#4a9a48'), lm = own('#58a066'), s1 = own('#7a4fd0', '#2a1050'), s2 = own('#a070f0', '#3a1a70'), n = hi ? 7 : 4; I.h = 0.5;
            for (let i = 0; i < 4; i++) leafAt(root, 0, i * 1.6 + 0.2, 0.95, 0.04, 0.22, lm, 0.08, 0.5);
            for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + rnd(-0.3, 0.3), rr = rnd(0.02, 0.07), h = rnd(0.26, 0.38), j = grp(Math.cos(a) * rr, 0, Math.sin(a) * rr); j.rotation.z = Math.cos(a) * 0.22; j.rotation.x = Math.sin(a) * 0.22; const s = mk(G.stem, sm, 0.8, h, 0.8, 0, 0, 0, j), a1 = mk(G.ell, s1, 0.06, 0.13, 0.06, 0, h + 0.03, 0, j), a2 = mk(G.ell, s2, 0.042, 0.1, 0.042, 0, h + 0.11, 0, j); grow(s, 0.08, 0.5, 'y'); grow(a1, 0.55, 0.85); grow(a2, 0.68, 0.98); sway(j, 0.08, rnd(1.4, 2), rnd(0, 6)); }
        } else {   /* orquídea */
            const sm = own('#3a9a4a'), lm = own('#1f8a44'), pm = own('#e0309c', '#6a1048'), pm2 = own('#f470c8', '#7a1a60'), lip = own('#fff0fa', '#553048'), ctr = own('#ffd36a', '#6a4a00'); I.h = 0.6;
            for (let i = 0; i < 3; i++) leafAt(root, 0, i * 2.1 + 0.5, 0.5, 0.15, 0.3, lm, 0.06 + 0.04 * i, 0.5);
            const g1 = grp(0, 0, 0); g1.rotation.z = 0.12; const s1 = mk(G.stem, sm, 1.1, 0.22, 1.1, 0, 0, 0, g1); grow(s1, 0.05, 0.4, 'y');
            const g2 = grp(0, 0.22, 0, g1); g2.rotation.z = -0.38; const s2 = mk(G.stem, sm, 1, 0.2, 1, 0, 0, 0, g2); grow(s2, 0.2, 0.55, 'y');
            const g3 = grp(0, 0.2, 0, g2); g3.rotation.z = -0.45; const s3 = mk(G.stem, sm, 0.9, 0.16, 0.9, 0, 0, 0, g3); grow(s3, 0.35, 0.65, 'y'); sway(g1, 0.05, 1.2, rnd(0, 6)); sway(g3, 0.07, 1.7, rnd(0, 6));
            const fl = [[g2, 0.1, 0.035], [g2, 0.2, 0], [g3, 0.08, 0.03], [g3, 0.16, 0]].slice(0, hi ? 4 : 2);
            fl.forEach((f, i) => { const fg = grp(f[2], f[1], 0, f[0]); fg.rotation.x = 1.0; fg.rotation.z = 0.5; const t0 = 0.62 + 0.07 * i; for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2, j = grp(Math.cos(a) * 0.01, 0, Math.sin(a) * 0.01, fg); j.rotation.y = Math.PI / 2 - a; j.rotation.x = -0.15; const m = mk(G.ell, k % 2 ? pm : pm2, k % 2 ? 0.085 : 0.07, 0.012, k % 2 ? 0.08 : 0.095, 0, 0, 0.045, j); grow(m, t0, Math.min(1, t0 + 0.3)); } const lp = mk(G.ell, lip, 0.05, 0.02, 0.06, 0, 0.004, 0.0, fg); grow(lp, t0 + 0.05, Math.min(1, t0 + 0.3)); const cc = mk(G.ell, ctr, 0.022, 0.022, 0.022, 0, 0.02, 0, fg); grow(cc, t0 + 0.1, Math.min(1, t0 + 0.32)); });
        }
        I.gr.forEach(o => { o.scale.set(0, 0, 0); o.visible = false; });
        return I;
    }
    function farmApply(I, p, t, anim) {   /* p = quanto da planta já cresceu (0 a 1) */
        const ripe = p >= 0.999;
        I.gr.forEach(o => { const u = o.userData, k = fclamp((p - u.t0) / Math.max(0.001, u.t1 - u.t0), 0, 1); if (k <= 0) { o.visible = false; return; } o.visible = true; const e = anim ? farmBack(k) : k, s0 = u.s0; if (u.md === 'y') o.scale.set(s0.x * (0.55 + 0.45 * Math.min(1, e)), s0.y * e, s0.z * (0.55 + 0.45 * Math.min(1, e))); else o.scale.set(s0.x * e, s0.y * e, s0.z * e); });
        I.col.forEach(c => { if (!c.A) { const T = clTh(); c.A = fcol(c.a); c.B = fcol(c.b); } c.m.color.copy(c.A).lerp(c.B, fclamp((p - 0.3) / 0.6, 0, 1)); });
        const gust = 0.65 + 0.35 * Math.sin(t * 0.37 + I.sw.length), st = 0.25 + 0.75 * fclamp(p * 1.4, 0, 1);
        I.sw.forEach(w => { if (!anim) { w.o.rotation.z = w.bz; w.o.rotation.x = w.bx; return; } const v = Math.sin(t * w.sp + w.ph) * w.amp * gust * st; w.o.rotation.z = w.bz + v; w.o.rotation.x = w.bx + (w.wx ? v * 0.5 : Math.sin(t * w.sp * 0.8 + w.ph + 1.3) * w.amp * 0.4 * gust * st); });
        return ripe;
    }
    function farmGrid(n) {   /* canteiros no campo da Fazenda 4x3 (x de -0,2 a 2,0; z de -0,45 a 1,45): escolhe o número de colunas que dá canteiros maiores */
        const W = 2.2, Dd = 1.9; let best = null; for (let cols = 1; cols <= 4; cols++) { const rows = Math.ceil(n / cols), S = Math.min(0.85, Dd / rows - 0.07, W / cols - 0.07); if (!best || S > best.S + 0.001) best = { cols, rows, S }; }
        const { cols, rows, S } = best, cx = 0.9, dz = Dd / rows, pos = [];
        for (let i = 0; i < n; i++) { const r = Math.floor(i / cols), c = i % cols, inRow = Math.min(cols, n - r * cols), cw = W / cols; pos.push([cx + (c - (inRow - 1) / 2) * cw, -0.45 + dz * (r + 0.5)]); } return { S, pos };
    }
    function farmBed(S, x, z) {
        const T = clTh(), G = farmG(), root = new T.Group(); root.position.set(x, 0, z);
        const wd = farmMat('#9a6a3c'), wdD = farmMat('#7a4f2a'); const hs = S / 2;
        [[0, hs, S + 0.06, 0.05], [0, -hs, S + 0.06, 0.05]].forEach(([bx, bz, w, d]) => { const m = new T.Mesh(G.box, wd); m.scale.set(w, 0.09, d); m.position.set(bx, 0.045, bz); root.add(m); });
        [[hs, 0], [-hs, 0]].forEach(([bx, bz]) => { const m = new T.Mesh(G.box, wd); m.scale.set(0.05, 0.09, S); m.position.set(bx, 0.045, bz); root.add(m); });
        [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([sx, sz]) => { const m = new T.Mesh(G.box, wdD); m.scale.set(0.065, 0.17, 0.065); m.position.set(sx * hs, 0.085, sz * hs); root.add(m); });
        const soil = new T.Mesh(G.box, new T.MeshLambertMaterial({ color: fcol('#5b3a1f') })); soil.scale.set(S - 0.04, 0.06, S - 0.04); soil.position.y = 0.05; root.add(soil);
        const ridgeM = farmMat('#744a27'), rows = Math.max(3, Math.round(S / 0.17)); for (let i = 0; i < rows; i++) { const r = new T.Mesh(G.box, ridgeM); r.scale.set(S - 0.1, 0.035, 0.07); r.position.set(0, 0.092, -S / 2 + 0.09 + (S - 0.18) * (i / (rows - 1))); root.add(r); }
        const deco = new T.Group(); root.add(deco); const lm = farmMat('#3e9a45'), lit = farmMat('#6fbf4a'), nc = Math.max(2, Math.round((S - 0.14) / 0.13));   /* fileiras de mudinhas, como a horta do protótipo, enquanto o canteiro está vazio */
        for (let i = 0; i < rows; i++) { const zz = -S / 2 + 0.09 + (S - 0.18) * (i / (rows - 1)); const rb = new T.Mesh(G.box, lm); rb.scale.set(S - 0.18, 0.05, 0.07); rb.position.set(0, 0.125, zz); deco.add(rb); for (let c = 0; c < nc; c++) { const sp = new T.Mesh(G.ell, lit); sp.scale.set(0.1, 0.08, 0.1); sp.position.set(-(S - 0.2) / 2 + (S - 0.2) * (c / Math.max(1, nc - 1)), 0.16, zz); deco.add(sp); } }
        const mark = new T.Mesh(G.ring, new T.MeshBasicMaterial({ color: '#d8f2ff', transparent: true, opacity: 0.35, depthWrite: false })); mark.scale.setScalar(S * 1.05); mark.position.y = 0.1; root.add(mark);
        const glow = new T.Mesh(G.ring, new T.MeshBasicMaterial({ color: '#ffbf3a', transparent: true, opacity: 0.6, depthWrite: false, blending: T.AdditiveBlending })); glow.scale.setScalar(S * 1.2); glow.position.y = 0.1; glow.visible = false; root.add(glow);
        const pick = new T.Mesh(G.box, new T.MeshBasicMaterial({ visible: false })); pick.scale.set(S, 0.9, S); pick.position.y = 0.45; root.add(pick);
        const furr = new T.Group(); furr.position.y = 0.092; furr.visible = false; root.add(furr);
        const fm2 = new T.MeshLambertMaterial({ color: fcol('#2a170a') }); for (let i = -1; i <= 1; i++) { const r = new T.Mesh(G.box, fm2); r.scale.set(S * 0.78, 0.022, 0.05); r.position.set(0, 0, i * S * 0.24); furr.add(r); }
        const spr = new T.Group(); spr.position.y = 0.1; spr.visible = false; root.add(spr);
        const sm = new T.MeshLambertMaterial({ color: '#58d04a' }); const st0 = new T.Mesh(G.stem, sm); st0.scale.set(0.9, 0.09, 0.9); spr.add(st0);
        [-1, 1].forEach(sx => { const lf = new T.Mesh(G.ell, sm); lf.scale.set(0.085, 0.018, 0.045); lf.position.set(sx * 0.04, 0.09, 0); lf.rotation.z = sx * -0.5; spr.add(lf); });
        return { root, soil, mark, glow, pick, S, furr, spr, deco };
    }
    function clFarmAttach(grp, level) {   /* chamado ao montar a Fazenda: cria os canteiros dela */
        try {
            if (!clTh()) return; const n = farmSlotsFor(level), gd = farmGrid(n), pi = grp.userData ? grp.userData.pi : undefined, live = pi !== undefined && pi !== null, lod = farmLod();
            for (let k = 0; k < n; k++) {
                const b = farmBed(gd.S, gd.pos[k][0], gd.pos[k][1]); grp.add(b.root);
                if (!live) { b.mark.visible = false; b.pick.visible = false; b.deco.visible = false; const I = farmBuild('trigo', true); I.g.scale.setScalar(gd.S / 0.5 * 1.4); b.root.add(I.g); I.g.position.y = 0.07; farmApply(I, 1, 0, false); continue; }
                FARM.list.push({ grp, pi, k, S: gd.S, root: b.root, soil: b.soil, mark: b.mark, glow: b.glow, pick: b.pick, furr: b.furr, spr: b.spr, deco: b.deco, inst: null, shown: '', vis: 0, wet: 0, ph: Math.random() * 6, ripeT: 0 });
            }
        } catch (err) { try { console.warn('plantação', err); } catch (e2) {} }
    }

    /* ---------- efeitos (terra, gotas, faíscas, folhas, cristais) ---------- */
    function farmPoolGet() {
        const T = clTh(), G = farmG(); if (!FARM.fxg || FARM.fxg.parent !== CL3.sc) { FARM.fxg = new T.Group(); CL3.sc.add(FARM.fxg); FARM.pool = []; }
        const lod = farmLod(), max = lod.hi ? 70 : 24; for (const q of FARM.pool) if (!q.on) return q; if (FARM.pool.length >= max) return null;
        const m = new T.Mesh(G.ell, new T.MeshBasicMaterial({ color: '#fff', transparent: true, depthWrite: false })); m.visible = false; FARM.fxg.add(m); const q = { m, on: false, vx: 0, vy: 0, vz: 0, g: 0, life: 0, max: 1, sz: 0.05, add: false }; FARM.pool.push(q); return q;
    }
    function farmFx(kind, x, y, z, n, col) {
        const lod = farmLod(); if (!lod.fx || !CL3.sc) return; const T = clTh(); const P = {
            soil: { c: '#7a5636', g: 4.5, sz: 0.045, life: 0.55, up: [0.9, 1.5], out: 0.5 }, drop: { c: '#8fd0ff', g: 0, sz: 0.03, life: 0.5, up: [-1.8, -1.4], out: 0.03, dy: 0.8 },
            spark: { c: col || '#fff2a8', g: -0.15, sz: 0.032, life: 1.0, up: [0.25, 0.6], out: 0.12, add: 1 }, leaf: { c: col || '#6fcf6a', g: 2.0, sz: 0.055, life: 1.0, up: [1.1, 1.9], out: 0.7 }, crystal: { c: '#6df0ff', g: 3.4, sz: 0.05, life: 1.1, up: [1.6, 2.6], out: 0.4, add: 1 },
            splash: { c: '#e4f5ff', g: 5.5, sz: 0.05, life: 0.75, up: [1.3, 2.5], out: 0.7 }
        }[kind]; if (!P) return;
        for (let i = 0; i < n; i++) {
            const q = farmPoolGet(); if (!q) return; const a = Math.random() * Math.PI * 2, o = P.out * (0.4 + Math.random() * 0.6); q.on = true; q.vx = Math.cos(a) * o; q.vz = Math.sin(a) * o; q.vy = P.up[0] + Math.random() * (P.up[1] - P.up[0]); q.g = P.g; q.life = 0; q.max = P.life * (0.7 + Math.random() * 0.5); q.sz = P.sz * (0.7 + Math.random() * 0.6);
            q.m.material.color.set(P.c); q.m.material.blending = P.add ? T.AdditiveBlending : T.NormalBlending; q.m.material.needsUpdate = true; q.m.position.set(x + (kind === 'drop' ? (Math.random() - 0.5) * 0.3 : 0), y + (P.dy || 0), z + (kind === 'drop' ? (Math.random() - 0.5) * 0.3 : 0)); q.m.scale.setScalar(q.sz); q.m.visible = true; q.m.material.opacity = 1;
        }
    }
    function farmFxStep(dt) {
        for (const q of FARM.pool) { if (!q.on) continue; q.life += dt; if (q.life >= q.max) { q.on = false; q.m.visible = false; continue; } q.vy -= q.g * dt; q.m.position.x += q.vx * dt; q.m.position.y += q.vy * dt; q.m.position.z += q.vz * dt; const k = q.life / q.max; q.m.scale.setScalar(q.sz * (k < 0.15 ? k / 0.15 : 1 - 0.5 * k)); q.m.material.opacity = 1 - k * k; }
    }

    function clFarmLabels(lay, f, boosted) {   /* etiqueta sobre cada canteiro plantado (nome e andamento), só quando a câmera está perto */
        const box = CL.root && CL.root.querySelector('.cl-bubs'); if (!box) return; const T = clTh(), pv = FARM.pv || (FARM.pv = new T.Vector3()), near = (CL3.gdist || 20) < 22;
        FARM.list.forEach(e => { const fm = lay.farms.find(q => q.pi === e.pi); let el = e.lab; if (!fm) return; const x = f.sl[fm.off + e.k], pl = x && farmPl(x.p); if (!near || !pl) { if (el) { el.hidden = true; if (!pl) { el.remove(); e.lab = null; } } return; }
            if (!el) { el = e.lab = document.createElement('button'); el.type = 'button'; el.className = 'cl-flab'; el.dataset.cl = 'farm-label'; el.style.setProperty('pointer-events', 'auto', 'important'); el.setAttribute('aria-label', 'Interagir com plantação'); box.appendChild(el); } const w = farmWorld(e, 0.9 * (e.S / 0.5)); pv.copy(w).project(CL3.cam); if (pv.z > 1 || Math.abs(pv.x) > 1.1 || Math.abs(pv.y) > 1.1) { el.hidden = true; return; }
            el.dataset.si = String(fm.off + e.k); const ripe = farmRipe(x), pc = ripe ? 100 : Math.round(100 * x.g / FARM_GROW), txt = (ripe ? 'R' : 'G') + pl.id + '|' + (ripe ? 0 : Math.ceil((FARM_GROW - (x.g || 0)) / (boosted ? 2 : 1) / 60)) + '|' + Math.round(pc / 4); if (el.dataset.t !== txt) { el.dataset.t = txt; el.innerHTML = ripe ? '<span class="rg" style="--p:100"><i class="ph-bold ' + pl.ic + '"></i></span><b>Colher!</b>' : '<span class="rg" style="--p:' + pc + '"><i class="ph-bold ' + pl.ic + '"></i></span><b>' + farmMins(x, boosted) + '</b>' + (boosted ? '<em class="ph-bold ph-drop" title="Regando com a carga de estudo"></em>' : ''); } el.classList.toggle('ripe', ripe); el.classList.toggle('sm', (CL3.gdist || 20) >= 13); el.style.setProperty('--c', pl.col); el.hidden = false; el.style.transform = 'translate(' + ((pv.x + 1) / 2 * CL3.w).toFixed(1) + 'px,' + ((1 - pv.y) / 2 * CL3.h).toFixed(1) + 'px) translate(-50%,-100%)'; });
        box.querySelectorAll('.cl-flab').forEach(el => { if (!FARM.list.some(e => e.lab === el)) el.remove(); });
    }
    /* ---------- a cada quadro ---------- */
    function farmWorld(e, dy) { const T = clTh(); if (!FARM.v) FARM.v = new T.Vector3(); FARM.v.set(0, dy || 0, 0); e.root.localToWorld(FARM.v); return FARM.v; }
    function clFarmStep(dt, t) {
        if (!CL3.sc || !CL3.grp) return; if (FARM.pscene !== CL3.sc) farmReset(); FARM.list = FARM.list.filter(e => e.grp.parent); if (!FARM.list.length && !FARM.dying.length) return;
        const s = clS(), f = clFarmS(s), lay = clFarmLayout(s), lod = farmLod(), boosted = s.charge > 0 && !CL.visit, T = clTh();
        FARM.wacc += dt; const dropNow = FARM.wacc > 0.42; if (dropNow) FARM.wacc = 0; FARM.sacc += dt; const sparkNow = FARM.sacc > 0.5; if (sparkNow) FARM.sacc = 0;
        FARM.list.forEach(e => {
            const fm = lay.farms.find(q => q.pi === e.pi); if (!fm) return; const gi = fm.off + e.k, x = f.sl[gi], sig = x ? x.p : '', pl = x && farmPl(x.p);
            if (sig !== e.shown) {   /* planta nova ou colhida */
                if (e.inst) { const old = e.inst; e.root.remove(old.g); const w = farmWorld(e, 0.05); FARM.dying.push({ I: old, g: old.g, e, t: 0, wx: w.x, wy: w.y, wz: w.z }); if (e.wasRipe) { const pp = farmPl(e.shown); farmFx('leaf', w.x, w.y + 0.2, w.z, 9, pp && pp.col); if (pp && pp.c > 0) farmFx('crystal', w.x, w.y + 0.2, w.z, Math.min(10, 3 + pp.c / 2)); farmFx('spark', w.x, w.y + 0.2, w.z, 8); } }
                e.inst = null; e.shown = sig; e.wasRipe = false;
                if (pl) { const I = farmBuild(pl.id, lod.hi); I.g.scale.setScalar(e.S / 0.5 * 1.4); I.g.position.y = 0.07; e.root.add(I.g); e.inst = I; e.vis = x.g < 8 ? 0 : x.g / FARM_GROW; e.pop = x.g < 8 ? 0.4 : 0; if (x.g < 8) { const w = farmWorld(e, 0.1); farmFx('soil', w.x, w.y, w.z, 10); } }
            }
            const p = x ? fclamp(x.g / FARM_GROW, 0, 1) : 0; e.vis += (p - e.vis) * Math.min(1, dt * 2.5); const ripe = !!x && p >= 0.999; e.wasRipe = ripe;
            e.furr.visible = !!x; if (e.spr) { const sk = x ? 1 - fclamp((p - 0.12) / 0.2, 0, 1) : 0; e.spr.visible = sk > 0.02; if (e.spr.visible) { const bob = e.pop > 0 ? 1 + 0.35 * Math.sin((1 - e.pop / 0.4) * Math.PI) : 1; e.spr.scale.setScalar((0.55 + 0.45 * sk) * bob * (lod.anim ? 1 + 0.04 * Math.sin(t * 3 + e.ph) : 1)); } }
            { const ph = x ? 0.5 : 0.1; if (e.pick.scale.y !== ph) { e.pick.scale.y = ph; e.pick.position.y = ph / 2; e.pick.scale.x = e.pick.scale.z = e.S * 0.96; e.pick.updateMatrixWorld(true); } }   /* área de toque achatada: a caixa alta de um canteiro da frente roubava o clique do de trás */
            e.mark.visible = !x; if (e.deco) e.deco.visible = !x; e.mark.material.opacity = 0.22 + 0.16 * Math.sin(t * 2 + e.ph); e.glow.visible = ripe;
            if (ripe) { const pu = 0.5 + 0.5 * Math.sin(t * 3 + e.ph); e.glow.material.opacity = 0.35 + 0.35 * pu; e.glow.scale.setScalar(e.S * (1.0 + 0.1 * pu)); }
            const wetT = x && !ripe && boosted ? 1 : 0; e.wet += (wetT - e.wet) * Math.min(1, dt * 2); if (!e.c0) { e.c0 = fcol('#4a2f18'); e.c1 = fcol('#2a180a'); } e.soil.material.color.copy(e.c0).lerp(e.c1, Math.max(e.wet, x ? 0.25 : 0));
            if (e.inst) {
                farmApply(e.inst, e.vis, t, lod.anim); if (e.pop > 0) { e.pop = Math.max(0, e.pop - dt); const k = 1 - e.pop / 0.4; e.soil.scale.y = 0.05 * (1 + 0.8 * Math.sin(k * Math.PI)); } else e.soil.scale.y = 0.05;
                e.inst.g.position.y = 0.07 + (ripe && lod.anim ? 0.012 * Math.sin(t * 2.6 + e.ph) : 0);
                if (lod.fx) { if (ripe && sparkNow) { const w = farmWorld(e, 0.15 + 0.55 * e.inst.h * e.S / 0.5); farmFx('spark', w.x + (Math.random() - 0.5) * e.S * 0.6, w.y, w.z + (Math.random() - 0.5) * e.S * 0.6, 1, '#fff2a8'); } if (boosted && !ripe && dropNow && Math.random() < 0.6) { const w = farmWorld(e, 0.05); farmFx('drop', w.x, w.y, w.z, 1); } }
            }
        });
        try { clFarmLabels(lay, f, boosted); clFarmModeStep(); } catch (er) {}
        for (let i = FARM.dying.length - 1; i >= 0; i--) { const d = FARM.dying[i]; d.t += dt; if (d.t >= 0.4) { d.I.mats.forEach(m => m.dispose()); FARM.dying.splice(i, 1); } }
        farmFxStep(dt);
        FARM.psig = FARM.psig || ''; FARM.pt = (FARM.pt || 0) + dt; if (FARM.pt > 1) { FARM.pt = 0; try { const el = CL.sel >= 0 && CL.root && CL.root.querySelector('.cl-farm'); if (el && s.pcs[CL.sel] && s.pcs[CL.sel][0] === 'fazenda') { const html = clFarmPanelHTML(CL.sel), sg = html.replace(/style="[^"]*"/g, ''); if (sg !== FARM.psig) { FARM.psig = sg; const tmp = document.createElement('div'); tmp.innerHTML = html; const nw = tmp.firstChild; if (nw) { const keep = el.matches(':hover'); if (!keep) el.replaceWith(nw); } } } } catch (er) {} }
    }
    window.ruaFarm = { plant: clFarmPlant, harvest: clFarmHarvest, harvestAll: clFarmHarvestAll, layout: () => clFarmLayout(clS()), state: () => clFarmS(clS()), sell: clFarmSellBio, plants: FARM_PLANTS, grow: FARM_GROW, ff: sec => { const s = clS(), f = clFarmS(s); f.sl.forEach(x => { if (x) x.g = Math.min(FARM_GROW, x.g + sec); }); CL.ver++; } };
    window.ruaFarm.focus = (x, z, d, pit) => { CL3.gtx = x; CL3.gtz = z; CL3.gdist = d || 9; if (pit) CL3.gpit = pit; };
    window.ruaFarm.sel = pi => { CL.sel = pi; CL.build = false; clUiSel(); };
    window.ruaFarm.tap = clFarmTap; window.ruaFarm.list = () => FARM.list.length;

    /* ---------- a casa (chalé) evolui com o nível: cerca, flores e postes de luz feitos por código ---------- */
    function clCasaExtras(grp, level, mx) { clHomeExtras(grp, level, { fence: level >= 2, flowers: level >= 2, lamps: level >= 4 }); }
    const HOUSE_GEO = {   /* medidas dos modelos (unidades do arquivo): onde ficam a cumeeira, os beirais e a frente */
        casa: { x0: -0.07, fl: -0.95, dy: 0, ridgeY: 0.95, rh: 0.15, slope: 1.5, eave: 0.82, zr: 0.87, zf: 0.62, base: [1.4, 1.22], pk: 1 },
        chale: { rot: Math.PI / 2, x0: 0, fl: 0, dy: 0, ridgeY: 2.06, rh: 0.04, slope: 1.56, eave: 1.0, zr: 0.92, zf: 0.85, base: [2.0, 1.84], pk: 0.7 }
    };
    function clCasaUpgrades(grp, level, K, kind) {   /* mudanças na própria casa: tudo encostado nas paredes e no telhado (cumeeira ao longo de z, beirais em x) */
        const T = clTh(); if (!T) return; const M = HOUSE_GEO[kind || 'casa'], G = farmG(), host = M.rot ? new T.Group() : grp, x0 = M.x0, SL = Math.atan(M.slope), sc = K;   /* sc: do tamanho do modelo para o do grupo */
        const P = (x, y, z) => [x * sc, (y - M.fl) * sc + M.dy, z * sc], roofY = d => M.ridgeY - M.slope * (Math.abs(d) - M.rh), U = M.eave / 0.82;
        const add = (geo, mat, sx, sy, sz, x, y, z, rx, ry, rz) => { const m = new T.Mesh(geo, mat); m.scale.set(sx * sc, sy * sc, sz * sc); const p = P(x, y, z); m.position.set(p[0], p[1], p[2]); if (rx) m.rotation.x = rx; if (ry) m.rotation.y = ry; if (rz) m.rotation.z = rz; m.castShadow = true; host.add(m); return m; };
        if (M.rot) { host.rotation.y = M.rot; grp.add(host); }
        const dk = (h, f) => farmMat('#' + new T.Color(h).multiplyScalar(f || 0.55).getHexString());
        const stone = dk('#8a867e'), wood = dk('#9a6a3c'), roof = dk('#c8683a'), frame = dk('#e8dcc4'), glass = new T.MeshBasicMaterial({ color: '#ffcf70' }), solar = new T.MeshStandardMaterial({ color: '#0c1840', metalness: 0.6, roughness: 0.35 }), alu = dk('#aab4c2'), gold = new T.MeshStandardMaterial({ color: '#8a6a10', metalness: 0.7, roughness: 0.35 }), bulb = new T.MeshBasicMaterial({ color: '#ffe3a0' });
        if (level >= 2 && kind !== 'chale') {   /* base de pedra em volta das paredes */
            add(G.box, stone, M.base[0], 0.12, M.base[1], x0, M.fl + 0.06, -0.02);
        }
        if (level >= 2 && kind === 'chale') {   /* mansardas: janelas com telhadinho nos dois lados do telhado */
            [1, -1].forEach(sd => { const d = 0.62 * U, wy = roofY(d), cx = x0 + sd * (d - 0.14), cy = wy + 0.15, fx = x0 + sd * d;
                add(G.box, wood, 0.3, 0.3, 0.34, cx, cy, 0.1); add(G.box, frame, 0.012, 0.2, 0.2, fx, cy, 0.1); add(G.box, glass, 0.014, 0.16, 0.16, fx + sd * 0.002, cy, 0.1);
                add(farmCone(), roof, 0.42, 0.18, 0.42, cx + sd * 0.02, cy + 0.15 + 0.09, 0.1, 0, Math.PI / 4, 0); });
        }
        if (level >= 3 && kind !== 'chale') {   /* mansardas na casa */
            [1, -1].forEach(sd => { const wy = roofY(0.58), cx = x0 + sd * 0.44, cy = wy + 0.15, fx = x0 + sd * 0.585;
                add(G.box, wood, 0.28, 0.3, 0.32, cx, cy, 0); add(G.box, frame, 0.012, 0.19, 0.19, fx, cy, 0); add(G.box, glass, 0.014, 0.15, 0.15, fx + sd * 0.002, cy, 0);
                add(farmCone(), roof, 0.4, 0.17, 0.4, cx + sd * 0.02, cy + 0.15 + 0.085, 0, 0, Math.PI / 4, 0); });
        }
        if (level >= (kind === 'chale' ? 3 : 4)) {   /* painéis solares colados no telhado */
            const d = (kind === 'chale' ? 0.5 : 0.48) * U, zs = kind === 'chale' ? [-0.45, 0.4] : [-0.32, 0.32];
            const panels = sd => zs.forEach(z => { const y = roofY(d), nx = Math.sin(SL) * 0.03 * sd, ny = Math.cos(SL) * 0.03, rz = -sd * SL;
                add(G.box, alu, 0.54, 0.02, 0.36, x0 + sd * d + nx * 0.6, y + ny * 0.6, z, 0, 0, rz); add(G.box, solar, 0.5, 0.02, 0.32, x0 + sd * d + nx, y + ny, z, 0, 0, rz); });
            panels(1); if (level >= (kind === 'chale' ? 4 : 5)) panels(-1);
        }
        if (level >= 5) {   /* cumeeira dourada com pontas, cata-vento e luzes nos beirais da frente */
            add(G.box, gold, 0.1, 0.05, M.zr * 2, x0, M.ridgeY + 0.04, 0); [-M.zr, M.zr].forEach(z => add(G.ell, gold, 0.1, 0.1, 0.1, x0, M.ridgeY + 0.04, z));
            add(G.stem, gold, 0.5, 0.3, 0.5, x0, M.ridgeY + 0.05, M.zr * 0.7); add(G.box, gold, 0.3, 0.02, 0.025, x0, M.ridgeY + 0.35, M.zr * 0.7, 0, 0.7, 0); add(G.ell, gold, 0.06, 0.06, 0.06, x0 + 0.1, M.ridgeY + 0.35, M.zr * 0.7 + 0.04);
            [1, -1].forEach(sd => { for (let k = 0; k < 6; k++) { const dd = M.eave - ((M.eave - M.rh) / 5) * k; add(G.ell, bulb, 0.035, 0.035, 0.035, x0 + sd * dd, roofY(dd) + 0.02, M.zf + 0.18); } });
        }
    }
    let FARM_CONE = null; function farmCone() { if (FARM_CONE && FARM.pscene === CL3.sc) return FARM_CONE; farmG(); FARM_CONE = new (clTh().ConeGeometry)(0.5, 1, 4); return FARM_CONE; }
    function clHomeExtras(grp, level, cfg) {
        const T = clTh(); if (!T) return; const G = farmG(), add = (geo, mat, sx, sy, sz, x, y, z) => { const m = new T.Mesh(geo, mat); m.scale.set(sx, sy, sz); m.position.set(x, y, z); grp.add(m); return m; };
        const fz = cfg.fz || 0.93;
        if (cfg.fence) {   /* cerca baixa na frente, com abertura no meio para a porta */
            const wd = farmMat('#f0e6d2');
            [[-0.95, -0.38], [0.38, 0.95]].forEach(sg => { const n = Math.round((sg[1] - sg[0]) / 0.19); for (let i = 0; i <= n; i++) add(G.box, wd, 0.045, 0.26, 0.045, sg[0] + (sg[1] - sg[0]) * i / n, 0.13, fz); add(G.box, wd, sg[1] - sg[0], 0.03, 0.03, (sg[0] + sg[1]) / 2, 0.2, fz); add(G.box, wd, sg[1] - sg[0], 0.03, 0.03, (sg[0] + sg[1]) / 2, 0.1, fz); });
            }
        if (cfg.flowers) {
            const cols = ['#ff6fa8', '#ffd23a', '#b48aff', '#ff8a4a', '#ff6fa8', '#ffd23a'], gr = farmMat('#3f9a3a'); for (let i = 0; i < (level >= 4 ? 7 : 4); i++) { const x = -0.78 + i * 0.19 + (i > 3 ? 0.2 : 0), z = 0.74 + (i % 2) * 0.08; add(G.ell, gr, 0.17, 0.1, 0.15, x, 0.04, z); add(G.ell, new T.MeshBasicMaterial({ color: cols[i % cols.length] }), 0.07, 0.07, 0.07, x, 0.11, z); }
        }
        if (cfg.lamps) {   /* postes de luz nos cantos da frente: acendem à noite junto com as janelas */
            [-0.9, 0.9].forEach(x => { add(G.stem, farmMat('#3a3a44'), 1.6, 0.52, 1.6, x, 0, fz); add(G.ell, new T.MeshBasicMaterial({ color: '#ffe3a0' }), 0.14, 0.14, 0.14, x, 0.56, fz); });
        }
    }
    window.ruaFarm.agents = () => (CL3.agents || []).map(a => [+a.x.toFixed(1), +a.z.toFixed(1), a.st, a.act || '', a.role]);
    window.ruaFarm.screen = i => { const e = FARM.list[i]; return e ? clFarmScreen(e, 0.2) : null; }; window.ruaFarm.pickAt = clFarmPickAt; window.ruaFarm.swipe = { down: clFarmSwipeDown, move: clFarmSwipeMove, end: clFarmSwipeEnd }; window.ruaFarm.mode = clFarmModeSet; window.ruaFarm.modeOn = () => FARM.mode && FARM.mode.pid;

    /* ---------- evolução das casas continuando o desenho do próprio modelo: peças do modelo clonadas (a chaminé de pedra, por exemplo) ---------- */
    function clGeoPick(g, pred) {   /* monta uma geometria nova só com os triângulos que passam no teste (centro e normal) */
        const pos = g.attributes.position, nor = g.attributes.normal, uv = g.attributes.uv, idx = g.index, tc = (idx ? idx.count : pos.count) / 3, P = [], N = [], U = [];
        for (let t = 0; t < tc; t++) { const i = [0, 1, 2].map(k => idx ? idx.getX(t * 3 + k) : t * 3 + k); let cx = 0, cy = 0, cz = 0, ny = 0; i.forEach(v => { cx += pos.getX(v) / 3; cy += pos.getY(v) / 3; cz += pos.getZ(v) / 3; if (nor) ny += nor.getY(v) / 3; });
            if (!pred(cx, cy, cz, ny)) continue; i.forEach(v => { P.push(pos.getX(v), pos.getY(v), pos.getZ(v)); if (nor) N.push(nor.getX(v), nor.getY(v), nor.getZ(v)); if (uv) U.push(uv.getX(v), uv.getY(v)); }); }
        const o = new (clTh().BufferGeometry)(); o.setAttribute('position', new (clTh().BufferAttribute)(new Float32Array(P), 3)); if (N.length) o.setAttribute('normal', new (clTh().BufferAttribute)(new Float32Array(N), 3)); if (U.length) o.setAttribute('uv', new (clTh().BufferAttribute)(new Float32Array(U), 2)); o.computeBoundingSphere(); return o;
    }
    function clCloneAt(sub, src, geo, dx, dy, dz, mirrorX) {   /* coloca uma cópia da peça (com a mesma textura) deslocada; o espelho vira a peça para o outro lado do telhado */
        const T = clTh(); sub.updateMatrixWorld(true); const rel = new T.Matrix4().copy(sub.matrixWorld).invert().multiply(src.matrixWorld), mv = new T.Matrix4().makeTranslation(dx, dy, dz);
        if (mirrorX != null) { mv.multiply(new T.Matrix4().makeTranslation(2 * mirrorX, 0, 0)).multiply(new T.Matrix4().makeScale(-1, 1, 1)); }
        const m = new T.Mesh(geo || src.geometry, src.material); m.matrixAutoUpdate = true; rel.premultiply(mv); rel.decompose(m.position, m.quaternion, m.scale); m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; sub.add(m); return m;
    }
    function clHouseClones(sub, kind, level) {
        if (!sub) return; FARM.gcache = FARM.gcache || {}; let src = null;
        if (kind === 'casa') {
            sub.traverse(o => { if (o.isMesh && !src) src = o; }); if (!src) return;
            const g = FARM.gcache.casaChim || (FARM.gcache.casaChim = clGeoPick(src.geometry, (cx, cy, cz, ny) => cx > -0.58 && cx < -0.15 && cz > -0.5 && cz < -0.05 && cy > 0.47 && (Math.abs(ny) < 0.3 || cy > 0.88)));
            if (level >= 2) clCloneAt(sub, src, g, 0, 0, 0.62);   /* segunda chaminé, igual à original, mais adiante na cumeeira */
            if (level >= 4) clCloneAt(sub, src, g, 0, 0, 0, -0.07);   /* uma gêmea do outro lado do telhado */
            if (level >= 5) clCloneAt(sub, src, g, 0, 0, 0.62, -0.07);
        } else if (kind === 'chale') {
            sub.traverse(o => { if (o.isMesh && o.name === 'Object_9') src = o; }); if (!src) return;
            const dz = [0, 0.25, 0.5, 0.72, 0.95][Math.min(5, level) - 1];   /* o chalé fica mais comprido: a metade de trás do telhado e das paredes recua, e a chaminé e as janelas dos fundos vão junto */
            if (dz) { const back = new Set(['Object_9', 'Object_23', 'Object_24', 'Object_26', 'Object_27']), long = new Set(['Object_4', 'Object_5']);
                sub.traverse(o => { if (!o.isMesh) return; if (back.has(o.name) || long.has(o.name)) { const g = o.geometry.clone(), pos = g.attributes.position; for (let i = 0; i < pos.count; i++) if (back.has(o.name) || pos.getZ(i) < -0.1) pos.setZ(i, pos.getZ(i) - dz); pos.needsUpdate = true; g.computeBoundingSphere(); o.geometry = g; } }); }
            if (level >= 3) { let ch = null; sub.traverse(o => { if (o.isMesh && o.name === 'Object_9') ch = o; }); if (ch) clCloneAt(sub, ch, ch.geometry, 0.89, 0, 0); }
            try { clChaleTowers(sub, level, dz); } catch (e) {}   /* chaminé de pedra gêmea na outra metade da parede dos fundos */
        }
    }

    /* ---------- evolução criativa pela malha do próprio modelo: a casa ganha comprimento e andares repetindo a faixa de parede e telhado do desenho original ---------- */
    function clBandDup(g, ax, lo, hi, n, recenter) {   /* repete n vezes a faixa [lo,hi] da malha ao longo do eixo (a faixa vira "mais parede" e "mais telhado", com as janelas repetidas) */
        const T = clTh(), pos = g.attributes.position, nor = g.attributes.normal, uv = g.attributes.uv, idx = g.index, tc = (idx ? idx.count : pos.count) / 3, A = ax === 'y' ? 1 : 2, d = hi - lo, P = [], N = [], U = [];
        const push = (i3, sh) => { i3.forEach(v => { const p = [pos.getX(v), pos.getY(v), pos.getZ(v)]; p[A] += sh; P.push(p[0], p[1], p[2]); if (nor) N.push(nor.getX(v), nor.getY(v), nor.getZ(v)); if (uv) U.push(uv.getX(v), uv.getY(v)); }); };
        const rc = recenter ? -d * n / 2 : 0;
        for (let t = 0; t < tc; t++) { const i3 = [0, 1, 2].map(k => idx ? idx.getX(t * 3 + k) : t * 3 + k), c = (pos.getComponent ? 0 : 0) + (pos.getX(i3[0]) * (A === 0 ? 1 : 0)); const cc = ((A === 1 ? pos.getY(i3[0]) + pos.getY(i3[1]) + pos.getY(i3[2]) : pos.getZ(i3[0]) + pos.getZ(i3[1]) + pos.getZ(i3[2])) / 3); void c;
            if (cc < lo) push(i3, rc); else if (cc < hi) { push(i3, rc); for (let k = 1; k <= n; k++) push(i3, rc + d * k); } else push(i3, rc + d * n); }
        const o = new T.BufferGeometry(); o.setAttribute('position', new T.BufferAttribute(new Float32Array(P), 3)); if (N.length) o.setAttribute('normal', new T.BufferAttribute(new Float32Array(N), 3)); if (U.length) o.setAttribute('uv', new T.BufferAttribute(new Float32Array(U), 2)); o.computeBoundingSphere(); return o;
    }
    const CASA_EVO = { z: [0, 1, 1, 2, 2], y: [0, 0, 0, 0, 0], K: [0.84, 0.8, 0.8, 0.76, 0.76] };   /* sem andar extra: a faixa de parede duplicava a porta */   /* a casa do jogo vai até o nível 4: 2 mais comprida, 3 com andar e torres, 4 castelo completo */   /* por nível: repetições da faixa de comprimento e de andar */
    function clCasaEvolve(sub, level) {
        if (!sub) return; FARM.gcache = FARM.gcache || {}; let src = null; sub.traverse(o => { if (o.isMesh && !src) src = o; }); if (!src) return; const L = Math.min(5, level), zn = CASA_EVO.z[L - 1], yn = CASA_EVO.y[L - 1];
        const orig = FARM.gcache.casaOrig || (FARM.gcache.casaOrig = src.geometry);   /* guarda a malha original do modelo */
        const key = 'casa' + zn + '_' + yn; let g = FARM.gcache[key];
        if (!g) { g = orig; if (yn) g = clBandDup(g, 'y', -0.78, -0.36, yn, false); if (zn) g = clBandDup(g, 'z', 0.05, 0.43, zn, true); FARM.gcache[key] = g; }
        src.geometry = g;
        const chim = FARM.gcache.casaChim || (FARM.gcache.casaChim = clGeoPick(orig, (cx, cy, cz, ny) => cx > -0.58 && cx < -0.15 && cz > -0.5 && cz < -0.05 && cy > 0.47 && (Math.abs(ny) < 0.3 || cy > 0.88)));
        const dz = zn ? -(0.38 * zn) / 2 : 0, dy = yn ? 0.42 * yn : 0;
        const mk = (gz, mirror) => { const T = clTh(); sub.updateMatrixWorld(true); const m = new T.Mesh(chim, src.material); m.position.set(mirror ? 2 * -0.07 : 0, dy, gz + dz); if (mirror) m.scale.x = -1; m.castShadow = true; m.frustumCulled = false; const rel = new T.Matrix4().copy(sub.matrixWorld).invert().multiply(src.matrixWorld); const mm = new T.Matrix4().compose(m.position, m.quaternion, m.scale).multiply(new T.Matrix4()); mm.premultiply(rel.clone().multiply(new T.Matrix4())); void mm; sub.add(m); };
        if (L >= 2) mk(0.62, false);
        if (L >= 4) mk(0, true);
        try { clCasaCastle(sub, src, orig, L, zn, dy); } catch (e) {}
    }
    function clUVBox(g, pred) {   /* retângulo da textura (atlas) ocupado por um trecho do modelo: dá para pintar peças novas com a mesma madeira e as mesmas telhas */
        const pos = g.attributes.position, nor = g.attributes.normal, uv = g.attributes.uv, idx = g.index; if (!uv || !nor) return null; const tc = (idx ? idx.count : pos.count) / 3; let u0 = 9, v0 = 9, u1 = -9, v1 = -9, n = 0;
        for (let t = 0; t < tc; t++) { const i3 = [0, 1, 2].map(k => idx ? idx.getX(t * 3 + k) : t * 3 + k); let cx = 0, cy = 0, cz = 0, nx = 0, ny = 0; i3.forEach(v => { cx += pos.getX(v) / 3; cy += pos.getY(v) / 3; cz += pos.getZ(v) / 3; nx += nor.getX(v) / 3; ny += nor.getY(v) / 3; }); if (!pred(cx, cy, cz, nx, ny)) continue; n++; i3.forEach(v => { u0 = Math.min(u0, uv.getX(v)); u1 = Math.max(u1, uv.getX(v)); v0 = Math.min(v0, uv.getY(v)); v1 = Math.max(v1, uv.getY(v)); }); }
        return n >= 4 ? [u0, v0, u1, v1] : null;
    }
    function clRemapUV(g, b) { const uv = g.attributes.uv; if (!uv || !b) return g; for (let i = 0; i < uv.count; i++) uv.setXY(i, b[0] + uv.getX(i) * (b[2] - b[0]), b[1] + uv.getY(i) * (b[3] - b[1])); uv.needsUpdate = true; return g; }
    function clCasaCastle(sub, src, orig, L, zn, dy) {   /* a casa vira um mini castelo: torres redondas de madeira com ameias e telhado cônico de telhas, feitas com a textura do próprio modelo */
        if (L < 3) return; const T = clTh(); FARM.gcache = FARM.gcache || {};
        const wallB = FARM.gcache.uvWall || (FARM.gcache.uvWall = clUVBox(orig, (cx, cy, cz, nx) => Math.abs(nx) > 0.9 && cx > 0.5 && cy < -0.5 && cy > -0.88 && Math.abs(cz) < 0.45) || [0.3, 0.3, 0.4, 0.4]);
        const roofB = FARM.gcache.uvRoof || (FARM.gcache.uvRoof = clUVBox(orig, (cx, cy, cz, nx, ny) => ny > 0.4 && ny < 0.7 && cx > 0.25 && cx < 0.6 && cy > 0.2 && cy < 0.7 && Math.abs(cz) < 0.5) || wallB);
        const wH0 = 0.5, key = 'castle'; let P = FARM.gcache[key];
        const Tt = clProcTools(T, sub), BK = new T.Color(0x000000), stoneM = Tt.mat('cstle', '#a8a090', { map: Tt.stoneTex('cst1'), emissive: BK, roughness: 0.9, envMapIntensity: 0.15 }), stoneD = Tt.mat('cstle2', '#857e6f', { map: Tt.stoneTex('cst1'), emissive: BK, roughness: 0.9, envMapIntensity: 0.15 });   /* pedra de verdade na base e nas ameias: um castelo não é só de madeira */
        if (!P) { P = FARM.gcache[key] = { body: clRemapUV(new T.CylinderGeometry(0.27, 0.27, 1, 14, 1, false), wallB), stone: new T.CylinderGeometry(0.31, 0.34, 1, 14, 1, false), ring: new T.CylinderGeometry(0.33, 0.33, 0.08, 14, 1, false), cone: clRemapUV(new T.ConeGeometry(0.42, 0.62, 14, 1, false), roofB), mer: new T.BoxGeometry(0.11, 0.14, 0.09), slit: new T.BoxGeometry(0.05, 0.16, 0.05), sm: new T.MeshBasicMaterial({ color: '#241608' }), pole: new T.CylinderGeometry(0.012, 0.012, 0.34, 6), flag: new T.PlaneGeometry(0.22, 0.13), gp: new T.BoxGeometry(0.16, 0.6, 0.18), gl: new T.BoxGeometry(0.92, 0.14, 0.18), gb: new T.BoxGeometry(0.62, 0.42, 0.04), pm: new T.MeshBasicMaterial({ color: '#4a3a2a' }), wg: {}, wallG: null };
        P.wallG = len => { const k = len.toFixed(2); return P.wg[k] || (P.wg[k] = new T.BoxGeometry(0.14, wH0, len)); }; }
        const tower = (x, z, H) => {
            const Hs = H * 0.5, g0 = -0.95;
            const st = new T.Mesh(P.stone, stoneM); st.scale.set(1, Hs, 1); st.position.set(x, g0 + Hs / 2, z); st.castShadow = true; sub.add(st);   /* base de pedra */
            const rg = new T.Mesh(P.ring, stoneD); rg.position.set(x, g0 + Hs, z); sub.add(rg);
            const body = new T.Mesh(P.body, src.material); body.scale.set(1, H - Hs, 1); body.position.set(x, g0 + Hs + (H - Hs) / 2, z); body.castShadow = true; sub.add(body);   /* fuste de madeira do próprio modelo */
            const top = new T.Mesh(P.ring, stoneM); top.position.set(x, g0 + H - 0.02, z); top.scale.set(1.0, 1.1, 1.0); sub.add(top);
            for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2, m = new T.Mesh(P.mer, stoneM); m.position.set(x + Math.sin(a) * 0.325, g0 + H + 0.07, z + Math.cos(a) * 0.325); m.rotation.y = a; sub.add(m); }
            const cone = new T.Mesh(P.cone, src.material); cone.position.set(x, g0 + H + 0.31 + 0.1, z); sub.add(cone);
            [0.2].forEach(hh => [0.9, 2.6, 4.3].forEach(a => { const sl = new T.Mesh(P.slit, P.sm); sl.position.set(x + Math.sin(a) * 0.318, g0 + Hs * hh * 2 + 0.1, z + Math.cos(a) * 0.318); sl.rotation.y = a; sub.add(sl); }));
            [0.4, 0.78].forEach(hh => [0.9, 2.6, 4.3].forEach(a => { const sl = new T.Mesh(P.slit, P.sm); sl.position.set(x + Math.sin(a) * 0.272, g0 + Hs + (H - Hs) * hh, z + Math.cos(a) * 0.272); sl.rotation.y = a; sub.add(sl); }));
        };
        const g0 = -0.95, zh = 0.87 + 0.19 * zn, zb = -zh - 0.04, zf = zh + 0.1, xt = 1.02, H = 1.55 + dy * 0.5, wH = 0.5;
        const pen = (x, z, top, col) => { const pl = new T.Mesh(P.pole, P.pm); pl.position.set(x, top + 0.17, z); sub.add(pl); const fl = new T.Mesh(P.flag, new T.MeshBasicMaterial({ color: col, side: T.DoubleSide })); fl.position.set(x + 0.11, top + 0.3, z); sub.add(fl); };
        const wall = (x1, z1, x2, z2, gap) => {   /* muralha de pedra com ameias entre duas torres */
            const dx = x2 - x1, dz = z2 - z1, len = Math.hypot(dx, dz), ang = Math.atan2(dx, dz), cx = (x1 + x2) / 2, cz = (z1 + z2) / 2, ca = Math.cos(ang), sa = Math.sin(ang);
            const b = new T.Mesh(P.wallG(len), stoneM); b.position.set(cx, g0 + wH / 2, cz); b.rotation.y = ang; b.castShadow = true; sub.add(b);
            const n = Math.floor(len / 0.2); for (let k = 0; k < n; k++) { const t = -len / 2 + (k + 0.5) * (len / n); if (k % 2) continue; const m = new T.Mesh(P.mer, stoneM); m.position.set(cx + sa * t, g0 + wH + 0.07, cz + ca * t); m.rotation.y = ang; sub.add(m); }
        };
        tower(-xt, zb, H); tower(xt, zb, H); wall(-xt + 0.28, zb, xt - 0.28, zb);
        pen(-xt, zb, g0 + H + 0.62, '#c8302a'); pen(xt, zb, g0 + H + 0.62, '#2a5fc8');
        if (L >= 4) {
            tower(-xt, zf, H * 0.86); tower(xt, zf, H * 0.86); wall(-xt, zb + 0.28, -xt, zf - 0.28); wall(xt, zb + 0.28, xt, zf - 0.28);
            wall(-xt + 0.28, zf, -0.62, zf); wall(0.22, zf, xt - 0.28, zf);   /* muralha da frente com um portão no meio */
            [-0.62, 0.22].forEach(px => { const pl = new T.Mesh(P.gp, stoneD); pl.position.set(px, g0 + 0.3, zf); sub.add(pl); }); const lt = new T.Mesh(P.gl, stoneD); lt.position.set(-0.2, g0 + 0.56, zf); sub.add(lt); const ba = new T.Mesh(P.gb, P.sm); ba.position.set(-0.2, g0 + 0.18, zf - 0.02); sub.add(ba);
            pen(-xt, zf, g0 + H * 0.86 + 0.62, '#c8302a'); pen(xt, zf, g0 + H * 0.86 + 0.62, '#2a5fc8');
        }
    }

    function clUVWhole(g) { const uv = g.attributes.uv; if (!uv) return null; let u0 = 9, v0 = 9, u1 = -9, v1 = -9; for (let i = 0; i < uv.count; i++) { u0 = Math.min(u0, uv.getX(i)); u1 = Math.max(u1, uv.getX(i)); v0 = Math.min(v0, uv.getY(i)); v1 = Math.max(v1, uv.getY(i)); } return [u0, v0, u1, v1]; }
    function clChaleTowers(sub, L, dz) {   /* o chalé vira um refúgio de montanha: torres de pedra (a mesma pedra da chaminé dele) com fuste de madeira e telhado cônico do mesmo telhado, nos cantos */
        if (L < 3) return; const T = clTh(); let roof = null, wall = null, stone = null; sub.traverse(o => { if (o.isMesh) { if (o.name === 'Object_4') roof = o; else if (o.name === 'Object_5') wall = o; else if (o.name === 'Object_9') stone = o; } }); if (!roof || !wall || !stone) return;
        FARM.gcache = FARM.gcache || {}; let P = FARM.gcache.chaleT;
        if (!P) { const bs = clUVWhole(stone.geometry), bw = clUVWhole(wall.geometry), br = clUVWhole(roof.geometry); P = FARM.gcache.chaleT = { stone: clRemapUV(new T.CylinderGeometry(0.3, 0.34, 1, 14, 1, false), bs), body: clRemapUV(new T.CylinderGeometry(0.27, 0.27, 1, 14, 1, false), bw), cone: clRemapUV(new T.ConeGeometry(0.42, 0.62, 14, 1, false), br), ring: clRemapUV(new T.CylinderGeometry(0.33, 0.33, 0.08, 14, 1, false), bs), mer: clRemapUV(new T.BoxGeometry(0.11, 0.14, 0.09), bs), slit: new T.BoxGeometry(0.05, 0.16, 0.05), sm: new T.MeshBasicMaterial({ color: '#241608' }), pole: new T.CylinderGeometry(0.012, 0.012, 0.34, 6), flag: new T.PlaneGeometry(0.22, 0.13), pm: new T.MeshBasicMaterial({ color: '#4a3a2a' }) }; }
        const g0 = -0.04, H = 1.55, tower = (x, z, h, col) => {
            const Hs = h * 0.55; const st = new T.Mesh(P.stone, stone.material); st.scale.set(1, Hs, 1); st.position.set(x, g0 + Hs / 2, z); st.castShadow = true; sub.add(st);
            const rg = new T.Mesh(P.ring, stone.material); rg.position.set(x, g0 + Hs, z); sub.add(rg);
            const bd = new T.Mesh(P.body, wall.material); bd.scale.set(1, h - Hs, 1); bd.position.set(x, g0 + Hs + (h - Hs) / 2, z); bd.castShadow = true; sub.add(bd);
            const tr = new T.Mesh(P.ring, stone.material); tr.position.set(x, g0 + h - 0.02, z); sub.add(tr);
            for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2, m = new T.Mesh(P.mer, stone.material); m.position.set(x + Math.sin(a) * 0.325, g0 + h + 0.07, z + Math.cos(a) * 0.325); m.rotation.y = a; sub.add(m); }
            const cn = new T.Mesh(P.cone, roof.material); cn.position.set(x, g0 + h + 0.41, z); sub.add(cn);
            [0.3].forEach(hh => [0.9, 2.6, 4.3].forEach(a => { const sl = new T.Mesh(P.slit, P.sm); sl.position.set(x + Math.sin(a) * 0.318, g0 + Hs * hh * 2, z + Math.cos(a) * 0.318); sl.rotation.y = a; sub.add(sl); }));
            const top = g0 + h + 0.72, pl = new T.Mesh(P.pole, P.pm); pl.position.set(x, top + 0.17, z); sub.add(pl); const fl = new T.Mesh(P.flag, new T.MeshBasicMaterial({ color: col, side: T.DoubleSide })); fl.position.set(x + 0.11, top + 0.3, z); sub.add(fl);
        };
        const zb = -0.92 - dz; tower(-1.16, zb, H, '#c8302a'); tower(1.16, zb, H, '#2a5fc8');
        if (L >= 4) { tower(-1.2, 0.86, H * 0.82, '#c8302a'); tower(1.2, 0.86, H * 0.82, '#2a5fc8'); }
    }
    window.ruaFarm.load = f => clModelLoad(f);
    window.ruaFarm.size = f => { const T = CLM.tpl[f]; if (!T) return null; const bb = new (clTh().Box3)().setFromObject(T.gl.scene), z = bb.getSize(new (clTh().Vector3)()), c = bb.getCenter(new (clTh().Vector3)()); return [z.x, z.y, z.z, c.x, c.y, c.z, bb.min.y].map(v => +v.toFixed(2)).join(' '); };
/* === [SEC: EXPEDICOES_PORTO_PESCA] === */
/* ===== cortex/36jh-colony-active.js: Atividades da Colônia: expedições (enviar moradores por horas), mercador visitante com prazo e produção em fila nas construções. Coisas que pedem para você voltar ao jogo ===== */
    const ACT_DEST = [
        { id: 'mina', n: 'Mina profunda', ic: '⛏️', res: 'm', per: 55, vr: 0.2, d: 'Metal, sem surpresa.' },
        { id: 'mata', n: 'Mata fechada', ic: '🌲', res: 'b', per: 65, vr: 0.2, d: 'Biomassa em boa quantidade.' },
        { id: 'ruina', n: 'Ruínas antigas', ic: '🏺', res: 'c', per: 20, vr: 0.45, d: 'Cristal. O retorno varia bastante, e às vezes vem muito.' }
    ];
    const ACT_HRS = [2, 4, 8];
    const ACT_RN = { c: 'cristal', b: 'biomassa', m: 'metal' };
    const ACT_RECIPES = {   /* produção em fila: troca recurso por cristal (ou metal) em tempo de espera, melhor que a Feira */
        forja: [{ n: 'Ferramentas', ic: '🔨', min: 30, i: { m: 90, b: 30 }, o: { c: 6 } }, { n: 'Lingotes finos', ic: '🧱', min: 120, i: { m: 260, b: 90 }, o: { c: 22 } }],
        moinho: [{ n: 'Farinha', ic: '🌾', min: 30, i: { b: 150 }, o: { c: 6 } }, { n: 'Pão de festa', ic: '🍞', min: 120, i: { b: 420 }, o: { c: 22 } }],
        estufa: [{ n: 'Flores raras', ic: '🌸', min: 30, i: { b: 120, c: 10 }, o: { c: 15 } }, { n: 'Orquídeas de vidro', ic: '🪻', min: 120, i: { b: 300, c: 30 }, o: { c: 52 } }],
        pomar: [{ n: 'Geleia', ic: '🍓', min: 30, i: { b: 140 }, o: { c: 6 } }, { n: 'Licor de frutas', ic: '🍷', min: 120, i: { b: 400 }, o: { c: 22 } }],
        porto: [{ n: 'Pesca do dia', ic: '🐟', min: 30, i: { b: 80 }, o: { m: 70, c: 2 } }, { n: 'Carga para a cidade', ic: '📦', min: 120, i: { b: 260, m: 80 }, o: { c: 30 } }],
        usina: [{ n: 'Sobrecarga controlada', ic: '⚡', min: 60, i: { m: 300, b: 80 }, o: { c: 22 } }, { n: 'Núcleo de energia', ic: '🔋', min: 180, i: { m: 800, b: 200 }, o: { c: 80 } }],
        fundicao: [{ n: 'Ligas leves', ic: '🔩', min: 90, i: { m: 500, b: 150 }, o: { c: 38 } }, { n: 'Placas estelares', ic: '🛡️', min: 240, i: { m: 1400, b: 350 }, o: { c: 120 } }],
        reator: [{ n: 'Fusão rápida', ic: '☀️', min: 120, i: { m: 700, b: 250, c: 60 }, o: { c: 190 } }, { n: 'Cristal estelar', ic: '🌟', min: 360, i: { m: 1800, b: 600, c: 150 }, o: { c: 620 } }],
        refinaria: [{ n: 'Cristal lapidado', ic: '💎', min: 60, i: { m: 220, b: 60 }, o: { c: 20 } }, { n: 'Liga rara', ic: '⚙️', min: 180, i: { m: 600, b: 150 }, o: { c: 62 } }]
    };
    const ACT_OFFERS = [   /* o mercador sempre paga melhor que a Feira (150 biomassa por 5 cristais) */
        { g: { b: 300 }, r: { c: 20 }, t: 'Compro biomassa' }, { g: { m: 200 }, r: { c: 17 }, t: 'Compro metal' }, { g: { b: 160, m: 100 }, r: { c: 21 }, t: 'Compro lote misto' },
        { g: { c: 40 }, r: { b: 520 }, t: 'Vendo biomassa fresca' }, { g: { c: 40 }, r: { m: 420 }, t: 'Vendo metal bruto' }
    ];
    function clActS(s) { s = s || clS(); if (!s.act || typeof s.act !== 'object') s.act = {}; const a = s.act; if (!Array.isArray(a.exp)) a.exp = []; if (!a.mq || typeof a.mq !== 'object') a.mq = {}; return a; }
    const actFmt = ms => { const m = Math.max(0, Math.ceil(ms / 60000)); return m >= 60 ? Math.floor(m / 60) + ' h ' + (m % 60 ? (m % 60) + ' min' : '') : Math.max(1, m) + ' min'; };
    const actCost = o => Object.keys(o).map(k => o[k] + ' ' + ACT_RN[k]).join(' + ');
    const actCan = (s, o) => Object.keys(o).every(k => (+s.res[k] || 0) >= o[k]);
    const actPay = (s, o) => { Object.keys(o).forEach(k => { s.res[k] = (+s.res[k] || 0) - o[k]; }); };
    function clActSlots(s) { return Math.min(5, 1 + Math.floor((clStats().pop || 0) / 8) + (clLvSum(s, 'porto') > 0 ? 1 : 0) + Math.min(2, clLvSum(s, 'quartel'))); }   /* Porto e Quartel liberam mais grupos */   /* o Porto libera mais um grupo */
    function clActOut(s) { s = s || clS(); return clActS(s).exp.filter(e => !e.done).length; }   /* moradores fora, a colônia fica com menos gente na rua */

    function clExpGo(did, hi) {
        if (CL.visit) return { ok: false, err: 'Só na sua colônia.' }; const s = clS(), A = clActS(s), D = ACT_DEST.find(x => x.id === did), h = ACT_HRS[hi];
        if (!D || !h) return { ok: false, err: 'Expedição inválida.' }; if (A.exp.length >= clActSlots(s)) return { ok: false, err: 'Todos os grupos estão em campo ou esperando você receber.' };
        const mul = (1 + 0.08 * Math.max(0, (s.nuc || 1) - 1)) * (1 + Math.min(0.4, 0.1 * clLvSum(s, 'porto')) + Math.min(0.4, 0.08 * clLvSum(s, 'quartel'))), v = 1 + (Math.random() * 2 - 1) * D.vr, jk = D.id === 'ruina' && Math.random() < 0.15 ? 2 : 1, amt = Math.round(D.per * h * mul * v * jk);
        A.exp.push({ d: did, h, t0: Date.now(), dur: h * 3600000, res: D.res, amt, jk: jk > 1 }); CL.ver++; CL3.need = true; clSave(true); return { ok: true };
    }
    function clExpClaim(i) {
        const s = clS(), A = clActS(s), e = A.exp[i]; if (!e) return { ok: false }; if (Date.now() - e.t0 < e.dur) return { ok: false, err: 'Ainda estão em campo.' };
        const g = {}; g[e.res] = e.amt; clFarmPay(s, e.res === 'b' ? e.amt : 0, e.res === 'c' ? e.amt : 0); if (e.res === 'm') clFarmPayM(s, e.amt); A.exp.splice(i, 1); CL.ver++; CL3.need = true; clSave(true); return { ok: true, e };
    }
    function clFarmPayM(s, v) { const st = clStats(), cap = st.cap.m || 500, cur = +s.res.m || 0, d = Math.min(Math.max(0, cap - cur), v); s.res.m = cur + d; const ex = v - d; if (ex > 0.01) { s.pend.m = (s.pend.m || 0) + ex; clGive(s, CL_RI.m, ex, clWts(s)); } }

    function clMerStep(s, now) {   /* o mercador chega na hora combinada (mesmo com o jogo fechado) e vai embora se você não vier */
        const A = clActS(s); if (A.mer && now > A.mer.until) { A.mer = null; A.lastMer = now; CL.ver++; }
        if (!A.mer) {
            if (!A.nextMer) A.nextMer = now + (15 + Math.random() * 30) * 60000;
            if (now >= A.nextMer && !CL.visit) {
                const mk = clLvSum(s, 'mercado') > 0, stay = (mk ? 90 : clLvSum(s, 'praca') > 0 ? 70 : 45) * 60000, arrive = A.nextMer, gap = (mk ? 40 + Math.random() * 40 : clLvSum(s, 'praca') > 0 ? 55 + Math.random() * 55 : 90 + Math.random() * 90) * 60000;
                if (now < arrive + stay) { const o = ACT_OFFERS.slice().sort(() => Math.random() - 0.5).slice(0, mk ? 3 : 2); A.mer = { at: arrive, until: arrive + stay, o: o.map(x => ACT_OFFERS.indexOf(x)) }; try { clMsg('🧳 O mercador chegou! Fica por pouco tempo. Abra Atividades.'); aliveSound('chirp'); } catch (e) {} }
                A.nextMer = Math.max(arrive, now - 60000) + gap; CL.ver++; clSave(true);
            }
        }
    }
    const ACT_MSELL = [{ m: 200, c: 8 }, { m: 1000, c: 45 }];   /* fundir metal em cristal, sempre disponível; o mercador paga mais, mas some */
    function clMetalSell(i) {
        if (CL.visit) return { ok: false, err: 'Só na sua colônia.' }; const s = clS(), o = ACT_MSELL[i]; if (!o) return { ok: false, err: 'Troca inválida.' };
        if ((+s.res.m || 0) < o.m) return { ok: false, err: 'Faltam ' + Math.ceil(o.m - (+s.res.m || 0)) + ' de metal.' };
        s.res.m -= o.m; clFarmPay(s, 0, o.c); CL.ver++; clSave(true); return { ok: true, o };
    }
    function clMerBuy(oi) {
        const s = clS(), A = clActS(s); if (!A.mer) return { ok: false, err: 'O mercador já foi embora.' }; const o = ACT_OFFERS[oi]; if (!o || A.mer.o.indexOf(oi) < 0) return { ok: false, err: 'Oferta inválida.' };
        if (!actCan(s, o.g)) return { ok: false, err: 'Faltam recursos: ' + actCost(o.g) + '.' };
        actPay(s, o.g); clFarmPay(s, o.r.b || 0, o.r.c || 0); if (o.r.m) clFarmPayM(s, o.r.m); A.mer = null; A.lastMer = Date.now(); CL.ver++; clSave(true); return { ok: true, o };
    }

    function clProdKey(p) { return p[0] + ':' + p[1] + ':' + p[2]; }
    function clProdGo(pi, ri) {
        if (CL.visit) return { ok: false, err: 'Só na sua colônia.' }; const s = clS(), p = s.pcs[pi], R = p && ACT_RECIPES[p[0]], rc = R && R[ri]; if (!rc) return { ok: false, err: 'Receita inválida.' };
        const A = clActS(s), k = clProdKey(p); if (A.mq[k]) return { ok: false, err: 'Já está produzindo.' }; if (!actCan(s, rc.i)) return { ok: false, err: 'Faltam recursos: ' + actCost(rc.i) + '.' };
        actPay(s, rc.i); A.mq[k] = { r: ri, t0: Date.now(), dur: rc.min * 60000 * (1 - Math.min(0.5, 0.1 * clLvSum(s, 'oficina'))) };   /* a Oficina acelera a produção em fila */ CL.ver++; clSave(true); return { ok: true, rc };
    }
    function clProdClaim(pi) {
        const s = clS(), p = s.pcs[pi], R = p && ACT_RECIPES[p[0]], A = clActS(s), k = p && clProdKey(p), q = k && A.mq[k]; if (!q) return { ok: false }; if (Date.now() - q.t0 < q.dur) return { ok: false, err: 'Ainda em produção.' };
        const rc = R[q.r], mul = 1 + 0.15 * Math.max(0, (p[4] || 1) - 1); clFarmPay(s, 0, Math.round((rc.o.c || 0) * mul)); if (rc.o.m) clFarmPayM(s, Math.round(rc.o.m * mul)); if (rc.o.b) clFarmPay(s, Math.round(rc.o.b * mul), 0); delete A.mq[k]; CL.ver++; clSave(true); return { ok: true, rc, mul };
    }
    function clProdPanelHTML(pi) {
        const s = clS(), p = s.pcs[pi], R = p && ACT_RECIPES[p[0]]; if (!R) return ''; const A = clActS(s), q = A.mq[clProdKey(p)], mul = 1 + 0.15 * Math.max(0, (p[4] || 1) - 1), outTxt = o => Object.keys(o).map(k => '+' + Math.round(o[k] * mul) + ' ' + ACT_RN[k]).join(' ');
        let body;
        if (q) { const rc = R[q.r], left = q.t0 + q.dur - Date.now(); body = '<div class="cl-pq"><b>' + rc.ic + ' ' + rc.n + '</b><span>' + (left > 0 ? 'Pronta em ' + actFmt(left) : 'Pronta!') + '</span><div class="cl-pbar"><i style="width:' + Math.min(100, Math.round(100 * (1 - Math.max(0, left) / q.dur))) + '%"></i></div>' + (left > 0 ? '' : '<button type="button" class="cl-main" data-cl="prod-claim" data-pi="' + pi + '"><i class="ph-bold ph-hand-grabbing"></i><span>Receber ' + outTxt(rc.o) + '</span></button>') + '</div>'; }
        else body = R.map((rc, i) => '<button type="button" class="cl-pr" data-cl="prod-go" data-pi="' + pi + '" data-r="' + i + '"' + (actCan(s, rc.i) ? '' : ' disabled') + '><span>' + rc.ic + ' <b>' + rc.n + '</b> · ' + actFmt(rc.min * 60000) + '</span><small>Gasta ' + actCost(rc.i) + ' → ' + outTxt(rc.o) + '</small></button>').join('');
        return '<div class="cl-farm cl-prodbox"><div class="cl-fh"><b><i class="ph-bold ph-gear-six"></i> Produção</b><span class="cl-fstat">' + (q ? 'Em andamento' : 'Escolha o que produzir') + '</span></div>' + body + '</div>';
    }

    /* ---------- painel Atividades ---------- */
    function clActOpen() {
        if (!CL.on) return; let n = CL.root.querySelector('.cl-act');
        if (!n) {
            n = document.createElement('div'); n.className = 'cl-act';
            n.addEventListener('click', e => { const b = e.target.closest('[data-ac]'); if (!b) return; const w = b.dataset.ac; let r = null, msg = '';
                if (w === 'x') { n.hidden = true; return; }
                if (w === 'tab') { CL.actTab = b.dataset.t; clActPaint(n, ''); return; }
                if (w === 'go') { r = clExpGo(b.dataset.d, +b.dataset.h); if (r.ok) msg = 'Grupo enviado! Volta em ' + ACT_HRS[+b.dataset.h] + ' h.'; }
                else if (w === 'claim') { r = clExpClaim(+b.dataset.i); if (r.ok) msg = 'Voltaram: +' + r.e.amt + ' ' + ACT_RN[r.e.res] + (r.e.jk ? ' (achado raro!)' : '') + '.'; }
                else if (w === 'push') { clPushEnable().then(q => { clActPaint(n, q.ok ? 'Avisos ligados!' : clPushWhy(q.why), !q.ok); if (q.ok) clPushSync(); }); return; }
                else if (w === 'msell') { r = clMetalSell(+b.dataset.i); if (r.ok) msg = 'Fundido: ' + r.o.m + ' metal → ' + r.o.c + ' cristal.'; }
                else if (w === 'buy') { r = clMerBuy(+b.dataset.o); if (r.ok) msg = 'Negócio fechado: ' + actCost(r.o.g) + ' → ' + actCost(r.o.r) + '.'; }
                if (r) { if (r.ok) { try { aliveSound('coin'); } catch (er) {} } clActPaint(n, r.ok ? msg : r.err, !r.ok); }
            }); ['pointerdown', 'wheel', 'keydown'].forEach(ev => n.addEventListener(ev, e => { if (!(ev === 'keydown' && e.key === 'Escape')) e.stopPropagation(); }));
            CL.root.appendChild(n);
        }
        n.hidden = false; clActPaint(n, '');
    }
    const actRes = k => (CLD.RES.find(x => x[0] === k) || [k, k, 'ph-cube', '#fff']);
    const actChip = (k, v) => { const r = actRes(k); return '<span class="ac-chip" style="--rc:' + r[3] + '" title="' + r[1] + '"><i class="ph-bold ' + r[2] + '"></i>' + clFmt(v) + '</span>'; };
    const actChips = o => Object.keys(o).map(k => actChip(k, o[k])).join('');
    function clActPaint(n, msg, bad) {
        const s = clS(), A = clActS(s), now = Date.now(), slots = clActSlots(s), tab = CL.actTab || 'mer'; if (msg) CL.actMsg = { t: now, msg, bad }; else if (CL.actMsg && now - CL.actMsg.t < 4500) { msg = CL.actMsg.msg; bad = CL.actMsg.bad; } const bd0 = n.querySelector('.ac-body'), sc0 = bd0 ? bd0.scrollTop : 0, tb0 = n.querySelector('.ac-tabs'), tx0 = tb0 ? tb0.scrollLeft : 0;
        const ready = A.exp.filter(e => e.t0 + e.dur - now <= 0).length, TABS = [['mer', 'ph-handshake', 'Mercador', A.mer ? '●' : ''], ['exp', 'ph-compass', 'Expedições', ready ? String(ready) : ''], ['fun', 'ph-fire', 'Fundir', ''], ['avi', 'ph-bell-ringing', 'Avisos', '']];
        let h = '<header class="ac-h"><span class="ac-hi"><i class="ph-bold ph-compass"></i></span><div><b>Atividades</b><small>Coisas para fazer enquanto a colônia cresce</small></div><button type="button" data-ac="x" aria-label="Fechar"><i class="ph-bold ph-x"></i></button></header>'
            + '<nav class="ac-tabs">' + TABS.map(x => '<button type="button" data-ac="tab" data-t="' + x[0] + '" class="' + (tab === x[0] ? 'on' : '') + '"><i class="ph-bold ' + x[1] + '"></i><span>' + x[2] + '</span>' + (x[3] ? '<u>' + x[3] + '</u>' : '') + '</button>').join('') + '</nav><div class="ac-body">';
        if (msg) h += '<div class="ac-msg ' + (bad ? 'bad' : 'ok') + '"><i class="ph-bold ' + (bad ? 'ph-warning' : 'ph-check-circle') + '"></i>' + msg + '</div>';
        if (tab === 'mer') {
            if (A.mer) { const left = A.mer.until - now, tot = Math.max(1, A.mer.until - A.mer.at), pc = clamp(100 * left / tot, 0, 100);
                h += '<section class="ac-card ac-hero"><span class="ac-av">🧳</span><div><b>O mercador está na colônia</b><small>Vai embora em ' + actFmt(left) + '</small><div class="ac-bar"><i style="width:' + pc.toFixed(0) + '%"></i></div></div></section>'
                    + A.mer.o.map(oi => { const o = ACT_OFFERS[oi], can = actCan(s, o.g); return '<section class="ac-card ac-offer"><b>' + o.t + '</b><div class="ac-swap"><span class="ac-side"><small>Você dá</small>' + actChips(o.g) + '</span><i class="ph-bold ph-arrow-right"></i><span class="ac-side"><small>Recebe</small>' + actChips(o.r) + '</span></div><button type="button" data-ac="buy" data-o="' + oi + '" class="ac-btn"' + (can ? '' : ' disabled') + '>' + (can ? 'Trocar' : 'Faltam recursos') + '</button></section>'; }).join(''); }
            else h += '<section class="ac-card ac-empty"><span class="ac-av dim">🧳</span><b>Nenhum mercador agora</b><small>' + (A.nextMer && A.nextMer > now ? 'Deve chegar em cerca de ' + actFmt(A.nextMer - now) + '.' : 'Ele aparece de tempos em tempos.') + ' Ele fica por mais tempo com Praça ou Mercado.</small></section>';
        } else if (tab === 'exp') {
            h += '<div class="ac-slots"><span>Grupos em campo</span><b>' + A.exp.map(() => '<i class="on"></i>').join('') + Array.from({ length: Math.max(0, slots - A.exp.length) }, () => '<i></i>').join('') + '</b><small>' + A.exp.length + ' de ' + slots + '</small></div>';
            A.exp.forEach((e, i) => { const D = ACT_DEST.find(x => x.id === e.d) || ACT_DEST[0], left = e.t0 + e.dur - now, pc = clamp(100 * (1 - left / e.dur), 0, 100);
                h += '<section class="ac-card ac-run' + (left <= 0 ? ' done' : '') + '"><span class="ac-av">' + D.ic + '</span><div><b>' + D.n + '</b><small>' + (left > 0 ? 'Voltam em ' + actFmt(left) : 'Voltaram!' + (e.jk ? ' Trouxeram um achado raro.' : '')) + '</small><div class="ac-bar"><i style="width:' + pc.toFixed(0) + '%"></i></div></div>' + (left > 0 ? '<span class="ac-pc">' + Math.round(pc) + '%</span>' : '<button type="button" data-ac="claim" data-i="' + i + '" class="ac-btn gold">Receber ' + actChip(e.res, e.amt) + '</button>') + '</section>'; });
            if (A.exp.length < slots) h += ACT_DEST.map(D => { const mul = 1 + 0.08 * Math.max(0, (s.nuc || 1) - 1), r = actRes(D.res); return '<section class="ac-card ac-dest" style="--rc:' + r[3] + '"><div class="ac-dh"><span class="ac-av">' + D.ic + '</span><div><b>' + D.n + '</b><small>' + D.d + '</small></div></div><div class="ac-go">' + ACT_HRS.map((hr, hi) => '<button type="button" data-ac="go" data-d="' + D.id + '" data-h="' + hi + '"><b>' + hr + ' h</b><span>~' + Math.round(D.per * hr * mul) + ' <i class="ph-bold ' + r[2] + '"></i></span></button>').join('') + '</div></section>'; }).join('');
            else h += '<section class="ac-card ac-empty"><small>Todos os grupos estão em campo. Receba os que voltaram ou espere. Mais moradores, o Porto e o Quartel liberam mais grupos.</small></section>';
        } else if (tab === 'fun') {
            const have = Math.floor(+s.res.m || 0);
            h += '<section class="ac-card ac-hero"><span class="ac-av">🔥</span><div><b>Fundir metal em cristal</b><small>Sempre disponível, sem espera.</small></div>' + actChip('m', have) + '</section>'
                + ACT_MSELL.map((o, i) => '<section class="ac-card ac-offer"><div class="ac-swap"><span class="ac-side"><small>Gasta</small>' + actChip('m', o.m) + '</span><i class="ph-bold ph-arrow-right"></i><span class="ac-side"><small>Recebe</small>' + actChip('c', o.c) + '</span></div><button type="button" data-ac="msell" data-i="' + i + '" class="ac-btn"' + (have >= o.m ? '' : ' disabled') + '>' + (have >= o.m ? 'Fundir' : 'Falta metal') + '</button></section>').join('')
                + '<p class="ac-note">O mercador paga mais (200 de metal por 17 de cristal), mas só aparece de vez em quando. Para trocar com tempo e render mais, use a fila de produção da Forja, Usina, Fundição e Refinaria.</p>';
        } else {
            const ps = typeof window.ruaPush !== 'undefined' ? window.ruaPush.state() : null, on = ps && window.ruaPush.active();
            h += '<section class="ac-card ac-hero"><span class="ac-av">' + (on ? '🔔' : '🔕') + '</span><div><b>' + (on ? 'Avisos ligados' : 'Avisos desligados') + '</b><small>' + (on ? 'Você é avisado mesmo com o jogo fechado.' : 'Ligue para saber quando algo estiver pronto.') + '</small></div>' + (on ? '' : '<button type="button" data-ac="push" class="ac-btn">Ligar</button>') + '</section>'
                + '<ul class="ac-list">' + [['ph-plant', 'Colheita pronta na fazenda'], ['ph-compass', 'Expedição de volta'], ['ph-gear', 'Produção terminada'], ['ph-handshake', 'Mercador chegando']].map(x => '<li><i class="ph-bold ' + x[0] + '"></i>' + x[1] + '<em class="ph-bold ' + (on ? 'ph-check on' : 'ph-minus') + '"></em></li>').join('') + '</ul>';
        }
        n.innerHTML = h + '</div>'; { const bd = n.querySelector('.ac-body'); if (bd && sc0) bd.scrollTop = sc0; const tb = n.querySelector('.ac-tabs'); if (tb && tx0) tb.scrollLeft = tx0; }
    }
    function clActStep(now) {   /* 1 vez por segundo: mercador, avisos de volta e painel aberto */
        if (window.ruaProfile === 'guest' && Date.now() < (window.__ruaGuestReadUntil || 0)) return;
        const s = clS(); if (CL.vRen || CL.visit) return; clMerStep(s, now); const A = clActS(s);
        A.exp.forEach(e => { if (!e.done && now - e.t0 >= e.dur) { e.done = true; CL3.need = true; try { clMsg('🧭 Um grupo voltou da expedição! Abra Atividades para receber.'); aliveSound('chirp'); } catch (er) {} } });
        try { const pb = CL.sel >= 0 && CL.root && CL.root.querySelector('.cl-prodbox'); if (pb && s.pcs[CL.sel] && ACT_RECIPES[s.pcs[CL.sel][0]] && !pb.matches(':hover')) { const t2 = document.createElement('div'); t2.innerHTML = clProdPanelHTML(CL.sel); if (t2.firstChild && t2.firstChild.innerHTML !== pb.innerHTML) pb.replaceWith(t2.firstChild); } } catch (er) {}
        try { if (typeof clVisPubStep === 'function') clVisPubStep(now); } catch (er) {}
        try { CL_PT = (CL_PT || 0) + 1; if (CL_PT >= 20) { CL_PT = 0; clPushSync(); } } catch (er) {}
        const n = CL.root && CL.root.querySelector('.cl-act'); if (n && !n.hidden && !n.matches(':hover')) clActPaint(n, n.dataset.msg || '');
    }
    function clProdClick(w, b) {
        if (w !== 'prod-go' && w !== 'prod-claim') return false; const pi = +b.dataset.pi; let r;
        if (w === 'prod-go') { r = clProdGo(pi, +b.dataset.r); if (r.ok) { aliveSound('chirp'); clMsg(r.rc.n + ': pronto em ' + actFmt(r.rc.min * 60000) + '.'); } else clMsg(r.err, true); }
        else { r = clProdClaim(pi); if (r.ok) { aliveSound('coin'); clMsg(r.rc.n + ' pronto: ' + Object.keys(r.rc.o).map(k => '+' + Math.round(r.rc.o[k] * r.mul) + ' ' + ACT_RN[k]).join(' ') + '.'); } else if (r.err) clMsg(r.err, true); }
        clUiSel(); clUiPaint(false); return true;
    }

    /* ---------- avisos fora do jogo (push): colheita pronta, expedição de volta, produção pronta e mercador chegando ---------- */
    function clPushWanted(s, now) {
        const A = clActS(s), f = clFarmS(s), lay = clFarmLayout(s), w = {};
        let minF = Infinity; for (let i = 0; i < lay.total; i++) { const x = f.sl[i]; if (x && x.g < FARM_GROW) minF = Math.min(minF, (FARM_GROW - x.g) * 1000 / (1 + Math.min(0.6, 0.12 * clLvSum(s, 'estufa')))); }
        if (isFinite(minF)) w.farm = { at: now + minF, title: '🌱 Colheita pronta', body: 'Suas plantas amadureceram. Venha colher!' };
        const ex = A.exp.filter(e => !e.done).map(e => e.t0 + e.dur); if (ex.length) w.exp = { at: Math.min.apply(null, ex), title: '🧭 Expedição de volta', body: 'Seu grupo voltou. Venha receber o que trouxeram.' };
        const pq = Object.keys(A.mq).map(k => A.mq[k].t0 + A.mq[k].dur).filter(t => t > now); if (pq.length) w.prod = { at: Math.min.apply(null, pq), title: '⚙️ Produção pronta', body: 'Uma construção terminou o que você mandou fazer.' };
        if (!A.mer && A.nextMer && A.nextMer > now) w.mer = { at: A.nextMer, title: '🧳 O mercador chegou', body: 'Ele traz ofertas e fica por pouco tempo. Venha ver!' };
        return w;
    }
    let CL_PUSHBUSY = false, CL_PT = 0;
    async function clPushSync() {
        if (CL_PUSHBUSY || CL.vRen || CL.visit || typeof window.ruaPush === 'undefined' || !window.ruaPush.active()) return; const s = clS(), A = clActS(s), now = Date.now(), W = clPushWanted(s, now); if (!A.push) A.push = {}; CL_PUSHBUSY = true;
        try {
            for (const k of Object.keys(W)) { const cur = A.push[k], at = Math.round(W[k].at); if (!cur || Math.abs(cur.at - at) > 5 * 60000 || cur.at < now - 60000) { if (cur && cur.id) await window.ruaPush.cancel(cur.id); const id = await window.ruaPush.schedule({ at, title: W[k].title, body: W[k].body, tag: 'cl-' + k }); A.push[k] = id ? { id, at } : { id: null, at: now + 3600000 }; } }
            for (const k of Object.keys(A.push)) { if (!W[k]) { const cur = A.push[k]; delete A.push[k]; if (cur && cur.id) await window.ruaPush.cancel(cur.id); } }
        } catch (e) {} CL_PUSHBUSY = false;
    }
    async function clPushEnable() { if (typeof window.ruaPush === 'undefined') return { ok: false, why: 'unsupported' }; const r = await window.ruaPush.enable(); if (r && r.ok) { try { clSave(true); } catch (e) {} } return r || { ok: false }; }
    const clPushWhy = w => w === 'install' ? 'No iPad, instale o site na tela inicial primeiro (Compartilhar > Adicionar à Tela de Início).' : w === 'signin' ? 'Entre na sua conta para receber os avisos.' : w === 'denied' ? 'A permissão de notificação foi negada nas configurações do aparelho.' : w === 'unsupported' ? 'Este aparelho ou navegador não suporta avisos.' : 'Não consegui ativar os avisos agora.';
    window.ruaAct = { pushSync: clPushSync, pushWanted: () => clPushWanted(clS(), Date.now()), exp: clExpGo, claim: clExpClaim, mer: clMerBuy, prodGo: clProdGo, prodClaim: clProdClaim, state: () => clActS(clS()), ff: ms => { const A = clActS(clS()); A.exp.forEach(e => { e.t0 -= ms; }); Object.keys(A.mq).forEach(k => { A.mq[k].t0 -= ms; }); if (A.mer) A.mer.until += 0; A.nextMer = 1; }, merNow: () => { const A = clActS(clS()); A.nextMer = 1; } };
/* ===== cortex/36ji-colony-fish.js: peixes que nadam sob a água e pulam do mar em arco, com a cauda batendo (animação do próprio modelo), respingo, anéis na água e gotas ===== */
    const FISH = { list: [], sc: null, tried: 0, rings: [], rg: null, n: 0 };
    const FISH_WY = -0.6;   /* altura da superfície do mar (a mesma da água da colônia) */
    function clFishMeasure(FT) {   /* mede o peixe de verdade, já com o esqueleto aplicado (a caixa do arquivo engana: o modelo é gigante e o esqueleto o encolhe); descobre também para que lado fica a cabeça */
        const THREE = clTh(), probe = THREE.SkeletonUtils.clone(FT.gl.scene), holder = new THREE.Group(); holder.add(probe); holder.updateMatrixWorld(true); let sm = null; probe.traverse(o => { if (o.isSkinnedMesh) sm = o; });
        if (!sm) { const bb = new THREE.Box3().setFromObject(probe), z = bb.getSize(new THREE.Vector3()); return { len: Math.max(z.x, z.y, z.z) || 1, fix: 0 }; }
        sm.skeleton.update(); const pos = sm.geometry.attributes.position, v = new THREE.Vector3(), P = [], step = Math.max(1, Math.floor(pos.count / 4000)), bb = new THREE.Box3();
        for (let i = 0; i < pos.count; i += step) { v.fromBufferAttribute(pos, i); if (sm.boneTransform) sm.boneTransform(i, v); v.applyMatrix4(sm.matrixWorld); P.push(v.x, v.y, v.z); bb.expandByPoint(v); }
        const sz = bb.getSize(new THREE.Vector3()), ax = sz.x >= sz.z ? 0 : 2, lo = bb.min.getComponent(ax), L = sz.getComponent(ax) || 1, o1 = ax === 0 ? 2 : 0; let wLo = [1e9, -1e9], wHi = [1e9, -1e9];
        for (let i = 0; i < P.length; i += 3) { const a = P[i + ax], w = P[i + o1], yy = P[i + 1]; if (a < lo + L * 0.2) { wLo[0] = Math.min(wLo[0], yy); wLo[1] = Math.max(wLo[1], yy); } else if (a > lo + L * 0.8) { wHi[0] = Math.min(wHi[0], yy); wHi[1] = Math.max(wHi[1], yy); } }
        const hiHead = (wHi[1] - wHi[0]) > (wLo[1] - wLo[0]);   /* a cabeça é a ponta mais alta (mais grossa) */
        const fix = ax === 2 ? (hiHead ? 0 : Math.PI) : (hiHead ? -Math.PI / 2 : Math.PI / 2); return { len: Math.max(sz.x, sz.z) || 1, fix, ax, hiHead, size: sz.toArray(), c: bb.getCenter(new THREE.Vector3()) };
    }
    function clFishMake(len, wy) {   /* um peixe pronto para a cena: textura original, cauda animada, centro no pivô */
        const THREE = clTh(), FT = CLM.tpl['peixe.glb'], root = THREE.SkeletonUtils.clone(FT.gl.scene), pivot = new THREE.Group(), g = new THREE.Group();
        root.traverse(o => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; o.frustumCulled = false; const m = Array.isArray(o.material) ? o.material[0] : o.material; if (m && m.clone) { o.material = m.clone(); if (o.material.color) o.material.color.multiplyScalar(0.9); } } });
        const k = len / FISH.len0; root.scale.setScalar(k); root.position.set(-FISH.c.x * k, -FISH.c.y * k, -FISH.c.z * k); pivot.add(root); pivot.rotation.y = FISH.fix || 0; g.add(pivot); g.visible = false; CL3.sc.add(g);
        let mx = null; if (FT.gl.animations && FT.gl.animations.length) { mx = new THREE.AnimationMixer(root); const ac = mx.clipAction(FT.gl.animations[0]); ac.play(); ac.time = Math.random() * ac.getClip().duration; }
        return { g, pivot, root, mx, st: 'swim', a: Math.random() * 6.28, sp: 0.25 + Math.random() * 0.3, y: wy - 0.5 - Math.random() * 0.4, next: 1.5 + Math.random() * 5, ph: Math.random() * 6, lt: 0, L: null, off: Math.random() * 2.5, wy };
    }
    function clFishPrep(FT) {
        const N = CL3.lowq || CL_TOUCH() ? 3 : 5; FISH.list = []; const M = clFishMeasure(FT); FISH.len0 = M.len; FISH.fix = M.fix; FISH.c = M.c || new (clTh().Vector3)();
        for (let i = 0; i < N; i++) FISH.list.push(clFishMake(1.2 + Math.random() * 0.6, FISH_WY));
    }
    function clFishRing(x, z, wy) {
        const THREE = clTh(); if (!FISH.rg) { FISH.rg = new THREE.RingGeometry(0.56, 0.6, 32); FISH.rg.rotateX(-Math.PI / 2); }
        let r = FISH.rings.find(q => !q.on); if (!r) { if (FISH.rings.length >= 10) return; const m = new THREE.Mesh(FISH.rg, new THREE.MeshBasicMaterial({ color: '#e8f6ff', transparent: true, opacity: 0, depthWrite: false })); CL3.sc.add(m); r = { m, on: false, t: 0, sz: 1 }; FISH.rings.push(r); }
        r.on = true; r.t = 0; r.m.position.set(x, wy + 0.04, z); r.m.visible = true;
    }
    function clFishLeapStart(f, x0, z0, dx, dz, h, dur) { f.L = { x0, z0, dx, dz, h, dur, up: false, dn: false, spin: (Math.random() < 0.5 ? -1 : 1) * (0.2 + Math.random() * 0.5) }; f.st = 'leap'; f.lt = 0; }
    function clFishLeapStep(f, dt, splash) {   /* o arco: sobe, vira o nariz para baixo e mergulha */
        const L = f.L, wy = f.wy; f.lt += dt; const u = Math.min(1, f.lt / L.dur), y = wy - 0.55 + (L.h + 0.0) * 4 * u * (1 - u), x = L.x0 + L.dx * u, z = L.z0 + L.dz * u, dy = L.h * 4 * (1 - 2 * u) / L.dur, hl = Math.hypot(L.dx, L.dz) || 1, hs = hl / L.dur, prevY = f.g.position.y;
        f.g.position.set(x, y, z);
        if (!L.up && prevY < wy && y >= wy) { L.up = true; splash(x, z, wy, 9); }
        if (L.up && !L.dn && prevY >= wy && y < wy) { L.dn = true; splash(x, z, wy, 11); }
        f.g.lookAt(x + L.dx / hl * hs, y + dy, z + L.dz / hl * hs); f.pivot.rotation.z = Math.sin(u * Math.PI) * L.spin; return u >= 1;
    }
    function clFishLakes(s) {   /* cada Lago que você constrói ganha peixes que pulam dentro dele (é onde dá para ver de perto) */
        const key = (s.pcs || []).filter(p => p[0] === 'lago').map(p => p[1] + ',' + p[2]).join('|'); if (key === FISH.lakeKey && FISH.lakeSc === CL3.sc) return; FISH.lakeKey = key; FISH.lakeSc = CL3.sc;
        (FISH.lakes || []).forEach(l => { CL3.sc.remove(l.f.g); }); FISH.lakes = []; if (!FISH.c) return;
        (s.pcs || []).filter(p => p[0] === 'lago').slice(0, 3).forEach(p => { for (let i = 0; i < 2; i++) FISH.lakes.push({ cx: p[1] + 1.5, cz: p[2] + 1.5, f: clFishMake(0.55 + Math.random() * 0.25, 0.22) }); });
    }
    function clFishStep(dt, t) {
        const sc = CL3.sc; if (!sc) return; const THREE = clTh(), pm = clPerfMode();
        if (FISH.sc !== sc) { FISH.list = []; FISH.rings = []; FISH.rg = null; FISH.sc = sc; FISH.tried = 0; FISH.lakes = []; FISH.lakeKey = null; }
        if (pm === 'minimo') { FISH.list.forEach(f => { f.g.visible = false; }); (FISH.lakes || []).forEach(l => { l.f.g.visible = false; }); return; }
        if (!FISH.list.length) { if (!FISH.tried) { FISH.tried = 1; clModelLoad('peixe.glb'); } const FT = CLM.tpl['peixe.glb']; if (!FT) return; clFishPrep(FT); }
        const H = (clS() && clS().H) || 16, splash = (x, z, wy, n) => { clFishRing(x, z, wy); farmFx('splash', x, wy, z, n); };
        try { clFishLakes(clS()); } catch (e) {}
        FISH.list.forEach(f => {
            f.g.visible = true; if (f.mx) f.mx.update(dt * (f.st === 'leap' ? 2.6 : 0.8));
            if (f.st === 'swim') {   /* nada devagar, em círculo sob a superfície, ao redor da ilha, bem perto da costa */
                f.a += dt * f.sp * 0.18; f.next -= dt; const ca = Math.cos(f.a), sa = Math.sin(f.a), minR = (H + 2.0) / Math.max(0.1, Math.abs(ca), Math.abs(sa)), R = minR + 0.9 + f.off + Math.sin(t * 0.3 + f.ph) * 0.8;
                f.g.position.set(ca * R, f.y + Math.sin(t * 1.6 + f.ph) * 0.05, sa * R); f.g.rotation.set(0, Math.atan2(-sa, ca), 0);
                if (f.next <= 0) { const out = Math.random() < 0.5, tx = -sa, tz = ca, mix = out ? 0.75 : 0.25, dx0 = tx * (1 - mix) + ca * mix * (Math.random() < 0.5 ? 1 : -0.2), dz0 = tz * (1 - mix) + sa * mix * (Math.random() < 0.5 ? 1 : -0.2), dl = Math.hypot(dx0, dz0) || 1, dist = 2.6 + Math.random() * 2.2; clFishLeapStart(f, f.g.position.x, f.g.position.z, dx0 / dl * dist, dz0 / dl * dist, 1.3 + Math.random() * 1.1, 1.15 + Math.random() * 0.45); }
            } else if (clFishLeapStep(f, dt, splash)) { f.st = 'swim'; f.next = 2.5 + Math.random() * 6; f.y = FISH_WY - 0.5 - Math.random() * 0.4; f.a = Math.atan2(f.g.position.z, f.g.position.x); f.pivot.rotation.z = 0; }
        });
        (FISH.lakes || []).forEach(l => {
            const f = l.f; if (f.mx) f.mx.update(dt * (f.st === 'leap' ? 2.4 : 0.6));
            if (f.st === 'swim') { f.g.visible = false; f.next -= dt; if (f.next <= 0) { const a = Math.random() * 6.28, r0 = 0.45 + Math.random() * 0.3, a2 = a + Math.PI + (Math.random() - 0.5) * 1.2, r1 = 0.4 + Math.random() * 0.35, x0 = l.cx + Math.cos(a) * r0, z0 = l.cz + Math.sin(a) * r0, x1 = l.cx + Math.cos(a2) * r1, z1 = l.cz + Math.sin(a2) * r1; f.g.position.set(x0, f.wy - 0.4, z0); f.g.visible = true; clFishLeapStart(f, x0, z0, x1 - x0, z1 - z0, 0.5 + Math.random() * 0.35, 0.8 + Math.random() * 0.25); } }
            else { f.g.visible = true; if (clFishLeapStep(f, dt, splash)) { f.st = 'swim'; f.next = 2 + Math.random() * 5; f.g.visible = false; f.pivot.rotation.z = 0; } }
        });
        FISH.rings.forEach(r => { if (!r.on) return; r.t += dt; const k = r.t / 1.1; if (k >= 1) { r.on = false; r.m.visible = false; return; } r.m.scale.setScalar(0.35 + k * 1.9); r.m.material.opacity = 0.55 * (1 - k) * (1 - k); });
    }
    window.ruaFish = { CL3: () => CL3, cam: () => CL3.cam, raw: () => FISH.list, T: () => clTh(), list: () => FISH.list.length, fix: v => { FISH.fix = v; FISH.list.forEach(f => { f.pivot.rotation.y = v; }); }, leap: () => { FISH.list.forEach(f => { f.next = 0; }); (FISH.lakes || []).forEach(l => { l.f.next = 0; }); }, lakes: () => (FISH.lakes || []).length, info: () => [FISH.len0, FISH.fix], at: i => { const f = FISH.list[i]; return f && [f.g.position.x, f.g.position.y, f.g.position.z, f.st]; } };
/* === [SEC: OFICINA_QUARTEL_MERCADO] === */
/* ===== cortex/36jk-colony-newbuilds.js: Oficina, Quartel de Expedições e Mercado: construções compostas com modelos 3D prontos (estábulo, estalagem, oficina de forja, torres de vigia, carrinhos, barris, baús), que ganham peças a cada nível ===== */
    const CLM_OFI_FILES = ['fp_forge_workshop.glb', 'mina_cart.glb', 'fp_timber.glb', 'mina_barrels.glb', 'mina_chest_ingots.glb', 'supply_crate.glb', 'mina_gold_ingots.glb'];
    const CLM_QUA_FILES = ['stable.glb', 'watchtower_l1.glb', 'watchtower_l2.glb', 'watchtower_l3.glb', 'fp_bonfire.glb', 'supply_crate.glb', 'mina_barrels.glb', 'fp_hay.glb', 'fp_timber.glb'];
    const CLM_MER_FILES = ['library_inn.glb', 'mina_cart.glb', 'supply_crate.glb', 'mina_barrels.glb', 'praca_well.glb', 'fp_crates_veg.glb', 'fp_hay.glb', 'mina_chest_gold.glb'];
    const clLoadAll = fl => fl.forEach(f => { if (!CLM.tpl[f] && !CLM.loading[f] && !CLM.failed[f]) clModelLoad(f); });
    function clOficinaAssemble(grp, level, cv) {   /* oficina de forja que cresce: a bancada, e a cada nível carrinho, toras, barris, baús de lingotes e caixas de suprimento */
        level = Math.max(1, Math.min(5, level | 0)); const o = { cv }, K = [1.0, 1.04, 1.08, 1.12, 1.16][level - 1];
        clAddPart(grp, 'fp_forge_workshop.glb', -0.12, 0, -0.08, K, K, K, 0, 0, 0, o);
        clAddPart(grp, 'mina_cart.glb', 0.8, 0, 0.5, 0.95, 0.95, 0.95, 0, -0.5, 0, o); clAddPart(grp, 'fp_timber.glb', -0.85, 0, 0.74, 1.1, 1.1, 1.1, 0, 0.3, 0, o);
        if (level >= 2) clAddPart(grp, 'mina_barrels.glb', 0.78, 0, -0.66, 0.72, 0.72, 0.72, 0, 0.4, 0, o);
        if (level >= 3) { clAddPart(grp, 'mina_chest_ingots.glb', -0.8, 0, -0.74, 0.7, 0.7, 0.7, 0, 0.6, 0, o); clAddPart(grp, 'fp_timber.glb', -0.55, 0, 0.86, 0.8, 0.8, 0.8, 0, -0.4, 0, o); }
        if (level >= 4) clAddPart(grp, 'supply_crate.glb', 0.28, 0, 0.88, 0.5, 0.5, 0.5, 0, 0.3, 0, o);
        if (level >= 5) { clAddPart(grp, 'mina_gold_ingots.glb', 0.55, 0, 0.9, 0.6, 0.6, 0.6, 0, 0.2, 0, o); clAddPart(grp, 'supply_crate.glb', -0.1, 0, 0.9, 0.42, 0.42, 0.42, 0, -0.3, 0, o); }
    }
    function clQuartelAssemble(grp, level, cv) {   /* acampamento de expedições: o estábulo e uma torre de vigia que sobe de nível (3 modelos), fogueira, barris, caixas e feno */
        level = Math.max(1, Math.min(5, level | 0)); const o = { cv }, K = 0.5;
        clAddPart(grp, 'stable.glb', 0.655, 0, -0.19, K, K, K, 0, 0, 0, o);
        clAddPart(grp, level >= 4 ? 'watchtower_l3.glb' : level >= 2 ? 'watchtower_l2.glb' : 'watchtower_l1.glb', 1.15, 0, 0.55, 1.1, 1.1, 1.1, 0, 0.3, 0, o);
        clAddPart(grp, 'fp_bonfire.glb', -1.15, 0, 0.6, 1.4, 1.4, 1.4, 0, 0, 0, o);
        if (level >= 2) clAddPart(grp, 'mina_barrels.glb', -1.25, 0, -0.6, 0.7, 0.7, 0.7, 0, 0.5, 0, o);
        if (level >= 3) { clAddPart(grp, 'supply_crate.glb', 0.0, 0, 0.82, 0.5, 0.5, 0.5, 0, 0.2, 0, o); clAddPart(grp, 'fp_hay.glb', -0.6, 0, 0.8, 0.9, 0.9, 0.9, 0, 0.5, 0, o); }
        if (level >= 4) { clAddPart(grp, 'supply_crate.glb', 0.35, 0, 0.85, 0.42, 0.42, 0.42, 0, -0.3, 0, o); clAddPart(grp, 'fp_timber.glb', -1.0, 0, 0.0, 1.2, 1.2, 1.2, 0, 0.4, 0, o); }
        if (level >= 5) clAddPart(grp, 'fp_bonfire.glb', -0.75, 0, 0.35, 1.0, 1.0, 1.0, 0, 0.8, 0, o);
    }
    function clMercadoAssemble(grp, level, cv) {   /* a estalagem do mercador, com carrinho, caixas e barris que se acumulam a cada nível, poço e baú de ouro */
        level = Math.max(1, Math.min(5, level | 0)); const o = { cv }, K = [0.44, 0.45, 0.46, 0.47, 0.48][level - 1];
        clAddPart(grp, 'library_inn.glb', 0, 0, -0.1, K, K, K, 0, 0, 0, o);
        clAddPart(grp, 'mina_cart.glb', 0.82, 0, 0.78, 0.9, 0.9, 0.9, 0, -0.6, 0, o); clAddPart(grp, 'supply_crate.glb', -0.82, 0, 0.8, 0.5, 0.5, 0.5, 0, 0.3, 0, o);
        if (level >= 2) clAddPart(grp, 'mina_barrels.glb', 0.86, 0, -0.7, 0.7, 0.7, 0.7, 0, 0.5, 0, o);
        if (level >= 3) { clAddPart(grp, 'fp_crates_veg.glb', -0.6, 0, 0.9, 0.8, 0.8, 0.8, 0, 0.2, 0, o); clAddPart(grp, 'fp_hay.glb', -0.88, 0, -0.5, 0.8, 0.8, 0.8, 0, -0.3, 0, o); }
        if (level >= 4) clAddPart(grp, 'praca_well.glb', 0.0, 0.25, 0.9, 0.7, 0.7, 0.7, 0, 0, 0, o);
        if (level >= 5) clAddPart(grp, 'mina_chest_gold.glb', 0.5, 0, 0.92, 0.5, 0.5, 0.5, 0, -0.4, 0, o);
    }
    CLM_CUSTOM_HANDLERS.oficina = { preload: () => clLoadAll(CLM_OFI_FILES), assemble: clOficinaAssemble, req: 'fp_forge_workshop.glb', files: CLM_OFI_FILES, scale: 1.0 };
    CLM_CUSTOM_HANDLERS.quartel = { preload: () => clLoadAll(CLM_QUA_FILES), assemble: clQuartelAssemble, req: 'stable.glb', files: CLM_QUA_FILES, scale: 1.0 };
    CLM_CUSTOM_HANDLERS.mercado = { preload: () => clLoadAll(CLM_MER_FILES), assemble: clMercadoAssemble, req: 'library_inn.glb', files: CLM_MER_FILES, scale: 1.0 };

    /* ---------- o melhor visual aparece no nível 4: construções desenhadas em 5 etapas mostram a etapa 5 a partir do nível 4 (1, 2, 3 e 4 viram as etapas 1, 2, 4 e 5; do 5 em diante fica igual) ---------- */
    const CL_VIS5 = [1, 1, 2, 4, 5];
    ['mina', 'armazem', 'moinho', 'gerador', 'torre_vigia', 'praca', 'porto', 'bateria', 'biblioteca', 'oficina', 'quartel', 'mercado'].forEach(id => {
        const h = CLM_CUSTOM_HANDLERS[id]; if (!h || h.vis5) return; const asm = h.assemble; h.vis5 = 1;
        h.assemble = (grp, lv, cv) => { const L = Math.max(1, lv | 0); return asm(grp, L >= 5 ? 5 : CL_VIS5[L], cv); };
    });
/* ===== cortex/36jl-colony-firearch.js: o Arco virou um portal de pedra em chamas: pilares de alvenaria com runas brilhantes, arco de aduelas, braseiros e fogo animado em volta; a cor escolhida muda a cor da chama ===== */
    let FIRE = [];
    function clFireTex() {   /* chama desenhada em canvas: três línguas de fogo com ponta fina e base cheia (tingidas pela cor escolhida) */
        FARM.gcache = FARM.gcache || {}; if (FARM.gcache.fireTex) return FARM.gcache.fireTex; const c = document.createElement('canvas'); c.width = 64; c.height = 128; const g = c.getContext('2d'); g.shadowColor = 'rgba(255,255,255,.9)'; g.shadowBlur = 7;
        const tongue = (cx, w, h, a, sk) => { const gr = g.createLinearGradient(0, 124, 0, 124 - h); gr.addColorStop(0, 'rgba(255,255,255,' + a + ')'); gr.addColorStop(0.5, 'rgba(255,255,255,' + a * 0.85 + ')'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(cx - w, 124); g.bezierCurveTo(cx - w * 1.2, 124 - h * 0.4, cx - w * 0.2 + sk, 124 - h * 0.62, cx + sk, 124 - h); g.bezierCurveTo(cx + w * 0.4 + sk, 124 - h * 0.6, cx + w * 1.2, 124 - h * 0.35, cx + w, 124); g.closePath(); g.fill(); };
        tongue(32, 20, 118, 1, 3); tongue(17, 13, 78, 0.9, -4); tongue(47, 13, 88, 0.9, 5); tongue(32, 11, 58, 1, -2);
        const t = new (clTh().CanvasTexture)(c); t.encoding = clTh().sRGBEncoding; return FARM.gcache.fireTex = t;
    }
    function clFireAdd(grp, x, y, z, w, h, col, core) {   /* três camadas de chama: borda na cor escolhida, miolo alaranjado e núcleo claro (sem tone mapping, para a cor não lavar) */
        const T = clTh(), tex = clFireTex(), mk = (c, op, sc, add) => { const m = new T.Sprite(new T.SpriteMaterial({ map: tex, color: c, transparent: true, opacity: op, blending: add ? T.AdditiveBlending : T.NormalBlending, depthWrite: false, fog: false, toneMapped: false })); m.scale.set(w * sc, h * sc, 1); m.position.set(x, y + h * sc * 0.42, z); m.renderOrder = 20 + Math.round((1 - sc) * 10); grp.add(m); return m; };   /* a borda desenha primeiro, o miolo e o núcleo por cima */
        const mid = col.clone().lerp(new T.Color('#ffffff'), 0.28), outer = mk(col.clone().multiplyScalar(0.92), 0.9, 1, false), m2 = mk(mid, 0.92, 0.72, false), inner = mk(col.clone().lerp(new T.Color('#ffffff'), 0.7), 0.97, 0.4, false);   /* a cor escolhida pinta toda a chama; só o núcleo clareia */
        FIRE.push({ grp, s: outer, m: m2, i: inner, w, h, ph: Math.random() * 6.28, sp: 5 + Math.random() * 3, y: y + h * 0.42, my: y + h * 0.74 * 0.42, iy: y + h * 0.42 * 0.42 });
    }
    function clFireStep(dt, t) {   /* as chamas dançam de verdade: sobem e descem, balançam de lado e giram um pouco, cada uma no seu ritmo */
        FIRE = FIRE.filter(e => e.grp.parent); if (!FIRE.length) return; const lod = farmLod(), amp = lod.anim ? 1 : 0.6;
        FIRE.forEach(e => { const a = t * e.sp + e.ph, f = 0.78 + amp * (0.24 * Math.sin(a) + 0.12 * Math.sin(a * 2.3 + 1.7) + 0.06 * Math.sin(a * 5.1)), wv = 0.9 + amp * (0.12 * Math.sin(a * 1.3) + 0.05 * Math.sin(a * 3.7)), sw = amp * 0.035 * Math.sin(a * 1.1), rot = amp * 0.16 * Math.sin(a * 0.9 + 2);
            e.s.scale.set(e.w * wv, e.h * f, 1); e.s.position.y = e.y + (f - 1) * e.h * 0.4; e.s.material.rotation = rot; e.m.scale.set(e.w * 0.72 * wv, e.h * 0.74 * f, 1); e.m.position.y = e.my + (f - 1) * e.h * 0.3; e.m.material.rotation = rot * 0.7; e.i.scale.set(e.w * 0.4 * wv, e.h * 0.42 * f, 1); e.i.position.y = e.iy + (f - 1) * e.h * 0.2; e.i.material.rotation = rot * 0.4;
            if (e.bx === undefined) e.bx = e.s.position.x; e.s.position.x = e.bx + sw; e.m.position.x = e.bx + sw * 1.3; e.i.position.x = e.bx + sw * 1.6; });
        if (lod.fx && Math.random() < dt * 14) { const e = FIRE[Math.floor(Math.random() * FIRE.length)]; if (e) { const w = new (clTh().Vector3)(); e.s.getWorldPosition(w); farmFx('spark', w.x + (Math.random() - 0.5) * 0.25, w.y + 0.1 + Math.random() * 0.2, w.z, 1, e.col); } }
    }
    function clArcoFire(grp, cv, level) {
        const THREE = clTh(); if (!THREE || !grp) return; const L = Math.max(1, Math.min(5, level | 0)), pal = (cv > 0 && typeof CLD !== 'undefined' && CLD.PAL && CLD.PAL[cv - 1]) ? CLD.PAL[cv - 1] : null, fireCol = pal ? pal[1] : '#ff6a1a', fc = new THREE.Color(fireCol), core = fc.clone().lerp(new THREE.Color('#fff2c0'), 0.8);
        const T = clProcTools(THREE, grp), tex = T.tex, geo = T.geo, box = T.box, add = T.add, BK = new THREE.Color(0x000000), stoneT = T.stoneTex('fa1');
        const V = (k, col, ex) => T.mat(k, col, Object.assign({ emissive: BK, roughness: 0.9, envMapIntensity: 0.12 }, ex || {}));
        const rune = tex('farn', g => { g.fillStyle = '#16120e'; g.fillRect(0, 0, 64, 64); g.strokeStyle = '#ffffff'; g.lineWidth = 3; g.lineCap = 'round'; const G = [[[10, 8], [22, 8], [22, 22], [10, 22], [10, 8]], [[34, 8], [34, 22], [46, 8], [46, 22]], [[10, 34], [22, 46], [10, 56], [22, 56]], [[34, 36], [46, 36], [40, 46], [40, 58]]]; G.forEach(p => { g.beginPath(); p.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.stroke(); }); }, 1, 1);
        const M = { st: V('fa_st', '#7a7466', { map: stoneT }), dk: V('fa_dk', '#4a443a', { map: stoneT }), br: V('fa_br', '#2a2620', { metalness: 0.5, roughness: 0.5 }), rn: T.mat('fa_rn' + cv, '#ffffff', { map: rune, emissive: fc, emissiveMap: rune, emissiveIntensity: 1.6, roughness: 0.6 }), coal: T.mat('fa_cl' + cv, '#ff5a1a', { emissive: fc, emissiveIntensity: 1.8, roughness: 0.8 }) };
        const H = [1.5, 1.7, 1.9, 2.05, 2.2][L - 1], W = 0.74, PW = 0.3;   /* altura dos pilares e meia largura do vão: bem maior e mais alto que o arco antigo */
        const course = (x, hh, nN) => { const n = nN, ch = hh / n; for (let j = 0; j < n; j++) { const w = PW - 0.016 * (j % 2), o = (j % 2 ? 0.012 : -0.012); add(box(w, ch - 0.012, PW - 0.02), j % 3 === 1 ? M.dk : M.st, x + o, 0.14 + ch * j + ch / 2, 0); } };
        [-1, 1].forEach(sd => { const x = sd * (W + PW / 2);
            add(box(PW + 0.18, 0.14, PW + 0.18), M.dk, x, 0.07, 0); add(box(PW + 0.08, 0.06, PW + 0.08), M.st, x, 0.17, 0); course(x, H - 0.12, Math.round(H * 5)); add(box(PW + 0.12, 0.1, PW + 0.12), M.st, x, H + 0.03, 0); add(box(PW + 0.2, 0.06, PW + 0.2), M.dk, x, H + 0.11, 0);
            const rp = add(geo('far_p', () => new THREE.PlaneGeometry(0.2, 0.26)), M.rn, x, 0.62, PW / 2 + 0.003); const rp2 = add(geo('far_p', () => new THREE.PlaneGeometry(0.2, 0.26)), M.rn, x, 0.62, -PW / 2 - 0.003); rp2.rotation.y = Math.PI; void rp;
            if (L >= 3) [1.1, 1.55].forEach(yy => { if (yy < H - 0.2) { add(geo('far_p', () => new THREE.PlaneGeometry(0.18, 0.2)), M.rn, x, yy, PW / 2 + 0.003); } });
            const bx = x, by = H + 0.14; add(geo('far_bw', () => new THREE.CylinderGeometry(0.2, 0.12, 0.16, 14)), M.br, bx, by + 0.08, 0); add(geo('far_cl', () => new THREE.CylinderGeometry(0.17, 0.17, 0.03, 14)), M.coal, bx, by + 0.16, 0);   /* braseiro de ferro no topo de cada pilar */
            clFireAdd(grp, bx, by + 0.14, 0, 0.5 + 0.08 * L, 0.85 + 0.12 * L, fc, core);
        });
        const R = W + PW / 2, Rm = W + 0.02, N = 15 + L;   /* aduelas do arco: blocos de pedra em cunha ao longo do semicírculo, com pedra-chave */
        for (let k = 0; k < N; k++) { const a = Math.PI * (k + 0.5) / N, kk = Math.abs(k - (N - 1) / 2) < 0.6, bw = (Math.PI * Rm / N) * 0.98, th = kk ? 0.3 : 0.24; const m = add(box(th, bw, PW + 0.02), kk ? M.dk : (k % 2 ? M.st : M.dk), Math.cos(a) * (Rm + th / 2 - 0.02), H + 0.16 + Math.sin(a) * (Rm + th / 2 - 0.02), 0); m.rotation.z = a; }
        add(geo('far_k', () => new THREE.PlaneGeometry(0.22, 0.2)), M.rn, 0, H + 0.16 + Rm + 0.1, PW / 2 + 0.014);
        const nF = 8 + L * 2; for (let k = 0; k < nF; k++) { const a = Math.PI * (k + 0.5) / nF, rr = Rm - 0.06; clFireAdd(grp, Math.cos(a) * rr, H + 0.16 + Math.sin(a) * rr - 0.2, (k % 2 ? 0.05 : -0.05), 0.3 + 0.06 * L, 0.42 + 0.07 * L, fc, core); }
        FIRE.slice(-FIRE.length).forEach((e, i) => { e.col = fireCol; e.big = i < 2 || (L >= 2 && i % 4 === 0); });
        void R; void H;
    }
    window.ruaFire = { info: () => FIRE.map(e => [e.s.material.color.getHexString(), +e.s.scale.y.toFixed(3), +e.s.position.y.toFixed(3)]), n: () => FIRE.length };
