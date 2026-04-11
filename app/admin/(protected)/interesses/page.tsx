import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { formatPhoneBR, isValidEmailAddress } from '@/lib/membership'
import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/auth/roles'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import type { AdoptionInterest } from '@/types'
import AdminEmptyState from '@/components/admin/AdminEmptyState'
import AdminSectionHeading from '@/components/admin/AdminSectionHeading'
import AdminStatusBadge from '@/components/admin/StatusBadge'
import MarkInterestAsReadButton from './MarkInterestAsReadButton'
import SendInterestReplyEmailButton from './SendInterestReplyEmailButton'

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
  return <AdminStatusBadge tone={lida ? 'neutral' : 'warning'}>{lida ? 'Lida' : 'Não lida'}</AdminStatusBadge>
}

function animalNome(interesse: InteresseComAnimal): string {
  if (Array.isArray(interesse.animals)) {
    return interesse.animals[0]?.nome ?? 'Animal removido'
  }

  return interesse.animals?.nome ?? 'Animal removido'
}

function buildInterestWhatsAppUrl(interesse: InteresseComAnimal): string | null {
  if (!interesse.telefone) return null

  return buildWhatsAppUrl(
    interesse.telefone,
    `Olá, ${interesse.nome}! Recebemos seu interesse em adotar ${animalNome(interesse)}. Vamos conversar?`
  )
}

function EmptyState() {
  return (
    <AdminEmptyState
      title="Nenhum interesse registrado ainda"
      description="Quando alguém demonstrar interesse em adotar um animal, esse contato vai aparecer aqui pronto para triagem."
    />
  )
}

function InterestMessage({ message }: { message: string | null }) {
  if (!message) {
    return (
      <p className="mt-3 text-sm text-[var(--color-text-muted)]">
        Sem mensagem adicional.
      </p>
    )
  }

  return (
    <div className="mt-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
        Mensagem
      </p>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-text-main)]">
        {message}
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
        <div className="admin-page">
          <AdminSectionHeading
            eyebrow="Adoção"
            title="Interesses em adoção"
            description="Apenas interesses nos animais que você cadastrou."
          />
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
    <div className="admin-page" data-testid="admin-interests-page">
      <AdminSectionHeading
        eyebrow="Adoção"
        title="Interesses em adoção"
        description={
          profile.role === 'editor'
            ? 'Apenas interesses nos animais que você cadastrou.'
            : 'Acompanhe os pedidos enviados pelo site e priorize quem precisa de retorno.'
        }
        actions={
          totalNaoLidos > 0 ? (
            <span className="admin-chip">{totalNaoLidos} não lidos</span>
          ) : undefined
        }
      />

      {interesses.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4">
          {interesses.map((interesse) => {
            const whatsappUrl = buildInterestWhatsAppUrl(interesse)
            const hasEmail = isValidEmailAddress(interesse.email)

            return (
              <article
                key={interesse.id}
                data-testid="admin-interest-row"
                className={`admin-panel p-5 ${
                  interesse.lida
                    ? 'border-neutral-100'
                    : 'border-amber-200 bg-[linear-gradient(180deg,rgba(244,184,96,0.08),rgba(17,24,39,0.96))]'
                }`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold tracking-[-0.03em] text-[var(--color-text-main)]">
                        {interesse.nome}
                      </h2>
                      <StatusBadge lida={interesse.lida} />
                    </div>

                    <p className="mt-1 text-sm font-medium text-[var(--color-primary)]">
                      Interesse em {animalNome(interesse)}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm text-[var(--color-text-muted)]">
                      <span>{interesse.email}</span>
                      <span aria-hidden="true">•</span>
                      <span>
                        {interesse.telefone ? formatPhoneBR(interesse.telefone) : 'Telefone não informado'}
                      </span>
                      <span aria-hidden="true">•</span>
                      <time dateTime={interesse.created_at}>
                        {formatDate(interesse.created_at)}
                      </time>
                    </div>

                    <InterestMessage message={interesse.mensagem} />
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2 lg:max-w-xs lg:justify-end">
                    {whatsappUrl && (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="admin-button-secondary"
                      >
                        WhatsApp
                      </a>
                    )}

                    <SendInterestReplyEmailButton
                      id={interesse.id}
                      disabled={!hasEmail}
                    />

                    {!interesse.lida && canMarkAsRead ? (
                      <MarkInterestAsReadButton id={interesse.id} />
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
