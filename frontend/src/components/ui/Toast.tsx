/**
 * Toast Notification System
 * Provides non-intrusive feedback for user actions
 */

import { useState, useCallback, createContext, useContext } from 'react'
import { IconCheckCircle, IconAlertCircle, IconAlertTriangle, IconInfo, IconX } from './Icons'

export interface Toast {
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title?: string
    message: string
    duration?: number
    action?: {
        label: string
        onClick: () => void
    }
}

interface ToastContextValue {
    toasts: Toast[]
    addToast: (toast: Omit<Toast, 'id'>) => void
    removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}

interface ToastProviderProps {
    children: React.ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`
        const newToast: Toast = { ...toast, id }
        setToasts(prev => [...prev, newToast])

        // Auto-dismiss
        if (toast.duration !== 0) {
            setTimeout(() => {
                removeToast(id)
            }, toast.duration || 5000)
        }
    }, [])

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} onDismiss={removeToast} />
        </ToastContext.Provider>
    )
}

interface ToastContainerProps {
    toasts: Toast[]
    onDismiss: (id: string) => void
}

function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
    if (toasts.length === 0) return null

    return (
        <div
            className="fixed bottom-4 right-4 z-toast flex flex-col gap-2 max-w-sm w-full pointer-events-none"
            role="region"
            aria-label="Notifications"
            aria-live="polite"
        >
            {toasts.map(toast => (
                <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
            ))}
        </div>
    )
}

interface ToastItemProps {
    toast: Toast
    onDismiss: (id: string) => void
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
    const [isExiting, setIsExiting] = useState(false)

    const handleDismiss = () => {
        setIsExiting(true)
        setTimeout(() => onDismiss(toast.id), 200)
    }

    const icons = {
        success: <IconCheckCircle size="md" className="text-(--success-green)" />,
        error: <IconAlertCircle size="md" className="text-(--error-red)" />,
        warning: <IconAlertTriangle size="md" className="text-(--warning-yellow)" />,
        info: <IconInfo size="md" className="text-(--info-blue)" />,
    }

    const bgColors = {
        success: 'bg-(--success-light) border-(--success-green)/20',
        error: 'bg-(--error-light) border-(--error-red)/20',
        warning: 'bg-(--warning-light) border-(--warning-yellow)/20',
        info: 'bg-(--info-light) border-(--info-blue)/20',
    }

    return (
        <div
            className={`
                pointer-events-auto
                flex items-start gap-3 p-4
                bg-(--bg-card) border rounded-xl shadow-lg
                ${bgColors[toast.type]}
                transition-all duration-200
                ${isExiting ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}
                animate-slide-in
            `}
            role="alert"
        >
            <div className="shrink-0 mt-0.5">{icons[toast.type]}</div>
            <div className="flex-1 min-w-0">
                {toast.title && (
                    <p className="font-semibold text-sm text-(--text-primary) mb-0.5">
                        {toast.title}
                    </p>
                )}
                <p className="text-sm text-(--text-secondary)">{toast.message}</p>
                {toast.action && (
                    <button
                        onClick={() => {
                            toast.action?.onClick()
                            handleDismiss()
                        }}
                        className="mt-2 text-sm font-medium text-(--primary-brand) hover:underline"
                    >
                        {toast.action.label}
                    </button>
                )}
            </div>
            <button
                onClick={handleDismiss}
                className="shrink-0 p-1 rounded-lg text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-secondary) transition-colors"
                aria-label="Dismiss notification"
            >
                <IconX size="sm" />
            </button>
        </div>
    )
}

// Standalone hook for simpler usage
export function useToastNotification() {
    const [toasts, setToasts] = useState<Toast[]>([])

    const toast = useCallback((options: Omit<Toast, 'id'>) => {
        const id = `toast-${Date.now()}`
        const newToast: Toast = { ...options, id }
        setToasts(prev => [...prev, newToast])

        if (options.duration !== 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id))
            }, options.duration || 5000)
        }
    }, [])

    const success = useCallback((message: string, title?: string) => {
        toast({ type: 'success', message, title })
    }, [toast])

    const error = useCallback((message: string, title?: string) => {
        toast({ type: 'error', message, title })
    }, [toast])

    const warning = useCallback((message: string, title?: string) => {
        toast({ type: 'warning', message, title })
    }, [toast])

    const info = useCallback((message: string, title?: string) => {
        toast({ type: 'info', message, title })
    }, [toast])

    const dismiss = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    return { toasts, toast, success, error, warning, info, dismiss }
}

export default ToastContainer
