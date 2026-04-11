import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/auth/roles'
import AdminPanel from '@/components/admin/AdminPanel'
import AdminSectionHeading from '@/components/admin/AdminSectionHeading'
import AnimalForm from '@/components/admin/AnimalForm'
import { criarAnimalAction } from '../actions'

export const metadata: Metadata = { title: 'Novo animal — Amiga Miau Admin' }

export default async function NovoAnimalPage() {
  const profile = await getUserProfile()
  if (!profile) redirect('/admin/login')
  if (profile.role === 'viewer') redirect('/admin/sem-permissao')

  return (
    <div className="admin-page mx-auto max-w-4xl">
      <nav aria-label="Navegação" className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
        <Link href="/admin/animais" className="hover:text-[var(--color-text-main)]">
          Animais
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-[var(--color-text-main)]">Novo animal</span>
      </nav>

      <AdminSectionHeading
        eyebrow="Cadastro"
        title="Cadastrar novo animal"
        description="Preencha os dados com calma, organize as fotos e deixe tudo pronto para publicação no site."
      />

      <AdminPanel className="p-6 sm:p-8">
        <AnimalForm mode="create" action={criarAnimalAction} />
      </AdminPanel>
    </div>
  )
}
