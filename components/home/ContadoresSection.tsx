'use client'

import { useEffect, useRef, useState } from 'react'

interface DadosContador {
  valor: number
  sufixo: string
  label: string
  descricao: string
  icone: React.ReactNode
}

const contadores: DadosContador[] = [
  {
    valor: 847,
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
    valor: 623,
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
    valor: 24,
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
    <div className="flex flex-1 flex-col items-center px-6 py-10 text-center">
      {/* Ícone */}
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-500">
        {dados.icone}
      </div>

      {/* Número animado */}
      <p className="text-5xl font-extrabold tabular-nums text-neutral-800 lg:text-6xl">
        {atual.toLocaleString('pt-BR')}
        <span className="text-primary-400">{dados.sufixo}</span>
      </p>

      {/* Label */}
      <p className="mt-2 text-base font-semibold text-neutral-700">{dados.label}</p>

      {/* Descrição */}
      <p className="mt-1 max-w-[180px] text-sm leading-relaxed text-neutral-400">{dados.descricao}</p>
    </div>
  )
}

export default function ContadoresSection() {
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
    <section ref={refSecao} className="bg-white py-4">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col divide-y divide-neutral-100 sm:flex-row sm:divide-x sm:divide-y-0">
          {contadores.map((item) => (
            <ItemContador key={item.label} dados={item} iniciar={iniciar} />
          ))}
        </div>
      </div>
    </section>
  )
}
