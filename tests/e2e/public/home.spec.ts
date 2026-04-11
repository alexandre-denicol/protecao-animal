import { expect, test } from '@playwright/test'
import { e2eData } from '../utils/test-data'
import { trackPageErrors } from '../utils/assertions'

test('home carrega e exibe animais em destaque com links reais', async ({ page }) => {
  const assertNoErrors = trackPageErrors(page)

  await page.goto('/')

  await expect(page.getByTestId('featured-animals-section')).toBeVisible()
  await expect(page.getByTestId('featured-animal-card').first()).toBeVisible()
  await expect(
    page.locator(`[data-testid="featured-animal-card"][data-animal-slug="${e2eData.animal.slug}"]`),
  ).toBeVisible()

  await assertNoErrors()
})
