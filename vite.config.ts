import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves this project from https://vashtag.github.io/Portfolio/,
// so all assets are referenced from the "/Portfolio/" base path. Using an
// unconditional base keeps `vite build` and `vite preview` in agreement (dev
// runs at http://localhost:<port>/Portfolio/).
export default defineConfig({
  base: '/Portfolio/',
  plugins: [react()],
})
