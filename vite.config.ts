import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  root: "client", // Set the root to the client directory
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src"),
    },
  },
  build: {
    outDir: "../dist", // Output to root dist directory
    emptyOutDir: true,
  },
  server: {
    port: 5000,
    host: true,
    allowedHosts: [
      "490db23e-7242-49e8-8d7b-c73a04de1785-00-3717szjgpm0xs.spock.replit.dev",
      "localhost",
      "127.0.0.1"
    ],
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
}); 