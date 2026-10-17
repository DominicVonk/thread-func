import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    testTimeout: 10000,
    // Workers load these modules with Node's loader too. Keep both sides on
    // the same module code and call sites instead of Vite's transformed copy.
    server: { deps: { external: [/tests\/fixtures-dist\//] } },
  },
});
