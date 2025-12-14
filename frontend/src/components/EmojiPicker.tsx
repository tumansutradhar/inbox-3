import { useState, useRef, useEffect } from 'react'

interface EmojiPickerProps {
    onSelect: (emoji: string) => void
    position?: 'top' | 'bottom'
}

const EMOJI_CATEGORIES = {
    'Smileys': ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐'],
    'Gestures': ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄'],
    'Hearts': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️', '💌', '💋', '🫶'],
    'Objects': ['💬', '💭', '🗯️', '💢', '💥', '💫', '💦', '💨', '🕳️', '💣', '💬', '👁️‍🗨️', '🗨️', '🗯️', '💭', '⭐', '🌟', '✨', '💫', '🎉', '🎊', '🎁', '🏆', '🥇', '🥈', '🥉', '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂'],
    'Nature': ['🌸', '💮', '🏵️', '🌹', '🥀', '🌺', '🌻', '🌼', '🌷', '🌱', '🪴', '🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀', '🍁', '🍂', '🍃', '🪺', '🪹', '🍇', '🍈', '🍉', '🍊', '🍋', '🍌', '🍍', '🥭', '🍎', '🍏', '🍐', '🍑', '🍒', '🍓', '🫐', '🥝', '🍅', '🫒', '🥥', '🥑', '🍆', '🥔', '🥕', '🌽', '🌶️', '🫑', '🥒', '🥬', '🥦', '🧄', '🧅', '🍄', '🥜', '🫘', '🌰'],
    'Food': ['🍕', '🍔', '🍟', '🌭', '🍿', '🧈', '🥞', '🧇', '🧀', '🍖', '🍗', '🥩', '🥓', '🍱', '🍘', '🍙', '🍚', '🍛', '🍜', '🍝', '🍠', '🍢', '🍣', '🍤', '🍥', '🥮', '🍡', '🥟', '🥠', '🥡', '🦀', '🦞', '🦐', '🦑', '🦪', '🍦', '🍧', '🍨', '🍩', '🍪', '🎂', '🍰', '🧁', '🥧', '🍫', '🍬', '🍭', '🍮', '🍯', '🍼', '🥛', '☕', '🫖', '🍵', '🍶', '🍾', '🍷', '🍸', '🍹', '🍺', '🍻', '🥂', '🥃', '🫗', '🥤', '🧋', '🧃', '🧉', '🧊'],
}

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🎉', '🔥', '💯']

export default function EmojiPicker({ onSelect, position = 'bottom' }: EmojiPickerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [activeCategory, setActiveCategory] = useState<keyof typeof EMOJI_CATEGORIES>('Smileys')
    const [search, setSearch] = useState('')
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleEmojiClick = (emoji: string) => {
        onSelect(emoji)
        setIsOpen(false)
    }

    const filteredEmojis = search
        ? Object.values(EMOJI_CATEGORIES).flat().filter(emoji => emoji.includes(search))
        : EMOJI_CATEGORIES[activeCategory]

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg hover:bg-(--bg-secondary) transition-colors text-(--text-secondary) hover:text-(--primary-brand)"
                title="Add Emoji"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                    <line x1="9" y1="9" x2="9.01" y2="9" />
                    <line x1="15" y1="9" x2="15.01" y2="9" />
                </svg>
            </button>

            {isOpen && (
                <div
                    className={`absolute ${position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'} right-0 z-120 w-[320px] bg-(--bg-card) rounded-2xl shadow-xl border border-(--border-color) overflow-hidden animate-fade-in`}
                >
                    {/* Quick Reactions */}
                    <div className="flex gap-1 p-3 border-b border-(--border-color) bg-(--bg-secondary)">
                        {QUICK_REACTIONS.map(emoji => (
                            <button
                                key={emoji}
                                onClick={() => handleEmojiClick(emoji)}
                                className="flex-1 text-xl hover:scale-125 transition-transform p-1 rounded-lg hover:bg-(--bg-card)"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="p-2 border-b border-(--border-color)">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search emoji..."
                            className="w-full px-3 py-2 text-sm bg-(--bg-secondary) rounded-lg border-none outline-none focus:ring-2 focus:ring-(--primary-brand)"
                        />
                    </div>

                    {/* Category Tabs */}
                    {!search && (
                        <div className="flex gap-1 p-2 border-b border-(--border-color) overflow-x-auto">
                            {Object.keys(EMOJI_CATEGORIES).map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat as keyof typeof EMOJI_CATEGORIES)}
                                    className={`px-3 py-1 text-xs rounded-full whitespace-nowrap transition-colors ${activeCategory === cat
                                        ? 'bg-(--primary-brand) text-white'
                                        : 'bg-(--bg-secondary) text-(--text-secondary) hover:text-(--text-primary)'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Emoji Grid */}
                    <div className="p-2 h-48 overflow-y-auto grid grid-cols-8 gap-1">
                        {filteredEmojis.map((emoji, index) => (
                            <button
                                key={`${emoji}-${index}`}
                                onClick={() => handleEmojiClick(emoji)}
                                className="text-xl p-1 rounded-lg hover:bg-(--bg-secondary) hover:scale-110 transition-all"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
