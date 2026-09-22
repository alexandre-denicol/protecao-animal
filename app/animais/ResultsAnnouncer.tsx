'use client'

import { useEffect } from 'react'
import {
  CATALOG_LIVE_REGION_ID,
  CATALOG_RESULTS_HEADING_ID,
  CATALOG_RESULTS_ID,
} from '@/lib/animal-catalog'

// Os resultados remontam a cada mudança de filtro/página. A primeira montagem
// (carga completa da página) não é anunciada; as seguintes (navegação) são.
let isInitialRender = true

/**
 * Anuncia o resumo dos resultados numa região viva persistente e, quando o
 * usuário chegou pela paginação (URL com #resultados), move o foco para o
 * título dos resultados, sem rolar de novo a página.
 */
export default function ResultsAnnouncer({ message }: { message: string }) {
  useEffect(() => {
    if (isInitialRender) {
      isInitialRender = false
      return
    }

    const liveRegion = document.getElementById(CATALOG_LIVE_REGION_ID)
    if (liveRegion) liveRegion.textContent = message

    if (window.location.hash === `#${CATALOG_RESULTS_ID}`) {
      document.getElementById(CATALOG_RESULTS_HEADING_ID)?.focus({ preventScroll: true })
    }
  }, [message])

  return null
}
