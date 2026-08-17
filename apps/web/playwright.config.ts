import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const baseURL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false, // shared JSON-file-backed dev DB — sequential avoids cross-test interference
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], launchOptions: { executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" } },
    },
  ],
  webServer: {
    // Fresh seeded DB for every E2E run (deletes the dev .data/db.json first).
    command: `rm -rf .data && npm run dev -- -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
