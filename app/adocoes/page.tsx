import type { Metadata } from 'next'
import { Suspense } from 'react'
import { homeDisplayFont } from '@/components/home/home-font'
import AdoptionStories from './AdoptionStories'
import AdoptionStoriesSkeleton from './AdoptionStoriesSkeleton'

export const metadata: Metadata = {
  title: 'Histórias de Adoção',
  description: 'Conheça as histórias de animais que encontraram um lar.',
}

export default function AdocoesPage() {
  return (
    <div
      data-testid="adoption-stories-page"
      className={`${homeDisplayFont.variable} mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-10 lg:px-8 lg:pt-12`}
    >
      <div className="max-w-2xl">
        <p className="text-sm font-semibold text-[var(--color-primary)]">Resultados reais</p>
        <h1 className="mt-1.5 text-balance font-display text-3xl font-extrabold leading-[1.1] tracking-[-0.025em] text-[var(--color-text-main)] sm:text-4xl">
          Histórias de adoção
        </h1>
        <p className="mt-3 max-w-[64ch] text-base leading-7 text-[var(--color-text-soft)]">
          Animais que encontraram um lar pela Associação Amiga Miau, com o registro feito
          pela nossa equipe.
        </p>
      </div>

      <Suspense fallback={<AdoptionStoriesSkeleton />}>
        <AdoptionStories />
      </Suspense>
    </div>
  )
}
