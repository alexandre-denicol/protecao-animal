import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/auth/roles'
import type { Adoption } from '@/types'
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
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          className="text-primary-400"
          aria-hidden="true"
        >
          <path
            d="M12 21C12 21 3.5 15.5 3.5 9.5C3.5 6.46 5.96 4 9 4C10.54 4 11.93 4.65 12 5.5C12.07 4.65 13.46 4 15 4C18.04 4 20.5 6.46 20.5 9.5C20.5 15.5 12 21 12 21Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 8V14M9 11H15"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <h3 className="mb-1 text-base font-semibold text-neutral-700">
        Nenhum caso registrado ainda
      </h3>
      <p className="mb-5 max-w-xs text-sm text-neutral-500">
        Registre os casos de adoção bem-sucedidos para inspirar novos adotantes.
      </p>
      {canCreate && (
        <Link
          href="/admin/portfolio/novo"
          className="inline-flex items-center gap-2 rounded-xl bg-primary-300 px-5 py-2.5 text-sm font-semibold text-primary-900 transition-colors hover:bg-primary-400 focus:outline-2 focus:outline-primary-300 focus:outline-offset-2"
        >
          Registrar primeiro caso
        </Link>
      )}
    </div>
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
    <article className="overflow-hidden rounded-2xl bg-white shadow-md transition-shadow hover:shadow-lg">
      {/* Foto */}
      <div className="relative aspect-[4/3] bg-neutral-100">
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
              className="text-neutral-300"
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
            <h3 className="font-semibold text-neutral-800">{adocao.animal_nome}</h3>
            {adocao.adotante_nome && (
              <p className="text-sm text-neutral-500">Adotado por {adocao.adotante_nome}</p>
            )}
          </div>
          <time
            dateTime={adocao.data_adocao}
            className="shrink-0 text-xs text-neutral-400"
          >
            {formatDate(adocao.data_adocao)}
          </time>
        </div>

        {adocao.depoimento && (
          <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-neutral-600">
            &ldquo;{adocao.depoimento}&rdquo;
          </p>
        )}

        {canEdit && (
          <div className="flex items-center gap-2 pt-1">
            <Link
              href={`/admin/portfolio/${adocao.id}/editar`}
              className="inline-flex items-center rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
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
    <div>
      {/* Cabeçalho */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-800">
            Portfólio de adoções
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            {adocoes.length}{' '}
            {adocoes.length === 1 ? 'caso registrado' : 'casos registrados'}
          </p>
        </div>
        {canEdit && (
          <Link
            href="/admin/portfolio/novo"
            className="inline-flex items-center gap-2 rounded-xl bg-primary-300 px-4 py-2.5 text-sm font-semibold text-primary-900 transition-colors hover:bg-primary-400 focus:outline-2 focus:outline-primary-300 focus:outline-offset-2"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Novo caso
          </Link>
        )}
      </div>

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
