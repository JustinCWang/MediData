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

type RequestStatus = 'pending' | 'approved' | 'rejected'

interface Request {
  id: string
  providerName: string
  specialty: string
  requestedDate: string
  status: RequestStatus
  message?: string
}

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

  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
    }
  }

  const getStatusIcon = (status: RequestStatus) => {
    switch (status) {
      case 'pending':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'approved':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      case 'rejected':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
    }
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

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-6">
          <div className="flex gap-2">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Requests List */}
        {filteredRequests.length > 0 ? (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">{request.providerName}</h3>
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 ${getStatusColor(
                          request.status
                        )}`}
                      >
                        {getStatusIcon(request.status)}
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-1">{request.specialty}</p>
                    <p className="text-xs text-slate-500">
                      Requested on {new Date(request.requestedDate).toLocaleDateString()}
                    </p>
                    {request.message && (
                      <p className="mt-3 text-sm text-slate-700 bg-slate-50 rounded-md p-3">
                        {request.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  {request.status === 'pending' && (
                    <button className="px-4 py-2 bg-red-50 text-red-700 rounded-md text-sm font-medium hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
                      Cancel Request
                    </button>
                  )}
                  {request.status === 'approved' && (
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                      Schedule Appointment
                    </button>
                  )}
                  <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
            <svg
              className="w-16 h-16 text-slate-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-slate-600 mb-2">No requests found</p>
            <p className="text-sm text-slate-500">
              {filter === 'all'
                ? 'You haven\'t made any requests yet.'
                : `No ${filter} requests found.`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

