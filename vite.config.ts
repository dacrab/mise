import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";

// NOTE: Do NOT add @vitejs/plugin-react here.
// tanstackStart() already includes the React plugin internally.
// Having both causes duplicate transform pipelines and HMR conflicts.
export default defineConfig({
  server: {
    port: 3000,
  },
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // "use client" directives from RSC-compatible packages are harmless in TanStack Start
        if (warning.code === "MODULE_LEVEL_DIRECTIVE") return;
        // Unused imports in TanStack Start's internal SSR packages — not our code
        if (warning.code === "UNUSED_EXTERNAL_IMPORT") return;
        warn(warning);
      },
    },
  },
  plugins: [
    tsConfigPaths(),
    tanstackStart(),
    tailwindcss(),
  ],
  environments: {
    client: {
      build: {
        rollupOptions: {
          output: {
            // Split vendor chunks for better long-term caching.
            // Only applied to client build — SSR externalizes these modules.
            manualChunks: {
              "vendor-react": ["react", "react-dom"],
              "vendor-tanstack": [
                "@tanstack/react-router",
                "@tanstack/react-query",
                "@tanstack/react-router-with-query",
              ],
              // @convex-dev/auth has no root export (subpaths only) — excluded
              "vendor-convex": ["convex", "@convex-dev/react-query"],
              "vendor-ui": ["@base-ui-components/react", "@heroicons/react"],
            },
          },
        },
      },
    },
  },
});
