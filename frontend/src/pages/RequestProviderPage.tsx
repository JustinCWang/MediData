/**
 * RequestProviderPage.tsx - Request Provider Page
 * 
 * Allows users to submit a request for a specific healthcare provider.
 * Users can select from their favorited providers and submit a request with a message.
 * 
 * Features:
 * - Provider selection from favorites dropdown
 * - Request form with message field
 * - Form validation
 * - Success/error handling
 */

import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import type { Provider } from '../components/ProviderCard'

const API_BASE_URL = 'http://localhost:8000'

export default function RequestProviderPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const locationState = location.state as { provider?: Provider } | null
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
  const [favoriteProviders, setFavoriteProviders] = useState<Provider[]>([])
  const [isLoadingProviders, setIsLoadingProviders] = useState(true)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  // Fetch favorited providers on mount
  useEffect(() => {
    const fetchFavoriteProviders = async () => {
      setIsLoadingProviders(true)
      try {
        const token = localStorage.getItem('access_token')
        if (!token) {
          setError('Please log in to request a provider')
          setIsLoadingProviders(false)
          return
        }

        const response = await fetch(`${API_BASE_URL}/api/favorites/providers`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          const providers: Provider[] = (data.providers || []).map((p: Provider) => ({
            ...p,
            specialty: p.specialty || 'Not specified',
          }))
          setFavoriteProviders(providers)
        } else {
          setError('Failed to load favorite providers')
        }
      } catch (err) {
        console.error('Error fetching favorite providers:', err)
        setError('Failed to load favorite providers')
      } finally {
        setIsLoadingProviders(false)
      }
    }

    fetchFavoriteProviders()
  }, [])

  // Preselect provider passed from details page
  useEffect(() => {
    const stateProvider = locationState?.provider
    if (!stateProvider) return

    if (!stateProvider.is_affiliated) {
      setError('This provider is not affiliated with MediData, so appointment requests must be made directly.')
      setSelectedProvider(null)
      return
    }

    const normalized = { ...stateProvider, specialty: stateProvider.specialty || 'Not specified' }
    setFavoriteProviders((prev) => {
      const exists = prev.some((p) => p.id === normalized.id)
      return exists ? prev : [...prev, normalized]
    })
    setSelectedProvider(normalized)
  }, [locationState])

  const handleSelectProvider = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const providerId = e.target.value
    if (providerId) {
      const provider = favoriteProviders.find(p => p.id === providerId && p.is_affiliated)
      setSelectedProvider(provider || null)
    } else {
      setSelectedProvider(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const hasAffiliatedFavorites = favoriteProviders.some(p => p.is_affiliated)
    if (!hasAffiliatedFavorites) {
      setError('Please add affiliated providers to favorites before submitting a request')
      return
    }

    if (!selectedProvider) {
      setError('Please select a provider')
      return
    }

    if (!selectedProvider.is_affiliated) {
      setError('You can only submit requests to affiliated providers.')
      return
    }

    if (!message.trim()) {
      setError('Please enter a message')
      return
    }

    setIsSubmitting(true)

    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        setError('Please log in to submit a request')
        setIsSubmitting(false)
        return
      }

      // Prepare request body with optional date and time
      const requestBody: {
        provider_id: string
        message: string
        date?: string
        time?: string
      } = {
        provider_id: selectedProvider.id,
        message: message.trim(),
      }

      // Add date if provided
      if (date.trim()) {
        requestBody.date = date.trim()
      }

      // Add time if provided (format as HH:MM:SS)
      if (time.trim()) {
        // Ensure time is in HH:MM:SS format
        const timeValue = time.trim()
        const timeParts = timeValue.split(':')
        if (timeParts.length === 2) {
          // If only HH:MM, add :00 for seconds
          requestBody.time = `${timeValue}:00`
        } else {
          requestBody.time = timeValue
        }
      }

      const response = await fetch(`${API_BASE_URL}/api/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to submit request' }))
        throw new Error(errorData.detail || 'Failed to submit request')
      }

      setShowSuccess(true)
      setTimeout(() => {
        navigate('/requests')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
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
          <h1 className="text-3xl font-semibold text-slate-900 leading-tight">Request a Provider</h1>
          <p className="text-slate-600 text-sm md:text-base">
            Submit a structured request so the provider team can respond quickly and with context.
          </p>
          <div className="text-sm text-slate-600 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 py-1">
              Affiliated favorites only
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 py-1">
              Include time windows
            </span>
          </div>
        </div>

        {showSuccess ? (
          <div className="bg-white/80 rounded-2xl shadow-lg border border-white/60 backdrop-blur-lg p-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Request Submitted!</h2>
            <p className="text-slate-600 mb-4">Your request has been sent successfully.</p>
            <p className="text-sm text-slate-500">Redirecting to requests page...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white/80 rounded-2xl shadow-lg border border-white/60 backdrop-blur-lg p-6 space-y-6">
            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Provider Selection Dropdown - only affiliated providers can be requested via the app */}
            <div className="space-y-2">
              <label htmlFor="providerSelect" className="block text-sm font-medium text-slate-700">
                Select Provider
              </label>
              {isLoadingProviders ? (
                <div className="w-full rounded-md border border-white/70 bg-white/70 px-3 py-2 text-sm text-slate-500 backdrop-blur">
                  Loading favorite providers...
                </div>
              ) : favoriteProviders.length === 0 ? (
                <div className="rounded-md border border-white/70 bg-white/70 p-6 text-center backdrop-blur">
                  <p className="text-sm text-slate-600 mb-3">You don't have any favorite providers yet.</p>
                  <Link
                    to="/search"
                    className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    Search for providers to add to favorites
                    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              ) : (
                <>
                  {favoriteProviders.filter(p => p.is_affiliated).length === 0 && (
                    <div className="mb-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                      You don't have any affiliated favorite providers yet. Only affiliated providers can be requested
                      through MediData. You can still view contact information for other providers below.
                    </div>
                  )}
                  <select
                    id="providerSelect"
                    value={selectedProvider?.id || ''}
                    onChange={handleSelectProvider}
                    className="w-full rounded-md border border-white/70 bg-white/70 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 backdrop-blur"
                    required
                  >
                    <option value="">-- Select a provider --</option>
                    {favoriteProviders
                      .filter((provider) => provider.is_affiliated)
                      .map((provider) => (
                        <option key={provider.id} value={provider.id}>
                          {provider.name} - {provider.specialty}
                        </option>
                      ))}
                  </select>
                  {selectedProvider && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-900">{selectedProvider.name}</p>
                          <p className="text-sm text-slate-600">{selectedProvider.specialty}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            Affiliated provider – your request will be handled directly in MediData.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedProvider(null)}
                          className="text-slate-500 hover:text-slate-700"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Date and Time Fields */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-slate-700 mb-2">
                  Preferred Date <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full rounded-md border border-white/70 bg-white/70 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 backdrop-blur"
                />
              </div>
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-slate-700 mb-2">
                  Preferred Time <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full rounded-md border border-white/70 bg-white/70 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 backdrop-blur"
                />
              </div>
            </div>

            {/* Message Field */}
            <div className="space-y-2">
              <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
                Message
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                placeholder="Please describe your reason for requesting this provider..."
                className="w-full rounded-md border border-white/70 bg-white/70 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 backdrop-blur"
                required
              />
              <p className="mt-1 text-xs text-slate-500">
                Include any relevant information about your healthcare needs or preferences.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  favoriteProviders.filter(p => p.is_affiliated).length === 0 ||
                  !selectedProvider
                }
                className="flex-1 px-6 py-2 rounded-full bg-gradient-to-r from-sky-600 via-blue-600 to-emerald-500 text-white font-semibold hover:shadow-md hover:-translate-y-[1px] transition focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/requests')}
                className="px-6 py-2 bg-white/80 text-slate-700 rounded-full font-medium border border-white/70 hover:bg-white focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Non-affiliated favorite providers - info only */}
        {favoriteProviders.filter(p => !p.is_affiliated).length > 0 && (
          <div className="mt-10 bg-white/80 rounded-2xl shadow-lg border border-white/60 backdrop-blur-lg p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Other saved providers</h2>
            <p className="text-sm text-slate-600 mb-4">
              These providers are not yet affiliated with MediData. You can contact them directly using the information
              below, but requests cannot be managed through the app.
            </p>
            <div className="space-y-3">
              {favoriteProviders
                .filter((p) => !p.is_affiliated)
                .map((provider) => (
                  <div
                    key={provider.id}
                    className="border border-white/70 rounded-md p-4 flex flex-col gap-1 bg-white/70 backdrop-blur"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{provider.name}</p>
                        <p className="text-sm text-slate-600">{provider.specialty}</p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-slate-200 text-slate-700">
                        External provider
                      </span>
                    </div>
                    {provider.location && (
                      <p className="text-sm text-slate-600">
                        <span className="font-medium">Location:</span> {provider.location}
                      </p>
                    )}
                    {provider.phone && (
                      <p className="text-sm text-slate-600">
                        <span className="font-medium">Phone:</span> {provider.phone}
                      </p>
                    )}
                    <p className="text-xs text-slate-500">
                      NPI / External ID: {provider.id}. Use this identifier and location details when contacting this
                      provider directly.
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
