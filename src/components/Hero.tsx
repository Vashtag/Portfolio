import { useEffect, useRef, useState } from 'react'
import Brain from './brain/Brain'
import EegPanel from './brain/EegPanel'
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
      <div className="grid w-full max-w-5xl grid-cols-1 gap-4 lg:grid-cols-[1.35fr_0.85fr]">
        <div
          ref={brainRef}
          role="img"
          aria-label="Live 2D neural map of an anatomical brain"
          className="glass-panel relative min-h-[320px] overflow-hidden border border-primary-fixed-dim/25 bg-surface-container-low/60 sm:min-h-[430px]"
        >
          <div className="absolute left-4 top-3 z-10 font-code-sm text-code-sm uppercase tracking-[0.22em] text-primary-fixed-dim/70">
            NEURAL.MAP — live
          </div>
          <Brain />
        </div>

        <div
          role="img"
          aria-label="Live four-channel EEG trace"
          className="glass-panel relative min-h-[220px] overflow-hidden border border-secondary-fixed/25 bg-surface-container-low/60 lg:self-end"
        >
          <div className="absolute right-4 top-3 z-10 font-code-sm text-code-sm uppercase tracking-[0.22em] text-secondary-fixed/75">
            EEG.ARRAY — 4CH
          </div>
          <EegPanel />
        </div>
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
