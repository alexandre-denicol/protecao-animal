import Link from 'next/link'
import type { CSSProperties } from 'react'
import BrandLogo from '@/components/BrandLogo'

interface HeroSectionProps {
  titulo: string
  subtitulo: string
  imagemUrl: string
  resgatados: number
  adotados: number
  emEspera: number
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

export default function HeroSection({
  titulo,
  subtitulo,
  imagemUrl,
  resgatados,
  adotados,
  emEspera,
}: HeroSectionProps) {
  const backgroundUrl = safeImageUrl(imagemUrl)
  const backgroundStyle: CSSProperties = backgroundUrl
    ? { backgroundImage: `url("${backgroundUrl}")` }
    : {}

  return (
    <section className="relative -mt-20 overflow-hidden bg-[var(--color-bg)] pt-20">
      {backgroundUrl ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={backgroundStyle}
          aria-hidden="true"
        />
      ) : (
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(200,168,232,0.38),transparent_32%),linear-gradient(135deg,#201E1A,#58544C)]"
          aria-hidden="true"
        />
      )}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(244,184,96,0.2),transparent_24%),linear-gradient(125deg,rgba(13,17,23,0.92),rgba(13,17,23,0.68),rgba(13,17,23,0.84))]" />

      <div className="relative z-10 px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14 lg:px-8">
        <div className="mx-auto grid min-h-[calc(100vh-5.5rem)] max-w-7xl items-center gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(340px,0.7fr)] lg:gap-10">
          <div className="max-w-3xl py-8 sm:py-10">
            <BrandLogo className="mb-6 sm:mb-8" />

            <div className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full border border-[rgba(244,184,96,0.24)] bg-[rgba(244,184,96,0.12)] px-3 py-1.5 backdrop-blur-sm sm:mb-5 sm:px-4">
              <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-primary)] sm:text-xs sm:tracking-[0.26em]">
                Associação acolhedora, adoção responsável
              </span>
            </div>

            <h1 className="mb-5 max-w-[12ch] text-4xl font-extrabold leading-[1.02] tracking-tight text-[var(--color-text-main)] sm:mb-6 sm:text-5xl lg:text-6xl xl:text-7xl">
              {titulo}
            </h1>

            <p className="mb-8 max-w-[34rem] text-base leading-7 text-white/76 sm:mb-10 sm:text-lg sm:leading-8 lg:text-xl">
              {subtitulo}
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
              <Link
                href="/animais"
                className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--color-primary)] px-6 py-3.5 text-sm font-bold text-neutral-950 shadow-[0_16px_34px_rgba(244,184,96,0.24)] transition duration-200 hover:bg-[var(--color-primary-hover)] sm:px-8 sm:py-4 sm:text-base"
              >
                Quero adotar agora
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M3.75 9H14.25M14.25 9L9.75 4.5M14.25 9L9.75 13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link
                href="/socios"
                className="inline-flex items-center justify-center rounded-[var(--radius-button)] border border-[rgba(31,111,107,0.55)] bg-[rgba(31,111,107,0.12)] px-6 py-3.5 text-sm font-bold text-[#8de3dd] backdrop-blur-sm transition duration-200 hover:bg-[rgba(31,111,107,0.18)] sm:px-8 sm:py-4 sm:text-base"
              >
                Apoiar a associação
              </Link>
            </div>

            <div className="mt-10 grid gap-3 sm:mt-12 sm:grid-cols-3 sm:gap-4">
              {[
                { numero: `${resgatados}+`, label: 'Animais resgatados' },
                { numero: `${adotados}+`, label: 'Adotados com amor' },
                { numero: String(emEspera), label: 'Aguardando um lar' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[var(--radius-card)] border border-white/10 bg-[rgba(17,24,39,0.72)] px-4 py-4 shadow-[var(--shadow-soft)] backdrop-blur sm:px-5 sm:py-5"
                >
                  <p className="text-2xl font-extrabold leading-none text-[var(--color-text-main)] sm:text-3xl">
                    {stat.numero}
                  </p>
                  <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-text-muted)] sm:text-xs sm:tracking-[0.2em]">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden min-h-[480px] overflow-hidden rounded-[28px] border border-white/10 bg-[rgba(17,24,39,0.52)] shadow-[var(--shadow-soft)] lg:block xl:min-h-[540px]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(244,184,96,0.16),transparent_28%)]" />
            <div className="absolute inset-x-6 bottom-6 rounded-[24px] border border-white/10 bg-[rgba(13,17,23,0.7)] p-6 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--color-primary)]">
                Cuidado contínuo
              </p>
              <h2 className="mt-3 text-2xl font-bold text-[var(--color-text-main)]">
                Histórias que recomeçam com segurança, calma e afeto.
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--color-text-muted)]">
                Cada resgate passa por acolhimento, avaliação e preparação para um
                encontro responsável com a nova família.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
