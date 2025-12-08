import { forwardRef } from 'react'

export interface BreadcrumbItem {
    label: string
    href?: string
    onClick?: () => void
    icon?: React.ReactNode
}

export interface BreadcrumbsProps {
    items: BreadcrumbItem[]
    separator?: React.ReactNode
    maxItems?: number
    className?: string
}

/**
 * Breadcrumbs component for multi-pane navigation context
 * Shows the current location within a hierarchy
 */
export const Breadcrumbs = forwardRef<HTMLElement, BreadcrumbsProps>(
    ({ items, separator, maxItems = 4, className = '' }, ref) => {
        const defaultSeparator = (
            <svg
                className="w-4 h-4 text-(--text-muted)"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
        )

        // Collapse items if too many
        const displayItems = items.length > maxItems
            ? [
                items[0],
                { label: '...', onClick: undefined, href: undefined },
                ...items.slice(-2)
            ]
            : items

        return (
            <nav
                ref={ref}
                aria-label="Breadcrumb"
                className={`flex items-center ${className}`}
            >
                <ol className="flex items-center gap-1 text-sm" role="list">
                    {displayItems.map((item, index) => {
                        const isLast = index === displayItems.length - 1
                        const isClickable = item.href || item.onClick

                        return (
                            <li key={index} className="flex items-center gap-1">
                                {index > 0 && (
                                    <span className="mx-1" aria-hidden="true">
                                        {separator || defaultSeparator}
                                    </span>
                                )}

                                {isLast ? (
                                    <span
                                        className="font-medium text-(--text-primary)"
                                        aria-current="page"
                                    >
                                        {item.icon && <span className="mr-1.5">{item.icon}</span>}
                                        {item.label}
                                    </span>
                                ) : isClickable ? (
                                    <button
                                        onClick={item.onClick}
                                        className="flex items-center text-(--text-secondary) hover:text-(--primary-brand) transition-colors"
                                    >
                                        {item.icon && <span className="mr-1.5">{item.icon}</span>}
                                        {item.label}
                                    </button>
                                ) : (
                                    <span className="flex items-center text-(--text-muted)">
                                        {item.icon && <span className="mr-1.5">{item.icon}</span>}
                                        {item.label}
                                    </span>
                                )}
                            </li>
                        )
                    })}
                </ol>
            </nav>
        )
    }
)

Breadcrumbs.displayName = 'Breadcrumbs'

/**
 * Context header for multi-pane views
 * Shows breadcrumbs with optional actions
 */
export interface ContextHeaderProps {
    breadcrumbs: BreadcrumbItem[]
    title?: string
    subtitle?: string
    actions?: React.ReactNode
    backAction?: () => void
    className?: string
}

export function ContextHeader({
    breadcrumbs,
    title,
    subtitle,
    actions,
    backAction,
    className = ''
}: ContextHeaderProps) {
    return (
        <header className={`border-b border-(--border-default) bg-(--bg-secondary) px-4 py-3 ${className}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {backAction && (
                        <button
                            onClick={backAction}
                            className="p-1.5 -ml-1.5 rounded-lg hover:bg-(--bg-tertiary) text-(--text-secondary) hover:text-(--text-primary) transition-colors lg:hidden"
                            aria-label="Go back"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                    )}

                    <div>
                        <Breadcrumbs items={breadcrumbs} className="hidden sm:flex" />

                        {title && (
                            <h1 className="text-lg font-semibold text-(--text-primary) mt-1">
                                {title}
                            </h1>
                        )}

                        {subtitle && (
                            <p className="text-sm text-(--text-secondary)">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>

                {actions && (
                    <div className="flex items-center gap-2">
                        {actions}
                    </div>
                )}
            </div>
        </header>
    )
}

export default Breadcrumbs
