import { useEffect, useState } from 'react'

/**
 * Returns true when the user has requested reduced motion at the OS level.
 * Used to disable auto-rotation, flicker, and other non-essential animation.
 */
export function usePrefersReducedMotion(): boolean {
  const query = '(prefers-reduced-motion: reduce)'
  const [prefersReduced, setPrefersReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  )

  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setPrefersReduced(mql.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return prefersReduced
}
