import { expect, type Page } from '@playwright/test'
import { assertMutationAllowed } from './mutation-guard'
import { uniqueName } from './test-data'

const pngBuffer = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
  'base64',
)

function requiredEnv(name: 'E2E_ADMIN_EMAIL' | 'E2E_ADMIN_PASSWORD'): string {
  const value = process.env[name]

  if (!value) {
    throw new Error(
      `${name} não está definido. Configure as credenciais reais do admin antes de rodar a suíte E2E.`,
    )
  }

  return value
}

export async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto('/admin/login')
  await page.getByLabel('Email').fill(requiredEnv('E2E_ADMIN_EMAIL'))
  await page.getByLabel('Senha').fill(requiredEnv('E2E_ADMIN_PASSWORD'))
  await page.getByTestId('admin-login-submit').click()

  const invalidCredentialsAlert = page
    .getByRole('alert')
    .filter({ hasText: /Email ou senha incorretos/i })

  await page.waitForLoadState('networkidle')

  if (await invalidCredentialsAlert.isVisible()) {
    throw new Error(
      'Falha no login admin E2E. Confira E2E_ADMIN_EMAIL e E2E_ADMIN_PASSWORD no ambiente de teste.',
    )
  }

  await expect(page).toHaveURL(/\/admin$/)
  await expect(page.getByTestId('admin-dashboard-page')).toBeVisible()
}

export async function createAnimalViaAdmin(
  page: Page,
  options?: {
    featured?: boolean
    namePrefix?: string
  },
): Promise<{ name: string }> {
  assertMutationAllowed('Criar animal pela interface administrativa')

  const animalName = uniqueName(options?.namePrefix ?? 'E2E Animal')

  await loginAsAdmin(page)
  await page.goto('/admin/animais')
  await page.getByTestId('admin-new-animal-link').click()

  await expect(page.getByTestId('admin-animal-form')).toBeVisible()
  await page.getByLabel(/Nome/).fill(animalName)
  await page.getByLabel(/Espécie/).selectOption('gato')
  await page.getByLabel(/Sexo/).selectOption('femea')
  await page.getByLabel(/Idade \(anos\)/).fill('1')
  await page.getByLabel(/Meses complementares/).fill('2')
  await page.getByLabel(/Peso/).fill('3.5')
  await page.getByLabel(/Temperamento/).fill('Carinhosa e tranquila')
  await page.getByLabel(/Descrição completa/).fill('Animal criado pela interface para a suíte E2E.')

  if (options?.featured) {
    await page.getByLabel(/Destaque na página inicial/).check()
  }

  await page.getByLabel('Adicionar fotos').setInputFiles({
    name: 'animal.png',
    mimeType: 'image/png',
    buffer: pngBuffer,
  })

  await page.getByTestId('admin-animal-submit').click()

  await expect(page).toHaveURL(/\/admin\/animais$/)
  await expect(page.getByText(animalName)).toBeVisible()

  return { name: animalName }
}
