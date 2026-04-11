import 'server-only'

import { createServerClient } from '@supabase/ssr'

function getRequiredSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()

  if (!url) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL não configurado.')
  }

  return url
}

function getRequiredSupabaseAdminKey(): string {
  const adminKey =
    process.env.SUPABASE_SECRET_KEY?.trim() ??
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

  if (!adminKey) {
    throw new Error(
      'SUPABASE_SECRET_KEY ou SUPABASE_SERVICE_ROLE_KEY não configurado.'
    )
  }

  return adminKey
}

export function createAdminClient() {
  return createServerClient(
    getRequiredSupabaseUrl(),
    getRequiredSupabaseAdminKey(),
    { cookies: { getAll: () => [], setAll: () => {} } }
  )
}
