'use client'

import { useState } from 'react'
import Image from 'next/image'
import { fotoAlt, fotosAriaLabel } from '@/lib/animal-format'

export interface GalleryPhoto {
  id: string
  url: string
}

interface AnimalGalleryProps {
  photos: GalleryPhoto[]
  /** Pode ser null: o animal pode ainda não ter nome. */
  animalNome: string | null
  className?: string
}

function NoPhoto({ className }: { className?: string }) {
  return (
    <div
      className={`flex aspect-[2/1] flex-col items-center justify-center gap-2 rounded-2xl bg-[var(--color-surface-2)] text-[var(--color-text-muted)] ${className ?? ''}`}
    >
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
        <path d="M3 15L8 10L12 14L16 10L21 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="text-sm font-semibold">Sem foto</span>
    </div>
  )
}

/**
 * Foto principal com miniaturas que a trocam. Só exibe as fotos enviadas pela
 * equipe: sem fotos, mostra um painel neutro (nunca uma imagem de reposição).
 */
export default function AnimalGallery({ photos, animalNome, className }: AnimalGalleryProps) {
  const [selected, setSelected] = useState(0)
  const [announcement, setAnnouncement] = useState('')
  const current = photos[selected]

  if (!current) return <NoPhoto className={className} />

  function select(index: number) {
    setSelected(index)
    setAnnouncement(`Foto ${index + 1} de ${photos.length}`)
  }

  return (
    <div className={className}>
      <div className="relative aspect-[3/2] overflow-hidden rounded-2xl bg-[var(--color-surface-2)] ring-1 ring-white/10 sm:aspect-[16/10] lg:aspect-[5/4]">
        <Image
          key={current.id}
          src={current.url}
          alt={fotoAlt(animalNome, selected)}
          fill
          priority={selected === 0}
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 55vw"
        />
      </div>

      {photos.length > 1 && (
        <>
          <ul aria-label={fotosAriaLabel(animalNome)} className="mt-2.5 flex flex-wrap gap-2 sm:mt-3">
            {photos.map((photo, index) => (
              <li key={photo.id}>
                <button
                  type="button"
                  onClick={() => select(index)}
                  aria-pressed={index === selected}
                  aria-label={`Ver foto ${index + 1} de ${photos.length}`}
                  className={`relative block h-12 w-12 overflow-hidden rounded-lg bg-[var(--color-surface-2)] transition sm:h-20 sm:w-20 ${
                    index === selected
                      ? 'ring-2 ring-[var(--color-primary)]'
                      : 'opacity-70 ring-1 ring-white/15 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={photo.url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              </li>
            ))}
          </ul>
          <p role="status" className="sr-only">
            {announcement}
          </p>
        </>
      )}
    </div>
  )
}
