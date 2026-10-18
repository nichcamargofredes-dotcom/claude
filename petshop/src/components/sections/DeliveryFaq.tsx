import { Clock, CreditCard, Plus, RotateCcw, Truck, type LucideIcon } from 'lucide-react'
import { useId, useState } from 'react'
import { Container, Eyebrow, Reveal, SectionTitle } from '../ui'

const FACTS: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Truck, title: 'Free delivery over $49', text: 'A flat $4.90 below that, anywhere in the city.' },
  { icon: Clock, title: 'Same day before 2 pm', text: 'Later orders arrive by noon the next day.' },
  { icon: CreditCard, title: 'Pay your way', text: 'Cards, Apple Pay, Google Pay, PayPal or cash on pickup.' },
  { icon: RotateCcw, title: '30-day happy returns', text: 'Unopened food and any toy your pet ignores.' },
]

const FAQ = [
  {
    q: 'How fast is delivery?',
    a: 'Inside the city, orders placed before 2 pm arrive the same day between 4 and 9 pm. Everywhere else takes 1–3 business days, always with tracking.',
  },
  {
    q: 'Can I pick up in store?',
    a: 'Yes. Choose “Pickup” at checkout and your order will be ready within the hour at 14 Willow Street.',
  },
  {
    q: 'Which payment methods do you accept?',
    a: 'All major cards, Apple Pay, Google Pay and PayPal. Payments are encrypted and we never store your card details.',
  },
  {
    q: 'Do you offer auto-delivery for food?',
    a: 'Subscribe to any food or litter and save 10% on every order. Skip, pause or cancel anytime from your account.',
  },
  {
    q: 'What if my pet doesn’t like it?',
    a: 'Return unopened food or any toy within 30 days for a full refund. If an opened bag is a miss, we’ll swap it for another recipe once.',
  },
]

function FaqItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  const id = useId()
  return (
    <div className="border-b border-forest/10">
      <h3>
        <button
          type="button"
          id={`${id}-q`}
          aria-expanded={open}
          aria-controls={`${id}-a`}
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-6 py-6 text-left text-lg font-medium text-gray-900 transition-colors hover:text-forest"
        >
          {q}
          <span
            className={`grid size-9 shrink-0 place-items-center rounded-full border transition duration-300 ${open ? 'rotate-45 border-forest bg-forest text-white' : 'border-forest/20 text-forest'}`}
          >
            <Plus className="size-4" strokeWidth={2.25} />
          </span>
        </button>
      </h3>
      <div
        id={`${id}-a`}
        role="region"
        aria-labelledby={`${id}-q`}
        className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="overflow-hidden" inert={!open}>
          <p className="max-w-xl pb-6 leading-relaxed text-gray-600">{a}</p>
        </div>
      </div>
    </div>
  )
}

export function DeliveryFaq() {
  const [open, setOpen] = useState(0)

  return (
    <section id="delivery" aria-labelledby="delivery-title" className="scroll-mt-20 bg-mist py-24 md:py-32">
      <Container className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div>
          <Reveal>
            <Eyebrow>Delivery and payment</Eyebrow>
            <SectionTitle className="mt-4 text-forest">
              <span id="delivery-title">Simple, fast and free over $49</span>
            </SectionTitle>
          </Reveal>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {FACTS.map(({ icon: Icon, title, text }, i) => (
              <li key={title}>
                <Reveal delay={i * 0.06} className="h-full rounded-[24px] bg-white p-5">
                  <span className="grid size-11 place-items-center rounded-full bg-sage text-forest">
                    <Icon className="size-5" strokeWidth={1.75} />
                  </span>
                  <p className="mt-4 font-semibold text-gray-900">{title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-gray-600">{text}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>

        <Reveal delay={0.1} className="lg:pt-2">
          <div className="border-t border-forest/10">
            {FAQ.map((item, i) => (
              <FaqItem key={item.q} q={item.q} a={item.a} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
