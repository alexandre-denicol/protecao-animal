import { expect, test, type Page } from '@playwright/test'
import { trackPageErrors } from '../utils/assertions'

// Somente leitura: não cria dados e não exige E2E_ALLOW_MUTATION.
// Os testes não presumem quais animais existem no banco.

function speciesChip(page: Page, name: string) {
  return page.getByRole('group', { name: 'Espécie' }).getByRole('link', { name, exact: true })
}

function statusChip(page: Page, name: string) {
  return page.getByRole('group', { name: 'Status' }).getByRole('link', { name, exact: true })
}

test('catálogo expõe busca e filtros com rótulos acessíveis', async ({ page }) => {
  await page.goto('/animais')

  await expect(page.getByLabel('Buscar por nome ou raça')).toBeVisible()
  await expect(speciesChip(page, 'Todos')).toHaveAttribute('aria-current', 'true')
  await expect(statusChip(page, 'Todos')).toHaveAttribute('aria-current', 'true')
})

test('filtro de espécie vive na URL e sobrevive a reload e ao botão Voltar', async ({ page }) => {
  const assertNoErrors = trackPageErrors(page)

  await page.goto('/animais')
  await speciesChip(page, 'Gatos').click()

  await expect(page).toHaveURL(/\/animais\?especie=gato$/)
  await expect(speciesChip(page, 'Gatos')).toHaveAttribute('aria-current', 'true')

  await page.reload()
  await expect(speciesChip(page, 'Gatos')).toHaveAttribute('aria-current', 'true')

  await statusChip(page, 'Em processo').click()
  await expect(page).toHaveURL(/especie=gato/)
  await expect(page).toHaveURL(/status=em_processo/)

  await page.goBack()
  await expect(page).toHaveURL(/\/animais\?especie=gato$/)
  await expect(statusChip(page, 'Todos')).toHaveAttribute('aria-current', 'true')

  await page.goBack()
  await expect(page).toHaveURL(/\/animais$/)
  await expect(speciesChip(page, 'Todos')).toHaveAttribute('aria-current', 'true')

  await assertNoErrors()
})

test('busca sem correspondência mostra estado próprio e permite limpar', async ({ page }) => {
  await page.goto('/animais')

  await page.getByLabel('Buscar por nome ou raça').fill('zzz-sem-resultado-e2e')
  await page.getByRole('button', { name: 'Buscar' }).click()

  await expect(page).toHaveURL(/busca=zzz-sem-resultado-e2e/)
  await expect(
    page.getByTestId('animals-no-results').or(page.getByTestId('animals-empty-state')),
  ).toBeVisible()
  await expect(page.getByTestId('animals-grid')).toHaveCount(0)

  await page.getByRole('link', { name: 'Limpar filtros', exact: true }).click()

  await expect(page).toHaveURL(/\/animais$/)
  await expect(page.getByLabel('Buscar por nome ou raça')).toHaveValue('')
})

test('filtro de espécie "Outros" vive na URL e não derruba a página', async ({ page }) => {
  const assertNoErrors = trackPageErrors(page)

  await page.goto('/animais')
  await speciesChip(page, 'Outros').click()

  await expect(page).toHaveURL(/\/animais\?especie=outro$/)
  await expect(speciesChip(page, 'Outros')).toHaveAttribute('aria-current', 'true')

  await assertNoErrors()
})

test('parâmetros inválidos na URL são ignorados', async ({ page }) => {
  const response = await page.goto('/animais?especie=xyz&status=abc&pagina=nan')

  expect(response?.ok()).toBeTruthy()
  await expect(speciesChip(page, 'Todos')).toHaveAttribute('aria-current', 'true')
  await expect(statusChip(page, 'Todos')).toHaveAttribute('aria-current', 'true')
})

test('página fora do intervalo é ajustada sem erro', async ({ page }) => {
  const response = await page.goto('/animais?pagina=9999')

  expect(response?.ok()).toBeTruthy()
  await expect(page.getByTestId('animals-page')).toBeVisible()
})

test('cards mostram dados reais do animal e não a frase genérica', async ({ page }) => {
  await page.goto('/animais')

  const cards = page.getByTestId('animal-card')
  test.skip((await cards.count()) === 0, 'Sem animais no catálogo para inspecionar')

  const card = cards.first()
  await expect(card.locator('h2')).toBeVisible()
  await expect(card).toHaveAttribute('href', /\/animais\/[^/]+$/)
  await expect(card).toContainText(/Macho|Fêmea|Não identificado/)
  await expect(card).not.toContainText('Conheça mais sobre o temperamento')
})

test('paginação preserva filtros e leva ao topo dos resultados', async ({ page }) => {
  await page.goto('/animais')

  const pagination = page.getByRole('navigation', { name: 'Paginação dos resultados' })
  test.skip((await pagination.count()) === 0, 'Catálogo cabe em uma única página')

  await pagination.getByRole('link', { name: 'Próxima' }).click()

  await expect(page).toHaveURL(/pagina=2#resultados$/)
  await expect(
    page.getByRole('navigation', { name: 'Paginação dos resultados' }).locator('[aria-current="page"]'),
  ).toContainText('2')
})
