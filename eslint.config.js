import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import pluginRouter from "@tanstack/eslint-plugin-router";
import pluginQuery from "@tanstack/eslint-plugin-query";
import pluginVitest from "eslint-plugin-vitest";
import globals from "globals";

// ─── Shared TypeScript rule sets ─────────────────────────────────────────────

const tsBase = {
  "no-unused-vars": "off",                    // replaced by @typescript-eslint version
  "no-undef": "off",                          // TypeScript handles this
  "no-redeclare": "off",                      // TypeScript handles this
  "@typescript-eslint/no-unused-vars": ["error", {
    argsIgnorePattern: "^_",
    varsIgnorePattern: "^_",
    caughtErrorsIgnorePattern: "^_",
    destructuredArrayIgnorePattern: "^_",
  }],
  "@typescript-eslint/no-explicit-any": "error",
  "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports", fixStyle: "inline-type-imports" }],
  "@typescript-eslint/no-import-type-side-effects": "error",
  "@typescript-eslint/no-non-null-assertion": "error",
  // prefer-optional-chain requires type-aware linting (project: true) — skipped
  // "@typescript-eslint/prefer-optional-chain": "error",
  "@typescript-eslint/consistent-type-assertions": ["error", {
    assertionStyle: "as",
    objectLiteralTypeAssertions: "never",
  }],
  "@typescript-eslint/no-unnecessary-type-assertion": "off", // requires type-aware linting
  "@typescript-eslint/array-type": ["error", { default: "array-simple" }],
  "@typescript-eslint/prefer-as-const": "error",
};

const generalSafety = {
  "prefer-const": "error",
  "no-var": "error",
  "eqeqeq": ["error", "always", { null: "ignore" }],
  "no-constant-condition": ["error", { checkLoops: false }],
  "no-promise-executor-return": "error",
  "no-unreachable": "error",
  "no-self-compare": "error",
  "no-template-curly-in-string": "error",
  "no-useless-rename": "error",
  "object-shorthand": "error",
  "prefer-template": "error",
  // no-nested-ternary: error for logic, but JSX conditional rendering
  // legitimately uses nested ternaries — overridden to "off" in TSX config below.
  "no-nested-ternary": "error",
  "no-unneeded-ternary": "error",
  "curly": ["error", "multi-line"],
  "default-case-last": "error",
  "no-else-return": ["error", { allowElseIf: false }],
  "no-lone-blocks": "error",
  "no-useless-return": "error",
};

// ─── Global ignores ───────────────────────────────────────────────────────────

const ignores = {
  ignores: [
    "dist/**",
    ".output/**",
    ".tanstack/**",
    ".vinxi/**",
    "node_modules/**",
    "src/routeTree.gen.ts",
    "convex/_generated/**",
    "coverage/**",
  ],
};

// ─── src/ — React + TanStack Start ───────────────────────────────────────────

// TSX overrides — relaxed rules specific to React component files
const srcTsxOverride = {
  files: ["src/**/*.tsx"],
  rules: {
    // Nested ternaries in JSX className/children are idiomatic React — allow them
    "no-nested-ternary": "off",
  },
};

const srcConfig = {
  files: ["src/**/*.{ts,tsx}"],
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      ecmaFeatures: { jsx: true },
    },
    globals: {
      ...globals.browser,
      ...globals.es2022,
      React: "readonly",
    },
  },
  plugins: {
    "@typescript-eslint": tseslint.plugin,
    "react-hooks": reactHooks,
  },
  rules: {
    ...tsBase,
    ...generalSafety,

    // React hooks — enforce correct hook usage
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "error",   // upgraded from warn → error

    // Console — only warn/error allowed in app code
    "no-console": ["error", { allow: ["warn", "error"] }],

    // Null assertions banned everywhere in src — use optional chaining + nullish coalescing
    "@typescript-eslint/no-non-null-assertion": "error",

    // No window.location hard-reloads — everything goes through the router
    "no-restricted-globals": ["error",
      { name: "location", message: "Use useRouter() or navigate() from @tanstack/react-router instead of window.location." },
    ],

    // No browser confirm/alert/prompt — use toast-based UX
    "no-restricted-syntax": ["error",
      {
        selector: "CallExpression[callee.name='confirm']",
        message: "Use a toast-based double-tap confirmation instead of confirm().",
      },
      {
        selector: "CallExpression[callee.name='alert']",
        message: "Use toast() instead of alert().",
      },
      {
        selector: "CallExpression[callee.name='prompt']",
        message: "Use a proper form input instead of prompt().",
      },
    ],
  },
};

// ─── convex/ — Node.js server functions ──────────────────────────────────────

const convexConfig = {
  files: ["convex/**/*.ts"],
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: { ecmaVersion: "latest", sourceType: "module" },
    globals: { ...globals.node, ...globals.es2022 },
  },
  plugins: { "@typescript-eslint": tseslint.plugin },
  rules: {
    ...tsBase,
    ...generalSafety,

    // Convex runs in Node — no browser globals
    "no-console": ["error", { allow: ["warn", "error"] }],

    // Convex mutations/queries must never silently swallow errors
    "no-empty": ["error", { allowEmptyCatch: false }],

    // Null assertions are fine in Convex handlers after explicit checks
    "@typescript-eslint/no-non-null-assertion": "warn",

  },
};

// ─── tests/unit/ — Vitest unit tests ─────────────────────────────────────────

const unitTestConfig = {
  files: ["tests/unit/**/*.test.{ts,tsx}", "src/**/*.test.{ts,tsx}"],
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: { ecmaVersion: "latest", sourceType: "module" },
    globals: {
      ...globals.browser,
      ...globals.es2022,
      ...pluginVitest.environments.env.globals,
    },
  },
  plugins: {
    "@typescript-eslint": tseslint.plugin,
    vitest: pluginVitest,
  },
  rules: {
    ...tsBase,
    ...generalSafety,
    ...pluginVitest.configs.recommended.rules,

    // Enforce every test has at least one assertion
    "vitest/expect-expect": "error",
    // Block committed .only calls — they skip the rest of the suite
    "vitest/no-focused-tests": "error",
    // Warn on skipped tests so they don't accumulate silently
    "vitest/no-disabled-tests": "warn",
    // Enforce consistent it() style
    "vitest/consistent-test-it": ["error", { fn: "it" }],
    // No duplicate test names in a suite
    "vitest/no-duplicate-hooks": "error",
    // Catch wrong assertion usage like expect(fn) without ()
    "vitest/valid-expect": "error",
    // Enforce meaningful test titles
    "vitest/valid-title": "error",
    // Prevent nesting describe blocks more than 2 levels
    "vitest/max-nested-describe": ["warn", { max: 2 }],
    // Each test should have exactly one assertion concept
    "vitest/prefer-to-be": "error",
    "vitest/prefer-to-have-length": "error",

    // Relaxed for tests
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    "no-console": "off",
    "prefer-template": "warn",
  },
};

// ─── tests/e2e/ — Playwright E2E tests ───────────────────────────────────────

const e2eTestConfig = {
  files: ["tests/e2e/**/*.spec.ts"],
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: { ecmaVersion: "latest", sourceType: "module" },
    globals: { ...globals.node, ...globals.es2022 },
  },
  plugins: { "@typescript-eslint": tseslint.plugin },
  rules: {
    ...tsBase,
    ...generalSafety,

    // Playwright uses ! assertions heavily (page.locator()!)
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-explicit-any": "warn",

    // No raw waitForTimeout — use waitForSelector/waitForLoadState
    "no-restricted-syntax": ["error",
      {
        selector: "CallExpression[callee.property.name='waitForTimeout']",
        message: "Use waitForLoadState() or waitForSelector() instead of waitForTimeout() — time-based waits are flaky.",
      },
    ],

    // Logging is fine in E2E
    "no-console": "off",
  },
};

// ─── tests/fixtures/ — Shared test helpers ────────────────────────────────────

const fixturesConfig = {
  files: ["tests/fixtures/**/*.ts", "tests/setup.ts"],
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: { ecmaVersion: "latest", sourceType: "module" },
    globals: { ...globals.node, ...globals.es2022 },
  },
  plugins: { "@typescript-eslint": tseslint.plugin },
  rules: {
    ...tsBase,
    ...generalSafety,
    "@typescript-eslint/no-explicit-any": "warn",
    "no-console": "off",
  },
};

export default [
  eslint.configs.recommended,
  ...pluginRouter.configs["flat/recommended"],
  ...pluginQuery.configs["flat/recommended"],
  srcConfig,
  srcTsxOverride,
  convexConfig,
  unitTestConfig,
  e2eTestConfig,
  fixturesConfig,
  ignores,
];
