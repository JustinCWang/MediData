/**
 * RequestCard.tsx - Request Card Component
 * 
 * Displays a single provider request with status, details, and actions.
 * Shows provider name, specialty, date, message, and action buttons.
 * Supports editing for both patients and providers.
 */

import { useState } from 'react'
import type { RequestStatus } from './RequestFilterTabs'

const API_BASE_URL = 'http://localhost:8000'

export interface Request {
  id: string
  providerName: string
  specialty: string
  requestedDate: string  // Appointment date
  requestedTime?: string  // Appointment time
  createdAt?: string  // When request was created
  status: RequestStatus
  message?: string
  response?: string
  provider_id?: string
  patient_id?: string
}

interface RequestCardProps {
  request: Request
  onCancel?: (requestId: string) => void
  onSchedule?: (requestId: string) => void
  onViewDetails?: (requestId: string) => void
  onUpdate?: () => void
  userRole?: 'patient' | 'provider'
}

export default function RequestCard({
  request,
  onSchedule,
  onViewDetails,
  onUpdate,
  userRole = 'patient',
}: RequestCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Patient edit fields
  const [editDate, setEditDate] = useState(request.requestedDate || '')
  const [editTime, setEditTime] = useState(request.requestedTime || '')
  const [editMessage, setEditMessage] = useState(request.message || '')
  
  // Provider edit fields
  const [editStatus, setEditStatus] = useState<RequestStatus>(request.status)
  const [editResponse, setEditResponse] = useState(request.response || '')

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

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)

    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        setError('Please log in to update requests')
        setIsSaving(false)
        return
      }

      const updateData: {
        date?: string
        time?: string
        message?: string
        status?: string
        response?: string
      } = {}

      if (userRole === 'patient') {
        if (editDate !== request.requestedDate) {
          updateData.date = editDate || undefined
        }
        if (editTime !== request.requestedTime) {
          updateData.time = editTime || undefined
        }
        if (editMessage !== request.message) {
          updateData.message = editMessage
        }
      } else if (userRole === 'provider') {
        // Only providers can change status
        if (editStatus !== request.status) {
          updateData.status = editStatus
        }
        if (editResponse !== request.response) {
          updateData.response = editResponse
        }
      }

      if (Object.keys(updateData).length === 0) {
        setIsEditing(false)
        setIsSaving(false)
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/requests/${request.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to update request' }))
        throw new Error(errorData.detail || 'Failed to update request')
      }

      setIsEditing(false)
      onUpdate?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update request')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = async () => {
    if (userRole !== 'patient') return

    if (!confirm('Are you sure you want to cancel this request?')) {
      return
    }

    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        setError('Please log in to cancel requests')
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/requests/${request.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to cancel request' }))
        throw new Error(errorData.detail || 'Failed to cancel request')
      }

      // Request was deleted, refresh the list
      onUpdate?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel request')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-slate-900">
              {userRole === 'provider' ? `Patient: ${request.providerName}` : request.providerName}
            </h3>
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
          
          {error && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
              <p className="text-xs text-red-800">{error}</p>
            </div>
          )}

          {!isEditing ? (
            <>
              {request.createdAt && (
                <p className="text-xs text-slate-500 mt-1">
                  Requested on {new Date(request.createdAt).toLocaleString()}
                </p>
              )}
              {request.requestedDate && (
                <p className="text-xs text-slate-500 mt-1">
                  Preferred appointment date: {new Date(request.requestedDate).toLocaleDateString()}
                  {request.requestedTime && ` at ${request.requestedTime.substring(0, 5)}`}
                </p>
              )}
              {request.message && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-slate-600 mb-1">Message:</p>
                  <p className="text-sm text-slate-700 bg-slate-50 rounded-md p-3">
                    {request.message}
                  </p>
                </div>
              )}
              {request.response && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-slate-600 mb-1">Provider Response:</p>
                  <p className="text-sm text-slate-700 bg-blue-50 rounded-md p-3">
                    {request.response}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="mt-3 space-y-4">
              {userRole === 'patient' ? (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Preferred Appointment Date
                    </label>
                    <input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Preferred Appointment Time
                    </label>
                    <input
                      type="time"
                      value={editTime}
                      onChange={(e) => setEditTime(e.target.value)}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Message
                    </label>
                    <textarea
                      value={editMessage}
                      onChange={(e) => setEditMessage(e.target.value)}
                      rows={4}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Enter your message..."
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Status
                    </label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as RequestStatus)}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Response
                    </label>
                    <textarea
                      value={editResponse}
                      onChange={(e) => setEditResponse(e.target.value)}
                      rows={4}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Enter your response..."
                    />
                  </div>
                  {request.message && (
                    <div>
                      <p className="text-xs font-medium text-slate-600 mb-1">Patient Message:</p>
                      <p className="text-sm text-slate-700 bg-slate-50 rounded-md p-3">
                        {request.message}
                      </p>
                    </div>
                  )}
                </>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false)
                    setError(null)
                    // Reset form
                    setEditDate(request.requestedDate || '')
                    setEditTime(request.requestedTime || '')
                    setEditMessage(request.message || '')
                    setEditStatus(request.status)
                    setEditResponse(request.response || '')
                  }}
                  disabled={isSaving}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {!isEditing && (
        <div className="flex gap-2 mt-4">
          {userRole === 'patient' && request.status === 'pending' && (
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-red-50 text-red-700 rounded-md text-sm font-medium hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Cancel Request
            </button>
          )}
          {(userRole === 'patient' || (userRole === 'provider' && request.status === 'pending')) && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-50 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {userRole === 'patient' ? 'Edit Request' : 'Respond'}
            </button>
          )}
          {request.status === 'approved' && userRole === 'patient' && (
            <button
              onClick={() => onSchedule?.(request.id)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Schedule Appointment
            </button>
          )}
          <button
            onClick={() => onViewDetails?.(request.id)}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            View Details
          </button>
        </div>
      )}
    </div>
  )
}
