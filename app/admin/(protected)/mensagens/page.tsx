import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/auth/roles'
import type { ContactMessage } from '@/types'
import MarkMessageAsReadButton from './MarkMessageAsReadButton'

export const metadata: Metadata = { title: 'Mensagens — Amiga Miau Admin' }

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

function mensagemResumo(mensagem: string): string {
  if (mensagem.length <= 120) return mensagem
  return `${mensagem.slice(0, 117)}...`
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
          <rect
            x="3"
            y="5"
            width="18"
            height="14"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M3 8L12 13.5L21 8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <h3 className="mb-1 text-base font-semibold text-neutral-700">
        Nenhuma mensagem ainda
      </h3>
      <p className="max-w-xs text-sm text-neutral-500">
        As mensagens enviadas pelo formulário de contato aparecerão aqui.
      </p>
    </div>
  )
}

export default async function MensagensPage() {
  const profile = await getUserProfile()

  if (!profile) redirect('/admin/login')
  if (profile.role === 'editor') redirect('/admin/sem-permissao')

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('contact_messages')
    .select('id, nome, email, assunto, mensagem, lida, created_at')
    .order('created_at', { ascending: false })

  const mensagens: ContactMessage[] = error
    ? []
    : ((data ?? []) as ContactMessage[])

  const totalNaoLidas = mensagens.filter((mensagem) => !mensagem.lida).length

  return (
    <div>
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-800">
            Mensagens de contato
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Acompanhe as mensagens enviadas pelo site.
          </p>
          {totalNaoLidas > 0 && (
            <p className="mt-1 text-sm text-amber-600">
              {totalNaoLidas}{' '}
              {totalNaoLidas === 1 ? 'mensagem não lida' : 'mensagens não lidas'}
            </p>
          )}
        </div>
      </div>

      {mensagens.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-md">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-100 text-sm">
              <thead className="bg-neutral-50 text-left text-xs font-bold uppercase tracking-wider text-neutral-400">
                <tr>
                  <th scope="col" className="px-5 py-3">Nome</th>
                  <th scope="col" className="px-5 py-3">Email</th>
                  <th scope="col" className="px-5 py-3">Assunto</th>
                  <th scope="col" className="px-5 py-3">Mensagem</th>
                  <th scope="col" className="px-5 py-3">Data</th>
                  <th scope="col" className="px-5 py-3">Status</th>
                  <th scope="col" className="px-5 py-3">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {mensagens.map((mensagem) => (
                  <tr
                    key={mensagem.id}
                    className={mensagem.lida ? 'bg-white' : 'bg-amber-50/60'}
                  >
                    <td className="px-5 py-4 align-top">
                      <div className="font-semibold text-neutral-800">{mensagem.nome}</div>
                    </td>
                    <td className="px-5 py-4 align-top text-neutral-600">
                      {mensagem.email}
                    </td>
                    <td className="px-5 py-4 align-top font-medium text-neutral-800">
                      {mensagem.assunto}
                    </td>
                    <td className="px-5 py-4 align-top">
                      <p className="max-w-xs whitespace-pre-wrap text-xs leading-relaxed text-neutral-500">
                        {mensagemResumo(mensagem.mensagem)}
                      </p>
                    </td>
                    <td className="px-5 py-4 align-top text-neutral-500">
                      <time dateTime={mensagem.created_at}>
                        {formatDate(mensagem.created_at)}
                      </time>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <StatusBadge lida={mensagem.lida} />
                    </td>
                    <td className="px-5 py-4 align-top">
                      {!mensagem.lida ? (
                        <MarkMessageAsReadButton id={mensagem.id} />
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
