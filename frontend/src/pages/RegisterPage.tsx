/**
 * RegisterPage.tsx - Multi-step registration flow
 *
 * Guides new users through role selection, account creation, and profile details, then posts data to the backend and prompts email verification.
 */
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../config'

export default function RegisterPage() {
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
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      })

      const data = await response.json()

      if (!response.ok) {
        const detail = typeof data.detail === 'string'
          ? data.detail
          : (data.message as string | undefined);

        if (response.status === 409) {
          // Force a clear, user-focused duplicate-account message
          throw new Error(
            detail ||
            'An account with this email already exists. Please log in instead.'
          );
        }

        throw new Error(detail || 'Registration failed. Please try again.');
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
        <div className="w-full max-w-md rounded-2xl bg-white/90 shadow-xl backdrop-blur px-8 py-10 register-card border border-white/70 dark:bg-slate-900/90 dark:border-slate-700">
          {/* Step 1: Role Selection */}
          {step === 'role' && (
            <>
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Get Started</h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Are you a patient looking for care, or a provider offering services?
              </p>
              <div className="mt-6 space-y-3">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('patient')}
                  className="w-full p-4 text-left rounded-lg border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-colors dark:border-slate-700 dark:hover:bg-blue-900/20 dark:hover:border-blue-500"
                >
                  <div className="font-semibold text-slate-900 dark:text-slate-100">I'm a Patient</div>
                  <div className="text-sm text-slate-600 mt-1 dark:text-slate-400">Looking for healthcare providers</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSelect('provider')}
                  className="w-full p-4 text-left rounded-lg border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-colors dark:border-slate-700 dark:hover:bg-blue-900/20 dark:hover:border-blue-500"
                >
                  <div className="font-semibold text-slate-900 dark:text-slate-100">I'm a Provider</div>
                  <div className="text-sm text-slate-600 mt-1 dark:text-slate-400">Offering healthcare services</div>
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
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Create Account</h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Create your {role === 'patient' ? 'patient' : 'provider'} account
              </p>
              <form onSubmit={handleAccountSubmit} className="mt-6 space-y-4">
                {error && (
                  <div className="rounded-md bg-red-50 border border-red-200 p-3">
                    <p className="text-sm text-red-800">{error}</p>
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
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
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
                    minLength={6}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
                    placeholder="Create a strong password (min. 6 characters)"
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    minLength={6}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
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
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Profile Information</h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
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
                    <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      First name
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      disabled={isLoading}
                      className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Last name
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      disabled={isLoading}
                      className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="phoneNum" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Phone Number
                  </label>
                  <input
                    id="phoneNum"
                    name="phoneNum"
                    type="tel"
                    disabled={isLoading}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    disabled={isLoading}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
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
                      className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
                      placeholder="CA"
                    />
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      City
                    </label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      disabled={isLoading}
                      className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
                      placeholder="Los Angeles"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="insurance" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Insurance
                  </label>
                  <input
                    id="insurance"
                    name="insurance"
                    type="text"
                    disabled={isLoading}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
                    placeholder="e.g., Blue Cross, Aetna"
                  />
                </div>
                {role === 'provider' && (
                  <>
                    <div>
                      <label htmlFor="providerEmail" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Provider Email
                      </label>
                      <input
                        id="providerEmail"
                        name="providerEmail"
                        type="email"
                        disabled={isLoading}
                        className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
                        placeholder="provider@example.com"
                      />
                    </div>
                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Location
                      </label>
                      <input
                        id="location"
                        name="location"
                        type="text"
                        disabled={isLoading}
                        className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
                        placeholder="Full address or location"
                      />
                    </div>
                    <div>
                      <label htmlFor="taxonomy" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Taxonomy / Specialty
                      </label>
                      <input
                        id="taxonomy"
                        name="taxonomy"
                        type="text"
                        disabled={isLoading}
                        className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
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
    </section>
  )
}

