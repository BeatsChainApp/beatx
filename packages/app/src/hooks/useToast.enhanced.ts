'use client'

export function useEnhancedToast() {
  const success = (message: string) => {
    if (typeof window !== 'undefined') {
      // Use browser notification or simple alert for now
      console.log('✅ Success:', message)
      // Could integrate with react-hot-toast or similar
    }
  }

  const error = (message: string) => {
    if (typeof window !== 'undefined') {
      console.error('❌ Error:', message)
      // Could integrate with react-hot-toast or similar
    }
  }

  const info = (message: string) => {
    if (typeof window !== 'undefined') {
      console.info('ℹ️ Info:', message)
    }
  }

  return {
    success,
    error,
    info
  }
}