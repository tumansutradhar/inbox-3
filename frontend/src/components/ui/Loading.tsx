export interface SpinnerProps {
    size?: 'xs' | 'sm' | 'md' | 'lg'
    className?: string
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
    const sizeStyles = {
        xs: 'w-3 h-3 border',
        sm: 'w-4 h-4 border-2',
        md: 'w-6 h-6 border-2',
        lg: 'w-8 h-8 border-2'
    }

    return (
        <div
            className={`
        ${sizeStyles[size]}
        rounded-full
        border-(--border-color) border-t-(--primary-brand)
        animate-spin
        ${className}
      `.trim().replace(/\s+/g, ' ')}
            role="status"
            aria-label="Loading"
        >
            <span className="sr-only">Loading...</span>
        </div>
    )
}

export interface SkeletonProps {
    variant?: 'text' | 'circular' | 'rectangular'
    width?: string | number
    height?: string | number
    lines?: number
    className?: string
}

export function Skeleton({
    variant = 'text',
    width,
    height,
    lines = 1,
    className = ''
}: SkeletonProps) {
    const baseStyles = 'animate-pulse bg-(--bg-secondary)'

    const variantStyles = {
        text: 'h-4 rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-lg'
    }

    const style: React.CSSProperties = {
        width: width || (variant === 'circular' ? height : '100%'),
        height: height || (variant === 'text' ? undefined : '100%')
    }

    if (variant === 'text' && lines > 1) {
        return (
            <div className={`space-y-2 ${className}`}>
                {Array.from({ length: lines }).map((_, i) => (
                    <div
                        key={i}
                        className={`${baseStyles} ${variantStyles[variant]}`}
                        style={{
                            ...style,
                            width: i === lines - 1 ? '75%' : '100%'
                        }}
                    />
                ))}
            </div>
        )
    }

    return (
        <div
            className={`${baseStyles} ${variantStyles[variant]} ${className}`}
            style={style}
        />
    )
}
