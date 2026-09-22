import type { PublicAnimalRow } from '@/lib/public-animals'

export const CATALOG_PATH = '/animais'
export const CATALOG_PAGE_SIZE = 9
export const CATALOG_RESULTS_ID = 'resultados'
export const CATALOG_RESULTS_HEADING_ID = 'resultados-titulo'
export const CATALOG_LIVE_REGION_ID = 'catalogo-status'

const MAX_SEARCH_LENGTH = 60

export type CatalogSpecies = PublicAnimalRow['especie']
export type CatalogStatus = Exclude<PublicAnimalRow['status'], 'adotado'>

export interface CatalogFilters {
  busca: string
  especie: CatalogSpecies | null
  status: CatalogStatus | null
  pagina: number
}

export const SPECIES_FILTERS: { value: CatalogSpecies | null; label: string }[] = [
  { value: null, label: 'Todos' },
  { value: 'gato', label: 'Gatos' },
  { value: 'cao', label: 'Cães' },
  { value: 'outro', label: 'Outros' },
]

export const STATUS_FILTERS: { value: CatalogStatus | null; label: string }[] = [
  { value: null, label: 'Todos' },
  { value: 'disponivel', label: 'Disponíveis' },
  { value: 'em_processo', label: 'Em processo' },
]

type RawSearchParams = Record<string, string | string[] | undefined>

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

/** Lê e valida os search params da URL; valores desconhecidos são ignorados. */
export function parseCatalogFilters(raw: RawSearchParams): CatalogFilters {
  const especie = firstValue(raw.especie)
  const status = firstValue(raw.status)
  const pagina = Number.parseInt(firstValue(raw.pagina) ?? '', 10)

  return {
    busca: (firstValue(raw.busca) ?? '').trim().slice(0, MAX_SEARCH_LENGTH),
    especie:
      especie === 'gato' || especie === 'cao' || especie === 'outro' ? especie : null,
    status: status === 'disponivel' || status === 'em_processo' ? status : null,
    pagina: Number.isFinite(pagina) && pagina > 1 ? pagina : 1,
  }
}

export function hasActiveFilters(filters: CatalogFilters): boolean {
  return Boolean(filters.busca || filters.especie || filters.status)
}

export function buildCatalogHref(filters: CatalogFilters, hash?: string): string {
  const params = new URLSearchParams()

  if (filters.busca) params.set('busca', filters.busca)
  if (filters.especie) params.set('especie', filters.especie)
  if (filters.status) params.set('status', filters.status)
  if (filters.pagina > 1) params.set('pagina', String(filters.pagina))

  const query = params.toString()

  return `${CATALOG_PATH}${query ? `?${query}` : ''}${hash ? `#${hash}` : ''}`
}

function normalizeForSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

/** A busca considera nome e raça, ignora acentos e exige todas as palavras digitadas. */
export function filterCatalogAnimals(
  animals: PublicAnimalRow[],
  filters: CatalogFilters,
): PublicAnimalRow[] {
  const terms = normalizeForSearch(filters.busca).split(/\s+/).filter(Boolean)

  return animals.filter((animal) => {
    if (filters.especie && animal.especie !== filters.especie) return false
    if (filters.status && animal.status !== filters.status) return false
    if (terms.length === 0) return true

    const haystack = normalizeForSearch(`${animal.nome ?? ''} ${animal.raca ?? ''}`)

    return terms.every((term) => haystack.includes(term))
  })
}

export function countByStatus(animals: PublicAnimalRow[]): {
  disponiveis: number
  emProcesso: number
} {
  return {
    disponiveis: animals.filter((animal) => animal.status === 'disponivel').length,
    emProcesso: animals.filter((animal) => animal.status === 'em_processo').length,
  }
}

export interface CatalogPage<T> {
  items: T[]
  page: number
  totalPages: number
  totalItems: number
  firstItem: number
  lastItem: number
}

export function paginate<T>(
  items: T[],
  requestedPage: number,
  pageSize = CATALOG_PAGE_SIZE,
): CatalogPage<T> {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const page = Math.min(Math.max(1, requestedPage), totalPages)
  const start = (page - 1) * pageSize
  const pageItems = items.slice(start, start + pageSize)

  return {
    items: pageItems,
    page,
    totalPages,
    totalItems: items.length,
    firstItem: pageItems.length > 0 ? start + 1 : 0,
    lastItem: start + pageItems.length,
  }
}

export type PageItem = number | 'ellipsis'

/** Números de página com janela em torno da atual: 1 … 4 5 6 … 12 */
export function buildPageItems(current: number, total: number): PageItem[] {
  const pages = Array.from(
    new Set([1, current - 1, current, current + 1, total]),
  )
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b)

  const items: PageItem[] = []

  pages.forEach((page, index) => {
    const previous = pages[index - 1]

    if (previous !== undefined && page - previous === 2) items.push(previous + 1)
    else if (previous !== undefined && page - previous > 2) items.push('ellipsis')

    items.push(page)
  })

  return items
}

export function resultsTitle(total: number, filtered: boolean): string {
  if (filtered) {
    return `${total} ${total === 1 ? 'resultado encontrado' : 'resultados encontrados'}`
  }

  return `${total} ${total === 1 ? 'animal pronto' : 'animais prontos'} para conhecer você`
}
