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
          ? 'border-green-200 bg-green-50 text-green-700'
          : 'border-salmon-200 bg-salmon-50 text-salmon-700'
      }`}
    >
      {toast.message}
    </div>
  )
}

function ReadBadge({ lida }: { lida: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${
        lida ? 'bg-neutral-100 text-neutral-500' : 'bg-amber-100 text-amber-700'
      }`}
    >
      {lida ? 'Lido' : 'Não lido'}
    </span>
  )
}

function ConvertedBadge({ converted }: { converted: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${
        converted ? 'bg-primary-100 text-primary-700' : 'bg-neutral-100 text-neutral-600'
      }`}
    >
      {converted ? 'Convertido' : 'Em abordagem'}
    </span>
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
    <div className="mt-4 rounded-xl bg-neutral-50 p-3">
      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-neutral-400">
        Últimos contatos
      </p>
      <div className="grid gap-2">
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
      className={`rounded-2xl border bg-white p-5 shadow-sm transition-colors ${
        interest.lida
          ? converted
            ? 'border-primary-100'
            : 'border-neutral-100'
          : 'border-amber-200 bg-amber-50/40'
      }`}
    >
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold tracking-tight text-neutral-800 sm:text-2xl">
            {interest.nome}
          </h2>
          <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-sm text-neutral-500">
            <span>{interest.cidade}/{interest.estado}</span>
            <span aria-hidden="true">•</span>
            <span>{formatPhoneBR(interest.whatsapp)}</span>
            <span aria-hidden="true">•</span>
            <span>{interest.email}</span>
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
        <p className="whitespace-pre-wrap text-base leading-relaxed text-neutral-800">
          {interest.mensagem || 'Sem mensagem adicional.'}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-neutral-500">
          <span className="font-semibold text-neutral-600">Endereço:</span>{' '}
          {interest.endereco}
        </p>
      </div>

      <ContactHistorySummary contacts={contacts} />

      <footer className="mt-5 flex flex-col gap-2 border-t border-neutral-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-neutral-400">
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
              className="inline-flex items-center justify-center rounded-lg bg-green-100 px-4 py-2 text-sm font-bold text-green-700 transition-colors hover:bg-green-200 focus:outline-2 focus:outline-green-300 focus:outline-offset-2"
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
              className="bg-white text-green-700 ring-1 ring-inset ring-green-200 hover:bg-green-50"
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
                ? 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                : 'bg-neutral-100 text-neutral-400'
            }
          >
            {hasEmail ? 'Email inicial' : 'Email não disponível'}
          </ActionButton>

          {converted ? (
            <Link
              href="/admin/membros"
              className="inline-flex items-center justify-center rounded-lg bg-neutral-800 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-neutral-700 focus:outline-2 focus:outline-neutral-300 focus:outline-offset-2"
            >
              Ver sócio ativo
            </Link>
          ) : (
            <ActionButton
              disabled={isBusy}
              isLoading={pendingAction === 'convert'}
              loadingText="Salvando..."
              onClick={handleConvert}
              className="bg-primary-300 text-primary-900 hover:bg-primary-400"
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
              className="bg-white text-neutral-600 ring-1 ring-inset ring-neutral-200 hover:bg-neutral-50"
            >
              Marcar como lido
            </ActionButton>
          )}
        </div>
      </footer>
    </article>
  )
}
