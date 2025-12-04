import { createThirdwebClient, getContract } from "thirdweb"
import { createWallet, injectedProvider } from "thirdweb/wallets"
import { defineChain } from "thirdweb/chains"
import { useActiveAccount, useConnect, useDisconnect } from "thirdweb/react"

export interface WalletAdapter {
  initWallet(): Promise<void>
  getAddress(): string | null
  signMessage(message: string): Promise<string>
  isReady(): boolean
  onChange(callback: (address: string | null) => void): void
}

class ThirdwebWalletAdapter implements WalletAdapter {
  private client: any
  private wallet: any
  private account: any
  private callbacks: ((address: string | null) => void)[] = []

  constructor() {
    this.client = createThirdwebClient({
      clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || ""
    })
  }

  async initWallet(): Promise<void> {
    try {
      this.wallet = createWallet("io.metamask")
      await this.wallet.connect({ client: this.client })
      this.account = this.wallet.getAccount()
      this.notifyCallbacks(this.account?.address || null)
    } catch (error) {
      console.error("Wallet initialization failed:", error)
      throw error
    }
  }

  getAddress(): string | null {
    return this.account?.address || null
  }

  async signMessage(message: string): Promise<string> {
    if (!this.account) throw new Error("Wallet not connected")
    return await this.account.signMessage({ message })
  }

  isReady(): boolean {
    return !!this.account
  }

  onChange(callback: (address: string | null) => void): void {
    this.callbacks.push(callback)
  }

  private notifyCallbacks(address: string | null): void {
    this.callbacks.forEach(cb => cb(address))
  }
}

export function createWalletAdapter(): WalletAdapter {
  return new ThirdwebWalletAdapter()
}