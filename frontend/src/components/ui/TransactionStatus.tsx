/**
 * TransactionStatus - Enhanced transaction feedback with human-readable info
 * Shows gas estimates, permission explanations, and step-by-step progress
 */

import { Modal } from './Modal'
import { Button } from './Button'
import { Spinner } from './Loading'
import { IconCheckCircle, IconAlertCircle, IconExternalLink, IconShieldCheck, IconKey } from './Icons'

export interface TransactionStepInfo {
    id: string
    label: string
    description?: string
    status: 'pending' | 'active' | 'completed' | 'error'
}

export interface GasEstimate {
    estimatedGas: string
    estimatedCost: string
    maxCost?: string
}

export interface PermissionInfo {
    type: 'sign' | 'send' | 'approve'
    resource: string
    explanation: string
}

interface TransactionStatusProps {
    isOpen: boolean
    onClose: () => void
    title?: string
    steps: TransactionStepInfo[]
    currentStep?: number
    error?: string
    txHash?: string
    onRetry?: () => void
    gasEstimate?: GasEstimate
    permissions?: PermissionInfo[]
    network?: string
}

export function TransactionStatus({
    isOpen,
    onClose,
    title = 'Processing Transaction',
    steps,
    error,
    txHash,
    onRetry,
    gasEstimate,
    permissions,
    network = 'testnet'
}: TransactionStatusProps) {
    const allCompleted = steps.every((s) => s.status === 'completed')
    const hasError = steps.some((s) => s.status === 'error') || !!error
    const isProcessing = steps.some((s) => s.status === 'active')

    const explorerUrl = `https://explorer.aptoslabs.com/txn/${txHash}?network=${network}`

    return (
        <Modal
            isOpen={isOpen}
            onClose={allCompleted || hasError ? onClose : () => { }}
            title={title}
            size="md"
            closeOnOverlayClick={allCompleted || hasError}
        >
            <div className="space-y-6">
                {/* Gas Estimate - shown before transaction starts */}
                {gasEstimate && !isProcessing && !allCompleted && !hasError && (
                    <div className="p-4 rounded-xl bg-(--bg-secondary) border border-(--border-color)">
                        <h4 className="text-sm font-semibold text-(--text-primary) mb-3 flex items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                            Estimated Cost
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-(--text-muted) text-xs">Gas Units</p>
                                <p className="font-mono text-(--text-primary)">{gasEstimate.estimatedGas}</p>
                            </div>
                            <div>
                                <p className="text-(--text-muted) text-xs">Estimated Cost</p>
                                <p className="font-mono text-(--text-primary)">{gasEstimate.estimatedCost}</p>
                            </div>
                        </div>
                        {gasEstimate.maxCost && (
                            <p className="text-xs text-(--text-muted) mt-2">
                                Maximum: {gasEstimate.maxCost}
                            </p>
                        )}
                    </div>
                )}

                {/* Permissions - shown before signing */}
                {permissions && permissions.length > 0 && !isProcessing && !allCompleted && !hasError && (
                    <div className="p-4 rounded-xl bg-(--info-light) border border-(--info-blue)/20">
                        <h4 className="text-sm font-semibold text-(--text-primary) mb-3 flex items-center gap-2">
                            <IconShieldCheck size="sm" className="text-(--info-blue)" />
                            Permissions Required
                        </h4>
                        <div className="space-y-3">
                            {permissions.map((perm, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <div className="shrink-0 mt-0.5">
                                        <IconKey size="sm" className="text-(--info-blue)" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-(--text-primary)">
                                            {perm.type === 'sign' && 'Sign message'}
                                            {perm.type === 'send' && 'Send transaction'}
                                            {perm.type === 'approve' && 'Approve access'}
                                        </p>
                                        <p className="text-xs text-(--text-secondary)">
                                            {perm.explanation}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Transaction Steps */}
                <div className="space-y-4">
                    {steps.map((step, index) => (
                        <div key={step.id} className="flex items-start gap-3">
                            {/* Step indicator */}
                            <div className="shrink-0 mt-0.5">
                                {step.status === 'completed' ? (
                                    <div className="w-6 h-6 rounded-full bg-(--success-green) flex items-center justify-center">
                                        <IconCheckCircle size="xs" className="text-white" />
                                    </div>
                                ) : step.status === 'active' ? (
                                    <div className="w-6 h-6 rounded-full bg-(--primary-brand) flex items-center justify-center">
                                        <Spinner size="xs" className="border-white border-t-transparent" />
                                    </div>
                                ) : step.status === 'error' ? (
                                    <div className="w-6 h-6 rounded-full bg-(--error-red) flex items-center justify-center">
                                        <IconAlertCircle size="xs" className="text-white" />
                                    </div>
                                ) : (
                                    <div className="w-6 h-6 rounded-full bg-(--bg-secondary) flex items-center justify-center text-xs font-medium text-(--text-muted)">
                                        {index + 1}
                                    </div>
                                )}
                            </div>

                            {/* Step content */}
                            <div className="flex-1 min-w-0">
                                <p
                                    className={`font-medium text-sm ${step.status === 'completed'
                                        ? 'text-(--success-green)'
                                        : step.status === 'active'
                                            ? 'text-(--text-primary)'
                                            : step.status === 'error'
                                                ? 'text-(--error-red)'
                                                : 'text-(--text-muted)'
                                        }`}
                                >
                                    {step.label}
                                </p>
                                {step.description && (
                                    <p className="text-xs text-(--text-muted) mt-0.5">{step.description}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Error message */}
                {error && (
                    <div className="p-4 rounded-xl bg-(--error-light) border border-(--error-red)/20">
                        <div className="flex items-start gap-3">
                            <IconAlertCircle size="md" className="text-(--error-red) shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-(--error-red)">Transaction Failed</p>
                                <p className="text-sm text-(--text-secondary) mt-1">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Success with transaction hash */}
                {txHash && allCompleted && (
                    <div className="p-4 rounded-xl bg-(--success-light) border border-(--success-green)/20">
                        <div className="flex items-start gap-3">
                            <IconCheckCircle size="md" className="text-(--success-green) shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-(--success-green)">Transaction Confirmed</p>
                                <p className="text-xs text-(--text-muted) mt-1 mb-2">Transaction Hash</p>
                                <a
                                    href={explorerUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-sm font-mono text-(--primary-brand) hover:underline break-all"
                                >
                                    {txHash.slice(0, 16)}...{txHash.slice(-16)}
                                    <IconExternalLink size="xs" />
                                </a>
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                    {hasError && onRetry && (
                        <Button variant="primary" onClick={onRetry} fullWidth>
                            Try Again
                        </Button>
                    )}
                    {(allCompleted || hasError) && (
                        <Button variant={hasError && onRetry ? 'outline' : 'primary'} onClick={onClose} fullWidth>
                            {allCompleted ? 'Done' : 'Close'}
                        </Button>
                    )}
                    {isProcessing && (
                        <p className="text-xs text-(--text-muted) text-center w-full">
                            Please confirm the transaction in your wallet...
                        </p>
                    )}
                </div>
            </div>
        </Modal>
    )
}

export default TransactionStatus
