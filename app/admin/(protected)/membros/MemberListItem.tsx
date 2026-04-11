'use client'

import {
  formatCurrencyBR,
  formatDateBR,
  formatPhoneBR,
} from '@/lib/membership'
import type { Member, MemberStatus } from '@/types'

const STATUS_META: Record<MemberStatus, { label: string; className: string }> = {
  pendente: {
    label: 'Pendente',
    className: 'bg-neutral-100 text-neutral-600',
  },
  contatado: {
    label: 'Contatado',
    className: 'bg-blue-100 text-blue-700',
  },
  ativo: {
    label: 'Ativo',
    className: 'bg-green-100 text-green-700',
  },
  inadimplente: {
    label: 'Inadimplente',
    className: 'bg-red-100 text-red-700',
  },
  cancelado: {
    label: 'Cancelado',
    className: 'bg-neutral-200 text-neutral-600',
  },
}

function isDueSoon(date: string | null): boolean {
  if (!date) return false

  const today = new Date()
  const current = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  )
  const due = new Date(`${date}T00:00:00`)

  if (Number.isNaN(due.getTime())) return false

  const diffInMs = due.getTime() - current.getTime()
  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24))

  return diffInDays >= 0 && diffInDays <= 3
}

function StatusBadge({ status }: { status: MemberStatus }) {
  const meta = STATUS_META[status]

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${meta.className}`}
    >
      {meta.label}
    </span>
  )
}

export default function MemberListItem({
  member,
  hasEmail,
  isExpanded,
  onToggle,
  onSendChargeEmail,
  chargeWhatsAppUrl,
  isBusy,
  isChargeEmailLoading,
}: {
  member: Member
  hasEmail: boolean
  isExpanded: boolean
  onToggle: () => void
  onSendChargeEmail: () => void
  chargeWhatsAppUrl: string | null
  isBusy: boolean
  isChargeEmailLoading: boolean
}) {
  const dueSoon = isDueSoon(member.proximo_vencimento_em)
  const showOverdueStyle = member.status === 'inadimplente'

  return (
    <div
      className={`rounded-2xl border bg-white shadow-sm transition-colors ${
        showOverdueStyle
          ? 'border-red-200'
          : dueSoon
            ? 'border-amber-200'
            : 'border-neutral-100'
      }`}
    >
      <div className="grid gap-4 px-4 py-4 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1.5fr)_auto] lg:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-bold text-neutral-800 sm:text-lg">
              {member.nome}
            </h2>
            <StatusBadge status={member.status} />
            {dueSoon && member.status !== 'inadimplente' && (
              <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">
                Vence em breve
              </span>
            )}
          </div>

          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-neutral-500">
            <span>
              {member.cidade}/{member.estado}
            </span>
            <span aria-hidden="true">•</span>
            <span>{formatPhoneBR(member.whatsapp)}</span>
            <span aria-hidden="true">•</span>
            <span className={member.email ? 'text-neutral-600' : 'text-neutral-400'}>
              {member.email ?? 'Sem email'}
            </span>
          </div>
        </div>

        <div className="grid gap-2 text-sm text-neutral-600 sm:grid-cols-3 lg:grid-cols-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Mensalidade
            </p>
            <p className="mt-1 font-semibold text-neutral-800">
              {formatCurrencyBR(member.valor_mensal)}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Último pagamento
            </p>
            <p className="mt-1">{formatDateBR(member.ultimo_pagamento_em)}</p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Próximo vencimento
            </p>
            <p
              className={`mt-1 ${
                showOverdueStyle
                  ? 'font-semibold text-red-700'
                  : dueSoon
                    ? 'font-semibold text-amber-700'
                    : ''
              }`}
            >
              {formatDateBR(member.proximo_vencimento_em)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 lg:justify-end">
          {chargeWhatsAppUrl ? (
            <a
              href={chargeWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg bg-amber-100 px-3 py-2 text-sm font-bold text-amber-700 transition-colors hover:bg-amber-200 focus:outline-2 focus:outline-amber-300 focus:outline-offset-2"
            >
              WhatsApp cobrança
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex items-center justify-center rounded-lg bg-neutral-100 px-3 py-2 text-sm font-bold text-neutral-400"
            >
              WhatsApp indisponível
            </button>
          )}

          <button
            type="button"
            disabled={isBusy || !hasEmail}
            onClick={onSendChargeEmail}
            className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold transition-colors focus:outline-2 focus:outline-primary-300 focus:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
              hasEmail
                ? 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                : 'bg-neutral-100 text-neutral-400'
            }`}
          >
            {isChargeEmailLoading && (
              <span
                aria-hidden="true"
                className="block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"
              />
            )}
            {hasEmail ? (isChargeEmailLoading ? 'Enviando...' : 'Email cobrança') : 'Email não disponível'}
          </button>

          <button
            type="button"
            onClick={onToggle}
            className="inline-flex items-center justify-center rounded-lg bg-neutral-800 px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-neutral-700 focus:outline-2 focus:outline-neutral-300 focus:outline-offset-2"
          >
            {isExpanded ? 'Ocultar detalhes' : 'Ver detalhes'}
          </button>
        </div>
      </div>
    </div>
  )
}
