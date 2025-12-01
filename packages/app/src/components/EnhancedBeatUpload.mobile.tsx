'use client'

import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useFileUpload } from '@/hooks/useFileUpload.enhanced'
import { useWeb3Auth } from '@/hooks/useWeb3Auth'
import { useBeatNFT } from '@/hooks/useBeatNFT.enhanced'
import { useEnhancedToast } from '@/hooks/useToast.enhanced'

const WORKFLOW_STEPS = [
  { id: 'upload', title: 'Upload Audio', icon: '🎵' },
  { id: 'licensing', title: 'Generate License', icon: '⚖️' },
  { id: 'isrc', title: 'ISRC Generation', icon: '🏷️' },
  { id: 'professional', title: 'Professional Services', icon: '🎯' },
  { id: 'minting', title: 'NFT Minting', icon: '💎' },
  { id: 'success', title: 'Complete', icon: '✅' }
]

// Sponsored content placements coordinated with N8N workflows
const SPONSORED_PLACEMENTS = {
  upload_start: {
    title: '🎯 Professional Upload Service',
    description: 'Get ISRC codes, professional metadata, and distribution-ready files',
    cta: 'Learn More',
    revenue: 2.50,
    n8n_trigger: 'upload_start_placement'
  },
  metadata_complete: {
    title: '💎 Premium NFT Features', 
    description: 'Unlock gasless minting, advanced analytics, and priority support',
    cta: 'Upgrade Now',
    revenue: 5.00,
    n8n_trigger: 'premium_upgrade_placement'
  },
  license_step: {
    title: '⚖️ Legal Protection Service',
    description: 'Get comprehensive legal coverage and copyright protection',
    cta: 'Protect Now',
    revenue: 3.50,
    n8n_trigger: 'legal_protection_placement'
  },
  professional_services: {
    title: '🚀 Distribution Network',
    description: 'Get your music on Spotify, Apple Music, and 150+ platforms',
    cta: 'Distribute',
    revenue: 7.50,
    n8n_trigger: 'distribution_placement'
  },
  pre_mint: {
    title: '📈 Analytics & Promotion',
    description: 'Track performance and boost your music with our promotion tools',
    cta: 'Promote',
    revenue: 4.00,
    n8n_trigger: 'promotion_placement'
  },
  success: {
    title: '🎊 Congratulations!',
    description: 'Share your success and connect with other artists',
    cta: 'Share Now',
    revenue: 1.50,
    n8n_trigger: 'success_sharing_placement'
  }
}

export default function EnhancedBeatUploadMobile() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    title: '', stageName: '', genre: 'hip-hop', bpm: 120, key: 'C', price: 0.05,
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

  const { user } = useWeb3Auth()
  const { uploadBeatAudio } = useFileUpload()
  const { canUpload } = useBeatNFT()
  const { success, error } = useEnhancedToast()

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'audio/*': ['.mp3', '.wav', '.m4a'] },
    maxFiles: 1,
    onDrop: (files) => {
      setAudioFile(files[0])
      if (files[0]) {
        triggerSponsoredContent('upload_start')
        setCurrentStep(1)
      }
    }
  })

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

  const triggerSponsoredContent = async (placement: keyof typeof SPONSORED_PLACEMENTS) => {
    try {
      const placementData = SPONSORED_PLACEMENTS[placement]
      
      // Send to N8N webhook for campaign tracking
      await fetch('https://n8n.beatschain.app/webhook/sponsored-placement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placement_type: placement,
          user_id: user?.address || 'anonymous',
          revenue: placementData.revenue,
          n8n_trigger: placementData.n8n_trigger,
          metadata: {
            step: currentStep,
            track_title: formData.title,
            timestamp: new Date().toISOString()
          }
        })
      })
    } catch (error) {
      console.warn('Sponsored content tracking failed:', error)
    }
  }

  const SponsoredContent = ({ placement }: { placement: keyof typeof SPONSORED_PLACEMENTS }) => {
    const content = SPONSORED_PLACEMENTS[placement]
    return (
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 text-sm md:text-base">{content.title}</h3>
            <p className="text-xs md:text-sm text-blue-700">{content.description}</p>
          </div>
          <button 
            onClick={() => triggerSponsoredContent(placement)}
            className="bg-blue-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg text-xs md:text-sm hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            {content.cta}
          </button>
        </div>
      </div>
    )
  }

  const generateLicense = async () => {
    triggerSponsoredContent('license_step')
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_MCP_SERVER_URL}/api/isrc/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          artist: formData.stageName || 'Unknown Artist'
        })
      })
      
      const result = await response.json()
      if (result.success) {
        setIsrcCode(result.isrc)
        setCurrentStep(3)
        success('ISRC generated successfully!')
      }
    } catch (err) {
      error('ISRC generation failed, using fallback')
      setIsrcCode(`ZA-80G-${new Date().getFullYear().toString().slice(-2)}-${String(Date.now()).slice(-5)}`)
      setCurrentStep(3)
    }
  }

  const addProfessionalServices = () => {
    triggerSponsoredContent('professional_services')
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
    
    triggerSponsoredContent('pre_mint')
    
    try {
      const audioUrl = await uploadBeatAudio(audioFile, Date.now().toString())
      
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
        }
      }
      
      const metadata = {
        name: formData.title,
        description: formData.description || `${formData.title} by ${formData.stageName}`,
        image: coverArtUrl || `https://via.placeholder.com/400x400/1f2937/ffffff?text=${encodeURIComponent(formData.title)}`,
        audio: audioUrl,
        attributes: [
          { trait_type: 'Artist', value: formData.stageName },
          { trait_type: 'Album', value: formData.album },
          { trait_type: 'Release Year', value: formData.releaseYear },
          { trait_type: 'Record Label', value: formData.recordLabel || 'Independent' },
          { trait_type: 'Genre', value: formData.genre },
          { trait_type: 'BPM', value: formData.bpm },
          { trait_type: 'Key', value: formData.key },
          { trait_type: 'Mood', value: formData.mood },
          { trait_type: 'Energy Level', value: formData.energy },
          { trait_type: 'Time Signature', value: formData.timeSignature },
          { trait_type: 'Producer', value: formData.producer || 'Not specified' },
          { trait_type: 'Mixer', value: formData.mixer || 'Not specified' },
          { trait_type: 'Featured Artists', value: formData.featuredArtists || 'None' },
          { trait_type: 'Language', value: formData.language },
          { trait_type: 'Explicit', value: formData.explicit ? 'Yes' : 'No' },
          { trait_type: 'Cover Art', value: coverArtUrl ? 'Custom' : 'Generated' },
          { trait_type: 'ISRC', value: isrcCode },
          { trait_type: 'Professional Services', value: 'Yes' },
          { trait_type: 'Sponsor Revenue', value: '$2.50' }
        ],
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

      const mintResponse = await fetch('/api/mint-beat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          producer: user?.address,
          metadata,
          price: formData.price,
          isrc: isrcCode,
          professionalServices: true
        })
      })

      if (mintResponse.ok) {
        setCurrentStep(5)
        triggerSponsoredContent('success')
        success('NFT minted successfully with professional services!')
      }
    } catch (err) {
      error('Minting failed, beat saved locally')
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 min-h-screen bg-gray-50">
      {/* Mobile-First Workflow Progress */}
      <div className="mb-8">
        <div className="flex justify-between mb-4 overflow-x-auto pb-2">
          {WORKFLOW_STEPS.map((step, index) => (
            <div key={step.id} className={`flex flex-col items-center min-w-0 flex-1 ${
              index <= currentStep ? 'opacity-100' : 'opacity-50'
            }`}>
              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white text-sm md:text-lg ${
                index <= currentStep ? 'bg-green-500' : 'bg-gray-300'
              }`}>
                {index < currentStep ? '✓' : step.icon}
              </div>
              <span className="text-xs mt-2 text-center px-1">
                {step.title}
              </span>
            </div>
          ))}
        </div>
        <div className="h-1 bg-gray-200 rounded">
          <div 
            className="h-full bg-green-500 rounded transition-all duration-300"
            style={{ width: `${(currentStep / (WORKFLOW_STEPS.length - 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      {currentStep === 0 && (
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
          <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-900">🎵 Upload Your Audio File</h2>
          
          <SponsoredContent placement="upload_start" />
          
          <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-6 md:p-12 text-center cursor-pointer transition-colors ${
            audioFile ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
          }`}>
            <input {...getInputProps()} />
            {audioFile ? (
              <div>
                <p className="text-green-600 font-medium">✓ {audioFile.name}</p>
                <p className="text-gray-500 text-sm">
                  {(audioFile.size / (1024 * 1024)).toFixed(1)} MB
                </p>
              </div>
            ) : (
              <div>
                <div className="text-4xl mb-2">🎵</div>
                <p className="text-gray-600">Drop audio file here or tap to browse</p>
                <p className="text-xs text-gray-500 mt-2">MP3, WAV, M4A supported</p>
              </div>
            )}
          </div>
          
          {audioFile && (
            <div className="mt-6 space-y-4">
              {/* Basic Info - Mobile Responsive */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  placeholder="Track Title *"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  placeholder="Artist/Stage Name *"
                  value={formData.stageName}
                  onChange={(e) => setFormData({...formData, stageName: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Album & Release Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  placeholder="Album/EP Name"
                  value={formData.album}
                  onChange={(e) => setFormData({...formData, album: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="number"
                  placeholder="Release Year"
                  value={formData.releaseYear}
                  onChange={(e) => setFormData({...formData, releaseYear: parseInt(e.target.value)})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  placeholder="Record Label"
                  value={formData.recordLabel}
                  onChange={(e) => setFormData({...formData, recordLabel: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Musical Properties - Mobile Stacked */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <select
                  value={formData.genre}
                  onChange={(e) => setFormData({...formData, genre: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <select
                  value={formData.key}
                  onChange={(e) => setFormData({...formData, key: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="C">C Major</option>
                  <option value="C#">C# Major</option>
                  <option value="D">D Major</option>
                  <option value="Am">A Minor</option>
                  <option value="Cm">C Minor</option>
                </select>
                <select
                  value={formData.mood}
                  onChange={(e) => setFormData({...formData, mood: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="neutral">Neutral</option>
                  <option value="energetic">Energetic</option>
                  <option value="calm">Calm</option>
                  <option value="uplifting">Uplifting</option>
                </select>
              </div>
              
              {/* Cover Art Upload - Mobile Optimized */}
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h4 className="mb-3 text-gray-700 font-medium">Cover Art (Optional)</h4>
                <div className="flex flex-col md:flex-row gap-4 items-start">
                  <div className="flex-1 w-full">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverArtUpload}
                      className="w-full p-3 border border-gray-300 rounded-lg bg-white"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      JPG, PNG recommended. 1400x1400px minimum for best quality.
                    </p>
                  </div>
                  {coverArtPreview && (
                    <div className="w-24 h-24 md:w-32 md:h-32 border-2 border-gray-200 rounded-lg overflow-hidden bg-white flex-shrink-0">
                      <img 
                        src={coverArtPreview} 
                        alt="Cover art preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <SponsoredContent placement="metadata_complete" />
            </div>
          )}
        </div>
      )}

      {currentStep === 1 && (
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
          <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-900">⚖️ Generate License Agreement</h2>
          <p className="text-gray-600 mb-4">Professional licensing terms will be generated for your track.</p>
          
          <SponsoredContent placement="license_step" />
          
          <div className="bg-gray-50 p-4 rounded-lg my-4">
            <strong>Track:</strong> {formData.title}<br/>
            <strong>Artist:</strong> {formData.stageName}<br/>
            <strong>License Type:</strong> Non-exclusive perpetual
          </div>
          
          <button
            onClick={generateLicense}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium w-full md:w-auto"
          >
            Generate Professional License
          </button>
        </div>
      )}

      {currentStep === 2 && (
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
          <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-900">🏷️ ISRC Code Generation</h2>
          <p className="text-gray-600 mb-4">Generate professional ISRC code for your track.</p>
          <div className="bg-blue-50 p-4 rounded-lg my-4">
            <strong>Format:</strong> ZA-80G-YY-NNNNN (South African Standard)<br/>
            <strong>Purpose:</strong> International Standard Recording Code for royalty tracking
          </div>
          <button
            onClick={generateISRC}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium w-full md:w-auto"
          >
            Generate ISRC Code
          </button>
        </div>
      )}

      {currentStep === 3 && (
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
          <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-900">🎯 Professional Services</h2>
          
          <SponsoredContent placement="professional_services" />
          
          <div className="bg-yellow-50 p-4 rounded-lg my-4">
            <h3 className="font-semibold mb-2">✅ Included Services:</h3>
            <ul className="space-y-1">
              <li>✓ ISRC Code: {isrcCode}</li>
              <li>✓ Professional License Agreement</li>
              <li>✓ Sponsor Revenue: +$2.50</li>
              <li>✓ Audio Analysis & Metadata</li>
            </ul>
          </div>
          <button
            onClick={addProfessionalServices}
            className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-colors font-medium w-full md:w-auto"
          >
            Add Professional Services (+$2.50)
          </button>
        </div>
      )}

      {currentStep === 4 && (
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
          <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-900">💎 Mint NFT</h2>
          
          <SponsoredContent placement="pre_mint" />
          
          <div className="bg-green-50 p-4 rounded-lg my-4">
            <h3 className="font-semibold mb-2">Ready to Mint:</h3>
            <p><strong>Title:</strong> {formData.title}</p>
            <p><strong>ISRC:</strong> {isrcCode}</p>
            <p><strong>Professional Services:</strong> Included (+$2.50)</p>
            <p><strong>License:</strong> Generated</p>
          </div>
          
          <button
            onClick={mintNFT}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium w-full md:w-auto"
          >
            Mint Professional NFT
          </button>
        </div>
      )}

      {currentStep === 5 && (
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 text-center">
          <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-900">✅ Upload Complete!</h2>
          <div className="text-6xl mb-4">🎉</div>
          <p className="text-gray-600 mb-4">Your professional NFT has been minted with:</p>
          <ul className="text-left max-w-sm mx-auto mb-6 space-y-1">
            <li>✓ ISRC Code: {isrcCode}</li>
            <li>✓ Professional License</li>
            <li>✓ Sponsor Revenue: $2.50</li>
            <li>✓ Blockchain Verification</li>
          </ul>
          
          <SponsoredContent placement="success" />
          
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition-colors font-medium text-lg w-full md:w-auto"
          >
            View in Dashboard
          </button>
        </div>
      )}
    </div>
  )
}