import Image from 'next/image'
import Link from 'next/link'
import {
  especieLabel,
  fotoAlt,
  idadeLabel,
  nomeDisplay,
  nomeOuEsteAnimal,
  sexoLabel,
} from '@/lib/animal-format'
import type { PublicAnimal } from '@/lib/public-animals'
import AnimalStatusBadge from './AnimalStatusBadge'

interface AnimalCardProps {
  animal: PublicAnimal
  headingLevel?: 'h2' | 'h3'
  testId?: string
}

export default function AnimalCard({
  animal,
  headingLevel: Heading = 'h3',
  testId,
}: AnimalCardProps) {
  const temperamento = animal.temperamento?.trim()
  const detalhes = [sexoLabel(animal.sexo), animal.raca?.trim()].filter(Boolean)
  const cuidados = [
    animal.vacinado ? 'Vacinado' : null,
    animal.castrado ? 'Castrado' : null,
  ].filter((cuidado): cuidado is string => cuidado !== null)

  return (
    <Link
      href={`/animais/${animal.slug}`}
      data-testid={testId}
      data-animal-slug={animal.slug}
      className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-white/10 bg-[rgba(17,24,39,0.84)] shadow-[var(--shadow-soft)] transition duration-300 ease-out hover:-translate-y-1 hover:border-[rgba(244,184,96,0.28)] focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-surface-2)] sm:aspect-[4/4.2]">
        {animal.photoUrl ? (
          <>
            <Image
              src={animal.photoUrl}
              alt={fotoAlt(animal.nome)}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(13,17,23,0.95)] via-[rgba(13,17,23,0.18)] to-transparent" />
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-[var(--color-text-muted)]">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
              <path d="M3 15L8 10L12 14L16 10L21 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-sm font-semibold">Sem foto</span>
          </div>
        )}

        <div className="absolute left-3 top-3 sm:left-4 sm:top-4">
          <AnimalStatusBadge status={animal.status} />
        </div>

        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
          <Heading className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
            {nomeDisplay(animal.nome)}
          </Heading>
          <p className="mt-1 text-sm text-white/72">
            {especieLabel(animal.especie, animal.especie_detalhe)} ·{' '}
            {idadeLabel(animal.idade_anos, animal.idade_meses, animal.idade_estimada)}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <p className="text-sm font-semibold text-[var(--color-text-main)]">
          {detalhes.join(' · ')}
        </p>

        {cuidados.length > 0 && (
          <ul className="flex flex-wrap gap-2" aria-label="Cuidados de saúde">
            {cuidados.map((cuidado) => (
              <li
                key={cuidado}
                className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-[var(--color-text-muted)]"
              >
                {cuidado}
              </li>
            ))}
          </ul>
        )}

        {temperamento && (
          <p className="line-clamp-2 text-sm leading-6 text-[var(--color-text-muted)]">
            {temperamento}
          </p>
        )}

        <span className="mt-auto inline-flex items-center gap-1.5 pt-1 text-sm font-semibold text-[var(--color-primary)] transition-colors group-hover:text-[var(--color-primary-hover)]">
          Conhecer {nomeOuEsteAnimal(animal.nome)}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8H13M13 8L8.5 3.5M13 8L8.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    </Link>
  )
}
