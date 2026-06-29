import { Component, lazy, Suspense, useEffect, useState, type ReactNode } from 'react'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { isWebGLAvailable } from '../../lib/webgl'
import BrainFallback from './BrainFallback'

// Lazy-load the heavy three.js scene so it's split into its own chunk and kept
// out of the initial page payload.
const BrainScene = lazy(() => import('./BrainScene'))

class BrainErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }

    return this.props.children
  }
}

/**
 * The hero brain centerpiece.
 *
 * - Renders the interactive 3D wireframe brain when WebGL is available.
 * - Falls back to a static SVG brain when WebGL is missing, while the 3D chunk
 *   loads, or if a browser/GPU-specific WebGL error occurs.
 * - Auto-rotation / pulsing is disabled when the user prefers reduced motion.
 */
export default function Brain() {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [webgl, setWebgl] = useState(true)
  const fallback = (
    <div className="w-full h-full min-h-64">
      <BrainFallback pulse={!prefersReducedMotion} />
    </div>
  )

  // Detect WebGL on the client after mount (avoids SSR/hydration mismatch).
  useEffect(() => {
    setWebgl(isWebGLAvailable())
  }, [])

  if (!webgl) {
    return fallback
  }

  return (
    <div className="relative w-full h-full min-h-64">
      <div className="absolute inset-0 opacity-35">
        <BrainFallback pulse={false} />
      </div>
      <div className="relative w-full h-full min-h-64">
        <BrainErrorBoundary fallback={fallback}>
          <Suspense fallback={fallback}>
            <BrainScene animate={!prefersReducedMotion} />
          </Suspense>
        </BrainErrorBoundary>
      </div>
    </div>
  )
}
