import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts", "tests/api/**/*.test.ts"],
    exclude: ["tests/e2e/**"],
    hookTimeout: 20_000,
    // Integration/API tests each chdir() into their own temp working
    // directory so lib/server/db.ts (path.join(process.cwd(), ".data", ...))
    // writes to an isolated JSON file. process.cwd() is process-global, so
    // parallel worker threads would race on it — force a single thread.
    poolOptions: { threads: { singleThread: true } },
  },
});
