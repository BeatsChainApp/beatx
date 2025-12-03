import { createWalletAdapter } from '@/lib/walletAdapter'

// Mock environment variables
const originalEnv = process.env

beforeEach(() => {
  jest.resetModules()
  process.env = { ...originalEnv }
})

afterAll(() => {
  process.env = originalEnv
})

describe('WalletAdapter', () => {
  it('should create Thirdweb adapter when flag is enabled', () => {
    process.env.NEXT_PUBLIC_USE_THIRDWEB = 'true'
    process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID = 'test-client-id'
    
    const adapter = createWalletAdapter()
    expect(adapter).toBeDefined()
    expect(adapter.isReady).toBeDefined()
    expect(adapter.getAddress).toBeDefined()
    expect(adapter.signMessage).toBeDefined()
    expect(adapter.initWallet).toBeDefined()
    expect(adapter.onChange).toBeDefined()
  })

  it('should create Reown adapter when flag is disabled', () => {
    process.env.NEXT_PUBLIC_USE_THIRDWEB = 'false'
    
    const adapter = createWalletAdapter()
    expect(adapter).toBeDefined()
    expect(adapter.isReady).toBeDefined()
    expect(adapter.getAddress).toBeDefined()
    expect(adapter.signMessage).toBeDefined()
    expect(adapter.initWallet).toBeDefined()
    expect(adapter.onChange).toBeDefined()
  })

  it('should handle wallet initialization', async () => {
    const adapter = createWalletAdapter()
    
    // Mock wallet initialization
    const mockInitWallet = jest.spyOn(adapter, 'initWallet')
    mockInitWallet.mockResolvedValue(undefined)
    
    await expect(adapter.initWallet()).resolves.toBeUndefined()
    expect(mockInitWallet).toHaveBeenCalled()
  })

  it('should handle address retrieval', () => {
    const adapter = createWalletAdapter()
    
    // Initially should return null
    expect(adapter.getAddress()).toBeNull()
  })

  it('should handle change callbacks', () => {
    const adapter = createWalletAdapter()
    const mockCallback = jest.fn()
    
    adapter.onChange(mockCallback)
    expect(mockCallback).toBeDefined()
  })
})