import { test as base, expect } from '@playwright/test'
import { Page } from '@playwright/test'
import { fakeData } from './fake-data'
interface AuthState {
    userStore: any
}

interface PageFixture {
    page: Page
}

const test = base.extend<PageFixture>({
    page: async ({ page }: { page: Page }, use) => {
        await page.addInitScript((state: AuthState['userStore']) => {
            window.localStorage.setItem('auth', JSON.stringify(state))
        }, fakeData.store)
        await use(page)
    },
})
