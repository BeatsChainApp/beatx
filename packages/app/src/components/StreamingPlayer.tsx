'use client'

import { useState, useRef, useEffect } from 'react'

interface StreamingPlayerProps {
  audioUrl: string
  livepeerPlaybackId?: string
  title: string
  artist: string
  coverArt?: string
  onPlaybackAnalytics?: (data: any) => void
}

export default function StreamingPlayer({
  audioUrl,
  livepeerPlaybackId,
  title,
  artist,
  coverArt,
  onPlaybackAnalytics
}: StreamingPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [loading, setLoading] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Priority streaming sources
  const streamingSources = [
    livepeerPlaybackId ? `https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/${livepeerPlaybackId}/index.m3u8` : null,
    audioUrl,
    `https://gateway.pinata.cloud/ipfs/${audioUrl.split('/').pop()}`
  ].filter(Boolean)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleLoadStart = () => setLoading(true)
    const handleCanPlay = () => setLoading(false)
    const handleEnded = () => {
      setIsPlaying(false)
      trackAnalytics('track_completed', { completion_rate: 100 })
    }

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('loadstart', handleLoadStart)
    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('loadstart', handleLoadStart)
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  const togglePlayback = async () => {
    const audio = audioRef.current
    if (!audio) return

    try {
      if (isPlaying) {
        audio.pause()
        trackAnalytics('track_paused', { 
          play_duration: currentTime,
          completion_rate: (currentTime / duration) * 100 
        })
      } else {
        await audio.play()
        trackAnalytics('track_played', { timestamp: currentTime })
      }
      setIsPlaying(!isPlaying)
    } catch (error) {
      console.error('Playback error:', error)
      // Try fallback source
      tryNextSource()
    }
  }

  const tryNextSource = () => {
    const audio = audioRef.current
    if (!audio) return

    const currentSrc = audio.src
    const currentIndex = streamingSources.findIndex(src => src === currentSrc)
    const nextIndex = currentIndex + 1

    if (nextIndex < streamingSources.length) {
      audio.src = streamingSources[nextIndex]
      audio.load()
      console.log('Switched to fallback source:', streamingSources[nextIndex])
    }
  }

  const seekTo = (time: number) => {
    const audio = audioRef.current
    if (!audio) return

    audio.currentTime = time
    setCurrentTime(time)
  }

  const trackAnalytics = (eventType: string, data: any) => {
    if (onPlaybackAnalytics) {
      onPlaybackAnalytics({
        event_type: eventType,
        track_title: title,
        track_artist: artist,
        ...data,
        timestamp: new Date().toISOString()
      })
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '1rem',
      padding: '1.5rem',
      color: 'white',
      maxWidth: '400px',
      margin: '0 auto'
    }}>
      <audio
        ref={audioRef}
        src={streamingSources[0]}
        preload="metadata"
      />

      {/* Track Info */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '0.5rem',
          overflow: 'hidden',
          marginRight: '1rem',
          background: 'rgba(255,255,255,0.2)'
        }}>
          {coverArt ? (
            <img 
              src={coverArt} 
              alt="Cover art" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ 
              width: '100%', 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}>
              🎵
            </div>
          )}
        </div>
        <div>
          <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem' }}>{title}</h3>
          <p style={{ margin: 0, opacity: 0.8, fontSize: '0.9rem' }}>{artist}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{
          width: '100%',
          height: '4px',
          background: 'rgba(255,255,255,0.3)',
          borderRadius: '2px',
          cursor: 'pointer'
        }}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const clickX = e.clientX - rect.left
          const newTime = (clickX / rect.width) * duration
          seekTo(newTime)
        }}>
          <div style={{
            width: `${duration ? (currentTime / duration) * 100 : 0}%`,
            height: '100%',
            background: 'white',
            borderRadius: '2px',
            transition: 'width 0.1s'
          }} />
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          fontSize: '0.75rem', 
          marginTop: '0.25rem',
          opacity: 0.8
        }}>
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <button
          onClick={togglePlayback}
          disabled={loading}
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            border: 'none',
            background: 'white',
            color: '#667eea',
            fontSize: '1.2rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? '⏳' : isPlaying ? '⏸️' : '▶️'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem' }}>🔊</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => {
              const newVolume = parseFloat(e.target.value)
              setVolume(newVolume)
              if (audioRef.current) {
                audioRef.current.volume = newVolume
              }
            }}
            style={{
              width: '80px',
              accentColor: 'white'
            }}
          />
        </div>
      </div>

      {/* Streaming Info */}
      <div style={{ 
        marginTop: '1rem', 
        fontSize: '0.7rem', 
        opacity: 0.6, 
        textAlign: 'center' 
      }}>
        {livepeerPlaybackId ? '🎬 Livepeer HLS' : '📁 IPFS Gateway'}
      </div>
    </div>
  )
}