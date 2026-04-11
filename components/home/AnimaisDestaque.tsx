import Image from 'next/image'
import Link from 'next/link'
import {
  getFeaturedPublicAnimals,
  type PublicAnimal,
} from '@/lib/public-animals'
import SectionHeading from '@/components/public/SectionHeading'

const statusConfig = {
  disponivel: {
    label: 'Disponível',
    classes:
      'border border-[rgba(31,111,107,0.22)] bg-[rgba(31,111,107,0.16)] text-[#99f6e4]',
  },
  em_processo: {
    label: 'Em processo',
    classes:
      'border border-[rgba(244,184,96,0.24)] bg-[rgba(244,184,96,0.12)] text-[var(--color-primary)]',
  },
  adotado: {
    label: 'Adotado',
    classes: 'border border-white/10 bg-white/8 text-[var(--color-text-muted)]',
  },
} as const

const especieLabel: Record<PublicAnimal['especie'], string> = {
  gato: 'Gato',
  cao: 'Cachorro',
}

function idadeLabel(anos: number | null, meses: number | null): string {
  const partes: string[] = []

  if (anos && anos > 0) {
    partes.push(`${anos} ${anos === 1 ? 'ano' : 'anos'}`)
  }

  if (meses && meses > 0) {
    partes.push(`${meses} ${meses === 1 ? 'mês' : 'meses'}`)
  }

  return partes.length > 0 ? partes.join(' e ') : 'Idade não informada'
}

function CardAnimal({ animal }: { animal: PublicAnimal }) {
  const status = statusConfig[animal.status]

  return (
    <Link
      href={`/animais/${animal.slug}`}
      data-testid="featured-animal-card"
      data-animal-slug={animal.slug}
      className="group flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-white/10 bg-[rgba(17,24,39,0.82)] shadow-[var(--shadow-soft)] transition duration-300 ease-out hover:-translate-y-1 hover:border-[rgba(244,184,96,0.28)] focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]"
    >
      <div className="relative aspect-[4/4.8] overflow-hidden bg-[var(--color-surface-2)]">
        {animal.photoUrl ? (
          <>
            <Image
              src={animal.photoUrl}
              alt={`Foto de ${animal.nome}`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(13,17,23,0.95)] via-[rgba(13,17,23,0.18)] to-transparent" />
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-semibold text-[var(--color-text-muted)]">
            Sem foto
          </div>
        )}

        <div className="absolute right-3 top-3">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.classes}`}>
            {status.label}
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-5">
          <h3 className="text-2xl font-extrabold tracking-tight text-white">{animal.nome}</h3>
          <p className="mt-1 text-sm text-white/72">
            {especieLabel[animal.especie]} · {idadeLabel(animal.idade_anos, animal.idade_meses)}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-sm leading-7 text-[var(--color-text-muted)]">
          Um encontro possível entre afeto, rotina e adoção responsável.
        </p>
        <div className="mt-auto pt-4">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-primary)] transition-colors group-hover:text-[var(--color-primary-hover)]">
            Conhecer {animal.nome}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8H13M13 8L8.5 3.5M13 8L8.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  )
}

export default async function AnimaisDestaque() {
  const animais = await getFeaturedPublicAnimals()

  return (
    <section className="bg-[var(--color-bg)] py-24" data-testid="featured-animals-section">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Conheça quem espera um lar"
          title="Animais em destaque com presença e personalidade"
          description="Cada card é um convite para olhar com calma, sentir afinidade e começar uma conversa responsável."
          align="center"
        />

        {animais.length > 0 ? (
          <div
            data-testid="featured-animals-grid"
            className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {animais.map((animal) => (
              <CardAnimal key={animal.id} animal={animal} />
            ))}
          </div>
        ) : (
          <div className="mt-12 rounded-[var(--radius-card)] border border-white/10 bg-[rgba(17,24,39,0.78)] px-6 py-12 text-center shadow-[var(--shadow-soft)]">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[rgba(244,184,96,0.18)] bg-[rgba(244,184,96,0.12)] text-[var(--color-primary)]">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 12C4 8.7 6.7 6 10 6H14C17.3 6 20 8.7 20 12C20 15.3 17.3 18 14 18H10C6.7 18 4 15.3 4 12Z" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 10.5H8.01M16 10.5H16.01M9 14C10.8 15.3 13.2 15.3 15 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-[var(--color-text-main)]">
              Nenhum animal em destaque no momento
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[var(--color-text-muted)]">
              A lista completa continua disponível para você conhecer quem está esperando por um lar.
            </p>
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            href="/animais"
            className="inline-flex items-center gap-2 rounded-[var(--radius-button)] border border-[rgba(31,111,107,0.55)] bg-[rgba(31,111,107,0.12)] px-8 py-3.5 text-sm font-bold text-[#8de3dd] transition duration-200 hover:bg-[rgba(31,111,107,0.18)] focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]"
          >
            Ver todos os animais
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M3.75 9H14.25M14.25 9L9.75 4.5M14.25 9L9.75 13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
