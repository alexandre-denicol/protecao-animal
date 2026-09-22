import { test } from '@playwright/test'
import { createAnimalViaAdmin } from '../utils/admin'
import { expectSuccessFeedback, trackPageErrors } from '../utils/assertions'
import { assertMutationAllowed } from '../utils/mutation-guard'
import { uniqueEmail, uniqueName } from '../utils/test-data'
import { openAnimalDetailFromCatalog } from '../utils/public'

test('formulário Quero adotar envia interesse com sucesso', async ({ page }) => {
  assertMutationAllowed('Enviar interesse de adoção')
  const assertNoErrors = trackPageErrors(page)
  const animal = await createAnimalViaAdmin(page, { namePrefix: 'E2E Adoção' })

  await openAnimalDetailFromCatalog(page, { animalName: animal.name })
  await page.getByTestId('adoption-open-form').click()

  await page.getByTestId('adoption-interest-form').getByLabel(/Nome/).fill(uniqueName('Pessoa E2E'))
  await page.getByTestId('adoption-interest-form').getByLabel(/Email/).fill(uniqueEmail('adocao'))
  await page.getByTestId('adoption-interest-form').getByLabel(/Telefone/).fill('51999999999')
  await page
    .getByTestId('adoption-interest-form')
    .getByLabel(/Mensagem/)
    .fill('Tenho interesse e quero conversar sobre a adoção.')
  await page.getByTestId('adoption-submit').click()

  await expectSuccessFeedback(page, /Interesse enviado/)
  await assertNoErrors()
})
