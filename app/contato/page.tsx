import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contato',
  description: 'Entre em contato com a Associação Amiga Miau.',
}

export default function ContatoPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-4xl font-bold text-neutral-800">Contato</h1>
      <p className="text-neutral-500">Em breve — formulário de contato.</p>
    </div>
  )
}
