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
import { useNavigate, Link } from 'react-router-dom'
import type { ProviderSuggestion } from '../components/ProviderSearchInput'
import type { Provider } from '../components/ProviderCard'

const API_BASE_URL = 'http://localhost:8000'

export default function RequestProviderPage() {
  const navigate = useNavigate()
  const [selectedProvider, setSelectedProvider] = useState<ProviderSuggestion | null>(null)
  const [favoriteProviders, setFavoriteProviders] = useState<ProviderSuggestion[]>([])
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
          const providers: ProviderSuggestion[] = (data.providers || []).map((p: Provider) => ({
            id: p.id,
            name: p.name,
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

  const handleSelectProvider = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const providerId = e.target.value
    if (providerId) {
      const provider = favoriteProviders.find(p => p.id === providerId)
      setSelectedProvider(provider || null)
    } else {
      setSelectedProvider(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (favoriteProviders.length === 0) {
      setError('Please add favorite providers before submitting a request')
      return
    }

    if (!selectedProvider) {
      setError('Please select a provider')
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
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Request a Provider</h1>
        <p className="text-slate-600 mb-8">
          Submit a request to connect with a healthcare provider
        </p>

        {showSuccess ? (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
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
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            {error && (
              <div className="mb-6 rounded-md bg-red-50 border border-red-200 p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Provider Selection Dropdown */}
            <div className="mb-6">
              <label htmlFor="providerSelect" className="block text-sm font-medium text-slate-700 mb-2">
                Select Provider
              </label>
              {isLoadingProviders ? (
                <div className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-500">
                  Loading favorite providers...
                </div>
              ) : favoriteProviders.length === 0 ? (
                <div className="rounded-md border border-slate-200 bg-slate-50 p-6 text-center">
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
                  <select
                    id="providerSelect"
                    value={selectedProvider?.id || ''}
                    onChange={handleSelectProvider}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  >
                    <option value="">-- Select a provider --</option>
                    {favoriteProviders.map((provider) => (
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
            <div className="grid md:grid-cols-2 gap-4 mb-6">
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
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Message Field */}
            <div className="mb-6">
              <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
                Message
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                placeholder="Please describe your reason for requesting this provider..."
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                disabled={isSubmitting || favoriteProviders.length === 0 || !selectedProvider}
                className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/requests')}
                className="px-6 py-2 bg-slate-100 text-slate-700 rounded-md font-medium hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

