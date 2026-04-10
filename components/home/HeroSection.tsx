import Image from 'next/image'
import Link from 'next/link'

interface HeroSectionProps {
  titulo: string
  subtitulo: string
  resgatados: number
  adotados: number
  emEspera: number
}

export default function HeroSection({ titulo, subtitulo, resgatados, adotados, emEspera }: HeroSectionProps) {
  return (
    <section className="relative -mt-16 min-h-screen overflow-hidden">
      {/* Imagem de fundo */}
      <Image
        src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=1920&q=80"
        alt="Dois cachorros felizes correndo juntos"
        fill
        className="object-cover object-center"
        priority
        sizes="100vw"
      />

      {/* Overlay gradiente da esquerda para direita */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/15" />

      {/* Conteúdo */}
      <div className="relative z-10 flex min-h-screen flex-col justify-center px-4 pb-24 pt-28 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-6xl">
          <div className="max-w-2xl">

            {/* Eyebrow */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary-300/40 bg-primary-300/20 px-4 py-1.5 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-300" />
              <span className="text-xs font-semibold uppercase tracking-widest text-primary-200">
                Adoção Responsável
              </span>
            </div>

            {/* Título principal */}
            <h1 className="mb-6 text-5xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Todo animal
              <br />
              merece um lar{' '}
              <span className="text-primary-300">cheio de amor</span>
            </h1>

            {/* Subtítulo */}
            <p className="mb-10 max-w-lg text-xl leading-relaxed text-white/80">
              Resgatamos, cuidamos e encontramos famílias perfeitas para cada animal.
              Venha conhecer quem está esperando por você.
            </p>

            {/* Botões CTA */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/animais"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-300 px-8 py-4 text-base font-bold text-white shadow-lg shadow-primary-300/30 transition-all duration-200 hover:bg-primary-400 hover:shadow-primary-400/40 focus-visible:outline-2 focus-visible:outline-white"
              >
                Quero adotar agora
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M3.75 9H14.25M14.25 9L9.75 4.5M14.25 9L9.75 13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link
                href="/sobre"
                className="inline-flex items-center justify-center rounded-xl border-2 border-white/70 px-8 py-4 text-base font-bold text-white backdrop-blur-sm transition-all duration-200 hover:border-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white"
              >
                Nossa história
              </Link>
            </div>

            {/* Mini stats */}
            <div className="mt-12 flex flex-wrap gap-6">
              {[
                { numero: `${resgatados}+`, label: 'Animais resgatados' },
                { numero: `${adotados}+`, label: 'Adotados com amor' },
                { numero: String(emEspera), label: 'Aguardando um lar' },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-2.5">
                  <div className="h-8 w-0.5 rounded-full bg-primary-300/60" />
                  <div>
                    <p className="text-lg font-extrabold leading-none text-white">{stat.numero}</p>
                    <p className="mt-0.5 text-xs text-white/60">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Onda de transição para a seção de baixo */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <svg
          viewBox="0 0 1440 80"
          className="h-20 w-full"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path fill="white" d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" />
        </svg>
      </div>
    </section>
  )
}
