import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { motion } from 'motion/react'
import { photos, type Photo } from '../../lib/assets'
import { Container, Eyebrow, ParallaxImage, SectionTitle } from '../ui'
import { EASE_OUT } from '../../lib/motion'

const CATEGORIES: { name: string; count: string; image: Photo; alt: string }[] = [
  { name: 'Dogs', count: '420+ products', image: photos.dog, alt: 'Smiling corgi sitting on a mint background' },
  { name: 'Cats', count: '380+ products', image: photos.cat, alt: 'Ginger tabby cat sitting upright' },
  { name: 'Birds', count: '120+ products', image: photos.bird, alt: 'Green budgie on a wooden perch' },
  { name: 'Fish', count: '90+ products', image: photos.fish, alt: 'Goldfish swimming in a round glass bowl' },
  { name: 'Small pets', count: '150+ products', image: photos.rabbit, alt: 'White and brown rabbit with its ears up' },
]

export function Categories() {
  return (
    <section id="shop" aria-labelledby="categories-title" className="scroll-mt-20 py-24 md:py-32">
      <Container>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '0px 0px -10% 0px' }}
            transition={{ duration: 0.9, ease: EASE_OUT }}
          >
            <Eyebrow>Shop by pet</Eyebrow>
            <SectionTitle className="mt-4 text-forest">
              <span id="categories-title">Find what your best friend needs</span>
            </SectionTitle>
          </motion.div>
          <motion.a
            href="#bestsellers"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="group inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-forest/20 px-5 py-3 text-sm font-semibold text-forest transition-colors hover:border-forest hover:bg-forest hover:text-white md:self-auto"
          >
            View all products
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </motion.a>
        </div>
      </Container>

      <div className="mt-12 md:mt-16">
        <div className="mx-auto w-full max-w-[1320px] sm:px-8 lg:px-12">
          <ul className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:px-0 lg:grid lg:grid-cols-5 lg:gap-5 lg:overflow-visible">
            {CATEGORIES.map((cat, i) => (
              <motion.li
                key={cat.name}
                className="w-[68vw] max-w-[300px] shrink-0 snap-start sm:w-[42vw] lg:w-auto lg:max-w-none"
                initial={{ opacity: 0, y: 48 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '0px 0px -8% 0px' }}
                transition={{ duration: 1, ease: EASE_OUT, delay: i * 0.08 }}
              >
                <a
                  href="#bestsellers"
                  className="group relative block overflow-hidden rounded-[28px] bg-sage"
                  aria-label={`Shop ${cat.name.toLowerCase()}, ${cat.count}`}
                >
                  <ParallaxImage
                    image={cat.image}
                    alt={cat.alt}
                    sizes="(min-width: 1024px) 19vw, (min-width: 640px) 42vw, 68vw"
                    className="aspect-[3/4]"
                    imgClassName="transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
                    strength={6}
                  />
                  <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2 rounded-2xl bg-white/85 py-3 pl-4 pr-3 backdrop-blur-md">
                    <div>
                      <p className="font-semibold text-forest">{cat.name}</p>
                      <p className="text-xs text-gray-600">{cat.count}</p>
                    </div>
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-forest text-white transition-colors group-hover:bg-orange">
                      <ArrowUpRight className="size-4" />
                    </span>
                  </div>
                </a>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
