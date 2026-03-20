/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // NOTE: For docker you must comment out the VITE_DEV_BACKEND_URL or use http://server:8000 in mobile/.env
  const backendUrl = env.VITE_DEV_BACKEND_URL || 'http://server:8000'

  return {
    plugins: [react(), tsconfigPaths()],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setup-tests.ts',
    },
    server: {
      host: '0.0.0.0',  // Allow connections from all interfaces
      proxy: {
        '/api': {
          target: backendUrl + '/api',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api/, ''),
        },
        '/ws': {
          target: backendUrl.replace(/^http/, 'ws'),
          ws: true,
          changeOrigin: true,
          secure: false,
          rewrite: path => path
        }
      },
      port: 8080,
      // When running behind a reverse proxy (e.g. Traefik), the HMR WebSocket
      // must connect on the proxy's port (80), not the internal Vite port (8080).
      // clientPort tells the browser which port to use; Vite still listens on 8080.
      // Set VITE_HMR_HOST to the external hostname (e.g. "myapp.localhost").
      hmr: env.VITE_HMR_HOST
        ? { host: env.VITE_HMR_HOST, clientPort: 80, protocol: 'ws' }
        : undefined,
    },
    cacheDir: process.env.VITE_CACHE_DIR || "node_modules/.vite",
  }
})
