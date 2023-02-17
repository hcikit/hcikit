import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./manifest.json" assert { type: "json" };

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        panel: "pages/panel.html",
      },
    },
  },
  plugins: [react(), crx({ manifest })],
});
