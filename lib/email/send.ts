import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL!
const FROM_EMAIL = 'Associação Amiga Miau <onboarding@resend.dev>'

interface AdoptionInterestEmailData {
  animalNome: string
  animalSlug: string
  interessadoNome: string
  interessadoEmail: string
  interessadoTelefone: string | null
  mensagem: string | null
}

interface ContactEmailData {
  nome: string
  email: string
  assunto: string
  mensagem: string
}

export async function enviarEmailInteresseAdocao(data: AdoptionInterestEmailData) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  await resend.emails.send({
    from: FROM_EMAIL,
    to: NOTIFICATION_EMAIL,
    subject: `Novo interesse em adotar ${data.animalNome}`,
    html: `
      <h2>Novo interesse em adoção</h2>
      <p><strong>Animal:</strong> ${data.animalNome}</p>
      <p><strong>Interessado:</strong> ${data.interessadoNome}</p>
      <p><strong>Email:</strong> ${data.interessadoEmail}</p>
      ${data.interessadoTelefone ? `<p><strong>Telefone:</strong> ${data.interessadoTelefone}</p>` : ''}
      ${data.mensagem ? `<p><strong>Mensagem:</strong> ${data.mensagem}</p>` : ''}
      <p><a href="${siteUrl}/animais/${data.animalSlug}">Ver perfil do animal</a></p>
    `,
  })
}

export async function enviarEmailContato(data: ContactEmailData) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: NOTIFICATION_EMAIL,
    subject: `Nova mensagem de contato: ${data.assunto}`,
    html: `
      <h2>Nova mensagem de contato</h2>
      <p><strong>Nome:</strong> ${data.nome}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Assunto:</strong> ${data.assunto}</p>
      <p><strong>Mensagem:</strong></p>
      <p>${data.mensagem}</p>
    `,
  })
}
