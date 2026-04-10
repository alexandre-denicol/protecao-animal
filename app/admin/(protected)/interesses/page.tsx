import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/auth/roles'
import type { AdoptionInterest } from '@/types'
import MarkInterestAsReadButton from './MarkInterestAsReadButton'

export const metadata: Metadata = { title: 'Interesses em adoção — Amiga Miau Admin' }

interface InteresseComAnimal extends AdoptionInterest {
  animals: { nome: string } | { nome: string }[] | null
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function StatusBadge({ lida }: { lida: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        lida
          ? 'bg-neutral-100 text-neutral-500'
          : 'bg-amber-100 text-amber-700'
      }`}
    >
      {lida ? 'Lida' : 'Não lida'}
    </span>
  )
}

function animalNome(interesse: InteresseComAnimal): string {
  if (Array.isArray(interesse.animals)) {
    return interesse.animals[0]?.nome ?? 'Animal removido'
  }

  return interesse.animals?.nome ?? 'Animal removido'
}

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
            d="M12 21C12 21 3.5 15.5 3.5 9.5C3.5 6.46 5.96 4 9 4C10.54 4 11.93 4.65 12.93 5.68"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M12 21C12 21 20.5 15.5 20.5 9.5C20.5 6.46 18.04 4 15 4C13.46 4 12.07 4.65 11.07 5.68"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <h3 className="mb-1 text-base font-semibold text-neutral-700">
        Nenhum interesse registrado ainda
      </h3>
      <p className="max-w-xs text-sm text-neutral-500">
        Quando alguém demonstrar interesse em adotar um animal, aparecerá aqui.
      </p>
    </div>
  )
}

export default async function InteressesPage() {
  const profile = await getUserProfile()

  if (!profile) redirect('/admin/login')

  const supabase = await createClient()

  let query = supabase
    .from('adoption_interests')
    .select('id, nome, email, telefone, mensagem, lida, created_at, animal_id, animals(nome)')
    .order('created_at', { ascending: false })

  if (profile.role === 'editor') {
    const { data: meusAnimais } = await supabase
      .from('animals')
      .select('id')
      .eq('created_by', profile.id)

    const ids = ((meusAnimais ?? []) as { id: string }[]).map((animal) => animal.id)

    if (ids.length === 0) {
      return (
        <div>
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-800">
              Interesses em adoção
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
              Apenas interesses nos animais que você cadastrou.
            </p>
          </div>
          <EmptyState />
        </div>
      )
    }

    query = query.in('animal_id', ids)
  }

  const { data, error } = await query
  const interesses: InteresseComAnimal[] = error
    ? []
    : ((data ?? []) as unknown as InteresseComAnimal[])

  const totalNaoLidos = interesses.filter((interesse) => !interesse.lida).length
  const canMarkAsRead = profile.role === 'admin' || profile.role === 'viewer'

  return (
    <div>
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-800">
            Interesses em adoção
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            {profile.role === 'editor'
              ? 'Apenas interesses nos animais que você cadastrou.'
              : 'Acompanhe os pedidos enviados pelo site.'}
          </p>
          {totalNaoLidos > 0 && (
            <p className="mt-1 text-sm text-amber-600">
              {totalNaoLidos}{' '}
              {totalNaoLidos === 1 ? 'interesse não lido' : 'interesses não lidos'}
            </p>
          )}
        </div>
      </div>

      {interesses.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-md">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-100 text-sm">
              <thead className="bg-neutral-50 text-left text-xs font-bold uppercase tracking-wider text-neutral-400">
                <tr>
                  <th scope="col" className="px-5 py-3">Nome</th>
                  <th scope="col" className="px-5 py-3">Email</th>
                  <th scope="col" className="px-5 py-3">Telefone</th>
                  <th scope="col" className="px-5 py-3">Animal</th>
                  <th scope="col" className="px-5 py-3">Data</th>
                  <th scope="col" className="px-5 py-3">Status</th>
                  <th scope="col" className="px-5 py-3">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {interesses.map((interesse) => (
                  <tr
                    key={interesse.id}
                    className={interesse.lida ? 'bg-white' : 'bg-amber-50/60'}
                  >
                    <td className="px-5 py-4 align-top">
                      <div className="font-semibold text-neutral-800">{interesse.nome}</div>
                      {interesse.mensagem && (
                        <p className="mt-1 max-w-xs whitespace-pre-wrap text-xs leading-relaxed text-neutral-500">
                          {interesse.mensagem}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4 align-top text-neutral-600">{interesse.email}</td>
                    <td className="px-5 py-4 align-top text-neutral-600">
                      {interesse.telefone || 'Não informado'}
                    </td>
                    <td className="px-5 py-4 align-top font-medium text-primary-700">
                      {animalNome(interesse)}
                    </td>
                    <td className="px-5 py-4 align-top text-neutral-500">
                      <time dateTime={interesse.created_at}>
                        {formatDate(interesse.created_at)}
                      </time>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <StatusBadge lida={interesse.lida} />
                    </td>
                    <td className="px-5 py-4 align-top">
                      {!interesse.lida && canMarkAsRead ? (
                        <MarkInterestAsReadButton id={interesse.id} />
                      ) : (
                        <span className="text-xs text-neutral-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
