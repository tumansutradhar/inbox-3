import { useState } from 'react'
import {
  Button,
  Input,
  Textarea,
  Modal,
  Card,
  Avatar,
  Tooltip,
  Badge,
  Spinner,
  Skeleton,
  EmptyState,
  StatusIndicator,
  IconButton
} from './ui'

/**
 * ComponentShowcase - Visual QA page for all UI components
 * Acts as a lightweight Storybook alternative for design system documentation
 */
export default function ComponentShowcase() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [textareaValue, setTextareaValue] = useState('')

  return (
    <div className="min-h-screen bg-(--bg-main) p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <header className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-(--text-primary)">
            Inbox3 Component Library
          </h1>
          <p className="text-(--text-secondary) max-w-2xl mx-auto">
            Visual QA showcase of all reusable UI components. Use this page to verify
            consistent styling, interactions, and accessibility across the design system.
          </p>
        </header>

        {/* Table of Contents */}
        <nav className="flex flex-wrap justify-center gap-2">
          {[
            'Buttons', 'Inputs', 'Cards', 'Avatars', 'Badges',
            'Spinners', 'Skeletons', 'Modals', 'Tooltips', 'Status'
          ].map(section => (
            <a
              key={section}
              href={`#${section.toLowerCase()}`}
              className="px-3 py-1.5 text-sm rounded-lg bg-(--bg-secondary) text-(--text-secondary) hover:text-(--primary-brand) transition-colors"
            >
              {section}
            </a>
          ))}
        </nav>

        {/* Buttons Section */}
        <Section id="buttons" title="Buttons" description="Primary action components with multiple variants and states">
          <Subsection title="Variants">
            <div className="flex flex-wrap gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
            </div>
          </Subsection>

          <Subsection title="Sizes">
            <div className="flex flex-wrap items-center gap-3">
              <Button size="xs">Extra Small</Button>
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
          </Subsection>

          <Subsection title="States">
            <div className="flex flex-wrap gap-3">
              <Button>Default</Button>
              <Button disabled>Disabled</Button>
              <Button loading>Loading</Button>
              <Button icon={<IconSend />}>With Icon</Button>
            </div>
          </Subsection>

          <Subsection title="Full Width">
            <Button fullWidth>Full Width Button</Button>
          </Subsection>
        </Section>

        {/* Icon Buttons Section */}
        <Section id="iconbuttons" title="Icon Buttons" description="Compact buttons for icon-only actions">
          <div className="flex flex-wrap gap-3">
            <IconButton icon={<IconSettings />} label="Settings" variant="default" />
            <IconButton icon={<IconSettings />} label="Settings" variant="ghost" />
            <IconButton icon={<IconSettings />} label="Settings" variant="outline" />
            <IconButton icon={<IconSettings />} label="Settings with badge" badge={5} />
          </div>
        </Section>

        {/* Inputs Section */}
        <Section id="inputs" title="Inputs" description="Form input components with labels, hints, and validation">
          <div className="grid gap-6 md:grid-cols-2">
            <Input
              label="Default Input"
              placeholder="Enter text..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <Input
              label="With Hint"
              placeholder="Enter your email"
              hint="We'll never share your email"
            />
            <Input
              label="With Error"
              placeholder="Required field"
              error="This field is required"
            />
            <Input
              label="With Icon"
              placeholder="Search..."
              icon={<IconSearch />}
            />
            <Input
              label="Disabled"
              placeholder="Cannot edit"
              disabled
            />
          </div>

          <Subsection title="Textarea">
            <Textarea
              label="Message"
              placeholder="Type your message..."
              value={textareaValue}
              onChange={(e) => setTextareaValue(e.target.value)}
              hint="Shift+Enter for new line"
            />
          </Subsection>
        </Section>

        {/* Cards Section */}
        <Section id="cards" title="Cards" description="Container components for grouping related content">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="p-4">
              <h4 className="font-medium mb-2">Default Card</h4>
              <p className="text-sm text-(--text-secondary)">Basic card with padding</p>
            </Card>
            <Card variant="outlined" className="p-4">
              <h4 className="font-medium mb-2">Outlined Card</h4>
              <p className="text-sm text-(--text-secondary)">With visible border</p>
            </Card>
            <Card variant="elevated" className="p-4">
              <h4 className="font-medium mb-2">Elevated Card</h4>
              <p className="text-sm text-(--text-secondary)">With shadow depth</p>
            </Card>
            <Card variant="glass" className="p-4">
              <h4 className="font-medium mb-2">Glass Card</h4>
              <p className="text-sm text-(--text-secondary)">Frosted glass effect</p>
            </Card>
          </div>
        </Section>

        {/* Avatars Section */}
        <Section id="avatars" title="Avatars" description="User representation with address-based colors and status indicators">
          <Subsection title="Sizes">
            <div className="flex items-end gap-4">
              <Avatar address="0x1234567890abcdef" size="xs" />
              <Avatar address="0x1234567890abcdef" size="sm" />
              <Avatar address="0x1234567890abcdef" size="md" />
              <Avatar address="0x1234567890abcdef" size="lg" />
              <Avatar address="0x1234567890abcdef" size="xl" />
            </div>
          </Subsection>

          <Subsection title="With Status">
            <div className="flex items-center gap-4">
              <Avatar address="0xaaaa" status="online" />
              <Avatar address="0xbbbb" status="offline" />
              <Avatar address="0xcccc" status="away" />
              <Avatar address="0xdddd" status="busy" />
            </div>
          </Subsection>

          <Subsection title="Address Variations">
            <div className="flex items-center gap-4">
              <Avatar address="0x1111111111111111" />
              <Avatar address="0x2222222222222222" />
              <Avatar address="0x3333333333333333" />
              <Avatar address="0x4444444444444444" />
              <Avatar address="0x5555555555555555" />
              <Avatar address="0x6666666666666666" />
            </div>
          </Subsection>
        </Section>

        {/* Badges Section */}
        <Section id="badges" title="Badges" description="Status indicators and labels">
          <div className="flex flex-wrap gap-3">
            <Badge>Default</Badge>
            <Badge variant="primary">Primary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="danger">Danger</Badge>
            <Badge variant="info">Info</Badge>
          </div>

          <Subsection title="With Dot">
            <div className="flex flex-wrap gap-3">
              <Badge dot>Online</Badge>
              <Badge dot variant="success">Connected</Badge>
              <Badge dot variant="danger">Error</Badge>
            </div>
          </Subsection>

          <Subsection title="Sizes">
            <div className="flex flex-wrap items-center gap-3">
              <Badge size="sm">Small</Badge>
              <Badge size="md">Medium</Badge>
            </div>
          </Subsection>
        </Section>

        {/* Spinners Section */}
        <Section id="spinners" title="Spinners" description="Loading indicators">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <Spinner size="xs" />
              <p className="text-xs mt-2 text-(--text-muted)">XS</p>
            </div>
            <div className="text-center">
              <Spinner size="sm" />
              <p className="text-xs mt-2 text-(--text-muted)">SM</p>
            </div>
            <div className="text-center">
              <Spinner size="md" />
              <p className="text-xs mt-2 text-(--text-muted)">MD</p>
            </div>
            <div className="text-center">
              <Spinner size="lg" />
              <p className="text-xs mt-2 text-(--text-muted)">LG</p>
            </div>
          </div>
        </Section>

        {/* Skeletons Section */}
        <Section id="skeletons" title="Skeletons" description="Loading placeholders for content">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-4 space-y-3">
              <Skeleton variant="circular" width={48} height={48} />
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="40%" />
            </Card>
            <Card className="p-4 space-y-3">
              <div className="flex gap-3">
                <Skeleton variant="circular" width={40} height={40} />
                <div className="flex-1 space-y-2">
                  <Skeleton variant="text" width="50%" />
                  <Skeleton variant="text" width="70%" />
                </div>
              </div>
              <Skeleton variant="rectangular" height={100} />
            </Card>
          </div>
        </Section>

        {/* Status Indicators Section */}
        <Section id="status" title="Status Indicators" description="Connection and state indicators">
          <div className="flex flex-wrap gap-6">
            <StatusIndicator status="online" />
            <StatusIndicator status="offline" />
            <StatusIndicator status="connecting" />
            <StatusIndicator status="error" />
          </div>

          <Subsection title="Without Label">
            <div className="flex gap-4">
              <StatusIndicator status="online" showLabel={false} />
              <StatusIndicator status="offline" showLabel={false} />
              <StatusIndicator status="connecting" showLabel={false} />
              <StatusIndicator status="error" showLabel={false} />
            </div>
          </Subsection>
        </Section>

        {/* Tooltips Section */}
        <Section id="tooltips" title="Tooltips" description="Contextual information on hover">
          <div className="flex flex-wrap gap-4">
            <Tooltip content="Top tooltip" position="top">
              <Button variant="outline">Hover (Top)</Button>
            </Tooltip>
            <Tooltip content="Bottom tooltip" position="bottom">
              <Button variant="outline">Hover (Bottom)</Button>
            </Tooltip>
            <Tooltip content="Left tooltip" position="left">
              <Button variant="outline">Hover (Left)</Button>
            </Tooltip>
            <Tooltip content="Right tooltip" position="right">
              <Button variant="outline">Hover (Right)</Button>
            </Tooltip>
          </div>
        </Section>

        {/* Empty States Section */}
        <Section id="emptystates" title="Empty States" description="Placeholder content for empty views">
          <div className="grid gap-6 md:grid-cols-2">
            <EmptyState
              icon={<IconInbox />}
              title="No messages yet"
              description="Your inbox is empty. Start a conversation to see messages here."
              action={{ label: 'Send Message', onClick: () => console.log('Send message clicked') }}
            />
            <EmptyState
              icon={<IconSearch />}
              title="No results found"
              description="Try adjusting your search or filters to find what you're looking for."
            />
          </div>
        </Section>

        {/* Modals Section */}
        <Section id="modals" title="Modals" description="Dialog windows for focused interactions">
          <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
          
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Example Modal"
          >
            <p className="text-(--text-secondary) mb-6">
              This is an example modal dialog. It supports a title, content area, and actions.
              Click outside or press Escape to close.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={() => setIsModalOpen(false)}>Confirm</Button>
            </div>
          </Modal>
        </Section>

        {/* Color Palette */}
        <Section id="colors" title="Color Palette" description="Design system color tokens">
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
            <ColorSwatch name="Primary" color="var(--primary-brand)" />
            <ColorSwatch name="Primary Hover" color="var(--primary-brand-hover)" />
            <ColorSwatch name="Success" color="var(--success-green)" />
            <ColorSwatch name="Warning" color="var(--warning-yellow)" />
            <ColorSwatch name="Error" color="var(--error-red)" />
            <ColorSwatch name="Info" color="var(--info-blue)" />
          </div>

          <Subsection title="Background Colors">
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
              <ColorSwatch name="BG Main" color="var(--bg-main)" bordered />
              <ColorSwatch name="BG Card" color="var(--bg-card)" bordered />
              <ColorSwatch name="BG Secondary" color="var(--bg-secondary)" bordered />
              <ColorSwatch name="Border" color="var(--border-color)" bordered />
            </div>
          </Subsection>

          <Subsection title="Text Colors">
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
              <ColorSwatch name="Text Primary" color="var(--text-primary)" />
              <ColorSwatch name="Text Secondary" color="var(--text-secondary)" />
              <ColorSwatch name="Text Muted" color="var(--text-muted)" />
            </div>
          </Subsection>
        </Section>

        {/* Typography */}
        <Section id="typography" title="Typography" description="Font sizes and text styles">
          <div className="space-y-4">
            <p className="text-5xl font-bold">Heading 1 (48px)</p>
            <p className="text-4xl font-bold">Heading 2 (36px)</p>
            <p className="text-3xl font-bold">Heading 3 (30px)</p>
            <p className="text-2xl font-semibold">Heading 4 (24px)</p>
            <p className="text-xl font-semibold">Heading 5 (20px)</p>
            <p className="text-lg font-medium">Heading 6 (18px)</p>
            <p className="text-base">Body text (16px) - The quick brown fox jumps over the lazy dog.</p>
            <p className="text-sm text-(--text-secondary)">Small text (14px) - Secondary information and captions.</p>
            <p className="text-xs text-(--text-muted)">Extra small (12px) - Timestamps, labels, and metadata.</p>
          </div>
        </Section>

        {/* Spacing */}
        <Section id="spacing" title="Spacing Scale" description="Consistent spacing tokens">
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6, 8, 10, 12, 16].map(size => (
              <div key={size} className="flex items-center gap-4">
                <span className="w-12 text-xs text-(--text-muted)">--space-{size}</span>
                <div 
                  className="bg-(--primary-brand) h-4" 
                  style={{ width: `${size * 4}px` }}
                />
                <span className="text-xs text-(--text-secondary)">{size * 4}px</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Footer */}
        <footer className="text-center py-8 border-t border-(--border-color)">
          <p className="text-(--text-muted) text-sm">
            Inbox3 Design System • Built with React + Tailwind CSS
          </p>
        </footer>
      </div>
    </div>
  )
}

// Helper Components
function Section({ id, title, description, children }: {
  id: string
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-(--text-primary) mb-2">{title}</h2>
        <p className="text-(--text-secondary)">{description}</p>
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </section>
  )
}

function Subsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-(--text-muted) uppercase tracking-wider">{title}</h3>
      {children}
    </div>
  )
}

function ColorSwatch({ name, color, bordered }: { name: string; color: string; bordered?: boolean }) {
  return (
    <div className="space-y-2">
      <div 
        className={`w-full h-16 rounded-lg ${bordered ? 'border border-(--border-color)' : ''}`}
        style={{ backgroundColor: color }}
      />
      <p className="text-xs font-medium text-(--text-primary)">{name}</p>
      <p className="text-xs text-(--text-muted) font-mono">{color}</p>
    </div>
  )
}

// Icons used in showcase
function IconSend() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  )
}

function IconSettings() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  )
}

function IconInbox() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  )
}
