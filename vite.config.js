import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      includeAssets: ["favicon.ico", "favicon.svg"],
      registerType: "autoUpdate",
      injectRegister: "auto",
      workbox: {
        globPatterns: ["assets/*", "**/*.{js,css,html}"],
      },
      manifest: {
        name: "制作地块边界文件",
        short_name: "制作地块边界文件",
        description: "制作地块边界文件",
        theme_color: "#84BD5A",
        start_url: "/",
        display: "standalone",
        id: "liuxspro.createshapefile",
        icons: [
          {
            src: "pwa-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
