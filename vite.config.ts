import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import svgrPlugin from "vite-plugin-svgr";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    svgrPlugin(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto", // 👈 auto inject SW
      devOptions: {
        enabled: process.env.NODE_ENV === "development",
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024, // 6MB
      },
      manifest: {
        name: "VolunteerHub",
        short_name: "VH",
        description: "Ứng dụng quản lý thiện nguyện",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        icons: [
          {
            src: "/logo-remove-bg.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/logo-remove-bg.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/logo-remove-bg.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
  server: {
    port: 3000,
    proxy: {
      "/api": "http://localhost:4000",
    },
  },
  build: {
    sourcemap: true,
    outDir: "dist",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
