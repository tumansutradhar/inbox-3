import { useEffect } from 'react'
import { type Notification } from '../lib/notifications'

interface NotificationProps {
  notifications: Notification[]
  onDismiss: (id: string) => void
}

export default function NotificationSystem({ notifications, onDismiss }: NotificationProps) {
  useEffect(() => {
    notifications.forEach(notification => {
      if (notification.duration && notification.duration > 0) {
        const timer = setTimeout(() => {
          onDismiss(notification.id)
        }, notification.duration)

        return () => clearTimeout(timer)
      }
    })
  }, [notifications, onDismiss])

  const getNotificationStyle = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'notification-success'
      case 'info':
        return 'notification-info'
      case 'warning':
        return 'notification-warning'
      case 'error':
        return 'notification-error'
      default:
        return 'notification-info'
    }
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 6L9 17L4 12" />
          </svg>
        )
      case 'info':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16V12" />
            <path d="M12 8h.01" />
          </svg>
        )
      case 'warning':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
            <path d="M2 12L12 2L22 12L12 22Z" />
          </svg>
        )
      case 'error':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M15 9L9 15" />
            <path d="M9 9L15 15" />
          </svg>
        )
      default:
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16V12" />
            <path d="M12 8h.01" />
          </svg>
        )
    }
  }

  if (notifications.length === 0) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-[140] space-y-3 max-w-sm">
      {notifications.map(notification => (
        <div key={notification.id} className={`notification ${getNotificationStyle(notification.type)}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="shrink-0">
                {getNotificationIcon(notification.type)}
              </div>
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
            <button onClick={() => onDismiss(notification.id)} className="ml-3 shrink-0 w-5 h-5 rounded flex items-center justify-center hover:bg-white hover:bg-opacity-20 transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18" />
                <path d="M6 6L18 18" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
