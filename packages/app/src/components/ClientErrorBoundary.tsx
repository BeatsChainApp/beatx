'use client'

import React from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ClientErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Client-side error caught:', error, errorInfo)
    
    // Handle specific error types
    if (error.message?.includes('AppOnboardingManager')) {
      console.warn('Onboarding manager error - attempting recovery')
      if (typeof window !== 'undefined' && window.AppOnboardingManager) {
        try {
          window.AppOnboardingManager.reset()
        } catch (e) {
          console.warn('Failed to reset onboarding manager:', e)
        }
      }
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      const isHydrationError = this.state.error?.message?.includes('Hydration') || 
                              this.state.error?.message?.includes('Minified React error #418') ||
                              this.state.error?.message?.includes('Minified React error #310')
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 max-w-2xl">
            <div className="text-6xl mb-4">{isHydrationError ? '🔄' : '⚠️'}</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {isHydrationError ? 'Loading Issue Detected' : 'Something went wrong'}
            </h2>
            <p className="text-gray-600 mb-6">
              {isHydrationError 
                ? 'The app is recovering from a loading mismatch. This usually resolves automatically.'
                : 'A client-side error occurred. Please try refreshing the page to continue.'
              }
            </p>
            
            <div className="flex gap-4 justify-center">
              <button
                onClick={this.handleRetry}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium"
              >
                🔄 Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
              >
                🔃 Refresh Page
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}