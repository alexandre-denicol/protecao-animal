'use client'

import {
  formatCurrencyBR,
  formatDateBR,
  formatPhoneBR,
} from '@/lib/membership'
import type { Member, MemberStatus } from '@/types'
import StatusBadge from '@/components/admin/StatusBadge'

const STATUS_META: Record<MemberStatus, { label: string; className: string }> = {
  pendente: {
    label: 'Pendente',
    className: 'neutral',
  },
  contatado: {
    label: 'Contatado',
    className: 'primary',
  },
  ativo: {
    label: 'Ativo',
    className: 'success',
  },
  inadimplente: {
    label: 'Inadimplente',
    className: 'danger',
  },
  cancelado: {
    label: 'Cancelado',
    className: 'neutral',
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

function MemberStatusBadge({ status }: { status: MemberStatus }) {
  const meta = STATUS_META[status]

  return (
    <StatusBadge tone={meta.className as 'neutral' | 'primary' | 'success' | 'danger'}>
      {meta.label}
    </StatusBadge>
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
      className={`admin-panel overflow-hidden transition-colors ${
        showOverdueStyle
          ? 'border-red-200'
          : dueSoon
            ? 'border-amber-200'
            : 'border-white/10'
      }`}
    >
      <div className="grid gap-4 px-4 py-4 xl:grid-cols-[minmax(0,2.2fr)_minmax(0,1.5fr)_auto] xl:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold tracking-[-0.03em] text-[var(--color-text-main)] sm:text-lg">
              {member.nome}
            </h2>
            <MemberStatusBadge status={member.status} />
            {dueSoon && member.status !== 'inadimplente' && (
              <StatusBadge tone="warning">
                Vence em breve
              </StatusBadge>
            )}
          </div>

          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-[var(--color-text-muted)]">
            <span>
              {member.cidade}/{member.estado}
            </span>
            <span aria-hidden="true">•</span>
            <span>{formatPhoneBR(member.whatsapp)}</span>
            <span aria-hidden="true">•</span>
            <span className={member.email ? 'text-[var(--color-text-main)]' : 'text-[var(--color-text-muted)]'}>
              {member.email ?? 'Sem email'}
            </span>
          </div>
        </div>

        <div className="grid gap-2 text-sm text-[var(--color-text-muted)] sm:grid-cols-3 xl:grid-cols-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              Mensalidade
            </p>
            <p className="mt-1 font-semibold text-[var(--color-text-main)]">
              {formatCurrencyBR(member.valor_mensal)}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              Último pagamento
            </p>
            <p className="mt-1">{formatDateBR(member.ultimo_pagamento_em)}</p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              Próximo vencimento
            </p>
            <p
              className={`mt-1 ${
                showOverdueStyle
                  ? 'font-semibold text-[#fca5a5]'
                  : dueSoon
                    ? 'font-semibold text-[var(--color-primary)]'
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
              className="admin-button-secondary px-3 py-2 text-sm"
            >
              WhatsApp cobrança
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="admin-button-muted px-3 py-2 text-sm opacity-50"
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
                ? 'border border-white/10 bg-white/5 text-[var(--color-text-main)] hover:bg-white/10'
                : 'border border-white/10 bg-white/5 text-[var(--color-text-muted)]'
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
            className="inline-flex items-center justify-center rounded-lg bg-[var(--color-primary)] px-3 py-2 text-sm font-bold text-[#1f1406] transition-colors hover:bg-[var(--color-primary-hover)] focus:outline-2 focus:outline-[var(--color-primary)] focus:outline-offset-2"
          >
            {isExpanded ? 'Ocultar detalhes' : 'Ver detalhes'}
          </button>
        </div>
      </div>
    </div>
  )
}
