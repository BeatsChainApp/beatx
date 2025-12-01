export interface ISRCResult {
  isrc: string
  generated: boolean
  valid: boolean
}

export class AppISRCManager {
  private registrantCode = '80G'
  private territory = 'ZA'

  async generateISRC(metadata: { title: string; artist: string; userId?: string }): Promise<ISRCResult> {
    try {
      const mcpUrl = process.env.NEXT_PUBLIC_MCP_SERVER_URL
      if (!mcpUrl) throw new Error('MCP server URL not configured')

      const response = await fetch(`${mcpUrl}/api/isrc/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackTitle: metadata.title,
          artistName: metadata.artist,
          userId: metadata.userId,
          territory: this.territory,
          registrant: this.registrantCode
        })
      })

      if (!response.ok) throw new Error('ISRC generation failed')

      const result = await response.json()
      return {
        isrc: result.isrc,
        generated: true,
        valid: this.validateISRC(result.isrc)
      }
    } catch (error) {
      console.error('ISRC generation error:', error)
      return {
        isrc: '',
        generated: false,
        valid: false
      }
    }
  }

  validateISRC(isrc: string): boolean {
    if (!isrc) return false
    const pattern = /^ZA-80G-\d{2}-\d{5}$/
    return pattern.test(isrc.trim())
  }

  async integrateWithRadioSystem(radioMetadata: any) {
    if (!radioMetadata.isrc && radioMetadata.title && radioMetadata.artistName) {
      const result = await this.generateISRC({
        title: radioMetadata.title,
        artist: radioMetadata.artistName,
        userId: radioMetadata.userId
      })
      
      return {
        ...radioMetadata,
        isrc: result.isrc,
        isrcGenerated: result.generated,
        radioISRC: true,
        samroReady: true
      }
    }
    return radioMetadata
  }
}