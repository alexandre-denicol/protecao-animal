import Link from 'next/link'
import SectionHeading from '@/components/public/SectionHeading'

const valores = [
  { label: 'Resgate responsável', descricao: 'Cada acolhimento respeita o tempo e as necessidades do animal.' },
  { label: 'Cuidado contínuo', descricao: 'Saúde, segurança e bem-estar vêm antes de qualquer adoção.' },
  { label: 'Adoção acompanhada', descricao: 'A nova família recebe orientação para uma adaptação tranquila.' },
]

interface SobreSectionProps {
  missao?: string
}

export default function SobreSection({ missao }: SobreSectionProps) {
  const missaoTexto =
    missao?.trim() ||
    'A missão da associação será publicada em breve. Enquanto isso, conheça os animais disponíveis e acompanhe nosso trabalho pelos canais oficiais.'

  return (
    <section className="bg-[var(--color-bg)] py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)] lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="Nossa missão"
              title="Cuidado real, rotina digna e encontros transformadores"
              description={missaoTexto}
            />

            <div className="mt-10">
              <Link
                href="/sobre"
                className="inline-flex items-center gap-2 rounded-[var(--radius-button)] border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-[var(--color-text-main)] transition duration-200 hover:border-[rgba(244,184,96,0.25)] hover:text-[var(--color-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]"
              >
                Conheça nossa equipe completa
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M3.75 9H14.25M14.25 9L9.75 4.5M14.25 9L9.75 13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </div>

          <div className="rounded-[var(--radius-card)] border border-white/10 bg-[rgba(17,24,39,0.72)] p-6 shadow-[var(--shadow-soft)]">
            <h3 className="text-lg font-bold text-[var(--color-text-main)]">
              Como a Amiga Miau cuida
            </h3>
            <div className="mt-5 grid gap-4">
              {valores.map((item, index) => (
                <div key={item.label} className="rounded-[var(--radius-card)] border border-white/8 bg-white/5 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                    0{index + 1}
                  </p>
                  <p className="mt-3 font-semibold text-[var(--color-text-main)]">{item.label}</p>
                  <p className="mt-2 text-sm leading-7 text-[var(--color-text-muted)]">
                    {item.descricao}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
