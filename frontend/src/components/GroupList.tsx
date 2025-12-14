import { useState, useEffect } from 'react'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { aptos } from '../config'

interface GroupListProps {
    contractAddress: string
    onSelectGroup: (groupAddr: string) => void
    onCreateGroup: () => void
    onJoinGroup: () => void
    refreshTrigger?: number
}

export default function GroupList({ contractAddress, onSelectGroup, onCreateGroup, onJoinGroup, refreshTrigger }: GroupListProps) {
    const { account } = useWallet()
    const [groups, setGroups] = useState<{ addr: string, name: string }[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (account) {
            fetchGroups()
        }
    }, [account, refreshTrigger])

    const fetchGroups = async () => {
        if (!account) return
        setLoading(true)
        try {
            // 1. Get list of group addresses for user
            const response = await aptos.view({
                payload: {
                    function: `${contractAddress}::Inbox3::get_user_groups`,
                    functionArguments: [account.address.toString()]
                }
            })

            if (!response || !Array.isArray(response) || response.length === 0) {
                setGroups([])
                return
            }

            const groupAddrs = response[0] as string[]

            // 2. Fetch details for each group
            const groupDetails = await Promise.all(groupAddrs.map(async (addr) => {
                try {
                    const details = await aptos.view({
                        payload: {
                            function: `${contractAddress}::Inbox3::get_group_info`,
                            functionArguments: [addr]
                        }
                    })

                    if (!details || !Array.isArray(details) || details.length === 0) {
                        return null
                    }

                    return {
                        addr,
                        name: details[0] as string
                    }
                } catch (e) {
                    console.error(`Failed to fetch info for group ${addr}`, e)
                    return null
                }
            }))

            setGroups(groupDetails.filter(g => g !== null) as { addr: string, name: string }[])
        } catch (error) {
            console.error('Error fetching groups:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="card p-4 h-full">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Your Groups</h3>
                <div className="flex gap-2">
                    <button onClick={onJoinGroup} className="btn btn-sm btn-outline">
                        Join
                    </button>
                    <button onClick={onCreateGroup} className="btn btn-sm btn-primary">
                        + New
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-4">
                    <div className="spinner"></div>
                </div>
            ) : groups.length === 0 ? (
                <div className="text-center py-8 text-secondary">
                    <p>You haven't joined any groups yet.</p>
                    <button onClick={onCreateGroup} className="text-primary hover:underline mt-2 text-sm">
                        Create one now
                    </button>
                </div>
            ) : (
                <div className="space-y-2">
                    {groups.map((group) => (
                        <div
                            key={group.addr}
                            onClick={() => onSelectGroup(group.addr)}
                            className="p-3 rounded-lg border border-border hover:bg-background-hover cursor-pointer transition-colors flex items-center gap-3"
                        >
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                {group.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <p className="font-medium">{group.name}</p>
                                <p className="text-xs text-secondary truncate w-32">
                                    {group.addr.slice(0, 6)}...{group.addr.slice(-4)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
