import { statusLabel } from '@/lib/animal-format'
import type { PublicAnimalRow } from '@/lib/public-animals'

const statusClasses: Record<PublicAnimalRow['status'], string> = {
  disponivel:
    'border border-[rgba(31,111,107,0.22)] bg-[rgba(31,111,107,0.16)] text-[#99f6e4]',
  em_processo:
    'border border-[rgba(244,184,96,0.24)] bg-[rgba(244,184,96,0.12)] text-[var(--color-primary)]',
  adotado: 'border border-white/10 bg-white/10 text-[var(--color-text-muted)]',
}

export default function AnimalStatusBadge({
  status,
}: {
  status: PublicAnimalRow['status']
}) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[status]}`}>
      {statusLabel(status)}
    </span>
  )
}
