import { fileURLToPath, URL } from "node:url";

import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";

import tailwindcss from "@tailwindcss/vite";



// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    
    tailwindcss(),
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
