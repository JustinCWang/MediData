/**
 * ProviderDetailsPage.tsx - Provider Details Page
 *
 * Displays detailed information about a specific healthcare provider.
 * The provider can be passed via router state (from search/favorites) or
 * fetched from the backend using the ID in the URL.
 *
 * Features:
 * - Rich provider header with specialty, location, and affiliation badge
 * - Journey explanation (what happens after you request)
 * - Contact + insurance details
 * - Favorite/unfavorite provider
 * - Request appointment CTA (only for affiliated providers)
 */

import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom'
import type { Provider } from '../components/ProviderCard'
import { API_BASE_URL } from '../config'

interface LocationState {
  provider?: Provider
}

type ProviderApiResponse = Partial<Provider> & {
  taxonomy_description?: string
  city?: string
  state?: string
  phone?: string
  practice_phone?: string
  email?: string
  practice_email?: string
  enumeration_type?: string
}

const journeySteps = [
  {
    title: 'Request sent',
    desc: 'Share your reason, availability, and insurance so the team starts with context.',
  },
  {
    title: 'Provider reviews',
    desc: 'We surface fit, availability, and accepted plans so the right clinician responds.',
  },
  {
    title: 'Confirm details',
    desc: 'You get a confirmation with location/contact options and prep guidance.',
  },
]

export default function ProviderDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | undefined

  const [provider, setProvider] = useState<Provider | null>(state?.provider ?? null)
  const [isLoading, setIsLoading] = useState(!state?.provider)
  const [error, setError] = useState<string | null>(null)

  const [isFavorited, setIsFavorited] = useState(false)
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(true)
  const [affiliationError, setAffiliationError] = useState<string | null>(null)

  const header = useMemo(
    () =>
      provider
        ? {
            title: provider.name,
            subtitle: provider.specialty || 'Not specified',
          }
        : { title: 'Provider details', subtitle: '' },
    [provider]
  )

  // Fetch provider details if not passed via state
  useEffect(() => {
    if (provider || !id) {
      if (!id && !provider) {
        setError('No provider ID provided')
        setIsLoading(false)
      }
      return
    }

    const fetchProviderDetails = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(`${API_BASE_URL}/api/providers/${id}`)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ detail: 'Failed to fetch provider details' }))
          throw new Error(errorData.detail || 'Failed to fetch provider details')
        }

        const data: ProviderApiResponse = await response.json()

        // Ensure we have the fields our UI expects
        const mapped: Provider = {
          id: data.id ?? id,
          name: data.name ?? 'Unknown provider',
          specialty: data.specialty ?? data.taxonomy_description ?? 'Not specified',
          location: data.location ?? [data.city, data.state].filter(Boolean).join(', ') ?? 'Location not available',
          insurance: data.insurance ?? [],
          is_affiliated: data.is_affiliated ?? false,
          phone: data.phone ?? data.practice_phone,
          email: data.email ?? data.practice_email,
          enumeration_type: data.enumeration_type,
        }

        setProvider(mapped)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load provider details')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProviderDetails()
  }, [id, provider])

  // Check if provider is favorited
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!provider) return

      try {
        setIsFavoriteLoading(true)
        const token = localStorage.getItem('access_token')
        if (!token) {
          setIsFavoriteLoading(false)
          return
        }

        const response = await fetch(`${API_BASE_URL}/api/favorites`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.ok) {
          const data = await response.json()
          setIsFavorited(data.favorites?.includes(provider.id) || false)
        }
      } catch (err) {
        console.error('Error checking favorite status:', err)
      } finally {
        setIsFavoriteLoading(false)
      }
    }

    checkFavoriteStatus()
  }, [provider])

  const handleBack = () => {
    navigate(-1)
  }

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
          Authorization: `Bearer ${token}`,
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

  const handleRequestAppointment = () => {
    if (!provider) return

    if (!provider.is_affiliated) {
      setAffiliationError(
        "Provider isn't affiliated with MediData. Please contact them using their direct information."
      )
      return
    }

    navigate('/request-provider', {
      state: {
        providerId: provider.id,
        providerName: provider.name,
        providerSpecialty: provider.specialty,
        providerLocation: provider.location,
      },
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4 mr-1"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4 mr-1"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
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
                  {/* Type icon: person for individuals, building for orgs */}
                  {provider.enumeration_type === 'NPI-2' ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      className="w-8 h-8 text-indigo-100"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.75 21h16.5M4.5 21V8.25A2.25 2.25 0 0 1 6.75 6h10.5A2.25 2.25 0 0 1 19.5 8.25V21M9 9.75h.008v.008H9v-.008Zm0 3h.008v.008H9v-.008Zm0 3h.008v.008H9v-.008Zm3-6h.008v.008H12v-.008Zm0 3h.008v.008H12v-.008Zm0 3h.008v.008H12v-.008Zm3-6h.008v.008H15v-.008Zm0 3h.008v.008H15v-.008Zm0 3h.008v.008H15v-.008Z"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      className="w-8 h-8 text-sky-100"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.5 20.25a7.5 7.5 0 0 1 15 0v.75H4.5v-.75z"
                      />
                    </svg>
                  )}

                  <h1 className="text-3xl font-bold">{header.title}</h1>
                  {provider.is_affiliated && (
                    <span className="px-3 py-1 text-sm font-medium bg-green-500 text-white rounded-md">
                      Affiliated
                    </span>
                  )}
                </div>
                <p className="text-blue-100 text-lg">{header.subtitle}</p>
              </div>
              <button
                onClick={handleToggleFavorite}
                className="p-2 rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
                title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                disabled={isFavoriteLoading}
              >
                {isFavoriteLoading ? (
                  <div className="w-6 h-6 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : isFavorited ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-8 h-8 text-red-400"
                  >
                    <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-8 h-8 text-white"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Details */}
          <div className="px-8 py-6 space-y-6">
            {affiliationError && (
              <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {affiliationError}
              </div>
            )}

            {/* Location */}
            <div>
              <h2 className="text-sm font-semibold text-slate-500 uppercase mb-2">Location</h2>
              <div className="flex items-start gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 text-slate-400 mt-0.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10.5a3 3 0 11-6 0 3 3 0 0 1 6 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                  />
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
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5 text-slate-400"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                        />
                      </svg>
                      <p className="text-slate-900">{provider.phone}</p>
                    </div>
                  )}
                  {provider.email && (
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5 text-slate-400"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                        />
                      </svg>
                      <a href={`mailto:${provider.email}`} className="text-slate-900 underline">
                        {provider.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Accepted Insurance */}
            {provider.insurance && provider.insurance.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-slate-500 uppercase mb-2">Accepted Insurance</h2>
                <div className="flex flex-wrap gap-2">
                  {provider.insurance.map((ins, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-md border border-blue-200"
                    >
                      {ins}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Journey / what to expect */}
            <div>
              <h2 className="text-sm font-semibold text-slate-500 uppercase mb-2">What to expect</h2>
              <div className="space-y-3">
                {journeySteps.map((step, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="mt-1 h-6 w-6 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold flex items-center justify-center">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{step.title}</p>
                      <p className="text-sm text-slate-700">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Short blurb about visit prep */}
            <div>
              <h2 className="text-sm font-semibold text-slate-500 uppercase mb-2">Visit prep</h2>
              <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside">
                <li>Share your symptoms and goals to speed up intake.</li>
                <li>Confirm your preferred contact method and time windows.</li>
                <li>Have insurance details ready if applicable.</li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="px-8 py-6 bg-slate-50 border-t border-slate-200 flex flex-wrap gap-3">
            <button
              onClick={handleBack}
              className="flex-1 min-w-[140px] px-4 py-2.5 border border-slate-300 text-slate-700 rounded-md text-sm font-medium hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Back to Search
            </button>
            <button
              onClick={handleRequestAppointment}
              className="flex-1 min-w-[180px] px-4 py-2.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Request Appointment
            </button>
          </div>
        </div>

        {/* Secondary navigation back to search */}
        <div className="mt-4 text-sm text-slate-600">
          Or{' '}
          <Link to="/search" className="text-blue-600 hover:text-blue-700 underline">
            browse more providers
          </Link>
          .
        </div>
      </div>
    </div>
  )
}


