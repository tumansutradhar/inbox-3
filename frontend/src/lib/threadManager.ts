/**
 * Message Threading and Replies System
 * Handles reply-to functionality and thread visualization
 */

export interface ThreadedMessage {
    id: string;
    sender: string;
    content: string;
    timestamp: number;
    parentId?: string; // ID of the message being replied to
    replyCount: number;
    type?: 'text' | 'audio';
}

export interface MessageThread {
    rootMessage: ThreadedMessage;
    replies: ThreadedMessage[];
}

export class ThreadManager {
    private threads: Map<string, MessageThread> = new Map();

    /**
     * Generate a unique message ID
     */
    private generateId(sender: string, timestamp: number): string {
        return `${sender}-${timestamp}`;
    }

    /**
     * Add a message to the thread system
     */
    addMessage(
        sender: string,
        content: string,
        timestamp: number,
        parentId?: string,
        type?: 'text' | 'audio'
    ): ThreadedMessage {
        const id = this.generateId(sender, timestamp);

        const message: ThreadedMessage = {
            id,
            sender,
            content,
            timestamp,
            parentId,
            replyCount: 0,
            type: type || 'text'
        };

        if (parentId) {
            // This is a reply, add it to the parent's thread
            this.addReplyToThread(parentId, message);
        } else {
            // This is a root message, create a new thread
            this.threads.set(id, {
                rootMessage: message,
                replies: []
            });
        }

        return message;
    }

    /**
     * Add a reply to an existing thread
     */
    private addReplyToThread(parentId: string, reply: ThreadedMessage): void {
        // Find the thread containing this parent message
        for (const thread of this.threads.values()) {
            if (thread.rootMessage.id === parentId) {
                thread.replies.push(reply);
                thread.rootMessage.replyCount++;
                return;
            }

            // Check if the parent is in the replies
            const parentReply = thread.replies.find(r => r.id === parentId);
            if (parentReply) {
                thread.replies.push(reply);
                parentReply.replyCount++;
                return;
            }
        }

        // If parent not found, create orphaned thread
        console.warn(`Parent message ${parentId} not found, creating orphaned thread`);
        this.threads.set(parentId, {
            rootMessage: reply,
            replies: []
        });
    }

    /**
     * Get a thread by root message ID
     */
    getThread(rootId: string): MessageThread | null {
        return this.threads.get(rootId) || null;
    }

    /**
     * Get all threads sorted by most recent activity
     */
    getAllThreads(): MessageThread[] {
        return Array.from(this.threads.values()).sort((a, b) => {
            const aLatest = Math.max(
                a.rootMessage.timestamp,
                ...a.replies.map(r => r.timestamp)
            );
            const bLatest = Math.max(
                b.rootMessage.timestamp,
                ...b.replies.map(r => r.timestamp)
            );
            return bLatest - aLatest;
        });
    }

    /**
     * Get all messages in a flat list (for compatibility)
     */
    getAllMessagesFlat(): ThreadedMessage[] {
        const messages: ThreadedMessage[] = [];

        for (const thread of this.threads.values()) {
            messages.push(thread.rootMessage);
            messages.push(...thread.replies);
        }

        return messages.sort((a, b) => a.timestamp - b.timestamp);
    }

    /**
     * Get replies for a specific message
     */
    getReplies(messageId: string): ThreadedMessage[] {
        for (const thread of this.threads.values()) {
            if (thread.rootMessage.id === messageId) {
                return thread.replies;
            }
        }
        return [];
    }

    /**
     * Get parent message for a reply
     */
    getParentMessage(replyId: string): ThreadedMessage | null {
        for (const thread of this.threads.values()) {
            const reply = thread.replies.find(r => r.id === replyId);
            if (reply && reply.parentId) {
                // Check if parent is root
                if (thread.rootMessage.id === reply.parentId) {
                    return thread.rootMessage;
                }
                // Check if parent is another reply
                return thread.replies.find(r => r.id === reply.parentId) || null;
            }
        }
        return null;
    }

    /**
     * Clear all threads
     */
    clear(): void {
        this.threads.clear();
    }

    /**
     * Import messages and build thread structure
     */
    importMessages(messages: Array<{
        sender: string;
        content: string;
        timestamp: number;
        parentId?: string;
        type?: 'text' | 'audio';
    }>): void {
        this.clear();

        // First pass: add all root messages
        messages
            .filter(m => !m.parentId)
            .forEach(m => this.addMessage(m.sender, m.content, m.timestamp, undefined, m.type));

        // Second pass: add all replies
        messages
            .filter(m => m.parentId)
            .forEach(m => this.addMessage(m.sender, m.content, m.timestamp, m.parentId, m.type));
    }
}

// Singleton instance
export const threadManager = new ThreadManager();
