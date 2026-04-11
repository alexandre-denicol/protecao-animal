import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/auth/roles'
import AnimalForm from '@/components/admin/AnimalForm'
import { criarAnimalAction } from '../actions'

export const metadata: Metadata = { title: 'Novo animal — Amiga Miau Admin' }

export default async function NovoAnimalPage() {
  const profile = await getUserProfile()
  if (!profile) redirect('/admin/login')
  if (profile.role === 'viewer') redirect('/admin/sem-permissao')

  return (
    <div className="mx-auto max-w-2xl">
      {/* Breadcrumb */}
      <nav aria-label="Navegação" className="mb-6 flex items-center gap-2 text-sm text-neutral-500">
        <Link href="/admin/animais" className="hover:text-neutral-700">
          Animais
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-neutral-800">Novo animal</span>
      </nav>

      <h1 className="mb-8 text-2xl font-bold tracking-tight text-neutral-800">
        Cadastrar novo animal
      </h1>

      <div className="rounded-2xl bg-white p-6 shadow-md sm:p-8">
        <AnimalForm mode="create" action={criarAnimalAction} />
      </div>
    </div>
  )
}
