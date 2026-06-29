import { useEffect } from 'react'
import TopBar from './components/TopBar'
import SideNav from './components/SideNav'
import Hero from './components/Hero'
import Bio from './components/Bio'
import Research from './components/Research'
import Projects from './components/Projects'
import Footer from './components/Footer'

export default function App() {
  const bootKey = Date.now()

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [])

  return (
    <>
      <div key={bootKey} className="crt-power-on" aria-hidden="true">
        <div className="crt-power-line" />
        <div className="crt-power-glow" />
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
