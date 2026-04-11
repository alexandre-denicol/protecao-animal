'use client'

import {
  contactChannelLabel,
  contactTypeLabel,
  formatContactDateBR,
} from '@/lib/membership'
import type {
  Member,
  MemberContactHistory,
  MemberContactType,
  MemberStatus,
} from '@/types'

function LoadingDot() {
  return (
    <span
      aria-hidden="true"
      className="block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"
    />
  )
}

function ActionButton({
  children,
  disabled,
  isLoading,
  loadingText,
  className,
  onClick,
}: {
  children: React.ReactNode
  disabled: boolean
  isLoading: boolean
  loadingText: string
  className: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold transition-colors focus:outline-2 focus:outline-primary-300 focus:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {isLoading && <LoadingDot />}
      {isLoading ? loadingText : children}
    </button>
  )
}

export default function MemberDetails({
  member,
  contacts,
  hasEmail,
  welcomeWhatsAppUrl,
  chargeWhatsAppUrl,
  isBusy,
  pendingAction,
  onSendWelcomeEmail,
  onSendChargeEmail,
  onRegisterWhatsAppContact,
  onRegisterPayment,
  onStatusChange,
  onPaymentSubmit,
}: {
  member: Member
  contacts: MemberContactHistory[]
  hasEmail: boolean
  welcomeWhatsAppUrl: string | null
  chargeWhatsAppUrl: string | null
  isBusy: boolean
  pendingAction: string | null
  onSendWelcomeEmail: () => void
  onSendChargeEmail: () => void
  onRegisterWhatsAppContact: (
    type: Extract<MemberContactType, 'boas_vindas' | 'cobranca'>
  ) => void
  onRegisterPayment: () => void
  onStatusChange: (status: Extract<MemberStatus, 'ativo' | 'inadimplente' | 'cancelado'>) => void
  onPaymentSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}) {
  const recentContacts = contacts.slice(0, 3)

  return (
    <div className="border-t border-white/10 bg-[rgba(255,255,255,0.03)] px-4 py-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <section className="grid gap-4">
          <div className="admin-panel-muted p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              Observações do cadastro
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-text-main)]">
              {member.observacoes || 'Sem observações adicionais.'}
            </p>
          </div>

          <div className="admin-panel-muted p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              Últimos contatos
            </p>
            {recentContacts.length === 0 ? (
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                Nenhum contato registrado ainda.
              </p>
            ) : (
              <div className="mt-3 grid gap-2">
                {recentContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex flex-col gap-0.5 text-xs text-[var(--color-text-muted)] sm:flex-row sm:items-center sm:gap-2"
                  >
                    <span className="font-bold text-[var(--color-text-main)]">
                      {contactChannelLabel(contact.canal)}
                    </span>
                    <span className="hidden sm:inline" aria-hidden="true">•</span>
                    <span>{contactTypeLabel(contact.tipo)}</span>
                    <span className="hidden sm:inline" aria-hidden="true">•</span>
                    <time dateTime={contact.created_at}>
                      {formatContactDateBR(contact.created_at)}
                    </time>
                    <span className="hidden sm:inline" aria-hidden="true">•</span>
                    <span className="truncate">{contact.destinatario}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="grid gap-4">
          <div className="admin-panel-muted p-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              Comunicação
            </p>
            <div className="flex flex-wrap gap-2">
              {welcomeWhatsAppUrl ? (
                <a
                  href={welcomeWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="admin-button-secondary px-3 py-2 text-sm"
                >
                  WhatsApp boas-vindas
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

              <ActionButton
                disabled={isBusy || !hasEmail}
                isLoading={pendingAction === 'email:boas_vindas'}
                loadingText="Enviando..."
                onClick={onSendWelcomeEmail}
                className={
                  hasEmail
                    ? 'border border-white/10 bg-white/5 text-[var(--color-text-main)] hover:bg-white/10'
                    : 'border border-white/10 bg-white/5 text-[var(--color-text-muted)]'
                }
              >
                {hasEmail ? 'Email boas-vindas' : 'Email não disponível'}
              </ActionButton>

              <ActionButton
                disabled={isBusy || !chargeWhatsAppUrl}
                isLoading={pendingAction === 'whatsapp:cobranca'}
                loadingText="Registrando..."
                onClick={() => onRegisterWhatsAppContact('cobranca')}
                className="border border-[rgba(244,184,96,0.2)] bg-[rgba(244,184,96,0.12)] text-[var(--color-primary)] hover:bg-[rgba(244,184,96,0.18)]"
              >
                Registrar cobrança
              </ActionButton>

              <ActionButton
                disabled={isBusy || !welcomeWhatsAppUrl}
                isLoading={pendingAction === 'whatsapp:boas_vindas'}
                loadingText="Registrando..."
                onClick={() => onRegisterWhatsAppContact('boas_vindas')}
                className="border border-[rgba(113,211,205,0.24)] bg-[rgba(31,111,107,0.16)] text-[#8de0d9] hover:bg-[rgba(31,111,107,0.22)]"
              >
                Registrar boas-vindas
              </ActionButton>

              <ActionButton
                disabled={isBusy || !hasEmail}
                isLoading={pendingAction === 'email:cobranca'}
                loadingText="Enviando..."
                onClick={onSendChargeEmail}
                className={
                  hasEmail
                    ? 'border border-white/10 bg-white/5 text-[var(--color-text-main)] hover:bg-white/10'
                    : 'border border-white/10 bg-white/5 text-[var(--color-text-muted)]'
                }
              >
                {hasEmail ? 'Email cobrança' : 'Email não disponível'}
              </ActionButton>
            </div>
          </div>

          <div className="admin-panel-muted p-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              Status
            </p>
            <div className="flex flex-wrap gap-2">
              <ActionButton
                disabled={isBusy}
                isLoading={pendingAction === 'status:ativo'}
                loadingText="Salvando..."
                onClick={() => onStatusChange('ativo')}
                className="border border-[rgba(113,211,205,0.24)] bg-[rgba(31,111,107,0.16)] text-[#8de0d9] hover:bg-[rgba(31,111,107,0.22)]"
              >
                Ativar
              </ActionButton>
              <ActionButton
                disabled={isBusy}
                isLoading={pendingAction === 'status:inadimplente'}
                loadingText="Salvando..."
                onClick={() => onStatusChange('inadimplente')}
                className="border border-[rgba(252,165,165,0.22)] bg-[rgba(248,113,113,0.12)] text-[#fca5a5] hover:bg-[rgba(248,113,113,0.18)]"
              >
                Marcar inadimplente
              </ActionButton>
              <ActionButton
                disabled={isBusy}
                isLoading={pendingAction === 'status:cancelado'}
                loadingText="Salvando..."
                onClick={() => onStatusChange('cancelado')}
                className="border border-white/10 bg-white/5 text-[var(--color-text-main)] hover:bg-white/10"
              >
                Cancelar
              </ActionButton>
            </div>
          </div>

          <div className="admin-panel-muted p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                Financeiro
              </p>
              <ActionButton
                disabled={isBusy}
                isLoading={pendingAction === 'payment:register'}
                loadingText="Salvando..."
                onClick={onRegisterPayment}
                className="bg-[var(--color-primary)] text-[#1f1406] hover:bg-[var(--color-primary-hover)]"
              >
                Registrar pagamento
              </ActionButton>
            </div>

            <form
              onSubmit={onPaymentSubmit}
              className="grid gap-3 md:grid-cols-4"
            >
              <input type="hidden" name="id" value={member.id} />
              <div>
                <label
                  htmlFor={`valor-${member.id}`}
                  className="mb-1 block text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-text-muted)]"
                >
                  Valor mensal
                </label>
                <input
                  id={`valor-${member.id}`}
                  name="valor_mensal"
                  type="text"
                  inputMode="decimal"
                  disabled={isBusy}
                  defaultValue={
                    member.valor_mensal === null
                      ? ''
                      : String(member.valor_mensal).replace('.', ',')
                  }
                  placeholder="Ex: 30,00"
                  className="admin-input disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div>
                <label
                  htmlFor={`ultimo-${member.id}`}
                  className="mb-1 block text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-text-muted)]"
                >
                  Último pagamento
                </label>
                <input
                  id={`ultimo-${member.id}`}
                  name="ultimo_pagamento_em"
                  type="date"
                  disabled={isBusy}
                  defaultValue={member.ultimo_pagamento_em ?? ''}
                  className="admin-input disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div>
                <label
                  htmlFor={`proximo-${member.id}`}
                  className="mb-1 block text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-text-muted)]"
                >
                  Próximo vencimento
                </label>
                <input
                  id={`proximo-${member.id}`}
                  name="proximo_vencimento_em"
                  type="date"
                  disabled={isBusy}
                  defaultValue={member.proximo_vencimento_em ?? ''}
                  className="admin-input disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={isBusy}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[var(--color-primary)] px-3 py-2 text-sm font-bold text-[#1f1406] transition-colors hover:bg-[var(--color-primary-hover)] focus:outline-2 focus:outline-[var(--color-primary)] focus:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {pendingAction === 'payment:update' && <LoadingDot />}
                  {pendingAction === 'payment:update' ? 'Atualizando...' : 'Atualizar dados'}
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  )
}
