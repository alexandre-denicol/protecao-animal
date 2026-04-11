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
      className="inline-flex items-center rounded-lg border border-[rgba(252,165,165,0.22)] px-3 py-1.5 text-xs font-semibold text-[#fca5a5] transition-colors hover:bg-[rgba(248,113,113,0.12)] disabled:opacity-50 focus:outline-2 focus:outline-[#fca5a5] focus:outline-offset-2"
    >
      {isPending ? 'Excluindo…' : 'Excluir'}
    </button>
  )
}
