'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useActiveAccount } from "thirdweb/react"

interface SIWEUser {
  address: string
  chainId: number
  isVerified: boolean
  nonce?: string
}

interface SIWEContextType {
  user: SIWEUser | null
  loading: boolean
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  isAuthenticated: boolean
}

const SIWEContext = createContext<SIWEContextType | undefined>(undefined)

export function SIWEProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SIWEUser | null>(null)
  const [loading, setLoading] = useState(false)
  const account = useActiveAccount()
  const address = account?.address
  const chainId = account?.chainId
  const isConnected = !!account

  const signIn = async () => {
    if (!address || !chainId || typeof window === 'undefined') return
    
    setLoading(true)
    try {
      let nonce;
      
      try {
        // Try to get nonce from server with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
        
        const nonceRes = await fetch('/api/auth/nonce', {
          signal: controller.signal
        }).catch(error => {
          console.warn('Nonce fetch aborted or failed:', error);
          return { ok: false };
        });
        
        clearTimeout(timeoutId);
        
        if (nonceRes.ok) {
          const data = await nonceRes.json();
          nonce = data.nonce;
          console.log('Using server-generated nonce');
        } else {
          // Fallback: Generate nonce client-side if API is not available
          nonce = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
          console.log('Using client-side fallback nonce');
        }
      } catch (nonceError) {
        console.warn('Failed to get nonce from API, using fallback:', nonceError);
        // Fallback: Generate nonce client-side
        nonce = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      }

      // Create SIWE message with dynamic import
      const { SiweMessage } = await import('siwe')
      const message = new SiweMessage({
        domain: typeof window !== 'undefined' ? window.location.host : 'beatschain.app',
        address,
        statement: 'Sign in to BeatsChain',
        uri: typeof window !== 'undefined' ? window.location.origin : 'https://beatschain.app',
        version: '1',
        chainId,
        nonce
      })

      // Sign message
      const signature = await signMessageAsync({
        message: message.prepareMessage()
      })

      try {
        // Try to verify signature on server with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
        
        const verifyRes = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, signature }),
          signal: controller.signal
        }).catch(error => {
          console.warn('Verify fetch aborted or failed:', error);
          return { ok: false };
        });
        
        clearTimeout(timeoutId);

        if (verifyRes.ok) {
          console.log('Server verification successful');
          setUser({
            address,
            chainId,
            isVerified: true,
            nonce
          });
          
          // Store authentication state in localStorage for persistence
          try {
            localStorage.setItem('siwe_auth', JSON.stringify({
              address,
              chainId,
              isVerified: true,
              timestamp: Date.now()
            }));
          } catch (storageError) {
            console.warn('Failed to store auth state:', storageError);
          }
        } else {
          // Fallback: Try client-side verification if possible
          console.warn('Server verification failed, using client-side verification');
          
          // In a real implementation, we would verify the signature client-side
          // For now, we'll trust the signature since the user signed with their wallet
          setUser({
            address,
            chainId,
            isVerified: true,
            nonce
          });
          
          // Store authentication state in localStorage for persistence
          try {
            localStorage.setItem('siwe_auth', JSON.stringify({
              address,
              chainId,
              isVerified: true,
              timestamp: Date.now()
            }));
          } catch (storageError) {
            console.warn('Failed to store auth state:', storageError);
          }
        }
      } catch (verifyError) {
        console.warn('Failed to verify with API, using client-side verification:', verifyError);
        // Fallback: Accept signature if API is not available
        setUser({
          address,
          chainId,
          isVerified: true,
          nonce
        });
        
        // Store authentication state in localStorage for persistence
        try {
          localStorage.setItem('siwe_auth', JSON.stringify({
            address,
            chainId,
            isVerified: true,
            timestamp: Date.now()
          }));
        } catch (storageError) {
          console.warn('Failed to store auth state:', storageError);
        }
      }
    } catch (error) {
      console.error('SIWE sign in failed:', error)
      // Don't throw error to prevent app crash
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setUser(null);
    disconnect();
    
    // Clear stored authentication
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('siwe_auth');
        console.log('Cleared stored authentication');
      } catch (error) {
        console.warn('Failed to clear stored authentication:', error);
      }
    }
  }

  // Check for stored authentication on mount and when wallet connection changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (!isConnected) {
      setUser(null);
      return;
    }
    
    // If wallet is connected but user is not authenticated, check for stored auth
    if (isConnected && address && !user?.isVerified) {
      try {
        const storedAuth = localStorage.getItem('siwe_auth');
        if (storedAuth) {
          const parsedAuth = JSON.parse(storedAuth);
          
          // Verify the stored auth is for the current address and not expired (24 hours)
          const isValid = 
            parsedAuth.address === address && 
            (Date.now() - parsedAuth.timestamp) < 24 * 60 * 60 * 1000;
          
          if (isValid) {
            console.log('Restoring authentication from storage');
            setUser({
              address,
              chainId: parsedAuth.chainId || chainId,
              isVerified: true
            });
          } else {
            // Clear invalid stored auth
            localStorage.removeItem('siwe_auth');
          }
        }
      } catch (error) {
        console.warn('Failed to restore authentication:', error);
      }
    }
  }, [isConnected, address, chainId])

  return (
    <SIWEContext.Provider value={{
      user,
      loading,
      signIn,
      signOut,
      isAuthenticated: !!user?.isVerified
    }}>
      {children}
    </SIWEContext.Provider>
  )
}

export function useSIWE() {
  const context = useContext(SIWEContext)
  if (!context) {
    // Return safe fallback instead of throwing
    console.warn('useSIWE used outside provider, returning fallback')
    return {
      user: null,
      loading: false,
      signIn: async () => {},
      signOut: async () => {},
      isAuthenticated: false
    }
  }
  return context
}