/**
 * Unified Data Provider
 * Combines Web3 and Sanity data sources with prioritization and fallback
 */

import { Beat, Producer, DataAdapter } from '@/types/data';
import { SanityAdapter } from './sanityAdapter.enhanced';
import { Web3Adapter } from './web3Adapter.minimal';

export class UnifiedDataProvider implements DataAdapter {
  private sanityAdapter: SanityAdapter;
  private web3Adapter: Web3Adapter;
  
  constructor() {
    this.sanityAdapter = new SanityAdapter();
    this.web3Adapter = new Web3Adapter();
  }
  
  async getProducer(id: string): Promise<Producer | null> {
    if (!id) {
      console.warn('Empty producer ID provided');
      return null;
    }
    
    try {
      // Try Web3 first if ID looks like a wallet address
      if (id?.startsWith('0x')) {
        try {
          const web3Producer = await this.web3Adapter.getProducer(id);
          if (web3Producer) return web3Producer;
        } catch (error) {
          console.warn('Error fetching producer from Web3:', error);
        }
      }
      
      // Fall back to Sanity
      try {
        const sanityProducer = await this.sanityAdapter.getProducer(id);
        
        if (sanityProducer) {
          // If producer has wallet address, try to enhance with Web3 data
          if (sanityProducer.walletAddress) {
            try {
              const web3Producer = await this.web3Adapter.getProducer(sanityProducer.walletAddress);
              if (web3Producer) {
                // Merge data, prioritizing Web3 for dynamic fields
                return {
                  ...sanityProducer,
                  totalBeats: web3Producer.totalBeats || sanityProducer.totalBeats,
                  totalSales: web3Producer.totalSales || sanityProducer.totalSales
                };
              }
            } catch (error) {
              console.warn('Error enhancing producer with Web3 data:', error);
            }
          }
          
          return sanityProducer;
        }
      } catch (error) {
        console.warn('Error fetching producer from Sanity:', error);
      }
      
      // If we get here, both Web3 and Sanity failed
      return null;
    } catch (error) {
      console.error('Unexpected error in getProducer:', error);
      return null;
    }
  }

  async getProducerBeats(producerId: string): Promise<Beat[]> {
    if (!producerId) {
      console.warn('Empty producer ID provided');
      return [];
    }
    
    try {
      const producer = await this.getProducer(producerId);
      if (!producer) return [];
      
      // Try Web3 first if producer has wallet address
      if (producer.walletAddress) {
        try {
          const web3Beats = await this.web3Adapter.getProducerBeats(producer.walletAddress);
          if (web3Beats && web3Beats.length > 0) return web3Beats;
        } catch (error) {
          console.warn('Error fetching beats from Web3:', error);
        }
      }
      
      // Fall back to Sanity
      try {
        const sanityBeats = await this.sanityAdapter.getProducerBeats(producerId);
        return sanityBeats;
      } catch (error) {
        console.warn('Error fetching beats from Sanity:', error);
      }
      
      // If we get here, both Web3 and Sanity failed
      return [];
    } catch (error) {
      console.error('Unexpected error in getProducerBeats:', error);
      return [];
    }
  }

  async getAllProducers(): Promise<Producer[]> {
    try {
      // Get producers from Sanity
      const sanityProducers = await this.sanityAdapter.getAllProducers();
      
      // Enhance with Web3 data where possible
      const enhancedProducers = await Promise.all(
        sanityProducers.map(async (producer) => {
          if (producer.walletAddress) {
            try {
              const web3Producer = await this.web3Adapter.getProducer(producer.walletAddress);
              if (web3Producer) {
                return {
                  ...producer,
                  totalBeats: web3Producer.totalBeats || producer.totalBeats,
                  totalSales: web3Producer.totalSales || producer.totalSales
                };
              }
            } catch (error) {
              console.warn(`Error enhancing producer ${producer.id} with Web3 data:`, error);
            }
          }
          return producer;
        })
      );
      
      return enhancedProducers;
    } catch (error) {
      console.error('Error in getAllProducers:', error);
      return [];
    }
  }

  async getBeat(id: string): Promise<Beat | null> {
    if (!id) {
      console.warn('Empty beat ID provided');
      return null;
    }
    
    try {
      // Handle different beat ID types
      if (/^\d+$/.test(id)) {
        // Numeric ID - could be blockchain tokenId or localStorage beatId
        if (id.length > 10) {
          // localStorage beat ID (timestamp)
          
          // Try Web3DataContext if on client side
          if (typeof window !== 'undefined') {
            try {
              const contextData = (window as any).__WEB3_DATA_CONTEXT__
              if (contextData && contextData.beats) {
                const localBeat = contextData.beats.find((beat: any) => beat.id === id)
                if (localBeat) return localBeat
              }
            } catch (error) {
              console.warn('Error accessing Web3DataContext:', error)
            }
          }
          
          // NEW: Try API cache for server-side access
          try {
            const baseUrl = typeof window !== 'undefined' 
              ? window.location.origin 
              : 'https://beatschain.app'
            
            console.log(`Fetching beat metadata from: ${baseUrl}/api/beat-metadata/${id}`)
            const response = await fetch(`${baseUrl}/api/beat-metadata/${id}`, {
              headers: {
                'User-Agent': 'BeatsChain-Server/1.0'
              }
            })
            
            console.log(`API response status: ${response.status}`)
            if (response.ok) {
              const cachedBeat = await response.json()
              console.log('Found cached beat:', cachedBeat.title)
              return {
                id: cachedBeat.id,
                title: cachedBeat.title,
                description: cachedBeat.description,
                genre: cachedBeat.genre,
                bpm: cachedBeat.bpm,
                key: cachedBeat.key,
                price: cachedBeat.price,
                producerName: cachedBeat.stageName || cachedBeat.producerName,
                stageName: cachedBeat.stageName,
                coverImageUrl: cachedBeat.coverImageUrl,
                audioUrl: cachedBeat.audioUrl,
                tags: cachedBeat.tags,
                licenseType: cachedBeat.licenseType,
                createdAt: cachedBeat.createdAt,
                status: cachedBeat.status,
                isActive: cachedBeat.isActive,
                source: 'api-cache'
              }
            } else {
              console.warn(`API cache miss: ${response.status} ${response.statusText}`)
            }
          } catch (error) {
            console.warn('Error fetching beat from API cache:', error)
          }

        } else {
          // Short numeric ID - blockchain tokenId
          try {
            const web3Beat = await this.web3Adapter.getBeat(id);
            if (web3Beat) return web3Beat;
          } catch (error) {
            console.warn('Error fetching beat from Web3:', error);
          }
        }
      }
      
      // Fall back to Sanity for slug-based IDs
      return this.sanityAdapter.getBeat(id);
    } catch (error) {
      console.error('Error in getBeat:', error);
      return null;
    }
  }


  async getFeaturedBeats(limit = 8): Promise<Beat[]> {
    try {
      // Hybrid approach: Combine Web3 + Sanity for consistent marketplace
      const [web3Beats, sanityBeats] = await Promise.all([
        this.getWeb3Beats(limit),
        this.sanityAdapter.getFeaturedBeats()
      ])
      
      // Mark sources and set priorities
      const hybridBeats = [
        ...web3Beats.map(beat => ({ 
          ...beat, 
          source: 'web3' as const, 
          priority: 1 
        })),
        ...sanityBeats.map(beat => ({ 
          ...beat, 
          source: 'sanity' as const, 
          isDemo: true, 
          priority: 2 
        }))
      ]
      
      // Sort by priority (Web3 first), then by date
      const sortedBeats = hybridBeats
        .sort((a, b) => {
          if (a.priority !== b.priority) {
            return (a.priority || 999) - (b.priority || 999)
          }
          // Secondary sort by creation date (newest first)
          const dateA = new Date(a.createdAt || 0).getTime()
          const dateB = new Date(b.createdAt || 0).getTime()
          return dateB - dateA
        })
        .slice(0, limit)
      
      console.log(`Cross-profile marketplace: ${web3Beats.length} Web3 + ${sanityBeats.length} Sanity = ${sortedBeats.length} total`)
      return sortedBeats
    } catch (error) {
      console.error('Error in getFeaturedBeats:', error)
      return []
    }
  }
  
  private async getWeb3Beats(limit = 8): Promise<Beat[]> {
    const allBeats: Beat[] = []
    
    // 1. Current user's beats from localStorage (immediate display)
    if (typeof window !== 'undefined') {
      try {
        const contextData = (window as any).__WEB3_DATA_CONTEXT__
        if (contextData && contextData.beats) {
          allBeats.push(...contextData.beats)
        }
      } catch (error) {
        console.warn('Error accessing Web3DataContext:', error)
      }
    }
    
    // 2. Community beats from live application (cross-profile sharing)
    try {
      const baseUrl = typeof window !== 'undefined' 
        ? window.location.origin 
        : 'https://beatschain.app'
      
      const response = await fetch(`${baseUrl}/api/community-beats`, {
        headers: {
          'User-Agent': 'BeatsChain-UnifiedProvider/1.0'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.beats) {
          console.log(`Found ${data.beats.length} community beats`)
          allBeats.push(...data.beats)
        }
      }
    } catch (error) {
      console.warn('Error fetching community beats:', error)
    }
    
    // 3. Blockchain beats from smart contract
    try {
      const blockchainBeats = await this.web3Adapter.getFeaturedBeats(limit)
      allBeats.push(...blockchainBeats)
    } catch (error) {
      console.warn('Error fetching blockchain beats:', error)
    }
    
    // Remove duplicates and filter active beats
    const uniqueBeats = allBeats.filter((beat, index, self) => 
      beat.isActive && self.findIndex(b => b.id === beat.id) === index
    )
    
    return uniqueBeats.slice(0, limit)
  }
}

// Export singleton instance
export const dataProvider = new UnifiedDataProvider();