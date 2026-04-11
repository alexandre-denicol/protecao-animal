'use client'

import { useRef, useState, useTransition } from 'react'
import PhoneNumberField from '@/components/forms/PhoneNumberField'
import { type PhoneCountry, validatePhoneNumber } from '@/lib/whatsapp'
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
  return <p className="mt-2 text-xs leading-5 text-salmon-600">{msg}</p>
}

function inputClass(hasError?: boolean) {
  return `w-full rounded-[var(--radius-button)] border px-4 py-3 text-sm text-[var(--color-text-main)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] ${
    hasError
      ? 'border-salmon-400 bg-[rgba(127,29,29,0.18)]'
      : 'border-white/10 bg-[rgba(255,255,255,0.03)]'
  }`
}

export default function AdoptionInterestForm({ animalId, animalNome }: Props) {
  const formRef = useRef<HTMLFormElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [state, setState] = useState<AdoptionInterestState>({})
  const [phoneCountry, setPhoneCountry] = useState<PhoneCountry>('BR')
  const [phoneValue, setPhoneValue] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const phoneError = validatePhoneNumber(phoneValue, phoneCountry, {
      required: false,
      label: 'um telefone',
    })

    if (phoneError) {
      setState({
        fieldErrors: {
          ...state.fieldErrors,
          telefone: phoneError,
        },
      })
      return
    }

    startTransition(async () => {
      const result = await createAdoptionInterestAction(formData)
      setState(result)

      if (result.success) {
        formRef.current?.reset()
        setPhoneCountry('BR')
        setPhoneValue('')
      }
    })
  }

  return (
    <div className="mt-8">
      {!isOpen && (
        <button
          type="button"
          data-testid="adoption-open-form"
          onClick={() => {
            setIsOpen(true)
            setState({})
          }}
          className="inline-flex w-full items-center justify-center rounded-[var(--radius-button)] bg-[var(--color-primary)] px-6 py-3.5 text-sm font-bold text-neutral-950 transition duration-200 hover:bg-[var(--color-primary-hover)] focus:outline-2 focus:outline-[var(--color-primary)] focus:outline-offset-2 focus:outline-offset-[var(--color-surface-1)]"
        >
          Quero adotar
        </button>
      )}

      {isOpen && (
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          noValidate
          data-testid="adoption-interest-form"
          className="rounded-[var(--radius-card)] border border-white/10 bg-[rgba(17,24,39,0.82)] p-4 shadow-[var(--shadow-soft)] sm:p-5"
        >
          <input type="hidden" name="animal_id" value={animalId} />

          <div className="mb-5">
            <h2 className="text-lg font-bold text-[var(--color-text-main)]">
              Quero adotar {animalNome}
            </h2>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Conte um pouco sobre você para a nossa equipe continuar a conversa.
            </p>
          </div>

          {state.error && (
            <div
              role="alert"
              className="mb-4 rounded-[var(--radius-button)] border border-salmon-400/40 bg-[rgba(127,29,29,0.22)] px-4 py-3 text-sm text-[#fecaca]"
            >
              {state.error}
            </div>
          )}

          {state.success && state.message && (
            <div
              role="status"
              className="mb-4 rounded-[var(--radius-button)] border border-[rgba(31,111,107,0.35)] bg-[rgba(31,111,107,0.18)] px-4 py-3 text-sm font-semibold text-[#a7f3d0]"
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

            <PhoneNumberField
              id="telefone"
              label="Telefone"
              name="telefone"
              countryName="telefone_country"
              value={phoneValue}
              country={phoneCountry}
              error={state.fieldErrors?.telefone}
              onValueChange={setPhoneValue}
              onCountryChange={setPhoneCountry}
            />

            <div>
              <label htmlFor="mensagem" className="block text-sm font-semibold text-[var(--color-text-main)]">
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

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false)
                setState({})
              }}
              className="inline-flex items-center justify-center rounded-[var(--radius-button)] border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-[var(--color-text-main)] transition duration-200 hover:border-[rgba(244,184,96,0.25)] hover:text-[var(--color-primary)]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              data-testid="adoption-submit"
              className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--color-primary)] px-6 py-2.5 text-sm font-bold text-neutral-950 transition duration-200 hover:bg-[var(--color-primary-hover)] focus:outline-2 focus:outline-[var(--color-primary)] focus:outline-offset-2 focus:outline-offset-[var(--color-surface-1)] disabled:opacity-50"
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
