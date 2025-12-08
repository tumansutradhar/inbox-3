import { useMemo } from 'react'
import { Avatar } from './ui/Avatar'
import { Badge } from './ui/Badge'
import { Skeleton } from './ui/Loading'
import { EmptyState } from './ui/EmptyState'

export interface MessageItemData {
    id: string
    sender: string
    content: string
    timestamp: number
    read: boolean
    type?: 'text' | 'audio' | 'image' | 'file'
    encrypted?: boolean
    attachmentCount?: number
}

interface MessageListProps {
    messages: MessageItemData[]
    loading?: boolean
    selectedId?: string
    onSelect?: (message: MessageItemData) => void
    onMarkRead?: (id: string) => void
}

// Group messages by date
function groupMessagesByDate(messages: MessageItemData[]): Map<string, MessageItemData[]> {
    const groups = new Map<string, MessageItemData[]>()
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    messages.forEach((msg) => {
        const date = new Date(msg.timestamp * 1000)
        let key: string

        if (date.toDateString() === today.toDateString()) {
            key = 'Today'
        } else if (date.toDateString() === yesterday.toDateString()) {
            key = 'Yesterday'
        } else if (date.getFullYear() === today.getFullYear()) {
            key = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
        } else {
            key = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        }

        if (!groups.has(key)) {
            groups.set(key, [])
        }
        groups.get(key)!.push(msg)
    })

    return groups
}

function formatTime(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    })
}

function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength).trim() + '...'
}

function MessageSkeleton() {
    return (
        <div className="flex items-start gap-3 p-4">
            <Skeleton variant="circular" width={40} height={40} />
            <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                    <Skeleton width={120} height={14} />
                    <Skeleton width={60} height={12} />
                </div>
                <Skeleton width="80%" height={16} />
            </div>
        </div>
    )
}

export function MessageList({
    messages,
    loading = false,
    selectedId,
    onSelect,
    onMarkRead
}: MessageListProps) {
    const groupedMessages = useMemo(() => groupMessagesByDate(messages), [messages])
    const unreadCount = useMemo(() => messages.filter((m) => !m.read).length, [messages])

    if (loading) {
        return (
            <div className="divide-y divide-(--border-color)">
                {Array.from({ length: 5 }).map((_, i) => (
                    <MessageSkeleton key={i} />
                ))}
            </div>
        )
    }

    if (messages.length === 0) {
        return (
            <EmptyState
                icon={
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                }
                title="No messages yet"
                description="Your inbox is empty. Messages you receive will appear here."
            />
        )
    }

    return (
        <div className="flex flex-col">
            {/* Unread indicator */}
            {unreadCount > 0 && (
                <div className="sticky top-0 z-10 px-4 py-2 bg-(--bg-secondary)/80 backdrop-blur-sm border-b border-(--border-color)">
                    <Badge variant="primary" dot>
                        {unreadCount} unread message{unreadCount > 1 ? 's' : ''}
                    </Badge>
                </div>
            )}

            {/* Grouped messages */}
            {Array.from(groupedMessages.entries()).map(([date, msgs]) => (
                <div key={date}>
                    {/* Date separator */}
                    <div className="sticky top-0 z-[5] px-4 py-2 bg-(--bg-main)/95 backdrop-blur-sm">
                        <span className="text-xs font-medium text-(--text-muted) uppercase tracking-wider">
                            {date}
                        </span>
                    </div>

                    {/* Messages */}
                    <div className="divide-y divide-(--border-color)">
                        {msgs.map((msg) => (
                            <button
                                key={msg.id}
                                onClick={() => {
                                    onSelect?.(msg)
                                    if (!msg.read) onMarkRead?.(msg.id)
                                }}
                                className={`
                  w-full flex items-start gap-3 p-4 text-left
                  transition-colors duration-150
                  hover:bg-(--bg-hover) focus:bg-(--bg-hover) focus:outline-none
                  ${selectedId === msg.id ? 'bg-(--bg-active)' : ''}
                  ${!msg.read ? 'bg-(--primary-brand-light)/30' : ''}
                `}
                            >
                                {/* Avatar */}
                                <div className="relative flex-shrink-0">
                                    <Avatar address={msg.sender} size="md" />
                                    {!msg.read && (
                                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-(--primary-brand) rounded-full ring-2 ring-(--bg-card)" />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <span
                                            className={`text-sm font-medium truncate ${!msg.read ? 'text-(--text-primary)' : 'text-(--text-secondary)'
                                                }`}
                                        >
                                            {msg.sender.slice(0, 6)}...{msg.sender.slice(-4)}
                                        </span>
                                        <span className="flex-shrink-0 text-xs text-(--text-muted)">
                                            {formatTime(msg.timestamp)}
                                        </span>
                                    </div>
                                    <p
                                        className={`text-sm truncate ${!msg.read ? 'text-(--text-primary) font-medium' : 'text-(--text-secondary)'
                                            }`}
                                    >
                                        {truncate(msg.content, 60)}
                                    </p>

                                    {/* Meta info */}
                                    <div className="flex items-center gap-2 mt-1.5">
                                        {msg.encrypted && (
                                            <span className="inline-flex items-center gap-1 text-[10px] text-(--success-green)">
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                                </svg>
                                                E2EE
                                            </span>
                                        )}
                                        {msg.type === 'audio' && (
                                            <span className="inline-flex items-center gap-1 text-[10px] text-(--text-muted)">
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                                                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                                                </svg>
                                                Audio
                                            </span>
                                        )}
                                        {msg.attachmentCount && msg.attachmentCount > 0 && (
                                            <span className="inline-flex items-center gap-1 text-[10px] text-(--text-muted)">
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                                                </svg>
                                                {msg.attachmentCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}
