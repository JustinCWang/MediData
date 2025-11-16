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

import { Link, NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Chatbot from './components/Chatbot'
import AuthBackground from './components/AuthBackground'
import FeatureCard from './components/FeatureCard'
import SearchPage from './pages/SearchPage'
import RequestsPage from './pages/RequestsPage'
import RequestProviderPage from './pages/RequestProviderPage'

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
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/requests" element={<RequestsPage />} />
          <Route path="/request-provider" element={<RequestProviderPage />} />
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
        <Link to="/" className="inline-flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight">MediData</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `hover:text-slate-600 ${isActive ? 'text-slate-900 font-semibold' : 'text-slate-600'}`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/search"
            className={({ isActive }) =>
              `hover:text-slate-600 ${isActive ? 'text-slate-900 font-semibold' : 'text-slate-600'}`
            }
          >
            Search
          </NavLink>
          <NavLink
            to="/requests"
            className={({ isActive }) =>
              `hover:text-slate-600 ${isActive ? 'text-slate-900 font-semibold' : 'text-slate-600'}`
            }
          >
            Requests
          </NavLink>
          <NavLink
            to="/request-provider"
            className={({ isActive }) =>
              `hover:text-slate-600 ${isActive ? 'text-slate-900 font-semibold' : 'text-slate-600'}`
            }
          >
            Request Provider
          </NavLink>
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
  const [isAuthenticated, setIsAuthenticated] = useState(false)

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
              {!isAuthenticated && (
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
              )}
              {isAuthenticated && (
                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/search"
                    className="inline-flex items-center justify-center rounded-md bg-blue-600 px-5 py-3 text-white font-medium shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Search Providers
                  </Link>
                  <Link
                    to="/request-provider"
                    className="inline-flex items-center justify-center rounded-md border border-slate-300 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Request a Provider
                  </Link>
                </div>
              )}
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
              description="Profiles include credentials, ratings, availability, and accepted insurance."
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

    const formData = new FormData(event.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle error response from backend
        throw new Error(data.detail || 'Login failed. Please try again.')
      }

      // Store access token in localStorage (you may want to use httpOnly cookies in production)
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token)
        localStorage.setItem('user', JSON.stringify(data.user))
        // Dispatch custom event to notify header of auth change
        window.dispatchEvent(new Event('auth-change'))
      }

      // Redirect to home page on success
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.')
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
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
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
 * RegisterPage - New user registration page
 * 
 * Displays a registration form with fields for:
 * - First name and last name
 * - Email address
 * - Password and password confirmation
 * 
 * Validates password match and length client-side, then sends registration data
 * to FastAPI backend (/api/auth/register), which creates the user account in Supabase.
 * On success, stores the access token in localStorage and redirects to the home page.
 * Displays error messages if registration fails (e.g., email already exists).
 * 
 * Uses AuthBackground component for consistent styling with login page.
 */
function RegisterPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * handleSubmit - Handles registration form submission
   * 
   * Validates password match, then sends registration data to FastAPI backend,
   * which creates the user account in Supabase. On success, stores the access
   * token and redirects to home page. On error, displays error message to user.
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    // Client-side validation: check if passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please try again.')
      setIsLoading(false)
      return
    }

    // Client-side validation: check password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, firstName, lastName }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle error response from backend
        throw new Error(data.detail || 'Registration failed. Please try again.')
      }

      // Store access token in localStorage (you may want to use httpOnly cookies in production)
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token)
        localStorage.setItem('user', JSON.stringify(data.user))
        // Dispatch custom event to notify header of auth change
        window.dispatchEvent(new Event('auth-change'))
      }

      // Redirect to home page on success
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthBackground>
      <div className="w-full max-w-md rounded-2xl bg-white/90 shadow-xl backdrop-blur px-8 py-10">
        <h1 className="text-2xl font-semibold text-slate-900">Create your MediData account</h1>
        <p className="mt-2 text-sm text-slate-600">
          Tell us a bit about yourself to get more personalized provider matches.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
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
              minLength={6}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
              placeholder="Create a strong password (min. 6 characters)"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              disabled={isLoading}
              minLength={6}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
              placeholder="Repeat your password"
            />
          </div>
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
      </div>
    </AuthBackground>
  )
}

