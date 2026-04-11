'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const ERRO_GENERICO = 'Email ou senha incorretos.'

type LoginState = { error: string } | { success: true } | null

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = (formData.get('email') as string | null)?.trim() ?? ''
  const senha = (formData.get('senha') as string | null) ?? ''

  if (!email || !senha) {
    return { error: ERRO_GENERICO }
  }

  const supabase = await createClient()

  const { error: authError } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  })

  if (authError) {
    return { error: ERRO_GENERICO }
  }

  return { success: true }
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}
