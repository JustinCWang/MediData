/**
 * DashboardPage.tsx - User Dashboard
 * 
 * Main dashboard page for authenticated users. Provides an overview of:
 * - Recent requests
 * - Quick actions (Search, Request Provider)
 * - Account summary
 */

import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import RequestCard from '../components/RequestCard'
import type { Request } from '../components/RequestCard'
import ProviderCard from '../components/ProviderCard'
import type { Provider } from '../components/ProviderCard'
import EmptyState from '../components/EmptyState'

const API_BASE_URL = 'http://localhost:8000'

interface User {
  id: string
  email: string
  user_metadata?: {
    first_name?: string
    last_name?: string
    full_name?: string
  }
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [recentRequests, setRecentRequests] = useState<Request[]>([])
  const [isLoadingRequests, setIsLoadingRequests] = useState(false)
  const [favoriteProviders, setFavoriteProviders] = useState<Provider[]>([])
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false)
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [userRole, setUserRole] = useState<'patient' | 'provider'>('patient')

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      const role = parsedUser.user_metadata?.role || 'patient'
      setUserRole(role as 'patient' | 'provider')
    }
  }, [])

  useEffect(() => {
    const fetchFavoriteProviders = async () => {
      setIsLoadingFavorites(true)
      try {
        const token = localStorage.getItem('access_token')
        if (!token) {
          return
        }

        const response = await fetch(`${API_BASE_URL}/api/favorites/providers`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setFavoriteProviders(data.providers || [])
          setFavoriteIds(new Set((data.providers || []).map((p: Provider) => p.id)))
        }
      } catch (err) {
        console.error('Error fetching favorite providers:', err)
      } finally {
        setIsLoadingFavorites(false)
      }
    }

    fetchFavoriteProviders()
  }, [])

  useEffect(() => {
    const fetchRecentRequests = async () => {
      setIsLoadingRequests(true)
      try {
        const token = localStorage.getItem('access_token')
        if (!token) {
          return
        }

        const response = await fetch(`${API_BASE_URL}/api/requests`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          // Sort by requestedDate descending and take first 3
          // Handle empty dates by putting them at the end
          const sortedRequests = (data.requests || []).sort((a: Request, b: Request) => {
            const dateA = a.requestedDate ? new Date(a.requestedDate).getTime() : 0
            const dateB = b.requestedDate ? new Date(b.requestedDate).getTime() : 0
            return dateB - dateA
          })
          setRecentRequests(sortedRequests.slice(0, 3))
        }
      } catch (err) {
        console.error('Error fetching recent requests:', err)
      } finally {
        setIsLoadingRequests(false)
      }
    }

    fetchRecentRequests()
  }, [])

  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
    }
    if (user?.user_metadata?.first_name) {
      return user.user_metadata.first_name
    }
    if (user?.email) {
      return user.email.split('@')[0]
    }
    return 'User'
  }

  const handleCancel = (requestId: string) => {
    // TODO: Implement cancel request API call
    console.log('Cancel request:', requestId)
  }

  const handleSchedule = (requestId: string) => {
    // TODO: Navigate to scheduling page
    console.log('Schedule appointment for request:', requestId)
  }

  const handleViewDetails = (requestId: string) => {
    // TODO: Navigate to request details page
    console.log('View details for request:', requestId)
  }

  const handleProviderViewDetails = (providerId: string) => {
    // TODO: Navigate to provider details page
    console.log('View details for provider:', providerId)
  }

  const handleFavoriteChange = (providerId: string, isFavorited: boolean) => {
    setFavoriteIds(prev => {
      const newSet = new Set(prev)
      if (isFavorited) {
        newSet.add(providerId)
      } else {
        newSet.delete(providerId)
      }
      return newSet
    })

    // Remove from favorites list if unfavorited
    if (!isFavorited) {
      setFavoriteProviders(prev => prev.filter(p => p.id !== providerId))
    }
  }

  const handleRequestUpdate = () => {
    // Refresh recent requests after update
    const fetchRecentRequests = async () => {
      try {
        const token = localStorage.getItem('access_token')
        if (!token) {
          return
        }

        const response = await fetch(`${API_BASE_URL}/api/requests`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          const sortedRequests = (data.requests || []).sort((a: Request, b: Request) => {
            const dateA = a.requestedDate ? new Date(a.requestedDate).getTime() : 0
            const dateB = b.requestedDate ? new Date(b.requestedDate).getTime() : 0
            return dateB - dateA
          })
          setRecentRequests(sortedRequests.slice(0, 3))
        }
      } catch (err) {
        console.error('Error fetching recent requests:', err)
      }
    }

    fetchRecentRequests()
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome back, {getUserDisplayName()}!
          </h1>
          <p className="text-slate-600">Here's an overview of your activity</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Link
            to="/search"
            className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Search Providers</h3>
                <p className="text-sm text-slate-600">Find healthcare providers near you</p>
              </div>
            </div>
          </Link>

          <Link
            to="/request-provider"
            className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Request Provider</h3>
                <p className="text-sm text-slate-600">Submit a request for a provider</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Favorite Providers */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900">Favorite Providers</h2>
            <Link
              to="/search"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Search more
            </Link>
          </div>

          {isLoadingFavorites ? (
            <div className="text-center py-8 text-slate-600">Loading favorites...</div>
          ) : favoriteProviders.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {favoriteProviders.map((provider) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  onViewDetails={handleProviderViewDetails}
                  isFavorited={favoriteIds.has(provider.id)}
                  onFavoriteChange={handleFavoriteChange}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No favorite providers"
              description="Like providers from the search page to see them here."
            />
          )}
        </div>

        {/* Recent Requests */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900">Recent Requests</h2>
            <Link
              to="/requests"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View all
            </Link>
          </div>

          {isLoadingRequests ? (
            <div className="text-center py-8 text-slate-600">Loading requests...</div>
          ) : recentRequests.length > 0 ? (
            <div className="space-y-4">
              {recentRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  onCancel={handleCancel}
                  onSchedule={handleSchedule}
                  onViewDetails={handleViewDetails}
                  onUpdate={handleRequestUpdate}
                  userRole={userRole}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No recent requests"
              description="Start by searching for providers or submitting a request."
            />
          )}
        </div>
      </div>
    </div>
  )
}

