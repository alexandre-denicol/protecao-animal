import { expect, type Page } from '@playwright/test'
import { e2eData } from './test-data'

export async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto('/admin/login')
  await page.getByLabel('Email').fill(e2eData.admin.email)
  await page.getByLabel('Senha').fill(e2eData.admin.password)
  await page.getByTestId('admin-login-submit').click()
  await expect(page).toHaveURL(/\/admin$/)
  await expect(page.getByTestId('admin-dashboard-page')).toBeVisible()
}
