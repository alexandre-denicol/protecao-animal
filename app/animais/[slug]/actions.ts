'use server'

import { sendAdoptionInterestEmail } from '@/lib/email'
import { createClient } from '@/lib/supabase/server'

type AdoptionInterestField = 'nome' | 'email' | 'telefone' | 'mensagem'

export interface AdoptionInterestState {
  success?: boolean
  message?: string
  error?: string
  fieldErrors?: Partial<Record<AdoptionInterestField, string>>
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function formValue(formData: FormData, name: string): string {
  return (formData.get(name) as string | null)?.trim() ?? ''
}

export async function createAdoptionInterestAction(
  formData: FormData
): Promise<AdoptionInterestState> {
  const animalId = formValue(formData, 'animal_id')
  const nome = formValue(formData, 'nome')
  const email = formValue(formData, 'email')
  const telefone = formValue(formData, 'telefone') || null
  const mensagem = formValue(formData, 'mensagem') || null

  const fieldErrors: Partial<Record<AdoptionInterestField, string>> = {}

  if (nome.length < 2 || nome.length > 100) {
    fieldErrors.nome = 'Informe seu nome com pelo menos 2 caracteres.'
  }

  if (!EMAIL_REGEX.test(email)) {
    fieldErrors.email = 'Informe um email válido.'
  }

  if (telefone && telefone.length > 20) {
    fieldErrors.telefone = 'Informe um telefone com até 20 caracteres.'
  }

  if (mensagem && mensagem.length > 1000) {
    fieldErrors.mensagem = 'A mensagem deve ter até 1000 caracteres.'
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors }
  }

  if (!animalId) {
    return { error: 'Não foi possível enviar o interesse. Tente novamente.' }
  }

  const supabase = await createClient()

  const { data: animal, error: animalError } = await supabase
    .from('animals')
    .select('id, nome')
    .eq('id', animalId)
    .neq('status', 'adotado')
    .maybeSingle()

  if (animalError || !animal) {
    return { error: 'Não foi possível enviar o interesse. Tente novamente.' }
  }

  const { error: insertError } = await supabase
    .from('adoption_interests')
    .insert({
      animal_id: animalId,
      nome,
      email,
      telefone,
      mensagem,
    })

  if (insertError) {
    return { error: 'Não foi possível enviar o interesse. Tente novamente.' }
  }

  try {
    await sendAdoptionInterestEmail({
      animalNome: (animal as { nome: string }).nome,
      nome,
      email,
      telefone,
      mensagem,
    })
  } catch (e) {
    console.error('Erro ao enviar email de interesse', e)
  }

  return {
    success: true,
    message: 'Interesse enviado! Em breve entraremos em contato.',
  }
}
