import { Plus } from 'lucide-react'
import { useId, useState } from 'react'
import { Container, Eyebrow, Reveal, SectionTitle } from '../ui'

const FAQ = [
  {
    q: 'Qual o horário da loja?',
    a: 'De segunda a sábado, das 9h às 20h, e aos domingos das 10h às 18h. O banho e tosa abre às 8h para quem quiser deixar o pet antes do trabalho.',
  },
  {
    q: 'Preciso agendar o banho e tosa?',
    a: 'Recomendamos, principalmente aos fins de semana. Dá para marcar pelo WhatsApp ou na recepção, e avisamos quando o seu pet estiver pronto.',
  },
  {
    q: 'Quais vacinas a creche e o hotel exigem?',
    a: 'Para cães, V8 ou V10, antirrábica e gripe canina em dia. Para gatos, quádrupla ou quíntupla e antirrábica. Pedimos a carteirinha na primeira visita.',
  },
  {
    q: 'Vocês atendem pets de todos os portes?',
    a: 'Sim. Temos mesas e banheiras para pets pequenos, médios e grandes, e um horário mais tranquilo para quem fica nervoso com barulho.',
  },
  {
    q: 'Posso levar meu pet para conhecer a loja?',
    a: 'Claro! Pets são bem-vindos na guia ou na caixa de transporte, e sempre tem petisco no balcão.',
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

export function Faq() {
  const [open, setOpen] = useState(0)

  return (
    <section id="faq" aria-labelledby="faq-title" className="scroll-mt-20 bg-mist py-24 md:py-32">
      <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <Reveal>
          <Eyebrow>Dúvidas</Eyebrow>
          <SectionTitle className="mt-4 text-forest">
            <span id="faq-title">Perguntas frequentes</span>
          </SectionTitle>
          <p className="mt-5 max-w-sm leading-relaxed text-gray-600">
            Não achou o que procurava? Passe na loja ou ligue para (11) 91234-5678.
          </p>
        </Reveal>

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
