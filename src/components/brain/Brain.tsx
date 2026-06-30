import { Component, lazy, Suspense, useEffect, useState, type ReactNode } from 'react'
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
 * - The brain animates (slow auto-rotation + gentle pulse) by design, on every
 *   device, regardless of the OS "reduce motion" setting.
 */
export default function Brain() {
  const [webgl, setWebgl] = useState(true)
  const fallback = (
    <div className="absolute inset-0">
      <BrainFallback pulse />
    </div>
  )

  // Detect WebGL on the client after mount (avoids SSR/hydration mismatch).
  useEffect(() => {
    setWebgl(isWebGLAvailable())
  }, [])

  if (!webgl) {
    return fallback
  }

  // The 3D wireframe brain is the prominent layer. The static SVG is used only
  // while the 3D chunk loads or if WebGL throws — not as a permanent underlay.
  // The R3F <Canvas> is rendered as a direct child of the definite-height
  // aspect-square wrapper (no intermediate div) so it measures a real size.
  return (
    <BrainErrorBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <BrainScene animate />
      </Suspense>
    </BrainErrorBoundary>
  )
}
