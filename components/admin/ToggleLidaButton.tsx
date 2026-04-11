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
          ? 'border border-white/10 bg-white/5 text-[var(--color-text-muted)] hover:bg-white/10'
          : 'border border-[rgba(244,184,96,0.24)] bg-[rgba(244,184,96,0.14)] text-[var(--color-primary)] hover:bg-[rgba(244,184,96,0.22)]'
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
