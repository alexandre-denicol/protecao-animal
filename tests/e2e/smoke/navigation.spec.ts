import { expect, test } from '@playwright/test'

const publicRoutes = ['/', '/animais', '/contato', '/sobre', '/adocoes']

for (const route of publicRoutes) {
  test(`rota pública ${route} responde sem erro`, async ({ page }) => {
    const response = await page.goto(route)

    expect(response?.ok()).toBeTruthy()
  })
}
