# NEURO_OS — Portfolio

A retro-terminal / CRT themed personal portfolio for **Dr. Siyavash Izadi** —
neuroscientist, educator at the University of Waterloo, and builder of tools.
Phosphor-green on near-black, scanlines, and an interactive 3D brain centerpiece.

Built with **Vite + React + TypeScript + Tailwind CSS**, with the 3D brain
powered by **three.js / React Three Fiber**.

## Develop

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # type-check + production build to dist/
npm run preview  # preview the production build
```

## Editing content

All site copy (name, links, bio, research, projects) lives in
[`src/content.ts`](src/content.ts). Change the strings/arrays there — no need to
touch the components.

Key links to update with your real URLs/handles:

- `links.github`
- `links.linkedin`
- `links.email`

## Deployment

The site deploys to **GitHub Pages** via
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) on every push to
`main`. In the repository settings, set **Settings → Pages → Build and
deployment → Source** to **GitHub Actions**.

The production base path is `/Portfolio/` (see `vite.config.ts`), serving the
site at `https://vashtag.github.io/Portfolio/`. If the repository name changes,
update `base` in `vite.config.ts` and `homepage` in `package.json`.

## Accessibility & performance

- Respects `prefers-reduced-motion` (disables flicker, scanline shimmer, and
  reveal animations).
- The 3D brain is lazy-loaded and falls back to a static visual when WebGL is
  unavailable.
