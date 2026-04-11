import { expect, test } from '@playwright/test'
import { e2eData } from '../utils/test-data'
import { trackPageErrors } from '../utils/assertions'

test('detalhe do animal renderiza ficha e WhatsApp com número configurado', async ({ page }) => {
  const assertNoErrors = trackPageErrors(page)

  await page.goto(`/animais/${e2eData.animal.slug}`)

  await expect(page.getByTestId('animal-detail-page')).toBeVisible()
  await expect(page.getByTestId('animal-detail-name')).toHaveText(e2eData.animal.nome)
  await expect(page.getByText('Temperamento')).toBeVisible()
  await expect(page.getByText('Sobre')).toBeVisible()

  const whatsapp = page.getByTestId('animal-whatsapp-link')
  await expect(whatsapp).toBeVisible()
  await expect(whatsapp).toHaveAttribute(
    'href',
    /https:\/\/wa\.me\/555499886688\?text=.+E2E%20Luna/,
  )
  await expect(whatsapp).toHaveAttribute('target', '_blank')
  await expect(whatsapp).toHaveAttribute('rel', /noopener/)

  await assertNoErrors()
})

test('slug inválido retorna 404', async ({ page }) => {
  const response = await page.goto('/animais/slug-inexistente-e2e')

  expect(response?.status()).toBe(404)
})
