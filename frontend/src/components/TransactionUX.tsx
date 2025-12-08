import { useState } from 'react'
import { Modal } from './ui/Modal'
import { Button } from './ui/Button'
import { Spinner } from './ui/Loading'

interface TransactionStep {
    id: string
    label: string
    description?: string
    status: 'pending' | 'active' | 'completed' | 'error'
}

interface TransactionModalProps {
    isOpen: boolean
    onClose: () => void
    title?: string
    steps: TransactionStep[]
    currentStep?: number
    error?: string
    txHash?: string
    onRetry?: () => void
}

export function TransactionModal({
    isOpen,
    onClose,
    title = 'Processing Transaction',
    steps,
    error,
    txHash,
    onRetry
}: TransactionModalProps) {
    const allCompleted = steps.every((s) => s.status === 'completed')
    const hasError = steps.some((s) => s.status === 'error') || error

    return (
        <Modal
            isOpen={isOpen}
            onClose={allCompleted || !!hasError ? onClose : () => { }}
            title={title}
            size="sm"
            closeOnOverlayClick={allCompleted || !!hasError}
        >
            <div className="space-y-6">
                {/* Steps */}
                <div className="space-y-4">
                    {steps.map((step, index) => (
                        <div key={step.id} className="flex items-start gap-3">
                            {/* Step indicator */}
                            <div className="shrink-0 mt-0.5">
                                {step.status === 'completed' ? (
                                    <div className="w-6 h-6 rounded-full bg-(--success-green) flex items-center justify-center">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                            <path d="M20 6L9 17l-5-5" />
                                        </svg>
                                    </div>
                                ) : step.status === 'active' ? (
                                    <div className="w-6 h-6 rounded-full bg-(--primary-brand) flex items-center justify-center">
                                        <Spinner size="xs" className="border-white border-t-transparent" />
                                    </div>
                                ) : step.status === 'error' ? (
                                    <div className="w-6 h-6 rounded-full bg-(--error-red) flex items-center justify-center">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                            <path d="M18 6L6 18M6 6l12 12" />
                                        </svg>
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
                                    className={`font-medium ${step.status === 'completed'
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
                                    <p className="text-sm text-(--text-muted) mt-0.5">{step.description}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Error message */}
                {error && (
                    <div className="p-3 rounded-xl bg-(--error-light) border border-(--error-red)/20">
                        <p className="text-sm text-(--error-red)">{error}</p>
                    </div>
                )}

                {/* Transaction hash */}
                {txHash && allCompleted && (
                    <div className="p-3 rounded-xl bg-(--success-light) border border-(--success-green)/20">
                        <p className="text-xs text-(--text-muted) mb-1">Transaction Hash</p>
                        <a
                            href={`https://explorer.aptoslabs.com/txn/${txHash}?network=testnet`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-mono text-(--success-green) hover:underline break-all"
                        >
                            {txHash.slice(0, 20)}...{txHash.slice(-20)}
                        </a>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    {hasError && onRetry && (
                        <Button variant="primary" onClick={onRetry} fullWidth>
                            Try Again
                        </Button>
                    )}
                    {(allCompleted || hasError) && (
                        <Button variant={hasError ? 'outline' : 'primary'} onClick={onClose} fullWidth>
                            {allCompleted ? 'Done' : 'Close'}
                        </Button>
                    )}
                </div>
            </div>
        </Modal>
    )
}

interface WalletConnectionModalProps {
    isOpen: boolean
    onClose: () => void
    wallets: Array<{ name: string; icon?: string; readyState?: string }>
    onConnect: (wallet: { name: string }) => void
    connecting?: string
}

export function WalletConnectionModal({
    isOpen,
    onClose,
    wallets,
    onConnect,
    connecting
}: WalletConnectionModalProps) {
    const [selectedCategory, setSelectedCategory] = useState<'wallet' | 'social'>('wallet')

    const walletWallets = wallets.filter(
        (w) =>
            !w.name.toLowerCase().includes('google') &&
            !w.name.toLowerCase().includes('apple') &&
            !w.name.toLowerCase().includes('keyless')
    )

    const socialWallets = wallets.filter(
        (w) =>
            w.name.toLowerCase().includes('google') ||
            w.name.toLowerCase().includes('apple') ||
            w.name.toLowerCase().includes('keyless')
    )

    const displayWallets = selectedCategory === 'wallet' ? walletWallets : socialWallets

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Connect Wallet"
            description="Choose how you want to connect to Inbox3"
            size="md"
        >
            <div className="space-y-6">
                {/* Category tabs */}
                <div className="flex gap-2 p-1 bg-(--bg-secondary) rounded-xl">
                    <button
                        onClick={() => setSelectedCategory('wallet')}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${selectedCategory === 'wallet'
                                ? 'bg-(--bg-card) text-(--text-primary) shadow-sm'
                                : 'text-(--text-secondary) hover:text-(--text-primary)'
                            }`}
                    >
                        Crypto Wallets
                    </button>
                    <button
                        onClick={() => setSelectedCategory('social')}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${selectedCategory === 'social'
                                ? 'bg-(--bg-card) text-(--text-primary) shadow-sm'
                                : 'text-(--text-secondary) hover:text-(--text-primary)'
                            }`}
                    >
                        Social Login
                    </button>
                </div>

                {/* Wallet list */}
                <div className="space-y-2">
                    {displayWallets.length === 0 ? (
                        <div className="text-center py-8 text-(--text-muted)">
                            <p>No wallets available for this category</p>
                        </div>
                    ) : (
                        displayWallets.map((wallet) => (
                            <button
                                key={wallet.name}
                                onClick={() => onConnect(wallet)}
                                disabled={connecting === wallet.name}
                                className="
                  w-full flex items-center gap-4 p-4 rounded-xl
                  bg-(--bg-secondary) hover:bg-(--border-color)
                  border border-transparent hover:border-(--primary-brand)
                  transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
                            >
                                {wallet.icon ? (
                                    <img src={wallet.icon} alt={wallet.name} className="w-10 h-10 rounded-lg" />
                                ) : (
                                    <div className="w-10 h-10 rounded-lg bg-(--bg-card) flex items-center justify-center text-lg">
                                        💼
                                    </div>
                                )}
                                <div className="flex-1 text-left">
                                    <p className="font-medium text-(--text-primary)">{wallet.name}</p>
                                    <p className="text-xs text-(--text-muted)">
                                        {wallet.readyState === 'Installed' ? 'Installed' : 'Click to connect'}
                                    </p>
                                </div>
                                {connecting === wallet.name ? (
                                    <Spinner size="sm" />
                                ) : (
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        className="text-(--text-muted)"
                                    >
                                        <path d="M9 18l6-6-6-6" />
                                    </svg>
                                )}
                            </button>
                        ))
                    )}
                </div>

                {/* Security notice */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-(--warning-light) border border-(--warning-yellow)/20">
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="shrink-0 text-(--warning-yellow)"
                    >
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <div>
                        <p className="text-sm font-medium text-(--text-primary)">Secure Connection</p>
                        <p className="text-xs text-(--text-secondary) mt-0.5">
                            We never store your private keys. All transactions require your approval.
                        </p>
                    </div>
                </div>
            </div>
        </Modal>
    )
}

interface GasEstimateProps {
    gasAmount?: number
    gasPrice?: number
    className?: string
}

export function GasEstimate({ gasAmount, gasPrice, className = '' }: GasEstimateProps) {
    const estimatedCost = gasAmount && gasPrice ? (gasAmount * gasPrice) / 100000000 : null

    return (
        <div className={`flex items-center justify-between text-sm ${className}`}>
            <span className="text-(--text-muted)">Estimated Gas</span>
            <span className="font-medium text-(--text-primary)">
                {estimatedCost ? `~${estimatedCost.toFixed(6)} APT` : 'Calculating...'}
            </span>
        </div>
    )
}
