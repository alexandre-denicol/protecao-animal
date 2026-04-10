'use server'

import { revalidatePath } from 'next/cache'
import { requireRole } from '@/lib/auth/roles'
import { createClient } from '@/lib/supabase/server'

export async function markInterestAsRead(id: string): Promise<{ error?: string }> {
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
  return {}
}
