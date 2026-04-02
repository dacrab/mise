import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import pluginRouter from "@tanstack/eslint-plugin-router";
import pluginQuery from "@tanstack/eslint-plugin-query";
import pluginVitest from "eslint-plugin-vitest";
import globals from "globals";

// ─── Shared rule sets ───────────────────────────────────────────────────────

const tsBase = {
  "no-unused-vars": "off",
  "no-undef": "off",
  "no-redeclare": "off",
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
  "@typescript-eslint/consistent-type-assertions": ["error", {
    assertionStyle: "as",
    objectLiteralTypeAssertions: "never",
  }],
  "@typescript-eslint/no-unnecessary-type-assertion": "off",
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
  "no-nested-ternary": "error",
  "no-unneeded-ternary": "error",
  "curly": ["error", "multi-line"],
  "default-case-last": "error",
  "no-else-return": ["error", { allowElseIf: false }],
  "no-lone-blocks": "error",
  "no-useless-return": "error",
};

// ─── Helper factory for common config patterns ──────────────────────────────

const createTsConfig = (files, overrides = {}) => ({
  files,
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: { ecmaVersion: "latest", sourceType: "module" },
    globals: { ...globals.es2022, ...overrides.globals },
  },
  plugins: { "@typescript-eslint": tseslint.plugin, ...overrides.plugins },
  rules: { ...tsBase, ...generalSafety, ...overrides.rules },
  ...overrides.extra,
});

// ─── Config objects ─────────────────────────────────────────────────────────

const srcConfig = createTsConfig(
  ["src/**/*.{ts,tsx}"],
  {
    globals: { ...globals.browser },
    plugins: { "react-hooks": reactHooks },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
      "no-console": ["error", { allow: ["warn", "error"] }],
      "no-restricted-globals": ["error",
        { name: "location", message: "Use useRouter() or navigate() from @tanstack/react-router instead of window.location." },
      ],
      "no-restricted-syntax": ["error",
        { selector: "CallExpression[callee.name='confirm']", message: "Use a toast-based double-tap confirmation instead of confirm()." },
        { selector: "CallExpression[callee.name='alert']", message: "Use toast() instead of alert()." },
        { selector: "CallExpression[callee.name='prompt']", message: "Use a proper form input instead of prompt()." },
      ],
    },
    extra: {
      languageOptions: {
        ecmaFeatures: { jsx: true },
        globals: { React: "readonly" },
      },
    },
  }
);

const srcTsxOverride = {
  files: ["src/**/*.tsx"],
  rules: { "no-nested-ternary": "off" },
};

const convexConfig = createTsConfig(
  ["convex/**/*.ts"],
  {
    globals: { ...globals.node },
    rules: {
      "no-console": ["error", { allow: ["warn", "error"] }],
      "no-empty": ["error", { allowEmptyCatch: false }],
      "@typescript-eslint/no-non-null-assertion": "warn",
    },
  }
);

const unitTestConfig = createTsConfig(
  ["tests/unit/**/*.test.{ts,tsx}", "src/**/*.test.{ts,tsx}"],
  {
    globals: { ...globals.browser, ...pluginVitest.environments.env.globals },
    plugins: { vitest: pluginVitest },
    rules: {
      ...pluginVitest.configs.recommended.rules,
      "vitest/expect-expect": "error",
      "vitest/no-focused-tests": "error",
      "vitest/no-disabled-tests": "warn",
      "vitest/consistent-test-it": ["error", { fn: "it" }],
      "vitest/no-duplicate-hooks": "error",
      "vitest/valid-expect": "error",
      "vitest/valid-title": "error",
      "vitest/max-nested-describe": ["warn", { max: 2 }],
      "vitest/prefer-to-be": "error",
      "vitest/prefer-to-have-length": "error",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "no-console": "off",
      "prefer-template": "warn",
    },
  }
);

const e2eTestConfig = createTsConfig(
  ["tests/e2e/**/*.spec.ts"],
  {
    globals: { ...globals.node },
    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "no-restricted-syntax": ["error",
        { selector: "CallExpression[callee.property.name='waitForTimeout']", message: "Use waitForLoadState() or waitForSelector() instead of waitForTimeout() — time-based waits are flaky." },
      ],
      "no-console": "off",
    },
  }
);

const fixturesConfig = createTsConfig(
  ["tests/fixtures/**/*.ts", "tests/setup.ts"],
  {
    globals: { ...globals.node },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "no-console": "off",
    },
  }
);

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
  {
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
  },
];
