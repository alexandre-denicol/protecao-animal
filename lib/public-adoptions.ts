import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

export type PublicAdoption = {
  id: string
  animal_nome: string
  foto_url: string | null
  depoimento: string | null
  adotante_nome: string | null
  data_adocao: string
}

export type PublicAdoptionsResult = {
  adoptions: PublicAdoption[]
  failed: boolean
}

const SUPABASE_PUBLIC_STORAGE_PATH = '/storage/v1/object/public/'

/**
 * Só devolve URLs que o next/image aceita (espelha images.remotePatterns de
 * next.config.mjs) ou caminhos do próprio site. Qualquer outra coisa vira "sem
 * foto", em vez de derrubar a página com erro de host não configurado.
 */
export function safeAdoptionPhotoUrl(url: string | null): string | null {
  const trimmed = url?.trim()

  if (!trimmed) return null
  if (trimmed.startsWith('/')) return trimmed.startsWith('//') ? null : trimmed

  try {
    const { protocol, hostname, pathname } = new URL(trimmed)
    const isSupabaseStorage =
      hostname.endsWith('.supabase.co') && pathname.startsWith(SUPABASE_PUBLIC_STORAGE_PATH)

    return protocol === 'https:' && (isSupabaseStorage || hostname === 'images.unsplash.com')
      ? trimmed
      : null
  } catch {
    return null
  }
}

/** "março de 2026"; vazio quando a data não é válida. */
export function formatAdoptionMonth(data: string): string {
  const parsed = new Date(`${data}T12:00:00`)

  return Number.isNaN(parsed.getTime())
    ? ''
    : parsed.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}

async function fetchPublicAdoptions(limit?: number): Promise<PublicAdoptionsResult> {
  try {
    const supabase = await createClient()

    const query = supabase
      .from('adoptions')
      .select('id, animal_nome, foto_url, depoimento, adotante_nome, data_adocao')
      .order('data_adocao', { ascending: false })
      .order('id', { ascending: true })

    const { data, error } = await (limit ? query.limit(limit) : query)

    if (error || !data) {
      if (error) console.error('[PUBLIC ADOPTIONS ERROR]', error)
      return { adoptions: [], failed: true }
    }

    return {
      adoptions: (data as PublicAdoption[]).map((adoption) => ({
        ...adoption,
        foto_url: safeAdoptionPhotoUrl(adoption.foto_url),
      })),
      failed: false,
    }
  } catch (error) {
    console.error('[PUBLIC ADOPTIONS ERROR]', error)
    return { adoptions: [], failed: true }
  }
}

/**
 * Todas as adoções registradas pela equipe (somente leitura). Distingue "não há
 * histórias" de "a consulta falhou".
 */
export const getPublicAdoptions = cache(
  (): Promise<PublicAdoptionsResult> => fetchPublicAdoptions(),
)

/**
 * As mais recentes, para a Home. Falha de consulta equivale a "sem histórias":
 * a Home simplesmente não exibe o bloco.
 */
export const getRecentPublicAdoptions = cache(
  async (limit = 3): Promise<PublicAdoption[]> =>
    (await fetchPublicAdoptions(limit)).adoptions,
)
