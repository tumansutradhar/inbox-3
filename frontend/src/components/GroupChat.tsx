import { useState, useEffect, useRef, useMemo } from 'react'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { uploadToPinata, getFromPinata, uploadFile } from '../lib/ipfs'
import { getRealtimeService, type RealtimeMessage } from '../lib/realtime'
import { aptos } from '../config'
import type { ReplyTarget } from '../types/reply'
import EmojiPicker from './EmojiPicker'
import { Button, Card } from './ui'

const textDecoder = new TextDecoder()

const hexToUtf8 = (hex: string): string => {
    let result = ''
    for (let i = 0; i < hex.length; i += 2) {
        const byte = hex.slice(i, i + 2)
        result += String.fromCharCode(parseInt(byte, 16))
    }
    return result
}

const decodeVectorLike = (value: unknown): string => {
    if (!value) return ''
    if (typeof value === 'string') {
        if (value.startsWith('0x')) {
            return hexToUtf8(value.slice(2))
        }
        return value
    }
    if (Array.isArray(value)) {
        return textDecoder.decode(new Uint8Array(value))
    }
    if (value instanceof Uint8Array) {
        return textDecoder.decode(value)
    }
    if (value instanceof ArrayBuffer) {
        return textDecoder.decode(new Uint8Array(value))
    }
    return String(value)
}

const encodeParentIdBytes = (parentId?: string | null): number[] => {
    if (!parentId) return []
    return Array.from(new TextEncoder().encode(parentId))
}

interface GroupChatProps {
    contractAddress: string
    groupAddr: string
    onBack: () => void
}

interface GroupMessage {
    id: string
    sender: string
    content: string
    timestamp: number
    isSelf: boolean
    type?: 'text' | 'audio'
    parentId?: string | null
}

interface RawGroupMessage {
    sender: string
    cid: unknown
    timestamp: string
    parent_id?: unknown
    parentId?: unknown // Legacy field support
}

export default function GroupChat({ contractAddress, groupAddr, onBack }: GroupChatProps) {
    const { account, signAndSubmitTransaction } = useWallet()
    const [messages, setMessages] = useState<GroupMessage[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [sending, setSending] = useState(false)
    const [groupName, setGroupName] = useState('')
    const [isRecording, setIsRecording] = useState(false)
    const [recordingTime, setRecordingTime] = useState(0)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const audioChunksRef = useRef<Blob[]>([])
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const copyToastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
    const [copyStatus, setCopyStatus] = useState<string | null>(null)
    const [audioStatus, setAudioStatus] = useState<'idle' | 'recording' | 'uploading' | 'sent' | 'error'>('idle')
    const [audioError, setAudioError] = useState<string | null>(null)
    const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null)

    useEffect(() => {
        if (!groupAddr || !account) return

        fetchGroupInfo()
        fetchMessages()

        const realtimeService = getRealtimeService(contractAddress)
        const handleRealtimeEvent = (event: RealtimeMessage) => {
            if (event.recipient === groupAddr || event.sender === groupAddr) {
                fetchMessages()
            }
        }

        realtimeService.subscribe(account.address.toString(), handleRealtimeEvent)
        const interval = setInterval(fetchMessages, 5000)

        return () => {
            clearInterval(interval)
            realtimeService.unsubscribe(account.address.toString())
        }
    }, [groupAddr, account, contractAddress])

    useEffect(() => {
        if (isRecording) {
            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => prev + 1)
            }, 1000)
        } else if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
            setRecordingTime(0)
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current)
                timerRef.current = null
            }
        }
    }, [isRecording])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const truncateSnippet = (text: string, maxLength = 80) => {
        if (!text) return ''
        return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text
    }

    const createMessageId = (sender: string, timestampSeconds: number, index: number) => {
        return `group-${sender}-${timestampSeconds}-${index}`
    }

    useEffect(() => {
        return () => {
            if (copyToastTimeout.current) {
                clearTimeout(copyToastTimeout.current)
            }
        }
    }, [])

    const copyToClipboard = (text: string) => {
        if (!navigator?.clipboard) return

        navigator.clipboard
            .writeText(text)
            .then(() => {
                if (copyToastTimeout.current) {
                    clearTimeout(copyToastTimeout.current)
                }
                setCopyStatus('Group address copied')
                copyToastTimeout.current = setTimeout(() => setCopyStatus(null), 2000)
            })
            .catch((error) => {
                console.error('Clipboard write failed:', error)
                setCopyStatus('Failed to copy address')
                copyToastTimeout.current = setTimeout(() => setCopyStatus(null), 2000)
            })
    }

    const fetchGroupInfo = async () => {
        try {
            const response = await aptos.view({
                payload: {
                    function: `${contractAddress}::Inbox3::get_group_info`,
                    functionArguments: [groupAddr]
                }
            })
            setGroupName(response[0] as string)
        } catch (error) {
            console.error('Error fetching group info:', error)
        }
    }

    const fetchMessages = async () => {
        if (!account) return
        try {
            const response = await aptos.view({
                payload: {
                    function: `${contractAddress}::Inbox3::get_group_messages`,
                    functionArguments: [groupAddr]
                }
            })

            // removed local interface definition
            const rawMessages = response[0] as RawGroupMessage[]
            const processedMessages = await Promise.all(
                rawMessages.map(async (msg, index: number) => {
                    let content = 'Loading...'
                    let type: 'text' | 'audio' = 'text'
                    let parentId: string | null = null

                    try {
                        const cidString = decodeVectorLike(msg.cid)

                        const data = await getFromPinata(cidString)
                        content = data.content
                        type = data.type || 'text'
                        const chainParentId = decodeVectorLike(msg.parent_id ?? msg.parentId)
                        parentId = data.parentId ?? (chainParentId || null)

                        if (type === 'audio') {
                            console.log('Audio message found:', content)
                        }
                    } catch (error) {
                        console.error('Error loading message content:', error)
                        content = 'Failed to load message'
                    }

                    const timestampSeconds = parseInt(msg.timestamp)
                    const messageId = createMessageId(msg.sender, timestampSeconds, index)
                    return {
                        id: messageId,
                        sender: msg.sender,
                        content,
                        timestamp: timestampSeconds * 1000,
                        isSelf: msg.sender === account.address?.toString(),
                        type,
                        parentId
                    }
                })
            )

            setMessages(processedMessages)
        } catch (error) {
            console.error('Error fetching messages:', error)
        }
    }

    const startRecording = async () => {
        if (!navigator?.mediaDevices?.getUserMedia) {
            setAudioError('Audio recording is not supported in this browser')
            return
        }

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
            setAudioError(null)

            mediaRecorder.onstart = () => {
                setAudioStatus('recording')
            }

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data)
                }
            }

            mediaRecorder.onstop = async () => {
                const mimeType = mediaRecorder.mimeType || 'audio/webm'
                const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
                audioChunksRef.current = []

                stream.getTracks().forEach(track => track.stop())

                try {
                    setAudioStatus('uploading')
                    await sendAudioMessage(audioBlob)
                    setAudioStatus('sent')
                    setTimeout(() => setAudioStatus('idle'), 2000)
                } catch (error) {
                    console.error('Audio upload failed:', error)
                    setAudioError('Failed to send audio message. Please try again.')
                    setAudioStatus('error')
                }
            }

            mediaRecorder.start()
            setIsRecording(true)
        } catch (error) {
            console.error('Error accessing microphone:', error)
            setAudioError('Could not access microphone. Please allow permission and try again.')
        }
    }

    const stopRecording = () => {
        if (!mediaRecorderRef.current || !isRecording) return

        mediaRecorderRef.current.stop()
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
        setIsRecording(false)
    }

    const sendAudioMessage = async (audioBlob: Blob) => {
        if (!account) throw new Error('Wallet not connected')

        setSending(true)
        try {
            console.log('Uploading audio blob:', audioBlob.type, audioBlob.size)
            const audioCid = await uploadFile(audioBlob)
            console.log('Audio file uploaded to IPFS with CID:', audioCid)

            // Store the direct IPFS URL with metadata
            const audioUrl = `https://gateway.pinata.cloud/ipfs/${audioCid}`
            const messageData = JSON.stringify({
                content: audioUrl,
                type: 'audio',
                sender: account.address.toString(),
                timestamp: Date.now()
            })

            const metadataCid = await uploadToPinata(messageData, account.address.toString(), 'audio', replyTarget?.id)
            console.log('Message metadata CID:', metadataCid, 'Audio URL:', audioUrl)

            const parentBytes = encodeParentIdBytes(replyTarget?.id)
            const response = await signAndSubmitTransaction({
                data: {
                    function: `${contractAddress}::Inbox3::send_group_message`,
                    typeArguments: [],
                    functionArguments: [groupAddr, Array.from(new TextEncoder().encode(metadataCid)), parentBytes]
                }
            })

            await aptos.waitForTransaction({ transactionHash: response.hash })
            await fetchMessages()
            setTimeout(() => scrollToBottom(), 100)
            setReplyTarget(null)
        } finally {
            setSending(false)
        }
    }

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || !account) return

        setSending(true)
        try {
            const cid = await uploadToPinata(newMessage, account.address.toString(), 'text', replyTarget?.id)
            const response = await signAndSubmitTransaction({
                data: {
                    function: `${contractAddress}::Inbox3::send_group_message`,
                    typeArguments: [],
                    functionArguments: [groupAddr, Array.from(new TextEncoder().encode(cid)), encodeParentIdBytes(replyTarget?.id)]
                }
            })

            await aptos.waitForTransaction({ transactionHash: response.hash })
            setNewMessage('')
            await fetchMessages()
            setTimeout(() => scrollToBottom(), 100)
            setReplyTarget(null)
        } catch (error) {
            console.error('Error sending message:', error)
            alert('Failed to send message')
        } finally {
            setSending(false)
        }
    }

    const messageLookup = useMemo(() => {
        const map = new Map<string, GroupMessage>()
        messages.forEach((msg) => map.set(msg.id, msg))
        return map
    }, [messages])

    return (
        <Card className="relative flex flex-col h-[550px] md:h-[600px] lg:h-[650px] overflow-hidden animate-fade-in">
            <div className="p-3 sm:p-5 flex items-center gap-2 sm:gap-3 border-b border-(--border-color) bg-(--bg-card)/80 backdrop-blur-sm">
                <Button
                    onClick={onBack}
                    variant="ghost"
                    size="sm"
                    className="p-2"
                    aria-label="Go back"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                </Button>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-(--text-primary) text-base sm:text-lg truncate">{groupName || 'Loading...'}</h3>
                    <div className="flex items-center gap-2">
                        <p className="text-xs text-(--text-secondary) flex items-center gap-1" title="Group address">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="hidden sm:inline">{groupAddr.slice(0, 6)}...{groupAddr.slice(-4)}</span>
                            <span className="sm:hidden">{groupAddr.slice(0, 4)}...</span>
                        </p>
                        <button
                            onClick={() => copyToClipboard(groupAddr)}
                            className="text-xs text-(--text-secondary) hover:text-(--primary-brand) transition-colors p-1 touch-manipulation"
                            title="Copy Group Address"
                            aria-label="Copy group address"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            {copyStatus && (
                <div className="absolute top-5 right-5 bg-(--bg-card) text-xs text-(--text-primary) px-4 py-2 rounded-full shadow-lg animate-fade-in border border-(--border-color)">
                    ✓ {copyStatus}
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 bg-(--bg-secondary)">
                {messages.map((msg) => {
                    const parentMessage = msg.parentId ? messageLookup.get(msg.parentId) : null
                    const replySnippet = msg.type === 'audio' ? 'Audio message' : msg.content
                    return (
                        <div key={msg.id} className={`flex flex-col ${msg.isSelf ? 'items-end' : 'items-start'} animate-slide-up`}>
                            {parentMessage && (
                                <div className="mb-1 max-w-[80%] rounded-xl px-3 py-2 border border-dashed border-(--border-color) bg-white/70 text-[11px] text-(--text-muted)">
                                    <span className="font-semibold text-(--text-primary)">↩️ replying to {parentMessage.sender.slice(0, 6)}...</span>
                                    <p className="mt-1 text-[11px] text-(--text-secondary)">{truncateSnippet(parentMessage.content)}</p>
                                </div>
                            )}
                            <div className={`rounded-2xl ${msg.isSelf
                                ? 'bg-(--primary-brand) text-white'
                                : 'bg-white text-(--text-primary)'
                                } ${replyTarget?.id === msg.id ? 'ring-2 ring-(--primary-brand)' : ''}`} style={{
                                    border: 'none',
                                    padding: msg.type === 'audio' ? '12px' : '12px 16px',
                                    maxWidth: '85%',
                                    minWidth: msg.type === 'audio' ? 'min(320px, 100%)' : '80px',
                                    boxShadow: msg.isSelf ? '0 2px 12px rgba(0,0,0,0.12)' : '0 2px 12px rgba(0,0,0,0.08)',
                                    borderRadius: msg.isSelf ? '18px 18px 4px 18px' : '18px 18px 18px 4px'
                                }}>
                                {msg.type === 'audio' ? (
                                    <div className="flex flex-col gap-2">
                                        <audio
                                            controls
                                            preload="metadata"
                                            controlsList="nodownload"
                                            onError={(e) => {
                                                console.error('Audio playback error:', e.currentTarget.error, 'URL:', msg.content)
                                            }}
                                            onCanPlay={() => {
                                                console.log('Audio can play:', msg.content)
                                            }}
                                            style={{
                                                width: '100%',
                                                height: '54px',
                                                borderRadius: '12px',
                                                outline: 'none'
                                            }}
                                        >
                                            <source src={msg.content} type="audio/webm" />
                                            <source src={msg.content} type="audio/wav" />
                                            <source src={msg.content} type="audio/mp3" />
                                            Your browser does not support audio playback.
                                        </audio>
                                        <a
                                            href={msg.content}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[10px] opacity-70 hover:opacity-100 underline"
                                        >
                                            Open in new tab
                                        </a>
                                    </div>
                                ) : (
                                    <p className="text-sm leading-relaxed wrap-break-word" style={{ wordBreak: 'break-word', overflowWrap: 'break-word', margin: 0 }}>{msg.content}</p>
                                )}
                            </div>
                            <div className="flex items-center gap-2 mt-1.5 px-2">
                                <span className="text-[11px] text-(--text-muted) opacity-70">
                                    {msg.isSelf ? 'You' : `${msg.sender.slice(0, 6)}...`}
                                </span>
                                <span className="text-[11px] text-(--text-muted) opacity-70">•</span>
                                <span className="text-[11px] text-(--text-muted) opacity-70">
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setReplyTarget({
                                        id: msg.id,
                                        sender: msg.sender,
                                        snippet: replySnippet
                                    })}
                                    className="ml-auto text-[11px] font-semibold text-(--primary-brand) hover:text-(--primary-brand-hover)">
                                    Reply
                                </button>
                            </div>
                        </div>
                    )
                })}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-3 sm:p-4 md:p-6 space-y-2 sm:space-y-3 bg-(--bg-card) border-t border-(--border-color)">
                {replyTarget && (
                    <Card variant="outlined" className="flex flex-col gap-1 p-3 text-[12px]">
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-[11px] text-(--text-muted)">Replying to {replyTarget.sender.slice(0, 6)}...</span>
                            <button
                                type="button"
                                onClick={() => setReplyTarget(null)}
                                className="text-[11px] font-semibold text-(--primary-brand) hover:underline"
                            >
                                Cancel
                            </button>
                        </div>
                        <p className="text-sm text-(--text-primary)" style={{ margin: 0 }}>
                            {truncateSnippet(replyTarget.snippet, 120)}
                        </p>
                    </Card>
                )}
                <form onSubmit={handleSend} className="flex gap-2 sm:gap-3 items-center">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={isRecording ? '🎤 Recording...' : 'Type a message...'}
                            className="w-full bg-(--bg-secondary) rounded-full pl-4 sm:pl-6 pr-12 py-3 sm:py-4 text-(--text-primary) focus:outline-none focus:ring-2 focus:ring-(--primary-brand) transition-all placeholder:text-(--text-muted) border border-(--border-color)"
                            style={{ fontSize: '15px', minHeight: '48px' }}
                            disabled={sending || isRecording}
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            <EmojiPicker
                                onSelect={(emoji) => setNewMessage(prev => prev + emoji)}
                                position="top"
                            />
                        </div>
                    </div>
                    <Button
                        type="button"
                        onClick={isRecording ? stopRecording : startRecording}
                        variant={isRecording ? 'danger' : 'primary'}
                        className={`p-3 sm:p-4 rounded-full ${isRecording ? 'animate-pulse' : ''}`}
                        style={{ minWidth: isRecording ? '90px' : '48px', minHeight: '48px' }}
                        title={isRecording ? 'Stop Recording' : 'Record Voice Message'}
                        disabled={sending}
                    >
                        <svg width="20" height="20" className="sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            {isRecording ? (
                                <rect x="6" y="6" width="12" height="12" rx="2" />
                            ) : (
                                <>
                                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                                    <line x1="12" y1="19" x2="12" y2="23" />
                                    <line x1="8" y1="23" x2="16" y2="23" />
                                </>
                            )}
                        </svg>
                        {isRecording && (
                            <span className="text-xs sm:text-sm font-mono font-bold hidden sm:inline">
                                {formatTime(recordingTime)}
                            </span>
                        )}
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        className="p-3 sm:p-4 rounded-full"
                        style={{ minWidth: '48px', minHeight: '48px' }}
                        disabled={sending || !newMessage.trim() || isRecording}
                        loading={sending}
                    >
                        {!sending && (
                            <svg width="20" height="20" className="sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                            </svg>
                        )}
                    </Button>
                </form>
                {audioStatus !== 'idle' && (
                    <div className="text-xs text-(--text-muted) flex items-center gap-2 px-2">
                        {audioStatus === 'recording' && <span>🎤 Recording... {formatTime(recordingTime)}</span>}
                        {audioStatus === 'uploading' && <span>⬆️ Uploading audio message...</span>}
                        {audioStatus === 'sent' && <span className="text-green-600">✅ Audio sent successfully</span>}
                        {audioStatus === 'error' && <span className="text-red-600">❌ Failed to send audio</span>}
                    </div>
                )}
                {audioError && (
                    <div className="text-xs text-red-600 px-2">❌ {audioError}</div>
                )}
            </div>
        </Card>
    )
}
