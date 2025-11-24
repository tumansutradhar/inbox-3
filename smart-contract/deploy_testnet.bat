@echo off
echo 🚀 Deploying Inbox3 Smart Contract to Aptos Testnet...

WHERE aptos >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo ❌ Aptos CLI not found. Please install it first.
    echo See: https://aptos.dev/tools/aptos-cli/install-cli/
    exit /b 1
)

IF NOT EXIST "Move.toml" (
    echo ❌ Move.toml not found. Please run this script from the smart-contract directory.
    exit /b 1
)

echo 📦 Compiling Move contract...
aptos move compile --named-addresses inbox3=default --skip-fetch-latest-git-deps
IF %ERRORLEVEL% NEQ 0 (
    echo ❌ Contract compilation failed!
    exit /b 1
)

echo ✅ Contract compiled successfully!

echo 🌐 Deploying to Aptos Testnet...
echo NOTE: You will be asked to confirm the transaction.
aptos move publish --named-addresses inbox3=default --skip-fetch-latest-git-deps

IF %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Contract deployed successfully!
    echo.
    echo ⚠️  IMPORTANT:
    echo 1. Copy the 'package address' from the output above.
    echo 2. Update 'smart-contract/Move.toml': inbox3 = "YOUR_ADDRESS"
    echo 3. Update 'frontend/src/config.ts': export const CONTRACT_ADDRESS = "YOUR_ADDRESS"
) ELSE (
    echo ❌ Contract deployment failed!
)
