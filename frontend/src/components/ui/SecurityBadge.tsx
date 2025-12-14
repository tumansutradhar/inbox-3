/**
 * SecurityBadge - Visual indicators for encryption and security status
 * Shows E2EE status, signed messages, and key verification
 */

import { Tooltip } from './Tooltip'
import { IconLock, IconUnlock, IconShield, IconShieldCheck, IconKey, IconAlertTriangle } from './Icons'

export interface SecurityBadgeProps {
    type: 'encrypted' | 'unencrypted' | 'signed' | 'verified' | 'warning'
    showLabel?: boolean
    size?: 'sm' | 'md'
    className?: string
    tooltip?: string
}

const securityConfig = {
    encrypted: {
        icon: IconLock,
        label: 'End-to-End Encrypted',
        color: 'text-(--success-green)',
        bgColor: 'bg-(--success-light)',
        defaultTooltip: 'This message is end-to-end encrypted. Only you and the recipient can read it.',
    },
    unencrypted: {
        icon: IconUnlock,
        label: 'Not Encrypted',
        color: 'text-(--text-muted)',
        bgColor: 'bg-(--bg-secondary)',
        defaultTooltip: 'This message is not encrypted and can be read by others.',
    },
    signed: {
        icon: IconShield,
        label: 'Digitally Signed',
        color: 'text-(--info-blue)',
        bgColor: 'bg-(--info-light)',
        defaultTooltip: 'This message has been digitally signed by the sender.',
    },
    verified: {
        icon: IconShieldCheck,
        label: 'Verified',
        color: 'text-(--success-green)',
        bgColor: 'bg-(--success-light)',
        defaultTooltip: 'The sender\'s identity has been verified.',
    },
    warning: {
        icon: IconAlertTriangle,
        label: 'Security Warning',
        color: 'text-(--warning-yellow)',
        bgColor: 'bg-(--warning-light)',
        defaultTooltip: 'There is a security concern with this message.',
    },
}

export function SecurityBadge({
    type,
    showLabel = false,
    size = 'sm',
    className = '',
    tooltip
}: SecurityBadgeProps) {
    const config = securityConfig[type]
    const Icon = config.icon
    const iconSize = size === 'sm' ? 'xs' : 'sm'

    const badge = (
        <span
            className={`
                inline-flex items-center gap-1
                ${size === 'sm' ? 'text-[10px]' : 'text-xs'}
                font-medium rounded-full
                ${config.color} ${config.bgColor}
                ${showLabel ? (size === 'sm' ? 'px-1.5 py-0.5' : 'px-2 py-1') : 'p-1'}
                ${className}
            `}
        >
            <Icon size={iconSize} />
            {showLabel && <span>{config.label}</span>}
        </span>
    )

    return (
        <Tooltip content={tooltip || config.defaultTooltip} position="top">
            {badge}
        </Tooltip>
    )
}

/**
 * EncryptionExplainer - Explains how encryption works in plain language
 */
export interface EncryptionExplainerProps {
    className?: string
}

export function EncryptionExplainer({ className = '' }: EncryptionExplainerProps) {
    return (
        <div className={`p-4 rounded-xl bg-(--bg-secondary) border border-(--border-color) ${className}`}>
            <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-(--success-light)">
                    <IconLock size="md" className="text-(--success-green)" />
                </div>
                <h4 className="font-semibold text-(--text-primary)">End-to-End Encryption</h4>
            </div>

            <div className="space-y-3 text-sm text-(--text-secondary)">
                <p>
                    Your messages are encrypted before they leave your device. Only you and the
                    recipient can read them.
                </p>

                <div className="space-y-2">
                    <div className="flex items-start gap-2">
                        <IconKey size="sm" className="text-(--text-muted) shrink-0 mt-0.5" />
                        <p>
                            <strong className="text-(--text-primary)">Your keys stay with you.</strong>{' '}
                            Encryption keys are stored locally on your device and never leave it.
                        </p>
                    </div>

                    <div className="flex items-start gap-2">
                        <IconShieldCheck size="sm" className="text-(--text-muted) shrink-0 mt-0.5" />
                        <p>
                            <strong className="text-(--text-primary)">Nobody can intercept.</strong>{' '}
                            Not even us, your network provider, or anyone else can read your messages.
                        </p>
                    </div>
                </div>

                <a
                    href="https://docs.inbox3.io/security/encryption"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-(--primary-brand) hover:underline text-xs"
                >
                    Learn more about security
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                </a>
            </div>
        </div>
    )
}

/**
 * KeyBackupReminder - Prompts users to back up their keys
 */
export interface KeyBackupReminderProps {
    onBackup: () => void
    onDismiss?: () => void
    className?: string
}

export function KeyBackupReminder({ onBackup, onDismiss, className = '' }: KeyBackupReminderProps) {
    return (
        <div className={`p-4 rounded-xl bg-(--warning-light) border border-(--warning-yellow)/20 ${className}`}>
            <div className="flex items-start gap-3">
                <div className="shrink-0 p-2 rounded-lg bg-(--warning-yellow)/20">
                    <IconKey size="md" className="text-(--warning-yellow)" />
                </div>
                <div className="flex-1">
                    <h4 className="font-semibold text-(--text-primary) mb-1">Back up your recovery key</h4>
                    <p className="text-sm text-(--text-secondary) mb-3">
                        If you lose access to this device, you'll need your recovery key to restore
                        your encrypted messages.
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onBackup}
                            className="px-3 py-1.5 text-sm font-medium rounded-lg bg-(--primary-brand) text-white hover:bg-(--primary-brand-hover) transition-colors"
                        >
                            Back up now
                        </button>
                        {onDismiss && (
                            <button
                                onClick={onDismiss}
                                className="px-3 py-1.5 text-sm font-medium rounded-lg text-(--text-secondary) hover:bg-(--bg-secondary) transition-colors"
                            >
                                Later
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SecurityBadge
