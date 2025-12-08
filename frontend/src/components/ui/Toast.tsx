import { useEffect, useState } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastProps {
  id?: string
  type?: ToastType
  title?: string
  message: string
  duration?: number
  onClose?: () => void
}

export function Toast({
  type = 'info',
  title,
  message,
  duration = 5000,
  onClose
}: ToastProps) {
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsExiting(true)
        setTimeout(() => onClose?.(), 300)
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const icons = {
    success: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    error: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
    warning: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    info: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    )
  }

  const colors = {
    success: {
      bg: 'var(--success-light)',
      border: 'var(--success-green)',
      text: 'var(--success-green)',
      iconBg: 'var(--success-green)'
    },
    error: {
      bg: 'var(--error-light)',
      border: 'var(--error-red)',
      text: 'var(--error-red)',
      iconBg: 'var(--error-red)'
    },
    warning: {
      bg: 'var(--warning-light)',
      border: 'var(--warning-yellow)',
      text: 'var(--warning-yellow)',
      iconBg: 'var(--warning-yellow)'
    },
    info: {
      bg: 'var(--info-light)',
      border: 'var(--info-blue)',
      text: 'var(--info-blue)',
      iconBg: 'var(--info-blue)'
    }
  }

  const style = colors[type]

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`
        flex items-start gap-3 p-4 rounded-xl shadow-lg border
        backdrop-blur-sm transition-all duration-300
        ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
      `}
      style={{
        background: style.bg,
        borderColor: style.border
      }}
    >
      {/* Icon */}
      <div
        className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
        style={{ background: `${style.iconBg}20`, color: style.iconBg }}
      >
        {icons[type]}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <h4
            className="font-semibold text-sm mb-0.5"
            style={{ color: style.text }}
          >
            {title}
          </h4>
        )}
        <p
          className="text-sm"
          style={{ color: 'var(--text-primary)' }}
        >
          {message}
        </p>
      </div>

      {/* Close button */}
      <button
        onClick={() => {
          setIsExiting(true)
          setTimeout(() => onClose?.(), 300)
        }}
        className="shrink-0 p-1 rounded-full hover:bg-black/5 transition-colors"
        aria-label="Dismiss notification"
        style={{ color: style.text }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  )
}

// Toast Container Component
interface ToastContainerProps {
  toasts: (ToastProps & { id: string })[]
  onDismiss: (id: string) => void
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
}

export function ToastContainer({
  toasts,
  onDismiss,
  position = 'top-right'
}: ToastContainerProps) {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2'
  }

  if (toasts.length === 0) return null

  return (
    <div
      className={`fixed ${positionClasses[position]} z-(--z-toast) flex flex-col gap-3 max-w-md w-full pointer-events-none`}
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            {...toast}
            onClose={() => onDismiss(toast.id)}
          />
        </div>
      ))}
    </div>
  )
}

// Hook for managing toasts
export function useToast() {
  const [toasts, setToasts] = useState<(ToastProps & { id: string })[]>([])

  const showToast = (toast: ToastProps) => {
    const id = toast.id || `toast-${Date.now()}-${Math.random()}`
    setToasts(prev => [...prev, { ...toast, id }])
    return id
  }

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const success = (message: string, title?: string) => {
    return showToast({ type: 'success', message, title })
  }

  const error = (message: string, title?: string) => {
    return showToast({ type: 'error', message, title })
  }

  const warning = (message: string, title?: string) => {
    return showToast({ type: 'warning', message, title })
  }

  const info = (message: string, title?: string) => {
    return showToast({ type: 'info', message, title })
  }

  return {
    toasts,
    showToast,
    dismissToast,
    success,
    error,
    warning,
    info
  }
}
