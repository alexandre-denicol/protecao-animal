'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteAdocaoAction } from '@/app/admin/(protected)/portfolio/actions'

interface Props {
  id: string
  nome: string
}

export default function DeleteAdocaoButton({ id, nome }: Props) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleClick() {
    if (!confirm(`Tem certeza que deseja excluir o caso de "${nome}"? Esta ação não pode ser desfeita.`)) {
      return
    }

    startTransition(async () => {
      const result = await deleteAdocaoAction(id)
      if (result.error) {
        alert(result.error)
      } else {
        router.refresh()
      }
    })
  }

  return (
    <button
      disabled={isPending}
      onClick={handleClick}
      className="inline-flex items-center rounded-lg border border-salmon-200 px-3 py-1.5 text-xs font-semibold text-salmon-600 transition-colors hover:bg-salmon-50 disabled:opacity-50 focus:outline-2 focus:outline-salmon-300 focus:outline-offset-2"
    >
      {isPending ? 'Excluindo…' : 'Excluir'}
    </button>
  )
}
