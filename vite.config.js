import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import glsl from 'vite-plugin-glsl' // <-- Impor plugin

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), glsl()],
})