/**
 * ProviderDetailsPage.tsx - Provider Details Page
 * 
 * Displays detailed information about a specific healthcare provider.
 * The provider ID is retrieved from the URL params.
 */

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { Provider } from '../components/ProviderCard'

const API_BASE_URL = 'http://localhost:8000'

export default function ProviderDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [provider, setProvider] = useState<Provider | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFavorited, setIsFavorited] = useState(false)

  useEffect(() => {
    const fetchProviderDetails = async () => {
      if (!id) {
        setError('No provider ID provided')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        // For now, we'll use the search API with the NPI number as a workaround
        // since there's no dedicated endpoint for getting a single provider
        const response = await fetch(`${API_BASE_URL}/api/providers/search?number=${id}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch provider details')
        }

        const data = await response.json()
        
        if (data.results && data.results.length > 0) {
          setProvider(data.results[0])
        } else {
          setError('Provider not found')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load provider details')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProviderDetails()
  }, [id])

  // Check if provider is favorited
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!provider) return

      try {
        const token = localStorage.getItem('access_token')
        if (!token) return

        const response = await fetch(`${API_BASE_URL}/api/favorites`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setIsFavorited(data.favorites?.includes(provider.id) || false)
        }
      } catch (err) {
        console.error('Error checking favorite status:', err)
      }
    }

    checkFavoriteStatus()
  }, [provider])

  const handleToggleFavorite = async () => {
    if (!provider) return

    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        alert('Please log in to favorite providers')
        return
      }

      const url = `${API_BASE_URL}/api/favorites/${provider.id}`
      const method = isFavorited ? 'DELETE' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to update favorite')
      }

      setIsFavorited(!isFavorited)
    } catch (err) {
      console.error('Error toggling favorite:', err)
      alert('Failed to update favorite status')
    }
  }

  const handleBack = () => {
    navigate(-1)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-slate-600">Loading provider details...</p>
        </div>
      </div>
    )
  }

  if (error || !provider) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-4xl px-6 py-8">
          <button
            onClick={handleBack}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 mb-6"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Search
          </button>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 text-center">
            <p className="text-red-600 mb-4">{error || 'Provider not found'}</p>
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Back button */}
        <button
          onClick={handleBack}
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 mb-6"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Search
        </button>

        {/* Provider Details Card */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-white">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{provider.name}</h1>
                  {provider.is_affiliated && (
                    <span className="px-3 py-1 text-sm font-medium bg-green-500 text-white rounded-md">
                      Affiliated
                    </span>
                  )}
                </div>
                <p className="text-blue-100 text-lg">{provider.specialty}</p>
              </div>
              <button
                onClick={handleToggleFavorite}
                className="p-2 rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
                title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
              >
                {isFavorited ? (
                  <svg className="w-6 h-6 text-red-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 20 20">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Details */}
          <div className="px-8 py-6 space-y-6">
            {/* Location */}
            <div>
              <h2 className="text-sm font-semibold text-slate-500 uppercase mb-2">Location</h2>
              <div className="flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400 mt-0.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <p className="text-slate-900">{provider.location}</p>
              </div>
            </div>

            {/* Contact Information */}
            {(provider.phone || provider.email) && (
              <div>
                <h2 className="text-sm font-semibold text-slate-500 uppercase mb-2">Contact Information</h2>
                <div className="space-y-2">
                  {provider.phone && (
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                      </svg>
                      <p className="text-slate-900">{provider.phone}</p>
                    </div>
                  )}
                  {provider.email && (
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                      <p className="text-slate-900">{provider.email}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Insurance */}
            {provider.insurance && provider.insurance.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-slate-500 uppercase mb-2">Accepted Insurance</h2>
                <div className="flex flex-wrap gap-2">
                  {provider.insurance.map((ins, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-md border border-blue-200">
                      {ins}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Provider ID */}
            <div>
              <h2 className="text-sm font-semibold text-slate-500 uppercase mb-2">Provider ID</h2>
              <p className="text-slate-900 font-mono text-sm">{provider.id}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="px-8 py-6 bg-slate-50 border-t border-slate-200 flex gap-3">
            <button
              onClick={handleBack}
              className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-md text-sm font-medium hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Back to Search
            </button>
            <button
              onClick={() => navigate('/request-provider')}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Request Appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
