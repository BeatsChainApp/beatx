'use client'

import { useState, useEffect } from 'react'
import { useActiveAccount } from "thirdweb/react"

export interface Proposal {
  id: string
  title: string
  description: string
  proposer: string
  status: 'active' | 'passed' | 'rejected' | 'executed'
  votesFor: string
  votesAgainst: string
  endTime: Date
  category: 'fee' | 'feature' | 'verification' | 'dispute'
}

export interface VotingPower {
  amount: string
  source: 'beats-owned' | 'platform-tokens' | 'reputation'
}

export function useGovernance() {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [votingPower, setVotingPower] = useState<VotingPower>({ amount: '0', source: 'beats-owned' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const account = useActiveAccount(); const address = account?.address; const isConnected = !!account

  useEffect(() => {
    // Mock governance data - in real implementation, fetch from DAO contract
    const mockProposals: Proposal[] = [
      {
        id: '1',
        title: 'Reduce Platform Fee to 2%',
        description: 'Proposal to reduce the platform fee from 2.5% to 2% to attract more producers',
        proposer: '0x123...abc',
        status: 'active',
        votesFor: '1250000',
        votesAgainst: '750000',
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        category: 'fee'
      },
      {
        id: '2',
        title: 'Add Beat Collections Feature',
        description: 'Implement album/collection functionality for producers to group related beats',
        proposer: '0x456...def',
        status: 'active',
        votesFor: '2100000',
        votesAgainst: '300000',
        endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        category: 'feature'
      },
      {
        id: '3',
        title: 'Producer Verification System',
        description: 'Establish criteria and process for verified producer badges',
        proposer: '0x789...ghi',
        status: 'passed',
        votesFor: '3200000',
        votesAgainst: '800000',
        endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        category: 'verification'
      }
    ]

    setProposals(mockProposals)

    // Calculate voting power based on user's beats and activity
    if (isConnected && address) {
      // Mock calculation - in real implementation, query contracts
      setVotingPower({
        amount: '15000', // Based on beats owned + platform activity
        source: 'beats-owned'
      })
    }

    setLoading(false)
  }, [address, isConnected])

  const vote = async (proposalId: string, support: boolean): Promise<boolean> => {
    if (!isConnected || !address) {
      setError('Wallet not connected')
      return false
    }

    try {
      setError(null)
      
      // In real implementation, call DAO contract vote function
      console.log('Voting on proposal:', proposalId, 'Support:', support)
      
      // Update local state
      setProposals(prev => prev.map(proposal => {
        if (proposal.id === proposalId) {
          const votePower = parseFloat(votingPower.amount)
          return {
            ...proposal,
            votesFor: support 
              ? (parseFloat(proposal.votesFor) + votePower).toString()
              : proposal.votesFor,
            votesAgainst: !support 
              ? (parseFloat(proposal.votesAgainst) + votePower).toString()
              : proposal.votesAgainst
          }
        }
        return proposal
      }))

      return true
    } catch (err: any) {
      setError(err.message || 'Voting failed')
      return false
    }
  }

  const createProposal = async (
    title: string,
    description: string,
    category: Proposal['category']
  ): Promise<string | null> => {
    if (!isConnected || !address) {
      setError('Wallet not connected')
      return null
    }

    try {
      setError(null)
      
      const newProposal: Proposal = {
        id: Date.now().toString(),
        title,
        description,
        proposer: address,
        status: 'active',
        votesFor: '0',
        votesAgainst: '0',
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        category
      }

      setProposals(prev => [newProposal, ...prev])
      return newProposal.id
    } catch (err: any) {
      setError(err.message || 'Proposal creation failed')
      return null
    }
  }

  const getActiveProposals = () => {
    return proposals.filter(p => p.status === 'active')
  }

  const getUserVotes = (proposalId: string) => {
    // In real implementation, query user's vote history
    return null
  }

  const calculateVotePercentage = (proposal: Proposal) => {
    const total = parseFloat(proposal.votesFor) + parseFloat(proposal.votesAgainst)
    if (total === 0) return { for: 0, against: 0 }
    
    return {
      for: (parseFloat(proposal.votesFor) / total) * 100,
      against: (parseFloat(proposal.votesAgainst) / total) * 100
    }
  }

  return {
    proposals,
    votingPower,
    loading,
    error,
    vote,
    createProposal,
    getActiveProposals,
    getUserVotes,
    calculateVotePercentage
  }
}