import type { Metadata } from 'next'
import { getPublicAnimals } from '@/lib/public-animals'
import AnimalsCatalog from './AnimalsCatalog'

export const metadata: Metadata = {
  title: 'Animais para Adoção',
  description: 'Conheça nossos animais disponíveis para adoção.',
}

export default async function AnimaisPage() {
  const animals = await getPublicAnimals()

  return (
    <div
      data-testid="animals-page"
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
    >
      <AnimalsCatalog animals={animals} />
    </div>
  )
}
