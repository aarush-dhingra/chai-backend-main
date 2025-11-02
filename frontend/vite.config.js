import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/user': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/video': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/comment': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/like': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/subscription': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/tweet': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/playlist': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    }
  }
})
