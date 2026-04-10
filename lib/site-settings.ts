import 'server-only'
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

export const SETTING_KEYS = [
  'hero_titulo',
  'hero_subtitulo',
  'missao',
  'animais_resgatados',
  'animais_adotados',
  'animais_em_espera',
  'pix_chave',
  'instagram_url',
  'facebook_url',
  'whatsapp_numero',
] as const

export type SettingKey = (typeof SETTING_KEYS)[number]
export type SiteSettings = Record<SettingKey, string>

const PUBLIC_SETTING_KEYS = [
  ...SETTING_KEYS,
  'hero_imagem_url',
] as const

export type PublicSettingKey = (typeof PUBLIC_SETTING_KEYS)[number]
export type PublicSiteSettings = Record<PublicSettingKey, string>

export const SETTING_DEFAULTS: SiteSettings = {
  hero_titulo: 'Todo animal merece um lar cheio de amor',
  hero_subtitulo:
    'Resgatamos, cuidamos e encontramos famílias perfeitas para cada animal. Venha conhecer quem está esperando por você.',
  missao: '',
  animais_resgatados: '0',
  animais_adotados: '0',
  animais_em_espera: '0',
  pix_chave: '49728609000170',
  instagram_url: '',
  facebook_url: '',
  whatsapp_numero: '',
}

export const PUBLIC_SETTING_DEFAULTS: PublicSiteSettings = {
  ...SETTING_DEFAULTS,
  hero_imagem_url: '',
}

function isPublicSettingKey(key: string): key is PublicSettingKey {
  return (PUBLIC_SETTING_KEYS as readonly string[]).includes(key)
}

export const getPublicSiteSettings = cache(
  async (): Promise<PublicSiteSettings> => {
    const settings: PublicSiteSettings = { ...PUBLIC_SETTING_DEFAULTS }

    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('site_settings')
        .select('id, value')

      if (error) {
        console.error('[SITE SETTINGS READ ERROR]', error)
        return settings
      }

      for (const row of (data ?? []) as { id: string; value: string | null }[]) {
        if (isPublicSettingKey(row.id) && row.value !== null) {
          settings[row.id] = row.value
        }
      }
    } catch (error) {
      console.error('[SITE SETTINGS READ ERROR]', error)
    }

    return settings
  },
)
