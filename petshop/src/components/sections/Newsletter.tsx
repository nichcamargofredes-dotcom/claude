import { ArrowRight, Check } from 'lucide-react'
import { motion, useScroll, useTransform } from 'motion/react'
import { useId, useRef, useState, type FormEvent } from 'react'
import { figmaSrcSet, heroAssets, heroSizes } from '../../lib/assets'
import { Container, Reveal } from '../ui'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function Newsletter() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 0.45'] })
  // The dachshund climbs up from behind the panel edge as it scrolls into view.
  const y = useTransform(scrollYProgress, [0, 1], ['72%', '0%'])

  const id = useId()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'error' | 'done'>('idle')

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    setStatus(EMAIL.test(email.trim()) ? 'done' : 'error')
  }

  return (
    <section aria-labelledby="newsletter-title" className="pb-24 pt-44 md:pb-32 md:pt-56">
      <Container>
        <div
          ref={ref}
          className="relative rounded-[40px] bg-leaf px-6 pb-12 pt-20 text-center [--dw:min(360px,72vw)] sm:px-12 md:pb-16 md:pt-24"
        >
          {/* Only the part above the panel edge is shown; the photo's own wall is the same colour as the panel. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-[calc(var(--dw)*-0.4389)] h-[calc(var(--dw)*0.4989)] w-[var(--dw)] -translate-x-1/2 overflow-hidden"
          >
            <motion.img
              src={heroAssets.bottomLeft}
              srcSet={figmaSrcSet(heroAssets.bottomLeft, [440, 870])}
              sizes="360px"
              width={heroSizes.bottomLeft.width}
              height={heroSizes.bottomLeft.height}
              alt=""
              loading="lazy"
              style={{ y }}
              className="block w-full"
            />
          </div>

          <Reveal className="relative mx-auto max-w-2xl">
            <h2 id="newsletter-title" className="text-balance font-serif-display text-[clamp(36px,5vw,64px)] leading-[1] tracking-tight text-forest">
              Get 15% off your first order
            </h2>
            <p className="mx-auto mt-5 max-w-lg leading-relaxed text-forest/80">
              Join 40,000 pet parents for new arrivals, care tips and member-only offers. One email a week, never spam.
            </p>

            {status === 'done' ? (
              <p role="status" className="mx-auto mt-9 inline-flex items-center gap-3 rounded-full bg-white px-6 py-4 font-medium text-forest">
                <span className="grid size-7 place-items-center rounded-full bg-forest text-white">
                  <Check className="size-4" strokeWidth={2.5} />
                </span>
                You’re in! Your code is on its way to {email.trim()}.
              </p>
            ) : (
              <form onSubmit={onSubmit} noValidate className="mx-auto mt-9 max-w-lg text-left">
                <label htmlFor={`${id}-email`} className="mb-2 block pl-5 text-sm font-medium text-forest">
                  Email address
                </label>
                <div className="flex flex-col gap-3 sm:flex-row sm:rounded-full sm:bg-white sm:p-1.5">
                  <input
                    id={`${id}-email`}
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (status === 'error') setStatus('idle')
                    }}
                    aria-invalid={status === 'error'}
                    aria-describedby={status === 'error' ? `${id}-error` : undefined}
                    className="min-w-0 flex-1 rounded-full bg-white px-5 py-3.5 text-gray-900 outline-none placeholder:text-gray-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange sm:bg-transparent sm:focus-visible:outline-offset-0"
                  />
                  <button
                    type="submit"
                    className="group inline-flex items-center justify-center gap-2 rounded-full bg-orange px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-orange-hover"
                  >
                    Get my 15% off
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
                {status === 'error' && (
                  <p id={`${id}-error`} role="alert" className="mt-2 pl-5 text-sm font-medium text-[#9a3412]">
                    Please enter a valid email, like name@example.com.
                  </p>
                )}
                <p className="mt-4 pl-5 text-xs text-forest/70">You can unsubscribe at any time.</p>
              </form>
            )}
          </Reveal>
        </div>
      </Container>
    </section>
  )
}
