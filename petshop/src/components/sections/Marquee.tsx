import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  wrap,
} from 'motion/react'
import { useRef } from 'react'
import { PawIcon } from '../PawIcon'

const ITEMS = [
  'Free delivery over $49',
  'Vet-approved brands',
  'Same-day grooming slots',
  '30-day happy returns',
  'Eco-friendly packaging',
  'Rewards on every order',
]
const COPIES = 4
/** Percent of the track per second at rest. */
const BASE_SPEED = -0.6

/** Endless ticker that speeds up, and turns around, with the scroll wheel. */
export function Marquee() {
  const reduce = useReducedMotion()
  const baseX = useMotionValue(0)
  const { scrollY } = useScroll()
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 })
  const boost = useTransform(velocity, [0, 1000], [0, 4], { clamp: false })
  const direction = useRef(1)
  const x = useTransform(baseX, (v) => `${wrap(-100 / COPIES, 0, v)}%`)

  useAnimationFrame((_, delta) => {
    if (reduce) return
    let move = direction.current * BASE_SPEED * (delta / 1000)
    const b = boost.get()
    if (b < 0) direction.current = -1
    else if (b > 0) direction.current = 1
    move += direction.current * move * b
    baseX.set(baseX.get() + move)
  })

  return (
    <section aria-label="Why pet parents shop with us" className="overflow-hidden bg-pine py-5 text-white md:py-6">
      <p className="sr-only">{ITEMS.join(', ')}</p>
      <motion.div aria-hidden="true" className="flex w-max" style={{ x }}>
        {Array.from({ length: COPIES }, (_, copy) => (
          <ul key={copy} className="flex shrink-0 items-center">
            {ITEMS.map((item) => (
              <li key={item} className="flex items-center gap-6 whitespace-nowrap pr-6 text-base font-medium md:text-lg">
                <PawIcon className="size-5 text-orange" />
                {item}
              </li>
            ))}
          </ul>
        ))}
      </motion.div>
    </section>
  )
}
