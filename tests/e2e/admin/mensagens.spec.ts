import { expect, test } from '@playwright/test'
import { loginAsAdmin } from '../utils/admin'
import { expectSuccessFeedback } from '../utils/assertions'
import { uniqueEmail, uniqueSuffix } from '../utils/test-data'

test('mensagens lista registros e permite marcar como lida', async ({ page }) => {
  const email = uniqueEmail('mensagem-admin')
  const assunto = `Assunto Admin ${uniqueSuffix()}`

  await page.goto('/contato')
  await page.getByTestId('contact-form').getByLabel(/Nome/).fill('Mensagem Admin')
  await page.getByTestId('contact-form').getByLabel(/Email/).fill(email)
  await page.getByTestId('contact-form').getByLabel(/Assunto/).fill(assunto)
  await page
    .getByTestId('contact-form')
    .getByLabel(/Mensagem/)
    .fill('Mensagem criada para testar a área administrativa.')
  await page.getByTestId('contact-submit').click()
  await expectSuccessFeedback(page, /Mensagem enviada com sucesso/)

  await loginAsAdmin(page)
  await page.goto('/admin/mensagens')

  await expect(page.getByTestId('admin-messages-page')).toBeVisible()
  const row = page.getByTestId('admin-message-row').filter({ hasText: email })
  await expect(row).toBeVisible()
  await expect(row).toContainText('Não lida')

  await row.getByTestId('mark-message-read').click()
  await expect(row).toContainText('Lida')
})
