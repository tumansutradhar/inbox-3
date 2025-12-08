/* eslint-disable react-refresh/only-export-components */
import { useState } from 'react'

interface Reaction {
    emoji: string
    count: number
    users: string[]
}

interface MessageReactionsProps {
    messageId: string
    reactions?: Reaction[]
    onReact: (emoji: string) => void
    currentUserAddress: string
}

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🎉', '🔥']

export default function MessageReactions({ messageId, reactions = [], onReact, currentUserAddress }: MessageReactionsProps) {
    const [showPicker, setShowPicker] = useState(false)

    const handleReaction = (emoji: string) => {
        onReact(emoji)
        setShowPicker(false)
    }

    const userHasReacted = (reaction: Reaction) => {
        return reaction.users.includes(currentUserAddress)
    }

    return (
        <div className="flex items-center gap-1 flex-wrap">
            {/* Existing Reactions */}
            {reactions.map((reaction, index) => (
                <button
                    key={`${messageId}-${reaction.emoji}-${index}`}
                    onClick={() => handleReaction(reaction.emoji)}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all ${userHasReacted(reaction)
                        ? 'bg-(--primary-brand) text-white'
                        : 'bg-(--bg-secondary) text-(--text-primary) hover:bg-(--bg-card)'
                        }`}
                >
                    <span>{reaction.emoji}</span>
                    <span className="font-medium">{reaction.count}</span>
                </button>
            ))}

            {/* Add Reaction Button */}
            <div className="relative">
                <button
                    onClick={() => setShowPicker(!showPicker)}
                    className="p-1.5 rounded-full text-(--text-muted) hover:bg-(--bg-secondary) hover:text-(--text-primary) transition-colors"
                    title="Add reaction"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                        <line x1="9" y1="9" x2="9.01" y2="9" />
                        <line x1="15" y1="9" x2="15.01" y2="9" />
                    </svg>
                </button>

                {showPicker && (
                    <div className="absolute bottom-full mb-2 left-0 bg-(--bg-card) rounded-xl shadow-lg border border-(--border-color) p-2 flex gap-1 animate-scale-in z-120">
                        {QUICK_REACTIONS.map(emoji => (
                            <button
                                key={emoji}
                                onClick={() => handleReaction(emoji)}
                                className="text-xl hover:scale-125 transition-transform p-1 rounded-lg hover:bg-(--bg-secondary)"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

// Hook for managing reactions
export function useMessageReactions() {
    const [reactions, setReactions] = useState<Record<string, Reaction[]>>({})

    const addReaction = (messageId: string, emoji: string, userAddress: string) => {
        setReactions(prev => {
            const messageReactions = prev[messageId] || []
            const existingReaction = messageReactions.find(r => r.emoji === emoji)

            if (existingReaction) {
                // Toggle reaction
                if (existingReaction.users.includes(userAddress)) {
                    existingReaction.users = existingReaction.users.filter(u => u !== userAddress)
                    existingReaction.count = existingReaction.users.length

                    if (existingReaction.count === 0) {
                        return {
                            ...prev,
                            [messageId]: messageReactions.filter(r => r.emoji !== emoji)
                        }
                    }
                } else {
                    existingReaction.users.push(userAddress)
                    existingReaction.count = existingReaction.users.length
                }

                return { ...prev, [messageId]: [...messageReactions] }
            } else {
                // Add new reaction
                return {
                    ...prev,
                    [messageId]: [
                        ...messageReactions,
                        { emoji, count: 1, users: [userAddress] }
                    ]
                }
            }
        })

        // Save to localStorage
        localStorage.setItem('inbox3_reactions', JSON.stringify(reactions))
    }

    const getReactions = (messageId: string) => {
        return reactions[messageId] || []
    }

    // Load from localStorage on mount
    const loadReactions = () => {
        const saved = localStorage.getItem('inbox3_reactions')
        if (saved) {
            setReactions(JSON.parse(saved))
        }
    }

    return { reactions, addReaction, getReactions, loadReactions }
}
