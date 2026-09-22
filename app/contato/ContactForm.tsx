'use client'

import { useRef, useState, useTransition } from 'react'
import Field, { fieldInputClass } from '@/components/forms/Field'
import { useFocusFirstInvalid } from '@/components/forms/useFocusFirstInvalid'
import {
  createContactMessageAction,
  type ContactMessageState,
} from './actions'

export default function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [state, setState] = useState<ContactMessageState>({})
  const [isPending, startTransition] = useTransition()

  useFocusFirstInvalid(formRef, state.fieldErrors)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await createContactMessageAction(formData)
      setState(result)

      if (result.success) {
        formRef.current?.reset()
      }
    })
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      data-testid="contact-form"
      className="rounded-[var(--radius-card)] border border-white/10 bg-[rgba(17,24,39,0.82)] p-5 shadow-[var(--shadow-soft)] backdrop-blur sm:p-8"
    >
      {state.error && (
        <div
          role="alert"
          className="mb-5 rounded-[var(--radius-button)] border border-salmon-400/40 bg-[rgba(127,29,29,0.22)] px-4 py-3 text-sm text-[#fecaca]"
        >
          {state.error}
        </div>
      )}

      {state.success && state.message && (
        <div
          role="status"
          className="mb-5 rounded-[var(--radius-button)] border border-[rgba(31,111,107,0.35)] bg-[rgba(31,111,107,0.18)] px-4 py-3 text-sm font-semibold text-[#a7f3d0]"
        >
          {state.message}
        </div>
      )}

      <div className="grid gap-4 sm:gap-5">
        <Field label="Nome" required error={state.fieldErrors?.nome}>
          {(control) => (
            <input
              {...control}
              name="nome"
              type="text"
              maxLength={100}
              autoComplete="name"
              className={fieldInputClass(Boolean(state.fieldErrors?.nome))}
            />
          )}
        </Field>

        <Field label="Email" required error={state.fieldErrors?.email}>
          {(control) => (
            <input
              {...control}
              name="email"
              type="email"
              maxLength={150}
              autoComplete="email"
              className={fieldInputClass(Boolean(state.fieldErrors?.email))}
            />
          )}
        </Field>

        <Field label="Assunto" required error={state.fieldErrors?.assunto}>
          {(control) => (
            <input
              {...control}
              name="assunto"
              type="text"
              maxLength={150}
              className={fieldInputClass(Boolean(state.fieldErrors?.assunto))}
            />
          )}
        </Field>

        <Field label="Mensagem" required error={state.fieldErrors?.mensagem}>
          {(control) => (
            <textarea
              {...control}
              name="mensagem"
              rows={6}
              maxLength={2000}
              className={`${fieldInputClass(Boolean(state.fieldErrors?.mensagem))} resize-none`}
            />
          )}
        </Field>
      </div>

      <button
        type="submit"
        disabled={isPending}
        data-testid="contact-submit"
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--color-primary)] px-6 py-3 text-sm font-bold text-neutral-950 transition duration-200 hover:bg-[var(--color-primary-hover)] focus:outline-2 focus:outline-[var(--color-primary)] focus:outline-offset-2 focus:outline-offset-[var(--color-surface-1)] disabled:opacity-50"
      >
        {isPending && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        Enviar mensagem
      </button>
    </form>
  )
}
