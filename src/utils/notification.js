import { messagingPromise } from '@/firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { db } from '@/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

// ─────────────────────────────────────────────────────────────
// Service Worker — ต้อง register ตอนแอปเริ่มทำงาน
// ─────────────────────────────────────────────────────────────
export const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register('/sw.js');
    console.log('SW registered:', reg.scope);
    return reg;
  } catch (err) {
    console.error('SW registration failed:', err);
    return null;
  }
};

// ─────────────────────────────────────────────────────────────
// ตรวจว่าเปิดเป็น PWA แบบ standalone อยู่ไหม (สำคัญสำหรับ iOS)
// ─────────────────────────────────────────────────────────────
export const isStandalone = () => {
  return ('standalone' in window.navigator && window.navigator.standalone) ||
         window.matchMedia('(display-mode: standalone)').matches;
};

// ─────────────────────────────────────────────────────────────
// ขอ permission จาก user
// ─────────────────────────────────────────────────────────────
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    alert('เบราว์เซอร์ของคุณไม่รองรับการแจ้งเตือน');
    return false;
  }
  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

// ─────────────────────────────────────────────────────────────
// ขอ FCM token (เรียกหลัง permission = granted)
// ─────────────────────────────────────────────────────────────
export const getFCMToken = async () => {
  const messaging = await messagingPromise;
  if (!messaging) {
    console.warn('Messaging not supported');
    return null;
  }

  try {
    const reg = await navigator.serviceWorker.ready;
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: reg,
    });
    if (!token) {
      console.warn('No FCM token returned');
      return null;
    }
    return token;
  } catch (err) {
    console.error('Get FCM token failed:', err);
    return null;
  }
};

// ─────────────────────────────────────────────────────────────
// เก็บ token ผูกกับ Order (สำหรับลูกค้า)
// ─────────────────────────────────────────────────────────────
export const saveCustomerToken = async (orderId, token) => {
  if (!orderId || !token) return false;
  try {
    await updateDoc(doc(db, 'Order', orderId), {
      deviceTokens: arrayUnion(token),
    });
    return true;
  } catch (err) {
    console.error('Save customer token failed:', err);
    return false;
  }
};


// ─────────────────────────────────────────────────────────────
// Foreground listener — แสดง notification ตอนเปิดเว็บอยู่
// (ตอนปิดจอ/ปิดแอป — sw.js จัดการเอง)
// ─────────────────────────────────────────────────────────────
export const listenForegroundMessages = async () => {
  const messaging = await messagingPromise;
  if (!messaging) return;

  onMessage(messaging, async (payload) => {
    const reg = await navigator.serviceWorker.ready;
    const title = payload.notification?.title || 'การแจ้งเตือน';
    const body = payload.notification?.body || '';
    reg.showNotification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [200, 100, 200],
    });
  });
};

// ─────────────────────────────────────────────────────────────
// Helper: เปิดแจ้งเตือนแบบครบ flow (ลูกค้า)
// ─────────────────────────────────────────────────────────────
export const enableCustomerNotification = async (orderIds = []) => {
  const granted = await requestNotificationPermission();
  if (!granted) return { ok: false, reason: 'permission_denied' };

  const token = await getFCMToken();
  if (!token) return { ok: false, reason: 'no_token' };

  // เก็บ token ใส่ทุก order ของห้องนี้
  for (const orderId of orderIds) {
    await saveCustomerToken(orderId, token);
  }

  await listenForegroundMessages();
  return { ok: true, token };
};

