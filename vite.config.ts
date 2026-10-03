import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // Served from the custom apex domain https://aura-secure.se/, so assets live
  // at the domain root. (Was '/AURA/' back when this was a project Pages site
  // at https://<user>.github.io/AURA/ — GitHub now redirects that to the
  // custom domain, so '/AURA/' would 404 every asset.)
  base: '/',
  plugins: [react()],
  build: {
    outDir: '_site'
  }
})
