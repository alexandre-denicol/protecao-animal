'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { markMessageAsRead } from './actions'

export default function MarkMessageAsReadButton({ id }: { id: string }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    setError(null)

    startTransition(async () => {
      const result = await markMessageAsRead(id)

      if (result.error) {
        setError(result.error)
        return
      }

      router.refresh()
    })
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        disabled={isPending}
        onClick={handleClick}
        data-testid="mark-message-read"
        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[rgba(244,184,96,0.24)] bg-[rgba(244,184,96,0.14)] px-3 py-1.5 text-xs font-semibold text-[var(--color-primary)] transition-colors hover:bg-[rgba(244,184,96,0.22)] focus:outline-2 focus:outline-primary-300 focus:outline-offset-2 disabled:opacity-50"
      >
        {isPending && (
          <span
            aria-label="Atualizando..."
            className="block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
        )}
        Marcar como lida
      </button>
      {error && (
        <p className="max-w-40 text-xs text-[#fca5a5]" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
