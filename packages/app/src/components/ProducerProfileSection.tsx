'use client'

import { useState, useEffect } from 'react'
import { useUnifiedAuth } from '@/context/UnifiedAuthContext'
import { useUnifiedProfile } from '@/hooks/useUnifiedProfile'
import ProfileImageUpload from './ProfileImageUpload'

export default function ProducerProfileSection() {
  const { user } = useUnifiedAuth()
  const { profile: unifiedProfile, updateProfile, syncStatus } = useUnifiedProfile()
  const [profile, setProfile] = useState({
    stageName: '',
    bio: '',
    genres: '',
    experience: 'beginner',
    location: '',
    profileImage: '',
    socialLinks: {
      twitter: '',
      instagram: '',
      soundcloud: ''
    }
  })
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (unifiedProfile) {
      // Load from unified profile first
      const platforms = unifiedProfile.platforms?.app?.preferences || {}
      setProfile({
        stageName: platforms.stageName || unifiedProfile.display_name || '',
        bio: unifiedProfile.bio || '',
        genres: platforms.genres || '',
        experience: platforms.experience || 'beginner',
        location: platforms.location || '',
        profileImage: unifiedProfile.profile_image || '',
        socialLinks: platforms.socialLinks || { twitter: '', instagram: '', soundcloud: '' }
      })
    } else if (user?.address) {
      // Fallback to local storage
      const stored = localStorage.getItem(`producer_profile_${user.address}`)
      if (stored) {
        const data = JSON.parse(stored)
        setProfile({
          stageName: data.stageName || '',
          bio: data.bio || '',
          genres: data.genres || '',
          experience: data.experience || 'beginner',
          location: data.location || '',
          profileImage: data.profileImage || '',
          socialLinks: data.socialLinks || { twitter: '', instagram: '', soundcloud: '' }
        })
      }
    }
  }, [unifiedProfile, user?.address])

  const handleSave = async () => {
    if (!user?.address) return
    
    setSaving(true)
    try {
      // Update unified profile
      const success = await updateProfile({
        display_name: profile.stageName || unifiedProfile?.display_name,
        bio: profile.bio,
        profile_image: profile.profileImage,
        platforms: {
          ...unifiedProfile?.platforms,
          app: {
            ...unifiedProfile?.platforms?.app,
            preferences: {
              ...unifiedProfile?.platforms?.app?.preferences,
              stageName: profile.stageName,
              genres: profile.genres,
              experience: profile.experience,
              location: profile.location,
              socialLinks: profile.socialLinks
            }
          }
        }
      })
      
      if (success) {
        // Also save to localStorage for backward compatibility
        const updatedProfile = {
          ...profile,
          userId: user.address,
          isProducer: true,
          updatedAt: new Date().toISOString()
        }
        localStorage.setItem(`producer_profile_${user.address}`, JSON.stringify(updatedProfile))
        setEditing(false)
      } else {
        throw new Error('Failed to update unified profile')
      }
    } catch (error) {
      console.error('Failed to save profile:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-gray-900">🎤 Producer Profile</h2>
          {syncStatus === 'syncing' && (
            <div className="flex items-center gap-2 text-blue-600 text-sm">
              <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              Syncing...
            </div>
          )}
          {syncStatus === 'success' && (
            <div className="text-green-600 text-sm">✅ Synced</div>
          )}
        </div>
        <button
          onClick={() => editing ? handleSave() : setEditing(true)}
          disabled={saving || syncStatus === 'syncing'}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : editing ? 'Save Changes' : 'Edit Profile'}
        </button>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
        {editing ? (
          <ProfileImageUpload
            currentImage={profile.profileImage}
            onImageUpdate={(url) => setProfile({...profile, profileImage: url})}
            size="lg"
          />
        ) : (
          <div className="flex items-center space-x-4">
            <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden">
              {profile.profileImage ? (
                <img src={profile.profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">👤</div>
              )}
            </div>
            <div>
              <p className="text-gray-900 font-medium">{profile.stageName || 'Producer'}</p>
              <p className="text-gray-500 text-sm">{profile.location || 'Location not set'}</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Stage Name</label>
          {editing ? (
            <input
              type="text"
              value={profile.stageName}
              onChange={(e) => setProfile({...profile, stageName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="text-gray-900">{profile.stageName || 'Not set'}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
          {editing ? (
            <input
              type="text"
              value={profile.location}
              onChange={(e) => setProfile({...profile, location: e.target.value})}
              placeholder="e.g., Cape Town, South Africa"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="text-gray-900">{profile.location || 'Not set'}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
          {editing ? (
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({...profile, bio: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="text-gray-900">{profile.bio || 'No bio added yet'}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Genres</label>
          {editing ? (
            <input
              type="text"
              value={profile.genres}
              onChange={(e) => setProfile({...profile, genres: e.target.value})}
              placeholder="hip-hop, trap, amapiano"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="text-gray-900">{profile.genres || 'Not specified'}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
          {editing ? (
            <select
              value={profile.experience}
              onChange={(e) => setProfile({...profile, experience: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="beginner">Beginner (0-1 years)</option>
              <option value="intermediate">Intermediate (2-5 years)</option>
              <option value="advanced">Advanced (5+ years)</option>
              <option value="professional">Professional</option>
            </select>
          ) : (
            <p className="text-gray-900 capitalize">{profile.experience}</p>
          )}
        </div>
      </div>

      {editing && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Social Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Twitter</label>
              <input
                type="text"
                value={profile.socialLinks.twitter}
                onChange={(e) => setProfile({
                  ...profile, 
                  socialLinks: {...profile.socialLinks, twitter: e.target.value}
                })}
                placeholder="@username"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
              <input
                type="text"
                value={profile.socialLinks.instagram}
                onChange={(e) => setProfile({
                  ...profile, 
                  socialLinks: {...profile.socialLinks, instagram: e.target.value}
                })}
                placeholder="@username"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SoundCloud</label>
              <input
                type="text"
                value={profile.socialLinks.soundcloud}
                onChange={(e) => setProfile({
                  ...profile, 
                  socialLinks: {...profile.socialLinks, soundcloud: e.target.value}
                })}
                placeholder="username"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={() => setEditing(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}