import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves this project from https://vashtag.github.io/portfolio/,
// so assets must be referenced from the "/portfolio/" base path in production.
// During local dev we use "/" so the dev server works normally.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/portfolio/' : '/',
  plugins: [react()],
  build: {
    // Split the heavy 3D libraries into their own chunk so the initial
    // payload stays small and the brain can be lazy-loaded.
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three', '@react-three/fiber', '@react-three/drei'],
        },
      },
    },
  },
}))
