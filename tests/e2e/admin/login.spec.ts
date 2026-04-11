import { expect, test } from '@playwright/test'
import { loginAsAdmin } from '../utils/admin'
import { trackPageErrors } from '../utils/assertions'

test('login admin autentica e abre dashboard', async ({ page }) => {
  const assertNoErrors = trackPageErrors(page)

  await loginAsAdmin(page)

  await expect(page.getByTestId('admin-dashboard-page')).toBeVisible()
  await assertNoErrors()
})
