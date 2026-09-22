import Link from 'next/link'
import { PixCopyButton } from '@/components/ui/PixCopyButton'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import SectionHeading from '@/components/public/SectionHeading'

interface PixSectionProps {
  pixChave: string
  instagramUrl: string
  facebookUrl: string
  whatsappNumero: string
}

const destinosDaAjuda = [
  'Ração e suplementos para os animais acolhidos',
  'Consultas, exames e acompanhamento veterinário',
  'Vacinas, medicamentos e cuidados preventivos',
  'Castrações e procedimentos necessários',
]

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

function DoacaoPix({ pixChave }: { pixChave: string }) {
  const hasPix = Boolean(pixChave.trim())

  return (
    <div>
      <h3 className="font-display tracking-[-0.01em] text-xl font-bold text-[var(--color-text-main)]">Doar via PIX</h3>
      <p className="mt-2 max-w-[44ch] text-base leading-7 text-[var(--color-text-soft)]">
        Transferência instantânea para apoiar os cuidados da associação.
      </p>

      {hasPix ? (
        <div className="mt-5 max-w-sm">
          <p className="text-sm font-semibold text-[var(--color-primary)]">Chave PIX</p>
          <p className="mt-1.5 break-all rounded-[var(--radius-button)] bg-white/5 px-4 py-3 font-mono text-lg font-bold text-[var(--color-text-main)]">
            {pixChave}
          </p>
          <div className="mt-3">
            <PixCopyButton chavePix={pixChave} />
          </div>
          <p className="mt-4 text-sm leading-6 text-[var(--color-text-muted)]">
            100% dos recursos são destinados ao cuidado dos animais.
          </p>
        </div>
      ) : (
        <p className="mt-5 text-sm leading-6 text-[var(--color-text-muted)]">
          As informações de doação serão atualizadas em breve.
        </p>
      )}
    </div>
  )
}

function SerSocio() {
  return (
    <div className="lg:border-l lg:border-white/10 lg:pl-10">
      <h3 className="font-display tracking-[-0.01em] text-xl font-bold text-[var(--color-text-main)]">Ser sócio</h3>
      <p className="mt-2 max-w-[44ch] text-base leading-7 text-[var(--color-text-soft)]">
        Contribua todo mês. Você envia seus dados e a equipe entra em contato para combinar os detalhes.
      </p>
      <Link
        href="/socios"
        className="mt-5 inline-flex items-center justify-center rounded-[var(--radius-button)] border border-[rgba(113,211,205,0.5)] px-6 py-3 text-sm font-bold text-[#8de3dd] transition duration-200 hover:bg-[rgba(31,111,107,0.16)]"
      >
        Quero ser sócio
      </Link>
    </div>
  )
}

export default function PixSection({
  pixChave,
  instagramUrl,
  facebookUrl,
  whatsappNumero,
}: PixSectionProps) {
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
    <section
      id="apoio"
      aria-labelledby="apoio-titulo"
      className="scroll-mt-24 bg-white/[0.025] py-10 sm:py-14"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="apoio-titulo"
          eyebrow="Faça a diferença"
          title="Como você pode ajudar"
          description="Sua contribuição ajuda a manter alimentação, saúde, resgates e todo o cuidado contínuo dos animais acolhidos."
        />

        <ul className="mt-6 grid max-w-3xl gap-x-8 gap-y-2 text-[var(--color-text-soft)] sm:grid-cols-2">
          {destinosDaAjuda.map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm leading-6">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--color-primary)]" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-10">
          <DoacaoPix pixChave={pixChave} />
          <SerSocio />
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-[var(--color-text-muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>
            Quer adotar em vez de doar?{' '}
            <Link
              href="/animais"
              className="font-semibold text-[var(--color-primary)] underline underline-offset-4 hover:text-[var(--color-primary-hover)]"
            >
              Conheça os animais disponíveis
            </Link>
          </p>

          {canais.length > 0 && (
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>Canais oficiais:</span>
              {canais.map((canal) => (
                <a
                  key={canal.label}
                  href={canal.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[var(--color-text-main)] underline decoration-white/30 underline-offset-4 hover:decoration-[var(--color-primary)]"
                >
                  {canal.label}
                </a>
              ))}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
