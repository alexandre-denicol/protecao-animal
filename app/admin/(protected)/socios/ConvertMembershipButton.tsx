'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { convertMembershipInterest } from './actions'

export default function ConvertMembershipButton({ id }: { id: string }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    setError(null)

    startTransition(async () => {
      const result = await convertMembershipInterest(id)

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
        className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary-300 px-3 py-1.5 text-xs font-bold text-primary-900 transition-colors hover:bg-primary-400 focus:outline-2 focus:outline-primary-300 focus:outline-offset-2 disabled:opacity-50"
      >
        {isPending && (
          <span
            aria-label="Convertendo..."
            className="block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
        )}
        Converter em sócio
      </button>
      {error && (
        <p className="max-w-44 text-xs text-salmon-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
