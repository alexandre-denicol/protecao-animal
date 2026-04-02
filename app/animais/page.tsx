import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Animais para Adoção',
  description: 'Conheça nossos animais disponíveis para adoção.',
}

export default function AnimaisPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-neutral-800">
        Animais para adoção
      </h1>
      <p className="text-neutral-500">Em breve — catálogo completo de animais.</p>
    </div>
  )
}
