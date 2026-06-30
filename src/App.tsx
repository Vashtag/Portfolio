import { useEffect, useState } from 'react'
import TopBar from './components/TopBar'
import SideNav from './components/SideNav'
import Hero from './components/Hero'
import Bio from './components/Bio'
import Research from './components/Research'
import Projects from './components/Projects'
import Footer from './components/Footer'
import CrtBootLog from './components/CrtBootLog'

export default function App() {
  // Computed once on mount (NOT on every render). Using `Date.now()` inline
  // would produce a new key on every re-render, remounting the whole tree and
  // restarting the fullscreen CRT power-on overlay — which leaves the overlay
  // up and the content stuck invisible (a blank/white screen). A stable key
  // plays the boot animation exactly once per page load.
  const [bootKey] = useState(() => Date.now())

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [])

  return (
    <>
      <div key={bootKey} className="crt-power-on" aria-hidden="true">
        <CrtBootLog />
      </div>

      <div key={`content-${bootKey}`} className="crt-boot-content">
        <TopBar />
        <SideNav />

        <div className="lg:ml-64">
          <main className="pt-24 min-h-screen">
            <Hero />
            <Bio />
            <Research />
            <Projects />
          </main>
          <Footer />
        </div>
      </div>
    </>
  )
}
