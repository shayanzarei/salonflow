import { defineConfig } from "vitest/config";
import path from "node:path";

/**
 * Vitest config — unit tests only (pure functions, no DB, no Next.js runtime).
 *
 * The `@/...` alias is wired manually here to mirror tsconfig.json's
 * `"@/*": ["./*"]` mapping. We avoid `vite-tsconfig-paths` because it ships
 * ESM-only and the Vite config loader still uses CJS in this project.
 *
 * Tests live under `tests/unit/...` mirroring the lib structure.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
    globals: false,
    isolate: false,
    reporters: process.env.CI ? ["default", "github-actions"] : ["default"],
  },
});
