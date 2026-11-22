/* === [SEC: DRAGOES_SISTEMA_CRUZAMENTO] === */
/* ===== cortex/36jm-colony-bichos.js: O Covil: bichos que produzem, comem ração de biomassa e se cruzam (ovos, graus de raridade, garantia de sorte). Números calculados em .impeccable/build/tools/economia_bichos.py (ver ECONOMIA-BICHOS.md) ===== */
    const ZR = [{ n: 'Comum', col: '#c9d1dc' }, { n: 'Incomum', col: '#6fd88a' }, { n: 'Raro', col: '#5ec8ff' }, { n: 'Épico', col: '#c27bff' }, { n: 'Lendário', col: '#ffc94d' }];
    const ZEL = { terra: { n: 'Terra', col: '#6fd04a', ic: 'ph-mountains' }, agua: { n: 'Água', col: '#3a8cff', ic: 'ph-drop' }, cristal: { n: 'Cristal', col: '#ff5fd2', ic: 'ph-diamond' }, estelar: { n: 'Estelar', col: '#ffc94d', ic: 'ph-star-four' } };   /* cada elemento com uma cor bem diferente: verde, azul, rosa e dourado */
    const ZG = [12, 28, 62, 130, 240], ZVC = 4, ZFEED = [4, 10, 22, 46, 84];      /* produção bruta por hora (equiv. biomassa), valor do cristal, ração por hora */
    const ZP_UP = [0.12, 0.08, 0.04, 0.005], ZCROSS = 0.04, ZLVB = 0.01, ZPITY = [14, 18, 26, 100], ZBSC = [1, 1, 0.4, 0.05], ZCAP = [0.85, 0.85, 0.20, 0.015];   /* 2026-11-21: Lendário verdadeiramente raro (Épico→Lendário 0,5% base, teto 1,5%, pity 100) */
    const ZHATCH = [120, 240, 480, 840, 1440], ZCOOL = [30, 45, 75, 120, 180], ZGROW = [15, 30, 60, 120, 180];      /* minutos */
    const ZDISC = [5, 15, 50, 150, 400], ZREL = [30, 60, 140, 300, 600], ZSLOTS = [8, 12, 16, 20, 25, 28, 32], ZEGGS = [1, 1, 1, 1, 1, 2, 2], ZMYST = ['#ffd35c', '#fff1b0'], ZBUY = 120, ZSTORE = 8, ZFEEDMAX = 12;
    const ZSP = [   /* id, nome, grau, elemento, produto, ícone, base (modelo 3D: demon, fire, icy, mountain, elder), tinta, brilho, tamanho */
        { id: 'musgo', n: 'Dragão de Musgo', rk: 0, el: 'terra', pd: 'Folhas', ic: 'ph-leaf', k: 'b', dr: 1, base: 'cartoon', tint: ['#5fb842', 0.9], glow: null, D: 0.95, cl: { c: '#5fb842', c2: '#ffffff', beak: '#ffb020', leg: '#5fb842', sz: 1.0, wing: '#5fb842' } },
        { id: 'argila', n: 'Dragão de Argila', rk: 0, el: 'terra', pd: 'Barro', ic: 'ph-mountains', k: 'b', dr: 1, base: 'mountain', tint: null, glow: null, D: 0.85, cl: { c: '#d9894a', c2: '#ffffff', beak: '#ffb020', leg: '#d9894a', sz: 1.0, wing: '#d9894a' } },
        { id: 'orvalho', n: 'Dragão do Orvalho', rk: 0, el: 'agua', pd: 'Gotas', ic: 'ph-drop', k: 'b', dr: 1, base: 'mini', tint: ['#5fc8ff', 0.9], glow: null, D: 0.85, cl: { c: '#9fe4ff', c2: '#ffffff', beak: '#ffb020', leg: '#9fe4ff', sz: 1.0, wing: '#9fe4ff' } },
        { id: 'brisa', n: 'Dragão da Brisa', rk: 0, el: 'agua', pd: 'Névoa', ic: 'ph-wind', k: 'b', dr: 1, base: 'bw', tint: null, glow: null, D: 0.85, cl: { c: '#d8f6ff', c2: '#ffffff', beak: '#ffb020', leg: '#d8f6ff', sz: 1.0, wing: '#d8f6ff' } },
        { id: 'cascalho', n: 'Dragão de Cascalho', rk: 0, el: 'terra', pd: 'Cascalho', ic: 'ph-cube', k: 'b', dr: 1, base: 'wyvern', tint: null, glow: null, D: 0.95, cl: { c: '#a6957b', c2: '#ffffff', beak: '#ffb020', leg: '#a6957b', sz: 1.0, wing: '#a6957b' } },
        { id: 'cinza', n: 'Dragão-Cinza', rk: 0, el: 'terra', pd: 'Cinzas', ic: 'ph-cloud', k: 'b', dr: 1, base: 'nightmare', tint: null, glow: null, D: 0.88, cl: { c: '#7c7c88', c2: '#ffffff', beak: '#ffb020', leg: '#7c7c88', sz: 1.0, wing: '#7c7c88' } },
        { id: 'floresta', n: 'Dragão da Floresta', rk: 1, el: 'terra', pd: 'Seiva', ic: 'ph-tree', k: 'b', dr: 1, base: 'poison', tint: null, glow: null, D: 1.0, cl: { c: '#28c858', c2: '#ffffff', beak: '#ffb020', leg: '#28c858', sz: 1.0, wing: '#28c858' } },
        { id: 'ambar', n: 'Dragão Âmbar', rk: 1, el: 'terra', pd: 'Âmbar', ic: 'ph-hexagon', k: 'b', dr: 1, base: 'fire2', tint: ['#ffb338', 0.45], glow: null, D: 1.0, cl: { c: '#ffb338', c2: '#ffffff', beak: '#ffb020', leg: '#ffb338', sz: 1.0, wing: '#ffb338' } },
        { id: 'mare', n: 'Dragão da Maré', rk: 1, el: 'agua', pd: 'Pérolas', ic: 'ph-waves', k: 'b', dr: 1, base: 'ulyssan', tint: ['#298aff', 0.9], glow: '#4da6ff', D: 1.05, cl: { c: '#298aff', c2: '#ffffff', beak: '#ffb020', leg: '#298aff', sz: 1.0, wing: '#298aff' } },
        { id: 'geada', n: 'Dragão da Geada', rk: 1, el: 'agua', pd: 'Gelo', ic: 'ph-snowflake', k: 'b', dr: 1, base: 'icy', tint: null, glow: '#bce4ff', D: 1.0, cl: { c: '#e2f3ff', c2: '#ffffff', beak: '#ffb020', leg: '#e2f3ff', sz: 1.0, wing: '#e2f3ff' } },
        { id: 'bronze', n: 'Dragão de Bronze', rk: 1, el: 'terra', pd: 'Bronze', ic: 'ph-medal', k: 'b', dr: 1, base: 'tilt', tint: null, glow: null, D: 1.08, cl: { c: '#c97d32', c2: '#ffffff', beak: '#ffb020', leg: '#c97d32', sz: 1.0, wing: '#c97d32' } },
        { id: 'prisma', n: 'Dragão Prisma', rk: 2, el: 'cristal', pd: 'Cristal bruto', ic: 'ph-diamond', k: 'b', dr: 1, base: 'prisma_cristal', tint: null, glow: '#4de0ff', D: 1.15, cl: { c: '#5de8ff', c2: '#ffffff', beak: '#ffb020', leg: '#5de8ff', sz: 1.0, wing: '#5de8ff' } },
        { id: 'esmeralda', n: 'Dragão Esmeralda', rk: 2, el: 'cristal', pd: 'Esmeraldas', ic: 'ph-diamond', k: 'b', dr: 1, base: 'esmeralda', tint: null, glow: '#28f585', D: 1.15, cl: { c: '#14e872', c2: '#ffffff', beak: '#ffb020', leg: '#14e872', sz: 1.0, wing: '#14e872' } },
        { id: 'solar', n: 'Dragão Solar', rk: 2, el: 'estelar', pd: 'Luz solar', ic: 'ph-sun', k: 'b', dr: 1, base: 'fire', tint: ['#ffd23a', 0.55], glow: '#ffd64a', D: 1.15, cl: { c: '#ffc820', c2: '#ffffff', beak: '#ffb020', leg: '#ffc820', sz: 1.0, wing: '#ffc820' } },
        { id: 'sabio', n: 'Dragão Sábio', rk: 2, el: 'terra', pd: 'Sálvia', ic: 'ph-plant', k: 'b', dr: 1, base: 'sage', tint: null, glow: null, D: 1.1, cl: { c: '#7fae6a', c2: '#ffffff', beak: '#ffb020', leg: '#7fae6a', sz: 1.0, wing: '#7fae6a' } },
        { id: 'vulcao', n: 'Dragão Vulcânico', rk: 3, el: 'estelar', pd: 'Brasa viva', ic: 'ph-fire', k: 'b', dr: 1, base: 'devil', tint: ['#ff4a1a', 0.75], glow: '#ff7722', D: 1.3, cl: { c: '#ff531a', c2: '#ffffff', beak: '#ffb020', leg: '#ff531a', sz: 1.0, wing: '#ff531a' } },
        { id: 'tempestade', n: 'Dragão da Tempestade', rk: 3, el: 'estelar', pd: 'Raios', ic: 'ph-lightning', k: 'b', dr: 1, base: 'red', tint: ['#657dff', 0.9], glow: '#7c92ff', D: 1.3, cl: { c: '#657dff', c2: '#ffffff', beak: '#ffb020', leg: '#657dff', sz: 1.0, wing: '#657dff' } },
        { id: 'aurora', n: 'Dragão Aurora', rk: 3, el: 'estelar', pd: 'Pó estelar', ic: 'ph-sparkle', k: 'b', dr: 1, base: 'aurora', tint: null, glow: '#ffa1ec', D: 1.35, cl: { c: '#ff75e6', c2: '#ffffff', beak: '#ffb020', leg: '#ff75e6', sz: 1.0, wing: '#ff75e6' } },
        { id: 'eclipse', n: 'Dragão do Eclipse', rk: 4, el: 'estelar', pd: 'Matéria escura', ic: 'ph-moon-stars', k: 'b', dr: 1, base: 'eternatus', glow: '#ffcc44', D: 1.55, cl: { c: '#5928ff', c2: '#ffffff', beak: '#ffb020', leg: '#5928ff', sz: 1.0, wing: '#5928ff' } },
        { id: 'morcego', n: 'Dragão-Morcego', rk: 4, el: 'cristal', pd: 'Cristais da noite', ic: 'ph-moon', k: 'b', dr: 1, base: 'morcego', glow: '#b46bff', D: 1.05, cl: { c: '#7a3cff', c2: '#ffffff', beak: '#ffb020', leg: '#7a3cff', sz: 1.0, wing: '#7a3cff' } },
        { id: 'chamas', n: 'Dragão Chamejante', rk: 3, el: 'terra', pd: 'Brasa viva', ic: 'ph-fire', k: 'b', dr: 1, base: 'chamas', glow: '#ff9a3c', D: 1.45, cl: { c: '#ff7a1a', c2: '#ffffff', beak: '#ffb020', leg: '#ff7a1a', sz: 1.0, wing: '#2a9ab0' } },
        { id: 'hamster', n: 'Dragão Hamster', rk: 4, el: 'estelar', pd: 'Sementes estreladas', ic: 'ph-paw-print', k: 'b', dr: 1, base: 'hamster', glow: '#c58bff', D: 1.4, cl: { c: '#ff9a3c', c2: '#ffffff', beak: '#ffb020', leg: '#ff9a3c', sz: 1.0, wing: '#8a3cff' } },
        { id: 'vigia', n: 'Vigia do Eterno', rk: 4, el: 'cristal', pd: 'Cristais eternos', ic: 'ph-eye', k: 'b', dr: 1, base: 'watcher', glow: '#8fd8ff', D: 1.5, cl: { c: '#6fb4d8', c2: '#ffffff', beak: '#ffb020', leg: '#6fb4d8', sz: 1.0, wing: '#e86aa8' } },
        { id: 'guardiao_botanico', n: 'Guardião Botânico', rk: 1, el: 'terra', pd: 'Pólen dourado', ic: 'ph-plant', k: 'b', dr: 1, base: 'guardiao_botanico', glow: '#4ade80', D: 1.08, cl: { c: '#4ade80', c2: '#fef08a', beak: '#fbbf24', leg: '#22c55e', sz: 1.0, wing: '#86efac' } },
        { id: 'sereia_glacial', n: 'Sereia Glacial', rk: 2, el: 'agua', pd: 'Safira glacial', ic: 'ph-snowflake', k: 'b', dr: 1, base: 'sereia_glacial', glow: '#38bdf8', D: 1.15, cl: { c: '#38bdf8', c2: '#e0f2fe', beak: '#bae6fd', leg: '#0284c7', sz: 1.0, wing: '#7dd3fc' } },
        { id: 'morcego_noturno', n: 'Morcego Noturno', rk: 2, el: 'cristal', pd: 'Eco sombrio', ic: 'ph-moon', k: 'b', dr: 1, base: 'morcego_noturno', tint: ['#2a6df4', 0.9], glow: '#38bdf8', D: 1.3, cl: { c: '#1d4ed8', c2: '#bae6fd', beak: '#38bdf8', leg: '#1e3a8a', sz: 1.0, wing: '#2563eb' } },   /* 2026-11-16: azul-meia-noite com brilho ciano e maior, para não parecer o Dragão-Morcego (roxo) */
        { id: 'crono_engenheiro', n: 'Crono-Engenheiro', rk: 3, el: 'cristal', pd: 'Engrenagens arcanas', ic: 'ph-gear', k: 'b', dr: 1, base: 'crono_engenheiro', glow: '#c084fc', D: 1.32, cl: { c: '#d97706', c2: '#e879f9', beak: '#fbbf24', leg: '#b45309', sz: 1.0, wing: '#a855f7' } },
        { id: 'demonio_cinzas', n: 'Demônio das Cinzas', rk: 4, el: 'estelar', pd: 'Magma vivo', ic: 'ph-fire', k: 'b', dr: 1, base: 'demonio_cinzas', glow: '#ff6a1a', D: 1.55, cl: { c: '#dc2626', c2: '#fde047', beak: '#f97316', leg: '#991b1b', sz: 1.0, wing: '#ea580c' } },
        { id: 'colosso_obsidiana', n: 'Colosso de Obsidiana', rk: 4, el: 'terra', pd: 'Obsidiana viva', ic: 'ph-mountains', k: 'b', dr: 1, base: 'colosso_obsidiana', glow: '#fb923c', D: 1.52, cl: { c: '#334155', c2: '#fb923c', beak: '#f59e0b', leg: '#1e293b', sz: 1.0, wing: '#ea580c' } },
        { id: 'arquimago_astral', n: 'Arquimago Astral', rk: 4, el: 'estelar', pd: 'Essência astral', ic: 'ph-planet', k: 'b', dr: 1, base: 'arquimago_astral', glow: '#fbbf24', D: 1.55, cl: { c: '#4338ca', c2: '#fef08a', beak: '#fbbf24', leg: '#312e81', sz: 1.0, wing: '#818cf8' } },
        { id: 'nimbo', n: 'Nimbo', rk: 4, el: 'cristal', pd: 'Poeira de Aurora', ic: 'ph-sparkle', k: 'b', dr: 1, base: 'nimbo_autoral', glow: '#84f6ff', D: 1.18, cl: { c: '#42c9d9', c2: '#d6faff', beak: '#fff0bd', leg: '#35aebe', sz: 1.0, wing: '#a77bff' } }
    ];
    const ZMIG = { guardiao: 'vigia', cometa: 'eclipse', ametista: 'esmeralda', galinha: 'musgo', pato: 'orvalho', ovelha: 'argila', coelho: 'cascalho', vaca: 'floresta', cisne: 'mare', cabra: 'ambar', pavao: 'prisma', cervo: 'esmeralda', carneiro: 'solar', unicornio: 'aurora', fenix: 'vulcao', dragao: 'eclipse' };   /* bichos de fazenda antigos viram o dragão do mesmo grau */
    const ZLAIR = ['LargeTower', 'PointyTower', 'LargeSquareTowerBricks', 'WallEntranceBricks', 'WallBricks', 'Banner', 'Arch', 'Torch', 'ModularStoneWall', 'Rock_4', 'Rock_5', 'Rock_Moss_3', 'Rock_Moss_4'].map(n => 'lair/' + n + '.glb');
    const zsp = id => ZSP.find(x => x.id === id) || ZSP.find(x => x.id === ZMIG[id]);
    const ZMAXLV = 10, zLvMul = al => 1 + 0.18 * Math.max(0, (al || 1) - 1), zXpNeed = (n, rk) => Math.round(9 * Math.pow(Math.max(0, n - 1), 1.8) * (1 + 0.5 * rk))   /* 2026-11-16: XP vem do combate (ver warGrantXp); curva reduzida para ~3 batalhas por nível */, zLvCost = (n, rk) => ({ b: Math.round(ZG[rk] * 0.9 * (n - 1)), c: Math.ceil(ZG[rk] * 0.045 * (n - 1)), f: Math.max(1, Math.round((n - 1) * (0.6 + 0.4 * rk))) })   /* 2026-11-17 (Etapa 4): + fragmentos do elemento do dragão (f) */, zAL = a => Math.max(1, Math.min(ZMAXLV, ((a && a.lv) | 0) || 1));
    const zFragHave = sp => { try { return warLoot().frag[sp.el] || 0; } catch (e) { return 0; } };
    const zLvAfford = (cost, sp) => { const r = clS().res; return (+r.b || 0) >= cost.b && (+r.c || 0) >= cost.c && zFragHave(sp) >= (cost.f || 0); };
    const zFragTxt = (cost, sp, px) => (cost.f || 0) + ' ' + (typeof warFragSvg === 'function' ? warFragSvg(sp.el, px || 15) : 'frag.');
    const zStar = a => Math.max(0, Math.min(5, ((a && a.star) | 0)));
    const zStarMul = a => 1 + 0.08 * zStar(a);
    const zStarTxt = a => { const st = zStar(a); return st > 0 ? ' ' + '★'.repeat(st) : ''; };
    const zShortName = sp => (sp && sp.n ? sp.n.replace(/^Dragão[- ](?:d[aeo]s? )?/, '') : '');
    function zDupInfo(z, a) {
        if (!z || !a || !Array.isArray(z.an)) return { idx: 1, tot: 1 };
        const same = z.an.filter(x => x.sp === a.sp).sort((x, y) => zDragonPower(zsp(y.sp), y) - zDragonPower(zsp(x.sp), x) || zAL(y) - zAL(x) || x.id - y.id);
        const idx = Math.max(0, same.findIndex(x => x.id === a.id));
        return { idx: idx + 1, tot: same.length || 1, list: same };
    }
    function zDragonLabel(sp, a, z, short) {
        const base = (a && a.nm && String(a.nm).trim()) ? String(a.nm).trim() : (short ? zShortName(sp) : (sp ? sp.n : 'Dragão'));
        if (!a || !z) return base;
        const info = zDupInfo(z, a);
        const tag = (!a.nm && info.tot > 1) ? ' #' + info.idx : '';
        return base + tag;
    }
    const ZELRES = { terra: { b: 1 }, agua: { m: 1 }, cristal: { c: 1 }, estelar: { c: 0.5, b: 0.5, m: 0.5 } }, ZBW = [0.004, 0.008, 0.016, 0.03, 0.06];
    const zYield = (rk, lv, al, star) => { const g = ZG[rk] * (1 + 0.05 * Math.max(0, (lv || 1) - 1)) * zLvMul(al) * (1 + 0.08 * Math.max(0, Math.min(5, star | 0))); return { b: Math.max(1, Math.round(0.6 * g) - ZFEED[rk]), c: Math.round(0.4 * g / ZVC * 10) / 10 }; };   /* 2026-11-17 (Etapa 4): sem ração; a biomassa já vem líquida da antiga ração (o ganho de quem usava a ração automática fica igual) */
    const ZOO = { list: [], eggs: [], pastures: [], sig: '', pscene: null, G: null, M: {}, pt: 0 };

    /* ---------- estado ---------- */
    function zMigrate(z) {   /* idempotente: troca os ids antigos pelos dragões equivalentes, sem mexer em nível, grau ou progresso */
        if (z.drv === 3) return; try { z.an.forEach(a => { if (ZMIG[a.sp]) a.sp = ZMIG[a.sp]; }); z.eggs.forEach(e => { if (ZMIG[e.sp]) e.sp = ZMIG[e.sp]; if (Array.isArray(e.by)) e.by = e.by.map(x => ZMIG[x] || x); }); Object.keys(z.book || {}).forEach(k => { if (ZMIG[k]) { z.book[ZMIG[k]] = 1; delete z.book[k]; } }); z.drv = 3; } catch (e) {}
    }
    function clZooS(s) {
        s = s || clS(); const z = s.zoo = s.zoo && typeof s.zoo === 'object' ? s.zoo : {}; if (!Array.isArray(z.an)) z.an = []; if (!Array.isArray(z.eggs)) z.eggs = []; if (!z.book) z.book = {}; if (!Array.isArray(z.pity)) z.pity = [0, 0, 0, 0]; if (!(z.nid > 0)) z.nid = 1; if (!z.stat) z.stat = { eggs: 0, ups: 0, coll: 0 }; if (!z.towers || typeof z.towers !== 'object') z.towers = {}; if (!z.runes || typeof z.runes !== 'object') z.runes = {}; zMigrate(z); return z;
    }
    function clZooRestore(s) {   /* devolve o valor dos Covis extras que a fusão desmontou: o reembolso tinha sido cortado pelo limite do armazém. Usa o backup local do estado antigo */
        ZOO.restDone = true; let best = null;
        try { const L = JSON.parse(localStorage.getItem('cestille_cl_keep') || '[]'); L.forEach(x => { try { const o = JSON.parse(x.json), cs = (o.pcs || []).filter(p => p[0] === 'curral'); if (cs.length >= 2 && (!best || cs.length > best.cs.length || (cs.length === best.cs.length && x.at > best.at))) best = { at: x.at, cs }; } catch (e) {} }); } catch (e) {}
        if (!best) return;
        const cs = best.cs.slice().sort((a, b) => (b[4] || 1) - (a[4] || 1)); cs.shift(); const tot = {}; cs.forEach(p => { const o = clValueRes(p); Object.keys(o).forEach(k => { tot[k] = (tot[k] || 0) + Math.round(o[k]); }); });
        s.credit = s.credit || {}; Object.keys(tot).forEach(k => { s.credit[k] = (s.credit[k] || 0) + tot[k]; }); s._cred1 = 1; CL.ver++; clSave(true);
        try { clMsg('Devolvi o valor dos ' + cs.length + ' Covil(is) desmontado(s): ' + Object.keys(tot).map(k => tot[k] + ' ' + k.toUpperCase()).join(', ') + '. Entra automaticamente conforme houver espaço no armazém.'); } catch (e) {}
    }
    function clZooCreditPay(s) {   /* crédito a receber: cai nos recursos assim que cabe no armazém, nada se perde */
        const c = s.credit; if (!c) return; const st = clStats(); let any = false;
        Object.keys(c).forEach(r => { if (!(c[r] > 0)) { delete c[r]; return; } const cap = (st.cap && st.cap[r]) || 0, space = Math.max(0, cap - Math.floor(s.res[r] || 0)), mv = Math.floor(Math.min(c[r], space)); if (mv >= 1) { s.res[r] = (s.res[r] || 0) + mv; c[r] -= mv; any = true; } if (c[r] < 1) delete c[r]; });
        if (!Object.keys(c).length) delete s.credit; if (any) { CL.ver++; clSave(); }
    }
    function clZooGiveTree(s) {   /* quem já tinha Covil ganha uma Árvore Incubadora plantada perto dele (uma vez só) */
        if ((s.pcs || []).some(p => p[0] === 'incubadora')) { s._inc1 = 1; return; }
        const cu = s.pcs.find(p => p[0] === 'curral'); let placed = false;
        outer: for (let r = 0; r <= s.H * 2; r++) for (let dx = -r; dx <= r; dx++) for (let dz = -r; dz <= r; dz++) { if (Math.max(Math.abs(dx), Math.abs(dz)) !== r) continue; const x = cu[1] + dx, z = cu[2] + dz; if (Math.abs(x) > s.H || Math.abs(z) > s.H) continue; if (clFits('incubadora', x, z, 0)) { s.pcs.push(['incubadora', x, z, 0, 1, 0]); placed = true; break outer; } }
        s._inc1 = 1; CL.ver++; CL3.need = true; clSave(true); try { clMsg(placed ? 'Uma Árvore Incubadora foi plantada perto do seu Covil! É nela que os ovos chocam, um por vez.' : 'Construa a Árvore Incubadora (aba Produção) para chocar ovos: não achei espaço livre para plantar uma.'); } catch (e) {}
    }
    function clZooMergeCovil(s) {   /* agora só existe UM Covil: os extras são desmontados com reembolso de 100% (nada se perde) e o que ficou herda o maior nível */
        const idx = []; (s.pcs || []).forEach((p, i) => { if (p[0] === 'curral') idx.push(i); }); if (idx.length <= 1) { s._cur1 = 1; return; }
        let keep = idx[0]; idx.forEach(i => { if ((s.pcs[i][4] || 1) > (s.pcs[keep][4] || 1)) keep = i; });
        const rm = idx.filter(i => i !== keep).sort((a, b) => b - a); CL._sell100 = true; try { rm.forEach(i => { clSellPiece(i); }); } finally { CL._sell100 = false; }
        s._cur1 = 1; s._cred1 = 1; CL.ver++; CL3.need = true; clSave(true); try { clMsg('Agora existe um único Covil dos Dragões, que pode ser melhorado. Os ' + rm.length + ' extra(s) foram desmontados e o valor inteiro vira crédito, que entra nos recursos conforme houver espaço no armazém. Para chocar ovos, construa a Árvore Incubadora.'); } catch (e) {}
    }
    function clZooLayout(s) {   /* quais bichos moram em qual Covil (ordem fixa por posição) */
        const cur = []; (s.pcs || []).forEach((p, i) => { if (p[0] === 'curral') cur.push({ pi: i, x: p[1], z: p[2], L: p[4] || 1 }); }); cur.sort((a, b) => a.x - b.x || a.z - b.z); let off = 0; cur.forEach(c => { const idx = Math.max(0, Math.min(ZSLOTS.length - 1, c.L - 1)); c.n = ZSLOTS[idx]; c.eg = ZEGGS[Math.min(ZEGGS.length - 1, idx)]; c.off = off; off += c.n; });
        return { cur, slots: off, eggs: (s.pcs || []).some(p => p[0] === 'incubadora') ? 1 : 0, lv: cur.reduce((m, c) => Math.max(m, c.L), 0) };
    }
    const zAdult = a => a.g >= ZGROW[zsp(a.sp).rk];
    function clZooPayB(s, b, c) { clFarmPay(s, b, c); }
    function clZooFarmBonus(s) {   /* os bichos adultos "adubam" a Plantação: bônus de velocidade */
        const z = s.zoo; if (!z || !z.an.length) return 0; const w = [0.002, 0.005, 0.01, 0.02, 0.04]; return Math.min(0.25, z.an.reduce((a, x) => a + (zAdult(x) ? w[zsp(x.sp).rk] : 0), 0));
    }
    function clZooColBonus(s) {   /* bônus REAIS na produção da colônia: cada dragão adulto soma, pelo elemento (Terra: biomassa, Água: metal, Cristal: cristal, Estelar: um pouco de tudo); sobe com o nível e estrelas; no máximo +35% por recurso */
        const out = { c: 0, b: 0, m: 0 }, z = s && s.zoo; if (!z || !z.an) return out;
        z.an.forEach(a => { const sp = zsp(a.sp); if (!sp || !zAdult(a)) return; const w = ZBW[sp.rk] * (1 + 0.12 * (zAL(a) - 1)) * zStarMul(a), m = ZELRES[sp.el] || {}; Object.keys(m).forEach(k => { out[k] += w * m[k]; }); });
        ['c', 'b', 'm'].forEach(k => { out[k] = Math.min(0.35, out[k]); }); return out;
    }
    function zReserve(s) { let cap = 500; try { cap = clStats().cap.b || 500; } catch (e) {} return Math.min(300, Math.floor(cap * 0.2)); }
    function zAutoFeed(s, a) {   /* ração automática: enche até 8 h, mas nunca deixa a biomassa abaixo da reserva (para você ainda poder construir) */
        const rk = zsp(a.sp).rk, need = ZFEEDMAX - 4 - (a.fed || 0), have = +s.res.b || 0, res = zReserve(s); let hrs = Math.min(need, (have - res) / ZFEED[rk]); if (!(hrs >= 0.5)) return false;
        const cost = Math.ceil(hrs * ZFEED[rk]); if (have - cost < res) return false; s.res.b = have - cost; a.fed = (a.fed || 0) + hrs; return true;
    }
    function clBichosGrow(s, el, use) {   /* chamado por clTick: crescer, comer, produzir, chocar (segundos de jogo; a carga de estudo acelera) */
        const z = s.zoo; if (!z || (!z.an.length && !z.eggs.length)) return; const dt = (+el || 0) + (+use || 0); if (!(dt > 0)) return; const m = dt / 60, h = dt / 3600, lay = clZooLayout(s), lv = lay.lv || 1;
        z.an.forEach(a => {
            const sp = zsp(a.sp); if (!sp) return; if (!zAdult(a)) { a.g = Math.min(ZGROW[sp.rk], a.g + m); return; }
            a.cd = Math.max(0, (a.cd || 0) - m); a.xp = (a.xp || 0) + (+use || 0) / 3600 * 5;   /* estudar também treina os bichos */
            let rem = h, guard = 0;   /* produz em pedaços: quando a ração acaba, a automática (se ligada) completa com a biomassa que sobra acima da reserva */
            while (rem > 1e-6 && (a.st || 0) < ZSTORE && guard++ < 60) {
                a.fed = 8;   /* sempre alimentado (Etapa 4: a ração foi removida) */
                const t = rem; rem -= t; a.pr = (a.pr || 0) + t; while (a.pr >= 1 && a.st < ZSTORE) { a.pr -= 1; a.st = (a.st || 0) + 1; } if (a.st >= ZSTORE) a.pr = 0;
            }
        });
        z.eggs.forEach(e => { if (e.el < e.tot) e.el = Math.min(e.tot, e.el + m); });
    }

    /* ---------- cruzamento ---------- */
    const zHatchT = (M, lv) => ZHATCH[M] * (1 - 0.1 * Math.max(0, Math.min(4, (lv || 1) - 1)));
    const ZARENA_INC = 3, ZARENA_CAP = 60;   /* Arena: incubadoras e limite de dragões sem depender de Árvore/Covil */
    const zBreedCost = (ra, rb) => Math.round(40 * (1 + ra + rb) * (1 + 0.5 * Math.max(ra, rb)));
    function zUpChance(M, cross, lv, a, b) {
        if (M >= 4) return 0;
        const avgLv = (a && b) ? (zAL(a) + zAL(b)) / 2 : 1;
        const stars = (a && b) ? (zStar(a) + zStar(b)) : 0;
        const pBonus = 0.022 * Math.max(0, avgLv - 1) + 0.015 * stars;
        return Math.min(ZCAP[M], ZP_UP[M] + (cross ? (M >= 3 ? 0.01 : ZCROSS) : 0) + ZBSC[M] * (ZLVB * Math.max(0, (lv || 1) - 1) + pBonus));
    }
    function zElSynergy(elA, elB) {
        if (elA === elB) return { label: 'Puro ' + ZEL[elA].n, bonusEl: elA, col: ZEL[elA].col };
        if ((elA === 'terra' && elB === 'agua') || (elA === 'agua' && elB === 'terra')) return { label: 'Ressonância → Cristal', bonusEl: 'cristal', col: ZEL.cristal.col };
        if (elA === 'estelar' || elB === 'estelar') return { label: 'Harmonia Estelar', bonusEl: 'estelar', col: ZEL.estelar.col };
        return { label: 'Ressonância → Estelar', bonusEl: 'estelar', col: ZEL.estelar.col };
    }
    function clZooBreedInfo(a, b, lv) {
        const A = zsp(a.sp), B = zsp(b.sp), M = Math.max(A.rk, B.rk), cross = A.el !== B.el, z = clZooS();
        const avgLv = (zAL(a) + zAL(b)) / 2, stars = zStar(a) + zStar(b), syn = zElSynergy(A.el, B.el);
        const both = A.rk >= 4 && B.rk >= 4, legKeep = M >= 4 ? Math.min(both ? 0.03 : 0.018, (both ? 0.02 : 0.012) + Math.min(0.01, Math.max(0, avgLv - 1) * 0.0008)) : 0;   /* mesma conta exata do zPick */
        return { M, cross, avgLv, stars, syn, legKeep, cost: zBreedCost(A.rk, B.rk), up: zUpChance(M, cross, lv, a, b), baseUp: zUpChance(M, cross, lv), pity: M < 4 ? z.pity[M] : 0, need: M < 4 ? ZPITY[M] : 0, min: Math.max(zHatchT(M, lv), 0), cool: ZCOOL[M] };
    }
    function zPick(A, B, lv, a, b) {
        const z = clZooS(), M = Math.max(A.rk, B.rk), cross = A.el !== B.el; let tier = M, up = false;
        const avgLv = (a && b) ? (zAL(a) + zAL(b)) / 2 : 1;
        const downChance = Math.max(0.04, 0.22 - Math.max(0, avgLv - 1) * 0.016);
        if (M < 4) { const sure = z.pity[M] + 1 >= ZPITY[M]; up = sure || Math.random() < zUpChance(M, cross, lv, a, b); if (up) { tier = M + 1; z.pity[M] = 0; z.stat.ups++; } else { z.pity[M]++; if (Math.random() < downChance) tier = Math.min(A.rk, B.rk); } } else { const both = A.rk >= 4 && B.rk >= 4, keep = Math.min(both ? 0.03 : 0.018, (both ? 0.02 : 0.012) + Math.min(0.01, Math.max(0, avgLv - 1) * 0.0008)); if (Math.random() >= keep) tier = Math.min(3, Math.max(2, Math.min(A.rk, B.rk))); }   /* 2026-11-21: corrigido bug onde 2 Lendários davam Math.max(3, Math.min(4,4))=4 (100% Lendário!). Agora: 2 Lendários = 2%..3% (senão Épico); 1 Lendário = 1,2%..1,8% (senão Raro/Épico) */
        const syn = zElSynergy(A.el, B.el);
        const cand = ZSP.filter(x => x.rk === tier), w = cand.map(x => {
            if (x.el === syn.bonusEl) return A.el === B.el ? 4.0 : 4.2 + Math.max(0, avgLv - 1) * 0.15;
            if (x.el === A.el || x.el === B.el) return 2.5;
            return 0.8;
        }), tot = w.reduce((a, b) => a + b, 0); let r = Math.random() * tot; for (let i = 0; i < cand.length; i++) { r -= w[i]; if (r <= 0) return cand[i]; } return cand[cand.length - 1];
    }
    window.ruaRarityOf = id => { const x = zsp(id); return x ? x.rk | 0 : -1; };   /* usado pelo guard de salvamento (marcos de dragão raro) */
    const clZooSyncPending = () => window.ruaProfile==='guest' && !window.ruaDataReady;
    function clZooBreed(ida, idb, arena) { if(clZooSyncPending())return {ok:false,err:'Aguardando a sincronização da sua conta. Tente novamente em instantes.'};
        if (CL.visit) return { ok: false, err: 'Só dá para cruzar na sua colônia.' }; const s = clS(), z = clZooS(s), lay = clZooLayout(s), a = z.an.find(x => x.id === ida), b = z.an.find(x => x.id === idb);
        if (!a || !b || a === b) return { ok: false, err: 'Escolha dois dragões diferentes.' }; if (!zAdult(a) || !zAdult(b)) return { ok: false, err: 'Os dois precisam ser adultos.' }; if ((a.cd || 0) > 0 || (b.cd || 0) > 0) return { ok: false, err: 'Um deles ainda está descansando.' };
        /* modo Arena (arena=true): sem Árvore Incubadora nem biomassa. 3 incubadoras e o custo em Ouro da Arena (mesma conta do custo em biomassa) */
        const lvA = arena ? Math.max(1, lay.lv) : lay.lv, capE = arena ? ZARENA_INC : lay.eggs;
        if (!capE) return { ok: false, err: 'Construa a Árvore Incubadora para chocar ovos.' }; if (z.eggs.length >= capE) return { ok: false, err: arena ? 'As incubadoras estão cheias. Choque um ovo primeiro.' : 'A Árvore Incubadora já está chocando um ovo. Espere ele nascer.' }; const info = clZooBreedInfo(a, b, lvA);
        if (arena) { const LG = warLoot(); if ((+LG.gold || 0) < info.cost) return { ok: false, err: 'Faltam ' + Math.ceil(info.cost - (+LG.gold || 0)) + ' de ouro.' }; LG.gold = (+LG.gold || 0) - info.cost; } else { if ((+s.res.b || 0) < info.cost) return { ok: false, err: 'Faltam ' + Math.ceil(info.cost - (+s.res.b || 0)) + ' de biomassa.' }; s.res.b -= info.cost; }
        const A = zsp(a.sp), B = zsp(b.sp); let r = zPick(A, B, lvA, a, b);
        if (z.enchanted > 0) {
            z.enchanted--;
            if (r.rk < 3 && Math.random() < 0.45) {
                const candidates = ZSP.filter(x => x.rk === r.rk + 1 && (x.el === A.el || x.el === B.el));
                if (candidates.length) r = candidates[Math.floor(Math.random() * candidates.length)];
            }
        }
        z.eggs.push({ sp: r.id, el: 0, tot: zHatchT(info.M, lvA), by: [A.id, B.id] }); a.cd = b.cd = ZCOOL[info.M]; z.stat.eggs++; CL.ver++; clSave(true, 'dragons'); return { ok: true, info };
    }
    function clZooHatch(s, manual, arena) { if(clZooSyncPending() || !manual)return null;   /* ovos só nascem após um toque explícito em Chocar */
        const z = clZooS(s), lay = clZooLayout(s); let out = null;
        for (let i = 0; i < z.eggs.length; i++) { const e = z.eggs[i];if(e.grantId==='owner-nimbo-authoral-rehatch-20261114-v1'&&window.ruaAuth?.state().uid!=='k0rq9QyD37QUoGD2kacrcyX7b523')continue; if (e.el < e.tot || z.an.length >= (arena ? Math.max(lay.slots, ZARENA_CAP) : lay.slots) || (e.manualHatch && !manual)) continue; z.eggs.splice(i, 1); const sp = zsp(e.sp), a = { id: z.nid++, sp: e.sp, g: 0, fed: 2, pr: 0, st: 0, cd: 0, xp: 0, lv: 1 }; if(e.grantId)a.grantId=e.grantId;if(e.sp==='nimbo'&&e.grantId==='owner-nimbo-authoral-rehatch-20261114-v1'&&e.restoreAnimal){const saved=JSON.parse(JSON.stringify(e.restoreAnimal));Object.assign(a,saved,{sp:'nimbo',grantId:e.grantId});if(z.an.some(other=>other.id===a.id))a.id=z.nid++;z.nid=Math.max(z.nid,(+a.id||0)+1);} z.an.push(a); if(e.grantId){s._grants=s._grants||{};s._grants[e.grantId]={status:'hatched',animalId:a.id,hatchedAt:Date.now()};} if(e.grantId&&typeof state!=='undefined'){state._compensations=state._compensations||{};state._compensations[e.grantId]={...(state._compensations[e.grantId]||{}),uid:window.ruaAuth?.state().uid||'',sp:e.sp,status:'hatched',animalId:a.id,hatchedAt:Date.now()};} const first = !z.book[e.sp]; z.book[e.sp] = 1; if (first) { const c = ZDISC[sp.rk]; clFarmPay(s, 0, c); out = { a, sp, first, c, by: e.by }; } else out = { a, sp, first: false, c: 0, by: e.by }; CL.ver++; clSave(true, 'dragons');if(e.grantId==='owner-nimbo-authoral-rehatch-20261114-v1')setTimeout(()=>window.ruaNimboRehatch?.check(),1500); break; }
        return out;
    }
    function clZooCollect() {
        if (CL.visit) return { ok: false }; const s = clS(), z = clZooS(s), lv = clZooLayout(s).lv || 1; let b = 0, c = 0, n = 0; const items = [];
        z.an.forEach(a => { if ((a.st || 0) > 0) { const y = zYield(zsp(a.sp).rk, lv, zAL(a), zStar(a)); b += y.b * a.st; c += y.c * a.st; n++; items.push({ id: a.id, b: y.b * a.st, c: y.c * a.st, col: ZR[zsp(a.sp).rk].col }); a.st = 0; } });
        if (!n) return { ok: false }; c = Math.round(c); clFarmPay(s, b, c); z.stat.coll += n; CL.ver++; clSave(true, 'dragons'); return { ok: true, b, c, n, items };
    }
    function clZooFeed(id, hours) {
        const s = clS(), z = clZooS(s); const list = id ? z.an.filter(a => a.id === id) : z.an.filter(a => zAdult(a)); let cost = 0, n = 0, totalXp = 0;
        list.forEach(a => {
            const rk = zsp(a.sp).rk, curFed = Math.max(0, a.fed || 0);
            const need = Math.max(0, Math.min(hours || 8, ZFEEDMAX) - curFed);
            if (need <= 0.01 && curFed >= 8) return;
            const feedH = need > 0.05 ? need : 2.0;
            const price = Math.max(1, Math.ceil(feedH * ZFEED[rk])), have = Math.floor(+s.res.b || 0);
            if (have < price) {
                const part = have / ZFEED[rk];
                if (part > 0.2) {
                    a.fed = Math.min(ZFEEDMAX, curFed + part);
                    s.res.b -= Math.floor(part * ZFEED[rk]);
                    cost += Math.floor(part * ZFEED[rk]);
                    const xpG = 0;   /* alimentar não dá mais XP (o XP vem do combate) */
                    n++;
                }
                return;
            }
            s.res.b -= price;
            a.fed = Math.min(ZFEEDMAX, curFed + feedH);
            cost += price;
            const xpG = 0;
            n++;
        });
        if (n) { CL.ver++; clSave(true, 'dragons'); }
        return { ok: n > 0, n, cost, totalXp };
    }
    function clZooBuy(spid) { if(clZooSyncPending())return {ok:false,err:'Aguardando a sincronização da sua conta. Tente novamente em instantes.'};
        const s = clS(), z = clZooS(s), lay = clZooLayout(s), sp = zsp(spid); if (CL.visit) return { ok: false, err: 'Só na sua colônia.' }; if (!sp || sp.rk !== 0) return { ok: false, err: 'Esse dragão não se compra.' }; if (z.an.length >= lay.slots) return { ok: false, err: 'O Covil está cheio.' }; if ((+s.res.b || 0) < ZBUY) return { ok: false, err: 'Faltam ' + Math.ceil(ZBUY - (+s.res.b || 0)) + ' de biomassa.' };
        s.res.b -= ZBUY; const a = { id: z.nid++, sp: spid, g: ZGROW[0], fed: 3, pr: 0, st: 0, cd: 0, xp: 0, lv: 1 }; z.an.push(a); const first = !z.book[spid]; z.book[spid] = 1; if (first) clFarmPay(s, 0, ZDISC[0]); CL.ver++; clSave(true, 'dragons'); return { ok: true, a, sp, first };
    }
    function clZooLevelUp(id, arena) { if(clZooSyncPending())return {ok:false,err:'Aguardando a sincronização da sua conta. Tente novamente em instantes.'};
        if (CL.visit) return { ok: false, err: 'Só na sua colônia.' };
        const s = clS(), z = clZooS(s), a = z.an.find(x => x.id === id);
        if (!a) return { ok: false, err: 'Dragão não encontrado.' };
        const sp = zsp(a.sp), L = zAL(a);
        if (L >= ZMAXLV) return { ok: false, err: 'Este dragão já atingiu o nível máximo (Nv ' + ZMAXLV + ')!' };
        if (!zAdult(a)) return { ok: false, err: 'Espere o filhote crescer antes de subir de nível!' };
        const cost = zLvCost(L + 1, sp.rk);
        const need = zXpNeed(L + 1, sp.rk);
        const xp = Math.floor(a.xp || 0);
        if (xp < need) {
            return { ok: false, err: 'Treino bloqueado: precisa de ' + need + ' XP (' + xp + '/' + need + '). Use o dragão em batalhas na Defesa para treinar!' };
        }
        const goldNeed = cost.b + cost.c;   /* modo Arena: o custo em biomassa+cristal vira Ouro (mesma soma) */
        if (arena) { if ((+warLoot().gold || 0) < goldNeed) return { ok: false, err: 'Faltam ' + Math.ceil(goldNeed - (+warLoot().gold || 0)) + ' de ouro.' }; }
        else if ((+s.res.b || 0) < cost.b || (+s.res.c || 0) < cost.c) {
            return { ok: false, err: 'Faltam recursos para evoluir: ' + cost.b + ' biomassa e ' + cost.c + ' cristal.' };
        }
        const fr = warLoot();
        if ((fr.frag[sp.el] || 0) < cost.f) return { ok: false, err: 'Faltam fragmentos: precisa de ' + cost.f + ' de ' + ((typeof WAR_FRAGS !== 'undefined' && WAR_FRAGS[sp.el]) ? WAR_FRAGS[sp.el].n : sp.el) + ' (ganhe nas batalhas em mapa).' };
        fr.frag[sp.el] -= cost.f;
        if (arena) fr.gold = (+fr.gold || 0) - goldNeed; else { s.res.b -= cost.b; s.res.c -= cost.c; }
        a.lv = L + 1;
        a.xp = Math.max(0, (a.xp || 0) - need);
        CL.ver++;
        clSave(true, 'dragons');
        return { ok: true, lv: a.lv, a };
    }

    /* 2026-11-16: cinemática de evolução a cada nível (curta) e maior nos níveis 5 e máximo. Toque para pular. */
    function zStarRow(n, from) { let h = '<b class="zevo-stars">'; for (let i = 1; i <= 5; i++) h += '<span class="' + (i <= from ? 'on' : (i <= n ? 'new' : '')) + '" style="--i:' + (i - from) + '">★</span>'; return h + '</b>'; }

    /* 2026-11-16: cena 3D da evolução: o dragão real aparece, sobe, junta poder (selo, partículas, brilho) e solta uma onda de luz com rugido */
    /* 2026-11-21: Trilhas musicais oficiais da Arena em .m4a com crossfade suave (0,8s) */
    (function () {
        if (window.EpicMusic && window.EpicMusic._m4a) return;
        const TRACKS = {
            map: './assets/colony/music/epica.m4a',
            battle: './assets/colony/music/heroica.m4a',
            battle_hero: './assets/colony/music/heroica.m4a',
            battle_fast: './assets/colony/music/agitada.m4a',
            battle_dark: './assets/colony/music/sombria.m4a',
            battle_tense: './assets/colony/music/tensa.m4a',
            battle_nightmare: './assets/colony/music/pesadelo_v1.m4a',
            boss: './assets/colony/music/epica.m4a',
            victory: './assets/colony/music/alegre.m4a',
            defeat: './assets/colony/music/triste.m4a'
        };
        const VOL = 0.42;
        let curAudio = null, curName = null, curUrl = null, muted = false, pending = null;
        const isEnabled = () => { try { return localStorage.getItem('cestille_epic_music') !== '0'; } catch (e) { return true; } };
        const fadeVol = (au, to, sec, onDone) => {
            if (!au) { if (onDone) onDone(); return; }
            if (au._fv) { clearInterval(au._fv); au._fv = 0; }
            const steps = Math.max(1, Math.round((sec || 0.7) * 25)), from = au.volume || 0;
            let k = 0;
            au._fv = setInterval(() => {
                k++;
                const u = Math.min(1, k / steps);
                try { au.volume = Math.max(0, Math.min(1, from + (to - from) * u)); } catch (e) {}
                if (u >= 1) { clearInterval(au._fv); au._fv = 0; if (onDone) onDone(); }
            }, 40);
        };
        const stopAu = (au, sec) => {
            if (!au) return;
            fadeVol(au, 0, sec != null ? sec : 0.65, () => { try { au.pause(); au.currentTime = 0; } catch (e) {} });
        };
        const tryUnlock = () => {
            if (pending && isEnabled() && !muted) { const p = pending; pending = null; api.play(p[0], p[1]); }
        };
        try { window.addEventListener('pointerdown', tryUnlock, { passive: true }); window.addEventListener('keydown', tryUnlock, { passive: true }); } catch (e) {}
        const api = {
            _m4a: 1,
            play(name, opt) {
                if (window._warJukeLock && !(opt && opt.force)) name = window._warJukeLock;
                const url = TRACKS[name] || TRACKS.battle;
                if (!isEnabled()) { curName = name; curUrl = url; return; }
                if (curAudio && (curName === name || curUrl === url) && !curAudio.paused) {
                    curName = name;
                    if (!muted && curAudio.volume < VOL * 0.9) fadeVol(curAudio, VOL, 0.5);
                    return;
                }
                const fade = (opt && opt.fade != null) ? opt.fade : 0.8;
                const prev = curAudio;
                curName = name; curUrl = url;
                const au = new Audio(url);
                au.loop = (name !== 'victory' && name !== 'defeat');
                au.preload = 'auto';
                au.volume = 0;
                curAudio = au;
                if (prev) stopAu(prev, fade);
                if (muted) return;
                const pr = au.play();
                if (pr && pr.then) {
                    pr.then(() => { if (curAudio === au && !muted && isEnabled()) fadeVol(au, VOL, fade); })
                      .catch(() => { pending = [name, opt]; });
                } else {
                    fadeVol(au, VOL, fade);
                }
            },
            stop(fade) {
                pending = null; curName = null; curUrl = null;
                if (curAudio) { stopAu(curAudio, fade != null ? fade : 0.6); curAudio = null; }
            },
            setEnabled(on) {
                if (!on) { pending = null; if (curAudio) { stopAu(curAudio, 0.35); curAudio = null; } }
                else if (curName) { const n = curName; curName = null; curUrl = null; api.play(n, { fade: 0.5 }); }
            },
            setMuted(m) {
                muted = !!m;
                if (curAudio) {
                    if (muted) fadeVol(curAudio, 0, 0.25, () => { try { curAudio && muted && curAudio.pause(); } catch (e) {} });
                    else if (isEnabled()) { const p = curAudio.play(); if (p && p.catch) p.catch(() => {}); fadeVol(curAudio, VOL, 0.35); }
                }
            }
        };
        window.EpicMusic = api;
    })();
    function epicMusic(name, opt) { try { if (window.EpicMusic) window.EpicMusic.play(name, opt); } catch (e) {} }
    function epicMusicStop(fade) { try { if (window.EpicMusic) window.EpicMusic.stop(fade); } catch (e) {} }
    function zEvoWaitModel(sp) {
        return new Promise(res => { try { const D = ZMD[sp.id]; if (!D || zModelOk(D.f)) return res(); clModelLoad(D.f); let n = 0; const t = setInterval(() => { if (zModelOk(D.f) || ++n > 50) { clearInterval(t); res(); } }, 100); } catch (e) { res(); } });
    }
    function zEvoStage3D(el, a, sp, cfg) {
        const handle = { stop() { } };
        try {
            if (cfg.still || typeof warEnsurePreviewLibs !== 'function') return handle;
            const T = clTh(); window.THREE = window.THREE || T; let dead = false; handle.stop = () => { dead = true; if (handle.clean) handle.clean(); };
            warEnsurePreviewLibs().then(() => zEvoWaitModel(sp)).then(() => {   /* 2026-11-17: espera o modelo 3D real do dragão (antes mostrava o dragão de código se o modelo ainda não tinha carregado, ex.: ao subir de nível pelo Livro) */
                if (dead || !el.isConnected || !window.ElementalFX || !window.ElementalFX.prototype.sigRings) return;
                const cv = document.createElement('canvas'); cv.className = 'zevo-3d'; el.insertBefore(cv, el.querySelector('.zevo-txt'));
                let R; try { R = new T.WebGLRenderer({ canvas: cv, alpha: true, antialias: true }); } catch (e) { cv.remove(); return; }
                R.outputEncoding = T.sRGBEncoding; R.setClearColor(0x000000, 0); R.shadowMap.enabled = true; R.shadowMap.type = T.PCFSoftShadowMap; R.toneMapping = T.ACESFilmicToneMapping; R.toneMappingExposure = 1.2;
                const sc = new T.Scene(), cam = new T.PerspectiveCamera(38, 1, .1, 80), V = (x = 0, y = 0, z = 0) => new T.Vector3(x, y, z);
                sc.add(new T.HemisphereLight(0xdfe6ff, 0x14100c, .6)); const key = new T.DirectionalLight(0xfff0d8, 2.3); key.position.set(-3.6, 7.5, 4.8); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); const sh = key.shadow.camera; sh.left = -4; sh.right = 4; sh.top = 5; sh.bottom = -3; sh.near = .5; sh.far = 24; key.shadow.bias = -.0006; key.shadow.radius = 4; key.target.position.set(0, .8, 0); sc.add(key, key.target);
                const back = new T.DirectionalLight(new T.Color(cfg.col2), 1.5); back.position.set(3.5, 3.5, -5); sc.add(back);
                const rim = new T.PointLight(new T.Color(cfg.col), 0, 14); rim.position.set(0, 1.6, 2.6); sc.add(rim);
                const ease = x => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
                const fx = new window.ElementalFX(sc); let Bd = null; try { Bd = zBuild(sp, true, cfg.nl); } catch (e) { Bd = null; }
                if (!Bd || !Bd.g) { fx.clear(); R.dispose(); cv.remove(); return; }
                const g = Bd.g, holder = new T.Group(); sc.add(holder); holder.add(g); g.scale.setScalar(1); g.position.set(0, 0, 0); g.rotation.set(0, 0, 0);
                const play = act => { try { if (act && Bd.mixer) zDragonAct(Bd, act, 1); } catch (e) { } };
                play(Bd.act && (Bd.act.fly || Bd.act.idle)); try { Bd.mixer && Bd.mixer.update(0); } catch (e) { }
                const bb = zPosedBox(g), sz = bb.getSize(new T.Vector3()), ct = bb.getCenter(new T.Vector3()), k = 2.6 / Math.max(sz.x, sz.y * 1.2, sz.z, .01);
                g.scale.setScalar(k); g.position.set(-ct.x * k, -bb.min.y * k, -ct.z * k); holder.rotation.y = -.75;
                const mats = []; g.traverse(o => { if (!o.isMesh) return; (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { if (m && m.emissive) { if (!m.userData._e0) { m.userData._e0 = m.emissive.clone(); m.userData._i0 = m.emissiveIntensity; } mats.push(m); } }); });
                const ec = new T.Color(cfg.col2), base = V(0, 0, 0), mid = V(0, 1.3, 0), big = cfg.big, REL = 1.6;
                /* 2026-11-17: base (pedestal) FIXA com selo mágico, coluna de luz, estrelas, brasas e cristais orbitando; fica até o fim */
                const deco = [], tex = (draw) => { const c = document.createElement('canvas'); c.width = c.height = 512; draw(c.getContext('2d'), 512); const tx = new T.CanvasTexture(c); return tx; };
                const glyphTex = (hexes, inner) => tex((g, S) => {
                    g.translate(S / 2, S / 2); g.lineCap = 'round';
                    const ring = (r, w, a, c) => { g.beginPath(); g.arc(0, 0, S * r, 0, 7); g.lineWidth = w; g.strokeStyle = c; g.globalAlpha = a; g.stroke(); };
                    ring(.47, 5, .95, cfg.col2); ring(.43, 2, .7, cfg.col); ring(.31, 3, .85, cfg.col2); ring(.2, 2, .7, cfg.col);
                    g.globalAlpha = .9; g.strokeStyle = cfg.col2; for (let i = 0; i < 72; i++) { const a = i / 72 * 6.2832, l = i % 6 === 0 ? .05 : .02; g.lineWidth = i % 6 === 0 ? 3 : 1.5; g.beginPath(); g.moveTo(Math.cos(a) * S * .43, Math.sin(a) * S * .43); g.lineTo(Math.cos(a) * S * (.43 - l), Math.sin(a) * S * (.43 - l)); g.stroke(); }
                    for (const [n, k, r, w] of [[hexes, 2, .31, 2.5], [inner ? 7 : 5, 2, .2, 2], [3, 1, .2, 2], [3, 1, .2, 2]]) { g.beginPath(); for (let i = 0; i <= n; i++) { const a = (i * k) / n * 6.2832 + (n === 3 ? (i % 2 ? 0 : 3.1416) : 0); const x = Math.cos(a - 1.5708) * S * r, y = Math.sin(a - 1.5708) * S * r; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.lineWidth = w; g.strokeStyle = cfg.col; g.globalAlpha = .85; g.stroke(); }
                    g.globalAlpha = 1; g.fillStyle = cfg.col2; for (let i = 0; i < 12; i++) { const a = i / 12 * 6.2832; g.beginPath(); g.arc(Math.cos(a) * S * .37, Math.sin(a) * S * .37, 6, 0, 7); g.fill(); g.save(); g.translate(Math.cos(a) * S * .25, Math.sin(a) * S * .25); g.rotate(a + 1.5708); g.fillRect(-2, -9, 4, 18); g.restore(); }
                    const gr = g.createRadialGradient(0, 0, 0, 0, 0, S * .12); gr.addColorStop(0, 'rgba(255,255,255,.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, S * .12, 0, 7); g.fill();
                });
                const glowTex = tex((g, S) => { const gr = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2); gr.addColorStop(0, 'rgba(255,255,255,.95)'); gr.addColorStop(.35, 'rgba(255,255,255,.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, S, S); });
                const addMat = (c, o) => new T.MeshBasicMaterial(Object.assign({ color: new T.Color(c), transparent: true, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide }, o || {}));
                const ped = new T.Group(); sc.add(ped);
                const disc = new T.Mesh(new T.CylinderGeometry(1.7, 1.85, .16, 56), new T.MeshStandardMaterial({ color: 0x151823, metalness: .65, roughness: .35, emissive: new T.Color(cfg.col), emissiveIntensity: .22 })); disc.position.y = -.09; disc.receiveShadow = true; ped.add(disc);
                const shd = new T.Mesh(new T.CircleGeometry(1.75, 48), new T.ShadowMaterial({ opacity: .6 })); shd.rotation.x = -Math.PI / 2; shd.position.y = .006; shd.receiveShadow = true; ped.add(shd);
                g.traverse(o => { if (o.isMesh) o.castShadow = true; });
                const disc2 = new T.Mesh(new T.CylinderGeometry(2.05, 2.2, .1, 56), new T.MeshStandardMaterial({ color: 0x0d0f16, metalness: .5, roughness: .5, emissive: new T.Color(cfg.col2), emissiveIntensity: .12 })); disc2.position.y = -.2; ped.add(disc2);
                const rimR = new T.Mesh(new T.TorusGeometry(1.74, .04, 12, 96), addMat(cfg.col2, { opacity: .95 })); rimR.rotation.x = Math.PI / 2; rimR.position.y = .0; ped.add(rimR);
                const rimR2 = new T.Mesh(new T.TorusGeometry(2.1, .025, 10, 96), addMat(cfg.col, { opacity: .7 })); rimR2.rotation.x = Math.PI / 2; rimR2.position.y = -.14; ped.add(rimR2);
                const gnd = new T.Mesh(new T.PlaneGeometry(5.2, 5.2), addMat('#ffffff', { map: glyphTex(6), opacity: .75 })); gnd.rotation.x = -Math.PI / 2; gnd.position.y = .012; ped.add(gnd);
                const gnd2 = new T.Mesh(new T.PlaneGeometry(7.4, 7.4), addMat('#ffffff', { map: glyphTex(8, 1), opacity: .35 })); gnd2.rotation.x = -Math.PI / 2; gnd2.position.y = -.25; ped.add(gnd2);
                const glow = new T.Mesh(new T.PlaneGeometry(6, 6), addMat(cfg.col, { map: glowTex, opacity: .5 })); glow.rotation.x = -Math.PI / 2; glow.position.y = .02; ped.add(glow);
                deco.push((t, dt, u, after, fired) => {
                    const pop = fired ? Math.exp(-after * 3) : 0, ent = ease(t / .7);
                    ped.scale.setScalar(.2 + .8 * ent); ped.rotation.y = 0; gnd.rotation.z = t * .35; gnd2.rotation.z = -t * .18; glow.material.opacity = .34 + .14 * Math.sin(t * 2.2) + .3 * pop + .18 * u;
                    rimR.material.opacity = .75 + .25 * Math.sin(t * 3) + pop * .3; rimR.scale.setScalar(1 + pop * .06);
                });
                el.classList.add('has3d');
                /* carga: selo no chão e partículas que correm para o dragão */
                fx.sigil(base, 'rune', cfg.col, cfg.col2, 5.4, 3.4, .2, .5); if (big) fx.sigil(base, 'astro', cfg.col2, cfg.col, 7.4, 3.6, .6, -.4);
                fx.later(.1, () => fx.sigRings(base, cfg.col, cfg.col2, 1.6, 3));
                for (let i = 0; i < (big ? 46 : 30); i++) { const an = Math.random() * Math.PI * 2, r = 3 + Math.random() * 2, st = V(Math.cos(an) * r, .2 + Math.random() * 2.6, Math.sin(an) * r); fx.sigMote(st, mid, i % 2 ? cfg.col : cfg.col2, .2 + Math.random() * .16, .9 + Math.random() * .6, .3 + Math.random() * .9, true); }
                let t = 0, last = performance.now(), raf = 0, fired = false, shake = 0, roar = 0;
                const release = () => {
                    fired = true; shake = .16; roar = .9; play(Bd.act && (Bd.act.atk || Bd.act.fly)); setTimeout(() => { try { play(Bd.act && (Bd.act.fly || Bd.act.idle)); } catch (e) { } }, 1300);
                    fx.glow(mid, '#ffffff', 9, .4); fx.glow(mid, cfg.col, 7, .9); fx.sigRings(base, cfg.col, cfg.col2, 2.6, big ? 7 : 5); fx.column(base, cfg.col2, 7, 1.3, .55); fx.column(base, cfg.col, 6, 1.5, 1.1, .05); fx.burst(mid, cfg.col2, big ? 56 : 40, 1.3);
                    for (let i = 0; i < 26; i++) { const an = i / 26 * Math.PI * 2; fx.sigMote(mid, mid.clone().add(V(Math.cos(an) * (2.5 + Math.random() * 2), (Math.random() - .3) * 2.4, Math.sin(an) * (2.5 + Math.random() * 2))), i % 2 ? cfg.col : '#ffffff', .24, 1, 0); }
                    if (big) { for (let i = 0; i < 6; i++) { const an = i / 6 * Math.PI * 2; fx.column(V(Math.cos(an) * 2.4, 0, Math.sin(an) * 2.4), i % 2 ? cfg.col : cfg.col2, 5.5, 1.3, .28, i * .05); } if (fx.bbExplosion) fx.bbExplosion(base, cfg.col, cfg.col2, { size: 3.4 }); }
                };
                const frame = now => {
                    if (dead) return; raf = requestAnimationFrame(frame); const dt = Math.min(.05, (now - last) / 1000); last = now; t += dt;
                    const w = cv.clientWidth, h = cv.clientHeight, dpr = Math.min(2, window.devicePixelRatio || 1);
                    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { R.setPixelRatio(dpr); R.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }
                    const nar = w / h < 1 ? 1.5 : 1;
                    if (!fired && t >= REL) release();
                    const sum = ease(t / .5), u = ease((t - .4) / (REL - .4)), after = Math.max(0, t - REL), pulse = Math.exp(-after * 5) * (fired ? 1 : 0);
                    holder.scale.setScalar(Math.max(.001, sum) * (1 + .07 * u + .22 * pulse));
                    holder.position.y = .55 * u * (fired ? Math.max(.35, Math.exp(-after * .8)) : 1) + Math.sin(t * 2.4) * .06;
                    holder.rotation.y = -.75 + Math.sin(t * .8) * .25 + u * .5 * Math.exp(-after * 1.2);
                    const ramp = fired ? Math.max(.35, 1.9 * Math.exp(-after * 2.2)) : 1.9 * u;
                    mats.forEach(m => { m.emissive.copy(m.userData._e0).lerp(ec, Math.min(1, ramp * .2)); m.emissiveIntensity = m.userData._i0 + ramp * .42; });
                    rim.intensity = fired ? 2.4 * Math.exp(-after * 1.4) + .4 : 2.6 * u; shake = Math.max(0, shake - dt * .12);
                    cam.position.set(2.1 * nar + (Math.random() - .5) * shake, 1.7 + 1.5 * (nar - 1) + (Math.random() - .5) * shake, (7.4 + Math.min(after, 3) * .25 * Math.min(1, after)) * nar); cam.lookAt(0, .5 + .25 * u, 0);
                    try { Bd.mixer && Bd.mixer.update(dt * (1 + roar * Math.exp(-after * 2))); } catch (e) { } try { Bd.fxStep && Bd.fxStep(t, dt); } catch (e) { }
                    deco.forEach(f => f(t, dt, u, after, fired)); fx.update(dt); R.render(sc, cam);
                };
                raf = requestAnimationFrame(frame);
                handle.clean = () => { try { cancelAnimationFrame(raf); fx.clear(); mats.forEach(m => { try { m.dispose(); } catch (e) { } }); sc.traverse(o => { try { if (o.geometry) o.geometry.dispose(); const ms = Array.isArray(o.material) ? o.material : (o.material ? [o.material] : []); ms.forEach(m => { if (m.map) m.map.dispose(); m.dispose(); }); } catch (e) { } }); R.dispose(); R.forceContextLoss && R.forceContextLoss(); } catch (e) { } };
                if (dead) handle.clean();
            }).catch(() => { });
        } catch (e) { console.warn('zEvoStage3D', e); }
        return handle;
    }
    function zEvoCine(a, oldLv, opt) {
        try {
            if (!a || document.getElementById('zevo')) return;
            const sp = zsp(a.sp); if (!sp) return;
            const nl = zAL(a), ST = opt && opt.star ? opt.star : 0, big = ST ? ST >= 5 : (nl === 5 || nl >= ZMAXLV), still = false;   /* a animação de subir de nível/estrela SEMPRE toca (o modo "reduzir movimento" do aparelho a desligava) */
            const col = ST ? '#fbbf24' : (sp.glow || (sp.cl && sp.cl.c) || '#fbbf24'), col2 = ST ? '#fff3b0' :  (sp.cl && sp.cl.c2 && sp.cl.c2 !== '#ffffff') ? sp.cl.c2 : '#fde68a';
            const s0 = zDragonCombatStats(sp, Object.assign({}, a, { lv: oldLv })), s1 = zDragonCombatStats(sp, a);
            let img = ''; try { img = zPortrait(sp.id) || ''; } catch (e) {}
            const RK = ['Comum', 'Incomum', 'Raro', 'Épico', 'Lendário'];
            const el = document.createElement('div'); el.id = 'zevo'; el.className = 'zevo' + (big ? ' big' : '') + (still ? ' still' : '');
            el.style.setProperty('--c', col); el.style.setProperty('--c2', col2);
            let sparks = ''; const n = big ? 34 : 18;
            for (let i = 0; i < n; i++) { const ang = Math.random() * 360, d = 90 + Math.random() * (big ? 260 : 170); sparks += '<i style="--a:' + ang.toFixed(0) + 'deg;--d:' + d.toFixed(0) + 'px;--t:' + (1.1 + Math.random() * 1.2).toFixed(2) + 's;--w:' + (Math.random() * 0.5).toFixed(2) + 's"></i>'; }
            let bgStars = '', bgEmb = ''; for (let i = 0; i < 70; i++) bgStars += '<i style="left:' + (Math.random() * 100).toFixed(1) + '%;top:' + (Math.random() * 100).toFixed(1) + '%;--d:' + (1.6 + Math.random() * 3).toFixed(2) + 's;--w:' + (Math.random() * 3).toFixed(2) + 's;width:' + (1 + Math.random() * 2).toFixed(1) + 'px;height:' + (1 + Math.random() * 2).toFixed(1) + 'px"></i>';
            for (let i = 0; i < 0; i++) bgEmb += '<i style="left:' + (Math.random() * 100).toFixed(1) + '%;--x:' + ((Math.random() - 0.5) * 22).toFixed(1) + 'vw;--d:' + (4 + Math.random() * 5).toFixed(2) + 's;--w:' + (Math.random() * 5).toFixed(2) + 's;--s:' + (3 + Math.random() * 5).toFixed(1) + 'px"></i>';
            el.innerHTML = '<div class="zevo-bg"><i class="zevo-neb a"></i><i class="zevo-neb b"></i><i class="zevo-aur a"></i><i class="zevo-aur b"></i><div class="zevo-stars">' + bgStars + '</div><div class="zevo-emb">' + bgEmb + '</div><div class="zevo-vig"></div></div><div class="zevo-rays"></div><div class="zevo-ring"></div><div class="zevo-ring r2"></div>' + (big ? '<div class="zevo-ring r3"></div>' : '')
                + '<div class="zevo-stage">' + (img ? '<img class="zevo-img" alt="" src="' + img + '">' : '<i class="zevo-img ph-bold ' + (sp.ic || 'ph-fire') + '"></i>') + '<div class="zevo-sparks">' + sparks + '</div></div>'
                + '<div class="zevo-txt"><small>' + (ST ? (ST >= 5 ? 'ESTRELA MÁXIMA' : 'FUSÃO CONCLUÍDA') : (big ? (nl >= ZMAXLV ? 'EVOLUÇÃO FINAL' : 'EVOLUÇÃO') : 'SUBIU DE NÍVEL')) + '</small>' + (ST ? zStarRow(ST, opt.from | 0) : '<b>Nível ' + nl + '</b>') + '<span>' + sp.n + ' · ' + RK[sp.rk | 0] + '</span>'
                + (ST ? '<div class="zevo-st"><p><em>Poder</em> +' + 6 * (opt.from | 0) + '% <u>→</u> <strong>+' + 6 * ST + '%</strong> <sup>+' + 6 * (ST - (opt.from | 0)) + '%</sup></p><p><em>Nível</em> ' + nl + ' <u>·</u> a Vida e o Ataque na batalha crescem 6% por estrela</p></div>' : '<div class="zevo-st"><p><em>Vida</em> ' + s0.hp + ' <u>→</u> <strong>' + s1.hp + '</strong> <sup>+' + (s1.hp - s0.hp) + '</sup></p><p><em>Ataque</em> ' + s0.atk + ' <u>→</u> <strong>' + s1.atk + '</strong> <sup>+' + (s1.atk - s0.atk) + '</sup></p></div>') + '<i class="zevo-skip">toque para continuar</i></div>';
            let closed = 0, st3 = null; const close = () => { if (closed) return; closed = 1; epicMusicStop(1.1); el.classList.add('out'); setTimeout(() => { try { if (st3) st3.stop(); el.remove(); } catch (e) {} }, 350); };
            el.addEventListener('click', () => { if (Date.now() - t0 > 900) close(); }); const t0 = Date.now();
            document.body.appendChild(el); epicMusic('evo', { fade: 0.1 });
            st3 = zEvoStage3D(el, a, sp, { col, col2, big, nl, ST, still });
            if (big) { try { clFarmBuzz([30, 50, 30, 50, 90]); } catch (e) {} }
            setTimeout(close, big ? 8500 : 6200);
        } catch (e) { console.warn('zEvoCine', e); }
    }
    function clZooRelease(id) {
        const s = clS(), z = clZooS(s), i = z.an.findIndex(a => a.id === id); if (i < 0) return { ok: false }; const rk = zsp(z.an[i].sp).rk, g = ZREL[rk]; z.an.splice(i, 1); CL.ver++; clFarmPay(s, g, 0); clSave(true, 'dragons'); ZOO.sig = ''; return { ok: true, g };
    }
    function clZooFuse(srcId, dstId) { if(clZooSyncPending())return {ok:false,err:'Aguardando a sincronização da sua conta. Tente novamente em instantes.'};
        if (CL.visit) return { ok: false, err: 'Só na sua colônia.' };
        const s = clS(), z = clZooS(s), lay = clZooLayout(s);
        const srcIdx = z.an.findIndex(a => a.id === srcId);
        if (srcIdx < 0) return { ok: false, err: 'Dragão de origem não encontrado.' };
        const src = z.an[srcIdx], sp = zsp(src.sp);
        const others = z.an.filter(a => a.sp === src.sp && a.id !== src.id).sort((x, y) => zDragonPower(zsp(y.sp), y) - zDragonPower(zsp(x.sp), x) || zAL(y) - zAL(x) || x.id - y.id);
        if (!others.length) return { ok: false, err: 'Precisa de outro exemplar da mesma espécie para fundir.' };
        const dst = (dstId ? others.find(a => a.id === dstId) : null) || others[0];
        let colB = 0, colC = 0;
        if ((src.st || 0) > 0) {
            const y = zYield(sp.rk, lay.lv || 1, zAL(src), zStar(src));
            colB = Math.round(y.b * src.st); colC = Math.round(y.c * src.st);
            if (colB || colC) clFarmPay(s, colB, colC);
        }
        const curStar = zStar(dst), addStar = 1 + zStar(src), nextStar = Math.min(5, curStar + addStar);
        const baseXp = [10, 20, 35, 60, 100][sp.rk] || 10;   /* 2026-11-16: reduzido junto com a nova curva de XP */
        let xpGain = Math.round((src.xp || 0) * 0.6) + baseXp;
        if (curStar >= 5) xpGain = Math.round(xpGain * 1.5);
        dst.star = nextStar;
        dst.xp = (dst.xp || 0) + xpGain;
        z.an.splice(srcIdx, 1);
        ZOO.anId = dst.id;
        ZOO.sig = '';
        CL.ver++;
        clSave(true, 'dragons');
        return { ok: true, dst, star: nextStar, gainedStar: nextStar - curStar, xpGain, colB, colC, sp };
    }
    function clZooRename(id, name) {
        if (CL.visit) return { ok: false, err: 'Só na sua colônia.' };
        const s = clS(), z = clZooS(s), a = z.an.find(x => x.id === id);
        if (!a) return { ok: false, err: 'Dragão não encontrado.' };
        const clean = String(name || '').replace(/[\r\n\t]+/g, ' ').trim().slice(0, 22);
        if (clean) a.nm = clean; else delete a.nm;
        CL.ver++; clSave(true, 'dragons');
        return { ok: true, nm: a.nm || '' };
    }

    /* ---------- interface ---------- */
    const zPct = x => Math.round(x * 100) + '%';
    const zTime = m => m < 90 ? Math.max(1, Math.ceil(m)) + ' min' : (m / 60).toFixed(1).replace('.', ',') + ' h';
    function zState(a, lv) {
        const sp = zsp(a.sp), rk = sp.rk;
        if (!zAdult(a)) return { k: 'baby', t: 'Filhote · ' + zTime((ZGROW[rk] - a.g)), p: a.g / ZGROW[rk] };
        if ((a.st || 0) > 0) { const y = zYield(rk, lv, zAL(a), zStar(a)); return { k: 'ready', t: 'Pronto: +' + y.b * a.st + ' biomassa' + (y.c * a.st >= 1 ? ' +' + Math.round(y.c * a.st) + ' cristal' : ''), p: 1 }; }
        if ((a.cd || 0) > 0) return { k: 'rest', t: 'Descansando ' + zTime(a.cd), p: a.pr || 0 };
        return { k: 'work', t: 'Produzindo', p: a.pr || 0 };
    }
    function clIncubadoraPanelHTML(pi) {
        const s = clS(), z = clZooS(s), lay = clZooLayout(s);
        const eggs = z.eggs || [];
        const anyOk = eggs.some(e => e && e.el >= e.tot);

        let eggCard = '';
        if (eggs.length) {
            eggCard = eggs.map((eg, idx) => {
                const ok = eg && eg.el >= eg.tot;
                const left = Math.max(0, eg.tot - eg.el);
                const pr = Math.min(1, eg.el / Math.max(1, eg.tot));
                const spE = zsp(eg.sp) || ZSP[0], R = ZR[spE.rk], E = ZEL[spE.el];
                const acts = [];
                if (ok && !eg.manualHatch && !eg.grantId) {
                    acts.push('<button type="button" data-cl="zoo-unrush-egg" data-i="' + idx + '" style="padding:6px 11px;border-radius:10px;border:1px solid rgba(251,191,36,.45);background:rgba(15,23,42,.75);color:#fde68a;font:700 12px/1.2 inherit;cursor:pointer;display:inline-flex;align-items:center;gap:5px"><i class="ph-bold ph-arrow-counter-clockwise"></i><span>Voltar timer (' + zClock(eg.tot) + ')</span></button>');
                }
                if (eggs.length > 1) {
                    acts.push('<button type="button" data-cl="zoo-keep-egg" data-i="' + idx + '" style="padding:6px 11px;border-radius:10px;border:1px solid rgba(56,189,248,.5);background:rgba(15,23,42,.85);color:#bae6fd;font:700 12px/1.2 inherit;cursor:pointer;display:inline-flex;align-items:center;gap:5px"><i class="ph-bold ph-check-circle"></i><span>Manter este ovo comum</span></button>');
                }
                return '<div class="cl-incub-egg-hero' + (ok ? ' rdy' : '') + '">'
                    + '<div class="incub-egg-svg-wrap">' + zEggSVG(R.col, E.col, ok, spE.id) + '</div>'
                    + '<div class="incub-egg-meta">'
                    + '<b>' + (eggs.length > 1 ? ('Ovo #' + (idx + 1) + ' — ') : '') + (ok ? '✨ Ovo Pronto para Nascer!' : 'Ovo Dracônico em Incubação') + '</b>'
                    + '<div class="cl-pbar" style="height:12px;border-radius:6px;background:rgba(0,0,0,.45)"><i style="width:' + Math.round(pr * 100) + '%;border-radius:6px"></i></div>'
                    + '<div class="incub-timer">' + (ok ? 'Pronto!' : zClock(left)) + ' <span style="font-size:0.95rem;font-weight:700;color:#cbd5e1">(' + Math.round(pr * 100) + '%)</span></div>'
                    + '<small>' + (ok ? (z.an.length >= lay.slots ? '⚠️ Covil cheio (' + z.an.length + '/' + lay.slots + ' vagas). Libere espaço para chocar!' : 'Toque no botão dourado de Chocar na barra de ações abaixo para acordá-lo!') : 'Observe as cores e marcas da casca na árvore para tentar adivinhar qual espécie vai nascer!') + '</small>'
                    + (acts.length ? '<div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:6px">' + acts.join('') + '</div>' : '')
                    + '</div>'
                    + '</div>';
            }).join('');
        } else {
            eggCard = '<div class="cl-incub-empty">'
                + '<i class="ph-bold ph-egg"></i>'
                + '<div><b>Árvore Livre e Acolhedora</b><small>Toque no botão de Cruzar abaixo (💖) para escolher 2 dragões adultos no Altar 3D e gerar uma nova espécie mística!</small></div>'
                + '</div>';
        }

        return '<div class="cl-incub-panel">'
            + '<div class="cl-sel-expand-h"><span><i class="ph-bold ph-tree"></i> Árvore Incubadora dos Dragões</span><span style="font-weight:800;font-size:0.92rem;color:' + (eggs.length > 1 ? '#fbbf24' : anyOk ? '#fde047' : eggs.length ? '#38bdf8' : '#4ade80') + '">' + (eggs.length > 1 ? ('⚠️ ' + eggs.length + ' ovos no ninho') : anyOk ? '✨ Ovo pronto!' : eggs.length ? '🥚 Chocando…' : '🌱 Ninho livre') + '</span></div>'
            + eggCard
            + '</div>';
    }

    function clBichosPanelHTML(pi) {
        const s = clS(), z = clZooS(s), lay = clZooLayout(s), cu = lay.cur.find(c => c.pi === pi); if (!cu) return ''; const lv = lay.lv || 1;
        const ZVIS = ['torre pontuda no portão', 'torre quadrada e tochas', 'estandartes no portão', 'arco de pedra no portão', 'muralha de pedra alta', 'fortaleza dracônica real'], nextNote = lv < ZSLOTS.length ? '<small class="cl-note cl-znext"><b>Nv ' + (lv + 1) + ' do Covil:</b> +' + (ZSLOTS[lv] - ZSLOTS[lv - 1]) + ' vaga' + (ZSLOTS[lv] - ZSLOTS[lv - 1] > 1 ? 's' : '') + ' (total ' + ZSLOTS[lv] + ' vagas), ovos chocam mais rápido.</small>' : '<small class="cl-note cl-znext">Covil no nível máximo: capacidade épica para todos os dragões.</small>';
        const mine = z.an.slice(cu.off, cu.off + cu.n); let ready = 0, hungry = 0; mine.forEach(a => { if ((a.st || 0) > 0) ready++; if (zAdult(a) && !(a.fed > 0.02)) hungry++; });
        const rows = mine.map(a => { const sp = zsp(a.sp), st = zState(a, lv), R = ZR[sp.rk], lbl = zDragonLabel(sp, a, z) + zStarTxt(a); return '<button type="button" class="cl-zrow ' + st.k + '" data-cl="zoo-pet" data-id="' + a.id + '" style="--c:' + R.col + '"><span class="cl-zdot">' + zImg(sp.id) + '</span><span class="cl-znm"><b>' + esc(lbl) + ' <em class="cl-zlv">Nv ' + zAL(a) + '</em></b><small>' + st.t + '</small><span class="cl-pbar"><i style="width:' + Math.round(100 * st.p) + '%"></i></span></span><i class="ph-bold ph-caret-right"></i></button>'; }).join('');
        const emptyN = Math.max(0, cu.n - mine.length), er = emptyN ? '<button type="button" class="cl-zrow empty" data-cl="zoo-buy"><span class="cl-zdot"><i class="ph-bold ph-plus"></i></span><span class="cl-znm"><b>' + emptyN + (emptyN > 1 ? ' vagas livres' : ' vaga livre') + '</b><small>Toque para trazer um dragão (' + ZBUY + ' biomassa)</small></span></button>' : '';
        const eggs = z.eggs.map((e, i) => { const spE = zsp(e.sp) || ZSP[0], ok = e.el >= e.tot; return '<span class="cl-zegg' + (ok ? ' ok' : '') + '"' + (ok && z.an.length < lay.slots ? ' data-cl="zoo-hatch"' : '') + ' style="--c:' + ZR[spE.rk].col + '" title="' + (ok ? 'Pronto para nascer' : 'Faltam ' + zClock(e.tot - e.el)) + '"><span class="mini">' + zEggSVG(ZR[spE.rk].col, ZEL[spE.el].col, ok, spE.id) + '</span><u>' + (ok ? (z.an.length >= lay.slots ? 'sem vaga' : 'nasce!') : zClock(e.tot - e.el)) + '</u></span>'; }).join('');
        const stat = ready ? ready + (ready > 1 ? ' prontos para coletar' : ' pronto para coletar') : mine.length ? 'Tudo tranquilo' : 'Nenhum dragão ainda';
        const farmB = clZooFarmBonus(s), cb = clZooColBonus(s), cbT = ['c', 'b', 'm'].filter(k => cb[k] > 0.0005).map(k => '+' + (cb[k] * 100).toFixed(1).replace('.', ',') + '% ' + ({ c: 'cristal', b: 'biomassa', m: 'metal' })[k]).join(' · ');
        return '<div class="cl-zoo-p"><div class="cl-fh"><b><i class="ph-bold ph-dragon"></i> Covil dos Dragões</b><span class="cl-fstat">' + stat + '</span></div>'
            + '<button type="button" class="cl-zbig" data-cl="zoo-book"><i class="ph-bold ph-book-open-text"></i><span><b>Abrir o Livro dos Dragões</b><small>' + z.an.length + '/' + lay.slots + ' dragões · coleção ' + Object.keys(z.book).length + '/' + ZSP.length + '</small></span><i class="ph-bold ph-caret-right"></i></button>'
            + (emptyN ? '<button type="button" class="cl-zbig" data-cl="zoo-buy"><i class="ph-bold ph-plus-circle"></i><span><b>Trazer Novo Dragão</b><small>' + emptyN + (emptyN > 1 ? ' vagas livres' : ' vaga livre') + ' no Covil (' + ZBUY + ' biomassa)</small></span><i class="ph-bold ph-caret-right"></i></button>' : '')
            + (z.eggs.some(e => e.el >= e.tot) ? '<button type="button" class="cl-zgo cl-main pulse-glow" data-cl="zoo-hatch" style="margin:4px 0!important"><i class="ph-bold ph-sparkle"></i><span>Ovo Pronto na Árvore: Chocar!</span></button>' : '')
            + '<button type="button" class="cl-zbig cl-zduel-btn" data-cl="zoo-colony-arena"><i class="ph-bold ph-shield-checkered"></i><span><b>Duelos Medievais</b><small>Desafie as 5 Torres Elementais & Conquiste Runas</small></span><i class="ph-bold ph-caret-right"></i></button>'
            + '<button type="button" class="cl-zbig cl-zduel-btn" data-cl="zoo-war-map"><i class="ph-bold ph-map-trifold"></i><span><b>Batalha em Mapa</b><small>Defenda o portão em 25 fases com chefes e ganhe um ovo lendário</small></span><i class="ph-bold ph-caret-right"></i></button>'
            + '<div class="cl-facts cl-zacts"><button type="button" data-cl="zoo-collect"' + (ready ? ' class="cl-main"' : ' disabled') + '><i class="ph-bold ph-basket"></i><span>Coletar' + (ready ? ' (' + ready + ')' : '') + '</span></button></div>'
            + (rows ? '<div class="cl-bmine" style="margin-top:6px">' + rows + '</div>' : '')
            + (z.an.length && ZOO.list.length < z.an.length ? '<div class="cl-zbonus" style="background:rgba(255,160,90,.14);box-shadow:inset 0 0 0 1px rgba(255,160,90,.5)"><i class="ph-bold ph-warning" style="color:#ffb070"></i><span>Só ' + ZOO.list.length + ' de ' + z.an.length + ' dragões estão desenhados. <button type="button" class="cl-mini" data-cl="zoo-reload">Recarregar</button></span></div>' : '')
            + (cbT ? '<div class="cl-zbonus"><i class="ph-bold ph-trend-up"></i><span>Bônus na colônia: <b>' + cbT + '</b></span></div>' : '') + nextNote + '</div>';
    }
    /* ---------- retratos 3D: estúdio com sombra real, ângulo heróico 3/4, recorte automático e contraste ---------- */
    const ZPT = { r: null, sc: null, cam: null, cache: {}, fail: false, n: 0, tmp: null, out: null };
    function zPortInit() {
        if (ZPT.r) return true; if (ZPT.fail) return false; if (IPAD) { ZPT.fail = true; return false; }   /* um segundo WebGL no iPad derruba a colônia; o ícone do bicho continua */ const T = clTh(); if (!T) { ZPT.fail = true; return false; }
        try {
            const cv = document.createElement('canvas'); cv.width = cv.height = 360;
            const r = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, preserveDrawingBuffer: true });
            r.setPixelRatio(1); r.setSize(360, 360, false); r.outputEncoding = T.sRGBEncoding;
            if (T.ACESFilmicToneMapping !== undefined) { r.toneMapping = T.ACESFilmicToneMapping; r.toneMappingExposure = 0.90; }
            r.setClearColor(0x000000, 0);
            const sc = new T.Scene();
            /* Iluminação de estúdio com contraste alto: sombras frias profundas + luz principal lateral-frontal + recorte traseiro */
            sc.add(new T.HemisphereLight(0xf6f0ff, 0x141b2d, 0.42));
            const d1 = new T.DirectionalLight(0xfff4e0, 1.22); d1.position.set(3.2, 4.4, 2.4); sc.add(d1);
            const d2 = new T.DirectionalLight(0x5678b8, 0.34); d2.position.set(-3.4, -0.6, 1.8); sc.add(d2);
            const d3 = new T.DirectionalLight(0xffffff, 0.72); d3.position.set(-2.2, 2.5, -3.6); sc.add(d3);
            ZPT.r = r; ZPT.sc = sc; ZPT.cam = new T.PerspectiveCamera(26, 1, 0.05, 60); return true;
        } catch (e) { ZPT.fail = true; return false; }
    }
    function zTrimPortraitCanvas(src) {
        try {
            const W = src.width, H = src.height;
            if (!ZPT.tmp) { ZPT.tmp = document.createElement('canvas'); ZPT.tmp.width = W; ZPT.tmp.height = H; }
            const tcv = ZPT.tmp, tx = tcv.getContext('2d', { willReadFrequently: true });
            tx.clearRect(0, 0, W, H); tx.drawImage(src, 0, 0);
            const data = tx.getImageData(0, 0, W, H).data;
            let minX = W, minY = H, maxX = -1, maxY = -1;
            for (let y = 0; y < H; y += 2) {
                for (let x = 0; x < W; x += 2) {
                    if (data[(y * W + x) * 4 + 3] > 14) {
                        if (x < minX) minX = x; if (x > maxX) maxX = x;
                        if (y < minY) minY = y; if (y > maxY) maxY = y;
                    }
                }
            }
            if (maxX <= minX || maxY <= minY) return src.toDataURL('image/png');
            const pad = 4, sx = Math.max(0, minX - pad), sy = Math.max(0, minY - pad);
            const sw = Math.min(W - sx, maxX - minX + 1 + pad * 2), sh = Math.min(H - sy, maxY - minY + 1 + pad * 2);
            const OUT = 320;
            if (!ZPT.out) { ZPT.out = document.createElement('canvas'); ZPT.out.width = OUT; ZPT.out.height = OUT; }
            const ocv = ZPT.out, ox = ocv.getContext('2d');
            ox.clearRect(0, 0, OUT, OUT);
            const target = OUT * 0.86, sc = Math.min(target / sw, target / sh);
            const dw = sw * sc, dh = sh * sc, dx = (OUT - dw) * 0.5, dy = (OUT - dh) * 0.5;
            /* Contorno sutil escuro + contraste suave para separar dragões claros (ex: Geada, Esmeralda) do card */
            ox.save();
            ox.filter = 'contrast(1.08) saturate(1.06)';
            ox.shadowColor = 'rgba(4, 3, 10, 0.88)';
            ox.shadowBlur = 7;
            ox.shadowOffsetY = 2;
            ox.drawImage(src, sx, sy, sw, sh, dx, dy, dw, dh);
            ox.restore();
            return ocv.toDataURL('image/png');
        } catch (e) { return src.toDataURL('image/png'); }
    }
    const ZPT_STATIC = new Set(['ambar','arquimago_astral','aurora','brisa','bronze','cascalho','chamas','cinza','colosso_obsidiana','crono_engenheiro','demonio_cinzas','eclipse','esmeralda','floresta','guardiao_botanico','hamster','mare','morcego','morcego_noturno','musgo','nimbo','sabio','sereia_glacial','tempestade','vigia','vulcao']);
    function zPortrait(id) {
        if (ZPT.cache[id] !== undefined) return ZPT.cache[id];
        if (ZPT_STATIC.has(id)) { ZPT.cache[id] = './assets/colony/portraits/' + id + '.png?v=7'; return ZPT.cache[id]; }
        if (!CL3.sc || !zPortInit()) return '';
        let g = null;
        const rimMap = ZOO.rimU || {}, prevRim = (rimMap[id] && rimMap[id].value !== undefined) ? rimMap[id].value : null;
        const matBak = [];
        try {
            const T = clTh(), sp = zsp(id); if (!sp) { ZPT.cache[id] = ''; return ''; }
            const md = ZMD[sp.id];
            if (md && !zModelOk(md.f)) { try { clModelLoad(md.f); } catch (er) {} return ''; }   /* espera o modelo GLB real desta espécie antes de fotografar */
            const B = zBuild(sp, true); g = B && B.g;
            if (!g || (md && !B.model)) { if (md) { try { clModelLoad(md.f); } catch (er) {} } return ''; }
            for (let i = ZPT.sc.children.length - 1; i >= 0; i--) { const ch = ZPT.sc.children[i]; if (!ch.isLight) ZPT.sc.remove(ch); }
            if (B.plate) B.plate.visible = false; if (B.aura) B.aura.visible = false; if (B.shadow) B.shadow.visible = false; if (B.halo) B.halo.visible = false; if (B.beacon) B.beacon.visible = false;
            if (rimMap[sp.id]) rimMap[sp.id].value = 0.14;
            /* Modera auto-emissão e cores muito estouradas na foto para preservar dobras, escamas e sombras */
            const hsl = {};
            g.traverse(o => {
                if (!o.isMesh || !o.material) return;
                const ms = Array.isArray(o.material) ? o.material : [o.material];
                ms.forEach(mt => {
                    if (!mt) return;
                    const snap = { mt, ei: mt.emissiveIntensity, r: mt.roughness, col: mt.color ? mt.color.clone() : null };
                    matBak.push(snap);
                    if (mt.emissive && mt.emissiveIntensity !== undefined && mt.name !== 'Eyes') {
                        mt.emissiveIntensity = Math.min(mt.emissiveIntensity, 0.05);
                    }
                    if (mt.roughness !== undefined && mt.roughness < 0.42) mt.roughness = 0.48;
                    if (mt.color) {
                        mt.color.getHSL(hsl);
                        if (hsl.l > 0.72) mt.color.multiplyScalar(0.76);
                        else if (hsl.s > 0.82 && hsl.l > 0.44) mt.color.setHSL(hsl.h, Math.min(0.88, hsl.s), hsl.l * 0.84);
                    }
                });
            });
            /* Pose heróica em 3/4 frontal: mostra rosto, peito, chifres e asas abertas sem cortar */
            const portYaw = sp.id === 'nimbo' ? -1.12 : -0.96;
            g.rotation.y = portYaw; g.updateMatrixWorld(true);
            let bb;
            const flyAct = B.act && B.act.fly, flyClip = flyAct && flyAct.getClip && flyAct.getClip();
            if (B.dragon && B.mixer && flyClip && flyClip.duration > 0) {
                const L = flyClip.duration; let best = -1, bt = L * 0.25;
                for (let k = 0; k < 8; k++) {
                    B.mixer.setTime(L * k / 8);
                    const b = zPosedBox(g), q = b.getSize(new T.Vector3());
                    const score = q.y * 1.25 + q.x * 0.65;
                    if (score > best) { best = score; bt = L * k / 8; }
                }
                B.mixer.setTime(bt); g.rotation.y = portYaw; g.updateMatrixWorld(true); bb = zPosedBox(g);
            } else bb = new T.Box3().setFromObject(g);
            const sz = bb.getSize(new T.Vector3()), ct = bb.getCenter(new T.Vector3());
            if (!(sz.x > 0 || sz.y > 0 || sz.z > 0)) return '';
            g.position.sub(ct); ZPT.sc.add(g);
            const m = B.dragon ? Math.max(sz.x * 1.04, sz.y * 1.15, sz.z * 0.96) : Math.max(sz.x * 1.05, sz.y * 1.15, sz.z);
            const d = (m * (B.dragon ? 0.66 : 0.70)) / Math.tan(T.MathUtils.degToRad(13)) + Math.max(sz.x, sz.z) * 0.34;
            const cam = ZPT.cam;
            cam.position.set(d * 0.20, d * 0.26 + sz.y * 0.08, d * 0.94);
            cam.lookAt(0, sz.y * 0.02, 0);
            cam.updateProjectionMatrix();
            ZPT.r.clear();
            ZPT.r.render(ZPT.sc, cam);
            const url = zTrimPortraitCanvas(ZPT.r.domElement);
            ZPT.cache[id] = url; return url;
        } catch (e) { return ''; } finally {
            try {
                if (prevRim !== null && rimMap[id]) rimMap[id].value = prevRim;
                matBak.forEach(s => { if (s.ei !== undefined) s.mt.emissiveIntensity = s.ei; if (s.r !== undefined) s.mt.roughness = s.r; if (s.col && s.mt.color) s.mt.color.copy(s.col); });
                if (g && ZPT.sc) ZPT.sc.remove(g);
            } catch (er) {}
        }
    }
    function zWarm(s) {   /* uma foto por vez, em segundo plano, das espécies que o jogador tem */
        try { const z = clZooS(s), ids = z.an.map(a => a.sp).concat(z.eggs.map(e => e.sp)).filter((v, i, A) => A.indexOf(v) === i); const nx = ids.find(id => ZPT.cache[id] === undefined); if (nx) zPortrait(nx); } catch (e) {}
    }
    const zImg = (id, cls) => { const u = zPortrait(id); return u ? '<img class="cl-zimg ' + (cls || '') + '" src="' + u + '" alt="" draggable="false">' : '<i class="ph-bold ' + (zsp(id) || {}).ic + ' cl-zimg-ic"></i>'; };
    /* ---------- ovos: cada espécie tem o próprio ovo (cor + desenho) ---------- */
    const ZEGG = {
        mist: ['#f3e3b8', '#d9a52a', 'stars'],
        musgo: ['#a6e07a', '#2d7a22', 'scales'], argila: ['#e0a070', '#8a4a22', 'zig'], orvalho: ['#bfe6ff', '#2e8fd8', 'spots'], brisa: ['#eefaff', '#7ec0ff', 'swirl'], cascalho: ['#cbbca6', '#5e564c', 'patch'], cinza: ['#9ea0ae', '#41414e', 'scales'],
        floresta: ['#5fe08a', '#166a34', 'stripes'], ambar: ['#ffd080', '#b85c00', 'spots'], mare: ['#5cb0ff', '#144fb8', 'stripes'], geada: ['#f4fcff', '#62b8ff', 'crystals'], bronze: ['#d8a060', '#7a4a18', 'bands'],
        prisma: ['#7ff6ff', '#e879f9', 'crystals'], esmeralda: ['#4fffa0', '#0a7a46', 'scales'], ametista: ['#c090ff', '#ffffff', 'stars'], solar: ['#ffe070', '#ff8a00', 'stars'], sabio: ['#a7d89c', '#3c6e38', 'swirl'],
        vulcao: ['#ff6229', '#fff07a', 'flames'], tempestade: ['#7b92ff', '#fff690', 'zig'], aurora: ['#ff9ce8', '#68f8ff', 'swirl'], cometa: ['#7a40e8', '#ffd35c', 'stars'], eclipse: ['#2b126e', '#ffd35c', 'stars'],
        morcego: ['#6c2ef5', '#e9d5ff', 'wings'], chamas: ['#ff7a1a', '#2a9ab0', 'flames'], hamster: ['#ffaa50', '#8a3cff', 'patch'], vigia: ['#7ec8ec', '#e86aa8', 'eyes'],
        guardiao_botanico: ['#4ade80', '#fde047', 'scales'], sereia_glacial: ['#0ea5e9', '#e0f2fe', 'crystals'], morcego_noturno: ['#0c2a66', '#7dd3fc', 'wings'],
        crono_engenheiro: ['#b45309', '#c084fc', 'bands'], demonio_cinzas: ['#7f1d1d', '#fb923c', 'flames'], colosso_obsidiana: ['#1e293b', '#fb923c', 'zig'], arquimago_astral: ['#312e81', '#fbbf24', 'stars']
    };
    function zMistPaint(c, w, h) {   /* casca de obsidiana arroxeada com escamas douradas e runas */
        const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#2b1a5c'); g.addColorStop(0.55, '#1a0f3a'); g.addColorStop(1, '#0d0820'); c.fillStyle = g; c.fillRect(0, 0, w, h);
        const rows = 9, cols = 8, sw = w / cols, sh = h / rows; for (let r = 0; r < rows; r++) for (let q = -1; q < cols + 1; q++) { const x = q * sw + (r % 2 ? sw / 2 : 0), y = r * sh + sh * 0.75, hue = 38 + ((r * 7 + q * 3) % 5) * 4; c.beginPath(); c.arc(x, y, sw * 0.52, Math.PI, 0); c.lineWidth = 2.2; c.strokeStyle = 'hsla(' + hue + ',90%,' + (52 + (r % 3) * 6) + '%,.95)'; c.stroke(); c.fillStyle = 'hsla(' + (hue + 200) + ',60%,22%,.55)'; c.fill(); }
        c.fillStyle = 'rgba(255,214,120,.9)'; for (let i = 0; i < 26; i++) { const x = (i * 97 % w), y = (i * 53 + i * i * 7) % h; c.fillRect(x, y, 3, 3); }
        const v = c.createLinearGradient(0, 0, w, 0); v.addColorStop(0, 'rgba(0,0,0,.0)'); v.addColorStop(0.5, 'rgba(255,160,60,.18)'); v.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = v; c.fillRect(0, 0, w, h);
    }
    function zEggPaint(c, w, h, id) {
        if (id === 'mist') { zMistPaint(c, w, h); return; }
        const sp = ZEGG[id] || ['#f1e7d4', '#c9b27a', 'spots'], B = sp[0], Pc = sp[1], ty = sp[2]; let sd = 7; for (let i = 0; i < id.length; i++) sd = (sd * 31 + id.charCodeAt(i)) % 2147483647; const r = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
        c.fillStyle = B; c.fillRect(0, 0, w, h); const lg = c.createLinearGradient(0, 0, 0, h); lg.addColorStop(0, 'rgba(255,255,255,.28)'); lg.addColorStop(0.5, 'rgba(255,255,255,0)'); lg.addColorStop(1, 'rgba(0,0,0,.18)'); c.fillStyle = lg; c.fillRect(0, 0, w, h);
        c.fillStyle = Pc; c.strokeStyle = Pc; c.lineJoin = 'round'; c.lineCap = 'round';
        if (ty === 'spots') { for (let i = 0; i < 22; i++) { c.globalAlpha = 0.75; c.beginPath(); c.arc(r() * w, h * (0.12 + r() * 0.8), h * (0.025 + r() * 0.045), 0, 6.283); c.fill(); } }
        else if (ty === 'stripes') { c.lineWidth = h * 0.07; for (let k = 0; k < 6; k++) { c.beginPath(); for (let x = 0; x <= w; x += 6) { const y = h * (0.12 + k * 0.16) + Math.sin(x / w * 12.566 + k) * h * 0.035; x ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); } }
        else if (ty === 'patch') { for (let i = 0; i < 7; i++) { c.beginPath(); c.ellipse(r() * w, h * (0.15 + r() * 0.7), w * (0.06 + r() * 0.07), h * (0.07 + r() * 0.08), r() * 3, 0, 6.283); c.fill(); } }
        else if (ty === 'bands') { c.fillRect(0, h * 0.3, w, h * 0.09); c.fillRect(0, h * 0.52, w, h * 0.16); c.fillRect(0, h * 0.78, w, h * 0.05); }
        else if (ty === 'zig') { c.lineWidth = h * 0.05; for (let k = 0; k < 5; k++) { c.beginPath(); for (let x = 0; x <= w; x += w / 16) { const y = h * (0.15 + k * 0.17) + ((x / (w / 16)) % 2 ? h * 0.045 : -h * 0.045); x ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); } }
        else if (ty === 'eyes') { for (let i = 0; i < 9; i++) { const x = (i % 3 + 0.5 + (i > 2 ? 0.3 : 0)) / 3 * w, y = h * (0.2 + Math.floor(i / 3) * 0.28), rr = h * 0.075; c.fillStyle = '#12e0a8'; c.beginPath(); c.ellipse(x, y, rr * 1.2, rr * 1.6, 0, 0, 6.283); c.fill(); c.fillStyle = Pc; c.beginPath(); c.ellipse(x, y, rr * 0.75, rr, 0, 0, 6.283); c.fill(); c.fillStyle = '#06103a'; c.beginPath(); c.arc(x, y, rr * 0.35, 0, 6.283); c.fill(); } }
        else if (ty === 'stars') { for (let i = 0; i < 14; i++) { const x = r() * w, y = h * (0.1 + r() * 0.8), R = h * (0.03 + r() * 0.04); c.globalAlpha = 0.9; c.beginPath(); for (let k = 0; k < 10; k++) { const a = k * 0.6283 - 1.5708, rr = k % 2 ? R * 0.45 : R; k ? c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : c.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.closePath(); c.fill(); } }
        else if (ty === 'flames') { for (let i = 0; i < 12; i++) { const x = (i + 0.5) / 12 * w, hh = h * (0.28 + r() * 0.3); c.fillStyle = Pc; c.beginPath(); c.moveTo(x - w / 26, h); c.quadraticCurveTo(x - w / 40, h - hh * 0.5, x + (r() - 0.5) * 8, h - hh); c.quadraticCurveTo(x + w / 40, h - hh * 0.5, x + w / 26, h); c.fill(); c.fillStyle = '#ff4a10'; c.beginPath(); c.moveTo(x - w / 50, h); c.lineTo(x, h - hh * 0.45); c.lineTo(x + w / 50, h); c.fill(); } }
        else if (ty === 'scales') { c.lineWidth = h * 0.02; c.globalAlpha = 0.85; for (let row = 0; row < 9; row++) for (let col = 0; col < 12; col++) { const x = (col + (row % 2 ? 0.5 : 0)) * w / 11, y = h * (0.06 + row * 0.11); c.beginPath(); c.arc(x, y, h * 0.06, 0, Math.PI); c.stroke(); } }
        else if (ty === 'crystals') { for (let i = 0; i < 12; i++) { const x = r() * w, y = h * (0.14 + r() * 0.72), sz = h * (0.055 + r() * 0.05); c.globalAlpha = 0.82; c.beginPath(); c.moveTo(x, y - sz); c.lineTo(x + sz * 0.65, y); c.lineTo(x, y + sz); c.lineTo(x - sz * 0.65, y); c.closePath(); c.fill(); c.globalAlpha = 0.45; c.fillStyle = '#fff'; c.beginPath(); c.moveTo(x, y - sz); c.lineTo(x + sz * 0.65, y); c.lineTo(x, y); c.closePath(); c.fill(); c.fillStyle = Pc; } }
        else if (ty === 'swirl') { c.lineWidth = h * 0.045; c.globalAlpha = 0.78; for (let k = 0; k < 4; k++) { c.beginPath(); for (let x = 0; x <= w; x += 5) { const y = h * (0.2 + k * 0.19) + Math.sin(x / w * 6.283 + k * 1.4) * h * 0.085; x ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); } }
        else if (ty === 'wings') { c.globalAlpha = 0.88; for (let i = 0; i < 6; i++) { const cx = w * (0.22 + (i % 2) * 0.56), cy = h * (0.24 + Math.floor(i / 2) * 0.27), s = h * 0.12; c.beginPath(); c.moveTo(cx, cy + s * 0.4); c.quadraticCurveTo(cx - s * 1.1, cy - s * 0.7, cx - s * 1.4, cy + s * 0.25); c.quadraticCurveTo(cx - s * 0.5, cy + s * 0.1, cx, cy + s * 0.4); c.quadraticCurveTo(cx + s * 1.1, cy - s * 0.7, cx + s * 1.4, cy + s * 0.25); c.quadraticCurveTo(cx + s * 0.5, cy + s * 0.1, cx, cy + s * 0.4); c.fill(); } }
        c.globalAlpha = 1;
    }
    const ZEGGC = {};
    function zEggImg(id) {
        if (ZEGGC[id]) return ZEGGC[id]; try {
            const cv = document.createElement('canvas'); cv.width = 128; cv.height = 160; const c = cv.getContext('2d'), k = 2; c.save(); c.scale(k, k); const pa = new Path2D('M32 4C18 4 8 28 8 46c0 16 10 30 24 30s24-14 24-30C56 28 46 4 32 4z'); c.clip(pa); c.scale(1 / k, 1 / k); zEggPaint(c, 128, 160, id); c.restore();
            c.save(); c.scale(k, k); const g = c.createRadialGradient(24, 26, 2, 34, 44, 40); g.addColorStop(0, 'rgba(255,255,255,.42)'); g.addColorStop(0.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,.28)'); c.fillStyle = g; c.fill(pa); c.lineWidth = 2; c.strokeStyle = 'rgba(255,255,255,.75)'; c.stroke(pa); c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.ellipse(23, 26, 4.5, 9, -0.31, 0, 6.283); c.fill(); c.restore();
            return (ZEGGC[id] = cv.toDataURL('image/png'));
        } catch (e) { return ''; }
    }
    function zEggTex(id) {
        const T = clTh(); ZOO.etex = ZOO.etex || {}; if (ZOO.etex[id]) return ZOO.etex[id]; const cv = document.createElement('canvas'); cv.width = 256; cv.height = 256; zEggPaint(cv.getContext('2d'), 256, 256, id); const t = new T.CanvasTexture(cv); if (T.sRGBEncoding) t.encoding = T.sRGBEncoding; t.anisotropy = 4; return (ZOO.etex[id] = t);
    }
    function zCrackTex(lv) {
        const T = clTh(); ZOO.ctx = ZOO.ctx || {}; lv = lv || 3; if (ZOO.ctx[lv]) return ZOO.ctx[lv]; const cv = document.createElement('canvas'); cv.width = 256; cv.height = 256; const c = cv.getContext('2d'); c.strokeStyle = '#ffd24a'; c.shadowColor = '#ff9a1a'; c.shadowBlur = 8; c.lineWidth = 3 + lv; c.lineJoin = 'round'; c.lineCap = 'round';
        const lines = lv === 1 ? [0] : lv === 2 ? [0, 128] : [0, 64, 128, 192];
        lines.forEach((x0, k) => { c.beginPath(); let x = x0 + 32, y = 60 + k * 18; c.moveTo(x, y); for (let i = 0; i < 4 + lv * 2; i++) { x += (i % 2 ? 1 : -1) * (6 + (k * 7 + i * 5) % 12); y += 14 + (i * 3 + k) % 8; c.lineTo(x, y); if (lv >= 2 && i % 3 === 1) { c.moveTo(x, y); c.lineTo(x + 12 + k * 3, y + 10); c.moveTo(x, y); } } c.stroke(); });
        return (ZOO.ctx[lv] = new T.CanvasTexture(cv));
    }
    let ZSVGN = 0;
    function zEggSVG(c1, c2, spark, spid) {
        if (spid && ZEGG[spid]) { const u = zEggImg(spid); if (u) return '<img class="cl-zeggsvg' + (spark ? ' spark' : '') + '" src="' + u + '" alt="" draggable="false">'; }
        const id = 'zg' + (++ZSVGN), dots = [[22, 44, 3], [38, 36, 2.4], [30, 58, 3.2], [42, 52, 2], [24, 30, 2]].map(d => '<circle cx="' + d[0] + '" cy="' + d[1] + '" r="' + d[2] + '" fill="' + c2 + '" opacity=".7"/>').join('');
        return '<svg viewBox="0 0 64 80" class="cl-zeggsvg' + (spark ? ' spark' : '') + '"><defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + c1 + '"/><stop offset="1" stop-color="' + c2 + '"/></linearGradient></defs><path d="M32 4C18 4 8 28 8 46c0 16 10 30 24 30s24-14 24-30C56 28 46 4 32 4z" fill="url(#' + id + ')" stroke="rgba(255,255,255,.6)" stroke-width="2"/>' + dots + '<ellipse cx="23" cy="26" rx="5.5" ry="10" fill="rgba(255,255,255,.4)" transform="rotate(-18 23 26)"/></svg>';
    }
    const zEggCols = by => { const a = ZEL[(zsp(by && by[0]) || {}).el] || ZEL.terra, b = ZEL[(zsp(by && by[1]) || {}).el] || a; return [a.col, b.col]; };
    function zRing(p, col, inner, cls) {   /* anel de progresso em SVG */
        const R = 44, C = 2 * Math.PI * R; return '<span class="cl-zring ' + (cls || '') + '"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="' + R + '" fill="none" stroke="rgba(255,255,255,.14)" stroke-width="8"/><circle cx="50" cy="50" r="' + R + '" fill="none" stroke="' + col + '" stroke-width="8" stroke-linecap="round" stroke-dasharray="' + (C * Math.max(0, Math.min(1, p))).toFixed(1) + ' ' + C.toFixed(1) + '" transform="rotate(-90 50 50)"/></svg><span class="in">' + inner + '</span></span>';
    }
    const zClock = m => { const sec = Math.max(0, Math.round(m * 60)), h = Math.floor(sec / 3600), mi = Math.floor(sec % 3600 / 60), ss = sec % 60; return (h ? h + ':' + String(mi).padStart(2, '0') : mi) + ':' + String(ss).padStart(2, '0'); };

    /* ---------- janelas ---------- */
    function zClose() {
        const wasRit = ZOO.modal === 'hatch-ritual';
        const e = CL.root && CL.root.querySelector('.cl-zmod');
        const ea = CL.root && CL.root.querySelector('.cl-colony-arena');
        if (ea) ea.remove();
        try { if (typeof BKS_CACHE !== 'undefined') { BKS_CACHE.forEach(x => { Object.keys(x.tex).forEach(k => x.tex[k].dispose()); }); BKS_CACHE.clear(); } } catch (er) {}
        try { if (ZBS.run) zbsStop(); } catch (er) {}
        try { if (B3.on) zB3Close(); } catch (er) {}
        try { if (ZOO.bk3d) { cancelAnimationFrame(ZOO.bk3d.id); try { ZOO.bk3d.r.dispose(); ZOO.bk3d.r.forceContextLoss && ZOO.bk3d.r.forceContextLoss(); } catch (e0) {} try { ZOO.bk3d.cv.remove(); } catch (e0) {} ZOO.bk3d = null; } } catch (er) {}
        try { if (ZOO.hatch3d) { cancelAnimationFrame(ZOO.hatch3d.id); try { if (ZOO.hatch3d.cleanup && !ZOO.hatch3d.cleaned) { ZOO.hatch3d.cleaned = true; ZOO.hatch3d.cleanup(); } } catch (e0) {} try { ZOO.hatch3d.r.dispose(); ZOO.hatch3d.r.forceContextLoss && ZOO.hatch3d.r.forceContextLoss(); } catch (e0) {} try { ZOO.hatch3d.cv.remove(); } catch (e0) {} ZOO.hatch3d = null; } } catch (er) {}
        try { if (e && e.classList.contains('book') && screen.orientation && screen.orientation.unlock) screen.orientation.unlock(); } catch (er) {}
        if (e) e.remove();
        ZOO.modal = null;
        if (wasRit && ZOO.arHatchBack) { const hb = ZOO.arHatchBack; ZOO.arHatchBack = null; try { hb(); } catch (er) {} }   /* quem abriu a animação (Incubadora da Arena) volta já, sem mostrar a colônia entre uma tela e outra */
    }
    function zModal(html, cls) {
        if (!CL.root) return null; zClose(); const m = document.createElement('div'); const extra = cls === 'breed' ? ' hb-mod' : ''; m.className = 'cl-zmod ' + (cls || '') + extra; m.innerHTML = '<div class="cl-zback" data-cl="zoo-close"></div><div class="cl-zcard">' + html + '</div>'; CL.root.appendChild(m); return m;
    }
    const zHead = (ic, t, sub) => '<header><b><i class="ph-bold ' + ic + '"></i> ' + t + '</b>' + (sub ? '<span class="cl-fbio">' + sub + '</span>' : '') + '<button type="button" class="cl-x" data-cl="zoo-close" aria-label="Fechar"><i class="ph-bold ph-x"></i></button></header>';
    const zLvChip = a => '<em class="cl-zlv">Nv ' + zAL(a) + '</em>';
    function zCard(sp, extra) { const R = ZR[sp.rk], E = ZEL[sp.el]; return '<span class="cl-zpic" style="--c:' + R.col + '">' + zImg(sp.id) + '</span><span class="cl-znm"><b>' + sp.n + '</b><small><em style="color:' + R.col + '">' + R.n + '</em> · <i class="ph-bold ' + E.ic + '" style="color:' + E.col + '"></i> ' + E.n + (extra ? ' · ' + extra : '') + '</small></span>'; }
    function zBuyHTML() {
        try { if (typeof warCss === 'function') warCss(); } catch (e) {}
        const s = clS(), z = clZooS(s), have = Math.floor(+s.res.b || 0), full = z.an.length >= clZooLayout(s).slots;
        return zHead('ph-plus-circle', 'Trazer um dragão', '<i class="ph-bold ph-leaf"></i> ' + clFmt(have)) + '<p class="cl-fsub">' + (full ? 'O Covil está cheio. Funda ou solte um dragão ou melhore o Covil.' : 'Só os comuns são vendidos. Os raros nascem na Árvore Incubadora.') + '</p>'
            + '<div class="dk-grid-stage"><canvas class="cards-fx-canvas"></canvas><div class="dk-buy-grid">'
            + ZSP.filter(x => x.rk === 0).map(sp => {
                return zTcgCardHTML(sp, {
                    attr: 'data-cl="zoo-buy-do" data-sp="' + sp.id + '"',
                    disabled: have < ZBUY || full,
                    priceBio: ZBUY,
                    showCost: true,
                    showPowerInHead: true,
                    showGlare: true,
                    extraClass: (have < ZBUY || full) ? 'dk-rest' : ''
                });
            }).join('')
            + '</div></div>'
            + '<small class="cl-note">Paga-se sozinho em cerca de 15 horas de trabalho. Novos dragões dão cristal na primeira descoberta.</small>';
    }
    function zBonusText(sp, a) { const w = ZBW[sp.rk] * (1 + 0.12 * (zAL(a) - 1)) * zStarMul(a), m = ZELRES[sp.el] || {}, N = { c: 'cristal', b: 'biomassa', m: 'metal' }; return Object.keys(m).map(k => '+' + (w * m[k] * 100).toFixed(1).replace('.', ',') + '% ' + N[k]).join(' · '); }
    function zPetHTML(id) {
        try { if (typeof warCss === 'function') warCss(); } catch (e) {}
        const s = clS(), z = clZooS(s), a = z.an.find(x => x.id === id); if (!a) return zHead('ph-dragon', 'Dragão') + '<p class="cl-fsub">Não encontrado.</p>';
        const sp = zsp(a.sp), R = ZR[sp.rk], lay = clZooLayout(s), lv = lay.lv || 1, L = zAL(a), star = zStar(a), y = zYield(sp.rk, lv, L, star), net = Math.round(y.b + y.c * ZVC);
        const dup = zDupInfo(z, a), dispName = zDragonLabel(sp, a, z), others = dup.list ? dup.list.filter(x => x.id !== a.id) : [];
        const max = L >= ZMAXLV, need = max ? 0 : zXpNeed(L + 1, sp.rk), xp = Math.floor(a.xp || 0), p = max ? 1 : Math.max(0, Math.min(1, xp / Math.max(1, need))), cost = max ? null : zLvCost(L + 1, sp.rk), xpOk = !max && zAdult(a) && xp >= need, can = xpOk && zLvAfford(cost, sp);
        const fuseTarget = others.length ? others[0] : null;
        return zHead('ph-dragon', esc(dispName) + (star ? ' <span style="color:#ffd35c">' + '★'.repeat(star) + '</span>' : ''), '<b style="color:' + R.col + '">' + R.n + '</b>')
            + '<div class="dk-grid-stage" style="max-width:240px;margin:4px auto 10px;padding:6px"><canvas class="cards-fx-canvas"></canvas>' + zTcgCardHTML(sp, { asDiv: true, inst: a, showCost: true, showPowerInHead: true, showGlare: true }) + '</div>'
            + '<div style="text-align:center;margin-bottom:8px"><button type="button" class="cl-mini" data-cl="zoo-rename" data-id="' + a.id + '"><i class="ph-bold ph-pencil-simple"></i> Renomear</button></div>'
            + '<div class="cl-zlvbox"><div class="cl-zlvh"><span>Nível ' + L + (max ? ' · máximo' : ' → ' + (L + 1)) + '</span><b>' + (max ? '' : xp + ' / ' + need + ' treino') + '</b></div><div class="cl-pbar"><i style="width:' + Math.round(p * 100) + '%"></i></div>'
            + (max ? '' : '<button type="button" class="cl-zgo lvl' + (can ? '' : ' poor') + '" data-cl="zoo-levelup" data-id="' + a.id + '"' + (can ? '' : ' disabled') + '><i class="ph-bold ' + (xpOk ? 'ph-arrow-fat-lines-up' : 'ph-lock-simple') + '"></i><span>' + (!zAdult(a) ? 'Cresça p/ evoluir' : !xpOk ? 'Treino ' + xp + '/' + need + ' XP' : 'Subir para Nv ' + (L + 1)) + '</span><b>' + cost.b + ' <i class="ph-bold ph-leaf"></i> ' + cost.c + ' <i class="ph-bold ph-diamond"></i> ' + zFragTxt(cost, sp) + '</b></button>') + '<small class="cl-note">Cada nível: +18% de produção e bônus maior na colônia. Cada estrela de fusão (★): +8% produção e força. Treinam em batalha e no estudo.</small></div>'
            + '<ul class="cl-zstats"><li><span>Produção por hora</span><b>' + y.b + ' <i class="ph-bold ph-leaf"></i>' + (y.c ? ' + ' + y.c + ' <i class="ph-bold ph-diamond"></i>' : '') + '</b></li><li><span>Lucro por hora</span><b>≈ ' + net + ' <i class="ph-bold ph-leaf"></i></b></li><li><span>Bônus na colônia inteira</span><b style="color:#8af0b0">' + zBonusText(sp, a) + '</b></li></ul>'
            + '<div class="cl-facts">'
            + (fuseTarget ? '<button type="button" class="cl-zseal level can" data-cl="zoo-fuse" data-id="' + a.id + '" data-dst="' + fuseTarget.id + '"><i class="ph-bold ph-sparkle"></i><span>Fundir em ' + esc(zDragonLabel(sp, fuseTarget, z, true)) + ' (+1★)</span></button>' : '')
            + '<button type="button" data-cl="zoo-release" data-id="' + a.id + '" class="cl-zdanger"><i class="ph-bold ph-hand-waving"></i><span>Soltar (+' + ZREL[sp.rk] + ')</span></button></div>';
    }
    /* ---------- palco 3D do cruzamento: os dois dragões escolhidos, de pé um de frente para o outro, e uma animação de cruzar com luz, raios e o ovo nascendo ---------- */
    const ZBS = { r: null, sc: null, cam: null, cv: null, slot: [null, null], run: 0, t: 0, last: 0, anim: null, pts: null, egg: null, glow: null, id: 0 };
    function zbsInit() {
        if (ZBS.r) return true; const T = clTh(); if (!T) return false;
        try {
            const cv = document.createElement('canvas'); cv.className = 'cl-b3dcv'; const r = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true }); r.outputEncoding = T.sRGBEncoding; r.setClearColor(0x000000, 0);
            const sc = new T.Scene(); sc.add(new T.HemisphereLight(0xfff2d8, 0x6a5a78, 1.0)); const d1 = new T.DirectionalLight(0xffffff, 1.3); d1.position.set(2, 4, 4); sc.add(d1); const rim = new T.PointLight(0xffc860, 0.0, 12); rim.position.set(0, 1.2, 1.2); sc.add(rim);
            ZBS.r = r; ZBS.sc = sc; ZBS.cam = new T.PerspectiveCamera(32, 1.6, 0.1, 60); ZBS.cv = cv; ZBS.rim = rim; return true;
        } catch (e) { return false; }
    }
    function zbsSlot(k, a) {   /* coloca (ou tira) o dragão do lado k: 0 esquerda, 1 direita */
        const T = clTh(), cur = ZBS.slot[k], id = a ? a.id : 0; if (cur && cur.aid === id) return; if (cur) { ZBS.sc.remove(cur.g); ZBS.slot[k] = null; }
        if (!a) return; const sp = zsp(a.sp); let B = null; try { B = zBuild(sp, true, zAL(a)); } catch (e) { return; } if (!B || !B.dragon) return;
        const g = B.g; if (B.aura) B.aura.visible = false; if (B.shadow) B.shadow.visible = false; if (B.beacon) B.beacon.visible = false; if (B.plate) B.plate.visible = false; g.rotation.y = k ? Math.PI : 0; g.position.set(0, 0, 0); g.scale.setScalar(1);
        let bb; try { const A = B.act.fly, L = A.getClip().duration; B.mixer.setTime(L * 0.15); bb = zPosedBox(g); } catch (e) { bb = new T.Box3().setFromObject(g); }
        const sz = bb.getSize(new T.Vector3()), sc1 = 3.3 / Math.max(sz.x, sz.z, 0.01), ct = bb.getCenter(new T.Vector3());
        g.scale.setScalar(sc1); g.userData.base = new T.Vector3((k ? 1 : -1) * 1.15 - ct.x * sc1, 1.45 - ct.y * sc1, -ct.z * sc1); g.position.copy(g.userData.base); ZBS.sc.add(g);
        ZBS.slot[k] = { g, B, aid: id, sp, k, born: ZBS.t, sc1 };
    }
    function zbsFrame(now) {
        if (!ZBS.run) return; ZBS.id = requestAnimationFrame(zbsFrame); const dt = Math.min(0.05, (now - (ZBS.last || now)) / 1000); ZBS.last = now; ZBS.t += dt; const T = clTh(), t = ZBS.t, an = ZBS.anim;
        const holder = ZBS.cv && ZBS.cv.parentNode; if (!holder) return; const w = holder.clientWidth, h = holder.clientHeight; if (w > 10 && (ZBS.w !== w || ZBS.h !== h)) { ZBS.w = w; ZBS.h = h; ZBS.r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); ZBS.r.setSize(w, h, false); ZBS.cam.aspect = w / h; ZBS.cam.updateProjectionMatrix(); const dist = Math.max(6.2, 8.0 / Math.max(0.6, w / h) + 0.6); ZBS.cam.position.set(0, 1.9, dist); ZBS.cam.lookAt(0, 1.4, 0); }
        const k = an ? Math.min(1, (t - an.t0) / an.dur) : 0;   /* 0..1 da animação de cruzar */
        ZBS.slot.forEach((s, i) => { if (!s) return; const B = s.B; try { zDragonAct(B, B.act.fly, an ? 1.8 : 0.7); B.mixer.update(dt); } catch (e) {}
            const dir = i ? -1 : 1, bob = Math.sin(t * 1.6 + i * 2) * 0.08; let lunge = 0, shake = 0; if (an) { lunge = (k < 0.45 ? Math.pow(k / 0.45, 2) : k < 0.75 ? 1 : 1 - (k - 0.75) / 0.25) * 1.15; shake = k > 0.45 && k < 0.78 ? Math.sin(t * 60) * 0.03 : 0; }
            { const pop = Math.min(1, (ZBS.t - (s.born || 0)) / 0.5), eo = pop < 1 ? 1 - Math.pow(1 - pop, 3) * (1 + 2.2 * (1 - pop) * Math.sin(pop * 6)) : 1; s.g.scale.setScalar(Math.max(0.01, s.sc1 * eo)); }
            s.g.position.set(s.g.userData.base.x - dir * lunge + shake, s.g.userData.base.y + bob + (an ? Math.sin(Math.min(1, k * 1.2) * Math.PI) * 0.35 : 0), s.g.userData.base.z); });
        const R = ZBS.rim; if (R) { R.intensity = an ? (k > 0.4 && k < 0.85 ? 30 * Math.sin((k - 0.4) / 0.45 * Math.PI) : 0) : 0; }
        if (an) { zbsAnimStep(an, k, dt, t); if (k >= 1) { const cb = an.cb; zbsAnimClear(); try { cb && cb(); } catch (e) {} } }
        ZBS.r.render(ZBS.sc, ZBS.cam);
    }
    function zbsAnimClear() { const T = clTh(); ZBS.anim = null; [ZBS.pts, ZBS.egg, ZBS.glow, ZBS.ring, ZBS.ring2].forEach(o => { if (o) ZBS.sc.remove(o); }); ZBS.pts = ZBS.egg = ZBS.glow = ZBS.ring = ZBS.ring2 = null; }
    function zbsAnimStep(an, k, dt, t) {
        const T = clTh();
        if (!ZBS.pts) {   /* duas espirais elementais + núcleo supernova + dupla onda de choque + semente astral (sem spoiler!) */
            const N = 140, pos = new Float32Array(N * 3), cols = new Float32Array(N * 3), pg = new T.BufferGeometry();
            const ca = new T.Color(an.c1 || '#ffd35c'), cb = new T.Color(an.c2 || '#f472b6');
            for (let i = 0; i < N; i++) { const cc = i % 2 ? cb : ca; cols[i * 3] = cc.r; cols[i * 3 + 1] = cc.g; cols[i * 3 + 2] = cc.b; }
            pg.setAttribute('position', new T.BufferAttribute(pos, 3)); pg.setAttribute('color', new T.BufferAttribute(cols, 3));
            ZBS.pts = new T.Points(pg, new T.PointsMaterial({ map: zFxTex('star_02'), vertexColors: true, size: 0.36, transparent: true, opacity: 0.98, depthWrite: false, blending: T.AdditiveBlending, sizeAttenuation: true })); ZBS.pts.frustumCulled = false; ZBS.sc.add(ZBS.pts);
            ZBS.glow = new T.Sprite(new T.SpriteMaterial({ map: zSoftTex(), color: '#fff2b8', transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending })); ZBS.glow.position.set(0, 1.5, 0.5); ZBS.glow.scale.setScalar(1); ZBS.sc.add(ZBS.glow);
            ZBS.ring = new T.Sprite(new T.SpriteMaterial({ map: zFxTex('circle_05'), color: an.c1, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending })); ZBS.ring.position.set(0, 1.5, 0.6); ZBS.sc.add(ZBS.ring);
            ZBS.ring2 = new T.Sprite(new T.SpriteMaterial({ map: zFxTex('circle_05'), color: an.c2, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending })); ZBS.ring2.position.set(0, 1.5, 0.65); ZBS.sc.add(ZBS.ring2);
            const eg = new T.Sprite(new T.SpriteMaterial({ map: an.orb || zFxTex('star_02'), color: '#ffeaa7', transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending })); eg.position.set(0, 1.4, 0.85); eg.scale.setScalar(0.2); ZBS.egg = eg; ZBS.sc.add(eg);
        }
        const P = ZBS.pts.geometry.attributes.position, N = P.count;
        for (let i = 0; i < N; i++) {
            const side = i % 2 ? 1 : -1, ph = (i / N + t * 0.85) % 1, a = ph * 16 + i;
            const rad = (1 - Math.min(1, k * 1.45)) * 2.5 * (1 - ph * 0.55) + 0.14;
            const cx = side * (2.1 - k * 2.1 * Math.min(1, k * 1.35));
            P.setXYZ(i, cx * (1 - ph * 0.5) + Math.cos(a) * rad * 0.55, 0.35 + ph * 2.6 + Math.sin(a * 1.4) * 0.35, 0.5 + Math.sin(a) * rad * 0.55);
        }
        P.needsUpdate = true; ZBS.pts.material.opacity = k < 0.88 ? 0.98 : Math.max(0, 1 - (k - 0.88) / 0.12);
        const burst = k > 0.45 ? Math.sin(Math.min(1, (k - 0.45) / 0.35) * Math.PI) : 0;
        ZBS.glow.material.opacity = Math.min(1, burst * 1.25); ZBS.glow.scale.setScalar(1.2 + burst * 8.5);
        if (k > 0.48) { const rk = (k - 0.48) / 0.52; ZBS.ring.material.opacity = Math.max(0, 0.95 * (1 - rk)); ZBS.ring.scale.setScalar(1.2 + rk * 11); }
        if (k > 0.58 && ZBS.ring2) { const rk2 = (k - 0.58) / 0.42; ZBS.ring2.material.opacity = Math.max(0, 0.95 * (1 - rk2)); ZBS.ring2.scale.setScalar(1.0 + rk2 * 9.5); }
        if (ZBS.egg) {
            const e = Math.max(0, (k - 0.56) / 0.44);
            ZBS.egg.material.opacity = Math.min(1, Math.sin(Math.min(1, e * 1.1) * Math.PI) * 1.35);
            ZBS.egg.scale.setScalar(0.5 + 2.5 * Math.sin(Math.min(1, e) * Math.PI * 0.5));
            ZBS.egg.position.y = 1.35 + e * 2.2;
            ZBS.egg.material.rotation = t * 2.4;
        }
    }
    function zbsStart() { if (!zbsInit()) return false; if (ZBS.run) return true; ZBS.run = 1; ZBS.last = 0; ZBS.id = requestAnimationFrame(zbsFrame); return true; }
    function zbsStop() { ZBS.run = 0; try { cancelAnimationFrame(ZBS.id); } catch (e) {} zbsAnimClear(); [0, 1].forEach(k => { if (ZBS.slot[k]) { ZBS.sc.remove(ZBS.slot[k].g); ZBS.slot[k] = null; } }); if (ZBS.cv && ZBS.cv.parentNode) ZBS.cv.parentNode.removeChild(ZBS.cv); }
    function zbsAttach(A, B) {   /* chamado depois que a janela de cruzar foi (re)escrita: põe o palco no lugar e confere quem está nos dois lados */
        const host = CL.root && CL.root.querySelector('[data-b3d]'); if (!host) return; if (!zbsStart()) return; if (ZBS.cv.parentNode !== host) host.appendChild(ZBS.cv); ZBS.w = 0; zbsSlot(0, A); zbsSlot(1, B);
    }
    function zbsCross(a, b, cb) {   /* animação épica de ~2,5s sem revelar qual dragão nascerá; no fim voa para a Árvore Incubadora */
        if (!ZBS.run || !ZBS.slot[0] || !ZBS.slot[1]) { cb && cb(); return; }
        const ea = ZEL[zsp(a.sp).el], eb = ZEL[zsp(b.sp).el];
        ZBS.anim = { t0: ZBS.t, dur: 2.5, cb, c1: ea ? ea.col : '#ffd35c', c2: eb ? eb.col : '#f472b6', orb: zFxTex('star_02') };
    }
    function zBreedHTML() {
        const s = clS(), z = clZooS(s), lay = clZooLayout(s), lv = lay.lv || 1;
        const ad = (z.an || []).filter(zAdult);
        const sel = (ZOO.sel || []).filter(id => ad.some(a => a.id === id));
        const A = z.an.find(x => x.id === sel[0]) || null, B = z.an.find(x => x.id === sel[1]) || null;
        const haveBio = Math.floor(+s.res.b || 0), flt = ZOO.brFlt || 'rdy';
        const sortedAd = ad.slice().sort((x, y) =>
            (((x.cd || 0) > 0 ? 1 : 0) - ((y.cd || 0) > 0 ? 1 : 0))
            || (zDragonPower(zsp(y.sp), y) - zDragonPower(zsp(x.sp), x))
            || (zAL(y) - zAL(x))
            || (zStar(y) - zStar(x))
        );

        const chipHTML = (a, k) => {
            if (!a) return '<span class="hb-chip empty"><i class="ph-bold ph-hand-tap"></i> <b>Escolha o ' + (k ? '2º' : '1º') + ' dragão ao lado</b></span>';
            const sp = zsp(a.sp), R = ZR[sp.rk], L = zAL(a), st = zStar(a);
            return '<button type="button" class="hb-chip" data-cl="zoo-slot" data-k="' + k + '" style="--c:' + R.col + '">'
                + '<span class="hb-ch-lv">Nv ' + L + (st ? ' ★' + st : '') + '</span>'
                + '<b>' + esc(zShortName(sp)) + '</b>'
                + '<i class="ph-bold ph-x hb-ch-x"></i></button>';
        };

        let metaHTML = '', goHTML = '';
        if (A && B) {
            const info = clZooBreedInfo(A, B, lv), full = z.eggs.length >= lay.eggs;
            const upPct = (info.up || 0) >= 0.1 ? Math.round(info.up * 100) : ((info.up || 0) * 100).toFixed(1).replace('.0', '');
            const avgTxt = (info.avgLv % 1 === 0 ? info.avgLv : info.avgLv.toFixed(1).replace('.', ','));
            metaHTML = '<div class="hb-meta">'
                + '<div class="hb-stat" style="--sc:#fbbf24"><span>Nível Médio</span><b><i class="ph-bold ph-crown"></i> Nv ' + avgTxt + (info.stars ? ' · ' + info.stars + '★' : '') + '</b></div>'
                + '<div class="hb-stat" style="--sc:' + info.syn.col + '"><span>Sinergia Elemental</span><b><i class="ph-bold ph-sparkle"></i> ' + info.syn.label + '</b></div>'
                + '<div class="hb-stat" style="--sc:#4ade80"><span>' + (info.M >= 4 ? 'Chance de Lendário' : 'Chance de subir de raridade') + '</span><b><i class="ph-bold ph-trend-up"></i> ' + (info.M >= 4 ? (info.legKeep * 100).toFixed(1).replace('.0', '') + '% (senão Épico)' : upPct + '%' + (info.need ? ' · garantia em ' + Math.max(1, info.need - info.pity) + ' ovos' : '')) + '</b></div>'
                + '</div>';
            goHTML = '<button type="button" class="hb-cross-btn' + (haveBio < info.cost || full ? ' poor' : '') + '" data-cl="zoo-breed-go"' + (haveBio < info.cost || full ? ' disabled' : '') + '>'
                + '<i class="ph-fill ph-heart"></i><span>' + (full ? (lay.eggs ? 'Árvore Incubadora ocupada' : 'Construa a Árvore Incubadora') : 'Cruzar Dragões') + '</span>'
                + '<span class="hb-cost">' + clFmt(info.cost) + ' <i class="ph-bold ph-leaf"></i></span></button>';
        } else {
            metaHTML = '<div class="hb-meta">'
                + '<div class="hb-stat" style="--sc:#fbbf24"><span>Influência de Nível</span><b>+Chance Rara</b></div>'
                + '<div class="hb-stat" style="--sc:#c084fc"><span>Estrelas (★)</span><b>Fusão Ajuda!</b></div>'
                + '<div class="hb-stat" style="--sc:#f472b6"><span>Ovo Misterioso</span><b>Surpresa Total</b></div>'
                + '</div>';
            goHTML = '<div class="hb-hint-pick"><i class="ph-bold ph-hand-pointing"></i><span>Toque em dois dragões nas cartas ao lado para enviá-los diretamente ao Altar 3D.</span></div>';
        }

        let nestBar = '';
        if (!lay.eggs) {
            nestBar = '<div class="hb-nest-bar"><span><i class="ph-bold ph-tree"></i> <b>Sem Árvore Incubadora</b></span><small>Construa para chocar ovos</small></div>';
        } else if (z.eggs.length) {
            const eg = z.eggs[0], ok = eg.el >= eg.tot;
            nestBar = '<div class="hb-nest-bar' + (ok ? ' ok' : '') + '"' + (ok && z.an.length < lay.slots ? ' data-cl="zoo-hatch"' : '') + '>'
                + '<span><i class="ph-bold ph-egg"></i> <b>' + (ok ? '✨ Ovo pronto na Árvore!' : '🥚 Árvore com ovo em incubação') + '</b></span>'
                + '<small>' + (ok ? (z.an.length >= lay.slots ? 'Covil cheio' : 'Toque para chocar!') : 'Acompanhe na Árvore') + '</small></div>';
        } else {
            nestBar = '<div class="hb-nest-bar"><span><i class="ph-bold ph-tree"></i> <b>Árvore Incubadora Livre</b></span><small>Pronta para receber o ovo</small></div>';
        }

        const fltDefs = [
            ['rdy', 'Prontos (' + sortedAd.filter(a => !((a.cd || 0) > 0)).length + ')', '#4ade80', 'ph-heart'],
            ['all', 'Todos (' + sortedAd.length + ')', '#fbbf24', 'ph-cards'],
            ['terra', 'Terra', ZEL.terra.col, ZEL.terra.ic],
            ['agua', 'Água', ZEL.agua.col, ZEL.agua.ic],
            ['cristal', 'Cristal', ZEL.cristal.col, ZEL.cristal.ic],
            ['estelar', 'Estelar', ZEL.estelar.col, ZEL.estelar.ic]
        ];
        const filtered = sortedAd.filter(a => {
            if (flt === 'rdy') return !((a.cd || 0) > 0);
            if (ZEL[flt]) return zsp(a.sp).el === flt;
            return true;
        });

        const breedCard = a => {
            const sp = zsp(a.sp);
            const si = sel.indexOf(a.id), rest = (a.cd || 0) > 0;
            return zTcgCardHTML(sp, {
                inst: a,
                attr: 'data-cl="zoo-pick" data-id="' + a.id + '"',
                selected: si >= 0,
                pickTag: si >= 0 ? ('Pai ' + (si + 1)) : '',
                extraClass: (si >= 0 ? ('hb-s' + si) : '') + (rest ? ' rest dk-rest' : ''),
                restCd: rest ? a.cd : 0,
                disabled: rest,
                showCost: true,
                showPowerInHead: true,
                showGlare: true
            });
        };

        return '<header class="hb-hd"><div class="hb-title"><span class="hb-crest"><i class="ph-fill ph-heart"></i></span><div><h3>Altar de Cruzamento</h3><small>Dragões fortes e com estrelas (★) aumentam a chance de ovos mais raros · Resultado 100% surpresa!</small></div></div>'
            + '<div class="hb-hd-r">'
            + '<span class="hs-res-chip" style="--rc:#4ade80"><i class="ph-bold ph-leaf"></i> <b>' + clFmt(haveBio) + '</b></span>'
            + '<span class="hs-res-chip" style="--rc:#c084fc"><i class="ph-bold ph-egg"></i> <b>' + z.eggs.length + '/' + lay.eggs + '</b></span>'
            + '<button type="button" class="hs-close" data-cl="zoo-close" aria-label="Fechar"><i class="ph-bold ph-x"></i></button>'
            + '</div></header>'
            + '<div class="hb-body"><div class="hb-split">'
            + '<div class="hb-altar">'
            + '<div class="hb-stage-wrap"><div class="cl-b3d" data-b3d><small class="cl-b3dh">' + (A || B ? '' : 'Toque em 2 cartas ao lado para invocá-los') + '</small></div>'
            + '<div class="hb-stage-chips">' + chipHTML(A, 0) + chipHTML(B, 1) + '</div></div>'
            + metaHTML + goHTML + nestBar
            + '</div>'
            + '<div class="hb-deck">'
            + '<div class="hs-filters">' + fltDefs.map(f => '<button type="button" class="hs-flt' + (flt === f[0] ? ' on' : '') + '" data-cl="zoo-bflt-br" data-f="' + f[0] + '" style="--fc:' + f[2] + '"><i class="ph-fill ' + f[3] + '"></i> ' + f[1] + '</button>').join('') + '</div>'
            + '<div class="hs-scroll" data-hb-scroll="breed"><div class="dk-grid-stage"><canvas class="cards-fx-canvas"></canvas><div class="hs-card-grid">'
            + (filtered.length ? filtered.map(breedCard).join('') : '<div style="grid-column:1/-1;padding:28px;text-align:center;color:#cbbba0">Nenhum dragão adulto disponível neste filtro.</div>')
            + '</div></div></div></div>'
            + '</div></div>';
    }
    /* conquistas dos dragões: metas pequenas com prêmio único em cristais (valores baixos: não mexem na economia) */
    const ZACH = [
        { id: 'd3', n: 'Descubra 3 espécies', t: 3, r: 10, f: z => Object.keys(z.book).length }, { id: 'd8', n: 'Descubra 8 espécies', t: 8, r: 40, f: z => Object.keys(z.book).length }, { id: 'd14', n: 'Descubra 14 espécies', t: 14, r: 120, f: z => Object.keys(z.book).length }, { id: 'd20', n: 'Livro completo: 20 espécies', t: 20, r: 400, f: z => Object.keys(z.book).length },
        { id: 'e3', n: 'Ponha 3 ovos', t: 3, r: 10, f: z => z.stat.eggs | 0 }, { id: 'e10', n: 'Ponha 10 ovos', t: 10, r: 35, f: z => z.stat.eggs | 0 }, { id: 'e30', n: 'Ponha 30 ovos', t: 30, r: 100, f: z => z.stat.eggs | 0 },
        { id: 'r2', n: 'Tenha um dragão Raro', t: 1, r: 30, f: z => z.an.some(a => zsp(a.sp).rk >= 2) ? 1 : 0 }, { id: 'r3', n: 'Tenha um dragão Épico', t: 1, r: 90, f: z => z.an.some(a => zsp(a.sp).rk >= 3) ? 1 : 0 }, { id: 'r4', n: 'Tenha um dragão Lendário', t: 1, r: 250, f: z => z.an.some(a => zsp(a.sp).rk >= 4) ? 1 : 0 },
        { id: 'l5', n: 'Um dragão no nível 5', t: 5, r: 40, f: z => z.an.reduce((m, a) => Math.max(m, zAL(a)), 0) }, { id: 'l10', n: 'Um dragão no nível 10', t: 10, r: 150, f: z => z.an.reduce((m, a) => Math.max(m, zAL(a)), 0) },
        { id: 'c25', n: 'Colete 25 vezes', t: 25, r: 20, f: z => z.stat.coll | 0 }, { id: 'c100', n: 'Colete 100 vezes', t: 100, r: 60, f: z => z.stat.coll | 0 }, { id: 'u3', n: 'Suba de grau 3 vezes', t: 3, r: 40, f: z => z.stat.ups | 0 }
    ];
    function zAchHTML(z) {
        z.ach = z.ach || {}; let h = '<h5 class="cl-zh5">Conquistas <small>prêmio único em cristais</small></h5><div class="cl-zach">';
        ZACH.forEach(a => { const cur = Math.min(a.t, a.f(z)), done = !!z.ach[a.id], can = !done && cur >= a.t; h += '<div class="cl-zac' + (done ? ' done' : '') + (can ? ' can' : '') + '"><span class="tx"><b>' + a.n + '</b><span class="bar"><i style="width:' + Math.round(100 * cur / a.t) + '%"></i></span><small>' + cur + ' / ' + a.t + '</small></span>' + (done ? '<em class="ok"><i class="ph-fill ph-check-circle"></i></em>' : '<button type="button" class="cl-zacb" data-cl="zoo-ach" data-id="' + a.id + '"' + (can ? '' : ' disabled') + '>+' + a.r + ' <i class="ph-bold ph-diamond"></i></button>') + '</div>'; });
        return h + '</div>';
    }
    function clZooAch(id) {
        const s = clS(), z = clZooS(s); z.ach = z.ach || {}; const a = ZACH.find(x => x.id === id); if (!a || z.ach[id] || CL.visit) return { ok: false }; if (a.f(z) < a.t) return { ok: false }; z.ach[id] = 1; clFarmPay(s, 0, a.r); CL.ver++; clSave(true); return { ok: true, r: a.r, n: a.n };
    }
    function zCrownSVG(lv, locked) {
        const L = Math.max(1, Math.min(10, lv || 1));
        const t = locked ? 1 : (L >= 9 ? 5 : L >= 7 ? 4 : L >= 5 ? 3 : L >= 3 ? 2 : 1);
        let shape = '';
        if (t === 1) {
            shape = '<path d="M10 15L14 7L22 11L30 7L34 15Z" fill="#94a3b8" stroke="#475569" stroke-width="1.2"/><circle cx="22" cy="6.5" r="1.8" fill="#cbd5e1"/>';
        } else if (t === 2) {
            shape = '<path d="M8 15L11 5L17.5 10.5L22 3.5L26.5 10.5L33 5L36 15Z" fill="#e2e8f0" stroke="#64748b" stroke-width="1.2"/><circle cx="22" cy="3.5" r="2" fill="#60a5fa"/><circle cx="11" cy="5" r="1.4" fill="#93c5fd"/><circle cx="33" cy="5" r="1.4" fill="#93c5fd"/>';
        } else if (t === 3) {
            shape = '<path d="M7 15L9 5.5L15.5 10L18.5 3.5L22 8.5L25.5 3.5L28.5 10L35 5.5L37 15Z" fill="#fbbf24" stroke="#92400e" stroke-width="1.2"/><circle cx="22" cy="11" r="2.1" fill="#ef4444"/><circle cx="14" cy="12" r="1.5" fill="#10b981"/><circle cx="30" cy="12" r="1.5" fill="#10b981"/>';
        } else if (t === 4) {
            shape = '<path d="M5 14L3 6L12 10L16 3L22 7.5L28 3L32 10L41 6L39 14Z" fill="#c084fc" stroke="#f5d0fe" stroke-width="1.2"/><path d="M17 14L22 2L27 14Z" fill="#fde047" opacity=".88"/><circle cx="22" cy="10.5" r="2.2" fill="#e879f9"/>';
        } else {
            shape = '<path d="M12 4L14 1M32 4L30 1M22 1L22 3.5" stroke="#fde047" stroke-width="1.5" stroke-linecap="round"/><path d="M4 14L2 5L11 9.5L15.5 2.5L22 7L28.5 2.5L33 9.5L42 5L40 14Z" fill="#fbbf24" stroke="#fff3c4" stroke-width="1.3"/><path d="M15 14L22 2L29 14Z" fill="#f43f5e" stroke="#fde047" stroke-width="1"/><circle cx="22" cy="9.5" r="2.4" fill="#fff"/>';
        }
        return '<span class="hc-crown t' + t + '"' + (locked ? ' style="opacity:.45"' : '') + '><svg viewBox="0 0 44 17" aria-hidden="true">' + shape + '</svg><span>' + (locked ? 'Nv ?' : 'Nv ' + L) + '</span></span>';
    }
    function zHsSpotlightHTML(s, z, lay, spId) {
        const sp = zsp(spId) || ZSP[0], lv = lay.lv || 1, R = ZR[sp.rk], E = ZEL[sp.el];
        const got = !!z.book[sp.id];
        const copies = (z.an || []).filter(a => a.sp === sp.id).sort((x, y) => (zDragonPower(zsp(y.sp), y) - zDragonPower(zsp(x.sp), x)) || (zAL(y) - zAL(x)));
        let selAn = copies.find(a => a.id === ZOO.anId) || copies[0] || null;
        if (selAn && ZOO.anId !== selAn.id) ZOO.anId = selAn.id;

        if (!selAn) {
            const y0 = zYield(sp.rk, lv, 1, 0);
            const hint = sp.rk === 0
                ? 'Disponível na Loja do Covil por <b>' + ZBUY + ' biomassa</b>.'
                : 'Nasce cruzando adultos na <b>Árvore Incubadora</b> (' + (sp.rk === 1 ? 'a partir de comuns' : 'chances maiores com ' + ZR[sp.rk - 1].n.toLowerCase() + 's') + ').';
            const spotCard0 = zTcgCardHTML(sp, { asDiv: true, locked: !got, showCost: true, showPowerInHead: true, showGlare: true });
            return '<div class="hs-spot" style="--c:' + R.col + ';--e:' + E.col + '">'
                + '<div style="width:210px;margin:0 auto 4px">' + spotCard0 + '</div>'
                + '<div class="hs-stat-grid">'
                + '<div class="hs-stat-box" style="--sc:#4ade80"><small>Produção Base (Nv 1)</small><b>+' + y0.b + ' bio/h' + (y0.c ? ' · +' + y0.c + ' cry/h' : '') + '</b><span>Ração: ' + ZFEED[sp.rk] + ' bio/h</span></div>'
                + '<div class="hs-stat-box" style="--sc:#c084fc"><small>Bônus Colônia</small><b>' + (got ? zBonusText(sp, { lv: 1, xp: 0, star: 0 }) : 'Revelado ao descobrir') + '</b><span>1ª vez: +' + ZDISC[sp.rk] + ' 💎</span></div>'
                + '</div>'
                + '<div class="hs-how"><b><i class="ph-bold ph-sparkle"></i> Como obter</b><p>' + hint + '</p>'
                + (sp.rk === 0 ? '<button type="button" class="hs-btn lvl can full" data-cl="zoo-buy"><i class="ph-bold ph-plus-circle"></i><span>Trazer na Loja (' + ZBUY + ' bio)</span></button>' : '')
                + '</div></div>';
        }

        const L = zAL(selAn), star = zStar(selAn), y = zYield(sp.rk, lv, L, star), st = zState(selAn, lv), adult = zAdult(selAn);
        const maxLv = L >= ZMAXLV;
        const need = maxLv ? 0 : zXpNeed(L + 1, sp.rk);
        const xp = Math.floor(selAn.xp || 0), xpPct = maxLv ? 100 : Math.round(100 * Math.max(0, Math.min(1, xp / Math.max(1, need))));
        const cost = maxLv ? null : zLvCost(L + 1, sp.rk);
        const xpReady = !maxLv && adult && xp >= need;
        const canLv = xpReady && zLvAfford(cost, sp);
        const fedH = Math.max(0, selAn.fed || 0), fedPct = Math.min(100, Math.round(100 * fedH / ZFEEDMAX));
        const fedCol = !adult ? '#e879f9' : fedH > 3 ? '#4ade80' : fedH > 0.02 ? '#fb923c' : '#f87171';
        const dispName = zDragonLabel(sp, selAn, z);
        const fuseTarget = copies.find(x => x.id !== selAn.id) || null;
        const fuseArmed = ZOO.fuseArm === selAn.id, relArmed = ZOO.relArm === selAn.id;
        const feedCost = ZFEED[sp.rk] * 8;
        const spotCard = zTcgCardHTML(sp, { asDiv: true, inst: selAn, titleOverride: esc(dispName), showCost: true, showPowerInHead: true, showGlare: true });

        let dupBar = '';
        if (copies.length > 1) {
            dupBar = '<div class="hs-dups"><div class="hs-dups-h"><span><i class="ph-bold ph-copy"></i> Cópias iguais (' + copies.length + ')</span><small>Trocar ou fundir ★</small></div><div class="hs-dup-pills">'
                + copies.map((c, idx) => {
                    const cs = zStar(c);
                    return '<button type="button" class="hs-dup-pill' + (c.id === selAn.id ? ' on' : '') + '" data-cl="zoo-pick-dup" data-sp="' + sp.id + '" data-aid="' + c.id + '">'
                        + '#' + (idx + 1) + ' · Nv ' + zAL(c) + (cs ? ' ★' + cs : '')
                        + (c.nm ? ' (' + esc(c.nm) + ')' : '') + '</button>';
                }).join('')
                + '</div></div>';
        }

        return '<div class="hs-spot" style="--c:' + R.col + ';--e:' + E.col + '">'
            + '<div style="width:210px;margin:0 auto 2px">' + spotCard + '</div>'
            + dupBar
            + '<div class="hs-bars">'
            + (adult ? '' : '<div class="hs-bar-card" style="--lc:#e879f9"><div class="hs-bar-h"><span><i class="ph-bold ph-egg-crack" style="color:#e879f9"></i> Crescimento</span><b>Filhote</b></div><div class="hs-bar-track"><i style="width:' + Math.round(100 * st.p) + '%;--bc:#e879f9"></i></div></div>')
            + '<div class="hs-bar-card" style="--lc:#2dd4bf"><div class="hs-bar-h"><span><i class="ph-bold ph-barbell" style="color:#2dd4bf"></i> Treino XP</span><b>' + (maxLv ? 'Máx' : xp + '/' + need) + '</b></div><div class="hs-bar-track"><i style="width:' + xpPct + '%;--bc:' + (canLv ? '#fde047' : '#2dd4bf') + '"></i></div></div>'
            + '</div>'
            + '<div class="hs-stat-grid">'
            + '<div class="hs-stat-box" style="--sc:#4ade80"><small>Produção / hora</small><b>+' + y.b + ' 🌿' + (y.c ? ' · +' + y.c + ' 💎' : '') + '</b><span>Valor ≈' + Math.round(y.b + y.c * ZVC) + ' por hora</span></div>'
            + '<div class="hs-stat-box" style="--sc:#c084fc"><small>Bônus Colônia</small><b>' + zBonusText(sp, selAn) + '</b><span>' + (star ? 'Estrelas ★' + star + ': +' + (star * 8) + '% força' : '+18% prod. por nível') + '</span></div>'
            + '</div>'
            + '<div class="hs-acts">'
            + (maxLv
                ? '<button type="button" class="hs-btn lvl" disabled><i class="ph-bold ph-crown"></i><span>Nível Máximo</span></button>'
                : '<button type="button" class="hs-btn lvl' + (canLv ? ' can' : '') + '" data-cl="zoo-levelup" data-id="' + selAn.id + '"' + (canLv ? '' : ' disabled') + '><i class="ph-bold ' + (xpReady ? 'ph-arrow-fat-lines-up' : 'ph-lock-simple') + '"></i><span>' + (!adult ? 'Filhote…' : !xpReady ? xp + '/' + need + ' XP' : 'Nv ' + (L + 1) + ' (' + cost.b + '🌿 ' + cost.c + '💎 ' + zFragTxt(cost, sp, 14) + ')') + '</span></button>')
            + (fuseTarget
                ? '<button type="button" class="hs-btn fuse' + (fuseArmed ? ' armed' : '') + '" data-cl="zoo-fuse" data-id="' + selAn.id + '" data-dst="' + fuseTarget.id + '"><i class="ph-bold ph-sparkle"></i><span>' + (fuseArmed ? 'TOQUE NOVAMENTE P/ FUNDIR!' : 'Fundir em ' + esc(zDragonLabel(sp, fuseTarget, z, true)) + ' (+1★)') + '</span></button>'
                : '')
            + '<button type="button" class="hs-btn ren" data-cl="zoo-rename" data-id="' + selAn.id + '"><i class="ph-bold ph-pencil-simple"></i><span>Renomear</span></button>'
            + '<button type="button" class="hs-btn rel' + (relArmed ? ' armed' : '') + '" data-cl="zoo-release" data-id="' + selAn.id + '"><i class="ph-bold ph-hand-waving"></i><span>' + (relArmed ? 'Confirmar?' : 'Soltar (+' + ZREL[sp.rk] + ' bio)') + '</span></button>'
            + '</div></div>';
    }
    function zBookHTML() {
        try { if (typeof warCss === 'function') warCss(); } catch (e) {}
        const s = clS(), z = clZooS(s), lay = clZooLayout(s), lv = lay.lv || 1, n = Object.keys(z.book).length;
        const tab = ZOO.btab || 'mine', flt = ZOO.bflt || 'all';
        const pct = Math.round(100 * n / Math.max(1, ZSP.length));
        const bio = Math.floor(+s.res.b || 0), cry = Math.floor(+s.res.c || 0);
        const dupTotal = (z.an || []).reduce((acc, a, _, arr) => arr.filter(x => x.sp === a.sp).length > 1 ? acc + 1 : acc, 0);
        const totalCP = (z.an || []).reduce((acc, a) => acc + zDragonPower(zsp(a.sp), a), 0);
        const canAch = ZACH.filter(a => !(z.ach && z.ach[a.id]) && a.f(z) >= a.t).length;
        const tabs = [
            ['mine', 'ph-dragon', 'Meus Dragões', String(z.an.length)],
            ['col', 'ph-cards', 'Coleção', n + '/' + ZSP.length],
            ['ach', 'ph-trophy', 'Provas & Feitos', canAch ? canAch + '!' : ''],
            ['help', 'ph-question', 'Guia', '']
        ];

        let h = '<div class="hs-shell">'
            + '<header class="hs-hdr">'
            + '<div class="hs-brand"><div class="hs-emblem"><i class="ph-bold ph-book-open-text"></i></div>'
            + '<div class="hs-brand-tx"><b>Livro dos Dragões</b><div class="hs-prog"><span>' + n + '/' + ZSP.length + ' espécies · ' + pct + '%</span><span class="hs-prog-bar"><i style="width:' + pct + '%"></i></span></div></div></div>'
            + '<div class="hs-hdr-r">'
            + '<span class="hs-res-chip" style="--c:#4ade80"><i class="ph-bold ph-leaf"></i><b>' + clFmt(bio) + '</b><small>Bio</small></span>'
            + '<span class="hs-res-chip" style="--c:#c084fc"><i class="ph-bold ph-diamond"></i><b>' + clFmt(cry) + '</b><small>Cristal</small></span>'
            + '<span class="hs-res-chip" style="--c:#fbbf24"><i class="ph-bold ph-lightning"></i><b>' + clFmt(totalCP) + '</b><small>Poder</small></span>'
            + '<span class="hs-res-chip" style="--c:#fb923c"><i class="ph-bold ph-house"></i><b>' + z.an.length + '/' + lay.slots + '</b><small>Covil ' + lv + '</small></span>'
            + '<button type="button" class="hs-close" data-cl="zoo-close" aria-label="Fechar"><i class="ph-bold ph-x"></i></button>'
            + '</div></header>';

        h += '<nav class="hs-tabs">' + tabs.map(t =>
            '<button type="button" class="hs-tab' + (t[0] === tab ? ' on' : '') + '" data-cl="zoo-btab" data-t="' + t[0] + '"><i class="ph-bold ' + t[1] + '"></i><span>' + t[2] + '</span>' + (t[3] ? '<span class="badge">' + t[3] + '</span>' : '') + '</button>'
        ).join('') + '</nav><div class="hs-body">';

        if (tab === 'mine') {
            const ad = z.an.filter(zAdult), hungry = ad.filter(a => !(a.fed > 0.02)).length;
            let ready = 0; ad.forEach(a => { if ((a.st || 0) > 0) ready++; });
            const sorted = (z.an || []).slice().sort((a, b) =>
                (zDragonPower(zsp(b.sp), b) - zDragonPower(zsp(a.sp), a))
                || (zAL(b) - zAL(a))
                || (zStar(b) - zStar(a))
            );
            let selAn = sorted.find(a => a.id === ZOO.anId) || sorted[0] || null;
            if (selAn) {
                ZOO.anId = selAn.id;
                ZOO.bsp = selAn.sp;
            }

            h += '<div class="hs-mine-bar"><div class="hs-mine-stats">'
                + '<span style="--mc:#fbbf24"><b>' + sorted.length + '/' + lay.slots + '</b> no Covil</span>'
                + '<span style="--mc:#4ade80"><b>' + ready + '</b> prontos</span>'
                + '<span style="--mc:#fb923c"><b>' + z.eggs.length + '</b> ovos</span>'
                + (dupTotal ? '<span style="--mc:#e879f9"><b>' + dupTotal + '</b> repetidos p/ fundir</span>' : '')
                + '</div><div class="hs-mine-acts">'
                + '<button type="button" class="hs-mbtn' + (ready ? ' main' : '') + '" data-cl="zoo-collect"' + (ready ? '' : ' disabled') + '><i class="ph-bold ph-basket"></i> Coletar' + (ready ? ' (' + ready + ')' : '') + '</button>'
                + '<button type="button" class="hs-mbtn" data-cl="zoo-buy"><i class="ph-bold ph-plus-circle"></i> Trazer comum</button>'
                + '</div></div>';

            h += '<div class="hs-split"><div class="hs-scroll" data-hs-scroll="mine">';
            if (z.eggs.length || lay.eggs) {
                h += '<div class="hs-nests"><span class="hs-nests-lbl"><i class="ph-bold ph-egg"></i> Ninhos (' + z.eggs.length + '/' + lay.eggs + '):</span>'
                    + (z.eggs.length ? z.eggs.map(e => {
                        const spE = zsp(e.sp) || ZSP[0], ok = e.el >= e.tot;
                        return '<span class="cl-zegg' + (ok ? ' ok' : '') + '"' + (ok && z.an.length < lay.slots ? ' data-cl="zoo-hatch"' : '') + ' style="--c:' + ZR[spE.rk].col + '"><span class="mini">' + zEggSVG(ZR[spE.rk].col, ZEL[spE.el].col, ok, spE.id) + '</span><u>' + (ok ? (z.an.length >= lay.slots ? 'Sem vaga' : 'Nasce! Toque') : zClock(e.tot - e.el)) + '</u></span>';
                    }).join('') : '<small style="color:#d8b4fe">Cruze 2 adultos na <b>Árvore Incubadora</b> para gerar ovos.</small>')
                    + '</div>';
            }
            if (sorted.length) {
                h += '<div class="dk-grid-stage"><canvas class="cards-fx-canvas"></canvas><div class="hs-card-grid">' + sorted.map(a => {
                    const sp = zsp(a.sp);
                    return zHcCard(sp, true, true, a.id === selAn.id, 1, zStar(a), a, lv, z);
                }).join('') + '</div></div>';
            } else {
                h += '<div class="hs-how" style="max-width:460px;margin:28px auto;text-align:center"><b>Covil vazio!</b><p>Compre seu primeiro dragão por ' + ZBUY + ' biomassa para produzir cristais.</p><button type="button" class="hs-btn lvl can full" data-cl="zoo-buy"><i class="ph-bold ph-plus-circle"></i><span>Trazer Primeiro Dragão (' + ZBUY + ' bio)</span></button></div>';
            }
            h += '</div>' + zHsSpotlightHTML(s, z, lay, selAn ? selAn.sp : (ZOO.bsp || ZSP[0].id)) + '</div>';
        } else if (tab === 'col') {
            const ownBySp = {}, starBySp = {}, bestLvBySp = {};
            (z.an || []).forEach(a => {
                ownBySp[a.sp] = (ownBySp[a.sp] || 0) + 1;
                starBySp[a.sp] = Math.max(starBySp[a.sp] || 0, zStar(a));
                bestLvBySp[a.sp] = Math.max(bestLvBySp[a.sp] || 1, zAL(a));
            });
            const flts = [
                ['all', 'Todos (' + ZSP.length + ')', '#fbbf24'],
                ['own', 'No Covil (' + Object.keys(ownBySp).length + ')', '#4ade80'],
                ['dup', 'Repetidos (' + Object.values(ownBySp).filter(c => c > 1).length + ')', '#e879f9'],
                ['miss', 'Faltam (' + (ZSP.length - n) + ')', '#94a3b8']
            ];
            const elFlts = [
                ['terra', 'Terra', ZEL.terra.col, ZEL.terra.ic],
                ['agua', 'Água', ZEL.agua.col, ZEL.agua.ic],
                ['cristal', 'Cristal', ZEL.cristal.col, ZEL.cristal.ic],
                ['estelar', 'Estelar', ZEL.estelar.col, ZEL.estelar.ic]
            ];
            h += '<div class="hs-filters">'
                + flts.map(f => '<button type="button" class="hs-flt' + (flt === f[0] ? ' on' : '') + '" data-cl="zoo-bflt" data-f="' + f[0] + '" style="--fc:' + f[2] + '">' + f[1] + '</button>').join('')
                + '<span class="hs-flt-sep"></span>'
                + elFlts.map(f => '<button type="button" class="hs-flt' + (flt === f[0] ? ' on' : '') + '" data-cl="zoo-bflt" data-f="' + f[0] + '" style="--fc:' + f[2] + '"><i class="ph-fill ' + f[3] + '"></i> ' + f[1] + '</button>').join('')
                + '</div>';

            const filtered = ZSP.filter(sp => {
                if (flt === 'own') return (ownBySp[sp.id] || 0) > 0;
                if (flt === 'dup') return (ownBySp[sp.id] || 0) > 1;
                if (flt === 'miss') return !z.book[sp.id];
                if (ZEL[flt]) return sp.el === flt;
                return true;
            }).sort((a, b) => ((ownBySp[b.id] ? 1 : 0) - (ownBySp[a.id] ? 1 : 0)) || (b.rk - a.rk));

            let selSpId = ZOO.bsp;
            if (!selSpId || !filtered.some(x => x.id === selSpId)) {
                const bestOwn = filtered.find(x => ownBySp[x.id] > 0) || filtered[0] || ZSP[0];
                selSpId = bestOwn ? bestOwn.id : ZSP[0].id;
                ZOO.bsp = selSpId;
            }

            h += '<div class="hs-split"><div class="hs-scroll" data-hs-scroll="deck"><div class="dk-grid-stage"><canvas class="cards-fx-canvas"></canvas><div class="hs-card-grid">'
                + (filtered.length
                    ? filtered.map(sp => zHcCard(sp, !!z.book[sp.id], (ownBySp[sp.id] || 0) > 0, sp.id === selSpId, ownBySp[sp.id] || 0, starBySp[sp.id] || 0, null, bestLvBySp[sp.id] || 1, z)).join('')
                    : '<div style="grid-column:1/-1;padding:24px;text-align:center;color:#cbbba0">Nenhuma carta neste filtro.</div>')
                + '</div></div></div>'
                + zHsSpotlightHTML(s, z, lay, selSpId)
                + '</div>';
        } else if (tab === 'ach') {
            h += '<div class="hs-scroll" data-hs-scroll="ach">'
                + '<div class="hs-arena-banner">'
                + '<button type="button" class="hs-arena-cta" data-cl="zoo-colony-arena"><i class="ph-bold ph-sword"></i><div><b>Duelos Elementais</b><small>Enfrente as 5 Torres e conquiste cristais</small></div></button>'
                + '<button type="button" class="hs-arena-cta" data-cl="zoo-war-map"><i class="ph-bold ph-map-trifold"></i><div><b>Campanha: Batalha em Mapa</b><small>25 fases até o Ovo Lendário</small></div></button>'
                + '</div>'
                + zAchHTML(z)
                + '</div>';
        } else {
            h += '<div class="hs-scroll" data-hs-scroll="help"><div class="hs-help-grid">'
                + '<section class="hs-help-card" style="--hc:#fb923c"><h4><i class="ph-bold ph-grains"></i> 1. Comida & Produção</h4><p>Dragões alimentados geram biomassa e cristais e ganham XP. A <b>Auto-ração</b> usa apenas biomassa excedente.</p></section>'
                + '<section class="hs-help-card" style="--hc:#2dd4bf"><h4><i class="ph-bold ph-barbell"></i> 2. Níveis & Coroa</h4><p>O Treino XP vem de <b>usar o dragão em batalhas</b> (Defesa): quem entra em campo ganha XP, e perder rende metade. Ao encher, evolua o nível do dragão para aumentar a produção (+18%/nv) e a <b>Coroa</b> no topo da carta. Alimentar só mantém a produção.</p></section>'
                + '<section class="hs-help-card" style="--hc:#e879f9"><h4><i class="ph-bold ph-sparkle"></i> 3. Repetidos & Fusão (★)</h4><p>Selecione qualquer cópia repetida e toque em <b>Fundir ★</b> para ganhar força permanente (+8%/★) e liberar vaga.</p></section>'
                + '<section class="hs-help-card" style="--hc:#4ade80"><h4><i class="ph-bold ph-tree"></i> 4. Ovos na Incubadora</h4><p>Espécies Incomuns, Raras, Épicas e Lendárias nascem cruzando adultos na <b>Árvore Incubadora</b> da colônia.</p></section>'
                + '</div></div>';
        }
        return h + '</div></div>';
    }
    /* ---------- LIVRO DOS DRAGÕES ---------- */
    function zBkAchItems(z) {
        z.ach = z.ach || {}; return ZACH.map(a => { const cur = Math.min(a.t, a.f(z)), done = !!z.ach[a.id], can = !done && cur >= a.t; return '<div class="cl-zac' + (done ? ' done' : '') + (can ? ' can' : '') + '"><span class="tx"><b>' + a.n + '</b><span class="bar"><i style="width:' + Math.round(100 * cur / a.t) + '%"></i></span><small>' + cur + ' / ' + a.t + '</small></span>' + (done ? '<em class="ok"><i class="ph-fill ph-check-circle"></i></em>' : '<button type="button" class="cl-zacb" data-cl="zoo-ach" data-id="' + a.id + '"' + (can ? '' : ' disabled') + '>+' + a.r + ' <i class="ph-bold ph-diamond"></i></button>') + '</div>'; });
    }
    /* Carta TCG padrão unificada (Modelo Único — idêntico à carta de Eclosão de Ovo) */
    function zCardLevelTier(lv) { return lv >= 10 ? 4 : lv >= 7 ? 3 : lv >= 5 ? 2 : lv >= 3 ? 1 : 0; }
    function zCardLevelHTML(lv, extra) {
        const tier=zCardLevelTier(lv), names=['Aprendiz','Desperto','Veterano','Ascendente','Soberano'];
        return `<span class="dk-lv-pill dk-level-emblem level-emblem-${tier}" title="${names[tier]} · Nível ${lv}${extra ? ' · '+extra : ''}"><svg class="dk-crystal-crown" viewBox="0 0 64 34" aria-hidden="true"><path class="dcc-rail" d="M7 26 3 9l13 9L31 3l15 15 14-9-5 17z"/><path class="dcc-facet" d="m3 9 13 9 15-15 15 15 14-9-5 17H8z"/><path class="dcc-line" d="M8 26h46"/><path class="dcc-shard" d="m31 3 4 15-4 8-4-8z"/></svg><span><b>${lv}</b></span></span>`;
    }
    function zTcgCardHTML(sp, opts) {
        try { if (typeof warCss === 'function') warCss(); } catch (e) {}
        window.CestilleCardThree=clTh();
        if(!document.getElementById('dragon-card-runtime')){const js=document.createElement('script');js.id='dragon-card-runtime';js.src='./assets/colony/dragon_cards.js?v=lite1';document.head.appendChild(js);}
        opts = opts || {};
        const rk = (sp.rk | 0), R = ZR[rk], E = ZEL[sp.el] || ZEL.terra;
        const fxLabel = ['Prata', 'Neon', 'Raio', 'Plasma', 'Solar'][rk] || R.n;
        const locked = !!opts.locked;
        const costGem = (typeof warCardCost === 'function') ? warCardCost({sp:sp.id,rk}) : (50 + rk * 35);
        const tagOpen = opts.asDiv
            ? ('<div class="dk-card rk-' + rk + (locked ? ' dk-locked' : '') + (opts.extraClass ? ' ' + opts.extraClass : '') + '"')
            : ('<button type="button" class="dk-card rk-' + rk + (opts.selected ? ' on sel' : '') + (locked ? ' dk-locked' : '') + (opts.extraClass ? ' ' + opts.extraClass : '') + '" ' + (opts.attr || '') + (opts.disabled ? ' disabled' : '') + (opts.titleAttr ? ' title="' + opts.titleAttr.replace(/"/g, '&quot;') + '"' : '') + '>');
        const tagClose = opts.asDiv ? '</div>' : '</button>';

        if (locked) {
            return '<div class="dk-slot rk-' + rk + '" data-rk="' + rk + '" style="--rc:' + R.col + '">'
                + '<div class="dk-aura"></div>'
                + tagOpen + (opts.asDiv ? '>' : '')
                + '<div class="dk-inner">'
                + '<div class="dk-head">'
                + '<span class="dk-cost-gem">💎 ' + costGem + '</span>'
                + '<span class="dk-lv-pill">' + R.n + '</span>'
                + '</div>'
                + '<div class="dk-portrait"><span class="dk-lock-q">?</span></div>'
                + '<div class="dk-ribbon"><b>???</b><span class="dk-rk-line">★ ' + R.n + ' · ' + E.n + ' (' + fxLabel + ')</span></div>'
                + '<div class="dk-stats">'
                + '<div class="dk-st" style="color:#94a3b8"><small>VIDA</small>?</div>'
                + '<div class="dk-st" style="color:#94a3b8"><small>ATQ</small>?</div>'
                + '<div class="dk-st" style="color:#94a3b8"><small>ALC</small>?</div>'
                + '</div>'
                + '<div class="dk-moves-mini"><div style="opacity:.75">🔒 Espécie não descoberta</div><div style="color:' + E.col + ';opacity:.72">Elemento ' + E.n + '</div></div>'
                + '</div>'
                + '<div class="card-holo-glare"></div>'
                + tagClose + '</div>';
        }

        const inst = opts.inst || null;
        const fakeOrInst = inst || { sp: sp.id, lv: opts.lv || 1, xp: 0, star: opts.star || 0 };
        const lvCard = inst ? zAL(inst) : (opts.lv || 1);
        const star = inst ? zStar(inst) : (opts.star || 0);
        const cpVal = (typeof zDragonPower === 'function') ? zDragonPower(sp, fakeOrInst) : Math.round((rk + 1) * 160 + ZG[rk] * 6.5);
        const stStats = (typeof zDragonCombatStats === 'function') ? zDragonCombatStats(sp, fakeOrInst) : { hp: 130 + rk * 70 + lvCard * 30, atk: 26 + rk * 16 + lvCard * 8 };
        const defensePick={sp:sp.id,rk,el:sp.el,hp:stStats.hp,atk:stStats.atk,star,run:(inst && typeof warRuneStats==='function') ? warRuneStats(inst.id, sp.el) : null,kinds:[(typeof WAR_KIND!=='undefined' && WAR_KIND[zBt3Moves(sp.id)[1][1]]) || 'bolt']};
        const hpReal = typeof warMaxHp==='function' ? warMaxHp(defensePick) : stStats.hp;
        const atkReal = Math.round(typeof warAttack==='function' ? warAttack(defensePick) : stStats.atk);
        const moves = (typeof zBt3Moves === 'function') ? zBt3Moves(sp.id) : [['Investida', 'dash'], ['Golpe Elemental', 'orb'], ['Supremo', 'beam']];
        const mv1 = moves[1] || moves[0], mv2 = moves[2] || moves[1] || moves[0];
        const k1 = (typeof WAR_KIND !== 'undefined' && WAR_KIND[mv1[1]]) || 'bolt';
        const kd1 = (typeof WAR_KD !== 'undefined' && WAR_KD[k1]) || { cd: 1.5, rg: 9 };
        const rngTxt = (typeof warRangeBadge === 'function') ? warRangeBadge(k1, kd1.rg) : ((kd1.rg || 9) + 'c');
        const passive = (typeof warElPassive === 'function') ? warElPassive(sp.el) : ('Afinidade ' + E.n);

        let leftHead = opts.showCost===false ? '' : '<span class="dk-cost-gem">💎 ' + costGem + '</span>';
        if (opts.priceBio != null) leftHead = '<span class="dk-cost-gem dk-bio">🌿 ' + opts.priceBio + '</span>';
        else if (opts.pickTag) leftHead = '<span class="dk-pick-tag">' + opts.pickTag + '</span>';

        const lvTxt = (star ? '★ '+star+' · ' : '')+'Poder '+cpVal;
        const rightCorner = opts.battle ? '<span class="dk-field-badge"></span>' : (opts.checkOn !== undefined)
            ? '<span class="dk-check">' + (opts.checkOn ? '✓' : '') + '</span>'
            : (opts.cornerBadge ? '<span class="dk-badge-corner">' + opts.cornerBadge + '</span>' : '');
        const displayName = opts.titleOverride || (inst && inst.nm ? esc(inst.nm) : esc(sp.n));

        let footLine2 = '<div style="color:' + E.col + ';opacity:.92">' + passive + '</div>';
        if (opts.restCd > 0 && inst) {
            footLine2 = '<div style="color:#f5d0fe;font-weight:900">⏳ <span data-zcd="' + inst.id + '">Descansa ' + zClock(opts.restCd) + '</span></div>';
        } else if (opts.isBaby) {
            footLine2 = '<div style="color:#f5d0fe;font-weight:800">🐣 Filhote · ' + passive + '</div>';
        }

        return '<div class="dk-slot rk-' + rk + ' level-tier-' + zCardLevelTier(lvCard) + (opts.battle ? ' battle-tcg' : '') + '" data-species="'+sp.id+'" data-level="'+lvCard+'" data-stars="'+star+'" data-rk="' + rk + '"'+(opts.slotIndex!=null?' data-k="'+opts.slotIndex+'"':'')+' style="--rc:' + R.col + '">'
            + '<div class="dk-aura"></div>'
            + tagOpen + (opts.asDiv ? '>' : '')
            + '<div class="dk-inner">'
            + '<div class="dk-head">' + leftHead + zCardLevelHTML(lvCard,lvTxt) + '</div>'
            + '<div class="dk-portrait">' + rightCorner + zImg(sp.id) + '</div>'
            + '<div class="dk-ribbon"><b>' + displayName + '</b><span class="dk-rk-line">★ ' + R.n + ' · ' + E.n + ' (' + fxLabel + ')</span></div>'
            + '<div class="dk-stats">'
            + '<div class="dk-st" style="color:#fca5a5"><small>VIDA</small>' + hpReal + '</div>'
            + '<div class="dk-st" style="color:#93c5fd"><small>ATQ</small>' + atkReal + '</div>'
            + '<div class="dk-st" style="color:#fde68a"><small>ALC</small>' + rngTxt + '</div>'
            + '</div>'
            + '<div class="dk-moves-mini"><div class="dk-role-line">'+(typeof warPower==='function' ? '⚡ '+warPower(defensePick)+' · '+warRole(defensePick).ic+' '+warRole(defensePick).n : '')+'</div><div class="dk-skill-normal"><small>NORMAL</small><b>'+mv1[0]+'</b></div><div class="dk-skill-special"><small>ESPECIAL</small><b>'+mv2[0]+'</b></div>'+(opts.battle?'':footLine2)+'</div>'
            + (opts.battle ? '<u class="dk-cooldown-mask"></u><span class="dk-cooldown-label"></span>' : '')
            + '</div>'
            + '<div class="card-holo-glare"></div>'
            + tagClose + '</div>';
    }
    /* carta de dragão padronizada */
    function zHcCard(sp, got, own, sel, ownCount, maxStar, inst, colLv, z) {
        const attr = inst
            ? ('data-cl="zoo-sel-animal" data-aid="' + inst.id + '" data-sp="' + sp.id + '"')
            : ('data-cl="zoo-bsp" data-sp="' + sp.id + '"');
        if (!got) return zTcgCardHTML(sp, { locked: true, selected: sel, attr });
        const lvCard = inst ? zAL(inst) : (own ? Math.max(1, colLv || 1) : 1);
        const adult = inst ? zAdult(inst) : true;
        const cornerBadge = !inst && ownCount > 1 ? ('×' + ownCount) : (!inst && own ? '✓' : (inst && !adult ? '🐣' : ''));
        const eligible = inst && adult && zAL(inst) < ZMAXLV && (+inst.xp || 0) >= zXpNeed(zAL(inst) + 1, sp.rk) && zLvAfford(zLvCost(zAL(inst) + 1, sp.rk), sp);
        return zTcgCardHTML(sp, {
            inst,
            extraClass: eligible ? 'upgrade-ready' : '',
            lv: lvCard,
            star: maxStar || 0,
            selected: sel,
            attr,
            cornerBadge,
            isBaby: inst && !adult,
            showCost: true,
            showPowerInHead: true,
            showGlare: true
        });
    }

    /* Vantagem elemental no combate estilo Pedra-Papel-Tesoura */
    const ZADV = { fogo: 'terra', terra: 'agua', agua: 'fogo', cristal: 'estelar', estelar: 'cristal' };
    const ZTOWERS = [
        { id: 'rocha', n: 'Prova da Rocha Ancestral', el: 'terra', boss: 'Colosso de Granito', sp: 'cascalho', lv: 3, hp: 220, atk: 22, col: '#5b8c5a', rCristais: 120, runa: 'Runa da Terra', desc: 'Guardião pétreo milenar forjado nas montanhas profundas.' },
        { id: 'mares', n: 'Prova das Marés Profundas', el: 'agua', boss: 'Leviatã dos Abismos', sp: 'mare', lv: 5, hp: 320, atk: 32, col: '#2e86de', rCristais: 180, runa: 'Runa da Água', desc: 'Senhor das correntes marítimas, veloz e implacável.' },
        { id: 'prisma', n: 'Prova dos Prismas Radiantes', el: 'cristal', boss: 'Prisma Diamantino', sp: 'prisma', lv: 7, hp: 440, atk: 45, col: '#8e44ad', rCristais: 260, runa: 'Runa de Cristal', desc: 'Refrata a luz em lâminas cortantes de puro cristal.' },
        { id: 'magma', n: 'Prova do Magma Incandescente', el: 'estelar', boss: 'Dragão de Magma Ancestral', sp: 'vulcao', lv: 9, hp: 580, atk: 58, col: '#e67e22', rCristais: 350, runa: 'Runa de Fogo', desc: 'Criatura colossal alimentada pelas chamas eternas do núcleo.' },
        { id: 'eclipse', n: 'Prova do Eclipse Cósmico', el: 'estelar', boss: 'Arauto do Vazio Cósmico', sp: 'eclipse', lv: 12, hp: 780, atk: 75, col: '#ffc94d', rCristais: 500, runa: 'Runa Estelar', relic: 'Ovo Ancestral do Vazio', desc: 'A lenda do vazio celeste. A vitória concede o lendário Ovo Ancestral!' }
    ];

    function clDoHitStop(ms) {
        try {
            const bk = CL.root && CL.root.querySelector('.cl-bk');
            if (bk) {
                bk.classList.add('hit-stop');
                setTimeout(() => { try { bk.classList.remove('hit-stop'); } catch (e) {} }, ms || 80);
            }
        } catch (e) {}
    }
    function clDoTraumaShake(intensity) {
        try {
            const bk = CL.root && CL.root.querySelector('.cl-bk');
            if (bk) {
                bk.classList.remove('shake-sm', 'shake-md', 'shake-lg');
                void bk.offsetWidth;
                const cls = (intensity || 1) > 0.8 ? 'shake-lg' : (intensity > 0.4 ? 'shake-md' : 'shake-sm');
                bk.classList.add(cls);
                setTimeout(() => { try { bk.classList.remove(cls); } catch (e) {} }, 450);
            }
        } catch (e) {}
    }

    function zDragonCombatStats(sp, own) {
        const lv = own ? zAL(own) : 1;
        const rk = sp.rk | 0;
        const baseHp = 130 + rk * 70 + lv * 30;
        const baseAtk = 26 + rk * 16 + lv * 8;
        const cp = Math.round(baseHp * 1.4 + baseAtk * 4.5);
        return { hp: baseHp, maxHp: baseHp, atk: baseAtk, cp, lv, sp, own };
    }

    function zDuelGetState() {
        if (!ZOO.duel) {
            const s = clS(), z = clZooS(s);
            let pSp = ZSP[0], pOwn = null;
            if (z.an && z.an.length) {
                const chosen = (ZOO.bsp && z.an.find(a => a.sp === ZOO.bsp)) || z.an[0];
                pSp = zsp(chosen.sp) || ZSP[0]; pOwn = zsp(chosen.sp) ? chosen : null;
            } else if (ZOO.bsp) {
                pSp = zsp(ZOO.bsp) || ZSP[0];
            }
            if (!pSp) pSp = ZSP[0];
            const pStats = zDragonCombatStats(pSp, pOwn);
            const towerIdx = 0;
            const tw = ZTOWERS[towerIdx];
            ZOO.duel = {
                tower: towerIdx,
                active: false,
                pStats,
                playerHp: pStats.hp,
                playerMaxHp: pStats.hp,
                playerRage: 0,
                enemyHp: tw.hp,
                enemyMaxHp: tw.hp,
                enemyBoss: tw.boss,
                turn: 'player',
                log: 'Selecione uma ação para iniciar o combate elemental!'
            };
        }
        return ZOO.duel;
    }

    function zDuelSelect(idx, quiet) {   /* escolhe a torre sem começar o combate (o combate começa em 3D) */
        const d = zDuelGetState(); idx = Math.max(0, Math.min(ZTOWERS.length - 1, idx | 0)); const tw = ZTOWERS[idx];
        d.tower = idx; d.active = false; d.enemyHp = tw.hp; d.enemyMaxHp = tw.hp; d.enemyBoss = tw.boss; d.turn = 'player'; d.log = 'Selecione uma ação para iniciar o combate elemental!';
        if (!quiet && ZOO.modal === 'colony-arena') clColonyArenaRefresh();
    }
    function zDuelStart(tIdx) {
        const s = clS(), z = clZooS(s);
        const duel = zDuelGetState();
        tIdx = Math.max(0, Math.min(ZTOWERS.length - 1, tIdx != null ? tIdx : duel.tower));
        const tw = ZTOWERS[tIdx];
        duel.tower = tIdx;
        let pSp = ZSP[0], pOwn = null;
        if (z.an && z.an.length) {
            const chosen = (ZOO.bsp && z.an.find(a => a.sp === ZOO.bsp)) || z.an[0];
            pSp = zsp(chosen.sp) || ZSP[0]; pOwn = zsp(chosen.sp) ? chosen : null;
        } else if (ZOO.bsp) {
            pSp = zsp(ZOO.bsp) || ZSP[0];
        }
        if (!pSp) pSp = ZSP[0];
        duel.pStats = zDragonCombatStats(pSp, pOwn);
        duel.playerHp = duel.pStats.hp;
        duel.playerMaxHp = duel.pStats.hp;
        duel.playerRage = 0;
        duel.enemyHp = tw.hp;
        duel.enemyMaxHp = tw.hp;
        duel.enemyBoss = tw.boss;
        duel.turn = 'player';
        duel.active = true;
        duel.log = '⚔️ O combate contra ' + tw.boss + ' começou! Escolha seu golpe.';
        try { aliveSound('tick'); } catch (e) {}
        try { zBkSetDragon(pSp.id, true); } catch (e) {}
        if (ZOO.modal === 'colony-arena') clColonyArenaRefresh();
        if (ZOO.modal === 'book') zBookRefresh();
    }

    function zDuelAction(actKey) {
        const s = clS(), z = clZooS(s);
        const duel = zDuelGetState();
        if (!duel.active || duel.turn !== 'player' || duel.playerHp <= 0 || duel.enemyHp <= 0) return;
        const tw = ZTOWERS[duel.tower];
        const pStats = duel.pStats;
        let dmg = 0, isCrit = false;

        const adv = ZADV[pStats.sp.el] === tw.el;
        const mult = adv ? 1.5 : (ZADV[tw.el] === pStats.sp.el ? 0.75 : 1.0);

        if (actKey === 'quick') {
            dmg = Math.round(pStats.atk * (0.85 + Math.random() * 0.3));
            duel.playerRage = Math.min(100, duel.playerRage + 35);
            duel.log = pStats.sp.n + ' desferiu um Ataque Rápido! ' + dmg + ' de dano (+35 Fúria).';
            try { aliveSound('tick'); clDoTraumaShake(0.3); } catch (e) {}
        } else if (actKey === 'element') {
            if (duel.playerRage < 25) { zBkToast('Fúria insuficiente (custa 25 Fúria)!'); return; }
            duel.playerRage -= 25;
            dmg = Math.round(pStats.atk * 1.55 * mult * (0.9 + Math.random() * 0.25));
            duel.log = pStats.sp.n + ' invocou Golpe Elemental! ' + dmg + ' de dano' + (adv ? ' (SUPER EFETIVO! 1.5x)!' : '!');
            try { aliveSound('chirp'); clDoTraumaShake(0.6); } catch (e) {}
        } else if (actKey === 'supreme') {
            if (duel.playerRage < 100) { zBkToast('Fúria máxima necessária (100 Fúria)!'); return; }
            duel.playerRage = 0;
            isCrit = true;
            dmg = Math.round(pStats.atk * 2.9 * mult * (1.0 + Math.random() * 0.3));
            duel.log = '💥 RUGIDO TITÂNICO SUPREMO! ' + pStats.sp.n + ' obliterou o oponente causando ' + dmg + ' de DANO CRÍTICO!';
            try {
                aliveSound('upgrade');
                clFarmBuzz([30, 80, 40]);
                clDoHitStop(80);
                clDoTraumaShake(1.2);
            } catch (e) {}
        }

        try {
            if (ZOO.bk3d && ZOO.bk3d.dragonBd) {
                const Bd = ZOO.bk3d.dragonBd;
                const anim = Bd.act && (Bd.act.atk || Bd.act.fly);
                if (anim) zDragonAct(Bd, anim, isCrit ? 2.4 : 1.6);
            }
        } catch (e) {}

        duel.enemyHp = Math.max(0, duel.enemyHp - dmg);

        if (ZBT.on) {   /* batalha 3D: anima o golpe e só depois segue o turno */
            duel.turn = 'anim'; zBt3Attack('p', actKey, dmg, adv && actKey !== 'quick', isCrit, () => {
                if (duel.enemyHp <= 0) { duel.turn = 'victory'; zBt3Finish(true, () => { zDuelVictory(tw); try { clOpenColonyArena(); } catch (e) {} }); } else { duel.turn = 'enemy'; zBt3Hud(); setTimeout(() => zDuelEnemyTurn(tw), 350); }
            }); return;
        }
        if (duel.enemyHp <= 0) {
            duel.turn = 'victory';
            setTimeout(() => zDuelVictory(tw), 500);
            if (ZOO.modal === 'colony-arena') clColonyArenaRefresh();
            if (ZOO.modal === 'book') zBookRefresh();
            return;
        }

        duel.turn = 'enemy';
        if (ZOO.modal === 'colony-arena') clColonyArenaRefresh();
        if (ZOO.modal === 'book') zBookRefresh();
        setTimeout(() => zDuelEnemyTurn(tw), 850);
    }

    function zDuelEnemyTurn(tw) {
        const duel = zDuelGetState();
        if (!duel.active || duel.enemyHp <= 0 || duel.playerHp <= 0) return;
        const pStats = duel.pStats;
        const adv = ZADV[tw.el] === pStats.sp.el;
        const mult = adv ? 1.4 : (ZADV[pStats.sp.el] === tw.el ? 0.75 : 1.0);
        const dmg = Math.round((tw.atk || 25) * mult * (0.85 + Math.random() * 0.3));

        duel.playerHp = Math.max(0, duel.playerHp - dmg);
        duel.log = tw.boss + ' contra-atacou ferozmente causando ' + dmg + ' de dano!';
        if (ZBT.on) {
            const kind = Math.random() < 0.55 ? 'element' : 'quick'; duel.turn = 'anim';
            zBt3Attack('e', kind, dmg, adv && kind !== 'quick', false, () => { if (duel.playerHp <= 0) { duel.turn = 'defeat'; duel.log = 'Seu dragão descansou após um duelo memorável. Treine e tente de novo!'; duel.active = false; zBt3Finish(false, () => { try { clOpenColonyArena(); } catch (e) {} }); } else { duel.turn = 'player'; zBt3Hud(); } });
            return;
        }
        try { aliveSound('tick'); clFarmBuzz(20); clDoTraumaShake(0.5); } catch (e) {}

        if (duel.playerHp <= 0) {
            duel.turn = 'defeat';
            duel.log = 'Seu dragão descansou após um duelo memorável. Treine e tente de novo!';
        } else {
            duel.turn = 'player';
        }
        if (ZOO.modal === 'colony-arena') clColonyArenaRefresh();
        if (ZOO.modal === 'book') zBookRefresh();
    }

    function zDuelVictory(tw) {
        const s = clS(), z = clZooS(s);
        z.towers = z.towers || {};
        const first = !z.towers[tw.id];
        z.towers[tw.id] = 1;

        s.res.c = (+s.res.c || 0) + tw.rCristais;
        z.runes = z.runes || {};
        z.runes[tw.runa] = (z.runes[tw.runa] || 0) + 1;

        if (tw.id === 'eclipse' && first) {
            z.eggs.push({ sp: 'eclipse', el: 0, tot: 300, by: ['eclipse', 'hamster'], ln: Date.now() });
            clMsg('✦ RECOMPENSA ANCESTRAL: Você recebeu o lendário Ovo do Vazio Cósmico!', false);
        }

        try {
            aliveSound('coin');
            clFarmBuzz([20, 60, 20, 80]);
            clMsg('Vitória na ' + tw.n + '! +' + tw.rCristais + ' Cristais e +1 ' + tw.runa + '!');
        } catch (e) {}

        const duel = zDuelGetState();
        duel.active = false;
        duel.log = '🏆 VITÓRIA GLORIOSA! O guardião da ' + tw.n + ' foi superado.';
        CL.ver++;
        clSave(true);
        if (ZOO.modal === 'colony-arena') clColonyArenaRefresh();
        if (ZOO.modal === 'book') zBookRefresh();
    }

/* === [SEC: ARENA_MEDIEVAL_DUELOS] === */
    /* ---------- ARENA MEDIEVAL DE DUELOS NA TELA DA COLÔNIA ---------- */
    function clOpenColonyArena(towerIdx) {
        try {
            if (!CL.root) return;
            if (towerIdx !== undefined) zDuelSelect(towerIdx, true);
            else if (!ZOO.duel) zDuelGetState();
            let m = CL.root.querySelector('.cl-colony-arena');
            if (!m) {
                m = document.createElement('div');
                m.className = 'cl-colony-arena';
                CL.root.appendChild(m);
            }
            m.innerHTML = clColonyArenaHTML();
            ZOO.modal = 'colony-arena';
            try { aliveSound('tick'); } catch (e) {}
        } catch (e) {
            try { window.__arenaErr = String(e && e.stack || e); console.warn('arena', e); } catch (e3) {}
            try { const bad = CL.root && CL.root.querySelector('.cl-colony-arena'); if (bad) bad.remove(); ZOO.modal = null; } catch (e4) {}   /* nunca deixa uma tela vazia por cima do jogo */
            try { clMsg('A arena não abriu. Tente de novo.', true); } catch (e2) {}
        }
    }

    function clColonyArenaRefresh() {
        const m = CL.root && CL.root.querySelector('.cl-colony-arena');
        if (m) m.innerHTML = clColonyArenaHTML();
    }

    function clColonyArenaHTML() {
        const s = clS(), z = clZooS(s); z.towers = z.towers || {}; z.runes = z.runes || {};
        const duel = zDuelGetState();
        const tw = ZTOWERS[duel.tower || 0];
        const pStats = duel.pStats;
        if (!tw || !pStats || !pStats.sp) return '<div class="cl-arena-card"><header class="cl-arena-head"><b>Duelos</b><button type="button" class="cl-x" data-cl="zoo-arena-x" aria-label="Fechar"><i class="ph-bold ph-x"></i></button></header><p style="padding:18px">Não achei um dragão para entrar na arena.</p></div>';
        const pHpFrac = Math.max(0, Math.min(1, duel.playerHp / Math.max(1, duel.playerMaxHp)));
        const eHpFrac = Math.max(0, Math.min(1, duel.enemyHp / Math.max(1, duel.enemyMaxHp)));
        const rFrac = Math.max(0, Math.min(1, duel.playerRage / 100));

        let h = '<div class="cl-arena-card" style="--c:#e74c3c;--e:' + tw.col + '">';
        // Cabeçalho
        h += '<header class="cl-arena-head">';
        h += '<div class="arena-title"><i class="ph-bold ph-shield-checkered"></i> <b>Duelos dos Dragões</b><small>Provas Elementais das 5 Torres Ancestrais</small></div>';
        h += '<button type="button" class="cl-x" data-cl="zoo-arena-x" aria-label="Fechar"><i class="ph-bold ph-x"></i></button>';
        h += '</header>';

        // Seletor Horizontal de Torres Elementais
        h += '<div class="cl-wmodes"><button type="button" class="cl" data-cl="zoo-war-pick-classic"><i class="ph-bold ph-sword"></i> Escolher o dragão do duelo</button><button type="button" class="map" data-cl="zoo-war-map"><i class="ph-bold ph-map-trifold"></i> Batalha em mapa (novo)</button></div>';
        h += '<div class="cl-arena-towers-bar">';
        ZTOWERS.forEach((tItem, idx) => {
            const beaten = !!z.towers[tItem.id];
            const isCur = (duel.tower || 0) === idx;
            h += '<button type="button" class="arena-tw-pill' + (isCur ? ' active' : '') + (beaten ? ' beaten' : '') + '" data-cl="zoo-duel-tower" data-idx="' + idx + '" style="--tc:' + tItem.col + '">';
            h += '<span class="tw-num">' + (idx + 1) + '</span>';
            h += '<span class="tw-name">' + tItem.n.replace(/^Torre d[aoe]s? /, '') + '</span>';
            if (beaten) h += ' <i class="ph-bold ph-check"></i>';
            h += '</button>';
        });
        h += '</div>';

        // Palco de Batalha (VS Display)
        h += '<div class="cl-arena-stage">';
        // Combatente Jogador
        h += '<div class="arena-fighter player">';
        h += '<div class="fighter-avatar rk' + pStats.sp.rk + '" style="--fc:' + ZR[pStats.sp.rk].col + '">';
        h += zImg(pStats.sp.id);
        h += '<span class="fighter-el ' + pStats.sp.el + '"><i class="ph-fill ' + ZEL[pStats.sp.el].ic + '"></i></span>';
        h += '</div>';
        h += '<div class="fighter-meta">';
        h += '<b class="fighter-name">' + pStats.sp.n + '</b>';
        h += '<span class="fighter-sub">Nv ' + pStats.lv + ' · ' + pStats.cp + ' CP</span>';
        h += '</div>';
        h += '<div class="duel-bar hp"><div class="bar-fill" style="width:' + Math.round(pHpFrac * 100) + '%"></div><span class="bar-tx">' + duel.playerHp + ' / ' + duel.playerMaxHp + ' HP</span></div>';
        h += '<div class="duel-bar rage' + (duel.playerRage >= 100 ? ' full' : '') + '"><div class="bar-fill" style="width:' + Math.round(rFrac * 100) + '%"></div><span class="bar-tx">⚡ ' + duel.playerRage + '% FÚRIA</span></div>';
        h += '</div>';

        // VS Badge Central com Vantagem Elemental
        const adv = ZADV[pStats.sp.el] === tw.el;
        const disadv = ZADV[tw.el] === pStats.sp.el;
        h += '<div class="arena-vs-col">';
        h += '<span class="vs-badge">VS</span>';
        if (adv) h += '<span class="vs-adv good">Vantagem 1.5x!</span>';
        else if (disadv) h += '<span class="vs-adv bad">Desvantagem!</span>';
        else h += '<span class="vs-adv neutral">Neutro</span>';
        h += '</div>';

        // Combatente Guardião / Chefe
        h += '<div class="arena-fighter enemy">';
        h += '<div class="fighter-avatar boss" style="--fc:' + tw.col + '">';
        h += '<i class="ph-fill ' + ZEL[tw.el].ic + ' boss-ic"></i>';
        h += '<span class="fighter-el ' + tw.el + '"><i class="ph-fill ' + ZEL[tw.el].ic + '"></i></span>';
        h += '</div>';
        h += '<div class="fighter-meta">';
        h += '<b class="fighter-name">' + tw.boss + '</b>';
        h += '<span class="fighter-sub">' + tw.n + ' · Nv ' + tw.lv + '</span>';
        h += '</div>';
        h += '<div class="duel-bar hp enemy"><div class="bar-fill" style="width:' + Math.round(eHpFrac * 100) + '%"></div><span class="bar-tx">' + duel.enemyHp + ' / ' + duel.enemyMaxHp + ' HP</span></div>';
        h += '<div class="duel-bar rage enemy"><div class="bar-fill" style="width:100%"></div><span class="bar-tx">Elemento ' + ZEL[tw.el].n + '</span></div>';
        h += '</div>';
        h += '</div>'; // fim .cl-arena-stage

        // Combat Log
        h += '<div class="cl-arena-log"><i class="ph-bold ph-chats"></i><span>' + duel.log + '</span></div>';

        // Ações Táticas de Batalha
        h += '<div class="cl-arena-actions">';
        if (duel.active && duel.playerHp > 0 && duel.enemyHp > 0) {
            const canElem = duel.playerRage >= 25;
            const canSup = duel.playerRage >= 100;
            const dis = duel.turn !== 'player';
            h += '<button type="button" class="arena-act-btn quick" data-cl="zoo-duel-act" data-act="quick"' + (dis ? ' disabled' : '') + '><i class="ph-bold ph-sword"></i><span class="t">Ataque Rápido</span><small>+35 Fúria</small></button>';
            h += '<button type="button" class="arena-act-btn elem' + (canElem ? ' can' : '') + '" data-cl="zoo-duel-act" data-act="element"' + (dis || !canElem ? ' disabled' : '') + '><i class="ph-bold ph-lightning"></i><span class="t">Golpe Elemental</span><small>Custa 25 Fúria · 1.5x</small></button>';
            h += '<button type="button" class="arena-act-btn supreme' + (canSup ? ' full' : '') + '" data-cl="zoo-duel-act" data-act="supreme"' + (dis || !canSup ? ' disabled' : '') + '><i class="ph-bold ph-fire"></i><span class="t">RUGIDO SUPREMO</span><small>100 Fúria · CRÍTICO</small></button>';
        } else {
            const btnTxt = duel.playerHp <= 0 ? 'Tentar Novamente' : (duel.enemyHp <= 0 ? 'Repetir Desafio' : 'Entrar no Duelo & Lutar');
            h += '<button type="button" class="arena-start-btn" data-cl="zoo-duel-start"><i class="ph-bold ph-swords"></i><span>' + btnTxt + '</span></button>';
        }
        h += '</div>';

        h += '<div class="arena-test-row" style="display:flex;gap:8px;margin-top:8px;width:100%;justify-content:center;">';
        h += '<button type="button" class="cl-zseal" style="background:rgba(255,215,0,.15);border:1px solid #ffd700;color:#ffd700;padding:8px 16px;border-radius:10px;font-weight:900;" data-cl="zoo-ritual-test"><i class="ph-bold ph-egg"></i><span>🧪 Testar Eclosão 3D</span></button>';
        h += '</div>';

        // Rodapé com Runas Ancestrais e Recompensas
        h += '<div class="cl-arena-footer">';
        h += '<div class="arena-runes-row">';
        h += '<span class="runes-lab"><i class="ph-bold ph-sparkle"></i> Suas Runas Ancestrais:</span>';
        const runeIcons = { 'Runa da Terra': '🌿', 'Runa da Água': '💧', 'Runa de Cristal': '💎', 'Runa de Fogo': '🔥', 'Runa Estelar': '🌌' };
        ['Runa da Terra', 'Runa da Água', 'Runa de Cristal', 'Runa de Fogo', 'Runa Estelar'].forEach(rk => {
            const count = z.runes[rk] || 0;
            h += '<span class="arena-rune-tag' + (count > 0 ? ' have' : '') + '">' + (runeIcons[rk] || '✨') + ' ' + rk.replace('Runa ', '').replace('de ', '') + ' <b>x' + count + '</b></span>';
        });
        h += '</div>';
        h += '</div>';

        h += '</div>'; // fim .cl-arena-card
        return h;
    }

    function zEnchantNest() {
        const s = clS(), z = clZooS(s);
        z.runes = z.runes || {};
        const available = Object.keys(z.runes).find(k => z.runes[k] > 0);
        if (!available) {
            zBkToast('Sem Essências Rúnicas! Vença as Provas Elementais para conquistar.');
            return;
        }
        z.runes[available]--;
        z.enchanted = (z.enchanted || 0) + 1;
        CL.ver++;
        clSave(true);
        try {
            aliveSound('upgrade');
            clFarmBuzz([25, 50, 25]);
        } catch (e) {}
        zBkToast('✦ NINHO ENCANTADO COM ' + available.toUpperCase() + '! +50% de chance de Raro/Lendário!');
        if (ZOO.modal === 'book') zBookRefresh();
    }

    function zShowHatchTitle(sp) {
        try {
            const R = ZR[sp.rk] || ZR[0], E = ZEL[sp.el] || ZEL.terra;
            let el = document.getElementById('clHatchBanner');
            if (el) el.remove();
            el = document.createElement('div');
            el.id = 'clHatchBanner';
            el.style.cssText = 'position:fixed;top:18%;left:50%;transform:translate(-50%,0);z-index:99999;pointer-events:none;text-align:center;font-family:Barlow,Inter,sans-serif;animation:clHatchPop .45s cubic-bezier(0.16,1,0.3,1) forwards;';
            el.innerHTML = '<style>@keyframes clHatchPop{from{opacity:0;transform:translate(-50%,16px) scale(0.92)}to{opacity:1;transform:translate(-50%,0) scale(1)}}</style>'
                + '<div style="display:inline-flex;flex-direction:column;align-items:center;padding:12px 28px;border-radius:18px;background:rgba(9,6,20,0.85);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid ' + R.col + ';box-shadow:0 12px 36px rgba(0,0,0,0.6),0 0 24px ' + R.col + '44;">'
                + '<span style="font-size:11px;font-weight:700;letter-spacing:2px;color:' + R.col + ';text-shadow:0 0 10px ' + R.col + ';margin-bottom:4px;">✦ ' + R.n.toUpperCase() + ' ✦</span>'
                + '<h2 style="margin:0;font-size:24px;font-weight:800;color:#ffffff;text-shadow:0 2px 8px rgba(0,0,0,0.8);white-space:nowrap;">🐉 ' + sp.n + '</h2>'
                + '<span style="font-size:12px;font-weight:600;color:' + (E.col || '#9ee6ff') + ';margin-top:4px;">' + E.n + ' · Produz ' + sp.pd + '</span>'
                + '</div>';
            document.body.appendChild(el);
            setTimeout(() => {
                if (el && el.parentNode) {
                    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                    el.style.opacity = '0';
                    el.style.transform = 'translate(-50%, -15px)';
                    setTimeout(() => { if (el && el.parentNode) el.remove(); }, 650);
                }
            }, 3400);
        } catch (e) {}
    }
    /* após cruzar no Altar, fecha a janela e desliza a câmera suavemente até a Árvore Incubadora onde o ovo único surge com o timer elegante */
    function zWorldEggArrive(eg) {
        try {
            if (!CL.on || CL.visit || !CL3 || !CL3.cam) return;
            const s = clS();
            ZOO.sig = '';
            try { zWarm(s); } catch (e0) {}
            const T = clTh();
            const q = ZOO.eggs.find(o => o.eg === eg) || ZOO.eggs[ZOO.eggs.length - 1];
            const ip = (s.pcs || []).findIndex(p0 => p0[0] === 'incubadora');
            const pa = (q && q.pa) || (ip >= 0 ? zPastureFor(ip) : null);
            let tx = CL3.gtx, tz = CL3.gtz, py = 4.2;
            if (pa && pa.grp) {
                const wp = new T.Vector3();
                pa.grp.getWorldPosition(wp);
                tx = wp.x; tz = wp.z;
                const rf = pa.grp.userData.roof;
                if (rf && rf.py) py = wp.y + rf.py * (pa.grp.scale ? pa.grp.scale.y : 1);
            } else if (ip >= 0 && s.pcs[ip]) {
                tx = s.pcs[ip][1] || tx; tz = s.pcs[ip][2] || tz;
            }
            CL3.gtx = tx; CL3.gtz = tz;
            CL3.gdist = Math.min(CL3.gdist || 18, 13.5);
            CL3.gpit = 0.48;
            CL3.camKick = Math.max(CL3.camKick || 0, 0.25);
            setTimeout(() => {
                try {
                    if (!CL.on || !T) return;
                    const spE = eg ? zsp(eg.sp) : null;
                    const col = (spE && ZEGG[spE.id]) ? ZEGG[spE.id][0] : '#fde68a';
                    const col2 = (spE && ZEL[spE.el]) ? ZEL[spE.el].col : '#ffd35c';
                    const ex = (q && q.g && q.g.position.y > -10) ? q.g.position.x : tx;
                    const ey = (q && q.g && q.g.position.y > -10) ? q.g.position.y : py;
                    const ez = (q && q.g && q.g.position.y > -10) ? q.g.position.z : tz;
                    for (let i = 0; i < 16; i++) {
                        const m = new T.Sprite(new T.SpriteMaterial({ map: zFxTex('star_02'), color: i % 2 ? col : col2, transparent: true, opacity: 0.95, depthWrite: false, blending: T.AdditiveBlending }));
                        m.position.set(ex + (Math.random() - 0.5) * 0.6, ey + 0.15, ez + (Math.random() - 0.5) * 0.6);
                        m.scale.setScalar(0.55 + Math.random() * 0.55);
                        const a = (i / 16) * 6.2832 + Math.random() * 0.3, sp0 = 1.4 + Math.random() * 1.8;
                        zFxAdd(m, new T.Vector3(Math.cos(a) * sp0, 1.4 + Math.random() * 1.6, Math.sin(a) * sp0), 0.9 + Math.random() * 0.4, 'spark');
                    }
                    const ring = new T.Sprite(new T.SpriteMaterial({ map: zFxTex('circle_05'), color: col2, transparent: true, opacity: 0.85, depthWrite: false, blending: T.AdditiveBlending }));
                    ring.position.set(ex, ey + 0.2, ez);
                    ring.scale.setScalar(0.8);
                    zFxAdd(ring, new T.Vector3(), 0.75, 'flash', { K: 2.2 });
                    aliveSound('coin');
                } catch (er) {}
            }, 620);
        } catch (e) {}
    }
    /* chocar o ovo NO MUNDO: a câmera foca o ovo na Árvore Incubadora; após o estouro, o filhote surge com neve voando e seu nome aparece */
    function zWorldHatch(eg) {
        try {
            const s = clS(); const q = ZOO.eggs.find(o => o.eg === eg); if (!q || q.gone || !q.g.visible || !CL.on || CL.visit || !CL3 || !CL3.cam) return false;
            if (ZOO.cine) return true;
            try { zEnsureModels([eg.sp], false); } catch (e) {}   /* baixa o modelo 3D da espécie ANTES de nascer (senão nasce um dragão feito de formas, com outra cor) */
            const z = clZooS(s), lay = clZooLayout(s); if (z.an.length >= lay.slots) { clMsg('Sem vaga no pasto para o filhote. Libere uma vaga!', true); return true; }
            const pos = q.g.position; ZOO.cine = { q, t0: ZOO.tcur || 0, ex: pos.x, ey: pos.y, ez: pos.z, n: 0, sv: { x: CL3.gtx, z: CL3.gtz, d: CL3.gdist, p: CL3.gpit, y: CL3.gyaw } };
            q.hat = (ZOO.tcur || 0) + 0.001; return true;
        } catch (e) { ZOO.cine = null; return false; }
    }
    function zNewbornStep(t, dt) {   /* o filhote surge após a explosão em 3D: tamanho proporcional, voando com a câmera focando nele */
        const N = ZOO.newborn; if (!N) return; const u = t - N.t0, B = N.B, g = B.g;
        if (u > 4.6 || !CL.on) { zDetach(g); ZOO.newborn = null; return; }
        if (!B.model && (N.tries || 0) < 80 && t - (N.lt || 0) > 0.4) {   /* o modelo 3D chegou depois: troca o dragão provisório pelo de verdade (mesma cor da espécie) */
            N.lt = t; N.tries = (N.tries || 0) + 1;
            try { const D = ZMD[N.sp.id]; if (D && zModelOk(D.f)) { const NB2 = zBuild(zsp(N.sp.id), true, 1); if (NB2 && NB2.model) { const g0 = B.g; NB2.g.position.copy(g0.position); NB2.g.rotation.copy(g0.rotation); NB2.g.visible = g0.visible; zRoot().add(NB2.g); zDetach(g0); N.B = NB2; N.S = Math.min(0.42, Math.max(0.26, 0.35 * (NB2.g.scale.x || 1))); return; } } } catch (e) {}
        }
        if (u < 0.35) { g.visible = false; return; }
        g.visible = true;
        const pop = Math.min(1, (u - 0.35) / 1.1), e1 = 1 - Math.pow(1 - pop, 3);
        const fade = u > 3.8 ? Math.max(0.01, (4.6 - u) / 0.8) : 1;
        g.scale.setScalar(Math.max(0.01, N.S * (0.2 + 0.8 * e1) * fade));
        // O dragão sobe e bate asas voando suavemente
        g.position.set(N.pos.x, N.pos.y + 0.2 + e1 * 0.85 + Math.sin((u - 0.35) * 3.0) * 0.08, N.pos.z);
        g.rotation.y = (CL3.yaw || 0) + 0.3 + Math.sin((u - 0.35) * 1.2) * 0.35;
        try { if (B.mixer) B.mixer.update(dt); } catch (e) {}
        try {
            if (B.P && B.P.wings) {
                B.P.wings.forEach(w => {
                    w.g.rotation.x = w.sd * (0.4 + 0.5 * Math.sin(t * 12));
                });
            }
        } catch (e) {}
    }
    function zCineStep(t, dt) {
        try { zNewbornStep(t, dt); } catch (e) { ZOO.newborn = null; }
        const C = ZOO.cine; if (!C) return; const q = C.q, el = t - C.t0, T = clTh(), s = clS();
        const restore = () => { try { CL3.gtx = C.sv.x; CL3.gtz = C.sv.z; CL3.gdist = C.sv.d; CL3.gpit = C.sv.p; CL3.gyaw = C.sv.y; } catch (e) {} const ne0 = C.newId ? ZOO.list.find(x => x.id === C.newId) : null; if (ne0 && ne0.g) ne0.g.visible = true; ZOO.cine = null; };
        if (!CL.on || el > 12) { if (q) q.hat = 0; restore(); return; }
        const k = q.g.scale.x > 0 ? Math.max(1, Math.min(8, q.g.scale.x / 1.5)) : 1;
        if (!C.burst) { const zoom = Math.min(1, el / 1.2); CL3.gtx = C.sv.x + (C.ex - C.sv.x) * zoom; CL3.gtz = C.sv.z + (C.ez - C.sv.z) * zoom; CL3.gdist = C.sv.d + (5.2 - C.sv.d) * zoom; CL3.gpit = C.sv.p + (0.32 - C.sv.p) * zoom; }
        const pulse = (col, sc, life, op) => { const m = new T.Sprite(new T.SpriteMaterial({ map: zSoftTex(), color: col, transparent: true, opacity: op || 0.9, depthWrite: false, blending: T.AdditiveBlending })); m.scale.setScalar(sc * k); m.position.set(q.g.position.x, q.g.position.y + 0.2 * k, q.g.position.z); zFxAdd(m, new T.Vector3(), life, 'flash', { K: k * 0.8 }); };
        const marks = [1.4, 2.1, 2.6, 2.9]; if (C.n < marks.length && el > marks[C.n] && !C.burst) { C.n++; pulse(C.n < 3 ? '#ffe9a0' : '#fff6c8', 0.25 + C.n * 0.08, 0.5); CL3.camKick = Math.max(CL3.camKick || 0, 0.25 + C.n * 0.15); try { aliveSound('tick'); clFarmBuzz(20 + C.n * 10); } catch (e) {} }
        if (!C.rev && !C.burst && el > 1.7) { C.rev = 1; try { const U = q.g.userData, id = q.eg.sp, cc = (ZEGG[id] || ZEGG.mist)[0]; U.egg.material = new T.MeshStandardMaterial({ map: zEggTex(id), roughness: 0.38, metalness: 0, emissive: new T.Color(cc), emissiveIntensity: 0.4 }); pulse(cc, 0.9, 0.7, 0.9); } catch (e) {} }
        if (!C.burst && el > 3.1) { C.burst = true; C.bt = t; const hh = zHatchBurst(q, s); if (!hh) { q.hat = 0; restore(); return; } C.newId = ZOO.spawnId; CL3.camKick = 1.0; pulse('#ffffff', 1.6, 0.9, 1); }
        if (C.burst) { 
            const N = ZOO.newborn;
            // Câmera trava e foca diretamente NELE voando
            if (N && N.B && N.B.g) {
                CL3.gtx = N.B.g.position.x;
                CL3.gtz = N.B.g.position.z;
            } else {
                CL3.gtx = C.ex;
                CL3.gtz = C.ez;
            }
            CL3.gdist = 4.8; CL3.gpit = 0.28; CL3.gyaw = (CL3.gyaw || 0) + dt * 0.18;
            const ne = ZOO.list.find(x => x.id === C.newId); if (ne && ne.g) ne.g.visible = false;
            if (t - C.bt > 4.2) restore(); 
        }
    }
    function zStartHatchRitual(eg, testSp, arena) {   /* arena=true: chamado pela Incubadora da Arena (sem limite do Covil) */
        let hh = null;
        if (!testSp) {
            const s = clS(), z = clZooS(s), lay = clZooLayout(s);
            if (z.an.length >= (arena ? Math.max(lay.slots, ZARENA_CAP) : lay.slots)) {
                clMsg('Sem vaga no Covil para o filhote. Libere uma vaga!', true);
                return;
            }
            hh = clZooHatch(s, true, arena);
            if (!hh) return;
            ZOO.sig = '';
        } else {
            hh = { sp: zsp(testSp) || ZSP[0], first: true, c: 50 };
        }

        ZOO.hatchState = {
            eg: eg || { sp: hh.sp.id, el: 10, tot: 10 },
            hh,
            cracks: 0,
            sp: hh.sp,
            by: hh.by || [hh.sp.id, hh.sp.id],
            test: !!testSp
        };

        zClose();
        zStart3DHatchModal(ZOO.hatchState);
    }

    function zStart3DHatchModal(st) {
        try { if (typeof warCss === 'function') warCss(); } catch (e) {}
        const sp = st.sp, R = ZR[sp.rk], E = ZEL[sp.el] || ZEL.terra;
        const fakeOwn = { sp: sp.id, lv: 1, xp: 0, star: 0 };
        const cpVal = (typeof zDragonPower === 'function') ? zDragonPower(sp, fakeOwn) : Math.round(((sp.rk | 0) + 1) * 160 + ZG[sp.rk | 0] * 6.5);
        const cardHTML = zTcgCardHTML(sp, {
            asDiv: true,
            inst: fakeOwn,
            showCost: true,
            showPowerInHead: true,
            showGlare: true
        });

        const html = '<div class="cl-hatch-ritual ritual-3d" style="--c:' + R.col + ';--e:' + E.col + '">'
            + '<canvas class="cl-hatch-2d-cv"></canvas>'
            + '<canvas class="cl-hatch-3d-cv"></canvas>'
            + '<div class="ritual-touch-layer" data-cl="zoo-ritual-tap"></div>'
            + '<button type="button" class="ritual-close-x" data-cl="zoo-close" aria-label="Fechar" title="Fechar (Voltar ao Santuário)">✕</button>'
            + '<div class="ritual-top-hud">'
            + '  <span class="prompt-title">✦ TOQUE NO OVO SAGRADO PARA DESPERTAR ✦</span>'
            + '  <div class="prompt-dots"><span class="dot d1"></span><span class="dot d2"></span><span class="dot d3"></span></div>'
            + '  <small class="prompt-sub">Toque na casca para desferir o primeiro golpe arcano!</small>'
            + '</div>'
            + '<div class="ritual-reveal-head">'
            + '  <span class="reveal-rar">✦ ' + R.n + ' · ' + E.n + (st.hh && st.hh.first ? ' · NOVA ESPÉCIE' : '') + ' ✦</span>'
            + '  <h2 class="reveal-title">' + sp.n + '</h2>'
            + '  <div class="reveal-meta">'
            + '    <span>Produz ' + sp.pd + '</span>'
            + '    <span>· ⚡ ' + cpVal + ' CP</span>'
            + (st.hh && st.hh.c ? '<span class="reveal-gem"><i class="ph-bold ph-diamond"></i> +' + st.hh.c + ' Cristais</span>' : '')
            + '  </div>'
            + '</div>'
            + '<div class="ritual-duo-right">'
            + '  <div class="ritual-card-stage">'
            + '    <canvas class="ritual-card-fx"></canvas>'
            + '    <div class="ritual-card-tilt">' + cardHTML + '</div>'
            + '  </div>'
            + '  <div class="ritual-actions-bar">'
            + '    <button type="button" class="ritual-act-btn main" data-cl="zoo-close"><i class="ph-bold ph-check"></i><span>Levar ao Covil</span></button>'
            + '    <button type="button" class="ritual-act-btn" data-cl="zoo-ritual-see-book" data-sp="' + sp.id + '"><i class="ph-bold ph-books"></i><span>Grimório</span></button>'
            + '    <button type="button" class="ritual-act-btn arena" data-cl="zoo-colony-arena"><i class="ph-bold ph-sword"></i><span>Arena</span></button>'
            + '  </div>'
            + '</div>'
            + '</div>';

        const m = zModal(html, 'hatch-ritual');
        ZOO.modal = 'hatch-ritual';
        zHatch3DInit(m, st);
    }

    function zHatch3DInit(m, st) {
        const T = clTh();
        if (!T) return;
        const cv = m.querySelector('.cl-hatch-3d-cv');
        const cv2d = m.querySelector('.cl-hatch-2d-cv');
        if (!cv) return;

        let w = m.clientWidth || window.innerWidth, h = m.clientHeight || window.innerHeight;
        const r = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, powerPreference: 'high-performance' });
        r.setSize(w, h, false);
        r.setPixelRatio(Math.min(window.devicePixelRatio || 1, matchMedia('(pointer: coarse)').matches ? 1.15 : 1.75));
        if (T.sRGBEncoding) r.outputEncoding = T.sRGBEncoding;

        const sc = new T.Scene();
        const cam = new T.PerspectiveCamera(34, w / Math.max(1, h), 0.1, 45);
        cam.position.set(0, 1.35, 5.15);
        cam.lookAt(0, 0.58, 0);

        // Iluminação Dramática de Santuário
        sc.add(new T.HemisphereLight(0xeef4ff, 0x190b2e, 1.05));

        const spot = new T.SpotLight(0xfff6e0, 2.5, 18, Math.PI / 4.5, 0.45, 1.0);
        spot.position.set(2.1, 5.2, 3.0);
        spot.target.position.set(0, 0.55, 0);
        sc.add(spot);
        sc.add(spot.target);

        const sp = st.sp, R = ZR[sp.rk], E = ZEL[sp.el] || ZEL.terra;
        const colHex = E.col || R.col || '#ffd35c';
        const elemColor = new T.Color(colHex);
        const rarColor = new T.Color(R.col || '#fbbf24');

        const rim = new T.DirectionalLight(elemColor, 2.0);
        rim.position.set(-2.8, 3.0, -3.2);
        sc.add(rim);

        const fillLight = new T.DirectionalLight(rarColor.clone().lerp(new T.Color('#ffffff'), 0.4), 0.95);
        fillLight.position.set(2.5, 1.8, 3.8);
        sc.add(fillLight);

        const innerLight = new T.PointLight(elemColor, 1.4, 8);
        innerLight.position.set(0, 0.55, 0.4);
        sc.add(innerLight);

        // Ovo 3D Realista (LatheGeometry + Textura zEggTex oficial da espécie)
        const eggGroup = new T.Group();
        sc.add(eggGroup);

        const pts = [];
        const segs = 34;
        for (let i = 0; i <= segs; i++) {
            const u = i / segs, th = u * Math.PI;
            const y = -Math.cos(th) * 0.92;
            const rad = Math.sin(th) * (0.64 + 0.14 * Math.cos(th));
            pts.push(new T.Vector2(Math.max(0.001, rad), y));
        }
        const eggGeo = new T.LatheGeometry(pts, 44);
        let eggMap = null;
        try { eggMap = zEggTex(sp.id); } catch (e) {}
        const eggMat = new T.MeshStandardMaterial({
            map: eggMap || null,
            color: eggMap ? 0xffffff : elemColor.clone().lerp(new T.Color('#ffffff'), 0.18),
            roughness: 0.28,
            metalness: 0.14,
            emissive: elemColor,
            emissiveIntensity: 0.14
        });
        const eggMesh = new T.Mesh(eggGeo, eggMat);
        eggGroup.add(eggMesh);
        eggGroup.position.set(0, 0.56, 0);

        // Overlay luminoso de fissuras elétricas/arcanas no ovo (textura orgánica de rachaduras, sem wireframe)
        let crackTexMap = null;
        try { crackTexMap = zCrackTex(3); } catch (e) {}
        const crackMat = new T.MeshBasicMaterial({
            map: crackTexMap || null,
            color: crackTexMap ? 0xffffff : elemColor,
            transparent: true,
            opacity: 0,
            depthWrite: false,
            blending: T.AdditiveBlending
        });
        const crackMesh = new T.Mesh(new T.LatheGeometry(pts, 36), crackMat);
        crackMesh.scale.setScalar(1.016);
        eggGroup.add(crackMesh);

        // 30 Estilhaços 3D na explosão (encolhem e desaparecem após 0.85s)
        const shards = [];
        const shardMat = new T.MeshStandardMaterial({
            color: elemColor,
            roughness: 0.3,
            metalness: 0.22,
            emissive: elemColor,
            emissiveIntensity: 0.55,
            side: T.DoubleSide
        });
        for (let i = 0; i < 30; i++) {
            const sm = new T.Mesh(new T.OctahedronGeometry(0.09 + Math.random() * 0.1, 0), shardMat);
            sm.visible = false;
            sc.add(sm);
            shards.push({ m: sm, vx: 0, vy: 0, vz: 0, rx: 0, ry: 0, life: 0 });
        }

        // Dragão 3D Grande (sem círculo ou base embaixo, centralizado na câmara esquerda após eclosão)
        const dragonWrap = new T.Group();
        const dragonHolder = new T.Group();
        dragonWrap.add(dragonHolder);
        sc.add(dragonWrap);

        let B = null;
        let normScale = 0.85;
        let centerYOff = 0;
        const mountDragon = () => {
            try {
                while (dragonHolder.children.length) dragonHolder.remove(dragonHolder.children[0]);
                dragonHolder.scale.setScalar(1);
                dragonHolder.position.set(0, 0, 0);
                B = zBuild(sp, true, 1);
                // Remover absolutamente todo círculo/sombra/disco/aura de chão sob o dragão
                ['shadow', 'plate', 'halo', 'aura', 'beacon'].forEach(k => { if (B[k]) B[k].visible = false; });
                B.g.traverse(o => {
                    if (o.isMesh && o.geometry && (o.geometry.type === 'RingGeometry' || o.geometry.type === 'CircleGeometry')) {
                        o.visible = false;
                    }
                });
                // Medir B.g ANTES de adicionar ao dragonWrap (evita multiplicar pela escala 0.001 de emergência)
                if (B.mixer) B.mixer.update(0.05);
                B.g.updateMatrixWorld(true);
                const bx = (typeof zPosedBox === 'function') ? zPosedBox(B.g) : new T.Box3().setFromObject(B.g);
                const bsz = bx.getSize(new T.Vector3()), bct = bx.getCenter(new T.Vector3());
                const maxDim = Math.max(bsz.x, bsz.y, bsz.z, 0.4);
                normScale = 1.68 / maxDim;
                dragonHolder.add(B.g);
                dragonHolder.scale.setScalar(normScale);
                dragonHolder.position.set(-bct.x * normScale, -bct.y * normScale, -bct.z * normScale);
                centerYOff = 0;
                if (typeof H3D !== 'undefined' && H3D) H3D.B = B;
                if (B && B.model && m.isConnected) {
                    try {
                        const port = m.querySelector('.dk-portrait');
                        if (port) port.innerHTML = zImg(sp.id);
                    } catch (e2) {}
                }
            } catch (e) {
                console.warn('hatch 3d dragon build', e);
            }
        };
        mountDragon();
        try {
            const Dm = ZMD[sp.id];
            if (Dm && Dm.f && !zModelOk(Dm.f) && typeof clModelLoad === 'function') {
                clModelLoad(Dm.f).then(() => {
                    if (ZOO.hatch3d && ZOO.hatch3d === H3D && m.isConnected) mountDragon();
                }).catch(() => {});
            }
        } catch (e) {}
        dragonWrap.position.set(0, 0.56, 0.15);
        dragonWrap.scale.setScalar(0.001);
        dragonWrap.visible = false;

        // Estado 2D VFX (raios elétricos, ondas de choque, faíscas, fumaça e círculo mágico em perspectiva à esquerda)
        const fx2d = {
            ctx: cv2d ? cv2d.getContext('2d') : null,
            bolts: [],
            waves: [],
            sparks: [],
            smokes: [],
            flash: 0,
            circleAlpha: 0,
            circleAngle: 0,
            nextAmbientBolt: 0.35
        };

        const sync2DSize = () => {
            w = m.clientWidth || window.innerWidth;
            h = m.clientHeight || window.innerHeight;
            r.setSize(w, h, false);
            cam.aspect = w / Math.max(1, h);
            cam.updateProjectionMatrix();
            if (cv2d) {
                const dpr = Math.min(window.devicePixelRatio || 1, 2);
                cv2d.width = Math.max(1, Math.round(w * dpr));
                cv2d.height = Math.max(1, Math.round(h * dpr));
                if (fx2d.ctx) fx2d.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            }
        };
        sync2DSize();
        const onResize = () => { if (m.isConnected) sync2DSize(); };
        window.addEventListener('resize', onResize);

        function addBranchBolt(x1, y1, x2, y2, col, width, life, allowBranch) {
            const ptsB = [{ x: x1, y: y1 }], steps = 9;
            const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
            const nx = -dy / len, ny = dx / len;
            for (let i = 1; i < steps; i++) {
                const u = i / steps, spread = Math.sin(u * Math.PI) * Math.min(48, len * 0.22);
                const off = (Math.random() - 0.5) * 2 * spread;
                const px = x1 + dx * u + nx * off, py = y1 + dy * u + ny * off;
                ptsB.push({ x: px, y: py });
                if (allowBranch && Math.random() < 0.35) {
                    const ang = Math.atan2(dy, dx) + (Math.random() < 0.5 ? 0.55 : -0.55);
                    const bl = len * (0.28 + Math.random() * 0.25);
                    addBranchBolt(px, py, px + Math.cos(ang) * bl, py + Math.sin(ang) * bl, col, width * 0.55, life * 0.85, false);
                }
            }
            ptsB.push({ x: x2, y: y2 });
            fx2d.bolts.push({ pts: ptsB, col, width, life, maxLife: life });
        }

        function triggerBoltBurst(cx, cy, count, radius, col) {
            for (let i = 0; i < count; i++) {
                const a = Math.random() * Math.PI * 2;
                const d1 = 18 + Math.random() * 28, d2 = radius * (0.7 + Math.random() * 0.65);
                addBranchBolt(cx + Math.cos(a) * d1, cy + Math.sin(a) * d1, cx + Math.cos(a) * d2, cy + Math.sin(a) * d2, col, 3.2 + Math.random() * 2, 0.26 + Math.random() * 0.16, true);
            }
            fx2d.waves.push({ x: cx, y: cy, r: 16, maxR: radius * 1.15, col, life: 0, maxLife: 0.45 });
            for (let i = 0; i < 18; i++) {
                const a = Math.random() * Math.PI * 2, spd = 90 + Math.random() * 260;
                fx2d.sparks.push({ x: cx, y: cy, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, r: 2 + Math.random() * 2.5, col, life: 0, maxLife: 0.42 + Math.random() * 0.3 });
            }
            for (let i = 0; i < 6; i++) {
                const a = Math.random() * Math.PI * 2, spd = 25 + Math.random() * 55;
                fx2d.smokes.push({ x: cx + Math.cos(a) * 18, y: cy + Math.sin(a) * 18, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd - 20, r: 18 + Math.random() * 18, col, life: 0, maxLife: 0.75 });
            }
            fx2d.flash = Math.max(fx2d.flash, 0.55);
        }

        const H3D = {
            r, sc, cam, cv, m, st, sp, R, E, colHex,
            eggGroup, eggMesh, crackMat, innerLight,
            shards, dragonWrap, dragonHolder, B, normScale, centerYOff,
            fx2d, triggerBoltBurst,
            wobble: 0,
            explode: false,
            dragonRise: 0,
            t: 0,
            last: performance.now(),
            id: 0,
            cardFxId: 0,
            cleaned: false,
            cleanup: () => {
                window.removeEventListener('resize', onResize);
                try { if (H3D.cardFxId) cancelAnimationFrame(H3D.cardFxId); } catch (e) {}
            }
        };
        ZOO.hatch3d = H3D;

        function drawMagicCircle2D(ctx, cx, cy, rad, rot, alpha, col) {
            if (alpha <= 0.01) return;
            // Halo de portal profundo deslocado ligeiramente para trás/esquerda (profundidade 3D)
            ctx.save();
            ctx.translate(cx - rad * 0.14, cy + rad * 0.04);
            ctx.rotate(-0.07);
            ctx.scale(0.68, 0.94);
            ctx.globalAlpha = alpha * 0.34;
            ctx.strokeStyle = col;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, rad * 1.18, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();

            // Círculo principal em perspectiva 3D inclinado para a direita
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(-0.07);
            ctx.scale(0.76, 1.0);
            ctx.globalCompositeOperation = 'lighter';

            const bg = ctx.createRadialGradient(0, 0, rad * 0.08, 0, 0, rad * 1.25);
            bg.addColorStop(0, col + '55');
            bg.addColorStop(0.55, col + '22');
            bg.addColorStop(1, 'transparent');
            ctx.globalAlpha = alpha * 0.9;
            ctx.fillStyle = bg;
            ctx.beginPath();
            ctx.arc(0, 0, rad * 1.25, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = col;
            ctx.shadowColor = col;
            ctx.shadowBlur = 18;
            ctx.globalAlpha = alpha * 0.85;
            ctx.lineWidth = 3;
            ctx.beginPath(); ctx.arc(0, 0, rad, 0, Math.PI * 2); ctx.stroke();

            ctx.lineWidth = 1.4;
            ctx.globalAlpha = alpha * 0.6;
            ctx.beginPath(); ctx.arc(0, 0, rad * 0.86, 0, Math.PI * 2); ctx.stroke();
            ctx.beginPath(); ctx.arc(0, 0, rad * 0.56, 0, Math.PI * 2); ctx.stroke();

            // Polígono hexagrama giratório
            ctx.save();
            ctx.rotate(rot);
            ctx.globalAlpha = alpha * 0.55;
            ctx.lineWidth = 2;
            for (let tri = 0; tri < 2; tri++) {
                ctx.beginPath();
                for (let k = 0; k <= 3; k++) {
                    const a = (k * 2 * Math.PI) / 3 + tri * (Math.PI / 3);
                    const px = Math.cos(a) * rad * 0.85, py = Math.sin(a) * rad * 0.85;
                    if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
                }
                ctx.stroke();
            }
            ctx.restore();

            // Runas externas girando no sentido inverso
            ctx.save();
            ctx.rotate(-rot * 1.35);
            ctx.globalAlpha = alpha * 0.8;
            for (let i = 0; i < 16; i++) {
                const a = (i / 16) * Math.PI * 2;
                ctx.fillStyle = i % 2 === 0 ? '#fff7e6' : col;
                ctx.beginPath();
                ctx.arc(Math.cos(a) * rad * 0.93, Math.sin(a) * rad * 0.93, i % 4 === 0 ? 4 : 2.2, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
            ctx.restore();
        }

        function step2D(dt, t) {
            const ctx = fx2d.ctx;
            if (!ctx) return;
            ctx.clearRect(0, 0, w, h);

            const isNarrow = w < 900;
            const cxPortal = H3D.explode ? (isNarrow ? w * 0.5 : w * 0.32) : w * 0.5;
            const cyPortal = H3D.explode ? (isNarrow ? h * 0.33 : h * 0.52) : h * 0.52;

            // Raios volumétricos sutis de fundo
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            const beamCount = 6;
            for (let i = 0; i < beamCount; i++) {
                const bx = w * (0.14 + i * 0.14) + Math.sin(t * 0.35 + i) * 28;
                const grad = ctx.createLinearGradient(bx, 0, bx - 70, h);
                grad.addColorStop(0, colHex + '16');
                grad.addColorStop(0.65, colHex + '06');
                grad.addColorStop(1, 'transparent');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.moveTo(bx - 35, 0); ctx.lineTo(bx + 35, 0);
                ctx.lineTo(bx + 110, h); ctx.lineTo(bx - 130, h);
                ctx.closePath();
                ctx.fill();
            }
            ctx.restore();

            // Raios elétricos ambientes no ovo enquanto fissurado
            if (!H3D.explode && st.cracks > 0) {
                fx2d.nextAmbientBolt -= dt;
                if (fx2d.nextAmbientBolt <= 0) {
                    fx2d.nextAmbientBolt = st.cracks >= 2 ? (0.12 + Math.random() * 0.18) : (0.35 + Math.random() * 0.3);
                    const a = Math.random() * Math.PI * 2, rad = 95 + st.cracks * 55;
                    addBranchBolt(cxPortal + Math.cos(a) * 20, cyPortal + Math.sin(a) * 20, cxPortal + Math.cos(a) * rad, cyPortal + Math.sin(a) * rad, colHex, 2.5, 0.2, true);
                }
            }

            // Círculo Mágico em perspectiva atrás do dragão na esquerda
            if (H3D.explode) {
                fx2d.circleAlpha = Math.min(1, fx2d.circleAlpha + dt * 1.45);
                fx2d.circleAngle += dt * 0.42;
                const magRad = isNarrow ? Math.min(w, h) * 0.32 : Math.min(w * 0.25, h * 0.42);
                drawMagicCircle2D(ctx, cxPortal, cyPortal, magRad, fx2d.circleAngle, fx2d.circleAlpha, colHex);
            }

            // Ondas de choque
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            for (let i = fx2d.waves.length - 1; i >= 0; i--) {
                const wv = fx2d.waves[i];
                wv.life += dt;
                const u = wv.life / wv.maxLife;
                if (u >= 1) { fx2d.waves.splice(i, 1); continue; }
                const rr = wv.r + (wv.maxR - wv.r) * (1 - Math.pow(1 - u, 3));
                ctx.globalAlpha = (1 - u) * 0.85;
                ctx.strokeStyle = wv.col;
                ctx.lineWidth = (1 - u) * 7 + 1;
                ctx.beginPath(); ctx.arc(wv.x, wv.y, rr, 0, Math.PI * 2); ctx.stroke();
            }

            // Fumaça
            for (let i = fx2d.smokes.length - 1; i >= 0; i--) {
                const s0 = fx2d.smokes[i];
                s0.life += dt;
                const u = s0.life / s0.maxLife;
                if (u >= 1) { fx2d.smokes.splice(i, 1); continue; }
                s0.x += s0.vx * dt; s0.y += s0.vy * dt;
                const gr = ctx.createRadialGradient(s0.x, s0.y, 1, s0.x, s0.y, s0.r * (1 + u * 0.9));
                gr.addColorStop(0, s0.col + '35');
                gr.addColorStop(1, 'transparent');
                ctx.globalAlpha = (1 - u) * 0.65;
                ctx.fillStyle = gr;
                ctx.beginPath(); ctx.arc(s0.x, s0.y, s0.r * (1 + u * 0.9), 0, Math.PI * 2); ctx.fill();
            }

            // Faíscas
            for (let i = fx2d.sparks.length - 1; i >= 0; i--) {
                const pk = fx2d.sparks[i];
                pk.life += dt;
                const u = pk.life / pk.maxLife;
                if (u >= 1) { fx2d.sparks.splice(i, 1); continue; }
                pk.x += pk.vx * dt; pk.y += pk.vy * dt;
                pk.vx *= 0.96; pk.vy *= 0.96;
                ctx.globalAlpha = 1 - u;
                ctx.fillStyle = '#fff';
                ctx.shadowColor = pk.col; ctx.shadowBlur = 10;
                ctx.beginPath(); ctx.arc(pk.x, pk.y, pk.r * (1 - u * 0.5), 0, Math.PI * 2); ctx.fill();
            }

            // Raios ramificados
            ctx.lineCap = 'round'; ctx.lineJoin = 'round';
            for (let i = fx2d.bolts.length - 1; i >= 0; i--) {
                const b = fx2d.bolts[i];
                b.life -= dt;
                if (b.life <= 0) { fx2d.bolts.splice(i, 1); continue; }
                const a = Math.max(0, b.life / b.maxLife);
                ctx.globalAlpha = a;
                ctx.shadowColor = b.col; ctx.shadowBlur = 18;
                ctx.strokeStyle = b.col; ctx.lineWidth = b.width;
                ctx.beginPath();
                b.pts.forEach((p, idx) => { if (idx === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); });
                ctx.stroke();
                ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(1.2, b.width * 0.36);
                ctx.stroke();
            }

            // Clarão de impacto
            if (fx2d.flash > 0.01) {
                fx2d.flash = Math.max(0, fx2d.flash - dt * 3.4);
                const fl = ctx.createRadialGradient(cxPortal, cyPortal, 0, cxPortal, cyPortal, Math.max(w, h) * 0.45);
                fl.addColorStop(0, 'rgba(255,255,255,' + (fx2d.flash * 0.55) + ')');
                fl.addColorStop(0.35, colHex + Math.round(fx2d.flash * 100).toString(16).padStart(2, '0'));
                fl.addColorStop(1, 'transparent');
                ctx.globalAlpha = 1;
                ctx.fillStyle = fl;
                ctx.fillRect(0, 0, w, h);
            }
            ctx.restore();
        }

        // Loop principal 3D + 2D
        const loop = now => {
            if (!ZOO.hatch3d || ZOO.hatch3d !== H3D || !m.isConnected) {
                if (!H3D.cleaned) { H3D.cleaned = true; H3D.cleanup(); }
                return;
            }
            H3D.id = requestAnimationFrame(loop);
            const dt = Math.min(0.05, (now - H3D.last) / 1000 || 0.016);
            H3D.last = now;
            H3D.t += dt;
            const t = H3D.t;

            step2D(dt, t);

            // Física & oscilação do ovo
            if (!H3D.explode) {
                if (H3D.wobble > 0) {
                    H3D.wobble = Math.max(0, H3D.wobble - dt * 2.2);
                    const freq = st.cracks >= 2 ? 42 : 24;
                    eggGroup.rotation.z = Math.sin(t * freq) * 0.24 * H3D.wobble;
                    eggGroup.rotation.x = Math.cos(t * freq * 0.8) * 0.16 * H3D.wobble;
                } else {
                    eggGroup.rotation.z = Math.sin(t * 1.8) * 0.035;
                    eggGroup.rotation.x = Math.cos(t * 1.4) * 0.025;
                    eggGroup.rotation.y += dt * 0.28;
                    eggGroup.position.y = 0.56 + Math.sin(t * 2.4) * 0.03;
                }
                if (st.cracks === 1) {
                    crackMat.opacity = 0.65;
                    innerLight.intensity = 2.4 + 0.9 * Math.sin(t * 8);
                    eggMat.emissiveIntensity = 0.35 + 0.15 * Math.sin(t * 8);
                } else if (st.cracks >= 2) {
                    crackMat.opacity = 0.95;
                    innerLight.intensity = 5.2 + 2.2 * Math.sin(t * 18);
                    eggMat.emissiveIntensity = 0.78 + 0.32 * Math.sin(t * 18);
                }
            } else {
                // Estilhaços físicos na explosão (dissipam antes do card entrar)
                shards.forEach(sh => {
                    if (sh.m.visible) {
                        sh.life = (sh.life || 0) + dt;
                        sh.m.position.x += sh.vx * dt;
                        sh.m.position.y += sh.vy * dt;
                        sh.m.position.z += sh.vz * dt;
                        sh.vy -= 9.5 * dt;
                        sh.m.rotation.x += sh.rx * dt;
                        sh.m.rotation.y += sh.ry * dt;
                        const sFade = Math.max(0.001, 1 - sh.life / 0.55);
                        sh.m.scale.setScalar(sFade);
                        if (sh.life >= 0.55 || sh.m.position.y < -2.2) sh.m.visible = false;
                    }
                });

                // Posicionamento Duo Hero: Dragão GRANDE à esquerda, virado 3/4 para a direita (para a carta)
                const isNarrow = w < 900 && h > w;
                const distCam = 5.0;
                const halfH = Math.tan(THREE_DEG2RAD_SAFE(cam.fov * 0.5)) * distCam;
                const halfW = halfH * cam.aspect;
                const targetX = isNarrow ? 0 : (-0.39 * halfW);
                const targetY = isNarrow ? 0.86 : 0.48;
                const targetScale = isNarrow ? 0.80 : 0.92;

                if (H3D.dragonRise < 1) {
                    H3D.dragonRise = Math.min(1, H3D.dragonRise + dt * 1.25);
                }
                const prog = H3D.dragonRise;
                const spring = prog < 0.72 ? (prog / 0.72) * 1.07 : 1.07 - 0.07 * ((prog - 0.72) / 0.28);
                dragonWrap.visible = true;
                dragonWrap.scale.setScalar(Math.max(0.001, targetScale * spring));
                dragonWrap.position.x += (targetX - dragonWrap.position.x) * Math.min(1, dt * 8);
                dragonWrap.position.y = targetY + Math.sin(t * 2.1) * 0.055;
                dragonWrap.position.z = 0.15;

                // Orientação 3/4 frente-direita (todas as espécies têm frente em +X -> -PI/2 olha pra câmera, -1.06 olha pra direita-frente)
                dragonWrap.rotation.y = -1.06 + Math.sin(t * 0.65) * 0.16;

                if (B && B.mixer) B.mixer.update(dt);
                if (B && B.fxStep) B.fxStep(t, dt);
                if (B && B.P && B.P.wings) {
                    B.P.wings.forEach(wg => {
                        wg.g.rotation.x = wg.sd * (0.45 + 0.35 * Math.sin(t * 9));
                    });
                }
            }

            cam.position.x = Math.sin(t * 0.35) * 0.14;
            cam.position.y = 1.35 + Math.cos(t * 0.45) * 0.05;
            cam.lookAt(0, 0.58, 0);

            r.render(sc, cam);
        };
        function THREE_DEG2RAD_SAFE(d) { return d * 0.017453292519943295; }
        H3D.id = requestAnimationFrame(loop);
    }

    function zHatchStartDuoCardFx(m, H3D) {
        const right = m.querySelector('.ritual-duo-right');
        const stage = m.querySelector('.ritual-card-stage');
        const tiltEl = m.querySelector('.ritual-card-tilt');
        const glare = m.querySelector('.card-holo-glare');
        const cv = m.querySelector('.ritual-card-fx');
        if (!right || !stage || !tiltEl || !cv) return;

        // Interatividade 3D Tilt + Brilho Especular Holográfico ao passar o mouse na carta
        const baseRy = -18, baseRx = 3;
        stage.addEventListener('mousemove', ev => {
            const rect = stage.getBoundingClientRect();
            const px = Math.max(0, Math.min(1, (ev.clientX - rect.left) / Math.max(1, rect.width)));
            const py = Math.max(0, Math.min(1, (ev.clientY - rect.top) / Math.max(1, rect.height)));
            const ry = baseRy + (px - 0.5) * 24;
            const rx = baseRx - (py - 0.5) * 18;
            tiltEl.classList.add('hovering');
            tiltEl.style.transform = 'rotateY(' + ry.toFixed(2) + 'deg) rotateX(' + rx.toFixed(2) + 'deg) scale(1.04)';
            if (glare) {
                glare.style.opacity = '1';
                glare.style.background = 'radial-gradient(circle at ' + (px * 100).toFixed(1) + '% ' + (py * 100).toFixed(1) + '%, rgba(255,255,255,.34) 0%, ' + H3D.colHex + '33 34%, transparent 68%)';
            }
        });
        stage.addEventListener('mouseleave', () => {
            tiltEl.classList.remove('hovering');
            tiltEl.style.transform = 'rotateY(' + baseRy + 'deg) rotateX(' + baseRx + 'deg)';
            if (glare) glare.style.opacity = '0';
        });

        // Canvas 2D de partículas/faíscas na borda da carta inclinada em tempo real
        const slot = stage.querySelector('.dk-slot');
        const rk = slot ? (+slot.dataset.rk || 0) : (H3D.sp.rk | 0);
        const colMap = ['#cbd5e1', '#4ade80', '#38bdf8', '#e879f9', '#fbbf24'][rk] || '#fbbf24';
        const embers = [];
        const ctx = cv.getContext('2d');
        const ptRR = (x, y, ww, hh, r, t) => {
            const sw = Math.max(0, ww - 2 * r), sh = Math.max(0, hh - 2 * r), arc = Math.PI * 0.5 * r, perim = 2 * sw + 2 * sh + 4 * arc;
            let d = ((t % 1) + 1) % 1 * perim;
            if (d < sw) return { x: x + r + d, y, nx: 0, ny: -1 }; d -= sw;
            if (d < arc) { const a = -Math.PI / 2 + (d / arc) * (Math.PI / 2); return { x: x + ww - r + Math.cos(a) * r, y: y + r + Math.sin(a) * r, nx: Math.cos(a), ny: Math.sin(a) }; } d -= arc;
            if (d < sh) return { x: x + ww, y: y + r + d, nx: 1, ny: 0 }; d -= sh;
            if (d < arc) { const a = (d / arc) * (Math.PI / 2); return { x: x + ww - r + Math.cos(a) * r, y: y + hh - r + Math.sin(a) * r, nx: Math.cos(a), ny: Math.sin(a) }; } d -= arc;
            if (d < sw) return { x: x + ww - r - d, y: y + hh, nx: 0, ny: 1 }; d -= sw;
            if (d < arc) { const a = Math.PI / 2 + (d / arc) * (Math.PI / 2); return { x: x + r + Math.cos(a) * r, y: y + hh - r + Math.sin(a) * r, nx: Math.cos(a), ny: Math.sin(a) }; } d -= arc;
            if (d < sh) return { x, y: y + hh - r - d, nx: -1, ny: 0 }; d -= sh;
            const a = Math.PI + (d / Math.max(1, arc)) * (Math.PI / 2);
            return { x: x + r + Math.cos(a) * r, y: y + r + Math.sin(a) * r, nx: Math.cos(a), ny: Math.sin(a) };
        };

        let lastT = performance.now();
        const fxTick = now => {
            if (!ZOO.hatch3d || ZOO.hatch3d !== H3D || !stage.isConnected) return;
            H3D.cardFxId = requestAnimationFrame(fxTick);
            const dt = Math.min(0.05, (now - lastT) / 1000 || 0.016);
            lastT = now;

            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const cw = cv.clientWidth || 320, ch = cv.clientHeight || 420;
            if (Math.abs(cv.width - Math.round(cw * dpr)) > 3 || Math.abs(cv.height - Math.round(ch * dpr)) > 3) {
                cv.width = Math.max(100, Math.round(cw * dpr));
                cv.height = Math.max(100, Math.round(ch * dpr));
            }
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, cw, ch);
            ctx.globalCompositeOperation = 'lighter';

            const pad = 40, bx = pad, by = pad, bw = Math.max(40, cw - pad * 2), bh = Math.max(60, ch - pad * 2);
            const spawnRate = 0.25 + rk * 0.16;
            if (Math.random() < spawnRate) {
                const p = ptRR(bx, by, bw, bh, 18, Math.random());
                embers.push({ x: p.x, y: p.y, vx: p.nx * (18 + rk * 6) + (Math.random() - 0.5) * 16, vy: p.ny * (18 + rk * 6) - 18 - Math.random() * 20, r: 1.8 + Math.random() * 2.2, life: 0, max: 0.45 + Math.random() * 0.35 });
            }
            for (let i = embers.length - 1; i >= 0; i--) {
                const e = embers[i];
                e.life += dt;
                const u = e.life / e.max;
                if (u >= 1) { embers.splice(i, 1); continue; }
                e.x += e.vx * dt; e.y += e.vy * dt;
                ctx.globalAlpha = 1 - u;
                ctx.fillStyle = u < 0.35 ? '#ffffff' : colMap;
                ctx.shadowColor = colMap; ctx.shadowBlur = 10;
                ctx.beginPath(); ctx.arc(e.x, e.y, e.r * (1 - u * 0.45), 0, Math.PI * 2); ctx.fill();
            }
            const orb = ptRR(bx, by, bw, bh, 18, (now * 0.00032));
            const gr = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, 20 + rk * 3);
            gr.addColorStop(0, 'rgba(255,255,255,.95)');
            gr.addColorStop(0.4, colMap);
            gr.addColorStop(1, 'transparent');
            ctx.globalAlpha = 0.9;
            ctx.fillStyle = gr;
            ctx.beginPath(); ctx.arc(orb.x, orb.y, 20 + rk * 3, 0, Math.PI * 2); ctx.fill();
        };
        H3D.cardFxId = requestAnimationFrame(fxTick);
    }

    function zRitualTap() {
        if (!ZOO.hatchState) return;
        const st = ZOO.hatchState;
        const H3D = ZOO.hatch3d;
        if (!H3D || H3D.explode) return;

        st.cracks = (st.cracks || 0) + 1;
        const m = H3D.m;
        const mw = (m && m.clientWidth) || window.innerWidth, mh = (m && m.clientHeight) || window.innerHeight;

        if (st.cracks === 1) {
            H3D.wobble = 1.05;
            H3D.triggerBoltBurst(mw * 0.5, mh * 0.52, 6, 220, H3D.colHex);
            try { aliveSound('tick'); clFarmBuzz(25); clDoTraumaShake(0.5); } catch (e) {}
            if (m) {
                const d1 = m.querySelector('.dot.d1'); if (d1) d1.classList.add('on');
                const sub = m.querySelector('.prompt-sub');
                if (sub) sub.textContent = '✦ A casca estremeceu! A criatura acordou lá dentro... Toque de novo!';
            }
        } else if (st.cracks === 2) {
            H3D.wobble = 1.45;
            H3D.triggerBoltBurst(mw * 0.5, mh * 0.52, 10, 310, H3D.colHex);
            try { aliveSound('chirp'); clFarmBuzz([25, 50]); clDoTraumaShake(0.95); } catch (e) {}
            if (m) {
                const d2 = m.querySelector('.dot.d2'); if (d2) d2.classList.add('on');
                const sub = m.querySelector('.prompt-sub');
                if (sub) sub.textContent = '✦ FISSURAS LUMINOSAS! O poder elemental está prestes a explodir!';
            }
        } else if (st.cracks >= 3) {
            st.cracks = 3;
            H3D.explode = true;
            H3D.eggMesh.visible = false;
            H3D.crackMat.opacity = 0;
            H3D.triggerBoltBurst(mw * 0.5, mh * 0.52, 18, 460, H3D.colHex);

            H3D.shards.forEach(sh => {
                sh.life = 0;
                sh.m.scale.setScalar(1);
                sh.m.visible = true;
                sh.m.position.set(
                    (Math.random() - 0.5) * 0.55,
                    0.56 + (Math.random() - 0.5) * 0.55,
                    (Math.random() - 0.5) * 0.55
                );
                const spd = 2.6 + Math.random() * 3.4;
                const ang = Math.random() * Math.PI * 2;
                sh.vx = Math.cos(ang) * spd;
                sh.vy = 2.8 + Math.random() * 4.4;
                sh.vz = Math.sin(ang) * spd;
                sh.rx = (Math.random() - 0.5) * 16;
                sh.ry = (Math.random() - 0.5) * 16;
            });

            if (H3D.B && H3D.B.act) {
                if (H3D.B.act.fly) { H3D.B.act.fly.reset().play(); H3D.B.act.cur = H3D.B.act.fly; }
                else if (H3D.B.act.idle) { H3D.B.act.idle.reset().play(); H3D.B.act.cur = H3D.B.act.idle; }
            }

            try {
                clDoHitStop(matchMedia('(pointer: coarse)').matches ? 25 : 60);
                clDoTraumaShake(1.25);
                aliveSound('upgrade');
                clFarmBuzz([35, 90, 60, 120]);
            } catch (e) {}

            if (m) {
                const d3 = m.querySelector('.dot.d3'); if (d3) d3.classList.add('on');
                const topHud = m.querySelector('.ritual-top-hud');
                if (topHud) {
                    topHud.style.opacity = '0';
                    setTimeout(() => topHud.remove(), 500);
                }
                const touchLayer = m.querySelector('.ritual-touch-layer');
                if (touchLayer) touchLayer.remove();

                setTimeout(() => {
                    if (!ZOO.hatch3d || ZOO.hatch3d !== H3D || !m.isConnected) return;
                    const head = m.querySelector('.ritual-reveal-head');
                    const duoRight = m.querySelector('.ritual-duo-right');
                    if (head) head.classList.add('show');
                    if (duoRight) {
                        duoRight.classList.add('show');
                        zHatchStartDuoCardFx(m, H3D);
                    }
                }, 900);
            }
        }
    }

    window.zTestHatch = function(spId) {
        const pool = ['demonio_cinzas', 'colosso_obsidiana', 'arquimago_astral', 'crono_engenheiro', 'sereia_glacial', 'guardiao_botanico', 'morcego_noturno', 'vulcao', 'eclipse'];
        const chosen = spId || pool[Math.floor(Math.random() * pool.length)];
        zStartHatchRitual(null, chosen);
    };
    function zDragonPower(sp, a) {
        if (!sp) return 0;
        const rk = sp.rk || 0;
        const lv = a ? zAL(a) : 1;
        const xp = a ? (a.xp || 0) : 0;
        const star = a ? zStar(a) : 0;
        const baseAtk = ZG[rk] * 8;
        const lvPower = lv * 180 + Math.floor(xp * 0.4);
        const rkBonus = rk * 650;
        return Math.round((baseAtk + lvPower + rkBonus) * (1 + 0.08 * star) + star * 220);
    }

    function zBkPages() {
        const s = clS(), z = clZooS(s), lay = clZooLayout(s), lv = lay.lv || 1;
        const P = [];

        // Dragões ativos ordenados estritamente pelos mais fortes primeiro
        const myDragonsSorted = (z.an || []).slice().sort((x, y) => {
            const spX = zsp(x.sp), spY = zsp(y.sp);
            return zDragonPower(spY, y) - zDragonPower(spX, x) || zAL(y) - zAL(x);
        });

        // Instância e espécie ativa selecionada
        let curAnimal = null;
        if (ZOO.anId) curAnimal = (z.an || []).find(a => a.id === ZOO.anId);
        if (!curAnimal && ZOO.bsp) curAnimal = (z.an || []).find(a => a.sp === ZOO.bsp);
        if (!curAnimal && myDragonsSorted.length) curAnimal = myDragonsSorted[0];
        const curSp = curAnimal ? zsp(curAnimal.sp) : (ZOO.bsp ? zsp(ZOO.bsp) : ZSP[0]);
        if (curAnimal) ZOO.anId = curAnimal.id;
        if (curSp) ZOO.bsp = curSp.id;

        // Capítulo I: Grimório dos Campeões (Dragões Ativos, Mais Fortes Primeiro)
        {
            const topAnimal = curAnimal || myDragonsSorted[0] || null;
            const topSp = topAnimal ? zsp(topAnimal.sp) : curSp;
            P.push({
                k: 'altar',
                sec: 'champions',
                t: 'Grimório dos Campeões',
                sub: topAnimal ? ('Nv ' + zAL(topAnimal) + ' · ⚡ ' + zDragonPower(topSp, topAnimal) + ' CP') : 'Altar de Honra',
                ic: 'ph-crown',
                col: '#ffd700',
                spId: topSp.id,
                sp: topSp,
                own: topAnimal,
                aid: topAnimal ? topAnimal.id : null
            });
            P.push({
                k: 'champions',
                sec: 'champions',
                t: 'Seus Dragões Campeões',
                sub: (z.an ? z.an.length : 0) + ' dragões ativos · mais fortes primeiro',
                ic: 'ph-shield-star',
                col: '#ffd700',
                list: myDragonsSorted
            });
        }

        // Capítulos II-V: Linhagens Elementais (Mais fortes e raros primeiro)
        const elements = [
            ['terra', 'Linhagem da Terra', 'ph-leaf', '#3ea850'],
            ['agua', 'Linhagem da Água', 'ph-drop', '#2e86de'],
            ['cristal', 'Linhagem de Cristal', 'ph-diamond', '#8e44ad'],
            ['estelar', 'Linhagem Estelar', 'ph-star', '#f39c12']
        ];

        elements.forEach(el => {
            const elKey = el[0], elTitle = el[1], elIcon = el[2], elCol = el[3];
            // Ordenação: Maior raridade e força primeiro (b.rk - a.rk)
            const list = ZSP.filter(x => x.el === elKey).sort((a, b) => b.rk - a.rk || ZG[b.rk] - ZG[a.rk]);
            let elCurSp = list[0];
            if (ZOO.bsp) {
                const found = list.find(x => x.id === ZOO.bsp);
                if (found) elCurSp = found;
            }
            const ownList = (z.an || []).filter(a => a.sp === elCurSp.id).sort((x, y) => zAL(y) - zAL(x) || (y.xp || 0) - (x.xp || 0));
            let elOwn = (ZOO.anId && ownList.find(a => a.id === ZOO.anId)) || ownList[0] || null;

            P.push({
                k: 'altar',
                sec: elKey,
                t: elTitle,
                sub: 'Altar de Linhagem',
                ic: elIcon,
                col: elCol,
                spId: elCurSp.id,
                sp: elCurSp,
                own: elOwn,
                aid: elOwn ? elOwn.id : null
            });

            P.push({
                k: 'cards',
                sec: elKey,
                t: elTitle,
                sub: list.filter(x => z.book[x.id]).length + '/' + list.length + ' descobertos',
                ic: elIcon,
                col: elCol,
                list: list
            });
        });

        // Capítulo VI: Ninhos & Ovos (Chocagem e Cruzamentos puros)
        {
            const hatchSp = (z.eggs && z.eggs[0]) ? zsp(z.eggs[0].sp) : (zsp('prisma') || ZSP[0]);
            P.push({
                k: 'altar',
                sec: 'eggs',
                t: 'Ninho dos Dragões',
                sub: 'Altar de Incubação',
                ic: 'ph-egg',
                col: '#e67e22',
                spId: hatchSp.id,
                sp: hatchSp
            });
            P.push({
                k: 'eggs',
                sec: 'eggs',
                t: 'Chocagem & Ritos',
                sub: (z.eggs ? z.eggs.length : 0) + ' ovos em incubação',
                ic: 'ph-egg',
                col: '#e67e22'
            });
        }

        // Capítulo VII: Provas Elementais & Combate
        {
            let dSp = ZSP[0];
            if (myDragonsSorted.length) dSp = zsp(myDragonsSorted[0].sp);
            P.push({
                k: 'altar',
                sec: 'duel',
                t: 'Duelo de Combate',
                sub: 'Campeão dos Duelos',
                ic: 'ph-sword',
                col: '#c0392b',
                spId: dSp.id,
                sp: dSp,
                own: myDragonsSorted[0] || null
            });
            P.push({
                k: 'duel_towers',
                sec: 'duel',
                t: 'Provas Elementais',
                sub: Object.keys(z.towers || {}).length + '/' + ZTOWERS.length + ' torres vencidas',
                ic: 'ph-shield-checkered',
                col: '#c0392b'
            });
        }

        // Capítulo VIII: Feitos Dracônicos
        {
            const guardianSp = zsp('vigia') || ZSP[0];
            P.push({
                k: 'altar',
                sec: 'ach',
                t: 'Livro de Feitos',
                sub: 'Guardião dos Feitos',
                ic: 'ph-trophy',
                col: '#d35400',
                spId: guardianSp.id,
                sp: guardianSp
            });
            P.push({
                k: 'ach',
                sec: 'ach',
                t: 'Conquistas Dracônicas',
                sub: 'Feitos Arcanos',
                ic: 'ph-trophy',
                col: '#d35400'
            });
        }

        P.forEach((p, i) => { p.i = i; });
        return P;
    }

    /* HTML do Altar 3D na Página Esquerda */
    function zBkAltarHTML(p) {
        const sp = p.sp || zsp(p.spId) || ZSP[0];
        const R = ZR[sp.rk], E = ZEL[sp.el];
        const s = clS(), z = clZooS(s), lay = clZooLayout(s), lv = lay.lv || 1;

        // Lista de todos os dragões que o jogador possui desta espécie (ordenados do mais forte ao mais fraco)
        const ownList = (z.an || []).filter(a => a.sp === sp.id).sort((x, y) => zDragonPower(sp, y) - zDragonPower(sp, x) || zAL(y) - zAL(x) || x.id - y.id);

        // Seleciona a instância individual correspondente
        let ownAnimal = null;
        if (p.aid) ownAnimal = ownList.find(a => a.id === p.aid);
        if (!ownAnimal && ZOO.anId) ownAnimal = ownList.find(a => a.id === ZOO.anId);
        if (!ownAnimal && ownList.length) ownAnimal = ownList[0];
        if (ownAnimal) ZOO.anId = ownAnimal.id;

        const got = !!z.book[sp.id];
        const anLv = ownAnimal ? zAL(ownAnimal) : 1;
        const anStar = ownAnimal ? zStar(ownAnimal) : 0;
        const curXp = ownAnimal ? (ownAnimal.xp || 0) : 0;
        const maxed = anLv >= ZMAXLV;
        const needXp = maxed ? 0 : zXpNeed(anLv + 1, sp.rk);
        const prevXp = anLv > 1 ? zXpNeed(anLv, sp.rk) : 0;
        const xpProgress = maxed ? 1 : Math.max(0, Math.min(1, (curXp - prevXp) / Math.max(1, needXp - prevXp)));
        const y = zYield(sp.rk, lv, anLv, anStar);
        const cp = zDragonPower(sp, ownAnimal);

        let h = '<div class="cl-bk-altar" style="--c:' + R.col + ';--e:' + E.col + '">';

        // Seletor de Dragões Repetidos (Permite gerenciar cada dragão repetido separadamente!)
        if (ownList.length > 1) {
            h += '<div class="cl-dup-strip">';
            h += '<span class="dup-tit"><i class="ph-bold ph-copy"></i> ' + ownList.length + ' Exemplares:</span>';
            h += '<div class="dup-btns">';
            ownList.forEach((d, idx) => {
                const isCur = ownAnimal && d.id === ownAnimal.id;
                const dst = zStar(d);
                h += '<button type="button" class="cl-dup-btn' + (isCur ? ' active' : '') + '" data-cl="zoo-pick-dup" data-aid="' + d.id + '" data-sp="' + sp.id + '">';
                h += '<span class="dnum">' + (d.nm ? esc(d.nm.slice(0, 8)) : '#' + (idx + 1)) + '</span>';
                h += '<b class="dlv tabular-nums">Nv ' + zAL(d) + (dst ? ' ★' + dst : '') + '</b>';
                h += '<small class="dcp tabular-nums">⚡' + zDragonPower(sp, d) + '</small>';
                h += '</button>';
            });
            h += '</div></div>';
        }

        // Cabeçalho da Iluminura
        const ownTitle = ownAnimal ? zDragonLabel(sp, ownAnimal, z) : sp.n;
        h += '<div class="cl-altar-header">';
        h += '<span class="cl-altar-el"><i class="ph-fill ' + E.ic + '"></i> ' + E.n + '</span>';
        h += '<div class="cl-altar-title-wrap">';
        h += '<h3 class="cl-altar-name">' + esc(ownTitle) + (anStar ? ' <em class="inst-tag">' + '★'.repeat(anStar) + '</em>' : '') + (ownAnimal ? ' <button type="button" class="cl-mini" data-cl="zoo-rename" data-id="' + ownAnimal.id + '" title="Renomear dragão" style="padding:1px 5px;font-size:.65rem;vertical-align:middle"><i class="ph-bold ph-pencil-simple"></i></button>' : '') + '</h3>';
        h += '<span class="cl-altar-cp tabular-nums">⚡ ' + cp + ' CP</span>';
        h += '</div>';
        h += '<span class="cl-altar-rar rk' + sp.rk + '">' + R.n + '</span>';
        h += '</div>';

        // Palco do Dragão 3D
        h += '<div class="cl-altar-stage">';
        h += '<div class="cl-altar-hint"><i class="ph-bold ph-arrows-clockwise"></i> Gire em 360° · Arraste para inspecionar</div>';
        h += '</div>';

        // Rodapé de Atributos, Alimentação & Evolução
        h += '<div class="cl-altar-footer">';
        if (got) {
            if (ownAnimal) {
                const fed = Math.max(0, ownAnimal.fed || 0);
                const fedCost = Math.ceil(Math.max(0, 8 - fed) * ZFEED[sp.rk]);
                const feedGainXp = Math.round(fedCost * 1.8 + 15);
                const lc = maxed ? null : zLvCost(anLv + 1, sp.rk);
                const xpReady = !maxed && zAdult(ownAnimal) && (ownAnimal.xp || 0) >= needXp;
                const canAfford = !maxed && xpReady && lc && zLvAfford(lc, sp);
                const canLv = canAfford;

                // Barras de Status: Fome e Evolução (EXP)
                h += '<div class="cl-altar-meters">';
                h += '<div class="altar-meter-row hunger">';
                h += '<div class="meter-lbl"><span><i class="ph-bold ph-bowl-food"></i> Saciamento</span><b class="tabular-nums">' + fed.toFixed(1).replace('.', ',') + ' / 12 h</b></div>';
                h += '<div class="meter-bar"><i style="width:' + Math.min(100, Math.round(fed / 12 * 100)) + '%"></i></div>';
                h += '</div>';

                h += '<div class="altar-meter-row exp">';
                h += '<div class="meter-lbl"><span><i class="ph-bold ph-lightning"></i> ' + (maxed ? 'Nível Máximo' : 'Evolução Nv ' + anLv + ' → ' + (anLv + 1)) + '</span><b class="tabular-nums">' + (maxed ? 'MAX' : Math.floor(curXp) + ' / ' + needXp + ' EXP') + '</b></div>';
                h += '<div class="meter-bar' + (curXp >= needXp && !maxed ? ' ready' : '') + '"><i style="width:' + Math.min(100, Math.round((curXp / Math.max(1, needXp)) * 100)) + '%"></i></div>';
                h += '</div>';
                h += '</div>';

                // Pílulas de Rendimento
                h += '<div class="cl-altar-stats">';
                h += '<div class="cl-stat-pill bio"><i class="ph-bold ph-grains"></i><span class="tabular-nums">+' + y.b + '/h bio</span></div>';
                if (y.c) h += '<div class="cl-stat-pill gem"><i class="ph-bold ph-diamond"></i><span class="tabular-nums">+' + y.c + '/h cr</span></div>';
                h += '<div class="cl-stat-pill bonus"><span>' + zBonusText(sp, ownAnimal) + '</span></div>';
                h += '</div>';

                // Botões de Ação Imediata
                const otherCopies = ownList.filter(d => d.id !== ownAnimal.id);
                const isTopCopy = ownList.length > 1 && ownList[0].id === ownAnimal.id;
                const fuseSrc = otherCopies.length ? (isTopCopy ? otherCopies[otherCopies.length - 1] : ownAnimal) : null;
                const fuseDst = otherCopies.length ? (isTopCopy ? ownAnimal : ownList[0]) : null;
                h += '<div class="cl-altar-actions">';
                if (maxed) {
                    h += '<button type="button" class="cl-zseal level maxed" disabled><i class="ph-bold ph-crown"></i><span><b>Nível Máximo</b><small>Nv 10 Ancião</small></span></button>';
                } else {
                    h += '<button type="button" class="cl-zseal level' + (canLv ? ' can' : '') + '" data-cl="zoo-levelup" data-id="' + ownAnimal.id + '"' + (canLv ? '' : ' disabled') + '><i class="ph-bold ' + (xpReady ? 'ph-sparkle' : 'ph-lock-simple') + '"></i><span><b>' + (xpReady ? 'Evoluir Nível ' + (anLv + 1) : 'Treino ' + Math.floor(curXp) + '/' + needXp) + '</b><small class="tabular-nums">-' + lc.b + ' bio · -' + lc.c + ' cr · -' + zFragTxt(lc, sp, 13) + '</small></span></button>';
                }
                if (fuseSrc && fuseDst) {
                    const armed = ZOO.fuseArm === fuseSrc.id;
                    h += '<button type="button" class="cl-zseal breed" data-cl="zoo-fuse" data-id="' + fuseSrc.id + '" data-dst="' + fuseDst.id + '"><i class="ph-bold ph-arrows-merge"></i><span><b>' + (armed ? 'Confirmar Fusão!' : (isTopCopy ? 'Absorver Repetido' : 'Fundir no #1')) + '</b><small>' + (armed ? 'Toque p/ fundir +1★' : '+1★ & +EXP') + '</small></span></button>';
                }
                h += '<button type="button" class="cl-zseal" data-cl="zoo-release" data-id="' + ownAnimal.id + '"><i class="ph-bold ph-hand-waving"></i><span><b>' + (ZOO.relArm === ownAnimal.id ? 'Confirmar?' : 'Soltar') + '</b><small>+' + ZREL[sp.rk] + ' bio</small></span></button>';
                h += '</div>';
            } else {
                h += '<div class="cl-altar-stats">';
                h += '<div class="cl-stat-pill"><i class="ph-bold ph-grains"></i><span class="tabular-nums">+' + y.b + '/h bio</span></div>';
                if (y.c) h += '<div class="cl-stat-pill gem"><i class="ph-bold ph-diamond"></i><span class="tabular-nums">+' + y.c + '/h cr</span></div>';
                h += '</div>';
                h += '<div class="cl-altar-discovered-note"><i class="ph-bold ph-sparkle"></i> Espécie descoberta! Para conseguir um novo exemplar, use a Árvore Incubadora na colônia.</div>';
            }
        } else {
            h += '<div class="cl-altar-locked">';
            h += '<div class="locked-title"><i class="ph-bold ph-lock-key"></i> Mistério Rúnico</div>';
            h += '<p class="locked-desc">' + (sp.rk === 0 ? 'Disponível na Loja dos Dragões.' : 'Pode nascer de cruzamentos de dragões ' + ZR[Math.max(0, sp.rk - 1)].n.toLowerCase() + ' ou superiores.') + '</p>';
            h += '</div>';
        }
        h += '</div>';

        h += '</div>';
        return h;
    }

    /* HTML do Roster dos Dragões Campeões (Página Direita do Capítulo I) */
    function zBkChampionsHTML(p) {
        const s = clS(), z = clZooS(s), lay = clZooLayout(s), lv = lay.lv || 1;
        const myDragons = (z.an || []).slice().sort((x, y) => {
            const spX = zsp(x.sp), spY = zsp(y.sp);
            return zDragonPower(spY, y) - zDragonPower(spX, x) || zAL(y) - zAL(x);
        });

        if (!myDragons.length) {
            return '<div class="cl-dchamps-empty"><div class="empty-icon"><i class="ph-bold ph-dragon"></i></div><b>Nenhum dragão ativo no momento</b><p>Visite a Loja ou cruze dragões para dar as boas-vindas ao seu primeiro campeão!</p><button type="button" class="cl-zseal buy" data-cl="zoo-buy"><i class="ph-bold ph-plus-circle"></i><span>Trazer Primeiro Dragão</span></button></div>';
        }

        let h = '<div class="cl-bcard-wrap"><div class="cl-bcard-grid">';
        myDragons.forEach((a, idx) => {
            const sp = zsp(a.sp);
            const isSelected = ZOO.anId === a.id || (!ZOO.anId && idx === 0);
            h += zHcCard(sp, true, true, isSelected, 1, zStar(a), a, lv, z);
        });
        h += '</div></div>';
        return h;
    }

    /* HTML das Cartas na Página Direita (Ordenadas do mais forte ao mais fraco) */
    function zBkCardsHTML(p) {
        const list = (p.list || []).slice().sort((a, b) => b.rk - a.rk || ZG[b.rk] - ZG[a.rk]);
        const s = clS(), z = clZooS(s);
        const activeSpId = ZOO.bsp || (list[0] && list[0].id);

        const cardsHtml = list.map(sp => {
            const got = !!z.book[sp.id];
            const own = (z.an || []).some(a => a.sp === sp.id);
            const sel = sp.id === activeSpId;
            return zHcCard(sp, got, own, sel);
        }).join('');

        return '<div class="cl-bcard-wrap"><div class="cl-bcard-grid">' + cardsHtml + '</div></div>';
    }

    /* HTML dos Ninhos e Ovos (Página Direita do Capítulo VI) */
    function zBkEggsHTML() {
        const s = clS(), z = clZooS(s), lay = clZooLayout(s);
        let h = '<div class="cl-deggs-wrap">';

        h += '<div class="deggs-header">';
        h += '<div class="deggs-summary"><span><b>' + (z.eggs ? z.eggs.length : 0) + '/' + (lay.eggs || 1) + '</b> ovos chocando</span><span><b>' + (z.an ? z.an.length : 0) + '/' + lay.slots + '</b> dragões</span></div>';
        h += '<div class="deggs-acts">';
        h += '<button type="button" class="cl-zseal buy" data-cl="zoo-buy"><i class="ph-bold ph-plus-circle"></i><span>Trazer Dragão</span></button>';
        h += '</div>';
        h += '</div>';

        h += '<div class="deggs-incubator-shelf">';
        h += '<h5 class="cl-zh5"><i class="ph-bold ph-egg"></i> Ninhos de Chocagem</h5>';
        if (!z.eggs || !z.eggs.length) {
            h += '<div class="deggs-empty-nest"><p>Nenhum ovo nos ninhos no momento. Cruze dois dragões adultos para gerar um novo ovo elemental!</p></div>';
        } else {
            h += '<div class="deggs-grid">';
            z.eggs.forEach((e, i) => {
                const spE = zsp(e.sp) || ZSP[0], ok = e.el >= e.tot;
                h += '<div class="degg-card' + (ok ? ' ready' : '') + '">';
                h += '<div class="egg-preview">' + zEggSVG(ZR[spE.rk].col, ZEL[spE.el].col, ok, spE.id) + '</div>';
                h += '<div class="egg-meta">';
                h += '<b>Ovo Elemental #' + (i + 1) + '</b>';
                h += '<div class="egg-timer tabular-nums">' + (ok ? '✦ PRONTO P/ NASCER ✦' : 'Faltam ' + zClock(e.tot - e.el)) + '</div>';
                const pr = Math.min(1, e.el / Math.max(1, e.tot));
                h += '<div class="egg-prog"><i style="width:' + Math.round(pr * 100) + '%"></i></div>';
                h += '</div>';
                if (ok) {
                    h += '<button type="button" class="egg-hatch-btn pulse-glow" data-cl="zoo-hatch"><i class="ph-bold ph-sparkle"></i><span>Chocar!</span></button>';
                    if (!e.manualHatch && !e.grantId) {
                        h += '<button type="button" data-cl="zoo-unrush-egg" data-i="' + i + '" style="margin-top:6px;padding:6px 10px;border-radius:10px;border:1px solid rgba(251,191,36,.4);background:rgba(15,23,42,.75);color:#fde68a;font:700 11px/1.2 inherit;cursor:pointer;display:inline-flex;align-items:center;gap:5px"><i class="ph-bold ph-arrow-counter-clockwise"></i><span>Voltar timer (' + zClock(e.tot) + ')</span></button>';
                    }
                }
                if (z.eggs.length > 1) {
                    h += '<button type="button" data-cl="zoo-keep-egg" data-i="' + i + '" style="margin-top:6px;padding:6px 10px;border-radius:10px;border:1px solid rgba(56,189,248,.5);background:rgba(15,23,42,.85);color:#bae6fd;font:700 11px/1.2 inherit;cursor:pointer;display:inline-flex;align-items:center;gap:5px"><i class="ph-bold ph-check-circle"></i><span>Manter este ovo comum</span></button>';
                }
                h += '</div>';
            });
            h += '</div>';
        }
        h += '</div>';

        const runeKeys = Object.keys(z.runes || {}).filter(k => (z.runes[k] || 0) > 0);
        h += '<div class="cl-covil-enchant-box">';
        h += '<div class="enchant-title"><i class="ph-bold ph-sparkle"></i> Encantamento Rúnico de Ninho</div>';
        h += '<p class="enchant-sub">Use uma Essência Rúnica obtida nas Provas Elementais para abençoar a ninhada com +50% de sorte elemental!' + (z.enchanted ? ' <b class="ench-active">✦ NINHO ENCANTADO (' + z.enchanted + 'x) ✦</b>' : '') + '</p>';
        if (runeKeys.length) {
            h += '<div class="enchant-runes">';
            runeKeys.forEach(rk => {
                h += '<span class="rune-tag">✨ ' + rk + ' <b>x' + z.runes[rk] + '</b></span>';
            });
            h += '</div>';
            h += '<button type="button" class="cl-zseal enchant-btn" data-cl="zoo-enchant-nest"><i class="ph-bold ph-magic-wand"></i><span>Encantar Ninho (-1 Runa)</span></button>';
        } else {
            h += '<div class="enchant-empty"><small>Você não possui Essências Rúnicas. Vença as Provas Elementais na aba ⚔️ Provas para conquistar essências!</small></div>';
        }
        h += '</div>';

        h += '</div>';
        return h;
    }

    function zBkPageHTML(p, i, tot) {
        let body = '';
        if (p.k === 'altar') {
            body = zBkAltarHTML(p);
        } else if (p.k === 'champions') {
            body = zBkChampionsHTML(p);
        } else if (p.k === 'cards') {
            body = zBkCardsHTML(p);
        } else if (p.k === 'eggs') {
            body = zBkEggsHTML();
        } else if (p.k === 'duel_arena') {
            body = zBkDuelArenaHTML();
        } else if (p.k === 'duel_towers') {
            body = zBkDuelTowersHTML();
        } else if (p.k === 'ach') {
            const z = clZooS();
            body = '<div class="cl-zach-wrap"><div class="cl-zach">' + zBkAchItems(z).join('') + '</div></div>';
        } else {
            body = p.h || '';
        }
        return '<header class="cl-bkh">' + (p.ic ? '<i class="ph-bold ' + p.ic + '"' + (p.col ? ' style="color:' + p.col + '"' : '') + '></i> ' : '') + '<b>' + p.t + '</b>' + (p.sub ? '<small>' + p.sub + '</small>' : '') + '</header><div class="cl-bkb">' + body + '</div><footer class="cl-bkf">· ' + (i + 1) + ' ·</footer>';
    }
    /* Dragão 3D e círculo rúnico no altar da página esquerda */
    function zBkSetDragon(spId, force) {
        if (!ZOO.bk3d || !ZOO.bk3d.sc) return;
        const bk = ZOO.bk3d;
        if (bk.dragonSp === spId && !force && bk.dragonBd) return;
        bk.dragonSp = spId;
        const sp = zsp(spId);
        if (!sp) return;

        if (bk.dragonBd && bk.dragonBd.g) {
            bk.dragonHost.remove(bk.dragonBd.g);
            bk.dragonBd = null;
        }
        try {
            const Bd = zBuild(sp, true, 1.0);
            if (Bd && Bd.g) {
                bk.dragonBd = Bd;
                const sz = Bd.sz || 2.0;
                const scale = 5.2 / sz;
                Bd.g.scale.setScalar(scale);
                Bd.g.position.set(0, 0, 0);
                bk.dragonHost.add(Bd.g); if (bk.surf) bk.dragonHost.scale.setScalar(Bd.model ? 0.72 : 1.25);
                try {
                    const T2 = clTh();
                    Bd.g.updateMatrixWorld(true);
                    const bb = new T2.Box3().setFromObject(Bd.g);
                    const ct = bb.getCenter(new T2.Vector3());
                    Bd.g.position.x = -ct.x;
                    Bd.g.position.z = -ct.z;
                    Bd.g.position.y = -bb.min.y + 1.2;
                    bk.hostLow = Math.max(1.8, (bk.dragonHost.position.y - bb.min.y) / Math.max(0.01, bk.dragonHost.scale.x));
                } catch (e6) {}
                if (Bd.act && Bd.act.fly) {
                    zDragonAct(Bd, Bd.act.fly, 0.85);
                }
                const el = ZEL[sp.el];
                if (el && bk.runeMat) {
                    bk.runeMat.color.set(el.col);
                }
                if (el && bk.dDragonLight) {
                    bk.dDragonLight.color.set(el.col).lerp(new T.Color(0xffeedd), 0.78);   /* a luz do dragão não pinta mais o livro */
                }
            }
        } catch (e) {
            console.warn('Erro ao montar dragão 3D no grimório:', e);
        }
    }

    function zBkSync3DDragon() {
        if (!ZOO.bk3d || !ZOO.bk3d.sc || !ZOO.bP) return;
        const pair = ZOO.bs || 0;
        const pageL = ZOO.bP[pair << 1];
        if (!pageL) return;
        { const sh = pageL.k === 'altar' || pageL.k === 'duel_arena'; if (ZOO.bk3d.dragonHost) ZOO.bk3d.dragonHost.visible = sh; if (ZOO.bk3d.runeGroup) ZOO.bk3d.runeGroup.visible = sh; if (!sh) return; }
        let targetSp = pageL.spId;
        if (!targetSp && ZOO.bsp) targetSp = ZOO.bsp;
        if (!targetSp) {
            const defBySec = { terra: 'musgo', agua: 'orvalho', cristal: 'prisma', estelar: 'solar', mine: 'musgo', ach: 'vigia', duel: 'vulcao' };
            targetSp = defBySec[pageL.sec] || 'musgo';
            if (pageL.sec === 'mine') {
                const z = clZooS();
                if (z.an && z.an.length) targetSp = z.an[0].sp;
            }
        }
        zBkSetDragon(targetSp);
    }

    function zBkDragonTapFx() {
        if (!ZOO.bk3d || !ZOO.bk3d.dragonBd) return;
        const Bd = ZOO.bk3d.dragonBd;
        try { aliveSound('chirp'); } catch (e) {}
        if (Bd.act) {
            const anim = Bd.act.atk || Bd.act.idle || Bd.act.fly;
            if (anim) zDragonAct(Bd, anim, 1.3);
            setTimeout(() => {
                try {
                    if (ZOO.bk3d && ZOO.bk3d.dragonBd === Bd && Bd.act && Bd.act.fly) {
                        zDragonAct(Bd, Bd.act.fly, 0.85);
                    }
                } catch (er) {}
            }, 900);
        }
        if (ZOO.bk3d.dDragonLight) {
            const l = ZOO.bk3d.dDragonLight;
            l.intensity = 2.8;
            setTimeout(() => { try { l.intensity = 1.3; } catch (er) {} }, 450);
        }
    }

    /* abertura com o livro 3D de verdade (old_book.glb): a capa de couro balança e abre, permanecendo como palco físico permanente das cartas */
    function zBkIntro(m) {
        const T = clTh(), tp = CLM.tpl['old_book_v2.glb']; if (!tp || !tp.gl) return false;
        const bk = m.querySelector('.cl-bk'); if (!bk) return false; let r = null;
        try {
            let cv = bk.querySelector('.cl-bk3d');
            if (!cv) {
                cv = document.createElement('canvas'); cv.className = 'cl-bk3d';
                bk.insertBefore(cv, bk.firstChild);
            }
            r = new T.WebGLRenderer({ canvas: cv, antialias: !IPAD, alpha: true, powerPreference: IPAD ? 'default' : 'high-performance' });
            r.outputEncoding = T.sRGBEncoding; r.setClearColor(0x000000, 0); r.setPixelRatio(IPAD ? 1 : Math.min(window.devicePixelRatio || 1, CL_TOUCH() ? 1.1 : 1.5));
            const w = Math.max(200, bk.clientWidth), h = Math.max(200, bk.clientHeight); r.setSize(w, h, false);
            const sc = new T.Scene();
            sc.add(new T.HemisphereLight(0xfff3db, 0x4a3220, 0.95));
            const d1 = new T.DirectionalLight(0xffe0a0, 1.25); d1.position.set(-15, 35, 25); sc.add(d1);
            const d2 = new T.PointLight(0xffa040, 0.65, 180); d2.position.set(25, 25, 15); sc.add(d2);
            const root = tp.gl.scene.clone(true);
            root.rotation.set(0, 0, 0);
            sc.add(root); root.updateMatrixWorld(true);

            // Altar 3D: Dragão sobre a Página Esquerda
            const dragonHost = new T.Group();
            dragonHost.position.set(-13.5, 15.0, 0);
            sc.add(dragonHost);

            const dDragonLight = new T.PointLight(0xffeedd, 1.3, 30);
            dDragonLight.position.set(-13.5, 18.5, 3.5);
            sc.add(dDragonLight);

            // Círculo de Invocação Rúnico 3D sobre o pergaminho
            const runeGroup = new T.Group();
            runeGroup.position.set(-13.5, 11.55, 0);
            runeGroup.rotation.x = -Math.PI / 2;
            sc.add(runeGroup);

            const runeMat = new T.MeshBasicMaterial({
                color: 0xffd884,
                transparent: true,
                opacity: 0.55,
                side: T.DoubleSide,
                depthWrite: false,
                blending: T.AdditiveBlending
            });
            const ringGeo1 = new T.RingGeometry(3.8, 4.15, 48);
            const ring1 = new T.Mesh(ringGeo1, runeMat);
            runeGroup.add(ring1);
            const ringGeo2 = new T.RingGeometry(2.1, 2.35, 36);
            const ring2 = new T.Mesh(ringGeo2, runeMat);
            runeGroup.add(ring2);
            const runeNodeGeo = new T.CircleGeometry(0.28, 12);
            for (let ri = 0; ri < 8; ri++) {
                const ang = (ri / 8) * Math.PI * 2;
                const nm = new T.Mesh(runeNodeGeo, runeMat);
                nm.position.set(Math.cos(ang) * 4.0, Math.sin(ang) * 4.0, 0.01);
                runeGroup.add(nm);
            }

            const aspect = w / h; const cam = new T.PerspectiveCamera(32, aspect, 1, 600);   /* posição da câmera: zBkCamPlace (inclinada, arrastável) */

            const mx = new T.AnimationMixer(root);
            const clip = tp.gl.animations && tp.gl.animations[0];
            const act = clip ? mx.clipAction(clip) : null;
            if (act) { act.play(); }

            // Inicia fechado: root deslocado para ficar exatamente no centro
            root.position.x = -14.4;
            if (act) mx.setTime(0.001);
            root.updateMatrixWorld(true);

            let t = 0, last = 0, id = 0;
            const state = { r, sc, cam, mx, root, cv, bk, d1, d2, dragonHost, dDragonLight, runeGroup, runeMat, runeRing: ring1, runeInner: ring2, dragonBd: null, dragonSp: null, userDragging: false, openDone: false, turn: null, closing: false, closeP: 0 };
            ZOO.bk3d = state; state.view = { el: 1.08, az: 0, zm: 1 }; zBkCamPlace(state, w, h);

            const loop = now => {
                if (ZOO.modal !== 'book') return;
                const dt = Math.min(0.05, (now - (last || now)) / 1000);
                last = now;
                try { if (state.surf && now - (state.resT || 0) > 900) { state.resT = now; zBkResPaint(); } } catch (e8) {}
                try { st_dyn: { const stt = state; if (!stt.openDone || stt.closing || !stt.vw) break st_dyn; stt.fa = stt.fa ? stt.fa * 0.95 + dt * 0.05 : dt; const dpr = window.devicePixelRatio || 1, cap = Math.min(dpr, CL_TOUCH() ? 1.25 : 1.5), cur = r.getPixelRatio(); stt.dyT = (stt.dyT || 0) + dt;
                    if (stt.dyT > 1.2) { stt.dyT = 0; let nr = cur; if (stt.fa > 0.026 && cur > 0.8) nr = Math.max(0.8, cur - 0.1); else if (stt.fa < 0.0185 && cur < cap - 0.01) nr = Math.min(cap, cur + 0.05); if (Math.abs(nr - cur) > 0.01) { r.setPixelRatio(nr); r.setSize(stt.vw, stt.vh, false); } } } } catch (e7) {}   /* resolução dinâmica do livro: baixa sozinha se o celular engasgar e sobe de volta quando sobra fôlego */

                if (state.closing) {
                    state.closeP += dt / 0.42;
                    const p = Math.min(1, state.closeP);
                    const closeT = 1.6 * (1 - p);
                    root.position.x = p * -14.4;
                    if (act) mx.setTime(closeT);
                    if (state.dragonHost) state.dragonHost.scale.setScalar(Math.max(0.001, 1 - p));
                    if (state.runeGroup) state.runeGroup.scale.setScalar(Math.max(0.001, 1 - p));
                    root.updateMatrixWorld(true);
                    r.render(sc, cam);
                    if (p >= 1) {
                        zClose();
                        return;
                    }
                } else if (state.turn) {
                    const tr = state.turn;
                    if (state.surf && !tr.init) { tr.init = true; try { zBkSurfTurnStart(state, tr); } catch (e) { ZOO.lastErr = 'turnstart ' + e; } }
                    tr.p += dt / tr.dur;
                    const p = Math.min(1, tr.p);
                    const sampleT = state.surf ? (tr.fwd ? BKS_T0 + (BKS_T1 - BKS_T0) * p : BKS_T1 - (BKS_T1 - BKS_T0) * p) : (tr.fwd ? (3.0 + p * 0.6) : (3.6 - p * 0.6));
                    if (act) mx.setTime(sampleT);
                    root.updateMatrixWorld(true);
                    if (p >= 0.5 && !tr.switched) {
                        tr.switched = true;
                        ZOO.bs = tr.to;
                        if (!state.surf) zBkPaint(m);
                        zBkSync3DDragon();
                    }
                    if (p >= 1) {
                        state.turn = null;
                        if (state.surf) { try { zBkSurfTurnEnd(state, tr); } catch (e) { ZOO.lastErr = 'turnend ' + e; } }
                        if (act) mx.setTime(state.surf ? BKS_T0 : 1.6);
                        root.updateMatrixWorld(true);
                        ZOO.bTurning = false;
                    }
                    d1.intensity = 1.25 + 0.08 * Math.sin(now * 0.0028);
                    d2.intensity = 0.65 + 0.06 * Math.cos(now * 0.0034);
                    if (state.dDragonLight) state.dDragonLight.intensity = state.surf ? 0.28 + 0.04 * Math.sin(now * 0.004) : 1.2 + 0.3 * Math.sin(now * 0.004);
                    r.render(sc, cam);
                } else if (!state.openDone) {
                    t += dt * 1.35;
                    const openProg = Math.min(1, t / 1.6);
                    root.position.x = (1 - openProg) * -14.4;
                    if (act) mx.setTime(Math.min(1.6, t));
                    root.updateMatrixWorld(true);
                    if (state.dragonHost) state.dragonHost.scale.setScalar(openProg);
                    if (state.runeGroup) state.runeGroup.scale.setScalar(openProg);
                    r.render(sc, cam);
                    if (t >= 1.6) {
                        state.openDone = true;
                        bk.classList.remove('intro');
                        bk.classList.add('ready');
                        try { if (zBkSurfInit(state)) { bk.classList.add('surf'); m.querySelectorAll('.cl-bkhalf').forEach(h => { h.innerHTML = ''; h._h = ''; }); } } catch (e) { ZOO.lastErr = 'surf ' + e; }   /* o conteúdo passa a ser textura nas folhas do modelo */
                        zBkSync3DDragon();
                    }
                } else {
                    if (act) mx.setTime(state.surf ? BKS_T0 : 1.6);
                    d1.intensity = 1.25 + 0.08 * Math.sin(now * 0.0028);
                    d2.intensity = 0.65 + 0.06 * Math.cos(now * 0.0034);
                    if (state.dDragonLight) state.dDragonLight.intensity = 1.2 + 0.3 * Math.sin(now * 0.004);

                    // Animação do Dragão 3D no Altar
                    if (state.dragonBd) {
                        const Bd = state.dragonBd;
                        if (Bd.mixer) Bd.mixer.update(dt);
                        if (Bd.P) {
                            const tSec = now * 0.001;
                            if (Bd.P.wings) Bd.P.wings.forEach(w => {
                                w.g.rotation.x = w.sd * (0.48 + 0.24 * Math.sin(tSec * 4));
                            });
                            if (Bd.P.tail) Bd.P.tail.rotation.y = Math.sin(tSec * 3) * 0.28;
                            if (Bd.P.head) Bd.P.head.rotation.z = Math.sin(tSec * 1.5) * 0.08;
                            if (Bd.P.crown) {
                                Bd.P.crown.rotation.z = tSec * 1.5;
                                Bd.P.crown.position.y = (Bd.crownY || 0.98) + 0.04 * Math.sin(tSec * 2);
                            }
                            if (Bd.aura) Bd.aura.rotation.y = tSec * 0.6;
                            if (Bd.orbs && Bd.orbs.length) {
                                for (let i = 0; i < Bd.orbs.length; i++) {
                                    const a = tSec * 1.8 + i * (6.283 / Bd.orbs.length);
                                    Bd.orbs[i].position.set(Math.cos(a) * 0.65, 0.45 + Math.sin(tSec * 3 + i) * 0.12, Math.sin(a) * 0.65);
                                }
                            }
                        }
                        if (state.dragonHost) {
                            state.dragonHost.position.y = (state.surf && state.pageY !== undefined ? state.pageY + 1.8 + (state.hostLow || 2) * state.dragonHost.scale.x * 1.35 : (state.hostY || 15.0)) + Math.sin(now * 0.0022) * (state.surf ? 0.25 : 0.35);
                            if (!state.userDragging) {
                                state.dragonHost.rotation.y += dt * 0.35;
                            }
                        }
                        if (Bd.gpuAura && Bd.gpuAura.material.uniforms && Bd.gpuAura.material.uniforms.uTime) {
                            Bd.gpuAura.material.uniforms.uTime.value = now * 0.001;
                        }
                        if (Bd.jewelMats && Bd.jewelMats.length) {
                            Bd.jewelMats.forEach(mat => {
                                if (mat.color) mat.color.setRGB(0.5 + 0.5 * Math.sin(now * 0.0015), 0.5 + 0.5 * Math.cos(now * 0.002), 0.8 + 0.2 * Math.sin(now * 0.001));
                            });
                        }
                    }
                    if (state.runeRing) state.runeRing.rotation.z += dt * 0.35;
                    if (state.runeInner) state.runeInner.rotation.z -= dt * 0.65;

                    r.render(sc, cam);
                }
                id = requestAnimationFrame(loop);
                state.id = id;
            };
            bk.classList.add('intro');
            id = requestAnimationFrame(loop);
            state.id = id;

            // Interação direta com o Dragão 3D na Página Esquerda
            const lPage = m.querySelector('.cl-bkhalf.L');
            if (lPage) {
                let downX = 0, downY = 0, dragging = false, lastX = 0;
                lPage.addEventListener('pointerdown', e => {
                    if (e.target.closest('button') || state.surf) return;
                    downX = e.clientX; downY = e.clientY; lastX = downX;
                    dragging = true; state.userDragging = true;
                    try { lPage.setPointerCapture(e.pointerId); } catch (er) {}
                });
                lPage.addEventListener('pointermove', e => {
                    if (!dragging) return;
                    const dx = e.clientX - lastX; lastX = e.clientX;
                    if (state.dragonHost) state.dragonHost.rotation.y += dx * 0.018;
                });
                const onUp = e => {
                    if (!dragging) return;
                    dragging = false; state.userDragging = false;
                    const totalDist = Math.hypot(e.clientX - downX, e.clientY - downY);
                    if (totalDist < 12) zBkDragonTapFx();
                };
                lPage.addEventListener('pointerup', onUp);
                lPage.addEventListener('pointercancel', onUp);
            }

            try { aliveSound('tick'); } catch (e) {}
            return true;
        } catch (e) {
            try { r && r.dispose(); } catch (e2) {}
            try { bk.classList.remove('intro'); const c0 = bk.querySelector('.cl-bk3d'); c0 && c0.remove(); } catch (e3) {}
            return false;
        }
    }
    const zBkPortrait = () => (window.innerHeight || 800) > (window.innerWidth || 400) * 1.05;
    const zBkScreenPortrait = () => (window.innerHeight || 800) > (window.innerWidth || 400) * 1.05;
    function zBkFit(m) {
        m = m || (CL.root && CL.root.querySelector('.cl-zmod.book')); if (!m) return;
        const bk = m.querySelector('.cl-bk'); if (!bk) return;
        const por = zBkPortrait(); ZOO.bRot = false; bk.classList.remove('rot'); bk.style.width = ''; bk.style.height = ''; bk.style.transform = '';
        if (ZOO.bk3d) {
            try {
                const w = Math.max(200, bk.clientWidth), h = Math.max(200, bk.clientHeight);
                ZOO.bk3d.r.setSize(w, h, false); zBkCamPlace(ZOO.bk3d, w, h);
            } catch (e) {}
        }
        if (por !== !!ZOO.bPor && ZOO.bP && !ZOO.bTurning) {
            const cur = ZOO.bs << 1; ZOO.bPor = por; bk.classList.toggle('portrait', por); bk.classList.toggle('land', !por);
            ZOO.bP = zBkPages(); ZOO.bs = Math.min(cur >> 1, (ZOO.bP.length - 1) >> 1); zBkPaint(m);
        }
    }
    function zBkRibbonsSync(m) {
        if (!m) return;
        const ribbons = m.querySelectorAll('.cl-ribbon');
        const cur = ZOO.bs || 0;
        ribbons.forEach((rib, idx) => {
            rib.classList.toggle('active', idx === cur);
        });
    }
    function zBookOpen() {
        try { if (typeof warCss === 'function') warCss(); } catch (e) {}
        let force3d = false;
        try { force3d = localStorage.getItem('cestille_book_mode') === '3d'; } catch (e) {}
        if (force3d) { zBookOpen3D(); return; }
        CL.sel = -1; try { clUiSel(); } catch (e) {}
        try { if (!ZOO.lite) Object.keys(ZDB).forEach(k => { try { clModelLoad(ZDB[k].f); } catch (e) {} }); } catch (e) {}
        const s = clS(), z = clZooS(s);
        ZOO.btab = ZOO.btab || 'mine';
        ZOO.bflt = ZOO.bflt || 'all';
        ZOO.fuseArm = 0; ZOO.relArm = 0;
        if (z.an && z.an.length) {
            const top = z.an.slice().sort((a, b) => (zDragonPower(zsp(b.sp), b) - zDragonPower(zsp(a.sp), a)) || (zAL(b) - zAL(a)))[0];
            if (top) {
                if (!ZOO.bsp) ZOO.bsp = top.sp;
                if (!ZOO.anId || !z.an.some(x => x.id === ZOO.anId)) ZOO.anId = top.id;
            }
        }
        const m = zModal('', 'book hs-book');
        ZOO.modal = 'book';
        try { aliveSound('tick'); } catch (e) {}
        zBookRefresh();
        return m;
    }
    function zBookOpen3D() {
        CL.sel = -1; try { clUiSel(); } catch (e) {}
        try { if (!ZOO.lite)
            Object.keys(ZDB).map(k => ZDB[k].f).forEach(f => {
                try { clModelEnsure(f); } catch (e) {}
            });
        } catch (e) {}
        const por = zBkPortrait(), m = zModal('<div class="cl-bk ' + (por ? 'portrait' : 'land') + ' intro">'
            + '<button type="button" class="cl-bkx" data-cl="zoo-close" aria-label="Fechar Grimório"><i class="ph-bold ph-x"></i></button>'
            + '<div class="cl-bk-ribbons">'
            + '<button type="button" class="cl-ribbon champs active" data-cl="zoo-bgo" data-p="0" title="Seus Dragões Campeões"><span class="rib-tab">👑 <em>Campeões</em></span></button>'
            + '<button type="button" class="cl-ribbon terra" data-cl="zoo-bgo" data-p="2" title="Linhagem Terra"><span class="rib-tab">🌿 <em>Terra</em></span></button>'
            + '<button type="button" class="cl-ribbon agua" data-cl="zoo-bgo" data-p="4" title="Linhagem Água"><span class="rib-tab">💧 <em>Água</em></span></button>'
            + '<button type="button" class="cl-ribbon cristal" data-cl="zoo-bgo" data-p="6" title="Linhagem Cristal"><span class="rib-tab">💎 <em>Cristal</em></span></button>'
            + '<button type="button" class="cl-ribbon estelar" data-cl="zoo-bgo" data-p="8" title="Linhagem Estelar"><span class="rib-tab">⭐ <em>Estelar</em></span></button>'
            + '<button type="button" class="cl-ribbon eggs" data-cl="zoo-bgo" data-p="10" title="Ninhos e Incubação"><span class="rib-tab">🥚 <em>Ninhos</em></span></button>'
            + '<button type="button" class="cl-ribbon duel" data-cl="zoo-bgo" data-p="12" title="Provas Elementais"><span class="rib-tab">⚔️ <em>Provas</em></span></button>'
            + '<button type="button" class="cl-ribbon ach" data-cl="zoo-bgo" data-p="14" title="Feitos Dracônicos"><span class="rib-tab">🏆 <em>Feitos</em></span></button>'
            + '</div>'
            + '<div class="cl-bk-book"><div class="cl-bk-spread"><div class="cl-bkhalf L"></div><div class="cl-bkhalf R"></div></div></div>'
            + '<nav class="cl-bk-nav"><button type="button" class="cl-bk-corner prev" data-cl="zoo-bturn" data-d="-1" aria-label="Voltar página"><i class="ph-bold ph-caret-left"></i><span>Folhear</span></button><div class="cl-bk-nav-title"><span class="chapter-lab">Grimório dos Dragões</span><small class="page-num">páginas 1–2</small></div><button type="button" class="cl-bk-corner next" data-cl="zoo-bturn" data-d="1" aria-label="Avançar página"><span>Folhear</span><i class="ph-bold ph-caret-right"></i></button></nav>'
            + '<div class="cl-bk-loading"><div class="bk-spin"></div><span>Abrindo Grimório dos Dragões…</span></div>'
            + '</div>', 'book');
        ZOO.modal = 'book'; try { if (localStorage.getItem('cestille_book3d') === '1' && zB3Open(m)) return; } catch (e) {}   /* o Grimório (modelo old_book.glb) é o livro padrão */
        ZOO.bTurning = false; ZOO.bPor = por; const P = zBkPages(); ZOO.bP = P;
        ZOO.bs = 0; ZOO.bstart = null; // SEMPRE ABRE NA PÁGINA HOME POR PADRÃO
        zBkFit(m); zBkPaint(m);

        const initBook = () => {
            const loadEl = m.querySelector('.cl-bk-loading');
            if (loadEl) loadEl.remove();
            zBkIntro(m);
        };
        if (CLM.tpl['old_book_v2.glb'] && CLM.tpl['old_book_v2.glb'].gl) {
            initBook();
        } else {
            clModelEnsure('old_book_v2.glb').then(() => {
                if (ZOO.modal === 'book') initBook();
            }).catch(() => {
                const loadEl = m.querySelector('.cl-bk-loading');
                if (loadEl) loadEl.innerHTML = '<span>Toque para tentar de novo</span>';
            });
        }

        const bk = m.querySelector('.cl-bk-book'); let sx = 0, sy = 0, st = 0, on = false;
        bk.addEventListener('pointerdown', e => { sx = e.clientX; sy = e.clientY; st = Date.now(); on = true; });
        bk.addEventListener('pointerup', e => {
            if (!on) return; on = false;
            const dx = e.clientX - sx, dy = e.clientY - sy;
            if (Math.abs(dx) > 46 && Math.abs(dx) > Math.abs(dy) * 1.3 && Date.now() - st < 800) zBkTurn(dx < 0 ? 1 : -1);
        });
        bk.addEventListener('pointercancel', () => { on = false; });
        { const root2 = m.querySelector('.cl-bk'); let tx = 0, ty = 0, lx = 0, ly = 0, dn = false, mv = false, pin = false, pd = 0, pmx = 0, pmy = 0, gd = 0, gx = 0, gy = 0, gm = ''; const st0 = () => ZOO.bk3d, ps = new Map();
            const two = () => { const a = [...ps.values()]; return { d: Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y), x: (a[0].x + a[1].x) / 2, y: (a[0].y + a[1].y) / 2 }; };
            root2.addEventListener('pointerdown', e => { if (e.target.closest && e.target.closest('button')) return; ps.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (ps.size === 2) { const t = two(); pin = true; pd = t.d; pmx = t.x; pmy = t.y; gd = gx = gy = 0; gm = ''; return; } tx = lx = e.clientX; ty = ly = e.clientY; dn = true; mv = false; });
            root2.addEventListener('pointermove', e => { const st = st0(); if (ps.has(e.pointerId)) ps.set(e.pointerId, { x: e.clientX, y: e.clientY });
                if (pin && ps.size >= 2) { if (!st || !st.surf || !st.view) return; const t = two(), v = st.view; gd += t.d - pd; gy += t.y - pmy; gx += t.x - pmx;   /* dois dedos: afastar/aproximar = zoom; arrastar para cima/baixo = inclinação (o gesto é decidido nos primeiros pixels) */
                    if (!gm && Math.hypot(gd, gy, gx) > 10) gm = Math.abs(gd) > 2 * Math.hypot(gx, gy) ? 'z' : 't';   /* só é zoom se a distância entre os dedos muda bem mais do que eles andam juntos */
                    if (gm === 'z' && pd > 0 && t.d > 0) v.zm = Math.max(0.4, Math.min(1.25, v.zm * pd / t.d)); else if (gm === 't') { v.el = Math.max(0.55, Math.min(1.42, v.el + (t.y - pmy) * 0.006)); v.az = Math.max(-0.75, Math.min(0.75, v.az - (t.x - pmx) * 0.004)); }
                    pd = t.d; pmx = t.x; pmy = t.y; zBkCamPlace(st); return; }
                if (!dn) return; if (!st || !st.surf || !st.view || st.turn) return; if (!mv && Math.hypot(e.clientX - tx, e.clientY - ty) < 10) return; if (!mv) { mv = true; try { root2.setPointerCapture(e.pointerId); } catch (er) {} } const v = st.view; v.az = Math.max(-0.75, Math.min(0.75, v.az - (e.clientX - lx) * 0.005)); v.el = Math.max(0.55, Math.min(1.42, v.el + (e.clientY - ly) * 0.004)); lx = e.clientX; ly = e.clientY; zBkCamPlace(st); });
            const up = e => { const was = dn && !pin; ps.delete(e.pointerId); if (ps.size < 2) pin = false; if (ps.size === 0) { dn = false; } try { if (was && !mv && e.type === 'pointerup' && !(e.target.closest && e.target.closest('button'))) zBkSurfPick(e); } catch (er) {} if (ps.size === 0) mv = false; };
            root2.addEventListener('pointerup', up); root2.addEventListener('pointercancel', up);
            root2.addEventListener('dblclick', () => { const st = st0(); if (st && st.view) { st.view.el = 1.08; st.view.az = 0; st.view.zm = 1; st.view.px = 0; st.view.pz = 0; zBkCamPlace(st); } });
            root2.addEventListener('wheel', e => { const st = st0(); if (!st || !st.view) return; e.preventDefault(); const v = st.view;
                if (e.ctrlKey) v.zm = Math.max(0.4, Math.min(1.25, v.zm * Math.exp(e.deltaY * 0.01)));   /* pinça no trackpad (vem como ctrl+roda) = zoom */
                else { v.el = Math.max(0.55, Math.min(1.42, v.el + e.deltaY * 0.004)); v.az = Math.max(-0.75, Math.min(0.75, v.az - e.deltaX * 0.004)); }   /* arrastar com dois dedos no trackpad / roda = inclinar */
                zBkCamPlace(st); }, { passive: false }); }   /* 1 dedo/mouse: gira e inclina · pinça: zoom e arrastar · toque: cartas e botões · duplo toque: recentra */   /* arrastar = girar/inclinar a câmera; toque = cartas e botões da folha; duplo toque = recentra */
        if (!window.__zBkRz) { window.__zBkRz = 1; window.addEventListener('resize', () => { try { if (ZOO.modal === 'book') zBkFit(); } catch (e) {} }); }
    }
    function zBkPaint(m) {   /* escreve as duas páginas do par atual */
        if (ZOO.bk3d && ZOO.bk3d.surf) { zBkSurfShow(); zBkNav(m); zBkRibbonsSync(m); try { zBkSync3DDragon(); } catch (e) {} return; }
        m = m || (CL.root && CL.root.querySelector('.cl-zmod.book')); if (!m || !ZOO.bP) return; const P = ZOO.bP, i = ZOO.bs << 1, L = m.querySelector('.cl-bkhalf.L'), R = m.querySelector('.cl-bkhalf.R');
        const put = (el, j) => { const h = j < P.length ? '<div class="cl-bpage cl-bkpg" data-pg="' + j + '">' + zBkPageHTML(P[j], j, P.length) + '</div>' : '<div class="cl-bpage cl-bkpg empty"></div>'; if (el._h !== h) { const sc = el.querySelector('.cl-bkb'), top = sc ? sc.scrollTop : 0; el.innerHTML = h; el._h = h; const nb = el.querySelector('.cl-bkb'); if (nb) nb.scrollTop = top; } };
        put(L, i); put(R, i + 1); zBkNav(m); zBkRibbonsSync(m); zBkSync3DDragon();
    }
    function zBkNav(m) {
        m = m || (CL.root && CL.root.querySelector('.cl-zmod.book')); if (!m || !ZOO.bP) return;
        const n = (ZOO.bP.length + 1) >> 1, i = ZOO.bs;
        const prev = m.querySelector('.cl-bk-corner.prev');
        const next = m.querySelector('.cl-bk-corner.next');
        if (prev) prev.disabled = i <= 0;
        if (next) next.disabled = i >= n - 1;
        const pL = ZOO.bP[i << 1];
        const chLab = m.querySelector('.cl-bk-nav-title .chapter-lab');
        const pgNum = m.querySelector('.cl-bk-nav-title .page-num');
        if (chLab && pL) chLab.textContent = pL.t || 'Grimório dos Dragões';
        if (pgNum) pgNum.textContent = 'págs ' + ((i << 1) + 1) + '–' + Math.min(ZOO.bP.length, (i << 1) + 2) + ' · ' + ZOO.bP.length;
    }
    function zBkTurn(d) { if (B3.on) { zB3Flip(B3.s + d); return; } zBkGoto(ZOO.bs + d); }
    function zBkGoto(j) {
        if (B3.on) { zB3Flip(j); return; }   /* j = número do par de páginas. A folha vira no modelo 3D real */
        const m = CL.root && CL.root.querySelector('.cl-zmod.book'); if (!m || ZOO.bTurning || !ZOO.bP) return; const P = ZOO.bP, n = (P.length + 1) >> 1; j = Math.max(0, Math.min(n - 1, j)); if (j === ZOO.bs) return;
        const fwd = j > ZOO.bs; ZOO.bsp = null; ZOO.bTurning = true; try { aliveSound('tick'); } catch (e) {}
        if (ZOO.bk3d && ZOO.bk3d.mx) {
            ZOO.bk3d.turn = { from: ZOO.bs, to: j, fwd, p: 0, dur: ZOO.bk3d.surf ? 1.5 : 0.65, switched: false };
        } else {
            ZOO.bs = j; zBkPaint(m); ZOO.bTurning = false;
        }
    }
    function zBookRefresh() {
        const hs = CL.root && CL.root.querySelector('.cl-zmod.hs-book');
        if (hs) {
            const c = hs.querySelector('.cl-zcard');
            if (!c) return;
            const prevDeck = c.querySelector('[data-hs-scroll]');
            const prevDeckKey = prevDeck ? prevDeck.getAttribute('data-hs-scroll') : null;
            const prevDeckTop = prevDeck ? prevDeck.scrollTop : 0;
            const prevSpot = c.querySelector('.hs-spot');
            const prevSpotTop = prevSpot ? prevSpot.scrollTop : 0;
            const html = zBookHTML();
            if (c._h === html) return;
            c._h = html;
            c.innerHTML = html;
            if (prevDeckKey) {
                const nd = c.querySelector('[data-hs-scroll="' + prevDeckKey + '"]');
                if (nd) nd.scrollTop = prevDeckTop;
            }
            const ns = c.querySelector('.hs-spot');
            if (ns) ns.scrollTop = prevSpotTop;
            try { if (typeof warStartCardFx === 'function') warStartCardFx(c); } catch (e) {}
            return;
        }
        if (B3.on) { zB3Refresh(); return; }
        const m = CL.root && CL.root.querySelector('.cl-zmod.book'); if (!m || ZOO.bTurning) return; ZOO.bP = zBkPages(); ZOO.bs = Math.min(ZOO.bs, (ZOO.bP.length - 1) >> 1); zBkPaint(m);
    }
    function zRevealHTML(h) {
        try { if (typeof warCss === 'function') warCss(); } catch (e) {}
        const sp = h.sp, R = ZR[sp.rk], cs = zEggCols(h.by || [sp.id, sp.id]);
        const cardHTML = zTcgCardHTML(sp, { asDiv: true, showCost: true, showPowerInHead: true, showGlare: true });
        return '<div class="cl-zrev" style="--c:' + R.col + '"><div class="eggs">' + zEggSVG(cs[0], cs[1], true, sp.id) + '</div><div class="burst"></div><div class="res"><span class="rar">' + R.n + (h.first ? ' · NOVA ESPÉCIE!' : '') + '</span><div class="dk-grid-stage" style="width:230px;margin:8px auto;padding:6px"><canvas class="cards-fx-canvas"></canvas>' + cardHTML + '</div>' + (h.c ? '<em class="gain"><i class="ph-bold ph-diamond"></i> +' + h.c + ' cristais pela descoberta</em>' : '') + '<button type="button" class="cl-zgo" data-cl="zoo-close"><i class="ph-bold ph-check"></i><span>Legal!</span></button></div></div>';
    }
    function zReveal(h) { const m = zModal(zRevealHTML(h), 'reveal'); ZOO.modal = null; try { if (m && typeof warStartCardFx === 'function') warStartCardFx(m); } catch (e) {} }
    function zRefresh() { const m = CL.root && CL.root.querySelector('.cl-zmod'); if (!m || !ZOO.modal || ZOO.crossing || ZOO.modal === 'hatch-ritual') return; if (ZOO.modal === 'book') { try { zBookRefresh(); } catch (er) { ZOO.lastErr = 'bk ' + er; } return; } const c = m.querySelector('.cl-zcard'), html = ({ buy: zBuyHTML, pet: () => zPetHTML(ZOO.petId), breed: zBreedHTML, book: zBookHTML })[ZOO.modal](); if (ZOO.modal === 'breed') { const sig = html.replace(/data-zcd="\d+">[^<]*</g, 'data-zcd="X"><'); if (c._hbSig === sig && c.querySelector('.hb-body')) { const z0 = clZooS(); m.querySelectorAll('[data-zcd]').forEach(el => { const an0 = (z0.an || []).find(x => x.id === (+el.dataset.zcd)); if (an0 && (an0.cd || 0) > 0) el.textContent = 'Descansa ' + zClock(an0.cd); }); return; } c._hbSig = sig; } else { c._hbSig = ''; } const hsSc = m.querySelector('[data-hb-scroll="breed"]'), hsTop = hsSc ? hsSc.scrollTop : 0, top = c.scrollTop; if (c._h === html) return; c._h = html; c.innerHTML = html; c.scrollTop = top; const hsSc2 = m.querySelector('[data-hb-scroll="breed"]'); if (hsSc2) hsSc2.scrollTop = hsTop; try { if (typeof warStartCardFx === 'function') warStartCardFx(c); } catch (er) {} if (ZOO.modal === 'breed') { try { const z = clZooS(), sel = ZOO.sel || []; zbsAttach(z.an.find(x => x.id === sel[0]) || null, z.an.find(x => x.id === sel[1]) || null); } catch (er) { ZOO.lastErr = 'b3d ' + er; } } }
    function zOpen(kind) { try { if (typeof warCss === 'function') warCss(); } catch (e) {} if (kind === 'book') { zBookOpen(); return; } try { const z0 = clZooS(); zEnsureModels((z0.an || []).map(a => a.sp), false); } catch (e) {} zModal('', kind); ZOO.modal = kind; zRefresh(); }
    /* selecionar o Covil guarda a peça selecionada para ações */
    function clBichosOpenLair(i) { try { ZOO.curSel = i; } catch (er) {} }
    function clBichosSelOpen() {
        try { const s = clS(), p = s && s.pcs && s.pcs[CL.sel]; if (!p || p[0] !== 'curral') return; ZOO.curSel = CL.sel; } catch (er) {}
    }
    function clBichosClick(w, b) {
        if (w.indexOf('zoo-') !== 0) return false; if ((w.indexOf('zoo-war') === 0 || w.indexOf('zoo-forge') === 0 || w.indexOf('zoo-eq-') === 0) && warClick(w, b)) return true; const s = clS(), lay = clZooLayout(s);
        const done = (msg, bad) => { if (msg) clMsg(msg, !!bad); clUiSel(); clUiPaint(false); if (ZOO.modal === 'book') try { zBookRefresh(); } catch (er) {} };
        if (w === 'zoo-defesa') { try { if (typeof clDefesaOpen === 'function') clDefesaOpen(); else clMsg('A Arena está sendo montada. Em breve!'); } catch (e) { clMsg('A Arena está sendo montada. Em breve!'); } return true; }
        if (w === 'zoo-hatch') {
            const s = clS(), z = clZooS(s), lay = clZooLayout(s); if (ZOO.eggs.some(q => q.hat > 0)) return true; const eg = z.eggs.find(e => e.el >= e.tot); if (!eg) return true; if (z.an.length >= lay.slots) { done('Sem vaga no pasto para o filhote. Libere uma vaga!', true); return true; }
            zStartHatchRitual(eg); done(); return true;
        }
        if (w === 'zoo-unrush-egg') {
            const z = clZooS(s), idx = parseInt(b.dataset.i, 10), eg = (!isNaN(idx) ? z.eggs[idx] : null) || z.eggs.find(e => e && e.el >= e.tot && !e.manualHatch && !e.grantId);
            if (!eg || eg.el < eg.tot || eg.manualHatch || eg.grantId) return true;
            eg.el = 0; s._unrushEgg20261114v1 = Date.now(); CL.ver++; CL3.need = true; ZOO.sig = ''; ZOO.pincsig = '';
            clSave(true, 'colony-action'); clUiPaint(true);
            done('🥚 Timer de ' + zClock(eg.tot) + ' restaurado!'); return true;
        }
        if (w === 'zoo-keep-egg') {
            const z = clZooS(s), idx = parseInt(b.dataset.i, 10);
            if (isNaN(idx) || !z.eggs || !z.eggs[idx] || z.eggs.length <= 1) return true;
            z.eggs = z.eggs.filter((e, i) => i === idx || e.grantId || e.manualHatch);
            CL.ver++; CL3.need = true; ZOO.sig = ''; ZOO.pincsig = '';
            clSave(true, 'eggs-selection');
            try { if (window.ruaProfile === 'guest') window.ruaForcePush?.(); else if (typeof saveState === 'function') saveState(false); } catch (er) {}
            clUiPaint(true);
            done('🥚 Ovo selecionado mantido (' + (z.eggs[0].el >= z.eggs[0].tot ? 'Pronto' : zClock(Math.max(0, z.eggs[0].tot - z.eggs[0].el))) + '). Ovos de compensação foram preservados.'); return true;
        }
        if (w === 'zoo-colony-arena') { const ix = b.dataset.idx != null ? b.dataset.idx : b.dataset.id; if (ZOO.modal === 'hatch-ritual') zClose(); clOpenColonyArena(ix != null && ix !== '' && !isNaN(+ix) ? +ix : undefined); return true; }
        if (w === 'zoo-arena-x') { const ea = CL.root && CL.root.querySelector('.cl-colony-arena'); if (ea) ea.remove(); ZOO.modal = (CL.root && CL.root.querySelector('.cl-zmod.book')) ? 'book' : null; return true; }
        if (w === 'zoo-duel-start') { zDuelStart(); if (!(CL_TOUCH() && (LITE || (typeof ZSAFE !== 'undefined' && ZSAFE.crashed)))) zBt3Open(); return true; }   /* a arena 3D só fica de fora em aparelho realmente fraco (iPad antigo / travou antes), não no modo leve automático */
        if (w === 'zoo-bt3-x') { try { const d = zDuelGetState(); d.active = false; d.log = 'Você recuou da arena.'; } catch (e) {} zBt3Close(); return true; }
        if (w === 'zoo-duel-act') { zDuelAction(b.dataset.act); return true; }
        if (w === 'zoo-duel-tower') { zDuelSelect(parseInt(b.dataset.idx, 10) || 0); return true; }
        if (w === 'zoo-enchant-nest') { zEnchantNest(); return true; }
        if (w === 'zoo-ritual-tap') { zRitualTap(); return true; }
        if (w === 'zoo-ritual-see-book') { const spId = b.dataset.sp, z0 = clZooS(); const newest = (z0.an || []).filter(a => a.sp === spId).slice(-1)[0]; zClose(); ZOO.btab = newest ? 'mine' : 'col'; ZOO.bsp = spId; if (newest) ZOO.anId = newest.id; zOpen('book'); return true; }
        if (w === 'zoo-close') { if (ZOO.crossing) return true; const was = ZOO.modal, back = ZOO.prev === 'book'; ZOO.prev = null; if (was === 'book' && ZOO.bk3d && !ZOO.bk3d.closing) { ZOO.bk3d.closing = true; ZOO.bk3d.closeP = 0; try { aliveSound('tick'); } catch (e) {} return true; } zClose(); if (was && was !== 'book' && back) { ZOO.bnoCover = true; zOpen('book'); } return true; }
        if (w === 'zoo-buy') { ZOO.prev = ZOO.modal; zOpen('buy'); return true; }
        if (w === 'zoo-ach') { const r = clZooAch(b.dataset.id); if (r.ok) { aliveSound('coin'); try { const rb = b.getBoundingClientRect(); clJuiceFly(rb.left + rb.width / 2, rb.top + rb.height / 2, { c: r.r }); } catch (er) {} clMsg('Conquista: ' + r.n + ' · +' + r.r + ' cristais'); zRefresh(); } return true; }
        if (w === 'zoo-book') { zOpen('book'); return true; }
        if (w === 'zoo-manage') { zClose(); const s1 = clS(); let i = ZOO.curSel; if (i == null || !s1.pcs[i] || s1.pcs[i][0] !== 'curral') i = s1.pcs.findIndex(q => q[0] === 'curral'); if (i >= 0) { CL.sel = i; CL.selD = -1; CL.build = false; try { clUiSel(); clPaintBar(true); } catch (er) {} } return true; }
        if (w === 'zoo-bturn') { zBkTurn(parseInt(b.dataset.d, 10) || 1); return true; }
        if (w === 'zoo-bgo') { zBkGoto((parseInt(b.dataset.p, 10) || 0) >> 1); return true; }
        if (w === 'zoo-btab') { if ((ZOO.btab || 'mine') !== b.dataset.t) { ZOO.btab = b.dataset.t; ZOO.fuseArm = 0; ZOO.relArm = 0; ZOO.bflip = true; try { aliveSound('tick'); } catch (er) {} zRefresh(); } return true; }
        if (w === 'zoo-bflt') { const flt = b.dataset.f || 'all'; if ((ZOO.bflt || 'all') !== flt) { ZOO.bflt = flt; ZOO.fuseArm = 0; ZOO.relArm = 0; try { aliveSound('tick'); } catch (er) {} zBookRefresh(); } return true; }
        if (w === 'zoo-bflt-br') { if (ZOO.crossing) return true; const flt = b.dataset.f || 'rdy'; if ((ZOO.brFlt || 'rdy') !== flt) { ZOO.brFlt = flt; try { aliveSound('tick'); } catch (er) {} zRefresh(); } return true; }
        if (w === 'zoo-inspect') {
            const aid = parseInt(b.dataset.aid || b.dataset.id, 10) || 0;
            const spId = b.dataset.sp || null;
            if (aid) ZOO.anId = aid;
            if (spId) ZOO.bsp = spId;
            ZOO.btab = 'mine'; ZOO.fuseArm = 0; ZOO.relArm = 0;
            try { aliveSound('tick'); } catch (e) {}
            zBookRefresh();
            return true;
        }
        if (w === 'zoo-bsp') {
            const spId = b.dataset.sp || null;
            if (spId) {
                ZOO.bsp = spId;
                ZOO.fuseArm = 0; ZOO.relArm = 0;
                const s0 = clS(), z0 = clZooS(s0);
                const firstOwn = (z0.an || []).filter(a => a.sp === spId).sort((x, y) => zDragonPower(zsp(y.sp), y) - zDragonPower(zsp(x.sp), x))[0];
                ZOO.anId = firstOwn ? firstOwn.id : 0;
                try { aliveSound('tick'); } catch (e) {}
                try { if (ZOO.bk3d && ZOO.bk3d.surf) zBkSetDragon(spId); } catch (e) {}
                zBookRefresh();
                try { if (ZOO.bk3d && ZOO.bk3d.surf) zBkDragonTapFx(); } catch (e) {}
            }
            return true;
        }
        if (w === 'zoo-pick-dup') {
            const aid = parseInt(b.dataset.aid, 10), spId = b.dataset.sp;
            if (aid) ZOO.anId = aid;
            if (spId) ZOO.bsp = spId;
            ZOO.fuseArm = 0; ZOO.relArm = 0;
            try { aliveSound('tick'); } catch (e) {}
            zBookRefresh();
            return true;
        }
        if (w === 'zoo-sel-animal') {
            const aid = parseInt(b.dataset.aid || b.dataset.id, 10);
            const z = clZooS();
            const an = z.an.find(x => x.id === aid);
            const spId = b.dataset.sp && isNaN(parseInt(b.dataset.sp, 10)) ? b.dataset.sp : (an ? an.sp : b.dataset.sp);
            if (aid) ZOO.anId = aid;
            ZOO.fuseArm = 0; ZOO.relArm = 0;
            if (spId) {
                ZOO.bsp = spId;
                try { if (ZOO.bk3d && ZOO.bk3d.surf) zBkSetDragon(spId); } catch (e) {}
            }
            try { aliveSound('tick'); } catch (e) {}
            zBookRefresh();
            try { if (ZOO.bk3d && ZOO.bk3d.surf) zBkDragonTapFx(); } catch (e) {}
            return true;
        }
        if (w === 'zoo-chpg') {
            ZOO.chPage = Math.max(0, (ZOO.chPage || 0) + (parseInt(b.dataset.d, 10) || 0));
            try { aliveSound('tick'); } catch (e) {}
            zBookRefresh();
            return true;
        }
        if (w === 'zoo-rename') {
            const id = parseInt(b.dataset.id, 10), a = (clZooS(s).an || []).find(x => x.id === id);
            if (!a) return true;
            const nn = window.prompt('Apelido do dragão (deixe vazio para o padrão):', a.nm || '');
            if (nn === null) return true;
            const r = clZooRename(id, nn);
            if (r.ok) {
                zRefresh();
                if (ZOO.modal === 'book') zBookRefresh();
                done(r.nm ? 'Renomeado para ' + r.nm + '!' : 'Apelido removido.');
            } else done(r.err, true);
            return true;
        }
        if (w === 'zoo-fuse') {
            const id = parseInt(b.dataset.id, 10), dst = parseInt(b.dataset.dst, 10);
            const a = (clZooS(s).an || []).find(x => x.id === id);
            if (!a) return true;
            if (ZOO.fuseArm !== id) {
                ZOO.fuseArm = id; ZOO.relArm = 0;
                clearTimeout(ZOO._fuseT);
                ZOO._fuseT = setTimeout(() => { if (ZOO.fuseArm === id) { ZOO.fuseArm = 0; if (ZOO.modal === 'book') zBookRefresh(); } }, 3500);
                try { aliveSound('tick'); } catch (e) {}
                zRefresh(); if (ZOO.modal === 'book') zBookRefresh();
                done('Toque novamente para fundir ' + zDragonLabel(zsp(a.sp), a, clZooS(s)) + '!');
                return true;
            }
            ZOO.fuseArm = 0;
            const r = clZooFuse(id, dst);
            if (r.ok) {
                try { aliveSound('upgrade'); } catch (e) {}
                clFarmBuzz([25, 45, 25]);
                ZOO.anId = r.dst.id;
                zRefresh();
                if (ZOO.modal === 'book') zBookRefresh();
                done('Fusão concluída! ' + zDragonLabel(r.sp, r.dst, clZooS()) + (r.gainedStar ? ' ★' + r.star : '') + ' (+' + r.xpGain + ' XP)');
                if (r.gainedStar) zEvoCine(r.dst, zAL(r.dst), { star: r.star, from: r.star - r.gainedStar });
            } else done(r.err, true);
            return true;
        }
        if (w === 'zoo-breed') { ZOO.prev = ZOO.modal; ZOO.sel = []; zOpen('breed'); return true; }
        if (w === 'zoo-pet') { ZOO.prev = ZOO.modal; ZOO.petId = parseInt(b.dataset.id, 10); zOpen('pet'); return true; }
        if (w === 'zoo-reload') { ZOO.list.forEach(e => zDetach(e.g)); ZOO.list = []; ZOO.eggs.forEach(e => { zDetach(e.g); if (e.bar) zDetach(e.bar.spr); }); ZOO.eggs = []; ZOO.sig = ''; ZOO.pastures = []; CL3.need = true; done('Recarregando os dragões…'); return true; }
        if (w === 'zoo-auto') { const z0 = clZooS(s); z0.auto = z0.auto === false ? true : false; CL.ver++; clSave(true); done(z0.auto ? 'Ração automática ligada: usa a biomassa que sobra (reserva de ' + zReserve(s) + ').' : 'Ração automática desligada.'); return true; }
        if (w === 'zoo-slot') { if (ZOO.crossing) return true; const k = parseInt(b.dataset.k, 10), sel = (ZOO.sel || []).slice(); if (sel[k] !== undefined) { sel.splice(k, 1); ZOO.sel = sel; zRefresh(); } return true; }
        if (w === 'zoo-levelup') { const r = clZooLevelUp(parseInt(b.dataset.id, 10)); if (r.ok) { aliveSound('upgrade'); clFarmBuzz([20, 40, 20]); zRefresh(); if (ZOO.modal === 'book') zBookRefresh(); done('Subiu para o nível ' + r.lv + '!'); zEvoCine(r.a, r.lv - 1); } else done(r.err, true); return true; }
        if (w === 'zoo-pick') { if (ZOO.crossing) return true; const id = parseInt(b.dataset.id, 10); let sel = ZOO.sel || []; sel = sel.indexOf(id) >= 0 ? sel.filter(x => x !== id) : sel.concat(id).slice(-2); ZOO.sel = sel; zRefresh(); return true; }
        if (w === 'zoo-buy-do') { const backBook = ZOO.prev === 'book'; const r = clZooBuy(b.dataset.sp); if (r.ok) { aliveSound('chirp'); clFarmBuzz(10); ZOO.prev = null; zClose(); if (backBook) { ZOO.bsp = r.sp.id; ZOO.btab = 'col'; zOpen('book'); } done(r.sp.n + ' chegou ao Covil!' + (r.first ? ' Nova espécie: +' + ZDISC[0] + ' cristais.' : '')); } else done(r.err, true); return true; }
        if (w === 'zoo-feed-one' || w === 'zoo-feed-all') { done('Seus dragões não precisam mais de ração.', true); return true; }
        if (false) { const r = clZooFeed(parseInt(b.dataset.id, 10), 8); if (r.ok) { aliveSound('coin'); zFeedFx([parseInt(b.dataset.id, 10)]); zRefresh(); if (ZOO.modal === 'book') zBookRefresh(); done('Alimentado: -' + r.cost + ' biomassa'); } else done('Sem biomassa para a ração.', true); return true; }
        if (w === 'zoo-feed-all') { const r = clZooFeed(0, 8); if (r.ok) { aliveSound('chirp'); zFeedFx(null); done('Ração servida: -' + r.cost + ' biomassa · ' + r.n + (r.n > 1 ? ' dragões' : ' dragão')); } else done('Todos já estão alimentados (ou faltou biomassa).', true); return true; }
        if (w === 'zoo-release') {
            const id = parseInt(b.dataset.id, 10), a = clZooS(s).an.find(x => x.id === id);
            if (!a) return true;
            const armed = ZOO.relArm === id || b.dataset.sure === '1';
            if (!armed) {
                ZOO.relArm = id; ZOO.fuseArm = 0;
                try { b.dataset.sure = '1'; const spn = b.querySelector('span'); if (spn) spn.textContent = 'Toque de novo para soltar'; } catch (e) {}
                clearTimeout(ZOO._relT);
                ZOO._relT = setTimeout(() => { try { b.dataset.sure = ''; } catch (e) {} if (ZOO.relArm === id) { ZOO.relArm = 0; if (ZOO.modal === 'book') zBookRefresh(); } }, 3000);
                if (ZOO.modal === 'book') zBookRefresh();
                done('Toque novamente para soltar ' + zDragonLabel(zsp(a.sp), a, clZooS(s)));
                return true;
            }
            ZOO.relArm = 0;
            const spId = a.sp;
            const r = clZooRelease(id);
            if (r.ok) {
                if (ZOO.modal === 'book') {
                    const z2 = clZooS();
                    const nx = (z2.an || []).find(x => x.sp === spId) || (z2.an || [])[0];
                    ZOO.anId = nx ? nx.id : 0;
                    zBookRefresh();
                } else {
                    zClose();
                }
                done('Liberado do Covil: +' + r.g + ' biomassa');
            }
            return true;
        }
        if (w === 'zoo-collect') { const r = clZooCollect(); if (r.ok) { aliveSound('coin'); clFarmBuzz([14, 30, 14]); r.items.forEach((it, k) => { const e = ZOO.list.find(q => q.id === it.id), xy = e && zScreen(e); setTimeout(() => { try { aliveSound('coin'); } catch (er) {} }, k * 100); if (xy) clFarmPop(xy[0], xy[1] - 20, farmRew(Math.round(it.b), Math.round(it.c)), it.col, k * 100); }); try { const rb = b.getBoundingClientRect(); clJuiceFly(rb.left + rb.width / 2, rb.top + rb.height / 2, { b: r.b, c: r.c }); } catch (er) {} clMsg('Coletado: +' + r.b + ' biomassa' + (r.c ? ' · +' + r.c + ' cristais' : '')); } done(); return true; }
        if (w === 'zoo-breed-go') { const sel = ZOO.sel || []; const pa0 = clZooS().an.find(x => x.id === sel[0]), pb0 = clZooS().an.find(x => x.id === sel[1]); if (ZOO.crossing) return true; const r = clZooBreed(sel[0], sel[1]); if (r.ok) { aliveSound('chirp'); clFarmBuzz(20); ZOO.sel = [];
            const fin = () => { ZOO.crossing = false; try { const bm = CL.root && CL.root.querySelector('.cl-zmod.breed'); if (bm) bm.classList.remove('is-crossing'); } catch (e0) {} zClose(); const zz = clZooS(), eg = zz.eggs[zz.eggs.length - 1]; if (eg) { eg.ln = Date.now(); zWorldEggArrive(eg); } ZOO.sig = ''; done(); };
            if (pa0 && pb0 && ZBS.run && ZBS.slot[0] && ZBS.slot[1]) { ZOO.crossing = true; try { const bm = CL.root && CL.root.querySelector('.cl-zmod.breed'); if (bm) bm.classList.add('is-crossing'); aliveSound('upgrade'); clFarmBuzz([30, 60, 30, 90]); } catch (e3) {} zbsCross(pa0, pb0, fin); const bt = document.querySelector('.cl-zmod .hb-cross-btn, .cl-zmod .cl-zgo'); if (bt) bt.disabled = true; } else fin(); } else done(r.err, true); return true; }
        return false;
    }

    /* ---------- 3D: bichos feitos por código ---------- */
    function zReset() { ZOO.lmat = {}; ZOO.root = null; ZOO.list = []; ZOO.eggs = []; ZOO.pastures = []; ZOO.sig = ''; ZOO.G = null; ZOO.M = {}; ZOO.pscene = CL3.sc; }
    function zG() {
        if (ZOO.pscene !== CL3.sc) zReset(); if (ZOO.G) return ZOO.G; const T = clTh(), cy = new T.CylinderGeometry(0.5, 0.5, 1, 8); cy.translate(0, -0.5, 0); const cn = new T.CylinderGeometry(0, 0.5, 1, 8); cn.translate(0, 0.5, 0); const rg = new T.RingGeometry(0.35, 0.5, 28); rg.rotateX(-Math.PI / 2);
        const ep = []; for (let i = 0; i <= 28; i++) { const t = i / 28 * Math.PI, r = 0.5 * Math.sin(t) * (1 - 0.13 * Math.cos(t)); ep.push(new T.Vector2(Math.max(0.0001, r), 0.5 * Math.cos(t))); } const eggG = new T.LatheGeometry(ep, 28);
        ZOO.G = { egg: eggG, sp: new T.SphereGeometry(0.5, 12, 9), sl: new T.SphereGeometry(0.5, 7, 5), leg: cy, cone: cn, box: new T.BoxGeometry(1, 1, 1), ring: rg }; return ZOO.G;
    }
    function zMat(hex, emi) {   /* cores vivas: quase sem escurecer e com um brilho próprio leve, para não apagarem à noite */
        const k = hex + '|' + (emi || ''); if (ZOO.pscene !== CL3.sc) zReset(); if (ZOO.M[k]) return ZOO.M[k]; const T = clTh(), c = new T.Color(hex).multiplyScalar(0.66), e = emi ? new T.Color(emi) : new T.Color(hex).multiplyScalar(0.05);
        return (ZOO.M[k] = new T.MeshLambertMaterial({ color: c, emissive: e }));
    }
    /* ---------- modelos 3D reais (Poly Pizza, Quaternius, Sketchfab): entram no lugar dos feitos por código quando carregam ---------- */
    const ZDB = {   /* os 5 modelos-base de dragão: demon, fire, icy, mountain, elder */
        red: { f: 'dragons/red.glb', fly: /fly/i, fts: 1, yaw: -Math.PI / 2, nb: 1 },
        ulyssan: { f: 'dragons/ulyssan.glb', fly: /fly_glide|fly/i, idle: /idle_calm|idle/i, walk: /walk/i, atk: /attack_claw|attack_bite|cast_ice/i, hit: /hurt_heavy|hurt/i, die: /death_ground|death/i, fts: 1, yaw: -Math.PI / 2, nb: 1 },
        eternatus: { f: 'dragons/eternatus.glb', fly: /eternatus_fly/i, idle: /eternatus_idle/i, atk: /attack/i, hit: /faint/i, die: /faint/i, fts: 1, yaw: -Math.PI / 2, nb: 1 },
        devil: { f: 'dragons/devil.glb', fly: /^fly$/i, fts: 1, yaw: -Math.PI / 2, nb: 1 },
        fire2: { f: 'dragons/fire2.glb', fly: /fly/i, fts: 1, yaw: -Math.PI / 2, nb: 1 },
        poison: { f: 'dragons/poison.glb', fly: /./, fts: 1, yaw: -Math.PI / 2, nb: 1 },
        wyvern: { f: 'dragons/wyvern.glb', fly: /^Flying/i, idle: /^Standing/i, walk: /^Walking/i, atk: /^Attack/i, fts: 1, yaw: 0, nb: 1 },
        nightmare: { f: 'dragons/nightmare.glb', fly: /^flying$/i, idle: /^idle roosting/i, walk: /^walking$/i, fts: 1, yaw: 0, nb: 1 },
        bw: { f: 'dragons/bw.glb', fly: /^fly$/i, fts: 1, yaw: -Math.PI / 2, nb: 1 },
        tilt: { f: 'dragons/tilt.glb', fly: /Blade_Spin/i, also: /Ground_Idle/i, fts: 1, yaw: Math.PI / 2, nb: 1 },
        nimbo_autoral: { f: 'dragons/nimbo_autoral.glb', fly: /^Flying_Idle$/i, idle: /^Flying_Idle$/i, atk: /^NeedleVolley$/i, hit: /^Hit$/i, die: /^Defeat$/i, fts: 1, yaw: 0, nb: 1, rawPbr: 1 },
        cartoon: { f: 'dragons/cartoon.glb', fly: /^CharacterArmature\|Flying_Idle$/i, idle: /Flying_Idle/i, atk: /Punch|Headbutt/i, hit: /HitReact/i, die: /Death/i, fts: 1, yaw: Math.PI / 2, nb: 1 },
        morcego: { f: 'dragons/morcego.glb', fly: /Bat\|Flying/i, idle: /Rest/i, fts: 1, yaw: Math.PI / 2, nb: 1 },
        chamas: { f: 'dragons/chamas.glb', fly: /Flying/i, fts: 1, yaw: 0, nb: 1 },
        hamster: { f: 'dragons/hamster.glb', fly: /Bat\|Flying/i, also: /^Animation$/i, fts: 1, yaw: -Math.PI / 2, nb: 1 },
        sage: { f: 'dragons/sage.glb', fly: /Fly$/i, idle: /Idle$/i, atk: /Attack$/i, fts: 1, yaw: -Math.PI / 2, nb: 1 },
        watcher: { f: 'dragons/watcher.glb', fly: /./, fts: 1, yaw: Math.PI / 2, nb: 1, keepScale: 1, hide: /^(Sword4.*|Object_(?:16\d|17[0-3]))$/i },   /* keepScale: o esqueleto (Armature 100x) precisa das escalas animadas; hide: espadas soltas que esticavam a caixa */
        mini: { f: 'dragons/mini.glb', fly: /./, fts: 1, yaw: -Math.PI / 2, nb: 1 },
        demon: { f: 'dragons/demon.glb', fly: /^flying$/, seg: [0.07, 3.3], fts: 1.3, pit0: 0.12, strip: ['root.4_219', 'pelvis.5_218'], idle: /^idle$/, walk: /^running$/, atk: /^running$/ },
        fire: { f: 'dragons/fire.glb', fly: /./, seg: [7.63, 8.53], fts: 1, strip: ['Bone009_01'] },
        icy: { f: 'dragons/icy.glb', fly: /./, seg: [5.07, 6.63], fts: 1, strip: ['Bone001_01'], hide: /^(Object_9|Object_11|Object_13)$/ },
        mountain: { f: 'dragons/mountain.glb', fly: /./, seg: [0.1, 3.2], fts: 0.95, pit0: 0.06 },
        elder: { f: 'dragons/elder.glb', fly: /Flying/i, idle: /Flying/i, atk: /Attack/i, hit: /Hit/i, die: /Death/i, fts: 1.05 },
        demonio_cinzas: { f: 'dragons/demonio_cinzas.glb', fly: /^flying$/i, idle: /^idle$/i, walk: /^running$/i, atk: /^running$/i, fts: 1.15, yaw: Math.PI / 2, pit0: 0.12, strip: ['root.4_219', 'pelvis.5_218'], nb: 1, rawPbr: 1 },
        morcego_noturno: { f: 'dragons/morcego_noturno.glb', fly: /Swim/i, fts: 1, yaw: Math.PI / 2, nb: 1, finish: ['obsidian', 'liquid_mirror'] },
        colosso_obsidiana: { f: 'dragons/colosso_obsidiana.glb', fly: /^fly$/i, fts: 1, yaw: -Math.PI / 2, nb: 1, rawPbr: 1 },
        sereia_glacial: { f: 'custom:sereia_glacial', custom: 1, fts: 1, yaw: Math.PI / 2, nb: 1 },
        guardiao_botanico: { f: 'dragons/guardiao_botanico.glb', fly: /^Flying/i, idle: /^Standing/i, walk: /^Walking/i, fts: 1, yaw: 0, nb: 1, rawPbr: 1 },
        arquimago_astral: { f: 'dragons/arquimago_astral.glb', fly: /btl_0011/i, idle: /btl_0011/i, atk: /btl_2201|btl_2001/i, fts: 1, yaw: Math.PI / 2, nb: 1, finish: ['obsidian', 'liquid_mirror'], wingBoost: 1 },
        esmeralda: { f: 'dragons/esmeralda.glb', fly: null, idle: null, walk: null, fts: 1, yaw: Math.PI / 2, nb: 1, rawPbr: 1, standStill: 1, webWingBoost: 1 },
        aurora: { f: 'dragons/aurora.glb', fly: /Take/i, fts: 1, yaw: 0, nb: 1, finish: ['amethyst', 'reptile_matte'] },
        crono_engenheiro: { f: 'dragons/crono_engenheiro.glb', fly: /Flying/i, idle: /Flying/i, atk: /Attack/i, fts: 1, yaw: Math.PI / 2, nb: 1, rawPbr: 1 },
        prisma_cristal: { f: 'dragons/ulyssan.glb', fly: /fly_glide|fly/i, idle: /idle_calm|idle/i, walk: /walk/i, atk: /attack_claw|attack_bite|cast_ice/i, hit: /hurt_heavy|hurt/i, die: /death_ground|death/i, fts: 1, yaw: -Math.PI / 2, nb: 1, finish: ['prisma', 'liquid_mirror'] }
    };
    const ZMD = {}; ZSP.forEach(sp => { ZMD[sp.id] = { f: ZDB[sp.base].f, D: sp.D, yaw: ZDB[sp.base].yaw !== undefined ? ZDB[sp.base].yaw : Math.PI / 2, nb: !!ZDB[sp.base].nb, dragon: true, base: sp.base, tint: sp.tint, glow: sp.glow }; });
    const zModelOk = f => (typeof f === 'string' && f.indexOf('custom:') === 0) || !!(CLM.tpl[f] && CLM.tpl[f].gl);
    /* modelos de bloco único (galinha, pato, ganso, cabra, carneiro, unicórnio) não têm ossos: crio um esqueleto simples e distribuo o peso pelas pernas, assim elas balançam de verdade */
    function zRig(m, bird) {
        const T = clTh(), out = []; const list = []; m.traverse(o => { if (o.isMesh && !o.isSkinnedMesh && o.geometry && o.geometry.attributes.position) list.push(o); });
        list.forEach(o => {
            const g = o.geometry.clone(); g.computeBoundingBox(); const bb = g.boundingBox, h = bb.max.y - bb.min.y, pos = g.attributes.position, n = pos.count;
            const yF = bb.min.y + h * (bird ? 0.12 : 0.22), yZ = bb.min.y + h * (bird ? 0.3 : 0.42), cx = (bb.min.x + bb.max.x) / 2, yLow = bb.min.y + h * 0.15, zs = [];
            for (let i = 0; i < n; i++) if (pos.getY(i) < yLow) zs.push(pos.getZ(i)); zs.sort((a, b) => a - b); const cz = zs.length ? zs[zs.length >> 1] : (bb.min.z + bb.max.z) / 2;
            const key = i => (pos.getX(i) > cx ? 1 : 0) + (bird ? 0 : (pos.getZ(i) > cz ? 2 : 0)), nk = bird ? 2 : 4, acc = []; for (let k = 0; k < nk; k++) acc.push({ x: 0, z: 0, c: 0 });
            for (let i = 0; i < n; i++) if (pos.getY(i) < yLow) { const a = acc[key(i)]; a.x += pos.getX(i); a.z += pos.getZ(i); a.c++; }
            const root = new T.Bone(), bones = [root]; root.position.set(0, 0, 0);
            const phs = bird ? [0, Math.PI] : [Math.PI, 0, 0, Math.PI];   /* 0=esq.trás 1=dir.trás 2=esq.frente 3=dir.frente: pares em diagonal */
            for (let k = 0; k < nk; k++) { const a = acc[k], b = new T.Bone(); b.position.set(a.c ? a.x / a.c : cx, yZ, bird ? (bb.min.z + bb.max.z) / 2 : (a.c ? a.z / a.c : cz)); bones.push(b); out.push({ b, ph: phs[k], hip: yZ, h }); }
            const si = new Uint16Array(n * 4), sw = new Float32Array(n * 4);
            for (let i = 0; i < n; i++) { const y = pos.getY(i); let t = (yZ - y) / (yZ - yF); t = Math.max(0, Math.min(1, t)); t = t * t * (3 - 2 * t); si[i * 4] = 1 + key(i); sw[i * 4] = t; si[i * 4 + 1] = 0; sw[i * 4 + 1] = 1 - t; }
            g.setAttribute('skinIndex', new T.Uint16BufferAttribute(si, 4)); g.setAttribute('skinWeight', new T.Float32BufferAttribute(sw, 4));
            const sm = new T.SkinnedMesh(g, o.material); sm.name = o.name; sm.position.copy(o.position); sm.quaternion.copy(o.quaternion); sm.scale.copy(o.scale); sm.frustumCulled = false; sm.castShadow = true; sm.receiveShadow = true;
            bones.forEach(b => sm.add(b)); o.parent.add(sm); o.parent.remove(o); m.updateMatrixWorld(true); sm.bind(new T.Skeleton(bones), sm.matrixWorld);
        });
        return out;
    }
    function zSheepLegs(B, gait, gp) {
        try {
            const T = clTh(); if (!ZOO.q1) { ZOO.q1 = new T.Quaternion(); ZOO.q2 = new T.Quaternion(); ZOO.ax = new T.Vector3(); ZOO.dq = new T.Quaternion(); }
            B.pv.updateMatrixWorld(true); B.pv.getWorldQuaternion(ZOO.q1); const A = 0.55 * gait; if (A < 0.01) return;
            B.sleg.forEach(l => { const par = l.b.parent; if (!par) return; par.getWorldQuaternion(ZOO.q2); ZOO.ax.set(1, 0, 0).applyQuaternion(ZOO.q1).applyQuaternion(ZOO.q2.invert()).normalize(); ZOO.dq.setFromAxisAngle(ZOO.ax, Math.sin(gp + l.ph) * A); l.b.quaternion.premultiply(ZOO.dq); });
        } catch (er) {}
    }
    function zPosedBox(m) {   /* caixa do modelo na pose atual, com os ossos aplicados (o cálculo comum ignora o esqueleto) */
        const T = clTh(), b = new T.Box3(), v = new T.Vector3(); m.updateMatrixWorld(true); m.traverse(o => { if (o.isSkinnedMesh && o.skeleton) o.skeleton.update(); });
        m.traverse(o => { if (!o.isMesh || !o.visible || !o.geometry.attributes.position) return; const p = o.geometry.attributes.position, st = Math.max(1, Math.floor(p.count / 3000)); for (let i = 0; i < p.count; i += st) { v.fromBufferAttribute(p, i); if (o.isSkinnedMesh) o.boneTransform(i, v); v.applyMatrix4(o.matrixWorld); b.expandByPoint(v); } });
        return b;
    }
    function zTintMap(map, hex, k) {   /* textura recolorida: matiz da espécie, brilho e detalhe da original (cacheada) */
        try { const T = clTh(), img = map && map.image; if (!img || !(img.width > 0)) return null; ZOO.tmc = ZOO.tmc || {}; const key = map.uuid + '|' + hex + '|' + k.toFixed(2); if (ZOO.tmc[key]) return ZOO.tmc[key];
            const sz = Math.min(1024, img.width), cv = document.createElement('canvas'); cv.width = sz; cv.height = Math.max(1, Math.round(sz * img.height / img.width)); const g = cv.getContext('2d', { willReadFrequently: true }); g.drawImage(img, 0, 0, cv.width, cv.height); const id = g.getImageData(0, 0, cv.width, cv.height), d = id.data, col = new T.Color(hex), tr = col.r * 255, tg = col.g * 255, tb = col.b * 255;
            for (let i = 0; i < d.length; i += 4) { const lum = (0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2]) / 255, l2 = Math.min(1.25, 0.28 + 1.5 * lum); d[i] = d[i] + (Math.min(255, tr * l2) - d[i]) * k; d[i + 1] = d[i + 1] + (Math.min(255, tg * l2) - d[i + 1]) * k; d[i + 2] = d[i + 2] + (Math.min(255, tb * l2) - d[i + 2]) * k; }
            g.putImageData(id, 0, 0); const t = new T.CanvasTexture(cv); t.flipY = map.flipY; t.encoding = map.encoding; t.wrapS = map.wrapS; t.wrapT = map.wrapT; t.magFilter = map.magFilter; t.minFilter = map.minFilter; t.generateMipmaps = map.generateMipmaps; t.anisotropy = 4; return (ZOO.tmc[key] = t); } catch (e) { return null; }
    }
    const ZCF_CACHE = { maps: {}, uTime: { value: 0 } };
    const ZCF_PALS = {
        obsidian: { back: '#14121f', mid: '#262038', tip: '#fbbf24', belly: '#362c4d', rim: '#fde047' },
        amethyst: { back: '#1e1038', mid: '#8b5cf6', tip: '#f5d0fe', belly: '#faf5ff', rim: '#e879f9' },
        prisma:   { back: '#0284c7', mid: '#38bdf8', tip: '#f0abfc', belly: '#f0f9ff', rim: '#7dd3fc' }
    };
    const ZCF_PROFS = {
        liquid_mirror: { tex: 'biolum_spots', rough: 0.04, metal: 1.00, cc: 1.00, ccR: 0.02, env: 2.2, bump: 0.03, em: 0.9 },
        reptile_matte: { tex: 'scales_pbr',   rough: 0.88, metal: 0.02, cc: 0.00, ccR: 1.00, env: 0.42, nSc: 3.1, em: 0.25 }
    };
    function zCustomFinishMaps(T, texId) {
        if (ZCF_CACHE.maps[texId]) return ZCF_CACHE.maps[texId];
        if (texId === 'scales_pbr') {
            const tl = new T.TextureLoader();
            const ld = (u, srgb) => { const t = tl.load(u); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(3, 3); if (srgb && T.sRGBEncoding) t.encoding = T.sRGBEncoding; return t; };
            return (ZCF_CACHE.maps[texId] = {
                map: ld('./assets/colony/dragons/tex_scales.jpg', true),
                normalMap: ld('./assets/colony/dragons/tex_scales_nrm.jpg', false),
                roughnessMap: ld('./assets/colony/dragons/tex_scales_rgh.jpg', false)
            });
        }
        const w = 512, h = 512;
        const cC = document.createElement('canvas'); cC.width = w; cC.height = h; const gC = cC.getContext('2d');
        const cB = document.createElement('canvas'); cB.width = w; cB.height = h; const gB = cB.getContext('2d');
        const cE = document.createElement('canvas'); cE.width = w; cE.height = h; const gE = cE.getContext('2d');
        gC.fillStyle = '#e2e6f0'; gC.fillRect(0, 0, w, h);
        gB.fillStyle = '#808080'; gB.fillRect(0, 0, w, h);
        gE.fillStyle = '#000000'; gE.fillRect(0, 0, w, h);
        for (let i = 0; i < 600; i++) {
            const x = (i * 73) % w, y = (i * 139) % h, rad = 2 + (i % 3);
            gB.fillStyle = i % 2 ? '#a8a8a8' : '#4a4a4a'; gB.beginPath(); gB.arc(x, y, rad, 0, Math.PI * 2); gB.fill();
        }
        for (let i = 0; i < 110; i++) {
            const x = (i * 113 + 17) % w, y = (i * 197 + 31) % h, rad = 4 + (i % 6) * 2.2;
            const rg = gE.createRadialGradient(x, y, 1, x, y, rad * 1.4);
            rg.addColorStop(0, '#fffbeb'); rg.addColorStop(0.45, i % 3 === 0 ? '#fde047' : '#38bdf8'); rg.addColorStop(1, 'transparent');
            gE.fillStyle = rg; gE.beginPath(); gE.arc(x, y, rad * 1.4, 0, Math.PI * 2); gE.fill();
            gB.fillStyle = '#f0f0f0'; gB.beginPath(); gB.arc(x, y, rad * 0.7, 0, Math.PI * 2); gB.fill();
        }
        const wrap = (cv, srgb) => { const t = new T.CanvasTexture(cv); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(2, 2); if (srgb && T.sRGBEncoding) t.encoding = T.sRGBEncoding; return t; };
        return (ZCF_CACHE.maps[texId] = { map: wrap(cC, true), bumpMap: wrap(cB, false), emissiveMap: wrap(cE, true) });
    }
    function zApplyCustomFinish(T, o, palId, skinId) {
        const pal = ZCF_PALS[palId] || ZCF_PALS.obsidian, prof = ZCF_PROFS[skinId] || ZCF_PROFS.liquid_mirror;
        const g = o.geometry;
        if (g && g.attributes && g.attributes.position && !g.userData._zcfUv) {
            g.userData._zcfUv = true;
            g.computeBoundingBox();
            const bb = g.boundingBox, pos = g.attributes.position;
            const sx = Math.max(0.01, bb.max.x - bb.min.x), sz = Math.max(0.01, bb.max.z - bb.min.z);
            const uvs = new Float32Array(pos.count * 2);
            for (let i = 0; i < pos.count; i++) {
                uvs[i * 2] = (pos.getX(i) - bb.min.x) / sx;
                uvs[i * 2 + 1] = (pos.getZ(i) - bb.min.z) / sz;
            }
            g.setAttribute('uv', new T.BufferAttribute(uvs, 2));
        }
        if (g) g.computeBoundingBox();
        const bb = g && g.boundingBox;
        const halfSpan = bb ? Math.max(Math.abs(bb.max.x), Math.abs(bb.min.x), 0.5) : 1.0;
        const sMaps = zCustomFinishMaps(T, prof.tex);
        const isSkinned = !!o.isSkinnedMesh;
        const opts = {
            color: '#ffffff', roughness: prof.rough, metalness: prof.metal,
            clearcoat: prof.cc, clearcoatRoughness: prof.ccR, envMapIntensity: prof.env,
            side: T.DoubleSide, shadowSide: T.DoubleSide, skinning: isSkinned
        };
        if (sMaps.map) opts.map = sMaps.map;
        if (sMaps.normalMap) { opts.normalMap = sMaps.normalMap; opts.normalScale = new T.Vector2(prof.nSc || 2.0, prof.nSc || 2.0); }
        if (sMaps.roughnessMap && prof.rough > 0.2 && prof.rough < 0.92) opts.roughnessMap = sMaps.roughnessMap;
        if (sMaps.bumpMap) { opts.bumpMap = sMaps.bumpMap; opts.bumpScale = prof.bump || 0.06; }
        if (sMaps.emissiveMap) { opts.emissiveMap = sMaps.emissiveMap; opts.emissive = new T.Color(pal.rim); opts.emissiveIntensity = prof.em; }
        const mat = new T.MeshPhysicalMaterial(opts);
        const cBack = new T.Color(pal.back), cMid = new T.Color(pal.mid), cTip = new T.Color(pal.tip), cBelly = new T.Color(pal.belly), cRim = new T.Color(pal.rim);
        mat.onBeforeCompile = sh => {
            sh.uniforms.uTime = ZCF_CACHE.uTime;
            sh.uniforms.uBack = { value: cBack }; sh.uniforms.uMid = { value: cMid }; sh.uniforms.uTip = { value: cTip };
            sh.uniforms.uBelly = { value: cBelly }; sh.uniforms.uRim = { value: cRim }; sh.uniforms.uSpan = { value: Math.max(0.5, halfSpan) };
            sh.vertexShader = 'varying vec3 vAurPos;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n  vAurPos = position;');
            sh.fragmentShader = 'varying vec3 vAurPos;\nuniform float uTime;\nuniform vec3 uBack,uMid,uTip,uBelly,uRim;\nuniform float uSpan;\n' + sh.fragmentShader.replace(
                '#include <color_fragment>',
                '#include <color_fragment>\n{ float wSpan = clamp(abs(vAurPos.x) / uSpan, 0.0, 1.0); float flow = 0.5 + 0.5 * sin(wSpan * 9.0 - vAurPos.z * 2.5 - uTime * 2.2); vec3 wingCol = mix(uBack, uMid, smoothstep(0.08, 0.58, wSpan)); wingCol = mix(wingCol, uTip, smoothstep(0.54, 0.96, wSpan)); wingCol = mix(wingCol, uRim, flow * 0.24 * smoothstep(0.18, 0.85, wSpan)); float bellyK = smoothstep(0.15, -0.35, vAurPos.y / max(0.3, uSpan * 0.35)); diffuseColor.rgb *= mix(wingCol, uBelly, bellyK * 0.45) * 1.45; }'
            ).replace(
                '#include <emissivemap_fragment>',
                '#include <emissivemap_fragment>\n{ float wTip = smoothstep(0.48, 0.98, clamp(abs(vAurPos.x) / uSpan, 0.0, 1.0)); float fres = pow(1.0 - abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0))), 2.2); float pulse = 0.80 + 0.20 * sin(uTime * 2.6 - abs(vAurPos.x) * 3.0); totalEmissiveRadiance += uRim * (wTip * 0.52 + fres * 0.38) * pulse; }'
            );
        };
        mat.customProgramCacheKey = () => 'zcf_' + skinId + '_' + palId + '_' + (isSkinned ? 1 : 0);
        return mat;
    }
    function zBuildDragon(sp, D, al) {
        const T = clTh(), tpl = CLM.tpl[D.f], DB = ZDB[D.base], root = new T.Group(), body = new T.Group(); root.add(body);
        const m = T.SkeletonUtils.clone(tpl.gl.scene);
        if (DB.fixBatEyes) {
            m.updateMatrixWorld(true);
            let hd = null, ea = null, ey = null;
            m.traverse(o => { if (o.name === 'Head' && o.isBone) hd = o; if (o.name === 'EyeArmature') ea = o; if (o.name === 'Eyes') ey = o; });
            if (hd && ea) hd.attach(ea); else if (hd && ey) hd.attach(ey);
        }
        const roleOf = (o, mt) => {
            const mn = (mt && mt.name) || '';
            if (mn === 'Eyes') return 'head';
            if (mn === 'Wings') return 'wing';
            if (mn === 'Claws') return 'claw';
            if (mn === 'Belly') return 'belly';
            if (mn === 'Main') return 'main';
            if (mn === 'M_MountainDragon') return 'body';
            const n = o.name;
            if (D.base === 'demon') return n === 'Object_8' ? 'wing' : n === 'Object_10' ? 'head' : 'body';
            if (D.base === 'fire') return n === 'Object_15' ? 'head' : n === 'Object_17' ? 'claw' : 'body';
            return n === 'Object_15' ? 'claw' : 'body';
        };
        const rk = sp.rk | 0, rcol = ZR[rk].col, el = sp.el || 'terra', isElder = D.base === 'elder';
        m.traverse(o => {
            if (!o.isMesh) return;
            if (DB.hide && DB.hide.test(o.name)) { o.visible = false; return; }
            if (o.geometry && (!o.geometry.attributes || !o.geometry.attributes.normal)) {
                try { o.geometry.computeVertexNormals(); } catch (eN) {}
            }
            o.castShadow = true;
            o.receiveShadow = false;
            o.frustumCulled = false;

            const f = mt => {
                if (DB.finish) return zApplyCustomFinish(T, o, DB.finish[0], DB.finish[1]);
                if (DB.rawPbr) {
                    const c = mt.clone();
                    c.side = T.DoubleSide;
                    c.shadowSide = T.DoubleSide;
                    if (D.base === 'esmeralda' && c.envMapIntensity !== undefined) c.envMapIntensity = 0.22;
                    if (rk >= 1 && sp.glow && c.emissive) {
                        const RK = ZOO.rimU = ZOO.rimU || {}, ru = RK[sp.id] = RK[sp.id] || { value: 1 }, rc = new T.Color(sp.glow), kk = [0, 0.35, 0.65, 0.95, 1.25][rk];
                        c.onBeforeCompile = sh => { sh.uniforms.uRimC = { value: rc }; sh.uniforms.uRimK = ru; sh.uniforms.uRimS = { value: kk }; sh.fragmentShader = 'uniform vec3 uRimC;uniform float uRimK;uniform float uRimS;\n' + sh.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n{float rm = pow(1.0 - clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0), 2.4); totalEmissiveRadiance += uRimC * rm * uRimS * uRimK;}'); };
                        c.customProgramCacheKey = () => 'drim_raw_' + sp.id; (ZOO.curRim = ZOO.curRim || []).push(ru);
                    }
                    return c;
                }
                if (D.nb) return zStdMat(mt, sp, D, rk);
                const c = mt.clone();
                const role = roleOf(o, mt);

                // Preserva 100% da textura nativa original em alta resolucao (escamas, dobras, relevo)
                if (c.map) {
                    if (D.tint && c.color && role !== 'claw' && role !== 'head') {
                        const tm = zTintMap(c.map, D.tint[0], Math.max(0.6, Math.min(0.95, (D.tint[1] || 0.6) * 1.35)));   /* recolore a textura original mantendo escamas e veias */
                        if (tm) { c.map = tm; c.color.set('#ffffff'); } else c.color.lerp(new T.Color(D.tint[0]), D.tint[1] || 0.62);
                    }
                } else if (isElder) {
                    if (role === 'head') {
                        c.color.set(sp.glow || D.tint[0]);
                        if (c.emissive) { c.emissive.set(sp.glow || D.tint[0]); c.emissiveIntensity = 2.2; }
                    } else if (role === 'wing') {
                        c.color.set(sp.glow || D.tint[0]).lerp(new T.Color('#fff0d0'), 0.28);
                    } else if (role === 'claw') {
                        c.color.set(rk >= 3 ? '#ffdf7a' : '#1e1f26');
                        c.metalness = 0.85; c.roughness = 0.2;
                    } else if (role === 'belly') {
                        c.color.set(D.tint[0]).lerp(new T.Color('#ffffff'), 0.42);
                    } else {
                        c.color.set(D.tint[0]);
                    }
                } else if (c.color && D.tint) {
                    c.color.set(D.tint[0]);
                }

                // Propriedades fisicas PBR autenticas por elemento
                if (el === 'terra') {
                    c.roughness = 0.90;
                    c.metalness = sp.id === 'bronze' ? 0.85 : 0.06;
                } else if (el === 'agua') {
                    c.roughness = 0.12;
                    c.metalness = 0.35;
                    c.clearcoat = 1.0;
                    c.clearcoatRoughness = 0.08;
                } else if (el === 'cristal') {
                    c.roughness = 0.08;
                    c.metalness = 0.82;
                    c.clearcoat = 1.0;
                    c.clearcoatRoughness = 0.04;
                    if (c.emissive) {
                        c.emissive.set(sp.glow || D.tint[0]);
                        c.emissiveIntensity = 0.45;
                    }
                } else if (el === 'estelar') {
                    c.roughness = 0.22;
                    c.metalness = 0.7;
                    if (c.emissive) {
                        c.emissive.set(sp.glow || D.tint[0]);
                        c.emissiveIntensity = 0.65 + rk * 0.25;
                        if (c.map) c.emissiveMap = c.map;
                    }
                    c.clearcoat = 0.6;
                }

                // Fresnel rim lighting organico e elegante que desenha a silhueta natural das asas e chifres
                if (rk >= 1 && c.emissive) {
                    const RK = ZOO.rimU = ZOO.rimU || {};
                    const ru = RK[sp.id] = RK[sp.id] || { value: 1 };
                    const rc = new T.Color(sp.glow || rcol);
                    const kk = [0, 0.45, 0.85, 1.3, 1.8][rk];
                    c.onBeforeCompile = sh => {
                        sh.uniforms.uRimC = { value: rc };
                        sh.uniforms.uRimK = ru;
                        sh.uniforms.uRimS = { value: kk };
                        sh.fragmentShader = 'uniform vec3 uRimC;uniform float uRimK;uniform float uRimS;\n'
                            + sh.fragmentShader.replace('#include <emissivemap_fragment>',
                            '#include <emissivemap_fragment>\n{float rm = pow(1.0 - clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0), 2.4); totalEmissiveRadiance += uRimC * rm * uRimS * uRimK;}');
                    };
                    c.customProgramCacheKey = () => 'drim_' + sp.id;
                    (ZOO.curRim = ZOO.curRim || []).push(ru);
                }

                return c;
            };
            o.material = Array.isArray(o.material) ? o.material.map(f) : f(o.material);
        });

        if (D.base === 'hamster') {
            const oldW = m.getObjectByName('W_mount');
            if (oldW) { oldW.visible = false; oldW.traverse(x => { x.visible = false; }); }
        }
        const pivot = new T.Group(); pivot.add(m); pivot.rotation.y = D.yaw; body.add(pivot);
        const mixer = new T.AnimationMixer(m), cl = tpl.gl.animations, pk = re => re && cl.find(a => re.test(a.name)), mk = (clip, seg, strip) => { if (!clip) return null; if (seg) clip = T.AnimationUtils.subclip(clip, clip.name + '_seg', Math.round(seg[0] * 30), Math.round(seg[1] * 30), 30); if (strip) { const nm = strip.map(n => T.PropertyBinding.sanitizeNodeName(n) + '.'); clip = clip.clone(); clip.tracks = clip.tracks.filter(tr => !nm.some(n => tr.name.startsWith(n))); } clip = clip.clone(); if (!DB.keepScale) clip.tracks = clip.tracks.filter(tr => !/\.scale$/.test(tr.name)); return mixer.clipAction(clip); };
        const standClip = DB.standStill ? new T.AnimationClip('stand', 1, []) : null;
        const act = { fly: standClip ? mixer.clipAction(standClip) : mk(pk(D.base === 'hamster' ? /^Animation$/i : DB.fly) || cl[0], DB.seg, DB.strip), idle: standClip ? mixer.clipAction(standClip) : (DB.idle ? mk(pk(DB.idle)) : null), walk: DB.walk ? mk(pk(DB.walk)) : null, atk: DB.atk ? mk(pk(DB.atk)) : null, hit: DB.hit ? mk(pk(DB.hit)) : null, cur: null }; if (!act.idle && !act.walk) { act.idle = null; }
        act.fly.play(); if (D.base === 'hamster') act.fly.timeScale = 0.78; act.cur = act.fly; if (DB.also && D.base !== 'hamster') { const c2 = pk(DB.also); if (c2) mixer.clipAction(c2).play(); } mixer.setTime(0.15);
        if (DB.finish || DB.wingBoost || DB.webWingBoost) {
            const wb = {}, wbRest = {};
            if (DB.wingBoost) m.traverse(o => { if (o.isBone && /^_j0(60|61|62|63|70|71|72|73)_/.test(o.name)) wb[o.name] = o; });
            if (DB.webWingBoost) m.traverse(o => { if (o.isBone && (/^Wing_(Top|Mid|Bottom)_(Left|Right)_[123]$/.test(o.name) || o.name === 'Head' || o.name === 'Neck_1')) { wb[o.name] = o; wbRest[o.name] = o.quaternion.clone(); } });
            const qTmp = new T.Quaternion(), eTmp = new T.Euler(), origUp = mixer.update.bind(mixer);
            let flapT = Math.random() * 6;
            mixer.update = dt => {
                origUp(dt);
                ZCF_CACHE.uTime.value = performance.now() * 0.001;
                if (DB.wingBoost) {
                    flapT += dt;
                    const w = flapT * 4.2, s0 = Math.sin(w), s1 = Math.sin(w - 0.65), s2 = Math.sin(w - 1.2);
                    const addQ = (k, rx, ry, rz) => { const bn = wb[k]; if (!bn) return; eTmp.set(rx, ry, rz); qTmp.setFromEuler(eTmp); bn.quaternion.multiply(qTmp); };
                    addQ('_j060_018', 0, -Math.cos(w) * 0.14,  0.12 + s0 * 0.54);
                    addQ('_j070_024', 0,  Math.cos(w) * 0.14, -0.12 - s0 * 0.54);
                    addQ('_j061_019', 0, 0,  s1 * 0.44);
                    addQ('_j071_025', 0, 0, -s1 * 0.44);
                    addQ('_j062_020', 0, 0,  s2 * 0.28);
                    addQ('_j063_022', 0, 0,  s2 * 0.24);
                    addQ('_j072_026', 0, 0, -s2 * 0.28);
                    addQ('_j073_028', 0, 0, -s2 * 0.24);
                } else if (DB.webWingBoost) {
                    flapT += dt;
                    const w = flapT * 4.4, s1 = Math.sin(w), s2 = Math.sin(w - 0.55), s3 = Math.sin(w - 1.1);
                    const setQ = (k, rx, ry, rz) => { const bn = wb[k]; if (!bn) return; if (wbRest[k]) bn.quaternion.copy(wbRest[k]); eTmp.set(rx, ry, rz); qTmp.setFromEuler(eTmp); bn.quaternion.multiply(qTmp); };
                    ['Top', 'Mid', 'Bottom'].forEach((row, ri) => {
                        const kk = ri === 0 ? 1.0 : ri === 1 ? 0.88 : 0.72;
                        setQ('Wing_' + row + '_Left_1',  0, -Math.cos(w) * 0.12 * kk,  (0.18 + s1 * 0.52) * kk);
                        setQ('Wing_' + row + '_Right_1', 0,  Math.cos(w) * 0.12 * kk, -(0.18 + s1 * 0.52) * kk);
                        setQ('Wing_' + row + '_Left_2',  0, 0,  s2 * 0.42 * kk);
                        setQ('Wing_' + row + '_Right_2', 0, 0, -s2 * 0.42 * kk);
                        setQ('Wing_' + row + '_Left_3',  0, 0,  s3 * 0.30 * kk);
                        setQ('Wing_' + row + '_Right_3', 0, 0, -s3 * 0.30 * kk);
                    });
                    setQ('Neck_1', Math.sin(w * 0.5) * 0.05, 0, 0);
                    setQ('Head', -Math.sin(w * 0.5) * 0.04, 0, 0);
                }
            };
        }
        let bb = zPosedBox(m); let sz = bb.getSize(new T.Vector3()), ct = bb.getCenter(new T.Vector3()); const span = [0.8, 1.0, 1.25, 1.55, 1.95][sp.rk | 0] * 4.0, k = span / Math.max(sz.x, sz.y, sz.z, 1e-6); pivot.scale.setScalar(k); pivot.position.set(-ct.x * k, -ct.y * k, -ct.z * k);
        let footG = bb.getSize(new T.Vector3()).y * k * 0.5;
        if (act.idle) { act.fly.stop(); act.idle.play(); mixer.setTime(0); const b2 = zPosedBox(m); footG = (ct.y - b2.min.y) * k; act.idle.stop(); act.fly.play(); act.cur = act.fly; }
        const P = { head: null, legs: [], wings: [], tail: null, neck: null };
        const shadow = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshBasicMaterial({ map: zSoftTex(), color: 0x000000, transparent: true, opacity: 0.32, depthWrite: false })); shadow.rotation.x = -Math.PI / 2; shadow.renderOrder = 2; root.add(shadow);
        const orb = [], beam = null, wave = null;
        const em = ZOO.curEm || []; ZOO.curEm = [];
        const jewelMats = ZOO.curJewel || []; ZOO.curJewel = [];
        const Bd = { g: root, body, P, aura: null, sp, orb, beam, wave, em, jewelMats, sz: D.D * 1.7, mixer, act, flap: [], model: true, dragon: true, canWalk: !!act.walk, footG, pv: pivot, shadow, span, fts: DB.fts || 1, pit0: DB.pit0 || 0 };
        if (D.base === 'hamster') { try { zAttachHamsterCuteWings(T, Bd, m, body, span); } catch (eW) { console.warn('hamster wings', eW); } }
        if (D.nb) { try { zDragonFxAttach(Bd, sp, al, !ZOO.lite); } catch (er) { ZOO.lastErr = 'fx ' + er; } }
        return Bd;
    }
    /* Asinhas delicadas cósmicas do Dragão Hamster (3 camadas em relevo, textura iridescente, filigrana dourada, soldadas nos vértices das costas) */
    function zAttachHamsterCuteWings(T, Bd, m, body, span) {
        if (!zAttachHamsterCuteWings._res) {
            const cv = document.createElement('canvas'); cv.width = 512; cv.height = 512;
            const ctx = cv.getContext('2d');
            const g = ctx.createRadialGradient(80, 340, 20, 260, 240, 380);
            g.addColorStop(0.00, '#fffaf0'); g.addColorStop(0.28, '#ffd4e8'); g.addColorStop(0.58, '#e0b8ff'); g.addColorStop(0.84, '#bae6fd'); g.addColorStop(1.00, '#ffe89e');
            ctx.fillStyle = g; ctx.fillRect(0, 0, 512, 512);
            ctx.strokeStyle = 'rgba(255,248,225,0.45)'; ctx.lineWidth = 4;
            for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.moveTo(20, 320); ctx.quadraticCurveTo(180 + k * 25, 290 - k * 48, 480, 80 + k * 78); ctx.stroke(); }
            for (let i = 0; i < 65; i++) {
                const x = (Math.sin(i * 19.3) * 0.5 + 0.5) * 480 + 16, y = (Math.cos(i * 31.7) * 0.5 + 0.5) * 480 + 16, r = 2 + (i % 4) * 1.4;
                ctx.fillStyle = i % 3 === 0 ? 'rgba(255,245,180,0.9)' : 'rgba(255,255,255,0.8)';
                ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
                if (i % 6 === 0) { ctx.strokeStyle = 'rgba(255,252,230,0.85)'; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(x - r * 2.5, y); ctx.lineTo(x + r * 2.5, y); ctx.moveTo(x, y - r * 2.5); ctx.lineTo(x, y + r * 2.5); ctx.stroke(); }
            }
            const tex = new T.CanvasTexture(cv); tex.encoding = T.sRGBEncoding;
            const upperShape = new T.Shape(); upperShape.moveTo(0.02, 0.02); upperShape.bezierCurveTo(0.16, 0.32, 0.46, 0.52, 0.72, 0.40); upperShape.bezierCurveTo(0.88, 0.32, 0.84, 0.08, 0.64, 0.02); upperShape.bezierCurveTo(0.46, -0.04, 0.22, -0.03, 0.02, 0.02);
            const midShape = new T.Shape(); midShape.moveTo(0.08, 0.03); midShape.bezierCurveTo(0.24, 0.20, 0.48, 0.28, 0.64, 0.18); midShape.bezierCurveTo(0.74, 0.12, 0.68, -0.02, 0.48, -0.04); midShape.bezierCurveTo(0.32, -0.05, 0.18, -0.01, 0.08, 0.03);
            const lowerShape = new T.Shape(); lowerShape.moveTo(0.16, 0.02); lowerShape.bezierCurveTo(0.34, 0.03, 0.58, -0.01, 0.60, -0.12); lowerShape.bezierCurveTo(0.62, -0.21, 0.44, -0.22, 0.32, -0.14); lowerShape.bezierCurveTo(0.24, -0.09, 0.18, -0.03, 0.16, 0.02);
            const extOpts = { depth: 0.016, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 2, curveSegments: 16 };
            zAttachHamsterCuteWings._res = {
                matMembrane: new T.MeshPhysicalMaterial({ map: tex, color: 0xfff7ff, emissive: 0xd8b4fe, emissiveIntensity: 0.30, roughness: 0.18, metalness: 0.06, clearcoat: 0.85, transparent: true, opacity: 0.92, side: T.DoubleSide }),
                matInner: new T.MeshPhysicalMaterial({ color: 0xffe4f3, emissive: 0xf9a8d4, emissiveIntensity: 0.25, roughness: 0.2, metalness: 0.05, clearcoat: 0.7, transparent: true, opacity: 0.86, side: T.DoubleSide }),
                matGold: new T.MeshStandardMaterial({ color: 0xffe38f, emissive: 0xf59e0b, emissiveIntensity: 0.28, metalness: 0.75, roughness: 0.22 }),
                matPearl: new T.MeshPhysicalMaterial({ color: 0xfff8f0, emissive: 0xfde68a, emissiveIntensity: 0.35, roughness: 0.12, metalness: 0.1, clearcoat: 1.0 }),
                matGem: new T.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfde047, emissiveIntensity: 1.05, roughness: 0.12, metalness: 0.2 }),
                geoUp: new T.ExtrudeGeometry(upperShape, extOpts),
                geoMid: new T.ExtrudeGeometry(midShape, { depth: 0.012, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 2, curveSegments: 14 }),
                geoLo: new T.ExtrudeGeometry(lowerShape, extOpts),
                geoRibTop: new T.TubeGeometry(new T.CatmullRomCurve3([new T.Vector3(0.01, 0.02, 0.005), new T.Vector3(0.22, 0.28, 0.008), new T.Vector3(0.52, 0.43, 0.006), new T.Vector3(0.75, 0.37, 0.004), new T.Vector3(0.72, 0.28, 0.005)]), 18, 0.015, 6, false),
                geoRibIn: new T.TubeGeometry(new T.CatmullRomCurve3([new T.Vector3(0.06, 0.03, 0.014), new T.Vector3(0.32, 0.18, 0.016), new T.Vector3(0.58, 0.16, 0.012)]), 12, 0.009, 5, false),
                geoRibBot: new T.TubeGeometry(new T.CatmullRomCurve3([new T.Vector3(0.16, 0.01, 0.004), new T.Vector3(0.40, -0.02, 0.005), new T.Vector3(0.59, -0.11, 0.003)]), 12, 0.010, 5, false),
                geoBead: new T.SphereGeometry(0.022, 8, 6),
                geoStar: new T.OctahedronGeometry(0.032, 0),
                geoBadge: new T.CylinderGeometry(0.068, 0.068, 0.028, 14)
            };
        }
        const R = zAttachHamsterCuteWings._res, grp = new T.Group(), sparkles = [];
        const badge = new T.Mesh(R.geoBadge, R.matGold); badge.rotation.x = Math.PI / 2; badge.position.set(0, 0.02, -0.055); grp.add(badge);
        const cGem = new T.Mesh(R.geoStar, R.matGem); cGem.scale.setScalar(1.25); cGem.position.set(0, 0.02, -0.072); grp.add(cGem);
        const mkSide = side => {
            const pv = new T.Group(); pv.position.set(side * 0.11, 0.02, -0.07);
            const w = new T.Group(); w.scale.x = side;
            const mU = new T.Mesh(R.geoUp, R.matMembrane); mU.position.z = -0.008; w.add(mU);
            const mM = new T.Mesh(R.geoMid, R.matInner); mM.position.z = 0.008; w.add(mM);
            const mL = new T.Mesh(R.geoLo, R.matMembrane); mL.position.z = -0.012; w.add(mL);
            w.add(new T.Mesh(R.geoRibTop, R.matGold), new T.Mesh(R.geoRibIn, R.matGold), new T.Mesh(R.geoRibBot, R.matGold));
            [[0.24, 0.29], [0.46, 0.41], [0.68, 0.39], [0.56, -0.11]].forEach(([px, py]) => { const b = new T.Mesh(R.geoBead, R.matPearl); b.position.set(px, py, 0.016); w.add(b); });
            const st1 = new T.Mesh(R.geoStar, R.matGem); st1.position.set(0.82, 0.40, 0.02); w.add(st1); sparkles.push({ m: st1, ph: side > 0 ? 0 : Math.PI });
            const st2 = new T.Mesh(R.geoStar, R.matGem); st2.scale.setScalar(0.68); st2.position.set(0.68, -0.13, 0.02); w.add(st2); sparkles.push({ m: st2, ph: side > 0 ? 1.5 : 4.6 });
            w.rotation.y = -0.22 * side; pv.add(w); return pv;
        };
        const wL = mkSide(-1), wR = mkSide(1); grp.add(wL, wR);
        /* Em zBuildDragon, a frente canônica do dragão é +X (enquanto no preview era +Z), então giramos grp +PI/2 em Y e soldamos nos 3 vértices das costas (-X) */
        const wingsHolder = new T.Group(); wingsHolder.add(grp); grp.rotation.y = Math.PI / 2;
        const wScale = (span / 1.55) * 0.92; wingsHolder.scale.setScalar(wScale);
        body.add(wingsHolder); body.updateMatrixWorld(true);
        m.traverse(o => { if (o.isSkinnedMesh && o.skeleton) o.skeleton.update(); });
        const scUnit = span / 1.55;
        const targetC = new T.Vector3(-0.06 * scUnit, 0.53 * scUnit, 0);
        const targetL = new T.Vector3(-0.06 * scUnit, 0.53 * scUnit, -0.14 * scUnit);
        const targetR = new T.Vector3(-0.06 * scUnit, 0.53 * scUnit,  0.14 * scUnit);
        const tmp = new T.Vector3();
        let bestC = null, dC = Infinity, bestL = null, dL = Infinity, bestR = null, dR = Infinity;
        m.traverse(o => {
            if (!o.isSkinnedMesh || !o.visible || !o.geometry || !o.geometry.attributes.position) return;
            const pos = o.geometry.attributes.position;
            for (let i = 0; i < pos.count; i++) {
                tmp.fromBufferAttribute(pos, i); o.boneTransform(i, tmp); tmp.applyMatrix4(o.matrixWorld); body.worldToLocal(tmp);
                const dc = tmp.distanceToSquared(targetC); if (dc < dC) { dC = dc; bestC = { mesh: o, idx: i }; }
                const dl = tmp.distanceToSquared(targetL); if (dl < dL) { dL = dl; bestL = { mesh: o, idx: i }; }
                const dr = tmp.distanceToSquared(targetR); if (dr < dR) { dR = dr; bestR = { mesh: o, idx: i }; }
            }
        });
        const getPt = p => {
            if (p.mesh.skeleton) p.mesh.skeleton.update();
            const out = new T.Vector3().fromBufferAttribute(p.mesh.geometry.attributes.position, p.idx);
            p.mesh.boneTransform(p.idx, out); out.applyMatrix4(p.mesh.matrixWorld); body.worldToLocal(out); return out;
        };
        let elapsed = 0;
        const stepWings = dt => {
            elapsed += (dt || 0.016);
            if (bestC) {
                body.updateMatrixWorld(true);
                const pc = getPt(bestC); wingsHolder.position.copy(pc);
                if (bestL && bestR) {
                    const pl = getPt(bestL), pr = getPt(bestR);
                    const dz = pr.z - pl.z, dy = pr.y - pl.y, dx = pr.x - pl.x;
                    const roll = Math.atan2(dy, Math.hypot(dx, dz));
                    const yaw = Math.atan2(-dx, dz);
                    wingsHolder.rotation.set(roll, yaw, 0);
                }
            }
            const flap = Math.sin(elapsed * 3.8), lift = Math.sin(elapsed * 3.8 - 0.5) * 0.10;
            wL.rotation.y = 0.52 + flap * 0.34; wR.rotation.y = -0.52 - flap * 0.34;
            wL.rotation.z = lift; wR.rotation.z = -lift;
            sparkles.forEach(s => { s.m.rotation.y = elapsed * 2.4 + s.ph; s.m.scale.setScalar(0.85 + 0.25 * Math.sin(elapsed * 4.5 + s.ph)); });
        };
        stepWings(0.016);
        const origUpd = Bd.mixer.update.bind(Bd.mixer);
        Bd.mixer.update = dt => { const r = origUpd(dt); stepWings(dt); return r; };
        const origSet = Bd.mixer.setTime.bind(Bd.mixer);
        Bd.mixer.setTime = t => { const r = origSet(t); stepWings(0.016); return r; };
    }
    /* ===== 5 Dragões 3D Orgânicos Autorais (malha contínua com deformação ao vivo, zero clones e zero patinhas) ===== */
    const ZCUSTOM_DRAGONS = {
        arquimago_astral: {
            dorsal: ['#0c0820', '#191040', '#362468'], belly: ['#422c7d', '#352269', 'rgba(251,191,36,0.25)'],
            scale: ['#3b248a', '#211450', '#120b2e', '#060312'], keel: ['rgba(56,189,248,0.38)', 'rgba(168,85,247,0.18)'], dots: ['#38bdf8', '#fde047'],
            wing: ['#100826', '#3b1578', '#0369a1', '#38bdf8'], vein: 'rgba(254,240,138,0.28)', nebula: ['rgba(56,189,248,0.32)', 'rgba(232,121,249,0.28)'],
            eye: ['#ffffff', '#fde047', '#38bdf8', '#09071a'],
            emissive: '#6366f1', wEmissive: '#3b0764', horn: '#1e1330', hornE: '#3b0764', gold: '#f5c249', goldE: '#92400e',
            c1: '#7dd3fc', c1E: '#0284c7', c2: '#f0abfc', c2E: '#9333ea',
            z0: -3.8, zLen: 5.35, waveMul: 1.0, spd0: 2.5, amp0: 0.88, span: 3.85, arches: 3.0, chordK: 1.0,
            headStyle: 'archmage', tailStyle: 'starBlade', dorsalStyle: 'crystals', orbitCount: 3, orbitRad: 2.95, scaleMul: 0.30
        },
        sereia_glacial: {
            dorsal: ['#082032', '#0e4166', '#7dd3fc'], belly: ['#e0f2fe', '#bae6fd', 'rgba(56,189,248,0.35)'],
            scale: ['#38bdf8', '#0284c7', '#0c4a6e', '#082f49'], keel: ['rgba(224,242,254,0.55)', 'rgba(125,211,252,0.32)'], dots: ['#e0f2fe', '#67e8f9'],
            wing: ['#0c4a6e', '#0284c7', '#38bdf8', '#e0f2fe'], vein: 'rgba(224,242,254,0.42)', nebula: ['rgba(186,230,253,0.36)', 'rgba(34,211,238,0.30)'],
            eye: ['#ffffff', '#e0f2fe', '#06b6d4', '#082f49'],
            emissive: '#0ea5e9', wEmissive: '#0369a1', horn: '#bae6fd', hornE: '#0284c7', gold: '#e0f2fe', goldE: '#0284c7',
            c1: '#bae6fd', c1E: '#0ea5e9', c2: '#67e8f9', c2E: '#0891b2',
            z0: -4.2, zLen: 5.9, waveMul: 1.42, spd0: 2.1, amp0: 0.76, span: 3.45, arches: 4.0, chordK: 1.18,
            headStyle: 'mermaid', tailStyle: 'crescentFin', dorsalStyle: 'iceFin', orbitCount: 4, orbitRad: 2.55, scaleMul: 0.32
        },
        morcego_noturno: {
            dorsal: ['#060712', '#111a3a', '#1e2952'], belly: ['#1e3a8a', '#172554', 'rgba(56,189,248,0.30)'],
            scale: ['#1d4ed8', '#172554', '#0f172a', '#020617'], keel: ['rgba(56,189,248,0.45)', 'rgba(129,140,248,0.28)'], dots: ['#38bdf8', '#818cf8'],
            wing: ['#090b1a', '#1e1b4b', '#1d4ed8', '#38bdf8'], vein: 'rgba(56,189,248,0.42)', nebula: ['rgba(37,99,235,0.34)', 'rgba(124,58,237,0.30)'],
            eye: ['#ffffff', '#7dd3fc', '#2563eb', '#020617'],
            emissive: '#1d4ed8', wEmissive: '#1e1b4b', horn: '#0f172a', hornE: '#1d4ed8', gold: '#38bdf8', goldE: '#0369a1',
            c1: '#38bdf8', c1E: '#2563eb', c2: '#818cf8', c2E: '#4f46e5',
            z0: -2.65, zLen: 4.15, waveMul: 0.55, spd0: 3.6, amp0: 1.15, span: 4.55, arches: 4.0, chordK: 1.24,
            headStyle: 'bat', tailStyle: 'harpoon', dorsalStyle: 'batSpikes', orbitCount: 2, orbitRad: 2.35, scaleMul: 0.31
        },
        esmeralda: {
            dorsal: ['#042112', '#065f46', '#10b981'], belly: ['#d9f99d', '#a7f3d0', 'rgba(251,191,36,0.36)'],
            scale: ['#10b981', '#047857', '#064e3b', '#022c22'], keel: ['rgba(253,224,71,0.42)', 'rgba(52,211,153,0.32)'], dots: ['#fde047', '#34d399'],
            wing: ['#022c22', '#065f46', '#10b981', '#a7f3d0'], vein: 'rgba(253,224,71,0.45)', nebula: ['rgba(52,211,153,0.34)', 'rgba(250,204,21,0.24)'],
            eye: ['#ffffff', '#fde047', '#f59e0b', '#064e3b'],
            emissive: '#059669', wEmissive: '#065f46', horn: '#047857', hornE: '#10b981', gold: '#fbbf24', goldE: '#b45309',
            c1: '#34d399', c1E: '#059669', c2: '#fde047', c2E: '#d97706',
            z0: -3.45, zLen: 5.05, waveMul: 0.85, spd0: 2.3, amp0: 0.94, span: 4.0, arches: 3.0, chordK: 1.12,
            headStyle: 'emerald', tailStyle: 'emeraldMace', dorsalStyle: 'gemPlates', orbitCount: 3, orbitRad: 2.65, scaleMul: 0.31
        },
        aurora: {
            dorsal: ['#1e1b4b', '#3730a3', '#a5f3fc'], belly: ['#fae8ff', '#ccfbf1', 'rgba(244,114,182,0.35)'],
            scale: ['#2dd4bf', '#818cf8', '#4c1d95', '#1e1b4b'], keel: ['rgba(103,232,249,0.52)', 'rgba(244,114,182,0.44)'], dots: ['#5eead4', '#f472b6'],
            wing: ['#312e81', '#0d9488', '#34d399', '#f472b6'], vein: 'rgba(255,255,255,0.45)', nebula: ['rgba(45,212,191,0.38)', 'rgba(244,114,182,0.36)'],
            eye: ['#ffffff', '#5eead4', '#f472b6', '#1e1b4b'],
            emissive: '#a855f7', wEmissive: '#0d9488', horn: '#f5d0fe', hornE: '#a855f7', gold: '#fef08a', goldE: '#ec4899',
            c1: '#5eead4', c1E: '#14b8a6', c2: '#f472b6', c2E: '#db2777',
            z0: -3.9, zLen: 5.55, waveMul: 1.25, spd0: 2.0, amp0: 0.78, span: 4.1, arches: 2.0, chordK: 0.92, rearWings: 1,
            headStyle: 'aurora', tailStyle: 'twinRibbons', dorsalStyle: 'auroraSpires', orbitCount: 3, orbitRad: 2.8, scaleMul: 0.31
        }
    };
    function zCustomDragonTex(T, id) {
        if (!zCustomDragonTex._c) zCustomDragonTex._c = {};
        if (zCustomDragonTex._c[id]) return zCustomDragonTex._c[id];
        const cfg = ZCUSTOM_DRAGONS[id] || ZCUSTOM_DRAGONS.arquimago_astral;
        const w = 512, h = 512;
        const cC = document.createElement('canvas'); cC.width = w; cC.height = h; const gC = cC.getContext('2d');
        const cB = document.createElement('canvas'); cB.width = w; cB.height = h; const gB = cB.getContext('2d');
        const cE = document.createElement('canvas'); cE.width = w; cE.height = h; const gE = cE.getContext('2d');
        const gr = gC.createLinearGradient(0, 0, w, 0);
        gr.addColorStop(0.00, cfg.dorsal[0]); gr.addColorStop(0.25, cfg.dorsal[1]); gr.addColorStop(0.50, cfg.dorsal[2]);
        gr.addColorStop(0.75, cfg.dorsal[1]); gr.addColorStop(1.00, cfg.dorsal[0]);
        gC.fillStyle = gr; gC.fillRect(0, 0, w, h);
        gB.fillStyle = '#1a1a1a'; gB.fillRect(0, 0, w, h);
        gE.fillStyle = '#000000'; gE.fillRect(0, 0, w, h);
        const cols = 18, rows = 28, sx = w / cols, sy = h / rows;
        for (let r = -1; r <= rows; r++) {
            for (let c = -1; c <= cols; c++) {
                const cx = (c + (r % 2 ? 0.5 : 0)) * sx, cy = r * sy;
                const uNorm = ((cx % w) + w) % w / w;
                if (Math.abs(uNorm - 0.5) < 0.14) {
                    gC.fillStyle = r % 2 ? cfg.belly[0] : cfg.belly[1];
                    gC.fillRect(cx - sx * 0.6, cy - sy * 0.45, sx * 1.2, sy * 0.9);
                    gC.strokeStyle = cfg.belly[2]; gC.lineWidth = 1.5;
                    gC.beginPath(); gC.moveTo(cx - sx * 0.6, cy + sy * 0.42); gC.lineTo(cx + sx * 0.6, cy + sy * 0.42); gC.stroke();
                    gB.fillStyle = '#d0d0d0'; gB.fillRect(cx - sx * 0.6, cy - sy * 0.35, sx * 1.2, sy * 0.72);
                    continue;
                }
                const drawS = ctx => {
                    ctx.beginPath();
                    ctx.moveTo(cx, cy - sy * 0.68);
                    ctx.bezierCurveTo(cx + sx * 0.6, cy - sy * 0.2, cx + sx * 0.42, cy + sy * 0.38, cx, cy + sy * 0.74);
                    ctx.bezierCurveTo(cx - sx * 0.42, cy + sy * 0.38, cx - sx * 0.6, cy - sy * 0.2, cx, cy - sy * 0.68);
                    ctx.closePath();
                };
                const sg = gC.createRadialGradient(cx, cy - sy * 0.15, 1, cx, cy, sx * 0.72);
                const irid = ((r * 3 + c * 7) % 6 === 0);
                sg.addColorStop(0, irid ? cfg.scale[0] : cfg.scale[1]); sg.addColorStop(0.6, cfg.scale[2]); sg.addColorStop(1, cfg.scale[3]);
                drawS(gC); gC.fillStyle = sg; gC.fill();
                gC.strokeStyle = 'rgba(0,0,0,0.55)'; gC.lineWidth = 1.1; gC.stroke();
                gC.strokeStyle = irid ? cfg.keel[0] : cfg.keel[1]; gC.lineWidth = 1.1;
                gC.beginPath(); gC.moveTo(cx, cy - sy * 0.42); gC.lineTo(cx, cy + sy * 0.52); gC.stroke();
                const bg = gB.createRadialGradient(cx, cy - sy * 0.1, 1, cx, cy, sx * 0.68);
                bg.addColorStop(0, '#ffffff'); bg.addColorStop(0.7, '#888888'); bg.addColorStop(1, '#101010');
                drawS(gB); gB.fillStyle = bg; gB.fill();
                if ((r * 5 + c * 11) % 13 === 0) { gE.fillStyle = cfg.dots[0]; gE.beginPath(); gE.arc(cx, cy, 2.2, 0, Math.PI * 2); gE.fill(); }
                else if ((r * 7 + c * 17) % 23 === 0) { gE.fillStyle = cfg.dots[1]; gE.beginPath(); gE.arc(cx, cy, 2.5, 0, Math.PI * 2); gE.fill(); }
            }
        }
        const wrap = (cv, srgb) => { const t = new T.CanvasTexture(cv); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(1, 4); if (srgb && T.sRGBEncoding) t.encoding = T.sRGBEncoding; return t; };
        const wCv = document.createElement('canvas'); wCv.width = 512; wCv.height = 512; const wg = wCv.getContext('2d');
        const wGr = wg.createLinearGradient(0, 0, 512, 512);
        wGr.addColorStop(0.0, cfg.wing[0]); wGr.addColorStop(0.38, cfg.wing[1]); wGr.addColorStop(0.74, cfg.wing[2]); wGr.addColorStop(1.0, cfg.wing[3]);
        wg.fillStyle = wGr; wg.fillRect(0, 0, 512, 512);
        wg.strokeStyle = cfg.vein; wg.lineWidth = 2.4;
        for (let i = 0; i < 14; i++) { wg.beginPath(); wg.moveTo(0, i * 38); wg.bezierCurveTo(170, i * 38 + 26, 330, i * 38 - 18, 512, i * 38 + 12); wg.stroke(); }
        for (let i = 0; i < 16; i++) {
            const x = (i * 97) % 480 + 16, y = (i * 151) % 480 + 16, rad = 36 + (i % 4) * 26;
            const rg = wg.createRadialGradient(x, y, 2, x, y, rad);
            rg.addColorStop(0, i % 2 ? cfg.nebula[0] : cfg.nebula[1]); rg.addColorStop(1, 'transparent');
            wg.fillStyle = rg; wg.beginPath(); wg.arc(x, y, rad, 0, Math.PI * 2); wg.fill();
        }
        for (let i = 0; i < 180; i++) {
            const x = (i * 107) % 512, y = (i * 193) % 512, rad = i % 9 === 0 ? 2.8 : 1.1;
            wg.fillStyle = i % 3 === 0 ? '#ffffff' : i % 3 === 1 ? cfg.dots[0] : cfg.dots[1];
            wg.beginPath(); wg.arc(x, y, rad, 0, Math.PI * 2); wg.fill();
        }
        const wingMap = new T.CanvasTexture(wCv); if (T.sRGBEncoding) wingMap.encoding = T.sRGBEncoding;
        const eCv = document.createElement('canvas'); eCv.width = 128; eCv.height = 128; const eg = eCv.getContext('2d');
        const eRg = eg.createRadialGradient(64, 64, 5, 64, 64, 58);
        eRg.addColorStop(0, cfg.eye[0]); eRg.addColorStop(0.28, cfg.eye[1]); eRg.addColorStop(0.62, cfg.eye[2]); eRg.addColorStop(1, cfg.eye[3]);
        eg.fillStyle = eRg; eg.fillRect(0, 0, 128, 128);
        eg.fillStyle = '#04020a'; eg.beginPath(); eg.ellipse(64, 64, 7, 42, 0, 0, Math.PI * 2); eg.fill();
        eg.fillStyle = '#ffffff'; eg.beginPath(); eg.arc(52, 48, 6, 0, Math.PI * 2); eg.fill();
        const eyeMap = new T.CanvasTexture(eCv); if (T.sRGBEncoding) eyeMap.encoding = T.sRGBEncoding;
        zCustomDragonTex._c[id] = { map: wrap(cC, true), bumpMap: wrap(cB, false), emissiveMap: wrap(cE, true), wingMap, eyeMap };
        return zCustomDragonTex._c[id];
    }
    function zBuildSereiaAmetista(sp, hi, al) {
        const T = clTh(), root = new T.Group(), bodyWrap = new T.Group(); root.add(bodyWrap);
        const pivot = new T.Group(); pivot.rotation.y = Math.PI / 2; bodyWrap.add(pivot);
        if (!zBuildSereiaAmetista._tex) {
            const tl = new T.TextureLoader();
            const ld = (u, srgb) => { const t = tl.load(u); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(2.5, 3.2); if (srgb && T.sRGBEncoding) t.encoding = T.sRGBEncoding; return t; };
            zBuildSereiaAmetista._tex = { map: ld('./assets/colony/dragons/tex_sereia.jpg', true), nrm: ld('./assets/colony/dragons/tex_sereia_nrm.jpg', false), rgh: ld('./assets/colony/dragons/tex_sereia_rgh.jpg', false) };
        }
        const tx = zBuildSereiaAmetista._tex;
        const P = { skin: '#f6eef8', cheek: '#e879f9', hair: '#a855f7', hairTip: '#f5d0fe', tail: '#7c3aed', tailEm: '#5b21b6', fin: '#d8b4fe', shell: '#fae8ff', gem: '#e879f9', metal: '#f8fafc', eye: '#a855f7' };
        const skinMat = new T.MeshPhysicalMaterial({ color: P.skin, roughness: 0.42, metalness: 0.02, clearcoat: 0.15 });
        const cheekMat = new T.MeshBasicMaterial({ color: P.cheek, transparent: true, opacity: 0.35 });
        const lipMat = new T.MeshStandardMaterial({ color: '#f472b6', roughness: 0.35, metalness: 0.05 });
        const hairMat = new T.MeshPhysicalMaterial({ color: P.hair, emissive: P.tailEm, emissiveIntensity: 0.22, roughness: 0.32, metalness: 0.08, clearcoat: 0.55 });
        const hairTipMat = new T.MeshPhysicalMaterial({ color: P.hairTip, emissive: P.fin, emissiveIntensity: 0.30, roughness: 0.25, metalness: 0.1, clearcoat: 0.65 });
        const tailMat = new T.MeshPhysicalMaterial({ color: P.tail, map: tx.map, normalMap: tx.nrm, normalScale: new T.Vector2(2.2, 2.2), roughnessMap: tx.rgh, roughness: 0.18, metalness: 0.32, clearcoat: 1.0, clearcoatRoughness: 0.06, emissive: P.tailEm, emissiveIntensity: 0.32, envMapIntensity: 1.4 });
        const finMat = new T.MeshPhysicalMaterial({ color: P.fin, emissive: P.fin, emissiveIntensity: 0.42, roughness: 0.14, metalness: 0.12, clearcoat: 1.0, transparent: true, opacity: 0.82, side: T.DoubleSide });
        const shellMat = new T.MeshPhysicalMaterial({ color: P.shell, emissive: P.fin, emissiveIntensity: 0.20, roughness: 0.22, metalness: 0.25, clearcoat: 0.9 });
        const gemMat = new T.MeshPhysicalMaterial({ color: P.gem, emissive: P.gem, emissiveIntensity: 1.15, roughness: 0.08, metalness: 0.2, clearcoat: 1.0 });
        const metalMat = new T.MeshStandardMaterial({ color: P.metal, roughness: 0.22, metalness: 0.92 });
        const eyeWhiteMat = new T.MeshBasicMaterial({ color: '#ffffff' });
        const eyeIrisMat = new T.MeshStandardMaterial({ color: P.eye, emissive: P.eye, emissiveIntensity: 0.55, roughness: 0.1 });
        const eyePupilMat = new T.MeshBasicMaterial({ color: '#090d1a' });

        const body = new T.Group(); body.position.y = 2.75; pivot.add(body);
        const torsoPts = [new T.Vector2(0.01, -0.42), new T.Vector2(0.24, -0.38), new T.Vector2(0.26, -0.22), new T.Vector2(0.19, -0.02), new T.Vector2(0.22, 0.18), new T.Vector2(0.27, 0.34), new T.Vector2(0.24, 0.48), new T.Vector2(0.12, 0.56), new T.Vector2(0.095, 0.68), new T.Vector2(0.01, 0.70)];
        const torso = new T.Mesh(new T.LatheGeometry(torsoPts, hi ? 24 : 16), skinMat); torso.scale.set(1.06, 1.0, 0.78); body.add(torso);
        [-1, 1].forEach(s => {
            const sh = new T.Mesh(new T.SphereGeometry(0.145, 16, 12), shellMat); sh.scale.set(1.05, 0.95, 0.62); sh.position.set(s * 0.125, 0.30, 0.16); sh.rotation.z = -s * 0.22; body.add(sh);
            for (let r = -2; r <= 2; r++) { const rib = new T.Mesh(new T.CylinderGeometry(0.012, 0.006, 0.18, 5), metalMat); rib.position.set(s * 0.125 + r * 0.024, 0.31, 0.235 - Math.abs(r) * 0.012); rib.rotation.z = -r * 0.16; body.add(rib); }
        });
        const chestGem = new T.Mesh(new T.OctahedronGeometry(0.055, 0), gemMat); chestGem.scale.set(0.8, 1.25, 0.6); chestGem.position.set(0, 0.28, 0.22); body.add(chestGem);
        const belt = new T.Mesh(new T.TorusGeometry(0.245, 0.032, 8, 24), metalMat); belt.rotation.x = Math.PI / 2; belt.scale.set(1.05, 0.82, 1); belt.position.y = -0.22; body.add(belt);
        const beltGem = new T.Mesh(new T.OctahedronGeometry(0.065, 0), gemMat); beltGem.position.set(0, -0.22, 0.22); body.add(beltGem);
        const hipShape = new T.Shape(); hipShape.moveTo(0, 0); hipShape.bezierCurveTo(0.22, 0.14, 0.48, 0.02, 0.56, -0.24); hipShape.bezierCurveTo(0.42, -0.34, 0.20, -0.32, 0, -0.20);
        const hipGeo = new T.ExtrudeGeometry(hipShape, { depth: 0.014, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 1 });
        const hipFins = [];
        [-1, 1].forEach(s => { const f = new T.Mesh(hipGeo, finMat); f.scale.x = s; f.position.set(s * 0.22, -0.20, 0.02); f.rotation.y = -s * 0.35; body.add(f); hipFins.push({ m: f, s }); });

        const headGrp = new T.Group(); headGrp.position.set(0, 0.92, 0.02); body.add(headGrp);
        const head = new T.Mesh(new T.SphereGeometry(0.32, hi ? 26 : 18, hi ? 20 : 14), skinMat); head.scale.set(1.02, 0.98, 0.95); headGrp.add(head);
        const nose = new T.Mesh(new T.SphereGeometry(0.020, 10, 8), skinMat); nose.scale.set(0.9, 0.72, 0.85); nose.position.set(0, -0.045, 0.302); headGrp.add(nose);
        const smile = new T.Mesh(new T.TorusGeometry(0.052, 0.010, 6, 16, Math.PI * 0.72), lipMat); smile.position.set(0, -0.095, 0.278); smile.rotation.z = Math.PI * 1.14; smile.rotation.x = 0.25; headGrp.add(smile);
        [-1, 1].forEach(s => {
            const ck = new T.Mesh(new T.SphereGeometry(0.052, 10, 8), cheekMat); ck.scale.set(1.25, 0.65, 0.22); ck.position.set(s * 0.165, -0.075, 0.258); ck.rotation.y = s * 0.42; headGrp.add(ck);
            const eyeGrp = new T.Group(); eyeGrp.position.set(s * 0.118, 0.018, 0.270); eyeGrp.rotation.y = s * 0.32; eyeGrp.rotation.x = -0.05;
            const scl = new T.Mesh(new T.SphereGeometry(0.068, 14, 12), eyeWhiteMat); scl.scale.set(1.02, 1.12, 0.28); eyeGrp.add(scl);
            const iris = new T.Mesh(new T.SphereGeometry(0.052, 12, 10), eyeIrisMat); iris.scale.set(0.95, 1.08, 0.26); iris.position.set(-s * 0.004, -0.004, 0.009); eyeGrp.add(iris);
            const pup = new T.Mesh(new T.SphereGeometry(0.032, 10, 8), eyePupilMat); pup.scale.set(0.95, 1.05, 0.24); pup.position.set(-s * 0.004, 0.002, 0.015); eyeGrp.add(pup);
            const shine1 = new T.Mesh(new T.SphereGeometry(0.016, 8, 6), eyeWhiteMat); shine1.scale.z = 0.4; shine1.position.set(0.018, 0.022, 0.022); eyeGrp.add(shine1);
            const shine2 = new T.Mesh(new T.SphereGeometry(0.008, 6, 6), eyeWhiteMat); shine2.scale.z = 0.4; shine2.position.set(-0.018, -0.020, 0.022); eyeGrp.add(shine2);
            const lash = new T.Mesh(new T.TorusGeometry(0.068, 0.010, 6, 14, Math.PI * 0.78), eyePupilMat); lash.scale.set(1.04, 1.10, 0.45); lash.position.set(0, 0.006, 0.008); lash.rotation.z = 0.34; eyeGrp.add(lash);
            const brow = new T.Mesh(new T.TorusGeometry(0.062, 0.008, 6, 12, Math.PI * 0.55), hairMat); brow.position.set(0, 0.068, 0.006); brow.rotation.z = 0.72; eyeGrp.add(brow);
            headGrp.add(eyeGrp);
            const ear = new T.Mesh(new T.ConeGeometry(0.052, 0.21, 5), finMat); ear.scale.set(0.30, 1, 0.78); ear.position.set(s * 0.335, 0.01, -0.02); ear.rotation.z = -s * 1.15; ear.rotation.y = -s * 0.3; headGrp.add(ear);
        });
        const tiara = new T.Mesh(new T.TorusGeometry(0.268, 0.019, 8, 24), metalMat); tiara.rotation.x = Math.PI / 2 - 0.18; tiara.position.set(0, 0.22, 0.02); headGrp.add(tiara);
        [-2, -1, 0, 1, 2].forEach(k => {
            const h = 0.22 - Math.abs(k) * 0.045, ang = k * 0.36;
            const cr = new T.Mesh(new T.OctahedronGeometry(0.042 - Math.abs(k) * 0.005, 0), k === 0 ? gemMat : shellMat);
            cr.scale.set(0.65, h / 0.075, 0.45); cr.position.set(Math.sin(ang) * 0.24, 0.28 + (2 - Math.abs(k)) * 0.025, Math.cos(ang) * 0.23 - 0.01); cr.rotation.z = -ang * 0.55; cr.rotation.x = 0.2; headGrp.add(cr);
        });
        const hairCap = new T.Mesh(new T.SphereGeometry(0.348, 22, 16, 0, Math.PI * 2, 0, Math.PI * 0.58), hairMat); hairCap.position.set(0, 0.035, -0.045); hairCap.rotation.x = -0.26; headGrp.add(hairCap);
        [-1, 1].forEach(s => { headGrp.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([new T.Vector3(s * 0.02, 0.29, 0.21), new T.Vector3(s * 0.22, 0.23, 0.22), new T.Vector3(s * 0.34, 0.02, 0.10), new T.Vector3(s * 0.31, -0.24, -0.02)]), 12, 0.052, 7, false), hairMat)); });
        const hairLocks = [];
        for (let i = 0; i < 9; i++) {
            const frac = (i / 8) * 2 - 1, lockGrp = new T.Group(), len = 1.05 + (1 - Math.abs(frac)) * 0.42;
            lockGrp.position.set(frac * 0.26, 0.16 - Math.abs(frac) * 0.08, -0.22 - (1 - Math.abs(frac)) * 0.08);
            lockGrp.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([new T.Vector3(0, 0, 0), new T.Vector3(frac * 0.18, -len * 0.28, -0.24), new T.Vector3(frac * 0.34, -len * 0.62, -0.46), new T.Vector3(frac * 0.22, -len, -0.68)]), 12, 0.072 - Math.abs(frac) * 0.015, 7, false), i % 2 === 0 ? hairMat : hairTipMat));
            headGrp.add(lockGrp); hairLocks.push({ g: lockGrp, ph: i * 0.65, frac });
        }

        const armL = new T.Group(); armL.position.set(0.28, 0.44, 0.02); body.add(armL);
        armL.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([new T.Vector3(0, 0, 0), new T.Vector3(0.22, -0.18, 0.12), new T.Vector3(0.32, -0.08, 0.36)]), 10, 0.058, 8, false), skinMat));
        const handL = new T.Mesh(new T.SphereGeometry(0.062, 10, 8), skinMat); handL.position.set(0.32, -0.08, 0.36); armL.add(handL);
        const castOrb = new T.Mesh(new T.OctahedronGeometry(0.11, 1), gemMat); castOrb.position.set(0.36, 0.08, 0.44); armL.add(castOrb);

        const armR = new T.Group(); armR.position.set(-0.28, 0.44, 0.02); body.add(armR);
        armR.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([new T.Vector3(0, 0, 0), new T.Vector3(-0.24, -0.16, 0.10), new T.Vector3(-0.34, 0.06, 0.28)]), 10, 0.058, 8, false), skinMat));
        const handR = new T.Mesh(new T.SphereGeometry(0.062, 10, 8), skinMat); handR.position.set(-0.34, 0.06, 0.28); armR.add(handR);
        const trident = new T.Group(); trident.position.set(-0.36, 0.08, 0.30); trident.rotation.z = 0.22; trident.rotation.x = 0.12;
        const shaft = new T.Mesh(new T.CylinderGeometry(0.026, 0.022, 2.35, 8), metalMat); shaft.position.y = 0.15; trident.add(shaft);
        const tOrb = new T.Mesh(new T.OctahedronGeometry(0.11, 0), gemMat); tOrb.position.y = 1.32; trident.add(tOrb);
        const cross = new T.Mesh(new T.TorusGeometry(0.24, 0.025, 6, 16, Math.PI), metalMat); cross.rotation.z = Math.PI; cross.position.y = 1.48; trident.add(cross);
        [-1, 0, 1].forEach(k => { const prong = new T.Mesh(new T.ConeGeometry(0.036, k === 0 ? 0.56 : 0.42, 5), k === 0 ? gemMat : metalMat); prong.position.set(k * 0.22, k === 0 ? 1.66 : 1.56, 0); prong.rotation.z = -k * 0.14; trident.add(prong); });
        armR.add(trident);

        const tailSegs = []; let parentSeg = body;
        const radii = [0.25, 0.23, 0.20, 0.17, 0.14, 0.11, 0.085, 0.065];
        for (let i = 0; i < radii.length; i++) {
            const seg = new T.Group(); seg.position.set(0, -0.22, 0);
            const rTop = radii[i], rBot = radii[Math.min(i + 1, radii.length - 1)] * 0.92;
            const mesh = new T.Mesh(new T.CylinderGeometry(rTop, rBot, 0.25, 18, 1), tailMat); mesh.scale.set(1.06, 1, 0.84); mesh.position.y = -0.11; seg.add(mesh);
            const joint = new T.Mesh(new T.SphereGeometry(rTop * 0.98, 14, 10), tailMat); joint.scale.set(1.06, 0.65, 0.84); seg.add(joint);
            parentSeg.add(seg); tailSegs.push(seg); parentSeg = seg;
        }
        const flukeGrp = new T.Group(); flukeGrp.position.set(0, -0.20, 0);
        const flukeShape = new T.Shape(); flukeShape.moveTo(0, 0); flukeShape.bezierCurveTo(0.28, -0.05, 0.72, -0.26, 0.86, -0.68); flukeShape.bezierCurveTo(0.68, -0.78, 0.42, -0.62, 0.22, -0.52); flukeShape.bezierCurveTo(0.10, -0.42, 0.04, -0.26, 0, -0.18);
        const flukeGeo = new T.ExtrudeGeometry(flukeShape, { depth: 0.018, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 1 });
        [-1, 1].forEach(s => { const lobe = new T.Mesh(flukeGeo, finMat); lobe.scale.x = s; lobe.rotation.y = s * 0.14; flukeGrp.add(lobe); });
        parentSeg.add(flukeGrp);

        const orbs = [];
        for (let i = 0; i < 4; i++) { const o = new T.Mesh(new T.OctahedronGeometry(0.075, 0), gemMat); pivot.add(o); orbs.push({ m: o, ph: (i / 4) * Math.PI * 2 }); }
        pivot.scale.setScalar(0.55);

        let curT = Math.random() * 6, castT = 0;
        const step = (t, dt) => {
            if (castT > 0) castT = Math.max(0, castT - (dt || 0.016));
            const cast = Math.sin((castT / 1.0) * Math.PI);
            body.position.y = 2.75 + Math.sin(t * 2.1) * 0.14;
            body.rotation.x = 0.12 + Math.sin(t * 2.1 - 0.5) * 0.04 - cast * 0.12;
            body.rotation.z = Math.sin(t * 1.1) * 0.04;
            headGrp.rotation.y = Math.sin(t * 0.9) * 0.12;
            headGrp.rotation.x = -0.08 + Math.sin(t * 1.8) * 0.03;
            tailSegs.forEach((seg, i) => {
                const baseCurve = i < 2 ? 0.18 : (i < 5 ? -0.16 : -0.10);
                seg.rotation.x = baseCurve + Math.sin(t * 3.1 - i * 0.52) * (0.10 + i * 0.02);
                seg.rotation.z = Math.sin(t * 1.6 - i * 0.45) * 0.05;
            });
            flukeGrp.rotation.x = Math.sin(t * 3.1 - 4.2) * 0.32;
            hairLocks.forEach(h => { h.g.rotation.x = 0.18 + Math.sin(t * 2.4 - h.ph) * 0.14; h.g.rotation.z = h.frac * 0.12 + Math.cos(t * 1.9 - h.ph) * 0.09; });
            hipFins.forEach(f => { f.m.rotation.z = f.s * (0.12 + Math.sin(t * 3.1) * 0.14); });
            armL.rotation.x = -0.25 + Math.sin(t * 2.0) * 0.12 - cast * 0.85;
            armR.rotation.x = -0.15 + Math.cos(t * 1.8) * 0.10 - cast * 0.55;
            castOrb.scale.setScalar(1 + Math.sin(t * 5) * 0.12 + cast * 0.85);
            castOrb.rotation.y = t * 2.5;
            orbs.forEach(o => { const a = t * 1.2 + o.ph; o.m.position.set(Math.cos(a) * 1.15, 2.55 + Math.sin(a * 2) * 0.35, Math.sin(a) * 1.15); o.m.rotation.y = t * 2.4; o.m.rotation.x = t * 1.5; });
        };
        step(0.4, 0.016);
        const mkAct = k => ({ _k: k, timeScale: 1, reset() { return this; }, fadeIn() { return this; }, fadeOut() { return this; }, play() { if (k === 'atk') castT = 1.0; return this; }, stop() { return this; }, setEffectiveWeight() { return this; }, setEffectiveTimeScale() { return this; }, isRunning() { return true; }, getEffectiveWeight() { return 1; }, getClip() { return { duration: 4.0 }; } });
        const act = { fly: mkAct('fly'), idle: mkAct('idle'), atk: mkAct('atk'), cur: null }; act.cur = act.fly;
        const mixer = { time: 0, update(dt) { curT += (dt || 0); this.time = curT; step(curT, dt || 0.016); }, setTime(t) { curT = t || 0; this.time = curT; step(curT, 0.016); } };
        return { g: root, body: bodyWrap, P: { head: headGrp, legs: [], wings: [], tail: flukeGrp, neck: null }, aura: null, sp, sz: (sp.D || 1.15) * 1.7, mixer, act, pv: pivot, model: true, dragon: true, proc: true, hov: true, canWalk: false };
    }
    function zBuildCustomDragon(sp, hi, al) {
        if (sp && sp.id === 'sereia_glacial') return zBuildSereiaAmetista(sp, hi, al);
        const id = sp.id, cfg = ZCUSTOM_DRAGONS[id] || ZCUSTOM_DRAGONS.arquimago_astral;
        const T = clTh(), G = zG(), tx = zCustomDragonTex(T, id);
        const root = new T.Group(), body = new T.Group(), pivot = new T.Group();
        root.add(body); body.add(pivot);
        pivot.scale.setScalar((sp.D || 1.35) * cfg.scaleMul);
        pivot.rotation.y = Math.PI / 2;
        const bodyMat = new T.MeshStandardMaterial({ map: tx.map, bumpMap: tx.bumpMap, bumpScale: 0.055, roughness: id === 'sereia_glacial' ? 0.22 : (id === 'morcego_noturno' ? 0.52 : 0.34), metalness: id === 'esmeralda' ? 0.58 : 0.42, emissive: cfg.emissive, emissiveMap: tx.emissiveMap, emissiveIntensity: 1.55 });
        const hornMat = new T.MeshStandardMaterial({ color: cfg.horn, emissive: cfg.hornE, emissiveIntensity: 0.35, metalness: 0.55, roughness: 0.22 });
        const goldMat = new T.MeshStandardMaterial({ color: cfg.gold, emissive: cfg.goldE, emissiveIntensity: 0.32, metalness: 0.88, roughness: 0.18 });
        const c1Mat = new T.MeshStandardMaterial({ color: cfg.c1, emissive: cfg.c1E, emissiveIntensity: 1.65, roughness: 0.08, metalness: 0.22, transparent: true, opacity: 0.92 });
        const c2Mat = new T.MeshStandardMaterial({ color: cfg.c2, emissive: cfg.c2E, emissiveIntensity: 1.50, roughness: 0.10, metalness: 0.22, transparent: true, opacity: 0.92 });
        const wingMat = new T.MeshStandardMaterial({ map: tx.wingMap, emissive: cfg.wEmissive, emissiveMap: tx.wingMap, emissiveIntensity: id === 'aurora' ? 1.25 : 0.95, transparent: true, opacity: id === 'sereia_glacial' || id === 'aurora' ? 0.84 : 0.90, side: T.DoubleSide, roughness: 0.22, metalness: 0.15 });
        const eyeMat = new T.MeshBasicMaterial({ map: tx.eyeMap });
        const fangMat = new T.MeshStandardMaterial({ color: '#fef9e7', roughness: 0.15 });
        const SEGS = hi ? 64 : 44, RAD = hi ? 18 : 14;
        const bodyGeo = new T.BufferGeometry();
        const bodyPos = new Float32Array((SEGS + 1) * (RAD + 1) * 3);
        const bodyUv = new Float32Array((SEGS + 1) * (RAD + 1) * 2);
        const bodyIdx = [];
        for (let i = 0; i <= SEGS; i++) for (let j = 0; j <= RAD; j++) { const k = (i * (RAD + 1) + j) * 2; bodyUv[k] = j / RAD; bodyUv[k + 1] = i / SEGS; }
        for (let i = 0; i < SEGS; i++) for (let j = 0; j < RAD; j++) { const a = i * (RAD + 1) + j, b = (i + 1) * (RAD + 1) + j, c = (i + 1) * (RAD + 1) + j + 1, d = i * (RAD + 1) + j + 1; bodyIdx.push(a, b, d, b, c, d); }
        bodyGeo.setAttribute('position', new T.BufferAttribute(bodyPos, 3));
        bodyGeo.setAttribute('uv', new T.BufferAttribute(bodyUv, 2));
        bodyGeo.setIndex(bodyIdx);
        const bodyMesh = new T.Mesh(bodyGeo, bodyMat); bodyMesh.frustumCulled = false; pivot.add(bodyMesh);
        const bodyRadius = u => {
            if (id === 'morcego_noturno') {
                if (u < 0.38) { const k = u / 0.38, r = 0.02 + Math.pow(k, 1.4) * 0.22; return [r, r]; }
                if (u < 0.78) { const k = (u - 0.38) / 0.40, sw = Math.sin(k * Math.PI); return [0.24 + sw * 0.34, 0.24 + sw * 0.30]; }
                const k = (u - 0.78) / 0.22; return [0.24 - k * 0.06, 0.24 - k * 0.06];
            }
            if (id === 'sereia_glacial') {
                if (u < 0.52) { const k = u / 0.52, r = 0.04 + Math.pow(k, 1.2) * 0.22; return [r * 0.85, r * 1.12]; }
                if (u < 0.76) { const k = (u - 0.52) / 0.24, sw = Math.sin(k * Math.PI); return [0.23 + sw * 0.16, 0.26 + sw * 0.20]; }
                const k = (u - 0.76) / 0.24; return [0.22 - k * 0.09, 0.24 - k * 0.10];
            }
            if (id === 'esmeralda') {
                if (u < 0.44) { const k = u / 0.44, r = 0.03 + Math.pow(k, 1.3) * 0.28; return [r * 0.96, r * 1.05]; }
                if (u < 0.72) { const k = (u - 0.44) / 0.28, sw = Math.sin(k * Math.PI); return [0.30 + sw * 0.26, 0.31 + sw * 0.28]; }
                const k = (u - 0.72) / 0.28; return [0.30 - k * 0.12, 0.32 - k * 0.13];
            }
            if (u < 0.46) { const k = u / 0.46, r = 0.025 + Math.pow(k, 1.35) * 0.25; return [r * 0.92, r * 1.06]; }
            if (u < 0.72) { const k = (u - 0.46) / 0.26, sw = Math.sin(k * Math.PI); return [0.27 + sw * 0.22, 0.28 + sw * 0.26]; }
            const k = (u - 0.72) / 0.28; return [0.28 - k * 0.11, 0.30 - k * 0.12];
        };
        const dorsalSpines = [];
        const spCnt = cfg.dorsalStyle === 'gemPlates' ? 14 : (cfg.dorsalStyle === 'batSpikes' ? 12 : 18);
        for (let i = 0; i < spCnt; i++) {
            const u = 0.14 + (i / (spCnt - 1)) * 0.78, sz = (u > 0.50 && u < 0.76) ? 0.30 : (0.10 + u * 0.14);
            let geo;
            if (cfg.dorsalStyle === 'gemPlates') geo = new T.OctahedronGeometry(sz * 0.62, 0);
            else if (cfg.dorsalStyle === 'iceFin') geo = new T.ConeGeometry(sz * 0.18, sz * 1.95, 4);
            else if (cfg.dorsalStyle === 'batSpikes') geo = new T.ConeGeometry(sz * 0.24, sz * 1.35, 4);
            else geo = new T.ConeGeometry(sz * 0.26, sz * 1.55, 5);
            const spM = new T.Mesh(geo, i % 2 ? c1Mat : c2Mat);
            if (cfg.dorsalStyle === 'gemPlates') spM.scale.set(0.45, 1.35, 1.15);
            pivot.add(spM); dorsalSpines.push({ mesh: spM, u, sz });
        }
        const tailFin = new T.Group();
        if (cfg.tailStyle === 'crescentFin') {
            [-1, 1].forEach(s => {
                const fl = new T.Mesh(new T.OctahedronGeometry(0.42, 0), s > 0 ? c1Mat : c2Mat);
                fl.scale.set(0.16, 1.55, 0.85); fl.position.set(s * 0.34, 0, -0.35); fl.rotation.y = s * 0.55; fl.rotation.z = s * 0.35; tailFin.add(fl);
            });
            const ctr = new T.Mesh(new T.OctahedronGeometry(0.22, 0), goldMat); ctr.scale.set(0.35, 0.35, 1.3); tailFin.add(ctr);
        } else if (cfg.tailStyle === 'harpoon') {
            const hp = new T.Mesh(new T.ConeGeometry(0.18, 0.85, 4), hornMat); hp.rotation.x = -Math.PI / 2; hp.position.z = -0.35; tailFin.add(hp);
            [-1, 1].forEach(s => { const b = new T.Mesh(new T.ConeGeometry(0.06, 0.42, 4), c1Mat); b.position.set(s * 0.16, 0, -0.05); b.rotation.z = s * 0.65; b.rotation.x = Math.PI * 0.65; tailFin.add(b); });
        } else if (cfg.tailStyle === 'emeraldMace') {
            const gm = new T.Mesh(new T.OctahedronGeometry(0.38, 0), c1Mat); gm.scale.set(0.75, 0.55, 1.55); gm.position.z = -0.25; tailFin.add(gm);
            const fr = new T.Mesh(new T.TorusGeometry(0.28, 0.04, 6, 6), goldMat); fr.rotation.x = Math.PI / 2; fr.position.z = -0.15; tailFin.add(fr);
        } else if (cfg.tailStyle === 'twinRibbons') {
            [-1, 1].forEach(s => {
                const rb = new T.Mesh(new T.ConeGeometry(0.16, 1.45, 4), s > 0 ? c1Mat : c2Mat);
                rb.scale.set(0.28, 1, 1); rb.rotation.x = -Math.PI / 2; rb.rotation.z = s * 0.25; rb.position.set(s * 0.22, 0.05, -0.65); tailFin.add(rb);
            });
        } else {
            const tb1 = new T.Mesh(new T.OctahedronGeometry(0.28, 0), c1Mat); tb1.scale.set(0.32, 0.55, 1.9); tailFin.add(tb1);
            const tb2 = new T.Mesh(new T.ConeGeometry(0.10, 0.65, 5), goldMat); tb2.rotation.x = -Math.PI / 2; tb2.position.z = -0.35; tailFin.add(tb2);
        }
        pivot.add(tailFin);
        const staticTube = (pts, segs, rSegs, rFn, mat, ridge) => {
            const cv = new T.CatmullRomCurve3(pts), fr = cv.computeFrenetFrames(segs, false);
            const pos = [], uvs = [], idx = [], P0 = new T.Vector3(), N0 = new T.Vector3(), B0 = new T.Vector3(), V0 = new T.Vector3();
            for (let i = 0; i <= segs; i++) {
                const u = i / segs; cv.getPointAt(u, P0); N0.copy(fr.normals[i]); B0.copy(fr.binormals[i]);
                const r = rFn(u), rx = typeof r === 'number' ? r : r[0], ry = typeof r === 'number' ? r : r[1];
                const rg = ridge ? (1 + Math.sin(u * Math.PI * 24) * ridge) : 1;
                for (let j = 0; j <= rSegs; j++) { const v = j / rSegs, a = v * Math.PI * 2; V0.copy(P0).addScaledVector(N0, Math.cos(a) * rx * rg).addScaledVector(B0, Math.sin(a) * ry * rg); pos.push(V0.x, V0.y, V0.z); uvs.push(v, u); }
            }
            const row = rSegs + 1;
            for (let i = 0; i < segs; i++) for (let j = 0; j < rSegs; j++) { const a = i * row + j, b = (i + 1) * row + j, c = (i + 1) * row + j + 1, d = i * row + j + 1; idx.push(a, b, d, b, c, d); }
            const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(uvs, 2)); g.setIndex(idx); g.computeVertexNormals();
            return new T.Mesh(g, mat);
        };
        const headGrp = new T.Group(); pivot.add(headGrp);
        const snoutLen = cfg.headStyle === 'bat' ? 0.68 : (cfg.headStyle === 'mermaid' ? 1.02 : 0.90);
        headGrp.add(staticTube([new T.Vector3(0, 0.0, -0.14), new T.Vector3(0, 0.09, 0.16), new T.Vector3(0, 0.04, snoutLen * 0.6), new T.Vector3(0, -0.01, snoutLen)], 18, 12, u => [0.23 * (1 - u * 0.56), 0.19 * (1 - u * 0.62)], bodyMat));
        if (cfg.headStyle === 'mermaid') {
            for (let k = -2; k <= 2; k++) {
                const tc = new T.Mesh(new T.ConeGeometry(0.032 - Math.abs(k) * 0.004, 0.52 - Math.abs(k) * 0.09, 4), k === 0 ? c2Mat : c1Mat);
                tc.position.set(k * 0.09, 0.24 - Math.abs(k) * 0.03, 0.14 - Math.abs(k) * 0.06); tc.rotation.x = -0.35; tc.rotation.z = -k * 0.24; headGrp.add(tc);
            }
        } else if (cfg.headStyle === 'aurora') {
            const halo = new T.Mesh(new T.TorusGeometry(0.42, 0.024, 8, 28), c1Mat);
            halo.position.set(0, 0.42, -0.22); halo.rotation.x = 0.28; headGrp.add(halo);
        } else if (cfg.headStyle !== 'bat') {
            const nCrest = new T.Mesh(new T.ConeGeometry(0.045, 0.44, 5), goldMat); nCrest.rotation.x = Math.PI * 0.56; nCrest.position.set(0, 0.11, 0.55); headGrp.add(nCrest);
        }
        [-1, 1].forEach(s => {
            headGrp.add(staticTube([new T.Vector3(s * 0.10, 0.14, 0.40), new T.Vector3(s * 0.20, 0.17, 0.24), new T.Vector3(s * 0.22, 0.13, 0.04)], 8, 6, u => 0.032 * (1 - u * 0.25), goldMat));
            const eye = new T.Mesh(new T.SphereGeometry(0.062, 12, 10), eyeMat); eye.scale.set(0.72, 0.80, 1.15); eye.position.set(s * 0.175, 0.08, 0.28); eye.rotation.y = s * 0.55; headGrp.add(eye);
            const fang = new T.Mesh(new T.ConeGeometry(cfg.headStyle === 'bat' ? 0.024 : 0.016, cfg.headStyle === 'bat' ? 0.18 : 0.10, 5), fangMat);
            fang.position.set(s * 0.085, -0.06, snoutLen * 0.72); fang.rotation.x = Math.PI; headGrp.add(fang);
            if (cfg.headStyle === 'bat') {
                // Tall sculpted vampire-bat ears!
                const ear = new T.Mesh(new T.ConeGeometry(0.14, 0.78, 4), hornMat);
                ear.scale.set(0.42, 1, 0.85); ear.position.set(s * 0.22, 0.36, -0.14); ear.rotation.z = -s * 0.38; ear.rotation.x = -0.35; headGrp.add(ear);
                const earIn = new T.Mesh(new T.ConeGeometry(0.075, 0.56, 4), c1Mat);
                earIn.scale.set(0.35, 1, 0.6); earIn.position.set(s * 0.22, 0.35, -0.10); earIn.rotation.z = -s * 0.38; earIn.rotation.x = -0.35; headGrp.add(earIn);
            } else if (cfg.headStyle === 'emerald') {
                // Branched emerald crystal antlers!
                headGrp.add(staticTube([new T.Vector3(s * 0.12, 0.14, 0.06), new T.Vector3(s * 0.34, 0.42, -0.26), new T.Vector3(s * 0.56, 0.72, -0.78), new T.Vector3(s * 0.46, 0.96, -1.16)], 18, 8, u => 0.072 * (1 - u * 0.82), c1Mat, 0.10));
                headGrp.add(staticTube([new T.Vector3(s * 0.32, 0.40, -0.24), new T.Vector3(s * 0.58, 0.56, -0.20), new T.Vector3(s * 0.72, 0.76, -0.36)], 10, 6, u => 0.044 * (1 - u * 0.82), c2Mat));
                headGrp.add(staticTube([new T.Vector3(s * 0.16, -0.03, 0.08), new T.Vector3(s * 0.34, -0.12, -0.20)], 8, 5, u => 0.038 * (1 - u * 0.8), c1Mat));
            } else if (cfg.headStyle === 'aurora') {
                // Sweeping upward celestial lyre horns + silk whiskers!
                headGrp.add(staticTube([new T.Vector3(s * 0.11, 0.14, 0.08), new T.Vector3(s * 0.38, 0.36, -0.18), new T.Vector3(s * 0.46, 0.78, -0.42), new T.Vector3(s * 0.24, 1.06, -0.30)], 20, 8, u => 0.056 * (1 - u * 0.84), goldMat));
                headGrp.add(staticTube([new T.Vector3(s * 0.10, -0.02, 0.66), new T.Vector3(s * 0.52, -0.12, 0.36), new T.Vector3(s * 0.84, 0.08, -0.24)], 14, 5, u => 0.016 * (1 - u * 0.76), c2Mat));
            } else if (cfg.headStyle === 'mermaid') {
                // Flowing aquatic translucent cheek-fins & whiskers!
                headGrp.add(staticTube([new T.Vector3(s * 0.16, 0.08, 0.04), new T.Vector3(s * 0.44, 0.18, -0.38), new T.Vector3(s * 0.58, 0.12, -0.96)], 16, 6, u => 0.052 * (1 - u * 0.85), c1Mat));
                headGrp.add(staticTube([new T.Vector3(s * 0.10, -0.02, 0.78), new T.Vector3(s * 0.48, -0.16, 0.46), new T.Vector3(s * 0.76, -0.04, -0.18)], 14, 5, u => 0.016 * (1 - u * 0.8), c2Mat));
            } else {
                headGrp.add(staticTube([new T.Vector3(s * 0.13, 0.14, 0.08), new T.Vector3(s * 0.36, 0.36, -0.28), new T.Vector3(s * 0.52, 0.58, -0.82), new T.Vector3(s * 0.40, 0.82, -1.28)], 20, 10, u => 0.078 * (1 - u * 0.88), hornMat, 0.14));
                headGrp.add(staticTube([new T.Vector3(s * 0.18, 0.0, 0.04), new T.Vector3(s * 0.40, -0.04, -0.32), new T.Vector3(s * 0.52, 0.08, -0.68)], 12, 6, u => 0.042 * (1 - u * 0.86), c1Mat));
                headGrp.add(staticTube([new T.Vector3(s * 0.10, -0.02, 0.68), new T.Vector3(s * 0.44, -0.14, 0.44), new T.Vector3(s * 0.68, -0.02, -0.04)], 12, 5, u => 0.015 * (1 - u * 0.78), c1Mat));
            }
        });
        const jawGrp = new T.Group(); jawGrp.position.set(0, -0.055, 0.08); headGrp.add(jawGrp);
        jawGrp.add(staticTube([new T.Vector3(0, 0, 0), new T.Vector3(0, -0.03, snoutLen * 0.42), new T.Vector3(0, -0.01, snoutLen * 0.78)], 12, 10, u => [0.16 * (1 - u * 0.56), 0.08 * (1 - u * 0.5)], bodyMat));
        const WSEG = hi ? 20 : 14, HSEG = hi ? 8 : 6;
        const buildLiveWing = (side, wSpan, wChordK, wArches, phOff) => {
            const wg = new T.Group(); pivot.add(wg);
            const geo = new T.BufferGeometry(), pos = new Float32Array((WSEG + 1) * (HSEG + 1) * 3), uv = new Float32Array((WSEG + 1) * (HSEG + 1) * 2), idx = [];
            for (let i = 0; i <= WSEG; i++) for (let j = 0; j <= HSEG; j++) { const k = (i * (HSEG + 1) + j) * 2; uv[k] = i / WSEG; uv[k + 1] = j / HSEG; }
            for (let i = 0; i < WSEG; i++) for (let j = 0; j < HSEG; j++) { const a = i * (HSEG + 1) + j, b = (i + 1) * (HSEG + 1) + j, c = (i + 1) * (HSEG + 1) + j + 1, d = i * (HSEG + 1) + j + 1; idx.push(a, b, d, b, c, d); }
            geo.setAttribute('position', new T.BufferAttribute(pos, 3)); geo.setAttribute('uv', new T.BufferAttribute(uv, 2)); geo.setIndex(idx);
            const mem = new T.Mesh(geo, wingMat); mem.frustumCulled = false; wg.add(mem);
            const armGeo = new T.BufferGeometry(), armPos = new Float32Array((WSEG + 1) * 9 * 3), armIdx = [];
            for (let i = 0; i < WSEG; i++) for (let j = 0; j < 8; j++) { const a = i * 9 + j, b = (i + 1) * 9 + j, c = (i + 1) * 9 + j + 1, d = i * 9 + j + 1; armIdx.push(a, b, d, b, c, d); }
            armGeo.setAttribute('position', new T.BufferAttribute(armPos, 3)); armGeo.setIndex(armIdx);
            const armMesh = new T.Mesh(armGeo, bodyMat); armMesh.frustumCulled = false; wg.add(armMesh);
            let thumbClaw = null;
            if (id === 'morcego_noturno' && !phOff) {
                thumbClaw = new T.Mesh(new T.ConeGeometry(0.055, 0.36, 5), goldMat);
                thumbClaw.rotation.x = 0.65; wg.add(thumbClaw);
            }
            return {
                grp: wg,
                update(t, amp, spd) {
                    const pa = geo.attributes.position.array, ap = armGeo.attributes.position.array;
                    for (let i = 0; i <= WSEG; i++) {
                        const u = i / WSEG, ph = t * spd - u * 1.55 - (phOff || 0);
                        const beat = Math.sin(ph) + 0.24 * Math.sin(ph * 2 - 0.5);
                        const span = u * wSpan, lift = Math.sin(u * Math.PI * 0.72) * 0.85 + beat * amp * Math.pow(u, 1.15);
                        const sweep = -Math.pow(u, 1.35) * (wSpan * 0.35) - Math.cos(ph) * 0.24 * u;
                        if (thumbClaw && i === Math.round(WSEG * 0.42)) thumbClaw.position.set(side * span, lift + 0.14, sweep + 0.14);
                        const br = 0.084 * (1 - u * 0.75);
                        for (let rj = 0; rj <= 8; rj++) { const ang = (rj / 8) * Math.PI * 2, ak = (i * 9 + rj) * 3; ap[ak] = side * span; ap[ak + 1] = lift + Math.sin(ang) * br; ap[ak + 2] = sweep + Math.cos(ang) * br; }
                        const chord = (0.75 + Math.sin(u * Math.PI * 0.88) * 1.45) * wChordK * (1 - Math.pow(u, 4) * 0.75) * (1 - Math.abs(Math.sin(u * Math.PI * wArches)) * 0.28);
                        for (let j = 0; j <= HSEG; j++) {
                            const v = j / HSEG, vLag = Math.sin(ph - v * 0.65) * 0.22 * v * u, camber = Math.sin(v * Math.PI) * 0.22 * (1 - u * 0.3);
                            const pk = (i * (HSEG + 1) + j) * 3;
                            pa[pk] = side * (span * (1 - v * 0.08)); pa[pk + 1] = lift + camber + vLag - v * 0.28; pa[pk + 2] = sweep - v * chord;
                        }
                    }
                    geo.attributes.position.needsUpdate = true; geo.computeVertexNormals();
                    armGeo.attributes.position.needsUpdate = true; armGeo.computeVertexNormals();
                }
            };
        };
        const wingL = buildLiveWing(-1, cfg.span, cfg.chordK, cfg.arches, 0);
        const wingR = buildLiveWing(1, cfg.span, cfg.chordK, cfg.arches, 0);
        const rearL = cfg.rearWings ? buildLiveWing(-1, 2.35, 0.72, 2.0, 0.85) : null;
        const rearR = cfg.rearWings ? buildLiveWing(1, 2.35, 0.72, 2.0, 0.85) : null;
        const starOrbits = [];
        for (let i = 0; i < cfg.orbitCount; i++) {
            const g = new T.Group();
            const core = new T.Mesh(new T.OctahedronGeometry(0.14, id === 'esmeralda' ? 0 : 1), i % 3 === 0 ? c1Mat : (i % 3 === 1 ? c2Mat : goldMat)); g.add(core);
            const halo = new T.Mesh(new T.RingGeometry(0.19, 0.24, 20), new T.MeshBasicMaterial({ color: i % 2 ? cfg.c2 : cfg.c1, side: T.DoubleSide, transparent: true, opacity: 0.68 })); g.add(halo);
            pivot.add(g); starOrbits.push({ g, core, halo, ph: (i / cfg.orbitCount) * Math.PI * 2 });
        }
        const tmpP = new T.Vector3(), tmpN = new T.Vector3(), tmpB = new T.Vector3(), tmpT = new T.Vector3(), tmpV = new T.Vector3(), tmpLook = new T.Vector3(), upVec = new T.Vector3(0, 1, 0);
        const ctrl = [0, 1, 2, 3, 4, 5, 6].map(() => new T.Vector3());
        let curT = Math.random() * 6, atkLeft = 0;
        const step = (t, dt) => {
            if (atkLeft > 0) atkLeft = Math.max(0, atkLeft - (dt || 0.016));
            const firing = atkLeft > 0 && atkLeft < 1.1;
            const coil = atkLeft >= 1.1 ? Math.sin(((1.6 - atkLeft) / 0.5) * Math.PI * 0.5) : 0;
            const spd = firing ? cfg.spd0 * 1.9 : (coil > 0 ? cfg.spd0 * 1.5 : cfg.spd0), amp = firing ? cfg.amp0 * 1.25 : cfg.amp0;
            for (let k = 0; k < 7; k++) {
                const u = k / 6;
                const z = cfg.z0 + u * cfg.zLen - (u > 0.65 ? coil * 0.60 * (u - 0.65) * 3 : 0);
                const waveX = Math.sin(t * 2.4 - (1 - u) * 4.4) * (0.58 * cfg.waveMul * Math.pow(1 - u, 1.25) + 0.05);
                const baseY = 1.15 + Math.sin(u * Math.PI * 1.15) * 0.48 + (u > 0.7 ? Math.pow((u - 0.7) / 0.3, 1.4) * (id === 'morcego_noturno' ? 0.65 : 1.15) : 0);
                const hoverY = Math.sin(t * spd - (1 - u) * 2.6) * (0.20 + (1 - u) * 0.16) + (u > 0.7 ? coil * 0.35 : 0);
                ctrl[k].set(waveX, baseY + hoverY, z);
            }
            const curve = new T.CatmullRomCurve3(ctrl);
            const pArr = bodyGeo.attributes.position.array;
            for (let i = 0; i <= SEGS; i++) {
                const u = i / SEGS; curve.getPointAt(u, tmpP); curve.getTangentAt(u, tmpT).normalize();
                tmpB.crossVectors(tmpT, upVec); if (tmpB.lengthSq() < 1e-4) tmpB.set(1, 0, 0); else tmpB.normalize();
                tmpN.crossVectors(tmpB, tmpT).normalize();
                const [rx, ry] = bodyRadius(u);
                for (let j = 0; j <= RAD; j++) {
                    const ang = (j / RAD) * Math.PI * 2, cA = Math.cos(ang), sA = Math.sin(ang);
                    tmpV.copy(tmpP).addScaledVector(tmpN, cA * ry).addScaledVector(tmpB, sA * rx);
                    const k = (i * (RAD + 1) + j) * 3; pArr[k] = tmpV.x; pArr[k + 1] = tmpV.y; pArr[k + 2] = tmpV.z;
                }
            }
            bodyGeo.attributes.position.needsUpdate = true; bodyGeo.computeVertexNormals();
            for (let i = 0; i < dorsalSpines.length; i++) {
                const s = dorsalSpines[i]; curve.getPointAt(s.u, tmpP); curve.getTangentAt(s.u, tmpT).normalize();
                const [, ry] = bodyRadius(s.u);
                s.mesh.position.set(tmpP.x, tmpP.y + ry * 0.92, tmpP.z);
                s.mesh.lookAt(tmpP.x + tmpT.x, tmpP.y + ry + tmpT.y + 0.65, tmpP.z + tmpT.z);
                s.mesh.rotateX(Math.PI / 2);
            }
            curve.getPointAt(0.01, tmpP); curve.getTangentAt(0.01, tmpT).normalize();
            tailFin.position.copy(tmpP); tailFin.lookAt(tmpLook.copy(tmpP).add(tmpT));
            curve.getPointAt(1.0, tmpP); curve.getTangentAt(1.0, tmpT).normalize();
            headGrp.position.copy(tmpP); headGrp.lookAt(tmpP.x + tmpT.x * 0.5, tmpP.y + (coil * 0.25 - (firing ? 0.05 : 0.12)), tmpP.z + 1.4);
            jawGrp.rotation.x = firing ? 0.44 + Math.sin(t * 22) * 0.05 : (coil * 0.26 + 0.05 + Math.max(0, Math.sin(t * 2.2)) * 0.06);
            curve.getPointAt(0.68, tmpP);
            wingL.grp.position.set(tmpP.x - 0.32, tmpP.y + 0.16, tmpP.z + 0.05);
            wingR.grp.position.set(tmpP.x + 0.32, tmpP.y + 0.16, tmpP.z + 0.05);
            wingL.update(t, amp, spd); wingR.update(t, amp, spd);
            if (rearL && rearR) {
                curve.getPointAt(0.44, tmpV);
                rearL.grp.position.set(tmpV.x - 0.22, tmpV.y + 0.08, tmpV.z);
                rearR.grp.position.set(tmpV.x + 0.22, tmpV.y + 0.08, tmpV.z);
                rearL.update(t, amp * 0.72, spd); rearR.update(t, amp * 0.72, spd);
            }
            for (let i = 0; i < starOrbits.length; i++) {
                const o = starOrbits[i], a = t * (firing ? 2.4 : 0.95) + o.ph, rad = firing ? cfg.orbitRad * 0.82 : cfg.orbitRad;
                o.g.position.set(tmpP.x + Math.cos(a) * rad, tmpP.y + Math.sin(a * 2) * 0.55, tmpP.z + Math.sin(a) * rad * 0.85);
                o.core.rotation.y = t * 2.5; o.halo.rotation.x = t * 1.4 + i; o.halo.rotation.y = t * 1.9 + i;
            }
        };
        step(0.4, 0.016);
        const mkAct = k => ({ _k: k, timeScale: 1, reset() { return this; }, fadeIn() { return this; }, fadeOut() { return this; }, play() { if (k === 'atk') atkLeft = 1.6; return this; }, stop() { return this; }, setEffectiveWeight() { return this; }, setEffectiveTimeScale() { return this; }, isRunning() { return true; }, getEffectiveWeight() { return 1; }, getClip() { return { duration: 4.0 }; } });
        const act = { fly: mkAct('fly'), idle: mkAct('idle'), atk: mkAct('atk'), cur: null }; act.cur = act.fly;
        const mixer = { time: 0, update(dt) { curT += (dt || 0); this.time = curT; step(curT, dt || 0.016); }, setTime(t) { curT = t || 0; this.time = curT; step(curT, 0.016); } };
        const P = { head: headGrp, legs: [], wings: [], tail: tailFin, neck: null };
        let aura = null;
        if (sp.glow) { aura = new T.Mesh(G.ring, new T.MeshBasicMaterial({ color: sp.glow, transparent: true, opacity: 0.35, depthWrite: false, blending: T.AdditiveBlending })); aura.position.y = 0.02; aura.scale.setScalar(0.62); root.add(aura); }
        return { g: root, body, P, aura, sp, sz: (sp.D || 1.35) * 1.7, mixer, act, pv: pivot, model: true, dragon: true, proc: true, hov: true, canWalk: false };
    }
    function zBuildModel(sp, hi, al) {
        if (sp && ZDB[sp.base] && ZDB[sp.base].custom && ZCUSTOM_DRAGONS[sp.id]) return zBuildCustomDragon(sp, hi, al);
        const D = ZMD[sp.id]; if (!D || (D.hiOnly && !hi)) return null; if (!zModelOk(D.f)) { try { clModelLoad(D.f); } catch (e) {} return null; }
        try {
            if (D.dragon) return zBuildDragon(sp, D, al);
            const T = clTh(), G = zG(), tpl = CLM.tpl[D.f], root = new T.Group(), body = new T.Group(); root.add(body); let skin = false; tpl.gl.scene.traverse(o => { if (o.isSkinnedMesh) skin = true; });
            const m = skin && T.SkeletonUtils ? T.SkeletonUtils.clone(tpl.gl.scene) : tpl.gl.scene.clone(true);
            let rig = null; if (!skin && /^(galinha|pato|cisne|cabra|carneiro|unicornio)$/.test(sp.id)) { try { rig = zRig(m, /^(galinha|pato|cisne)$/.test(sp.id)); if (!rig.length) rig = null; } catch (er) { rig = null; try { console.warn('rig', sp.id, er); } catch (e3) {} } }
            let sleg = null; if (skin && sp.id === 'ovelha') { sleg = []; m.traverse(o => { if (o.isBone && /^(Front|Back)(Up)?Leg\.(L|R)$/.test(o.name)) sleg.push({ b: o, ph: (/Front/.test(o.name) ? 0 : Math.PI) + (/\.R/.test(o.name) ? Math.PI : 0) }); }); const seen = {}; sleg = sleg.filter(l => /Up/.test(l.b.name) || !sleg.some(q => q.b.name === l.b.name.replace('Leg', 'UpLeg'))); }
            m.traverse(o => { if (!o.isMesh) return; o.castShadow = !D.dragon; o.receiveShadow = true; o.frustumCulled = false; const arr = Array.isArray(o.material), ms = arr ? o.material : [o.material], nm = ms.map(mt => { const c = mt.clone(); if (c.color) { if (D.tint) c.color.lerp(new T.Color(D.tint[0]), D.tint[1]); if (c.emissive) { c.emissive.copy(c.color).multiplyScalar(0.2); if (D.glow) c.emissive.lerp(new T.Color(D.glow), 0.12); } } return c; }); o.material = arr ? nm : nm[0]; });
            const pivot = new T.Group(); pivot.add(m); pivot.rotation.y = D.yaw; body.add(pivot); pivot.updateMatrixWorld(true);
            let mixer = null, act = null; if (tpl.gl.animations && tpl.gl.animations.length && (D.idle || D.walk)) { mixer = new T.AnimationMixer(m); const pk = re => re && tpl.gl.animations.find(a => re.test(a.name)); const ai = pk(D.idle), aw = pk(D.walk); act = { idle: ai ? mixer.clipAction(ai) : null, walk: aw ? mixer.clipAction(aw) : null, cur: null }; const f0 = act.idle || act.walk; if (f0) { f0.play(); act.cur = f0; mixer.update(Math.random() * 2); } }
            m.updateMatrixWorld(true); let bb = new T.Box3().setFromObject(pivot), sz = bb.getSize(new T.Vector3()); const k = D.D * 1.55 / Math.max(sz.x, sz.y, sz.z, 1e-6); pivot.scale.setScalar(k); pivot.updateMatrixWorld(true); bb = new T.Box3().setFromObject(pivot); const ct = bb.getCenter(new T.Vector3()); pivot.position.set(-ct.x, -bb.min.y, -ct.z);
            const flap = []; if (D.flap) m.traverse(o => { if (/(Left|Right)_Wing_0_/.test(o.name)) flap.push({ o, z: o.rotation.z, sd: /Left/.test(o.name) ? 1 : -1 }); });
            let aura = null; const gl = (D.glow) || (sp.cl && sp.cl.glow) || (al >= 7 ? ZEL[sp.el].col : null); if ((sp.rk >= 2 || al >= 7) && gl) { aura = new T.Mesh(G.ring, new T.MeshBasicMaterial({ color: gl, transparent: true, opacity: 0.4, depthWrite: false, blending: T.AdditiveBlending })); aura.position.y = 0.02; aura.scale.setScalar(0.42 + sp.rk * 0.06); root.add(aura); }
            const P = { head: null, legs: [], wings: [], tail: null, neck: null }; if (al >= 10) { const cr = new T.Mesh(G.ring, new T.MeshBasicMaterial({ color: '#ffd35c', transparent: true, opacity: 0.95, depthWrite: false, side: T.DoubleSide })); cr.rotation.x = Math.PI / 2; cr.scale.setScalar(0.3); cr.position.set(0.0, D.D * 1.05, 0); root.add(cr); P.crown = cr; }
            return { g: root, body, P, aura, sp, sz: D.D * 1.7, mixer, act, flap, rig, sleg, pv: pivot, model: true, hov: sp.id === 'fenix' };
        } catch (e) { try { console.warn('modelo do bicho', sp.id, e); } catch (e2) {} return null; }
    }
    const zHasModel = (id, hi) => { const D = ZMD[id]; return !!(D && zModelOk(D.f) && !(D.hiOnly && !hi)); };
    function zEnsureModels(ids, all) { let n = 0; Object.keys(ZMD).forEach(id => { if (all || ids.indexOf(id) >= 0) { try { clModelLoad(ZMD[id].f); } catch (e) {} } if (zModelOk(ZMD[id].f)) n++; }); try { clModelLoad('zoo/barn.glb'); } catch (e) {} ZLAIR.forEach(f => { try { clModelLoad(f); } catch (e) {} }); return n + (zModelOk('zoo/barn.glb') ? 100 : 0) + (zLairOk() ? 1000 : 0); }
/* === [SEC: DRAGOES_MODELOS_3D] === */
    /* ---------- Dragões Estilizados Feitos por Código (Procedural Three.js) ---------- */
    function zBuildCodeDragon(sp, hi, al) {
        al = al || 1;
        const T = clTh(), G = zG();
        const c = sp.cl || {};
        const rk = sp.rk | 0;
        const elKey = sp.el || 'terra';
        const EL = ZEL[elKey] || ZEL.terra;
        const R = ZR[rk] || ZR[0];

        const isBaby = al < 5;
        const isAdult = al >= 5 && al < 10;
        const isElder = al >= 10;
        const lvScale = isBaby ? 0.88 : (isElder ? 1.25 : 1.12);

        const root = new T.Group();
        const body = new T.Group();
        root.add(body);

        const P = { head: null, neck: null, legs: [], wings: [], tail: null, crown: null, horns: [], orbs: [] };
        const SP = hi ? G.sp : G.sl;

        const mk = (geo, mat, sx, sy, sz, x, y, z, par) => {
            const m = new T.Mesh(geo, mat);
            m.scale.set(sx, sy, sz);
            m.position.set(x, y, z);
            m.castShadow = true;
            (par || body).add(m);
            return m;
        };
        const grp = (x, y, z, par) => {
            const g = new T.Group();
            g.position.set(x, y, z);
            (par || body).add(g);
            return g;
        };

        const primCol = c.c || (sp.tint && sp.tint[0]) || EL.col;
        const secCol = c.c2 || '#ffffff';
        const hornCol = rk >= 4 ? '#ffd766' : (rk >= 3 ? '#ffcc44' : (rk === 2 ? '#a0e8ff' : '#4a3b32'));
        const glowCol = sp.glow || (rk >= 2 ? EL.col : null);

        const M = (hex, emi, metal, rough) => {
            return new T.MeshStandardMaterial({
                color: new T.Color(hex),
                emissive: emi ? new T.Color(emi) : new T.Color(hex).multiplyScalar(0.06),
                emissiveIntensity: emi ? (rk >= 3 ? 0.3 : 0.3) : 0.06,   /* menos brilho: o roxo não estoura para branco */
                metalness: metal !== undefined ? metal : (rk >= 2 ? 0.35 : 0.1),
                roughness: rough !== undefined ? rough : (rk >= 2 ? 0.35 : 0.65)
            });
        };

        const skinMat = M(primCol, glowCol);
        const bellyMat = M(secCol, null, 0.05, 0.7);
        const hornMat = M(hornCol, rk >= 3 ? hornCol : null, rk >= 2 ? 0.7 : 0.2, 0.25);
        const eyeMat = M('#0c1018', null, 0.9, 0.1);
        const shineMat = new T.MeshBasicMaterial({ color: 0xffffff });
        const wingMat = M(c.wing || primCol, glowCol, 0.2, 0.5);

        const legH = 0.16;

        // 1. Tronco e Barriga Suave
        const bL = 0.44, bH = 0.25, bW = 0.26;
        mk(SP, skinMat, bL, bH, bW, 0, legH + 0.14, 0);
        mk(SP, skinMat, 0.24, 0.26, 0.26, 0.12, legH + 0.15, 0);
        mk(SP, skinMat, 0.24, 0.26, 0.26, -0.13, legH + 0.15, 0);
        mk(SP, bellyMat, bL * 0.82, bH * 0.48, bW * 0.78, 0.02, legH + 0.07, 0);

        // 2. Pernas Quadrúpedes com Garras
        const legCols = [[0.14, 0.1], [0.14, -0.1], [-0.14, 0.1], [-0.14, -0.1]];
        legCols.forEach((p, idx) => {
            const lg = grp(p[0], legH, p[1]);
            mk(SP, skinMat, 0.08, 0.1, 0.08, 0, 0, 0, lg);
            mk(G.leg, skinMat, 0.055, legH, 0.055, 0, -legH * 0.4, 0, lg);
            const clawMat = rk >= 3 ? hornMat : M('#252220');
            mk(SP, clawMat, 0.075, 0.045, 0.075, 0.018, -legH, 0, lg);
            [-0.02, 0, 0.02].forEach(offZ => {
                mk(G.cone, clawMat, 0.015, 0.035, 0.015, 0.05, -legH, offZ, lg).rotation.z = -Math.PI / 2;
            });
            P.legs.push({ g: lg, ph: (idx === 0 || idx === 3) ? 0 : Math.PI });
        });

        // 3. Pescoço Esculpido
        const nk = grp(0.2, legH + 0.2, 0);
        nk.rotation.z = -0.55;
        mk(SP, skinMat, 0.15, 0.26, 0.15, 0, 0.1, 0, nk);
        mk(SP, bellyMat, 0.11, 0.24, 0.11, 0.04, 0.1, 0, nk);
        P.neck = nk;

        // 4. Cabeça e Focinho do Dragão
        const hd = grp(0.28, legH + 0.35, 0);
        P.head = hd;
        mk(SP, skinMat, 0.21, 0.18, 0.17, 0, 0, 0, hd);
        mk(SP, bellyMat, 0.13, 0.09, 0.12, 0.12, -0.04, 0, hd);
        mk(SP, M('#201518'), 0.025, 0.02, 0.03, 0.18, -0.02, 0, hd);

        // Olhos Expressivos Anime com Ponto de Brilho
        const eyes = (par, x, y, z, r) => {
            [-1, 1].forEach(sd => {
                mk(SP, eyeMat, r * 1.5, r * 1.7, r * 1.1, x, y, z * sd, par);
                const irisMat = M(EL.col, EL.col);
                mk(SP, irisMat, r * 1.1, r * 1.3, r * 0.9, x + r * 0.15, y, z * sd * 1.02, par);
                mk(SP, shineMat, r * 0.55, r * 0.55, r * 0.5, x + r * 0.5, y + r * 0.45, z * sd * 1.08, par);
                mk(SP, shineMat, r * 0.25, r * 0.25, r * 0.25, x + r * 0.3, y - r * 0.35, z * sd * 1.1, par);
            });
        };
        eyes(hd, 0.07, 0.04, 0.072, 0.032);

        // Orelhas de Dragão / Barbatanas laterais
        [-1, 1].forEach(sd => {
            const ear = mk(SP, skinMat, 0.09, 0.04, 0.06, -0.03, 0.03, 0.1 * sd, hd);
            ear.rotation.x = sd * 0.45;
            ear.rotation.y = -sd * 0.2;
        });

        // 5. Chifres por Raridade
        const hornL = (rk >= 4 ? 0.28 : (rk >= 3 ? 0.24 : (rk === 2 ? 0.20 : (rk === 1 ? 0.18 : 0.14)))) * (isAdult ? 1.25 : 1.0);
        [-1, 1].forEach(sd => {
            const h = mk(G.cone, hornMat, 0.03, hornL, 0.03, -0.03, 0.1 + hornL * 0.4, 0.065 * sd, hd);
            h.rotation.z = 0.65;
            h.rotation.x = sd * 0.32;
            P.horns.push(h);

            if (rk >= 2) {
                const hTip = mk(G.cone, hornMat, 0.02, hornL * 0.45, 0.02, -0.08 - hornL * 0.35, 0.12 + hornL * 0.65, 0.09 * sd, hd);
                hTip.rotation.z = 1.05;
                hTip.rotation.x = sd * 0.42;
            }

            if (rk >= 3) {
                const hSub = mk(G.cone, hornMat, 0.022, hornL * 0.55, 0.022, 0.05, 0.11, 0.055 * sd, hd);
                hSub.rotation.z = -0.3;
                hSub.rotation.x = sd * 0.4;
            }
        });

        if (rk >= 4) {
            const hCenter = mk(G.cone, hornMat, 0.03, hornL * 0.75, 0.03, 0.08, 0.13, 0, hd);
            hCenter.rotation.z = -0.45;
        }

        // 6. Crina Celestial / Elemental (Épico e Lendário)
        if (rk >= 3) {
            const maneCols = rk >= 4 ? [primCol, '#ffd766', '#ffb020', '#ffffff'] : [primCol, EL.col, '#ffffff'];
            maneCols.forEach((colHex, i) => {
                mk(SP, M(colHex, colHex), 0.09 - i * 0.012, 0.09 - i * 0.012, 0.065, -0.07 - i * 0.045, 0.11 - i * 0.042, 0, hd);
            });
            mk(G.cone, hornMat, 0.025, 0.08, 0.025, 0.09, -0.06, 0, hd).rotation.z = Math.PI;
        }

        // 7. Espinhos Dorsais
        const spineCount = rk >= 4 ? 6 : (rk >= 3 ? 5 : (rk >= 1 ? 4 : 3));
        const spineMat = rk >= 2 ? hornMat : skinMat;
        for (let i = 0; i < spineCount; i++) {
            const spH = 0.06 + (rk >= 3 ? 0.03 : 0.01);
            const spX = 0.12 - i * (0.36 / spineCount);
            const spine = mk(G.cone, spineMat, 0.025, spH, 0.025, spX, legH + 0.28, 0);
            spine.rotation.z = 0.2;
        }

        // 8. Cauda Articulada de Dragão
        const tl = grp(-0.24, legH + 0.19, 0);
        P.tail = tl;
        for (let i = 0; i < 5; i++) {
            const segR = 0.095 - i * 0.014;
            mk(SP, skinMat, segR, segR, segR, -0.06 - i * 0.065, -i * 0.012, 0, tl);
        }
        if (rk === 0) {
            mk(G.cone, skinMat, 0.04, 0.12, 0.04, -0.4, 0, 0, tl).rotation.z = 1.57;
        } else if (rk === 1) {
            mk(G.cone, hornMat, 0.05, 0.15, 0.05, -0.42, 0, 0, tl).rotation.z = 1.57;
        } else if (rk === 2) {
            const gem = mk(G.cone, hornMat, 0.065, 0.18, 0.065, -0.42, 0, 0, tl);
            gem.rotation.z = 1.57;
            const gemBack = mk(G.cone, hornMat, 0.065, 0.08, 0.065, -0.38, 0, 0, tl);
            gemBack.rotation.z = -1.57;
        } else if (rk >= 3) {
            const fireMat = M(rk >= 4 ? '#ffd766' : EL.col, rk >= 4 ? '#ff9a00' : EL.col);
            for (let i = 0; i < 3; i++) {
                const fBlade = mk(G.cone, fireMat, 0.04, 0.16 - i * 0.03, 0.025, -0.38 - i * 0.04, (i - 1) * 0.03, 0, tl);
                fBlade.rotation.z = 1.4 + (i - 1) * 0.35;
            }
        }

        // 9. Asas de Dragão (Flapping Wings)
        const wingW = (rk >= 4 ? 0.48 : (rk >= 3 ? 0.42 : 0.36)) * (isAdult ? 1.2 : 1.0);
        const wingH = (rk >= 4 ? 0.36 : 0.30) * (isAdult ? 1.2 : 1.0);
        [-1, 1].forEach(sd => {
            const w = grp(0.04, legH + 0.28, 0.11 * sd);
            w.rotation.x = sd * 0.5;

            mk(SP, M(primCol, glowCol), 0.04, 0.04, 0.32, 0, 0, 0.16 * sd, w);
            const mem = mk(SP, wingMat, wingW, 0.015, wingH, -0.06, 0.02, 0.26 * sd, w);
            mem.rotation.y = sd * 0.1;
            mk(SP, M(hornCol, glowCol), 0.04, 0.04, 0.46, 0.01, 0.02, 0.25 * sd, w);
            mk(G.cone, hornMat, 0.02, 0.06, 0.02, 0.02, 0.04, 0.44 * sd, w).rotation.x = sd * 0.5;

            if (rk >= 4) {
                mk(SP, shineMat, 0.035, 0.035, 0.035, -0.05, 0.04, 0.48 * sd, w);
            }

            P.wings.push({ g: w, sd });
        });

        // 10. Auras Místicas no Chão
        let aura = null;
        if (rk >= 2 || isElder) {
            const aCol = glowCol || EL.col;
            aura = new T.Mesh(G.ring, new T.MeshBasicMaterial({
                color: aCol,
                transparent: true,
                opacity: 0.38,
                depthWrite: false,
                blending: T.AdditiveBlending,
                side: T.DoubleSide
            }));
            aura.position.y = 0.02;
            aura.scale.setScalar(0.46 + rk * 0.08);
            root.add(aura);

            if (rk >= 3) {
                const innerRing = new T.Mesh(new T.RingGeometry(0.2, 0.28, 24), new T.MeshBasicMaterial({
                    color: aCol,
                    transparent: true,
                    opacity: 0.55,
                    depthWrite: false,
                    blending: T.AdditiveBlending,
                    side: T.DoubleSide
                }));
                innerRing.rotation.x = -Math.PI / 2;
                innerRing.position.y = 0.025;
                innerRing.scale.setScalar(0.52 + rk * 0.08);
                root.add(innerRing);
            }
        }

        // 11. Motes Orbitais
        const orbs = [];
        if (rk >= 4) {
            for (let i = 0; i < 3; i++) {
                const orbM = new T.Mesh(SP, new T.MeshBasicMaterial({
                    color: i % 2 ? '#ffd766' : '#ffffff',
                    transparent: true,
                    opacity: 0.85
                }));
                orbM.scale.setScalar(0.04);
                root.add(orbM);
                orbs.push(orbM);
            }
        }

        // 12. Coroa Dourada Flutuante (Ancião Nv 10+)
        if (isElder) {
            const crownGrp = new T.Group();
            crownGrp.position.set(0.08, 0.98, 0);
            const crRing = new T.Mesh(new T.TorusGeometry(0.18, 0.025, 8, 24), new T.MeshBasicMaterial({
                color: '#ffd35c',
                transparent: true,
                opacity: 0.95,
                side: T.DoubleSide
            }));
            crRing.rotation.x = Math.PI / 2;
            crownGrp.add(crRing);
            for (let i = 0; i < 5; i++) {
                const a = (i / 5) * Math.PI * 2;
                const tip = new T.Mesh(G.cone, new T.MeshBasicMaterial({ color: '#ffea7a' }));
                tip.scale.set(0.025, 0.07, 0.025);
                tip.position.set(Math.cos(a) * 0.18, 0.035, Math.sin(a) * 0.18);
                crownGrp.add(tip);
            }
            root.add(crownGrp);
            P.crown = crownGrp;
        }

        const shadow = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshBasicMaterial({
            map: zSoftTex(),
            color: 0x000000,
            transparent: true,
            opacity: 0.35,
            depthWrite: false
        }));
        shadow.rotation.x = -Math.PI / 2;
        shadow.renderOrder = 2;
        root.add(shadow);

        root.scale.setScalar(c.sz * 1.15 * lvScale);
        body.userData.base = body.position.y;

        const Bd = {
            g: root,
            body,
            P,
            aura,
            orbs,
            sp,
            shadow,
            sz: ((sp.cl && sp.cl.sz) || 1.0) * 1.6 * lvScale,
            span: ((sp.cl && sp.cl.sz) || 1.0) * 3.2 * lvScale,
            crownY: 0.98,
            footG: 0.28,
            dragon: true,
            canWalk: true,
            fts: 1.0,
            pit0: 0,
            model: false
        };
        return Bd;
    }

    function zBuild(sp, hi, al) {
        al = al || 1;
        // Dragões estilizados procedurais em Three.js (mesma natureza do lendário roxo, com evolução por raridade e nível)
        { const M = zBuildModel(sp, hi, al); if (M) return M; }   /* os outros: modelos 3D reais */
        if (sp.dr || sp.base) return zBuildCodeDragon(sp, hi, al);   /* enquanto o modelo ainda carrega */
        const T = clTh(), G = zG(), c = sp.cl, root = new T.Group(), body = new T.Group(), P = { head: null, legs: [], wings: [], tail: null, neck: null }, SP = hi ? G.sp : G.sl;
        root.add(body); const em = c.emi || null;
        const mk = (geo, mat, sx, sy, sz, x, y, z, par) => { const m = new T.Mesh(geo, mat); m.scale.set(sx, sy, sz); m.position.set(x, y, z); (par || body).add(m); return m; };
        const grp = (x, y, z, par) => { const g = new T.Group(); g.position.set(x, y, z); (par || body).add(g); return g; };
        const M = (hex, e) => zMat(hex, e), skin = M(c.c, em), skin2 = M(c.c2), eye = M('#10131a'), shine = M('#ffffff');
        const eyes = (par, x, y, z, r) => { [-1, 1].forEach(sd => { mk(SP, eye, r * 1.5, r * 1.7, r * 1.1, x, y, z * sd, par); mk(SP, shine, r * 0.7, r * 0.7, r * 0.6, x + r * 0.45, y + r * 0.55, z * sd * 1.08, par); if (c.cheek) mk(SP, M(c.cheek), r * 1.6, r * 1.1, r * 0.6, x - r * 0.1, y - r * 1.6, z * sd * 1.45, par); }); };
        if (sp.k === 'q') {
            const legH = c.sz > 1.2 ? 0.17 : 0.15, bH = 0.24, bL = 0.46;
            if (c.wool) { for (let i = 0; i < (hi ? 16 : 9); i++) { const a = i / (hi ? 16 : 9) * Math.PI * 2, x = Math.cos(a) * 0.14, z = Math.sin(a) * 0.1; mk(SP, M(c.c, em), 0.2, 0.2, 0.2, x, legH + 0.14 + Math.sin(i * 1.7) * 0.03, z); } mk(SP, M(c.c, em), 0.42, 0.28, 0.3, 0, legH + 0.14, 0); mk(SP, M(c.c, em), 0.3, 0.2, 0.24, 0.02, legH + 0.27, 0); }
            else mk(SP, skin, bL, bH, 0.26, 0, legH + 0.13, 0);
            if (!c.wool) { mk(SP, skin, 0.22, 0.24, 0.24, 0.13, legH + 0.14, 0); mk(SP, skin, 0.24, 0.26, 0.26, -0.13, legH + 0.14, 0); }
            if (c.spots) { [[-0.08, 0.1, 0.1], [0.06, 0.15, -0.11], [-0.16, 0.12, -0.08], [0.14, 0.18, 0.08]].forEach(p => mk(SP, M(c.spots), 0.1, 0.07, 0.07, p[0], legH + p[1] + 0.06, p[2])); }
            [[0.14, 0.08], [0.14, -0.08], [-0.14, 0.08], [-0.14, -0.08]].forEach(p => { const lg = grp(p[0], legH, p[1]); mk(G.leg, M(c.leg), 0.055, legH, 0.055, 0, 0, 0, lg); mk(SP, M('#2a2420'), 0.065, 0.04, 0.07, 0.01, -legH, 0, lg); P.legs.push({ g: lg, ph: P.legs.length % 3 === 0 || P.legs.length === 3 ? 0 : Math.PI }); });
            const nk = grp(0.2, legH + 0.2, 0); nk.rotation.z = -0.55; mk(SP, skin, 0.14, 0.26, 0.14, 0, 0.1, 0, nk); P.neck = nk;
            const hd = grp(0.27, legH + 0.34, 0); P.head = hd; const hs = c.small ? 0.85 : 1;
            mk(SP, skin, 0.2 * hs, 0.17 * hs, 0.16 * hs, 0, 0, 0, hd); const sn = mk(SP, M(c.c2), 0.12, 0.09, 0.11, 0.11, -0.04, 0, hd); mk(SP, M('#3a2030'), 0.03, 0.025, 0.04, 0.17, -0.02, 0, hd);
            eyes(hd, 0.07, 0.035, 0.07, 0.03);
            if (c.lear) { [-1, 1].forEach(sd => { const e = mk(SP, skin, 0.05, 0.22, 0.04, -0.02, 0.17, 0.04 * sd, hd); e.rotation.x = sd * 0.25; e.rotation.z = -0.15; mk(SP, M('#f0b0b0'), 0.025, 0.15, 0.015, -0.015, 0.17, 0.045 * sd, hd).rotation.x = sd * 0.25; }); }
            else { [-1, 1].forEach(sd => { const e = mk(SP, c.wool ? M(c.c2) : skin, 0.09, 0.04, 0.06, -0.03, 0.02, 0.1 * sd, hd); e.rotation.x = sd * 0.4; if (c.flop) { e.scale.set(0.11, 0.05, 0.08); e.rotation.z = -0.3; } }); }
            if (c.horn) { [-1, 1].forEach(sd => { const h = mk(G.cone, M(c.horn), c.hornBack ? 0.03 : 0.025, c.hornBack ? 0.18 : 0.1, 0.03, -0.02, 0.1, 0.06 * sd, hd); h.rotation.z = c.hornBack ? 0.6 : 0.1; h.rotation.x = sd * 0.35; if (c.curl) { const h2 = mk(SP, M(c.horn), 0.07, 0.07, 0.04, -0.05, 0.08, 0.1 * sd, hd); } }); }
            if (c.antler) { [-1, 1].forEach(sd => { const a = grp(-0.01, 0.1, 0.05 * sd, hd); a.rotation.x = sd * 0.35; const m = M(c.antler, c.antler); mk(G.cone, m, 0.025, 0.28, 0.025, 0, 0, 0, a); [0.07, 0.15, 0.22].forEach((y, i) => { const b = mk(G.cone, m, 0.02, 0.12, 0.02, 0.02, y, 0.01 * sd, a); b.rotation.z = -0.8; }); }); }
            if (c.uhorn) { const h = mk(G.cone, M(c.uhorn, c.uhorn), 0.035, 0.22, 0.035, 0.05, 0.1, 0, hd); h.rotation.z = -0.5; }
            if (c.dhorn) { [-1, 1].forEach(sd => { const h = mk(G.cone, M(c.dhorn), 0.03, 0.14, 0.03, -0.03, 0.09, 0.05 * sd, hd); h.rotation.z = 0.5; h.rotation.x = sd * 0.3; }); }
            if (c.beard) mk(G.cone, skin2, 0.025, 0.07, 0.025, 0.08, -0.05, 0, hd).rotation.z = Math.PI;
            if (c.mane) { c.mane.forEach((col, i) => { const m = mk(SP, M(col, col), 0.1, 0.1, 0.07, -0.08 - i * 0.07, 0.1 - i * 0.06, 0, nk === null ? hd : hd); m.position.set(-0.07 - i * 0.045, 0.09 - i * 0.045, 0); }); }
            const tl = grp(-0.24, legH + 0.2, 0); P.tail = tl;
            if (c.tailn) { for (let i = 0; i < 5; i++) mk(SP, skin, 0.1 - i * 0.015, 0.09 - i * 0.012, 0.09 - i * 0.012, -0.07 - i * 0.07, -i * 0.012, 0, tl); mk(G.cone, M(c.spikes, c.spikes), 0.03, 0.07, 0.03, -0.38, 0.02, 0, tl).rotation.z = 1.5; }
            else if (c.puff) mk(SP, M(c.c2), 0.1, 0.1, 0.1, -0.03, 0.03, 0, tl); else if (c.mane) { c.mane.forEach((col, i) => mk(SP, M(col, col), 0.08, 0.07, 0.07, -0.05 - i * 0.07, -0.02 - i * 0.04, 0, tl)); } else mk(G.cone, skin2, 0.04, 0.12, 0.04, -0.03, -0.03, 0, tl).rotation.z = 2.3;
            if (c.wings) { [-1, 1].forEach(sd => { const w = grp(0, legH + 0.3, 0.1 * sd); w.rotation.x = sd * 0.5; mk(SP, M('#5a2ad0', em), 0.04, 0.04, 0.3, 0, 0, 0.15 * sd, w); mk(SP, M(c.wing || c.c2, c.wing), 0.34, 0.014, 0.46, -0.06, 0, 0.3 * sd, w); mk(SP, M('#5a2ad0', em), 0.05, 0.05, 0.5, 0.0, 0.01, 0.28 * sd, w); P.wings.push({ g: w, sd }); }); }
            if (c.spikes) for (let i = 0; i < 4; i++) mk(G.cone, M(c.spikes, c.spikes), 0.03, 0.06, 0.03, 0.1 - i * 0.1, legH + 0.29, 0);
            if (c.eye) { eyes(hd, 0.06, 0.04, 0.05, 0.02); }
        } else {
            const legH = 0.1, neckL = c.neck === 1 ? 0.3 : c.neck ? 0.14 : 0.05;
            const bd = grp(0, legH + 0.14, 0); bd.rotation.z = c.flat || c.neck === 1 ? 0.05 : 0.22; mk(SP, skin, 0.34, 0.24, 0.24, 0, 0, 0, bd); mk(SP, c.fan || c.flame ? M(c.c2, c.c2) : skin2, 0.2, 0.15, 0.2, 0.06, -0.04, 0, bd);
            [-1, 1].forEach(sd => { const w = grp(0.0, 0.03, 0.12 * sd, bd); mk(SP, c.wing ? M(c.wing, c.flame ? '#ff3a00' : null) : skin, 0.26, 0.06, 0.15, -0.02, -0.02, 0.04 * sd, w); w.rotation.x = sd * 0.08; if (c.flame) { mk(SP, M('#ff4a00', '#ff2a00'), 0.2, 0.03, 0.18, -0.08, -0.03, 0.12 * sd, w); } P.wings.push({ g: w, sd }); });
            [-1, 1].forEach(sd => { const lg = grp(0.0, legH, 0.06 * sd); mk(G.leg, M(c.leg), 0.03, legH, 0.03, 0, 0, 0, lg); mk(SP, M(c.leg), 0.09, 0.025, 0.06, 0.03, -legH, 0, lg); P.legs.push({ g: lg, ph: sd > 0 ? 0 : Math.PI }); });
            const nk = grp(0.16, legH + 0.24, 0); P.neck = nk; let ny = 0; const seg = c.neck === 1 ? 4 : 2;
            for (let i = 0; i < seg; i++) { const t = i / seg; mk(SP, c.fan ? M(c.c2, c.c2) : skin, 0.07, 0.07 + neckL / seg, 0.07, 0.01 + t * 0.03, ny, 0, nk); ny += neckL / seg; }
            const hd = grp(0.04, ny + 0.04, 0, nk); P.head = hd; mk(SP, c.fan ? M(c.c2, c.c2) : skin, 0.16, 0.15, 0.14, 0, 0, 0, hd);
            if (c.flat) { mk(SP, M(c.beak), 0.13, 0.025, 0.07, 0.09, -0.01, 0, hd); } else { mk(G.cone, M(c.beak), 0.04, 0.09, 0.04, 0.07, -0.005, 0, hd).rotation.z = -1.5; }
            eyes(hd, 0.05, 0.025, 0.065, 0.028);
            if (c.comb) { [0, 1, 2].forEach(i => mk(SP, M(c.c2), 0.04, 0.05, 0.025, -0.01 + i * 0.03, 0.06, 0, hd)); mk(SP, M(c.c2), 0.025, 0.05, 0.02, 0.07, -0.06, 0, hd); }
            if (c.crest) { for (let i = 0; i < 4; i++) { const f = mk(G.cone, M(c.fan || '#ffd35c', c.fan || '#ff9a00'), 0.012, 0.09, 0.012, -0.02 + i * 0.012, 0.08, (i - 1.5) * 0.02, hd); f.rotation.x = (i - 1.5) * 0.25; } }
            const tl = grp(-0.17, 0.02, 0, bd); P.tail = tl;
            if (c.fan) { for (let i = 0; i < 9; i++) { const a = (i - 4) / 4 * 0.85, f = grp(0, 0, 0, tl); f.rotation.z = 0.5; f.rotation.x = a; const feather = mk(SP, M(i % 2 ? '#14d6a0' : '#12b8e0', '#0a4a40'), 0.035, 0.32, 0.08, 0, 0.18, 0, f); const dot = mk(SP, M(c.fan, c.fan), 0.05, 0.06, 0.03, 0, 0.33, 0, f); mk(SP, M('#1a3fff', '#0a1a80'), 0.032, 0.036, 0.024, 0, 0.33, 0.016, f); } }
            else if (c.flame) { for (let i = 0; i < 6; i++) { const a = (i - 2.5) * 0.2, f = grp(0, 0, 0, tl); f.rotation.z = 1.2 + Math.abs(a) * 0.3; f.rotation.x = a; mk(G.cone, M(i % 2 ? '#ffd35c' : '#ff5a1a', i % 2 ? '#ff9a00' : '#ff3a00'), 0.045, 0.34 - Math.abs(a) * 0.1, 0.03, 0, 0, 0, f); } }
            else { for (let i = 0; i < 3; i++) { const f = mk(SP, skin, 0.1, 0.05, 0.05, -0.03, 0.02 + i * 0.015, (i - 1) * 0.03, tl); f.rotation.z = 0.4 + i * 0.1; } }
        }
        root.scale.setScalar(c.sz * 1.1); body.userData.base = body.position.y;
        let aura = null; const gl = c.glow || (al >= 7 ? ZEL[sp.el].col : null); if ((sp.rk >= 2 || al >= 7) && gl) { aura = new T.Mesh(G.ring, new T.MeshBasicMaterial({ color: gl, transparent: true, opacity: 0.4, depthWrite: false, blending: T.AdditiveBlending })); aura.position.y = 0.02; aura.scale.setScalar(0.42 + sp.rk * 0.06); root.add(aura); }
        if (al >= 10) { const cr = new T.Mesh(G.ring, new T.MeshBasicMaterial({ color: '#ffd35c', transparent: true, opacity: 0.95, depthWrite: false, side: T.DoubleSide })); cr.rotation.x = Math.PI / 2; cr.scale.setScalar(0.3); cr.position.set(0.08, 0.95, 0); root.add(cr); P.crown = cr; }
        return { g: root, body, P, aura, sp, sz: c.sz * 1.1 };
    }
    /* ninho de verdade: coroa de troncos com musgo, pedras, flores e cogumelos (modelos Quaternius, CC0) */
    const ZNEST = ['Flower_1', 'Flower_2', 'Flower_3', 'Flower_4', 'Flowers', 'Mushroom_1', 'Mushroom_2', 'Bush_1', 'Rock_Moss_1', 'Rock_Moss_2', 'WoodLog_Moss'].map(n => 'zoo/nest/' + n + '.glb');
    function zNestPiece(par, name, size, x, y, z, yaw) {
        const T = clTh(), tpl = CLM.tpl['zoo/nest/' + name + '.glb']; if (!tpl || !tpl.gl) return; const m = tpl.gl.scene.clone(true); ZOO.nmat = ZOO.nmat || {};
        const fix = mt => { if (!ZOO.nmat[mt.uuid]) { const c = mt.clone(); if (c.emissive && c.color) c.emissive.copy(c.color).multiplyScalar(0.28); ZOO.nmat[mt.uuid] = c; } return ZOO.nmat[mt.uuid]; };
        m.traverse(o => { if (!o.isMesh) return; o.receiveShadow = true; o.material = Array.isArray(o.material) ? o.material.map(fix) : fix(o.material); });
        const pv = new T.Group(); pv.add(m); pv.updateMatrixWorld(true); let bb = new T.Box3().setFromObject(pv); const sz = bb.getSize(new T.Vector3()); pv.scale.setScalar(size / Math.max(sz.x, sz.y, sz.z, 1e-6)); if (ys) pv.scale.y *= ys; pv.updateMatrixWorld(true); bb = new T.Box3().setFromObject(pv); const ct = bb.getCenter(new T.Vector3()); pv.position.set(-ct.x, -bb.min.y, -ct.z);
        const h = new T.Group(); h.add(pv); h.position.set(x, y, z); h.rotation.y = yaw; par.add(h);
    }
    function zNestWreath(W, k) {
        const R = 0.19, rn = i => Math.abs(Math.sin(i * 12.9898 + k * 78.233));
        for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283 + k, r = 0.185 + rn(i) * 0.02; zNestPiece(W, 'WoodLog_Moss', 0.19, Math.cos(a) * r, 0, Math.sin(a) * r, -a + 1.5708 + (rn(i + 3) - 0.5) * 0.3); }
        for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283 + 0.4 + k, r = 0.205; zNestPiece(W, i % 2 ? 'Rock_Moss_1' : 'Rock_Moss_2', 0.085 + rn(i + 9) * 0.04, Math.cos(a) * r, 0, Math.sin(a) * r, rn(i) * 6); }
        const fl = ['Flower_1', 'Flower_2', 'Flower_3', 'Flower_4', 'Flowers']; for (let i = 0; i < 11; i++) { const a = i / 11 * 6.283 + 0.2 + k * 0.7, r = 0.2 + (rn(i + 5) - 0.5) * 0.05; zNestPiece(W, fl[(i + k) % 5], 0.09 + rn(i + 1) * 0.05, Math.cos(a) * r, 0.03, Math.sin(a) * r, rn(i + 7) * 6); }
        for (let i = 0; i < 3; i++) { const a = i * 2.1 + 1 + k, r = 0.225; zNestPiece(W, i % 2 ? 'Mushroom_1' : 'Mushroom_2', 0.06 + rn(i) * 0.02, Math.cos(a) * r, 0, Math.sin(a) * r, rn(i + 2) * 6); }
        for (let i = 0; i < 2; i++) { const a = k * 2 + i * 3.14 + 0.7, r = 0.25; zNestPiece(W, 'Bush_1', 0.13, Math.cos(a) * r, 0, Math.sin(a) * r, rn(i) * 6); }
    }
    /* incubadora grande no telhado do celeiro: base de latão, cúpula de vidro, ninho de musgo e flores, luzes quentes, painel e vapor */
    function zIncubator(grp, level) {
        const T = clTh(), G = zG(), rf0 = (grp.userData && grp.userData.roof) || { x: -1.4, y: 1.1 }, n = ZEGGS[Math.max(0, Math.min(4, level - 1))], rf = { x: rf0.x, y: rf0.y, n }; grp.userData.roof = rf;
        { rf.model = true; rf.px = rf.x; rf.pz = rf0.pz != null ? rf0.pz : 0; rf.py = rf.y + 1.0; return; }   /* sem estátua: os ovos flutuam e giram sobre a casa (celeiro) */
        const inc = { steam: [], leds: [], bulbs: [] }; grp.userData.inc = inc;
        if (zModelOk('zoo/incubator.glb')) { try {   /* estátua-mão de pedra e musgo (HUMANITY LAST HOPE, odaymat, CC-BY 4.0): os ovos flutuam sobre a palma */
            const tpl = CLM.tpl['zoo/incubator.glb'], m = tpl.gl.scene.clone(true), rm = []; m.traverse(o => { if (/^(aiSkyDomeLight1|back)$/.test(o.name)) rm.push(o); }); rm.forEach(o => o.parent && o.parent.remove(o));
            m.traverse(o => { if (!o.isMesh) return; o.castShadow = true; o.receiveShadow = true; o.frustumCulled = false; const f = mt => { const c = mt.clone(); if (c.emissive && c.color) c.emissive.copy(c.color).multiplyScalar(0.04); if (c.color) { if (mt.name === 'hand') c.color.setRGB(1.5, 1.38, 1.15); else if (mt.name === 'cover') c.color.setRGB(1.0, 1.45, 0.75); else if (mt.name === 'plant') c.color.setRGB(0.9, 1.5, 0.7); } if (c.clearcoat !== undefined) c.clearcoat = 0; if (c.specularIntensity !== undefined) c.specularIntensity = 0.3; if (c.roughness !== undefined) c.roughness = Math.max(0.7, c.roughness); return c; }; o.material = Array.isArray(o.material) ? o.material.map(f) : f(o.material); });
            const pv = new T.Group(); pv.add(m); pv.updateMatrixWorld(true); let bb = new T.Box3().setFromObject(pv); const sz = bb.getSize(new T.Vector3()), L = Math.max(sz.x, sz.y, sz.z), k = 2.5 / L; pv.scale.setScalar(k); pv.updateMatrixWorld(true); bb = new T.Box3().setFromObject(pv); const ct = bb.getCenter(new T.Vector3()); pv.position.set(-ct.x, -bb.min.y, -ct.z); pv.updateMatrixWorld(true);
            const CX = 1.15, CZ = 0.05, R = new T.Group(); R.position.set(CX, 0.03, CZ - 0.75); R.add(pv); grp.add(R); grp.userData.obst = { x: CX, z: CZ, r: 0.56 };
            if (ZNEST.every(zModelOk)) { const fl = ['Flower_1', 'Flower_2', 'Flower_3', 'Flower_4', 'Flowers'], rn = i => Math.abs(Math.sin(i * 12.9898 + 2.7)); for (let i = 0; i < 22; i++) { const a2 = i / 22 * 6.283 + rn(i) * 0.2, r = 0.62 + rn(i + 4) * 0.14; zNestPiece(grp, fl[i % 5], 0.13 + rn(i + 1) * 0.07, CX + Math.cos(a2) * r, 0.03, CZ + Math.sin(a2) * r, rn(i + 7) * 6); } for (let i = 0; i < 5; i++) { const a2 = i * 1.26 + 0.5; zNestPiece(grp, i % 2 ? 'Bush_1' : 'Mushroom_2', i % 2 ? 0.2 : 0.11, CX + Math.cos(a2) * 0.78, 0.03, CZ + Math.sin(a2) * 0.78, rn(i) * 6); } for (let i = 0; i < 4; i++) { const a2 = i * 1.6 + 0.9; zNestPiece(grp, 'Rock_Moss_' + (1 + i % 2), 0.18, CX + Math.cos(a2) * 0.7, 0.03, CZ + Math.sin(a2) * 0.7, rn(i + 2) * 6); } }
            if (tpl.gl.animations && tpl.gl.animations.length) { const mx = new T.AnimationMixer(m); tpl.gl.animations.forEach(a => mx.clipAction(a).play()); inc.mixer = mx; }
            const hb = bb.max.y - bb.min.y, ex = new T.Vector3(); ex.set(-0.02 * 2.5, 0, -0.225 * 2.5); rf.px = CX + ex.x; rf.pz = CZ - 0.75 + ex.z; rf.py = 0.03 + hb * 0.957 + 0.42; rf.model = true;
            const gl = new T.Sprite(new T.SpriteMaterial({ map: zSoftTex(), color: '#ffe0a0', transparent: true, opacity: 0.1, depthWrite: false, blending: T.AdditiveBlending })); gl.scale.set(0.9, 0.9, 1); gl.position.set(rf.px, rf.py - 0.05, rf.pz); grp.add(gl); inc.warm = gl; return;
        } catch (er) { try { console.warn('incubadora', er); } catch (e) {} } }
        const I = new T.Group(); I.position.set(rf.x, rf.y - 0.06, 0); grp.add(I);
        const M = (c, e, m) => new T.MeshStandardMaterial({ color: c, metalness: m === undefined ? 0.35 : m, roughness: 0.4, emissive: e || c, emissiveIntensity: e ? 0.9 : 0.16 }), brass = M('#c79a46'), dark = M('#3a3f4c'), add = (g, m, x, y, z, sx, sy, sz, par) => { const o = new T.Mesh(g, m); o.scale.set(sx, sy, sz); o.position.set(x, y, z); o.castShadow = true; (par || I).add(o); return o; };
        [[-0.46, -0.72], [0.46, -0.72], [-0.46, 0.72], [0.46, 0.72]].forEach(p => add(G.box, dark, p[0], -0.1, p[1], 0.07, 0.34, 0.07));
        add(G.leg, brass, 0, 0.1, 0, 1.4, 0.14, 2.25); add(G.leg, M('#2b2f3a'), 0, 0.02, 0, 1.46, 0.05, 2.32);
        add(G.leg, M('#d9b75e'), 0, 0.125, 0, 1.2, 0.03, 2.0).material.emissiveIntensity = 0.25;
        const dome = new T.Mesh(ZOO.hemi || (ZOO.hemi = new T.SphereGeometry(0.5, 14, 7, 0, Math.PI * 2, 0, Math.PI / 2)), new T.MeshStandardMaterial({ color: '#bfe6ff', transparent: true, opacity: 0.2, roughness: 0.05, metalness: 0.1, emissive: '#6fb8ff', emissiveIntensity: 0.18, depthWrite: false, side: T.DoubleSide })); dome.scale.set(1.15, 1.05, 2.0); dome.position.y = 0.13; I.add(dome);
        const rim = new T.Mesh(new T.TorusGeometry(0.5, 0.028, 8, 36), brass); rim.rotation.x = Math.PI / 2; rim.scale.set(1.15, 2.0, 1); rim.position.y = 0.13; I.add(rim);
        [-0.62, 0, 0.62].forEach(zz => { const f = Math.sqrt(1 - Math.pow(zz / 1.0, 2)), rb = new T.Mesh(new T.TorusGeometry(0.5, 0.016, 6, 24, Math.PI), brass); rb.scale.set(1.15 * f, 1.05 * f, 1); rb.rotation.y = Math.PI / 2; rb.rotation.set(0, 0, 0); rb.position.set(0, 0.13, zz); I.add(rb); });
        const rr = new T.Mesh(new T.TorusGeometry(0.5, 0.014, 6, 24, Math.PI), brass); rr.scale.set(2.0, 1.05, 1); rr.rotation.y = Math.PI / 2; rr.position.set(0, 0.13, 0); I.add(rr);
        const beacon = add(G.sl, new T.MeshBasicMaterial({ color: '#7affc8' }), 0, 0.13 + 0.52 * 1.05 + 0.05, 0, 0.11, 0.11, 0.11); inc.beacon = beacon; add(G.leg, brass, 0, 0.13 + 0.52 * 1.05, 0, 0.06, 0.06, 0.06);
        const warm = new T.Sprite(new T.SpriteMaterial({ map: zSoftTex(), color: '#ffb050', transparent: true, opacity: 0.4, depthWrite: false, blending: T.AdditiveBlending })); warm.scale.set(1.5, 1.5, 1); warm.position.set(0, 0.35, 0); I.add(warm); inc.warm = warm;
        for (let k = 0; k < n; k++) { const zz = (k - (n - 1) / 2) * 0.42, b = add(G.sl, new T.MeshBasicMaterial({ color: '#ffe4a0' }), 0, 0.62, zz, 0.07, 0.07, 0.07); inc.bulbs.push(b); add(G.cone, dark, 0, 0.67, zz, 0.12, 0.07, 0.12).rotation.x = Math.PI; }
        add(G.box, dark, 0.7, 0.28, 0, 0.14, 0.34, 0.8); add(G.box, M('#101521', '#27d6ff'), 0.78, 0.3, 0, 0.012, 0.2, 0.62).material.emissiveIntensity = 0.5;
        for (let i = 0; i < 5; i++) { const c = ['#52ff8a', '#ffd24a', '#ff6a5a', '#52c8ff', '#ff8aff'][i], l = add(G.sl, new T.MeshBasicMaterial({ color: c }), 0.79, 0.15 + i * 0.0, -0.28 + i * 0.14, 0.05, 0.05, 0.05); l.position.y = 0.18; inc.leds.push(l); }
        [-0.6, 0.6].forEach((zz, i) => { add(G.leg, M('#8a8f9c'), -0.68, 0.45, zz * 0.9, 0.07, 0.32, 0.07); add(G.leg, brass, -0.68, 0.5, zz * 0.9, 0.1, 0.03, 0.1); for (let j = 0; j < 3; j++) { const st = new T.Sprite(new T.SpriteMaterial({ map: zSoftTex(), color: '#ffffff', transparent: true, opacity: 0, depthWrite: false })); st.position.set(-0.68, 0.5, zz * 0.9); I.add(st); inc.steam.push({ s: st, ph: j / 3 + i * 0.17, x: -0.68, z: zz * 0.9 }); } });
        if (ZNEST.every(zModelOk)) { const fl = ['Flower_1', 'Flower_2', 'Flower_3', 'Flower_4', 'Flowers'], rn = i => Math.abs(Math.sin(i * 12.9898 + 4.1));
            for (let i = 0; i < 18; i++) { const a = i / 18 * 6.283, x = Math.cos(a) * 0.5, z = Math.sin(a) * 0.93, nm = i % 3 === 0 ? 'Rock_Moss_' + (1 + i % 2) : i % 3 === 1 ? fl[(i >> 1) % 5] : 'WoodLog_Moss'; zNestPiece(I, nm, nm === 'WoodLog_Moss' ? 0.26 : nm.indexOf('Rock') === 0 ? 0.16 : 0.14, x, 0.14, z, nm === 'WoodLog_Moss' ? -Math.atan2(z / 0.93, x / 0.5) : rn(i) * 6); }
            for (let i = 0; i < 6; i++) { const a = i * 1.05 + 0.3; zNestPiece(I, i % 2 ? 'Mushroom_1' : 'Mushroom_2', 0.1, Math.cos(a) * 0.4, 0.14, Math.sin(a) * 0.78, rn(i + 3) * 6); }
            zNestPiece(I, 'Bush_1', 0.2, -0.38, 0.14, -0.78, 0.5); zNestPiece(I, 'Bush_1', 0.2, 0.36, 0.14, 0.8, 2); }
        else { for (let i = 0; i < 14; i++) { const a = i / 14 * 6.283, m = add(G.sl, M(['#4f8a34', '#6ab044', '#ffd24a', '#ff8fc0'][i % 4], null, 0), Math.cos(a) * 0.5, 0.16, Math.sin(a) * 0.93, 0.14, 0.08, 0.14); } }
    }
    const rfm = pa => !!(pa.grp.userData.roof && pa.grp.userData.roof.model);
    function zIncStep(t, any) {
        ZOO.pastures.forEach(pa => { const inc = pa.grp && pa.grp.userData && pa.grp.userData.inc; if (!inc) return; if (inc.mixer) inc.mixer.update(1 / 60); if (inc.warm) inc.warm.material.opacity = (rfm(pa) ? 0.08 : 0.32) + (rfm(pa) ? 0.03 : 0.12) * Math.sin(t * 2.2); if (inc.beacon) inc.beacon.material.color.set(any ? (Math.sin(t * 8) > 0 ? '#ffd35c' : '#ffffff') : '#7affc8');
            inc.leds.forEach((l, i) => { l.material.opacity = 1; l.visible = Math.sin(t * (2 + i * 0.7) + i) > -0.4; }); inc.bulbs.forEach((b, i) => { b.scale.setScalar(0.07 + 0.006 * Math.sin(t * 5 + i)); });
            inc.steam.forEach(o => { const u = (t * 0.28 + o.ph) % 1; o.s.position.set(o.x - u * 0.12, 0.52 + u * 0.7, o.z); o.s.scale.setScalar(0.12 + u * 0.38); o.s.material.opacity = Math.sin(u * 3.1416) * 0.32; }); });
    }
    function zEggBar() {   /* barra de tempo flutuando sobre o ovo da Árvore Incubadora */
        const T = clTh(), cv = document.createElement('canvas'); cv.width = 768; cv.height = 192; const tex = new T.CanvasTexture(cv); tex.anisotropy = 4; if (T.sRGBEncoding) tex.encoding = T.sRGBEncoding;   /* 3x mais nítida: a barra aparece grande sobre o ovo */ const spr = new T.Sprite(new T.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false })); spr.renderOrder = 50; spr.visible = false; return { spr, cv, tex, key: '' };
    }
    function zEggBarPaint(b, p, ok, txt, spId) {   /* barra Obsidian & Latão sobre o ovo da Árvore Incubadora (sem spoiler do nome!) */
        const eid = spId || 'mist', key = eid + '|' + Math.floor(p * 200) + '|' + ok + '|' + txt; if (b.key === key) return; b.key = key; const c = b.cv.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, 768, 192); c.setTransform(3, 0, 0, 3, 0, 0);
        const rr = (x, y, w, h, r) => { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); };
        const ep = ZEGG[eid] || ['#fff3c0', '#d9a52a'];
        c.save(); c.shadowColor = ok ? 'rgba(250,204,21,.9)' : 'rgba(218,174,86,.55)'; c.shadowBlur = 10; rr(5, 5, 246, 54, 24); const bg = c.createLinearGradient(0, 5, 0, 59); bg.addColorStop(0, '#1e1624'); bg.addColorStop(1, '#0b0810'); c.fillStyle = bg; c.fill(); c.restore();
        const gl = c.createLinearGradient(0, 5, 256, 59); gl.addColorStop(0, '#fff2b2'); gl.addColorStop(0.5, ok ? '#fbbf24' : '#d4a853'); gl.addColorStop(1, '#fff2b2'); rr(5, 5, 246, 54, 24); c.lineWidth = 2.4; c.strokeStyle = gl; c.stroke(); rr(9, 9, 238, 46, 20); c.lineWidth = 0.8; c.strokeStyle = 'rgba(253,230,138,.25)'; c.stroke();
        const mg = c.createRadialGradient(32, 28, 2, 34, 32, 22); mg.addColorStop(0, '#2c2034'); mg.addColorStop(1, '#110c17'); c.beginPath(); c.arc(34, 32, 20, 0, 6.2832); c.fillStyle = mg; c.fill(); c.lineWidth = 2.0; c.strokeStyle = gl; c.stroke();
        c.save(); c.translate(34, 33); c.beginPath(); c.ellipse(0, 0, 9.5, 12.5, 0, 0, 6.2832); const eg = c.createLinearGradient(-8, -12, 8, 12); eg.addColorStop(0, ep[0]); eg.addColorStop(1, ep[1] || ep[0]); c.fillStyle = eg; c.fill(); c.clip(); c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(-3.2, -4.5, 2.5, 4.5, -0.35, 0, 6.2832); c.fill(); c.restore();
        c.fillStyle = ok ? '#fde047' : '#e5d4b3'; c.font = '700 9.2px Georgia,serif'; c.textAlign = 'left'; c.textBaseline = 'alphabetic'; c.fillText(ok ? 'OVO PRONTO P/ CHOCAR' : 'INCUBANDO NA ÁRVORE', 65, 24);
        c.save(); c.shadowColor = ok ? 'rgba(251,191,36,.85)' : 'rgba(218,174,86,.55)'; c.shadowBlur = 6; c.fillStyle = '#fff9eb'; c.font = '800 20px sans-serif'; c.fillText(txt, 65, 44); c.restore();
        rr(132, 34, 110, 10, 5); c.fillStyle = 'rgba(255,255,255,.1)'; c.fill();
        if (p > 0.005) { rr(132, 34, Math.max(10, 110 * p), 10, 5); const fg = c.createLinearGradient(132, 0, 242, 0); fg.addColorStop(0, '#4ade80'); fg.addColorStop(0.55, '#a3e635'); fg.addColorStop(1, '#fbbf24'); c.fillStyle = fg; c.shadowColor = 'rgba(250,204,21,.75)'; c.shadowBlur = 5; c.fill(); c.shadowBlur = 0; }
        c.strokeStyle = 'rgba(255,255,255,.22)'; c.lineWidth = 1; for (let k = 1; k < 4; k++) { c.beginPath(); c.moveTo(132 + k * 27.5, 35); c.lineTo(132 + k * 27.5, 43); c.stroke(); }
        b.tex.needsUpdate = true;
    }
    function zBuildEgg(rk, el, id) {
        const T = clTh(), G = zG(), g = new T.Group(), ec = ZEL[el].col, sp = ZEGG[id] || ['#f1e7d4'], rare = Math.max(0, rk - 1) * 0.1;
        const mat = new T.MeshStandardMaterial({ map: zEggTex(id), roughness: 0.38, metalness: 0.0, emissive: new T.Color(sp[0]), emissiveIntensity: 0.12 + rare }); if (id === 'mist') { mat.emissiveMap = mat.map; mat.emissive.set('#ffffff'); mat.roughness = 0.28; mat.metalness = 0.35; const UU = g.userData.U = { uP: { value: 0 }, uT: { value: 0 } };   /* ovo misterioso: escamas douradas que brilham e uma luz que sobe pela casca conforme o tempo passa */
            mat.onBeforeCompile = sh => { sh.uniforms.uP = UU.uP; sh.uniforms.uT = UU.uT; sh.fragmentShader = 'uniform float uP;uniform float uT;\n' + sh.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n{float rm = pow(1.0 - clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0), 2.0);float pl = 0.55 + 0.45 * sin(uT * (2.0 + uP * 5.0));totalEmissiveRadiance *= (0.35 + uP * 1.1) * (0.8 + 0.4 * pl);totalEmissiveRadiance += vec3(1.0, 0.78, 0.32) * rm * (0.35 + uP * 1.6) * pl;}'); }; mat.customProgramCacheKey = () => 'eggmist'; }
        const egg = new T.Mesh(G.egg, mat); egg.scale.set(0.155, 0.215, 0.155); egg.position.y = 0.135; egg.castShadow = true; g.add(egg);
        const cracks = [1, 2, 3].map(lv => { const cm = new T.Mesh(G.egg, new T.MeshBasicMaterial({ map: zCrackTex(lv), transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending })); cm.scale.set(0.158 + lv * 0.0006, 0.218 + lv * 0.0006, 0.158 + lv * 0.0006); cm.position.y = 0.135; g.add(cm); return cm; });
        const halo = new T.Mesh(G.sp, new T.MeshBasicMaterial({ color: ec, transparent: true, opacity: 0.2, depthWrite: false, blending: T.AdditiveBlending })); halo.scale.set(0.6, 0.012, 0.6); halo.position.y = 0.02; g.add(halo);
        const sk = []; for (let i = 0; i < 5; i++) { const m = new T.Mesh(G.sl, new T.MeshBasicMaterial({ color: i % 2 ? '#fff2a0' : ec, transparent: true, opacity: 0.9, depthWrite: false, blending: T.AdditiveBlending })); m.scale.setScalar(0.03); m.visible = false; g.add(m); sk.push(m); }
        g.userData.egg = egg; g.userData.cracks = cracks; g.userData.halo = halo; g.userData.sk = sk; g.userData.col = ec; return g;
    }
    /* chocar: cascas voam, clarão, pilar de luz e confete */
    function zSoftTex() { const T = clTh(); if (ZOO.soft) return ZOO.soft; const cv = document.createElement('canvas'); cv.width = cv.height = 64; const c = cv.getContext('2d'), g = c.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.35, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, 64, 64); return (ZOO.soft = new T.CanvasTexture(cv)); }
    function zFxAdd(m, v, life, kind, extra) { const o = Object.assign({ m, v, life, max: life, kind }, extra || {}); (ZOO.fx = ZOO.fx || []).push(o); zRoot().add(m); return o; }
    function zHatchBurst(q, s) {
        const T = clTh(), G = zG(); const pos = q.g.position.clone(), K = Math.max(1, Math.min(8, q.g.scale.x / 1.5)), Kv = 0.55 + 0.45 * K; const hh = clZooHatch(s, true); const cineB = !!ZOO.cine; if (hh && cineB) { try { const zz0 = clZooS(s); ZOO.spawnId = zz0.an[zz0.an.length - 1].id; ZOO.spawnAt = pos.clone(); } catch (e) {} try { const NB = zBuild(zsp(hh.sp.id), true, 1), b0 = NB.g.scale.x || 1; NB.g.position.copy(pos); NB.g.scale.setScalar(0.001); NB.g.visible = false; zRoot().add(NB.g); const babyScale = Math.min(0.42, Math.max(0.26, 0.35 * (b0 || 1))); ZOO.newborn = { B: NB, t0: ZOO.tcur || 0, pos: pos.clone(), K: 1, S: babyScale, sp: hh.sp }; } catch (e) { ZOO.lastErr = 'recem-nascido ' + e; } } q.gone = true; q.g.visible = false; if (!hh) { q.hat = 0; q.gone = false; q.g.visible = true; return null; }
        const U = q.g.userData, em = U.egg.material.clone(), base = pos.y; em.side = T.DoubleSide; em.emissiveIntensity = 0.5;
        const soft = zSoftTex(); const spr = (col, sc, op) => { const m = new T.Sprite(new T.SpriteMaterial({ map: soft, color: col, transparent: true, opacity: op, depthWrite: false, blending: T.AdditiveBlending })); m.scale.setScalar(sc); return m; };
        for (let k = 0; k < 6; k++) { const top = k < 3, ph = (k % 3) * 2.0944, g = new T.SphereGeometry(0.5, 5, 4, ph, 2.0944, top ? 0 : Math.PI / 2, Math.PI / 2), m = new T.Mesh(g, em); m.scale.set(0.2325 * 2.7 * K, 0.3225 * 2.7 * K, 0.2325 * 2.7 * K); m.position.copy(pos); m.position.y += 0.34 * K; const pm = ph + 1.047, sp = top ? 1.0 : 0.55; zFxAdd(m, new T.Vector3(-Math.cos(pm) * sp * Kv * (0.6 + Math.random() * 0.5), (top ? 1.5 + Math.random() * 0.8 : 0.7 + Math.random() * 0.4) * Kv, Math.sin(pm) * sp * Kv * (0.6 + Math.random() * 0.5)), 1.5, 'shell', { w: new T.Vector3((Math.random() - 0.5) * 9, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 9), base, own: g }); }
        for (let i = 0; i < 34; i++) { const a = Math.random() * 6.283, sp = (0.5 + Math.random() * 1.1) * Kv, m = spr(i % 3 ? '#ffe9a0' : U.col, (0.05 + Math.random() * 0.05) * K, 1); m.position.copy(pos); m.position.y += 0.17 * K; zFxAdd(m, new T.Vector3(Math.cos(a) * sp, (0.9 + Math.random() * 1.4) * Kv, Math.sin(a) * sp), 1.1 + Math.random() * 0.7, 'ember', { base }); }
        for (let i = 0; i < 7; i++) { const a = i / 7 * 6.283 + Math.random(), m = spr('#c9b79a', 0.14 * K, 0.55); m.position.copy(pos); m.position.y += 0.05; zFxAdd(m, new T.Vector3(Math.cos(a) * 0.45 * Kv, 0.12, Math.sin(a) * 0.45 * Kv), 0.9, 'dust', { base, K }); }
        const fl = spr('#fff6c8', 0.3 * K, 1); fl.position.copy(pos); fl.position.y += 0.18 * K; zFxAdd(fl, new T.Vector3(), 0.55, 'flash', { K: K * 1.2 }); const fl2 = spr(U.col, 0.4 * K, 0.8); fl2.position.copy(fl.position); zFxAdd(fl2, new T.Vector3(), 0.9, 'flash', { K: K * 1.6 });
        { const rg = new T.Mesh(G.ring, new T.MeshBasicMaterial({ color: '#ffe9a0', transparent: true, opacity: 0.9, depthWrite: false, side: T.DoubleSide, blending: T.AdditiveBlending })); rg.position.copy(pos); rg.position.y = base + 0.06; zFxAdd(rg, new T.Vector3(), 0.9, 'ringx', { K }); }
        const beam = new T.Mesh(G.leg, new T.MeshBasicMaterial({ color: U.col, transparent: true, opacity: 0.32, depthWrite: false, blending: T.AdditiveBlending })); beam.scale.set(0.16 * K, 1.2 * K, 0.16 * K); beam.position.copy(pos); beam.position.y += 0.5 * K; zFxAdd(beam, new T.Vector3(), 1.0, 'beam', { K });
        for (let i = 0; i < 28; i++) { const a = Math.random() * 6.283, rad = 0.2 + Math.random() * 0.8, sp = (0.4 + Math.random() * 0.7) * Kv, m = spr(i % 2 === 0 ? '#ffd35c' : '#ffffff', 0.07 + Math.random() * 0.06, 0.9); m.position.copy(pos); m.position.y += 0.2; zFxAdd(m, new T.Vector3(Math.cos(a) * sp, 0.5 + Math.random() * 0.8, Math.sin(a) * sp), 1.8 + Math.random() * 0.6, 'ember', { base }); }
        try { aliveSound('chirp'); clFarmBuzz([18, 30, 18, 30, 40]); } catch (e) {}
        if (hh && hh.sp && typeof zShowHatchTitle === 'function') { zShowHatchTitle(hh.sp); }
        ZOO.sig = ''; setTimeout(() => { try { if (cineB) clMsg('🐉 Nasceu: ' + hh.sp.n + ' (' + ZR[hh.sp.rk].n + ')' + (hh.first ? ' · nova espécie!' : '') + (hh.c ? ' · +' + hh.c + ' cristais' : '')); else if (CL.on && CL.root) zReveal(hh); else clMsg((hh.first ? 'Nova espécie! ' : 'Nasceu: ') + hh.sp.n + ' (' + ZR[hh.sp.rk].n + ')' + (hh.c ? ' · +' + hh.c + ' cristais' : '')); clUiSel(); clUiPaint(false); const m = CL.root && CL.root.querySelector('.cl-zmod'); if (m && !m.classList.contains('reveal')) zRefresh(); } catch (e) {} }, cineB ? 700 : 650); return hh;
    }
    function zFxStep(dt) {
        const L = ZOO.fx; if (!L || !L.length) return; for (let i = L.length - 1; i >= 0; i--) { const f = L[i]; f.life -= dt; const u = 1 - Math.max(0, f.life) / f.max;
            if (f.kind === 'shell' || f.kind === 'conf') { f.v.y -= 3.2 * dt; f.m.position.addScaledVector(f.v, dt); f.m.rotation.x += f.w.x * dt; f.m.rotation.y += f.w.y * dt; f.m.rotation.z += f.w.z * dt; if (f.m.position.y < f.base + 0.02) { f.m.position.y = f.base + 0.02; f.v.set(0, 0, 0); f.w.set(0, 0, 0); } if (f.kind === 'shell' && f.life < 0.4) f.m.scale.multiplyScalar(1 - dt * 2.2); }
            else if (f.kind === 'trail') { f.m.position.addScaledVector(f.v, dt); f.m.scale.setScalar(f.s0 * (1 + u * (f.grow || 1.2))); f.m.material.opacity = f.o0 * Math.pow(1 - u, 1.4); }
            else if (f.kind === 'ember') { f.v.y -= 1.6 * dt; f.m.position.addScaledVector(f.v, dt); f.m.material.opacity = Math.max(0, 1 - u * u); if (f.m.position.y < f.base) f.m.position.y = f.base; }
            else if (f.kind === 'snow') { const tt = (ZOO.tcur || 0); f.m.position.x += Math.sin(tt * 2.2 + f.seed) * 0.32 * dt + f.v.x * dt; f.m.position.y += f.v.y * dt; f.m.position.z += Math.cos(tt * 2.2 + f.seed) * 0.32 * dt + f.v.z * dt; f.m.rotation.z += 1.8 * dt; f.m.material.opacity = Math.sin(Math.min(1, Math.max(0, u)) * 3.1415) * (f.op || 0.95); }
            else if (f.kind === 'dust') { f.m.position.addScaledVector(f.v, dt); f.v.multiplyScalar(1 - dt * 2.2); f.m.scale.setScalar((0.14 + u * 0.35) * (f.K || 1)); f.m.material.opacity = (1 - u) * 0.5; }
            else if (f.kind === 'flash') { f.m.scale.setScalar((0.3 + Math.sin(Math.min(1, u * 1.2) * 1.57) * 1.7) * (f.K || 1)); f.m.material.opacity = Math.pow(1 - u, 1.6); }
            else if (f.kind === 'beam') { const k = f.K || 1; f.m.scale.set(0.16 * k * (1 - u * 0.7), (1.2 + u * 0.9) * k * 1.6, 0.16 * k * (1 - u * 0.7)); f.m.material.opacity = Math.pow(1 - u, 1.5) * 0.4; }
            else if (f.kind === 'ringx') { const k = f.K || 1; f.m.scale.setScalar((0.5 + u * 5.5) * k); f.m.material.opacity = Math.pow(1 - u, 1.4) * 0.85; }
            if (f.life <= 0) { zDetach(f.m); L.splice(i, 1); } }
    }
    function clBichosAttach(grp, level) {   /* chamado ao montar o Covil: cerca, pasto, comedouro e registro do pasto */
        try {
            if (!clTh()) return; const T = clTh(), G = zG(), pi = grp.userData ? grp.userData.pi : undefined, live = pi !== undefined && pi !== null; level = Math.max(1, level | 0);
            if (!grp.userData.protoCovil) {
            const patch = new T.Mesh(G.box, zMat('#52d040')); patch.scale.set(2.85, 0.025, 2.94); patch.position.set(1.07, 0.012, 0); grp.add(patch);
            const dirt = new T.Mesh(G.sp, zMat('#9a7a4a')); dirt.scale.set(0.8, 0.02, 0.8); dirt.position.set(1.1, 0.026, 0.2); grp.add(dirt);
            for (let i = 0; i < 24; i++) { const a2 = i * 2.399, fx2 = 0.1 + (Math.abs(Math.sin(a2 * 3.1)) * 2.3), fz2 = -1.3 + (Math.abs(Math.cos(a2 * 2.3)) * 2.6), fc = ['#ff5ac8', '#ffe04a', '#ffffff', '#ff8a3a', '#a05aff'][i % 5]; const fw = new T.Mesh(G.sp, zMat(fc, fc)); fw.scale.setScalar(0.05); fw.position.set(fx2, 0.06, fz2); grp.add(fw); const st = new T.Mesh(G.leg, zMat('#2a9a30')); st.scale.set(0.012, 0.05, 0.012); st.position.set(fx2, 0.05, fz2); grp.add(st); }
            }
            const lair = zLairOk(); if (!lair) {
            const wood = zMat(['#a8683a', '#b8743c', '#ecdfc6', '#ecdfc6', '#f8ecc8'][Math.min(4, level - 1)]), post = (x, z) => { const p = new T.Mesh(G.box, wood); p.scale.set(0.06, 0.4, 0.06); p.position.set(x, 0.2, z); grp.add(p); };
            const rail = (x0, z0, x1, z1) => { const dx = x1 - x0, dz = z1 - z0, L = Math.hypot(dx, dz); [0.14, 0.29].forEach(y => { const r = new T.Mesh(G.box, wood); r.scale.set(L, 0.045, 0.035); r.position.set((x0 + x1) / 2, y, (z0 + z1) / 2); r.rotation.y = -Math.atan2(dz, dx); grp.add(r); }); };
            const X0 = -0.33, X1 = 2.47, Z0 = -1.46, Z1 = 1.46; rail(X0, Z0, X1, Z0); rail(X0, Z1, X1, Z1); rail(X1, Z0, X1, Z1); rail(X0, Z0, X0, -0.35); rail(X0, 0.35, X0, Z1); for (let i = 0; i <= 10; i++) { post(X0 + (X1 - X0) * i / 10, Z0); post(X0 + (X1 - X0) * i / 10, Z1); } for (let i = 1; i < 7; i++) post(X1, Z0 + (Z1 - Z0) * i / 7);
            { /* o visual muda a cada nível do Covil */
                const lv = Math.min(5, level), fl = i2 => X0 + (X1 - X0) * i2 / 10;
                if (lv >= 2) for (let i = 0; i <= 10; i++) [Z0, Z1].forEach(zz => { const cp = new T.Mesh(G.sl, zMat(lv >= 5 ? '#ffd35c' : '#d8472e', lv >= 5 ? '#aa7a00' : null)); cp.scale.setScalar(0.075); cp.position.set(fl(i), 0.42, zz); grp.add(cp); });
                if (lv >= 3) { const cols = ['#ff5a5a', '#ffd24a', '#4ea8e0', '#6fd88a', '#c27bff']; const str = new T.Mesh(G.box, zMat('#6b4a2f')); str.scale.set(X1 - X0, 0.012, 0.012); str.position.set((X0 + X1) / 2, 0.4, Z1); grp.add(str); for (let i = 0; i < 16; i++) { const fx = X0 + (X1 - X0) * (i + 0.5) / 16, fg = new T.Mesh(G.cone, zMat(cols[i % 5], cols[i % 5])); fg.scale.set(0.075, 0.1, 0.012); fg.position.set(fx, 0.34 - Math.sin(i / 16 * 3.14) * 0.01, Z1 + 0.01); fg.rotation.z = Math.PI; grp.add(fg); } }
                if (lv >= 4) for (let i = 0; i <= 10; i += 3) [Z0, Z1].forEach(zz => { const ln = new T.Mesh(G.sl, zMat('#ffe9a0', '#ffb030')); ln.scale.setScalar(0.085); ln.position.set(fl(i), 0.52, zz); grp.add(ln); const gw = new T.Mesh(G.sp, new T.MeshBasicMaterial({ color: '#ffc860', transparent: true, opacity: 0.28, depthWrite: false, blending: T.AdditiveBlending })); gw.scale.setScalar(0.3); gw.position.copy(ln.position); grp.add(gw); });
                if (lv >= 5) { const gold = zMat('#ffd35c', '#aa7a00'); [-0.4, 0.4].forEach(zz => { const pt = new T.Mesh(G.box, gold); pt.scale.set(0.07, 0.62, 0.07); pt.position.set(X0, 0.31, zz); grp.add(pt); }); const br = new T.Mesh(G.box, gold); br.scale.set(0.06, 0.06, 0.94); br.position.set(X0, 0.62, 0); grp.add(br); const st = new T.Mesh(G.sl, zMat('#fff2a0', '#ffd35c')); st.scale.setScalar(0.12); st.position.set(X0, 0.74, 0); grp.add(st);
                    for (let j = 0; j < 3; j++) { const jt = new T.Mesh(G.cone, new T.MeshBasicMaterial({ color: '#9ee6ff', transparent: true, opacity: 0.55, depthWrite: false, blending: T.AdditiveBlending })); jt.scale.set(0.05, 0.22 - j * 0.04, 0.05); jt.position.set(2.05 + (j - 1) * 0.07, 0.19 + j * 0.01, 1.15); grp.add(jt); }
                    for (let j = 0; j < 10; j++) { const a2 = j * 2.4, ff = new T.Mesh(G.sl, new T.MeshBasicMaterial({ color: '#f4ff7a', transparent: true, opacity: 0.9, depthWrite: false, blending: T.AdditiveBlending })); ff.scale.setScalar(0.03); ff.position.set(0.2 + Math.abs(Math.sin(a2 * 1.7)) * 1.5, 0.15 + (j % 4) * 0.1, -0.8 + Math.abs(Math.cos(a2 * 1.3)) * 1.9); grp.add(ff); } }
            }
            const trough = new T.Mesh(G.box, zMat('#6b4a2f')); trough.scale.set(0.34, 0.1, 0.12); trough.position.set(0.8, 0.06, -1.25); grp.add(trough); const feed = new T.Mesh(G.box, zMat('#e0b94a')); feed.scale.set(0.3, 0.03, 0.08); feed.position.set(0.8, 0.115, -1.25); grp.add(feed);
            if (level >= 3) { const bath = new T.Mesh(G.leg, zMat('#7a7a82')); bath.scale.set(0.34, 0.07, 0.34); bath.position.set(2.05, 0.07, 1.15); grp.add(bath); const wt = new T.Mesh(G.leg, zMat('#4ea8e0')); wt.scale.set(0.3, 0.012, 0.3); wt.position.set(2.05, 0.072, 1.15); grp.add(wt); }
            if (level >= 5) { const lamp = new T.Mesh(G.box, zMat('#ffd35c', '#aa7a00')); lamp.scale.set(0.05, 0.05, 0.05); lamp.position.set(X1, 0.45, 0); grp.add(lamp); }
            }
            zIncubator(grp, level);
            if (live) ZOO.pastures.push({ grp, pi, lv: level });
        } catch (err) { try { console.warn('curral', err); } catch (e) {} }
    }
    const zBounds = { x0: 0.0, x1: 2.3, z0: -1.1, z1: 1.25 };
    function zScreen(e) { try { const pv = ZOO.pv || (ZOO.pv = new (clTh().Vector3)()); pv.set(0, 0.28 * e.sz, 0); e.g.localToWorld(pv); pv.project(CL3.cam); return [(pv.x + 1) / 2 * CL3.w, (1 - pv.y) / 2 * CL3.h]; } catch (er) { return null; } }
    /* o grupo do Covil só conta se estiver MESMO na cena (um grupo antigo, de uma montagem anterior, ainda tem "pai" mas não é desenhado: os bichos ficavam presos nele e sumiam) */
    function zRoot() { if (!ZOO.root || !zIn(ZOO.root)) { ZOO.root = new (clTh().Group)(); CL3.sc.add(ZOO.root); } return ZOO.root; }
    const zDetach = o => { try { if (o && o.parent) o.parent.remove(o); } catch (e) {} };
    const zIn = o => { let u = o; while (u) { if (u === CL3.sc) return true; u = u.parent; } return false; };
    function zPastureFor(pi) {
        for (let i = ZOO.pastures.length - 1; i >= 0; i--) { const p = ZOO.pastures[i]; if (p.pi === pi && zIn(p.grp)) return p; }
        try { const pm = CL3.pmap && CL3.pmap[pi], g = pm && pm.grps && pm.grps.map(x => x.g).reverse().find(q => q && zIn(q) && q.userData && (q.userData.id === 'curral' || q.userData.id === 'incubadora')); if (g) { const p = { grp: g, pi, lv: 1, rescue: 1 }; ZOO.pastures.push(p); return p; } } catch (e) {}
        return null;
    }
    function zSync(s, lay) {   /* cria e remove os modelos conforme o rebanho */
        const z = s.zoo, lod = farmLod(), want = []; if (!z) return; lay.cur.forEach(cu => { let pa = zPastureFor(cu.pi); if (!pa) { try { const pm = CL3.pmap && CL3.pmap[cu.pi], g = pm && pm.grps && pm.grps.map(x => x.g).find(q => q && zIn(q) && q.userData && q.userData.id === 'curral'); if (g) { pa = { grp: g, pi: cu.pi, lv: cu.L, rescue: 1 }; ZOO.pastures.push(pa); } } catch (er) {} } if (!pa) return; z.an.slice(cu.off, cu.off + cu.n).forEach(a => want.push({ a, pa })); });
        if (lay.cur.length) { const last = lay.cur[lay.cur.length - 1], pa2 = zPastureFor(last.pi); if (pa2) z.an.slice(lay.slots).forEach(a => want.push({ a, pa: pa2 })); }   /* se há mais bichos que vagas (Covil rebaixado ou restaurado), eles não somem */
        const sig = want.map(w => w.a.id + w.a.sp + (zAdult(w.a) ? 'A' : 'b') + zAL(w.a) + w.pa.pi + (zHasModel(w.a.sp, lod.hi) ? 'M' : 'p')).join(',') + '|' + z.eggs.map(e => e.sp + (e.el >= e.tot ? 'r' : 'i')).join(',');
        if (sig === ZOO.sig) return;
        ZOO.list = ZOO.list.filter(e => { if (want.some(w => w.a.id === e.id)) return true; zDetach(e.g); return false; });
        want.forEach(w => { let e = ZOO.list.find(q => q.id === w.a.id); const baby = !zAdult(w.a);
            let oldWp = null, oldM = null, oldT = null, oldOrbit = null, oldFace = null;
            if (e && (e.a?.sp !== w.a.sp || e.baby !== baby || e.pi !== w.pa.pi || e.alv !== zAL(w.a) || (!e.B.model && zHasModel(w.a.sp, lod.hi)))) {
                if (e.wp) oldWp = e.wp.clone();
                else if (e.g) oldWp = e.g.position.clone();
                oldM = e.m; oldT = e.t; oldOrbit = e.orbit; oldFace = e.face;
                zDetach(e.g); ZOO.list = ZOO.list.filter(q => q !== e); e = null;
            }
            if (!e) {
                let spawned = false; if (!oldWp && ZOO.spawnAt && ZOO.spawnId === w.a.id) { oldWp = ZOO.spawnAt.clone(); ZOO.spawnAt = null; ZOO.spawnId = null; spawned = true; }
                let B = null; try { B = zBuild(zsp(w.a.sp), lod.hi, zAL(w.a)); } catch (er) { ZOO.lastErr = String(er && er.message || er); try { B = zBuild(zsp(w.a.sp), false, 1); } catch (er2) { return; } }
                const sp = zsp(w.a.sp); B.g.scale.multiplyScalar((baby ? 0.55 : 1) * (1 + 0.055 * (zAL(w.a) - 1)));
                if (baby && B.P.head) B.P.head.scale.setScalar(1.3);
                const x = zBounds.x0 + Math.random() * (zBounds.x1 - zBounds.x0), zz = zBounds.z0 + Math.random() * (zBounds.z1 - zBounds.z0);
                if (oldWp) { B.g.position.copy(oldWp); } else { B.g.position.set(0, -50, 0); }
                zRoot().add(B.g);
                e = {
                    id: w.a.id, a: w.a, pa: w.pa, pi: w.pa.pi, s0: B.g.scale.x, baby, alv: zAL(w.a), g: B.g, B,
                    sz: B.sz * (baby ? 0.55 : 1),
                    x: oldWp ? oldWp.x : x, z: oldWp ? oldWp.z : zz,
                    tx: oldWp ? oldWp.x : x, tz: oldWp ? oldWp.z : zz,
                    st: 'idle', m: oldM || 'fly', orbit: oldOrbit,
                    t: oldT != null ? oldT : Math.random() * 2,
                    ph: Math.random() * 6,
                    face: oldFace != null ? oldFace : Math.random() * 6,
                    spd: 0.12 + Math.random() * 0.05,
                    homeWant: !oldWp
                };
                if (oldWp) { e.wp = oldWp.clone(); e.first = false; }
                if (spawned) { e.spawnT = ZOO.tcur || 0; e.m = 'fly'; e.wp.y = Math.max(e.wp.y, 2.2); }
                ZOO.list.push(e);
            }
            e.a = w.a;
        });
        try { const prevE = ZOO.eggs; ZOO.eggs.forEach(e => { zDetach(e.g); if (e.bar) zDetach(e.bar.spr); }); ZOO.eggs = []; const used = {}; z.eggs.forEach(eg => { const ip = (s.pcs || []).findIndex(p0 => p0[0] === 'incubadora'); let pi0 = ip, pa = ip >= 0 ? zPastureFor(ip) : null; if (!pa && ip >= 0) { ZOO.sig = ''; return; } if (!pa) { const cu = lay.cur[0]; pi0 = cu && cu.pi; pa = cu && zPastureFor(cu.pi); } if (!pa) return; const spE = zsp(eg.sp) || ZSP[0], k = used[pi0] = (used[pi0] || 0) + 1, g = zBuildEgg(spE.rk, spE.el, spE.id), bar = zEggBar(); g.position.set(0, -50, 0); zRoot().add(g); zRoot().add(bar.spr); ZOO.eggs.push({ g, bar, pa, pi: pi0, k, eg, ph: Math.random() * 6, born: (eg.ln && Date.now() - eg.ln < 6000) ? (ZOO.tcur || 0) + 0.65 : 0, hat: (prevE.find(o => o.eg === eg) || {}).hat || 0 }); }); } catch (er) { ZOO.lastErr = String(er && er.message || er); }
        ZOO.sig = sig;
    }
    /* ---------- dragões: sobrevoam a colônia em círculos e, os que sabem andar, pousam no pasto, caminham e voltam a voar ---------- */
    function zColony(s, pa, t) {
        if (ZOO.cc && t - ZOO.cct < 3 && ZOO.ccn === (s.pcs || []).length) return ZOO.cc; const T = clTh(), wp = new T.Vector3(), pc = (s.pcs || [])[pa.pi] || [0, 0, 0]; pa.grp.getWorldPosition(wp); let sx = 0, sz = 0, n = 0, x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
        (s.pcs || []).forEach(q => { sx += q[1]; sz += q[2]; n++; x0 = Math.min(x0, q[1]); x1 = Math.max(x1, q[1]); z0 = Math.min(z0, q[2]); z1 = Math.max(z1, q[2]); });
        const ox = wp.x - pc[1], oz = wp.z - pc[2]; ZOO.cc = { cx: (n ? sx / n : pc[1]) + ox, cz: (n ? sz / n : pc[2]) + oz, rx: Math.max(8, Math.min(18, (x1 - x0) * 0.6 + 4)), rz: Math.max(8, Math.min(18, (z1 - z0) * 0.6 + 4)), ox: ox, oz: oz, H: Math.max(6, +s.H || 12) }; ZOO.cct = t; ZOO.ccn = (s.pcs || []).length; return ZOO.cc;
    }
    function zDragonAct(B, want, ts) {
        const A = B.act; if (!A || !want) return; if (A.cur !== want) { want.reset().fadeIn(0.4).play(); if (A.cur) A.cur.fadeOut(0.4); A.cur = want; } want.timeScale = ts;
    }
    /* efeitos dos dragões (imagens do Kenney Particle Pack, CC0): rastro por elemento e sopro de fogo */
    const ZFX = {
        musgo: { t: 'magic_01', c: '#9dff7a', r: 1.2, z: 0.16 }, orvalho: { t: 'circle_05', c: '#bfeaff', r: 1.4, z: 0.12 }, brisa: { t: 'smoke_02', c: '#e8f8ff', r: 1.2, z: 0.24 }, cinza: { t: 'smoke_04', c: '#9a9aa8', r: 1.6, z: 0.26 },
        floresta: { t: 'magic_03', c: '#6aff8a', r: 2, z: 0.18 }, ambar: { t: 'flame_03', c: '#ffb050', r: 2.4, z: 0.2, breath: 1 }, mare: { t: 'circle_05', c: '#7ac0ff', r: 2.4, z: 0.14 }, geada: { t: 'star_01', c: '#dff6ff', r: 3, z: 0.14 }, bronze: { t: 'spark_01', c: '#ffc070', r: 2, z: 0.12 },
        prisma: { t: 'star_03', c: '#7ff2ff', r: 3.5, z: 0.16 }, esmeralda: { t: 'magic_03', c: '#4fffa0', r: 3.5, z: 0.18 }, ametista: { t: 'magic_02', c: '#c090ff', r: 3.5, z: 0.18 }, solar: { t: 'star_02', c: '#ffe070', r: 4, z: 0.18, breath: 1 },
        vulcao: { t: 'flame_01', c: '#ff7a2a', r: 5, z: 0.24, breath: 1 }, tempestade: { t: 'spark_02', c: '#9ab0ff', r: 5, z: 0.2 }, aurora: { t: 'star_02', c: '#ff9af0', r: 5, z: 0.2 }, cometa: { t: 'star_01', c: '#ffd35c', r: 6, z: 0.22, breath: 1 }, eclipse: { t: 'smoke_03', c: '#7a4aff', r: 6, z: 0.3 }
    };
    function zFxTex(n) {
        const T = clTh(); ZOO.ftx = ZOO.ftx || {}; if (!ZOO.ftx[n]) { const t = new T.TextureLoader().load('./assets/colony/fx/' + n + '.png'); if (T.sRGBEncoding) t.encoding = T.sRGBEncoding; ZOO.ftx[n] = t; } return ZOO.ftx[n];
    }
    function zDragonFx(e, B, dt, t, sc) {
        const F = ZFX[e.a.sp]; if (!F || !ZOO.fx && false) return; if (ZOO.lite && (zsp(e.a.sp).rk | 0) < 2) return; const L = (ZOO.fx = ZOO.fx || []); if (L.length > (ZOO.lite ? 22 : 150)) return;   /* celular: rastro só nos raros, e poucos de cada vez (cada partícula é um desenho) */ const T = clTh(), Z = ZOO.tmp; if (!Z.fv) { Z.fv = new T.Vector3(); Z.fq = new T.Vector3(); }
        e.fxA = (e.fxA || 0) + dt * F.r * (e.m === 'ground' ? 0.3 : 1) * (ZOO.lite ? 0.4 : 1); Z.fv.set(1, 0, 0).applyQuaternion(e.g.quaternion);
        const mk = (tex, col, size, op, kind, life, vel, pos, extra) => { const m = new T.Sprite(new T.SpriteMaterial({ map: zFxTex(tex), color: col, transparent: true, opacity: op, depthWrite: false, blending: T.AdditiveBlending })); m.scale.setScalar(size); m.position.copy(pos); zFxAdd(m, vel, life, kind, Object.assign({ s0: size, o0: op }, extra || {})); };
        while (e.fxA >= 1) { e.fxA -= 1; Z.fq.copy(e.g.position).addScaledVector(Z.fv, -B.sz * sc * 0.22); Z.fq.x += (Math.random() - 0.5) * 0.12; Z.fq.z += (Math.random() - 0.5) * 0.12; mk(F.t, F.c, F.z * sc, 0.8, 'trail', 1.1 + Math.random() * 0.6, new T.Vector3((Math.random() - 0.5) * 0.1, 0.08 + Math.random() * 0.1, (Math.random() - 0.5) * 0.1), Z.fq); }
        if ((zsp(e.a.sp).rk | 0) >= 3 && !ZOO.lite) { const rk2 = zsp(e.a.sp).rk | 0; e.fxS = (e.fxS || 0) + dt * (rk2 === 4 ? 3.5 : 2); while (e.fxS >= 1) { e.fxS -= 1; Z.fq.copy(e.g.position); Z.fq.x += (Math.random() - 0.5) * B.span * sc * 0.5; Z.fq.z += (Math.random() - 0.5) * B.span * sc * 0.5; Z.fq.y += (Math.random() - 0.3) * 0.5; mk(rk2 === 4 ? 'star_02' : 'spark_02', rk2 === 4 ? '#ffd35c' : '#d8a8ff', (0.12 + Math.random() * 0.12) * sc, 0.9, 'trail', 0.8 + Math.random() * 0.7, new T.Vector3((Math.random() - 0.5) * 0.2, 0.05 + Math.random() * 0.2, (Math.random() - 0.5) * 0.2), Z.fq, { grow: 0.4 }); } }
        if (F.breath) { e.fb = (e.fb === undefined ? t + 6 + Math.random() * 10 : e.fb); if (t > e.fb && e.m === 'fly') { e.fb = t + 9 + Math.random() * 14; for (let i = 0; i < 16; i++) { Z.fq.copy(e.g.position).addScaledVector(Z.fv, B.sz * sc * 0.4); const sp = 1.4 + Math.random() * 0.9; mk(i % 3 ? 'flame_0' + (1 + i % 6) : 'fire_01', i % 4 ? '#ff8a2a' : '#ffd35c', 0.18 * sc + Math.random() * 0.1, 0.9, 'trail', 0.7 + Math.random() * 0.4, new T.Vector3(Z.fv.x * sp + (Math.random() - 0.5) * 0.35, -0.15 + Math.random() * 0.2, Z.fv.z * sp + (Math.random() - 0.5) * 0.35), Z.fq, { grow: 2.6 }); } } }
    }
    /* ---------- interação: tocar no dragão (reage e abre o painel), dar comida (comem de verdade) ---------- */
    function zBurst(e, tex, col, n, up) {
        const T = clTh(); for (let i = 0; i < n; i++) { const m = new T.Sprite(new T.SpriteMaterial({ map: zFxTex(tex), color: col, transparent: true, opacity: 0.95, depthWrite: false, blending: T.AdditiveBlending })); const sz = 0.16 + Math.random() * 0.16; m.scale.setScalar(sz); m.position.copy(e.g.position); m.position.y += e.B.span * e.g.scale.x * 0.25; const a = Math.random() * 6.283, sp = 0.6 + Math.random() * 0.9; zFxAdd(m, new T.Vector3(Math.cos(a) * sp, (up || 0.8) + Math.random() * 0.8, Math.sin(a) * sp), 0.9 + Math.random() * 0.5, 'trail', { s0: sz, o0: 0.95, grow: 0.6 }); }
    }
    function zDragonReact(e) {
        try { const R = ZR[zsp(e.a.sp).rk | 0]; e.rt = 1.15; e.rd = 1.15; e.rk = e.m === 'ground' ? 'roar' : 'roll'; zBurst(e, 'star_02', R.col, 9, 0.7); zBurst(e, 'magic_01', '#ff9ad8', 5, 1.1); try { aliveSound('chirp'); clFarmBuzz(18); } catch (er) {} } catch (er) {}
    }
    /* tocar no dragão: ele reage com um golpe do seu elemento (fogo, folhas, água, cristais ou estrelas) e uma etiqueta mostra quem é. O painel fica no Livro */
    function zDragonShow(e) {
        const T = clTh(), sp = zsp(e.a.sp), F = ZFX[e.a.sp] || {}, Z = ZOO.tmp, R = ZR[sp.rk | 0]; if (!Z.fv) { Z.fv = new T.Vector3(); Z.fq = new T.Vector3(); }
        const kind = F.breath ? 'fire' : ({ terra: 'leaf', agua: 'water', cristal: 'gem', estelar: 'star' })[sp.el] || 'star';
        const K = { fire: { t: ['flame_01', 'flame_03', 'fire_01'], c: ['#ff8a2a', '#ffd35c'], sp: 2.2, g: 2.4 }, leaf: { t: ['magic_03', 'magic_01'], c: ['#7aff6a', '#d8ff8a'], sp: 1.6, g: 1.2 }, water: { t: ['circle_05', 'smoke_02'], c: ['#7ac8ff', '#d8f4ff'], sp: 2.0, g: 1.6 }, gem: { t: ['star_03', 'spark_02'], c: [R.col, '#ffffff'], sp: 1.8, g: 1.0 }, star: { t: ['star_02', 'star_01'], c: ['#ffd35c', '#ffffff'], sp: 1.8, g: 1.1 } }[kind];
        Z.fv.set(1, 0, 0).applyQuaternion(e.g.quaternion); const sc = e.g.scale.x, n = ZOO.lite ? 14 : 26, sz = e.B.sz * sc;
        for (let i = 0; i < n; i++) {
            Z.fq.copy(e.g.position).addScaledVector(Z.fv, sz * 0.42); Z.fq.y += e.B.span * sc * 0.14; const sp2 = K.sp * (0.7 + Math.random() * 0.8), m = new T.Sprite(new T.SpriteMaterial({ map: zFxTex(K.t[i % K.t.length]), color: K.c[i % K.c.length], transparent: true, opacity: 0.95, depthWrite: false, blending: T.AdditiveBlending }));
            const size = (0.18 + Math.random() * 0.14) * Math.max(1, sc * 0.8); m.scale.setScalar(size); m.position.copy(Z.fq);
            zFxAdd(m, new T.Vector3(Z.fv.x * sp2 + (Math.random() - 0.5) * 0.5, (Math.random() - 0.35) * 0.45, Z.fv.z * sp2 + (Math.random() - 0.5) * 0.5), 0.8 + Math.random() * 0.5, 'trail', { s0: size, o0: 0.95, grow: K.g });
        }
        try { clMsg(sp.n + ' · ' + R.n); } catch (er) {}
    }
    function clBichosTap(cx, cy) {
        try {
            if (!CL.on || CL.visit || !CL3.cam) return false; const T = clTh(), v = new T.Vector3();
            for (let ei = 0; ei < (ZOO.eggs || []).length; ei++) {
                const q = ZOO.eggs[ei]; if (!q || q.gone || !q.g || !q.g.visible || !q.eg || q.eg.el < q.eg.tot) continue;
                v.copy(q.g.position).project(CL3.cam); if (v.z > 1) continue;
                const sx = (v.x + 1) / 2 * CL3.w, sy = (1 - v.y) / 2 * CL3.h, dist = CL3.cam.position.distanceTo(q.g.position), ppu = CL3.h / (2 * Math.tan(CL3.cam.fov * Math.PI / 360) * dist), r = Math.max(36, q.g.scale.x * 0.25 * ppu);
                if (Math.hypot(sx - cx, sy - cy) < r) {
                    if (q.pi >= 0) { CL.sel = q.pi; CL.selD = -1; CL.build = false; CL.showSelDetails = true; try { clUiSel(); clPaintBar(true); } catch (e2) {} return true; }
                    return false;
                }
            }
            if (!ZOO.list.length) return false;
            let best = null, bd = 1e9;
            ZOO.list.forEach(e => { if (!e.B || !e.B.dragon || !e.g.visible) return; v.copy(e.g.position).project(CL3.cam); if (v.z > 1) return; const sx = (v.x + 1) / 2 * CL3.w, sy = (1 - v.y) / 2 * CL3.h, dist = CL3.cam.position.distanceTo(e.g.position), ppu = CL3.h / (2 * Math.tan(CL3.cam.fov * Math.PI / 360) * dist), r = Math.max(28, e.B.span * e.g.scale.x * 0.36 * ppu), d = Math.hypot(sx - cx, sy - cy); if (d < r && d < bd) { bd = d; best = e; } });
            if (!best) return false; zDragonReact(best); try { zDragonShow(best); } catch (er) { ZOO.lastErr = 'show ' + er; } return true;
        } catch (er) { return false; }
    }
    function zFeedFx(ids) {
        try { ZOO.list.forEach(e => { if (!e.B || !e.B.dragon || !e.g.visible || (ids && ids.indexOf(e.id) < 0)) return; e.ct = 0.9; const T = clTh(); for (let i = 0; i < 7; i++) { const m = new T.Sprite(new T.SpriteMaterial({ map: zFxTex(i % 2 ? 'circle_05' : 'magic_01'), color: i % 3 ? '#8dff6a' : '#ffd35c', transparent: true, opacity: 0.95, depthWrite: false, blending: T.AdditiveBlending })); m.scale.setScalar(0.16); m.position.copy(e.g.position); m.position.y += e.B.span * e.g.scale.x * 0.9; m.position.x += (Math.random() - 0.5) * 0.7; m.position.z += (Math.random() - 0.5) * 0.7; zFxAdd(m, new T.Vector3(0, -1.5, 0), 0.7 + Math.random() * 0.3, 'trail', { s0: 0.16, o0: 0.95, grow: 0.2 }); } }); } catch (er) {}
    }
    /* ---------- ilha-habitat dos dragões: uma rocha grande no mar, atrás da colônia. Eles descansam e andam nela e voam em volta; só 1 ou 2 patrulham a colônia ---------- */
    function zHabCalc(s, pa, el) {
        const cc = zColony(s, pa, 0), cam = CL3.cam;
        if (ZOO.habDir === undefined || ZOO.habScene !== CL3.sc) {
            let dx = (CL3.tx || 0) - (cam ? cam.position.x : 0), dz = (CL3.tz || 0) - (cam ? cam.position.z : 0);
            ZOO.habDir = Math.atan2(dz, dx); ZOO.habScene = CL3.sc;
        }
        const OFF = { terra: -1.25, agua: -0.42, cristal: 0.42, estelar: 1.25 };
        const ang = ZOO.habDir + (OFF[el] || 0), D = cc.H + 24;
        const hx = cc.ox + Math.cos(ang) * D, hz = cc.oz + Math.sin(ang) * D;
        return { ox: hx, oz: hz, H: 11, cx: hx, cz: hz };
    }
    function zHabEnsure(s, pa, t, el) {
        const T = clTh(); ZOO.habs = ZOO.habs || {}; if (ZOO.habs[el] && zIn(ZOO.habs[el].grp)) return ZOO.habs[el]; ZOO.habT = ZOO.habT || {}; if (ZOO.habT[el] && t - ZOO.habT[el] < 2) return null; ZOO.habT[el] = t;
        const IF = { terra: 'isla_terra.glb', agua: 'isla_agua.glb', cristal: 'isla_cristal.glb', estelar: 'isla_estelar.glb' }[el] || 'ilha-alien.glb', tp = CLM.tpl[IF]; if (!tp || !tp.gl) { try { clModelLoad(IF); } catch (er) {} return null; }
        const cc = zColony(s, pa, t), cam = CL3.cam;
        if (ZOO.habDir === undefined || ZOO.habScene !== CL3.sc) { let dx = (CL3.tx || 0) - cam.position.x, dz = (CL3.tz || 0) - cam.position.z; ZOO.habDir = Math.atan2(dz, dx); ZOO.habScene = CL3.sc; }
        const OFF = { terra: -1.25, agua: -0.42, cristal: 0.42, estelar: 1.25 }, ang = ZOO.habDir + (OFF[el] || 0), W = 13, D = cc.H + 24, hx = cc.ox + Math.cos(ang) * D, hz = cc.oz + Math.sin(ang) * D, o = tp.gl.scene.clone(true), vs = new T.Vector3(); pa.grp.getWorldScale(vs);
        const E = ZEL[el] || ZEL.terra, tint = new T.Color(E.col);
        o.traverse(m => { if (m.isMesh) { if (m.geometry && !m.geometry.boundingSphere) m.geometry.computeBoundingSphere(); m.frustumCulled = true; if (m.material && IF === 'ilha-alien.glb') { const mt = (Array.isArray(m.material) ? m.material : [m.material]).map(x => { const c = x.clone(); c.envMapIntensity = 1.0; if (c.color) { c.color.lerp(tint, 0.8).multiplyScalar(1.1); } if (c.emissive) { c.emissive.copy(tint).multiplyScalar(0.25); c.emissiveIntensity = Math.max(c.emissiveIntensity || 0, 0.6); } if (c.map && c.emissiveMap == null) { c.emissiveMap = c.map; } return c; }); m.material = Array.isArray(m.material) ? mt : mt[0]; } } });
        const bb = new T.Box3().setFromObject(o), sz = bb.getSize(new T.Vector3()), ctr = bb.getCenter(new T.Vector3()), grp = new T.Group(); o.position.set(-ctr.x, -bb.min.y, -ctr.z); grp.add(o);
        const k = W / Math.max(sz.x, sz.z, sz.y * 0.5), y0 = -0.6 - sz.y * k * 0.38; grp.scale.setScalar(k); grp.position.set(hx, y0, hz); grp.rotation.y = (el.length * 1.7) % 6.28; zRoot().add(grp); grp.updateMatrixWorld(true);
        const meshes = []; o.traverse(m => { if (m.isMesh) meshes.push(m); }); const rc = new T.Raycaster(), hits = [];
        for (let i = 0; i < 48; i++) { const a = i * 2.4, r = W * 0.34 * Math.sqrt((i + 0.5) / 48); rc.set(new T.Vector3(hx + Math.cos(a) * r, y0 + sz.y * k + 20, hz + Math.sin(a) * r), new T.Vector3(0, -1, 0)); const h = rc.intersectObjects(meshes, false)[0]; if (h && h.face && h.face.normal.y > 0.6) hits.push(h.point.clone()); }
        hits.sort((p, q) => p.y - q.y); const pick = hits.length ? hits[Math.floor(hits.length * 0.3)] : new T.Vector3(hx, y0 + sz.y * k * 0.6, hz);
        const frame = new T.Group(); frame.position.copy(pick); frame.scale.setScalar(vs.x); zRoot().add(frame); frame.updateMatrixWorld(true);
        const pad = new T.Mesh(new T.CylinderGeometry(2.7, 3.0, 0.3, 10), new T.MeshStandardMaterial({ color: new T.Color('#9a9184').lerp(tint, 0.3), roughness: 0.95, flatShading: true })); pad.position.y = -0.12; pad.receiveShadow = true; frame.add(pad);
        const cy = el === 'cristal' ? ['mina_crystal_blue.glb', 'mina_crystal_green.glb', 'geode_crystal.glb'] : el === 'estelar' ? ['geode_crystal.glb', 'mina_crystal_blue.glb'] : ['mina_crystal_green.glb', 'geode_crystal.glb']; cy.forEach((f, i) => { try { clModelLoad(f); const ct = CLM.tpl[f]; if (ct && ct.gl) { const c = ct.gl.scene.clone(true), b2 = new T.Box3().setFromObject(c), s2 = b2.getSize(new T.Vector3()), a = 1.1 + i * 2.1, g2 = new T.Group(); c.position.set(-(b2.min.x + b2.max.x) / 2, -b2.min.y, -(b2.min.z + b2.max.z) / 2); g2.add(c); g2.scale.setScalar(1.9 / Math.max(s2.y, 0.01)); g2.position.set(Math.cos(a) * 3.3, 0, Math.sin(a) * 3.3); frame.add(g2); } } catch (er) {} });
        {   /* símbolo brilhante do elemento, na frente da ilha (voltado para a colônia) */
            const cvl = document.createElement('canvas'); cvl.width = cvl.height = 256; const cx = cvl.getContext('2d'); const gl = cx.createRadialGradient(128, 128, 10, 128, 128, 126); gl.addColorStop(0, E.col + 'aa'); gl.addColorStop(0.5, E.col + '33'); gl.addColorStop(1, E.col + '00'); cx.fillStyle = gl; cx.fillRect(0, 0, 256, 256);
            cx.shadowColor = E.col; cx.shadowBlur = 26; cx.fillStyle = 'rgba(255,255,255,.97)'; cx.strokeStyle = E.col; cx.lineWidth = 7; cx.lineJoin = 'round'; cx.beginPath();
            if (el === 'terra') { cx.moveTo(128, 44); cx.bezierCurveTo(196, 76, 208, 140, 128, 208); cx.bezierCurveTo(48, 140, 60, 76, 128, 44); }
            else if (el === 'agua') { cx.moveTo(128, 40); cx.bezierCurveTo(166, 92, 192, 124, 192, 152); cx.arc(128, 152, 64, 0, Math.PI, false); cx.bezierCurveTo(64, 124, 90, 92, 128, 40); }
            else if (el === 'cristal') { cx.moveTo(128, 36); cx.lineTo(196, 98); cx.lineTo(128, 220); cx.lineTo(60, 98); cx.closePath(); }
            else { for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4 - Math.PI / 2, r2 = k % 2 ? 30 : 92; cx[k ? 'lineTo' : 'moveTo'](128 + Math.cos(a) * r2, 128 + Math.sin(a) * r2); } cx.closePath(); }
            cx.fill(); cx.shadowBlur = 0; cx.stroke(); if (el === 'cristal') { cx.lineWidth = 4; cx.beginPath(); cx.moveTo(60, 98); cx.lineTo(196, 98); cx.moveTo(128, 36); cx.lineTo(100, 98); cx.lineTo(128, 220); cx.moveTo(128, 36); cx.lineTo(156, 98); cx.lineTo(128, 220); cx.stroke(); } if (el === 'terra') { cx.lineWidth = 4; cx.beginPath(); cx.moveTo(128, 208); cx.lineTo(128, 80); cx.stroke(); }
            const tx = new T.CanvasTexture(cvl); if (T.sRGBEncoding) tx.encoding = T.sRGBEncoding; const sp = new T.Sprite(new T.SpriteMaterial({ map: tx, transparent: true, depthWrite: false })); sp.scale.set(5.4, 5.4, 1);
            let ddx = cc.ox - hx, ddz = cc.oz - hz; const dl = Math.hypot(ddx, ddz) || 1; ddx /= dl; ddz /= dl; sp.position.set(ddx * (W * 0.42) / vs.x, 3.4, ddz * (W * 0.42) / vs.x); sp.renderOrder = 10; frame.add(sp); ZOO.habSym = ZOO.habSym || {}; ZOO.habSym[el] = sp;
            const bm = new T.Sprite(new T.SpriteMaterial({ map: zSoftTex(), color: E.col, transparent: true, opacity: 0.14, depthWrite: false, blending: T.AdditiveBlending })); bm.scale.set(10, 10, 1); bm.position.set(0, 2.5, 0); bm.renderOrder = -1; frame.add(bm); }
        const lab = ZOO.habs[el] = { grp, frame, S: vs.x, b: { x0: -1.9, x1: 1.9, z0: -1.9, z1: 1.9 }, cc: { cx: hx, cz: hz, ox: hx, oz: hz, H: 11, rx: 11, rz: 11 }, pick, el }; return lab;
    }
    function zDragonStep(e, B, dt, t, s, lod) {
        const T = clTh(), pa = zPastureFor(e.pi); if (!pa) { e.g.visible = false; return; } e.g.visible = true;
        const hab = e.homeWant && ZOO.habs && ZOO.habs[zsp(e.a.sp).el] && zIn(ZOO.habs[zsp(e.a.sp).el].grp) ? ZOO.habs[zsp(e.a.sp).el] : null, ZB = hab ? hab.b : zBounds; if (!hab && e.homeWant !== false && !CL.visit) { ZOO.habWait = ZOO.habWait || t; if (t - ZOO.habWait < 30) { e.g.visible = false; return; } }   /* a ilha ainda está carregando: o dragão espera lá, em vez de nascer na colônia */ if (!!hab !== !!e.inHab) { e.inHab = !!hab; if (e.wp) { e.m = 'fly'; e.fwp = null; e.turn = 0; e.wp.y = Math.max(e.wp.y, e.alt || 6); } }
        const gw = hab ? hab.frame : pa.grp; gw.updateWorldMatrix(true, false);
        const Z = ZOO.tmp || (ZOO.tmp = { v: new T.Vector3(), qw: new T.Quaternion(), qa: new T.Quaternion(), vs: new T.Vector3(), up: new T.Vector3(0, 1, 0), fw: new T.Vector3(0, 0, 1) }); gw.getWorldScale(Z.vs); gw.getWorldQuaternion(Z.qw); const phi = 2 * Math.atan2(Z.qw.y, Z.qw.w); const sc = e.s0 * (e.spawnT != null ? ((t - e.spawnT) < 5.2 ? 0.0001 : Math.min(1, 0.5 + (t - e.spawnT - 5.2) / 1.5 * 0.5) * (1 + 1.5 * Math.max(0, 1 - (t - e.spawnT - 5.2) / 5))) : 1) * (hab ? hab.S : Z.vs.x), cc = hab ? hab.cc : (e.homeWant ? zHabCalc(s, pa, zsp(e.a.sp).el) : zColony(s, pa, t));
        if (!e.wp) { e.wp = new T.Vector3(); e.m = 'fly'; e.fs = 1.3 + (e.ph * 5 % 1) * 0.7; e.alt = 5.2 + (e.ph * 3 % 1) * 2.8; e.next = t + 15 + Math.random() * 40; e.bank = 0; e.pit = 0; e.turn = 0; e.dir = (e.ph * 7 % 1) < 0.5 ? 1 : -1; e.first = true; }
        if (!Z.o1) { Z.o1 = new T.Vector3(); Z.o2 = new T.Vector3(); Z.pv = new T.Vector3(); }
        const gy = 0.03 + (B.footG || 0.3) * sc; let fly = true, hv = 0, walkV = 0;
        if (e.first) { const targetCc = hab ? hab.cc : (ZOO.habs && ZOO.habs[zsp(e.a.sp).el] ? ZOO.habs[zsp(e.a.sp).el].cc : zHabCalc(s, pa, zsp(e.a.sp).el)); const a0 = Math.random() * 6.283; e.wp.set(targetCc.ox + targetCc.H * 0.8 * Math.cos(a0), e.alt, targetCc.oz + targetCc.H * 0.8 * Math.sin(a0)); e.face = Math.random() * 6.283; e.first = false; Z.pv.copy(e.wp); }
        Z.pv.copy(e.wp);
        if (e.m === 'fly') {
            { const TR = 0.65, R = e.fs / TR, far = Math.hypot(e.fwp ? e.fwp.x - e.wp.x : 99, e.fwp ? e.fwp.z - e.wp.z : 99); let behind = false; if (e.fwp) { let da = Math.atan2(-(e.fwp.z - e.wp.z), e.fwp.x - e.wp.x) - e.face; da = Math.atan2(Math.sin(da), Math.cos(da)); behind = Math.abs(da) > 1.7 && far < R * 2.2; }
              if (!e.fwp || far < Math.max(2.6, R * 1.3) || behind || t > e.fwt) { const ca = Math.atan2(e.wp.z - cc.oz, e.wp.x - cc.ox), na = ca + e.dir * (0.45 + Math.random() * 0.7), rr = cc.H * (0.7 + Math.random() * 0.2), cs = Math.cos(na), sn = Math.sin(na); e.fwp = { x: cc.ox + rr * Math.sign(cs) * Math.pow(Math.abs(cs), 0.62), z: cc.oz + rr * Math.sign(sn) * Math.pow(Math.abs(sn), 0.62) }; e.fwt = t + 25; e.alt = 5.2 + Math.random() * 2.8; } }
            { const dx = e.fwp.x - e.wp.x, dz = e.fwp.z - e.wp.z; let df = Math.atan2(-dz, dx) - e.face; df = Math.atan2(Math.sin(df), Math.cos(df)); const mt = 0.65 * dt, st = Math.max(-mt, Math.min(mt, df)); e.face += st; e.turn += (st / Math.max(dt, 1e-4) - e.turn) * Math.min(1, dt * 3); e.wp.x += Math.cos(e.face) * e.fs * dt; e.wp.z += -Math.sin(e.face) * e.fs * dt; e.wp.y += Math.max(-0.7 * dt, Math.min(0.7 * dt, e.alt - e.wp.y)); }
            if (B.canWalk && t > e.next && !CL.visit && lod.anim) { e.m = 'down'; const bx = ZB.x0 + 0.3 + Math.random() * (ZB.x1 - ZB.x0 - 0.6), bz = ZB.z0 + 0.3 + Math.random() * (ZB.z1 - ZB.z0 - 0.6); e.tx = bx; e.tz = bz; }
        } else if (e.m === 'down') {
            Z.o1.set(e.tx, 0, e.tz).applyMatrix4(gw.matrixWorld); const dx = Z.o1.x - e.wp.x, dz = Z.o1.z - e.wp.z, d = Math.hypot(dx, dz), sp = Math.min(1.7, 0.5 + d * 0.8); if (d > 0.05) { e.wp.x += dx / d * sp * dt; e.wp.z += dz / d * sp * dt; }
            const ty = d > 1.2 ? Math.max(gy + 0.8, e.wp.y - 0.4 * dt * 3) : gy; e.wp.y += (ty - e.wp.y) * Math.min(1, dt * (d > 1.2 ? 0.7 : 1.6));
            if (d < 0.25 && e.wp.y - gy < 0.1) { e.face -= phi; e.m = 'ground'; Z.o2.copy(e.wp); gw.worldToLocal(Z.o2); e.x = Z.o2.x; e.z = Z.o2.z; e.gt = t + 20 + Math.random() * 30; e.st = 'idle'; e.t = 0.5; e.v = 0; }
        } else if (e.m === 'ground') {
            fly = false; e.t -= dt; if (e.t <= 0) { if (Math.random() < 0.6) { e.st = 'walk'; e.tx = ZB.x0 + 0.3 + Math.random() * (ZB.x1 - ZB.x0 - 0.6); e.tz = ZB.z0 + 0.3 + Math.random() * (ZB.z1 - ZB.z0 - 0.6); e.t = 4 + Math.random() * 5; } else { e.st = 'idle'; e.t = 2 + Math.random() * 4; } }
            const dx = e.tx - e.x, dz = e.tz - e.z, d = Math.hypot(dx, dz); let want = 0; if (e.st === 'walk' && d > 0.1) { const wa = Math.atan2(-dz, dx); let df = wa - e.face; df = Math.atan2(Math.sin(df), Math.cos(df)); e.face += Math.max(-1.8 * dt, Math.min(1.8 * dt, df)); want = 0.55 * Math.pow(Math.max(0, Math.cos(df)), 2); } else if (e.st === 'walk') { e.st = 'idle'; e.t = 2; }
            e.v = (e.v || 0) + (want - (e.v || 0)) * Math.min(1, dt * 2.5); if (e.v > 0.02) { e.x += Math.cos(e.face) * e.v * dt; e.z += -Math.sin(e.face) * e.v * dt; } e.x = Math.max(ZB.x0, Math.min(ZB.x1, e.x)); e.z = Math.max(ZB.z0, Math.min(ZB.z1, e.z));
            ZOO.list.forEach(o => { if (o === e || !o.B || !o.B.dragon || o.m !== 'ground' || o.pi !== e.pi) return; const ox = e.x - o.x, oz = e.z - o.z, od = Math.hypot(ox, oz) || 1e-3, mm = 0.5; if (od < mm) { e.x += ox / od * (mm - od) * 0.5; e.z += oz / od * (mm - od) * 0.5; } });
            Z.o1.set(e.x, gy, e.z).applyMatrix4(gw.matrixWorld); e.wp.copy(Z.o1); walkV = e.v;
            if (t > e.gt) { e.face += phi; e.m = 'up'; e.upT = t; }
        } else if (e.m === 'up') {
            const u = Math.min(1, (t - e.upT) / 3.2); e.wp.x += Math.cos(e.face) * (0.4 + u * 1.2) * dt; e.wp.z += -Math.sin(e.face) * (0.4 + u * 1.2) * dt; e.wp.y += (e.alt - e.wp.y) * Math.min(1, dt * (0.4 + u * 1.2));
            if (u >= 1) { e.m = 'fly'; e.fwp = null; e.turn = 0; e.next = t + 25 + Math.random() * 50; }
        }
        if (e.m === 'fly') { Z.o2.copy(e.wp).sub(Z.pv); hv = Z.o2.y / Math.max(dt, 1e-4); e.bank += (Math.max(-0.6, Math.min(0.6, -e.turn * 0.55)) - e.bank) * Math.min(1, dt * 3); }
        else if (e.m !== 'ground') { Z.o2.copy(e.wp).sub(Z.pv); const sp2 = Math.hypot(Z.o2.x, Z.o2.z) / Math.max(dt, 1e-4); if (sp2 > 0.08) { const fa = Math.atan2(-Z.o2.z, Z.o2.x); let df = fa - e.face; df = Math.atan2(Math.sin(df), Math.cos(df)); const ts = Math.max(-2.2 * dt, Math.min(2.2 * dt, df * Math.min(1, dt * 3))); e.face += ts; e.bank += (Math.max(-0.5, Math.min(0.5, -ts / Math.max(dt, 1e-4) * 0.35)) - e.bank) * Math.min(1, dt * 3); } hv = Z.o2.y / Math.max(dt, 1e-4); }
        else e.bank += (0 - e.bank) * Math.min(1, dt * 4);
        e.pit += ((e.m === 'ground' ? 0 : Math.max(-0.35, Math.min(0.35, hv * 0.25))) - e.pit) * Math.min(1, dt * 3);
        e.g.position.copy(e.wp); Z.qa.setFromAxisAngle(Z.up, e.face); if (e.m === 'ground') e.g.quaternion.copy(Z.qw).multiply(Z.qa); else e.g.quaternion.copy(Z.qa); e.g.scale.setScalar(sc);
        if (ZOO.fr) { ZOO.sph.center.copy(e.wp); ZOO.sph.radius = B.span * sc * 0.75 + 1; if (!ZOO.fr.intersectsSphere(ZOO.sph) || e.far) { e.g.visible = false; return; } e.g.visible = true; }
        if (B.pool) { const rk0 = zsp(e.a.sp).rk | 0, h = Math.max(0, e.wp.y - 0.06); B.pool.position.set(0, -h / sc + 0.02, 0); B.pool.scale.set(B.span * (1.3 + h * 0.08), B.span * (1.3 + h * 0.08), 1); B.pool.material.opacity = (0.1 + rk0 * 0.06) * (0.75 + 0.25 * Math.sin(t * 2.2 + e.ph)) * Math.max(0.35, 1 - h * 0.05); }
        if (B.halo) B.halo.visible = !ZOO.lite;
        B.body.rotation.x = e.bank; B.body.rotation.z = e.pit + (e.m === 'ground' ? 0 : (B.pit0 || 0));
        if (e.rt > 0) { e.rt -= dt; const u = 1 - Math.max(0, e.rt) / e.rd, ez = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2; if (e.rk === 'roll') B.body.rotation.x += ez * 6.2832; else { B.body.scale.setScalar(1 + 0.2 * Math.sin(u * 3.1416)); B.body.position.y = Math.sin(u * 3.1416) * 0.12 * B.span; } if (e.rt <= 0) { B.body.scale.setScalar(1); B.body.position.y = 0; } }
        if (e.ct > 0) { e.ct -= dt; B.body.scale.setScalar(1 + 0.1 * Math.abs(Math.sin(e.ct * 14))); if (e.ct <= 0) B.body.scale.setScalar(1); }
        const rk = e.a ? (zsp(e.a.sp).rk | 0) : 0; if (B.halo) { const pu = 0.85 + 0.15 * Math.sin(t * 2.2 + e.ph); B.halo.material.opacity = (0.14 + rk * 0.07) * pu; B.halo.scale.setScalar(B.span * (0.9 + rk * 0.12) * (0.95 + 0.05 * pu) / sc * sc); }
        { const ru = ZOO.rimU && ZOO.rimU[e.a.sp]; if (ru) ru.value = 0.75 + 0.25 * Math.sin(t * 2.2 + e.ph); }
        if (B.em && B.em.length) { const br = 0.78 + 0.32 * Math.sin(t * 2.4 + e.ph); for (let i = 0; i < B.em.length; i++) B.em[i].c.emissiveIntensity = B.em[i].ei * br; }   /* o corpo respira na cor da raridade */
        if (B.gpuAura) { B.gpuAura.material.uniforms.uTime.value = t; }
        if (B.fxStep) { try { B.fxStep(t, Math.min(dt, 0.05)); } catch (er) { B.fxStep = null; } }
        if (B.jewelMats && B.jewelMats.length) {
            const ph = e.ph || 0;
            const jr = 0.88 + 0.12 * Math.sin(t * 0.55 + ph);
            const jg = 0.74 + 0.20 * Math.sin(t * 0.55 + 2.094 + ph);
            const jb = 0.48 + 0.32 * Math.sin(t * 0.55 + 4.188 + ph);
            for (let j = 0; j < B.jewelMats.length; j++) { if (B.jewelMats[j].color) B.jewelMats[j].color.setRGB(jr, jg, jb); }
        }
        if (B.orb && B.orb.length) { const n = B.orb.length, R0 = B.span * (0.5 + rk * 0.03), sp0 = rk >= 4 ? 1.7 : 1.1; for (let i = 0; i < n; i++) { const o = B.orb[i], a = t * sp0 + i * 6.2832 / n; o.position.set(Math.cos(a) * R0, B.span * 0.25 + Math.sin(t * 2 + i * 1.3) * B.span * 0.07, Math.sin(a) * R0); o.material.rotation = t * 2 + i; o.material.opacity = 0.6 + 0.4 * Math.sin(t * 4 + i * 1.7); } }
        if (B.wave) { const w = (t * 0.33 + e.ph) % 1; B.wave.position.y = B.span * 0.2; B.wave.scale.setScalar(B.span * (0.4 + w * (rk >= 4 ? 2.2 : 1.5))); B.wave.material.opacity = 0.9 * (1 - w) * (1 - w); }
        if (B.beam) B.beam.material.opacity = 0.15 + 0.06 * Math.sin(t * 2.3 + e.ph);
        if (B.shadow) { const h = Math.max(0, e.wp.y - 0.06); B.shadow.position.set(0, -h / sc, 0); B.shadow.scale.set(B.span * 0.8, B.span * 0.95, 1); B.shadow.material.opacity = Math.max(0.14, 0.45 - h * 0.035); }
        { const dist = CL3.cam.position.distanceTo(e.wp), itv = ZOO.lite ? (dist > 30 ? 0.1 : dist > 16 ? 0.05 : dist > 9 ? 0.033 : 0) : (dist > 34 ? 0.1 : dist > 24 ? 0.05 : 0); if (itv) { e.lm = (e.lm || 0) + dt; if (e.lm < itv) return; dt = e.lm; e.lm = 0; } }
        if (!lod.anim) { e.ma = (e.ma || 0) + dt; if (e.ma < 0.06) return; dt = e.ma; e.ma = 0; } else { try { zDragonFx(e, B, dt, t, sc); } catch (er) { ZOO.lastErr = 'fx ' + er; } } const A = B.act;
        if (A) {
            if (e.m === 'ground') { const mv = (e.v || 0) > 0.12; zDragonAct(B, mv && A.walk ? A.walk : (A.idle || A.fly), mv ? Math.max(0.5, Math.min(1.1, (e.v || 0) / 0.5)) : 1); } else zDragonAct(B, A.fly, (e.m === 'down' ? 0.85 : 1) * B.fts);
        }
        if (B.mixer) B.mixer.update(dt);
        if (B.P) {
            const P = B.P;
            const isFlying = e.m === 'fly' || e.m === 'down' || e.m === 'up';
            const moving = (e.v || 0) > 0.02;
            const flapSpd = isFlying ? (e.m === 'fly' ? 6.5 : 4.5) : (moving ? 3.5 : 1.8);
            const flapAmp = isFlying ? 0.38 : (moving ? 0.18 : 0.08);
            const flapBase = isFlying ? 0.55 : 0.2;
            if (P.wings) P.wings.forEach(w => {
                w.g.rotation.x = w.sd * (flapBase + flapAmp * Math.sin(t * flapSpd + e.ph));
                if (isFlying) w.g.rotation.z = Math.sin(t * flapSpd + e.ph) * 0.12;
            });
            if (P.tail) P.tail.rotation.y = Math.sin(t * 3.5 + e.ph) * (moving || isFlying ? 0.32 : 0.18);
            if (P.head) P.head.rotation.z = Math.sin(t * 1.8 + e.ph) * 0.06 + (isFlying ? -0.1 : 0);
            if (P.legs && P.legs.length) {
                if (!isFlying) {
                    const gait = Math.min(1, (e.v || 0) / 0.28);
                    P.legs.forEach(l => {
                        l.g.rotation.z = Math.sin((e.gp || 0) + l.ph) * 0.65 * gait;
                    });
                } else {
                    P.legs.forEach(l => {
                        l.g.rotation.z = -0.3 + Math.sin(l.ph) * 0.08;
                    });
                }
            }
            if (P.crown) {
                P.crown.rotation.z = t * 1.5;
                P.crown.position.y = (B.crownY || 0.98) + 0.03 * Math.sin(t * 2 + e.ph);
            }
            if (B.aura) {
                B.aura.material.opacity = 0.22 + 0.2 * (0.5 + 0.5 * Math.sin(t * 2.2 + e.ph));
                B.aura.rotation.y = t * 0.5;
            }
            if (B.orbs && B.orbs.length) {
                const sp0 = 1.6;
                for (let i = 0; i < B.orbs.length; i++) {
                    const a = t * sp0 + i * (6.283 / B.orbs.length);
                    B.orbs[i].position.set(Math.cos(a) * 0.65, 0.45 + Math.sin(t * 3 + i) * 0.12, Math.sin(a) * 0.65);
                }
            }
        }
    }
    function clBichosStep(dt, t) {
        if (!CL3.sc) return; try { const nw = performance.now(); clFpsFrame(nw); clFrzStep(nw); } catch (er) {}   /* contador e congelamento rodam mesmo sem Covil */
        if (ZOO.pscene !== CL3.sc) zReset(); ZOO.pastures = ZOO.pastures.filter(p => zIn(p.grp)); if (!ZOO.pastures.length && !ZOO.list.length) return;
        try { const T0 = clTh(); if (!ZOO.fr) { ZOO.fr = new T0.Frustum(); ZOO.pm = new T0.Matrix4(); ZOO.sph = new T0.Sphere(); } CL3.animBusy = ZOO.list.some(q => q.B && q.B.dragon && q.g.visible); CL3.cam.updateMatrixWorld(); ZOO.pm.multiplyMatrices(CL3.cam.projectionMatrix, CL3.cam.matrixWorldInverse); ZOO.fr.setFromProjectionMatrix(ZOO.pm); ZOO.lite = !!(CL3.lowq || CL_TOUCH()); } catch (er) { ZOO.fr = null; }
        if (!ZOO.vT || t - ZOO.vT > 0.25) { ZOO.vT = t; try {   /* só os dragões mais próximos da câmera são desenhados de verdade (celular 5, computador 10); os outros ficam escondidos até sobrar vaga */
            ZOO.list.forEach(q => { if (q.B && q.B.dragon) q.far = true; }); if (ZOO.fr) { const cp = CL3.cam.position, arr = []; ZOO.list.forEach(q => { if (q.B && q.B.dragon && q.wp) { ZOO.sph.center.copy(q.wp); ZOO.sph.radius = (q.B.span || 3) * (q.g.scale.x || 1) * 0.75 + 1; if (ZOO.fr.intersectsSphere(ZOO.sph)) arr.push([q.wp.distanceToSquared(cp), q]); } }); arr.sort((a, b) => a[0] - b[0]); const N = IPAD ? 2 : (ZOO.lite ? 4 : 8); arr.forEach((pq, i) => { pq[1].far = i >= N; }); }
        } catch (er) {} }
        const dtR = dt; dt = Math.min(dt, 0.1);   /* aba parada ou quadro lento mandava um dt enorme e os bichos atravessavam a cerca e sumiam */
        const s = clS(), lay = clZooLayout(s), lod = farmLod(); zSync(s, lay);
        if (!ZOO.hT || t - ZOO.hT > 1) try { ZOO.hT = t; const ds = ZOO.list.filter(q => q.B && q.B.dragon && q.a); const np = 0; ds.sort((p, q) => ((zsp(q.a.sp).rk | 0) - (zsp(p.a.sp).rk | 0)) || (p.id - q.id)); const any = ds.length > np; ds.forEach((q, i) => { q.homeWant = i >= np; }); if (any) { const pa0 = ZOO.pastures[0]; if (pa0) { const need = {}; ds.forEach(q => { if (q.homeWant) need[zsp(q.a.sp).el] = 1; }); Object.keys(need).forEach(el => zHabEnsure(s, pa0, t, el)); } } } catch (er) { ZOO.lastErr = 'hab ' + er; }
        ZOO.list.forEach(e => {
            const B = e.B, P = B.P, a = e.a, hungry = zAdult(a) && !(a.fed > 0.02); if (B.dragon) { if (e.far && e.wp && !(e.rt > 0)) { e.g.visible = false; return; } try { zDragonStep(e, B, dt, t, s, lod); } catch (er) { ZOO.lastErr = 'dragao ' + er; } return; } e.t -= dt;
            if (e.t <= 0) { const r = Math.random(); if (r < 0.55 && !hungry) { e.st = 'walk'; let bs = -1; for (let k = 0; k < 7; k++) { const tx = zBounds.x0 + Math.random() * (zBounds.x1 - zBounds.x0), tz = zBounds.z0 + Math.random() * (zBounds.z1 - zBounds.z0); let md = 9; ZOO.list.forEach(o => { if (o !== e) md = Math.min(md, Math.hypot(tx - o.x, tz - o.z)); }); if (md > bs) { bs = md; e.tx = tx; e.tz = tz; } } e.spd = 0.3 + Math.random() * 0.14; e.t = 4 + Math.random() * 4; } else if (r < 0.8 && e.B.P.head) { e.st = 'graze'; e.t = 2 + Math.random() * 3; } else { e.st = 'idle'; e.t = 1.5 + Math.random() * 3; } }
            let moving = false, yaw = 0; { const dx = e.tx - e.x, dz = e.tz - e.z, d = Math.hypot(dx, dz), walk = e.st === 'walk' && d > 0.06; let want = 0;
                if (walk) { const wa = Math.atan2(-dz, dx); let df = wa - e.face; df = Math.atan2(Math.sin(df), Math.cos(df)); const mt = 2.2 * dt, step = Math.max(-mt, Math.min(mt, df)); e.face += step; yaw = step / Math.max(dt, 1e-4); want = e.spd * (e.baby ? 1.25 : 1) * Math.pow(Math.max(0, Math.cos(df)), 2); }
                else if (e.st === 'walk') { e.st = 'idle'; e.t = 1.2 + Math.random() * 2; }
                else if (e.st === 'idle' || e.st === 'graze') { if (e.look === undefined || Math.random() < dt * 0.25) e.look = e.face + (Math.random() - 0.5) * 1.6; let df = e.look - e.face; df = Math.atan2(Math.sin(df), Math.cos(df)); const st2 = Math.max(-0.5 * dt, Math.min(0.5 * dt, df)); e.face += st2; yaw = st2 / Math.max(dt, 1e-4); }   /* parado, olha em volta devagar */
                const v0 = e.v || 0; e.v = v0 + (want - v0) * Math.min(1, dt * 2.6); e.ac = (e.v - v0) / Math.max(dt, 1e-4);
                if (e.v > 0.015 && d > 0.02) { const mx = Math.cos(e.face), mz = -Math.sin(e.face); e.x += mx * e.v * dt; e.z += mz * e.v * dt; moving = true; } }
            { const rad = e.rad || (e.rad = Math.max(0.16, (B.sz || 0.6) * 0.24)); ZOO.list.forEach(o => { if (o === e) return; const ox = e.x - o.x, oz = e.z - o.z, od = Math.hypot(ox, oz) || 0.0001, mm = rad + (o.rad || rad); if (od < mm) { const pu = (mm - od) * 0.4; e.x += ox / od * pu; e.z += oz / od * pu; } }); }   /* os bichos não se atravessam: cada um empurra o outro para o lado */
            e.x = Math.max(zBounds.x0, Math.min(zBounds.x1, e.x)); e.z = Math.max(zBounds.z0, Math.min(zBounds.z1, e.z)); if (!(e.x === e.x) || !(e.z === e.z)) { e.x = 0.7; e.z = 0; }
            { const pq = zPastureFor(e.pi), ob = pq && pq.grp.userData && pq.grp.userData.obst; if (ob) { let dx = e.x - ob.x, dz = e.z - ob.z, d = Math.hypot(dx, dz) || 1e-3; const mm = ob.r + (e.rad || 0.15); if (d < mm) { e.x = ob.x + dx / d * mm; e.z = ob.z + dz / d * mm; e.x = Math.max(zBounds.x0, Math.min(zBounds.x1, e.x)); e.z = Math.max(zBounds.z0, Math.min(zBounds.z1, e.z)); } } }
            { const pa = zPastureFor(e.pi); if (!pa) { e.g.visible = false; return; } e.g.visible = true; const gw = pa.grp; gw.updateWorldMatrix(true, false); const T3 = clTh(), Z = ZOO.tmp || (ZOO.tmp = { v: new T3.Vector3(), qw: new T3.Quaternion(), qa: new T3.Quaternion(), vs: new T3.Vector3(), up: new T3.Vector3(0, 1, 0), fw: new T3.Vector3(0, 0, 1) });
                Z.v.set(e.x, 0.02, e.z).applyMatrix4(gw.matrixWorld); e.g.position.copy(Z.v); gw.getWorldQuaternion(Z.qw); Z.qa.setFromAxisAngle(Z.up, e.face); e.g.quaternion.copy(Z.qw).multiply(Z.qa); gw.getWorldScale(Z.vs); e.g.scale.setScalar(e.s0 * Z.vs.x); }
            if (!lod.anim) return;
            const bsz = (B.sz || 0.6), gait = Math.min(1, (e.v || 0) / 0.28), stride = 6.283 * (e.v || 0) / (0.55 * bsz); e.gp = (e.gp || 0) + stride * dt; const g1 = Math.sin(e.gp), bird = /^(galinha|pato|cisne|pavao)$/.test(B.sp.id), wob = bird ? 0.14 : 0.055;   /* a fase do passo anda com a distância percorrida: o pé não escorrega */
            P.legs.forEach(l => { l.g.rotation.z = Math.sin(e.gp + l.ph) * 0.7 * gait; });
            if (B.rig) { const am = (bird ? 0.75 : 0.55) * gait; B.rig.forEach(l => { const ph = e.gp + l.ph; l.b.rotation.x = Math.sin(ph) * am; l.b.position.y = l.hip + Math.max(0, Math.cos(ph)) * l.h * 0.05 * gait; }); }
            B.body.position.y = gait * Math.abs(g1) * 0.05 * bsz + (1 - gait) * Math.sin(t * 1.6 + e.ph) * 0.005 * bsz; B.body.position.x = bird ? gait * Math.sin(e.gp * 2) * 0.03 * bsz : 0;
            B.body.rotation.x = g1 * wob * gait - Math.max(-0.25, Math.min(0.25, (yaw || 0) * 0.07)) * gait;   /* balança de lado e inclina nas curvas */
            B.body.rotation.z = (e.st === 'graze' && !moving ? -0.28 + 0.03 * Math.sin(t * 5 + e.ph) : 0) + Math.max(-0.12, Math.min(0.12, -(e.ac || 0) * 0.12)) + gait * 0.03 * Math.sin(e.gp * 2); if (P.head) { const gz = e.st === 'graze' ? 0.7 + 0.1 * Math.sin(t * 5 + e.ph) : (hungry ? 0.35 : 0); P.head.rotation.z += (-gz - P.head.rotation.z) * Math.min(1, dt * 4); if (P.neck && B.sp.k === 'b') P.neck.rotation.z += ((e.st === 'graze' ? 0.9 : 0) - P.neck.rotation.z) * Math.min(1, dt * 4); }
            if (B.mixer) { if (B.act && B.act.walk) B.act.walk.timeScale = Math.max(0.35, (e.v || 0) * 3.4); B.mixer.update(dt); if (B.sleg && B.sleg.length) zSheepLegs(B, gait, e.gp); const A = B.act; if (A) { const want = moving && A.walk ? A.walk : (A.idle || A.cur); if (want && A.cur !== want) { want.reset().fadeIn(0.3).play(); if (A.cur) A.cur.fadeOut(0.3); A.cur = want; } } }
            if (B.flap && B.flap.length) B.flap.forEach(f => { f.o.rotation.z = f.z + f.sd * Math.sin(t * 7 + e.ph) * 0.4; });
            if (B.hov) B.body.position.y = 0.12 + 0.05 * Math.sin(t * 2 + e.ph);
            if (P.tail) P.tail.rotation.y = Math.sin(t * 4 + e.ph) * (moving ? 0.35 : 0.2); P.wings.forEach(w => { if (B.sp.cl.wings) w.g.rotation.x = w.sd * (0.5 + 0.18 * Math.sin(t * 2 + e.ph)); else w.g.rotation.x = w.sd * (0.08 + (moving ? 0 : 0.02 * Math.sin(t * 2.5 + e.ph))); });
            if (P.crown) { P.crown.rotation.z = t * 1.5; P.crown.position.y = 0.95 + 0.03 * Math.sin(t * 2 + e.ph); }
            if (B.aura) { B.aura.material.opacity = 0.18 + 0.2 * (0.5 + 0.5 * Math.sin(t * 2 + e.ph)); B.aura.rotation.y = t * 0.5; }
        });
        ZOO.tcur = t; try { ZOO.eggs.forEach(q => { const pa = zPastureFor(q.pi); if (!pa) { q.g.visible = false; return; } q.g.visible = !q.gone; if (q.gone) { if (q.bar) q.bar.spr.visible = false; return; } const p = Math.min(1, q.eg.el / q.eg.tot), ok = p >= 1, gw = pa.grp; gw.updateWorldMatrix(true, false); const T3 = clTh(), Z = ZOO.tmp || (ZOO.tmp = { v: new T3.Vector3(), qw: new T3.Quaternion(), qa: new T3.Quaternion(), vs: new T3.Vector3(), up: new T3.Vector3(0, 1, 0), fw: new T3.Vector3(0, 0, 1) }), U = q.g.userData;
            const hz = q.hat > 0 ? t - q.hat : -1; let sh = ok ? 0.1 : (p > 0.75 && Math.sin(t * 1.3 + q.ph) > 0.9 ? 0.14 : 0.02); if (hz >= 0) sh = (q.pa && q.pa.grp && q.pa.grp.userData.roof && q.pa.grp.userData.roof.big) ? 0.03 + Math.min(hz, 2.6) * 0.05 : 0.1 + Math.min(hz, 1.5) * 0.3; else if (q.pa && q.pa.grp && q.pa.grp.userData.roof && q.pa.grp.userData.roof.big) sh *= 0.25;   /* o ovo grande da Árvore Incubadora quase não inclina: só gira reto */ if (hz >= 1.5 && !q.burst) { q.burst = 1; zHatchBurst(q, s); return; }
            let sc = 1; if (q.born) { const u = (t - q.born) / 0.9; if (u < 0) { q.g.visible = false; return; } sc = u >= 1 ? 1 : (u < 0.6 ? u / 0.6 * 1.3 : 1.3 - 0.3 * (u - 0.6) / 0.4); }
            const rf = pa.grp.userData.roof || { x: -1.4, y: 1.1, n: 3 }, nEggsPa = Math.max(rf.n, ZOO.eggs.filter(x => !x.gone && x.pi === q.pi).length), oa = t * 0.7 + (q.k - 1) / Math.max(1, nEggsPa) * 6.2832, orr = rf.model && nEggsPa > 1 ? 0.9 : 0, sx = rf.model ? rf.px + Math.cos(oa) * orr : rf.x, sz = rf.model ? rf.pz + Math.sin(oa) * orr : (q.k - 1 - (nEggsPa - 1) / 2) * 0.42; Z.v.set(sx, (rf.model ? rf.py - 0.1 : rf.y + 0.22) + Math.sin(t * 1.6 + q.ph) * 0.015 + (ok && hz < 0 ? Math.abs(Math.sin(t * 5 + q.ph)) * 0.025 : 0) + (q.born && sc > 1 ? 0 : 0), sz).applyMatrix4(gw.matrixWorld); q.g.position.copy(Z.v); gw.getWorldQuaternion(Z.qw); Z.qa.setFromAxisAngle(Z.fw, Math.sin(t * (hz >= 0 ? 34 : ok ? 17 : 1.6) + q.ph) * sh); Z.qs = Z.qs || new T3.Quaternion(); Z.qs.setFromAxisAngle(Z.up, rf.big ? q.ph : t * 1.8 + q.ph); q.g.quaternion.copy(Z.qw).multiply(Z.qs).multiply(Z.qa); if (rf.big) { Z.qt = Z.qt || new T3.Quaternion(); Z.ax = Z.ax || new T3.Vector3(); const yw = CL3.yaw || 0, th = Math.min(1.1, Math.max(0, (CL3.pit || 0.7) - 0.25) * 0.8); Z.ax.set(Math.cos(yw), 0, -Math.sin(yw)); Z.qt.setFromAxisAngle(Z.ax, -th); q.g.quaternion.premultiply(Z.qt); } gw.getWorldScale(Z.vs); q.g.scale.setScalar(Z.vs.x * sc * (rf.big ? 15 : rf.model ? 3.6 : 1.5) * (0.5 + 0.5 * Math.pow(p, 0.85)));
            if (q.bar) { const bs = q.bar.spr; bs.visible = !q.gone && hz < 0; if (bs.visible) { zEggBarPaint(q.bar, p, ok, ok ? 'Pronto!' : zClock(q.eg.tot - q.eg.el), q.eg.sp); bs.position.copy(q.g.position); bs.position.y += Z.vs.x * (q.pa.grp.userData.roof && q.pa.grp.userData.roof.big ? 5.2 : 2.1); bs.scale.set(Z.vs.x * 3.6, Z.vs.x * 0.9, 1); } }
            if (U.halo) { const pulse = (Math.sin(t * 4 + q.ph) + 1) / 2; U.halo.visible = false; if (U.U) { U.U.uP.value = hz >= 0 ? 1 : p; U.U.uT.value = t + q.ph; U.egg.material.emissiveIntensity = 1; } else U.egg.material.emissiveIntensity = 0.08 + (hz >= 0 ? hz * 0.3 : 0); U.cracks.forEach((cm, i) => { const a = [0.2, 0.45, 0.7][i]; cm.material.opacity = hz >= 0 ? 0.95 : Math.max(0, Math.min(1, (p - a) / 0.15)) * 0.9; }); const on = false; U.sk.forEach((m, i) => { m.visible = on; if (on) { const a = t * 2.4 + i * 1.26 + q.ph, r = 0.14 + 0.04 * Math.sin(t * 3 + i), y = 0.14 + ((t * 0.5 + i * 0.2) % 1) * 0.3; m.position.set(Math.cos(a) * r, y, Math.sin(a) * r); m.scale.setScalar(0.022 + 0.012 * Math.sin(t * 7 + i)); } }); } }); } catch (er) { ZOO.lastErr = 'ovo ' + er; }
        try { zIncStep(t, ZOO.eggs.some(q => q.eg.el >= q.eg.tot)); } catch (er) { ZOO.lastErr = 'inc ' + er; }
        try { zFxStep(dt); } catch (er) { ZOO.lastErr = 'fx ' + er; ZOO.fx = []; }
        try { zCineStep(t, dt); } catch (er) { ZOO.lastErr = 'cine ' + er; ZOO.cine = null; }
        ZOO.pt += dt; if (ZOO.pt > 1) { ZOO.pt = 0; try { const hh = (CL.on && CL.root && !CL.visit) ? null : clZooHatch(s); if (hh) { aliveSound('chirp'); clFarmBuzz([18, 30, 18]); if (CL.on && CL.root) zReveal(hh); else clMsg((hh.first ? 'Nova espécie! ' : 'Nasceu: ') + hh.sp.n + ' (' + ZR[hh.sp.rk].n + ')' + (hh.c ? ' · +' + hh.c + ' cristais' : '')); ZOO.sig = ''; clUiSel(); clUiPaint(false); const m = CL.root && CL.root.querySelector('.cl-zmod'); if (m) zRefresh(); }
            const el = CL.sel >= 0 && CL.root && CL.root.querySelector('.cl-zoo-p'); if (el && s.pcs[CL.sel] && s.pcs[CL.sel][0] === 'curral') { const html = clBichosPanelHTML(CL.sel), sg = html.replace(/style="[^"]*"/g, ''); if (sg !== ZOO.psig) { ZOO.psig = sg; const tmp = document.createElement('div'); tmp.innerHTML = html; if (tmp.firstChild && !el.matches(':hover')) el.replaceWith(tmp.firstChild); } } const elInc = CL.sel >= 0 && CL.root && CL.root.querySelector('.cl-incub-panel'); if (elInc && s.pcs[CL.sel] && s.pcs[CL.sel][0] === 'incubadora') { const htmlInc = clIncubadoraPanelHTML(CL.sel), sgInc = htmlInc.replace(/style="[^"]*"/g, ''); if (sgInc !== ZOO.pincsig) { ZOO.pincsig = sgInc; const tmpInc = document.createElement('div'); tmpInc.innerHTML = htmlInc; if (tmpInc.firstChild && !elInc.matches(':hover')) elInc.replaceWith(tmpInc.firstChild); } } if (ZOO.modal && !(CL.root.querySelector('.cl-zmod :hover'))) zRefresh(); clBichosHud(s); zWarm(s);
            if (!CL.visit && !s._cur1) { try { clZooMergeCovil(s); } catch (er) { ZOO.lastErr = 'merge ' + er; } }
            if (!CL.visit && s._cur1 && !s._cred1 && !ZOO.restDone) { try { clZooRestore(s); } catch (er) { ZOO.lastErr = 'restitui ' + er; } }
            if (!CL.visit && s.credit && Date.now() > (ZOO.credT || 0)) { ZOO.credT = Date.now() + 1500; try { clZooCreditPay(s); } catch (er) { ZOO.lastErr = 'credito ' + er; } }
            if (!CL.visit && s._cur1 && !s._inc1 && (s.pcs || []).some(p => p[0] === 'curral')) { try { clZooGiveTree(s); } catch (er) { ZOO.lastErr = 'arvore ' + er; } }
            { const zg = clZooS(s); if (!CL.visit && lay.cur.length && !zg.an.length && !zg.eggs.length && !zg.gift) { zg.gift = 1; ['musgo', 'orvalho'].forEach(id => { zg.an.push({ id: zg.nid++, sp: id, g: ZGROW[0], fed: 4, pr: 0, st: 0, cd: 0, xp: 0, lv: 1 }); zg.book[id] = 1; }); CL.ver++; clSave(true); ZOO.sig = ''; try { clMsg('O Covil recebeu dois dragõezinhos para começar! 🐉'); aliveSound('chirp'); } catch (er) {} } }
            { const z0 = clZooS(s), ids = z0.an.map(a => a.sp).concat(z0.eggs.map(e => e.sp)), cnt = zEnsureModels(ids, false); if (ZOO.mcnt !== cnt) { const first = ZOO.mcnt === undefined; ZOO.mcnt = cnt; if (!first) { ZOO.sig = ''; if (lay.cur.length && cnt % 1000 >= 100 && !ZOO.barnDone) { ZOO.barnDone = true; CL3.need = true; } if (lay.cur.length && cnt >= 1000 && !ZOO.nestDone) { ZOO.nestDone = true; CL3.need = true; } } } } } catch (er) {} }
    }
    function zLayHTML(eg, info) {
        return '';
    }
    function zHatHud(s, dock) {
        let h = dock.querySelector('.cl-zhat'); const z = clZooS(s), lay = clZooLayout(s), n = CL.visit ? 0 : z.eggs.filter(e => e.el >= e.tot).length, room = z.an.length < lay.slots, busy = ZOO.eggs.some(q => q.hat > 0);
        if (!n || !room || busy) { if (h) h.remove(); return; } if (!h) { h = document.createElement('button'); h.type = 'button'; h.className = 'cl-zhv cl-zhat'; h.dataset.cl = 'zoo-hatch'; dock.insertBefore(h, dock.firstChild); }
        const eg = z.eggs.find(e => e.el >= e.tot), spE = eg ? (zsp(eg.sp) || ZSP[0]) : ZSP[0], sg = n + ':' + spE.id; if (h.dataset.sg !== sg) { h.dataset.sg = sg; h.innerHTML = '<span class="cl-fhi">' + zEggSVG(ZR[spE.rk].col, ZEL[spE.el].col, true, spE.id) + '<u>' + n + '</u></span><small class="ab-lb">Chocar</small><span class="cl-fht"><b>Chocar ovo!</b><small>Um dragão misterioso está pronto para nascer</small></span><i class="ph-bold ph-caret-right cl-fhg"></i>'; }
    }
    function zDuelHud(s, dock) {
        const host = CL.root || dock;
        let h = null;
        if (host && host.children) { for (let i = 0; i < host.children.length; i++) { const c = host.children[i]; if (c.classList && c.classList.contains('cl-zduel-dock')) { h = c; break; } } }
        if (!h && dock) h = dock.querySelector('.cl-zduel-dock');
        const z = clZooS(s);
        if (CL.visit || !z.an || !z.an.length) { if (h) h.remove(); return; }
        if (h && h.parentNode !== host) host.appendChild(h);
        if (!h) {
            h = document.createElement('button');
            h.type = 'button';
            h.className = 'cl-zhv cl-zduel-dock';
            h.dataset.cl = 'zoo-colony-arena';
            h.setAttribute('aria-label', 'Duelos');
            h.style.background = 'linear-gradient(135deg, #ff5e36, #c0392b)';
            h.style.boxShadow = '0 0 0 2px rgba(255,220,120,.8), 0 8px 24px rgba(200,40,20,.45)';
            h.style.color = '#fff';
            let opened = 0;
            const open = ev => {
                ev.preventDefault(); ev.stopPropagation();
                if (performance.now() - opened < 450) return;
                opened = performance.now();
                clOpenColonyArena();
            };
            h.addEventListener('pointerdown', ev => { ev.stopPropagation(); });
            h.addEventListener('pointerup', open);
            h.addEventListener('click', open);
            host.appendChild(h);
        }
        const sg = 'duel:' + z.an.length;
        if (h.dataset.sg !== sg) {
            h.dataset.sg = sg;
            h.innerHTML = '<span class="cl-fhi" style="background:rgba(255,255,255,.22)"><i class="ph-bold ph-shield-checkered" style="color:#fff"></i></span><span class="cl-fht"><b>Duelos</b><small style="color:rgba(255,255,255,.88)">' + z.an.length + ' dragões prontos para o combate</small></span><i class="ph-bold ph-caret-right cl-fhg" style="color:#fff"></i>';
        }
    }
    function clBichosHud(s) {   /* botões rápidos no dock inferior: duelos, chocadeira e coleta */
        const dock = CL.root && CL.root.querySelector('.cl-dock'); if (!dock) return;
        zHatHud(s, dock);
        zDuelHud(s, dock);
        let el = dock.querySelector('.cl-zhv:not(.cl-zhat):not(.cl-zduel-dock)'), n = 0; if (!CL.visit) clZooS(s).an.forEach(a => { if ((a.st || 0) > 0) n++; });
        if (!n) { if (el) el.remove(); return; } if (!el) { el = document.createElement('button'); el.type = 'button'; el.className = 'cl-zhv'; el.dataset.cl = 'zoo-collect'; dock.insertBefore(el, dock.firstChild); }
        const sg = String(n); if (el.dataset.sg !== sg) { el.dataset.sg = sg; el.innerHTML = '<span class="cl-fhi"><i class="ph-fill ph-egg"></i><u>' + n + '</u></span><small class="ab-lb">Dragões</small><span class="cl-fht"><b>Coletar dragões</b><small>' + n + (n > 1 ? ' produtos prontos' : ' produto pronto') + '</small></span><i class="ph-bold ph-caret-right cl-fhg"></i>'; }
    }
    window.ruaZoo = { evoStar: (id, st) => { const a = clZooS(clS()).an.find(x => x.sp === id) || { sp: id, lv: 3 }; zEvoCine(a, zAL(a), { star: st || 3, from: (st || 3) - 1 }); }, evo: (id, lv) => { const a = clZooS(clS()).an.find(x => x.sp === id) || { sp: id, lv: lv || 2 }; zEvoCine(Object.assign({}, a, { lv: lv || zAL(a) }), (lv || zAL(a)) - 1); }, rar: () => ZOO.list.filter(q => q.B && q.B.dragon).map(q => ({ sp: q.a && q.a.sp, orb: q.B.orb ? q.B.orb.length : -1, beam: !!q.B.beam, wave: !!q.B.wave, vis: q.g.visible })), tap: (x, y) => clBichosTap(x, y), reacting: () => ZOO.list.filter(e => e.rt > 0).length, book: () => zBookHTML().length, open: k => zOpen(k), ach: id => clZooAch(id), head: () => ZOO.list.map(e => { if (!e.wp) return '-'; const T = clTh(), p0 = e.wp.clone(); const fw = new T.Vector3(); const out = []; for (let i = 0; i < 8; i++) { clBichosStep(0.1, (ZOO.tcur || 0) + 0.1); const v = e.wp.clone().sub(p0); p0.copy(e.wp); fw.set(1, 0, 0).applyQuaternion(e.pv ? e.g.quaternion : e.g.quaternion); fw.y = 0; v.y = 0; fw.normalize(); const sp = v.length() / 0.1; v.normalize(); out.push(fw.dot(v).toFixed(2) + '@' + sp.toFixed(2)); } return e.a.sp + ' ' + out.join(' '); }), span: () => ZOO.list.map(e => { if (!e.B.pv) return '-'; const m = e.B.pv.children[0], out = []; for (let i = 0; i < 12; i++) { e.B.mixer.update(0.25); const b = zPosedBox(m), sz = b.getSize(new (clTh().Vector3)()); out.push(Math.max(sz.x, sz.z).toFixed(2) + '/' + sz.y.toFixed(2)); } return e.a.sp + ': ' + out.join(' '); }), boneMove: () => ZOO.list.map(e => { if (!e.B.pv) return '-'; const bs = []; e.B.pv.traverse(o => { if (o.isBone) bs.push(o); }); const q0 = bs.map(b => b.quaternion.clone()); clBichosStep(0.1, (ZOO.tcur || 0) + 0.1); let d = 0; bs.forEach((b, i) => { d += Math.abs(b.quaternion.x - q0[i].x) + Math.abs(b.quaternion.y - q0[i].y) + Math.abs(b.quaternion.z - q0[i].z); }); return e.a.sp + ':bones' + bs.length + ':move' + d.toFixed(3); }), land: () => ZOO.list.map(e => { if (e.B.dragon && e.B.canWalk) e.next = -1; return e.sp0 || e.a.sp + ':' + !!e.B.canWalk + ':' + e.m; }), modes: () => ZOO.list.map(e => e.a.sp + ':' + e.m + ':' + (e.wp ? e.wp.y.toFixed(2) : '-') + ':foot' + (e.B.footG || 0).toFixed(2) + ':s0' + e.s0.toFixed(2) + ':k' + (e.B.pv ? e.B.pv.scale.x.toFixed(4) : '-') + ':tm' + (e.B.mixer ? e.B.mixer.time.toFixed(2) : '-') + ':anim' + farmLod().anim + ':act' + (e.B.act && e.B.act.cur ? e.B.act.cur.isRunning() + '/' + e.B.act.cur.getEffectiveWeight().toFixed(2) : '-')), egg: id => zEggImg(id), eggTex: id => !!zEggTex(id), eggs3d: () => ZOO.eggs.map(q => ({ sp: q.eg.sp, p: q.eg.el / q.eg.tot, hat: q.hat, gone: !!q.gone, vis: q.g.visible, pos: q.g.position.toArray().map(v => +v.toFixed(2)), sc: +q.g.scale.x.toFixed(2), gp: (function () { const T3 = clTh(), v = new T3.Vector3(); q.pa.grp.getWorldPosition(v); return v.toArray().map(x => +x.toFixed(2)); })(), gs: +q.pa.grp.getWorldScale(new (clTh().Vector3)()).x.toFixed(2) })), hatchNow: () => { const e = ZOO.eggs.find(q => q.eg.el >= q.eg.tot); if (e) e.hat = (ZOO.tcur || 0) + 0.0001; return !!e; }, sim: (n, dt) => { let mind = 9, maxOv = 0, oob = 0; for (let i = 0; i < n; i++) { clBichosStep(dt, i * dt); ZOO.list.forEach(e => { if (e.x < zBounds.x0 - 0.01 || e.x > zBounds.x1 + 0.01 || e.z < zBounds.z0 - 0.01 || e.z > zBounds.z1 + 0.01) oob++; ZOO.list.forEach(o => { if (o !== e) { const d = Math.hypot(e.x - o.x, e.z - o.z), m = (e.rad || 0) + (o.rad || 0); mind = Math.min(mind, d); maxOv = Math.max(maxOv, m - d); } }); }); } return { mind: +mind.toFixed(2), maxOverlap: +maxOv.toFixed(3), oob, rad: ZOO.list.map(e => +(e.rad || 0).toFixed(2)) }; }, diag: () => { const s = clS(), z = clZooS(s), lay = clZooLayout(s); return { curral: lay.cur.map(c => ({ pi: c.pi, nivel: c.L, vagas: c.n })), bichos: z.an.length, adultos: z.an.filter(zAdult).length, ovos: z.eggs.length, pastos: ZOO.pastures.length, pastosNaCena: ZOO.pastures.filter(p => zIn(p.grp)).length, desenhados: ZOO.list.length, modelos: Object.keys(ZMD).filter(id => zModelOk(ZMD[id].f)).length, erro: String(window.__zerr || '') + (ZOO.lastErr ? ' · ' + ZOO.lastErr : '') }; }, portrait: id => zPortrait(id), ensure: all => zEnsureModels(clZooS(clS()).an.map(a => a.sp), !!all), clearPortraits: () => { ZPT.cache = {}; }, mdl: () => Object.keys(ZMD).filter(id => zModelOk(ZMD[id].f)), reveal: h => zReveal(h), levelUp: clZooLevelUp, colBonus: () => clZooColBonus(clS()), need: zXpNeed, lvcost: zLvCost, dbg: () => ZOO.list.map(e => { const T = clTh(), v = new T.Vector3(); e.g.getWorldPosition(v); let up = e.g, n = 0, inScene = false; while (up) { n++; if (up === CL3.sc) inScene = true; up = up.parent; } return { sp: e.a.sp, x: +e.x.toFixed(2), z: +e.z.toFixed(2), w: [v.x, v.y, v.z].map(q => +q.toFixed(2)), vis: e.g.visible, inScene, sc: e.g.scale.x }; }), pas: () => ZOO.pastures.map(p => ({ pi: p.pi, inScene: (() => { let u = p.grp; while (u) { if (u === CL3.sc) return true; u = u.parent; } return false; })(), wp: (() => { const v = new (clTh().Vector3)(); p.grp.getWorldPosition(v); return [v.x, v.y, v.z].map(q => +q.toFixed(2)); })() })), box: id => { const T = clTh(), B = zBuild(zsp(id), true); B.g.updateMatrixWorld(true); const b = new T.Box3().setFromObject(B.g), h = B.P.head ? new T.Box3().setFromObject(B.P.head) : null; const r = v => [+v.x.toFixed(2), +v.y.toFixed(2), +v.z.toFixed(2)]; return { min: r(b.min), max: r(b.max), head: h ? r(h.getCenter(new T.Vector3())) : null, n: (function c(o) { let k = 1; o.children.forEach(q => { k += c(q); }); return k; })(B.g) }; }, state: () => clZooS(), layout: () => clZooLayout(clS()), buy: clZooBuy, breed: clZooBreed, collect: clZooCollect, feed: clZooFeed, hatch: () => clZooHatch(clS()), species: ZSP, info: clZooBreedInfo, list: () => ZOO.list.length, eggs: () => ZOO.eggs.length, ff: min => { const s = clS(); clBichosGrow(s, min * 60, 0); CL.ver++; } };
    if (window.ruaDev) { window.ruaZoo.devSeed = function () { const z = clZooS(); if (!z || !z.an) return false; if (z.an.some(a => a.dev)) return true; z.nid = z.nid || 1; z.book = z.book || {}; ZSP.forEach(sp => { z.an.push({ id: z.nid++, sp: sp.id, g: 0, fed: 2, pr: 0, st: 0, cd: 0, xp: 0, lv: 10, star: 3, dev: 1 }); z.book[sp.id] = 1; }); CL.ver++; return true; }; let devTry = 0; const devT = setInterval(() => { try { if (window.ruaZoo.devSeed() || ++devTry > 120) clearInterval(devT); } catch (e) { if (++devTry > 120) clearInterval(devT); } }, 500); }   /* ?dev=1 (localhost): 1 de cada dragão, nível 10, 3 estrelas */

    /* ---------- a construção: celeiro vermelho feito por código, silo, fardos, placa, pasto cercado e os bichos ---------- */
    const CLM_CUR_FILES = ['fp_hay.glb', 'fp_crates_veg.glb', 'fp_cart.glb', 'zoo/barn.glb', 'castelo1.glb', 'castelo2.glb'].concat(ZLAIR);
    function zSignTex(txt) {
        const cv = document.createElement('canvas'); cv.width = 256; cv.height = 96; const g = cv.getContext('2d'); g.fillStyle = '#7a4a22'; g.fillRect(0, 0, 256, 96); g.strokeStyle = '#d9a35a'; g.lineWidth = 6; g.strokeRect(6, 6, 244, 84);
        g.fillStyle = '#fff3d0'; g.font = 'bold 54px Georgia,serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 128, 52); const t = new (clTh().CanvasTexture)(cv); try { t.encoding = clTh().sRGBEncoding; } catch (e) {} return t;
    }
    function zBarn(grp, level) {
        const T = clTh(), G = zG(), add = (geo, mat, sx, sy, sz, x, y, z, ry, par) => { const m = new T.Mesh(geo, mat); m.scale.set(sx, sy, sz); m.position.set(x, y, z); if (ry) m.rotation.y = ry; (par || grp).add(m); return m; };
        const red = zMat('#e03a2e'), red2 = zMat('#b82a22'), white = zMat('#fff6e6'), roof = zMat('#4a6fd0'), roof2 = zMat('#355ab8'), stone = zMat('#a9afb8'), gold = zMat('#ffd23a', '#aa7a00'), wood = zMat('#9a5a2a');
        const cx = -1.78, W = 1.1, D = 1.5, H = 0.62;   /* corpo: W ao longo de x, D ao longo de z */
        add(G.box, stone, W + 0.1, 0.07, D + 0.1, cx, 0.035, 0);
        add(G.box, red, W, H, D, cx, 0.07 + H / 2, 0);
        [-1, 1].forEach(sx => [-1, 1].forEach(sz => add(G.box, white, 0.055, H + 0.02, 0.055, cx + sx * (W / 2), 0.07 + H / 2, sz * (D / 2))));   /* quinas brancas */
        add(G.box, white, W + 0.02, 0.035, D + 0.02, cx, 0.07 + H, 0);   /* friso do topo */
        /* frente (+x): portão grande com X branco */
        const fx = cx + W / 2 + 0.012; add(G.box, white, 0.03, 0.46, 0.64, fx, 0.07 + 0.23, 0); add(G.box, red2, 0.04, 0.42, 0.28, fx + 0.01, 0.07 + 0.21, -0.15); add(G.box, red2, 0.04, 0.42, 0.28, fx + 0.01, 0.07 + 0.21, 0.15);
        [-1, 1].forEach(sd => { [-1, 1].forEach(sg => { const b = add(G.box, white, 0.045, 0.5, 0.032, fx + 0.025, 0.07 + 0.21, sd * 0.15); b.rotation.x = sg * 0.62; b.scale.y = 0.46; }); });
        /* frontão (triângulo) + janela do sótão */
        const sh = new T.Shape(); sh.moveTo(-D / 2, 0); sh.lineTo(D / 2, 0); sh.lineTo(0, 0.42); sh.lineTo(-D / 2, 0); const eg = new T.ExtrudeGeometry(sh, { depth: 0.02, bevelEnabled: false }), gab = new T.Mesh(eg, red); gab.rotation.y = Math.PI / 2; gab.position.set(cx + W / 2, 0.07 + H, 0.0); gab.position.z = 0; grp.add(gab);
        const gab2 = new T.Mesh(eg, red); gab2.rotation.y = Math.PI / 2; gab2.position.set(cx - W / 2 - 0.02, 0.07 + H, 0); grp.add(gab2);
        add(G.box, white, 0.04, 0.17, 0.17, fx + 0.04, 0.07 + H + 0.14, 0); add(G.box, zMat('#ffe06a', '#ffb000'), 0.045, 0.12, 0.12, fx + 0.05, 0.07 + H + 0.14, 0);
        /* telhado: duas águas, azul, com cumeeira dourada */
        [-1, 1].forEach(sd => { const sl = add(G.box, sd > 0 ? roof : roof2, W + 0.16, 0.045, 0.98, cx, 0.07 + H + 0.23, sd * 0.37); sl.rotation.x = sd * 0.5; sl.position.y = 0.07 + H + 0.2; });
        add(G.box, gold, W + 0.2, 0.045, 0.06, cx, 0.07 + H + 0.43, 0);
        /* catavento */
        add(G.leg, gold, 0.015, 0.22, 0.015, cx + 0.1, 0.07 + H + 0.66, 0); const vane = add(G.cone, zMat('#ff3a2a', '#aa1a10'), 0.1, 0.07, 0.02, cx + 0.1, 0.07 + H + 0.62, 0); vane.rotation.z = -Math.PI / 2; add(G.sp, gold, 0.045, 0.045, 0.045, cx + 0.1, 0.07 + H + 0.46, 0);
        /* placa com o nome */
        const sg = new T.Mesh(G.box, new T.MeshLambertMaterial({ map: zSignTex('CURRAL'), emissive: new T.Color('#553311') })); sg.scale.set(0.03, 0.12, 0.34); sg.position.set(fx + 0.05, 0.07 + 0.52, 0); grp.add(sg);
        [-1, 1].forEach(sd => add(G.leg, wood, 0.012, 0.07, 0.012, fx + 0.04, 0.07 + 0.6, sd * 0.13));
        /* fardos de feno, vasos de flor e lanternas crescem com o nível */
        const bale = (x, z, ry) => { const b = add(G.leg, zMat('#f0c040'), 0.2, 0.2, 0.2, x, 0.2, z); b.rotation.z = Math.PI / 2; b.rotation.y = ry || 0; add(G.leg, zMat('#d8a020'), 0.205, 0.012, 0.205, x, 0.12, z).rotation.z = Math.PI / 2; };
        bale(cx + W / 2 + 0.2, 0.52, 0.2); if (level >= 2) bale(cx + W / 2 + 0.22, -0.55, -0.3); if (level >= 3) bale(cx + W / 2 + 0.4, 0.62, 0.5);
        [['#ff4aa8', 0.34], ['#ffe04a', -0.34]].forEach(pt => { add(G.leg, zMat('#c8683a'), 0.07, 0.07, 0.07, fx + 0.1, 0.1, pt[1]); add(G.sp, zMat(pt[0], pt[0]), 0.09, 0.07, 0.09, fx + 0.1, 0.12, pt[1]); });
        if (level >= 3) { /* silo */
            const sx = cx - 0.1, sz = -0.98 + 0.0; add(G.leg, zMat('#d6dee8'), 0.32, 0.9, 0.32, cx - 0.2, 0.9 + 0.07, -0.88); add(G.sp, zMat('#ff6a3a'), 0.34, 0.26, 0.34, cx - 0.2, 0.96 + 0.07, -0.88);
            [0.25, 0.5, 0.75].forEach(y => add(G.leg, zMat('#8a96a8'), 0.335, 0.015, 0.335, cx - 0.2, 0.07 + y, -0.88)); }
        if (level >= 4) [-1, 1].forEach(sd => { add(G.leg, wood, 0.02, 0.4, 0.02, fx + 0.35, 0.4, sd * 0.95); add(G.sp, zMat('#fff0a0', '#ffc830'), 0.07, 0.07, 0.07, fx + 0.35, 0.43, sd * 0.95); });
        if (level >= 5) { const fl = zMat('#ff5ac8', '#aa1a80'); for (let i = 0; i < 6; i++) add(G.sp, zMat(['#ff5ac8', '#ffe04a', '#ffffff', '#ff8a3a', '#a05aff', '#5ac8ff'][i], null), 0.06, 0.06, 0.06, cx - 0.4 + i * 0.16, 0.1, 0.84); }
    }
    /* ---------- Covil dos Dragões: torres de pedra, muralha baixa, portão, tochas e pedras (modelos Quaternius, CC0) ---------- */
    const zLairOk = () => ZLAIR.every(zModelOk);
    function zLairPiece(par, name, size, x, y, z, yaw, ys) {
        const T = clTh(), tpl = CLM.tpl['lair/' + name + '.glb']; if (!tpl || !tpl.gl) return null; const m = tpl.gl.scene.clone(true); ZOO.lmat = ZOO.lmat || {}; const IDX = { PointyTower: ['LightRock', 'Black', 'Celing', 'DarkRock'], LargeSquareTowerBricks: ['LightRock', 'Black', 'DarkRock'], LargeTower: ['LightRock'], WallBricks: ['LightRock', 'DarkRock'], WallEntranceBricks: ['LightRock', 'DarkRock'], Banner: ['LightWood', 'Banner'], Torch: ['Wood', 'DarkSteel', 'Fire'] };
        const COL = { LightRock: '#8e99aa', 'LightRock.001': '#8e99aa', DarkRock: '#5c6678', 'DarkRock.001': '#5c6678', Black: '#1e1814', 'Black.001': '#1e1814', Celing: '#8e2f20', 'Celing.001': '#8e2f20', LightWood: '#9a6a3a', Banner: '#b8322a', Rock: '#7c776f', Green: '#3f8a2e', Wood: '#6a3f22', Fire: '#ff7a1a', DarkSteel: '#2a2a2e', RockLight: '#a39a8a' };
        let mi = 0; const fix = mt => { if (!ZOO.lmat[name + ':' + mt.uuid]) { const c = mt.clone(); const nm = (COL[mt.name] ? mt.name : (IDX[name] || [])[mi] || mt.name); mi++; const k = COL[nm]; if (k && c.color) { c.color.set(k); if (nm !== 'Fire') c.color.multiplyScalar(0.6); } if (c.emissive && c.color) { c.emissive.copy(c.color).multiplyScalar(nm === 'Fire' ? 1.2 : 0.03); } c.flatShading = true;
            if (/Rock/.test(nm)) {   /* pedra de verdade: tijolos com argamassa e variação por tijolo (os modelos não têm UV, então o padrão vem da posição) */
                c.roughness = 0.92; c.envMapIntensity = 0.35; const dk = nm.indexOf('Dark') === 0 ? 1 : 0; c.color.multiplyScalar(1.05);
                c.onBeforeCompile = sh => { sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vLp;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvLp = (modelMatrix * vec4(position, 1.0)).xyz;'); sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vLp;\nfloat lh(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}').replace('#include <color_fragment>', '#include <color_fragment>\n{float rh=0.15;float row=floor(vLp.y/rh);float u=(abs(vLp.x)>abs(vLp.z)?vLp.z:vLp.x)*1.0+row*0.37;float bw=0.42;float col=floor(u/bw);float fx=fract(u/bw),fy=fract(vLp.y/rh);float m=smoothstep(0.0,0.07,fx)*smoothstep(0.0,0.07,1.0-fx)*smoothstep(0.0,0.12,fy)*smoothstep(0.0,0.12,1.0-fy);float v=lh(vec2(col,row));diffuseColor.rgb*=mix(0.5,1.0,m)*(0.85+0.4*v);float lu=dot(diffuseColor.rgb,vec3(0.3,0.59,0.11));diffuseColor.rgb=mix(vec3(lu),diffuseColor.rgb,1.35);float ms=smoothstep(0.75,0.0,vLp.y+0.1)*(0.45+0.4*lh(vec2(floor(vLp.x*3.0),floor(vLp.z*3.0))));diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.22,0.42,0.16),ms*0.7);diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(1.12,1.0,0.86),v*0.6);}'); }; c.customProgramCacheKey = () => 'lairstone';
            }
            ZOO.lmat[name + ':' + mt.uuid] = c; } return ZOO.lmat[name + ':' + mt.uuid]; };
        const isMajor = /Tower|Arch/.test(name);
        m.traverse(o => {
            if (!o.isMesh) return;
            o.castShadow = isMajor;
            o.receiveShadow = true;
            if (o.geometry && !o.geometry.boundingSphere) o.geometry.computeBoundingSphere();
            o.frustumCulled = true;
            o.material = Array.isArray(o.material) ? o.material.map(fix) : fix(o.material);
        });
        const pv = new T.Group(); pv.add(m); pv.updateMatrixWorld(true); let bb = new T.Box3().setFromObject(pv); const sz = bb.getSize(new T.Vector3()); pv.scale.setScalar(size / Math.max(sz.x, sz.y, sz.z, 1e-6)); pv.updateMatrixWorld(true); bb = new T.Box3().setFromObject(pv); const ct = bb.getCenter(new T.Vector3()); pv.position.set(-ct.x, -bb.min.y, -ct.z);
        const h = new T.Group(); h.add(pv); h.position.set(x, y, z); h.rotation.y = yaw || 0; par.add(h); return { h, h0: bb.max.y - bb.min.y };
    }
    function zLair(grp, level) {
        const lv = Math.max(1, Math.min(5, level | 0)); let top = 2.4;
        const X0 = -0.35, X1 = 2.47, Z0 = -1.46, Z1 = 1.46, wy = (w) => 0.55 * 0.95 / w;
        const T = clTh(), G = zG();

        /* 4 Torres Medievais nos 4 cantos da Arena */
        zLairPiece(grp, 'LargeTower', 2.4, -0.62, 0, -1.45, 0);
        zLairPiece(grp, 'PointyTower', 2.1, -0.62, 0, 1.45, 0.3);
        zLairPiece(grp, 'LargeSquareTowerBricks', 2.2, 2.35, 0, -1.35, -0.3);
        zLairPiece(grp, 'PointyTower', 2.1, 2.35, 0, 1.35, 0.5);

        /* Estandartes de Combate medievais no portão */
        zLairPiece(grp, 'Banner', 1.05, -0.42, 0, -1.15, Math.PI / 2);
        zLairPiece(grp, 'Banner', 1.05, -0.42, 0, 1.15, Math.PI / 2);

        /* Muralhas de Pedra ao redor da Arena */
        [0.15, 1.1, 2.05].forEach(x => {
            zLairPiece(grp, 'WallBricks', 0.95, x, 0, Z0, 0, 0.55);
            zLairPiece(grp, 'WallBricks', 0.95, x, 0, Z1, 0, 0.55);
        });
        [-0.95, 0, 0.95].forEach(z => zLairPiece(grp, 'WallBricks', 0.95, X1, 0, z, Math.PI / 2, 0.55));
        [-1.23, 1.23].forEach(z => zLairPiece(grp, 'WallBricks', 0.46, X0, 0, z, Math.PI / 2, wy(0.46)));

        /* Portão da Arena: Arco de Pedra Imponente */
        zLairPiece(grp, 'Arch', 2.3, X0, 0, 0, Math.PI / 2, 0.85);

        /* Tochas com fogo nos pilares e esquinas */
        [[X0 - 0.1, -1.08], [X0 - 0.1, 1.08], [X1, Z0], [X1, Z1], [X1, 0]].forEach(c => {
            zLairPiece(grp, 'Torch', 0.6, c[0], 0, c[1], 0);
        });

        /* Piso da Arena Medieval: Círculo de Combate em Pedra & Areia */
        const pitGeo = new T.CylinderGeometry(1.45, 1.5, 0.04, 20);
        const pitMat = new T.MeshStandardMaterial({ color: '#524332', roughness: 0.92, metalness: 0.05 });
        const pit = new T.Mesh(pitGeo, pitMat);
        pit.position.set(0.9, 0.02, 0);
        pit.receiveShadow = true;
        grp.add(pit);

        /* Círculo Rúnico no chão da arena */
        const runeGeo = new T.RingGeometry(0.85, 0.95, 24);
        const runeMat = new T.MeshBasicMaterial({ color: '#e8a33d', transparent: true, opacity: 0.45, side: T.DoubleSide });
        const rune = new T.Mesh(runeGeo, runeMat);
        rune.rotation.x = Math.PI / 2;
        rune.position.set(0.9, 0.045, 0);
        grp.add(rune);

        /* ---------- A MAJESTOSA ESTÁTUA DO DRAGÃO ---------- */
        /* Posicionada em um pedestal de pedra elevado no fundo da arena */
        const stX = 1.95, stZ = 0;
        const pedGeo = new T.CylinderGeometry(0.48, 0.58, 0.42, 12);
        const stStoneMat = new T.MeshStandardMaterial({
            color: '#4a5058',
            roughness: 0.85,
            metalness: 0.2
        });
        const ped = new T.Mesh(pedGeo, stStoneMat);
        ped.position.set(stX, 0.21, stZ);
        ped.castShadow = true;
        ped.receiveShadow = true;
        grp.add(ped);

        const pedBase = new T.Mesh(new T.CylinderGeometry(0.62, 0.68, 0.12, 12), stStoneMat);
        pedBase.position.set(stX, 0.06, stZ);
        pedBase.castShadow = true;
        grp.add(pedBase);

        const dragonStatue = new T.Group();
        dragonStatue.position.set(stX, 0.42, stZ);
        dragonStatue.rotation.y = -Math.PI / 2;

        const stTorso = new T.Mesh(new T.SphereGeometry(0.24, 10, 8), stStoneMat);
        stTorso.scale.set(0.8, 1.4, 0.9);
        stTorso.rotation.x = -0.45;
        stTorso.position.set(0, 0.22, 0.05);
        stTorso.castShadow = true;
        dragonStatue.add(stTorso);

        [-0.14, 0.14].forEach(sd => {
            const leg = new T.Mesh(new T.CylinderGeometry(0.06, 0.09, 0.22, 8), stStoneMat);
            leg.position.set(sd, 0.08, -0.04);
            leg.rotation.x = 0.3;
            dragonStatue.add(leg);
            const talon = new T.Mesh(new T.BoxGeometry(0.08, 0.04, 0.12), stStoneMat);
            talon.position.set(sd, 0.02, 0.05);
            dragonStatue.add(talon);
        });

        [-0.12, 0.12].forEach(sd => {
            const arm = new T.Mesh(new T.CylinderGeometry(0.04, 0.05, 0.18, 6), stStoneMat);
            arm.position.set(sd, 0.34, 0.16);
            arm.rotation.x = -0.7;
            arm.rotation.z = sd * 0.3;
            dragonStatue.add(arm);
        });

        const stNeck = new T.Mesh(new T.CylinderGeometry(0.09, 0.13, 0.26, 8), stStoneMat);
        stNeck.position.set(0, 0.42, 0.14);
        stNeck.rotation.x = -0.65;
        dragonStatue.add(stNeck);

        const stHead = new T.Mesh(new T.SphereGeometry(0.12, 8, 6), stStoneMat);
        stHead.scale.set(0.9, 0.85, 1.3);
        stHead.position.set(0, 0.54, 0.28);
        dragonStatue.add(stHead);

        const stSnout = new T.Mesh(new T.BoxGeometry(0.1, 0.07, 0.14), stStoneMat);
        stSnout.position.set(0, 0.52, 0.38);
        dragonStatue.add(stSnout);

        [-0.07, 0.07].forEach(sd => {
            const horn = new T.Mesh(new T.ConeGeometry(0.032, 0.24, 6), stStoneMat);
            horn.position.set(sd, 0.65, 0.22);
            horn.rotation.x = -0.75;
            horn.rotation.z = sd * 0.35;
            dragonStatue.add(horn);
        });

        for (let i = 0; i < 5; i++) {
            const spine = new T.Mesh(new T.ConeGeometry(0.025, 0.08, 5), stStoneMat);
            spine.position.set(0, 0.48 - i * 0.07, 0.18 - i * 0.06);
            spine.rotation.x = -0.8;
            dragonStatue.add(spine);
        }

        const stTail = new T.Mesh(new T.TorusGeometry(0.24, 0.04, 6, 16, Math.PI * 1.2), stStoneMat);
        stTail.rotation.x = Math.PI / 2;
        stTail.position.set(0, 0.04, -0.16);
        dragonStatue.add(stTail);

        [-1, 1].forEach(sd => {
            const wing = new T.Group();
            wing.position.set(sd * 0.08, 0.36, 0.02);
            const wingBone = new T.Mesh(new T.CylinderGeometry(0.03, 0.04, 0.42, 6), stStoneMat);
            wingBone.position.set(sd * 0.18, 0.18, 0);
            wingBone.rotation.z = -sd * 0.85;
            wing.add(wingBone);

            const wingMem = new T.Mesh(new T.BoxGeometry(0.34, 0.38, 0.02), stStoneMat);
            wingMem.position.set(sd * 0.22, 0.14, -0.04);
            wingMem.rotation.z = -sd * 0.45;
            wingMem.rotation.y = sd * 0.25;
            wing.add(wingMem);

            const tip = new T.Mesh(new T.ConeGeometry(0.025, 0.12, 5), stStoneMat);
            tip.position.set(sd * 0.34, 0.36, 0);
            tip.rotation.z = -sd * 1.2;
            wing.add(tip);

            dragonStatue.add(wing);
        });

        const brazier = new T.Mesh(new T.CylinderGeometry(0.14, 0.08, 0.14, 8), stStoneMat);
        brazier.position.set(0, 0.07, 0.32);
        dragonStatue.add(brazier);

        const flame = new T.Sprite(new T.SpriteMaterial({
            map: zSoftTex(),
            color: '#ff8a20',
            transparent: true,
            opacity: 0.85,
            blending: T.AdditiveBlending
        }));
        flame.scale.set(0.35, 0.45, 1);
        flame.position.set(0, 0.22, 0.32);
        dragonStatue.add(flame);

        grp.add(dragonStatue);
        grp.userData.roof = { x: -0.62, y: top };
    }
    function zBarnModel(grp, level) {   /* celeiro de verdade (Quaternius, CC0): porta virada para o pasto; ajusta ao terreno 3x2 */
        if (!zModelOk('zoo/barn.glb')) return false;
        try {
            const T = clTh(), tpl = CLM.tpl['zoo/barn.glb'], m = tpl.gl.scene.clone(true); m.traverse(o => { if (!o.isMesh) return; o.castShadow = true; o.receiveShadow = true; const arr = Array.isArray(o.material), ms = arr ? o.material : [o.material], nm = ms.map(mt => { const c = mt.clone(); if (c.emissive && c.color) c.emissive.copy(c.color).multiplyScalar(0.22); return c; }); o.material = arr ? nm : nm[0]; });
            const pv = new T.Group(); pv.add(m); pv.rotation.y = Math.PI / 2; pv.updateMatrixWorld(true); let bb = new T.Box3().setFromObject(pv), sz = bb.getSize(new T.Vector3()); const k = Math.min(2.2 / sz.x, 2.8 / sz.z); pv.scale.setScalar(k); pv.updateMatrixWorld(true); bb = new T.Box3().setFromObject(pv); const ct = bb.getCenter(new T.Vector3()); pv.position.set(-2.5 + (bb.max.x - bb.min.x) / 2 + 0.03 - ct.x, -bb.min.y, -ct.z); grp.add(pv);
            const sg = new T.Mesh(zG().box, new T.MeshLambertMaterial({ map: zSignTex('CURRAL'), emissive: new T.Color('#553311') })); sg.scale.set(0.03, 0.14, 0.4); sg.position.set(-2.5 + (bb.max.x - bb.min.x) + 0.06, (bb.max.y - bb.min.y) * 0.5, 0); sg.scale.set(0.04, 0.2, 0.55); grp.add(sg); grp.userData.roof = { x: -2.5 + 0.03 + (bb.max.x - bb.min.x) / 2, y: bb.max.y - bb.min.y };
            return true;
        } catch (e) { return false; }
    }
    function zCastle(grp, level) {   /* Castelo Medieval do Covil: escala matemática rigorosa contida no lote 5x3 */
        const T = clTh(), f = 'castelo1.glb', tpl = CLM.tpl[f]; if (!tpl || !tpl.gl) return false;
        const m = tpl.gl.scene.clone(true);
        m.traverse(o => {
            if (/collider/i.test(o.name || '') || (o.material && /collider/i.test(o.material.name || ''))) {
                o.visible = false;
            } else if (o.isMesh) {
                o.castShadow = !ZOO.lite; o.receiveShadow = !ZOO.lite; o.frustumCulled = true;
                (Array.isArray(o.material) ? o.material : [o.material]).forEach(mt => {
                    if (mt && mt.color) { mt.roughness = 0.88; mt.metalness = 0.05; }
                });
            }
        });
        const pv = new T.Group(); pv.add(m);
        pv.updateMatrixWorld(true);
        const bb0 = new T.Box3();
        pv.traverse(o => { if (o.isMesh && o.visible && o.geometry) { bb0.expandByObject(o); } });
        let sz = bb0.getSize(new T.Vector3());
        if (sz.x === 0 || sz.z === 0) sz = new T.Vector3(1, 1, 1);

        // Orienta a maior extensão do modelo com o comprimento de 5 tiles (eixo X)
        if (sz.x < sz.z) {
            pv.rotation.y = Math.PI / 2;
            pv.updateMatrixWorld(true);
            bb0.makeEmpty();
            pv.traverse(o => { if (o.isMesh && o.visible && o.geometry) { bb0.expandByObject(o); } });
            sz = bb0.getSize(new T.Vector3());
        }

        // Limites estritos do lote 5x3: largura máxima 4.6 (em 5.0) e profundidade máxima 2.6 (em 3.0)
        // Isso garante margem livre de 0.2 tiles em todos os 4 lados, sem nunca engolir nenhuma estrutura vizinha!
        const maxW = 4.6, maxD = 2.6;
        const k = Math.min(maxW / Math.max(sz.x, 1e-4), maxD / Math.max(sz.z, 1e-4));
        pv.scale.setScalar(k);
        pv.updateMatrixWorld(true);

        bb0.makeEmpty();
        pv.traverse(o => { if (o.isMesh && o.visible && o.geometry) { bb0.expandByObject(o); } });
        const ct = bb0.getCenter(new T.Vector3());
        pv.position.set(-ct.x, -bb0.min.y, -ct.z);

        // Piso base de pedra do pátio para definir perfeitamente o lote 5x3
        const courtyard = new T.Mesh(
            new T.BoxGeometry(4.7, 0.06, 2.7),
            new T.MeshStandardMaterial({ color: 0x36323b, roughness: 0.95, flatShading: true })
        );
        courtyard.position.set(0, 0.03, 0);
        courtyard.receiveShadow = true;
        grp.add(courtyard);

        grp.add(pv);
        grp.userData.roof = { x: 0, y: bb0.max.y * k, model: true, px: 0, py: bb0.max.y * k, pz: 0, n: 1 };
        return true;
    }
    function clCovilAssemble(grp, level, cv) {
        level = Math.max(1, Math.min(5, level | 0)); const o = { cv };
        try { if (clProtoUse(grp, 'covil', level, cv)) { /* castelo do protótipo */ } else if (zKeep(grp, level)) { /* castelo de pedra em código, no estilo da vila medieval */ } else if (zCastle(grp, level)) { /* castelo baixado */ } else if (zLairOk()) zLair(grp, level); else if (!zBarnModel(grp, level)) zBarn(grp, level); } catch (er) { try { console.warn('celeiro do curral', er); } catch (e2) {} }   /* se algo falhar, a colônia continua desenhando */
        if (!zLairOk() && !CLM.tpl['castelo2.glb']) { if (level >= 2) clAddPart(grp, 'fp_crates_veg.glb', -2.3, 0, 1.2, 0.7, 0.7, 0.7, 0, -0.2, 0, o);
        if (level >= 4) clAddPart(grp, 'fp_cart.glb', -2.25, 0, 0.1, 0.4, 0.4, 0.4, 0, 1.4, 0, o); }
        clBichosAttach(grp, level);
    }

    /* ---------- Árvore Incubadora: uma árvore gigante, só uma por colônia, que choca UM ovo por vez (o dragão só se revela ao nascer) ---------- */
    function clIncubadoraAssemble(grp, level, cv) {
        const T = clTh(); try {
            const tpl = CLM.tpl['arvore_incubadora.glb']; if (!tpl || !tpl.gl) return;
            const nova = clProtoIncubadora(grp, cv);   /* árvore nova estilo Dragon City; se falhar usa a árvore do modelo */
            const M = (hex, emi) => new T.MeshLambertMaterial({ color: new T.Color(hex), emissive: new T.Color(emi || '#000000') }), add = (m, x, y, z) => { m.position.set(x, y, z); m.castShadow = true; grp.add(m); return m; };
            if (!nova) {
            const tree = tpl.gl.scene.clone(true); tree.traverse(o => { if (!o.isMesh) return; o.castShadow = true; o.receiveShadow = false; const f = mt => { const c = mt.clone(); if (/leaf|leaves/i.test(mt.name || '') && c.map) { c.emissive = new T.Color('#2bffa8'); c.emissiveMap = c.map; c.emissiveIntensity = 0.55; c.alphaTest = Math.max(c.alphaTest || 0, 0.35); c.side = T.DoubleSide; }
                const PAL = (cv | 0) > 0 && typeof CLD !== 'undefined' && CLD.PAL && CLD.PAL[(cv | 0) - 1]; if (PAL && c.color) { const isLeaf = /leaf|leaves/i.test(mt.name || ''); if (isLeaf) { c.color.set(PAL[1]); if (c.emissive) { c.emissive.set(PAL[1]); c.emissiveIntensity = 0.55; } } else c.color.lerp(new T.Color(PAL[2]), 0.45); }   /* a cor escolhida pinta a árvore (folhas e tronco) */
                return c; }; o.material = Array.isArray(o.material) ? o.material.map(f) : f(o.material); });
            try { clIncPatchTree(tree, T); } catch (e) { console.warn('árvore: vento e luz', e); }
            const pv = new T.Group(); pv.add(tree); pv.updateMatrixWorld(true); let bb = new T.Box3().setFromObject(pv), sz = bb.getSize(new T.Vector3()); const k = 9.5 / sz.y; pv.scale.setScalar(k); pv.updateMatrixWorld(true); bb = new T.Box3().setFromObject(pv); const ct = bb.getCenter(new T.Vector3()); pv.position.set(-ct.x, -bb.min.y, -0.7 - ct.z); grp.add(pv);   /* árvore torcida de verdade (Quaternius, CC0), folhas recoloridas */
            const mound = add(new T.Mesh(new T.CylinderGeometry(2.0, 2.2, 0.3, 20), M('#2f7a2a', '#06160a')), 0, 0.15, 0.2); mound.receiveShadow = true;
            const ped = add(new T.Mesh(new T.CylinderGeometry(0.8, 1.0, 0.5, 12), M('#3c3832', '#050504')), 0, 0.5, 1.35);   /* pedestal de pedra onde o ovo flutua, com anel de runas */
            }
            const ringM = new T.MeshBasicMaterial({ color: '#ffd77a' }); const ring = new T.Mesh(new T.TorusGeometry(0.72, 0.045, 6, 28), ringM); ring.rotation.x = Math.PI / 2; ring.position.set(0, 0.66, 2.0); grp.add(ring);
            const glowM = new T.MeshBasicMaterial({ color: '#ffe9a0' });
            try { clIncMystic(grp, T, cv); } catch (e) { console.warn('árvore mística', e); }
            const halo = new T.Sprite(new T.SpriteMaterial({ map: zSoftTex(), color: '#ffd77a', transparent: true, opacity: 0.3, depthWrite: false, blending: T.AdditiveBlending })); halo.scale.setScalar(2.6); halo.position.set(0, 1.6, 2.0); grp.add(halo);
            grp.userData.roof = { x: 0, y: 2.0, model: true, big: true, px: 0, py: 1.55, pz: 2.0, n: 1 };
        } catch (e) { try { console.warn('árvore incubadora', e); } catch (e2) {} }
    }
    CLM_CUSTOM_HANDLERS.incubadora = { preload: () => clLoadAll(['arvore_incubadora.glb']), assemble: clIncubadoraAssemble, req: 'arvore_incubadora.glb', files: ['arvore_incubadora.glb'], scale: 0.8 };
    CLM_CUSTOM_HANDLERS.curral = { preload: () => clLoadAll(CLM_CUR_FILES), assemble: clCovilAssemble, req: 'fp_hay.glb', files: CLM_CUR_FILES, scale: 1.0 };
/* === [SEC: LIVRO_DRAGOES_3D] === */
/* ===== cortex/36jmb-colony-book3d.js: LIVRO DOS DRAGÕES EM 3D DE VERDADE. As páginas são folhas de papel numa cena WebGL: o conteúdo (cartas, listas, botões) é pintado na própria folha como textura, a folha vira em 3D com curva e leva o conteúdo junto, como num livro. Toque nas cartas por raio 3D. ===== */
    const B3 = window.__b3 = { on: false, r: null, sc: null, cam: null, cv: null, g: null, por: false, W: 640, H: 880, PWl: 6.4, PHl: 8.8, T: 0.5, pages: [], s: 0, cache: new Map(), imgs: {}, leaf: null, anim: null, dirty: true, id: 0, t0: 0, tex: {}, hits: [], run: false };

    const B3_REF = () => ({ s: clS(), z: clZooS(clS()), lay: clZooLayout(clS()) });
    function zB3Ok() { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')) && !!clTh(); } catch (e) { return false; } }

    /* ---------- descrição das páginas ---------- */
    function zB3Pages() {
        const por = B3.por, cap = por ? { c: 3, r: 3, a: 4, h: 2 } : { c: 4, r: 5, a: 6, h: 3 }, P = [], chunk = (a, k) => { const o = []; for (let i = 0; i < a.length; i += k) o.push(a.slice(i, i + k)); return o.length ? o : [[]]; };
        P.push({ k: 'idx' });
        [['terra', 'Terra'], ['agua', 'Água'], ['cristal', 'Cristal'], ['estelar', 'Estelar']].forEach(g => { const list = ZSP.filter(x => x.el === g[0]).sort((a, b) => a.rk - b.rk), ch = chunk(list, cap.c); ch.forEach((c, i) => P.push({ k: 'col', el: g[0], nm: g[1], ids: c.map(x => x.id), i, n: ch.length, tot: list.length, first: i === 0 })); });
        P.push({ k: 'mine0', sec: 'mine', first: true });
        { const z = clZooS(), ids = z.an.map(a => a.id), ch = chunk(ids, cap.r); ch.forEach((c, i) => P.push({ k: 'mine', sec: 'mine', ids: c, i, n: ch.length })); }
        { const ch = chunk(ZACH.map(a => a.id), cap.a); ch.forEach((c, i) => P.push({ k: 'ach', sec: 'ach', ids: c, i, n: ch.length, first: i === 0 })); }
        { const H = [['Trabalho', 'Os dragões não precisam mais de ração: eles trabalham sozinhos e juntam produtos para você coletar. O que mais importa agora é lutar com eles na Batalha em Mapa.'], ['Treino e nível', 'Os dragões treinam sozinhos enquanto trabalham. Quando a barra de treino enche, você paga biomassa, cristais e fragmentos do elemento dele (ganhos nas batalhas) e ele sobe de nível: produz mais, dá mais bônus à colônia e fica maior.'], ['Ovos e raridade', 'Só os comuns são vendidos. Os outros nascem de cruzamentos: escolha dois dragões adultos e um ovo é posto. Cada cruzamento pode gerar um grau acima (Comum, Incomum, Raro, Épico, Lendário). Elementos diferentes aumentam a chance. Se der azar muitas vezes, a chance chega a 100%.'], ['Ilhas', 'Cada elemento tem a sua ilha no mar: Terra, Água, Cristal e Estelar. Os dragões moram na ilha do próprio elemento. Os mais raros também patrulham a colônia.'], ['Tocar nos dragões', 'Toque num dragão voando e ele solta um golpe do elemento dele: fogo, folhas, água, cristais ou estrelas.']]; const ch = chunk(H, cap.h); ch.forEach((c, i) => P.push({ k: 'help', sec: 'help', hs: c, i, n: ch.length, first: i === 0 })); }
        P.forEach((p, i) => { p.i2 = i; }); return P;
    }

    /* ---------- pintura das folhas (canvas 2D) ---------- */
    const B3F = (sz, st) => (st || '700') + ' ' + Math.round(sz) + 'px Georgia,"Times New Roman",serif';
    function zB3rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
    function zB3Img(url) { if (!url) return null; let im = B3.imgs[url]; if (!im) { im = new Image(); im.onload = () => { im._ok = 1; B3.cache.clear(); B3.dirty = true; }; im.src = url; B3.imgs[url] = im; } return im._ok ? im : null; }
    function zB3Wrap(c, text, x, y, maxW, lh, maxLines) { const words = String(text).split(' '); let line = '', n = 0; for (let i = 0; i < words.length; i++) { const t = line ? line + ' ' + words[i] : words[i]; if (c.measureText(t).width > maxW && line) { c.fillText(line, x, y); y += lh; n++; line = words[i]; if (maxLines && n >= maxLines) return y; } else line = t; } if (line) { c.fillText(line, x, y); y += lh; } return y; }
    function zB3Paper(c, W, H, side, seed) {
        c.fillStyle = '#e4d0a0'; c.fillRect(0, 0, W, H);
        const tex = zB3Img('./assets/colony/book_paper.webp'); if (tex) { c.globalAlpha = 0.55; c.globalCompositeOperation = 'multiply'; for (let y = 0; y < H; y += 512) for (let x = 0; x < W; x += 256) c.drawImage(tex, x, y); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; }
        let sd = seed * 7919 + 13; const r = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
        for (let i = 0; i < 7; i++) { const x = r() * W, y = r() * H, rad = 50 + r() * 130, g = c.createRadialGradient(x, y, 0, x, y, rad); g.addColorStop(0, 'rgba(120,70,20,' + (0.10 + r() * 0.16).toFixed(2) + ')'); g.addColorStop(1, 'rgba(120,70,20,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H); }
        for (let i = 0; i < 1400; i++) { c.fillStyle = 'rgba(' + (90 + r() * 40 | 0) + ',' + (60 + r() * 30 | 0) + ',20,' + (r() * 0.07).toFixed(3) + ')'; c.fillRect(r() * W, r() * H, 1 + r() * 2, 1 + r() * 2); }
        // escurece nas bordas e, principalmente, perto da lombada
        const sp = B3.por ? (side === 'L' ? [0, H, 0, H - H * 0.20] : [0, 0, 0, H * 0.20]) : (side === 'L' ? [W, 0, W - W * 0.22, 0] : [0, 0, W * 0.22, 0]);
        let g = c.createLinearGradient(sp[0], sp[1], sp[2], sp[3]); g.addColorStop(0, 'rgba(50,25,5,.62)'); g.addColorStop(1, 'rgba(50,25,5,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
        g = c.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75); g.addColorStop(0, 'rgba(90,50,10,0)'); g.addColorStop(1, 'rgba(90,50,10,.38)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    }
    function zB3Card(c, x, y, w, h, sp, got, own, hits) {
        const R = ZR[sp.rk], E = ZEL[sp.el];
        c.save(); c.shadowColor = 'rgba(0,0,0,.55)'; c.shadowBlur = 10; c.shadowOffsetY = 4;
        if (!got) { zB3rr(c, x, y, w, h, 14); c.fillStyle = '#2f2216'; c.fill(); c.restore(); c.save(); c.lineWidth = 4; c.strokeStyle = '#6a5a44'; zB3rr(c, x + 3, y + 3, w - 6, h - 6, 12); c.stroke(); c.fillStyle = '#c9a965'; c.font = B3F(w * 0.42); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('?', x + w / 2, y + h / 2); c.restore(); hits.push({ x, y, w, h, a: 'bsp', d: sp.id }); return; }
        zB3rr(c, x, y, w, h, 14); const fg = c.createLinearGradient(x, y, x + w, y + h); fg.addColorStop(0, R.col); fg.addColorStop(0.5, '#3a2a1a'); fg.addColorStop(1, R.col); c.fillStyle = fg; c.fill(); c.restore();
        c.save(); zB3rr(c, x + 5, y + 5, w - 10, h - 10, 11); c.fillStyle = '#2b1d12'; c.fill(); c.restore();
        // janela oval do retrato
        const ax = x + w * 0.09, ay = y + h * 0.06, aw = w * 0.82, ah = h * 0.55; c.save(); c.beginPath(); c.ellipse(ax + aw / 2, ay + ah / 2, aw / 2, ah / 2, 0, 0, 6.2832); c.clip(); const bg = c.createRadialGradient(ax + aw / 2, ay + ah * 0.45, 4, ax + aw / 2, ay + ah / 2, aw * 0.7); bg.addColorStop(0, R.col); bg.addColorStop(1, '#0a121c'); c.fillStyle = bg; c.fillRect(ax, ay, aw, ah);
        const im = zB3Img(zPortrait(sp.id)); if (im) { const s0 = Math.max(aw / im.width, ah / im.height); c.drawImage(im, ax + (aw - im.width * s0) / 2, ay + (ah - im.height * s0) / 2, im.width * s0, im.height * s0); } c.restore();
        c.lineWidth = 5; c.strokeStyle = '#14100a'; c.beginPath(); c.ellipse(ax + aw / 2, ay + ah / 2, aw / 2, ah / 2, 0, 0, 6.2832); c.stroke(); c.lineWidth = 3; c.strokeStyle = R.col; c.beginPath(); c.ellipse(ax + aw / 2, ay + ah / 2, aw / 2 - 3, ah / 2 - 3, 0, 0, 6.2832); c.stroke();
        // gema do elemento
        const gr = w * 0.12, gx = x + gr * 0.9, gy = y + gr * 0.9; const gg = c.createRadialGradient(gx - gr * 0.3, gy - gr * 0.3, 1, gx, gy, gr); gg.addColorStop(0, '#fff'); gg.addColorStop(0.5, E.col); gg.addColorStop(1, '#222'); c.fillStyle = gg; c.beginPath(); c.arc(gx, gy, gr, 0, 6.2832); c.fill(); c.lineWidth = 3; c.strokeStyle = '#1a1208'; c.stroke();
        // gema de raridade
        const rx = x + w / 2, ry = y + h * 0.62, rs = w * 0.06; c.save(); c.translate(rx, ry); c.rotate(Math.PI / 4); const rg = c.createLinearGradient(-rs, -rs, rs, rs); rg.addColorStop(0, '#fff'); rg.addColorStop(0.5, R.col); rg.addColorStop(1, '#222'); c.fillStyle = rg; c.fillRect(-rs, -rs, rs * 2, rs * 2); c.lineWidth = 2; c.strokeStyle = '#1a1208'; c.strokeRect(-rs, -rs, rs * 2, rs * 2); c.restore();
        // faixa do nome
        const nx = x + w * 0.04, ny = y + h * 0.66, nw = w * 0.92, nh = h * 0.11; c.save(); c.beginPath(); c.moveTo(nx + 10, ny); c.lineTo(nx + nw - 10, ny); c.lineTo(nx + nw, ny + nh / 2); c.lineTo(nx + nw - 10, ny + nh); c.lineTo(nx + 10, ny + nh); c.lineTo(nx, ny + nh / 2); c.closePath(); const ng = c.createLinearGradient(0, ny, 0, ny + nh); ng.addColorStop(0, '#f6e8c0'); ng.addColorStop(1, '#cdb67f'); c.fillStyle = ng; c.fill(); c.lineWidth = 2; c.strokeStyle = '#3a2810'; c.stroke(); c.restore();
        const nm = sp.n.replace(/^Dragão[- ](?:d[aeo]s? )?/, ''); c.fillStyle = '#3b2410'; c.textAlign = 'center'; c.textBaseline = 'middle'; let fs = nh * 0.62; c.font = B3F(fs, '900'); while (c.measureText(nm).width > nw * 0.86 && fs > 9) { fs -= 1; c.font = B3F(fs, '900'); } c.fillText(nm, nx + nw / 2, ny + nh / 2 + 1);
        // caixa de texto
        const tx = x + w * 0.09, ty = y + h * 0.79, tw = w * 0.82, th = h * 0.13; zB3rr(c, tx, ty, tw, th, 6); const tg = c.createLinearGradient(0, ty, 0, ty + th); tg.addColorStop(0, '#eadfb8'); tg.addColorStop(1, '#d2bf90'); c.fillStyle = tg; c.fill();
        c.fillStyle = '#2b1a0a'; c.font = B3F(th * 0.30, '700'); c.fillText(R.n + ' · ' + E.n, tx + tw / 2, ty + th * 0.33); c.font = B3F(th * 0.27, '400'); c.fillText(sp.pd, tx + tw / 2, ty + th * 0.72);
        // ataque (produção) e vida (ração)
        const br = w * 0.115, by = y + h - br * 0.7; const ag = c.createRadialGradient(x + br * 0.6, by - br * 0.3, 1, x + br * 0.9, by, br); ag.addColorStop(0, '#fff1a8'); ag.addColorStop(0.5, '#f1b724'); ag.addColorStop(1, '#8a5a10'); c.fillStyle = ag; c.beginPath(); c.arc(x + br * 0.9, by, br, 0, 6.2832); c.fill(); c.lineWidth = 3; c.strokeStyle = '#1a1208'; c.stroke();
        const hg = c.createRadialGradient(x + w - br * 1.2, by - br * 0.3, 1, x + w - br * 0.9, by, br); hg.addColorStop(0, '#ffb0b0'); hg.addColorStop(0.5, '#e02a2a'); hg.addColorStop(1, '#7a0d0d'); c.fillStyle = hg; c.beginPath(); c.arc(x + w - br * 0.9, by, br, 0, 6.2832); c.fill(); c.stroke();
        c.fillStyle = '#fff'; c.font = B3F(br * 0.95, '900'); c.shadowColor = '#000'; c.shadowBlur = 4; c.fillText(String(ZG[sp.rk]), x + br * 0.9, by + 2); c.fillText(String(ZFEED[sp.rk]), x + w - br * 0.9, by + 2); c.shadowBlur = 0;
        if (own) { c.fillStyle = '#7dff9a'; c.beginPath(); c.arc(x + w / 2, y + h + 2, 5, 0, 6.2832); c.fill(); }
        hits.push({ x, y, w, h, a: 'bsp', d: sp.id });
    }
    function zB3Btn(c, x, y, w, h, label, on, hits, a, d) { c.save(); zB3rr(c, x, y, w, h, 14); const g = c.createLinearGradient(0, y, 0, y + h); if (on === 'gold') { g.addColorStop(0, '#ffd35c'); g.addColorStop(1, '#ff9a3c'); } else if (on === false) { g.addColorStop(0, 'rgba(140,110,70,.35)'); g.addColorStop(1, 'rgba(140,110,70,.35)'); } else { g.addColorStop(0, '#f0dcae'); g.addColorStop(1, '#cdb27a'); } c.fillStyle = g; c.fill(); c.lineWidth = 2; c.strokeStyle = on === false ? 'rgba(90,55,20,.3)' : '#6a4a22'; c.stroke(); c.fillStyle = on === 'gold' ? '#2a1a05' : on === false ? 'rgba(60,40,20,.5)' : '#4a2c10'; c.font = B3F(h * 0.34, '700'); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(label, x + w / 2, y + h / 2 + 1); c.restore(); if (on !== false && a) hits.push({ x, y, w, h, a, d }); }

    function zB3PaintPage(i) {
        const P = B3.pages, p = P[i], W = B3.W, H = B3.H; const key = i + '|' + B3.por; const side = (i & 1) ? 'R' : 'L';
        const { z, lay } = B3_REF(), s = clS(), lv = lay.lv || 1;
        // assinatura: só repinta quando algo mudou
        let sig = key + '|' + (ZOO.bsp || '') + '|' + (ZOO.bspPg === i ? 1 : 0);
        if (!p) sig += '|vazio'; else if (p.k === 'col') sig += '|' + p.ids.map(id => (z.book[id] ? 1 : 0) + (z.an.some(a => a.sp === id) ? 'o' : '') + (zPortrait(id) ? 'p' : '')).join(',');
        else if (p.k === 'mine0' || p.k === 'mine') sig += '|' + Math.floor(Date.now() / 1000) + '|' + z.an.length + '|' + z.eggs.length + '|' + (z.auto === false ? 0 : 1) + '|' + (p.ids || []).join(',');
        else if (p.k === 'ach') sig += '|' + JSON.stringify(z.ach || {}) + '|' + Math.floor(Date.now() / 3000);
        else sig += '|' + Object.keys(z.book).length;
        let e = B3.cache.get(key); if (e && e.sig === sig) return e;
        const cv = e ? e.cv : document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d'); const hits = []; c.clearRect(0, 0, W, H);
        zB3Paper(c, W, H, side, i + 1); c.textBaseline = 'alphabetic';
        const M = Math.round(Math.min(W, H) * (B3.por ? 0.085 : 0.075)); let y0 = M;
        if (p) {
            // cabeçalho
            const title = p.k === 'idx' ? 'Índice' : p.k === 'col' ? 'Ilha ' + p.nm : p.k === 'mine0' || p.k === 'mine' ? 'Meus dragões' : p.k === 'ach' ? 'Conquistas' : 'Como funciona';
            c.fillStyle = '#4a2c10'; c.textAlign = 'center'; c.font = B3F(H * (B3.por ? 0.085 : 0.05)); c.fillText(title, W / 2, M + H * 0.03);
            if (p.k === 'col') { c.font = B3F(H * 0.026, '400'); c.fillStyle = '#7a5a30'; const have = ZSP.filter(x => x.el === p.el && z.book[x.id]).length; c.fillText(have + '/' + p.tot + (p.n > 1 ? '  ·  ' + (p.i + 1) + '/' + p.n : ''), W / 2, M + H * (B3.por ? 0.135 : 0.085)); }
            c.strokeStyle = 'rgba(90,55,20,.45)'; c.lineWidth = 2; c.beginPath(); c.moveTo(M, M + H * (B3.por ? 0.15 : 0.1)); c.lineTo(W - M, M + H * (B3.por ? 0.15 : 0.1)); c.stroke(); y0 = M + H * (B3.por ? 0.18 : 0.12);
            const bodyH = H - y0 - M * 1.3;
            if (p.k === 'idx') {
                c.textAlign = 'center'; c.fillStyle = '#4a2c10'; c.font = B3F(H * 0.034, '700'); c.fillText('Livro dos Dragões', W / 2, y0 + H * 0.01); c.font = B3F(H * 0.022, '400'); c.fillStyle = '#7a5a30'; c.fillText(Object.keys(z.book).length + ' de ' + ZSP.length + ' espécies descobertas', W / 2, y0 + H * 0.045);
                const items = [['Ilha Terra', 'terra', ZEL.terra.col], ['Ilha Água', 'agua', ZEL.agua.col], ['Ilha Cristal', 'cristal', ZEL.cristal.col], ['Ilha Estelar', 'estelar', ZEL.estelar.col], ['Meus dragões', 'mine', '#8a3a14'], ['Conquistas', 'ach', '#b8860b'], ['Como funciona', 'help', '#5a6a8a']]; const ih = Math.min(H * 0.07, (bodyH - H * 0.07) / items.length - 6); let yy = y0 + H * 0.07;
                items.forEach(it => { const pi = P.findIndex(q => (q.el === it[1] && q.first) || (q.sec === it[1])); zB3rr(c, M, yy, W - 2 * M, ih, 12); c.fillStyle = 'rgba(90,55,20,.12)'; c.fill(); c.lineWidth = 2; c.strokeStyle = 'rgba(90,55,20,.35)'; c.stroke(); c.fillStyle = it[2]; c.beginPath(); c.arc(M + ih * 0.5, yy + ih / 2, ih * 0.22, 0, 6.2832); c.fill(); c.fillStyle = '#3b2a17'; c.textAlign = 'left'; c.font = B3F(ih * 0.42); c.fillText(it[0], M + ih * 1.1, yy + ih * 0.64); c.textAlign = 'right'; c.font = B3F(ih * 0.36, '400'); c.fillStyle = '#7a5a30'; c.fillText(String(pi + 1), W - M - 10, yy + ih * 0.64); hits.push({ x: M, y: yy, w: W - 2 * M, h: ih, a: 'goto', d: pi }); yy += ih + 6; });
            } else if (p.k === 'col') {
                const sel = ZOO.bsp && ZOO.bspPg === i ? zsp(ZOO.bsp) : null;
                if (sel) {
                    const got = !!z.book[sel.id], R = ZR[sel.rk], E = ZEL[sel.el], cw = B3.por ? bodyH * 0.72 : (W - 2 * M) * 0.52, ch = cw * 1.4; zB3Card(c, M, y0 + (bodyH - Math.min(ch, bodyH)) / 2, Math.min(cw, bodyH / 1.4), Math.min(ch, bodyH), sel, got, false, []);
                    const tx = M + Math.min(cw, bodyH / 1.4) + M * 0.6; c.textAlign = 'left'; c.fillStyle = '#3b2a17'; c.font = B3F(H * 0.04); c.fillText(got ? sel.n : '???', tx, y0 + H * 0.05); c.fillStyle = R.col; c.font = B3F(H * 0.026); c.fillText(R.n + ' · ' + E.n, tx, y0 + H * 0.09); c.fillStyle = '#4a3520'; c.font = B3F(H * 0.024, '400');
                    let yy = y0 + H * 0.14; const lh = H * 0.034; const mw = W - tx - M;
                    if (got) { const y1 = zYield(sel.rk, lay.lv || 1, 1); yy = zB3Wrap(c, 'Produz ' + sel.pd.toLowerCase() + ': ' + y1.b + ' biomassa' + (y1.c ? ' + ' + y1.c + ' cristal' : '') + ' por hora (nível 1).', tx, yy, mw, lh); yy = zB3Wrap(c, 'Come ' + ZFEED[sel.rk] + ' de biomassa por hora.', tx, yy + 4, mw, lh); yy = zB3Wrap(c, 'Bônus à colônia: ' + zBonusText(sel, { lv: 1, xp: 0 }) + '.', tx, yy + 4, mw, lh); yy = zB3Wrap(c, 'Você tem ' + z.an.filter(a => a.sp === sel.id).length + '.', tx, yy + 4, mw, lh); }
                    else zB3Wrap(c, 'Ainda não descoberto. ' + (sel.rk === 0 ? 'É vendido na loja do Covil.' : 'Nasce de cruzamentos de dragões ' + ZR[Math.max(0, sel.rk - 1)].n.toLowerCase() + ' ou melhores.'), tx, yy, mw, lh);
                    zB3Btn(c, tx, H - M * 1.3 - H * 0.09, Math.min(mw, W * 0.4), H * 0.07, '← voltar às cartas', true, hits, 'bsp', '');
                } else {
                    const n = p.ids.length, cols = B3.por ? 3 : 2, rows = Math.ceil(n / cols), g = 14; let cw = (W - 2 * M - g * (cols - 1)) / cols, ch = cw * 1.4; const maxH = (bodyH - g * (rows - 1)) / rows; if (ch > maxH) { ch = maxH; cw = ch / 1.4; } const totW = cols * cw + (cols - 1) * g, sx = (W - totW) / 2, sy = y0 + (bodyH - (rows * ch + (rows - 1) * g)) / 2;
                    p.ids.forEach((id, k) => { const sp = zsp(id); zB3Card(c, sx + (k % cols) * (cw + g), sy + Math.floor(k / cols) * (ch + g), cw, ch, sp, !!z.book[id], z.an.some(a => a.sp === id), hits); });
                }
            } else if (p.k === 'mine0') {
                const ad = z.an.filter(zAdult); let ready = 0, hungry = 0; ad.forEach(a => { if ((a.st || 0) > 0) ready++; if (!(a.fed > 0.02)) hungry++; });
                const st = [[z.an.length + '/' + lay.slots, 'vagas'], [String(ready), 'para coletar'], [String(z.eggs.length), 'ovos']], sw = (W - 2 * M - 20) / 3, sh = H * 0.1; st.forEach((t, k) => { const x = M + k * (sw + 10); zB3rr(c, x, y0, sw, sh, 12); c.fillStyle = 'rgba(90,55,20,.14)'; c.fill(); c.fillStyle = '#3b2a17'; c.textAlign = 'center'; c.font = B3F(sh * 0.42); c.fillText(t[0], x + sw / 2, y0 + sh * 0.5); c.font = B3F(sh * 0.2, '400'); c.fillText(t[1], x + sw / 2, y0 + sh * 0.82); });
                const cols = B3.por ? 3 : 2, bw = (W - 2 * M - 12 * (cols - 1)) / cols, bh = H * (B3.por ? 0.11 : 0.062); let by = y0 + sh + 16; const btn = [['Coletar' + (ready ? ' (' + ready + ')' : ''), ready ? 'gold' : false, 'zoo-collect'], ['Trazer dragão', true, 'zoo-buy']];
                btn.forEach((b, k) => { const x = M + (k % cols) * (bw + 12), y = by + Math.floor(k / cols) * (bh + 10); zB3Btn(c, x, y, bw, bh, b[0], b[1], hits, b[2], ''); });
                by += Math.ceil(btn.length / cols) * (bh + 10) + 8;
                c.textAlign = 'left'; c.fillStyle = '#4a2c10'; c.font = B3F(H * 0.03); c.fillText('Ninhos ' + z.eggs.length + '/' + lay.eggs, M, by + H * 0.03); by += H * 0.05;
                const ew = Math.min(W * 0.18, (bodyH + y0 - by - 20)), now = z.eggs.length; z.eggs.forEach((e, k) => { const ok = e.el >= e.tot, x = M + k * (ew + 14); const u = zEggImg(e.sp), im = zB3Img(u); if (im) c.drawImage(im, x, by, ew * 0.8, ew * 0.8 * (im.height / im.width)); c.fillStyle = '#3b2a17'; c.textAlign = 'center'; c.font = B3F(ew * 0.16, '700'); c.fillText(ok ? (z.an.length >= lay.slots ? 'sem vaga' : 'nasce! toque') : zClock(e.tot - e.el), x + ew * 0.4, by + ew * 1.0); if (ok && z.an.length < lay.slots) hits.push({ x, y: by, w: ew, h: ew * 1.05, a: 'zoo-hatch', d: '' }); });
                zB3Btn(c, M, H - M * 1.3 - H * 0.07, W - 2 * M, H * 0.06, 'Covil nível ' + lv + ' · melhorar ou vender →', true, hits, 'zoo-manage', '');
            } else if (p.k === 'mine') {
                const n = p.ids.length, rh = Math.min(H * (B3.por ? 0.2 : 0.14), (bodyH - 10 * (n - 1)) / Math.max(1, n)); p.ids.forEach((id, k) => { const a = z.an.find(q => q.id === id); if (!a) return; const sp = zsp(a.sp), st = zState(a, lv), R = ZR[sp.rk], x = M, y = y0 + k * (rh + 10), w = W - 2 * M; zB3rr(c, x, y, w, rh, 14); c.fillStyle = 'rgba(255,248,225,.55)'; c.fill(); c.lineWidth = 3; c.strokeStyle = R.col; c.stroke();
                    const im = zB3Img(zPortrait(sp.id)); c.save(); c.beginPath(); c.arc(x + rh * 0.5, y + rh / 2, rh * 0.38, 0, 6.2832); c.clip(); c.fillStyle = '#0c1624'; c.fillRect(x, y, rh, rh); if (im) { const s0 = Math.max(rh * 0.76 / im.width, rh * 0.76 / im.height); c.drawImage(im, x + rh * 0.5 - im.width * s0 / 2, y + rh / 2 - im.height * s0 / 2, im.width * s0, im.height * s0); } c.restore(); c.lineWidth = 3; c.strokeStyle = R.col; c.beginPath(); c.arc(x + rh * 0.5, y + rh / 2, rh * 0.38, 0, 6.2832); c.stroke();
                    c.textAlign = 'left'; c.fillStyle = '#3b2a17'; c.font = B3F(rh * 0.24); c.fillText(sp.n + '  Nv ' + zAL(a), x + rh * 0.98, y + rh * 0.38); c.font = B3F(rh * 0.18, '400'); c.fillStyle = '#5a3a14'; c.fillText(st.t, x + rh * 0.98, y + rh * 0.64); zB3rr(c, x + rh * 0.98, y + rh * 0.74, w - rh * 1.2, rh * 0.1, 6); c.fillStyle = 'rgba(90,55,20,.25)'; c.fill(); zB3rr(c, x + rh * 0.98, y + rh * 0.74, Math.max(6, (w - rh * 1.2) * Math.max(0, Math.min(1, st.p || 0))), rh * 0.1, 6); c.fillStyle = R.col; c.fill(); hits.push({ x, y, w, h: rh, a: 'zoo-pet', d: String(a.id) }); });
                if (!n) { c.fillStyle = '#7a5a30'; c.textAlign = 'center'; c.font = B3F(H * 0.03, '400'); c.fillText('Nenhum dragão ainda.', W / 2, y0 + H * 0.1); }
            } else if (p.k === 'ach') {
                const n = p.ids.length, ih = Math.min(H * (B3.por ? 0.19 : 0.12), (bodyH - 10 * (n - 1)) / Math.max(1, n)); p.ids.forEach((id, k) => { const a = ZACH.find(q => q.id === id); if (!a) return; z.ach = z.ach || {}; const cur = Math.min(a.t, a.f(z)), done = !!z.ach[a.id], can = !done && cur >= a.t, x = M, y = y0 + k * (ih + 10), w = W - 2 * M; zB3rr(c, x, y, w, ih, 12); c.fillStyle = done ? 'rgba(120,170,90,.22)' : 'rgba(255,248,225,.5)'; c.fill(); c.lineWidth = 2; c.strokeStyle = can ? '#e0a020' : 'rgba(90,55,20,.35)'; c.stroke();
                    c.textAlign = 'left'; c.fillStyle = '#3b2a17'; c.font = B3F(ih * 0.26); c.fillText(a.n, x + 16, y + ih * 0.38); zB3rr(c, x + 16, y + ih * 0.52, w * 0.55, ih * 0.14, 7); c.fillStyle = 'rgba(90,55,20,.25)'; c.fill(); zB3rr(c, x + 16, y + ih * 0.52, Math.max(7, w * 0.55 * cur / a.t), ih * 0.14, 7); c.fillStyle = done ? '#5aa03a' : '#d9962a'; c.fill(); c.fillStyle = '#7a5a30'; c.font = B3F(ih * 0.2, '400'); c.fillText(cur + ' / ' + a.t, x + 16, y + ih * 0.88);
                    if (done) { c.fillStyle = '#3f8a2e'; c.textAlign = 'right'; c.font = B3F(ih * 0.4); c.fillText('✔', x + w - 20, y + ih * 0.62); } else zB3Btn(c, x + w - w * 0.26 - 10, y + ih * 0.2, w * 0.26, ih * 0.6, '+' + a.r + ' ◆', can ? 'gold' : false, hits, 'zoo-ach', a.id); });
            } else if (p.k === 'help') {
                let yy = y0; const lh = H * 0.034; p.hs.forEach(hh => { c.textAlign = 'left'; c.fillStyle = '#7a3a14'; c.font = B3F(H * 0.034); c.fillText(hh[0], M, yy + H * 0.02); yy += H * 0.05; c.fillStyle = '#3b2a17'; c.font = B3F(H * 0.026, '400'); yy = zB3Wrap(c, hh[1], M, yy, W - 2 * M, lh); yy += H * 0.03; });
            }
            c.fillStyle = '#7a5a30'; c.textAlign = 'center'; c.font = B3F(H * 0.024, '400'); c.fillText('· ' + (i + 1) + ' ·', W / 2, H - M * 0.55);
        }
        if (!e) e = { cv, tex: null }; e.sig = sig; e.hits = hits; B3.cache.set(key, e);
        const T = clTh(); if (!e.tex) { e.tex = new T.CanvasTexture(cv); if (T.sRGBEncoding) e.tex.encoding = T.sRGBEncoding; e.tex.anisotropy = Math.min(8, B3.r ? B3.r.capabilities.getMaxAnisotropy() : 1); e.tex.generateMipmaps = true; e.tex.minFilter = T.LinearMipmapLinearFilter; } e.tex.needsUpdate = true;
        return e;
    }

    /* ---------- cena 3D ---------- */
    function zB3UV(side, s, zz) {   /* canto (s = distância da lombada, zz = ao longo da lombada, -PH/2..PH/2) → coordenadas da folha (pixels do canvas 0..1) */
        const PW = B3.PWl, PH = B3.PHl; let cx, cy;
        if (!B3.por) { cx = side === 'R' ? s / PW : 1 - s / PW; cy = (zz + PH / 2) / PH; }
        else { cx = 1 - (zz + PH / 2) / PH; cy = side === 'R' ? s / PW : 1 - s / PW; }
        return [cx, 1 - cy];
    }
    function zB3PageMesh(side) {
        const T = clTh(), PW = B3.PWl, PH = B3.PHl, g = new T.BufferGeometry(), pos = [], uv = [], idx = [], N = 1;
        for (let a = 0; a <= N; a++) for (let b = 0; b <= N; b++) { const s = PW * a / N, zz = -PH / 2 + PH * b / N; pos.push(side === 'R' ? s : -s, 0, zz); const u = zB3UV(side, s, zz); uv.push(u[0], u[1]); }
        const v = (a, b) => a * (N + 1) + b; for (let a = 0; a < N; a++) for (let b = 0; b < N; b++) { if (side === 'R') { idx.push(v(a, b), v(a, b + 1), v(a + 1, b)); idx.push(v(a, b + 1), v(a + 1, b + 1), v(a + 1, b)); } else { idx.push(v(a, b), v(a + 1, b), v(a, b + 1)); idx.push(v(a, b + 1), v(a + 1, b), v(a + 1, b + 1)); } }
        g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
        const m = new T.Mesh(g, new T.MeshStandardMaterial({ roughness: 0.95, metalness: 0, color: 0xffffff })); m.position.y = B3.T + 0.01; return m;
    }
    function zB3Leaf() {
        const T = clTh(), N = 30, PW = B3.PWl, PH = B3.PHl, rest = [], uvF = [], uvB = [], idxF = [], idxB = [];
        for (let a = 0; a <= N; a++) for (let b = 0; b <= 1; b++) { const s = PW * a / N, zz = -PH / 2 + PH * b; rest.push([s, zz]); uvF.push(...zB3UV('R', s, zz)); uvB.push(...zB3UV('L', s, zz)); }
        const v = (a, b) => a * 2 + b; for (let a = 0; a < N; a++) { idxF.push(v(a, 0), v(a, 1), v(a + 1, 0)); idxF.push(v(a, 1), v(a + 1, 1), v(a + 1, 0)); idxB.push(v(a, 0), v(a + 1, 0), v(a, 1)); idxB.push(v(a, 1), v(a + 1, 0), v(a + 1, 1)); }
        const posA = new T.BufferAttribute(new Float32Array((N + 1) * 2 * 3), 3); const gF = new T.BufferGeometry(), gB = new T.BufferGeometry();
        gF.setAttribute('position', posA); gF.setAttribute('uv', new T.Float32BufferAttribute(uvF, 2)); gF.setIndex(idxF); gB.setAttribute('position', posA); gB.setAttribute('uv', new T.Float32BufferAttribute(uvB, 2)); gB.setIndex(idxB);
        const mF = new T.Mesh(gF, new T.MeshStandardMaterial({ roughness: 0.95, metalness: 0 })), mB = new T.Mesh(gB, new T.MeshStandardMaterial({ roughness: 0.95, metalness: 0 })); mF.frustumCulled = mB.frustumCulled = false; const grp = new T.Group(); grp.add(mF); grp.add(mB); grp.visible = false;
        return { grp, mF, mB, gF, gB, posA, rest, N };
    }
    function zB3LeafPose(p) {   /* p: 0 = deitada na direita, 1 = deitada na esquerda; a folha curva: a ponta livre fica para trás no meio do giro */
        const L = B3.leaf, N = L.N, PW = B3.PWl, d = PW / N, a = p * Math.PI, bend = 0.95 * Math.sin(p * Math.PI) * (p < 0.5 ? 1 : 1), P = L.posA.array; let x = 0, y = B3.T + 0.03 + 0.25 * Math.sin(p * Math.PI);
        for (let i = 0; i <= N; i++) { for (let b = 0; b <= 1; b++) { const k = (i * 2 + b) * 3; P[k] = x; P[k + 1] = y; P[k + 2] = -B3.PHl / 2 + B3.PHl * b; } const th = a - bend * ((i + 0.5) / N); x += d * Math.cos(th); y += d * Math.sin(th); }
        L.posA.needsUpdate = true; L.gF.computeVertexNormals(); L.gB.computeVertexNormals();
    }
    function zB3Build(m) {
        const T = clTh(); B3.por = zBkPortrait(); B3.W = B3.por ? 880 : 640; B3.H = B3.por ? 640 : 880;
        if (!B3.r) { const cv = document.createElement('canvas'); cv.className = 'cl-b3cv'; B3.cv = cv; B3.r = new T.WebGLRenderer({ canvas: cv, antialias: !IPAD, alpha: true, powerPreference: 'default' }); B3.r.outputEncoding = T.sRGBEncoding; B3.r.setClearColor(0x000000, 0); }
        const host = m.querySelector('.cl-b3host'); host.appendChild(B3.cv);
        if (B3.sc) { B3.sc.traverse(o => { if (o.geometry) o.geometry.dispose(); }); }
        const sc = new T.Scene(); B3.sc = sc; sc.add(new T.HemisphereLight(0xfff2dc, 0x6a5238, 0.5)); const dl = new T.DirectionalLight(0xffe6b8, 0.55); dl.position.set(-6, 20, 10); sc.add(dl); const pl = new T.PointLight(0xffb060, 0.2, 60); pl.position.set(0, 9, 2); sc.add(pl);
        const g = new T.Group(); B3.g = g; sc.add(g); const PW = B3.PWl, PH = B3.PHl, TH = B3.T;
        if (!B3.tex.leather) { const lt = new T.TextureLoader().load('./assets/colony/book_leather.webp', () => { B3.dirty = true; }); lt.wrapS = lt.wrapT = T.RepeatWrapping; lt.repeat.set(3, 3); if (T.sRGBEncoding) lt.encoding = T.sRGBEncoding; B3.tex.leather = lt; }
        const lm = new T.MeshStandardMaterial({ map: B3.tex.leather, roughness: 0.85, metalness: 0.05, color: 0xc8a888 });
        const cover = new T.Mesh(new T.BoxGeometry(2 * PW + 0.7, 0.28, PH + 0.7), lm); cover.position.y = -0.14; g.add(cover);
        const trim = new T.Mesh(new T.BoxGeometry(2 * PW + 0.7, 0.05, 0.12), lm); // bordas elevadas
        const edge = (() => { const cv = document.createElement('canvas'); cv.width = 64; cv.height = 64; const c = cv.getContext('2d'); c.fillStyle = '#d8c79a'; c.fillRect(0, 0, 64, 64); for (let i = 0; i < 64; i += 2) { c.fillStyle = 'rgba(120,100,60,' + (0.15 + Math.random() * 0.25) + ')'; c.fillRect(0, i, 64, 1); } const t = new T.CanvasTexture(cv); if (T.sRGBEncoding) t.encoding = T.sRGBEncoding; return t; })();
        const em = new T.MeshStandardMaterial({ map: edge, roughness: 1 }), pm = new T.MeshStandardMaterial({ color: 0xd9c79a, roughness: 1 });
        [-1, 1].forEach(sgn => { const b = new T.Mesh(new T.BoxGeometry(PW, TH, PH), [em, em, pm, pm, em, em]); b.position.set(sgn * PW / 2, TH / 2, 0); g.add(b); });
        const gold = new T.MeshStandardMaterial({ color: 0xd9a93a, metalness: 0.9, roughness: 0.35 });
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(q => { const cn = new T.Mesh(new T.BoxGeometry(0.9, 0.34, 0.9), gold); cn.position.set(q[0] * (PW + 0.1), -0.05, q[1] * (PH / 2 + 0.05)); g.add(cn); });
        const groove = new T.Mesh(new T.BoxGeometry(0.1, TH + 0.02, PH), new T.MeshStandardMaterial({ color: 0x5a3a14, roughness: 1 })); groove.position.set(0, TH / 2, 0); g.add(groove);
        B3.pL = zB3PageMesh('L'); B3.pR = zB3PageMesh('R'); g.add(B3.pL); g.add(B3.pR); B3.leaf = zB3Leaf(); g.add(B3.leaf.grp);
        const shadow = new T.Mesh(new T.PlaneGeometry(2 * PW + 4, PH + 4), new T.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.5, map: (() => { const cv = document.createElement('canvas'); cv.width = cv.height = 64; const c = cv.getContext('2d'); const gr = c.createRadialGradient(32, 32, 6, 32, 32, 32); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = gr; c.fillRect(0, 0, 64, 64); return new T.CanvasTexture(cv); })(), depthWrite: false })); shadow.rotation.x = -Math.PI / 2; shadow.position.y = -0.3; g.add(shadow);
        B3.cam = new T.PerspectiveCamera(32, 1, 0.5, 200); B3.pages = zB3Pages(); B3.s = Math.max(0, Math.min(B3.s, (B3.pages.length - 1) >> 1));
        zB3Fit(m); zB3Textures(); B3.dirty = true;
    }
    function zB3Fit(m) {
        const host = m.querySelector('.cl-b3host'); const w = Math.max(100, host.clientWidth), h = Math.max(100, host.clientHeight); B3.r.setPixelRatio(IPAD ? 1 : Math.min(window.devicePixelRatio || 1, 2)); B3.r.setSize(w, h, false); B3.cam.aspect = w / h; B3.cam.updateProjectionMatrix();
        const PW = B3.PWl, PH = B3.PHl, th = Math.tan(16 * Math.PI / 180), asp = w / h;
        const needW = B3.por ? (PH + 1.4) : (2 * PW + 1.4), needD = B3.por ? (2 * PW + 1.4) : (PH + 1.4); const dist = Math.max(needW / (2 * th * asp), needD / (2 * th) / 0.93) * 1.04;
        B3.dist = dist; const tilt = 1.2; B3.cam.up.set(0, 1, 0); B3.base = { y: dist * Math.sin(tilt), z: dist * Math.cos(tilt) };
        if (B3.por) { B3.g.rotation.y = 0; B3.cam.up.set(-1, 0, 0); B3.cam.position.set(B3.base.z, B3.base.y, 0); } else { B3.cam.position.set(0, B3.base.y, B3.base.z); }
        B3.cam.lookAt(0, 0, 0);
    }
    function zB3Textures() {
        const P = B3.pages, i = B3.s << 1; const a = zB3PaintPage(i), b = i + 1 < P.length ? zB3PaintPage(i + 1) : null;
        B3.pL.material.map = a.tex; B3.pL.material.needsUpdate = true; B3.pR.material.map = b ? b.tex : null; B3.pR.material.color.set(b ? 0xffffff : 0xcdb88a); B3.pR.material.needsUpdate = true; B3.hits = [a.hits, b ? b.hits : []]; B3.dirty = true;
    }
    function zB3Frame(now) {
        if (!B3.run) return; B3.id = requestAnimationFrame(zB3Frame);
        const an = B3.anim; let need = B3.dirty;
        if (!B3.t0) B3.t0 = now; const t = (now - B3.t0) / 1000;
        if (t < 1.4) { const k = 1 - Math.pow(1 - Math.min(1, t / 1.4), 3); const d = B3.dist * (1 + (1 - k) * 0.5); const c = B3.cam; if (B3.por) c.position.set(B3.base.z * d / B3.dist, B3.base.y * d / B3.dist, 0); else c.position.set(0, B3.base.y * d / B3.dist, B3.base.z * d / B3.dist); c.lookAt(0, 0, 0); B3.cv.style.opacity = String(Math.min(1, t / 0.5)); need = true; } else if (B3.cv.style.opacity !== '1') { B3.cv.style.opacity = '1'; need = true; }
        if (an) { const k = Math.min(1, (now - an.t0) / an.dur), e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2, p = an.fwd ? e : 1 - e; zB3LeafPose(p); need = true; if (k >= 1) { const fin = an.fin; B3.anim = null; B3.leaf.grp.visible = false; try { fin(); } catch (er) { ZOO.lastErr = 'b3fin ' + er; } } }
        if (need) { B3.r.render(B3.sc, B3.cam); B3.dirty = false; }
    }
    function zB3Flip(j) {
        if (B3.anim || !(j >= 0)) return; const P = B3.pages, n = (P.length + 1) >> 1; j = Math.max(0, Math.min(n - 1, j)); if (j === B3.s) return; const fwd = j > B3.s, cur = B3.s << 1, nxt = j << 1; ZOO.bsp = null;
        const t = (i) => i >= 0 && i < P.length ? zB3PaintPage(i).tex : null, setM = (mesh, tex) => { mesh.material.map = tex; mesh.material.color.set(tex ? 0xffffff : 0xcdb88a); mesh.material.needsUpdate = true; };
        const L = B3.leaf; B3.leaf.grp.visible = true;
        if (fwd) { setM(L.mF, t(cur + 1)); setM(L.mB, t(nxt)); setM(B3.pR, t(nxt + 1)); }   /* frente: página direita atual; verso: a nova esquerda; embaixo aparece a nova direita */
        else { setM(L.mF, t(nxt + 1)); setM(L.mB, t(cur)); setM(B3.pL, t(nxt)); }
        zB3LeafPose(fwd ? 0 : 1); try { aliveSound('tick'); } catch (e) {}
        B3.anim = { t0: performance.now(), dur: 1900, fwd, fin: () => { B3.s = j; zB3Textures(); zB3Nav(); } };
    }
    function zB3Nav() { const m = CL.root && CL.root.querySelector('.cl-zmod.book'); if (!m) return; const n = (B3.pages.length + 1) >> 1, b = m.querySelectorAll('.cl-bk-nav [data-cl="zoo-bturn"]'); if (b[0]) b[0].disabled = B3.s <= 0; if (b[1]) b[1].disabled = B3.s >= n - 1; const lab = m.querySelector('.cl-bk-nav .lab'); if (lab) lab.textContent = 'págs ' + ((B3.s << 1) + 1) + '–' + Math.min(B3.pages.length, (B3.s << 1) + 2) + ' · ' + B3.pages.length; }
    function zB3Refresh() { if (!B3.on || B3.anim) return; const por = zBkPortrait(); if (por !== B3.por) { const m = CL.root && CL.root.querySelector('.cl-zmod.book'); if (m) { zB3Build(m); zB3Nav(); } return; } B3.pages = zB3Pages(); B3.s = Math.max(0, Math.min(B3.s, (B3.pages.length - 1) >> 1)); zB3Textures(); zB3Nav(); }
    function zB3Pick(ev) {
        if (!B3.on || B3.anim) return; const T = clTh(), r = B3.cv.getBoundingClientRect(), nd = new T.Vector2(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1), rc = new T.Raycaster(); rc.setFromCamera(nd, B3.cam); const hit = rc.intersectObjects([B3.pL, B3.pR], false)[0]; if (!hit || !hit.uv) return;
        const k = hit.object === B3.pL ? 0 : 1, hs = B3.hits[k] || [], cx = hit.uv.x * B3.W, cy = (1 - hit.uv.y) * B3.H; for (let q = hs.length - 1; q >= 0; q--) { const h = hs[q]; if (cx >= h.x && cx <= h.x + h.w && cy >= h.y && cy <= h.y + h.h) { zB3Act(h, (B3.s << 1) + k); return; } }
    }
    function zB3Act(h, pg) {
        if (h.a === 'goto') { zB3Flip((h.d | 0) >> 1); return; }
        if (h.a === 'bsp') { ZOO.bsp = h.d || null; ZOO.bspPg = pg; B3.cache.delete(pg + '|' + B3.por); zB3Textures(); try { aliveSound('tick'); } catch (e) {} return; }
        const el = document.createElement('button'); el.dataset.id = h.d; el.dataset.sp = h.d; el.dataset.cl = h.a; try { clBichosClick(h.a, el); } catch (e) { ZOO.lastErr = 'b3act ' + e; } setTimeout(() => { try { if (B3.on) zB3Refresh(); } catch (e) {} }, 120);
    }
    function zB3Open(m) {
        if (!zB3Ok()) return false;
        try {
            m.querySelector('.cl-zcard').innerHTML = '<div class="cl-bk3"><div class="cl-b3host"></div><button type="button" class="cl-bkx" data-cl="zoo-close" aria-label="Fechar"><i class="ph-bold ph-x"></i></button><nav class="cl-bk-nav"><button type="button" data-cl="zoo-bturn" data-d="-1" aria-label="Voltar páginas"><i class="ph-bold ph-caret-left"></i></button><button type="button" class="mid" data-cl="zoo-bgo" data-p="0"><i class="ph-bold ph-list-bullets"></i><span class="lab">Índice</span></button><button type="button" data-cl="zoo-bturn" data-d="1" aria-label="Avançar páginas"><i class="ph-bold ph-caret-right"></i></button></nav></div>';
            B3.on = true; B3.s = ZOO.bs || 0; B3.anim = null; B3.cache.clear(); B3.t0 = 0; B3.leaf = null;
            if (ZOO.bstart === 'mine') { B3.s = 0; const P0 = (B3.por = zBkPortrait(), zB3Pages()), j = P0.findIndex(x => x.sec === 'mine'); if (j >= 0) B3.s = j >> 1; ZOO.bstart = null; }
            zB3Build(m); zB3Nav(); B3.cv.style.opacity = '0'; B3.run = true; B3.id = requestAnimationFrame(zB3Frame); B3.dirty = true;
            const host = m.querySelector('.cl-b3host'); let sx = 0, sy = 0, st = 0, on = false;
            host.addEventListener('pointerdown', e => { sx = e.clientX; sy = e.clientY; st = Date.now(); on = true; }); host.addEventListener('pointercancel', () => { on = false; });
            host.addEventListener('pointerup', e => { if (!on) return; on = false; const dx = e.clientX - sx, dy = e.clientY - sy, d = B3.por ? dy : dx, o = B3.por ? dx : dy; if (Math.abs(d) > 46 && Math.abs(d) > Math.abs(o) * 1.3 && Date.now() - st < 900) { zB3Flip(B3.s + (d < 0 ? 1 : -1)); } else if (Math.hypot(dx, dy) < 10) zB3Pick(e); });
            if (!window.__zB3Rz) { window.__zB3Rz = 1; window.addEventListener('resize', () => { try { if (B3.on) { const mm = CL.root && CL.root.querySelector('.cl-zmod.book'); if (mm) { if (zBkPortrait() !== B3.por) zB3Build(mm); else zB3Fit(mm); B3.dirty = true; } } } catch (e) {} }); }
            return true;
        } catch (e) { ZOO.lastErr = 'b3open ' + e; B3.on = false; B3.run = false; return false; }
    }
    function zB3Close() { B3.on = false; B3.run = false; try { cancelAnimationFrame(B3.id); } catch (e) {} try { if (B3.cv && B3.cv.parentNode) B3.cv.parentNode.removeChild(B3.cv); } catch (e) {} ZOO.bs = B3.s; try { B3.cache.forEach(e => { e.tex && e.tex.dispose(); }); B3.cache.clear(); if (B3.sc) B3.sc.traverse(o => { if (o.geometry) o.geometry.dispose(); }); B3.sc = null; if (B3.r) { B3.r.dispose(); B3.r.forceContextLoss && B3.r.forceContextLoss(); B3.r = null; B3.cv = null; } } catch (e) {} }
/* ===== cortex/36jmc-colony-book-surf.js: O CONTEÚDO DO GRIMÓRIO FICA NAS FOLHAS DO MODELO 3D (old_book.glb). As páginas (altar, cartas, covil, feitos) são pintadas como textura nas folhas de papel do próprio modelo: a página esquerda é projetada de cima sobre a pilha da esquerda e a direita vai na folha que vira. Na virada, a folha (Mesh009) gira com a animação do modelo levando as cartas na frente e a página nova no verso. ===== */
    const BKSW = 660, BKSH = 880;
    const BKS_T0 = 2.0, BKS_T1 = 2.6;   /* trecho da animação em que a folha Mesh009 vira (direita → esquerda) */

    function zBkSurfWorldRect(mesh, mx) {   /* retângulo do mundo ocupado por uma folha, já com a curva (morph) aplicada, na pose de repouso */
        const T = clTh(), g = mesh.geometry, P = g.attributes.position, M = g.morphAttributes.position || [], inf = mesh.morphTargetInfluences || [], v = new T.Vector3();
        let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9, ys = 0;
        for (let i = 0; i < P.count; i++) { let x = P.getX(i), y = P.getY(i), z = P.getZ(i); for (let k = 0; k < M.length; k++) { const w = inf[k]; if (w) { x += M[k].getX(i) * w; y += M[k].getY(i) * w; z += M[k].getZ(i) * w; } } v.set(x, y, z).applyMatrix4(mesh.matrixWorld); x0 = Math.min(x0, v.x); x1 = Math.max(x1, v.x); z0 = Math.min(z0, v.z); z1 = Math.max(z1, v.z); ys += v.y; }
        return { x0, x1, z0, z1, y: ys / P.count };
    }
    function zBkSurfFixUV(o) {   /* u anda pelo eixo y local e v pelo x local (descoberto na prova: assim o canvas fica em pé sobre a folha) */
        const T = clTh(), g = o.geometry.clone(), P = g.attributes.position, uv = new Float32Array(P.count * 2);
        for (let i = 0; i < P.count; i++) { uv[i * 2] = (P.getY(i) + 0.75) / 1.5; uv[i * 2 + 1] = (P.getX(i) + 1) / 2; }
        g.setAttribute('uv', new T.BufferAttribute(uv, 2)); o.geometry = g;
    }
    function zBkSurfTex(cv, kind) {
        const T = clTh(), t = new T.CanvasTexture(cv); t.wrapS = t.wrapT = T.RepeatWrapping; try { t.anisotropy = Math.min(8, ZOO.bk3d.r.capabilities.getMaxAnisotropy()); } catch (e) { t.anisotropy = 4; }
        if (kind === 'planar') { return t; }   /* amostrada à mão no shader */
        if (T.sRGBEncoding) t.encoding = T.sRGBEncoding;
        if (kind === 'right') { t.repeat.set(1, -1); t.offset.set(0, 1); }          /* face que aparece quando a folha está deitada na direita */
        else { t.repeat.set(-1, -1); t.offset.set(1, 1); }                          /* face que aparece quando está deitada na esquerda */
        return t;
    }
    function zBkPlanarMat(orig, tex, rect) {
        const T = clTh(), m = orig.clone(); const uTop = { value: tex }, uRect = { value: new T.Vector4(rect.x0, rect.z0, rect.x1, rect.z1) };
        m.onBeforeCompile = sh => {
            sh.uniforms.uTop = uTop; sh.uniforms.uRect = uRect;
            sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vBkWp;varying vec3 vBkWn;').replace('#include <project_vertex>', '#include <project_vertex>\nvBkWp=(modelMatrix*vec4(transformed,1.0)).xyz;vBkWn=normalize(mat3(modelMatrix)*objectNormal);');
            sh.fragmentShader = 'uniform sampler2D uTop;uniform vec4 uRect;varying vec3 vBkWp;varying vec3 vBkWn;\n' + sh.fragmentShader.replace('#include <map_fragment>', '#include <map_fragment>\n{vec2 q=(vBkWp.xz-uRect.xy)/(uRect.zw-uRect.xy);if(abs(vBkWn.y)>0.5&&q.x>=0.0&&q.x<=1.0&&q.y>=0.0&&q.y<=1.0){vec4 tc=texture2D(uTop,vec2(q.x,1.0-q.y));diffuseColor.rgb=pow(tc.rgb,vec3(2.2))*vec3(0.9,0.88,0.84);}}');
        };
        m.customProgramCacheKey = () => 'bkplanar'; m.userData.uTop = uTop; return m;
    }

    /* ---------- pintura das páginas do Grimório ---------- */
    const BKS_CACHE = new Map(), BKS_CY = 320;   /* BKS_CY: altura (no canvas) do centro do altar, onde fica o dragão 3D */
    const bkFit = (c, t, maxW, sz, w) => { let s = sz; c.font = B3F(s, w || '700'); while (c.measureText(t).width > maxW && s > 11) { s -= 1; c.font = B3F(s, w || '700'); } return s; };
    function zBkBtn(c, x, y, w, h, label, on, hits, a, d, sub) {   /* botão pintado: dourado (ação principal), claro (normal) ou apagado */
        c.save(); zB3rr(c, x, y, w, h, 16); const g = c.createLinearGradient(0, y, 0, y + h);
        if (on === 'gold') { g.addColorStop(0, '#ffe07a'); g.addColorStop(1, '#f0902c'); } else if (on === false) { g.addColorStop(0, 'rgba(120,92,56,.28)'); g.addColorStop(1, 'rgba(120,92,56,.28)'); } else { g.addColorStop(0, '#f7e8c0'); g.addColorStop(1, '#d6b97c'); }
        c.shadowColor = 'rgba(40,20,0,.35)'; c.shadowBlur = on === false ? 0 : 8; c.shadowOffsetY = on === false ? 0 : 3; c.fillStyle = g; c.fill(); c.shadowBlur = 0; c.shadowOffsetY = 0; c.lineWidth = 2.5; c.strokeStyle = on === 'gold' ? '#8a4a0a' : on === false ? 'rgba(90,55,20,.3)' : '#7a5628'; c.stroke();
        c.fillStyle = on === 'gold' ? '#2a1600' : on === false ? 'rgba(70,45,20,.55)' : '#3b2410'; c.textAlign = 'center'; c.textBaseline = 'middle'; const ty = y + h / 2 + (sub ? -10 : 1); bkFit(c, label, w - 22, Math.min(30, h * 0.42), '800'); c.fillText(label, x + w / 2, ty);
        if (sub) { c.font = B3F(20, '600'); bkFit(c, sub, w - 22, 20, '600'); c.fillText(sub, x + w / 2, y + h / 2 + 20); } c.restore(); c.textBaseline = 'alphabetic'; if (on !== false && a) hits.push({ x, y, w, h, a, d });
    }
    function zBkCard(c, x, y, w, h, sp, got, own, hits, sel) {   /* carta colecionável: borda neon na cor da raridade */
        const R = ZR[sp.rk], E = ZEL[sp.el], rk = sp.rk, col = R.col, rad = Math.max(10, w * 0.09);
        c.save(); c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 14; c.shadowOffsetY = 6; zB3rr(c, x, y, w, h, rad); c.fillStyle = '#120e0a'; c.fill(); c.restore();
        const gl = got ? 10 + rk * 7 : 4;   /* brilho neon: quanto mais rara, mais forte */
        for (let k = 0; k < (got ? 2 : 1); k++) { c.save(); c.shadowColor = col; c.shadowBlur = gl * (k ? 0.6 : 1.2); c.strokeStyle = col; c.globalAlpha = got ? 1 : 0.45; c.lineWidth = 4; zB3rr(c, x, y, w, h, rad); c.stroke(); c.restore(); }
        c.save(); zB3rr(c, x + 3, y + 3, w - 6, h - 6, rad - 2); const bg = c.createLinearGradient(x, y, x, y + h); bg.addColorStop(0, '#241a12'); bg.addColorStop(1, '#0e0a07'); c.fillStyle = bg; c.fill(); c.restore();
        if (got) { c.save(); c.globalAlpha = 0.9; c.strokeStyle = '#fff'; c.lineWidth = 1.2; c.shadowColor = col; c.shadowBlur = 6; zB3rr(c, x + 3.5, y + 3.5, w - 7, h - 7, rad - 2); c.stroke(); c.restore(); }
        const ax = x + 9, ay = y + 9, aw = w - 18, ah = h * 0.60;
        c.save(); zB3rr(c, ax, ay, aw, ah, rad - 4); c.clip(); const wg = c.createRadialGradient(ax + aw / 2, ay + ah * 0.55, 4, ax + aw / 2, ay + ah / 2, aw * 0.8); wg.addColorStop(0, got ? col + '66' : '#2c241c'); wg.addColorStop(1, '#0a0f18'); c.fillStyle = got ? wg : '#17120d'; c.fillRect(ax, ay, aw, ah);
        if (got) { const im = zB3Img(zPortrait(sp.id)); if (im) { const s0 = Math.max(aw / im.width, ah / im.height); c.drawImage(im, ax + (aw - im.width * s0) / 2, ay + (ah - im.height * s0) / 2, im.width * s0, im.height * s0); } }
        else { c.fillStyle = 'rgba(201,169,101,.55)'; c.font = B3F(w * 0.5, '700'); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('?', ax + aw / 2, ay + ah / 2 + 4); }
        c.restore();
        if (got) { const gr = Math.max(8, w * 0.085), gx = ax + gr + 5, gy = ay + gr + 5, gg = c.createRadialGradient(gx - gr * 0.3, gy - gr * 0.3, 1, gx, gy, gr); gg.addColorStop(0, '#fff'); gg.addColorStop(0.5, E.col); gg.addColorStop(1, '#111'); c.fillStyle = gg; c.beginPath(); c.arc(gx, gy, gr, 0, 6.2832); c.fill(); c.lineWidth = 2; c.strokeStyle = '#0a0705'; c.stroke(); }
        const ny = y + h * 0.67, nh = h * 0.12; c.textAlign = 'center'; c.textBaseline = 'middle';
        if (got) { const nm = sp.n.replace(/^Dragão[- ](?:d[aeo]s? )?/, ''); c.fillStyle = '#f4ead2'; bkFit(c, nm, w - 20, nh * 0.78, '800'); c.fillText(nm, x + w / 2, ny + nh / 2); c.fillStyle = col; c.shadowColor = col; c.shadowBlur = 8; bkFit(c, R.n.toUpperCase(), w - 16, nh * 0.55, '800'); c.fillText(R.n.toUpperCase(), x + w / 2, ny + nh * 1.5); c.shadowBlur = 0; }
        else { c.fillStyle = 'rgba(201,169,101,.6)'; c.font = B3F(nh * 0.7, '700'); c.fillText('Desconhecido', x + w / 2, ny + nh * 0.9); }
        if (got) { const br = w * 0.1, by = y + h - br - 6; const ag = c.createRadialGradient(x + br * 1.2, by - br * 0.3, 1, x + br * 1.4, by, br); ag.addColorStop(0, '#fff1a8'); ag.addColorStop(0.55, '#f1b724'); ag.addColorStop(1, '#8a5a10'); c.fillStyle = ag; c.beginPath(); c.arc(x + br * 1.4, by, br, 0, 6.2832); c.fill(); c.lineWidth = 2; c.strokeStyle = '#0a0705'; c.stroke();
            const hg = c.createRadialGradient(x + w - br * 1.6, by - br * 0.3, 1, x + w - br * 1.4, by, br); hg.addColorStop(0, '#ffb0b0'); hg.addColorStop(0.55, '#e02a2a'); hg.addColorStop(1, '#7a0d0d'); c.fillStyle = hg; c.beginPath(); c.arc(x + w - br * 1.4, by, br, 0, 6.2832); c.fill(); c.stroke();
            c.fillStyle = '#fff'; c.font = B3F(br * 1.05, '900'); c.shadowColor = '#000'; c.shadowBlur = 3; c.fillText(String(ZG[rk]), x + br * 1.4, by + 1); c.fillText(String(ZFEED[rk]), x + w - br * 1.4, by + 1); c.shadowBlur = 0;
            if (own) {
                c.fillStyle = '#7dff9a'; c.shadowColor = '#7dff9a'; c.shadowBlur = 8; c.beginPath(); c.arc(x + w / 2, by, 5, 0, 6.2832); c.fill(); c.shadowBlur = 0;
                if (typeof own === 'number' && own > 1) {
                    const bTxt = '×' + own;
                    c.save(); c.font = B3F(Math.max(12, w * 0.115), '900');
                    const bw0 = c.measureText(bTxt).width + 12, bh0 = Math.max(18, w * 0.145), bx0 = ax + aw - bw0 - 4, by0 = ay + 4;
                    zB3rr(c, bx0, by0, bw0, bh0, bh0 / 2); c.fillStyle = 'rgba(10,16,26,.88)'; c.fill();
                    c.lineWidth = 1.6; c.strokeStyle = '#7dff9a'; c.stroke();
                    c.fillStyle = '#7dff9a'; c.textAlign = 'center'; c.textBaseline = 'middle';
                    c.fillText(bTxt, bx0 + bw0 / 2, by0 + bh0 / 2 + 0.5); c.restore();
                }
            } }
        if (got && (clZooS().an || []).some(a => { const level = zAL(a), cost = zLvCost(level + 1, sp.rk); const resources = clS().res; return a.sp === sp.id && zAdult(a) && level < ZMAXLV && (+a.xp || 0) >= zXpNeed(level + 1, sp.rk) && zLvAfford(cost, sp); })) { c.save(); const label = '↑ EVOLUIR', bw = Math.min(w - 12, Math.max(80, w * .65)), bh = Math.max(19, w * .15), bx = x + (w - bw) / 2, by = y + h * .53; zB3rr(c, bx, by, bw, bh, bh / 2); c.fillStyle = '#baffdc'; c.fill(); c.fillStyle = '#063c2e'; c.font = B3F(Math.max(11, w * .085), '900'); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(label, x + w / 2, by + bh / 2); c.restore(); }
        if (sel) { c.save(); c.strokeStyle = '#fff'; c.shadowColor = '#fff6c8'; c.shadowBlur = 22; c.lineWidth = 3.5; zB3rr(c, x - 6, y - 6, w + 12, h + 12, rad + 4); c.stroke(); c.restore(); }
        c.textBaseline = 'alphabetic'; hits.push({ x, y, w, h, a: 'bsp', d: sp.id });
    }
    function zBkBar(c, x, y, w, label, frac, col, txt) {   /* linha: rótulo à esquerda, barra no meio, número à direita */
        frac = Math.max(0, Math.min(1, frac || 0)); c.textBaseline = 'middle'; c.textAlign = 'left'; c.fillStyle = '#3b2410'; c.font = B3F(24, '800'); c.fillText(label, x, y + 15);
        const bx = x + 150, bw = w - 150 - 150; zB3rr(c, bx, y + 4, bw, 22, 11); c.fillStyle = 'rgba(70,40,10,.22)'; c.fill(); if (frac > 0.01) { zB3rr(c, bx, y + 4, Math.max(14, bw * frac), 22, 11); const g = c.createLinearGradient(bx, 0, bx + bw, 0); g.addColorStop(0, col); g.addColorStop(1, '#ffe9a0'); c.fillStyle = g; c.fill(); } zB3rr(c, bx, y + 4, bw, 22, 11); c.lineWidth = 2; c.strokeStyle = 'rgba(70,40,10,.45)'; c.stroke();
        c.textAlign = 'right'; c.fillStyle = '#4a3016'; c.font = B3F(22, '700'); c.fillText(txt, x + w, y + 15); c.textBaseline = 'alphabetic';
    }
    function zBkSurfPaint(i) {
        const P = ZOO.bP, p = P && P[i]; const side = (i & 1) ? 'R' : 'L'; const z = clZooS(), s = clS(), lay = clZooLayout(s), lv = lay.lv || 1;
        const anSig = (list) => list.map(a => a.id + ':' + (a.lv || 1) + ':' + Math.floor(a.xp || 0) + ':' + Math.round((a.fed || 0) * 10) + ':' + zStar(a) + ':' + (a.nm || '') + ':' + (zAdult(a) ? 1 : 0)).join(';');
        let sig = i + '|' + (ZOO.bsp || '');
        if (!p) sig += '|v'; else if (p.k === 'cards') sig += '|' + p.list.map(sp => (z.book[sp.id] ? 1 : 0) + 'c' + anSig(z.an.filter(a => a.sp === sp.id)) + (zPortrait(sp.id) ? 'p' : '')).join(',') + '|' + Math.floor(+s.res.b || 0) + '|' + Math.floor(+s.res.c || 0);
        else if (p.k === 'altar') sig += '|' + p.spId + '|' + (ZOO.anId || 0) + '|' + (ZOO.fuseArm || 0) + '|' + (ZOO.relArm || 0) + '|' + Math.floor(+s.res.b || 0) + '|' + Math.floor(+s.res.c || 0) + '|' + lv + '|' + (z.book[p.spId] ? 1 : 0) + '|' + (zPortrait(p.spId) ? 'p' : '') + '|' + anSig((z.an || []).filter(a => a.sp === p.spId));
        else if (p.k === 'champions') sig += '|' + (ZOO.anId || 0) + '|' + (ZOO.chPage || 0) + '|' + Math.floor(+s.res.b || 0) + '|' + lv + '|' + anSig(z.an || []);
        else if (p.k === 'cov' || p.k === 'all') sig += '|' + Math.floor(Date.now() / 1000) + '|' + z.an.length + '|' + Object.keys(z.book).length + '|' + lv + '|' + z.eggs.length + '|' + Math.floor((+s.res.b || 0) / 5);
        else if (p.k === 'mine') sig += '|' + Math.floor(Date.now() / 1000) + '|' + z.an.length + '|' + z.eggs.length + '|' + lv + '|' + Math.floor(+s.res.b || 0);
        else if (p.k === 'duel') sig += '|' + Object.keys(z.towers || {}).join() + JSON.stringify(z.runes || {}) + '|' + (z.an.length);
        else if (p.k === 'ach') sig += '|' + JSON.stringify(z.ach || {}) + '|' + Math.floor(Date.now() / 3000);
        let e = BKS_CACHE.get(i); if (e && e.sig === sig) return e;
        const Q = ZOO.lite ? 1.15 : 1.5, cv = e ? e.cv : document.createElement('canvas'); cv.width = Math.round(BKSW * Q); cv.height = Math.round(BKSH * Q); const c = cv.getContext('2d'), hits = [], W = BKSW, H = BKSH; c.setTransform(Q, 0, 0, Q, 0, 0); B3.por = false; B3.W = W; B3.H = H;
        zB3Paper(c, W, H, side, i + 1); c.textBaseline = 'alphabetic';
        const M = 56, INK = '#2b1a0a'; if (p) {
            c.textAlign = 'center'; c.fillStyle = INK; bkFit(c, p.t, W - 2 * M, 54, '800'); c.fillText(p.t, W / 2, 92); c.font = B3F(28, '600'); c.fillStyle = '#7a5226'; c.fillText(p.sub || '', W / 2, 134);
            c.save(); c.strokeStyle = p.col || '#7a5a30'; c.globalAlpha = 0.9; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(M + 30, 156); c.lineTo(W - M - 30, 156); c.stroke(); c.globalAlpha = 0.5; c.lineWidth = 1.5; c.beginPath(); c.moveTo(M + 30, 164); c.lineTo(W - M - 30, 164); c.stroke(); c.restore();
            const y0 = 184, yb = H - 70, bodyH = yb - y0;
            if (p.k === 'altar') {
                const sp = p.sp || zsp(p.spId), R = ZR[sp.rk], E = ZEL[sp.el], got = !!z.book[sp.id];
                const ownList = (z.an || []).filter(a => a.sp === sp.id).sort((x, y) => zDragonPower(sp, y) - zDragonPower(sp, x) || zAL(y) - zAL(x) || x.id - y.id);
                const own = (p.own && ownList.find(a => a.id === p.own.id)) || (ZOO.anId && ownList.find(a => a.id === ZOO.anId)) || ownList[0] || null;
                const anLv = own ? zAL(own) : 1, starN = own ? zStar(own) : 0, y = zYield(sp.rk, lv, anLv, starN);
                const chip = (t, col, tc, x, al) => { c.font = B3F(24, '800'); const w = c.measureText(t).width + 34; const xx = al === 'r' ? x - w : x; zB3rr(c, xx, y0, w, 42, 21); c.save(); c.shadowColor = col; c.shadowBlur = 10; c.fillStyle = col; c.fill(); c.restore(); c.fillStyle = tc; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(t, xx + w / 2, y0 + 22); c.textBaseline = 'alphabetic'; };
                chip(E.n, E.col, '#10210a', M, 'l'); chip(R.n.toUpperCase(), R.col, '#14110c', W - M, 'r');
                const cx = W / 2, cy = BKS_CY, rr = 190; const g = c.createRadialGradient(cx, cy, 10, cx, cy, rr); g.addColorStop(0, 'rgba(255,236,170,.6)'); g.addColorStop(1, 'rgba(255,236,170,0)'); c.fillStyle = g; c.fillRect(cx - rr, cy - rr, rr * 2, rr * 2);
                const titleTxt = !got ? '???' : own ? zDragonLabel(sp, own, z) + zStarTxt(own) : sp.n;
                c.textAlign = 'center'; c.fillStyle = INK; bkFit(c, titleTxt, W - 2 * M - (own ? 56 : 0), 44, '800'); c.fillText(titleTxt, W / 2 - (own ? 18 : 0), 542);
                if (got && own) {
                    const rx = W - M - 40, ry = 510;
                    zB3rr(c, rx, ry, 40, 38, 10); c.fillStyle = 'rgba(120,82,34,.18)'; c.fill(); c.lineWidth = 1.8; c.strokeStyle = 'rgba(90,55,20,.45)'; c.stroke();
                    c.fillStyle = '#4a2e10'; c.font = B3F(20, '800'); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('✎', rx + 20, ry + 20); c.textBaseline = 'alphabetic';
                    hits.push({ x: rx, y: ry, w: 40, h: 38, a: 'zoo-rename', d: String(own.id) });
                }
                if (got) {
                    const lvN = anLv, maxed = lvN >= 10; let by2 = 562;
                    if (own && ownList.length > 1) {
                        const shown = ownList.slice(0, 5), pw = Math.min(104, (W - 2 * M - (shown.length - 1) * 8) / shown.length);
                        let px = (W - (shown.length * pw + (shown.length - 1) * 8)) / 2;
                        shown.forEach((d0, k) => {
                            const act = d0.id === own.id, stTxt = zStar(d0) ? '★' + zStar(d0) : '';
                            const pTxt = '#' + (k + 1) + ' Nv' + zAL(d0) + (stTxt ? ' ' + stTxt : '');
                            zB3rr(c, px, by2, pw, 28, 14); c.fillStyle = act ? '#f0902c' : 'rgba(90,55,20,.14)'; c.fill();
                            c.lineWidth = act ? 2.2 : 1.4; c.strokeStyle = act ? '#7a3a08' : 'rgba(90,55,20,.35)'; c.stroke();
                            c.fillStyle = act ? '#241200' : '#4a3016'; c.textAlign = 'center'; c.textBaseline = 'middle';
                            bkFit(c, pTxt, pw - 10, 16, '800'); c.fillText(pTxt, px + pw / 2, by2 + 15);
                            hits.push({ x: px, y: by2, w: pw, h: 28, a: 'zoo-sel-animal', d: String(d0.id) });
                            px += pw + 8;
                        });
                        c.textBaseline = 'alphabetic';
                        by2 += 36;
                    }
                    if (own) {
                        const rk = sp.rk, st2 = zState(own, lv), fed = Math.max(0, own.fed || 0), nd = maxed ? 0 : zXpNeed(lvN + 1, rk), pv = lvN > 1 ? zXpNeed(lvN, rk) : 0, xp = Math.floor(own.xp || 0);
                        zBkBar(c, M, by2, W - 2 * M, 'Comida', fed / 12, '#58b04a', Math.round(fed) + ' / 12 h'); by2 += 34;
                        zBkBar(c, M, by2, W - 2 * M, 'Nível ' + lvN, maxed ? 1 : xp / Math.max(1, nd), '#e0a020', maxed ? 'máximo' : xp + ' / ' + nd + ' XP'); by2 += 34;
                        if (!zAdult(own)) { zBkBar(c, M, by2, W - 2 * M, 'Cresce', (own.g || 0) / ZGROW[rk], '#4aa8d8', Math.round(100 * (own.g || 0) / ZGROW[rk]) + '%'); by2 += 34; }
                        c.textAlign = 'center'; c.fillStyle = '#4a3016'; c.font = B3F(20, '700'); c.fillText(st2.t + ' · ⚡ ' + zDragonPower(sp, own), W / 2, by2 + 14); by2 += 24;
                    }
                    c.textAlign = 'center'; c.fillStyle = '#2f5a22'; c.font = B3F(20, '800'); c.fillText('Produz +' + y.b + ' biomassa' + (y.c ? ' e +' + y.c + ' cristal' : '') + ' por hora', W / 2, by2 + 14);
                    const bw = (W - 2 * M - 24) / 3, bh = 66, byy = yb - bh - 4;
                    if (own) {
                        const rk = sp.rk, need = maxed ? 0 : zXpNeed(lvN + 1, rk), lc = maxed ? null : zLvCost(lvN + 1, rk);
                        const canAfford = !maxed && lc && zLvAfford(lc, sp);
                        const xpReady = !maxed && zAdult(own) && (own.xp || 0) >= need;
                        zBkBtn(c, M, byy, bw, bh, maxed ? 'Nível máx.' : (xpReady ? 'Subir nível' : 'Treino ' + Math.floor(own.xp || 0) + '/' + need), (canAfford && xpReady) ? 'gold' : false, hits, 'zoo-levelup', String(own.id), maxed ? '' : lc.b + ' bio · ' + lc.c + ' cr · ' + lc.f + ' frag.');
                        if (ownList.length > 1) {
                            const fuseDst = ownList.find(x => x.id !== own.id);
                            const fArm = ZOO.fuseArm === own.id;
                            const fx0 = M + 2 * (bw + 12);
                            zBkBtn(c, fx0, byy, bw, bh, fArm ? 'Confirmar?' : 'Fundir', 'gold', hits, '', '', fArm ? 'toque de novo' : 'em ' + zDragonLabel(sp, fuseDst, z, true));
                            hits.push({ x: fx0, y: byy, w: bw, h: bh, a: 'zoo-fuse', d: String(own.id), dst: String(fuseDst.id) });
                            const rArm = ZOO.relArm === own.id, rw = 240, rx0 = W / 2 - rw / 2, ry0 = byy + bh + 6;
                            zB3rr(c, rx0, ry0, rw, 26, 13); c.fillStyle = rArm ? '#b83228' : 'rgba(90,55,20,.14)'; c.fill();
                            c.lineWidth = 1.4; c.strokeStyle = rArm ? '#701812' : 'rgba(90,55,20,.35)'; c.stroke();
                            c.fillStyle = rArm ? '#fff' : '#6a3818'; c.font = B3F(15, '800'); c.textAlign = 'center'; c.textBaseline = 'middle';
                            c.fillText(rArm ? 'Confirmar soltar?' : 'Soltar esta cópia', W / 2, ry0 + 14); c.textBaseline = 'alphabetic';
                            hits.push({ x: rx0, y: ry0, w: rw, h: 26, a: 'zoo-release', d: String(own.id) });
                        } else {
                            const rArm = ZOO.relArm === own.id;
                            zBkBtn(c, M + 2 * (bw + 12), byy, bw, bh, rArm ? 'Confirmar?' : 'Soltar', rArm ? 'gold' : true, hits, 'zoo-release', String(own.id), rArm ? 'toque de novo' : 'libera vaga');
                        }
                    } else {
                        c.font = B3F(23, '700'); c.fillStyle = '#2f6a22'; c.textAlign = 'center';
                        c.fillText('Espécie descoberta · você tem 0 no Covil', W / 2, byy + 18);
                        c.font = B3F(20, '500'); c.fillStyle = '#5a3a14';
                        c.fillText(sp.rk === 0 ? 'Disponível na loja do Covil.' : 'Cruze na Árvore Incubadora para obter outro.', W / 2, byy + 46);
                    }
                } else { c.font = B3F(34, '800'); c.fillStyle = '#7a3a14'; c.textAlign = 'center'; c.fillText('Mistério Rúnico', W / 2, 630); c.font = B3F(26, '500'); c.fillStyle = '#4a3016'; zB3Wrap(c, sp.rk === 0 ? 'Disponível na loja do Covil.' : 'Pode nascer de cruzamentos de dragões ' + ZR[Math.max(0, sp.rk - 1)].n.toLowerCase() + ' ou superiores.', W / 2, 676, W - 2 * M, 32, 3); }
            } else if (p.k === 'cards') {
                const list = p.list, n = list.length, cols = 3, rows = Math.ceil(n / cols), g = 16, M2 = 44; let cw = (W - 2 * M2 - g * (cols - 1)) / cols, ch = cw * 1.42; const maxH = (bodyH + 10 - g * (rows - 1)) / rows; if (ch > maxH) { ch = maxH; cw = ch / 1.42; } const totW = cols * cw + (cols - 1) * g, sx = (W - totW) / 2, sy = y0 + 6 + (bodyH - (rows * ch + (rows - 1) * g)) / 2;
                const act = ZOO.bsp || (list[0] && list[0].id); list.forEach((sp, k) => { const x = sx + (k % cols) * (cw + g), yy = sy + Math.floor(k / cols) * (ch + g); zBkCard(c, x, yy, cw, ch, sp, !!z.book[sp.id], z.an.filter(a => a.sp === sp.id).length, hits, sp.id === act); });
            } else if (p.k === 'champions') {
                const myDragons = (z.an || []).slice().sort((x, y) => zDragonPower(zsp(y.sp), y) - zDragonPower(zsp(x.sp), x) || zAL(y) - zAL(x) || x.id - y.id);
                const pgSize = 6, totPgs = Math.max(1, Math.ceil(myDragons.length / pgSize)), chPg = Math.max(0, Math.min(ZOO.chPage || 0, totPgs - 1));
                ZOO.chPage = chPg;
                const slice = myDragons.slice(chPg * pgSize, (chPg + 1) * pgSize);
                const navH = totPgs > 1 ? 52 : 0, listH = bodyH - navH, n = slice.length, rh = Math.min(86, (listH - 8 * Math.max(0, n - 1)) / Math.max(1, n));
                slice.forEach((a, k) => {
                    const sp = zsp(a.sp), st2 = zState(a, lv), R = ZR[sp.rk], x = M, y = y0 + k * (rh + 8), w = W - 2 * M;
                    zB3rr(c, x, y, w, rh, 12);
                    c.fillStyle = (ZOO.anId === a.id) ? 'rgba(255,236,170,.82)' : 'rgba(255,248,225,.55)';
                    c.fill(); c.lineWidth = (ZOO.anId === a.id) ? 3.2 : 2.2; c.strokeStyle = R.col; c.stroke();
                    const im = zB3Img(zPortrait(sp.id));
                    c.save(); c.beginPath(); c.arc(M + 36, y + rh / 2, rh * 0.36, 0, 6.2832); c.clip();
                    c.fillStyle = '#0c1624'; c.fillRect(M + 8, y + 6, rh * 0.78, rh * 0.78);
                    if (im) { const s0 = Math.max(rh * 0.78 / im.width, rh * 0.78 / im.height); c.drawImage(im, M + 36 - im.width * s0 / 2, y + rh / 2 - im.height * s0 / 2, im.width * s0, im.height * s0); }
                    c.restore();
                    const lbl = zDragonLabel(sp, a, z) + zStarTxt(a);
                    c.textAlign = 'left'; c.fillStyle = INK; bkFit(c, lbl + '  Nv ' + zAL(a) + ' · ⚡ ' + zDragonPower(sp, a), w - 200, Math.min(22, rh * 0.3), '800');
                    c.fillText(lbl + '  Nv ' + zAL(a) + ' · ⚡ ' + zDragonPower(sp, a), M + 76, y + rh * 0.42);
                    c.font = B3F(Math.min(18, rh * 0.23), '500'); c.fillStyle = '#5a3a14';
                    c.fillText(st2.t, M + 76, y + rh * 0.76);
                    hits.push({ x: M, y, w: W - 2 * M, h: rh, a: 'zoo-sel-animal', d: String(a.id) });
                });
                if (totPgs > 1) {
                    const py = yb - 42;
                    if (chPg > 0) zBkBtn(c, M, py, 140, 40, '‹ Anterior', true, hits, 'zoo-chpg', '-1');
                    c.fillStyle = INK; c.textAlign = 'center'; c.font = B3F(20, '800'); c.fillText('Página ' + (chPg + 1) + ' / ' + totPgs, W / 2, py + 27);
                    if (chPg < totPgs - 1) zBkBtn(c, W - M - 140, py, 140, 40, 'Próxima ›', true, hits, 'zoo-chpg', '1');
                }
                if (!myDragons.length) { c.fillStyle = '#7a5a30'; c.textAlign = 'center'; c.font = B3F(24, '600'); c.fillText('Nenhum dragão ativo ainda.', W / 2, y0 + 60); }
            } else if (p.k === 'all') {
                const cols = 4, g = 10, cw = (W - 2 * 44 - g * (cols - 1)) / cols, rowsN = Math.ceil(ZSP.length / cols), ch = Math.min(124, (bodyH - 40 - g * (rowsN - 1)) / rowsN), sx = 44, sy = y0 + 4;
                ZSP.forEach((sp, k) => { const x = sx + (k % cols) * (cw + g), yy = sy + Math.floor(k / cols) * (ch + g), got = !!z.book[sp.id], R = ZR[sp.rk], n = z.an.filter(a => a.sp === sp.id).length;
                    c.save(); c.shadowColor = got ? R.col : 'transparent'; c.shadowBlur = got ? 8 + sp.rk * 4 : 0; zB3rr(c, x, yy, cw, ch, 12); c.fillStyle = got ? '#171210' : '#2a2118'; c.fill(); c.lineWidth = 3; c.strokeStyle = got ? R.col : 'rgba(120,100,70,.6)'; c.stroke(); c.restore();
                    if (got) { const im = zB3Img(zPortrait(sp.id)); c.save(); zB3rr(c, x + 5, yy + 5, cw - 10, ch * 0.58, 8); c.clip(); const bg = c.createRadialGradient(x + cw / 2, yy + ch * 0.35, 3, x + cw / 2, yy + ch * 0.35, cw * 0.6); bg.addColorStop(0, R.col + '77'); bg.addColorStop(1, '#0a0f18'); c.fillStyle = bg; c.fillRect(x, yy, cw, ch); if (im) { const w2 = cw - 10, h2 = ch * 0.58, s0 = Math.max(w2 / im.width, h2 / im.height); c.drawImage(im, x + 5 + (w2 - im.width * s0) / 2, yy + 5 + (h2 - im.height * s0) / 2, im.width * s0, im.height * s0); } c.restore();
                        c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#f4ead2'; const nm = sp.n.replace(/^Dragão[- ](?:d[aeo]s? )?/, ''); bkFit(c, nm, cw - 10, 17, '800'); c.fillText(nm, x + cw / 2, yy + ch * 0.76); c.fillStyle = R.col; c.font = B3F(13, '800'); c.fillText(R.n.toUpperCase(), x + cw / 2, yy + ch * 0.91); if (n) { c.fillStyle = '#7dff9a'; c.font = B3F(15, '800'); c.textAlign = 'right'; c.fillText('×' + n, x + cw - 8, yy + 18); } c.textBaseline = 'alphabetic'; }
                    else { c.fillStyle = 'rgba(201,169,101,.6)'; c.font = B3F(cw * 0.42, '700'); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('?', x + cw / 2, yy + ch * 0.5); c.textBaseline = 'alphabetic'; }
                    hits.push({ x, y: yy, w: cw, h: ch, a: 'zoo-spgo', d: sp.id }); });
                const ly = sy + rowsN * (ch + g) + 18; c.textAlign = 'center'; c.font = B3F(21, '700'); const els = ['terra', 'agua', 'cristal', 'estelar']; const pw = (W - 2 * 44) / 4; els.forEach((el, k) => { const lst = ZSP.filter(x => x.el === el), n = lst.filter(x => z.book[x.id]).length; c.fillStyle = ZEL[el].col; c.beginPath(); c.arc(44 + k * pw + 14, ly, 8, 0, 6.2832); c.fill(); c.fillStyle = INK; c.textAlign = 'left'; c.fillText(ZEL[el].n + ' ' + n + '/' + lst.length, 44 + k * pw + 28, ly + 6); });
                c.textAlign = 'center'; c.fillStyle = '#5a3a14'; c.font = B3F(20, '500'); c.fillText('Toque num dragão para abrir a página dele', W / 2, ly + 40);
            } else if (p.k === 'mine') {
                const ad = z.an.filter(zAdult); let ready = 0, hungry = 0; ad.forEach(a => { if ((a.st || 0) > 0) ready++; if (!(a.fed > 0.02)) hungry++; });
                const st = [[String(ad.length), 'adultos'], [String(ready), 'prontos'], [String(z.eggs.length), 'ovos']], sw = (W - 2 * M - 24) / 3, sh = 76; st.forEach((t, k) => { const x = M + k * (sw + 12); zB3rr(c, x, y0, sw, sh, 14); c.fillStyle = 'rgba(90,55,20,.13)'; c.fill(); c.lineWidth = 1.5; c.strokeStyle = 'rgba(90,55,20,.3)'; c.stroke(); c.fillStyle = INK; c.textAlign = 'center'; c.font = B3F(34, '800'); c.fillText(t[0], x + sw / 2, y0 + 40); c.font = B3F(21, '500'); c.fillStyle = '#6a4a22'; c.fillText(t[1], x + sw / 2, y0 + 64); });
                const bw = (W - 2 * M - 14) / 2, bh = 60; let by = y0 + sh + 14; const btn = [['Coletar' + (ready ? ' (' + ready + ')' : ''), ready ? 'gold' : false, 'zoo-collect'], ['Cruzar', ad.length >= 2 ? true : false, 'zoo-breed'], ['Trazer dragão', true, 'zoo-buy']]; btn.forEach((b, k) => zBkBtn(c, M + (k % 2) * (bw + 14), by + Math.floor(k / 2) * (bh + 10), bw, bh, b[0], b[1], hits, b[2], '')); by += 2 * (bh + 10) + 4;
                /* menu de aprimorar covil exclusivo da colonia */
                { c.textAlign = 'left'; c.fillStyle = INK; c.font = B3F(30, '800'); c.fillText('Árvore Incubadora', M, by + 22); by += 34; const eg = z.eggs[0], bh2 = 96;
                    zB3rr(c, M, by, W - 2 * M, bh2, 14); c.fillStyle = 'rgba(255,248,225,.5)'; c.fill(); c.lineWidth = 2.5; c.strokeStyle = lay.eggs ? '#d9a52a' : 'rgba(90,55,20,.35)'; c.stroke();
                    if (!lay.eggs) { c.fillStyle = '#5a3a14'; c.textAlign = 'center'; c.font = B3F(23, '600'); zB3Wrap(c, 'Construa a Árvore Incubadora na colônia para chocar ovos.', W / 2, by + 38, W - 2 * M - 30, 30, 2); }
                    else if (!eg) { c.fillStyle = '#3f6a22'; c.textAlign = 'center'; c.font = B3F(25, '700'); c.fillText('Livre — cruze dois dragões', W / 2, by + 56); }
                    else { const ok = eg.el >= eg.tot, im = zB3Img(zEggImg('mist')); if (im) c.drawImage(im, M + 14, by + 8, 62, 62 * (im.height / im.width)); c.textAlign = 'left'; c.fillStyle = INK; c.font = B3F(26, '800'); c.fillText(ok ? 'Pronto para nascer!' : 'Dragão misterioso', M + 92, by + 38); const pr = Math.min(1, eg.el / Math.max(1, eg.tot)); zB3rr(c, M + 92, by + 54, W - 2 * M - 200, 14, 7); c.fillStyle = 'rgba(90,55,20,.25)'; c.fill(); zB3rr(c, M + 92, by + 54, Math.max(8, (W - 2 * M - 200) * pr), 14, 7); c.fillStyle = ok ? '#e0a020' : '#5aa03a'; c.fill(); c.fillStyle = '#6a4a22'; c.font = B3F(21, '700'); c.fillText(ok ? '' : zClock(eg.tot - eg.el), M + 92, by + 86); if (ok && z.an.length < lay.slots) zBkBtn(c, W - M - 100, by + 16, 88, 64, 'Chocar', 'gold', hits, 'zoo-hatch', ''); }
                    by += bh2 + 16; }
                c.textAlign = 'left'; c.fillStyle = INK; c.font = B3F(30, '800'); c.fillText('Seus dragões', M, by + 22); by += 36; const rh = 74, maxRows = Math.max(1, Math.floor((yb + 10 - by) / (rh + 8)));
                z.an.slice(0, maxRows).forEach((a, k) => { const sp = zsp(a.sp), st2 = zState(a, lv), R = ZR[sp.rk], y = by + k * (rh + 8); c.save(); c.shadowColor = R.col; c.shadowBlur = 9; zB3rr(c, M, y, W - 2 * M, rh, 14); c.fillStyle = ZOO.bsp === a.sp ? 'rgba(255,211,92,.4)' : 'rgba(255,248,225,.55)'; c.fill(); c.lineWidth = 3; c.strokeStyle = R.col; c.stroke(); c.restore(); const im = zB3Img(zPortrait(sp.id)); c.save(); c.beginPath(); c.arc(M + 40, y + rh / 2, 30, 0, 6.2832); c.clip(); c.fillStyle = '#0c1624'; c.fillRect(M + 10, y + 8, 60, 60); if (im) { const s0 = Math.max(60 / im.width, 60 / im.height); c.drawImage(im, M + 40 - im.width * s0 / 2, y + rh / 2 - im.height * s0 / 2, im.width * s0, im.height * s0); } c.restore(); c.textAlign = 'left'; c.fillStyle = INK; c.font = B3F(26, '800'); c.fillText(sp.n.replace(/^Dragão[- ](?:d[aeo]s? )?/, '') + '  Nv ' + zAL(a), M + 84, y + 32); c.font = B3F(21, '500'); c.fillStyle = '#5a3a14'; c.fillText(st2.t, M + 84, y + 60); hits.push({ x: M, y, w: W - 2 * M, h: rh, a: 'zoo-bsp', d: sp.id }); });
            } else if (p.k === 'duel') {
                z.towers = z.towers || {}; z.runes = z.runes || {}; const rh = Math.min(100, (bodyH - 150) / ZTOWERS.length - 8);
                ZTOWERS.forEach((tw, k) => { const x = M, y = y0 + k * (rh + 8), w = W - 2 * M, done = !!z.towers[tw.id]; zB3rr(c, x, y, w, rh, 14); c.fillStyle = done ? 'rgba(120,170,90,.26)' : 'rgba(255,248,225,.55)'; c.fill(); c.lineWidth = 3; c.strokeStyle = tw.col; c.stroke();
                    c.textAlign = 'left'; c.fillStyle = INK; bkFit(c, tw.n, w - 190, 27, '800'); c.fillText(tw.n, x + 18, y + rh * 0.4); c.fillStyle = '#7a5226'; c.font = B3F(21, '600'); c.fillText(tw.boss + ' · ' + tw.runa, x + 18, y + rh * 0.76);
                    c.textAlign = 'right'; c.font = B3F(24, '800'); c.fillStyle = done ? '#2f6a22' : '#a0521a'; c.fillText(done ? '✔ vencida' : 'Lv ' + tw.lv, x + w - 18, y + rh * 0.55); hits.push({ x, y, w, h: rh, a: 'zoo-colony-arena', d: String(k) }); });
                const ry = y0 + ZTOWERS.length * (rh + 8) + 6; c.textAlign = 'center'; c.fillStyle = INK; const rn = ZTOWERS.map(t => t.runa.replace(/^Runa (d[aeo] )?/, '') + ' ' + (z.runes[t.runa] || 0)).join(' · '); bkFit(c, 'Runas: ' + rn, W - 2 * M, 22, '700'); c.fillText('Runas: ' + rn, W / 2, ry + 22);
                zBkBtn(c, M, ry + 40, W - 2 * M, 72, 'Entrar nos Duelos', 'gold', hits, 'zoo-colony-arena', '', 'vença para ganhar cristais e runas');
            } else if (p.k === 'ach') {
                z.ach = z.ach || {}; const ih = 104; ZACH.slice(0, Math.floor((bodyH + 8) / (ih + 8))).forEach((a, k) => { const cur = Math.min(a.t, a.f(z)), done = !!z.ach[a.id], can = !done && cur >= a.t, x = M, y = y0 + k * (ih + 8), w = W - 2 * M; zB3rr(c, x, y, w, ih, 14); c.fillStyle = done ? 'rgba(120,170,90,.24)' : 'rgba(255,248,225,.55)'; c.fill(); c.lineWidth = 2.5; c.strokeStyle = can ? '#e0a020' : 'rgba(90,55,20,.35)'; c.stroke(); c.textAlign = 'left'; c.fillStyle = INK; bkFit(c, a.n, w * 0.6, 28, '800'); c.fillText(a.n, x + 18, y + 36); zB3rr(c, x + 18, y + 52, w * 0.55, 14, 7); c.fillStyle = 'rgba(90,55,20,.25)'; c.fill(); zB3rr(c, x + 18, y + 52, Math.max(7, w * 0.55 * cur / a.t), 14, 7); c.fillStyle = done ? '#5aa03a' : '#d9962a'; c.fill(); c.fillStyle = '#6a4a22'; c.font = B3F(22, '600'); c.fillText(cur + ' / ' + a.t, x + 18, y + 94); if (done) { c.fillStyle = '#3f8a2e'; c.textAlign = 'right'; c.font = B3F(44, '800'); c.fillText('✔', x + w - 22, y + 66); } else zBkBtn(c, x + w - 178, y + 20, 160, 64, '+' + a.r + ' ◆', can ? 'gold' : false, hits, 'zoo-ach', a.id); });
            }
            c.fillStyle = '#7a5a30'; c.textAlign = 'center'; c.font = B3F(24, '600'); c.fillText('· ' + (i + 1) + ' ·', W / 2, H - 30);
        }
        if (!e) e = { cv, tex: {} }; e.sig = sig; e.hits = hits; BKS_CACHE.set(i, e); Object.keys(e.tex).forEach(k => { e.tex[k].needsUpdate = true; }); return e;
    }
    function zBkSurfTexFor(i, kind) { const e = zBkSurfPaint(i); if (!e.tex[kind]) e.tex[kind] = zBkSurfTex(e.cv, kind); e.tex[kind].needsUpdate = true; return e.tex[kind]; }

    function zBkCamPlace(st, w, h) {   /* câmera do livro: ereta e imponente (mais em pé), com visão frontal de atril */
        const cam = st && st.cam; if (!cam) return; if (w) { st.vw = w; st.vh = h; } w = st.vw; h = st.vh; if (!w || !h) return;
        const v = st.view || (st.view = { el: 0.46, az: 0, zm: 0.94 }), vTan = Math.tan(32 * Math.PI / 360), hTan = vTan * (w / h), dist = Math.max(26 / hTan, 16 / vTan) * 1.02 * v.zm, ce = Math.cos(v.el);
        cam.aspect = w / h; const px = v.px || 0, pz = v.pz || 0; cam.position.set(px + dist * ce * Math.sin(v.az), 6.5 + dist * Math.sin(v.el), pz + dist * ce * Math.cos(v.az)); cam.lookAt(px, 4.8, pz); cam.setViewOffset(w, h, 0, -h * 0.012, w, h); cam.updateProjectionMatrix();
    }

    /* ---------- ligação com o modelo ---------- */
    function zBkSurfInit(state) {
        try {
            const T = clTh(), root = state.root; root.updateMatrixWorld(true);
            const m9 = root.getObjectByName('Mesh009'), p2 = root.getObjectByName('Page2'), p8 = root.getObjectByName('Pages008'); if (!m9 || !p2 || !p8) return false;
            state.mx.setTime(BKS_T0); root.updateMatrixWorld(true);
            const rc = zBkSurfWorldRect(m9, state.mx); const rectR = { x0: rc.x0, x1: rc.x1, z0: rc.z0, z1: rc.z1, y: rc.y }, rectL = { x0: -rc.x1, x1: -rc.x0, z0: rc.z0, z1: rc.z1, y: rc.y };
            zBkSurfFixUV(m9); zBkSurfFixUV(p2);
            const base = { roughness: 0.92, metalness: 0 };
            const mk = (side) => new T.MeshStandardMaterial(Object.assign({ side }, base));
            m9.material = mk(T.FrontSide); p2.material = mk(T.FrontSide);
            const back9 = new T.Mesh(m9.geometry, mk(T.BackSide)); back9.morphTargetInfluences = m9.morphTargetInfluences; back9.morphTargetDictionary = m9.morphTargetDictionary; back9.frustumCulled = false; m9.add(back9);
            const back2 = new T.Mesh(p2.geometry, mk(T.BackSide)); back2.morphTargetInfluences = p2.morphTargetInfluences; back2.morphTargetDictionary = p2.morphTargetDictionary; back2.frustumCulled = false; p2.add(back2);
            const lt = zBkSurfTexFor(0, 'planar'); p8.material = zBkPlanarMat(p8.material, lt, rectL);
            window.__bkst = state; state.surf = { m9, p2, p8, back9, back2, rectL, rectR, uTop: p8.material.userData.uTop, cur: -1, hits: [[], []] };
            { const cxw = (rectL.x0 + rectL.x1) / 2, czw = rectL.z0 + (rectL.z1 - rectL.z0) * (BKS_CY / BKSH); state.hostY = rectL.y + 2.0; state.pageY = rectL.y; if (state.runeGroup) { state.runeGroup.position.set(cxw, rectL.y + 0.35, czw); state.runeGroup.scale.setScalar(1.15); } if (state.dragonHost) { state.dragonHost.position.set(cxw, state.hostY, czw); state.dragonHost.scale.setScalar(1.25); } }
            B3.pages = ZOO.bP; zBkSurfShow(); return true;
        } catch (e) { ZOO.lastErr = 'surfinit ' + e; state.surf = null; return false; }
    }
    function zBkSurfShow() {   /* mostra o par de páginas atual (repouso: esquerda = pilha da esquerda, direita = folha Mesh009) */
        const st = ZOO.bk3d, S = st && st.surf; if (!S || !ZOO.bP) return; const i = (ZOO.bs || 0) << 1, P = ZOO.bP;
        const eL = zBkSurfPaint(i), eR = i + 1 < P.length ? zBkSurfPaint(i + 1) : null;
        S.uTop.value = zBkSurfTexFor(i, 'planar'); S.back9.material.map = eR ? zBkSurfTexFor(i + 1, 'right') : null; S.back9.material.color.set(eR ? 0xffffff : 0xcdb88a); S.back9.material.needsUpdate = true;
        S.hits = [eL.hits, eR ? eR.hits : []]; S.cur = i;
    }
    function zBkSurfTurnStart(st, tr) {
        const S = st.surf, P = ZOO.bP, from = tr.from << 1, to = tr.to << 1, T = clTh(); const has = k => k >= 0 && k < P.length;
        const col = (mat, tex) => { mat.map = tex; mat.color.set(tex ? 0xffffff : 0xcdb88a); mat.needsUpdate = true; };
        if (tr.fwd) {   /* frente (direita agora) vira; verso = nova esquerda; embaixo aparece a nova direita */
            col(S.m9.material, has(to) ? zBkSurfTexFor(to, 'left') : null); col(S.p2.material, null); col(S.back2.material, has(to + 1) ? zBkSurfTexFor(to + 1, 'right') : null);
        } else {        /* volta: a folha parte da esquerda mostrando a esquerda atual e pousa na direita com a nova direita; embaixo aparece a nova esquerda */
            col(S.m9.material, has(from) ? zBkSurfTexFor(from, 'left') : null); col(S.back2.material, has(from + 1) ? zBkSurfTexFor(from + 1, 'right') : null); col(S.back9.material, has(to + 1) ? zBkSurfTexFor(to + 1, 'right') : null);
            S.uTop.value = zBkSurfTexFor(to, 'planar');
        }
    }
    function zBkSurfTurnEnd(st, tr) { ZOO.bs = tr.to; zBkSurfShow(); try { const m = CL.root && CL.root.querySelector('.cl-zmod.book'); if (m) { zBkNav(m); zBkRibbonsSync(m); } zBkSync3DDragon(); } catch (e) {} }   /* atualiza setas (voltar/avançar), título e fitas depois de cada virada */
    function zBkSurfPick(ev) {
        const st = ZOO.bk3d, S = st && st.surf; if (!S || st.turn || !st.cam || !st.cv) return; const T = clTh(), r = st.cv.getBoundingClientRect(), nd = new T.Vector2(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1), rc = new T.Raycaster(); rc.setFromCamera(nd, st.cam);
        const pl = new T.Plane(new T.Vector3(0, 1, 0), -S.rectR.y), pt = new T.Vector3(); if (!rc.ray.intersectPlane(pl, pt)) return;
        let k = -1, cx = 0, cy = 0; const R = S.rectR, L = S.rectL;
        if (pt.x >= R.x0 && pt.x <= R.x1 && pt.z >= R.z0 && pt.z <= R.z1) { k = 1; cx = (pt.x - R.x0) / (R.x1 - R.x0) * BKSW; cy = (pt.z - R.z0) / (R.z1 - R.z0) * BKSH; }
        else if (pt.x >= L.x0 && pt.x <= L.x1 && pt.z >= L.z0 && pt.z <= L.z1) { k = 0; cx = (pt.x - L.x0) / (L.x1 - L.x0) * BKSW; cy = (pt.z - L.z0) / (L.z1 - L.z0) * BKSH; }
        if (k < 0) return; const hs = S.hits[k] || []; for (let q = hs.length - 1; q >= 0; q--) { const h = hs[q]; if (cx >= h.x && cx <= h.x + h.w && cy >= h.y && cy <= h.y + h.h) { zBkSurfAct(h); return; } }
    }
    function zBkToast(msg, bad) {   /* aviso dentro do próprio livro (a mensagem normal ficava escondida atrás dele) */
        try { const bk = CL.root && CL.root.querySelector('.cl-bk'); if (!bk || !msg) return; let t = bk.querySelector('.cl-bk-toast'); if (!t) { t = document.createElement('div'); t.className = 'cl-bk-toast'; bk.appendChild(t); } t.textContent = msg; t.classList.toggle('bad', !!bad); t.classList.remove('on'); void t.offsetWidth; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 2600); } catch (e) {}
    }
    function zBkSurfAct(h) {
        if (h.a === 'zoo-spgo') { const sp = zsp(h.d); if (!sp) return; const pair = { terra: 1, agua: 2, cristal: 3, estelar: 4 }[sp.el] || 1; ZOO.fuseArm = 0; ZOO.relArm = 0; const ownSp = (clZooS().an || []).filter(a => a.sp === h.d).sort((x, y) => zDragonPower(sp, y) - zDragonPower(sp, x)); if (ownSp[0]) ZOO.anId = ownSp[0].id; try { aliveSound('tick'); } catch (e) {} if ((ZOO.bs || 0) !== pair) zBkGoto(pair); setTimeout(() => { try { ZOO.bsp = h.d; ZOO.bP = zBkPages(); zBkSurfShow(); zBkSync3DDragon(); } catch (e) {} }, (ZOO.bs || 0) !== pair ? 1900 : 60); return; }
        if (h.a === 'bsp' || h.a === 'zoo-bsp') { ZOO.bsp = h.d || null; ZOO.fuseArm = 0; ZOO.relArm = 0; if (h.d) { const sp0 = zsp(h.d), ownSp = (clZooS().an || []).filter(a => a.sp === h.d).sort((x, y) => zDragonPower(sp0, y) - zDragonPower(sp0, x)); ZOO.anId = ownSp[0] ? ownSp[0].id : 0; } try { aliveSound('tick'); } catch (e) {} const m = CL.root && CL.root.querySelector('.cl-zmod.book'); try { ZOO.bP = zBkPages(); } catch (e) {} zBkSurfShow(); try { zBkSync3DDragon(); } catch (e) {} return; }
        if (h.a === 'zoo-lairup') { try { CL.sel = parseInt(h.d, 10); clUpgModalOpen(CL.sel); } catch (e) { ZOO.lastErr = 'lairup ' + e; } return; }
        const el = document.createElement('button'); el.dataset.id = h.d || ''; el.dataset.sp = h.d || ''; el.dataset.d = h.d || ''; if (h.dst) el.dataset.dst = h.dst; el.dataset.cl = h.a; const m0 = clMsg; try { clMsg = (m, b) => { zBkToast(m, b); try { m0(m, b); } catch (e) {} }; clBichosClick(h.a, el); } catch (e) { ZOO.lastErr = 'surfact ' + e; } finally { clMsg = m0; } setTimeout(() => { try { ZOO.bP = zBkPages(); zBkSurfShow(); zBkSync3DDragon(); } catch (e) {} }, 140);
    }
    window.__bkdbg = { pick: ev => zBkSurfPick(ev), act: h => zBkSurfAct(h), zoo: ZOO };

    function zBkResPaint() {   /* barra fixa com os recursos e o Covil, sempre visível sobre o livro */
        try { const bk = CL.root && CL.root.querySelector('.cl-bk'); if (!bk) return; let b = bk.querySelector('.cl-bk-res'); if (!b) { b = document.createElement('div'); b.className = 'cl-bk-res'; bk.appendChild(b); }
            const s = clS(), st = clStats(), lay = clZooLayout(s), z = clZooS(s), cap = st.cap || {}, chip = (ic, col, v, c, tip) => '<span class="rc" title="' + tip + '" style="--c:' + col + '"><i class="ph-bold ' + ic + '"></i><b>' + clFmt(v) + '</b>' + (c ? '<small>/' + clFmt(c) + '</small>' : '') + '</span>';
            const h = CLD.RES.filter(r => ['c', 'b', 'm'].indexOf(r[0]) >= 0).map(r => chip(r[2], r[3], s.res[r[0]] || 0, cap[r[0]], r[1])).join('') + '<span class="rc cv" style="--c:#ff8a6a" title="Covil dos Dragões"><i class="ph-bold ph-castle-turret"></i><b>Covil ' + (lay.lv || 0) + '</b><small>' + z.an.length + '/' + lay.slots + '</small></span>' + (s.credit ? '<span class="rc" style="--c:#ffd35c" title="Crédito a receber: entra quando houver espaço no armazém"><i class="ph-bold ph-hourglass"></i><b>+' + clFmt(Object.keys(s.credit).reduce((a, k) => a + s.credit[k], 0)) + '</b></span>' : '');
            if (b._h !== h) { b.innerHTML = h; b._h = h; } } catch (e) {}
    }
/* === [SEC: DRAGOES_CATALOGO] === */
/* ===== cortex/36jmd-colony-dragon-art.js: DRAGÕES FEITOS POR CÓDIGO, ESCULPIDOS E COM ANATOMIA (no estilo do lendário roxo: olhos grandes, chifres, crina, coroa). Cada espécie tem seu "DNA": paleta, tipo de asa, de chifre, de dorso, de ponta da cauda e extras. Tudo é fundido em poucas malhas por parte (cabeça, pescoço, cauda, pernas, asas) para pesar pouco. ===== */
    const ZA_C = c => { const k = new (clTh().Color)(c), h = {}; k.getHSL(h); k.setHSL(h.h, Math.min(1, h.s * 1.12), h.l * 0.93); return k; };   /* cores um pouco mais vivas */
    function zaTube(T, pts, rad, radial, segs, cap) {   /* tubo afunilado ao longo de uma curva: raios dados por ponto de controle */
        const cv = new T.CatmullRomCurve3(pts), fr = cv.computeFrenetFrames(segs, false), pos = [], nor = [], uv = [], idx = [], rr = t => { const f = t * (rad.length - 1), i = Math.min(rad.length - 2, Math.floor(f)); return rad[i] + (rad[i + 1] - rad[i]) * (f - i); };
        for (let i = 0; i <= segs; i++) { const t = i / segs, p = cv.getPointAt(t), N = fr.normals[i], B = fr.binormals[i], r = rr(t); for (let j = 0; j <= radial; j++) { const a = j / radial * 6.2832, c = Math.cos(a), s = Math.sin(a), dx = N.x * c + B.x * s, dy = N.y * c + B.y * s, dz = N.z * c + B.z * s; pos.push(p.x + dx * r, p.y + dy * r, p.z + dz * r); nor.push(dx, dy, dz); uv.push(j / radial, t); } }
        for (let i = 0; i < segs; i++) for (let j = 0; j < radial; j++) { const a = i * (radial + 1) + j, b = a + radial + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
        if (cap) { const e = cv.getPointAt(1), eN = cv.getTangentAt(1), c0 = pos.length / 3; pos.push(e.x + eN.x * rr(1) * 0.8, e.y + eN.y * rr(1) * 0.8, e.z + eN.z * rr(1) * 0.8); nor.push(eN.x, eN.y, eN.z); uv.push(0.5, 1); const base = segs * (radial + 1); for (let j = 0; j < radial; j++) idx.push(base + j, c0, base + j + 1); }
        const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new T.Float32BufferAttribute(nor, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); g.setIndex(idx); return g;
    }
    const zaRes = () => ZOO.AG || (ZOO.AG = (function () {   /* geometrias-base compartilhadas */
        const T = clTh(), sph = new T.SphereGeometry(0.5, 14, 10), cone = new T.ConeGeometry(0.5, 1, 7); cone.translate(0, 0.5, 0); const oct = new T.OctahedronGeometry(0.5, 0), ico = new T.IcosahedronGeometry(0.5, 0);
        const egg = (function () { const p = []; for (let i = 0; i <= 18; i++) { const t = i / 18 * Math.PI; p.push(new T.Vector2(Math.max(0.0001, 0.5 * Math.sin(t) * (1 - 0.18 * Math.cos(t))), 0.5 * Math.cos(t))); } const g = new T.LatheGeometry(p, 16); g.rotateZ(-Math.PI / 2); return g; })();   /* elipsoide levemente em ovo, eixo no x */
        const cyl = new T.CylinderGeometry(0.5, 0.5, 1, 8); return { sph, cone, oct, ico, egg, cyl };
    })());
    function zaTex() {   /* escamas hexagonais em tons de cinza, usadas como relevo de cor em todas as peles */
        if (ZOO.zaTx) return ZOO.zaTx; const T = clTh(), cv = document.createElement('canvas'); cv.width = cv.height = 256; const c = cv.getContext('2d'); c.fillStyle = '#c8c8c8'; c.fillRect(0, 0, 256, 256); const n = 8, w = 256 / n, h = w * 0.86;
        for (let r = -1; r < n + 1; r++) for (let q = -1; q < n + 1; q++) { const x = q * w + (r & 1 ? w / 2 : 0), y = r * h; const g = c.createRadialGradient(x, y - h * 0.15, 1, x, y, w * 0.62); g.addColorStop(0, '#ffffff'); g.addColorStop(0.7, '#d8d8d8'); g.addColorStop(1, '#8e8e8e'); c.fillStyle = g; c.beginPath(); c.ellipse(x, y, w * 0.52, h * 0.62, 0, 0, 6.2832); c.fill(); c.strokeStyle = 'rgba(60,60,60,.55)'; c.lineWidth = 1.5; c.stroke(); }
        const t = new T.CanvasTexture(cv); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(5, 3); t.anisotropy = 4; if (T.sRGBEncoding) t.encoding = T.sRGBEncoding; return (ZOO.zaTx = t);
    }
    /* construtor de partes: acumula geometrias com cor por vértice e funde por material no fim */
    function zaB(T) {
        const B = { list: [] }, m4 = new T.Matrix4(), q = new T.Quaternion(), e = new T.Euler(), v = new T.Vector3(), s = new T.Vector3(), nm = new T.Matrix3();
        B.add = (key, geo, x, y, z, sx, sy, sz, rx, ry, rz, col, shade) => {
            const g = geo.index ? geo.toNonIndexed() : geo.clone(); e.set(rx || 0, ry || 0, rz || 0); q.setFromEuler(e); m4.compose(v.set(x, y, z), q, s.set(sx, sy, sz)); g.applyMatrix4(m4); nm.getNormalMatrix(m4); const P = g.attributes.position, N = g.attributes.normal, n = P.count, C = new Float32Array(n * 3), c0 = col && col.isColor ? col : ZA_C(col || '#ffffff'), tmp = new T.Color();
            for (let i = 0; i < n; i++) { if (shade) { shade(P.getX(i), P.getY(i), P.getZ(i), N.getX(i), N.getY(i), N.getZ(i), tmp, c0); } else tmp.copy(c0); C[i * 3] = tmp.r; C[i * 3 + 1] = tmp.g; C[i * 3 + 2] = tmp.b; }
            g.setAttribute('color', new T.BufferAttribute(C, 3)); if (!g.attributes.uv) g.setAttribute('uv', new T.BufferAttribute(new Float32Array(n * 2), 2)); B.list.push({ key, g }); return B;
        };
        B.bake = (parent, mats) => {   /* um mesh por material */
            const by = {}; B.list.forEach(o => { (by[o.key] = by[o.key] || []).push(o.g); }); const out = [];
            Object.keys(by).forEach(k => { const gs = by[k]; let n = 0; gs.forEach(g => { n += g.attributes.position.count; }); const P = new Float32Array(n * 3), N = new Float32Array(n * 3), U = new Float32Array(n * 2), C = new Float32Array(n * 3); let o = 0; gs.forEach(g => { const c = g.attributes.position.count; P.set(g.attributes.position.array, o * 3); N.set(g.attributes.normal.array, o * 3); U.set(g.attributes.uv.array, o * 2); C.set(g.attributes.color.array, o * 3); o += c; g.dispose(); });
                const G = new T.BufferGeometry(); G.setAttribute('position', new T.BufferAttribute(P, 3)); G.setAttribute('normal', new T.BufferAttribute(N, 3)); G.setAttribute('uv', new T.BufferAttribute(U, 2)); G.setAttribute('color', new T.BufferAttribute(C, 3)); const m = new T.Mesh(G, mats[k]); m.castShadow = true; m.frustumCulled = false; parent.add(m); out.push(m); }); B.list.length = 0; return out;
        };
        return B;
    }
    /* ---------- DNA das 20 espécies ---------- */
    /* c: corpo, b: barriga, a: acento (placas/chifres), w: membrana da asa, we: borda/veias da asa, e: olho, g: brilho (ou null) */
    const ZA_DNA = {
        musgo: { c: '#5aa83a', b: '#e8e2a0', a: '#8b6b3a', w: '#7ad04a', we: '#2f6a22', e: '#ffd54a', wing: 'leaf', horn: 'antlers', back: 'leaves', tail: 'leaf', extra: ['flowers', 'moss'], build: { neck: 1, tail: 1.05, bulk: 1 } },
        argila: { c: '#c9814a', b: '#f0d4a6', a: '#6a4026', w: '#e0a060', we: '#8a4e26', e: '#ffcf3a', wing: 'bat', horn: 'ram', back: 'plates', tail: 'club', extra: ['cracks'], build: { neck: 0.8, tail: 0.9, bulk: 1.18 } },
        orvalho: { c: '#6ac4ee', b: '#e6f8ff', a: '#2f7fb8', w: '#9ee0ff', we: '#3d9ad8', e: '#1a2a6a', wing: 'fin', horn: 'blades', back: 'fin', tail: 'fan', extra: ['bubbles'], build: { neck: 1.15, tail: 1.1, bulk: 0.9 } },
        brisa: { c: '#e9f4ff', b: '#ffffff', a: '#9ac8f0', w: '#f5fbff', we: '#a8d4f4', e: '#2a8ad8', wing: 'feather', horn: 'spikes', back: 'fin', tail: 'ribbon', extra: ['ribbons'], build: { neck: 1.2, tail: 1.2, bulk: 0.86 } },
        cascalho: { c: '#9a8b78', b: '#d8ccb6', a: '#5a5048', w: '#b4a592', we: '#5a5048', e: '#ffb020', wing: 'bat', horn: 'spikes', back: 'rocks', tail: 'club', extra: ['pebbles'], build: { neck: 0.75, tail: 0.85, bulk: 1.25 } },
        cinza: { c: '#6e6e7c', b: '#a8a8b8', a: '#2a2a34', w: '#4a4a58', we: '#ff7a2a', e: '#ff8a2a', wing: 'bat', horn: 'blades', back: 'spikes', tail: 'spade', extra: ['embers'], build: { neck: 1, tail: 1.15, bulk: 0.95 } },
        floresta: { c: '#2aa850', b: '#d8f0a0', a: '#6a4a2a', w: '#4ed06a', we: '#1a6a30', e: '#fff06a', wing: 'leaf', horn: 'antlers', back: 'leaves', tail: 'leaf', extra: ['flowers', 'vines'], build: { neck: 1.1, tail: 1.1, bulk: 1 } },
        ambar: { c: '#f0a02a', b: '#ffe6a0', a: '#8a4a10', w: '#ffc860', we: '#c06a10', e: '#5a2a08', wing: 'crystal', horn: 'crystal', back: 'crystals', tail: 'crystal', extra: ['gems'], build: { neck: 0.95, tail: 1, bulk: 1.05 } },
        mare: { c: '#2a78e8', b: '#9ad0ff', a: '#0a3a8a', w: '#4aa0ff', we: '#1a58b8', e: '#ffe27a', wing: 'fin', horn: 'coral', back: 'fin', tail: 'fan', extra: ['bubbles', 'pearls'], build: { neck: 1.25, tail: 1.3, bulk: 0.95 } },
        geada: { c: '#cfe8ff', b: '#ffffff', a: '#7ac8ff', w: '#e4f4ff', we: '#8ad0ff', e: '#2a6ad8', wing: 'crystal', horn: 'crystal', back: 'crystals', tail: 'crystal', extra: ['icicles', 'frost'], build: { neck: 1, tail: 1, bulk: 1 } },
        bronze: { c: '#b8782a', b: '#e6c07a', a: '#ffd35c', w: '#c98a3a', we: '#ffd35c', e: '#ffe27a', wing: 'bat', horn: 'ram', back: 'plates', tail: 'spade', extra: ['armor'], build: { neck: 0.9, tail: 0.95, bulk: 1.15 }, metal: 0.65 },
        prisma: { c: '#5de8ff', b: '#e0fbff', a: '#ff7ad8', w: '#b8f4ff', we: '#ff9af0', e: '#ff6ad0', wing: 'crystal', horn: 'crystal', back: 'crystals', tail: 'crystal', extra: ['gems', 'sparkle'], build: { neck: 1, tail: 1.05, bulk: 1 }, g: '#8af0ff' },
        esmeralda: { c: '#14c866', b: '#b8ffd8', a: '#0a6a3a', w: '#4aff9a', we: '#0a8a48', e: '#fff06a', wing: 'crystal', horn: 'crystal', back: 'crystals', tail: 'crystal', extra: ['gems'], build: { neck: 0.95, tail: 0.95, bulk: 1.1 }, g: '#28f585', metal: 0.4 },
        ametista: { c: '#8a4ae8', b: '#d8b8ff', a: '#4a1a9a', w: '#b07aff', we: '#5a2ab8', e: '#ffe27a', wing: 'crystal', horn: 'crystal', back: 'crystals', tail: 'crystal', extra: ['gems', 'sparkle'], build: { neck: 1.05, tail: 1.1, bulk: 1 }, g: '#b46eff' },
        solar: { c: '#ffb820', b: '#fff0b0', a: '#ff8a10', w: '#ffd84a', we: '#ff9a10', e: '#ff6a1a', wing: 'flame', horn: 'blades', back: 'spikes', tail: 'flame', extra: ['mane', 'halo'], build: { neck: 1.05, tail: 1.1, bulk: 1.05 }, g: '#ffd64a' },
        vulcao: { c: '#b83a12', b: '#ff9a3a', a: '#2a1410', w: '#e0501a', we: '#ffb030', e: '#ffe04a', wing: 'flame', horn: 'ram', back: 'rocks', tail: 'flame', extra: ['embers', 'cracks'], build: { neck: 0.9, tail: 1, bulk: 1.2 }, g: '#ff7722' },
        tempestade: { c: '#4a5ee0', b: '#b8c4ff', a: '#ffe84a', w: '#6a82ff', we: '#ffe84a', e: '#fff7a0', wing: 'bat', horn: 'blades', back: 'spikes', tail: 'bolt', extra: ['mane', 'sparks'], build: { neck: 1.1, tail: 1.2, bulk: 0.95 }, g: '#7c92ff' },
        aurora: { c: '#e870d8', b: '#ffe0f8', a: '#6affd8', w: '#ffa0f0', we: '#6affea', e: '#6affea', wing: 'feather', horn: 'antlers', back: 'fin', tail: 'ribbon', extra: ['ribbons', 'mane', 'sparkle'], build: { neck: 1.25, tail: 1.3, bulk: 0.9 }, g: '#ffa1ec' },
        cometa: { c: '#7a3ee0', b: '#d8b8ff', a: '#ffd766', w: '#9154ff', we: '#ffd766', e: '#ffe27a', wing: 'bat', horn: 'ram', back: 'crystals', tail: 'star', extra: ['mane', 'crown', 'stars'], build: { neck: 1.05, tail: 1.2, bulk: 1.1 }, g: '#ffd766' },
        eclipse: { c: '#2a1a5a', b: '#6a4ab8', a: '#ffcc44', w: '#3a2478', we: '#ffcc44', e: '#ffcc44', wing: 'bat', horn: 'ram', back: 'spikes', tail: 'spade', extra: ['halo', 'embers', 'mane'], build: { neck: 1, tail: 1.1, bulk: 1.15 }, g: '#ffcc44' }
    };
    /* ---------- partes ---------- */
    function zaWing(T, B, o) {   /* uma asa (lado sd) no referencial do ombro; +z = para fora */
        const { sd, type, w, we, span, mem } = o, S = (x, y, z) => new T.Vector3(x, y, z * sd), col = ZA_C(w), colE = ZA_C(we);
        const bone = (pts, r0, r1, c) => { const g = zaTube(T, pts, [r0, (r0 + r1) / 2, r1], 5, 6, true); B.add(mem.bone, g, 0, 0, 0, 1, 1, 1, 0, 0, 0, c || colE); };
        const tri = (p0, p1, p2, c0, c1, c2) => { const g = new T.BufferGeometry(), P = [p0, p1, p2], pos = [], nrm = [], col2 = [], n = new T.Vector3().subVectors(p1, p0).cross(new T.Vector3().subVectors(p2, p0)).normalize(); if (sd < 0) { P.reverse(); } P.forEach(p => { pos.push(p.x, p.y, p.z); nrm.push(n.x, n.y, n.z); }); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new T.Float32BufferAttribute(nrm, 3)); g.setAttribute('uv', new T.Float32BufferAttribute([0, 0, 1, 0, 0, 1], 2)); B.add(mem.mem, g, 0, 0, 0, 1, 1, 1, 0, 0, 0, col, (x, y, z, nx, ny, nz, t, c0) => { const u = Math.min(1, Math.hypot(x, z) / (span * 0.9)); t.copy(c0).lerp(colE, u * u * 0.8); }); };
        const sc = span;
        if (type === 'bat' || type === 'fin' || type === 'flame') {
            const fingers = type === 'fin' ? 3 : 4, dr = type === 'fin' ? 0.55 : 0.32, W = S(-0.01 * sc, 0.1 * sc, 0.3 * sc), E = S(0.03 * sc, 0.07 * sc, 0.14 * sc), H = S(-0.3, -0.02, 0.05), tips = [];
            bone([S(0, 0, 0), E, W], 0.022, 0.014); for (let i = 0; i < fingers; i++) { const f = i / (fingers - 1), tip = S((-0.02 - 0.42 * f) * sc, (0.07 - 0.1 * f - (type === 'flame' ? 0.02 : 0)) * sc, (0.74 - 0.5 * f) * sc), mid = new T.Vector3().lerpVectors(W, tip, 0.5); mid.y += 0.02; bone([W, mid, tip], 0.012, 0.004); tips.push(tip); }
            tips.push(H); const ring = [W].concat(tips); const N = 6;
            for (let i = 0; i < tips.length - 1; i++) { const A = tips[i], Bp = tips[i + 1]; for (let k = 0; k < N; k++) { const u0 = k / N, u1 = (k + 1) / N; for (let m2 = 0; m2 < 3; m2++) { const v0 = m2 / 3, v1 = (m2 + 1) / 3, s0 = 1 - dr * Math.sin(Math.PI * v0) * 0.5, s1 = 1 - dr * Math.sin(Math.PI * v1) * 0.5, P = (u, v, s) => { const e = new T.Vector3().lerpVectors(A, Bp, v), p = new T.Vector3().lerpVectors(W, e, u * s); p.y -= 0.04 * sc * Math.sin(Math.PI * v) * u; return p; }; const p00 = P(u0, v0, s0), p10 = P(u1, v0, s0), p01 = P(u0, v1, s1), p11 = P(u1, v1, s1); tri(p00, p10, p01); tri(p10, p11, p01); } } }
            const root = S(0, 0, 0); for (let k = 0; k < 4; k++) { const u0 = k / 4, u1 = (k + 1) / 4, L = (u) => new T.Vector3().lerpVectors(root, W, u), Ln = (u) => new T.Vector3().lerpVectors(H, tips[0], u); tri(L(u0), L(u1), Ln(u0)); tri(L(u1), Ln(u1), Ln(u0)); }
        } else if (type === 'feather') {
            const n = 9; bone([S(0, 0, 0), S(0.02 * sc, 0.08 * sc, 0.2 * sc), S(-0.02 * sc, 0.1 * sc, 0.46 * sc)], 0.02, 0.01);
            for (let i = 0; i < n; i++) { const f = i / (n - 1), L = (0.5 - 0.22 * f) * sc * (i === n - 1 ? 0.7 : 1), ox = S(-0.01 * sc, 0.09 * sc - f * 0.02, (0.06 + 0.4 * (1 - f)) * sc), ang = -0.2 - f * 1.15; const fth = zaTube(T, [new T.Vector3(0, 0, 0), new T.Vector3(Math.sin(ang) * L * 0.5, -0.01 * sc, Math.cos(ang) * L * 0.5 * sd), new T.Vector3(Math.sin(ang) * L, -0.04 * sc, Math.cos(ang) * L * sd)], [0.03 * sc, 0.045 * sc, 0.0], 6, 6, false); B.add(mem.mem, fth, ox.x, ox.y, ox.z, 1, 0.28, 1, 0, 0, 0, col, (x, y, z, nx, ny, nz, t, c0) => { t.copy(c0).lerp(colE, Math.min(1, Math.hypot(x, z) / (sc * 0.8)) * 0.7); }); }
        } else if (type === 'crystal') {
            bone([S(0, 0, 0), S(0.03 * sc, 0.09 * sc, 0.16 * sc), S(0, 0.12 * sc, 0.3 * sc)], 0.022, 0.014);
            const n = 5;
            for (let i = 0; i < n; i++) { const f = i / (n - 1), ang = -0.1 - f * 1.2, L = (0.66 - 0.36 * f) * sc, g = zaRes().oct; B.add(mem.mem, g, Math.sin(ang) * L * 0.5 - 0.01 * sc, 0.1 * sc - f * 0.06 * sc, sd * (0.12 * sc + Math.cos(ang) * L * 0.5), L * 0.2, L * 0.07, L, 0.1 * sd, sd * ang, 0, col, (x, y, z, nx, ny, nz, t, c0) => { t.copy(c0).lerp(colE, Math.max(0, Math.min(1, Math.hypot(x, z) / (sc * 0.9)) * 0.8)); }); }
        } else if (type === 'leaf') {
            bone([S(0, 0, 0), S(0.03 * sc, 0.09 * sc, 0.2 * sc), S(-0.02 * sc, 0.1 * sc, 0.46 * sc)], 0.02, 0.01);
            const n = 5; for (let i = 0; i < n; i++) { const f = i / (n - 1), L = (0.62 - 0.26 * f) * sc, ang = -0.1 - f * 1.1, rx = -0.01 * sc, rz = (0.06 + 0.36 * (1 - f)) * sc; B.add(mem.mem, zaRes().sph, rx + Math.sin(ang) * L * 0.5, 0.09 * sc - f * 0.03 * sc, sd * (rz + Math.cos(ang) * L * 0.5), L * 0.26, L * 0.03, L, 0, sd * ang, 0, col, (x, y, z, nx, ny, nz, t, c0) => { t.copy(c0).lerp(colE, Math.max(0, Math.min(1, Math.hypot(x, z) / (sc * 0.95)))); }); B.add(mem.bone, zaRes().cyl, rx + Math.sin(ang) * L * 0.5, 0.095 * sc - f * 0.03 * sc, sd * (rz + Math.cos(ang) * L * 0.5), 0.012, 0.012, L, 0, sd * ang, 0, colE); }
        }
    }
    /* ---------- o dragão ---------- */
    function zBuildArtDragon(sp, hi, al) {
        al = al || 1; const T = clTh(), AG = zaRes(), dna = ZA_DNA[sp.id]; if (!dna) return zBuildCodeDragon(sp, hi, al);
        const rk = sp.rk | 0, EL = ZEL[sp.el] || ZEL.terra, isBaby = al < 5, isAdult = al >= 5 && al < 10, isElder = al >= 10, lvScale = isBaby ? 0.88 : (isElder ? 1.25 : 1.12), bd = dna.build || {}, bulk = (bd.bulk || 1) * (isBaby ? 0.92 : 1), neckK = bd.neck || 1, tailK = bd.tail || 1, headK = isBaby ? 1.22 : 1, wingK = isAdult || isElder ? 1.2 : 1.0;
        const root = new T.Group(), body = new T.Group(); root.add(body); const P = { head: null, neck: null, legs: [], wings: [], tail: null, crown: null, horns: [], orbs: [] };
        const glowC = dna.g || (rk >= 3 ? EL.col : null), cC = ZA_C(dna.c), cB = ZA_C(dna.b), cA = ZA_C(dna.a), skinTex = zaTex();
        const mats = {   /* materiais desta espécie (poucos, com cor por vértice) */
            skin: new T.MeshStandardMaterial({ vertexColors: true, map: skinTex, roughness: 0.52, metalness: dna.metal || 0.08, emissive: glowC ? ZA_C(glowC) : new T.Color(0x000000), emissiveIntensity: glowC ? 0.12 : 0 }),
            horn: new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.3, metalness: rk >= 3 ? 0.65 : 0.25, emissive: ZA_C(dna.a), emissiveIntensity: rk >= 2 ? 0.25 : 0.05 }),
            mem: new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.45, metalness: 0.05, side: T.DoubleSide, emissive: ZA_C(dna.w), emissiveIntensity: 0.12 }),
            bone: new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.5, metalness: 0.15 }),
            eye: new T.MeshBasicMaterial({ vertexColors: true }),
            glow: new T.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.95 })
        };
        const sub = k => ({ mem: 'mem', bone: 'bone' })[k];
        const shadeSkin = (x, y, z, nx, ny, nz, t, c0) => { const stripe = 0.5 + 0.5 * Math.sin(x * 70); t.copy(c0).lerp(cB, Math.max(0, Math.min(1, (-ny - 0.28) * 2.2)) * (0.8 + 0.2 * stripe)); const dorsal = Math.max(0, ny - 0.55) * 1.4; if (dorsal > 0) t.lerp(cA, Math.min(0.35, dorsal * 0.35)); const sh = 0.9 + 0.1 * Math.sin(x * 40 + z * 33); t.multiplyScalar(sh); };
        const legH = 0.18 * (bd.leg || 1), len = 0.5 * (isBaby ? 0.9 : 1), bW = 0.2 * bulk, bH = 0.23 * bulk;
        /* tronco */
        { const B = zaB(T); const ty = legH + 0.15, tp = []; for (let i = 0; i <= 6; i++) { const f = i / 6; tp.push(new T.Vector3(-0.34 + f * 0.68 * (isBaby ? 0.92 : 1), ty + Math.sin(f * 3.14) * 0.012, 0)); }
            B.add('skin', zaTube(T, tp, [0.07 * bulk, 0.108 * bulk, 0.112 * bulk, 0.1 * bulk, 0.1 * bulk, 0.112 * bulk, 0.092 * bulk], hi ? 12 : 8, 14, true), 0, 0, 0, 1, 1.12, 0.92, 0, 0, 0, cC, shadeSkin);
            [-1, 1].forEach(sd => { B.add('skin', AG.sph, -0.2, legH + 0.13, 0.075 * sd * bulk, 0.16 * bulk, 0.17 * bulk, 0.08 * bulk, 0, 0, 0, cC, shadeSkin); });
            /* dorso */
            const bk = dna.back, nb = bk === 'fin' ? 0 : 8; for (let i = 0; i < nb; i++) { const f = i / (nb - 1), x = 0.17 - f * 0.4, y = legH + 0.15 + bH * 0.5 * (1 - 0.0 * f) + 0.02, s = (0.06 + 0.03 * (rk >= 3 ? 1 : 0)) * (1 - 0.25 * f) * (isBaby ? 0.8 : 1);
                if (bk === 'spikes') B.add('horn', AG.cone, x, y, 0, s * 0.45, s * 1.5, s * 0.3, 0, 0, 0.35, cA);
                else if (bk === 'plates') B.add('horn', AG.oct, x, y + s * 0.2, 0, s * 0.9, s * 1.7, s * 0.28, 0, 0, 0.2, cA);
                else if (bk === 'rocks') B.add('horn', AG.ico, x, y + s * 0.1, (i % 2 ? 0.02 : -0.02), s * 1.2, s * 1.0 + (i % 3) * 0.01, s * 1.1, i, i * 2, 0, cA);
                else if (bk === 'crystals') B.add('horn', AG.oct, x, y + s * 0.5, (i % 2 ? 0.015 : -0.015), s * 0.7, s * 2.2, s * 0.7, 0.1 * (i % 3 - 1), 0, 0.2 - 0.1 * (i % 2), i % 2 ? cA : ZA_C(dna.we));
                else if (bk === 'leaves') B.add('skin', AG.sph, x, y + s * 0.4, (i % 2 ? 0.03 : -0.03), s * 0.5, s * 1.9, s * 0.22, (i % 2 ? 0.7 : -0.7), 0, 0.2, ZA_C(dna.w)); }
            if (dna.back === 'fin') { const pts = []; for (let i = 0; i < 7; i++) { const f = i / 6; pts.push(new T.Vector3(0.18 - f * 0.42, legH + 0.15 + bH * 0.5 + 0.04 + Math.sin(f * 3.14) * 0.05, 0)); } for (let i = 0; i < 6; i++) { const f = i / 5, h = (0.05 + Math.sin(f * 3.14) * 0.07) * (isBaby ? 0.8 : 1); B.add('mem', AG.cone, 0.17 - f * 0.4, legH + 0.15 + bH * 0.5 + 0.02, 0, 0.03, h, 0.012, 0, 0, 0.35, ZA_C(dna.w)); } }
            B.bake(body, mats); }
        /* pernas */
        const legCols = [[0.22, 0.085, 0], [0.22, -0.085, Math.PI], [-0.21, 0.09, Math.PI], [-0.21, -0.09, 0]];
        legCols.forEach((p, idx) => { const lg = new T.Group(); lg.position.set(p[0], legH + 0.02, p[1]); body.add(lg); const B = zaB(T), hind = p[0] < 0, tk = hind ? 1.18 : 1;
            const kn = hind ? 0.035 : -0.03; B.add('skin', zaTube(T, [new T.Vector3(0, 0.02, 0), new T.Vector3(kn, -legH * 0.45, 0), new T.Vector3(-kn * 0.3, -legH * 0.86, 0)], [0.07 * tk * bulk, 0.047 * bulk, 0.036], 8, 8, false), 0, 0, 0, 1, 1, 1, 0, 0, 0, cC, shadeSkin); B.add('skin', AG.egg, 0.025, -legH + 0.01, 0, 0.12, 0.05, 0.085, 0, 0, 0, cC, shadeSkin);
            [-0.022, 0, 0.022].forEach(oz => B.add('horn', AG.cone, 0.085, -legH + 0.012, oz, 0.016, 0.045, 0.016, 0, 0, -Math.PI / 2 + 0.2, rk >= 3 ? ZA_C('#ffd766') : ZA_C('#2a2420')));
            B.bake(lg, mats); P.legs.push({ g: lg, ph: p[2] }); });
        /* pescoço e cabeça */
        const hx = 0.46 + 0.04 * neckK, hy = legH + 0.34 + 0.13 * neckK; { const B = zaB(T); const g = zaTube(T, [new T.Vector3(0.2, legH + 0.2, 0), new T.Vector3(0.29, legH + 0.27 + 0.05 * neckK, 0), new T.Vector3(0.37 + 0.02 * neckK, legH + 0.35 + 0.1 * neckK, 0), new T.Vector3(hx - 0.04, hy - 0.04, 0)], [0.09 * bulk, 0.062, 0.052], hi ? 10 : 7, 10, false); B.add('skin', g, 0, 0, 0, 1, 1, 1, 0, 0, 0, cC, shadeSkin); B.bake(body, mats); const nk = new T.Group(); body.add(nk); P.neck = nk; }
        const hd = new T.Group(); hd.position.set(hx, hy, 0); body.add(hd); P.head = hd; hd.scale.setScalar(headK);
        { const B = zaB(T); B.add('skin', AG.sph, 0, 0, 0, 0.23, 0.19, 0.2, 0, 0, 0, cC, shadeSkin); B.add('skin', AG.egg, 0.15, -0.03, 0, 0.2, 0.1, 0.12, 0, 0, -0.06, cC, shadeSkin); B.add('skin', AG.egg, 0.12, -0.075, 0, 0.17, 0.05, 0.1, 0, 0, 0.08, cB);   /* focinho e mandíbula clara */
            B.add('skin', AG.sph, 0.22, -0.03, 0.03, 0.035, 0.03, 0.03, 0, 0, 0, ZA_C('#1a1214')); B.add('skin', AG.sph, 0.22, -0.03, -0.03, 0.035, 0.03, 0.03, 0, 0, 0, ZA_C('#1a1214'));
            [-1, 1].forEach(sd => { B.add('skin', AG.sph, 0.03, 0.075, 0.075 * sd, 0.1, 0.045, 0.06, 0.2 * sd, 0, 0, cA);   /* sobrancelha */
                B.add('skin', AG.cone, -0.02, -0.04, 0.1 * sd, 0.03, 0.11, 0.02, 0, 0, 1.3, cC);   /* barbatana da bochecha */
                const ex = 0.075, ez = 0.082 * sd; B.add('eye', AG.sph, ex, 0.03, ez, 0.085, 0.1, 0.06, 0, 0, 0, ZA_C('#0a0c14')); B.add('eye', AG.sph, ex + 0.012, 0.03, ez * 1.04, 0.074, 0.092, 0.052, 0, 0, 0, ZA_C(dna.e)); B.add('eye', AG.sph, ex + 0.026, 0.028, ez * 1.06, 0.022, 0.07, 0.04, 0, 0, 0, ZA_C('#0a0c14')); B.add('eye', AG.sph, ex + 0.038, 0.052, ez * 1.08, 0.026, 0.026, 0.02, 0, 0, 0, ZA_C('#ffffff')); B.add('eye', AG.sph, ex + 0.03, 0.0, ez * 1.08, 0.012, 0.012, 0.01, 0, 0, 0, ZA_C('#ffffff')); });
            /* chifres */
            const ht = dna.horn, hl = (rk >= 4 ? 0.3 : rk >= 3 ? 0.26 : rk === 2 ? 0.22 : 0.17) * (isAdult || isElder ? 1.2 : 1);
            [-1, 1].forEach(sd => { const hz = 0.065 * sd;
                if (ht === 'ram') { const pts = []; for (let i = 0; i <= 6; i++) { const f = i / 6, a = f * 3.6; pts.push(new T.Vector3(-0.03 - Math.sin(a) * 0.1 * hl / 0.2, 0.08 + f * 0.04 + (1 - Math.cos(a)) * 0.06, hz + sd * (0.04 + Math.sin(a * 0.9) * 0.07))); } B.add('horn', zaTube(T, pts, [0.032, 0.022, 0.006], 7, 14, true), 0, 0, 0, 1, 1, 1, 0, 0, 0, cA); }
                else if (ht === 'antlers') { const pts = [new T.Vector3(-0.02, 0.09, hz), new T.Vector3(-0.07, 0.17 * hl / 0.2, hz + 0.03 * sd), new T.Vector3(-0.13, 0.26 * hl / 0.2, hz + 0.05 * sd)]; B.add('horn', zaTube(T, pts, [0.026, 0.018, 0.008], 6, 8, true), 0, 0, 0, 1, 1, 1, 0, 0, 0, cA); [0.4, 0.75].forEach((f, k) => { const bp = new T.Vector3(-0.02 - 0.11 * f, 0.09 + 0.17 * hl / 0.2 * f + (k ? 0.03 : 0), hz + 0.05 * sd * f); const tp = [bp, new T.Vector3(bp.x + 0.03, bp.y + 0.06, bp.z + 0.05 * sd), new T.Vector3(bp.x + 0.07, bp.y + 0.11 + k * 0.02, bp.z + 0.08 * sd)]; B.add('horn', zaTube(T, tp, [0.016, 0.011, 0.004], 5, 6, true), 0, 0, 0, 1, 1, 1, 0, 0, 0, cA); }); }
                else if (ht === 'crystal') { [[-0.04, 0.12, hz * 0.8, 0.5, 1.2], [-0.09, 0.1, hz * 1.3, 0.8, 0.9], [-0.01, 0.13, hz * 0.4, 0.3, 0.8]].forEach((c, k) => B.add('horn', AG.oct, c[0], c[1] + hl * 0.4, c[2], 0.05, hl * (1.2 - k * 0.2), 0.05, 0, 0, 0.5 + k * 0.2, k % 2 ? ZA_C(dna.we) : cA)); }
                else if (ht === 'coral') { const pts = [new T.Vector3(-0.02, 0.09, hz), new T.Vector3(-0.08, 0.17, hz + 0.02 * sd), new T.Vector3(-0.1, 0.25, hz + 0.01 * sd)]; B.add('horn', zaTube(T, pts, [0.03, 0.02, 0.012], 6, 8, true), 0, 0, 0, 1, 1, 1, 0, 0, 0, cA); [[-0.07, 0.19, 0.06], [-0.13, 0.23, 0.03]].forEach(c => B.add('horn', AG.sph, c[0], c[1], hz + c[2] * sd, 0.04, 0.04, 0.04, 0, 0, 0, ZA_C(dna.we))); }
                else if (ht === 'blades') { B.add('horn', AG.cone, -0.06, 0.12, hz, 0.04, hl * 1.5, 0.03, 0.2 * sd, 0, 1.1, cA); B.add('horn', AG.cone, -0.01, 0.1, hz * 0.7, 0.03, hl * 0.9, 0.025, 0.1 * sd, 0, 0.7, ZA_C(dna.we)); }
                else { B.add('horn', AG.cone, -0.04, 0.11, hz, 0.04, hl, 0.04, 0.3 * sd, 0, 0.6, cA); }
                P.horns.push(null); });
            B.bake(hd, mats); }
        /* extras da cabeça: crina, auréola */
        { const B = zaB(T), ex = dna.extra || []; if (ex.indexOf('mane') >= 0) { const mc = rk >= 4 ? ['#ffd766', '#ffb020', '#ffffff'] : [dna.a, dna.w, dna.we]; for (let i = 0; i < 6; i++) B.add('glow', AG.cone, -0.08 - i * 0.045, 0.09 - i * 0.03, 0, 0.05 - i * 0.004, 0.11 + 0.01 * (i % 2), 0.035, 0, 0, 1.9 + i * 0.09, ZA_C(mc[i % 3])); }
            if (ex.indexOf('halo') >= 0) { B.add('glow', new T.TorusGeometry(0.5, 0.05, 6, 28), -0.1, 0.02, 0, 0.3, 0.3, 0.3, 0, Math.PI / 2, 0, ZA_C(dna.g || dna.a)); }
            if (ex.indexOf('beard') >= 0) B.add('skin', AG.cone, 0.08, -0.12, 0, 0.04, -0.12, 0.03, 0, 0, 0, cC);
            B.bake(hd, mats); }
        /* cauda */
        const tl = new T.Group(); tl.position.set(-0.31, legH + 0.19, 0); body.add(tl); P.tail = tl;
        { const B = zaB(T), TL = 0.55 * tailK, pts = []; for (let i = 0; i <= 5; i++) { const f = i / 5; pts.push(new T.Vector3(-0.02 - f * TL, -0.02 * i + Math.sin(f * 3) * 0.02, 0)); } B.add('skin', zaTube(T, pts, [0.088 * bulk, 0.07, 0.048, 0.024], hi ? 9 : 6, 12, true), 0, 0, 0, 1, 1, 1, 0, 0, 0, cC, shadeSkin);
            const end = pts[5], tt = dna.tail, ac = cA, wc = ZA_C(dna.w);
            if (tt === 'spade') B.add('horn', AG.oct, end.x - 0.07, end.y, 0, 0.17, 0.05, 0.12, 0, 0, 0, ac);
            else if (tt === 'club') B.add('horn', AG.ico, end.x - 0.05, end.y, 0, 0.17, 0.15, 0.15, 0, 0, 0, ac);
            else if (tt === 'flame') { for (let i = 0; i < 4; i++) B.add('glow', AG.cone, end.x - 0.04 - i * 0.02, end.y + (i - 1.5) * 0.04, 0, 0.07, 0.2 - i * 0.025, 0.05, 0, 0, 1.45 + (i - 1.5) * 0.3, ZA_C(i % 2 ? '#ffd24a' : dna.g || '#ff7722')); }
            else if (tt === 'crystal') { [[-0.04, 0], [-0.1, 0.04], [-0.1, -0.04]].forEach((c, k) => B.add('horn', AG.oct, end.x + c[0], end.y + c[1] * 0.6, c[1], 0.07, 0.2 - k * 0.04, 0.07, 0, 0, 1.4 + k * 0.2, k ? ZA_C(dna.we) : ac)); }
            else if (tt === 'leaf') { for (let i = -1; i <= 1; i++) B.add('mem', AG.sph, end.x - 0.1, end.y, i * 0.05, 0.2, 0.025, 0.07, 0, i * 0.6, 0, wc); }
            else if (tt === 'fan') { B.add('mem', AG.sph, end.x - 0.1, end.y, 0, 0.22, 0.03, 0.2, 0, 0, 0, wc, (x, y, z, nx, ny, nz, t, c0) => { t.copy(c0).lerp(ZA_C(dna.we), Math.min(1, Math.abs(z) * 3.5)); }); }
            else if (tt === 'ribbon') { const rp = []; for (let i = 0; i <= 6; i++) rp.push(new T.Vector3(end.x - i * 0.09, end.y + Math.sin(i * 0.9) * 0.06, Math.cos(i * 0.9) * 0.03)); B.add('mem', zaTube(T, rp, [0.035, 0.03, 0.02, 0.01], 4, 14, true), 0, 0, 0, 1, 1, 1, 0, 0, 0, wc); const rp2 = rp.map(p => new T.Vector3(p.x + 0.01, p.y + 0.02, -p.z - 0.02)); B.add('glow', zaTube(T, rp2, [0.02, 0.016, 0.01, 0.004], 4, 14, true), 0, 0, 0, 1, 1, 1, 0, 0, 0, ZA_C(dna.we)); }
            else if (tt === 'bolt') { const bp = [[0, 0], [-0.07, 0.07], [-0.1, 0.01], [-0.18, 0.09]]; for (let i = 0; i < 3; i++) B.add('glow', AG.cone, end.x + (bp[i][0] + bp[i + 1][0]) / 2, end.y + (bp[i][1] + bp[i + 1][1]) / 2, 0, 0.035, 0.12, 0.035, 0, 0, Math.atan2(bp[i + 1][1] - bp[i][1], bp[i + 1][0] - bp[i][0]) - Math.PI / 2, ZA_C(dna.a)); }
            else if (tt === 'star') { for (let i = 0; i < 5; i++) { const a = i / 5 * 6.2832; B.add('glow', AG.cone, end.x - 0.08, end.y, 0, 0.05, 0.12, 0.035, 0, a, Math.PI / 2 + Math.sin(a) * 0.5, ZA_C(i % 2 ? '#ffd766' : '#ffffff')); } B.add('glow', AG.sph, end.x - 0.08, end.y, 0, 0.07, 0.07, 0.07, 0, 0, 0, ZA_C('#fff2b0')); }
            /* espinhos ao longo da cauda */
            if (dna.back !== 'leaves' && dna.back !== 'fin') for (let i = 1; i < 5; i++) { const p = pts[i], s = 0.05 * (1 - i * 0.16); B.add('horn', AG.cone, p.x, p.y + 0.06 * (1 - i * 0.15), 0, s * 0.7, s * 1.6, s * 0.5, 0, 0, 0.2, ac); }
            B.bake(tl, mats); }
        /* asas */
        [-1, 1].forEach(sd => { const w = new T.Group(); w.position.set(0.1, legH + 0.31 * bulk, 0.09 * sd * bulk); w.rotation.x = sd * 0.5; body.add(w); const B = zaB(T); zaWing(T, B, { sd, type: dna.wing, w: dna.w, we: dna.we, span: 0.82 * wingK * (rk >= 4 ? 1.15 : rk >= 3 ? 1.08 : 1), mem: { mem: 'mem', bone: 'bone' } }); B.bake(w, mats); P.wings.push({ g: w, sd }); });
        /* extras do corpo */
        { const B = zaB(T), ex = dna.extra || []; if (ex.indexOf('flowers') >= 0) for (let i = 0; i < 6; i++) { const x = 0.15 - i * 0.07, z = (i % 2 ? 0.06 : -0.06), y = legH + 0.15 + bH * 0.5 + 0.0; B.add('glow', AG.sph, x, y, z, 0.05, 0.05, 0.05, 0, 0, 0, ZA_C(['#ff8ad0', '#ffe27a', '#ffffff'][i % 3])); B.add('glow', AG.sph, x, y, z, 0.022, 0.022, 0.022, 0, 0, 0, ZA_C('#ffb020')); }
            if (ex.indexOf('moss') >= 0) for (let i = 0; i < 5; i++) B.add('skin', AG.sph, -0.1 + i * 0.05, legH + 0.15 + bH * 0.5 + 0.0, (i % 2 ? 0.05 : -0.05), 0.09, 0.05, 0.08, 0, 0, 0, ZA_C('#4a8a2a'));
            if (ex.indexOf('cracks') >= 0 || ex.indexOf('embers') >= 0) for (let i = 0; i < 7; i++) { const a = i * 1.7; B.add('glow', AG.sph, 0.18 - i * 0.055, legH + 0.14 + Math.sin(a) * bH * 0.4, Math.cos(a) * bW * 0.5 * 0.96, 0.03, 0.012, 0.03, 0, 0, 0, ZA_C(dna.g || '#ff8a2a')); }
            if (ex.indexOf('gems') >= 0 || ex.indexOf('pearls') >= 0 || ex.indexOf('sparkle') >= 0) for (let i = 0; i < 5; i++) B.add('glow', AG.oct, 0.16 - i * 0.07, legH + 0.15 + bH * 0.5 - 0.01, (i % 2 ? 0.07 : -0.07), 0.035, 0.05, 0.035, 0, i, 0, ZA_C(i % 2 ? dna.we : dna.a));
            if (ex.indexOf('icicles') >= 0) for (let i = 0; i < 5; i++) B.add('skin', AG.cone, 0.14 - i * 0.07, legH + 0.04, (i % 2 ? 0.08 : -0.08), 0.03, -0.09, 0.03, 0, 0, 0, ZA_C('#d8f2ff'));
            if (ex.indexOf('armor') >= 0) for (let i = 0; i < 4; i++) B.add('horn', AG.oct, 0.1 - i * 0.08, legH + 0.14, 0, 0.012 + 0.0, 0.01, 0.01, 0, 0, 0, cA);
            if (ex.indexOf('bubbles') >= 0 || ex.indexOf('sparks') >= 0 || ex.indexOf('stars') >= 0 || ex.indexOf('ribbons') >= 0 || ex.indexOf('vines') >= 0 || ex.indexOf('pebbles') >= 0 || ex.indexOf('frost') >= 0) { /* decorações mínimas junto ao corpo */
                const kind = ex.indexOf('bubbles') >= 0 ? 'b' : ex.indexOf('sparks') >= 0 ? 's' : ex.indexOf('stars') >= 0 ? 'st' : ex.indexOf('vines') >= 0 ? 'v' : ex.indexOf('pebbles') >= 0 ? 'p' : ex.indexOf('frost') >= 0 ? 'f' : 'r';
                for (let i = 0; i < 6; i++) { const x = 0.18 - i * 0.07, z = (i % 2 ? 1 : -1) * (bW * 0.55), y = legH + 0.1 + (i % 3) * 0.05; if (kind === 'v') B.add('skin', AG.sph, x, y, z, 0.05, 0.02, 0.05, 0, 0, i, ZA_C('#2a8a3a')); else if (kind === 'p') B.add('horn', AG.ico, x, y, z, 0.035, 0.03, 0.035, i, i, 0, cA); else B.add('glow', kind === 'st' ? AG.oct : AG.sph, x, y, z, 0.03, 0.03, 0.03, 0, i, 0, ZA_C(kind === 'b' ? '#bfeaff' : kind === 's' ? '#ffee6a' : kind === 'f' ? '#ffffff' : '#fff2b0')); } }
            B.bake(body, mats); }
        /* aura, orbes, coroa, sombra (como nos outros dragões do jogo) */
        let aura = null; if (rk >= 2 || isElder) { const aCol = glowC || EL.col; aura = new T.Mesh(zG().ring, new T.MeshBasicMaterial({ color: aCol, transparent: true, opacity: 0.38, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide })); aura.position.y = 0.02; aura.scale.setScalar(0.46 + rk * 0.08); root.add(aura); if (rk >= 3) { const ir = new T.Mesh(new T.RingGeometry(0.2, 0.28, 24), new T.MeshBasicMaterial({ color: aCol, transparent: true, opacity: 0.55, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide })); ir.rotation.x = -Math.PI / 2; ir.position.y = 0.025; ir.scale.setScalar(0.52 + rk * 0.08); root.add(ir); } }
        const orbs = []; if (rk >= 4) for (let i = 0; i < 3; i++) { const om = new T.Mesh(AG.sph, new T.MeshBasicMaterial({ color: i % 2 ? '#ffd766' : '#ffffff', transparent: true, opacity: 0.85 })); om.scale.setScalar(0.04); root.add(om); orbs.push(om); }
        if (isElder) { const cg = new T.Group(); cg.position.set(0.08, 1.0, 0); const cr = new T.Mesh(new T.TorusGeometry(0.18, 0.025, 8, 24), new T.MeshBasicMaterial({ color: '#ffd35c', transparent: true, opacity: 0.95, side: T.DoubleSide })); cr.rotation.x = Math.PI / 2; cg.add(cr); for (let i = 0; i < 5; i++) { const a = i / 5 * 6.2832, tip = new T.Mesh(AG.cone, new T.MeshBasicMaterial({ color: '#ffea7a' })); tip.scale.set(0.025, 0.07, 0.025); tip.position.set(Math.cos(a) * 0.18, 0.035, Math.sin(a) * 0.18); cg.add(tip); } root.add(cg); P.crown = cg; }
        const shadow = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshBasicMaterial({ map: zSoftTex(), color: 0x000000, transparent: true, opacity: 0.35, depthWrite: false })); shadow.rotation.x = -Math.PI / 2; shadow.renderOrder = 2; root.add(shadow);
        const szm = (sp.cl && sp.cl.sz) || 1; root.scale.setScalar(szm * 1.15 * lvScale); body.userData.base = body.position.y;
        return { g: root, body, P, aura, orbs, sp, shadow, sz: szm * 1.6 * lvScale, span: szm * 3.2 * lvScale, crownY: 1.0, footG: 0.28, dragon: true, canWalk: true, fts: 1.0, pit0: 0, model: false };
    }
    /* ferramenta de revisão: folha de contato dos dragões em tamanho grande (usada nos testes) */
    window.ruaZoo = window.ruaZoo || {}; window.ruaZoo.shot = function (ids, lvl, w, h, yaw) {
        const T = clTh(); w = w || 480; h = h || 340; ids = ids && ids.length ? ids : ZSP.map(s => s.id); const cols = Math.min(4, ids.length), rows = Math.ceil(ids.length / cols), out = document.createElement('canvas'); out.width = cols * w; out.height = rows * h; const oc = out.getContext('2d'); oc.fillStyle = '#10202e'; oc.fillRect(0, 0, out.width, out.height);
        const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const r = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, preserveDrawingBuffer: true }); r.setSize(w, h, false); r.outputEncoding = T.sRGBEncoding; r.setClearColor(0x1a2b3d, 1);
        ids.forEach((id, i) => { const sc = new T.Scene(); sc.add(new T.HemisphereLight(0xfff2d8, 0x6a7a98, 1.0)); const d1 = new T.DirectionalLight(0xffffff, 1.4); d1.position.set(2, 4, 3); sc.add(d1); const d2 = new T.DirectionalLight(0xbcd0ff, 0.5); d2.position.set(-3, 1, -2); sc.add(d2); const B = zBuild(zsp(id), true, lvl || 6); B.g.rotation.y = Array.isArray(yaw) ? yaw[i % yaw.length] : (yaw === undefined ? -0.6 : yaw); B.P.wings.forEach(wg => { wg.g.rotation.x = wg.sd * 0.5; }); if (B.shadow) B.shadow.visible = false; sc.add(B.g); B.g.updateMatrixWorld(true); if (B.mixer) B.mixer.setTime(0.35); if (B.fxStep) for (let q = 0; q < 50; q++) B.fxStep(q * 0.05, 0.05); B.g.updateMatrixWorld(true); const bb = B.mixer ? zPosedBox(B.g) : new T.Box3().setFromObject(B.g), sz = bb.getSize(new T.Vector3()), c = bb.getCenter(new T.Vector3()), cam = new T.PerspectiveCamera(30, w / h, 0.05, 50), m = Math.max(sz.x, sz.y * 1.1, sz.z) * 1.3; cam.position.set(c.x + m * 0.55, c.y + m * 0.28 + sz.y * 0.1, c.z + m * 1.25); cam.lookAt(c.x, c.y, c.z); r.render(sc, cam); oc.drawImage(cv, (i % cols) * w, Math.floor(i / cols) * h); oc.fillStyle = '#fff'; oc.font = 'bold 16px sans-serif'; oc.fillText(id, (i % cols) * w + 8, Math.floor(i / cols) * h + 20); });
        r.dispose(); return out.toDataURL('image/jpeg', 0.92);
    };
/* ===== cortex/36jme-colony-dragon-fx.js: DRAGÕES DOS MODELOS NOVOS (Sketchfab, CC-BY): material padronizado (cor, brilho, luz) e EFEITOS 3D por espécie que crescem com o nível: folhas, bolhas, fumaça, neve, faíscas, fogo, raios, fitas de luz e coroa no nível 10. ===== */
    function zStdMat(mt, sp, D, rk) {   /* mesmo tratamento de cor e luz para todos os modelos, para ficarem uniformes */
        const T = clTh(), c = mt.clone(), glow = sp.glow || null;
        if (c.map) {
            if (D.tint && D.tint[0] && c.color) { const tm = zTintMap(c.map, D.tint[0], Math.max(0.55, Math.min(0.95, (D.tint[1] || 0.7) * 1.15))); if (tm) { c.map = tm; c.color.set('#ffffff'); } }
            if (c.emissive) { c.emissiveMap = c.map; c.emissive.set(glow || '#ffffff'); c.emissiveIntensity = glow ? 0.3 + rk * 0.07 : 0.14; }
        } else if (c.color && D.tint && D.tint[0]) {   /* sem textura: troca só o matiz de cada cor, mantendo chifres, barriga e olhos */
            const th = {}, mc = {}; new T.Color(D.tint[0]).getHSL(th); c.color.getHSL(mc); if (mc.s > 0.14) c.color.setHSL(th.h, Math.min(1, 0.55 + mc.s * 0.4), mc.l);
        }
        if (c.roughness !== undefined) { c.roughness = 0.62; c.metalness = sp.id === 'bronze' ? 0.55 : 0.05; }
        c.side = T.DoubleSide; c.shadowSide = T.DoubleSide;
        if (rk >= 1 && glow && c.emissive) {   /* contorno de luz na cor da espécie, mais forte nos raros */
            const RK = ZOO.rimU = ZOO.rimU || {}, ru = RK[sp.id] = RK[sp.id] || { value: 1 }, rc = new T.Color(glow), kk = [0, 0.4, 0.7, 1.0, 1.35][rk];
            c.onBeforeCompile = sh => { sh.uniforms.uRimC = { value: rc }; sh.uniforms.uRimK = ru; sh.uniforms.uRimS = { value: kk }; sh.fragmentShader = 'uniform vec3 uRimC;uniform float uRimK;uniform float uRimS;\n' + sh.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n{float rm = pow(1.0 - clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0), 2.4); totalEmissiveRadiance += uRimC * rm * uRimS * uRimK;}'); };
            c.customProgramCacheKey = () => 'drim_' + sp.id; (ZOO.curRim = ZOO.curRim || []).push(ru);
        }
        return c;
    }
    /* perfil de efeito de cada espécie: tipo de partícula e cores */
    const ZFXP = {
        musgo: { k: 'leaf', c: ['#8fe060', '#d8ff90'] }, argila: { k: 'dust', c: ['#d9a066', '#f0d0a0'] }, orvalho: { k: 'bubble', c: ['#bfeaff', '#ffffff'] }, brisa: { k: 'wind', c: ['#ffffff', '#bfe0ff'] },
        cascalho: { k: 'pebble', c: ['#a6957b', '#d8ccb6'] }, cinza: { k: 'smoke', c: ['#8a8a96', '#ff8a2a'] },
        floresta: { k: 'leaf', c: ['#4ee06a', '#c0ff80', '#ff9ad8'] }, ambar: { k: 'spark', c: ['#ffc860', '#fff0b0'] }, mare: { k: 'drop', c: ['#6ab8ff', '#d8f0ff'] }, geada: { k: 'snow', c: ['#ffffff', '#bfe8ff'] }, bronze: { k: 'glint', c: ['#ffd27a', '#fff4cc'] },
        prisma: { k: 'rainbow', c: [] }, esmeralda: { k: 'spark', c: ['#40ffa0', '#d0ffe8'] }, ametista: { k: 'spark', c: ['#c08aff', '#f0e0ff'] }, solar: { k: 'ray', c: ['#ffe27a', '#fff6c8'] },
        vulcao: { k: 'fire', c: ['#ff5a1a', '#ffc23a'] }, tempestade: { k: 'bolt', c: ['#bcd0ff', '#fff7a0'] }, aurora: { k: 'ribbon', c: ['#ff8ae8', '#6affea', '#ffe27a'] },
        eclipse: { k: 'flare', c: ['#8a5aff', '#ffcc44'] }, morcego: { k: 'spark', c: ['#a070ff', '#e6d0ff'] }, chamas: { k: 'fire', c: ['#ff6a1a', '#ffd24a'] }, hamster: { k: 'flare', c: ['#c58bff', '#ffe27a', '#ffffff'] }, vigia: { k: 'flare', c: ['#8fd8ff', '#ff9ad8', '#ffffff'] }, sabio: { k: 'leaf', c: ['#7fae6a', '#d8f0b0'] },
        guardiao_botanico: { k: 'leaf', c: ['#4ade80', '#fef08a'] }, sereia_glacial: { k: 'snow', c: ['#bae6fd', '#38bdf8'] }, morcego_noturno: { k: 'spark', c: ['#38bdf8', '#e0f2fe'] }, crono_engenheiro: { k: 'glint', c: ['#fbbf24', '#c084fc'] }, demonio_cinzas: { k: 'fire', c: ['#ff4500', '#fde047'] }, colosso_obsidiana: { k: 'fire', c: ['#fb923c', '#f59e0b'] }, arquimago_astral: { k: 'flare', c: ['#fbbf24', '#818cf8'] }
    };
    function zDragonFxAttach(Bd, sp, al, hi) {
        const T = clTh(), pr = ZFXP[sp.id]; if (!pr) return; const rk = sp.rk | 0, lvF = Math.min(1, Math.max(0, (al - 1) / 9)), inten = 0.35 + 0.65 * lvF, N = Math.max(6, Math.round((10 + rk * 5) * (0.5 + 0.9 * lvF) * (hi ? 1 : 0.55))), R = Bd.span * 0.34, k = pr.k, cols = pr.c.map(h => new T.Color(h));
        const pos = new Float32Array(N * 3), col = new Float32Array(N * 3), st = [], rnd = Math.random;
        const sz = { leaf: 0.2, dust: 0.22, bubble: 0.3, wind: 0.14, pebble: 0.14, smoke: 0.5, spark: 0.16, drop: 0.14, snow: 0.16, glint: 0.14, rainbow: 0.17, ray: 0.2, fire: 0.3, bolt: 0.14, ribbon: 0.18, flare: 0.26 }[k] || 0.2;
        const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(pos, 3)); geo.setAttribute('color', new T.BufferAttribute(col, 3));
        const mat = new T.PointsMaterial({ size: R * sz, map: zSoftTex(), vertexColors: true, transparent: true, depthWrite: false, blending: T.AdditiveBlending, sizeAttenuation: true }), pts = new T.Points(geo, mat); pts.frustumCulled = false; pts.renderOrder = 6; Bd.g.add(pts);
        const spawn = (p, i0) => { const a = rnd() * 6.2832, r = R * (0.3 + 0.9 * rnd()), y = (rnd() - 0.2) * R * 0.7; p.life = 0; p.max = 1.2 + rnd() * 1.6; p.ph = rnd() * 6.28; p.c = cols.length ? cols[(rnd() * cols.length) | 0] : null;
            if (k === 'wind' || k === 'ribbon' || k === 'ray' || k === 'spark' || k === 'glint' || k === 'rainbow') { p.a = a; p.r = r * 0.9; p.y = y; p.v = 0.5 + rnd() * 0.9; } else { p.x = Math.cos(a) * r * 0.9; p.z = Math.sin(a) * r * 0.9; p.y = y; p.vx = (rnd() - 0.5) * 0.2; p.vz = (rnd() - 0.5) * 0.2; p.vy = k === 'fire' ? 0.8 + rnd() * 0.9 : (k === 'smoke' || k === 'bubble') ? 0.3 + rnd() * 0.3 : k === 'drop' || k === 'pebble' ? -(1.0 + rnd()) : -(0.2 + rnd() * 0.3); } };
        for (let i = 0; i < N; i++) { const p = {}; spawn(p, i); p.life = rnd() * p.max; st.push(p); }
        let bolt = null; if (k === 'bolt') { const bg = new T.BufferGeometry(), bp = new Float32Array(40 * 3); bg.setAttribute('position', new T.BufferAttribute(bp, 3)); bolt = new T.LineSegments(bg, new T.LineBasicMaterial({ color: 0xd8e4ff, transparent: true, opacity: 0.9, blending: T.AdditiveBlending, depthWrite: false })); bolt.frustumCulled = false; Bd.g.add(bolt); bolt.userData.t = 0; }
        let corona = null; if (sp.id === 'eclipse' || (rk >= 4 && lvF > 0.4)) { corona = new T.Mesh(new T.TorusGeometry(R * 0.55, R * 0.03, 6, 36), new T.MeshBasicMaterial({ color: sp.id === 'eclipse' ? '#ffcc44' : (sp.glow || '#ffd766'), transparent: true, opacity: 0.8, blending: T.AdditiveBlending, depthWrite: false })); corona.position.set(0, R * 0.75, 0); corona.rotation.x = Math.PI / 2.4; Bd.g.add(corona); }
        let crown = null; if (al >= 10) { crown = new T.Group(); const cr = new T.Mesh(new T.TorusGeometry(R * 0.28, R * 0.025, 8, 26), new T.MeshBasicMaterial({ color: '#ffd35c' })); cr.rotation.x = Math.PI / 2; crown.add(cr); for (let i = 0; i < 6; i++) { const a = i / 6 * 6.2832, tp = new T.Mesh(zaRes().cone, new T.MeshBasicMaterial({ color: '#fff0a0' })); tp.scale.set(R * 0.05, R * 0.17, R * 0.05); tp.position.set(Math.cos(a) * R * 0.28, R * 0.01, Math.sin(a) * R * 0.28); crown.add(tp); } crown.position.set(0, R * 0.8, 0); Bd.g.add(crown); }
        let aura = null; if (al >= 3 && rk >= 1) { aura = new T.Mesh(new T.RingGeometry(R * 0.9, R * 1.05, 40), new T.MeshBasicMaterial({ color: sp.glow || (cols[0] || new T.Color('#fff')), transparent: true, opacity: 0.0, side: T.DoubleSide, blending: T.AdditiveBlending, depthWrite: false })); aura.rotation.x = -Math.PI / 2; aura.position.y = -R * 0.2; Bd.g.add(aura); }
        const tmp = new T.Color(), hue = new T.Color();
        Bd.fxStep = (t, dt) => {
            for (let i = 0; i < N; i++) { const p = st[i]; p.life += dt; if (p.life > p.max) spawn(p); const u = p.life / p.max, fade = Math.sin(Math.min(1, u) * 3.1416), ix = i * 3; let x, y, z;
                if (p.a !== undefined) { p.a += dt * p.v * (k === 'wind' ? 1.4 : 0.6); x = Math.cos(p.a) * p.r; z = Math.sin(p.a) * p.r; y = p.y + (k === 'ribbon' ? Math.sin(p.a * 2 + p.ph) * R * 0.25 : Math.sin(t * 1.5 + p.ph) * R * 0.08) + (k === 'ray' ? u * R * 0.3 : 0); }
                else { p.x += (p.vx + Math.sin(t * 1.3 + p.ph) * 0.08) * dt; p.z += (p.vz + Math.cos(t * 1.1 + p.ph) * 0.08) * dt; p.y += p.vy * dt * R * 0.5; x = p.x; y = p.y; z = p.z; }
                pos[ix] = x; pos[ix + 1] = y; pos[ix + 2] = z; let b = fade * inten; if (k === 'spark' || k === 'glint' || k === 'rainbow') b *= 0.5 + 0.5 * Math.sin(t * 6 + p.ph * 3);
                if (k === 'rainbow') { hue.setHSL(((t * 0.2 + p.ph) % 1 + 1) % 1, 1, 0.65); tmp.copy(hue); } else if (k === 'fire') { tmp.copy(cols[0]).lerp(cols[1], 1 - u); } else if (p.c) tmp.copy(p.c); else tmp.set(1, 1, 1); col[ix] = tmp.r * b; col[ix + 1] = tmp.g * b; col[ix + 2] = tmp.b * b; }
            geo.attributes.position.needsUpdate = true; geo.attributes.color.needsUpdate = true;
            if (bolt) { bolt.userData.t -= dt; if (bolt.userData.t <= 0) { bolt.userData.t = 0.12 + Math.random() * 0.25; const bp = bolt.geometry.attributes.position.array, n = Math.round(6 + 10 * lvF); let px = (Math.random() - 0.5) * R, py = R * 0.6, pz = (Math.random() - 0.5) * R; for (let i = 0; i < 40; i++) { if (i / 2 >= n) { bp[i * 3] = bp[i * 3 + 1] = bp[i * 3 + 2] = 0; continue; } if (i % 2 === 0) { bp[i * 3] = px; bp[i * 3 + 1] = py; bp[i * 3 + 2] = pz; } else { px += (Math.random() - 0.5) * R * 0.35; py -= R * 0.12 * (0.5 + Math.random()); pz += (Math.random() - 0.5) * R * 0.35; bp[i * 3] = px; bp[i * 3 + 1] = py; bp[i * 3 + 2] = pz; } } bolt.geometry.attributes.position.needsUpdate = true; } bolt.material.opacity = (0.35 + 0.65 * Math.max(0, bolt.userData.t * 6)) * (0.4 + 0.6 * inten); }
            if (corona) { corona.rotation.z = t * 0.8; corona.material.opacity = 0.55 + 0.25 * Math.sin(t * 2); }
            if (crown) { crown.rotation.y = t * 1.2; crown.position.y = R * 0.8 + Math.sin(t * 2) * R * 0.04; }
            if (aura) { aura.material.opacity = (0.22 + 0.12 * Math.sin(t * 2.4)) * (0.4 + 0.6 * lvF); aura.scale.setScalar(1 + 0.08 * Math.sin(t * 2.4)); }
        };
    }
/* === [SEC: DRAGOES_BATALHA_3D] === */
    /* ===== BATALHA 3D DOS DRAGÕES: arena de pedra, golpes de verdade (investida, projétil, raio), câmera de cinema, números de dano ===== */
    const ZBT = { on: false };
    const ZBT_ST = {   /* aparência de cada elemento */
        terra: { c: '#9be05a', c2: '#b98a4a', tex: 'magic_03', smk: 'smoke_04', core: 'rock', n: 'Estilhaço de Rocha' },
        agua: { c: '#5fc0ff', c2: '#d4f1ff', tex: 'circle_05', smk: 'smoke_02', core: 'orb', n: 'Jato de Maré' },
        cristal: { c: '#7ff2ff', c2: '#d08bff', tex: 'star_03', smk: 'spark_02', core: 'shard', n: 'Lança de Cristal' },
        estelar: { c: '#ffd35c', c2: '#b67bff', tex: 'star_02', smk: 'spark_03', core: 'orb', n: 'Chuva Estelar' },
        fogo: { c: '#ff7a2a', c2: '#ffd24a', tex: 'flame_03', smk: 'smoke_01', core: 'orb', n: 'Sopro de Magma' }
    };

    /* 3 golpes de cada dragão: [nome, jeito de atacar]. jeitos: dash, tail, dive | orb, triple, wave, breath, meteors | beam, rain, nova, pillars, lightning */
    const ZBT_MV = {
        musgo: [['Chicote de Cipó', 'tail'], ['Espinhos de Folha', 'triple'], ['Chuva de Esporos', 'rain']],
        argila: [['Cabeçada de Barro', 'dash'], ['Projétil de Lama', 'orb'], ['Colunas Sísmicas', 'pillars']],
        orvalho: [['Mergulho Suave', 'dive'], ['Jato d\'Água', 'orb'], ['Redemoinho Abissal', 'nova']],
        brisa: [['Asas de Vendaval', 'tail'], ['Lâminas de Vento', 'dive'], ['Tufão Ciclônico', 'wave']],
        cascalho: [['Cauda de Pedra', 'tail'], ['Granizo de Rocha', 'meteors'], ['Fenda Tectônica', 'pillars']],
        cinza: [['Investida de Fuligem', 'dash'], ['Sopro de Cinzas', 'breath'], ['Mortalha Térmica', 'nova']],
        floresta: [['Chicote de Espinhos', 'tail'], ['Espinhos Vivos', 'triple'], ['Despertar da Selva', 'pillars']],
        ambar: [['Mergulho Dourado', 'dive'], ['Cápsula de Âmbar', 'orb'], ['Prisão de Seiva', 'beam']],
        mare: [['Golpe de Espuma', 'tail'], ['Maremoto Frontal', 'wave'], ['Tsunami Devastador', 'rain']],
        geada: [['Mordida Glacial', 'dash'], ['Estilhaços de Gelo', 'triple'], ['Zero Absoluto', 'nova']],
        bronze: [['Hélice de Bronze', 'dive'], ['Canhão de Rebites', 'orb'], ['Bombardeio de Bronze', 'meteors']],
        prisma: [['Corte Refletor', 'dash'], ['Lanças de Cristal', 'triple'], ['Prisma Radiante', 'beam']],
        esmeralda: [['Cauda Reluzente', 'tail'], ['Geodo Perfurante', 'wave'], ['Selva de Esmeralda', 'pillars']],
        solar: [['Impacto Solar', 'dash'], ['Labareda Heliocêntrica', 'breath'], ['Supernova Incandescente', 'beam']],
        sabio: [['Bênção Folhosa', 'tail'], ['Esferas Rúnicas', 'orb'], ['Cataclismo Arcano', 'rain']],
        vulcao: [['Cauda de Basalto', 'tail'], ['Bombas Vulcânicas', 'meteors'], ['Erupção Vulcânica', 'nova']],
        tempestade: [['Rasante Elétrico', 'dive'], ['Descarga Voltaica', 'lightning'], ['Fúria dos Céus', 'rain']],
        aurora: [['Cometa Polar', 'dash'], ['Brisa Boreal', 'breath'], ['Cortina Boreal', 'wave']],
        chamas: [['Garra Ardente', 'tail'], ['Investida Vulcânica', 'dash'], ['Inferno Concentrado', 'beam']],
        eclipse: [['Passo Umbral', 'dive'], ['Fenda do Vazio', 'dive'], ['Eclipse Gravitacional', 'nova']],
        morcego: [['Mordida da Noite', 'dash'], ['Onda Ultrassônica', 'wave'], ['Revoada Sombria', 'dive']],
        hamster: [['Giro Cósmico', 'tail'], ['Sementes Estelares', 'triple'], ['Cometa Celestial', 'meteors']],
        vigia: [['Olhar Espectral', 'dash'], ['Raio Ocular Arcano', 'beam'], ['Olhar do Julgamento', 'lightning']],
        guardiao_botanico: [['Chicote de Raízes', 'tail'], ['Espinhos de Raízes Vivas', 'pillars'], ['Tempestade de Esporos', 'rain']],
        sereia_glacial: [['Gume Glacial', 'dive'], ['Lança de Gelo Facetado', 'triple'], ['Aurora Congelante', 'wave']],
        morcego_noturno: [['Rasante Sombrio', 'dive'], ['Pulso Ultrassônico Triplo', 'wave'], ['Enxame de Sombras', 'lightning']],
        crono_engenheiro: [['Martelo de Latão', 'dash'], ['Salva de Engrenagens', 'triple'], ['Sobrecarga Chrono', 'nova']],
        demonio_cinzas: [['Garra das Cinzas', 'dash'], ['Corte Infernal em X', 'breath'], ['Juízo de Magma', 'pillars']],
        colosso_obsidiana: [['Punho de Basalto', 'dash'], ['Soco Sísmico', 'wave'], ['Chuva de Bigornas', 'meteors']],
        arquimago_astral: [['Centelha Estelar', 'orb'], ['Orbe Astrolábio', 'triple'], ['Feixe Prisma Astral', 'beam']],
        nimbo: [['Voo de Aurora', 'dash'], ['Agulhas de Constelação', 'triple'], ['Serpente da Aurora', 'wave']]
    };
    const ZBT_PT_IC = { dash: 'ph-lightning', tail: 'ph-arrows-clockwise', dive: 'ph-airplane-tilt', orb: 'ph-circle-wavy', triple: 'ph-arrows-split', wave: 'ph-waves', breath: 'ph-flame', meteors: 'ph-meteor', beam: 'ph-sun-horizon', rain: 'ph-cloud-lightning', nova: 'ph-star-four', pillars: 'ph-mountains', lightning: 'ph-lightning-a' };
    ZBT_MV.boss_vazio = [['Garra do Vazio', 'dash'], ['Chuva de Estrelas Negras', 'meteors'], ['Eclipse Final', 'nova']];
    function zBt3BossSp(tw) {   /* o boss da prova 5 é uma criatura própria (não existe na coleção): dragão vermelho sombrio, com coroa dourada */
        if (tw.id !== 'eclipse') return zsp(tw.sp) || ZSP[0];
        if (!ZBT.bossSp) ZBT.bossSp = Object.assign({}, zsp('eclipse'), { id: 'boss_vazio', n: 'Arauto do Vazio', base: 'red', tint: ['#14081f', 0.95], glow: '#ffcc44', D: 1.8 });
        if (!ZMD.boss_vazio) ZMD.boss_vazio = Object.assign({}, ZMD.eclipse, { f: ZDB.red.f, D: 1.8, yaw: ZDB.red.yaw !== undefined ? ZDB.red.yaw : Math.PI / 2, nb: !!ZDB.red.nb, base: 'red', tint: ['#14081f', 0.95], glow: '#ffcc44' });
        return ZBT.bossSp;
    }
    /* 2026-11-18: os 3 chefes da Fronteira Além são criaturas PRÓPRIAS (não usam dragões da coleção), como o Arauto do Vazio */
    const ZBOSSX = { 5: ['boss_invocador', 'Invocador das Sombras', 'bosses/invocador.glb', ['#3c1a66', 0.45], '#c58bff', /Idle/i, /Walk/i], 6: ['boss_saltitante', 'Saltitante da Tempestade', 'bosses/saltitante.glb', ['#24408a', 0.4], '#7fe3ff', /Idle/i, /Run/i], 7: ['boss_devorador', 'Devorador de Abismos', 'bosses/devorador.glb', ['#8a1a26', 0.25], '#ff5a6a', /Flying_Idle/i, /Fast_Flying/i] };   /* modelos próprios CC0 do Quaternius (ver bosses/LICENSE.txt) */
    /* chefes das regiões 1-5 (fases 5, 10, 15, 20, 25): criaturas NÃO-dragão, modelos CC0 do Quaternius (ver bosses/LICENSE.txt) */
    ZBOSSX[10] = ['boss_r0', 'Colosso de Granito', 'bosses/colosso.glb', ['#8a7a68', 0.12], '#d9b27a', /Flying_Idle/i, /Fast_Flying/i];
    ZBOSSX[11] = ['boss_r1', 'Leviatã dos Abismos', 'bosses/geada.glb', ['#4aa8d8', 0.10], '#9fe3ff', /Idle/i, /Walk/i];
    ZBOSSX[12] = ['boss_r2', 'Prisma Diamantino', 'bosses/mata.glb', ['#4aa35a', 0.10], '#8dff9a', /Idle/i, /Walk/i];
    ZBOSSX[13] = ['boss_r3', 'Titã de Magma Ancestral', 'bosses/magma.glb', ['#c8561e', 0.18], '#ffb070', /Idle/i, /Walk/i];
    ZBOSSX[14] = ['boss_r4', 'Arauto do Vazio Cósmico', 'bosses/vazio.glb', ['#6a3cb0', 0.22], '#e0b8ff', /Idle/i, /Walk/i];
    const ZBOSSP = { 8: ['boss_escorpiao', 'Escorpião Colossal', 'escorpiao', '#9dff4a'], 9: ['boss_aranha', 'Aranha Rainha', 'aranha', '#ff3a4a'], 10: ['boss_automato', 'Autômato Titã', 'automato', '#7fd8ff'], 11: ['boss_olho', 'Olho do Cosmos', 'olho', '#ff9bf0'] };   /* chefes feitos em código (sem arquivo 3D): ver warProcBoss */
    function zBossNewSp(bk) {
        if (ZBOSSP[bk]) { const c0 = ZBOSSP[bk]; if (!ZBT.bossX) ZBT.bossX = {}; if (!ZBT.bossX[bk]) ZBT.bossX[bk] = Object.assign({}, zsp('eclipse'), { id: c0[0], n: c0[1], base: '', dr: 0, bossModel: 1, procBoss: c0[2], glow: c0[3], D: 1.8 }); return ZBT.bossX[bk]; }
        const c = ZBOSSX[bk]; if (!c) return null; if (!ZBT.bossX) ZBT.bossX = {};
        if (!ZBT.bossX[bk]) { ZBT.bossX[bk] = Object.assign({}, zsp('eclipse'), { id: c[0], n: c[1], base: '', dr: 0, bossModel: 1, glow: c[4], D: 1.8 }); ZMD[c[0]] = { f: c[2], D: 1.8, yaw: Math.PI / 2, tint: c[3], glow: c[4], idle: c[5], walk: c[6], dragon: false }; try { clModelLoad(c[2]); } catch (e) {} }
        return ZBT.bossX[bk];
    }
    function zBt3Moves(spId) { return ZBT_MV[spId] || [['Investida', 'dash'], ['Golpe Elemental', 'orb'], ['Rugido Supremo', 'beam']]; }
    function zBt3Move(side, kind) { if (ZBT.forcePat) return { n: 'Teste ' + ZBT.forcePat, p: ZBT.forcePat }; const duel = zDuelGetState(), tw = ZTOWERS[duel.tower], id = side === 'p' ? duel.pStats.sp.id : zBt3BossSp(tw).id; const m = zBt3Moves(id)[{ quick: 0, element: 1, supreme: 2 }[kind] || 0]; return { n: m[0], p: m[1] }; }
    function zBt3Style(side) {
        const duel = zDuelGetState(), tw = ZTOWERS[duel.tower];
        if (side === 'e') return tw.id === 'magma' ? 'fogo' : tw.el === 'fogo' ? 'fogo' : tw.el;
        const sp = duel.pStats.sp; return (sp.id === 'vulcao' || sp.id === 'ambar' || sp.id === 'chamas' || sp.id === 'demonio_cinzas' || sp.id === 'colosso_obsidiana') ? 'fogo' : sp.el;
    }
    const zBtEase = u => u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
    const zBtOut = u => 1 - Math.pow(1 - u, 3);

    function zBt3GroundTex(col, glow) {
        const cv = document.createElement('canvas'); cv.width = cv.height = 1024; const c = cv.getContext('2d'), R = 512;
        if (!glow) { const g = c.createRadialGradient(R, R, 40, R, R, R); g.addColorStop(0, '#5b5560'); g.addColorStop(0.7, '#3f3a45'); g.addColorStop(1, '#2a2630'); c.fillStyle = g; c.fillRect(0, 0, 1024, 1024);
            for (let i = 0; i < 900; i++) { c.fillStyle = 'rgba(' + (i % 3 ? '20,16,24' : '110,104,120') + ',' + (0.05 + Math.random() * 0.12) + ')'; const x = Math.random() * 1024, y = Math.random() * 1024, w = 8 + Math.random() * 40; c.fillRect(x, y, w, 2 + Math.random() * 4); }
            c.strokeStyle = 'rgba(10,8,14,.55)'; c.lineWidth = 2; for (let i = 0; i < 40; i++) { c.beginPath(); let x = Math.random() * 1024, y = Math.random() * 1024; c.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (Math.random() - 0.5) * 70; y += (Math.random() - 0.5) * 70; c.lineTo(x, y); } c.stroke(); } }
        else { c.fillStyle = '#000'; c.fillRect(0, 0, 1024, 1024); }
        c.save(); c.translate(R, R); c.strokeStyle = glow ? col : 'rgba(255,255,255,.12)'; c.shadowColor = col; c.shadowBlur = glow ? 18 : 0;
        [[480, 6], [440, 3], [330, 5], [210, 4], [120, 3]].forEach(a => { c.lineWidth = a[1]; c.beginPath(); c.arc(0, 0, a[0], 0, 6.2832); c.stroke(); });
        for (let i = 0; i < 24; i++) { const an = i / 24 * 6.2832; c.save(); c.rotate(an); c.lineWidth = 4; c.beginPath(); c.moveTo(335, 0); c.lineTo(440, 0); c.stroke(); c.beginPath(); c.moveTo(452, -9); c.lineTo(468, 0); c.lineTo(452, 9); c.stroke(); c.restore(); }
        c.lineWidth = 4; c.beginPath(); for (let i = 0; i < 6; i++) { const an = i / 6 * 6.2832 - 1.5708; const x = Math.cos(an) * 205, y = Math.sin(an) * 205; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.closePath(); c.stroke(); c.restore();
        const T = clTh(), t = new T.CanvasTexture(cv); if (T.sRGBEncoding) t.encoding = T.sRGBEncoding; t.anisotropy = 4; return t;
    }
    function zBt3SkyTex(col) {
        const cv = document.createElement('canvas'); cv.width = 8; cv.height = 256; const c = cv.getContext('2d'), T = clTh(), k = new T.Color(col), top = k.clone().multiplyScalar(0.16), mid = k.clone().multiplyScalar(0.55).lerp(new T.Color('#2a3a6a'), 0.4), low = k.clone().lerp(new T.Color('#ffe2b0'), 0.55);
        const g = c.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, '#' + top.getHexString()); g.addColorStop(0.55, '#' + mid.getHexString()); g.addColorStop(1, '#' + low.getHexString()); c.fillStyle = g; c.fillRect(0, 0, 8, 256);
        const t = new T.CanvasTexture(cv); if (T.sRGBEncoding) t.encoding = T.sRGBEncoding; return t;
    }

    /* ----- partículas e destroços ----- */
    function zBt3P(o) {
        const T = clTh(); if (ZBT.pp.length > (ZOO.lite ? 170 : 340)) return null;
        const sp = new T.Sprite(new T.SpriteMaterial({ map: zFxTex(o.tex), color: o.col, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending, rotation: o.rot || 0 }));
        sp.position.copy(o.pos); sp.scale.setScalar(o.s0 || 0.5); ZBT.sc.add(sp);
        const p = { sp, vel: o.vel ? o.vel.clone() : new T.Vector3(), s0: o.s0 || 0.5, s1: o.s1 === undefined ? (o.s0 || 0.5) : o.s1, life: o.life || 0.8, op: o.op === undefined ? 1 : o.op, g: o.grav || 0, dr: o.drag || 0, a: 0, spin: o.spin || 0 }; ZBT.pp.push(p); return p;
    }
    function zBt3Burst(pos, st, n, spd, big) {
        const T = clTh(), S = ZBT_ST[st]; for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, b = (Math.random() - 0.3) * 3.1, v = spd * (0.35 + Math.random() * 0.8);
            zBt3P({ tex: i % 3 ? S.tex : 'spark_01', col: i % 2 ? S.c : S.c2, pos, vel: new T.Vector3(Math.cos(a) * Math.cos(b) * v, Math.sin(b) * v + spd * 0.25, Math.sin(a) * Math.cos(b) * v), s0: (0.35 + Math.random() * 0.5) * big, s1: 0.05, life: 0.5 + Math.random() * 0.7, grav: 4, drag: 1.6, spin: (Math.random() - 0.5) * 6, rot: Math.random() * 6 }); }
        zBt3P({ tex: 'flare_01', col: S.c2, pos, s0: 1 * big, s1: 7 * big, life: 0.35, op: 0.95 });
        zBt3P({ tex: 'circle_05', col: S.c, pos, s0: 0.6 * big, s1: 9 * big, life: 0.55, op: 0.85 });
        zBt3P({ tex: S.smk, col: S.c, pos, s0: 1.2 * big, s1: 5 * big, life: 0.9, op: 0.5, add: false, vel: new T.Vector3(0, 0.8, 0) });
    }
    function zBt3Debris(pos, st, n, spd) {
        const T = clTh(), S = ZBT_ST[st]; ZBT.dg = ZBT.dg || new T.OctahedronGeometry(1, 0); const lim = ZOO.lite ? 18 : 42;
        for (let i = 0; i < n && ZBT.db.length < lim; i++) { const m = new T.Mesh(ZBT.dg, new T.MeshStandardMaterial({ color: i % 2 ? S.c2 : S.c, emissive: S.c, emissiveIntensity: st === 'terra' ? 0.15 : 0.9, roughness: 0.6, flatShading: true, transparent: true })); const s = 0.1 + Math.random() * 0.22; m.scale.set(s, s * (st === 'cristal' ? 2.2 : 1), s); m.position.copy(pos); ZBT.sc.add(m);
            const a = Math.random() * 6.283, v = spd * (0.4 + Math.random()); ZBT.db.push({ m, vel: new T.Vector3(Math.cos(a) * v, spd * (0.5 + Math.random() * 0.9), Math.sin(a) * v), rv: new T.Vector3(Math.random() * 9, Math.random() * 9, Math.random() * 9), a: 0, life: 1.5 + Math.random() * 0.6 }); }
    }
    function zBt3Light(pos, col, inten, dur) { ZBT.lt = { pos: pos.clone(), col, i: inten, d: dur, a: 0 }; }
    function zBt3Shake(v) { ZBT.trauma = Math.min(1, Math.max(ZBT.trauma || 0, v)); }
    function zBt3At(d, fn) { ZBT.q.push({ at: ZBT.t + d, fn }); }
    function zBt3Tw(dur, fn, done) { ZBT.tw.push({ a: 0, d: Math.max(0.001, dur), fn, done }); }
    function zBt3Dmg(ent, txt, cls) {
        try { const T = clTh(), v = ent.pos().clone(); v.y += ent.span * 0.35; v.project(ZBT.cam); const w = ZBT.box.clientWidth, h = ZBT.box.clientHeight, d = document.createElement('div'); d.className = 'bt-dmg ' + (cls || ''); d.textContent = txt;
            d.style.left = ((v.x * 0.5 + 0.5) * w + (Math.random() - 0.5) * 40) + 'px'; d.style.top = ((-v.y * 0.5 + 0.5) * h) + 'px'; ZBT.box.appendChild(d); setTimeout(() => { try { d.remove(); } catch (e) {} }, 1500); } catch (e) {}
    }
    function zBt3Banner(txt, cls) { const b = ZBT.box && ZBT.box.querySelector('.bt-bn'); if (!b) return; b.className = 'bt-bn'; void b.offsetWidth; b.textContent = txt; b.className = 'bt-bn on ' + (cls || ''); }
    function zBt3Flash(c, a) { const f = ZBT.box && ZBT.box.querySelector('.bt-flash'); if (!f) return; f.style.background = c || '#fff'; f.style.transition = 'none'; f.style.opacity = a === undefined ? 0.9 : a; void f.offsetWidth; f.style.transition = 'opacity .5s ease-out'; f.style.opacity = 0; }
    function zBt3Dim(on) { const d = ZBT.box && ZBT.box.querySelector('.bt-dim'); if (d) d.style.opacity = on ? 1 : 0; }

    /* ----- criaturas ----- */
    function zBt3Ent(sp, side, target, al) {
        const T = clTh(), e = { side, sp, holder: new T.Group(), base: new T.Vector3(side === 'p' ? -4.4 : 4.4, 2.2, 0), off: new T.Vector3(), tilt: 0, rotY: side === 'p' ? 0 : Math.PI, span: target, dead: 0, alpha: 1, fl: 0, Bd: null, mats: [], tries: 0, atkT: 0, ph: Math.random() * 6 };
        e.pos = () => e.holder.position;
        e.mount = () => {
            try { if (sp.base) zEnsureModels([sp.base], false); } catch (er) {}
            let Bd; try { Bd = zBuild(sp, true, al); } catch (er) { Bd = null; } if (!Bd || !Bd.g) return;
            if (e.Bd && e.Bd.g) e.holder.remove(e.Bd.g); e.Bd = Bd; const g = Bd.g; g.scale.setScalar(1); g.position.set(0, 0, 0); g.rotation.set(0, 0, 0);
            try { if (Bd.act && Bd.act.fly && Bd.mixer) { zDragonAct(Bd, Bd.act.fly, 1); Bd.mixer.setTime(Bd.act.fly.getClip().duration * 0.15); } } catch (er) {}
            const bb = zPosedBox(g), sz = bb.getSize(new T.Vector3()), ct = bb.getCenter(new T.Vector3()), k = target / Math.max(sz.x, sz.y * 1.15, sz.z, 0.01);
            g.scale.setScalar(k); g.position.set(-ct.x * k, -ct.y * k, -ct.z * k); e.holder.add(g);
            e.mats = []; g.traverse(o => { if (!o.isMesh) return; o.castShadow = !ZOO.lite; (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { if (m && m.emissive) { if (!m.userData._e0) { m.userData._e0 = m.emissive.clone(); m.userData._i0 = m.emissiveIntensity; } e.mats.push(m); } }); });
        };
        { const cv2 = document.createElement('canvas'); cv2.width = cv2.height = 128; const c2 = cv2.getContext('2d'), gr = c2.createRadialGradient(64, 64, 4, 64, 64, 62); gr.addColorStop(0, 'rgba(0,0,0,.75)'); gr.addColorStop(0.55, 'rgba(0,0,0,.38)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); c2.fillStyle = gr; c2.fillRect(0, 0, 128, 128);
          e.blob = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshBasicMaterial({ map: new T.CanvasTexture(cv2), transparent: true, depthWrite: false, opacity: 0.7, fog: false })); e.blob.rotation.x = -Math.PI / 2; e.blob.renderOrder = 1; ZBT.sc.add(e.blob); }
        e.mount(); ZBT.sc.add(e.holder); e.holder.position.copy(e.base); return e;
    }
    function zBt3EntStep(e, dt, t) {
        if ((!e.Bd || !e.Bd.model) && e.sp.id !== 'cometa' && e.tries < 40 && t - (e.lt || 0) > 0.6) { e.lt = t; e.tries++; try { const hadBd = e.Bd; e.mount(); if (hadBd && e.Bd && e.Bd.model) zBt3Burst(e.holder.position.clone(), zBt3Style(e.side), 14, 4, 0.8); } catch (er) {} }
        const Bd = e.Bd; if (Bd) { try { if (Bd.mixer) Bd.mixer.update(dt); if (Bd.fxStep) Bd.fxStep(t, Math.min(dt, 0.05)); if (Bd.P && !Bd.mixer) { const ts = t; if (Bd.P.wings) Bd.P.wings.forEach(w => { w.g.rotation.x = w.sd * (0.48 + 0.3 * Math.sin(ts * 5)); }); if (Bd.P.tail) Bd.P.tail.rotation.y = Math.sin(ts * 3) * 0.3; } } catch (er) {} }
        if (e.atkT > 0) { e.atkT -= dt; if (e.atkT <= 0 && Bd && Bd.act && Bd.act.fly) { try { zDragonAct(Bd, Bd.act.fly, 1); } catch (er) {} } }
        const bob = Math.sin(t * 1.7 + e.ph) * 0.28 * (e.dead ? 0 : 1);
        e.holder.position.set(e.base.x + e.off.x, e.base.y + e.off.y + bob - e.dead * 3.2, e.base.z + e.off.z);
        e.holder.rotation.set(0, e.rotY + (e.spin || 0) + Math.sin(t * 0.9 + e.ph) * 0.05, e.tilt + e.dead * (e.side === 'p' ? 1.35 : -1.35) + Math.sin(t * 1.3 + e.ph) * 0.03);
        if (e.fl > 0.002 || e.fl < 0) { e.fl *= Math.max(0, 1 - dt * 7); const f = e.fl; e.mats.forEach(m => { const u = m.userData; m.emissive.copy(u._e0).lerp(ZBT.white, Math.min(1, f)); m.emissiveIntensity = u._i0 + f * 1.8; }); if (f < 0.01) { e.fl = 0; e.mats.forEach(m => { m.emissive.copy(m.userData._e0); m.emissiveIntensity = m.userData._i0; }); } }
        if (e.blob) { const h = Math.max(0, e.holder.position.y), wd = e.span * (1.15 + h * 0.06); e.blob.position.set(e.holder.position.x, 0.06, e.holder.position.z); e.blob.scale.set(wd * 1.25, wd * 0.8, 1); e.blob.material.opacity = Math.max(0.12, 0.62 - h * 0.07) * e.alpha; }
        if (e.dead) { e.alpha = Math.max(0, 1 - e.dead * 0.9); e.mats.forEach(m => { m.transparent = true; m.opacity = e.alpha; }); }
    }
    function zBt3Act(e, name, ts, dur) { const Bd = e.Bd; if (!Bd || !Bd.act) return; const a = Bd.act[name] || Bd.act.fly; try { zDragonAct(Bd, a, ts || 1); } catch (er) {} e.atkT = dur || 0.8; }

    /* ----- projétil por elemento ----- */
    function zBt3Proj(from, to, st, big, dur, done) {
        const T = clTh(), S = ZBT_ST[st], g = new T.Group(); let core;
        if (S.core === 'rock') { core = new T.Mesh(new T.IcosahedronGeometry(0.55 * big, 0), new T.MeshStandardMaterial({ color: '#7a5a38', emissive: S.c, emissiveIntensity: 0.5, roughness: 0.8, flatShading: true })); }
        else if (S.core === 'shard') { core = new T.Mesh(new T.OctahedronGeometry(0.4 * big, 0), new T.MeshStandardMaterial({ color: S.c, emissive: S.c2, emissiveIntensity: 1.4, roughness: 0.2, metalness: 0.3, flatShading: true })); core.scale.set(0.8, 2.2, 0.8); }
        if (core) g.add(core);
        const gl = new T.Sprite(new T.SpriteMaterial({ map: zFxTex('flare_01'), color: S.c2, transparent: true, depthWrite: false, blending: T.AdditiveBlending })); gl.scale.setScalar(2.6 * big); g.add(gl);
        const gl2 = new T.Sprite(new T.SpriteMaterial({ map: zFxTex(S.tex), color: S.c, transparent: true, depthWrite: false, blending: T.AdditiveBlending })); gl2.scale.setScalar(2 * big); g.add(gl2);
        g.position.copy(from); ZBT.sc.add(g); ZBT.proj = g; const mid = from.clone().lerp(to, 0.5); mid.y += 2.2; ZBT.projT = null; let last = from.clone();
        zBt3Tw(dur, u => { if (ZBT.dbg === 'proj' && u > 0.5) ZBT.mul = 0; const e = zBtEase(u), a = from.clone().lerp(mid, e), b = mid.clone().lerp(to, e); g.position.copy(a.lerp(b, e)); if (core) { core.rotation.x += 0.25; core.rotation.y += 0.3; } gl.material.rotation += 0.1;
            const vv = g.position.clone().sub(last); last.copy(g.position);
            for (let i = 0; i < 2; i++) { zBt3P({ tex: i ? S.tex : S.smk, col: i ? S.c : S.c2, pos: g.position.clone().add(new T.Vector3((Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4)), vel: vv.clone().multiplyScalar(-4).add(new T.Vector3((Math.random() - 0.5), (Math.random() - 0.5), (Math.random() - 0.5))), s0: 0.9 * big, s1: 0.1, life: 0.55, op: 0.8, add: i ? true : st === 'terra' }); }
            ZBT.lt = { pos: g.position.clone(), col: S.c, i: 1.6, d: 0.2, a: 0 }; }, () => { ZBT.sc.remove(g); ZBT.proj = null; try { g.traverse(o => { if (o.material) o.material.dispose(); if (o.geometry) o.geometry.dispose(); }); } catch (er) {} done && done(); });
    }

    /* ----- câmera ----- */
    function zBt3Shot(name, a, b) {   /* tomadas suaves: pequenos deslocamentos em volta do plano geral (sem saltos bruscos) */
        const C = ZBT.cs, k = Math.min(ZBT.dist, ZBT.zcap || 99), up = ZBT.up || 0; ZBT.shot = name;
        const d = a && b ? Math.sign(b.base.x - a.base.x) : 1, mx = a && b ? (a.base.x + b.base.x) * 0.5 : 0;
        C.p.set(0, 5.4 + up, k); C.l.set(0, 1.9, 0); C.f = 42;
        if (name === 'att') { C.p.set(-d * 2.4, 5.0 + up, k * 0.94); C.l.set(mx - d * 0.6, 2.1, 0); C.f = 40; }
        else if (name === 'tgt') { C.p.set(d * 2.4, 4.8 + up, k * 0.94); C.l.set(mx + d * 0.9, 2.1, 0); C.f = 40; }
        else if (name === 'side') { C.p.set(0, 4.6 + up, k * 1.02); C.l.set(0, 2.0, 0); C.f = 44; }
        else if (name === 'low') { C.p.set(-d * 1.6, 3.4 + up, k * 0.86); C.l.set(mx + d * 0.8, 2.8, 0); C.f = 43; }
    }

    /* ----- ataques ----- */
    function zBt3Attack(side, kind, dmg, adv, crit, done) {
        const T = clTh(), A = side === 'p' ? ZBT.p : ZBT.e, D = side === 'p' ? ZBT.e : ZBT.p, d = Math.sign(D.base.x - A.base.x), st = zBt3Style(side), S = ZBT_ST[st], hpKey = side === 'p' ? 'eHp' : 'pHp', dKey = side === 'p' ? 'enemyHp' : 'playerHp';
        try {
            const spId = A && A.sp && A.sp.id;
            if (spId && window.playLegendarySfx) { if (!window.playLegendarySfx(spId, kind === 2) && window.playElementalSfx) window.playElementalSfx(sp && sp.el, kind === 2); }
            else if (spId && !document.getElementById('leg-sfx-runtime')) { const s = document.createElement('script'); s.id = 'leg-sfx-runtime'; s.src = './assets/colony/legendary_sfx.js?v=5'; s.onload = () => { try { if (!(window.playLegendarySfx && window.playLegendarySfx(spId, kind === 2)) && window.playElementalSfx) window.playElementalSfx(sp && sp.el, kind === 2); } catch (e) {} }; document.head.appendChild(s); }
        } catch (e) {}
        ZBT.busy = true; zBt3Hud();
        const impact = (power, big, label) => {   /* o que acontece quando o golpe acerta */
            const hp = D.holder.position.clone(); hp.x -= d * D.span * 0.12; zBt3Burst(hp, st, Math.round(26 * power), 7 * power, big); if (st === 'terra' || st === 'cristal') zBt3Debris(hp, st, Math.round(12 * power), 6 * power); zBt3Light(hp, S.c, 3.2 * power, 0.35);
            D.fl = 1; zBt3Shake(0.35 + 0.35 * power); ZBT.shown[hpKey] = ZBT.duel[dKey]; zBt3Hud();
            try { zBt3Act(D, 'hit', 1.2, 0.45); } catch (e) {}
            zBt3Dmg(D, String(dmg), (crit ? 'crit ' : adv ? 'adv ' : '') + (side === 'e' ? 'foe' : ''));
            if (adv) { zBt3Banner('SUPER EFETIVO!', 'adv'); zBt3P({ tex: 'circle_05', col: '#ffffff', pos: hp, s0: 1, s1: 14 * big, life: 0.5, op: 0.9 }); }
            if (label && !adv) zBt3Banner(label, '');
            const k = 0.5 + power * 0.7; zBt3Tw(0.16, u => { D.off.x = d * k * Math.sin(u * Math.PI) * 1.4; D.off.y = Math.sin(u * Math.PI) * 0.35 * power; D.tilt = -d * 0.28 * Math.sin(u * Math.PI) * power; }, () => { D.off.set(0, 0, 0); D.tilt = 0; });
            try { aliveSound('tick'); clFarmBuzz(crit ? [30, 60, 30] : 25); } catch (er) {}
        };
        const back = (t) => zBt3At(t, () => { ZBT.busy = false; zBt3Shot('wide'); done && done(); });
        const MV = zBt3Move(side, kind), PT = MV.p, mouthP = () => A.holder.position.clone().add(new T.Vector3(d * A.span * 0.46, A.span * 0.1, 0));
        if (PT === 'dash') {   /* investida: voa até o inimigo e acerta */
            zBt3Shot('att', A, D); zBt3Act(A, 'atk', 1.4, 0.9); const gap = Math.abs(D.base.x - A.base.x) - A.span * 0.45 - D.span * 0.3;
            zBt3At(0.25, () => { zBt3Tw(0.42, u => { const e = zBtOut(u); A.off.x = d * gap * e; A.off.y = -0.4 * Math.sin(u * 3.14); A.tilt = -d * 0.35 * Math.sin(u * 3.14); for (let i = 0; i < 2; i++) zBt3P({ tex: 'spark_03', col: S.c2, pos: A.holder.position.clone().add(new T.Vector3((Math.random() - 0.5) * A.span * 0.4, (Math.random() - 0.5) * 0.8, (Math.random() - 0.5) * 1)), vel: new T.Vector3(-d * 5, 0, 0), s0: 0.9, s1: 0.1, life: 0.35, op: 0.9 }); }, () => {
                zBt3Shot('tgt', A, D); const ip = D.holder.position.clone(); impact(0.8, 0.9, MV.n); zBt3P({ tex: 'twirl_01', col: '#ffffff', pos: ip, s0: 1.5, s1: 8, life: 0.3, op: 0.95, rot: 0.6 }); zBt3P({ tex: 'spark_04', col: S.c2, pos: ip, s0: 2, s1: 11, life: 0.28, op: 1, rot: -0.5 });
                zBt3Tw(0.55, u => { A.off.x = d * gap * (1 - zBtEase(u)); A.off.y = 0; A.tilt = 0; }, null); }); });
            back(1.55);
        } else if (PT === 'orb') {   /* concentra energia e dispara */
            zBt3Shot('att', A, D); zBt3Act(A, 'atk', 0.9, 1.4); zBt3Tw(0.6, u => { A.off.x = -d * 0.9 * zBtEase(u); A.off.y = 0.4 * u; A.tilt = d * 0.12 * u; }, null);
            const mouth = () => A.holder.position.clone().add(new T.Vector3(d * A.span * 0.46, A.span * 0.1, 0));
            zBt3Banner(MV.n, 'cast'); let ch = 0; zBt3Tw(0.75, u => { ch += 1; const m = mouth(); if (ch % 2 === 0) { const a = Math.random() * 6.283, r = 2.2 * (1 - u) + 0.3; zBt3P({ tex: S.tex, col: ch % 4 ? S.c : S.c2, pos: m.clone().add(new T.Vector3(Math.cos(a) * r, Math.sin(a) * r, (Math.random() - 0.5) * r)), vel: new T.Vector3(0, 0, 0), s0: 0.45, s1: 0.1, life: 0.35, op: 0.9 }); }
                if (ch === 1) ZBT.chg = zBt3P({ tex: 'flare_01', col: S.c2, pos: m, s0: 0.4, s1: 0.4, life: 1.2, op: 0.95 }); if (ZBT.chg) { ZBT.chg.sp.position.copy(m); ZBT.chg.sp.scale.setScalar(0.5 + 2.8 * u); ZBT.chg.a = Math.min(ZBT.chg.a, 0.1); } zBt3Light(m, S.c, 2 + 6 * u, 0.15); }, null);
            zBt3At(0.75, () => { zBt3Shake(0.3); zBt3Shot('side', A, D); const m = mouth(); zBt3Burst(m, st, 10, 4, 0.6); A.off.x = d * 0.5; zBt3Tw(0.3, u => { A.off.x = d * 0.5 * (1 - u); A.off.y = 0.4 * (1 - u); A.tilt = d * 0.12 * (1 - u); }, null);
                const to = D.holder.position.clone(); to.x -= d * D.span * 0.1; zBt3Proj(m, to, st, 1.1, 0.6, () => { zBt3Shot('tgt', A, D); impact(1.15, 1.25, null); }); });
            back(2.5);
        } else if (PT === 'beam') {   /* supremo: rugido, câmera de cinema, raio gigante e chuva de energia */
            zBt3Dim(true); zBt3Shot('low', A, D); zBt3Banner(MV.n, 'sup'); zBt3Act(A, 'atk', 0.7, 2.2); ZBT.ts = 0.55;
            zBt3Tw(1.0, u => { A.off.y = 1.1 * zBtOut(u); A.off.x = -d * 0.6 * u; A.tilt = d * 0.2 * u; if (Math.random() < 0.7) { const a = Math.random() * 6.283; zBt3P({ tex: 'circle_05', col: S.c, pos: A.holder.position.clone().add(new T.Vector3(Math.cos(a) * 3, -A.span * 0.3, Math.sin(a) * 3)), vel: new T.Vector3(-Math.cos(a) * 3, 3, -Math.sin(a) * 3), s0: 0.6, s1: 0.1, life: 0.6, op: 0.8 }); } zBt3Shake(0.18 + u * 0.3); }, null);
            zBt3P({ tex: 'circle_05', col: S.c2, pos: A.holder.position.clone(), s0: 1, s1: 22, life: 0.9, op: 0.8 });
            zBt3At(1.1, () => { ZBT.ts = 1; zBt3Dim(false); zBt3Shot('side', A, D); zBt3Flash(S.c2, 0.55); zBt3Shake(0.6);
                const m = A.holder.position.clone().add(new T.Vector3(d * A.span * 0.46, A.span * 0.1, 0)), to = D.holder.position.clone(), len = m.distanceTo(to), dir = to.clone().sub(m).normalize();
                const mk = (r, col, op) => { const c = new T.Mesh(new T.CylinderGeometry(r, r * 1.3, len, 16, 1, true), new T.MeshBasicMaterial({ color: col, transparent: true, opacity: op, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide })); c.position.copy(m).addScaledVector(dir, len / 2); c.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), dir); ZBT.sc.add(c); return c; };
                const b1 = mk(0.34, S.c, 0.35), b2 = mk(0.1, S.c2, 0.75); const chain = []; for (let i = 0; i < 16; i++) { const sp = new T.Sprite(new T.SpriteMaterial({ map: zFxTex('flare_01'), color: i % 2 ? S.c : S.c2, transparent: true, depthWrite: false, blending: T.AdditiveBlending, opacity: 0.8 })); sp.position.copy(m).addScaledVector(dir, len * (i + 0.5) / 16); ZBT.sc.add(sp); chain.push(sp); } let k = 0;
                zBt3Tw(1.05, u => { if (ZBT.dbg === 'beam' && u > 0.45) ZBT.mul = 0; const env = Math.sin(Math.min(1, u * 1.15) * Math.PI) ** 0.6, w = 0.6 + 0.5 * Math.sin(u * 50); b1.scale.set(env * (0.8 + w * 0.2), 1, env * (0.8 + w * 0.2)); b2.scale.set(env * (0.7 + w * 0.3), 1, env * (0.7 + w * 0.3)); b1.material.opacity = 0.35 * env; b2.material.opacity = 0.75 * env; chain.forEach((c, i) => { c.scale.setScalar((2.2 + 1.2 * Math.sin(u * 30 + i)) * env); c.material.opacity = 0.8 * env; });
                    if (++k % 2 === 0) { const p = m.clone().addScaledVector(dir, Math.random() * len); zBt3P({ tex: S.tex, col: k % 4 ? S.c : S.c2, pos: p, vel: new T.Vector3((Math.random() - 0.5) * 4, 1 + Math.random() * 3, (Math.random() - 0.5) * 4), s0: 0.7, s1: 0.1, life: 0.5, op: 0.95, grav: 2 }); }
                    if (k % 5 === 0) { const gp = D.holder.position.clone(); gp.y = 0.2; gp.x += (Math.random() - 0.5) * 5; gp.z += (Math.random() - 0.5) * 4; zBt3Burst(gp, st, 7, 5, 0.9); zBt3Debris(gp, st, 3, 6); }
                    zBt3Light(to, S.c, 2.5 + 2.5 * env, 0.2); zBt3Shake(0.5 + 0.3 * env); D.fl = Math.max(D.fl, 0.35 * env); D.off.x = d * 0.3 * Math.sin(u * 40) * env; }, () => { chain.forEach(c => { ZBT.sc.remove(c); c.material.dispose(); }); ZBT.sc.remove(b1); ZBT.sc.remove(b2); b1.geometry.dispose(); b2.geometry.dispose(); D.off.x = 0;
                    zBt3Shot('tgt', A, D); zBt3Flash('#ffffff', 0.95); try { clDoHitStop(80); } catch (er) {} ZBT.freeze = 0.09; impact(2.1, 2.2, null); zBt3P({ tex: 'circle_05', col: '#ffffff', pos: to, s0: 1, s1: 26, life: 0.7, op: 0.9 }); zBt3Burst(to, st, 40, 11, 1.8);
                    zBt3Tw(0.5, u => { A.off.y = 1.1 * (1 - u); A.off.x = -d * 0.6 * (1 - u); A.tilt = d * 0.2 * (1 - u); }, null); }); });
            back(3.9);
        } else {   /* jeitos extras de atacar */
            const chargeFx = (dur, big) => { let ch = 0; zBt3Tw(dur, u => { ch++; const m = mouthP(); if (ch % 2 === 0) { const a = Math.random() * 6.283, r2 = 2.2 * (1 - u) + 0.3; zBt3P({ tex: S.tex, col: ch % 4 ? S.c : S.c2, pos: m.clone().add(new T.Vector3(Math.cos(a) * r2, Math.sin(a) * r2, (Math.random() - 0.5) * r2)), s0: 0.45, s1: 0.1, life: 0.35, op: 0.9 }); } zBt3Light(m, S.c, 2 + 4 * u * (big || 1), 0.15); }, null); };
            const roarFx = (dur) => { zBt3Dim(true); zBt3Shot('low', A, D); zBt3Banner(MV.n, 'sup'); zBt3Act(A, 'atk', 0.7, dur + 1.2); ZBT.ts = 0.6; zBt3Tw(dur, u => { A.off.y = 1.1 * zBtOut(u); A.off.x = -d * 0.6 * u; A.tilt = d * 0.2 * u; if (Math.random() < 0.7) { const a = Math.random() * 6.283; zBt3P({ tex: 'circle_05', col: S.c, pos: A.holder.position.clone().add(new T.Vector3(Math.cos(a) * 3, -A.span * 0.3, Math.sin(a) * 3)), vel: new T.Vector3(-Math.cos(a) * 3, 3, -Math.sin(a) * 3), s0: 0.6, s1: 0.1, life: 0.6, op: 0.8 }); } zBt3Shake(0.18 + u * 0.3); }, null); zBt3P({ tex: 'circle_05', col: S.c2, pos: A.holder.position.clone(), s0: 1, s1: 22, life: 0.9, op: 0.8 }); };
            const roarEnd = () => { ZBT.ts = 1; zBt3Dim(false); zBt3Tw(0.5, u => { A.off.y = 1.1 * (1 - u); A.off.x = -d * 0.6 * (1 - u); A.tilt = d * 0.2 * (1 - u); }, null); };
            const tgtPos = (jx, jz) => { const v = D.holder.position.clone(); v.x -= d * D.span * 0.1 + (jx || 0); v.z += (jz || 0); return v; };
            const sky = (jx, jz, h) => { const v = tgtPos(jx, jz); v.y += h || 15; return v; };
            const gap = Math.abs(D.base.x - A.base.x) - A.span * 0.45 - D.span * 0.3;
            if (PT === 'tail') {   /* gira o corpo e acerta com a cauda */
                zBt3Shot('att', A, D); zBt3Act(A, 'atk', 1.6, 1.1); zBt3Banner(MV.n, 'cast');
                zBt3At(0.2, () => { zBt3Tw(0.55, u => { A.off.x = d * gap * 0.9 * zBtOut(u); A.spin = Math.PI * 4 * zBtEase(u) * d; A.tilt = 0.25 * Math.sin(u * 3.14); if (Math.random() < 0.8) zBt3P({ tex: 'twirl_01', col: S.c2, pos: A.holder.position.clone().add(new T.Vector3((Math.random() - 0.5) * A.span, (Math.random() - 0.5), (Math.random() - 0.5) * A.span * 0.8)), s0: 1.2, s1: 3, life: 0.3, op: 0.8, rot: Math.random() * 6 }); }, () => { A.spin = 0; zBt3Shot('tgt', A, D); impact(1.0, 1.1, null); zBt3P({ tex: 'circle_05', col: S.c, pos: D.holder.position.clone(), s0: 1, s1: 16, life: 0.5, op: 0.9 }); zBt3Tw(0.6, u => { A.off.x = d * gap * 0.9 * (1 - zBtEase(u)); A.tilt = 0; }, null); }); });
                back(1.7);
            } else if (PT === 'dive') {   /* sobe e mergulha em diagonal */
                zBt3Shot('side', A, D); zBt3Act(A, 'atk', 1.3, 1.2); zBt3Banner(MV.n, 'cast');
                zBt3Tw(0.45, u => { const e = zBtOut(u); A.off.y = 5 * e; A.off.x = -d * 1.2 * e; A.tilt = d * 0.3 * e; }, () => { zBt3Shot('tgt', A, D); zBt3Tw(0.3, u => { const e = u * u; A.off.x = -d * 1.2 + (d * gap + d * 1.2) * e; A.off.y = 5 * (1 - e) - 0.2 * e; A.tilt = -d * 0.7 * Math.sin(u * 1.6); zBt3P({ tex: 'spark_03', col: S.c2, pos: A.holder.position.clone(), vel: new T.Vector3(-d * 6, 3, 0), s0: 1, s1: 0.1, life: 0.35, op: 0.9 }); }, () => { impact(1.1, 1.2, null); zBt3P({ tex: 'circle_05', col: S.c, pos: D.holder.position.clone(), s0: 1, s1: 18, life: 0.5, op: 0.9 }); zBt3Tw(0.6, u => { const e = zBtEase(u); A.off.x = d * gap * (1 - e); A.off.y = -0.2 * (1 - e); A.tilt = 0; }, null); }); });
                back(1.9);
            } else if (PT === 'triple') {   /* três projéteis em leque */
                zBt3Shot('att', A, D); zBt3Act(A, 'atk', 1.1, 1.4); zBt3Banner(MV.n, 'cast'); chargeFx(0.55, 0.8);
                for (let i = 0; i < 3; i++) zBt3At(0.6 + i * 0.2, () => { const m = mouthP(); m.y += (i - 1) * 0.7; m.z += (i - 1) * 1.1; zBt3Burst(m, st, 6, 3, 0.4); zBt3Shake(0.15); const to = tgtPos((i - 1) * 0.4, (i - 1) * 1.6); zBt3Proj(m, to, st, 0.7, 0.5, () => { if (i === 2) { zBt3Shot('tgt', A, D); impact(1.0, 1.1, null); } else { zBt3Burst(to, st, 12, 4, 0.7); D.fl = Math.max(D.fl, 0.5); zBt3Shake(0.25); } }); });
                back(2.4);
            } else if (PT === 'wave') {   /* onda de energia que corre pelo chão */
                zBt3Shot('side', A, D); zBt3Act(A, 'atk', 1.0, 1.4); zBt3Banner(MV.n, 'cast'); chargeFx(0.45, 0.8);
                zBt3At(0.5, () => { zBt3Tw(0.15, u => { A.off.x = -d * 0.7 * Math.sin(u * 3.14); }, null); const x0 = A.holder.position.x + d * A.span * 0.4, x1 = D.holder.position.x - d * D.span * 0.2; let n = 0;
                    zBt3Tw(0.75, u => { const x = x0 + (x1 - x0) * u; n++; const p0 = new T.Vector3(x, 0.15, 0); for (let i = 0; i < 3; i++) zBt3P({ tex: i ? S.tex : 'circle_05', col: i % 2 ? S.c : S.c2, pos: p0.clone().add(new T.Vector3(0, i * 0.3, (Math.random() - 0.5) * 3.5)), vel: new T.Vector3(0, 2 + Math.random() * 2, 0), s0: 1.4, s1: 0.3, life: 0.5, op: 0.85 }); if (n % 3 === 0) { zBt3Debris(p0, st, 2, 4); zBt3Shake(0.2); } zBt3Light(p0, S.c, 3, 0.15); }, () => { zBt3Shot('tgt', A, D); impact(1.2, 1.3, null); }); });
                back(2.3);
            } else if (PT === 'breath') {   /* sopro contínuo em cone */
                zBt3Shot('att', A, D); zBt3Act(A, 'atk', 0.9, 1.8); zBt3Banner(MV.n, 'cast'); zBt3Tw(0.4, u => { A.off.x = -d * 0.5 * u; A.tilt = d * 0.15 * u; }, null);
                zBt3At(0.45, () => { zBt3Shot('side', A, D); const dur = 1.0; zBt3Tw(dur, u => { const m = mouthP(), to = tgtPos(), dir = to.clone().sub(m); const len = dir.length(); dir.normalize(); for (let i = 0; i < 5; i++) { const sp = 6 + Math.random() * 10; zBt3P({ tex: i % 2 ? S.tex : (st === 'fogo' ? 'flame_0' + (1 + (i % 5)) : S.smk), col: i % 2 ? S.c : S.c2, pos: m.clone(), vel: dir.clone().multiplyScalar(sp).add(new T.Vector3((Math.random() - 0.5) * 2.5, (Math.random() - 0.5) * 2.5, (Math.random() - 0.5) * 2.5)), s0: 0.5, s1: 2.6, life: len / sp * 1.1 + 0.2, op: 0.85, spin: 2 }); } zBt3Light(m.clone().lerp(to, 0.5), S.c, 4, 0.15); zBt3Shake(0.25); if (u > 0.4) { D.fl = Math.max(D.fl, 0.3); if (Math.random() < 0.4) zBt3Burst(to.clone().add(new T.Vector3((Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3, 0)), st, 4, 4, 0.7); } }, () => { zBt3Shot('tgt', A, D); impact(1.4, 1.5, null); zBt3Tw(0.4, u => { A.off.x = -d * 0.5 * (1 - u); A.tilt = d * 0.15 * (1 - u); }, null); }); });
                back(2.7);
            } else if (PT === 'meteors') {   /* chuva de meteoros sobre o alvo */
                zBt3Shot('att', A, D); zBt3Act(A, 'atk', 0.9, 1.4); zBt3Banner(MV.n, 'cast'); chargeFx(0.5, 0.8);
                zBt3At(0.55, () => { zBt3Shot('tgt', A, D); zBt3Shake(0.3); });
                for (let i = 0; i < 4; i++) zBt3At(0.65 + i * 0.24, () => { const jx = (Math.random() - 0.5) * 6, jz = (Math.random() - 0.5) * 3, to = tgtPos(jx, jz); to.y = Math.max(0.3, to.y - 1 + i * 0.3); zBt3Proj(sky(jx - 4, jz, 14), to, st, 1.0, 0.45, () => { if (i === 3) impact(1.3, 1.4, null); else { zBt3Burst(to, st, 14, 5, 0.9); zBt3Debris(to, st, 4, 5); zBt3Shake(0.3); D.fl = Math.max(D.fl, 0.5); } }); });
                back(2.6);
            } else if (PT === 'rain') {   /* supremo: o céu escurece e chove energia */
                roarFx(0.9);
                zBt3At(1.0, () => { ZBT.ts = 1; zBt3Dim(false); zBt3Shot('tgt', A, D); zBt3Flash(S.c2, 0.4); });
                for (let i = 0; i < 12; i++) zBt3At(1.1 + i * 0.1, () => { const jx = (Math.random() - 0.5) * 7, jz = (Math.random() - 0.5) * 5, to = tgtPos(jx, jz); to.y = 0.4 + Math.random() * 1.5; zBt3Proj(sky(jx - 2, jz, 16), to, st, 0.8, 0.4, () => { zBt3Burst(to, st, 10, 4, 0.8); zBt3Shake(0.3); D.fl = Math.max(D.fl, 0.5); if (i === 11) { zBt3Flash('#ffffff', 0.9); ZBT.freeze = 0.09; impact(2.0, 2.1, null); roarEnd(); } }); });
                back(3.8);
            } else if (PT === 'nova') {   /* supremo: explosão que se espalha pela arena */
                roarFx(1.0); let big;
                zBt3At(0.7, () => { big = zBt3P({ tex: 'flare_01', col: S.c2, pos: mouthP(), s0: 1, s1: 1, life: 1.6, op: 1 }); zBt3Tw(0.5, u => { if (big) { big.sp.position.copy(A.holder.position); big.sp.scale.setScalar(2 + 10 * u); big.a = Math.min(big.a, 0.3); } zBt3Shake(0.3 + u * 0.4); }, null); });
                zBt3At(1.25, () => { ZBT.ts = 1; zBt3Dim(false); zBt3Shot('side', A, D); zBt3Flash(S.c2, 0.8); const ax = A.holder.position.x, dist = Math.abs(D.holder.position.x - ax);
                    zBt3Tw(0.8, u => { const r2 = 2 + dist * 1.15 * u; zBt3P({ tex: 'circle_05', col: S.c, pos: new T.Vector3(ax, 1.5, 0), s0: r2 * 1.3, s1: r2 * 1.3, life: 0.2, op: 0.7 }); for (let i = 0; i < 4; i++) { const a = Math.random() * 6.283; zBt3P({ tex: S.tex, col: i % 2 ? S.c : S.c2, pos: new T.Vector3(ax + Math.cos(a) * r2 * 0.5, 0.4 + Math.random() * 2, Math.sin(a) * r2 * 0.5), vel: new T.Vector3(Math.cos(a) * 3, 1, Math.sin(a) * 3), s0: 0.8, s1: 0.1, life: 0.5, op: 0.9 }); } zBt3Shake(0.6); zBt3Light(new T.Vector3(ax + d * r2 * 0.5, 2, 0), S.c, 5, 0.15); }, () => { zBt3Shot('tgt', A, D); zBt3Flash('#ffffff', 0.95); ZBT.freeze = 0.09; impact(2.1, 2.2, null); zBt3Burst(D.holder.position.clone(), st, 40, 11, 1.8); roarEnd(); }); });
                back(3.5);
            } else if (PT === 'pillars') {   /* supremo: colunas de energia brotam do chão em sequência */
                roarFx(0.9);
                zBt3At(1.0, () => { ZBT.ts = 1; zBt3Dim(false); zBt3Shot('side', A, D); zBt3Flash(S.c2, 0.4); });
                const x0 = A.holder.position.x + d * 3, x1 = D.holder.position.x; for (let i = 0; i < 7; i++) zBt3At(1.1 + i * 0.15, () => { const x = x0 + (x1 - x0) * (i / 6), pos = new T.Vector3(x, 0, (Math.random() - 0.5) * 2), last = i === 6; const h = last ? 11 : 6, col = new T.Mesh(new T.CylinderGeometry(last ? 1.5 : 0.8, last ? 2 : 1.1, h, 14, 1, true), new T.MeshBasicMaterial({ color: S.c, transparent: true, opacity: 0.7, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide })); col.position.set(x, h / 2 - 0.2, pos.z); ZBT.sc.add(col);
                    zBt3Tw(0.5, u => { col.scale.set(1 + u * 0.4, Math.min(1, u * 4), 1 + u * 0.4); col.material.opacity = 0.7 * (1 - u); }, () => { ZBT.sc.remove(col); col.geometry.dispose(); col.material.dispose(); }); zBt3Burst(pos.clone().add(new T.Vector3(0, 0.5, 0)), st, last ? 30 : 12, last ? 9 : 5, last ? 1.6 : 0.9); zBt3Debris(pos, st, last ? 10 : 4, 6); zBt3Shake(last ? 0.9 : 0.35); zBt3Light(pos.clone().add(new T.Vector3(0, 2, 0)), S.c, 5, 0.2); if (last) { zBt3Shot('tgt', A, D); zBt3Flash('#ffffff', 0.9); ZBT.freeze = 0.09; impact(2.0, 2.1, null); roarEnd(); } else D.fl = Math.max(D.fl, 0.25); });
                back(3.6);
            } else {   /* lightning: supremo, tempestade de raios */
                roarFx(0.9);
                zBt3At(1.0, () => { ZBT.ts = 1; zBt3Dim(false); zBt3Shot('side', A, D); });
                for (let i = 0; i < 7; i++) zBt3At(1.1 + i * 0.13, () => { const last = i === 6, to = tgtPos(last ? 0 : (Math.random() - 0.5) * 6, last ? 0 : (Math.random() - 0.5) * 3); to.y = 0.2; const top = to.clone(); top.y = 22; top.x += (Math.random() - 0.5) * 5; const pts = []; const N = 14; for (let k = 0; k <= N; k++) { const v = top.clone().lerp(to, k / N); if (k && k < N) { v.x += (Math.random() - 0.5) * 2.2; v.z += (Math.random() - 0.5) * 1.5; } pts.push(v); }
                    const g = new T.BufferGeometry().setFromPoints(pts), lines = [0, 1, 2].map(o => { const ln = new T.Line(g, new T.LineBasicMaterial({ color: o ? S.c : '#ffffff', transparent: true, opacity: 1, blending: T.AdditiveBlending, depthWrite: false })); ln.position.x = (o - 1) * 0.06; ln.position.z = (o - 1) * 0.06; ZBT.sc.add(ln); return ln; });
                    const glows = pts.filter((_, k) => k % 2 === 0).map(v => zBt3P({ tex: 'flare_01', col: S.c2, pos: v, s0: last ? 3.4 : 2.2, s1: 0.5, life: 0.28, op: 0.9 }));
                    zBt3Tw(0.28, u => { lines.forEach(l => { l.material.opacity = 1 - u; }); }, () => { lines.forEach(l => { ZBT.sc.remove(l); l.material.dispose(); }); g.dispose(); });
                    zBt3Flash(S.c2, last ? 0.9 : 0.3); zBt3Burst(to.clone().add(new T.Vector3(0, 0.5, 0)), st, last ? 30 : 10, last ? 9 : 5, last ? 1.6 : 0.8); zBt3Shake(last ? 0.9 : 0.4); zBt3Light(to.clone().add(new T.Vector3(0, 3, 0)), S.c2, 6, 0.2); try { aliveSound('tick'); } catch (er) {}
                    if (last) { zBt3Shot('tgt', A, D); ZBT.freeze = 0.09; impact(2.0, 2.1, null); roarEnd(); } else D.fl = Math.max(D.fl, 0.4); });
                back(3.4);
            }
        }

    }

    function zBt3Hud() {
        const b = ZBT.box; if (!b || !ZBT.duel) return; const du = ZBT.duel, sh = ZBT.shown;
        const set = (sel, v) => { const el = b.querySelector(sel); if (el) el.style.width = Math.max(0, Math.min(100, v)) + '%'; };
        set('.p .f', sh.pHp / du.playerMaxHp * 100); set('.e .f', sh.eHp / du.enemyMaxHp * 100); setTimeout(() => { set('.p .g', sh.pHp / du.playerMaxHp * 100); set('.e .g', sh.eHp / du.enemyMaxHp * 100); }, 350);
        set('.bt-rg b i', du.playerRage); const t = (s, v) => { const el = b.querySelector(s); if (el) el.textContent = v; }; t('.p .bt-hp span', Math.ceil(sh.pHp) + ' / ' + du.playerMaxHp); t('.e .bt-hp span', Math.ceil(sh.eHp) + ' / ' + du.enemyMaxHp);
        const ok = du.turn === 'player' && !ZBT.busy && du.active, q = b.querySelector('[data-act=quick]'), el = b.querySelector('[data-act=element]'), su = b.querySelector('[data-act=supreme]');
        const lk = (b, need) => { if (!b) return; const f = b.querySelector('.bt-lock i'); if (f) f.style.width = Math.min(100, du.playerRage / need * 100) + '%'; b.classList.toggle('ready', du.playerRage >= need); }; lk(el, 25); lk(su, 100); if (q) q.disabled = !ok; if (el) el.disabled = !ok || du.playerRage < 25; if (su) { su.disabled = !ok || du.playerRage < 100; su.classList.toggle('full', du.playerRage >= 100); }
        const lg = b.querySelector('.bt-log'); if (lg) lg.textContent = du.log || '';
    }

    function zBt3Open() {
        if (ZBT.on) return; const T = clTh(); if (!T || !CL.root) return; const duel = zDuelGetState(); if (!duel.active) return;
        const tw = ZTOWERS[duel.tower], pSp = duel.pStats.sp, eSp = zBt3BossSp(tw);
        try { const ea = CL.root.querySelector('.cl-colony-arena'); if (ea) ea.remove(); } catch (e) {}
        try { if (!ZOO.lite) Object.keys(ZDB).forEach(k => clModelEnsure(ZDB[k].f)); } catch (e) {}
        const box = document.createElement('div'); box.className = 'cl-bt3'; box.style.setProperty('--c', tw.col);
        const MP = zBt3Moves(pSp.id), ELP = ZEL[pSp.el] || ZEL.terra, ELE = ZEL[eSp.el] || ZEL.terra, P_ = ['Corpo a corpo', 'Golpe de energia', 'Supremo'], IC_ = [(ZBT_PT_IC[MP[0][1]] || 'ph-sword'), (ZBT_PT_IC[MP[1][1]] || 'ph-lightning'), (ZBT_PT_IC[MP[2][1]] || 'ph-fire')];
        const plate = (cls, sp, el, name, sub, lv, extra) => '<div class="bt-card ' + cls + '" style="--el:' + el.col + '"><div class="bt-pt"><span class="bt-ring"></span>' + zImg(sp.id, 'bt-img') + '<em class="bt-el"><i class="ph-bold ' + el.ic + '"></i></em></div><div class="bt-info"><div class="bt-nm"><b>' + name + '</b><u>' + lv + '</u></div><small>' + sub + '</small><div class="bt-hp"><i class="g"></i><i class="f"></i><span></span></div>' + (extra || '') + '</div></div>';
        box.innerHTML = '<canvas></canvas><div class="bt-dim"></div><div class="bt-flash"></div>'
            + '<div class="bt-top">' + plate('p', pSp, ELP, pSp.n, ELP.n + ' · ' + duel.pStats.cp + ' CP', 'Nv ' + duel.pStats.lv, '<div class="bt-rg"><i class="ph-fill ph-fire"></i><b><i></i></b><span>FÚRIA</span></div>') + '<div class="bt-vs"><span>VS</span></div>' + plate('e', eSp, ELE, tw.boss, tw.n, 'Prova ' + (duel.tower + 1), '') + '</div>'
            + '<div class="bt-test-strip">'
            + '  <span class="bt-test-lab">🧪 Testar:</span>'
            + '  <button type="button" class="bt-test-p" data-pat="breath">🔥 Sopro</button>'
            + '  <button type="button" class="bt-test-p" data-pat="beam">☀️ Laser</button>'
            + '  <button type="button" class="bt-test-p" data-pat="meteors">☄️ Meteoros</button>'
            + '  <button type="button" class="bt-test-p" data-pat="lightning">⚡ Raios</button>'
            + '  <button type="button" class="bt-test-p" data-pat="wave">🌊 Onda</button>'
            + '  <button type="button" class="bt-test-p" data-pat="pillars">💎 Pilares</button>'
            + '  <button type="button" class="bt-test-p" data-pat="nova">🌌 Nova</button>'
            + '</div>'
            + '<div class="bt-bn"></div><div class="bt-log"></div>'
            + '<div class="bt-acts">' + [0, 1, 2].map(k => '<button type="button" class="bt-mv k' + k + '" data-cl="zoo-duel-act" data-act="' + ['quick', 'element', 'supreme'][k] + '" style="--el:' + ELP.col + '"><span class="bt-ic"><i class="ph-bold ' + IC_[k] + '"></i></span><b>' + MP[k][0] + '</b><small>' + P_[k] + '</small><em class="bt-cost">' + ['+35 fúria', '−25 fúria', '−100 fúria'][k] + '</em><s class="bt-lock"><i style="width:0"></i></s></button>').join('') + '</div>'
            + '<button type="button" class="bt-x" data-cl="zoo-bt3-x" aria-label="Fugir"><i class="ph-bold ph-x"></i></button>';
        box.addEventListener('click', ev => {
            const btn = ev.target && ev.target.closest && ev.target.closest('.bt-test-p');
            if (btn && ZBT.on && !ZBT.busy) {
                const pat = btn.dataset.pat;
                ZBT.forcePat = pat;
                duel.playerRage = 100;
                zBt3Attack('p', 'element', 85, true, false, () => {
                    ZBT.forcePat = null;
                    zBt3Hud();
                });
            }
        });
        CL.root.appendChild(box); const cv = box.querySelector('canvas'); let r;
        try { r = new T.WebGLRenderer({ canvas: cv, antialias: !IPAD, powerPreference: IPAD ? 'default' : 'high-performance' }); } catch (e) { box.remove(); try { clMsg('Seu aparelho não abriu a arena 3D.'); } catch (e2) {} duel.active = false; clOpenColonyArena(); return; }
        r.setPixelRatio(IPAD ? 1 : Math.min(window.devicePixelRatio || 1, CL_TOUCH() ? 1.25 : 1.75)); if (!IPAD && !ZOO.lite) { r.shadowMap.enabled = true; r.shadowMap.type = T.PCFSoftShadowMap; } if (T.sRGBEncoding) r.outputEncoding = T.sRGBEncoding; 
        const sc = new T.Scene(); sc.background = zBt3SkyTex(tw.col); sc.fog = new T.Fog(new T.Color(tw.col).multiplyScalar(0.35).lerp(new T.Color('#ffd9a8'), 0.35), 34, 110);
        const cam = new T.PerspectiveCamera(42, 1, 0.5, 300);
        Object.assign(ZBT, { on: true, box, cv, r, sc, cam, duel, t: 0, ts: 1, freeze: 0, trauma: 0, pp: [], db: [], tw: [], q: [], busy: true, white: new T.Color('#ffffff'), shown: { pHp: duel.playerHp, eHp: duel.enemyHp }, cs: { p: new T.Vector3(0, 4.6, 16), l: new T.Vector3(0, 2, 0), f: 42 }, dist: 16, prevModal: ZOO.modal, lt: null, over: false });
        ZOO.modal = 'bt3';
        sc.add(new T.HemisphereLight(0xb8c8ee, 0x3a2e24, 0.55)); const key = new T.DirectionalLight(0xfff0d8, 1.25); key.position.set(7, 14, 9); if (!ZOO.lite) { key.castShadow = true; const sz = CL_TOUCH() ? 1024 : 2048; key.shadow.mapSize.set(sz, sz); const sh = key.shadow.camera; sh.left = -15; sh.right = 15; sh.top = 15; sh.bottom = -15; sh.near = 2; sh.far = 60; key.shadow.bias = -0.0006; key.shadow.radius = 4; } sc.add(key); const rim = new T.DirectionalLight(new T.Color(tw.col), 1.0); rim.position.set(-9, 6, -8); sc.add(rim);
        ZBT.pl = new T.PointLight(0xffffff, 0, 26, 2); sc.add(ZBT.pl);
        const stage = new T.Group(); sc.add(stage); ZBT.stage = stage; const gt = zBt3GroundTex(tw.col, false), ge = zBt3GroundTex(tw.col, true);
        const plat = new T.Mesh(new T.CylinderGeometry(11.5, 12.4, 1.4, 56), [new T.MeshStandardMaterial({ color: '#26222c', roughness: 0.95, flatShading: true }), new T.MeshStandardMaterial({ map: gt, emissive: new T.Color('#ffffff'), emissiveMap: ge, emissiveIntensity: 1.1, roughness: 0.9 }), new T.MeshStandardMaterial({ color: '#2a262e', roughness: 1 })]); plat.position.y = -0.7; stage.add(plat);
        const rockM = new T.MeshStandardMaterial({ color: '#4f4a58', roughness: 0.95, flatShading: true });
        for (let i = 0; i < 9; i++) { const a = Math.PI + i / 8 * Math.PI, rr = 11.2, h = 3 + (i % 3) * 1.6, p = new T.Mesh(new T.CylinderGeometry(0.7, 1, h, 7), rockM); p.position.set(Math.cos(a) * rr, h / 2 - 0.2, Math.sin(a) * rr - 0.5); p.rotation.set((Math.random() - 0.5) * 0.12, Math.random() * 3, (Math.random() - 0.5) * 0.12); stage.add(p);
            if (i % 3 === 0) { const fl = new T.Sprite(new T.SpriteMaterial({ map: zFxTex('flame_03'), color: tw.col, transparent: true, depthWrite: false, blending: T.AdditiveBlending })); fl.scale.set(2.2, 3, 1); fl.position.set(p.position.x, h + 0.7, p.position.z); stage.add(fl); (ZBT.torch = ZBT.torch || []).push(fl); } }
        ZBT.isl = []; for (let i = 0; i < 7; i++) { const m = new T.Mesh(new T.IcosahedronGeometry(1, 0), rockM); const a = i / 7 * 6.283 + 0.7, rr = 38 + (i % 3) * 9; m.position.set(Math.cos(a) * rr, 2 + Math.random() * 14, Math.sin(a) * rr - 20); m.scale.set(3 + Math.random() * 4, 1.3 + Math.random(), 3 + Math.random() * 4); stage.add(m); ZBT.isl.push(m); }
        const sun = new T.Sprite(new T.SpriteMaterial({ map: zFxTex('light_02'), color: new T.Color(tw.col).lerp(new T.Color('#ffe6b0'), 0.6), transparent: true, depthWrite: false, blending: T.AdditiveBlending, fog: false })); sun.material.opacity = 0.45; sun.scale.set(70, 70, 1); sun.position.set(-10, 30, -85); sc.add(sun);
        const emb = []; for (let i = 0; i < 70; i++) { const p = zBt3P({ tex: 'spark_01', col: i % 2 ? tw.col : '#ffe2b0', pos: new T.Vector3((Math.random() - 0.5) * 34, Math.random() * 9, (Math.random() - 0.5) * 18), vel: new T.Vector3((Math.random() - 0.5) * 0.4, 0.5 + Math.random() * 0.8, 0), s0: 0.16 + Math.random() * 0.18, life: 4 + Math.random() * 5, op: 0.8 }); if (p) { p.keep = 1; } }
        ZBT.up = 0; try { clModelEnsure('arena_batalha.glb').then(res => { if (!ZBT.on || !res || !res.gl) return; const A = res.gl.scene.clone(true); A.scale.setScalar(1.7); A.position.y = 7 * 1.7; A.traverse(o => { if (o.isMesh) { o.frustumCulled = false; const ms = Array.isArray(o.material) ? o.material : [o.material]; ms.forEach(m => { if (m && m.color && m.name === 'stone') m.color.lerp(new T.Color(tw.col), 0.08); }); } }); A.traverse(o => { if (o.isMesh) o.receiveShadow = !ZOO.lite; }); sc.add(A); ZBT.arena = A; stage.visible = false; ZBT.up = 1.5; ZBT.zcap = 17; zBt3Shot(ZBT.shot || 'wide', ZBT.p, ZBT.e); }).catch(() => {}); } catch (e) {}
        ZBT.p = zBt3Ent(pSp, 'p', 5.2, duel.pStats.lv + 2); ZBT.e = zBt3Ent(eSp, 'e', 7.0, 6 + duel.tower * 1.5);
        const fit = () => { const w = box.clientWidth || 800, h = box.clientHeight || 600; r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); ZBT.dist = Math.max(14, Math.min(30, 14 / (2 * Math.tan(21 * Math.PI / 180) * Math.max(0.3, cam.aspect)))); zBt3Shot(ZBT.shot || 'wide', ZBT.p, ZBT.e); }; ZBT.fit = fit; fit(); window.addEventListener('resize', fit);
        cam.position.copy(ZBT.cs.p); cam.lookAt(ZBT.cs.l); ZBT.look = ZBT.cs.l.clone(); ZBT.cam = cam;
        zBt3Banner('⚔ ' + tw.boss, 'intro'); zBt3Hud(); ZBT.busy = true; zBt3At(2.0, () => { ZBT.busy = false; zBt3Hud(); });
        let last = 0, tt = 0; const loop = now => {
            if (!ZBT.on) return; ZBT.raf = requestAnimationFrame(loop); const raw = Math.min(0.05, (now - (last || now)) / 1000); last = now;
            if (ZBT.freeze > 0) { ZBT.freeze -= raw; r.render(sc, cam); return; }
            const dt = raw * ZBT.ts * (ZBT.mul === undefined ? 1 : ZBT.mul); tt += dt; ZBT.t = tt;
            for (let i = ZBT.q.length - 1; i >= 0; i--) { const q = ZBT.q[i]; if (tt >= q.at) { ZBT.q.splice(i, 1); try { q.fn(); } catch (er) { console.warn(er); } } }
            for (let i = ZBT.tw.length - 1; i >= 0; i--) { const w = ZBT.tw[i]; w.a += dt; const u = Math.min(1, w.a / w.d); try { w.fn(u); } catch (er) { if (!w.er) { w.er = 1; console.warn('bt3 tween: ' + (er && er.message)); } } if (u >= 1) { ZBT.tw.splice(i, 1); try { w.done && w.done(); } catch (er) { console.warn(er); } } }
            zBt3EntStep(ZBT.p, dt, tt); zBt3EntStep(ZBT.e, dt, tt);
            for (let i = ZBT.pp.length - 1; i >= 0; i--) { const p = ZBT.pp[i]; p.a += dt; const u = p.a / p.life; if (u >= 1 && !p.keep) { ZBT.sc.remove(p.sp); p.sp.material.dispose(); ZBT.pp.splice(i, 1); continue; } if (p.keep && u >= 1) { p.a = 0; p.sp.position.set((Math.random() - 0.5) * 34, -0.5, (Math.random() - 0.5) * 18); } const uu = Math.min(1, p.a / p.life);
                p.vel.y -= p.g * dt; if (p.dr) p.vel.multiplyScalar(Math.max(0, 1 - p.dr * dt)); p.sp.position.addScaledVector(p.vel, dt); p.sp.scale.setScalar(p.s0 + (p.s1 - p.s0) * uu); p.sp.material.opacity = p.op * Math.min(1, uu * 8) * Math.pow(1 - uu, 1.1); if (p.spin) p.sp.material.rotation += p.spin * dt; }
            for (let i = ZBT.db.length - 1; i >= 0; i--) { const d = ZBT.db[i]; d.a += dt; d.vel.y -= 16 * dt; d.m.position.addScaledVector(d.vel, dt); d.m.rotation.x += d.rv.x * dt; d.m.rotation.y += d.rv.y * dt; if (d.m.position.y < 0.1) { d.m.position.y = 0.1; d.vel.y *= -0.35; d.vel.x *= 0.6; d.vel.z *= 0.6; } d.m.material.opacity = Math.min(1, (d.life - d.a) * 2); if (d.a > d.life) { ZBT.sc.remove(d.m); d.m.material.dispose(); ZBT.db.splice(i, 1); } }
            if (ZBT.lt) { const L = ZBT.lt; L.a += dt; ZBT.pl.position.copy(L.pos); ZBT.pl.color.set(L.col); ZBT.pl.intensity = L.i * Math.max(0, 1 - L.a / L.d); if (L.a > L.d) { ZBT.lt = null; ZBT.pl.intensity = 0; } }
            if (ZBT.torch) ZBT.torch.forEach((f, i) => { f.scale.set(2.1 + Math.sin(tt * 9 + i) * 0.25, 3 + Math.sin(tt * 7 + i * 2) * 0.4, 1); });
            ZBT.isl.forEach((m, i) => { m.position.y += Math.sin(tt * 0.5 + i) * 0.003; m.rotation.y += 0.001; });
            /* câmera: segue a "tomada" atual com suavidade, com tremor por impacto e leve balanço */
            const C = ZBT.cs, kk = 1 - Math.exp(-raw * 2.4); cam.position.lerp(C.p, kk); ZBT.look.lerp(C.l, kk); cam.fov += (C.f - cam.fov) * kk; cam.updateProjectionMatrix();
            ZBT.trauma = Math.max(0, ZBT.trauma - raw * 1.5); const sh = ZBT.trauma * ZBT.trauma; cam.position.x += Math.sin(now * 0.05) * sh * 0.32; cam.position.y += Math.cos(now * 0.061) * sh * 0.22; cam.position.x += Math.sin(tt * 0.3) * 0.35; cam.lookAt(ZBT.look); r.render(sc, cam);
        };
        ZBT.raf = requestAnimationFrame(loop);
    }

    function zBt3Close(back) {
        if (!ZBT.on) return; ZBT.on = false; try { cancelAnimationFrame(ZBT.raf); } catch (e) {} try { window.removeEventListener('resize', ZBT.fit); } catch (e) {}
        try { ZBT.sc.traverse(o => { if (o.geometry && o.geometry.dispose) o.geometry.dispose(); const ms = Array.isArray(o.material) ? o.material : [o.material]; ms.forEach(m => { if (m && m.dispose && !(o.userData && o.userData.shared)) { try { if (m.map && m.map.isCanvasTexture) m.map.dispose(); m.dispose(); } catch (e2) {} } }); }); } catch (e) {}
        try { ZBT.r.dispose(); ZBT.r.forceContextLoss && ZBT.r.forceContextLoss(); } catch (e) {} try { ZBT.box.remove(); } catch (e) {} ZOO.modal = ZBT.prevModal === 'bt3' ? null : ZBT.prevModal; CL.ver++; try { CL3.need = true; } catch (e) {}
        if (back !== false) { try { clOpenColonyArena(); } catch (e) {} }
    }
    function zBt3Finish(win, after) {   /* fim do duelo: o derrotado cai, o vencedor comemora */
        const L = win ? ZBT.e : ZBT.p, W = win ? ZBT.p : ZBT.e; ZBT.busy = true; zBt3Hud(); zBt3Shot(win ? 'tgt' : 'tgt', W, L); ZBT.ts = 0.6;
        try { zBt3Act(L, 'die', 1.0, 2.5); } catch (e) {}
        zBt3Tw(1.4, u => { L.dead = zBtOut(u); L.tilt = 0; if (Math.random() < 0.5) zBt3P({ tex: 'magic_02', col: '#ffffff', pos: L.holder.position.clone().add(new (clTh().Vector3)((Math.random() - 0.5) * L.span * 0.5, (Math.random() - 0.3) * L.span * 0.3, 0)), vel: new (clTh().Vector3)(0, 2, 0), s0: 0.6, s1: 0.1, life: 0.9, op: 0.9 }); }, null);
        zBt3At(0.9, () => { ZBT.ts = 1; zBt3Banner(win ? '🏆 VITÓRIA!' : 'Seu dragão caiu...', win ? 'win' : 'lose'); if (win) { zBt3Flash('#ffd35c', 0.5); zBt3Burst(W.holder.position.clone().add(new (clTh().Vector3)(0, 1, 0)), zBt3Style('p'), 40, 9, 1.4); zBt3Act(W, 'atk', 1.1, 1.5); } });
        zBt3At(3.0, () => { zBt3Close(false); after && after(); });
    }

    window.ruaBt = ZBT;
    /* ===== proteção para aparelhos fracos (iPad antigo): a tela 3D que falha reinicia sozinha em modo leve, e o modo leve é lembrado ===== */
    const ZSAFE = { crashed: false };
    try { Object.defineProperty(ZOO, 'lite', { get: () => !!(ZSAFE.base || LITE || ZSAFE.crashed || (typeof CL3 !== 'undefined' && CL3 && CL3.lowq)), set: v => { ZSAFE.base = !!v; }, configurable: true }); } catch (e) {}   /* o jogo atribui ZOO.lite a cada quadro: precisa aceitar a atribuição, senão o corte dos dragões fora da tela falha */
    (function () {
        const K = 'cestille_crash'; let st = {}; const rd = () => { try { st = JSON.parse(localStorage.getItem(K) || '{}') || {}; } catch (e) { st = {}; } }, wr = () => { try { localStorage.setItem(K, JSON.stringify(st)); } catch (e) {} };
        const lite = () => { ZSAFE.crashed = true; try { localStorage.setItem('CESTILLE_RUA_LITE', '1'); const p = localStorage.getItem('cestille_cl_perf'); if (p !== 'alta') localStorage.setItem('cestille_cl_perf', 'minimo'); localStorage.setItem('cestille_cl_low', '1'); } catch (e) {} };
        rd(); if (st.open && Date.now() - (st.t || 0) < 6 * 3600e3) { st.n = (st.n || 0) + 1; st.open = 0; wr(); }   /* a colônia estava aberta e a página sumiu sem fechar: o aparelho matou a aba */
        let touchDev = false; try { touchDev = !!(window.matchMedia && matchMedia('(pointer:coarse)').matches) || (navigator.maxTouchPoints || 0) > 1 && /iPad|iPhone|Android/.test(navigator.userAgent + (navigator.platform || '')); } catch (e) {}
        if (st.n && !touchDev) { try { localStorage.removeItem('CESTILLE_RUA_LITE'); localStorage.removeItem('cestille_crash'); localStorage.removeItem('cestille_cl_low'); if (localStorage.getItem('cestille_cl_perf') === 'minimo') localStorage.removeItem('cestille_cl_perf'); } catch (e) {} st = {}; }   /* computador não é aparelho fraco: o modo leve gravado por uma falha antiga sai */
        if (st.n) lite();
        setInterval(() => { try { const on = !!(CL && CL.on); if (on !== !!st.open) { rd(); st.open = on ? 1 : 0; st.t = Date.now(); wr(); } else if (on) { st.t = Date.now(); wr(); } } catch (e) {} }, 4000);
        window.addEventListener('pagehide', () => { try { rd(); st.open = 0; wr(); } catch (e) {} });
        document.addEventListener('webglcontextlost', e => { try { e.preventDefault(); } catch (er) {} if (CL && CL.on) return; rd(); st.n = (st.n || 0) + 1; st.open = 0; lite(); const now = Date.now(); if (now - (st.rl || 0) > 30000) { st.rl = now; wr(); try { toast('A tela 3D travou. Reiniciando em modo leve...'); } catch (er) {} setTimeout(() => { try { location.reload(); } catch (er) {} }, 900); } else wr(); }, true);
    })();

    /* ===== medidor de desempenho (abra o site com #perf no fim do endereço, ou digite ruaPerf() no console): mostra quadros por segundo e o que a placa de vídeo está desenhando ===== */
    function zPerfCount(o) { if (!o.visible) return 0; let n = (o.isMesh || o.isPoints || o.isLine || o.isSprite) ? 1 : 0; const c = o.children; for (let i = 0; i < c.length; i++) n += zPerfCount(c[i]); return n; }
    function zPerfBreak() {   /* de onde vêm as chamadas de desenho: peças da colônia por tipo, dragões e o resto da cena */
        try { if (!(CL && CL.on) || !CL3 || !CL3.sc) return ''; const by = {}, add = (k, n) => { by[k] = (by[k] || 0) + n; }; let tot = 0;
            CL3.sc.children.forEach(k => { if (k === CL3.grp) { k.children.forEach(g => { const id = (g.userData && g.userData.id) || (g.userData && g.userData.baked ? 'peças juntadas' : 'peça'); const n = zPerfCount(g); add(String(id), n); tot += n; }); } else { const n = zPerfCount(k); if (n) { add((k.isLight ? 'luz' : k.type === 'Group' ? 'grupo' : k.type), n); tot += n; } } });
            let dr = 0; try { ZOO.list.forEach(q => { if (q.g && q.g.visible) dr += zPerfCount(q.g); }); } catch (e) {}
            const top = Object.entries(by).sort((a, b) => b[1] - a[1]).slice(0, 8).map(e => e[0] + ' ' + e[1]).join(' · '); const F = window.__frz;
            return '\nmalhas visíveis ' + tot + ' (dragões ' + dr + ')\n' + top + (F ? '\ncongeladas ' + F.FRZ.n + '/' + F.FRZ.t + ' · juntadas ' + F.SB.cells.size + ' células' : ''); } catch (e) { return ''; }
    }
    window.ruaPerf = function (on) {
        if (on === false) { if (ZSAFE.pf) { clearInterval(ZSAFE.pf.iv); cancelAnimationFrame(ZSAFE.pf.raf); ZSAFE.pf.el.remove(); ZSAFE.pf = null; } return; }
        if (ZSAFE.pf) return; const el = document.createElement('div'); el.style.cssText = 'position:fixed;left:6px;top:6px;z-index:2147483647;background:rgba(0,0,0,.8);color:#9dff9d;font:11px/1.35 ui-monospace,Menlo,monospace;padding:6px 8px;border-radius:8px;pointer-events:none;white-space:pre;max-width:60vw'; document.body.appendChild(el);
        const pf = ZSAFE.pf = { el, n: 0, t0: performance.now(), worst: 0, last: performance.now() };
        const tick = now => { pf.n++; pf.worst = Math.max(pf.worst, now - pf.last); pf.last = now; pf.raf = requestAnimationFrame(tick); }; pf.raf = requestAnimationFrame(tick);
        pf.iv = setInterval(() => { try { const now = performance.now(), fps = pf.n / ((now - pf.t0) / 1000), I = (typeof CL3 !== 'undefined' && CL3 && CL3.r) ? CL3.r.info : null, m = performance.memory;
            el.textContent = 'FPS ' + fps.toFixed(0) + '  pior quadro ' + pf.worst.toFixed(0) + ' ms\n' + (CL && CL.on ? 'colônia ABERTA' : 'universo/rua') + (ZOO.lite ? '  (modo leve)' : '') + (CL3 && CL3.cp ? '  (brilho ligado)' : '') + '\n' + (I ? 'chamadas ' + I.render.calls + '  triângulos ' + (I.render.triangles / 1000).toFixed(0) + 'k\ngeometrias ' + I.memory.geometries + '  texturas ' + I.memory.textures + '\n' : '') + 'dragões ' + (ZOO.list ? ZOO.list.length : 0) + (m ? '\nmemória JS ' + (m.usedJSHeapSize / 1048576).toFixed(0) + ' MB' : '') + (ZOO.fx ? '  partículas ' + ZOO.fx.length : '') + '\nGRAVAÇÃO: nuvem ' + (window.ruaDataReady ? 'pronta' : 'AGUARDANDO') + ' · colônia ' + (CL && CL.saveHold ? 'SEGURANDO' : 'ok') + ' · presas ' + (window.__ruaHeldWrites || 0) + ' · a enviar ' + (window.__ruaNeedPush ? 'sim' : 'não') + ' · erro ' + (window.__ruaSaveErr || (window.__ruaSave && window.__ruaSave.err) || 'nenhum') + ' · última ok há ' + ((window.__ruaSave && window.__ruaSave.ok) ? Math.round((Date.now() - window.__ruaSave.ok) / 1000) + 's' : '—') + ' · perfil ' + window.ruaProfile + zPerfBreak();
            pf.n = 0; pf.t0 = now; pf.worst = 0; } catch (e) {} }, 900);
    };
    try { if (/[#&?]perf\b/.test(location.href)) setTimeout(() => window.ruaPerf(), 1500); } catch (e) {}

    /* ===== chão da colônia: ao entrar, reaplica material e texturas do chão (a textura às vezes aparecia quebrada até trocar a qualidade de vídeo) ===== */
    (function () {
        let was = false; const fix = () => { try { if (!CL.on || !CL3 || !CL3.r) return; const g = CL3.ground; if (g) (Array.isArray(g.material) ? g.material : [g.material]).forEach(m => { if (!m) return; m.needsUpdate = true; ['map', 'normalMap', 'roughnessMap', 'bumpMap', 'emissiveMap'].forEach(k => { if (m[k]) m[k].needsUpdate = true; }); }); [CL3.mS, CL3.mC].forEach(m => { if (m) m.needsUpdate = true; }); CL3.r.setPixelRatio(CL3.r.getPixelRatio()); CL3.w = 0; CL3.need = true; } catch (e) {} };
        setInterval(() => { const on = !!(CL && CL.on); if (on && !was) { [900, 2500, 6000].forEach(ms => setTimeout(fix, ms)); } was = on; }, 400);
    })();


    window.ruaCL3 = () => CL3;   /* para medir: cena da colônia */

    /* ===== salvamento: se a nuvem nunca avisar que está pronta, a colônia não pode ficar segurando a gravação para sempre ===== */
    (function () {
        const t0 = Date.now(); let warned = 0;
        setInterval(() => { try {
            if (window.ruaProfile === 'guest') return;
            if (!window.ruaDataReady && Date.now() - t0 > 20000) { window.ruaDataReady = true; window.__ruaNeedPush = 1; window.__ruaForcedReady = Date.now(); }
            if (window.ruaDataReady && CL && CL.saveHold) { CL.saveHold = 0; try { clSave(true); } catch (e) {} }
            if (CL && CL.on && CL.saveHold && !warned && Date.now() - t0 > 12000) { warned = 1; try { toast('Esperando a nuvem para salvar a colônia…'); } catch (e) {} }
        } catch (e) {} }, 1500);
    })();
/* === [SEC: COLONIA_POST_FX_CASTELO] === */
    /* ===== ESTILO PASTEL DA COLÔNIA: um tratamento de cor único para TODOS os modelos (construções, dragões, ilhas, castelo, arena), para ficarem no mesmo estilo.
       Em vez de repintar cada modelo, o desenho de todo material iluminado passa por um filtro: cor um pouco menos saturada, tons médios mais claros, leve toque quente,
       acabamento fosco uniforme (sem metal brilhante nem plástico). Liga ao abrir a colônia e desliga ao sair (o universo não muda). Chave: localStorage cestille_cl_style = 0 desliga ===== */
    const ZPAS = { on: false, orig: null, lk0: null };
    const zPasPref = () => { try { return localStorage.getItem('cestille_cl_style') !== '0'; } catch (e) { return true; } };
    function zPasApply(on) {
        try {
            const T = clTh(); if (!T || !T.ShaderChunk) return; const SC = T.ShaderChunk;
            if (on && !ZPAS.on) {
                ZPAS.orig = { common: SC.common, emi: SC.emissivemap_fragment, rough: SC.roughnessmap_fragment, metal: SC.metalnessmap_fragment, map: SC.map_fragment, nrm: SC.normal_fragment_maps, out: SC.output_fragment };
                SC.common = SC.common + '\nvec3 clPastel(vec3 c){ float l = dot(c, vec3(0.2126, 0.7152, 0.0722)); c = mix(vec3(l), c, 0.78); c = pow(max(c, vec3(0.0)), vec3(0.90)); c = mix(c, vec3(0.95, 0.93, 0.97) * max(l, 0.25), 0.08); c = clamp(c * vec3(1.03, 1.0, 0.97), 0.0, 1.0); \nreturn c; }\n';   /* cores em poucos degraus, como pintura cartoon */
                SC.emissivemap_fragment = SC.emissivemap_fragment + '\n#ifndef CL_NO_PASTEL\ndiffuseColor.rgb = clPastel(diffuseColor.rgb);\n#endif\n#ifndef CL_NO_TOON\n#define CL_TOON 1\n#endif\n';
                SC.roughnessmap_fragment = SC.roughnessmap_fragment + '\nroughnessFactor = max(roughnessFactor, 0.85);\n';
                SC.metalnessmap_fragment = SC.metalnessmap_fragment + '\nmetalnessFactor *= 0.15;\n';
                ZPAS.on = true;
            } else if (!on && ZPAS.on && ZPAS.orig) {
                SC.common = ZPAS.orig.common; SC.emissivemap_fragment = ZPAS.orig.emi; SC.roughnessmap_fragment = ZPAS.orig.rough; SC.metalnessmap_fragment = ZPAS.orig.metal; SC.map_fragment = ZPAS.orig.map; SC.normal_fragment_maps = ZPAS.orig.nrm; SC.output_fragment = ZPAS.orig.out; ZPAS.on = false;
            } else return;
            /* recompila os materiais da colônia com o novo acabamento */
            try { if (CL3 && CL3.sc) { const seen = new Set(); CL3.sc.traverse(o => { const m = o.material; if (!m) return; (Array.isArray(m) ? m : [m]).forEach(mt => { if (mt && !seen.has(mt)) { seen.add(mt); mt.needsUpdate = true; } }); }); CL3.need = true; } } catch (e) {}
            /* luz um pouco mais suave: menos contraste entre sol e sombra */
            try { if (CL3 && CL3.lk) { if (on) { if (!ZPAS.lk0) ZPAS.lk0 = Object.assign({}, CL3.lk); CL3.lk.sun = ZPAS.lk0.sun * 0.82; CL3.lk.hemi = ZPAS.lk0.hemi * 1.22; CL3.lk.amb = ZPAS.lk0.amb * 1.3; } else if (ZPAS.lk0) { Object.assign(CL3.lk, ZPAS.lk0); ZPAS.lk0 = null; } } } catch (e) {}
        } catch (e) { try { console.warn('estilo pastel', e); } catch (e2) {} }
    }
    function zPasGround() { try { const gm = CL3 && CL3.groundMat; if (gm && gm.userData && !gm.userData.noToon) { gm.userData.noToon = 1; gm.defines = Object.assign({}, gm.defines, { CL_NO_TOON: 1 }); gm.needsUpdate = true; } } catch (e) {} }
    let zPasWas = false;
    setInterval(() => { try { const open = !!(CL && CL.on), want = open && zPasPref() && !window.__proWant && !ZPRO.on; if (want !== ZPAS.on) zPasApply(want); if (ZPAS.on) zPasGround(); zPasWas = open; } catch (e) {} }, 400);
    window.ruaPastel = on => { try { localStorage.setItem('cestille_cl_style', on === false ? '0' : '1'); } catch (e) {} zPasApply(on !== false && !!(CL && CL.on)); return ZPAS.on; };

    /* ===== LOOK DO PROTÓTIPO (fim de tarde) NA COLÔNIA: o mesmo acabamento de cor do protótipo aprovado (saturação 1.14, contraste 1.08, tom quente nas sombras e na luz) + a grama do protótipo no chão.
       Liga sozinho quando a hora da colônia é "tarde" (o padrão) e a colônia está aberta; no lugar do filtro pastel. window.ruaProto(false) desliga ===== */
    const ZPRO = { on: false, orig: null, grass: null, off: false };
    window.ruaProto = on => { if (on === false) ZPRO.off = true; else if (on === true) ZPRO.off = false; return !ZPRO.off; };
    window.ruaProto.__flag = true;
    function zProGrassTex() {   /* gramado delicado: fundo verde com manchas suaves de tom, milhares de lâminas finas em vários verdes, tufos abertos em leque e pontinhos de florzinhas; o ladrilho (1024 px) cobre 5,26 unidades e emenda nas bordas */
        if (ZPRO.grass) return ZPRO.grass; const T = clTh(); if (!T) return null;
        const N = 1024, c = document.createElement('canvas'); c.width = c.height = N; const g = c.getContext('2d'); let sd = 21; const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
        g.fillStyle = '#5dae42'; g.fillRect(0, 0, N, N);
        for (let i = 0; i < 14; i++) {   /* manchas largas de tom */
            const x0 = r() * N, y0 = r() * N, R = 150 + r() * 230, col = i % 3 === 0 ? '215,232,106' : i % 3 === 1 ? '47,122,52' : '154,210,90';
            for (const ox of [-N, 0, N]) for (const oy of [-N, 0, N]) { const x = x0 + ox, y = y0 + oy; if (x + R < 0 || y + R < 0 || x - R > N || y - R > N) continue; const gr = g.createRadialGradient(x, y, 0, x, y, R); gr.addColorStop(0, 'rgba(' + col + ',0.2)'); gr.addColorStop(1, 'rgba(' + col + ',0)'); g.fillStyle = gr; g.fillRect(x - R, y - R, R * 2, R * 2); }
        }
        const greens = ['#7fd05f', '#4a9a38', '#6ec453', '#3f8a30', '#8ad46a', '#5aa840', '#a3dc72', '#2f7a2c'];
        const blade = (x, y, len, ang, col, w) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.sin(ang) * len * 0.5 + 1, y - len * 0.6, x + Math.sin(ang) * len, y - len); g.stroke(); };
        const wrap = (x, y, f) => { f(x, y); if (x < 14) f(x + N, y); if (x > N - 14) f(x - N, y); if (y < 14) f(x, y + N); if (y > N - 14) f(x, y - N); };
        for (let i = 0; i < 9000; i++) { const x = r() * N, y = r() * N, len = 4 + r() * 6, ang = (r() - 0.5) * 0.9, col = greens[Math.floor(r() * greens.length)], w = 0.8 + r() * 0.8; wrap(x, y, (xx, yy) => blade(xx, yy, len, ang, col, w)); }   /* lâminas soltas */
        for (let i = 0; i < 900; i++) { const x = r() * N, y = r() * N, n = 4 + Math.floor(r() * 4), base = greens[Math.floor(r() * 4)]; wrap(x, y, (xx, yy) => { for (let k = 0; k < n; k++) blade(xx + (k - n / 2) * 1.2, yy, 6 + r() * 7, (k - (n - 1) / 2) * 0.35, k % 2 ? greens[(k + 4) % greens.length] : base, 1.0); }); }   /* tufos em leque */
        for (let i = 0; i < 160; i++) { const x = r() * N, y = r() * N, col = ['#fff3b0', '#ffffff', '#f7b6d2', '#ffd24a', '#cfe8ff'][Math.floor(r() * 5)]; wrap(x, y, (xx, yy) => { g.fillStyle = col; g.beginPath(); g.arc(xx, yy, 1.1 + r() * 1.2, 0, 7); g.fill(); }); }   /* florzinhas */
        const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.encoding = T.sRGBEncoding; t.anisotropy = 8; return (ZPRO.grass = t);
    }
    /* o protótipo mostra as cores "cruas" (sem conversão sRGB): as texturas passam a ser lidas como lineares enquanto o look estiver ligado */
    const ZPRTX = { set: new Set(), seen: new WeakSet() };
    function zProTex(on) {
        try {
            if (!on) { ZPRTX.set.forEach(t => { t.encoding = 3001; t.needsUpdate = true; }); ZPRTX.set.clear(); ZPRTX.seen = new WeakSet(); return; }
            if (!CL3 || !CL3.sc) return;
            CL3.sc.traverse(o => { const m = o.material; if (!m) return; (Array.isArray(m) ? m : [m]).forEach(mt => { if (!mt || ZPRTX.seen.has(mt)) return; ZPRTX.seen.add(mt); ['map', 'emissiveMap', 'aoMap'].forEach(k => { const t = mt[k]; if (t && t.encoding === 3001 && !ZPRTX.set.has(t)) { ZPRTX.set.add(t); t.encoding = 3000; t.needsUpdate = true; mt.needsUpdate = true; } }); }); });
        } catch (e) {}
    }
    function zProApply(on) {
        try {
            const T = clTh(); if (!T || !T.ShaderChunk) return; const SC = T.ShaderChunk;
            try { const r = CL3 && CL3.r, sc3 = CL3 && CL3.sc; if (on && r) { ZPRO.tm = r.toneMapping; ZPRO.oe = r.outputEncoding; r.toneMapping = 0; r.outputEncoding = 3000; if (sc3 && sc3.environment) { ZPRO.env = sc3.environment; sc3.environment = null; } } else if (!on && r) { try { r.domElement.style.removeProperty('filter'); } catch (e) {} if (ZPRO.cp && !CL3.cp && CL3.cpRP && CL3.cpRP.scene === CL3.sc) { CL3.cp = ZPRO.cp; if (CL3.uLin) CL3.uLin.value = 1; } ZPRO.cp = null; if (ZPRO.tm != null) r.toneMapping = ZPRO.tm; if (ZPRO.oe != null) r.outputEncoding = ZPRO.oe; zProTex(false); if (sc3 && ZPRO.env) { sc3.environment = ZPRO.env; ZPRO.env = null; } } } catch (e) {}   /* igual ao protótipo: sem mapeamento de tons e sem mapa de ambiente */
            if (on && !ZPRO.on) {
                ZPRO.orig = SC.output_fragment;
                SC.output_fragment = SC.output_fragment + '\n#ifndef CL_NO_PROTO\n{ float lm = dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114)); gl_FragColor.rgb = mix(vec3(lm), gl_FragColor.rgb, ' + ((typeof CL_TOUCH === 'function' && CL_TOUCH()) ? '0.98' : '1.14') + '); gl_FragColor.rgb = (gl_FragColor.rgb - 0.5) * 1.08 + 0.515; gl_FragColor.rgb = clamp(gl_FragColor.rgb * vec3(1.0, 0.816, 0.643), 0.0, 1.0); }\n#endif\n';
                ZPRO.on = true;
            } else if (!on && ZPRO.on) { SC.output_fragment = ZPRO.orig; ZPRO.on = false; } else return;
            if (CL3 && CL3.sc) { const seen = new Set(); CL3.sc.traverse(o => { const m = o.material; if (!m) return; (Array.isArray(m) ? m : [m]).forEach(mt => { if (mt && !seen.has(mt)) { seen.add(mt); mt.needsUpdate = true; } }); }); CL3.need = true; }
        } catch (e) { try { console.warn('look do protótipo', e); } catch (e2) {} }
    }
    function zProGround(on) {
        try {
            const gm = CL3 && CL3.groundMat; if (!gm) return; const U = gm.userData || (gm.userData = {});
            let mesh = U.mesh; if (!mesh) { CL3.sc.traverse(o => { if (o.material === gm && o.geometry && o.geometry.parameters && o.geometry.parameters.width) mesh = o; }); U.mesh = mesh; } if (!mesh) return;
            if (on) {   /* o chão vira Lambert com a grama do protótipo (o material original fica guardado) */
                const g = zProGrassTex(); if (!g) return; const T = clTh();
                if (!U.lam) { U.lam = new T.MeshLambertMaterial({ map: g, color: 0xffffff }); U.lam.defines = { CL_NO_TOON: 1 }; U.w = mesh.geometry.parameters.width; g.repeat.set(U.w / 5.26, U.w / 5.26); }
                if (mesh.material !== U.lam) { U.orig = mesh.material; mesh.material = U.lam; ZPRTX.seen = new WeakSet(); }
            } else if (U.lam && mesh.material === U.lam && U.orig) { mesh.material = U.orig; }
        } catch (e) { try { console.warn('grama do protótipo', e); } catch (e2) {} }
    }

    /* tufos de grama em 3D espalhados pelo chão (como no protótipo): lâminas finas com base escura e ponta clara, cor diferente em cada tufo; ficam fora do espaço das construções */
    const ZTF = { mesh: null, sig: '' };
    function zProTufts() {
        try {
            const want = !!(CL && CL.on && ZPRO.on && CL3 && CL3.sc && window.ruaTufts !== false), T = want ? clTh() : null, s = want ? clS() : null;
            const disposeTufts = () => {
                if (!ZTF.mesh) return;
                try {
                    if (ZTF.mesh.parent) ZTF.mesh.parent.remove(ZTF.mesh);
                    ZTF.mesh.traverse(child => {
                        if (child.geometry) child.geometry.dispose();
                        if (child.material) {
                            if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
                            else child.material.dispose();
                        }
                    });
                } catch (e) {}
                ZTF.mesh = null;
            };
            if (!want || !T || !s) { disposeTufts(); ZTF.sig = ''; return; }
            const H = s.H || 16, sig = H + '|' + (s.pcs || []).map(p => p[0] + p[1] + ',' + p[2] + ',' + p[3]).join(';') + '|' + (CL3.sc.uuid || '');
            if (ZTF.mesh && ZTF.mesh.parent === CL3.sc && ZTF.sig === sig) return;
            disposeTufts();
            const rects = []; (s.pcs || []).forEach(p => { const t = CLT[p[0]]; if (!t) return; const f = clFp(t, p[3]); rects.push([p[1] - 0.3, p[2] - 0.3, p[1] + f[0] + 0.3, p[2] + f[1] + 0.3]); });
            const bl = 4, pos = [], col = [], idx = []; let rs = 7;
            const rnd = () => (rs = (rs * 16807) % 2147483647) / 2147483647;
            for (let b = 0; b < bl; b++) { const a = b / bl * 6.2832 + rnd() * 0.6, lean = 0.08 + rnd() * 0.1, h = 0.14 + rnd() * 0.12, w = 0.02 + rnd() * 0.008, r0 = 0.02 + rnd() * 0.03, bx = Math.cos(a), bz = Math.sin(a), px = -bz, pz = bx, n = pos.length / 3;
                pos.push(bx * r0 + px * w, 0, bz * r0 + pz * w, bx * r0 - px * w, 0, bz * r0 - pz * w, bx * (r0 + lean * 0.5) + px * w * 0.6, h * 0.55, bz * (r0 + lean * 0.5) + pz * w * 0.6, bx * (r0 + lean * 0.5) - px * w * 0.6, h * 0.55, bz * (r0 + lean * 0.5) - pz * w * 0.6, bx * (r0 + lean * 1.4), h, bz * (r0 + lean * 1.4));
                col.push(0.4, 0.45, 0.3, 0.4, 0.45, 0.3, 0.72, 0.78, 0.5, 0.72, 0.78, 0.5, 0.85, 0.88, 0.6); idx.push(n, n + 1, n + 2, n + 1, n + 3, n + 2, n + 2, n + 3, n + 4); }
            const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); geo.setAttribute('color', new T.Float32BufferAttribute(col, 3)); geo.setIndex(idx); geo.computeVertexNormals();
            const mat = new T.MeshLambertMaterial({ color: 0xffffff, vertexColors: true, side: T.DoubleSide }); mat.defines = { CL_NO_PASTEL: 1 };
            const R = H, per = 5, cap = Math.ceil((R * 2) * (R * 2) * per), list = [];
            for (let i = 0; i < cap; i++) { const x = (rnd() * 2 - 1) * R, z = (rnd() * 2 - 1) * R; let ok = true; for (let k = 0; k < rects.length; k++) { const r = rects[k]; if (x > r[0] && x < r[2] && z > r[1] && z < r[3]) { ok = false; break; } } if (ok) list.push([x, z, rnd() * 6.283, 0.6 + rnd() * 0.8, rnd()]); }
            const NC = 4, cell = (R * 2) / NC, buckets = [...Array(NC * NC)].map(() => []);
            list.forEach(e => { const ix = Math.min(NC - 1, Math.max(0, Math.floor((e[0] + R) / cell))), iz = Math.min(NC - 1, Math.max(0, Math.floor((e[1] + R) / cell))); buckets[iz * NC + ix].push(e); });
            const holder = new T.Group(); holder.name = 'tufos'; const m4 = new T.Matrix4(), q = new T.Quaternion(), up = new T.Vector3(0, 1, 0), c = new T.Color(), sv = new T.Vector3(), pv = new T.Vector3();
            buckets.forEach((bk, bi) => { if (!bk.length) return; const im = new T.InstancedMesh(geo, mat, bk.length);
                bk.forEach((e, i) => { q.setFromAxisAngle(up, e[2]); m4.compose(pv.set(e[0], 0, e[1]), q, sv.set(e[3], e[3] * (0.8 + e[4] * 0.5), e[3])); im.setMatrixAt(i, m4); const h = 0.15 + e[4] * 0.06, l = 0.3 + ((i * 37) % 17) / 17 * 0.14; c.setHSL(h, 0.38 + e[4] * 0.15, l); im.setColorAt(i, c); });
                im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true; im.frustumCulled = false; im.castShadow = false; im.receiveShadow = false; im.userData.cx = -R + (bi % NC + 0.5) * cell; im.userData.cz = -R + (Math.floor(bi / NC) + 0.5) * cell; holder.add(im); });
            holder.userData.half = cell * 0.75; CL3.sc.add(holder); ZTF.mesh = holder; ZTF.sig = sig;
        } catch (e) { try { console.warn('tufos de grama', e); } catch (e2) {} }
    }
    setInterval(zProTufts, 1200);
    setInterval(() => { try { const h = ZTF.mesh; if (!h || !CL3 || CL3.tx == null) return; const lim = Math.max(13, (CL3.dist || 20) * 0.75) + h.userData.half; h.children.forEach(im => { im.visible = Math.hypot(im.userData.cx - CL3.tx, im.userData.cz - CL3.tz) < lim; }); } catch (e) {} }, 250);   /* de longe/de cima os tufos distantes somem: menos peso e imagem mais nítida */
    setInterval(() => { try { const open = !!(CL && CL.on), tm = open ? ((clS().tm) || 'golden') : '', want = open && tm === 'golden' && !ZPRO.off && !(typeof clEvActive === 'function' && clEvActive('halloween')); window.__proWant = want; if (want !== ZPRO.on) { if (want && ZPAS.on) zPasApply(false); zProApply(want); } if (!want && !ZPAS.on && open && zPasPref() && !ZPRO.on) zPasApply(true); zProGround(ZPRO.on); try { const Wt = CL3 && CL3.wt; if (Wt && Wt.fog) { if (ZPRO.on) { if (Wt.fog.visible) { Wt.fog.visible = false; ZPRO.fogHid = true; } } else if (ZPRO.fogHid) { Wt.fog.visible = true; ZPRO.fogHid = false; } } } catch (e) {}   /* a folha de névoa a 0,1 de altura corre colada no chão e na água: é a "luz que anda"; no modo tarde fica desligada */
        if (ZPRO.on && CL3 && CL3.sc && CL3.r) { if (CL3.sc.environment) { ZPRO.env = CL3.sc.environment; CL3.sc.environment = null; } if (CL3.cp) { ZPRO.cp = CL3.cp; CL3.cp = null; if (CL3.uLin) CL3.uLin.value = 0; } if (CL3.r.toneMapping !== 0) CL3.r.toneMapping = 0; if (CL3.r.outputEncoding !== 3000) CL3.r.outputEncoding = 3000; try { CL3.r.domElement.style.setProperty('filter', 'none', 'important'); } catch (e) {}   /* a tela da colônia leva saturate(1.9) contrast(1.06) por CSS (classe cl-nocp): o protótipo não tem esse filtro */ if (!ZPRTX.t || Date.now() - ZPRTX.t > 1200) { ZPRTX.t = Date.now(); zProTex(true); } } } catch (e) {} }, 400);   /* o céu HDRI e o tom ACES chegam depois: segura os dois desligados */
    /* ===== COVIL: castelo de pedra montado por código (torre de menagem, 4 torres de canto com telhado azul cônico, muralha com ameias, portão e bandeiras), no estilo da vila medieval de referência. Cresce a cada nível ===== */
    function zKeepTex(kind) {
        const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
        if (kind === 'stone') { g.fillStyle = '#a9a39a'; g.fillRect(0, 0, 256, 256); const bh = 32, bw = 64; for (let r = 0; r < 8; r++) for (let q = -1; q < 5; q++) { const x = q * bw + (r % 2 ? bw / 2 : 0) + 1, y = r * bh + 1; const v = 150 + ((r * 7 + q * 13) % 5) * 9; g.fillStyle = 'rgb(' + v + ',' + (v - 4) + ',' + (v - 12) + ')'; g.fillRect(x, y, bw - 3, bh - 3); g.fillStyle = 'rgba(255,255,255,.07)'; g.fillRect(x, y, bw - 3, 4); g.fillStyle = 'rgba(0,0,0,.10)'; g.fillRect(x, y + bh - 7, bw - 3, 4); } }
        else { g.fillStyle = '#9b948a'; g.fillRect(0, 0, 256, 256); for (let i = 0; i < 170; i++) { const x = (i * 53) % 256, y = ((i * 97) % 256), r = 9 + (i % 5) * 2, v = 135 + (i * 11) % 40; g.fillStyle = 'rgb(' + v + ',' + (v - 3) + ',' + (v - 10) + ')'; g.beginPath(); g.ellipse(x, y, r, r * 0.8, 0, 0, 6.283); g.fill(); g.strokeStyle = 'rgba(40,36,30,.35)'; g.lineWidth = 2; g.stroke(); } }
        const T = clTh(), t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; if (T.sRGBEncoding) t.encoding = T.sRGBEncoding; t.anisotropy = 4; return t;
    }
    function zKeep(grp, level) {
        try {
            const T = clTh(), lv = Math.max(1, Math.min(5, level | 0)); ZOO.keepTex = ZOO.keepTex || { stone: zKeepTex('stone'), cob: zKeepTex('cob') };
            const stoneM = (rx, ry) => { const t = ZOO.keepTex.stone.clone(); t.needsUpdate = true; t.repeat.set(rx, ry); return new T.MeshStandardMaterial({ map: t, roughness: 0.95, metalness: 0 }); };
            const roofM = new T.MeshStandardMaterial({ color: '#3e6db3', roughness: 0.8, flatShading: true }), woodM = new T.MeshStandardMaterial({ color: '#7a5230', roughness: 0.9 }), darkM = new T.MeshStandardMaterial({ color: '#2a2018', roughness: 1 });
            const root = new T.Group(); root.position.set(1.06, 0, 0); grp.add(root);
            const add = (geo, mat, x, y, z, rx, ry, rz) => { const m = new T.Mesh(geo, mat); m.position.set(x, y, z); if (rx) m.rotation.x = rx; if (ry) m.rotation.y = ry; if (rz) m.rotation.z = rz; m.castShadow = !ZOO.lite; m.receiveShadow = !ZOO.lite; root.add(m); return m; };
            const cobT = ZOO.keepTex.cob.clone(); cobT.needsUpdate = true; cobT.repeat.set(2.4, 1.4);
            add(new T.BoxGeometry(4.6, 0.08, 2.6), new T.MeshStandardMaterial({ map: cobT, roughness: 1 }), 0, 0.04, 0);   /* pátio de pedra */
            const merl = [];   /* ameias (todas numa só malha instanciada) */
            const merlonRow = (x0, z0, x1, z1, n, y) => { for (let i = 0; i < n; i++) { const t = n > 1 ? i / (n - 1) : 0.5; merl.push([x0 + (x1 - x0) * t, y, z0 + (z1 - z0) * t]); } };
            const hKeep = 1.15 + 0.17 * lv, wK = 1.5 + 0.06 * lv, dK = 1.05;
            add(new T.BoxGeometry(wK, hKeep, dK), stoneM(wK * 1.6, hKeep * 1.6), 0, 0.08 + hKeep / 2, 0);   /* torre de menagem */
            add(new T.BoxGeometry(wK + 0.1, 0.07, dK + 0.1), stoneM(2, 0.2), 0, 0.08 + hKeep + 0.03, 0);
            merlonRow(-wK / 2 + 0.05, -dK / 2 + 0.03, wK / 2 - 0.05, -dK / 2 + 0.03, 7, 0.08 + hKeep + 0.12); merlonRow(-wK / 2 + 0.05, dK / 2 - 0.03, wK / 2 - 0.05, dK / 2 - 0.03, 7, 0.08 + hKeep + 0.12); merlonRow(-wK / 2 + 0.03, -dK / 2 + 0.12, -wK / 2 + 0.03, dK / 2 - 0.12, 4, 0.08 + hKeep + 0.12); merlonRow(wK / 2 - 0.03, -dK / 2 + 0.12, wK / 2 - 0.03, dK / 2 - 0.12, 4, 0.08 + hKeep + 0.12);
            add(new T.BoxGeometry(0.3, 0.5, 0.04), darkM, 0, 0.35, dK / 2 + 0.01);   /* porta da torre */
            add(new T.CylinderGeometry(0.15, 0.15, 0.04, 14, 1, false, 0, 3.1416), darkM, 0, 0.6, dK / 2 + 0.01, 1.5708);
            for (let k = 0; k < 2; k++) add(new T.BoxGeometry(0.12, 0.22, 0.03), darkM, -0.42 + k * 0.84, 0.08 + hKeep * 0.62, dK / 2 + 0.01);   /* janelas */
            const TR = 0.27, hT = 1.0 + 0.1 * lv;
            [[-1], [1]].forEach(() => {});
            [[-2.0, -1.0], [2.0, -1.0], [-2.0, 1.0], [2.0, 1.0]].forEach(([x, z], i) => {   /* torres de canto */
                add(new T.CylinderGeometry(TR, TR * 1.08, hT, 16), stoneM(3, hT * 1.7), x, 0.08 + hT / 2, z);
                add(new T.CylinderGeometry(TR + 0.05, TR + 0.05, 0.07, 16), stoneM(3, 0.2), x, 0.08 + hT + 0.03, z);
                add(new T.ConeGeometry(TR + 0.1, 0.62 + 0.04 * lv, 12), roofM, x, 0.08 + hT + 0.07 + (0.62 + 0.04 * lv) / 2, z);   /* telhado azul */
                add(new T.BoxGeometry(0.1, 0.16, 0.03), darkM, x, 0.08 + hT * 0.62, z + (z > 0 ? TR : -TR) + (z > 0 ? 0.0 : 0));
                if (lv >= 3) { const py = 0.08 + hT + 0.07 + 0.62 + 0.04 * lv; add(new T.CylinderGeometry(0.012, 0.012, 0.32, 5), woodM, x, py + 0.16, z); const fl = add(new T.PlaneGeometry(0.2, 0.11), new T.MeshStandardMaterial({ color: ['#d94a3d', '#f3c23a', '#3e6db3', '#d94a3d'][i], side: T.DoubleSide, roughness: 0.8 }), x + 0.1, py + 0.27, z); }
            });
            const wallH = 0.5 + 0.03 * lv;   /* muralha com ameias entre as torres */
            [[-2.0, -1.0, 2.0, -1.0], [-2.0, 1.0, 2.0, 1.0], [-2.0, -1.0, -2.0, 1.0], [2.0, -1.0, 2.0, 1.0]].forEach(([x0, z0, x1, z1], wi) => {
                const horiz = z0 === z1, len = Math.hypot(x1 - x0, z1 - z0) - 2 * TR + 0.1, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
                if (lv < 2 && wi > 0) return;
                if (wi === 1) { const seg = (len - 0.5) / 2; [-1, 1].forEach(sg => add(new T.BoxGeometry(seg, wallH, 0.13), stoneM(seg * 1.6, wallH * 1.6), cx + sg * (0.25 + seg / 2), 0.08 + wallH / 2, cz)); add(new T.BoxGeometry(0.5, wallH * 0.28, 0.15), stoneM(1, 0.4), cx, 0.08 + wallH * 0.86, cz);   /* portão: arco e porta de madeira */ add(new T.BoxGeometry(0.4, wallH * 0.7, 0.05), woodM, cx, 0.08 + wallH * 0.35, cz + 0.02); add(new T.BoxGeometry(0.3, 0.025, 0.55), woodM, cx, 0.09, cz + 0.4); merlonRow(cx - len / 2 + 0.1, cz, cx - 0.35, cz, 3, 0.08 + wallH + 0.05); merlonRow(cx + 0.35, cz, cx + len / 2 - 0.1, cz, 3, 0.08 + wallH + 0.05); return; }
                add(new T.BoxGeometry(horiz ? len : 0.13, wallH, horiz ? 0.13 : len), stoneM((horiz ? len : 0.8) * 1.6, wallH * 1.6), cx, 0.08 + wallH / 2, cz);
                if (horiz) merlonRow(cx - len / 2 + 0.1, cz, cx + len / 2 - 0.1, cz, Math.round(len * 3.2), 0.08 + wallH + 0.05); else merlonRow(cx, cz - len / 2 + 0.1, cx, cz + len / 2 - 0.1, Math.round(len * 3.2), 0.08 + wallH + 0.05);
            });
            if (lv >= 4) { [[-0.6, -0.32], [0.6, -0.32], [-0.6, 0.32], [0.6, 0.32]].forEach(([x, z]) => { const y = 0.08 + hKeep + 0.1; add(new T.CylinderGeometry(0.1, 0.11, 0.22, 10), stoneM(1, 0.6), x, y + 0.11, z); add(new T.ConeGeometry(0.14, 0.3, 10), roofM, x, y + 0.22 + 0.15, z); }); }
            { const mg = new T.BoxGeometry(0.1, 0.1, 0.07), im = new T.InstancedMesh(mg, stoneM(1, 1), merl.length), M = new T.Matrix4(); merl.forEach((m, i) => { M.makeTranslation(m[0], m[1], m[2]); im.setMatrixAt(i, M); }); im.castShadow = !ZOO.lite; root.add(im); }
            return true;
        } catch (e) { try { console.warn('castelo do Covil', e); } catch (e2) {} return false; }
    }
/* ===== cortex/36jn-colony-moinho-fx.js: as hélices do moinho evoluem com o nível: 2 pontas luminosas, 3 halo e faíscas, 4 chamas nas pontas, 5 hélices inteiras em fogo com brasas ===== */
    const MFX = { list: [], pscene: null, G: null };
    const MFX_H5 = [0.217, 1.906, 0.543], MFX_R5 = 1.233, MFX_KM = [0.34, 0.37, 0.40, 0.43, 0.46];   /* centro e raio do giro medidos no moinho nível máx. (escala 0,46) */
    function mfxG() { if (MFX.G && MFX.pscene === CL3.sc) return MFX.G; const T = clTh(), cn = new T.CylinderGeometry(0, 0.5, 1, 7); cn.translate(0, 0.5, 0); const rg = new T.RingGeometry(0.82, 1, 40); MFX.G = { cone: cn, sp: new T.SphereGeometry(0.5, 8, 6), ring: rg }; return MFX.G; }
    function mfxMat(col, op, add) { const T = clTh(), k = col + '|' + op + '|' + (add ? 1 : 0); if (MFX.mc && MFX.mc.s === CL3.sc && MFX.mc[k]) return MFX.mc[k]; if (!MFX.mc || MFX.mc.s !== CL3.sc) MFX.mc = { s: CL3.sc }; return MFX.mc[k] = new T.MeshBasicMaterial({ color: col, transparent: true, opacity: op == null ? 0.9 : op, depthWrite: false, blending: add ? T.AdditiveBlending : T.NormalBlending, side: T.DoubleSide, toneMapped: false }); }
    function clMoinhoFxAttach(grp, lv) {
        try {
            const T = clTh(); if (!T || !grp || lv < 2) return; const pi = grp.userData ? grp.userData.pi : undefined; if (pi === undefined || pi === null) return;
            let bone = null; grp.traverse(o => { if (o.isBone && /Bone0?02.*end/i.test(o.name)) bone = o; }); if (!bone) return;
            const stg = lv >= 5 ? 5 : [1, 1, 2, 4, 5][lv], k = MFX_KM[stg - 1] / 0.46, hub = MFX_H5.map(v => v * k), R = MFX_R5 * k, G = mfxG(), root = new T.Group(); grp.add(root);
            const blades = [], per = lv >= 5 ? 3 : 1;
            for (let b = 0; b < 4; b++) {
                const bl = { tip: null, flames: [], halo: null };
                bl.tip = new T.Mesh(G.sp, mfxMat(lv >= 4 ? '#ff8a00' : '#ffc400', 0.95)); bl.tip.scale.setScalar((lv >= 3 ? 0.16 : 0.11) * k); root.add(bl.tip);
                if (lv >= 4) for (let i = 0; i < per; i++) { const fl = new T.Mesh(G.cone, mfxMat(i % 2 ? '#ff9a00' : '#ff3d00', 0.88)), fi = new T.Mesh(G.cone, mfxMat('#ffc21a', 0.7, true)); root.add(fl); root.add(fi); bl.flames.push({ fl, fi, f: per === 1 ? 1 : 0.3 + 0.7 * i / (per - 1), ph: Math.random() * 6 }); }
                blades.push(bl);
            }
            let halo = null; if (lv >= 3) { halo = new T.Mesh(G.ring, mfxMat(lv >= 5 ? '#ff4a00' : '#ffb000', lv >= 5 ? 0.3 : 0.2, true)); halo.scale.setScalar(R * 1.05); halo.position.set(hub[0], hub[1], hub[2] - 0.02); root.add(halo); }
            const emb = []; if (lv >= 3) for (let i = 0; i < (lv >= 5 ? 12 : 6); i++) { const m = new T.Mesh(G.sp, mfxMat(i % 3 ? '#ff9a00' : '#ff4a00', 0.9, true)); m.visible = false; root.add(m); emb.push({ m, on: false, life: 0, max: 1, vx: 0, vy: 0, x: 0, y: 0, z: 0 }); }
            MFX.list.push({ grp, root, bone, hub, R, k, lv, blades, halo, emb, ph: Math.random() * 6, acc: 0 });
        } catch (er) { try { console.warn('moinho fx', er); } catch (e2) {} }
    }
    function clMoinhoFxStep(dt, t) {
        if (!CL3.sc) return; if (MFX.pscene !== CL3.sc) { MFX.list = []; MFX.G = null; MFX.pscene = CL3.sc; } MFX.list = MFX.list.filter(m => m.grp.parent); if (!MFX.list.length) return; const T = clTh();
        MFX.list.forEach(m => {
            const v = MFX.v || (MFX.v = new T.Vector3()); m.bone.updateWorldMatrix(true, false); m.bone.getWorldPosition(v); m.grp.worldToLocal(v); const th0 = Math.atan2(v.y - m.hub[1], v.x - m.hub[0]), z = m.hub[2];
            m.blades.forEach((bl, b) => {
                const th = th0 + b * Math.PI / 2, cx = Math.cos(th), sy = Math.sin(th); bl.tip.position.set(m.hub[0] + cx * m.R, m.hub[1] + sy * m.R, z);
                bl.tip.scale.setScalar((m.lv >= 3 ? 0.16 : 0.11) * m.k * (0.9 + 0.12 * Math.sin(t * 9 + b + m.ph)));
                bl.flames.forEach(f => {
                    const r = m.R * f.f, fl = 0.75 + 0.45 * Math.sin(t * 14 + f.ph) * Math.sin(t * 9.3 + f.ph * 1.7), hgt = (m.lv >= 5 ? 0.16 + 0.12 * f.f : 0.14) * m.k * fl * 2.0;
                    const px = m.hub[0] + cx * r, py = m.hub[1] + sy * r; f.fl.position.set(px, py, z); f.fi.position.set(px, py, z + 0.01);
                    /* a chama aponta para cima no mundo (calor sobe), com leve inclinação para trás do giro */
                    f.fl.scale.set(0.1 * m.k * (m.lv >= 5 ? 1.3 : 1), hgt, 0.1 * m.k); f.fi.scale.set(0.055 * m.k * (m.lv >= 5 ? 1.3 : 1), hgt * 0.6, 0.055 * m.k); f.fl.rotation.z = -sy * 0.0 + Math.sin(t * 5 + f.ph) * 0.15; f.fi.rotation.z = f.fl.rotation.z;
                });
            });
            if (m.halo) { m.halo.rotation.z = t * 0.6; m.halo.scale.setScalar(m.R * (1.05 + 0.03 * Math.sin(t * 3 + m.ph))); }
            if (m.emb.length) { m.acc += dt * (m.lv >= 5 ? 22 : 7); while (m.acc >= 1) { m.acc -= 1; const q = m.emb.find(e => !e.on); if (!q) break; const bl = m.blades[(Math.random() * 4) | 0], p = bl.tip.position, fr = m.lv >= 5 ? (0.3 + 0.7 * Math.random()) : 1, th = Math.atan2(p.y - m.hub[1], p.x - m.hub[0]); q.on = true; q.life = 0; q.max = 0.7 + Math.random() * 0.8; q.x = m.hub[0] + Math.cos(th) * m.R * fr; q.y = m.hub[1] + Math.sin(th) * m.R * fr; q.z = z + (Math.random() - 0.5) * 0.1; q.vx = (Math.random() - 0.5) * 0.3; q.vy = 0.5 + Math.random() * 0.6; q.m.visible = true; }
                m.emb.forEach(q => { if (!q.on) return; q.life += dt; if (q.life >= q.max) { q.on = false; q.m.visible = false; return; } q.x += q.vx * dt; q.y += q.vy * dt; const u = q.life / q.max; q.m.position.set(q.x, q.y, q.z); q.m.scale.setScalar(0.055 * m.k * (1 - 0.6 * u)); }); }
        });
    }
    window.ruaMoinhoFx = { list: () => MFX.list.length };
    { const h = CLM_CUSTOM_HANDLERS.moinho; if (h && !h.fx) { h.fx = 1; const asm = h.assemble; h.assemble = (grp, lv, cv) => { const r = asm(grp, lv, cv); clMoinhoFxAttach(grp, Math.max(1, lv | 0)); return r; }; } }
/* ===== cortex/36jo-colony-events-fx.js: EVENTOS DA ILHA com aviso e animação: a cápsula desce de paraquedas com facho de luz, o geodo cai como meteoro, e o Mercador Espacial chega numa nave de verdade (luzes, chamas, poeira, rampa e carga). Cada evento avisa com faixa, som e marcador na tela ===== */
    function clUiToast(m) { try { clMsg(m); } catch (e) {} }   /* os eventos chamavam clUiToast, que não existia: por isso nada avisava */
    const EVF = { fx: [], marks: {}, st: {}, bn: null, bnT: 0, grpT: null };
    const evA = k => (CLM.events || {})[k];
    function evG() { const T = clTh(); if (EVF.G && EVF.sc === CL3.sc) return EVF.G; EVF.sc = CL3.sc; EVF.G = { sp: new T.SphereGeometry(0.5, 14, 10), cn: (() => { const g = new T.CylinderGeometry(0, 0.5, 1, 10); g.translate(0, -0.5, 0); return g; })(), cy: new T.CylinderGeometry(0.5, 0.5, 1, 12), hemi: new T.SphereGeometry(0.5, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), ring: new T.RingGeometry(0.85, 1, 40) }; EVF.M = {}; return EVF.G; }
    function evM(col, o) { o = o || {}; const T = clTh(), k = col + JSON.stringify(o); return EVF.M[k] || (EVF.M[k] = o.basic ? new T.MeshBasicMaterial({ color: col, transparent: o.op != null, opacity: o.op == null ? 1 : o.op, blending: o.add ? T.AdditiveBlending : T.NormalBlending, depthWrite: false, side: T.DoubleSide, toneMapped: false }) : new T.MeshStandardMaterial({ color: col, emissive: o.emi || '#000000', emissiveIntensity: o.ei == null ? 0.6 : o.ei, roughness: o.rough == null ? 0.45 : o.rough, metalness: o.metal == null ? 0.4 : o.metal, transparent: o.op != null, opacity: o.op == null ? 1 : o.op })); }
    /* ---------- aviso: faixa no topo + som ---------- */
    function evBanner(kind, ico, title, sub) {
        try { if (!CL.root || !CL.on) return; if (EVF.bn) EVF.bn.remove(); const b = document.createElement('button'); b.type = 'button'; b.className = 'cl-evbn ' + kind; b.dataset.cl = 'ev-go'; b.dataset.k = kind; b.innerHTML = '<span class="ic">' + ico + '</span><span class="tx"><b>' + title + '</b><small>' + sub + '</small></span><span class="go"><i class="ph-bold ph-crosshair"></i>Ver</span>'; CL.root.appendChild(b); EVF.bn = b; EVF.bnT = 7; try { aliveSound('portal'); } catch (e) {} try { clFarmBuzz([30, 60, 30]); } catch (e) {} } catch (e) {}
    }
    function evGo(kind) { const e = evA(kind); if (!e || !e.g) return; try { CL3.gtx = e.g.position.x; CL3.gtz = e.g.position.z; CL3.gdist = Math.min(CL3.gdist, 13); CL3.gpit = Math.max(CL3.gpit, 0.7); clClampCam(); } catch (er) {} }
    /* ---------- partículas simples (poeira, faíscas, fumaça) ---------- */
    function evBurst(x, y, z, col, n, sp, up, life, size, add) {
        const T = clTh(), G = evG(); if (!CL3.sc) return; for (let i = 0; i < n; i++) { const m = new T.Mesh(G.sp, evM(col, { basic: 1, op: 0.9, add })), a = Math.random() * 6.283, v = sp * (0.4 + Math.random() * 0.6); m.position.set(x, y, z); m.scale.setScalar(size * (0.6 + Math.random() * 0.8)); CL3.sc.add(m); EVF.fx.push({ m, vx: Math.cos(a) * v, vz: Math.sin(a) * v, vy: up * (0.5 + Math.random() * 0.8), t: 0, life: life * (0.7 + Math.random() * 0.6), s0: m.scale.x, add }); }
    }
    function evFxStep(dt) { for (let i = EVF.fx.length - 1; i >= 0; i--) { const f = EVF.fx[i]; f.t += dt; if (f.t >= f.life) { if (f.m.parent) f.m.parent.remove(f.m); EVF.fx.splice(i, 1); continue; } f.m.position.x += f.vx * dt; f.m.position.z += f.vz * dt; f.m.position.y += f.vy * dt; f.vy -= (f.add ? -0.2 : 0.8) * dt; const u = f.t / f.life; f.m.scale.setScalar(f.s0 * (f.add ? 1 - u * 0.7 : 1 + u * 1.2)); f.m.material.opacity = 0.9 * (1 - u); } }
    /* ---------- marcador na tela (aponta onde está o evento, mesmo fora da vista) ---------- */
    function evMark(kind, ico, lab, pos) {
        const box = CL.root && CL.root.querySelector('.cl-bubs'); if (!box || !CL3.cam) return; let el = EVF.marks[kind]; if (!pos) { if (el) { el.remove(); delete EVF.marks[kind]; } return; }
        if (!el) { el = document.createElement('button'); el.type = 'button'; el.className = 'cl-evmk ' + kind; el.dataset.cl = 'ev-go'; el.dataset.k = kind; el.innerHTML = '<span class="ic">' + ico + '</span><b>' + lab + '</b><i class="ar"></i>'; box.appendChild(el); EVF.marks[kind] = el; }
        const T = clTh(), v = EVF.v || (EVF.v = new T.Vector3()); v.set(pos[0], pos[1], pos[2]).project(CL3.cam); let x = (v.x + 1) / 2 * CL3.w, y = (1 - v.y) / 2 * CL3.h, off = v.z > 1 || x < 24 || x > CL3.w - 24 || y < 110 || y > CL3.h - 150;
        if (v.z > 1) { x = CL3.w - x; y = CL3.h - y; }
        const cx = Math.max(60, Math.min(CL3.w - 60, x)), cy = Math.max(120, Math.min(CL3.h - 170, y)); el.style.transform = 'translate(' + cx.toFixed(0) + 'px,' + cy.toFixed(0) + 'px) translate(-50%,-50%)'; el.classList.toggle('off', off);
        if (off) { const a = Math.atan2(y - CL3.h / 2, x - CL3.w / 2); el.querySelector('.ar').style.transform = 'rotate(' + a.toFixed(2) + 'rad)'; }
    }
    /* ---------- cápsula: paraquedas listrado, cordas, facho de luz, poeira no pouso ---------- */
    function evChute(e) {
        const T = clTh(), G = evG(), g = new T.Group(), cv = document.createElement('canvas'); cv.width = 256; cv.height = 32; const c2 = cv.getContext('2d'); for (let i = 0; i < 8; i++) { c2.fillStyle = i % 2 ? '#fff6e0' : '#ff5a3a'; c2.fillRect(i * 32, 0, 32, 32); } const tx = new T.CanvasTexture(cv); try { tx.encoding = T.sRGBEncoding; } catch (er) {}
        const dome = new T.Mesh(G.hemi, new T.MeshBasicMaterial({ map: tx, side: T.DoubleSide })); dome.scale.set(2.4, 1.3, 2.4); dome.position.y = 2.2; g.add(dome);
        const pts = []; for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283; pts.push(new T.Vector3(Math.cos(a) * 1.2, 2.2, Math.sin(a) * 1.2), new T.Vector3(0, 0.55, 0)); } const lg = new T.BufferGeometry().setFromPoints(pts); g.add(new T.LineSegments(lg, new T.LineBasicMaterial({ color: '#fff6e0' })));
        e.g.add(g); e.chute = g;
        const beam = new T.Mesh(G.cy, evM('#5ee0ff', { basic: 1, op: 0.16, add: 1 })); beam.scale.set(1.4, 14, 1.4); beam.position.y = 6.5; e.g.add(beam); e.beam = beam;
        const ring = new T.Mesh(G.ring, evM('#5ee0ff', { basic: 1, op: 0.7, add: 1 })); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.03; ring.scale.setScalar(0.8); e.g.add(ring); e.gring = ring;
    }
    /* ---------- meteoro: o geodo só aparece depois do impacto ---------- */
    function evMeteor(e) {
        const T = clTh(), G = evG(), m = new T.Group(), core = new T.Mesh(G.sp, evM('#ffb060', { basic: 1, add: 1, op: 0.95 })); core.scale.setScalar(0.7); m.add(core); const tail = new T.Mesh(G.cn, evM('#ff6a2a', { basic: 1, add: 1, op: 0.6 })); tail.scale.set(0.9, 5, 0.9); tail.rotation.x = Math.PI; tail.position.y = 2.6; m.add(tail);
        m.position.set(e.g.position.x - 8, 22, e.g.position.z - 6); CL3.sc.add(m); e.meteor = { m, t: 0, tx: e.g.position.x, tz: e.g.position.z }; e.g.visible = false;
    }
    /* ---------- nave do Mercador: disco com cúpula, anel de luzes, pernas, motores, rampa ---------- */
    function evBuildShip() {
        const T = clTh(), G = evG(), s = new T.Group(), add = (geo, mat, sx, sy, sz, x, y, z, par) => { const m = new T.Mesh(geo, mat); m.scale.set(sx, sy, sz); m.position.set(x, y, z); (par || s).add(m); return m; };
        const hull = evM('#ff9a3a', { emi: '#7a3a00', ei: 0.35, metal: 0.55 }), steel = evM('#d4dcec', { emi: '#223044', ei: 0.2, metal: 0.8, rough: 0.3 }), dark = evM('#1e2638', { metal: 0.6 });
        add(G.sp, hull, 1.9, 0.5, 1.9, 0, 0.62, 0); add(G.sp, steel, 1.55, 0.22, 1.55, 0, 0.42, 0); add(G.cy, dark, 1.4, 0.1, 1.4, 0, 0.3, 0);
        add(G.hemi, evM('#7ee8ff', { emi: '#1aa0d0', ei: 0.8, op: 0.72, metal: 0.1, rough: 0.1 }), 1.0, 0.9, 1.0, 0, 0.8, 0);
        add(G.sp, evM('#fff6d0', { emi: '#ffd35c', ei: 1 }), 0.28, 0.28, 0.28, 0, 1.05, 0);   /* piloto */
        const lights = []; for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283, l = add(G.sp, evM('#ffe58a', { emi: '#ffcc33', ei: 1.4 }), 0.13, 0.13, 0.13, Math.cos(a) * 0.93, 0.62, Math.sin(a) * 0.93); lights.push(l); }
        const legs = []; for (let i = 0; i < 3; i++) { const a = i / 3 * 6.283 + 0.5, lg = new T.Group(); lg.position.set(Math.cos(a) * 0.7, 0.4, Math.sin(a) * 0.7); s.add(lg); add(G.cy, steel, 0.06, 0.42, 0.06, 0, -0.18, 0, lg); add(G.cy, dark, 0.2, 0.05, 0.2, 0, -0.4, 0, lg); legs.push(lg); }
        const pods = []; [-1, 1].forEach(sd => { add(G.sp, hull, 0.5, 0.34, 0.5, 0, 0.55, sd * 1.15); const fl = add(G.cn, evM('#6ad8ff', { basic: 1, add: 1, op: 0.85 }), 0.3, 0.9, 0.3, 0, 0.42, sd * 1.15); fl.visible = false; pods.push(fl); });
        const ramp = add(G.cy, steel, 0.5, 0.04, 0.8, 0.95, 0.28, 0); ramp.rotation.z = 1.5; ramp.visible = false; const beam = add(G.cy, evM('#8aff9a', { basic: 1, add: 1, op: 0.0 }), 1.1, 1.2, 1.1, 0, 0.3, 0); beam.visible = false;
        add(G.cy, steel, 0.03, 0.5, 0.03, 0, 1.4, 0).rotation.z = 0.15; const red = add(G.sp, evM('#ff5a5a', { emi: '#ff2a2a', ei: 1.6 }), 0.09, 0.09, 0.09, 0.07, 1.65, 0);
        const crates = []; for (let i = 0; i < 3; i++) { const c = add(G.sp, evM(['#ffd35c', '#5ee0ff', '#8aff9a'][i], { emi: ['#aa7a00', '#0a7a9a', '#2a9a40'][i], ei: 0.9 }), 0.22, 0.22, 0.22, 1.5 + i * 0.1, 0.4, (i - 1) * 0.35); c.visible = false; crates.push(c); }
        s.userData.ship = { lights, legs, pods, ramp, beam, red, crates }; return s;
    }
    function evShipDecorate(e) {
        if (e.sh) return; const sh = evBuildShip(); e.g.clear(); e.g.scale.setScalar(1); e.g.add(sh); sh.position.y = -0.1; sh.scale.setScalar(1); e.sh = sh; e.dock = 0;
    }
    function evShipStep(e, dt, t) {
        const S = e.sh.userData.ship, st = e.state, moving = st === 'landing' || st === 'departing';
        S.lights.forEach((l, i) => { l.scale.setScalar(0.1 + 0.07 * (0.5 + 0.5 * Math.sin(t * 6 + i * 0.8))); });
        S.red.visible = Math.sin(t * 5) > 0; S.pods.forEach(p => { p.visible = moving; if (moving) p.scale.set(0.3, 0.7 + 0.4 * Math.sin(t * 40), 0.3); });
        e.sh.rotation.y += dt * (moving ? 1.6 : 0.5);
        if (st === 'landing') { const p = Math.min(1, e.t / 4.5); e.sh.rotation.z = Math.sin(p * 6) * 0.12 * (1 - p); e.sh.rotation.x = 0.08 * (1 - p); if (p > 0.45 && Math.random() < dt * 14) evBurst(e.g.position.x, 0.1, e.g.position.z, '#d8c8a8', 2, 1.4, 0.3, 1.0, 0.3, false); }
        else if (st === 'docked') {
            if (!e.landedFx) { e.landedFx = true; e.sh.rotation.z = 0; e.sh.rotation.x = 0; evBurst(e.g.position.x, 0.1, e.g.position.z, '#d8c8a8', 26, 2.6, 0.5, 1.4, 0.4, false); evBurst(e.g.position.x, 0.4, e.g.position.z, '#ffe58a', 14, 1.8, 1.2, 1.2, 0.1, true); evBanner('ship', '🚀', 'O Mercador pousou!', 'Toque na nave para pegar a carga'); }
            e.dock = Math.min(1, e.dock + dt * 0.8); S.ramp.visible = true; S.ramp.rotation.z = 1.5 - 1.15 * e.dock; S.beam.visible = true; S.beam.material.opacity = 0.22 * e.dock * (0.8 + 0.2 * Math.sin(t * 5)); S.crates.forEach((c, i) => { c.visible = e.dock > 0.5; c.position.y = 0.5 + 0.12 * Math.sin(t * 2.4 + i * 1.6) + 0.1 * i; c.rotation.y = t + i; });
        } else if (st === 'departing') { S.ramp.visible = false; S.beam.visible = false; S.crates.forEach(c => { c.visible = false; }); if (!e.leaveFx) { e.leaveFx = true; evBurst(e.g.position.x, 0.2, e.g.position.z, '#ffe58a', 22, 3, 2.4, 1.2, 0.12, true); } if (Math.random() < dt * 18) evBurst(e.g.position.x, e.g.position.y, e.g.position.z, '#a8d8ff', 1, 0.5, -0.6, 0.9, 0.22, true); e.sh.rotation.z = Math.sin(t * 8) * 0.05; }
    }
    /* ---------- passo a passo, depois dos eventos originais ---------- */
    function clEvFxStep(dt, t) {
        if (!CL3.sc || !clTh() || !CLM.events) return; evG(); const ev = CLM.events;
        /* faixa */ if (EVF.bn) { EVF.bnT -= dt; if (EVF.bnT <= 0 || !EVF.bn.isConnected) { if (EVF.bn.isConnected) EVF.bn.remove(); EVF.bn = null; } }
        /* cápsula */ { const e = ev.supplyDrop; if (e.active && e.g) { if (!e.chute) { evChute(e); evBanner('drop', '📦', 'Cápsula de suprimentos!', 'Desceu de paraquedas na colônia. Toque para resgatar'); }
            const landed = e.y <= e.targetY + 0.01; e.chute.visible = !landed || (e.cf = Math.min(1, (e.cf || 0) + dt * 1.5)) < 1; if (!landed) { e.chute.rotation.z = Math.sin(t * 1.6) * 0.1; e.chute.position.y = 0; if (Math.random() < dt * 10) evBurst(e.g.position.x, e.g.position.y + 0.3, e.g.position.z, '#cfe6ff', 1, 0.2, -0.2, 1.2, 0.2, false); } else { if (!e.dust) { e.dust = true; evBurst(e.x, 0.1, e.z, '#d8c8a8', 22, 2.2, 0.5, 1.3, 0.35, false); evBurst(e.x, 0.3, e.z, '#5ee0ff', 12, 1.6, 1.4, 1.1, 0.1, true); } e.chute.scale.setScalar(Math.max(0.01, 1 - (e.cf || 0))); }
            e.beam.material.opacity = 0.1 + 0.08 * Math.sin(t * 4); e.gring.scale.setScalar(0.8 + 0.25 * (0.5 + 0.5 * Math.sin(t * 3))); evMark('drop', '📦', 'Cápsula', [e.g.position.x, e.g.position.y + 1.2, e.g.position.z]); } else { if (e.chute) e.chute = null; e.dust = false; e.cf = 0; evMark('drop'); } }
        /* geodo */ { const e = ev.geode; if (e.active && e.g) { if (!e.meteor && !e.hit) { evMeteor(e); evBanner('geode', '☄️', 'Meteoro caindo!', 'Um geodo estelar vai cair na costa'); }
            if (e.meteor) { const M = e.meteor; M.t += dt; const p = Math.min(1, M.t / 1.6); M.m.position.set(M.tx - 8 * (1 - p), 22 * (1 - p) * (1 - p) + 0.3, M.tz - 6 * (1 - p)); M.m.rotation.z = -0.35; if (Math.random() < dt * 40) evBurst(M.m.position.x, M.m.position.y, M.m.position.z, '#ff8a3a', 1, 0.4, 0.2, 0.7, 0.35, true);
                if (p >= 1) { CL3.sc.remove(M.m); e.meteor = null; e.hit = true; e.g.visible = true; evBurst(M.tx, 0.2, M.tz, '#ffb060', 30, 3.2, 1.8, 1.0, 0.18, true); evBurst(M.tx, 0.1, M.tz, '#c8b8a8', 20, 2.4, 0.6, 1.5, 0.4, false); try { clFarmBuzz([40, 60, 40]); } catch (er) {} evBanner('geode', '✨', 'Geodo estelar!', 'Caiu na costa. Toque para abrir'); } }
            if (e.hit) evMark('geode', '✨', 'Geodo', [e.g.position.x, e.g.position.y + 1.1, e.g.position.z]); } else { e.hit = false; if (e.meteor) { CL3.sc.remove(e.meteor.m); e.meteor = null; } evMark('geode'); } }
        /* nave */ { const e = ev.shuttle; if (e.active && e.g) { if (!e.sh) { evShipDecorate(e); evBanner('ship', '🛸', 'Uma nave está chegando!', 'O Mercador Espacial vem negociar'); e.landedFx = false; e.leaveFx = false; } evShipStep(e, dt, t); evMark('ship', '🛸', e.state === 'docked' ? 'Mercador' : 'Nave', [e.g.position.x, e.g.position.y + 1.6, e.g.position.z]); } else { if (e.sh) e.sh = null; evMark('ship'); } }
        evFxStep(dt);
    }
    function clEvClick(w, b) { if (w !== 'ev-go') return false; if (b.classList.contains('cl-evmk') && clTapInteractive(0, 0, b.dataset.k)) return true; evGo(b.dataset.k); try { if (EVF.bn) { EVF.bn.remove(); EVF.bn = null; } } catch (e) {} return true; }
    window.ruaEvFx = { dbg: () => { const e = CLM.events; return { sup: [e.supplyDrop.active, +e.supplyDrop.timer.toFixed(1), !!(CLM.tpl['supply_crate.glb'] && CLM.tpl['supply_crate.glb'].gl)], shu: [e.shuttle.active, +e.shuttle.timer.toFixed(1), e.shuttle.state, !!(CLM.tpl['spaceship_shuttle.glb'] && CLM.tpl['spaceship_shuttle.glb'].gl)], geo: [e.geode.active], loaded: Object.keys(CLM.tpl).length, failed: Object.keys(CLM.failed || {}) }; }, alert: evBanner, go: evGo, force: k => { const E = clEvTimes(clS()); if (k === 'supplyDrop') E.d = 0; else if (k === 'shuttle') E.n = 0; else if (k === 'geode') E.g = 0; } };
