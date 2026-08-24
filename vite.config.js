import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/CI-CD-Pipeline-Generator/',
  plugins: [react()],
})
