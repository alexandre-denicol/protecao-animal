'use client'

import { useState } from 'react'
import BrandLogo from '@/components/BrandLogo'
import { loginAction } from './actions'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await loginAction(null, formData)

    if (result && 'error' in result) {
      setError(result.error)
      setPending(false)
      return
    }

    window.location.href = '/admin'
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(244,184,96,0.12),_transparent_24%),linear-gradient(180deg,_rgba(17,24,39,0.98),_rgba(13,17,23,1))] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <BrandLogo
            className="flex-col gap-4 text-center"
            labelClassName="text-center"
            imageClassName="h-20 w-20 p-2.5"
          />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[var(--color-text-main)]">Área da equipe</h1>
            <p className="text-sm text-[var(--color-text-muted)]">Acesso seguro ao painel administrativo</p>
          </div>
        </div>

        <div className="rounded-[var(--radius-card)] border border-white/10 bg-[rgba(17,24,39,0.92)] px-8 py-10 shadow-[var(--shadow-soft)] backdrop-blur">
          <h2 className="mb-6 text-center text-lg font-semibold text-[var(--color-text-main)]">
            Entrar na conta
          </h2>

          {error && (
            <div
              role="alert"
              className="mb-5 rounded-[var(--radius-button)] border border-[rgba(248,113,113,0.35)] bg-[rgba(127,29,29,0.25)] px-4 py-3 text-sm text-[#fecaca]"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-[var(--color-text-main)]"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full rounded-[var(--radius-button)] border border-white/10 bg-[rgba(255,255,255,0.03)] px-3.5 py-2.5 text-sm text-[var(--color-text-main)] placeholder:text-[var(--color-text-muted)] outline-none transition focus:border-[var(--color-primary)]"
                placeholder="seu@email.com"
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="senha"
                className="mb-1.5 block text-sm font-medium text-[var(--color-text-main)]"
              >
                Senha
              </label>
              <input
                id="senha"
                name="senha"
                type="password"
                autoComplete="current-password"
                required
                className="w-full rounded-[var(--radius-button)] border border-white/10 bg-[rgba(255,255,255,0.03)] px-3.5 py-2.5 text-sm text-[var(--color-text-main)] placeholder:text-[var(--color-text-muted)] outline-none transition focus:border-[var(--color-primary)]"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={pending}
              data-testid="admin-login-submit"
              className="w-full rounded-[var(--radius-button)] bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-neutral-950 shadow-[0_12px_30px_rgba(244,184,96,0.2)] transition duration-200 hover:bg-[var(--color-primary-hover)] disabled:opacity-60"
            >
              {pending ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-[var(--color-text-muted)]">
          Acesso exclusivo para membros da equipe Associação Amiga MiAu.
        </p>
      </div>
    </div>
  )
}
