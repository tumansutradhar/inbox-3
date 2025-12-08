import { forwardRef } from 'react'
import { Button } from './Button'
import { Badge } from './Badge'

interface QueuedMessage {
    id: string
    content: string
    recipient: string
    timestamp: Date
    retryCount: number
    error?: string
}

interface OfflineQueueProps {
    messages: QueuedMessage[]
    onRetry?: (id: string) => void
    onRetryAll?: () => void
    onDiscard?: (id: string) => void
    onDiscardAll?: () => void
    isOnline?: boolean
    className?: string
}

/**
 * Offline queue UI component
 * Shows queued messages and sync status when offline
 */
export const OfflineQueue = forwardRef<HTMLDivElement, OfflineQueueProps>(
    (
        {
            messages,
            onRetry,
            onRetryAll,
            onDiscard,
            onDiscardAll,
            isOnline = false,
            className = ''
        },
        ref
    ) => {
        if (messages.length === 0) return null

        return (
            <div
                ref={ref}
                className={`bg-(--bg-tertiary) border border-(--border-default) rounded-xl p-4 ${className}`}
                role="region"
                aria-label="Offline message queue"
            >
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <svg
                            className="w-5 h-5 text-(--status-warning)"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <span className="font-medium text-(--text-primary)">
                            Queued Messages
                        </span>
                        <Badge variant="warning">{messages.length}</Badge>
                    </div>
                    <Badge variant={isOnline ? 'success' : 'danger'}>
                        {isOnline ? 'Online' : 'Offline'}
                    </Badge>
                </div>

                {!isOnline && (
                    <p className="text-sm text-(--text-secondary) mb-3">
                        Messages will be sent automatically when you're back online.
                    </p>
                )}

                <div className="space-y-2 max-h-48 overflow-y-auto">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className="flex items-center justify-between p-2 bg-(--bg-secondary) rounded-lg"
                        >
                            <div className="flex-1 min-w-0 mr-3">
                                <p className="text-sm text-(--text-primary) truncate">
                                    {msg.content}
                                </p>
                                <p className="text-xs text-(--text-muted)">
                                    To: {msg.recipient.slice(0, 8)}...{msg.recipient.slice(-6)}
                                </p>
                                {msg.error && (
                                    <p className="text-xs text-(--status-error) mt-1">
                                        {msg.error}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center gap-1">
                                {msg.retryCount > 0 && (
                                    <span className="text-xs text-(--text-muted)">
                                        Retry {msg.retryCount}
                                    </span>
                                )}
                                <button
                                    onClick={() => onRetry?.(msg.id)}
                                    className="p-1.5 text-(--text-secondary) hover:text-(--primary-brand) rounded-lg hover:bg-(--bg-tertiary)"
                                    title="Retry sending"
                                    disabled={!isOnline}
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => onDiscard?.(msg.id)}
                                    className="p-1.5 text-(--text-secondary) hover:text-(--status-error) rounded-lg hover:bg-(--bg-tertiary)"
                                    title="Discard message"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex gap-2 mt-3 pt-3 border-t border-(--border-default)">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={onRetryAll}
                        disabled={!isOnline}
                        className="flex-1"
                    >
                        Retry All
                    </Button>
                    <Button
                        variant="danger"
                        size="sm"
                        onClick={onDiscardAll}
                        className="flex-1"
                    >
                        Discard All
                    </Button>
                </div>
            </div>
        )
    }
)

OfflineQueue.displayName = 'OfflineQueue'

interface SyncStatusProps {
    status: 'synced' | 'syncing' | 'offline' | 'error'
    lastSync?: Date
    pendingCount?: number
    onSync?: () => void
    className?: string
}

/**
 * Sync status indicator
 * Shows current sync state and last sync time
 */
export function SyncStatus({
    status,
    lastSync,
    pendingCount = 0,
    onSync,
    className = ''
}: SyncStatusProps) {
    const getStatusDisplay = () => {
        switch (status) {
            case 'synced':
                return {
                    icon: (
                        <svg className="w-4 h-4 text-(--status-online)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    ),
                    text: 'Synced',
                    color: 'text-(--status-online)'
                }
            case 'syncing':
                return {
                    icon: (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    ),
                    text: 'Syncing...',
                    color: 'text-(--primary-brand)'
                }
            case 'offline':
                return {
                    icon: (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
                        </svg>
                    ),
                    text: 'Offline',
                    color: 'text-(--text-muted)'
                }
            case 'error':
                return {
                    icon: (
                        <svg className="w-4 h-4 text-(--status-error)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    ),
                    text: 'Sync error',
                    color: 'text-(--status-error)'
                }
        }
    }

    const formatLastSync = () => {
        if (!lastSync) return ''
        const now = new Date()
        const diff = now.getTime() - lastSync.getTime()
        const minutes = Math.floor(diff / 60000)

        if (minutes < 1) return 'Just now'
        if (minutes < 60) return `${minutes}m ago`
        return lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const { icon, text, color } = getStatusDisplay()

    return (
        <button
            onClick={onSync}
            disabled={status === 'syncing'}
            className={`inline-flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-(--bg-tertiary) transition-colors ${className}`}
            title={lastSync ? `Last sync: ${formatLastSync()}` : 'Click to sync'}
        >
            {icon}
            <span className={`text-xs ${color}`}>{text}</span>
            {pendingCount > 0 && (
                <Badge variant="warning" className="text-xs">
                    {pendingCount}
                </Badge>
            )}
        </button>
    )
}

export default OfflineQueue
