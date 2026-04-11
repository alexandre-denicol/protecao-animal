import { expect, test } from '@playwright/test'
import { createAnimalViaAdmin } from '../utils/admin'
import { trackPageErrors } from '../utils/assertions'
import { openAnimalDetailFromCatalog } from '../utils/public'

test('catálogo lista animais reais e navega para o detalhe pelo card', async ({ page }) => {
  const assertNoErrors = trackPageErrors(page)
  const animal = await createAnimalViaAdmin(page, { namePrefix: 'E2E Catálogo' })

  const { animalName, href } = await openAnimalDetailFromCatalog(page, {
    animalName: animal.name,
  })

  if (href) {
    await expect(page).toHaveURL(new RegExp(`${href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`))
  }

  await expect(page.getByTestId('animal-detail-name')).toHaveText(animalName)
  await assertNoErrors()
})
