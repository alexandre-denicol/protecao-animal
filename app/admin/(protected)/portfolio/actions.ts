'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireRole } from '@/lib/auth/roles'
import { createClient } from '@/lib/supabase/server'

export interface PortfolioFormState {
  error?: string
  fieldErrors?: Partial<Record<string, string>>
}

export async function createAdocaoAction(
  _prev: PortfolioFormState,
  formData: FormData
): Promise<PortfolioFormState> {
  try {
    await requireRole(['admin', 'editor'])
  } catch {
    return { error: 'Acesso negado.' }
  }

  const animal_id = (formData.get('animal_id') as string | null) || null
  const animal_nome = ((formData.get('animal_nome') as string | null) ?? '').trim()
  const adotante_nome = ((formData.get('adotante_nome') as string | null) ?? '').trim() || null
  const depoimento = ((formData.get('depoimento') as string | null) ?? '').trim() || null
  const data_adocao = (formData.get('data_adocao') as string | null) ?? ''
  const foto_url = (formData.get('foto_url') as string | null) || null
  const storage_path = (formData.get('storage_path') as string | null) || null

  const fieldErrors: Partial<Record<string, string>> = {}

  if (!animal_nome) fieldErrors.animal_nome = 'Nome do animal é obrigatório.'
  if (!data_adocao) fieldErrors.data_adocao = 'Data da adoção é obrigatória.'

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors }
  }

  const supabase = await createClient()

  const { error } = await supabase.from('adoptions').insert({
    animal_id,
    animal_nome,
    adotante_nome,
    depoimento,
    data_adocao,
    foto_url,
    storage_path,
  })

  if (error) {
    return { error: 'Não foi possível salvar o caso. Tente novamente.' }
  }

  revalidatePath('/admin/portfolio')
  redirect('/admin/portfolio')
}

export async function updateAdocaoAction(
  id: string,
  _prev: PortfolioFormState,
  formData: FormData
): Promise<PortfolioFormState> {
  try {
    await requireRole(['admin', 'editor'])
  } catch {
    return { error: 'Acesso negado.' }
  }

  const animal_id = (formData.get('animal_id') as string | null) || null
  const animal_nome = ((formData.get('animal_nome') as string | null) ?? '').trim()
  const adotante_nome = ((formData.get('adotante_nome') as string | null) ?? '').trim() || null
  const depoimento = ((formData.get('depoimento') as string | null) ?? '').trim() || null
  const data_adocao = (formData.get('data_adocao') as string | null) ?? ''
  const foto_url = (formData.get('foto_url') as string | null) || null
  const storage_path = (formData.get('storage_path') as string | null) || null

  const fieldErrors: Partial<Record<string, string>> = {}

  if (!animal_nome) fieldErrors.animal_nome = 'Nome do animal é obrigatório.'
  if (!data_adocao) fieldErrors.data_adocao = 'Data da adoção é obrigatória.'

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors }
  }

  const supabase = await createClient()

  const updates: Record<string, string | null> = {
    animal_id,
    animal_nome,
    adotante_nome,
    depoimento,
    data_adocao,
  }
  if (foto_url) {
    updates.foto_url = foto_url
    updates.storage_path = storage_path
  }

  const { error } = await supabase.from('adoptions').update(updates).eq('id', id)

  if (error) {
    return { error: 'Não foi possível atualizar o caso. Tente novamente.' }
  }

  revalidatePath('/admin/portfolio')
  redirect('/admin/portfolio')
}

export async function deleteAdocaoAction(
  id: string
): Promise<{ error?: string }> {
  try {
    await requireRole(['admin', 'editor'])
  } catch {
    return { error: 'Acesso negado.' }
  }

  const supabase = await createClient()

  const { error } = await supabase.from('adoptions').delete().eq('id', id)

  if (error) {
    return { error: 'Não foi possível excluir o caso.' }
  }

  revalidatePath('/admin/portfolio')
  return {}
}
