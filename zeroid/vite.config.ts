import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://cookbook.covidian.life/etapi",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        // Control how chunks are created by specifying manual chunks
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // Return the name for vendors chunks
            return "vendor";
          }
        },
      },
    },
    // Increase the chunk size warning limit to 600kB if your application needs it
    chunkSizeWarningLimit: 3500,
  },
  publicDir: "public",
});
