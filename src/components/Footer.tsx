import Icon from './Icon'
import { footer, links } from '../content'

const socials = [
  { href: links.github, icon: 'terminal', label: 'GITHUB', external: true },
  { href: links.linkedin, icon: 'share', label: 'LINKEDIN', external: true },
  { href: `mailto:${links.email}`, icon: 'mail', label: 'EMAIL', external: false },
]

export default function Footer() {
  return (
    <footer
      id="contact"
      className="bg-surface-container-lowest border-t border-outline-variant z-40 scroll-mt-24"
    >
      <div className="flex flex-col md:flex-row justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-6 gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-primary-fixed-dim animate-pulse" />
            <span className="font-code-sm text-code-sm text-primary-fixed-dim">SYSTEM_ONLINE</span>
          </div>
          <div className="h-4 w-px bg-outline-variant hidden md:block" />
          <div className="font-code-sm text-code-sm text-on-surface-variant uppercase text-center">
            {footer.copyright}
          </div>
        </div>

        <div className="flex gap-6">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              {...(s.external ? { target: '_blank', rel: 'noreferrer' } : {})}
              className="font-label-caps text-label-caps text-secondary-fixed hover:text-primary transition-opacity flex items-center gap-1"
            >
              <Icon name={s.icon} className="text-[14px]" /> {s.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
