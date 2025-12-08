import { useEffect, useState, useCallback, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

// ============================================
// MODAL ROOT - Add to index.html: <div id="modal-root"></div>
// ============================================
const MODAL_ROOT_ID = 'modal-root'

function getModalRoot(): HTMLElement {
  let root = document.getElementById(MODAL_ROOT_ID)
  if (!root) {
    root = document.createElement('div')
    root.id = MODAL_ROOT_ID
    document.body.appendChild(root)
  }
  return root
}

// ============================================
// MODAL PORTAL
// ============================================
interface ModalPortalProps {
  children: ReactNode
  isOpen: boolean
  onClose: () => void
  closeOnOverlay?: boolean
  closeOnEscape?: boolean
}

export function ModalPortal({
  children,
  isOpen,
  onClose,
  closeOnOverlay = true,
  closeOnEscape = true,
}: ModalPortalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose, closeOnEscape])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [isOpen])

  // Focus trap
  useEffect(() => {
    if (!isOpen) return

    const modalRoot = getModalRoot()
    const focusableElements = modalRoot.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleTab)
    firstElement?.focus()

    return () => document.removeEventListener('keydown', handleTab)
  }, [isOpen])

  if (!mounted || !isOpen) return null

  return createPortal(
    <div className="modal-overlay" onClick={closeOnOverlay ? onClose : undefined}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    getModalRoot()
  )
}

// ============================================
// MODAL COMPONENT
// ============================================
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showClose?: boolean
  footer?: ReactNode
  className?: string
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showClose = true,
  footer,
  className = '',
}: ModalProps) {
  return (
    <ModalPortal isOpen={isOpen} onClose={onClose}>
      <div
        className={`modal modal--${size} ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby={description ? 'modal-description' : undefined}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="modal__header">
            <div className="modal__header-text">
              {title && (
                <h2 id="modal-title" className="modal__title">
                  {title}
                </h2>
              )}
              {description && (
                <p id="modal-description" className="modal__description">
                  {description}
                </p>
              )}
            </div>
            {showClose && (
              <button
                className="modal__close"
                onClick={onClose}
                aria-label="Close modal"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="modal__body">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="modal__footer">
            {footer}
          </div>
        )}
      </div>
    </ModalPortal>
  )
}

// ============================================
// DRAWER COMPONENT (Slide-in panel)
// ============================================
interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  position?: 'left' | 'right'
  size?: 'sm' | 'md' | 'lg'
}

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  position = 'right',
  size = 'md',
}: DrawerProps) {
  return (
    <ModalPortal isOpen={isOpen} onClose={onClose}>
      <div
        className={`drawer drawer--${position} drawer--${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'drawer-title' : undefined}
      >
        {/* Header */}
        <div className="drawer__header">
          {title && (
            <h2 id="drawer-title" className="drawer__title">
              {title}
            </h2>
          )}
          <button
            className="drawer__close"
            onClick={onClose}
            aria-label="Close drawer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="drawer__body">
          {children}
        </div>
      </div>
    </ModalPortal>
  )
}

// ============================================
// CONFIRM MODAL
// ============================================
interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  loading?: boolean
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
}: ConfirmModalProps) {
  const handleConfirm = useCallback(() => {
    onConfirm()
  }, [onConfirm])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
    >
      <p className="modal__message">{message}</p>
      <div className="modal__actions">
        <button
          className="btn btn--ghost"
          onClick={onClose}
          disabled={loading}
        >
          {cancelText}
        </button>
        <button
          className={`btn btn--${variant}`}
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading ? 'Loading...' : confirmText}
        </button>
      </div>
    </Modal>
  )
}

export default Modal
