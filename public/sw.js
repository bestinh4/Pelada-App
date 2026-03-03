console.log("🛠️ Service Worker carregado!");

const CACHE_NAME = 'oa-elite-pro-v8'; // Incrementado para v8
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
  console.log("📥 SW: Push recebido!");
  let data = { title: 'Ousadia & Alegria', body: 'Novidades na Arena!' };
  
  try {
    if (event.data) {
      const payload = event.data.json();
      console.log("📥 SW: Payload JSON:", payload);
      
      // FCM pode enviar no formato { notification: { title, body }, data: { url } }
      // ou direto no root se for data message
      data = {
        title: payload.notification?.title || payload.title || data.title,
        body: payload.notification?.body || payload.body || data.body,
        url: payload.data?.url || payload.url || '/'
      };
    }
  } catch (e) {
    console.log("📥 SW: Payload texto:", event.data ? event.data.text() : 'sem dados');
    data.body = event.data ? event.data.text() : data.body;
  }

  const options = {
    body: data.body,
    icon: 'https://images.weserv.nl/?url=https://i.postimg.cc/QCGV109g/Gemini-Generated-Image-xrrv8axrrv8axrrv-removebg-preview.png&w=192&h=192&fit=contain&padding=10',
    badge: 'https://images.weserv.nl/?url=https://i.postimg.cc/QCGV109g/Gemini-Generated-Image-xrrv8axrrv8axrrv-removebg-preview.png&w=96&h=96&fit=contain',
    vibrate: [200, 100, 200, 100, 200],
    tag: 'oa-notification',
    renotify: true,
    data: { url: data.url || '/' }
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (event) => {
  console.log("🖱️ SW: Notificação clicada!");
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Se já houver uma aba aberta, foca nela
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Se não, abre uma nova
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Ignorar requisições que não sejam GET ou que não sejam http/https
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    fetch(event.request).catch(async () => {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(event.request);
      
      if (cachedResponse) return cachedResponse;
      
      // Fallback para navegação (SPA)
      if (event.request.mode === 'navigate') {
        const indexFallback = await cache.match('/index.html');
        if (indexFallback) return indexFallback;
      }
      
      // Retorna uma resposta de erro amigável em vez de undefined
      return new Response('Recurso não disponível offline', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: new Headers({ 'Content-Type': 'text/plain' })
      });
    })
  );
});
