import { PixCopyButton } from '@/components/ui/PixCopyButton'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import SectionHeading from '@/components/public/SectionHeading'

interface PixSectionProps {
  pixChave: string
  instagramUrl: string
  facebookUrl: string
  whatsappNumero: string
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

export default function PixSection({
  pixChave,
  instagramUrl,
  facebookUrl,
  whatsappNumero,
}: PixSectionProps) {
  const hasPix = Boolean(pixChave.trim())
  const whatsappUrl = buildWhatsAppUrl(
    whatsappNumero,
    'Olá! Gostaria de falar com a Amiga Miau.',
  )
  const canais = [
    cleanUrl(instagramUrl) ? { label: 'Instagram', href: cleanUrl(instagramUrl) } : null,
    cleanUrl(facebookUrl) ? { label: 'Facebook', href: cleanUrl(facebookUrl) } : null,
    whatsappUrl ? { label: 'WhatsApp', href: whatsappUrl } : null,
  ].filter((canal): canal is { label: string; href: string } => canal !== null)

  return (
    <section className="bg-[var(--color-bg)] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
          <div className="text-center lg:max-w-[34rem] lg:text-left">
            <SectionHeading
              eyebrow="Faça a diferença"
              title="Apoie a causa com rapidez e confiança"
              description="Sua contribuição ajuda a manter alimentação, saúde, resgates e todo o cuidado contínuo dos animais acolhidos."
            />

            <ul className="mt-6 flex flex-col gap-3 text-left sm:mt-8">
              {[
                'Ração e suplementos para os animais acolhidos',
                'Consultas, exames e acompanhamento veterinário',
                'Vacinas, medicamentos e cuidados preventivos',
                'Castrações e procedimentos necessários',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[rgba(244,184,96,0.16)]">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                      <path d="M2 5L4 7L8 3" stroke="#F4B860" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="text-sm leading-6 text-[var(--color-text-muted)]">{item}</span>
                </li>
              ))}
            </ul>

            {canais.length > 0 && (
              <div className="mt-6 flex flex-wrap justify-center gap-3 sm:mt-8 lg:justify-start">
                {canais.map((canal) => (
                  <a
                    key={canal.label}
                    href={canal.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex rounded-[var(--radius-button)] border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-[var(--color-text-main)] transition duration-200 hover:border-[rgba(244,184,96,0.24)] hover:text-[var(--color-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]"
                  >
                    {canal.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="w-full max-w-sm lg:flex-shrink-0">
            <div className="rounded-[28px] border border-white/10 bg-[rgba(17,24,39,0.82)] p-6 shadow-[var(--shadow-soft)] sm:p-8">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[rgba(244,184,96,0.18)] bg-[rgba(244,184,96,0.12)] text-[var(--color-primary)]">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M7 11.5 12 6l5 5.5-5 5.5-5-5.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                  <path d="M4 8.5 7 5l3 3.5M14 8.5 17 5l3 3.5M4 15.5 7 19l3-3.5M14 15.5 17 19l3-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <h3 className="text-xl font-bold text-[var(--color-text-main)]">Doação via PIX</h3>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                Transferência instantânea para apoiar os cuidados da associação.
              </p>

              <div className="mt-6 rounded-[var(--radius-card)] border border-white/10 bg-[rgba(255,255,255,0.04)] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-primary)]">
                  Chave PIX
                </p>
                <p className="mt-1.5 break-all font-mono text-lg font-bold text-[var(--color-text-main)]">
                  {hasPix ? pixChave : 'Indisponível no momento'}
                </p>
              </div>

              {hasPix && (
                <div className="mt-4">
                  <PixCopyButton chavePix={pixChave} />
                </div>
              )}

              <p className="mt-5 text-center text-xs leading-relaxed text-[var(--color-text-muted)]">
                100% dos recursos são destinados ao cuidado dos animais.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
