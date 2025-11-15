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
import ProviderSearchForm from '../components/ProviderSearchForm'
import ProviderCard from '../components/ProviderCard'
import type { Provider } from '../components/ProviderCard'
import EmptyState from '../components/EmptyState'

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [location, setLocation] = useState('')
  const [insurance, setInsurance] = useState('')
  const [results, setResults] = useState<Provider[]>([])
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

  const handleViewDetails = (providerId: string) => {
    // TODO: Navigate to provider details page
    console.log('View details for provider:', providerId)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Search Providers</h1>
        <p className="text-slate-600 mb-6">Find the right healthcare provider for your needs</p>

        <ProviderSearchForm
          searchQuery={searchQuery}
          specialty={specialty}
          location={location}
          insurance={insurance}
          onSearchQueryChange={setSearchQuery}
          onSpecialtyChange={setSpecialty}
          onLocationChange={setLocation}
          onInsuranceChange={setInsurance}
          onSubmit={handleSearch}
          isSearching={isSearching}
        />

        {/* Search Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900">Search Results</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {results.map((provider) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          </div>
        )}

        {results.length === 0 && !isSearching && (
          <EmptyState
            title="No providers found"
            description="Enter search criteria above to find providers"
          />
        )}
      </div>
    </div>
  )
}

