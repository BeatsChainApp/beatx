// Security utilities for input sanitization and validation
export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

export function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_').substring(0, 255)
}

export function validateUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    const allowedDomains = [
      'localhost',
      '127.0.0.1',
      process.env.NEXT_PUBLIC_MCP_SERVER_URL?.replace(/^https?:\/\//, ''),
      'gateway.pinata.cloud',
      'ipfs.io'
    ].filter(Boolean)
    
    return allowedDomains.some(domain => parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`))
  } catch {
    return false
  }
}

export function validateFormData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!data.title?.trim()) errors.push('Title is required')
  if (!data.stageName?.trim()) errors.push('Artist name is required')
  if (data.bpm < 60 || data.bpm > 200) errors.push('BPM must be between 60-200')
  
  return { isValid: errors.length === 0, errors }
}