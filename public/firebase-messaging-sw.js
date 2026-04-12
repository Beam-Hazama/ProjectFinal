importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyDmlvELaeBCn1m4AuZh-L7vO33B_xvtpTU",
  authDomain: "projectfinal-eb377.firebaseapp.com",
  databaseURL: "https://projectfinal-eb377-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "projectfinal-eb377",
  storageBucket: "projectfinal-eb377.appspot.com",
  messagingSenderId: "1068875487481",
  appId: "1:1068875487481:web:560bc0571688eb8ae4ea28"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  if (!payload.notification) {
    const notificationTitle = payload.data?.title || 'มีการอัปเดต';
    const notificationOptions = {
      body: payload.data?.body || '',
      icon: '/vite.svg',
      vibrate: [200, 100, 200, 100, 200, 100, 200]
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  }
});
