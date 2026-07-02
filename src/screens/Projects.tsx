import type { CSSProperties } from 'react'
import { projects as contentProjects, featuredProject } from '../content'

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

const allProjects = [featuredProject, ...contentProjects]

export default function Projects({ visible }: { visible: boolean }) {
  return (
    <section style={{
      position: 'absolute', inset: 0,
      display: visible ? 'flex' : 'none',
      flexDirection: 'column',
      overflow: 'auto',
      padding: 'clamp(20px,3vw,46px)',
    }}>
      <h1 style={h1Style}>PROJECTS</h1>

      <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
        {allProjects.map((project) => (
          <div
            key={project.name}
            onClick={(e) => {
              // Whole card opens the live page; inner links keep their own targets
              if ((e.target as HTMLElement).closest('a')) return
              const url = project.demo ?? project.repo
              if (url) window.open(url, '_blank', 'noopener')
            }}
            style={{
              border: '1px solid rgba(255,106,213,.35)',
              borderRadius: 10,
              padding: 18,
              background: 'rgba(22,6,18,.4)',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              cursor: 'pointer',
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)', display: 'inline-block' }} />
              <span style={{ fontSize: 17, color: '#ffd6f3', fontWeight: 700 }}>{project.name}</span>
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.6, color: 'rgba(255,200,238,.7)' }}>{project.blurb}</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', fontSize: 10, letterSpacing: .5 }}>
              <span style={{ padding: '3px 8px', border: '1px solid rgba(255,106,213,.4)', color: '#ff9fe0' }}>{project.status}</span>
            </div>
            <div style={{ marginTop: 'auto', display: 'flex', gap: 18, alignItems: 'center', fontFamily: "'VT323',monospace", fontSize: 19, letterSpacing: 1 }}>
              {project.demo && (
                <a href={project.demo} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                  ▶ LIVE DEMO
                </a>
              )}
              {project.repo && (
                <a href={project.repo} target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,200,238,.7)', textDecoration: 'none' }}>
                  ◈ CODE
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
