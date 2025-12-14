import React from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'outlined' | 'elevated' | 'glass'
    padding?: 'none' | 'sm' | 'md' | 'lg'
    hoverable?: boolean
    clickable?: boolean
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    (
        {
            variant = 'default',
            padding = 'md',
            hoverable = false,
            clickable = false,
            className = '',
            children,
            ...props
        },
        ref
    ) => {
        const baseStyles = 'rounded-2xl transition-all duration-200'

        const variantStyles = {
            default: 'bg-(--bg-card) border border-(--border-color)',
            outlined: 'bg-transparent border-2 border-(--border-color)',
            elevated: 'bg-(--bg-card) shadow-lg border border-(--border-color)/50',
            glass: 'bg-(--glass-bg) backdrop-blur-xl border border-(--glass-border)'
        }

        const paddingStyles = {
            none: '',
            sm: 'p-3',
            md: 'p-5',
            lg: 'p-8'
        }

        const interactiveStyles = `
      ${hoverable ? 'hover:shadow-lg hover:-translate-y-0.5' : ''}
      ${clickable ? 'cursor-pointer active:scale-[0.99]' : ''}
    `

        return (
            <div
                ref={ref}
                className={`
          ${baseStyles}
          ${variantStyles[variant]}
          ${paddingStyles[padding]}
          ${interactiveStyles}
          ${className}
        `.trim().replace(/\s+/g, ' ')}
                {...props}
            >
                {children}
            </div>
        )
    }
)

Card.displayName = 'Card'
