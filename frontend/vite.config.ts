import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:8080",
      "/actuator": "http://localhost:8080",
      "/v3/api-docs": "http://localhost:8080",
    },
  },
  build: {
    target: "es2022",
    outDir: "../src/main/resources/static",
    emptyOutDir: true,
    cssCodeSplit: true,
    sourcemap: false,
    reportCompressedSize: false,
  },
});
