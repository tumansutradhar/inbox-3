import { forwardRef } from 'react'

export interface IconButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon: React.ReactNode
    variant?: 'default' | 'ghost' | 'outline'
    size?: 'xs' | 'sm' | 'md' | 'lg'
    label: string // Required for accessibility
    badge?: number | string
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
    (
        {
            icon,
            variant = 'ghost',
            size = 'md',
            label,
            badge,
            className = '',
            disabled,
            ...props
        },
        ref
    ) => {
        const baseStyles = `
      relative inline-flex items-center justify-center
      rounded-xl transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-(--primary-brand)/50
      disabled:opacity-50 disabled:cursor-not-allowed
    `

        const variantStyles = {
            default: 'bg-(--bg-secondary) text-(--text-primary) hover:bg-(--border-color)',
            ghost: 'text-(--text-secondary) hover:bg-(--bg-secondary) hover:text-(--text-primary)',
            outline:
                'border border-(--border-color) text-(--text-secondary) hover:border-(--primary-brand) hover:text-(--primary-brand)'
        }

        const sizeStyles = {
            xs: 'p-1',
            sm: 'p-1.5',
            md: 'p-2',
            lg: 'p-3'
        }

        const iconSizeStyles = {
            xs: '[&>svg]:w-3 [&>svg]:h-3',
            sm: '[&>svg]:w-4 [&>svg]:h-4',
            md: '[&>svg]:w-5 [&>svg]:h-5',
            lg: '[&>svg]:w-6 [&>svg]:h-6'
        }

        return (
            <button
                ref={ref}
                className={`
          ${baseStyles}
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${iconSizeStyles[size]}
          ${className}
        `.trim().replace(/\s+/g, ' ')}
                disabled={disabled}
                aria-label={label}
                title={label}
                {...props}
            >
                {icon}
                {badge !== undefined && (
                    <span
                        className="
              absolute -top-1 -right-1
              min-w-[18px] h-[18px] px-1
              flex items-center justify-center
              text-[10px] font-bold text-white
              bg-(--primary-brand) rounded-full
            "
                    >
                        {typeof badge === 'number' && badge > 99 ? '99+' : badge}
                    </span>
                )}
            </button>
        )
    }
)

IconButton.displayName = 'IconButton'
