'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface Contributor {
  id: string
  name: string
  role: 'Composer' | 'Lyricist' | 'Producer' | 'Artist'
  percentage: number
  idNumber: string
  samroNumber?: string
}

interface Props {
  onComplete: (contributors: Contributor[]) => void
}

export default function SplitsheetManager({ onComplete }: Props) {
  const [contributors, setContributors] = useState<Contributor[]>([
    { id: '1', name: '', role: 'Composer', percentage: 100, idNumber: '' }
  ])

  const addContributor = () => {
    const newId = Date.now().toString()
    setContributors([...contributors, {
      id: newId,
      name: '',
      role: 'Composer',
      percentage: 0,
      idNumber: ''
    }])
  }

  const updateContributor = (id: string, field: keyof Contributor, value: any) => {
    setContributors(contributors.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ))
  }

  const removeContributor = (id: string) => {
    setContributors(contributors.filter(c => c.id !== id))
  }

  const getTotalPercentage = () => {
    return contributors.reduce((sum, c) => sum + c.percentage, 0)
  }

  const isValid = () => {
    return getTotalPercentage() === 100 && 
           contributors.every(c => c.name && c.idNumber && c.percentage > 0)
  }

  const handleSave = () => {
    if (isValid()) {
      onComplete(contributors)
    }
  }

  const handleSkip = () => {
    onComplete([])
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-900">📊 Splitsheet Management</h3>
        <p className="text-blue-700">Define contributor splits for radio submission</p>
      </div>

      <div className="space-y-4">
        {contributors.map((contributor) => (
          <div key={contributor.id} className="border rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="Full Legal Name"
                value={contributor.name}
                onChange={(e) => updateContributor(contributor.id, 'name', e.target.value)}
                className="border rounded px-3 py-2"
              />
              
              <select
                value={contributor.role}
                onChange={(e) => updateContributor(contributor.id, 'role', e.target.value)}
                className="border rounded px-3 py-2"
              >
                <option value="Composer">Composer</option>
                <option value="Lyricist">Lyricist</option>
                <option value="Producer">Producer</option>
                <option value="Artist">Artist</option>
              </select>
              
              <input
                type="number"
                placeholder="Percentage"
                min="0"
                max="100"
                value={contributor.percentage}
                onChange={(e) => updateContributor(contributor.id, 'percentage', Number(e.target.value))}
                className="border rounded px-3 py-2"
              />
              
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="ID/Passport Number"
                  value={contributor.idNumber}
                  onChange={(e) => updateContributor(contributor.id, 'idNumber', e.target.value)}
                  className="border rounded px-3 py-2 flex-1"
                />
                {contributors.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeContributor(contributor.id)}
                  >
                    ×
                  </Button>
                )}
              </div>
            </div>
            
            <input
              type="text"
              placeholder="SAMRO Member Number (Optional)"
              value={contributor.samroNumber || ''}
              onChange={(e) => updateContributor(contributor.id, 'samroNumber', e.target.value)}
              className="border rounded px-3 py-2 w-full"
            />
          </div>
        ))}
      </div>

      <Button onClick={addContributor} variant="outline" className="w-full">
        + Add Contributor
      </Button>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium">Total Percentage:</span>
          <span className={`font-bold ${getTotalPercentage() === 100 ? 'text-green-600' : 'text-red-600'}`}>
            {getTotalPercentage()}%
          </span>
        </div>
        {getTotalPercentage() !== 100 && (
          <p className="text-red-600 text-sm">Total must equal 100%</p>
        )}
      </div>

      <div className="flex gap-4">
        <Button variant="outline" onClick={handleSkip}>
          Skip (Use Default)
        </Button>
        <Button onClick={handleSave} disabled={!isValid()}>
          Save Splitsheets
        </Button>
      </div>
    </div>
  )
}