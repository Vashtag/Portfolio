import TopBar from './components/TopBar'
import SideNav from './components/SideNav'
import Hero from './components/Hero'
import Bio from './components/Bio'
import Research from './components/Research'
import Projects from './components/Projects'
import Footer from './components/Footer'

export default function App() {
  return (
    <>
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
    </>
  )
}
