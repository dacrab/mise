import { createRequire } from "node:module";
import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const require = createRequire(import.meta.url);

const convexFrameworkAliases = ["values", "server"].map((sub) => ({
  find: new RegExp(`^convex/${sub}$`),
  replacement: require.resolve(`convex/${sub}`),
}));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: "@", replacement: resolve(import.meta.dirname, "./src") },
      ...convexFrameworkAliases,
      { find: "convex", replacement: resolve(import.meta.dirname, "./convex") },
    ],
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    clearMocks: true,
    restoreMocks: true,
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/routeTree.gen.ts", "src/**/*.d.ts"],
    },
  },
});
