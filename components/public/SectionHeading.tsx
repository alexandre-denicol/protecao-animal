export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  id,
}: {
  eyebrow?: string
  title: string
  description?: string
  align?: 'left' | 'center'
  id?: string
}) {
  const alignment =
    align === 'center'
      ? 'mx-auto text-center items-center'
      : 'text-left items-start'

  return (
    <div className={`flex max-w-2xl flex-col ${alignment}`}>
      {eyebrow && (
        <p className="text-sm font-semibold text-[var(--color-primary)]">{eyebrow}</p>
      )}
      <h2
        id={id}
        className="mt-1.5 text-balance font-display text-2xl font-bold leading-tight tracking-[-0.01em] text-[var(--color-text-main)] sm:text-3xl"
      >
        {title}
      </h2>
      {description && (
        <p className="mt-3 max-w-[60ch] text-base leading-7 text-[var(--color-text-soft)]">
          {description}
        </p>
      )}
    </div>
  )
}
