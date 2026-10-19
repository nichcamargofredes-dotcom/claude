import { Menu, Search } from 'lucide-react'
import { heroAssets } from '../lib/assets'
import { NAV_LINKS } from '../lib/nav'

export function Header({ onOpenMenu }: { onOpenMenu: () => void }) {
  return (
    <header className="relative z-30 flex shrink-0 items-center justify-between gap-4 px-4 py-4 sm:px-6 md:px-8 lg:px-12">
      <a href="#top" className="shrink-0 animate-fade-in delay-100" aria-label="CozyPaws, voltar ao início">
        <img
          src={heroAssets.logo}
          alt="CozyPaws"
          width={205}
          height={52}
          className="block h-[33px] w-[130px] lg:h-[52px] lg:w-[205px]"
        />
      </a>

      <nav aria-label="Principal" className="hidden animate-fade-in delay-200 md:block">
        <ul className="flex items-center gap-5 text-sm font-medium lg:gap-8">
          {NAV_LINKS.map((link, i) => (
            <li key={link.href}>
              <a
                href={link.href}
                aria-current={i === 0 ? 'page' : undefined}
                className={`whitespace-nowrap py-2 transition-colors ${i === 0 ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex shrink-0 animate-fade-in items-center gap-2 delay-300">
        <button
          type="button"
          aria-label="Buscar produtos"
          className="hidden h-10 w-10 place-items-center rounded-full border border-gray-300 text-gray-800 transition-colors hover:border-forest hover:text-forest sm:grid"
        >
          <Search size={18} strokeWidth={2} />
        </button>
        <img
          src={heroAssets.avatar}
          alt="Seu perfil"
          width={40}
          height={40}
          className="h-10 w-10 rounded-full object-cover"
        />
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Abrir menu"
          className="ml-1 grid h-10 w-10 place-items-center rounded-full bg-forest text-white transition-colors hover:bg-forest-hover md:hidden"
        >
          <Menu size={18} />
        </button>
      </div>
    </header>
  )
}
