'use client'

import { useState, useEffect } from 'react'

interface RadioAnalytics {
  totalSubmissions: number
  successRate: number
  totalRevenue: number
  avgRevenue: number
  placementRevenue: any[]
  submissionTrends: any[]
  recentSubmissions: any[]
}

export default function RadioAnalyticsPage() {
  const [analytics, setAnalytics] = useState<RadioAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data for now
    setTimeout(() => {
      setAnalytics({
        totalSubmissions: 24,
        successRate: 87.5,
        totalRevenue: 567.50,
        avgRevenue: 23.65,
        placementRevenue: [],
        submissionTrends: [],
        recentSubmissions: []
      })
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <p>Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center">
            <span className="text-2xl mr-3">📊</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Radio Analytics</h1>
              <p className="text-gray-600">Track your radio submission performance</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <span className="text-2xl mr-3">📻</span>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {analytics?.totalSubmissions || 0}
                </div>
                <div className="text-sm text-gray-600">Total Submissions</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <span className="text-2xl mr-3">✅</span>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {analytics?.successRate || 0}%
                </div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <span className="text-2xl mr-3">💰</span>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  R{analytics?.totalRevenue || 0}
                </div>
                <div className="text-sm text-gray-600">Revenue Generated</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <span className="text-2xl mr-3">📈</span>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  R{analytics?.avgRevenue || 0}
                </div>
                <div className="text-sm text-gray-600">Avg. Per Submission</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Placement Revenue</h3>
            <div className="space-y-3">
              {[
                { name: 'Upload Complete', revenue: 2.50, count: 24 },
                { name: 'Metadata Complete', revenue: 2.00, count: 22 },
                { name: 'Splitsheet Complete', revenue: 3.50, count: 18 },
                { name: 'SAMRO Complete', revenue: 4.00, count: 15 },
                { name: 'ISRC Complete', revenue: 2.50, count: 21 },
                { name: 'Package Ready', revenue: 5.00, count: 20 },
                { name: 'Submission Success', revenue: 6.00, count: 19 }
              ].map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">{item.name}</span>
                  <div className="text-right">
                    <div className="font-bold text-green-600">R{(item.revenue * item.count).toFixed(2)}</div>
                    <div className="text-sm text-gray-600">{item.count} events</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Recent Submissions</h3>
            <div className="space-y-3">
              {[
                { title: 'Summer Vibes', artist: 'DJ Maphorisa', status: 'Completed', revenue: 25.50 },
                { title: 'Amapiano Dreams', artist: 'Kabza De Small', status: 'In Progress', revenue: 18.00 },
                { title: 'Township Funk', artist: 'Black Coffee', status: 'Completed', revenue: 27.00 }
              ].map((submission, index) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <div className="font-medium">{submission.title}</div>
                    <div className="text-sm text-gray-600">{submission.artist}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">R{submission.revenue}</div>
                    <div className={`text-sm ${
                      submission.status === 'Completed' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {submission.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}