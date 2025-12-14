# Troubleshooting "Failed to create inbox" Error

## Common Issues and Solutions

### 1. **Contract Not Deployed or Wrong Address**
**Issue**: The contract address in the frontend doesn't match the deployed contract.

**Solution**:
- Check if the smart contract is deployed to DevNet
- Verify the contract address in `frontend/src/App.tsx`
- Redeploy the contract if needed:
  ```bash
  cd smart-contract
  aptos move publish --network devnet
  ```

### 2. **Missing Entry Function Modifier**
**Issue**: Functions need `entry` modifier to be called from frontend.

**Solution**: ✅ **FIXED** - Added `entry` modifier to:
- `create_inbox`
- `send_message` 
- `mark_read`

### 3. **Wallet Connection Issues**
**Issue**: Wallet not properly connected or wrong network.

**Solution**:
- Make sure your wallet is connected to Aptos DevNet
- Check if `account.address` is available
- Try disconnecting and reconnecting wallet

### 4. **Gas/Transaction Issues**
**Issue**: Insufficient gas or transaction simulation fails.

**Solution**:
- Ensure your wallet has sufficient APT tokens for gas
- Check DevNet faucet: https://aptos.dev/tools/aptos-cli-tool/use-aptos-cli#fund-an-account

### 5. **Contract Function Name Issues**
**Issue**: Function name format incorrect.

**Solution**: ✅ **FIXED** - Using correct format:
```typescript
function: `${CONTRACT_ADDRESS}::Inbox3::create_inbox`
```

## Debugging Steps

### Step 1: Check Browser Console
Open browser DevTools (F12) and check console for detailed error messages.

### Step 2: Verify Contract Deployment
```bash
# Check if contract exists
aptos account list --query modules --account YOUR_CONTRACT_ADDRESS
```

### Step 3: Test Contract Functions
```bash
# Test create_inbox function
aptos move run \
  --function-id YOUR_CONTRACT_ADDRESS::Inbox3::create_inbox \
  --profile default
```

### Step 4: Check Network Configuration
Verify you're using the correct network:
- Frontend: DevNet
- Wallet: DevNet
- Contract: Deployed to DevNet

### Step 5: Enhanced Error Logging
The frontend now includes detailed console logging. Check for:
- Account address
- Contract address
- Transaction details
- Specific error messages

## Quick Fix Checklist

1. ✅ **Smart Contract Updated**: Added `entry` modifiers
2. ✅ **Frontend Error Handling**: Enhanced with detailed logging
3. ✅ **Function Names**: Correct format with module namespace
4. ⏳ **Contract Deployment**: Need to redeploy with entry functions
5. ⏳ **Testing**: Test with updated contract

## Next Steps

1. **Redeploy the smart contract** with the entry function fixes:
   ```bash
   cd smart-contract
   aptos move publish --network devnet
   ```

2. **Update the contract address** in `frontend/src/App.tsx` if it changes

3. **Test the application** with enhanced error logging

4. **Check browser console** for detailed error messages

## Common Error Messages and Solutions

| Error Message | Likely Cause | Solution |
|---------------|--------------|----------|
| "Function not found" | Missing entry modifier | Redeploy contract with entry functions |
| "Insufficient gas" | Not enough APT tokens | Get tokens from DevNet faucet |
| "Account not found" | Wrong network | Switch wallet to DevNet |
| "Module not found" | Contract not deployed | Deploy contract to DevNet |
| "Simulation failed" | Contract logic error | Check contract code and parameters |

## Contact Support

If issues persist after following these steps, please provide:
1. Browser console error messages
2. Wallet network configuration
3. Contract deployment status
4. Transaction hash (if any)
