import { useState } from 'react';
import { messageSearcher, type SearchFilters, type SearchableMessage, type SortOrder } from '../lib/messageSearcher';

interface MessageSearchProps {
    messages: SearchableMessage[];
    onSelectMessage?: (message: SearchableMessage) => void;
}

export default function MessageSearch({ messages, onSelectMessage }: MessageSearchProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSender, setSelectedSender] = useState('');
    const [messageType, setMessageType] = useState<'all' | 'text' | 'audio'>('all');
    const [timeRange, setTimeRange] = useState<'all' | 'today' | 'week' | 'month'>('all');
    const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
    const [showFilters, setShowFilters] = useState(false);

    const uniqueSenders = messageSearcher.getUniqueSenders(messages);

    // Apply filters
    const filters: SearchFilters = {
        query: searchQuery,
        sender: selectedSender || undefined,
        messageType,
    };

    let filteredMessages = messageSearcher.search(messages, filters, sortOrder);

    // Apply time range filter
    filteredMessages = messageSearcher.getMessagesByTimeRange(filteredMessages, timeRange);

    const stats = messageSearcher.getStatistics(filteredMessages);

    const handleExport = () => {
        const json = messageSearcher.exportResults(filteredMessages);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inbox3-messages-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedSender('');
        setMessageType('all');
        setTimeRange('all');
        setSortOrder('newest');
    };

    return (
        <div className="max-w-5xl mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Search Messages</h2>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
            </div>

            {/* Search Bar */}
            <div className="mb-4">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search messages by content or sender..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-semibold mb-4">Filters</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Sender Filter */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Sender</label>
                            <select
                                value={selectedSender}
                                onChange={(e) => setSelectedSender(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Senders</option>
                                {uniqueSenders.map((sender) => (
                                    <option key={sender} value={sender}>
                                        {sender.slice(0, 8)}...{sender.slice(-6)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Message Type Filter */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Message Type</label>
                            <select
                                value={messageType}
                                onChange={(e) => setMessageType(e.target.value as 'all' | 'text' | 'audio')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Types</option>
                                <option value="text">Text Only</option>
                                <option value="audio">Audio Only</option>
                            </select>
                        </div>

                        {/* Time Range Filter */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Time Range</label>
                            <select
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value as 'all' | 'today' | 'week' | 'month')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Time</option>
                                <option value="today">Last 24 Hours</option>
                                <option value="week">Last Week</option>
                                <option value="month">Last Month</option>
                            </select>
                        </div>

                        {/* Sort Order */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Sort By</label>
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="sender">By Sender</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                        >
                            Clear Filters
                        </button>
                        <button
                            onClick={handleExport}
                            disabled={filteredMessages.length === 0}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Export Results ({filteredMessages.length})
                        </button>
                    </div>
                </div>
            )}

            {/* Statistics */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                        <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
                        <div className="text-sm text-blue-700">Total Messages</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-blue-900">{stats.textMessages}</div>
                        <div className="text-sm text-blue-700">Text Messages</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-blue-900">{stats.audioMessages}</div>
                        <div className="text-sm text-blue-700">Audio Messages</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-blue-900">{stats.uniqueSenders}</div>
                        <div className="text-sm text-blue-700">Unique Senders</div>
                    </div>
                </div>
            </div>

            {/* Results */}
            {filteredMessages.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    No messages found matching your search criteria
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredMessages.map((message, index) => (
                        <div
                            key={`${message.sender}-${message.timestamp}-${index}`}
                            onClick={() => onSelectMessage?.(message)}
                            className={`p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition ${onSelectMessage ? 'cursor-pointer' : ''
                                }`}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-700">
                                        {message.sender.slice(0, 8)}...{message.sender.slice(-6)}
                                    </span>
                                    {message.type === 'audio' && (
                                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                                            🎤 Audio
                                        </span>
                                    )}
                                    {message.parentId && (
                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                            ↩️ Reply
                                        </span>
                                    )}
                                </div>
                                <span className="text-xs text-gray-500">
                                    {new Date(message.timestamp).toLocaleString()}
                                </span>
                            </div>

                            <div className="text-gray-900">
                                {message.type === 'audio' ? (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <span>🔊</span>
                                        <span>Audio message</span>
                                    </div>
                                ) : (
                                    <p className="text-sm wrap-break-word">{message.content}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-6 text-center text-sm text-gray-500">
                Showing {filteredMessages.length} of {messages.length} messages
            </div>
        </div>
    );
}
