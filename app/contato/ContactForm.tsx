'use client'

import { useRef, useState, useTransition } from 'react'
import {
  createContactMessageAction,
  type ContactMessageState,
} from './actions'

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="mt-1 text-xs text-salmon-600">{msg}</p>
}

function inputClass(hasError?: boolean) {
  return `w-full rounded-xl border px-3 py-2.5 text-sm text-neutral-800 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100 ${
    hasError ? 'border-salmon-400 bg-salmon-50' : 'border-neutral-200 bg-white'
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
      className="rounded-2xl bg-white p-6 shadow-md sm:p-8"
    >
      {state.error && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-salmon-200 bg-salmon-50 px-4 py-3 text-sm text-salmon-700"
        >
          {state.error}
        </div>
      )}

      {state.success && state.message && (
        <div
          role="status"
          className="mb-5 rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 text-sm font-semibold text-primary-800"
        >
          {state.message}
        </div>
      )}

      <div className="grid gap-5">
        <div>
          <label htmlFor="nome" className="block text-sm font-semibold text-neutral-700">
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
          <label htmlFor="email" className="block text-sm font-semibold text-neutral-700">
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
          <label htmlFor="assunto" className="block text-sm font-semibold text-neutral-700">
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
          <label htmlFor="mensagem" className="block text-sm font-semibold text-neutral-700">
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
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-300 px-6 py-3 text-sm font-bold text-primary-900 transition-colors hover:bg-primary-400 focus:outline-2 focus:outline-primary-300 focus:outline-offset-2 disabled:opacity-50"
      >
        {isPending && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        Enviar mensagem
      </button>
    </form>
  )
}
