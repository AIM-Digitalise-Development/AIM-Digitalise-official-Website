import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Change manualChunks from OBJECT to FUNCTION
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // Split vendor chunks for better caching
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor'
            }
            if (id.includes('react-helmet-async')) {
              return 'ui'
            }
            // Optional: Add more chunk splitting if needed
            if (id.includes('framer-motion')) {
              return 'framer'
            }
            if (id.includes('i18next') || id.includes('react-i18next')) {
              return 'i18n'
            }
            if (id.includes('@tanstack/react-query')) {
              return 'query'
            }
            if (id.includes('axios')) {
              return 'axios'
            }
            if (id.includes('zustand')) {
              return 'state'
            }
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  },
  // Remove esbuild options entirely (or comment them out for Vercel)
  // esbuild: {
  //   drop: ['console', 'debugger'],
  // },
  server: {
    port: 3000,
    open: true,
  },
})