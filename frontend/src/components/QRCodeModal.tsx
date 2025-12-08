import { useEffect, useRef } from 'react'

interface QRCodeModalProps {
    isOpen: boolean
    onClose: () => void
    address: string
    title?: string
}

export default function QRCodeModal({ isOpen, onClose, address, title = 'Your Wallet Address' }: QRCodeModalProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        if (!isOpen || !canvasRef.current) return

        // Simple QR code generator using canvas
        generateQRCode(address, canvasRef.current)
    }, [isOpen, address])

    const copyToClipboard = () => {
        navigator.clipboard.writeText(address)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
            <div className="bg-(--bg-card) rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-(--border-color)">
                    <h2 className="text-lg font-bold text-(--text-primary)">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-(--bg-secondary) transition-colors"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* QR Code */}
                <div className="p-8 flex flex-col items-center">
                    <div className="bg-white p-4 rounded-2xl shadow-inner mb-6">
                        <canvas
                            ref={canvasRef}
                            width={200}
                            height={200}
                            className="block"
                        />
                    </div>

                    {/* Address */}
                    <div className="w-full">
                        <p className="text-xs text-(--text-muted) text-center mb-2">Scan or share this address</p>
                        <div className="flex items-center gap-2 p-3 bg-(--bg-secondary) rounded-xl">
                            <code className="flex-1 text-xs text-(--text-primary) font-mono break-all">
                                {address}
                            </code>
                            <button
                                onClick={copyToClipboard}
                                className="p-2 rounded-lg hover:bg-(--bg-card) transition-colors text-(--text-secondary) hover:text-(--primary-brand)"
                                title="Copy address"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-(--border-color) bg-(--bg-secondary)">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-(--primary-brand) text-white rounded-xl font-medium hover:bg-(--primary-brand-hover) transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    )
}

// Simple QR Code generator
function generateQRCode(text: string, canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Create a simple visual pattern based on the address
    // For production, use a proper QR code library like 'qrcode'
    const size = canvas.width
    const moduleSize = Math.floor(size / 25)
    const padding = (size - moduleSize * 25) / 2

    ctx.fillStyle = '#000000'

    // Create a deterministic pattern from the text
    const hash = simpleHash(text)

    // Draw finder patterns (corners)
    drawFinderPattern(ctx, padding, padding, moduleSize)
    drawFinderPattern(ctx, padding + moduleSize * 18, padding, moduleSize)
    drawFinderPattern(ctx, padding, padding + moduleSize * 18, moduleSize)

    // Draw data modules based on hash
    for (let y = 0; y < 25; y++) {
        for (let x = 0; x < 25; x++) {
            // Skip finder pattern areas
            if ((x < 8 && y < 8) || (x >= 17 && y < 8) || (x < 8 && y >= 17)) continue

            // Use hash to determine module state
            const index = y * 25 + x
            const bit = (hash[index % hash.length].charCodeAt(0) + index) % 3 === 0

            if (bit) {
                ctx.fillRect(
                    padding + x * moduleSize,
                    padding + y * moduleSize,
                    moduleSize - 1,
                    moduleSize - 1
                )
            }
        }
    }
}

function drawFinderPattern(ctx: CanvasRenderingContext2D, x: number, y: number, moduleSize: number) {
    // Outer border
    ctx.fillRect(x, y, moduleSize * 7, moduleSize * 7)

    // White inner
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(x + moduleSize, y + moduleSize, moduleSize * 5, moduleSize * 5)

    // Black center
    ctx.fillStyle = '#000000'
    ctx.fillRect(x + moduleSize * 2, y + moduleSize * 2, moduleSize * 3, moduleSize * 3)
}

function simpleHash(str: string): string {
    let hash = ''
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash += String.fromCharCode((char * 31 + i) % 128 + 33)
    }
    return hash.repeat(10)
}
