'use client'

import { useRef, useState, useTransition } from 'react'
import {
  createContactMessageAction,
  type ContactMessageState,
} from './actions'

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="mt-2 text-xs leading-5 text-salmon-600">{msg}</p>
}

function inputClass(hasError?: boolean) {
  return `w-full rounded-[var(--radius-button)] border px-4 py-3 text-sm text-[var(--color-text-main)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] ${
    hasError
      ? 'border-salmon-400 bg-[rgba(127,29,29,0.18)]'
      : 'border-white/10 bg-[rgba(255,255,255,0.03)]'
  }`
}

export default function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [state, setState] = useState<ContactMessageState>({})
  const [isPending, startTransition] = useTransition()

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
        <div>
          <label htmlFor="nome" className="block text-sm font-semibold text-[var(--color-text-main)]">
            Nome <span className="text-salmon-500">*</span>
          </label>
          <input
            id="nome"
            name="nome"
            type="text"
            maxLength={100}
            className={inputClass(Boolean(state.fieldErrors?.nome))}
          />
          <FieldError msg={state.fieldErrors?.nome} />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-[var(--color-text-main)]">
            Email <span className="text-salmon-500">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            maxLength={150}
            className={inputClass(Boolean(state.fieldErrors?.email))}
          />
          <FieldError msg={state.fieldErrors?.email} />
        </div>

        <div>
          <label htmlFor="assunto" className="block text-sm font-semibold text-[var(--color-text-main)]">
            Assunto <span className="text-salmon-500">*</span>
          </label>
          <input
            id="assunto"
            name="assunto"
            type="text"
            maxLength={150}
            className={inputClass(Boolean(state.fieldErrors?.assunto))}
          />
          <FieldError msg={state.fieldErrors?.assunto} />
        </div>

        <div>
          <label htmlFor="mensagem" className="block text-sm font-semibold text-[var(--color-text-main)]">
            Mensagem <span className="text-salmon-500">*</span>
          </label>
          <textarea
            id="mensagem"
            name="mensagem"
            rows={6}
            maxLength={2000}
            className={`${inputClass(Boolean(state.fieldErrors?.mensagem))} resize-none`}
          />
          <FieldError msg={state.fieldErrors?.mensagem} />
        </div>
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
