#!/bin/bash

# Aptos Smart Contract Deployment Script

echo "🚀 Deploying Inbox3 Smart Contract to Aptos..."

# Check if aptos CLI is installed
if ! command -v aptos &> /dev/null; then
    echo "❌ Aptos CLI not found. Please install it first:"
    echo "curl -fsSL 'https://aptos.dev/scripts/install_cli.py' | python3"
    exit 1
fi

# Check if Move.toml exists
if [ ! -f "Move.toml" ]; then
    echo "❌ Move.toml not found. Please run this script from the smart-contract directory."
    exit 1
fi

# Compile the contract
echo "📦 Compiling Move contract..."
aptos move compile

if [ $? -ne 0 ]; then
    echo "❌ Contract compilation failed!"
    exit 1
fi

echo "✅ Contract compiled successfully!"

# Deploy to testnet
echo "🌐 Deploying to Aptos Testnet..."
aptos move publish --named-addresses inbox3=default --network testnet

if [ $? -eq 0 ]; then
    echo "✅ Contract deployed successfully!"
    echo "📝 IMPORTANT: Update CONTRACT_ADDRESS in frontend/src/config.ts and inbox3 address in Move.toml with your new address!"
else
    echo "❌ Contract deployment failed!"
    exit 1
fi
