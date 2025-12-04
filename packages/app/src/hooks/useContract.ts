'use client'

import { parseEther, formatEther } from 'viem'
import { BeatNFTAbi, BeatNFTAddress } from '@/contracts/BeatNFT'

type ChainId = keyof typeof BeatNFTAddress

export function useContract() {
  const chainId = useChainId() as ChainId
  const contractAddress = BeatNFTAddress[chainId] as `0x${string}`
  const writeContract = () => { console.warn('writeContract disabled'); return Promise.resolve('0x0') }
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const mintBeat = async (
    to: string,
    metadataUri: string,
    price: number,
    royaltyPercentage: number,
    genre: string,
    bpm: number,
    musicalKey: string
  ) => {
    const priceWei = parseEther(price.toString())
    
    return // writeContract({
      address: contractAddress,
      abi: BeatNFTAbi,
      functionName: 'mintBeat',
      args: [to as `0x${string}`, metadataUri, priceWei, BigInt(royaltyPercentage * 100), genre, BigInt(bpm), musicalKey],
    })
  }

  const setBeatForSale = async (tokenId: number, priceInEth: number) => {
    const price = parseEther(priceInEth.toString())
    
    return // writeContract({
      address: contractAddress,
      abi: BeatNFTAbi,
      functionName: 'setBeatForSale',
      args: [BigInt(tokenId), price],
    })
  }

  const buyBeat = async (tokenId: number, priceInEth: number) => {
    const value = parseEther(priceInEth.toString())
    
    return // writeContract({
      address: contractAddress,
      abi: BeatNFTAbi,
      functionName: 'buyBeat',
      args: [BigInt(tokenId)],
      value,
    })
  }

  return {
    contract: { address: contractAddress, abi: BeatNFTAbi },
    mintBeat,
    setBeatForSale,
    buyBeat,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}

export function useContractRead() {
  const chainId = useChainId() as ChainId
  const contractAddress = BeatNFTAddress[chainId] as `0x${string}`

  const getBeatInfo = (tokenId: number) => {
    return useReadContract({
      address: contractAddress,
      abi: BeatNFTAbi,
      functionName: 'beats',
      args: [BigInt(tokenId)],
    })
  }

  const getRoyaltyInfo = (tokenId: number, salePrice: number) => {
    return useReadContract({
      address: contractAddress,
      abi: BeatNFTAbi,
      functionName: 'royaltyInfo',
      args: [BigInt(tokenId), parseEther(salePrice.toString())],
    })
  }

  return {
    getBeatInfo,
    getRoyaltyInfo,
    contractAddress
  }
}