'use client'

import { ConnectButton } from 'thirdweb/react'
import { createThirdwebClient } from 'thirdweb'

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || '53c6d7d26b476a57e09e7706265a60bb'
})

import { useState } from 'react'
import { useUnifiedAuth } from '@/context/UnifiedAuthContext'
import CreatorRegistrationModal from './CreatorRegistrationModal'
import ProducerRegistrationModal from './ProducerRegistrationModal'

interface RoleSelectionModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function RoleSelectionModal({ isOpen, onClose }: RoleSelectionModalProps) {
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [showCreatorModal, setShowCreatorModal] = useState(false)
  const [showProducerModal, setShowProducerModal] = useState(false)
  const { isAuthenticated } = useUnifiedAuth()

  if (!isOpen) return null

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role)
    
    if (!isAuthenticated) {
      alert('Please connect your wallet first')
      return
    }
    
    if (role === 'creator') {
      setShowCreatorModal(true)
    } else if (role === 'producer') {
      setShowProducerModal(true)
    } else {
      onClose()
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Join BeatsChain</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            
            <p className="text-gray-600 mb-6">
              Connect your wallet to access all features
            </p>

            <div className="grid grid-cols-1 gap-4 mb-6">
              <button
                onClick={() => handleRoleSelect('user')}
                className="p-4 border-2 border-gray-200 hover:border-blue-300 rounded-lg text-left transition-all flex items-center"
              >
                <div className="text-2xl mr-3">🎧</div>
                <div>
                  <div className="font-medium">Music Lover</div>
                  <div className="text-sm text-gray-500">Browse and purchase beats</div>
                </div>
              </button>
              
              <button
                onClick={() => handleRoleSelect('producer')}
                className="p-4 border-2 border-gray-200 hover:border-blue-300 rounded-lg text-left transition-all flex items-center"
              >
                <div className="text-2xl mr-3">🎵</div>
                <div>
                  <div className="font-medium">Producer</div>
                  <div className="text-sm text-gray-500">Upload and sell your beats</div>
                </div>
              </button>
              
              <button
                onClick={() => handleRoleSelect('creator')}
                className="p-4 border-2 border-gray-200 hover:border-blue-300 rounded-lg text-left transition-all flex items-center"
              >
                <div className="text-2xl mr-3">🎨</div>
                <div>
                  <div className="font-medium">Content Creator</div>
                  <div className="text-sm text-gray-500">License beats for your content</div>
                </div>
              </button>
            </div>

            <div className="flex justify-center">
              {!isAuthenticated && (
                <ConnectButton client={client} />
              )}
            </div>
          </div>
        </div>
      </div>

      {showCreatorModal && (
        <CreatorRegistrationModal
          isOpen={showCreatorModal}
          onClose={() => {
            setShowCreatorModal(false)
            onClose()
          }}
          onSuccess={() => {
            setShowCreatorModal(false)
            onClose()
            window.location.reload()
          }}
        />
      )}
      
      {showProducerModal && (
        <ProducerRegistrationModal
          isOpen={showProducerModal}
          onClose={() => {
            setShowProducerModal(false)
            onClose()
          }}
          onSuccess={() => {
            setShowProducerModal(false)
            onClose()
            window.location.href = '/dashboard'
          }}
        />
      )}
    </>
  )
}