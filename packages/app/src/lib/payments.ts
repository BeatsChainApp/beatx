import { parseEther, formatEther, erc20Abi } from 'viem'

export interface PaymentToken {
  address: string
  symbol: string
  name: string
  decimals: number
  icon?: string
}

export const SUPPORTED_TOKENS: PaymentToken[] = [
  {
    address: '0x0000000000000000000000000000000000000000', // ETH
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    icon: '⟠'
  },
  {
    address: '0xA0b86a33E6441b8435b662f0E2d0B8A0E4B5B5B5', // Mock USDC
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    icon: '💵'
  },
  {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // Mock USDT
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    icon: '💰'
  }
]

export class PaymentManager {
  static async getTokenBalance(tokenAddress: string, userAddress: string): Promise<string> {
    if (tokenAddress === '0x0000000000000000000000000000000000000000') {
      // ETH balance handled by wagmi useBalance
      return '0'
    }

    try {
      const balance = await readContract({
        address: tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [userAddress as `0x${string}`]
      })
      
      const token = SUPPORTED_TOKENS.find(t => t.address === tokenAddress)
      const decimals = token?.decimals || 18
      
      return formatEther(balance as bigint)
    } catch (error) {
      console.error('Failed to get token balance:', error)
      return '0'
    }
  }

  static async approveToken(
    tokenAddress: string,
    spenderAddress: string,
    amount: string
  ): Promise<string> {
    const token = SUPPORTED_TOKENS.find(t => t.address === tokenAddress)
    if (!token) throw new Error('Unsupported token')

    const amountWei = parseEther(amount)

    const hash = await writeContract({
      address: tokenAddress as `0x${string}`,
      abi: erc20Abi,
      functionName: 'approve',
      args: [spenderAddress as `0x${string}`, amountWei]
    })

    return hash
  }

  static async checkAllowance(
    tokenAddress: string,
    ownerAddress: string,
    spenderAddress: string
  ): Promise<string> {
    if (tokenAddress === '0x0000000000000000000000000000000000000000') {
      return '999999999' // ETH doesn't need approval
    }

    try {
      const allowance = await readContract({
        address: tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [ownerAddress as `0x${string}`, spenderAddress as `0x${string}`]
      })

      return formatEther(allowance as bigint)
    } catch (error) {
      console.error('Failed to check allowance:', error)
      return '0'
    }
  }

  static formatTokenAmount(amount: string, decimals: number = 18): string {
    const num = parseFloat(amount)
    if (num === 0) return '0'
    if (num < 0.001) return '<0.001'
    if (num < 1) return num.toFixed(3)
    if (num < 1000) return num.toFixed(2)
    return num.toLocaleString()
  }

  static getTokenByAddress(address: string): PaymentToken | undefined {
    return SUPPORTED_TOKENS.find(token => 
      token.address.toLowerCase() === address.toLowerCase()
    )
  }

  static getTokenBySymbol(symbol: string): PaymentToken | undefined {
    return SUPPORTED_TOKENS.find(token => 
      token.symbol.toLowerCase() === symbol.toLowerCase()
    )
  }
}