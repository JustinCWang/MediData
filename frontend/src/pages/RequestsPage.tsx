/**
 * RequestsPage.tsx - Requests Page
 * 
 * Displays a list of all provider requests made by the user.
 * Shows request status, provider information, and allows users to manage requests.
 * 
 * Features:
 * - List of all requests with status indicators
 * - Filter by status (pending, approved, rejected)
 * - Request details and actions
 */

import { useState, useEffect } from 'react'
import RequestFilterTabs from '../components/RequestFilterTabs'
import type { RequestStatus } from '../components/RequestFilterTabs'
import RequestCard from '../components/RequestCard'
import type { Request } from '../components/RequestCard'
import EmptyState from '../components/EmptyState'
import { API_BASE_URL } from '../config'

export default function RequestsPage() {
  const [filter, setFilter] = useState<RequestStatus | 'all'>('all')
  const [requests, setRequests] = useState<Request[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<'patient' | 'provider'>('patient')

  useEffect(() => {
    // Get user role from localStorage
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const user = JSON.parse(userData)
        const role = user.user_metadata?.role || 'patient'
        setUserRole(role as 'patient' | 'provider')
      } catch (e) {
        console.error('Error parsing user data:', e)
      }
    }
  }, [])

  const fetchRequests = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        setError('Please log in to view requests')
        setIsLoading(false)
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/requests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        // Sort by requestedDate descending (most recent first)
        // Handle empty dates by putting them at the end
        const sortedRequests = (data.requests || []).sort((a: Request, b: Request) => {
          const dateA = a.requestedDate ? new Date(a.requestedDate).getTime() : 0
          const dateB = b.requestedDate ? new Date(b.requestedDate).getTime() : 0
          return dateB - dateA
        })
        setRequests(sortedRequests)
      } else {
        setError('Failed to load requests')
      }
    } catch (err) {
      console.error('Error fetching requests:', err)
      setError('Failed to load requests')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const filteredRequests = filter === 'all'
    ? requests
    : requests.filter(req => req.status === filter)

  const handleCancel = () => {
    // RequestCard handles cancellation internally
    fetchRequests()
  }

  const handleUpdate = () => {
    // Refresh requests after update
    fetchRequests()
  }

  return (
    <div className="page-surface relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-20 h-80 w-80 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-emerald-200/35 blur-[110px]" />
        <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-cyan-200/30 blur-[90px]" />
      </div>
      <div className="relative mx-auto max-w-6xl px-6 py-10 space-y-6 z-10">
        <div className="rounded-3xl bg-white/70 border border-white/60 shadow-[0_24px_70px_-35px_rgba(15,23,42,0.35)] backdrop-blur-xl p-6 md:p-8 flex flex-col gap-2 dark:bg-slate-900/80 dark:border-slate-700">
          <h1 className="text-3xl font-semibold text-slate-900 leading-tight dark:text-white">My Requests</h1>
          <p className="text-slate-600 text-sm md:text-base dark:text-slate-400">View, filter, and follow up on every provider request.</p>
          <div className="text-sm text-slate-600 flex flex-wrap gap-2 dark:text-slate-400">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 py-1 dark:bg-slate-800 dark:border-slate-700">
              Quick filters
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 py-1 dark:bg-slate-800 dark:border-slate-700">
              Status-aware timeline
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_1.5fr] gap-6">
          <div className="space-y-4">
            <div className="rounded-2xl bg-white/75 border border-white/60 shadow-lg backdrop-blur p-6 dark:bg-slate-900/80 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 mb-3 dark:text-white">Filters</h3>
              <RequestFilterTabs currentFilter={filter} onFilterChange={setFilter} />
            </div>
            <div className="rounded-2xl bg-white/75 border border-white/60 shadow-lg backdrop-blur p-6 dark:bg-slate-900/80 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 mb-3 dark:text-white">Tips</h3>
              <ul className="text-sm text-slate-700 space-y-2 dark:text-slate-400">
                <li>• Use filters to find pending items that need your response.</li>
                <li>• Check confirmed requests for location/time details.</li>
                <li>• If a request is delayed, follow up via the provider’s preferred contact.</li>
              </ul>
            </div>
          </div>

          <div className="rounded-2xl bg-white/75 border border-white/60 shadow-lg backdrop-blur p-6 space-y-4 dark:bg-slate-900/80 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Requests</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {filteredRequests.length > 0 ? `${filteredRequests.length} shown` : 'No requests yet'}
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Requests List */}
            {isLoading ? (
              <div className="text-center py-12 text-slate-600 dark:text-slate-400">Loading requests...</div>
            ) : filteredRequests.length > 0 ? (
              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    onCancel={handleCancel}
                    onUpdate={handleUpdate}
                    userRole={userRole}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No requests found"
                description={
                  filter === 'all'
                    ? "You haven't made any requests yet."
                    : `No ${filter} requests found.`
                }
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
