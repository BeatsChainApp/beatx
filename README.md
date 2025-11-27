# BeatsChain - Blockchain Beat Marketplace ⛓️🎵

Where South African beats meet global blockchain - connecting SA producers with international artists through crypto-powered music ownership.

## ⛓️ Features

### ✅ Complete Marketplace
- **Homepage** - Hero section with features and call-to-actions
- **Marketplace** - Beat browsing with search, filters, and audio players
- **Producers Directory** - Paginated producer profiles with stats
- **Dashboard** - Producer management tools and analytics
- **Profile** - User settings and wallet connection

### ✅ Web3 Integration
- **Smart Contracts** - BeatNFT with royalty system
- **Wallet Connection** - WalletConnect integration
- **Real-time Notifications** - On-chain event monitoring
- **NFT Ownership** - Blockchain-verified beat ownership

### ✅ Authentication & Data
- **Firebase Auth** - Email/Password + Google sign-in
- **Firestore Ready** - Real-time database integration
- **Admin Panel** - User and content management
- **File Storage** - Firebase Storage for audio files

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 + TypeScript + Responsive CSS
- **Web3**: Wagmi + Viem + WalletConnect
- **Authentication**: Firebase Auth
- **Database**: Firestore (configured)
- **Smart Contracts**: Hardhat + Solidity
- **Deployment**: GitHub Actions + Vercel

## 🏃♂️ Quick Start

```bash
# Install dependencies
yarn install

# Start development server
yarn dev

# Build for production
yarn build
```

## 📁 Project Structure

```
packages/
├── app/                 # Next.js frontend application
│   ├── src/app/        # App router pages
│   ├── src/components/ # React components
│   └── src/hooks/      # Custom hooks
└── hardhat/            # Smart contracts
    ├── contracts/      # Solidity contracts
    └── ignition/       # Deployment scripts
```

## 🔧 Environment Setup

Create `.env.local` in `packages/app/`:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# Smart Contract
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
```

## 🚀 Deployment

### GitHub Actions
- Automated deployment on push to main
- Builds both contracts and frontend
- Deploys to Vercel

### Manual Deployment
```bash
# Deploy contracts
cd packages/hardhat
yarn deploy:beatnft

# Deploy frontend
cd packages/app
yarn build
```

## 📋 Features Overview

### 🎵 For Producers
- Upload and mint beats as NFTs
- Set pricing and licensing terms
- Track sales and earnings
- Receive automatic royalties

### 🎧 For Artists
- Browse and preview beats
- Purchase with crypto payments
- Own beats as NFTs
- Resell with original producer royalties

### 👨💼 For Admins
- User management dashboard
- Content moderation tools
- Platform analytics
- Revenue tracking

## 🔔 Web3 Notifications

Real-time notifications for:
- Beat purchases and sales
- NFT minting events
- Royalty payments
- Ownership transfers

## 📊 Current Status

**Production Ready: 95%**

✅ **Complete Features:**
- Full marketplace functionality
- Web3 integration with notifications
- Firebase authentication
- Admin management system
- Professional UI/UX design

🔄 **Next Steps:**
- Firestore data migration
- Sanity CMS integration
- ✅ Performance optimization

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🔗 Links

- **Live Demo**: Coming soon
- **Documentation**: `/docs`
- **Smart Contracts**: `/packages/hardhat`

---

Built with ❤️ to bridge SA beats to the world 🇿🇦🌍