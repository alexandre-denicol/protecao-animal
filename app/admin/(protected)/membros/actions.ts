'use server'

import { revalidatePath } from 'next/cache'
import { requireRole, getUserProfile } from '@/lib/auth/roles'
import { createAdminClient } from '@/lib/supabase/admin'
import type { UserRole } from '@/types'

export interface MembrosFormState {
  error?: string
  success?: string
  fieldErrors?: Partial<Record<string, string>>
}

const ROLES_VALIDOS: UserRole[] = ['admin', 'editor', 'viewer']

export async function convidarMembroAction(
  _prev: MembrosFormState,
  formData: FormData
): Promise<MembrosFormState> {
  try {
    await requireRole(['admin'])
  } catch {
    return { error: 'Acesso negado.' }
  }

  const email = ((formData.get('email') as string | null) ?? '').trim().toLowerCase()
  const nome = ((formData.get('nome') as string | null) ?? '').trim()
  const role = (formData.get('role') as string | null) as UserRole | null

  const fieldErrors: Partial<Record<string, string>> = {}

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldErrors.email = 'Insira um e-mail válido.'
  }
  if (!nome) fieldErrors.nome = 'Nome é obrigatório.'
  if (!role || !ROLES_VALIDOS.includes(role)) {
    fieldErrors.role = 'Selecione um perfil de acesso.'
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors }
  }

  const admin = createAdminClient()

  const { data: invite, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { nome },
  })

  if (inviteError) {
    if (inviteError.message?.includes('already')) {
      return { error: 'Este e-mail já está cadastrado no sistema.' }
    }
    return { error: 'Não foi possível enviar o convite. Tente novamente.' }
  }

  // Cria ou atualiza o perfil com o role correto
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
    return { error: 'Convite enviado, mas houve um erro ao definir o perfil. Verifique manualmente.' }
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

  if (!ROLES_VALIDOS.includes(novoRole)) {
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
