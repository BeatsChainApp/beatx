'use client'

import EnhancedBeatUpload from '@/components/EnhancedBeatUpload'
import ProtectedRoute from '@/components/ProtectedRoute'

export const dynamic = 'force-dynamic'

export default function UploadPage() {
  return (
    <ProtectedRoute permission="upload" requireWallet={true}>
      <EnhancedBeatUpload />
    </ProtectedRoute>
  )
}