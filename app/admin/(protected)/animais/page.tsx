import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/auth/roles'
import type { Animal, AnimalPhoto, AnimalEspecie, AnimalStatus } from '@/types'
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

function EspecieBadge({ especie }: { especie: AnimalEspecie }) {
  const cfg =
    especie === 'gato'
      ? { label: 'Gato', className: 'bg-primary-100 text-primary-700' }
      : { label: 'Cão', className: 'bg-amber-100 text-amber-700' }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${cfg.className}`}
    >
      {cfg.label}
    </span>
  )
}

function StatusBadge({ status }: { status: AnimalStatus }) {
  const cfg: Record<AnimalStatus, { label: string; className: string }> = {
    disponivel: { label: 'Disponível', className: 'bg-green-100 text-green-700' },
    em_processo: { label: 'Em processo', className: 'bg-amber-100 text-amber-700' },
    adotado: { label: 'Adotado', className: 'bg-neutral-100 text-neutral-500' },
  }
  const { label, className } = cfg[status]
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}>
      {label}
    </span>
  )
}

function EmptyState({ podeAdcionar }: { podeAdcionar: boolean }) {
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
            d="M10 3C10 3 5 6 5 11C5 13.8 7.2 16 10 16C12.8 16 15 13.8 15 11C15 8.2 13.2 5.8 12 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M16 16L20 20"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="10" cy="11" r="2" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </div>
      <h3 className="mb-1 text-base font-semibold text-neutral-700">
        Nenhum animal encontrado
      </h3>
      <p className="mb-5 max-w-xs text-sm text-neutral-500">
        {podeAdcionar
          ? 'Comece cadastrando o primeiro animal para adoção.'
          : 'Nenhum animal corresponde aos filtros aplicados.'}
      </p>
      {podeAdcionar && (
        <Link
          href="/admin/animais/novo"
          className="inline-flex items-center gap-2 rounded-xl bg-primary-300 px-5 py-2.5 text-sm font-semibold text-primary-900 transition-colors hover:bg-primary-400 focus:outline-2 focus:outline-primary-300 focus:outline-offset-2"
        >
          Cadastrar primeiro animal
        </Link>
      )}
    </div>
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
          className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-9 pr-4 text-sm text-neutral-800 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100"
        />
      </div>

      {/* Espécie */}
      <select
        name="especie"
        defaultValue={especie}
        className="rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100"
      >
        <option value="">Todas as espécies</option>
        <option value="gato">Gato</option>
        <option value="cao">Cão</option>
      </select>

      {/* Status */}
      <select
        name="status"
        defaultValue={status}
        className="rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100"
      >
        <option value="">Todos os status</option>
        <option value="disponivel">Disponível</option>
        <option value="em_processo">Em processo</option>
        <option value="adotado">Adotado</option>
      </select>

      <button
        type="submit"
        className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 focus:outline-2 focus:outline-primary-300"
      >
        Filtrar
      </button>

      {(busca || especie || status) && (
        <Link
          href="/admin/animais"
          className="text-sm text-neutral-400 underline-offset-2 hover:text-neutral-600 hover:underline"
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
    <article className="flex flex-col gap-4 overflow-hidden rounded-2xl bg-white shadow-md transition-shadow hover:shadow-lg sm:flex-row sm:items-center">
      {/* Foto */}
      <div className="relative h-40 w-full shrink-0 overflow-hidden bg-neutral-100 sm:h-28 sm:w-28">
        {capa ? (
          <Image
            src={capa.url}
            alt={animal.nome}
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

      {/* Info */}
      <div className="flex flex-1 flex-col gap-3 px-5 pb-5 sm:flex-row sm:items-center sm:pb-0 sm:pr-5">
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/admin/animais/${animal.id}/editar`}
              className="font-semibold text-neutral-800 hover:text-primary-600"
            >
              {animal.nome}
            </Link>
            <EspecieBadge especie={animal.especie} />
            {animal.destaque && (
              <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                ★ Destaque
              </span>
            )}
          </div>
          {animal.raca && (
            <span className="text-xs text-neutral-500">{animal.raca}</span>
          )}
          <span className="text-xs text-neutral-400">
            {animal.sexo === 'macho' ? 'Macho' : 'Fêmea'}
            {animal.idade_anos !== null &&
              ` · ${animal.idade_anos} ano${animal.idade_anos !== 1 ? 's' : ''}${
                animal.idade_meses ? ` e ${animal.idade_meses} ${animal.idade_meses === 1 ? 'mês' : 'meses'}` : ''
              }`}
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
                className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
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
  if (especie === 'gato' || especie === 'cao') {
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
    <div>
      {/* Cabeçalho */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-800">Animais</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {animais.length} {animais.length === 1 ? 'animal' : 'animais'}
            {profile.role === 'editor' && ' cadastrados por você'}
          </p>
        </div>
        {podeAdcionar && (
          <Link
            href="/admin/animais/novo"
            className="inline-flex items-center gap-2 rounded-xl bg-primary-300 px-4 py-2.5 text-sm font-semibold text-primary-900 transition-colors hover:bg-primary-400 focus:outline-2 focus:outline-primary-300 focus:outline-offset-2"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Novo animal
          </Link>
        )}
      </div>

      {/* Filtros */}
      <div className="mb-6 rounded-2xl bg-white p-4 shadow-md">
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
