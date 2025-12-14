# How to Setup Pinata IPFS for Inbox3

## 🌟 Why Pinata?

Pinata is a popular IPFS pinning service that offers:
- ✅ **Reliable IPFS storage** with global CDN
- ✅ **Free tier** with 1GB storage and 100GB bandwidth
- ✅ **Easy API** with better performance than some alternatives
- ✅ **Built-in analytics** and file management
- ✅ **Custom gateways** for faster access

## 🚀 Setup Steps

### Step 1: Create Pinata Account

1. **Go to:** https://pinata.cloud/
2. **Click "Sign Up"** and create a free account
3. **Verify your email** address

### Step 2: Get API Credentials

1. **Login to Pinata Dashboard**
2. **Click "API Keys"** in the left sidebar
3. **Click "New Key"** button
4. **Configure the key:**
   - **Key Name:** `inbox3-app`
   - **Permissions:** 
     - ✅ Check "pinFileToIPFS"
     - ✅ Check "pinJSONToIPFS" 
     - ✅ Check "pinList" (optional)
   - **Max Uses:** Leave empty (unlimited)
5. **Click "Create Key"**
6. **Copy both:** API Key and API Secret (save them securely!)

### Step 3: Update Environment Variables

Update your `.env` file in the `frontend` folder:

```bash
# Pinata IPFS Configuration
VITE_PINATA_API_KEY=your_actual_pinata_api_key_here
VITE_PINATA_SECRET_KEY=your_actual_pinata_secret_key_here
VITE_PINATA_GATEWAY=gateway.pinata.cloud

# Environment
VITE_APTOS_NETWORK=devnet
VITE_CONTRACT_ADDRESS=0xf1768eb79d367572b8e436f8e3bcfecf938eeaf6656a65f73773c50c43b71d67
```

### Step 4: Test the Setup

```bash
cd frontend
pnpm install
pnpm dev
```

## 🔧 Features & Benefits

### **What the Pinata Integration Includes:**

1. **Automatic File Upload:** Messages are uploaded to IPFS via Pinata
2. **Metadata Management:** Each file includes app metadata for organization
3. **Multiple Gateway Fallback:** Uses Pinata gateway + public IPFS gateways
4. **Error Handling:** Graceful fallback to mock data if Pinata is unavailable
5. **Console Logging:** See upload/download status in browser console

### **File Organization on Pinata:**
- **File Names:** `inbox3-message-{timestamp}`
- **Metadata Tags:** 
  - `app: "inbox3"`
  - `timestamp: "..."`
- **File Type:** JSON with message content

## 💰 Pricing (as of 2025)

### **Free Tier:**
- 📦 **1GB Storage**
- 🌐 **100GB Bandwidth/month** 
- 🚀 **Unlimited uploads**
- ⚡ **Global CDN**

### **Paid Plans:** (if you need more)
- 🔥 **Pro:** $20/month (100GB storage, 1TB bandwidth)
- 🚀 **Business:** Custom pricing

## 🛠️ Testing Without Credentials

**The app will work without Pinata credentials!**
- Messages will use mock CIDs for testing
- Core messaging functionality remains intact
- You can test wallet connection, inbox creation, etc.

## 🔍 Troubleshooting

### Common Issues:

| Issue | Solution |
|-------|----------|
| "Invalid API credentials" | Check API key and secret in .env |
| "Upload failed" | Verify API key has pinFileToIPFS permission |
| "Gateway timeout" | App will fallback to public IPFS gateways |
| "Rate limit exceeded" | Wait or upgrade Pinata plan |

### Debug Commands:

```bash
# Check if environment variables are loaded
console.log(import.meta.env.VITE_PINATA_API_KEY)

# Test Pinata API manually
curl -X GET "https://api.pinata.cloud/data/testAuthentication" \
  -H "pinata_api_key: YOUR_API_KEY" \
  -H "pinata_secret_api_key: YOUR_SECRET_KEY"
```

## 🚀 Advanced Configuration

### Custom Gateway (Optional):
If you have a Pinata Pro+ account with a custom gateway:

```bash
# In .env file
VITE_PINATA_GATEWAY=your-custom-gateway.mypinata.cloud
```

### Upload Options:
The current implementation includes:
- ✅ **Automatic metadata** with app name and timestamp
- ✅ **JSON formatting** for message data
- ✅ **Error handling** with fallbacks
- ✅ **Multiple gateway support** for downloads

## 📊 Monitoring Usage

1. **Login to Pinata Dashboard**
2. **Check "Files"** section to see uploaded messages
3. **View "Analytics"** for bandwidth usage
4. **Monitor "API Keys"** for rate limits

## 🔄 Migration from Web3Storage

If you previously used Web3Storage:
- ✅ **No code changes needed** - just update .env variables
- ✅ **Better performance** with Pinata's CDN
- ✅ **More reliable** pinning service
- ✅ **Easier management** through dashboard

---

**Ready to go!** Get your Pinata credentials and start testing the decentralized messaging! 🚀
