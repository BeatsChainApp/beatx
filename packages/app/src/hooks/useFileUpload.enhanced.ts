'use client'

import { useState } from 'react'

const MCP_SERVER_URL = process.env.NEXT_PUBLIC_MCP_SERVER_URL || 'https://beatx-mcp-server-production.up.railway.app'

export function useFileUpload() {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadBeatAudio = async (file: File, beatId: string): Promise<string> => {
    try {
      setUploading(true)
      setError(null)

      const formData = new FormData()
      formData.append('file', file)
      formData.append('platform', 'app')
      formData.append('metadata', JSON.stringify({
        type: 'audio',
        beat_id: beatId,
        original_name: file.name
      }))

      const response = await fetch(`${MCP_SERVER_URL}/api/upload`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success && result.file) {
        return result.file.url || `https://gateway.pinata.cloud/ipfs/${result.file.cid}`
      }
      
      throw new Error('Invalid upload response')
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setUploading(false)
    }
  }

  return {
    uploadBeatAudio,
    uploading,
    error
  }
}