import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { heroAssets } from '../../lib/assets'
import { Container } from '../ui'

const COLUMNS = [
  { title: 'Shop', links: [['Dogs', '#shop'], ['Cats', '#shop'], ['Birds', '#shop'], ['Fish', '#shop'], ['Small pets', '#shop']] },
  { title: 'Help', links: [['Delivery and payment', '#delivery'], ['Returns', '#delivery'], ['FAQ', '#delivery'], ['Reviews', '#reviews']] },
  { title: 'Company', links: [['Our story', '#story'], ['Services', '#services'], ['Brands', '#brands'], ['Blog', '#blog']] },
] as const

const SOCIAL = ['Instagram', 'TikTok', 'YouTube', 'Pinterest']

export function Footer() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] })
  const y = useTransform(scrollYProgress, [0, 1], ['45%', '0%'])

  return (
    <footer className="overflow-hidden border-t border-forest/10 pt-16 md:pt-20">
      <Container>
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-[1.3fr_repeat(3,0.7fr)_1fr]">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <img src={heroAssets.logo} alt="CozyPaws" width={164} height={42} loading="lazy" className="h-[42px] w-[164px]" />
            <p className="mt-5 max-w-xs leading-relaxed text-gray-600">
              A neighbourhood pet store for food, toys, grooming and care, since 2016.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {SOCIAL.map((name) => (
                <li key={name}>
                  <a
                    href="#top"
                    className="inline-block rounded-full border border-forest/15 px-4 py-2 text-sm font-medium text-forest transition-colors hover:border-forest hover:bg-forest hover:text-white"
                  >
                    {name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="font-semibold text-gray-900">{col.title}</p>
              <ul className="mt-4 space-y-3">
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <a href={href} className="text-gray-600 transition-colors hover:text-forest">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <address id="contact" className="scroll-mt-24 not-italic">
            <p className="font-semibold text-gray-900">Visit us</p>
            <p className="mt-4 leading-relaxed text-gray-600">
              14 Willow Street
              <br />
              Greenfield, GF 20410
            </p>
            <p className="mt-3 leading-relaxed text-gray-600">
              Mon–Sat 9:00–20:00
              <br />
              Sun 10:00–18:00
            </p>
            <p className="mt-3 space-y-1">
              <a href="mailto:hello@cozypaws.com" className="block font-medium text-forest hover:underline">
                hello@cozypaws.com
              </a>
              <a href="tel:+15550123456" className="block font-medium text-forest hover:underline">
                +1 (555) 012-3456
              </a>
            </p>
          </address>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-forest/10 py-6 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 CozyPaws. All rights reserved.</p>
          <p className="flex gap-5">
            <a href="#top" className="hover:text-forest">
              Privacy
            </a>
            <a href="#top" className="hover:text-forest">
              Terms
            </a>
            <a href="#top" className="hover:text-forest">
              Cookies
            </a>
          </p>
        </div>
      </Container>

      <div ref={ref} aria-hidden="true" className="select-none overflow-hidden">
        <motion.p
          style={{ y }}
          className="whitespace-nowrap text-center font-serif-display text-[23.5vw] leading-[0.78] tracking-tight text-forest"
        >
          CozyPaws
        </motion.p>
      </div>
    </footer>
  )
}
