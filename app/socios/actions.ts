'use server'

import { sendMembershipInterestEmail } from '@/lib/email'
import { isBrazilianState, onlyDigits } from '@/lib/membership'
import { createClient } from '@/lib/supabase/server'
import {
  type PhoneCountry,
  normalizePhoneNumber,
  validatePhoneNumber,
} from '@/lib/whatsapp'

type MembershipInterestField =
  | 'nome'
  | 'email'
  | 'endereco'
  | 'cidade'
  | 'estado'
  | 'cpf'
  | 'whatsapp'
  | 'mensagem'

export interface MembershipInterestState {
  success?: boolean
  message?: string
  error?: string
  fieldErrors?: Partial<Record<MembershipInterestField, string>>
}

function formValue(formData: FormData, name: string): string {
  return (formData.get(name) as string | null)?.trim() ?? ''
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function createMembershipInterestAction(
  formData: FormData
): Promise<MembershipInterestState> {
  const nome = formValue(formData, 'nome')
  const email = formValue(formData, 'email').toLowerCase()
  const endereco = formValue(formData, 'endereco')
  const cidade = formValue(formData, 'cidade')
  const estado = formValue(formData, 'estado').toUpperCase()
  const cpf = onlyDigits(formValue(formData, 'cpf'))
  const whatsappRaw = formValue(formData, 'whatsapp')
  const whatsappCountry =
    (formValue(formData, 'whatsapp_country') as PhoneCountry) || 'BR'
  const mensagem = formValue(formData, 'mensagem') || null

  const fieldErrors: Partial<Record<MembershipInterestField, string>> = {}

  if (nome.length < 2 || nome.length > 100) {
    fieldErrors.nome = 'Informe seu nome com pelo menos 2 caracteres.'
  }

  if (!isValidEmail(email)) {
    fieldErrors.email = 'Informe um email válido.'
  }

  if (endereco.length < 5 || endereco.length > 200) {
    fieldErrors.endereco = 'Informe rua, número e bairro.'
  }

  if (cidade.length < 2 || cidade.length > 100) {
    fieldErrors.cidade = 'Informe sua cidade.'
  }

  if (!isBrazilianState(estado)) {
    fieldErrors.estado = 'Selecione um estado.'
  }

  if (cpf.length !== 11) {
    fieldErrors.cpf = 'Informe um CPF com 11 dígitos.'
  }

  const whatsappError = validatePhoneNumber(whatsappRaw, whatsappCountry, {
    label: 'um WhatsApp',
  })

  if (whatsappError) {
    fieldErrors.whatsapp = whatsappError
  }

  if (mensagem && mensagem.length > 1000) {
    fieldErrors.mensagem = 'A mensagem deve ter até 1000 caracteres.'
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors }
  }

  const whatsapp = normalizePhoneNumber(whatsappRaw, whatsappCountry)

  if (!whatsapp) {
    return {
      fieldErrors: {
        whatsapp: 'Informe um WhatsApp válido.',
      },
    }
  }

  const supabase = await createClient()

  const { error } = await supabase.from('membership_interests').insert({
    nome,
    email,
    endereco,
    cidade,
    estado,
    cpf,
    whatsapp,
    mensagem,
  })

  if (error) {
    console.error('[MEMBERSHIP INTEREST INSERT ERROR]', error)
    return { error: 'Não foi possível enviar seu cadastro. Tente novamente.' }
  }

  try {
    console.error('[MEMBERSHIP INTEREST EMAIL] action chamada')
    console.error('[MEMBERSHIP INTEREST EMAIL] destinatario: equipe')
    console.error('[MEMBERSHIP INTEREST EMAIL] assunto:', `Novo cadastro de sócio - ${nome}`)
    console.error('[MEMBERSHIP INTEREST EMAIL] resend configurado:', Boolean(process.env.RESEND_API_KEY))

    await sendMembershipInterestEmail({
      nome,
      endereco,
      cidade,
      estado,
      cpf,
      whatsapp,
      mensagem,
    })

    console.error('[MEMBERSHIP INTEREST EMAIL SUCCESS]', {
      assunto: `Novo cadastro de sócio - ${nome}`,
      origem: email,
    })
  } catch (error) {
    console.error('[MEMBERSHIP INTEREST EMAIL ERROR]', error)
  }

  return {
    success: true,
    message: 'Cadastro enviado! Em breve entraremos em contato.',
  }
}
