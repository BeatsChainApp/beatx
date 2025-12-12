'use client'

import { usePWA } from '@/hooks/usePWA'

export default function PWAInstallPrompt() {
  const { showInstallPrompt, installApp, dismissInstallPrompt } = usePWA()

  if (!showInstallPrompt) return null

  return (
    <div className="fixed bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 bg-gradient-to-br from-blue-600 to-blue-800 text-white p-3 sm:p-4 rounded-xl shadow-2xl z-50 max-w-sm mx-auto safe-area-inset-bottom">
      <div className="flex items-center gap-2 sm:gap-3 mb-3">
        <div className="text-xl sm:text-2xl">📱</div>
        <div className="flex-1">
          <h4 className="text-sm sm:text-base font-semibold mb-1">
            Install BeatsChain App
          </h4>
          <p className="text-xs sm:text-sm opacity-90">
            Get the full Web3 beat experience
          </p>
        </div>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={installApp}
          className="flex-1 bg-white bg-opacity-20 text-white border border-white border-opacity-30 py-2.5 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-medium hover:bg-opacity-30 transition-all active:scale-95 touch-manipulation"
        >
          📱 Install App
        </button>
        <button
          onClick={dismissInstallPrompt}
          className="bg-transparent text-white text-opacity-80 border-none p-2.5 rounded-lg text-sm hover:text-opacity-100 transition-all active:scale-95 touch-manipulation min-w-[44px] flex items-center justify-center"
          aria-label="Dismiss install prompt"
        >
          ✕
        </button>
      </div>
    </div>
  )
}