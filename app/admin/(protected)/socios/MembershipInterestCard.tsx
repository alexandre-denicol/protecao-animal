'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  buildMemberWhatsAppUrl,
  contactChannelLabel,
  contactTypeLabel,
  fillMembershipTemplate,
  formatContactDateBR,
  formatPhoneBR,
  isValidEmailAddress,
  maskCpf,
} from '@/lib/membership'
import type { Member, MemberContactHistory, MembershipInterest } from '@/types'
import StatusBadge from '@/components/admin/StatusBadge'
import {
  convertMembershipInterest,
  markMembershipAsRead,
  registerMembershipInterestWhatsAppContact,
  sendMembershipTriageEmail,
} from './actions'

type MemberSummary = Pick<Member, 'id' | 'interest_id' | 'status'>

type InterestWithMember = MembershipInterest & {
  member: MemberSummary | null
}

type PendingAction = 'mark-read' | 'convert' | 'email-triage' | 'whatsapp-log'

interface ToastState {
  type: 'success' | 'error'
  message: string
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function LoadingDot() {
  return (
    <span
      aria-hidden="true"
      className="block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"
    />
  )
}

function Toast({ toast }: { toast: ToastState }) {
  return (
    <div
      role={toast.type === 'error' ? 'alert' : 'status'}
      className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
        toast.type === 'success'
          ? 'border-[rgba(113,211,205,0.24)] bg-[rgba(31,111,107,0.16)] text-[#8de0d9]'
          : 'border-[rgba(252,165,165,0.22)] bg-[rgba(248,113,113,0.12)] text-[#fca5a5]'
      }`}
    >
      {toast.message}
    </div>
  )
}

function ReadBadge({ lida }: { lida: boolean }) {
  return (
    <StatusBadge tone={lida ? 'neutral' : 'warning'}>{lida ? 'Lido' : 'Não lido'}</StatusBadge>
  )
}

function ConvertedBadge({ converted }: { converted: boolean }) {
  return (
    <StatusBadge tone={converted ? 'primary' : 'neutral'}>
      {converted ? 'Convertido' : 'Em abordagem'}
    </StatusBadge>
  )
}

function ContactHistorySummary({
  contacts,
}: {
  contacts: MemberContactHistory[]
}) {
  const recentContacts = contacts.slice(0, 3)

  if (recentContacts.length === 0) {
    return null
  }

  return (
    <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
        Últimos contatos
      </p>
      <div className="grid gap-2">
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
    </div>
  )
}

function ActionButton({
  children,
  className,
  disabled,
  isLoading,
  loadingText,
  onClick,
}: {
  children: React.ReactNode
  className: string
  disabled: boolean
  isLoading: boolean
  loadingText: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold transition-colors focus:outline-2 focus:outline-primary-300 focus:outline-offset-2 disabled:cursor-wait disabled:opacity-60 ${className}`}
    >
      {isLoading && <LoadingDot />}
      {isLoading ? loadingText : children}
    </button>
  )
}

export default function MembershipInterestCard({
  interest,
  contacts,
  whatsappTemplate,
}: {
  interest: InterestWithMember
  contacts: MemberContactHistory[]
  whatsappTemplate: string
}) {
  const router = useRouter()
  const [toast, setToast] = useState<ToastState | null>(null)
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const [isPending, startTransition] = useTransition()
  const isBusy = isPending || pendingAction !== null
  const converted = Boolean(interest.member)
  const whatsappUrl = buildMemberWhatsAppUrl(
    interest.whatsapp,
    fillMembershipTemplate(whatsappTemplate, { nome: interest.nome })
  )
  const hasEmail = isValidEmailAddress(interest.email)

  function finishAction(result: { error?: string; success?: string }) {
    if (result.error) {
      setToast({
        type: 'error',
        message: result.error || 'Não foi possível atualizar',
      })
      return
    }

    setToast({
      type: 'success',
      message: result.success || 'Dados atualizados',
    })
    router.refresh()
  }

  function handleMarkAsRead() {
    if (isBusy) return

    setToast(null)
    setPendingAction('mark-read')

    startTransition(async () => {
      const result = await markMembershipAsRead(interest.id)
      finishAction(result)
      setPendingAction(null)
    })
  }

  function handleConvert() {
    if (isBusy) return

    setToast(null)
    setPendingAction('convert')

    startTransition(async () => {
      const result = await convertMembershipInterest(interest.id)
      finishAction(result)
      setPendingAction(null)
    })
  }

  function handleSendEmail() {
    if (isBusy) return

    setToast(null)
    setPendingAction('email-triage')

    startTransition(async () => {
      const result = await sendMembershipTriageEmail(interest.id)
      finishAction(result)
      setPendingAction(null)
    })
  }

  function handleRegisterWhatsAppContact() {
    if (isBusy) return

    setToast(null)
    setPendingAction('whatsapp-log')

    startTransition(async () => {
      const result = await registerMembershipInterestWhatsAppContact(interest.id)
      finishAction(result)
      setPendingAction(null)
    })
  }

  return (
    <article
      className={`admin-panel p-5 transition-colors ${
        interest.lida
          ? converted
            ? 'border-primary-100'
            : 'border-neutral-100'
          : 'border-amber-200 bg-[linear-gradient(180deg,rgba(244,184,96,0.08),rgba(17,24,39,0.96))]'
      }`}
    >
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-[-0.04em] text-[var(--color-text-main)] sm:text-2xl">
            {interest.nome}
          </h2>
          <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-sm text-[var(--color-text-muted)]">
            <span>{interest.cidade}/{interest.estado}</span>
            <span aria-hidden="true">•</span>
            <span>{formatPhoneBR(interest.whatsapp)}</span>
            <span aria-hidden="true">•</span>
            <span>{interest.email || 'Sem email'}</span>
            <span aria-hidden="true">•</span>
            <span className="font-mono text-xs">CPF: {maskCpf(interest.cpf)}</span>
            <span aria-hidden="true">•</span>
            <time dateTime={interest.created_at}>
              {formatDate(interest.created_at)}
            </time>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <ReadBadge lida={interest.lida} />
          <ConvertedBadge converted={converted} />
        </div>
      </header>

      {toast && (
        <div className="mt-3">
          <Toast toast={toast} />
        </div>
      )}

      <div className="mt-5">
        <p className="whitespace-pre-wrap text-base leading-relaxed text-[var(--color-text-main)]">
          {interest.mensagem || 'Sem mensagem adicional.'}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-muted)]">
          <span className="font-semibold text-[var(--color-text-main)]">Endereço:</span>{' '}
          {interest.endereco}
        </p>
      </div>

      <ContactHistorySummary contacts={contacts} />

      <footer className="mt-5 flex flex-col gap-2 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-[var(--color-text-muted)]">
          {converted
            ? 'Cadastro concluído'
            : interest.lida
              ? 'Cadastro em abordagem'
              : 'Novo cadastro para triagem'}
        </div>

        <div className="flex flex-wrap gap-2">
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="admin-button-secondary"
            >
              Abrir WhatsApp
            </a>
          )}

          {whatsappUrl && (
            <ActionButton
              disabled={isBusy}
              isLoading={pendingAction === 'whatsapp-log'}
              loadingText="Registrando..."
              onClick={handleRegisterWhatsAppContact}
              className="border border-[rgba(113,211,205,0.24)] bg-[rgba(31,111,107,0.16)] text-[#8de0d9] hover:bg-[rgba(31,111,107,0.22)]"
            >
              Registrar WhatsApp
            </ActionButton>
          )}

          <ActionButton
            disabled={isBusy || !hasEmail}
            isLoading={pendingAction === 'email-triage'}
            loadingText="Enviando..."
            onClick={handleSendEmail}
            className={
              hasEmail
                ? 'border border-white/10 bg-white/5 text-[var(--color-text-main)] hover:bg-white/10'
                : 'border border-white/10 bg-white/5 text-[var(--color-text-muted)]'
            }
          >
            {hasEmail ? 'Email inicial' : 'Email não disponível'}
          </ActionButton>

          {converted ? (
            <Link
              href="/admin/membros"
              className="admin-button-muted"
            >
              Ver sócio ativo
            </Link>
          ) : (
            <ActionButton
              disabled={isBusy}
              isLoading={pendingAction === 'convert'}
              loadingText="Salvando..."
              onClick={handleConvert}
              className="bg-[var(--color-primary)] text-[#1f1406] hover:bg-[var(--color-primary-hover)]"
            >
              Converter em sócio
            </ActionButton>
          )}

          {!interest.lida && (
            <ActionButton
              disabled={isBusy}
              isLoading={pendingAction === 'mark-read'}
              loadingText="Atualizando..."
              onClick={handleMarkAsRead}
              className="border border-white/10 bg-white/5 text-[var(--color-text-main)] hover:bg-white/10"
            >
              Marcar como lido
            </ActionButton>
          )}
        </div>
      </footer>
    </article>
  )
}
