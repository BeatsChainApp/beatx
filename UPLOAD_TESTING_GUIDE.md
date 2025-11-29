# BeatsChain Upload Testing Guide

## 🎯 Overview
Both the Chrome Extension and Web App upload systems are **OPERATIONAL** and ready for testing. This guide provides step-by-step instructions to verify the upload processes.

## ✅ Verification Results Summary

### Chrome Extension (6-Step Workflow)
- ✅ **Workflow Structure**: Complete 6-step process
- ✅ **Upload Process**: File processing, metadata extraction
- ✅ **ISRC Generation**: Professional ISRC system with validation
- ✅ **NFT Minting**: Solana blockchain integration
- ✅ **Sponsored Content**: Revenue system (+$2.50)

### Web Application
- ✅ **Upload Workflow**: Dropzone, validation, progress tracking
- ✅ **File Upload**: IPFS integration, metadata upload
- ✅ **NFT Minting**: Gasless + direct minting options
- ✅ **Livepeer Integration**: Optimized streaming, CDN delivery

### MCP Server
- ✅ **API Routes**: 17 routes including beats, ISRC, Livepeer
- ✅ **Backend Services**: 18 services including analytics, IPFS, Supabase

## 🧪 Testing Instructions

### 1. Chrome Extension Testing

#### Prerequisites
- Chrome browser with extension installed
- Test audio file (MP3, WAV, or M4A)
- Google account for authentication

#### Step-by-Step Test
1. **Open Extension**
   ```
   - Click BeatsChain extension icon
   - Verify 6-step workflow is visible
   ```

2. **Upload Audio File**
   ```
   - Navigate to "Upload" section
   - Drag/drop or select audio file
   - Verify file processing and metadata extraction
   - Check audio preview functionality
   ```

3. **Generate License**
   ```
   - Fill in artist information
   - Click "Generate License"
   - Verify AI-generated or template license appears
   - Approve license to proceed
   ```

4. **ISRC Generation**
   ```
   - Click "Generate ISRC"
   - Verify ISRC format: ZA-80G-YY-NNNNN
   - Test ISRC validation
   - Check for sponsored content display
   ```

5. **NFT Minting**
   ```
   - Proceed to minting section
   - Verify wallet connection (Phantom or embedded)
   - Test minting process
   - Check transaction completion
   ```

6. **Success & Download**
   ```
   - Verify success page displays
   - Test download package functionality
   - Check transaction hash display
   ```

### 2. Web Application Testing

#### Prerequisites
- Web browser
- Wallet connection (MetaMask, WalletConnect)
- Test audio file
- BeatNFT credits or ETH for gas

#### Step-by-Step Test
1. **Navigate to Upload Page**
   ```
   URL: /upload
   - Verify protected route authentication
   - Check BeatNFT credits display
   ```

2. **Upload Audio File**
   ```
   - Use dropzone for audio file
   - Optional: Upload cover image
   - Verify file size validation
   - Check progress tracking
   ```

3. **Fill Beat Details**
   ```
   - Title, description, genre
   - BPM, key, price in ETH
   - Stage name, tags
   - License selection
   ```

4. **Professional Services (Optional)**
   ```
   - Enable professional services
   - Test ISRC generation
   - Check sponsor revenue (+$2.50)
   ```

5. **Optimized Playback**
   ```
   - Enable Livepeer optimization
   - Verify faster streaming setup
   ```

6. **Submit Upload**
   ```
   - Click "Upload Beat"
   - Monitor progress (IPFS, processing, minting)
   - Verify gasless minting attempt
   - Check fallback to direct minting if needed
   ```

### 3. MCP Server Testing

#### API Endpoints to Test
```bash
# Test beats endpoint
curl -X GET "http://localhost:3001/api/beats"

# Test ISRC generation
curl -X POST "http://localhost:3001/api/isrc/generate" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Track","artist":"Test Artist"}'

# Test Livepeer integration
curl -X GET "http://localhost:3001/api/livepeer/status"
```

## 🔧 Configuration Checklist

### Before Testing
- [ ] Add app URL to Google OAuth console
- [ ] Deploy PINATA_JWT to Railway
- [ ] Verify Supabase connection
- [ ] Check Livepeer API keys
- [ ] Test wallet connections

### Environment Variables
```env
# Required for uploads
PINATA_JWT=your_pinata_jwt_token
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# Optional for optimization
LIVEPEER_API_KEY=your_livepeer_key
THIRDWEB_SECRET_KEY=your_thirdweb_key
```

## 🚨 Known Issues & Solutions

### Extension Issues
1. **ISRC Generation Fails**
   - Solution: Check ISRCManager initialization
   - Fallback: Manual ISRC entry

2. **Minting Timeout**
   - Solution: Increase timeout to 60 seconds
   - Fallback: Show pending status

3. **Sponsored Content Not Showing**
   - Solution: Verify partner consent given
   - Check: `partnerConsentGiven` flag

### App Issues
1. **Gasless Minting Fails**
   - Solution: Automatic fallback to direct minting
   - Requires: ETH for gas fees

2. **Livepeer Upload Fails**
   - Solution: Automatic fallback to IPFS
   - Impact: No optimized streaming

3. **File Size Limits**
   - Extension: No hard limit (depends on browser)
   - App: 50MB limit with BeatNFT credits

## 📊 Success Metrics

### Extension Success Indicators
- [ ] File uploads and processes correctly
- [ ] ISRC generates in ZA-80G format
- [ ] Sponsored content displays (+$2.50 revenue)
- [ ] NFT mints on Solana blockchain
- [ ] Download package contains all files

### App Success Indicators
- [ ] Dropzone accepts files correctly
- [ ] Progress tracking shows all steps
- [ ] Professional services work (ISRC, analysis)
- [ ] Livepeer optimization enables
- [ ] NFT mints with gasless or direct method
- [ ] Beat appears in dashboard

### MCP Server Success Indicators
- [ ] All 17 routes respond correctly
- [ ] Beats API handles CRUD operations
- [ ] ISRC service generates valid codes
- [ ] Analytics track user actions
- [ ] Supabase integration works

## 🎯 Next Steps After Testing

1. **If Extension Works**:
   - Test with various audio formats
   - Verify ISRC uniqueness
   - Check sponsored content revenue tracking

2. **If App Works**:
   - Test BeatNFT credit system
   - Verify Livepeer streaming quality
   - Check gasless minting success rate

3. **If Issues Found**:
   - Check browser console for errors
   - Verify network connectivity
   - Test with different file sizes
   - Check wallet connection status

## 📞 Support

If you encounter issues during testing:
1. Check browser console for error messages
2. Verify all environment variables are set
3. Test with smaller file sizes first
4. Ensure wallet has sufficient funds
5. Try different browsers/devices

---

**Status**: ✅ Both upload systems are operational and ready for testing
**Last Updated**: January 2025
**Next Review**: After domain OAuth configuration