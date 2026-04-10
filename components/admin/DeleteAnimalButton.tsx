'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { excluirAnimalAction } from '@/app/admin/(protected)/animais/actions'

interface Props {
  id: string
  nome: string
}

export default function DeleteAnimalButton({ id, nome }: Props) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleClick() {
    if (
      !confirm(
        `Excluir "${nome}"? Todas as fotos serão removidas. Esta ação não pode ser desfeita.`
      )
    )
      return

    startTransition(async () => {
      const result = await excluirAnimalAction(id)
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
      className="rounded-lg border border-salmon-200 px-3 py-1.5 text-xs font-semibold text-salmon-600 transition-colors hover:bg-salmon-50 focus:outline-2 focus:outline-salmon-300 focus:outline-offset-2 disabled:opacity-50"
    >
      {isPending ? 'Excluindo…' : 'Excluir'}
    </button>
  )
}
