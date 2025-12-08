import { useState, useEffect } from 'react'

interface PerformanceMetrics {
    totalMessages: number
    messagesSent: number
    messagesReceived: number
    groupsJoined: number
    averageResponseTime: number
    mostActiveDay: string
    totalDataUsed: number
    uptime: number
}

interface PerformanceDashboardProps {
    isOpen: boolean
    onClose: () => void
}

export default function PerformanceDashboard({ isOpen, onClose }: PerformanceDashboardProps) {
    const [metrics, setMetrics] = useState<PerformanceMetrics>({
        totalMessages: 0,
        messagesSent: 0,
        messagesReceived: 0,
        groupsJoined: 0,
        averageResponseTime: 0,
        mostActiveDay: 'Monday',
        totalDataUsed: 0,
        uptime: 0
    })

    useEffect(() => {
        if (isOpen) {
            loadMetrics()
        }
    }, [isOpen])

    const loadMetrics = () => {
        // Load metrics from localStorage
        const saved = localStorage.getItem('inbox3_metrics')
        if (saved) {
            setMetrics(JSON.parse(saved))
        }
    }

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
    }

    const formatUptime = (ms: number) => {
        const seconds = Math.floor(ms / 1000)
        const minutes = Math.floor(seconds / 60)
        const hours = Math.floor(minutes / 60)
        const days = Math.floor(hours / 24)

        if (days > 0) return `${days}d ${hours % 24}h`
        if (hours > 0) return `${hours}h ${minutes % 60}m`
        return `${minutes}m`
    }

    if (!isOpen) return null

    const stats = [
        {
            label: 'Total Messages',
            value: metrics.totalMessages.toLocaleString(),
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
            ),
            color: 'blue'
        },
        {
            label: 'Messages Sent',
            value: metrics.messagesSent.toLocaleString(),
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
            ),
            color: 'green'
        },
        {
            label: 'Messages Received',
            value: metrics.messagesReceived.toLocaleString(),
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
                    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
                </svg>
            ),
            color: 'purple'
        },
        {
            label: 'Groups Joined',
            value: metrics.groupsJoined.toLocaleString(),
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            ),
            color: 'orange'
        },
        {
            label: 'Avg. Response Time',
            value: `${metrics.averageResponseTime}m`,
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                </svg>
            ),
            color: 'pink'
        },
        {
            label: 'Data Used',
            value: formatBytes(metrics.totalDataUsed),
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
            ),
            color: 'cyan'
        }
    ]

    const colorClasses = {
        blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
        green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
        purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
        orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
        pink: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
        cyan: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400'
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
            <div className="bg-(--bg-card) rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-(--border-color) bg-linear-to-r from-blue-500 to-purple-600 text-white">
                    <div>
                        <h2 className="text-2xl font-bold">Performance Dashboard</h2>
                        <p className="text-sm opacity-90 mt-1">Your Inbox3 usage statistics</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/20 transition-colors"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[70vh]">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        {stats.map((stat, index) => (
                            <div
                                key={index}
                                className="p-5 bg-(--bg-secondary) rounded-2xl hover:shadow-md transition-all hover-lift"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className={`p-3 rounded-xl ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                                        {stat.icon}
                                    </div>
                                </div>
                                <p className="text-sm text-(--text-muted) mb-1">{stat.label}</p>
                                <p className="text-2xl font-bold text-(--text-primary)">{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Additional Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Quick Stats */}
                        <div className="p-5 bg-(--bg-secondary) rounded-2xl">
                            <h3 className="font-semibold text-(--text-primary) mb-4 flex items-center gap-2">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="12" y1="1" x2="12" y2="23" />
                                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                </svg>
                                Quick Stats
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-(--text-secondary)">Most Active Day</span>
                                    <span className="font-medium text-(--text-primary)">{metrics.mostActiveDay}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-(--text-secondary)">Session Uptime</span>
                                    <span className="font-medium text-(--text-primary)">{formatUptime(metrics.uptime)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-(--text-secondary)">Send/Receive Ratio</span>
                                    <span className="font-medium text-(--text-primary)">
                                        {metrics.messagesReceived > 0
                                            ? (metrics.messagesSent / metrics.messagesReceived).toFixed(2)
                                            : '0.00'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Performance Tips */}
                        <div className="p-5 bg-(--bg-secondary) rounded-2xl">
                            <h3 className="font-semibold text-(--text-primary) mb-4 flex items-center gap-2">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                </svg>
                                Performance Tips
                            </h3>
                            <ul className="space-y-2 text-sm text-(--text-secondary)">
                                <li className="flex items-start gap-2">
                                    <span className="text-green-500 mt-0.5">✓</span>
                                    <span>Regular backups keep your data safe</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-500 mt-0.5">✓</span>
                                    <span>Clear old messages to improve performance</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-500 mt-0.5">✓</span>
                                    <span>Use quick replies for faster messaging</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-(--border-color) bg-(--bg-secondary) flex items-center justify-between">
                    <p className="text-xs text-(--text-muted)">
                        Last updated: {new Date().toLocaleString()}
                    </p>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-(--primary-brand) text-white rounded-xl font-medium hover:bg-(--primary-brand-hover) transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}

// Hook for tracking metrics
export function useMetrics() {
    const [metrics, setMetrics] = useState<PerformanceMetrics>(() => {
        const saved = localStorage.getItem('inbox3_metrics')
        return saved ? JSON.parse(saved) : {
            totalMessages: 0,
            messagesSent: 0,
            messagesReceived: 0,
            groupsJoined: 0,
            averageResponseTime: 0,
            mostActiveDay: 'Monday',
            totalDataUsed: 0,
            uptime: Date.now()
        }
    })

    const incrementMessagesSent = () => {
        setMetrics(prev => {
            const updated = {
                ...prev,
                messagesSent: prev.messagesSent + 1,
                totalMessages: prev.totalMessages + 1
            }
            localStorage.setItem('inbox3_metrics', JSON.stringify(updated))
            return updated
        })
    }

    const incrementMessagesReceived = () => {
        setMetrics(prev => {
            const updated = {
                ...prev,
                messagesReceived: prev.messagesReceived + 1,
                totalMessages: prev.totalMessages + 1
            }
            localStorage.setItem('inbox3_metrics', JSON.stringify(updated))
            return updated
        })
    }

    const incrementGroupsJoined = () => {
        setMetrics(prev => {
            const updated = {
                ...prev,
                groupsJoined: prev.groupsJoined + 1
            }
            localStorage.setItem('inbox3_metrics', JSON.stringify(updated))
            return updated
        })
    }

    const addDataUsage = (bytes: number) => {
        setMetrics(prev => {
            const updated = {
                ...prev,
                totalDataUsed: prev.totalDataUsed + bytes
            }
            localStorage.setItem('inbox3_metrics', JSON.stringify(updated))
            return updated
        })
    }

    return {
        metrics,
        incrementMessagesSent,
        incrementMessagesReceived,
        incrementGroupsJoined,
        addDataUsage
    }
}
