import { expect, test } from '@playwright/test'
import { e2eData } from '../utils/test-data'
import { trackPageErrors } from '../utils/assertions'

test('catálogo lista animais reais e navega para o detalhe pelo card', async ({ page }) => {
  const assertNoErrors = trackPageErrors(page)

  await page.goto('/animais')

  await expect(page.getByTestId('animals-page')).toBeVisible()
  await expect(page.getByTestId('animals-grid')).toBeVisible()

  const card = page.locator(
    `[data-testid="animal-card"][data-animal-slug="${e2eData.animal.slug}"]`,
  )
  await expect(card).toBeVisible()
  await card.click()

  await expect(page).toHaveURL(new RegExp(`/animais/${e2eData.animal.slug}$`))
  await expect(page.getByTestId('animal-detail-page')).toBeVisible()
  await expect(page.getByTestId('animal-detail-name')).toHaveText(e2eData.animal.nome)

  await assertNoErrors()
})
