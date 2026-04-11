export type PhoneCountry = 'BR' | 'US' | 'AR' | 'UY' | 'PY' | 'PT'

export const PHONE_COUNTRIES: Array<{
  code: PhoneCountry
  label: string
  dialCode: string
  placeholder: string
}> = [
  {
    code: 'BR',
    label: 'Brasil (+55)',
    dialCode: '55',
    placeholder: '(51) 99999-9999',
  },
  {
    code: 'US',
    label: 'Estados Unidos (+1)',
    dialCode: '1',
    placeholder: '(555) 123-4567',
  },
  {
    code: 'AR',
    label: 'Argentina (+54)',
    dialCode: '54',
    placeholder: '11 2345-6789',
  },
  {
    code: 'UY',
    label: 'Uruguai (+598)',
    dialCode: '598',
    placeholder: '94 123 456',
  },
  {
    code: 'PY',
    label: 'Paraguai (+595)',
    dialCode: '595',
    placeholder: '981 234 567',
  },
  {
    code: 'PT',
    label: 'Portugal (+351)',
    dialCode: '351',
    placeholder: '912 345 678',
  },
]

function onlyDigits(value: string): string {
  return value.replace(/\D/g, '')
}

function getPhoneCountry(country: string): (typeof PHONE_COUNTRIES)[number] | null {
  return PHONE_COUNTRIES.find((item) => item.code === country) ?? null
}

function nationalDigits(input: string, country: PhoneCountry): string {
  const config = getPhoneCountry(country)
  const digits = onlyDigits(input)

  if (!config) return digits

  if (digits.startsWith(config.dialCode)) {
    return digits.slice(config.dialCode.length)
  }

  return digits
}

export function formatPhoneInput(value: string, country: PhoneCountry): string {
  const digits = nationalDigits(value, country)

  if (country === 'BR') {
    const trimmed = digits.slice(0, 11)

    if (trimmed.length <= 2) return trimmed
    if (trimmed.length <= 6) return `(${trimmed.slice(0, 2)}) ${trimmed.slice(2)}`
    if (trimmed.length <= 10) {
      return `(${trimmed.slice(0, 2)}) ${trimmed.slice(2, 6)}-${trimmed.slice(6)}`
    }

    return `(${trimmed.slice(0, 2)}) ${trimmed.slice(2, 7)}-${trimmed.slice(7)}`
  }

  return digits.slice(0, 14)
}

export function normalizePhoneNumber(
  input: string,
  country: PhoneCountry
): string | null {
  const config = getPhoneCountry(country)

  if (!config) return null

  const digits = nationalDigits(input, country)

  if (country === 'BR') {
    if (digits.length < 10 || digits.length > 11) {
      return null
    }
  } else if (digits.length < 6 || digits.length > 14) {
    return null
  }

  return `${config.dialCode}${digits}`
}

export function validatePhoneNumber(
  input: string,
  country: PhoneCountry,
  options?: { required?: boolean; label?: string }
): string | null {
  const required = options?.required ?? true
  const label = options?.label ?? 'telefone'
  const trimmed = input.trim()

  if (!trimmed) {
    return required ? `Informe ${label} válido.` : null
  }

  const normalized = normalizePhoneNumber(trimmed, country)

  if (!normalized) {
    return country === 'BR'
      ? `Informe ${label} com DDD.`
      : `Informe ${label} com código local válido.`
  }

  return null
}

export function formatPhoneForDisplay(phone: string | null | undefined): string {
  if (!phone) return 'Não informado'

  let digits = onlyDigits(phone)

  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
    digits = digits.slice(2)

    if (digits.length === 11) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
    }

    if (digits.length === 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
    }
  }

  if (digits.length === 10 || digits.length === 11) {
    return formatPhoneForDisplay(`55${digits}`)
  }

  if (digits.length >= 8) {
    return `+${digits}`
  }

  return phone
}

export function buildWhatsAppUrl(phone: string, message: string): string | null {
  let digitsOnly = onlyDigits(phone)

  if (digitsOnly.length === 10 || digitsOnly.length === 11) {
    digitsOnly = `55${digitsOnly}`
  }

  if (digitsOnly.length < 8) {
    return null
  }

  const encodedMessage = encodeURIComponent(message.trim())

  return `https://wa.me/${digitsOnly}?text=${encodedMessage}`
}
