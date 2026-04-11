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
          className="rounded-xl border border-[rgba(252,165,165,0.22)] bg-[rgba(248,113,113,0.12)] px-4 py-3 text-sm text-[#fca5a5]"
        >
          {state.error}
        </div>
      )}

      {state.success && (
        <div
          role="status"
          className="rounded-xl border border-[rgba(113,211,205,0.24)] bg-[rgba(31,111,107,0.16)] px-4 py-3 text-sm text-[#8de0d9]"
        >
          {state.success}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="invite-nome" className="admin-label mb-1">
            Nome <span className="text-salmon-500">*</span>
          </label>
          <input
            id="invite-nome"
            name="nome"
            type="text"
            required
            placeholder="Nome completo"
            className={`admin-input ${
              state.fieldErrors?.nome
                ? 'border-salmon-400 bg-[rgba(248,113,113,0.12)]'
                : ''
            }`}
          />
          {state.fieldErrors?.nome && (
            <p className="text-xs text-[#fca5a5]">{state.fieldErrors.nome}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="invite-email" className="admin-label mb-1">
            E-mail <span className="text-salmon-500">*</span>
          </label>
          <input
            id="invite-email"
            name="email"
            type="email"
            required
            placeholder="nome@email.com"
            className={`admin-input ${
              state.fieldErrors?.email
                ? 'border-salmon-400 bg-[rgba(248,113,113,0.12)]'
                : ''
            }`}
          />
          {state.fieldErrors?.email && (
            <p className="text-xs text-[#fca5a5]">{state.fieldErrors.email}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="invite-role" className="admin-label mb-1">
          Perfil de acesso <span className="text-salmon-500">*</span>
        </label>
        <select
          id="invite-role"
          name="role"
          required
          className={`admin-select ${
            state.fieldErrors?.role
              ? 'border-salmon-400 bg-[rgba(248,113,113,0.12)]'
              : ''
          }`}
        >
          <option value="">Selecione…</option>
          <option value="viewer">Visualizador — apenas leitura</option>
          <option value="editor">Editor — gerencia animais cadastrados por ele</option>
          <option value="admin">Admin — acesso completo</option>
        </select>
        {state.fieldErrors?.role && (
          <p className="text-xs text-[#fca5a5]">{state.fieldErrors.role}</p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-1">
        <button
          type="button"
          onClick={onClose}
          className="admin-button-muted"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-[#1f1406] transition-colors hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
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
        className="admin-select min-h-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="viewer">Visualizador</option>
        <option value="editor">Editor</option>
        <option value="admin">Admin</option>
      </select>
      {error && <p className="text-xs text-[#fca5a5]">{error}</p>}
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
            ? 'border-[rgba(252,165,165,0.22)] text-[#fca5a5] hover:bg-[rgba(248,113,113,0.12)] focus:outline-[#fca5a5]'
            : 'border-[rgba(113,211,205,0.24)] text-[#8de0d9] hover:bg-[rgba(31,111,107,0.16)] focus:outline-[#8de0d9]'
        }`}
      >
        {isPending ? 'Aguarde…' : membro.ativo ? 'Revogar' : 'Reativar'}
      </button>
      {error && <p className="text-xs text-[#fca5a5]">{error}</p>}
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
        className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-[#1f1406] transition-colors hover:bg-[var(--color-primary-hover)] focus:outline-2 focus:outline-primary-300 focus:outline-offset-2"
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
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Modal */}
          <div className="admin-panel relative z-10 w-full max-w-lg p-6 sm:p-8">
            <h2 className="mb-6 text-xl font-semibold tracking-[-0.03em] text-[var(--color-text-main)]">
              Convidar novo membro
            </h2>
            <InviteForm onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  )
}
