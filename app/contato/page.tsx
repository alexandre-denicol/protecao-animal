import type { Metadata } from 'next'
import ContactForm from './ContactForm'

export const metadata: Metadata = {
  title: 'Contato',
  description: 'Fale com a Associação Amiga Miau.',
}

export default function ContatoPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-neutral-800">
          Fale com a gente
        </h1>
        <p className="mt-3 text-neutral-500">
          Envie sua mensagem para a equipe da Associação Amiga Miau.
        </p>
      </div>

      <ContactForm />
    </main>
  )
}
