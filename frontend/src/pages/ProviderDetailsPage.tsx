import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import type { Provider } from '../components/ProviderCard';

const API_BASE_URL = 'https://localhost:8000';
type LocationState = { provider?: Provider }

export default function ProviderDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const stateProvider = (location.state as LocationState | null)?.provider;
    const [provider, setProvider] = useState<Provider | null>(stateProvider ?? null);
    const [isLoading, setIsLoading] = useState(!stateProvider);
    const [error, setError] = useState<string | null>(null);

    const header = useMemo(() => {
        if (!provider) return { title: 'Provider Details', subtitle: '' };
        return {
            title: provider.name,
            subtitle: provider.specialty || 'Not Specified',
        };
    }, [provider]);

    useEffect(() => {
        if (provider || !id || stateProvider) return;

        const fetchById = async () => {
            setIsLoading(true)
            setError(null)
            try {
                const resp = await fetch(`${API_BASE_URL}/api/providers/search?number=${encodeURIComponent(id)}&limit=1`)
                if (!resp.ok) {
                    const err = await resp.json().catch(() => ({}))
                    throw new Error(err.detail || 'Failed to load provider details')
                }
                const data = await resp.json()
                const result = data.results?.[0]
                if (!result) {
                    setError('Provider not found')
                    return
                }
                const mapper: Provider = {
                    id: result.id || result.npi_number || id,
                    name: result.name || 'Unknown Provider',
                    specialty: result.specialty || result.taxonomy_description || 'Not specified',
                    location:
                        result.location ||
                        [result.city, result.state].filter(Boolean).join(', ') ||
                        'Location not available',
                    insurance: result.insurance || [],
                    is_affiliated: result.is_affiliated || false,
                    phone: result.phone || result.practice_phone,
                    email: result.email || result.practice_email,
                }
                setProvider(mapper)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unable to load provider')
            } finally {
                setIsLoading(false)
            }
        }

        fetchById()
    }, [id, provider, stateProvider])

    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-sky-50 via-white to-cyan-50">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-24 -left-20 h-80 w-80 rounded-full bg-sky-200/40 blur-3xl" />
                <div className="absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-emerald-200/35 blur-[110px]" />
                <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-cyan-200/30 blur-[90px]" />
            </div>
            <div className="relative mx-auto max-w-6xl px-6 py-10 space-y-6 z-10">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                        Back
                    </button>
                    <span className="text-sm text-slate-500">Provider ID: {id}</span>
                </div>

                <div className="bg-white/80 rounded-xl shadow-sm border border-white/60 backdrop-blur-lg p-6">
                    {isLoading && <p className="text-slate-600">Loading provider details...</p>}
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-sm text-red-800">
                            {error}
                        </div>
                    )}
                    {!isLoading && !error && provider && (
                        <div className="space-y-6">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl font-semibold text-slate-900">{header.title}</h1>
                                    <p className="text-slate-600 mt-1">{header.subtitle}</p>
                                    {provider.is_affiliated && (
                                        <span className="inline-flex mt-2 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-md">
                                            Affiliated
                                        </span>
                                    )}
                                    </div>
                                    <div className="text-right text-sm text-slate-500">
                                        <p>{provider.location}</p>
                                        {provider.id && <p className="mt-1">ID: {provider.id}</p>}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-3 gap-4">
                                    <InfoCard title="Location" value={provider.location} />
                                    <InfoCard title="Specialty" value={provider.specialty || 'Not specified'} />
                                    <InfoCard
                                        title="Insurance"
                                        value={
                                            provider.insurance.length > 0 ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {provider.insurance.map((ins, idx) => (
                                                        <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md">
                                                            {ins}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                'Not provided'
                                            )
                                        }
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <InfoCard title="Phone" value={provider.phone || 'Not provided'} />
                                    <InfoCard
                                        title="Email"
                                        value={
                                            provider.email ? (
                                                <a href={`mailto:${provider.email}`} className="text-blue-600 hover:text-blue-700">
                                                    {provider.email}
                                                </a>
                                            ) : (
                                                'Not provided'
                                            )
                                        }
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <Link
                                        to="/search"
                                        className="px-4 py-2 rounded-md bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200"
                                    >
                                        Back to search
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!provider) return
                                            navigate('/request-provider', { state: { provider } })
                                        }}
                                        className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    >
                                        Request appointment
                                    </button>
                                </div>
                            </div>
                        )}
                </div>
            </div>
        </div>
    )
}

function InfoCard({ title, value }: { title: string; value: React.ReactNode }) {
    return (
      <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/80">
        <p className="text-xs uppercase tracking-wide text-slate-500 font-medium">{title}</p>
        <div className="mt-1 text-sm text-slate-900">{value}</div>
      </div>
    )
}
