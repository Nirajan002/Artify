import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": { target: "http://artify-2.runasp.net", changeOrigin: true },
      "/uploads": { target: "http://artify-2.runasp.net", changeOrigin: true },
    },
  },
});