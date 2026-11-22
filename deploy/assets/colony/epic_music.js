/* Músicas épicas da Colônia — sintetizadas no navegador (sem arquivos de áudio).
   API: EpicMusic.play(nome, {fade}) · .stop(fade) · .setMuted(bool) · .setEnabled(bool) · .enabled()
   Temas: 'battle', 'boss', 'map' (em laço); 'evo', 'victory', 'defeat' (tocam uma vez). 2026-11-17, Claude */
(function () {
    'use strict';
    if (window.EpicMusic) return;
    const KEY = 'cestille_epic_music';
    let ctx = null, bus = null, comp = null, master = null, rev = null, noiseBuf = null;
    let enabled = true, rtMuted = false, cur = null, timer = 0, VOL = 0.5;
    try { enabled = localStorage.getItem(KEY) !== '0'; } catch (e) {}
    const hz = m => 440 * Math.pow(2, (m - 69) / 12);

    function ensure() {
        if (ctx) { if (ctx.state === 'suspended') { try { ctx.resume(); } catch (e) {} } return ctx; }
        const C = window.AudioContext || window.webkitAudioContext; if (!C) return null;
        ctx = new C();
        master = ctx.createGain(); master.gain.value = (enabled && !rtMuted) ? VOL : 0;
        comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.knee.value = 20; comp.ratio.value = 4; comp.attack.value = 0.01; comp.release.value = 0.3;
        bus = ctx.createGain(); bus.gain.value = 1;
        // reverb de salão grande (ruído com decaimento)
        /* celular: reverb mais curta e mono (a convolução longa e estéreo é a parte mais pesada do áudio e faz o som engasgar) */
        let touch = false; try { touch = !!(window.matchMedia && matchMedia('(pointer:coarse)').matches); } catch (e) {}
        const nch = touch ? 1 : 2, len = Math.floor(ctx.sampleRate * (touch ? 1.6 : 2.8)), ir = ctx.createBuffer(nch, len, ctx.sampleRate);
        for (let c = 0; c < nch; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
        rev = ctx.createConvolver(); rev.buffer = ir; const wet = ctx.createGain(); wet.gain.value = 0.42;
        bus.connect(comp); bus.connect(rev); rev.connect(wet); wet.connect(comp); comp.connect(master); master.connect(ctx.destination);
        noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); const nd = noiseBuf.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
        document.addEventListener('visibilitychange', () => { try { if (!ctx) return; if (document.hidden) ctx.suspend(); else ctx.resume(); } catch (e) {} });
        return ctx;
    }
    function applyLevel() { if (!ctx) return; const now = ctx.currentTime; master.gain.cancelScheduledValues(now); master.gain.setValueAtTime(master.gain.value, now); master.gain.linearRampToValueAtTime((enabled && !rtMuted) ? VOL : 0, now + 0.25); }

    /* ---------- instrumentos ---------- */
    function env(g, t, a, d, s, r, dur, peak) {   // ataque, queda, sustentação, soltura
        const p = g.gain; p.setValueAtTime(0.0001, t); p.linearRampToValueAtTime(peak, t + a);
        p.linearRampToValueAtTime(peak * s, t + a + d); p.setValueAtTime(peak * s, t + Math.max(a + d, dur)); p.exponentialRampToValueAtTime(0.0001, t + Math.max(a + d, dur) + r);
        return t + Math.max(a + d, dur) + r + 0.05;
    }
    function osc(type, f, t, end, det) { const o = ctx.createOscillator(); o.type = type; o.frequency.value = f; if (det) o.detune.value = det; o.start(t); o.stop(end); return o; }
    function strings(out, t, m, dur, v, stac) {
        const g = ctx.createGain(), lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = stac ? 2600 : 1900; lp.Q.value = 0.4;
        const end = env(g, t, stac ? 0.012 : 0.3, 0.08, 0.85, stac ? 0.08 : 0.5, dur, v * 0.16);
        [-9, 0, 9].forEach(d => { const o = osc('sawtooth', hz(m), t, end, d); o.connect(lp); }); lp.connect(g); g.connect(out);
    }
    function brass(out, t, m, dur, v) {
        const g = ctx.createGain(), lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 1.2;
        lp.frequency.setValueAtTime(500, t); lp.frequency.exponentialRampToValueAtTime(3400, t + 0.12); lp.frequency.exponentialRampToValueAtTime(1700, t + Math.max(0.3, dur));
        const end = env(g, t, 0.07, 0.12, 0.8, 0.18, dur, v * 0.2);
        [-5, 5].forEach(d => { const o = osc('sawtooth', hz(m), t, end, d); o.connect(lp); }); const o2 = osc('square', hz(m - 12), t, end, 0); const g2 = ctx.createGain(); g2.gain.value = 0.35; o2.connect(g2); g2.connect(lp);
        lp.connect(g); g.connect(out);
    }
    function choir(out, t, m, dur, v) {   // "aaah" com formantes e vibrato
        const g = ctx.createGain(), mix = ctx.createGain(); mix.gain.value = 1; const end = env(g, t, 0.55, 0.2, 0.9, 0.9, dur, v * 0.2);
        const lfo = osc('sine', 5.2, t, end, 0), lg = ctx.createGain(); lg.gain.value = 7; lfo.connect(lg);
        [['triangle', 0], ['sawtooth', 6], ['sine', -6]].forEach(a => { const o = osc(a[0], hz(m), t, end, a[1]); lg.connect(o.detune); o.connect(mix); });
        [[800, 5, 1], [1250, 7, 0.7], [2600, 9, 0.35]].forEach(f => { const b = ctx.createBiquadFilter(); b.type = 'bandpass'; b.frequency.value = f[0]; b.Q.value = f[1]; const fg = ctx.createGain(); fg.gain.value = f[2]; mix.connect(b); b.connect(fg); fg.connect(g); });
        g.connect(out);
    }
    function harp(out, t, m, v) {
        const g = ctx.createGain(); const end = env(g, t, 0.004, 0.5, 0.0001, 0.05, 0.02, v * 0.22);
        const o = osc('triangle', hz(m), t, end, 0), o2 = osc('sine', hz(m + 12), t, end, 0), g2 = ctx.createGain(); g2.gain.value = 0.4; o.connect(g); o2.connect(g2); g2.connect(g); g.connect(out);
    }
    function sub(out, t, m, dur, v) {
        const g = ctx.createGain(), lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 320; const end = env(g, t, 0.01, 0.1, 0.8, 0.12, dur, v * 0.5);
        const o = osc('sine', hz(m), t, end, 0), o2 = osc('sawtooth', hz(m), t, end, 0), g2 = ctx.createGain(); g2.gain.value = 0.25; o.connect(lp); o2.connect(g2); g2.connect(lp); lp.connect(g); g.connect(out);
    }
    function noise(out, t, dur, type, f1, f2, peak, a) {
        const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true; const f = ctx.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(f1, t); if (f2) f.frequency.exponentialRampToValueAtTime(f2, t + dur); f.Q.value = 0.8;
        const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + (a || 0.005)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        s.connect(f); f.connect(g); g.connect(out); s.start(t); s.stop(t + dur + 0.05);
    }
    function drum(out, t, kind, v) {
        if (kind === 'taiko' || kind === 'timp') {
            const g = ctx.createGain(), o = ctx.createOscillator(); o.type = 'sine'; const f0 = kind === 'taiko' ? 150 : 110, f1 = kind === 'taiko' ? 48 : 78;
            o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + 0.22); g.gain.setValueAtTime(v * 0.9, t); g.gain.exponentialRampToValueAtTime(0.0001, t + (kind === 'taiko' ? 0.75 : 1.1));
            o.connect(g); g.connect(out); o.start(t); o.stop(t + 1.2); noise(out, t, 0.12, 'lowpass', 600, 200, v * 0.5);
        } else if (kind === 'snare') { noise(out, t, 0.22, 'bandpass', 2100, 1500, v * 0.55); const g = ctx.createGain(), o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(220, t); o.frequency.exponentialRampToValueAtTime(130, t + 0.1); g.gain.setValueAtTime(v * 0.35, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14); o.connect(g); g.connect(out); o.start(t); o.stop(t + 0.2); }
        else if (kind === 'crash') noise(out, t, 3.2, 'highpass', 4200, 5200, v * 0.5, 0.01);
    }
    function boom(out, t, v, long) {   // impacto grave de "fim de cena": seno que despenca + estrondo
        const g = ctx.createGain(), o = ctx.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(92, t); o.frequency.exponentialRampToValueAtTime(28, t + 0.9);
        g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + (long ? 5.2 : 3.2)); o.connect(g); g.connect(out); o.start(t); o.stop(t + 5.6);
        const o2 = ctx.createOscillator(), g2 = ctx.createGain(); o2.type = 'sine'; o2.frequency.setValueAtTime(46, t); o2.frequency.exponentialRampToValueAtTime(24, t + 2); g2.gain.setValueAtTime(v * 0.8, t); g2.gain.exponentialRampToValueAtTime(0.0001, t + (long ? 5.6 : 3.6)); o2.connect(g2); g2.connect(out); o2.start(t); o2.stop(t + 6);
        noise(out, t, long ? 3.2 : 1.8, 'lowpass', 240, 70, v * 0.55, 0.01);
    }
    function rumble(out, t, dur, v) { noise(out, t, dur, 'lowpass', 70, 130, v, dur * 0.7); }
    function braam(out, t, m, dur, v) {   // metal grave de trailer
        const g = ctx.createGain(), lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 2;
        lp.frequency.setValueAtTime(140, t); lp.frequency.exponentialRampToValueAtTime(1100, t + 0.35); lp.frequency.exponentialRampToValueAtTime(220, t + dur);
        const end = env(g, t, 0.18, 0.2, 0.85, 0.6, dur, v * 0.28);
        [-14, -5, 5, 14].forEach(d => { const o = osc('sawtooth', hz(m), t, end, d); o.connect(lp); }); const so = osc('sine', hz(m - 12), t, end, 0), sg = ctx.createGain(); sg.gain.value = 0.9; so.connect(sg); sg.connect(lp);
        lp.connect(g); g.connect(out);
    }
    function riser(out, t, dur, v) { noise(out, t, dur, 'bandpass', 300, 7000, v * 0.5, dur * 0.9); }

    /* ---------- partituras ---------- */
    const R = { D: 38, Bb: 34, F: 41, C: 36, G: 43, A: 45 };   // raízes graves (oitava 2)
    const tri = (r, minor) => [r + 24, r + 24 + (minor ? 3 : 4), r + 24 + 7];   // acorde na oitava 4
    function drumsBattle(o, t, spb, bar, hard) {
        const st = spb / 4;
        [0, 6, 8, 11].forEach(s => drum(o, t + s * st, 'taiko', 0.7));
        [4, 12].forEach(s => drum(o, t + s * st, 'snare', 0.55));
        if (hard) for (let s = 0; s < 16; s += 2) if (s % 4 !== 0) drum(o, t + s * st, 'taiko', 0.35);
        if (bar % 4 === 0) drum(o, t, 'crash', 0.22);
        if (bar % 8 === 7) for (let s = 12; s < 16; s++) drum(o, t + s * st, 'timp', 0.35 + s * 0.03);
    }
    const BATTLE = {
        bpm: 138, bars: 8,
        chords: [['D', 1], ['Bb', 0], ['F', 0], ['C', 0], ['D', 1], ['Bb', 0], ['G', 1], ['A', 0]],
        mel: [[[0, 69, 4], [4, 74, 4], [8, 72, 2], [10, 70, 2], [12, 69, 4]], [[0, 70, 4], [4, 74, 4], [8, 77, 4], [12, 74, 4]], [[0, 72, 4], [4, 77, 4], [8, 76, 2], [10, 74, 2], [12, 72, 4]], [[0, 72, 4], [4, 76, 4], [8, 79, 8]],
            [[0, 77, 4], [4, 81, 4], [8, 79, 2], [10, 77, 2], [12, 74, 4]], [[0, 74, 4], [4, 77, 4], [8, 82, 4], [12, 81, 4]], [[0, 79, 4], [4, 77, 4], [8, 74, 4], [12, 72, 4]], [[0, 73, 4], [4, 76, 4], [8, 81, 8]]],
        bar(o, t, b, spb) {
            const ch = this.chords[b % 8], root = R[ch[0]], tr = tri(root, ch[1]), st = spb / 4;
            for (let s = 0; s < 16; s += 2) sub(o, t + s * st, root + (s === 6 || s === 14 ? 12 : 0), st * 1.6, 0.8);
            [0, 2, 4, 6, 8, 10, 12, 14].forEach((s, i) => strings(o, t + s * st, tr[[0, 1, 2, 1][i % 4]] + (i % 4 === 2 ? 12 : 0), st * 1.5, 0.75, true));
            tr.forEach(n => choir(o, t, n + 12, spb * 4, 0.7));
            this.mel[b % 8].forEach(n => brass(o, t + n[0] * st, n[1] - 12, n[2] * st * 0.95, 0.9));
            if (b % 4 === 0) { boom(o, t, 0.8); braam(o, t, root, spb * 2, 0.7); }
            drumsBattle(o, t, spb, b, false);
        }
    };
    const BOSS = {
        bpm: 158, bars: 8,
        chords: [['D', 1], ['D', 1], ['Bb', 0], ['A', 0], ['D', 1], ['D', 1], ['G', 1], ['A', 0]],
        mel: [[[0, 74, 3], [3, 74, 1], [4, 77, 4], [8, 76, 3], [11, 74, 1], [12, 72, 4]], [[0, 74, 3], [3, 74, 1], [4, 81, 4], [8, 79, 4], [12, 77, 4]], [[0, 70, 3], [3, 70, 1], [4, 74, 4], [8, 77, 4], [12, 79, 4]], [[0, 73, 4], [4, 76, 4], [8, 81, 8]],
            [[0, 74, 3], [3, 74, 1], [4, 77, 4], [8, 82, 4], [12, 81, 4]], [[0, 86, 4], [4, 84, 4], [8, 82, 4], [12, 81, 4]], [[0, 79, 3], [3, 79, 1], [4, 77, 4], [8, 74, 4], [12, 70, 4]], [[0, 73, 2], [2, 76, 2], [4, 81, 4], [8, 85, 8]]],
        bar(o, t, b, spb) {
            const ch = this.chords[b % 8], root = R[ch[0]], tr = tri(root, ch[1]), st = spb / 4;
            if (b % 2 === 0) braam(o, t, root, spb * 2, 1);   // "braam" grave
            if (b % 4 === 0) boom(o, t, 1);
            for (let s = 0; s < 16; s++) if (s % 4 !== 2) sub(o, t + s * st, root, st * 0.9, 0.9);   // galope
            for (let s = 0; s < 16; s += 2) strings(o, t + s * st, tr[(s / 2) % 3] + 12, st * 1.5, 0.8, true);
            tr.forEach(n => choir(o, t, n + 12, spb * 4, 0.8)); choir(o, t, root + 36, spb * 4, 0.5);
            this.mel[b % 8].forEach(n => brass(o, t + n[0] * st, n[1] - 12, n[2] * st * 0.95, 1));
            drumsBattle(o, t, spb, b, true);
        }
    };
    const MAP = {
        bpm: 76, bars: 8,
        chords: [['D', 1], ['Bb', 0], ['F', 0], ['C', 0], ['D', 1], ['Bb', 0], ['G', 1], ['A', 0]],
        mel: [[[0, 74, 8], [8, 77, 8]], [[0, 77, 8], [8, 74, 8]], [[0, 72, 8], [8, 76, 8]], [[0, 79, 16]], [[0, 77, 8], [8, 81, 8]], [[0, 82, 8], [8, 81, 8]], [[0, 79, 8], [8, 74, 8]], [[0, 76, 8], [8, 73, 8]]],
        bar(o, t, b, spb) {
            const ch = this.chords[b % 8], root = R[ch[0]], tr = tri(root, ch[1]), st = spb / 4;
            tr.forEach(n => strings(o, t, n, spb * 4, 0.55)); sub(o, t, root, spb * 4, 0.5);
            [0, 1, 2, 3, 4, 3, 2, 1, 0, 1, 2, 3, 4, 3, 2, 1].forEach((i, k) => harp(o, t + k * st, tr[i % 3] + 12 * Math.floor(i / 3), 0.45));
            if (b % 4 === 0) { boom(o, t, 0.6); rumble(o, t, spb * 3, 0.4); }
            tr.forEach(n => choir(o, t, n + 24, spb * 4, 0.45));
            this.mel[b % 8].forEach(n => choir(o, t + n[0] * st, n[1], n[2] * st * 0.98, 0.7));
            if (b % 2 === 0) drum(o, t, 'timp', 0.45); if (b % 4 === 0) drum(o, t, 'crash', 0.2);
        }
    };
    function T2(o, t) {   // acorde final da vitória: grave e largo
        boom(o, t, 1.2); drum(o, t, 'timp', 1); drum(o, t, 'taiko', 1); drum(o, t, 'crash', 0.3);
        [38, 45, 50, 57, 62].forEach(n => { braam(o, t, n, 3.4, 0.7); strings(o, t, n, 4, 0.8); }); [50, 57, 62, 66].forEach(n => choir(o, t, n, 5, 0.85)); rumble(o, t, 3, 0.7);
    }
    /* temas de uma vez só: lista de eventos com tempo em segundos */
    function once(name, o, t0) {
        if (name === 'evo') {
            const T = (s, fn) => fn(t0 + s);
            T(0, t => { rumble(o, t, 2, 0.5); sub(o, t, 26, 2.2, 1.1); sub(o, t, 38, 2.2, 0.8); strings(o, t, 38, 2.2, 0.9); strings(o, t, 45, 2.2, 0.8); riser(o, t, 1.8, 0.7); });
            let rt = 0.25, gap = 0.55; while (rt < 1.75) { drum(o, t0 + rt, 'timp', 0.35 + rt * 0.3); rt += gap; gap = Math.max(0.16, gap * 0.84); }
            T(1.8, t => {   // O IMPACTO
                boom(o, t, 1.15); drum(o, t, 'taiko', 1); drum(o, t + 0.02, 'timp', 1); drum(o, t, 'crash', 0.35);
                braam(o, t, 38, 3.4, 1); braam(o, t, 45, 3.4, 0.8); braam(o, t, 50, 3.4, 0.6); [50, 57, 62].forEach(n => choir(o, t, n, 5, 0.9)); [38, 45, 50].forEach(n => strings(o, t, n, 4.5, 0.9));
            });
            [[2.9, 38, 1.0], [4.0, 41, 1.0]].forEach(n => { brass(o, t0 + n[0], n[1], n[2], 0.8); drum(o, t0 + n[0], 'taiko', 0.8); sub(o, t0 + n[0], n[1] - 12, n[2], 1); });
            T(5.3, t => {   // FIM DE CENA: queda grave longa
                boom(o, t, 1.3, true); rumble(o, t, 3.5, 0.9); braam(o, t, 26, 3.2, 1); drum(o, t, 'taiko', 1); [38, 45, 50].forEach(n => strings(o, t, n, 3.2, 0.9));
            });
            return 9;
        }
        if (name === 'victory') {
            [0, 0.5, 1.0, 1.5].forEach((s, i) => drum(o, t0 + s, 'taiko', 0.7 + i * 0.07));
            braam(o, t0 + 0.2, 38, 1.4, 0.8); sub(o, t0, 26, 2.2, 0.9);
            T2(o, t0 + 2.0);
            return 8;
        }
        if (name === 'defeat') {
            rumble(o, t0, 5, 0.7); sub(o, t0, 26, 6, 1.1); sub(o, t0, 38, 6, 0.8); strings(o, t0, 38, 6, 0.7); strings(o, t0, 41, 6, 0.6);
            [[0, 1.4], [1.6, 1.4], [3.2, 2]].forEach((n, i) => { braam(o, t0 + n[0], [38, 36, 33][i], n[1] + 0.3, 0.9); drum(o, t0 + n[0], 'timp', 0.8); });
            boom(o, t0 + 4.8, 1.2, true);
            return 9;
        }
        return 0;
    }

    /* ---------- controle ---------- */
    const LOOPS = { battle: BATTLE, boss: BOSS, map: MAP };
    function stopCur(fade) {
        const c = cur; if (!c) return; cur = null; clearInterval(timer); timer = 0;
        try { const now = ctx.currentTime; c.out.gain.cancelScheduledValues(now); c.out.gain.setValueAtTime(c.out.gain.value, now); c.out.gain.linearRampToValueAtTime(0.0001, now + Math.max(0.05, fade)); setTimeout(() => { try { c.out.disconnect(); } catch (e) {} }, (fade + 0.4) * 1000 + 3500); } catch (e) {}
    }
    function play(name, opt) {
        try {
            if (!ensure()) return false; opt = opt || {};
            if (cur && cur.name === name && LOOPS[name]) return true;
            const fadeIn = opt.fade == null ? 1.2 : opt.fade; stopCur(fadeIn);
            const out = ctx.createGain(); out.gain.setValueAtTime(0.0001, ctx.currentTime); out.gain.linearRampToValueAtTime(1, ctx.currentTime + (LOOPS[name] ? fadeIn : 0.05)); out.connect(bus);
            const me = { name, out };
            if (LOOPS[name]) {
                const th = LOOPS[name], spb = 60 / th.bpm; let nt = ctx.currentTime + 0.08, bar = 0; cur = me;
                const tick = () => { while (cur === me && nt < ctx.currentTime + 0.5) { th.bar(out, nt, bar, spb); nt += spb * 4; bar++; } };
                tick(); timer = setInterval(tick, 120);
            } else {
                cur = me; const len = once(name, out, ctx.currentTime + 0.08);
                setTimeout(() => { if (cur === me) stopCur(1.2); }, (len + 0.5) * 1000);
            }
            return true;
        } catch (e) { try { console.warn('EpicMusic', e); } catch (e2) {} return false; }
    }
    window.EpicMusic = {
        audioCtx: () => ctx,   /* o mesmo áudio (já liberado por um toque) serve aos sons dos golpes */
        play, stop(fade) { try { stopCur(fade == null ? 1 : fade); } catch (e) {} },
        setMuted(b) { rtMuted = !!b; applyLevel(); },
        setEnabled(b) { enabled = !!b; try { localStorage.setItem(KEY, enabled ? '1' : '0'); } catch (e) {} applyLevel(); },
        _ctx() { return ctx }, enabled() { return enabled }, current() { return cur ? cur.name : '' }, volume(v) { VOL = Math.max(0, Math.min(1, v)); applyLevel(); }
    };
})();
