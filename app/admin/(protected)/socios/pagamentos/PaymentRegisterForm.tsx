'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { Member } from '@/types'
import { registerMemberPaymentDetailedAction } from '../../membros/actions'

interface ToastState {
  type: 'success' | 'error'
  message: string
}

function todayIso(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function isoToBrazilianDate(value: string): string {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)

  if (!match) return ''

  const [, year, month, day] = match
  return `${day}/${month}/${year}`
}

function brazilianDateToIso(value: string): string | null {
  const trimmed = value.trim()
  const match = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)

  if (!match) return null

  const [, day, month, year] = match
  const dayNumber = Number(day)
  const monthNumber = Number(month)

  if (monthNumber < 1 || monthNumber > 12 || dayNumber < 1 || dayNumber > 31) {
    return null
  }

  return `${year}-${month}-${day}`
}

function currentCompetenceMonth(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')

  return `${year}-${month}`
}

function clearField(form: HTMLFormElement, name: string) {
  const field = form.elements.namedItem(name)

  if (field instanceof HTMLInputElement) {
    field.value = ''
  }
}

export default function PaymentRegisterForm({ members }: { members: Member[] }) {
  const router = useRouter()
  const [toast, setToast] = useState<ToastState | null>(null)
  const [isPending, startTransition] = useTransition()
  const [paidAt, setPaidAt] = useState(() => isoToBrazilianDate(todayIso()))

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const paidAtIso = brazilianDateToIso(paidAt)

    setToast(null)

    if (!paidAtIso) {
      setToast({
        type: 'error',
        message: 'Informe a data de pagamento no formato DD/MM/AAAA.',
      })
      return
    }

    formData.set('pago_em', paidAtIso)

    startTransition(async () => {
      const result = await registerMemberPaymentDetailedAction(formData)

      if (result.error) {
        setToast({ type: 'error', message: result.error })
        return
      }

      setToast({ type: 'success', message: result.success || 'Pagamento registrado' })
      clearField(form, 'valor')
      clearField(form, 'observacoes')
      router.refresh()
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="admin-panel p-5"
    >
      <div className="mb-4">
        <h2 className="text-lg font-semibold tracking-[-0.03em] text-[var(--color-text-main)]">Registrar pagamento</h2>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Cada pagamento fica no histórico do sócio.
        </p>
      </div>

      {toast && (
        <div
          role={toast.type === 'error' ? 'alert' : 'status'}
          className={`mb-4 rounded-lg border px-3 py-2 text-sm font-semibold ${
            toast.type === 'success'
              ? 'border-[rgba(113,211,205,0.24)] bg-[rgba(31,111,107,0.16)] text-[#8de0d9]'
              : 'border-[rgba(252,165,165,0.22)] bg-[rgba(248,113,113,0.12)] text-[#fca5a5]'
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label htmlFor="member_id" className="admin-label">
            Sócio
          </label>
          <select
            id="member_id"
            name="member_id"
            required
            disabled={isPending}
            className="admin-select disabled:opacity-60"
          >
            <option value="">Selecione</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="valor" className="admin-label">
            Valor
          </label>
          <input
            id="valor"
            name="valor"
            type="text"
            inputMode="decimal"
            required
            disabled={isPending}
            placeholder="Ex: 20,00"
            className="admin-input disabled:opacity-60"
          />
        </div>

        <div>
          <label htmlFor="metodo" className="admin-label">
            Método
          </label>
          <input
            id="metodo"
            name="metodo"
            type="text"
            required
            disabled={isPending}
            defaultValue="PIX"
            className="admin-input disabled:opacity-60"
          />
        </div>

        <div>
          <label htmlFor="pago_em" className="admin-label">
            Pago em
          </label>
          <input
            id="pago_em"
            name="pago_em"
            type="text"
            required
            disabled={isPending}
            value={paidAt}
            onChange={(event) => setPaidAt(event.target.value)}
            placeholder="DD/MM/AAAA"
            className="admin-input disabled:opacity-60"
          />
        </div>

        <div>
          <label htmlFor="competencia_mes" className="admin-label">
            Competência
          </label>
          <input
            id="competencia_mes"
            name="competencia_mes"
            type="month"
            required
            disabled={isPending}
            defaultValue={currentCompetenceMonth()}
            className="admin-input disabled:opacity-60"
          />
        </div>

        <div>
          <label htmlFor="observacoes" className="admin-label">
            Observações
          </label>
          <input
            id="observacoes"
            name="observacoes"
            type="text"
            disabled={isPending}
            placeholder="Opcional"
            className="admin-input disabled:opacity-60"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-5 text-[var(--color-text-muted)]">
          O formulário mantém sócio, método e competência após salvar para acelerar lançamentos em sequência.
        </p>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-bold text-[#1f1406] transition-colors hover:bg-[var(--color-primary-hover)] focus:outline-2 focus:outline-[var(--color-primary)] focus:outline-offset-2 disabled:cursor-wait disabled:opacity-60"
        >
          {isPending ? 'Salvando...' : 'Registrar pagamento'}
        </button>
      </div>
    </form>
  )
}
