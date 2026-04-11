'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { logoutAction } from '@/app/admin/login/actions'
import type { UserProfile, UserRole } from '@/lib/auth/roles'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  roles: UserRole[]
}

const navItems: NavItem[] = [
  {
    href: '/admin',
    label: 'Dashboard',
    roles: ['admin', 'editor', 'viewer'],
    icon: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    href: '/admin/animais',
    label: 'Animais',
    roles: ['admin', 'editor', 'viewer'],
    icon: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M7 3C7 2.44772 7.44772 2 8 2C8.55228 2 9 2.44772 9 3V5C9 5.55228 8.55228 6 8 6C7.44772 6 7 5.55228 7 5V3Z" fill="currentColor" />
        <path d="M11 3C11 2.44772 11.4477 2 12 2C12.5523 2 13 2.44772 13 3V5C13 5.55228 12.5523 6 12 6C11.4477 6 11 5.55228 11 5V3Z" fill="currentColor" />
        <path d="M3 7C3 6.44772 3.44772 6 4 6C4.55228 6 5 6.44772 5 7V9C5 9.55228 4.55228 10 4 10C3.44772 10 3 9.55228 3 9V7Z" fill="currentColor" />
        <path d="M15 7C15 6.44772 15.4477 6 16 6C16.5523 6 17 6.44772 17 7V9C17 9.55228 16.5523 10 16 10C15.4477 10 15 9.55228 15 9V7Z" fill="currentColor" />
        <path d="M5.5 9.5C5.5 7.84315 6.84315 6.5 8.5 6.5H11.5C13.1569 6.5 14.5 7.84315 14.5 9.5V13.5C14.5 15.9853 12.4853 18 10 18C7.51472 18 5.5 15.9853 5.5 13.5V9.5Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8.5 12.5C8.5 12.5 9 13.5 10 13.5C11 13.5 11.5 12.5 11.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/admin/interesses',
    label: 'Interesses',
    roles: ['admin', 'editor', 'viewer'],
    icon: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M10 16.5C10 16.5 3 12.5 3 7.5C3 5.01472 5.01472 3 7.5 3C8.87386 3 10.0994 3.60386 10.9411 4.56586C10.9617 4.58956 10.9817 4.61354 11.0011 4.63779C11.0205 4.61354 11.0405 4.58956 11.0611 4.56586C11.9028 3.60386 13.1284 3 14.5023 3C16.9876 3 19.0023 5.01472 19.0023 7.5C19.0023 12.5 12.0023 16.5 12.0023 16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: '/admin/mensagens',
    label: 'Mensagens',
    roles: ['admin', 'viewer'],
    icon: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M3 5C3 3.89543 3.89543 3 5 3H15C16.1046 3 17 3.89543 17 5V12C17 13.1046 16.1046 14 15 14H11L7.5 17V14H5C3.89543 14 3 13.1046 3 12V5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: '/admin/socios',
    label: 'Gerenciar sócios',
    roles: ['admin', 'viewer'],
    icon: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M4 17V7L10 3L16 7V17" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M7.5 17V11.5H12.5V17" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: '/admin/portfolio',
    label: 'Portfólio',
    roles: ['admin', 'editor'],
    icon: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <rect x="2" y="4" width="16" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2 8.5H18" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="6" cy="6.5" r="1" fill="currentColor" />
        <circle cx="10" cy="6.5" r="1" fill="currentColor" />
        <circle cx="14" cy="6.5" r="1" fill="currentColor" />
        <path d="M6 12L8.5 10L11 13L13 11.5L15 14H5L6 12Z" fill="currentColor" opacity="0.5" />
      </svg>
    ),
  },
  {
    href: '/admin/configuracoes',
    label: 'Configurações',
    roles: ['admin'],
    icon: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M10 2.5V4M10 16V17.5M4 10H2.5M17.5 10H16M5.4 5.4L4.34 4.34M15.66 15.66L14.6 14.6M14.6 5.4L15.66 4.34M4.34 15.66L5.4 14.6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
]

interface AdminSidebarProps {
  profile: UserProfile
}

export default function AdminSidebar({ profile }: AdminSidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const visibleItems = navItems.filter((item) =>
    item.roles.includes(profile.role)
  )

  function isActive(href: string) {
    if (href === '/admin') return pathname === '/admin'
    if (href === '/admin/socios') {
      return pathname.startsWith('/admin/socios') || pathname.startsWith('/admin/membros')
    }
    return pathname.startsWith(href)
  }

  const navContent = (
    <nav aria-label="Navegação do painel">
      <ul className="flex flex-col gap-0.5">
        {visibleItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive(item.href)
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
              aria-current={isActive(item.href) ? 'page' : undefined}
            >
              <span
                className={isActive(item.href) ? 'text-primary-600' : 'text-neutral-400'}
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )

  const userInfo = (
    <div className="border-t border-neutral-200 pt-4">
      <div className="mb-3 px-3">
        <p className="truncate text-sm font-semibold text-neutral-800">{profile.nome}</p>
        <p className="truncate text-xs text-neutral-500">{profile.email}</p>
        <span className="mt-1 inline-block rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
          {profile.role}
        </span>
      </div>
      <form action={logoutAction}>
        <button
          type="submit"
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-600 transition hover:bg-red-50 hover:text-red-600"
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M13 7L17 10M17 10L13 13M17 10H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7 3H4C3.44772 3 3 3.44772 3 4V16C3 16.5523 3.44772 17 4 17H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Sair
        </button>
      </form>
    </div>
  )

  return (
    <>
      {/* Sidebar desktop */}
      <aside
        className="hidden w-60 flex-shrink-0 flex-col border-r border-neutral-200 bg-white px-3 py-6 lg:flex"
        aria-label="Menu lateral"
      >
        <Link
          href="/"
          className="mb-8 flex items-center gap-3 rounded-lg px-3 py-1 transition-colors hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-primary-300"
          aria-label="Associação Amiga Miau — Página inicial"
        >
          <div className="relative h-8 w-8 flex-shrink-0">
            <Image src="/logo.svg" alt="Logo Amiga Miau" fill className="object-contain" />
          </div>
          <span className="text-sm font-bold text-neutral-800">Amiga Miau</span>
        </Link>

        <div className="flex flex-1 flex-col justify-between">
          {navContent}
          {userInfo}
        </div>
      </aside>

      {/* Header mobile */}
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3 lg:hidden">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg py-1 pr-2 transition-colors hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-primary-300"
          aria-label="Associação Amiga Miau — Página inicial"
        >
          <div className="relative h-7 w-7">
            <Image src="/logo.svg" alt="Logo Amiga Miau" fill className="object-contain" />
          </div>
          <span className="text-sm font-bold text-neutral-800">Amiga Miau</span>
        </Link>

        <button
          type="button"
          aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={mobileOpen}
          aria-controls="admin-mobile-menu"
          onClick={() => setMobileOpen((v) => !v)}
          className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100"
        >
          {mobileOpen ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M4 4L16 16M16 4L4 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M3 5H17M3 10H17M3 15H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </header>

      {/* Drawer mobile */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-20 bg-black/30 lg:hidden"
            aria-hidden="true"
            onClick={() => setMobileOpen(false)}
          />
          <div
            id="admin-mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navegação"
            className="fixed inset-y-0 left-0 z-30 flex w-72 flex-col border-r border-neutral-200 bg-white px-3 py-6 lg:hidden"
          >
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="mb-8 flex items-center gap-3 rounded-lg px-3 py-1 transition-colors hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-primary-300"
              aria-label="Associação Amiga Miau — Página inicial"
            >
              <div className="relative h-8 w-8 flex-shrink-0">
                <Image src="/logo.svg" alt="Logo Amiga Miau" fill className="object-contain" />
              </div>
              <span className="text-sm font-bold text-neutral-800">Amiga Miau</span>
            </Link>
            <div className="flex flex-1 flex-col justify-between">
              {navContent}
              {userInfo}
            </div>
          </div>
        </>
      )}
    </>
  )
}
