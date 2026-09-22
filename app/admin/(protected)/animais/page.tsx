import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/auth/roles'
import type { Animal, AnimalPhoto, AnimalEspecie, AnimalStatus } from '@/types'
import { especieLabel, idadeLabel, nomeDisplay, sexoLabel } from '@/lib/animal-format'
import AdminEmptyState from '@/components/admin/AdminEmptyState'
import AdminSectionHeading from '@/components/admin/AdminSectionHeading'
import AdminStatusBadge from '@/components/admin/StatusBadge'
import AnimalStatusSelect from '@/components/admin/AnimalStatusSelect'
import DeleteAnimalButton from '@/components/admin/DeleteAnimalButton'

export const metadata: Metadata = { title: 'Animais — Amiga Miau Admin' }

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface AnimalComFotos extends Omit<Animal, 'fotos'> {
  fotos: Pick<AnimalPhoto, 'url' | 'is_cover'>[]
}

interface PageProps {
  searchParams: { busca?: string; especie?: string; status?: string }
}

// ─── Helpers visuais ──────────────────────────────────────────────────────────

function EspecieBadge({ especie, detalhe }: { especie: AnimalEspecie; detalhe: string | null }) {
  return (
    <AdminStatusBadge tone={especie === 'gato' ? 'primary' : 'warning'}>
      {especieLabel(especie, detalhe)}
    </AdminStatusBadge>
  )
}

function StatusBadge({ status }: { status: AnimalStatus }) {
  const cfg: Record<AnimalStatus, { label: string; tone: 'success' | 'warning' | 'neutral' }> = {
    disponivel: { label: 'Disponível', tone: 'success' },
    em_processo: { label: 'Em processo', tone: 'warning' },
    adotado: { label: 'Adotado', tone: 'neutral' },
  }
  const { label, tone } = cfg[status]
  return <AdminStatusBadge tone={tone}>{label}</AdminStatusBadge>
}

function EmptyState({ podeAdcionar }: { podeAdcionar: boolean }) {
  return (
    <AdminEmptyState
      title="Nenhum animal encontrado"
      description={
        podeAdcionar
          ? 'Comece cadastrando o primeiro animal para adoção.'
          : 'Nenhum animal corresponde aos filtros aplicados.'
      }
      action={
        podeAdcionar ? (
          <Link
            href="/admin/animais/novo"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-[#1f1406] transition-colors hover:bg-[var(--color-primary-hover)]"
          >
            Cadastrar primeiro animal
          </Link>
        ) : undefined
      }
    />
  )
}

// ─── Filtros ──────────────────────────────────────────────────────────────────

function Filtros({
  busca,
  especie,
  status,
}: {
  busca: string
  especie: string
  status: string
}) {
  return (
    <form
      method="GET"
      action="/admin/animais"
      className="flex flex-col gap-3 sm:flex-row sm:items-center"
    >
      {/* Busca */}
      <div className="relative flex-1">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          aria-hidden="true"
        >
          <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          name="busca"
          defaultValue={busca}
          placeholder="Buscar por nome…"
          className="admin-input py-2.5 pl-9 pr-4"
        />
      </div>

      {/* Espécie */}
      <select
        name="especie"
        defaultValue={especie}
        className="admin-select"
      >
        <option value="">Todas as espécies</option>
        <option value="gato">Gato</option>
        <option value="cao">Cão</option>
        <option value="outro">Outro</option>
      </select>

      {/* Status */}
      <select
        name="status"
        defaultValue={status}
        className="admin-select"
      >
        <option value="">Todos os status</option>
        <option value="disponivel">Disponível</option>
        <option value="em_processo">Em processo</option>
        <option value="adotado">Adotado</option>
      </select>

      <button
        type="submit"
        className="admin-button-muted"
      >
        Filtrar
      </button>

      {(busca || especie || status) && (
        <Link
          href="/admin/animais"
          className="text-sm text-[var(--color-text-muted)] underline-offset-2 hover:text-[var(--color-text-main)] hover:underline"
        >
          Limpar
        </Link>
      )}
    </form>
  )
}

// ─── Card de Animal ────────────────────────────────────────────────────────────

function AnimalCard({
  animal,
  podeEditar,
}: {
  animal: AnimalComFotos
  podeEditar: boolean
}) {
  const capa = animal.fotos.find((f) => f.is_cover) ?? animal.fotos[0]

  return (
    <article
      data-testid="admin-animal-row"
      data-animal-id={animal.id}
      className="admin-panel flex flex-col gap-4 overflow-hidden transition-shadow hover:border-[rgba(244,184,96,0.2)] sm:flex-row sm:items-center"
    >
      {/* Foto */}
      <div className="relative h-40 w-full shrink-0 overflow-hidden bg-[rgba(255,255,255,0.04)] sm:h-28 sm:w-28">
        {capa ? (
          <Image
            src={capa.url}
            alt={nomeDisplay(animal.nome)}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 112px"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg
              width="28"
              height="28"
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

      {/* Info */}
      <div className="flex flex-1 flex-col gap-3 px-5 pb-5 sm:flex-row sm:items-center sm:pb-0 sm:pr-5">
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/admin/animais/${animal.id}/editar`}
              className="font-semibold text-[var(--color-text-main)] hover:text-[var(--color-primary)]"
            >
              {nomeDisplay(animal.nome)}
            </Link>
            <EspecieBadge especie={animal.especie} detalhe={animal.especie_detalhe} />
            {animal.destaque && (
                <AdminStatusBadge tone="warning">Destaque</AdminStatusBadge>
            )}
          </div>
          {animal.raca && (
            <span className="text-xs text-[var(--color-text-muted)]">{animal.raca}</span>
          )}
          <span className="text-xs text-[var(--color-text-muted)]">
            {sexoLabel(animal.sexo)}
            {(animal.idade_anos !== null || animal.idade_meses !== null) &&
              ` · ${idadeLabel(animal.idade_anos, animal.idade_meses, animal.idade_estimada)}`}
          </span>
        </div>

        {/* Ações */}
        <div className="flex flex-wrap items-center gap-2">
          {podeEditar ? (
            <AnimalStatusSelect id={animal.id} status={animal.status} />
          ) : (
            <StatusBadge status={animal.status} />
          )}

          {podeEditar && (
            <>
              <Link
                href={`/admin/animais/${animal.id}/editar`}
                className="admin-button-muted px-3 py-1.5 text-xs"
              >
                Editar
              </Link>
              <DeleteAnimalButton id={animal.id} nome={animal.nome} />
            </>
          )}
        </div>
      </div>
    </article>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AnimaisPage({ searchParams }: PageProps) {
  const profile = await getUserProfile()
  if (!profile) redirect('/admin/login')

  const busca = (searchParams.busca ?? '').trim()
  const especie = searchParams.especie ?? ''
  const status = searchParams.status ?? ''

  const supabase = await createClient()

  let query = supabase
    .from('animals')
    .select('*, fotos:animal_photos(url, is_cover)')
    .order('created_at', { ascending: false })

  // Editor vê apenas os próprios
  if (profile.role === 'editor') {
    query = query.eq('created_by', profile.id)
  }

  // Filtros
  if (busca) query = query.ilike('nome', `%${busca}%`)
  if (especie === 'gato' || especie === 'cao' || especie === 'outro') {
    query = query.eq('especie', especie as AnimalEspecie)
  }
  if (status === 'disponivel' || status === 'em_processo' || status === 'adotado') {
    query = query.eq('status', status as AnimalStatus)
  }

  const { data, error } = await query

  const animais: AnimalComFotos[] = error ? [] : ((data ?? []) as AnimalComFotos[])

  const podeAdcionar = profile.role === 'admin' || profile.role === 'editor'
  const podeEditar = (animal: AnimalComFotos) => {
    if (profile.role === 'admin') return true
    if (profile.role === 'editor') return animal.created_by === profile.id
    return false
  }

  const temFiltro = Boolean(busca || especie || status)

  return (
    <div className="admin-page" data-testid="admin-animals-page">
      <AdminSectionHeading
        eyebrow="Adoção"
        title="Animais"
        description={`${animais.length} ${animais.length === 1 ? 'animal' : 'animais'}${profile.role === 'editor' ? ' cadastrados por você' : ''}. Mantenha status, destaque e edição sempre à mão.`}
        actions={
          podeAdcionar ? (
            <Link
              href="/admin/animais/novo"
              data-testid="admin-new-animal-link"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-[#1f1406] transition-colors hover:bg-[var(--color-primary-hover)] focus:outline-2 focus:outline-[var(--color-primary)] focus:outline-offset-2"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Novo animal
            </Link>
          ) : undefined
        }
      />

      {/* Filtros */}
      <div className="admin-toolbar mb-6">
        <Filtros busca={busca} especie={especie} status={status} />
      </div>

      {/* Lista */}
      {animais.length === 0 ? (
        <EmptyState podeAdcionar={podeAdcionar && !temFiltro} />
      ) : (
        <div className="flex flex-col gap-4">
          {animais.map((animal) => (
            <AnimalCard
              key={animal.id}
              animal={animal}
              podeEditar={podeEditar(animal)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
