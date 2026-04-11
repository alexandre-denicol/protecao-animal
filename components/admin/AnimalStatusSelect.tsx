'use client'

import { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import { alterarStatusAction } from '@/app/admin/(protected)/animais/actions'
import type { AnimalStatus } from '@/types'

interface Props {
  id: string
  status: AnimalStatus
}

const OPCOES: { value: AnimalStatus; label: string }[] = [
  { value: 'disponivel', label: 'Disponível' },
  { value: 'em_processo', label: 'Em processo' },
  { value: 'adotado', label: 'Adotado' },
]

export default function AnimalStatusSelect({ id, status }: Props) {
  const [isPending, startTransition] = useTransition()
  const [erro, setErro] = useState<string | null>(null)
  const router = useRouter()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const novoStatus = e.target.value as AnimalStatus
    setErro(null)

    startTransition(async () => {
      const result = await alterarStatusAction(id, novoStatus)
      if (result.error) {
        setErro(result.error)
      } else {
        router.refresh()
      }
    })
  }

  return (
    <div className="flex flex-col gap-0.5">
      <select
        defaultValue={status}
        onChange={handleChange}
        disabled={isPending}
        aria-label="Alterar status do animal"
        className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100 disabled:cursor-wait disabled:opacity-60 ${
          status === 'disponivel'
            ? 'border-[rgba(113,211,205,0.24)] bg-[rgba(31,111,107,0.16)] text-[#8de0d9]'
            : status === 'em_processo'
              ? 'border-[rgba(244,184,96,0.24)] bg-[rgba(244,184,96,0.14)] text-[var(--color-primary)]'
              : 'border-white/10 bg-white/5 text-[var(--color-text-muted)]'
        }`}
      >
        {OPCOES.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {erro && <p className="text-xs text-[#fca5a5]">{erro}</p>}
    </div>
  )
}
