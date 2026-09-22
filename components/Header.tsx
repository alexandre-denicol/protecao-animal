'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import BrandLogo from './BrandLogo'

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
  const botaoMenuRef = useRef<HTMLButtonElement>(null)
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

  // Escape fecha o menu e devolve o foco ao botão que o abriu
  useEffect(() => {
    if (!menuAberto) return

    function fecharComEscape(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      setMenuAberto(false)
      botaoMenuRef.current?.focus()
    }

    document.addEventListener('keydown', fecharComEscape)
    return () => document.removeEventListener('keydown', fecharComEscape)
  }, [menuAberto])

  // O menu aberto cobre a página; se o foco sair do header, ele fecha
  function fecharSeFocoSairDoHeader(event: React.FocusEvent<HTMLElement>) {
    const proximo = event.relatedTarget

    if (menuAberto && proximo instanceof Node && !event.currentTarget.contains(proximo)) {
      setMenuAberto(false)
    }
  }

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <header
      onBlur={fecharSeFocoSairDoHeader}
      className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-[rgba(13,17,23,0.8)] shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl"
    >
      <div className="mx-auto flex min-h-[4.75rem] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

        <Link
          href="/"
          className="rounded-2xl focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]"
          aria-label="Associação Amiga MiAu — Página inicial"
        >
          <BrandLogo compact className="gap-3" />
        </Link>

        <nav
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 xl:flex"
          aria-label="Navegação principal"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-[var(--radius-button)] px-3.5 py-2 text-sm font-medium underline-offset-[6px] transition duration-200 focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] ${
                isActive(link.href)
                  ? 'text-[var(--color-text-main)] underline decoration-[var(--color-primary)] decoration-2'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
              }`}
              aria-current={isActive(link.href) ? 'page' : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <Link
            href="/animais"
            className="hidden rounded-[var(--radius-button)] bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-neutral-950 shadow-[0_10px_24px_rgba(244,184,96,0.22)] transition duration-200 hover:bg-[var(--color-primary-hover)] hover:shadow-[0_14px_28px_rgba(244,184,96,0.28)] focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] md:block"
          >
            Quero adotar
          </Link>

          <button
            ref={botaoMenuRef}
            type="button"
            onClick={() => setMenuAberto((prev) => !prev)}
            aria-expanded={menuAberto}
            aria-controls="mobile-menu"
            aria-label="Menu de navegação"
            className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-button)] border border-white/10 bg-white/5 text-[var(--color-text-main)] transition duration-200 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] xl:hidden"
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

      {/* Menu mobile: disclosure. Fechado, fica invisible (fora da ordem de Tab e do leitor de tela). */}
      <div
        id="mobile-menu"
        className={`overflow-hidden transition-all duration-200 ease-out motion-reduce:transition-none xl:hidden ${
          menuAberto ? 'visible max-h-screen opacity-100' : 'invisible max-h-0 opacity-0'
        }`}
      >
        <nav
          className="border-t border-white/10 bg-[var(--color-surface-1)] px-4 pb-6 pt-4"
          aria-label="Navegação mobile"
        >
          <ul className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`block rounded-[var(--radius-button)] border-l-2 px-4 py-3 text-base font-medium transition duration-200 focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] ${
                    isActive(link.href)
                      ? 'border-[var(--color-primary)] text-[var(--color-text-main)]'
                      : 'border-transparent text-[var(--color-text-muted)] hover:bg-white/5 hover:text-[var(--color-text-main)]'
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
                className="block rounded-[var(--radius-button)] bg-[var(--color-primary)] px-4 py-3 text-center text-base font-semibold text-neutral-950 transition duration-200 hover:bg-[var(--color-primary-hover)] focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]"
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
