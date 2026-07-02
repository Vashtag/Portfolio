import type { CSSProperties } from 'react'
import EegPanel from '../components/brain/EegPanel'

const h1Style: CSSProperties = {
  margin: '4px 0 0',
  fontFamily: "'Archivo',sans-serif",
  fontWeight: 900,
  fontSize: 'clamp(40px,6vw,82px)',
  lineHeight: .9,
  letterSpacing: -2,
  color: 'var(--accent)',
  textShadow: '1px 0 rgba(255,40,120,.5),-1px 0 rgba(50,200,255,.5),0 0 26px var(--accent)',
}

const theses = [
  { year: '2026', title: 'Perceptual Upright and Sensory Re-weighting During Exposure to Virtual Reality', kind: 'PhD Dissertation · University of Waterloo' },
  { year: '2020', title: 'Physiological Determinants of Cybersickness', kind: 'MSc Thesis · University of Waterloo' },
]

const researchTags = ['VIRTUAL REALITY', 'CYBERSICKNESS', 'PERCEPTUAL ADAPTATION', 'SENSORY RE-WEIGHTING', 'PSYCHOPHYSICS']

export default function Research({ visible }: { visible: boolean }) {
  return (
    <section style={{
      position: 'absolute', inset: 0,
      display: visible ? 'flex' : 'none',
      flexDirection: 'column',
      overflow: 'auto',
      padding: 'clamp(20px,3vw,46px)',
    }}>
      <h1 style={h1Style}>RESEARCH</h1>

      <p style={{ margin: '14px 0 0', maxWidth: '60ch', fontSize: 14.5, lineHeight: 1.7, color: 'rgba(200,240,255,.8)' }}>
        Human-subjects neuroscience on how people perceive and adapt to virtual reality — the sense of perceptual
        upright, how the brain re-weights conflicting sensory cues, and the physiology behind cybersickness and
        individual differences. Recognized through NSERC Science Action and GRADflix.
      </p>

      <div style={{ marginTop: 18, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {researchTags.map(tag => (
          <span key={tag} style={{ fontSize: 11, letterSpacing: 1, padding: '5px 11px', border: '1px solid rgba(95,224,255,.5)', color: '#9fefff', borderRadius: 3 }}>
            {tag}
          </span>
        ))}
      </div>

      <div style={{ marginTop: 24, fontFamily: "'VT323',monospace", fontSize: 20, letterSpacing: 2, color: 'rgba(95,224,255,.6)' }}>THESES</div>
      <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 2, fontSize: 14 }}>
        {theses.map(pub => (
          <div key={pub.year + pub.title} style={{ display: 'flex', gap: 14, padding: '13px 4px', borderBottom: '1px solid rgba(77,255,160,.14)' }}>
            <span style={{ color: 'var(--accent)', fontFamily: "'VT323',monospace", fontSize: 19, minWidth: 54 }}>{pub.year}</span>
            <span style={{ color: '#d9ffe7', lineHeight: 1.5 }}>
              <em style={{ color: '#bfffd9', fontStyle: 'normal' }}>{pub.title}</em>{' '}
              <span style={{ color: 'rgba(125,255,176,.55)' }}>— {pub.kind}</span>
            </span>
          </div>
        ))}
      </div>

      {/* EEG panel — interactive: move your cursor across it */}
      <div style={{ position: 'relative', marginTop: 24, height: 160, border: '1px solid rgba(95,224,255,.22)', borderRadius: 10, overflow: 'hidden', background: 'rgba(2,8,12,.5)', flexShrink: 0 }}>
        <div style={{ position: 'absolute', top: 8, right: 12, zIndex: 2, pointerEvents: 'none', textAlign: 'right', fontFamily: "'VT323',monospace", letterSpacing: 1, color: 'rgba(95,224,255,.6)' }}>
          <div style={{ fontSize: 18 }}>EEG.ARRAY — 4ch</div>
          <div style={{ fontSize: 14, color: 'rgba(95,224,255,.4)' }}>move cursor to modulate ↻</div>
        </div>
        <EegPanel />
      </div>
    </section>
  )
}
