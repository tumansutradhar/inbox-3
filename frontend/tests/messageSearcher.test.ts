import { MessageSearcher, type SearchableMessage } from '../src/lib/messageSearcher'

describe('MessageSearcher', () => {
    const data: SearchableMessage[] = [
        { sender: 'alice', content: 'Hello World', timestamp: 1_000, type: 'text' },
        { sender: 'bob', content: 'Audio clip', timestamp: 2_000, type: 'audio' },
        { sender: 'alice', content: 'Another hello', timestamp: 3_000, type: 'text' }
    ]

    const searcher = new MessageSearcher()

    it('filters and sorts messages correctly', () => {
        const results = searcher.search(data, { query: 'hello', messageType: 'text' }, 'newest')
        expect(results).toHaveLength(2)
        expect(results[0].timestamp).toBe(3_000)

        const oldestFirst = searcher.search(data, { query: '', messageType: 'all' }, 'oldest')
        expect(oldestFirst[0].timestamp).toBe(1_000)
    })

    it('calculates statistics accurately', () => {
        const stats = searcher.getStatistics(data)
        expect(stats.total).toBe(3)
        expect(stats.textMessages).toBe(2)
        expect(stats.audioMessages).toBe(1)
        expect(stats.uniqueSenders).toBe(2)
        expect(stats.dateRange?.earliest).toBe(1_000)
    })

    it('groups messages by sender and date', () => {
        const bySender = searcher.groupBySender(data)
        expect(bySender.get('alice')).toHaveLength(2)

        const byDate = searcher.groupByDate(data)
        const dateKeys = Array.from(byDate.keys())
        expect(dateKeys.length).toBeGreaterThan(0)
    })
})
