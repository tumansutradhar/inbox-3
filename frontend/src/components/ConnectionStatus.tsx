/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect } from 'react'

interface ConnectionStatusProps {
    compact?: boolean
}

export default function ConnectionStatus({ compact = false }: ConnectionStatusProps) {
    const [isOnline, setIsOnline] = useState(navigator.onLine)
    const [, setLastDisconnect] = useState<number | null>(null)
    const [showNotification, setShowNotification] = useState(false)

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true)
            setShowNotification(true)
            setTimeout(() => setShowNotification(false), 3000)
        }

        const handleOffline = () => {
            setIsOnline(false)
            setLastDisconnect(Date.now())
            setShowNotification(true)
        }

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    if (compact) {
        return (
            <div className={`flex items-center gap-2 text-xs ${isOnline ? 'text-green-600' : 'text-red-600'
                }`}>
                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse-ring' : 'bg-red-500'
                    }`} />
                <span>{isOnline ? 'Online' : 'Offline'}</span>
            </div>
        )
    }

    if (!showNotification && isOnline) return null

    return (
        <div className={`fixed top-20 right-4 z-140 animate-slide-in ${isOnline ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            } border rounded-xl shadow-lg p-4 max-w-sm`}>
            <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full ${isOnline ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                    {isOnline ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                    ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-600">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                        </svg>
                    )}
                </div>
                <div className="flex-1">
                    <h3 className={`font-semibold text-sm ${isOnline ? 'text-green-800' : 'text-red-800'
                        }`}>
                        {isOnline ? 'Back Online' : 'Connection Lost'}
                    </h3>
                    <p className={`text-xs mt-1 ${isOnline ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {isOnline
                            ? 'You\'re back online. Messages will sync automatically.'
                            : 'You\'re offline. Messages will be sent when connection is restored.'}
                    </p>
                </div>
                <button
                    onClick={() => setShowNotification(false)}
                    className="text-(--text-muted) hover:text-(--text-primary)"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            </div>
        </div>
    )
}

// Hook for connection monitoring
export function useConnectionStatus() {
    const [isOnline, setIsOnline] = useState(navigator.onLine)
    const [wasOffline, setWasOffline] = useState(false)

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true)
            if (wasOffline) {
                // Connection restored - could trigger data sync here
                console.log('Connection restored, syncing data...')
            }
            setWasOffline(false)
        }

        const handleOffline = () => {
            setIsOnline(false)
            setWasOffline(true)
        }

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [wasOffline])

    return { isOnline, wasOffline }
}
