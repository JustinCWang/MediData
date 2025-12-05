/**
 * DashboardPage.tsx - User Dashboard
 * 
 * Main dashboard page for authenticated users. Provides an overview of:
 * - Recent requests
 * - Quick actions (Search, Request Provider)
 * - Account summary
 */

import { Link, useNavigate } from 'react-router-dom'
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
  const [avatar, setAvatar] = useState<string | null>(null)
  const navigate = useNavigate();

  const avatarKeyForUser = (u: User | null) => {
    if (!u) return null
    const email = (u as any)?.email || (u as any)?.user_metadata?.email
    if (email) return `avatar_${email}`
    if ((u as any)?.id) return `avatar_${(u as any).id}`
    return null
  }

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
    const loadAvatar = () => {
      const key = avatarKeyForUser(user)
      if (key) {
        const storedAvatar = localStorage.getItem(key)
        if (storedAvatar) {
          setAvatar(storedAvatar)
          return
        }
      }
      if (user?.user_metadata?.avatar) {
        setAvatar(user.user_metadata.avatar as unknown as string)
      } else {
        setAvatar(null)
      }
    }
    loadAvatar()
    const handleAvatarChange = () => loadAvatar()
    window.addEventListener('avatar-change', handleAvatarChange)
    return () => window.removeEventListener('avatar-change', handleAvatarChange)
  }, [user])

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
    const provider = favoriteProviders.find(p => p.id === providerId)
    navigate(`/providers/${providerId}`, { state: { provider } })
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
    <div className="page-surface relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-20 h-80 w-80 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-emerald-200/35 blur-[110px]" />
        <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-cyan-200/30 blur-[90px]" />
      </div>
      <div className="relative mx-auto max-w-6xl px-6 py-10 space-y-8 z-10">
        {/* Hero glass summary */}
        <div className="rounded-3xl bg-white/70 border border-white/60 shadow-[0_24px_70px_-35px_rgba(15,23,42,0.4)] backdrop-blur-xl overflow-hidden">
          <div className="grid md:grid-cols-[1.6fr_1fr]">
            <div className="p-6 md:p-8 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full overflow-hidden bg-gradient-to-r from-sky-500 to-emerald-400 opacity-90 flex items-center justify-center text-white font-semibold">
                  {avatar ? (
                    <img src={avatar} alt="avatar" className="h-full w-full object-cover" />
                  ) : (
                    (getUserDisplayName().charAt(0).toUpperCase())
                  )}
                </div>
                <div>
                  <p className="text-sm text-slate-600">Welcome back</p>
                  <h1 className="text-3xl font-semibold text-slate-900 leading-tight">
                    {getUserDisplayName()}
                  </h1>
                </div>
              </div>
              <p className="text-slate-600 text-sm md:text-base">
                Manage your favorites, track requests, and book new appointments with a calm, glassy workspace.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/search"
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-sky-600 via-blue-600 to-emerald-500 shadow-sm hover:shadow-md hover:-translate-y-[1px] transition"
                >
                  Search providers
                  <span className="text-base">↗</span>
                </Link>
                <Link
                  to="/request-provider"
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold border border-white/70 bg-white/70 text-slate-800 hover:bg-white hover:shadow-sm"
                >
                  Request provider
                </Link>
              </div>
            </div>
            <div className="relative p-6 md:p-8 bg-gradient-to-br from-sky-100/70 via-white/60 to-emerald-50/70">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-10 -right-6 h-32 w-32 rounded-full bg-sky-200/50 blur-3xl" />
                <div className="absolute bottom-0 left-2 h-28 w-28 rounded-full bg-emerald-200/50 blur-2xl" />
              </div>
              <div className="relative grid grid-cols-2 gap-4">
                <StatPill label="Favorites" value={favoriteProviders.length} />
                <StatPill label="Recent requests" value={recentRequests.length} />
                <StatPill label="Role" value={userRole === 'provider' ? 'Provider' : 'Patient'} />
                <Link
                  to="/requests"
                  className="rounded-2xl border border-white/60 bg-white/70 backdrop-blur p-3 flex items-center justify-between text-sm text-slate-700 hover:shadow-sm"
                >
                  View all requests <span className="text-base">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-6">
          <div className="space-y-6">
            <div className="rounded-2xl bg-white/75 border border-white/60 shadow-lg backdrop-blur p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Favorite Providers</h2>
                  <p className="text-sm text-slate-600">Quickly reach the clinicians you trust</p>
                </div>
                <Link to="/search" className="text-sm font-medium text-blue-600 hover:text-blue-700">
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

            <div className="rounded-2xl bg-white/75 border border-white/60 shadow-lg backdrop-blur p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Recent Requests</h2>
                  <p className="text-sm text-slate-600">Track confirmations and next steps</p>
                </div>
                <Link to="/requests" className="text-sm font-medium text-blue-600 hover:text-blue-700">
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

          <div className="space-y-6">
            <div className="rounded-2xl bg-white/70 border border-white/60 shadow-lg backdrop-blur p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Quick actions</h3>
              <div className="flex flex-col gap-3">
                <Link
                  to="/search"
                  className="flex items-center justify-between rounded-xl border border-white/70 bg-gradient-to-r from-sky-100/80 via-white/70 to-emerald-100/70 px-4 py-3 text-sm font-semibold text-slate-800 hover:shadow-md"
                >
                  Find a provider <span className="text-base">↗</span>
                </Link>
                <Link
                  to="/request-provider"
                  className="flex items-center justify-between rounded-xl border border-white/70 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-800 hover:shadow-md"
                >
                  Submit a request <span className="text-base">+</span>
                </Link>
              </div>
            </div>

            <div className="rounded-2xl bg-white/70 border border-white/60 shadow-lg backdrop-blur p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Stay prepared</h3>
              <ul className="text-sm text-slate-700 space-y-2">
                <li>• Keep your insurance info up to date in Profile.</li>
                <li>• Add favorites from search to book faster next time.</li>
                <li>• Check request status for confirmations and follow-ups.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/80 backdrop-blur p-3 text-sm">
      <p className="text-slate-500">{label}</p>
      <p className="text-lg font-semibold text-slate-900">{value}</p>
    </div>
  )
}
