import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests (see `e2e/`). Run with `npm run test:e2e`.
 *
 * The dev server is started automatically unless one is already listening
 * (handy locally); CI always boots a fresh one. JWT/Mongo fixtures come
 * from the regular `.env.local` + `npm run db:seed` workflow.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Two workers: five parallel browsers starve the dev server's lazy
  // compiles and click-stability checks flake. CI already runs serially.
  workers: process.env.CI ? 1 : 2,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  // First paint compiles routes lazily under parallel workers; allow room.
  expect: {
    timeout: 10 * 1000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    env: {
      // Silence telemetry for e2e boots.
      NEXT_TELEMETRY_DISABLED: "1",
    },
  },
});
