import { useState, useEffect, createContext, useContext, type ReactNode } from 'react'

// ============================================
// LAYOUT CONTEXT
// ============================================
interface LayoutContextType {
    sidebarOpen: boolean
    setSidebarOpen: (open: boolean) => void
    rightPaneOpen: boolean
    setRightPaneOpen: (open: boolean) => void
    isMobile: boolean
    isTablet: boolean
    isDesktop: boolean
}

const LayoutContext = createContext<LayoutContextType | null>(null)

export function useLayout() {
    const context = useContext(LayoutContext)
    if (!context) {
        throw new Error('useLayout must be used within AppShell')
    }
    return context
}

// ============================================
// BREAKPOINT HOOK
// ============================================
function useBreakpoints() {
    const [breakpoint, setBreakpoint] = useState({
        isMobile: true,
        isTablet: false,
        isDesktop: false,
    })

    useEffect(() => {
        const checkBreakpoint = () => {
            const width = window.innerWidth
            setBreakpoint({
                isMobile: width < 768,
                isTablet: width >= 768 && width < 1024,
                isDesktop: width >= 1024,
            })
        }

        checkBreakpoint()
        window.addEventListener('resize', checkBreakpoint)
        return () => window.removeEventListener('resize', checkBreakpoint)
    }, [])

    return breakpoint
}

// ============================================
// APP SHELL PROPS
// ============================================
interface AppShellProps {
    topNav: ReactNode
    sidebar?: ReactNode
    children: ReactNode
    rightPane?: ReactNode
}

// ============================================
// APP SHELL COMPONENT
// ============================================
export function AppShell({ topNav, sidebar, children, rightPane }: AppShellProps) {
    const { isMobile, isTablet, isDesktop } = useBreakpoints()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [rightPaneOpen, setRightPaneOpen] = useState(true)

    // Auto-close sidebar on mobile when navigating
    useEffect(() => {
        if (isMobile) {
            setSidebarOpen(false)
        }
    }, [isMobile])

    // Show right pane by default on desktop
    useEffect(() => {
        setRightPaneOpen(isDesktop || isTablet)
    }, [isDesktop, isTablet])

    return (
        <LayoutContext.Provider
            value={{
                sidebarOpen,
                setSidebarOpen,
                rightPaneOpen,
                setRightPaneOpen,
                isMobile,
                isTablet,
                isDesktop,
            }}
        >
            <div className="app-shell">
                {/* Fixed Top Navigation */}
                <header className="app-shell__topnav">
                    {topNav}
                </header>

                {/* Main Layout Container */}
                <div className="app-shell__body">
                    {/* Sidebar - Collapsible */}
                    {sidebar && (
                        <>
                            {/* Mobile Overlay */}
                            {isMobile && sidebarOpen && (
                                <div
                                    className="app-shell__overlay"
                                    onClick={() => setSidebarOpen(false)}
                                    aria-hidden="true"
                                />
                            )}
                            <aside
                                className={`app-shell__sidebar ${sidebarOpen ? 'app-shell__sidebar--open' : ''}`}
                                aria-label="Sidebar navigation"
                            >
                                {sidebar}
                            </aside>
                        </>
                    )}

                    {/* Center Pane - Main Content */}
                    <main className="app-shell__center" id="main-content" role="main">
                        {children}
                    </main>

                    {/* Right Pane - Profile/Tools */}
                    {rightPane && (isDesktop || (isTablet && rightPaneOpen)) && (
                        <aside className="app-shell__right" aria-label="Tools panel">
                            {rightPane}
                        </aside>
                    )}
                </div>
            </div>
        </LayoutContext.Provider>
    )
}

// ============================================
// TOP NAV COMPONENT
// ============================================
interface TopNavProps {
    logo?: ReactNode
    center?: ReactNode
    right?: ReactNode
}

export function TopNav({ logo, center, right }: TopNavProps) {
    const { setSidebarOpen, sidebarOpen, isMobile } = useLayout()

    return (
        <div className="topnav">
            <div className="topnav__left">
                {isMobile && (
                    <button
                        className="topnav__menu-btn"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={sidebarOpen}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            {sidebarOpen ? (
                                <path d="M18 6L6 18M6 6l12 12" />
                            ) : (
                                <path d="M3 12h18M3 6h18M3 18h18" />
                            )}
                        </svg>
                    </button>
                )}
                {logo}
            </div>
            <div className="topnav__center">
                {center}
            </div>
            <div className="topnav__right">
                {right}
            </div>
        </div>
    )
}

// ============================================
// SIDEBAR COMPONENT
// ============================================
interface SidebarProps {
    children: ReactNode
    header?: ReactNode
    footer?: ReactNode
}

export function Sidebar({ children, header, footer }: SidebarProps) {
    return (
        <div className="sidebar">
            {header && <div className="sidebar__header">{header}</div>}
            <nav className="sidebar__content">{children}</nav>
            {footer && <div className="sidebar__footer">{footer}</div>}
        </div>
    )
}

interface SidebarItemProps {
    icon?: ReactNode
    label: string
    badge?: number | string
    active?: boolean
    onClick?: () => void
}

export function SidebarItem({ icon, label, badge, active, onClick }: SidebarItemProps) {
    return (
        <button
            className={`sidebar__item ${active ? 'sidebar__item--active' : ''}`}
            onClick={onClick}
            aria-current={active ? 'page' : undefined}
        >
            {icon && <span className="sidebar__item-icon">{icon}</span>}
            <span className="sidebar__item-label">{label}</span>
            {badge !== undefined && (
                <span className="sidebar__item-badge">{badge}</span>
            )}
        </button>
    )
}

// ============================================
// PANE COMPONENTS
// ============================================
interface PaneProps {
    children: ReactNode
    className?: string
    header?: ReactNode
    padding?: boolean
}

export function CenterPane({ children, className = '', header, padding = true }: PaneProps) {
    return (
        <div className={`center-pane ${className}`}>
            {header && <div className="center-pane__header">{header}</div>}
            <div className={`center-pane__content ${padding ? 'center-pane__content--padded' : ''}`}>
                {children}
            </div>
        </div>
    )
}

export function RightPane({ children, className = '', header, padding = true }: PaneProps) {
    return (
        <div className={`right-pane ${className}`}>
            {header && <div className="right-pane__header">{header}</div>}
            <div className={`right-pane__content ${padding ? 'right-pane__content--padded' : ''}`}>
                {children}
            </div>
        </div>
    )
}

// ============================================
// PANEL CARD - For content sections
// ============================================
interface PanelCardProps {
    children: ReactNode
    title?: string
    icon?: ReactNode
    action?: ReactNode
    className?: string
}

export function PanelCard({ children, title, icon, action, className = '' }: PanelCardProps) {
    return (
        <div className={`panel-card ${className}`}>
            {(title || action) && (
                <div className="panel-card__header">
                    <div className="panel-card__title">
                        {icon && <span className="panel-card__icon">{icon}</span>}
                        {title && <h2>{title}</h2>}
                    </div>
                    {action && <div className="panel-card__action">{action}</div>}
                </div>
            )}
            <div className="panel-card__body">
                {children}
            </div>
        </div>
    )
}

export default AppShell
