import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@/": `${resolve(import.meta.dirname!, "src")}/`,
      "convex/_generated/": `${resolve(import.meta.dirname!, "convex/_generated")}/`,
    },
  },
  plugins: [tanstackStart(), tailwindcss()],
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === "MODULE_LEVEL_DIRECTIVE") return;
        if (warning.code === "UNUSED_EXTERNAL_IMPORT") return;
        warn(warning);
      },
    },
  },
});
