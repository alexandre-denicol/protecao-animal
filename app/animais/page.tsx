import type { Metadata } from 'next'
import { Suspense } from 'react'
import {
  CATALOG_LIVE_REGION_ID,
  CATALOG_RESULTS_ID,
  buildCatalogHref,
  parseCatalogFilters,
} from '@/lib/animal-catalog'
import CatalogFilters from './CatalogFilters'
import CatalogResults from './CatalogResults'
import CatalogResultsSkeleton from './CatalogResultsSkeleton'
import CatalogStats, { CatalogStatsSkeleton } from './CatalogStats'
import { homeDisplayFont } from '@/components/home/home-font'

export const metadata: Metadata = {
  title: 'Animais para Adoção',
  description: 'Conheça nossos animais disponíveis para adoção.',
}

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>
}

export default function AnimaisPage({ searchParams }: PageProps) {
  const filters = parseCatalogFilters(searchParams)

  return (
    <div
      data-testid="animals-page"
      className={`${homeDisplayFont.variable} mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-10 lg:px-8 lg:pt-12`}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-[var(--color-primary)]">
            Catálogo de adoção
          </p>
          <h1 className="mt-1.5 max-w-[22ch] text-balance font-display text-3xl font-extrabold leading-[1.1] tracking-[-0.025em] text-[var(--color-text-main)] sm:text-4xl">
            Encontre o animal que combina com a sua casa
          </h1>
          <p className="mt-3 hidden max-w-[64ch] text-base leading-7 text-[var(--color-text-soft)] sm:block">
            Navegue com calma, conheça as histórias e escolha com responsabilidade.
            Cada encontro começa com atenção, acolhimento e conversa.
          </p>
        </div>

        <Suspense fallback={<CatalogStatsSkeleton />}>
          <CatalogStats />
        </Suspense>
      </div>

      <CatalogFilters filters={filters} />

      <div id={CATALOG_RESULTS_ID} className="mt-6 scroll-mt-24 sm:scroll-mt-28">
        <div
          id={CATALOG_LIVE_REGION_ID}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        />

        {/* A key faz o esqueleto reaparecer a cada mudança de filtro ou página. */}
        <Suspense key={buildCatalogHref(filters)} fallback={<CatalogResultsSkeleton />}>
          <CatalogResults filters={filters} />
        </Suspense>
      </div>
    </div>
  )
}
