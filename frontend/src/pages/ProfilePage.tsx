/**
 * ProfilePage.tsx - User Profile Page
 * 
 * Allows users to view and edit their profile information.
 * Shows different fields based on whether the user is a Patient or Provider.
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const API_BASE_URL = 'http://localhost:8000'

interface UserProfile {
  role: 'patient' | 'provider'
  firstName: string
  lastName: string
  phoneNum: string
  gender: string
  state: string
  city: string
  insurance: string
  email?: string
  location?: string  // Provider only
  taxonomy?: string  // Provider only
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('access_token')
        if (!token) {
          navigate('/login')
          return
        }

        const response = await fetch(`${API_BASE_URL}/api/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch profile')
        }

        const data = await response.json()
        setProfile(data)
        if ((data as any)?.avatar) {
          setAvatarPreview((data as any).avatar as string)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [navigate])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        navigate('/login')
        return
      }

      const formData = new FormData(e.currentTarget)
      const updateData: {
        firstName: string
        lastName: string
        phoneNum: string
        gender: string
        state: string
        city: string
        insurance: string
        location?: string
        taxonomy?: string
        avatar?: string
      } = {
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        phoneNum: formData.get('phoneNum') as string,
        gender: formData.get('gender') as string,
        state: formData.get('state') as string,
        city: formData.get('city') as string,
        insurance: formData.get('insurance') as string,
        avatar: avatarPreview || undefined,
      }

      if (profile?.role === 'provider') {
        updateData.location = formData.get('location') as string
        updateData.taxonomy = formData.get('taxonomy') as string
      }

      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to update profile' }))
        throw new Error(errorData.detail || 'Failed to update profile')
      }

      const updatedProfile = await response.json()
      setProfile(updatedProfile)
      if ((updatedProfile as any)?.avatar) {
        setAvatarPreview((updatedProfile as any).avatar as string)
      }
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="page-surface min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -left-20 h-80 w-80 rounded-full bg-sky-200/40 blur-3xl" />
          <div className="absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-emerald-200/35 blur-[110px]" />
          <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-cyan-200/30 blur-[90px]" />
        </div>
        <div className="text-slate-600">Loading profile...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="page-surface min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -left-20 h-80 w-80 rounded-full bg-sky-200/40 blur-3xl" />
          <div className="absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-emerald-200/35 blur-[110px]" />
          <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-cyan-200/30 blur-[90px]" />
        </div>
        <div className="text-red-600">Failed to load profile</div>
      </div>
    )
  }

  return (
    <div className="page-surface relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-20 h-80 w-80 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-emerald-200/35 blur-[110px]" />
        <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-cyan-200/30 blur-[90px]" />
      </div>
      <div className="relative mx-auto max-w-4xl px-6 py-10 space-y-6 z-10">
        <div className="rounded-3xl bg-white/70 border border-white/60 shadow-[0_24px_70px_-35px_rgba(15,23,42,0.35)] backdrop-blur-xl p-6 md:p-8 flex flex-col gap-2">
          <h1 className="text-3xl font-semibold text-slate-900 leading-tight">My Profile</h1>
          <p className="text-slate-600 text-sm md:text-base">
            {profile.role === 'patient' ? 'Patient' : 'Provider'} profile information
          </p>
          <div className="text-sm text-slate-600 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 py-1">
              Keep contact & insurance current
            </span>
            {profile.role === 'provider' && (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 py-1">
                Location & taxonomy help matching
              </span>
            )}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">Profile updated successfully!</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white/80 rounded-2xl shadow-lg border border-white/60 backdrop-blur p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 rounded-full bg-gradient-to-br from-sky-500 via-emerald-400 to-blue-500 flex items-center justify-center text-white text-xl font-semibold overflow-hidden">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar preview" className="h-full w-full object-cover" />
              ) : (
                <span>{profile.firstName?.[0]?.toUpperCase() || 'U'}</span>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-900">Profile photo</p>
              <label className="inline-flex items-center px-3 py-2 text-xs font-semibold rounded-full border border-slate-300 bg-white/70 cursor-pointer hover:bg-white text-slate-800">
                Upload image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const reader = new FileReader()
                    reader.onload = () => setAvatarPreview(reader.result as string)
                    reader.readAsDataURL(file)
                  }}
                />
              </label>
              <p className="text-xs text-slate-500">Preview only; stored with other profile updates if backend supports.</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-1">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                defaultValue={profile.firstName}
                className="w-full rounded-md border border-white/70 bg-white/70 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 backdrop-blur"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-1">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                defaultValue={profile.lastName}
                className="w-full rounded-md border border-white/70 bg-white/70 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 backdrop-blur"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={profile.email || ''}
                disabled
                className="w-full rounded-md border border-white/70 bg-white/60 px-3 py-2 text-sm text-slate-500 cursor-not-allowed backdrop-blur"
              />
              <p className="mt-1 text-xs text-slate-500">Email cannot be changed</p>
            </div>
            <div>
              <label htmlFor="phoneNum" className="block text-sm font-medium text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                id="phoneNum"
                name="phoneNum"
                type="tel"
                defaultValue={profile.phoneNum}
                className="w-full rounded-md border border-white/70 bg-white/70 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 backdrop-blur"
              />
            </div>
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-slate-700 mb-1">
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                defaultValue={profile.gender}
                className="w-full rounded-md border border-white/70 bg-white/70 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 backdrop-blur"
              >
                <option value="">Select...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-slate-700 mb-1">
                State
              </label>
              <input
                id="state"
                name="state"
                type="text"
                defaultValue={profile.state}
                placeholder="e.g., CA, NY"
                maxLength={2}
                className="w-full rounded-md border border-white/70 bg-white/70 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 backdrop-blur"
              />
            </div>
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-slate-700 mb-1">
                City
              </label>
              <input
                id="city"
                name="city"
                type="text"
                defaultValue={profile.city}
                className="w-full rounded-md border border-white/70 bg-white/70 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 backdrop-blur"
              />
            </div>
            <div>
              <label htmlFor="insurance" className="block text-sm font-medium text-slate-700 mb-1">
                Insurance
              </label>
              <input
                id="insurance"
                name="insurance"
                type="text"
                defaultValue={profile.insurance}
                placeholder="e.g., Blue Cross, Aetna"
                className="w-full rounded-md border border-white/70 bg-white/70 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 backdrop-blur"
              />
            </div>
            {profile.role === 'provider' && (
              <>
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-slate-700 mb-1">
                    Location
                  </label>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    defaultValue={profile.location}
                    placeholder="Full address or location"
                    className="w-full rounded-md border border-white/70 bg-white/70 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 backdrop-blur"
                  />
                </div>
                <div>
                  <label htmlFor="taxonomy" className="block text-sm font-medium text-slate-700 mb-1">
                    Taxonomy / Specialty
                  </label>
                  <input
                    id="taxonomy"
                    name="taxonomy"
                    type="text"
                    defaultValue={profile.taxonomy}
                    placeholder="e.g., Internal Medicine, Cardiology"
                    className="w-full rounded-md border border-white/70 bg-white/70 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 backdrop-blur"
                  />
                </div>
              </>
            )}
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white/80 border border-white/70 rounded-full hover:bg-white focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-white rounded-full bg-gradient-to-r from-sky-600 via-blue-600 to-emerald-500 hover:shadow-md hover:-translate-y-[1px] transition focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-60"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
