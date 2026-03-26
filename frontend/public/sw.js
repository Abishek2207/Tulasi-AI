const CACHE_NAME = 'tulasi-ai-v5';
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

// ── Fetch: Cache-first for assets, Network-first for navigation ──────
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // Skip external API, analytics, GTM — always network
  if (
    url.hostname.includes('onrender.com') ||
    url.hostname.includes('vercel-analytics') ||
    url.hostname.includes('googletagmanager') ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/_next/data/')
  ) return;

  // For HTML navigation requests (changing pages)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache the latest version of the HTML on success
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => {
          // If network fails (offline), return the cached page or fallback to root
          return caches.match(event.request).then((cached) => {
            return cached || caches.match('/');
          });
        })
    );
    return;
  }

  // For static assets (JS, CSS, Images): Cache First -> Network Fallback
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response.ok && response.type !== 'opaque') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});

// ── Background sync (retry failed API calls when back online) ────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'retry-failed') {
    console.log('[SW] Background sync: retrying failed requests');
  }
});
