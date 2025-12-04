'use client'

import { useState, FormEvent } from 'react'
import { useContactFormStyle } from '@/hooks/useContactFormStyle'
import { useActiveAccount } from "thirdweb/react"

interface Web3ContactFormProps {
  onSubmitSuccess?: () => void
}

export default function Web3ContactForm({ onSubmitSuccess }: Web3ContactFormProps) {
  const { style, loading } = useContactFormStyle()
  const account = useActiveAccount(); const address = account?.address
  
  const [formState, setFormState] = useState<Record<string, string>>({})
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value
    })
  }
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    try {
      setFormStatus('submitting')
      
      // Add wallet address to form data if connected
      const formData = {
        ...formState,
        walletAddress: address || 'Not connected'
      }
      
      // Send form data to API
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to submit form')
      }
      
      setFormStatus('success')
      setFormState({})
      
      if (onSubmitSuccess) {
        onSubmitSuccess()
      }
    } catch (error) {
      console.error('Contact form error:', error)
      setFormStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred')
    }
  }
  
  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-pulse">Loading form...</div>
      </div>
    )
  }
  
  return (
    <div style={{
      background: style.backgroundColor,
      borderRadius: style.borderRadius,
      padding: '2rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e5e7eb'
    }}>
      {formStatus === 'success' ? (
        <div className="text-center py-8">
          <div className="text-green-500 text-5xl mb-4">✓</div>
          <h3 className="text-xl font-semibold mb-2">Message Sent!</h3>
          <p className="text-gray-600">{style.successMessage}</p>
          <button
            onClick={() => setFormStatus('idle')}
            style={{
              background: style.accentColor,
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.375rem',
              border: 'none',
              marginTop: '1.5rem',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Send Another Message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {formStatus === 'error' && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              <p>{style.errorMessage}</p>
              <p className="text-sm mt-1">{errorMessage}</p>
            </div>
          )}
          
          {style.fields.map((field) => (
            <div key={field.name} className="mb-4">
              <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              
              {field.type === 'textarea' ? (
                <textarea
                  id={field.name}
                  name={field.name}
                  value={formState[field.name] || ''}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  required={field.required}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : field.type === 'select' ? (
                <select
                  id={field.name}
                  name={field.name}
                  value={formState[field.name] || ''}
                  onChange={handleChange}
                  required={field.required}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select an option</option>
                  {field.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  value={formState[field.name] || ''}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  required={field.required}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              )}
            </div>
          ))}
          
          {/* Web3 Connection Status */}
          <div className="mb-6 mt-4 flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${address ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className="text-sm text-gray-600">
              {address ? 'Wallet Connected: ' + address.slice(0, 6) + '...' + address.slice(-4) : 'Wallet Not Connected'}
            </span>
          </div>
          
          <button
            type="submit"
            disabled={formStatus === 'submitting'}
            style={{
              background: style.accentColor,
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.375rem',
              border: 'none',
              width: '100%',
              cursor: formStatus === 'submitting' ? 'not-allowed' : 'pointer',
              opacity: formStatus === 'submitting' ? 0.7 : 1,
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {formStatus === 'submitting' ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </>
            ) : style.submitButtonText}
          </button>
        </form>
      )}
    </div>
  )
}