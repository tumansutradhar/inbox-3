import { useState, useEffect, useRef } from 'react'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk'
import { uploadToPinata, getFromPinata } from '../lib/ipfs'
import { getRealtimeService, type RealtimeMessage } from '../lib/realtime'

const aptosConfig = new AptosConfig({ network: Network.DEVNET })
const aptos = new Aptos(aptosConfig)

interface GroupChatProps {
    contractAddress: string
    groupAddr: string
    onBack: () => void
}

interface GroupMessage {
    sender: string
    content: string
    timestamp: number
    isSelf: boolean
}

export default function GroupChat({ contractAddress, groupAddr, onBack }: GroupChatProps) {
    const { account, signAndSubmitTransaction } = useWallet()
    const [messages, setMessages] = useState<GroupMessage[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [sending, setSending] = useState(false)
    const [groupName, setGroupName] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (groupAddr && account) {
            fetchGroupInfo()
            fetchMessages()

            // Subscribe to realtime service
            const realtimeService = getRealtimeService(contractAddress)
            const handleRealtimeEvent = (event: RealtimeMessage) => {
                // Refresh if message is for this group or from this group
                if (event.recipient === groupAddr || event.sender === groupAddr) {
                    console.log('New group message received, refreshing...')
                    fetchMessages()
                }
            }

            realtimeService.subscribe(account.address.toString(), handleRealtimeEvent)

            // Keep polling as backup
            const interval = setInterval(fetchMessages, 5000)

            return () => {
                clearInterval(interval)
                realtimeService.unsubscribe(account.address.toString())
            }
        }
    }, [groupAddr, account, contractAddress])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
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

            const rawMessages = response[0] as any[]

            const processedMessages = await Promise.all(rawMessages.map(async (msg: any) => {
                let content = 'Loading...'
                try {
                    // Convert vector<u8> to string for CID
                    const cid = String.fromCharCode(...msg.cid)
                    const data = await getFromPinata(cid)
                    content = data.content
                } catch (e) {
                    content = 'Failed to load message'
                }

                return {
                    sender: msg.sender,
                    content,
                    timestamp: parseInt(msg.timestamp) * 1000,
                    isSelf: msg.sender === account.address
                }
            }))

            setMessages(processedMessages)
        } catch (error) {
            console.error('Error fetching messages:', error)
        }
    }

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || !account) return

        setSending(true)
        try {
            // 1. Upload to IPFS
            const cid = await uploadToPinata(newMessage, account.address)

            // 2. Send transaction
            // 2. Send transaction
            const response = await signAndSubmitTransaction({
                data: {
                    function: `${contractAddress}::Inbox3::send_group_message`,
                    typeArguments: [],
                    functionArguments: [groupAddr, Array.from(new TextEncoder().encode(cid))]
                }
            })
            console.log('Message sent:', response)

            await aptos.waitForTransaction({ transactionHash: response.hash })

            setNewMessage('')
            fetchMessages()
        } catch (error) {
            console.error('Error sending message:', error)
            alert('Failed to send message')
        } finally {
            setSending(false)
        }
    }

    return (
        <div className="flex flex-col h-[600px] card p-0 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center gap-3 bg-background-secondary">
                <button onClick={onBack} className="btn btn-sm btn-ghost">
                    ← Back
                </button>
                <div>
                    <h3 className="font-bold">{groupName || 'Loading...'}</h3>
                    <p className="text-xs text-secondary">{groupAddr.slice(0, 8)}...</p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col ${msg.isSelf ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[70%] rounded-2xl p-3 ${msg.isSelf
                            ? 'bg-primary text-white rounded-tr-none'
                            : 'bg-background-secondary text-text-primary rounded-tl-none'
                            }`}>
                            <p className="text-sm">{msg.content}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-1 px-1">
                            <span className="text-[10px] text-secondary">
                                {msg.isSelf ? 'You' : `${msg.sender.slice(0, 6)}...`}
                            </span>
                            <span className="text-[10px] text-secondary">
                                {new Date(msg.timestamp).toLocaleTimeString()}
                            </span>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border bg-background-secondary">
                <form onSubmit={handleSend} className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="input flex-1"
                        disabled={sending}
                    />
                    <button
                        type="submit"
                        className="btn btn-primary px-6"
                        disabled={sending || !newMessage.trim()}
                    >
                        {sending ? '...' : 'Send'}
                    </button>
                </form>
            </div>
        </div>
    )
}
