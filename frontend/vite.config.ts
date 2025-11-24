import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/**/*.test.ts']
  },
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (!id.includes('node_modules')) {
            return undefined
          }
          if (id.includes('@aptos-labs')) {
            return 'vendor_aptos'
          }
          if (id.includes('react')) {
            return 'vendor_react'
          }
          if (id.includes('tweetnacl')) {
            return 'vendor_crypto'
          }
          if (id.includes('tailwindcss')) {
            return 'vendor_tailwind'
          }
          return 'vendor_misc'
        }
      }
    }
  }
})
