import { ArrowUpRight, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef } from 'react'
import { heroAssets } from '../lib/assets'
import { NAV_LINKS } from '../lib/nav'
import { scrollToTarget, setScrollLocked } from '../lib/smooth-scroll'
import { EASE_OUT } from '../lib/motion'

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const dialog = dialogRef.current
    const opener = document.activeElement as HTMLElement | null
    setScrollLocked(true)
    closeRef.current?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key !== 'Tab' || !dialog) return
      // Keep Tab inside the menu while it is open.
      const items = dialog.querySelectorAll<HTMLElement>('a[href], button')
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      setScrollLocked(false)
      window.removeEventListener('keydown', onKey)
      // Closed without following a link: hand focus back to the button that opened the menu.
      if (dialog?.contains(document.activeElement)) opener?.focus({ preventScroll: true })
    }
  }, [open, onClose])

  const go = (href: string) => {
    onClose()
    // Wait for the scroll lock to lift before scrolling.
    window.setTimeout(() => scrollToTarget(href), 60)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-[60] flex flex-col bg-forest px-5 pb-8 pt-4 text-white"
          initial={{ clipPath: 'inset(0% 0% 100% 0%)' }}
          animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          exit={{ clipPath: 'inset(0% 0% 100% 0%)' }}
          transition={{ duration: 0.6, ease: EASE_OUT }}
        >
          <div className="flex items-center justify-between">
            <img src={heroAssets.logo} alt="CozyPaws" width={130} height={33} className="h-[33px] w-[130px] brightness-0 invert" />
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Fechar menu"
              className="grid size-10 place-items-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
            >
              <X className="size-5" />
            </button>
          </div>

          <nav aria-label="Menu do celular" className="mt-14 flex-1">
            <ul className="space-y-2">
              {NAV_LINKS.map((link, i) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.15 + i * 0.05 }}
                >
                  <a
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault()
                      go(link.href)
                    }}
                    className="flex items-center justify-between border-b border-white/10 py-4 font-serif-display text-4xl"
                  >
                    {link.label}
                    <ArrowUpRight className="size-6 text-leaf" />
                  </a>
                </motion.li>
              ))}
            </ul>
          </nav>

          <div className="space-y-1 text-sm text-white/70">
            <p>Rua das Palmeiras, 140 · Pinheiros, São Paulo</p>
            <p>Seg. a sáb. 9h–20h · Dom. 10h–18h</p>
            <a href="tel:+5511912345678" className="block font-medium text-white">
              (11) 91234-5678
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
