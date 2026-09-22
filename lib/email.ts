import 'server-only'

import { nomeDisplay } from '@/lib/animal-format'
import { getResendClient } from '@/lib/resend'

// NOTIFICATION_EMAIL deve conter emails separados por vírgula
// Ex: a@a.com,b@b.com
// RESEND_VERIFIED_FROM pode definir um remetente verificado do domínio próprio
// TODO: substituir onboarding@resend.dev por domínio próprio quando disponível

const FALLBACK_FROM = 'Amiga Miau <onboarding@resend.dev>'

function getNotificationEmails(): string[] {
  return (
    process.env.NOTIFICATION_EMAIL?.split(',')
      .map((email) => email.trim())
      .filter(Boolean) ?? []
  )
}

interface AdoptionInterestEmailData {
  /** Pode ser null: o animal pode ainda não ter nome. */
  animalNome: string | null
  nome: string
  email: string
  telefone: string | null
  mensagem: string | null
}

interface ContactMessageEmailData {
  nome: string
  email: string
  assunto: string
  mensagem: string
}

interface MembershipInterestEmailData {
  nome: string
  endereco: string
  cidade: string
  estado: string
  cpf: string
  whatsapp: string
  mensagem: string | null
}

interface MembershipTemplateData {
  nome: string
  valor?: string
  vencimento?: string
  animal?: string
}

interface MembershipEmailSendData {
  to: string
  subjectTemplate: string
  bodyTemplate: string
  templateData: MembershipTemplateData
  senderName?: string | null
  replyTo?: string | null
}

interface MembershipEmailSendResult {
  subject: string
  message: string
  from: string
  to: string
  replyTo?: string
  providerId?: string
}

interface DirectEmailSendData {
  to: string
  subject: string
  message: string
  senderName?: string | null
  replyTo?: string | null
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
    .replaceAll('\n', '<br/>')
}

function isValidEmail(value: string | null | undefined): value is string {
  if (!value) return false

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export function maskEmailForLogs(value: string | null | undefined): string {
  if (!isValidEmail(value)) {
    return 'email-invalido'
  }

  const [localPart, domain] = value.trim().split('@')
  const visibleChars = localPart.slice(0, Math.min(2, localPart.length))
  const hiddenChars = '*'.repeat(Math.max(localPart.length - visibleChars.length, 1))

  return `${visibleChars}${hiddenChars}@${domain}`
}

function sanitizeSenderName(value: string | null | undefined): string {
  const trimmed = value?.trim()

  if (!trimmed) return 'Amiga Miau'

  return trimmed.replace(/[<>]/g, '').slice(0, 80) || 'Amiga Miau'
}

function resolveEmailFrom(senderName?: string | null): string {
  const verifiedFrom = process.env.RESEND_VERIFIED_FROM?.trim()
  const safeSenderName = sanitizeSenderName(senderName)

  if (!verifiedFrom) {
    return FALLBACK_FROM
  }

  if (verifiedFrom.includes('<')) {
    return verifiedFrom
  }

  return `${safeSenderName} <${verifiedFrom}>`
}

function resolveReplyTo(replyTo?: string | null): string | undefined {
  const trimmedReplyTo = typeof replyTo === 'string' ? replyTo.trim() : ''

  if (!isValidEmail(trimmedReplyTo)) {
    if (trimmedReplyTo) {
      console.error('[EMAIL REPLY_TO INVALID]', trimmedReplyTo)
    }
    return undefined
  }

  return trimmedReplyTo
}

function fillEmailTemplate(
  template: string,
  data: MembershipTemplateData
): string {
  return template
    .replaceAll('{nome}', data.nome)
    .replaceAll('{valor}', data.valor ?? '')
    .replaceAll('{vencimento}', data.vencimento ?? '')
    .replaceAll('{animal}', data.animal ?? '')
}

function renderEmailHtmlFromText(message: string): string {
  const safeMessage = escapeHtml(message)

  return `
  <div style="font-family: Arial, sans-serif; background:#f9fafb; padding:20px;">
    <div style="max-width:600px; margin:auto; background:white; border-radius:8px; padding:24px;">
      <div style="background:#f3f4f6; padding:16px; border-radius:6px; color:#1f2937; line-height:1.6;">
        ${safeMessage}
      </div>

      <p style="margin-top:24px; font-size:12px; color:#888;">
        Sistema Amiga Miau
      </p>
    </div>
  </div>
  `
}

async function sendConfiguredEmail(
  data: DirectEmailSendData
): Promise<MembershipEmailSendResult> {
  const resend = getResendClient()

  if (!isValidEmail(data.to)) {
    throw new Error('INVALID_EMAIL')
  }

  const subject = data.subject.trim()
  const message = data.message.trim()
  const replyTo = resolveReplyTo(data.replyTo)
  const from = resolveEmailFrom(data.senderName)
  const to = data.to.trim()

  const result = await resend.emails.send({
    from,
    to: [to],
    subject,
    html: renderEmailHtmlFromText(message),
    ...(replyTo ? { replyTo } : {}),
  })

  if (result.error) {
    throw result.error
  }

  return {
    subject,
    message,
    from,
    to,
    replyTo,
    providerId: result.data?.id,
  }
}

function adoptionEmailTemplate(data: AdoptionInterestEmailData): string {
  const animalNome = escapeHtml(nomeDisplay(data.animalNome))
  const nome = escapeHtml(data.nome)
  const email = escapeHtml(data.email)
  const telefone = data.telefone ? escapeHtml(data.telefone) : '-'
  const mensagem = data.mensagem ? escapeHtml(data.mensagem) : '-'

  return `
  <div style="font-family: Arial, sans-serif; background:#f9fafb; padding:20px;">
    <div style="max-width:600px; margin:auto; background:white; border-radius:8px; padding:24px;">
      <h2 style="margin:0 0 16px;">🐾 Novo interesse em adoção</h2>

      <div style="background:#f3f4f6; padding:16px; border-radius:6px;">
        <p><strong>Animal:</strong> ${animalNome}</p>
        <p><strong>Nome:</strong> ${nome}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Telefone:</strong> ${telefone}</p>
        <p><strong>Mensagem:</strong><br/>${mensagem}</p>
      </div>

      <p style="margin-top:24px; font-size:12px; color:#888;">
        Sistema Amiga Miau
      </p>
    </div>
  </div>
  `
}

function contactEmailTemplate(data: ContactMessageEmailData): string {
  const nome = escapeHtml(data.nome)
  const email = escapeHtml(data.email)
  const assunto = escapeHtml(data.assunto)
  const mensagem = escapeHtml(data.mensagem)

  return `
  <div style="font-family: Arial, sans-serif; background:#f9fafb; padding:20px;">
    <div style="max-width:600px; margin:auto; background:white; border-radius:8px; padding:24px;">
      <h2 style="margin:0 0 16px;">📩 Nova mensagem de contato</h2>

      <div style="background:#f3f4f6; padding:16px; border-radius:6px;">
        <p><strong>Nome:</strong> ${nome}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Assunto:</strong> ${assunto}</p>
        <p><strong>Mensagem:</strong><br/>${mensagem}</p>
      </div>

      <p style="margin-top:24px; font-size:12px; color:#888;">
        Sistema Amiga Miau
      </p>
    </div>
  </div>
  `
}

function membershipEmailTemplate(data: MembershipInterestEmailData): string {
  const nome = escapeHtml(data.nome)
  const endereco = escapeHtml(data.endereco)
  const cidade = escapeHtml(data.cidade)
  const estado = escapeHtml(data.estado)
  const cpf = escapeHtml(data.cpf)
  const whatsapp = escapeHtml(data.whatsapp)
  const mensagem = data.mensagem ? escapeHtml(data.mensagem) : '-'

  return `
  <div style="font-family: Arial, sans-serif; background:#f9fafb; padding:20px;">
    <div style="max-width:600px; margin:auto; background:white; border-radius:8px; padding:24px;">
      <h2 style="margin:0 0 16px;">Novo cadastro de sócio</h2>

      <div style="background:#f3f4f6; padding:16px; border-radius:6px;">
        <p><strong>Nome:</strong> ${nome}</p>
        <p><strong>CPF:</strong> ${cpf}</p>
        <p><strong>WhatsApp:</strong> ${whatsapp}</p>
        <p><strong>Endereço:</strong> ${endereco}</p>
        <p><strong>Cidade/UF:</strong> ${cidade}/${estado}</p>
        <p><strong>Mensagem:</strong><br/>${mensagem}</p>
      </div>

      <p style="margin-top:24px; font-size:12px; color:#888;">
        Sistema Amiga Miau
      </p>
    </div>
  </div>
  `
}

async function sendNotificationEmail(args: {
  subject: string
  html: string
}): Promise<void> {
  const resend = getResendClient()
  const notificationEmails = getNotificationEmails()

  if (notificationEmails.length === 0) {
    console.warn('NOTIFICATION_EMAIL não configurado')
    return
  }

  await resend.emails.send({
    from: FALLBACK_FROM,
    to: notificationEmails,
    subject: args.subject,
    html: args.html,
  })
}

export async function sendAdoptionInterestEmail(
  data: AdoptionInterestEmailData
): Promise<void> {
  await sendNotificationEmail({
    subject: `Novo interesse em adoção - ${nomeDisplay(data.animalNome)}`,
    html: adoptionEmailTemplate(data),
  })
}

export async function sendContactMessageEmail(
  data: ContactMessageEmailData
): Promise<void> {
  await sendNotificationEmail({
    subject: `Nova mensagem - ${data.assunto}`,
    html: contactEmailTemplate(data),
  })
}

export async function sendMembershipInterestEmail(
  data: MembershipInterestEmailData
): Promise<void> {
  await sendNotificationEmail({
    subject: `Novo cadastro de sócio - ${data.nome}`,
    html: membershipEmailTemplate(data),
  })
}

export async function sendMembershipEmail(
  data: MembershipEmailSendData
): Promise<MembershipEmailSendResult> {
  return sendConfiguredEmail({
    to: data.to,
    subject: fillEmailTemplate(data.subjectTemplate, data.templateData),
    message: fillEmailTemplate(data.bodyTemplate, data.templateData),
    senderName: data.senderName,
    replyTo: data.replyTo,
  })
}

export async function sendDirectEmail(
  data: DirectEmailSendData
): Promise<MembershipEmailSendResult> {
  return sendConfiguredEmail(data)
}
