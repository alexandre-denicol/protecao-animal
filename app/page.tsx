import Link from 'next/link'

// Página inicial — conteúdo completo será implementado na próxima etapa
export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mx-auto max-w-2xl px-4">
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary-100 text-4xl">
          🐾
        </div>
        <h1 className="mb-4 text-4xl font-bold text-neutral-800">
          Bem-vindo à Associação Amiga Miau
        </h1>
        <p className="mb-8 text-lg text-neutral-500">
          Resgatamos, cuidamos e encontramos lares amorosos para animais de rua.
          Venha adotar um amigo!
        </p>
        <Link
          href="/animais"
          className="inline-block rounded-xl bg-primary-300 px-8 py-3.5 font-semibold text-white transition-colors hover:bg-primary-400 focus-visible:outline-2 focus-visible:outline-primary-300"
        >
          Ver animais para adoção
        </Link>
      </div>
    </section>
  )
}
