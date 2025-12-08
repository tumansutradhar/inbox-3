/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect, useCallback } from 'react'

interface Draft {
    id: string
    content: string
    recipient?: string
    groupId?: string
    timestamp: number
    type: 'dm' | 'group'
}

// Hook for managing message drafts
export function useDrafts() {
    const [drafts, setDrafts] = useState<Record<string, Draft>>({})

    useEffect(() => {
        // Load drafts from localStorage
        const saved = localStorage.getItem('inbox3_drafts')
        if (saved) {
            setDrafts(JSON.parse(saved))
        }
    }, [])

    const saveDraft = useCallback((
        id: string,
        content: string,
        type: 'dm' | 'group',
        recipient?: string,
        groupId?: string
    ) => {
        if (!content.trim()) {
            // Remove draft if content is empty
            removeDraft(id)
            return
        }

        const draft: Draft = {
            id,
            content: content.trim(),
            recipient,
            groupId,
            timestamp: Date.now(),
            type
        }

        setDrafts(prev => {
            const updated = { ...prev, [id]: draft }
            localStorage.setItem('inbox3_drafts', JSON.stringify(updated))
            return updated
        })
    }, [])

    const getDraft = useCallback((id: string): Draft | null => {
        return drafts[id] || null
    }, [drafts])

    const removeDraft = useCallback((id: string) => {
        setDrafts(prev => {
            const updated = { ...prev }
            delete updated[id]
            localStorage.setItem('inbox3_drafts', JSON.stringify(updated))
            return updated
        })
    }, [])

    const getAllDrafts = useCallback((): Draft[] => {
        return Object.values(drafts).sort((a, b) => b.timestamp - a.timestamp)
    }, [drafts])

    const clearAllDrafts = useCallback(() => {
        setDrafts({})
        localStorage.removeItem('inbox3_drafts')
    }, [])

    return {
        saveDraft,
        getDraft,
        removeDraft,
        getAllDrafts,
        clearAllDrafts,
        hasDrafts: Object.keys(drafts).length > 0
    }
}

// Component to display draft indicator
interface DraftIndicatorProps {
    draftCount: number
    onClick: () => void
}

export function DraftIndicator({ draftCount, onClick }: DraftIndicatorProps) {
    if (draftCount === 0) return null

    return (
        <button
            onClick={onClick}
            className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm"
        >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
            <span className="font-medium">
                {draftCount} draft{draftCount > 1 ? 's' : ''}
            </span>
        </button>
    )
}

// Modal to view all drafts
interface DraftsModalProps {
    isOpen: boolean
    onClose: () => void
    drafts: Draft[]
    onSelectDraft: (draft: Draft) => void
    onDeleteDraft: (id: string) => void
}

export function DraftsModal({ isOpen, onClose, drafts, onSelectDraft, onDeleteDraft }: DraftsModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
            <div className="bg-(--bg-card) rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-(--border-color)">
                    <h2 className="text-xl font-bold text-(--text-primary)">Drafts</h2>
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

                {/* Drafts List */}
                <div className="overflow-y-auto max-h-[60vh]">
                    {drafts.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                                </svg>
                            </div>
                            <p className="text-(--text-muted)">No drafts saved</p>
                        </div>
                    ) : (
                        <div className="p-4 space-y-2">
                            {drafts.map(draft => (
                                <div
                                    key={draft.id}
                                    className="p-4 bg-(--bg-secondary) rounded-xl hover:bg-(--bg-card) transition-colors cursor-pointer"
                                    onClick={() => {
                                        onSelectDraft(draft)
                                        onClose()
                                    }}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-1 rounded-md text-xs font-medium bg-(--bg-card) text-(--text-secondary)">
                                                {draft.type === 'dm' ? 'DM' : 'Group'}
                                            </span>
                                            {draft.recipient && (
                                                <span className="text-xs text-(--text-muted) font-mono">
                                                    {draft.recipient.slice(0, 8)}...
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onDeleteDraft(draft.id)
                                            }}
                                            className="p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="3 6 5 6 21 6" />
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                            </svg>
                                        </button>
                                    </div>
                                    <p className="text-sm text-(--text-primary) line-clamp-2">
                                        {draft.content}
                                    </p>
                                    <p className="text-xs text-(--text-muted) mt-2">
                                        {new Date(draft.timestamp).toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
