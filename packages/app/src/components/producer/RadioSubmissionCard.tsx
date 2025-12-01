'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function RadioSubmissionCard() {
  const router = useRouter()

  return (
    <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-lg text-white">
      <div className="flex items-center mb-4">
        <span className="text-2xl mr-3">📻</span>
        <div>
          <h3 className="text-xl font-bold">Radio Submission</h3>
          <p className="opacity-90">Submit your tracks to South African radio stations</p>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-6 text-center">
        <div>
          <div className="text-2xl font-bold">7</div>
          <div className="text-sm opacity-80">Steps</div>
        </div>
        <div>
          <div className="text-2xl font-bold">R25+</div>
          <div className="text-sm opacity-80">Avg Revenue</div>
        </div>
        <div>
          <div className="text-2xl font-bold">SAMRO</div>
          <div className="text-sm opacity-80">Compliant</div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          onClick={() => router.push('/radio/submit')}
          className="bg-white text-purple-600 hover:bg-gray-100 flex-1"
        >
          Start Submission
        </Button>
        <Button 
          variant="outline" 
          onClick={() => router.push('/radio/analytics')}
          className="border-white text-white hover:bg-white hover:text-purple-600 flex-1"
        >
          View Analytics
        </Button>
      </div>
    </div>
  )
}