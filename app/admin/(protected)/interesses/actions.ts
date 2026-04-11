'use server'

import { revalidatePath } from 'next/cache'
import { requireRole } from '@/lib/auth/roles'
import { sendDirectEmail } from '@/lib/email'
import { isValidEmailAddress } from '@/lib/membership'
import { getPublicSiteSettings } from '@/lib/site-settings'
import { createClient } from '@/lib/supabase/server'

export interface InterestActionResult {
  error?: string
  success?: string
}

export async function markInterestAsRead(id: string): Promise<InterestActionResult> {
  try {
    await requireRole(['admin', 'viewer'])
  } catch {
    return { error: 'Acesso negado.' }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('adoption_interests')
    .update({ lida: true })
    .eq('id', id)

  if (error) {
    return { error: 'Não foi possível marcar o interesse como lido.' }
  }

  revalidatePath('/admin/interesses')
  return { success: 'Interesse marcado como lido.' }
}

export async function sendAdoptionInterestReplyEmail(
  id: string
): Promise<InterestActionResult> {
  console.error('[INTEREST REPLY EMAIL] action chamada', { id })

  try {
    await requireRole(['admin', 'viewer', 'editor'])
  } catch {
    return { error: 'Acesso negado.' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('adoption_interests')
    .select('id, nome, email, animals(nome)')
    .eq('id', id)
    .single()

  if (error || !data) {
    console.error('[INTEREST REPLY EMAIL READ ERROR]', error)
    return { error: 'Não foi possível enviar o email.' }
  }

  const interest = data as {
    id: string
    nome: string
    email: string
    animals: { nome: string } | { nome: string }[] | null
  }

  if (!isValidEmailAddress(interest.email)) {
    console.error('[INTEREST REPLY EMAIL] email inválido', {
      id,
      destinatario: interest.email,
    })
    return { error: 'Este interesse não possui um email válido.' }
  }

  const animalNome = Array.isArray(interest.animals)
    ? interest.animals[0]?.nome ?? 'o animal'
    : interest.animals?.nome ?? 'o animal'
  const settings = await getPublicSiteSettings()
  const subject = `Sobre seu interesse em adoção - ${animalNome}`
  const message = [
    `Olá, ${interest.nome}!`,
    '',
    `Recebemos seu interesse em adotar ${animalNome}.`,
    'Nossa equipe vai continuar a conversa com você por aqui.',
    '',
    'Equipe Amiga Miau',
  ].join('\n')

  try {
    console.error('[INTEREST REPLY EMAIL] destinatario:', interest.email.trim())
    console.error('[INTEREST REPLY EMAIL] assunto:', subject)
    console.error('[INTEREST REPLY EMAIL] resend configurado:', Boolean(process.env.RESEND_API_KEY))

    const result = await sendDirectEmail({
      to: interest.email.trim(),
      subject,
      message,
      senderName: settings.email_sender_name,
      replyTo: settings.email_reply_to,
    })

    console.error('[INTEREST REPLY EMAIL SUCCESS]', {
      id,
      destinatario: result.to,
      assunto: result.subject,
      providerId: result.providerId ?? null,
    })
  } catch (sendError) {
    console.error('[INTEREST REPLY EMAIL ERROR]', sendError)
    return { error: 'Não foi possível enviar o email.' }
  }

  return { success: 'Email enviado ao interessado.' }
}
