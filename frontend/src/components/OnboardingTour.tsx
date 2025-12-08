/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect } from 'react'

interface OnboardingTourProps {
    isOpen: boolean
    onComplete: () => void
}

interface Step {
    title: string
    description: string
    icon: React.ReactNode
    highlight?: string
}

const STEPS: Step[] = [
    {
        title: 'Welcome to Inbox3! 🎉',
        description: 'Your gateway to secure, decentralized messaging on the Aptos blockchain. Let\'s take a quick tour of the features.',
        icon: (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
            </svg>
        )
    },
    {
        title: 'Send Direct Messages 💬',
        description: 'Send encrypted messages to any Aptos wallet address. Your messages are stored on IPFS and secured on the blockchain.',
        icon: (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M22 2L11 13" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
        )
    },
    {
        title: 'Join Group Chats 👥',
        description: 'Create or join group chats to stay connected with communities. Perfect for DAOs, teams, and friends.',
        icon: (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        )
    },
    {
        title: 'Voice Messages 🎤',
        description: 'Record and send voice messages when typing isn\'t convenient. Audio is stored securely on IPFS.',
        icon: (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
        )
    },
    {
        title: 'Manage Contacts 📇',
        description: 'Save your friends\' wallet addresses with nicknames and notes. Quick access to send messages anytime.',
        icon: (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
            </svg>
        )
    },
    {
        title: 'You\'re All Set! 🚀',
        description: 'Start by creating your inbox. This one-time setup enables you to receive messages from anyone.',
        icon: (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polyline points="20 6 9 17 4 12" />
            </svg>
        )
    }
]

export default function OnboardingTour({ isOpen, onComplete }: OnboardingTourProps) {
    const [currentStep, setCurrentStep] = useState(0)
    const [isVisible, setIsVisible] = useState(isOpen)

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true)
            setCurrentStep(0)
        }
    }, [isOpen])

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(prev => prev + 1)
        } else {
            handleComplete()
        }
    }

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1)
        }
    }

    const handleComplete = () => {
        localStorage.setItem('inbox3_onboarding_complete', 'true')
        setIsVisible(false)
        onComplete()
    }

    const handleSkip = () => {
        handleComplete()
    }

    if (!isVisible) return null

    const step = STEPS[currentStep]

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fade-in">
            <div className="bg-(--bg-card) rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
                {/* Progress Bar */}
                <div className="h-1 bg-(--bg-secondary)">
                    <div
                        className="h-full bg-(--primary-brand) transition-all duration-300"
                        style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                    />
                </div>

                {/* Content */}
                <div className="p-8 text-center">
                    {/* Icon */}
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-linear-to-br from-(--primary-brand) to-orange-400 flex items-center justify-center text-white">
                        {step.icon}
                    </div>

                    {/* Text */}
                    <h2 className="text-2xl font-bold text-(--text-primary) mb-3">
                        {step.title}
                    </h2>
                    <p className="text-(--text-secondary) leading-relaxed">
                        {step.description}
                    </p>

                    {/* Step Indicators */}
                    <div className="flex justify-center gap-2 mt-8">
                        {STEPS.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentStep(index)}
                                className={`w-2 h-2 rounded-full transition-all ${index === currentStep
                                    ? 'w-6 bg-(--primary-brand)'
                                    : 'bg-(--border-color) hover:bg-(--text-muted)'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-(--border-color) bg-(--bg-secondary)">
                    <button
                        onClick={handleSkip}
                        className="text-sm text-(--text-muted) hover:text-(--text-primary) transition-colors"
                    >
                        Skip tour
                    </button>

                    <div className="flex gap-3">
                        {currentStep > 0 && (
                            <button
                                onClick={handlePrevious}
                                className="px-5 py-2 text-(--text-secondary) hover:text-(--text-primary) transition-colors"
                            >
                                Back
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            className="px-6 py-2 bg-(--primary-brand) text-white rounded-xl font-medium hover:bg-(--primary-brand-hover) transition-colors flex items-center gap-2"
                        >
                            {currentStep === STEPS.length - 1 ? 'Get Started' : 'Next'}
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export function useOnboardingTour() {
    const [shouldShow, setShouldShow] = useState(false)

    useEffect(() => {
        const completed = localStorage.getItem('inbox3_onboarding_complete')
        if (!completed) {
            setShouldShow(true)
        }
    }, [])

    const resetTour = () => {
        localStorage.removeItem('inbox3_onboarding_complete')
        setShouldShow(true)
    }

    return { shouldShow, setShouldShow, resetTour }
}
