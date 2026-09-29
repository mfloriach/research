import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

const config = createJestConfig({
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testMatch: ["**/*.test.[jt]s?(x)"],
  testPathIgnorePatterns: ["/node_modules/", "/.next/", "/contracts/", "/docs/"],
  // tsconfig has `paths` without `baseUrl`, which next/jest does not map.
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/$1" },
});

export default config;
