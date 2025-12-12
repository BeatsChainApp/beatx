'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function RadioSubmissionCard() {
  const router = useRouter()

  return (
    <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 sm:p-6 rounded-lg text-white">
      <div className="flex flex-col sm:flex-row sm:items-center mb-4 sm:mb-6">
        <div className="flex items-center mb-3 sm:mb-0">
          <span className="text-xl sm:text-2xl mr-2 sm:mr-3">📻</span>
          <div>
            <h3 className="text-lg sm:text-xl font-bold">Radio Submission</h3>
            <p className="text-sm sm:text-base opacity-90">Submit your tracks to South African radio stations</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6 text-center">
        <div className="bg-white bg-opacity-20 rounded-lg p-3 sm:p-4">
          <div className="text-lg sm:text-2xl font-bold">7</div>
          <div className="text-xs sm:text-sm opacity-80">Simple Steps</div>
        </div>
        <div className="bg-white bg-opacity-20 rounded-lg p-3 sm:p-4">
          <div className="text-lg sm:text-2xl font-bold">SAMRO</div>
          <div className="text-xs sm:text-sm opacity-80">Compliant</div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <Button 
          onClick={() => router.push('/radio/submit')}
          className="bg-white text-purple-600 hover:bg-gray-100 flex-1 text-sm sm:text-base py-2 sm:py-3"
        >
          Start Submission
        </Button>
        <Button 
          variant="outline" 
          onClick={() => router.push('/radio/analytics')}
          className="border-white text-white hover:bg-white hover:text-purple-600 flex-1 text-sm sm:text-base py-2 sm:py-3"
        >
          View Analytics
        </Button>
      </div>
    </div>
  )
}