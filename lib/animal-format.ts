import type { AnimalEspecie, AnimalSexo, AnimalStatus } from '@/types'

/**
 * Rótulo neutro para quando o nome é estruturalmente necessário (títulos,
 * listas, diálogos de confirmação). Nunca inventa um nome próprio.
 */
export const NOME_INDISPONIVEL = 'Animal sem nome'

export function nomeDisplay(nome: string | null): string {
  return nome?.trim() || NOME_INDISPONIVEL
}

/** Para frases como "Conhecer X" / "Quero adotar X" / "Sobre X", onde omitir soa melhor que rotular. */
export function nomeOuEsteAnimal(nome: string | null): string {
  return nome?.trim() || 'este animal'
}

/** Alt text de foto: "Foto de X" com nome, "Foto do animal" sem. */
export function fotoAlt(nome: string | null, index = 0): string {
  const alvo = nome?.trim() ? `de ${nome.trim()}` : 'do animal'
  return index === 0 ? `Foto ${alvo}` : `Foto ${index + 1} ${alvo}`
}

export function fotosAriaLabel(nome: string | null): string {
  return `Fotos ${nome?.trim() ? `de ${nome.trim()}` : 'do animal'}`
}

export function tituloParaAdocao(nome: string | null): string {
  return nome?.trim() ? `${nome.trim()} para adoção` : 'Animal para adoção'
}

export function mensagemWhatsappInteresse(nome: string | null): string {
  return nome?.trim()
    ? `Olá! Tenho interesse no animal ${nome.trim()}.`
    : 'Olá! Tenho interesse em um dos animais disponíveis para adoção.'
}

export function especieLabel(especie: AnimalEspecie, detalhe?: string | null): string {
  if (especie === 'cao') return 'Cão'
  if (especie === 'gato') return 'Gato'
  return detalhe?.trim() || 'Outro'
}

export function sexoLabel(sexo: AnimalSexo): string {
  if (sexo === 'femea') return 'Fêmea'
  if (sexo === 'macho') return 'Macho'
  return 'Não identificado'
}

export function statusLabel(status: AnimalStatus): string {
  if (status === 'em_processo') return 'Em processo'
  if (status === 'adotado') return 'Adotado'
  return 'Disponível'
}

/** "2 anos e 3 meses"; acrescenta "(aproximado)" quando a idade é uma estimativa. */
export function idadeLabel(
  anos: number | null,
  meses: number | null,
  estimada = false,
): string {
  const partes: string[] = []

  if (anos && anos > 0) {
    partes.push(`${anos} ${anos === 1 ? 'ano' : 'anos'}`)
  }

  if (meses && meses > 0) {
    partes.push(`${meses} ${meses === 1 ? 'mês' : 'meses'}`)
  }

  if (partes.length === 0) return 'Idade não informada'

  const idade = partes.join(' e ')
  return estimada ? `${idade} (aproximado)` : idade
}

/** Tri-state: nunca converte "não informado" em "Não". */
export function cuidadoLabel(value: boolean | null | undefined): 'Sim' | 'Não' | 'Não informado' {
  if (value === true) return 'Sim'
  if (value === false) return 'Não'
  return 'Não informado'
}
