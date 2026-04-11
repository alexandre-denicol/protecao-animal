import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sem permissão',
}

export default function SemPermissaoPage() {
  return (
    <div className="admin-page flex flex-1 items-center justify-center py-10">
      <div className="admin-panel flex max-w-lg flex-col items-center justify-center gap-6 px-6 py-14 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[rgba(252,165,165,0.22)] bg-[rgba(248,113,113,0.12)]">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className="text-[#fca5a5]"
        >
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M12 8V12M12 16H12.01"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div>
        <h1 className="mb-2 text-xl font-semibold text-[var(--color-text-main)]">Acesso restrito</h1>
        <p className="max-w-sm text-sm text-[var(--color-text-muted)]">
          Você não tem permissão para acessar esta página. Fale com o administrador caso precise de acesso.
        </p>
      </div>

      <Link
        href="/admin"
        className="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-[#1f1406] transition hover:bg-[var(--color-primary-hover)]"
      >
        Voltar ao dashboard
      </Link>
      </div>
    </div>
  )
}
