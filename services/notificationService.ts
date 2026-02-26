
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
    console.log('🔔 Solicitando permissão de notificação...');
    const permission = await Notification.requestPermission();
    console.log('🔔 Status da permissão:', permission);
    
    if (permission === 'denied') {
      alert("As notificações foram bloqueadas. Para recebê-las, você precisa resetar as permissões no cadeado da barra de endereços do seu navegador.");
    }
    
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

  if (Notification.permission === 'denied') {
    console.warn("🚫 Permissão de notificação negada. O usuário precisa resetar as permissões no navegador.");
    return;
  }

  if (Notification.permission !== 'granted') {
    console.warn("🚫 Notificações não permitidas. O sistema só pode solicitar permissão via clique do usuário.");
    return;
  }

  try {
    console.log("🔔 Disparando notificação:", title);
    
    const options = {
      body,
      icon: 'https://images.weserv.nl/?url=https://i.postimg.cc/QCGV109g/Gemini-Generated-Image-xrrv8axrrv8axrrv-removebg-preview.png&w=192&h=192&fit=contain&padding=10',
      badge: 'https://images.weserv.nl/?url=https://i.postimg.cc/QCGV109g/Gemini-Generated-Image-xrrv8axrrv8axrrv-removebg-preview.png&w=96&h=96&fit=contain',
      vibrate: [200, 100, 200, 100, 200],
      tag: 'oa-notification-' + Date.now(),
      renotify: true,
      requireInteraction: true,
      data: { url: window.location.origin }
    };

    // Tenta usar o Service Worker primeiro (melhor suporte para background e sistema)
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration && registration.showNotification) {
          console.log("✅ Enviando via Service Worker");
          await registration.showNotification(title, options as any);
          return;
        }
      } catch (swErr) {
        console.warn("⚠️ Falha ao usar Service Worker, tentando fallback:", swErr);
      }
    }
    
    // Fallback para o objeto Notification padrão
    console.log("⚠️ Usando fallback de Notificação padrão");
    const notif = new Notification(title, { 
      body: options.body, 
      icon: options.icon,
      tag: options.tag
    });
    
    notif.onclick = () => {
      window.focus();
      notif.close();
    };
  } catch (error) {
    console.error("❌ Erro ao disparar notificação:", error);
  }
};
