import type { ReactNode } from 'react'

export default function AdminStatCard({
  label,
  value,
  icon,
  tone = 'default',
  detail,
}: {
  label: string
  value: number | string
  icon: ReactNode
  tone?: 'default' | 'success' | 'warning' | 'danger'
  detail?: string
}) {
  const toneClass =
    tone === 'success'
      ? 'border-[rgba(113,211,205,0.2)] bg-[rgba(31,111,107,0.16)] text-[#8de0d9]'
      : tone === 'warning'
        ? 'border-[rgba(244,184,96,0.24)] bg-[rgba(244,184,96,0.14)] text-[var(--color-primary)]'
        : tone === 'danger'
          ? 'border-[rgba(252,165,165,0.22)] bg-[rgba(248,113,113,0.12)] text-[#fca5a5]'
          : 'border-white/10 bg-white/5 text-[var(--color-text-main)]'

  return (
    <article className="admin-panel relative overflow-hidden p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-[var(--color-text-muted)]">{label}</p>
          <p className="text-2xl font-semibold tracking-[-0.04em] text-[var(--color-text-main)] sm:text-3xl">
            {value}
          </p>
          {detail ? <p className="text-xs text-[var(--color-text-muted)]">{detail}</p> : null}
        </div>
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${toneClass}`}
        >
          {icon}
        </div>
      </div>
    </article>
  )
}
