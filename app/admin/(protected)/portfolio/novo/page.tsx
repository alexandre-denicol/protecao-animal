import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/auth/roles'
import type { Animal } from '@/types'
import AdminPanel from '@/components/admin/AdminPanel'
import AdminSectionHeading from '@/components/admin/AdminSectionHeading'
import PortfolioForm from '@/components/admin/PortfolioForm'
import { createAdocaoAction } from '../actions'

export const metadata: Metadata = { title: 'Novo caso — Portfólio — Amiga Miau Admin' }

export default async function NovoPortfolioPage() {
  const profile = await getUserProfile()
  if (!profile) redirect('/admin/login')
  if (profile.role === 'viewer') redirect('/admin/portfolio')

  const supabase = await createClient()

  const { data } = await supabase
    .from('animals')
    .select('id, nome')
    .in('status', ['adotado', 'em_processo'])
    .order('nome')

  const animais: Pick<Animal, 'id' | 'nome'>[] = (data ?? []) as Pick<Animal, 'id' | 'nome'>[]

  return (
    <div className="admin-page mx-auto max-w-4xl">
      <nav aria-label="Navegação" className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
        <Link href="/admin/portfolio" className="hover:text-[var(--color-text-main)]">
          Portfólio
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-[var(--color-text-main)]">Novo caso</span>
      </nav>

      <AdminSectionHeading
        eyebrow="Histórias"
        title="Registrar caso de adoção"
        description="Monte um caso forte para o portfólio com foto, relato e vínculo com o animal certo."
      />

      <AdminPanel className="p-6 sm:p-8">
        <PortfolioForm action={createAdocaoAction} animais={animais} />
      </AdminPanel>
    </div>
  )
}
