'use client'

import { usePathname } from 'next/navigation'

export default function ConditionalLayout({
  children,
  header,
  footer,
}: {
  children: React.ReactNode
  header: React.ReactNode
  footer: React.ReactNode
}) {
  const pathname = usePathname()
  const isAdminRoute = pathname.startsWith('/admin')

  if (isAdminRoute) {
    return <>{children}</>
  }

  return (
    <>
      {header}
      <main className="flex-1 pt-16">{children}</main>
      {footer}
    </>
  )
}
