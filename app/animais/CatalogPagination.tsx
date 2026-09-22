import Link from 'next/link'
import {
  CATALOG_RESULTS_ID,
  buildCatalogHref,
  buildPageItems,
  type CatalogFilters,
} from '@/lib/animal-catalog'

const baseClass =
  'inline-flex min-h-[2.75rem] min-w-[2.75rem] items-center justify-center rounded-full px-4 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]'
const idleClass =
  'border border-white/15 text-[var(--color-text-main)] hover:border-[rgba(244,184,96,0.45)] hover:text-[var(--color-primary)]'
const disabledClass = 'cursor-not-allowed border border-white/15 opacity-40'

function pageHref(filters: CatalogFilters, page: number): string {
  return buildCatalogHref({ ...filters, pagina: page }, CATALOG_RESULTS_ID)
}

export default function CatalogPagination({
  filters,
  page,
  totalPages,
}: {
  filters: CatalogFilters
  page: number
  totalPages: number
}) {
  if (totalPages <= 1) return null

  return (
    <nav
      aria-label="Paginação dos resultados"
      className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:mt-10 sm:gap-3"
    >
      {page > 1 ? (
        <Link href={pageHref(filters, page - 1)} rel="prev" className={`${baseClass} ${idleClass}`}>
          Anterior
        </Link>
      ) : (
        <span aria-disabled="true" className={`${baseClass} ${disabledClass}`}>
          Anterior
        </span>
      )}

      <p className="px-2 text-sm text-[var(--color-text-muted)] sm:hidden">
        Página {page} de {totalPages}
      </p>

      <ul className="hidden items-center gap-2 sm:flex">
        {buildPageItems(page, totalPages).map((item, index) =>
          item === 'ellipsis' ? (
            <li key={`ellipsis-${index}`} aria-hidden="true" className="px-1 text-[var(--color-text-muted)]">
              …
            </li>
          ) : (
            <li key={item}>
              {item === page ? (
                <span
                  aria-current="page"
                  aria-label={`Página ${item}, página atual`}
                  className={`${baseClass} border border-transparent bg-[var(--color-primary)] text-neutral-950`}
                >
                  {item}
                </span>
              ) : (
                <Link
                  href={pageHref(filters, item)}
                  aria-label={`Ir para a página ${item}`}
                  className={`${baseClass} ${idleClass}`}
                >
                  {item}
                </Link>
              )}
            </li>
          ),
        )}
      </ul>

      {page < totalPages ? (
        <Link href={pageHref(filters, page + 1)} rel="next" className={`${baseClass} ${idleClass}`}>
          Próxima
        </Link>
      ) : (
        <span aria-disabled="true" className={`${baseClass} ${disabledClass}`}>
          Próxima
        </span>
      )}
    </nav>
  )
}
