import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/auth/roles'
import {
  formatCompetenciaMes,
  formatCurrencyBR,
  formatDateBR,
  formatPaymentMethod,
} from '@/lib/membership'
import { createClient } from '@/lib/supabase/server'
import type { Member, MemberPayment } from '@/types'
import AdminPanel from '@/components/admin/AdminPanel'
import AdminSectionHeading from '@/components/admin/AdminSectionHeading'
import MembershipAdminTabs from '../MembershipAdminTabs'
import PaymentRegisterForm from './PaymentRegisterForm'

export const metadata: Metadata = { title: 'Pagamentos — Amiga Miau Admin' }

type PaymentWithMember = Omit<MemberPayment, 'member'> & {
  member: Pick<Member, 'id' | 'nome' | 'whatsapp' | 'status'> | null
}

type PaymentRow = Omit<PaymentWithMember, 'member'> & {
  member:
    | Pick<Member, 'id' | 'nome' | 'whatsapp' | 'status'>
    | Pick<Member, 'id' | 'nome' | 'whatsapp' | 'status'>[]
    | null
}

const RECENT_PAYMENTS_LIMIT = 6

function EmptyHistoryState() {
  return (
    <div className="admin-panel-muted flex flex-col items-center justify-center border-dashed px-6 py-12 text-center">
      <p className="text-sm font-semibold text-[var(--color-text-main)]">
        Nenhum pagamento registrado ainda.
      </p>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        Os registros mais recentes vão aparecer aqui.
      </p>
    </div>
  )
}

export default async function PagamentosSociosPage() {
  const profile = await getUserProfile()
  if (!profile) redirect('/admin/login')
  if (profile.role === 'editor') redirect('/admin/sem-permissao')

  const supabase = await createClient()

  const [{ data: membersData, error: membersError }, { data: paymentsData, error: paymentsError }] =
    await Promise.all([
      supabase
        .from('members')
        .select(
          'id, interest_id, nome, email, endereco, cidade, estado, cpf, whatsapp, observacoes, status, valor_mensal, data_inicio, ultimo_pagamento_em, proximo_vencimento_em, created_at, updated_at'
        )
        .order('nome'),
      supabase
        .from('member_payments')
        .select('id, member_id, valor, metodo, pago_em, competencia_mes, observacoes, created_at, member:members(id, nome, whatsapp, status)')
        .order('pago_em', { ascending: false })
        .order('created_at', { ascending: false }),
    ])

  if (membersError) console.error('[MEMBERS READ ERROR]', membersError)
  if (paymentsError) console.error('[MEMBER PAYMENTS READ ERROR]', paymentsError)

  const members = membersError ? [] : ((membersData ?? []) as Member[])
  const payments: PaymentWithMember[] = paymentsError
    ? []
    : ((paymentsData ?? []) as PaymentRow[]).map((payment) => ({
        ...payment,
        member: Array.isArray(payment.member)
          ? payment.member[0] ?? null
          : payment.member,
      }))
  const recentPayments = payments.slice(0, RECENT_PAYMENTS_LIMIT)

  return (
    <div className="admin-page">
      <AdminSectionHeading
        eyebrow="Financeiro"
        title="Gerenciar sócios"
        description="Lance pagamentos com rapidez e acompanhe o histórico recente com leitura mais clara de valores, competência e data efetiva."
        actions={
          <div className="flex flex-wrap gap-2">
            <span className="admin-chip">{members.length} membros</span>
            <span className="admin-chip">{payments.length} registros financeiros</span>
          </div>
        }
      />

      <MembershipAdminTabs active="Pagamentos" />

      <div className="grid gap-5 lg:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.2fr)]">
        <PaymentRegisterForm members={members} />

        <AdminPanel>
          <div className="flex flex-col gap-1 border-b border-white/10 pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-[-0.03em] text-[var(--color-text-main)]">Histórico recente</h2>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                Visualize rapidamente os últimos pagamentos lançados.
              </p>
            </div>
            {payments.length > RECENT_PAYMENTS_LIMIT && (
              <p className="text-xs font-semibold text-[var(--color-text-muted)]">
                Mostrando os últimos {RECENT_PAYMENTS_LIMIT}
              </p>
            )}
          </div>

          <div className="mt-4 space-y-3">
            {recentPayments.length === 0 ? (
              <EmptyHistoryState />
            ) : (
              recentPayments.map((payment) => (
                <article
                  key={payment.id}
                  className="admin-panel-muted px-4 py-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-base font-semibold text-[var(--color-text-main)]">
                        {payment.member?.nome ?? 'Sócio não encontrado'}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-[var(--color-text-muted)]">
                        <span>
                          <span className="font-semibold text-[var(--color-text-main)]">Método:</span>{' '}
                          {formatPaymentMethod(payment.metodo)}
                        </span>
                        <span>
                          <span className="font-semibold text-[var(--color-text-main)]">Competência:</span>{' '}
                          {formatCompetenciaMes(payment.competencia_mes)}
                        </span>
                        <span>
                          <span className="font-semibold text-[var(--color-text-main)]">Pago em:</span>{' '}
                          {formatDateBR(payment.pago_em)}
                        </span>
                      </div>
                      {payment.observacoes && (
                        <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-muted)]">
                          {payment.observacoes}
                        </p>
                      )}
                    </div>
                    <p className="shrink-0 text-lg font-semibold text-[var(--color-text-main)]">
                      {formatCurrencyBR(payment.valor)}
                    </p>
                  </div>
                </article>
              ))
            )}
          </div>
        </AdminPanel>
      </div>
    </div>
  )
}
