'use client'

import { useEffect, useRef, useState } from 'react'

interface DadosContador {
  valor: number
  sufixo: string
  label: string
  descricao: string
  icone: React.ReactNode
}

function ItemContador({ dados, iniciar }: { dados: DadosContador; iniciar: boolean }) {
  const [atual, setAtual] = useState(0)
  const animado = useRef(false)

  useEffect(() => {
    if (!iniciar || animado.current) return
    animado.current = true

    const duracao = 2000
    const inicio = performance.now()

    function animar(agora: number) {
      const progresso = Math.min((agora - inicio) / duracao, 1)
      const easeOut = 1 - Math.pow(1 - progresso, 3)
      setAtual(Math.round(easeOut * dados.valor))
      if (progresso < 1) requestAnimationFrame(animar)
    }

    requestAnimationFrame(animar)
  }, [iniciar, dados.valor])

  return (
    <div className="flex flex-1 flex-col items-start rounded-[var(--radius-card)] border border-white/8 bg-[rgba(17,24,39,0.72)] px-5 py-6 text-left shadow-[var(--shadow-soft)] sm:px-6 sm:py-8">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(244,184,96,0.18)] bg-[rgba(244,184,96,0.12)] text-[var(--color-primary)] sm:mb-5 sm:h-14 sm:w-14">
        {dados.icone}
      </div>

      <p className="text-4xl font-extrabold tabular-nums text-[var(--color-text-main)] sm:text-5xl lg:text-6xl">
        {atual.toLocaleString('pt-BR')}
        <span className="text-[var(--color-primary)]">{dados.sufixo}</span>
      </p>

      <p className="mt-3 text-base font-semibold text-[var(--color-text-main)]">{dados.label}</p>

      <p className="mt-2 max-w-[240px] text-sm leading-6 text-[var(--color-text-muted)] sm:leading-7">{dados.descricao}</p>
    </div>
  )
}

interface ContadoresSectionProps {
  resgatados: number
  adotados: number
  emEspera: number
}

function buildContadores(resgatados: number, adotados: number, emEspera: number): DadosContador[] {
  return [
    {
      valor: resgatados,
      sufixo: '+',
      label: 'Animais resgatados',
      descricao: 'Das ruas para o cuidado e amor que merecem',
      icone: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      valor: adotados,
      sufixo: '+',
      label: 'Adotados com amor',
      descricao: 'Histórias felizes que continuam acontecendo',
      icone: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      valor: emEspera,
      sufixo: '',
      label: 'Aguardando um lar',
      descricao: 'Prontos para se tornar parte da sua família',
      icone: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
          <polyline points="12 6 12 12 16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  ]
}

export default function ContadoresSection({ resgatados, adotados, emEspera }: ContadoresSectionProps) {
  const contadores = buildContadores(resgatados, adotados, emEspera)
  const [iniciar, setIniciar] = useState(false)
  const refSecao = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = refSecao.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIniciar(true)
          observer.disconnect()
        }
      },
      { threshold: 0.25 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={refSecao} className="bg-[var(--color-bg)] py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-3 lg:gap-5">
          {contadores.map((item) => (
            <ItemContador key={item.label} dados={item} iniciar={iniciar} />
          ))}
        </div>
      </div>
    </section>
  )
}
