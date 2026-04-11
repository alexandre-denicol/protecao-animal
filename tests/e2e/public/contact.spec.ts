import { test } from '@playwright/test'
import { expectSuccessFeedback, trackPageErrors } from '../utils/assertions'
import { uniqueEmail, uniqueSuffix } from '../utils/test-data'

test('formulário de contato envia mensagem com sucesso', async ({ page }) => {
  const assertNoErrors = trackPageErrors(page)

  await page.goto('/contato')

  await page.getByTestId('contact-form').getByLabel(/Nome/).fill('Contato E2E')
  await page.getByTestId('contact-form').getByLabel(/Email/).fill(uniqueEmail('contato'))
  await page.getByTestId('contact-form').getByLabel(/Assunto/).fill(`Assunto E2E ${uniqueSuffix()}`)
  await page
    .getByTestId('contact-form')
    .getByLabel(/Mensagem/)
    .fill('Mensagem de contato criada por teste E2E automatizado.')
  await page.getByTestId('contact-submit').click()

  await expectSuccessFeedback(page, /Mensagem enviada com sucesso/)
  await assertNoErrors()
})
