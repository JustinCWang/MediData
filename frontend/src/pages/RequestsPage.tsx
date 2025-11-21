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

const API_BASE_URL = 'http://localhost:8000'

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

  const handleSchedule = (requestId: string) => {
    // TODO: Navigate to scheduling page
    console.log('Schedule appointment for request:', requestId)
  }

  const handleViewDetails = (requestId: string) => {
    // TODO: Navigate to request details page
    console.log('View details for request:', requestId)
  }

  const handleUpdate = () => {
    // Refresh requests after update
    fetchRequests()
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">My Requests</h1>
            <p className="text-slate-600">View and manage your provider requests</p>
          </div>
        </div>

        <RequestFilterTabs currentFilter={filter} onFilterChange={setFilter} />

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Requests List */}
        {isLoading ? (
          <div className="text-center py-12 text-slate-600">Loading requests...</div>
        ) : filteredRequests.length > 0 ? (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                onCancel={handleCancel}
                onSchedule={handleSchedule}
                onViewDetails={handleViewDetails}
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
  )
}

