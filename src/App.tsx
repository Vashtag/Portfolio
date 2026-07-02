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
  about: 'ABOUT ME', research: 'RESEARCH', projects: 'PROJECTS', teaching: 'TEACHING', contact: 'CONTACT',
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
  if (ch === 'about') return 'ABOUT ME'
  return `CH ${String(TAB_ORDER.indexOf(ch) + 1).padStart(2, '0')} — ${TITLES[ch]}`
}

export default function App() {
  const [current, setCurrent]     = useState<Channel>('about')
  const [stageFlip, setStageFlip] = useState('')
  const [glitchOn, setGlitchOn]   = useState(false)
  const [bootDone, setBootDone]   = useState(false)
  const [bootText, setBootText]   = useState('')
  const [clock, setClock]         = useState('')
  const [isMobile, setIsMobile]   = useState(false)
  const busy = useRef(false)

  const accent = ACCENTS[current]

  /* ── mobile breakpoint (declutters the top bar / nav only on phones) ──── */
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

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
    // Log the channel as a page view (GoatCounter, if configured — no-ops otherwise)
    const gc = (window as unknown as { goatcounter?: { count?: (o: object) => void } }).goatcounter
    gc?.count?.({ path: `/${ch}`, title: `NEURO.SYS — ${TITLES[ch]}`, event: false })
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
      alignItems: 'stretch',
      boxSizing: 'border-box',
      justifyContent: 'center',
      padding: 'clamp(4px,0.8vw,10px)',
      background: 'radial-gradient(120% 120% at 50% 0%,#0a1410 0%,#03060a 60%,#01030500 100%),#03060a',
      fontFamily: "'IBM Plex Mono',monospace",
      color: '#7dffb0',
    })}>

      {/* ── BEZEL ──────────────────────────────────────────────────────── */}
      <div style={v({
        position: 'relative',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(180deg,#1a1f1c,#0c0f0d 60%,#07090b)',
        borderRadius: 14,
        padding: 'clamp(5px,0.7vw,9px)',
        boxShadow: '0 24px 60px -12px rgba(0,0,0,.9),inset 0 2px 2px rgba(255,255,255,.05),inset 0 -4px 12px rgba(0,0,0,.6)',
        border: '1px solid #1e2620',
      })}>

        {/* ── SCREEN ─────────────────────────────────────────────────────── */}
        <div style={v({
          position: 'relative',
          overflow: 'hidden',
          background: 'radial-gradient(130% 130% at 50% 40%,#06140d 0%,#04100a 55%,#020806 100%)',
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 6,
          border: '1px solid rgba(77,255,160,.18)',
          boxShadow: '0 0 0 2px rgba(0,0,0,.9), inset 0 0 0 1px rgba(77,255,160,.06)',
        })}>

          {/* ── TOP BAR ──────────────────────────────────────────────────── */}
          <div style={v({
            position: 'relative', zIndex: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: isMobile ? 8 : 12,
            padding: isMobile ? '6px 12px' : '6px clamp(14px,2vw,26px)',
            borderBottom: '1px solid rgba(77,255,160,.22)',
            background: 'linear-gradient(180deg,rgba(77,255,160,.07),transparent)',
          })}>
            <div style={v({ display: 'flex', alignItems: 'center', gap: isMobile ? 7 : 10, fontFamily: "'VT323',monospace", fontSize: isMobile ? 18 : 22, letterSpacing: 1, color: 'var(--accent)' })}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 10px var(--accent)', display: 'inline-block', animation: 'blink 1.6s steps(1) infinite' }} />
              NEURO.SYS
            </div>
            <div style={v({ display: 'flex', alignItems: 'center', gap: 16 })}>
              <div style={v({ fontFamily: "'VT323',monospace", fontSize: isMobile ? 16 : 20, color: 'rgba(140,255,195,.75)' })}>{clock}</div>
              {/* Channel label is redundant with the highlighted tab on mobile — hide it there */}
              {!isMobile && (
                <div style={v({ fontFamily: "'VT323',monospace", fontSize: 23, letterSpacing: 2, color: '#bfffd9', textShadow: '0 0 8px var(--accent)' })}>{chLabel(current)}</div>
              )}
            </div>
            <button
              onClick={() => flip('about')}
              style={v({ cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: "'VT323',monospace", fontSize: isMobile ? 16 : 20, letterSpacing: isMobile ? 1 : 2, color: current === 'about' ? 'var(--accent)' : 'rgba(140,255,195,.7)', background: 'none', border: `1px solid ${current === 'about' ? 'var(--accent)' : 'rgba(77,255,160,.3)'}`, borderRadius: 4, padding: isMobile ? '2px 8px' : '2px 12px', textShadow: current === 'about' ? '0 0 10px var(--accent)' : 'none', transition: 'all .15s' })}
            >
              ABOUT ME
            </button>
          </div>

          {/* ── NAV TABS ─────────────────────────────────────────────────── */}
          <div style={v({
            position: 'relative', zIndex: 20,
            display: 'flex', alignItems: 'center',
            justifyContent: isMobile ? 'space-between' : 'flex-start',
            gap: isMobile ? '4px' : 'clamp(16px,3vw,38px)',
            padding: isMobile ? '6px 12px' : '7px clamp(14px,2vw,26px)',
            borderBottom: '1px solid rgba(77,255,160,.22)',
            background: 'linear-gradient(180deg,rgba(77,255,160,.06),transparent)',
            flexWrap: 'wrap',
          })}>
            {TAB_ORDER.map(ch => (
              <button
                key={ch}
                onClick={() => flip(ch)}
                className="nav-tab"
                style={v({
                  ['--tab-glow' as string]: current === ch ? '1' : '0.42',
                  cursor: 'pointer',
                  fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700,
                  fontSize: isMobile ? 12.5 : 16,
                  letterSpacing: isMobile ? 1 : 2.5,
                  padding: isMobile ? '7px 4px' : '8px 10px',
                  border: 'none',
                  background: 'transparent',
                  color: current === ch ? 'var(--accent)' : 'rgba(180,255,215,.78)',
                  textShadow: current === ch
                    ? '0 0 16px var(--accent), 0 0 6px var(--accent)'
                    : '0 0 8px rgba(77,255,160,.4)',
                  transition: 'color .15s',
                })}
              >
                {TITLES[ch]}
              </button>
            ))}
            {/* Keyboard-shortcut hint is meaningless on touch — desktop only */}
            {!isMobile && (
            <div style={v({ marginLeft: 'auto', fontFamily: "'VT323',monospace", fontSize: 18, letterSpacing: 1, color: 'rgba(125,255,176,.45)' })}>
              ⌂ ABOUT ME · 1–4 · ◄ ►
            </div>
            )}
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
          {/* transform (GPU-composited) instead of background-position (full repaint);
              multiply blend dropped — with pure-black dots it's identical to normal alpha */}
          <div style={v({ position: 'absolute', inset: 0, zIndex: 41, pointerEvents: 'none', overflow: 'hidden' })}>
            <div style={v({ position: 'absolute', inset: -3, background: 'radial-gradient(circle,rgba(0,0,0,0) 0%,rgba(0,0,0,0) 32%,rgba(0,0,0,.5) 80%)', backgroundSize: '3px 3px', opacity: .55, animation: 'dotdrift 8s linear infinite', willChange: 'transform' })} />
          </div>
          {/* Vignette */}
          <div style={v({ position: 'absolute', inset: 0, zIndex: 42, pointerEvents: 'none', borderRadius: 6, boxShadow: 'inset 0 0 100px 18px rgba(0,0,0,.7),inset 0 0 30px rgba(0,0,0,.5)' })} />
          {/* CRT glass bulge — convex highlight simulating curved phosphor glass */}
          <div style={v({ position: 'absolute', inset: 0, zIndex: 43, pointerEvents: 'none', borderRadius: 6, background: 'radial-gradient(ellipse 90% 75% at 50% 38%, rgba(255,255,255,.028) 0%, rgba(255,255,255,.010) 38%, transparent 68%), radial-gradient(ellipse 55% 35% at 50% 12%, rgba(255,255,255,.032) 0%, transparent 100%)' })} />
          {/* Flicker */}
          <div style={v({ position: 'absolute', inset: 0, zIndex: 43, pointerEvents: 'none', background: '#7dffb0', opacity: .02, animation: 'flick 7s infinite' })} />
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
