'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import EnhancedSplitsheetManager from './EnhancedSplitsheetManager'
import SAMROComplianceStep from './SAMROComplianceStep'
import AudioTaggingStep from './AudioTaggingStep'

interface Step {
  id: string
  title: string
  component: React.ComponentType<any>
}

const steps: Step[] = [
  { id: 'upload', title: 'Upload Audio', component: AudioUploadStep },
  { id: 'metadata', title: 'Track Info', component: MetadataStep },
  { id: 'splitsheets', title: 'Splitsheets', component: EnhancedSplitsheetManager },
  { id: 'samro', title: 'SAMRO', component: SAMROComplianceStep },
  { id: 'tagging', title: 'Audio Tagging', component: AudioTaggingStep },
  { id: 'isrc', title: 'ISRC', component: ISRCStep },
  { id: 'package', title: 'Package', component: PackageStep },
  { id: 'download', title: 'Download', component: DownloadStep }
]

export default function RadioSubmissionWizard() {
  const [currentStep, setCurrentStep] = useState(0)
  const [submissionData, setSubmissionData] = useState<any>({})

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const updateData = (data: any) => {
    setSubmissionData(prev => ({ ...prev, ...data }))
  }

  const handleStepComplete = (stepData: any) => {
    updateData(stepData)
    handleNext()
  }

  const CurrentComponent = steps[currentStep].component
  const currentStepData = steps[currentStep]

  // Pass appropriate props based on current step
  const getStepProps = () => {
    const baseProps = {
      data: submissionData,
      onUpdate: updateData,
      onNext: handleNext,
      onPrev: handlePrev
    }

    switch (currentStepData.id) {
      case 'splitsheets':
        return {
          trackData: submissionData.trackData,
          onComplete: handleStepComplete,
          onSkip: handleNext
        }
      case 'samro':
        return {
          trackData: submissionData.trackData,
          contributors: submissionData.contributors || [],
          onComplete: handleStepComplete,
          onSkip: handleNext
        }
      case 'tagging':
        return {
          audioFile: submissionData.audioFile,
          trackData: submissionData.trackData,
          onComplete: handleStepComplete,
          onSkip: handleNext
        }
      default:
        return baseProps
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                index <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {index + 1}
              </div>
              <span className="ml-2 text-sm font-medium hidden md:block">{step.title}</span>
              {index < steps.length - 1 && (
                <div className={`w-8 md:w-12 h-0.5 mx-2 md:mx-4 ${
                  index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold">{currentStepData.title}</h2>
          <p className="text-gray-600 text-sm">Step {currentStep + 1} of {steps.length}</p>
        </div>
      </div>

      {/* Step Content */}
      <div className="mb-6">
        <CurrentComponent {...getStepProps()} />
      </div>

      {/* Navigation - Only show for basic steps */}
      {!['splitsheets', 'samro', 'tagging'].includes(currentStepData.id) && (
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handlePrev}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          <Button 
            onClick={handleNext}
            disabled={currentStep === steps.length - 1}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}

// Placeholder components
function AudioUploadStep({ onUpdate, onNext }: any) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Upload Audio File</h3>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <p>Drag and drop your audio file here</p>
        <input type="file" accept="audio/*" className="mt-4" />
      </div>
    </div>
  )
}

function MetadataStep({ onUpdate }: any) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Track Information</h3>
      <div className="grid grid-cols-2 gap-4">
        <input placeholder="Track Title" className="border rounded p-2" />
        <input placeholder="Artist Name" className="border rounded p-2" />
      </div>
    </div>
  )
}

function SplitsheetsStep({ onUpdate }: any) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Splitsheet Management</h3>
      <p className="text-gray-600">Define contributor splits for radio submission</p>
    </div>
  )
}

function SAMROStep({ onUpdate }: any) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">SAMRO Documentation</h3>
      <p className="text-gray-600">Generate official SAMRO compliance documents</p>
    </div>
  )
}

function ISRCStep({ onUpdate }: any) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">ISRC Generation</h3>
      <p className="text-gray-600">Generate professional ISRC code</p>
    </div>
  )
}

function PackageStep({ onUpdate }: any) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Package Creation</h3>
      <p className="text-gray-600">Creating radio submission package</p>
    </div>
  )
}

function DownloadStep({ onUpdate }: any) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Download Package</h3>
      <p className="text-gray-600">Your radio submission package is ready</p>
    </div>
  )
}