/* eslint-disable react-refresh/only-export-components */
import { useEffect, useCallback } from 'react'

interface Shortcut {
    key: string
    ctrl?: boolean
    alt?: boolean
    shift?: boolean
    description: string
    action: () => void
}

export function useKeyboardShortcuts(shortcuts: Shortcut[], enabled = true) {
    const handleKeydown = useCallback((e: KeyboardEvent) => {
        if (!enabled) return

        // Don't trigger if user is typing in input/textarea
        const target = e.target as HTMLElement
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
            return
        }

        const matchedShortcut = shortcuts.find(shortcut => {
            const keyMatches = e.key.toLowerCase() === shortcut.key.toLowerCase()
            const ctrlMatches = shortcut.ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey
            const altMatches = shortcut.alt ? e.altKey : !e.altKey
            const shiftMatches = shortcut.shift ? e.shiftKey : !e.shiftKey

            return keyMatches && ctrlMatches && altMatches && shiftMatches
        })

        if (matchedShortcut) {
            e.preventDefault()
            matchedShortcut.action()
        }
    }, [shortcuts, enabled])

    useEffect(() => {
        window.addEventListener('keydown', handleKeydown)
        return () => window.removeEventListener('keydown', handleKeydown)
    }, [handleKeydown])
}

// Modal to display available shortcuts
interface ShortcutsModalProps {
    isOpen: boolean
    onClose: () => void
    shortcuts: Shortcut[]
}

export function ShortcutsModal({ isOpen, onClose, shortcuts }: ShortcutsModalProps) {
    if (!isOpen) return null

    const formatShortcut = (shortcut: Shortcut) => {
        const keys = []
        if (shortcut.ctrl) keys.push('Ctrl')
        if (shortcut.alt) keys.push('Alt')
        if (shortcut.shift) keys.push('Shift')
        keys.push(shortcut.key.toUpperCase())
        return keys
    }

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
            <div className="bg-(--bg-card) rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-(--border-color)">
                    <h2 className="text-xl font-bold text-(--text-primary)">Keyboard Shortcuts</h2>
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

                {/* Shortcuts List */}
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    <div className="grid gap-4">
                        {shortcuts.map((shortcut, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-4 bg-(--bg-secondary) rounded-xl"
                            >
                                <p className="text-sm text-(--text-primary)">{shortcut.description}</p>
                                <div className="flex items-center gap-1">
                                    {formatShortcut(shortcut).map((key, i) => (
                                        <span key={i}>
                                            <span className="kbd">{key}</span>
                                            {i < formatShortcut(shortcut).length - 1 && (
                                                <span className="mx-1 text-(--text-muted)">+</span>
                                            )}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-(--border-color) bg-(--bg-secondary)">
                    <p className="text-xs text-(--text-muted) text-center">
                        Press <span className="kbd">?</span> to toggle this help
                    </p>
                </div>
            </div>
        </div>
    )
}

// Default shortcuts for Inbox3
export const DEFAULT_SHORTCUTS: Shortcut[] = [
    {
        key: 'n',
        ctrl: true,
        description: 'Start new message',
        action: () => { }
    },
    {
        key: 's',
        ctrl: true,
        description: 'Open settings',
        action: () => { }
    },
    {
        key: '/',
        description: 'Focus search',
        action: () => { }
    },
    {
        key: 'Escape',
        description: 'Close modal/panel',
        action: () => { }
    },
    {
        key: 'g',
        description: 'Toggle groups view',
        action: () => { }
    },
    {
        key: 'd',
        description: 'Toggle DMs view',
        action: () => { }
    },
    {
        key: '?',
        shift: true,
        description: 'Show keyboard shortcuts',
        action: () => { }
    },
    {
        key: 'r',
        ctrl: true,
        description: 'Refresh messages',
        action: () => { }
    }
]
