import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/auth/roles'
import type { Animal, AnimalPhoto } from '@/types'
import { nomeDisplay } from '@/lib/animal-format'
import AdminPanel from '@/components/admin/AdminPanel'
import AdminSectionHeading from '@/components/admin/AdminSectionHeading'
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
    <div className="admin-page mx-auto max-w-4xl">
      <nav aria-label="Navegação" className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
        <Link href="/admin/animais" className="hover:text-[var(--color-text-main)]">
          Animais
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-[var(--color-text-main)]">Editar</span>
      </nav>

      <AdminSectionHeading
        eyebrow="Cadastro"
        title={`Editar: ${nomeDisplay(animal.nome)}`}
        description="Atualize dados, fotos, status e destaque sem perder o contexto do cadastro."
      />

      <AdminPanel className="p-6 sm:p-8">
        <AnimalForm mode="edit" animal={animal} action={boundAction} />
      </AdminPanel>
    </div>
  )
}
