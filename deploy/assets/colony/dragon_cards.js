(function () {
    'use strict';
    /* Motor Ultra-Leve de Cartas (Fusão A+B · 0 Canvas · 0 WebGL · 0 SVG Blur · 60 FPS) */
    window.CestilleDragonCards = true;

    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = './assets/colony/dragon_cards.css?v=lite24';
    document.head.appendChild(css);

    const RARITIES = [
        { n: 'Comum', col: '#9aa7ba', hi: '#e2e8f0', sym: '◆' },
        { n: 'Incomum', col: '#10b981', hi: '#a7f3d0', sym: '❖' },
        { n: 'Raro', col: '#0ea5e9', hi: '#bae6fd', sym: '✦' },
        { n: 'Épico', col: '#a855f7', hi: '#f5d0fe', sym: '✧' },
        { n: 'Lendário', col: '#f59e0b', hi: '#fef08a', sym: '♛' }
    ];

    const EL_COLORS = {
        terra: '#4ade80', agua: '#38bdf8', cristal: '#c084fc', estelar: '#fbbf24',
        fogo: '#fb7185', vento: '#6ee7b7', sombra: '#c084fc', magma: '#fb7185', aurora: '#38bdf8'
    };

    function rarityFrameSVG(rk) {
        const R = RARITIES[rk] || RARITIES[0];
        if (rk === 0) return '<svg class="cf-frame-svg" viewBox="0 0 200 310" preserveAspectRatio="none" aria-hidden="true"><circle cx="11" cy="11" r="2.2" fill="' + R.hi + '" opacity=".75"/><circle cx="189" cy="11" r="2.2" fill="' + R.hi + '" opacity=".75"/><circle cx="11" cy="299" r="2.2" fill="' + R.hi + '" opacity=".75"/><circle cx="189" cy="299" r="2.2" fill="' + R.hi + '" opacity=".75"/></svg>';
        if (rk === 1) return '<svg class="cf-frame-svg" viewBox="0 0 200 310" preserveAspectRatio="none" aria-hidden="true"><path d="M8 32 V14 L14 8 H32 M168 8 H186 L192 14 V32 M8 278 V296 L14 302 H32 M168 302 H186 L192 296 V278" fill="none" stroke="' + R.hi + '" stroke-width="1.7" opacity=".8"/><polygon points="14,14 18,18 14,22 10,18" fill="' + R.col + '" stroke="' + R.hi + '" stroke-width=".9"/><polygon points="186,14 190,18 186,22 182,18" fill="' + R.col + '" stroke="' + R.hi + '" stroke-width=".9"/></svg>';
        if (rk === 2) return '<svg class="cf-frame-svg" viewBox="0 0 200 310" preserveAspectRatio="none" aria-hidden="true"><path d="M7 44 V14 L16 6 H44 M156 6 H184 L193 14 V44 M7 266 V296 L16 304 H44 M156 304 H184 L193 296 V266" fill="none" stroke="' + R.hi + '" stroke-width="1.9" opacity=".9"/><polygon points="16,12 22,18 16,26 10,18" fill="#38bdf8" stroke="#e0f2fe" stroke-width="1"/><polygon points="184,12 190,18 184,26 178,18" fill="#38bdf8" stroke="#e0f2fe" stroke-width="1"/><polygon points="100,299 108,305 100,311 92,305" fill="#7dd3fc" stroke="#fff" stroke-width=".9"/></svg>';
        if (rk === 3) return '<svg class="cf-frame-svg" viewBox="0 0 200 310" preserveAspectRatio="none" aria-hidden="true"><path d="M6 60 V15 L17 5 H56 M144 5 H183 L194 15 V60 M6 250 V295 L17 305 H56 M144 305 H183 L194 295 V250" fill="none" stroke="' + R.hi + '" stroke-width="2.1"/><path d="M10 12 L26 10 L18 26 Z M190 12 L174 10 L182 26 Z M10 298 L26 300 L18 284 Z M190 298 L174 300 L182 284 Z" fill="' + R.col + '" stroke="' + R.hi + '" stroke-width="1"/><path d="M3 130 L8 155 L3 180 M197 130 L192 155 L197 180" fill="none" stroke="' + R.hi + '" stroke-width="1.6" opacity=".8"/><polygon points="100,295 110,305 100,313 90,305" fill="#e879f9" stroke="#fdf4ff" stroke-width="1.2"/></svg>';
        return '<svg class="cf-frame-svg" viewBox="0 0 200 310" preserveAspectRatio="none" aria-hidden="true"><path d="M5 72 V14 L18 3 H64 M136 3 H182 L195 14 V72 M5 238 V296 L18 307 H64 M136 307 H182 L195 296 V238" fill="none" stroke="#fffbeb" stroke-width="2.5"/><path d="M8 18 L28 6 L21 26 L8 36 Z M192 18 L172 6 L179 26 L192 36 Z M8 292 L28 304 L21 284 L8 274 Z M192 292 L172 304 L179 284 L192 274 Z" fill="#f59e0b" stroke="#fffbeb" stroke-width="1.2"/><path d="M2 118 L10 155 L2 192 Z M198 118 L190 155 L198 192 Z" fill="#d97706" stroke="#fef08a" stroke-width="1.1"/><path d="M56 306 H144" stroke="#fef08a" stroke-width="2"/><polygon points="100,292 114,305 100,316 86,305" fill="#f59e0b" stroke="#fffbeb" stroke-width="1.5"/><polygon points="100,298 106,305 100,310 94,305" fill="#fef08a"/></svg>';
    }

    function crestWingsSVG(rk) {
        if (rk <= 0) return '';
        if (rk === 1) return '<svg class="cf-wings" viewBox="0 0 146 38" aria-hidden="true"><path d="M40 20 L26 16 L34 25 L44 25 Z M106 20 L120 16 L112 25 L102 25 Z" fill="#059669" stroke="#a7f3d0" stroke-width="1.2"/></svg>';
        if (rk === 2) return '<svg class="cf-wings" viewBox="0 0 146 38" aria-hidden="true"><path d="M38 18 L14 10 L26 23 L42 25 Z M108 18 L132 10 L120 23 L104 25 Z" fill="#0284c7" stroke="#bae6fd" stroke-width="1.4"/><polygon points="73,2 78,8 73,12 68,8" fill="#7dd3fc" stroke="#fff" stroke-width=".8"/></svg>';
        if (rk === 3) return '<svg class="cf-wings" viewBox="0 0 146 38" aria-hidden="true"><path d="M40 17 L8 5 L22 20 L14 29 L44 25 Z M106 17 L138 5 L124 20 L132 29 L102 25 Z" fill="#7e22ce" stroke="#f5d0fe" stroke-width="1.5"/><polygon points="73,0 80,8 73,14 66,8" fill="#f0abfc" stroke="#fff" stroke-width="1"/></svg>';
        return '<svg class="cf-wings" viewBox="0 0 146 38" aria-hidden="true"><path d="M42 16 L2 2 L20 17 L6 24 L26 26 L16 33 L46 26 Z M104 16 L144 2 L126 17 L140 24 L120 26 L130 33 L100 26 Z" fill="#d97706" stroke="#fffbeb" stroke-width="1.6"/><path d="M56 12 L73 0 L90 12 L73 16 Z" fill="#f59e0b" stroke="#fffbeb" stroke-width="1.3"/><polygon points="73,3 78,9 73,14 68,9" fill="#fffbeb"/></svg>';
    }

    function pickElColor(detail, rk) {
        const d = (detail || '').toLowerCase();
        if (d.includes('água') || d.includes('agua') || d.includes('gelo')) return EL_COLORS.agua;
        if (d.includes('cristal') || d.includes('sombra')) return EL_COLORS.cristal;
        if (d.includes('estelar') || d.includes('solar')) return EL_COLORS.estelar;
        if (d.includes('fogo') || d.includes('magma')) return EL_COLORS.fogo;
        if (d.includes('terra') || d.includes('flora')) return EL_COLORS.terra;
        return (RARITIES[rk] || RARITIES[0]).col;
    }

    const pendingPortraits = new Set();
    let portraitTimer = 0;

    function flushPortraits() {
        portraitTimer = 0;
        if (!pendingPortraits.size) return;
        const fn = window.ruaZoo && window.ruaZoo.portrait;
        let left = 0;
        pendingPortraits.forEach(item => {
            if (!item.art.isConnected) { pendingPortraits.delete(item); return; }
            if (item.art.querySelector('img')) { pendingPortraits.delete(item); return; }
            if (fn) {
                const url = fn(item.species);
                if (url) {
                    const im = new Image();
                    im.className = 'cl-zimg';
                    im.alt = '';
                    im.draggable = false;
                    im.src = url;
                    item.art.replaceChildren(im);
                    pendingPortraits.delete(item);
                    return;
                }
            }
            left++;
        });
        if (left > 0) portraitTimer = setTimeout(flushPortraits, 350);
    }

    function upgrade(slot) {
        if (slot.classList.contains('ported-card') || slot.classList.contains('battle-cf')) return;
        const button = slot.querySelector('.dk-card');
        if (!button || button.querySelector('.dk-lock-q')) return;

        const lv = Math.max(1, Number(slot.dataset.level) || 1);
        const rk = Math.max(0, Math.min(4, Number(slot.dataset.rk) || 0));
        const star = Math.max(0, Math.min(5, Number(slot.dataset.stars) || 0));
        const species = slot.dataset.species || '';
        const R = RARITIES[rk];

        const rawName = (button.querySelector('.dk-ribbon b')?.textContent || '').trim();
        const shortName = rawName.replace(/^Dragão[- ](?:d[aeo]s? )?/i, '') || rawName;
        const detail = (button.querySelector('.dk-rk-line')?.textContent || '').trim();
        const stats = [...button.querySelectorAll('.dk-st')].map(e => (e.lastChild?.textContent || '').trim());
        const moves = [...button.querySelectorAll('.dk-skill-normal b,.dk-skill-special b')].map(e => (e.textContent || '').trim());

        const image = button.querySelector('.dk-portrait img')?.cloneNode(true);
        const fallback = button.querySelector('.dk-portrait .cl-zimg-ic')?.cloneNode(true);
        const cost = (button.querySelector('.dk-cost-gem') || button.querySelector('.dk-pick-tag'))?.cloneNode(true);
        const check = (button.querySelector('.dk-check') || button.querySelector('.dk-badge-corner'))?.cloneNode(true);
        const field = button.querySelector('.dk-field-badge')?.cloneNode(true);
        const mask = button.querySelector('.dk-cooldown-mask')?.cloneNode(true);
        const label = button.querySelector('.dk-cooldown-label')?.cloneNode(true);

        const elCol = pickElColor(detail, rk);
        const isBattle = slot.classList.contains('battle-tcg');
        const starsHtml = star > 0 ? '<span class="cf-top-stars">' + '★'.repeat(star) + '</span>' : '';

        const card = document.createElement('div');
        card.className = 'cf-card rk-' + rk;
        card.style.setProperty('--el-c', elCol);
        card.setAttribute('aria-label', rawName + ' · nível ' + lv);
        card.innerHTML =
            (rk === 3 ? '<div class="cf-epic-rim"></div>' : '') +
            (rk === 4 ? '<div class="cf-leg-rim"></div>' : '') +
            rarityFrameSVG(rk) +
            '<div class="cf-foil"></div>' +
            '<div class="cf-head"><div class="cf-crest-row">' + crestWingsSVG(rk) + '<span class="cf-crest"><small>NV</small>' + lv + '</span></div>' + starsHtml + '</div>' +
            '<div class="cf-stage"></div>' +
            '<div class="cf-body">' +
                '<span class="cf-rk-pill">' + R.sym + ' ' + R.n + '</span>' +
                '<div class="cf-title"></div>' +
                '<div class="cf-sub"></div>' +
                '<div class="cf-stats">' +
                    '<div class="cf-st hp"><small>VIDA</small><b>' + (stats[0] || '-') + '</b></div>' +
                    '<div class="cf-st atk"><small>ATQ</small><b>' + (stats[1] || '-') + '</b></div>' +
                    '<div class="cf-st rng"><small>ALC</small><b>' + (stats[2] || '-') + '</b></div>' +
                '</div>' +
                '<div class="cf-moves">' +
                    '<div class="cf-mv n"><i>ATQ</i><b></b></div>' +
                    '<div class="cf-mv s"><i>ESP</i><b></b></div>' +
                '</div>' +
            '</div>' +
            '<span class="cf-sel-badge" aria-hidden="true">✓ SELECIONADO</span>';

        card.querySelector('.cf-title').textContent = shortName;
        card.querySelector('.cf-title').title = rawName;
        card.querySelector('.cf-sub').textContent = isBattle ? ('⚔ ' + (stats[1] || '')) : (moves[1] || detail);
        const mvBs = card.querySelectorAll('.cf-mv b');
        if (mvBs[0]) mvBs[0].textContent = moves[0] || 'Ataque';
        if (mvBs[1]) mvBs[1].textContent = moves[1] || 'Especial';

        const artBox = card.querySelector('.cf-stage');
        if (image) {
            artBox.appendChild(image);
        } else {
            if (fallback) artBox.appendChild(fallback);
            if (species) {
                pendingPortraits.add({ art: artBox, species });
                if (!portraitTimer) portraitTimer = setTimeout(flushPortraits, 120);
            }
        }

        if (cost) card.appendChild(cost);
        if (check && !isBattle) card.appendChild(check);
        if (isBattle) {
            const fill = document.createElement('div');
            fill.className = 'ported-essence-fill';
            card.appendChild(fill);
        }
        if (field) card.appendChild(field);
        if (mask) card.appendChild(mask);
        if (label) card.appendChild(label);

        button.replaceChildren(card);
        slot.classList.add('ported-card');
        if (button.tagName === 'BUTTON') {
            button.setAttribute('aria-pressed', String(button.classList.contains('on') || button.classList.contains('sel')));
        }
    }

    function scan() {
        document.querySelectorAll('.dk-slot:not(.ported-card)').forEach(upgrade);
    }

    new MutationObserver(records => {
        for (const r of records) {
            for (const n of r.addedNodes) {
                if (n.nodeType === 1 && (n.matches?.('.dk-slot') || n.querySelector?.('.dk-slot'))) {
                    scan();
                    return;
                }
            }
        }
    }).observe(document.body, { childList: true, subtree: true });

    scan();
    document.dispatchEvent(new Event('cestille-cards-ready'));
})();
