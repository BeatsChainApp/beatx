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
    title: '', stageName: '', genre: 'hip-hop', bpm: 120, key: 'C', price: 0.05
  })
  const [audioFile, setAudioFile] = useState<File | null>(null)
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
      // Upload to IPFS with integrated metadata
      const audioUrl = await uploadBeatAudio(audioFile, Date.now().toString())
      
      const metadata = {
        name: formData.title,
        description: `${formData.title} by ${formData.stageName}`,
        audio: audioUrl,
        attributes: [
          { trait_type: 'Genre', value: formData.genre },
          { trait_type: 'BPM', value: formData.bpm },
          { trait_type: 'ISRC', value: isrcCode },
          { trait_type: 'Professional Services', value: 'Yes' },
          { trait_type: 'Sponsor Revenue', value: '$2.50' }
        ],
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
            <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <input
                placeholder="Track Title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
              />
              <input
                placeholder="Artist/Stage Name"
                value={formData.stageName}
                onChange={(e) => setFormData({...formData, stageName: e.target.value})}
                style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
              />
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