import type { Page } from '@playwright/test'
import { test as base } from '@playwright/test'
import { fakeData } from './fake-data'
interface AuthState {
    userStore: any
}

interface PageFixture {
    page: Page
}

export const test = base.extend<PageFixture>({
    page: async ({ page }: { page: Page }, use) => {
        await page.addInitScript((state: AuthState['userStore']) => {
            window.localStorage.setItem('auth', JSON.stringify(state))
        }, fakeData.store)
        await use(page)
    },
})
