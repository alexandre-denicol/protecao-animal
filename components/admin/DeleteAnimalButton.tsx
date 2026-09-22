'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { excluirAnimalAction } from '@/app/admin/(protected)/animais/actions'
import { nomeDisplay } from '@/lib/animal-format'

interface Props {
  id: string
  nome: string | null
}

export default function DeleteAnimalButton({ id, nome }: Props) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleClick() {
    if (
      !confirm(
        `Excluir "${nomeDisplay(nome)}"? Todas as fotos serão removidas. Esta ação não pode ser desfeita.`
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
      className="rounded-lg border border-[rgba(252,165,165,0.22)] px-3 py-1.5 text-xs font-semibold text-[#fca5a5] transition-colors hover:bg-[rgba(248,113,113,0.12)] focus:outline-2 focus:outline-[#fca5a5] focus:outline-offset-2 disabled:opacity-50"
    >
      {isPending ? 'Excluindo…' : 'Excluir'}
    </button>
  )
}
