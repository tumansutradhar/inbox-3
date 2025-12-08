/**
 * SkipLink - Accessibility component for keyboard navigation
 * Allows keyboard users to skip to main content
 */

interface SkipLinkProps {
    targetId?: string
    label?: string
}

export function SkipLink({
    targetId = 'main-content',
    label = 'Skip to main content'
}: SkipLinkProps) {
    return (
        <a
            href={`#${targetId}`}
            className="
                sr-only focus:not-sr-only
                fixed top-0 left-0 z-9999
                px-4 py-2 m-2
                bg-(--primary-brand) text-white
                rounded-lg font-medium text-sm
                focus:outline-none focus:ring-2 focus:ring-(--primary-brand)/50
                transition-transform
                -translate-y-full focus:translate-y-0
            "
        >
            {label}
        </a>
    )
}

export default SkipLink
