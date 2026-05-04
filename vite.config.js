import { fileURLToPath, URL } from "node:url";
import fs from "node:fs";
import path from "node:path";

import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import tailwindcss from "@tailwindcss/vite";
import basicSsl from "@vitejs/plugin-basic-ssl";

function firebaseSWPlugin() {
  return {
    name: "firebase-sw-generator",
    configResolved(config) {
      const env = loadEnv(config.mode, config.root);

      const swTemplate = `
importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "${env.VITE_FIREBASE_API_KEY || ""}",
  authDomain: "${env.VITE_FIREBASE_AUTH_DOMAIN || ""}",
  databaseURL: "${env.VITE_FIREBASE_DATABASE_URL || ""}",
  projectId: "${env.VITE_FIREBASE_PROJECT_ID || ""}",
  storageBucket: "${env.VITE_FIREBASE_STORAGE_BUCKET || ""}",
  messagingSenderId: "${env.VITE_FIREBASE_MESSAGING_SENDER_ID || ""}",
  appId: "${env.VITE_FIREBASE_APP_ID || ""}"
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
});`.trim();

      const publicDir = config.publicDir || path.resolve(config.root, "public");
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }

      const swPath = path.resolve(publicDir, "firebase-messaging-sw.js");
      fs.writeFileSync(swPath, swTemplate);
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
    basicSsl(),
    firebaseSWPlugin(),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    host: true, // เพิ่มบรรทัดนี้ เพื่อให้สแกนเข้าผ่าน IP ได้
    port: 5173,
  },
});
