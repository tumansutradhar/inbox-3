/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: ['selector', '[data-theme="dark"]'],
    theme: {
        extend: {
            // ===== RESPONSIVE BREAKPOINTS =====
            screens: {
                'xs': '475px',
                'sm': '640px',
                'md': '768px',
                'lg': '1024px',
                'xl': '1280px',
                '2xl': '1536px',
            },
            // ===== COLORS (mapped to CSS variables) =====
            colors: {
                brand: {
                    DEFAULT: 'var(--primary-brand)',
                    hover: 'var(--primary-brand-hover)',
                    light: 'var(--primary-brand-light)',
                    dark: 'var(--primary-brand-dark)',
                },
                background: {
                    main: 'var(--bg-main)',
                    card: 'var(--bg-card)',
                    secondary: 'var(--bg-secondary)',
                    tertiary: 'var(--bg-tertiary)',
                    hover: 'var(--bg-hover)',
                    active: 'var(--bg-active)',
                },
                foreground: {
                    primary: 'var(--text-primary)',
                    secondary: 'var(--text-secondary)',
                    muted: 'var(--text-muted)',
                    disabled: 'var(--text-disabled)',
                },
                border: {
                    DEFAULT: 'var(--border-color)',
                    focus: 'var(--border-focus)',
                },
                success: {
                    DEFAULT: 'var(--success-green)',
                    light: 'var(--success-light)',
                },
                warning: {
                    DEFAULT: 'var(--warning-yellow)',
                    light: 'var(--warning-light)',
                },
                error: {
                    DEFAULT: 'var(--error-red)',
                    light: 'var(--error-light)',
                },
                info: {
                    DEFAULT: 'var(--info-blue)',
                    light: 'var(--info-light)',
                },
            },
            // ===== TYPOGRAPHY =====
            fontFamily: {
                sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
                mono: ['SF Mono', 'Fira Code', 'Fira Mono', 'monospace'],
            },
            fontSize: {
                'xs': ['0.75rem', { lineHeight: '1.25' }],
                'sm': ['0.875rem', { lineHeight: '1.4' }],
                'base': ['1rem', { lineHeight: '1.5' }],
                'lg': ['1.125rem', { lineHeight: '1.5' }],
                'xl': ['1.25rem', { lineHeight: '1.4' }],
                '2xl': ['1.5rem', { lineHeight: '1.3' }],
                '3xl': ['1.875rem', { lineHeight: '1.25' }],
                '4xl': ['2.25rem', { lineHeight: '1.2' }],
            },
            // ===== SPACING =====
            spacing: {
                '0.5': '0.125rem',
                '1': '0.25rem',
                '1.5': '0.375rem',
                '2': '0.5rem',
                '2.5': '0.625rem',
                '3': '0.75rem',
                '4': '1rem',
                '5': '1.25rem',
                '6': '1.5rem',
                '8': '2rem',
                '10': '2.5rem',
                '12': '3rem',
                '16': '4rem',
            },
            // ===== BORDER RADIUS =====
            borderRadius: {
                'sm': '0.375rem',
                'md': '0.5rem',
                'lg': '0.75rem',
                'xl': '1rem',
                '2xl': '1.5rem',
                '3xl': '2rem',
                'full': '9999px',
            },
            // ===== SHADOWS =====
            boxShadow: {
                'xs': 'var(--shadow-xs)',
                'sm': 'var(--shadow-sm)',
                'md': 'var(--shadow-md)',
                'lg': 'var(--shadow-lg)',
                'xl': 'var(--shadow-xl)',
                'glow': 'var(--shadow-glow)',
                'inner': 'var(--shadow-inner)',
            },
            // ===== Z-INDEX =====
            zIndex: {
                'dropdown': '100',
                'sticky': '200',
                'fixed': '300',
                'modal-backdrop': '400',
                'modal': '500',
                'popover': '600',
                'tooltip': '700',
                'toast': '800',
            },
            // ===== TRANSITIONS =====
            transitionDuration: {
                'fast': '150ms',
                'normal': '200ms',
                'slow': '300ms',
            },
            transitionTimingFunction: {
                'spring': 'cubic-bezier(0.4, 0, 0.2, 1)',
            },
            // ===== ANIMATIONS =====
            animation: {
                'fade-in': 'fadeIn 0.3s ease-out forwards',
                'slide-up': 'slideUp 0.3s ease-out forwards',
                'slide-in': 'slideIn 0.3s ease-out',
                'scale-in': 'scale-in 0.2s ease-out',
                'bounce-in': 'bounceIn 0.5s ease-out',
                'pulse-ring': 'pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite',
                'spin-slow': 'spin 2s linear infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideIn: {
                    '0%': { transform: 'translateX(100%)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
                'scale-in': {
                    '0%': { transform: 'scale(0.9)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                bounceIn: {
                    '0%': { opacity: '0', transform: 'scale(0.3)' },
                    '50%': { opacity: '1', transform: 'scale(1.05)' },
                    '70%': { transform: 'scale(0.9)' },
                    '100%': { transform: 'scale(1)' },
                },
                'pulse-ring': {
                    '0%': { transform: 'scale(0.33)', opacity: '1' },
                    '80%, 100%': { transform: 'scale(2)', opacity: '0' },
                },
            },
        },
    },
    plugins: [],
}
