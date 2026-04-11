import 'server-only'

import { Resend } from 'resend'

let resendClient: Resend | null = null

function getRequiredResendApiKey(): string {
  const apiKey = process.env.RESEND_API_KEY?.trim()

  if (!apiKey) {
    throw new Error('RESEND_API_KEY não configurado.')
  }

  return apiKey
}

export function getResendClient(): Resend {
  if (!resendClient) {
    resendClient = new Resend(getRequiredResendApiKey())
  }

  return resendClient
}
