import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sem permissão',
}

export default function SemPermissaoPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className="text-red-500"
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
        <h1 className="mb-2 text-xl font-bold text-neutral-900">Acesso restrito</h1>
        <p className="max-w-sm text-sm text-neutral-500">
          Você não tem permissão para acessar esta página. Fale com o administrador caso precise de acesso.
        </p>
      </div>

      <Link
        href="/admin"
        className="rounded-lg bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-600"
      >
        Voltar ao dashboard
      </Link>
    </div>
  )
}
