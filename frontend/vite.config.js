import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
  ],
  server: {
    proxy: {
      // Proxy API requests to the backend so cookies are same-origin in dev
      '/users': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
      '/products': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
      '/likes': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
      '/refresh': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
      '/logout': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
      '/userInfo': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
      '/admin': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
      '/orders': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
      '/search': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
