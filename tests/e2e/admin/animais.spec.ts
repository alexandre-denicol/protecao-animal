import { expect, test } from '@playwright/test'
import { loginAsAdmin } from '../utils/admin'
import { trackPageErrors } from '../utils/assertions'
import { uniqueName } from '../utils/test-data'

const pngBuffer = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
  'base64',
)

test.describe.serial('gestão admin de animais', () => {
  const animalNome = uniqueName('E2E Criado')
  const animalNomeEditado = `${animalNome} Editado`

  test('listagem de animais carrega', async ({ page }) => {
    const assertNoErrors = trackPageErrors(page)

    await loginAsAdmin(page)
    await page.goto('/admin/animais')

    await expect(page.getByTestId('admin-animals-page')).toBeVisible()

    const rows = page.getByTestId('admin-animal-row')
    if ((await rows.count()) > 0) {
      await expect(rows.first()).toBeVisible()
    } else {
      await expect(page.getByText(/Nenhum animal encontrado/i)).toBeVisible()
    }

    await assertNoErrors()
  })

  test('criar animal pelo admin funciona', async ({ page }) => {
    const assertNoErrors = trackPageErrors(page)

    await loginAsAdmin(page)
    await page.goto('/admin/animais')
    await page.getByTestId('admin-new-animal-link').click()

    await page.getByLabel(/Nome/).fill(animalNome)
    await page.getByLabel(/Espécie/).selectOption('gato')
    await page.getByLabel(/Sexo/).selectOption('femea')
    await page.getByLabel(/Idade \(anos\)/).fill('1')
    await page.getByLabel(/Meses complementares/).fill('2')
    await page.getByLabel(/Peso/).fill('3.5')
    await page.getByLabel(/Temperamento/).fill('Carinhosa')
    await page.getByLabel(/Descrição completa/).fill('Animal criado pelo teste E2E.')
    await page.getByLabel('Adicionar fotos').setInputFiles({
      name: 'animal.png',
      mimeType: 'image/png',
      buffer: pngBuffer,
    })
    await page.getByTestId('admin-animal-submit').click()

    await expect(page).toHaveURL(/\/admin\/animais$/)
    await expect(page.getByText(animalNome)).toBeVisible()
    await assertNoErrors()
  })

  test('editar animal pelo admin funciona', async ({ page }) => {
    const assertNoErrors = trackPageErrors(page)

    await loginAsAdmin(page)
    await page.goto('/admin/animais')
    await page.getByRole('link', { name: animalNome }).click()

    await expect(page.getByTestId('admin-animal-form')).toBeVisible()
    await page.getByLabel(/Nome/).fill(animalNomeEditado)
    await page.getByTestId('admin-animal-submit').click()

    await expect(page).toHaveURL(/\/admin\/animais$/)
    await expect(page.getByText(animalNomeEditado)).toBeVisible()
    await assertNoErrors()
  })
})
