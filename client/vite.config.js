import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0", // Listen on all interfaces
    port: 5173, // Default Vite port
    strictPort: true, // Fail if port is taken
    hmr: {
      host: "localhost", // ensure hot reload works from host
    },
    proxy: {
      "/api": "http://backend:3000",
    },
  },
});
