export type AnimalEspecie = 'gato' | 'cao'
export type AnimalSexo = 'macho' | 'femea'
export type AnimalStatus = 'disponivel' | 'em_processo' | 'adotado'

export interface Animal {
  id: string
  slug: string
  nome: string
  created_by: string | null
  especie: AnimalEspecie
  raca: string | null
  idade_anos: number | null
  idade_meses: number | null
  sexo: AnimalSexo
  peso_kg: number | null
  vacinado: boolean
  castrado: boolean
  saudavel: boolean
  obs_saude: string | null
  temperamento: string | null
  descricao: string | null
  status: AnimalStatus
  destaque: boolean
  created_at: string
  updated_at: string
  fotos?: AnimalPhoto[]
}

export interface AnimalPhoto {
  id: string
  animal_id: string
  storage_path: string
  url: string
  is_cover: boolean
  ordem: number
  created_at: string
}

export interface AdoptionInterest {
  id: string
  animal_id: string
  nome: string
  email: string
  telefone: string | null
  mensagem: string | null
  lida: boolean
  created_at: string
  animal?: Pick<Animal, 'id' | 'nome' | 'slug'>
}

export interface ContactMessage {
  id: string
  nome: string
  email: string
  assunto: string
  mensagem: string
  lida: boolean
  created_at: string
}

export interface Adoption {
  id: string
  animal_id: string | null
  animal_nome: string
  foto_url: string | null
  storage_path: string | null
  depoimento: string | null
  adotante_nome: string | null
  data_adocao: string
  created_at: string
}

export type UserRole = 'admin' | 'editor' | 'viewer'

export interface Profile {
  id: string
  nome: string
  email: string
  role: UserRole
  ativo: boolean
}
