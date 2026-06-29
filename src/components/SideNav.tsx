import Icon from './Icon'
import BrainFallback from './brain/BrainFallback'
import { links, profile } from '../content'

const items = [
  { href: '#hero', icon: 'home', label: 'Home', active: true },
  { href: '#research', icon: 'psychology', label: 'Neural Net' },
  { href: '#projects', icon: 'code', label: 'Codebase' },
  { href: '#contact', icon: 'terminal', label: 'Terminal' },
]

export default function SideNav() {
  return (
    <aside className="hidden lg:flex flex-col h-screen fixed left-0 top-0 w-64 p-8 pt-24 bg-surface-container-lowest border-r border-outline-variant z-40">
      <div className="mb-12">
        <div className="w-16 h-16 bg-surface-container-high border border-outline-variant mb-4 p-2 flex items-center justify-center">
          <BrainFallback />
        </div>
        <div className="font-headline-md text-headline-md text-primary-fixed-dim">
          {profile.sidebarHandle}
        </div>
        <div className="font-body-md text-body-md text-on-surface-variant opacity-70">
          {profile.sidebarRole}
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {items.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={
              item.active
                ? 'flex items-center gap-3 px-4 py-3 bg-primary-container text-on-primary-container font-bold border-l-4 border-primary-fixed-dim'
                : 'flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-variant transition-all hover:translate-x-2'
            }
          >
            <Icon name={item.icon} filled={item.active} />
            <span className="font-body-md text-body-md">{item.label}</span>
          </a>
        ))}
      </nav>

      <a
        href={`mailto:${links.email}`}
        className="mt-auto py-3 text-center border border-outline-variant font-label-caps text-label-caps text-on-surface-variant hover:border-primary-fixed-dim hover:text-primary-fixed-dim transition-colors active:scale-95"
      >
        EXECUTE_CONNECT
      </a>
    </aside>
  )
}
