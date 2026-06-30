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

const publications = [
  { year: '2025', citation: 'Izadi, S., et al.', title: '[Publication title — update in content]', journal: 'Journal of Computational Neuroscience.' },
  { year: '2024', citation: 'Izadi, S., & [Co-author]', title: '[Publication title — update in content]', journal: 'Neuron.' },
  { year: '2023', citation: '[Author], & Izadi, S.', title: '[Publication title — update in content]', journal: 'eLife.' },
  { year: '2022', citation: 'Izadi, S.', title: '[Doctoral thesis title — update in content]', journal: 'PhD Dissertation.' },
]

const researchTags = ['NEURAL CODING', 'PLASTICITY', 'COMPUTATIONAL MODELS', 'BRAIN–COMPUTER INTERFACE']

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

      <div style={{ marginTop: 18, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {researchTags.map(tag => (
          <span key={tag} style={{ fontSize: 11, letterSpacing: 1, padding: '5px 11px', border: '1px solid rgba(95,224,255,.5)', color: '#9fefff', borderRadius: 3 }}>
            {tag}
          </span>
        ))}
      </div>

      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 2, fontSize: 14 }}>
        {publications.map(pub => (
          <div key={pub.year + pub.title} style={{ display: 'flex', gap: 14, padding: '13px 4px', borderBottom: '1px solid rgba(77,255,160,.14)' }}>
            <span style={{ color: 'var(--accent)', fontFamily: "'VT323',monospace", fontSize: 19, minWidth: 54 }}>{pub.year}</span>
            <span style={{ color: '#d9ffe7', lineHeight: 1.5 }}>
              {pub.citation} — <em style={{ color: '#bfffd9', fontStyle: 'normal' }}>{pub.title}</em>{' '}
              <span style={{ color: 'rgba(125,255,176,.55)' }}>{pub.journal}</span>
            </span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16, fontFamily: "'VT323',monospace", fontSize: 18, color: 'rgba(125,255,176,.45)' }}>
        &gt; replace the placeholders with your real papers — blink_
      </div>

      {/* EEG panel */}
      <div style={{ position: 'relative', marginTop: 24, height: 160, border: '1px solid rgba(95,224,255,.22)', borderRadius: 10, overflow: 'hidden', background: 'rgba(2,8,12,.5)', flexShrink: 0 }}>
        <div style={{ position: 'absolute', top: 8, right: 12, zIndex: 2, fontFamily: "'VT323',monospace", fontSize: 18, letterSpacing: 1, color: 'rgba(95,224,255,.6)' }}>EEG.ARRAY — 4ch</div>
        <EegPanel />
      </div>
    </section>
  )
}
