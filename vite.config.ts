import tailwindcss from "@tailwindcss/vite";
import basicSsl from "@vitejs/plugin-basic-ssl";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    // HTTPS in dev: la fotocamera (scanner ISBN) funziona solo in un contesto
    // sicuro, e dal telefono in LAN si apre http://<IP>, che non lo è.
    command === "serve" && basicSsl(),
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        navigateFallbackDenylist: [/^\/auth/],
      },
      manifest: {
        name: "Shelfy",
        short_name: "Shelfy",
        lang: "it",
        display: "standalone",
        theme_color: "#FBEDE8",
        background_color: "#FFFFFF",
        icons: [
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": `${import.meta.dirname}/src`,
    },
  },
  server: { host: true },
}));
