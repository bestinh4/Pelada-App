
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
      // Notificação de teste removida para evitar ser marcado como spam
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
  if (!('Notification' in window)) {
    console.error("❌ Notificações não são suportadas neste navegador.");
    return;
  }
  
  console.log("🔔 Estado da permissão:", Notification.permission);

  if (Notification.permission !== 'granted') {
    console.warn("🚫 Notificações não permitidas. Tentando solicitar...");
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.error("❌ Permissão negada pelo usuário.");
      return;
    }
  }

  try {
    console.log("🔔 Tentando disparar notificação:", title);
    
    // Tenta usar o Service Worker (necessário para notificações persistentes no sistema)
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      
      if (registration && registration.showNotification) {
        console.log("✅ Usando Service Worker para notificação persistente");
        await registration.showNotification(title, {
          body,
          icon: 'https://i.postimg.cc/QCGV109g/Gemini-Generated-Image-xrrv8axrrv8axrrv-removebg-preview.png',
          badge: 'https://i.postimg.cc/QCGV109g/Gemini-Generated-Image-xrrv8axrrv8axrrv-removebg-preview.png',
          vibrate: [200, 100, 200],
          tag: 'oa-notification',
          renotify: true,
          requireInteraction: true, // Mantém a notificação até o usuário interagir
          data: { url: window.location.origin }
        } as any);
        return;
      }
    }
    
    // Fallback para o objeto Notification padrão (menos persistente, mas funciona)
    console.log("⚠️ Usando fallback de Notificação padrão (Main Thread)");
    const notif = new Notification(title, { 
      body, 
      icon: 'https://i.postimg.cc/QCGV109g/Gemini-Generated-Image-xrrv8axrrv8axrrv-removebg-preview.png' 
    });
    
    notif.onclick = () => {
      window.focus();
      notif.close();
    };
  } catch (error) {
    console.error("❌ Erro crítico ao disparar notificação:", error);
    // Tenta o fallback mais simples possível
    try {
       new Notification(title, { body });
    } catch (e) {}
  }
};
