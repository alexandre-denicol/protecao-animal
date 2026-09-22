'use server'

import { randomUUID } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireRole, getUserProfile } from '@/lib/auth/roles'
import { createClient } from '@/lib/supabase/server'
import type { AnimalEspecie, AnimalSexo, AnimalStatus } from '@/types'
import { isRedirectError } from 'next/dist/client/components/redirect'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PhotoInput {
  dbId?: string
  storageUrl: string
  storagePath: string
  isCover: boolean
  ordem: number
}

export interface AnimalFormInput {
  /** Opcional: null quando o animal ainda não tem nome. */
  nome: string | null
  especie: AnimalEspecie
  /** Obrigatório (não vazio) quando especie = 'outro'; ignorado/normalizado para null nos demais casos. */
  especie_detalhe: string | null
  raca: string | null
  idade_anos: number | null
  idade_meses: number | null
  idade_estimada: boolean
  sexo: AnimalSexo
  peso_kg: number | null
  /** Tri-state: true = Sim, false = Não, null = não informado. */
  vacinado: boolean | null
  /** Tri-state: true = Sim, false = Não, null = não informado. */
  castrado: boolean | null
  temperamento: string | null
  descricao: string | null
  status: AnimalStatus
  destaque: boolean
  photos: PhotoInput[]
  /** IDs das fotos originais, para detectar deleções no modo edição */
  originalPhotoIds: string[]
}

export interface AnimalFormState {
  error?: string
  fieldErrors?: Partial<Record<string, string>>
}

// ─── Slug ────────────────────────────────────────────────────────────────────
//
// O slug é gerado UMA ÚNICA VEZ, na criação, e nunca recalculado em edições —
// nem quando o nome muda, nem quando um animal sem nome recebe um nome depois.
// Isso mantém a URL pública estável ao longo da vida do registro.

function toSlugBase(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Fragmento curto, aleatório e com entropia suficiente para evitar colisão. */
function randomSlugFragment(): string {
  return randomUUID().replace(/-/g, '').slice(0, 8)
}

/**
 * Gera um slug único para um animal recém-criado.
 * - Com nome: usa a base legível derivada do nome (estratégia existente),
 *   com sufixo numérico em caso de colisão.
 * - Sem nome: usa `animal-<fragmento>` (nunca uma contagem sequencial, nunca
 *   um nome inventado), gerando um novo fragmento em caso de colisão.
 */
async function generateUniqueSlug(
  nome: string | null,
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<string> {
  const nomeBase = nome?.trim() ? toSlugBase(nome.trim()) : ''

  if (nomeBase) {
    let slug = nomeBase
    let attempt = 0

    for (;;) {
      const { data } = await supabase.from('animals').select('id').eq('slug', slug).maybeSingle()
      if (!data) return slug
      attempt++
      slug = `${nomeBase}-${attempt}`
    }
  }

  for (;;) {
    const slug = `animal-${randomSlugFragment()}`
    const { data } = await supabase.from('animals').select('id').eq('slug', slug).maybeSingle()
    if (!data) return slug
  }
}

// ─── Validação ────────────────────────────────────────────────────────────────

const ESPECIES_VALIDAS: AnimalEspecie[] = ['gato', 'cao', 'outro']
const SEXOS_VALIDOS: AnimalSexo[] = ['macho', 'femea', 'nao_identificado']
const STATUS_VALIDOS: AnimalStatus[] = ['disponivel', 'em_processo', 'adotado']

function validar(input: AnimalFormInput): Partial<Record<string, string>> {
  const erros: Partial<Record<string, string>> = {}

  if (input.nome !== null && input.nome.trim().length > 100) {
    erros.nome = 'Nome deve ter no máximo 100 caracteres.'
  }
  if (!ESPECIES_VALIDAS.includes(input.especie)) {
    erros.especie = 'Selecione uma espécie válida.'
  }
  if (input.especie === 'outro') {
    const detalhe = input.especie_detalhe?.trim() ?? ''
    if (!detalhe) {
      erros.especie_detalhe = 'Informe a espécie do animal.'
    } else if (detalhe.length > 60) {
      erros.especie_detalhe = 'Espécie deve ter no máximo 60 caracteres.'
    }
  }
  if (!SEXOS_VALIDOS.includes(input.sexo)) {
    erros.sexo = 'Selecione o sexo.'
  }
  if (!STATUS_VALIDOS.includes(input.status)) {
    erros.status = 'Selecione um status válido.'
  }
  if (input.idade_anos !== null && (input.idade_anos < 0 || input.idade_anos > 30)) {
    erros.idade_anos = 'Idade em anos deve ser entre 0 e 30.'
  }
  if (input.idade_meses !== null && (input.idade_meses < 0 || input.idade_meses > 11)) {
    erros.idade_meses = 'Meses deve ser entre 0 e 11.'
  }
  if (input.peso_kg !== null && input.peso_kg <= 0) {
    erros.peso_kg = 'Peso deve ser maior que zero.'
  }
  if (input.photos.length === 0) {
    erros.photos = 'Adicione pelo menos uma foto.'
  } else if (!input.photos.some((p) => p.isCover)) {
    erros.photos = 'Marque uma foto como capa.'
  }

  return erros
}

/** Monta o payload de colunas comuns a criar/atualizar (nunca inclui slug nem saúde/saudável — ver actions abaixo). */
function buildAnimalPayload(input: AnimalFormInput) {
  return {
    nome: input.nome?.trim() || null,
    especie: input.especie,
    especie_detalhe: input.especie === 'outro' ? input.especie_detalhe?.trim() || null : null,
    raca: input.raca || null,
    idade_anos: input.idade_anos,
    idade_meses: input.idade_meses,
    idade_estimada: input.idade_estimada,
    sexo: input.sexo,
    peso_kg: input.peso_kg,
    vacinado: input.vacinado,
    castrado: input.castrado,
    temperamento: input.temperamento || null,
    descricao: input.descricao || null,
    status: input.status,
    destaque: input.destaque,
  }
}

// ─── Criar Animal ─────────────────────────────────────────────────────────────

export async function criarAnimalAction(
  input: AnimalFormInput
): Promise<AnimalFormState> {
  try {
    await requireRole(['admin', 'editor'])
  } catch {
    return { error: 'Acesso negado.' }
  }

  const fieldErrors = validar(input)
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors }

  const profile = await getUserProfile()
  if (!profile) return { error: 'Acesso negado.' }

  const supabase = await createClient()
  const slug = await generateUniqueSlug(input.nome, supabase)

  const { data: animal, error: insertError } = await supabase
    .from('animals')
    .insert({
      slug,
      ...buildAnimalPayload(input),
      created_by: profile.id,
    })
    .select('id')
    .single()

  if (insertError || !animal) {
    console.error('[CRIAR ANIMAL ERROR]', insertError)
    return { error: 'Não foi possível salvar o animal. Tente novamente.' }
  }

  if (input.photos.length > 0) {
    const photosData = input.photos.map((p, i) => ({
      animal_id: (animal as { id: string }).id,
      storage_path: p.storagePath,
      url: p.storageUrl,
      is_cover: p.isCover,
      ordem: i,
    }))

    const { error: photosError } = await supabase
      .from('animal_photos')
      .insert(photosData)

    if (photosError) {
      return { error: 'Animal salvo, mas houve erro ao salvar as fotos. Edite o animal para adicioná-las.' }
    }
  }

  revalidatePath('/admin/animais')
  redirect('/admin/animais')
}

// ─── Atualizar Animal ─────────────────────────────────────────────────────────

export async function atualizarAnimalAction(
  id: string,
  input: AnimalFormInput
): Promise<AnimalFormState> {
  try {
    await requireRole(['admin', 'editor'])
  } catch {
    return { error: 'Acesso negado.' }
  }

  const fieldErrors = validar(input)
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors }

  const profile = await getUserProfile()
  if (!profile) return { error: 'Acesso negado.' }

  const supabase = await createClient()

  const { data: animalAtual } = await supabase
    .from('animals')
    .select('created_by, slug')
    .eq('id', id)
    .single()

  if (!animalAtual) {
    return { error: 'Animal não encontrado.' }
  }

  const { created_by: donoAtual, slug: slugAtual } = animalAtual as {
    created_by: string | null
    slug: string
  }

  // Editor só pode editar os próprios animais
  if (profile.role === 'editor' && donoAtual !== profile.id) {
    return { error: 'Você não tem permissão para editar este animal.' }
  }

  // Slug nunca é recalculado aqui — a URL pública permanece estável.
  const { error: updateError } = await supabase
    .from('animals')
    .update(buildAnimalPayload(input))
    .eq('id', id)

  if (updateError) {
    return { error: 'Não foi possível atualizar o animal. Tente novamente.' }
  }

  // Fotos: detectar adições, atualizações e deleções
  const currentPhotoIds = new Set(input.photos.map((p) => p.dbId).filter(Boolean))
  const deletedIds = input.originalPhotoIds.filter((oid) => !currentPhotoIds.has(oid))

  if (deletedIds.length > 0) {
    const { data: deletedPhotos } = await supabase
      .from('animal_photos')
      .select('storage_path')
      .in('id', deletedIds)

    const paths = ((deletedPhotos ?? []) as { storage_path: string }[]).map(
      (p) => p.storage_path
    )
    if (paths.length > 0) {
      await supabase.storage.from('animal-photos').remove(paths)
    }

    await supabase.from('animal_photos').delete().in('id', deletedIds)
  }

  for (let i = 0; i < input.photos.length; i++) {
    const p = input.photos[i]

    if (p.dbId) {
      // Atualizar foto existente (cover e ordem podem mudar)
      await supabase
        .from('animal_photos')
        .update({ is_cover: p.isCover, ordem: i })
        .eq('id', p.dbId)
    } else {
      // Inserir nova foto
      await supabase.from('animal_photos').insert({
        animal_id: id,
        storage_path: p.storagePath,
        url: p.storageUrl,
        is_cover: p.isCover,
        ordem: i,
      })
    }
  }

  revalidatePath('/admin/animais')
  revalidatePath(`/animais/${slugAtual}`)
  redirect('/admin/animais')
}

// ─── Excluir Animal ───────────────────────────────────────────────────────────

export async function excluirAnimalAction(id: string): Promise<{ error?: string }> {
  try {
    await requireRole(['admin', 'editor'])
  } catch {
    return { error: 'Acesso negado.' }
  }

  const profile = await getUserProfile()
  if (!profile) return { error: 'Acesso negado.' }

  const supabase = await createClient()

  // Editor só pode excluir os próprios animais
  if (profile.role === 'editor') {
    const { data: animalAtual } = await supabase
      .from('animals')
      .select('created_by')
      .eq('id', id)
      .single()

    if (!animalAtual || (animalAtual as { created_by: string }).created_by !== profile.id) {
      return { error: 'Você não tem permissão para excluir este animal.' }
    }
  }

  // Limpar fotos do storage antes de deletar
  const { data: fotos } = await supabase
    .from('animal_photos')
    .select('storage_path')
    .eq('animal_id', id)

  if (fotos && fotos.length > 0) {
    const paths = (fotos as { storage_path: string }[]).map((f) => f.storage_path)
    await supabase.storage.from('animal-photos').remove(paths)
  }

  const { error } = await supabase.from('animals').delete().eq('id', id)
  if (error) return { error: 'Não foi possível excluir o animal.' }

  revalidatePath('/admin/animais')
  return {}
}

// ─── Alterar Status ───────────────────────────────────────────────────────────

export async function alterarStatusAction(
  id: string,
  novoStatus: AnimalStatus
): Promise<{ error?: string }> {
  try {
    await requireRole(['admin', 'editor'])
  } catch {
    return { error: 'Acesso negado.' }
  }

  if (!STATUS_VALIDOS.includes(novoStatus)) {
    return { error: 'Status inválido.' }
  }

  const profile = await getUserProfile()
  if (!profile) return { error: 'Acesso negado.' }

  const supabase = await createClient()

  // Editor só pode alterar status dos próprios animais
  if (profile.role === 'editor') {
    const { data: animalAtual } = await supabase
      .from('animals')
      .select('created_by')
      .eq('id', id)
      .single()

    if (!animalAtual || (animalAtual as { created_by: string }).created_by !== profile.id) {
      return { error: 'Sem permissão para este animal.' }
    }
  }

  const { error } = await supabase
    .from('animals')
    .update({ status: novoStatus })
    .eq('id', id)

  if (error) return { error: 'Não foi possível alterar o status.' }

  revalidatePath('/admin/animais')
  return {}
}
