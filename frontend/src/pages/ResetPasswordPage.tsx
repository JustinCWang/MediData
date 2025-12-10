/**
 * ResetPasswordPage.tsx - Password recovery completion
 *
 * Accepts Supabase recovery tokens from the URL, validates them, lets users set a new password, and routes back to login after success.
 */
import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthBackground from '../components/AuthBackground'
import { API_BASE_URL } from '../config'

export default function ResetPasswordPage() {
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
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
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
      <div className="w-full max-w-md rounded-2xl bg-white/90 shadow-xl backdrop-blur px-8 py-10 border border-white/70 dark:bg-slate-900/90 dark:border-slate-700">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Reset your password</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
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
            <label htmlFor="new-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
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
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
              placeholder="Enter a new password"
            />
          </div>
          <div>
            <label htmlFor="confirm-new-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
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
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
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

        <p className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
          Remembered your password?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">
            Back to login
          </Link>
        </p>
      </div>
    </AuthBackground>
  )
}
