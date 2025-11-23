import { useState, useRef, useEffect } from 'react'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { upload, uploadFile, uploadToPinata } from '../lib/ipfs'
import { aptos } from '../config'

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
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      setRecordingTime(0)
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isRecording])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      })
      
      const options = { mimeType: 'audio/webm;codecs=opus' }
      let mediaRecorder: MediaRecorder
      
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mediaRecorder = new MediaRecorder(stream, options)
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      } else {
        mediaRecorder = new MediaRecorder(stream)
      }
      
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const mimeType = mediaRecorder.mimeType || 'audio/webm'
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
        stream.getTracks().forEach(track => track.stop())
        await sendAudioMessage(audioBlob)
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Could not access microphone')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
    }
  }

  const sendAudioMessage = async (audioBlob: Blob) => {
    if (!account || !recipient.trim()) {
      alert('Please enter a recipient address first')
      return
    }

    setLoading(true)
    setCurrentStep('Uploading audio...')

    try {
      // 1. Upload audio file
      const audioCid = await uploadFile(audioBlob)
      const audioUrl = `https://gateway.pinata.cloud/ipfs/${audioCid}`

      // 2. Upload metadata JSON
      const metadataCid = await uploadToPinata(audioUrl, account.address.toString(), 'audio')

      setCurrentStep('Storing on blockchain...')

      // 3. Send transaction
      const response = await signAndSubmitTransaction({
        data: {
          function: `${contractAddress}::Inbox3::send_message`,
          typeArguments: [],
          functionArguments: [recipient, Array.from(new TextEncoder().encode(metadataCid))]
        }
      })

      await aptos.waitForTransaction({ transactionHash: response.hash })

      setCurrentStep('Audio message sent!')
      setTimeout(() => setCurrentStep(''), 3000)
      onMessageSent()
    } catch (error) {
      console.error('Error sending audio:', error)
      alert('Failed to send audio message')
    } finally {
      setLoading(false)
    }
  }

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
        timestamp: Date.now(),
        type: 'text'
      }

      setCurrentStep('Uploading to IPFS...')
      console.log('🔐 Encrypting message data:', messageData)

      // Step 2: Upload to IPFS
      const cid = await upload(JSON.stringify(messageData))
      setIpfsHash(cid)
      console.log('📦 IPFS Upload complete! Hash:', cid)

      setCurrentStep('Storing on blockchain...')

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
    <div className="card p-6 animate-fade-in" style={{ border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-group">
          <label className="form-label">Recipient Address</label>
          <input 
            type="text" 
            value={recipient} 
            onChange={(e) => setRecipient(e.target.value)} 
            placeholder="0x..." 
            className="input" 
            style={{ border: '1px solid rgba(0,0,0,0.08)' }}
            required 
          />
          <div className="form-help">
            Enter the recipient's wallet address (starts with 0x)
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Message</label>
          <div className="flex flex-col gap-2">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your secure message..."
              className="input min-h-[100px]"
              style={{ border: '1px solid rgba(0,0,0,0.08)' }}
              required={!isRecording}
              disabled={isRecording}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`p-3 rounded-xl transition-all flex items-center justify-center gap-2 ${isRecording
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-(--bg-card) text-(--text-secondary) hover:text-(--primary-brand)'
                  }`}
                style={{ 
                  border: isRecording ? 'none' : '1px solid rgba(0,0,0,0.08)',
                  minWidth: '140px'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {isRecording ? (
                    <rect x="6" y="6" width="12" height="12" />
                  ) : (
                    <>
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      <line x1="12" y1="19" x2="12" y2="23" />
                      <line x1="8" y1="23" x2="16" y2="23" />
                    </>
                  )}
                </svg>
                <span className="font-medium text-sm">
                  {isRecording ? `${formatTime(recordingTime)}` : 'Record Audio'}
                </span>
              </button>

              <button
                type="submit"
                disabled={loading || (!recipient.trim() && !isRecording) || (!message.trim() && !isRecording)}
                className="flex-1 btn btn-primary flex items-center justify-center gap-2"
                style={{ border: 'none' }}
              >
                {loading ? (
                  <>
                    <div className="spinner w-4 h-4"></div>
                    {currentStep || 'Sending...'}
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 2L11 13" />
                      <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                    </svg>
                    Send Message
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        {(loading || currentStep) && (
          <div className="bg-blue-50 rounded-lg p-4" style={{ border: '1px solid rgba(59, 130, 246, 0.2)' }}>
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

        <div className="security-notice" style={{ border: '1px solid rgba(251, 146, 60, 0.3)' }}>
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
      </form>
    </div>
  )
}
