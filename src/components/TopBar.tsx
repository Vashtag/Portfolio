import { useState } from 'react'
import Icon from './Icon'
import { links, profile } from '../content'

const navItems = [
  { href: '#research', label: 'RESEARCH' },
  { href: '#projects', label: 'PROJECTS' },
  { href: '#teaching', label: 'TEACHING' },
  { href: '#contact', label: 'CONTACT' },
]

export default function TopBar({ onNavClick }: { onNavClick?: (id: string) => void }) {
  const [open, setOpen] = useState(false)

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!onNavClick) return
    const id = href.replace('#', '')
    const el = document.getElementById(id)
    if (!el) return
    e.preventDefault()
    onNavClick(id)
  }

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-outline-variant">
      <nav className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-4">
        <a
          href="#hero"
          onClick={(e) => handleClick(e, '#hero')}
          className="font-headline-md text-headline-md text-primary-fixed-dim drop-shadow-[0_0_8px_rgba(0,230,57,0.8)] tracking-tighter"
        >
          {profile.osName}
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex gap-8 items-center">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => handleClick(e, item.href)}
              className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary-fixed transition-colors"
            >
              {item.label}
            </a>
          ))}
          <a
            href={`mailto:${links.email}`}
            className="font-label-caps text-label-caps border border-primary-fixed-dim px-4 py-2 text-primary-fixed-dim hover:bg-primary-fixed-dim hover:text-background transition-all active:scale-95"
          >
            EXECUTE_CONNECT
          </a>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-primary-fixed-dim"
          aria-label="Toggle navigation menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <Icon name={open ? 'close' : 'menu'} className="text-3xl" />
        </button>
      </nav>

      {/* Mobile nav drawer */}
      {open && (
        <div className="md:hidden border-t border-outline-variant bg-background/95 backdrop-blur-md">
          <div className="flex flex-col px-margin-mobile py-2">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => { handleClick(e, item.href); setOpen(false) }}
                className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary-fixed py-3 border-b border-outline-variant/50"
              >
                {item.label}
              </a>
            ))}
            <a
              href={`mailto:${links.email}`}
              onClick={() => setOpen(false)}
              className="font-label-caps text-label-caps text-primary-fixed-dim py-3"
            >
              {'>'} EXECUTE_CONNECT
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
