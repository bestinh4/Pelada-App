importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBa8kF4pSrx_-GuHVT_hGMgh_UmRc0NBx0",
  authDomain: "ousadia-5b1d8.firebaseapp.com",
  projectId: "ousadia-5b1d8",
  storageBucket: "ousadia-5b1d8.firebasestorage.app",
  messagingSenderId: "812821310641",
  appId: "1:812821310641:web:d5256ab8fea0ad1323c690"
});

const messaging = firebase.messaging();

// Isso lida com a notificação quando o app está FECHADO
messaging.onBackgroundMessage((payload) => {
  console.log('📥 [sw] Notificação em background:', payload);
  
  const notificationTitle = payload.notification.title || 'Ousadia & Alegria';
  const notificationOptions = {
    body: payload.notification.body,
    icon: 'https://images.weserv.nl/?url=https://i.postimg.cc/QCGV109g/Gemini-Generated-Image-xrrv8axrrv8axrrv-removebg-preview.png&w=192&h=192&fit=contain&padding=10',
    badge: 'https://images.weserv.nl/?url=https://i.postimg.cc/QCGV109g/Gemini-Generated-Image-xrrv8axrrv8axrrv-removebg-preview.png&w=96&h=96&fit=contain',
    vibrate: [200, 100, 200, 100, 200],
    data: { url: payload.data?.url || '/' }
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});
