
import { db, doc, updateDoc, collection, addDoc } from './firebase.ts';

export const getNotificationStatus = () => {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
};

export const requestNotificationPermission = async (userId?: string) => {
  if (!('Notification' in window)) {
    console.warn('⚠️ Notificações não suportadas neste navegador.');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    console.log('🔔 Status da permissão:', permission);
    
    if (permission === 'granted' && userId) {
      const userRef = doc(db, "players", userId);
      await updateDoc(userRef, { pushEnabled: true });
      
      // Notificação de teste imediata
      sendPushNotification("CONECTADO! 🚀", "Você receberá alertas de novos jogadores aqui.");
    }
    return permission === 'granted';
  } catch (error) {
    console.error("❌ Erro ao solicitar permissão:", error);
    return false;
  }
};

export const broadcastNotification = async (title: string, body: string) => {
  try {
    await addDoc(collection(db, "notifications"), {
      title,
      body,
      createdAt: new Date().toISOString(),
      type: 'broadcast'
    });
  } catch (error) {
    console.error("❌ Erro ao transmitir notificação:", error);
  }
};

export const sendPushNotification = async (title: string, body: string) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration) {
        registration.showNotification(title, {
          body,
          icon: 'https://i.postimg.cc/QCGV109g/Gemini-Generated-Image-xrrv8axrrv8axrrv-removebg-preview.png',
          badge: 'https://i.postimg.cc/QCGV109g/Gemini-Generated-Image-xrrv8axrrv8axrrv-removebg-preview.png',
          vibrate: [200, 100, 200],
          tag: 'oa-notification',
          renotify: true,
          data: { url: window.location.origin }
        } as any);
        return;
      }
    }
    // Fallback
    new Notification(title, { body, icon: 'https://i.postimg.cc/QCGV109g/Gemini-Generated-Image-xrrv8axrrv8axrrv-removebg-preview.png' });
  } catch (error) {
    console.error("❌ Erro ao disparar notificação:", error);
  }
};
