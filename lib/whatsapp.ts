export function buildWhatsAppUrl(phone: string, message: string): string | null {
  const digitsOnly = phone.replace(/\D/g, '')

  if (digitsOnly.length < 8) {
    return null
  }

  const encodedMessage = encodeURIComponent(message.trim())

  return `https://wa.me/${digitsOnly}?text=${encodedMessage}`
}
