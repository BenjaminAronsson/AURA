import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // Served from https://<user>.github.io/AURA/, so asset URLs must be
  // prefixed with the repo name rather than the domain root.
  base: '/AURA/',
  plugins: [react()],
  build: {
    outDir: '_site'
  }
})
