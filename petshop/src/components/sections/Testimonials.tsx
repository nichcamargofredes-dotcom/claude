import { Star } from 'lucide-react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { photos, type Photo } from '../../lib/assets'
import { useMediaQuery } from '../../lib/hooks'
import { Container, Eyebrow, Reveal, SectionTitle } from '../ui'

type Review = { quote: string; name: string; pet: string; image: Photo }

const REVIEWS: Review[] = [
  {
    quote: 'A cama da Luna chegou na mesma tarde e ela não sai mais de lá. A equipe até lembrou o nome dela quando fui na loja.',
    name: 'Mariana R.',
    pet: 'Tutora da Luna · Corgi',
    image: photos.dog,
  },
  {
    quote: 'Finalmente uma loja que explica os ingredientes em vez de empurrar a ração mais cara. A barriguinha do Milo agradece.',
    name: 'Daniel K.',
    pet: 'Tutor do Milo · Gato rajado',
    image: photos.cat,
  },
  {
    quote: 'Os tosadores tiveram muita paciência com a nossa resgatada medrosa. Ela voltou fofinha e tranquila, parecia milagre.',
    name: 'Priscila S.',
    pet: 'Tutora da Nala · Bichon',
    image: photos.grooming,
  },
  {
    quote: 'Pedi ao meio-dia e a casinha já estava montada no jantar. É firme, confortável e os nossos dois gatos dividem sem brigar.',
    name: 'Tiago e Lia',
    pet: 'Tutores do Abóbora e da Figo',
    image: photos.delivery,
  },
  {
    quote: 'A mistura de sementes do Kiwi chega todo mês e o lembrete garante que nunca falte. Detalhe pequeno, diferença enorme.',
    name: 'Sofia M.',
    pet: 'Tutora do Kiwi · Periquito',
    image: photos.bird,
  },
  {
    quote: 'A creche manda as fotos mais fofas durante o dia, e o nosso beagle dorme a noite inteira depois.',
    name: 'João B.',
    pet: 'Tutor do Biscoito · Beagle',
    image: photos.daycare,
  },
]

function ReviewCard({ review }: { review: Review }) {
  return (
    <figure className="rounded-[28px] bg-white p-7 shadow-[0_1px_0_rgba(26,61,26,0.04)]">
      <div className="flex gap-0.5 text-orange" aria-label="5 de 5 estrelas">
        {Array.from({ length: 5 }, (_, i) => (
          <Star key={i} className="size-4" fill="currentColor" strokeWidth={0} />
        ))}
      </div>
      <blockquote className="mt-5 text-[17px] leading-relaxed text-gray-800">“{review.quote}”</blockquote>
      <figcaption className="mt-6 flex items-center gap-3">
        <img
          src={review.image.src}
          alt=""
          width={review.image.width}
          height={review.image.height}
          loading="lazy"
          decoding="async"
          className="size-11 rounded-full object-cover object-[50%_30%]"
        />
        <div>
          <p className="font-semibold text-gray-900">{review.name}</p>
          <p className="text-sm text-gray-500">{review.pet}</p>
        </div>
      </figcaption>
    </figure>
  )
}

export function Testimonials() {
  const ref = useRef<HTMLDivElement>(null)
  const wide = useMediaQuery('(min-width: 1024px)')
  const still = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  // Columns drift at different speeds on desktop for a little depth.
  const offsets = [
    useTransform(scrollYProgress, [0, 1], [60, -40]),
    useTransform(scrollYProgress, [0, 1], [140, -120]),
    useTransform(scrollYProgress, [0, 1], [90, -60]),
  ]
  const columns = wide ? [0, 1, 2].map((c) => REVIEWS.filter((_, i) => i % 3 === c)) : [REVIEWS]

  return (
    <section id="reviews" aria-labelledby="reviews-title" className="scroll-mt-20 overflow-hidden py-24 md:py-32">
      <Container>
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <Reveal className="max-w-2xl">
            <Eyebrow>Avaliações</Eyebrow>
            <SectionTitle className="mt-4 text-forest">
              <span id="reviews-title">Amado pelos pets e pelos tutores</span>
            </SectionTitle>
          </Reveal>
          <Reveal delay={0.1} className="flex items-center gap-4">
            <p className="font-serif-display text-6xl leading-none text-forest">4,6</p>
            <div>
              <div className="flex gap-0.5 text-orange" aria-hidden="true">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className="size-4" fill="currentColor" strokeWidth={0} />
                ))}
              </div>
              <p className="mt-1 text-sm text-gray-600">de mais de 12 mil avaliações</p>
            </div>
          </Reveal>
        </div>

        <div ref={ref} className="mt-14 grid gap-5 sm:grid-cols-2 md:mt-20 lg:grid-cols-3">
          {columns.map((reviews, c) =>
            wide ? (
              <motion.div key={c} style={still ? undefined : { y: offsets[c] }} className="flex flex-col gap-5">
                {reviews.map((review) => (
                  <Reveal key={review.name}>
                    <ReviewCard review={review} />
                  </Reveal>
                ))}
              </motion.div>
            ) : (
              reviews.map((review, i) => (
                <Reveal key={review.name} delay={(i % 2) * 0.08}>
                  <ReviewCard review={review} />
                </Reveal>
              ))
            ),
          )}
        </div>
      </Container>
    </section>
  )
}
