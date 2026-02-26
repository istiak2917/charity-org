import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt", "pwa-icons/*.png"],
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff,woff2}"],
        navigateFallbackDenylist: [/^\/~oauth/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/stbxvjmuygifgueamybw\.supabase\.co\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-api",
              expiration: { maxEntries: 50, maxAgeSeconds: 300 },
            },
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "supabase-storage",
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
      manifest: {
        name: "শিশুফুল - Shishuful Foundation",
        short_name: "শিশুফুল",
        description: "সুবিধাবঞ্চিত শিশুদের শিক্ষা, স্বাস্থ্য ও সামাজিক উন্নয়নে নিবেদিত",
        theme_color: "#e91e8c",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        categories: ["education", "social", "nonprofit"],
        icons: [
          { src: "/pwa-icons/icon-72x72.png", sizes: "72x72", type: "image/png" },
          { src: "/pwa-icons/icon-96x96.png", sizes: "96x96", type: "image/png" },
          { src: "/pwa-icons/icon-128x128.png", sizes: "128x128", type: "image/png" },
          { src: "/pwa-icons/icon-144x144.png", sizes: "144x144", type: "image/png" },
          { src: "/pwa-icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
          { src: "/pwa-icons/icon-192x192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/pwa-icons/icon-384x384.png", sizes: "384x384", type: "image/png" },
          { src: "/pwa-icons/icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
