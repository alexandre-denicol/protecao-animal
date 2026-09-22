import Link from 'next/link'
import {
  CATALOG_PATH,
  SPECIES_FILTERS,
  STATUS_FILTERS,
  buildCatalogHref,
  hasActiveFilters,
  type CatalogFilters as Filters,
} from '@/lib/animal-catalog'

const groupLabelClass =
  'mb-1.5 block text-sm font-semibold text-[var(--color-text-soft)]'

function FilterChip({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? 'true' : undefined}
      className={`inline-flex min-h-[2.75rem] items-center rounded-full border px-3.5 text-sm font-semibold transition duration-200 focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] sm:px-4 ${
        active
          ? 'border-transparent bg-[var(--color-primary)] text-neutral-950'
          : 'border-white/15 text-[var(--color-text-main)] hover:border-[rgba(244,184,96,0.45)] hover:text-[var(--color-primary)]'
      }`}
    >
      {children}
    </Link>
  )
}

export default function CatalogFilters({ filters }: { filters: Filters }) {
  return (
    <section
      aria-label="Filtros do catálogo"
      className="mt-6 flex flex-wrap items-end gap-x-6 gap-y-4 border-t border-white/10 pt-5 sm:mt-8"
    >
      <form
        action={CATALOG_PATH}
        method="get"
        role="search"
        className="flex w-full flex-col lg:w-auto lg:min-w-[18rem] lg:max-w-xl lg:flex-1"
      >
        {filters.especie && <input type="hidden" name="especie" value={filters.especie} />}
        {filters.status && <input type="hidden" name="status" value={filters.status} />}

        <label htmlFor="catalogo-busca" className={groupLabelClass}>
          Buscar por nome ou raça
        </label>
        <div className="flex gap-2 sm:gap-3">
          <input
            key={filters.busca}
            id="catalogo-busca"
            name="busca"
            type="search"
            defaultValue={filters.busca}
            maxLength={60}
            autoComplete="off"
            enterKeyHint="search"
            placeholder="Ex.: Lua, Bento, SRD"
            className="min-h-[2.75rem] min-w-0 flex-1 rounded-[var(--radius-button)] border border-white/35 bg-[rgba(255,255,255,0.04)] px-3.5 py-2.5 text-sm sm:px-4 text-[var(--color-text-main)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus-visible:ring-2 focus-visible:ring-[rgba(244,184,96,0.35)]"
          />

          <button
            type="submit"
            className="inline-flex min-h-[2.75rem] shrink-0 items-center justify-center rounded-[var(--radius-button)] bg-[var(--color-primary)] px-4 text-sm font-bold text-neutral-950 transition duration-200 hover:bg-[var(--color-primary-hover)] focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] sm:px-6"
          >
            Buscar
          </button>
        </div>
      </form>

      <div role="group" aria-labelledby="filtro-especie" className="min-w-0">
        <span id="filtro-especie" className={groupLabelClass}>
          Espécie
        </span>
        <div className="flex flex-wrap gap-2">
          {SPECIES_FILTERS.map((option) => (
            <FilterChip
              key={option.label}
              href={buildCatalogHref({ ...filters, especie: option.value, pagina: 1 })}
              active={filters.especie === option.value}
            >
              {option.label}
            </FilterChip>
          ))}
        </div>
      </div>

      <div role="group" aria-labelledby="filtro-status" className="min-w-0">
        <span id="filtro-status" className={groupLabelClass}>
          Status
        </span>
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((option) => (
            <FilterChip
              key={option.label}
              href={buildCatalogHref({ ...filters, status: option.value, pagina: 1 })}
              active={filters.status === option.value}
            >
              {option.label}
            </FilterChip>
          ))}
        </div>
      </div>

      {hasActiveFilters(filters) && (
        <div className="-mt-2 w-full">
          <Link
            href={CATALOG_PATH}
            scroll={false}
            className="-ml-1 inline-flex min-h-[2.75rem] items-center rounded-[var(--radius-button)] px-1 text-sm font-semibold text-[var(--color-primary)] underline decoration-[rgba(244,184,96,0.4)] underline-offset-4 transition hover:decoration-[var(--color-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]"
          >
            Limpar filtros
          </Link>
        </div>
      )}
    </section>
  )
}
