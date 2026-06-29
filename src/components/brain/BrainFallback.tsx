// Static SVG brain shown when WebGL is unavailable or while the 3D scene loads.
// Stylised phosphor-green wireframe brain -- lightweight and dependency-free.
export default function BrainFallback({ pulse = false }: { pulse?: boolean }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={`w-full h-full min-h-64 text-[#5dff8a] opacity-90 drop-shadow-[0_0_28px_rgba(93,255,138,0.55)] ${
        pulse ? 'animate-pulse' : ''
      }`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      aria-hidden="true"
    >
      {/* Two hemispheres */}
      <path d="M100 30C84 22 60 28 54 44c-14 1-24 14-19 28-9 9-9 24 1 32-2 13 8 24 21 24 7 10 22 13 33 5 4 3 9 4 14 4" />
      <path d="M100 30c16-8 40-2 46 14 14 1 24 14 19 28 9 9 9 24-1 32 2 13-8 24-21 24-7 10-22 13-33 5-4 3-9 4-14 4" />
      {/* Central fissure */}
      <line x1="100" y1="30" x2="100" y2="170" opacity="0.5" />
      {/* A few "gyri" folds */}
      <path d="M66 60c8 4 10 14 4 20s-4 16 4 20" opacity="0.7" />
      <path d="M134 60c-8 4-10 14-4 20s4 16-4 20" opacity="0.7" />
      <path d="M74 104c8 0 14 6 14 14" opacity="0.6" />
      <path d="M126 104c-8 0-14 6-14 14" opacity="0.6" />
      <path d="M84 78c6 2 8 10 4 14" opacity="0.55" />
      <path d="M116 78c-6 2-8 10-4 14" opacity="0.55" />
    </svg>
  )
}
