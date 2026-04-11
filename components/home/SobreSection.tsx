import Link from 'next/link'

const valores = [
  { label: 'Resgate responsável', descricao: 'Cada acolhimento respeita o tempo e as necessidades do animal.' },
  { label: 'Cuidado contínuo', descricao: 'Saúde, segurança e bem-estar vêm antes de qualquer adoção.' },
  { label: 'Adoção acompanhada', descricao: 'A nova família recebe orientação para uma adaptação tranquila.' },
]

interface SobreSectionProps {
  missao?: string
}

export default function SobreSection({ missao }: SobreSectionProps) {
  const missaoTexto =
    missao?.trim() ||
    'A missão da associação será publicada em breve. Enquanto isso, conheça os animais disponíveis e acompanhe nosso trabalho pelos canais oficiais.'

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)] lg:gap-16">
          <div>
            <div className="mb-6 flex items-start gap-4">
              <div className="mt-1 h-12 w-1 flex-shrink-0 rounded-full bg-primary-300" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary-500">
                  Nossa missão
                </p>
                <h2 className="mt-2 text-4xl font-extrabold leading-tight tracking-tight text-neutral-800">
                  Cuidado real para cada história
                </h2>
              </div>
            </div>

            <p className="max-w-prose text-base leading-relaxed text-neutral-600">
              {missaoTexto}
            </p>

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

          <div className="rounded-2xl bg-neutral-50 p-6 shadow-md">
            <h3 className="text-lg font-bold text-neutral-800">
              Como a Amiga Miau cuida
            </h3>
            <div className="mt-5 grid gap-4">
              {valores.map((item) => (
                <div key={item.label} className="rounded-xl bg-white p-4 shadow-sm">
                  <p className="font-semibold text-neutral-800">{item.label}</p>
                  <p className="mt-1 text-sm leading-relaxed text-neutral-500">
                    {item.descricao}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
