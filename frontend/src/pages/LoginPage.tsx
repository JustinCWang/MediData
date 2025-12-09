/**
 * LoginPage.tsx - User authentication page
 *
 * Presents the login form, submits credentials to the backend, handles auth state updates, and offers password/verification helpers.
 */
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../config'

export default function LoginPage() {
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
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
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

      // Redirect based on role on success
      const userRole = data?.user?.user_metadata?.role === 'provider' ? 'provider' : 'patient'
      navigate(userRole === 'provider' ? '/requests' : '/dashboard')
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
      const response = await fetch(`${API_BASE_URL}/api/auth/resend-verification`, {
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
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
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
        <div className="w-full max-w-md rounded-2xl bg-white/80 shadow-xl backdrop-blur px-8 py-10 border border-white/70 dark:bg-slate-900/90 dark:border-slate-700">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Log in to MediData</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
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
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
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
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                disabled={isLoading}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
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

