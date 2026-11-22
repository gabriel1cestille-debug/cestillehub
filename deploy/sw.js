/* Programa de fundo do app instalável: deixa o site instalável e sempre atualizado (sem guardar cópia) e mostra as notificações push. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(Promise.all([
    self.clients.claim(),
    caches.keys().then(ks => Promise.all(
        ks.filter(k => 
            (k.indexOf('cestille-assets-') === 0 && k !== 'cestille-assets-v6') ||
            (k.indexOf('cestille-shell-') === 0 && k !== 'cestille-shell-v3')
        ).map(k => caches.delete(k))
    ))
])));

/* a página fica atualizada: no celular e iPad, busca primeiro da rede para sempre carregar a versão mais recente. Se estiver sem conexão (offline), entrega a cópia do cache */
const SHELL = 'cestille-shell-v3';
self.addEventListener('fetch', e => {
    const r = e.request; if (r.method !== 'GET') return; let u; try { u = new URL(r.url); } catch (x) { return; }
    if (u.origin !== self.location.origin) return;
    const nav = r.mode === 'navigate' || r.destination === 'document', css = /\/tailwind\.css$/.test(u.pathname);
    if (!nav && !css) return;
    if (/version\.json|sw\.js/.test(u.pathname)) return;
    e.respondWith((async () => {
        const c = await caches.open(SHELL);
        if (nav) {
            try {
                const controller = new AbortController();
                const timer = setTimeout(() => controller.abort(), 8000);
                const net = await fetch(r, { signal: controller.signal });
                clearTimeout(timer);
                if (net && net.ok) {
                    c.put(r, net.clone());
                    return net;
                }
            } catch (err) {}
            const hit = await c.match(r, { ignoreSearch: true });
            if (hit) return hit;
            return fetch(r);
        } else {
            const hit = await c.match(r, { ignoreSearch: true });
            const net = fetch(r).then(res => { if (res && res.ok) c.put(r, res.clone()); return res; }).catch(() => hit);
            return hit || net;
        }
    })());
});
/* guarda os modelos 3D e imagens (pasta assets): abrem na hora na segunda vez e se atualizam sozinhos em segundo plano. A página e o código nunca ficam guardados. */
const AST = 'cestille-assets-v33';
self.addEventListener('fetch', e => {
    const r = e.request; if (r.method !== 'GET') return; let u; try { u = new URL(r.url); } catch (x) { return; }
    if (u.origin !== self.location.origin || !/\/assets\//.test(u.pathname) || !/\.(glb|webp|png|jpg|jpeg|ktx2|mp3|ogg)$/i.test(u.pathname)) return;
    e.respondWith(caches.open(AST).then(c => c.match(r).then(hit => { const net = fetch(r).then(res => { if (res && res.ok) c.put(r, res.clone()); return res; }).catch(() => hit); return hit || net; })));
});
/* bibliotecas de fora (Tailwind, ícones, Firebase, fontes): ficam guardadas e abrem na hora; atualizam em segundo plano. Antes cada abertura esperava a rede para tudo isso */
const CDN = 'cestille-cdn-v1', CDN_HOSTS = ['cdn.tailwindcss.com', 'unpkg.com', 'www.gstatic.com', 'fonts.googleapis.com', 'fonts.gstatic.com', 'cdn.jsdelivr.net'];
self.addEventListener('fetch', e => {
    const r = e.request; if (r.method !== 'GET') return; let u; try { u = new URL(r.url); } catch (x) { return; }
    if (u.origin === self.location.origin || CDN_HOSTS.indexOf(u.hostname) < 0) return;
    if (u.hostname === 'www.gstatic.com' && u.pathname.indexOf('/firebasejs/') !== 0) return;
    e.respondWith(caches.open(CDN).then(c => c.match(r).then(hit => { const net = fetch(r).then(res => { if (res && (res.ok || res.type === 'opaque')) c.put(r, res.clone()); return res; }).catch(() => hit); return hit || net; })));
});
self.addEventListener('push', e => {
    let d = {}; try { d = e.data.json(); } catch (x) { d = { title: 'Cestille', body: e.data ? e.data.text() : '' }; }
    e.waitUntil(self.registration.showNotification(d.title || 'Cestille', { body: d.body || '', icon: 'icon-192.png', badge: 'icon-192.png', tag: d.tag || 'cestille', data: { url: d.url || './' } }));
});
self.addEventListener('notificationclick', e => {
    e.notification.close();
    e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => { for (const c of cs) { if ('focus' in c) return c.focus(); } return self.clients.openWindow((e.notification.data && e.notification.data.url) || './'); }));
});
