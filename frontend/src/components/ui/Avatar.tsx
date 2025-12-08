export interface AvatarProps {
    address?: string
    name?: string
    src?: string
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    showStatus?: boolean
    status?: 'online' | 'offline' | 'away' | 'busy'
    className?: string
}

// Generate a consistent color based on the address/name
function getAvatarColor(seed: string): string {
    const colors = [
        'bg-red-500',
        'bg-orange-500',
        'bg-amber-500',
        'bg-yellow-500',
        'bg-lime-500',
        'bg-green-500',
        'bg-emerald-500',
        'bg-teal-500',
        'bg-cyan-500',
        'bg-sky-500',
        'bg-blue-500',
        'bg-indigo-500',
        'bg-violet-500',
        'bg-purple-500',
        'bg-fuchsia-500',
        'bg-pink-500',
        'bg-rose-500'
    ]

    let hash = 0
    for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash)
    }

    return colors[Math.abs(hash) % colors.length]
}

function getInitials(address?: string, name?: string): string {
    if (name) {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }
    if (address) {
        return address.slice(2, 4).toUpperCase()
    }
    return '??'
}

export function Avatar({
    address,
    name,
    src,
    size = 'md',
    showStatus = false,
    status = 'offline',
    className = ''
}: AvatarProps) {
    const sizeStyles = {
        xs: 'w-6 h-6 text-xs',
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
        xl: 'w-16 h-16 text-lg'
    }

    const statusSizeStyles = {
        xs: 'w-1.5 h-1.5',
        sm: 'w-2 h-2',
        md: 'w-2.5 h-2.5',
        lg: 'w-3 h-3',
        xl: 'w-4 h-4'
    }

    const statusColorStyles = {
        online: 'bg-(--success-green)',
        offline: 'bg-(--text-muted)',
        away: 'bg-(--warning-yellow)',
        busy: 'bg-(--error-red)'
    }

    const colorClass = getAvatarColor(address || name || 'default')
    const initials = getInitials(address, name)

    return (
        <div className={`relative inline-flex ${className}`}>
            {src ? (
                <img
                    src={src}
                    alt={name || address || 'Avatar'}
                    className={`${sizeStyles[size]} rounded-full object-cover ring-2 ring-(--border-color)`}
                />
            ) : (
                <div
                    className={`
            ${sizeStyles[size]} ${colorClass}
            rounded-full flex items-center justify-center
            font-semibold text-white
            ring-2 ring-(--border-color)
          `}
                    title={address || name}
                >
                    {initials}
                </div>
            )}
            {showStatus && (
                <span
                    className={`
            absolute bottom-0 right-0
            ${statusSizeStyles[size]}
            ${statusColorStyles[status]}
            rounded-full ring-2 ring-(--bg-card)
          `}
                    aria-label={`Status: ${status}`}
                />
            )}
        </div>
    )
}
