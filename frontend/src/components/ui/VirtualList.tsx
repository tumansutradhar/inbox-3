/**
 * VirtualList - Efficient virtualized list for long lists
 * Only renders visible items for better performance
 */

import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { Skeleton } from './Loading'

export interface VirtualListProps<T> {
    items: T[]
    itemHeight: number
    overscan?: number
    renderItem: (item: T, index: number) => React.ReactNode
    keyExtractor: (item: T, index: number) => string
    onEndReached?: () => void
    endReachedThreshold?: number
    loading?: boolean
    loadingCount?: number
    className?: string
    containerClassName?: string
}

export function VirtualList<T>({
    items,
    itemHeight,
    overscan = 5,
    renderItem,
    keyExtractor,
    onEndReached,
    endReachedThreshold = 200,
    loading = false,
    loadingCount = 3,
    className = '',
    containerClassName = ''
}: VirtualListProps<T>) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [scrollTop, setScrollTop] = useState(0)
    const [containerHeight, setContainerHeight] = useState(0)

    // Calculate visible range
    const { startIndex, endIndex, totalHeight } = useMemo(() => {
        const totalHeight = items.length * itemHeight
        const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
        const visibleCount = Math.ceil(containerHeight / itemHeight)
        const endIndex = Math.min(items.length - 1, startIndex + visibleCount + overscan * 2)

        return { startIndex, endIndex, totalHeight }
    }, [items.length, itemHeight, scrollTop, containerHeight, overscan])

    // Get visible items
    const visibleItems = useMemo(() => {
        return items.slice(startIndex, endIndex + 1)
    }, [items, startIndex, endIndex])

    // Handle scroll
    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const target = e.target as HTMLDivElement
        setScrollTop(target.scrollTop)

        // Check if we've reached the end
        if (onEndReached) {
            const distanceFromEnd = target.scrollHeight - target.scrollTop - target.clientHeight
            if (distanceFromEnd < endReachedThreshold) {
                onEndReached()
            }
        }
    }, [onEndReached, endReachedThreshold])

    // Update container height on resize
    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setContainerHeight(entry.contentRect.height)
            }
        })

        resizeObserver.observe(container)
        setContainerHeight(container.clientHeight)

        return () => resizeObserver.disconnect()
    }, [])

    return (
        <div
            ref={containerRef}
            onScroll={handleScroll}
            className={`overflow-auto ${containerClassName}`}
            style={{ height: '100%' }}
        >
            <div
                style={{ height: totalHeight, position: 'relative' }}
                className={className}
            >
                {visibleItems.map((item, relativeIndex) => {
                    const actualIndex = startIndex + relativeIndex
                    return (
                        <div
                            key={keyExtractor(item, actualIndex)}
                            style={{
                                position: 'absolute',
                                top: actualIndex * itemHeight,
                                height: itemHeight,
                                width: '100%'
                            }}
                        >
                            {renderItem(item, actualIndex)}
                        </div>
                    )
                })}

                {/* Loading skeletons */}
                {loading && (
                    <div
                        style={{
                            position: 'absolute',
                            top: totalHeight,
                            width: '100%'
                        }}
                    >
                        {Array.from({ length: loadingCount }).map((_, i) => (
                            <div key={`loading-${i}`} style={{ height: itemHeight }} className="p-4">
                                <div className="flex items-start gap-3">
                                    <Skeleton variant="circular" width={40} height={40} />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton width="60%" height={14} />
                                        <Skeleton width="100%" height={14} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

/**
 * InfiniteScroll - Simple infinite scroll wrapper
 */
export interface InfiniteScrollProps {
    children: React.ReactNode
    onLoadMore: () => void
    hasMore: boolean
    loading?: boolean
    threshold?: number
    loadingComponent?: React.ReactNode
    endComponent?: React.ReactNode
    className?: string
}

export function InfiniteScroll({
    children,
    onLoadMore,
    hasMore,
    loading = false,
    threshold = 200,
    loadingComponent,
    endComponent,
    className = ''
}: InfiniteScrollProps) {
    const sentinelRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const sentinel = sentinelRef.current
        if (!sentinel || !hasMore || loading) return

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    onLoadMore()
                }
            },
            { rootMargin: `${threshold}px` }
        )

        observer.observe(sentinel)
        return () => observer.disconnect()
    }, [onLoadMore, hasMore, loading, threshold])

    return (
        <div className={className}>
            {children}

            {/* Sentinel for intersection observer */}
            <div ref={sentinelRef} style={{ height: 1 }} />

            {/* Loading indicator */}
            {loading && (loadingComponent || (
                <div className="flex justify-center py-4">
                    <div className="w-6 h-6 border-2 border-(--border-color) border-t-(--primary-brand) rounded-full animate-spin" />
                </div>
            ))}

            {/* End of list */}
            {!hasMore && !loading && endComponent}
        </div>
    )
}

/**
 * Pagination - Simple pagination component
 */
export interface PaginationProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    showFirstLast?: boolean
    maxVisiblePages?: number
    className?: string
}

export function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    showFirstLast = true,
    maxVisiblePages = 5,
    className = ''
}: PaginationProps) {
    const pages = useMemo(() => {
        const result: (number | 'ellipsis')[] = []
        const half = Math.floor(maxVisiblePages / 2)
        let start = Math.max(1, currentPage - half)
        const end = Math.min(totalPages, start + maxVisiblePages - 1)

        if (end - start < maxVisiblePages - 1) {
            start = Math.max(1, end - maxVisiblePages + 1)
        }

        if (start > 1) {
            result.push(1)
            if (start > 2) result.push('ellipsis')
        }

        for (let i = start; i <= end; i++) {
            result.push(i)
        }

        if (end < totalPages) {
            if (end < totalPages - 1) result.push('ellipsis')
            result.push(totalPages)
        }

        return result
    }, [currentPage, totalPages, maxVisiblePages])

    if (totalPages <= 1) return null

    return (
        <nav
            className={`flex items-center justify-center gap-1 ${className}`}
            aria-label="Pagination"
        >
            {showFirstLast && (
                <button
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg text-(--text-secondary) hover:bg-(--bg-secondary) disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="First page"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="11 17 6 12 11 7" />
                        <polyline points="18 17 13 12 18 7" />
                    </svg>
                </button>
            )}

            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg text-(--text-secondary) hover:bg-(--bg-secondary) disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6" />
                </svg>
            </button>

            {pages.map((page, index) => (
                page === 'ellipsis' ? (
                    <span key={`ellipsis-${index}`} className="px-2 text-(--text-muted)">...</span>
                ) : (
                    <button
                        key={page}
                        onClick={() => onPageChange(page as number)}
                        className={`
                            min-w-9 h-9 rounded-lg text-sm font-medium transition-colors
                            ${currentPage === page
                                ? 'bg-(--primary-brand) text-white'
                                : 'text-(--text-secondary) hover:bg-(--bg-secondary)'
                            }
                        `}
                        aria-current={currentPage === page ? 'page' : undefined}
                    >
                        {page}
                    </button>
                )
            ))}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg text-(--text-secondary) hover:bg-(--bg-secondary) disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                </svg>
            </button>

            {showFirstLast && (
                <button
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg text-(--text-secondary) hover:bg-(--bg-secondary) disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Last page"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="13 17 18 12 13 7" />
                        <polyline points="6 17 11 12 6 7" />
                    </svg>
                </button>
            )}
        </nav>
    )
}

export default VirtualList
