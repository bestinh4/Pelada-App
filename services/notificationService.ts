import { messaging, db, doc, updateDoc } from './firebase.ts';
import { getToken } from "firebase/messaging";

export const requestNotificationPermission = async (userId: string) => {
  if (!('Notification' in window)) return;

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted' && messaging) {
      // Em um app real, você usaria sua VAPID KEY aqui
      // getToken(messaging, { vapidKey: 'SUA_KEY' })
      
      console.log('Permissão de notificação concedida.');
      // Simulamos o registro do token no perfil do usuário
      const userRef = doc(db, "players", userId);
      await updateDoc(userRef, { pushEnabled: true });
    }
  } catch (error) {
    console.error("Erro ao solicitar permissão de push:", error);
  }
};

export const sendPushNotification = async (title: string, body: string) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  // Como não temos um servidor backend para disparar FCM real, 
  // utilizamos o Service Worker para disparar uma notificação local que 
  // simula o comportamento de um push recebido.
  const registration = await navigator.serviceWorker.ready;
  // Fix: Cast the notification options to 'any' to avoid TS errors with 'vibrate', 'badge', etc., which are valid in ServiceWorker showNotification but often missing in standard NotificationOptions types.
  registration.showNotification(title, {
    body,
    icon: 'https://i.postimg.cc/QCGV109g/Gemini-Generated-Image-xrrv8axrrv8axrrv-removebg-preview.png',
    badge: 'https://i.postimg.cc/QCGV109g/Gemini-Generated-Image-xrrv8axrrv8axrrv-removebg-preview.png',
    vibrate: [200, 100, 200],
    tag: 'oa-notification',
    renotify: true
  } as any);
};