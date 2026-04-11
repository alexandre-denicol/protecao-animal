import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/auth/roles'
import type { Adoption, Animal } from '@/types'
import AdminPanel from '@/components/admin/AdminPanel'
import AdminSectionHeading from '@/components/admin/AdminSectionHeading'
import PortfolioForm from '@/components/admin/PortfolioForm'
import { updateAdocaoAction } from '../../actions'

export const metadata: Metadata = { title: 'Editar caso — Portfólio — Amiga Miau Admin' }

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditarPortfolioPage({ params }: PageProps) {
  const { id } = await params

  const profile = await getUserProfile()
  if (!profile) redirect('/admin/login')
  if (profile.role === 'viewer') redirect('/admin/portfolio')

  const supabase = await createClient()

  const [{ data: adocaoData }, { data: animaisData }] = await Promise.all([
    supabase.from('adoptions').select('*').eq('id', id).single(),
    supabase
      .from('animals')
      .select('id, nome')
      .in('status', ['adotado', 'em_processo'])
      .order('nome'),
  ])

  if (!adocaoData) notFound()

  const adocao = adocaoData as Adoption
  const animais: Pick<Animal, 'id' | 'nome'>[] = (animaisData ?? []) as Pick<
    Animal,
    'id' | 'nome'
  >[]

  const boundAction = updateAdocaoAction.bind(null, id)

  return (
    <div className="admin-page mx-auto max-w-4xl">
      <nav aria-label="Navegação" className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
        <Link href="/admin/portfolio" className="hover:text-[var(--color-text-main)]">
          Portfólio
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-[var(--color-text-main)]">Editar caso</span>
      </nav>

      <AdminSectionHeading
        eyebrow="Histórias"
        title={`Editar: ${adocao.animal_nome}`}
        description="Ajuste foto, depoimento e vínculo do caso mantendo a leitura consistente com o restante do portfólio."
      />

      <AdminPanel className="p-6 sm:p-8">
        <PortfolioForm action={boundAction} animais={animais} adocao={adocao} />
      </AdminPanel>
    </div>
  )
}
