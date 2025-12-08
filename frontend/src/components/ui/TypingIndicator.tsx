import { forwardRef } from 'react'

interface TypingIndicatorProps {
    users?: string[]
    className?: string
}

/**
 * Animated typing indicator with user names
 * Shows "X is typing..." or "X, Y are typing..."
 */
export const TypingIndicator = forwardRef<HTMLDivElement, TypingIndicatorProps>(
    ({ users = [], className = '' }, ref) => {
        if (users.length === 0) return null

        const formatTypingText = () => {
            if (users.length === 1) {
                return `${users[0]} is typing`
            } else if (users.length === 2) {
                return `${users[0]} and ${users[1]} are typing`
            } else {
                return `${users[0]} and ${users.length - 1} others are typing`
            }
        }

        return (
            <div
                ref={ref}
                className={`flex items-center gap-2 text-sm text-(--text-secondary) ${className}`}
                role="status"
                aria-live="polite"
                aria-label={`${formatTypingText()}`}
            >
                <div className="flex gap-1">
                    <span
                        className="w-2 h-2 rounded-full bg-(--primary-brand) animate-bounce"
                        style={{ animationDelay: '0ms' }}
                    />
                    <span
                        className="w-2 h-2 rounded-full bg-(--primary-brand) animate-bounce"
                        style={{ animationDelay: '150ms' }}
                    />
                    <span
                        className="w-2 h-2 rounded-full bg-(--primary-brand) animate-bounce"
                        style={{ animationDelay: '300ms' }}
                    />
                </div>
                <span className="text-xs">{formatTypingText()}</span>
            </div>
        )
    }
)

TypingIndicator.displayName = 'TypingIndicator'

interface PresenceIndicatorProps {
    status: 'online' | 'away' | 'busy' | 'offline'
    lastSeen?: Date
    size?: 'sm' | 'md' | 'lg'
    showLabel?: boolean
    className?: string
}

const statusConfig = {
    online: {
        color: 'bg-(--status-online)',
        label: 'Online',
        pulse: true
    },
    away: {
        color: 'bg-(--status-warning)',
        label: 'Away',
        pulse: false
    },
    busy: {
        color: 'bg-(--status-error)',
        label: 'Do not disturb',
        pulse: false
    },
    offline: {
        color: 'bg-(--text-muted)',
        label: 'Offline',
        pulse: false
    }
}

const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
}

/**
 * User presence status indicator
 * Shows online/away/busy/offline with optional last seen time
 */
export const PresenceIndicator = forwardRef<HTMLDivElement, PresenceIndicatorProps>(
    ({ status, lastSeen, size = 'md', showLabel = false, className = '' }, ref) => {
        const config = statusConfig[status]

        const formatLastSeen = () => {
            if (!lastSeen) return ''
            const now = new Date()
            const diff = now.getTime() - lastSeen.getTime()
            const minutes = Math.floor(diff / 60000)
            const hours = Math.floor(diff / 3600000)
            const days = Math.floor(diff / 86400000)

            if (minutes < 1) return 'Just now'
            if (minutes < 60) return `${minutes}m ago`
            if (hours < 24) return `${hours}h ago`
            return `${days}d ago`
        }

        return (
            <div
                ref={ref}
                className={`inline-flex items-center gap-1.5 ${className}`}
                title={status === 'offline' && lastSeen ? `Last seen ${formatLastSeen()}` : config.label}
            >
                <span className="relative flex">
                    <span className={`${sizeClasses[size]} rounded-full ${config.color}`} />
                    {config.pulse && (
                        <span
                            className={`absolute inset-0 ${sizeClasses[size]} rounded-full ${config.color} animate-ping opacity-75`}
                        />
                    )}
                </span>
                {showLabel && (
                    <span className="text-xs text-(--text-secondary)">
                        {status === 'offline' && lastSeen ? formatLastSeen() : config.label}
                    </span>
                )}
            </div>
        )
    }
)

PresenceIndicator.displayName = 'PresenceIndicator'

interface MessageDeliveryStatusProps {
    status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
    timestamp?: Date
    className?: string
}

/**
 * Message delivery status indicator
 * Shows sending, sent, delivered, read status with icons
 */
export function MessageDeliveryStatus({
    status,
    timestamp,
    className = ''
}: MessageDeliveryStatusProps) {
    const getStatusIcon = () => {
        switch (status) {
            case 'sending':
                return (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                )
            case 'sent':
                return (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                )
            case 'delivered':
                return (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 13l4 4L26 7" transform="translate(-7, 0)" />
                    </svg>
                )
            case 'read':
                return (
                    <svg className="w-4 h-4 text-(--primary-brand)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 13l4 4L26 7" transform="translate(-7, 0)" />
                    </svg>
                )
            case 'failed':
                return (
                    <svg className="w-4 h-4 text-(--status-error)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                )
        }
    }

    const getStatusLabel = () => {
        switch (status) {
            case 'sending':
                return 'Sending...'
            case 'sent':
                return 'Sent'
            case 'delivered':
                return 'Delivered'
            case 'read':
                return 'Read'
            case 'failed':
                return 'Failed to send'
        }
    }

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    return (
        <div
            className={`inline-flex items-center gap-1 text-(--text-muted) ${className}`}
            title={getStatusLabel()}
        >
            {timestamp && (
                <span className="text-xs">{formatTime(timestamp)}</span>
            )}
            {getStatusIcon()}
        </div>
    )
}

export default TypingIndicator
