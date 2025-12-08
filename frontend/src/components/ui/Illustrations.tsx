import { forwardRef } from 'react'

interface IllustrationProps {
    className?: string
    size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-48 h-48'
}

/**
 * Empty inbox illustration
 */
export const EmptyInboxIllustration = forwardRef<SVGSVGElement, IllustrationProps>(
    ({ className = '', size = 'md' }, ref) => (
        <svg
            ref={ref}
            className={`${sizeClasses[size]} ${className}`}
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            {/* Mailbox */}
            <rect x="60" y="70" width="80" height="60" rx="8" fill="var(--bg-tertiary)" stroke="var(--border-default)" strokeWidth="2" />
            <path d="M60 85 L100 110 L140 85" stroke="var(--primary-brand)" strokeWidth="2" fill="none" />
            {/* Flag */}
            <rect x="145" y="75" width="5" height="25" fill="var(--text-muted)" />
            <path d="M150 75 L165 82 L150 90" fill="var(--primary-brand)" />
            {/* Sparkles */}
            <circle cx="45" cy="60" r="3" fill="var(--status-warning)" opacity="0.7" />
            <circle cx="155" cy="55" r="2" fill="var(--status-warning)" opacity="0.5" />
            <circle cx="50" cy="130" r="2" fill="var(--status-warning)" opacity="0.6" />
            {/* Stand */}
            <rect x="95" y="130" width="10" height="30" fill="var(--text-muted)" />
            <rect x="75" y="155" width="50" height="8" rx="2" fill="var(--bg-tertiary)" stroke="var(--border-default)" />
        </svg>
    )
)

EmptyInboxIllustration.displayName = 'EmptyInboxIllustration'

/**
 * No search results illustration
 */
export const NoResultsIllustration = forwardRef<SVGSVGElement, IllustrationProps>(
    ({ className = '', size = 'md' }, ref) => (
        <svg
            ref={ref}
            className={`${sizeClasses[size]} ${className}`}
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            {/* Magnifying glass */}
            <circle cx="85" cy="85" r="35" stroke="var(--border-default)" strokeWidth="4" fill="var(--bg-tertiary)" />
            <circle cx="85" cy="85" r="25" stroke="var(--primary-brand)" strokeWidth="2" fill="none" opacity="0.5" />
            <line x1="110" y1="110" x2="145" y2="145" stroke="var(--text-muted)" strokeWidth="8" strokeLinecap="round" />
            {/* Question marks */}
            <text x="75" y="95" fontSize="24" fill="var(--text-muted)" fontFamily="system-ui">?</text>
            {/* Floating elements */}
            <circle cx="150" cy="50" r="8" fill="var(--bg-tertiary)" stroke="var(--border-default)" strokeWidth="1.5" />
            <circle cx="45" cy="110" r="6" fill="var(--bg-tertiary)" stroke="var(--border-default)" strokeWidth="1.5" />
            <circle cx="160" cy="120" r="5" fill="var(--bg-tertiary)" stroke="var(--border-default)" strokeWidth="1.5" />
        </svg>
    )
)

NoResultsIllustration.displayName = 'NoResultsIllustration'

/**
 * Error/failure illustration
 */
export const ErrorIllustration = forwardRef<SVGSVGElement, IllustrationProps>(
    ({ className = '', size = 'md' }, ref) => (
        <svg
            ref={ref}
            className={`${sizeClasses[size]} ${className}`}
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            {/* Cloud with lightning */}
            <ellipse cx="100" cy="80" rx="50" ry="30" fill="var(--bg-tertiary)" stroke="var(--border-default)" strokeWidth="2" />
            <ellipse cx="65" cy="85" rx="25" ry="20" fill="var(--bg-tertiary)" stroke="var(--border-default)" strokeWidth="2" />
            <ellipse cx="135" cy="85" rx="25" ry="20" fill="var(--bg-tertiary)" stroke="var(--border-default)" strokeWidth="2" />
            {/* Lightning bolt */}
            <path d="M95 95 L85 120 L100 115 L90 145 L115 110 L100 115 L110 95 Z" fill="var(--status-error)" />
            {/* Rain drops */}
            <line x1="60" y1="100" x2="55" y2="115" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
            <line x1="75" y1="105" x2="70" y2="120" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
            <line x1="125" y1="105" x2="120" y2="120" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
            <line x1="140" y1="100" x2="135" y2="115" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        </svg>
    )
)

ErrorIllustration.displayName = 'ErrorIllustration'

/**
 * Offline/disconnected illustration
 */
export const OfflineIllustration = forwardRef<SVGSVGElement, IllustrationProps>(
    ({ className = '', size = 'md' }, ref) => (
        <svg
            ref={ref}
            className={`${sizeClasses[size]} ${className}`}
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            {/* WiFi symbol (crossed out) */}
            <path d="M50 90 Q100 50 150 90" stroke="var(--text-muted)" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M65 105 Q100 75 135 105" stroke="var(--text-muted)" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M80 120 Q100 100 120 120" stroke="var(--text-muted)" strokeWidth="4" fill="none" strokeLinecap="round" />
            <circle cx="100" cy="140" r="8" fill="var(--text-muted)" />
            {/* Cross out line */}
            <line x1="40" y1="150" x2="160" y2="70" stroke="var(--status-error)" strokeWidth="4" strokeLinecap="round" />
        </svg>
    )
)

OfflineIllustration.displayName = 'OfflineIllustration'

/**
 * Secure/encrypted illustration
 */
export const SecureIllustration = forwardRef<SVGSVGElement, IllustrationProps>(
    ({ className = '', size = 'md' }, ref) => (
        <svg
            ref={ref}
            className={`${sizeClasses[size]} ${className}`}
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            {/* Shield */}
            <path
                d="M100 30 L150 50 L150 100 Q150 140 100 170 Q50 140 50 100 L50 50 Z"
                fill="var(--bg-tertiary)"
                stroke="var(--primary-brand)"
                strokeWidth="3"
            />
            {/* Lock */}
            <rect x="80" y="90" width="40" height="35" rx="4" fill="var(--primary-brand)" />
            <path d="M88 90 L88 75 Q88 60 100 60 Q112 60 112 75 L112 90" stroke="var(--primary-brand)" strokeWidth="5" fill="none" />
            {/* Keyhole */}
            <circle cx="100" cy="102" r="5" fill="var(--bg-primary)" />
            <rect x="97" y="105" width="6" height="10" fill="var(--bg-primary)" />
            {/* Sparkles */}
            <circle cx="45" cy="60" r="3" fill="var(--status-online)" opacity="0.8" />
            <circle cx="155" cy="75" r="3" fill="var(--status-online)" opacity="0.6" />
            <circle cx="60" cy="150" r="2" fill="var(--status-online)" opacity="0.7" />
        </svg>
    )
)

SecureIllustration.displayName = 'SecureIllustration'

/**
 * Welcome/getting started illustration
 */
export const WelcomeIllustration = forwardRef<SVGSVGElement, IllustrationProps>(
    ({ className = '', size = 'md' }, ref) => (
        <svg
            ref={ref}
            className={`${sizeClasses[size]} ${className}`}
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            {/* Chat bubbles */}
            <rect x="30" y="50" width="70" height="45" rx="10" fill="var(--primary-brand)" />
            <polygon points="45,95 55,95 40,110" fill="var(--primary-brand)" />
            <rect x="100" y="80" width="70" height="45" rx="10" fill="var(--bg-tertiary)" stroke="var(--border-default)" strokeWidth="2" />
            <polygon points="155,125 145,125 160,140" fill="var(--bg-tertiary)" stroke="var(--border-default)" />
            {/* Message lines */}
            <line x1="45" y1="65" x2="85" y2="65" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
            <line x1="45" y1="75" x2="75" y2="75" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
            <line x1="45" y1="85" x2="65" y2="85" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
            <line x1="115" y1="95" x2="155" y2="95" stroke="var(--text-muted)" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
            <line x1="115" y1="105" x2="145" y2="105" stroke="var(--text-muted)" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
            {/* Stars */}
            <circle cx="25" cy="40" r="4" fill="var(--status-warning)" />
            <circle cx="180" cy="60" r="3" fill="var(--status-warning)" />
            <circle cx="95" cy="150" r="3" fill="var(--status-warning)" />
        </svg>
    )
)

WelcomeIllustration.displayName = 'WelcomeIllustration'

export default {
    EmptyInboxIllustration,
    NoResultsIllustration,
    ErrorIllustration,
    OfflineIllustration,
    SecureIllustration,
    WelcomeIllustration
}
