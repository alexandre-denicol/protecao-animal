import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/auth/roles'
import type { Adoption } from '@/types'
import AdminEmptyState from '@/components/admin/AdminEmptyState'
import AdminPanel from '@/components/admin/AdminPanel'
import AdminSectionHeading from '@/components/admin/AdminSectionHeading'
import DeleteAdocaoButton from '@/components/admin/DeleteAdocaoButton'

export const metadata: Metadata = { title: 'Portfólio de adoções — Amiga Miau Admin' }

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function EmptyState({ canCreate }: { canCreate: boolean }) {
  return (
    <AdminEmptyState
      title="Nenhum caso registrado ainda"
      description="Registre as adoções bem-sucedidas para inspirar novos adotantes com histórias reais."
      action={
        canCreate ? (
          <Link
            href="/admin/portfolio/novo"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-[#1f1406] transition-colors hover:bg-[var(--color-primary-hover)] focus:outline-2 focus:outline-[var(--color-primary)] focus:outline-offset-2"
          >
            Registrar primeiro caso
          </Link>
        ) : undefined
      }
    />
  )
}

function AdocaoCard({
  adocao,
  canEdit,
}: {
  adocao: Adoption
  canEdit: boolean
}) {
  return (
    <article className="admin-panel overflow-hidden transition-shadow hover:border-[rgba(244,184,96,0.2)]">
      {/* Foto */}
      <div className="relative aspect-[4/3] bg-[rgba(255,255,255,0.04)]">
        {adocao.foto_url ? (
          <Image
            src={adocao.foto_url}
            alt={`Foto de ${adocao.animal_nome}`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              className="text-[var(--color-text-muted)]"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
              <path d="M3 15L8 10L12 14L16 10L21 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-5">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-[var(--color-text-main)]">{adocao.animal_nome}</h3>
            {adocao.adotante_nome && (
              <p className="text-sm text-[var(--color-text-muted)]">Adotado por {adocao.adotante_nome}</p>
            )}
          </div>
          <time
            dateTime={adocao.data_adocao}
            className="shrink-0 text-xs text-[var(--color-text-muted)]"
          >
            {formatDate(adocao.data_adocao)}
          </time>
        </div>

        {adocao.depoimento && (
          <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-[var(--color-text-muted)]">
            &ldquo;{adocao.depoimento}&rdquo;
          </p>
        )}

        {canEdit && (
          <div className="flex items-center gap-2 pt-1">
            <Link
              href={`/admin/portfolio/${adocao.id}/editar`}
              className="admin-button-muted px-3 py-1.5 text-xs"
            >
              Editar
            </Link>
            <DeleteAdocaoButton id={adocao.id} nome={adocao.animal_nome} />
          </div>
        )}
      </div>
    </article>
  )
}

export default async function PortfolioPage() {
  const profile = await getUserProfile()
  if (!profile) redirect('/admin/login')

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('adoptions')
    .select('*')
    .order('data_adocao', { ascending: false })

  const adocoes: Adoption[] = error ? [] : ((data ?? []) as Adoption[])

  const canEdit = profile.role === 'admin' || profile.role === 'editor'

  return (
    <div className="admin-page">
      <AdminSectionHeading
        eyebrow="Histórias"
        title="Portfólio de adoções"
        description={`${adocoes.length} ${adocoes.length === 1 ? 'caso registrado' : 'casos registrados'} para inspirar confiança e mostrar resultados reais da associação.`}
        actions={
          canEdit ? (
            <Link
              href="/admin/portfolio/novo"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-[#1f1406] transition-colors hover:bg-[var(--color-primary-hover)] focus:outline-2 focus:outline-[var(--color-primary)] focus:outline-offset-2"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Novo caso
            </Link>
          ) : undefined
        }
      />

      {/* Grid ou Empty State */}
      {adocoes.length === 0 ? (
        <EmptyState canCreate={canEdit} />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {adocoes.map((adocao) => (
            <AdocaoCard key={adocao.id} adocao={adocao} canEdit={canEdit} />
          ))}
        </div>
      )}
    </div>
  )
}
