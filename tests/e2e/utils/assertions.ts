import { expect, type Page } from '@playwright/test'

export function trackPageErrors(page: Page): () => Promise<void> {
  const errors: string[] = []

  page.on('pageerror', (error) => {
    errors.push(error.message)
  })

  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text())
    }
  })

  return async () => {
    await page.waitForLoadState('networkidle')
    expect(errors).toEqual([])
  }
}

export async function expectSuccessFeedback(
  page: Page,
  message: RegExp,
): Promise<void> {
  await expect(page.getByRole('status').filter({ hasText: message })).toBeVisible({
    timeout: 15_000,
  })
}
