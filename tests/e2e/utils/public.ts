import { expect, type Page } from '@playwright/test'

export async function openAnimalDetailFromCatalog(
  page: Page,
  options?: { animalName?: string },
): Promise<{ animalName: string; href: string | null }> {
  await page.goto('/animais')
  await expect(page.getByTestId('animals-page')).toBeVisible()
  await expect(page.getByTestId('animals-grid')).toBeVisible()

  const card = options?.animalName
    ? page.getByTestId('animal-card').filter({ hasText: options.animalName }).first()
    : page.getByTestId('animal-card').first()

  await expect(card).toBeVisible()

  const animalName =
    options?.animalName ?? (await card.locator('h2').textContent())?.trim() ?? 'Animal'
  const href = await card.getAttribute('href')

  await card.click()

  await expect(page).toHaveURL(/\/animais\/[^/]+$/)
  await expect(page.getByTestId('animal-detail-page')).toBeVisible()

  return { animalName, href }
}
