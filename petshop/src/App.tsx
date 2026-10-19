import { MotionConfig } from 'motion/react'
import { useCallback, useEffect, useState } from 'react'
import { FloatingNav } from './components/FloatingNav'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { MobileMenu } from './components/MobileMenu'
import { BestSellers } from './components/sections/BestSellers'
import { Categories } from './components/sections/Categories'
import { Faq } from './components/sections/Faq'
import { Footer } from './components/sections/Footer'
import { Gallery } from './components/sections/Gallery'
import { Marquee } from './components/sections/Marquee'
import { Newsletter } from './components/sections/Newsletter'
import { Services } from './components/sections/Services'
import { Testimonials } from './components/sections/Testimonials'
import { initSmoothScroll } from './lib/smooth-scroll'

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const openMenu = useCallback(() => setMenuOpen(true), [])
  const closeMenu = useCallback(() => setMenuOpen(false), [])

  useEffect(() => initSmoothScroll(), [])

  return (
    <MotionConfig reducedMotion="user">
      <a
        href="#welcome"
        className="fixed left-4 top-4 z-[80] -translate-y-24 rounded-full bg-forest px-5 py-3 text-sm font-semibold text-white transition-transform focus-visible:translate-y-0"
      >
        Pular para o conteúdo
      </a>
      <div id="top" className="relative flex min-h-svh flex-col md:h-svh md:min-h-0 md:overflow-hidden">
        <Header onOpenMenu={openMenu} />
        <Hero />
      </div>

      <main>
        <Marquee />
        <Categories />
        <BestSellers />
        <Services />
        <Testimonials />
        <Gallery />
        <Faq />
        <Newsletter />
      </main>
      <Footer />

      <FloatingNav onOpenMenu={openMenu} />
      <MobileMenu open={menuOpen} onClose={closeMenu} />
    </MotionConfig>
  )
}
