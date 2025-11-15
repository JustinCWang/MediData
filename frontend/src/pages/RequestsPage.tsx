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

import { useState } from 'react'
import RequestFilterTabs from '../components/RequestFilterTabs'
import type { RequestStatus } from '../components/RequestFilterTabs'
import RequestCard from '../components/RequestCard'
import type { Request } from '../components/RequestCard'
import EmptyState from '../components/EmptyState'

export default function RequestsPage() {
  const [filter, setFilter] = useState<RequestStatus | 'all'>('all')
  const [requests] = useState<Request[]>([
    {
      id: '1',
      providerName: 'Dr. John Smith',
      specialty: 'Cardiology',
      requestedDate: '2025-01-15',
      status: 'pending',
      message: 'Requesting consultation for heart health checkup',
    },
    {
      id: '2',
      providerName: 'Dr. Sarah Johnson',
      specialty: 'Dermatology',
      requestedDate: '2025-01-10',
      status: 'approved',
      message: 'Follow-up appointment requested',
    },
    {
      id: '3',
      providerName: 'Dr. Michael Brown',
      specialty: 'Orthopedics',
      requestedDate: '2025-01-05',
      status: 'rejected',
      message: 'Provider not accepting new patients',
    },
  ])

  // Replace with actual API call to fetch requests
  // useEffect(() => {
  //   fetch('/api/requests')
  //     .then(res => res.json())
  //     .then(data => setRequests(data))
  // }, [])

  const filteredRequests = filter === 'all' 
    ? requests 
    : requests.filter(req => req.status === filter)

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

        {/* Requests List */}
        {filteredRequests.length > 0 ? (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                onCancel={handleCancel}
                onSchedule={handleSchedule}
                onViewDetails={handleViewDetails}
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

