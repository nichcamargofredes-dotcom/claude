import { Menu, ShoppingCart } from 'lucide-react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { useState } from 'react'
import { heroAssets } from '../lib/assets'
import { NAV_LINKS } from '../lib/nav'
import { useShop } from '../lib/shop'
import { CountBadge } from './Header'

/** Compact pill navigation that slides in once the hero has scrolled away. */
export function FloatingNav({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { scrollY } = useScroll()
  const [visible, setVisible] = useState(false)
  const { cartCount, cartPulse } = useShop()

  useMotionValueEvent(scrollY, 'change', (y) => setVisible(y > window.innerHeight * 0.85))

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -90, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 34 }}
          className="fixed inset-x-0 top-3 z-50 flex justify-center px-3"
        >
          <nav
            aria-label="Quick navigation"
            className="flex w-full max-w-4xl items-center justify-between gap-4 rounded-full border border-forest/10 bg-white/80 py-2 pl-5 pr-2 shadow-[0_18px_50px_-20px_rgba(26,61,26,0.35)] backdrop-blur-xl"
          >
            <a href="#top" aria-label="CozyPaws, back to top" className="shrink-0">
              <img src={heroAssets.logo} alt="CozyPaws" width={118} height={30} className="h-[30px] w-[118px]" />
            </a>
            <ul className="hidden items-center gap-6 text-sm font-medium text-gray-600 md:flex">
              {NAV_LINKS.slice(1).map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="whitespace-nowrap transition-colors hover:text-gray-900">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-2">
              <a
                href="#bestsellers"
                aria-label={`Cart, ${cartCount} items`}
                className="relative grid size-10 place-items-center rounded-full bg-forest text-white transition-colors hover:bg-forest-hover"
              >
                <ShoppingCart className="size-[18px]" />
                <CountBadge count={cartCount} pulse={cartPulse} />
              </a>
              <button
                type="button"
                onClick={onOpenMenu}
                aria-label="Open menu"
                className="grid size-10 place-items-center rounded-full border border-forest/15 text-forest md:hidden"
              >
                <Menu className="size-[18px]" />
              </button>
            </div>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
