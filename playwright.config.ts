import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30000,
  use: {
    baseURL: "http://localhost:3001",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    // --turbopack is explicit so the test works on Next 15.x where it isn't the default
    command: "pnpm exec next dev --turbopack --port 3001",
    port: 3001,
    reuseExistingServer: false,
    timeout: 90000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
