import { useState, useCallback, forwardRef } from 'react'
import { Button } from './Button'

export interface MarkdownEditorProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    minHeight?: string
    maxHeight?: string
    disabled?: boolean
    className?: string
}

/**
 * Markdown editor with formatting toolbar and preview
 */
export const MarkdownEditor = forwardRef<HTMLTextAreaElement, MarkdownEditorProps>(
    (
        {
            value,
            onChange,
            placeholder = 'Write your message...',
            minHeight = '120px',
            maxHeight = '300px',
            disabled = false,
            className = ''
        },
        ref
    ) => {
        const [showPreview, setShowPreview] = useState(false)

        const insertMarkdown = useCallback(
            (before: string, after: string = '', placeholder: string = '') => {
                const textarea = document.querySelector('textarea[data-markdown-editor]') as HTMLTextAreaElement
                if (!textarea) return

                const start = textarea.selectionStart
                const end = textarea.selectionEnd
                const selectedText = value.substring(start, end) || placeholder

                const newValue =
                    value.substring(0, start) +
                    before +
                    selectedText +
                    after +
                    value.substring(end)

                onChange(newValue)

                // Restore cursor position
                setTimeout(() => {
                    textarea.focus()
                    const newCursorPos = start + before.length + selectedText.length
                    textarea.setSelectionRange(newCursorPos, newCursorPos)
                }, 0)
            },
            [value, onChange]
        )

        const formatButtons = [
            {
                icon: <span className="font-bold">B</span>,
                label: 'Bold',
                action: () => insertMarkdown('**', '**', 'bold text'),
                shortcut: 'Ctrl+B'
            },
            {
                icon: <span className="italic">I</span>,
                label: 'Italic',
                action: () => insertMarkdown('*', '*', 'italic text'),
                shortcut: 'Ctrl+I'
            },
            {
                icon: <span className="line-through">S</span>,
                label: 'Strikethrough',
                action: () => insertMarkdown('~~', '~~', 'strikethrough'),
                shortcut: ''
            },
            {
                icon: (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                ),
                label: 'Link',
                action: () => insertMarkdown('[', '](url)', 'link text'),
                shortcut: 'Ctrl+K'
            },
            {
                icon: (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                ),
                label: 'Code',
                action: () => insertMarkdown('`', '`', 'code'),
                shortcut: ''
            },
            {
                icon: (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                ),
                label: 'Quote',
                action: () => insertMarkdown('\n> ', '', 'quote'),
                shortcut: ''
            },
            {
                icon: (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
                    </svg>
                ),
                label: 'List',
                action: () => insertMarkdown('\n- ', '', 'list item'),
                shortcut: ''
            }
        ]

        const handleKeyDown = (e: React.KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case 'b':
                        e.preventDefault()
                        insertMarkdown('**', '**', 'bold text')
                        break
                    case 'i':
                        e.preventDefault()
                        insertMarkdown('*', '*', 'italic text')
                        break
                    case 'k':
                        e.preventDefault()
                        insertMarkdown('[', '](url)', 'link text')
                        break
                }
            }
        }

        // Simple markdown to HTML renderer
        const renderMarkdown = (text: string): string => {
            return text
                // Bold
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                // Italic
                .replace(/\*(.+?)\*/g, '<em>$1</em>')
                // Strikethrough
                .replace(/~~(.+?)~~/g, '<del>$1</del>')
                // Code
                .replace(/`(.+?)`/g, '<code class="bg-(--bg-tertiary) px-1 rounded">$1</code>')
                // Links
                .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-(--primary-brand) underline">$1</a>')
                // Quote
                .replace(/^> (.+)$/gm, '<blockquote class="border-l-2 border-(--primary-brand) pl-3 italic">$1</blockquote>')
                // List items
                .replace(/^- (.+)$/gm, '<li>$1</li>')
                // Line breaks
                .replace(/\n/g, '<br>')
        }

        return (
            <div className={`border border-(--border-default) rounded-xl overflow-hidden ${className}`}>
                {/* Toolbar */}
                <div className="flex items-center justify-between gap-1 px-2 py-1.5 bg-(--bg-secondary) border-b border-(--border-default)">
                    <div className="flex items-center gap-0.5">
                        {formatButtons.map((btn, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={btn.action}
                                disabled={disabled || showPreview}
                                className="p-1.5 rounded hover:bg-(--bg-tertiary) text-(--text-secondary) hover:text-(--text-primary) transition-colors disabled:opacity-50"
                                title={btn.shortcut ? `${btn.label} (${btn.shortcut})` : btn.label}
                            >
                                {btn.icon}
                            </button>
                        ))}
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPreview(!showPreview)}
                        className="text-xs"
                    >
                        {showPreview ? 'Edit' : 'Preview'}
                    </Button>
                </div>

                {/* Editor / Preview */}
                {showPreview ? (
                    <div
                        className="p-3 prose prose-sm max-w-none text-(--text-primary)"
                        style={{ minHeight, maxHeight, overflowY: 'auto' }}
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(value) || '<span class="text-(--text-muted)">Nothing to preview</span>' }}
                    />
                ) : (
                    <textarea
                        ref={ref}
                        data-markdown-editor
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        disabled={disabled}
                        className="w-full p-3 bg-(--bg-primary) text-(--text-primary) placeholder:text-(--text-muted) resize-none focus:outline-none"
                        style={{ minHeight, maxHeight }}
                    />
                )}

                {/* Footer hint */}
                <div className="px-3 py-1.5 bg-(--bg-secondary) border-t border-(--border-default)">
                    <p className="text-xs text-(--text-muted)">
                        Supports **bold**, *italic*, `code`, [links](url), and more. Press Ctrl+B/I/K for shortcuts.
                    </p>
                </div>
            </div>
        )
    }
)

MarkdownEditor.displayName = 'MarkdownEditor'

export default MarkdownEditor
