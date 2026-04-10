import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/auth/roles'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Dashboard',
}

interface StatCard {
  label: string
  value: number
  color: string
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

function DashboardCard({ label, value, color, icon }: StatCard) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-neutral-900">{value}</p>
        <p className="text-sm text-neutral-500">{label}</p>
      </div>
    </div>
  )
}

export default async function AdminDashboardPage() {
  const profile = await getUserProfile()

  if (!profile) redirect('/admin/login')

  const isEditorOnly = profile.role === 'editor'
  const stats = await getAdminDashboardStats(profile)
  const prefixo = isEditorOnly ? 'Meus' : ''

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">
          Olá, {profile.nome.split(' ')[0]}!
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Bem-vindo ao painel da Associação Amiga Miau.
        </p>
      </div>

      {/* Contadores de animais */}
      <section aria-labelledby="heading-animais" className="mb-8">
        <h2
          id="heading-animais"
          className="mb-4 text-base font-semibold text-neutral-700"
        >
          {isEditorOnly ? 'Meus animais' : 'Animais'}
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardCard
            label={`${prefixo} Total`.trim()}
            value={stats.animals.total}
            color="bg-primary-100"
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
          <DashboardCard
            label="Disponíveis"
            value={stats.animals.disponiveis}
            color="bg-green-100"
            icon={
              <svg width="22" height="22" viewBox="0 0 20 20" fill="none" className="text-green-600" aria-hidden="true">
                <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M6.5 10L8.5 12L13.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
          />
          <DashboardCard
            label="Em processo"
            value={stats.animals.emProcesso}
            color="bg-amber-100"
            icon={
              <svg width="22" height="22" viewBox="0 0 20 20" fill="none" className="text-amber-600" aria-hidden="true">
                <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M10 6V10L12.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
          />
          <DashboardCard
            label="Adotados"
            value={stats.animals.adotados}
            color="bg-salmon-100"
            icon={
              <svg width="22" height="22" viewBox="0 0 20 20" fill="none" className="text-salmon-600" aria-hidden="true">
                <path d="M10 16.5C10 16.5 3 12.5 3 7.5C3 5.01472 5.01472 3 7.5 3C8.87386 3 10.0994 3.60386 11 4.56586C11.9006 3.60386 13.1261 3 14.5 3C16.9853 3 19 5.01472 19 7.5C19 12.5 10 16.5 10 16.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
          />
        </div>
      </section>

      {/* Notificações não lidas */}
      <section aria-labelledby="heading-notificacoes">
        <h2
          id="heading-notificacoes"
          className="mb-4 text-base font-semibold text-neutral-700"
        >
          Notificações
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DashboardCard
            label={isEditorOnly ? 'Interesses nos meus animais' : 'Interesses não lidos'}
            value={stats.adoptionInterests.naoLidos}
            color="bg-primary-100"
            icon={
              <svg width="22" height="22" viewBox="0 0 20 20" fill="none" className="text-primary-600" aria-hidden="true">
                <path d="M3 5C3 3.89543 3.89543 3 5 3H15C16.1046 3 17 3.89543 17 5V12C17 13.1046 16.1046 14 15 14H11L7.5 17V14H5C3.89543 14 3 13.1046 3 12V5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            }
          />

          {!isEditorOnly && (
            <DashboardCard
              label="Mensagens não lidas"
              value={stats.contactMessages.naoLidas}
              color="bg-amber-100"
              icon={
                <svg width="22" height="22" viewBox="0 0 20 20" fill="none" className="text-amber-600" aria-hidden="true">
                  <path d="M3 6L10 11L17 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <rect x="3" y="4" width="14" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              }
            />
          )}
        </div>
      </section>
    </div>
  )
}
