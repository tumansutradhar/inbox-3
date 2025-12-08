import { useState, useEffect, useCallback } from 'react'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Card } from './ui/Card'
import { Modal } from './ui/Modal'
import { IconSearch, IconStar, IconTrash } from './ui/Icons'

export interface SavedSearch {
    id: string
    name: string
    query: string
    filters: SearchFilters
    createdAt: number
    usedAt: number
}

export interface SearchFilters {
    sender?: string
    dateFrom?: string
    dateTo?: string
    hasAttachments?: boolean
    isUnread?: boolean
    isEncrypted?: boolean
}

interface SavedSearchesProps {
    onSelectSearch: (search: SavedSearch) => void
    currentQuery?: string
    currentFilters?: SearchFilters
    className?: string
}

const STORAGE_KEY = 'inbox3_saved_searches'

/**
 * Saved searches management component
 * Allows users to save, load, and manage search queries
 */
export function SavedSearches({
    onSelectSearch,
    currentQuery = '',
    currentFilters = {},
    className = ''
}: SavedSearchesProps) {
    const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
    const [showSaveModal, setShowSaveModal] = useState(false)
    const [newSearchName, setNewSearchName] = useState('')

    // Load saved searches from localStorage
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            try {
                setSavedSearches(JSON.parse(stored))
            } catch (e) {
                console.error('Failed to parse saved searches:', e)
            }
        }
    }, [])

    // Save to localStorage
    const persistSearches = useCallback((searches: SavedSearch[]) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(searches))
        setSavedSearches(searches)
    }, [])

    const saveCurrentSearch = () => {
        if (!newSearchName.trim() || !currentQuery.trim()) return

        const newSearch: SavedSearch = {
            id: `search_${Date.now()}`,
            name: newSearchName.trim(),
            query: currentQuery,
            filters: currentFilters,
            createdAt: Date.now(),
            usedAt: Date.now()
        }

        persistSearches([newSearch, ...savedSearches])
        setNewSearchName('')
        setShowSaveModal(false)
    }

    const deleteSearch = (id: string) => {
        persistSearches(savedSearches.filter(s => s.id !== id))
    }

    const useSearch = (search: SavedSearch) => {
        // Update last used timestamp
        const updated = savedSearches.map(s =>
            s.id === search.id ? { ...s, usedAt: Date.now() } : s
        )
        persistSearches(updated)
        onSelectSearch(search)
    }

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric'
        })
    }

    const getFilterSummary = (filters: SearchFilters): string => {
        const parts: string[] = []
        if (filters.sender) parts.push(`from:${filters.sender}`)
        if (filters.hasAttachments) parts.push('has:attachments')
        if (filters.isUnread) parts.push('is:unread')
        if (filters.isEncrypted) parts.push('is:encrypted')
        if (filters.dateFrom) parts.push(`after:${filters.dateFrom}`)
        if (filters.dateTo) parts.push(`before:${filters.dateTo}`)
        return parts.join(' ')
    }

    const canSave = currentQuery.trim().length > 0

    return (
        <div className={className}>
            {/* Save current search button */}
            {canSave && (
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowSaveModal(true)}
                    icon={<IconStar className="w-4 h-4" />}
                    className="mb-3"
                >
                    Save this search
                </Button>
            )}

            {/* Saved searches list */}
            {savedSearches.length > 0 ? (
                <div className="space-y-2">
                    <h3 className="text-sm font-medium text-(--text-secondary) mb-2">
                        Saved Searches
                    </h3>
                    {savedSearches.map(search => (
                        <Card
                            key={search.id}
                            variant="outlined"
                            className="p-3 hover:bg-(--bg-secondary) transition-colors cursor-pointer group"
                            onClick={() => useSearch(search)}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <IconSearch className="w-4 h-4 text-(--text-muted) shrink-0" />
                                        <span className="font-medium text-(--text-primary) truncate">
                                            {search.name}
                                        </span>
                                    </div>
                                    <p className="text-sm text-(--text-secondary) truncate mt-1">
                                        {search.query}
                                        {getFilterSummary(search.filters) && (
                                            <span className="text-(--text-muted) ml-1">
                                                {getFilterSummary(search.filters)}
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-xs text-(--text-muted) mt-1">
                                        Last used {formatDate(search.usedAt)}
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        deleteSearch(search.id)
                                    }}
                                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-(--bg-tertiary) text-(--text-muted) hover:text-(--status-error) transition-all"
                                    title="Delete saved search"
                                >
                                    <IconTrash className="w-4 h-4" />
                                </button>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-6">
                    <IconSearch className="w-8 h-8 text-(--text-muted) mx-auto mb-2" />
                    <p className="text-sm text-(--text-secondary)">No saved searches yet</p>
                    <p className="text-xs text-(--text-muted) mt-1">
                        Search for something and save it for quick access
                    </p>
                </div>
            )}

            {/* Save search modal */}
            <Modal
                isOpen={showSaveModal}
                onClose={() => setShowSaveModal(false)}
                title="Save Search"
                size="sm"
            >
                <div className="space-y-4">
                    <Input
                        label="Search Name"
                        value={newSearchName}
                        onChange={(e) => setNewSearchName(e.target.value)}
                        placeholder="e.g., Messages from Alice"
                        autoFocus
                    />

                    <div className="p-3 bg-(--bg-secondary) rounded-lg">
                        <p className="text-sm text-(--text-secondary)">
                            <span className="font-medium">Query:</span> {currentQuery}
                        </p>
                        {getFilterSummary(currentFilters) && (
                            <p className="text-sm text-(--text-muted) mt-1">
                                <span className="font-medium">Filters:</span> {getFilterSummary(currentFilters)}
                            </p>
                        )}
                    </div>

                    <div className="flex gap-2 justify-end">
                        <Button variant="secondary" onClick={() => setShowSaveModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={saveCurrentSearch}
                            disabled={!newSearchName.trim()}
                        >
                            Save Search
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

/**
 * Quick search suggestions based on recent activity
 */
export interface QuickSearchSuggestion {
    label: string
    query: string
    filters?: SearchFilters
    icon?: React.ReactNode
}

interface QuickSearchProps {
    suggestions?: QuickSearchSuggestion[]
    onSelect: (query: string, filters?: SearchFilters) => void
    className?: string
}

export function QuickSearch({ suggestions, onSelect, className = '' }: QuickSearchProps) {
    const defaultSuggestions: QuickSearchSuggestion[] = [
        { label: 'Unread messages', query: '', filters: { isUnread: true } },
        { label: 'With attachments', query: '', filters: { hasAttachments: true } },
        { label: 'Encrypted only', query: '', filters: { isEncrypted: true } },
        { label: 'Last 7 days', query: '', filters: { dateFrom: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0] } }
    ]

    const items = suggestions || defaultSuggestions

    return (
        <div className={`flex flex-wrap gap-2 ${className}`}>
            {items.map((suggestion, index) => (
                <button
                    key={index}
                    onClick={() => onSelect(suggestion.query, suggestion.filters)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-(--bg-secondary) text-(--text-secondary) hover:bg-(--bg-tertiary) transition-colors"
                >
                    {suggestion.icon}
                    {suggestion.label}
                </button>
            ))}
        </div>
    )
}

export default SavedSearches
