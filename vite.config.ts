import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import svgrPlugin from 'vite-plugin-svgr'

// https://vite.dev/config/
export default defineConfig({
  envDir: './env',
  plugins: [react(), tsconfigPaths(), svgrPlugin()],
  server: {
    port: 3000,
    proxy: {
      "/api": "http://localhost:8080"
    }
  },
  build: {
    sourcemap: true,
    outDir: 'dist',
  },
})