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
    <div className="border-t border-neutral-100 bg-neutral-50 px-4 py-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <section className="grid gap-4">
          <div className="rounded-xl bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Observações do cadastro
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-neutral-600">
              {member.observacoes || 'Sem observações adicionais.'}
            </p>
          </div>

          <div className="rounded-xl bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Últimos contatos
            </p>
            {recentContacts.length === 0 ? (
              <p className="mt-2 text-sm text-neutral-400">
                Nenhum contato registrado ainda.
              </p>
            ) : (
              <div className="mt-3 grid gap-2">
                {recentContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex flex-col gap-0.5 text-xs text-neutral-500 sm:flex-row sm:items-center sm:gap-2"
                  >
                    <span className="font-bold text-neutral-700">
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
          <div className="rounded-xl bg-white p-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-400">
              Comunicação
            </p>
            <div className="flex flex-wrap gap-2">
              {welcomeWhatsAppUrl ? (
                <a
                  href={welcomeWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-lg bg-green-100 px-3 py-2 text-sm font-bold text-green-700 transition-colors hover:bg-green-200 focus:outline-2 focus:outline-green-300 focus:outline-offset-2"
                >
                  WhatsApp boas-vindas
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

              <ActionButton
                disabled={isBusy || !hasEmail}
                isLoading={pendingAction === 'email:boas_vindas'}
                loadingText="Enviando..."
                onClick={onSendWelcomeEmail}
                className={
                  hasEmail
                    ? 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    : 'bg-neutral-100 text-neutral-400'
                }
              >
                {hasEmail ? 'Email boas-vindas' : 'Email não disponível'}
              </ActionButton>

              <ActionButton
                disabled={isBusy || !chargeWhatsAppUrl}
                isLoading={pendingAction === 'whatsapp:cobranca'}
                loadingText="Registrando..."
                onClick={() => onRegisterWhatsAppContact('cobranca')}
                className="bg-white text-amber-700 ring-1 ring-inset ring-amber-200 hover:bg-amber-50"
              >
                Registrar cobrança
              </ActionButton>

              <ActionButton
                disabled={isBusy || !welcomeWhatsAppUrl}
                isLoading={pendingAction === 'whatsapp:boas_vindas'}
                loadingText="Registrando..."
                onClick={() => onRegisterWhatsAppContact('boas_vindas')}
                className="bg-white text-green-700 ring-1 ring-inset ring-green-200 hover:bg-green-50"
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
                    ? 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    : 'bg-neutral-100 text-neutral-400'
                }
              >
                {hasEmail ? 'Email cobrança' : 'Email não disponível'}
              </ActionButton>
            </div>
          </div>

          <div className="rounded-xl bg-white p-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-400">
              Status
            </p>
            <div className="flex flex-wrap gap-2">
              <ActionButton
                disabled={isBusy}
                isLoading={pendingAction === 'status:ativo'}
                loadingText="Salvando..."
                onClick={() => onStatusChange('ativo')}
                className="bg-green-100 text-green-700 hover:bg-green-200"
              >
                Ativar
              </ActionButton>
              <ActionButton
                disabled={isBusy}
                isLoading={pendingAction === 'status:inadimplente'}
                loadingText="Salvando..."
                onClick={() => onStatusChange('inadimplente')}
                className="bg-red-100 text-red-700 hover:bg-red-200"
              >
                Marcar inadimplente
              </ActionButton>
              <ActionButton
                disabled={isBusy}
                isLoading={pendingAction === 'status:cancelado'}
                loadingText="Salvando..."
                onClick={() => onStatusChange('cancelado')}
                className="bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              >
                Cancelar
              </ActionButton>
            </div>
          </div>

          <div className="rounded-xl bg-white p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Financeiro
              </p>
              <ActionButton
                disabled={isBusy}
                isLoading={pendingAction === 'payment:register'}
                loadingText="Salvando..."
                onClick={onRegisterPayment}
                className="bg-neutral-800 text-white hover:bg-neutral-700"
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
                  className="mb-1 block text-xs font-bold uppercase tracking-wider text-neutral-400"
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
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500"
                />
              </div>
              <div>
                <label
                  htmlFor={`ultimo-${member.id}`}
                  className="mb-1 block text-xs font-bold uppercase tracking-wider text-neutral-400"
                >
                  Último pagamento
                </label>
                <input
                  id={`ultimo-${member.id}`}
                  name="ultimo_pagamento_em"
                  type="date"
                  disabled={isBusy}
                  defaultValue={member.ultimo_pagamento_em ?? ''}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500"
                />
              </div>
              <div>
                <label
                  htmlFor={`proximo-${member.id}`}
                  className="mb-1 block text-xs font-bold uppercase tracking-wider text-neutral-400"
                >
                  Próximo vencimento
                </label>
                <input
                  id={`proximo-${member.id}`}
                  name="proximo_vencimento_em"
                  type="date"
                  disabled={isBusy}
                  defaultValue={member.proximo_vencimento_em ?? ''}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={isBusy}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-neutral-800 px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-neutral-700 focus:outline-2 focus:outline-neutral-300 focus:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
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
