import { animate, motion, useInView, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { useEffect, useRef } from 'react'
import { photos, type Photo } from '../../lib/assets'
import { Container, Eyebrow, Reveal } from '../ui'

type Token = string | { image: Photo; alt: string }

const STATEMENT: Token[] = [
  ...'We opened CozyPaws in 2016 with one rule:'.split(' '),
  { image: photos.dog, alt: 'Corgi' },
  ...'if we wouldn’t give it to our own pets, it doesn’t go on the shelf. Today that means vet-checked food, toys that survive the zoomies'.split(' '),
  { image: photos.cat, alt: 'Ginger cat' },
  ...'and a team that knows every regular by name.'.split(' '),
  { image: photos.rabbit, alt: 'Rabbit' },
]

function RevealToken({ token, progress, range }: { token: Token; progress: MotionValue<number>; range: [number, number] }) {
  const still = useReducedMotion()
  const fade = useTransform(progress, range, [0.16, 1])
  const grow = useTransform(progress, range, [0.6, 1])
  const opacity = still ? 1 : fade
  const scale = still ? 1 : grow

  if (typeof token === 'string') {
    return (
      <>
        <motion.span style={{ opacity }}>{token}</motion.span>{' '}
      </>
    )
  }
  return (
    <>
      <motion.span
        style={{ opacity, scale }}
        className="mx-[0.06em] inline-block h-[0.8em] w-[1.55em] translate-y-[0.08em] overflow-hidden rounded-full align-baseline"
      >
        <img
          src={token.image.src}
          alt={token.alt}
          width={token.image.width}
          height={token.image.height}
          loading="lazy"
          className="h-full w-full object-cover object-[50%_30%]"
        />
      </motion.span>{' '}
    </>
  )
}

const STATS = [
  { value: 98, suffix: 'K+', decimals: 0, label: 'Happy pet parents' },
  { value: 4.6, suffix: '', decimals: 1, label: 'Average rating from 12K reviews' },
  { value: 1200, suffix: '+', decimals: 0, label: 'Products picked by our team' },
  { value: 10, suffix: ' yrs', decimals: 0, label: 'Caring for pets since 2016' },
]

function CountUp({ value, suffix, decimals }: { value: number; suffix: string; decimals: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -15% 0px' })

  useEffect(() => {
    const el = ref.current
    if (!el || !inView) return
    const format = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix
    const controls = animate(0, value, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (n) => (el.textContent = format(n)),
    })
    return () => controls.stop()
  }, [inView, value, suffix, decimals])

  return (
    <span ref={ref} aria-hidden="true">
      0{suffix}
    </span>
  )
}

export function Story() {
  const ref = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.5'] })
  const step = 1 / STATEMENT.length

  return (
    <section id="story" aria-labelledby="story-title" className="scroll-mt-20 bg-mist py-24 md:py-36">
      <Container>
        <div className="mx-auto max-w-5xl text-center">
          <Reveal>
            <Eyebrow>
              <span id="story-title">Our story</span>
            </Eyebrow>
          </Reveal>
          <p
            ref={ref}
            className="mt-8 font-serif-display text-[clamp(30px,4.3vw,60px)] leading-[1.14] tracking-tight text-forest"
          >
            <span className="sr-only">
              We opened CozyPaws in 2016 with one rule: if we wouldn’t give it to our own pets, it doesn’t go on the shelf.
              Today that means vet-checked food, toys that survive the zoomies and a team that knows every regular by name.
            </span>
            <span aria-hidden="true">
              {STATEMENT.map((token, i) => (
                <RevealToken key={i} token={token} progress={scrollYProgress} range={[i * step, (i + 1) * step]} />
              ))}
            </span>
          </p>
        </div>

        <dl className="mx-auto mt-20 grid max-w-6xl grid-cols-2 gap-y-10 md:mt-28 lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <Reveal
              key={stat.label}
              delay={i * 0.08}
              className={`px-4 text-center lg:px-6 ${i > 0 ? 'lg:border-l lg:border-forest/10' : ''} ${i % 2 === 1 ? 'border-l border-forest/10 lg:border-l' : ''}`}
            >
              <dt className="sr-only">{stat.label}</dt>
              <dd className="font-serif-display text-5xl leading-none text-forest md:text-6xl">
                <span className="sr-only">
                  {stat.value}
                  {stat.suffix}
                </span>
                <CountUp value={stat.value} suffix={stat.suffix} decimals={stat.decimals} />
              </dd>
              <dd aria-hidden="true" className="mx-auto mt-3 max-w-[18ch] text-sm leading-snug text-gray-600">
                {stat.label}
              </dd>
            </Reveal>
          ))}
        </dl>
      </Container>
    </section>
  )
}
