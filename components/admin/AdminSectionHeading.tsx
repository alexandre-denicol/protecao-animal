import type { ReactNode } from 'react'

export default function AdminSectionHeading({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0 space-y-2">
        {eyebrow ? <p className="admin-kicker">{eyebrow}</p> : null}
        <div className="space-y-2">
          <h1 className="admin-title">{title}</h1>
          {description ? <p className="admin-subtitle">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2.5 lg:justify-end">{actions}</div> : null}
    </div>
  )
}
