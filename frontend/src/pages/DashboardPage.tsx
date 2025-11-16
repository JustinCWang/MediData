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
import EmptyState from '../components/EmptyState'

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
  const [recentRequests] = useState<Request[]>([
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
  ])

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
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

          {recentRequests.length > 0 ? (
            <div className="space-y-4">
              {recentRequests.slice(0, 3).map((request) => (
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
              title="No recent requests"
              description="Start by searching for providers or submitting a request."
            />
          )}
        </div>
      </div>
    </div>
  )
}

