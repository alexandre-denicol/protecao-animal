'use client'

import { useRef, useState, useTransition } from 'react'
import PhoneNumberField from '@/components/forms/PhoneNumberField'
import { UF_OPTIONS, onlyDigits } from '@/lib/membership'
import {
  type PhoneCountry,
  validatePhoneNumber,
} from '@/lib/whatsapp'
import {
  createMembershipInterestAction,
  type MembershipInterestState,
} from './actions'

type MembershipField =
  | 'nome'
  | 'email'
  | 'endereco'
  | 'cidade'
  | 'estado'
  | 'cpf'
  | 'whatsapp'
  | 'mensagem'

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="mt-1 text-xs text-salmon-600">{msg}</p>
}

function inputClass(hasError?: boolean) {
  return `w-full rounded-xl border px-3 py-2.5 text-sm text-neutral-800 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100 ${
    hasError ? 'border-salmon-400 bg-salmon-50' : 'border-neutral-200 bg-white'
  }`
}

function validateClient(formData: FormData): Partial<Record<MembershipField, string>> {
  const fieldErrors: Partial<Record<MembershipField, string>> = {}
  const nome = ((formData.get('nome') as string | null) ?? '').trim()
  const email = ((formData.get('email') as string | null) ?? '').trim()
  const endereco = ((formData.get('endereco') as string | null) ?? '').trim()
  const cidade = ((formData.get('cidade') as string | null) ?? '').trim()
  const estado = ((formData.get('estado') as string | null) ?? '').trim()
  const cpf = onlyDigits(((formData.get('cpf') as string | null) ?? '').trim())
  const whatsapp = ((formData.get('whatsapp') as string | null) ?? '').trim()
  const whatsappCountry =
    (((formData.get('whatsapp_country') as string | null) ?? 'BR').trim() as PhoneCountry)
  const mensagem = ((formData.get('mensagem') as string | null) ?? '').trim()

  if (nome.length < 2) fieldErrors.nome = 'Informe seu nome com pelo menos 2 caracteres.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fieldErrors.email = 'Informe um email válido.'
  if (endereco.length < 5) fieldErrors.endereco = 'Informe rua, número e bairro.'
  if (cidade.length < 2) fieldErrors.cidade = 'Informe sua cidade.'
  if (!estado) fieldErrors.estado = 'Selecione um estado.'
  if (cpf.length !== 11) fieldErrors.cpf = 'Informe um CPF com 11 dígitos.'
  const whatsappError = validatePhoneNumber(whatsapp, whatsappCountry, {
    label: 'um WhatsApp',
  })
  if (whatsappError) fieldErrors.whatsapp = whatsappError
  if (mensagem.length > 1000) fieldErrors.mensagem = 'A mensagem deve ter até 1000 caracteres.'

  return fieldErrors
}

function formatCpfInput(value: string): string {
  const digits = onlyDigits(value).slice(0, 11)

  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  }

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

export default function MembershipForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [state, setState] = useState<MembershipInterestState>({})
  const [cpfValue, setCpfValue] = useState('')
  const [whatsappCountry, setWhatsappCountry] = useState<PhoneCountry>('BR')
  const [whatsappValue, setWhatsappValue] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const fieldErrors = validateClient(formData)

    if (Object.keys(fieldErrors).length > 0) {
      setState({ fieldErrors })
      return
    }

    startTransition(async () => {
      const result = await createMembershipInterestAction(formData)
      setState(result)

      if (result.success) {
        formRef.current?.reset()
        setCpfValue('')
        setWhatsappCountry('BR')
        setWhatsappValue('')
      }
    })
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
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
            required
            minLength={2}
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
            required
            maxLength={160}
            placeholder="seuemail@exemplo.com"
            className={inputClass(Boolean(state.fieldErrors?.email))}
          />
          <FieldError msg={state.fieldErrors?.email} />
        </div>

        <div>
          <label htmlFor="endereco" className="block text-sm font-semibold text-neutral-700">
            Endereço <span className="text-salmon-500">*</span>
          </label>
          <input
            id="endereco"
            name="endereco"
            type="text"
            required
            minLength={5}
            maxLength={200}
            placeholder="Rua, número e bairro"
            className={inputClass(Boolean(state.fieldErrors?.endereco))}
          />
          <FieldError msg={state.fieldErrors?.endereco} />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="cidade" className="block text-sm font-semibold text-neutral-700">
              Cidade <span className="text-salmon-500">*</span>
            </label>
            <input
              id="cidade"
              name="cidade"
              type="text"
              required
              minLength={2}
              maxLength={100}
              className={inputClass(Boolean(state.fieldErrors?.cidade))}
            />
            <FieldError msg={state.fieldErrors?.cidade} />
          </div>

          <div>
            <label htmlFor="estado" className="block text-sm font-semibold text-neutral-700">
              Estado <span className="text-salmon-500">*</span>
            </label>
            <select
              id="estado"
              name="estado"
              required
              className={inputClass(Boolean(state.fieldErrors?.estado))}
            >
              <option value="">Selecione</option>
              {UF_OPTIONS.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </select>
            <FieldError msg={state.fieldErrors?.estado} />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="cpf" className="block text-sm font-semibold text-neutral-700">
              CPF <span className="text-salmon-500">*</span>
            </label>
            <input
              id="cpf"
              name="cpf"
              type="text"
              inputMode="numeric"
              required
              pattern="\d{3}\.?\d{3}\.?\d{3}-?\d{2}"
              maxLength={14}
              placeholder="000.000.000-00"
              value={cpfValue}
              onChange={(event) => setCpfValue(formatCpfInput(event.target.value))}
              className={inputClass(Boolean(state.fieldErrors?.cpf))}
            />
            <FieldError msg={state.fieldErrors?.cpf} />
          </div>

          <PhoneNumberField
            id="whatsapp"
            label="WhatsApp"
            name="whatsapp"
            countryName="whatsapp_country"
            required
            value={whatsappValue}
            country={whatsappCountry}
            error={state.fieldErrors?.whatsapp}
            onValueChange={setWhatsappValue}
            onCountryChange={setWhatsappCountry}
          />
        </div>

        <div>
          <label htmlFor="mensagem" className="block text-sm font-semibold text-neutral-700">
            Mensagem adicional
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

      <button
        type="submit"
        disabled={isPending}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-300 px-6 py-3 text-sm font-bold text-primary-900 transition-colors hover:bg-primary-400 focus:outline-2 focus:outline-primary-300 focus:outline-offset-2 disabled:opacity-50"
      >
        {isPending && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        Enviar cadastro
      </button>
    </form>
  )
}
