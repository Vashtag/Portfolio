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
          <div style={{ fontFamily: "'VT323',monospace", fontSize: 20, letterSpacing: 3, color: 'rgba(125,255,176,.6)', marginBottom: 6 }}>&gt; whoami</div>
          <h1 style={h1Style}>SIYAVASH<br />IZADI</h1>
          <div style={{ marginTop: 14, fontFamily: "'VT323',monospace", fontSize: 24, letterSpacing: 2, color: '#bfffd9' }}>PhD · NEUROSCIENCE</div>
          <p style={{ margin: '18px 0 0', maxWidth: '46ch', fontSize: 15, lineHeight: 1.7, color: 'rgba(190,255,215,.82)' }}>
            Neuroscientist, educator, and toolmaker. I earned my PhD studying how brains compute, I teach at the University of Waterloo, and I build apps &amp; tools that turn ideas into things you can click. Equal parts wet-lab curiosity and late-night code.
          </p>
          <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 7, fontFamily: "'IBM Plex Mono',monospace", fontSize: 13 }}>
            {[
              ['TEACHES', 'University of Waterloo'],
              ['BUILDS', 'Apps · Tools · Experiments'],
              ['FIELD', 'Computational Neuroscience'],
              ['RUNS ON', 'Coffee & curiosity'],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', gap: 14 }}>
                <span style={{ color: 'rgba(125,255,176,.5)', width: 84 }}>{label}</span>
                <span style={{ color: '#d9ffe7' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: brain */}
        <div style={{ flex: '1 1 360px', display: 'flex', flexDirection: 'column', minWidth: 300 }}>
          <div style={{ position: 'relative', flex: 1, minHeight: 240, border: '1px solid rgba(77,255,160,.22)', borderRadius: 10, overflow: 'hidden', background: 'rgba(2,12,8,.5)' }}>
            <div style={{ position: 'absolute', top: 8, left: 12, zIndex: 2, fontFamily: "'VT323',monospace", fontSize: 18, letterSpacing: 1, color: 'rgba(125,255,176,.6)' }}>NEURAL.MAP — live</div>
            <Brain />
          </div>
        </div>

      </div>
    </section>
  )
}
