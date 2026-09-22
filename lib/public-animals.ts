import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { AnimalEspecie, AnimalSexo, AnimalStatus } from '@/types'

const CARD_COLUMNS =
  'id, slug, nome, especie, especie_detalhe, raca, sexo, idade_anos, idade_meses, idade_estimada, temperamento, vacinado, castrado, status, created_at'

export type PublicAnimalRow = {
  id: string
  slug: string
  nome: string | null
  especie: AnimalEspecie
  especie_detalhe: string | null
  raca: string | null
  sexo: AnimalSexo
  idade_anos: number | null
  idade_meses: number | null
  idade_estimada: boolean
  temperamento: string | null
  /** Tri-state: true = Sim, false = Não, null = não informado. */
  vacinado: boolean | null
  /** Tri-state: true = Sim, false = Não, null = não informado. */
  castrado: boolean | null
  status: AnimalStatus
  created_at: string
}

export type PublicAnimalPhoto = {
  id: string
  animal_id: string
  storage_path: string
  url: string
  is_cover: boolean
  ordem: number
}

export type PublicAnimal = PublicAnimalRow & {
  photoUrl: string | null
}

export type PublicAnimalDetail = PublicAnimalRow & {
  peso_kg: number | null
  descricao: string | null
  photos: PublicAnimalPhoto[]
}

export type PublicAnimalRowsResult = {
  rows: PublicAnimalRow[]
  failed: boolean
}

export async function withCoverPhotos(
  animals: PublicAnimalRow[],
): Promise<PublicAnimal[]> {
  if (animals.length === 0) {
    return []
  }

  const supabase = await createClient()
  const animalIds = animals.map((animal) => animal.id)

  const { data: photos, error } = await supabase
    .from('animal_photos')
    .select('id, animal_id, storage_path, url, is_cover, ordem')
    .in('animal_id', animalIds)
    .order('is_cover', { ascending: false })
    .order('ordem', { ascending: true })

  if (error) {
    console.error('[PUBLIC ANIMAL PHOTOS ERROR]', error)
  }

  const photosByAnimal = new Map<string, PublicAnimalPhoto>()

  for (const photo of (photos ?? []) as PublicAnimalPhoto[]) {
    if (!photosByAnimal.has(photo.animal_id)) {
      photosByAnimal.set(photo.animal_id, photo)
    }
  }

  return animals.map((animal) => ({
    ...animal,
    photoUrl: photosByAnimal.get(animal.id)?.url ?? null,
  }))
}

/**
 * Animais visíveis no catálogo (todos os não adotados), sem fotos.
 * Distingue "não há animais" de "a consulta falhou" e é memoizada por
 * requisição, para que estatísticas e resultados compartilhem uma só consulta.
 */
export const getPublicAnimalRows = cache(
  async (): Promise<PublicAnimalRowsResult> => {
    try {
      const supabase = await createClient()

      const { data: animals, error } = await supabase
        .from('animals')
        .select(CARD_COLUMNS)
        .neq('status', 'adotado')
        .order('created_at', { ascending: false })
        .order('id', { ascending: true })

      if (error || !animals) {
        if (error) console.error('[PUBLIC ANIMALS ERROR]', error)
        return { rows: [], failed: true }
      }

      return { rows: animals as PublicAnimalRow[], failed: false }
    } catch (error) {
      console.error('[PUBLIC ANIMALS ERROR]', error)
      return { rows: [], failed: true }
    }
  },
)

export async function getFeaturedPublicAnimals(limit = 6): Promise<PublicAnimal[]> {
  const supabase = await createClient()

  const { data: animals, error } = await supabase
    .from('animals')
    .select(CARD_COLUMNS)
    .neq('status', 'adotado')
    .eq('destaque', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error || !animals) {
    if (error) console.error('[FEATURED PUBLIC ANIMALS ERROR]', error)
    return []
  }

  return withCoverPhotos(animals as PublicAnimalRow[])
}

export const getAnimalBySlug = cache(async (slug: string): Promise<PublicAnimalDetail | null> => {
  const supabase = await createClient()

  const { data: animal, error: animalError } = await supabase
    .from('animals')
    .select('id, slug, nome, especie, especie_detalhe, raca, idade_anos, idade_meses, idade_estimada, sexo, peso_kg, vacinado, castrado, temperamento, descricao, status, created_at')
    .eq('slug', slug)
    .neq('status', 'adotado')
    .maybeSingle()

  if (animalError || !animal) {
    return null
  }

  const animalRow = animal as Omit<PublicAnimalDetail, 'photos'>

  const { data: photos } = await supabase
    .from('animal_photos')
    .select('id, animal_id, storage_path, url, is_cover, ordem')
    .eq('animal_id', animalRow.id)
    .order('is_cover', { ascending: false })
    .order('ordem', { ascending: true })

  return {
    ...animalRow,
    photos: (photos ?? []) as PublicAnimalPhoto[],
  }
})
