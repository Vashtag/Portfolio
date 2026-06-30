// ─────────────────────────────────────────────────────────────────────────────
// EDIT ME: All site content lives here. Update the strings/arrays below to
// change what the portfolio shows — no need to touch the components.
// ─────────────────────────────────────────────────────────────────────────────

export const profile = {
  // Shown as the glowing OS name in the top bar.
  osName: 'NEURO_OS_V1.0',
  // Typed out letter-by-letter in the hero.
  heroTyped: 'DR. SIYAVASH IZADI // UW_RESEARCHER',
  heroSubtitle: 'UNIVERSITY OF WATERLOO // NEUROSCIENCE',
  // Sidebar identity block.
  sidebarHandle: 'UW_USER_01',
  sidebarRole: 'Neuroscientist · Educator · Builder',
  fullName: 'Dr. Siyavash Izadi',
}

export const links = {
  github: 'https://github.com/vashtag',
  linkedin: 'https://www.linkedin.com/in/siyavash-izadi/',
  email: 'siyavash.izadi@gmail.com',
}

export const bio = {
  heading: 'BIOMETRIC_PROFILE.MD',
  // Body text supports a couple of highlighted spans (see component).
  paragraph:
    'PhD in neuroscience, educator at the University of Waterloo, and a relentless builder of tools and apps. My work lives where biological intelligence meets code — turning insights about how the brain learns into software that is useful, fast, and a little bit fun to use.',
  quote:
    'The goal is not just to understand the brain, but to build tools that think with the same elegance and economy as the human mind.',
  stats: [
    { id: 'STAT_01', value: '12+', label: 'PAPERS', fill: 0.75, accent: 'primary' as const },
    { id: 'STAT_02', value: '08', label: 'COURSES', fill: 0.5, accent: 'secondary' as const },
  ],
}

export type ResearchCard = {
  ref: string
  icon: string
  title: string
  body: string
  tags?: string[]
  /** When set, renders as a list of "> item" lines instead of tags. */
  list?: string[]
  accent: 'primary' | 'secondary'
}

export const researchHeading = 'Research_Domains'
export const researchLocation = 'LOC: UW_SCIENCE_QUAD'

export const research: ResearchCard[] = [
  {
    ref: 'REF_001',
    icon: 'neurology',
    title: 'Learning & Plasticity',
    body: 'How the brain adapts and rewires — studying the mechanisms of learning and memory and what they teach us about better machines.',
    tags: ['Neuron', 'Modeling'],
    accent: 'primary',
  },
  {
    ref: 'REF_002',
    icon: 'analytics',
    title: 'Computational Neuroscience',
    body: 'Building mathematical and ML models of neural systems to decode behaviour and signals from data.',
    tags: ['Deep Learning', 'Signal Proc'],
    accent: 'primary',
  },
  {
    ref: 'EDU_CORE',
    icon: 'school',
    title: 'Teaching Faculty',
    body: '',
    list: ['Neuroscience @ University of Waterloo', 'Mentoring student researchers'],
    accent: 'secondary',
  },
]

export type Project = {
  name: string
  blurb: string
  status: string
  statusTone: 'good' | 'warn' | 'bad'
  href?: string
  icon: string
}

export const projectsHeading = 'Active_Repo'

// The first project renders as the large featured card.
export const featuredProject: Project = {
  name: 'SYNAPSE_CORE',
  blurb:
    'A toolkit for building and exploring neural models — designed to make computational neuroscience approachable for students and researchers alike.',
  status: 'STATUS: PRODUCTION',
  statusTone: 'good',
  href: links.github,
  icon: 'hub',
}

export const projects: Project[] = [
  {
    name: 'NEURO_DEC',
    blurb: 'Tooling for cleaning and decoding neural signal data.',
    status: 'STABLE',
    statusTone: 'good',
    href: links.github,
    icon: 'memory',
  },
  {
    name: 'SPIKE_UI',
    blurb: 'Dashboard for interactive data visualization.',
    status: 'LEGACY',
    statusTone: 'bad',
    href: links.github,
    icon: 'folder_zip',
  },
  {
    name: 'MIND_MAPPER',
    blurb: 'Interactive 3D visualization of connectivity matrices using Three.js.',
    status: 'DEMO',
    statusTone: 'warn',
    href: links.github,
    icon: 'graph_3',
  },
]

export const footer = {
  copyright: '© 2026 WATERLOO_NEURO_LAB // STATUS: NOMINAL',
}
