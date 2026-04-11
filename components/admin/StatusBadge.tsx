type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger'

const TONE_CLASS: Record<Tone, string> = {
  neutral:
    'border-white/10 bg-white/5 text-[var(--color-text-muted)]',
  primary:
    'border-[rgba(244,184,96,0.22)] bg-[rgba(244,184,96,0.14)] text-[var(--color-primary)]',
  success:
    'border-[rgba(113,211,205,0.24)] bg-[rgba(31,111,107,0.16)] text-[#8de0d9]',
  warning:
    'border-[rgba(244,184,96,0.24)] bg-[rgba(244,184,96,0.16)] text-[var(--color-primary)]',
  danger:
    'border-[rgba(252,165,165,0.22)] bg-[rgba(248,113,113,0.12)] text-[#fca5a5]',
}

export default function StatusBadge({
  children,
  tone = 'neutral',
  className = '',
}: {
  children: React.ReactNode
  tone?: Tone
  className?: string
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${TONE_CLASS[tone]} ${className}`.trim()}
    >
      {children}
    </span>
  )
}
