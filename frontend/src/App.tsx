import { useState, useEffect, useCallback, useMemo } from 'react'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import SendMessage from './components/SendMessage'
import Inbox, { type ProcessedMessage } from './components/Inbox'
import MessageSearch from './components/MessageSearch'
import ProfileEditor from './components/ProfileEditor'
import ContactsList from './components/ContactsList'
import NotificationSystem from './components/NotificationSystem'
import GroupList from './components/GroupList'
import GroupChat from './components/GroupChat'
import CreateGroupModal from './components/CreateGroupModal'
import JoinGroupModal from './components/JoinGroupModal'
import WalletModal from './components/WalletModal'
import { getRealtimeService, type RealtimeMessage } from './lib/realtime'
import { useNotifications } from './lib/notifications'
import { type SearchableMessage } from './lib/messageSearcher'
import { aptos, CONTRACT_ADDRESS, NETWORK } from './config'
import './App.css'

type AppView = 'dm' | 'groups'
type ActiveTool = 'profile' | 'contacts' | 'search' | 'none'

function App() {
  const { account, connected, connect, disconnect, wallets, signAndSubmitTransaction, network } = useWallet()
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
  const [isJoinGroupModalOpen, setIsJoinGroupModalOpen] = useState(false)
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const [walletModalMode, setWalletModalMode] = useState<'wallet' | 'social'>('wallet')
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    }
    return false
  })
  const [groupsRefreshKey, setGroupsRefreshKey] = useState(0)
  const [activeTool, setActiveTool] = useState<ActiveTool>('profile')
  const [loadedMessages, setLoadedMessages] = useState<ProcessedMessage[]>([])
  const [selectedRecipient, setSelectedRecipient] = useState('')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
    localStorage.setItem('theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  const toggleDarkMode = () => setDarkMode(!darkMode)

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

  const handleMessageSentAndReset = useCallback(() => {
    handleMessageSent()
    setSelectedRecipient('')
  }, [handleMessageSent])

  useEffect(() => {
    const checkNetwork = async () => {
      if (connected && network) {
        // Normalize network names for comparison
        const currentNetwork = network.name.toLowerCase()
        const requiredNetwork = NETWORK.toLowerCase()

        if (currentNetwork !== requiredNetwork) {
          setNetworkError(`⚠️ Wrong Network! You are on ${network.name}. Please switch your wallet to ${NETWORK}.`)
        } else {
          setNetworkError(null)
        }
      }
    }

    checkNetwork()
  }, [connected, network])

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
      if (response && Array.isArray(response) && response.length > 0) {
        setHasInbox(response[0] as boolean)
      } else {
        setHasInbox(false)
      }
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

  const handleSelectContact = useCallback((address: string) => {
    setSelectedRecipient(address)
    setActiveTool('none')
    setCurrentView('dm')
  }, [])

  useEffect(() => {
    if (!hasInbox) {
      setLoadedMessages([])
    }
  }, [hasInbox])

  const toolTabs: Array<{ id: ActiveTool; label: string }> = [
    { id: 'profile', label: 'Profile' },
    { id: 'contacts', label: 'Contacts' },
    { id: 'search', label: 'Search' },
    { id: 'none', label: 'Hide Tools' }
  ]

  const renderToolContent = () => {
    switch (activeTool) {
      case 'profile':
        return <ProfileEditor />
      case 'contacts':
        return <ContactsList onSelectContact={handleSelectContact} />
      case 'search':
        return <MessageSearch messages={searchableMessages} />
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-sm text-(--text-secondary)">
            <p>Select a tool above to continue.</p>
            <p className="text-xs mt-1 text-(--text-muted)">Profiles, contacts, and search are just a tap away.</p>
          </div>
        )
    }
  }

  const searchableMessages = useMemo<SearchableMessage[]>(() => {
    return loadedMessages.map((msg) => ({
      sender: msg.sender,
      content: msg.plain,
      timestamp: msg.timestamp ? msg.timestamp * 1000 : Date.now(),
      type: msg.type === 'audio' ? 'audio' : 'text',
      parentId: undefined
    }))
  }, [loadedMessages])

  if (!connected) {
    const filteredWallets = wallets.filter(w => {
      const isSocial = w.name.toLowerCase().includes('google') ||
        w.name.toLowerCase().includes('apple') ||
        w.name.toLowerCase().includes('keyless')
      return walletModalMode === 'social' ? isSocial : !isSocial
    })

    return (
      <div className="hero-container">
        <WalletModal
          isOpen={isWalletModalOpen}
          onClose={() => setIsWalletModalOpen(false)}
          wallets={filteredWallets}
          onConnect={connect}
          title={walletModalMode === 'social' ? 'Sign in with Social' : 'Connect Wallet'}
        />

        <div className="absolute top-6 right-6 z-50">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-(--bg-card) border border-(--border-color) text-(--text-primary) hover:bg-(--bg-secondary) transition-colors shadow-sm"
            title="Toggle Dark Mode"
          >
            {darkMode ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>

        <div className="hero-left">
          <div className="login-card">
            <div className="mb-8">
              <img src="/logo.png" alt="Inbox3 Logo" className="w-16 mb-4" />
              <h1 className="text-3xl font-bold text-(--text-primary) mb-2">Welcome Back</h1>
              <p className="text-(--text-secondary)">Sign in to continue to your secure inbox</p>
            </div>

            <div className="space-y-4 mb-6">
              <button
                onClick={() => {
                  setWalletModalMode('wallet')
                  setIsWalletModalOpen(true)
                }}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-(--primary-brand) text-white rounded-xl hover:bg-(--primary-brand-hover) hover:shadow-lg hover:-translate-y-0.5 transition-all font-bold text-lg shadow-md"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 7h-9" />
                  <path d="M14 17H5" />
                  <circle cx="17" cy="17" r="3" />
                  <circle cx="7" cy="7" r="3" />
                </svg>
                Connect Wallet
              </button>

              <button
                onClick={() => {
                  setWalletModalMode('social')
                  setIsWalletModalOpen(true)
                }}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-(--bg-card) border border-(--border-color) rounded-xl hover:bg-(--bg-secondary) transition-all text-(--text-primary) font-medium"
              >
                Sign in with other options
              </button>
            </div>

            <div className="mt-8 text-center">
              <p className="text-xs text-(--text-muted)">
                By connecting, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>

        <div className="hero-right bg-linear-to-br from-(--bg-main) to-(--primary-brand-light)">
          <div className="hero-branding">
            <h2 className="hero-title text-(--text-primary)">
              Secure Messaging<br />
              <span className="text-(--primary-brand)">Reimagined</span>
            </h2>
            <p className="hero-subtitle text-(--text-secondary)">
              Experience the future of communication with end-to-end encryption,
              decentralized storage, and instant delivery on the Aptos blockchain.
            </p>

            <div className="feature-grid-hero">
              <div className="feature-card-hero">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7v10c0 5.55 3.84 10 9 10s9-4.45 9-10V7L12 2z" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2 text-(--text-primary)">Secure</h3>
                <p className="text-sm text-(--text-secondary)">End-to-end encrypted messages ensuring your privacy.</p>
              </div>
              <div className="feature-card-hero">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4 text-green-600 dark:text-green-400">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2 text-(--text-primary)">Fast</h3>
                <p className="text-sm text-(--text-secondary)">Lightning-fast transactions on the Aptos network.</p>
              </div>
              <div className="feature-card-hero">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4 text-purple-600 dark:text-purple-400">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2 text-(--text-primary)">Real-time</h3>
                <p className="text-sm text-(--text-secondary)">Instant message delivery and status updates.</p>
              </div>
              <div className="feature-card-hero">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-4 text-orange-500">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2 text-(--text-primary)">Web3 Native</h3>
                <p className="text-sm text-(--text-secondary)">Fully decentralized and trustless architecture.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app-container">
      <NotificationSystem notifications={notifications} onDismiss={dismissNotification} />
      <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        onClose={() => setIsCreateGroupModalOpen(false)}
        contractAddress={CONTRACT_ADDRESS}
        onGroupCreated={() => {
          setGroupsRefreshKey(prev => prev + 1)
        }}
      />
      <JoinGroupModal
        isOpen={isJoinGroupModalOpen}
        onClose={() => setIsJoinGroupModalOpen(false)}
        contractAddress={CONTRACT_ADDRESS}
        onGroupJoined={() => {
          setGroupsRefreshKey(prev => prev + 1)
        }}
      />

      <header className="header bg-(--bg-card) border-b border-(--border-color)">
        <div className="container">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Inbox3 Logo" className="w-8" />
              <div>
                <h1 className="font-bold text-lg text-(--text-primary)">Inbox3</h1>
              </div>
            </div>

            {/* View Switcher */}
            <div className="flex bg-(--bg-secondary) rounded-lg p-1 gap-1">
              <button
                onClick={() => setCurrentView('dm')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${currentView === 'dm' ? 'bg-(--bg-card) text-(--primary-brand) shadow-sm' : 'text-(--text-secondary) hover:text-(--text-primary)'
                  }`}
              >
                Direct Messages
              </button>
              <button
                onClick={() => setCurrentView('groups')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${currentView === 'groups' ? 'bg-(--bg-card) text-(--primary-brand) shadow-sm' : 'text-(--text-secondary) hover:text-(--text-primary)'
                  }`}
              >
                Groups
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 desktop-only">
                <div className="w-2 h-2 rounded-full bg-(--success-green)"></div>
                <span className="text-sm text-(--text-secondary)">Connected</span>
              </div>
              <span className="text-sm text-(--text-secondary) font-mono bg-(--bg-secondary) px-2 py-1 rounded">
                {account?.address?.toString()?.slice(0, 6)}...{account?.address?.toString()?.slice(-4)}
              </span>

              <button
                onClick={() => setRealtimeEnabled(prev => !prev)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${realtimeEnabled
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-(--bg-card) text-(--text-secondary) border-(--border-color) hover:text-(--text-primary)'
                  }`}
                title="Toggle real-time updates"
              >
                {realtimeEnabled ? 'Realtime: ON' : 'Realtime: OFF'}
              </button>

              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full text-(--text-secondary) hover:bg-(--bg-secondary) hover:text-(--text-primary) transition-colors"
              >
                {darkMode ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                )}
              </button>

              <button onClick={disconnect} className="btn btn-outline text-sm py-1.5 px-3">
                Disconnect
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="main-content-centered">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
          <section className="space-y-6">
            {networkError && (
              <div className="card p-4 mb-6 border-l-4 border-warning-yellow bg-warning-yellow/10">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">⚠️</div>
                  <div>
                    <p className="font-bold text-text-primary">Network Mismatch</p>
                    <p className="text-sm text-text-primary">{networkError}</p>
                  </div>
                </div>
              </div>
            )}
            {!hasInbox ? (
              <div className="text-center">
                <div className="card p-8 max-w-md mx-auto">
                  <img src="/logo.png" alt="Inbox3 Logo" className="welcome-logo-img" />
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
                  <div className="centered-grid">
                    <div className="animate-fade-in">
                      <div className="flex items-center gap-3 mb-6">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF591B" strokeWidth="2">
                          <path d="M22 2L11 13" />
                          <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                        </svg>
                        <h2 className="text-xl font-semibold">Send Message</h2>
                      </div>
                      <SendMessage
                        contractAddress={CONTRACT_ADDRESS}
                        onMessageSent={handleMessageSentAndReset}
                        initialRecipient={selectedRecipient}
                      />
                    </div>
                    <div className="animate-fade-in">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold">Inbox</h2>
                        <button onClick={refreshInbox} className="btn btn-outline text-sm">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M23 4V10H17" />
                            <path d="M1 20V14H7" />
                            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9 9 0 0 1 3.51 15" />
                          </svg>
                          Refresh
                        </button>
                      </div>
                      <Inbox refreshKey={refreshKey} onMessages={setLoadedMessages} />
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
                        onJoinGroup={() => setIsJoinGroupModalOpen(true)}
                        refreshTrigger={groupsRefreshKey}
                      />
                    )}
                  </div>
                )}
              </>
            )}
          </section>
          <aside className="bg-(--bg-card) border border-(--border-color) rounded-3xl p-5 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
            <div className="flex flex-wrap gap-2 mb-4">
              {toolTabs.map((tool) => (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => setActiveTool(tool.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${activeTool === tool.id
                      ? 'bg-(--primary-brand) text-white border-transparent'
                      : 'bg-(--bg-secondary) text-(--text-secondary) border-(--border-color) hover:text-(--text-primary)'
                    }`}
                  aria-pressed={activeTool === tool.id}
                >
                  {tool.label}
                </button>
              ))}
            </div>
            <div className="min-h-80 max-h-[70vh] overflow-y-auto">
              {renderToolContent()}
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}

export default App
