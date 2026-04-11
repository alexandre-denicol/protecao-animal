'use server'

import { revalidatePath } from 'next/cache'
import { getUserProfile, requireRole } from '@/lib/auth/roles'
import { maskEmailForLogs } from '@/lib/email'
import {
  fillMembershipTemplate,
  formatCurrencyBR,
  formatDateBR,
  isValidEmailAddress,
} from '@/lib/membership'
import { getPublicSiteSettings } from '@/lib/site-settings'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import type { Member, MemberContactType, MemberStatus, UserRole } from '@/types'

const VALID_MEMBER_STATUS: MemberStatus[] = [
  'pendente',
  'contatado',
  'ativo',
  'inadimplente',
  'cancelado',
]

const VALID_USER_ROLES: UserRole[] = ['admin', 'editor', 'viewer']

export interface MembrosFormState {
  error?: string
  success?: string
  fieldErrors?: Partial<Record<string, string>>
}

export interface MemberActionResult {
  error?: string
  success?: string
}

function formValue(formData: FormData, name: string): string {
  return ((formData.get(name) as string | null) ?? '').trim()
}

function parseBrazilianMoney(input: string): number | null {
  const normalized = input.replace(/\./g, '').replace(',', '.').trim()
  const value = Number(normalized)

  return Number.isFinite(value) && value > 0 ? value : null
}

function normalizeCompetenciaMes(input: string): string | null {
  const trimmed = input.trim()

  if (!/^\d{4}-\d{2}$/.test(trimmed)) {
    return null
  }

  return `${trimmed}-01`
}

function normalizeIsoDate(input: string): string | null {
  const trimmed = input.trim()

  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return null
  }

  return trimmed
}

function normalizePaymentMethod(
  input: string
): 'pix' | 'dinheiro' | 'transferencia' | 'outro' | null {
  const normalized = input.trim().toLowerCase()

  if (
    normalized === 'pix' ||
    normalized === 'dinheiro' ||
    normalized === 'transferencia' ||
    normalized === 'outro'
  ) {
    return normalized
  }

  return null
}

async function ensureMembershipAccess(): Promise<boolean> {
  try {
    await requireRole(['admin', 'viewer'])
    return true
  } catch {
    return false
  }
}

function memberTemplateData(member: Pick<Member, 'nome' | 'valor_mensal' | 'proximo_vencimento_em'>) {
  return {
    nome: member.nome,
    valor: formatCurrencyBR(member.valor_mensal),
    vencimento: formatDateBR(member.proximo_vencimento_em),
  }
}

export async function updateMemberStatusAction(
  formData: FormData
): Promise<MemberActionResult> {
  if (!(await ensureMembershipAccess())) {
    return { error: 'Acesso negado.' }
  }

  const id = formValue(formData, 'id')
  const status = formValue(formData, 'status') as MemberStatus

  if (!id || !VALID_MEMBER_STATUS.includes(status)) {
    return { error: 'Não foi possível atualizar.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('members').update({ status }).eq('id', id)

  if (error) {
    console.error('[MEMBER STATUS UPDATE ERROR]', error)
    return { error: 'Não foi possível atualizar.' }
  }

  revalidatePath('/admin/membros')
  const successByStatus: Record<MemberStatus, string> = {
    pendente: 'Status atualizado',
    contatado: 'Sócio marcado como contatado',
    ativo: 'Sócio ativado com sucesso',
    inadimplente: 'Sócio marcado como inadimplente',
    cancelado: 'Sócio cancelado',
  }

  return { success: successByStatus[status] }
}

export async function updateMemberPaymentAction(
  formData: FormData
): Promise<MemberActionResult> {
  if (!(await ensureMembershipAccess())) {
    return { error: 'Acesso negado.' }
  }

  const id = formValue(formData, 'id')
  const valorMensal = formValue(formData, 'valor_mensal')
  const ultimoPagamento = formValue(formData, 'ultimo_pagamento_em')
  const proximoVencimento = formValue(formData, 'proximo_vencimento_em')

  if (!id) {
    return { error: 'Não foi possível atualizar.' }
  }

  const parsedValue = valorMensal ? parseBrazilianMoney(valorMensal) : null

  if (valorMensal && parsedValue === null) {
    return { error: 'Informe um valor mensal válido.' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('members')
    .update({
      valor_mensal: parsedValue,
      ultimo_pagamento_em: ultimoPagamento || null,
      proximo_vencimento_em: proximoVencimento || null,
    })
    .eq('id', id)

  if (error) {
    console.error('[MEMBER PAYMENT UPDATE ERROR]', error)
    return { error: 'Não foi possível atualizar.' }
  }

  revalidatePath('/admin/membros')
  return { success: 'Dados atualizados' }
}

export async function registerMemberPaymentAction(
  formData: FormData
): Promise<MemberActionResult> {
  if (!(await ensureMembershipAccess())) {
    return { error: 'Acesso negado.' }
  }

  const id = formValue(formData, 'id')
  if (!id) {
    return { error: 'Não foi possível atualizar.' }
  }

  const supabase = await createClient()
  const { data: member, error: memberError } = await supabase
    .from('members')
    .select('id, valor_mensal')
    .eq('id', id)
    .single()

  if (memberError || !member) {
    console.error('[MEMBER READ FOR PAYMENT ERROR]', memberError)
    return { error: 'Não foi possível atualizar.' }
  }

  const valorMensal = Number((member as { valor_mensal: number | null }).valor_mensal)
  if (!valorMensal || Number.isNaN(valorMensal)) {
    return { error: 'Defina o valor mensal antes de registrar pagamento.' }
  }

  const today = new Date()
  const nextDue = new Date(today)
  nextDue.setMonth(nextDue.getMonth() + 1)
  const paidAt = today.toISOString().slice(0, 10)
  const competenciaMes = paidAt.slice(0, 7)

  const { error: paymentError } = await supabase.from('member_payments').insert({
    member_id: id,
    valor: valorMensal,
    metodo: 'manual',
    pago_em: paidAt,
    competencia_mes: competenciaMes,
    observacoes: 'Registro rápido pela tela de membros.',
  })

  if (paymentError) {
    console.error('[MEMBER PAYMENT INSERT ERROR]', paymentError)
    return { error: 'Não foi possível atualizar.' }
  }

  const { error } = await supabase
    .from('members')
    .update({
      status: 'ativo',
      ultimo_pagamento_em: paidAt,
      proximo_vencimento_em: nextDue.toISOString().slice(0, 10),
    })
    .eq('id', id)

  if (error) {
    console.error('[MEMBER PAYMENT REGISTER ERROR]', error)
    return { error: 'Não foi possível atualizar.' }
  }

  revalidatePath('/admin/membros')
  revalidatePath('/admin/socios/pagamentos')
  return { success: 'Pagamento registrado' }
}

export async function registerMemberPaymentDetailedAction(
  formData: FormData
): Promise<MemberActionResult> {
  if (!(await ensureMembershipAccess())) {
    return { error: 'Acesso negado.' }
  }

  const memberId = formValue(formData, 'member_id')
  const valor = formValue(formData, 'valor')
  const metodo = formValue(formData, 'metodo')
  const pagoEm = formValue(formData, 'pago_em')
  const competenciaMes = formValue(formData, 'competencia_mes')
  const observacoes = formValue(formData, 'observacoes') || null

  const parsedValue = parseBrazilianMoney(valor)
  const normalizedPagoEm = normalizeIsoDate(pagoEm)
  const normalizedCompetenciaMes = normalizeCompetenciaMes(competenciaMes)
  const normalizedMetodo = normalizePaymentMethod(metodo)

  if (!memberId) {
    return { error: 'Selecione um sócio.' }
  }

  if (parsedValue === null) {
    return { error: 'Informe um valor válido.' }
  }

  if (!normalizedMetodo) {
    return { error: 'Informe o método de pagamento.' }
  }

  if (!normalizedPagoEm) {
    return { error: 'Informe uma data de pagamento válida.' }
  }

  if (!normalizedCompetenciaMes) {
    return { error: 'Informe método, data de pagamento e competência.' }
  }

  const [year, month, day] = normalizedPagoEm.split('-').map(Number)
  const nextDue = new Date(Date.UTC(year, month - 1, day))
  nextDue.setUTCMonth(nextDue.getUTCMonth() + 1)

  console.error('[PAYMENT DATE DEBUG]', {
    pagoEmRecebido: normalizedPagoEm,
    competenciaMesRecebida: competenciaMes,
  })

  const supabase = await createClient()
  const paymentPayload = {
    member_id: memberId,
    valor: parsedValue,
    metodo: normalizedMetodo,
    pago_em: normalizedPagoEm,
    competencia_mes: normalizedCompetenciaMes,
    observacoes,
  }

  const { error: paymentError } = await supabase
    .from('member_payments')
    .insert(paymentPayload)

  if (paymentError) {
    console.error('[MEMBER PAYMENT INSERT ERROR]', {
      error: paymentError,
      payload: paymentPayload,
    })
    return { error: 'Não foi possível registrar o pagamento.' }
  }

  const { error: memberError } = await supabase
    .from('members')
    .update({
      status: 'ativo',
      valor_mensal: parsedValue,
      ultimo_pagamento_em: normalizedPagoEm,
      proximo_vencimento_em: nextDue.toISOString().slice(0, 10),
    })
    .eq('id', memberId)

  if (memberError) {
    console.error('[MEMBER AFTER PAYMENT UPDATE ERROR]', {
      error: memberError,
      memberId,
      parsedValue,
      pagoEm: normalizedPagoEm,
      proximoVencimentoEm: nextDue.toISOString().slice(0, 10),
    })
    return { error: 'Pagamento registrado, mas não foi possível atualizar o sócio.' }
  }

  revalidatePath('/admin/membros')
  revalidatePath('/admin/socios/pagamentos')
  return { success: 'Pagamento registrado' }
}

async function getMemberForCommunication(
  id: string
): Promise<Pick<
  Member,
  'id' | 'nome' | 'email' | 'whatsapp' | 'valor_mensal' | 'proximo_vencimento_em'
> | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('members')
    .select('id, nome, email, whatsapp, valor_mensal, proximo_vencimento_em')
    .eq('id', id)
    .single()

  if (error || !data) {
    console.error('[MEMBER COMMUNICATION READ ERROR]', error)
    return null
  }

  return data as Pick<
    Member,
    'id' | 'nome' | 'email' | 'whatsapp' | 'valor_mensal' | 'proximo_vencimento_em'
  >
}

async function sendMemberEmailAction(
  id: string,
  type: Extract<MemberContactType, 'boas_vindas' | 'cobranca'>
): Promise<MemberActionResult> {
  console.error('[MEMBER EMAIL] action chamada', { id, tipo: type })

  if (!(await ensureMembershipAccess())) {
    return { error: 'Acesso negado.' }
  }

  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  const userId = authData.user?.id ?? null
  const member = await getMemberForCommunication(id)

  if (!member) {
    return { error: 'Não foi possível enviar o email.' }
  }

  if (!isValidEmailAddress(member.email)) {
    console.error('[MEMBER EMAIL] email inválido', {
      id,
      tipo: type,
      destinatario: maskEmailForLogs(member.email),
    })
    return { error: 'Este sócio não possui um email válido.' }
  }

  const settings = await getPublicSiteSettings()
  const templateData = memberTemplateData(member)
  const subjectTemplate =
    type === 'boas_vindas'
      ? settings.socios_email_boas_vindas_assunto
      : settings.socios_email_cobranca_assunto
  const bodyTemplate =
    type === 'boas_vindas'
      ? settings.socios_email_boas_vindas_corpo
      : settings.socios_email_cobranca_corpo
  let emailResult: {
    subject: string
    message: string
    to: string
    providerId?: string
  }

  try {
    const { sendMembershipEmail } = await import('@/lib/email')
    const templateName =
      type === 'boas_vindas'
        ? 'socios_email_boas_vindas'
        : 'socios_email_cobranca'

    console.error('[MEMBER EMAIL] envio iniciado', {
      id,
      tipo: type,
      destinatario: maskEmailForLogs(member.email),
      template: templateName,
      resendConfigurado: Boolean(process.env.RESEND_API_KEY),
    })

    emailResult = await sendMembershipEmail({
      to: member.email.trim(),
      subjectTemplate,
      bodyTemplate,
      templateData,
      senderName: settings.email_sender_name,
      replyTo: settings.email_reply_to,
    })

    console.error('[MEMBER EMAIL SUCCESS]', {
      id,
      tipo: type,
      destinatario: maskEmailForLogs(emailResult.to),
      providerId: emailResult.providerId ?? null,
    })
  } catch (error) {
    console.error('[MEMBER EMAIL ERROR]', error)
    return { error: 'Não foi possível enviar o email.' }
  }

  const { error: historyError } = await supabase
    .from('member_contact_history')
    .insert({
      membership_interest_id: null,
      member_id: member.id,
      canal: 'email',
      tipo: type,
      destinatario: member.email.trim(),
      assunto: emailResult.subject,
      mensagem: emailResult.message,
      enviado_por: userId,
    })

  if (historyError) {
    console.error('[MEMBER EMAIL HISTORY ERROR]', historyError)
    return { error: 'Email enviado, mas não foi possível registrar o histórico.' }
  }

  revalidatePath('/admin/membros')
  return {
    success:
      type === 'boas_vindas'
        ? 'Email de boas-vindas enviado'
        : 'Email de cobrança enviado',
  }
}

export async function sendMemberWelcomeEmail(
  id: string
): Promise<MemberActionResult> {
  return sendMemberEmailAction(id, 'boas_vindas')
}

export async function sendMemberChargeEmail(
  id: string
): Promise<MemberActionResult> {
  return sendMemberEmailAction(id, 'cobranca')
}

export async function registerMemberWhatsAppContact(
  id: string,
  type: Extract<MemberContactType, 'boas_vindas' | 'cobranca'>
): Promise<MemberActionResult> {
  if (!(await ensureMembershipAccess())) {
    return { error: 'Acesso negado.' }
  }

  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  const userId = authData.user?.id ?? null
  const member = await getMemberForCommunication(id)

  if (!member) {
    return { error: 'Não foi possível registrar o contato.' }
  }

  const settings = await getPublicSiteSettings()
  const template =
    type === 'boas_vindas'
      ? settings.socios_whatsapp_boas_vindas_template
      : settings.socios_whatsapp_cobranca_template
  const message = fillMembershipTemplate(template, memberTemplateData(member))

  const { error: historyError } = await supabase
    .from('member_contact_history')
    .insert({
      membership_interest_id: null,
      member_id: member.id,
      canal: 'whatsapp',
      tipo: type,
      destinatario: member.whatsapp,
      assunto: null,
      mensagem: message,
      enviado_por: userId,
    })

  if (historyError) {
    console.error('[MEMBER WHATSAPP HISTORY ERROR]', historyError)
    return { error: 'Não foi possível registrar o contato.' }
  }

  revalidatePath('/admin/membros')
  return { success: 'Contato por WhatsApp registrado' }
}

export async function convidarMembroAction(
  _prev: MembrosFormState,
  formData: FormData
): Promise<MembrosFormState> {
  try {
    await requireRole(['admin'])
  } catch {
    return { error: 'Acesso negado.' }
  }

  const email = formValue(formData, 'email').toLowerCase()
  const nome = formValue(formData, 'nome')
  const role = formValue(formData, 'role') as UserRole
  const fieldErrors: Partial<Record<string, string>> = {}

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldErrors.email = 'Insira um e-mail válido.'
  }

  if (!nome) {
    fieldErrors.nome = 'Nome é obrigatório.'
  }

  if (!VALID_USER_ROLES.includes(role)) {
    fieldErrors.role = 'Selecione um perfil de acesso.'
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors }
  }

  const admin = createAdminClient()
  const { data: invite, error: inviteError } =
    await admin.auth.admin.inviteUserByEmail(email, {
      data: { nome },
    })

  if (inviteError) {
    if (inviteError.message?.includes('already')) {
      return { error: 'Este e-mail já está cadastrado no sistema.' }
    }

    return { error: 'Não foi possível enviar o convite. Tente novamente.' }
  }

  const { error: profileError } = await admin.from('profiles').upsert(
    {
      id: invite.user.id,
      nome,
      email,
      role,
      ativo: true,
    },
    { onConflict: 'id' }
  )

  if (profileError) {
    return {
      error:
        'Convite enviado, mas houve um erro ao definir o perfil. Verifique manualmente.',
    }
  }

  revalidatePath('/admin/membros')
  return { success: `Convite enviado para ${email}.` }
}

export async function alterarRoleAction(
  membroId: string,
  novoRole: UserRole
): Promise<{ error?: string }> {
  try {
    await requireRole(['admin'])
  } catch {
    return { error: 'Acesso negado.' }
  }

  if (!VALID_USER_ROLES.includes(novoRole)) {
    return { error: 'Perfil inválido.' }
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('profiles')
    .update({ role: novoRole })
    .eq('id', membroId)

  if (error) {
    return { error: 'Não foi possível alterar o perfil.' }
  }

  revalidatePath('/admin/membros')
  return {}
}

export async function revogarAcessoAction(
  membroId: string
): Promise<{ error?: string }> {
  try {
    await requireRole(['admin'])
  } catch {
    return { error: 'Acesso negado.' }
  }

  const profile = await getUserProfile()
  if (!profile) return { error: 'Acesso negado.' }

  if (membroId === profile.id) {
    return { error: 'Você não pode revogar o seu próprio acesso.' }
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('profiles')
    .update({ ativo: false })
    .eq('id', membroId)

  if (error) {
    return { error: 'Não foi possível revogar o acesso.' }
  }

  revalidatePath('/admin/membros')
  return {}
}

export async function reativarAcessoAction(
  membroId: string
): Promise<{ error?: string }> {
  try {
    await requireRole(['admin'])
  } catch {
    return { error: 'Acesso negado.' }
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('profiles')
    .update({ ativo: true })
    .eq('id', membroId)

  if (error) {
    return { error: 'Não foi possível reativar o acesso.' }
  }

  revalidatePath('/admin/membros')
  return {}
}
