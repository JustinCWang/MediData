/**
 * RequestCard.tsx - Request Card Component
 * 
 * Displays a single provider request with status, details, and actions.
 * Shows provider name, specialty, date, message, and action buttons.
 */

import type { RequestStatus } from './RequestFilterTabs'

export interface Request {
  id: string
  providerName: string
  specialty: string
  requestedDate: string
  status: RequestStatus
  message?: string
}

interface RequestCardProps {
  request: Request
  onCancel?: (requestId: string) => void
  onSchedule?: (requestId: string) => void
  onViewDetails?: (requestId: string) => void
}

export default function RequestCard({
  request,
  onCancel,
  onSchedule,
  onViewDetails,
}: RequestCardProps) {
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
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
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
          <button
            onClick={() => onCancel?.(request.id)}
            className="px-4 py-2 bg-red-50 text-red-700 rounded-md text-sm font-medium hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Cancel Request
          </button>
        )}
        {request.status === 'approved' && (
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
    </div>
  )
}

