'use client'

import { useEffect, useRef, useState } from 'react'

interface DadosContador {
  valor: number
  sufixo: string
  label: string
}

function ItemContador({ dados, iniciar }: { dados: DadosContador; iniciar: boolean }) {
  const [atual, setAtual] = useState(0)
  const animado = useRef(false)

  useEffect(() => {
    if (!iniciar || animado.current) return
    animado.current = true

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setAtual(dados.valor)
      return
    }

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

  const valorFinal = `${dados.valor.toLocaleString('pt-BR')}${dados.sufixo}`

  return (
    <div className="flex flex-col-reverse gap-1 border-l border-[rgba(244,184,96,0.35)] pl-4 sm:pl-6">
      <dt className="text-sm font-medium text-[var(--color-text-muted)]">{dados.label}</dt>
      <dd className="font-display text-3xl font-extrabold tabular-nums leading-none text-[var(--color-text-main)] sm:text-4xl">
        {/* O número animado é decorativo; leitores de tela recebem o valor final */}
        <span aria-hidden="true">
          {atual.toLocaleString('pt-BR')}
          <span className="text-[var(--color-primary)]">{dados.sufixo}</span>
        </span>
        <span className="sr-only">{valorFinal}</span>
      </dd>
    </div>
  )
}

interface ContadoresSectionProps {
  resgatados: number
  adotados: number
  emEspera: number
}

/** Valor zero é o padrão de configuração; não vale exibir "0" como resultado. */
function buildContadores(resgatados: number, adotados: number, emEspera: number): DadosContador[] {
  return [
    { valor: resgatados, sufixo: '+', label: 'Animais resgatados' },
    { valor: adotados, sufixo: '+', label: 'Adotados com amor' },
    { valor: emEspera, sufixo: '', label: 'Aguardando um lar' },
  ].filter((contador) => contador.valor > 0)
}

export default function ContadoresSection({ resgatados, adotados, emEspera }: ContadoresSectionProps) {
  const contadores = buildContadores(resgatados, adotados, emEspera)
  const [iniciar, setIniciar] = useState(false)
  const refSecao = useRef<HTMLElement>(null)
  const semContadores = contadores.length === 0

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
  }, [semContadores])

  if (semContadores) return null

  return (
    <section
      ref={refSecao}
      aria-labelledby="resultados-titulo"
      className="bg-white/[0.025] py-8 sm:py-10"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="resultados-titulo" className="sr-only">
          Nossos resultados
        </h2>
        <dl className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-8">
          {contadores.map((item) => (
            <ItemContador key={item.label} dados={item} iniciar={iniciar} />
          ))}
        </dl>
      </div>
    </section>
  )
}
