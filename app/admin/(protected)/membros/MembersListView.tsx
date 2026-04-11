'use client'

import { useMemo, useState } from 'react'
import type { Member, MemberContactHistory, MemberPayment } from '@/types'
import MemberCard from './MemberCard'

const FILTERS = [
  { label: 'Todos', value: 'todos' },
  { label: 'Ativos', value: 'ativo' },
  { label: 'Inadimplentes', value: 'inadimplente' },
  { label: 'Cancelados', value: 'cancelado' },
] as const

type FilterValue = (typeof FILTERS)[number]['value']

export default function MembersListView({
  members,
  paymentsByMember,
  contactsByMember,
  welcomeTemplate,
  chargeTemplate,
}: {
  members: Member[]
  paymentsByMember: Record<string, MemberPayment[]>
  contactsByMember: Record<string, MemberContactHistory[]>
  welcomeTemplate: string
  chargeTemplate: string
}) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterValue>('todos')

  const filteredMembers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return members.filter((member) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        member.nome.toLowerCase().includes(normalizedSearch)

      const matchesFilter =
        filter === 'todos' ? true : member.status === filter

      return matchesSearch && matchesFilter
    })
  }, [filter, members, search])

  const activeCount = members.filter((member) => member.status === 'ativo').length
  const overdueCount = members.filter((member) => member.status === 'inadimplente').length

  return (
    <div className="grid gap-4">
      <section className="admin-toolbar">
        <div className="grid gap-3 xl:grid-cols-[minmax(260px,1fr)_auto_auto] xl:items-center">
          <div>
            <label htmlFor="member-search" className="sr-only">
              Buscar membro por nome
            </label>
            <input
              id="member-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome"
              className="admin-input"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {FILTERS.map((option) => {
              const active = filter === option.value

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFilter(option.value)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    active
                      ? 'border-[rgba(244,184,96,0.22)] bg-[rgba(244,184,96,0.14)] text-[var(--color-primary)]'
                      : 'border-white/10 bg-white/5 text-[var(--color-text-muted)] hover:bg-white/10 hover:text-[var(--color-text-main)]'
                  }`}
                >
                  {option.label}
                </button>
              )
            })}
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full border border-[rgba(113,211,205,0.24)] bg-[rgba(31,111,107,0.16)] px-3 py-1 text-[#8de0d9]">
              {activeCount} ativos
            </span>
            <span className="rounded-full border border-[rgba(252,165,165,0.22)] bg-[rgba(248,113,113,0.12)] px-3 py-1 text-[#fca5a5]">
              {overdueCount} inadimplentes
            </span>
          </div>
        </div>
      </section>

      <div className="grid gap-2.5 lg:gap-3">
        {filteredMembers.map((member) => (
          <MemberCard
            key={member.id}
            member={member}
            payments={paymentsByMember[member.id] ?? []}
            contacts={contactsByMember[member.id] ?? []}
            welcomeTemplate={welcomeTemplate}
            chargeTemplate={chargeTemplate}
          />
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="admin-panel border-dashed px-6 py-12 text-center">
          <p className="text-sm font-semibold text-[var(--color-text-main)]">
            Nenhum sócio encontrado com esse filtro.
          </p>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Ajuste a busca ou selecione outro status.
          </p>
        </div>
      )}
    </div>
  )
}
