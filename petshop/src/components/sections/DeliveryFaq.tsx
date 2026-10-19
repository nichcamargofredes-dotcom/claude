import { Clock, CreditCard, Plus, RotateCcw, Truck, type LucideIcon } from 'lucide-react'
import { useId, useState } from 'react'
import { Container, Eyebrow, Reveal, SectionTitle } from '../ui'

const FACTS: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Truck, title: 'Frete grátis acima de R$ 199', text: 'Abaixo disso, taxa fixa de R$ 14,90 em toda a cidade.' },
  { icon: Clock, title: 'No mesmo dia até as 14h', text: 'Pedidos depois disso chegam até o meio-dia seguinte.' },
  { icon: CreditCard, title: 'Pague como preferir', text: 'Pix, cartão de crédito ou débito, ou dinheiro na retirada.' },
  { icon: RotateCcw, title: 'Troca fácil em 30 dias', text: 'Ração fechada e qualquer brinquedo que o seu pet ignorar.' },
]

const FAQ = [
  {
    q: 'Como faço um pedido?',
    a: 'Pelo WhatsApp, por telefone ou direto na loja. A gente confirma o estoque, combina a entrega e envia o link de pagamento.',
  },
  {
    q: 'Em quanto tempo chega?',
    a: 'Na cidade, pedidos feitos até as 14h chegam no mesmo dia, entre 16h e 21h. Para outras regiões, de 1 a 3 dias úteis, sempre com rastreio.',
  },
  {
    q: 'Quais formas de pagamento vocês aceitam?',
    a: 'Pix, cartões de crédito e débito das principais bandeiras (parcelamos em até 3x sem juros) e dinheiro na retirada.',
  },
  {
    q: 'Posso retirar na loja?',
    a: 'Pode. Avise pelo WhatsApp e o pedido fica separado em até uma hora na Rua das Palmeiras, 140.',
  },
  {
    q: 'E se o meu pet não gostar?',
    a: 'Ração fechada e brinquedos podem ser trocados em até 30 dias. Se um pacote aberto não agradar, trocamos uma vez por outro sabor.',
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
            <Eyebrow>Entrega e pagamento</Eyebrow>
            <SectionTitle className="mt-4 text-forest">
              <span id="delivery-title">Simples, rápido e grátis acima de R$ 199</span>
            </SectionTitle>
          </Reveal>
          <ul className="mt-10 grid grid-cols-2 gap-3 sm:gap-4">
            {FACTS.map(({ icon: Icon, title, text }, i) => (
              <li key={title}>
                <Reveal delay={i * 0.06} className="h-full rounded-[24px] bg-white p-4 sm:p-5">
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
