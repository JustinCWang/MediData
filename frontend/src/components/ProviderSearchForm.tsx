/**
 * ProviderSearchForm.tsx - Provider Search Form Component
 * 
 * A form component for searching healthcare providers with filters:
 * - Provider name
 * - Specialty
 * - Location
 * - Insurance
 */

interface ProviderSearchFormProps {
  searchQuery: string
  specialty: string
  location: string
  insurance: string
  onSearchQueryChange: (value: string) => void
  onSpecialtyChange: (value: string) => void
  onLocationChange: (value: string) => void
  onInsuranceChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
  isSearching: boolean
}

export default function ProviderSearchForm({
  searchQuery,
  specialty,
  location,
  insurance,
  onSearchQueryChange,
  onSpecialtyChange,
  onLocationChange,
  onInsuranceChange,
  onSubmit,
  isSearching,
}: ProviderSearchFormProps) {
  return (
    <form onSubmit={onSubmit} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-8">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="searchQuery" className="block text-sm font-medium text-slate-700 mb-1">
            Provider Name
          </label>
          <input
            id="searchQuery"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            placeholder="Search by name..."
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="specialty" className="block text-sm font-medium text-slate-700 mb-1">
            Specialty
          </label>
          <input
            id="specialty"
            type="text"
            value={specialty}
            onChange={(e) => onSpecialtyChange(e.target.value)}
            placeholder="e.g., Cardiology, Dermatology..."
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-slate-700 mb-1">
            Location
          </label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            placeholder="City, State or ZIP"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="insurance" className="block text-sm font-medium text-slate-700 mb-1">
            Insurance
          </label>
          <input
            id="insurance"
            type="text"
            value={insurance}
            onChange={(e) => onInsuranceChange(e.target.value)}
            placeholder="Insurance provider"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={isSearching}
        className="mt-4 w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
      >
        {isSearching ? 'Searching...' : 'Search Providers'}
      </button>
    </form>
  )
}

