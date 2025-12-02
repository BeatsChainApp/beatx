'use client'

import { Suspense } from 'react'
import EnhancedBeatUpload from '@/components/EnhancedBeatUpload'
import ProtectedRoute from '@/components/ProtectedRoute'
import ErrorBoundaryWrapper from '@/components/ErrorBoundaryWrapper'

export const dynamic = 'force-dynamic'

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">🎵</div>
        <p className="text-gray-600">Loading upload page...</p>
      </div>
    </div>
  )
}

export default function UploadPage() {
  return (
    <ErrorBoundaryWrapper>
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute permission="upload">
          <EnhancedBeatUpload />
        </ProtectedRoute>
      </Suspense>
    </ErrorBoundaryWrapper>
  )
}