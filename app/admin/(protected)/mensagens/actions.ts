'use server'

import { revalidatePath } from 'next/cache'
import { requireRole } from '@/lib/auth/roles'
import { sendDirectEmail } from '@/lib/email'
import { isValidEmailAddress } from '@/lib/membership'
import { getPublicSiteSettings } from '@/lib/site-settings'
import { createClient } from '@/lib/supabase/server'

export interface MessageActionResult {
  error?: string
  success?: string
}

export async function markMessageAsRead(id: string): Promise<MessageActionResult> {
  try {
    await requireRole(['admin', 'viewer'])
  } catch {
    return { error: 'Acesso negado.' }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('contact_messages')
    .update({ lida: true })
    .eq('id', id)

  if (error) {
    return { error: 'Não foi possível marcar a mensagem como lida.' }
  }

  revalidatePath('/admin/mensagens')
  return { success: 'Mensagem marcada como lida.' }
}

export async function sendContactReplyEmail(
  id: string
): Promise<MessageActionResult> {
  console.error('[CONTACT REPLY EMAIL] action chamada', { id })

  try {
    await requireRole(['admin', 'viewer'])
  } catch {
    return { error: 'Acesso negado.' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('contact_messages')
    .select('id, nome, email, assunto')
    .eq('id', id)
    .single()

  if (error || !data) {
    console.error('[CONTACT REPLY EMAIL READ ERROR]', error)
    return { error: 'Não foi possível enviar o email.' }
  }

  const messageData = data as {
    id: string
    nome: string
    email: string
    assunto: string
  }

  if (!isValidEmailAddress(messageData.email)) {
    console.error('[CONTACT REPLY EMAIL] email inválido', {
      id,
      destinatario: messageData.email,
    })
    return { error: 'Esta mensagem não possui um email válido.' }
  }

  const settings = await getPublicSiteSettings()
  const subject = `Re: ${messageData.assunto}`
  const message = [
    `Olá, ${messageData.nome}!`,
    '',
    'Recebemos sua mensagem e retornaremos por aqui.',
    '',
    'Equipe Amiga Miau',
  ].join('\n')

  try {
    console.error('[CONTACT REPLY EMAIL] destinatario:', messageData.email.trim())
    console.error('[CONTACT REPLY EMAIL] assunto:', subject)
    console.error('[CONTACT REPLY EMAIL] resend configurado:', Boolean(process.env.RESEND_API_KEY))

    const result = await sendDirectEmail({
      to: messageData.email.trim(),
      subject,
      message,
      senderName: settings.email_sender_name,
      replyTo: settings.email_reply_to,
    })

    console.error('[CONTACT REPLY EMAIL SUCCESS]', {
      id,
      destinatario: result.to,
      assunto: result.subject,
      providerId: result.providerId ?? null,
    })
  } catch (sendError) {
    console.error('[CONTACT REPLY EMAIL ERROR]', sendError)
    return { error: 'Não foi possível enviar o email.' }
  }

  return { success: 'Email enviado ao contato.' }
}
