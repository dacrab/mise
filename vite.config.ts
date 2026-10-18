import { resolve } from "node:path";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { consola } from "consola";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

const hasSentryConfig = Boolean(
  process.env["SENTRY_ORG"] && process.env["SENTRY_PROJECT"] && process.env["SENTRY_AUTH_TOKEN"],
);

export default defineConfig(({ command }) => {
  if (command === "build") consola.level = 2;
  return {
    resolve: {
      alias: {
        "@/": `${resolve(import.meta.dirname, "src")}/`,
        "convex/_generated/": `${resolve(import.meta.dirname, "convex/_generated")}/`,
        // Shared constants under convex/ must beat the npm `convex` package
        "convex/lib/": `${resolve(import.meta.dirname, "convex/lib")}/`,
      },
    },
    plugins: [
      tanstackStart(),
      nitro({ preset: "vercel", logLevel: 2 }),
      tailwindcss(),
      ...(hasSentryConfig
        ? [
            sentryVitePlugin({
              org: process.env["SENTRY_ORG"],
              project: process.env["SENTRY_PROJECT"],
              authToken: process.env["SENTRY_AUTH_TOKEN"],
              telemetry: false,
              silent: true,
              sourcemaps: {
                assets: [".vercel/output/static/**"],
              },
            }),
          ]
        : []),
    ],
    build: {
      sourcemap: true,
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        onwarn(warning, warn) {
          if (warning.code === "MODULE_LEVEL_DIRECTIVE") return;
          if (warning.code === "UNUSED_EXTERNAL_IMPORT") return;
          warn(warning);
        },
      },
    },
  };
});
