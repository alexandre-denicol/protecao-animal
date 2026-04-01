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
      className="w-full rounded-lg bg-primary-300 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-400 focus-visible:outline-2 focus-visible:outline-primary-300"
    >
      {copiado ? '✓ Chave copiada!' : 'Copiar chave PIX'}
    </button>
  )
}
