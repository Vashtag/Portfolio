import type { CSSProperties } from 'react'

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

const roles = [
  {
    code: 'INSTRUCTOR',
    title: 'Instructor / Lab Instructor',
    description: 'Design and deliver learner-centred, outcome-focused instruction for 300+ students per term — aligning objectives, activities, assessments, rubrics, and feedback across multiple sections.',
    term: 'UNIVERSITY OF WATERLOO · 2025–PRESENT',
  },
  {
    code: 'CONTENT',
    title: 'Course Materials & LMS',
    description: 'Build and maintain Canvas course content, lab guides, slide decks, diagrams, quizzes, rubrics, and progress tracking, plus automated reporting workflows to keep delivery consistent.',
    term: 'CANVAS · POWER BI',
  },
  {
    code: 'TEAMS',
    title: 'Teaching Teams & Mentoring',
    description: 'Coordinate teaching teams through onboarding, weekly prep, and grading calibration, and mentor co-op and student researchers on evidence-informed, accessible instruction.',
    term: 'ONBOARDING · CALIBRATION',
  },
  {
    code: 'EVAL',
    title: 'Learning Evaluation',
    description: 'Evaluate effectiveness using completion data, item analysis, and learner feedback, then revise materials and delivery to close the loop — designing with accessibility in mind throughout.',
    term: 'DATA-INFORMED DESIGN',
  },
]

export default function Teaching({ visible }: { visible: boolean }) {
  return (
    <section style={{
      position: 'absolute', inset: 0,
      display: visible ? 'flex' : 'none',
      flexDirection: 'column',
      overflow: 'auto',
      padding: 'clamp(20px,3vw,46px)',
    }}>
      <h1 style={h1Style}>TEACHING</h1>
      <div style={{ marginTop: 6, fontFamily: "'VT323',monospace", fontSize: 24, letterSpacing: 2, color: '#ffe39a' }}>UNIVERSITY OF WATERLOO</div>

      <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 }}>
        {roles.map((role, i) => (
          <div key={i} style={{
            border: '1px solid rgba(255,200,61,.35)',
            borderRadius: 10,
            padding: 18,
            background: 'rgba(20,16,4,.4)',
          }}>
            <div style={{ fontFamily: "'VT323',monospace", fontSize: 22, color: 'var(--accent)', letterSpacing: 1 }}>{role.code}</div>
            <div style={{ marginTop: 4, fontSize: 15, color: '#ffe9bd', fontWeight: 600 }}>{role.title}</div>
            <div style={{ marginTop: 8, fontSize: 12, color: 'rgba(255,220,150,.65)', lineHeight: 1.6 }}>{role.description}</div>
            <div style={{ marginTop: 12, fontSize: 11, letterSpacing: 1, color: 'rgba(255,200,61,.8)' }}>{role.term}</div>
          </div>
        ))}
      </div>


    </section>
  )
}
