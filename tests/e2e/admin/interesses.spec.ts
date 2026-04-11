import { expect, test } from '@playwright/test'
import { loginAsAdmin } from '../utils/admin'
import { e2eData, uniqueEmail, uniqueSuffix } from '../utils/test-data'

test('interesses lista registros e permite marcar como lido', async ({ page }) => {
  const email = uniqueEmail('interesse-admin')

  await page.goto(`/animais/${e2eData.animal.slug}`)
  await page.getByTestId('adoption-open-form').click()
  await page.getByLabel(/Nome/).fill(`Interesse Admin ${uniqueSuffix()}`)
  await page.getByLabel(/Email/).fill(email)
  await page.getByLabel(/Telefone/).fill('555499999999')
  await page.getByLabel(/Mensagem/).fill('Interesse criado para teste admin.')
  await page.getByTestId('adoption-submit').click()
  await expect(page.getByRole('status')).toContainText(/Interesse enviado/)

  await loginAsAdmin(page)
  await page.goto('/admin/interesses')

  await expect(page.getByTestId('admin-interests-page')).toBeVisible()
  const row = page.getByTestId('admin-interest-row').filter({ hasText: email })
  await expect(row).toBeVisible()
  await expect(row).toContainText('Não lida')

  await row.getByTestId('mark-interest-read').click()
  await expect(row).toContainText('Lida')
})
