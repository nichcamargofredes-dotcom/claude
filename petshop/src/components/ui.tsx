import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useRef, type ReactNode } from 'react'
import type { Photo } from '../lib/assets'
import { EASE_OUT } from '../lib/motion'

export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-12 ${className}`}>{children}</div>
}

/** Fades and lifts its children into place the first time they scroll into view. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
}: {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.9, ease: EASE_OUT, delay }}
    >
      {children}
    </motion.div>
  )
}

export function Eyebrow({ children, tone = 'dark' }: { children: ReactNode; tone?: 'dark' | 'light' }) {
  return (
    <p className={`inline-flex items-center gap-2 text-sm font-medium ${tone === 'dark' ? 'text-forest/70' : 'text-white/70'}`}>
      <span aria-hidden="true" className="size-1.5 rounded-full bg-orange" />
      {children}
    </p>
  )
}

export function SectionTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={`text-balance font-serif-display text-[clamp(38px,5.2vw,68px)] leading-[1] tracking-tight ${className}`}>
      {children}
    </h2>
  )
}

/** Image that drifts slightly slower than the page while it crosses the viewport. */
export function ParallaxImage({
  image,
  alt,
  sizes,
  className = '',
  imgClassName = '',
  strength = 8,
}: {
  image: Photo
  alt: string
  sizes: string
  className?: string
  imgClassName?: string
  strength?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const still = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [`-${strength}%`, `${strength}%`])

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.img
        src={image.src}
        srcSet={image.srcSet}
        sizes={sizes}
        width={image.width}
        height={image.height}
        alt={alt}
        loading="lazy"
        decoding="async"
        style={still ? undefined : { y, scale: 1 + (strength * 2.2) / 100 }}
        className={`h-full w-full object-cover ${imgClassName}`}
      />
    </div>
  )
}
