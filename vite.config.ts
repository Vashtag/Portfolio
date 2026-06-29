import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves this project from https://vashtag.github.io/portfolio/,
// so all assets are referenced from the "/portfolio/" base path. Using an
// unconditional base keeps `vite build` and `vite preview` in agreement (dev
// runs at http://localhost:<port>/portfolio/).
export default defineConfig({
  base: '/portfolio/',
  plugins: [react()],
  build: {
    // Split the heavy 3D libraries into their own chunk so the brain scene is
    // code-split out of the initial bundle parse.
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three', '@react-three/fiber'],
        },
      },
    },
  },
})
