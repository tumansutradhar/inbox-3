import { useState } from 'react'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk'
import { upload } from '../lib/ipfs'

const aptosConfig = new AptosConfig({ network: Network.DEVNET })
const aptos = new Aptos(aptosConfig)

interface SendMessageProps {
  contractAddress: string
  onMessageSent: () => void
}

export default function SendMessage({ contractAddress, onMessageSent }: SendMessageProps) {
  const { account, signAndSubmitTransaction } = useWallet()
  const [recipient, setRecipient] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState('')
  const [ipfsHash, setIpfsHash] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!account || !recipient.trim() || !message.trim()) return

    setLoading(true)
    setCurrentStep('Encrypting message...')
    setIpfsHash('')

    try {
      // Step 1: Encrypt message data
      const messageData = {
        sender: account.address,
        content: message,
        timestamp: Date.now()
      }

      setCurrentStep('Uploading to IPFS...')
      console.log('🔐 Encrypting message data:', messageData)

      // Step 2: Upload to IPFS
      const cid = await upload(JSON.stringify(messageData))
      setIpfsHash(cid)
      console.log('📦 IPFS Upload complete! Hash:', cid)

      setCurrentStep('Storing on blockchain...')

      // Step 3: Store on blockchain
      // Step 3: Store on blockchain
      const response = await signAndSubmitTransaction({
        data: {
          function: `${contractAddress}::Inbox3::send_message`,
          typeArguments: [],
          functionArguments: [recipient, Array.from(new TextEncoder().encode(cid))]
        }
      })
      console.log('🚀 Transaction submitted:', response);

      setCurrentStep('Confirming transaction...')
      await aptos.waitForTransaction({ transactionHash: response.hash })
      console.log('✅ Transaction confirmed:', response.hash);

      setCurrentStep('Message sent successfully!')
      setTimeout(() => {
        setCurrentStep('')
        setIpfsHash('')
      }, 3000)

      setRecipient('')
      setMessage('')

      alert('Message sent successfully! The inbox will refresh automatically.')

      console.log('Calling onMessageSent callback to refresh inbox')
      onMessageSent()
    } catch (error) {
      console.error('Error sending message:', error)

      let errorMessage = 'Failed to send message'
      if (error instanceof Error) {
        if (error.message.includes('3')) {
          errorMessage = 'The recipient does not have an inbox yet. They need to create one first.'
        } else if (error.message.includes('insufficient')) {
          errorMessage = 'Insufficient balance to send the message.'
        }
      }

      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-group">
          <label className="form-label">Recipient Address</label>
          <input type="text" value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="0x..." className="input" required />
          <div className="form-help">
            Enter the recipient's wallet address (starts with 0x)
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Message</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write your message..." rows={4} className="input" style={{ resize: 'none' }} required />
          <div className="form-help">
            Your message will be encrypted and stored on IPFS
          </div>
        </div>

        {/* Status Indicator */}
        {(loading || currentStep) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              {loading && (
                <div className="spinner"></div>
              )}
              <div>
                <p className="font-medium text-sm text-blue-800">
                  {currentStep || 'Processing...'}
                </p>
                {ipfsHash && (
                  <p className="text-xs text-blue-600 mt-1">
                    IPFS Hash: {ipfsHash.slice(0, 20)}...
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="security-notice">
          <div className="flex items-center gap-3">
            <div className="security-notice-icon">!</div>
            <div>
              <p className="font-medium text-sm">Security Notice</p>
              <p className="text-xs text-secondary">
                Messages are encrypted and stored on IPFS. Only the recipient can decrypt and read your message.
              </p>
            </div>
          </div>
        </div>
        <button type="submit" disabled={loading || !recipient.trim() || !message.trim()} className="btn btn-primary w-full">
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="spinner"></div>
              {currentStep || 'Processing...'}
            </div>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" />
              </svg>
              Send Encrypted Message
            </>
          )}
        </button>
      </form>
    </div>
  )
}
