'use client'

import { useState } from 'react'

export function useFileUpload() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const uploadBeatAudio = async (file: File, beatId: string): Promise<string> => {
    if (!file) {
      throw new Error('No file provided')
    }

    setUploading(true)
    setProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('beatId', beatId)
      formData.append('platform', 'app')

      const mcpUrl = process.env.NEXT_PUBLIC_MCP_SERVER_URL
      if (!mcpUrl) {
        throw new Error('MCP server not configured')
      }

      const response = await fetch(`${mcpUrl}/api/upload`, {
        method: 'POST',
        body: formData,
        onUploadProgress: (progressEvent: any) => {
          if (progressEvent.lengthComputable) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            setProgress(percentCompleted)
          }
        }
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success && result.file) {
        const audioUrl = result.file.url || `https://gateway.pinata.cloud/ipfs/${result.file.cid}`
        setProgress(100)
        return audioUrl
      }

      throw new Error('Invalid response from server')
    } catch (error) {
      console.error('Upload error:', error)
      throw error
    } finally {
      setUploading(false)
      setTimeout(() => setProgress(0), 1000)
    }
  }

  return {
    uploadBeatAudio,
    uploading,
    progress
  }
}