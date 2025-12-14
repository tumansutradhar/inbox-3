/**
 * Accessibility utilities for Inbox3
 * Provides hooks and components for accessible UX
 */

import { useEffect, useRef, useCallback } from 'react'

/**
 * Announces a message to screen readers
 * Uses an ARIA live region to communicate dynamic updates
 */
export function useAnnounce() {
    const announceRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        // Create or find the live region
        let liveRegion = document.getElementById('sr-announcer') as HTMLDivElement
        if (!liveRegion) {
            liveRegion = document.createElement('div')
            liveRegion.id = 'sr-announcer'
            liveRegion.setAttribute('role', 'status')
            liveRegion.setAttribute('aria-live', 'polite')
            liveRegion.setAttribute('aria-atomic', 'true')
            liveRegion.className = 'sr-only'
            document.body.appendChild(liveRegion)
        }
        announceRef.current = liveRegion

        return () => {
            // Don't remove - might be used by other components
        }
    }, [])

    const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
        if (announceRef.current) {
            announceRef.current.setAttribute('aria-live', priority)
            announceRef.current.textContent = message
            // Reset after announcement
            setTimeout(() => {
                if (announceRef.current) {
                    announceRef.current.textContent = ''
                }
            }, 1000)
        }
    }, [])

    return announce
}

/**
 * Trap focus within a container (for modals, dialogs)
 */
export function useFocusTrap(isActive: boolean = true) {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!isActive || !containerRef.current) return

        const container = containerRef.current
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const firstElement = focusableElements[0] as HTMLElement
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault()
                    lastElement?.focus()
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault()
                    firstElement?.focus()
                }
            }
        }

        // Focus first element when trap activates
        firstElement?.focus()

        container.addEventListener('keydown', handleKeyDown)
        return () => container.removeEventListener('keydown', handleKeyDown)
    }, [isActive])

    return containerRef
}

/**
 * Restore focus to the previously focused element when component unmounts
 */
export function useRestoreFocus() {
    const previouslyFocused = useRef<HTMLElement | null>(null)

    useEffect(() => {
        previouslyFocused.current = document.activeElement as HTMLElement

        return () => {
            previouslyFocused.current?.focus()
        }
    }, [])
}

/**
 * Handle Escape key to close modals/dropdowns
 */
export function useEscapeKey(callback: () => void, isActive: boolean = true) {
    useEffect(() => {
        if (!isActive) return

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                callback()
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [callback, isActive])
}

/**
 * Generate unique IDs for form elements
 */
let idCounter = 0
export function useUniqueId(prefix: string = 'id') {
    const idRef = useRef<string>('')

    if (!idRef.current) {
        idRef.current = `${prefix}-${++idCounter}`
    }

    return idRef.current
}

/**
 * Common ARIA labels for Inbox3 components
 */
export const ariaLabels = {
    // Navigation
    mainContent: 'Main content',
    skipToContent: 'Skip to main content',
    navigation: 'Main navigation',
    sidebar: 'Sidebar navigation',

    // Messages
    messageList: 'Message list',
    messageItem: (sender: string, date: string) => `Message from ${sender} on ${date}`,
    unreadMessages: (count: number) => `${count} unread message${count === 1 ? '' : 's'}`,
    sendMessage: 'Send message',
    composeMessage: 'Compose new message',

    // Actions
    deleteMessage: 'Delete message',
    replyToMessage: 'Reply to message',
    forwardMessage: 'Forward message',
    copyToClipboard: 'Copy to clipboard',

    // Status
    loading: 'Loading...',
    sending: 'Sending message...',
    uploading: 'Uploading file...',
    encrypted: 'Message is encrypted',
    decrypting: 'Decrypting message...',

    // Wallet
    connectWallet: 'Connect wallet',
    disconnectWallet: 'Disconnect wallet',
    walletConnected: (address: string) => `Wallet connected: ${address}`,

    // Search
    searchMessages: 'Search messages',
    clearSearch: 'Clear search',
    searchResults: (count: number) => `${count} search result${count === 1 ? '' : 's'} found`,

    // Settings
    openSettings: 'Open settings',
    closeSettings: 'Close settings',
    darkMode: 'Toggle dark mode',

    // Groups
    createGroup: 'Create new group',
    joinGroup: 'Join existing group',
    leaveGroup: 'Leave group',

    // Contacts
    addContact: 'Add new contact',
    removeContact: 'Remove contact',
    editContact: 'Edit contact'
}

/**
 * Format wallet address for screen readers
 */
export function formatAddressForSR(address: string): string {
    if (!address) return 'No address'
    const start = address.slice(0, 6)
    const end = address.slice(-4)
    return `Address starting with ${start} and ending with ${end}`
}

/**
 * Format timestamp for screen readers
 */
export function formatTimeForSR(timestamp: number | Date): string {
    const date = typeof timestamp === 'number' ? new Date(timestamp) : timestamp
    return date.toLocaleString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
    })
}

/**
 * Visually Hidden component for screen reader only text
 */
export function VisuallyHidden({ children }: { children: React.ReactNode }) {
    return (
        <span className="sr-only">
            {children}
        </span>
    )
}

export default {
    useAnnounce,
    useFocusTrap,
    useRestoreFocus,
    useEscapeKey,
    useUniqueId,
    ariaLabels,
    formatAddressForSR,
    formatTimeForSR,
    VisuallyHidden
}
