import { motion } from 'motion/react'
import { Container, Eyebrow } from '../ui'
import { EASE_OUT } from '../../lib/motion'

const BRANDS = [
  { name: 'Barkwell', className: 'font-sans text-2xl font-semibold tracking-tight' },
  { name: 'PURRFECT', className: 'font-sans text-lg font-medium tracking-[0.32em]' },
  { name: 'Wild Meadow', className: 'font-serif-display text-[26px]' },
  { name: 'nordpaw', className: 'font-sans text-2xl font-normal tracking-tight' },
  { name: 'Happy Tails', className: 'font-serif-display text-[26px]' },
  { name: 'FEATHER & FIN', className: 'font-sans text-sm font-semibold tracking-[0.24em]' },
]

export function Brands() {
  return (
    <section id="brands" aria-labelledby="brands-title" className="scroll-mt-20 py-20 md:py-28">
      <Container>
        <div className="flex flex-col items-center text-center">
          <Eyebrow>
            <span id="brands-title">Marcas em que confiamos</span>
          </Eyebrow>
          <p className="mt-4 max-w-xl text-gray-600">
            Trabalhamos com fabricantes independentes e marcas indicadas por veterinários, e testamos cada novidade com os nossos próprios pets antes.
          </p>
        </div>
        <ul className="mt-12 grid grid-cols-2 overflow-hidden rounded-[28px] border border-forest/10 bg-white/50 md:grid-cols-3 lg:grid-cols-6">
          {BRANDS.map((brand, i) => (
            <motion.li
              key={brand.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: EASE_OUT, delay: i * 0.06 }}
              className="-mb-px -mr-px grid h-28 place-items-center border-b border-r border-forest/10 px-4 text-forest/45 transition-colors duration-300 hover:text-forest md:h-32"
            >
              <span className={brand.className}>{brand.name}</span>
            </motion.li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
