import Link from 'next/link'
import {
  CATALOG_PATH,
  CATALOG_RESULTS_HEADING_ID,
  SPECIES_FILTERS,
  STATUS_FILTERS,
  buildCatalogHref,
  type CatalogFilters,
} from '@/lib/animal-catalog'

const primaryLinkClass =
  'inline-flex min-h-[2.75rem] items-center justify-center rounded-[var(--radius-button)] bg-[var(--color-primary)] px-5 text-sm font-bold text-neutral-950 transition duration-200 hover:bg-[var(--color-primary-hover)] focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]'
const textLinkClass =
  'inline-flex min-h-[2.75rem] items-center rounded-[var(--radius-button)] px-1 text-sm font-semibold text-[var(--color-primary)] underline decoration-[rgba(244,184,96,0.4)] underline-offset-4 transition hover:decoration-[var(--color-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]'

const iconToneClass = {
  neutral: 'bg-[rgba(244,184,96,0.12)] text-[var(--color-primary)]',
  alert: 'bg-[rgba(240,120,80,0.14)] text-[#f8a898]',
}

function StateIcon({
  tone = 'neutral',
  children,
}: {
  tone?: keyof typeof iconToneClass
  children: React.ReactNode
}) {
  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full sm:h-11 sm:w-11 ${iconToneClass[tone]}`}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        {children}
      </svg>
    </div>
  )
}

/** Painel compacto e alinhado à esquerda: nunca maior que o conteúdo que substitui. */
function StatePanel({
  testId,
  role,
  icon,
  children,
}: {
  testId: string
  role?: 'alert'
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section
      data-testid={testId}
      role={role}
      className="flex gap-3 rounded-2xl bg-white/[0.04] px-4 py-5 sm:gap-5 sm:px-6 sm:py-6"
    >
      {icon}
      <div className="min-w-0 max-w-2xl flex-1">{children}</div>
    </section>
  )
}

function StateHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      id={CATALOG_RESULTS_HEADING_ID}
      tabIndex={-1}
      className="font-display text-xl font-bold tracking-[-0.01em] text-[var(--color-text-main)] outline-none"
    >
      {children}
    </h2>
  )
}

function StateText({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1.5 text-sm leading-6 text-[var(--color-text-soft)] sm:text-base sm:leading-7">
      {children}
    </p>
  )
}

function StateActions({ children }: { children: React.ReactNode }) {
  return <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1">{children}</div>
}

export function CatalogEmptyState() {
  return (
    <StatePanel
      testId="animals-empty-state"
      icon={
        <StateIcon>
          <path d="M4 12C4 8.7 6.7 6 10 6H14C17.3 6 20 8.7 20 12C20 15.3 17.3 18 14 18H10C6.7 18 4 15.3 4 12Z" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 10.5H8.01M16 10.5H16.01M9 14C10.8 15.3 13.2 15.3 15 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </StateIcon>
      }
    >
      <StateHeading>Nenhum animal para adoção no momento</StateHeading>
      <StateText>
        Ainda não há animais publicados no catálogo. Quando a equipe cadastrar novos
        animais, eles aparecem aqui.
      </StateText>
      <StateActions>
        <Link href="/contato" className={primaryLinkClass}>
          Falar com a equipe
        </Link>
        <Link href="/socios" className={textLinkClass}>
          Quero ser sócio
        </Link>
      </StateActions>
    </StatePanel>
  )
}

function describeActiveFilters(filters: CatalogFilters): string[] {
  const parts: string[] = []

  if (filters.busca) parts.push(`Busca: “${filters.busca}”`)

  const especie = SPECIES_FILTERS.find((option) => option.value === filters.especie)
  if (filters.especie && especie) parts.push(`Espécie: ${especie.label}`)

  const status = STATUS_FILTERS.find((option) => option.value === filters.status)
  if (filters.status && status) parts.push(`Status: ${status.label}`)

  return parts
}

export function CatalogNoMatchesState({
  filters,
  totalAnimals,
}: {
  filters: CatalogFilters
  totalAnimals: number
}) {
  return (
    <StatePanel
      testId="animals-no-results"
      icon={
        <StateIcon>
          <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.6" />
          <path d="M16 16L20 20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </StateIcon>
      }
    >
      <StateHeading>Nenhum animal encontrado com esses filtros</StateHeading>
      <ul className="mt-2 flex flex-wrap gap-2">
        {describeActiveFilters(filters).map((description) => (
          <li
            key={description}
            className="rounded-full bg-white/[0.08] px-3 py-1 text-xs font-medium text-[var(--color-text-soft)]"
          >
            {description}
          </li>
        ))}
      </ul>
      <StateText>
        {totalAnimals === 1
          ? 'Há 1 animal no catálogo sem filtros.'
          : `Há ${totalAnimals} animais no catálogo sem filtros.`}{' '}
        Tente outra busca ou limpe os filtros.
      </StateText>
      <StateActions>
        <Link href={CATALOG_PATH} scroll={false} className={primaryLinkClass}>
          Limpar filtros e ver todos
        </Link>
      </StateActions>
    </StatePanel>
  )
}

export function CatalogLoadFailureState({ filters }: { filters: CatalogFilters }) {
  return (
    <StatePanel
      testId="animals-error-state"
      role="alert"
      icon={
        <StateIcon tone="alert">
          <path d="M12 8V13M12 16.5V16.51" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M10.3 4.6L3.4 16.6C2.7 17.8 3.6 19.3 5 19.3H19C20.4 19.3 21.3 17.8 20.6 16.6L13.7 4.6C13 3.4 11 3.4 10.3 4.6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </StateIcon>
      }
    >
      <StateHeading>Não foi possível carregar os animais</StateHeading>
      <StateText>
        Tivemos um problema ao buscar a lista agora. Tente novamente em instantes; se
        continuar, fale com a equipe.
      </StateText>
      <StateActions>
        {/* <a> de propósito: força uma nova requisição ao servidor */}
        <a href={buildCatalogHref(filters)} className={primaryLinkClass}>
          Tentar novamente
        </a>
        <Link href="/contato" className={textLinkClass}>
          Falar com a equipe
        </Link>
      </StateActions>
    </StatePanel>
  )
}
