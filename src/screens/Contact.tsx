import type { CSSProperties } from 'react'
import { links } from '../content'

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

const contactItems = [
  { label: '▸ EMAIL', value: 'siyavash.izadi@gmail.com', href: `mailto:siyavash.izadi@gmail.com` },
  { label: '▸ GITHUB', value: 'github.com/vashtag', href: links.github },
  { label: '▸ SCHOLAR', value: 'Google Scholar profile', href: 'https://scholar.google.com/' },
  { label: '▸ LINKEDIN', value: 'linkedin.com/in/[handle]', href: links.linkedin },
]

export default function Contact({ visible }: { visible: boolean }) {
  return (
    <section style={{
      position: 'absolute', inset: 0,
      display: visible ? 'flex' : 'none',
      flexDirection: 'column',
      overflow: 'auto',
      padding: 'clamp(20px,3vw,46px)',
    }}>
      <div style={{ fontFamily: "'VT323',monospace", fontSize: 20, letterSpacing: 3, color: 'rgba(125,255,176,.6)' }}>&gt; ./connect</div>
      <h1 style={h1Style}>CONTACT</h1>

      <p style={{ margin: '16px 0 0', maxWidth: '48ch', fontSize: 15, lineHeight: 1.7, color: 'rgba(190,255,215,.82)' }}>
        Open to research collaborations, teaching, and building tools. Reach me on any channel below.
      </p>

      <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 14 }}>
        {contactItems.map(item => (
          <a
            key={item.label}
            href={item.href}
            target={item.href.startsWith('http') ? '_blank' : undefined}
            rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
            style={{
              textDecoration: 'none',
              border: '1px solid rgba(199,255,77,.35)',
              borderRadius: 10,
              padding: '16px 18px',
              background: 'rgba(18,22,4,.4)',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <span style={{ fontFamily: "'VT323',monospace", fontSize: 20, letterSpacing: 1, color: 'var(--accent)' }}>{item.label}</span>
            <span style={{ fontSize: 13, color: '#eaffc7' }}>{item.value}</span>
          </a>
        ))}
      </div>

      <a
        href="cv.pdf"
        download
        style={{
          marginTop: 24,
          alignSelf: 'flex-start',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 12,
          padding: '13px 22px',
          border: '2px solid var(--accent)',
          borderRadius: 8,
          background: 'rgba(199,255,77,.08)',
          color: 'var(--accent)',
          textDecoration: 'none',
          fontFamily: "'VT323',monospace",
          fontSize: 24,
          letterSpacing: 2,
          boxShadow: '0 0 18px rgba(199,255,77,.22)',
        }}
      >
        ⬇ DOWNLOAD CV.PDF
      </a>

      <div style={{ marginTop: 18, fontFamily: "'VT323',monospace", fontSize: 18, color: 'rgba(125,255,176,.45)' }}>
        &gt; swap in your real handles &amp; drop cv.pdf in the public/ folder — blink_
      </div>
    </section>
  )
}
