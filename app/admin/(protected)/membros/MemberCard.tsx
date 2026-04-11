'use client'

import { memo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  buildMemberWhatsAppUrl,
  fillMembershipTemplate,
  formatCurrencyBR,
  formatDateBR,
  isValidEmailAddress,
} from '@/lib/membership'
import type {
  Member,
  MemberContactHistory,
  MemberContactType,
  MemberPayment,
  MemberStatus,
} from '@/types'
import {
  registerMemberPaymentAction,
  registerMemberWhatsAppContact,
  sendMemberChargeEmail,
  sendMemberWelcomeEmail,
  updateMemberPaymentAction,
  updateMemberStatusAction,
} from './actions'
import ConfirmActionModal from './ConfirmActionModal'
import MemberDetails from './MemberDetails'
import MemberListItem from './MemberListItem'

type PendingAction =
  | `status:${MemberStatus}`
  | `email:${Extract<MemberContactType, 'boas_vindas' | 'cobranca'>}`
  | `whatsapp:${Extract<MemberContactType, 'boas_vindas' | 'cobranca'>}`
  | 'payment:register'
  | 'payment:update'

interface ToastState {
  type: 'success' | 'error'
  message: string
}

interface ConfirmationState {
  status: Extract<MemberStatus, 'inadimplente' | 'cancelado'>
  title: string
  description: string
  confirmLabel: string
  confirmClassName: string
}

function Toast({ toast }: { toast: ToastState }) {
  return (
    <div
      role={toast.type === 'error' ? 'alert' : 'status'}
      className={`mx-4 mt-3 rounded-xl border px-4 py-3 text-sm font-semibold ${
        toast.type === 'success'
          ? 'border-green-200 bg-green-50 text-green-700'
          : 'border-salmon-200 bg-salmon-50 text-salmon-700'
      }`}
    >
      {toast.message}
    </div>
  )
}

function MemberCardComponent({
  member,
  payments,
  contacts,
  welcomeTemplate,
  chargeTemplate,
}: {
  member: Member
  payments: MemberPayment[]
  contacts: MemberContactHistory[]
  welcomeTemplate: string
  chargeTemplate: string
}) {
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(false)
  const [toast, setToast] = useState<ToastState | null>(null)
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const [confirmation, setConfirmation] = useState<ConfirmationState | null>(null)
  const [isPending, startTransition] = useTransition()

  const isBusy = isPending || pendingAction !== null
  const hasEmail = isValidEmailAddress(member.email)
  const welcomeWhatsAppUrl = buildMemberWhatsAppUrl(
    member.whatsapp,
    fillMembershipTemplate(welcomeTemplate, { nome: member.nome })
  )
  const chargeWhatsAppUrl = buildMemberWhatsAppUrl(
    member.whatsapp,
    fillMembershipTemplate(chargeTemplate, {
      nome: member.nome,
      valor: formatCurrencyBR(member.valor_mensal),
      vencimento: formatDateBR(member.proximo_vencimento_em),
    })
  )

  function finishAction(result: { error?: string; success?: string }) {
    if (result.error) {
      setToast({ type: 'error', message: result.error || 'Não foi possível atualizar' })
      return
    }

    setToast({
      type: 'success',
      message: result.success || 'Dados atualizados',
    })
    router.refresh()
  }

  function executeStatusUpdate(status: MemberStatus) {
    if (isBusy) return

    const formData = new FormData()
    formData.set('id', member.id)
    formData.set('status', status)

    setToast(null)
    setPendingAction(`status:${status}`)

    startTransition(async () => {
      const result = await updateMemberStatusAction(formData)
      finishAction(result)
      setConfirmation(null)
      setPendingAction(null)
    })
  }

  function handleStatus(status: Extract<MemberStatus, 'ativo' | 'inadimplente' | 'cancelado'>) {
    if (status === 'cancelado') {
      setConfirmation({
        status,
        title: 'Cancelar sócio?',
        description:
          'O sócio ficará marcado como cancelado e sairá do fluxo ativo de acompanhamento.',
        confirmLabel: 'Cancelar sócio',
        confirmClassName: 'bg-neutral-800 text-white hover:bg-neutral-700',
      })
      return
    }

    if (status === 'inadimplente') {
      setConfirmation({
        status,
        title: 'Marcar como inadimplente?',
        description:
          'Use esta ação quando houver pagamento em atraso e a equipe precisar acompanhar a regularização.',
        confirmLabel: 'Marcar inadimplente',
        confirmClassName: 'bg-red-600 text-white hover:bg-red-700',
      })
      return
    }

    executeStatusUpdate(status)
  }

  function handleRegisterPayment() {
    if (isBusy) return

    const formData = new FormData()
    formData.set('id', member.id)

    setToast(null)
    setPendingAction('payment:register')

    startTransition(async () => {
      const result = await registerMemberPaymentAction(formData)
      finishAction(result)
      setPendingAction(null)
    })
  }

  function handlePaymentSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)

    setToast(null)
    setPendingAction('payment:update')

    startTransition(async () => {
      const result = await updateMemberPaymentAction(formData)
      finishAction(result)
      setPendingAction(null)
    })
  }

  function handleSendWelcomeEmail() {
    if (isBusy) return

    setToast(null)
    setPendingAction('email:boas_vindas')

    startTransition(async () => {
      const result = await sendMemberWelcomeEmail(member.id)
      finishAction(result)
      setPendingAction(null)
    })
  }

  function handleSendChargeEmail() {
    if (isBusy) return

    setToast(null)
    setPendingAction('email:cobranca')

    startTransition(async () => {
      const result = await sendMemberChargeEmail(member.id)
      finishAction(result)
      setPendingAction(null)
    })
  }

  function handleRegisterWhatsAppContact(
    type: Extract<MemberContactType, 'boas_vindas' | 'cobranca'>
  ) {
    if (isBusy) return

    setToast(null)
    setPendingAction(`whatsapp:${type}`)

    startTransition(async () => {
      const result = await registerMemberWhatsAppContact(member.id, type)
      finishAction(result)
      setPendingAction(null)
    })
  }

  return (
    <article>
      {confirmation && (
        <ConfirmActionModal
          title={confirmation.title}
          description={confirmation.description}
          confirmLabel={confirmation.confirmLabel}
          confirmClassName={confirmation.confirmClassName}
          isLoading={pendingAction === `status:${confirmation.status}`}
          onCancel={() => setConfirmation(null)}
          onConfirm={() => executeStatusUpdate(confirmation.status)}
        />
      )}

      <MemberListItem
        member={member}
        hasEmail={hasEmail}
        isExpanded={isExpanded}
        onToggle={() => setIsExpanded((current) => !current)}
        onSendChargeEmail={handleSendChargeEmail}
        chargeWhatsAppUrl={chargeWhatsAppUrl}
        isBusy={isBusy}
        isChargeEmailLoading={pendingAction === 'email:cobranca'}
      />

      {toast && <Toast toast={toast} />}

      {isExpanded && (
        <MemberDetails
          member={member}
          contacts={contacts}
          hasEmail={hasEmail}
          welcomeWhatsAppUrl={welcomeWhatsAppUrl}
          chargeWhatsAppUrl={chargeWhatsAppUrl}
          isBusy={isBusy}
          pendingAction={pendingAction}
          onSendWelcomeEmail={handleSendWelcomeEmail}
          onSendChargeEmail={handleSendChargeEmail}
          onRegisterWhatsAppContact={handleRegisterWhatsAppContact}
          onRegisterPayment={handleRegisterPayment}
          onStatusChange={handleStatus}
          onPaymentSubmit={handlePaymentSubmit}
        />
      )}
    </article>
  )
}

const MemberCard = memo(MemberCardComponent)

export default MemberCard
