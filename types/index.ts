export type AnimalEspecie = 'gato' | 'cao' | 'outro'
export type AnimalSexo = 'macho' | 'femea' | 'nao_identificado'
export type AnimalStatus = 'disponivel' | 'em_processo' | 'adotado'

export interface Animal {
  id: string
  slug: string
  /** Opcional: um animal recém-resgatado pode ainda não ter nome. */
  nome: string | null
  created_by: string | null
  especie: AnimalEspecie
  /** Preenchido só quando especie = 'outro'; a aplicação normaliza para null caso contrário. */
  especie_detalhe: string | null
  raca: string | null
  idade_anos: number | null
  idade_meses: number | null
  /** Indica que a idade informada é aproximada, não exata. */
  idade_estimada: boolean
  sexo: AnimalSexo
  peso_kg: number | null
  /** Tri-state: true = Sim, false = Não, null = não informado. */
  vacinado: boolean | null
  /** Tri-state: true = Sim, false = Não, null = não informado. */
  castrado: boolean | null
  /**
   * @deprecated Coluna preservada por compatibilidade com dados existentes.
   * Não lida nem gravada pela aplicação desde a refinação do cadastro de animais.
   */
  saudavel: boolean
  /** @deprecated Ver `saudavel`. */
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

export interface MembershipInterest {
  id: string
  nome: string
  email: string
  endereco: string
  cidade: string
  estado: string
  cpf: string
  whatsapp: string
  mensagem: string | null
  lida: boolean
  created_at: string
  members?: Pick<Member, 'id' | 'status'>[]
}

export type MemberStatus =
  | 'pendente'
  | 'contatado'
  | 'ativo'
  | 'inadimplente'
  | 'cancelado'

export interface Member {
  id: string
  interest_id: string | null
  nome: string
  email: string | null
  endereco: string
  cidade: string
  estado: string
  cpf: string
  whatsapp: string
  observacoes: string | null
  status: MemberStatus
  valor_mensal: number | null
  data_inicio: string
  ultimo_pagamento_em: string | null
  proximo_vencimento_em: string | null
  created_at: string
  updated_at: string
  payments?: MemberPayment[]
}

export interface MemberPayment {
  id: string
  member_id: string
  valor: number
  metodo: string
  pago_em: string
  competencia_mes: string
  observacoes: string | null
  created_at: string
  member?: Pick<Member, 'id' | 'nome' | 'whatsapp' | 'status'>
}

export type MemberContactChannel = 'email' | 'whatsapp'
export type MemberContactType =
  | 'triagem'
  | 'boas_vindas'
  | 'cobranca'
  | 'manual'

export interface MemberContactHistory {
  id: string
  membership_interest_id: string | null
  member_id: string | null
  canal: MemberContactChannel
  tipo: MemberContactType
  destinatario: string
  assunto: string | null
  mensagem: string
  enviado_por: string | null
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
