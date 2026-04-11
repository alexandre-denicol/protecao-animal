import type { ReactNode } from 'react'

export default function AdminPanel({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <section className={`admin-panel p-5 sm:p-6 ${className}`.trim()}>{children}</section>
}
