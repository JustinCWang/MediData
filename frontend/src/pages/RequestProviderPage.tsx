/**
 * RequestProviderPage.tsx - Request Provider Page
 * 
 * Allows users to submit a request for a specific healthcare provider.
 * Users can search for a provider and submit a request with a message.
 * 
 * Features:
 * - Provider search/selection
 * - Request form with message field
 * - Form validation
 * - Success/error handling
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function RequestProviderPage() {
  const navigate = useNavigate()
  const [providerSearch, setProviderSearch] = useState('')
  const [selectedProvider, setSelectedProvider] = useState<{
    id: string
    name: string
    specialty: string
  } | null>(null)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  // Mock provider suggestions (TODO: Replace with actual API call)
  const providerSuggestions = [
    { id: '1', name: 'Dr. John Smith', specialty: 'Cardiology' },
    { id: '2', name: 'Dr. Sarah Johnson', specialty: 'Dermatology' },
    { id: '3', name: 'Dr. Michael Brown', specialty: 'Orthopedics' },
  ]

  const filteredSuggestions = providerSearch
    ? providerSuggestions.filter(
        (p) =>
          p.name.toLowerCase().includes(providerSearch.toLowerCase()) ||
          p.specialty.toLowerCase().includes(providerSearch.toLowerCase())
      )
    : []

  const handleSelectProvider = (provider: typeof providerSuggestions[0]) => {
    setSelectedProvider(provider)
    setProviderSearch(provider.name)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!selectedProvider) {
      setError('Please select a provider')
      return
    }

    if (!message.trim()) {
      setError('Please enter a message')
      return
    }

    setIsSubmitting(true)

    // Replace with actual API call to backend request endpoint
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setShowSuccess(true)
      setTimeout(() => {
        navigate('/requests')
      }, 2000)
    } catch {
      setError('Failed to submit request. Please try again.')
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

            {/* Provider Search */}
            <div className="mb-6">
              <label htmlFor="providerSearch" className="block text-sm font-medium text-slate-700 mb-2">
                Search for Provider
              </label>
              <div className="relative">
                <input
                  id="providerSearch"
                  type="text"
                  value={providerSearch}
                  onChange={(e) => {
                    setProviderSearch(e.target.value)
                    if (selectedProvider && e.target.value !== selectedProvider.name) {
                      setSelectedProvider(null)
                    }
                  }}
                  placeholder="Type provider name or specialty..."
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {providerSearch && !selectedProvider && filteredSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredSuggestions.map((provider) => (
                      <button
                        key={provider.id}
                        type="button"
                        onClick={() => handleSelectProvider(provider)}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 focus:bg-slate-50 focus:outline-none"
                      >
                        <div className="font-medium text-slate-900">{provider.name}</div>
                        <div className="text-sm text-slate-600">{provider.specialty}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {selectedProvider && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">{selectedProvider.name}</p>
                      <p className="text-sm text-slate-600">{selectedProvider.specialty}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProvider(null)
                        setProviderSearch('')
                      }}
                      className="text-slate-500 hover:text-slate-700"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
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
                disabled={isSubmitting}
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

