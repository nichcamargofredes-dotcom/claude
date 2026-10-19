import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { motion } from 'motion/react'
import { photos, type Photo } from '../../lib/assets'
import { Container, Eyebrow, ParallaxImage, SectionTitle } from '../ui'
import { EASE_OUT } from '../../lib/motion'

const CATEGORIES: { name: string; count: string; image: Photo; alt: string }[] = [
  { name: 'Cães', count: '420+ produtos', image: photos.dog, alt: 'Corgi sorridente sentado em fundo verde-menta' },
  { name: 'Gatos', count: '380+ produtos', image: photos.cat, alt: 'Gato laranja rajado sentado' },
  { name: 'Pássaros', count: '120+ produtos', image: photos.bird, alt: 'Periquito verde em um poleiro de madeira' },
  { name: 'Peixes', count: '90+ produtos', image: photos.fish, alt: 'Peixinho dourado nadando em um aquário redondo' },
  { name: 'Pequenos pets', count: '150+ produtos', image: photos.rabbit, alt: 'Coelho branco e marrom com as orelhas em pé' },
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
            <Eyebrow>Compre por pet</Eyebrow>
            <SectionTitle className="mt-4 text-forest">
              <span id="categories-title">Tudo para o seu melhor amigo</span>
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
            Ver todos os produtos
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </motion.a>
        </div>
      </Container>

      <div className="mt-12 md:mt-16">
        <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-12">
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5 lg:gap-5">
            {CATEGORIES.map((cat, i) => (
              <motion.li
                key={cat.name}
                className={i === CATEGORIES.length - 1 ? 'col-span-2 sm:col-span-1' : undefined}
                initial={{ opacity: 0, y: 48 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '0px 0px -8% 0px' }}
                transition={{ duration: 1, ease: EASE_OUT, delay: (i % 2) * 0.08 }}
              >
                <a
                  href="#bestsellers"
                  className="group relative block overflow-hidden rounded-[28px] bg-sage"
                  aria-label={`Ver ${cat.name.toLowerCase()}, ${cat.count}`}
                >
                  <ParallaxImage
                    image={cat.image}
                    alt={cat.alt}
                    sizes="(min-width: 1024px) 19vw, (min-width: 640px) 30vw, 46vw"
                    className={i === CATEGORIES.length - 1 ? 'aspect-[16/10] sm:aspect-[3/4]' : 'aspect-[3/4]'}
                    imgClassName="transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
                    strength={6}
                  />
                  <div className="absolute inset-x-2 bottom-2 flex items-center justify-between gap-2 rounded-2xl bg-white/85 py-2.5 pl-3 pr-2 backdrop-blur-md sm:inset-x-3 sm:bottom-3 sm:py-3 sm:pl-4 sm:pr-3">
                    <div>
                      <p className="font-semibold text-forest">{cat.name}</p>
                      <p className="text-xs text-gray-600">{cat.count}</p>
                    </div>
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-forest text-white transition-colors group-hover:bg-orange sm:size-9">
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
