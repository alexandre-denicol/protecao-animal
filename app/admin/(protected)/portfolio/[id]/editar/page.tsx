import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/auth/roles'
import type { Adoption, Animal } from '@/types'
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
    <div className="mx-auto max-w-2xl">
      {/* Breadcrumb */}
      <nav aria-label="Navegação" className="mb-6 flex items-center gap-2 text-sm text-neutral-500">
        <Link href="/admin/portfolio" className="hover:text-neutral-700">
          Portfólio
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-neutral-800">Editar caso</span>
      </nav>

      <h1 className="mb-8 text-2xl font-bold tracking-tight text-neutral-800">
        Editar: {adocao.animal_nome}
      </h1>

      <div className="rounded-2xl bg-white p-6 shadow-md sm:p-8">
        <PortfolioForm action={boundAction} animais={animais} adocao={adocao} />
      </div>
    </div>
  )
}
