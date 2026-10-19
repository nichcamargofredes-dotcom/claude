import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { heroAssets } from '../../lib/assets'
import { Container } from '../ui'

const COLUMNS = [
  { title: 'Loja', links: [['Cães', '#shop'], ['Gatos', '#shop'], ['Pássaros', '#shop'], ['Peixes', '#shop'], ['Pequenos pets', '#shop']] },
  { title: 'Ajuda', links: [['Entrega e pagamento', '#delivery'], ['Trocas', '#delivery'], ['Perguntas frequentes', '#delivery'], ['Avaliações', '#reviews']] },
  { title: 'Empresa', links: [['Serviços', '#services'], ['Marcas', '#brands'], ['Mais vendidos', '#bestsellers'], ['Galeria', '#gallery']] },
] as const

const SOCIAL = ['Instagram', 'TikTok', 'YouTube', 'Pinterest']

export function Footer() {
  const ref = useRef<HTMLDivElement>(null)
  const still = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] })
  const y = useTransform(scrollYProgress, [0, 1], ['45%', '0%'])

  return (
    <footer className="overflow-hidden border-t border-forest/10 pt-16 md:pt-20">
      <Container>
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-[1.3fr_repeat(3,0.7fr)_1fr]">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <img src={heroAssets.logo} alt="CozyPaws" width={164} height={42} loading="lazy" className="h-[42px] w-[164px]" />
            <p className="mt-5 max-w-xs leading-relaxed text-gray-600">
              Pet shop de bairro com ração, brinquedos, banho e tosa e cuidados, desde 2016.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {SOCIAL.map((name) => (
                <li key={name}>
                  <a
                    href="#top"
                    className="inline-block rounded-full border border-forest/15 px-4 py-2 text-sm font-medium text-forest transition-colors hover:border-forest hover:bg-forest hover:text-white"
                  >
                    {name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="font-semibold text-gray-900">{col.title}</p>
              <ul className="mt-4 space-y-3">
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <a href={href} className="text-gray-600 transition-colors hover:text-forest">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <address id="contact" className="scroll-mt-24 not-italic">
            <p className="font-semibold text-gray-900">Visite a loja</p>
            <p className="mt-4 leading-relaxed text-gray-600">
              Rua das Palmeiras, 140
              <br />
              Pinheiros, São Paulo · SP
            </p>
            <p className="mt-3 leading-relaxed text-gray-600">
              Seg. a sáb. 9h–20h
              <br />
              Dom. 10h–18h
            </p>
            <p className="mt-3 space-y-1">
              <a href="mailto:contato@cozypaws.com.br" className="block font-medium text-forest hover:underline">
                contato@cozypaws.com.br
              </a>
              <a href="tel:+5511912345678" className="block font-medium text-forest hover:underline">
                (11) 91234-5678
              </a>
            </p>
          </address>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-forest/10 py-6 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 CozyPaws. Todos os direitos reservados.</p>
          <p className="flex gap-5">
            <a href="#top" className="hover:text-forest">
              Privacidade
            </a>
            <a href="#top" className="hover:text-forest">
              Termos
            </a>
            <a href="#top" className="hover:text-forest">
              Cookies
            </a>
          </p>
        </div>
      </Container>

      <div ref={ref} aria-hidden="true" className="select-none overflow-hidden">
        <motion.p
          style={still ? undefined : { y }}
          className="whitespace-nowrap text-center font-serif-display text-[23.5vw] leading-[0.78] tracking-tight text-forest"
        >
          CozyPaws
        </motion.p>
      </div>
    </footer>
  )
}
