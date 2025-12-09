/**
 * LandingPage.tsx - Marketing landing page
 *
 * Public homepage highlighting MediData's value props, feature highlights, and calls to action for signup/login.
 */
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

type Theme = 'light' | 'dark'

/**
 * LandingPage - Homepage component
 * 
 * The main landing page that introduces MediData to visitors. Contains:
 * - Hero section: Main value proposition and call-to-action buttons
 * - Features section: Three key features of the platform
 * - How it works section: Step-by-step explanation of the service
 */
export default function LandingPage({ theme }: { theme: Theme }) {
  const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set())
  const nextSectionRef = useRef<HTMLDivElement | null>(null)
  const heroSlides = [
    {
      src: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
      alt: 'Friendly clinician smiling during telehealth',
      caption: 'Verified clinicians with up-to-date availability',
    },
    {
      src: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80',
      alt: 'Patient using a laptop to book care',
      caption: 'Book in minutes with matching based on your preferences',
    },
    {
      src: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1400&q=80',
      alt: 'Medical team collaborating on patient care',
      caption: 'Coordinated care with secure messaging',
    },
  ]
  const HERO_FALLBACK =
    'https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&w=1400&q=80'
  const [heroIndex, setHeroIndex] = useState(0)
  const storySlides = [
    {
      title: 'Preference-based matching',
      body: 'We rank by specialty fit, availability, and your preferences—not just proximity.',
      points: [
        'Verified profiles with status and location',
        'Shows who can see you sooner',
        'Transparent fit, not just distance',
      ],
      image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80', // calm lake sunrise
    },
    {
      title: 'Structured requests in minutes',
      body: 'One form captures contact preference, time windows, and reason so providers start with context.',
      points: [
        'Prevents back-and-forth and reduces no-shows',
        'Tracks status: pending, confirmed, or needs info',
        'Respects your preferred contact channel',
      ],
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80', // ocean horizon
    },
    {
      title: 'AI assist, human decisions',
      body: 'Describe symptoms and get a suggested specialty with prefilled search—no diagnoses, just guidance.',
      points: [
        'Safety-first prompts and clear disclaimers',
        'Prefills specialty and location when known',
        'Fallback to manual search if AI is unavailable',
      ],
      image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80', // forest trail
    },
    {
      title: 'Trust & safety by default',
      body: 'HIPAA-aware design, least-privilege access, session logging, and verified accounts keep data protected.',
      points: [
        'Audit trails and suspicious-login handling',
        'Email verification and role-aware access',
        'Encryption in transit and scoped permissions',
      ],
      image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80', // mountain lake
    },
    {
      title: 'Built for patients and providers',
      body: 'Patients get clarity and speed; providers get structured intake and fewer no-shows.',
      points: [
        'Clear journey from search to confirmed request',
        'Notifications so providers don’t miss patient outreach',
        'Better prep with the right info upfront',
      ],
      image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=80', // calm fields
    },
  ]
  const [storyIndex, setStoryIndex] = useState(0)

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal-id]'))
    const observer = new IntersectionObserver(
      (entries) => {
        setVisibleIds((prev) => {
          const next = new Set(prev)
          let changed = false
          for (const entry of entries) {
            const el = entry.target as HTMLElement
            const id = el.dataset.revealId
            if (!id) continue
            const ratio = entry.intersectionRatio
            if (ratio >= 0.12 && !next.has(id)) {
              next.add(id)
              changed = true
            }
          }
          return changed ? next : prev
        })
      },
      { threshold: [0, 0.12, 1], rootMargin: '-10% 0px -10% 0px' }
    )
    sections.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      setHeroIndex((i) => (i + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(id)
  }, [heroSlides.length])

  useEffect(() => {
    const id = setInterval(() => {
      setStoryIndex((i) => (i + 1) % storySlides.length)
    }, 5000)
    return () => clearInterval(id)
  }, [storySlides.length])

  return (
    <div className="min-h-screen page-surface">
      <div
        data-reveal-id="hero"
        className={`reveal ${visibleIds.has('hero') ? 'visible' : ''}`}
      >
        {/* Hero Section - Main headline and primary CTAs */}
        <section className="relative overflow-hidden page-surface text-slate-900 min-h-[85vh] flex items-center">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-sky-300/30 blur-[120px] animate-liquid-drift" />
            <div className="absolute right-0 top-10 h-[26rem] w-[26rem] rounded-full bg-blue-300/25 blur-[140px] animate-liquid-glow" />
            <div className="absolute left-1/3 bottom-0 h-[22rem] w-[22rem] rounded-full bg-cyan-300/25 blur-[120px] animate-liquid-drift-slow" />
          </div>

          <div className="relative mx-auto max-w-6xl px-6 py-6 md:py-8 text-slate-900 w-full h-full flex items-center">
            <div className="grid md:grid-cols-2 gap-10 items-center w-full">
              <div className="space-y-4 landing-plain">
                <div
                  className={`landing-ribbon inline-flex items-center gap-3 rounded-full border px-3 py-1 text-xs font-medium backdrop-blur shadow-sm ${theme === 'dark'
                    ? 'border-slate-700/60 bg-slate-900/80 text-slate-100'
                    : 'border-white/60 bg-white/70 text-slate-700'
                    }`}
                >
                  <span className="ribbon-dot h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(16,185,129,0.18)] dark:shadow-[0_0_0_6px_rgba(16,185,129,0.28)]" />
                  <span className="dark:text-slate-100">Smart matching, real outcomes</span>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white shadow hover:shadow-md hover:-translate-y-[1px] transition dark:bg-white dark:text-slate-900"
                  >
                    Create account
                    <span aria-hidden="true" className="text-[12px]">↗</span>
                  </Link>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Find the right provider, fast.
                </h1>
                <p className="text-lg text-slate-700 dark:text-slate-200">
                  MediData matches you to verified clinicians based on your symptoms, preferences, location, and real outcomes—so you spend minutes, not weeks, getting care.
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  HIPAA-conscious by design, with secure messaging and transparent provider profiles.
                </p>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center rounded-full border border-white/80 bg-slate-900 text-white px-5 py-3 text-sm font-semibold shadow-sm hover:border-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-700 focus:ring-offset-2 focus:ring-offset-white"
                  >
                    Get started
                  </Link>
                  <Link
                    to="/login"
                    className="landing-account-link inline-flex items-center justify-center rounded-full border border-white/80 px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-white/70 hover:border-white focus:outline-none focus:ring-2 focus:ring-slate-700 focus:ring-offset-2 focus:ring-offset-white dark:text-white dark:border-slate-500 dark:hover:bg-slate-800"
                  >
                    I already have an account
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-slate-800/90 landing-plain-exempt">
                  <div className="landing-metric rounded-2xl bg-white/70 p-4 backdrop-blur border border-white/60 shadow-sm">
                    <p className="font-semibold text-slate-900">92% faster</p>
                    <p>to schedule compared to phone calls and fragmented portals.</p>
                  </div>
                  <div className="landing-metric rounded-2xl bg-white/70 p-4 backdrop-blur border border-white/60 shadow-sm">
                    <p className="font-semibold text-slate-900">User-focused</p>
                    <p>Shows providers that match your specific needs and preferences.</p>
                  </div>
                </div>
              </div>

              <div className="md:pl-6">
                <div className="hero-frame relative aspect-4/3 w-full overflow-hidden rounded-2xl border border-white/80 bg-white/90 backdrop-blur-xl shadow-2xl shadow-slate-300/50">
                  {heroSlides.map((slide, idx) => (
                    <img
                      key={slide.src}
                      src={slide.src}
                      alt={slide.alt}
                      onError={(e) => {
                        if (e.currentTarget.src !== HERO_FALLBACK) {
                          e.currentTarget.src = HERO_FALLBACK
                        }
                      }}
                      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${idx === heroIndex ? 'opacity-100' : 'opacity-0'}`}
                      loading="lazy"
                    />
                  ))}

                  <div className="hero-caption absolute bottom-0 left-0 right-0 bg-white/90 text-slate-900 text-sm px-4 py-3 pb-4 backdrop-blur-sm border-t border-white/70">
                    {heroSlides[heroIndex]?.caption}
                  </div>



                </div>
              </div>
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-8 flex justify-center">
            <button
              type="button"
              onClick={() => nextSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex flex-col items-center gap-1 text-slate-800/80 hover:text-slate-900 dark:text-white dark:hover:text-white"
            >
              <span className="hero-scroll-btn h-10 w-10 rounded-full border border-slate-300/80 bg-white/70 backdrop-blur flex items-center justify-center shadow-sm animate-bounce-slow dark:border-slate-700 dark:bg-slate-900/90 dark:text-white">
                ↓
              </span>
              <span className="explore-more-text text-xs font-semibold tracking-wide uppercase text-slate-800/90">Explore more</span>
            </button>
          </div>
        </section>
      </div>

      <div
        data-reveal-id="value"
        ref={nextSectionRef}
        className={`reveal ${visibleIds.has('value') ? 'visible' : ''}`}
      >
        <section className="relative overflow-hidden page-surface border-t border-b border-slate-200/60 backdrop-blur min-h-[65vh] flex items-center py-8 md:py-10">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-20 -top-16 h-[26rem] w-[26rem] rounded-full bg-sky-300/30 blur-[120px]" />
            <div className="absolute right-[-18rem] top-10 h-[24rem] w-[24rem] rounded-full bg-blue-300/25 blur-[140px]" />
            <div className="absolute left-1/3 bottom-[-10rem] h-[24rem] w-[24rem] rounded-full bg-cyan-300/25 blur-[120px]" />
          </div>
          <div className="relative mx-auto max-w-6xl px-6 py-8 md:py-10 grid md:grid-cols-2 gap-10 items-center w-full">
            <div className="space-y-3 z-10 landing-plain">
              <h3 className="text-3xl md:text-4xl font-semibold text-slate-900 dark:text-white">
                {storySlides[storyIndex].title}
              </h3>
              <p className="text-base md:text-lg text-slate-600 leading-relaxed dark:text-slate-200">
                {storySlides[storyIndex].body}
              </p>
              <ul className="space-y-2 text-sm md:text-base text-slate-600 leading-relaxed dark:text-slate-200">
                {storySlides[storyIndex].points.map((pt, idx) => (
                  <li key={idx}>• {pt}</li>
                ))}
              </ul>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/70 shadow-lg backdrop-blur min-h-[320px] md:min-h-[360px] aspect-[4/3] z-10">
              {storySlides.map((slide, idx) => (
                <img
                  key={slide.image}
                  src={slide.image}
                  alt={slide.title}
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${idx === storyIndex ? 'opacity-100' : 'opacity-0'}`}
                  loading="lazy"
                />
              ))}
            </div>
          </div>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-4">
            <button
              type="button"
              onClick={() => setStoryIndex((i) => (i - 1 + storySlides.length) % storySlides.length)}
              className="pointer-events-auto h-12 w-12 rounded-full border border-slate-300 bg-white/90 text-slate-700 text-lg shadow hover:bg-white focus:outline-none focus:ring-2 focus:ring-slate-500 hero-slider-btn"
              aria-label="Previous highlight"
            >
              &lt;
            </button>
            <button
              type="button"
              onClick={() => setStoryIndex((i) => (i + 1) % storySlides.length)}
              className="pointer-events-auto h-12 w-12 rounded-full border border-slate-300 bg-white/90 text-slate-700 text-lg shadow hover:bg-white focus:outline-none focus:ring-2 focus:ring-slate-500 hero-slider-btn"
              aria-label="Next highlight"
            >
              &gt;
            </button>
          </div>
          <div className="absolute inset-x-0 bottom-10 flex justify-center gap-2">
            {storySlides.map((_, idx) => (
              <span
                key={idx}
                className={`h-2.5 w-2.5 rounded-full border border-slate-400 ${idx === storyIndex ? 'bg-slate-700' : 'bg-slate-200'}`}
              />
            ))}
          </div>
        </section>
      </div>

      <div
        data-reveal-id="guide"
        className={`reveal ${visibleIds.has('guide') ? 'visible' : ''}`}
      >
        <section className="relative overflow-hidden page-surface border-t border-b border-slate-200/60 backdrop-blur min-h-[65vh] flex items-center py-8 md:py-10">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-16 top-[-10rem] h-[24rem] w-[24rem] rounded-full bg-sky-300/30 blur-[120px]" />
            <div className="absolute right-[-14rem] top-0 h-[22rem] w-[22rem] rounded-full bg-blue-300/25 blur-[130px]" />
            <div className="absolute left-1/2 bottom-[-12rem] h-[24rem] w-[24rem] rounded-full bg-cyan-300/25 blur-[120px]" />
          </div>
          <div className="relative mx-auto max-w-6xl px-6 py-8 md:py-10 w-full grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-5 z-10 landing-plain">
              <h3 className="text-4xl md:text-5xl font-semibold text-slate-900 dark:text-white">How to use MediData</h3>
              <p className="text-base md:text-lg text-slate-600 leading-relaxed dark:text-slate-200">
                From sign-in to booking and tracking, here’s the quick path to get care fast with verified providers.
              </p>
              <ol className="landing-guide-list space-y-3 text-base md:text-lg text-slate-700 leading-relaxed list-decimal list-inside dark:text-slate-200">
                <li><span className="font-semibold text-slate-900 dark:text-white">Sign up / Log in:</span> Create or log into your account; verify your email if prompted.</li>
                <li><span className="font-semibold text-slate-900 dark:text-white">Search smart:</span> Filter by specialty, location, and availability; refine as needed.</li>
                <li><span className="font-semibold text-slate-900 dark:text-white">View details:</span> Open a provider to see profile, status, and contact options.</li>
                <li><span className="font-semibold text-slate-900 dark:text-white">Request appointment:</span> Choose contact preference, time windows, and reason—submit in one step.</li>
                <li><span className="font-semibold text-slate-900 dark:text-white">Track status:</span> See pending, confirmed, or needs-info states; respond if more info is requested.</li>
                <li><span className="font-semibold text-slate-900 dark:text-white">Stay notified:</span> Watch for emails/alerts so you never miss a provider response.</li>
              </ol>
            </div>
            <div className="landing-guide-card relative overflow-hidden rounded-2xl border border-slate-200 bg-white/75 backdrop-blur shadow-lg min-h-[320px] md:min-h-[380px] aspect-[4/3] z-10">
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-sky-100/40 to-blue-100/30" />
              <div className="relative p-7 space-y-5 text-slate-800 dark:text-white">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(16,185,129,0.18)]" />
                  <p className="text-base md:text-lg font-semibold text-slate-900 dark:text-white">Guided flow</p>
                </div>
                <p className="text-base md:text-lg leading-relaxed text-slate-700 dark:text-white">
                  Search, view details, request, and track within two screens. Safety prompts and verification keep data protected.
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm md:text-base">
                  <div className="landing-guide-feature rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                    <p className="font-semibold text-slate-900 dark:text-white">AI assist</p>
                    <p className="text-slate-600 dark:text-white">Prefill specialty/location when you describe symptoms.</p>
                  </div>
                  <div className="landing-guide-feature rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                    <p className="font-semibold text-slate-900 dark:text-white">Transparent status</p>
                    <p className="text-slate-600 dark:text-white">Pending → Confirmed/Needs info with alerts.</p>
                  </div>
                </div>
                <div className="flex gap-2 text-xs md:text-sm">
                  <span className="landing-guide-badge px-3 py-1 rounded-full bg-slate-900 text-white">Secure</span>
                  <span className="landing-guide-badge px-3 py-1 rounded-full bg-blue-100 text-blue-800">Fast</span>
                  <span className="landing-guide-badge px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">Guided</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>


    </div>
  )
}

