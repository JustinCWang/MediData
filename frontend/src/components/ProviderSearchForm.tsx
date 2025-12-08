/**
 * ProviderSearchForm.tsx - Provider Search Form Component
 * 
 * A form component for searching healthcare providers using NPI Registry API fields:
 * - NPI Number
 * - Provider Type (Individual/Organization)
 * - First Name, Last Name (for individuals)
 * - Organization Name (for organizations)
 * - Specialty/Taxonomy
 * - Location (City, State, Postal Code)
 */

interface ProviderSearchFormProps {
  enumerationType: string
  firstName: string
  lastName: string
  organizationName: string
  taxonomyDescription: string
  city: string
  state: string
  postalCode: string
  limit: number
  onEnumerationTypeChange: (value: string) => void
  onFirstNameChange: (value: string) => void
  onLastNameChange: (value: string) => void
  onOrganizationNameChange: (value: string) => void
  onTaxonomyDescriptionChange: (value: string) => void
  onCityChange: (value: string) => void
  onStateChange: (value: string) => void
  onPostalCodeChange: (value: string) => void
  onLimitChange: (value: number) => void
  onSubmit: (e: React.FormEvent) => void
  isSearching: boolean
}

export default function ProviderSearchForm({
  enumerationType,
  firstName,
  lastName,
  organizationName,
  taxonomyDescription,
  city,
  state,
  postalCode,
  limit,
  onEnumerationTypeChange,
  onFirstNameChange,
  onLastNameChange,
  onOrganizationNameChange,
  onTaxonomyDescriptionChange,
  onCityChange,
  onStateChange,
  onPostalCodeChange,
  onLimitChange,
  onSubmit,
  isSearching,
}: ProviderSearchFormProps) {
  return (
    <form onSubmit={onSubmit} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-8 dark:bg-slate-800 dark:border-slate-700">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="enumerationType" className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">
            Provider Type
          </label>
          <select
            id="enumerationType"
            value={enumerationType}
            onChange={(e) => onEnumerationTypeChange(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
          >
            <option value="">All Types</option>
            <option value="NPI-1">Individual (NPI-1)</option>
            <option value="NPI-2">Organization (NPI-2)</option>
          </select>
        </div>
        {enumerationType !== 'NPI-2' && (
          <>
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => onFirstNameChange(e.target.value)}
                placeholder="Provider first name"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => onLastNameChange(e.target.value)}
                placeholder="Provider last name"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              />
            </div>
          </>
        )}
        {enumerationType === 'NPI-2' && (
          <div className="md:col-span-2">
            <label htmlFor="organizationName" className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">
              Organization Name
            </label>
            <input
              id="organizationName"
              type="text"
              value={organizationName}
              onChange={(e) => onOrganizationNameChange(e.target.value)}
              placeholder="Organization name"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            />
          </div>
        )}
        <div>
          <label htmlFor="taxonomyDescription" className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">
            Specialty / Taxonomy
          </label>
          <input
            id="taxonomyDescription"
            type="text"
            value={taxonomyDescription}
            onChange={(e) => onTaxonomyDescriptionChange(e.target.value)}
            placeholder="e.g., Internal Medicine, Cardiology..."
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
          />
        </div>
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">
            City
          </label>
          <input
            id="city"
            type="text"
            value={city}
            onChange={(e) => onCityChange(e.target.value)}
            placeholder="City"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
          />
        </div>
        <div>
          <label htmlFor="state" className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">
            State
          </label>
          <input
            id="state"
            type="text"
            value={state}
            onChange={(e) => onStateChange(e.target.value.toUpperCase())}
            placeholder="State (2-letter code)"
            maxLength={2}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
          />
        </div>
        <div>
          <label htmlFor="postalCode" className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">
            Postal Code
          </label>
          <input
            id="postalCode"
            type="text"
            value={postalCode}
            onChange={(e) => onPostalCodeChange(e.target.value)}
            placeholder="ZIP code"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
          />
        </div>
        <div>
          <label htmlFor="limit" className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">
            Results Limit
          </label>
          <input
            id="limit"
            type="number"
            min="1"
            max="200"
            value={limit}
            onChange={(e) => onLimitChange(parseInt(e.target.value) || 10)}
            placeholder="Number of results"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
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

