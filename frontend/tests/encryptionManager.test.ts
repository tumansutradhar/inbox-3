import { EncryptionManager } from '../src/lib/encryptionManager'

describe('EncryptionManager', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    it('initializes keys and allows encryption/decryption', async () => {
        const alice = new EncryptionManager()
        const bob = new EncryptionManager()

        await alice.initializeKeys('0xAlice')
        await bob.initializeKeys('0xBob')

        const message = 'Testing vitest encryption'
        const encrypted = alice.encrypt(bob.getPublicKeyHex(), message)

        expect(typeof encrypted.cipher).toBe('string')
        expect(typeof encrypted.nonce).toBe('string')
        expect(encrypted.senderPk).toBe(alice.getPublicKeyHex())

        const decrypted = bob.decrypt(alice.getPublicKeyHex(), encrypted)
        expect(decrypted).toBe(message)
    })

    it('persists and clears keys from localStorage', async () => {
        const address = '0xTest'
        const manager = new EncryptionManager()
        await manager.initializeKeys(address)

        const stored = localStorage.getItem(`inbox3_key_${address}`)
        expect(stored).not.toBeNull()

        manager.clearKeys(address)
        expect(localStorage.getItem(`inbox3_key_${address}`)).toBeNull()
    })
})
