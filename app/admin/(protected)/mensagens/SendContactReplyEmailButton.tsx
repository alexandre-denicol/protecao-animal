'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { sendContactReplyEmail } from './actions'

export default function SendContactReplyEmailButton({
  id,
  disabled,
}: {
  id: string
  disabled: boolean
}) {
  const router = useRouter()
  const [message, setMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (disabled) return

    setMessage(null)
    setIsError(false)

    startTransition(async () => {
      const result = await sendContactReplyEmail(id)

      if (result.error) {
        setIsError(true)
        setMessage(result.error)
        return
      }

      setMessage(result.success ?? 'Email enviado.')
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        disabled={disabled || isPending}
        onClick={handleClick}
        className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors focus:outline-2 focus:outline-primary-300 focus:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
          disabled
            ? 'border border-white/10 bg-white/5 text-[var(--color-text-muted)]'
            : 'border border-white/10 bg-white/5 text-[var(--color-text-main)] hover:bg-white/10'
        }`}
      >
        {isPending && (
          <span
            aria-label="Enviando..."
            className="block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
        )}
        {disabled ? 'Email não disponível' : isPending ? 'Enviando...' : 'Responder por email'}
      </button>

      {message && (
        <p
          className={`max-w-40 text-xs ${isError ? 'text-[#fca5a5]' : 'text-[#8de0d9]'}`}
          role={isError ? 'alert' : 'status'}
        >
          {message}
        </p>
      )}
    </div>
  )
}
