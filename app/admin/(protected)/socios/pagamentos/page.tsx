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
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-6 py-12 text-center">
      <p className="text-sm font-semibold text-neutral-700">
        Nenhum pagamento registrado ainda.
      </p>
      <p className="mt-1 text-sm text-neutral-500">
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
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-800">
          Gerenciar sócios
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Registro e histórico financeiro dos sócios.
        </p>
      </div>

      <MembershipAdminTabs active="Pagamentos" />

      <div className="grid gap-5 lg:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.2fr)]">
        <PaymentRegisterForm members={members} />

        <section className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-1 border-b border-neutral-100 pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-neutral-800">Histórico recente</h2>
              <p className="mt-1 text-sm text-neutral-500">
                Visualize rapidamente os últimos pagamentos lançados.
              </p>
            </div>
            {payments.length > RECENT_PAYMENTS_LIMIT && (
              <p className="text-xs font-semibold text-neutral-400">
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
                  className="rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-base font-bold text-neutral-800">
                        {payment.member?.nome ?? 'Sócio não encontrado'}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-neutral-500">
                        <span>
                          <span className="font-semibold text-neutral-700">Método:</span>{' '}
                          {formatPaymentMethod(payment.metodo)}
                        </span>
                        <span>
                          <span className="font-semibold text-neutral-700">Competência:</span>{' '}
                          {formatCompetenciaMes(payment.competencia_mes)}
                        </span>
                        <span>
                          <span className="font-semibold text-neutral-700">Pago em:</span>{' '}
                          {formatDateBR(payment.pago_em)}
                        </span>
                      </div>
                      {payment.observacoes && (
                        <p className="mt-3 text-sm leading-relaxed text-neutral-500">
                          {payment.observacoes}
                        </p>
                      )}
                    </div>
                    <p className="shrink-0 text-lg font-bold text-neutral-800">
                      {formatCurrencyBR(payment.valor)}
                    </p>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
