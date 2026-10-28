import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "coverage",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.stories.*",
        "src/**/*.test.*",
        "src/test/**",
        "src/**/*.d.ts",
        "src/**/index.ts",
        "src/**/*.config.*",
        "src/**/{dist,build,coverage,storybook-static}/**",
      ],
    },
  },
});
