import { createClient } from '@/lib/supabase/server'

type PublicAnimalRow = {
  id: string
  slug: string
  nome: string
  especie: 'gato' | 'cao'
  idade_anos: number | null
  idade_meses: number | null
  status: 'disponivel' | 'em_processo' | 'adotado'
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
  raca: string | null
  sexo: 'macho' | 'femea'
  peso_kg: number | null
  vacinado: boolean
  castrado: boolean
  saudavel: boolean
  obs_saude: string | null
  temperamento: string | null
  descricao: string | null
  photos: PublicAnimalPhoto[]
}

export async function getPublicAnimals(): Promise<PublicAnimal[]> {
  const supabase = await createClient()

  const { data: animals, error: animalsError } = await supabase
    .from('animals')
    .select('id, slug, nome, especie, idade_anos, idade_meses, status, created_at')
    .neq('status', 'adotado')
    .order('created_at', { ascending: false })

  if (animalsError || !animals) {
    return []
  }

  const animalRows = animals as PublicAnimalRow[]
  const animalIds = animalRows.map((animal) => animal.id)

  if (animalIds.length === 0) {
    return []
  }

  const { data: photos } = await supabase
    .from('animal_photos')
    .select('id, animal_id, storage_path, url, is_cover, ordem')
    .in('animal_id', animalIds)
    .order('is_cover', { ascending: false })
    .order('ordem', { ascending: true })

  const photosByAnimal = new Map<string, PublicAnimalPhoto>()

  for (const photo of (photos ?? []) as PublicAnimalPhoto[]) {
    if (!photosByAnimal.has(photo.animal_id)) {
      photosByAnimal.set(photo.animal_id, photo)
    }
  }

  return animalRows.map((animal) => ({
    ...animal,
    photoUrl: photosByAnimal.get(animal.id)?.url ?? null,
  }))
}

export async function getAnimalBySlug(slug: string): Promise<PublicAnimalDetail | null> {
  const supabase = await createClient()

  const { data: animal, error: animalError } = await supabase
    .from('animals')
    .select('id, slug, nome, especie, raca, idade_anos, idade_meses, sexo, peso_kg, vacinado, castrado, saudavel, obs_saude, temperamento, descricao, status, created_at')
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
}
