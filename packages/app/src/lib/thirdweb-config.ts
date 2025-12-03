import { createThirdwebClient } from "thirdweb"
import { inAppWallet, createWallet } from "thirdweb/wallets"
import { ethereum, sepolia } from "thirdweb/chains"

// BeatsChain App (Extension) - Thirdweb Configuration
export const thirdwebClient = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
  secretKey: process.env.THIRDWEB_SECRET_KEY
})

// Project wallet for server operations
export const PROJECT_WALLET_ADDRESS = process.env.NEXT_PUBLIC_THIRDWEB_PROJECT_WALLET || "0x9186293803fADeCAf69a151133CE1E52b559B58e"

// Supported chains
export const SUPPORTED_CHAINS = [ethereum, sepolia]

// Wallet configurations
export const walletConfig = {
  inApp: inAppWallet({
    auth: {
      options: ["google", "email", "phone"]
    }
  }),
  metamask: createWallet("io.metamask"),
  walletConnect: createWallet("walletConnect")
}

// API endpoints
export const THIRDWEB_API = {
  transactions: "https://api.thirdweb.com/v1/transactions",
  headers: {
    "Content-Type": "application/json",
    "x-secret-key": process.env.THIRDWEB_SECRET_KEY
  }
}