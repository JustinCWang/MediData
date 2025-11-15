/**
 * App.tsx - Main Application Component
 * 
 * This is the root component of the MediData frontend application. It handles:
 * - Client-side routing using React Router (landing, login, registration pages)
 * - Shared layout components (header and footer)
 * - Page components for each route
 * 
 * Routes:
 *   - "/" - Landing page with hero, features, and how-it-works sections
 *   - "/login" - User authentication/login page
 *   - "/register" - New user registration page
 */

import { Link, NavLink, Route, Routes } from 'react-router-dom'

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
        </Routes>
      </main>
      <AppFooter />
    </div>
  )
}

/**
 * AppHeader - Shared navigation header component
 * 
 * Displays the MediData logo, navigation links, and action buttons (Login/Get started).
 * Sticky header that stays visible when scrolling. Uses NavLink for active state styling.
 */
function AppHeader() {
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
            to="/login"
            className={({ isActive }) =>
              `hover:text-slate-600 ${isActive ? 'text-slate-900 font-semibold' : 'text-slate-600'}`
            }
          >
            Login
          </NavLink>
          <NavLink
            to="/register"
            className={({ isActive }) =>
              `hover:text-slate-600 ${isActive ? 'text-slate-900 font-semibold' : 'text-slate-600'}`
            }
          >
            Sign up
          </NavLink>
        </nav>
        <div className="flex items-center gap-2">
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
              <div className="aspect-[4/3] w-full rounded-xl border border-slate-200 bg-gradient-to-br from-blue-50 to-sky-50 p-6">
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
 * Displays a login form with email and password fields. Currently handles
 * form submission client-side only (logs to console). Will be connected to
 * FastAPI authentication endpoint when backend is implemented.
 * 
 * Uses AuthBackground component for consistent styling with registration page.
 */
function LoginPage() {
  /**
   * handleSubmit - Handles login form submission
   * 
   * Prevents default form submission and logs to console.
   * TODO: Replace with actual API call to FastAPI /api/auth/login endpoint
   */
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    // TODO: hook up to FastAPI auth endpoint when backend is ready
    console.log('Login submitted')
  }

  return (
    <AuthBackground>
      <div className="w-full max-w-md rounded-2xl bg-white/90 shadow-xl backdrop-blur px-8 py-10">
        <h1 className="text-2xl font-semibold text-slate-900">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-600">
          Log in to continue finding your best-fit providers with MediData.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="mt-2 w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Log in
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
 * Currently handles form submission client-side only (logs to console).
 * Will be connected to FastAPI registration endpoint when backend is implemented.
 * 
 * Uses AuthBackground component for consistent styling with login page.
 */
function RegisterPage() {
  /**
   * handleSubmit - Handles registration form submission
   * 
   * Prevents default form submission and logs to console.
   * TODO: Replace with actual API call to FastAPI /api/auth/register endpoint
   * TODO: Add client-side validation (password match, email format, etc.)
   */
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    // TODO: hook up to FastAPI registration endpoint when backend is ready
    console.log('Registration submitted')
  }

  return (
    <AuthBackground>
      <div className="w-full max-w-md rounded-2xl bg-white/90 shadow-xl backdrop-blur px-8 py-10">
        <h1 className="text-2xl font-semibold text-slate-900">Create your MediData account</h1>
        <p className="mt-2 text-sm text-slate-600">
          Tell us a bit about yourself to get more personalized provider matches.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Create a strong password"
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
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Repeat your password"
            />
          </div>
          <button
            type="submit"
            className="mt-2 w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Create account
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

/**
 * AuthBackground - Reusable background wrapper for authentication pages
 * 
 * Provides a consistent full-screen background using the MediData background image
 * with overlay effects for better text readability. Used by both LoginPage and
 * RegisterPage components.
 * 
 * Features:
 * - Full-screen background image from public folder
 * - Dark overlay (60% opacity) for contrast
 * - Gradient overlay for visual depth
 * - Centered content area for form cards
 * 
 * @param children - React nodes to render in the centered content area (typically form cards)
 */
function AuthBackground({ children }: { children: React.ReactNode }) {
  return (
    <section
      className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10"
      style={{ backgroundImage: "url('/MediData Background.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      {/* Dark overlay for better text contrast */}
      <div className="absolute inset-0 bg-slate-900/60" />
      {/* Gradient overlay for visual depth */}
      <div className="absolute inset-0 bg-linear-to-br from-blue-500/30 via-sky-500/10 to-emerald-400/20" />
      {/* Content container - centered and above overlays */}
      <div className="relative z-10 w-full flex flex-col items-center">
        {children}
      </div>
    </section>
  )
}

/**
 * FeatureCard - Reusable card component for displaying feature highlights
 * 
 * Used in the Features section of the landing page to display key platform benefits.
 * Each card shows a title and description in a clean, consistent layout.
 * 
 * @param title - The feature title/heading
 * @param description - The feature description text
 */
function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-slate-600">{description}</p>
    </div>
  )
}
