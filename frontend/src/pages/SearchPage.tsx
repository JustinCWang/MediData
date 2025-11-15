/**
 * SearchPage.tsx - Provider Search Page
 * 
 * Allows users to search for healthcare providers using NPI Registry API:
 * - NPI Number
 * - Provider Type (Individual/Organization)
 * - Name (First/Last for individuals, Organization name for orgs)
 * - Specialty/Taxonomy
 * - Location (City, State, Postal Code)
 * 
 * Displays search results in a card layout with provider information.
 */

import { useState } from 'react'
import ProviderSearchForm from '../components/ProviderSearchForm'
import ProviderCard from '../components/ProviderCard'
import type { Provider } from '../components/ProviderCard'
import EmptyState from '../components/EmptyState'

const API_BASE_URL = 'http://localhost:8000'

// Type definitions for API response
interface ApiProviderResult {
  id?: string
  npi_number?: string
  name?: string
  specialty?: string
  location?: string
  rating?: number
  insurance?: string[]
}

interface ApiSearchResponse {
  result_count: number
  results: ApiProviderResult[]
  api_result_count?: number
  debug_info?: {
    api_returned_count: number
    transformed_count: number
    params_sent: Record<string, string | number>
  }
}

export default function SearchPage() {
  const [enumerationType, setEnumerationType] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [organizationName, setOrganizationName] = useState('')
  const [taxonomyDescription, setTaxonomyDescription] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [limit, setLimit] = useState(20)
  const [results, setResults] = useState<Provider[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSearching(true)
    setError(null)

    try {
      // Build query parameters
      const params = new URLSearchParams()
      
      if (enumerationType) params.append('enumeration_type', enumerationType)
      if (taxonomyDescription.trim()) params.append('taxonomy_description', taxonomyDescription.trim())
      if (firstName.trim()) params.append('first_name', firstName.trim())
      if (lastName.trim()) params.append('last_name', lastName.trim())
      if (organizationName.trim()) params.append('organization_name', organizationName.trim())
      if (city.trim()) params.append('city', city.trim())
      if (state.trim()) params.append('state', state.trim())
      if (postalCode.trim()) params.append('postal_code', postalCode.trim())
      
      // Add limit parameter
      params.append('limit', limit.toString())

      // Call backend API
      const response = await fetch(`${API_BASE_URL}/api/providers/search?${params.toString()}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to search providers' }))
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      const data: ApiSearchResponse = await response.json()
      
      // Check for debug info (API returned results but transformation failed)
      if (data.debug_info) {
        console.warn('Debug info:', data.debug_info)
        // Show a warning if API returned results but we couldn't transform them
        if (data.api_result_count && data.api_result_count > 0 && data.result_count === 0) {
          setError(
            `API returned ${data.api_result_count} results but transformation failed. ` +
            `Check console for details. This may indicate a data structure issue.`
          )
        }
      }
      
      // Transform results to match Provider interface
      const transformedResults: Provider[] = data.results.map((result: ApiProviderResult) => ({
        id: result.id || result.npi_number || '',
        name: result.name || 'Unknown Provider',
        specialty: result.specialty || 'Not specified',
        location: result.location || 'Location not available',
        rating: result.rating || 0,
        insurance: result.insurance || [],
      }))

      setResults(transformedResults)
      
      // If API returned results but we got none, log for debugging
      if (data.api_result_count && data.api_result_count > 0 && transformedResults.length === 0) {
        console.error('API returned results but transformation produced none:', data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while searching providers')
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleViewDetails = (providerId: string) => {
    // TODO: Navigate to provider details page
    console.log('View details for provider:', providerId)
  }

  // Count active filters (excluding limit)
  const countActiveFilters = () => {
    let count = 0
    if (enumerationType) count++
    if (taxonomyDescription.trim()) count++
    if (firstName.trim()) count++
    if (lastName.trim()) count++
    if (organizationName.trim()) count++
    if (city.trim()) count++
    if (state.trim()) count++
    if (postalCode.trim()) count++
    return count
  }

  // Get smart empty state message based on filter count
  const getEmptyStateMessage = () => {
    const filterCount = countActiveFilters()
    
    if (filterCount === 0) {
      return {
        title: "No providers found",
        description: "Enter search criteria above to find providers. Try searching by name, specialty, or location."
      }
    } else if (filterCount <= 2) {
      return {
        title: "No providers found",
        description: "Try adding more specific filters to narrow your search. Consider adding a specialty, location, or provider type."
      }
    } else if (filterCount >= 5) {
      return {
        title: "No providers found",
        description: "Your search is too specific. Try removing some filters or broadening your search criteria to find more results."
      }
    } else {
      return {
        title: "No providers found",
        description: "No providers match your search criteria. Try adjusting your filters or searching with different terms."
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Search Providers</h1>
        <p className="text-slate-600 mb-6">Find healthcare providers using the NPI Registry</p>

        <ProviderSearchForm
          enumerationType={enumerationType}
          firstName={firstName}
          lastName={lastName}
          organizationName={organizationName}
          taxonomyDescription={taxonomyDescription}
          city={city}
          state={state}
          postalCode={postalCode}
          limit={limit}
          onEnumerationTypeChange={setEnumerationType}
          onFirstNameChange={setFirstName}
          onLastNameChange={setLastName}
          onOrganizationNameChange={setOrganizationName}
          onTaxonomyDescriptionChange={setTaxonomyDescription}
          onCityChange={setCity}
          onStateChange={setState}
          onPostalCodeChange={setPostalCode}
          onLimitChange={setLimit}
          onSubmit={handleSearch}
          isSearching={isSearching}
        />

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Search Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900">
              Search Results ({results.length})
            </h2>
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

        {results.length === 0 && !isSearching && !error && (
          <EmptyState
            title={getEmptyStateMessage().title}
            description={getEmptyStateMessage().description}
          />
        )}
      </div>
    </div>
  )
}

