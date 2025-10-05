import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    proxy: {
      "/api": {
        target: process.env.VITE_API_URL || "http://localhost:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
        secure: false,
        ws: true
      }
    }
  },
  build: {
    outDir: "dist",
    sourcemap: true
  },
  define: {
    // Make env vars available in the app
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || '')
  }
});
