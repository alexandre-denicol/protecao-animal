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
            ? 'border-green-200 bg-green-50 text-green-700'
            : status === 'em_processo'
              ? 'border-amber-200 bg-amber-50 text-amber-700'
              : 'border-neutral-200 bg-neutral-100 text-neutral-500'
        }`}
      >
        {OPCOES.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {erro && <p className="text-xs text-salmon-600">{erro}</p>}
    </div>
  )
}
