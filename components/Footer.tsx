import Link from 'next/link'
import Image from 'next/image'
import { getPublicSiteSettings } from '@/lib/site-settings'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import { ExternalLink } from './ExternalLink'

const linksNavegacao = [
  { href: '/', label: 'Home' },
  { href: '/animais', label: 'Animais para adoção' },
  { href: '/socios', label: 'Quero ser sócio' },
  { href: '/adocoes', label: 'Histórias de adoção' },
  { href: '/sobre', label: 'Sobre a Associação' },
  { href: '/contato', label: 'Contato' },
]

const linksEquipe = [
  { href: '/admin/login', label: 'Área da equipe' },
]

function cleanExternalUrl(url: string): string {
  const trimmed = url.trim()

  if (!trimmed) return ''

  try {
    const parsed = new URL(trimmed)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
      ? parsed.toString()
      : ''
  } catch {
    return ''
  }
}

function redesSociais({
  instagramUrl,
  facebookUrl,
  whatsappUrl,
}: {
  instagramUrl: string
  facebookUrl: string
  whatsappUrl: string | null
}) {
  return [
    instagramUrl
      ? {
          href: instagramUrl,
          label: 'Instagram',
          icone: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2" />
              <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
            </svg>
          ),
        }
      : null,
    facebookUrl
      ? {
          href: facebookUrl,
          label: 'Facebook',
          icone: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M18 2H15C13.67 2 12.4 2.53 11.46 3.46C10.53 4.4 10 5.67 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73 14.1 6.48 14.29 6.29C14.48 6.1 14.73 6 15 6H18V2Z"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
          ),
        }
      : null,
    whatsappUrl
      ? {
          href: whatsappUrl,
          label: 'WhatsApp',
          icone: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ),
        }
      : null,
  ].filter((rede): rede is NonNullable<typeof rede> => rede !== null)
}

export default async function Footer() {
  const anoAtual = new Date().getFullYear()
  const settings = await getPublicSiteSettings()
  const whatsappUrl = buildWhatsAppUrl(
    settings.whatsapp_numero,
    'Olá! Gostaria de falar com a Amiga Miau.',
  )
  const redes = redesSociais({
    instagramUrl: cleanExternalUrl(settings.instagram_url),
    facebookUrl: cleanExternalUrl(settings.facebook_url),
    whatsappUrl,
  })
  const footerText =
    settings.missao.trim() ||
    'Associação sem fins lucrativos dedicada a proteger animais e encontrar lares responsáveis.'
  const pixChave = settings.pix_chave.trim()

  return (
    <footer className="bg-neutral-800">
      {/* Corpo principal */}
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Identidade — col larga */}
          <div className="sm:col-span-2 lg:col-span-2">
            <Link
              href="/"
              className="mb-5 inline-flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-primary-300"
              aria-label="Associação Amiga Miau — Página inicial"
            >
              <div className="relative h-10 w-10 flex-shrink-0">
                <Image src="/logo.svg" alt="Logo Amiga Miau" fill className="object-contain" />
              </div>
              <span className="text-lg font-bold text-white">Amiga Miau</span>
            </Link>

            <p className="max-w-xs text-sm leading-relaxed text-white/50">
              {footerText}
            </p>

            {/* Redes sociais */}
            {redes.length > 0 && (
              <div className="mt-6 flex items-center gap-2">
                {redes.map((rede) => (
                  <ExternalLink
                    key={rede.href}
                    href={rede.href}
                    aria-label={rede.label}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-primary-300"
                  >
                    {rede.icone}
                  </ExternalLink>
                ))}
              </div>
            )}
          </div>

          {/* Links de navegação */}
          <div>
            <h3 className="mb-5 text-xs font-semibold uppercase tracking-widest text-white/30">
              Navegação
            </h3>
            <ul className="flex flex-col gap-3">
              {linksNavegacao.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-primary-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-5 text-xs font-semibold uppercase tracking-widest text-white/30">
              Apoio
            </h3>
            {pixChave ? (
              <>
                <p className="mb-2 text-xs text-white/40">Chave PIX</p>
                <p className="break-all font-mono text-sm font-semibold text-primary-300">
                  {pixChave}
                </p>
              </>
            ) : (
              <p className="text-sm leading-relaxed text-white/40">
                As informações de doação serão atualizadas em breve.
              </p>
            )}
            <p className="mt-3 text-xs leading-relaxed text-white/30">
              100% destinado ao cuidado dos animais resgatados.
            </p>
            <ul className="mt-5 flex flex-col gap-2">
              {linksEquipe.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs font-semibold text-white/40 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-primary-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Barra inferior */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-white/30 sm:flex-row sm:px-6 lg:px-8">
          <p>© {anoAtual} Associação Amiga Miau</p>
          <p>Cuidado, adoção responsável e comunidade.</p>
        </div>
      </div>
    </footer>
  )
}
