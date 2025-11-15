/**
 * SearchPage.tsx - Provider Search Page
 * 
 * Allows users to search for healthcare providers based on various criteria:
 * - Provider name
 * - Specialty
 * - Location
 * - Insurance
 * 
 * Displays search results in a card layout with provider information.
 */

import { useState } from 'react'

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [location, setLocation] = useState('')
  const [insurance, setInsurance] = useState('')
  const [results, setResults] = useState<Array<{
    id: string
    name: string
    specialty: string
    location: string
    rating: number
    insurance: string[]
  }>>([])
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSearching(true)

    // Replace with actual API call to backend search endpoint
    // For now, simulate search results
    setTimeout(() => {
      setResults([
        {
          id: '1',
          name: 'Dr. John Smith',
          specialty: 'Cardiology',
          location: 'New York, NY',
          rating: 4.8,
          insurance: ['Blue Cross', 'Aetna'],
        },
        {
          id: '2',
          name: 'Dr. Sarah Johnson',
          specialty: 'Dermatology',
          location: 'Boston, MA',
          rating: 4.9,
          insurance: ['Blue Cross', 'Cigna'],
        },
      ])
      setIsSearching(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Search Providers</h1>
        <p className="text-slate-600 mb-6">Find the right healthcare provider for your needs</p>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="searchQuery" className="block text-sm font-medium text-slate-700 mb-1">
                Provider Name
              </label>
              <input
                id="searchQuery"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                onChange={(e) => setSpecialty(e.target.value)}
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
                onChange={(e) => setLocation(e.target.value)}
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
                onChange={(e) => setInsurance(e.target.value)}
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

        {/* Search Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900">Search Results</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {results.map((provider) => (
                <div
                  key={provider.id}
                  className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{provider.name}</h3>
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
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md"
                      >
                        {ins}
                      </span>
                    ))}
                  </div>
                  <button className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {results.length === 0 && !isSearching && (
          <div className="text-center py-12 text-slate-500">
            <p>Enter search criteria above to find providers</p>
          </div>
        )}
      </div>
    </div>
  )
}

