export const e2eData = {
  admin: {
    email: process.env.E2E_ADMIN_EMAIL ?? 'e2e-admin@amigamiau.test',
    password: process.env.E2E_ADMIN_PASSWORD ?? 'E2eAdmin12345!',
  },
  animal: {
    slug: 'e2e-luna',
    nome: 'E2E Luna',
    editedNome: 'E2E Luna Editada',
  },
  createdAnimal: {
    nomePrefix: 'E2E Criado',
  },
  adoptionInterest: {
    nome: 'E2E Pessoa Interessada',
    email: 'e2e-adocao@example.com',
  },
  contactMessage: {
    nome: 'E2E Contato',
    email: 'e2e-contato@example.com',
    assunto: 'E2E Assunto de contato',
  },
}

export function uniqueSuffix(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function uniqueEmail(prefix: string): string {
  return `${prefix}-${uniqueSuffix()}@example.com`
}
