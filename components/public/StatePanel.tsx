const iconToneClass = {
  neutral: 'bg-[rgba(244,184,96,0.12)] text-[var(--color-primary)]',
  alert: 'bg-[rgba(240,120,80,0.14)] text-[#f8a898]',
}

export const statePrimaryLinkClass =
  'inline-flex min-h-[2.75rem] items-center justify-center rounded-[var(--radius-button)] bg-[var(--color-primary)] px-5 text-sm font-bold text-neutral-950 transition duration-200 hover:bg-[var(--color-primary-hover)] focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]'

export const stateTextLinkClass =
  'inline-flex min-h-[2.75rem] items-center rounded-[var(--radius-button)] px-1 text-sm font-semibold text-[var(--color-primary)] underline decoration-[rgba(244,184,96,0.4)] underline-offset-4 transition hover:decoration-[var(--color-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]'

export function StateIcon({
  tone = 'neutral',
  children,
}: {
  tone?: keyof typeof iconToneClass
  children: React.ReactNode
}) {
  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full sm:h-11 sm:w-11 ${iconToneClass[tone]}`}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        {children}
      </svg>
    </div>
  )
}

/** Painel compacto e alinhado à esquerda: nunca maior que o conteúdo que substitui. */
export function StatePanel({
  testId,
  role,
  icon,
  children,
}: {
  testId: string
  role?: 'alert'
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section
      data-testid={testId}
      role={role}
      className="flex gap-3 rounded-2xl bg-white/[0.04] px-4 py-5 sm:gap-5 sm:px-6 sm:py-6"
    >
      {icon}
      <div className="min-w-0 max-w-2xl flex-1">{children}</div>
    </section>
  )
}

export function StateHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-xl font-bold tracking-[-0.01em] text-[var(--color-text-main)]">
      {children}
    </h2>
  )
}

export function StateText({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1.5 text-sm leading-6 text-[var(--color-text-soft)] sm:text-base sm:leading-7">
      {children}
    </p>
  )
}

export function StateActions({ children }: { children: React.ReactNode }) {
  return <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1">{children}</div>
}
