'use client'

import { useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { useFileUpload } from '@/hooks/useFileUpload.enhanced'
import { useWeb3Auth } from '@/hooks/useWeb3Auth'
import { useBeatNFT } from '@/hooks/useBeatNFT.enhanced'
import { useEnhancedToast } from '@/hooks/useToast.enhanced'

// Replicate Extension's 6-Step Workflow
const WORKFLOW_STEPS = [
  { id: 'upload', title: 'Upload Audio', icon: '🎵' },
  { id: 'licensing', title: 'Generate License', icon: '⚖️' },
  { id: 'isrc', title: 'ISRC Generation', icon: '🏷️' },
  { id: 'professional', title: 'Professional Services', icon: '🎯' },
  { id: 'minting', title: 'NFT Minting', icon: '💎' },
  { id: 'success', title: 'Complete', icon: '✅' }
]

export default function EnhancedBeatUpload() {
  const [mounted, setMounted] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    title: '', stageName: '', genre: 'hip-hop', bpm: 120, key: 'C', price: 0.05,
    // Professional metadata fields
    album: '', releaseYear: new Date().getFullYear(), recordLabel: '',
    mood: 'neutral', energy: 5, timeSignature: '4/4',
    language: 'en', explicit: false, description: '',
    producer: '', mixer: '', copyrightHolder: '',
    featuredArtists: '', tags: ''
  })
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [coverArt, setCoverArt] = useState<File | null>(null)
  const [coverArtPreview, setCoverArtPreview] = useState<string>('')
  const [isrcCode, setIsrcCode] = useState('')
  const [licenseTerms, setLicenseTerms] = useState('')
  const [professionalServices, setProfessionalServices] = useState<any>(null)

  // Safe hook usage with try-catch
  let user = null
  let uploadBeatAudio = () => Promise.reject('Upload not available')
  let canUpload = false
  let success = (msg) => console.log('Success:', msg)
  let error = (msg) => console.error('Error:', msg)
  
  try {
    const authHook = useWeb3Auth()
    user = authHook?.user || null
  } catch (e) {
    console.warn('Auth hook failed:', e)
  }
  
  try {
    const uploadHook = useFileUpload()
    uploadBeatAudio = uploadHook?.uploadBeatAudio || uploadBeatAudio
  } catch (e) {
    console.warn('Upload hook failed:', e)
  }
  
  try {
    const nftHook = useBeatNFT()
    canUpload = nftHook?.canUpload || false
  } catch (e) {
    console.warn('NFT hook failed:', e)
  }
  
  try {
    const toastHook = useEnhancedToast()
    success = toastHook?.success || success
    error = toastHook?.error || error
  } catch (e) {
    console.warn('Toast hook failed:', e)
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
      </div>
    )
  }

  // Safe dropzone usage
  let getRootProps = () => ({})
  let getInputProps = () => ({})
  
  try {
    const dropzoneHook = useDropzone({
      accept: { 'audio/*': ['.mp3', '.wav', '.m4a'] },
      maxFiles: 1,
      onDrop: (files) => {
        if (files && files[0]) {
          setAudioFile(files[0])
        }
      },
      onError: (error) => {
        console.error('Dropzone error:', error)
        error('File upload failed')
      }
    })
    
    getRootProps = dropzoneHook.getRootProps
    getInputProps = dropzoneHook.getInputProps
  } catch (e) {
    console.warn('Dropzone hook failed:', e)
  }

  const handleCoverArtUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setCoverArt(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setCoverArtPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const generateLicense = async () => {
    const template = `BEATSCHAIN MUSIC NFT LICENSING AGREEMENT

Track: ${formData.title}
Artist: ${formData.stageName}
Genre: ${formData.genre}
BPM: ${formData.bpm}

GRANT OF RIGHTS: Non-exclusive perpetual license for worldwide distribution.
INCLUDED RIGHTS: Synchronization, mechanical, performance, derivative works.

Generated: ${new Date().toLocaleString()}`
    
    setLicenseTerms(template)
    setCurrentStep(2)
  }

  const generateISRC = async () => {
    try {
      const mcpUrl = process.env.NEXT_PUBLIC_MCP_SERVER_URL
      if (!mcpUrl) {
        throw new Error('MCP server not configured')
      }
      
      const response = await fetch(`${mcpUrl}/api/isrc/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackTitle: formData.title,
          artistName: formData.stageName || 'Unknown Artist'
        })
      })
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }
      
      const result = await response.json()
      if (result.success && result.isrc) {
        setIsrcCode(result.isrc)
        setCurrentStep(3)
        success('ISRC generated successfully!')
        return
      }
      
      throw new Error('Invalid response from server')
    } catch (err) {
      console.warn('ISRC generation failed:', err)
      // Generate fallback ISRC
      const year = new Date().getFullYear().toString().slice(-2)
      const sequence = String(Date.now()).slice(-5)
      const fallbackISRC = `ZA-80G-${year}-${sequence}`
      
      setIsrcCode(fallbackISRC)
      setCurrentStep(3)
      error('MCP server unavailable, using fallback ISRC')
    }
  }

  const addProfessionalServices = () => {
    const services = {
      isrc: { code: isrcCode, professional: true },
      sponsorRevenue: 2.50,
      audioAnalysis: { format: audioFile?.type, size: audioFile?.size }
    }
    setProfessionalServices(services)
    setCurrentStep(4)
  }

  const mintNFT = async () => {
    if (!audioFile) return
    
    try {
      // Generate beat ID first
      const beatId = Date.now().toString()
      
      // Upload audio to IPFS
      const audioUrl = await uploadBeatAudio(audioFile, beatId)
      
      // Upload cover art to IPFS if provided
      let coverArtUrl = ''
      if (coverArt) {
        try {
          const coverFormData = new FormData()
          coverFormData.append('file', coverArt)
          coverFormData.append('platform', 'app')
          coverFormData.append('metadata', JSON.stringify({
            type: 'cover_art',
            track_title: formData.title,
            artist: formData.stageName
          }))
          
          const coverResponse = await fetch(`${process.env.NEXT_PUBLIC_MCP_SERVER_URL}/api/upload`, {
            method: 'POST',
            body: coverFormData
          })
          
          if (coverResponse.ok) {
            const coverResult = await coverResponse.json()
            coverArtUrl = coverResult.file.url || `https://gateway.pinata.cloud/ipfs/${coverResult.file.cid}`
          }
        } catch (coverError) {
          console.warn('Cover art upload failed:', coverError)
          error('Cover art upload failed, continuing without custom artwork')
        }
      }
      
      const metadata = {
        name: formData.title,
        description: formData.description || `${formData.title} by ${formData.stageName}`,
        image: coverArtUrl || `https://via.placeholder.com/400x400/1f2937/ffffff?text=${encodeURIComponent(formData.title)}`,
        audio: audioUrl,
        attributes: [
          // Basic Info
          { trait_type: 'Artist', value: formData.stageName },
          { trait_type: 'Album', value: formData.album },
          { trait_type: 'Release Year', value: formData.releaseYear },
          { trait_type: 'Record Label', value: formData.recordLabel || 'Independent' },
          
          // Musical Properties
          { trait_type: 'Genre', value: formData.genre },
          { trait_type: 'BPM', value: formData.bpm },
          { trait_type: 'Key', value: formData.key },
          { trait_type: 'Mood', value: formData.mood },
          { trait_type: 'Energy Level', value: formData.energy },
          { trait_type: 'Time Signature', value: formData.timeSignature },
          
          // Credits
          { trait_type: 'Producer', value: formData.producer || 'Not specified' },
          { trait_type: 'Mixer', value: formData.mixer || 'Not specified' },
          { trait_type: 'Featured Artists', value: formData.featuredArtists || 'None' },
          
          // Technical & Legal
          { trait_type: 'Language', value: formData.language },
          { trait_type: 'Explicit', value: formData.explicit ? 'Yes' : 'No' },
          { trait_type: 'Cover Art', value: coverArtUrl ? 'Custom' : 'Generated' },
          { trait_type: 'ISRC', value: isrcCode },
          { trait_type: 'Professional Services', value: 'Yes' },
          { trait_type: 'Sponsor Revenue', value: '$2.50' }
        ],
        // Extended metadata
        professional_metadata: {
          album: formData.album,
          release_year: formData.releaseYear,
          record_label: formData.recordLabel,
          mood: formData.mood,
          energy: formData.energy,
          time_signature: formData.timeSignature,
          language: formData.language,
          explicit: formData.explicit,
          description: formData.description,
          tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
          cover_art_url: coverArtUrl,
          has_custom_artwork: !!coverArtUrl,
          credits: {
            producer: formData.producer,
            mixer: formData.mixer,
            featured_artists: formData.featuredArtists ? formData.featuredArtists.split(',').map(artist => artist.trim()) : [],
            copyright_holder: formData.copyrightHolder || formData.stageName
          }
        },
        license: licenseTerms,
        isrc: isrcCode,
        professionalServices
      }

      // Persist metadata via MCP /api/beats (preferred). If MCP not available, fallback to localStorage.
      let metadataUri = `local:${beatId}`
      try {
        const mcpUrl = process.env.NEXT_PUBLIC_MCP_SERVER_URL
        if (!mcpUrl) throw new Error('MCP server not configured')

        const beatPayload = {
          beat_id: beatId,
          title: formData.title,
          artist: formData.stageName,
          producer_address: user?.address || null,
          metadata,
          audio_url: audioUrl,
          cover_url: coverArtUrl || null,
          isrc: isrcCode,
          bpm: formData.bpm,
          genre: formData.genre,
          professional: !!professionalServices,
          created_at: new Date().toISOString()
        }

        const beatResp = await fetch(`${mcpUrl.replace(/\/$/, '')}/api/beats`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(beatPayload)
        })

        if (beatResp.ok) {
          const beatJson = await beatResp.json()
          if (beatJson && beatJson.success && beatJson.beat) {
            // Use MCP beat id as canonical metadata URI reference
            metadataUri = `mcp:${beatJson.beat.id || beatJson.beat.beat_id || beatJson.beat.id}`
          }
        } else {
          console.warn('MCP beat creation returned non-ok:', beatResp.status)
        }
      } catch (persistErr) {
        console.warn('Failed to persist beat metadata to MCP, falling back to localStorage:', persistErr?.message || persistErr)
        try {
          const metadataKey = `beat_metadata_${beatId}`
          localStorage.setItem(metadataKey, JSON.stringify(metadata))
        } catch (e) {
          console.warn('Failed to persist metadata to localStorage:', e?.message || e)
        }
      }

      // Attempt gasless minting with enhanced metadataUri (MCP beat id preferred)
      const mintResponse = await fetch('/api/mint-beat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          producer: user?.address,
          metadataUri,
          price: formData.price,
          genre: formData.genre,
          bpm: formData.bpm,
          key: formData.key,
          creditsToUse: 1
        })
      })

      if (mintResponse.ok) {
        const mintResult = await mintResponse.json()
        console.log('Mint successful:', mintResult)
        setCurrentStep(5)
        success('NFT minted successfully with professional services!')
      } else {
        const errorResult = await mintResponse.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Mint failed:', errorResult)
        throw new Error(errorResult.error || 'Minting failed')
      }
      } catch (err) {
        console.error('Minting error:', err)
        error(`Minting failed: ${err.message}. Beat retained locally as fallback.`)

        // Store the complete beat data locally as backup (best-effort)
        try {
          const beatBackup = {
            id: beatId,
            title: formData.title,
            artist: formData.stageName,
            metadata,
            audioUrl,
            coverArtUrl,
            isrc: isrcCode,
            createdAt: new Date().toISOString(),
            status: 'local_only'
          }
          const backupKey = `beat_backup_${beatId}`
          localStorage.setItem(backupKey, JSON.stringify(beatBackup))
        } catch (storageErr) {
          console.warn('Failed to persist beat backup locally:', storageErr?.message || storageErr)
        }
      }
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
      {/* Hero Section */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        borderRadius: '1rem', 
        padding: '2rem', 
        marginBottom: '2rem',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <a 
            href="/dashboard" 
            style={{ 
              color: 'white', 
              textDecoration: 'none', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              fontSize: '0.9rem'
            }}
          >
            ← Back to Dashboard
          </a>
          <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>Professional Upload</span>
        </div>
        <h1 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>🎵 Upload Your Beat</h1>
        <p style={{ fontSize: '1.1rem', opacity: 0.9, margin: 0 }}>Create professional, distribution-ready tracks with comprehensive metadata</p>
      </div>
      {/* Workflow Progress */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          {WORKFLOW_STEPS.map((step, index) => (
            <div key={step.id} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              opacity: index <= currentStep ? 1 : 0.5
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: index <= currentStep ? '#10b981' : '#e5e7eb',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: '1.2rem'
              }}>
                {index < currentStep ? '✓' : step.icon}
              </div>
              <span style={{ fontSize: '0.75rem', marginTop: '0.5rem', textAlign: 'center' }}>
                {step.title}
              </span>
            </div>
          ))}
        </div>
        <div style={{ height: '4px', background: '#e5e7eb', borderRadius: '2px' }}>
          <div style={{
            height: '100%', background: '#10b981', borderRadius: '2px',
            width: `${(currentStep / (WORKFLOW_STEPS.length - 1)) * 100}%`,
            transition: 'width 0.3s'
          }} />
        </div>
      </div>

      {/* Step Content */}
      {currentStep === 0 && (
        <div>
          <h2>🎵 Upload Audio & Complete Metadata</h2>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Upload your audio file and fill in all metadata fields to create a professional, distribution-ready track.</p>
          
          <div {...getRootProps()} style={{
            border: '2px dashed #d1d5db', borderRadius: '0.5rem', padding: '2rem',
            textAlign: 'center', cursor: 'pointer', background: audioFile ? '#f0fdf4' : '#f9fafb',
            marginBottom: '1.5rem'
          }}>
            <input {...getInputProps()} />
            {audioFile ? (
              <div>
                <p style={{ color: '#059669', fontWeight: '500' }}>✓ {audioFile.name}</p>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                  {(audioFile.size / (1024 * 1024)).toFixed(1)} MB • {audioFile.type}
                </p>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Drop audio file here or click to browse</p>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Supports MP3, WAV, M4A, AAC</p>
              </div>
            )}
          </div>

          {/* Professional Metadata Form - Always Visible */}
          <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: '#1f2937', fontSize: '1.1rem' }}>📋 Professional Metadata</h3>
            
            {/* Basic Info */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ margin: '0 0 0.75rem 0', color: '#374151', fontSize: '0.9rem', fontWeight: '600' }}>Basic Information</h4>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '1rem', 
                marginBottom: '1rem' 
              }}>
                <input
                  placeholder="Track Title *"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', background: 'white' }}
                  required
                />
                <input
                  placeholder="Artist/Stage Name *"
                  value={formData.stageName}
                  onChange={(e) => setFormData({...formData, stageName: e.target.value})}
                  style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', background: 'white' }}
                  required
                />
              </div>
            </div>
            
            {/* Album & Release Info */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ margin: '0 0 0.75rem 0', color: '#374151', fontSize: '0.9rem', fontWeight: '600' }}>Release Information</h4>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '1rem' 
              }}>
                <input
                  placeholder="Album/EP Name"
                  value={formData.album}
                  onChange={(e) => setFormData({...formData, album: e.target.value})}
                  style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', background: 'white' }}
                />
                <input
                  type="number"
                  placeholder="Release Year"
                  value={formData.releaseYear}
                  onChange={(e) => setFormData({...formData, releaseYear: parseInt(e.target.value)})}
                  style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', background: 'white' }}
                />
                <input
                  placeholder="Record Label"
                  value={formData.recordLabel}
                  onChange={(e) => setFormData({...formData, recordLabel: e.target.value})}
                  style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', background: 'white' }}
                />
              </div>
            </div>
            
            {/* Musical Properties */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ margin: '0 0 0.75rem 0', color: '#374151', fontSize: '0.9rem', fontWeight: '600' }}>Musical Properties</h4>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                gap: '1rem' 
              }}>
                <select
                  value={formData.genre}
                  onChange={(e) => setFormData({...formData, genre: e.target.value})}
                  style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', background: 'white' }}
                >
                  <option value="hip-hop">Hip-Hop</option>
                  <option value="electronic">Electronic</option>
                  <option value="pop">Pop</option>
                  <option value="rock">Rock</option>
                  <option value="jazz">Jazz</option>
                  <option value="classical">Classical</option>
                  <option value="country">Country</option>
                  <option value="r&b">R&B</option>
                </select>
                <input
                  type="number"
                  placeholder="BPM"
                  value={formData.bpm}
                  onChange={(e) => setFormData({...formData, bpm: parseInt(e.target.value)})}
                  style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', background: 'white' }}
                />
                <select
                  value={formData.key}
                  onChange={(e) => setFormData({...formData, key: e.target.value})}
                  style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', background: 'white' }}
                >
                  <option value="C">C Major</option>
                  <option value="C#">C# Major</option>
                  <option value="D">D Major</option>
                  <option value="D#">D# Major</option>
                  <option value="E">E Major</option>
                  <option value="F">F Major</option>
                  <option value="F#">F# Major</option>
                  <option value="G">G Major</option>
                  <option value="G#">G# Major</option>
                  <option value="A">A Major</option>
                  <option value="A#">A# Major</option>
                  <option value="B">B Major</option>
                  <option value="Cm">C Minor</option>
                  <option value="Am">A Minor</option>
                </select>
                <select
                  value={formData.mood}
                  onChange={(e) => setFormData({...formData, mood: e.target.value})}
                  style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', background: 'white' }}
                >
                  <option value="neutral">Neutral</option>
                  <option value="energetic">Energetic</option>
                  <option value="calm">Calm</option>
                  <option value="dark">Dark</option>
                  <option value="uplifting">Uplifting</option>
                  <option value="melancholic">Melancholic</option>
                  <option value="aggressive">Aggressive</option>
                </select>
              </div>
            </div>
            
            {/* Credits & Collaborations */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ margin: '0 0 0.75rem 0', color: '#374151', fontSize: '0.9rem', fontWeight: '600' }}>Credits & Collaborations</h4>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '1rem' 
              }}>
                <input
                  placeholder="Producer"
                  value={formData.producer}
                  onChange={(e) => setFormData({...formData, producer: e.target.value})}
                  style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', background: 'white' }}
                />
                <input
                  placeholder="Mixer/Engineer"
                  value={formData.mixer}
                  onChange={(e) => setFormData({...formData, mixer: e.target.value})}
                  style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', background: 'white' }}
                />
                <input
                  placeholder="Featured Artists"
                  value={formData.featuredArtists}
                  onChange={(e) => setFormData({...formData, featuredArtists: e.target.value})}
                  style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', background: 'white' }}
                />
              </div>
            </div>
            
            {/* Description & Tags */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ margin: '0 0 0.75rem 0', color: '#374151', fontSize: '0.9rem', fontWeight: '600' }}>Description & Tags</h4>
              <textarea
                placeholder="Track Description (for marketing and distribution)"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', resize: 'vertical', background: 'white', marginBottom: '1rem' }}
              />
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '1rem' 
              }}>
                <input
                  placeholder="Tags (comma-separated)"
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', background: 'white' }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={formData.explicit}
                      onChange={(e) => setFormData({...formData, explicit: e.target.checked})}
                    />
                    Explicit Content
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({...formData, language: e.target.value})}
                    style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', background: 'white' }}
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="it">Italian</option>
                    <option value="pt">Portuguese</option>
                    <option value="ja">Japanese</option>
                    <option value="ko">Korean</option>
                    <option value="zh">Chinese</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Cover Art Upload */}
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ margin: '0 0 0.75rem 0', color: '#374151', fontSize: '0.9rem', fontWeight: '600' }}>🎨 Cover Art</h4>
              <div style={{ 
                display: 'flex', 
                gap: '1rem', 
                alignItems: 'flex-start', 
                padding: '1rem', 
                border: '1px solid #e5e7eb', 
                borderRadius: '0.5rem', 
                background: 'white' 
              }}>
                <div style={{ flex: '1' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverArtUpload}
                    style={{ 
                      padding: '0.75rem', 
                      border: '1px solid #d1d5db', 
                      borderRadius: '0.375rem',
                      width: '100%',
                      background: '#f9fafb'
                    }}
                  />
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.5rem 0 0 0' }}>
                    JPG, PNG recommended. 1400x1400px minimum for best quality.
                  </p>
                </div>
                {coverArtPreview ? (
                  <div style={{ 
                    width: '100px', 
                    height: '100px', 
                    border: '2px solid #10b981', 
                    borderRadius: '0.5rem',
                    overflow: 'hidden',
                    background: 'white'
                  }}>
                    <img 
                      src={coverArtPreview} 
                      alt="Cover art preview" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                ) : (
                  <div style={{ 
                    width: '100px', 
                    height: '100px', 
                    border: '2px dashed #d1d5db', 
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f9fafb',
                    color: '#9ca3af',
                    fontSize: '2rem'
                  }}>
                    🎨
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Continue Button */}
          {(audioFile && formData.title && formData.stageName) && (
            <button
              onClick={() => setCurrentStep(1)}
              style={{
                background: '#10b981', color: 'white', padding: '0.75rem 1.5rem',
                border: 'none', borderRadius: '0.375rem', cursor: 'pointer',
                marginTop: '1.5rem', fontSize: '1rem', fontWeight: '500'
              }}
            >
              Continue to License Generation →
            </button>
          )}
        </div>
      )}

      {currentStep === 1 && (
        <div>
          <h2>⚖️ Generate License Agreement</h2>
          <p>Professional licensing terms will be generated for your track.</p>
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', margin: '1rem 0' }}>
            <strong>Track:</strong> {formData.title}<br/>
            <strong>Artist:</strong> {formData.stageName}<br/>
            <strong>License Type:</strong> Non-exclusive perpetual
          </div>
          <button
            onClick={generateLicense}
            style={{
              background: '#3b82f6', color: 'white', padding: '0.75rem 1.5rem',
              border: 'none', borderRadius: '0.375rem', cursor: 'pointer'
            }}
          >
            Generate Professional License
          </button>
        </div>
      )}

      {currentStep === 2 && (
        <div>
          <h2>🏷️ ISRC Code Generation</h2>
          <p>Generate professional ISRC code for your track.</p>
          <div style={{ background: '#f0f9ff', padding: '1rem', borderRadius: '0.5rem', margin: '1rem 0' }}>
            <strong>Format:</strong> ZA-80G-YY-NNNNN (South African Standard)<br/>
            <strong>Purpose:</strong> International Standard Recording Code for royalty tracking
          </div>
          <button
            onClick={generateISRC}
            style={{
              background: '#10b981', color: 'white', padding: '0.75rem 1.5rem',
              border: 'none', borderRadius: '0.375rem', cursor: 'pointer'
            }}
          >
            Generate ISRC Code
          </button>
        </div>
      )}

      {currentStep === 3 && (
        <div>
          <h2>🎯 Professional Services</h2>
          <div style={{ background: '#fef3c7', padding: '1rem', borderRadius: '0.5rem', margin: '1rem 0' }}>
            <h3>✅ Included Services:</h3>
            <ul>
              <li>✓ ISRC Code: {isrcCode}</li>
              <li>✓ Professional License Agreement</li>
              <li>✓ Sponsor Revenue: +$2.50</li>
              <li>✓ Audio Analysis & Metadata</li>
            </ul>
          </div>
          <button
            onClick={addProfessionalServices}
            style={{
              background: '#f59e0b', color: 'white', padding: '0.75rem 1.5rem',
              border: 'none', borderRadius: '0.375rem', cursor: 'pointer'
            }}
          >
            Add Professional Services (+$2.50)
          </button>
        </div>
      )}

      {currentStep === 4 && (
        <div>
          <h2>💎 Mint NFT</h2>
          <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '0.5rem', margin: '1rem 0' }}>
            <h3>Ready to Mint:</h3>
            <p><strong>Title:</strong> {formData.title}</p>
            <p><strong>ISRC:</strong> {isrcCode}</p>
            <p><strong>Professional Services:</strong> Included (+$2.50)</p>
            <p><strong>License:</strong> Generated</p>
          </div>
          <button
            onClick={mintNFT}
            style={{
              background: '#7c3aed', color: 'white', padding: '0.75rem 1.5rem',
              border: 'none', borderRadius: '0.375rem', cursor: 'pointer'
            }}
          >
            Mint Professional NFT
          </button>
        </div>
      )}

      {currentStep === 5 && (
        <div style={{ textAlign: 'center' }}>
          <h2>✅ Upload Complete!</h2>
          <div style={{ fontSize: '4rem', margin: '1rem 0' }}>🎉</div>
          <p>Your professional NFT has been minted with:</p>
          <ul style={{ textAlign: 'left', maxWidth: '300px', margin: '0 auto' }}>
            <li>✓ ISRC Code: {isrcCode}</li>
            <li>✓ Professional License</li>
            <li>✓ Sponsor Revenue: $2.50</li>
            <li>✓ Blockchain Verification</li>
          </ul>
          <button
            onClick={() => window.location.href = '/dashboard'}
            style={{
              background: '#10b981', color: 'white', padding: '1rem 2rem',
              border: 'none', borderRadius: '0.375rem', cursor: 'pointer', marginTop: '1rem'
            }}
          >
            View in Dashboard
          </button>
        </div>
      )}
    </div>
  )
}