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
      <section className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_auto_auto] lg:items-center">
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
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100"
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
                  className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                    active
                      ? 'bg-primary-300 text-primary-900'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {option.label}
                </button>
              )
            })}
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-green-100 px-3 py-1 text-green-700">
              {activeCount} ativos
            </span>
            <span className="rounded-full bg-salmon-100 px-3 py-1 text-salmon-700">
              {overdueCount} inadimplentes
            </span>
          </div>
        </div>
      </section>

      <div className="grid gap-3">
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
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-white px-6 py-12 text-center">
          <p className="text-sm font-semibold text-neutral-600">
            Nenhum sócio encontrado com esse filtro.
          </p>
          <p className="mt-1 text-sm text-neutral-400">
            Ajuste a busca ou selecione outro status.
          </p>
        </div>
      )}
    </div>
  )
}
