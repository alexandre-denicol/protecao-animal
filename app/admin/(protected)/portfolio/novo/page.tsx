import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/auth/roles'
import type { Animal } from '@/types'
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
    <div className="mx-auto max-w-2xl">
      {/* Breadcrumb */}
      <nav aria-label="Navegação" className="mb-6 flex items-center gap-2 text-sm text-neutral-500">
        <Link href="/admin/portfolio" className="hover:text-neutral-700">
          Portfólio
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-neutral-800">Novo caso</span>
      </nav>

      <h1 className="mb-8 text-2xl font-bold tracking-tight text-neutral-800">
        Registrar caso de adoção
      </h1>

      <div className="rounded-2xl bg-white p-6 shadow-md sm:p-8">
        <PortfolioForm action={createAdocaoAction} animais={animais} />
      </div>
    </div>
  )
}
