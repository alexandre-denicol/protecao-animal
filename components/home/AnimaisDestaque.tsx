import Link from 'next/link'
import { getFeaturedPublicAnimals } from '@/lib/public-animals'
import AnimalCard from '@/components/animals/AnimalCard'
import SectionHeading from '@/components/public/SectionHeading'

const seta = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M3.75 9H14.25M14.25 9L9.75 4.5M14.25 9L9.75 13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

function LinkVerTodos({ className }: { className: string }) {
  return (
    <Link href="/animais" className={className}>
      Ver todos os animais
      {seta}
    </Link>
  )
}

function EstadoVazio() {
  return (
    <div className="mt-6 flex flex-col items-center px-4 py-8 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(244,184,96,0.12)] text-[var(--color-primary)]">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 12C4 8.7 6.7 6 10 6H14C17.3 6 20 8.7 20 12C20 15.3 17.3 18 14 18H10C6.7 18 4 15.3 4 12Z" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 10.5H8.01M16 10.5H16.01M9 14C10.8 15.3 13.2 15.3 15 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </div>
      <h3 className="font-display tracking-[-0.01em] text-lg font-bold text-[var(--color-text-main)]">
        Nenhum animal em destaque no momento
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--color-text-muted)]">
        A lista completa continua disponível para você conhecer quem está esperando por um lar.
      </p>
      <LinkVerTodos className="mt-6 inline-flex items-center gap-2 rounded-[var(--radius-button)] bg-[var(--color-primary)] px-6 py-3 text-sm font-bold text-neutral-950 transition duration-200 hover:bg-[var(--color-primary-hover)]" />
    </div>
  )
}

export default async function AnimaisDestaque() {
  const animais = await getFeaturedPublicAnimals()
  const temAnimais = animais.length > 0

  return (
    <section
      id="animais-em-destaque"
      aria-labelledby="animais-em-destaque-titulo"
      className="scroll-mt-24 py-10 sm:py-14"
      data-testid="featured-animals-section"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <SectionHeading
            id="animais-em-destaque-titulo"
            eyebrow="Conheça quem espera um lar"
            title="Animais em destaque"
          />
          {temAnimais && (
            <LinkVerTodos className="hidden items-center gap-2 rounded-[var(--radius-button)] px-1 py-2 text-sm font-semibold text-[var(--color-primary)] transition duration-200 hover:text-[var(--color-primary-hover)] sm:inline-flex" />
          )}
        </div>

        {temAnimais ? (
          <>
            <div
              data-testid="featured-animals-grid"
              className="mt-6 grid grid-cols-1 gap-5 sm:mt-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3"
            >
              {animais.map((animal) => (
                <AnimalCard
                  key={animal.id}
                  animal={animal}
                  headingLevel="h3"
                  testId="featured-animal-card"
                />
              ))}
            </div>

            <div className="mt-8 sm:hidden">
              <LinkVerTodos className="flex items-center justify-center gap-2 rounded-[var(--radius-button)] border border-[rgba(113,211,205,0.4)] px-6 py-3.5 text-sm font-bold text-[#8de3dd] transition duration-200 hover:bg-[rgba(31,111,107,0.16)]" />
            </div>
          </>
        ) : (
          <EstadoVazio />
        )}
      </div>
    </section>
  )
}
