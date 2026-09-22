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
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-[var(--radius-button)] focus:bg-[var(--color-primary)] focus:px-5 focus:py-3 focus:text-sm focus:font-bold focus:text-neutral-950 focus:shadow-[0_14px_28px_rgba(0,0,0,0.5)] focus:outline-2 focus:outline-offset-2 focus:outline-white"
      >
        Pular para o conteúdo
      </a>
      {header}
      {/* Único landmark main das páginas públicas; as páginas usam <div>. */}
      <main id="main-content" tabIndex={-1} className="flex-1 pt-16 focus:outline-none">
        {children}
      </main>
      {footer}
    </>
  )
}
