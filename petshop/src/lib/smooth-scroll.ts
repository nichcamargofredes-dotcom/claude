import Lenis from 'lenis'

let lenis: Lenis | null = null

/** Starts Lenis smooth scrolling. It honours prefers-reduced-motion by itself. */
export function initSmoothScroll() {
  lenis = new Lenis({ autoRaf: true, lerp: 0.11, anchors: true, stopInertiaOnNavigate: true })
  return () => {
    lenis?.destroy()
    lenis = null
  }
}

export function scrollToTarget(target: string | number) {
  if (lenis) {
    lenis.scrollTo(target, { force: true })
    return
  }
  if (typeof target === 'number') window.scrollTo({ top: target, behavior: 'smooth' })
  else document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' })
}

export function setScrollLocked(locked: boolean) {
  if (locked) lenis?.stop()
  else lenis?.start()
  document.documentElement.style.overflow = locked ? 'hidden' : ''
}
