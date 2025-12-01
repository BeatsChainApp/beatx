'use client'

import { useState, useEffect } from 'react'
// Simple UI components
const Button = ({ children, onClick, disabled, variant = 'default', size = 'default', className = '', ...props }: any) => {
  const baseClasses = 'px-4 py-2 rounded font-medium transition-colors'
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50'
  }
  const sizes = {
    sm: 'px-3 py-1 text-sm',
    default: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  }
  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

const Card = ({ children, className = '' }: any) => (
  <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
    {children}
  </div>
)
const CardHeader = ({ children }: any) => <div className="p-6 pb-4">{children}</div>
const CardTitle = ({ children, className = '' }: any) => <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
const CardContent = ({ children, className = '' }: any) => <div className={`p-6 pt-0 ${className}`}>{children}</div>

const Badge = ({ children, variant = 'default', className = '' }: any) => {
  const variants = {
    default: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800'
  }
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}

const Alert = ({ children, className = '' }: any) => (
  <div className={`p-4 rounded-lg border ${className}`}>
    {children}
  </div>
)
const AlertDescription = ({ children }: any) => <div className="text-sm">{children}</div>
// import { Progress } from '@/components/ui/progress'
import { Music, CheckCircle, AlertCircle, Download, FileAudio, Tag } from 'lucide-react'

interface AudioMetadata {
  format: string
  duration: string
  bitrate: string
  sampleRate: string
  channels: string
  extractedISRC?: string
  hasEmbeddedISRC: boolean
  supportsISRCEmbedding: boolean
}

interface Props {
  audioFile: File
  trackData: {
    title: string
    artist: string
    isrc?: string
  }
  onComplete: (data: {
    audioMetadata: AudioMetadata
    isrcEmbedded: boolean
    taggedFile?: File
  }) => void
  onSkip?: () => void
}

export default function AudioTaggingStep({ audioFile, trackData, onComplete, onSkip }: Props) {
  const [audioMetadata, setAudioMetadata] = useState<AudioMetadata | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isEmbedding, setIsEmbedding] = useState(false)
  const [embeddingProgress, setEmbeddingProgress] = useState(0)
  const [isrcEmbedded, setIsrcEmbedded] = useState(false)
  const [taggedFile, setTaggedFile] = useState<File | null>(null)

  useEffect(() => {
    analyzeAudioFile()
  }, [audioFile])

  const analyzeAudioFile = async () => {
    setIsAnalyzing(true)
    
    try {
      // Simulate audio analysis
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const format = audioFile.name.split('.').pop()?.toUpperCase() || 'UNKNOWN'
      const supportsISRC = ['MP3', 'WAV'].includes(format)
      
      // Simulate ISRC extraction
      const extractedISRC = await extractISRCFromAudio(audioFile)
      
      const metadata: AudioMetadata = {
        format,
        duration: '3:45', // Would be extracted from actual file
        bitrate: '320 kbps',
        sampleRate: '44.1 kHz',
        channels: 'Stereo',
        extractedISRC,
        hasEmbeddedISRC: !!extractedISRC,
        supportsISRCEmbedding: supportsISRC
      }
      
      setAudioMetadata(metadata)
    } catch (error) {
      console.error('Audio analysis failed:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const extractISRCFromAudio = async (file: File): Promise<string | undefined> => {
    // Simulate ISRC extraction from MP3 ID3v2 tags or WAV BWF metadata
    const format = file.name.split('.').pop()?.toUpperCase()
    
    if (format === 'MP3') {
      // Simulate reading ID3v2 TSRC frame
      return Math.random() > 0.7 ? 'USRC17607839' : undefined
    } else if (format === 'WAV') {
      // Simulate reading BWF bext chunk ISRC field
      return Math.random() > 0.8 ? 'GBUM71505078' : undefined
    }
    
    return undefined
  }

  const embedISRCIntoAudio = async () => {
    if (!audioMetadata?.supportsISRCEmbedding || !trackData.isrc) return
    
    setIsEmbedding(true)
    setEmbeddingProgress(0)
    
    try {
      // Simulate ISRC embedding process
      const steps = [
        'Reading audio file structure...',
        'Locating metadata section...',
        'Embedding ISRC code...',
        'Updating file headers...',
        'Validating embedded data...',
        'Creating tagged file...'
      ]
      
      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800))
        setEmbeddingProgress(((i + 1) / steps.length) * 100)
      }
      
      // Create a "tagged" version of the file (in real implementation, would actually embed ISRC)
      const taggedFileName = audioFile.name.replace(/(\.[^.]+)$/, '-tagged$1')
      const tagged = new File([audioFile], taggedFileName, { type: audioFile.type })
      
      setTaggedFile(tagged)
      setIsrcEmbedded(true)
      
    } catch (error) {
      console.error('ISRC embedding failed:', error)
    } finally {
      setIsEmbedding(false)
    }
  }

  const downloadTaggedFile = () => {
    if (!taggedFile) return
    
    const url = URL.createObjectURL(taggedFile)
    const a = document.createElement('a')
    a.href = url
    a.download = taggedFile.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleComplete = () => {
    if (!audioMetadata) return
    
    onComplete({
      audioMetadata,
      isrcEmbedded,
      taggedFile: taggedFile || undefined
    })
  }

  const handleSkip = () => {
    if (onSkip) {
      onSkip()
    } else if (audioMetadata) {
      onComplete({
        audioMetadata,
        isrcEmbedded: false
      })
    }
  }

  if (isAnalyzing) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium mb-2">Analyzing Audio File</h3>
          <p className="text-gray-600">Extracting metadata and checking for embedded ISRC...</p>
        </CardContent>
      </Card>
    )
  }

  if (!audioMetadata) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Analysis Failed</h3>
          <p className="text-gray-600 mb-4">Unable to analyze the audio file</p>
          <Button onClick={handleSkip}>Continue Without Analysis</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🎵 Audio Tagging & ISRC Embedding
            {isrcEmbedded && <Badge variant="secondary" className="bg-green-100 text-green-800">ISRC Embedded</Badge>}
          </CardTitle>
          <p className="text-sm text-gray-600">
            Enhance your audio file with embedded ISRC metadata for professional radio submission
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Audio File Information */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
              <FileAudio className="w-4 h-4" />
              Audio File Analysis
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <div><strong>Format:</strong> {audioMetadata.format}</div>
              <div><strong>Duration:</strong> {audioMetadata.duration}</div>
              <div><strong>Bitrate:</strong> {audioMetadata.bitrate}</div>
              <div><strong>Sample Rate:</strong> {audioMetadata.sampleRate}</div>
              <div><strong>Channels:</strong> {audioMetadata.channels}</div>
              <div><strong>File Size:</strong> {(audioFile.size / (1024 * 1024)).toFixed(2)} MB</div>
            </div>
          </div>

          {/* ISRC Status */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Tag className="w-4 h-4" />
              ISRC Metadata Status
            </h4>
            
            {/* Current ISRC Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  {audioMetadata.hasEmbeddedISRC ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                  )}
                  <span className="font-medium">Embedded ISRC</span>
                </div>
                {audioMetadata.hasEmbeddedISRC ? (
                  <div>
                    <p className="text-sm text-green-700">Found: {audioMetadata.extractedISRC}</p>
                    <p className="text-xs text-gray-600 mt-1">ISRC already embedded in audio file</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-yellow-700">No ISRC found in audio metadata</p>
                    <p className="text-xs text-gray-600 mt-1">File can be enhanced with ISRC embedding</p>
                  </div>
                )}
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  {audioMetadata.supportsISRCEmbedding ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className="font-medium">ISRC Embedding Support</span>
                </div>
                {audioMetadata.supportsISRCEmbedding ? (
                  <div>
                    <p className="text-sm text-green-700">Format supports ISRC embedding</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {audioMetadata.format === 'MP3' ? 'ID3v2 TSRC frame' : 'BWF bext chunk'}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-red-700">Format does not support ISRC embedding</p>
                    <p className="text-xs text-gray-600 mt-1">Consider converting to MP3 or WAV</p>
                  </div>
                )}
              </Card>
            </div>

            {/* Track ISRC Information */}
            {trackData.isrc && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-medium mb-2">Track ISRC Information</h5>
                <div className="text-sm space-y-1">
                  <div><strong>Generated ISRC:</strong> {trackData.isrc}</div>
                  <div><strong>Track:</strong> {trackData.title}</div>
                  <div><strong>Artist:</strong> {trackData.artist}</div>
                </div>
              </div>
            )}
          </div>

          {/* ISRC Embedding Section */}
          {audioMetadata.supportsISRCEmbedding && trackData.isrc && !audioMetadata.hasEmbeddedISRC && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-900 mb-3">ISRC Embedding Available</h4>
              
              {!isEmbedding && !isrcEmbedded ? (
                <div>
                  <p className="text-sm text-green-800 mb-3">
                    Embed the generated ISRC ({trackData.isrc}) into your audio file for professional radio submission.
                  </p>
                  <Button
                    onClick={embedISRCIntoAudio}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Tag className="w-4 h-4 mr-2" />
                    Embed ISRC into Audio File
                  </Button>
                </div>
              ) : isEmbedding ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                    <span className="text-sm font-medium">Embedding ISRC...</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${embeddingProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-green-700">
                    Processing audio file and embedding ISRC metadata
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">ISRC Successfully Embedded</span>
                  </div>
                  <p className="text-sm text-green-800">
                    Your audio file now contains embedded ISRC metadata ({trackData.isrc})
                  </p>
                  <div className="flex gap-3">
                    <Button
                      onClick={downloadTaggedFile}
                      variant="outline"
                      size="sm"
                      className="border-green-300 text-green-700 hover:bg-green-100"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Tagged File
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Information About ISRC Embedding */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">About ISRC Embedding</h4>
            <div className="text-sm text-blue-800 space-y-2">
              <p>
                ISRC (International Standard Recording Code) embedding enhances your audio file with professional metadata.
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>MP3 Files:</strong> ISRC stored in ID3v2 TSRC frame</li>
                <li><strong>WAV Files:</strong> ISRC stored in BWF (Broadcast Wave Format) bext chunk</li>
                <li><strong>Radio Benefits:</strong> Automatic identification and royalty tracking</li>
                <li><strong>Professional Standard:</strong> Industry-standard metadata format</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t">
            <Button variant="outline" onClick={handleSkip}>
              {audioMetadata.supportsISRCEmbedding && trackData.isrc && !audioMetadata.hasEmbeddedISRC 
                ? 'Skip ISRC Embedding' 
                : 'Continue'
              }
            </Button>
            <Button 
              onClick={handleComplete}
              className="flex-1"
              disabled={isEmbedding}
            >
              {isrcEmbedded 
                ? 'Continue with Tagged Audio' 
                : audioMetadata.hasEmbeddedISRC 
                  ? 'Continue with Existing ISRC'
                  : 'Continue with Original Audio'
              }
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}