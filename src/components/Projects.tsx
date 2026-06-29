import Reveal from './Reveal'
import Icon from './Icon'
import { featuredProject, projects, projectsHeading, links, type Project } from '../content'

function statusToneClass(tone: Project['statusTone']): string {
  switch (tone) {
    case 'good':
      return 'text-primary-fixed-dim'
    case 'warn':
      return 'text-secondary-fixed'
    case 'bad':
      return 'text-error'
  }
}

export default function Projects() {
  return (
    <Reveal
      id="projects"
      className="py-20 px-margin-mobile md:px-margin-desktop scroll-mt-24"
    >
      <div className="flex items-center gap-4 mb-12">
        <h2 className="font-headline-md text-headline-md text-primary-fixed-dim uppercase">
          {projectsHeading}
        </h2>
        <div className="flex-1 h-px bg-outline-variant" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Featured project */}
        <div className="md:col-span-2 md:row-span-2 border border-outline-variant group relative overflow-hidden flex flex-col">
          <div className="h-48 sm:h-64 relative bg-surface-container-high flex items-center justify-center overflow-hidden">
            {/* Stylised "scan" backdrop instead of a stock photo */}
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 50% 50%, rgba(0,230,57,0.25), transparent 60%), repeating-linear-gradient(90deg, rgba(0,230,57,0.08) 0 1px, transparent 1px 14px)',
              }}
            />
            <Icon
              name={featuredProject.icon}
              className="text-primary-fixed-dim text-[7rem] drop-shadow-[0_0_20px_rgba(0,255,65,0.5)] relative z-10 group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
            <div className="absolute bottom-4 left-4">
              <span className="px-2 py-1 bg-primary-container text-on-primary-container text-code-sm font-bold">
                {featuredProject.status}
              </span>
            </div>
          </div>
          <div className="p-6 flex-1 flex flex-col">
            <h3 className="font-headline-md text-headline-md mb-2">{featuredProject.name}</h3>
            <p className="text-on-surface-variant mb-6 flex-1">{featuredProject.blurb}</p>
            <div className="flex justify-between items-center">
              <div className="flex gap-4 text-on-surface-variant">
                <Icon name="terminal" className="cursor-pointer hover:text-primary-fixed-dim transition-colors" />
                <Icon name="description" className="cursor-pointer hover:text-primary-fixed-dim transition-colors" />
              </div>
              <a
                href={featuredProject.href ?? links.github}
                target="_blank"
                rel="noreferrer"
                className="font-label-caps text-label-caps px-4 py-2 bg-primary-fixed-dim text-background font-bold active:scale-95 transition-all hover:shadow-[0_0_15px_var(--primary-glow)]"
              >
                VIEW_REPO
              </a>
            </div>
          </div>
        </div>

        {/* Two small projects */}
        {projects.slice(0, 2).map((p) => (
          <a
            key={p.name}
            href={p.href ?? links.github}
            target="_blank"
            rel="noreferrer"
            className="border border-outline-variant p-6 hover:bg-surface-container-low transition-colors block"
          >
            <div className="flex justify-between mb-4">
              <Icon name={p.icon} className="text-outline" />
              <span className={`font-code-sm text-code-sm ${statusToneClass(p.statusTone)}`}>
                {p.status}
              </span>
            </div>
            <h4 className="font-label-caps text-label-caps text-primary-fixed-dim mb-2">{p.name}</h4>
            <p className="text-code-sm opacity-70">{p.blurb}</p>
          </a>
        ))}

        {/* Wide medium project */}
        {projects.slice(2, 3).map((p) => (
          <div
            key={p.name}
            className="md:col-span-2 border border-outline-variant p-6 flex flex-col md:flex-row gap-6"
          >
            <div className="w-24 h-24 bg-surface-container-highest flex-shrink-0 flex items-center justify-center border border-outline-variant">
              <Icon name={p.icon} className="text-primary-fixed-dim text-4xl" />
            </div>
            <div className="flex-1">
              <h4 className="font-label-caps text-label-caps text-primary-fixed-dim mb-1">{p.name}</h4>
              <p className="text-body-md text-on-surface-variant mb-4">{p.blurb}</p>
              <a
                href={p.href ?? links.github}
                target="_blank"
                rel="noreferrer"
                className="text-code-sm underline decoration-outline hover:text-primary-fixed-dim"
              >
                VIEW_DEMO
              </a>
            </div>
          </div>
        ))}
      </div>
    </Reveal>
  )
}
