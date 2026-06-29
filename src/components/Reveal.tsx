import { useEffect, useRef, type ReactNode } from 'react'

/**
 * Wraps content in a scroll-revealed <section>. The section fades/rises into
 * view once via IntersectionObserver. The `.reveal` CSS already collapses to a
 * no-op under prefers-reduced-motion.
 */
export default function Reveal({
  children,
  id,
  className = '',
}: {
  children: ReactNode
  id?: string
  className?: string
}) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} id={id} className={`reveal ${className}`}>
      {children}
    </section>
  )
}
