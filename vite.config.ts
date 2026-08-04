import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";
import { consola } from "consola";

const hasSentryConfig = Boolean(process.env.SENTRY_ORG && process.env.SENTRY_PROJECT && process.env.SENTRY_AUTH_TOKEN);

export default defineConfig(({ command }) => {
  if (command === "build") consola.level = 2;
  return {
    resolve: {
      alias: {
        "@/": `${resolve(import.meta.dirname!, "src")}/`,
        "convex/_generated/": `${resolve(import.meta.dirname!, "convex/_generated")}/`,
      },
    },
    plugins: [
      tanstackStart(),
      nitro({ preset: "vercel", logLevel: 2 }),
      tailwindcss(),
      ...(hasSentryConfig
        ? [
            sentryVitePlugin({
              org: process.env.SENTRY_ORG,
              project: process.env.SENTRY_PROJECT,
              authToken: process.env.SENTRY_AUTH_TOKEN,
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
      rolldownOptions: {
        checks: {
          pluginTimings: false,
        },
      },
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
