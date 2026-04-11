import { expect, test } from '@playwright/test'
import { createAnimalViaAdmin } from '../utils/admin'
import { trackPageErrors } from '../utils/assertions'
import { openAnimalDetailFromCatalog } from '../utils/public'

test('detalhe do animal renderiza ficha e WhatsApp com número configurado', async ({ page }) => {
  const assertNoErrors = trackPageErrors(page)
  const animal = await createAnimalViaAdmin(page, { namePrefix: 'E2E Detalhe' })

  const { animalName } = await openAnimalDetailFromCatalog(page, {
    animalName: animal.name,
  })

  await expect(page.getByTestId('animal-detail-name')).toHaveText(animalName)
  await expect(page.getByRole('heading', { name: 'Temperamento', level: 2 })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Sobre', level: 2 })).toBeVisible()

  const whatsapp = page.getByTestId('animal-whatsapp-link')
  await expect(whatsapp).toBeVisible()
  await expect(whatsapp).toHaveAttribute(
    'href',
    new RegExp(`https://wa\\.me/\\d+\\?text=.*${encodeURIComponent(animalName)}`),
  )
  await expect(whatsapp).toHaveAttribute('target', '_blank')
  await expect(whatsapp).toHaveAttribute('rel', /noopener/)

  await assertNoErrors()
})

test('slug inválido retorna 404', async ({ page }) => {
  const response = await page.goto('/animais/slug-inexistente-e2e')

  expect(response?.status()).toBe(404)
})
