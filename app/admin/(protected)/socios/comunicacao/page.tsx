import type { Metadata } from 'next'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/auth/roles'
import { getPublicSiteSettings, type SettingKey } from '@/lib/site-settings'
import { createClient } from '@/lib/supabase/server'
import MembershipAdminTabs from '../MembershipAdminTabs'

export const metadata: Metadata = { title: 'Comunicação — Amiga Miau Admin' }

const COMMUNICATION_FIELDS: {
  key: SettingKey
  label: string
  description: string
  rows?: number
}[] = [
  {
    key: 'socios_whatsapp_triagem_template',
    label: 'WhatsApp de triagem',
    description: 'Mensagem usada para o primeiro contato com interessados.',
    rows: 3,
  },
  {
    key: 'socios_whatsapp_boas_vindas_template',
    label: 'WhatsApp de boas-vindas',
    description: 'Mensagem usada com sócios convertidos.',
    rows: 3,
  },
  {
    key: 'socios_whatsapp_cobranca_template',
    label: 'WhatsApp de cobrança',
    description: 'Lembrete amigável para mensalidades.',
    rows: 3,
  },
  {
    key: 'socios_email_triagem_assunto',
    label: 'Assunto do email de triagem',
    description: 'Assunto usado no primeiro email enviado pelo sistema.',
  },
  {
    key: 'socios_email_triagem_corpo',
    label: 'Corpo do email de triagem',
    description: 'Mensagem inicial para interessados em se tornar sócios.',
    rows: 5,
  },
  {
    key: 'socios_email_boas_vindas_assunto',
    label: 'Assunto do email de boas-vindas',
    description: 'Assunto usado no email de boas-vindas enviado pelo sistema.',
  },
  {
    key: 'socios_email_boas_vindas_corpo',
    label: 'Corpo do email de boas-vindas',
    description: 'Mensagem enviada para sócios convertidos.',
    rows: 5,
  },
  {
    key: 'socios_email_cobranca_assunto',
    label: 'Assunto do email de cobrança',
    description: 'Assunto usado no email de cobrança enviado pelo sistema.',
  },
  {
    key: 'socios_email_cobranca_corpo',
    label: 'Corpo do email de cobrança',
    description: 'Mensagem usada para lembrete de mensalidade.',
    rows: 5,
  },
  {
    key: 'email_sender_name',
    label: 'Nome do remetente',
    description: 'Nome exibido para o destinatário. O endereço real é controlado pelo sistema.',
  },
  {
    key: 'email_reply_to',
    label: 'Reply-to',
    description: 'Email para respostas do destinatário. Deixe vazio para não enviar reply-to.',
  },
]

interface PageProps {
  searchParams: Promise<{ salvo?: string; erro?: string }>
}

async function salvarComunicacaoSociosAction(formData: FormData): Promise<void> {
  'use server'

  const profile = await getUserProfile()
  if (!profile) redirect('/admin/login')
  if (profile.role !== 'admin') redirect('/admin/socios/comunicacao?erro=acesso')

  const supabase = await createClient()
  const upserts = COMMUNICATION_FIELDS.map((field) => ({
    id: field.key,
    value: ((formData.get(field.key) as string | null) ?? '').trim(),
  }))

  const { error } = await supabase
    .from('site_settings')
    .upsert(upserts, { onConflict: 'id' })

  if (error) {
    console.error('[MEMBERSHIP COMMUNICATION SETTINGS ERROR]', error)
    redirect('/admin/socios/comunicacao?erro=salvar')
  }

  revalidatePath('/admin/socios')
  revalidatePath('/admin/membros')
  revalidatePath('/admin/socios/comunicacao')
  redirect('/admin/socios/comunicacao?salvo=1')
}

function fieldClass() {
  return 'w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100'
}

export default async function ComunicacaoSociosPage({ searchParams }: PageProps) {
  const profile = await getUserProfile()
  if (!profile) redirect('/admin/login')
  if (profile.role === 'editor') redirect('/admin/sem-permissao')

  const { salvo, erro } = await searchParams
  const settings = await getPublicSiteSettings()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-800">
          Gerenciar sócios
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Configure os modelos de WhatsApp, email, nome do remetente e reply-to.
        </p>
      </div>

      <MembershipAdminTabs active="Comunicação" />

      {salvo === '1' && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
          Modelos salvos com sucesso.
        </div>
      )}

      {erro && (
        <div className="mb-4 rounded-lg border border-salmon-200 bg-salmon-50 px-4 py-3 text-sm font-semibold text-salmon-700">
          {erro === 'acesso'
            ? 'Apenas administradores podem alterar os modelos.'
            : 'Não foi possível salvar os modelos.'}
        </div>
      )}

      <form
        action={salvarComunicacaoSociosAction}
        className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm"
      >
        <div className="mb-5 rounded-xl bg-neutral-50 p-4 text-sm text-neutral-600">
          Placeholders aceitos: <strong>{'{nome}'}</strong>,{' '}
          <strong>{'{valor}'}</strong>, <strong>{'{vencimento}'}</strong> e{' '}
          <strong>{'{animal}'}</strong>.
        </div>

        <div className="grid gap-5">
          {COMMUNICATION_FIELDS.map((field) => (
            <div key={field.key}>
              <label
                htmlFor={field.key}
                className="mb-1 block text-sm font-bold text-neutral-700"
              >
                {field.label}
              </label>
              <p className="mb-2 text-xs text-neutral-400">{field.description}</p>
              {field.rows ? (
                <textarea
                  id={field.key}
                  name={field.key}
                  rows={field.rows}
                  defaultValue={settings[field.key]}
                  className={`${fieldClass()} resize-none`}
                />
              ) : (
                <input
                  id={field.key}
                  name={field.key}
                  type="text"
                  defaultValue={settings[field.key]}
                  className={fieldClass()}
                />
              )}
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="mt-6 rounded-lg bg-neutral-800 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-neutral-700 focus:outline-2 focus:outline-neutral-300 focus:outline-offset-2"
        >
          Salvar modelos
        </button>
      </form>
    </div>
  )
}
