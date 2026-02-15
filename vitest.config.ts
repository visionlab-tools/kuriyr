import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
  },
  resolve: {
    // Vitest runs under Node.js which can't resolve bun:sqlite
    alias: {
      'bun:sqlite': resolve(__dirname, 'src/test/bun-sqlite-shim.ts'),
    },
  },
})
