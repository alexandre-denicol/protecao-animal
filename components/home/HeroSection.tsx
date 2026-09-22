import Image from 'next/image'
import Link from 'next/link'

interface HeroSectionProps {
  titulo: string
  subtitulo: string
  imagemUrl: string
}

function safeImageUrl(url: string): string {
  const trimmed = url.trim()

  if (!trimmed) return ''

  try {
    const parsed = new URL(trimmed)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
      ? parsed.toString()
      : ''
  } catch {
    return trimmed.startsWith('/') ? trimmed : ''
  }
}

const seta = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M3.75 9H14.25M14.25 9L9.75 4.5M14.25 9L9.75 13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/**
 * A foto (gato e cachorro) ocupa o topo no mobile e o lado direito no desktop,
 * dissolvendo no fundo da página. O texto fica sempre sobre área escura e a
 * dupla continua inteira à vista, sem painel ou moldura por cima dela.
 */
export default function HeroSection({ titulo, subtitulo, imagemUrl }: HeroSectionProps) {
  const heroImageSrc = safeImageUrl(imagemUrl) || '/home-hero.webp'

  return (
    <section className="relative -mt-20 overflow-hidden pt-20">
      <div
        className="absolute inset-x-0 top-0 h-[24rem] sm:h-[30rem] lg:inset-y-0 lg:left-auto lg:right-0 lg:h-auto lg:w-[72%]"
        aria-hidden="true"
      >
        <Image
          src={heroImageSrc}
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 72vw, 100vw"
          className="object-cover object-[66%_30%] sm:object-[60%_35%] lg:object-[45%_40%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)] via-[rgba(13,17,23,0.55)] via-45% to-[rgba(13,17,23,0.2)] lg:bg-gradient-to-r lg:from-[var(--color-bg)] lg:via-[rgba(13,17,23,0.45)] lg:via-30% lg:to-[rgba(13,17,23,0.05)]" />
        <div className="absolute inset-x-0 bottom-0 hidden h-28 bg-gradient-to-t from-[var(--color-bg)] to-transparent lg:block" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col justify-end px-4 pb-10 pt-[13rem] sm:px-6 sm:pb-12 sm:pt-[18rem] lg:min-h-[29rem] lg:justify-center lg:px-8 lg:pb-14 lg:pt-12">
        <div className="max-w-xl">
          <p className="text-sm font-semibold text-[var(--color-primary)]">
            Associação acolhedora, adoção responsável
          </p>

          <h1 className="mt-3 max-w-[16ch] text-balance font-display text-4xl font-extrabold leading-[1.05] tracking-[-0.025em] text-[var(--color-text-main)] sm:text-5xl lg:text-6xl">
            {titulo}
          </h1>

          <p className="mt-4 max-w-[36rem] text-base leading-7 text-[var(--color-text-soft)] sm:text-lg sm:leading-8">
            {subtitulo}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              href="/animais"
              className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--color-primary)] px-6 py-3.5 text-base font-bold text-neutral-950 shadow-[0_16px_34px_rgba(244,184,96,0.24)] transition duration-200 hover:bg-[var(--color-primary-hover)]"
            >
              Quero adotar agora
              {seta}
            </Link>
            <a
              href="#apoio"
              className="rounded-[var(--radius-button)] px-1 py-2 text-sm font-semibold text-[var(--color-text-main)] underline decoration-white/30 underline-offset-4 transition duration-200 hover:decoration-[var(--color-primary)]"
            >
              Como ajudar
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
