import type { Metadata } from 'next'
import BrandLogo from '@/components/BrandLogo'

export const metadata: Metadata = {
  title: 'Sobre Nós',
  description: 'Conheça a história e missão da Associação Amiga Miau.',
}

export default function SobrePage() {
  return (
    <main className="bg-[var(--color-bg)]">
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <BrandLogo className="mb-8" />

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.75fr)]">
          <div className="rounded-[var(--radius-card)] border border-white/10 bg-[rgba(17,24,39,0.8)] p-6 shadow-[var(--shadow-soft)] sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-primary)]">
              Sobre a associação
            </p>
            <h1 className="mt-3 max-w-[15ch] text-4xl font-extrabold tracking-tight text-[var(--color-text-main)] sm:text-5xl">
              Uma rede de cuidado construída com constância, afeto e responsabilidade
            </h1>
            <p className="mt-6 text-lg leading-8 text-[var(--color-text-muted)]">
              A Associação Amiga MiAu existe para acolher animais em situação de
              vulnerabilidade e aproximá-los de lares preparados para uma adoção
              consciente. Nosso trabalho une rotina, escuta e compromisso real com o
              bem-estar de cada história que chega até aqui.
            </p>
          </div>

          <div className="rounded-[var(--radius-card)] border border-[rgba(244,184,96,0.18)] bg-[rgba(244,184,96,0.1)] p-6 shadow-[var(--shadow-soft)] sm:p-8">
            <h2 className="text-2xl font-bold text-[var(--color-text-main)]">O que guia a Amiga MiAu</h2>
            <ul className="mt-6 space-y-5">
              {[
                'Resgatar com critério e cuidado, respeitando os limites da associação.',
                'Garantir acompanhamento de saúde, segurança e recuperação.',
                'Conduzir adoções com conversa, preparo e responsabilidade.',
                'Fortalecer uma comunidade que participa do cuidado no longo prazo.',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-[var(--color-text-muted)]">
                  <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[var(--color-primary)]" />
                  <span className="leading-7">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-3 lg:gap-6">
          {[
            {
              title: 'História',
              text: 'Cada resgate nos lembra que acolhimento exige estrutura, sensibilidade e continuidade.',
            },
            {
              title: 'Missão',
              text: 'Transformar urgência em cuidado estável, até que cada animal encontre um lar possível.',
            },
            {
              title: 'Equipe',
              text: 'Uma rede de pessoas que atua com carinho, organização e compromisso com a causa.',
            },
          ].map((item) => (
            <article
              key={item.title}
              className="rounded-[var(--radius-card)] border border-white/10 bg-[rgba(17,24,39,0.76)] p-6 shadow-[var(--shadow-soft)]"
            >
              <h2 className="text-xl font-bold text-[var(--color-text-main)]">{item.title}</h2>
              <p className="mt-3 leading-7 text-[var(--color-text-muted)]">{item.text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
