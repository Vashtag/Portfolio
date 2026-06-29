import Hero from './components/Hero'
import { profile } from './content'

// Step 2: top bar + hero with the interactive 3D brain.
// Remaining content sections are added in Step 3.
export default function App() {
  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-outline-variant">
        <nav className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-4">
          <div className="font-headline-md text-headline-md text-primary-fixed-dim drop-shadow-[0_0_8px_rgba(0,230,57,0.8)] tracking-tighter">
            {profile.osName}
          </div>
          <span className="font-label-caps text-label-caps text-on-surface-variant">
            SYSTEM_ONLINE
          </span>
        </nav>
      </header>

      <main className="pt-24 min-h-screen">
        <Hero />
      </main>
    </>
  )
}
