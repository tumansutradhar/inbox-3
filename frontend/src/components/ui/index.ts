// Inbox3 Design System - Reusable UI Components
// Export all UI components from this file

// Core components
export { Button, type ButtonProps } from './Button'
export { Input, Textarea, type InputProps, type TextareaProps } from './Input'
export { Modal, type ModalProps } from './Modal'
export { Card, type CardProps } from './Card'
export { Avatar, type AvatarProps } from './Avatar'
export { Tooltip, type TooltipProps } from './Tooltip'
export { Badge, type BadgeProps } from './Badge'
export { Spinner, Skeleton, type SpinnerProps } from './Loading'
export { EmptyState, type EmptyStateProps } from './EmptyState'
export { StatusIndicator, type StatusIndicatorProps } from './StatusIndicator'
export { IconButton, type IconButtonProps } from './IconButton'

// Accessibility
export { SkipLink } from './SkipLink'

// Icons
export * from './Icons'

// Feedback & Notifications
export { ToastProvider, useToast, useToastNotification, type Toast } from './Toast'
export { ConfirmDialog, type ConfirmDialogProps } from './ConfirmDialog'
export { TransactionStatus, type TransactionStepInfo, type GasEstimate, type PermissionInfo } from './TransactionStatus'

// Security
export { SecurityBadge, EncryptionExplainer, KeyBackupReminder, type SecurityBadgeProps } from './SecurityBadge'

// Virtualization & Performance
export { VirtualList, InfiniteScroll, Pagination, type VirtualListProps, type InfiniteScrollProps, type PaginationProps } from './VirtualList'

// Presence & Status
export { TypingIndicator, PresenceIndicator, MessageDeliveryStatus } from './TypingIndicator'
export { OfflineQueue, SyncStatus } from './OfflineQueue'

// Illustrations
export {
    EmptyInboxIllustration,
    NoResultsIllustration,
    ErrorIllustration,
    OfflineIllustration,
    SecureIllustration,
    WelcomeIllustration
} from './Illustrations'

