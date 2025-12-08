import { useState } from 'react'
import { useWallet } from '@aptos-labs/wallet-adapter-react'

interface CreateGroupModalProps {
    isOpen: boolean
    onClose: () => void
    contractAddress: string
    onGroupCreated: () => void
}

export default function CreateGroupModal({ isOpen, onClose, contractAddress, onGroupCreated }: CreateGroupModalProps) {
    const { signAndSubmitTransaction } = useWallet()
    const [groupName, setGroupName] = useState('')
    const [loading, setLoading] = useState(false)

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!groupName.trim()) return

        setLoading(true)
        try {
            const response = await signAndSubmitTransaction({
                data: {
                    function: `${contractAddress}::Inbox3::create_group`,
                    typeArguments: [],
                    functionArguments: [groupName]
                }
            })
            console.log('Group created:', response)

            onGroupCreated()
            onClose()
            setGroupName('')
        } catch (error) {
            console.error('Error creating group:', error)
            alert('Failed to create group. See console for details.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="card w-full max-w-md p-6 animate-fade-in">
                <h2 className="text-xl font-bold mb-4">Create New Group</h2>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-secondary mb-1">
                            Group Name
                        </label>
                        <input
                            type="text"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            className="input w-full"
                            placeholder="e.g. Crypto Enthusiasts"
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
                            {loading ? 'Creating...' : 'Create Group'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
