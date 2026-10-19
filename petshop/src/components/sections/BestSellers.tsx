import { Star } from 'lucide-react'
import { motion } from 'motion/react'
import { figmaSrcSet, heroAssets, photos, type Photo } from '../../lib/assets'
import { Container, Eyebrow, Reveal, SectionTitle } from '../ui'
import { brl } from '../../lib/format'
import { EASE_OUT } from '../../lib/motion'

type Product = {
  id: string
  name: string
  note: string
  price: number
  was?: number
  rating: number
  reviews: string
  badge?: string
  image: Photo
  alt: string
}

const PRODUCTS: Product[] = [
  {
    id: 'cama-nuvem',
    name: 'Cama Nuvem',
    note: 'Cães e gatos · Média',
    price: 349.9,
    rating: 4.8,
    reviews: '521',
    badge: 'Novo',
    image: photos.donutBed,
    alt: 'Cama redonda de pelúcia laranja para pets',
  },
  {
    id: 'racao-sem-graos',
    name: 'Ração sem grãos, 2 kg',
    note: 'Cães adultos · Salmão e ervilha',
    price: 179.9,
    was: 209.9,
    rating: 4.7,
    reviews: '1,2 mil',
    badge: '−15%',
    image: photos.kibble,
    alt: 'Saco de ração kraft ao lado de uma tigela com ração',
  },
  {
    id: 'trio-de-brinquedos',
    name: 'Trio de brinquedos',
    note: 'Corda, bolinha e pelúcia',
    price: 99.9,
    rating: 4.9,
    reviews: '204',
    image: photos.toys,
    alt: 'Dois brinquedos de corda trançada e uma bolinha verde de borracha',
  },
  {
    id: 'kit-couro-verde',
    name: 'Kit couro verde',
    note: 'Coleira + guia · Metal dourado',
    price: 219.9,
    rating: 4.8,
    reviews: '96',
    image: photos.collar,
    alt: 'Coleira e guia de couro verde-escuro',
  },
]

function Rating({ value, reviews }: { value: number; reviews: string }) {
  return (
    <p className="flex items-center gap-1 text-xs text-gray-600">
      <Star className="size-3.5 text-orange" fill="currentColor" strokeWidth={0} />
      <span className="font-semibold text-gray-800">{value.toLocaleString('pt-BR', { minimumFractionDigits: 1 })}</span>
      <span>
        · {reviews}
        <span className="max-sm:sr-only"> avaliações</span>
      </span>
    </p>
  )
}

function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group flex h-full flex-col rounded-[28px] bg-white p-3 shadow-[0_1px_0_rgba(26,61,26,0.04)] transition-shadow duration-500 hover:shadow-[0_24px_60px_-28px_rgba(26,61,26,0.35)]">
      <div className="relative aspect-square overflow-hidden rounded-[20px] bg-[#f2f3f0]">
        <img
          src={product.image.src}
          srcSet={product.image.srcSet}
          sizes="(min-width: 1024px) 22vw, 50vw"
          width={product.image.width}
          height={product.image.height}
          alt={product.alt}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
        />
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-forest px-2.5 py-1 text-xs font-semibold text-white">
            {product.badge}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col px-1 pb-1 pt-4 sm:px-2">
        <h3 className="font-semibold leading-snug text-gray-900">{product.name}</h3>
        <p className="mt-0.5 text-sm text-gray-500">{product.note}</p>
        <div className="mt-auto pt-4">
          <Rating value={product.rating} reviews={product.reviews} />
          <p className="mt-2 flex flex-wrap items-baseline gap-x-2">
            <span className="text-lg font-semibold text-forest">{brl(product.price)}</span>
            {product.was && <span className="text-sm text-gray-400 line-through">{brl(product.was)}</span>}
          </p>
        </div>
      </div>
    </article>
  )
}

function FeatureCard() {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[32px] bg-white p-3 md:p-4">
      <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-[24px] bg-[radial-gradient(120%_90%_at_50%_100%,#c9eccf_0%,#e3f6e5_55%,#f1fbf1_100%)] p-8">
        <motion.img
          src={heroAssets.catHouse}
          srcSet={figmaSrcSet(heroAssets.catHouse, [520, 800, 1024])}
          sizes="(min-width: 1024px) 40vw, 90vw"
          width={1024}
          height={1024}
          alt="Arranhador de pelúcia laranja com toca e postes de sisal"
          loading="lazy"
          className="relative aspect-square w-full max-w-[460px] object-contain drop-shadow-[0_30px_30px_rgba(26,61,26,0.18)]"
          initial={{ y: 40, scale: 0.94, opacity: 0 }}
          whileInView={{ y: 0, scale: 1, opacity: 1 }}
          viewport={{ once: true, margin: '0px 0px -15% 0px' }}
          transition={{ duration: 1.2, ease: EASE_OUT }}
        />
        <span className="absolute left-4 top-4 rounded-full bg-orange px-3 py-1.5 text-xs font-semibold text-white">
          Mais vendido
        </span>
      </div>
      <div className="flex flex-col gap-5 px-2 pb-2 pt-5 sm:flex-row sm:items-end sm:justify-between md:px-3">
        <div>
          <Rating value={4.9} reviews="318" />
          <h3 className="mt-2 font-serif-display text-3xl leading-tight text-forest md:text-4xl">Casinha Aconchego</h3>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-gray-600">
            Dois andares de pelúcia, postes de sisal para arranhar e uma toca feita para sonecas longas.
          </p>
        </div>
        <p className="shrink-0 text-2xl font-semibold text-forest">{brl(279.9)}</p>
      </div>
    </article>
  )
}

export function BestSellers() {
  return (
    <section id="bestsellers" aria-labelledby="bestsellers-title" className="scroll-mt-20 pb-24 md:pb-32">
      <Container>
        <Reveal className="max-w-2xl">
          <Eyebrow>Mais vendidos da semana</Eyebrow>
          <SectionTitle className="mt-4 text-forest">
            <span id="bestsellers-title">Amados pelos pets, aprovados por veterinários</span>
          </SectionTitle>
        </Reveal>

        <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-5 md:mt-16 lg:grid-cols-4">
          <Reveal className="col-span-2 lg:row-span-2">
            <FeatureCard />
          </Reveal>
          {PRODUCTS.map((product, i) => (
            <Reveal key={product.id} delay={0.08 * (i + 1)}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}
