const CACHE_NAME = 'lontong-admin-v1';
const ASSETS_TO_CACHE = [
  './admin.html',
  './styleadmin.css',
  './scriptadmin.js',
  './manifest.json',
  './logonobg.png'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Fetch (Mengambil data dari cache jika offline/lambat)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});