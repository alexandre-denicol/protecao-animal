import { expect, type Locator, type Page } from '@playwright/test'

export async function firstAnimalCard(page: Page): Promise<Locator> {
  await page.goto('/animais')
  const card = page.getByTestId('animal-card').first()
  await expect(card).toBeVisible()
  return card
}
