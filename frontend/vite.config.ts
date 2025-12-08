import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    // Pre-bundle dependencies to avoid ESM/CJS issues
    include: ['@aptos-labs/ts-sdk', '@aptos-labs/wallet-adapter-react', 'tweetnacl', 'eventemitter3'],
    esbuildOptions: {
      target: 'esnext'
    }
  },
  build: {
    chunkSizeWarningLimit: 2000,
    target: 'esnext',
    commonjsOptions: {
      // Transform CommonJS modules to ESM
      transformMixedEsModules: true,
      include: [/node_modules/]
    },
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (!id.includes('node_modules')) {
            return undefined
          }
          // Keep all Aptos-related packages together to avoid initialization order issues
          if (id.includes('@aptos-labs') || id.includes('tweetnacl') || id.includes('eventemitter3')) {
            return 'vendor_aptos'
          }
          if (id.includes('react')) {
            return 'vendor_react'
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
