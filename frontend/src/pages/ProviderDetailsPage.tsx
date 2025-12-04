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
    const journeySteps = [
        {
            title: 'Request sent',
            desc: 'Share your reason, availability, and insurance so the team starts with context.',
        },
        {
            title: 'Provider reviews',
            desc: 'We surface fit, availability, and accepted plans so the right clinician responds.',
        },
        {
            title: 'Confirm details',
            desc: 'You get a confirmation with location/contact options and prep guidance.',
        },
    ];

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
        <div className="page-surface relative min-h-screen overflow-hidden">
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

                <div className="bg-white/80 rounded-2xl shadow-lg border border-white/60 backdrop-blur-lg p-6 space-y-6">
                    {isLoading && <p className="text-slate-600">Loading provider details...</p>}
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-sm text-red-800">
                            {error}
                        </div>
                    )}
                    {!isLoading && !error && provider && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl font-semibold text-slate-900">{header.title}</h1>
                                    <p className="text-slate-600 mt-1">{header.subtitle}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        {provider.is_affiliated && (
                                            <span className="inline-flex px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-md">
                                                Affiliated
                                            </span>
                                        )}
                                        <span className="text-xs text-slate-500">ID: {provider.id}</span>
                                    </div>
                                </div>
                                <div className="text-right text-sm text-slate-500">
                                    <p>{provider.location}</p>
                                </div>
                            </div>

                            <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
                                <div className="space-y-4">
                                    <DetailCard title="About this provider">
                                        <p className="text-sm text-slate-700 leading-relaxed">
                                            {provider.specialty
                                                ? `${provider.name} focuses on ${provider.specialty}, keeping availability, insurance, and location up to date so you can book with confidence.`
                                                : `${provider.name} keeps profile details current so you can book with confidence.`}
                                        </p>
                                    </DetailCard>

                                    <DetailCard title="Contact & location">
                                        <div className="grid sm:grid-cols-2 gap-3 text-sm text-slate-700">
                                            <div>
                                                <p className="font-semibold text-slate-900">Phone</p>
                                                <p className="text-slate-700">{provider.phone || 'Not provided'}</p>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900">Email</p>
                                                {provider.email ? (
                                                    <a href={`mailto:${provider.email}`} className="text-blue-600 hover:text-blue-700">
                                                        {provider.email}
                                                    </a>
                                                ) : (
                                                    <p className="text-slate-700">Not provided</p>
                                                )}
                                            </div>
                                            <div className="sm:col-span-2">
                                                <p className="font-semibold text-slate-900">Address</p>
                                                <p className="text-slate-700">{provider.location}</p>
                                            </div>
                                        </div>
                                    </DetailCard>

                                    <DetailCard title="Accepted insurance">
                                        {provider.insurance.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {provider.insurance.map((ins, idx) => (
                                                    <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md">
                                                        {ins}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-slate-700">Not provided</p>
                                        )}
                                    </DetailCard>

                                    <DetailCard title="Visit prep">
                                        <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside">
                                            <li>Share your symptoms and goals to speed up intake.</li>
                                            <li>Confirm your preferred contact method and time windows.</li>
                                            <li>Have insurance details ready if applicable.</li>
                                        </ul>
                                    </DetailCard>

                                    <DetailCard title="What to expect">
                                        <div className="space-y-3">
                                            {journeySteps.map((step, idx) => (
                                                <div key={idx} className="flex gap-3">
                                                    <div className="mt-1 h-6 w-6 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold flex items-center justify-center">
                                                        {idx + 1}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-900">{step.title}</p>
                                                        <p className="text-sm text-slate-700">{step.desc}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </DetailCard>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-4 rounded-2xl bg-white/80 border border-white/60 shadow-sm backdrop-blur">
                                        <p className="text-sm text-slate-500 mb-2">Ready to book?</p>
                                        <button
                                            type="button"
                                            onClick={() => navigate('/request-provider', { state: { provider } })}
                                            className="w-full px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                        >
                                            Request appointment
                                        </button>
                                        <Link
                                            to="/search"
                                            className="mt-3 inline-flex justify-center w-full px-4 py-2 rounded-md bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200"
                                        >
                                            Back to search
                                        </Link>
                                    </div>

                                    <DetailCard title="At a glance">
                                        <div className="space-y-2 text-sm text-slate-700">
                                            <p><span className="font-semibold text-slate-900">Specialty: </span>{provider.specialty || 'Not specified'}</p>
                                            <p><span className="font-semibold text-slate-900">Affiliation: </span>{provider.is_affiliated ? 'Yes' : 'Not listed'}</p>
                                            <p><span className="font-semibold text-slate-900">Location: </span>{provider.location}</p>
                                        </div>
                                    </DetailCard>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function DetailCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="p-4 rounded-2xl border border-white/60 bg-white/80 shadow-sm backdrop-blur">
            <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">{title}</p>
            <div className="mt-2 text-sm text-slate-900">{children}</div>
        </div>
    )
}
