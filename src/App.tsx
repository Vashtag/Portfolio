import { profile } from './content'

// NOTE: This is the Step 1 scaffold shell. The 3D brain hero and full content
// sections are added in the following build steps.
export default function App() {
  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-outline-variant">
        <nav className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-4">
          <div className="font-headline-md text-headline-md text-primary-fixed-dim drop-shadow-[0_0_8px_rgba(0,230,57,0.8)] tracking-tighter">
            {profile.osName}
          </div>
          <span className="font-label-caps text-label-caps text-on-surface-variant">
            BOOTING…
          </span>
        </nav>
      </header>

      <main className="pt-24 min-h-screen flex flex-col items-center justify-center text-center px-margin-mobile">
        <div className="w-64 h-64 border border-outline-variant flex items-center justify-center text-on-surface-variant font-code-sm">
          [ BRAIN_CORE :: PENDING ]
        </div>
        <h1 className="mt-8 font-headline-lg-mobile md:font-headline-lg text-primary-fixed-dim crt-glow uppercase tracking-widest terminal-cursor">
          {profile.fullName}
        </h1>
        <p className="mt-4 font-label-caps text-label-caps text-on-surface-variant tracking-widest opacity-80">
          {profile.heroSubtitle}
        </p>
      </main>
    </>
  )
}
