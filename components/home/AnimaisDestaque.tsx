import Image from 'next/image'
import Link from 'next/link'
import {
  getFeaturedPublicAnimals,
  type PublicAnimal,
} from '@/lib/public-animals'

const statusConfig = {
  disponivel: {
    label: 'Disponível',
    classes: 'bg-green-100 text-green-700',
  },
  em_processo: {
    label: 'Em processo',
    classes: 'bg-amber-100 text-amber-700',
  },
  adotado: {
    label: 'Adotado',
    classes: 'bg-neutral-100 text-neutral-500',
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
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-primary-300"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
        {animal.photoUrl ? (
          <Image
            src={animal.photoUrl}
            alt={`Foto de ${animal.nome}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-semibold text-neutral-400">
            Sem foto
          </div>
        )}

        <div className="absolute right-3 top-3">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.classes}`}>
            {status.label}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-xl font-bold text-neutral-800">{animal.nome}</h3>
        <p className="mt-1 text-sm text-neutral-500">
          {especieLabel[animal.especie]} · {idadeLabel(animal.idade_anos, animal.idade_meses)}
        </p>

        <div className="mt-auto pt-4">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-500 transition-colors group-hover:text-primary-600">
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
    <section className="bg-neutral-50 py-20" data-testid="featured-animals-section">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary-500">
            Conheça quem busca um lar
          </p>
          <h2 className="text-4xl font-extrabold tracking-tight text-neutral-800">
            Animais em Destaque
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-neutral-500">
            Cada um com sua personalidade única, esperando pela família certa.
          </p>
        </div>

        {animais.length > 0 ? (
          <div
            data-testid="featured-animals-grid"
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {animais.map((animal) => (
              <CardAnimal key={animal.id} animal={animal} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-white px-6 py-12 text-center shadow-md">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-500">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 12C4 8.7 6.7 6 10 6H14C17.3 6 20 8.7 20 12C20 15.3 17.3 18 14 18H10C6.7 18 4 15.3 4 12Z" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 10.5H8.01M16 10.5H16.01M9 14C10.8 15.3 13.2 15.3 15 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-neutral-800">
              Nenhum animal em destaque no momento
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-neutral-500">
              A lista completa continua disponível para você conhecer quem está esperando por um lar.
            </p>
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            href="/animais"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-primary-300 px-8 py-3.5 text-sm font-bold text-primary-600 transition-all duration-200 hover:bg-primary-50 focus-visible:outline-2 focus-visible:outline-primary-300"
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
