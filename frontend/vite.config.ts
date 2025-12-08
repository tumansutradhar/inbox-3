import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    // Pre-bundle Aptos SDK to avoid circular dependency issues
    include: ['@aptos-labs/ts-sdk', '@aptos-labs/wallet-adapter-react'],
    esbuildOptions: {
      // Needed for Aptos SDK
      target: 'esnext'
    }
  },
  build: {
    chunkSizeWarningLimit: 2000,
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (!id.includes('node_modules')) {
            return undefined
          }
          // Don't split Aptos packages to avoid circular dependency issues
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
