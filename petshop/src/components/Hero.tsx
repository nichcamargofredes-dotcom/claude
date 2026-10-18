import { ArrowRight, ArrowUpRight, Play, Plus, Star } from 'lucide-react'
import type { CSSProperties } from 'react'
import { figmaSrcSet, heroAssets, heroSizes } from '../lib/assets'

const overlayBottom: CSSProperties = { bottom: 'clamp(20px, 4vh, 50px)' }

/* ---------------------------------------------------------------- shared */

function HeroHeading({ className, delays }: { className: string; delays: [string, string, string, string] }) {
  return (
    <h1 className={`font-serif-display tracking-tight text-forest ${className}`}>
      <span className={`inline-block animate-word-pop ${delays[0]}`}>Everything</span>
      <br />
      <span className={`inline-block animate-word-pop ${delays[1]}`}>Your</span>{' '}
      <span className={`inline-block animate-word-pop ${delays[2]}`}>Pets</span>{' '}
      <span className={`inline-block animate-word-pop ${delays[3]}`}>Love</span>
    </h1>
  )
}

function ExploreButton({ className = '' }: { className?: string }) {
  return (
    <a
      href="#shop"
      className={`inline-flex items-center gap-2 rounded-full bg-orange font-semibold text-white shadow-[0_8px_24px_-10px_rgba(232,106,16,0.7)] transition-colors hover:bg-orange-hover ${className}`}
    >
      Explore Products
      <ArrowRight className="size-[1.15em]" strokeWidth={2.25} />
    </a>
  )
}

function AvatarStack({ size }: { size: string }) {
  return (
    <div className="flex shrink-0 -space-x-3">
      <img
        src={heroAssets.avatar}
        alt=""
        width={44}
        height={44}
        className={`${size} rounded-full border-2 border-leaf object-cover`}
      />
      <span className={`${size} grid place-items-center rounded-full border-2 border-leaf bg-forest text-white`}>
        <Plus className="size-1/2" strokeWidth={2.5} />
      </span>
    </div>
  )
}

/** Product card with the cat house cut-out. */
function CatHouseCard({
  className,
  sizes,
  textClass,
  aspect = 'aspect-[260/257]',
}: {
  className: string
  sizes: string
  textClass: [string, string]
  aspect?: string
}) {
  return (
    <article className={className}>
      <div className={`group relative overflow-hidden rounded-2xl bg-white ${aspect}`}>
        <img
          src={heroAssets.catHouse}
          srcSet={figmaSrcSet(heroAssets.catHouse, [320, 520, 800])}
          sizes={sizes}
          width={heroSizes.catHouse.width}
          height={heroSizes.catHouse.height}
          alt="Orange plush cat tree with a hideaway house"
          className="h-full w-full object-contain transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
        />
        <a
          href="#shop"
          aria-label="View the Cozy Cat House"
          className="absolute bottom-[8%] right-[8%] grid size-[clamp(30px,2.6vw,44px)] place-items-center rounded-full bg-forest text-white transition-colors hover:bg-forest-hover"
        >
          <ArrowUpRight className="size-1/2" strokeWidth={2.25} />
        </a>
      </div>
      <p className={`mt-[0.6em] text-gray-700 ${textClass[0]}`}>Cozy Cat House</p>
      <p className={`font-semibold text-forest ${textClass[1]}`}>$49.99</p>
    </article>
  )
}

/** Review video teaser. `arch` is where the white curve starts, as a % of the card height. */
function VideoCard({
  className,
  arch,
  textClass,
  aspect = 'aspect-[177/287]',
}: {
  className: string
  arch: string
  textClass: string
  aspect?: string
}) {
  return (
    <article className={className}>
      <div className={`relative overflow-hidden rounded-2xl bg-white ${aspect}`}>
        <img
          src={heroAssets.videoCard}
          width={heroSizes.videoCard.width}
          height={heroSizes.videoCard.height}
          alt="Shiba Inu unboxing a rope toy delivered by CozyPaws"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-x-0 flex flex-col items-center px-[9%] text-center" style={{ top: arch }}>
          <a
            href="#reviews"
            aria-label="Watch product reviews"
            className="grid size-[clamp(32px,2.7vw,44px)] -translate-y-1/2 place-items-center rounded-full bg-forest text-white shadow-[0_8px_20px_-8px_rgba(26,61,26,0.8)] transition hover:scale-105 hover:bg-forest-hover"
          >
            <Play className="size-[42%] translate-x-[8%]" fill="currentColor" strokeWidth={0} />
          </a>
          <p className={`-mt-[0.4em] font-medium leading-snug text-gray-700 ${textClass}`}>
            Watch Product Reviews on TikTok and YouTube
          </p>
        </div>
      </div>
    </article>
  )
}

/* ------------------------------------------------- bottom photo strip */

type StripProps = {
  maxHeights?: [string, string, string]
  overlays: 'all' | 'sides' | 'none'
  className: string
}

function PhotoStrip({ maxHeights, overlays, className }: StripProps) {
  const sides = overlays !== 'none'
  return (
    <div className={`@container flex items-end ${className}`}>
      <figure className="relative min-w-0 flex-1 animate-photo-reveal delay-800" style={{ maxHeight: maxHeights?.[0] }}>
        <img
          src={heroAssets.bottomLeft}
          srcSet={figmaSrcSet(heroAssets.bottomLeft, [440, 870])}
          sizes="31vw"
          width={heroSizes.bottomLeft.width}
          height={heroSizes.bottomLeft.height}
          alt="Dachshund peeking over a mint wall"
          className="block h-auto w-full"
        />
        {sides && (
          <div className="absolute left-[8%] animate-scale-in delay-1000" style={overlayBottom}>
            <div className="flex items-center gap-[clamp(8px,1cqw,14px)]">
              <AvatarStack size="size-[clamp(32px,3.1cqw,46px)]" />
              <div>
                <p className="text-[clamp(20px,2.55cqw,38px)] font-semibold leading-none tracking-tight text-forest">98K+</p>
                <p className="mt-1 text-[clamp(11px,0.9cqw,14px)] font-medium text-forest/80">Happy pet parents</p>
              </div>
            </div>
          </div>
        )}
      </figure>

      <figure className="relative min-w-0 flex-[1.265] animate-photo-reveal delay-600" style={{ maxHeight: maxHeights?.[1] }}>
        <img
          src={heroAssets.bottomCenter}
          srcSet={figmaSrcSet(heroAssets.bottomCenter, [560, 1100])}
          sizes="39vw"
          width={heroSizes.bottomCenter.width}
          height={heroSizes.bottomCenter.height}
          alt="Golden retriever resting its paws on a dark green wall"
          className="block h-auto w-full"
        />
        {overlays === 'all' && (
          <div className="absolute inset-x-0 flex animate-scale-in flex-col items-center text-center delay-1100" style={overlayBottom}>
            <p className="text-[clamp(16px,1.8cqw,28px)] font-semibold leading-[1.15] tracking-tight text-white">
              Best Products
              <br />
              for Your Pet
            </p>
            <ExploreButton className="mt-[clamp(8px,1.1cqw,16px)] px-[clamp(14px,1.5cqw,24px)] py-[clamp(7px,0.75cqw,12px)] text-[clamp(12px,0.98cqw,15px)]" />
          </div>
        )}
      </figure>

      <figure className="relative min-w-0 flex-1 animate-photo-reveal delay-900" style={{ maxHeight: maxHeights?.[2] }}>
        <img
          src={heroAssets.bottomRight}
          srcSet={figmaSrcSet(heroAssets.bottomRight, [440, 870])}
          sizes="31vw"
          width={heroSizes.bottomRight.width}
          height={heroSizes.bottomRight.height}
          alt="Ginger cat peeking over a mint wall"
          className="block h-auto w-full"
        />
        {sides && (
          <div className="absolute right-[8%] animate-scale-in text-right delay-1200" style={overlayBottom}>
            <div className="flex items-center justify-end gap-[clamp(6px,0.65cqw,10px)]">
              <Star className="size-[clamp(18px,2.1cqw,32px)] text-orange" fill="currentColor" strokeWidth={0} />
              <p className="text-[clamp(20px,2.55cqw,38px)] font-semibold leading-none tracking-tight text-forest">4.6</p>
            </div>
            <p className="mt-1 text-[clamp(11px,0.9cqw,14px)] font-medium text-forest/80">Average rating · 12K reviews</p>
          </div>
        )}
      </figure>
    </div>
  )
}

/** Photo strip pinned to the bottom, centred at --strip-w with leaf bands extending the wall. */
function Wall({ maxHeights, overlays }: Pick<StripProps, 'maxHeights' | 'overlays'>) {
  const band = 'absolute bottom-0 h-[calc(var(--strip-w)*0.1338)] w-[calc((100%-var(--strip-w))/2+1px)] animate-fade-in bg-leaf delay-800'
  return (
    <div className="absolute inset-x-0 bottom-0 z-10 flex justify-center">
      <div aria-hidden="true" className={`left-0 ${band}`} />
      <div aria-hidden="true" className={`right-0 ${band}`} />
      <PhotoStrip className="relative w-[var(--strip-w)] shrink-0" maxHeights={maxHeights} overlays={overlays} />
    </div>
  )
}

/* -------------------------------------------------------------- layouts */

function DesktopHero() {
  return (
    <div className="hero-desktop relative hidden flex-1 lg:block">
      <div className="absolute inset-x-0 top-0 z-5 px-12 pt-[var(--hero-pt)] text-center">
        <HeroHeading
          className="text-[length:var(--hero-fs)] leading-[0.95]"
          delays={['delay-200', 'delay-400', 'delay-500', 'delay-600']}
        />
      </div>

      <CatHouseCard
        className="absolute left-12 top-[50px] z-20 w-[clamp(160px,14vw,260px)] animate-slide-in-left delay-600"
        sizes="(min-width: 1024px) 14vw, 160px"
        textClass={['text-[clamp(13px,1.05vw,17px)]', 'text-[clamp(15px,1.25vw,20px)]']}
      />

      <VideoCard
        className="absolute right-12 top-[50px] z-20 w-[clamp(120px,10vw,177px)] animate-slide-in-right delay-700"
        arch="55.4%"
        textClass="text-[clamp(10px,0.74vw,12px)]"
      />

      <Wall maxHeights={['min(70vh, 55vw)', 'min(85vh, 70vw)', 'min(70vh, 55vw)']} overlays="all" />
    </div>
  )
}

function TabletHero() {
  return (
    <div className="hero-tablet relative hidden flex-1 md:block lg:hidden">
      <CatHouseCard
        className="absolute left-4 top-[80px] z-20 w-[160px] animate-slide-in-left delay-600"
        sizes="160px"
        textClass={['text-sm', 'text-base']}
      />

      <VideoCard
        className="absolute right-4 top-[80px] z-20 w-[120px] animate-slide-in-right delay-700"
        arch="55.4%"
        textClass="text-[10px]"
      />

      {/* Portrait tablets have room to spare: centre the message between the cards and the photos. */}
      <div className="absolute inset-x-0 top-[300px] bottom-[calc(var(--strip-w)*0.40575)] z-5 flex flex-col items-center justify-center px-8 text-center">
        <HeroHeading className="text-7xl leading-[0.95]" delays={['delay-200', 'delay-400', 'delay-500', 'delay-600']} />
        <p className="mt-5 max-w-md animate-fade-up text-lg leading-relaxed text-gray-600 delay-700">
          Vet-approved food, cozy beds, toys and grooming, delivered to your door the same day.
        </p>
        <div className="mt-7 animate-fade-up delay-800">
          <ExploreButton className="px-7 py-3.5 text-base" />
        </div>
      </div>

      <Wall maxHeights={['60vh', '75vh', '60vh']} overlays="sides" />
    </div>
  )
}

function MobileHero() {
  return (
    <div className="flex flex-1 flex-col md:hidden">
      <div className="px-5 pt-5 text-center">
        <HeroHeading className="text-[36px] leading-[1.02]" delays={['delay-200', 'delay-300', 'delay-400', 'delay-500']} />
        <p className="mx-auto mt-3 max-w-[30ch] animate-fade-up text-[15px] leading-relaxed text-gray-600 delay-500">
          Vet-approved food, cozy beds and toys, delivered to your door.
        </p>
        <div className="mt-5 animate-fade-up delay-600">
          <ExploreButton className="px-6 py-3 text-sm" />
        </div>
      </div>

      <div className="mt-6 flex items-start gap-3 px-4">
        <CatHouseCard
          className="min-w-0 flex-1 animate-slide-in-left delay-700"
          aspect="aspect-square"
          sizes="45vw"
          textClass={['text-sm', 'text-base']}
        />
        <VideoCard
          className="min-w-0 flex-1 animate-slide-in-right delay-700"
          aspect="aspect-[3/4]"
          arch="56.6%"
          textClass="text-[11px]"
        />
      </div>

      <div className="mx-4 mt-5 flex animate-fade-up items-center justify-center gap-5 delay-800">
        <div className="flex items-center gap-2.5">
          <AvatarStack size="size-9" />
          <div className="text-left">
            <p className="text-xl font-semibold leading-none text-forest">98K+</p>
            <p className="mt-0.5 text-xs text-gray-600">Happy pet parents</p>
          </div>
        </div>
        <span aria-hidden="true" className="h-9 w-px bg-forest/15" />
        <div className="flex items-center gap-2">
          <Star className="size-6 text-orange" fill="currentColor" strokeWidth={0} />
          <div className="text-left">
            <p className="text-xl font-semibold leading-none text-forest">4.6</p>
            <p className="mt-0.5 text-xs text-gray-600">Average rating</p>
          </div>
        </div>
      </div>

      <PhotoStrip className="mt-auto pt-6" overlays="none" />
    </div>
  )
}

export function Hero() {
  return (
    <section aria-label="Welcome" className="flex flex-1 flex-col overflow-hidden">
      <DesktopHero />
      <TabletHero />
      <MobileHero />
    </section>
  )
}
