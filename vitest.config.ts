import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],

    // Vitest should only run unit and component tests.
    exclude: [
      "e2e/**",
      "**/node_modules/**",
      "**/dist/**",
      "**/.next/**",
      "**/playwright-report/**",
      "**/test-results/**",
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
