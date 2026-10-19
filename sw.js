const CACHE_NAME = 'vigentra-shell-v4';
const SHELL = ['./manifest.json', './icon.svg'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('vigentra-shell-') && key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request, { cache: 'no-store' }).then(response => {
      if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put('./', response.clone()));
      return response;
    }).catch(async () => (await caches.match('./')) || Response.error()));
    return;
  }
  if (SHELL.some(path => url.pathname.endsWith(path.replace('./','')))) {
    event.respondWith(caches.match(request).then(cached => cached || fetch(request)));
  }
});