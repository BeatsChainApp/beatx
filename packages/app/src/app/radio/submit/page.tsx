'use client'

import RadioSubmissionWizard from '@/components/radio/RadioSubmissionWizard'

export default function RadioSubmitPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center">
            <span className="text-2xl mr-3">📻</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Radio Submission</h1>
              <p className="text-gray-600">Submit your track to South African radio stations</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="py-8">
        <RadioSubmissionWizard />
      </div>
    </div>
  )
}