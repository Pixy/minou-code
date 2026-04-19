const CACHE = 'minou-code-v20260419a';

const PRECACHE = [
  './',
  './index.html',
  './style.css',
  './manifest.json',
  './icon.svg',
  './js/main.js',
  './js/state.js',
  './js/navigation.js',
  './js/feedback.js',
  './js/ui-events.js',
  './js/grid.js',
  './js/cards.js',
  './js/engine.js',
  './js/animations.js',
  './js/audio.js',
  './js/effects.js',
  './js/svg-cat.js',
  './js/levels/index.js',
  './js/levels/level-01.js',
  './js/levels/level-02.js',
  './js/levels/level-03.js',
  './js/levels/level-04.js',
  './js/levels/level-05.js',
  './js/levels/level-06.js',
  './js/levels/level-07.js',
  './js/levels/level-08.js',
  './js/levels/level-09.js',
  './js/levels/level-10.js',
  './js/levels/level-11.js',
  './js/levels/level-12.js',
  './js/levels/level-13.js',
  './js/levels/level-14.js',
  './js/levels/level-15.js',
  './js/levels/level-16.js',
  './js/levels/level-17.js',
  './js/levels/level-18.js',
  './js/levels/level-19.js',
  'https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js',
  'https://cdn.jsdelivr.net/npm/sortablejs@1.15.6/Sortable.min.js',
  'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      Promise.all(
        PRECACHE.map((url) =>
          cache.add(new Request(url, { cache: 'reload' })).catch((err) => {
            console.warn('[SW] Précache échoué pour', url, err);
          })
        )
      )
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          if (!res || res.status !== 200) return res;
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});
