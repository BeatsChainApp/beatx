'use client'

import { useState, useEffect } from 'react'
// Simple UI components for radio submission
const Button = ({ children, onClick, disabled, variant = 'default', size = 'default', className = '', ...props }: any) => {
  const baseClasses = 'px-4 py-2 rounded font-medium transition-colors'
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300'
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

const Select = ({ children, value, onValueChange }: any) => {
  return (
    <select 
      value={value} 
      onChange={(e) => onValueChange(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {children}
    </select>
  )
}
const SelectTrigger = ({ children }: any) => <>{children}</>
const SelectValue = () => null
const SelectContent = ({ children }: any) => <>{children}</>
const SelectItem = ({ value, children }: any) => <option value={value}>{children}</option>

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
    secondary: 'bg-gray-100 text-gray-800',
    outline: 'border border-gray-300 text-gray-700'
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
import { Trash2, Plus, CheckCircle, AlertCircle, Download } from 'lucide-react'

interface Contributor {
  id: string
  name: string
  role: 'Composer' | 'Lyricist' | 'Producer' | 'Artist' | 'Songwriter' | 'Vocalist'
  percentage: number
  idNumber: string
  samroNumber?: string
  ipi?: string
}

interface ValidationError {
  field: string
  message: string
}

interface Props {
  trackData?: {
    title: string
    artist: string
    duration?: string
  }
  onComplete: (data: {
    contributors: Contributor[]
    splitsheetData: any
    samroPackage?: any
  }) => void
  onSkip?: () => void
}

export default function EnhancedSplitsheetManager({ trackData, onComplete, onSkip }: Props) {
  const [contributors, setContributors] = useState<Contributor[]>([
    {
      id: '1',
      name: trackData?.artist || '',
      role: 'Songwriter',
      percentage: 100,
      idNumber: '',
      samroNumber: ''
    }
  ])
  
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [isGeneratingSAMRO, setIsGeneratingSAMRO] = useState(false)
  const [samroPackage, setSamroPackage] = useState<any>(null)

  // Field mapping for SAMRO compliance
  const roleMapping = {
    'Composer': 'Music Composition',
    'Lyricist': 'Lyrics Writing', 
    'Producer': 'Music Production',
    'Artist': 'Performance and Vocals',
    'Songwriter': 'Music and Lyrics',
    'Vocalist': 'Vocals and Performance'
  }

  const addContributor = () => {
    const newId = Date.now().toString()
    setContributors([...contributors, {
      id: newId,
      name: '',
      role: 'Composer',
      percentage: 0,
      idNumber: '',
      samroNumber: ''
    }])
  }

  const updateContributor = (id: string, field: keyof Contributor, value: any) => {
    setContributors(contributors.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ))
  }

  const removeContributor = (id: string) => {
    if (contributors.length > 1) {
      setContributors(contributors.filter(c => c.id !== id))
    }
  }

  const getTotalPercentage = () => {
    return contributors.reduce((sum, c) => sum + (c.percentage || 0), 0)
  }

  const validateIdNumber = (idNumber: string): boolean => {
    if (!idNumber) return false
    
    // South African ID: 13 digits
    const saIdPattern = /^[0-9]{13}$/
    // Passport: 6-9 alphanumeric characters
    const passportPattern = /^[A-Z0-9]{6,9}$/
    
    return saIdPattern.test(idNumber) || passportPattern.test(idNumber)
  }

  const validateContributors = (): ValidationError[] => {
    const errors: ValidationError[] = []
    const totalPercentage = getTotalPercentage()

    // Check total percentage
    if (Math.abs(totalPercentage - 100) > 0.01) {
      errors.push({
        field: 'total',
        message: `Total percentage must equal 100% (currently ${totalPercentage}%)`
      })
    }

    // Check individual contributors
    contributors.forEach((contributor, index) => {
      if (!contributor.name?.trim()) {
        errors.push({
          field: `contributor-${index}-name`,
          message: `Contributor ${index + 1}: Name is required`
        })
      }

      if (!contributor.percentage || contributor.percentage <= 0) {
        errors.push({
          field: `contributor-${index}-percentage`,
          message: `Contributor ${index + 1}: Valid percentage is required`
        })
      }

      if (!validateIdNumber(contributor.idNumber)) {
        errors.push({
          field: `contributor-${index}-id`,
          message: `Contributor ${index + 1}: Valid ID/Passport required (SA ID: 13 digits, Passport: 6-9 chars)`
        })
      }
    })

    return errors
  }

  const generateSAMROPackage = async () => {
    setIsGeneratingSAMRO(true)
    
    try {
      // Simulate SAMRO package generation (in real implementation, call API)
      const samroData = {
        trackTitle: trackData?.title || 'Untitled Track',
        contributors: contributors.map(c => ({
          name: c.name,
          contribution: roleMapping[c.role],
          percentage: `${c.percentage}%`,
          idNumber: c.idNumber,
          samroNumber: c.samroNumber || 'Not provided',
          signature: '_________________________'
        })),
        generatedAt: new Date().toISOString(),
        instructions: {
          step1: 'Print this document',
          step2: 'Fill in any missing information by hand',
          step3: 'Sign in the designated signature areas',
          step4: 'Submit to SAMRO with your music registration',
          step5: 'Keep copies for all parties involved'
        }
      }
      
      setSamroPackage(samroData)
    } catch (error) {
      console.error('SAMRO generation failed:', error)
    } finally {
      setIsGeneratingSAMRO(false)
    }
  }

  const handleSave = () => {
    const errors = validateContributors()
    setValidationErrors(errors)

    if (errors.length === 0) {
      const splitsheetData = {
        trackInfo: {
          title: trackData?.title,
          artist: trackData?.artist,
          duration: trackData?.duration,
          createdDate: new Date().toISOString()
        },
        contributors: contributors.map(c => ({
          ...c,
          contribution: roleMapping[c.role],
          royaltyShare: (c.percentage / 100).toFixed(4)
        })),
        validation: {
          totalPercentage: getTotalPercentage(),
          isValid: true,
          samroCompliant: true
        },
        metadata: {
          generatedBy: 'BeatsChain Radio Submission System',
          generatedDate: new Date().toISOString(),
          version: '2.0'
        }
      }

      onComplete({
        contributors,
        splitsheetData,
        samroPackage
      })
    }
  }

  const handleSkip = () => {
    if (onSkip) {
      onSkip()
    } else {
      // Use default 100% to main artist
      const defaultData = {
        contributors: [{
          id: '1',
          name: trackData?.artist || 'Unknown Artist',
          role: 'Songwriter' as const,
          percentage: 100,
          idNumber: '',
          samroNumber: ''
        }],
        splitsheetData: {
          skipped: true,
          reason: 'User skipped splitsheet entry'
        }
      }
      onComplete(defaultData)
    }
  }

  const downloadSAMROInstructions = () => {
    if (!samroPackage) return

    const instructions = `SAMRO COMPOSER SPLIT CONFIRMATION - COMPLETION INSTRUCTIONS

═══════════════════════════════════════════════════════════════
TRACK INFORMATION
═══════════════════════════════════════════════════════════════

Generated: ${new Date().toLocaleString()}
Track: "${samroPackage.trackTitle}"
Artist: ${trackData?.artist || 'Unknown Artist'}

═══════════════════════════════════════════════════════════════
FORM COMPLETION CHECKLIST
═══════════════════════════════════════════════════════════════

□ Date field: ${new Date().toLocaleDateString()}
□ Composition title: "${samroPackage.trackTitle}"

COMPOSER INFORMATION:
${samroPackage.contributors.map((contributor: any, index: number) => `
□ Composer ${index + 1}:
  Name: ${contributor.name}
  Contribution: ${contributor.contribution}
  Split: ${contributor.percentage}
  SAMRO Number: ${contributor.samroNumber}
  Signature: [Sign here]
  ID/Passport: ${contributor.idNumber}
`).join('')}

═══════════════════════════════════════════════════════════════
VERIFICATION CHECKLIST
═══════════════════════════════════════════════════════════════

□ Total percentage: ${getTotalPercentage()}% (Must equal 100%)
□ All signatures completed
□ All ID/Passport numbers filled
□ Date signed
□ All composer names match contributors

═══════════════════════════════════════════════════════════════
SUBMISSION PROCESS
═══════════════════════════════════════════════════════════════

□ Submit to SAMRO with music registration
□ Keep copy for your records
□ Include with radio submission package
□ Ensure all parties receive copies

═══════════════════════════════════════════════════════════════
CONTACT SAMRO
═══════════════════════════════════════════════════════════════

Website: https://samro.org.za
Email: info@samro.org.za
Phone: +27 11 712 8000

═══════════════════════════════════════════════════════════════`

    const blob = new Blob([instructions], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'SAMRO-Completion-Instructions.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const isValid = validationErrors.length === 0 && getTotalPercentage() === 100

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📊 Enhanced Splitsheet Management
            {isValid && <Badge variant="secondary" className="bg-green-100 text-green-800">Valid</Badge>}
          </CardTitle>
          <p className="text-sm text-gray-600">
            Define contributor splits with SAMRO compliance and field mapping
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Track Information */}
          {trackData && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900">Track Information</h4>
              <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                <div><strong>Title:</strong> {trackData.title}</div>
                <div><strong>Artist:</strong> {trackData.artist}</div>
                {trackData.duration && <div><strong>Duration:</strong> {trackData.duration}</div>}
              </div>
            </div>
          )}

          {/* Contributors */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Contributors & Splits</h4>
              <Button onClick={addContributor} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Contributor
              </Button>
            </div>

            {contributors.map((contributor, index) => (
              <Card key={contributor.id} className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Full Legal Name *</label>
                    <Input
                      placeholder="Full Legal Name"
                      value={contributor.name}
                      onChange={(e) => updateContributor(contributor.id, 'name', e.target.value)}
                      className={validationErrors.some(e => e.field === `contributor-${index}-name`) ? 'border-red-500' : ''}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Role *</label>
                    <Select
                      value={contributor.role}
                      onValueChange={(value) => updateContributor(contributor.id, 'role', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Composer">Composer</SelectItem>
                        <SelectItem value="Lyricist">Lyricist</SelectItem>
                        <SelectItem value="Producer">Producer</SelectItem>
                        <SelectItem value="Artist">Artist</SelectItem>
                        <SelectItem value="Songwriter">Songwriter</SelectItem>
                        <SelectItem value="Vocalist">Vocalist</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Percentage *</label>
                    <Input
                      type="number"
                      placeholder="%"
                      min="0"
                      max="100"
                      value={contributor.percentage || ''}
                      onChange={(e) => updateContributor(contributor.id, 'percentage', Number(e.target.value))}
                      className={validationErrors.some(e => e.field === `contributor-${index}-percentage`) ? 'border-red-500' : ''}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">ID/Passport *</label>
                    <Input
                      placeholder="ID/Passport Number"
                      value={contributor.idNumber}
                      onChange={(e) => updateContributor(contributor.id, 'idNumber', e.target.value)}
                      className={validationErrors.some(e => e.field === `contributor-${index}-id`) ? 'border-red-500' : ''}
                    />
                    <p className="text-xs text-gray-500 mt-1">SA ID: 13 digits, Passport: 6-9 chars</p>
                  </div>
                  
                  <div className="flex items-end">
                    {contributors.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeContributor(contributor.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="mt-3">
                  <label className="block text-sm font-medium mb-1">SAMRO Member Number (Optional)</label>
                  <Input
                    placeholder="SAMRO Member Number"
                    value={contributor.samroNumber || ''}
                    onChange={(e) => updateContributor(contributor.id, 'samroNumber', e.target.value)}
                  />
                </div>
                
                <div className="mt-2 text-sm text-gray-600">
                  <strong>SAMRO Contribution:</strong> {roleMapping[contributor.role]}
                </div>
              </Card>
            ))}
          </div>

          {/* Validation Summary */}
          <Card className={`p-4 ${isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Total Percentage:</span>
              <span className={`font-bold text-lg ${getTotalPercentage() === 100 ? 'text-green-600' : 'text-red-600'}`}>
                {getTotalPercentage()}%
              </span>
            </div>
            
            {validationErrors.length > 0 && (
              <div className="space-y-1">
                {validationErrors.map((error, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    {error.message}
                  </div>
                ))}
              </div>
            )}
            
            {isValid && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" />
                Splitsheets valid and SAMRO compliant
              </div>
            )}
          </Card>

          {/* SAMRO Package Generation */}
          {isValid && (
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h4 className="font-medium text-blue-900">SAMRO Documentation</h4>
                  <p className="text-sm text-blue-700">Generate official SAMRO compliance documents</p>
                </div>
                <Button
                  onClick={generateSAMROPackage}
                  disabled={isGeneratingSAMRO}
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  {isGeneratingSAMRO ? 'Generating...' : 'Generate SAMRO Docs'}
                </Button>
              </div>
              
              {samroPackage && (
                <div className="mt-3 p-3 bg-white rounded border">
                  <div className="flex justify-between items-center">
                    <div className="text-sm">
                      <div className="font-medium">SAMRO Package Ready</div>
                      <div className="text-gray-600">Composer Split Confirmation generated</div>
                    </div>
                    <Button
                      onClick={downloadSAMROInstructions}
                      size="sm"
                      variant="outline"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Instructions
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button variant="outline" onClick={handleSkip}>
              Skip (Use Default)
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!isValid}
              className="flex-1"
            >
              Save Splitsheets & Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}