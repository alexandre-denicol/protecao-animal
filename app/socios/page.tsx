import type { Metadata } from 'next'
import Link from 'next/link'
import { getPublicSiteSettings } from '@/lib/site-settings'
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
    <main className="bg-neutral-50">
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,0.7fr)] lg:px-8">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary-500">
            Comunidade Amiga Miau
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-neutral-800 sm:text-5xl">
            {titulo}
          </h1>
          <p className="mt-5 max-w-prose whitespace-pre-line text-lg leading-relaxed text-neutral-600">
            {texto}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-5 shadow-md">
              <p className="text-sm font-semibold text-neutral-500">
                Valor mínimo mensal
              </p>
              <p className="mt-2 text-3xl font-extrabold text-primary-600">
                {valorMinimo || 'A combinar'}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                A equipe combina os detalhes após receber seu cadastro.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-md">
              <p className="text-sm font-semibold text-neutral-500">
                Como funciona
              </p>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                Você envia seus dados, a equipe entra em contato pelo WhatsApp e orienta os próximos passos.
              </p>
            </div>
          </div>

          <div className="mt-8">
            <Link
              href="/animais"
              className="inline-flex text-sm font-bold text-primary-600 transition-colors hover:text-primary-700 focus-visible:outline-2 focus-visible:outline-primary-300"
            >
              Conhecer animais disponíveis
            </Link>
          </div>
        </div>

        <div>
          <div className="mb-4 rounded-2xl bg-primary-50 p-5 text-primary-900">
            <h2 className="text-lg font-bold">{ctaTitulo}</h2>
            <p className="mt-2 text-sm leading-relaxed text-primary-800">
              {ctaSubtitulo}
            </p>
          </div>
          <MembershipForm />
        </div>
      </section>
    </main>
  )
}
