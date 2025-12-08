/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect, useCallback } from 'react'

interface UnreadBadgeProps {
    count: number
    showZero?: boolean
    size?: 'sm' | 'md' | 'lg'
    animate?: boolean
}

export function UnreadBadge({ count, showZero = false, size = 'md', animate = true }: UnreadBadgeProps) {
    const [isAnimating, setIsAnimating] = useState(false)
    const [displayCount, setDisplayCount] = useState(count)

    useEffect(() => {
        if (count !== displayCount) {
            if (animate && count > displayCount) {
                setIsAnimating(true)
                setTimeout(() => setIsAnimating(false), 300)
            }
            setDisplayCount(count)
        }
    }, [count, displayCount, animate])

    if (count === 0 && !showZero) return null

    const sizeClasses = {
        sm: 'min-w-[16px] h-4 text-[10px] px-1',
        md: 'min-w-[20px] h-5 text-xs px-1.5',
        lg: 'min-w-[24px] h-6 text-sm px-2'
    }

    return (
        <span
            className={`inline-flex items-center justify-center bg-red-500 text-white font-bold rounded-full ${sizeClasses[size]} ${isAnimating ? 'animate-bounce' : ''
                }`}
        >
            {count > 99 ? '99+' : count}
        </span>
    )
}

// Hook for managing unread counts
export function useUnreadMessages() {
    const [unreadDM, setUnreadDM] = useState(0)
    const [unreadGroups, setUnreadGroups] = useState<Record<string, number>>({})
    const [lastReadTimestamps, setLastReadTimestamps] = useState<Record<string, number>>(() => {
        const saved = localStorage.getItem('inbox3_last_read')
        return saved ? JSON.parse(saved) : {}
    })

    // Persist last read timestamps
    useEffect(() => {
        localStorage.setItem('inbox3_last_read', JSON.stringify(lastReadTimestamps))
    }, [lastReadTimestamps])

    const markAsRead = useCallback((type: 'dm' | 'group', groupId?: string) => {
        const now = Date.now()
        if (type === 'dm') {
            setLastReadTimestamps(prev => ({ ...prev, dm: now }))
            setUnreadDM(0)
        } else if (groupId) {
            setLastReadTimestamps(prev => ({ ...prev, [groupId]: now }))
            setUnreadGroups(prev => ({ ...prev, [groupId]: 0 }))
        }
    }, [])

    const updateUnreadCount = useCallback((type: 'dm' | 'group', count: number, groupId?: string) => {
        if (type === 'dm') {
            setUnreadDM(count)
        } else if (groupId) {
            setUnreadGroups(prev => ({ ...prev, [groupId]: count }))
        }
    }, [])

    const totalUnread = unreadDM + Object.values(unreadGroups).reduce((a, b) => a + b, 0)

    return {
        unreadDM,
        unreadGroups,
        totalUnread,
        lastReadTimestamps,
        markAsRead,
        updateUnreadCount
    }
}

interface MessageStatusProps {
    status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
    showLabel?: boolean
}

export function MessageStatus({ status, showLabel = false }: MessageStatusProps) {
    const configs = {
        sending: {
            icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
                    <circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="20" />
                </svg>
            ),
            label: 'Sending...',
            color: 'text-(--text-muted)'
        },
        sent: {
            icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            ),
            label: 'Sent',
            color: 'text-(--text-muted)'
        },
        delivered: {
            icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                    <polyline points="20 12 9 23 4 18" />
                </svg>
            ),
            label: 'Delivered',
            color: 'text-(--text-secondary)'
        },
        read: {
            icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                    <polyline points="20 12 9 23 4 18" />
                </svg>
            ),
            label: 'Read',
            color: 'text-blue-500'
        },
        failed: {
            icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
            ),
            label: 'Failed',
            color: 'text-red-500'
        }
    }

    const config = configs[status]

    return (
        <span className={`inline-flex items-center gap-1 ${config.color}`}>
            {config.icon}
            {showLabel && <span className="text-xs">{config.label}</span>}
        </span>
    )
}

interface TypingIndicatorProps {
    users?: string[]
}

export function TypingIndicator({ users = [] }: TypingIndicatorProps) {
    if (users.length === 0) return null

    const displayText = users.length === 1
        ? `${users[0].slice(0, 6)}... is typing`
        : users.length === 2
            ? `${users[0].slice(0, 6)}... and ${users[1].slice(0, 6)}... are typing`
            : `${users.length} people are typing`

    return (
        <div className="flex items-center gap-2 text-xs text-(--text-muted) py-2 px-3">
            <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-(--text-muted) rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-(--text-muted) rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-(--text-muted) rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span>{displayText}</span>
        </div>
    )
}

interface OnlineStatusProps {
    isOnline?: boolean
    lastSeen?: number
    size?: 'sm' | 'md' | 'lg'
}

export function OnlineStatus({ isOnline = false, lastSeen, size = 'md' }: OnlineStatusProps) {
    const sizeClasses = {
        sm: 'w-2 h-2',
        md: 'w-3 h-3',
        lg: 'w-4 h-4'
    }

    const formatLastSeen = (timestamp: number) => {
        const diff = Date.now() - timestamp
        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(diff / 3600000)
        const days = Math.floor(diff / 86400000)

        if (minutes < 1) return 'Just now'
        if (minutes < 60) return `${minutes}m ago`
        if (hours < 24) return `${hours}h ago`
        return `${days}d ago`
    }

    return (
        <div className="flex items-center gap-1.5">
            <span
                className={`${sizeClasses[size]} rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-(--text-muted)'
                    }`}
            />
            {lastSeen && !isOnline && (
                <span className="text-xs text-(--text-muted)">
                    {formatLastSeen(lastSeen)}
                </span>
            )}
        </div>
    )
}
