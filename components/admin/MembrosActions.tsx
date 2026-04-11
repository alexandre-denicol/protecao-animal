'use client'

import { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { UserRole, Profile } from '@/types'
import {
  convidarMembroAction,
  alterarRoleAction,
  revogarAcessoAction,
  reativarAcessoAction,
  type MembrosFormState,
} from '@/app/admin/(protected)/membros/actions'

// ─── Invite Form ─────────────────────────────────────────────────────────────

export function InviteForm({ onClose }: { onClose: () => void }) {
  const [isPending, setIsPending] = useState(false)
  const [state, setState] = useState<MembrosFormState>({})
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (isPending) return

    setIsPending(true)
    setState({})

    const formData = new FormData(e.currentTarget)

    try {
      const result = await convidarMembroAction({}, formData)
      setState(result)
      if (result.success) {
        router.refresh()
        setTimeout(onClose, 1500)
      }
    } catch {
      setState({ error: 'Ocorreu um erro inesperado. Tente novamente.' })
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {state.error && (
        <div
          role="alert"
          className="rounded-xl border border-salmon-200 bg-salmon-50 px-4 py-3 text-sm text-salmon-700"
        >
          {state.error}
        </div>
      )}

      {state.success && (
        <div
          role="status"
          className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
        >
          {state.success}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="invite-nome" className="text-sm font-semibold text-neutral-700">
            Nome <span className="text-salmon-500">*</span>
          </label>
          <input
            id="invite-nome"
            name="nome"
            type="text"
            required
            placeholder="Nome completo"
            className={`rounded-xl border px-3 py-2.5 text-sm text-neutral-800 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100 ${
              state.fieldErrors?.nome
                ? 'border-salmon-400 bg-salmon-50'
                : 'border-neutral-200 bg-white'
            }`}
          />
          {state.fieldErrors?.nome && (
            <p className="text-xs text-salmon-600">{state.fieldErrors.nome}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="invite-email" className="text-sm font-semibold text-neutral-700">
            E-mail <span className="text-salmon-500">*</span>
          </label>
          <input
            id="invite-email"
            name="email"
            type="email"
            required
            placeholder="nome@email.com"
            className={`rounded-xl border px-3 py-2.5 text-sm text-neutral-800 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100 ${
              state.fieldErrors?.email
                ? 'border-salmon-400 bg-salmon-50'
                : 'border-neutral-200 bg-white'
            }`}
          />
          {state.fieldErrors?.email && (
            <p className="text-xs text-salmon-600">{state.fieldErrors.email}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="invite-role" className="text-sm font-semibold text-neutral-700">
          Perfil de acesso <span className="text-salmon-500">*</span>
        </label>
        <select
          id="invite-role"
          name="role"
          required
          className={`rounded-xl border px-3 py-2.5 text-sm text-neutral-800 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100 ${
            state.fieldErrors?.role
              ? 'border-salmon-400 bg-salmon-50'
              : 'border-neutral-200 bg-white'
          }`}
        >
          <option value="">Selecione…</option>
          <option value="viewer">Visualizador — apenas leitura</option>
          <option value="editor">Editor — gerencia animais cadastrados por ele</option>
          <option value="admin">Admin — acesso completo</option>
        </select>
        {state.fieldErrors?.role && (
          <p className="text-xs text-salmon-600">{state.fieldErrors.role}</p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-1">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-primary-300 px-4 py-2.5 text-sm font-semibold text-primary-900 transition-colors hover:bg-primary-400 disabled:opacity-50"
        >
          {isPending && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          )}
          Enviar convite
        </button>
      </div>
    </form>
  )
}

// ─── Role Selector ────────────────────────────────────────────────────────────

export function RoleSelector({
  membro,
  currentUserId,
}: {
  membro: Profile
  currentUserId: string
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const isSelf = membro.id === currentUserId

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const novoRole = e.target.value as UserRole
    setError(null)

    startTransition(async () => {
      const result = await alterarRoleAction(membro.id, novoRole)
      if (result.error) {
        setError(result.error)
      } else {
        router.refresh()
      }
    })
  }

  return (
    <div className="flex flex-col gap-1">
      <select
        defaultValue={membro.role}
        onChange={handleChange}
        disabled={isPending || isSelf}
        aria-label={`Perfil de ${membro.nome}`}
        className="rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-neutral-700 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="viewer">Visualizador</option>
        <option value="editor">Editor</option>
        <option value="admin">Admin</option>
      </select>
      {error && <p className="text-xs text-salmon-600">{error}</p>}
    </div>
  )
}

// ─── Revoke / Reactivate Button ───────────────────────────────────────────────

export function RevokeButton({
  membro,
  currentUserId,
}: {
  membro: Profile
  currentUserId: string
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const isSelf = membro.id === currentUserId

  function handleToggle() {
    const msg = membro.ativo
      ? `Revogar acesso de ${membro.nome}? O membro não conseguirá mais fazer login.`
      : `Reativar acesso de ${membro.nome}?`

    if (!confirm(msg)) return

    startTransition(async () => {
      setError(null)
      const result = membro.ativo
        ? await revogarAcessoAction(membro.id)
        : await reativarAcessoAction(membro.id)

      if (result.error) {
        setError(result.error)
      } else {
        router.refresh()
      }
    })
  }

  if (isSelf) return null

  return (
    <div className="flex flex-col gap-1">
      <button
        disabled={isPending}
        onClick={handleToggle}
        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 focus:outline-2 focus:outline-offset-2 ${
          membro.ativo
            ? 'border-salmon-200 text-salmon-600 hover:bg-salmon-50 focus:outline-salmon-300'
            : 'border-green-200 text-green-600 hover:bg-green-50 focus:outline-green-300'
        }`}
      >
        {isPending ? 'Aguarde…' : membro.ativo ? 'Revogar' : 'Reativar'}
      </button>
      {error && <p className="text-xs text-salmon-600">{error}</p>}
    </div>
  )
}

// ─── Invite Modal Toggle ──────────────────────────────────────────────────────

export function InviteToggle() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-primary-300 px-4 py-2.5 text-sm font-semibold text-primary-900 transition-colors hover:bg-primary-400 focus:outline-2 focus:outline-primary-300 focus:outline-offset-2"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        Convidar membro
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Convidar novo membro"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Modal */}
          <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl sm:p-8">
            <h2 className="mb-6 text-xl font-bold text-neutral-800">
              Convidar novo membro
            </h2>
            <InviteForm onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  )
}
