/**
 * EmptyState.tsx - Empty State Component
 * 
 * A reusable component for displaying empty states when no data is available.
 * Used in various pages to show when lists are empty.
 */

interface EmptyStateProps {
  title: string
  description: string
  icon?: React.ReactNode
}

export default function EmptyState({ title, description, icon }: EmptyStateProps) {
  const defaultIcon = (
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
  )

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
      {icon || defaultIcon}
      <p className="text-slate-600 mb-2">{title}</p>
      <p className="text-sm text-slate-500">{description}</p>
    </div>
  )
}

