import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/auth/roles'
import { getPublicSiteSettings } from '@/lib/site-settings'
import { createClient } from '@/lib/supabase/server'
import type { Member, MemberContactHistory, MembershipInterest } from '@/types'
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
    <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-20 text-center shadow-md">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          className="text-primary-400"
          aria-hidden="true"
        >
          <path
            d="M6 20V8L12 4L18 8V20"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M9 20V13H15V20"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h3 className="mb-1 text-base font-semibold text-neutral-700">
        Nenhum cadastro encontrado
      </h3>
      <p className="max-w-xs text-sm text-neutral-500">
        Ajuste a busca ou aguarde novos envios pelo formulário público.
      </p>
    </div>
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
    <div>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-800">
            Gerenciar sócios
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Triagem de interessados, conversão e acompanhamento do módulo.
          </p>
          <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold text-neutral-500">
            <span>
              {totalNaoLidos} não lidos
            </span>
            <span aria-hidden="true">•</span>
            <span>
              {totalConvertidos} convertidos
            </span>
          </div>
        </div>

        <Link
          href="/admin/membros"
          className="inline-flex items-center justify-center rounded-xl bg-primary-300 px-4 py-2 text-sm font-bold text-primary-900 transition-colors hover:bg-primary-400 focus:outline-2 focus:outline-primary-300 focus:outline-offset-2"
        >
          Ver sócios ativos
        </Link>
      </div>

      <MembershipAdminTabs active="Triagem" />

      <div className="mb-5 rounded-2xl border border-neutral-100 bg-white/80 p-3 shadow-sm">
        <form
          className="grid gap-2 sm:grid-cols-[minmax(220px,1fr)_auto]"
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
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <input type="hidden" name="status" value={status} />
          <button
            type="submit"
            className="rounded-lg bg-neutral-800 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-neutral-700 focus:outline-2 focus:outline-neutral-300 focus:outline-offset-2"
          >
            Buscar
          </button>
        </form>

        <div className="mt-3 flex flex-wrap gap-2">
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
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                  active
                    ? 'bg-primary-300 text-primary-900'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
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
