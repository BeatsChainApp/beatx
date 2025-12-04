'use client'

import { useState } from 'react'
import { BeatNFTConfig } from '@/contracts/BeatNFT'
import { parseEther } from 'viem'
import { useIPFS } from '@/hooks/useIPFS'
import { useEnhancedToast } from '@/hooks/useToast.enhanced'

interface MintExistingBeatProps {
  beat: any
  onMintSuccess: (tokenId: string, transactionHash: string) => void
}

export default function MintExistingBeat({ beat, onMintSuccess }: MintExistingBeatProps) {
  const [minting, setMinting] = useState(false)
  const [mintTxHash, setMintTxHash] = useState<string | null>(null)
  
  const { writeContract } = useWriteContract()
  const { uploadMetadata } = useIPFS()
  const { success, error } = useEnhancedToast()
  
  const { data: mintReceipt } = useWaitForTransactionReceipt({
    hash: mintTxHash as `0x${string}`,
  })

  const handleMint = async () => {
    if (minting || beat.isNFT) return
    
    setMinting(true)
    
    try {
      // Create metadata if not exists
      let metadataUri = beat.metadataUri
      
      if (!metadataUri) {
        const metadata = {
          name: beat.title,
          description: beat.description,
          image: beat.coverImageUrl,
          audio: beat.audioUrl,
          attributes: [
            { trait_type: 'Genre', value: beat.genre },
            { trait_type: 'BPM', value: beat.bpm },
            { trait_type: 'Key', value: beat.key },
            { trait_type: 'Producer', value: beat.producerId },
            { trait_type: 'Stage Name', value: beat.stageName || 'Unknown Artist' },
            { trait_type: 'Price', value: beat.price },
            ...(beat.tags || []).map(tag => ({ trait_type: 'Tag', value: tag }))
          ]
        }
        
        const metadataResult = await uploadMetadata(metadata, `${beat.id}-metadata`)
        metadataUri = metadataResult?.url || ''
      }
      
      if (!metadataUri) {
        throw new Error('Failed to upload metadata to IPFS')
      }
      
      // Mint NFT
      const mintTx = await writeContract({
        address: BeatNFTConfig.address[11155111] as `0x${string}`,
        abi: BeatNFTConfig.abi,
        functionName: 'mintBeat',
        args: [
          beat.producerId as `0x${string}`,
          metadataUri,
          parseEther(beat.price.toString()),
          BigInt(500), // 5% royalty
          beat.genre,
          BigInt(beat.bpm),
          beat.key
        ]
      })
      
      setMintTxHash(mintTx)
      
      success(`🔄 Minting "${beat.title}" as NFT: ${mintTx?.slice(0, 10) || 'pending'}...`, {
        throttleKey: `mint-existing-${beat.id}`,
        throttleMs: 3000
      })
      
      // Update beat data
      const updatedBeat = {
        ...beat,
        transactionHash: mintTx,
        isNFT: true,
        metadataUri,
        source: 'blockchain'
      }
      
      // Update localStorage
      const producerBeatsKey = `producer_beats_${beat.producerId}`
      const existingBeats = JSON.parse(localStorage.getItem(producerBeatsKey) || '[]')
      const beatIndex = existingBeats.findIndex(b => b.id === beat.id)
      if (beatIndex !== -1) {
        existingBeats[beatIndex] = updatedBeat
        localStorage.setItem(producerBeatsKey, JSON.stringify(existingBeats))
      }
      
      onMintSuccess(mintTx, mintTx)
      
    } catch (err: any) {
      console.error('Minting failed:', err)
      error(`Failed to mint NFT: ${err.message || 'Unknown error'}`, {
        throttleKey: `mint-error-${beat.id}`,
        throttleMs: 5000
      })
    } finally {
      setMinting(false)
    }
  }

  if (beat.isNFT) {
    return (
      <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
        ✅ NFT Minted
      </span>
    )
  }

  return (
    <button
      onClick={handleMint}
      disabled={minting}
      className={`inline-flex items-center px-3 py-1.5 border text-sm font-medium rounded ${
        minting
          ? 'border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed'
          : 'border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100'
      }`}
    >
      {minting ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Minting...
        </>
      ) : (
        <>
          <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Mint NFT
        </>
      )}
    </button>
  )
}