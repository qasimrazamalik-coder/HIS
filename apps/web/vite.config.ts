import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 650,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/three")) return "three";
          if (id.includes("node_modules/chart.js") || id.includes("node_modules/react-chartjs-2")) return "charts";
          return undefined;
        }
      }
    }
  },
  server: {
    port: 5173
  }
});
