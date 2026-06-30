import { type CSSProperties, useCallback, useEffect, useRef, useState } from 'react'
import About from './screens/About'
import Research from './screens/Research'
import Teaching from './screens/Teaching'
import Projects from './screens/Projects'
import Contact from './screens/Contact'

type Channel = 'about' | 'research' | 'projects' | 'teaching' | 'contact'

const TAB_ORDER: Channel[] = ['research', 'projects', 'teaching', 'contact']
const ALL_ORDER: Channel[] = ['about', ...TAB_ORDER]

const ACCENTS: Record<Channel, string> = {
  about:    '#4dffa0',
  research: '#5fe0ff',
  projects: '#ff6ad5',
  teaching: '#ffc83d',
  contact:  '#c7ff4d',
}

const TITLES: Record<Channel, string> = {
  about: 'HOME', research: 'RESEARCH', projects: 'PROJECTS', teaching: 'TEACHING', contact: 'CONTACT',
}

const BOOT_LINES = [
  'NEURO.SYS BIOS  v3.14', '',
  '> DETECTING CORTEX............. OK',
  '> LOADING SYNAPTIC DRIVERS..... OK',
  '> MOUNTING /dev/brain......... OK',
  '> CALIBRATING EEG ARRAY....... OK', '',
  'SYSTEM READY.',
  '> LAUNCHING PORTFOLIO_',
]

function chLabel(ch: Channel) {
  if (ch === 'about') return 'HOME'
  return `CH ${String(TAB_ORDER.indexOf(ch) + 1).padStart(2, '0')} — ${TITLES[ch]}`
}

export default function App() {
  const [current, setCurrent]     = useState<Channel>('about')
  const [stageFlip, setStageFlip] = useState('')
  const [glitchOn, setGlitchOn]   = useState(false)
  const [bootDone, setBootDone]   = useState(false)
  const [bootText, setBootText]   = useState('')
  const [clock, setClock]         = useState('')
  const busy = useRef(false)

  const accent = ACCENTS[current]

  /* ── clock ────────────────────────────────────────────────────────── */
  useEffect(() => {
    const tick = () => setClock(new Date().toTimeString().slice(0, 8))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  /* ── boot sequence ────────────────────────────────────────────────── */
  useEffect(() => {
    let stopped = false
    let li = 0; let ci = 0
    const tick = () => {
      if (stopped) return
      if (li >= BOOT_LINES.length) { setTimeout(() => { if (!stopped) setBootDone(true) }, 60); return }
      const line = BOOT_LINES[li]
      setBootText(BOOT_LINES.slice(0, li).join('\n') + (li > 0 ? '\n' : '') + line.slice(0, ci))
      if (ci < line.length) { ci = Math.min(line.length, ci + 5); setTimeout(tick, 9) }
      else { li++; ci = 0; setTimeout(tick, 12) }
    }
    setTimeout(tick, 30)
    return () => { stopped = true }
  }, [])

  /* ── channel flip ─────────────────────────────────────────────────── */
  const flip = useCallback((ch: Channel) => {
    if (busy.current || ch === current) return
    busy.current = true
    setGlitchOn(true)
    setStageFlip('nav-crt-off')
    setTimeout(() => { setCurrent(ch); setStageFlip('nav-crt-on') }, 205)
    setTimeout(() => { busy.current = false; setStageFlip(''); setGlitchOn(false) }, 700)
  }, [current])

  /* ── keyboard shortcuts ───────────────────────────────────────────── */
  useEffect(() => {
    const map: Record<string, Channel> = {
      '1': 'research', '2': 'projects', '3': 'teaching', '4': 'contact',
      '0': 'about', h: 'about', H: 'about',
    }
    const onKey = (e: KeyboardEvent) => {
      if (map[e.key]) { e.preventDefault(); flip(map[e.key]) }
      else if (e.key === 'ArrowRight') { const i = ALL_ORDER.indexOf(current); flip(ALL_ORDER[(i + 1) % ALL_ORDER.length]) }
      else if (e.key === 'ArrowLeft')  { const i = ALL_ORDER.indexOf(current); flip(ALL_ORDER[(i - 1 + ALL_ORDER.length) % ALL_ORDER.length]) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [current, flip])

  /* ── render ───────────────────────────────────────────────────────── */
  const v = (s: CSSProperties): CSSProperties => s   // no-op, just for IDE hints

  return (
    <div style={v({
      ['--accent' as string]: accent,
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'clamp(8px,2.2vw,32px)',
      background: 'radial-gradient(120% 120% at 50% 0%,#0a1410 0%,#03060a 60%,#01030500 100%),#03060a',
      fontFamily: "'IBM Plex Mono',monospace",
      color: '#7dffb0',
    })}>

      {/* ── BEZEL ──────────────────────────────────────────────────────── */}
      <div style={v({
        position: 'relative',
        width: '100%',
        maxWidth: 1380,
        background: 'linear-gradient(180deg,#171c19,#0a0d0b 60%,#06080a)',
        borderRadius: 26,
        padding: 'clamp(12px,1.6vw,22px)',
        boxShadow: '0 40px 90px -20px rgba(0,0,0,.85),inset 0 2px 2px rgba(255,255,255,.06),inset 0 -6px 18px rgba(0,0,0,.7)',
        border: '1px solid #20271f',
      })}>

        {/* ── SCREEN ─────────────────────────────────────────────────────── */}
        <div style={v({
          position: 'relative',
          borderRadius: 16,
          overflow: 'hidden',
          background: 'radial-gradient(130% 130% at 50% 40%,#06140d 0%,#04100a 55%,#020806 100%)',
          minHeight: 'min(82vh,860px)',
          height: 'min(82vh,860px)',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid #0c160f',
          boxShadow: 'inset 0 0 1px 1px rgba(77,255,160,.12)',
        })}>

          {/* ── TOP BAR ──────────────────────────────────────────────────── */}
          <div style={v({
            position: 'relative', zIndex: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
            padding: '6px clamp(14px,2vw,26px)',
            borderBottom: '1px solid rgba(77,255,160,.22)',
            background: 'linear-gradient(180deg,rgba(77,255,160,.07),transparent)',
          })}>
            <button
              onClick={() => flip('about')}
              style={v({ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, fontFamily: "'VT323',monospace", fontSize: 22, letterSpacing: 1, color: 'var(--accent)', background: 'none', border: 'none', padding: 0 })}
            >
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 10px var(--accent)', display: 'inline-block', animation: 'blink 1.6s steps(1) infinite' }} />
              NEURO.SYS
            </button>
            <div style={v({ fontFamily: "'VT323',monospace", fontSize: 23, letterSpacing: 2, color: '#bfffd9', textShadow: '0 0 8px var(--accent)' })}>
              {chLabel(current)}
            </div>
            <div style={v({ fontFamily: "'VT323',monospace", fontSize: 20, color: 'rgba(140,255,195,.75)' })}>
              {clock}
            </div>
          </div>

          {/* ── NAV TABS ─────────────────────────────────────────────────── */}
          <div style={v({
            position: 'relative', zIndex: 20,
            display: 'flex', alignItems: 'center', gap: 'clamp(16px,3vw,38px)',
            padding: '7px clamp(14px,2vw,26px)',
            borderBottom: '1px solid rgba(77,255,160,.22)',
            background: 'linear-gradient(180deg,rgba(77,255,160,.06),transparent)',
            flexWrap: 'wrap',
          })}>
            {TAB_ORDER.map(ch => (
              <button
                key={ch}
                onClick={() => flip(ch)}
                style={v({
                  cursor: 'pointer',
                  fontFamily: "'IBM Plex Mono',monospace", fontWeight: 600,
                  fontSize: 13, letterSpacing: 2.5,
                  padding: '4px 2px',
                  border: 'none',
                  borderBottom: `2px solid ${current === ch ? 'var(--accent)' : 'transparent'}`,
                  background: 'transparent',
                  color: current === ch ? 'var(--accent)' : 'rgba(150,255,200,.5)',
                  textShadow: current === ch ? '0 0 10px var(--accent)' : 'none',
                  transition: 'all .15s',
                })}
              >
                {TITLES[ch]}
              </button>
            ))}
            <div style={v({ marginLeft: 'auto', fontFamily: "'VT323',monospace", fontSize: 18, letterSpacing: 1, color: 'rgba(125,255,176,.45)' })}>
              ⌂ HOME · 1–4 · ◄ ►
            </div>
          </div>

          {/* ── STAGE ────────────────────────────────────────────────────── */}
          <div className={stageFlip} style={v({ position: 'relative', zIndex: 10, flex: 1, minHeight: 0, transformOrigin: 'center' })}>
            <About    visible={current === 'about'}    />
            <Research visible={current === 'research'} />
            <Teaching visible={current === 'teaching'} />
            <Projects visible={current === 'projects'} />
            <Contact  visible={current === 'contact'}  />
          </div>

          {/* ── FOOTER ───────────────────────────────────────────────────── */}
          <div style={v({
            position: 'relative', zIndex: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
            padding: '9px clamp(14px,2vw,26px)',
            borderTop: '1px solid rgba(77,255,160,.22)',
            background: 'linear-gradient(0deg,rgba(77,255,160,.06),transparent)',
            flexWrap: 'wrap',
            fontFamily: "'VT323',monospace", fontSize: 18, letterSpacing: 1,
            color: 'rgba(125,255,176,.5)',
          })}>
            <span>◄ ► CHANGE CHANNEL &nbsp;·&nbsp; SELECT TAB ABOVE</span>
            <span>© 2026 S.IZADI</span>
          </div>

          {/* ── OVERLAYS ─────────────────────────────────────────────────── */}
          {/* Scanlines */}
          <div style={v({ position: 'absolute', inset: 0, zIndex: 40, pointerEvents: 'none', background: 'repeating-linear-gradient(0deg,rgba(0,0,0,0) 0px,rgba(0,0,0,0) 2px,rgba(0,0,0,.16) 3px,rgba(0,0,0,.16) 4px)', backgroundSize: '100% 4px' })} />
          {/* Dot drift */}
          <div style={v({ position: 'absolute', inset: 0, zIndex: 41, pointerEvents: 'none', background: 'radial-gradient(circle,rgba(0,0,0,0) 0%,rgba(0,0,0,0) 32%,rgba(0,0,0,.5) 80%)', backgroundSize: '3px 3px', mixBlendMode: 'multiply', opacity: .55, animation: 'dotdrift 8s linear infinite' })} />
          {/* Vignette */}
          <div style={v({ position: 'absolute', inset: 0, zIndex: 42, pointerEvents: 'none', borderRadius: 16, boxShadow: 'inset 0 0 100px 18px rgba(0,0,0,.7),inset 0 0 30px rgba(0,0,0,.5)' })} />
          {/* Flicker */}
          <div style={v({ position: 'absolute', inset: 0, zIndex: 43, pointerEvents: 'none', background: '#7dffb0', mixBlendMode: 'overlay', animation: 'flick 7s infinite' })} />
          {/* Glitch – channel-switch burst */}
          {glitchOn && (
            <div style={v({ position: 'absolute', inset: 0, zIndex: 44, pointerEvents: 'none', background: 'repeating-linear-gradient(0deg,rgba(255,255,255,.08) 0 1px,transparent 1px 3px),linear-gradient(90deg,rgba(255,40,120,.25),transparent 40%,rgba(50,200,255,.25))', animation: 'staticburst .45s steps(3) forwards' })} />
          )}

          {/* ── BOOT ─────────────────────────────────────────────────────── */}
          {!bootDone && (
            <div
              onClick={() => setBootDone(true)}
              style={v({ position: 'absolute', inset: 0, zIndex: 60, background: '#02080a', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' })}
            >
              <pre style={v({
                margin: 0,
                fontFamily: "'IBM Plex Mono',monospace",
                fontSize: 'clamp(12px,1.5vw,16px)',
                lineHeight: 1.7,
                color: '#4dffa0',
                textShadow: '0 0 8px #4dffa0',
                maxWidth: '90%',
                whiteSpace: 'pre-wrap',
              })}>
                {bootText}
              </pre>
            </div>
          )}

        </div>{/* /screen */}
      </div>{/* /bezel */}
    </div>
  )
}
