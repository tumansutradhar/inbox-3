# How to Run Inbox3 - Complete Guide

## Prerequisites ✅

1. **Node.js** (18+ recommended)
2. **pnpm** package manager
3. **Aptos CLI** for smart contract deployment
4. **Aptos-compatible wallet** (like Petra Wallet)

## Step 1: Install Dependencies

### Install Node.js and pnpm
```bash
# Install Node.js from https://nodejs.org/
# Install pnpm globally
npm install -g pnpm
```

### Install Aptos CLI
```bash
# Windows (PowerShell)
iwr "https://aptos.dev/scripts/install_cli.py" -useb | iex

# Or download from: https://github.com/aptos-labs/aptos-cli-releases/releases
```

## Step 2: Deploy Smart Contract

### 2.1 Navigate to smart contract directory
```bash
cd "d:\CodeHub\inbox3\smart-contract"
```

### 2.2 Fund the account
```bash
aptos account fund-with-faucet --account 0xf1768eb79d367572b8e436f8e3bcfecf938eeaf6656a65f73773c50c43b71d67
```

### 2.3 Compile the contract
```bash
aptos move compile
```

### 2.4 Deploy the contract
```bash
aptos move publish --profile devnet --assume-yes
```

**OR use the deployment script:**
```bash
# Unix/Linux/Mac
./deploy.sh

# Windows (if you have bash)
bash deploy.sh
```

## Step 3: Setup Frontend

### 3.1 Navigate to frontend directory
```bash
cd "d:\CodeHub\inbox3\frontend"
```

### 3.2 Install dependencies
```bash
pnpm install
```

### 3.3 Configure environment (Optional)
```bash
# Copy environment template
copy .env.example .env

# Edit .env and add your Pinata credentials (for IPFS)
# See PINATA_SETUP.md for detailed instructions
```

### 3.4 Start development server
```bash
pnpm dev
```

## Step 4: Setup Wallet

### 4.1 Install Petra Wallet
- Go to Chrome Web Store
- Search for "Petra Aptos Wallet"
- Install the extension

### 4.2 Configure Wallet
1. Create new wallet or import existing
2. **Switch to DevNet network**
3. Fund your wallet from DevNet faucet: https://aptoslabs.com/faucet

## Step 5: Run the Application

### 5.1 Open the app
```bash
# After running `pnpm dev`, open browser to:
http://localhost:5173
```

### 5.2 Connect wallet
1. Click "Connect Wallet"
2. Select Petra Wallet
3. Approve connection

### 5.3 Create inbox
1. Click "Create Inbox" button
2. Approve transaction in wallet
3. Wait for transaction confirmation

### 5.4 Test messaging
1. Try sending a message to another address
2. Check your inbox for received messages

## Quick Start Commands

```bash
# Terminal 1: Deploy Smart Contract
cd "d:\CodeHub\inbox3\smart-contract"
aptos move publish --profile devnet --assume-yes

# Terminal 2: Start Frontend
cd "d:\CodeHub\inbox3\frontend"
pnpm install
pnpm dev

# Browser: Open http://localhost:5173
```

## Troubleshooting

### Contract deployment fails?
```bash
# Check account balance
aptos account list --account 0xf1768eb79d367572b8e436f8e3bcfecf938eeaf6656a65f73773c50c43b71d67

# Fund account if needed
aptos account fund-with-faucet --account 0xf1768eb79d367572b8e436f8e3bcfecf938eeaf6656a65f73773c50c43b71d67
```

### Frontend won't start?
```bash
# Clean install
rm -rf node_modules package-lock.json
pnpm install

# Or try with npm
npm install
npm run dev
```

### Wallet connection issues?
1. Make sure wallet is on **DevNet** (not Mainnet)
2. Clear browser cache
3. Try disconnecting and reconnecting

### "Module not found" error?
- Contract needs to be deployed first
- Check contract address matches in frontend code
- Verify you're on DevNet network

## File Structure
```
inbox3/
├── smart-contract/          # Move smart contract
│   ├── sources/Inbox3.move # Contract code
│   ├── Move.toml           # Package config
│   └── deploy.sh           # Deployment script
├── frontend/               # React frontend
│   ├── src/
│   │   ├── App.tsx         # Main app
│   │   └── components/     # UI components
│   ├── package.json        # Dependencies
│   └── vite.config.ts      # Vite config
└── README.md              # Documentation
```

## Expected Workflow

1. **Deploy contract** → See success message with transaction hash
2. **Start frontend** → See "Local: http://localhost:5173"
3. **Connect wallet** → See your address in top right
4. **Create inbox** → See "Inbox created successfully!"
5. **Send messages** → Test the messaging functionality

## Next Steps

- Configure Pinata for IPFS (see PINATA_SETUP.md)
- Add more users to test messaging
- Deploy to mainnet when ready
- Add additional features

---

**Need help?** Check the troubleshooting files:
- `TROUBLESHOOTING.md` - Detailed error solutions
- `PINATA_SETUP.md` - IPFS setup guide
- `RATE_LIMIT_FIX.md` - Rate limit solutions
