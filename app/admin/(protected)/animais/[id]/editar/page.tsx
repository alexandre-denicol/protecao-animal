import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/auth/roles'
import type { Animal, AnimalPhoto } from '@/types'
import AnimalForm from '@/components/admin/AnimalForm'
import { atualizarAnimalAction } from '../../actions'

export const metadata: Metadata = { title: 'Editar animal — Amiga Miau Admin' }

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditarAnimalPage({ params }: PageProps) {
  const { id } = await params

  const profile = await getUserProfile()
  if (!profile) redirect('/admin/login')
  if (profile.role === 'viewer') redirect('/admin/sem-permissao')

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('animals')
    .select('*, fotos:animal_photos(*)')
    .eq('id', id)
    .single()

  if (error || !data) notFound()

  const animal = data as Animal & { fotos: AnimalPhoto[] }

  // Editor só pode editar os próprios animais
  if (profile.role === 'editor' && animal.created_by !== profile.id) {
    redirect('/admin/sem-permissao')
  }

  const boundAction = atualizarAnimalAction.bind(null, id)

  return (
    <div className="mx-auto max-w-2xl">
      {/* Breadcrumb */}
      <nav aria-label="Navegação" className="mb-6 flex items-center gap-2 text-sm text-neutral-500">
        <Link href="/admin/animais" className="hover:text-neutral-700">
          Animais
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-neutral-800">Editar</span>
      </nav>

      <h1 className="mb-8 text-2xl font-bold tracking-tight text-neutral-800">
        Editar: {animal.nome}
      </h1>

      <div className="rounded-2xl bg-white p-6 shadow-md sm:p-8">
        <AnimalForm mode="edit" animal={animal} action={boundAction} />
      </div>
    </div>
  )
}
