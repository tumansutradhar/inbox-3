import React, { useState, useRef, useEffect } from 'react'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { upload, uploadFile, uploadToPinata } from '../lib/ipfs'
import { aptos } from '../config'
import EmojiPicker from './EmojiPicker'
import FileUpload from './FileUpload'
import GiphyPicker from './GiphyPicker'
import StickerPicker from './StickerPicker'
import { Button, Input, Textarea, Card, Spinner } from './ui'

interface SendMessageProps {
  contractAddress: string
  onMessageSent: () => void
  initialRecipient?: string
}

export default function SendMessage({ contractAddress, onMessageSent, initialRecipient }: SendMessageProps) {
  const { account, signAndSubmitTransaction } = useWallet()
  const [recipient, setRecipient] = useState(initialRecipient ?? '')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState('')
  const [ipfsHash, setIpfsHash] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [showGiphy, setShowGiphy] = useState(false)
  const [showStickers, setShowStickers] = useState(false)
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

  useEffect(() => {
    if (initialRecipient && initialRecipient !== recipient) {
      setRecipient(initialRecipient)
    }
  }, [initialRecipient, recipient])

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
        sender: account.address.toString(),
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
    <Card variant="default" className="p-6 animate-fade-in">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Recipient Address"
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="0x..."
          hint="Enter the recipient's wallet address (starts with 0x)"
          required
        />

        <div className="form-group">
          <label className="block text-sm font-medium text-(--text-primary) mb-1.5">Message</label>
          <div className="flex flex-col gap-2">
            <div className="relative">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your secure message..."
                className="min-h-[100px] pr-20"
                required={!isRecording}
                disabled={isRecording}
              />
              <div className="absolute right-2 top-2 flex gap-1">
                {/* GIF Button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setShowGiphy(!showGiphy)
                      setShowStickers(false)
                    }}
                    className="p-2 rounded-lg hover:bg-(--bg-secondary) text-(--text-muted) hover:text-(--text-primary) transition-colors"
                  >
                    <span className="font-bold text-xs border border-current rounded px-0.5">GIF</span>
                  </button>
                  {showGiphy && (
                    <GiphyPicker
                      onSelect={(url) => {
                        setMessage(prev => prev + `\n![GIF](${url})`)
                        setShowGiphy(false)
                      }}
                      onClose={() => setShowGiphy(false)}
                    />
                  )}
                </div>

                {/* Sticker Button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setShowStickers(!showStickers)
                      setShowGiphy(false)
                    }}
                    className="p-2 rounded-lg hover:bg-(--bg-secondary) text-(--text-muted) hover:text-(--text-primary) transition-colors"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>
                  </button>
                  {showStickers && (
                    <StickerPicker
                      onSelect={(url) => {
                        setMessage(prev => prev + `\n![Sticker](${url})`)
                        setShowStickers(false)
                      }}
                      onClose={() => setShowStickers(false)}
                    />
                  )}
                </div>

                <EmojiPicker
                  onSelect={(emoji) => setMessage(prev => prev + emoji)}
                  position="bottom"
                />
                <FileUpload
                  disabled={loading || isRecording}
                  onFileUploaded={async (url, type, fileName) => {
                    if (type === 'image') {
                      setMessage(prev => prev + `\n[Image: ${fileName}](${url})`)
                    } else {
                      setMessage(prev => prev + `\n[File: ${fileName}](${url})`)
                    }
                  }}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                variant={isRecording ? 'danger' : 'secondary'}
                className={`min-w-[140px] ${isRecording ? 'animate-pulse' : ''}`}
                icon={
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
                }
              >
                {isRecording ? `${formatTime(recordingTime)}` : 'Record Audio'}
              </Button>

              <Button
                type="submit"
                disabled={loading || (!recipient.trim() && !isRecording) || (!message.trim() && !isRecording)}
                loading={loading}
                variant="primary"
                className="flex-1"
                icon={
                  !loading ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 2L11 13" />
                      <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                    </svg>
                  ) : undefined
                }
              >
                {loading ? (currentStep || 'Sending...') : 'Send Message'}
              </Button>
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        {(loading || currentStep) && (
          <Card variant="outlined" className="p-4 border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-900/20">
            <div className="flex items-center gap-3">
              {loading && <Spinner size="sm" />}
              <div>
                <p className="font-medium text-sm text-blue-800 dark:text-blue-300">
                  {currentStep || 'Processing...'}
                </p>
                {ipfsHash && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-mono">
                    IPFS Hash: {ipfsHash.slice(0, 20)}...
                  </p>
                )}
              </div>
            </div>
          </Card>
        )}

        <Card variant="outlined" className="p-4 border-l-4 border-l-orange-500 bg-orange-50 dark:bg-orange-900/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-sm">
              !
            </div>
            <div>
              <p className="font-medium text-sm text-orange-800 dark:text-orange-300">Security Notice</p>
              <p className="text-xs text-orange-600 dark:text-orange-400">
                Messages are encrypted and stored on IPFS. Only the recipient can decrypt and read your message.
              </p>
            </div>
          </div>
        </Card>
      </form>
    </Card>
  )
}
