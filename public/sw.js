// Firebase compat libraries — ใช้ใน Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// ⚠️ Service Worker ไม่รู้จัก import.meta.env — ต้องใส่ค่าตรง ๆ
firebase.initializeApp({
  apiKey: "AIzaSyDmlvELaeBCn1m4AuZh-L7vO33B_xvtpTU",
  authDomain: "projectfinal-eb377.firebaseapp.com",
  projectId: "projectfinal-eb377",
  storageBucket: "projectfinal-eb377.firebasestorage.app",
  messagingSenderId: "1068875487481",
  appId: "1:1068875487481:web:560bc0571688eb8ae4ea28",
});

const messaging = firebase.messaging();

// Background message handler (ทำงานตอนแอปไม่เปิดอยู่)
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message:', payload);
  
  const title = payload.notification?.title || payload.data?.title || 'การแจ้งเตือน';
  const body = payload.notification?.body || payload.data?.body || '';

  self.registration.showNotification(title, {
    body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200, 100, 200],
    data: payload.data || {},
    requireInteraction: false,
  });
});

// คลิกที่ notification → เปิดแอปขึ้นมา
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      // ถ้ามี tab เปิดอยู่ ให้ focus
      for (const client of windowClients) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      // ถ้าไม่มี → เปิดใหม่
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(clients.claim()));
