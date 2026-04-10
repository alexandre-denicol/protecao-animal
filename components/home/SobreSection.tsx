import Image from 'next/image'
import Link from 'next/link'

const valores = [
  { icone: '🐾', texto: 'Resgate com responsabilidade' },
  { icone: '💉', texto: 'Cuidado veterinário completo' },
  { icone: '❤️', texto: 'Adoção acompanhada e segura' },
]

interface SobreSectionProps {
  missao?: string
}

export default function SobreSection({ missao }: SobreSectionProps) {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">

          {/* Coluna de texto — esquerda */}
          <div>
            {/* Accent bar + eyebrow */}
            <div className="mb-6 flex items-start gap-4">
              <div className="mt-1 h-12 w-1 flex-shrink-0 rounded-full bg-primary-300" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary-500">
                  Nossa missão
                </p>
                <h2 className="mt-2 text-4xl font-extrabold leading-tight tracking-tight text-neutral-800">
                  Cada animal tem uma{' '}
                  <span className="text-primary-500">história</span> que
                  merece ser contada
                </h2>
              </div>
            </div>

            {missao ? (
              <p className="text-base leading-relaxed text-neutral-600">{missao}</p>
            ) : (
              <>
                <p className="text-base leading-relaxed text-neutral-600">
                  Desde 2018, a Associação Amiga Miau resgata animais em situação de
                  vulnerabilidade nas ruas e os prepara para um novo lar. Cada animal
                  recebe tratamento veterinário, carinho e toda a atenção que merece
                  antes de ser adotado.
                </p>
                <p className="mt-4 text-base leading-relaxed text-neutral-600">
                  Acreditamos que adoção responsável é um compromisso de vida. Por isso,
                  acompanhamos cada processo com cuidado, garantindo que tanto o adotante
                  quanto o animal estejam prontos para essa nova fase.
                </p>
              </>
            )}

            {/* Lista de valores */}
            <ul className="mt-8 flex flex-col gap-3">
              {valores.map((item) => (
                <li key={item.texto} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary-50 text-base">
                    {item.icone}
                  </span>
                  <span className="text-sm font-medium text-neutral-700">{item.texto}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div className="mt-10">
              <Link
                href="/sobre"
                className="inline-flex items-center gap-2 text-sm font-bold text-primary-500 transition-colors hover:text-primary-600 focus-visible:outline-2 focus-visible:outline-primary-300"
              >
                Conheça nossa equipe completa
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M3.75 9H14.25M14.25 9L9.75 4.5M14.25 9L9.75 13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Coluna de imagem — direita */}
          <div className="relative">
            {/* Elemento decorativo de fundo */}
            <div className="absolute -right-4 -top-4 h-full w-full rounded-3xl bg-primary-100" />

            {/* Imagem principal */}
            <div className="relative overflow-hidden rounded-3xl shadow-2xl">
              <div className="aspect-[4/3]">
                <Image
                  src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80"
                  alt="Dois cachorros felizes correndo lado a lado"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>

            {/* Card flutuante com estatística */}
            <div className="absolute -bottom-5 -left-5 rounded-2xl bg-white p-4 shadow-xl">
              <p className="text-3xl font-extrabold text-primary-500">+6 anos</p>
              <p className="text-xs font-medium text-neutral-500">cuidando com amor</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
