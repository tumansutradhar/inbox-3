import nacl from 'tweetnacl';

/**
 * Enhanced Encryption Manager with proper key management
 * Uses NaCl (TweetNaCl) for secure end-to-end encryption
 */

const STORAGE_KEY_PREFIX = 'inbox3_key_';

// Helper functions
const hexToBytes = (hex: string): Uint8Array => {
    if (hex.startsWith('0x')) hex = hex.slice(2);
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return bytes;
};

const bytesToHex = (bytes: Uint8Array): string => {
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
};

const bytesToBase64 = (bytes: Uint8Array): string => {
    return btoa(String.fromCharCode(...bytes));
};

const base64ToBytes = (base64: string): Uint8Array => {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
};

export interface EncryptedMessage {
    cipher: string;
    nonce: string;
    senderPk: string;
}

export class EncryptionManager {
    private keyPair: nacl.BoxKeyPair | null = null;

    /**
     * Generate or load encryption key pair for the user
     */
    async initializeKeys(userAddress: string): Promise<void> {
        const storageKey = `${STORAGE_KEY_PREFIX}${userAddress}`;

        try {
            // Try to load existing keys
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                const { publicKey, secretKey } = JSON.parse(stored);
                this.keyPair = {
                    publicKey: base64ToBytes(publicKey),
                    secretKey: base64ToBytes(secretKey)
                };
                console.log('✓ Loaded existing encryption keys');
                return;
            }
        } catch (error) {
            console.warn('Could not load existing keys:', error);
        }

        // Generate new keys
        this.keyPair = nacl.box.keyPair();

        // Store keys securely
        try {
            const toStore = {
                publicKey: bytesToBase64(this.keyPair.publicKey),
                secretKey: bytesToBase64(this.keyPair.secretKey)
            };
            localStorage.setItem(storageKey, JSON.stringify(toStore));
            console.log('✓ Generated and stored new encryption keys');
        } catch (error) {
            console.error('Failed to store keys:', error);
        }
    }

    /**
     * Get public key in hex format for sharing
     */
    getPublicKeyHex(): string {
        if (!this.keyPair) throw new Error('Keys not initialized');
        return bytesToHex(this.keyPair.publicKey);
    }

    /**
     * Encrypt a message for a recipient
     */
    encrypt(recipientPublicKeyHex: string, plaintext: string): EncryptedMessage {
        if (!this.keyPair) throw new Error('Keys not initialized');

        const recipientPk = hexToBytes(recipientPublicKeyHex);
        const nonce = nacl.randomBytes(24);
        const messageBytes = new TextEncoder().encode(plaintext)

        const cipher = nacl.box(
            new Uint8Array(messageBytes),
            new Uint8Array(nonce),
            new Uint8Array(recipientPk),
            new Uint8Array(this.keyPair.secretKey)
        );

        return {
            cipher: bytesToBase64(cipher),
            nonce: bytesToBase64(nonce),
            senderPk: bytesToHex(this.keyPair.publicKey)
        };
    }

    /**
     * Decrypt a message from a sender
     */
    decrypt(senderPublicKeyHex: string, encrypted: EncryptedMessage): string {
        if (!this.keyPair) throw new Error('Keys not initialized');

        const senderPk = hexToBytes(senderPublicKeyHex);
        const cipher = base64ToBytes(encrypted.cipher);
        const nonce = base64ToBytes(encrypted.nonce);

        const plainBytes = nacl.box.open(
            cipher,
            nonce,
            senderPk,
            this.keyPair.secretKey
        );

        if (!plainBytes) throw new Error('Decryption failed');
        return new TextDecoder().decode(plainBytes);
    }

    /**
     * Clear stored keys (logout)
     */
    clearKeys(userAddress: string): void {
        const storageKey = `${STORAGE_KEY_PREFIX}${userAddress}`;
        localStorage.removeItem(storageKey);
        this.keyPair = null;
        console.log('✓ Cleared encryption keys');
    }
}

// Singleton instance
export const encryptionManager = new EncryptionManager();
