import { Check, Heart, Plus, ShoppingBag, Star } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { figmaSrcSet, heroAssets, photos, type Photo } from '../../lib/assets'
import { useShop } from '../../lib/shop'
import { Container, Eyebrow, Reveal, SectionTitle } from '../ui'
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
    id: 'cloud-donut-bed',
    name: 'Cloud Donut Bed',
    note: 'Dogs & cats · Medium',
    price: 64,
    rating: 4.8,
    reviews: '521',
    badge: 'New',
    image: photos.donutBed,
    alt: 'Round orange plush donut pet bed',
  },
  {
    id: 'grain-free-kibble',
    name: 'Grain-Free Kibble, 2 kg',
    note: 'Adult dogs · Salmon & pea',
    price: 32.5,
    was: 38,
    rating: 4.7,
    reviews: '1.2K',
    badge: '−15%',
    image: photos.kibble,
    alt: 'Kraft bag of dog food next to a bowl of kibble',
  },
  {
    id: 'playtime-toy-trio',
    name: 'Playtime Toy Trio',
    note: 'Rope, ball & plush',
    price: 18.9,
    rating: 4.9,
    reviews: '204',
    image: photos.toys,
    alt: 'Two braided rope toys and a green rubber ball',
  },
  {
    id: 'forest-leather-set',
    name: 'Forest Leather Set',
    note: 'Collar + leash · Brass',
    price: 39,
    rating: 4.8,
    reviews: '96',
    image: photos.collar,
    alt: 'Dark green leather dog collar and leash',
  },
]

const money = (n: number) => `$${n.toFixed(2)}`

function FavoriteButton({ id, name, className = '' }: { id: string; name: string; className?: string }) {
  const { favorites, toggleFavorite } = useShop()
  const active = favorites.has(id)
  return (
    <button
      type="button"
      onClick={() => toggleFavorite(id, name)}
      aria-pressed={active}
      aria-label={active ? `Remove ${name} from favorites` : `Save ${name} to favorites`}
      className={`grid size-10 place-items-center rounded-full bg-white/90 text-forest shadow-sm backdrop-blur transition-[color,scale] hover:scale-105 active:scale-95 ${className}`}
    >
      <Heart className={`size-[18px] transition-colors ${active ? 'fill-orange text-orange' : ''}`} strokeWidth={2} />
    </button>
  )
}

function useJustAdded() {
  const [added, setAdded] = useState(false)
  useEffect(() => {
    if (!added) return
    const t = window.setTimeout(() => setAdded(false), 1400)
    return () => window.clearTimeout(t)
  }, [added])
  return [added, () => setAdded(true)] as const
}

function AddButton({ name, wide = false }: { name: string; wide?: boolean }) {
  const { addToCart } = useShop()
  const [added, markAdded] = useJustAdded()
  const onClick = () => {
    addToCart(name)
    markAdded()
  }

  if (wide) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-forest px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-forest-hover"
      >
        {added ? <Check className="size-4" strokeWidth={2.5} /> : <ShoppingBag className="size-4" />}
        {added ? 'Added to cart' : 'Add to cart'}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Add ${name} to cart`}
      className={`relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-full text-white transition-colors ${added ? 'bg-orange' : 'bg-forest hover:bg-forest-hover'}`}
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={added ? 'check' : 'plus'}
          initial={{ y: 18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -18, opacity: 0 }}
          transition={{ duration: 0.25, ease: EASE_OUT }}
        >
          {added ? <Check className="size-5" strokeWidth={2.5} /> : <Plus className="size-5" strokeWidth={2.25} />}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}

function Rating({ value, reviews }: { value: number; reviews: string }) {
  return (
    <p className="flex items-center gap-1 text-xs text-gray-600">
      <Star className="size-3.5 text-orange" fill="currentColor" strokeWidth={0} />
      <span className="font-semibold text-gray-800">{value.toFixed(1)}</span>
      <span>
        · {reviews}
        <span className="max-sm:sr-only"> reviews</span>
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
        <FavoriteButton id={product.id} name={product.name} className="absolute right-3 top-3" />
      </div>
      <div className="flex flex-1 flex-col px-1 pb-1 pt-4 sm:px-2">
        <h3 className="font-semibold leading-snug text-gray-900">{product.name}</h3>
        <p className="mt-0.5 text-sm text-gray-500">{product.note}</p>
        <div className="mt-auto pt-4">
          <Rating value={product.rating} reviews={product.reviews} />
          <div className="mt-2 flex items-center justify-between gap-2">
            <p className="flex min-w-0 flex-wrap items-baseline gap-x-2">
              <span className="text-lg font-semibold text-forest">{money(product.price)}</span>
              {product.was && <span className="text-sm text-gray-400 line-through">{money(product.was)}</span>}
            </p>
            <AddButton name={product.name} />
          </div>
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
          alt="Orange plush cat tree with a hideaway house and sisal posts"
          loading="lazy"
          className="relative aspect-square w-full max-w-[460px] object-contain drop-shadow-[0_30px_30px_rgba(26,61,26,0.18)]"
          initial={{ y: 40, scale: 0.94, opacity: 0 }}
          whileInView={{ y: 0, scale: 1, opacity: 1 }}
          viewport={{ once: true, margin: '0px 0px -15% 0px' }}
          transition={{ duration: 1.2, ease: EASE_OUT }}
        />
        <span className="absolute left-4 top-4 rounded-full bg-orange px-3 py-1.5 text-xs font-semibold text-white">
          Bestseller
        </span>
        <FavoriteButton id="cozy-cat-house" name="Cozy Cat House" className="absolute right-4 top-4" />
      </div>
      <div className="flex flex-col gap-5 px-2 pb-2 pt-5 sm:flex-row sm:items-end sm:justify-between md:px-3">
        <div>
          <Rating value={4.9} reviews="318" />
          <h3 className="mt-2 font-serif-display text-3xl leading-tight text-forest md:text-4xl">Cozy Cat House</h3>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-gray-600">
            Two plush levels, sisal scratching posts and a hideaway made for long naps.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-4">
          <p className="text-2xl font-semibold text-forest">$49.99</p>
          <AddButton name="Cozy Cat House" wide />
        </div>
      </div>
    </article>
  )
}

export function BestSellers() {
  return (
    <section id="bestsellers" aria-labelledby="bestsellers-title" className="scroll-mt-20 pb-24 md:pb-32">
      <Container>
        <Reveal className="max-w-2xl">
          <Eyebrow>Best sellers this week</Eyebrow>
          <SectionTitle className="mt-4 text-forest">
            <span id="bestsellers-title">Loved by tails, approved by vets</span>
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
