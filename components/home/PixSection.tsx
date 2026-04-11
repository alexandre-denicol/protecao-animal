import { PixCopyButton } from '@/components/ui/PixCopyButton'
import { buildWhatsAppUrl } from '@/lib/whatsapp'

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
    <section className="bg-primary-50 py-20">
      <div className="-mt-20 mb-20 h-1 w-full bg-gradient-to-r from-primary-300 via-primary-400 to-primary-300" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center lg:flex-row lg:items-center lg:justify-between lg:gap-16">
          <div className="mb-10 text-center lg:mb-0 lg:max-w-lg lg:text-left">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary-600">
              Faça a diferença
            </p>
            <h2 className="text-4xl font-extrabold tracking-tight text-neutral-800">
              Apoie nossa causa
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-neutral-600">
              Sua contribuição ajuda a manter alimentação, saúde e segurança para os animais acolhidos.
            </p>

            <ul className="mt-8 flex flex-col gap-3 text-left">
              {[
                'Ração e suplementos para os animais acolhidos',
                'Consultas, exames e acompanhamento veterinário',
                'Vacinas, medicamentos e cuidados preventivos',
                'Castrações e procedimentos necessários',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary-200">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                      <path d="M2 5L4 7L8 3" stroke="#7A4EA0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="text-sm text-neutral-600">{item}</span>
                </li>
              ))}
            </ul>

            {canais.length > 0 && (
              <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
                {canais.map((canal) => (
                  <a
                    key={canal.label}
                    href={canal.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex rounded-xl border border-primary-200 bg-white px-4 py-2 text-sm font-semibold text-primary-600 transition-colors hover:bg-primary-50 focus-visible:outline-2 focus-visible:outline-primary-300"
                  >
                    {canal.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="w-full max-w-sm lg:flex-shrink-0">
            <div className="rounded-3xl border border-primary-200 bg-white p-8 shadow-xl shadow-primary-100">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M7 11.5 12 6l5 5.5-5 5.5-5-5.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                  <path d="M4 8.5 7 5l3 3.5M14 8.5 17 5l3 3.5M4 15.5 7 19l3-3.5M14 15.5 17 19l3-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <h3 className="text-xl font-bold text-neutral-800">Doação via PIX</h3>
              <p className="mt-1 text-sm text-neutral-500">
                Transferência instantânea para apoiar os cuidados da associação.
              </p>

              <div className="mt-6 rounded-xl bg-primary-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">
                  Chave PIX
                </p>
                <p className="mt-1.5 break-all font-mono text-lg font-bold text-neutral-800">
                  {hasPix ? pixChave : 'Indisponível no momento'}
                </p>
              </div>

              {hasPix && (
                <div className="mt-4">
                  <PixCopyButton chavePix={pixChave} />
                </div>
              )}

              <p className="mt-5 text-center text-xs leading-relaxed text-neutral-400">
                100% dos recursos são destinados ao cuidado dos animais.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
