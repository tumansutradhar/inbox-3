# Security Policy & Architecture

## Threat Model
Inbox3 is a decentralized messaging application. Our threat model assumes:
- **Trustless Network**: The blockchain validator set is decentralized.
- **Public Ledger**: Transaction metadata (sender, recipient, timestamp) is public.
- **Encrypted Content**: Message content is encrypted *before* leaving the client.

## Encryption Implementation
We use `tweetnacl` for all cryptographic operations.

### primitives
- **Asymmetric Encryption**: X25519 key exchange + XSalsa20 stream cipher + Poly1305 MAC (via `nacl.box`).
- **Keys**: Ephemeral keys are generated for each session or derived from the wallet signature (in a full production version). Currently, they are managed via local storage for user convenience in this demo.

### Limitations
1. **Metadata Leakage**: An observer can see *who* is talking to *whom* and *when*, though they cannot see *what* is being said.
2. **Key Management**: Currently, private keys are stored in `localStorage`. If the device is compromised, keys are compromised.
3. **Forward Secrecy**: Not yet implemented. If a long-term key is compromised, past messages could be decrypted.
4. **Group Encryption**: Simplified for MVP. Uses a shared group key (simulated) or individual encryption per recipient (inefficient for large groups).

## Planned Improvements
- **Signal Protocol Integration**: For Double Ratchet forward secrecy.
- **Key Rotation**: Periodic rotation of identity keys.
- **Pinning**: IPFS content pinning is centralized via Pinata for now; moving to a decentralized pinning network (e.g., Filecoin/Crust) is on the roadmap.

## Reporting Vulnerabilities
Please report security issues to soumyadeepsarkar2004@outlook.com.

