import Link from 'next/link'
import Image from 'next/image'
import { ExternalLink } from './ExternalLink'
import { PixCopyButton } from './ui/PixCopyButton'

const PIX_CNPJ = '49728609000170'

const linksInstitucionais = [
  { href: '/sobre', label: 'Sobre a Associação' },
  { href: '/animais', label: 'Animais para adoção' },
  { href: '/adocoes', label: 'Histórias de adoção' },
  { href: '/contato', label: 'Contato' },
]

const redesSociais = [
  {
    href: 'https://instagram.com/amigamiau',
    label: 'Instagram',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    href: 'https://facebook.com/amigamiau',
    label: 'Facebook',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73478 14.1054 6.48043 14.2929 6.29289C14.4804 6.10536 14.7348 6 15 6H18V2Z"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        />
      </svg>
    ),
  },
]

export default function Footer() {
  const anoAtual = new Date().getFullYear()

  return (
    <footer className="border-t border-neutral-200 bg-neutral-100">
      {/* Seção principal */}
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Identidade */}
          <div className="lg:col-span-2">
            <Link
              href="/"
              className="mb-4 inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-primary-300"
              aria-label="Associação Amiga Miau — Página inicial"
            >
              <div className="relative h-10 w-10 flex-shrink-0">
                <Image src="/logo.svg" alt="Logo Amiga Miau" fill className="object-contain" />
              </div>
              <span className="text-lg font-bold text-neutral-800">Amiga Miau</span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-neutral-500">
              Associação sem fins lucrativos dedicada a resgatar, cuidar e encontrar
              lares amorosos para animais de rua.
            </p>

            {/* Redes sociais */}
            <div className="mt-5 flex items-center gap-3">
              {redesSociais.map((rede) => (
                <ExternalLink
                  key={rede.href}
                  href={rede.href}
                  aria-label={rede.label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-white hover:text-primary-500 focus-visible:outline-2 focus-visible:outline-primary-300"
                >
                  {rede.icon}
                </ExternalLink>
              ))}
            </div>
          </div>

          {/* Links institucionais */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-neutral-400">
              Navegação
            </h3>
            <ul className="flex flex-col gap-2.5">
              {linksInstitucionais.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-500 transition-colors hover:text-primary-500 focus-visible:outline-2 focus-visible:outline-primary-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Doação PIX */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-neutral-400">
              Faça uma doação
            </h3>
            <div className="rounded-xl border border-primary-200 bg-primary-50 p-4">
              <p className="mb-1 text-xs font-medium text-primary-600">Chave PIX (CNPJ)</p>
              <p className="mb-3 break-all font-mono text-sm font-semibold text-neutral-700">
                {PIX_CNPJ}
              </p>
              <PixCopyButton chavePix={PIX_CNPJ} />
            </div>
            <p className="mt-3 text-xs text-neutral-400">
              Sua doação vai direto para ração, vacinas e cuidados veterinários.
            </p>
          </div>
        </div>
      </div>

      {/* Rodapé inferior */}
      <div className="border-t border-neutral-200">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-neutral-400 sm:flex-row sm:px-6 lg:px-8">
          <p>© {anoAtual} Associação Amiga Miau. CNPJ 49.728.609/0001-70</p>
          <p>Feito com amor por quem ama os animais 🐾</p>
        </div>
      </div>
    </footer>
  )
}
