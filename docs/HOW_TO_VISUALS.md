# HOW TO VISUALS - Inbox3 Design System Guide

This guide explains how to use and maintain the Inbox3 visual design system.

## 🎨 Design System Overview

The Inbox3 design system provides a consistent, accessible, and maintainable UI foundation.

### Key Principles
- **Consistency**: Reusable components ensure uniform styling
- **Accessibility**: WCAG 2.1 compliant with ARIA labels and keyboard navigation
- **Mobile-first**: Responsive design starting from mobile breakpoints
- **Dark/Light mode**: Full theme support with CSS custom properties

## 📁 File Structure

```
frontend/src/
├── components/
│   ├── ui/                       # Core UI component library
│   │   ├── index.ts              # Exports all components
│   │   ├── Button.tsx            # Button variants (primary, secondary, etc.)
│   │   ├── Input.tsx             # Form inputs with labels/errors
│   │   ├── Textarea.tsx          # Multiline text input
│   │   ├── Modal.tsx             # Dialog windows
│   │   ├── Card.tsx              # Container cards
│   │   ├── Avatar.tsx            # User avatars with status
│   │   ├── Badge.tsx             # Status badges
│   │   ├── Tooltip.tsx           # Hover tooltips
│   │   ├── Spinner.tsx           # Loading spinners
│   │   ├── Skeleton.tsx          # Loading placeholders
│   │   ├── EmptyState.tsx        # Empty view states
│   │   ├── StatusIndicator.tsx   # Connection status
│   │   └── IconButton.tsx        # Icon-only buttons
│   ├── ComponentShowcase.tsx     # Visual QA page
│   ├── MessageList.tsx           # Enhanced message list
│   ├── Sidebar.tsx               # Collapsible navigation
│   ├── RealtimeIndicators.tsx    # Typing/presence indicators
│   ├── TransactionUX.tsx         # Wallet transaction flow
│   └── IPFSUpload.tsx            # IPFS upload progress
├── index.css                     # Design tokens & global styles
└── App.tsx                       # Main application
```

## 🎯 Design Tokens

Located in `src/index.css`, these CSS custom properties define the visual language:

### Colors
```css
--primary-brand: #FF6B35;      /* Orange - primary actions */
--primary-brand-hover: #e55a28; /* Hover state */
--success-green: #10B981;       /* Success states */
--warning-yellow: #F59E0B;      /* Warnings */
--error-red: #EF4444;           /* Errors */
--info-blue: #3B82F6;           /* Information */
```

### Typography Scale
```css
--text-xs: 12px;    /* Captions, timestamps */
--text-sm: 14px;    /* Secondary text */
--text-base: 16px;  /* Body text */
--text-lg: 18px;    /* Subheadings */
--text-xl: 20px;    /* Section titles */
--text-2xl: 24px;   /* Page titles */
```

### Spacing Scale
```css
--space-1: 4px;   --space-8: 32px;
--space-2: 8px;   --space-10: 40px;
--space-3: 12px;  --space-12: 48px;
--space-4: 16px;  --space-16: 64px;
--space-5: 20px;  --space-20: 80px;
--space-6: 24px;  --space-24: 96px;
```

### Border Radius
```css
--radius-sm: 6px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-2xl: 24px;
--radius-full: 9999px;
```

## 🧩 Component Usage

### Button
```tsx
import { Button } from './components/ui'

// Variants
<Button variant="primary">Save</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="outline">Edit</Button>
<Button variant="ghost">More</Button>
<Button variant="danger">Delete</Button>

// Sizes
<Button size="xs">Tiny</Button>
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// States
<Button loading>Saving...</Button>
<Button disabled>Disabled</Button>
<Button fullWidth>Full Width</Button>

// With icon
<Button icon={<SendIcon />}>Send Message</Button>
```

### Input
```tsx
import { Input } from './components/ui'

<Input
  label="Email Address"
  placeholder="you@example.com"
  hint="We'll never share your email"
  error="Invalid email format"
  icon={<EmailIcon />}
/>
```

### Card
```tsx
import { Card } from './components/ui'

<Card variant="default">Default card</Card>
<Card variant="outlined">With border</Card>
<Card variant="elevated">With shadow</Card>
<Card variant="glass">Glass effect</Card>
```

### Avatar
```tsx
import { Avatar } from './components/ui'

<Avatar 
  address="0x1234567890abcdef"
  size="md"
  status="online"
/>
```

### Modal
```tsx
import { Modal } from './components/ui'

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
  size="md"
  footer={<Button onClick={handleConfirm}>Confirm</Button>}
>
  <p>Are you sure you want to proceed?</p>
</Modal>
```

## 🔍 Visual QA

### Accessing the Component Showcase

Add this route to test all components visually:

```tsx
// In your router or App.tsx
import ComponentShowcase from './components/ComponentShowcase'

// Add route
<Route path="/showcase" element={<ComponentShowcase />} />

// Or temporarily render it
{process.env.NODE_ENV === 'development' && <ComponentShowcase />}
```

Visit `http://localhost:5173/showcase` to see all components.

### QA Checklist

When reviewing components, verify:

- [ ] **Colors**: Match design tokens
- [ ] **Typography**: Consistent font sizes and weights
- [ ] **Spacing**: Uniform padding and margins
- [ ] **States**: Hover, focus, active, disabled work correctly
- [ ] **Responsive**: Works on mobile (375px), tablet (768px), desktop (1024px+)
- [ ] **Dark mode**: Toggle theme and verify all components
- [ ] **Accessibility**: 
  - Keyboard navigation (Tab, Enter, Escape)
  - Focus indicators visible
  - ARIA labels present
  - Color contrast meets WCAG AA

## 📱 Responsive Breakpoints

```css
/* Mobile first - default styles */
.element { padding: 16px; }

/* Tablet (768px+) */
@media (min-width: 768px) {
  .element { padding: 24px; }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .element { padding: 32px; }
}

/* Large desktop (1280px+) */
@media (min-width: 1280px) {
  .element { padding: 48px; }
}
```

Tailwind equivalents:
- `sm:` = 640px+
- `md:` = 768px+
- `lg:` = 1024px+
- `xl:` = 1280px+

## ♿ Accessibility Guidelines

### Keyboard Navigation
- All interactive elements are focusable
- Tab order follows visual layout
- Escape closes modals and dropdowns
- Enter/Space activates buttons

### ARIA Labels
```tsx
// Buttons with icons only
<button aria-label="Close dialog">
  <CloseIcon />
</button>

// Status indicators
<span role="status" aria-live="polite">
  Connected
</span>

// Form inputs
<input
  id="email"
  aria-describedby="email-hint"
  aria-invalid={!!error}
/>
```

### Focus Management
```tsx
// Focus trap in modals
useEffect(() => {
  if (isOpen) {
    firstInputRef.current?.focus()
  }
}, [isOpen])

// Return focus on close
const previousFocus = useRef(document.activeElement)
useEffect(() => {
  return () => previousFocus.current?.focus()
}, [])
```

## 🎬 Animations

### Available Animations
```css
.animate-fade-in    /* Opacity 0 → 1 */
.animate-slide-up   /* Translate up + fade */
.animate-bounceIn   /* Scale bounce effect */
.animate-pulse      /* Pulse opacity */
.animate-spin       /* 360° rotation */
```

### Transition Presets
```css
--transition-fast: 150ms ease-out;
--transition-normal: 200ms ease-out;
--transition-slow: 300ms ease-out;
```

## 🌙 Theme Support

Toggle between light and dark mode:

```tsx
// Set theme
document.documentElement.setAttribute('data-theme', 'dark')

// Persist preference
localStorage.setItem('theme', 'dark')

// Check system preference
window.matchMedia('(prefers-color-scheme: dark)').matches
```

Theme-aware CSS:
```css
[data-theme="dark"] {
  --bg-main: #0f172a;
  --bg-card: #1e293b;
  --text-primary: #f1f5f9;
}
```

## 📦 Adding New Components

1. Create component in `src/components/ui/`
2. Export from `src/components/ui/index.ts`
3. Add to ComponentShowcase for visual QA
4. Document usage in this guide

### Component Template
```tsx
import { forwardRef } from 'react'

export interface NewComponentProps {
  variant?: 'default' | 'alternate'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export const NewComponent = forwardRef<HTMLDivElement, NewComponentProps>(
  ({ variant = 'default', size = 'md', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`base-styles ${variantStyles[variant]} ${sizeStyles[size]}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)

NewComponent.displayName = 'NewComponent'
```

## 🚀 Quick Start Commands

```bash
# Start development server
cd frontend && npm run dev

# Build for production
npm run build

# View component showcase
# Navigate to http://localhost:5173/showcase
```

---

**Last updated**: December 2024
**Maintainer**: Inbox3 Team
