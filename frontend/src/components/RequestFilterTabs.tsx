/**
 * RequestFilterTabs.tsx - Request Filter Tabs Component
 * 
 * Provides filter buttons for filtering requests by status:
 * - All
 * - Pending
 * - Approved
 * - Rejected
 */

export type RequestStatus = 'pending' | 'approved' | 'rejected'

interface RequestFilterTabsProps {
  currentFilter: RequestStatus | 'all'
  onFilterChange: (filter: RequestStatus | 'all') => void
}

export default function RequestFilterTabs({ currentFilter, onFilterChange }: RequestFilterTabsProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-6 dark:bg-slate-800 dark:border-slate-700">
      <div className="flex gap-2">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
          <button
            key={status}
            onClick={() => onFilterChange(status)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${currentFilter === status
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>
    </div>
  )
}

