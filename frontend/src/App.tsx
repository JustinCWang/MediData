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
 *   - "/dashboard" - User dashboard page
 *   - "/provider/:provider_id" - Provider details page
 */

import { Link, NavLink, Route, Routes, useNavigate, Navigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Chatbot from './components/Chatbot'
import AuthBackground from './components/AuthBackground'
import FeatureCard from './components/FeatureCard'
import SearchPage from './pages/SearchPage'
import RequestsPage from './pages/RequestsPage'
import RequestProviderPage from './pages/RequestProviderPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import ProviderDetailsPage from './pages/ProviderDetailsPage';

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
export default function App() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <AppHeader />
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
          <Route path="/provider/:provider_id" element={<ProtectedRoute><ProviderDetailsPage /></ProtectedRoute>} />
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

function AppHeader() {
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  // Check authentication status on mount and when localStorage changes
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('access_token')
      const userData = localStorage.getItem('user')
      setIsAuthenticated(!!token)
      setUser(userData ? JSON.parse(userData) : null)
    }

    checkAuth()
    
    // Listen for storage changes (e.g., login/logout in another tab)
    window.addEventListener('storage', checkAuth)
    
    // Custom event for same-tab auth changes
    window.addEventListener('auth-change', checkAuth)
    
    return () => {
      window.removeEventListener('storage', checkAuth)
      window.removeEventListener('auth-change', checkAuth)
    }
  }, [])

  const handleLogout = () => {
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
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        <Link to={isAuthenticated ? "/dashboard" : "/"} className="inline-flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight">MediData</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {isAuthenticated ? (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `hover:text-slate-600 ${isActive ? 'text-slate-900 font-semibold' : 'text-slate-600'}`
                }
              >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-3 w-4 h-4 inline-block mr-1">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z" />
              </svg>

                Dashboard
              </NavLink>
              <NavLink
                to="/search"
                className={({ isActive }) =>
                  `hover:text-slate-600 ${isActive ? 'text-slate-900 font-semibold' : 'text-slate-600'}`
                }
              >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-3 w-4 h-4 inline-block mr-1">
                <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>

                Search
              </NavLink>
              <NavLink
                to="/requests"
                className={({ isActive }) =>
                  `hover:text-slate-600 ${isActive ? 'text-slate-900 font-semibold' : 'text-slate-600'}`
                }
              >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-3 w-4 h-4 inline-block mr-1">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>

                Requests
              </NavLink>
              <NavLink
                to="/request-provider"
                className={({ isActive }) =>
                  `hover:text-slate-600 ${isActive ? 'text-slate-900 font-semibold' : 'text-slate-600'}`
                }
              >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-3 w-4 h-4 inline-block mr-1">
               <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
              </svg>

                Request Provider
              </NavLink>
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `hover:text-slate-600 ${isActive ? 'text-slate-900 font-semibold' : 'text-slate-600'}`
                }
              >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-3 w-4 h-4 inline-block mr-1">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>

                Profile
              </NavLink>
            </>
          ) : (
            <>
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `hover:text-slate-600 ${isActive ? 'text-slate-900 font-semibold' : 'text-slate-600'}`
                }
              >
                Home
              </NavLink>
            </>
          )}
        </nav>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="hidden sm:inline text-sm text-slate-600">
                {getUserDisplayName()}
              </span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white text-sm font-medium shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Get started
              </Link>
            </>
          )}
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
  return (
    <>
      {/* Hero Section - Main headline and primary CTAs */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Find the right provider, fast.
              </h1>
              <p className="mt-4 text-lg text-slate-600">
                MediData connects patients with the most suitable healthcare provider based on
                needs, availability, insurance, and outcomes—within minutes.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-md bg-blue-600 px-5 py-3 text-white font-medium shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Get started
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-md border border-slate-300 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50"
                >
                  I already have an account
                </Link>
              </div>
            </div>
            <div className="md:pl-6">
              <div className="aspect-4/3 w-full rounded-xl border border-slate-200 bg-linear-to-br from-blue-50 to-sky-50 p-6">
                <div className="h-full w-full rounded-lg border border-dashed border-slate-300 grid place-items-center text-slate-500 text-center text-sm">
                  Future: search, match results, and booking UI\n
                  <br />
                  For now, use the Login / Sign up buttons to access authentication screens.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Highlights three key platform benefits */}
      <section id="features" className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              title="Personalized matching"
              description="We match by condition, specialty, location, insurance, and provider outcomes."
            />
            <FeatureCard
              title="Verified providers"
              description="Profiles include verified credentials, availability, and accepted insurance."
            />
            <FeatureCard
              title="Fast and secure"
              description="HIPAA-conscious design with fast response times and secure data handling."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section - Explains the 3-step process for using MediData */}
      <section id="how-it-works">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <h2 className="text-2xl md:text-3xl font-semibold">How it works</h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            <li className="rounded-lg border border-slate-200 bg-white p-5">
              <span className="font-semibold">1. Tell us your needs</span>
              <p className="mt-2 text-slate-600">Symptoms, preferences, insurance, and location.</p>
            </li>
            <li className="rounded-lg border border-slate-200 bg-white p-5">
              <span className="font-semibold">2. Get matched</span>
              <p className="mt-2 text-slate-600">We surface top providers with real-time availability.</p>
            </li>
            <li className="rounded-lg border border-slate-200 bg-white p-5">
              <span className="font-semibold">3. Book in minutes</span>
              <p className="mt-2 text-slate-600">Schedule directly and manage follow-ups seamlessly.</p>
            </li>
          </ol>
        </div>
      </section>
    </>
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
    <AuthBackground>
      <div className="w-full max-w-md rounded-2xl bg-white/90 shadow-xl backdrop-blur px-8 py-10">
        <h1 className="text-2xl font-semibold text-slate-900">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-600">
          Log in to continue finding your best-fit providers with MediData.
        </p>
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
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
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
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
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
        <p className="mt-4 text-center text-sm text-slate-600">
          New to MediData?{' '}
          <Link to="/register" className="font-medium text-blue-600 hover:text-blue-700">
            Create an account
          </Link>
        </p>
      </div>
    </AuthBackground>
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
      <div className="w-full max-w-md rounded-2xl bg-white/90 shadow-xl backdrop-blur px-8 py-10">
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

