'use client'

import { useState } from 'react'

interface PixCopyButtonProps {
  chavePix: string
}

export function PixCopyButton({ chavePix }: PixCopyButtonProps) {
  const [copiado, setCopiado] = useState(false)

  async function copiarChave() {
    await navigator.clipboard.writeText(chavePix)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2500)
  }

  return (
    <button
      onClick={copiarChave}
      className="w-full rounded-[var(--radius-button)] bg-[var(--color-primary)] px-3 py-2.5 text-xs font-semibold text-neutral-950 transition duration-200 hover:bg-[var(--color-primary-hover)] focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]"
    >
      {copiado ? '✓ Chave copiada!' : 'Copiar chave PIX'}
    </button>
  )
}
