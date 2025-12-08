import type { Preview } from '@storybook/react'
import '../src/index.css'

const preview: Preview = {
    parameters: {
        actions: { argTypesRegex: '^on[A-Z].*' },
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i
            }
        },
        backgrounds: {
            default: 'light',
            values: [
                { name: 'light', value: '#ffffff' },
                { name: 'dark', value: '#0f172a' }
            ]
        },
        a11y: {
            // Enable accessibility addon
            element: '#storybook-root',
            config: {},
            options: {
                runOnly: {
                    type: 'tag',
                    values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
                }
            }
        }
    },
    decorators: [
        (Story, context) => {
            // Apply theme based on background
            const isDark = context.globals.backgrounds?.value === '#0f172a'
            document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
            return <Story />
        }
    ],
    globalTypes: {
        theme: {
            name: 'Theme',
            description: 'Global theme for components',
            defaultValue: 'light',
            toolbar: {
                icon: 'circlehollow',
                items: [
                    { value: 'light', icon: 'sun', title: 'Light' },
                    { value: 'dark', icon: 'moon', title: 'Dark' }
                ],
                showName: true
            }
        }
    }
}

export default preview
