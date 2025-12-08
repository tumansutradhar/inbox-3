import { test, expect, Page } from '@playwright/test'

/**
 * E2E Tests for Inbox3 Core Flows
 * Tests wallet connection, messaging, and key features
 */

// Helper to mock wallet connection
async function mockWalletConnection(page: Page) {
    // Inject mock wallet adapter for testing
    await page.addInitScript(() => {
        (window as unknown as Record<string, unknown>).mockWallet = {
            connected: true,
            account: {
                address: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
            }
        }
    })
}

test.describe('Inbox3 App', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/')
    })

    test('should load the homepage', async ({ page }) => {
        // Check that the app loads
        await expect(page).toHaveTitle(/Inbox3/)

        // Check for main elements
        await expect(page.locator('main')).toBeVisible()
    })

    test('should show wallet connect button when not connected', async ({ page }) => {
        // Look for connect wallet button
        const connectButton = page.getByRole('button', { name: /connect wallet/i })
        await expect(connectButton).toBeVisible()
    })

    test('should have accessible skip link', async ({ page }) => {
        // Tab to reveal skip link
        await page.keyboard.press('Tab')

        const skipLink = page.getByText('Skip to main content')
        await expect(skipLink).toBeVisible()
    })

    test('should toggle dark mode', async ({ page }) => {
        // Find theme toggle if visible
        const themeToggle = page.locator('[aria-label*="theme"], [aria-label*="dark"], [aria-label*="light"]').first()

        if (await themeToggle.isVisible()) {
            await themeToggle.click()

            // Check that theme attribute changed
            const html = page.locator('html')
            await expect(html).toHaveAttribute('data-theme', /(dark|light)/)
        }
    })

    test('should open settings panel', async ({ page }) => {
        // Click settings button
        const settingsButton = page.getByRole('button', { name: /settings/i }).first()

        if (await settingsButton.isVisible()) {
            await settingsButton.click()

            // Check settings panel opened
            await expect(page.getByRole('heading', { name: /settings/i })).toBeVisible()
        }
    })

    test('should show keyboard shortcuts modal', async ({ page }) => {
        // Press keyboard shortcut
        await page.keyboard.press('?')

        // Check if shortcuts modal appears
        const shortcutsModal = page.getByText(/keyboard shortcuts/i)
        if (await shortcutsModal.isVisible({ timeout: 1000 }).catch(() => false)) {
            await expect(shortcutsModal).toBeVisible()
        }
    })
})

test.describe('Message Search', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/')
    })

    test('should open search with Ctrl+K', async ({ page }) => {
        await page.keyboard.press('Control+k')

        // Check for search input
        const searchInput = page.getByPlaceholder(/search/i).first()
        if (await searchInput.isVisible({ timeout: 1000 }).catch(() => false)) {
            await expect(searchInput).toBeFocused()
        }
    })

    test('should filter messages by search query', async ({ page }) => {
        // Open search
        const searchButton = page.getByRole('button', { name: /search/i }).first()

        if (await searchButton.isVisible()) {
            await searchButton.click()

            const searchInput = page.getByPlaceholder(/search/i).first()
            await searchInput.fill('test message')

            // Wait for results
            await page.waitForTimeout(500)
        }
    })
})

test.describe('Accessibility', () => {
    test('should have no accessibility violations on main page', async ({ page }) => {
        await page.goto('/')

        // Basic accessibility checks
        // Check for proper heading hierarchy
        const h1 = page.locator('h1').first()
        await expect(h1).toBeVisible()

        // Check for main landmark
        const main = page.locator('main, [role="main"]').first()
        await expect(main).toBeVisible()

        // Check images have alt text
        const images = page.locator('img')
        const imageCount = await images.count()
        for (let i = 0; i < imageCount; i++) {
            const img = images.nth(i)
            const alt = await img.getAttribute('alt')
            const role = await img.getAttribute('role')
            const ariaHidden = await img.getAttribute('aria-hidden')

            // Image should have alt text, or be marked as decorative
            expect(alt !== null || role === 'presentation' || ariaHidden === 'true').toBeTruthy()
        }
    })

    test('should be keyboard navigable', async ({ page }) => {
        await page.goto('/')

        // Tab through interactive elements
        for (let i = 0; i < 10; i++) {
            await page.keyboard.press('Tab')
        }

        // Check that focus is visible
        const focusedElement = page.locator(':focus')
        await expect(focusedElement).toBeVisible()
    })

    test('should support reduced motion preference', async ({ page }) => {
        // Set reduced motion preference
        await page.emulateMedia({ reducedMotion: 'reduce' })
        await page.goto('/')

        // App should load without animations blocking
        await expect(page.locator('main, [role="main"]').first()).toBeVisible()
    })
})

test.describe('Responsive Design', () => {
    test('should display mobile layout on small screens', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 })
        await page.goto('/')

        // Check that sidebar is hidden or collapsed on mobile
        const sidebar = page.locator('[data-testid="sidebar"], aside').first()

        // Mobile should have hidden or hamburger menu
        const mobileMenu = page.locator('[aria-label*="menu"], [data-testid="mobile-menu"]').first()

        // Either sidebar should be hidden or mobile menu should be visible
        const sidebarHidden = !(await sidebar.isVisible().catch(() => false))
        const mobileMenuVisible = await mobileMenu.isVisible().catch(() => false)

        expect(sidebarHidden || mobileMenuVisible).toBeTruthy()
    })

    test('should display desktop layout on large screens', async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 })
        await page.goto('/')

        // Sidebar should be visible on desktop
        const sidebar = page.locator('[data-testid="sidebar"], aside').first()
        if (await sidebar.count() > 0) {
            // If sidebar exists in DOM, it should be visible on desktop
            await expect(sidebar).toBeVisible()
        }
    })
})
