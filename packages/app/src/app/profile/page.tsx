'use client'

import ResponsiveWrapper from '@/components/ResponsiveWrapper'
import UniversalLayout from '@/components/UniversalLayout'
import { BackToDashboard } from '@/components/BackToDashboard'
import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ConnectButton, useActiveAccount } from 'thirdweb/react'
import { createThirdwebClient } from 'thirdweb'
import { useUnifiedProfile } from '@/hooks/useUnifiedProfile'
import { useUnifiedAuth } from '@/context/UnifiedAuthContext'
import { toast } from 'react-hot-toast'

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || '53c6d7d26b476a57e09e7706265a60bb'
});

export default function ProfilePage() {
  const account = useActiveAccount();
  const address = account?.address;
  const isConnected = !!account;
  const router = useRouter()
  const { user } = useUnifiedAuth()
  const { profile: unifiedProfile, loading, updateProfile: updateUnifiedProfile, syncStatus } = useUnifiedProfile()
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    bio: ''
  })
  
  // Use unified profile or user data
  const profile = unifiedProfile || user
  
  // Placeholder functions for removed features
  const uploadProfileImage = async (file: File) => {
    // TODO: Implement unified profile image upload
    return null
  }
  
  const removeProfileImage = async () => {
    // TODO: Implement unified profile image removal
    return false
  }
  
  const updateSettings = async (settings: any) => {
    // TODO: Implement unified settings update
    return true
  }
  
  const settings = {
    emailNotifications: true,
    marketingEmails: false,
    twoFactorAuth: false
  }
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize form data when profile loads - PRIORITY: Email-based profiles
  React.useEffect(() => {
    const profileData = profile || user
    if (profileData) {
      const displayName = profileData.display_name || profileData.displayName || ''
      const nameParts = displayName.split(' ') || ['', '']
      setFormData({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: profileData.email || user?.email || '',
        bio: profileData.bio || ''
      })
    }
  }, [profile, user])

  // PRIORITY: Check email authentication first
  if (!user) {
    return (
      <div className="p-8 text-center">
        <div className="text-6xl mb-4 mobile-heading">📧</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2 mobile-heading">Email Authentication Required</h2>
        <p className="text-gray-600">Please sign in with your email to access your profile.</p>
        <div className="mt-4 space-y-4">
          <button className="bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors">
            🔐 Sign in with Google
          </button>
          <div className="text-sm text-gray-500">or</div>
          <ConnectButton client={client} />
          <p className="text-xs text-gray-400">Wallet connection is optional</p>
        </div>
      </div>
    )
  }
  
  // SECONDARY: Suggest wallet connection if not connected (but don't block)
  if (!isConnected) {
    return (
      <div className="p-8 text-center">
        <div className="text-6xl mb-4 mobile-heading">👛</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2 mobile-heading">Wallet Connection Recommended</h2>
        <p className="text-gray-600">Connect your wallet for blockchain features and NFT management.</p>
        <div className="mt-4 space-y-4">
          <ConnectButton client={client} />
          <button 
            onClick={() => window.location.reload()}
            className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors text-sm"
          >
            Continue without wallet
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="text-6xl mb-4 mobile-heading">⏳</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2 mobile-heading">Loading Profile...</h2>
        <p className="text-gray-600">Loading email-based profile data...</p>
      </div>
    )
  }

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const handleImageUpload = async (file: File) => {
    setUploading(true)
    setUploadProgress(0)
    
    try {
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval)
            return 90
          }
          return prev + 10
        })
      }, 200)
      
      const imageUrl = await uploadProfileImage(file)
      
      clearInterval(interval)
      setUploadProgress(100)
      
      if (imageUrl) {
        toast.success('Profile image updated successfully!')
      } else {
        toast.error('Failed to upload image')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      toast.error('Failed to upload image')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleSave = async () => {
    if (saving) return
    
    // Validate required fields
    if (!formData.firstName.trim()) {
      toast.error('First name is required')
      return
    }
    
    try {
      setSaving(true)
      const displayName = `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim()
      
      const success = await updateUnifiedProfile({
        display_name: displayName,
        bio: formData.bio.trim(),
        email: formData.email.trim()
      })
      
      if (success) {
        toast.success('Profile updated successfully!', { toastId: 'profile-save' })
        
        // Route based on user role
        setTimeout(() => {
          if (profile?.role === 'producer' || profile?.app_role === 'PRODUCER') {
            router.push('/dashboard')
          } else {
            router.push('/profile')
          }
        }, 1500)
      } else {
        toast.error('Failed to update profile', { toastId: 'profile-error' })
      }
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleSettingChange = async (key: keyof typeof settings, value: boolean) => {
    const success = await updateSettings({ [key]: value })
    if (!success) {
      toast.error('Failed to update settings')
    }
  }
  return (
    <div>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '40vh',
        display: 'flex',
        alignItems: 'center',
        color: 'white',
        position: 'relative'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }}></div>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem', position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            📝 Profile Settings
          </h1>
          <p style={{ fontSize: '1.125rem', opacity: 0.9 }}>
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <BackToDashboard />

      {/* Profile Card */}
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: profile?.profileImage ? `url(${profile.profileImage})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '2rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              border: '3px solid #e5e7eb'
            }} onClick={() => fileInputRef.current?.click()}>
              {!profile?.profileImage && (formData.firstName?.[0] || profile?.displayName?.[0] || 'U')}
              {uploading && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0,0,0,0.7)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '0.75rem'
                }}>
                  {uploadProgress}%
                </div>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                position: 'absolute',
                bottom: '-5px',
                right: '-5px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                cursor: 'pointer',
                fontSize: '0.75rem'
              }}
            >
              📷
            </button>
            {profile?.profileImage && (
              <button
                onClick={async () => {
                  const success = await removeProfileImage()
                  if (success) {
                    toast.success('Profile image removed!')
                  } else {
                    toast.error('Failed to remove profile image')
                  }
                }}
                style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  cursor: 'pointer',
                  fontSize: '0.75rem'
                }}
              >
                ✕
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  // Validate file size (max 5MB)
                  if (file.size > 5 * 1024 * 1024) {
                    toast.error('Image size must be less than 5MB')
                    return
                  }
                  
                  // Validate file type
                  if (!file.type.startsWith('image/')) {
                    toast.error('Please select a valid image file')
                    return
                  }
                  
                  handleImageUpload(file)
                }
              }}
            />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937' }}>
                {profile?.display_name || profile?.displayName || 'User'}
              </h2>
              {syncStatus === 'syncing' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#3b82f6', fontSize: '0.75rem' }}>
                  <div style={{ width: '12px', height: '12px', border: '2px solid #3b82f6', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                  Syncing
                </div>
              )}
              {syncStatus === 'success' && (
                <div style={{ color: '#10b981', fontSize: '0.75rem' }}>✅ Synced</div>
              )}
            </div>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', fontFamily: 'monospace' }}>{address}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              <span style={{
                background: profile?.role === 'producer' ? '#10b981' : profile?.role === 'admin' ? '#8b5cf6' : '#3b82f6',
                color: 'white',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.25rem',
                fontSize: '0.75rem',
                fontWeight: '500'
              }}>
                {profile?.role === 'producer' ? '🎤 Producer' : profile?.role === 'admin' ? '⚙️ Admin' : '🎧 Music Fan'}
              </span>
              {profile?.isVerified && (
                <span style={{ color: '#059669', fontSize: '0.75rem', fontWeight: '500' }}>
                  ✓ Verified
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                First Name
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Last Name
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              rows={4}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                resize: 'vertical'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
              Account Type
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                padding: '1rem',
                border: profile?.role === 'user' ? '2px solid #3b82f6' : '1px solid #d1d5db',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                background: profile?.role === 'user' ? '#eff6ff' : 'white'
              }}>
                <input
                  type="radio"
                  name="role"
                  value="user"
                  checked={profile?.role === 'user'}
                  onChange={async (e) => {
                    if (e.target.checked) {
                      const success = await updateUnifiedProfile({ role: 'user' })
                      if (success) {
                        toast.success('Switched to Music Fan account!', { toastId: 'role-change' })
                        setTimeout(() => {
                          router.refresh()
                        }, 1000)
                      }
                    }
                  }}
                  style={{ marginRight: '0.75rem' }}
                />
                <div>
                  <div style={{ fontWeight: '500', color: '#1f2937' }}>🎧 Music Fan</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Browse and buy beats</div>
                </div>
              </label>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                padding: '1rem',
                border: profile?.role === 'producer' ? '2px solid #3b82f6' : '1px solid #d1d5db',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                background: profile?.role === 'producer' ? '#eff6ff' : 'white'
              }}>
                <input
                  type="radio"
                  name="role"
                  value="producer"
                  checked={profile?.role === 'producer'}
                  onChange={async (e) => {
                    if (e.target.checked) {
                      const success = await updateUnifiedProfile({ role: 'producer' })
                      if (success) {
                        toast.success('Switched to Producer account! Redirecting to dashboard...', { toastId: 'role-change' })
                        setTimeout(() => {
                          router.push('/dashboard')
                        }, 1500)
                      }
                    }
                  }}
                  style={{ marginRight: '0.75rem' }}
                />
                <div>
                  <div style={{ fontWeight: '500', color: '#1f2937' }}>🎤 Producer</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Upload and sell beats</div>
                </div>
              </label>
            </div>
            <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: '#fef3c7', borderRadius: '0.375rem' }}>
              <p style={{ fontSize: '0.75rem', color: '#92400e' }}>
                💡 <strong>Note:</strong> You can switch between roles anytime. Producers get access to the dashboard and upload features.
              </p>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
              Wallet Address
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={address || ''}
                readOnly
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  background: '#f9fafb'
                }}
              />
              <div style={{
                background: '#10b981',
                color: 'white',
                padding: '0.75rem 1rem',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                ✓ Connected
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Settings */}
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb',
        marginBottom: '2rem'
      }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '1.5rem' }}>
          Account Settings
        </h3>
        
        <div style={{ display: 'grid', gap: '1rem' }}>
          {[
            { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications about sales and updates' },
            { key: 'marketingEmails', label: 'Marketing Emails', description: 'Receive promotional emails and newsletters' },
            { key: 'twoFactorAuth', label: 'Two-Factor Authentication', description: 'Add an extra layer of security to your account' }
          ].map((setting, index) => (
            <div key={setting.key} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem 0',
              borderBottom: index < 2 ? '1px solid #f3f4f6' : 'none'
            }}>
              <div>
                <p style={{ fontWeight: '500', color: '#1f2937', marginBottom: '0.25rem' }}>
                  {setting.label}
                </p>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                  {setting.description}
                </p>
              </div>
              <button
                onClick={() => handleSettingChange(setting.key as keyof typeof settings, !settings[setting.key as keyof typeof settings])}
                style={{
                  position: 'relative',
                  width: '44px',
                  height: '24px',
                  background: settings[setting.key as keyof typeof settings] ? '#3b82f6' : '#d1d5db',
                  borderRadius: '24px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s'
                }}
              >
                <span style={{
                  position: 'absolute',
                  height: '18px',
                  width: '18px',
                  left: settings[setting.key as keyof typeof settings] ? '23px' : '3px',
                  top: '3px',
                  background: 'white',
                  borderRadius: '50%',
                  transition: 'left 0.3s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                }}></span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
        <button style={{
          background: 'white',
          color: '#6b7280',
          padding: '0.75rem 1.5rem',
          border: '1px solid #d1d5db',
          borderRadius: '0.375rem',
          fontWeight: '500',
          cursor: 'pointer'
        }}>
          Cancel
        </button>
        <button 
          onClick={handleSave}
          disabled={saving}
          style={{
            background: saving ? '#9ca3af' : '#3b82f6',
            color: 'white',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '0.375rem',
            fontWeight: '500',
            cursor: saving ? 'not-allowed' : 'pointer'
          }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>


      </div>
    </div>
  )
}