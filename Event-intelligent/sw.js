const CACHE_NAME = 'awspectrum-v1';
const ASSETS = [
    './',
    './index.html',
    './styles.css',
    './js/main.js',
    './js/core/store.js',
    './js/core/router.js',
    './users.txt',
    'https://unpkg.com/@phosphor-icons/web'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    // Para llamadas a la API, usamos Network First
    if (event.request.url.includes('api.quantum-awspectrum.demo')) {
        event.respondWith(
            fetch(event.request).catch(() => caches.match(event.request))
        );
        return;
    }

    // Para assets estáticos, usamos Cache First
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});
