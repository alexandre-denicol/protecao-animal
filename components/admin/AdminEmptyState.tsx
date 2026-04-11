import type { ReactNode } from 'react'

export default function AdminEmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string
  description: string
  action?: ReactNode
  icon?: ReactNode
}) {
  return (
    <div className="admin-panel flex flex-col items-center justify-center gap-4 px-6 py-12 sm:py-14 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[var(--color-primary)]">
        {icon ?? (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 12H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
      </div>
      <div className="space-y-1.5">
        <h3 className="text-lg font-semibold text-[var(--color-text-main)]">{title}</h3>
        <p className="mx-auto max-w-md text-sm leading-6 text-[var(--color-text-muted)]">
          {description}
        </p>
      </div>
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  )
}
