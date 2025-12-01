'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface Contributor {
  name: string
  role: string
  percentage: number
  idNumber: string
  samroNumber?: string
}

interface SignatureStepProps {
  contributors: Contributor[]
  onComplete: (signatures: any) => void
  onSkip: () => void
}

export default function SignatureStep({ contributors, onComplete, onSkip }: SignatureStepProps) {
  const [signatureMode, setSignatureMode] = useState<'digital' | 'manual'>('digital')
  const [signatures, setSignatures] = useState<Map<number, any>>(new Map())
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([])

  useEffect(() => {
    if (signatureMode === 'digital') {
      initializeSignaturePads()
    }
  }, [signatureMode, contributors])

  const initializeSignaturePads = () => {
    contributors.forEach((_, index) => {
      const canvas = canvasRefs.current[index]
      if (canvas) {
        const ctx = canvas.getContext('2d')
        if (ctx) {
          setupSignaturePad(canvas, ctx, index)
        }
      }
    })
  }

  const setupSignaturePad = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, index: number) => {
    let drawing = false
    let isEmpty = true

    ctx.strokeStyle = '#000'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'

    const startDrawing = (e: MouseEvent | TouchEvent) => {
      drawing = true
      isEmpty = false
      const rect = canvas.getBoundingClientRect()
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
      
      ctx.beginPath()
      ctx.moveTo(clientX - rect.left, clientY - rect.top)
      
      updateSignatureStatus(index, true)
    }

    const draw = (e: MouseEvent | TouchEvent) => {
      if (!drawing) return
      const rect = canvas.getBoundingClientRect()
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
      
      ctx.lineTo(clientX - rect.left, clientY - rect.top)
      ctx.stroke()
    }

    const stopDrawing = () => {
      drawing = false
    }

    canvas.addEventListener('mousedown', startDrawing)
    canvas.addEventListener('mousemove', draw)
    canvas.addEventListener('mouseup', stopDrawing)
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault()
      startDrawing(e)
    })
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault()
      draw(e)
    })
    canvas.addEventListener('touchend', stopDrawing)

    // Store canvas reference for clearing
    setSignatures(prev => new Map(prev.set(index, { canvas, ctx, isEmpty: () => isEmpty, clear: () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      isEmpty = true
      updateSignatureStatus(index, false)
    }})))
  }

  const updateSignatureStatus = (index: number, signed: boolean) => {
    const statusElement = document.getElementById(`status-${index}`)
    if (statusElement) {
      statusElement.textContent = signed ? '✅ Signed' : 'Not Signed'
    }
  }

  const clearSignature = (index: number) => {
    const signature = signatures.get(index)
    if (signature) {
      signature.clear()
    }
  }

  const handleComplete = async () => {
    if (signatureMode === 'digital') {
      // Validate all signatures
      for (let i = 0; i < contributors.length; i++) {
        const signature = signatures.get(i)
        if (!signature || signature.isEmpty()) {
          alert(`Please sign for ${contributors[i].name}`)
          return
        }
      }

      // Collect signature data
      const signatureData = contributors.map((contributor, index) => ({
        contributor,
        signature: signatures.get(index)?.canvas.toDataURL(),
        timestamp: new Date().toISOString()
      }))

      onComplete({ mode: 'digital', signatures: signatureData })
    } else {
      // Manual signing mode
      onComplete({
        mode: 'manual',
        contributors,
        exportedAt: new Date().toISOString(),
        instructions: {
          steps: [
            'Print the SAMRO Composer Split Confirmation document',
            'Each contributor must sign in their designated signature area',
            'Scan or photograph the signed document',
            'Include signed document with radio submission package'
          ]
        }
      })
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">✍️ Signature Confirmation</h2>
        <p className="text-gray-600">Final step: Sign the SAMRO documentation</p>
      </div>

      <div className="mb-6">
        <div className="flex gap-6 p-4 bg-gray-50 rounded-lg">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="signature-mode"
              value="digital"
              checked={signatureMode === 'digital'}
              onChange={(e) => setSignatureMode(e.target.value as 'digital')}
            />
            <span className="font-medium">Digital Signature (Sign Now)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="signature-mode"
              value="manual"
              checked={signatureMode === 'manual'}
              onChange={(e) => setSignatureMode(e.target.value as 'manual')}
            />
            <span className="font-medium">Manual Signature (Export & Sign Later)</span>
          </label>
        </div>
      </div>

      {signatureMode === 'digital' ? (
        <div className="space-y-6">
          {contributors.map((contributor, index) => (
            <div key={index} className="p-4 border rounded-lg bg-gray-50">
              <div className="mb-3">
                <strong>{contributor.name}</strong> ({contributor.role} - {contributor.percentage}%)
              </div>
              <div className="flex flex-col items-center">
                <canvas
                  ref={(el) => (canvasRefs.current[index] = el)}
                  width={400}
                  height={120}
                  className="border-2 border-blue-500 rounded bg-white cursor-crosshair"
                />
                <div className="flex justify-between items-center w-full max-w-md mt-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => clearSignature(index)}
                  >
                    Clear
                  </Button>
                  <span id={`status-${index}`} className="text-sm font-medium text-gray-600">
                    Not Signed
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="space-y-4">
            <p className="text-lg">📄 Documents will be exported for manual signing</p>
            <p className="text-lg">✅ All contributors must sign before radio submission</p>
          </div>
        </div>
      )}

      <div className="flex justify-between mt-8 pt-6 border-t">
        <Button variant="outline" onClick={onSkip}>
          Skip Signatures
        </Button>
        <Button onClick={handleComplete}>
          Complete & Generate Package
        </Button>
      </div>
    </div>
  )
}