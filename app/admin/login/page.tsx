'use client'

import { useState } from 'react'
import Image from 'next/image'
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="relative h-16 w-16">
            <Image
              src="/logo.svg"
              alt="Logo Amiga Miau"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-neutral-900">Amiga Miau</h1>
            <p className="text-sm text-neutral-500">Área da equipe</p>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white px-8 py-10 shadow-sm">
          <h2 className="mb-6 text-center text-lg font-semibold text-neutral-800">
            Entrar na conta
          </h2>

          {error && (
            <div
              role="alert"
              className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-neutral-700"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                placeholder="seu@email.com"
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="senha"
                className="mb-1.5 block text-sm font-medium text-neutral-700"
              >
                Senha
              </label>
              <input
                id="senha"
                name="senha"
                type="password"
                autoComplete="current-password"
                required
                className="w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 disabled:opacity-60"
            >
              {pending ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-neutral-400">
          Acesso exclusivo para membros da equipe Amiga Miau.
        </p>
      </div>
    </div>
  )
}