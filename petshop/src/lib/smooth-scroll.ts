import Lenis from 'lenis'

let lenis: Lenis | null = null

/** Moves keyboard focus to the target of an in-page link, which Lenis scrolls to without focusing. */
function focusAnchorTarget(e: MouseEvent) {
  const link = (e.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]')
  const id = link?.getAttribute('href')?.slice(1)
  const target = id ? document.getElementById(id) : null
  if (!target) return
  if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
  target.focus({ preventScroll: true })
}

/** Starts Lenis smooth scrolling. It honours prefers-reduced-motion by itself. */
export function initSmoothScroll() {
  lenis = new Lenis({ autoRaf: true, lerp: 0.11, anchors: true, stopInertiaOnNavigate: true })
  document.addEventListener('click', focusAnchorTarget)
  return () => {
    document.removeEventListener('click', focusAnchorTarget)
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
