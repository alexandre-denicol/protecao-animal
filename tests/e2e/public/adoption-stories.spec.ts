import { expect, test, type Page } from '@playwright/test'

// Somente leitura: apenas navega e inspeciona /adocoes e a Home. Não cria
// adoções e não exige E2E_ALLOW_MUTATION. Funciona com qualquer dado: com
// histórias, sem histórias (estado vazio) ou com falha de consulta.

type StoriesState = 'stories' | 'empty' | 'error'

async function openStories(page: Page): Promise<StoriesState> {
  await page.goto('/adocoes')
  await expect(page.getByTestId('adoption-stories-page')).toBeVisible()

  const list = page.getByTestId('adoption-stories-list')
  const empty = page.getByTestId('adoption-stories-empty')
  const error = page.getByTestId('adoption-stories-error')

  // O esqueleto some quando a consulta termina.
  await expect(list.or(empty).or(error)).toBeVisible()

  if (await list.count()) return 'stories'
  return (await empty.count()) ? 'empty' : 'error'
}

test('página tem um único h1, um único main e mostra exatamente um estado', async ({ page }) => {
  await openStories(page)

  await expect(page.getByRole('heading', { level: 1, name: 'Histórias de adoção' })).toHaveCount(1)
  await expect(page.getByRole('main')).toHaveCount(1)

  const visibleStates = await page
    .locator(
      '[data-testid="adoption-stories-list"], [data-testid="adoption-stories-empty"], [data-testid="adoption-stories-error"]',
    )
    .count()
  expect(visibleStates).toBe(1)
})

test('histórias: título h2, alt só com o nome, datas válidas e nada clicável nelas', async ({ page }) => {
  test.skip((await openStories(page)) !== 'stories', 'Sem histórias publicadas para inspecionar')

  const stories = page.getByTestId('adoption-story')
  const count = await stories.count()
  expect(count).toBeGreaterThan(0)

  for (let index = 0; index < count; index++) {
    const story = stories.nth(index)

    await expect(story.getByRole('heading', { level: 2 })).toHaveCount(1)
    await expect(story.locator('a, button, [role="button"], [tabindex]')).toHaveCount(0)

    for (const alt of await story.locator('img').evaluateAll((images) =>
      images.map((image) => image.getAttribute('alt') ?? ''),
    )) {
      expect(alt).toMatch(/^Foto da adoção de .+/)
    }

    for (const dateTime of await story.locator('time').evaluateAll((times) =>
      times.map((time) => time.getAttribute('datetime') ?? ''),
    )) {
      expect(dateTime).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  }

  const heading = page.getByRole('heading', { level: 2, name: 'Conheça quem espera por um lar' })
  await expect(heading).toBeVisible()
  await expect(page.getByRole('link', { name: 'Ver animais para adoção' })).toHaveAttribute('href', '/animais')
})

test('estado vazio é compacto e leva ao catálogo', async ({ page }) => {
  test.skip((await openStories(page)) !== 'empty', 'Há histórias publicadas (ou a consulta falhou)')

  const empty = page.getByTestId('adoption-stories-empty')
  await expect(empty.getByRole('heading', { level: 2 })).toBeVisible()
  await expect(empty.getByRole('link', { name: 'Ver animais para adoção' })).toHaveAttribute('href', '/animais')
})

test('falha de consulta não se passa por "sem histórias"', async ({ page }) => {
  test.skip((await openStories(page)) !== 'error', 'A consulta não falhou')

  await expect(page.getByTestId('adoption-stories-error')).toHaveAttribute('role', 'alert')
  await expect(page.getByTestId('adoption-stories-empty')).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'Tentar novamente' })).toHaveAttribute('href', '/adocoes')
})

test('teclado: o primeiro foco no conteúdo tem anel visível e não fica sob o header', async ({ page }) => {
  await openStories(page)
  await page.evaluate(() => document.getElementById('main-content')?.focus())

  // A primeira parada interativa dentro de <main> é a ação da página (CTA ou estado).
  for (let presses = 0; presses < 6; presses++) {
    await page.keyboard.press('Tab')
    const inMain = await page.evaluate(() => Boolean(document.activeElement?.closest('main')))
    if (inMain) break
  }

  const focus = await page.evaluate(() => {
    const element = document.activeElement as HTMLElement
    const style = getComputedStyle(element)
    return {
      inMain: Boolean(element.closest('main')),
      ring: style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0,
      top: element.getBoundingClientRect().top,
    }
  })

  expect(focus.inMain).toBe(true)
  expect(focus.ring).toBe(true)
  expect(focus.top).toBeGreaterThanOrEqual(64)
})

for (const width of [390, 320]) {
  test(`/adocoes não cria rolagem horizontal em ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 })
    await openStories(page)

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
  })
}

test('cabeçalho: "Histórias" leva a /adocoes', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/contato')

  await page.getByRole('banner').getByRole('link', { name: 'Histórias', exact: true }).click()

  await expect(page).toHaveURL(/\/adocoes$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Histórias de adoção' })).toBeVisible()
})

test('Home: quando há histórias, "Ver todas as histórias" leva a /adocoes', async ({ page }) => {
  await page.goto('/')

  const section = page.getByTestId('adoption-stories-section')
  test.skip((await section.count()) === 0, 'A Home não exibe histórias (sem adoções)')

  const link = section.getByRole('link', { name: /Ver todas as histórias/ })
  await expect(link).toHaveAttribute('href', '/adocoes')
  await link.click()

  await expect(page).toHaveURL(/\/adocoes$/)
})
