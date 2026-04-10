'use client'

import { useRef, useState, useTransition } from 'react'
import {
  createAdoptionInterestAction,
  type AdoptionInterestState,
} from './actions'

interface Props {
  animalId: string
  animalNome: string
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="mt-1 text-xs text-salmon-600">{msg}</p>
}

function inputClass(hasError?: boolean) {
  return `w-full rounded-xl border px-3 py-2.5 text-sm text-neutral-800 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100 ${
    hasError ? 'border-salmon-400 bg-salmon-50' : 'border-neutral-200 bg-white'
  }`
}

export default function AdoptionInterestForm({ animalId, animalNome }: Props) {
  const formRef = useRef<HTMLFormElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [state, setState] = useState<AdoptionInterestState>({})
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await createAdoptionInterestAction(formData)
      setState(result)

      if (result.success) {
        formRef.current?.reset()
      }
    })
  }

  return (
    <div className="mt-8">
      {!isOpen && (
        <button
          type="button"
          onClick={() => {
            setIsOpen(true)
            setState({})
          }}
          className="inline-flex w-full items-center justify-center rounded-xl bg-primary-300 px-6 py-3 text-sm font-bold text-primary-900 transition-colors hover:bg-primary-400 focus:outline-2 focus:outline-primary-300 focus:outline-offset-2"
        >
          Quero adotar
        </button>
      )}

      {isOpen && (
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          noValidate
          className="rounded-xl border border-neutral-100 bg-neutral-50 p-4"
        >
          <input type="hidden" name="animal_id" value={animalId} />

          <div className="mb-4">
            <h2 className="text-lg font-bold text-neutral-800">
              Quero adotar {animalNome}
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Conte um pouco sobre você para a nossa equipe continuar a conversa.
            </p>
          </div>

          {state.error && (
            <div
              role="alert"
              className="mb-4 rounded-xl border border-salmon-200 bg-salmon-50 px-4 py-3 text-sm text-salmon-700"
            >
              {state.error}
            </div>
          )}

          {state.success && state.message && (
            <div
              role="status"
              className="mb-4 rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 text-sm font-semibold text-primary-800"
            >
              {state.message}
            </div>
          )}

          <div className="grid gap-4">
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
              <label htmlFor="telefone" className="block text-sm font-semibold text-neutral-700">
                Telefone
              </label>
              <input
                id="telefone"
                name="telefone"
                type="tel"
                maxLength={20}
                className={inputClass(Boolean(state.fieldErrors?.telefone))}
              />
              <FieldError msg={state.fieldErrors?.telefone} />
            </div>

            <div>
              <label htmlFor="mensagem" className="block text-sm font-semibold text-neutral-700">
                Mensagem
              </label>
              <textarea
                id="mensagem"
                name="mensagem"
                rows={4}
                maxLength={1000}
                className={`${inputClass(Boolean(state.fieldErrors?.mensagem))} resize-none`}
              />
              <FieldError msg={state.fieldErrors?.mensagem} />
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false)
                setState({})
              }}
              className="inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-300 px-6 py-2.5 text-sm font-bold text-primary-900 transition-colors hover:bg-primary-400 focus:outline-2 focus:outline-primary-300 focus:outline-offset-2 disabled:opacity-50"
            >
              {isPending && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              )}
              Enviar interesse
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
