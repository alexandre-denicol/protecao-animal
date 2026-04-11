import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export type UserRole = 'admin' | 'editor' | 'viewer'

export interface UserProfile {
  id: string
  nome: string
  email: string
  role: UserRole
  ativo: boolean
}

export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('id, nome, email, role, ativo')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.ativo) return null
  return profile as UserProfile
}

export async function getUserRole(): Promise<UserRole | null> {
  const profile = await getUserProfile()
  return profile?.role ?? null
}

export async function requireRole(allowedRoles: UserRole[]): Promise<UserRole> {
  const role = await getUserRole()
  if (!role || !allowedRoles.includes(role)) {
    throw new Error('Acesso negado')
  }
  return role
}

export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole()
  return role === 'admin'
}