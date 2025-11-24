/**
 * Message Search and Filtering System
 * Provides search, filter, and sort functionality for messages
 */

export interface SearchableMessage {
    sender: string;
    content: string;
    timestamp: number;
    type?: 'text' | 'audio';
    parentId?: string;
}

export interface SearchFilters {
    query?: string;
    sender?: string;
    startDate?: number;
    endDate?: number;
    messageType?: 'text' | 'audio' | 'all';
    hasReplies?: boolean;
}

export type SortOrder = 'newest' | 'oldest' | 'sender';

export class MessageSearcher {
    /**
     * Search messages with filters
     */
    search(
        messages: SearchableMessage[],
        filters: SearchFilters,
        sortOrder: SortOrder = 'newest'
    ): SearchableMessage[] {
        let results = [...messages];

        // Text search (case-insensitive)
        if (filters.query && filters.query.trim()) {
            const query = filters.query.toLowerCase().trim();
            results = results.filter(msg =>
                msg.content.toLowerCase().includes(query) ||
                msg.sender.toLowerCase().includes(query)
            );
        }

        // Filter by sender
        if (filters.sender) {
            results = results.filter(msg =>
                msg.sender.toLowerCase() === filters.sender!.toLowerCase()
            );
        }

        // Filter by date range
        if (filters.startDate) {
            results = results.filter(msg => msg.timestamp >= filters.startDate!);
        }
        if (filters.endDate) {
            results = results.filter(msg => msg.timestamp <= filters.endDate!);
        }

        // Filter by message type
        if (filters.messageType && filters.messageType !== 'all') {
            results = results.filter(msg =>
                msg.type === filters.messageType
            );
        }

        // Sort results
        results = this.sortMessages(results, sortOrder);

        return results;
    }

    /**
     * Sort messages by specified order
     */
    private sortMessages(
        messages: SearchableMessage[],
        order: SortOrder
    ): SearchableMessage[] {
        const sorted = [...messages];

        switch (order) {
            case 'newest':
                return sorted.sort((a, b) => b.timestamp - a.timestamp);
            case 'oldest':
                return sorted.sort((a, b) => a.timestamp - b.timestamp);
            case 'sender':
                return sorted.sort((a, b) => {
                    const comparison = a.sender.localeCompare(b.sender);
                    return comparison !== 0 ? comparison : b.timestamp - a.timestamp;
                });
            default:
                return sorted;
        }
    }

    /**
     * Get unique senders from messages
     */
    getUniqueSenders(messages: SearchableMessage[]): string[] {
        const senders = new Set(messages.map(m => m.sender));
        return Array.from(senders).sort();
    }

    /**
     * Get message statistics
     */
    getStatistics(messages: SearchableMessage[]): {
        total: number;
        textMessages: number;
        audioMessages: number;
        uniqueSenders: number;
        dateRange: { earliest: number; latest: number } | null;
    } {
        if (messages.length === 0) {
            return {
                total: 0,
                textMessages: 0,
                audioMessages: 0,
                uniqueSenders: 0,
                dateRange: null
            };
        }

        const timestamps = messages.map(m => m.timestamp);

        return {
            total: messages.length,
            textMessages: messages.filter(m => !m.type || m.type === 'text').length,
            audioMessages: messages.filter(m => m.type === 'audio').length,
            uniqueSenders: this.getUniqueSenders(messages).length,
            dateRange: {
                earliest: Math.min(...timestamps),
                latest: Math.max(...timestamps)
            }
        };
    }

    /**
     * Highlight search terms in content
     */
    highlightMatches(content: string, query: string): string {
        if (!query.trim()) return content;

        const regex = new RegExp(`(${query})`, 'gi');
        return content.replace(regex, '<mark>$1</mark>');
    }

    /**
     * Get messages within a time range
     */
    getMessagesByTimeRange(
        messages: SearchableMessage[],
        range: 'today' | 'week' | 'month' | 'all'
    ): SearchableMessage[] {
        const now = Date.now();
        let startDate: number;

        switch (range) {
            case 'today':
                startDate = now - 24 * 60 * 60 * 1000;
                break;
            case 'week':
                startDate = now - 7 * 24 * 60 * 60 * 1000;
                break;
            case 'month':
                startDate = now - 30 * 24 * 60 * 60 * 1000;
                break;
            case 'all':
            default:
                return messages;
        }

        return messages.filter(m => m.timestamp >= startDate);
    }

    /**
     * Export search results to JSON
     */
    exportResults(messages: SearchableMessage[]): string {
        return JSON.stringify(messages, null, 2);
    }

    /**
     * Get messages grouped by sender
     */
    groupBySender(messages: SearchableMessage[]): Map<string, SearchableMessage[]> {
        const grouped = new Map<string, SearchableMessage[]>();

        messages.forEach(msg => {
            const existing = grouped.get(msg.sender) || [];
            existing.push(msg);
            grouped.set(msg.sender, existing);
        });

        return grouped;
    }

    /**
     * Get messages grouped by date
     */
    groupByDate(messages: SearchableMessage[]): Map<string, SearchableMessage[]> {
        const grouped = new Map<string, SearchableMessage[]>();

        messages.forEach(msg => {
            const date = new Date(msg.timestamp).toLocaleDateString();
            const existing = grouped.get(date) || [];
            existing.push(msg);
            grouped.set(date, existing);
        });

        return grouped;
    }
}

// Singleton instance
export const messageSearcher = new MessageSearcher();
