import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import * as path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    build: {
      assetsDir: 'static',
    },
    plugins: [vue()],
    resolve: {
      alias: [{ find: '@', replacement: path.resolve(__dirname, 'src') }],
    },
    server: {
      proxy: {
        '/api': {
          target: (env.VITE_DEV_BACKEND_URL || 'http://server:8000') + '/api',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
      port: 8080,
    },
    cacheDir: process.env.VITE_CACHE_DIR || 'node_modules/.vite',
  }
})
