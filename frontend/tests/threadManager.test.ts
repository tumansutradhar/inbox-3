import { ThreadManager } from '../src/lib/threadManager'

describe('ThreadManager', () => {
    let manager: ThreadManager

    beforeEach(() => {
        manager = new ThreadManager()
    })

    it('creates threads and replies correctly', () => {
        const root = manager.addMessage('alice', 'Root message', 1_000)
        const reply = manager.addMessage('bob', 'First reply', 1_001, root.id)
        const nested = manager.addMessage('carol', 'Nested reply', 1_002, reply.id)

        const thread = manager.getThread(root.id)
        expect(thread).not.toBeNull()
        expect(thread?.rootMessage.replyCount).toBe(1)
        expect(thread?.replies.length).toBe(2)

        const replies = manager.getReplies(root.id)
        expect(replies.length).toBe(2)
        expect(replies).toEqual(expect.arrayContaining([reply, nested]))

        const flat = manager.getAllMessagesFlat()
        expect(flat.map(m => m.content)).toEqual(['Root message', 'First reply', 'Nested reply'])
    })

    it('imports messages and rebuilds thread structure', () => {
        const payload = [
            { sender: 'alice', content: 'Root', timestamp: 10 },
            { sender: 'bob', content: 'Reply', timestamp: 11, parentId: 'alice-10' }
        ]

        manager.importMessages(payload)

        const thread = manager.getThread('alice-10')
        expect(thread).not.toBeNull()
        expect(thread?.replies).toHaveLength(1)
    })
})
