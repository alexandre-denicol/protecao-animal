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
  'hero_imagem_url',
  'socios_titulo',
  'socios_texto',
  'socios_valor_minimo',
  'socios_cta_titulo',
  'socios_cta_subtitulo',
  'socios_mensagem_admin',
  'socios_whatsapp_triagem_template',
  'socios_whatsapp_boas_vindas_template',
  'socios_whatsapp_cobranca_template',
  'socios_email_triagem_assunto',
  'socios_email_triagem_corpo',
  'socios_email_boas_vindas_assunto',
  'socios_email_boas_vindas_corpo',
  'socios_email_cobranca_assunto',
  'socios_email_cobranca_corpo',
  'email_sender_name',
  'email_reply_to',
] as const

export type SettingKey = (typeof SETTING_KEYS)[number]
export type SiteSettings = Record<SettingKey, string>

export type PublicSettingKey = SettingKey
export type PublicSiteSettings = SiteSettings

export const SETTING_DEFAULTS: SiteSettings = {
  hero_titulo: 'Amiga Miau',
  hero_subtitulo:
    'Conheça os animais disponíveis para adoção e acompanhe o trabalho da associação.',
  missao: '',
  animais_resgatados: '0',
  animais_adotados: '0',
  animais_em_espera: '0',
  pix_chave: '',
  instagram_url: '',
  facebook_url: '',
  whatsapp_numero: '',
  hero_imagem_url: '',
  socios_titulo: 'Quero ser sócio',
  socios_texto:
    'Ao se tornar sócio, você ajuda a manter cuidados contínuos para os animais acolhidos pela associação.',
  socios_valor_minimo: '',
  socios_cta_titulo: 'Faça parte dessa corrente de cuidado',
  socios_cta_subtitulo:
    'Preencha seus dados e nossa equipe entra em contato para combinar a melhor forma de contribuição.',
  socios_mensagem_admin:
    'Entre em contato pelo WhatsApp, apresente a proposta de associação e confirme valor, forma de pagamento e vencimento.',
  socios_whatsapp_triagem_template:
    'Olá, {nome}! Recebemos seu cadastro para ser sócio da Amiga Miau. Podemos conversar sobre a contribuição mensal?',
  socios_whatsapp_boas_vindas_template:
    'Olá, {nome}! Seu cadastro como sócio da Amiga Miau foi confirmado. Muito obrigado por fazer parte dessa rede de cuidado.',
  socios_whatsapp_cobranca_template:
    'Olá, {nome}! Passando para lembrar com carinho sobre a mensalidade de sócio da Amiga Miau.',
  socios_email_triagem_assunto: 'Recebemos seu cadastro de sócio - Amiga Miau',
  socios_email_triagem_corpo:
    'Olá, {nome}! Recebemos seu cadastro para ser sócio da Amiga Miau. Nossa equipe vai conversar com você para combinar a contribuição mensal.',
  socios_email_boas_vindas_assunto: 'Bem-vindo(a) à rede de sócios da Amiga Miau',
  socios_email_boas_vindas_corpo:
    'Olá, {nome}! Obrigado por se tornar sócio da Amiga Miau. Sua contribuição ajuda a manter cuidado contínuo aos animais acolhidos.',
  socios_email_cobranca_assunto: 'Lembrete de mensalidade - Amiga Miau',
  socios_email_cobranca_corpo:
    'Olá, {nome}! Este é um lembrete amigável sobre a mensalidade de sócio da Amiga Miau.',
  email_sender_name: 'Amiga Miau',
  email_reply_to: '',
}

export const PUBLIC_SETTING_DEFAULTS: PublicSiteSettings = {
  ...SETTING_DEFAULTS,
}

function isPublicSettingKey(key: string): key is PublicSettingKey {
  return (SETTING_KEYS as readonly string[]).includes(key)
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
