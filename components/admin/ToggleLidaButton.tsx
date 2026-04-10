'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  lida: boolean
  action: () => Promise<{ error?: string } | void>
}

export default function ToggleLidaButton({ lida, action }: Props) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleClick() {
    startTransition(async () => {
      await action()
      router.refresh()
    })
  }

  return (
    <button
      disabled={isPending}
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors focus:outline-2 focus:outline-primary-300 focus:outline-offset-2 disabled:opacity-50 ${
        lida
          ? 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
          : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
      }`}
    >
      {isPending ? (
        <span
          aria-label="Atualizando…"
          className="block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : lida ? (
        'Marcar não lida'
      ) : (
        'Marcar como lida'
      )}
    </button>
  )
}
