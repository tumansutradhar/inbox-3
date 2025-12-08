import { Tooltip } from './ui/Tooltip'
import { Badge } from './ui/Badge'

export type EncryptionStatus = 'encrypted' | 'unencrypted' | 'signed' | 'failed'

interface EncryptionIndicatorProps {
  status: EncryptionStatus
  tooltip?: string
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

export function EncryptionIndicator({
  status,
  tooltip,
  size = 'md',
  showLabel = false,
  className = ''
}: EncryptionIndicatorProps) {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const config = {
    encrypted: {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      label: 'End-to-end encrypted',
      defaultTooltip: 'This message is end-to-end encrypted. Only you and the recipient can read it.'
    },
    unencrypted: {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 9.9-1" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      ),
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      label: 'Not encrypted',
      defaultTooltip: 'This message is not encrypted and may be visible to others.'
    },
    signed: {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      ),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      label: 'Digitally signed',
      defaultTooltip: 'This message is cryptographically signed to verify authenticity.'
    },
    failed: {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      ),
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      label: 'Encryption failed',
      defaultTooltip: 'Could not encrypt or verify this message. It may have been tampered with.'
    }
  }

  const current = config[status]
  const displayTooltip = tooltip || current.defaultTooltip

  return (
    <Tooltip content={displayTooltip}>
      <div
        className={`
          inline-flex items-center gap-1.5 px-2 py-1 rounded-md border
          ${current.bgColor} ${current.borderColor} ${current.color}
          ${className}
        `}
        role="status"
        aria-label={current.label}
      >
        <span className={`${sizeMap[size]} shrink-0`}>
          {current.icon}
        </span>
        {showLabel && (
          <span className="text-xs font-medium whitespace-nowrap">
            {current.label}
          </span>
        )}
      </div>
    </Tooltip>
  )
}

// Compact version for inline use in messages
export function CompactEncryptionBadge({ status }: { status: EncryptionStatus }) {
  if (status === 'encrypted') {
    return (
      <Badge variant="success" size="sm">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </Badge>
    )
  }
  return null
}

// Security explanation modal trigger
interface SecurityExplanationProps {
  onLearnMore?: () => void
}

export function SecurityExplanation({ onLearnMore }: SecurityExplanationProps) {
  return (
    <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
      <div className="shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-blue-900 mb-1">
          Your messages are protected
        </h4>
        <p className="text-sm text-blue-800 mb-2">
          Inbox3 uses end-to-end encryption to keep your conversations private. Your encryption keys are stored locally in your browser and never leave your device.
        </p>
        {onLearnMore && (
          <button
            onClick={onLearnMore}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 underline"
          >
            Learn more about encryption
          </button>
        )}
      </div>
    </div>
  )
}

// Destructive action confirmation component
interface DestructiveActionProps {
  title: string
  description: string
  actionLabel: string
  onConfirm: () => void
  onCancel: () => void
  isOpen: boolean
}

export function DestructiveActionConfirm({
  title,
  description,
  actionLabel,
  onConfirm,
  onCancel,
  isOpen
}: DestructiveActionProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-(--z-modal) flex items-center justify-center p-4 bg-black/50 animate-fade-in">
      <div
        className="bg-(--bg-card) rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4"
        role="alertdialog"
        aria-labelledby="destructive-title"
        aria-describedby="destructive-description"
      >
        {/* Warning Icon */}
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>

        {/* Title */}
        <h3
          id="destructive-title"
          className="text-xl font-bold text-(--text-primary) text-center"
        >
          {title}
        </h3>

        {/* Description */}
        <p
          id="destructive-description"
          className="text-sm text-(--text-secondary) text-center"
        >
          {description}
        </p>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl font-medium text-(--text-primary) bg-(--bg-secondary) hover:bg-(--bg-tertiary) transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
