import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/auth/roles'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Profile, UserRole } from '@/types'
import {
  InviteToggle,
  RoleSelector,
  RevokeButton,
} from '@/components/admin/MembrosActions'

export const metadata: Metadata = { title: 'Membros da equipe — Amiga Miau Admin' }

function roleBadge(role: UserRole): { label: string; className: string } {
  const map: Record<UserRole, { label: string; className: string }> = {
    admin: {
      label: 'Admin',
      className: 'bg-salmon-100 text-salmon-700',
    },
    editor: {
      label: 'Editor',
      className: 'bg-amber-100 text-amber-700',
    },
    viewer: {
      label: 'Visualizador',
      className: 'bg-primary-100 text-primary-700',
    },
  }
  return map[role]
}

function AvatarPlaceholder({ nome }: { nome: string }) {
  const iniciais = nome
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <div
      aria-hidden="true"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700"
    >
      {iniciais}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          className="text-primary-400"
          aria-hidden="true"
        >
          <circle cx="8" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M2 17C2 14.2386 4.68629 12 8 12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="16" cy="13" r="3" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M16 10V16M13 13H19"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <h3 className="mb-1 text-base font-semibold text-neutral-700">
        Nenhum membro encontrado
      </h3>
      <p className="max-w-xs text-sm text-neutral-500">
        Convide membros da equipe para acessar o painel administrativo.
      </p>
    </div>
  )
}

export default async function MembrosPage() {
  const profile = await getUserProfile()
  if (!profile) redirect('/admin/login')
  if (profile.role !== 'admin') redirect('/admin/sem-permissao')

  const admin = createAdminClient()

  const { data, error } = await admin
    .from('profiles')
    .select('id, nome, email, role, ativo')
    .order('ativo', { ascending: false })
    .order('nome')

  const membros: Profile[] = error ? [] : ((data ?? []) as Profile[])

  const ativos = membros.filter((m) => m.ativo)
  const inativos = membros.filter((m) => !m.ativo)

  return (
    <div>
      {/* Cabeçalho */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-800">
            Membros da equipe
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            {ativos.length} {ativos.length === 1 ? 'membro ativo' : 'membros ativos'}
            {inativos.length > 0 && `, ${inativos.length} inativo${inativos.length > 1 ? 's' : ''}`}
          </p>
        </div>
        <InviteToggle />
      </div>

      {membros.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-6">
          {/* Membros ativos */}
          {ativos.length > 0 && (
            <section>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Ativos
              </h2>
              <div className="overflow-hidden rounded-2xl bg-white shadow-md">
                <ul role="list" className="divide-y divide-neutral-100">
                  {ativos.map((membro) => {
                    const badge = roleBadge(membro.role)
                    const isSelf = membro.id === profile.id

                    return (
                      <li
                        key={membro.id}
                        className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        {/* Info */}
                        <div className="flex min-w-0 items-center gap-3">
                          <AvatarPlaceholder nome={membro.nome} />
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-neutral-800 truncate">
                                {membro.nome}
                              </span>
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${badge.className}`}
                              >
                                {badge.label}
                              </span>
                              {isSelf && (
                                <span className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-neutral-500">
                                  Você
                                </span>
                              )}
                            </div>
                            <p className="truncate text-sm text-neutral-500">{membro.email}</p>
                          </div>
                        </div>

                        {/* Ações */}
                        <div className="flex shrink-0 flex-wrap items-center gap-2">
                          <RoleSelector membro={membro} currentUserId={profile.id} />
                          <RevokeButton membro={membro} currentUserId={profile.id} />
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </section>
          )}

          {/* Membros inativos */}
          {inativos.length > 0 && (
            <section>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Acesso revogado
              </h2>
              <div className="overflow-hidden rounded-2xl bg-white shadow-md opacity-75">
                <ul role="list" className="divide-y divide-neutral-100">
                  {inativos.map((membro) => {
                    const badge = roleBadge(membro.role)

                    return (
                      <li
                        key={membro.id}
                        className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        {/* Info */}
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-sm font-bold text-neutral-400">
                            {membro.nome
                              .split(' ')
                              .slice(0, 2)
                              .map((p) => p[0]?.toUpperCase() ?? '')
                              .join('')}
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-neutral-500 truncate line-through">
                                {membro.nome}
                              </span>
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold opacity-50 ${badge.className}`}
                              >
                                {badge.label}
                              </span>
                            </div>
                            <p className="truncate text-sm text-neutral-400">{membro.email}</p>
                          </div>
                        </div>

                        {/* Reativar */}
                        <div className="shrink-0">
                          <RevokeButton membro={membro} currentUserId={profile.id} />
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
