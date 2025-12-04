'use client'

import { useState, useRef, useEffect } from 'react'
import { trackUserBehavior } from '@/utils/trackUserBehavior'
import { useActiveAccount } from 'thirdweb/react'

interface MobileBeatPlayerProps {
  beat: {
    id: string
    title: string
    stageName: string
    audioUrl: string
    coverImageUrl?: string
    price: number
  }
  autoPlay?: boolean
}

export default function MobileBeatPlayer({ beat, autoPlay = false }: MobileBeatPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [loading, setLoading] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const account = useActiveAccount()
  const address = account?.address

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
      setLoading(false)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    const handleLoadStart = () => setLoading(true)
    const handleCanPlay = () => setLoading(false)

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('loadstart', handleLoadStart)
    audio.addEventListener('canplay', handleCanPlay)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('loadstart', handleLoadStart)
      audio.removeEventListener('canplay', handleCanPlay)
    }
  }, [])

  const togglePlay = async () => {
    const audio = audioRef.current
    if (!audio) return

    try {
      if (isPlaying) {
        audio.pause()
        setIsPlaying(false)
      } else {
        await audio.play()
        setIsPlaying(true)
        
        // Track play event
        if (address) {
          trackUserBehavior({
            userId: address,
            beatId: beat.id,
            type: 'play',
            source: 'browse'
          })
        }
      }
    } catch (error) {
      console.error('Audio play failed:', error)
      setLoading(false)
    }
  }

  const handleSeek = (e: React.TouchEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    if (!audio || !duration) return

    const rect = e.currentTarget.getBoundingClientRect()
    const touch = e.touches[0]
    const percent = (touch.clientX - rect.left) / rect.width
    const newTime = percent * duration
    
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
      borderRadius: '1rem',
      padding: '1rem',
      color: 'white',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <audio
        ref={audioRef}
        src={beat.audioUrl}
        preload="metadata"
      />
      
      {/* Beat Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '0.5rem',
          background: beat.coverImageUrl ? `url(${beat.coverImageUrl})` : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.25rem'
        }}>
          {!beat.coverImageUrl && '🎵'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{ 
            margin: 0, 
            fontSize: '1rem', 
            fontWeight: '600',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {beat.title}
          </h4>
          <p style={{ 
            margin: 0, 
            fontSize: '0.875rem', 
            opacity: 0.8,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {beat.stageName}
          </p>
        </div>
        <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#10b981' }}>
          {beat.price.toFixed(3)} ETH
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={togglePlay}
          disabled={loading}
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: loading ? '#6b7280' : '#3b82f6',
            border: 'none',
            color: 'white',
            fontSize: '1.25rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
        >
          {loading ? '⏳' : isPlaying ? '⏸️' : '▶️'}
        </button>
        
        {/* Progress Bar */}
        <div style={{ flex: 1 }}>
          <div
            onTouchStart={handleSeek}
            onTouchMove={handleSeek}
            style={{
              height: '4px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '2px',
              cursor: 'pointer',
              position: 'relative',
              marginBottom: '0.25rem'
            }}
          >
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: '#3b82f6',
                borderRadius: '2px',
                transition: 'width 0.1s'
              }}
            />
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            fontSize: '0.75rem', 
            opacity: 0.8 
          }}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}