import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { createRequire } from "module";
import { resolve } from "path";

const require = createRequire(import.meta.url);

// Framework subpaths must resolve to the `convex` package, not the local
// `./convex` dir (which only holds our functions). List them before the
// broad `convex` alias so vite doesn't shadow them.
const convexFrameworkAliases = ["values", "server"].map((sub) => ({
  find: new RegExp(`^convex/${sub}$`),
  replacement: require.resolve(`convex/${sub}`),
}));

export default defineConfig({
  plugins: [react()],
  // Aliases must be defined here since vitest runs outside of vite's build pipeline
  resolve: {
    alias: [
      { find: "@", replacement: resolve(__dirname, "./src") },
      ...convexFrameworkAliases,
      { find: "convex", replacement: resolve(__dirname, "./convex") },
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
      exclude: [
        "src/routeTree.gen.ts",
        "src/**/*.d.ts",
      ],
    },
  },
});
