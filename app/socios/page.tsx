import type { Metadata } from 'next'
import Link from 'next/link'
import { getPublicSiteSettings } from '@/lib/site-settings'
import BrandLogo from '@/components/BrandLogo'
import MembershipForm from './MembershipForm'

export const metadata: Metadata = {
  title: 'Quero ser sócio',
  description:
    'Cadastre seu interesse em se tornar sócio da Associação Amiga Miau.',
}

export default async function SociosPage() {
  const settings = await getPublicSiteSettings()
  const titulo = settings.socios_titulo.trim() || 'Quero ser sócio'
  const texto =
    settings.socios_texto.trim() ||
    'Ao se tornar sócio, você ajuda a manter cuidados contínuos para os animais acolhidos pela associação.'
  const valorMinimo = settings.socios_valor_minimo.trim()
  const ctaTitulo =
    settings.socios_cta_titulo.trim() || 'Faça parte dessa corrente de cuidado'
  const ctaSubtitulo =
    settings.socios_cta_subtitulo.trim() ||
    'Preencha seus dados e nossa equipe entra em contato para combinar a melhor forma de contribuição.'

  return (
    <div className="bg-[var(--color-bg)]">
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,0.7fr)] lg:gap-10 lg:px-8">
        <div>
          <BrandLogo compact className="mb-8" />
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-primary)]">
            Comunidade Amiga Miau
          </p>
          <h1 className="max-w-[14ch] text-4xl font-extrabold tracking-tight text-[var(--color-text-main)] sm:text-5xl">
            {titulo}
          </h1>
          <p className="mt-5 max-w-prose whitespace-pre-line text-lg leading-8 text-[var(--color-text-muted)]">
            {texto}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[var(--radius-card)] border border-white/10 bg-[rgba(17,24,39,0.78)] p-5 shadow-[var(--shadow-soft)]">
              <p className="text-sm font-semibold text-[var(--color-text-muted)]">
                Valor mínimo mensal
              </p>
              <p className="mt-2 text-3xl font-extrabold text-[var(--color-primary)]">
                {valorMinimo || 'A combinar'}
              </p>
              <p className="mt-2 text-sm leading-7 text-[var(--color-text-muted)]">
                A equipe combina os detalhes após receber seu cadastro.
              </p>
            </div>

            <div className="rounded-[var(--radius-card)] border border-white/10 bg-[rgba(17,24,39,0.78)] p-5 shadow-[var(--shadow-soft)]">
              <p className="text-sm font-semibold text-[var(--color-text-muted)]">
                Como funciona
              </p>
              <p className="mt-2 text-sm leading-7 text-[var(--color-text-muted)]">
                Você envia seus dados, a equipe entra em contato pelo WhatsApp e orienta os próximos passos.
              </p>
            </div>
          </div>

          <div className="mt-8">
            <Link
              href="/animais"
              className="inline-flex rounded-[var(--radius-button)] border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-[var(--color-text-main)] transition duration-200 hover:border-[rgba(244,184,96,0.24)] hover:text-[var(--color-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]"
            >
              Conhecer animais disponíveis
            </Link>
          </div>
        </div>

        <div className="lg:pl-2">
          <div className="mb-4 rounded-[var(--radius-card)] border border-[rgba(244,184,96,0.18)] bg-[rgba(244,184,96,0.12)] p-4 text-[var(--color-text-main)] sm:p-5">
            <h2 className="text-lg font-bold">{ctaTitulo}</h2>
            <p className="mt-2 text-sm leading-7 text-white/78">
              {ctaSubtitulo}
            </p>
          </div>
          <MembershipForm />
        </div>
      </section>
    </div>
  )
}
