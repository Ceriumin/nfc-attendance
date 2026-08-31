import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
    test: {
        // Run in a plain Node environment (not a browser DOM) — this is a backend.
        environment: "node",
        // Auto-discover test files in the top-level tests/ folder (beside src/).
        include: ["tests/**/*.test.ts"],
        // Let you use test/expect/describe without importing them in every file.
        globals: true,
    },
    resolve: {
        alias: {
            // Mirror the tsconfig "@/*" -> "./src/*" mapping so imports resolve in tests too.
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
});
