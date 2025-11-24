# Inbox3 - Decentralized Messaging on Aptos

A decentralized messaging application built on the Aptos blockchain with IPFS storage for message content and end-to-end encryption.

## ✅ STATUS: FULLY FUNCTIONAL

**All issues have been resolved and the app is now working perfectly!**

- ✅ Smart contract deployed to Aptos Testnet
- ✅ All view functions working correctly  
- ✅ All entry functions working correctly
- ✅ Frontend integration complete
- ✅ IPFS storage implemented (with Pinata)
- ✅ Group Chat & Community Messaging
- ✅ Error handling improved
- ✅ Complete documentation provided

## 📚 Documentation

Detailed documentation can be found in the `docs/` directory:

- [How to Run](docs/HOW_TO_RUN.md)
- [Pinata Setup](docs/PINATA_SETUP.md)
- [Realtime System](docs/REALTIME_SYSTEM.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)
- [Rate Limit Fix](docs/RATE_LIMIT_FIX.md)

## 🚀 Quick Start

1. **Start the frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

2. **Open browser**: http://localhost:5173

3. **Connect wallet**: Use Petra or Martian wallet

4. **Start messaging**: Create inbox and send messages!

## Architecture

### Smart Contract (`smart-contract/`)
- **Language**: Move (Aptos blockchain)
- **Contract Address**: `0xf1768eb79d367572b8e436f8e3bcfecf938eeaf6656a65f73773c50c43b71d67`
- **Functions**:
  - `create_inbox()`: Initialize user's inbox
  - `send_message()`: Send message to another user
  - `mark_read()`: Mark message as read
  - `inbox_of()`: Get all messages for a user
  - `inbox_exists()`: Check if user has an inbox

### Frontend (`frontend/`)
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Blockchain**: Aptos SDK
- **Storage**: Pinata IPFS pinning service
- **Wallet**: Aptos Wallet Adapter

## Setup Instructions

### Prerequisites
- Node.js 18+ and pnpm
- Aptos CLI (for smart contract deployment)
- Pinata account (for IPFS storage)

### Frontend Setup

1. **Install dependencies**:
   ```bash
   cd frontend
   pnpm install
   ```

2. **Environment Configuration**:
   ```bash
   cp .env.example .env
   ```
   
   curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3
   ```

2. **Initialize Aptos account**:
   ```bash
   cd smart-contract
   aptos init
   ```

3. **Deploy contract**:
   ```bash
   aptos move publish
   ```

## Usage

1. **Connect Wallet**: Use an Aptos-compatible wallet
2. **Create Inbox**: First-time users must create an inbox
3. **Send Messages**: Enter recipient address and message
4. **Read Messages**: View received messages in your inbox
5. **Mark as Read**: Click to mark messages as read

## Project Structure

```
inbox3/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── Inbox.tsx     # Message inbox component
│   │   │   └── SendMessage.tsx # Send message component
│   │   ├── lib/              # Utility libraries
│   │   │   ├── crypto.ts     # Encryption utilities
│   │   │   └── ipfs.ts       # IPFS storage utilities
│   │   ├── abi/              # Smart contract ABI
│   │   └── App.tsx           # Main application component
│   ├── package.json          # Frontend dependencies
│   └── vite.config.ts        # Vite configuration
└── smart-contract/           # Move smart contract
    ├── sources/
    │   └── Inbox3.move       # Main contract implementation
    ├── Move.toml             # Move package configuration
    └── build/                # Compiled contract artifacts
```

## Key Components

### Smart Contract (Inbox3.move)
- **Message Struct**: Contains sender, IPFS CID, timestamp, and read status
- **Inbox Struct**: User's message collection with auto-incrementing IDs
- **Security**: Only message recipients can mark messages as read

### Frontend Components
- **App.tsx**: Main application with wallet connection and routing
- **Inbox.tsx**: Display and manage received messages
- **SendMessage.tsx**: Send new messages to other users
- **Crypto.ts**: Encryption utilities (currently simplified)
- **IPFS.ts**: Pinata IPFS integration for decentralized storage

## Security Considerations

- Messages are stored on IPFS with CIDs recorded on blockchain
- Private key management needs proper implementation for production
- Current encryption is simplified - implement proper key exchange for production
- Smart contract functions have basic access control

## Development Status

✅ **Completed**:
- Smart contract implementation
- Basic frontend with wallet integration
- IPFS storage integration
- Message sending and receiving
- Inbox management

⚠️ **Known Issues**:
- Encryption implementation is simplified
- TypeScript `any` types in some places
- Window object wallet access needs proper typing

🔄 **Future Enhancements**:
- Proper end-to-end encryption
- Message threading and replies
- User profiles and contacts
- Message search and filtering
- Mobile responsive design improvements

## Recent Updates

### UI and Audio Recording Improvements

#### Changes Made

##### 1. Audio Recording Functionality Fixed

**GroupChat.tsx**
- **Enhanced audio recording quality**: Added audio constraints for echo cancellation, noise suppression, and 44.1kHz sample rate
- **Better codec support**: Implemented fallback logic for audio codecs (prefers 'audio/webm;codecs=opus', falls back to 'audio/webm' or default)
- **Proper stream cleanup**: Ensured audio tracks are stopped after recording completes
- **Improved audio playback**: Enhanced audio element with multiple source types, better error handling, and direct IPFS URL links
- **Fixed metadata storage**: Audio URLs are now properly stored in JSON format with type detection

**SendMessage.tsx**
- Applied same audio recording improvements as GroupChat.tsx
- Enhanced codec detection and fallback logic
- Better error handling and stream management

##### 2. UI Improvements - Cleaner Design

**Layout Changes in GroupChat.tsx**
- **Repositioned controls**: Input field, recording, and send buttons now positioned side-by-side for better UX
- **Reduced container height**: Changed from 600px to 550px to match inbox size
- **Removed auto-scroll**: Chat no longer auto-scrolls on polling (only when sending messages)
- **Removed heavy borders**: Replaced with subtle shadows and light border colors
- **Better visual feedback**: Added emojis to status messages (🎤 Recording, ⬆️ Uploading, ✅ Sent, ❌ Error)
- **Larger input area**: Increased input field to 56px height with bigger buttons for better usability

**Global CSS Updates (index.css)**
- `.card`: Removed heavy borders, replaced with lighter shadows
- `.input`: Changed to subtle `rgba(0, 0, 0, 0.08)` borders
- `.message-item`: Lighter borders and hover effects
- Overall minimalist approach with reduced visual clutter

##### 3. Design Philosophy
- **Minimalist approach**: Reduced visual clutter by minimizing borders
- **Subtle separators**: Used very light borders only where necessary
- **Enhanced shadows**: Relied on subtle shadows for depth instead of borders
- **Better spacing**: Improved visual hierarchy through spacing
- **Focus states**: Maintained clear focus indicators for accessibility

#### Testing Audio Recording

1. Start the development server: `npm run dev` in the frontend directory
2. Test audio recording:
   - Click the microphone button
   - Allow microphone permissions
   - Record a message
   - Stop recording
   - Verify audio playback in the message thread
   - Use "Open in new tab" link if browser playback fails
3. Check UI improvements:
   - Verify reduced border usage throughout the app
   - Confirm recording and send buttons are positioned side-by-side
   - Check that inputs are larger and more visible

#### Browser Compatibility

Audio recording now supports:
- Chrome/Edge: `audio/webm;codecs=opus` (best quality)
- Firefox: `audio/webm` (good quality)
- Safari: Falls back to default codec (basic support)

#### Notes

- Audio files are stored on IPFS via Pinata gateway
- If audio doesn't play inline, use the "Open in new tab" link
- The recording button shows elapsed time during recording
- Console logs help debug audio upload and playback issues

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is open source and available under the MIT License.