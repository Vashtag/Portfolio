import { useEffect, useRef, useState } from 'react'
import Brain from './brain/Brain'
import { profile } from '../content'

// Types out the hero name letter-by-letter.
function useTypewriter(text: string, enabled: boolean) {
  const [out, setOut] = useState(enabled ? '' : text)

  useEffect(() => {
    if (!enabled) {
      setOut(text)
      return
    }
    setOut('')
    let i = 0
    const id = setInterval(() => {
      i++
      setOut(text.slice(0, i))
      if (i >= text.length) clearInterval(id)
    }, 70)
    return () => clearInterval(id)
  }, [text, enabled])

  return out
}

export default function Hero() {
  const typed = useTypewriter(profile.heroTyped, true)
  const brainRef = useRef<HTMLDivElement>(null)

  return (
    <section
      id="hero"
      className="relative flex flex-col items-center justify-center py-20 px-margin-mobile md:px-margin-desktop overflow-hidden border-b border-outline-variant"
    >
      <div
        ref={brainRef}
        role="img"
        aria-label="Interactive 3D point-cloud brain"
        className="relative w-full max-w-2xl aspect-square flex items-center justify-center"
      >
        <Brain />
        {/* Decorative crosshair lines */}
        <div className="absolute top-0 left-0 w-32 h-px bg-outline-variant rotate-45 origin-left pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-32 h-px bg-outline-variant rotate-45 origin-right pointer-events-none" />
      </div>

      <div className="text-center mt-8 space-y-4 z-10">
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-primary-fixed-dim crt-glow uppercase tracking-widest">
          <span className="terminal-cursor">{typed}</span>
        </h1>
        <p className="font-label-caps text-label-caps text-on-surface-variant tracking-widest opacity-80">
          {profile.heroSubtitle}
        </p>
      </div>
    </section>
  )
}
