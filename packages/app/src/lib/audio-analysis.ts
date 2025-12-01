export interface AudioAnalysis {
  duration: number
  bitrate: number
  sampleRate: number
  format: string
  extractedISRC?: string
  hasEmbeddedISRC: boolean
  supportsISRCEmbedding: boolean
}

export interface TrackMetadata {
  title: string
  artist: string
  genre?: string
  language?: string
  isrc?: string
  duration?: number
}

export class AppAudioAnalyzer {
  async analyzeAudioFile(file: File): Promise<AudioAnalysis> {
    const format = this.getFileFormat(file.name)
    
    return new Promise((resolve, reject) => {
      const audio = new Audio()
      const url = URL.createObjectURL(file)
      
      audio.onloadedmetadata = () => {
        const analysis: AudioAnalysis = {
          duration: audio.duration,
          bitrate: 320, // Estimated
          sampleRate: 44100, // Standard
          format,
          hasEmbeddedISRC: false,
          supportsISRCEmbedding: ['mp3', 'wav'].includes(format.toLowerCase())
        }
        
        URL.revokeObjectURL(url)
        resolve(analysis)
      }
      
      audio.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('Failed to analyze audio file'))
      }
      
      audio.src = url
    })
  }

  async extractMetadata(file: File): Promise<TrackMetadata> {
    // Basic metadata extraction from filename
    const name = file.name.replace(/\.[^/.]+$/, "")
    const parts = name.split(' - ')
    
    return {
      title: parts[1] || name,
      artist: parts[0] || 'Unknown Artist',
      duration: 0
    }
  }

  private getFileFormat(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase()
    return ext || 'unknown'
  }
}