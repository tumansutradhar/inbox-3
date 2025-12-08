import { StrictMode, Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'
import { createRoot } from 'react-dom/client'
import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react'
import { Network } from '@aptos-labs/ts-sdk'
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

const root = createRoot(document.getElementById('root')!)

root.render(
  <StrictMode>
    <ErrorBoundary>
      <AptosWalletAdapterProvider
        autoConnect={false}
        dappConfig={{
          network: Network.TESTNET,
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
