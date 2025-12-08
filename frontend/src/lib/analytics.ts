/**
 * Privacy-safe Analytics Module for Inbox3
 * Provides opt-in telemetry with clear data retention policies
 */

export interface AnalyticsEvent {
    name: string
    properties?: Record<string, string | number | boolean>
    timestamp: number
}

export interface AnalyticsConfig {
    enabled: boolean
    anonymousId: string
    consentGiven: boolean
    consentTimestamp?: number
}

const STORAGE_KEY = 'inbox3_analytics'
const EVENTS_KEY = 'inbox3_analytics_events'
const MAX_STORED_EVENTS = 100
const DATA_RETENTION_DAYS = 30

/**
 * Get or create anonymous user ID (no PII)
 */
function getAnonymousId(): string {
    const stored = localStorage.getItem('inbox3_anonymous_id')
    if (stored) return stored

    const id = 'anon_' + Math.random().toString(36).substring(2, 15)
    localStorage.setItem('inbox3_anonymous_id', id)
    return id
}

/**
 * Load analytics configuration
 */
function loadConfig(): AnalyticsConfig {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
        try {
            return JSON.parse(stored)
        } catch {
            // Invalid config, reset
        }
    }

    return {
        enabled: false, // Opt-in by default
        anonymousId: getAnonymousId(),
        consentGiven: false
    }
}

/**
 * Save analytics configuration
 */
function saveConfig(config: AnalyticsConfig): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}

/**
 * Analytics service class
 */
class Analytics {
    private config: AnalyticsConfig
    private queue: AnalyticsEvent[] = []

    constructor() {
        this.config = loadConfig()
        this.loadQueuedEvents()
        this.cleanOldEvents()
    }

    /**
     * Check if analytics is enabled
     */
    isEnabled(): boolean {
        return this.config.enabled && this.config.consentGiven
    }

    /**
     * Enable analytics with user consent
     */
    enableWithConsent(): void {
        this.config.enabled = true
        this.config.consentGiven = true
        this.config.consentTimestamp = Date.now()
        saveConfig(this.config)

        this.track('analytics_enabled')
    }

    /**
     * Disable analytics and clear data
     */
    disable(): void {
        this.config.enabled = false
        saveConfig(this.config)

        // Clear all stored events
        this.queue = []
        localStorage.removeItem(EVENTS_KEY)
    }

    /**
     * Get current consent status
     */
    getConsentStatus(): { consented: boolean; timestamp?: number } {
        return {
            consented: this.config.consentGiven,
            timestamp: this.config.consentTimestamp
        }
    }

    /**
     * Track an event (only if enabled)
     */
    track(eventName: string, properties?: Record<string, string | number | boolean>): void {
        if (!this.isEnabled()) return

        const event: AnalyticsEvent = {
            name: eventName,
            properties: this.sanitizeProperties(properties),
            timestamp: Date.now()
        }

        this.queue.push(event)
        this.saveQueuedEvents()

        // Log in development
        if (import.meta.env.DEV) {
            console.log('[Analytics]', eventName, properties)
        }
    }

    /**
     * Track page view
     */
    page(pageName: string): void {
        this.track('page_view', { page: pageName })
    }

    /**
     * Track user action
     */
    action(actionName: string, category: string): void {
        this.track('user_action', { action: actionName, category })
    }

    /**
     * Track funnel step
     */
    funnel(funnelName: string, step: number, stepName: string): void {
        this.track('funnel_step', { funnel: funnelName, step, step_name: stepName })
    }

    /**
     * Key funnels for Inbox3
     */
    funnels = {
        walletConnect: {
            started: () => this.funnel('wallet_connect', 1, 'started'),
            walletSelected: () => this.funnel('wallet_connect', 2, 'wallet_selected'),
            approved: () => this.funnel('wallet_connect', 3, 'approved'),
            completed: () => this.funnel('wallet_connect', 4, 'completed'),
            failed: (reason: string) => this.track('wallet_connect_failed', { reason })
        },
        sendMessage: {
            composerOpened: () => this.funnel('send_message', 1, 'composer_opened'),
            recipientEntered: () => this.funnel('send_message', 2, 'recipient_entered'),
            messageTyped: () => this.funnel('send_message', 3, 'message_typed'),
            sendClicked: () => this.funnel('send_message', 4, 'send_clicked'),
            confirmed: () => this.funnel('send_message', 5, 'confirmed'),
            completed: () => this.funnel('send_message', 6, 'completed'),
            failed: (reason: string) => this.track('send_message_failed', { reason })
        },
        ipfsUpload: {
            started: () => this.funnel('ipfs_upload', 1, 'started'),
            uploading: () => this.funnel('ipfs_upload', 2, 'uploading'),
            pinning: () => this.funnel('ipfs_upload', 3, 'pinning'),
            completed: () => this.funnel('ipfs_upload', 4, 'completed'),
            failed: (reason: string) => this.track('ipfs_upload_failed', { reason })
        }
    }

    /**
     * Sanitize properties to prevent PII leakage
     */
    private sanitizeProperties(
        properties?: Record<string, string | number | boolean>
    ): Record<string, string | number | boolean> | undefined {
        if (!properties) return undefined

        const sanitized: Record<string, string | number | boolean> = {}

        for (const [key, value] of Object.entries(properties)) {
            // Skip potential PII fields
            if (this.isPotentialPII(key, value)) continue

            // Truncate long strings
            if (typeof value === 'string' && value.length > 100) {
                sanitized[key] = value.substring(0, 100) + '...'
            } else {
                sanitized[key] = value
            }
        }

        return sanitized
    }

    /**
     * Check if a field might contain PII
     */
    private isPotentialPII(key: string, value: unknown): boolean {
        const piiKeys = ['email', 'name', 'address', 'phone', 'ip', 'password', 'key', 'secret', 'token']
        const lowerKey = key.toLowerCase()

        if (piiKeys.some(pii => lowerKey.includes(pii))) return true

        // Check for wallet addresses (but allow truncated ones)
        if (typeof value === 'string' && value.startsWith('0x') && value.length > 20) {
            return true
        }

        return false
    }

    /**
     * Load queued events from storage
     */
    private loadQueuedEvents(): void {
        const stored = localStorage.getItem(EVENTS_KEY)
        if (stored) {
            try {
                this.queue = JSON.parse(stored)
            } catch {
                this.queue = []
            }
        }
    }

    /**
     * Save queued events to storage
     */
    private saveQueuedEvents(): void {
        // Limit stored events
        if (this.queue.length > MAX_STORED_EVENTS) {
            this.queue = this.queue.slice(-MAX_STORED_EVENTS)
        }
        localStorage.setItem(EVENTS_KEY, JSON.stringify(this.queue))
    }

    /**
     * Clean events older than retention period
     */
    private cleanOldEvents(): void {
        const cutoff = Date.now() - DATA_RETENTION_DAYS * 24 * 60 * 60 * 1000
        this.queue = this.queue.filter(e => e.timestamp > cutoff)
        this.saveQueuedEvents()
    }

    /**
     * Export all analytics data (for user data request)
     */
    exportData(): { config: AnalyticsConfig; events: AnalyticsEvent[] } {
        return {
            config: this.config,
            events: this.queue
        }
    }

    /**
     * Delete all analytics data
     */
    deleteAllData(): void {
        this.disable()
        localStorage.removeItem('inbox3_anonymous_id')
        localStorage.removeItem(STORAGE_KEY)
        localStorage.removeItem(EVENTS_KEY)

        // Reset config
        this.config = {
            enabled: false,
            anonymousId: getAnonymousId(),
            consentGiven: false
        }
    }
}

// Singleton instance
export const analytics = new Analytics()

export default analytics
