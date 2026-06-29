import { lazy, Suspense, useEffect, useState } from 'react'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { isWebGLAvailable } from '../../lib/webgl'
import BrainFallback from './BrainFallback'

// Lazy-load the heavy three.js scene so it's split into its own chunk and kept
// out of the initial page payload.
const BrainScene = lazy(() => import('./BrainScene'))

/**
 * The hero brain centerpiece.
 *
 * - Renders the interactive 3D point-cloud brain when WebGL is available.
 * - Falls back to a static SVG brain when WebGL is missing (and as the
 *   Suspense placeholder while the 3D chunk loads).
 * - Auto-rotation / pulsing is disabled when the user prefers reduced motion.
 */
export default function Brain() {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [webgl, setWebgl] = useState(true)

  // Detect WebGL on the client after mount (avoids SSR/hydration mismatch).
  useEffect(() => {
    setWebgl(isWebGLAvailable())
  }, [])

  if (!webgl) {
    return <BrainFallback pulse={!prefersReducedMotion} />
  }

  return (
    <Suspense fallback={<BrainFallback pulse={!prefersReducedMotion} />}>
      <BrainScene animate={!prefersReducedMotion} />
    </Suspense>
  )
}
