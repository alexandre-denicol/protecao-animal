'use server'

import { revalidatePath } from 'next/cache'
import { requireRole } from '@/lib/auth/roles'
import { createClient } from '@/lib/supabase/server'

export async function markMessageAsRead(id: string): Promise<{ error?: string }> {
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
  return {}
}
