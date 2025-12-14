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
    chunkSizeWarningLimit: 3000,
    target: 'esnext',
    commonjsOptions: {
      // Transform CommonJS modules to ESM
      transformMixedEsModules: true,
      include: [/node_modules/]
    }
    // Disable manual chunks to avoid circular dependency issues with Aptos SDK
  }
})
