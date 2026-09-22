import Link from 'next/link'
import SectionHeading from '@/components/public/SectionHeading'

interface SobreSectionProps {
  missao?: string
}

export default function SobreSection({ missao }: SobreSectionProps) {
  const missaoTexto =
    missao?.trim() ||
    'A missão da associação será publicada em breve. Enquanto isso, conheça os animais disponíveis e acompanhe nosso trabalho pelos canais oficiais.'

  return (
    <section aria-labelledby="missao-titulo" className="py-10 sm:py-12">
      <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] lg:items-start lg:gap-14 lg:px-8">
        <SectionHeading
          id="missao-titulo"
          eyebrow="Nossa missão"
          title="Cuidado real, rotina digna e encontros transformadores"
        />

        <div>
          <p className="max-w-[62ch] whitespace-pre-line text-base leading-7 text-[var(--color-text-soft)]">
            {missaoTexto}
          </p>
          <Link
            href="/sobre"
            className="mt-4 inline-flex items-center gap-2 rounded-[var(--radius-button)] py-1.5 text-sm font-semibold text-[var(--color-primary)] transition duration-200 hover:text-[var(--color-primary-hover)]"
          >
            Conheça nossa equipe completa
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M3.75 9H14.25M14.25 9L9.75 4.5M14.25 9L9.75 13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
