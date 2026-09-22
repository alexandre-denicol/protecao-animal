import { expect, test, type Page } from '@playwright/test'

// Somente leitura: abre e cancela o formulário, mas NUNCA o envia, então não
// grava nada e não exige E2E_ALLOW_MUTATION. Usa o primeiro animal do catálogo
// e se pula quando o banco não tem animais.

async function openFirstAnimal(page: Page) {
  await page.goto('/animais')
  await expect(page.getByTestId('animals-page')).toBeVisible()

  const cards = page.getByTestId('animal-card')
  test.skip((await cards.count()) === 0, 'Sem animais no catálogo para inspecionar')

  await cards.first().click()
  await expect(page.getByTestId('animal-detail-page')).toBeVisible()
}

function focusedId(page: Page) {
  return page.evaluate(() => document.activeElement?.id ?? '')
}

function focusedName(page: Page) {
  return page.evaluate(() => document.activeElement?.getAttribute('name') ?? '')
}

test('CTA "Quero adotar" fica antes da ficha e o formulário recebe o foco', async ({ page }) => {
  await openFirstAnimal(page)

  const open = page.getByTestId('adoption-open-form')
  await expect(open).toBeVisible()
  await expect(open).toHaveCount(1)

  const ctaBox = await open.boundingBox()
  const factsBox = await page.locator('dl').first().boundingBox()
  expect(ctaBox && factsBox && ctaBox.y < factsBox.y).toBeTruthy()

  await open.click()

  await expect(page.getByTestId('adoption-interest-form')).toBeVisible()
  await expect(page.getByTestId('adoption-open-form')).toHaveCount(0)
  expect(await focusedId(page)).toBe('adoption-form-title')

  await page.keyboard.press('Tab')
  expect(await focusedName(page)).toBe('nome')
})

test('cancelar o formulário devolve o foco ao botão "Quero adotar"', async ({ page }) => {
  await openFirstAnimal(page)

  await page.getByTestId('adoption-open-form').click()
  await page.getByRole('button', { name: 'Cancelar' }).click()

  await expect(page.getByTestId('adoption-open-form')).toBeVisible()
  await expect(page.getByTestId('adoption-open-form')).toBeFocused()
  await expect(page.getByTestId('adoption-success')).toHaveCount(0)
})

test.describe('mobile', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })

  test('CTA fica sempre à mão e a barra fixa abre o formulário sem cobrir campos', async ({ page }) => {
    await openFirstAnimal(page)

    const sticky = page.getByTestId('adoption-sticky-cta')
    const inline = page.getByTestId('adoption-open-form')

    // Ou o botão do painel já está na tela, ou a barra fixa aparece.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect(sticky).toBeVisible()
    await expect(inline).not.toBeInViewport()

    await sticky.getByRole('button', { name: 'Quero adotar' }).click()

    await expect(page.getByTestId('adoption-interest-form')).toBeVisible()
    await expect(sticky).toHaveCount(0)
    expect(await focusedId(page)).toBe('adoption-form-title')
  })
})
