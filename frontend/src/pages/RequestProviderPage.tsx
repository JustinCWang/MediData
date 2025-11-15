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
import ProviderSearchInput from '../components/ProviderSearchInput'
import type { ProviderSuggestion } from '../components/ProviderSearchInput'

export default function RequestProviderPage() {
  const navigate = useNavigate()
  const [providerSearch, setProviderSearch] = useState('')
  const [selectedProvider, setSelectedProvider] = useState<ProviderSuggestion | null>(null)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  // Mock provider suggestions (TODO: Replace with actual API call)
  const providerSuggestions: ProviderSuggestion[] = [
    { id: '1', name: 'Dr. John Smith', specialty: 'Cardiology' },
    { id: '2', name: 'Dr. Sarah Johnson', specialty: 'Dermatology' },
    { id: '3', name: 'Dr. Michael Brown', specialty: 'Orthopedics' },
  ]

  const handleSelectProvider = (provider: ProviderSuggestion) => {
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

            <ProviderSearchInput
              value={providerSearch}
              suggestions={providerSuggestions}
              selectedProvider={selectedProvider}
              onValueChange={setProviderSearch}
              onSelectProvider={handleSelectProvider}
              onClearSelection={() => {
                setSelectedProvider(null)
                setProviderSearch('')
              }}
            />

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

