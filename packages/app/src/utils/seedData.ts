// Removed Firebase dependency - now using MCP server
import { Beat, UserProfile } from '@/types'

const SEED_USERS: Omit<UserProfile, 'uid'>[] = [
  {
    email: 'beatmaster@beatschain.app',
    displayName: 'Beat Master',
    role: 'producer',
    isVerified: true,
    createdAt: new Date('2024-01-01')
  },
  {
    email: 'djpro@beatschain.app',
    displayName: 'DJ Pro',
    role: 'producer',
    isVerified: true,
    createdAt: new Date('2024-01-05')
  },
  {
    email: 'musiclover@beatschain.app',
    displayName: 'Music Lover',
    role: 'user',
    isVerified: false,
    createdAt: new Date('2024-01-10')
  }
]

const SEED_BEATS: Omit<Beat, 'id'>[] = [
  {
    title: 'Amapiano Fire',
    description: 'Hot amapiano beat with deep basslines and smooth piano melodies',
    producerId: 'producer-1',
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    coverImageUrl: 'https://via.placeholder.com/400x400/667eea/ffffff?text=Amapiano+Fire',
    price: 299.99,
    genre: 'amapiano',
    bpm: 112,
    key: 'C minor',
    tags: ['amapiano', 'piano', 'bass', 'south african'],
    isNFT: false,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    title: 'Afrobeats Groove',
    description: 'Infectious afrobeats rhythm with traditional percussion',
    producerId: 'producer-2',
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    coverImageUrl: 'https://via.placeholder.com/400x400/764ba2/ffffff?text=Afrobeats+Groove',
    price: 249.99,
    genre: 'afrobeats',
    bpm: 102,
    key: 'F major',
    tags: ['afrobeats', 'percussion', 'groove', 'african'],
    isNFT: false,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  },
  {
    title: 'Trap Banger',
    description: 'Hard-hitting trap beat with 808s and crisp hi-hats',
    producerId: 'producer-1',
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    coverImageUrl: 'https://via.placeholder.com/400x400/f093fb/ffffff?text=Trap+Banger',
    price: 399.99,
    genre: 'trap',
    bpm: 140,
    key: 'G minor',
    tags: ['trap', '808', 'hard', 'banger'],
    isNFT: true,
    tokenId: 1,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  },
  {
    title: 'Deep House Vibes',
    description: 'Smooth deep house with atmospheric pads and groovy bassline',
    producerId: 'producer-2',
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    coverImageUrl: 'https://via.placeholder.com/400x400/4facfe/ffffff?text=Deep+House',
    price: 199.99,
    genre: 'house',
    bpm: 124,
    key: 'A minor',
    tags: ['house', 'deep', 'atmospheric', 'groove'],
    isNFT: false,
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25')
  },
  {
    title: 'Gqom Energy',
    description: 'High-energy gqom beat with heavy kicks and minimal synths',
    producerId: 'producer-1',
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    coverImageUrl: 'https://via.placeholder.com/400x400/ff6b6b/ffffff?text=Gqom+Energy',
    price: 329.99,
    genre: 'gqom',
    bpm: 130,
    key: 'E minor',
    tags: ['gqom', 'energy', 'minimal', 'south african'],
    isNFT: false,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01')
  }
]

const SEED_TRANSACTIONS = [
  {
    beatId: 'beat-1',
    buyerId: 'user-1',
    producerId: 'producer-1',
    amount: 299.99,
    licenseType: 'premium',
    paymentMethod: 'fiat',
    transactionHash: 'fiat_1704067200_abc123',
    status: 'completed',
    createdAt: new Date('2024-01-01'),
    fees: 10.50
  },
  {
    beatId: 'beat-2',
    buyerId: 'user-1',
    producerId: 'producer-2',
    amount: 249.99,
    licenseType: 'basic',
    paymentMethod: 'crypto',
    transactionHash: '0x1234567890abcdef',
    status: 'completed',
    createdAt: new Date('2024-01-15'),
    fees: 6.25
  }
]

export async function seedMCPServer() {
  try {
    const MCP_SERVER_URL = process.env.NEXT_PUBLIC_MCP_SERVER_URL || 'https://beatx-mcp-server-production.up.railway.app'
    
    console.log('🌱 Starting MCP server seeding...')

    // Seed Beats via MCP server
    console.log('🎵 Seeding beats...')
    for (const beatData of SEED_BEATS) {
      try {
        const response = await fetch(`${MCP_SERVER_URL}/api/beats`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: beatData.title,
            description: beatData.description,
            producer_address: `0x${Math.random().toString(16).substr(2, 40)}`,
            producer_name: beatData.producerId === 'producer-1' ? 'Beat Master' : 'DJ Pro',
            genre: beatData.genre,
            bpm: beatData.bpm,
            key_signature: beatData.key,
            audio_url: beatData.audioUrl,
            cover_image_url: beatData.coverImageUrl,
            price: beatData.price / 100, // Convert to ETH
            tags: beatData.tags,
            source: 'seed'
          })
        })
        
        if (response.ok) {
          console.log(`✅ Created beat: ${beatData.title}`)
        } else {
          console.warn(`⚠️ Failed to create beat: ${beatData.title}`)
        }
      } catch (error) {
        console.warn(`⚠️ Error creating beat ${beatData.title}:`, error)
      }
    }

    console.log('🎉 MCP server seeding completed!')
    return { success: true, message: 'Database seeded via MCP server' }

  } catch (error) {
    console.error('❌ Seeding failed:', error)
    return { success: false, error: error.message }
  }
}