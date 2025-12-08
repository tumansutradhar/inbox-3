export interface StatusIndicatorProps {
    status: 'online' | 'offline' | 'connecting' | 'error'
    label?: string
    showLabel?: boolean
    pulse?: boolean
    size?: 'sm' | 'md'
    className?: string
}

export function StatusIndicator({
    status,
    label,
    showLabel = true,
    pulse = true,
    size = 'md',
    className = ''
}: StatusIndicatorProps) {
    const statusConfig = {
        online: {
            color: 'bg-(--success-green)',
            label: label || 'Connected',
            textColor: 'text-(--success-green)'
        },
        offline: {
            color: 'bg-(--text-muted)',
            label: label || 'Offline',
            textColor: 'text-(--text-muted)'
        },
        connecting: {
            color: 'bg-(--warning-yellow)',
            label: label || 'Connecting...',
            textColor: 'text-(--warning-yellow)'
        },
        error: {
            color: 'bg-(--error-red)',
            label: label || 'Error',
            textColor: 'text-(--error-red)'
        }
    }

    const config = statusConfig[status]
    const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'

    return (
        <div
            className={`inline-flex items-center gap-2 ${className}`}
            role="status"
            aria-label={config.label}
        >
            <span className="relative flex">
                <span className={`${dotSize} rounded-full ${config.color}`} />
                {pulse && status === 'online' && (
                    <span
                        className={`
              absolute inset-0 rounded-full ${config.color} opacity-75
              animate-ping
            `}
                    />
                )}
            </span>
            {showLabel && (
                <span className={`text-xs font-medium ${config.textColor}`}>
                    {config.label}
                </span>
            )}
        </div>
    )
}
