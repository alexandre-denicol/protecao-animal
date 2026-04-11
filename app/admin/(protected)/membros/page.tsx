import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/auth/roles'
import { getPublicSiteSettings } from '@/lib/site-settings'
import { createClient } from '@/lib/supabase/server'
import type { Member, MemberContactHistory, MemberPayment } from '@/types'
import AdminEmptyState from '@/components/admin/AdminEmptyState'
import AdminPanel from '@/components/admin/AdminPanel'
import AdminSectionHeading from '@/components/admin/AdminSectionHeading'
import MembershipAdminTabs from '../socios/MembershipAdminTabs'
import MembersListView from './MembersListView'

export const metadata: Metadata = { title: 'Membros — Amiga Miau Admin' }

function EmptyState() {
  return (
    <AdminEmptyState
      title="Nenhum sócio convertido ainda"
      description="Converta interessados na página de triagem para começar a gerenciar pagamentos, contatos e status por aqui."
      action={
        <Link
          href="/admin/socios"
          className="inline-flex items-center justify-center rounded-xl bg-[var(--color-primary)] px-4 py-2 text-sm font-bold text-[#1f1406] transition-colors hover:bg-[var(--color-primary-hover)]"
        >
          Ver cadastros de sócios
        </Link>
      }
    />
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
    <div className="admin-page">
      <AdminSectionHeading
        eyebrow="Relacionamento"
        title="Gerenciar sócios"
        description="Lista compacta para acompanhar cobrança, comunicação e status sem perder contexto, mesmo quando a base crescer."
        actions={
          <div className="flex flex-wrap gap-2">
            <span className="admin-chip">{members.length} membros</span>
            <span className="admin-chip">{payments.length} pagamentos</span>
            <span className="admin-chip">{contacts.length} contatos</span>
            <Link
              href="/admin/socios"
              className="admin-button-muted px-4 py-2 text-sm"
            >
              Ver interessados
            </Link>
          </div>
        }
      />

      <MembershipAdminTabs active="Membros" />

      {members.length === 0 ? (
        <EmptyState />
      ) : (
        <AdminPanel className="p-0">
          <MembersListView
            members={members}
            paymentsByMember={paymentsRecord}
            contactsByMember={contactsRecord}
            welcomeTemplate={settings.socios_whatsapp_boas_vindas_template}
            chargeTemplate={settings.socios_whatsapp_cobranca_template}
          />
        </AdminPanel>
      )}
    </div>
  )
}
