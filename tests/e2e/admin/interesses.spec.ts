import { expect, test } from '@playwright/test'
import { createAnimalViaAdmin, loginAsAdmin } from '../utils/admin'
import { expectSuccessFeedback } from '../utils/assertions'
import { assertMutationAllowed } from '../utils/mutation-guard'
import { uniqueEmail, uniqueName } from '../utils/test-data'
import { openAnimalDetailFromCatalog } from '../utils/public'

test('interesses lista registros e permite marcar como lido', async ({ page }) => {
  assertMutationAllowed('Criar e marcar como lido um interesse de adoção')
  const email = uniqueEmail('interesse-admin')
  const animal = await createAnimalViaAdmin(page, { namePrefix: 'E2E Interesse' })

  await openAnimalDetailFromCatalog(page, { animalName: animal.name })
  await page.getByTestId('adoption-open-form').click()
  await page.getByTestId('adoption-interest-form').getByLabel(/Nome/).fill(uniqueName('Interesse Admin'))
  await page.getByTestId('adoption-interest-form').getByLabel(/Email/).fill(email)
  await page.getByTestId('adoption-interest-form').getByLabel(/Telefone/).fill('51999999999')
  await page
    .getByTestId('adoption-interest-form')
    .getByLabel(/Mensagem/)
    .fill('Interesse criado para teste admin.')
  await page.getByTestId('adoption-submit').click()
  await expectSuccessFeedback(page, /Interesse enviado/)

  await loginAsAdmin(page)
  await page.goto('/admin/interesses')

  await expect(page.getByTestId('admin-interests-page')).toBeVisible()
  const row = page.getByTestId('admin-interest-row').filter({ hasText: email })
  await expect(row).toBeVisible()
  await expect(row).toContainText('Não lida')

  await row.getByTestId('mark-interest-read').click()
  await expect(row).toContainText('Lida')
})
