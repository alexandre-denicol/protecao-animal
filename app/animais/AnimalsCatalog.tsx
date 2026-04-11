'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { PublicAnimal } from '@/lib/public-animals'

type SpeciesFilter = 'todos' | PublicAnimal['especie']
type StatusFilter = 'todos' | 'disponivel' | 'em_processo'

const PAGE_SIZE = 9

function especieLabel(especie: PublicAnimal['especie']): string {
  return especie === 'cao' ? 'Cão' : 'Gato'
}

function statusLabel(status: PublicAnimal['status']): string {
  if (status === 'em_processo') return 'Em processo'
  return 'Disponível'
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

function currencyBadgeClass(status: PublicAnimal['status']) {
  return status === 'em_processo'
    ? 'border border-[rgba(244,184,96,0.22)] bg-[rgba(244,184,96,0.12)] text-[var(--color-primary)]'
    : 'border border-[rgba(31,111,107,0.25)] bg-[rgba(31,111,107,0.14)] text-[#81e6de]'
}

export default function AnimalsCatalog({ animals }: { animals: PublicAnimal[] }) {
  const [query, setQuery] = useState('')
  const [species, setSpecies] = useState<SpeciesFilter>('todos')
  const [status, setStatus] = useState<StatusFilter>('todos')
  const [page, setPage] = useState(1)

  const filteredAnimals = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return animals.filter((animal) => {
      if (species !== 'todos' && animal.especie !== species) return false
      if (status !== 'todos' && animal.status !== status) return false
      if (!normalizedQuery) return true

      return [animal.nome, especieLabel(animal.especie), statusLabel(animal.status)]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery)
    })
  }, [animals, query, species, status])

  const totalPages = Math.max(1, Math.ceil(filteredAnimals.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const currentAnimals = filteredAnimals.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  )

  function updatePage(nextPage: number) {
    setPage(Math.max(1, Math.min(nextPage, totalPages)))
  }

  function updateFilters(next: {
    query?: string
    species?: SpeciesFilter
    status?: StatusFilter
  }) {
    if (next.query !== undefined) setQuery(next.query)
    if (next.species !== undefined) setSpecies(next.species)
    if (next.status !== undefined) setStatus(next.status)
    setPage(1)
  }

  return (
    <>
      <section className="rounded-[var(--radius-card)] border border-white/10 bg-[rgba(17,24,39,0.8)] p-4 shadow-[var(--shadow-soft)] backdrop-blur sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-primary)]">
              Catálogo de adoção
            </p>
            <h1 className="mt-3 max-w-[14ch] text-3xl font-extrabold tracking-tight text-[var(--color-text-main)] sm:text-4xl lg:text-5xl">
              Encontre o animal que combina com a sua casa
            </h1>
            <p className="mt-4 max-w-[60ch] text-sm leading-7 text-[var(--color-text-muted)] sm:text-base">
              Navegue com calma, conheça as histórias e escolha com responsabilidade.
              Cada encontro começa com atenção, acolhimento e conversa.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[360px]">
            {[
              { value: animals.length, label: 'Disponíveis agora' },
              {
                value: animals.filter((animal) => animal.status === 'em_processo').length,
                label: 'Em processo',
              },
              {
                value: animals.filter((animal) => animal.especie === 'gato').length,
                label: 'Gatos',
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[var(--radius-card)] border border-white/8 bg-white/5 px-4 py-4 text-left"
              >
                <p className="text-2xl font-extrabold text-[var(--color-text-main)]">
                  {item.value}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-[var(--radius-card)] border border-white/10 bg-[rgba(17,24,39,0.72)] p-4 shadow-[var(--shadow-soft)] backdrop-blur sm:mt-8 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="flex-1">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              Buscar por nome
            </label>
            <input
              value={query}
              onChange={(event) => updateFilters({ query: event.target.value })}
              placeholder="Ex: Lua, Bento, filhote..."
              className="w-full rounded-[var(--radius-button)] border border-white/10 bg-[rgba(255,255,255,0.04)] px-4 py-3 text-sm text-[var(--color-text-main)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)]"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:w-[420px]">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                Espécie
              </label>
              <select
                value={species}
                onChange={(event) =>
                  updateFilters({ species: event.target.value as SpeciesFilter })
                }
                className="w-full rounded-[var(--radius-button)] border border-white/10 bg-[rgba(255,255,255,0.04)] px-4 py-3 text-sm text-[var(--color-text-main)] outline-none transition focus:border-[var(--color-primary)]"
              >
                <option value="todos">Todos</option>
                <option value="gato">Gatos</option>
                <option value="cao">Cães</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                Status
              </label>
              <select
                value={status}
                onChange={(event) =>
                  updateFilters({ status: event.target.value as StatusFilter })
                }
                className="w-full rounded-[var(--radius-button)] border border-white/10 bg-[rgba(255,255,255,0.04)] px-4 py-3 text-sm text-[var(--color-text-main)] outline-none transition focus:border-[var(--color-primary)]"
              >
                <option value="todos">Todos</option>
                <option value="disponivel">Disponíveis</option>
                <option value="em_processo">Em processo</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-4">
          <p className="text-sm leading-6 text-[var(--color-text-muted)]">
            {filteredAnimals.length === animals.length
              ? `${animals.length} animais prontos para conhecer você.`
              : `${filteredAnimals.length} resultados encontrados com os filtros atuais.`}
          </p>

          {(query || species !== 'todos' || status !== 'todos') && (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setSpecies('todos')
                setStatus('todos')
                setPage(1)
              }}
              className="rounded-[var(--radius-button)] border border-white/10 px-4 py-2 text-sm font-semibold text-[var(--color-text-main)] transition hover:border-[rgba(244,184,96,0.28)] hover:text-[var(--color-primary)]"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </section>

      {filteredAnimals.length === 0 ? (
        <section className="mt-8 rounded-[var(--radius-card)] border border-dashed border-white/12 bg-[rgba(17,24,39,0.68)] px-6 py-16 text-center shadow-[var(--shadow-soft)]">
          <div className="mx-auto max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--color-primary)]">
              Nenhum resultado
            </p>
            <h2 className="mt-4 text-2xl font-bold text-[var(--color-text-main)]">
              Não encontramos animais com esse recorte agora
            </h2>
            <p className="mt-3 text-[var(--color-text-muted)]">
              Tente ajustar a busca ou limpar os filtros para ver todos os animais
              disponíveis.
            </p>
          </div>
        </section>
      ) : (
        <>
          <section
            data-testid="animals-grid"
            className="mt-6 grid gap-5 sm:mt-8 sm:grid-cols-2 lg:gap-6 xl:grid-cols-3"
          >
            {currentAnimals.map((animal) => (
              <Link
                key={animal.id}
                href={`/animais/${animal.slug}`}
                data-testid="animal-card"
                data-animal-slug={animal.slug}
                className="group overflow-hidden rounded-[var(--radius-card)] border border-white/10 bg-[rgba(17,24,39,0.84)] shadow-[var(--shadow-soft)] transition duration-300 hover:-translate-y-1 hover:border-[rgba(244,184,96,0.28)]"
              >
                <div className="relative aspect-[4/4.8] overflow-hidden bg-[var(--color-surface-2)] sm:aspect-[4/4.9] xl:aspect-[4/4.7]">
                  {animal.photoUrl ? (
                    <>
                      <Image
                        src={animal.photoUrl}
                        alt={`Foto de ${animal.nome}`}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(13,17,23,0.95)] via-[rgba(13,17,23,0.1)] to-transparent" />
                    </>
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm font-semibold text-[var(--color-text-muted)]">
                      Sem foto
                    </div>
                  )}

                  <div className="absolute left-3 right-3 top-3 flex items-start justify-between gap-2 sm:left-4 sm:right-4 sm:top-4 sm:gap-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${currencyBadgeClass(animal.status)}`}>
                      {statusLabel(animal.status)}
                    </span>
                    <span className="rounded-full border border-white/10 bg-[rgba(13,17,23,0.56)] px-3 py-1 text-xs font-medium text-[var(--color-text-main)]">
                      {especieLabel(animal.especie)}
                    </span>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h2 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
                      {animal.nome}
                    </h2>
                    <p className="mt-1 text-sm text-white/72">
                      {idadeLabel(animal.idade_anos, animal.idade_meses)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 p-4 sm:gap-4 sm:p-5">
                  <p className="text-sm leading-6 text-[var(--color-text-muted)]">
                    Conheça mais sobre o temperamento, rotina e processo de adoção.
                  </p>
                  <span className="inline-flex h-11 min-w-11 items-center justify-center rounded-full border border-[rgba(244,184,96,0.24)] bg-[rgba(244,184,96,0.12)] text-[var(--color-primary)] transition group-hover:translate-x-0.5">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                      <path d="M3.75 9H14.25M14.25 9L9.75 4.5M14.25 9L9.75 13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </section>

          {totalPages > 1 && (
            <nav className="mt-10 flex flex-wrap items-center justify-center gap-3" aria-label="Paginação">
              <button
                type="button"
                onClick={() => updatePage(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-[var(--radius-button)] border border-white/10 px-4 py-2 text-sm font-semibold text-[var(--color-text-main)] transition hover:border-[rgba(244,184,96,0.28)] hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Anterior
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => updatePage(pageNumber)}
                  className={`h-11 min-w-11 rounded-full px-3 text-sm font-semibold transition ${
                    pageNumber === currentPage
                      ? 'bg-[var(--color-primary)] text-neutral-950 shadow-[0_10px_24px_rgba(244,184,96,0.22)]'
                      : 'border border-white/10 text-[var(--color-text-main)] hover:border-[rgba(244,184,96,0.28)] hover:text-[var(--color-primary)]'
                  }`}
                >
                  {pageNumber}
                </button>
              ))}

              <button
                type="button"
                onClick={() => updatePage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="rounded-[var(--radius-button)] border border-white/10 px-4 py-2 text-sm font-semibold text-[var(--color-text-main)] transition hover:border-[rgba(244,184,96,0.28)] hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Próxima
              </button>
            </nav>
          )}
        </>
      )}
    </>
  )
}
