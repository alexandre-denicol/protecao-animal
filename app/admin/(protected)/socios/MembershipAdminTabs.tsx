import Link from 'next/link'

const tabs = [
  { href: '/admin/socios', label: 'Triagem' },
  { href: '/admin/membros', label: 'Membros' },
  { href: '/admin/socios/pagamentos', label: 'Pagamentos' },
  { href: '/admin/socios/comunicacao', label: 'Comunicação' },
] as const

export type MembershipAdminTab = (typeof tabs)[number]['label']

export default function MembershipAdminTabs({
  active,
}: {
  active: MembershipAdminTab
}) {
  return (
    <nav
      aria-label="Navegação do módulo de sócios"
      className="mb-6 overflow-x-auto"
    >
      <div className="admin-panel flex min-w-max gap-2 p-2">
        {tabs.map((tab) => {
          const isActive = tab.label === active

          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={isActive ? 'page' : undefined}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-primary-300 ${
                isActive
                  ? 'border border-[rgba(244,184,96,0.24)] bg-[rgba(244,184,96,0.16)] text-[var(--color-primary)]'
                  : 'text-[var(--color-text-muted)] hover:bg-white/5 hover:text-[var(--color-text-main)]'
              }`}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
