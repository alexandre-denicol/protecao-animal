import AnimalCard from '@/components/animals/AnimalCard'
import {
  CATALOG_RESULTS_HEADING_ID,
  filterCatalogAnimals,
  hasActiveFilters,
  paginate,
  resultsTitle,
  type CatalogFilters,
} from '@/lib/animal-catalog'
import { getPublicAnimalRows, withCoverPhotos } from '@/lib/public-animals'
import CatalogPagination from './CatalogPagination'
import {
  CatalogEmptyState,
  CatalogLoadFailureState,
  CatalogNoMatchesState,
} from './CatalogStates'
import ResultsAnnouncer from './ResultsAnnouncer'

export default async function CatalogResults({ filters }: { filters: CatalogFilters }) {
  const { rows, failed } = await getPublicAnimalRows()

  if (failed) {
    return <CatalogLoadFailureState filters={filters} />
  }

  if (rows.length === 0) {
    return (
      <>
        <ResultsAnnouncer message="Nenhum animal para adoção no momento." />
        <CatalogEmptyState />
      </>
    )
  }

  const matches = filterCatalogAnimals(rows, filters)

  if (matches.length === 0) {
    return (
      <>
        <ResultsAnnouncer message="Nenhum animal encontrado com esses filtros." />
        <CatalogNoMatchesState filters={filters} totalAnimals={rows.length} />
      </>
    )
  }

  const page = paginate(matches, filters.pagina)
  const animals = await withCoverPhotos(page.items)
  const title = resultsTitle(matches.length, hasActiveFilters(filters))
  const pageSummary =
    page.totalPages > 1 ? `Página ${page.page} de ${page.totalPages}.` : ''

  return (
    <>
      <ResultsAnnouncer message={`${title}. ${pageSummary}`.trim()} />

      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        {/* Parágrafo (não heading): os cards abaixo são h2, como o E2E espera. */}
        <p
          id={CATALOG_RESULTS_HEADING_ID}
          tabIndex={-1}
          className="font-display text-lg font-bold tracking-[-0.01em] text-[var(--color-text-main)] outline-none sm:text-xl"
        >
          {title}
        </p>
        {page.totalPages > 1 && (
          <p className="text-sm text-[var(--color-text-muted)]">
            Exibindo {page.firstItem}–{page.lastItem} de {page.totalItems}
          </p>
        )}
      </div>

      <ul
        data-testid="animals-grid"
        className="mt-4 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3"
      >
        {animals.map((animal) => (
          <li key={animal.id}>
            <AnimalCard animal={animal} headingLevel="h2" testId="animal-card" />
          </li>
        ))}
      </ul>

      <CatalogPagination
        filters={filters}
        page={page.page}
        totalPages={page.totalPages}
      />
    </>
  )
}
