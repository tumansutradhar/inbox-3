import { useState } from 'react'
import { useWallet } from '@aptos-labs/wallet-adapter-react'

interface JoinGroupModalProps {
    isOpen: boolean
    onClose: () => void
    contractAddress: string
    onGroupJoined: () => void
}

export default function JoinGroupModal({ isOpen, onClose, contractAddress, onGroupJoined }: JoinGroupModalProps) {
    const { signAndSubmitTransaction } = useWallet()
    const [groupAddr, setGroupAddr] = useState('')
    const [loading, setLoading] = useState(false)

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!groupAddr.trim()) return

        setLoading(true)
        try {
            const response = await signAndSubmitTransaction({
                data: {
                    function: `${contractAddress}::Inbox3::join_group`,
                    typeArguments: [],
                    functionArguments: [groupAddr.trim()]
                }
            })
            console.log('Joined group:', response)

            onGroupJoined()
            onClose()
            setGroupAddr('')
        } catch (error) {
            console.error('Error joining group:', error)
            alert('Failed to join group. Please check the address and try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="card w-full max-w-md p-6 animate-fade-in">
                <h2 className="text-xl font-bold mb-4">Join Existing Group</h2>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-secondary mb-1">
                            Group Address
                        </label>
                        <input
                            type="text"
                            value={groupAddr}
                            onChange={(e) => setGroupAddr(e.target.value)}
                            className="input w-full"
                            placeholder="0x..."
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-outline"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Joining...' : 'Join Group'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
