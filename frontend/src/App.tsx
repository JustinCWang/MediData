/**
 * App.tsx - Main Application Component
 * 
 * This is the root component of the MediData frontend application. It handles:
 * - Client-side routing using React Router (landing, login, registration pages)
 * - Shared layout components (header and footer)
 * - Page components for each route
 * - Chatbot component that appears on all pages
 * 
 * Routes:
 *   - "/" - Landing page with hero, features, and how-it-works sections
 *   - "/login" - User authentication/login page
 *   - "/register" - New user registration page
 *   - "/search" - Provider search page
 *   - "/requests" - Requests page to view all requests
 *   - "/request-provider" - Page to request a provider
 */

import { Link, NavLink, Route, Routes, useNavigate, Navigate, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import Chatbot from './components/Chatbot'
import AuthBackground from './components/AuthBackground'
import SearchPage from './pages/SearchPage'
import RequestsPage from './pages/RequestsPage'
import RequestProviderPage from './pages/RequestProviderPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import ProviderDetailsPage from './pages/ProviderDetailsPage'
import React from 'react'

/**
 * ProtectedRoute - Route wrapper that requires authentication
 * 
 * Redirects to login page if user is not authenticated.
 */
function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('access_token')
      setIsAuthenticated(!!token)
    }

    checkAuth()
    window.addEventListener('auth-change', checkAuth)
    window.addEventListener('storage', checkAuth)

    return () => {
      window.removeEventListener('auth-change', checkAuth)
      window.removeEventListener('storage', checkAuth)
    }
  }, [])

  if (isAuthenticated === null) {
    // Still checking auth status
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />
}

/**
 * GuestRoute - Route wrapper for guest-only pages (landing, login, register)
 * 
 * Redirects to dashboard if user is already authenticated.
 */
function GuestRoute({ children }: { children: React.ReactElement }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('access_token')
      setIsAuthenticated(!!token)
    }

    checkAuth()
    window.addEventListener('auth-change', checkAuth)
    window.addEventListener('storage', checkAuth)

    return () => {
      window.removeEventListener('auth-change', checkAuth)
      window.removeEventListener('storage', checkAuth)
    }
  }, [])

  if (isAuthenticated === null) {
    // Still checking auth status
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children
}

/**
 * App - Root component that sets up routing and shared layout
 * 
 * Wraps all routes with a consistent header and footer. Uses React Router's
 * Routes component to handle client-side navigation between pages.
 */
type Theme = 'light' | 'dark'

export default function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light'
    const stored = localStorage.getItem('theme') as Theme | null
    if (stored === 'light' || stored === 'dark') return stored
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    return prefersDark ? 'dark' : 'light'
  })

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'))

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors">
      <AppHeader theme={theme} onToggleTheme={toggleTheme} />
      <main>
        <Routes>
          <Route path="/" element={<GuestRoute><LandingPage /></GuestRoute>} />
          <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
          <Route path="/reset-password" element={<GuestRoute><ResetPasswordPage /></GuestRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
          <Route path="/requests" element={<ProtectedRoute><RequestsPage /></ProtectedRoute>} />
          <Route path="/request-provider" element={<ProtectedRoute><RequestProviderPage /></ProtectedRoute>} />
          <Route path="/providers/:id" element={<ProtectedRoute><ProviderDetailsPage /></ProtectedRoute>} />
        </Routes>
      </main>
      <AppFooter />
      <Chatbot />
    </div>
  )
}

/**
 * AppHeader - Shared navigation header component
 * 
 * Displays the MediData logo, navigation links, and action buttons.
 * Shows Login/Get Started when logged out, Logout when logged in.
 * Sticky header that stays visible when scrolling. Uses NavLink for active state styling.
 */
interface User {
  id: string
  email: string
  user_metadata?: {
    first_name?: string
    last_name?: string
    full_name?: string
  }
}

function AppHeader({ theme, onToggleTheme }: { theme: Theme; onToggleTheme: () => void }) {
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [openDrop, setOpenDrop] = useState(false)
  const [avatar, setAvatar] = useState<string | null>(null)

  const avatarKeyForUser = (u: User | null) => {
    if (!u) return null
    const email = (u as any)?.email || (u as any)?.user_metadata?.email
    if (email) return `avatar_${email}`
    if (u.id) return `avatar_${u.id}`
    return null
  }

  // Check authentication status on mount and when localStorage changes
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('access_token')
      const userData = localStorage.getItem('user')
      const parsed = userData ? JSON.parse(userData) : null
      setIsAuthenticated(!!token)
      setUser(parsed)
      const key = avatarKeyForUser(parsed)
      const storedAvatar = key ? localStorage.getItem(key) : null
      setAvatar(storedAvatar || parsed?.avatar || parsed?.user_metadata?.avatar || null)
    }

    checkAuth()
    
    // Listen for storage changes (e.g., login/logout in another tab)
    window.addEventListener('storage', checkAuth)
    window.addEventListener('avatar-change', checkAuth)
    
    // Custom event for same-tab auth changes
    window.addEventListener('auth-change', checkAuth)
    
    return () => {
      window.removeEventListener('storage', checkAuth)
      window.removeEventListener('avatar-change', checkAuth)
      window.removeEventListener('auth-change', checkAuth)
    }
  }, [])

  const handleLogout = () => {
    const key = avatarKeyForUser(user)
    if (key) {
      localStorage.removeItem(key)
    }
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    setUser(null)
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('auth-change'))
    navigate('/')
  }

  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
    }
    if (user?.user_metadata?.first_name) {
      return user.user_metadata.first_name
    }
    if (user?.email) {
      return user.email.split('@')[0]
    }
    return 'User'
  }

  return (
    <header className={`sticky top-0 z-30 border-b bg-white/75 backdrop-blur-xl shadow-sm relative transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${openDrop ? 'translate-y-2 bg-slate-950/95 border-slate-800' : 'border-white/40'}`}>
      <div className={`mx-auto max-w-6xl px-6 py-3 flex items-center justify-between transition-all duration-500 ${openDrop ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'}`}>
        <Link to={isAuthenticated ? "/dashboard" : "/"} className="inline-flex items-center gap-2">
          <span className={`text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-600 via-blue-600 to-emerald-500 ${openDrop ? 'from-white via-white to-white' : ''}`}>
            MediData
          </span>
        </Link>
        <nav className={`hidden md:flex items-center gap-2 text-sm transition-colors duration-500 ${openDrop ? 'text-white' : ''}`}>
          {isAuthenticated ? (
            <>
              {[
                { to: '/dashboard', label: 'Dashboard' },
                { to: '/search', label: 'Search' },
                { to: '/requests', label: 'Requests' },
                { to: '/request-provider', label: 'Request Provider' },
                { to: '/profile', label: 'Profile' },
              ].map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-full transition-colors ${
                      isActive
                        ? `bg-white/70 text-slate-900 shadow-sm border border-white/70 ${openDrop ? 'bg-white/20 text-white border-white/30' : ''}`
                        : `text-slate-600 hover:text-slate-800 hover:bg-white/50 ${openDrop ? 'text-slate-200 hover:bg-white/10' : ''}`
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </>
          ) : (
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `px-3 py-2 rounded-full transition-colors ${
                  isActive
                    ? `bg-white/70 text-slate-900 shadow-sm border border-white/70 ${openDrop ? 'bg-white/20 text-white border-white/30' : ''}`
                    : `text-slate-600 hover:text-slate-800 hover:bg-white/50 ${openDrop ? 'text-slate-200 hover:bg-white/10' : ''}`
                }`
              }
            >
              Home
            </NavLink>
          )}
        </nav>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className={`hidden sm:inline text-sm text-slate-600 bg-white/60 px-3 py-1 rounded-full border border-white/70 backdrop-blur ${openDrop ? 'text-white bg-white/10 border-white/30' : ''} flex items-center gap-2`}>
                <span className="h-7 w-7 rounded-full overflow-hidden bg-gradient-to-br from-sky-500 via-blue-500 to-emerald-400 flex items-center justify-center text-white text-xs font-semibold">
                  {avatar ? <img src={avatar} alt="avatar" className="h-full w-full object-cover" /> : (getUserDisplayName().charAt(0).toUpperCase())}
                </span>
                {getUserDisplayName()}
              </span>
              <button
                onClick={handleLogout}
                className={`inline-flex items-center rounded-full border border-white/80 bg-slate-900 text-white px-4 py-2 text-sm font-semibold shadow-sm hover:shadow-md hover:-translate-y-[1px] transition focus:outline-none focus:ring-2 focus:ring-slate-700 focus:ring-offset-2 focus:ring-offset-white ${openDrop ? 'bg-white text-slate-900' : ''}`}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`hidden sm:inline-flex items-center rounded-full border border-white/80 bg-white/70 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-white hover:shadow-sm ${openDrop ? 'bg-white/10 text-white border-white/30' : ''}`}
              >
                Log in
              </Link>
              <Link
                to="/register"
                className={`inline-flex items-center rounded-full bg-gradient-to-r from-sky-600 via-blue-600 to-emerald-500 px-4 py-2 text-white text-sm font-semibold shadow-sm hover:shadow-md hover:-translate-y-[1px] transition focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2 focus:ring-offset-white ${openDrop ? 'from-white via-white to-white text-slate-900' : ''}`}
              >
                Get started
              </Link>
            </>
          )}
          <button
            onClick={onToggleTheme}
            className={`ml-2 inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-semibold transition ${openDrop ? 'border-white/40 bg-white/10 text-white hover:bg-white/15' : 'border-slate-200 bg-white/70 text-slate-800 hover:bg-white hover:shadow-sm'}`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
          <button
            onClick={() => setOpenDrop((v) => !v)}
            className={`ml-3 inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-semibold transition ${openDrop ? 'border-white/40 bg-white/10 text-white hover:bg-white/15' : 'border-slate-200 bg-white/70 text-slate-800 hover:bg-white hover:shadow-sm'}`}
            aria-expanded={openDrop}
            aria-label="Toggle header panel"
          >
            {openDrop ? 'Close' : 'About'}
          </button>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0">
        <div className="px-0">
          <div className={`relative w-screen max-h-0 ${openDrop ? 'max-h-[45vh] opacity-100' : 'opacity-0'} translate-y-0 transition-[max-height,opacity,transform] duration-900 ease-[cubic-bezier(0.18,0.9,0.2,1)] pointer-events-auto rounded-b-3xl bg-gradient-to-b from-black/75 via-black/60 to-black/70 border border-white/10 shadow-[0_28px_80px_-30px_rgba(0,0,0,0.65)] backdrop-blur-2xl overflow-hidden z-10`}>
            <button
              onClick={() => setOpenDrop(false)}
              className="absolute top-4 right-6 inline-flex items-center rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-sm font-semibold text-white hover:bg-white/15 transition"
            >
              Close ✕
            </button>
            <div className="h-1 w-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            <div className="px-8 md:px-12 py-8 md:py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-3 max-w-2xl text-white">
                <p className="text-lg font-semibold">A calmer way to get care</p>
                <p className="text-sm text-slate-200 leading-relaxed">
                  MediData connects you to verified providers, gathers the context they need, and keeps every request traceable—so booking feels smooth and safe.
                </p>
                <div className="flex items-center gap-2 text-slate-200 text-sm">
                  <span className="text-base">↘</span>
                  <span>Start by creating your profile or log in to continue.</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to="/register"
                  className="inline-flex items-center rounded-full bg-white text-slate-900 px-4 py-2 text-sm font-semibold shadow-sm hover:shadow-md hover:-translate-y-[1px] transition focus:outline-none focus:ring-2 focus:ring-white/60 focus:ring-offset-2 focus:ring-offset-slate-900"
                >
                  Get started
                  <span className="ml-2 text-base">↗</span>
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center rounded-full border border-white/40 bg-white/10 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/15 hover:shadow-sm"
                >
                  Log in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

/**
 * AppFooter - Shared footer component
 * 
 * Displays copyright information and footer links (Privacy, Terms, Support).
 * Appears at the bottom of all pages.
 */
function AppFooter() {
  return (
    <footer id="contact" className="border-t border-slate-200">
      <div className="mx-auto max-w-6xl px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-600">
        <p>© {new Date().getFullYear()} MediData. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-slate-800">
            Privacy
          </a>
          <a href="#" className="hover:text-slate-800">
            Terms
          </a>
          <a href="#" className="hover:text-slate-800">
            Support
          </a>
        </div>
      </div>
    </footer>
  )
}

/**
 * LandingPage - Homepage component
 * 
 * The main landing page that introduces MediData to visitors. Contains:
 * - Hero section: Main value proposition and call-to-action buttons
 * - Features section: Three key features of the platform
 * - How it works section: Step-by-step explanation of the service
 */
function LandingPage() {
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
      caption: 'Book in minutes with insurance-aware matching',
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
      title: 'Outcome-aware matching',
      body: 'We rank by specialty fit, availability, insurance, and observed outcomes—not just proximity.',
      points: [
        'Verified profiles with status, insurance, and location',
        'Shows who can see you sooner and accepts your plan',
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
        'Prefills specialty and location/insurance when known',
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
      <section className="relative overflow-hidden page-surface text-slate-900 min-h-screen flex items-center">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-sky-300/30 blur-[120px] animate-liquid-drift" />
          <div className="absolute right-0 top-10 h-[26rem] w-[26rem] rounded-full bg-blue-300/25 blur-[140px] animate-liquid-glow" />
          <div className="absolute left-1/3 bottom-0 h-[22rem] w-[22rem] rounded-full bg-cyan-300/25 blur-[120px] animate-liquid-drift-slow" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 py-10 md:py-12 text-slate-900 w-full h-full flex items-center">
          <div className="grid md:grid-cols-2 gap-10 items-center w-full">
            <div className="space-y-4 landing-plain">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-slate-700 backdrop-blur shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(16,185,129,0.18)]" />
                Smart matching, real outcomes
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
                Find the right provider, fast.
              </h1>
              <p className="text-lg text-slate-700">
                MediData matches you to verified clinicians based on your symptoms, insurance, location, and real outcomes—so you spend minutes, not weeks, getting care.
              </p>
              <p className="text-sm text-slate-500">
                HIPAA-conscious by design, with secure messaging and transparent provider profiles.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-full bg-slate-900 text-white px-5 py-3 text-sm font-semibold shadow-lg shadow-slate-900/15 hover:shadow-slate-900/25 focus:outline-none focus:ring-2 focus:ring-slate-700 focus:ring-offset-2 focus:ring-offset-white"
                >
                  Get started
                </Link>
                <Link
                  to="/login"
                  className="landing-account-link inline-flex items-center justify-center rounded-full border border-slate-300/70 px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-white/70 focus:outline-none focus:ring-2 focus:ring-slate-700 focus:ring-offset-2 focus:ring-offset-white"
                >
                  I already have an account
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm text-slate-800/90 landing-plain-exempt">
                <div className="rounded-2xl bg-white/70 p-4 backdrop-blur border border-white/60 shadow-sm">
                  <p className="font-semibold text-slate-900">92% faster</p>
                  <p>to schedule compared to phone calls and fragmented portals.</p>
                </div>
                <div className="rounded-2xl bg-white/70 p-4 backdrop-blur border border-white/60 shadow-sm">
                  <p className="font-semibold text-slate-900">Insurance-aware</p>
                  <p>Only shows providers who can accept your plan and network.</p>
                </div>
              </div>
            </div>

            <div className="md:pl-6">
              <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl shadow-2xl shadow-slate-300/40">
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

                <div className="absolute bottom-0 left-0 right-0 bg-white/70 text-slate-900 text-sm px-4 py-3 pb-4 backdrop-blur-sm border-t border-white/50">
                  {heroSlides[heroIndex]?.caption}
                </div>

                <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between px-3">
                  <button
                    type="button"
                    onClick={() => setHeroIndex((i) => (i - 1 + heroSlides.length) % heroSlides.length)}
                    className="h-9 w-9 rounded-full bg-white/85 text-slate-800 shadow hover:bg-white focus:outline-none focus:ring-2 focus:ring-slate-500"
                    aria-label="Previous slide"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeroIndex((i) => (i + 1) % heroSlides.length)}
                    className="h-9 w-9 rounded-full bg-white/85 text-slate-800 shadow hover:bg-white focus:outline-none focus:ring-2 focus:ring-slate-500"
                    aria-label="Next slide"
                  >
                    ›
                  </button>
                </div>

                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-2">
                  {heroSlides.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setHeroIndex(idx)}
                      className={`h-2.5 w-2.5 rounded-full border border-slate-400/80 ${idx === heroIndex ? 'bg-slate-700' : 'bg-slate-200'}`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
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
            <span className="h-10 w-10 rounded-full border border-slate-300/80 bg-white/70 backdrop-blur flex items-center justify-center shadow-sm animate-bounce-slow dark:border-white/70 dark:bg-white/20 dark:text-white">
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
      <section className="relative overflow-hidden page-surface border-t border-b border-slate-200/60 backdrop-blur min-h-screen flex items-center pb-16 md:pb-20">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-20 -top-16 h-[26rem] w-[26rem] rounded-full bg-sky-300/30 blur-[120px]" />
            <div className="absolute right-[-18rem] top-10 h-[24rem] w-[24rem] rounded-full bg-blue-300/25 blur-[140px]" />
            <div className="absolute left-1/3 bottom-[-10rem] h-[24rem] w-[24rem] rounded-full bg-cyan-300/25 blur-[120px]" />
          </div>
          <div className="relative mx-auto max-w-6xl px-6 py-10 md:py-12 grid md:grid-cols-2 gap-8 items-center w-full">
            <div className="space-y-3 z-10 landing-plain">
              <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">
                {storySlides[storyIndex].title}
              </h3>
              <p className="text-slate-600 leading-relaxed dark:text-slate-200">
                {storySlides[storyIndex].body}
              </p>
              <ul className="space-y-2 text-sm text-slate-600 leading-relaxed dark:text-slate-200">
                {storySlides[storyIndex].points.map((pt, idx) => (
                  <li key={idx}>• {pt}</li>
                ))}
              </ul>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/70 shadow-lg backdrop-blur min-h-[280px] z-10">
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
              className="pointer-events-auto h-10 w-10 rounded-full border border-slate-300 bg-white/80 text-slate-700 shadow hover:bg-white focus:outline-none focus:ring-2 focus:ring-slate-500"
              aria-label="Previous highlight"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => setStoryIndex((i) => (i + 1) % storySlides.length)}
              className="pointer-events-auto h-10 w-10 rounded-full border border-slate-300 bg-white/80 text-slate-700 shadow hover:bg-white focus:outline-none focus:ring-2 focus:ring-slate-500"
              aria-label="Next highlight"
            >
              ›
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
        <section className="relative overflow-hidden page-surface border-t border-b border-slate-200/60 backdrop-blur min-h-screen flex items-center pb-16 md:pb-20">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-16 top-[-10rem] h-[24rem] w-[24rem] rounded-full bg-sky-300/30 blur-[120px]" />
            <div className="absolute right-[-14rem] top-0 h-[22rem] w-[22rem] rounded-full bg-blue-300/25 blur-[130px]" />
            <div className="absolute left-1/2 bottom-[-12rem] h-[24rem] w-[24rem] rounded-full bg-cyan-300/25 blur-[120px]" />
          </div>
          <div className="relative mx-auto max-w-6xl px-6 py-10 md:py-12 w-full grid md:grid-cols-2 gap-10 items-center">
            <div className="space-y-4 z-10 landing-plain">
              <h3 className="text-3xl font-semibold text-slate-900 dark:text-white">How to use MediData</h3>
              <p className="text-slate-600 leading-relaxed dark:text-slate-200">
                From sign-in to booking and tracking, here’s the quick path to get care fast with verified providers.
              </p>
              <ol className="landing-guide-list space-y-3 text-sm text-slate-700 leading-relaxed list-decimal list-inside">
                <li><span className="font-semibold text-slate-900">Sign up / Log in:</span> Create or log into your account; verify your email if prompted.</li>
                <li><span className="font-semibold text-slate-900">Search smart:</span> Filter by specialty, location, insurance, and availability; refine as needed.</li>
                <li><span className="font-semibold text-slate-900">View details:</span> Open a provider to see profile, status, insurance, and contact options.</li>
                <li><span className="font-semibold text-slate-900">Request appointment:</span> Choose contact preference, time windows, and reason—submit in one step.</li>
                <li><span className="font-semibold text-slate-900">Track status:</span> See pending, confirmed, or needs-info states; respond if more info is requested.</li>
                <li><span className="font-semibold text-slate-900">Stay notified:</span> Watch for emails/alerts so you never miss a provider response.</li>
              </ol>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/75 backdrop-blur shadow-lg min-h-[260px] z-10">
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-sky-100/40 to-blue-100/30" />
              <div className="relative p-6 space-y-4 text-slate-800">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(16,185,129,0.18)]" />
                  <p className="text-sm font-semibold text-slate-900">Guided flow</p>
                </div>
                <p className="text-sm leading-relaxed">
                  Search, view details, request, and track within two screens. Safety prompts and verification keep data protected.
                </p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl border border-slate-200 bg-white/80 p-3 shadow-sm">
                    <p className="font-semibold text-slate-900">AI assist</p>
                    <p className="text-slate-600">Prefill specialty/location when you describe symptoms.</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white/80 p-3 shadow-sm">
                    <p className="font-semibold text-slate-900">Transparent status</p>
                    <p className="text-slate-600">Pending → Confirmed/Needs info with alerts.</p>
                  </div>
                </div>
                <div className="flex gap-2 text-xs">
                  <span className="px-3 py-1 rounded-full bg-slate-900 text-white">Secure</span>
                  <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800">Fast</span>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">Guided</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

/**
 * LoginPage - User authentication/login page
 * 
 * Displays a login form with email and password fields. Handles form submission
 * by sending credentials to FastAPI backend (/api/auth/login), which authenticates
 * with Supabase. On success, stores the access token in localStorage and redirects
 * to the home page. Displays error messages if authentication fails.
 * 
 * Uses AuthBackground component for consistent styling with registration page.
 */
function LoginPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [email, setEmail] = useState<string>('')
  const [showResendVerification, setShowResendVerification] = useState(false)

  /**
   * handleSubmit - Handles login form submission
   * 
   * Sends login credentials to FastAPI backend, which authenticates with Supabase.
   * On success, stores the access token and redirects to home page.
   * On error, displays error message to user.
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setError(null)
    setInfo(null)
    setShowResendVerification(false)

    const formData = new FormData(event.currentTarget)
    const submittedEmail = formData.get('email') as string
    const password = formData.get('password') as string

    // Keep local email state in sync so auxiliary actions (resend/forgot) can reuse it
    setEmail(submittedEmail)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: submittedEmail, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        // If backend indicates unverified email, show a tailored message and resend option
        if (response.status === 403 && typeof data.detail === 'string' && data.detail.toLowerCase().includes('email not verified')) {
          setShowResendVerification(true)
        }
        throw new Error(data.detail || 'Login failed. Please try again.')
      }

      // Store access token in localStorage (you may want to use httpOnly cookies in production)
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token)
        localStorage.setItem('user', JSON.stringify(data.user))
        // Dispatch custom event to notify header of auth change
        window.dispatchEvent(new Event('auth-change'))
      }

      // Redirect to dashboard on success
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * handleResendVerification - Requests a new email verification link for the current email.
   */
  const handleResendVerification = async () => {
    if (!email) {
      setError('Enter your email above before requesting a new verification link.')
      return
    }

    setIsLoading(true)
    setError(null)
    setInfo(null)
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to resend verification email. Please try again.')
      }

      setInfo(
        data.message ||
          'If an account with this email exists and is unverified, a new verification email has been sent.'
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred while resending verification.')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * handleForgotPassword - Initiates a password reset email for the current email.
   */
  const handleForgotPassword = async () => {
    if (!email) {
      setError('Enter your email above before requesting a password reset.')
      return
    }

    setIsLoading(true)
    setError(null)
    setInfo(null)
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to start password reset. Please try again.')
      }

      setInfo(
        data.message ||
          'If an account with this email exists, a password reset email has been sent.'
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred while resetting password.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="page-surface relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute left-[-8rem] top-[-6rem] h-[26rem] w-[26rem] rounded-full bg-sky-300/80 blur-[90px] animate-light-wander-a" />
        <div className="absolute right-[-10rem] top-0 h-[20rem] w-[20rem] rounded-full bg-blue-300/75 blur-[80px] animate-light-wander-b" />
        <div className="absolute left-[15%] bottom-[-6rem] h-[18rem] w-[18rem] rounded-full bg-cyan-300/70 blur-[70px] animate-light-wander-c" />
        <div className="absolute right-[12%] bottom-[-4rem] h-[22rem] w-[22rem] rounded-full bg-emerald-300/75 blur-[90px] animate-light-wander-d" />
        <div className="absolute left-[55%] top-[10%] h-[16rem] w-[16rem] rounded-full bg-teal-300/70 blur-[60px] animate-light-wander-e" />
        <div className="absolute right-[40%] bottom-[8%] h-[14rem] w-[14rem] rounded-full bg-sky-200/80 blur-[55px] animate-light-wander-f" />
      </div>
      <div className="relative z-10 w-full flex flex-col items-center">
        <div className="w-full max-w-md rounded-2xl bg-white/80 shadow-xl backdrop-blur px-8 py-10 border border-white/70">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-[#d6c7ff]">Log in to MediData</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-[#bfa8ff]">
              Access your dashboard, requests, and saved providers.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
            {info && (
              <div className="rounded-md bg-green-50 border border-green-200 p-3">
                <p className="text-sm text-green-800">{info}</p>
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm text-slate-900 dark:text-black focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                disabled={isLoading}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm text-slate-900 dark:text-black focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                placeholder="••••••••"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={isLoading}
                className="text-blue-600 hover:text-blue-700 font-medium disabled:text-blue-400 disabled:cursor-not-allowed"
              >
                Forgot your password?
              </button>
              {showResendVerification && (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={isLoading}
                  className="text-blue-600 hover:text-blue-700 font-medium disabled:text-blue-400 disabled:cursor-not-allowed"
                >
                  Resend verification email
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Logging in...' : 'Log in'}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

/**
 * RegisterPage - New user registration page with role selection
 * 
 * Multi-step registration process:
 * 1. Role selection (Patient or Provider)
 * 2. Basic account info (email, password)
 * 3. Role-specific profile information
 * 
 * Creates user account in Supabase Auth and corresponding entry in Patients/Providers table.
 */
function RegisterPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<'role' | 'account' | 'profile'>('role')
  const [role, setRole] = useState<'patient' | 'provider' | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showVerifyDialog, setShowVerifyDialog] = useState(false)

  const handleRoleSelect = (selectedRole: 'patient' | 'provider') => {
    setRole(selectedRole)
    setStep('account')
  }

  const handleAccountSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const formData = new FormData(event.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    // Client-side validation: check if passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please try again.')
      return
    }

    // Client-side validation: check password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    // Store account info temporarily and move to profile step
    sessionStorage.setItem('register_email', email)
    sessionStorage.setItem('register_password', password)
    setStep('profile')
  }

  const handleProfileSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const email = sessionStorage.getItem('register_email')
    const password = sessionStorage.getItem('register_password')

    if (!email || !password || !role) {
      setError('Missing registration information. Please start over.')
      setIsLoading(false)
      return
    }

    const formData = new FormData(event.currentTarget)
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const phoneNum = formData.get('phoneNum') as string
    const gender = formData.get('gender') as string
    const state = formData.get('state') as string
    const city = formData.get('city') as string
    const insurance = formData.get('insurance') as string

    const registrationData: Record<string, string> = {
      email,
      password,
      firstName,
      lastName,
      role,
      phoneNum,
      gender,
      state,
      city,
      insurance,
    }

    // Add provider-specific fields
    if (role === 'provider') {
      registrationData.location = formData.get('location') as string
      registrationData.taxonomy = formData.get('taxonomy') as string
      registrationData.providerEmail = formData.get('providerEmail') as string
    }

    try {
      const response = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Registration failed. Please try again.')
      }

      // Clear temporary storage
      sessionStorage.removeItem('register_email')
      sessionStorage.removeItem('register_password')
      // Instead of auto-logging in, prompt the user to confirm their email
      setShowVerifyDialog(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthBackground>
      <div className="w-full max-w-md rounded-2xl bg-white/90 shadow-xl backdrop-blur px-8 py-10 register-card">
        {/* Step 1: Role Selection */}
        {step === 'role' && (
          <>
            <h1 className="text-2xl font-semibold text-slate-900">Get Started</h1>
            <p className="mt-2 text-sm text-slate-600">
              Are you a patient looking for care, or a provider offering services?
            </p>
            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={() => handleRoleSelect('patient')}
                className="w-full p-4 text-left rounded-lg border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <div className="font-semibold text-slate-900">I'm a Patient</div>
                <div className="text-sm text-slate-600 mt-1">Looking for healthcare providers</div>
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect('provider')}
                className="w-full p-4 text-left rounded-lg border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <div className="font-semibold text-slate-900">I'm a Provider</div>
                <div className="text-sm text-slate-600 mt-1">Offering healthcare services</div>
              </button>
            </div>
          </>
        )}

        {/* Step 2: Account Information */}
        {step === 'account' && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <button
                type="button"
                onClick={() => setStep('role')}
                className="text-slate-400 hover:text-slate-600"
              >
                ← Back
              </button>
              <span className="text-sm text-slate-500">Step 1 of 2</span>
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">Create Account</h1>
            <p className="mt-2 text-sm text-slate-600">
              Create your {role === 'patient' ? 'patient' : 'provider'} account
            </p>
            <form onSubmit={handleAccountSubmit} className="mt-6 space-y-4">
              {error && (
                <div className="rounded-md bg-red-50 border border-red-200 p-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Create a strong password (min. 6 characters)"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={6}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Repeat your password"
                />
              </div>
              <button
                type="submit"
                className="mt-2 w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Continue
              </button>
            </form>
          </>
        )}

        {/* Step 3: Profile Information */}
        {step === 'profile' && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <button
                type="button"
                onClick={() => setStep('account')}
                className="text-slate-400 hover:text-slate-600"
              >
                ← Back
              </button>
              <span className="text-sm text-slate-500">Step 2 of 2</span>
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">Profile Information</h1>
            <p className="mt-2 text-sm text-slate-600">
              Tell us a bit about yourself
            </p>
            <form onSubmit={handleProfileSubmit} className="mt-6 space-y-4">
              {error && (
                <div className="rounded-md bg-red-50 border border-red-200 p-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-slate-700">
                    First name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    disabled={isLoading}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-slate-700">
                    Last name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    disabled={isLoading}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="phoneNum" className="block text-sm font-medium text-slate-700">
                  Phone Number
                </label>
                <input
                  id="phoneNum"
                  name="phoneNum"
                  type="tel"
                  disabled={isLoading}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-slate-700">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  disabled={isLoading}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-slate-700">
                    State
                  </label>
                  <input
                    id="state"
                    name="state"
                    type="text"
                    maxLength={2}
                    disabled={isLoading}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                    placeholder="CA"
                  />
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-slate-700">
                    City
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    disabled={isLoading}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                    placeholder="Los Angeles"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="insurance" className="block text-sm font-medium text-slate-700">
                  Insurance
                </label>
                <input
                  id="insurance"
                  name="insurance"
                  type="text"
                  disabled={isLoading}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                  placeholder="e.g., Blue Cross, Aetna"
                />
              </div>
              {role === 'provider' && (
                <>
                  <div>
                    <label htmlFor="providerEmail" className="block text-sm font-medium text-slate-700">
                      Provider Email
                    </label>
                    <input
                      id="providerEmail"
                      name="providerEmail"
                      type="email"
                      disabled={isLoading}
                      className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                      placeholder="provider@example.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-slate-700">
                      Location
                    </label>
                    <input
                      id="location"
                      name="location"
                      type="text"
                      disabled={isLoading}
                      className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                      placeholder="Full address or location"
                    />
                  </div>
                  <div>
                    <label htmlFor="taxonomy" className="block text-sm font-medium text-slate-700">
                      Taxonomy / Specialty
                    </label>
                    <input
                      id="taxonomy"
                      name="taxonomy"
                      type="text"
                      disabled={isLoading}
                      className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                      placeholder="e.g., Internal Medicine, Cardiology"
                    />
                  </div>
                </>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating account...' : 'Create account'}
              </button>
            </form>
            <p className="mt-4 text-center text-sm text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">
                Log in
              </Link>
            </p>
          </>
        )}
      </div>

      {/* Post-registration email verification dialog */}
      {showVerifyDialog && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-6">
            <h2 className="text-xl font-semibold text-slate-900">Confirm your email</h2>
            <p className="mt-3 text-sm text-slate-600">
              We&apos;ve sent a verification link to your email address. Please click the link in that
              email to activate your MediData account. Once verified, you can log in with your email and
              password.
            </p>
            <p className="mt-2 text-xs text-slate-500">
              If you don&apos;t see the email, check your spam folder or try resending from the login
              page.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowVerifyDialog(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Go to login
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthBackground>
  )
}

/**
 * ResetPasswordPage - Handles completing the Supabase password reset flow
 * 
 * Supabase sends users here via a link like:
 *   http://localhost:5173/reset-password#access_token=...&type=recovery&...
 * 
 * This page:
 * - Extracts the `access_token` and ensures `type=recovery`
 * - Prompts the user for a new password and confirmation
 * - Calls the FastAPI backend (/api/auth/reset-password) to update the password
 * - Redirects the user back to the login page on success
 */
function ResetPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Parse recovery token from URL hash when the page loads
  useEffect(() => {
    const hash = window.location.hash || ''
    const params = new URLSearchParams(hash.replace(/^#/, ''))
    const type = params.get('type')
    const token = params.get('access_token')

    if (type === 'recovery' && token) {
      setAccessToken(token)
    } else {
      setError('Invalid or missing password reset token. Please request a new reset link.')
    }
  }, [location])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!accessToken) {
      setError('Password reset token is missing or invalid. Please request a new reset link.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please try again.')
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: accessToken,
          new_password: newPassword,
        }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to reset password. Please request a new link and try again.')
      }

      setSuccess('Your password has been reset successfully. You can now log in with your new password.')
      // Optionally clear token from hash so it can't be reused from UI perspective
      window.history.replaceState(null, '', window.location.pathname)

      setTimeout(() => {
        navigate('/login')
      }, 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred while resetting your password.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthBackground>
      <div className="w-full max-w-md rounded-2xl bg-white/90 shadow-xl backdrop-blur px-8 py-10">
        <h1 className="text-2xl font-semibold text-slate-900">Reset your password</h1>
        <p className="mt-2 text-sm text-slate-600">
          Choose a new password for your MediData account.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          {success && (
            <div className="rounded-md bg-green-50 border border-green-200 p-3">
              <p className="text-sm text-green-800">{success}</p>
            </div>
          )}

          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-slate-700">
              New password
            </label>
            <input
              id="new-password"
              name="new-password"
              type="password"
              required
              minLength={6}
              disabled={isSubmitting || !accessToken}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
              placeholder="Enter a new password"
            />
          </div>
          <div>
            <label htmlFor="confirm-new-password" className="block text-sm font-medium text-slate-700">
              Confirm new password
            </label>
            <input
              id="confirm-new-password"
              name="confirm-new-password"
              type="password"
              required
              minLength={6}
              disabled={isSubmitting || !accessToken}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
              placeholder="Re-enter your new password"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !accessToken}
            className="mt-2 w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Resetting password...' : 'Reset password'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600">
          Remembered your password?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">
            Back to login
          </Link>
        </p>
      </div>
    </AuthBackground>
  )
}
