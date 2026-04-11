import { expect, test } from '@playwright/test'
import { expectSuccessFeedback, trackPageErrors } from '../utils/assertions'
import { e2eData, uniqueEmail } from '../utils/test-data'

test('formulário Quero adotar envia interesse com sucesso', async ({ page }) => {
  const assertNoErrors = trackPageErrors(page)

  await page.goto(`/animais/${e2eData.animal.slug}`)
  await page.getByTestId('adoption-open-form').click()

  await expect(page.getByTestId('adoption-interest-form')).toBeVisible()
  await page.getByLabel(/Nome/).fill(`Pessoa E2E ${Date.now()}`)
  await page.getByLabel(/Email/).fill(uniqueEmail('adocao'))
  await page.getByLabel(/Telefone/).fill('555499999999')
  await page.getByLabel(/Mensagem/).fill('Tenho interesse e quero conversar sobre a adoção.')
  await page.getByTestId('adoption-submit').click()

  await expectSuccessFeedback(page, /Interesse enviado/)
  await assertNoErrors()
})
