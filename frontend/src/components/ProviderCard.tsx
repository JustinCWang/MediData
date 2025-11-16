/**
 * ProviderCard.tsx - Provider Card Component
 * 
 * Displays a single provider's information in a card format.
 * Shows name, specialty, location, rating, insurance, and action button.
 */

export interface Provider {
  id: string
  name: string
  specialty: string
  location: string
  rating: number
  insurance: string[]
  is_affiliated?: boolean
}

interface ProviderCardProps {
  provider: Provider
  onViewDetails?: (providerId: string) => void
}

export default function ProviderCard({ provider, onViewDetails }: ProviderCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-slate-900">{provider.name}</h3>
            {provider.is_affiliated && (
              <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-md">
                Affiliated
              </span>
            )}
          </div>
          <p className="text-sm text-slate-600">{provider.specialty}</p>
        </div>
        <div className="flex items-center gap-1">
          <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-sm font-medium text-slate-700">{provider.rating}</span>
        </div>
      </div>
      <p className="text-sm text-slate-600 mb-3">{provider.location}</p>
      <div className="flex flex-wrap gap-2">
        {provider.insurance.map((ins, idx) => (
          <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md">
            {ins}
          </span>
        ))}
      </div>
      <button
        onClick={() => onViewDetails?.(provider.id)}
        className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        View Details
      </button>
    </div>
  )
}

