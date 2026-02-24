
console.log("🛠️ Service Worker carregado!");

const CACHE_NAME = 'oa-elite-pro-v6'; // Versão atualizada
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  console.log("📥 SW: Instalando...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log("🚀 SW: Ativado!");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("🗑️ SW: Removendo cache antigo:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PING') {
    event.source.postMessage({ type: 'PONG' });
  }
});

self.addEventListener('push', (event) => {
  let data = { title: 'O&A Elite Pro', body: 'Novidades na Arena!' };
  try {
    data = event.data ? event.data.json() : data;
  } catch (e) {
    data = { title: 'O&A Elite Pro', body: event.data ? event.data.text() : data.body };
  }

  const options = {
    body: data.body,
    icon: 'https://images.weserv.nl/?url=https://i.postimg.cc/QCGV109g/Gemini-Generated-Image-xrrv8axrrv8axrrv-removebg-preview.png&bg=ffffff&w=192&h=192&fit=contain&padding=10',
    badge: 'https://images.weserv.nl/?url=https://i.postimg.cc/QCGV109g/Gemini-Generated-Image-xrrv8axrrv8axrrv-removebg-preview.png&bg=ffffff&w=96&h=96&fit=contain',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/' }
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});

self.addEventListener('fetch', (event) => {
  // Estratégia Network First para o app, caindo para Cache apenas se offline
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
