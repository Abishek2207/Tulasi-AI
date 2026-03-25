const CACHE_NAME = 'tulasi-ai-v3';
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only cache GET requests for same-origin or static assets
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  // Skip API calls — always go to network
  if (url.pathname.startsWith('/api') || url.hostname.includes('railway.app')) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request).then((res) => {
        if (res.ok && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return res;
      });
      return cached || networkFetch;
    })
  );
});
