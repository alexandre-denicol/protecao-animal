import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sobre Nós',
  description: 'Conheça a história e missão da Associação Amiga Miau.',
}

export default function SobrePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-4xl font-bold text-neutral-800">Sobre nós</h1>
      <p className="text-neutral-500">Em breve — história e equipe da Associação Amiga Miau.</p>
    </div>
  )
}
