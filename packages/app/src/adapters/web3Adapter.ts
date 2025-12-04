/**
 * Web3 data adapter
 * Fetches and normalizes data from blockchain/IPFS
 */

import { Beat, Producer, DataAdapter } from '@/types/data';

export class Web3Adapter implements DataAdapter {
  private contractAddress: string;
  private ipfsGateway: string;
  
  constructor() {
    this.contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';
    this.ipfsGateway = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/';
  }
  
  async getProducer(walletAddress: string): Promise<Producer | null> {
    try {
      if (!walletAddress?.startsWith('0x')) return null;
      
      // Safely import Web3 dependencies
      try {
        const { beatNFTABI } = await import('@/abis');
        
        // Get producer's NFT balance
        const balance = await readContract(config, {
          address: this.contractAddress as `0x${string}`,
          abi: beatNFTABI,
          functionName: 'balanceOf',
          args: [walletAddress as `0x${string}`]
        }).catch(() => BigInt(0));
        
        return {
          id: walletAddress.toLowerCase(),
          name: 'Web3 Producer',
          bio: 'Producer on BeatsChain platform.',
          location: 'Blockchain',
          genres: ['Hip Hop'],
          totalBeats: Number(balance) || 0,
          totalSales: 0,
          verified: false,
          walletAddress
        };
      } catch (importError) {
        console.warn('Failed to import Web3 dependencies:', importError);
        return null;
      }
    } catch (error) {
      console.error('Error fetching producer from Web3:', error);
      return null;
    }
  }

  async getProducerBeats(walletAddress: string): Promise<Beat[]> {
    try {
      if (!walletAddress?.startsWith('0x')) return [];
      
      // Safely import Web3 dependencies
      try {
        const { beatNFTABI } = await import('@/abis');
        
        // Get producer's NFT balance
        const balance = await readContract(config, {
          address: this.contractAddress as `0x${string}`,
          abi: beatNFTABI,
          functionName: 'balanceOf',
          args: [walletAddress as `0x${string}`]
        }).catch(() => BigInt(0));
        
        if (balance <= 0) return [];
        
        // Limit the number of tokens to fetch to prevent excessive requests
        const maxTokens = Math.min(Number(balance), 5);
        const tokenIds = Array.from({ length: maxTokens }, (_, i) => BigInt(i + 1));
        
        // Fetch metadata for each token
        const beatPromises = tokenIds.map(async (tokenId) => {
          try {
            const tokenURI = await readContract(config, {
              address: this.contractAddress as `0x${string}`,
              abi: beatNFTABI,
              functionName: 'tokenURI',
              args: [tokenId]
            }).catch(() => '');
            
            if (!tokenURI) return null;
            
            // Fetch IPFS metadata
            const ipfsUrl = tokenURI.replace('ipfs://', this.ipfsGateway);
            const response = await fetch(ipfsUrl);
            const metadata = await response.json();
            
            return {
              id: tokenId.toString(),
              title: metadata.name || 'Untitled Beat',
              description: metadata.description || '',
              producerId: walletAddress.toLowerCase(),
              producerName: metadata.artist || 'Unknown Artist',
              genre: metadata.attributes?.find((attr: any) => attr.trait_type === 'Genre')?.value || 'Hip Hop',
              bpm: parseInt(metadata.attributes?.find((attr: any) => attr.trait_type === 'BPM')?.value || '120'),
              key: metadata.attributes?.find((attr: any) => attr.trait_type === 'Key')?.value || 'C',
              price: parseFloat(metadata.attributes?.find((attr: any) => attr.trait_type === 'Price')?.value || '0.05'),
              audioUrl: metadata.animation_url?.replace('ipfs://', this.ipfsGateway) || '',
              coverImageUrl: metadata.image?.replace('ipfs://', this.ipfsGateway),
              isNFT: true,
              tokenId: tokenId.toString()
            };
          } catch (error) {
            console.warn('Failed to fetch metadata for token:', tokenId, error);
            return null;
          }
        });
        
        const beats = (await Promise.all(beatPromises)).filter(Boolean) as Beat[];
        return beats;
      } catch (importError) {
        console.warn('Failed to import Web3 dependencies:', importError);
        return [];
      }
    } catch (error) {
      console.error('Error fetching beats from Web3:', error);
      return [];
    }
  }

  async getAllProducers(): Promise<Producer[]> {
    // This would require indexing events from the contract
    // For now, return empty array as this is complex to implement
    return [];
  }

  async getBeat(tokenId: string): Promise<Beat | null> {
    try {
      if (!tokenId || !this.contractAddress) return null;
      
      // Safely import Web3 dependencies
      try {
        const { beatNFTABI } = await import('@/abis');
        
        // Get token URI
        const tokenURI = await readContract(config, {
          address: this.contractAddress as `0x${string}`,
          abi: beatNFTABI,
          functionName: 'tokenURI',
          args: [BigInt(tokenId)]
        }).catch(() => '');
        
        if (!tokenURI) return null;
        
        // Fetch IPFS metadata
        const ipfsUrl = tokenURI.replace('ipfs://', this.ipfsGateway);
        const response = await fetch(ipfsUrl);
        const metadata = await response.json();
        
        // Get owner
        const owner = await readContract(config, {
          address: this.contractAddress as `0x${string}`,
          abi: beatNFTABI,
          functionName: 'ownerOf',
          args: [BigInt(tokenId)]
        }).catch(() => '');
        
        return {
          id: tokenId,
          title: metadata.name || 'Untitled Beat',
          description: metadata.description || '',
          producerId: owner.toLowerCase(),
          producerName: metadata.artist || 'Unknown Artist',
          genre: metadata.attributes?.find((attr: any) => attr.trait_type === 'Genre')?.value || 'Hip Hop',
          bpm: parseInt(metadata.attributes?.find((attr: any) => attr.trait_type === 'BPM')?.value || '120'),
          key: metadata.attributes?.find((attr: any) => attr.trait_type === 'Key')?.value || 'C',
          price: parseFloat(metadata.attributes?.find((attr: any) => attr.trait_type === 'Price')?.value || '0.05'),
          audioUrl: metadata.animation_url?.replace('ipfs://', this.ipfsGateway) || '',
          coverImageUrl: metadata.image?.replace('ipfs://', this.ipfsGateway),
          isNFT: true,
          tokenId
        };
      } catch (importError) {
        console.warn('Failed to import Web3 dependencies:', importError);
        return null;
      }
    } catch (error) {
      console.error('Error fetching beat from Web3:', error);
      return null;
    }
  }

  async getFeaturedBeats(limit: number = 6): Promise<Beat[]> {
    try {
      console.log('Web3Adapter: Fetching blockchain beats')
      
      if (typeof window === 'undefined') return []
      
      // Import Web3DataContext to use real blockchain data
      const { useWeb3Data } = await import('@/context/Web3DataContext')
      
      // Try to get blockchain beats from Web3DataContext
      try {
        // Access Web3DataContext beats directly from DOM/React context
        const contextElement = document.querySelector('[data-web3-beats]')
        if (contextElement) {
          const beatsData = contextElement.getAttribute('data-web3-beats')
          if (beatsData) {
            const beats = JSON.parse(beatsData)
            console.log('Found blockchain beats from context:', beats.length)
            return beats.slice(0, limit)
          }
        }
      } catch (err) {
        console.warn('Failed to get beats from context:', err)
      }
      
      // Fallback: Try to fetch blockchain data directly
      try {
        // TODO: Replace with Thirdweb client
        const { BeatNFTConfig } = await import('@/contracts/BeatNFT')
        const { formatEther } = await import('viem')
        
        // This is a simplified version - in practice, we'd need the publicClient instance
        console.log('Attempting direct blockchain fetch...')
        
        // For now, return empty array and let UnifiedDataProvider handle Sanity fallback
        return []
      } catch (err) {
        console.warn('Direct blockchain fetch failed:', err)
        return []
      }
    } catch (error) {
      console.error('Error in getFeaturedBeats:', error)
      return []
    }
  }
}