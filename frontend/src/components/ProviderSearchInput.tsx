/**
 * ProviderSearchInput.tsx - Provider Search Input Component
 * 
 * An autocomplete input component for searching and selecting providers.
 * Shows suggestions as the user types and displays selected provider.
 */

export interface ProviderSuggestion {
  id: string
  name: string
  specialty: string
}

interface ProviderSearchInputProps {
  value: string
  suggestions: ProviderSuggestion[]
  selectedProvider: ProviderSuggestion | null
  onValueChange: (value: string) => void
  onSelectProvider: (provider: ProviderSuggestion) => void
  onClearSelection: () => void
}

export default function ProviderSearchInput({
  value,
  suggestions,
  selectedProvider,
  onValueChange,
  onSelectProvider,
  onClearSelection,
}: ProviderSearchInputProps) {
  const filteredSuggestions = value
    ? suggestions.filter(
        (p) =>
          p.name.toLowerCase().includes(value.toLowerCase()) ||
          p.specialty.toLowerCase().includes(value.toLowerCase())
      )
    : []

  return (
    <div className="mb-6">
      <label htmlFor="providerSearch" className="block text-sm font-medium text-slate-700 mb-2">
        Search for Provider
      </label>
      <div className="relative">
        <input
          id="providerSearch"
          type="text"
          value={value}
          onChange={(e) => {
            onValueChange(e.target.value)
            if (selectedProvider && e.target.value !== selectedProvider.name) {
              onClearSelection()
            }
          }}
          placeholder="Type provider name or specialty..."
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {value && !selectedProvider && filteredSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {filteredSuggestions.map((provider) => (
              <button
                key={provider.id}
                type="button"
                onClick={() => onSelectProvider(provider)}
                className="w-full text-left px-4 py-2 hover:bg-slate-50 focus:bg-slate-50 focus:outline-none"
              >
                <div className="font-medium text-slate-900">{provider.name}</div>
                <div className="text-sm text-slate-600">{provider.specialty}</div>
              </button>
            ))}
          </div>
        )}
      </div>
      {selectedProvider && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">{selectedProvider.name}</p>
              <p className="text-sm text-slate-600">{selectedProvider.specialty}</p>
            </div>
            <button
              type="button"
              onClick={onClearSelection}
              className="text-slate-500 hover:text-slate-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

