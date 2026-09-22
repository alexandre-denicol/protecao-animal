import { expect, test } from '@playwright/test'

// Somente leitura: apenas navega e inspeciona a Home. Funciona com ou sem
// animais em destaque (o estado vazio é um resultado válido).

test('Home tem um único h1 e os animais vêm antes de cuidado, missão e apoio', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)

  const top = (locator: ReturnType<typeof page.locator>) =>
    locator.evaluate((element) => element.getBoundingClientRect().top + window.scrollY)

  const featured = await top(page.getByTestId('featured-animals-section'))
  const cuidado = await top(page.getByRole('heading', { name: 'Como a Amiga Miau cuida' }))
  const missao = await top(page.getByRole('heading', { name: /Cuidado real, rotina digna/ }))
  const apoio = await top(page.locator('#apoio'))

  expect(featured).toBeLessThan(cuidado)
  expect(cuidado).toBeLessThan(missao)
  expect(missao).toBeLessThan(apoio)
})

test('animais em destaque aparecem logo abaixo do hero no desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')

  const top = await page
    .getByTestId('featured-animals-section')
    .evaluate((element) => element.getBoundingClientRect().top)

  expect(top).toBeLessThan(700)
})

test('seção de destaque mostra cards ou um estado vazio com CTA', async ({ page }) => {
  await page.goto('/')

  const section = page.getByTestId('featured-animals-section')
  const cards = section.getByTestId('featured-animal-card')

  if ((await cards.count()) > 0) {
    await expect(section.getByTestId('featured-animals-grid')).toBeVisible()
    return
  }

  await expect(section.getByRole('heading', { name: 'Nenhum animal em destaque no momento' })).toBeVisible()
  await expect(section.getByRole('link', { name: 'Ver todos os animais' })).toHaveAttribute('href', '/animais')
})

test('estatísticas aparecem no máximo uma vez', async ({ page }) => {
  await page.goto('/')

  for (const label of ['Animais resgatados', 'Adotados com amor', 'Aguardando um lar']) {
    expect(await page.getByText(label, { exact: true }).count()).toBeLessThanOrEqual(1)
  }
})

test('cabeçalho: Adotar é navegação, Quero adotar é a ação; equipe só no rodapé', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')

  const header = page.getByRole('banner')

  await expect(header.getByRole('navigation', { name: 'Navegação principal' }).getByRole('link', { name: 'Adotar' })).toHaveAttribute('href', '/animais')
  await expect(header.getByRole('link', { name: 'Quero adotar', exact: true })).toHaveAttribute('href', '/animais')
  await expect(header.getByRole('link', { name: 'Área da equipe' })).toHaveCount(0)
  await expect(page.getByRole('contentinfo').getByRole('link', { name: 'Área da equipe' })).toHaveAttribute('href', '/admin/login')
})

test('apoio separa doação via PIX de ser sócio, e "Como ajudar" leva até ele', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('main').getByRole('link', { name: 'Como ajudar' })).toHaveAttribute('href', '#apoio')

  const apoio = page.locator('#apoio')
  await expect(apoio.getByRole('heading', { name: 'Doar via PIX' })).toBeVisible()
  await expect(apoio.getByRole('heading', { name: 'Ser sócio' })).toBeVisible()
  await expect(apoio.getByRole('link', { name: 'Quero ser sócio' })).toHaveAttribute('href', '/socios')
  await expect(page.getByRole('main').getByRole('link', { name: 'Apoiar a associação' })).toHaveCount(0)
})

for (const width of [390, 320]) {
  test(`Home não cria rolagem horizontal em ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 })
    await page.goto('/')

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
  })
}
