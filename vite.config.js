import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import replace from "@rollup/plugin-replace";
import { VitePWA } from "vite-plugin-pwa";
import { execSync } from "node:child_process";
import { version } from "./package.json";

const pwa = VitePWA({
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
    theme_color: "#E2E8F0",
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
    screenshots: [{
      src: "screenshot.png",
      sizes: "1200x600",
      type: "image/png",
      form_factor: "wide",
    }, {
      src: "screenshot.png",
      sizes: "1200x600",
      type: "image/png",
    }],
  },
  devOptions: {
    enabled: true,
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const isDev = command === "serve";
  console.log("Development Mode");
  return {
    plugins: [
      vue(),
      replace({
        __COMMIT__: execSync("git rev-parse HEAD").toString().trim(),
        __buildDate__: new Date().toLocaleString(),
        __version__: version,
        preventAssignment: true,
      }),
      !isDev && pwa,
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  };
});
