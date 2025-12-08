import { forwardRef } from 'react'

export interface DateSeparatorProps {
    date: Date
    className?: string
}

/**
 * Date separator for grouping messages by date
 * Shows a horizontal line with the date in the middle
 */
export const DateSeparator = forwardRef<HTMLDivElement, DateSeparatorProps>(
    ({ date, className = '' }, ref) => {
        const formatDate = (d: Date): string => {
            const now = new Date()
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            const yesterday = new Date(today.getTime() - 86400000)
            const messageDate = new Date(d.getFullYear(), d.getMonth(), d.getDate())

            if (messageDate.getTime() === today.getTime()) {
                return 'Today'
            } else if (messageDate.getTime() === yesterday.getTime()) {
                return 'Yesterday'
            } else if (now.getTime() - messageDate.getTime() < 7 * 86400000) {
                return d.toLocaleDateString(undefined, { weekday: 'long' })
            } else if (now.getFullYear() === d.getFullYear()) {
                return d.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })
            } else {
                return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
            }
        }

        return (
            <div
                ref={ref}
                className={`flex items-center gap-4 py-4 ${className}`}
                role="separator"
                aria-label={formatDate(date)}
            >
                <div className="flex-1 h-px bg-(--border-default)" />
                <span className="text-xs font-medium text-(--text-muted) px-2 py-1 bg-(--bg-secondary) rounded-full">
                    {formatDate(date)}
                </span>
                <div className="flex-1 h-px bg-(--border-default)" />
            </div>
        )
    }
)

DateSeparator.displayName = 'DateSeparator'

export interface UnreadSeparatorProps {
    count: number
    className?: string
}

/**
 * Unread messages separator
 * Shows a marker for new/unread messages
 */
export const UnreadSeparator = forwardRef<HTMLDivElement, UnreadSeparatorProps>(
    ({ count, className = '' }, ref) => {
        return (
            <div
                ref={ref}
                className={`flex items-center gap-4 py-3 ${className}`}
                role="separator"
                aria-label={`${count} new message${count === 1 ? '' : 's'}`}
            >
                <div className="flex-1 h-px bg-(--status-error)" />
                <span className="text-xs font-medium text-(--status-error) px-3 py-1 bg-red-50 dark:bg-red-900/20 rounded-full">
                    {count} new message{count === 1 ? '' : 's'}
                </span>
                <div className="flex-1 h-px bg-(--status-error)" />
            </div>
        )
    }
)

UnreadSeparator.displayName = 'UnreadSeparator'

/**
 * Helper to group messages by date
 */
export interface Message {
    id: string
    timestamp: number | Date
    [key: string]: unknown
}

export interface GroupedMessages<T extends Message> {
    date: Date
    messages: T[]
}

export function groupMessagesByDate<T extends Message>(messages: T[]): GroupedMessages<T>[] {
    const groups: Map<string, T[]> = new Map()

    for (const message of messages) {
        const date = new Date(message.timestamp)
        const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`

        if (!groups.has(dateKey)) {
            groups.set(dateKey, [])
        }
        groups.get(dateKey)!.push(message)
    }

    return Array.from(groups.entries()).map(([key, msgs]) => {
        const [year, month, day] = key.split('-').map(Number)
        return {
            date: new Date(year, month, day),
            messages: msgs
        }
    })
}

/**
 * Find the index where unread messages start
 */
export function findUnreadIndex<T extends Message & { read?: boolean }>(
    messages: T[]
): number {
    for (let i = 0; i < messages.length; i++) {
        if (!messages[i].read) {
            return i
        }
    }
    return -1
}

export default DateSeparator
