import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/auth/roles'
import { getPublicSiteSettings } from '@/lib/site-settings'
import { createClient } from '@/lib/supabase/server'
import type { Member, MemberContactHistory, MembershipInterest } from '@/types'
import AdminEmptyState from '@/components/admin/AdminEmptyState'
import AdminPanel from '@/components/admin/AdminPanel'
import AdminSectionHeading from '@/components/admin/AdminSectionHeading'
import MembershipAdminTabs from './MembershipAdminTabs'
import MembershipInterestCard from './MembershipInterestCard'

export const metadata: Metadata = { title: 'Sócios — Amiga Miau Admin' }

interface PageProps {
  searchParams: Promise<{ busca?: string; status?: string }>
}

type MemberSummary = Pick<Member, 'id' | 'interest_id' | 'status'>

type InterestWithMember = MembershipInterest & {
  member: MemberSummary | null
}

const FILTERS = [
  { label: 'Todos', value: 'todos' },
  { label: 'Não lidos', value: 'nao_lidos' },
  { label: 'Lidos', value: 'lidos' },
  { label: 'Convertidos', value: 'convertidos' },
] as const

function EmptyState() {
  return (
    <AdminEmptyState
      title="Nenhum cadastro encontrado"
      description="Ajuste a busca ou aguarde novos envios pelo formulário público para retomar a triagem."
    />
  )
}

export default async function SociosAdminPage({ searchParams }: PageProps) {
  const profile = await getUserProfile()

  if (!profile) redirect('/admin/login')
  if (profile.role === 'editor') redirect('/admin/sem-permissao')

  const { busca = '', status = 'todos' } = await searchParams
  const search = busca.trim()
  const supabase = await createClient()
  const settings = await getPublicSiteSettings()

  let query = supabase
    .from('membership_interests')
    .select('id, nome, email, endereco, cidade, estado, cpf, whatsapp, mensagem, lida, created_at')
    .order('created_at', { ascending: false })

  if (search) {
    query = query.ilike('nome', `%${search}%`)
  }

  if (status === 'nao_lidos') {
    query = query.eq('lida', false)
  }

  if (status === 'lidos') {
    query = query.eq('lida', true)
  }

  const [
    { data, error },
    { data: membersData, error: membersError },
    { data: contactsData, error: contactsError },
  ] =
    await Promise.all([
      query,
      supabase.from('members').select('id, interest_id, status'),
      supabase
        .from('member_contact_history')
        .select(
          'id, membership_interest_id, member_id, canal, tipo, destinatario, assunto, mensagem, enviado_por, created_at'
        )
        .not('membership_interest_id', 'is', null)
        .order('created_at', { ascending: false }),
    ])

  if (error) {
    console.error('[MEMBERSHIP INTERESTS READ ERROR]', error)
  }

  if (membersError) {
    console.error('[MEMBERS READ ERROR]', membersError)
  }

  if (contactsError) {
    console.error('[MEMBER CONTACT HISTORY READ ERROR]', contactsError)
  }

  const membersByInterest = new Map<string, MemberSummary>()
  const contactsByInterest = new Map<string, MemberContactHistory[]>()

  for (const member of (membersData ?? []) as MemberSummary[]) {
    if (member.interest_id) {
      membersByInterest.set(member.interest_id, member)
    }
  }

  for (const contact of (contactsData ?? []) as MemberContactHistory[]) {
    if (contact.membership_interest_id) {
      const current = contactsByInterest.get(contact.membership_interest_id) ?? []
      current.push(contact)
      contactsByInterest.set(contact.membership_interest_id, current)
    }
  }

  const allInterests = ((data ?? []) as MembershipInterest[]).map((interest) => ({
    ...interest,
    member: membersByInterest.get(interest.id) ?? null,
  }))

  const interests: InterestWithMember[] =
    status === 'convertidos'
      ? allInterests.filter((interest) => Boolean(interest.member))
      : allInterests

  const totalNaoLidos = allInterests.filter((interest) => !interest.lida).length
  const totalConvertidos = allInterests.filter((interest) => interest.member).length

  return (
    <div className="admin-page">
      <AdminSectionHeading
        eyebrow="Relacionamento"
        title="Gerenciar sócios"
        description="Faça a triagem dos interessados, registre contatos e transforme cadastros quentes em acompanhamento ativo com mais clareza."
        actions={
          <div className="flex flex-wrap gap-2">
            <span className="admin-chip">{totalNaoLidos} não lidos</span>
            <span className="admin-chip">{totalConvertidos} convertidos</span>
            <Link
              href="/admin/membros"
              className="inline-flex items-center justify-center rounded-xl bg-[var(--color-primary)] px-4 py-2 text-sm font-bold text-[#1f1406] transition-colors hover:bg-[var(--color-primary-hover)]"
            >
              Ver sócios ativos
            </Link>
          </div>
        }
      />

      <MembershipAdminTabs active="Triagem" />

      <div className="admin-toolbar mb-5">
        <form
          className="grid w-full gap-2 sm:grid-cols-[minmax(220px,1fr)_auto]"
          action="/admin/socios"
        >
          <div>
            <label htmlFor="busca" className="sr-only">
              Buscar por nome
            </label>
            <input
              id="busca"
              name="busca"
              type="search"
              defaultValue={search}
              placeholder="Buscar por nome"
              className="admin-input"
            />
          </div>
          <input type="hidden" name="status" value={status} />
          <button
            type="submit"
            className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-bold text-[#1f1406] transition-colors hover:bg-[var(--color-primary-hover)] focus:outline-2 focus:outline-[var(--color-primary)] focus:outline-offset-2"
          >
            Buscar
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((filter) => {
            const params = new URLSearchParams()
            if (search) params.set('busca', search)
            if (filter.value !== 'todos') params.set('status', filter.value)
            const href = params.toString()
              ? `/admin/socios?${params.toString()}`
              : '/admin/socios'
            const active = status === filter.value || (status === 'todos' && filter.value === 'todos')

            return (
              <Link
                key={filter.value}
                href={href}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? 'border-[rgba(244,184,96,0.22)] bg-[rgba(244,184,96,0.14)] text-[var(--color-primary)]'
                    : 'border-white/10 bg-white/5 text-[var(--color-text-muted)] hover:bg-white/10 hover:text-[var(--color-text-main)]'
                }`}
              >
                {filter.label}
              </Link>
            )
          })}
        </div>
      </div>

      {interests.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4">
          {interests.map((interest) => (
            <MembershipInterestCard
              key={interest.id}
              interest={interest}
              contacts={contactsByInterest.get(interest.id) ?? []}
              whatsappTemplate={settings.socios_whatsapp_triagem_template}
            />
          ))}
        </div>
      )}
    </div>
  )
}
