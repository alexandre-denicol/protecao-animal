import { Resend } from 'resend'

// NOTIFICATION_EMAIL deve conter emails separados por vírgula
// Ex: a@a.com,b@b.com
// TODO: substituir onboarding@resend.dev por domínio próprio (ex: contato@amigamiau.com)

const resend = new Resend(process.env.RESEND_API_KEY)

const notificationEmails =
  process.env.NOTIFICATION_EMAIL?.split(',')
    .map((email) => email.trim())
    .filter(Boolean) ?? []

interface AdoptionInterestEmailData {
  animalNome: string
  nome: string
  email: string
  telefone: string | null
  mensagem: string | null
}

interface ContactMessageEmailData {
  nome: string
  email: string
  assunto: string
  mensagem: string
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
    .replaceAll('\n', '<br/>')
}

function adoptionEmailTemplate(data: AdoptionInterestEmailData): string {
  const animalNome = escapeHtml(data.animalNome)
  const nome = escapeHtml(data.nome)
  const email = escapeHtml(data.email)
  const telefone = data.telefone ? escapeHtml(data.telefone) : '-'
  const mensagem = data.mensagem ? escapeHtml(data.mensagem) : '-'

  return `
  <div style="font-family: Arial, sans-serif; background:#f9fafb; padding:20px;">
    <div style="max-width:600px; margin:auto; background:white; border-radius:8px; padding:24px;">
      <h2 style="margin:0 0 16px;">🐾 Novo interesse em adoção</h2>

      <div style="background:#f3f4f6; padding:16px; border-radius:6px;">
        <p><strong>Animal:</strong> ${animalNome}</p>
        <p><strong>Nome:</strong> ${nome}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Telefone:</strong> ${telefone}</p>
        <p><strong>Mensagem:</strong><br/>${mensagem}</p>
      </div>

      <p style="margin-top:24px; font-size:12px; color:#888;">
        Sistema Amiga Miau
      </p>
    </div>
  </div>
  `
}

function contactEmailTemplate(data: ContactMessageEmailData): string {
  const nome = escapeHtml(data.nome)
  const email = escapeHtml(data.email)
  const assunto = escapeHtml(data.assunto)
  const mensagem = escapeHtml(data.mensagem)

  return `
  <div style="font-family: Arial, sans-serif; background:#f9fafb; padding:20px;">
    <div style="max-width:600px; margin:auto; background:white; border-radius:8px; padding:24px;">
      <h2 style="margin:0 0 16px;">📩 Nova mensagem de contato</h2>

      <div style="background:#f3f4f6; padding:16px; border-radius:6px;">
        <p><strong>Nome:</strong> ${nome}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Assunto:</strong> ${assunto}</p>
        <p><strong>Mensagem:</strong><br/>${mensagem}</p>
      </div>

      <p style="margin-top:24px; font-size:12px; color:#888;">
        Sistema Amiga Miau
      </p>
    </div>
  </div>
  `
}

export async function sendAdoptionInterestEmail(
  data: AdoptionInterestEmailData
): Promise<void> {
  if (notificationEmails.length === 0) {
    console.warn('NOTIFICATION_EMAIL não configurado')
    return
  }

  await resend.emails.send({
    from: 'Amiga Miau <onboarding@resend.dev>',
    to: notificationEmails,
    subject: `Novo interesse em adoção - ${data.animalNome}`,
    html: adoptionEmailTemplate(data),
  })
}

export async function sendContactMessageEmail(
  data: ContactMessageEmailData
): Promise<void> {
  if (notificationEmails.length === 0) {
    console.warn('NOTIFICATION_EMAIL não configurado')
    return
  }

  await resend.emails.send({
    from: 'Amiga Miau <onboarding@resend.dev>',
    to: notificationEmails,
    subject: `Nova mensagem - ${data.assunto}`,
    html: contactEmailTemplate(data),
  })
}
