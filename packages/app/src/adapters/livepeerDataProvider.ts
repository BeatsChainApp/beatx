/**
 * Livepeer-First Data Provider
 * Primary: Supabase + Livepeer, Fallback: localStorage + IPFS
 */

import { Beat, Producer, DataAdapter } from '@/types/data'
import { supabaseBeats } from '@/lib/supabase.enhanced'
import { SanityAdapter } from './sanityAdapter.enhanced'

export class LivepeerDataProvider implements DataAdapter {
  private sanityAdapter: SanityAdapter

  constructor() {
    this.sanityAdapter = new SanityAdapter()
  }

  async getBeat(id: string): Promise<Beat | null> {
    // Try Supabase first
    const supabaseBeat = await supabaseBeats.getBeat(id)
    if (supabaseBeat) {
      return this.transformSupabaseBeat(supabaseBeat)
    }

    // Fallback to localStorage
    return this.getLocalBeat(id)
  }

  async getFeaturedBeats(limit = 8): Promise<Beat[]> {
    try {
      // Primary: Supabase beats (cross-user discovery)
      const supabaseBeats = await this.getSupabaseBeats(limit)
      
      // Secondary: Local beats (user's own)
      const localBeats = this.getLocalBeats()
      
      // If we have data from primary sources, use them
      if (supabaseBeats.length > 0 || localBeats.length > 0) {
        const allBeats = [
          ...supabaseBeats.map(beat => ({ ...beat, priority: 1, source: 'supabase' })),
          ...localBeats.map(beat => ({ ...beat, priority: 2, source: 'local' }))
        ]

        const uniqueBeats = allBeats
          .filter((beat, index, self) => 
            self.findIndex(b => b.id === beat.id) === index
          )
          .sort((a, b) => {
            if (a.priority !== b.priority) return a.priority - b.priority
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
          })
          .slice(0, limit)

        console.log(`✅ Web3 Data: ${supabaseBeats.length} Supabase + ${localBeats.length} Local`)
        return uniqueBeats
      }
      
      // Fallback: Sanity demo beats (only if no other data)
      console.log('📦 Using Sanity fallback beats')
      const sanityBeats = await this.sanityAdapter.getFeaturedBeats(limit)
      return sanityBeats.map(beat => ({ ...beat, source: 'sanity', isDemo: true }))
      
    } catch (error) {
      console.error('Error in getFeaturedBeats:', error)
      // Final fallback to Sanity
      try {
        const sanityBeats = await this.sanityAdapter.getFeaturedBeats(limit)
        console.log('🔄 Fallback to Sanity beats:', sanityBeats.length)
        return sanityBeats.map(beat => ({ ...beat, source: 'sanity', isDemo: true }))
      } catch (sanityError) {
        console.error('Sanity fallback failed:', sanityError)
        return []
      }
    }
  }

  async getProducer(id: string): Promise<Producer | null> {
    // For now, delegate to existing logic
    return null
  }

  async getProducerBeats(producerId: string): Promise<Beat[]> {
    // Try Supabase first
    const supabaseBeats = await supabaseBeats.getProducerBeats(producerId)
    if (supabaseBeats.length > 0) {
      return supabaseBeats.map(this.transformSupabaseBeat)
    }

    // Fallback to localStorage
    return this.getLocalBeats().filter(beat => beat.producerId === producerId)
  }

  async getAllProducers(): Promise<Producer[]> {
    return []
  }

  private async getSupabaseBeats(limit: number): Promise<Beat[]> {
    try {
      const beats = await supabaseBeats.getBeats(limit)
      return beats.map(this.transformSupabaseBeat)
    } catch (error) {
      console.warn('Supabase beats fetch failed:', error)
      return []
    }
  }

  private transformSupabaseBeat(supabaseBeat: any): Beat {
    return {
      id: supabaseBeat.beat_id,
      title: supabaseBeat.title,
      description: supabaseBeat.description || '',
      genre: supabaseBeat.genre,
      bpm: supabaseBeat.bpm || 120,
      key: supabaseBeat.key || 'C',
      price: parseFloat(supabaseBeat.price) || 0,
      producerId: supabaseBeat.producer_address,
      producerName: supabaseBeat.stage_name || 'Unknown Artist',
      audioUrl: supabaseBeat.playback_url || supabaseBeat.ipfs_audio_url || '',
      coverImageUrl: supabaseBeat.cover_image_url || '',
      tags: supabaseBeat.tags || [],
      isActive: supabaseBeat.is_active !== false,
      createdAt: new Date(supabaseBeat.created_at || Date.now()),
      // Enhanced properties
      livepeerAsset: supabaseBeat.livepeer_asset_id ? {
        id: supabaseBeat.livepeer_asset_id,
        playbackUrl: supabaseBeat.playback_url,
        optimized: supabaseBeat.optimized_playback
      } : undefined,
      optimizedPlayback: supabaseBeat.optimized_playback || false,
      professionalServices: supabaseBeat.professional_services,
      plays: supabaseBeat.plays || 0,
      source: supabaseBeat.source || 'supabase'
    }
  }

  private getLocalBeat(id: string): Beat | null {
    const localBeats = this.getLocalBeats()
    return localBeats.find(beat => beat.id === id) || null
  }

  private getLocalBeats(): Beat[] {
    if (typeof window === 'undefined') return []

    try {
      const allBeats: Beat[] = []
      
      // Get beats from all producers
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('producer_beats_')) {
          const beatsStr = localStorage.getItem(key)
          if (beatsStr) {
            const producerBeats = JSON.parse(beatsStr)
            allBeats.push(...producerBeats)
          }
        }
      }
      
      return allBeats.filter(beat => beat.isActive !== false)
    } catch (error) {
      console.error('Error getting local beats:', error)
      return []
    }
  }
}

export const livepeerDataProvider = new LivepeerDataProvider()