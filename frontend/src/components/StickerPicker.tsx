import { useState } from 'react'

interface StickerPack {
    id: string
    name: string
    stickers: string[]
}

const STICKER_PACKS: StickerPack[] = [
    {
        id: 'cute-animals',
        name: 'Cute Animals',
        stickers: [
            'https://cdn-icons-png.flaticon.com/512/375/375086.png', // Panda
            'https://cdn-icons-png.flaticon.com/512/375/375095.png', // Bear
            'https://cdn-icons-png.flaticon.com/512/375/375073.png', // Cat
            'https://cdn-icons-png.flaticon.com/512/375/375110.png', // Dog
            'https://cdn-icons-png.flaticon.com/512/375/375066.png', // Rabbit
            'https://cdn-icons-png.flaticon.com/512/375/375082.png', // Koala
        ],
    },
    {
        id: 'reactions',
        name: 'Reactions',
        stickers: [
            'https://cdn-icons-png.flaticon.com/512/742/742751.png', // LOL
            'https://cdn-icons-png.flaticon.com/512/742/742923.png', // OMG
            'https://cdn-icons-png.flaticon.com/512/742/742752.png', // COOL
            'https://cdn-icons-png.flaticon.com/512/742/742823.png', // WOW
            'https://cdn-icons-png.flaticon.com/512/742/742774.png', // LOVE
            'https://cdn-icons-png.flaticon.com/512/742/742952.png', // BYE
        ]
    }
]

interface StickerPickerProps {
    onSelect: (url: string) => void
    onClose: () => void
}

export default function StickerPicker({ onSelect, onClose }: StickerPickerProps) {
    const [activePack, setActivePack] = useState(STICKER_PACKS[0])

    return (
        <div className="absolute bottom-full mb-2 left-0 w-72 bg-(--bg-card) rounded-2xl shadow-xl border border-(--border-color) overflow-hidden animate-scale-in z-120">
            {/* Pack Selector */}
            <div className="flex overflow-x-auto p-2 bg-(--bg-secondary) border-b border-(--border-color) scrollbar-hide">
                {STICKER_PACKS.map(pack => (
                    <button
                        key={pack.id}
                        onClick={() => setActivePack(pack)}
                        className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap mr-2 transition-colors ${activePack.id === pack.id
                            ? 'bg-(--primary-brand) text-white'
                            : 'bg-(--bg-card) text-(--text-secondary) hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                    >
                        {pack.name}
                    </button>
                ))}
            </div>

            <div className="h-64 overflow-y-auto p-4">
                <div className="grid grid-cols-3 gap-4">
                    {activePack.stickers.map((url, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                onSelect(url)
                                onClose()
                            }}
                            className="hover:scale-110 transition-transform duration-200"
                        >
                            <img src={url} alt="Sticker" className="w-full h-auto drop-shadow-md" />
                        </button>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="p-2 border-t border-(--border-color) bg-(--bg-secondary) flex justify-between items-center">
                <span className="text-[10px] text-(--text-muted)">Stickers</span>
                <button onClick={onClose} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
            </div>
        </div>
    )
}
