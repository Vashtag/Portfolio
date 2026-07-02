import type { CSSProperties } from 'react'
import Brain from '../components/brain/Brain'

const h1Style: CSSProperties = {
  margin: '4px 0 0',
  fontFamily: "'Archivo',sans-serif",
  fontWeight: 900,
  fontSize: 'clamp(40px,6.2vw,86px)',
  lineHeight: .88,
  letterSpacing: -2,
  color: 'var(--accent)',
  textShadow: '1px 0 rgba(255,40,120,.5),-1px 0 rgba(50,200,255,.5),0 0 26px var(--accent)',
}

export default function About({ visible }: { visible: boolean }) {
  return (
    <section style={{
      position: 'absolute', inset: 0,
      display: visible ? 'flex' : 'none',
      flexDirection: 'column',
      overflow: 'auto',
      padding: 'clamp(20px,3vw,46px)',
    }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(20px,3vw,48px)', flex: 1, minHeight: 0, alignItems: 'stretch' }}>

        {/* Left: bio */}
        <div style={{ flex: '1 1 340px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h1 style={h1Style}>SIYAVASH<br />IZADI</h1>
          <div style={{ marginTop: 14, fontFamily: "'VT323',monospace", fontSize: 24, letterSpacing: 2, color: '#bfffd9' }}>PhD · NEUROSCIENCE</div>
          <p style={{ margin: '18px 0 0', maxWidth: '48ch', fontSize: 15, lineHeight: 1.7, color: 'rgba(190,255,215,.82)' }}>
            Neuroscientist, educator, and toolmaker at the University of Waterloo. My research studies how people adapt to virtual reality — perceptual upright, sensory re-weighting, and the physiology of cybersickness. I teach and design learning for hundreds of students each term, and I build apps &amp; tools that turn ideas into things you can click.
          </p>

          {/* Education — four degrees */}
          <div style={{ marginTop: 22 }}>
            <div style={{ fontFamily: "'VT323',monospace", fontSize: 18, letterSpacing: 2, color: 'rgba(125,255,176,.6)', marginBottom: 8 }}>EDUCATION — 4 DEGREES</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontFamily: "'IBM Plex Mono',monospace", fontSize: 12.5 }}>
              {[
                ['PhD', 'Neuroscience', 'University of Waterloo', '2026'],
                ['MSc', 'Neuroscience', 'University of Waterloo', '2020'],
                ['BSc', 'Neuroscience', 'University of Waterloo', '2017'],
                ['BSc', 'Biology', 'Simon Fraser University', '2014'],
              ].map(([deg, field, school, year]) => (
                <div key={deg + year} style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                  <span style={{ color: 'var(--accent)', fontFamily: "'VT323',monospace", fontSize: 19, minWidth: 40 }}>{deg}</span>
                  <span style={{ color: '#d9ffe7', flex: 1 }}>{field} <span style={{ color: 'rgba(190,255,215,.55)' }}>· {school}</span></span>
                  <span style={{ color: 'rgba(125,255,176,.5)' }}>{year}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: brain */}
        <div style={{ flex: '1 1 360px', display: 'flex', flexDirection: 'column', minWidth: 300 }}>
          <div style={{ position: 'relative', flex: 1, minHeight: 240 }}>
            <div style={{ position: 'absolute', top: 8, left: 12, zIndex: 2, fontFamily: "'VT323',monospace", fontSize: 18, letterSpacing: 1, color: 'rgba(125,255,176,.4)' }}>NEURAL.MAP — live</div>
            <Brain />
          </div>
        </div>

      </div>
    </section>
  )
}
