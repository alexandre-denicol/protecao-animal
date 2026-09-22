import { countByStatus } from '@/lib/animal-catalog'
import { getPublicAnimalRows } from '@/lib/public-animals'

export function CatalogStatsSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="h-10 w-60 animate-pulse rounded-full bg-white/10 motion-reduce:animate-none"
    />
  )
}

export default async function CatalogStats() {
  const { rows, failed } = await getPublicAnimalRows()

  if (failed || rows.length === 0) return null

  const { disponiveis, emProcesso } = countByStatus(rows)

  return (
    <dl className="flex flex-wrap gap-x-6 gap-y-2 sm:gap-x-8">
      {[
        { value: disponiveis, label: 'Disponíveis agora' },
        { value: emProcesso, label: 'Em processo' },
      ].map((item) => (
        <div
          key={item.label}
          className="flex flex-row-reverse items-baseline justify-end gap-2 border-l border-[rgba(244,184,96,0.35)] pl-3 sm:flex-col-reverse sm:items-stretch sm:gap-1 sm:pl-4"
        >
          <dt className="text-sm font-medium text-[var(--color-text-muted)]">{item.label}</dt>
          <dd className="font-display text-2xl font-extrabold tabular-nums leading-none text-[var(--color-text-main)] sm:text-3xl">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
