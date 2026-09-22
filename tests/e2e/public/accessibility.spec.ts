import { expect, test, type Page } from '@playwright/test'

// Somente leitura: nenhum teste envia formulário. A validação exercitada aqui
// acontece 100% no cliente (sócios e telefone inválido), e cada teste confirma
// que nenhuma requisição POST saiu.

const publicRoutes = ['/', '/animais', '/contato', '/sobre', '/adocoes', '/socios']

function trackPosts(page: Page): string[] {
  const posts: string[] = []
  page.on('request', (request) => {
    if (request.method() === 'POST') posts.push(request.url())
  })
  return posts
}

function focusedName(page: Page) {
  return page.evaluate(() => document.activeElement?.getAttribute('name') ?? '')
}

for (const route of publicRoutes) {
  test(`${route} expõe um único landmark main`, async ({ page }) => {
    await page.goto(route)

    await expect(page.getByRole('main')).toHaveCount(1)
    await expect(page.locator('main#main-content')).toHaveCount(1)
  })
}

test('link "Pular para o conteúdo" é o primeiro foco e leva ao main', async ({ page }) => {
  await page.goto('/contato')

  const skip = page.getByRole('link', { name: 'Pular para o conteúdo' })
  const hiddenBox = await skip.boundingBox()
  expect(hiddenBox && hiddenBox.width <= 1).toBeTruthy()

  await page.keyboard.press('Tab')

  await expect(skip).toBeFocused()
  const box = await skip.boundingBox()
  expect(box && box.width > 100 && box.y >= 0).toBeTruthy()

  // Não fica atrás do header fixo
  const isOnTop = await skip.evaluate((element) => {
    const rect = element.getBoundingClientRect()
    return document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2) === element
  })
  expect(isOnTop).toBe(true)

  await page.keyboard.press('Enter')
  await expect(page.locator('#main-content')).toBeFocused()
  await expect(page).toHaveURL(/#main-content$/)

  await page.keyboard.press('Tab')
  const focusIsInsideMain = await page.evaluate(() =>
    Boolean(document.getElementById('main-content')?.contains(document.activeElement)),
  )
  expect(focusIsInsideMain).toBe(true)
})

test('campos do contato têm rótulo, autocomplete, required e IDs únicos', async ({ page }) => {
  const posts = trackPosts(page)
  await page.goto('/contato')

  const form = page.getByTestId('contact-form')
  await expect(form.getByLabel('Nome')).toHaveAttribute('autocomplete', 'name')
  await expect(form.getByLabel('Email')).toHaveAttribute('autocomplete', 'email')

  for (const label of ['Nome', 'Email', 'Assunto', 'Mensagem']) {
    await expect(form.getByLabel(label)).toHaveAttribute('required', '')
    await expect(form.getByLabel(label)).not.toHaveAttribute('aria-invalid', /.*/)
  }

  const ids = await form.locator('input, textarea').evaluateAll((elements) =>
    elements.map((element) => element.id),
  )
  expect(new Set(ids).size).toBe(ids.length)
  expect(ids.some((id) => ['nome', 'email', 'assunto', 'mensagem'].includes(id))).toBe(false)
  expect(posts).toEqual([])
})

test('sócios: validação no cliente foca o primeiro campo inválido e descreve o erro', async ({ page }) => {
  const posts = trackPosts(page)
  await page.goto('/socios')

  await page.getByRole('button', { name: 'Enviar cadastro' }).click()

  const nome = page.getByLabel('Nome')
  await expect(nome).toBeFocused()
  await expect(nome).toHaveAttribute('aria-invalid', 'true')

  const describedBy = await nome.getAttribute('aria-describedby')
  expect(describedBy).toBeTruthy()
  await expect(page.locator(`[id="${describedBy}"]`)).toHaveText(
    'Informe seu nome com pelo menos 2 caracteres.',
  )

  for (const label of ['Email', 'Endereço', 'Cidade', 'Estado', 'CPF']) {
    await expect(page.getByLabel(label)).toHaveAttribute('aria-invalid', 'true')
  }
  await expect(page.getByLabel('Endereço')).toHaveAttribute('autocomplete', 'address-line1')
  await expect(page.getByLabel('Cidade')).toHaveAttribute('autocomplete', 'address-level2')
  expect(posts).toEqual([])
})

test('adoção: telefone inválido é validado no cliente, com foco e erro ligado ao campo', async ({ page }) => {
  const posts = trackPosts(page)

  await page.goto('/animais')
  const cards = page.getByTestId('animal-card')
  test.skip((await cards.count()) === 0, 'Sem animais no catálogo para inspecionar')
  await cards.first().click()

  await page.getByTestId('adoption-open-form').click()
  const form = page.getByTestId('adoption-interest-form')

  await expect(form.getByLabel('Nome')).toHaveAttribute('autocomplete', 'name')
  await expect(form.getByLabel('Email')).toHaveAttribute('autocomplete', 'email')
  await expect(form.getByLabel('Código do país')).toBeVisible()

  await form.getByLabel('Telefone').fill('1')
  await page.getByTestId('adoption-submit').click()

  const telefone = form.getByLabel('Telefone')
  await expect(telefone).toBeFocused()
  await expect(telefone).toHaveAttribute('aria-invalid', 'true')

  const describedBy = await telefone.getAttribute('aria-describedby')
  expect(describedBy).toBeTruthy()
  await expect(page.locator(`[id="${describedBy}"]`)).not.toBeEmpty()
  expect(posts).toEqual([])
})

test('movimento reduzido remove a duração das transições', async ({ page }) => {
  await page.goto('/contato')
  const button = page.getByTestId('contact-submit')

  const normal = await button.evaluate((el) => parseFloat(getComputedStyle(el).transitionDuration))
  expect(normal).toBeGreaterThan(0.05)

  await page.emulateMedia({ reducedMotion: 'reduce' })
  const reduced = await button.evaluate((el) => parseFloat(getComputedStyle(el).transitionDuration))
  expect(reduced).toBeLessThan(0.001)
})

test('"Área da equipe" fica só no rodapé e tem contraste AA', async ({ page }) => {
  await page.setViewportSize({ width: 1400, height: 900 })
  await page.goto('/contato')

  await expect(page.getByRole('banner').getByRole('link', { name: 'Área da equipe' })).toHaveCount(0)

  const ratio = await page.getByRole('contentinfo').getByRole('link', { name: 'Área da equipe' }).evaluate((element) => {
    const channel = (value: number) => {
      const v = value / 255
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
    }
    const luminance = ([r, g, b]: number[]) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
    const parse = (color: string) => (color.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number)
    const text = luminance(parse(getComputedStyle(element).color))
    // Fundo mais claro do rodapé: #111827
    const footer = luminance([17, 24, 39])
    return (Math.max(text, footer) + 0.05) / (Math.min(text, footer) + 0.05)
  })

  expect(ratio).toBeGreaterThanOrEqual(4.5)
})

test.describe('menu mobile', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })

  async function focusIsInsideMenu(page: Page) {
    return page.evaluate(() =>
      Boolean(document.getElementById('mobile-menu')?.contains(document.activeElement)),
    )
  }

  test('fechado, o menu não entra na ordem de Tab; aberto, tem semântica de disclosure', async ({ page }) => {
    await page.goto('/contato')

    const trigger = page.getByRole('button', { name: 'Menu de navegação' })
    const menu = page.locator('#mobile-menu')

    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(trigger).toHaveAttribute('aria-controls', 'mobile-menu')
    await expect(menu).not.toHaveAttribute('role', /.+/)
    await expect(menu.getByRole('link', { name: 'Contato' })).toHaveCount(0)

    await trigger.focus()
    for (let i = 0; i < 4; i += 1) {
      await page.keyboard.press('Tab')
      expect(await focusIsInsideMenu(page)).toBe(false)
    }

    await trigger.focus()
    await page.keyboard.press('Enter')
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await expect(menu.getByRole('link', { name: 'Contato' })).toBeVisible()

    await page.keyboard.press('Tab')
    expect(await focusIsInsideMenu(page)).toBe(true)
  })

  test('Escape fecha o menu e devolve o foco ao botão', async ({ page }) => {
    await page.goto('/contato')

    const trigger = page.getByRole('button', { name: 'Menu de navegação' })
    await trigger.click()
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')

    await page.locator('#mobile-menu').getByRole('link', { name: 'Sobre nós' }).focus()
    await page.keyboard.press('Escape')

    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(trigger).toBeFocused()
    await expect(page.locator('#mobile-menu').getByRole('link', { name: 'Sobre nós' })).toHaveCount(0)
  })

  test('sair do header com Tab fecha o menu aberto', async ({ page }) => {
    await page.goto('/contato')

    const trigger = page.getByRole('button', { name: 'Menu de navegação' })
    await trigger.click()

    // Último item do menu: o próximo Tab já sai do header
    await page.locator('#mobile-menu').getByRole('link', { name: 'Quero adotar' }).focus()
    await page.keyboard.press('Tab')

    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(await focusIsInsideMenu(page)).toBe(false)
  })
})
