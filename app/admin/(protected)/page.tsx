import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/auth/roles'
import { redirect } from 'next/navigation'
import AdminSectionHeading from '@/components/admin/AdminSectionHeading'
import AdminStatCard from '@/components/admin/AdminStatCard'
import AdminPanel from '@/components/admin/AdminPanel'

export const metadata: Metadata = {
  title: 'Dashboard',
}

interface StatCard {
  label: string
  value: number
  icon: React.ReactNode
}

interface AdminProfile {
  id: string
  nome: string
  role: 'admin' | 'editor' | 'viewer'
}

interface AdminDashboardStats {
  animals: {
    total: number
    disponiveis: number
    emProcesso: number
    adotados: number
  }
  adoptionInterests: {
    total: number
    naoLidos: number
  }
  contactMessages: {
    total: number
    naoLidas: number
  }
}

async function getCount(
  query: PromiseLike<{ count: number | null; error: unknown }>
): Promise<number> {
  const { count, error } = await query
  if (error) return 0
  return count ?? 0
}

async function getAdminDashboardStats(
  profile: AdminProfile
): Promise<AdminDashboardStats> {
  const supabase = await createClient()
  const isEditorOnly = profile.role === 'editor'

  const countAnimals = (status?: 'disponivel' | 'em_processo' | 'adotado') => {
    let query = supabase
      .from('animals')
      .select('id', { count: 'exact', head: true })

    if (isEditorOnly) {
      query = query.eq('created_by', profile.id)
    }

    if (status) {
      query = query.eq('status', status)
    }

    return query
  }

  const interestsTotalQuery = supabase
    .from('adoption_interests')
    .select('id', { count: 'exact', head: true })

  const interestsNaoLidosQuery = supabase
    .from('adoption_interests')
    .select('id', { count: 'exact', head: true })
    .eq('lida', false)

  const messagesTotalQuery = isEditorOnly
    ? Promise.resolve({ count: 0, error: null })
    : supabase
        .from('contact_messages')
        .select('id', { count: 'exact', head: true })

  const messagesNaoLidasQuery = isEditorOnly
    ? Promise.resolve({ count: 0, error: null })
    : supabase
        .from('contact_messages')
        .select('id', { count: 'exact', head: true })
        .eq('lida', false)

  const [
    totalAnimais,
    disponiveis,
    emProcesso,
    adotados,
    totalInteresses,
    interessesNaoLidos,
    totalMensagens,
    mensagensNaoLidas,
  ] = await Promise.all([
    getCount(countAnimals()),
    getCount(countAnimals('disponivel')),
    getCount(countAnimals('em_processo')),
    getCount(countAnimals('adotado')),
    getCount(interestsTotalQuery),
    getCount(interestsNaoLidosQuery),
    getCount(messagesTotalQuery),
    getCount(messagesNaoLidasQuery),
  ])

  return {
    animals: {
      total: totalAnimais,
      disponiveis,
      emProcesso,
      adotados,
    },
    adoptionInterests: {
      total: totalInteresses,
      naoLidos: interessesNaoLidos,
    },
    contactMessages: {
      total: totalMensagens,
      naoLidas: mensagensNaoLidas,
    },
  }
}

export default async function AdminDashboardPage() {
  const profile = await getUserProfile()

  if (!profile) redirect('/admin/login')

  const isEditorOnly = profile.role === 'editor'
  const stats = await getAdminDashboardStats(profile)
  const prefixo = isEditorOnly ? 'Meus' : ''

  return (
    <div className="admin-page" data-testid="admin-dashboard-page">
      <AdminSectionHeading
        eyebrow="Painel administrativo"
        title={`Olá, ${profile.nome.split(' ')[0]}!`}
        description="Acompanhe o ritmo da operação, priorize contatos pendentes e mantenha a equipe alinhada com o que precisa de atenção hoje."
      />

      <AdminPanel className="overflow-hidden">
        <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.9fr)]">
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="admin-kicker">{isEditorOnly ? 'Minha operação' : 'Visão geral'}</p>
              <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[var(--color-text-main)]">
                {isEditorOnly ? 'Seus animais e atendimentos em andamento' : 'A saúde do projeto em um só lugar'}
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
                Veja o volume atual de animais, acompanhe o que precisa de resposta e mantenha o dia organizado sem caçar informação em várias telas.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <AdminStatCard
                label={`${prefixo} Total`.trim()}
                value={stats.animals.total}
                tone="default"
                icon={
              <svg width="22" height="22" viewBox="0 0 20 20" fill="none" className="text-primary-600" aria-hidden="true">
                <path d="M7 3C7 2.44772 7.44772 2 8 2C8.55228 2 9 2.44772 9 3V5C9 5.55228 8.55228 6 8 6C7.44772 6 7 5.55228 7 5V3Z" fill="currentColor" />
                <path d="M11 3C11 2.44772 11.4477 2 12 2C12.5523 2 13 2.44772 13 3V5C13 5.55228 12.5523 6 12 6C11.4477 6 11 5.55228 11 5V3Z" fill="currentColor" />
                <path d="M3 7C3 6.44772 3.44772 6 4 6C4.55228 6 5 6.44772 5 7V9C5 9.55228 4.55228 10 4 10C3.44772 10 3 9.55228 3 9V7Z" fill="currentColor" />
                <path d="M15 7C15 6.44772 15.4477 6 16 6C16.5523 6 17 6.44772 17 7V9C17 9.55228 16.5523 10 16 10C15.4477 10 15 9.55228 15 9V7Z" fill="currentColor" />
                <path d="M5.5 9.5C5.5 7.84315 6.84315 6.5 8.5 6.5H11.5C13.1569 6.5 14.5 7.84315 14.5 9.5V13.5C14.5 15.9853 12.4853 18 10 18C7.51472 18 5.5 15.9853 5.5 13.5V9.5Z" stroke="currentColor" strokeWidth="1.5" />
              </svg>
                }
              />
              <AdminStatCard
                label="Disponíveis"
                value={stats.animals.disponiveis}
                tone="success"
                icon={
              <svg width="22" height="22" viewBox="0 0 20 20" fill="none" className="text-green-600" aria-hidden="true">
                <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M6.5 10L8.5 12L13.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
                }
              />
              <AdminStatCard
                label="Em processo"
                value={stats.animals.emProcesso}
                tone="warning"
                icon={
              <svg width="22" height="22" viewBox="0 0 20 20" fill="none" className="text-amber-600" aria-hidden="true">
                <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M10 6V10L12.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
                }
              />
              <AdminStatCard
                label="Adotados"
                value={stats.animals.adotados}
                tone="danger"
                icon={
              <svg width="22" height="22" viewBox="0 0 20 20" fill="none" className="text-salmon-600" aria-hidden="true">
                <path d="M10 16.5C10 16.5 3 12.5 3 7.5C3 5.01472 5.01472 3 7.5 3C8.87386 3 10.0994 3.60386 11 4.56586C11.9006 3.60386 13.1261 3 14.5 3C16.9853 3 19 5.01472 19 7.5C19 12.5 10 16.5 10 16.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
                }
              />
            </div>
          </div>

          <div className="admin-panel-muted flex flex-col justify-between gap-6 p-5">
            <div className="space-y-2">
              <p className="admin-kicker">Prioridades</p>
              <h3 className="text-xl font-semibold tracking-[-0.04em] text-[var(--color-text-main)]">
                Contatos que merecem resposta rápida
              </h3>
              <p className="text-sm leading-6 text-[var(--color-text-muted)]">
                Use estes números como radar do dia para não perder interessados quentes nem mensagens sem retorno.
              </p>
            </div>

            <div className="grid gap-3">
              <div className="admin-panel-muted flex items-center justify-between px-4 py-4">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-muted)]">
                    {isEditorOnly ? 'Interesses nos meus animais' : 'Interesses não lidos'}
                  </p>
                  <p className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-[var(--color-text-main)]">
                    {stats.adoptionInterests.naoLidos}
                  </p>
                </div>
                <div className="rounded-2xl border border-[rgba(244,184,96,0.2)] bg-[rgba(244,184,96,0.14)] p-3 text-[var(--color-primary)]">
                  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path d="M3 5C3 3.89543 3.89543 3 5 3H15C16.1046 3 17 3.89543 17 5V12C17 13.1046 16.1046 14 15 14H11L7.5 17V14H5C3.89543 14 3 13.1046 3 12V5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>

              {!isEditorOnly ? (
                <div className="admin-panel-muted flex items-center justify-between px-4 py-4">
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text-muted)]">Mensagens não lidas</p>
                    <p className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-[var(--color-text-main)]">
                      {stats.contactMessages.naoLidas}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[rgba(113,211,205,0.22)] bg-[rgba(31,111,107,0.16)] p-3 text-[#8de0d9]">
                    <svg width="22" height="22" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <path d="M3 6L10 11L17 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <rect x="3" y="4" width="14" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </AdminPanel>
    </div>
  )
}
