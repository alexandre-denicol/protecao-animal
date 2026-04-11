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
      <div className="flex min-w-max gap-2 rounded-2xl border border-neutral-100 bg-white p-2 shadow-sm">
        {tabs.map((tab) => {
          const isActive = tab.label === active

          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={isActive ? 'page' : undefined}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-primary-300 ${
                isActive
                  ? 'bg-primary-300 text-primary-900'
                  : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800'
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

