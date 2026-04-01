import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Histórias de Adoção',
  description: 'Conheça as histórias de animais que encontraram um lar.',
}

export default function AdocoesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-4xl font-bold text-neutral-800">Histórias de adoção</h1>
      <p className="text-neutral-500">Em breve — portfólio de adoções.</p>
    </div>
  )
}
