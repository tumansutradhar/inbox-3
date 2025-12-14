export interface BadgeProps {
    children: React.ReactNode
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
    size?: 'sm' | 'md'
    dot?: boolean
    className?: string
}

export function Badge({
    children,
    variant = 'default',
    size = 'md',
    dot = false,
    className = ''
}: BadgeProps) {
    const variantStyles = {
        default: 'bg-(--bg-secondary) text-(--text-secondary)',
        primary: 'bg-(--primary-brand-light) text-(--primary-brand)',
        success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    }

    const sizeStyles = {
        sm: 'px-1.5 py-0.5 text-[10px]',
        md: 'px-2 py-0.5 text-xs'
    }

    return (
        <span
            className={`
        inline-flex items-center gap-1 font-medium rounded-full
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
        >
            {dot && (
                <span
                    className={`
            w-1.5 h-1.5 rounded-full
            ${variant === 'success' ? 'bg-green-500' : ''}
            ${variant === 'warning' ? 'bg-amber-500' : ''}
            ${variant === 'danger' ? 'bg-red-500' : ''}
            ${variant === 'info' ? 'bg-blue-500' : ''}
            ${variant === 'primary' ? 'bg-(--primary-brand)' : ''}
            ${variant === 'default' ? 'bg-(--text-muted)' : ''}
          `}
                />
            )}
            {children}
        </span>
    )
}
