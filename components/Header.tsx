'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/animais', label: 'Adotar' },
  { href: '/socios', label: 'Sócios' },
  { href: '/adocoes', label: 'Histórias' },
  { href: '/sobre', label: 'Sobre nós' },
  { href: '/contato', label: 'Contato' },
]

export default function Header() {
  const [menuAberto, setMenuAberto] = useState(false)
  const pathname = usePathname()

  // Fechar menu ao navegar
  useEffect(() => {
    setMenuAberto(false)
  }, [pathname])

  // Travar scroll do body quando menu mobile está aberto
  useEffect(() => {
    document.body.style.overflow = menuAberto ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuAberto])

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-50 h-16 border-b border-white/10 bg-neutral-800/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo + Nome — esquerda */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 rounded-lg py-1 focus-visible:outline-2 focus-visible:outline-primary-300"
          aria-label="Associação Amiga Miau — Página inicial"
        >
          <div className="relative h-8 w-8">
            <Image
              src="/logo.svg"
              alt="Logo Amiga Miau"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="text-base font-bold tracking-tight text-white">
            Amiga Miau
          </span>
        </Link>

        {/* Navegação desktop — centralizada via posição absoluta */}
        <nav
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex"
          aria-label="Navegação principal"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-primary-300 ${
                isActive(link.href)
                  ? 'bg-white/15 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
              aria-current={isActive(link.href) ? 'page' : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA + hamburger — direita */}
        <div className="flex shrink-0 items-center gap-3">
          <Link
            href="/animais"
            className="hidden rounded-xl bg-primary-300 px-5 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-primary-400 focus-visible:outline-2 focus-visible:outline-primary-300 md:block"
          >
            Quero adotar
          </Link>
          <Link
            href="/admin/login"
            className="hidden rounded-xl px-3 py-2 text-sm font-semibold text-white/65 transition-colors duration-150 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-primary-300 lg:block"
          >
            Área da equipe
          </Link>

          {/* Hamburger — apenas mobile */}
          <button
            onClick={() => setMenuAberto((prev) => !prev)}
            aria-expanded={menuAberto}
            aria-controls="mobile-menu"
            aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-primary-300 md:hidden"
          >
            {menuAberto ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M4 4L16 16M16 4L4 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M3 5H17M3 10H17M3 15H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Menu mobile — dropdown suave */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navegação"
        className={`overflow-hidden transition-all duration-200 ease-out md:hidden ${
          menuAberto ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav
          className="border-t border-white/10 bg-neutral-800 px-4 pb-6 pt-4"
          aria-label="Navegação mobile"
        >
          <ul className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`block rounded-xl px-4 py-3 text-base font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-primary-300 ${
                    isActive(link.href)
                      ? 'bg-white/15 text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="mt-3">
              <Link
                href="/animais"
                className="block rounded-xl bg-primary-300 px-4 py-3 text-center text-base font-semibold text-white transition-colors duration-150 hover:bg-primary-400 focus-visible:outline-2 focus-visible:outline-primary-300"
              >
                Quero adotar
              </Link>
            </li>
            <li>
              <Link
                href="/admin/login"
                className="block rounded-xl px-4 py-3 text-center text-sm font-semibold text-white/70 transition-colors duration-150 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-primary-300"
              >
                Área da equipe
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
