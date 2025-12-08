import nacl from 'tweetnacl';

// Helper to convert hex string to Uint8Array
export const hexToBytes = (hex: string): Uint8Array => {
  if (hex.startsWith('0x')) hex = hex.slice(2);
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
};

// Helper to convert Uint8Array to hex string
const bytesToHex = (bytes: Uint8Array): string => {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// Helper to convert Uint8Array to Base64 string
const bytesToBase64 = (bytes: Uint8Array): string => {
  const binary = String.fromCharCode(...bytes);
  return btoa(binary);
};

// Helper to convert Base64 string to Uint8Array
const base64ToBytes = (base64: string): Uint8Array => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

export const encrypt = async (
  senderPrivHex: string,
  recipientPubHex: string,
  plaintext: string
) => {
  const senderSk = hexToBytes(senderPrivHex);
  const recipientPk = hexToBytes(recipientPubHex);
  const { publicKey: senderPk, secretKey } = nacl.box.keyPair.fromSecretKey(senderSk);
  const nonce = nacl.randomBytes(24);

  const messageBytes = new TextEncoder().encode(plaintext);

  const cipher = nacl.box(
    messageBytes,
    nonce,
    recipientPk,
    secretKey
  );

  return {
    cipher: bytesToBase64(cipher),
    nonce: bytesToBase64(nonce),
    senderPk: bytesToHex(senderPk)
  };
};

export const decrypt = (
  recipientPrivHex: string,
  senderPubHex: string,
  cipherB64: string,
  nonceB64: string
) => {
  const recipientSk = hexToBytes(recipientPrivHex);
  const senderPk = hexToBytes(senderPubHex);
  const cipher = base64ToBytes(cipherB64);
  const nonce = base64ToBytes(nonceB64);
  const { secretKey } = nacl.box.keyPair.fromSecretKey(recipientSk);

  const plainBytes = nacl.box.open(cipher, nonce, senderPk, secretKey);
  if (!plainBytes) throw new Error('Decryption failed');

  return new TextDecoder().decode(plainBytes);
};

// --- Key Rotation & Versioning (Stub/Placeholder) ---

/**
 * Rotates the current key pair.
 * In a full implementation, this would:
 * 1. Generate new keys
 * 2. Sign the new public key with the old private key
 * 3. Publish the new signed key to the blockchain
 * 4. Update local storage
 */
export const rotateKey = async (currentPrivHex: string): Promise<{ newPrivHex: string, newPubHex: string, signature: string }> => {
  console.log('🔄 Initiating key rotation for:', currentPrivHex.slice(0, 8) + '...');

  // Simulate key generation
  const newPair = nacl.box.keyPair();
  const newPrivHex = bytesToHex(newPair.secretKey);
  const newPubHex = bytesToHex(newPair.publicKey);

  // Simulate signing (signing the new pubkey with old privkey)
  // This proves ownership of the old key
  // In reality, we'd use nacl.sign here, but for now we mock it
  const signature = 'mock_signature_' + Date.now();

  console.log('✅ Key rotation simulated. New Public Key:', newPubHex);

  return {
    newPrivHex,
    newPubHex,
    signature
  };
};

/**
 * Gets the current version of the key.
 * This helps in supporting multiple key versions for forward secrecy.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getKeyVersion = (pubHex: string): number => {
  // Stub: always return version 1
  return 1;
}

