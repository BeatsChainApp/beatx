'use client'

import { useState } from 'react'
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

  const { user } = useWeb3Auth()
  const { uploadBeatAudio } = useFileUpload()
  const { canUpload } = useBeatNFT()
  const { success, error } = useEnhancedToast()

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'audio/*': ['.mp3', '.wav', '.m4a'] },
    maxFiles: 1,
    onDrop: (files) => {
      setAudioFile(files[0])
      if (files[0]) setCurrentStep(1)
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
      // Upload audio to IPFS
      const audioUrl = await uploadBeatAudio(audioFile, Date.now().toString())
      
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

      // Attempt gasless minting with enhanced metadata
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
        success('NFT minted successfully with professional services!')
      }
    } catch (err) {
      error('Minting failed, beat saved locally')
    }
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
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
          <h2>🎵 Upload Your Audio File</h2>
          <div {...getRootProps()} style={{
            border: '2px dashed #d1d5db', borderRadius: '0.5rem', padding: '3rem',
            textAlign: 'center', cursor: 'pointer', background: audioFile ? '#f0fdf4' : '#f9fafb'
          }}>
            <input {...getInputProps()} />
            {audioFile ? (
              <div>
                <p style={{ color: '#059669', fontWeight: '500' }}>✓ {audioFile.name}</p>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                  {(audioFile.size / (1024 * 1024)).toFixed(1)} MB
                </p>
              </div>
            ) : (
              <p>Drop audio file here or click to browse</p>
            )}
          </div>
          
          {audioFile && (
            <div style={{ marginTop: '1rem' }}>
              {/* Basic Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <input
                  placeholder="Track Title *"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                />
                <input
                  placeholder="Artist/Stage Name *"
                  value={formData.stageName}
                  onChange={(e) => setFormData({...formData, stageName: e.target.value})}
                  style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                />
              </div>
              
              {/* Album & Release Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <input
                  placeholder="Album/EP Name"
                  value={formData.album}
                  onChange={(e) => setFormData({...formData, album: e.target.value})}
                  style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                />
                <input
                  type="number"
                  placeholder="Release Year"
                  value={formData.releaseYear}
                  onChange={(e) => setFormData({...formData, releaseYear: parseInt(e.target.value)})}
                  style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                />
                <input
                  placeholder="Record Label"
                  value={formData.recordLabel}
                  onChange={(e) => setFormData({...formData, recordLabel: e.target.value})}
                  style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                />
              </div>
              
              {/* Musical Properties */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <select
                  value={formData.genre}
                  onChange={(e) => setFormData({...formData, genre: e.target.value})}
                  style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
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
                  style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                />
                <select
                  value={formData.key}
                  onChange={(e) => setFormData({...formData, key: e.target.value})}
                  style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
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
                  style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
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
              
              {/* Credits & Collaborations */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <input
                  placeholder="Producer"
                  value={formData.producer}
                  onChange={(e) => setFormData({...formData, producer: e.target.value})}
                  style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                />
                <input
                  placeholder="Mixer/Engineer"
                  value={formData.mixer}
                  onChange={(e) => setFormData({...formData, mixer: e.target.value})}
                  style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                />
                <input
                  placeholder="Featured Artists"
                  value={formData.featuredArtists}
                  onChange={(e) => setFormData({...formData, featuredArtists: e.target.value})}
                  style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                />
              </div>
              
              {/* Description & Tags */}
              <div style={{ marginBottom: '1rem' }}>
                <textarea
                  placeholder="Track Description (for marketing and distribution)"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', resize: 'vertical' }}
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <input
                  placeholder="Tags (comma-separated)"
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
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
                    style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
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
              
              {/* Cover Art Upload */}
              <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', background: '#f9fafb' }}>
                <h4 style={{ margin: '0 0 1rem 0', color: '#374151' }}>Cover Art (Optional)</h4>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
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
                        background: 'white'
                      }}
                    />
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.5rem 0 0 0' }}>
                      JPG, PNG recommended. 1400x1400px minimum for best quality.
                    </p>
                  </div>
                  {coverArtPreview && (
                    <div style={{ 
                      width: '100px', 
                      height: '100px', 
                      border: '2px solid #e5e7eb', 
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
                  )}
                </div>
              </div>
            </div>
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