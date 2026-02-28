import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split recharts into its own chunk (it's large)
          recharts: ["recharts"],
          // React core
          "react-vendor": ["react", "react-dom"],
        },
      },
    },
  },
  preview: {
    port: 4173,
  },
});