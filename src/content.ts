// ─────────────────────────────────────────────────────────────────────────────
// EDIT ME: Site content lives here. Update the strings/arrays below to change
// what the portfolio shows — no need to touch the components.
// ─────────────────────────────────────────────────────────────────────────────

export const links = {
  github: 'https://github.com/vashtag',
  linkedin: 'https://www.linkedin.com/in/siyavash-izadi/',
  email: 'sizadiso@uwaterloo.ca',
}

export type Project = {
  name: string
  blurb: string
  status: string
  statusTone: 'good' | 'warn' | 'bad'
  demo?: string
  repo?: string
  icon: string
}

// The first project renders as the large featured card.
export const featuredProject: Project = {
  name: '3DVIEWER',
  blurb:
    'A browser-based viewer for exploring interactive anatomical 3D models — rotate, zoom, and inspect structures right in the page.',
  status: 'LIVE',
  statusTone: 'good',
  demo: 'https://vashtag.github.io/3DViewer/',
  repo: 'https://github.com/Vashtag/3DViewer',
  icon: 'view_in_ar',
}

export const projects: Project[] = [
  {
    name: 'FARSI',
    blurb: 'A playful web app for learning Farsi (Persian) — pairs words with audio and images to build vocabulary. Built as a gift to help a friend learn.',
    status: 'LIVE',
    statusTone: 'good',
    demo: 'https://vashtag.github.io/Farsi/',
    repo: 'https://github.com/Vashtag/Farsi',
    icon: 'translate',
  },
]
