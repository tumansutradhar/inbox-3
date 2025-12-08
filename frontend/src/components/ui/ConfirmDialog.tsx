/**
 * ConfirmDialog - Confirmation modal for destructive actions
 * Used for delete, revoke, and other irreversible operations
 */

import { Modal } from './Modal'
import { Button } from './Button'
import { IconAlertTriangle } from './Icons'

export interface ConfirmDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    description: string
    confirmLabel?: string
    cancelLabel?: string
    variant?: 'danger' | 'warning' | 'info'
    loading?: boolean
    consequences?: string[]
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'danger',
    loading = false,
    consequences
}: ConfirmDialogProps) {
    const iconColors = {
        danger: 'text-(--error-red)',
        warning: 'text-(--warning-yellow)',
        info: 'text-(--info-blue)',
    }

    const bgColors = {
        danger: 'bg-(--error-light)',
        warning: 'bg-(--warning-light)',
        info: 'bg-(--info-light)',
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size="sm"
            closeOnOverlayClick={!loading}
            closeOnEscape={!loading}
        >
            <div className="space-y-4">
                {/* Icon and description */}
                <div className="flex items-start gap-4">
                    <div className={`shrink-0 p-3 rounded-full ${bgColors[variant]}`}>
                        <IconAlertTriangle size="lg" className={iconColors[variant]} />
                    </div>
                    <div>
                        <p className="text-sm text-(--text-secondary)">{description}</p>
                    </div>
                </div>

                {/* Consequences list */}
                {consequences && consequences.length > 0 && (
                    <div className={`p-3 rounded-xl ${bgColors[variant]} border border-opacity-20`}>
                        <p className="text-xs font-semibold text-(--text-primary) mb-2 uppercase tracking-wider">
                            This action will:
                        </p>
                        <ul className="space-y-1">
                            {consequences.map((consequence, index) => (
                                <li
                                    key={index}
                                    className="text-sm text-(--text-secondary) flex items-start gap-2"
                                >
                                    <span className="text-(--text-muted)">•</span>
                                    {consequence}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={loading}
                        fullWidth
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        variant={variant === 'danger' ? 'danger' : 'primary'}
                        onClick={onConfirm}
                        loading={loading}
                        fullWidth
                    >
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}

export default ConfirmDialog
