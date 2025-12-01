// Fix admin access by updating useWeb3Auth to check wallet directly
const fs = require('fs')
const path = require('path')

const useWeb3AuthPath = path.join(__dirname, 'packages/app/src/hooks/useWeb3Auth.ts')

// Read current file
let content = fs.readFileSync(useWeb3AuthPath, 'utf8')

// Update SUPER_ADMIN_WALLETS to include the correct wallet
const updatedContent = content.replace(
  /const SUPER_ADMIN_WALLETS = \[[\s\S]*?\]/,
  `const SUPER_ADMIN_WALLETS = [
  '0xc84799A904EeB5C57aBBBc40176E7dB8be202C10', // Admin wallet from extension
  '0xC84799A904EeB5C57aBBBc40176E7dB8be202C10', // Same wallet (case variation)
]`
)

// Update getRole function to be more permissive for admin wallet
const finalContent = updatedContent.replace(
  /const getRole = \(walletAddress: string\): Web3User\['role'\] => \{[\s\S]*?return 'user'\s*\}/,
  `const getRole = (walletAddress: string): Web3User['role'] => {
    if (typeof window === 'undefined') return 'user'
    
    // Check if wallet is super admin (case insensitive)
    const normalizedAddress = walletAddress.toLowerCase()
    const isAdmin = SUPER_ADMIN_WALLETS.some(addr => addr.toLowerCase() === normalizedAddress)
    
    if (isAdmin) {
      console.log('🔑 Admin wallet detected:', walletAddress)
      return 'super_admin'
    }
    
    try {
      const profileKey = \`web3_profile_\${normalizedAddress}\`
      const profile = localStorage.getItem(profileKey)
      if (profile) {
        const parsed = JSON.parse(profile)
        return parsed.role || 'user'
      }
    } catch (error) {
      console.warn('Error reading profile:', error)
    }
    
    return 'user'
  }`
)

// Write updated file
fs.writeFileSync(useWeb3AuthPath, finalContent)

console.log('✅ Updated useWeb3Auth with admin wallet access')
console.log('✅ Admin wallet will now have super_admin role')