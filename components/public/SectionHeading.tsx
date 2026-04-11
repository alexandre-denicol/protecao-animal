export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
}: {
  eyebrow?: string
  title: string
  description?: string
  align?: 'left' | 'center'
}) {
  const alignment =
    align === 'center'
      ? 'mx-auto text-center items-center'
      : 'text-left items-start'

  return (
    <div className={`flex max-w-3xl flex-col ${alignment}`}>
      {eyebrow && (
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)] sm:text-xs sm:tracking-[0.28em]">
          {eyebrow}
        </p>
      )}
      <h2 className="mt-3 max-w-[16ch] text-2xl font-extrabold tracking-tight text-[var(--color-text-main)] sm:text-3xl lg:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 max-w-[62ch] text-sm leading-7 text-[var(--color-text-muted)] sm:text-base">
          {description}
        </p>
      )}
    </div>
  )
}
