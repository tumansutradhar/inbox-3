import { useState, useEffect, useCallback } from 'react'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk'
import SendMessage from './components/SendMessage'
import Inbox from './components/Inbox'
import NotificationSystem from './components/NotificationSystem'
import GroupList from './components/GroupList'
import GroupChat from './components/GroupChat'
import CreateGroupModal from './components/CreateGroupModal'
import { getRealtimeService, type RealtimeMessage } from './lib/realtime'
import { useNotifications } from './lib/notifications'
import logo from '/public/logo.png'
import './App.css'

const aptosConfig = new AptosConfig({ network: Network.TESTNET })
const aptos = new Aptos(aptosConfig)

const CONTRACT_ADDRESS = "0xf1768eb79d367572b8e436f8e3bcfecf938eeaf6656a65f73773c50c43b71d67"

type AppView = 'dm' | 'groups'

function App() {
  const { account, connected, connect, disconnect, wallets, signAndSubmitTransaction } = useWallet()
  const [hasInbox, setHasInbox] = useState(false)
  const [loading, setLoading] = useState(false)
  const [networkError, setNetworkError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [lastMessageSent, setLastMessageSent] = useState(0)
  const [realtimeEnabled, setRealtimeEnabled] = useState(true)
  const { notifications, addNotification, dismissNotification } = useNotifications()

  // Group Chat State
  const [currentView, setCurrentView] = useState<AppView>('dm')
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false)

  const refreshInbox = useCallback(() => {
    console.log('Triggering inbox refresh')
    setRefreshKey(prev => prev + 1)
  }, [])

  const handleRealtimeEvent = useCallback((event: RealtimeMessage) => {
    console.log('Real-time event received:', event)

    if (event.type === 'message_received') {
      console.log('📨 New message received from:', event.sender)
      addNotification({
        type: 'info',
        message: `Message received from ${event.sender.slice(0, 6)}...${event.sender.slice(-4)}`,
        duration: 5000
      })
    } else if (event.type === 'message_sent') {
      console.log('📤 Message sent to:', event.recipient)
      addNotification({
        type: 'success',
        message: `Message sent to ${event.recipient.slice(0, 6)}...${event.recipient.slice(-4)}`,
        duration: 3000
      })
    }

    refreshInbox()
  }, [refreshInbox, addNotification])

  const handleMessageSent = useCallback(() => {
    console.log('Message sent, triggering immediate refresh')
    refreshInbox()
    setLastMessageSent(Date.now())
  }, [refreshInbox])

  useEffect(() => {
    const checkNetwork = async () => {
      if (connected && account) {
        try {
          const accountInfo = await aptos.getAccountInfo({ accountAddress: account.address })
          console.log('Account info:', accountInfo)
          setNetworkError(null)
        } catch (error: unknown) {
          console.error('Network error:', error)
          if (error instanceof Error && error.message?.includes('mainnet')) {
            setNetworkError('⚠️ Please switch your wallet to Aptos Testnet to use this app!')
          }
        }
      }
    }

    checkNetwork()
  }, [connected, account])

  const checkInboxExists = useCallback(async () => {
    if (!account) return
    try {
      console.log('Checking if inbox exists for:', account.address)

      const response = await aptos.view({
        payload: {
          function: `${CONTRACT_ADDRESS}::Inbox3::inbox_exists`,
          functionArguments: [account.address]
        }
      })

      console.log('Inbox exists response:', response)
      setHasInbox(response[0] as boolean)
    } catch (error) {
      console.error('Error checking inbox:', error)
      setHasInbox(false)
    }
  }, [account])

  useEffect(() => {
    if (connected && account) {
      checkInboxExists()
    }
  }, [connected, account, checkInboxExists])

  useEffect(() => {
    if (connected && account && realtimeEnabled) {
      console.log('Setting up real-time event subscription')
      const realtimeService = getRealtimeService(CONTRACT_ADDRESS)

      realtimeService.subscribe(account.address.toString(), handleRealtimeEvent)

      return () => {
        console.log('Cleaning up real-time event subscription')
        realtimeService.unsubscribe(account.address.toString())
      }
    }
  }, [connected, account, realtimeEnabled, handleRealtimeEvent])

  useEffect(() => {
    if (connected && account) {
      console.log('Setting up conservative auto-refresh')

      const recentMessageSent = Date.now() - lastMessageSent < 60000
      const refreshInterval = recentMessageSent ? 15000 : 45000

      const interval = setInterval(() => {
        console.log('Conservative auto-refresh...')
        refreshInbox()
        checkInboxExists()
      }, refreshInterval)

      return () => {
        console.log('Clearing conservative auto-refresh interval')
        clearInterval(interval)
      }
    }
  }, [connected, account, refreshInbox, checkInboxExists, lastMessageSent])

  const createInbox = async () => {
    if (!account) return
    setLoading(true)
    try {
      console.log('Creating inbox for account:', account.address)
      console.log('Contract address:', CONTRACT_ADDRESS)

      const response = await signAndSubmitTransaction({
        data: {
          function: `${CONTRACT_ADDRESS}::Inbox3::create_inbox`,
          typeArguments: [],
          functionArguments: []
        }
      })
      console.log('Transaction submitted:', response)

      await aptos.waitForTransaction({ transactionHash: response.hash })
      console.log('Transaction confirmed')

      setHasInbox(true)
      alert('Inbox created successfully!')
    } catch (error) {
      console.error('Error creating inbox:', error)

      if (error instanceof Error) {
        console.error('Error message:', error.message)
        console.error('Error stack:', error.stack)
        alert(`Failed to create inbox: ${error.message}`)
      } else {
        console.error('Unknown error:', error)
        alert('Failed to create inbox: Unknown error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = useCallback(async () => {
    if (!account || !hasInbox) return
    try {
      console.log('Messages updated - inbox will refresh automatically')
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }, [account, hasInbox])

  useEffect(() => {
    if (hasInbox) {
      loadMessages()
    }
  }, [hasInbox, loadMessages])

  if (!connected) {
    return (
      <div className="welcome-container">
        <div className="welcome-card">
          <img src={logo} alt="Inbox3 Logo" className="welcome-logo-img" />
          <p className="welcome-subtitle">
            Secure, decentralized messaging powered by blockchain technology.
          </p>
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Connect Your Wallet</h2>
            <p className="text-secondary mb-6">
              Choose your preferred wallet to get started with secure messaging
            </p>
            <div className="space-y-3">
              {wallets.map((wallet) => (
                <button key={wallet.name} onClick={() => connect(wallet.name)} className="btn btn-primary w-full text-sm">
                  {wallet.name === 'Petra' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M11.3693 22.4084C7.56149 22.4084 4.47461 19.3215 4.47461 15.5137V4.0981L11.3693 1.59082V22.4084Z" fill="white" />
                      <path d="M12.6304 13.8443C16.4382 13.8443 19.5251 10.7574 19.5251 6.94954V4.0981L12.6304 1.59082V13.8443Z" fill="white" />
                    </svg>
                  ) : (
                    <img src={wallet.icon} alt={wallet.name} className="w-5 h-5" />
                  )}
                  Connect {wallet.name}
                </button>
              ))}
            </div>
            <div className="feature-grid">
              <div className="feature-item">
                <div className="feature-icon feature-icon-blue">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7v10c0 5.55 3.84 10 9 10s9-4.45 9-10V7L12 2z" />
                  </svg>
                </div>
                <div className="feature-text">Secure</div>
                <div className="text-xs text-muted">End-to-end encrypted messages</div>
              </div>
              <div className="feature-item">
                <div className="feature-icon feature-icon-green">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </div>
                <div className="feature-text">Fast</div>
                <div className="text-xs text-muted">Lightning-fast blockchain transactions</div>
              </div>
              <div className="feature-item">
                <div className="feature-icon feature-icon-purple">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                </div>
                <div className="feature-text">Global</div>
                <div className="text-xs text-muted">Send messages anywhere in the world</div>
              </div>
              <div className="feature-item">
                <div className="feature-icon feature-icon-orange">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="7.5,4.21 12,6.81 16.5,4.21" />
                    <polyline points="7.5,19.79 7.5,14.6 3,12" />
                    <polyline points="21,12 16.5,14.6 16.5,19.79" />
                    <polyline points="3.27,6.96 12,12.01 20.73,6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                  </svg>
                </div>
                <div className="feature-text">Web3</div>
                <div className="text-xs text-muted">Decentralized and trustless</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <NotificationSystem notifications={notifications} onDismiss={dismissNotification} />
      <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        onClose={() => setIsCreateGroupModalOpen(false)}
        contractAddress={CONTRACT_ADDRESS}
        onGroupCreated={() => {
          // Refresh groups logic if needed, or just let the user see it in the list
        }}
      />

      <header className="header">
        <div className="container">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Inbox3 Logo" className="w-28" />
              <div>
                <p className="text-xs text-muted">Secure Web3 Messaging</p>
              </div>
            </div>

            {/* View Switcher */}
            <div className="flex bg-background-secondary rounded-lg p-1 gap-1">
              <button
                onClick={() => setCurrentView('dm')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${currentView === 'dm' ? 'bg-primary text-white shadow-sm' : 'text-secondary hover:text-text-primary'
                  }`}
              >
                Direct Messages
              </button>
              <button
                onClick={() => setCurrentView('groups')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${currentView === 'groups' ? 'bg-primary text-white shadow-sm' : 'text-secondary hover:text-text-primary'
                  }`}
              >
                Groups
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 desktop-only">
                <div className="status-indicator status-online"></div>
                <span className="text-sm text-secondary">Connected</span>
              </div>
              <span className="text-sm text-secondary">
                {account?.address?.toString()?.slice(0, 6)}...{account?.address?.toString()?.slice(-4)}
              </span>
              <div className="flex items-center gap-2">
                {realtimeEnabled && (
                  <span className="text-sm text-secondary desktop-only">LIVE</span>
                )}
                <span className="text-sm text-muted desktop-only">Real-time</span>
                <button onClick={() => setRealtimeEnabled(!realtimeEnabled)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${realtimeEnabled ? 'bg-orange-500' : 'bg-gray-300'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${realtimeEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              <button onClick={disconnect} className="btn btn-outline text-sm">
                Disconnect
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="container py-6 mt-6">
        {networkError && (
          <div className="card p-4 mb-6 border-l-4 border-warning-yellow">
            <div className="flex items-center gap-3">
              <div className="security-notice-icon">⚠</div>
              <div>
                <p className="font-medium text-primary">Network Warning</p>
                <p className="text-sm text-secondary">{networkError}</p>
              </div>
            </div>
          </div>
        )}
        {!hasInbox ? (
          <div className="text-center">
            <div className="card p-8 max-w-md mx-auto">
              <img src={logo} alt="Inbox3 Logo" className="welcome-logo-img" />
              <h2 className="text-2xl font-bold mb-4">Welcome to Inbox3!</h2>
              <p className="text-secondary mb-6">
                Create your decentralized inbox to start receiving secure messages on the Aptos blockchain.
              </p>
              <button onClick={createInbox} disabled={loading} className="btn btn-primary w-full">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="spinner"></div>
                    Creating Inbox...
                  </div>
                ) : (
                  'Create Your Inbox'
                )}
              </button>
            </div>
          </div>
        ) : (
          <>
            {currentView === 'dm' ? (
              <div className="grid-cols-2">
                <div className="animate-fade-in">
                  <div className="flex items-center gap-3 mb-6">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF591B" strokeWidth="2">
                      <path d="M22 2L11 13" />
                      <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                    </svg>
                    <h2 className="text-xl font-semibold">Send Message</h2>
                  </div>
                  <SendMessage contractAddress={CONTRACT_ADDRESS} onMessageSent={handleMessageSent} />
                </div>
                <div className="animate-fade-in">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF591B" strokeWidth="2">
                        <path d="M22 12H16L14 15H10L8 12H2" />
                        <path d="M5.45 5.11L2 12V18A2 2 0 0 0 4 20H20A2 2 0 0 0 22 18V12L18.55 5.11A2 2 0 0 0 16.84 4H7.16A2 2 0 0 0 5.45 5.11Z" />
                      </svg>
                      <h2 className="text-xl font-semibold">Inbox</h2>
                    </div>
                    <button onClick={refreshInbox} className="btn btn-outline text-sm">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M23 4V10H17" />
                        <path d="M1 20V14H7" />
                        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9 9 0 0 1 3.51 15" />
                      </svg>
                      Refresh
                    </button>
                  </div>
                  <Inbox refreshKey={refreshKey} />
                </div>
              </div>
            ) : (
              <div className="animate-fade-in">
                {selectedGroup ? (
                  <GroupChat
                    contractAddress={CONTRACT_ADDRESS}
                    groupAddr={selectedGroup}
                    onBack={() => setSelectedGroup(null)}
                  />
                ) : (
                  <GroupList
                    contractAddress={CONTRACT_ADDRESS}
                    onSelectGroup={setSelectedGroup}
                    onCreateGroup={() => setIsCreateGroupModalOpen(true)}
                  />
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default App
