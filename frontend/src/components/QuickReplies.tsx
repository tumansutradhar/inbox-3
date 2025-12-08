/* eslint-disable react-refresh/only-export-components */
import { useState } from 'react'

interface Template {
    id: string
    title: string
    content: string
    category?: string
    emoji?: string
}

const DEFAULT_TEMPLATES: Template[] = [
    { id: '1', title: 'Thanks', content: 'Thanks! 👍', emoji: '👍', category: 'common' },
    { id: '2', title: 'Got it', content: 'Got it! ✅', emoji: '✅', category: 'common' },
    { id: '3', title: 'On my way', content: 'On my way! 🚀', emoji: '🚀', category: 'common' },
    { id: '4', title: 'Busy', content: 'Sorry, I\'m busy right now. I\'ll get back to you later!', emoji: '⏰', category: 'status' },
    { id: '5', title: 'Meeting', content: 'I\'m in a meeting. Will respond soon!', emoji: '📅', category: 'status' },
    { id: '6', title: 'Sounds good', content: 'Sounds good to me! 👌', emoji: '👌', category: 'common' },
    { id: '7', title: 'Working on it', content: 'Working on it! Will update you soon.', emoji: '💪', category: 'status' },
    { id: '8', title: 'Approved', content: 'Approved! ✓', emoji: '✓', category: 'work' },
]

interface QuickRepliesProps {
    onSelect: (content: string) => void
    isOpen: boolean
    onClose: () => void
}

export default function QuickReplies({ onSelect, isOpen, onClose }: QuickRepliesProps) {
    const [templates] = useState<Template[]>(() => {
        const saved = localStorage.getItem('inbox3_templates')
        return saved ? JSON.parse(saved) : DEFAULT_TEMPLATES
    })
    const [search, setSearch] = useState('')

    const handleSelect = (template: Template) => {
        onSelect(template.content)
        onClose()
    }

    const filteredTemplates = templates.filter(t =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.content.toLowerCase().includes(search.toLowerCase())
    )

    if (!isOpen) return null

    return (
        <div className="absolute bottom-full mb-2 left-0 right-0 bg-(--bg-card) rounded-2xl shadow-xl border border-(--border-color) overflow-hidden animate-scale-in z-[120]">
            {/* Header */}
            <div className="p-3 border-b border-(--border-color) bg-(--bg-secondary)">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-(--text-primary)">Quick Replies</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-(--bg-card) transition-colors"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search templates..."
                    className="w-full px-3 py-2 text-sm bg-(--bg-card) rounded-lg border-none outline-none focus:ring-2 focus:ring-(--primary-brand)"
                />
            </div>

            {/* Templates Grid */}
            <div className="p-3 max-h-64 overflow-y-auto grid grid-cols-2 gap-2">
                {filteredTemplates.length === 0 ? (
                    <div className="col-span-2 text-center py-8 text-(--text-muted) text-sm">
                        No templates found
                    </div>
                ) : (
                    filteredTemplates.map(template => (
                        <button
                            key={template.id}
                            onClick={() => handleSelect(template)}
                            className="p-3 bg-(--bg-secondary) rounded-xl hover:bg-(--primary-brand) hover:text-white transition-all text-left group"
                        >
                            <div className="flex items-center gap-2 mb-1">
                                {template.emoji && <span>{template.emoji}</span>}
                                <span className="text-sm font-medium">{template.title}</span>
                            </div>
                            <p className="text-xs opacity-70 line-clamp-2">
                                {template.content}
                            </p>
                        </button>
                    ))
                )}
            </div>

            {/* Footer */}
            <div className="p-2 border-t border-(--border-color) bg-(--bg-secondary)">
                <p className="text-xs text-(--text-muted) text-center">
                    Press <span className="kbd">/</span> to open quick replies
                </p>
            </div>
        </div>
    )
}

// Hook for managing templates
export function useTemplates() {
    const [templates, setTemplates] = useState<Template[]>(() => {
        const saved = localStorage.getItem('inbox3_templates')
        return saved ? JSON.parse(saved) : DEFAULT_TEMPLATES
    })

    const addTemplate = (template: Omit<Template, 'id'>) => {
        const newTemplate = {
            ...template,
            id: Date.now().toString()
        }
        const updated = [...templates, newTemplate]
        setTemplates(updated)
        localStorage.setItem('inbox3_templates', JSON.stringify(updated))
    }

    const updateTemplate = (id: string, updates: Partial<Template>) => {
        const updated = templates.map(t =>
            t.id === id ? { ...t, ...updates } : t
        )
        setTemplates(updated)
        localStorage.setItem('inbox3_templates', JSON.stringify(updated))
    }

    const deleteTemplate = (id: string) => {
        const updated = templates.filter(t => t.id !== id)
        setTemplates(updated)
        localStorage.setItem('inbox3_templates', JSON.stringify(updated))
    }

    const resetToDefaults = () => {
        setTemplates(DEFAULT_TEMPLATES)
        localStorage.setItem('inbox3_templates', JSON.stringify(DEFAULT_TEMPLATES))
    }

    return {
        templates,
        addTemplate,
        updateTemplate,
        deleteTemplate,
        resetToDefaults
    }
}
