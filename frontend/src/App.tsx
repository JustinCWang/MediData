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

import { Link, NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Chatbot from './components/Chatbot'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import SearchPage from './pages/SearchPage'
import RequestsPage from './pages/RequestsPage'
import RequestProviderPage from './pages/RequestProviderPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import ProviderDetailsPage from './pages/ProviderDetailsPage'
import TermsofUse from './pages/Terms'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import PrivacyPage from './pages/Privacy'
import React from 'react'

type Theme = 'light' | 'dark'

function SunIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2.75v2.2M12 19.05v2.2M4.75 12h-2.2M21.45 12h-2.2M6.4 6.4l-1.56-1.56M19.16 19.16l-1.56-1.56M6.4 17.6l-1.56 1.56M19.16 4.84l-1.56 1.56" />
    </svg>
  )
}

function MoonIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  )
}

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
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light'
    const stored = localStorage.getItem('theme') as Theme | null
    if (stored === 'light' || stored === 'dark') return stored
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    return prefersDark ? 'dark' : 'light'
  })

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)

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

  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = theme
    root.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'))

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors">
      <AppHeader theme={theme} onToggleTheme={toggleTheme} />
      <main>
        <Routes>
          <Route path="/" element={<GuestRoute><LandingPage theme={theme} /></GuestRoute>} />
          <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
          <Route path="/reset-password" element={<GuestRoute><ResetPasswordPage /></GuestRoute>} />
          <Route path="/terms" element={<TermsofUse />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
          <Route path="/provider/:id" element={<ProtectedRoute><ProviderDetailsPage /></ProtectedRoute>} />
          <Route path="/requests" element={<ProtectedRoute><RequestsPage /></ProtectedRoute>} />
          <Route path="/request-provider" element={<ProtectedRoute><RequestProviderPage /></ProtectedRoute>} />
          <Route path="/providers/:id" element={<ProtectedRoute><ProviderDetailsPage /></ProtectedRoute>} />
        </Routes>
      </main>
      <AppFooter />
      {isAuthenticated && <Chatbot theme={theme} />}
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
    email?: string
    avatar?: string
  }
}

function AppHeader({ theme, onToggleTheme }: { theme: Theme; onToggleTheme: () => void }) {
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [avatar, setAvatar] = useState<string | null>(null)

  const avatarKeyForUser = (u: User | null) => {
    if (!u) return null
    const email = u.email || u.user_metadata?.email
    if (email) return `avatar_${email}`
    return u.id ? `avatar_${u.id}` : null
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

  const headerThemeClasses =
    theme === 'dark'
      ? 'bg-slate-900/80 border-slate-800 text-slate-100'
      : 'bg-white/80 border-slate-200 text-slate-700'

  const navItems = isAuthenticated
    ? [
      { to: '/dashboard', label: 'Dashboard' },
      { to: '/search', label: 'Search' },
      { to: '/requests', label: 'Requests' },
      { to: '/request-provider', label: 'Request Provider' },
      { to: '/profile', label: 'Profile' },
    ]
    : []

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-1.5 rounded-full font-medium transition-colors ${isActive
      ? theme === 'dark'
        ? 'bg-slate-800 text-white border border-slate-700'
        : 'bg-slate-900 text-white border border-slate-900'
      : theme === 'dark'
        ? 'text-slate-200 hover:text-white hover:bg-slate-800/70'
        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
    }`

  return (
    <header className={`sticky top-0 z-30 border-b backdrop-blur-xl transition-all duration-300 ${headerThemeClasses}`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="inline-flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-600 via-blue-600 to-emerald-500">
            MediData
          </span>
        </Link>

        <nav className="hidden flex-1 items-center justify-end gap-2 text-sm md:flex">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <span className="hidden sm:inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 py-1 text-sm text-slate-700 backdrop-blur">
                <span className="h-7 w-7 rounded-full overflow-hidden bg-gradient-to-br from-sky-500 via-blue-500 to-emerald-400 flex items-center justify-center text-white text-xs font-semibold">
                  {avatar ? <img src={avatar} alt="avatar" className="h-full w-full object-cover" /> : getUserDisplayName().charAt(0).toUpperCase()}
                </span>
                {getUserDisplayName()}
              </span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center rounded-full border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-md hover:-translate-y-[1px] transition focus:outline-none focus:ring-2 focus:ring-slate-700 focus:ring-offset-2 focus:ring-offset-white"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`hidden sm:inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium transition ${theme === 'dark'
                  ? 'border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700/90'
                  : 'border-slate-200 bg-white/80 text-slate-700 hover:bg-white'
                  }`}
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center rounded-full bg-gradient-to-r from-sky-600 via-blue-600 to-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-md hover:-translate-y-[1px] transition focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2 focus:ring-offset-white"
              >
                Get started
              </Link>
            </>
          )}
          <button
            onClick={onToggleTheme}
            className={`inline-flex items-center justify-center rounded-full border p-2 transition ${theme === 'dark'
              ? 'border-slate-700 bg-slate-900 text-amber-200 hover:border-amber-300 hover:text-amber-100 hover:shadow-sm'
              : 'border-slate-200 bg-white/80 text-slate-800 hover:bg-white hover:shadow-sm'
              }`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </header>
  )
}

/**
 * AppFooter - Shared footer component
 * 
 * Displays copyright information and footer links to policy and info pages.
 * Appears at the bottom of all pages.
 */
function AppFooter() {
  return (
    <footer id="contact" className="border-t border-slate-200">
      <div className="mx-auto max-w-6xl px-5 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-slate-600">
        <p>(c) {new Date().getFullYear()} MediData. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <Link to="/privacy" className="hover:text-slate-800">
            Privacy
          </Link>
          <Link to="/terms" className="hover:text-slate-800">
            Terms
          </Link>
          <Link to="/about" className="hover:text-slate-800">
            About
          </Link>
          <Link to="/contact" className="hover:text-slate-800">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  )
}

