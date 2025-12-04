'use client'

import { useState, useEffect } from 'react'
import { useContentCreator } from './useContentCreator'
import { useActiveAccount } from "thirdweb/react"

interface CollaborationMatch {
  id: string
  producerAddress: string
  producerName: string
  matchScore: number
  sharedGenres: string[]
  compatibilityReasons: string[]
  avgBeatPrice: number
  responseRate: number
}

interface CollaborationProject {
  id: string
  name: string
  participants: string[]
  beatNftIds: string[]
  revenueShares: { [address: string]: number }
  status: 'active' | 'completed' | 'cancelled'
  totalRevenue: number
  createdAt: Date
}

export function useCollaboration() {
  const { creator } = useContentCreator()
  const account = useActiveAccount()
  const address = account?.address
  const [matches, setMatches] = useState<CollaborationMatch[]>([])
  const [projects, setProjects] = useState<CollaborationProject[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (creator) {
      generateMatches()
      loadProjects()
    }
  }, [creator])

  const generateMatches = async () => {
    if (!creator) return
    
    setLoading(true)
    try {
      // Load real producer data from platform
      const producers = JSON.parse(localStorage.getItem('platform_producers') || '[]')
      const negotiations = JSON.parse(localStorage.getItem('pending_negotiations') || '[]')
      
      // Calculate real matches based on actual data
      const realMatches = producers
        .filter((producer: any) => producer.walletAddress !== creator.walletAddress)
        .map((producer: any) => {
          const sharedGenres = getSharedGenres(creator, producer)
          const matchScore = calculateMatchScore(creator, producer, negotiations)
          
          return {
            id: `match_${producer.walletAddress}`,
            producerAddress: producer.walletAddress,
            producerName: producer.stageName || producer.displayName,
            matchScore,
            sharedGenres,
            compatibilityReasons: getCompatibilityReasons(matchScore),
            avgBeatPrice: producer.avgPrice || 100,
            responseRate: producer.responseRate || 75
          }
        })
        .filter((match: CollaborationMatch) => match.matchScore > 60)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 5)
      
      setMatches(realMatches)
    } catch (error) {
      console.error('Failed to generate matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSharedGenres = (creator: any, producer: any): string[] => {
    const creatorGenres = creator.preferredGenres || ['Hip Hop']
    const producerGenres = producer.genres || ['Hip Hop']
    return creatorGenres.filter((genre: string) => producerGenres.includes(genre))
  }

  const calculateMatchScore = (creator: any, producer: any, negotiations: any[]): number => {
    let score = 50 // Base score
    
    // Genre compatibility
    const sharedGenres = getSharedGenres(creator, producer)
    score += sharedGenres.length * 10
    
    // Creator tier bonus
    const tierBonus = { platinum: 20, gold: 15, silver: 10, bronze: 5 }
    score += tierBonus[creator.verificationTier as keyof typeof tierBonus] || 0
    
    // Success history with similar creators
    const successfulNegotiations = negotiations.filter((n: any) => 
      n.producerId === producer.walletAddress && n.status === 'accepted'
    ).length
    score += Math.min(successfulNegotiations * 5, 20)
    
    return Math.min(score, 100)
  }

  const getCompatibilityReasons = (score: number): string[] => {
    const reasons = []
    if (score >= 90) reasons.push('Excellent genre compatibility')
    if (score >= 80) reasons.push('High success rate with creators')
    if (score >= 70) reasons.push('Good pricing alignment')
    return reasons
  }

  const loadProjects = async () => {
    try {
      const stored = localStorage.getItem(`collaboration_projects_${address}`) || '[]'
      const projectData = JSON.parse(stored)
      setProjects(projectData)
    } catch (error) {
      console.error('Failed to load projects:', error)
    }
  }

  const createProject = async (
    name: string,
    participants: string[],
    revenueShares: { [address: string]: number }
  ): Promise<boolean> => {
    if (!address) return false
    
    try {
      const project: CollaborationProject = {
        id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        participants: [address, ...participants],
        beatNftIds: [],
        revenueShares: { [address]: revenueShares[address] || 50, ...revenueShares },
        status: 'active',
        totalRevenue: 0,
        createdAt: new Date()
      }
      
      const updatedProjects = [...projects, project]
      setProjects(updatedProjects)
      localStorage.setItem(`collaboration_projects_${address}`, JSON.stringify(updatedProjects))
      
      return true
    } catch (error) {
      console.error('Failed to create project:', error)
      return false
    }
  }

  const addBeatToProject = async (projectId: string, beatNftId: string): Promise<boolean> => {
    try {
      const updatedProjects = projects.map(project => 
        project.id === projectId 
          ? { ...project, beatNftIds: [...project.beatNftIds, beatNftId] }
          : project
      )
      
      setProjects(updatedProjects)
      localStorage.setItem(`collaboration_projects_${address}`, JSON.stringify(updatedProjects))
      return true
    } catch (error) {
      console.error('Failed to add beat to project:', error)
      return false
    }
  }

  const calculateProjectROI = (project: CollaborationProject): number => {
    const userShare = project.revenueShares[address || ''] || 0
    return (project.totalRevenue * userShare) / 100
  }

  return {
    matches,
    projects,
    loading,
    generateMatches,
    createProject,
    addBeatToProject,
    calculateProjectROI
  }
}