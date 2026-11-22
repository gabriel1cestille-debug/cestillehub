/* Cloudflare Worker do site: serve os arquivos da pasta e responde só a /api/market (dólar e Ibovespa com histórico).
   Os dados vêm do Yahoo Finance, buscados aqui no servidor (o navegador não conseguiria por causa de CORS) e guardados 60 s no cache. */
const YF = 'https://query1.finance.yahoo.com/v8/finance/chart/';
const RANGES = { '1d': ['1d', '5m'], '5d': ['5d', '30m'], '1mo': ['1mo', '1d'], '6mo': ['6mo', '1d'], '1y': ['1y', '1d'] };
const SYMBOLS = { usd: 'USDBRL=X', ibov: '^BVSP' };

async function series(sym, range) {
    const [r, i] = RANGES[range];
    const res = await fetch(YF + encodeURIComponent(sym) + '?range=' + r + '&interval=' + i, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CestilleHub)' }, cf: { cacheTtl: 60, cacheEverything: true } });
    if (!res.ok) throw new Error('yahoo ' + res.status);
    const j = await res.json(), c = j && j.chart && j.chart.result && j.chart.result[0];
    if (!c) throw new Error('sem dados');
    const ts = c.timestamp || [], q = (c.indicators && c.indicators.quote && c.indicators.quote[0] && c.indicators.quote[0].close) || [], pts = [];
    for (let k = 0; k < ts.length; k++) if (q[k] != null && isFinite(q[k])) pts.push([ts[k], Math.round(q[k] * 10000) / 10000]);
    if (!pts.length) throw new Error('série vazia');
    const m = c.meta || {};
    return { price: m.regularMarketPrice != null ? m.regularMarketPrice : pts[pts.length - 1][1], prev: m.chartPreviousClose != null ? m.chartPreviousClose : pts[0][1], name: m.shortName || sym, t: m.regularMarketTime || pts[pts.length - 1][0], pts };
}

async function market(range) {
    const out = { ok: true, at: Date.now(), range };
    await Promise.all(Object.keys(SYMBOLS).map(async k => { try { out[k] = await series(SYMBOLS[k], range); } catch (e) { out[k] = null; } }));
    out.ok = !!(out.usd || out.ibov);
    return out;
}

export default {
    async fetch(req, env, ctx) {
        const u = new URL(req.url);
        if (u.pathname !== '/api/market') return env.ASSETS.fetch(req);
        const range = RANGES[u.searchParams.get('range')] ? u.searchParams.get('range') : '1d';
        const key = new Request(u.origin + '/api/market?range=' + range), cache = caches.default;
        let res = await cache.match(key);
        if (!res) {
            const body = await market(range);
            res = new Response(JSON.stringify(body), { status: body.ok ? 200 : 502, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=60' } });
            if (body.ok) ctx.waitUntil(cache.put(key, res.clone()));
        }
        return res;
    }
};
