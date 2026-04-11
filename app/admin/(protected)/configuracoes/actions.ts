'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireRole } from '@/lib/auth/roles'
import { createClient } from '@/lib/supabase/server'
import { SETTING_KEYS } from '@/lib/site-settings'

export async function salvarConfiguracoesAction(formData: FormData): Promise<void> {
  try {
    await requireRole(['admin'])
  } catch {
    redirect('/admin/configuracoes?erro=acesso_negado')
  }

  const supabase = await createClient()

  const upserts = SETTING_KEYS.map((key) => ({
    id: key,
    value: (formData.get(key) as string | null)?.trim() ?? '',
  }))

  const { error } = await supabase
    .from('site_settings')
    .upsert(upserts, { onConflict: 'id' })

  if (error) {
    redirect('/admin/configuracoes?erro=salvar')
  }

  revalidatePath('/')
  revalidatePath('/socios')
  revalidatePath('/admin/configuracoes')
  redirect('/admin/configuracoes?salvo=1')
}
