# Inbox3

Decentralized messaging on the Aptos blockchain with IPFS-backed message storage and a React + Vite frontend. Users connect an Aptos wallet, create an inbox, send messages (stored on IPFS), and read/mark messages on-chain.

## About The Project

Inbox3 solves the need for wallet-to-wallet messaging on Aptos by combining a Move module (on-chain inbox and messages) with a lightweight React app. Messages are stored on IPFS (via Pinata) while metadata and state (sender, CID, read status) live on-chain. Building this involved Move module design, wallet adapter integration, and handling rate limits with a conservative real-time refresh strategy.

## Built With

- React 19, TypeScript, Vite, Tailwind CSS
- Aptos Move (AptosFramework), Aptos CLI, @aptos-labs/ts-sdk
- Wallet adapter: @aptos-labs/wallet-adapter-react (Petra/Martian)
- IPFS pinning: Pinata

## Getting Started

Instructions to set up locally.

### Prerequisites

- Node.js 18+ and pnpm (or npm)
- Aptos CLI (for Move compile/publish)
- Aptos-compatible wallet on DevNet (Petra or Martian)
- Optional: Pinata API key/secret for IPFS pinning

### Installation

1. Clone the repo
   ```bash
   git clone <repo-url>
   cd inbox-3
   ```

2. Install frontend dependencies
   ```bash
   cd frontend
   pnpm install
   ```

3. Set up environment variables
   ```bash
   # create frontend/.env
   VITE_PINATA_API_KEY=your_pinata_api_key
   VITE_PINATA_SECRET_KEY=your_pinata_secret_key
   VITE_PINATA_GATEWAY=gateway.pinata.cloud
   VITE_APTOS_NETWORK=devnet
   VITE_CONTRACT_ADDRESS=0xf1768eb79d367572b8e436f8e3bcfecf938eeaf6656a65f73773c50c43b71d67
   ```

4. Run the application (frontend)
   ```bash
   pnpm dev
   ```
   Open http://localhost:5173 and connect your wallet.

5. Deploy or update the Move contract (optional if you need a new address)
   ```bash
   cd smart-contract
   aptos init              # once, sets profile/account
   aptos move compile
   aptos move publish --profile devnet --assume-yes
   ```
   Update `VITE_CONTRACT_ADDRESS` if the on-chain address changes.

## Usage

- Connect wallet (DevNet) in the UI
- Create inbox (one-time per address)
- Send messages by recipient address (stores CID on-chain; content on IPFS)
- Read and mark messages as read; auto-refresh every 15-45s with immediate refresh after sending

```typescript
// Example: frontend call shape (ts-sdk)
await client.transaction.buildAndSign(
  signer,
  {
    function: `${CONTRACT_ADDRESS}::Inbox3::send_message`,
    typeArguments: [],
    functionArguments: [recipientAddress, cidBytes]
  }
);
```

## Features

- On-chain inbox with entry functions: create_inbox, send_message, mark_read
- View functions: inbox_of, get_message, get_message_count, inbox_exists
- Wallet connect via Aptos Wallet Adapter (Petra/Martian)
- IPFS pinning via Pinata with graceful fallback when keys are absent
- Conservative auto-refresh to avoid Aptos rate limits; manual refresh available
- Notifications and last-updated indicators in the UI

## Roadmap

- [x] Deploy contract to DevNet and wire frontend
- [x] IPFS pinning integration with fallbacks
- [ ] Harden end-to-end encryption and key management
- [ ] WebSocket/push-based real-time when API keys are available
- [ ] Message threading, search, profiles, reactions
- [ ] Mobile responsiveness polish

## Contributing

Contributions are welcome. Fork the repo, create a feature branch, commit, push, and open a pull request. Please open an issue first for significant changes.

## License

Distributed under the MIT License. See LICENSE.md for details.

## Contact

Tuman Sutradhar

- GitHub: [@tumansutradhar](https://github.com/tumansutradhar)
- Email: connect.tuman@gmail.com
- LinkedIn: [Tuman Sutradhar](https://www.linkedin.com/in/tumansutradhar/)

Project Link: [https://github.com/tumansutradhar/inbox-3](https://github.com/tumansutradhar/inbox-3)

## Acknowledgments

- Aptos SDK and wallet adapter
- Pinata IPFS
- Inspiration from common web3 messaging patterns
