import { useState, useEffect } from 'react'

interface LinkMetadata {
    url: string
    title?: string
    description?: string
    image?: string
    siteName?: string
    favicon?: string
}

interface LinkPreviewProps {
    url: string
    compact?: boolean
}

export default function LinkPreview({ url, compact = false }: LinkPreviewProps) {
    const [metadata, setMetadata] = useState<LinkMetadata | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        fetchMetadata(url)
    }, [url])

    const fetchMetadata = async (url: string) => {
        try {
            setLoading(true)
            setError(false)

            // In a real app, you'd call a backend API that fetches Open Graph data
            // For now, we'll create a basic preview from the URL
            const urlObj = new URL(url)
            const domain = urlObj.hostname.replace('www.', '')

            // Simulated metadata - in production, fetch from a metadata service
            const simulatedMetadata: LinkMetadata = {
                url,
                title: `Link from ${domain}`,
                description: url,
                siteName: domain,
                favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
            }

            setMetadata(simulatedMetadata)
        } catch (err) {
            console.error('Error fetching link metadata:', err)
            setError(true)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="skeleton h-24 w-full rounded-xl" />
        )
    }

    if (error || !metadata) {
        return (
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline break-all"
            >
                {url}
            </a>
        )
    }

    if (compact) {
        return (
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 bg-(--bg-secondary) rounded-lg hover:bg-(--bg-card) transition-colors group"
            >
                {metadata.favicon && (
                    <img
                        src={metadata.favicon}
                        alt=""
                        className="w-4 h-4"
                        onError={(e) => e.currentTarget.style.display = 'none'}
                    />
                )}
                <span className="text-sm text-(--text-primary) group-hover:text-(--primary-brand) transition-colors truncate">
                    {metadata.title || metadata.siteName || url}
                </span>
                <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-(--text-muted) flex-shrink-0"
                >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
            </a>
        )
    }

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="block max-w-md border border-(--border-color) rounded-xl overflow-hidden hover:shadow-md transition-all group"
        >
            {metadata.image && (
                <div className="aspect-video bg-(--bg-secondary) overflow-hidden">
                    <img
                        src={metadata.image}
                        alt={metadata.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => e.currentTarget.parentElement!.style.display = 'none'}
                    />
                </div>
            )}
            <div className="p-4">
                <div className="flex items-start gap-3">
                    {metadata.favicon && (
                        <img
                            src={metadata.favicon}
                            alt=""
                            className="w-6 h-6 mt-1"
                            onError={(e) => e.currentTarget.style.display = 'none'}
                        />
                    )}
                    <div className="flex-1 min-w-0">
                        {metadata.title && (
                            <h3 className="font-semibold text-(--text-primary) line-clamp-2 group-hover:text-(--primary-brand) transition-colors">
                                {metadata.title}
                            </h3>
                        )}
                        {metadata.description && (
                            <p className="text-sm text-(--text-secondary) line-clamp-2 mt-1">
                                {metadata.description}
                            </p>
                        )}
                        {metadata.siteName && (
                            <p className="text-xs text-(--text-muted) mt-2 flex items-center gap-1">
                                <span>{metadata.siteName}</span>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                    <polyline points="15 3 21 3 21 9" />
                                    <line x1="10" y1="14" x2="21" y2="3" />
                                </svg>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </a>
    )
}

// Function to detect URLs in text
export function detectURLs(text: string): string[] {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    return text.match(urlRegex) || []
}

// Component to render text with link previews
interface MessageWithLinksProps {
    content: string
    showPreviews?: boolean
}

export function MessageWithLinks({ content, showPreviews = true }: MessageWithLinksProps) {
    const urls = detectURLs(content)

    if (urls.length === 0) {
        return <p className="text-sm text-(--text-primary) whitespace-pre-wrap">{content}</p>
    }

    // Split content by URLs and render with previews
    const parts = content.split(/(https?:\/\/[^\s]+)/g)

    return (
        <div className="space-y-2">
            <p className="text-sm text-(--text-primary) whitespace-pre-wrap">
                {parts.map((part, index) => {
                    if (part.match(/^https?:\/\//)) {
                        return (
                            <a
                                key={index}
                                href={part}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline break-all"
                            >
                                {part}
                            </a>
                        )
                    }
                    return <span key={index}>{part}</span>
                })}
            </p>

            {showPreviews && urls.length > 0 && (
                <div className="space-y-2">
                    {urls.slice(0, 2).map((url, index) => (
                        <LinkPreview key={index} url={url} />
                    ))}
                    {urls.length > 2 && (
                        <p className="text-xs text-(--text-muted)">
                            + {urls.length - 2} more link{urls.length - 2 > 1 ? 's' : ''}
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}
