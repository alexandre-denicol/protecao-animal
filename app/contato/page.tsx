import type { Metadata } from 'next'
import BrandLogo from '@/components/BrandLogo'
import { getPublicSiteSettings } from '@/lib/site-settings'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import ContactForm from './ContactForm'

export const metadata: Metadata = {
  title: 'Contato',
  description: 'Fale com a Associação Amiga Miau.',
}

function cleanUrl(url: string): string {
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

export default async function ContatoPage() {
  const settings = await getPublicSiteSettings()
  const whatsappUrl = buildWhatsAppUrl(
    settings.whatsapp_numero,
    'Olá! Gostaria de falar com a Associação Amiga MiAu.',
  )
  const canais = [
    whatsappUrl ? { label: 'WhatsApp', href: whatsappUrl } : null,
    cleanUrl(settings.instagram_url)
      ? { label: 'Instagram', href: cleanUrl(settings.instagram_url) }
      : null,
    cleanUrl(settings.facebook_url)
      ? { label: 'Facebook', href: cleanUrl(settings.facebook_url) }
      : null,
  ].filter((item): item is { label: string; href: string } => item !== null)

  return (
    <div className="bg-[var(--color-bg)]">
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[minmax(0,0.92fr)_minmax(360px,0.8fr)] lg:gap-10 lg:px-8">
        <div>
          <BrandLogo compact className="mb-8" />
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-primary)]">
            Contato institucional
          </p>
          <h1 className="mt-3 max-w-[14ch] text-4xl font-extrabold tracking-tight text-[var(--color-text-main)] sm:text-5xl">
            Fale com a equipe da Associação Amiga MiAu
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--color-text-muted)]">
            Tire dúvidas, envie uma mensagem institucional ou fale com a equipe sobre
            adoção, apoio e parcerias.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[var(--radius-card)] border border-white/10 bg-[rgba(17,24,39,0.78)] p-5 shadow-[var(--shadow-soft)]">
              <p className="text-sm font-semibold text-[var(--color-primary)]">Atendimento humano</p>
              <p className="mt-2 text-sm leading-7 text-[var(--color-text-muted)]">
                Sua mensagem chega para a equipe e recebe o encaminhamento adequado.
              </p>
            </div>
            <div className="rounded-[var(--radius-card)] border border-white/10 bg-[rgba(17,24,39,0.78)] p-5 shadow-[var(--shadow-soft)]">
              <p className="text-sm font-semibold text-[#8de3dd]">Canais oficiais</p>
              <p className="mt-2 text-sm leading-7 text-[var(--color-text-muted)]">
                Use este formulário para conversas mais estruturadas e acompanhadas.
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-[var(--radius-card)] border border-white/10 bg-[rgba(17,24,39,0.78)] p-5 shadow-[var(--shadow-soft)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
              Canais e apoio
            </p>

            {settings.pix_chave.trim() && (
              <div className="mt-4 rounded-[var(--radius-button)] border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                  PIX
                </p>
                <p className="mt-2 break-all font-mono text-sm font-semibold text-[var(--color-text-main)]">
                  {settings.pix_chave}
                </p>
              </div>
            )}

            {canais.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {canais.map((canal) => (
                  <a
                    key={canal.href}
                    href={canal.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-[var(--radius-button)] border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-[var(--color-text-main)] transition duration-200 hover:border-[rgba(244,184,96,0.24)] hover:text-[var(--color-primary)]"
                  >
                    {canal.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:pl-2">
          <ContactForm />
        </div>
      </section>
    </div>
  )
}
