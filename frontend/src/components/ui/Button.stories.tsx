import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'

const meta: Meta<typeof Button> = {
    title: 'UI/Button',
    component: Button,
    parameters: {
        layout: 'centered'
    },
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['primary', 'secondary', 'danger', 'ghost']
        },
        size: {
            control: 'select',
            options: ['sm', 'md', 'lg']
        },
        disabled: { control: 'boolean' },
        loading: { control: 'boolean' },
        fullWidth: { control: 'boolean' }
    }
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
    args: {
        children: 'Primary Button',
        variant: 'primary'
    }
}

export const Secondary: Story = {
    args: {
        children: 'Secondary Button',
        variant: 'secondary'
    }
}

export const Danger: Story = {
    args: {
        children: 'Delete',
        variant: 'danger'
    }
}

export const Ghost: Story = {
    args: {
        children: 'Ghost Button',
        variant: 'ghost'
    }
}

export const Small: Story = {
    args: {
        children: 'Small Button',
        size: 'sm'
    }
}

export const Large: Story = {
    args: {
        children: 'Large Button',
        size: 'lg'
    }
}

export const Loading: Story = {
    args: {
        children: 'Loading...',
        loading: true
    }
}

export const Disabled: Story = {
    args: {
        children: 'Disabled',
        disabled: true
    }
}

export const WithIcon: Story = {
    args: {
        children: 'Send Message',
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
        )
    }
}

export const FullWidth: Story = {
    args: {
        children: 'Full Width Button',
        fullWidth: true
    },
    parameters: {
        layout: 'padded'
    }
}

export const AllVariants: Story = {
    render: () => (
        <div className="flex flex-col gap-4">
            <div className="flex gap-2">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="ghost">Ghost</Button>
            </div>
            <div className="flex gap-2">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
            </div>
            <div className="flex gap-2">
                <Button loading>Loading</Button>
                <Button disabled>Disabled</Button>
            </div>
        </div>
    )
}
