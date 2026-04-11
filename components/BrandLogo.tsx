import Image from 'next/image'

export default function BrandLogo({
  compact = false,
  className = '',
  labelClassName = '',
  imageClassName = '',
}: {
  compact?: boolean
  className?: string
  labelClassName?: string
  imageClassName?: string
}) {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`.trim()}>
      <div
        className={`relative overflow-hidden rounded-2xl border border-white/10 bg-black/20 shadow-[0_14px_32px_rgba(0,0,0,0.45)] ${
          compact ? 'h-10 w-10 p-1.5' : 'h-14 w-14 p-2'
        } ${imageClassName}`.trim()}
      >
        <Image
          src="/amiga-miau-logo.jpeg"
          alt="Logo oficial da Associação Amiga MiAu"
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className={labelClassName}>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
          Associação
        </p>
        <p className="text-lg font-extrabold tracking-tight text-[var(--color-text-main)]">
          Amiga MiAu
        </p>
      </div>
    </div>
  )
}
