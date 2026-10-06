/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'node:child_process'
import { defineConfig, type Plugin } from 'vite'

/** Commit the build came from: GITHUB_SHA in CI, else the local HEAD. */
function buildId(): string {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA.slice(0, 7)
  try {
    return execSync('git rev-parse --short=7 HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
  } catch {
    return 'dev'
  }
}

const BUILD_ID = buildId()
const BUILT_AT = new Date().toISOString()

/** Publishes version.json next to the app so open copies can spot a newer deploy. */
function versionFile(): Plugin {
  return {
    name: 'version-file',
    apply: 'build',
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'version.json', source: JSON.stringify({ buildId: BUILD_ID, builtAt: BUILT_AT }) })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  // Relative asset paths work at any address: the custom domain root, the github.io sub-path
  // or a local preview. Routing is hash-based, so the page itself always loads from index.html.
  base: './',
  define: {
    __BUILD_ID__: JSON.stringify(BUILD_ID),
    __BUILT_AT__: JSON.stringify(BUILT_AT),
  },
  plugins: [react(), tailwindcss(), versionFile()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
  },
})
