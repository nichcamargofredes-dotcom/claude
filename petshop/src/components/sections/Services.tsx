import { ArrowRight, House, Scissors, Stethoscope, type LucideIcon } from 'lucide-react'
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { useRef } from 'react'
import { photos, type Photo } from '../../lib/assets'
import { Container, Eyebrow, Reveal, SectionTitle } from '../ui'

type Service = { id: string; title: string; text: string; meta: string; icon: LucideIcon; image: Photo; alt: string }

const SERVICES: Service[] = [
  {
    id: 'grooming',
    title: 'Banho e tosa',
    text: 'Banho morno, tosa de acordo com a raça e corte de unhas, com tosadores certificados e muita paciência com os agitados.',
    meta: 'A partir de R$ 90 · 60 a 90 min',
    icon: Scissors,
    image: photos.grooming,
    alt: 'Bichon branco sendo escovado na mesa de tosa',
  },
  {
    id: 'vet',
    title: 'Consultas veterinárias',
    text: 'Check-ups, vacinas e plano de alimentação com nossos veterinários parceiros, a duas portas da loja.',
    meta: 'A partir de R$ 150 · seg. a sáb.',
    icon: Stethoscope,
    image: photos.vet,
    alt: 'Veterinária examinando um filhote de golden retriever com estetoscópio',
  },
  {
    id: 'daycare',
    title: 'Creche e hotel',
    text: 'Brincadeiras supervisionadas, sonecas confortáveis e fotos ao longo do dia enquanto você trabalha ou viaja.',
    meta: 'A partir de R$ 80 por dia',
    icon: House,
    image: photos.daycare,
    alt: 'Beagle e poodle brincando em um tapete claro',
  },
]

const N = SERVICES.length

/** Each photo after the first wipes up over the previous one as its text reaches the middle of the screen. */
function StackedPhoto({ service, index, progress }: { service: Service; index: number; progress: MotionValue<number> }) {
  const start = index / N - 0.07
  const end = index / N + 0.07
  const clip = useTransform(progress, [start, end], ['inset(100% 0% 0% 0%)', 'inset(0% 0% 0% 0%)'])
  const scale = useTransform(progress, [start, end + 0.12], [1.18, 1])

  return (
    <motion.div className="absolute inset-0 overflow-hidden" style={index === 0 ? undefined : { clipPath: clip }}>
      <motion.img
        src={service.image.src}
        srcSet={service.image.srcSet}
        sizes="(min-width: 1024px) 42vw, 100vw"
        width={service.image.width}
        height={service.image.height}
        alt={service.alt}
        loading="lazy"
        decoding="async"
        style={index === 0 ? undefined : { scale }}
        className="h-full w-full object-cover"
      />
    </motion.div>
  )
}

function ServiceText({ service, index, progress }: { service: Service; index: number; progress: MotionValue<number> }) {
  const mid = (index + 0.5) / N
  const opacity = useTransform(progress, [mid - 0.25, mid - 0.1, mid + 0.1, mid + 0.25], [0.25, 1, 1, 0.25])
  const Icon = service.icon

  return (
    <motion.article style={{ opacity }} className="flex min-h-[72vh] flex-col justify-center py-10">
      <div className="flex items-center gap-4">
        <span className="font-serif-display text-2xl text-leaf">0{index + 1}</span>
        <span className="h-px w-12 bg-white/20" />
        <Icon className="size-5 text-leaf" strokeWidth={1.75} />
      </div>
      <h3 className="mt-6 font-serif-display text-[clamp(34px,3.6vw,52px)] leading-[1.05]">{service.title}</h3>
      <p className="mt-4 max-w-md text-lg leading-relaxed text-white/70">{service.text}</p>
      <p className="mt-6 inline-flex w-fit rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white/90">
        {service.meta}
      </p>
    </motion.article>
  )
}

function DesktopServices() {
  const listRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start center', 'end center'] })
  const bar = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  return (
    <div className="hidden grid-cols-[1fr_1.05fr] gap-16 lg:grid xl:gap-24">
      <div ref={listRef}>
        {SERVICES.map((service, i) => (
          <ServiceText key={service.id} service={service} index={i} progress={scrollYProgress} />
        ))}
      </div>
      <div className="relative">
        <div className="sticky top-[14vh] h-[72vh] overflow-hidden rounded-[36px] bg-forest-hover">
          {SERVICES.map((service, i) => (
            <StackedPhoto key={service.id} service={service} index={i} progress={scrollYProgress} />
          ))}
          <div className="absolute inset-x-6 bottom-6 h-1 overflow-hidden rounded-full bg-white/25">
            <motion.div className="h-full rounded-full bg-white" style={{ width: bar }} />
          </div>
        </div>
      </div>
    </div>
  )
}

/** On phones each photo opens up from a narrow window and settles as it scrolls into view. */
function WipePhoto({ service }: { service: Service }) {
  const ref = useRef<HTMLDivElement>(null)
  const still = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center 0.55'] })
  const clip = useTransform(scrollYProgress, [0, 1], ['inset(18% 12% 18% 12% round 28px)', 'inset(0% 0% 0% 0% round 28px)'])
  const scale = useTransform(scrollYProgress, [0, 1], [1.3, 1])

  return (
    <motion.div ref={ref} style={still ? undefined : { clipPath: clip }} className="aspect-[4/5] overflow-hidden rounded-[28px]">
      <motion.img
        src={service.image.src}
        srcSet={service.image.srcSet}
        sizes="(min-width: 640px) 45vw, 90vw"
        width={service.image.width}
        height={service.image.height}
        alt={service.alt}
        loading="lazy"
        decoding="async"
        style={still ? undefined : { scale }}
        className="h-full w-full object-cover"
      />
    </motion.div>
  )
}

function MobileServices() {
  return (
    <div className="grid gap-12 sm:grid-cols-2 lg:hidden">
      {SERVICES.map((service, i) => {
        const Icon = service.icon
        return (
          <Reveal key={service.id} delay={(i % 2) * 0.08}>
            <article>
              <WipePhoto service={service} />
              <div className="mt-6 flex items-center gap-3">
                <span className="font-serif-display text-xl text-leaf">0{i + 1}</span>
                <Icon className="size-5 text-leaf" strokeWidth={1.75} />
              </div>
              <h3 className="mt-3 font-serif-display text-3xl">{service.title}</h3>
              <p className="mt-3 leading-relaxed text-white/70">{service.text}</p>
              <p className="mt-4 text-sm font-medium text-white/90">{service.meta}</p>
            </article>
          </Reveal>
        )
      })}
    </div>
  )
}

export function Services() {
  return (
    <section id="services" aria-labelledby="services-title" className="scroll-mt-20 bg-forest py-24 text-white md:py-32">
      <Container>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <Reveal className="max-w-2xl">
            <Eyebrow tone="light">Mais que uma loja</Eyebrow>
            <SectionTitle className="mt-4">
              <span id="services-title">Cuidado em todas as fases da vida dele</span>
            </SectionTitle>
          </Reveal>
          <Reveal delay={0.15}>
            <a
              href="#contact"
              className="group inline-flex items-center gap-2 rounded-full bg-orange px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-orange-hover"
            >
              Agendar uma visita
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          </Reveal>
        </div>

        <div className="mt-16 lg:mt-8">
          <DesktopServices />
          <MobileServices />
        </div>
      </Container>
    </section>
  )
}
