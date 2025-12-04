'use client'

import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useFileUpload } from '@/hooks/useFileUpload.enhanced'
import { useWeb3Beats } from '@/hooks/useWeb3Beats'
import { useWeb3Auth } from '@/hooks/useWeb3Auth'
import { useBeatNFT } from '@/hooks/useBeatNFT.enhanced'
import { useIPFS } from '@/hooks/useIPFS'
// TODO: Replace with Thirdweb contract interactions
import { BeatNFTConfig } from '@/contracts/BeatNFT'
import { parseEther } from 'viem'
import BuyBeatNFTModal from '@/components/BuyBeatNFTModal'
import RequestCreditsModal from '@/components/RequestCreditsModal'
import LicenseSelector from '@/components/LicenseSelector'
import ProtectedRoute from '@/components/ProtectedRoute'
import { BackToDashboard } from '@/components/BackToDashboard'
import { useEnhancedToast } from '@/hooks/useToast.enhanced'
import { EnvironmentStatus } from '@/components/EnvironmentStatus'
import { UploadDiagnostics } from '@/components/UploadDiagnostics'
import ProfessionalServices from '@/components/ProfessionalServices'
import { useLivepeer } from '@/hooks/useLivepeer'
import { useSupabase } from '@/hooks/useSupabase'
import EnhancedAudioPlayer from '@/components/EnhancedAudioPlayer'

export default function BeatUpload() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: 'hip-hop',
    bpm: 120,
    key: 'C',
    price: 0.05,
    tags: '',
    stageName: ''
  })
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [selectedLicense, setSelectedLicense] = useState('BASIC')
  const [submitting, setSubmitting] = useState(false)
  const [showBuyModal, setShowBuyModal] = useState(false)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [showProfessionalServices, setShowProfessionalServices] = useState(false)
  const [professionalServices, setProfessionalServices] = useState<any>(null)
  const [livepeerAsset, setLivepeerAsset] = useState<any>(null)
  const [useOptimizedPlayback, setUseOptimizedPlayback] = useState(true)

  const { user, isAuthenticated } = useWeb3Auth()
  const { uploadBeatAudio, uploadCoverImage, uploading, progress, error, currentOperation } = useFileUpload()
  const { refreshBeats } = useWeb3Beats()
  const { balance, canUpload, useCredits, isConnected } = useBeatNFT()
  const { success, error: showError } = useEnhancedToast()
  const { uploadMetadata } = useIPFS()
  // TODO: Implement with Thirdweb
  const writeContract = () => {}
  const { uploadFile: uploadToLivepeer, createAssetFromIPFS, getPlaybackUrl, isOptimizedPlayback } = useLivepeer()
  const { isAvailable: supabaseAvailable, logSuccess, trackCredit, saveISRC } = useSupabase()
  const [mintTxHash, setMintTxHash] = useState<string | null>(null)
  
  const { data: mintReceipt } = useWaitForTransactionReceipt({
    hash: mintTxHash as `0x${string}`,
  })

  const handleProfessionalServicesComplete = (services: any) => {
    setProfessionalServices(services)
    // Track revenue if sponsor content enabled
    if (services.sponsorContent?.enabled) {
      fetch(`${process.env.NEXT_PUBLIC_MCP_SERVER_URL}/api/professional/revenue/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: 'sponsor_content',
          amount: services.sponsorContent.revenue,
          metadata: { title: formData.title, artist: formData.stageName }
        })
      }).catch(console.error)
    }
  }

  const { getRootProps: getAudioProps, getInputProps: getAudioInputProps } = useDropzone({
    accept: { 'audio/*': ['.mp3', '.wav', '.m4a'] },
    maxFiles: 1,
    onDrop: (files) => setAudioFile(files[0])
  })

  const { getRootProps: getCoverProps, getInputProps: getCoverInputProps } = useDropzone({
    accept: { 'image/*': ['.jpg', '.jpeg', '.png'] },
    maxFiles: 1,
    onDrop: (files) => {
      const file = files[0]
      setCoverFile(file)
      
      // Create preview
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => setCoverPreview(e.target?.result as string)
        reader.readAsDataURL(file)
      }
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!isConnected) {
      error('Please connect your wallet to upload beats', { throttleKey: 'wallet-required', throttleMs: 10000 })
      return
    }
    
    if (!isAuthenticated && user?.role !== 'admin' && user?.role !== 'super_admin') {
      error('Please sign in with your wallet to upload beats', { throttleKey: 'auth-required', throttleMs: 10000 })
      return
    }
    
    if (!user) {
      error('User profile not found. Please reconnect your wallet.', { throttleKey: 'user-profile-error', throttleMs: 10000 })
      return
    }
    
    if (!audioFile) {
      error('Please select an audio file', { throttleKey: 'audio-file-required', throttleMs: 5000 })
      return
    }
    
    if (!formData.title.trim()) {
      error('Please enter a title for your beat', { throttleKey: 'title-required', throttleMs: 5000 })
      return
    }
    
    if (formData.price <= 0) {
      error('Please enter a valid price', { throttleKey: 'price-required', throttleMs: 5000 })
      return
    }

    // Check BeatNFT credits with file size
    const uploadCheck = canUpload(audioFile)
    
    console.log('Upload check result:', uploadCheck)
    console.log('File size:', (audioFile.size / (1024 * 1024)).toFixed(1), 'MB')
    
    if (!uploadCheck.allowed) {
      showError(uploadCheck.reason || 'Insufficient credits', { throttleKey: 'upload-check-failed', throttleMs: 5000 })
      setShowBuyModal(true)
      return
    }

    setSubmitting(true)

    try {
      const beatId = Date.now().toString()
      
      // Check file size before upload
      const fileSizeMB = audioFile.size / (1024 * 1024)
      if (fileSizeMB > 50) {
        throw new Error(`File too large (${fileSizeMB.toFixed(1)}MB). Maximum size is 50MB.`)
      }
      
      // Upload audio file with optional Livepeer optimization
      let audioUrl = ''
      let livepeerAssetData = null
      
      if (useOptimizedPlayback) {
        try {
          // Try Livepeer upload for optimized playback
          const livepeerResult = await uploadToLivepeer(audioFile, {
            title: formData.title,
            artist: formData.stageName,
            beatId
          })
          
          if (livepeerResult.success && livepeerResult.asset) {
            livepeerAssetData = livepeerResult.asset
            // Use optimized playback URL if available, fallback to upload URL
            audioUrl = getPlaybackUrl(livepeerResult.asset) || await uploadBeatAudio(audioFile, beatId)
            setLivepeerAsset(livepeerResult.asset)
            
            success('🚀 Audio optimized with Livepeer for faster streaming!', {
              throttleKey: `livepeer-success-${beatId}`,
              throttleMs: 3000
            })
          } else {
            // Fallback to regular upload
            audioUrl = await uploadBeatAudio(audioFile, beatId)
          }
        } catch (error) {
          console.warn('Livepeer upload failed, using fallback:', error)
          audioUrl = await uploadBeatAudio(audioFile, beatId)
        }
      } else {
        // Regular upload
        audioUrl = await uploadBeatAudio(audioFile, beatId)
      }
      
      // Upload cover image if provided
      let coverImageUrl = 'https://via.placeholder.com/300x300/1a1a1a/ffffff?text=' + encodeURIComponent(formData.title)
      if (coverFile) {
        coverImageUrl = await uploadCoverImage(coverFile, beatId)
      }

      // Create NFT metadata with enhanced data
      const metadata = {
        name: formData.title,
        description: formData.description,
        image: coverImageUrl,
        audio: audioUrl,
        attributes: [
          { trait_type: 'Genre', value: formData.genre },
          { trait_type: 'BPM', value: formData.bpm },
          { trait_type: 'Key', value: formData.key },
          { trait_type: 'Producer', value: user.address },
          { trait_type: 'Stage Name', value: formData.stageName || 'Unknown Artist' },
          { trait_type: 'Price', value: formData.price },
          ...formData.tags.split(',').map(tag => ({ trait_type: 'Tag', value: tag.trim() })),
          // Professional services metadata (optional)
          ...(professionalServices?.isrc ? [{ trait_type: 'ISRC', value: professionalServices.isrc.code }] : []),
          ...(professionalServices?.audioAnalysis ? [
            { trait_type: 'Audio Format', value: professionalServices.audioAnalysis.metadata.format },
            { trait_type: 'Professional Analysis', value: 'Yes' }
          ] : []),
          ...(professionalServices?.aiLicense ? [{ trait_type: 'AI License', value: professionalServices.aiLicense.type }] : [])
        ],
        // Professional services extensions (optional)
        ...(professionalServices && {
          professionalServices: {
            isrc: professionalServices.isrc?.code,
            audioAnalysis: professionalServices.audioAnalysis?.metadata,
            aiLicense: professionalServices.aiLicense?.type,
            sponsorRevenue: professionalServices.sponsorContent?.revenue
          }
        }),
        // Livepeer asset information
        ...(livepeerAssetData && {
          livepeerAsset: {
            id: livepeerAssetData.id,
            optimized: isOptimizedPlayback(livepeerAssetData),
            playbackUrl: getPlaybackUrl(livepeerAssetData)
          }
        })
      }

      // Upload metadata to IPFS
      const { uploadMetadata } = useIPFS()
      const metadataResult = await uploadMetadata(metadata, `${beatId}-metadata`)
      const metadataUri = metadataResult?.url || ''
      
      console.log('Metadata uploaded to IPFS:', metadataUri)

      // Try gasless minting first, fallback to direct minting
      const tokenId = null
      let transactionHash = null
      let isNFT = false
      let mintPending = false
      
      try {
        if (metadataUri) {
          console.log('Attempting gasless minting...')
          
          // Try gasless minting via API
          const gaslessResponse = await fetch('/api/mint-beat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              producer: user.address,
              metadataUri,
              price: formData.price,
              genre: formData.genre,
              bpm: formData.bpm,
              key: formData.key,
              creditsToUse: uploadCheck.cost
            })
          })
          
          if (gaslessResponse.ok) {
            const result = await gaslessResponse.json()
            transactionHash = result.transactionHash
            isNFT = true
            
            success(`✅ NFT minted gaslessly using ${uploadCheck.cost} BeatNFT credits!`, {
              throttleKey: `gasless-mint-${beatId}`,
              throttleMs: 3000
            })
            
            console.log('Gasless mint successful:', result)
          } else {
            throw new Error('Gasless minting failed, trying direct mint')
          }
        }
      } catch (gaslessError: any) {
        console.warn('Gasless minting failed, trying direct mint:', gaslessError)
        
        // Fallback to direct minting
        try {
          const mintTx = await writeContract({
            address: BeatNFTConfig.address[11155111] as `0x${string}`,
            abi: BeatNFTConfig.abi,
            functionName: 'mintBeat',
            args: [
              user.address as `0x${string}`,
              metadataUri,
              parseEther(formData.price.toString()),
              BigInt(500),
              formData.genre,
              BigInt(formData.bpm),
              formData.key
            ]
          })
          
          setMintTxHash(mintTx)
          transactionHash = mintTx
          isNFT = true
          
          success(`🔄 NFT minting transaction submitted: ${mintTx?.slice(0, 10) || 'pending'}...`, {
            throttleKey: `direct-mint-${beatId}`,
            throttleMs: 3000
          })
          
        } catch (directError: any) {
          if (directError.message?.includes('insufficient funds') || directError.message?.includes('gas')) {
            mintPending = true
            showError('⛽ Gasless minting unavailable. Direct minting requires ETH for gas fees. Beat saved locally.', {
              throttleKey: `gas-fee-info-${beatId}`,
              throttleMs: 10000
            })
          } else {
            showError('NFT minting failed, beat saved locally. You can mint it later from dashboard.', {
              throttleKey: `mint-error-${beatId}`,
              throttleMs: 5000
            })
          }
        }
      }
      
      // Store beat data (with or without NFT info)
      const beatData = {
        id: beatId,
        title: formData.title,
        description: formData.description,
        genre: formData.genre,
        bpm: formData.bpm,
        key: formData.key,
        tags: formData.tags.split(',').map(t => t.trim()),
        price: formData.price,
        audioUrl,
        coverImageUrl,
        producerId: user.address,
        stageName: formData.stageName || 'Unknown Artist',
        licenseType: selectedLicense,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        plays: 0,
        likes: 0,
        royaltyPercentage: 5,
        isActive: true,
        // NFT fields
        tokenId,
        transactionHash,
        isNFT,
        metadataUri,
        mintPending,
        source: isNFT ? 'blockchain' : mintPending ? 'pending' : 'local',
        livepeerAsset: livepeerAssetData,
        optimizedPlayback: livepeerAssetData ? isOptimizedPlayback(livepeerAssetData) : false
      }
      
      // Log success event to Supabase
      if (supabaseAvailable) {
        try {
          await logSuccess({
            event: 'beat_upload',
            status: isNFT ? 'minted' : mintPending ? 'pending' : 'uploaded',
            metadata: {
              beatId,
              title: formData.title,
              artist: formData.stageName,
              hasLivepeer: !!livepeerAssetData,
              optimized: livepeerAssetData ? isOptimizedPlayback(livepeerAssetData) : false
            }
          })
          
          // Save ISRC if generated
          if (professionalServices?.isrc?.code) {
            await saveISRC({
              isrc: professionalServices.isrc.code,
              track_title: formData.title,
              artist_name: formData.stageName || 'Unknown Artist',
              used: true,
              professional_service: true
            })
          }
        } catch (error) {
          console.warn('Supabase logging failed:', error)
        }
      }
      
      // Store in producer's beats list
      const producerBeatsKey = `producer_beats_${user.address}`
      const existingBeats = JSON.parse(localStorage.getItem(producerBeatsKey) || '[]')
      existingBeats.unshift(beatData)
      localStorage.setItem(producerBeatsKey, JSON.stringify(existingBeats))
      
      // NEW: Sync to Sanity for social sharing
      try {
        const { createClient } = await import('@sanity/client')
        const writeClient = createClient({
          projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'i01qs9p6',
          dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
          apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2023-05-03',
          token: process.env.SANITY_API_WRITE_TOKEN,
          useCdn: false
        })
        
        await writeClient.create({
          _type: 'web3Beat',
          beatId: beatData.id,
          title: beatData.title,
          stageName: beatData.stageName,
          producerAddress: beatData.producerId,
          genre: beatData.genre,
          bpm: beatData.bpm,
          key: beatData.key,
          price: beatData.price,
          coverImageUrl: beatData.coverImageUrl,
          description: beatData.description,
          isPrivate: true
        })
        console.log('✅ Beat synced to Sanity for social sharing')
      } catch (error) {
        console.warn('⚠️ Sanity sync failed:', error)
      }
      
      console.log('Beat uploaded:', beatData)
      
      // Use BeatNFT credits
      const uploadCheck = canUpload(audioFile)
      if (uploadCheck.cost > 0) {
        await useCredits(uploadCheck.cost)
        success(`✅ Used ${uploadCheck.cost} BeatNFT credit${uploadCheck.cost > 1 ? 's' : ''} for ${uploadCheck.fileSize} file!`, {
          throttleKey: `credits-used-${beatId}`,
          throttleMs: 3000
        })
      }
      
      // Refresh beats list
      await refreshBeats()

      // Reset form
      setFormData({
        title: '',
        description: '',
        genre: 'hip-hop',
        bpm: 120,
        key: 'C',
        price: 0.05,
        tags: '',
        stageName: ''
      })
      setAudioFile(null)
      setCoverFile(null)
      setSelectedLicense('BASIC')

      success('🎵 Beat uploaded successfully! Your beat is now live on the marketplace.', { 
        throttleKey: `upload-success-${beatId}`,
        throttleMs: 5000
      })
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 2000)
    } catch (err: any) {
      console.error('Upload failed:', err)
      showError(`Upload failed: ${err.message || 'Please try again'}`, { 
        throttleKey: `upload-error-${Date.now()}`,
        throttleMs: 5000
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        minHeight: '40vh',
        display: 'flex',
        alignItems: 'center',
        color: 'white',
        position: 'relative'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)' }}></div>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem', position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            🎵 Upload Your Beat
          </h1>
          <p style={{ fontSize: '1.125rem', opacity: 0.9, marginBottom: '1.5rem' }}>
            Share your music with the world and start earning from your creativity
          </p>
          <BackToDashboard />
        </div>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
        
        {/* BeatNFT Credits Display */}
        {isConnected && (
          <div style={{
            background: balance.hasProNFT ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : '#f0f9ff',
            border: balance.hasProNFT ? 'none' : '1px solid #bfdbfe',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '2rem',
            color: balance.hasProNFT ? 'white' : '#1e40af'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                  {balance.hasProNFT ? '♾️ Pro BeatNFT - Unlimited Uploads' : `🎫 ${balance.credits} BeatNFT Credits`}
                </h3>
                <p style={{ fontSize: '0.875rem', opacity: 0.8, margin: 0 }}>
                  {balance.hasProNFT ? 'Upload any format, any size (up to 100MB)' : '0-10MB: 1 credit • 10-25MB: 2 credits • 25-50MB: 3 credits • 50-100MB: 5 credits'}
                </p>
              </div>
              {!balance.hasProNFT && balance.credits < 5 && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => setShowRequestModal(true)}
                    style={{
                      background: '#10b981',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      border: 'none',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      cursor: 'pointer'
                    }}
                  >
                    Request Support
                  </button>
                  <button
                    onClick={() => setShowBuyModal(true)}
                    style={{
                      background: '#3b82f6',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      border: 'none',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      cursor: 'pointer'
                    }}
                  >
                    Buy More
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Professional Services Toggle */}
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          borderRadius: '0.5rem',
          padding: '1rem',
          marginBottom: '2rem',
          color: 'white'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                🎯 Professional Services
              </h3>
              <p style={{ fontSize: '0.875rem', opacity: 0.9, margin: 0 }}>
                Optional: ISRC codes • Audio analysis • AI licensing • Sponsor revenue (+$2.50)
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowProfessionalServices(!showProfessionalServices)}
              style={{
                background: showProfessionalServices ? '#10b981' : 'rgba(255,255,255,0.2)',
                color: 'white',
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              {showProfessionalServices ? '✓ Enabled' : 'Add Services'}
            </button>
          </div>
        </div>

        {/* Professional Services Component */}
        {showProfessionalServices && (
          <ProfessionalServices
            audioFile={audioFile}
            formData={formData}
            onServicesComplete={handleProfessionalServicesComplete}
          />
        )}

        {/* Optimized Playback Toggle */}
        <div style={{
          background: '#f0f9ff',
          border: '1px solid #bfdbfe',
          borderRadius: '0.5rem',
          padding: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.25rem', color: '#1e40af' }}>
                🚀 Optimized Playback
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#3b82f6', margin: 0 }}>
                Use Livepeer for faster streaming, adaptive quality, and global CDN delivery
              </p>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={useOptimizedPlayback}
                onChange={(e) => setUseOptimizedPlayback(e.target.checked)}
                style={{ width: '1rem', height: '1rem' }}
              />
              <span style={{ fontSize: '0.875rem', color: '#1e40af', fontWeight: '500' }}>
                {useOptimizedPlayback ? 'Enabled' : 'Disabled'}
              </span>
            </label>
          </div>
        </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
        {/* Audio Upload */}
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
            Audio File *
          </label>
          <div
            {...getAudioProps()}
            style={{
              border: '2px dashed #d1d5db',
              borderRadius: '0.5rem',
              padding: '2rem',
              textAlign: 'center',
              cursor: 'pointer',
              background: audioFile ? '#f0fdf4' : '#f9fafb'
            }}
          >
            <input {...getAudioInputProps()} />
            {audioFile ? (
              <div>
                <p style={{ color: '#059669', margin: '0 0 0.5rem 0', fontWeight: '500' }}>✓ {audioFile.name}</p>
                <p style={{ color: '#6b7280', margin: 0, fontSize: '0.875rem' }}>
                  {(audioFile.size / (1024 * 1024)).toFixed(1)} MB
                </p>
              </div>
            ) : (
              <p style={{ color: '#6b7280', margin: 0 }}>Drop audio file here or click to browse</p>
            )}
          </div>
        </div>

        {/* Cover Image Upload */}
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
            Cover Image
          </label>
          <div
            {...getCoverProps()}
            style={{
              border: '2px dashed #d1d5db',
              borderRadius: '0.5rem',
              padding: '2rem',
              textAlign: 'center',
              cursor: 'pointer',
              background: coverFile ? '#f0fdf4' : '#f9fafb'
            }}
          >
            <input {...getCoverInputProps()} />
            {coverFile ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {coverPreview && (
                  <img 
                    src={coverPreview} 
                    alt="Cover preview" 
                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '0.375rem' }}
                  />
                )}
                <div>
                  <p style={{ color: '#059669', margin: '0 0 0.25rem 0', fontWeight: '500' }}>✓ {coverFile.name}</p>
                  <p style={{ color: '#6b7280', margin: 0, fontSize: '0.875rem' }}>
                    {(coverFile.size / 1024).toFixed(0)} KB
                  </p>
                </div>
              </div>
            ) : (
              <p style={{ color: '#6b7280', margin: 0 }}>Drop cover image here or click to browse</p>
            )}
          </div>
        </div>

        {/* Beat Details */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
              Stage Name
            </label>
            <input
              type="text"
              value={formData.stageName}
              onChange={(e) => setFormData({ ...formData, stageName: e.target.value })}
              placeholder="Your artist/producer name"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem'
              }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
            Price (ETH)
          </label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
            step="0.001"
            min="0.001"
            max="10"
            placeholder="0.050"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem'
            }}
          />
          <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
            ~R{Math.round(formData.price * 18000).toLocaleString()} ZAR
          </p>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              resize: 'vertical'
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
              Genre
            </label>
            <select
              value={formData.genre}
              onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem'
              }}
            >
              <option value="hip-hop">Hip Hop</option>
              <option value="trap">Trap</option>
              <option value="electronic">Electronic</option>
              <option value="r&b">R&B</option>
              <option value="pop">Pop</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
              BPM
            </label>
            <input
              type="number"
              value={formData.bpm}
              onChange={(e) => setFormData({ ...formData, bpm: parseInt(e.target.value) })}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
              Key
            </label>
            <input
              type="text"
              value={formData.key}
              onChange={(e) => setFormData({ ...formData, key: e.target.value })}
              placeholder="C, Am, F#"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem'
              }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
            Tags (comma separated)
          </label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="dark, trap, hard, melodic"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem'
            }}
          />
        </div>
        
        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
          <LicenseSelector
            selectedLicense={selectedLicense}
            onLicenseChange={setSelectedLicense}
            fileType={audioFile?.name.split('.').pop()?.toLowerCase()}
          />
        </div>

        {/* Enhanced Upload Progress with Operation Details */}
        {uploading && (
          <div style={{ background: '#f0f9ff', padding: '1rem', borderRadius: '0.375rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', color: '#1e40af', fontWeight: '500' }}>
                {currentOperation || `Uploading ${audioFile?.name}...`}
              </span>
              <span style={{ fontSize: '0.875rem', color: '#1e40af', fontWeight: '500' }}>{Math.round(progress)}%</span>
            </div>
            <div style={{ background: '#e0e7ff', height: '0.5rem', borderRadius: '0.25rem' }}>
              <div
                style={{
                  background: '#3b82f6',
                  height: '100%',
                  borderRadius: '0.25rem',
                  width: `${progress}%`,
                  transition: 'width 0.3s'
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
              <p style={{ fontSize: '0.75rem', color: '#3b82f6', margin: 0 }}>
                {progress < 25 ? 'Preparing file...' :
                 progress < 50 ? 'Uploading to IPFS...' :
                 progress < 75 ? 'Processing file...' :
                 progress < 100 ? 'Finalizing upload...' : 'Processing complete!'}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#3b82f6', margin: 0 }}>
                {Math.round(progress) === 100 ? 'Complete!' : `Step ${Math.ceil(progress/25)}/4`}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '1rem', borderRadius: '0.375rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.25rem' }}>⚠️</span>
              <div>
                <p style={{ margin: '0 0 0.5rem 0', fontWeight: '500' }}>Upload Error</p>
                <p style={{ margin: 0, fontSize: '0.875rem' }}>{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  style={{
                    marginTop: '0.75rem',
                    background: '#fee2e2',
                    border: '1px solid #fecaca',
                    color: '#dc2626',
                    padding: '0.375rem 0.75rem',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  Retry Upload
                </button>
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!audioFile || submitting || uploading}
          style={{
            background: (!audioFile || submitting || uploading) ? '#9ca3af' : '#3b82f6',
            color: 'white',
            padding: '1rem 2rem',
            border: 'none',
            borderRadius: '0.375rem',
            fontWeight: '600',
            cursor: (!audioFile || submitting || uploading) ? 'not-allowed' : 'pointer'
          }}
        >
          {submitting ? 'Uploading Beat...' : 'Upload Beat'}
        </button>
      </form>
      
      <BuyBeatNFTModal 
        isOpen={showBuyModal}
        onClose={() => setShowBuyModal(false)}
        requiredCredits={audioFile ? canUpload(audioFile).cost : 1}
      />
      
      <RequestCreditsModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        userAddress={user?.address || ''}
      />
      
      </div>
      
      <EnvironmentStatus />
      <UploadDiagnostics />
    </div>
  )
}