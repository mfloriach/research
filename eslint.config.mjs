import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "no-restricted-properties": [
        "error",
        {
          object: "process",
          property: "env",
          message: "Read environment through @/lib/config instead of process.env.",
        },
      ],
    },
  },
  {
    files: ["lib/config.ts", "lib/config.test.ts", "jest.setup.ts"],
    rules: {
      "no-restricted-properties": "off",
    },
  },
  {
    // Playwright runs outside the app (CI flags, server env): the
    // @/lib/config indirection does not apply to test orchestration.
    files: ["playwright.config.ts", "e2e/**/*"],
    rules: {
      "no-restricted-properties": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Foundry dependencies (OpenZeppelin, forge-std) ship their own sources.
    "contracts/**",
  ]),
]);

export default eslintConfig;
