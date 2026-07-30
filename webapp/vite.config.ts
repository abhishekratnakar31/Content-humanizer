import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../webapp_public',
    emptyOutDir: true
  },
  server: {
    proxy: {
      '/api/v1': {
        target: 'https://content-humanizer-f9499.web.app',
        changeOrigin: true,
        secure: true,
      }
    }
  }
})

