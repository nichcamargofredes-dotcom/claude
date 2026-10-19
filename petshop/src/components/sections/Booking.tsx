import { CalendarCheck, Check, House, Scissors, Stethoscope, type LucideIcon } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'
import { WHATSAPP } from '../../lib/contact'
import { scrollToTarget } from '../../lib/smooth-scroll'
import { Container, Eyebrow, Reveal, SectionTitle } from '../ui'

const SERVICES: { id: string; label: string; note: string; icon: LucideIcon }[] = [
  { id: 'Banho e tosa', label: 'Banho e tosa', note: 'A partir de R$ 90', icon: Scissors },
  { id: 'Consulta veterinária', label: 'Consulta', note: 'A partir de R$ 150', icon: Stethoscope },
  { id: 'Creche e hotel', label: 'Creche e hotel', note: 'A partir de R$ 80/dia', icon: House },
]

// Half-hour slots during opening hours.
const TIMES = Array.from({ length: 19 }, (_, i) => {
  const minutes = 9 * 60 + i * 30
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${minutes % 60 ? '30' : '00'}`
})

const today = () => {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 10)
}

const formatDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })

type Form = { service: string; name: string; phone: string; pet: string; date: string; time: string; notes: string }
type Errors = Partial<Record<keyof Form, string>>

function validate(f: Form): Errors {
  const e: Errors = {}
  if (!f.name.trim()) e.name = 'Digite o seu nome.'
  if (f.phone.replace(/\D/g, '').length < 10) e.phone = 'Digite um telefone com DDD, como (11) 91234-5678.'
  if (!f.pet.trim()) e.pet = 'Conte o nome do seu pet.'
  if (!f.date) e.date = 'Escolha uma data.'
  else if (f.date < today()) e.date = 'Escolha hoje ou uma data futura.'
  if (!f.time) e.time = 'Escolha um horário.'
  return e
}

const field =
  'w-full rounded-2xl border bg-white px-4 py-3.5 text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-forest'

export function Booking() {
  const id = useId()
  const [form, setForm] = useState<Form>({ service: SERVICES[0].id, name: '', phone: '', pet: '', date: '', time: '', notes: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [sent, setSent] = useState<Form | null>(null)

  const set = (key: keyof Form) => (value: string) => {
    setForm((f) => ({ ...f, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const message = (f: Form) =>
    [
      `Olá! Quero agendar ${f.service.toLowerCase()} na CozyPaws.`,
      `Tutor: ${f.name.trim()} · ${f.phone.trim()}`,
      `Pet: ${f.pet.trim()}`,
      `Quando: ${formatDate(f.date)}, às ${f.time}`,
      f.notes.trim() && `Observações: ${f.notes.trim()}`,
    ]
      .filter(Boolean)
      .join('\n')

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const found = validate(form)
    setErrors(found)
    if (Object.keys(found).length) {
      document.getElementById(`${id}-${Object.keys(found)[0]}`)?.focus()
      return
    }
    setSent(form)
    // The confirmation is shorter than the form: bring it into view.
    requestAnimationFrame(() => scrollToTarget('#agendar'))
  }

  const whatsappUrl = sent ? `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message(sent))}` : ''

  const input = (key: keyof Form, label: string, props: Record<string, string | boolean> = {}) => (
    <div>
      <label htmlFor={`${id}-${key}`} className="mb-2 block text-sm font-medium text-gray-800">
        {label}
      </label>
      <input
        id={`${id}-${key}`}
        value={form[key]}
        onChange={(e) => set(key)(e.target.value)}
        aria-invalid={!!errors[key]}
        aria-describedby={errors[key] ? `${id}-${key}-error` : undefined}
        className={`${field} ${errors[key] ? 'border-[#c2410c]' : 'border-forest/15'}`}
        {...props}
      />
      {errors[key] && (
        <p id={`${id}-${key}-error`} className="mt-1.5 text-sm font-medium text-[#9a3412]">
          {errors[key]}
        </p>
      )}
    </div>
  )

  return (
    <section id="agendar" aria-labelledby="booking-title" className="scroll-mt-20 py-24 md:py-32">
      <Container className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <Reveal>
          <Eyebrow>Agendamento</Eyebrow>
          <SectionTitle className="mt-4 text-forest">
            <span id="booking-title">Agende um horário para o seu pet</span>
          </SectionTitle>
          <p className="mt-5 max-w-md leading-relaxed text-gray-600">
            Escolha o serviço, o dia e o horário. A gente confirma pelo WhatsApp em até uma hora, dentro do horário da loja.
          </p>
          <ul className="mt-8 space-y-3 text-gray-700">
            {['Seg. a sáb. 9h–20h · Dom. 10h–18h', 'Rua das Palmeiras, 140 · Pinheiros, São Paulo', 'Pode remarcar sem custo até 2 horas antes'].map(
              (item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-sage text-forest">
                    <Check className="size-3.5" strokeWidth={3} />
                  </span>
                  {item}
                </li>
              ),
            )}
          </ul>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="rounded-[32px] bg-white p-5 shadow-[0_30px_80px_-40px_rgba(26,61,26,0.35)] sm:p-8">
            {sent ? (
              <div role="status" className="py-6 text-center">
                <span className="mx-auto grid size-14 place-items-center rounded-full bg-forest text-white">
                  <CalendarCheck className="size-7" />
                </span>
                <h3 className="mt-5 font-serif-display text-3xl text-forest">Quase lá, {sent.name.trim().split(' ')[0]}!</h3>
                <p className="mx-auto mt-3 max-w-sm leading-relaxed text-gray-600">
                  {sent.service} para {sent.pet.trim()} em {formatDate(sent.date)}, às {sent.time}. Envie a mensagem pelo WhatsApp para
                  a gente confirmar o horário.
                </p>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-orange px-7 py-3.5 font-semibold text-white transition-colors hover:bg-orange-hover"
                >
                  Enviar pelo WhatsApp
                </a>
                <button
                  type="button"
                  onClick={() => setSent(null)}
                  className="mt-4 block w-full text-sm font-medium text-forest underline-offset-4 hover:underline"
                >
                  Alterar dados do agendamento
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate className="space-y-5">
                <fieldset>
                  <legend className="mb-3 text-sm font-medium text-gray-800">Serviço</legend>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {SERVICES.map(({ id: value, label, note, icon: Icon }) => {
                      const active = form.service === value
                      return (
                        <label
                          key={value}
                          className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-3 transition-colors sm:flex-col sm:items-start ${active ? 'border-forest bg-sage/60' : 'border-forest/15 hover:border-forest/40'}`}
                        >
                          <input
                            type="radio"
                            name={`${id}-service`}
                            value={value}
                            checked={active}
                            onChange={() => set('service')(value)}
                            className="sr-only"
                          />
                          <span className={`grid size-9 shrink-0 place-items-center rounded-full ${active ? 'bg-forest text-white' : 'bg-sage text-forest'}`}>
                            <Icon className="size-4" strokeWidth={2} />
                          </span>
                          <span>
                            <span className="block font-semibold text-gray-900">{label}</span>
                            <span className="block text-xs text-gray-500">{note}</span>
                          </span>
                        </label>
                      )
                    })}
                  </div>
                </fieldset>

                <div className="grid gap-5 sm:grid-cols-2">
                  {input('name', 'Seu nome', { autoComplete: 'name', placeholder: 'Ana Souza' })}
                  {input('phone', 'Telefone (WhatsApp)', { type: 'tel', inputMode: 'tel', autoComplete: 'tel', placeholder: '(11) 91234-5678' })}
                  {input('pet', 'Nome do pet', { placeholder: 'Luna' })}
                  {input('date', 'Data', { type: 'date', min: today() })}
                </div>

                <div>
                  <label htmlFor={`${id}-time`} className="mb-2 block text-sm font-medium text-gray-800">
                    Horário
                  </label>
                  <select
                    id={`${id}-time`}
                    value={form.time}
                    onChange={(e) => set('time')(e.target.value)}
                    aria-invalid={!!errors.time}
                    aria-describedby={errors.time ? `${id}-time-error` : undefined}
                    className={`${field} ${errors.time ? 'border-[#c2410c]' : 'border-forest/15'} ${form.time ? '' : 'text-gray-400'}`}
                  >
                    <option value="">Escolha um horário</option>
                    {TIMES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  {errors.time && (
                    <p id={`${id}-time-error`} className="mt-1.5 text-sm font-medium text-[#9a3412]">
                      {errors.time}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor={`${id}-notes`} className="mb-2 block text-sm font-medium text-gray-800">
                    Observações <span className="font-normal text-gray-500">(opcional)</span>
                  </label>
                  <textarea
                    id={`${id}-notes`}
                    rows={3}
                    value={form.notes}
                    onChange={(e) => set('notes')(e.target.value)}
                    placeholder="Raça, porte, se tem medo de secador…"
                    className={`${field} resize-none border-forest/15`}
                  />
                </div>

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-forest px-6 py-4 font-semibold text-white transition-colors hover:bg-forest-hover"
                >
                  <CalendarCheck className="size-5" />
                  Agendar horário
                </button>
              </form>
            )}
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
