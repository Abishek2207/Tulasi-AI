const CACHE_NAME = 'tulasi-ai-v4';
const PRECACHE = [
  '/',
  '/dashboard',
  '/manifest.json',
];

// ── Install: precache shell ──────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

// ── Activate: purge old caches ───────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch: network-first with offline fallback ───────────────────────
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // Skip external API, analytics, GTM — always network
  if (
    url.hostname.includes('railway.app') ||
    url.hostname.includes('vercel-analytics') ||
    url.hostname.includes('googletagmanager') ||
    url.pathname.startsWith('/api/')
  ) return;

  // For navigation requests: network first, fall back to cached /
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match('/').then((cached) => cached || new Response('Offline', { status: 503 }))
      )
    );
    return;
  }

  // For static assets: stale-while-revalidate
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(event.request);
      const networkFetch = fetch(event.request).then((res) => {
        if (res.ok && res.type !== 'opaque') cache.put(event.request, res.clone());
        return res;
      }).catch(() => cached);
      return cached || networkFetch;
    })
  );
});

// ── Background sync (retry failed API calls when back online) ────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'retry-failed') {
    console.log('[SW] Background sync: retrying failed requests');
  }
});
