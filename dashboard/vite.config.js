import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: ruta donde se publica en GitHub Pages
export default defineConfig({
  plugins: [react()],
  base: '/Seguridad-alimentaria-y-producci-n-global-3/',
})
