import { StrictMode, Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'
import { createRoot } from 'react-dom/client'
import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react'
import { NETWORK } from './config'
import App from './App.tsx'
import './index.css'

// Error Boundary to catch and display errors gracefully
interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1a1a2e',
          color: 'white',
          fontFamily: 'system-ui, sans-serif',
          padding: '2rem'
        }}>
          <div style={{ textAlign: 'center', maxWidth: '500px' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Something went wrong</h1>
            <p style={{ color: '#888', marginBottom: '1rem' }}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Show a fallback UI if there's an initialization error
function showFallback(error: unknown) {
  const rootEl = document.getElementById('root')
  if (rootEl) {
    rootEl.innerHTML = `
      <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#1a1a2e;color:white;font-family:system-ui,sans-serif;padding:2rem;">
        <div style="text-align:center;max-width:500px;">
          <h1 style="font-size:2rem;margin-bottom:1rem;">Inbox3</h1>
          <p style="color:#888;margin-bottom:1rem;">
            ${error instanceof Error ? error.message : 'Failed to load the application. Please try refreshing.'}
          </p>
          <button onclick="window.location.reload()" style="padding:0.75rem 1.5rem;background:#6366f1;color:white;border:none;border-radius:0.5rem;cursor:pointer;font-size:1rem;">
            Reload Page
          </button>
        </div>
      </div>
    `
  }
}

try {
  const root = createRoot(document.getElementById('root')!)

  root.render(
    <StrictMode>
      <ErrorBoundary>
        <AptosWalletAdapterProvider
          autoConnect={false}
          dappConfig={{
            network: NETWORK,
            aptosConnectDappId: 'inbox3-dapp'
          }}
          onError={(error) => {
            console.error('Wallet error:', error)
          }}
        >
          <App />
        </AptosWalletAdapterProvider>
      </ErrorBoundary>
    </StrictMode>
  )
} catch (error) {
  console.error('Failed to initialize app:', error)
  showFallback(error)
}
