'use client'

import { useState, useEffect } from 'react'
import { useUnifiedAuth } from '@/context/UnifiedAuthContext'

interface IntegrationStatusProps {
  showInMobile?: boolean
  className?: string
}

export default function IntegrationStatus({ 
  showInMobile = false, 
  className = '' 
}: IntegrationStatusProps) {
  const { user } = useUnifiedAuth()
  const [mcpStatus, setMcpStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking')
  const [whatsappStatus, setWhatsappStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking')
  const [n8nStatus, setN8nStatus] = useState<'active' | 'inactive' | 'checking'>('checking')

  useEffect(() => {
    checkIntegrationStatus()
  }, [])

  const checkIntegrationStatus = async () => {
    // Check MCP Server
    try {
      const mcpUrl = process.env.NEXT_PUBLIC_MCP_SERVER_URL
      if (mcpUrl) {
        const response = await fetch(`${mcpUrl}/healthz`, { 
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        })
        setMcpStatus(response.ok ? 'connected' : 'disconnected')
      } else {
        setMcpStatus('disconnected')
      }
    } catch {
      setMcpStatus('disconnected')
    }

    // Check WhatsApp Gateway
    try {
      const whatsappUrl = process.env.NEXT_PUBLIC_WHATSAPP_GATEWAY_URL
      if (whatsappUrl) {
        const response = await fetch(`${whatsappUrl}/health`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        })
        setWhatsappStatus(response.ok ? 'connected' : 'disconnected')
      } else {
        setWhatsappStatus('disconnected')
      }
    } catch {
      setWhatsappStatus('disconnected')
    }

    // Check N8N Workflows (mock for now)
    setN8nStatus('active')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'active':
        return '🟢'
      case 'disconnected':
      case 'inactive':
        return '🔴'
      default:
        return '🟡'
    }
  }

  const containerClass = `
    ${showInMobile ? 'block' : 'hidden sm:block'}
    ${className}
  `.trim()

  return (
    <div className={containerClass}>
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h3 className="text-sm font-semibold mb-3 text-gray-700">System Status</h3>
        
        <div className="space-y-2 text-xs">
          {/* MCP Server Status */}
          <div className="flex items-center justify-between">
            <span className="text-gray-600">MCP Server</span>
            <div className="flex items-center gap-1">
              <span>{getStatusIcon(mcpStatus)}</span>
              <span className={`font-medium ${
                mcpStatus === 'connected' ? 'text-green-600' : 
                mcpStatus === 'disconnected' ? 'text-red-600' : 'text-yellow-600'
              }`}>
                {mcpStatus === 'checking' ? 'Checking...' : mcpStatus}
              </span>
            </div>
          </div>

          {/* WhatsApp Gateway Status */}
          <div className="flex items-center justify-between">
            <span className="text-gray-600">WhatsApp</span>
            <div className="flex items-center gap-1">
              <span>{getStatusIcon(whatsappStatus)}</span>
              <span className={`font-medium ${
                whatsappStatus === 'connected' ? 'text-green-600' : 
                whatsappStatus === 'disconnected' ? 'text-red-600' : 'text-yellow-600'
              }`}>
                {whatsappStatus === 'checking' ? 'Checking...' : whatsappStatus}
              </span>
            </div>
          </div>

          {/* N8N Workflows Status */}
          <div className="flex items-center justify-between">
            <span className="text-gray-600">N8N Workflows</span>
            <div className="flex items-center gap-1">
              <span>{getStatusIcon(n8nStatus)}</span>
              <span className={`font-medium ${
                n8nStatus === 'active' ? 'text-green-600' : 
                n8nStatus === 'inactive' ? 'text-red-600' : 'text-yellow-600'
              }`}>
                {n8nStatus === 'checking' ? 'Checking...' : n8nStatus}
              </span>
            </div>
          </div>

          {/* Extension Integration */}
          {user && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Extension</span>
              <div className="flex items-center gap-1">
                <span>🟢</span>
                <span className="font-medium text-green-600">synced</span>
              </div>
            </div>
          )}
        </div>

        {/* Refresh Button */}
        <button
          onClick={checkIntegrationStatus}
          className="mt-3 w-full text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-1 px-2 rounded transition-colors"
        >
          🔄 Refresh Status
        </button>
      </div>
    </div>
  )
}