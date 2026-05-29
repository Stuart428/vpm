import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
  base: '/vpm/', 
  plugins: [
    react(),
    nodePolyfills()
  ],

  resolve: {
    alias: {
      crypto: 'crypto-browserify',
      buffer: 'buffer',
      process: 'process/browser'
    }
  },

  define: {
    global: 'globalThis'
  }
})