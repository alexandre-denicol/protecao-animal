import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/auth/roles'
import { isValidEmailAddress } from '@/lib/membership'
import type { ContactMessage } from '@/types'
import MarkMessageAsReadButton from './MarkMessageAsReadButton'
import SendContactReplyEmailButton from './SendContactReplyEmailButton'

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
    <div data-testid="admin-messages-page">
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
        <div className="grid gap-4">
          {mensagens.map((mensagem) => {
            const hasEmail = isValidEmailAddress(mensagem.email)

            return (
              <article
                key={mensagem.id}
                data-testid="admin-message-row"
                className={`rounded-2xl border bg-white p-5 shadow-sm ${
                  mensagem.lida ? 'border-neutral-100' : 'border-amber-200 bg-amber-50/40'
                }`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold text-neutral-800">{mensagem.nome}</h2>
                      <StatusBadge lida={mensagem.lida} />
                    </div>

                    <p className="mt-1 text-sm font-medium text-primary-700">
                      {mensagem.assunto}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm text-neutral-500">
                      <span>{mensagem.email}</span>
                      <span aria-hidden="true">•</span>
                      <time dateTime={mensagem.created_at}>
                        {formatDate(mensagem.created_at)}
                      </time>
                    </div>

                    <div className="mt-3 rounded-xl bg-neutral-50 px-3 py-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                        Mensagem
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-neutral-600">
                        {mensagem.mensagem}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2 lg:max-w-xs lg:justify-end">
                    <SendContactReplyEmailButton
                      id={mensagem.id}
                      disabled={!hasEmail}
                    />

                    {!mensagem.lida ? (
                      <MarkMessageAsReadButton id={mensagem.id} />
                    ) : (
                      <span className="inline-flex items-center rounded-lg bg-neutral-100 px-3 py-2 text-xs font-semibold text-neutral-400">
                        Já lida
                      </span>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
