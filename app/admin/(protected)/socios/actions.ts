'use server'

import { revalidatePath } from 'next/cache'
import { requireRole } from '@/lib/auth/roles'
import {
  fillMembershipTemplate,
  isValidEmailAddress,
} from '@/lib/membership'
import { getPublicSiteSettings } from '@/lib/site-settings'
import { createClient } from '@/lib/supabase/server'
import type { MembershipInterest } from '@/types'

export interface MembershipAdminActionResult {
  error?: string
  success?: string
}

export async function markMembershipAsRead(
  id: string
): Promise<MembershipAdminActionResult> {
  try {
    await requireRole(['admin', 'viewer'])
  } catch {
    return { error: 'Acesso negado.' }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('membership_interests')
    .update({ lida: true })
    .eq('id', id)

  if (error) {
    return { error: 'Não foi possível marcar o cadastro como lido.' }
  }

  revalidatePath('/admin/socios')
  return { success: 'Cadastro marcado como lido' }
}

export async function convertMembershipInterest(
  id: string
): Promise<MembershipAdminActionResult> {
  try {
    await requireRole(['admin', 'viewer'])
  } catch {
    return { error: 'Acesso negado.' }
  }

  const supabase = await createClient()

  const { data: interest, error: interestError } = await supabase
    .from('membership_interests')
    .select('id, nome, email, endereco, cidade, estado, cpf, whatsapp, mensagem, lida, created_at')
    .eq('id', id)
    .single()

  if (interestError || !interest) {
    console.error('[MEMBERSHIP INTEREST READ ERROR]', interestError)
    return { error: 'Não foi possível converter este cadastro.' }
  }

  const membershipInterest = interest as MembershipInterest

  const { data: existingMember, error: existingError } = await supabase
    .from('members')
    .select('id')
    .eq('interest_id', id)
    .maybeSingle()

  if (existingError) {
    console.error('[MEMBER EXISTING READ ERROR]', existingError)
    return { error: 'Não foi possível converter este cadastro.' }
  }

  if (existingMember) {
    revalidatePath('/admin/socios')
    return { success: 'Cadastro já convertido' }
  }

  const { error: insertError } = await supabase.from('members').insert({
    interest_id: membershipInterest.id,
    nome: membershipInterest.nome,
    email: membershipInterest.email,
    endereco: membershipInterest.endereco,
    cidade: membershipInterest.cidade,
    estado: membershipInterest.estado,
    cpf: membershipInterest.cpf,
    whatsapp: membershipInterest.whatsapp,
    observacoes: membershipInterest.mensagem,
    status: 'pendente',
  })

  if (insertError) {
    console.error('[MEMBER INSERT ERROR]', insertError)
    return { error: 'Não foi possível converter este cadastro.' }
  }

  await supabase
    .from('membership_interests')
    .update({ lida: true })
    .eq('id', membershipInterest.id)

  revalidatePath('/admin/socios')
  revalidatePath('/admin/membros')
  return { success: 'Cadastro convertido em sócio' }
}

export async function sendMembershipTriageEmail(
  id: string
): Promise<MembershipAdminActionResult> {
  console.error('[EMAIL TRIAGEM] action chamada', { id })

  try {
    await requireRole(['admin', 'viewer'])
  } catch {
    return { error: 'Acesso negado.' }
  }

  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  const userId = authData.user?.id ?? null

  const { data: interest, error: interestError } = await supabase
    .from('membership_interests')
    .select('id, nome, email')
    .eq('id', id)
    .single()

  if (interestError || !interest) {
    console.error('[MEMBERSHIP TRIAGE EMAIL READ ERROR]', interestError)
    return { error: 'Não foi possível enviar o email.' }
  }

  const membershipInterest = interest as Pick<
    MembershipInterest,
    'id' | 'nome' | 'email'
  >

  if (!isValidEmailAddress(membershipInterest.email)) {
    console.error('[EMAIL TRIAGEM] email inválido', {
      id,
      destinatario: membershipInterest.email,
    })
    return { error: 'Este cadastro não possui um email válido.' }
  }

  const settings = await getPublicSiteSettings()
  let emailResult: Awaited<ReturnType<typeof import('@/lib/email')['sendMembershipEmail']>>

  try {
    const { sendMembershipEmail } = await import('@/lib/email')
    const templateName = 'socios_email_triagem'

    console.error('[EMAIL TRIAGEM] destinatario:', membershipInterest.email.trim())
    console.error('[EMAIL TRIAGEM] assunto template:', settings.socios_email_triagem_assunto)
    console.error('[EMAIL TRIAGEM] template usado:', templateName)
    console.error('[EMAIL TRIAGEM] resend configurado:', Boolean(process.env.RESEND_API_KEY))

    emailResult = await sendMembershipEmail({
      to: membershipInterest.email.trim(),
      subjectTemplate: settings.socios_email_triagem_assunto,
      bodyTemplate: settings.socios_email_triagem_corpo,
      templateData: {
        nome: membershipInterest.nome,
      },
      senderName: settings.email_sender_name,
      replyTo: settings.email_reply_to,
    })

    console.error('[EMAIL TRIAGEM SUCCESS]', {
      id,
      destinatario: emailResult.to,
      assunto: emailResult.subject,
      providerId: emailResult.providerId ?? null,
    })
  } catch (error) {
    console.error('[EMAIL TRIAGEM ERROR]', error)
    return { error: 'Não foi possível enviar o email.' }
  }

  const { error: historyError } = await supabase
    .from('member_contact_history')
    .insert({
      membership_interest_id: membershipInterest.id,
      member_id: null,
      canal: 'email',
      tipo: 'triagem',
      destinatario: membershipInterest.email.trim(),
      assunto: emailResult.subject,
      mensagem: emailResult.message,
      enviado_por: userId,
    })

  if (historyError) {
    console.error('[MEMBERSHIP TRIAGE EMAIL HISTORY ERROR]', historyError)
    return { error: 'Email enviado, mas não foi possível registrar o histórico.' }
  }

  revalidatePath('/admin/socios')
  return { success: 'Email inicial enviado' }
}

export async function registerMembershipInterestWhatsAppContact(
  id: string
): Promise<MembershipAdminActionResult> {
  try {
    await requireRole(['admin', 'viewer'])
  } catch {
    return { error: 'Acesso negado.' }
  }

  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  const userId = authData.user?.id ?? null

  const { data: interest, error: interestError } = await supabase
    .from('membership_interests')
    .select('id, nome, whatsapp')
    .eq('id', id)
    .single()

  if (interestError || !interest) {
    console.error('[MEMBERSHIP WHATSAPP READ ERROR]', interestError)
    return { error: 'Não foi possível registrar o contato.' }
  }

  const membershipInterest = interest as Pick<
    MembershipInterest,
    'id' | 'nome' | 'whatsapp'
  >
  const settings = await getPublicSiteSettings()
  const message = fillMembershipTemplate(
    settings.socios_whatsapp_triagem_template,
    { nome: membershipInterest.nome }
  )

  const { error: historyError } = await supabase
    .from('member_contact_history')
    .insert({
      membership_interest_id: membershipInterest.id,
      member_id: null,
      canal: 'whatsapp',
      tipo: 'triagem',
      destinatario: membershipInterest.whatsapp,
      assunto: null,
      mensagem: message,
      enviado_por: userId,
    })

  if (historyError) {
    console.error('[MEMBERSHIP WHATSAPP HISTORY ERROR]', historyError)
    return { error: 'Não foi possível registrar o contato.' }
  }

  revalidatePath('/admin/socios')
  return { success: 'Contato por WhatsApp registrado' }
}
