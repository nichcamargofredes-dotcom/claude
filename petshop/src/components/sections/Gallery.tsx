import { ArrowUpRight } from 'lucide-react'
import { motion, useMotionValue, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useLayoutEffect, useRef } from 'react'
import { photos, type Photo } from '../../lib/assets'
import { useMediaQuery } from '../../lib/hooks'
import { PawIcon } from '../PawIcon'
import { Eyebrow, Reveal } from '../ui'

const MOMENTS: { image: Photo; handle: string; alt: string }[] = [
  { image: photos.hug, handle: '@mari.e.luna', alt: 'Mulher rindo e abraçando seu golden retriever no sofá' },
  { image: photos.catNap, handle: '@abobora.dorminhoco', alt: 'Gato rajado dormindo em uma cama laranja ao sol' },
  { image: photos.puppyToy, handle: '@biscoito.corre', alt: 'Filhote carregando um brinquedo de corda laranja na grama' },
  { image: photos.walk, handle: '@passeio.de.domingo', alt: 'Border collie com guia laranja passeando no parque no outono' },
  { image: photos.daycare, handle: '@cozypaws.daycare', alt: 'Beagle e poodle brincando juntos em um tapete' },
  { image: photos.delivery, handle: '@figo.curiosa', alt: 'Gato rajado inspecionando uma caixa de entrega' },
]

function Intro() {
  return (
    <div className="flex w-[min(420px,80vw)] shrink-0 flex-col justify-center pr-6">
      <Eyebrow>#FamíliaCozyPaws</Eyebrow>
      <h2 id="gallery-title" className="mt-4 font-serif-display text-[clamp(38px,5vw,64px)] leading-[1] tracking-tight text-forest">
        Pets de verdade, sonecas de verdade
      </h2>
      <p className="mt-5 max-w-sm leading-relaxed text-gray-600">
        Marque <span className="font-semibold text-forest">@cozypaws</span> e o seu melhor amigo pode aparecer no nosso mural
        e nesta página.
      </p>
    </div>
  )
}

function MomentCard({ moment, index }: { moment: (typeof MOMENTS)[number]; index: number }) {
  return (
    <figure className={`group w-[min(46vh,70vw)] shrink-0 ${index % 2 ? 'lg:translate-y-[5vh]' : 'lg:-translate-y-[5vh]'}`}>
      <div className="aspect-[3/4] overflow-hidden rounded-[28px] bg-sage">
        <img
          src={moment.image.src}
          srcSet={moment.image.srcSet}
          sizes="(min-width: 1024px) 46vh, 70vw"
          width={moment.image.width}
          height={moment.image.height}
          alt={moment.alt}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
        />
      </div>
      <figcaption className="mt-3 flex items-center gap-2 text-sm font-medium text-forest/80">
        <PawIcon className="size-4 text-orange" />
        {moment.handle}
      </figcaption>
    </figure>
  )
}

function Outro() {
  return (
    <a
      href="https://instagram.com/"
      target="_blank"
      rel="noreferrer"
      className="group grid aspect-[3/4] w-[min(36vh,60vw)] shrink-0 place-items-center rounded-[28px] bg-forest p-8 text-center text-white transition-colors hover:bg-forest-hover"
    >
      <span>
        <PawIcon className="mx-auto size-12 text-orange" />
        <span className="mt-5 block font-serif-display text-3xl leading-tight">Compartilhe seus momentos</span>
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-leaf">
          Siga @cozypaws
          <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </span>
    </a>
  )
}

/** Vertical scrolling drives the row sideways while the section is pinned. */
function PinnedGallery() {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const distance = useMotionValue(0)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })
  const x = useTransform(() => -scrollYProgress.get() * distance.get())

  useLayoutEffect(() => {
    const track = trackRef.current
    const section = sectionRef.current
    if (!track || !section) return
    const measure = () => {
      const d = Math.max(0, track.scrollWidth - window.innerWidth)
      distance.set(d)
      section.style.height = `${window.innerHeight + d}px`
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(track)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [distance])

  return (
    <section ref={sectionRef} id="gallery" aria-labelledby="gallery-title" className="relative scroll-mt-20">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <motion.div ref={trackRef} style={{ x }} className="flex w-max items-center gap-6 px-12 xl:px-[max(3rem,calc((100vw-1320px)/2+3rem))]">
          <Intro />
          {MOMENTS.map((moment, i) => (
            <MomentCard key={moment.handle} moment={moment} index={i} />
          ))}
          <Outro />
        </motion.div>
      </div>
    </section>
  )
}

function SwipeGallery() {
  return (
    <section id="gallery" aria-labelledby="gallery-title" className="scroll-mt-20 py-24">
      <div className="px-5 sm:px-8">
        <Reveal>
          <Intro />
        </Reveal>
      </div>
      <div className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:px-8">
        {MOMENTS.map((moment, i) => (
          <div key={moment.handle} className="snap-start">
            <MomentCard moment={moment} index={i} />
          </div>
        ))}
        <div className="snap-start">
          <Outro />
        </div>
      </div>
    </section>
  )
}

export function Gallery() {
  const wide = useMediaQuery('(min-width: 1024px)')
  const still = useReducedMotion()
  return wide && !still ? <PinnedGallery /> : <SwipeGallery />
}
