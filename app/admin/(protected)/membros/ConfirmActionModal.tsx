'use client'

interface ConfirmActionModalProps {
  title: string
  description: string
  confirmLabel: string
  confirmClassName?: string
  isLoading: boolean
  onCancel: () => void
  onConfirm: () => void
}

function LoadingDot() {
  return (
    <span
      aria-hidden="true"
      className="block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
    />
  )
}

export default function ConfirmActionModal({
  title,
  description,
  confirmLabel,
  confirmClassName = 'bg-neutral-800 text-white hover:bg-neutral-700',
  isLoading,
  onCancel,
  onConfirm,
}: ConfirmActionModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-action-title"
      aria-describedby="confirm-action-description"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-black/40"
        onClick={isLoading ? undefined : onCancel}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 id="confirm-action-title" className="text-xl font-bold text-neutral-800">
          {title}
        </h2>
        <p
          id="confirm-action-description"
          className="mt-3 text-sm leading-relaxed text-neutral-500"
        >
          {description}
        </p>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={isLoading}
            onClick={onCancel}
            className="inline-flex items-center justify-center rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-bold text-neutral-600 transition-colors hover:bg-neutral-50 focus:outline-2 focus:outline-primary-300 focus:outline-offset-2 disabled:cursor-wait disabled:opacity-60"
          >
            Voltar
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-colors focus:outline-2 focus:outline-primary-300 focus:outline-offset-2 disabled:cursor-wait disabled:opacity-60 ${confirmClassName}`}
          >
            {isLoading && <LoadingDot />}
            {isLoading ? 'Salvando...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

