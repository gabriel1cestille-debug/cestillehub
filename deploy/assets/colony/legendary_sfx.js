(function () {
    'use strict';
    /* Sons cinematográficos masterizados via WebAudio (8 Lendários individuais + 5 Elementos para todos os outros 22 dragões · 0 bloqueio no Safari Mac/iPhone!) */
    const LEGENDARY_IDS = new Set([
        'vigia', 'eclipse', 'morcego', 'hamster',
        'demonio_cinzas', 'colosso_obsidiana', 'arquimago_astral', 'nimbo'
    ]);
    const ELEMENTAL_IDS = new Set(['fogo', 'agua', 'terra', 'cristal', 'estelar']);
    const VER = '5';
    const BASE_LEG = './assets/colony/sfx/legendary/';
    const BASE_EL = './assets/colony/sfx/elemental/';
    const bufCache = Object.create(null);
    const fetching = Object.create(null);
    const activeNodes = [];
    const lastPlay = Object.create(null);
    let sharedCtx = null;

    /* Volume próprio da batalha (obedece o botão 🔊 da batalha via chamador, nunca silencia os Lendários por causa do cfg do Hub) */
    function getVolume(isSpecial, isElemental) {
        try {
            const sd = window.ruaSound;
            const cfg = (sd && sd.cfg) || { master: 0.85, fx: 0.85 };
            const m = Math.max(0.55, Math.min(1, Number(cfg.master ?? 0.85)));
            const f = Math.max(0.55, Math.min(1, Number(cfg.fx ?? 0.85)));
            const base = isElemental ? (isSpecial ? 0.86 : 0.62) : (isSpecial ? 1.0 : 0.84);
            return Math.max(isElemental ? 0.48 : 0.68, Math.min(1.15, base * m * f * 1.4));
        } catch (e) {
            return isElemental ? (isSpecial ? 0.8 : 0.58) : (isSpecial ? 0.96 : 0.82);
        }
    }

    function ensureBuf(ctx, key, url, onReady) {
        if (bufCache[key]) { if (onReady) onReady(bufCache[key]); return; }
        if (fetching[key]) { if (onReady) fetching[key].push(onReady); return; }
        fetching[key] = onReady ? [onReady] : [];
        fetch(url).then(r => r.ok ? r.arrayBuffer() : null).then(ab => {
            if (!ab || !ctx) { delete fetching[key]; return; }
            ctx.decodeAudioData(ab.slice(0), buf => {
                bufCache[key] = buf;
                const cbs = fetching[key] || []; delete fetching[key];
                cbs.forEach(fn => { try { fn(buf); } catch (e) {} });
            }, () => { delete fetching[key]; });
        }).catch(() => { delete fetching[key]; });
    }

    function fadeStop(v) {
        if (!v) return;
        try {
            const t = v.ctx.currentTime;
            v.gn.gain.cancelScheduledValues(t);
            v.gn.gain.setValueAtTime(Math.max(0.0001, v.gn.gain.value), t);
            v.gn.gain.linearRampToValueAtTime(0.0001, t + 0.03);
            v.src.stop(t + 0.04);
        } catch (e) { try { v.src.stop(); } catch (e2) {} }
    }

    function playBuffer(ctx, buf, vol, isSpecial, rate) {
        try {
            if (ctx.state === 'suspended') { try { ctx.resume(); } catch (e) {} }
            const maxPoly = isSpecial ? 4 : 3;
            while (activeNodes.length >= maxPoly) fadeStop(activeNodes.shift());
            const src = ctx.createBufferSource();
            src.buffer = buf;
            if (rate && rate !== 1) src.playbackRate.value = rate;
            const gn = ctx.createGain(), t = ctx.currentTime;
            gn.gain.setValueAtTime(0.0001, t);
            gn.gain.linearRampToValueAtTime(vol, t + 0.006);
            src.connect(gn);
            gn.connect(typeof window.warSfxBus === 'function' ? window.warSfxBus(ctx) : ctx.destination);
            const voice = { src, gn, ctx };
            activeNodes.push(voice);
            src.onended = () => {
                const idx = activeNodes.indexOf(voice);
                if (idx >= 0) activeNodes.splice(idx, 1);
            };
            src.start(0);
        } catch (e) {}
    }

    window.preloadLegendarySfx = function preloadLegendarySfx(ctx, ids) {
        if (ctx) sharedCtx = ctx;
        const c = ctx || sharedCtx;
        if (!c) return;
        const list = Array.isArray(ids) && ids.length ? ids.filter(id => LEGENDARY_IDS.has(id)) : Array.from(LEGENDARY_IDS);
        list.forEach(id => {
            ensureBuf(c, 'leg_' + id + '_n', BASE_LEG + id + '_normal.m4a?v=' + VER);
            ensureBuf(c, 'leg_' + id + '_s', BASE_LEG + id + '_especial.m4a?v=' + VER);
        });
    };

    window.preloadElementalSfx = function preloadElementalSfx(ctx, els) {
        if (ctx) sharedCtx = ctx;
        const c = ctx || sharedCtx;
        if (!c) return;
        const set = new Set((Array.isArray(els) && els.length ? els : Array.from(ELEMENTAL_IDS)).filter(e => ELEMENTAL_IDS.has(e)));
        set.forEach(el => {
            ensureBuf(c, 'el_' + el + '_n', BASE_EL + el + '_normal.m4a?v=' + VER);
            ensureBuf(c, 'el_' + el + '_s', BASE_EL + el + '_especial.m4a?v=' + VER);
        });
    };

    window.playLegendarySfx = function playLegendarySfx(speciesId, isSpecial, ctxArg) {
        if (!speciesId || !LEGENDARY_IDS.has(speciesId)) return false;
        const vol = getVolume(!!isSpecial, false);
        if (ctxArg) sharedCtx = ctxArg;

        const key = 'leg_' + speciesId + (isSpecial ? '_s' : '_n');
        const now = performance.now();
        const cooldownMs = isSpecial ? 420 : 280;
        if (now - (lastPlay[key] || 0) < cooldownMs) return true;
        lastPlay[key] = now;

        const url = BASE_LEG + speciesId + '_' + (isSpecial ? 'especial' : 'normal') + '.m4a?v=' + VER;
        const ctx = ctxArg || sharedCtx;
        if (ctx) {
            if (bufCache[key]) playBuffer(ctx, bufCache[key], vol, !!isSpecial, 1);
            else ensureBuf(ctx, key, url, buf => playBuffer(ctx, buf, vol, !!isSpecial, 1));
            return true;
        }
        try { const a = new Audio(url); a.volume = Math.min(1, vol); const pr = a.play(); if (pr && pr.catch) pr.catch(() => {}); return true; } catch (e) { return false; }
    };

    window.playElementalSfx = function playElementalSfx(el, isSpecial, ctxArg) {
        const eid = ELEMENTAL_IDS.has(el) ? el : 'terra';
        const vol = getVolume(!!isSpecial, true);
        if (ctxArg) sharedCtx = ctxArg;

        const key = 'el_' + eid + (isSpecial ? '_s' : '_n');
        const now = performance.now();
        const cooldownMs = isSpecial ? 320 : 170;
        if (now - (lastPlay[key] || 0) < cooldownMs) return true;
        lastPlay[key] = now;

        const url = BASE_EL + eid + '_' + (isSpecial ? 'especial' : 'normal') + '.m4a?v=' + VER;
        const rate = 0.94 + Math.random() * 0.12;
        const ctx = ctxArg || sharedCtx;
        if (ctx) {
            if (bufCache[key]) playBuffer(ctx, bufCache[key], vol, !!isSpecial, rate);
            else ensureBuf(ctx, key, url, buf => playBuffer(ctx, buf, vol, !!isSpecial, rate));
            return true;
        }
        return false;
    };

    window.hasLegendarySfx = function hasLegendarySfx(id) { return LEGENDARY_IDS.has(id); };
    window.hasElementalSfx = function hasElementalSfx(el) { return ELEMENTAL_IDS.has(el); };

    window.stopLegendarySfx = function stopLegendarySfx() {
        while (activeNodes.length) fadeStop(activeNodes.pop());
    };
})();
