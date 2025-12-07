/**
 * ProviderCard.tsx - Provider Card Component
 * 
 * Displays a single provider's information in a card format.
 * Shows name, specialty, location, insurance, and action button.
 */

import { useState, useEffect } from 'react'
import { API_BASE_URL } from '../config'

export interface Provider {
  id: string
  name: string
  specialty: string
  location: string
  insurance: string[]
  is_affiliated?: boolean
  phone?: string
  email?: string
  enumeration_type?: 'NPI-1' | 'NPI-2' | string
}

interface ProviderCardProps {
  provider: Provider
  onViewDetails?: (providerId: string) => void
  isFavorited?: boolean
  onFavoriteChange?: (providerId: string, isFavorited: boolean) => void
}

export default function ProviderCard({ provider, onViewDetails, isFavorited: initialIsFavorited = false, onFavoriteChange }: ProviderCardProps) {
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited)
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false)

  // Sync with prop changes
  useEffect(() => {
    setIsFavorited(initialIsFavorited)
  }, [initialIsFavorited])

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation()

    setIsTogglingFavorite(true)

    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        // User not logged in, can't favorite
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
        const errorData = await response.json().catch(() => ({ detail: 'Failed to update favorite' }))
        throw new Error(errorData.detail || 'Failed to update favorite')
      }

      const newFavoriteState = !isFavorited
      setIsFavorited(newFavoriteState)
      onFavoriteChange?.(provider.id, newFavoriteState)
    } catch (err) {
      console.error('Error toggling favorite:', err)
      // Optionally show error to user
    } finally {
      setIsTogglingFavorite(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
              {/* Type icon: person for individuals, building for orgs */}
              {provider.enumeration_type === 'NPI-2' ? (
                // Organization icon
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  className="w-5 h-5 text-indigo-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 21h16.5M4.5 21V8.25A2.25 2.25 0 0 1 6.75 6h10.5A2.25 2.25 0 0 1 19.5 8.25V21M9 9.75h.008v.008H9v-.008Zm0 3h.008v.008H9v-.008Zm0 3h.008v.008H9v-.008Zm3-6h.008v.008H12v-.008Zm0 3h.008v.008H12v-.008Zm0 3h.008v.008H12v-.008Zm3-6h.008v.008H15v-.008Zm0 3h.008v.008H15v-.008Zm0 3h.008v.008H15v-.008Z"
                  />
                </svg>
              ) : (
                // Individual/person icon (default)
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  className="w-5 h-5 text-sky-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.5 20.25a7.5 7.5 0 0 1 15 0v.75H4.5v-.75z"
                  />
                </svg>
              )}
            </div>

            <div className="flex flex-col">
              <h3 className="text-lg font-semibold text-slate-900 leading-snug">
                {provider.name}
              </h3>
              {provider.is_affiliated && (
                <span className="mt-1 inline-flex w-fit px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-md">
                  Affiliated
                </span>
              )}
            </div>
          </div>
          <p className="text-sm text-slate-600">{provider.specialty}</p>
        </div>
        <div className="flex items-center">
          <button
            onClick={handleFavoriteClick}
            disabled={isTogglingFavorite}
            className="p-1 rounded-md hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorited ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-red-400">
                  <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
              </svg>

            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-slate-400">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
              </svg>

            )}
          </button>
        </div>
      </div>
      <p className="text-sm text-slate-600 mb-3">{provider.location}</p>
      <div className="flex flex-wrap gap-2">
        {provider.insurance.map((ins, idx) => (
          <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md">
            {ins}
          </span>
        ))}
      </div>
      <button
        onClick={() => onViewDetails?.(provider.id)}
        className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        View Details
      </button>
    </div>
  )
}

