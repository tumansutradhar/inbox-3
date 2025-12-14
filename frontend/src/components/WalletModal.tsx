import type { AdapterWallet } from '@aptos-labs/wallet-adapter-react'

interface WalletModalProps {
    isOpen: boolean
    onClose: () => void
    wallets: ReadonlyArray<AdapterWallet>
    onConnect: (walletName: string) => void
    title?: string
}

export default function WalletModal({ isOpen, onClose, wallets, onConnect, title = "Connect Wallet" }: WalletModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 animate-fade-in">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md bg-(--bg-card) rounded-2xl shadow-2xl border border-(--border-color) overflow-hidden transform transition-all scale-100">
                <div className="p-6 border-b border-(--border-color) flex justify-between items-center">
                    <h3 className="text-xl font-bold text-(--text-primary)">{title}</h3>
                    <button onClick={onClose} className="text-(--text-secondary) hover:text-(--text-primary) transition-colors">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
                    {wallets.length === 0 ? (
                        <div className="text-center text-(--text-secondary) py-4">
                            No options available
                        </div>
                    ) : (
                        wallets.map((wallet) => (
                            <button
                                key={wallet.name}
                                onClick={() => {
                                    onConnect(wallet.name)
                                    onClose()
                                }}
                                className="w-full flex items-center justify-between p-4 rounded-xl border border-(--border-color) hover:border-(--primary-brand) hover:bg-(--primary-brand-light) transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <img src={wallet.icon} alt={wallet.name} className="w-8 h-8 rounded-lg" />
                                    <span className="font-semibold text-(--text-primary) group-hover:text-(--primary-brand) transition-colors">
                                        {wallet.name}
                                    </span>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-(--primary-brand)">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </button>
                        ))
                    )}
                </div>

                <div className="p-4 bg-(--bg-secondary) text-center text-xs text-(--text-muted)">
                    New to Aptos? <a href="https://aptos.dev/guides/getting-started-with-aptos-wallet" target="_blank" rel="noreferrer" className="text-(--primary-brand) hover:underline">Learn more about wallets</a>
                </div>
            </div>
        </div>
    )
}
