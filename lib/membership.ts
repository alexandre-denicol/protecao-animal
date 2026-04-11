import {
  buildWhatsAppUrl,
  formatPhoneForDisplay,
} from '@/lib/whatsapp'

export type MemberStatus =
  | 'pendente'
  | 'contatado'
  | 'ativo'
  | 'inadimplente'
  | 'cancelado'

export const UF_OPTIONS = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
] as const

export type BrazilianState = (typeof UF_OPTIONS)[number]

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '')
}

export function isBrazilianState(value: string): value is BrazilianState {
  return (UF_OPTIONS as readonly string[]).includes(value)
}

export function maskCpf(cpf: string): string {
  const digits = onlyDigits(cpf)

  if (digits.length < 2) {
    return '***.***.***-**'
  }

  return `***.***.***-${digits.slice(-2)}`
}

export function formatPhoneBR(phone: string): string {
  return formatPhoneForDisplay(phone)
}

export function buildMemberWhatsAppUrl(
  phone: string,
  message: string
): string | null {
  return buildWhatsAppUrl(phone, message)
}

export function isValidEmailAddress(email: string | null): email is string {
  if (!email) return false

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export function fillMembershipTemplate(
  template: string,
  data: { nome: string; valor?: string; vencimento?: string }
): string {
  return template
    .replaceAll('{nome}', data.nome)
    .replaceAll('{valor}', data.valor ?? '')
    .replaceAll('{vencimento}', data.vencimento ?? '')
}

export function formatCurrencyBR(value: number | null): string {
  if (value === null) return 'Não definido'

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDateBR(date: string | null | undefined): string {
  if (!date) return '-'

  const trimmed = date.trim()

  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return '-'
  }

  const [year, month, day] = trimmed.split('-')

  return `${day}/${month}/${year}`
}

export function formatCompetenciaMes(date: string | null | undefined): string {
  if (!date) return '-'

  const parsed = new Date(`${date}T00:00:00`)

  if (Number.isNaN(parsed.getTime())) return '-'

  return parsed.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  })
}

export function formatPaymentMethod(method: string | null | undefined): string {
  if (!method) return '-'

  const normalized = method.trim().toLowerCase()
  const labels: Record<string, string> = {
    pix: 'Pix',
    dinheiro: 'Dinheiro',
    transferencia: 'Transferência',
    outro: 'Outro',
  }

  return labels[normalized] ?? method
}

export function formatContactDateBR(value: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function contactChannelLabel(channel: 'email' | 'whatsapp'): string {
  return channel === 'email' ? 'Email' : 'WhatsApp'
}

export function contactTypeLabel(
  type: 'triagem' | 'boas_vindas' | 'cobranca' | 'manual'
): string {
  const labels = {
    triagem: 'Triagem',
    boas_vindas: 'Boas-vindas',
    cobranca: 'Cobrança',
    manual: 'Manual',
  }

  return labels[type]
}
