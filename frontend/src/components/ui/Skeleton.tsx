interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

export function Skeleton({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'pulse'
}: SkeletonProps) {
  const variantStyles = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg'
  }

  const animationStyles = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: ''
  }

  const style: React.CSSProperties = {}
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height

  return (
    <div
      className={`
        bg-linear-to-r from-(--bg-secondary) via-(--bg-tertiary) to-(--bg-secondary)
        bg-size-[200%_100%]
        ${variantStyles[variant]}
        ${animationStyles[animation]}
        ${className}
      `}
      style={style}
      aria-busy="true"
      aria-live="polite"
    />
  )
}

// Preset skeleton components for common use cases
export function MessageSkeleton() {
  return (
    <div className="flex gap-3 p-4 animate-pulse">
      <Skeleton variant="circular" width={40} height={40} />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton variant="text" width={120} height={16} />
          <Skeleton variant="text" width={60} height={12} />
        </div>
        <Skeleton variant="text" width="100%" height={14} />
        <Skeleton variant="text" width="80%" height={14} />
      </div>
    </div>
  )
}

export function ContactSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 animate-pulse">
      <Skeleton variant="circular" width={36} height={36} />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" width="60%" height={14} />
        <Skeleton variant="text" width="40%" height={12} />
      </div>
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="p-6 space-y-4 bg-(--bg-card) rounded-2xl animate-pulse">
      <Skeleton variant="text" width="40%" height={20} />
      <Skeleton variant="text" width="100%" height={14} />
      <Skeleton variant="text" width="90%" height={14} />
      <Skeleton variant="text" width="70%" height={14} />
      <div className="flex gap-2 pt-4">
        <Skeleton variant="rectangular" width={100} height={36} />
        <Skeleton variant="rectangular" width={100} height={36} />
      </div>
    </div>
  )
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <MessageSkeleton key={i} />
      ))}
    </div>
  )
}
