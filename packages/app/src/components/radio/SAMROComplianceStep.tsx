'use client'

import { useState } from 'react'
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

const Input = ({ className = '', ...props }: any) => (
  <input 
    className={`w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    {...props}
  />
)

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
import { Download, FileText, CheckCircle, ExternalLink } from 'lucide-react'

interface Contributor {
  name: string
  role: string
  percentage: number
  idNumber: string
  samroNumber?: string
}

interface Props {
  trackData: {
    title: string
    artist: string
    duration?: string
    isrc?: string
  }
  contributors: Contributor[]
  onComplete: (samroData: any) => void
  onSkip?: () => void
}

export default function SAMROComplianceStep({ trackData, contributors, onComplete, onSkip }: Props) {
  const [samroMemberNumber, setSamroMemberNumber] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPackage, setGeneratedPackage] = useState<any>(null)

  const generateSAMROPackage = async () => {
    setIsGenerating(true)
    
    try {
      // Simulate API call to generate SAMRO package
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const samroPackage = {
        documentType: 'SAMRO Composer Split Confirmation',
        trackTitle: trackData.title,
        artist: trackData.artist,
        isrc: trackData.isrc,
        duration: trackData.duration,
        memberNumber: samroMemberNumber,
        contributors: contributors.map(c => ({
          name: c.name,
          contribution: mapRoleToContribution(c.role),
          percentage: `${c.percentage}%`,
          idNumber: c.idNumber,
          samroNumber: c.samroNumber || 'Not provided',
          signature: '_________________________'
        })),
        generatedAt: new Date().toISOString(),
        instructions: {
          step1: 'Print the SAMRO Composer Split Confirmation document',
          step2: 'Fill in any missing information by hand',
          step3: 'All contributors must sign in designated areas',
          step4: 'Submit to SAMRO with your music registration',
          step5: 'Keep copies for all parties and radio submission'
        },
        compliance: {
          totalPercentage: contributors.reduce((sum, c) => sum + c.percentage, 0),
          allIdNumbersProvided: contributors.every(c => c.idNumber),
          samroCompliant: true
        },
        downloadLinks: {
          pdf: '/api/samro/generate-pdf',
          instructions: '/api/samro/generate-instructions'
        }
      }
      
      setGeneratedPackage(samroPackage)
    } catch (error) {
      console.error('SAMRO generation failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const mapRoleToContribution = (role: string): string => {
    const mapping: Record<string, string> = {
      'Composer': 'Music Composition',
      'Lyricist': 'Lyrics Writing',
      'Producer': 'Music Production', 
      'Artist': 'Performance and Vocals',
      'Songwriter': 'Music and Lyrics',
      'Vocalist': 'Vocals and Performance'
    }
    return mapping[role] || 'Music and Lyrics'
  }

  const downloadInstructions = () => {
    if (!generatedPackage) return

    const instructions = `SAMRO COMPOSER SPLIT CONFIRMATION - COMPLETION GUIDE

═══════════════════════════════════════════════════════════════
TRACK INFORMATION
═══════════════════════════════════════════════════════════════

Generated: ${new Date().toLocaleString()}
Track: "${generatedPackage.trackTitle}"
Artist: ${generatedPackage.artist}
ISRC: ${generatedPackage.isrc || 'To be assigned'}
Duration: ${generatedPackage.duration || 'Unknown'}
SAMRO Member: ${generatedPackage.memberNumber || 'Not provided'}

═══════════════════════════════════════════════════════════════
CONTRIBUTORS & SPLITS
═══════════════════════════════════════════════════════════════

${generatedPackage.contributors.map((c: any, i: number) => `
Contributor ${i + 1}:
  Name: ${c.name}
  Contribution: ${c.contribution}
  Split: ${c.percentage}
  ID/Passport: ${c.idNumber}
  SAMRO Number: ${c.samroNumber}
  Signature Required: Yes
`).join('')}

Total: ${generatedPackage.compliance.totalPercentage}%

═══════════════════════════════════════════════════════════════
COMPLETION STEPS
═══════════════════════════════════════════════════════════════

${Object.entries(generatedPackage.instructions).map(([key, value]) => 
  `□ ${key.replace('step', 'Step ')}: ${value}`
).join('\n')}

═══════════════════════════════════════════════════════════════
IMPORTANT NOTES
═══════════════════════════════════════════════════════════════

• This document is required for SAMRO registration
• All contributors must sign the physical document
• Keep copies for your records and radio submission
• Submit original to SAMRO with music registration
• Ensure all ID/Passport numbers are correctly filled

═══════════════════════════════════════════════════════════════
SAMRO CONTACT INFORMATION
═══════════════════════════════════════════════════════════════

Website: https://samro.org.za
Email: info@samro.org.za
Phone: +27 11 712 8000
Address: SAMRO House, 21 De Villiers Street, Braamfontein, 2001

═══════════════════════════════════════════════════════════════
GENERATED BY
═══════════════════════════════════════════════════════════════

BeatsChain Radio Submission System
Professional Music Industry Tools
Generated: ${new Date().toLocaleString()}

═══════════════════════════════════════════════════════════════`

    const blob = new Blob([instructions], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `SAMRO-Instructions-${trackData.title.replace(/[^a-zA-Z0-9]/g, '-')}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleComplete = () => {
    onComplete(generatedPackage)
  }

  const handleSkip = () => {
    if (onSkip) {
      onSkip()
    } else {
      onComplete({
        skipped: true,
        reason: 'User skipped SAMRO documentation',
        trackTitle: trackData.title
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🏛️ SAMRO Documentation
            {generatedPackage && <Badge variant="secondary" className="bg-green-100 text-green-800">Generated</Badge>}
          </CardTitle>
          <p className="text-sm text-gray-600">
            Generate official SAMRO Composer Split Confirmation documents for South African radio compliance
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Track Summary */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Track Summary</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><strong>Title:</strong> {trackData.title}</div>
              <div><strong>Artist:</strong> {trackData.artist}</div>
              {trackData.isrc && <div><strong>ISRC:</strong> {trackData.isrc}</div>}
              {trackData.duration && <div><strong>Duration:</strong> {trackData.duration}</div>}
            </div>
          </div>

          {/* Contributors Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-3">Contributors Summary</h4>
            <div className="space-y-2">
              {contributors.map((contributor, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <div>
                    <span className="font-medium">{contributor.name}</span>
                    <span className="text-gray-600 ml-2">({mapRoleToContribution(contributor.role)})</span>
                  </div>
                  <Badge variant="outline">{contributor.percentage}%</Badge>
                </div>
              ))}
            </div>
            <div className="border-t pt-2 mt-3">
              <div className="flex justify-between items-center font-medium">
                <span>Total:</span>
                <span>{contributors.reduce((sum, c) => sum + c.percentage, 0)}%</span>
              </div>
            </div>
          </div>

          {/* SAMRO Member Information */}
          <div className="space-y-3">
            <h4 className="font-medium">SAMRO Member Information (Optional)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Primary SAMRO Member Number</label>
                <Input
                  placeholder="e.g., 123456789"
                  value={samroMemberNumber}
                  onChange={(e) => setSamroMemberNumber(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  If you're a SAMRO member, provide your member number for faster processing
                </p>
              </div>
              <div className="flex items-end">
                <Alert>
                  <AlertDescription className="text-xs">
                    Not a SAMRO member? You can still submit. SAMRO membership is recommended for South African artists.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </div>

          {/* SAMRO Information */}
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-medium text-yellow-900 mb-2">About SAMRO Compliance</h4>
            <div className="text-sm text-yellow-800 space-y-2">
              <p>
                SAMRO (Southern African Music Rights Organisation) requires split confirmation for radio airplay royalties.
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>All contributors must be clearly identified with ID/Passport numbers</li>
                <li>Percentage splits must total exactly 100%</li>
                <li>Physical signatures are required on the printed document</li>
                <li>This document is essential for radio submission in South Africa</li>
              </ul>
              <div className="flex items-center gap-2 mt-3">
                <ExternalLink className="w-4 h-4" />
                <a 
                  href="https://samro.org.za" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Learn more about SAMRO
                </a>
              </div>
            </div>
          </div>

          {/* Generation Section */}
          {!generatedPackage ? (
            <div className="text-center py-6">
              <Button
                onClick={generateSAMROPackage}
                disabled={isGenerating}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating SAMRO Documents...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Generate SAMRO Documentation
                  </>
                )}
              </Button>
              <p className="text-sm text-gray-600 mt-2">
                This will create the official SAMRO Composer Split Confirmation document
              </p>
            </div>
          ) : (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h4 className="font-medium text-green-900">SAMRO Documentation Generated</h4>
              </div>
              
              <div className="space-y-3">
                <div className="text-sm text-green-800">
                  <p>Your SAMRO Composer Split Confirmation has been generated successfully.</p>
                  <p className="mt-1">Document includes all {contributors.length} contributors with proper field mapping.</p>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    onClick={downloadInstructions}
                    variant="outline"
                    size="sm"
                    className="border-green-300 text-green-700 hover:bg-green-100"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Instructions
                  </Button>
                  <Button
                    onClick={() => window.open('/api/samro/preview-pdf', '_blank')}
                    variant="outline"
                    size="sm"
                    className="border-green-300 text-green-700 hover:bg-green-100"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Preview PDF
                  </Button>
                </div>
                
                <div className="text-xs text-green-700 bg-green-100 p-2 rounded">
                  <strong>Next Steps:</strong> Print the document, have all contributors sign, and include with your radio submission package.
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t">
            <Button variant="outline" onClick={handleSkip}>
              Skip SAMRO Documentation
            </Button>
            <Button 
              onClick={handleComplete}
              disabled={!generatedPackage}
              className="flex-1"
            >
              {generatedPackage ? 'Continue with SAMRO Package' : 'Generate Documentation First'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}