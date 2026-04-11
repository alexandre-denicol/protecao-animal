import { expect, test } from '@playwright/test'
import { createAnimalViaAdmin } from '../utils/admin'
import { trackPageErrors } from '../utils/assertions'

test('home carrega e exibe animais em destaque com links reais', async ({ page }) => {
  const assertNoErrors = trackPageErrors(page)
  const animal = await createAnimalViaAdmin(page, {
    featured: true,
    namePrefix: 'E2E Destaque',
  })

  await page.goto('/')

  await expect(page.getByTestId('featured-animals-section')).toBeVisible()
  await expect(page.getByTestId('featured-animal-card').first()).toBeVisible()
  await expect(
    page.getByTestId('featured-animal-card').filter({ hasText: animal.name }).first(),
  ).toBeVisible()

  await assertNoErrors()
})
