import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/auth/roles'
import { getPublicSiteSettings } from '@/lib/site-settings'
import { createClient } from '@/lib/supabase/server'
import type { Member, MemberContactHistory, MemberPayment } from '@/types'
import MembershipAdminTabs from '../socios/MembershipAdminTabs'
import MembersListView from './MembersListView'

export const metadata: Metadata = { title: 'Membros — Amiga Miau Admin' }

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
            d="M12 21C8 18 4 14.5 4 9.5A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 8 3.5C20 14.5 16 18 12 21Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h3 className="mb-1 text-base font-semibold text-neutral-700">
        Nenhum sócio convertido ainda
      </h3>
      <p className="max-w-xs text-sm text-neutral-500">
        Converta interessados na página de cadastros para gerenciar pagamentos e status aqui.
      </p>
      <Link
        href="/admin/socios"
        className="mt-4 rounded-xl bg-primary-300 px-4 py-2 text-sm font-bold text-primary-900 transition-colors hover:bg-primary-400"
      >
        Ver cadastros de sócios
      </Link>
    </div>
  )
}

export default async function MembrosPage() {
  const profile = await getUserProfile()
  if (!profile) redirect('/admin/login')
  if (profile.role === 'editor') redirect('/admin/sem-permissao')

  const supabase = await createClient()
  const settings = await getPublicSiteSettings()

  const { data, error } = await supabase
    .from('members')
    .select(
      'id, interest_id, nome, email, endereco, cidade, estado, cpf, whatsapp, observacoes, status, valor_mensal, data_inicio, ultimo_pagamento_em, proximo_vencimento_em, created_at, updated_at'
    )
    .order('created_at', { ascending: false })

  const { data: paymentsData, error: paymentsError } = await supabase
    .from('member_payments')
    .select('id, member_id, valor, metodo, pago_em, competencia_mes, observacoes, created_at')
    .order('pago_em', { ascending: false })

  const { data: contactsData, error: contactsError } = await supabase
    .from('member_contact_history')
    .select(
      'id, membership_interest_id, member_id, canal, tipo, destinatario, assunto, mensagem, enviado_por, created_at'
    )
    .not('member_id', 'is', null)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[MEMBERS READ ERROR]', error)
  }

  if (paymentsError) {
    console.error('[MEMBER PAYMENTS READ ERROR]', paymentsError)
  }

  if (contactsError) {
    console.error('[MEMBER CONTACT HISTORY READ ERROR]', contactsError)
  }

  const members = error ? [] : ((data ?? []) as Member[])
  const payments = paymentsError ? [] : ((paymentsData ?? []) as MemberPayment[])
  const contacts = contactsError
    ? []
    : ((contactsData ?? []) as MemberContactHistory[])
  const paymentsByMember = new Map<string, MemberPayment[]>()
  const contactsByMember = new Map<string, MemberContactHistory[]>()

  for (const payment of payments) {
    const current = paymentsByMember.get(payment.member_id) ?? []
    current.push(payment)
    paymentsByMember.set(payment.member_id, current)
  }

  for (const contact of contacts) {
    if (contact.member_id) {
      const current = contactsByMember.get(contact.member_id) ?? []
      current.push(contact)
      contactsByMember.set(contact.member_id, current)
    }
  }

  const paymentsRecord = Object.fromEntries(paymentsByMember.entries())
  const contactsRecord = Object.fromEntries(contactsByMember.entries())

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-800">
            Gerenciar sócios
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Lista compacta para acompanhar cobrança, comunicação e status sem perder contexto.
          </p>
        </div>

        <Link
          href="/admin/socios"
          className="inline-flex items-center justify-center rounded-xl bg-neutral-100 px-4 py-2 text-sm font-bold text-neutral-700 transition-colors hover:bg-neutral-200 focus:outline-2 focus:outline-primary-300 focus:outline-offset-2"
        >
          Ver interessados
        </Link>
      </div>

      <MembershipAdminTabs active="Membros" />

      {members.length === 0 ? (
        <EmptyState />
      ) : (
        <MembersListView
          members={members}
          paymentsByMember={paymentsRecord}
          contactsByMember={contactsRecord}
          welcomeTemplate={settings.socios_whatsapp_boas_vindas_template}
          chargeTemplate={settings.socios_whatsapp_cobranca_template}
        />
      )}
    </div>
  )
}
