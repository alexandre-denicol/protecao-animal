'use client'

import { useId } from 'react'

export interface FieldControlProps {
  id: string
  required?: boolean
  'aria-invalid'?: true
  'aria-describedby'?: string
}

interface FieldProps {
  label: string
  required?: boolean
  hint?: string
  error?: string
  children: (control: FieldControlProps) => React.ReactNode
}

/**
 * Borda a 3:1 contra o fundo (WCAG 1.4.11) e anel de foco visível.
 * Use nos <input>, <textarea> e <select> dos formulários públicos.
 */
export function fieldInputClass(hasError?: boolean): string {
  return `w-full rounded-[var(--radius-button)] border px-4 py-3 text-sm text-[var(--color-text-main)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus-visible:ring-2 focus-visible:ring-[rgba(244,184,96,0.35)] ${
    hasError
      ? 'border-salmon-400 bg-[rgba(127,29,29,0.18)]'
      : 'border-white/35 bg-[rgba(255,255,255,0.03)]'
  }`
}

/**
 * Rótulo + controle + dica/erro, com IDs únicos (useId) e os atributos que
 * ligam tudo: for/id, aria-invalid e aria-describedby. O controle recebe esses
 * atributos por render prop, então cada formulário mantém seu próprio <input>.
 */
export default function Field({ label, required, hint, error, children }: FieldProps) {
  const id = useId()
  const messageId = `${id}-message`
  const hasMessage = Boolean(error || hint)

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-[var(--color-text-main)]">
        {label}
        {required && (
          <span aria-hidden="true" className="text-salmon-500">
            {' '}
            *
          </span>
        )}
      </label>

      {children({
        id,
        required,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': hasMessage ? messageId : undefined,
      })}

      {error ? (
        <p id={messageId} className="mt-2 text-xs leading-5 text-salmon-600">
          {error}
        </p>
      ) : (
        hint && (
          <p id={messageId} className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]">
            {hint}
          </p>
        )
      )}
    </div>
  )
}
