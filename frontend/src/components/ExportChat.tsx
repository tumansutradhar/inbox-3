import { useState } from 'react'

interface Message {
    sender: string
    content?: string
    plain?: string
    timestamp: number
    type?: string
}

interface ExportOptions {
    format: 'json' | 'txt' | 'csv'
    includeTimestamps: boolean
    includeMetadata: boolean
}

interface ExportChatProps {
    messages: Message[]
    chatName: string
    isOpen: boolean
    onClose: () => void
}

export default function ExportChat({ messages, chatName, isOpen, onClose }: ExportChatProps) {
    const [options, setOptions] = useState<ExportOptions>({
        format: 'json',
        includeTimestamps: true,
        includeMetadata: true
    })
    const [exporting, setExporting] = useState(false)

    const exportToJSON = () => {
        const data = {
            chatName,
            exportDate: new Date().toISOString(),
            messageCount: messages.length,
            messages: messages.map(m => ({
                sender: m.sender,
                content: m.content || m.plain || '',
                timestamp: options.includeTimestamps ? m.timestamp : undefined,
                type: options.includeMetadata ? m.type : undefined
            }))
        }
        return JSON.stringify(data, null, 2)
    }

    const exportToTXT = () => {
        let content = `Chat Export: ${chatName}\n`
        content += `Export Date: ${new Date().toLocaleString()}\n`
        content += `Total Messages: ${messages.length}\n`
        content += '='.repeat(50) + '\n\n'

        messages.forEach(msg => {
            if (options.includeTimestamps) {
                content += `[${new Date(msg.timestamp).toLocaleString()}] `
            }
            content += `${msg.sender.slice(0, 8)}...: ${msg.content}\n`
        })

        return content
    }

    const exportToCSV = () => {
        let csv = 'Sender,Content'

        if (options.includeTimestamps) csv += ',Timestamp'
        if (options.includeMetadata) csv += ',Type'
        csv += '\n'

        messages.forEach(msg => {
            const messageContent = msg.content || msg.plain || ''
            const escapedContent = `"${messageContent.replace(/"/g, '""')}"`
            let row = `"${msg.sender}",${escapedContent}`

            if (options.includeTimestamps) {
                row += `,"${new Date(msg.timestamp).toISOString()}"`
            }
            if (options.includeMetadata) {
                row += `,"${msg.type || 'text'}"`
            }
            csv += row + '\n'
        })

        return csv
    }

    const handleExport = () => {
        setExporting(true)

        try {
            let content = ''
            let extension = ''
            let mimeType = ''

            switch (options.format) {
                case 'json':
                    content = exportToJSON()
                    extension = 'json'
                    mimeType = 'application/json'
                    break
                case 'txt':
                    content = exportToTXT()
                    extension = 'txt'
                    mimeType = 'text/plain'
                    break
                case 'csv':
                    content = exportToCSV()
                    extension = 'csv'
                    mimeType = 'text/csv'
                    break
            }

            const blob = new Blob([content], { type: mimeType })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${chatName.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.${extension}`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)

            setTimeout(() => {
                setExporting(false)
                onClose()
            }, 1000)
        } catch (error) {
            console.error('Export failed:', error)
            setExporting(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
            <div className="bg-(--bg-card) rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-(--border-color)">
                    <h2 className="text-xl font-bold text-(--text-primary)">Export Chat</h2>
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

                {/* Content */}
                <div className="p-6 space-y-4">
                    <div>
                        <p className="text-sm text-(--text-secondary) mb-4">
                            Export {messages.length} messages from <strong>{chatName}</strong>
                        </p>

                        {/* Format Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-(--text-primary)">Format</label>
                            <div className="grid grid-cols-3 gap-2">
                                {(['json', 'txt', 'csv'] as const).map(format => (
                                    <button
                                        key={format}
                                        onClick={() => setOptions({ ...options, format })}
                                        className={`p-3 rounded-xl font-medium text-sm transition-colors ${options.format === format
                                            ? 'bg-(--primary-brand) text-white'
                                            : 'bg-(--bg-secondary) text-(--text-primary) hover:bg-(--bg-card)'
                                            }`}
                                    >
                                        {format.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Options */}
                        <div className="space-y-3 mt-4">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={options.includeTimestamps}
                                    onChange={(e) => setOptions({ ...options, includeTimestamps: e.target.checked })}
                                    className="w-4 h-4 rounded border-gray-300 text-(--primary-brand) focus:ring-(--primary-brand)"
                                />
                                <span className="text-sm text-(--text-primary)">Include timestamps</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={options.includeMetadata}
                                    onChange={(e) => setOptions({ ...options, includeMetadata: e.target.checked })}
                                    className="w-4 h-4 rounded border-gray-300 text-(--primary-brand) focus:ring-(--primary-brand)"
                                />
                                <span className="text-sm text-(--text-primary)">Include metadata (message type, etc.)</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-(--border-color) bg-(--bg-secondary)">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-(--text-secondary) hover:text-(--text-primary) transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={exporting || messages.length === 0}
                        className="px-6 py-2 bg-(--primary-brand) text-white rounded-xl font-medium hover:bg-(--primary-brand-hover) transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {exporting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Exporting...
                            </>
                        ) : (
                            <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="7 10 12 15 17 10" />
                                    <line x1="12" y1="15" x2="12" y2="3" />
                                </svg>
                                Export Chat
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
