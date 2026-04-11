'use server'

import { maskEmailForLogs, sendContactMessageEmail } from '@/lib/email'
import { createClient } from '@/lib/supabase/server'

type ContactMessageField = 'nome' | 'email' | 'assunto' | 'mensagem'

export interface ContactMessageState {
  success?: boolean
  message?: string
  error?: string
  fieldErrors?: Partial<Record<ContactMessageField, string>>
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function formValue(formData: FormData, name: string): string {
  return (formData.get(name) as string | null)?.trim() ?? ''
}

export async function createContactMessageAction(
  formData: FormData
): Promise<ContactMessageState> {
  const nome = formValue(formData, 'nome')
  const email = formValue(formData, 'email')
  const assunto = formValue(formData, 'assunto')
  const mensagem = formValue(formData, 'mensagem')

  const fieldErrors: Partial<Record<ContactMessageField, string>> = {}

  if (nome.length < 2 || nome.length > 100) {
    fieldErrors.nome = 'Informe seu nome com pelo menos 2 caracteres.'
  }

  if (!EMAIL_REGEX.test(email)) {
    fieldErrors.email = 'Informe um email válido.'
  }

  if (assunto.length < 2 || assunto.length > 150) {
    fieldErrors.assunto = 'Informe um assunto com pelo menos 2 caracteres.'
  }

  if (mensagem.length < 10 || mensagem.length > 2000) {
    fieldErrors.mensagem = 'Escreva uma mensagem com pelo menos 10 caracteres.'
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors }
  }

  const supabase = await createClient()

  const { error: insertError } = await supabase
    .from('contact_messages')
    .insert({
      nome,
      email,
      assunto,
      mensagem,
    })

  if (insertError) {
    return { error: 'Não foi possível enviar a mensagem. Tente novamente.' }
  }

  try {
    console.error('[CONTACT MESSAGE EMAIL] action chamada', {
      resendConfigurado: Boolean(process.env.RESEND_API_KEY),
      origem: maskEmailForLogs(email),
    })

    await sendContactMessageEmail({
      nome,
      email,
      assunto,
      mensagem,
    })

    console.error('[CONTACT MESSAGE EMAIL SUCCESS]', { origem: maskEmailForLogs(email) })
  } catch (e) {
    console.error('[CONTACT MESSAGE EMAIL ERROR]', e)
  }

  return {
    success: true,
    message: 'Mensagem enviada com sucesso!',
  }
}
