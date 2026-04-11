import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/auth/roles'
import { isValidEmailAddress } from '@/lib/membership'
import type { ContactMessage } from '@/types'
import AdminEmptyState from '@/components/admin/AdminEmptyState'
import AdminSectionHeading from '@/components/admin/AdminSectionHeading'
import AdminStatusBadge from '@/components/admin/StatusBadge'
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
  return <AdminStatusBadge tone={lida ? 'neutral' : 'warning'}>{lida ? 'Lida' : 'Não lida'}</AdminStatusBadge>
}

function EmptyState() {
  return (
    <AdminEmptyState
      title="Nenhuma mensagem ainda"
      description="As mensagens enviadas pelo formulário de contato aparecerão aqui, prontas para resposta e acompanhamento."
    />
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
    <div className="admin-page" data-testid="admin-messages-page">
      <AdminSectionHeading
        eyebrow="Contato"
        title="Mensagens de contato"
        description="Acompanhe as mensagens enviadas pelo site com leitura mais rápida de remetente, assunto e próxima ação."
        actions={
          totalNaoLidas > 0 ? <span className="admin-chip">{totalNaoLidas} não lidas</span> : undefined
        }
      />

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
                className={`admin-panel p-5 ${
                  mensagem.lida ? 'border-neutral-100' : 'border-amber-200 bg-[linear-gradient(180deg,rgba(244,184,96,0.08),rgba(17,24,39,0.96))]'
                }`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold tracking-[-0.03em] text-[var(--color-text-main)]">{mensagem.nome}</h2>
                      <StatusBadge lida={mensagem.lida} />
                    </div>

                    <p className="mt-1 text-sm font-medium text-[var(--color-primary)]">
                      {mensagem.assunto}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm text-[var(--color-text-muted)]">
                      <span>{mensagem.email}</span>
                      <span aria-hidden="true">•</span>
                      <time dateTime={mensagem.created_at}>
                        {formatDate(mensagem.created_at)}
                      </time>
                    </div>

                    <div className="mt-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                        Mensagem
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-text-main)]">
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
                      <span className="inline-flex items-center rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-[var(--color-text-muted)]">
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
