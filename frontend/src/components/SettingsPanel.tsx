/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect } from 'react'

interface Settings {
    notifications: boolean
    soundEnabled: boolean
    autoRefresh: boolean
    refreshInterval: number
    compactMode: boolean
    showTimestamps: boolean
    theme: 'light' | 'dark' | 'system'
    // Do Not Disturb settings
    dndEnabled: boolean
    dndScheduleEnabled: boolean
    dndStartTime: string
    dndEndTime: string
    dndDays: number[] // 0 = Sunday, 6 = Saturday
}

const DEFAULT_SETTINGS: Settings = {
    notifications: true,
    soundEnabled: true,
    autoRefresh: true,
    refreshInterval: 30,
    compactMode: false,
    showTimestamps: true,
    theme: 'system',
    // Do Not Disturb defaults
    dndEnabled: false,
    dndScheduleEnabled: false,
    dndStartTime: '22:00',
    dndEndTime: '08:00',
    dndDays: [0, 1, 2, 3, 4, 5, 6] // All days
}

interface SettingsPanelProps {
    isOpen: boolean
    onClose: () => void
    onSettingsChange?: (settings: Settings) => void
}

export default function SettingsPanel({ isOpen, onClose, onSettingsChange }: SettingsPanelProps) {
    const [settings, setSettings] = useState<Settings>(() => {
        const saved = localStorage.getItem('inbox3_settings')
        return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS
    })

    useEffect(() => {
        localStorage.setItem('inbox3_settings', JSON.stringify(settings))
        onSettingsChange?.(settings)
    }, [settings, onSettingsChange])

    const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
        setSettings(prev => ({ ...prev, [key]: value }))
    }

    const resetSettings = () => {
        setSettings(DEFAULT_SETTINGS)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 animate-fade-in">
            <div className="bg-(--bg-card) rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-(--border-color)">
                    <h2 className="text-xl font-bold text-(--text-primary)">Settings</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-(--bg-secondary) transition-colors"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                    {/* Notifications Section */}
                    <section>
                        <h3 className="text-sm font-semibold text-(--text-primary) mb-3 flex items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                            </svg>
                            Notifications
                        </h3>
                        <div className="space-y-3">
                            <ToggleSetting
                                label="Enable Notifications"
                                description="Receive alerts for new messages"
                                checked={settings.notifications}
                                onChange={(v) => updateSetting('notifications', v)}
                            />
                            <ToggleSetting
                                label="Sound Effects"
                                description="Play sounds for notifications"
                                checked={settings.soundEnabled}
                                onChange={(v) => updateSetting('soundEnabled', v)}
                            />
                        </div>
                    </section>

                    {/* Do Not Disturb Section */}
                    <section>
                        <h3 className="text-sm font-semibold text-(--text-primary) mb-3 flex items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M4.93 4.93l14.14 14.14" />
                            </svg>
                            Do Not Disturb
                        </h3>
                        <div className="space-y-3">
                            <ToggleSetting
                                label="Enable DND"
                                description="Silence all notifications"
                                checked={settings.dndEnabled}
                                onChange={(v) => updateSetting('dndEnabled', v)}
                            />
                            <ToggleSetting
                                label="Schedule DND"
                                description="Automatically enable during set hours"
                                checked={settings.dndScheduleEnabled}
                                onChange={(v) => updateSetting('dndScheduleEnabled', v)}
                            />
                            {settings.dndScheduleEnabled && (
                                <>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1">
                                            <label className="text-xs text-(--text-muted) block mb-1">Start</label>
                                            <input
                                                type="time"
                                                value={settings.dndStartTime}
                                                onChange={(e) => updateSetting('dndStartTime', e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg bg-(--bg-secondary) text-(--text-primary) text-sm border border-(--border-color) focus:outline-none focus:ring-2 focus:ring-(--primary-brand)"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-xs text-(--text-muted) block mb-1">End</label>
                                            <input
                                                type="time"
                                                value={settings.dndEndTime}
                                                onChange={(e) => updateSetting('dndEndTime', e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg bg-(--bg-secondary) text-(--text-primary) text-sm border border-(--border-color) focus:outline-none focus:ring-2 focus:ring-(--primary-brand)"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-(--text-muted) block mb-2">Active Days</label>
                                        <div className="flex gap-1">
                                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => {
                                                        const newDays = settings.dndDays.includes(index)
                                                            ? settings.dndDays.filter(d => d !== index)
                                                            : [...settings.dndDays, index]
                                                        updateSetting('dndDays', newDays)
                                                    }}
                                                    className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${settings.dndDays.includes(index)
                                                            ? 'bg-(--primary-brand) text-white'
                                                            : 'bg-(--bg-secondary) text-(--text-muted) hover:bg-(--bg-tertiary)'
                                                        }`}
                                                >
                                                    {day}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </section>

                    {/* Appearance Section */}
                    <section>
                        <h3 className="text-sm font-semibold text-(--text-primary) mb-3 flex items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="3" />
                                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                            </svg>
                            Appearance
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-(--text-primary)">Theme</p>
                                    <p className="text-xs text-(--text-muted)">Choose your preferred theme</p>
                                </div>
                                <select
                                    value={settings.theme}
                                    onChange={(e) => updateSetting('theme', e.target.value as Settings['theme'])}
                                    className="px-3 py-2 rounded-lg bg-(--bg-secondary) text-(--text-primary) text-sm border border-(--border-color) focus:outline-none focus:ring-2 focus:ring-(--primary-brand)"
                                >
                                    <option value="light">Light</option>
                                    <option value="dark">Dark</option>
                                    <option value="system">System</option>
                                </select>
                            </div>
                            <ToggleSetting
                                label="Compact Mode"
                                description="Reduce spacing for more content"
                                checked={settings.compactMode}
                                onChange={(v) => updateSetting('compactMode', v)}
                            />
                            <ToggleSetting
                                label="Show Timestamps"
                                description="Display message timestamps"
                                checked={settings.showTimestamps}
                                onChange={(v) => updateSetting('showTimestamps', v)}
                            />
                        </div>
                    </section>

                    {/* Data Section */}
                    <section>
                        <h3 className="text-sm font-semibold text-(--text-primary) mb-3 flex items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                <polyline points="22,6 12,13 2,6" />
                            </svg>
                            Data & Sync
                        </h3>
                        <div className="space-y-3">
                            <ToggleSetting
                                label="Auto-Refresh"
                                description="Automatically fetch new messages"
                                checked={settings.autoRefresh}
                                onChange={(v) => updateSetting('autoRefresh', v)}
                            />
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-(--text-primary)">Refresh Interval</p>
                                    <p className="text-xs text-(--text-muted)">How often to check for new messages</p>
                                </div>
                                <select
                                    value={settings.refreshInterval}
                                    onChange={(e) => updateSetting('refreshInterval', Number(e.target.value))}
                                    disabled={!settings.autoRefresh}
                                    className="px-3 py-2 rounded-lg bg-(--bg-secondary) text-(--text-primary) text-sm border border-(--border-color) focus:outline-none focus:ring-2 focus:ring-(--primary-brand) disabled:opacity-50"
                                >
                                    <option value={15}>15 seconds</option>
                                    <option value={30}>30 seconds</option>
                                    <option value={60}>1 minute</option>
                                    <option value={120}>2 minutes</option>
                                </select>
                            </div>
                        </div>
                        <div className="pt-4 mt-4 border-t border-(--border-color)">
                            <button
                                onClick={() => {
                                    if (window.confirm('Are you sure you want to clear the local cache? This will clear stored messages and reload the page.')) {
                                        localStorage.clear()
                                        window.location.reload()
                                    }
                                }}
                                className="w-full py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                            >
                                Clear Local Cache
                            </button>
                            <p className="mt-2 text-xs text-center text-(--text-muted)">
                                Useful if messages are out of sync
                            </p>
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-(--border-color) bg-(--bg-secondary)">
                    <button
                        onClick={resetSettings}
                        className="text-sm text-(--text-muted) hover:text-(--text-primary) transition-colors"
                    >
                        Reset to defaults
                    </button>
                    <button
                        onClick={onClose}
                        className="px-5 py-2 bg-(--primary-brand) text-white rounded-xl font-medium hover:bg-(--primary-brand-hover) transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    )
}

interface ToggleSettingProps {
    label: string
    description: string
    checked: boolean
    onChange: (checked: boolean) => void
}

function ToggleSetting({ label, description, checked, onChange }: ToggleSettingProps) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-(--text-primary)">{label}</p>
                <p className="text-xs text-(--text-muted)">{description}</p>
            </div>
            <button
                onClick={() => onChange(!checked)}
                className={`relative w-12 h-6 rounded-full transition-colors ${checked ? 'bg-(--primary-brand)' : 'bg-(--bg-secondary) border border-(--border-color)'
                    }`}
            >
                <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? 'left-7' : 'left-1'
                        }`}
                />
            </button>
        </div>
    )
}

export { DEFAULT_SETTINGS }
export type { Settings }
