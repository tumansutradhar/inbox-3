import { useState, useEffect } from 'react'

interface TypingIndicatorProps {
    typingUsers?: string[]
    className?: string
}

export function TypingIndicator({ typingUsers = [], className = '' }: TypingIndicatorProps) {
    if (typingUsers.length === 0) return null

    const formatTypingText = () => {
        if (typingUsers.length === 1) {
            const addr = typingUsers[0]
            return `${addr.slice(0, 6)}...${addr.slice(-4)} is typing`
        }
        if (typingUsers.length === 2) {
            return `${typingUsers.length} people are typing`
        }
        return `Several people are typing`
    }

    return (
        <div className={`flex items-center gap-2 px-4 py-2 ${className}`}>
            <div className="flex gap-0.5">
                <span className="w-1.5 h-1.5 bg-(--text-muted) rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-(--text-muted) rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-(--text-muted) rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-xs text-(--text-muted)">{formatTypingText()}</span>
        </div>
    )
}

interface ConnectionStatusBannerProps {
    status: 'connected' | 'connecting' | 'disconnected' | 'error'
    onRetry?: () => void
}

export function ConnectionStatusBanner({ status, onRetry }: ConnectionStatusBannerProps) {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        if (status !== 'connected') {
            setVisible(true)
        } else {
            // Delay hiding the banner to show "Connected" briefly
            const timer = setTimeout(() => setVisible(false), 2000)
            return () => clearTimeout(timer)
        }
    }, [status])

    if (!visible) return null

    const config = {
        connected: {
            bg: 'bg-(--success-green)',
            text: 'Connected',
            icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 6L9 17l-5-5" />
                </svg>
            )
        },
        connecting: {
            bg: 'bg-(--warning-yellow)',
            text: 'Connecting...',
            icon: (
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 11-6.219-8.56" />
                </svg>
            )
        },
        disconnected: {
            bg: 'bg-(--text-muted)',
            text: 'Disconnected',
            icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="1" y1="1" x2="23" y2="23" />
                    <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
                    <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
                    <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
                    <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
                    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                    <line x1="12" y1="20" x2="12.01" y2="20" />
                </svg>
            )
        },
        error: {
            bg: 'bg-(--error-red)',
            text: 'Connection error',
            icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
            )
        }
    }

    const current = config[status]

    return (
        <div
            className={`
        flex items-center justify-center gap-2 px-4 py-2
        text-white text-sm font-medium
        ${current.bg}
        animate-slide-down
      `}
        >
            {current.icon}
            <span>{current.text}</span>
            {(status === 'disconnected' || status === 'error') && onRetry && (
                <button
                    onClick={onRetry}
                    className="ml-2 underline hover:no-underline text-white/80 hover:text-white"
                >
                    Retry
                </button>
            )}
        </div>
    )
}

interface PresenceIndicatorProps {
    status: 'online' | 'offline' | 'away'
    lastSeen?: number // Unix timestamp
    showLabel?: boolean
    size?: 'sm' | 'md'
}

export function PresenceIndicator({
    status,
    lastSeen,
    showLabel = true,
    size = 'md'
}: PresenceIndicatorProps) {
    const formatLastSeen = () => {
        if (!lastSeen) return 'Offline'

        const now = Date.now()
        const diff = now - lastSeen * 1000
        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(diff / 3600000)
        const days = Math.floor(diff / 86400000)

        if (minutes < 1) return 'Just now'
        if (minutes < 60) return `${minutes}m ago`
        if (hours < 24) return `${hours}h ago`
        if (days < 7) return `${days}d ago`
        return new Date(lastSeen * 1000).toLocaleDateString()
    }

    const statusConfig = {
        online: {
            color: 'bg-(--success-green)',
            label: 'Online'
        },
        offline: {
            color: 'bg-(--text-muted)',
            label: formatLastSeen()
        },
        away: {
            color: 'bg-(--warning-yellow)',
            label: 'Away'
        }
    }

    const config = statusConfig[status]
    const dotSize = size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5'

    return (
        <div className="flex items-center gap-1.5">
            <span className={`${dotSize} rounded-full ${config.color}`} />
            {showLabel && (
                <span className="text-xs text-(--text-muted)">{config.label}</span>
            )}
        </div>
    )
}

// CSS for slide-down animation (add to index.css)
// @keyframes slide-down {
//   from { transform: translateY(-100%); }
//   to { transform: translateY(0); }
// }
// .animate-slide-down { animation: slide-down 0.3s ease-out; }
