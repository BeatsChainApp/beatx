'use client'

import ResponsiveWrapper from '@/components/ResponsiveWrapper'
import UniversalLayout from '@/components/UniversalLayout'
import RadioSubmissionWizard from '@/components/radio/RadioSubmissionWizard'

export default function RadioSubmitPage() {
  return (
    <UniversalLayout requireAuth={true} allowedRoles={["producer","admin","super_admin"]}>
      <ResponsiveWrapper pageType="upload">
        <RadioSubmitPageContent />
      </ResponsiveWrapper>
    </UniversalLayout>
  )
}

function RadioSubmitPageContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center">
            <span className="text-2xl mr-3 mobile-heading">📻</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mobile-heading">Radio Submission</h1>
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