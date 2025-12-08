import { useState } from 'react'
import { Badge } from './ui/Badge'
import { IconButton } from './ui/IconButton'
import { Tooltip } from './ui/Tooltip'

interface SidebarItem {
    id: string
    label: string
    icon: React.ReactNode
    badge?: number
    active?: boolean
}

interface SidebarProps {
    currentView: 'dm' | 'groups'
    onViewChange: (view: 'dm' | 'groups') => void
    unreadDMs?: number
    unreadGroups?: number
    onNewMessage?: () => void
    onSearch?: () => void
    onSettings?: () => void
    collapsed?: boolean
    onCollapsedChange?: (collapsed: boolean) => void
}

export function Sidebar({
    currentView,
    onViewChange,
    unreadDMs = 0,
    unreadGroups = 0,
    onNewMessage,
    onSearch,
    onSettings,
    collapsed = false,
    onCollapsedChange
}: SidebarProps) {
    const [isHovered, setIsHovered] = useState(false)

    const navItems: SidebarItem[] = [
        {
            id: 'dm',
            label: 'Messages',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
            ),
            badge: unreadDMs,
            active: currentView === 'dm'
        },
        {
            id: 'groups',
            label: 'Groups',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            ),
            badge: unreadGroups,
            active: currentView === 'groups'
        }
    ]

    const isExpanded = !collapsed || isHovered

    return (
        <aside
            className={`
        flex flex-col h-full
        bg-(--bg-card) border-r border-(--border-color)
        transition-all duration-300 ease-out
        ${isExpanded ? 'w-64' : 'w-16'}
      `}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-(--border-color)">
                {isExpanded ? (
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Inbox3" className="w-8 h-8" />
                        <span className="font-bold text-(--text-primary)">Inbox3</span>
                    </div>
                ) : (
                    <img src="/logo.png" alt="Inbox3" className="w-8 h-8 mx-auto" />
                )}
                {isExpanded && onCollapsedChange && (
                    <IconButton
                        icon={
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 19l-7-7 7-7M18 19l-7-7 7-7" />
                            </svg>
                        }
                        label="Collapse sidebar"
                        size="sm"
                        onClick={() => onCollapsedChange(true)}
                    />
                )}
            </div>

            {/* Quick Actions */}
            <div className={`p-3 border-b border-(--border-color) ${isExpanded ? '' : 'flex justify-center'}`}>
                {isExpanded ? (
                    <button
                        onClick={onNewMessage}
                        className="
              w-full flex items-center justify-center gap-2
              px-4 py-2.5 rounded-xl
              bg-(--primary-brand) text-white font-medium
              hover:bg-(--primary-brand-hover) hover:-translate-y-0.5
              transition-all duration-200 shadow-md
            "
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                        New Message
                    </button>
                ) : (
                    <Tooltip content="New Message" position="right">
                        <IconButton
                            icon={
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 5v14M5 12h14" />
                                </svg>
                            }
                            label="New Message"
                            variant="default"
                            onClick={onNewMessage}
                        />
                    </Tooltip>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                    <Tooltip key={item.id} content={item.label} position="right" delay={collapsed ? 100 : 1000}>
                        <button
                            onClick={() => onViewChange(item.id as 'dm' | 'groups')}
                            className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                transition-all duration-200
                ${item.active
                                    ? 'bg-(--primary-brand-light) text-(--primary-brand)'
                                    : 'text-(--text-secondary) hover:bg-(--bg-secondary) hover:text-(--text-primary)'
                                }
                ${!isExpanded ? 'justify-center' : ''}
              `}
                        >
                            <span className="flex-shrink-0">{item.icon}</span>
                            {isExpanded && (
                                <>
                                    <span className="flex-1 text-left font-medium">{item.label}</span>
                                    {item.badge !== undefined && item.badge > 0 && (
                                        <Badge variant={item.active ? 'primary' : 'default'} size="sm">
                                            {item.badge > 99 ? '99+' : item.badge}
                                        </Badge>
                                    )}
                                </>
                            )}
                            {!isExpanded && item.badge !== undefined && item.badge > 0 && (
                                <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-(--primary-brand) rounded-full" />
                            )}
                        </button>
                    </Tooltip>
                ))}

                {/* Divider */}
                <div className="my-4 border-t border-(--border-color)" />

                {/* Folders / Tags section */}
                {isExpanded && (
                    <div className="space-y-1">
                        <h3 className="px-3 py-2 text-xs font-semibold text-(--text-muted) uppercase tracking-wider">
                            Labels
                        </h3>
                        {['Important', 'Work', 'Personal', 'Archive'].map((label) => (
                            <button
                                key={label}
                                className="
                  w-full flex items-center gap-3 px-3 py-2 rounded-lg
                  text-sm text-(--text-secondary)
                  hover:bg-(--bg-secondary) hover:text-(--text-primary)
                  transition-colors
                "
                            >
                                <span
                                    className={`w-2.5 h-2.5 rounded-full ${label === 'Important'
                                            ? 'bg-(--error-red)'
                                            : label === 'Work'
                                                ? 'bg-(--info-blue)'
                                                : label === 'Personal'
                                                    ? 'bg-(--success-green)'
                                                    : 'bg-(--text-muted)'
                                        }`}
                                />
                                {label}
                            </button>
                        ))}
                    </div>
                )}
            </nav>

            {/* Footer Actions */}
            <div className={`p-3 border-t border-(--border-color) space-y-1 ${!isExpanded ? 'flex flex-col items-center' : ''}`}>
                <Tooltip content="Search" position="right">
                    <button
                        onClick={onSearch}
                        className={`
              flex items-center gap-3 px-3 py-2.5 rounded-xl w-full
              text-(--text-secondary) hover:bg-(--bg-secondary) hover:text-(--text-primary)
              transition-colors
              ${!isExpanded ? 'justify-center' : ''}
            `}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <path d="M21 21l-4.35-4.35" />
                        </svg>
                        {isExpanded && <span className="font-medium">Search</span>}
                    </button>
                </Tooltip>

                <Tooltip content="Settings" position="right">
                    <button
                        onClick={onSettings}
                        className={`
              flex items-center gap-3 px-3 py-2.5 rounded-xl w-full
              text-(--text-secondary) hover:bg-(--bg-secondary) hover:text-(--text-primary)
              transition-colors
              ${!isExpanded ? 'justify-center' : ''}
            `}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="3" />
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                        </svg>
                        {isExpanded && <span className="font-medium">Settings</span>}
                    </button>
                </Tooltip>
            </div>
        </aside>
    )
}
