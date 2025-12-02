'use client'

import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useFileUpload } from '@/hooks/useFileUpload.enhanced'
import { useWeb3Beats } from '@/hooks/useWeb3Beats'
import { useWeb3Auth } from '@/context/UnifiedAuthContext'
import { useBeatNFT } from '@/hooks/useBeatNFT'
import { useIPFS } from '@/hooks/useIPFS'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { BeatNFTConfig } from '@/contracts/BeatNFT'
import { parseEther } from 'viem'
import BuyBeatNFTModal from '@/components/BuyBeatNFTModal'
import RequestCreditsModal from '@/components/RequestCreditsModal'
import LicenseSelector from '@/components/LicenseSelector'
import ProfessionalServices from '@/components/ProfessionalServices'
import { useEnhancedToast } from '@/hooks/useToast.enhanced'
import { useLivepeer } from '@/hooks/useLivepeer'
import { useSupabase } from '@/hooks/useSupabase'
import EnhancedAudioPlayer from '@/components/EnhancedAudioPlayer'

interface EnhancedBeatUploadFormProps {
  onSuccess?: (beat: any) => void
  onCancel?: () => void
}

export default function EnhancedBeatUploadForm({ onSuccess, onCancel }: EnhancedBeatUploadFormProps) {
  const [step, setStep] = useState(1)
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
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showBuyModal, setShowBuyModal] = useState(false)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [showProfessionalServices, setShowProfessionalServices] = useState(false)
  const [professionalServices, setProfessionalServices] = useState<any>(null)
  const [livepeerAsset, setLivepeerAsset] = useState<any>(null)
  const [useOptimizedPlayback, setUseOptimizedPlayback] = useState(true)
  const [mintTxHash, setMintTxHash] = useState<string | null>(null)

  const { user, isAuthenticated } = useWeb3Auth()
  const { uploadBeatAudio, uploadCoverImage, uploading, progress, error, currentOperation } = useFileUpload()
  const { refreshBeats } = useWeb3Beats()
  const { balance, canUpload, useCredits, isConnected } = useBeatNFT()
  const { success, error: showError } = useEnhancedToast()
  const { uploadMetadata } = useIPFS()
  const { writeContract } = useWriteContract()
  const { uploadFile: uploadToLivepeer, createAssetFromIPFS, getPlaybackUrl, isOptimizedPlayback } = useLivepeer()
  const { isAvailable: supabaseAvailable, logSuccess, trackCredit, saveISRC } = useSupabase()
  
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
      
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => setCoverPreview(e.target?.result as string)
        reader.readAsDataURL(file)
      }
    }
  })

  const validateStep = (stepNumber: number): boolean => {
    switch (stepNumber) {
      case 1:
        return !!audioFile
      case 2:
        return !!formData.title.trim()
      case 3:
        return true // Professional services are optional
      case 4:
        return formData.price > 0
      default:
        return false
    }
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const handleSubmit = async () => {
    if (!isConnected) {
      showError('Please connect your wallet to upload beats')
      return
    }
    
    if (!isAuthenticated || !user) {
      showError('Please sign in with your wallet to upload beats')
      return
    }
    
    if (!audioFile) {
      showError('Please select an audio file')
      return
    }

    const uploadCheck = canUpload(audioFile)
    
    if (!uploadCheck.allowed) {
      showError(uploadCheck.reason || 'Insufficient credits')
      setShowBuyModal(true)
      return
    }

    setSubmitting(true)

    try {
      const beatId = Date.now().toString()
      
      const fileSizeMB = audioFile.size / (1024 * 1024)
      if (fileSizeMB > 50) {
        throw new Error(`File too large (${fileSizeMB.toFixed(1)}MB). Maximum size is 50MB.`)
      }
      
      let audioUrl = ''
      let livepeerAssetData = null
      
      if (useOptimizedPlayback) {
        try {
          const livepeerResult = await uploadToLivepeer(audioFile, {
            title: formData.title,
            artist: formData.stageName,
            beatId
          })
          
          if (livepeerResult.success && livepeerResult.asset) {
            livepeerAssetData = livepeerResult.asset
            audioUrl = getPlaybackUrl(livepeerResult.asset) || await uploadBeatAudio(audioFile, beatId)
            
            success('🚀 Audio optimized with Livepeer for faster streaming!')
          } else {
            audioUrl = await uploadBeatAudio(audioFile, beatId)
          }
        } catch (error) {
          console.warn('Livepeer upload failed, using fallback:', error)
          audioUrl = await uploadBeatAudio(audioFile, beatId)
        }
      } else {
        audioUrl = await uploadBeatAudio(audioFile, beatId)
      }
      
      let coverImageUrl = 'https://via.placeholder.com/300x300/1a1a1a/ffffff?text=' + encodeURIComponent(formData.title)
      if (coverFile) {
        coverImageUrl = await uploadCoverImage(coverFile, beatId)
      }

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
          { trait_type: 'License Type', value: selectedLicense },
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

      const metadataResult = await uploadMetadata(metadata, `${beatId}-metadata`)
      const metadataUri = metadataResult?.url || ''

      let tokenId = null
      let transactionHash = null
      let isNFT = false
      let mintPending = false
      
      try {
        if (metadataUri) {
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
            
            success(`✅ NFT minted gaslessly using ${uploadCheck.cost} BeatNFT credits!`)
          } else {
            throw new Error('Gasless minting failed, trying direct mint')
          }
        }
      } catch (gaslessError: any) {
        console.warn('Gasless minting failed, trying direct mint:', gaslessError)
        
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
          
          transactionHash = mintTx
          isNFT = true
          
          success(`🔄 NFT minting transaction submitted: ${mintTx?.slice(0, 10) || 'pending'}...`)
          
        } catch (directError: any) {
          if (directError.message?.includes('insufficient funds') || directError.message?.includes('gas')) {
            mintPending = true
            showError('⛽ Gasless minting unavailable. Direct minting requires ETH for gas fees. Beat saved locally.')
          } else {
            showError('NFT minting failed, beat saved locally. You can mint it later from dashboard.')
          }
        }
      }
      
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
        optimizedPlayback: livepeerAssetData ? isOptimizedPlayback(livepeerAssetData) : false,
        // Professional services data
        professionalServices: professionalServices || null
      }
      
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
              optimized: livepeerAssetData ? isOptimizedPlayback(livepeerAssetData) : false,
              hasProfessionalServices: !!professionalServices,
              hasISRC: !!professionalServices?.isrc?.code
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
      
      const producerBeatsKey = `producer_beats_${user.address}`
      const existingBeats = JSON.parse(localStorage.getItem(producerBeatsKey) || '[]')
      existingBeats.unshift(beatData)
      localStorage.setItem(producerBeatsKey, JSON.stringify(existingBeats))
      
      // Sync to Sanity for social sharing
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
      
      if (uploadCheck.cost > 0) {
        await useCredits(uploadCheck.cost)
        success(`✅ Used ${uploadCheck.cost} BeatNFT credit${uploadCheck.cost > 1 ? 's' : ''} for upload!`)
      }
      
      await refreshBeats()

      success('🎵 Beat uploaded successfully! Your beat is now live on the marketplace.')
      
      if (onSuccess) {
        onSuccess(beatData)
      }
      
    } catch (err: any) {
      console.error('Upload failed:', err)
      showError(`Upload failed: ${err.message || 'Please try again'}`)
    } finally {
      setSubmitting(false)
    }
  }

  const steps = [
    { number: 1, title: 'Audio File', description: 'Upload your beat' },
    { number: 2, title: 'Beat Details', description: 'Add information' },
    { number: 3, title: 'Professional Services', description: 'ISRC, analysis, licensing' },
    { number: 4, title: 'Cover & Price', description: 'Final details' }
  ]

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((s, index) => (
            <div key={s.number} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                step >= s.number 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : 'border-gray-300 text-gray-500'
              }`}>
                {step > s.number ? '✓' : s.number}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-2 ${
                  step > s.number ? 'bg-blue-600' : 'bg-gray-300'
                }`}></div>
              )}
            </div>
          ))}
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold">{steps[step - 1].title}</h2>
          <p className="text-gray-600">{steps[step - 1].description}</p>
        </div>
      </div>

      {/* BeatNFT Credits Display */}
      {isConnected && (
        <div className={`p-4 rounded-lg mb-6 ${
          balance.hasProNFT 
            ? 'bg-gradient-to-r from-green-50 to-blue-50 border border-green-200' 
            : 'bg-blue-50 border border-blue-200'
        }`}>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-blue-900">
                {balance.hasProNFT ? '♾️ Pro BeatNFT - Unlimited Uploads' : `🎫 ${balance.credits} BeatNFT Credits`}
              </h3>
              <p className="text-sm text-blue-700">
                {balance.hasProNFT 
                  ? 'Upload any format, any size (up to 100MB)' 
                  : 'File size determines credit cost'
                }
              </p>
            </div>
            {!balance.hasProNFT && balance.credits < 5 && (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                >
                  Request Support
                </button>
                <button
                  onClick={() => setShowBuyModal(true)}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                >
                  Buy More
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Audio File *</label>
              <div
                {...getAudioProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  audioFile ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input {...getAudioInputProps()} />
                {audioFile ? (
                  <div>
                    <p className="text-green-600 font-medium">✓ {audioFile.name}</p>
                    <p className="text-sm text-gray-500">{(audioFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                    {audioFile && (
                      <p className="text-sm text-blue-600 mt-2">
                        Credit cost: {canUpload(audioFile).cost} credits
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-600">Drop audio file here or click to browse</p>
                    <p className="text-sm text-gray-500 mt-2">Supports MP3, WAV, M4A (max 50MB)</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-blue-900">🚀 Optimized Playback</h4>
                  <p className="text-sm text-blue-700">Use Livepeer for faster streaming and global CDN</p>
                </div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={useOptimizedPlayback}
                    onChange={(e) => setUseOptimizedPlayback(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-blue-900">Enable</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Stage Name</label>
                <input
                  type="text"
                  value={formData.stageName}
                  onChange={(e) => setFormData({...formData, stageName: e.target.value})}
                  placeholder="Your artist/producer name"
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Genre</label>
                <select
                  value={formData.genre}
                  onChange={(e) => setFormData({...formData, genre: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="hip-hop">Hip Hop</option>
                  <option value="trap">Trap</option>
                  <option value="electronic">Electronic</option>
                  <option value="r&b">R&B</option>
                  <option value="pop">Pop</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">BPM</label>
                <input
                  type="number"
                  value={formData.bpm}
                  onChange={(e) => setFormData({...formData, bpm: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Key</label>
                <input
                  type="text"
                  value={formData.key}
                  onChange={(e) => setFormData({...formData, key: e.target.value})}
                  placeholder="C, Am, F#"
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
                placeholder="dark, trap, hard, melodic"
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">🎯 Professional Services</h3>
              <p className="text-blue-700 text-sm mb-4">
                Optional services to enhance your beat: ISRC codes, audio analysis, AI licensing, and sponsor revenue
              </p>
              <button
                type="button"
                onClick={() => setShowProfessionalServices(!showProfessionalServices)}
                className={`px-4 py-2 rounded-md font-medium ${
                  showProfessionalServices 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {showProfessionalServices ? '✓ Services Enabled' : 'Add Professional Services'}
              </button>
            </div>

            {showProfessionalServices && (
              <ProfessionalServices
                audioFile={audioFile}
                formData={formData}
                onServicesComplete={handleProfessionalServicesComplete}
              />
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Cover Image (Optional)</label>
              <div
                {...getCoverProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  coverFile ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input {...getCoverInputProps()} />
                {coverFile ? (
                  <div className="flex items-center justify-center gap-4">
                    {coverPreview && (
                      <img 
                        src={coverPreview} 
                        alt="Cover preview" 
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div>
                      <p className="text-green-600 font-medium">✓ {coverFile.name}</p>
                      <p className="text-sm text-gray-500">{(coverFile.size / 1024).toFixed(0)} KB</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600">Drop cover image or click to browse</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Price (ETH) *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                step="0.001"
                min="0.001"
                max="10"
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-sm text-gray-600 mt-1">
                ~R{Math.round(formData.price * 18000).toLocaleString()} ZAR
              </p>
            </div>

            {uploading && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-blue-700 font-medium">
                    {currentOperation || 'Uploading...'}
                  </span>
                  <span className="text-blue-700 font-medium">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-lg">
              <LicenseSelector
                selectedLicense={selectedLicense}
                onLicenseChange={setSelectedLicense}
                fileType={audioFile?.name.split('.').pop()?.toLowerCase()}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t">
          <button
            onClick={step === 1 ? onCancel : handleBack}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          
          {step < 4 ? (
            <button
              onClick={handleNext}
              disabled={!validateStep(step)}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting || uploading || !validateStep(step)}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {submitting ? 'Uploading Beat...' : 'Upload Beat'}
            </button>
          )}
        </div>
      </div>

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
  )
}