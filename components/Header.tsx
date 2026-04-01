'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

const navLinks = [
  { href: '/animais', label: 'Adotar' },
  { href: '/adocoes', label: 'Histórias' },
  { href: '/sobre', label: 'Sobre nós' },
  { href: '/contato', label: 'Contato' },
]

export default function Header() {
  const [menuAberto, setMenuAberto] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Fechar menu ao navegar
  useEffect(() => {
    setMenuAberto(false)
  }, [pathname])

  // Travar scroll do body quando menu mobile está aberto
  useEffect(() => {
    document.body.style.overflow = menuAberto ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuAberto])

  return (
    <header
      className={`sticky top-0 z-50 bg-white transition-shadow duration-200 ${
        scrolled ? 'shadow-sm' : 'shadow-none'
      }`}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo + Nome */}
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-lg py-1 focus-visible:outline-2 focus-visible:outline-primary-300"
            aria-label="Associação Amiga Miau — Página inicial"
          >
            <div className="relative h-9 w-9 flex-shrink-0">
              <Image
                src="/logo.svg"
                alt="Logo Amiga Miau"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="text-lg font-bold tracking-tight text-neutral-800">
              Amiga Miau
            </span>
          </Link>

          {/* Navegação desktop */}
          <nav className="hidden items-center gap-1 md:flex" aria-label="Navegação principal">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-primary-300 ${
                  pathname.startsWith(link.href)
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA desktop + botão hamburger */}
          <div className="flex items-center gap-3">
            <Link
              href="/animais"
              className="hidden rounded-xl bg-primary-300 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-primary-400 focus-visible:outline-2 focus-visible:outline-primary-300 md:block"
            >
              Quero adotar
            </Link>

            {/* Botão hamburger — apenas mobile */}
            <button
              onClick={() => setMenuAberto((prev) => !prev)}
              aria-expanded={menuAberto}
              aria-controls="mobile-menu"
              aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-neutral-700 transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-primary-300 md:hidden"
            >
              {menuAberto ? (
                // Ícone X
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M4 4L16 16M16 4L4 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              ) : (
                // Ícone hamburger
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M3 5H17M3 10H17M3 15H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>
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
          className="border-t border-neutral-100 bg-white px-4 pb-6 pt-4"
          aria-label="Navegação mobile"
        >
          <ul className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`block rounded-xl px-4 py-3 text-base font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-primary-300 ${
                    pathname.startsWith(link.href)
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-neutral-700 hover:bg-neutral-100'
                  }`}
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
          </ul>
        </nav>
      </div>
    </header>
  )
}
